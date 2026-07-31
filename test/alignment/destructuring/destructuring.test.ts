import destructuring from '@babel/plugin-transform-destructuring';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns destructuring with Babel (built-ins=%s)', async useBuiltIns => {
  await expect(
    alignBabelBehavior({
      source: `let calls = 0; const read = () => { calls++; return { a: 20, nested: [22] }; };
const { a, nested: [b] } = read(); globalThis.__result = [a + b, calls];`,
      filename: 'input.js',
      plugins: [[destructuring, { useBuiltIns }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { destructuring: { useBuiltIns } },
      },
      output: { mustNotMatch: [/\{\s*a\s*,\s*nested\s*:/] },
    }),
  ).resolves.toEqual([42, 1]);
});
