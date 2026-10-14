import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source = `
  function A() {
    this.read = async () => { await 0; return new.target === A; };
  }
  globalThis.result = new A().read();
`;
const codes = new Map<string, string>();
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s*\(/);
    codes.set(mode, code);
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
test('native async arrow inherits constructor new.target', async () => {
  expect(await run(source)).toBe(true);
});
test.each(['inline', 'runtime'])('%s Babel captures lexical new.target', async mode => {
  expect(await run(codes.get(`babel:${mode}`)!)).toBe(true);
});
test.fails.each(['inline', 'runtime'])(
  '%s async lowering preserves lexical new.target',
  async mode => {
    expect(await run(codes.get(mode)!)).toBe(true);
  },
);
