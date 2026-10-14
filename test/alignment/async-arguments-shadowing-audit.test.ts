import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'nested lexical bindings',
    body: 'let arguments = 1; let value; { let arguments = 2; value = arguments; } return [arguments, value];',
    expected: [1, 2],
    broken: true,
  },
  {
    name: 'implicit arguments followed by lexical shadow',
    body: 'let value = arguments[0]; { let arguments = 2; value += arguments; } return value;',
    expected: 5,
    broken: true,
  },
  {
    name: 'catch shadows an existing lexical binding',
    body: 'let arguments = 1; try { throw 2; } catch (arguments) { return [arguments]; }',
    expected: [2],
    broken: true,
  },
  {
    name: 'single loop binding control',
    body: 'let values = []; for (let arguments of [1, 2]) values.push(arguments); return values;',
    expected: [1, 2],
    broken: false,
  },
  {
    name: 'single catch binding control',
    body: 'try { throw 2; } catch (arguments) { return arguments; }',
    expected: 2,
    broken: false,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const form of ['arrow', 'method'])
  for (const entry of cases) {
    describe(`${form}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const source =
          form === 'arrow'
            ? `function outer() { return (async () => { ${entry.body} })(); } globalThis.result = outer(3);`
            : `const owner = { async read() { ${entry.body} } }; globalThis.result = owner.read(3);`;
        expect(await execute(source)).toEqual(entry.expected);
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
          expect(await execute(reference)).toEqual(entry.expected);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s*(?:read|\()/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          outcomes.set(mode, await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (entry.broken ? test.fails : test)(`${mode} preserves distinct arguments bindings`, () => {
          expect(outcomes.get(mode)).toEqual(entry.expected);
        });
      }
    });
  }
