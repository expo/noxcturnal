import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

const cases = [
  {
    name: 'callable this pragma',
    pragma: 'this',
    source: `function render() { return <div/>; } function factory(tag) { return tag; } export const result = render.call(factory);`,
    expected: 'div',
  },
  {
    name: 'this member pragma retains the method receiver',
    pragma: 'this.factory',
    source: `function render() { return <div/>; } const receiver = { value: 3, factory() { return this.value; } }; export const result = render.call(receiver);`,
    expected: 3,
  },
  {
    name: 'import.meta member pragma retains the module receiver',
    pragma: 'import.meta.factory',
    source: `import.meta.factory = function () { return this === import.meta; }; export const result = <div/>;`,
    expected: true,
  },
];
test.each(cases)('$name', async ({ pragma, source, expected }) => {
  expect((await importCode(source.replace('<div/>', `${pragma}("div", null)`))).result).toBe(
    expected,
  );
  const reference = transformSync(source, {
    filename: '/audit/input.jsx',
    sourceType: 'module',
    configFile: false,
    babelrc: false,
    plugins: [[jsx, { runtime: 'classic', pragma }]],
  })!.code!;
  expect((await importCode(reference)).result).toBe(expected);
  const code = compile(source, { jsx: 'classic', jsxPragma: pragma }, '/audit/input.jsx');
  expect(code).not.toContain('<div');
  expect(code).not.toContain('@babel/runtime');
  expect((await importCode(code)).result).toBe(expected);
});
