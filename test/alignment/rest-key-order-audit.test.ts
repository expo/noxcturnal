import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
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
    name: 'binding key after earlier default',
    source:
      'const events=[];const {a=(events.push("a"),1),[(events.push("key"),"b")]:b,...rest}={b:2};globalThis.result=[events,a,b,rest];',
    native: [['a', 'key'], 1, 2, {}],
    strict: [['key', 'a'], 1, 2, {}],
    local: true,
  },
  {
    name: 'assignment key after RHS',
    source:
      'const events=[];let b,rest;({[(events.push("key"),"b")]:b,...rest}=(events.push("rhs"),{b:2}));globalThis.result=[events,b,rest];',
    native: [['rhs', 'key'], 2, {}],
    strict: [['key', 'rhs'], 2, {}],
    local: true,
  },
  {
    name: 'binding key changed by getter',
    source:
      'let key="a";const {[key]:value,...rest}={get a(){key="b";return 1},b:2};globalThis.result=[value,rest];',
    native: [1, { b: 2 }],
    strict: [1, { a: 1 }],
    local: false,
  },
  {
    name: 'assignment key changed by getter',
    source:
      'let key="a",value,rest;({[key]:value,...rest}={get a(){key="b";return 1},b:2});globalThis.result=[value,rest];',
    native: [1, { b: 2 }],
    strict: [1, { a: 1 }],
    local: false,
  },
];
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(configs)('rest keys loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(cases)('$name', entry => {
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(entry.source)).toEqual(entry.native);
        const reference = transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          sourceType: 'script',
          plugins: [
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        expect(observe(reference)).toEqual(entry.local ? entry.native : entry.strict);
        const code = compile(entry.source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.rest/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        actual = observe(code);
        expect(actual).toEqual(entry.native);
      });
      test('preserves local ordering or the adopted shared key baseline', () => {
        expect(actual).toEqual(entry.native);
      });
    });
  });
});
