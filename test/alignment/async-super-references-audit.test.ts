import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'tagged receiver',
    expression: 'super.read`hello`',
    native: [true, []],
    babel: [true, []],
    selected: [true, []],
    broken: true,
  },
  {
    name: 'parenthesized receiver',
    expression: '(super.read)()',
    native: [true, []],
    babel: [true, []],
    selected: [true, []],
    broken: true,
  },
  {
    name: 'ordinary receiver control',
    expression: 'super.read()',
    native: [true, []],
    babel: [true, []],
    selected: [true, []],
    broken: false,
  },
  {
    name: 'optional receiver follows Babel',
    expression: 'super.read?.()',
    native: [true, []],
    babel: [false, []],
    selected: [false, []],
    broken: false,
  },
  {
    name: 'delete follows Babel',
    expression: 'delete super.x',
    native: 'ReferenceError',
    babel: [true, []],
    selected: [true, []],
    broken: false,
  },
  {
    name: 'array target must remain executable despite Babel failure',
    expression: '[super.x] = [3]',
    native: [[3], [3]],
    babel: 'SyntaxError',
    selected: [[3], [3]],
    broken: true,
  },
  {
    name: 'object target must remain executable despite Babel failure',
    expression: '({x: super.x} = {x: 3})',
    native: [{ x: 3 }, [3]],
    babel: 'SyntaxError',
    selected: [{ x: 3 }, [3]],
    broken: true,
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
  try {
    run(require, context);
    return await context.result;
  } catch (error) {
    expect(error).toBeInstanceOf(ReferenceError);
    return 'ReferenceError';
  }
}
for (const kind of ['object', 'class'])
  for (const entry of cases) {
    describe(`${kind}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const method = `async run() { return [${entry.expression}, log]; }`;
        const source = `const log = [];
${kind === 'object' ? `const owner = { __proto__: {get x() { return 2; }, set x(v) { log.push(v); }, read() { return this === owner; }}, ${method} };` : `class B { get x() { return 2; } set x(v) { log.push(v); } read() { return this === owner; } } class C extends B { ${method} } const owner = new C();`}
globalThis.result = owner.run();`;
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
          expect(await execute(reference)).toEqual(entry.babel);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s+run/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          outcomes.set(mode, await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (entry.broken ? test.fails : test)(`${mode} preserves the selected contract`, () => {
          expect(outcomes.get(mode)).toEqual(entry.selected);
        });
      }
    });
  }
