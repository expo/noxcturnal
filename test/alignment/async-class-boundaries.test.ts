import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'computed method key uses enclosing receiver',
    source: `function make() { return (async () => { class C { [this.key]() { return 3; } } return new C().read(); })(); } globalThis.result = make.call({key: 'read'});`,
    expected: 3,
    babel: 3,
  },
  {
    name: 'heritage uses enclosing receiver',
    source: `function make() { return (async () => { class C extends this.Base {} return new C().x; })(); } globalThis.result = make.call({Base: class { x = 3; }});`,
    expected: 3,
    babel: 3,
  },
  {
    name: 'static block retains stronger local receiver',
    source: `function make() { class C { static x = 3; static { this.read = async () => this.x; } } return C.read(); } globalThis.result = make.call({x: 17});`,
    expected: 3,
    babel: 17,
  },
  {
    name: 'static field retains valid super capture',
    source: `class B { static get x() { return this.value; } } class C extends B { static value = 3; static read = async () => super.x; } globalThis.result = C.read();`,
    expected: 3,
    babel: 'SyntaxError',
  },
  {
    name: 'computed field key and initializer use different receivers',
    source: `function make() { return (async () => { class C { [this.key] = this.value; value = 3; } const instance = new C(); return [Object.hasOwn(instance, 'read'), instance.read, instance.value]; })(); } globalThis.result = make.call({key: 'read', value: 17});`,
    expected: [true, undefined, 3],
    babel: [true, undefined, 3],
  },
  {
    name: 'nested method default keeps its receiver',
    source: `function make() { return (async () => { class C { constructor() { this.value = 3; } read(a = this.value) { return a; } } return new C().read(); })(); } globalThis.result = make.call({value: 17});`,
    expected: 3,
    babel: 3,
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
  run(require, context);
  return await context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    expect(await execute(entry.source)).toEqual(entry.expected);
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
    expect(await execute(code)).toEqual(entry.expected);
  });
}
