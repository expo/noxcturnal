import jsx from '@babel/plugin-transform-react-jsx';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
// Existing parser-boundary tests characterize the current outputs. These assertions
// apply the Babel baseline where no public placement/multiplicity exception exists.
describe.each([
  {
    name: 'directive following a statement',
    leading: '',
    trailing: '/** @jsx factory */',
    expected: 'configured',
    current: 'default',
  },
  {
    name: 'multiple directives on one comment line',
    leading: '/** @jsx factory @jsxFrag Fragment */',
    trailing: '',
    expected: 'default',
    current: 'configured',
  },
])('$name', entry => {
  let actual: unknown;
  beforeAll(() => {
    const source = `${entry.leading}
      const React={createElement(){return 'default'}};
      function factory(){return 'configured'}
      ${entry.trailing}
      globalThis.result=<div/>;`;
    const reference = transformSync(source, {
      filename: 'input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[jsx, { runtime: 'classic' }]],
    })!.code!;
    expect(observe(reference)).toBe(entry.expected);
    const code = compile(source, { jsx: 'classic' }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
  });
  test('selects the factory under the adopted Babel directive grammar', () => {
    expect(actual).toBe(entry.expected);
  });
});
