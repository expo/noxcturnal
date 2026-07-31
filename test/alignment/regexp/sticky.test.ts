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

test('aligns sticky failure resets, global flags, and empty matches with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const failed = /a/y; failed.lastIndex = 1;
const combined = /a/gy; combined.lastIndex = 1;
const empty = /(?:)/y; empty.lastIndex = 1;
globalThis.__result = [
  failed.test('bb'), failed.lastIndex,
  combined.exec('ba')?.[0], combined.lastIndex,
  empty.exec('x')?.index, empty.lastIndex,
];`,
      filename: 'input.js',
      plugins: [stickyRegex],
      noxcturnal: { transforms: { regexpSticky: true } },
      output: { mustNotMatch: [/\/a\/gy/, /\/\(\?:\)\/y/] },
    }),
  ).resolves.toEqual([false, 0, 'a', 2, 1, 1]);
});
