import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'return closure without accessing its receiver',
    body: 'const read = async () => this; return {read};',
    after: 'globalThis.result = typeof instance.read;',
    native: 'function',
    selected: 'function',
    broken: true,
  },
  {
    name: 'returned closure skips receiver branch',
    body: 'return {read: async flag => flag ? this : 7};',
    after: 'globalThis.result = instance.read(false);',
    native: 7,
    selected: 7,
    broken: true,
  },
  {
    name: 'early receiver read follows Babel',
    body: 'const read = async () => this; globalThis.result = observe(read()); super();',
    after: '',
    native: 'rejected:ReferenceError',
    selected: 'undefined',
    broken: false,
  },
  {
    name: 'receiver read after initialization',
    body: 'const read = async () => this; super(); globalThis.result = read().then(value => value === this);',
    after: '',
    native: true,
    selected: true,
    broken: false,
  },
  {
    name: 'suspension allows receiver initialization',
    body: 'const read = async () => { await 0; return this; }; const pending = read(); super(); globalThis.result = pending.then(value => value === this);',
    after: '',
    native: true,
    selected: true,
    broken: false,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  const run = new Function('require', 'globalThis', 'observe', code);
  const observe = async (pending: Promise<unknown>) => {
    try {
      return (await pending) === undefined ? 'undefined' : 'value';
    } catch (error) {
      expect(error).toBeInstanceOf(ReferenceError);
      return 'rejected:ReferenceError';
    }
  };
  try {
    run(require, context, observe);
  } catch (error) {
    expect(error).toBeInstanceOf(ReferenceError);
    return 'sync:ReferenceError';
  }
  return await context.result;
}
for (const entry of cases) {
  describe(entry.name, () => {
    const outcomes = new Map<string, unknown>();
    beforeAll(async () => {
      const source = `class B {} class C extends B { constructor() { ${entry.body} } }
const instance = new C(); ${entry.after}`;
      expect(await execute(source)).toEqual(entry.native);
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
        expect(await execute(reference)).toEqual(entry.selected);
        const code = compile(source, {
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s*(?:flag|\()/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        outcomes.set(mode, await execute(code));
      }
    });
    for (const mode of ['inline', 'runtime']) {
      (entry.broken ? test.fails : test)(`${mode} preserves receiver initialization timing`, () => {
        expect(outcomes.get(mode)).toEqual(entry.selected);
      });
    }
  });
}
