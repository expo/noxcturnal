import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

describe('jsx comment directive', () => {
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
  ])('JSX pragma comment separator: $name', ({ separator, prefix, suffix }) => {
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
    test('honors the configured factory', () => {
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
    test('rejects an invalid runtime directive', () => {
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
  ])('JSX comment parser boundary: $name', ({ header, late, babelValue }) => {
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
    expect(observe(code)).toBe(babelValue);
  });
});

describe('jsx directive recovery', () => {
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
      const code = compile(source, { jsx: automatic ? 'classic' : 'automatic' }, 'input.cjs', {
        parser: 'jsx',
      });
      expect(code).not.toContain('<div');
      expect(observeRuntime(code)).toBe(expected);
    });
  }
});

describe('jsx directive policy settlement', () => {
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
});

describe('jsx pragma context', () => {
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
});

describe('jsx unicode pragma', () => {
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
});
