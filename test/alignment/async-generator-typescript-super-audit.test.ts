import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
      test.fails('preserves valid super syntax and its receiver', () => {
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
