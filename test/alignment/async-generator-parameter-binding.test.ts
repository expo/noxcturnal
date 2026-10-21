import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'declaration',
    setup: 'async function* read(a=1){var a;yield a;}',
    call: 'read()',
    method: false,
  },
  {
    name: 'expression',
    setup: 'const read=async function*(a=1){var a;yield a;};',
    call: 'read()',
    method: false,
  },
  {
    name: 'object method',
    setup: 'const owner={async *read(a=1){var a;yield a;}};',
    call: 'owner.read()',
    method: true,
  },
  {
    name: 'class method',
    setup: 'class C{async *read(a=1){var a;yield a;}}const owner=new C();',
    call: 'owner.read()',
    method: true,
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const)
  for (const parameters of [false, true])
    for (const entry of cases) {
      describe(`${entry.name}, parameters=${parameters}, ${mode}`, () => {
        let actual: unknown;
        beforeAll(async () => {
          const source = `${entry.setup}globalThis.result=${entry.call}.next();`;
          expect(await run(source)).toEqual({ value: 1, done: false });
          const reference = transformSync(source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-async-generator-functions'),
              ...(parameters ? [require('@babel/plugin-transform-parameters')] : []),
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
          expect(await run(reference)).toEqual({ value: 1, done: false });
          const code = compile(source, {
            transforms: { asyncGeneratorFunctions: true, parameters },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s+(?:function\s*)?\*/);
          actual = await run(code);
        });
        test('preserves parameter value copied into the body binding', () => {
          expect(actual).toEqual({ value: 1, done: false });
        });
      });
    }
