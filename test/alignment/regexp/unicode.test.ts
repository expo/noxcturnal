import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns Unicode regular expressions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^.$/u; globalThis.__result = [expression.test('💩'), expression.test('ab')];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/u[;),\]]/] },
    }),
  ).resolves.toEqual([true, false]);
});
