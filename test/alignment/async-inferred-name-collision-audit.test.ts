import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'inferred name shadows initial delegate', key: '_ref', prefix: '', broken: true },
  {
    name: 'inferred name shadows suffixed delegate',
    key: '_ref2',
    prefix: 'const _ref = 7;',
    broken: true,
  },
  {
    name: 'existing binding forces a distinct delegate',
    key: '_ref',
    prefix: 'const _ref = 7;',
    broken: false,
  },
  { name: 'parameter placeholder name remains safe', key: '_x', prefix: '', broken: false },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  const run = new Function('require', 'globalThis', code);
  try {
    run(require, context);
    return ['fulfilled', await context.result];
  } catch (error) {
    expect(error).toBeInstanceOf(RangeError);
    return ['thrown', 'RangeError'];
  }
}
for (const form of ['arrow', 'expression'])
  for (const entry of cases) {
    describe(`${form}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const fn = form === 'arrow' ? 'async (a) => a' : 'async function(a) { return a; }';
        const source = `${entry.prefix} const object = { ${JSON.stringify(entry.key)}: ${fn} };
globalThis.result = object[${JSON.stringify(entry.key)}](3);`;
        expect(await execute(source)).toEqual(['fulfilled', 3]);
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
          expect(await execute(reference)).toEqual(['fulfilled', 3]);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s*(?:function|\()/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          outcomes.set(mode, await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (entry.broken ? test.fails : test)(
          `${mode} invokes the delegate without self-recursion`,
          () => {
            expect(outcomes.get(mode)).toEqual(['fulfilled', 3]);
          },
        );
      }
    });
  }
