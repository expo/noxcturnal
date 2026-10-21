import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import parameters from '@babel/plugin-transform-parameters';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('rest redeclaration $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    describe.each(['function', 'arrow'])('%s', shape => {
      test.each([false, true])('parameters selected=%s', combined => {
        const body = 'var a;var rest;return [a,rest];';
        const source = `${shape === 'function' ? `function f({a,...rest}){${body}}` : `const f=({a,...rest})=>{${body}};`}globalThis.result=f({a:1,b:2});`;
        const reference = transformSync(source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            ...(combined ? [parameters] : []),
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        const code = compile(source, {
          transforms: { objectRestSpread: config, ...(combined ? { parameters: true } : {}) },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(observe(source)).toEqual([1, { b: 2 }]);
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(code).not.toContain('...rest');
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        if (combined) {
          expect(observe(reference)).toEqual([1, { b: 2 }]);
          expect(observe(code)).toEqual([1, { b: 2 }]);
        } else {
          expect(observe(code)).toEqual([1, { b: 2 }]);
          // Babel's standalone rest lowering retains its redeclaration limitation.
          for (const output of [reference]) {
            expect(() => observe(output)).toThrow(SyntaxError);
            expect(() => observe(output)).toThrow(/Identifier 'a' has already been declared/);
          }
        }
      });
    });
  });
});
