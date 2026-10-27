import { beforeAll, describe, expect, test, vi } from 'vitest';
import { NativeTransformSession } from '../session';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const reversed of [false, true])
  describe.each(['none', 'within', 'scope', 'remaining'] as const)(
    `reversed=${reversed}: %s`,
    mode => {
      let seen: string[];
      beforeAll(() => {
        seen = [];
        let calls = 0;
        const routes = [
          defineVisitor(
            'Identifier',
            {
              fields: ['name'],
              where: { name: { equals: 'inner' } },
              controlFlow: ['dynamic-subscriptions'],
            },
            path => seen.push(`filtered:${path.node.name}`),
          ),
          defineVisitor(
            'Identifier',
            { fields: ['name'], controlFlow: ['dynamic-subscriptions'] },
            path => seen.push(`all:${path.node.name}`),
          ),
        ];
        const plugin = defineNativePlugin({
          name: 'subscription-route',
          visitors: [
            defineVisitor('CallExpression', { controlFlow: ['dynamic-subscriptions'] }, path => {
              calls++;
              if (mode === 'within') path.subscribeWithin('Identifier');
              if (mode === 'scope') path.subscribeForScope('Identifier');
              if (mode === 'remaining') path.context.subscribeRemaining('Identifier');
            }),
            ...(reversed ? routes.reverse() : routes),
          ],
        });
        expect(
          transform(
            'within(inner);',
            'input.js',
            defineNativePipeline({
              phases: [{ name: 'scan', plugins: [plugin] }],
            }),
          ).status,
        ).toBe('complete');
        expect(calls).toBe(1);
        expect(seen.filter(value => value === 'all:within')).toHaveLength(1);
      });
      test('delivers each matching visitor exactly once', () => {
        expect(seen.filter(value => value === 'all:inner')).toHaveLength(1);
        expect(seen.filter(value => value === 'filtered:inner')).toHaveLength(1);
      });
    },
  );

for (const ancestry of [false, true]) {
  test(`followup parent summaries follow the ancestry contract: ${ancestry}`, () => {
    const next = vi.spyOn(NativeTransformSession.prototype, 'nextRoutedPacked');
    const names: string[] = [];
    try {
      const plugin = defineNativePlugin({
        name: 'followup-structural-data',
        visitors: [
          defineVisitor('Program', { controlFlow: ['dynamic-subscriptions'] }, path => {
            path.subscribeWithin('Identifier');
          }),
          defineVisitor(
            'Identifier',
            {
              fields: ['name'],
              ancestry: ancestry ? { mode: 'parent', routes: {} } : undefined,
            },
            path => names.push(path.node.name),
          ),
        ],
      });
      const result = transform(
        'first; second;',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'scan', plugins: [plugin] }],
        }),
      );
      expect(result.status).toBe('complete');
      expect(names).toEqual(['first', 'second']);
      const batch = next.mock.results.at(-1)?.value;
      expect(batch.includeParent).toBe(ancestry);
      expect(batch.includeScope).toBe(true);
      if (!ancestry) expect(batch.parentSummaries.length).toBe(0);
    } finally {
      next.mockRestore();
    }
  });
}
