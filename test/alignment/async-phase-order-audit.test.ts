import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source = `async function read() { for await (const value of [1]) return value; } globalThis.result = read();`;
const codes = new Map<string, string>();
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    for (const generators of [false, true]) {
      const code = compile(source, {
        transforms: { asyncFunctions: true, asyncGeneratorFunctions: generators },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function/);
      codes.set(`${mode}:${generators}`, code);
    }
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
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
test('native async function permits for-await', async () => {
  expect(await run(source)).toBe(1);
});
test.each(['inline', 'runtime'])(
  '%s combined async transforms preserve valid output',
  async mode => {
    expect(await run(codes.get(`${mode}:true`)!)).toBe(1);
  },
);
// Shared successful-output defect: retaining the Babel result is not a validity contract.
test.fails.each(['inline', 'runtime'])(
  '%s Babel async-only output remains executable',
  async mode => {
    expect(await run(codes.get(`babel:${mode}`)!)).toBe(1);
  },
);
test.fails.each(['inline', 'runtime'])('%s async-only output remains executable', async mode => {
  expect(await run(codes.get(`${mode}:false`)!)).toBe(1);
});
