import { createHash } from 'node:crypto';

import { classifyForTransform, parserFilename } from '../adapters/classification.js';
import type { NativePipeline } from '../contracts/visitor.js';
import type { TransformOptions } from '../types.js';
import { compilePhasePlan } from './compile.js';

export function pipelineCacheKey(
  pipeline: NativePipeline,
  filename: string,
  options: TransformOptions = {},
): string {
  const descriptor = {
    filename,
    options,
    phaseGraph: compilePhasePlan(pipeline),
    phases: pipeline.phases.map(phase => ({
      name: phase.name,
      observes: phase.observes,
      editEffect: phase.editEffect,
      requiresPrintedInput: phase.requiresPrintedInput,
      requiresFreshSemantics: phase.requiresFreshSemantics,
      requiresRealizedMap: phase.requiresRealizedMap,
      plugins: phase.plugins.map(plugin => ({
        name: plugin.name,
        editEffect: plugin.editEffect,
        options: plugin.options ?? null,
      })),
    })),
  };
  return createHash('sha256').update(stableJson(descriptor)).digest('hex');
}

export function transformClassificationCacheKey(
  pipeline: NativePipeline,
  filename: string,
  source: string,
  options: TransformOptions = {},
): string {
  const classification = classifyForTransform(parserFilename(filename, options.parser), source);
  return createHash('sha256')
    .update(
      stableJson({
        pipeline: pipelineCacheKey(pipeline, filename, options),
        classification: {
          syntax: classification.syntax,
          supported: classification.supported,
          codegenCandidate: classification.codegenCandidate,
          reason: classification.reason,
        },
      }),
    )
    .digest('hex');
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
