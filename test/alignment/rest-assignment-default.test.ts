import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
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
])('rest assignment default $loose $useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    describe.each(['undefined', 'present', 'null', 'member'])('%s', input => {
      const expected =
        input === 'null'
          ? ['TypeError', 0]
          : input === 'member'
            ? [['target', 'get', 'set'], { b: 2 }, true]
            : [
                input === 'present' ? 3 : 1,
                { b: input === 'present' ? 4 : 2 },
                input === 'present' ? 0 : 1,
                true,
              ];
      let actual: unknown;
      beforeAll(() => {
        const source =
          input === 'member'
            ? `const events=[];let copied;const sink={set rest(value){events.push('set');copied=value}};function target(){events.push('target');return sink}const source={get b(){events.push('get');return 2}};const result=({...target().rest}=source);globalThis.result=[events,copied,result===source];`
            : `let a,rest,calls=0;function fallback(){calls++;return {a:1,b:2}}const source={item:${input === 'present' ? '{a:3,b:4}' : input}};try{const result=({item:{a,...rest}=fallback()}=source);globalThis.result=[a,rest,calls,result===source]}catch(error){globalThis.result=[error.name,calls]}`;
        const reference = () =>
          transformSync(source, {
            babelrc: false,
            configFile: false,
            sourceType: 'script',
            plugins: [[objectRest, config]],
          })!.code!;
        if (input === 'member') expect(observe(reference())).toEqual(expected);
        else expect(reference).toThrow(/Expected type "RestElement".*"ObjectProperty"/);
        const code = compile(source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.(rest|target)/);
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(source)).toEqual(expected);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        actual = observe(code);
        expect(actual).toEqual(expected);
      });
      test('preserves default selection, destination order and assignment identity', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});
