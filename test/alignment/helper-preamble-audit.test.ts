import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function run(source: string): unknown {
  const context = { require, result: undefined };
  runInNewContext(source, context, { timeout: 1000 });
  return context.result;
}
const cases = [
  {
    name: 'object spread',
    body: 'const x={...{a:3}};',
    result: 'x.a',
    syntax: /\.\.\./,
    plugin: 'object-rest-spread',
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
  },
  {
    name: 'object rest',
    body: 'const {a,...x}={a:1,b:3};',
    result: 'x.b',
    syntax: /\.\.\./,
    plugin: 'object-rest-spread',
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
  },
  {
    name: 'class properties',
    body: 'class X{value=3}const x=new X();',
    result: 'x.value',
    syntax: /class X\s*\{\s*value\s*=/,
    plugin: 'class-properties',
    transforms: { classProperties: { loose: false } },
  },
];
describe.each(cases)('$name', entry => {
  describe.each([false, true])('hashbang: %s', hashbang => {
    const source = `${hashbang ? '#!/usr/bin/env node\n' : ''}"use strict";${entry.body}globalThis.result=[${entry.result},(function(){return this===undefined})()];`;
    describe.each([false, true])('compact: %s', compact => {
      describe.each(['inline', 'runtime'] as const)('%s', mode => {
        let babel: string;
        let actual: unknown;
        beforeAll(() => {
          const code = compile(source, {
            compact,
            transforms: entry.transforms,
            helpers: { mode, version: '7.29.7' },
          });
          babel = transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            compact,
            plugins: [
              [
                require(`@babel/plugin-transform-${entry.plugin}`),
                { loose: false, useBuiltIns: false },
              ],
              ...(mode === 'runtime'
                ? [
                    [
                      require('@babel/plugin-transform-runtime'),
                      { version: '7.29.7', useESModules: false },
                    ],
                  ]
                : []),
            ],
          })!.code!;
          for (const output of [code, babel]) {
            expect(output).not.toMatch(entry.syntax);
            if (mode === 'runtime') expect(output).toContain('@babel/runtime/helpers/');
            else expect(output).not.toContain('@babel/runtime');
          }
          try {
            actual = run(code);
          } catch (error) {
            expect((error as Error).name).toBe('SyntaxError');
            actual = { error: 'SyntaxError' };
          }
        });
        test('native script preserves its header semantics', () =>
          expect(run(source)).toEqual([3, true]));
        test('Babel preserves its header semantics', () => expect(run(babel)).toEqual([3, true]));
        (mode === 'inline' ? test.fails : test)('Noxcturnal preserves its header semantics', () =>
          expect(actual).toEqual([3, true]),
        );
      });
    });
  });
});
