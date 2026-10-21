import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'named expression recursion survives outer reassignment',
    source: `let read = async function self(n) { return n ? 1 + await self(n - 1) : 0; }; const saved = read; read = null; globalThis.result = saved(2);`,
    expected: 2,
  },
  {
    name: 'named expression parameter shadows self binding',
    source: `const read = async function self(self = () => self) { return typeof self(); }; globalThis.result = read();`,
    expected: 'function',
  },
  {
    name: 'anonymous zero-parameter fast path',
    source: `globalThis.result = (async function() { return await 3; })();`,
    expected: 3,
  },
  {
    name: 'anonymous default-first fast path keeps outer binding',
    source: `const read = async function(a = read) { return a === read; }; globalThis.result = read();`,
    expected: true,
  },
  {
    name: 'anonymous positional wrapper forwards receiver and arguments',
    source: `const read = async function(a) { return [this.x, a, arguments.length]; }; globalThis.result = read.call({x: 3}, 4, 5);`,
    expected: [3, 4, 2],
  },
  {
    name: 'unnamed zero-parameter arrow fast path captures receiver',
    source: `function outer() { return (async () => { await 0; return this.x; })(); } globalThis.result = outer.call({x: 3});`,
    expected: 3,
  },
  {
    name: 'unnamed positional arrow wrapper forwards argument',
    source: `globalThis.result = (async (a) => { await 0; return a; })(3);`,
    expected: 3,
  },
  {
    name: 'inferred arrow wrapper retains outer default self reference',
    source: `const read = async (a = read) => a === read; globalThis.result = read();`,
    expected: true,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    expect(await execute(entry.source)).toEqual(entry.expected);
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
    expect(await execute(reference)).toEqual(entry.expected);
    const code = compile(entry.source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s*(?:function|\()/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code)).toEqual(entry.expected);
  });
}
