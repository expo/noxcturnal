import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
