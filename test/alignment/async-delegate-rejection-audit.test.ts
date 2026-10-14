import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const setup = `
  const failure = new Error('close');
  const source = {
    [Symbol.asyncIterator]() {
      return {
        next() { return Promise.resolve({ value: 1, done: false }); },
        return() { return Promise.reject(failure); },
      };
    },
  };
`;
const consume = `
  globalThis.result = (async () => {
    const iterator = values();
    await iterator.next();
    return (await iterator.return(4)).value;
  })();
`;
const source =
  setup +
  `
  async function* values() {
    try { yield* source; }
    catch (error) { yield [error === failure, error.name]; }
  }
` +
  consume;
const directHelpers =
  setup +
  `
  const wrap = require('@babel/runtime/helpers/wrapAsyncGenerator');
  const delegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
  const asyncIterator = require('@babel/runtime/helpers/asyncIterator');
  const values = wrap(function* () {
    try { yield* delegate(asyncIterator(source)); }
    catch (error) { yield [error === failure, error.name]; }
  });
` +
  consume;
const codes = new Map<string, string>();
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(source, {
      transforms: { asyncGeneratorFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s+function\s*\*/);
    codes.set(mode, code);
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
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
    });
    expect(reference?.code).toBeTypeOf('string');
    codes.set(`babel:${mode}`, reference!.code!);
  }
});
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
test('native delegated return rejection preserves the original error', async () => {
  expect(await run(source)).toEqual([true, 'Error']);
});
// Adopted pinned-helper limitation; retain native expectations to detect an upstream fix.
test.fails.each(['inline', 'runtime'])(
  '%s Babel preserves delegated rejection identity',
  async mode => {
    expect(await run(codes.get(`babel:${mode}`)!)).toEqual([true, 'Error']);
  },
);
test.fails.each(['inline', 'runtime'])(
  '%s Noxcturnal preserves delegated rejection identity',
  async mode => {
    expect(await run(codes.get(mode)!)).toEqual([true, 'Error']);
  },
);
test.fails('direct Babel helper composition preserves delegated rejection identity', async () => {
  expect(await run(directHelpers)).toEqual([true, 'Error']);
});
