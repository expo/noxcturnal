import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'multiline attribute',
    input: '<div value="first\n  second\tthird\r\n fourth" />',
    babelExpected: 'first second\tthird\r fourth',
    typedExpected: 'first\n  second\tthird\r\n fourth',
  },
  {
    name: 'tabs in multiline text',
    input: '<div>  first\t\n\n  second\t end  </div>',
    babelExpected: '  first second  end  ',
    typedExpected: '  first second\t end  ',
  },
  {
    name: 'nonbreaking spaces at text line edges',
    input: '<div>first\n\u00a0second\u00a0\nthird</div>',
    babelExpected: 'first \u00a0second\u00a0 third',
    typedExpected: 'first second third',
  },
  {
    name: 'Unicode line and paragraph separators',
    input: '<div>first\u2028second\u2029third</div>',
    babelExpected: 'first\u2028second\u2029third',
    typedExpected: 'first second third',
  },
  {
    name: 'whitespace entities at text line edges',
    input: '<div>&#32;\n&#9;second&#10;\n&#32;</div>',
    babelExpected: 'second',
    typedExpected: '  \tsecond\n  ',
  },
  {
    name: 'entity decoding control',
    input: '<div>&amp;&#x1F600;&nbsp;&quot;&unknown;</div>',
    babelExpected: '&😀\u00a0"&unknown;',
    typedExpected: '&😀\u00a0"&unknown;',
  },
];
describe.each(cases)(
  'classic JSX normalization: $name',
  ({ input, babelExpected, typedExpected }) => {
    let actual: unknown;
    beforeAll(() => {
      const source = `
      const React = { createElement(_tag, props, ...children) {
        return props && props.value !== undefined ? props.value : children.join('');
      } };
      globalThis.result = ${input};
    `;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', code)(context);
        return context.result;
      };
      const babel = transformSync(source, {
        filename: 'input.jsx',
        configFile: false,
        babelrc: false,
        plugins: [[jsx, { runtime: 'classic' }]],
      })!.code!;
      const typed = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.React,
        },
        fileName: 'input.tsx',
      }).outputText;
      expect(observe(babel)).toBe(babelExpected);
      expect(observe(typed)).toBe(typedExpected);
      const code = compile(source, { jsx: 'classic' }, 'input.jsx');
      expect(code).not.toContain('<div');
      expect(code).not.toContain('@babel/runtime');
      actual = observe(code);
    });
    test('preserves the Babel-baseline text value', () => {
      expect(actual).toBe(babelExpected);
    });
  },
);
