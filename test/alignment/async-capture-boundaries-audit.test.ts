import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'default receiver capture follows Babel limitation',
    source:
      'function f(a = async () => this) { return a(); } globalThis.result = f.call({x: 3}).then(v => v.x);',
    native: 3,
    babel: 'ReferenceError',
    selected: 'ReferenceError',
  },
  {
    name: 'default arguments capture follows Babel limitation',
    source:
      'function f(a = async () => arguments[1]) { return a(); } globalThis.result = f(undefined, 3);',
    native: 3,
    babel: 'ReferenceError',
    selected: 'ReferenceError',
  },
  {
    name: 'instance field captures instance receiver',
    source: 'class C { x = 3; read = async () => this.x; } globalThis.result = new C().read();',
    native: 3,
    babel: 3,
    selected: 3,
  },
  {
    name: 'static field retains stronger receiver behavior',
    source:
      'function make() { class C { static x = 3; static read = async () => this.x; } return C; } const C = make.call({x: 17}); globalThis.result = C.read();',
    native: 3,
    babel: 17,
    selected: 3,
  },
  {
    name: 'instance field captures super environment',
    source:
      'class B { get x() { return 3; } } class C extends B { read = async () => super.x; } globalThis.result = new C().read();',
    native: 3,
    babel: 3,
    selected: 3,
  },
  {
    name: 'constructor default follows Babel scope limitation',
    source:
      'class B {} class C extends B { constructor(a = async () => this) { super(); globalThis.result = a().then(v => v === this); } } new C();',
    native: true,
    babel: 'ReferenceError',
    selected: 'ReferenceError',
  },
];
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  const run = new Function('require', 'globalThis', code);
  try {
    run(require, context);
    return await context.result;
  } catch (error) {
    expect(error).toBeInstanceOf(ReferenceError);
    return 'ReferenceError';
  }
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    expect(await execute(entry.source)).toEqual(entry.native);
    const reference = transformSync(entry.source, {
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
    const code = compile(entry.source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s*\(/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await execute(code)).toEqual(entry.selected);
  });
}
