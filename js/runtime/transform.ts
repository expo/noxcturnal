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
import { SourceVersionStore, type SourceVersionId } from './source-versions.js';
import { ArtifactDemand, hasSemanticDemand } from '../pipeline/artifacts.js';
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

const SEMANTIC_ROUTE_FIELDS = new Set([
  'global',
  'read',
  'write',
  'bindingScopeId',
  'calleeGlobal',
  'rootGlobal',
]);

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
        route.payloadFields.some(field => SEMANTIC_ROUTE_FIELDS.has(field)) ||
        Object.keys(route.predicates).some(field => SEMANTIC_ROUTE_FIELDS.has(field)),
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
  let finalFunctionMapGeneratedInPipeline = false;
  let finalFunctionMapPipelineMs = 0;
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
  const recordedParseCounts = new WeakMap<NativeTransformSession, number>();
  const recordedTraversalCounts = new WeakMap<NativeTransformSession, number>();
  const recordedSemanticBuildCounts = new WeakMap<NativeTransformSession, number>();
  const recordBoundaryReason = (
    kind: 'committedBoundaryReasons' | 'eliminatedBoundaryReasons',
    reason: string,
  ): void => {
    if (!options.debugPerformance) return;
    const counters = metadata.performance as Record<string, unknown>;
    const reasons = counters[kind] as Record<string, number>;
    reasons[reason] = (reasons[reason] ?? 0) + 1;
  };
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
      const observedVersion = currentVersion;
      if (complete)
        currentVersion = sourceVersions.commit(currentVersion, {
          normalizedEditCount: 1,
          codeChanged: true,
          mapChanged: true,
        });
      const nativeBoundaryReason =
        index + 1 === pipeline.phases.length
          ? 'final-output'
          : pipeline.phases[index + 1].native != null
            ? 'native-boundary'
            : phasePlan[index + 1].requiresRealizedMap
              ? 'realized-map'
              : phasePlan[index + 1].requiresPrintedInput
                ? 'printed-input'
                : 'ast-read-after-write';
      if (complete) recordBoundaryReason('committedBoundaryReasons', nativeBoundaryReason);
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
          editEffect: 'whole-program',
          source: 'rendered',
          reusedParse: false,
          render: complete ? 'committed' : 'unchanged',
          observedVersion,
          resultingVersion: currentVersion,
          artifactDemand: phasePlan[index].artifactDemand,
          artifactPlan:
            (result.semanticBuildCount ?? 0) > 0 ? 'retained-semantic' : 'retained-syntax',
          boundaryReason: complete ? nativeBoundaryReason : 'no-edits',
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
  // the completed result. The current version/final map are already set by the loop or
  // the all-native path.
  const completeResult = (): TransformResult => {
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    const functionMapStarted = options.debugPerformance ? performance.now() : 0;
    const cachedFunctionMap = sourceVersions.functionMap(currentVersion);
    if (options.debugPerformance && options.functionMap && cachedFunctionMap == null)
      recordNativeCrossing(metadata, 'function-map.generate');
    const functionMap = options.functionMap
      ? (cachedFunctionMap ?? native.generateFunctionMap(currentSource(), parseFilename))
      : null;
    if (functionMap != null && cachedFunctionMap == null)
      sourceVersions.cacheFunctionMap(currentVersion, functionMap);
    if (options.debugPerformance && options.functionMap) {
      const performance = metadata.performance as Record<string, unknown>;
      performance.finalFunctionMapCacheHit =
        cachedFunctionMap != null && !finalFunctionMapGeneratedInPipeline;
      performance.finalFunctionMapSyntaxParses =
        cachedFunctionMap == null || finalFunctionMapGeneratedInPipeline ? 1 : 0;
      performance.functionMapTraversals =
        cachedFunctionMap == null || finalFunctionMapGeneratedInPipeline ? 1 : 0;
      performance.functionMapBytes =
        functionMap == null
          ? 0
          : Buffer.byteLength(functionMap.mappings) +
            functionMap.names.reduce((sum, name) => sum + Buffer.byteLength(name), 0);
    }
    if (options.debugPerformance)
      performanceCounters(metadata).functionMapMs =
        finalFunctionMapPipelineMs + performance.now() - functionMapStarted;
    if (options.debugPerformance) {
      performanceCounters(metadata).totalMs = performance.now() - transformStarted;
      performanceCounters(metadata).overallMs = performance.now() - overallStarted;
      sampleProcessMemory(metadata);
      (metadata.performance as Record<string, unknown>).sourceVersions = sourceVersions.snapshot();
    }
    // Always-on observability: a count only, so production consumers can notice
    // weakened maps or stale cross-phase text without debug tracing enabled.
    if (provenance.degradations > 0) metadata.provenanceDegradations = provenance.degradations;
    verifier?.finish(diagnostics);
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
      const nativeStarted = options.debugPerformance ? performance.now() : 0;
      const pipelineResult = native.runNativePipeline(
        parseFilename,
        source,
        batch.map(({ phase }) => nativePreflightOptions(phase.native!, options.debugPerformance)),
        inputMap?.mappings,
        inputMap?.names,
        options.functionMap,
      );
      const runWall = options.debugPerformance ? performance.now() - nativeStarted : 0;
      recordNativeResults(pipelineResult.results, batch, runWall); // throws on any bail
      sourceVersions.cacheRenderedText(currentVersion, pipelineResult.code!);
      if (pipelineResult.functionMap != null) {
        sourceVersions.cacheFunctionMap(currentVersion, pipelineResult.functionMap);
        finalFunctionMapGeneratedInPipeline = true;
        finalFunctionMapPipelineMs = pipelineResult.functionMapMs ?? 0;
      }
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
        const nativeStarted = options.debugPerformance ? performance.now() : 0;
        const results = pipelineSession!.runNativePhases(
          batch.map(({ phase: batchPhase }) =>
            nativePreflightOptions(batchPhase.native!, options.debugPerformance),
          ),
        );
        const runWall = options.debugPerformance ? performance.now() - nativeStarted : 0;
        // The rendered source stays resident; materialized lazily only if a later
        // visitor phase needs its text, or once at the end.
        recordNativeResults(results, batch, runWall);
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
      const phasePerformanceStart = options.debugPerformance
        ? {
            counters: { ...(metadata.performance as Record<string, number>) },
            operations: {
              ...((metadata.performance as { nativeCrossingOperations: Record<string, number> })
                .nativeCrossingOperations ?? {}),
            },
          }
        : undefined;
      const preparationStarted = options.debugPerformance ? performance.now() : 0;
      const prepared = preparePhase(phase);
      const preparationMs = options.debugPerformance ? performance.now() - preparationStarted : 0;
      if (options.debugPerformance)
        performanceCounters(metadata).phasePreparationMs += preparationMs;
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
            editEffect: runtimeEditEffect,
            source:
              observationSource === originalSource ? ('original' as const) : ('rendered' as const),
            reusedParse: false,
            render: 'pending' as 'pending' | 'unchanged' | 'deferred' | 'committed',
            observedVersion: 0,
            resultingVersion: 0,
            artifactDemand: phasePlan[phaseIndex].artifactDemand,
            boundaryReason: undefined as string | undefined,
            preparationMs,
            plugins: activePlugins.map(plugin => plugin.name),
          }
        : undefined;
      if (phaseExecution) {
        phaseExecution.observedVersion = observedVersion;
        phaseExecution.resultingVersion = observedVersion;
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
        if (runtimeEditEffect !== 'none') break;
        const futurePrepared = preparePhase(pipeline.phases[futureIndex]);
        lookahead.push(futurePrepared);
        chain = retainedChains(futurePrepared, chain);
      }
      const retained = (chain.plan ??= buildRetainedPlan(prepared, lookahead));
      const { futureSubscriptions, retentionManifest } = retained;
      const retainedSession = reusableSession;
      const canReuseForNextPhase =
        phaseIndex + 1 === pipeline.phases.length ||
        (pipeline.phases[phaseIndex + 1].native == null &&
          lookahead[0] === preparePhase(pipeline.phases[phaseIndex + 1]));
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
      const artifactSelection = sourceVersions.ensure(
        observedVersion,
        artifactDemand,
        requiresIndex,
      );
      if (phaseExecution) {
        phaseExecution.artifactDemand = artifactDemand;
        Object.assign(phaseExecution, { artifactPlan: artifactSelection.plan });
      }
      const sessionStarted = options.debugPerformance ? performance.now() : 0;
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
            if (options.debugPerformance && artifactSelection.plan === 'stateless-syntax')
              (metadata.performance as { statelessSyntaxRoutes: number }).statelessSyntaxRoutes++;
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
      if (options.functionMap && isFinalPhase) {
        const phaseFunctionMap = session.takeFunctionMap();
        if (phaseFunctionMap != null)
          sourceVersions.cacheFunctionMap(observedVersion, phaseFunctionMap);
      }
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
        const previousSemanticBuilds = recordedSemanticBuildCounts.get(session) ?? 0;
        const performance = metadata.performance as {
          nativeParses: number;
          nativeAstTraversals: number;
          nativeSemanticBuilds: number;
          retainedSyntaxMaterializations: number;
          retainedSemanticMaterializations: number;
        };
        performance.nativeParses += session.nativeParseCount - previous;
        performance.nativeAstTraversals += session.nativeAstTraversalCount - previousTraversals;
        const semanticBuilds = session.nativeSemanticBuildCount - previousSemanticBuilds;
        performance.nativeSemanticBuilds += semanticBuilds;
        if (session.nativeParseCount > previous) {
          if (semanticBuilds > 0) performance.retainedSemanticMaterializations++;
          else if (requiresIndex) performance.retainedSyntaxMaterializations++;
        }
        recordedParseCounts.set(session, session.nativeParseCount);
        recordedTraversalCounts.set(session, session.nativeAstTraversalCount);
        recordedSemanticBuildCounts.set(session, session.nativeSemanticBuildCount);
      }
      const finalizePhaseExecution = (codeChanged: boolean, mapChanged: boolean) => {
        if (!phaseExecution || !phasePerformanceStart) return;
        const counters = metadata.performance as Record<string, number>;
        for (const [field, counter] of [
          ['sessionOpenMs', 'sessionOpenMs'],
          ['nativeAndDecodeMs', 'nativeAndDecodeMs'],
          ['dispatcherSetupMs', 'dispatcherSetupMs'],
          ['dispatchMs', 'dispatchMs'],
          ['callbackMs', 'callbackMs'],
          ['commitMs', 'renderAndMapMs'],
          ['routeDeliveries', 'routeDeliveries'],
          ['nodeRecords', 'nodeRecords'],
          ['payloadBytes', 'payloadBytes'],
          ['stringSlabBytes', 'utf8SlabBytes'],
          ['nativeWorkCrossings', 'nativeWorkCrossings'],
          ['nativeInstrumentationCrossings', 'nativeInstrumentationCrossings'],
          ['nativeParses', 'nativeParses'],
          ['nativeSemanticBuilds', 'nativeSemanticBuilds'],
          ['nativeAstTraversals', 'nativeAstTraversals'],
          ['nativeRenders', 'nativeRenders'],
        ] as const)
          Object.assign(phaseExecution, {
            [field]: (counters[counter] ?? 0) - (phasePerformanceStart.counters[counter] ?? 0),
          });
        const operationDeltas: Record<string, number> = {};
        for (const [operation, count] of Object.entries(
          (metadata.performance as { nativeCrossingOperations: Record<string, number> })
            .nativeCrossingOperations,
        )) {
          const delta = count - (phasePerformanceStart.operations[operation] ?? 0);
          if (delta > 0) operationDeltas[operation] = delta;
        }
        Object.assign(phaseExecution, {
          nativeCrossingOperations: operationDeltas,
          retainedBytes: session.nativeMemoryBytes,
          codeChanged,
          mapChanged,
        });
      };
      const effectiveEdits: EditCommand[] = edits;
      if (effectiveEdits.length === 0) {
        if (phaseExecution) phaseExecution.render = 'unchanged';
        if (phaseExecution) phaseExecution.boundaryReason = 'no-edits';
        recordBoundaryReason('eliminatedBoundaryReasons', 'no-edits');
        if (observedVersion === currentVersion && canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
        } else {
          session.close();
          openSession = null;
        }
        finalizePhaseExecution(false, false);
        continue;
      }
      const nextPlan = phasePlan[phaseIndex + 1];
      // The edits address the resident source directly, so the commit renders
      // in the pipeline session: the new source and the map layer stay resident,
      // and the chain composes once at the end.
      const renderStarted = options.debugPerformance ? performance.now() : 0;
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
      if (phaseExecution) phaseExecution.resultingVersion = resultingVersion;
      // The rendered source stays resident; a following native phase reads it
      // without a crossing, and a following visitor phase materializes it lazily.
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
      if (!codeChanged && !mapChanged) {
        if (options.debugPerformance)
          (metadata.performance as { effectiveNoopTransactions: number })
            .effectiveNoopTransactions++;
        if (phaseExecution) {
          phaseExecution.render = 'unchanged';
          phaseExecution.boundaryReason = 'no-effective-byte-change';
        }
        recordBoundaryReason('eliminatedBoundaryReasons', 'no-effective-byte-change');
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
          openSession = session;
        } else {
          session.close();
          openSession = null;
        }
        finalizePhaseExecution(false, false);
        continue;
      }
      if (!codeChanged) {
        if (options.debugPerformance)
          (metadata.performance as { mapOnlyTransactions: number }).mapOnlyTransactions++;
        if (phaseExecution) {
          phaseExecution.render = 'committed';
          phaseExecution.boundaryReason = 'realized-map';
        }
        recordBoundaryReason('committedBoundaryReasons', 'realized-map');
        if (canReuseForNextPhase) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
          openSession = session;
        } else {
          session.close();
          openSession = null;
        }
        finalizePhaseExecution(false, true);
        continue;
      }
      const boundaryReason = isFinalPhase
        ? 'final-output'
        : nextPlan?.requiresRealizedMap
          ? 'realized-map'
          : pipeline.phases[phaseIndex + 1]?.native != null
            ? 'native-boundary'
            : nextPlan?.requiresPrintedInput
              ? 'printed-input'
              : nextPlan != null &&
                  hasSemanticDemand(
                    phaseArtifactDemand(
                      nextPlan.artifactDemand,
                      preparePhase(pipeline.phases[phaseIndex + 1]),
                    ),
                  )
                ? 'semantic-read-after-write'
                : 'ast-read-after-write';
      if (phaseExecution) {
        phaseExecution.render = 'committed';
        phaseExecution.boundaryReason = boundaryReason;
      }
      recordBoundaryReason('committedBoundaryReasons', boundaryReason);
      session.close();
      if (options.debugPerformance && phaseIndex + 1 < pipeline.phases.length) {
        const performance = metadata.performance as { reparses: number };
        performance.reparses++;
      }
      reusableRoutedBatch = null;
      openSession = null;
      finalizePhaseExecution(true, mapChanged);
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
    const finished = pipelineSession.finish(
      inputMap?.mappings,
      inputMap?.names,
      options.functionMap === true && sourceVersions.functionMap(currentVersion) == null,
    );
    sourceVersions.cacheRenderedText(currentVersion, finished.code);
    if (finished.functionMap != null) {
      sourceVersions.cacheFunctionMap(currentVersion, finished.functionMap);
      finalFunctionMapGeneratedInPipeline = true;
      finalFunctionMapPipelineMs = finished.functionMapMs ?? 0;
    }
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
