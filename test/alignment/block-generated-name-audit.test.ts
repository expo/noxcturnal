import { transformSync } from '@babel/core';
import blockScoping from '@babel/plugin-transform-block-scoping';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'ordinary lexical replacement',
    external: '_value',
    source: `let value=1; { let value=2; globalThis.inner=value; } globalThis.result=[value,globalThis.inner,_value===99];`,
    expected: [1, 2, true],
  },
  {
    name: 'read-only value temporary',
    external: '_readOnlyValue',
    source: `const value=1;let rejected=false;try{value+=2;}catch(error){rejected=error instanceof TypeError;}globalThis.result=[value,rejected,_readOnlyValue===99];`,
    expected: [1, true, true],
  },
  {
    name: 'read-only helper name',
    external: '_readOnlyError',
    source: `const value=1;let rejected=false;try{value=2;}catch(error){rejected=error instanceof TypeError;}globalThis.result=[value,rejected,_readOnlyError===99];`,
    expected: [1, true, true],
  },
];

describe.each(cases)('$name', ({ external, source: body, expected }) => {
  describe.each([false, true])('declared name=%s', declared => {
    let actual: unknown;
    beforeAll(() => {
      const source = (declared ? `const ${external}=99;` : '') + body;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        if (declared) new Function('globalThis', code)(context);
        else new Function(external, 'globalThis', code)(99, context);
        return context.result;
      };
      expect(observe(source)).toEqual(expected);
      const babel = transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: [blockScoping],
      })!.code!;
      expect(observe(babel)).toEqual(expected);
      const code = compile(source, { transforms: { blockScoping: true } });
      expect(code).not.toMatch(/\b(?:let|const)\b/);
      actual = observe(code);
    });
    test('preserves the supplied external value', () => {
      expect(actual).toEqual(expected);
    });
  });
});
