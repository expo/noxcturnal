import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'string property outside a class',
    tail: String.raw`\p{RGI_Emoji_Flag_Sequence}`,
    inputs: ['a🇬🇧', 'a🇺🇸', 'az'],
    expected: [true, true, false],
    broken: false,
  },
  {
    name: 'sole string property inside a class',
    tail: String.raw`[\p{RGI_Emoji_Flag_Sequence}]`,
    inputs: ['a🇬🇧', 'az'],
    expected: [true, false],
    broken: false,
  },
  {
    name: 'string property and character union',
    tail: String.raw`[\p{RGI_Emoji_Flag_Sequence}z]`,
    inputs: ['a🇬🇧', 'az', 'ay'],
    expected: [true, true, false],
    broken: false,
  },
  {
    name: 'sole string retains its quantified atom',
    tail: String.raw`[\q{ab}]+`,
    inputs: ['aab', 'aabab', 'aabb'],
    expected: [true, true, false],
    broken: true,
  },
  {
    name: 'empty sole string remains an empty atom',
    tail: String.raw`[\q{}]`,
    inputs: ['a', 'aa'],
    expected: [true, false],
    broken: false,
  },
  {
    name: 'empty member follows longer alternatives',
    tail: String.raw`[\q{|b}]`,
    inputs: ['a', 'ab', 'abb'],
    expected: [true, true, false],
    broken: false,
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
      const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>/^[a-z&&[^x]]${entry.tail}$/v.test(value));`;
      const standard = source.replace('[a-z&&', '[[a-z]&&');
      expect(() => new Function(source)).toThrow(SyntaxError);
      expect(run(standard)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      })!.code!;
      expect(run(reference)).toEqual(entry.expected);
      const code = compile(source, { transforms: { regexpUnicodeSets: true } });
      expect(code).not.toMatch(/\/v\b/);
      expect(code).not.toContain('\\q{');
      expect(code).not.toContain('\\p{RGI_Emoji_Flag_Sequence}');
      actual = run(code);
    });
    (entry.broken ? test.fails : test)('preserves membership through the textual fallback', () => {
      expect(actual).toEqual(entry.expected);
    });
  });

test('named-group selection makes nonstandard range grammar a pristine bailout', () => {
  const source = String.raw`/* original */ globalThis.result = /(?<letter>[a-z&&[^x]])/v.test('a');`;
  const standard = source.replace('[a-z&&', '[[a-z]&&');
  expect(run(standard)).toBe(true);
  const reference = transformSync(source, {
    sourceType: 'script',
    babelrc: false,
    configFile: false,
    plugins: [
      require('@babel/plugin-transform-unicode-sets-regex'),
      require('@babel/plugin-transform-named-capturing-groups-regex'),
    ],
  })!.code!;
  // Babel's named helper is inline for this comparison.
  expect(run(reference)).toBe(true);
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'audit',
          native: {
            transforms: { regexpUnicodeSets: true, regexpNamedCaptureGroups: true },
          },
        },
      ],
    }),
  );
  expect(result.status).toBe('bailout');
  if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
  expect(result.reason).toBe('audit:regexp-pattern-invalid');
  expect(result.source).toBe(source);
});
