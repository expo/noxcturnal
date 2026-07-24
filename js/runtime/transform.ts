import { classifyForTransform, parserFilename, sourceHints } from '../adapters/classification.js';
import { selectParserAdapter } from '../adapters/registry.js';
import { compilePhasePlan, maxEditEffect } from '../pipeline/compile.js';
import type { CompiledRouteTemplate, PreparedPhase } from '../pipeline/types.js';
import {
  compileNestedVisitor,
  ContractVerifier,
  mergeFieldRequests,
  nestedManifest,
  preparePhase,
} from '../pipeline/routes.js';
import { Bailout, createDispatcher } from './dispatch.js';
import { createTransformMetadata, performanceCounters } from './metadata.js';
import { locationOffset } from './path.js';
import type { IntentRegistration } from './fragments.js';
import { native } from '../native/binding.js';
import { decodeRoutedEnvelope, type RoutedEventBatch } from '../protocol/events.js';
import { packRouteManifest } from '../protocol/manifest.js';
import type {
  Diagnostic,
  EditCommand,
  NativeBailoutResult,
  NativeTransformResult,
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

/** Execute a native pipeline synchronously. */
export function transform(
  source: string,
  filename: string,
  pipeline: NativePipeline,
  options: TransformOptions = {},
): TransformResult {
  const parser = classifyForTransform(parserFilename(filename, options.parser), source);
  if (!parser.supported) {
    const adapter = selectParserAdapter(options.parserAdapter, parser);
    if (adapter) return adapter.transform(source, filename, pipeline, options);
    const prepared: { plugin: NativePlugin<any, any>; state: any }[] = [];
    try {
      for (const phase of pipeline.phases)
        for (const plugin of phase.plugins) {
          const state = plugin.createState?.();
          prepared.push({ plugin, state });
          plugin.prepare?.(
            { filename, options, parser, sourceHints: sourceHints(source) },
            plugin.options as any,
          );
        }
      for (const { plugin, state } of prepared) plugin.cleanup?.('bailout', state);
      return { status: 'bailout', reason: parser.reason, source, diagnostics: [] };
    } catch (error) {
      for (const { plugin, state } of prepared) plugin.cleanup?.('error', state);
      throw error;
    }
  }
  const originalSource = source;
  const transformStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlanStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlan = compilePhasePlan(pipeline);
  const phasePlanMs = options.debugPerformance ? performance.now() - phasePlanStarted : 0;
  let phaseSource = source;
  const inputMap = options.inputSourceMap ?? null;
  let finalMap: NativeTransformResult['map'] | null = null;
  const metadata = createTransformMetadata(
    options.debugPerformance,
    phasePlan,
    Buffer.byteLength(source),
    phasePlanMs,
  );
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
  const preparedAhead = new Map<number, { source: string; prepared: PreparedPhase }>();
  let pendingEdits: EditCommand[] = [];
  let nativeFunctionMap: FunctionMap | null = null;
  const recordedParseCounts = new WeakMap<NativeTransformSession, number>();
  try {
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const observationSource =
        phasePlan[phaseIndex].observes === 'original' ? originalSource : phaseSource;
      if (reusableSession && reusableSession.source !== observationSource) {
        reusableSession.close();
        reusableSession = null;
        reusableRoutedBatch = null;
      }
      const edits: EditCommand[] = [];
      const preparationStarted = options.debugPerformance ? performance.now() : 0;
      const ahead = preparedAhead.get(phaseIndex);
      preparedAhead.delete(phaseIndex);
      const prepared =
        ahead?.source === observationSource
          ? ahead.prepared
          : preparePhase(phase, observationSource, filename, options, parser);
      if (options.debugPerformance)
        performanceCounters(metadata).phasePreparationMs += performance.now() - preparationStarted;
      const {
        activePlugins,
        plans,
        subscriptions,
        includeParent,
        includeScope,
        retentionCapabilities,
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
      const futureSubscriptions = new Set<string>();
      const futureRetentionRoutes: CompiledRouteTemplate[] = [];
      const structuralParentTypes = new Set(
        activePlugins.flatMap(plugin => Object.keys(plans.get(plugin)?.children ?? {})),
      );
      const retainedFields: Record<string, string[]> = {};
      for (const plugin of activePlugins)
        mergeFieldRequests(retainedFields, plans.get(plugin)?.fields ?? {});
      let futureRetentionCapabilities = 0;
      for (let futureIndex = phaseIndex + 1; futureIndex < pipeline.phases.length; futureIndex++) {
        if (phasePlan[futureIndex].requiresPrintedInput) break;
        const futureObservationSource =
          phasePlan[futureIndex].observes === 'original' ? originalSource : observationSource;
        if (futureObservationSource !== observationSource) continue;
        const futurePhase = pipeline.phases[futureIndex];
        const existingFuture = preparedAhead.get(futureIndex);
        const futurePrepared =
          existingFuture?.source === futureObservationSource
            ? existingFuture.prepared
            : preparePhase(futurePhase, futureObservationSource, filename, options, parser);
        preparedAhead.set(futureIndex, {
          source: futureObservationSource,
          prepared: futurePrepared,
        });
        for (const subscription of futurePrepared.subscriptions)
          futureSubscriptions.add(subscription);
        futureRetentionRoutes.push(...(futurePrepared.compiledRoutes ?? []));
        futureRetentionCapabilities |= futurePrepared.retentionCapabilities;
        for (const plugin of futurePrepared.activePlugins)
          for (const type of Object.keys(futurePrepared.plans.get(plugin)?.children ?? {}))
            structuralParentTypes.add(type);
        for (const plugin of futurePrepared.activePlugins)
          mergeFieldRequests(retainedFields, futurePrepared.plans.get(plugin)?.fields ?? {});
      }
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
      const retainedRoutes = [...compiledRoutes, ...futureRetentionRoutes].map((route, id) => ({
        ...route,
        id,
      }));
      const retentionManifest = packRouteManifest(
        retainedRoutes,
        includeParent,
        includeScope,
        retentionCapabilities | futureRetentionCapabilities,
        [...structuralParentTypes],
        retainedFields,
      );
      const retainedSession = reusableSession;
      const sessionStarted = options.debugPerformance ? performance.now() : 0;
      const session: NativeTransformSession =
        retainedSession ??
        new NativeTransformSession(
          observationSource,
          filename,
          options,
          requiresIndex ? retentionManifest : undefined,
          requiresIndex ? manifest : undefined,
          true,
        );
      if (options.debugPerformance)
        performanceCounters(metadata).sessionOpenMs += performance.now() - sessionStarted;
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
            const routedBuffer = native.materializeRoutedBuffer(
              observationSource,
              parserFilename(filename, options.parser),
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
          routeDeliveries: number;
          nodeRecords: number;
          payloadBytes: number;
          recordWords: number;
          utf8SlabBytes: number;
        };
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
      );
      if (options.debugPerformance)
        performanceCounters(metadata).dispatcherSetupMs += performance.now() - dispatcherStarted;
      for (const plugin of activePlugins) {
        const state = plugin.createState?.();
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
        const performance = metadata.performance as { nativeParses: number };
        performance.nativeParses += session.nativeParseCount - previous;
        recordedParseCounts.set(session, session.nativeParseCount);
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
      finalMap = native.composeDecodedChain(mapLayers);
      if (options.debugPerformance) {
        performanceCounters(metadata).renderAndMapMs += performance.now() - composeStarted;
        (metadata.performance as { mapEncodes: number }).mapEncodes++;
      }
    }
    // Input source maps compose once at the boundary where they enter.
    if (inputMap != null) {
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
    const functionMap = options.functionMap
      ? (nativeFunctionMap ??
        native.generateFunctionMap(originalSource, parserFilename(filename, options.parser)))
      : null;
    if (options.debugPerformance)
      performanceCounters(metadata).functionMapMs = performance.now() - functionMapStarted;
    if (options.debugPerformance)
      performanceCounters(metadata).totalMs = performance.now() - transformStarted;
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
