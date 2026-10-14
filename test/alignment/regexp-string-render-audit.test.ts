import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  { name: 'line feed', escape: String.raw`\n`, value: '\n' },
  { name: 'carriage return', escape: String.raw`\r`, value: '\r' },
  { name: 'line separator', escape: String.raw`\u2028`, value: '\u2028' },
  { name: 'paragraph separator', escape: String.raw`\u2029`, value: '\u2029' },
  { name: 'NUL', escape: String.raw`\x00`, value: '\0' },
  {
    name: 'escaped slash and metacharacters',
    escape: String.raw`\/\.\*`,
    value: '/.*',
  },
];
function execute(fn: Function): unknown {
  const context: Record<string, unknown> = {};
  fn(context);
  return context.result;
}
for (const entry of cases) {
  describe(entry.name, () => {
    let parseError: unknown;
    let actual: unknown;
    beforeAll(() => {
      const inputs = [`a${entry.value}`, 'b', 'a', 'c'];
      const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^[\\q{a${entry.escape}|b}]$/v.test(value));`;
      const expected = [true, true, false, false];
      expect(execute(new Function('globalThis', source))).toEqual(expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      })!.code!;
      expect(execute(new Function('globalThis', reference))).toEqual(expected);
      const code = compile(source, { transforms: { regexpUnicodeSets: true } });
      expect(code).not.toContain('\\q{');
      expect(code).not.toMatch(/\/v\b/);
      let fn: Function | undefined;
      try {
        fn = new Function('globalThis', code);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        parseError = error;
      }
      if (fn) actual = execute(fn);
    });
    test('emits a valid literal with equivalent membership', () => {
      expect(parseError).toBeUndefined();
      expect(actual).toEqual([true, true, false, false]);
    });
  });
}
