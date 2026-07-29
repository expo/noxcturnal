import { classifyForTransform, parserFilename, sourceHints } from '../adapters/classification.js';
import { selectParserAdapter } from '../adapters/registry.js';
import { compilePhasePlan } from '../pipeline/compile.js';
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
import {
  native,
  nativePreflightOptions,
  type NativePreflightResultOutput,
} from '../native/binding.js';
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
import { NativeTransformSession, TransformUidAllocator } from './session.js';
import { commitWithDedupe } from './editor.js';

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
  const uidAllocator = new TransformUidAllocator();
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
    let hints: ReadonlySet<string> | undefined;
    try {
      for (const phase of pipeline.phases)
        for (const plugin of phase.plugins ?? []) {
          const prepareContext = {
            filename,
            options,
            parser,
            sourceHints: (hints ??= sourceHints(source)),
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
  // An all-native pipeline has no visitor phase, so it never needs the source
  // text in JS: the whole run collapses into one `runNativePipeline` crossing,
  // no resident session object required.
  const allNative =
    pipeline.phases.length > 0 &&
    pipeline.phases.every(phase => phase.native != null) &&
    phasePlan.every(plan => plan.observes !== 'original');
  // The resident source: native phases and visitor commits mutate it in place
  // and accumulate their map layers natively, so the intermediate phase source
  // and per-phase map layers never cross the boundary — only the final composed
  // map, and the source text a visitor phase asks for, do. A mixed pipeline needs
  // it across its JS phases; an all-native one does not.
  // Visitor-only analysis pipelines never produce a resident layer. Avoid
  // copying their source into a second native session merely to return it
  // unchanged at the end; create the session lazily if a visitor actually edits.
  let pipelineSession =
    !allNative && pipeline.phases.some(phase => phase.native != null)
      ? new native.NativePipelineSession(parseFilename, source)
      : null;
  // A native phase or commit leaves `phaseSource` stale — the session holds the
  // truth — so consecutive native phases hand the source along as a resident
  // handle rather than crossing the whole string out and back. It is only
  // materialized when a visitor phase reads source text, or for the final result.
  let phaseSourceStale = false;
  const currentSource = (): string => {
    if (phaseSourceStale) {
      phaseSource = pipelineSession!.sourceText();
      phaseSourceStale = false;
    }
    return phaseSource;
  };
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
    options.debugPerformance ? Buffer.byteLength(source) : 0,
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
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  let pendingEdits: EditCommand[] = [];
  let nativeFunctionMap: FunctionMap | null = null;
  const recordedParseCounts = new WeakMap<NativeTransformSession, number>();
  const recordedTraversalCounts = new WeakMap<NativeTransformSession, number>();
  // Record one native run's per-phase results into diagnostics/metadata and bail
  // on the first phase that did not complete. Shared by the mixed-pipeline loop
  // and the all-native single-call path.
  const recordNativeResults = (
    results: readonly NativePreflightResultOutput[],
    batch: readonly { phase: (typeof pipeline.phases)[number]; index: number }[],
    runWall: number,
  ): void => {
    if (options.debugPerformance) {
      performanceCounters(metadata).nativeTransformMs += runWall;
      performanceCounters(metadata).nativeAndDecodeMs += runWall;
      recordNativeCrossing(metadata, 'preflight.transform');
    }
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
      const result = results[resultIndex];
      const { phase: batchPhase, index } = batch[resultIndex];
      const complete = result.status === 'complete';
      if (options.debugPerformance) {
        const phaseMs =
          (result.parseMs ?? 0) +
          (result.semanticBuildMs ?? 0) +
          (result.customRewriteMs ?? 0) +
          (result.oxcTransformMs ?? 0) +
          (result.optimizationMs ?? 0) +
          (result.codegenAndMapMs ?? 0) +
          (result.helperDiscoveryMs ?? 0) +
          (result.helperMaterializationMs ?? 0);
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
        if (index + 1 < pipeline.phases.length) performanceMetadata.reparses++;
        performanceMetadata.renderedBytes += result.renderedBytes ?? 0;
        performanceMetadata.mappingSegments += result.mappingSegments ?? 0;
        performanceMetadata.phaseExecutions.push({
          name: batchPhase.name,
          observes: phasePlan[index].observes,
          editEffect: 'whole-program',
          source: 'rendered',
          reusedParse: false,
          render: complete ? 'committed' : 'unchanged',
          nativeTransformMs: phaseMs,
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
          rewriteSteps: result.rewriteSteps ?? [],
        });
        sampleProcessMemory(metadata);
      }
      for (const message of result.diagnostics)
        diagnostics.push({
          code: complete ? 'native-transform' : 'unsupported',
          message,
          phase: batchPhase.name,
        });
      if (result.helpersUsed.length > 0)
        metadata.nativeHelpers = [
          ...((metadata.nativeHelpers as string[] | undefined) ?? []),
          ...result.helpersUsed,
        ];
      // A native run stops at the first phase that did not complete.
      if (!complete) throw new Bailout(`${batchPhase.name}:${result.reason ?? 'unsupported'}`);
    }
  };
  // The shared success tail: plugin cleanup, function map, final metadata, and
  // the completed result. `phaseSource`/`finalMap` are already set by the loop or
  // the all-native path.
  const completeResult = (): TransformResult => {
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
  };
  try {
    // All-native fast path: one crossing runs every phase and returns the final
    // { code, map }. No visitor phase means no source text is needed in JS.
    if (allNative) {
      const batch = pipeline.phases.map((phase, index) => ({ phase, index }));
      const nativeStarted = options.debugPerformance ? performance.now() : 0;
      const pipelineResult = native.runNativePipeline(
        parseFilename,
        source,
        batch.map(({ phase }) => nativePreflightOptions(phase.native!, options.debugPerformance)),
        inputMap?.mappings,
        inputMap?.names,
      );
      const runWall = options.debugPerformance ? performance.now() - nativeStarted : 0;
      recordNativeResults(pipelineResult.results, batch, runWall); // throws on any bail
      phaseSource = pipelineResult.code!; // every phase completed, else recordNativeResults bailed
      if (pipelineResult.map != null) {
        finalMap = pipelineResult.map;
        if (options.debugPerformance) {
          recordNativeCrossing(metadata, 'source-map.compose-chain');
          if (inputMap != null) recordNativeCrossing(metadata, 'source-map.compose-input');
          (metadata.performance as { mapEncodes: number }).mapEncodes++;
        }
      } else if (inputMap != null) {
        if (options.debugPerformance) recordNativeCrossing(metadata, 'source-map.compose-input');
        finalMap = inputMap;
      }
      return completeResult();
    }
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const observesOriginal = phasePlan[phaseIndex].observes === 'original';
      if (phase.native != null) {
        reusableSession?.close();
        reusableSession = null;
        reusableRoutedBatch = null;
        openSession = null;
        if (pendingEdits.length > 0)
          throw new Error(`${phase.name}: native phase received uncommitted visitor edits`);
        // Collect the run of consecutive native phases and execute them in a
        // single crossing: native phases hand the source and their map layers
        // along resident, never bouncing back to JS between themselves. The
        // for-loop's `++` resumes at the first non-native phase after the run.
        const batch: { phase: (typeof pipeline.phases)[number]; index: number }[] = [];
        while (phaseIndex < pipeline.phases.length && pipeline.phases[phaseIndex].native != null) {
          const batchPhase = pipeline.phases[phaseIndex];
          // A native phase runs on the resident source; observing the original —
          // once an adapter rewrite or a prior render has diverged it — would run
          // it on the wrong text. Only a phase that observes the original pays to
          // materialize the source here; the common case does not.
          if (phasePlan[phaseIndex].observes === 'original' && originalSource !== currentSource())
            throw new Error(`${batchPhase.name}: native phases must observe rendered source`);
          batch.push({ phase: batchPhase, index: phaseIndex });
          phaseIndex++;
        }
        phaseIndex--;
        const nativeStarted = options.debugPerformance ? performance.now() : 0;
        const results = pipelineSession!.runNativePhases(
          batch.map(({ phase: batchPhase }) =>
            nativePreflightOptions(batchPhase.native!, options.debugPerformance),
          ),
        );
        const runWall = options.debugPerformance ? performance.now() - nativeStarted : 0;
        // The rendered source stays resident; materialized lazily only if a later
        // visitor phase needs its text, or once at the end.
        if (results.length > 0 && results[results.length - 1].status === 'complete')
          phaseSourceStale = true;
        recordNativeResults(results, batch, runWall);
        continue;
      }
      // A visitor phase reads source text, so materialize the resident source
      // once for this phase; `observationSource` and the edit-boundary checks
      // below then compare against a real, current string.
      const materializedSource = currentSource();
      const observationSource = observesOriginal ? originalSource : materializedSource;
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
        requiresIndexBase,
        structuralParentTypes,
        runtimeEditEffect,
        compiledRoutes,
        dispatchRoutes,
        manifest,
      } = prepared;
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
      const requiresIndex =
        requiresIndexBase ||
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
          uidAllocator,
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
      if (requiresIndex || includeParent || includeScope)
        session.reserveEventCache(batch.nodeCount);
      if (structuralParentTypes.length > 0) session.prefetchChildren([], structuralParentTypes);
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
      let phaseSourceHints: ReadonlySet<string> | undefined;
      for (const plugin of activePlugins) {
        const state = plugin.createState?.({
          filename,
          options,
          parser,
          sourceHints: (phaseSourceHints ??= sourceHints(observationSource)),
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
      // The edits address the resident source directly, so the commit renders
      // in the pipeline session: the new source and the map layer stay resident,
      // and the chain composes once at the end.
      const renderStarted = options.debugPerformance ? performance.now() : 0;
      pipelineSession ??= new native.NativePipelineSession(parseFilename, phaseSource);
      const residentPipeline = pipelineSession;
      const committed = commitWithDedupe(effectiveEdits, data =>
        residentPipeline.commitDecoded(data, options.sourceMapMode),
      );
      // The rendered source stays resident; a following native phase reads it
      // without a crossing, and a following visitor phase materializes it lazily.
      phaseSourceStale = true;
      if (options.debugPerformance) {
        performanceCounters(metadata).renderAndMapMs += performance.now() - renderStarted;
        const performanceMetadata = metadata.performance as {
          editCount: number;
          convergentEditsDeduped: number;
          renderedBytes: number;
          mappingSegments: number;
        };
        performanceMetadata.editCount += committed.edits.length;
        performanceMetadata.convergentEditsDeduped += committed.deduped;
        performanceMetadata.renderedBytes += committed.renderedBytes;
        performanceMetadata.mappingSegments += committed.mappingSegments;
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
    // The single terminal crossing: the resident source becomes the final code
    // and every retained layer composes into the final map — with the input map
    // folded in natively — in one call.
    if (pipelineSession == null) {
      // No native phase and no visitor edit: nothing crossed into the resident
      // pipeline and no map layer needs composing.
      finalMap = inputMap;
      return completeResult();
    }
    const composeStarted = options.debugPerformance ? performance.now() : 0;
    const finished = pipelineSession.finish(inputMap?.mappings, inputMap?.names);
    phaseSource = finished.code;
    phaseSourceStale = false;
    if (finished.map != null) {
      finalMap = finished.map;
      if (options.debugPerformance) {
        recordNativeCrossing(metadata, 'source-map.compose-chain');
        if (inputMap != null) recordNativeCrossing(metadata, 'source-map.compose-input');
        performanceCounters(metadata).renderAndMapMs += performance.now() - composeStarted;
        (metadata.performance as { mapEncodes: number }).mapEncodes++;
      }
    } else if (inputMap != null) {
      // No pipeline layer: the input/adapter map is the whole map.
      if (options.debugPerformance) recordNativeCrossing(metadata, 'source-map.compose-input');
      finalMap = inputMap;
    }
    return completeResult();
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
