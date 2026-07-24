import type { CompiledPhasePlan } from '../contracts/visitor.js';

export interface PerformanceAllocationCounters {
  pathFacades: number;
  nodeFacades: number;
  snapshots: number;
  scopeFacades: number;
  phasePreparationMs: number;
  sessionOpenMs: number;
  nativeAndDecodeMs: number;
  nativeTransformMs: number;
  dispatcherSetupMs: number;
  dispatchMs: number;
  pathConstructionMs: number;
  callbackMs: number;
  renderAndMapMs: number;
  functionMapMs: number;
  totalMs: number;
}

export function createTransformMetadata(
  debugPerformance: boolean | undefined,
  phases: readonly CompiledPhasePlan[],
  sourceBytes: number,
  phasePlanMs: number,
): Record<string, unknown> {
  if (!debugPerformance) return {};
  return {
    performance: {
      phases,
      phaseExecutions: [],
      reparses: 0,
      nativeParses: 0,
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
      sourceBytes,
      phasePlanMs,
      phasePreparationMs: 0,
      sessionOpenMs: 0,
      nativeAndDecodeMs: 0,
      nativeTransformMs: 0,
      dispatcherSetupMs: 0,
      dispatchMs: 0,
      pathConstructionMs: 0,
      callbackMs: 0,
      renderAndMapMs: 0,
      functionMapMs: 0,
      totalMs: 0,
    },
  };
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
