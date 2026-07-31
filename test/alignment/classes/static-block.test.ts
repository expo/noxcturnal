import classStaticBlock from '@babel/plugin-transform-class-static-block';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns class static blocks with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const trace = [];
class Example { static { trace.push(this.value); this.value = 3; } }
globalThis.__result = [Example.value, trace];`,
      filename: 'input.js',
      plugins: [[classStaticBlock, { loose: true }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { classStaticBlock: true },
      },
      output: { mustNotMatch: [/static\s*\{/] },
    }),
  ).resolves.toEqual([3, [undefined]]);
});
