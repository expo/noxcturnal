import { transformSync } from '@babel/core';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

const runtime = `
  export const Fragment = 'fragment';
  export function jsxDEV(type, props, key, staticChildren, source, self) {
    return { type, props, key, staticChildren, source, self: self?.marker };
  }
  export function createElement(type, props, ...children) {
    const { __source: source, __self: self, ...rest } = props;
    return { classic: true, type, props: rest, children, source, self: self?.marker };
  }
`;
const importSource = `data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}#`;

test.each([
  ['empty element', '<div/>'],
  ['one child', '<div key="key">text</div>'],
  ['multiple children', '<div><span/>text</div>'],
  ['empty fragment', '<></>'],
  ['one-child fragment', '<>text</>'],
  ['multiple-child fragment', '<><span/>text</>'],
  ['key after spread fallback', '<div {...{ id: 1 }} key="key">text</div>'],
])('development JSX runtime ABI: %s', async (_name, expression) => {
  const source = `function render() { return ${expression}; } export const result = render.call({ marker: 'receiver' });`;
  const babel = transformSync(source, {
    filename: '/audit/input.jsx',
    configFile: false,
    babelrc: false,
    plugins: [[development, { runtime: 'automatic', importSource }]],
  })!.code!;
  const expected = (await importCode(babel)).result;
  const code = compile(
    source,
    {
      jsx: 'automatic-development',
      jsxImportSource: importSource,
    },
    '/audit/input.jsx',
  );
  expect(code).not.toContain('</');
  expect(code).not.toContain('<div');
  expect(code).toContain(importSource);
  expect(code).not.toContain('@babel/runtime');
  const actual = (await importCode(code)).result;
  // Babel omits optional fragment debug arguments. This comparison exercises
  // rendering arguments; fragment metadata differences are audited separately.
  if (expression.startsWith('<>')) {
    const { source: _source, self: _self, ...actualRendering } = actual as Record<string, unknown>;
    const {
      source: _expectedSource,
      self: _expectedSelf,
      ...expectedRendering
    } = expected as Record<string, unknown>;
    expect(actualRendering).toEqual(expectedRendering);
  } else {
    expect(actual).toEqual(expected);
  }
});

describe('automatic development fragment before super in a nested class key', () => {
  let actual: unknown;
  beforeAll(async () => {
    const source = `
      class Base {}
      class Value extends Base {
        constructor() {
          class Inner { [<></>]() {} }
          super();
        }
      }
      export const result = new Value() instanceof Value;
    `;
    expect((await importCode(source.replace('<></>', '"key"'))).result).toBe(true);
    const babel = transformSync(source, {
      filename: '/audit/input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[development, { runtime: 'automatic', importSource }]],
    })!.code!;
    expect((await importCode(babel)).result).toBe(true);
    expect(
      (
        await importCode(
          compile(
            source,
            {
              jsx: 'classic-development',
              jsxPragma: 'factory',
              jsxPragmaFrag: 'React.Fragment',
            },
            '/audit/input.jsx',
          ).replace(
            /^/,
            'const React = { Fragment: "fragment" }; function factory() { return "key"; }',
          ),
        )
      ).result,
    ).toBe(true);
    const code = compile(
      source,
      {
        jsx: 'automatic-development',
        jsxImportSource: importSource,
      },
      '/audit/input.jsx',
    );
    expect(code).not.toContain('<>');
    expect(code).toContain('jsxDEV');
    expect(code).not.toContain('@babel/runtime');
    try {
      actual = (await importCode(code)).result;
    } catch (error) {
      expect(error).toBeInstanceOf(ReferenceError);
      actual = { error: 'ReferenceError' };
    }
  });
  test('does not introduce an enclosing receiver read for a fragment', () => {
    expect(actual).toBe(true);
  });
});
