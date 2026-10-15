import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  { expression: '(object?.a).b?.c', fails: true },
  { expression: '(object?.a)()?.c', fails: true },
  { expression: '(object?.a)?.b', fails: false },
];
describe.each(cases)('optional-chain grouping: $expression', ({ expression, fails }) => {
  let actual: unknown;
  const expected = fails ? ['TypeError'] : [undefined];
  beforeAll(() => {
    const source = `
      const object = null;
      try { globalThis.result = [${expression}]; }
      catch (error) { globalThis.result = [error.name]; }
    `;
    const nox = compile(source, { transforms: { optionalChaining: { loose: false } } });
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [[optional, { loose: false }]],
    })!.code!;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    expect(observe(babel)).toEqual(expected);
    expect(nox).not.toContain('?.');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  test('preserves mandatory operations between optional chains', () => {
    expect(actual).toEqual(expected);
  });
});
