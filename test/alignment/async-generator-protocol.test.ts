import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async generator queue', () => {
  const require = createRequire(import.meta.url);
  const done = { value: undefined, done: true };
  const cases = [
    {
      name: 'completed generator settles all request kinds',
      body: `log.push('body');yield 1;return 2;`,
      consume: `await it.next();await it.next();return [await it.next(),await it.return(Promise.resolve(7)),await it.throw(failure).then(()=>false,error=>error===failure),log];`,
      expected: [done, { value: 7, done: true }, true, ['body']],
    },
    {
      name: 'throw before first next does not enter body',
      body: `log.push('body');try{yield 1;}finally{log.push('finally');}`,
      consume: `const rejected=await it.throw(failure).then(()=>false,error=>error===failure);return [rejected,await it.next(),log];`,
      expected: [true, done, []],
    },
    {
      name: 'return before first next awaits value without entering body',
      body: `log.push('body');try{yield 1;}finally{log.push('finally');}`,
      consume: `return [await it.return(Promise.resolve(7)),await it.next(),log];`,
      expected: [{ value: 7, done: true }, done, []],
    },
    {
      name: 'queued next waits for current await',
      body: `log.push('start');yield await gate;log.push('resume');yield 2;log.push('end');`,
      consume: `const first=it.next(),second=it.next();release(1);return [await Promise.all([first,second]),await it.next(),log];`,
      expected: [
        [
          { value: 1, done: false },
          { value: 2, done: false },
        ],
        done,
        ['start', 'resume', 'end'],
      ],
    },
    {
      name: 'queued throw enters suspended catch after first yield',
      body: `log.push('start');try{yield await gate;}catch(error){log.push(error===failure?'caught':'unexpected');yield 9;}finally{log.push('finally');}`,
      consume: `const first=it.next(),second=it.throw(failure);release(1);return [await Promise.all([first,second]),await it.next(),log];`,
      expected: [
        [
          { value: 1, done: false },
          { value: 9, done: false },
        ],
        done,
        ['start', 'caught', 'finally'],
      ],
    },
    {
      name: 'queued return survives yielding finally',
      body: `try{yield await gate;}finally{log.push('finally');yield 2;}`,
      consume: `const first=it.next(),second=it.return(7);release(1);return [await Promise.all([first,second]),await it.next(),log];`,
      expected: [
        [
          { value: 1, done: false },
          { value: 2, done: false },
        ],
        { value: 7, done: true },
        ['finally'],
      ],
    },
    {
      name: 'rejected yielded value resumes catch before next queued request',
      body: `try{yield Promise.reject(failure);}catch(error){log.push(error===failure?'caught':'unexpected');yield 3;}return 4;`,
      consume: `const first=it.next(),second=it.next();return [await Promise.all([first,second]),await it.next(),log];`,
      expected: [
        [
          { value: 3, done: false },
          { value: 4, done: true },
        ],
        done,
        ['caught'],
      ],
    },
  ];
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const mode of ['inline', 'runtime'] as const)
    for (const entry of cases)
      test(`${entry.name}, ${mode}`, async () => {
        const source = `globalThis.result=(async()=>{const log=[],failure={};let release;const gate=new Promise(resolve=>release=resolve);async function* values(){${entry.body}}const it=values();${entry.consume}})();`;
        expect(await run(source)).toEqual(entry.expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
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
        expect(await run(reference)).toEqual(entry.expected);
        const code = compile(source, {
          transforms: { asyncGeneratorFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s+function\s*\*/);
        expect(await run(code)).toEqual(entry.expected);
      });
});

describe('async delegation completion', () => {
  const require = createRequire(import.meta.url);
  const completed = { value: undefined, done: true };
  const cases = [
    {
      name: 'delegated return with done false resumes delegation before finalization',
      methods: `
      next(value) {
        log.push(['next', this === delegate, value]);
        return Promise.resolve(++step === 1 ? { value: 1, done: false } : { value: 3, done: true });
      },
      return(value) {
        log.push(['return', this === delegate, value]);
        return Promise.resolve({ value: 2, done: false });
      },`,
      consume: `
      const first = await iterator.next();
      const second = await iterator.return(7);
      const intermediate = log.slice();
      const third = await iterator.next(9);
      return [first, second, intermediate, third, await iterator.next(), log];`,
      expected: [
        { value: 1, done: false },
        { value: 2, done: false },
        [
          ['next', true, undefined],
          ['return', true, 7],
        ],
        { value: 4, done: true },
        completed,
        [
          ['next', true, undefined],
          ['return', true, 7],
          ['next', true, 9],
          ['after', 3],
          ['finally'],
        ],
      ],
    },
    {
      name: 'delegated throw with done true completes yield star and runs finally',
      methods: `
      next(value) {
        log.push(['next', this === delegate, value]);
        return Promise.resolve({ value: 1, done: false });
      },
      throw(error) {
        log.push(['throw', this === delegate, error === failure]);
        return Promise.resolve({ value: 8, done: true });
      },`,
      consume: `
      const first = await iterator.next();
      const second = await iterator.throw(failure);
      return [first, second, await iterator.next(), log];`,
      expected: [
        { value: 1, done: false },
        { value: 9, done: true },
        completed,
        [['next', true, undefined], ['throw', true, true], ['after', 8], ['finally']],
      ],
    },
  ];
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const mode of ['inline', 'runtime'] as const)
    for (const entry of cases)
      test(`${entry.name}, ${mode}`, async () => {
        const source = `globalThis.result = (async () => {
        const log = [], failure = {};
        let step = 0;
        const delegate = { ${entry.methods} };
        const iterable = { [Symbol.asyncIterator]() { return delegate; } };
        async function* values() {
          try {
            const result = yield* iterable;
            log.push(['after', result]);
            return result + 1;
          } finally { log.push(['finally']); }
        }
        const iterator = values();
        ${entry.consume}
      })();`;
        expect(await run(source)).toEqual(entry.expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
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
        expect(await run(reference)).toEqual(entry.expected);
        const code = compile(source, {
          transforms: { asyncGeneratorFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s+function\s*\*/);
        expect(code.includes('@babel/runtime/helpers/')).toBe(mode === 'runtime');
        expect(await run(code)).toEqual(entry.expected);
      });
});

describe('async delegate rejection', () => {
  const require = createRequire(import.meta.url);
  const setup = `
  const failure = new Error('close');
  const source = {
    [Symbol.asyncIterator]() {
      return {
        next() { return Promise.resolve({ value: 1, done: false }); },
        return() { return Promise.reject(failure); },
      };
    },
  };
`;
  const consume = `
  globalThis.result = (async () => {
    const iterator = values();
    await iterator.next();
    return (await iterator.return(4)).value;
  })();
`;
  const source =
    setup +
    `
  async function* values() {
    try { yield* source; }
    catch (error) { yield [error === failure, error.name]; }
  }
` +
    consume;
  const directHelpers =
    setup +
    `
  const wrap = require('@babel/runtime/helpers/wrapAsyncGenerator');
  const delegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
  const asyncIterator = require('@babel/runtime/helpers/asyncIterator');
  const values = wrap(function* () {
    try { yield* delegate(asyncIterator(source)); }
    catch (error) { yield [error === failure, error.name]; }
  });
` +
    consume;
  const codes = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function\s*\*/);
      codes.set(mode, code);
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
      });
      expect(reference?.code).toBeTypeOf('string');
      codes.set(`babel:${mode}`, reference!.code!);
    }
  });
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  test('native delegated return rejection preserves the original error', async () => {
    expect(await run(source)).toEqual([true, 'Error']);
  });
  // Adopted pinned-helper limitation; retain native expectations to detect an upstream fix.
  test.fails.each(['inline', 'runtime'])(
    '%s Babel preserves delegated rejection identity',
    async mode => {
      expect(await run(codes.get(`babel:${mode}`)!)).toEqual([true, 'Error']);
    },
  );
  test.fails.each(['inline', 'runtime'])(
    '%s Noxcturnal preserves delegated rejection identity',
    async mode => {
      expect(await run(codes.get(mode)!)).toEqual([true, 'Error']);
    },
  );
  test.fails('direct Babel helper composition preserves delegated rejection identity', async () => {
    expect(await run(directHelpers)).toEqual([true, 'Error']);
  });
});

describe('async generator parameter binding', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'declaration',
      setup: 'async function* read(a=1){var a;yield a;}',
      call: 'read()',
      method: false,
    },
    {
      name: 'expression',
      setup: 'const read=async function*(a=1){var a;yield a;};',
      call: 'read()',
      method: false,
    },
    {
      name: 'object method',
      setup: 'const owner={async *read(a=1){var a;yield a;}};',
      call: 'owner.read()',
      method: true,
    },
    {
      name: 'class method',
      setup: 'class C{async *read(a=1){var a;yield a;}}const owner=new C();',
      call: 'owner.read()',
      method: true,
    },
  ];
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const mode of ['inline', 'runtime'] as const)
    for (const parameters of [false, true])
      for (const entry of cases) {
        describe(`${entry.name}, parameters=${parameters}, ${mode}`, () => {
          let actual: unknown;
          beforeAll(async () => {
            const source = `${entry.setup}globalThis.result=${entry.call}.next();`;
            expect(await run(source)).toEqual({ value: 1, done: false });
            const reference = transformSync(source, {
              sourceType: 'script',
              babelrc: false,
              configFile: false,
              plugins: [
                require('@babel/plugin-transform-async-generator-functions'),
                ...(parameters ? [require('@babel/plugin-transform-parameters')] : []),
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
            expect(await run(reference)).toEqual({ value: 1, done: false });
            const code = compile(source, {
              transforms: { asyncGeneratorFunctions: true, parameters },
              helpers: { mode, version: '7.29.7' },
            });
            expect(code).not.toMatch(/async\s+(?:function\s*)?\*/);
            actual = await run(code);
          });
          test('preserves parameter value copied into the body binding', () => {
            expect(actual).toEqual({ value: 1, done: false });
          });
        });
      }
});

describe('async generator boundaries', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'ordinary declaration',
      setup: 'async function read() { return await 3; }',
      body: 'yield await read();',
      expected: 3,
    },
    {
      name: 'ordinary expression',
      setup: 'const read = async function() { return await 3; };',
      body: 'yield await read();',
      expected: 3,
    },
    {
      name: 'ordinary arrow',
      setup: 'const read = async () => await 3;',
      body: 'yield await read();',
      expected: 3,
    },
    {
      name: 'ordinary object method',
      setup: 'const owner = { async read() { return await 3; } };',
      body: 'yield await owner.read();',
      expected: 3,
    },
    {
      name: 'ordinary class method',
      setup: 'class C { async read() { return await 3; } } const owner = new C();',
      body: 'yield await owner.read();',
      expected: 3,
    },
    {
      name: 'nested ordinary async function',
      setup: '',
      body: 'async function read() { return await 5; } yield await read();',
      expected: 5,
    },
    {
      name: 'nested async arrow',
      setup: '',
      body: 'const read = async () => await 5; yield await read();',
      expected: 5,
    },
    {
      name: 'nested synchronous generator',
      setup: '',
      body: 'function* read() { yield 7; return 8; } const it = read(); yield [it.next(), it.next()];',
      expected: [
        { value: 7, done: false },
        { value: 8, done: true },
      ],
    },
  ];
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
      const source = `${entry.setup}
async function* selected() { ${entry.body} }
async function observe() { const it = selected(); return [await it.next(), await it.next()]; }
globalThis.result = observe();`;
      const expected = [
        { value: entry.expected, done: false },
        { value: undefined, done: true },
      ];
      expect(await execute(source)).toEqual(expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
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
      expect(await execute(reference)).toEqual(expected);
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function\s*\*/);
      expect(code).toMatch(/async\s+function\s+observe/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code)).toEqual(expected);
    });
  }
});
