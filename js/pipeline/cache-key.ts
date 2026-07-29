import { createHash } from 'node:crypto';

import { classifyForTransform, parserFilename } from '../adapters/classification.js';
import { parserAdapterCacheDescriptor } from '../adapters/registry.js';
import type { NativePipeline } from '../contracts/visitor.js';
import { nativeFlowErasureBuilt } from '../native/binding.js';
import type { TransformOptions } from '../types.js';
import { compilePhasePlan } from './compile.js';

export function pipelineCacheKey(
  pipeline: NativePipeline,
  filename: string,
  options: TransformOptions = {},
): string {
  const { pluginData: _pluginData, ...serializableOptions } = options;
  const descriptor = {
    filename,
    options: serializableOptions,
    parserAdapter: parserAdapterCacheDescriptor(options.parserAdapter),
    phaseGraph: compilePhasePlan(pipeline),
    phases: pipeline.phases.map(phase => ({
      name: phase.name,
      editEffect: phase.editEffect,
      requiresPrintedInput: phase.requiresPrintedInput,
      requiresFreshSemantics: phase.requiresFreshSemantics,
      requiresRealizedMap: phase.requiresRealizedMap,
      native: phase.native ?? null,
      plugins: (phase.plugins ?? []).map(plugin => ({
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
        parserAdapter: parserAdapterCacheDescriptor(options.parserAdapter, classification),
        // A Flow file's output depends on whether this binary can erase it
        // natively, and two builds of the same package version can differ on
        // that. Only asked when it can matter.
        flowErasure: classification.syntax === 'flow' ? nativeFlowErasureBuilt() : null,
      }),
    )
    .digest('hex');
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
