import { transformSync } from '@babel/core';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const expected = [4, 4, 9];
describe.each(['parameter', 'field'] as const)('exponentiation reentry in %s initializer', kind => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      const first = { x: 2 }, second = { x: 3 };
      let receiver = first, entered = false;
      function get() { return receiver; }
      function key() {
        if (!entered) {
          entered = true;
          receiver = second;
          ${kind === 'field' ? 'new C()' : 'f()'};
        }
        return 'x';
      }
      ${
        kind === 'field'
          ? 'class C { value = get()[key()] **= 2; }'
          : 'function f(value = get()[key()] **= 2) { return value; }'
      }
      const value = ${kind === 'field' ? 'new C().value' : 'f()'};
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
    // Babel isolates parameter temporaries. Field temporaries are shared too,
    // but Babel still saves the outer assignment receiver before evaluating key().
    expect(observe(babel)).toEqual(kind === 'field' ? [81, 81, 9] : expected);
    actual = observe(nox);
  });
  test.fails('keeps receiver temporaries local to each initializer evaluation', () => {
    expect(actual).toEqual(expected);
  });
});
