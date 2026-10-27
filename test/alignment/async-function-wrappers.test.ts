import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async expression branches', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'named expression recursion survives outer reassignment',
      source: `let read = async function self(n) { return n ? 1 + await self(n - 1) : 0; }; const saved = read; read = null; globalThis.result = saved(2);`,
      expected: 2,
    },
    {
      name: 'named expression parameter shadows self binding',
      source: `const read = async function self(self = () => self) { return typeof self(); }; globalThis.result = read();`,
      expected: 'function',
    },
    {
      name: 'anonymous zero-parameter fast path',
      source: `globalThis.result = (async function() { return await 3; })();`,
      expected: 3,
    },
    {
      name: 'anonymous default-first fast path keeps outer binding',
      source: `const read = async function(a = read) { return a === read; }; globalThis.result = read();`,
      expected: true,
    },
    {
      name: 'anonymous positional wrapper forwards receiver and arguments',
      source: `const read = async function(a) { return [this.x, a, arguments.length]; }; globalThis.result = read.call({x: 3}, 4, 5);`,
      expected: [3, 4, 2],
    },
    {
      name: 'unnamed zero-parameter arrow fast path captures receiver',
      source: `function outer() { return (async () => { await 0; return this.x; })(); } globalThis.result = outer.call({x: 3});`,
      expected: 3,
    },
    {
      name: 'unnamed positional arrow wrapper forwards argument',
      source: `globalThis.result = (async (a) => { await 0; return a; })(3);`,
      expected: 3,
    },
    {
      name: 'inferred arrow wrapper retains outer default self reference',
      source: `const read = async (a = read) => a === read; globalThis.result = read();`,
      expected: true,
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
      expect(await execute(entry.source)).toEqual(entry.expected);
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
      expect(await execute(reference)).toEqual(entry.expected);
      const code = compile(entry.source, {
        transforms: { asyncFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s*(?:function|\()/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code)).toEqual(entry.expected);
    });
  }
});

describe('async strict wrapper', () => {
  const require = createRequire(import.meta.url);
  const strictResult = [
    [true, 'undefined', 1],
    [false, 'number', 1],
  ];
  const boxedResult = [
    [false, 'object', 1],
    [false, 'object', 1],
  ];
  const body = `await 0; return [this === undefined, typeof this, (a = 4, arguments[0])];`;
  const cases = [
    {
      name: 'object method with a local strict directive',
      declaration: `const f = ({ async f(a) { 'use strict'; ${body} } }).f;`,
      native: strictResult,
      selected: strictResult,
    },
    {
      name: 'object method inheriting script strictness',
      declaration: `'use strict'; const f = ({ async f(a) { ${body} } }).f;`,
      native: strictResult,
      selected: strictResult,
    },
    {
      name: 'class method with implicit strictness',
      declaration: `class C { async f(a) { ${body} } } const f = C.prototype.f;`,
      native: strictResult,
      selected: strictResult,
    },
    {
      name: 'declaration receiver boxing follows Babel',
      declaration: `async function f(a) { 'use strict'; ${body} }`,
      native: strictResult,
      selected: boxedResult,
    },
    {
      name: 'expression receiver boxing follows Babel',
      declaration: `const f = async function(a) { 'use strict'; ${body} };`,
      native: strictResult,
      selected: boxedResult,
    },
    {
      name: 'strict named-expression write follows Babel',
      declaration: `const f = async function self() { 'use strict'; try { self = 3; return typeof self; } catch (error) { return error.name; } };`,
      native: ['TypeError', 'TypeError'],
      selected: ['number', 'number'],
    },
    {
      name: 'sloppy named-expression write follows Babel',
      declaration: `const f = async function self() { self = 3; return typeof self; };`,
      native: ['function', 'function'],
      selected: ['number', 'number'],
    },
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
        const source = `${entry.declaration}\nglobalThis.result = Promise.all([f(1), f.call(2, 1)]);`;
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
          expect(code).not.toMatch(/async\s+(?:function|f\s*\()/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          const actual = await execute(code);
          expect(Array.isArray(actual)).toBe(true);
          outcomes.set(mode, actual);
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

describe('async method parameter rejection', () => {
  const require = createRequire(import.meta.url);
  const modes = ['inline', 'runtime'] as const;
  const cases = [
    {
      name: 'object method destructuring without a default',
      source: `const owner = { async read({ value }) { return value; } };
globalThis.result = observe(() => owner.read(null));`,
    },
    {
      name: 'class method destructuring with a literal null default',
      source: `class C { async read({ value } = null) { return value; } }
globalThis.result = observe(() => new C().read());`,
    },
  ];

  type Observation = readonly [string, string];
  async function execute(code: string): Promise<Observation> {
    const context: Record<string, unknown> = {};
    const describeError = (error: unknown) => (error instanceof Error ? error.name : String(error));
    const observe = async (call: () => unknown): Promise<Observation> => {
      let result: unknown;
      try {
        result = call();
      } catch (error) {
        return ['sync', describeError(error)];
      }
      try {
        await result;
        return ['fulfilled', ''];
      } catch (error) {
        return ['rejected', describeError(error)];
      }
    };
    new Function('globalThis', 'require', 'observe', code)(context, require, observe);
    return (await context.result) as Observation;
  }

  function babel(source: string, mode: 'inline' | 'runtime'): string {
    return transformSync(source, {
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
  }

  function nox(source: string, mode: 'inline' | 'runtime'): string {
    const code = compile(source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s+(?:read|function)/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    return code;
  }

  describe.each(cases)('$name', ({ source }) => {
    const outcomes = new Map<string, Observation>();
    beforeAll(async () => {
      expect(await execute(source)).toEqual(['rejected', 'TypeError']);
      for (const mode of modes) {
        const reference = babel(source, mode);
        expect(reference.includes('@babel/runtime/')).toBe(mode === 'runtime');
        expect(await execute(reference)).toEqual(['rejected', 'TypeError']);
        const result = await execute(nox(source, mode));
        // Compilation and unrelated runtime errors cannot satisfy test.
        expect(result[1]).toBe('TypeError');
        expect(['sync', 'rejected']).toContain(result[0]);
        outcomes.set(mode, result);
      }
    });
    for (const mode of modes) {
      test(`${mode} returns a rejected promise for binding initialization failure`, () => {
        expect(outcomes.get(mode)).toEqual(['rejected', 'TypeError']);
      });
    }
  });

  test.each(modes)('%s relocates a method pattern with an effectful default', async mode => {
    const source = `function fail() { throw 'stop'; }
const owner = { async read({ value = fail() } = {}) { return value; } };
globalThis.result = observe(() => owner.read());`;
    expect(await execute(source)).toEqual(['rejected', 'stop']);
    expect(await execute(babel(source, mode))).toEqual(['rejected', 'stop']);
    expect(await execute(nox(source, mode))).toEqual(['rejected', 'stop']);
  });

  test.each(modes)(
    '%s rejects destructuring failures in an ordinary async function',
    async mode => {
      const source = `async function read({ value }) { return value; }
globalThis.result = observe(() => read(null));`;
      expect(await execute(source)).toEqual(['rejected', 'TypeError']);
      expect(await execute(babel(source, mode))).toEqual(['rejected', 'TypeError']);
      expect(await execute(nox(source, mode))).toEqual(['rejected', 'TypeError']);
    },
  );
});

describe('async validator name', () => {
  const require = createRequire(import.meta.url);
  const source = `globalThis.result = (async () => {
  for await (const value of []) {}
  for (let _step = 0, _iterator = { next() { return 3; } }; _step < 1; _step++) {
    return await _iterator.next();
  }
})();`;
  const outputs = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/for\s+await/);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      outputs.set(mode, code);
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          require('@babel/plugin-transform-async-generator-functions'),
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
      expect(reference).not.toMatch(/for\s+await/);
      outputs.set('babel:' + mode, reference);
    }
  });
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  test('native user method returns a primitive', async () => expect(await run(source)).toBe(3));
  test.each(['inline', 'runtime'])('%s Babel preserves the user loop', async mode =>
    expect(await run(outputs.get('babel:' + mode)!)).toBe(3),
  );
  test.each(['inline', 'runtime'])('%s only validates generated iterator calls', async mode =>
    expect(await run(outputs.get(mode)!)).toBe(3),
  );

  describe('validator helper preserves external references', () => {
    const source = `globalThis.result = (async () => {
    for await (const value of [1]) {}
    return _iteratorResult;
  })();`;
    const outputs = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(source, {
          transforms: { asyncGeneratorFunctions: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/for\s+await/);
        outputs.set(mode, code);
        outputs.set(
          'babel:' + mode,
          transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            plugins: [
              require('@babel/plugin-transform-async-generator-functions'),
              ...(mode === 'runtime'
                ? [
                    [
                      require('@babel/plugin-transform-runtime'),
                      { version: '7.29.7', useESModules: false },
                    ],
                  ]
                : []),
            ],
          })!.code!,
        );
      }
    });
    async function runExternal(code: string) {
      const context: Record<string, unknown> = {};
      new Function('require', '_iteratorResult', 'globalThis', code)(require, 'external', context);
      return await context.result;
    }
    test('native external reference control', async () =>
      expect(await runExternal(source)).toBe('external'));
    test.each(['inline', 'runtime'])('%s Babel preserves the external reference', async mode => {
      expect(await runExternal(outputs.get('babel:' + mode)!)).toBe('external');
    });
    test.each(['inline', 'runtime'])(
      '%s validator helper avoids external-name capture',
      async mode => {
        expect(await runExternal(outputs.get(mode)!)).toBe('external');
      },
    );
  });
});

describe('async capture boundaries', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'default new.target capture follows Babel parameter-scope limitation',
      source:
        'function C(read = async () => new.target) { this.read = read; } globalThis.result = new C().read().then(value => value === C);',
      native: true,
      babel: 'ReferenceError',
      selected: 'ReferenceError',
    },
    {
      name: 'default receiver capture follows Babel limitation',
      source:
        'function f(a = async () => this) { return a(); } globalThis.result = f.call({x: 3}).then(v => v.x);',
      native: 3,
      babel: 'ReferenceError',
      selected: 'ReferenceError',
    },
    {
      name: 'default arguments capture preserves native binding',
      source:
        'function f(a = async () => arguments[1]) { return a(); } globalThis.result = f(undefined, 3);',
      native: 3,
      babel: 'ReferenceError',
      selected: 3,
    },
    {
      name: 'instance field captures instance receiver',
      source: 'class C { x = 3; read = async () => this.x; } globalThis.result = new C().read();',
      native: 3,
      babel: 3,
      selected: 3,
    },
    {
      name: 'static field retains stronger receiver behavior',
      source:
        'function make() { class C { static x = 3; static read = async () => this.x; } return C; } const C = make.call({x: 17}); globalThis.result = C.read();',
      native: 3,
      babel: 17,
      selected: 3,
    },
    {
      name: 'instance field captures super environment',
      source:
        'class B { get x() { return 3; } } class C extends B { read = async () => super.x; } globalThis.result = new C().read();',
      native: 3,
      babel: 3,
      selected: 3,
    },
    {
      name: 'constructor default follows Babel scope limitation',
      source:
        'class B {} class C extends B { constructor(a = async () => this) { super(); globalThis.result = a().then(v => v === this); } } new C();',
      native: true,
      babel: 'ReferenceError',
      selected: 'ReferenceError',
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    const run = new Function('require', 'globalThis', code);
    try {
      run(require, context);
      return await context.result;
    } catch (error) {
      expect(error).toBeInstanceOf(ReferenceError);
      return 'ReferenceError';
    }
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
      expect(await execute(reference)).toEqual(entry.babel);
      const code = compile(entry.source, {
        transforms: { asyncFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s*\(/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code)).toEqual(entry.selected);
    });
  }
});
