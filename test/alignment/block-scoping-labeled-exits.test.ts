import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'captured loop continues to an outer label in its label chain',
    source: `const out = [];
outer: inner: for (let index = 0; index < 2; index++) {
  out.push(() => index);
  continue outer;
}
globalThis.result = out.map(read => read());`,
    expected: [0, 1],
  },
  {
    name: 'captured inner loop continues to an ancestor loop label',
    source: `const out = [];
outer: for (var pass = 0; pass < 2; pass++) {
  for (let index = 0; index < 2; index++) {
    out.push(() => index);
    continue outer;
  }
}
globalThis.result = out.map(read => read());`,
    expected: [0, 0],
  },
  {
    name: 'captured loop breaks to an ancestor block label',
    source: `const out = [];
outer: {
  for (let index = 0; index < 2; index++) {
    out.push(() => index);
    break outer;
  }
}
globalThis.result = out.map(read => read());`,
    expected: [0],
  },
];

function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}

describe.each(cases)('$name', ({ source, expected }) => {
  let code: string;
  let babel: string;
  beforeAll(() => {
    // These block-scoping paths are helper-free in either helper mode.
    code = compile(source, { transforms: { blockScoping: true }, helpers: { mode: 'inline' } });
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-block-scoping')],
    });
    expect(reference?.code).toBeTypeOf('string');
    babel = reference!.code!;
    expect(code).not.toMatch(/\b(?:let|const)\b/);
  });
  test('native control', () => {
    expect(run(source)).toEqual(expected);
  });
  test('Babel control', () => {
    expect(run(babel)).toEqual(expected);
  });
  test('transformed execution', () => {
    expect(run(code)).toEqual(expected);
  });
});
