import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import jsxDevelopment from '@babel/plugin-transform-react-jsx-development';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

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
