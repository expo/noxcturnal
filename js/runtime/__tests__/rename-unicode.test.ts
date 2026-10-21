import { expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
const source = 'const value=3; globalThis.result=value;';
function run(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
test.each(['π', '变量', 'a\u0301', '𐐀', 'renamed'])(
  'rename to %s preserves the binding value',
  name => {
    const plugin = defineNativePlugin({
      name: 'rename-unicode',
      pre(context) {
        expect(context.code.identifier(name).code).toBe(name);
      },
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename('value', name);
        }),
      ],
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(run(result.code)).toBe(3);
  },
);
