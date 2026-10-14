import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', `return (function(){${code}})()`)(require, context);
  return context.result;
}
describe.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('rest parameter $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    describe.each(['function', 'concise arrow', 'block arrow', 'method'])('%s', shape => {
      describe.each([false, true])('delayed default=%s', delayed => {
        let actual: unknown;
        beforeAll(() => {
          const params = `{a,...rest},read=${delayed ? '()=>a' : 'a'}`;
          const value = `[${delayed ? 'read()' : 'read'},a,rest]`;
          const definitions = {
            function: `function f(${params}){return ${value}}`,
            'concise arrow': `const f=(${params})=>${value};`,
            'block arrow': `const f=(${params})=>{return ${value}};`,
            method: `const object={f(${params}){return ${value}}};const f=object.f;`,
          };
          const source = `const a=99;${definitions[shape as keyof typeof definitions]}globalThis.result=f({a:1,b:2});`;
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
          expect(code).not.toContain('...rest');
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(source)).toEqual([1, 1, { b: 2 }]);
          expect(observe(reference)).toEqual([delayed ? 99 : 1, 1, { b: 2 }]);
          actual = observe(code);
          expect(actual).toEqual([1, 1, { b: 2 }]);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
        });
        test('resolves the later default under the classified parameter contract', () => {
          expect(actual).toEqual([1, 1, { b: 2 }]);
        });
      });
    });
  });
});
