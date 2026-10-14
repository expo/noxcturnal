import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const inputs = ['K', 'ſ', 'k', 's', '1', '!'];
const cases = [
  {
    name: 'negative word escape with hex property',
    pattern: String.raw`/^[\W\p{ASCII_Hex_Digit}]$/iu`,
    expected: [false, false, false, false, true, true],
  },
  {
    name: 'negative word escape with decimal property',
    pattern: String.raw`/^[\W\p{Decimal_Number}]$/iu`,
    expected: [false, false, false, false, true, true],
  },
  {
    name: 'outer complement of word and property union',
    pattern: String.raw`/^[^\w\p{ASCII_Hex_Digit}]$/iu`,
    expected: [false, false, false, false, false, true],
  },
  {
    name: 'negative word escape without case folding',
    pattern: String.raw`/^[\W\p{ASCII_Hex_Digit}]$/u`,
    expected: [true, true, false, false, true, true],
  },
  {
    name: 'positive word escape with case folding',
    pattern: String.raw`/^[\w\p{ASCII_Hex_Digit}]$/iu`,
    expected: [true, true, true, true, true, false],
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases) {
  describe(entry.name, () => {
    let actual: unknown;
    beforeAll(() => {
      const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>${entry.pattern}.test(value));`;
      expect(run(source)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-property-regex')],
      })!.code!;
      expect(run(reference)).toEqual(entry.expected);
      const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
      expect(code).not.toMatch(/\\[pP]\{/);
      actual = run(code);
    });
    test('preserves Unicode word membership', () => {
      expect(actual).toEqual(entry.expected);
    });
  });
}
