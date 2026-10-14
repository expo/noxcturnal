import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

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
    (parenthesized ? test : test.fails)('preserves ordinary object-spread evaluation order', () => {
      expect(actual).toEqual(expected);
    });
  });
});
