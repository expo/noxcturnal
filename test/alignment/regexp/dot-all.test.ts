import dotAllRegex from '@babel/plugin-transform-dotall-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns dot-all regular expressions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^.$/s; globalThis.__result = expression.test('\\n');`,
      filename: 'input.js',
      plugins: [dotAllRegex],
      noxcturnal: { transforms: { regexpDotAll: true } },
      output: { mustNotMatch: [/\/s[;),\]]/] },
    }),
  ).resolves.toBe(true);
});

test('aligns every line terminator while preserving escaped and class dots', async () => {
  await expect(
    alignBabelBehavior({
      source: `const wildcard = /^.$/s;
const literalDots = /^[.]\\.$/s;
const unicode = /^.$/su;
globalThis.__result = [
  ['\\n', '\\r', '\\u2028', '\\u2029'].map(value => wildcard.test(value)),
  literalDots.test('..'),
  literalDots.test('a.'),
  unicode.test('😀'),
];`,
      filename: 'input.js',
      plugins: [dotAllRegex],
      noxcturnal: { transforms: { regexpDotAll: true } },
      output: { mustNotMatch: [/\/s[;),\]]/] },
    }),
  ).resolves.toEqual([[true, true, true, true], true, false, true]);
});
