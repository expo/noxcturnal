import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'declaration', declaration: 'async function* f() { yield 3; return 4; }', method: false },
  {
    name: 'expression',
    declaration: 'const f = async function*() { yield 3; return 4; };',
    method: false,
  },
  {
    name: 'object method',
    declaration: 'const owner = { async *f() { yield 3; return 4; } }; const f = owner.f;',
    method: true,
  },
  {
    name: 'class method',
    declaration: 'class C { async *f() { yield 3; return 4; } } const f = C.prototype.f;',
    method: true,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
const expected = [
  { value: 3, done: false },
  { value: 4, done: true },
];
for (const awaited of [false, true])
  for (const entry of cases)
    for (const generators of [false, true]) {
      describe(`${entry.name}, async generators selected=${generators}, await=${awaited}`, () => {
        const outcomes = new Map<string, unknown>();
        beforeAll(async () => {
          const source = `${awaited ? entry.declaration.replace('yield 3;', 'await 1; yield 3;') : entry.declaration}
async function observe() {
  const iterator = f();
  if (typeof iterator.next !== 'function') {
    await iterator;
    return ['not-iterator', typeof iterator.then];
  }
  return [await iterator.next(), await iterator.next()];
}
globalThis.result = observe();`;
          expect(await execute(source)).toEqual(expected);
          for (const mode of ['inline', 'runtime'] as const) {
            const reference = transformSync(source, {
              sourceType: 'script',
              babelrc: false,
              configFile: false,
              plugins: [
                require('@babel/plugin-transform-async-to-generator'),
                ...(generators
                  ? [require('@babel/plugin-transform-async-generator-functions')]
                  : []),
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
            expect(await execute(reference)).toEqual(expected);
            const code = compile(source, {
              transforms: { asyncFunctions: true, asyncGeneratorFunctions: generators },
              helpers: { mode, version: '7.29.7' },
            });
            expect(code).not.toMatch(/async\s+function\s+observe/);
            if (generators) expect(code).not.toMatch(/async\s+(?:function\s*)?\*/);
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            const actual = await execute(code);
            expect(Array.isArray(actual)).toBe(true);
            outcomes.set(mode, actual);
          }
        });
        for (const mode of ['inline', 'runtime']) {
          test(`${mode} retains the async iterator contract`, () => {
            expect(outcomes.get(mode)).toEqual(expected);
          });
        }
      });
    }
