import parameters from '@babel/plugin-transform-parameters';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns default, destructured, and rest parameters with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `function read({ value } = { value: 20 }, ...rest) { return value + rest[0]; }
globalThis.__result = read(undefined, 22);`,
      filename: 'input.js',
      plugins: [parameters],
      noxcturnal: { transforms: { parameters: true } },
      output: { mustNotMatch: [/function read\(\{/, /\.\.\.rest/] },
    }),
  ).resolves.toBe(42);
});
