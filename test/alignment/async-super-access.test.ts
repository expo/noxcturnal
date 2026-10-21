import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async super key order', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    { name: 'computed write', expression: 'super[key] = rhs()', write: true, call: false },
    {
      name: 'computed write with suspended RHS',
      expression: 'super[key] = await rhs()',
      write: true,
      call: false,
    },
    {
      name: 'computed call with suspended argument',
      expression: 'super[key](await rhs())',
      write: false,
      call: true,
    },
    { name: 'computed read', expression: 'super[key]', write: false, call: false },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const mutate of [false, true])
    for (const entry of cases) {
      if (mutate && !entry.write && !entry.call) continue;
      test.each(['inline', 'runtime'] as const)(
        `${entry.name}, prototype mutation=${mutate}, %s`,
        async mode => {
          const source = `const log = []; let name = ${JSON.stringify(entry.call ? 'read' : 'x')};
const key = { [Symbol.toPrimitive]() { log.push('key:' + name); return name; } };
function rhs() { log.push('rhs'); name = 'y'; ${mutate ? "Object.setPrototypeOf(owner, {set y(v) {log.push('new:set:y');}, read() {return false;}});" : ''} return 3; }
const owner = { __proto__: {get x() { return 9; }, set x(v) { log.push('set:x'); }, set y(v) { log.push('set:y'); }, read() { return this === owner; }},
async run() { return [${entry.expression}, log]; } };
globalThis.result = owner.run();`;
          const expected = entry.write
            ? [3, ['rhs', 'key:y', mutate ? 'new:set:y' : 'set:y']]
            : entry.call
              ? [true, ['key:read', 'rhs']]
              : [9, ['key:x']];
          expect(await execute(source)).toEqual(expected);
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
          expect(code).not.toMatch(/async\s+run/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          expect(await execute(code)).toEqual(expected);
        },
      );
    }
});

describe('async super initialization', () => {
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
});

describe('async super operations', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'compound addition',
      expression: 'super.x += 3',
      expected: [5, ['get', ['set', 5]]],
      broken: true,
    },
    {
      name: 'postfix update',
      expression: 'super.x++',
      expected: [2, ['get', ['set', 3]]],
      broken: true,
    },
    {
      name: 'prefix update',
      expression: '++super.x',
      expected: [3, ['get', ['set', 3]]],
      broken: true,
    },
    {
      name: 'logical OR skips assignment',
      expression: 'super.x ||= rhs()',
      expected: [2, ['get']],
      broken: true,
    },
    {
      name: 'logical AND reads before assignment',
      expression: 'super.x &&= rhs()',
      expected: [3, ['get', 'rhs', ['set', 3]]],
      broken: true,
    },
    {
      name: 'nullish assignment skips assignment',
      expression: 'super.x ??= rhs()',
      expected: [2, ['get']],
      broken: true,
    },
    {
      name: 'computed compound assignment awaits RHS',
      expression: 'super[key()] += await rhs()',
      expected: [5, ['key', 'get', 'rhs', ['set', 5]]],
      broken: true,
    },
    {
      name: 'plain computed assignment control',
      expression: 'super[key()] = await rhs()',
      expected: [3, ['key', 'rhs', ['set', 3]]],
      broken: false,
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const owner of ['object', 'class'])
    for (const entry of cases) {
      describe(`${owner}: ${entry.name}`, () => {
        const outcomes = new Map<string, unknown>();
        beforeAll(async () => {
          const accessors = `get x() { log.push('get'); return 2; } set x(v) { log.push(['set', v]); }`;
          const method = `async read() { return [${entry.expression}, log]; }`;
          const source = `const log = []; function key() { log.push('key'); return 'x'; } function rhs() { log.push('rhs'); return 3; }
${owner === 'object' ? `const owner = {__proto__: {get x() { log.push('get'); return 2; }, set x(v) { log.push(['set', v]); }}, ${method}};` : `class B { ${accessors} } class C extends B { ${method} } const owner = new C();`}
globalThis.result = owner.read();`;
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
            expect(code).not.toMatch(/async\s+read/);
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            let invalid = false;
            try {
              new Function('require', 'globalThis', code);
            } catch (error) {
              expect(error).toBeInstanceOf(SyntaxError);
              invalid = true;
            }
            outcomes.set(mode, invalid ? 'SyntaxError' : await execute(code));
          }
        });
        for (const mode of ['inline', 'runtime']) {
          test(`${mode} preserves operation and effects`, () => {
            expect(outcomes.get(mode)).toEqual(entry.expected);
          });
        }
      });
    }
});

describe('async super class scope', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'heritage initializes enclosing receiver',
      init: 'class Inner extends (super(), B) {}',
      calls: 1,
    },
    {
      name: 'computed method key initializes enclosing receiver',
      init: 'class Inner { [(super(), "key")]() {} }',
      calls: 1,
    },
    {
      name: 'computed field key initializes enclosing receiver',
      init: 'class Inner { [(super(), "key")] = 1; }',
      calls: 1,
    },
    {
      name: 'nested constructor does not replace enclosing capture',
      init: 'class Inner extends B { constructor() { super(); } } super(); new Inner();',
      calls: 2,
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
      const source = `let calls = 0; class B { constructor() { this.id = ++calls; } }
class C extends B { constructor() {
const read = async () => this; globalThis.read = read; ${entry.init}
} }
const instance = new C();
globalThis.result = globalThis.read().then(value => [value === instance, instance.id, calls]);`;
      const expected = [true, 1, entry.calls];
      expect(await execute(source)).toEqual(expected);
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
      expect(await execute(code)).toEqual(expected);
    });
  }
});

describe('async nested super', () => {
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
        test(`${mode} retains the initialized receiver after abrupt completion`, () => {
          expect(outcomes.get(mode)).toEqual([true, 1, 2, true]);
        });
      }
    });
  }
});
