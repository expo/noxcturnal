import dotAllRegex from '@babel/plugin-transform-dotall-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns dot-all regular expressions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^.$/s; globalThis.__result = expression.test('\\n');`,
      filename: 'input.js',
      plugins: [dotAllRegex],
      noxcturnal: { transforms: { regexpDotAll: true } },
      output: { mustNotMatch: [/\/s[;),\]]/] },
    }),
  ).resolves.toBe(true);
});
