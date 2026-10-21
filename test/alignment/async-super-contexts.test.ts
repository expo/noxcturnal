import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async super references', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'tagged receiver',
      expression: 'super.read`hello`',
      native: [true, []],
      babel: [true, []],
      selected: [true, []],
      broken: true,
    },
    {
      name: 'parenthesized receiver',
      expression: '(super.read)()',
      native: [true, []],
      babel: [true, []],
      selected: [true, []],
      broken: true,
    },
    {
      name: 'ordinary receiver control',
      expression: 'super.read()',
      native: [true, []],
      babel: [true, []],
      selected: [true, []],
      broken: false,
    },
    {
      name: 'optional receiver follows Babel',
      expression: 'super.read?.()',
      native: [true, []],
      babel: [false, []],
      selected: [false, []],
      broken: false,
    },
    {
      name: 'delete follows Babel',
      expression: 'delete super.x',
      native: 'ReferenceError',
      babel: [true, []],
      selected: [true, []],
      broken: false,
    },
    {
      name: 'array target must remain executable despite Babel failure',
      expression: '[super.x] = [3]',
      native: [[3], [3]],
      babel: 'SyntaxError',
      selected: [[3], [3]],
      broken: true,
    },
    {
      name: 'object target must remain executable despite Babel failure',
      expression: '({x: super.x} = {x: 3})',
      native: [{ x: 3 }, [3]],
      babel: 'SyntaxError',
      selected: [{ x: 3 }, [3]],
      broken: true,
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    let run: Function;
    try {
      run = new Function('require', 'globalThis', code);
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxError);
      return 'SyntaxError';
    }
    try {
      run(require, context);
      return await context.result;
    } catch (error) {
      expect(error).toBeInstanceOf(ReferenceError);
      return 'ReferenceError';
    }
  }
  for (const kind of ['object', 'class'])
    for (const entry of cases) {
      describe(`${kind}: ${entry.name}`, () => {
        const outcomes = new Map<string, unknown>();
        beforeAll(async () => {
          const method = `async run() { return [${entry.expression}, log]; }`;
          const source = `const log = [];
${kind === 'object' ? `const owner = { __proto__: {get x() { return 2; }, set x(v) { log.push(v); }, read() { return this === owner; }}, ${method} };` : `class B { get x() { return 2; } set x(v) { log.push(v); } read() { return this === owner; } } class C extends B { ${method} } const owner = new C();`}
globalThis.result = owner.run();`;
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
            expect(await execute(reference)).toEqual(entry.babel);
            const code = compile(source, {
              transforms: { asyncFunctions: true },
              helpers: { mode, version: '7.29.7' },
            });
            expect(code).not.toMatch(/async\s+run/);
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            outcomes.set(mode, await execute(code));
          }
        });
        for (const mode of ['inline', 'runtime']) {
          test(`${mode} preserves the selected contract`, () => {
            expect(outcomes.get(mode)).toEqual(entry.selected);
          });
        }
      });
    }
});

describe('async default super', () => {
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
          test(`${mode} retains the super environment`, () => {
            expect(outcomes.get(mode)).toEqual(['fulfilled', entry.expected]);
          });
        }
      });
    }
});

describe('async derived this', () => {
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
        test(`${mode} preserves receiver initialization timing`, () => {
          expect(outcomes.get(mode)).toEqual(entry.selected);
        });
      }
    });
  }
});

describe('async generator super write', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'compound write suspends in RHS',
      body: 'super.x += yield 2;yield this.value;',
      expected: [
        { value: 2, done: false },
        { value: 4, done: false },
      ],
    },
    {
      name: 'plain write without suspension',
      body: 'super.x=3;yield this.value;',
      expected: [
        { value: 3, done: false },
        { value: undefined, done: true },
      ],
    },
  ];
  async function run(fn: Function): Promise<unknown> {
    const context: Record<string, unknown> = {};
    fn(require, context);
    return await context.result;
  }
  for (const mode of ['inline', 'runtime'] as const)
    for (const classes of [false, true])
      for (const entry of cases) {
        describe(`${entry.name}, classes=${classes}, ${mode}`, () => {
          let parseError: unknown, actual: unknown;
          beforeAll(async () => {
            const source = `class B{get x(){return 1;}set x(v){this.value=v;}}class C extends B{async *run(){${entry.body}}}globalThis.result=(async()=>{const it=new C().run();return [await it.next(),await it.next(3)];})();`;
            expect(await run(new Function('require', 'globalThis', source))).toEqual(
              entry.expected,
            );
            const reference = transformSync(source, {
              sourceType: 'script',
              babelrc: false,
              configFile: false,
              plugins: [
                require('@babel/plugin-transform-async-generator-functions'),
                ...(classes ? [require('@babel/plugin-transform-classes')] : []),
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
            expect(await run(new Function('require', 'globalThis', reference))).toEqual(
              entry.expected,
            );
            const code = compile(source, {
              transforms: { asyncGeneratorFunctions: true, classes },
              helpers: { mode, version: '7.29.7' },
            });
            expect(code).not.toMatch(/async\s*\*/);
            if (classes) expect(code).not.toMatch(/\bclass\s+[BC]\b/);
            let fn: Function | undefined;
            try {
              fn = new Function('require', 'globalThis', code);
            } catch (error) {
              if (!(error instanceof SyntaxError)) throw error;
              parseError = error;
            }
            if (fn) actual = await run(fn);
          });
          test('preserves the super operation across suspension', () => {
            expect(parseError).toBeUndefined();
            expect(actual).toEqual(entry.expected);
          });
        });
      }
});
