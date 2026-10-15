import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { describe, expect, test } from 'vitest';
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

describe.each(configs)('rest defaults loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(['object', 'array', 'loop', 'catch'] as const)('%s binding', placement => {
      test.each(['undefined', 'present', 'null'] as const)('%s input', input => {
        const value = input === 'present' ? '{a:3,z:4}' : input;
        const pattern = '{a,...rest}=(events.push("default"),{a:1,z:2})';
        const result = 'globalThis.result=[events,a,rest];';
        const binding = {
          object: `const {item:${pattern}}={item:${value}};${result}`,
          array: `const [${pattern}]=[${value}];${result}`,
          loop: `for(const [${pattern}] of [[${value}]]){${result}}`,
          catch: `try{throw [${value}]}catch([${pattern}]){${result}}`,
        }[placement];
        const source = `const events=[];try{${binding}}catch(error){globalThis.result=[events,error.name]}`;
        const expected =
          input === 'null'
            ? [[], 'TypeError']
            : input === 'present'
              ? [[], 3, { z: 4 }]
              : [['default'], 1, { z: 2 }];
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
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
        // Babel copies the original undefined property instead of its default.
        expect(observe(reference)).toEqual(
          placement === 'object' && input === 'undefined' ? [['default'], 1, {}] : expected,
        );
        const code = compile(source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\.\.\.rest/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        expect(observe(code)).toEqual(expected);
      });
    });
  });
});
