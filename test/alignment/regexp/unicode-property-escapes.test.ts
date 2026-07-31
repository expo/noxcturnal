import unicodePropertyRegex from '@babel/plugin-transform-unicode-property-regex';
import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns Unicode property escapes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^\\p{ASCII}+$/u; globalThis.__result = [expression.test('abc'), expression.test('é')];`,
      filename: 'input.js',
      plugins: [unicodePropertyRegex],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicodePropertyEscapes: true },
      },
      output: { mustNotMatch: [/\\p\{ASCII\}/] },
    }),
  ).resolves.toEqual([true, false]);
});

test('aligns Unknown aliases and Unicode 17 scripts with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const unknown = /^\p{Script_Extensions=Unknown}$/u;
        const beriaErfe = /^\p{Script_Extensions=Berf}$/u;
        globalThis.__result = [
          unknown.test('\uD800'),
          unknown.test('\uE800'),
          unknown.test('A'),
          beriaErfe.test('\u{16EA0}'),
          beriaErfe.test('\u{16EBA}'),
          beriaErfe.test('\u{16ED3}'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodePropertyRegex],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicodePropertyEscapes: true },
      },
      output: { mustNotMatch: [/\\p\{/u] },
    }),
  ).resolves.toEqual([true, true, false, true, false, true]);
});

test('aligns negated and mixed Unicode property classes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const outerNegation = /^[^\p{ASCII}]$/u;
        const nestedComplement = /^[\P{ASCII}]$/u;
        const mixed = /^[\p{Lowercase_Letter}\d\s]$/u;
        const universalUnion = /^[\p{ASCII}\D]$/u;
        globalThis.__result = [
          outerNegation.test('é'), outerNegation.test('😀'), outerNegation.test('A'),
          nestedComplement.test('é'), nestedComplement.test('😀'), nestedComplement.test('A'),
          mixed.test('a'), mixed.test('5'), mixed.test('\u2028'), mixed.test('\uFEFF'),
          mixed.test('A'), mixed.test('\u0661'), mixed.test('😀'),
          universalUnion.test('A'), universalUnion.test('\u0661'), universalUnion.test('😀'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodePropertyRegex],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicodePropertyEscapes: true },
      },
      output: { mustNotMatch: [/\\[pP]\{/u] },
    }),
  ).resolves.toEqual([
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
  ]);
});

test('aligns complemented astral properties when Unicode mode is also lowered', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const excludedDeseret = /^[^\p{Script=Deseret}]+$/u;
        const oneNonAscii = /^[^\p{ASCII}]{1}$/u;
        const surrogate = /^\p{Surrogate}$/u;
        globalThis.__result = [
          excludedDeseret.test('\u{10400}'), excludedDeseret.test('\u{10428}'),
          excludedDeseret.test('A'), excludedDeseret.test('😀'),
          oneNonAscii.test('é'), oneNonAscii.test('😀'), oneNonAscii.test('ab'),
          surrogate.test('\ud800'), surrogate.test('😀'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodePropertyRegex, unicodeRegex],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
      },
      output: { mustNotMatch: [/\\[pP]\{/u, /\/[dgimsuvy]*u[dgimsuvy]*/u] },
    }),
  ).resolves.toEqual([false, false, true, true, true, true, false, true, false]);
});
