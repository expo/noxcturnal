import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const configs = [
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
];
const cases = [
  {
    name: 'nested object and outer rest',
    source:
      'let a,inner,outer;({nested:{a,...inner},...outer}={nested:{a:1,b:2},c:3});globalThis.result=[a,inner,outer];',
    expected: [1, { b: 2 }, { c: 3 }],
    strict: [1, { nested: { a: 1, b: 2 }, c: 3 }, { c: 3 }],
  },
  {
    name: 'nested array and outer rest',
    source:
      'let a,inner,outer;({nested:[{a,...inner}],...outer}={nested:[{a:1,b:2}],c:3});globalThis.result=[a,inner,outer];',
    expected: [1, { b: 2 }, { c: 3 }],
    strict: [1, { b: 2 }, { c: 3 }],
  },
  {
    name: 'nested object without outer rest',
    source:
      'let a,inner;({nested:{a,...inner}}={nested:{a:1,b:2},c:3});globalThis.result=[a,inner];',
    expected: [1, { b: 2 }],
    strict: [1, { b: 2 }],
  },
  {
    name: 'consumed nested assignment without outer rest',
    source:
      'let a,inner;const source={nested:{a:1,b:2},c:3};const result=({nested:{a,...inner}}=source);globalThis.result=[result===source,a,inner];',
    expected: [true, 1, { b: 2 }],
    strict: [false, 1, { b: 2 }],
  },
];
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(configs)('nested targets loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(cases)('$name', entry => {
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(entry.source)).toEqual(entry.expected);
        // The pinned Babel plugin rejects this supported native syntax. It supplies
        // no runtime oracle; record its exact failure rather than adopting it.
        expect(() =>
          transformSync(entry.source, {
            configFile: false,
            babelrc: false,
            plugins: [[objectRest, config]],
          }),
        ).toThrow(/Expected type "RestElement".*"ObjectProperty"/);
        const code = compile(entry.source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.(inner|outer)/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        actual = observe(code);
        expect(actual).toEqual(entry.expected);
      });
      test('copies from the nested value and preserves the original RHS result', () =>
        expect(actual).toEqual(entry.expected));
    });
  });
});
