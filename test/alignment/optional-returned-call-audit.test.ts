import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  { expression: '(fn?.())()' },
  { expression: '(object?.m())()' },
  { expression: '(object.m?.())()' },
  { expression: 'fn?.()()' },
];
describe.each(cases)('calling an optional result: $expression', ({ expression }) => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      function fn() {
        return function () { 'use strict'; return this === undefined; };
      }
      const object = { m: fn };
      globalThis.result = ${expression};
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
    expect(observe(source)).toBe(true);
    expect(observe(babel)).toBe(true);
    expect(nox).not.toContain('?.');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  test('does not bind the returned function to the original callee or receiver', () => {
    expect(actual).toBe(true);
  });
});
