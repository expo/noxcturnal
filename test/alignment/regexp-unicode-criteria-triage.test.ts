import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import stickyRegex from '@babel/plugin-transform-sticky-regex';
import namedGroups from '@babel/plugin-transform-named-capturing-groups-regex';
import { expect, test } from 'vitest';
import { alignBabelBehavior } from './transform';

// Native differences are retained in compliance; these assert the adopted Babel baseline.
const unicodeCases = [
  {
    name: 'empty matchAll advances by UTF-16 unit after Unicode lowering',
    source: `globalThis.__result = Array.from('😀'.matchAll(/(?:)/gu), match => match.index);`,
    expected: [0, 1, 2],
  },
  {
    name: 'exec from inside a surrogate pair misses after Unicode lowering',
    source: `const regexp = /./gu; regexp.lastIndex = 1; const match = regexp.exec('😀'); globalThis.__result = [match && match[0], match && match.index, regexp.lastIndex];`,
    expected: [null, null, 0],
  },
  {
    name: 'Unicode-only word characters lose boundary behavior',
    source: String.raw`globalThis.__result = [/\bſ\b/iu.test('ſ'), /\bK\b/iu.test('K')];`,
    expected: [false, false],
  },
  {
    name: 'Unicode-only folds are lost in backreferences',
    source: String.raw`globalThis.__result = [/^(k)\1$/iu.test('kK'), /^(K)\1$/iu.test('Kk'), /^(s)\1$/iu.test('sſ'), /^(ſ)\1$/iu.test('ſs')];`,
    expected: [false, false, false, false],
  },
];
for (const entry of unicodeCases) {
  test(entry.name, async () => {
    await expect(
      alignBabelBehavior({
        source: entry.source,
        filename: 'input.js',
        plugins: [unicodeRegex],
        noxcturnal: { transforms: { regexpUnicode: true } },
        output: { mustNotMatch: [/\/[dgimsuvy]*u[dgimsuvy]*\s*[;),.]/] },
      }),
    ).resolves.toEqual(entry.expected);
  });
}

test('sticky constructor references the shadowed RegExp binding like Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `function read(RegExp) { try { return /a/y.test('a'); } catch (error) { return error.name; } } globalThis.__result = read(null);`,
      filename: 'input.js',
      plugins: [stickyRegex],
      noxcturnal: { transforms: { regexpSticky: true } },
      output: { mustNotMatch: [/\/a\/y/] },
    }),
  ).resolves.toEqual('TypeError');
});

test('named backreference adjacent to a digit shares Babel numeric-token rewriting', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`globalThis.__result = [/^(?<x>a)\k<x>2$/.test('aa2'), /^(?<x>a)\k<x>2$/.test('a\n')];`,
      filename: 'input.js',
      plugins: [namedGroups],
      noxcturnal: { transforms: { regexpNamedCaptureGroups: true }, helpers: { mode: 'inline' } },
      output: { mustNotMatch: [/\(\?<x>/, /\\k<x>/] },
    }),
  ).resolves.toEqual([false, true]);
});
