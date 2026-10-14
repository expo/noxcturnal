import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function babel(source: string): string {
  return transformSync(source, {
    filename: 'input.jsx',
    configFile: false,
    babelrc: false,
    plugins: [[jsx, { runtime: 'classic' }]],
  })!.code!;
}
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each([
  { name: 'space', separator: ' ', fails: false },
  { name: 'tab', separator: '\t', fails: false },
  { name: 'nonbreaking space', separator: '\u00a0', fails: true },
  { name: 'line break', separator: '\n', fails: true },
  { name: 'nonbreaking prefix', separator: ' ', prefix: '\u00a0', fails: true },
  { name: 'nonbreaking suffix', separator: ' ', suffix: '\u00a0', fails: true },
])('JSX pragma comment separator: $name', ({ separator, prefix, suffix, fails }) => {
  let actual: unknown;
  beforeAll(() => {
    const source = `/**${prefix ?? ' '}@jsx${separator}factory${suffix ?? ' '}*/
      const React = { createElement() { return 'fallback'; } };
      function factory() { return 'expected'; }
      globalThis.result = <div/>;
    `;
    expect(observe(babel(source))).toBe('expected');
    const code = compile(source, { jsx: 'classic' }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
  });
  (fails ? test.fails : test)('honors the configured factory', () => {
    expect(actual).toBe('expected');
  });
});

describe('invalid JSX runtime comment', () => {
  let accepted = false;
  beforeAll(() => {
    const source = '/** @jsxRuntime typo */ const view = <div/>;';
    expect(() => babel(source)).toThrow(/Runtime must be either/);
    try {
      const code = compile(source, { jsx: 'classic' }, 'input.jsx');
      expect(code).not.toContain('<div');
      expect(code).toContain('React.createElement');
      accepted = true;
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/transform-error|runtime/i);
    }
  });
  test.fails('rejects an invalid runtime directive', () => {
    expect(accepted).toBe(false);
  });
});

test.each([
  {
    name: 'unknown directive before a valid directive',
    header: '/** @jsxUnknown ignored\n * @jsx factory */',
    late: '',
    babelValue: 'expected',
    noxValue: 'expected',
  },
  {
    name: 'backtick-quoted example',
    header: '/** `@jsx factory` */',
    late: '',
    babelValue: 'fallback',
    noxValue: 'fallback',
  },
  {
    name: 'multiple directives on one line extension',
    header: '/** @jsx factory @jsxFrag Fragment */',
    late: '',
    babelValue: 'fallback',
    noxValue: 'expected',
  },
  {
    name: 'file-leading-only directive policy',
    header: '',
    late: '/** @jsx factory */',
    babelValue: 'expected',
    noxValue: 'fallback',
  },
])('JSX comment parser boundary: $name', ({ header, late, babelValue, noxValue }) => {
  const source = `${header}
    const React = { createElement() { return 'fallback'; } };
    function factory() { return 'expected'; }
    ${late}
    globalThis.result = <div/>;
  `;
  expect(observe(babel(source))).toBe(babelValue);
  const code = compile(source, { jsx: 'classic' }, 'input.jsx');
  expect(code).not.toContain('<div');
  expect(code).not.toContain('@babel/runtime');
  expect(observe(code)).toBe(noxValue);
});
