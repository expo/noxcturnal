import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source = `globalThis.result = (async () => {
  for await (const value of []) {}
  for (let _step = 0, _iterator = { next() { return 3; } }; _step < 1; _step++) {
    return await _iterator.next();
  }
})();`;
const outputs = new Map<string, string>();
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(source, {
      transforms: { asyncGeneratorFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/for\s+await/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    outputs.set(mode, code);
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
    })!.code!;
    expect(reference).not.toMatch(/for\s+await/);
    outputs.set('babel:' + mode, reference);
  }
});
async function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
test('native user method returns a primitive', async () => expect(await run(source)).toBe(3));
test.each(['inline', 'runtime'])('%s Babel preserves the user loop', async mode =>
  expect(await run(outputs.get('babel:' + mode)!)).toBe(3),
);
test.each(['inline', 'runtime'])('%s only validates generated iterator calls', async mode =>
  expect(await run(outputs.get(mode)!)).toBe(3),
);

describe('validator helper preserves external references', () => {
  const source = `globalThis.result = (async () => {
    for await (const value of [1]) {}
    return _iteratorResult;
  })();`;
  const outputs = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/for\s+await/);
      outputs.set(mode, code);
      outputs.set(
        'babel:' + mode,
        transformSync(source, {
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
        })!.code!,
      );
    }
  });
  async function runExternal(code: string) {
    const context: Record<string, unknown> = {};
    new Function('require', '_iteratorResult', 'globalThis', code)(require, 'external', context);
    return await context.result;
  }
  test('native external reference control', async () =>
    expect(await runExternal(source)).toBe('external'));
  test.each(['inline', 'runtime'])('%s Babel preserves the external reference', async mode => {
    expect(await runExternal(outputs.get('babel:' + mode)!)).toBe('external');
  });
  test.each(['inline', 'runtime'])(
    '%s validator helper avoids external-name capture',
    async mode => {
      expect(await runExternal(outputs.get(mode)!)).toBe('external');
    },
  );
});
