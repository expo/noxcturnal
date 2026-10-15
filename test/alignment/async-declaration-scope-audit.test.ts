import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'sloppy block declaration visibility follows Babel',
    source: `{ async function f() { return 3; } } globalThis.result = typeof f;`,
    native: 'undefined',
    selected: 'function',
  },
  {
    name: 'outer lexical binding prevents Annex B replacement',
    source: `let f = 7; { async function f() { return 3; } globalThis.inner = f(); }
globalThis.result = Promise.all([globalThis.inner, f]);`,
    native: [3, 7],
    selected: [3, 7],
  },
  {
    name: 'loop declarations retain independent captured bindings',
    source: `function outer() { const out = []; for (let n = 0; n < 2; n++) {
async function f() { return n; } out.push(f); }
return Promise.all(out.map(f => f())); } globalThis.result = outer();`,
    native: [0, 1],
    selected: [0, 1],
  },
  {
    name: 'switch declaration is callable before its case executes',
    source: `function outer() { let out; switch (1) { case 1: out = f(); break;
case 2: async function f() { return 4; } } return out; } globalThis.result = outer();`,
    native: 4,
    selected: 4,
  },
  {
    name: 'sloppy var replacement follows Babel',
    source: `function outer() { var f = 7; { async function f() { return 3; } }
return [typeof f, typeof f === 'function' ? f() : f]; }
globalThis.result = Promise.all(outer());`,
    native: ['number', 7],
    selected: ['function', 3],
  },
  {
    name: 'enclosing function strictness retains block visibility',
    source: `function outer() { 'use strict'; { async function f() { return 3; } }
return typeof f; } globalThis.result = outer();`,
    native: 'undefined',
    selected: 'undefined',
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    expect(await execute(entry.source)).toEqual(entry.native);
    const reference = transformSync(entry.source, {
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
    const code = compile(entry.source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s+function/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code)).toEqual(entry.selected);
  });
}
