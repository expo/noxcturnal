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
describe.each(configs)('rest declarators loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each([false, true])('separate statements=%s', separate => {
      const expected = [1, { z: 2 }, 3, { w: 4 }];
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        const source = `const {a,...x}={a:1,z:2}${separate ? ';const ' : ','}{b,...y}={b:3,w:4};globalThis.result=[a,x,b,y];`;
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
        expect(observe(reference)).toEqual(expected);
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
          expect(error).toBeInstanceOf(TypeError);
          expect((error as Error).message).toMatch(/destructure.*null/);
          actual = { error: 'TypeError' };
        }
      });
      test('preserves both declarators when expanding their rest patterns', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});
