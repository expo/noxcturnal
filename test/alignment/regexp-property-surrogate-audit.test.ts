import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { defineNativePipeline, transform } from '../../js';
const require = createRequire(import.meta.url);
const inputs = ['\uD800', '\uDFFF', '😀', 'a'];
const cases = [
  { property: 'Assigned', escape: 'p', expected: [true, true, true, true] },
  { property: 'Assigned', escape: 'P', expected: [false, false, false, false] },
  { property: 'Other', escape: 'P', expected: [false, false, true, true] },
  { property: 'Other', escape: 'p', expected: [true, true, false, false] },
  { property: 'Any', escape: 'p', expected: [true, true, true, true] },
  { property: 'Surrogate', escape: 'p', expected: [true, true, false, false] },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
function reference(source: string): string {
  return transformSync(source, {
    sourceType: 'script',
    babelrc: false,
    configFile: false,
    plugins: [require('@babel/plugin-transform-unicode-property-regex')],
  })!.code!;
}
for (const entry of cases) {
  describe(`${entry.escape}{${entry.property}}`, () => {
    let actual: unknown;
    beforeAll(() => {
      const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^\\${entry.escape}{${entry.property}}$/u.test(value));`;
      expect(run(source)).toEqual(entry.expected);
      expect(run(reference(source))).toEqual(entry.expected);
      const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
      expect(code).not.toMatch(/\\[pP]\{/);
      actual = run(code);
    });
    test('preserves surrogate membership', () => {
      expect(actual).toEqual(entry.expected);
    });
  });
}
test('empty Any complement has a pristine unsupported outcome', () => {
  const source = String.raw`/* original */ globalThis.result = /^\P{Any}$/u.test('a');`;
  expect(run(source)).toBe(false);
  expect(run(reference(source))).toBe(false);
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'audit', native: { transforms: { regexpUnicodePropertyEscapes: true } } }],
    }),
  );
  expect(result.status).toBe('bailout');
  if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
  expect(result.reason).toBe('audit:regexp-unicode-property-invalid');
  expect(result.source).toBe(source);
});
