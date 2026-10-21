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
describe.each(configs)('nested rest loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(['object', 'array'])('%s parent pattern', parent => {
      const expected = [1, { z: 2 }, 1];
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        const source =
          parent === 'object'
            ? 'const {first:{a,...x},b=a}={first:{a:1,z:2}};globalThis.result=[a,x,b];'
            : 'const [{a,...x},b=a]=[{a:1,z:2}];globalThis.result=[a,x,b];';
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
        if (parent === 'object') expect(observe(reference)).toEqual(expected);
        // Babel also extracts array elements before lowering their nested rest.
        // CRITERIA.md adopts that limitation; object-parent failures are local.
        else expect(() => observe(reference)).toThrow(ReferenceError);
        const code = compile(source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.x/);
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
      test('matches the classified nested-binding initialization contract', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});
