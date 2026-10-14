import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'statement visits nested arguments', init: 'super(super());', broken: false },
  {
    name: 'initializer skips nested arguments',
    init: 'const value = super(super());',
    broken: true,
  },
  { name: 'sequence skips nested arguments', init: '(0, super(super()));', broken: true },
  { name: 'return skips nested arguments', init: 'return super(super());', broken: true },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases) {
  describe(entry.name, () => {
    const outcomes = new Map<string, unknown>();
    beforeAll(async () => {
      const source = `let calls = 0; let caught = false;
class B { constructor() { this.id = ++calls; } }
class C extends B { constructor() {
  const read = async () => this; globalThis.read = read;
  try { ${entry.init} } catch (error) { if (!(error instanceof ReferenceError)) throw error; caught = true; }
} }
const instance = new C();
globalThis.result = globalThis.read().then(value => [value === instance, instance.id, calls, caught]);`;
      const expected = [true, 1, 2, true];
      expect(await execute(source)).toEqual(expected);
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
        expect(await execute(reference)).toEqual(expected);
        const code = compile(source, {
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s*\(/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        const actual = await execute(code);
        expect((actual as unknown[]).slice(1)).toEqual([1, 2, true]);
        outcomes.set(mode, actual);
      }
    });
    for (const mode of ['inline', 'runtime']) {
      (entry.broken ? test.fails : test)(
        `${mode} retains the initialized receiver after abrupt completion`,
        () => {
          expect(outcomes.get(mode)).toEqual([true, 1, 2, true]);
        },
      );
    }
  });
}
