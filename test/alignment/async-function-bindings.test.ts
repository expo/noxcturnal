import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { runInNewContext } from 'node:vm';

describe('async arguments shadowing', () => {
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
          test(`${mode} preserves distinct arguments bindings`, () => {
            expect(outcomes.get(mode)).toEqual(entry.expected);
          });
        }
      });
    }
});

describe('async top level arguments', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'uninvoked arrow does not read absent binding',
      source: 'const read = async () => arguments; globalThis.result = typeof read;',
      native: ['fulfilled', 'function'],
      selected: ['fulfilled', 'function'],
      binding: false,
    },
    {
      name: 'typeof absent binding remains defined',
      source: 'const read = async () => typeof arguments; globalThis.result = read();',
      native: ['fulfilled', 'undefined'],
      selected: ['fulfilled', 'undefined'],
      binding: false,
    },
    {
      name: 'direct absent read follows Babel limitation',
      source: 'const read = async () => arguments; globalThis.result = read();',
      native: ['rejected', 'ReferenceError'],
      selected: ['fulfilled', undefined],
      binding: false,
    },
    {
      name: 'existing global binding is captured',
      source: 'const read = async () => arguments[0]; globalThis.result = read();',
      native: ['fulfilled', 3],
      selected: ['fulfilled', 3],
      binding: true,
    },
    {
      name: 'global replacement follows Babel snapshot limitation',
      source:
        'const read = async () => arguments[0]; globalThis.arguments = [7]; globalThis.result = read();',
      native: ['fulfilled', 7],
      selected: ['fulfilled', 3],
      binding: true,
    },
  ];
  async function execute(code: string, binding: boolean): Promise<unknown> {
    const context: Record<string, unknown> = { require, ...(binding ? { arguments: [3] } : {}) };
    // A real script context avoids injecting new Function's own arguments object.
    runInNewContext(code, context, { timeout: 1000 });
    try {
      return ['fulfilled', await context.result];
    } catch (error) {
      expect((error as Error).name).toBe('ReferenceError');
      return ['rejected', 'ReferenceError'];
    }
  }
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
      expect(await execute(entry.source, entry.binding)).toEqual(entry.native);
      const reference = transformSync(entry.source, {
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
      expect(await execute(reference, entry.binding)).toEqual(entry.selected);
      const code = compile(entry.source, {
        transforms: { asyncFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s*\(/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code, entry.binding)).toEqual(entry.selected);
    });
  }
});

describe('async declaration scope', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'sloppy block declaration visibility follows Babel',
      source: `{ async function f() { return 3; } } globalThis.result = typeof f;`,
      native: 'undefined',
      selected: 'function',
    },
    {
      name: 'outer lexical binding prevents Annex B replacement',
      source: `let f = 7; { async function f() { return 3; } globalThis.inner = f(); }
globalThis.result = Promise.all([globalThis.inner, f]);`,
      native: [3, 7],
      selected: [3, 7],
    },
    {
      name: 'loop declarations retain independent captured bindings',
      source: `function outer() { const out = []; for (let n = 0; n < 2; n++) {
async function f() { return n; } out.push(f); }
return Promise.all(out.map(f => f())); } globalThis.result = outer();`,
      native: [0, 1],
      selected: [0, 1],
    },
    {
      name: 'switch declaration is callable before its case executes',
      source: `function outer() { let out; switch (1) { case 1: out = f(); break;
case 2: async function f() { return 4; } } return out; } globalThis.result = outer();`,
      native: 4,
      selected: 4,
    },
    {
      name: 'sloppy var replacement follows Babel',
      source: `function outer() { var f = 7; { async function f() { return 3; } }
return [typeof f, typeof f === 'function' ? f() : f]; }
globalThis.result = Promise.all(outer());`,
      native: ['number', 7],
      selected: ['function', 3],
    },
    {
      name: 'enclosing function strictness retains block visibility',
      source: `function outer() { 'use strict'; { async function f() { return 3; } }
return typeof f; } globalThis.result = outer();`,
      native: 'undefined',
      selected: 'undefined',
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
      expect(await execute(entry.source)).toEqual(entry.native);
      const reference = transformSync(entry.source, {
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
      const code = compile(entry.source, {
        transforms: { asyncFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code)).toEqual(entry.selected);
    });
  }
});

describe('async method var binding', () => {
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
});

describe('async inferred name collision', () => {
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
          test(`${mode} invokes the delegate without self-recursion`, () => {
            expect(outcomes.get(mode)).toEqual(['fulfilled', 3]);
          });
        }
      });
    }
});

describe('async inferred name validity', () => {
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
          test(`${mode} emits executable output`, () => {
            expect(outcomes.get(mode)).toBe(3);
          });
        }
      });
    }
});
