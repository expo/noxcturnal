import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const strictResult = [
  [true, 'undefined', 1],
  [false, 'number', 1],
];
const boxedResult = [
  [false, 'object', 1],
  [false, 'object', 1],
];
const body = `await 0; return [this === undefined, typeof this, (a = 4, arguments[0])];`;
const cases = [
  {
    name: 'object method with a local strict directive',
    declaration: `const f = ({ async f(a) { 'use strict'; ${body} } }).f;`,
    native: strictResult,
    selected: strictResult,
    broken: true,
  },
  {
    name: 'object method inheriting script strictness',
    brokenInline: true,
    declaration: `'use strict'; const f = ({ async f(a) { ${body} } }).f;`,
    native: strictResult,
    selected: strictResult,
  },
  {
    name: 'class method with implicit strictness',
    declaration: `class C { async f(a) { ${body} } } const f = C.prototype.f;`,
    native: strictResult,
    selected: strictResult,
  },
  {
    name: 'declaration receiver boxing follows Babel',
    declaration: `async function f(a) { 'use strict'; ${body} }`,
    native: strictResult,
    selected: boxedResult,
  },
  {
    name: 'expression receiver boxing follows Babel',
    declaration: `const f = async function(a) { 'use strict'; ${body} };`,
    native: strictResult,
    selected: boxedResult,
  },
  {
    name: 'strict named-expression write follows Babel',
    declaration: `const f = async function self() { 'use strict'; try { self = 3; return typeof self; } catch (error) { return error.name; } };`,
    native: ['TypeError', 'TypeError'],
    selected: ['number', 'number'],
  },
  {
    name: 'sloppy named-expression write follows Babel',
    declaration: `const f = async function self() { self = 3; return typeof self; };`,
    native: ['function', 'function'],
    selected: ['number', 'number'],
  },
];

async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}

for (const entry of cases) {
  describe(entry.name, () => {
    const outcomes = new Map<string, unknown>();
    beforeAll(async () => {
      const source = `${entry.declaration}\nglobalThis.result = Promise.all([f(1), f.call(2, 1)]);`;
      expect(await execute(source)).toEqual(entry.native);
      for (const mode of ['inline', 'runtime'] as const) {
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-async-to-generator'),
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
        expect(await execute(reference)).toEqual(entry.selected);
        const code = compile(source, {
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s+(?:function|f\s*\()/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        const actual = await execute(code);
        expect(Array.isArray(actual)).toBe(true);
        outcomes.set(mode, actual);
      }
    });
    for (const mode of ['inline', 'runtime']) {
      (entry.brokenInline && mode === 'inline' ? test.fails : test)(
        `${mode} preserves the selected contract`,
        () => {
          expect(outcomes.get(mode)).toEqual(entry.selected);
        },
      );
    }
  });
}
