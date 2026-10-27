import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test.each([false, true])(
  'first and repeated deliveries preserve route-local capabilities (analyze=%s)',
  checked => {
    const visits: string[] = [];
    let bound = true;
    const pipeline = defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [
            defineNativePlugin({
              name: 'selective-routes',
              analyze: checked ? () => ({ status: 'supported', analysis: undefined }) : undefined,
              visitors: [
                defineVisitor('Identifier', { where: { name: { equals: 'missing' } } }, () => {
                  throw new Error('Unmatched route delivered');
                }),
                defineVisitor(
                  'Identifier',
                  { fields: ['name'], where: { name: { equals: 'value' } } },
                  path => {
                    expect(path.node.name).toBe('value');
                    expect(() => (path as unknown as { scope: unknown }).scope).toThrow(/scope/);
                    visits.push('restricted');
                  },
                ),
                defineVisitor(
                  'Identifier',
                  { fields: ['name'], scope: true, where: { name: { equals: 'value' } } },
                  path => {
                    expect(path.node.name).toBe('value');
                    expect(path.scope.hasBinding('value')).toBe(bound);
                    visits.push('scoped');
                  },
                ),
              ],
            }),
          ],
        },
      ],
    });
    for (const [filename, source, hasBinding] of [
      ['first.js', 'const value=1;value;value;', true],
      ['second.js', 'value;value;value;', false],
    ] as const) {
      bound = hasBinding;
      visits.length = 0;
      const result = transform(source, filename, pipeline);
      expect(result.status).toBe('complete');
      if (result.status === 'complete') expect(result.code).toBe(source);
      expect(visits).toEqual([
        'restricted',
        'scoped',
        'restricted',
        'scoped',
        'restricted',
        'scoped',
      ]);
    }
  },
);

test('empty main delivery tapes preserve explicit pre-hook replays and lifecycle effects', () => {
  const events: string[] = [];
  const nested = [
    defineVisitor('NumericLiteral', { fields: ['value'] }, (path, state: string) => {
      expect(path.node.value).toBe(1);
      expect(state).toBe('nested-state');
      events.push('nested');
    }),
  ];
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'scan',
        plugins: [
          defineNativePlugin({
            name: 'empty-main-tape',
            pre(context) {
              events.push('pre');
              context.revisitProgram(nested, 'nested-state');
            },
            visitors: [
              defineVisitor(
                'Identifier',
                {
                  where: { name: { equals: 'missing' } },
                  controlFlow: ['dynamic-subscriptions'],
                  nested,
                },
                () => {
                  throw new Error('Unmatched main route delivered');
                },
              ),
            ],
            post() {
              events.push('post');
            },
            cleanup(reason) {
              events.push(`cleanup:${reason}`);
            },
          }),
        ],
      },
    ],
  });
  for (const filename of ['first.js', 'second.js']) {
    events.length = 0;
    const result = transform('1;', filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status === 'complete') expect(result.code).toBe('1;');
    expect(events).toEqual(['pre', 'nested', 'post', 'cleanup:complete']);
  }
});
