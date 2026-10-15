import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  ['repeated var', 'var value=3;var value;globalThis.result=value;', true],
  ['var loop head', 'var value=3;for(var value of []){}globalThis.result=value;', true],
  ['function then var', 'function value(){return 3}var value;globalThis.result=value();', true],
  ['many redeclarations', `var value=3;${'var value;'.repeat(1000)}globalThis.result=value;`, true],
  [
    'initialized redeclarations',
    'var value=1;var value=3;var value;globalThis.result=value;',
    true,
  ],
  [
    'reference before declaration',
    'function read(){return value}var value=3;globalThis.result=read();',
    true,
  ],
  [
    'separate scoped redeclarations',
    'var value=3;function shadow(){var value=9;var value;return value}var value;globalThis.result=value+shadow()-9;',
    true,
  ],
  ['assignment shorthand', 'let value;({value}={value:3});globalThis.result=value;', false],
  ['assignment default', 'let value;({value=9}={value:3});globalThis.result=value;', false],
  ['assignment explicit', 'let value;({key:value}={key:3});globalThis.result=value;', false],
] as const;
function run(source: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', source)(context);
  return context.result;
}
describe.each(cases)('%s', (_name, source, fails) => {
  let code: string, babel: string;
  beforeAll(() => {
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
    code = result.code;
    expect(code).not.toBe(source);
    babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        () => ({
          visitor: {
            Program(path: NodePath) {
              path.scope.rename('value', 'renamed');
            },
          },
        }),
      ],
    })!.code!;
  });
  test('original binding control', () => expect(run(source)).toBe(3));
  test('Babel rename control', () => expect(run(babel)).toBe(3));
  (fails ? test : test)('rename preserves all declarations of one binding', () =>
    expect(run(code)).toBe(3),
  );
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
