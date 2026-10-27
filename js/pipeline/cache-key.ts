import { createHash } from 'node:crypto';

import { classifyForTransform, parserFilename } from '../adapters/classification';
import { parserAdapterCacheDescriptor } from '../adapters/registry';
import type { DefinedVisitor, NativePipeline } from '../contracts/visitor';
import { nativeFlowErasureBuilt } from '../native/binding';
import type { TransformOptions } from '../types';
import { compilePhasePlan } from './compile';

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
        contract: plugin.contract ?? null,
        visitors: (plugin.visitors ?? []).map(visitorDescriptor),
      })),
    })),
  };
  return createHash('sha256').update(stableJson(descriptor)).digest('hex');
}

function visitorDescriptor(visitor: DefinedVisitor<any>): unknown {
  const contract = visitor.contract;
  return {
    route: visitor.route,
    fields: contract.fields,
    comments: contract.comments,
    where: contract.where ?? null,
    selector: visitor.selector ?? null,
    scope: contract.scope,
    ancestry: contract.ancestry ?? null,
    children: contract.children ?? null,
    controlFlow: contract.controlFlow,
    nested: contract.nested.map(visitorDescriptor),
    enter: visitor.enter != null,
    exit: visitor.exit != null,
  };
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

/** Canonical, type-tagged configuration encoding; unlike JSON it preserves JS scalars. */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    let encoded = 'a[';
    for (let index = 0; index < value.length; index++) {
      if (index > 0) encoded += ',';
      encoded += Object.hasOwn(value, index) ? stableJson(value[index]) : 'hole';
    }
    return encoded + ']';
  }
  if (value && typeof value === 'object') {
    let encoded = 'o{';
    const keys = Object.keys(value).sort();
    for (let index = 0; index < keys.length; index++) {
      if (index > 0) encoded += ',';
      const key = keys[index];
      encoded += `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`;
    }
    return encoded + '}';
  }
  if (typeof value === 'number') return `n:${Object.is(value, -0) ? '-0' : String(value)}`;
  return `${typeof value}:${JSON.stringify(value)}`;
}
