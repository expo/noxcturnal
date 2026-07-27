import type { CompiledPhasePlan } from '../contracts/visitor.js';

export interface PerformanceAllocationCounters {
  pathFacades: number;
  nodeFacades: number;
  snapshots: number;
  scopeFacades: number;
  nativeRetainedBytesPeak: number;
  processRssStartBytes: number;
  processRssEndBytes: number;
  processRssPeakObservedBytes: number;
  processHeapUsedStartBytes: number;
  processHeapUsedEndBytes: number;
  processHeapUsedPeakObservedBytes: number;
  nativeCrossings: number;
  nativeWorkCrossings: number;
  nativeInstrumentationCrossings: number;
  nativeCrossingOperations: Record<string, number>;
  classificationMs: number;
  phasePreparationMs: number;
  sessionOpenMs: number;
  nativeAndDecodeMs: number;
  nativeTransformMs: number;
  nativeParseMs: number;
  nativeSemanticBuildMs: number;
  nativeCustomRewriteMs: number;
  nativeOxcTransformMs: number;
  nativeOptimizationMs: number;
  nativeCodegenAndMapMs: number;
  nativeHelperDiscoveryMs: number;
  nativeHelperMaterializationMs: number;
  dispatcherSetupMs: number;
  dispatchMs: number;
  pathConstructionMs: number;
  callbackMs: number;
  renderAndMapMs: number;
  functionMapMs: number;
  totalMs: number;
  overallMs: number;
}

export function createTransformMetadata(
  debugPerformance: boolean | undefined,
  phases: readonly CompiledPhasePlan[],
  sourceBytes: number,
  phasePlanMs: number,
): Record<string, unknown> {
  if (!debugPerformance) return {};
  const memory = process.memoryUsage();
  return {
    performance: {
      phases,
      phaseExecutions: [],
      reparses: 0,
      nativeParses: 0,
      nativeSemanticBuilds: 0,
      nativeRenders: 0,
      nativeAstTraversals: 0,
      nativeCrossings: 0,
      nativeWorkCrossings: 0,
      nativeInstrumentationCrossings: 0,
      nativeCrossingOperations: {},
      javascriptBatches: 0,
      routeDeliveries: 0,
      nodeRecords: 0,
      payloadBytes: 0,
      recordWords: 0,
      utf8SlabBytes: 0,
      mappingSegments: 0,
      mapEncodes: 0,
      editCount: 0,
      convergentEditsDeduped: 0,
      renderedBytes: 0,
      pathFacades: 0,
      nodeFacades: 0,
      snapshots: 0,
      scopeFacades: 0,
      nativeRetainedBytesPeak: 0,
      processRssStartBytes: memory.rss,
      processRssEndBytes: memory.rss,
      processRssPeakObservedBytes: memory.rss,
      processHeapUsedStartBytes: memory.heapUsed,
      processHeapUsedEndBytes: memory.heapUsed,
      processHeapUsedPeakObservedBytes: memory.heapUsed,
      classificationMs: 0,
      sourceBytes,
      phasePlanMs,
      phasePreparationMs: 0,
      sessionOpenMs: 0,
      nativeAndDecodeMs: 0,
      nativeTransformMs: 0,
      nativeParseMs: 0,
      nativeSemanticBuildMs: 0,
      nativeCustomRewriteMs: 0,
      nativeOxcTransformMs: 0,
      nativeOptimizationMs: 0,
      nativeCodegenAndMapMs: 0,
      nativeHelperDiscoveryMs: 0,
      nativeHelperMaterializationMs: 0,
      dispatcherSetupMs: 0,
      dispatchMs: 0,
      pathConstructionMs: 0,
      callbackMs: 0,
      renderAndMapMs: 0,
      functionMapMs: 0,
      totalMs: 0,
      overallMs: 0,
    },
  };
}

export function recordNativeCrossing(
  metadata: Record<string, unknown>,
  operation: string,
  instrumentation = false,
): void {
  const counters = performanceCounters(metadata);
  counters.nativeCrossings++;
  if (instrumentation) counters.nativeInstrumentationCrossings++;
  else counters.nativeWorkCrossings++;
  counters.nativeCrossingOperations[operation] =
    (counters.nativeCrossingOperations[operation] ?? 0) + 1;
}

export function sampleProcessMemory(metadata: Record<string, unknown>): void {
  const counters = performanceCounters(metadata);
  const memory = process.memoryUsage();
  counters.processRssEndBytes = memory.rss;
  counters.processRssPeakObservedBytes = Math.max(counters.processRssPeakObservedBytes, memory.rss);
  counters.processHeapUsedEndBytes = memory.heapUsed;
  counters.processHeapUsedPeakObservedBytes = Math.max(
    counters.processHeapUsedPeakObservedBytes,
    memory.heapUsed,
  );
}

export function performanceCounters(
  metadata: Record<string, unknown>,
): PerformanceAllocationCounters {
  return metadata.performance as PerformanceAllocationCounters;
}

export function optionsPerformance(
  metadata: Record<string, unknown>,
): PerformanceAllocationCounters | undefined {
  return metadata.performance as PerformanceAllocationCounters | undefined;
}
