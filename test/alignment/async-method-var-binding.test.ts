import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'literal default copied into body var',
    params: 'a = 1',
    body: 'var a; return a;',
    args: '',
    native: 1,
    selected: 1,
    broken: true,
  },
  {
    name: 'closure default copied into body var',
    params: 'a = () => a',
    body: 'var a; return a() === a;',
    args: '',
    native: true,
    selected: true,
    broken: true,
  },
  {
    name: 'effectful default relocates both bindings',
    params: 'a = Number(1)',
    body: 'var a; return a;',
    args: '',
    native: 1,
    selected: 1,
  },
  {
    name: 'simple parameter redeclaration follows Babel',
    params: 'a',
    body: 'var a; return a;',
    args: '7',
    native: 7,
    selected: undefined,
  },
  {
    name: 'rest parameter redeclaration retains its parameter value',
    params: '...[a]',
    body: 'var a; return a;',
    args: '7',
    native: 7,
    selected: undefined,
  },
];

async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  try {
    return ['fulfilled', await context.result];
  } catch (error) {
    return ['rejected', (error as Error).name];
  }
}

for (const kind of ['object', 'class'])
  for (const entry of cases) {
    describe(`${kind}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const method = `async read(${entry.params}) { ${entry.body} }`;
        const source = `${kind === 'object' ? `const owner = { ${method} };` : `class C { ${method} } const owner = new C();`}
globalThis.result = owner.read(${entry.args});`;
        expect(await execute(source)).toEqual(['fulfilled', entry.native]);
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
          expect(await execute(reference)).toEqual(['fulfilled', entry.selected]);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s+read/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          outcomes.set(mode, await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        test(`${mode} preserves the selected binding behavior`, () => {
          expect(outcomes.get(mode)).toEqual([
            'fulfilled',
            entry.params === 'a' ? entry.selected : entry.native,
          ]);
        });
      }
    });
  }
