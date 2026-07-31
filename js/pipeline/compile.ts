import type { EditEffect } from '../types';
import type { CompiledPhasePlan, NativePipeline } from '../contracts/visitor';
import { ArtifactDemand, closeArtifactDemand } from './artifacts';

const EDIT_EFFECT_RANK: Readonly<Record<EditEffect, number>> = {
  none: 0,
  'text-only': 1,
  'expression-shape': 2,
  bindings: 3,
  'module-structure': 4,
  'whole-program': 5,
};
export const EDIT_EFFECTS = new Set<EditEffect>(Object.keys(EDIT_EFFECT_RANK) as EditEffect[]);
export function maxEditEffect(effects: readonly EditEffect[]): EditEffect {
  let selected: EditEffect = 'none';
  for (const effect of effects)
    if (EDIT_EFFECT_RANK[effect] > EDIT_EFFECT_RANK[selected]) selected = effect;
  return selected;
}

/** Pipelines are interned structurally, so their compiled phase boundaries are a
 * property of the pipeline object rather than per-file work. */
const compiledPipelinePlans = new WeakMap<NativePipeline, readonly CompiledPhasePlan[]>();

/** Compile conservative phase boundaries without parsing a source file. */
export function compilePhasePlan(pipeline: NativePipeline): readonly CompiledPhasePlan[] {
  const cached = compiledPipelinePlans.get(pipeline);
  if (cached != null) return cached;
  const compiled = computePhasePlan(pipeline);
  compiledPipelinePlans.set(pipeline, compiled);
  return compiled;
}

function computePhasePlan(pipeline: NativePipeline): readonly CompiledPhasePlan[] {
  return Object.freeze(
    pipeline.phases.map(phase => {
      if (phase.editEffect != null && !EDIT_EFFECTS.has(phase.editEffect))
        throw new Error(`${phase.name}: invalid edit effect ${String(phase.editEffect)}`);
      const plugins = phase.plugins ?? [];
      for (const plugin of plugins)
        if (plugin.editEffect != null && !EDIT_EFFECTS.has(plugin.editEffect))
          throw new Error(`${plugin.name}: invalid edit effect ${String(plugin.editEffect)}`);
      const editEffect =
        phase.editEffect ??
        (phase.native == null
          ? maxEditEffect(plugins.map(plugin => plugin.editEffect ?? 'whole-program'))
          : 'whole-program');
      const requiresPrintedInput = phase.native != null || phase.requiresPrintedInput === true;
      const requiresFreshSemantics = phase.requiresFreshSemantics === true;
      let artifactDemand =
        phase.native != null
          ? ArtifactDemand.RenderedText | ArtifactDemand.SyntaxRoute
          : requiresPrintedInput
            ? ArtifactDemand.RenderedText
            : ArtifactDemand.SyntaxRoute;
      if (phase.requiresRealizedMap) artifactDemand |= ArtifactDemand.RealizedMap;
      if (requiresFreshSemantics) artifactDemand |= ArtifactDemand.LexicalScopes;
      artifactDemand = closeArtifactDemand(artifactDemand);
      const plan = Object.freeze({
        name: phase.name,
        editEffect,
        requiresPrintedInput,
        requiresFreshSemantics,
        requiresRealizedMap: phase.requiresRealizedMap === true,
        artifactDemand,
      });
      return plan;
    }),
  );
}
