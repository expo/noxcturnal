import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'computed write', expression: 'super[key] = rhs()', write: true, call: false },
  {
    name: 'computed write with suspended RHS',
    expression: 'super[key] = await rhs()',
    write: true,
    call: false,
  },
  {
    name: 'computed call with suspended argument',
    expression: 'super[key](await rhs())',
    write: false,
    call: true,
  },
  { name: 'computed read', expression: 'super[key]', write: false, call: false },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mutate of [false, true])
  for (const entry of cases) {
    if (mutate && !entry.write && !entry.call) continue;
    test.each(['inline', 'runtime'] as const)(
      `${entry.name}, prototype mutation=${mutate}, %s`,
      async mode => {
        const source = `const log = []; let name = ${JSON.stringify(entry.call ? 'read' : 'x')};
const key = { [Symbol.toPrimitive]() { log.push('key:' + name); return name; } };
function rhs() { log.push('rhs'); name = 'y'; ${mutate ? "Object.setPrototypeOf(owner, {set y(v) {log.push('new:set:y');}, read() {return false;}});" : ''} return 3; }
const owner = { __proto__: {get x() { return 9; }, set x(v) { log.push('set:x'); }, set y(v) { log.push('set:y'); }, read() { return this === owner; }},
async run() { return [${entry.expression}, log]; } };
globalThis.result = owner.run();`;
        const expected = entry.write
          ? [3, ['rhs', 'key:y', mutate ? 'new:set:y' : 'set:y']]
          : entry.call
            ? [true, ['key:read', 'rhs']]
            : [9, ['key:x']];
        expect(await execute(source)).toEqual(expected);
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
        expect(await execute(reference)).toEqual(expected);
        const code = compile(source, {
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/async\s+run/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        expect(await execute(code)).toEqual(expected);
      },
    );
  }
