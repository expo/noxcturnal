import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async class composition', () => {
  const require = createRequire(import.meta.url);
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    try {
      return ['fulfilled', await context.result];
    } catch (error) {
      return ['rejected', (error as Error).name];
    }
  }
  const cases = [
    {
      name: 'compound',
      body: `return super.x += await (log.push('rhs'),3);`,
      expected: [5, ['get', 'rhs', 'set:5']],
      broken: true,
    },
    {
      name: 'logical',
      body: `return super.x ||= await (log.push('rhs'),3);`,
      expected: [2, ['get']],
    },
    { name: 'update', body: `return super.x++;`, expected: [2, ['get', 'set:3']] },
    { name: 'tag', body: 'return super.read`value`;', expected: [true, []], selected: [false, []] },
    { name: 'grouped', body: `return (super.read)();`, expected: [true, []], broken: true },
    {
      name: 'computed',
      body: `return super[(log.push('key'),'read')](await (log.push('arg'),3));`,
      expected: [true, ['key', 'arg']],
    },
  ];
  for (const kind of ['instance', 'static'])
    for (const entry of cases)
      for (const mode of ['inline', 'runtime'] as const)
        describe(`${kind} ${entry.name}, ${mode}`, () => {
          const outcomes = new Map<boolean, unknown>();
          beforeAll(async () => {
            const stat = kind === 'static' ? 'static ' : '';
            const source = `const log=[]; class B{${stat}get x(){log.push('get');return 2;} ${stat}set x(v){log.push('set:'+v);} ${stat}read(){return this===owner;}} class C extends B{${stat}async run(){${entry.body}}}const owner=${kind === 'static' ? 'C' : 'new C()'};globalThis.result=owner.run().then(value=>[value,log]);`;
            expect(await run(source)).toEqual(['fulfilled', entry.expected]);
            for (const asyncFunctions of entry.name === 'grouped' ? [true, false] : [true]) {
              const reference = transformSync(source, {
                sourceType: 'script',
                babelrc: false,
                configFile: false,
                plugins: [
                  require('@babel/plugin-transform-classes'),
                  ...(asyncFunctions
                    ? [require('@babel/plugin-transform-async-to-generator')]
                    : []),
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
              expect(await run(reference)).toEqual(['fulfilled', entry.selected ?? entry.expected]);
              const code = compile(source, {
                transforms: { classes: true, asyncFunctions },
                helpers: { mode, version: '7.29.7' },
              });
              expect(code).not.toMatch(/class\s+[BC]\b/);
              if (asyncFunctions) expect(code).not.toMatch(/async\s*(?:function|run)/);
              else expect(code).toContain('async function');
              expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
              outcomes.set(asyncFunctions, await run(code));
              if (entry.name === 'compound')
                expect(outcomes.get(asyncFunctions)).toEqual([
                  'fulfilled',
                  entry.selected ?? entry.expected,
                ]);
            }
          });
          test('preserves selected combined-pass behavior', () => {
            expect(outcomes.get(true)).toEqual(['fulfilled', entry.selected ?? entry.expected]);
          });
          if (entry.name === 'grouped')
            test('class lowering alone preserves the grouped call receiver', () => {
              expect(outcomes.get(false)).toEqual(['fulfilled', entry.expected]);
            });
        });
});

describe('async class boundaries', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'computed method key uses enclosing receiver',
      source: `function make() { return (async () => { class C { [this.key]() { return 3; } } return new C().read(); })(); } globalThis.result = make.call({key: 'read'});`,
      expected: 3,
      babel: 3,
    },
    {
      name: 'heritage uses enclosing receiver',
      source: `function make() { return (async () => { class C extends this.Base {} return new C().x; })(); } globalThis.result = make.call({Base: class { x = 3; }});`,
      expected: 3,
      babel: 3,
    },
    {
      name: 'static block retains stronger local receiver',
      source: `function make() { class C { static x = 3; static { this.read = async () => this.x; } } return C.read(); } globalThis.result = make.call({x: 17});`,
      expected: 3,
      babel: 17,
    },
    {
      name: 'static field retains valid super capture',
      source: `class B { static get x() { return this.value; } } class C extends B { static value = 3; static read = async () => super.x; } globalThis.result = C.read();`,
      expected: 3,
      babel: 'SyntaxError',
    },
    {
      name: 'computed field key and initializer use different receivers',
      source: `function make() { return (async () => { class C { [this.key] = this.value; value = 3; } const instance = new C(); return [Object.hasOwn(instance, 'read'), instance.read, instance.value]; })(); } globalThis.result = make.call({key: 'read', value: 17});`,
      expected: [true, undefined, 3],
      babel: [true, undefined, 3],
    },
    {
      name: 'nested method default keeps its receiver',
      source: `function make() { return (async () => { class C { constructor() { this.value = 3; } read(a = this.value) { return a; } } return new C().read(); })(); } globalThis.result = make.call({value: 17});`,
      expected: 3,
      babel: 3,
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
    run(require, context);
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
      expect(await execute(reference)).toEqual(entry.babel);
      const code = compile(entry.source, {
        transforms: { asyncFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s*\(/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(code)).toEqual(entry.expected);
    });
  }
});

describe('async parameter composition', () => {
  const require = createRequire(import.meta.url);
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    try {
      new Function('require', 'globalThis', code)(require, context);
    } catch (e) {
      return ['sync', (e as Error).name];
    }
    try {
      return ['ok', await context.result];
    } catch (e) {
      return ['reject', (e as Error).name];
    }
  }
  const cases = [
    ['var', 'a=1', 'var a; return a;'],
    ['closure', 'a=()=>a', 'var a; return a()===a;'],
    ['throw', 'a=(()=>{throw new RangeError()})()', 'return a;'],
    ['tdz', 'a=b,b=1', 'return a;'],
    ['body', 'a=()=>typeof b', 'var b=1; return a();'],
    ['arguments', 'a=arguments[1]', 'return a;'],
  ];
  for (const kind of ['declaration', 'arrow', 'object', 'class'])
    for (const [name, params, body] of cases)
      test.each(['inline', 'runtime'] as const)(`${kind} ${name}, %s`, async mode => {
        const definition =
          kind === 'declaration'
            ? `async function read(${params}){${body}}`
            : kind === 'arrow'
              ? `const read=async(${params})=>{${body}};`
              : kind === 'object'
                ? `const owner={async read(${params}){${body}}}; const read=()=>owner.read(undefined,7);`
                : `class C{async read(${params}){${body}}} const read=()=>new C().read(undefined,7);`;
        const source =
          '(function(){' +
          definition +
          ' globalThis.result=read(undefined,7);}).call(null,undefined,9);';
        const native = await run(source);
        const expected: Record<string, unknown> = {
          var: ['ok', 1],
          closure: ['ok', true],
          throw: ['reject', 'RangeError'],
          tdz: ['reject', 'ReferenceError'],
          body: ['ok', 'undefined'],
          arguments: ['ok', kind === 'arrow' ? 9 : 7],
        };
        expect(native).toEqual(expected[name]);
        const babel = await run(
          transformSync(source, {
            babelrc: false,
            configFile: false,
            sourceType: 'script',
            plugins: [
              require('@babel/plugin-transform-parameters'),
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
          })!.code!,
        );
        expect(babel).toEqual(native);
        const code = compile(source, {
          transforms: { asyncFunctions: true, parameters: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s*(?:function|read|\()/);
        expect(code).not.toMatch(/\(\s*a\s*=(?!=)/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        expect(await run(code)).toEqual(native);
      });
});

describe('async phase order', () => {
  const require = createRequire(import.meta.url);
  const source = `async function read() { for await (const value of [1]) return value; } globalThis.result = read();`;
  const codes = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      for (const generators of [false, true]) {
        const code = compile(source, {
          transforms: { asyncFunctions: true, asyncGeneratorFunctions: generators },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s+function/);
        codes.set(`${mode}:${generators}`, code);
      }
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
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
  test('native async function permits for-await', async () => {
    expect(await run(source)).toBe(1);
  });
  test.each(['inline', 'runtime'])(
    '%s combined async transforms preserve valid output',
    async mode => {
      expect(await run(codes.get(`${mode}:true`)!)).toBe(1);
    },
  );
  // Shared successful-output defect: retaining the Babel result is not a validity contract.
  test.fails.each(['inline', 'runtime'])(
    '%s Babel async-only output remains executable',
    async mode => {
      expect(await run(codes.get(`babel:${mode}`)!)).toBe(1);
    },
  );
  test.each(['inline', 'runtime'])('%s async-only output remains executable', async mode => {
    expect(await run(codes.get(`${mode}:false`)!)).toBe(1);
  });
});

describe('async refresh composition', () => {
  const require = createRequire(import.meta.url);
  const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
  const cases = [
    {
      name: 'declaration',
      definition: `async function App(input){const [value]=useState(3);await 0;return [value,input,this.base];}`,
      invoke: `App.call({base:4},7)`,
      expected: ['fulfilled', [3, 7, 4]],
    },
    {
      name: 'expression',
      definition: `const App=async function(input){const [value]=useState(3);await 0;return [value,input,this.base];};`,
      invoke: `App.call({base:4},7)`,
      expected: ['fulfilled', [3, 7, 4]],
    },
    {
      name: 'lexical arrow',
      definition: `function make(){const App=async(input)=>{const [value]=useState(3);await 0;return [value,input,this.base];};return App;}const App=make.call({base:4});`,
      invoke: `App(7)`,
      expected: ['fulfilled', [3, 7, 4]],
    },
    {
      name: 'rejected expression',
      definition: `const App=async function(){useState(3);await 0;throw new RangeError('expected');};`,
      invoke: `App()`,
      expected: ['rejected', 'RangeError'],
    },
  ];
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    let calls = 0;
    let signatures = 0;
    // Model only the instrumentation ABI. This does not render an async React component.
    new Function('require', 'globalThis', 'useState', '$RefreshReg$', '$RefreshSig$', code)(
      require,
      context,
      (value: unknown) => {
        calls++;
        return [value];
      },
      () => {},
      () => {
        signatures++;
        return (value: unknown) => value;
      },
    );
    return { result: await context.result, calls, signatures };
  }
  for (const entry of cases)
    for (const compact of [false, true])
      test.each(['inline', 'runtime'] as const)(
        `${entry.name}, compact=${compact}, %s`,
        async mode => {
          const source = `${entry.definition} globalThis.result=${entry.invoke}.then(value=>['fulfilled',value],error=>['rejected',error.name]);`;
          const native = await run(source);
          expect(native.result).toEqual(entry.expected);
          expect(native.calls).toBe(1);
          const reference = transformSync(source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            compact,
            plugins: [
              [referenceRequire('react-refresh/babel'), { skipEnvCheck: true }],
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
          const code = compile(
            source,
            {
              compact,
              reactRefresh: {},
              transforms: { asyncFunctions: true },
              helpers: { mode, version: '7.29.7' },
            },
            'input.jsx',
          );
          expect(code).not.toMatch(/async\s*(?:function|\()/);
          expect(code).toContain('$RefreshSig$');
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          for (const output of [reference, code]) {
            const actual = await run(output);
            expect(actual.result).toEqual(entry.expected);
            expect(actual.calls).toBe(1);
            expect(actual.signatures).toBeGreaterThan(0);
          }
        },
      );
});
