import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const modes = ['inline', 'runtime'] as const;
const cases = [
  {
    name: 'function default arrow captures its invocation receiver',
    source: `function read(fn = (unused = 0) => this.value) { return fn(); }
globalThis.result = read.call({ value: 3 });`,
  },
  {
    name: 'function default arrow captures its invocation arguments',
    source: `function outer(seed) {
  function read(first, fn = (unused = 0) => arguments[0]) { return fn(); }
  return read(3);
}
globalThis.result = outer(9);`,
  },
  {
    name: 'method default arrow captures the method receiver',
    source: `const owner = {
  value: 3,
  read(fn = (unused = 0) => this.value) { return fn(); }
};
globalThis.result = owner.read();`,
  },
];

function execute(code: string): unknown {
  const context: Record<string, unknown> = {};
  // Distinguish an incorrectly hoisted capture from the called receiver without
  // depending on the host process's global object.
  new Function('globalThis', code).call({ value: 9 }, context);
  return context.result;
}

function babel(source: string): string {
  return transformSync(source, {
    sourceType: 'script',
    babelrc: false,
    configFile: false,
    plugins: [require('@babel/plugin-transform-parameters')],
  })!.code!;
}

describe.each(cases)('$name', ({ source }) => {
  const observed = new Map<string, unknown>();
  beforeAll(() => {
    expect(execute(source)).toBe(3);
    expect(execute(babel(source))).toBe(3);
    for (const mode of modes) {
      const code = compile(source, {
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/unused\s*=\s*0|read\([^)]*fn\s*=/);
      // Parameters use local capture aliases, not Babel runtime helpers.
      expect(code).not.toContain('@babel/runtime/');
      observed.set(mode, execute(code));
    }
  });
  for (const mode of modes) {
    test(`${mode} initializes the capture in the owning activation`, () => {
      expect(observed.get(mode)).toBe(3);
    });
  }
});

test.each(modes)('%s retains a lexical arrow when its default uses super', mode => {
  const source = `const base = { read() { return this.value; } };
function make(obj = {
  __proto__: base,
  value: 3,
  read(fn = (unused = 0) => super.read()) { return fn(); }
}) { return obj; }
globalThis.result = make().read();`;
  const code = compile(source, {
    transforms: { parameters: true },
    helpers: { mode, version: '7.29.7' },
  });
  expect(code).not.toMatch(/unused\s*=\s*0|make\(obj\s*=/);
  expect(execute(source)).toBe(3);
  expect(execute(babel(source))).toBe(3);
  expect(execute(code)).toBe(3);
});

test.each(modes)('%s captures receivers and arguments correctly inside a function body', mode => {
  const sources = [
    `function read() { const fn = (unused = 0) => this.value; return fn(); }
globalThis.result = read.call({ value: 3 });`,
    `function outer(seed) {
  function read(first) { const fn = (unused = 0) => arguments[0]; return fn(); }
  return read(3);
}
globalThis.result = outer(9);`,
  ];
  for (const source of sources) {
    const code = compile(source, {
      transforms: { parameters: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/unused\s*=\s*0/);
    expect(execute(source)).toBe(3);
    expect(execute(babel(source))).toBe(3);
    expect(execute(code)).toBe(3);
  }
});
