import forOf from '@babel/plugin-transform-for-of';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns for-of iteration with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let total = 0; for (const value of new Set([20, 22])) total += value;
globalThis.__result = total;`,
      filename: 'input.js',
      plugins: [forOf],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { forOf: true } },
      output: { mustNotMatch: [/for\s*\([^)]*\bof\b/] },
    }),
  ).resolves.toBe(42);
});
