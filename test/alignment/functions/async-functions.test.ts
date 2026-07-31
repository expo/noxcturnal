import asyncToGenerator from '@babel/plugin-transform-async-to-generator';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns async functions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `async function read() { return (await Promise.resolve(40)) + 2; }
globalThis.__result = read();`,
      filename: 'input.js',
      plugins: [asyncToGenerator],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { asyncFunctions: true } },
      output: { mustNotMatch: [/async\s+function/, /\bawait\b/] },
    }),
  ).resolves.toBe(42);
});
