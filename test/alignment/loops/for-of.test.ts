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

test('aligns loop-head and body lexical environments with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const seen = [];
for (const value of [1, 2]) {
  const value = 'body';
  seen.push(value);
}
globalThis.__result = seen;`,
      filename: 'input.js',
      plugins: [forOf],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { forOf: true } },
      output: { mustNotMatch: [/for\s*\([^)]*\bof\b/] },
    }),
  ).resolves.toEqual(['body', 'body']);
});

// Babel currently accepts a primitive iterator.return() result here. Keep the
// behavioral comparison executable so an upstream change makes this expected
// divergence fail and prompts us to turn it into ordinary alignment coverage.
test.fails('records Babel divergence for IteratorClose object-result validation', async () => {
  await expect(
    alignBabelBehavior({
      source: `const iterable = {
  [Symbol.iterator]() {
    return {
      next() { return { value: 1, done: false }; },
      return() { return 1; },
    };
  },
};
let result = false;
try { for (const value of iterable) { void value; break; } }
catch (error) { result = error instanceof TypeError; }
globalThis.__result = result;`,
      filename: 'input.js',
      plugins: [forOf],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { forOf: true } },
      output: { mustNotMatch: [/for\s*\([^)]*\bof\b/] },
    }),
  ).resolves.toBe(true);
});
