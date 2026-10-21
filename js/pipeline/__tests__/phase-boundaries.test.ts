import { expect, test } from 'vitest';
import {
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  type EditEffect,
} from '../../index';
import { ArtifactDemand, planArtifacts } from '../artifacts';

const effects: EditEffect[] = [
  'none',
  'text-only',
  'expression-shape',
  'bindings',
  'module-structure',
  'whole-program',
];

test.each(effects)(
  'aggregates %s with every lower edit effect independently of plugin order',
  effect => {
    const plugins = effects
      .slice(0, effects.indexOf(effect) + 1)
      .map(editEffect => defineNativePlugin({ name: `effect-audit-${editEffect}`, editEffect }));
    for (const ordered of [plugins, [...plugins].reverse()]) {
      const pipeline = defineNativePipeline({
        phases: [{ name: 'effect-audit', plugins: ordered }],
      });
      expect(compilePhasePlan(pipeline)[0].editEffect).toBe(effect);
      const overridden = defineNativePipeline({
        phases: [{ name: 'effect-audit', plugins: ordered, editEffect: 'none' }],
      });
      expect(compilePhasePlan(overridden)[0].editEffect).toBe('none');
    }
  },
);

test('rejects an invalid plugin effect even when the phase overrides it', () => {
  const plugin = defineNativePlugin({
    name: 'invalid-plugin-effect-audit',
    editEffect: 'sometimes' as EditEffect,
  });
  expect(() =>
    compilePhasePlan(
      defineNativePipeline({
        phases: [{ name: 'invalid-effect-audit', plugins: [plugin], editEffect: 'none' }],
      }),
    ),
  ).toThrow(/invalid-plugin-effect-audit: invalid edit effect sometimes/);
});

test('fresh semantics require scopes, syntax and rendered input across printed and map boundaries', () => {
  for (const requiresPrintedInput of [false, true]) {
    for (const requiresRealizedMap of [false, true]) {
      const [plan] = compilePhasePlan(
        defineNativePipeline({
          phases: [
            {
              name: 'fresh-semantics-audit',
              plugins: [],
              requiresFreshSemantics: true,
              requiresPrintedInput,
              requiresRealizedMap,
            },
          ],
        }),
      );
      const prerequisites =
        ArtifactDemand.LexicalScopes | ArtifactDemand.SyntaxRoute | ArtifactDemand.RenderedText;
      expect(plan.artifactDemand).toBe(
        prerequisites | (requiresRealizedMap ? ArtifactDemand.RealizedMap : 0),
      );
      expect(plan.requiresFreshSemantics).toBe(true);
      expect(planArtifacts(plan.artifactDemand)).toBe('retained-semantic');
      expect(planArtifacts(plan.artifactDemand, prerequisites)).toBe(
        requiresRealizedMap ? 'render-and-map' : 'cached',
      );
    }
  }
});
