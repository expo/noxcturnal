import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
// Proxy observations follow the adopted loose own-property representation.
const cases = [
  {
    name: 'proxy forwarding exposes the backing private property',
    source: `const events=[]; class Value { #value=3; has(o) { return #value in o; } } const value=new Value(); const proxy=new Proxy(value,{getOwnPropertyDescriptor(t,k){events.push('descriptor');return Reflect.getOwnPropertyDescriptor(t,k)}}); globalThis.result=[value.has(proxy),events];`,
    native: [false, []],
    baseline: [true, ['descriptor']],
  },
  {
    name: 'revoked proxy rejects the loose own-property brand check',
    source: `class Value { #value; has(o) { return #value in o; } } const value=new Value(); const pair=Proxy.revocable(value,{}); pair.revoke(); let result; try { result=value.has(pair.proxy); } catch(error) { result=error.name; } globalThis.result=result;`,
    native: false,
    baseline: 'TypeError',
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.native);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let reference: string;
    let output: string;
    beforeAll(() => {
      reference = transformSync(entry.source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          [require('@babel/plugin-transform-class-properties'), { loose: true }],
          [require('@babel/plugin-transform-private-methods'), { loose: true }],
          [require('@babel/plugin-transform-private-property-in-object'), { loose: true }],
          require('@babel/plugin-transform-classes'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      output = compile(entry.source, {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      const syntax = /#value/;
      expect(entry.source).toMatch(syntax);
      expect(reference).not.toMatch(syntax);
      expect(output).not.toMatch(syntax);
    });
    test('Babel reference', () => {
      expect(run(reference)).toEqual(entry.baseline);
    });
    test('Noxcturnal preserves the reference boundary', () => {
      expect(run(output)).toEqual(entry.baseline);
    });
  });
});
