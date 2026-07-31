import explicitResourceManagement from '@babel/plugin-transform-explicit-resource-management';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns synchronous resource disposal with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const trace = []; { using resource = { [Symbol.dispose]() { trace.push('disposed'); } }; trace.push('body'); }
globalThis.__result = trace;`,
      filename: 'input.js',
      plugins: [explicitResourceManagement],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { explicitResourceManagement: true },
      },
      output: { mustNotMatch: [/\busing\s+resource\b/] },
    }),
  ).resolves.toEqual(['body', 'disposed']);
});
