import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'concise arrow super call', init: 'const init = () => super(); init();', broken: true },
  {
    name: 'block arrow super call',
    init: 'const init = () => { super(); }; init();',
    broken: false,
  },
  {
    name: 'sequence arrow super call',
    init: 'const init = () => (0, super()); init();',
    broken: false,
  },
  {
    name: 'conditional statement super calls',
    init: 'if (flag) super(); else super();',
    broken: false,
    conditional: true,
  },
  {
    name: 'conditional expression super calls',
    init: 'flag ? super() : super();',
    broken: false,
    conditional: true,
  },
  { name: 'initializer super call', init: 'const value = super();', broken: false },
  { name: 'try-finally super call', init: 'try { super(); } finally {}', broken: false },
  { name: 'returned super call', init: 'return super();', broken: false },
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
      const source = `class B {} class C extends B { constructor(flag) {
const read = async () => this; globalThis.read = read; ${entry.init}
} }
const pending = [];
for (const flag of ${entry.conditional ? '[true, false]' : '[true]'}) {
  const instance = new C(flag);
  pending.push(globalThis.read().then(value => value === instance));
}
globalThis.result = Promise.all(pending);`;
      const expected = entry.conditional ? [true, true] : [true];
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
        outcomes.set(mode, await execute(code));
      }
    });
    for (const mode of ['inline', 'runtime']) {
      test(`${mode} initializes the captured receiver`, () => {
        expect(outcomes.get(mode)).toEqual(entry.conditional ? [true, true] : [true]);
      });
    }
  });
}
