import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'uninvoked arrow does not read absent binding',
    source: 'const read = async () => arguments; globalThis.result = typeof read;',
    native: ['fulfilled', 'function'],
    selected: ['fulfilled', 'function'],
    binding: false,
  },
  {
    name: 'typeof absent binding remains defined',
    source: 'const read = async () => typeof arguments; globalThis.result = read();',
    native: ['fulfilled', 'undefined'],
    selected: ['fulfilled', 'undefined'],
    binding: false,
  },
  {
    name: 'direct absent read follows Babel limitation',
    source: 'const read = async () => arguments; globalThis.result = read();',
    native: ['rejected', 'ReferenceError'],
    selected: ['fulfilled', undefined],
    binding: false,
  },
  {
    name: 'existing global binding is captured',
    source: 'const read = async () => arguments[0]; globalThis.result = read();',
    native: ['fulfilled', 3],
    selected: ['fulfilled', 3],
    binding: true,
  },
  {
    name: 'global replacement follows Babel snapshot limitation',
    source:
      'const read = async () => arguments[0]; globalThis.arguments = [7]; globalThis.result = read();',
    native: ['fulfilled', 7],
    selected: ['fulfilled', 3],
    binding: true,
  },
];
async function execute(code: string, binding: boolean): Promise<unknown> {
  const context: Record<string, unknown> = { require, ...(binding ? { arguments: [3] } : {}) };
  // A real script context avoids injecting new Function's own arguments object.
  runInNewContext(code, context, { timeout: 1000 });
  try {
    return ['fulfilled', await context.result];
  } catch (error) {
    expect((error as Error).name).toBe('ReferenceError');
    return ['rejected', 'ReferenceError'];
  }
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    expect(await execute(entry.source, entry.binding)).toEqual(entry.native);
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
    expect(await execute(reference, entry.binding)).toEqual(entry.selected);
    const code = compile(entry.source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s*\(/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code, entry.binding)).toEqual(entry.selected);
  });
}
