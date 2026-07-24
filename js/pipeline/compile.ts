import type { EditEffect, PhaseObservation } from '../types.js';
import type { CompiledPhasePlan, NativePipeline } from '../contracts/visitor.js';

const EDIT_EFFECT_RANK: Readonly<Record<EditEffect, number>> = {
  none: 0,
  'text-only': 1,
  'expression-shape': 2,
  bindings: 3,
  'module-structure': 4,
  'whole-program': 5,
};
export const EDIT_EFFECTS = new Set<EditEffect>(Object.keys(EDIT_EFFECT_RANK) as EditEffect[]);
const PHASE_OBSERVATIONS = new Set<PhaseObservation>([
  'original',
  'current-ast',
  'rendered-source',
]);

export function maxEditEffect(effects: readonly EditEffect[]): EditEffect {
  let selected: EditEffect = 'none';
  for (const effect of effects)
    if (EDIT_EFFECT_RANK[effect] > EDIT_EFFECT_RANK[selected]) selected = effect;
  return selected;
}

/** Compile conservative phase boundaries without parsing a source file. */
export function compilePhasePlan(pipeline: NativePipeline): readonly CompiledPhasePlan[] {
  let previousEffect: EditEffect = 'none';
  return Object.freeze(
    pipeline.phases.map((phase, index) => {
      if (phase.observes != null && !PHASE_OBSERVATIONS.has(phase.observes))
        throw new Error(`${phase.name}: invalid phase observation ${String(phase.observes)}`);
      if (phase.editEffect != null && !EDIT_EFFECTS.has(phase.editEffect))
        throw new Error(`${phase.name}: invalid edit effect ${String(phase.editEffect)}`);
      for (const plugin of phase.plugins)
        if (plugin.editEffect != null && !EDIT_EFFECTS.has(plugin.editEffect))
          throw new Error(`${plugin.name}: invalid edit effect ${String(plugin.editEffect)}`);
      const observes =
        phase.observes ?? (phase.requiresPrintedInput ? 'rendered-source' : 'current-ast');
      const editEffect =
        phase.editEffect ??
        maxEditEffect(phase.plugins.map(plugin => plugin.editEffect ?? 'whole-program'));
      const boundaryBefore =
        index > 0 &&
        (observes === 'rendered-source' ||
          previousEffect === 'whole-program' ||
          (EDIT_EFFECT_RANK[previousEffect] >= EDIT_EFFECT_RANK.bindings &&
            phase.requiresFreshSemantics !== false));
      const requiresPrintedInput =
        phase.requiresPrintedInput === true || observes === 'rendered-source';
      const requiresFreshSemantics =
        phase.requiresFreshSemantics ??
        (index > 0 && EDIT_EFFECT_RANK[previousEffect] >= EDIT_EFFECT_RANK.bindings);
      const plan = Object.freeze({
        name: phase.name,
        observes,
        editEffect,
        requiresPrintedInput,
        requiresFreshSemantics,
        requiresRealizedMap: phase.requiresRealizedMap === true,
        boundaryBefore,
        canReuseAst:
          !boundaryBefore &&
          (previousEffect === 'none' ||
            (previousEffect === 'text-only' && observes !== 'rendered-source')),
        canDeferRendering:
          editEffect === 'none' ||
          (editEffect === 'text-only' &&
            !phase.requiresRealizedMap &&
            observes !== 'rendered-source'),
      });
      previousEffect = editEffect;
      return plan;
    }),
  );
}
