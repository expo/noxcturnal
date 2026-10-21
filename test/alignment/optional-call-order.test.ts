import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  { name: 'null receiver', value: 'null', fails: false, expected: ['arg', 'TypeError'] },
  { name: 'missing method', value: '{}', fails: true, expected: ['arg', 'TypeError'] },
  { name: 'numeric method', value: '{m:3}', fails: true, expected: ['arg', 'TypeError'] },
  { name: 'callable method', value: '{m(){}}', fails: false, expected: ['arg'] },
];
describe.each(cases)('parenthesized optional call: $name', ({ value, fails, expected }) => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      const events = [], object = ${value};
      try { (object?.m)(events.push('arg')); }
      catch (error) { events.push(error.name); }
      globalThis.result = events;
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
    expect(observe(babel)).toEqual(fails ? ['TypeError'] : expected);
    expect(nox).not.toContain('?.');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (fails ? test.fails : test)('evaluates arguments before rejecting a noncallable value', () => {
    expect(actual).toEqual(expected);
  });
});
