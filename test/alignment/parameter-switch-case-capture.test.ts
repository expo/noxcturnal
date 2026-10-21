import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const modes = ['inline', 'runtime'] as const;
const cases = [
  {
    name: 'receiver',
    alias: '_this',
    source: `function read() {
  switch (3) {
    case ((unused = 0) => this.value)(): return 'yes';
    default: return 'no';
  }
}
globalThis.result = read.call({ value: 3 });`,
  },
  {
    name: 'arguments',
    alias: '_arguments',
    source: `function read(first) {
  switch (3) {
    case ((unused = 0) => arguments[0])(): return 'yes';
    default: return 'no';
  }
}
globalThis.result = read(3);`,
  },
];

function execute(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
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

describe.each(cases)('$name capture in a switch case test', ({ source, alias }) => {
  const outcomes = new Map<string, { value?: unknown; error?: unknown }>();
  beforeAll(() => {
    expect(execute(source)).toBe('yes');
    expect(execute(babel(source))).toBe('yes');
    for (const mode of modes) {
      const code = compile(source, {
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/unused\s*=\s*0/);
      // Both configurations exercise local parameter capture; no helper is used.
      expect(code).not.toContain('@babel/runtime/');
      try {
        outcomes.set(mode, { value: execute(code) });
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError);
        expect((error as Error).message).toBe(`${alias} is not defined`);
        outcomes.set(mode, { error });
      }
    }
  });
  for (const mode of modes) {
    test(`${mode} emits the capture declaration`, () => {
      expect(outcomes.get(mode)).toEqual({ value: 'yes' });
    });
  }
});

test.each(modes)('%s emits receiver and arguments captures for switch discriminants', mode => {
  const sources = [
    `function read() {
  switch (((unused = 0) => this.value)()) { case 3: return 'yes'; }
}
globalThis.result = read.call({ value: 3 });`,
    `function read(first) {
  switch (((unused = 0) => arguments[0])()) { case 3: return 'yes'; }
}
globalThis.result = read(3);`,
  ];
  for (const source of sources) {
    const code = compile(source, {
      transforms: { parameters: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/unused\s*=\s*0/);
    expect(execute(source)).toBe('yes');
    expect(execute(babel(source))).toBe('yes');
    expect(execute(code)).toBe('yes');
  }
});
