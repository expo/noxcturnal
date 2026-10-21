import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { createRequire } from 'node:module';
import runtime from '@babel/plugin-transform-runtime';

describe('rest loop scope', () => {
  const options = [
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ];
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }
  describe.each(options)('rest loop scope, loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['in', 'of'])('loop=%s', loop => {
      describe.each([false, true])('declaration=%s', declaration => {
        describe.each([false, true])('body shadow=%s', shadow => {
          let actual: unknown;
          let expected: unknown;
          beforeAll(() => {
            const source = `let first,rest;const seen=[];for(${declaration ? 'const ' : ''}{"0":first,...rest} ${loop} ${loop === 'in' ? '{ab:1}' : '["ab"]'}){${shadow ? 'let first="body";' : ''}seen.push([first,rest]);}globalThis.result=seen;`;
            expected = [[shadow ? 'body' : 'a', { '1': 'b' }]];
            expect(observe(source)).toEqual(expected);
            const reference = transformSync(source, {
              configFile: false,
              babelrc: false,
              plugins: [[objectRest, config]],
            })!.code!;
            expect(observe(reference)).toEqual(expected);
            const code = compile(source, { transforms: { objectRestSpread: config } });
            expect(code).not.toMatch(/\.\.\.rest/);
            expect(code).not.toContain('@babel/runtime');
            try {
              actual = observe(code);
            } catch (error) {
              expect(error).toBeInstanceOf(declaration ? SyntaxError : ReferenceError);
              expect((error as Error).message).toMatch(
                declaration ? /already been declared/ : /before initialization/,
              );
              actual = { error: (error as Error).name };
            }
          });
          test('preserves the distinct loop-head environment', () =>
            expect(actual).toEqual(expected));
        });
      });
    });
  });

  describe.each(options)(
    'combined rest/destructuring, loose=$loose builtins=$useBuiltIns',
    config => {
      describe.each(['in', 'of'])('loop=%s', loop => {
        describe.each([false, true])('declaration=%s', declaration => {
          let code: string;
          const remainingPattern = /\{\s*["']0["']\s*:\s*first\s*\}/;
          beforeAll(async () => {
            const { default: destructuring } =
              await import('@babel/plugin-transform-destructuring');
            const source = `let first,rest;const seen=[];for(${declaration ? 'const ' : ''}{"0":first,...rest} ${loop} ${loop === 'in' ? '{ab:1}' : '["ab"]'})seen.push([first,rest]);globalThis.result=seen;`;
            const expected = [['a', { '1': 'b' }]];
            expect(observe(source)).toEqual(expected);
            const reference = transformSync(source, {
              configFile: false,
              babelrc: false,
              plugins: [[objectRest, config], destructuring],
            })!.code!;
            expect(reference).not.toMatch(remainingPattern);
            expect(observe(reference)).toEqual(expected);
            code = compile(source, {
              transforms: { destructuring: true, objectRestSpread: config },
            });
            expect(code).not.toMatch(/\.\.\.rest/);
            expect(code).not.toContain('@babel/runtime');
            expect(observe(code)).toEqual(expected);
          });
          test('removes all selected binding and assignment patterns', () => {
            expect(code).not.toMatch(remainingPattern);
          });
        });
      });
    },
  );
});

describe('rest loop var', () => {
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
});

describe('rest declarators', () => {
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
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
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
});

describe('rest head order', () => {
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
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
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
});
