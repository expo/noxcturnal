import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'parameter arrow reads super',
    params: 'a = () => super.x',
    body: 'await 0; return a();',
    expected: 9,
    broken: true,
  },
  {
    name: 'parameter arrow calls super with receiver',
    params: 'a = () => super.read()',
    body: 'await 0; return a();',
    expected: 13,
    broken: true,
  },
  {
    name: 'sequence default triggers relocation',
    params: 'a = (0, () => super.x)',
    body: 'await 0; return a();',
    expected: 9,
  },
  {
    name: 'body-created arrow sees generated binding',
    params: '',
    body: 'const a = () => super.x; await 0; return a();',
    expected: 9,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  try {
    return ['fulfilled', await context.result];
  } catch (error) {
    expect((error as Error).name).toBe('ReferenceError');
    return ['rejected', 'ReferenceError'];
  }
}
for (const kind of ['object', 'instance', 'static'])
  for (const entry of cases) {
    describe(`${kind}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const method = `async f(${entry.params}) { ${entry.body} }`;
        const setup =
          kind === 'object'
            ? `const owner = {__proto__: {x: 9, read() { return this.base + this.x; }}, base: 4, ${method}};`
            : kind === 'instance'
              ? `class B { get x() { return 9; } read() { return this.base + this.x; } } class C extends B { ${method} } const owner = new C(); owner.base = 4;`
              : `class B { static get x() { return 9; } static read() { return this.base + this.x; } } class C extends B { static ${method} } const owner = C; owner.base = 4;`;
        const source = `${setup}\nglobalThis.result = owner.f();`;
        expect(await execute(source)).toEqual(['fulfilled', entry.expected]);
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
          expect(await execute(reference)).toEqual(['fulfilled', entry.expected]);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s+f\s*\(/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          outcomes.set(mode, await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (entry.broken ? test.fails : test)(`${mode} retains the super environment`, () => {
          expect(outcomes.get(mode)).toEqual(['fulfilled', entry.expected]);
        });
      }
    });
  }
