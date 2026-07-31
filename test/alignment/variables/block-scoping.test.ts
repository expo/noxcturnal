import blockScoping from '@babel/plugin-transform-block-scoping';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns captured loop bindings with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const callbacks = [];
for (let index = 0; index < 3; index++) callbacks.push(() => index);
globalThis.__result = callbacks.map(callback => callback());`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/\b(?:let|const)\b/] },
    }),
  ).resolves.toEqual([0, 1, 2]);
});
