import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'compound addition',
    expression: 'super.x += 3',
    expected: [5, ['get', ['set', 5]]],
    broken: true,
  },
  {
    name: 'postfix update',
    expression: 'super.x++',
    expected: [2, ['get', ['set', 3]]],
    broken: true,
  },
  {
    name: 'prefix update',
    expression: '++super.x',
    expected: [3, ['get', ['set', 3]]],
    broken: true,
  },
  {
    name: 'logical OR skips assignment',
    expression: 'super.x ||= rhs()',
    expected: [2, ['get']],
    broken: true,
  },
  {
    name: 'logical AND reads before assignment',
    expression: 'super.x &&= rhs()',
    expected: [3, ['get', 'rhs', ['set', 3]]],
    broken: true,
  },
  {
    name: 'nullish assignment skips assignment',
    expression: 'super.x ??= rhs()',
    expected: [2, ['get']],
    broken: true,
  },
  {
    name: 'computed compound assignment awaits RHS',
    expression: 'super[key()] += await rhs()',
    expected: [5, ['key', 'get', 'rhs', ['set', 5]]],
    broken: true,
  },
  {
    name: 'plain computed assignment control',
    expression: 'super[key()] = await rhs()',
    expected: [3, ['key', 'rhs', ['set', 3]]],
    broken: false,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const owner of ['object', 'class'])
  for (const entry of cases) {
    describe(`${owner}: ${entry.name}`, () => {
      const outcomes = new Map<string, unknown>();
      beforeAll(async () => {
        const accessors = `get x() { log.push('get'); return 2; } set x(v) { log.push(['set', v]); }`;
        const method = `async read() { return [${entry.expression}, log]; }`;
        const source = `const log = []; function key() { log.push('key'); return 'x'; } function rhs() { log.push('rhs'); return 3; }
${owner === 'object' ? `const owner = {__proto__: {get x() { log.push('get'); return 2; }, set x(v) { log.push(['set', v]); }}, ${method}};` : `class B { ${accessors} } class C extends B { ${method} } const owner = new C();`}
globalThis.result = owner.read();`;
        expect(await execute(source)).toEqual(entry.expected);
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
          expect(await execute(reference)).toEqual(entry.expected);
          const code = compile(source, {
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toMatch(/async\s+read/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          let invalid = false;
          try {
            new Function('require', 'globalThis', code);
          } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError);
            invalid = true;
          }
          outcomes.set(mode, invalid ? 'SyntaxError' : await execute(code));
        }
      });
      for (const mode of ['inline', 'runtime']) {
        (entry.broken ? test.fails : test)(`${mode} preserves operation and effects`, () => {
          expect(outcomes.get(mode)).toEqual(entry.expected);
        });
      }
    });
  }
