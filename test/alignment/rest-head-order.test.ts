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
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(configs)('rest head order loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(['catch', 'loop', 'parameter'])('%s head', parent => {
      const expected = [1, { z: 2 }, 1, {}];
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        const source = {
          catch:
            'let result;try{throw [{a:1,z:2},{}]}catch([{a,...x},{b=a,...y}]){result=[a,x,b,y]}globalThis.result=result;',
          loop: 'let result;for(const [{a,...x},{b=a,...y}] of [[{a:1,z:2},{}]]){result=[a,x,b,y]}globalThis.result=result;',
          parameter:
            'function f({a,...x},{b=a,...y}){return [a,x,b,y]}globalThis.result=f({a:1,z:2},{});',
        }[parent]!;
        expect(observe(source)).toEqual(expected);
        const reference = transformSync(source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        if (parent === 'loop') expect(observe(reference)).toEqual(expected);
        // Babel shares the catch and parameter initialization limitation.
        // The loop-head failure is local under CRITERIA.md.
        else expect(() => observe(reference)).toThrow(ReferenceError);
        const code = compile(source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.[xy]/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        // Check output parseability before evaluating its runtime behavior.
        new Function('require', 'globalThis', code);
        try {
          actual = observe(code);
        } catch (error) {
          expect(error).toBeInstanceOf(ReferenceError);
          expect((error as Error).message).toMatch(/before initialization/);
          actual = { error: 'ReferenceError' };
        }
      });
      test('matches the classified loop, catch and parameter initialization contract', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});
