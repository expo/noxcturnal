import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
      (argumentsCase ? test : test.fails)('retains lexical capture with fused type erasure', () => {
        expect(outcomes.get(false)).toBe(true);
      });
      test('retains lexical capture with the separate language prepass', () => {
        expect(outcomes.get(true)).toBe(true);
      });
    });
