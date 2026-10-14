import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
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
])('rest loop var $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    describe.each(['of', 'in'])('%s', kind => {
      describe.each(['single', 'empty', 'closures'])('%s iterations', scenario => {
        let actual: unknown;
        const expected =
          scenario === 'empty'
            ? [undefined, undefined]
            : scenario === 'closures'
              ? ['c', 'c']
              : ['a', { '1': 'b' }];
        beforeAll(() => {
          const input =
            scenario === 'empty'
              ? kind === 'of'
                ? '[]'
                : '{}'
              : scenario === 'closures'
                ? kind === 'of'
                  ? '["ab","cd"]'
                  : '{ab:1,cd:2}'
                : kind === 'of'
                  ? '["ab"]'
                  : '{ab:1}';
          const body =
            scenario === 'closures'
              ? 'callbacks.push(()=>first);'
              : scenario === 'single'
                ? ';'
                : '{}';
          const source = `function run(){const callbacks=[];for(var {"0":first,...rest} ${kind} ${input})${body}return ${scenario === 'closures' ? 'callbacks.map(f=>f())' : '[first,rest]'}}globalThis.result=run();`;
          const reference = transformSync(source, {
            babelrc: false,
            configFile: false,
            sourceType: 'script',
            plugins: [
              [objectRest, config],
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
            ],
          })!.code!;
          const code = compile(source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(source)).toEqual(expected);
          expect(observe(reference)).toEqual(expected);
          expect(code).not.toContain('...rest');
          new Function('require', 'globalThis', code);
          try {
            actual = observe(code);
          } catch (error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect((error as Error).message).toBe('first is not defined');
            actual = { error: 'ReferenceError' };
          }
        });
        test('preserves function-scoped loop bindings', () => {
          expect(actual).toEqual(expected);
        });
      });
    });
  });
});
