import { beforeAll, describe, expect, test } from 'vitest';
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
      (mode === 'none' ? test : test.fails)('delivers each matching visitor exactly once', () => {
        expect(seen.filter(value => value === 'all:inner')).toHaveLength(1);
        expect(seen.filter(value => value === 'filtered:inner')).toHaveLength(1);
      });
    },
  );
