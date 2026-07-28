import { classifyForTransform, parserFilename, sourceHints } from '../adapters/classification.js';
import { selectParserAdapter } from '../adapters/registry.js';
import { compilePhasePlan, maxEditEffect } from '../pipeline/compile.js';
import { closeDefinitionScope } from '../pipeline/define.js';
import type { CompiledRouteTemplate, PreparedPhase } from '../pipeline/types.js';
import {
  compileNestedVisitor,
  ContractVerifier,
  mergeFieldRequests,
  nestedManifest,
  preparePhase,
} from '../pipeline/routes.js';
import { Bailout, createDispatcher } from './dispatch.js';
import {
  createTransformMetadata,
  performanceCounters,
  recordNativeCrossing,
  sampleProcessMemory,
} from './metadata.js';
import { locationOffset } from './path.js';
import type { IntentRegistration } from './fragments.js';
import { native, nativePreflightOptions } from '../native/binding.js';
import { decodeRoutedEnvelope, type RoutedEventBatch } from '../protocol/events.js';
import { packRouteManifest } from '../protocol/manifest.js';
import type {
  Diagnostic,
  EditCommand,
  NativeBailoutResult,
  NativeTransformResult,
  NativeVlqMap,
  TransformOptions,
  TransformResult,
  FunctionMap,
} from '../types.js';
import {
  NativePipeline,
  NativePlugin,
  TransformDecision,
  NativeTransformError,
} from '../contracts/visitor.js';
import { NativeTransformSession } from './session.js';

interface RetainedPlan {
  futureSubscriptions: ReadonlySet<string>;
  futureRetentionCapabilities: number;
  retentionManifest: Buffer;
}

interface RetainedChainNode {
  children: WeakMap<PreparedPhase, RetainedChainNode>;
  plan?: RetainedPlan;
}

const retainedChainRoot: RetainedChainNode = { children: new WeakMap() };

/** Walk (and extend) the interned chain of prepared phase shapes. */
function retainedChains(
  shape: PreparedPhase,
  parent: RetainedChainNode = retainedChainRoot,
): RetainedChainNode {
  let node = parent.children.get(shape);
  if (node == null) {
    node = { children: new WeakMap() };
    parent.children.set(shape, node);
  }
  return node;
}

function buildRetainedPlan(
  prepared: PreparedPhase,
  lookahead: readonly PreparedPhase[],
): RetainedPlan {
  const futureSubscriptions = new Set<string>();
  const structuralParentTypes = new Set<string>();
  const retainedFields: Record<string, string[]> = {};
  const retainedRoutes: CompiledRouteTemplate[] = [...prepared.compiledRoutes];
  let futureRetentionCapabilities = 0;
  const collect = (phase: PreparedPhase) => {
    for (const plugin of phase.activePlugins) {
      const plan = phase.plans.get(plugin);
      for (const type of Object.keys(plan?.children ?? {})) structuralParentTypes.add(type);
      mergeFieldRequests(retainedFields, plan?.fields ?? {});
    }
  };
  collect(prepared);
  for (const future of lookahead) {
    for (const subscription of future.subscriptions) futureSubscriptions.add(subscription);
    retainedRoutes.push(...future.compiledRoutes);
    futureRetentionCapabilities |= future.retentionCapabilities;
    collect(future);
  }
  return {
    futureSubscriptions,
    futureRetentionCapabilities,
    retentionManifest: packRouteManifest(
      retainedRoutes.map((route, id) => ({ ...route, id })),
      prepared.includeParent,
      prepared.includeScope,
      prepared.retentionCapabilities | futureRetentionCapabilities,
      [...structuralParentTypes],
      retainedFields,
    ),
  };
}

/**
 * What the native Flow erasure did with a file, reported under
 * `debugPerformance` so the erase/bail split is a number per bundle.
 */
interface FlowErasureOutcome {
  status: 'erased' | 'bailed' | 'unsupported';
  reason?: string;
  detail?: string;
  erasedBytes: number;
  spanCount: number;
}

/** Execute a native pipeline synchronously. */
export function transform(
  source: string,
  filename: string,
  pipeline: NativePipeline,
  options: TransformOptions = {},
): TransformResult {
  // Any pipeline reaching a transform was defined before it, so this is where
  // program configuration stops and per-file discovery begins.
  closeDefinitionScope();
  const overallStarted = options.debugPerformance ? performance.now() : 0;
  const originalSource = source;
  let parseFilename = parserFilename(filename, options.parser);
  let parser = classifyForTransform(parseFilename, source);
  let adapterMap: NativeVlqMap | null = null;
  let adapterMetadata: Record<string, unknown> | undefined;
  let flowErasure: FlowErasureOutcome | undefined;
  // Native erasure runs ahead of the auto-selected adapter. It deletes byte
  // ranges instead of reprinting, so the file keeps its formatting and the map
  // it produces is deletion-only. The adapter stays the fallback for proposal
  // syntax, for a file this Hermes cannot parse, and for a binary built
  // without the `flow_parser` feature.
  //
  // An adapter the caller names by hand wins outright: naming one is how a
  // caller pins which implementation runs, and silently overriding that would
  // make the option meaningless.
  if (!parser.supported && parser.syntax === 'flow' && options.parserAdapter == null) {
    const erased = native.nativeFlowErase(source, filename);
    flowErasure = {
      status: erased.status,
      reason: erased.reason,
      detail: erased.detail,
      erasedBytes: erased.erasedBytes,
      spanCount: erased.spanCount,
    };
    if (erased.status === 'erased' && erased.code != null) {
      source = erased.code;
      adapterMap = erased.map ?? null;
      // Flow files routinely contain JSX, and the erased source still carries
      // its `@flow` comment, so the syntax has to be declared rather than
      // re-derived.
      parseFilename = parserFilename(filename, 'jsx');
      parser = classifyForTransform(parseFilename, source, 'jsx');
    }
  }
  if (!parser.supported) {
    const adapter = selectParserAdapter(options.parserAdapter, parser);
    if (adapter) {
      const adapted = adapter.compile(source, filename, options);
      if (adapted.status === 'unsupported')
        return {
          status: 'bailout',
          reason: adapted.reason,
          source: originalSource,
          diagnostics: adapted.diagnostics ?? [],
        };
      source = adapted.code;
      adapterMap = adapted.map;
      adapterMetadata = adapted.metadata;
      parseFilename = parserFilename(filename, adapted.syntax);
      // The adapter's declared output syntax is authoritative even when it
      // intentionally preserves an `@flow` comment in otherwise plain JS.
      parser = classifyForTransform(parseFilename, source, adapted.syntax);
    }
  }
  if (!parser.supported) {
    const prepared: { plugin: NativePlugin<any, any>; state: any }[] = [];
    try {
      for (const phase of pipeline.phases)
        for (const plugin of phase.plugins ?? []) {
          const prepareContext = {
            filename,
            options,
            parser,
            sourceHints: sourceHints(source),
            pluginData: options.pluginData,
          };
          prepared.push({ plugin, state: plugin.createState?.(prepareContext) });
        }
      for (const { plugin, state } of prepared) plugin.cleanup?.('bailout', state);
      return {
        status: 'bailout',
        reason: parser.reason,
        source,
        diagnostics: [],
        ...(flowErasure != null && options.debugPerformance ? { metadata: { flowErasure } } : {}),
      };
    } catch (error) {
      for (const { plugin, state } of prepared) plugin.cleanup?.('error', state);
      throw error;
    }
  }
  const transformStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlanStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlan = compilePhasePlan(pipeline);
  if (adapterMap != null && pipeline.phases.some(phase => phase.native?.reactCompiler != null)) {
    return {
      status: 'bailout',
      reason: 'react-compiler-original-source-required',
      source: originalSource,
      diagnostics: [],
    };
  }
  const phasePlanMs = options.debugPerformance ? performance.now() - phasePlanStarted : 0;
  let phaseSource = source;
  let inputMap = options.inputSourceMap ?? null;
  if (adapterMap != null) {
    inputMap =
      inputMap == null
        ? adapterMap
        : {
            mappings: native.composeMappings(
              adapterMap.mappings,
              inputMap.mappings,
              adapterMap.names.length,
            ),
            names: [...adapterMap.names, ...inputMap.names],
          };
  }
  let finalMap: NativeTransformResult['map'] | null = null;
  const metadata = createTransformMetadata(
    options.debugPerformance,
    phasePlan,
    Buffer.byteLength(source),
    phasePlanMs,
  );
  if (options.debugPerformance)
    performanceCounters(metadata).classificationMs = transformStarted - overallStarted;
  if (adapterMetadata != null) metadata.sourceAdapter = adapterMetadata;
  // The coverage counter the plan asks for: a regression after a Hermes or
  // React Native bump shows up as a rising bail rate rather than as a slowdown.
  if (flowErasure != null && options.debugPerformance) metadata.flowErasure = flowErasure;
  const diagnostics: Diagnostic[] = [];
  const intents = new Map<string, IntentRegistration>();
  const provenance = { degradations: 0 };
  const verifier = options.verifyVisitorContracts ? new ContractVerifier() : undefined;
  const allStates: { plugin: NativePlugin<any, any>; state: any }[] = [];
  // Committed phase mappings in packed decoded form, earliest phase first; the
  // chain composes and encodes once after the last phase.
  const mapLayers: Buffer[] = [];
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  let pendingEdits: EditCommand[] = [];
  let nativeFunctionMap: FunctionMap | null = null;
  const recordedParseCounts = new WeakMap<NativeTransformSession, number>();
  const recordedTraversalCounts = new WeakMap<NativeTransformSession, number>();
  try {
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const observationSource =
        phasePlan[phaseIndex].observes === 'original' ? originalSource : phaseSource;
      if (phase.native != null) {
        reusableSession?.close();
        reusableSession = null;
        reusableRoutedBatch = null;
        openSession = null;
        if (pendingEdits.length > 0)
          throw new Error(`${phase.name}: native phase received uncommitted visitor edits`);
        if (observationSource !== phaseSource)
          throw new Error(`${phase.name}: native phases must observe rendered source`);
        const nativeStarted = options.debugPerformance ? performance.now() : 0;
        const result = native.nativePreflightTransform(
          observationSource,
          parseFilename,
          nativePreflightOptions(phase.native, options.debugPerformance),
        );
        if (options.debugPerformance) {
          const elapsed = performance.now() - nativeStarted;
          performanceCounters(metadata).nativeTransformMs += elapsed;
          performanceCounters(metadata).nativeAndDecodeMs += elapsed;
          const performanceMetadata = metadata.performance as {
            nativeParses: number;
            nativeSemanticBuilds: number;
            nativeAstTraversals: number;
            nativeRenders: number;
            nativeParseMs: number;
            nativeSemanticBuildMs: number;
            nativeCustomRewriteMs: number;
            nativeOxcTransformMs: number;
            nativeOptimizationMs: number;
            nativeCodegenAndMapMs: number;
            nativeHelperDiscoveryMs: number;
            nativeHelperMaterializationMs: number;
            nativeCrossings: number;
            reparses: number;
            renderedBytes: number;
            mappingSegments: number;
            phaseExecutions: unknown[];
          };
          performanceMetadata.nativeParses += result.parseCount ?? 1;
          performanceMetadata.nativeSemanticBuilds += result.semanticBuildCount ?? 0;
          performanceMetadata.nativeAstTraversals += result.astTraversalCount ?? 0;
          performanceMetadata.nativeRenders += result.renderCount ?? 0;
          performanceMetadata.nativeParseMs += result.parseMs ?? 0;
          performanceMetadata.nativeSemanticBuildMs += result.semanticBuildMs ?? 0;
          performanceMetadata.nativeCustomRewriteMs += result.customRewriteMs ?? 0;
          performanceMetadata.nativeOxcTransformMs += result.oxcTransformMs ?? 0;
          performanceMetadata.nativeOptimizationMs += result.optimizationMs ?? 0;
          performanceMetadata.nativeCodegenAndMapMs += result.codegenAndMapMs ?? 0;
          performanceMetadata.nativeHelperDiscoveryMs += result.helperDiscoveryMs ?? 0;
          performanceMetadata.nativeHelperMaterializationMs += result.helperMaterializationMs ?? 0;
          recordNativeCrossing(metadata, 'preflight.transform');
          if (phaseIndex + 1 < pipeline.phases.length) performanceMetadata.reparses++;
          performanceMetadata.renderedBytes += Buffer.byteLength(result.code ?? '');
          performanceMetadata.mappingSegments += result.map ? decodedSegmentCount(result.map) : 0;
          performanceMetadata.phaseExecutions.push({
            name: phase.name,
            observes: phasePlan[phaseIndex].observes,
            editEffect: 'whole-program',
            source: 'rendered',
            reusedParse: false,
            render: result.status === 'complete' ? 'committed' : 'unchanged',
            nativeTransformMs: elapsed,
            nativeParses: result.parseCount ?? 1,
            nativeSemanticBuilds: result.semanticBuildCount ?? 0,
            nativeAstTraversals: result.astTraversalCount ?? 0,
            nativeRenders: result.renderCount ?? 0,
            nativeParseMs: result.parseMs ?? 0,
            nativeSemanticBuildMs: result.semanticBuildMs ?? 0,
            nativeCustomRewriteMs: result.customRewriteMs ?? 0,
            nativeOxcTransformMs: result.oxcTransformMs ?? 0,
            nativeOptimizationMs: result.optimizationMs ?? 0,
            nativeCodegenAndMapMs: result.codegenAndMapMs ?? 0,
            nativeHelperDiscoveryMs: result.helperDiscoveryMs ?? 0,
            nativeHelperMaterializationMs: result.helperMaterializationMs ?? 0,
          });
          sampleProcessMemory(metadata);
        }
        for (const message of result.diagnostics)
          diagnostics.push({
            code: result.status === 'unsupported' ? 'unsupported' : 'native-transform',
            message,
            phase: phase.name,
          });
        if (result.status === 'unsupported')
          throw new Bailout(`${phase.name}:${result.reason ?? 'unsupported'}`);
        if (result.code == null || result.map == null)
          throw new Error(`${phase.name}: native transform returned an incomplete result`);
        phaseSource = result.code;
        mapLayers.push(result.map);
        if (result.helpersUsed.length > 0)
          metadata.nativeHelpers = [
            ...((metadata.nativeHelpers as string[] | undefined) ?? []),
            ...result.helpersUsed,
          ];
        continue;
      }
      if (reusableSession && reusableSession.source !== observationSource) {
        reusableSession.close();
        reusableSession = null;
        reusableRoutedBatch = null;
      }
      const edits: EditCommand[] = [];
      const preparationStarted = options.debugPerformance ? performance.now() : 0;
      const prepared = preparePhase(phase);
      if (options.debugPerformance)
        performanceCounters(metadata).phasePreparationMs += performance.now() - preparationStarted;
      const {
        activePlugins,
        plans,
        subscriptions,
        includeParent,
        includeScope,
        compiledRoutes,
        dispatchRoutes,
        manifest,
      } = prepared;
      const runtimeEditEffect =
        phase.editEffect ??
        maxEditEffect(
          activePlugins.map(
            plugin => plans.get(plugin)?.editEffect ?? plugin.editEffect ?? 'whole-program',
          ),
        );
      const phaseExecution = options.debugPerformance
        ? {
            name: phase.name,
            observes: phasePlan[phaseIndex].observes,
            editEffect: runtimeEditEffect,
            source:
              observationSource === originalSource ? ('original' as const) : ('rendered' as const),
            reusedParse: false,
            render: 'pending' as 'pending' | 'unchanged' | 'deferred' | 'committed',
          }
        : undefined;
      if (phaseExecution) {
        const performance = metadata.performance as { phaseExecutions: unknown[] };
        performance.phaseExecutions.push(phaseExecution);
      }
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({
          code: 'broad-visitor',
          message: 'Catch-all visitor disables the optimized subscription path.',
          phase: phase.name,
        });
      }
      // The retained plan — future subscriptions, retention capabilities, and the
      // packed retention manifest — is a function of this phase's plan shape and
      // the shapes of the phases that observe the same source after it. Those
      // shapes are interned, so the whole derivation is cached on their identity
      // chain instead of being repacked for every file.
      const lookahead: PreparedPhase[] = [];
      let chain = retainedChains(prepared);
      for (let futureIndex = phaseIndex + 1; futureIndex < pipeline.phases.length; futureIndex++) {
        if (phasePlan[futureIndex].requiresPrintedInput) break;
        const futureObservationSource =
          phasePlan[futureIndex].observes === 'original' ? originalSource : observationSource;
        if (futureObservationSource !== observationSource) continue;
        const futurePrepared = preparePhase(pipeline.phases[futureIndex]);
        lookahead.push(futurePrepared);
        chain = retainedChains(futurePrepared, chain);
      }
      const retained = (chain.plan ??= buildRetainedPlan(prepared, lookahead));
      const { futureSubscriptions, retentionManifest } = retained;
      const requiresNativeQueries = activePlugins.some(
        plugin => (plans.get(plugin)?.queries?.length ?? 0) > 0,
      );
      const requiresStructuralIndex = activePlugins.some(
        plugin => Object.keys(plans.get(plugin)?.children ?? {}).length > 0,
      );
      const requiresRetainedInspection = activePlugins.some(plugin =>
        plans
          .get(plugin)
          ?.controlFlow?.some(
            capability =>
              capability === 'nested-traverse' || capability === 'dynamic-subscriptions',
          ),
      );
      const requiresIndex =
        requiresNativeQueries ||
        requiresStructuralIndex ||
        requiresRetainedInspection ||
        includeParent ||
        includeScope ||
        options.functionMap === true ||
        futureSubscriptions.size > 0;
      const retainedSession = reusableSession;
      const sessionStarted = options.debugPerformance ? performance.now() : 0;
      const session: NativeTransformSession =
        retainedSession ??
        new NativeTransformSession(
          observationSource,
          parseFilename,
          // `parseFilename` is already normalized, including an adapter's
          // authoritative JS/JSX output mode. Do not apply the caller's original
          // parser override a second time inside NativeTransformSession.
          { ...options, parser: 'auto' },
          requiresIndex ? retentionManifest : undefined,
          requiresIndex ? manifest : undefined,
          true,
          options.debugPerformance
            ? (operation, instrumentation) =>
                recordNativeCrossing(metadata, operation, instrumentation)
            : undefined,
        );
      if (options.debugPerformance)
        performanceCounters(metadata).sessionOpenMs += performance.now() - sessionStarted;
      if (options.debugPerformance) {
        const performance = performanceCounters(metadata);
        performance.nativeRetainedBytesPeak = Math.max(
          performance.nativeRetainedBytesPeak,
          session.nativeMemoryBytes,
        );
        sampleProcessMemory(metadata);
      }
      if (phaseExecution) phaseExecution.reusedParse = retainedSession != null;
      reusableSession = null;
      openSession = session;
      let batch: RoutedEventBatch;
      {
        const nativeStarted = options.debugPerformance ? performance.now() : 0;
        const cachedRouted = reusableRoutedBatch as {
          manifest: Buffer;
          batch: RoutedEventBatch;
        } | null;
        if (
          options.maxNativeMemoryBytes != null &&
          manifest.byteLength > options.maxNativeMemoryBytes
        )
          throw new Error('native-memory-budget-exceeded');
        if (cachedRouted?.manifest.equals(manifest)) {
          batch = cachedRouted.batch;
        } else {
          if (requiresIndex) {
            batch = session.nextRoutedPacked(manifest, undefined, false);
            if (
              options.maxNativeMemoryBytes != null &&
              session.nativeMemoryBytes + manifest.byteLength + batch.data.byteLength >
                options.maxNativeMemoryBytes
            )
              throw new Error('native-memory-budget-exceeded');
          } else {
            session.recordStatelessParse();
            if (options.debugPerformance) recordNativeCrossing(metadata, 'route.stateless');
            const routedBuffer = native.materializeRoutedBuffer(
              observationSource,
              parseFilename,
              manifest,
            );
            if (
              options.maxNativeMemoryBytes != null &&
              manifest.byteLength + routedBuffer.byteLength > options.maxNativeMemoryBytes
            )
              throw new Error('native-memory-budget-exceeded');
            batch = decodeRoutedEnvelope(routedBuffer);
          }
        }
        reusableRoutedBatch = null;
        if (options.debugPerformance)
          performanceCounters(metadata).nativeAndDecodeMs += performance.now() - nativeStarted;
      }
      if (options.debugPerformance) {
        const performance = metadata.performance as {
          javascriptBatches: number;
          routeDeliveries: number;
          nodeRecords: number;
          payloadBytes: number;
          recordWords: number;
          utf8SlabBytes: number;
        };
        performance.javascriptBatches++;
        performance.routeDeliveries += batch.routeDeliveryCount;
        performance.nodeRecords += batch.nodeRecordCount;
        performance.payloadBytes += batch.data.byteLength;
        performance.recordWords += batch.recordBytes / 4;
        performance.utf8SlabBytes += batch.stringSlabBytes;
      }
      if (options.functionMap && nativeFunctionMap == null)
        nativeFunctionMap = session.takeFunctionMap();
      const childParentTypes = activePlugins.flatMap(plugin =>
        Object.keys(plans.get(plugin)?.children ?? {}),
      );
      if (requiresIndex || includeParent || includeScope)
        session.reserveEventCache(batch.nodeCount);
      if (childParentTypes.length > 0) session.prefetchChildren([], childParentTypes);
      if (batch.includeParent) session.seedSummaries(batch.parentSummaries);
      const dispatcherStarted = options.debugPerformance ? performance.now() : 0;
      const dispatch = createDispatcher(
        session,
        phase,
        activePlugins,
        plans,
        batch,
        edits,
        metadata,
        diagnostics,
        requiresIndex || includeParent || includeScope,
        compiledRoutes,
        dispatchRoutes,
        intents,
        provenance,
        verifier,
        { compileNestedVisitor, nestedManifest },
        options.pluginData,
      );
      if (options.debugPerformance)
        performanceCounters(metadata).dispatcherSetupMs += performance.now() - dispatcherStarted;
      for (const plugin of activePlugins) {
        const state = plugin.createState?.({
          filename,
          options,
          parser,
          sourceHints: sourceHints(observationSource),
          pluginData: options.pluginData,
        });
        allStates.push({ plugin, state });
        dispatch.contexts.get(plugin)!.state = state;
        plugin.pre?.(dispatch.contexts.get(plugin)!.context, state);
      }
      const decisions = new Map<NativePlugin<any, any>, TransformDecision>();
      for (const plugin of activePlugins) {
        const entry = dispatch.contexts.get(plugin)!;
        const decision = plugin.analyze?.(entry.context, entry.state) ?? {
          status: 'supported',
          analysis: undefined,
        };
        decisions.set(plugin, decision);
        if (decision.status === 'unsupported') {
          if (decision.location)
            diagnostics.push({
              code: 'unsupported',
              message: decision.reason,
              plugin: plugin.name,
              phase: phase.name,
              start: locationOffset(observationSource, decision.location.start),
              end: locationOffset(observationSource, decision.location.end),
            });
          throw new Bailout(`${plugin.name}:${decision.reason}`);
        }
        if (decision.status === 'irrelevant') entry.stopped = true;
      }
      for (const plugin of activePlugins) {
        const decision = decisions.get(plugin)!;
        if (decision.status === 'supported') {
          const entry = dispatch.contexts.get(plugin)!;
          plugin.apply?.(entry.context, decision.analysis, entry.state);
        }
      }
      const dispatchStarted = options.debugPerformance ? performance.now() : 0;
      dispatch.run();
      if (options.debugPerformance)
        performanceCounters(metadata).dispatchMs += performance.now() - dispatchStarted;
      for (const plugin of activePlugins)
        plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      for (const plugin of activePlugins) {
        const pluginEffect = plans.get(plugin)?.editEffect ?? plugin.editEffect;
        if (pluginEffect === 'none' && edits.some(edit => edit.owner === plugin.name))
          throw new Error(`${plugin.name}: plugin declared edit effect none but emitted edits`);
      }
      if (runtimeEditEffect === 'none' && edits.length > 0)
        throw new Error(`${phase.name}: phase declared edit effect none but emitted edits`);
      if (options.debugPerformance) {
        const previous = recordedParseCounts.get(session) ?? 0;
        const previousTraversals = recordedTraversalCounts.get(session) ?? 0;
        const performance = metadata.performance as {
          nativeParses: number;
          nativeAstTraversals: number;
        };
        performance.nativeParses += session.nativeParseCount - previous;
        performance.nativeAstTraversals += session.nativeAstTraversalCount - previousTraversals;
        recordedParseCounts.set(session, session.nativeParseCount);
        recordedTraversalCounts.set(session, session.nativeAstTraversalCount);
      }
      const isFinalPhase = phaseIndex === pipeline.phases.length - 1;
      if (edits.length > 0 && observationSource !== phaseSource)
        throw new Error(
          `${phase.name}: edits against original source are ambiguous after a rendered boundary`,
        );
      const effectiveEdits = pendingEdits.length === 0 ? edits : [...pendingEdits, ...edits];
      if (effectiveEdits.length === 0) {
        if (phaseExecution) phaseExecution.render = 'unchanged';
        if (observationSource === phaseSource) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      const nextPlan = phasePlan[phaseIndex + 1];
      const canDefer =
        !isFinalPhase &&
        runtimeEditEffect === 'text-only' &&
        nextPlan != null &&
        !nextPlan.requiresPrintedInput &&
        pipeline.phases[phaseIndex + 1].requiresFreshSemantics !== true &&
        !phasePlan[phaseIndex].requiresRealizedMap;
      if (canDefer) {
        if (phaseExecution) phaseExecution.render = 'deferred';
        pendingEdits = effectiveEdits;
        reusableSession = session;
        reusableRoutedBatch = { manifest, batch };
        continue;
      }
      // The sole final layer encodes VLQ directly; any earlier committed layer keeps
      // its mapping in packed decoded form so the chain encodes once at the end.
      const decodedLayer = !(isFinalPhase && mapLayers.length === 0);
      const renderStarted = options.debugPerformance ? performance.now() : 0;
      const recordCommit = (
        committed: { edits: EditCommand[]; deduped: number; code: string },
        segments: number,
        encoded: boolean,
      ) => {
        performanceCounters(metadata).renderAndMapMs += performance.now() - renderStarted;
        const performanceMetadata = metadata.performance as {
          editCount: number;
          convergentEditsDeduped: number;
          renderedBytes: number;
          mappingSegments: number;
          mapEncodes: number;
        };
        performanceMetadata.editCount += committed.edits.length;
        performanceMetadata.convergentEditsDeduped += committed.deduped;
        performanceMetadata.renderedBytes += Buffer.byteLength(committed.code);
        performanceMetadata.mappingSegments += segments;
        if (encoded) performanceMetadata.mapEncodes++;
      };
      if (decodedLayer) {
        const committed = session.commitDecoded(effectiveEdits, options.sourceMapMode);
        phaseSource = committed.code;
        mapLayers.push(committed.map);
        if (options.debugPerformance)
          recordCommit(committed, decodedSegmentCount(committed.map), false);
      } else {
        const committed = session.commit(effectiveEdits, options.sourceMapMode);
        phaseSource = committed.code;
        // The sole final layer: the pipeline's own map is exactly this commit's map,
        // pending only input-map composition at the boundary below.
        finalMap = committed.map;
        if (options.debugPerformance)
          recordCommit(committed, countMappingSegments(committed.map.mappings), true);
      }
      if (phaseExecution) phaseExecution.render = 'committed';
      pendingEdits = [];
      session.close();
      if (options.debugPerformance && phaseIndex + 1 < pipeline.phases.length) {
        const performance = metadata.performance as { reparses: number };
        performance.reparses++;
      }
      reusableRoutedBatch = null;
      openSession = null;
      // Opening the next phase creates the explicit render/reparse boundary.
    }
    reusableSession?.close();
    openSession = null;
    if (mapLayers.length > 0) {
      const composeStarted = options.debugPerformance ? performance.now() : 0;
      if (options.debugPerformance) recordNativeCrossing(metadata, 'source-map.compose-chain');
      finalMap = native.composeDecodedChain(mapLayers);
      if (options.debugPerformance) {
        performanceCounters(metadata).renderAndMapMs += performance.now() - composeStarted;
        (metadata.performance as { mapEncodes: number }).mapEncodes++;
      }
    }
    // Input source maps compose once at the boundary where they enter.
    if (inputMap != null) {
      if (options.debugPerformance && finalMap != null)
        recordNativeCrossing(metadata, 'source-map.compose-input');
      finalMap =
        finalMap == null
          ? inputMap
          : {
              mappings: native.composeMappings(
                finalMap.mappings,
                inputMap.mappings,
                finalMap.names.length,
              ),
              names: [...finalMap.names, ...inputMap.names],
            };
    }
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    const functionMapStarted = options.debugPerformance ? performance.now() : 0;
    if (options.debugPerformance && options.functionMap && nativeFunctionMap == null)
      recordNativeCrossing(metadata, 'function-map.generate');
    const functionMap = options.functionMap
      ? (nativeFunctionMap ??
        native.generateFunctionMap(adapterMap == null ? originalSource : source, parseFilename))
      : null;
    if (options.debugPerformance)
      performanceCounters(metadata).functionMapMs = performance.now() - functionMapStarted;
    if (options.debugPerformance) {
      performanceCounters(metadata).totalMs = performance.now() - transformStarted;
      performanceCounters(metadata).overallMs = performance.now() - overallStarted;
      sampleProcessMemory(metadata);
    }
    // Always-on observability: a count only, so production consumers can notice
    // weakened maps or stale cross-phase text without debug tracing enabled.
    if (provenance.degradations > 0) metadata.provenanceDegradations = provenance.degradations;
    verifier?.finish(diagnostics);
    return {
      status: 'complete',
      code: phaseSource,
      map: finalMap ?? { mappings: '', names: [] },
      functionMap,
      metadata,
      diagnostics,
    };
  } catch (error) {
    openSession?.close();
    const bailout = error instanceof Bailout;
    for (const { plugin, state } of allStates)
      plugin.cleanup?.(bailout ? 'bailout' : 'error', state);
    if (bailout) {
      return {
        status: 'bailout',
        reason: error.message,
        source: originalSource,
        diagnostics,
      } satisfies NativeBailoutResult;
    }
    if (error instanceof NativeTransformError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new NativeTransformError(
      message,
      [...diagnostics, { code: 'native-transform-error', message }],
      (error as Error & { owners?: readonly string[] }).owners,
    );
  }
}

/** Segment count of a packed decoded layer buffer (see the native layer layout). */
function decodedSegmentCount(layer: Buffer): number {
  if (layer.length < 12) return 0;
  const segmentsOffset = layer.readUInt32LE(4);
  return (layer.length / 4 - segmentsOffset) / 5;
}

function countMappingSegments(mappings: string): number {
  if (mappings.length === 0) return 0;
  let count = 0;
  let inSegment = false;
  for (const character of mappings) {
    if (character === ',' || character === ';') {
      inSegment = false;
    } else if (!inSegment) {
      count++;
      inSegment = true;
    }
  }
  return count;
}
