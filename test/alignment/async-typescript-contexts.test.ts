import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('async typescript capture', () => {
  const require = createRequire(import.meta.url);
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const expression of [
    'this as any',
    'this!',
    '<any>this',
    'this satisfies object',
    'arguments as any',
    'arguments!',
  ])
    for (const mode of ['inline', 'runtime'] as const)
      describe(`${expression}, ${mode}`, () => {
        const outcomes = new Map<boolean, unknown>();
        const argumentsCase = expression.startsWith('arguments');
        beforeAll(async () => {
          const source = `function make(this:any){return async()=>(${expression});}
const owner={}; const read=make.call(owner,7);
globalThis.result=read().then(value=>${argumentsCase ? 'value[0]===7' : 'value===owner'});`;
          const erased = ts.transpileModule(source, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
            reportDiagnostics: true,
          });
          expect(erased.diagnostics).toEqual([]);
          expect(await run(erased.outputText)).toBe(true);
          const reference = transformSync(source, {
            filename: 'input.ts',
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-typescript'),
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
          expect(await run(reference)).toBe(true);
          for (const parameters of [false, true]) {
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: { asyncFunctions: true, parameters },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(code).not.toMatch(/async\s*\(/);
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            outcomes.set(parameters, await run(code));
          }
        });
        test('retains lexical capture with fused type erasure', () => {
          expect(outcomes.get(false)).toBe(true);
        });
        test('retains lexical capture with the separate language prepass', () => {
          expect(outcomes.get(true)).toBe(true);
        });
      });
});

describe('async typescript composition', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'super non-null assertion retains the method receiver',
      source: `class B{read(){return this;}} class C extends B{async run(){return super.read!()===this;}} globalThis.result=new C().run();`,
      expected: true,
      babel: false,
      invalid: true,
    },
    {
      name: 'super type assertion retains the method receiver',
      source: `class B{read(){return this;}} class C extends B{async run(){return (super.read as ()=>B)()===this;}} globalThis.result=new C().run();`,
      expected: true,
      babel: false,
      invalid: true,
    },
    {
      name: 'typed this does not count toward declaration arity',
      source: `async function read(this: {x:number}, value:number){return [this.x,value,read.length,arguments.length];} globalThis.result=read.call({x:3},7);`,
      expected: [3, 7, 1, 1],
    },
    {
      name: 'typed this does not count toward expression arity',
      source: `const read=async function(this: {x:number}, value:number){return [this.x,value,read.length,arguments.length];}; globalThis.result=read.call({x:3},7);`,
      expected: [3, 7, 1, 1],
    },
    {
      name: 'typed this does not shift method defaults',
      source: `const owner={x:3,async read(this: {x:number}, value:number=7){return [this.x,value,arguments.length];}}; globalThis.result=owner.read();`,
      expected: [3, 7, 0],
    },
    {
      name: 'overloads leave one callable implementation',
      source: `function read(value:number):Promise<number>; async function read(value:number){return value+1;} globalThis.result=read(7);`,
      expected: 8,
    },
    {
      name: 'class overload leaves async method receiver intact',
      source: `class C{x=3;read(value:number):Promise<number>;async read(value:number){return this.x+value;}} globalThis.result=new C().read(7);`,
      expected: 10,
    },
    {
      name: 'generic arrow retains lexical receiver',
      source: `function make(this: {x:number}){return async <T>(value:T):Promise<[number,T]>=>[this.x,value];} globalThis.result=make.call({x:3})(7);`,
      expected: [3, 7],
    },
  ];
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases)
    for (const mode of ['inline', 'runtime'] as const)
      describe(`${entry.name}, ${mode}`, () => {
        let code: string;
        let parseError: unknown;
        beforeAll(async () => {
          const erased = ts.transpileModule(entry.source, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
            reportDiagnostics: true,
          });
          expect(erased.diagnostics).toEqual([]);
          expect(await run(erased.outputText)).toEqual(entry.expected);
          const reference = transformSync(entry.source, {
            filename: 'input.ts',
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-typescript'),
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
          expect(await run(reference)).toEqual(entry.babel ?? entry.expected);
          code = compile(
            entry.source,
            {
              typescript: 'strip',
              transforms: { asyncFunctions: true },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toMatch(/async\s*(?:function|read|run|<)/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          try {
            new Function('require', 'globalThis', code);
          } catch (error) {
            parseError = error;
          }
          expect(parseError).toBeUndefined();
        });
        test('preserves executable output and observations', async () => {
          expect(parseError).toBeUndefined();
          expect(await run(code)).toEqual(entry.expected);
        });
        if (entry.invalid)
          test('separate TypeScript prepass preserves executable output', async () => {
            const prepassed = compile(
              entry.source,
              {
                typescript: 'strip',
                transforms: { asyncFunctions: true, parameters: true },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(prepassed).not.toMatch(/async\s+run/);
            expect(await run(prepassed)).toEqual(entry.expected);
          });
      });
});

describe('async generator typescript super', () => {
  const require = createRequire(import.meta.url);
  async function run(fn: Function): Promise<unknown> {
    const context: Record<string, unknown> = {};
    fn(require, context);
    return await context.result;
  }
  for (const call of ['super.read!()', '(super.read as ()=>B)()'])
    for (const mode of ['inline', 'runtime'] as const) {
      describe(`${call}, ${mode}`, () => {
        let parseError: unknown;
        let actual: unknown;
        const source = `class B{read(){return this;}}class C extends B{async *run(){yield ${call}===this;}}globalThis.result=new C().run().next();`;
        beforeAll(async () => {
          const erased = ts.transpileModule(source, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
            reportDiagnostics: true,
          });
          expect(erased.diagnostics).toEqual([]);
          expect(await run(new Function('require', 'globalThis', erased.outputText))).toEqual({
            value: true,
            done: false,
          });
          const reference = transformSync(source, {
            filename: 'input.ts',
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-typescript'),
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
          expect(await run(new Function('require', 'globalThis', reference))).toEqual({
            value: false,
            done: false,
          });
          const code = compile(
            source,
            {
              typescript: 'strip',
              transforms: { asyncGeneratorFunctions: true },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toMatch(/async\s*\*/);
          let fn: Function | undefined;
          try {
            fn = new Function('require', 'globalThis', code);
          } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
            parseError = error;
          }
          if (fn) actual = await run(fn);
        });
        test('preserves valid super syntax and its receiver', () => {
          expect(parseError).toBeUndefined();
          expect(actual).toEqual({ value: true, done: false });
        });
        test('parameter selection forces TypeScript erasure before generator lowering', async () => {
          const code = compile(
            source,
            {
              typescript: 'strip',
              transforms: { asyncGeneratorFunctions: true, parameters: true },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toMatch(/async\s*\*/);
          expect(await run(new Function('require', 'globalThis', code))).toEqual({
            value: true,
            done: false,
          });
        });
      });
    }
});

describe('async jsx capture', () => {
  const require = createRequire(import.meta.url);
  async function execute(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const tag of ['this', 'this.Component', 'this.ui.Component'])
    for (const jsx of ['preserve', 'classic'] as const) {
      test.each(['inline', 'runtime'] as const)(`${tag}, JSX=${jsx}, %s`, async mode => {
        const element = `<${tag} />`;
        const source = `const React = {createElement: tag => tag};
const receiver = {Component: 'component', ui: {Component: 'nested'}};
function make() { return (async () => ${element})(); }
globalThis.result = make.call(receiver).then(tag => tag === ${tag.replace('this', 'receiver')});`;
        // JSX has no native parser oracle; this explicit factory call checks receiver semantics.
        expect(await execute(source.replace(element, `React.createElement(${tag})`))).toBe(true);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-react-jsx'),
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
        expect(await execute(reference)).toBe(true);
        let code = compile(
          source,
          {
            jsx,
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.jsx',
        );
        expect(code).not.toMatch(/async\s*\(/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        if (jsx === 'preserve') {
          expect(code).toMatch(/<[^>]+\/>/);
          // The later pass lowers JSX only; it cannot repair the completed async transform.
          code = transformSync(code, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [require('@babel/plugin-transform-react-jsx')],
          })!.code!;
        }
        expect(code).not.toMatch(/<[^>]+\/>/);
        expect(await execute(code)).toBe(true);
      });
    }
});
