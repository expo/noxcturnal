import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'ordinary declaration',
    setup: 'async function read() { return await 3; }',
    body: 'yield await read();',
    expected: 3,
  },
  {
    name: 'ordinary expression',
    setup: 'const read = async function() { return await 3; };',
    body: 'yield await read();',
    expected: 3,
  },
  {
    name: 'ordinary arrow',
    setup: 'const read = async () => await 3;',
    body: 'yield await read();',
    expected: 3,
  },
  {
    name: 'ordinary object method',
    setup: 'const owner = { async read() { return await 3; } };',
    body: 'yield await owner.read();',
    expected: 3,
  },
  {
    name: 'ordinary class method',
    setup: 'class C { async read() { return await 3; } } const owner = new C();',
    body: 'yield await owner.read();',
    expected: 3,
  },
  {
    name: 'nested ordinary async function',
    setup: '',
    body: 'async function read() { return await 5; } yield await read();',
    expected: 5,
  },
  {
    name: 'nested async arrow',
    setup: '',
    body: 'const read = async () => await 5; yield await read();',
    expected: 5,
  },
  {
    name: 'nested synchronous generator',
    setup: '',
    body: 'function* read() { yield 7; return 8; } const it = read(); yield [it.next(), it.next()];',
    expected: [
      { value: 7, done: false },
      { value: 8, done: true },
    ],
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    const source = `${entry.setup}
async function* selected() { ${entry.body} }
async function observe() { const it = selected(); return [await it.next(), await it.next()]; }
globalThis.result = observe();`;
    const expected = [
      { value: entry.expected, done: false },
      { value: undefined, done: true },
    ];
    expect(await execute(source)).toEqual(expected);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [
        require('@babel/plugin-transform-async-generator-functions'),
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
      transforms: { asyncGeneratorFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s+function\s*\*/);
    expect(code).toMatch(/async\s+function\s+observe/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code)).toEqual(expected);
  });
}
