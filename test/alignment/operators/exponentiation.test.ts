import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns exponentiation assignment with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let reads = 0; const object = { value: 2 }; const key = () => { reads++; return 'value'; };
object[key()] **= 3; globalThis.__result = [object.value, reads];`,
      filename: 'input.js',
      plugins: [exponentiation],
      noxcturnal: { transforms: { exponentiationOperator: true } },
      output: { mustNotMatch: [/\*\*/] },
    }),
  ).resolves.toEqual([8, 1]);
});
