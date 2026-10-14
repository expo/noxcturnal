import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'continue outer label', exit: 'continue outer;', expected: [1, 2], broken: true },
  { name: 'continue inner label', exit: 'continue inner;', expected: [1, 2], broken: false },
  { name: 'break outer label', exit: 'break outer;', expected: [1], broken: false },
];
async function run(fn: Function): Promise<unknown> {
  const context: Record<string, unknown> = {};
  fn(require, context);
  return await context.result;
}
function parse(code: string): { fn?: Function; error?: SyntaxError } {
  try {
    return { fn: new Function('require', 'globalThis', code) };
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { error };
  }
}
for (const mode of ['inline', 'runtime'] as const) {
  for (const entry of cases) {
    describe(`${entry.name}, ${mode}`, () => {
      let parseError: unknown;
      let actual: unknown;
      beforeAll(async () => {
        const source = `globalThis.result=(async()=>{const out=[];outer:inner:for await(const x of [1,2]){out.push(x);${entry.exit}}return out;})();`;
        expect(await run(new Function('require', 'globalThis', source))).toEqual(entry.expected);
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
        const babel = parse(reference);
        if (entry.exit.includes('outer')) expect(babel.error).toBeInstanceOf(SyntaxError);
        else {
          expect(babel.error).toBeUndefined();
          expect(await run(babel.fn!)).toEqual(entry.expected);
        }
        const code = compile(source, {
          transforms: { asyncGeneratorFunctions: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/for\s+await/);
        const parsed = parse(code);
        parseError = parsed.error;
        if (parsed.fn) actual = await run(parsed.fn);
      });
      (entry.broken ? test.fails : test)('preserves the label target', () => {
        expect(parseError).toBeUndefined();
        expect(actual).toEqual(entry.expected);
      });
    });
  }
}
