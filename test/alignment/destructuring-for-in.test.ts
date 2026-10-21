import { transformSync } from '@babel/core';
import destructuring from '@babel/plugin-transform-destructuring';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const cases = [
  { name: 'array declaration', head: 'const [value]', expected: ['a'] },
  { name: 'array assignment', head: '[value]', expected: ['a'] },
  { name: 'object declaration', head: 'const {length:value}', expected: [2] },
];
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each(cases)('destructuring in for-in: $name', ({ head, expected }) => {
  let actual: string;
  beforeAll(() => {
    const source = `let value;const seen=[];for(${head} in {ab:1})seen.push(value);globalThis.result=seen;`;
    expect(observe(source)).toEqual(expected);
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [destructuring],
    })!.code!;
    expect(observe(reference)).toEqual(expected);
    expect(reference).not.toMatch(/for\s*\(\s*(?:(?:const|let|var)\s+)?[\[{]/);
    actual = compile(source, { transforms: { destructuring: true } });
    expect(observe(actual)).toEqual(expected);
  });
  test('removes the selected loop-head pattern', () => {
    expect(actual).not.toMatch(/for\s*\(\s*(?:(?:const|let|var)\s+)?[\[{]/);
  });
});
test('for-of declaration control lowers the selected pattern', () => {
  const source =
    'const seen=[];for(const [value] of [[3]])seen.push(value);globalThis.result=seen;';
  const reference = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [destructuring],
  })!.code!;
  expect(observe(reference)).toEqual([3]);
  const code = compile(source, { transforms: { destructuring: true } });
  expect(code).not.toMatch(/for\s*\(\s*(?:(?:const|let|var)\s+)?[\[{]/);
  expect(observe(code)).toEqual([3]);
});
