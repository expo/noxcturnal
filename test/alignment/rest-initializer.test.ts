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
const cases = [
  {
    name: 'parameter',
    shared: true,
    source: `let a,rest;function f(n,result=({a,...rest}={get a(){if(n)f(0);return n},b:n})){return [result.b,rest.b]}globalThis.result=f(1);`,
  },
  {
    name: 'field',
    shared: true,
    source: `let a,rest;let outer=true;class C{result=({a,...rest}={get a(){if(outer){outer=false;new C()}return 1},b:outer?1:0});}const value=new C();globalThis.result=[value.result.b,rest.b];`,
  },
  {
    name: 'function body',
    shared: false,
    source: `let a,rest;function f(n){const result=({a,...rest}={get a(){if(n)f(0);return n},b:n});return [result.b,rest.b]}globalThis.result=f(1);`,
  },
  {
    name: 'constructor body',
    shared: false,
    source: `let a,rest;let outer=true;class C{constructor(){this.result=({a,...rest}={get a(){if(outer){outer=false;new C()}return 1},b:outer?1:0});}}const value=new C();globalThis.result=[value.result.b,rest.b];`,
  },
];
describe.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('rest initializer $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    test.each(cases)('$name', fixture => {
      const reference = transformSync(fixture.source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          [objectRest, config],
          ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
        ],
      })!.code!;
      const code = compile(fixture.source, {
        transforms: { objectRestSpread: config },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('...rest');
      expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
      expect(observe(fixture.source)).toEqual([1, 1]);
      // Babel and Noxcturnal share outer temporaries for these initializer contexts.
      const expected = fixture.shared ? [0, 0] : [1, 1];
      expect(observe(reference)).toEqual(expected);
      expect(observe(code)).toEqual(expected);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('@babel/runtime');
    });
  });
});
