import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe.each(['direct parameter', 'nested parameter', 'field'])(
  'optional-chain activation: %s',
  kind => {
    let actual: unknown;
    beforeAll(() => {
      const source = `
      const first = { name: 'first', m() { return this.name; } };
      const second = { name: 'second', m: first.m };
      let receiver = first, entered = false;
      function get() { return receiver; }
      function key() {
        if (!entered) { entered = true; receiver = second; f(); }
        return 'm';
      }
      ${
        kind === 'field'
          ? 'class C { value = get()?.[key()]?.(); } function f() { return new C().value; }'
          : `function f(${kind === 'nested parameter' ? 'unused = (() => 0)(),' : ''} value = get()?.[key()]?.()) { return value; }`
      }
      globalThis.result = f();
    `;
      const nox = compile(source, { transforms: { optionalChaining: { loose: false } } });
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [[optional, { loose: false }]],
      })!.code!;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', code)(context);
        return context.result;
      };
      expect(observe(source)).toBe('first');
      expect(observe(babel)).toBe(kind === 'field' ? 'second' : 'first');
      expect(nox).not.toContain('?.');
      expect(nox).not.toContain('@babel/runtime');
      actual = observe(nox);
    });
    (kind === 'field' ? test.fails : test)(
      'keeps the receiver local during recursive initialization',
      () => {
        expect(actual).toBe('first');
      },
    );
  },
);
