import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import type { PreflightTransforms } from '../../js';
const require = createRequire(import.meta.url);
const run = (source: string) => {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', source)(require, context);
  return context.result;
};
const cases: {
  name: string;
  pattern: string;
  inputs: string[];
  transforms: PreflightTransforms;
  plugins: string[];
  standard?: string;
}[] = [
  {
    name: 'escaped property-like token through property postcondition',
    pattern: String.raw`/^\\p{2}$/u`,
    inputs: ['\\pp', 'p'],
    transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
    plugins: ['unicode-regex', 'unicode-property-regex'],
  },
  {
    name: 'fallback set folding precedes intersection',
    pattern: '/^[a-z&&[A-Z]]$/iv',
    standard: '/^[[a-z]&&[A-Z]]$/iv',
    inputs: ['a', 'A', 'K', 'k', '1'],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
  {
    name: 'fallback set folding precedes complemented operand',
    pattern: '/^[a-z&&[^A-Z]]$/iv',
    standard: '/^[[a-z]&&[^A-Z]]$/iv',
    inputs: ['a', 'A', 'K', 'k', '1'],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
  {
    name: 'string intersection folds each operand',
    pattern: String.raw`/^[\q{ab|cd}&&\q{AB}]$/iv`,
    inputs: ['ab', 'AB', 'cd', 'CD'],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
  {
    name: 'negative property folds before set complement',
    pattern: String.raw`/^[\P{Lowercase_Letter}]$/iv`,
    inputs: ['a', 'A', 'k', 'K', '1'],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
  {
    name: 'negative word set keeps Unicode case-fold exclusions',
    pattern: String.raw`/^[\W]$/iv`,
    inputs: ['s', 'ſ', 'k', 'K', '!'],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
  {
    name: 'control and paired escapes in Unicode classes',
    pattern: String.raw`/^[\cK\uD801\uDC00]+$/iu`,
    inputs: ['\u000b', '𐐀', '𐐨', 'K', 'k'],
    transforms: { regexpUnicode: true },
    plugins: ['unicode-regex'],
  },
  {
    name: 'empty string alternative follows a consuming range',
    pattern: String.raw`/[\q{|a}]/v`,
    inputs: ['a', 'b', ''],
    transforms: { regexpUnicodeSets: true },
    plugins: ['unicode-sets-regex'],
  },
];
describe.each(cases)('$name', entry => {
  test('preserves native and Babel matching', () => {
    const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.exec(value)?.[0]);`;
    const expected = run(entry.standard ? source.replace(entry.pattern, entry.standard) : source);
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: entry.plugins.map(name => require('@babel/plugin-transform-' + name)),
    })!.code!;
    expect(run(reference)).toEqual(expected);
    const code = compile(source, { transforms: entry.transforms });
    expect(code).not.toMatch(
      entry.transforms.regexpUnicode
        ? /\/[dgimsuvy]*u[dgimsuvy]*\./
        : /\/[dgimsuvy]*v[dgimsuvy]*\./,
    );
    expect(run(code)).toEqual(expected);
  });
});
const modifiers = (() => {
  try {
    new RegExp('(?i:a)');
    return true;
  } catch {
    return false;
  }
})();
test.skipIf(!modifiers)(
  'nested modifier scopes restore flags across siblings and property collectors',
  () => {
    const source = String.raw`globalThis.result=['K','k','K','!'].map(value=>[/^(?-i:[\W\p{ASCII_Hex_Digit}])$/iu.test(value), /^(?i:[\W\p{ASCII_Hex_Digit}])$/u.test(value), /^(?-i:(?i:k))k$/iu.test(value+'K')]);`;
    const expected = run(source);
    const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
    expect(code).not.toMatch(/\\[pP]\{/);
    expect(run(code)).toEqual(expected);
  },
);

describe.each([false, true])(
  'case closure before class complement (drop Unicode: %s)',
  regexpUnicode => {
    test.each([
      String.raw`/^[^\p{Lowercase_Letter}]$/iu`,
      String.raw`/^\P{Lowercase_Letter}$/iu`,
      String.raw`/^[^a]$/iu`,
    ])('%s keeps property and class negation distinct', pattern => {
      const source = `globalThis.result=['a','A','k','K','1','😀'].map(value=>${pattern}.test(value));`;
      const expected = run(source);
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [
          require('@babel/plugin-transform-unicode-property-regex'),
          ...(regexpUnicode ? [require('@babel/plugin-transform-unicode-regex')] : []),
        ],
      })!.code!;
      expect(run(reference)).toEqual(expected);
      const code = compile(source, {
        transforms: { regexpUnicodePropertyEscapes: true, regexpUnicode },
      });
      expect(code).not.toMatch(/\\[pP]\{/);
      if (regexpUnicode) expect(code).not.toMatch(/\/iu\b/);
      expect(run(code)).toEqual(expected);
    });
  },
);
test.skipIf(!modifiers)('property class complements use effective local ignore-case flags', () => {
  const source = String.raw`globalThis.result=['a','A','k','K','1'].map(value=>[/^(?-i:[^\p{Lowercase_Letter}])$/iu.test(value),/^(?i:[^\p{Lowercase_Letter}])$/u.test(value),/^(?i:\P{Lowercase_Letter})$/u.test(value)]);`;
  const expected = run(source);
  for (const regexpUnicode of [false, true]) {
    const code = compile(source, {
      transforms: { regexpUnicodePropertyEscapes: true, regexpUnicode },
    });
    expect(code).not.toMatch(/\\[pP]\{/);
    expect(run(code)).toEqual(expected);
  }
});

test('standalone v negative property complements folded membership', () => {
  const source = String.raw`globalThis.result=['a','A','K','1'].map(value=>/^\P{Lowercase_Letter}$/iv.test(value));`;
  const code = compile(source, { transforms: { regexpUnicodeSets: true } });
  expect(code).not.toMatch(/\/iv\b/);
  expect(run(code)).toEqual(run(source));
});
test('opening bracket remains literal in a Unicode ignore-case class', () => {
  const source = String.raw`globalThis.result=['[','K','K'].map(value=>/^[[]k$/iu.test(value+'K'));`;
  const code = compile(source, { transforms: { regexpUnicode: true } });
  expect(code).not.toMatch(/\/iu\b/);
  expect(run(code)).toEqual(run(source));
});

test('legacy identity escape k is not a named reference without named captures', () => {
  const source = String.raw`globalThis.result=['k<a\nb>','k<a.b>'].map(value=>/^\k<a.b>$/s.test(value));`;
  const code = compile(source, { transforms: { regexpDotAll: true } });
  expect(code).not.toMatch(/\/s\b/);
  expect(run(code)).toEqual(run(source));
});
