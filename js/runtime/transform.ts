import { classifyForTransform, parserFilename, sourceHints } from '../adapters/classification';
import { selectParserAdapter } from '../adapters/registry';
import { compilePhasePlan } from '../pipeline/compile';
import { closeDefinitionScope } from '../pipeline/define';
import type { CompiledRouteTemplate, PreparedPhase } from '../pipeline/types';
import {
  compileNestedVisitor,
  mergeFieldRequests,
  nestedManifest,
  preparePhase,
} from '../pipeline/routes';
import { Bailout, createDispatcher } from './dispatch';
import { SourceVersionStore, type SourceVersionId } from './source-versions';
import { ArtifactDemand, hasSemanticDemand } from '../pipeline/artifacts';
import { locationOffset } from './path';
import type { IntentRegistration } from './fragments';
import {
  native,
  nativePreflightOptions,
  type NativePreflightResultOutput,
} from '../native/binding';
import { decodeRoutedEnvelope, type RoutedEventBatch } from '../protocol/events';
import { packRouteManifest } from '../protocol/manifest';
import type {
  Diagnostic,
  EditCommand,
  NativeBailoutResult,
  NativeTransformResult,
  NativeVlqMap,
  TransformOptions,
  TransformResult,
} from '../types';
import {
  NativePipeline,
  NativePlugin,
  TransformDecision,
  NativeTransformError,
} from '../contracts/visitor';
import { NativeTransformSession, TransformUidAllocator } from './session';
import { commitWithDedupe } from './editor';

interface RetainedPlan {
  futureSubscriptions: ReadonlySet<string>;
  futureRetentionCapabilities: number;
  retentionManifest: Buffer;
}

interface RetainedChainNode {
  children: WeakMap<PreparedPhase, RetainedChainNode>;
  plan?: RetainedPlan;
}

const SEMANTIC_ROUTE_FIELDS = new Set([
  'global',
  'read',
  'write',
  'bindingScopeId',
  'calleeGlobal',
  'rootGlobal',
]);

function routeFieldNeedsSemantics(nodeType: string, field: string): boolean {
  return SEMANTIC_ROUTE_FIELDS.has(field) && (field !== 'write' || nodeType === 'Identifier');
}

function phaseArtifactDemand(base: ArtifactDemand, prepared: PreparedPhase): ArtifactDemand {
  let demand = base;
  if (prepared.includeParent) demand |= ArtifactDemand.StructuralParents;
  if (prepared.structuralParentTypes.length > 0) demand |= ArtifactDemand.StructuralChildren;
  if (prepared.includeScope) demand |= ArtifactDemand.LexicalScopes;
  if (prepared.retentionCapabilities & (1 << 1)) demand |= ArtifactDemand.DirectScalarFields;
  if (prepared.retentionCapabilities & (1 << 5)) demand |= ArtifactDemand.ModuleFacts;
  if (
    prepared.retentionCapabilities & ((1 << 0) | (1 << 2)) ||
    prepared.compiledRoutes.some(
      route =>
        route.payloadFields.some(field => routeFieldNeedsSemantics(route.nodeType, field)) ||
        Object.keys(route.predicates).some(field =>
          routeFieldNeedsSemantics(route.nodeType, field),
        ),
    )
  )
    demand |= ArtifactDemand.BindingsReferences;
  return demand;
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
  const ancestorFields: Record<string, string[]> = {};
  const ancestorTypes = new Set<string>();
  const ancestorChildParentTypes = new Set<string>();
  let ancestryDepth = 0;
  const retainedRoutes: CompiledRouteTemplate[] = [...prepared.compiledRoutes];
  let futureRetentionCapabilities = 0;
  const collect = (phase: PreparedPhase) => {
    for (const plugin of phase.activePlugins) {
      const plan = phase.plans.get(plugin);
      for (const type of Object.keys(plan?.children ?? {})) structuralParentTypes.add(type);
      for (const type of Object.keys(plan?.ancestryChildren ?? {})) structuralParentTypes.add(type);
      mergeFieldRequests(retainedFields, plan?.fields ?? {});
      mergeFieldRequests(retainedFields, plan?.ancestryFields ?? {});
      mergeFieldRequests(ancestorFields, plan?.ancestryFields ?? {});
      for (const type of plan?.ancestryTypes ?? []) ancestorTypes.add(type);
      for (const type of Object.keys(plan?.ancestryChildren ?? {}))
        ancestorChildParentTypes.add(type);
      if (plan?.ancestry != null)
        ancestryDepth = Math.max(
          ancestryDepth,
          typeof plan.ancestry.mode === 'number'
            ? plan.ancestry.mode
            : plan.ancestry.mode === 'parent'
              ? 1
              : Number.POSITIVE_INFINITY,
        );
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
      ancestorFields,
      [...ancestorTypes],
      [...ancestorChildParentTypes],
      ancestryDepth,
    ),
  };
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
  const originalSource = source;
  const uidAllocator = new TransformUidAllocator();
  let parseFilename = parserFilename(filename, options.parser);
  let parser = classifyForTransform(parseFilename, source);
  let adapterMap: NativeVlqMap | null = null;
  let adapterMetadata: Record<string, unknown> | undefined;
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
      };
    } catch (error) {
      for (const { plugin, state } of prepared) plugin.cleanup?.('error', state);
      throw error;
    }
  }
  const phasePlan = compilePhasePlan(pipeline);
  if (adapterMap != null && pipeline.phases.some(phase => phase.native?.reactCompiler != null)) {
    return {
      status: 'bailout',
      reason: 'react-compiler-original-source-required',
      source: originalSource,
      diagnostics: [],
    };
  }
  const sourceVersions = new SourceVersionStore(originalSource);
  let currentVersion = sourceVersions.original;
  if (source !== originalSource || adapterMap != null) {
    currentVersion = sourceVersions.commit(currentVersion, {
      normalizedEditCount: 0,
      codeChanged: source !== originalSource,
      mapChanged: adapterMap != null,
    });
    sourceVersions.cacheRenderedText(currentVersion, source);
  }
  // An all-native pipeline has no visitor phase, so it never needs the source
  // text in JS: the whole run collapses into one `runNativePipeline` crossing,
  // no resident session object required.
  const allNative =
    pipeline.phases.length > 0 && pipeline.phases.every(phase => phase.native != null);
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
  // Rendered text is an optional artifact of the current source version. Native
  // work leaves it resident; a visitor or final output materializes and caches
  // it on that exact immutable version.
  const currentSource = (): string => {
    const cached = sourceVersions.renderedText(currentVersion);
    if (cached != null) return cached;
    const materialized = pipelineSession!.sourceText();
    sourceVersions.cacheRenderedText(currentVersion, materialized);
    return materialized;
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
  const metadata: Record<string, unknown> = {};
  if (adapterMetadata != null) metadata.sourceAdapter = adapterMetadata;
  const diagnostics: Diagnostic[] = [];
  const intents = new Map<string, IntentRegistration>();
  const provenance = { degradations: 0 };
  const allStates: { plugin: NativePlugin<any, any>; state: any }[] = [];
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  // Record one native run's per-phase results into diagnostics/metadata and bail
  // on the first phase that did not complete. Shared by the mixed-pipeline loop
  // and the all-native single-call path.
  const recordNativeResults = (
    results: readonly NativePreflightResultOutput[],
    batch: readonly { phase: (typeof pipeline.phases)[number]; index: number }[],
  ): void => {
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++) {
      const result = results[resultIndex];
      const { phase: batchPhase } = batch[resultIndex];
      const complete = result.status === 'complete';
      if (complete && result.changed)
        currentVersion = sourceVersions.commit(currentVersion, {
          normalizedEditCount: 1,
          codeChanged: true,
          mapChanged: true,
        });
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
  // the completed result. The current version/final map are already set by the loop or
  // the all-native path.
  const completeResult = (): TransformResult => {
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    const cachedFunctionMap = sourceVersions.functionMap(currentVersion);
    const functionMap = options.functionMap
      ? (cachedFunctionMap ?? native.generateFunctionMap(currentSource(), parseFilename))
      : null;
    if (functionMap != null && cachedFunctionMap == null)
      sourceVersions.cacheFunctionMap(currentVersion, functionMap);
    return {
      status: 'complete',
      code: currentSource(),
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
      const pipelineResult = native.runNativePipeline(
        parseFilename,
        source,
        batch.map(({ phase }) => nativePreflightOptions(phase.native!)),
        inputMap?.mappings,
        inputMap?.names,
        options.functionMap,
      );
      recordNativeResults(pipelineResult.results, batch); // throws on any bail
      sourceVersions.cacheRenderedText(currentVersion, pipelineResult.code!);
      if (pipelineResult.functionMap != null) {
        sourceVersions.cacheFunctionMap(currentVersion, pipelineResult.functionMap);
      }
      if (pipelineResult.map != null) {
        finalMap = pipelineResult.map;
      } else if (inputMap != null) {
        finalMap = inputMap;
      }
      return completeResult();
    }
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const executionPlan = phasePlan[phaseIndex];
      const isFinalPhase = phaseIndex === pipeline.phases.length - 1;
      const observedVersion: SourceVersionId = currentVersion;
      if (phase.native != null) {
        reusableSession?.close();
        reusableSession = null;
        reusableRoutedBatch = null;
        openSession = null;
        // Collect the run of consecutive native phases and execute them in a
        // single crossing: native phases hand the source and their map layers
        // along resident, never bouncing back to JS between themselves. The
        // for-loop's `++` resumes at the first non-native phase after the run.
        const batch: { phase: (typeof pipeline.phases)[number]; index: number }[] = [];
        while (phaseIndex < pipeline.phases.length && pipeline.phases[phaseIndex].native != null) {
          const batchPhase = pipeline.phases[phaseIndex];
          batch.push({ phase: batchPhase, index: phaseIndex });
          phaseIndex++;
        }
        phaseIndex--;
        const results = pipelineSession!.runNativePhases(
          batch.map(({ phase: batchPhase }) => nativePreflightOptions(batchPhase.native!)),
        );
        // The rendered source stays resident; materialized lazily only if a later
        // visitor phase needs its text, or once at the end.
        recordNativeResults(results, batch);
        continue;
      }
      // A visitor phase reads source text, so materialize the resident source
      // once for this phase; `observationSource` and the edit-boundary checks
      // below then compare against a real, current string.
      const materializedSource = currentSource();
      const observationSource = materializedSource;
      if (reusableSession && reusableSession.source !== observationSource) {
        reusableSession.close();
        reusableSession = null;
        reusableRoutedBatch = null;
      }
      const edits: EditCommand[] = [];
      const prepared = preparePhase(phase);
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
      const retainedSession = reusableSession;
      let futureSubscriptions: ReadonlySet<string>;
      let retentionManifest: Buffer;
      if (retainedSession == null) {
        const lookahead: PreparedPhase[] = [];
        let chain = retainedChains(prepared);
        if (runtimeEditEffect === 'none') {
          for (
            let futureIndex = phaseIndex + 1;
            futureIndex < pipeline.phases.length;
            futureIndex++
          ) {
            if (phasePlan[futureIndex].requiresPrintedInput) break;
            const futurePrepared = preparePhase(pipeline.phases[futureIndex]);
            lookahead.push(futurePrepared);
            chain = retainedChains(futurePrepared, chain);
          }
        }
        const retained = (chain.plan ??= buildRetainedPlan(prepared, lookahead));
        ({ futureSubscriptions, retentionManifest } = retained);
      } else {
        // The retained session was opened with the complete compatible suffix.
        // Later phases reuse that native index and do not rebuild progressively
        // shorter suffix plans.
        futureSubscriptions = new Set();
        retentionManifest = manifest;
      }
      const nextPhase = pipeline.phases[phaseIndex + 1];
      const canReuseForNextPhase =
        phaseIndex + 1 === pipeline.phases.length ||
        (runtimeEditEffect === 'none' &&
          nextPhase?.native == null &&
          !phasePlan[phaseIndex + 1].requiresPrintedInput);
      const collectFinalFunctionMap =
        options.functionMap === true && isFinalPhase && !/\n#!/.test(observationSource);
      const artifactDemand =
        phaseArtifactDemand(executionPlan.artifactDemand, prepared) |
        (collectFinalFunctionMap ? ArtifactDemand.FunctionMap : ArtifactDemand.None);
      const requiresIndex =
        requiresIndexBase ||
        includeParent ||
        includeScope ||
        collectFinalFunctionMap ||
        futureSubscriptions.size > 0 ||
        hasSemanticDemand(artifactDemand);
      // Parsed/index artifacts live exactly as long as their retained native
      // session. If orchestration dropped that owner, the generic planner must
      // not report a logical cache hit for the version.
      if (retainedSession == null) sourceVersions.dropParsedArtifacts(observedVersion);
      sourceVersions.ensure(observedVersion, artifactDemand, requiresIndex);
      const session: NativeTransformSession =
        retainedSession ??
        new NativeTransformSession(
          observationSource,
          parseFilename,
          // `parseFilename` is already normalized, including an adapter's
          // authoritative JS/JSX output mode. Do not apply the caller's original
          // parser override a second time inside NativeTransformSession.
          {
            ...options,
            parser: 'auto',
            // A map collected while opening the last phase belongs to that
            // phase's immutable input. A code-changing commit invalidates it;
            // a no-op or map-only child can reuse it in the success tail.
            functionMap: collectFinalFunctionMap,
          },
          requiresIndex ? retentionManifest : undefined,
          requiresIndex ? manifest : undefined,
          true,
          uidAllocator,
        );
      reusableSession = null;
      openSession = session;
      let batch: RoutedEventBatch;
      {
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
      }
      if (options.functionMap && isFinalPhase) {
        const phaseFunctionMap = session.takeFunctionMap();
        if (phaseFunctionMap != null)
          sourceVersions.cacheFunctionMap(observedVersion, phaseFunctionMap);
      }
      if (requiresIndex || includeParent || includeScope)
        session.reserveEventCache(batch.nodeCount);
      if (structuralParentTypes.length > 0) session.prefetchChildren([], structuralParentTypes);
      if (prepared.ancestorChildParentTypes.length > 0)
        session.seedRetainedChildTypes(prepared.ancestorChildParentTypes);
      if (batch.includeParent) session.seedSummaries(batch.parentSummaries);
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
        { compileNestedVisitor, nestedManifest },
        options.pluginData,
      );
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
      dispatch.run();
      for (const plugin of activePlugins)
        plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      for (const plugin of activePlugins) {
        const pluginEffect = plans.get(plugin)?.editEffect ?? plugin.editEffect;
        if (pluginEffect === 'none' && edits.some(edit => edit.owner === plugin.name))
          throw new Error(`${plugin.name}: plugin declared edit effect none but emitted edits`);
      }
      if (runtimeEditEffect === 'none' && edits.length > 0)
        throw new Error(`${phase.name}: phase declared edit effect none but emitted edits`);
      const effectiveEdits: EditCommand[] = edits;
      if (effectiveEdits.length === 0) {
        if (observedVersion === currentVersion && canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      // The edits address the resident source directly, so the commit renders
      // in the pipeline session: the new source and the map layer stay resident,
      // and the chain composes once at the end.
      pipelineSession ??= new native.NativePipelineSession(parseFilename, currentSource());
      const residentPipeline = pipelineSession;
      const committed = commitWithDedupe(effectiveEdits, data =>
        residentPipeline.commitDecoded(data, options.sourceMapMode),
      );
      const codeChanged = committed.codeChanged;
      const mapChanged = committed.mapChanged;
      const resultingVersion = sourceVersions.commit(observedVersion, {
        normalizedEditCount: committed.edits.length,
        normalizedEdits: committed.edits,
        codeChanged,
        mapChanged,
      });
      currentVersion = resultingVersion;
      // The rendered source stays resident; a following native phase reads it
      // without a crossing, and a following visitor phase materializes it lazily.
      if (!codeChanged && !mapChanged) {
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
          openSession = session;
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      if (!codeChanged) {
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
          openSession = session;
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      session.close();
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
    const finished = pipelineSession.finish(
      inputMap?.mappings,
      inputMap?.names,
      options.functionMap === true && sourceVersions.functionMap(currentVersion) == null,
    );
    sourceVersions.cacheRenderedText(currentVersion, finished.code);
    if (finished.functionMap != null) {
      sourceVersions.cacheFunctionMap(currentVersion, finished.functionMap);
    }
    if (finished.map != null) {
      finalMap = finished.map;
    } else if (inputMap != null) {
      // No pipeline layer: the input/adapter map is the whole map.
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
