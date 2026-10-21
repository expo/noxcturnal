import { transformSync } from '@babel/core';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  { name: 'astral UTF-16 control', character: '😀', line: 1, column: 86, fails: false },
  { name: 'vertical tab', character: '\v', line: 1, column: 85, fails: true },
  { name: 'form feed', character: '\f', line: 1, column: 85, fails: true },
  { name: 'NEL', character: '\u0085', line: 1, column: 85, fails: true },
  { name: 'line separator control', character: '\u2028', line: 2, column: 21, fails: false },
  { name: 'CRLF control', character: '\r\n', line: 2, column: 21, fails: false },
];
describe.each(cases)('JSX development location after $name', ({ character, line, column }) => {
  let actual: unknown;
  const expected = { fileName: '/audit/input.jsx', lineNumber: line, columnNumber: column };
  beforeAll(() => {
    const source = `const React={createElement(_,props){return props.__source;}};/*${character}*/globalThis.result=<div/>;`;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    const babel = transformSync(source, {
      filename: '/audit/input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[development, { runtime: 'classic' }]],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
    const code = compile(source, { jsx: 'classic-development' }, '/audit/input.jsx');
    expect(code).not.toContain('<div');
    expect(code).toContain('__source');
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
  });
  test('counts only JavaScript line terminators in source metadata', () => {
    expect(actual).toEqual(expected);
  });
});
