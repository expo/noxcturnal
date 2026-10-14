import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

// An actual imported ESM fixture records factory arguments without claiming
// React rendering coverage. Both runtime entry points export the same recorder.
const runtime =
  'export const jsx = (_type, props) => [props.value, props.children]; export const jsxs = jsx; export const jsxDEV = jsx;';
const importSource = `data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}#`;
const cases = [
  {
    name: 'multiline attribute and nonbreaking child spaces',
    fails: true,
    input: '<div value="first\n  second">first\n\u00a0second\u00a0\nthird</div>',
    expected: ['first second', 'first \u00a0second\u00a0 third'],
  },
  {
    name: 'entity-decoding control',
    fails: false,
    input: '<div value="ok">&amp;&#x1F600;</div>',
    expected: ['ok', '&😀'],
  },
];
describe.each([false, true])('automatic JSX ESM execution, development=%s', dev => {
  describe.each(cases)('$name', ({ input, expected, fails }) => {
    let actual: unknown;
    beforeAll(async () => {
      const source = `export const result = ${input};`;
      const babel = transformSync(source, {
        filename: '/audit/input.jsx',
        configFile: false,
        babelrc: false,
        plugins: [[dev ? development : jsx, { runtime: 'automatic', importSource }]],
      })!.code!;
      expect((await importCode(babel)).result).toEqual(expected);
      const code = compile(
        source,
        {
          jsx: dev ? 'automatic-development' : 'automatic',
          jsxImportSource: importSource,
        },
        '/audit/input.jsx',
      );
      expect(code).not.toContain('<div');
      expect(code).toContain(importSource + (dev ? '/jsx-dev-runtime' : '/jsx-runtime'));
      expect(code).not.toContain('@babel/runtime');
      actual = (await importCode(code)).result;
    });
    (fails ? test.fails : test)(
      'passes Babel-baseline attribute and child values to the runtime',
      () => {
        expect(actual).toEqual(expected);
      },
    );
  });
});
