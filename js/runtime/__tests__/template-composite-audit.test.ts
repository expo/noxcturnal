import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import type { Code } from '../../contracts/visitor';

const values: { name: string; value: Code; fails: boolean }[] = [
  { name: 'text-only composite', value: { kind: 'composite', parts: ['3'] }, fails: true },
  {
    name: 'mixed composite',
    value: { kind: 'composite', parts: ['1', { code: '+2', mapping: 'sourceless' }] },
    fails: true,
  },
  { name: 'ordinary code fragment', value: { code: '3', mapping: 'sourceless' }, fails: false },
];
describe.each(values)('$name', entry => {
  let actual: unknown;
  let direct: unknown;
  beforeAll(() => {
    function compile(template: boolean) {
      const plugin = defineNativePlugin({
        name: 'template-composite-audit',
        visitors: [
          defineVisitor('NumericLiteral', {}, path => {
            path.replaceWith(template ? path.context.code.template`[${entry.value}]` : entry.value);
          }),
        ],
      });
      const result = transform(
        'globalThis.result=0;',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'replace', plugins: [plugin] }],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      const context: Record<string, unknown> = {};
      new Function('globalThis', result.code)(context);
      return context.result;
    }
    direct = compile(false);
    actual = compile(true);
  });
  test('direct replacement accepts the same fragment', () => expect(direct).toBe(3));
  test('template preserves all supported fragment content', () => {
    expect(actual).toEqual([3]);
  });
});
