import unicodePropertyRegex from '@babel/plugin-transform-unicode-property-regex';
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

test('aligns generated Unicode-data fallbacks with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const unknown = /^\p{Script_Extensions=Unknown}$/u;
        const beriaErfe = /^\p{Script_Extensions=Berf}$/u;
        const line = /^\p{Line_Separator}$/u;
        const paragraph = /^\p{Paragraph_Separator}$/u;
        const sidetic = /^\p{Script=Sidetic}$/u;
        const taiYo = /^\p{Script_Extensions=Tai_Yo}$/u;
        const tolongSiki = /^\p{Script=Tolong_Siki}$/u;
        const nfkc = /^\p{Changes_When_NFKC_Casefolded}$/u;
        globalThis.__result = [
          unknown.test('\uD800'),
          unknown.test('\uE800'),
          unknown.test('A'),
          beriaErfe.test('\u{16EA0}'),
          beriaErfe.test('\u{16EBA}'),
          beriaErfe.test('\u{16ED3}'),
          line.test('\u2028'), paragraph.test('\u2029'),
          sidetic.test('\u{10940}'), taiYo.test('\u{1E6C0}'),
          tolongSiki.test('\u{11DB0}'), nfkc.test('A'), nfkc.test('a'),
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
  ).resolves.toEqual([
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
});
