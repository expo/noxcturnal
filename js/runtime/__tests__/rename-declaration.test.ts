import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  { name: 'repeated var', source: 'var value=3;var value;globalThis.result=value;' },
  { name: 'var loop head', source: 'var value=3;for(var value of []){}globalThis.result=value;' },
  {
    name: 'function then var',
    source: 'function value(){return 3}var value;globalThis.result=value();',
  },
  {
    name: 'many redeclarations',
    source: `var value=3;${'var value;'.repeat(1000)}globalThis.result=value;`,
  },
  {
    name: 'initialized redeclarations',
    source: 'var value=1;var value=3;var value;globalThis.result=value;',
  },
  {
    name: 'reference before declaration',
    source: 'function read(){return value}var value=3;globalThis.result=read();',
  },
  {
    name: 'separate scoped redeclarations',
    source:
      'var value=3;function shadow(){var value=9;var value;return value}var value;globalThis.result=value+shadow()-9;',
  },
  {
    name: 'assignment shorthand',
    source: 'let value;({value}={value:3});globalThis.result=value;',
  },
  {
    name: 'assignment default',
    source: 'let value;({value=9}={value:3});globalThis.result=value;',
  },
  {
    name: 'assignment explicit',
    source: 'let value;({key:value}={key:3});globalThis.result=value;',
  },
];
function run(source: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', source)(context);
  return context.result;
}
test.each(cases)('rename preserves $name binding and returns 3', ({ source }) => {
  const plugin = defineNativePlugin({
    name: 'rename-declaration',
    visitors: [
      defineVisitor('Program', { scope: true }, path => {
        path.scope.rename('value', 'renamed');
      }),
    ],
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  const code = result.code;
  expect(code).not.toBe(source);
  expect(run(code), 'native rename').toBe(3);
});

test('the public binding view keeps the latest declaration after redeclarations', () => {
  const source = '/*😀*/var value=1;var value;var value=3;globalThis.result=value';
  const plugin = defineNativePlugin({
    name: 'representative-declaration',
    visitors: [
      defineVisitor('Program', { scope: true }, path => {
        expect(path.scope.getBinding('value')!.declaration!.start).toBe(
          source.indexOf('var value=3') + 4,
        );
        path.scope.rename('value', 'renamed');
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
});
