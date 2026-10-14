import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const keys = [
  { name: 'numeric string', source: "'123'", value: '123', broken: true },
  { name: 'numeric key', source: '123', value: '123', broken: true },
  { name: 'punctuation followed by digit', source: "'-1a'", value: '-1a', broken: true },
  { name: 'digit followed by identifier start', source: "'1a'", value: '1a', broken: false },
  { name: 'hyphenated identifier', source: "'a-b'", value: 'a-b', broken: false },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const form of ['arrow', 'expression', 'default-expression'])
  for (const key of keys) {
    // Default-only expressions exercise the fast path for the failing key categories.
    if (form === 'default-expression' && !key.broken) continue;
    describe(`${form}: ${key.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const fn =
          form === 'arrow'
            ? 'async (a) => a'
            : form === 'expression'
              ? 'async function(a) { return a; }'
              : 'async function(a = 3) { return a; }';
        const source = `const object = { ${key.source}: ${fn} };
globalThis.result = object[${JSON.stringify(key.value)}](${form === 'default-expression' ? '' : '3'});`;
        expect(await execute(source)).toBe(3);
        for (const mode of ['inline', 'runtime'] as const) {
          const reference = transformSync(source, {
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
          expect(await execute(reference)).toBe(3);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s*(?:function|\()/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          let parseError = false;
          try {
            new Function('require', 'globalThis', code);
          } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError);
            parseError = true;
          }
          outcomes.set(mode, parseError ? 'SyntaxError' : await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (key.broken && form !== 'default-expression' ? test.fails : test)(
          `${mode} emits executable output`,
          () => {
            expect(outcomes.get(mode)).toBe(3);
          },
        );
      }
    });
  }
