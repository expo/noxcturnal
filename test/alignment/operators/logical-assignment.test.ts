import logicalAssignment from '@babel/plugin-transform-logical-assignment-operators';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns logical assignment evaluation order with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let reads = 0; const object = { value: 0 }; const key = () => { reads++; return 'value'; };
object[key()] ||= 42; globalThis.__result = [object.value, reads];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([42, 1]);
});
