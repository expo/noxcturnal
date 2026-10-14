import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'last factory directive',
    header: '/** @jsx first */ /** @jsx factory */',
    expected: 'factory',
  },
  {
    name: 'last fragment directive',
    header: '/** @jsx factory */ /** @jsxFrag First */ /** @jsxFrag Final */',
    expected: 'Final',
    fragment: true,
  },
  {
    name: 'unknown keyword recovery',
    header: '/** @jsxOther ignored\n * @jsx factory */',
    expected: 'factory',
  },
  {
    name: 'non-JSX annotation recovery',
    header: '/** @other ignored\n * @jsx factory */',
    expected: 'factory',
  },
  {
    name: 'truncated keyword recovery',
    header: '/** @jsx\n * @jsx factory */',
    expected: 'factory',
  },
  {
    name: 'missing value before later directive',
    header: '/** @jsx \n * @jsx factory */',
    expected: 'factory',
    observed: 'fallback',
  },
  { name: 'ASCII value terminator', header: '/** @jsx factory\v */', expected: 'factory' },
];
function observe(code: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  let actual: unknown;
  beforeAll(() => {
    const source = `${entry.header}
      const First='First',Final='Final';
      const React={createElement(){return 'fallback'},Fragment:'fallback-fragment'};
      function first(){return 'first'}
      function factory(type){return ${entry.fragment ? 'type' : "'factory'"}}
      globalThis.result=${entry.fragment ? '<></>' : '<div/>'};`;
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [[jsx, { runtime: 'classic' }]],
    })!.code!;
    expect(observe(reference)).toBe(entry.expected);
    const code = compile(source, { jsx: 'classic' }, 'input.jsx');
    expect(code).not.toMatch(/<div|<>/);
    actual = observe(code);
  });
  test('uses the final valid directive', () => expect(actual).toBe(entry.expected));
});

for (const automatic of [false, true]) {
  test(`last runtime/import-source directive wins: automatic=${automatic}`, () => {
    const header = automatic
      ? '/** @jsxRuntime classic */ /** @jsxRuntime automatic */ /** @jsxImportSource first */ /** @jsxImportSource final */'
      : '/** @jsxRuntime automatic */ /** @jsxRuntime classic */';
    const source = `${header} globalThis.result=<div/>;`;
    const observeRuntime = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('React', 'require', 'globalThis', code)(
        { createElement: () => 'classic' },
        (path: string) => ({ jsx: () => path }),
        context,
      );
      return context.result;
    };
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [[jsx, { runtime: automatic ? 'classic' : 'automatic' }]],
    })!.code!;
    const expected = automatic ? 'final/jsx-runtime' : 'classic';
    expect(observeRuntime(reference)).toBe(expected);
    const code = compile(source, { jsx: automatic ? 'classic' : 'automatic' }, 'input.cjs');
    expect(code).not.toContain('<div');
    expect(observeRuntime(code)).toBe(expected);
  });
}
