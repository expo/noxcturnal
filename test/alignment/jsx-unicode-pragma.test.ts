import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe.each([false, true])('classic JSX pragma, escaped identifier=%s', escaped => {
  let actual: unknown;
  beforeAll(() => {
    const pragma = escaped ? String.raw`\u03c0.createElement` : 'π.createElement';
    const source = `
      const React = { createElement() { return 'fallback'; } };
      const π = { createElement() { return 'expected'; } };
      globalThis.result = <div/>;
    `;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source.replace('<div/>', `${pragma}("div", null)`))).toBe('expected');
    const babel = transformSync(source, {
      filename: 'input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[jsx, { runtime: 'classic', pragma }]],
    })!.code!;
    expect(observe(babel)).toBe('expected');
    const code = compile(source, { jsx: 'classic', jsxPragma: pragma }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
  });
  test('honors equivalent Unicode identifier spellings', () => {
    expect(actual).toBe('expected');
  });
});
