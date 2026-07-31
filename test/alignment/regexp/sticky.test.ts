import stickyRegex from '@babel/plugin-transform-sticky-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns sticky regular expressions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /a/y; expression.lastIndex = 1;
globalThis.__result = [expression.test('ba'), expression.lastIndex];`,
      filename: 'input.js',
      plugins: [stickyRegex],
      noxcturnal: { transforms: { regexpSticky: true } },
      output: { mustNotMatch: [/\/a\/y/] },
    }),
  ).resolves.toEqual([true, 2]);
});
