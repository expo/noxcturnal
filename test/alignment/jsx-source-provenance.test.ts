import { transformSync } from '@babel/core';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { createRequire } from 'node:module';
import jsx from '@babel/plugin-transform-react-jsx';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';

describe('jsx location', () => {
  const cases = [
    { name: 'astral UTF-16 control', character: '😀', line: 1, column: 86, fails: false },
    { name: 'vertical tab', character: '\v', line: 1, column: 85, fails: true },
    { name: 'form feed', character: '\f', line: 1, column: 85, fails: true },
    { name: 'NEL', character: '\u0085', line: 1, column: 85, fails: true },
    { name: 'line separator control', character: '\u2028', line: 2, column: 21, fails: false },
    { name: 'CRLF control', character: '\r\n', line: 2, column: 21, fails: false },
  ];
  describe.each(cases)('JSX development location after $name', ({ character, line, column }) => {
    let actual: unknown;
    const expected = { fileName: '/audit/input.jsx', lineNumber: line, columnNumber: column };
    beforeAll(() => {
      const source = `const React={createElement(_,props){return props.__source;}};/*${character}*/globalThis.result=<div/>;`;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', code)(context);
        return context.result;
      };
      const babel = transformSync(source, {
        filename: '/audit/input.jsx',
        configFile: false,
        babelrc: false,
        plugins: [[development, { runtime: 'classic' }]],
      })!.code!;
      expect(observe(babel)).toEqual(expected);
      const code = compile(source, { jsx: 'classic-development' }, '/audit/input.jsx');
      expect(code).not.toContain('<div');
      expect(code).toContain('__source');
      expect(code).not.toContain('@babel/runtime');
      actual = observe(code);
    });
    test('counts only JavaScript line terminators in source metadata', () => {
      expect(actual).toEqual(expected);
    });
  });
});

describe('jsx provenance', () => {
  const require = createRequire(import.meta.url);
  const expected = [4, ['get', 'mark']];
  describe.each(['inline', 'runtime'] as const)('classic JSX provenance with %s helpers', mode => {
    describe.each([false, true])('parenthesized ordinary exponent operand=%s', parenthesized => {
      let actual: unknown;
      beforeAll(() => {
        const operand = '{ ...source, extra: mark(), valueOf() { return 2; } }';
        const source = `
        const events = [];
        const React = { createElement() { return 2; } };
        const source = { get value() { events.push('get'); return 3; } };
        const mark = () => { events.push('mark'); return 4; };
        const value = <div/> ** ${parenthesized ? `(${operand})` : operand};
        globalThis.result = [value, events];
      `;
        const nox = compile(
          source,
          {
            jsx: 'classic',
            transforms: { exponentiationOperator: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.jsx',
        );
        const babel = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [[jsx, { runtime: 'classic' }], exponentiation],
        })!.code!;
        const observe = (code: string) => {
          const context: Record<string, unknown> = {};
          new Function('globalThis', 'require', code)(context, require);
          return context.result;
        };
        // Explicit JSX-free control: the mock factory's return value is the base;
        // the ordinary RHS object still obeys native object-spread ordering.
        expect(observe(source.replace('<div/>', 'React.createElement("div", null)'))).toEqual(
          expected,
        );
        expect(observe(babel)).toEqual(expected);
        expect(nox).not.toContain('<div');
        expect(nox).not.toContain('**');
        expect(nox).toContain('Math.pow');
        actual = observe(nox);
      });
      test('preserves ordinary object-spread evaluation order', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});

describe('jsx spread provenance regressions', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  // A real JSX props object deliberately keeps assignment semantics; ordinary
  // object arguments and exponent operands must keep their own spread ordering.
  describe.each(['inline', 'runtime'] as const)('%s JSX provenance', mode => {
    describe.each(['classic', 'classic-development'] as const)('%s', jsxMode => {
      test.each([
        ['element', '<div {...source} extra={mark()} />', ['mark', 'get']],
        ['nested element', '<div><span {...source} extra={mark()} /></div>', ['mark', 'get']],
        ['fragment child', '<><span {...source} extra={mark()} /></>', ['mark', 'get']],
        ['exponent', '<div/> ** {...source, extra: mark(), valueOf(){return 2}}', ['get', 'mark']],
        [
          'spread-props exponent',
          '<div {...{}} flag={1}/> ** {...source, extra: mark(), valueOf(){return 2}}',
          ['get', 'mark'],
        ],
        [
          'parenthesized base',
          '(<div/>) ** {...source, extra: mark(), valueOf(){return 2}}',
          ['get', 'mark'],
        ],
        [
          'fragment exponent',
          '<></> ** {...source, extra: mark(), valueOf(){return 2}}',
          ['get', 'mark'],
        ],
        ['ordinary factory call', 'h("div", {...source, extra: mark()})', ['get', 'mark']],
        [
          'ordinary call inside JSX',
          '<div>{h("div", {...source, extra: mark()})}</div>',
          ['get', 'mark'],
        ],
      ])('%s', (_name, expression, expected) => {
        const source = `/** @jsx h */ /** @jsxFrag F */
        const F = "fragment"; function h(){return 2};
        const events=[]; const source={get value(){events.push('get');return 3}};
        function mark(){events.push('mark');return 4}
        const value=${expression}; globalThis.result=events;`;
        const reference = transformSync(source, {
          babelrc: false,
          configFile: false,
          plugins: [
            [jsxMode === 'classic' ? jsx : jsxDevelopment, { runtime: 'classic' }],
            exponentiation,
          ],
        })!.code!;
        expect(observe(reference)).toEqual(expected);
        const output = compile(
          source,
          {
            comments: false,
            jsx: jsxMode,
            transforms: { exponentiationOperator: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.jsx',
        );
        expect(output).not.toContain('**');
        expect(output).not.toContain('<div');
        expect(observe(output)).toEqual(expected);
      });
    });
    test.each(['(<div/> as number)', '(<div/>)!', '(<div/> satisfies number)'])(
      'TypeScript wrapper %s',
      expression => {
        const source = `const React={createElement(){return 2}}; const events=[];
      const input={get a(){events.push('get');return 1}};
      const value=${expression} ** {...input, b:(events.push('mark'),2), valueOf(){return 2}};
      globalThis.result=[value,events];`;
        const output = compile(
          source,
          {
            typescript: 'strip',
            jsx: 'classic',
            transforms: { exponentiationOperator: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.tsx',
        );
        expect(output).not.toContain('**');
        expect(observe(output)).toEqual([4, ['get', 'mark']]);
      },
    );
  });
});

describe('jsx self scope', () => {
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
});
import jsxDevelopment from '@babel/plugin-transform-react-jsx-development';
