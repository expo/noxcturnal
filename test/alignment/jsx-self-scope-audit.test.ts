import { transformSync } from '@babel/core';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe.each([false, true])('development JSX before super, nested class key=%s', nested => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      const React = { createElement() { return 'key'; } };
      class Base {}
      class Value extends Base {
        constructor() {
          ${nested ? 'class Inner { [<div/>]() {} }' : 'const key = <div/>;'}
          super();
        }
      }
      globalThis.result = new Value() instanceof Value;
    `;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      try {
        new Function('globalThis', code)(context);
        return context.result;
      } catch (error) {
        return { error: (error as Error).name };
      }
    };
    // JSX-free factory control establishes that class-key evaluation is valid
    // before super when development metadata does not introduce a this read.
    expect(observe(source.replace('<div/>', 'React.createElement("div", null)'))).toBe(true);
    expect(observe(compile(source, { jsx: 'classic' }, 'input.jsx'))).toBe(true);
    const babel = transformSync(source, {
      filename: 'input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[development, { runtime: 'classic' }]],
    })!.code!;
    expect(observe(babel)).toEqual(nested ? { error: 'ReferenceError' } : true);
    const code = compile(source, { jsx: 'classic-development' }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(code).toContain('__source');
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
    if (nested) expect(actual).toEqual({ error: 'ReferenceError' });
  });
  (nested ? test.fails : test)(
    'does not access the enclosing receiver before super for metadata',
    () => {
      expect(actual).toBe(true);
    },
  );
});
