import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'heritage initializes enclosing receiver',
    init: 'class Inner extends (super(), B) {}',
    calls: 1,
  },
  {
    name: 'computed method key initializes enclosing receiver',
    init: 'class Inner { [(super(), "key")]() {} }',
    calls: 1,
  },
  {
    name: 'computed field key initializes enclosing receiver',
    init: 'class Inner { [(super(), "key")] = 1; }',
    calls: 1,
  },
  {
    name: 'nested constructor does not replace enclosing capture',
    init: 'class Inner extends B { constructor() { super(); } } super(); new Inner();',
    calls: 2,
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    const source = `let calls = 0; class B { constructor() { this.id = ++calls; } }
class C extends B { constructor() {
const read = async () => this; globalThis.read = read; ${entry.init}
} }
const instance = new C();
globalThis.result = globalThis.read().then(value => [value === instance, instance.id, calls]);`;
    const expected = [true, 1, entry.calls];
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
    expect(code).not.toMatch(/async\s*\(/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code)).toEqual(expected);
  });
}
