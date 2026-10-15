import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
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
])('rest source loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(['declaration', 'assignment'] as const)('%s', placement => {
      test.each(['identifier', 'call'] as const)('%s source', shape => {
        const rhs = shape === 'identifier' ? 'source' : 'read()';
        const source = `let calls=0;let source={get a(){source={b:99};return 1},b:2};
          const original=source;function read(){calls++;return source}
          ${placement === 'declaration' ? `const {a,...rest}=${rhs};` : `let a,rest;const result=({a,...rest}=${rhs});`}
          globalThis.result=[a,rest.b,calls${placement === 'assignment' ? ',result===original' : ''}];`;
        const expected = [
          1,
          2,
          shape === 'call' ? 1 : 0,
          ...(placement === 'assignment' ? [true] : []),
        ];
        expect(observe(source)).toEqual(expected);
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        const reference = transformSync(source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        const code = compile(source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toContain('...rest');
        const uncaptured = placement === 'declaration' && shape === 'identifier';
        // CRITERIA.md adopts Babel's declaration-source reread limitation.
        expect(observe(reference)).toEqual(uncaptured ? [1, 99, 0] : expected);
        expect(observe(code)).toEqual(expected);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
      });
    });
  });
});
