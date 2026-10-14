import { transformSync } from '@babel/core';
import destructuring from '@babel/plugin-transform-destructuring';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const expected = [{ value: 3 }, 3];
describe.each([false, true])('destructuring arrow, block body=%s', block => {
  let actual: unknown;
  beforeAll(() => {
    const source = `let value;const assign=source=>${block ? '{return ({value}=source);}' : '({value}=source)'};globalThis.result=[assign({value:3}),value];`;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      babelrc: false,
      configFile: false,
      plugins: [destructuring],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
    const code = compile(source, { transforms: { destructuring: true } });
    expect(code).not.toMatch(/\{\s*value\s*\}\s*=/);
    actual = observe(code);
  });
  test('preserves assignment completion', () => {
    expect(actual).toEqual(expected);
  });
});
