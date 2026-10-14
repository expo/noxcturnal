import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const inputs = ['ab', 'abab', 'abb', 'abcd', '😀a😀a', '😀aa'];
const cases = [
  {
    name: 'single string retains plus atom',
    pattern: String.raw`/^[\q{ab}]+$/v`,
    expected: [true, true, false, false, false, false],
  },
  {
    name: 'single string retains bounded repetition atom',
    pattern: String.raw`/^[\q{ab}]{2}$/v`,
    expected: [false, true, false, false, false, false],
  },
  {
    name: 'deduplicated strings retain their atom',
    pattern: String.raw`/^[\q{ab|ab}]+$/v`,
    expected: [true, true, false, false, false, false],
  },
  {
    name: 'distinct strings retain the alternation atom',
    pattern: String.raw`/^[\q{ab|cd}]+$/v`,
    expected: [true, true, false, true, false, false],
  },
  {
    name: 'supplementary string retains its whole atom',
    pattern: String.raw`/^[\q{😀a}]+$/v`,
    expected: [false, false, false, false, true, false],
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases)
  describe(entry.name, () => {
    let actual: unknown;
    beforeAll(() => {
      const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>${entry.pattern}.test(value));`;
      expect(run(source)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      })!.code!;
      expect(run(reference)).toEqual(entry.expected);
      const code = compile(source, { transforms: { regexpUnicodeSets: true } });
      expect(code).not.toContain('\\q{');
      expect(code).not.toMatch(/\/v\b/);
      actual = run(code);
    });
    test('preserves quantified string membership', () => {
      expect(actual).toEqual(entry.expected);
    });
  });
