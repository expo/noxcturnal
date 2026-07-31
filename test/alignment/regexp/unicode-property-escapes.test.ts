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
