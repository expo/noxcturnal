import classes from '@babel/plugin-transform-classes';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns inheritance and super calls with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Base { constructor(value) { this.value = value; } read() { return this.value; } }
class Derived extends Base { read() { return super.read() * 2; } }
globalThis.__result = new Derived(21).read();`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustNotMatch: [/^\s*class\s/m, /\bsuper\s*\./] },
    }),
  ).resolves.toBe(42);
});
