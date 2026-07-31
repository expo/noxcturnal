import optionalCatchBinding from '@babel/plugin-transform-optional-catch-binding';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns optional catch binding with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let caught = false; try { throw Error('expected'); } catch { caught = true; }
globalThis.__result = caught;`,
      filename: 'input.js',
      plugins: [optionalCatchBinding],
      noxcturnal: { transforms: { optionalCatchBinding: true } },
      output: { mustNotMatch: [/catch\s*\{/] },
    }),
  ).resolves.toBe(true);
});

test('aligns generated catch binding collisions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const _unused = 'outer';
let result;
try { throw 'thrown'; } catch { result = _unused; }
globalThis.__result = result;`,
      filename: 'input.js',
      plugins: [optionalCatchBinding],
      noxcturnal: { transforms: { optionalCatchBinding: true } },
      output: { mustNotMatch: [/catch\s*\{/] },
    }),
  ).resolves.toBe('outer');
});
