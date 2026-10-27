import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test.each([undefined, null, false, 0, '', { value: 42 }])(
  'mixed lifecycle analysis preserves %j and implicit support across files',
  analysis => {
    const events: string[] = [];
    const apply = (label: string, value: unknown, expected: unknown) => {
      expect(value).toBe(expected);
      events.push(`apply:${label}`);
    };
    const visitor = (label: string) => [
      defineVisitor('Program', {}, () => {
        events.push(`visit:${label}`);
      }),
    ];
    const pipeline = defineNativePipeline({
      phases: [
        {
          name: 'analyze',
          plugins: [
            defineNativePlugin({
              name: 'implicit',
              apply: (_context, value) => apply('implicit', value, undefined),
              visitors: visitor('implicit'),
            }),
            defineNativePlugin({
              name: 'void',
              analyze() {
                events.push('analyze:void');
              },
              apply: (_context, value) => apply('void', value, undefined),
              visitors: visitor('void'),
            }),
            defineNativePlugin({
              name: 'irrelevant',
              analyze() {
                events.push('analyze:irrelevant');
                return { status: 'irrelevant' };
              },
              apply() {
                throw new Error('Irrelevant plugin applied');
              },
              visitors: visitor('irrelevant'),
              post() {
                events.push('post:irrelevant');
              },
            }),
            defineNativePlugin({
              name: 'supported',
              analyze() {
                events.push('analyze:supported');
                return { status: 'supported', analysis };
              },
              apply: (_context, value) => apply('supported', value, analysis),
              visitors: visitor('supported'),
            }),
          ],
        },
      ],
    });
    for (const filename of ['first.js', 'second.js']) {
      events.length = 0;
      const result = transform('0;', filename, pipeline);
      expect(result.status).toBe('complete');
      if (result.status === 'complete') expect(result.code).toBe('0;');
      expect(events).toEqual([
        'analyze:void',
        'analyze:irrelevant',
        'analyze:supported',
        'apply:implicit',
        'apply:void',
        'apply:supported',
        'visit:implicit',
        'visit:void',
        'visit:supported',
        'post:irrelevant',
      ]);
    }
  },
);

test('reentrant transforms keep analysis decisions local to their own invocation', () => {
  const applied: string[] = [];
  const plugin = defineNativePlugin({
    name: 'reentrant-analysis',
    analyze(context) {
      if (context.filename === 'outer.js')
        expect(transform('inner;', 'inner.js', pipeline).status).toBe('complete');
      return { status: 'supported', analysis: context.filename };
    },
    apply(context, analysis) {
      expect(analysis).toBe(context.filename);
      applied.push(context.filename);
    },
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] });
  expect(transform('outer;', 'outer.js', pipeline).status).toBe('complete');
  expect(applied).toEqual(['inner.js', 'outer.js']);
});
