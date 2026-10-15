import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
          expect(await run(new Function('require', 'globalThis', source))).toEqual(entry.expected);
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
