import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
          const { default: destructuring } = await import('@babel/plugin-transform-destructuring');
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
