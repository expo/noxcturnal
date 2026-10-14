import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'parenthesized tag',
    expression: '(object?.m)`text`',
    expected: [true, true, []],
    fails: true,
  },
  {
    name: 'direct deletion',
    expression: 'delete object?.x',
    expected: [true, false, []],
    fails: false,
  },
  {
    name: 'parenthesized deletion',
    expression: 'delete (object?.x)',
    expected: [true, false, []],
    fails: true,
  },
  {
    name: 'single-parenthesized call',
    expression: '(object?.m)()',
    expected: [true, true, []],
    fails: false,
  },
  {
    name: 'double-parenthesized call',
    expression: '((object?.m))()',
    expected: [true, true, []],
    fails: true,
  },
];

describe.each(cases)('$name', ({ expression, expected, fails }) => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      const events = [];
      const object = {
        get x() { events.push('get'); return 3; },
        m() { return this === object; },
      };
      globalThis.result = [${expression}, Object.hasOwn(object, 'x'), events];
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
    expect(observe(babel)).toEqual(expression.includes('`') ? [false, true, []] : expected);
    expect(nox).not.toContain('?.');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (fails ? test.fails : test)('preserves the property reference through parentheses', () => {
    expect(actual).toEqual(expected);
  });
});
