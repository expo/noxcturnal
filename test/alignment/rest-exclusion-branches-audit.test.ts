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
    name: 'parameter without exclusions',
    source: `const symbol=Symbol();function f({...rest}){return [rest.a,rest[symbol]]}let error;try{f(null)}catch(e){error=e.name}globalThis.result=[f({a:1,[symbol]:2}),error];`,
    expected: [[1, 2], 'TypeError'],
  },
  {
    name: 'root template key',
    source: 'const {[`a`]:a,...rest}={a:1,b:2};globalThis.result=[a,rest];',
    expected: [1, { b: 2 }],
  },
  {
    name: 'function template key repeated calls',
    source:
      'function f(source){const {[`a`]:a,...rest}=source;return [a,rest]}globalThis.result=[f({a:1,b:2}),f({a:3,c:4})];',
    expected: [
      [1, { b: 2 }],
      [3, { c: 4 }],
    ],
  },
  ...(['var', 'let'] as const).map(kind => ({
    name: `classic for ${kind} initializer`,
    source: `const events=[],callbacks=[];for(${kind} {[(events.push('key'),'a')]:a=(events.push('default'),1),...rest}={b:2};a<3;a++){callbacks.push(()=>[a,rest.b])}globalThis.result=[events,callbacks.map(f=>f())];`,
    expected: [
      ['key', 'default'],
      kind === 'var'
        ? [
            [3, 2],
            [3, 2],
          ]
        : [
            [1, 2],
            [2, 2],
          ],
    ],
  })),
];
describe.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('rest exclusions $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    test.each(cases)('$name', fixture => {
      expect(observe(fixture.source)).toEqual(fixture.expected);
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
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('@babel/runtime');
      expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
      expect(observe(reference)).toEqual(fixture.expected);
      expect(observe(code)).toEqual(fixture.expected);
    });
  });
});
