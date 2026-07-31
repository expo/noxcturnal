import asyncGenerators from '@babel/plugin-transform-async-generator-functions';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns async generators with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `async function* values() { yield 20; yield await Promise.resolve(22); }
globalThis.__result = (async () => { const found = []; for await (const value of values()) found.push(value); return found; })();`,
      filename: 'input.js',
      plugins: [asyncGenerators],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { asyncGeneratorFunctions: true },
      },
      output: { mustNotMatch: [/async\s+function\s*\*/, /for\s+await\s*\(/] },
    }),
  ).resolves.toEqual([20, 22]);
});
