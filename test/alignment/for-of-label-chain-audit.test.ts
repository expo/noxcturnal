import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'continue to outer label in a for-of label chain',
    source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  continue outer;
}
globalThis.result = out;`,
    expected: [1, 2],
    knownFailure: true,
  },
  {
    name: 'continue to innermost label in a for-of label chain',
    source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  continue inner;
}
globalThis.result = out;`,
    expected: [1, 2],
    knownFailure: false,
  },
  {
    name: 'break to outer label in a for-of label chain',
    source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  break outer;
}
globalThis.result = out;`,
    expected: [1],
    knownFailure: false,
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}

describe.each(cases)('$name', ({ source, expected, knownFailure }) => {
  let code: string;
  let babel: string;
  beforeAll(() => {
    // Noxcturnal's for-of lowering is helper-free in either helper mode.
    code = compile(source, { transforms: { forOf: true }, helpers: { mode: 'inline' } });
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-for-of')],
    });
    expect(reference?.code).toBeTypeOf('string');
    babel = reference!.code!;
    expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
  });
  test('native control', () => {
    expect(run(source)).toEqual(expected);
  });
  test('Babel control', () => {
    expect(run(babel)).toEqual(expected);
  });
  const transformedTest = knownFailure ? test.fails : test;
  transformedTest('transformed execution', () => {
    expect(run(code)).toEqual(expected);
  });
});
