import privateMethods from '@babel/plugin-transform-private-methods';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns loose private methods with Babel', async () => {
  const loose = true;
  await expect(
    alignBabelBehavior({
      source: `class Example { #read() { return 42; } run() { return this.#read(); } }
globalThis.__result = new Example().run();`,
      filename: 'input.js',
      plugins: [[privateMethods, { loose }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { privateMethods: { loose } },
      },
      output: { mustNotMatch: [/#read\b/] },
    }),
  ).resolves.toBe(42);
});
