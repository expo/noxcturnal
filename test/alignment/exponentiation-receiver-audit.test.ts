import { transformSync } from '@babel/core';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

let actual: unknown;
const expected = [9, 9, 4];
beforeAll(() => {
  const source = `
    const first = { x: 3 };
    const second = { x: 4 };
    let receiver = first;
    const key = () => { receiver = second; return 'x'; };
    const value = receiver[key()] **= 2;
    globalThis.result = [value, first.x, second.x];
  `;
  const nox = compile(source, { transforms: { exponentiationOperator: true } });
  const babel = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [exponentiation],
  })!.code!;
  expect(nox).not.toContain('**=');
  expect(nox).toContain('Math.pow');
  expect(nox).not.toContain('@babel/runtime');
  const observe = (code: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', code)(context);
    return context.result;
  };
  expect(observe(source)).toEqual(expected);
  expect(observe(babel)).toEqual(expected);
  actual = observe(nox);
});

test.fails('exponentiation retains the receiver before evaluating a computed key', () => {
  expect(actual).toEqual(expected);
});
