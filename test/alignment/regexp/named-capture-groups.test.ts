import namedCaptureGroups from '@babel/plugin-transform-named-capturing-groups-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns named capture groups and backreferences with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const match = /(?<word>a+)\\k<word>/.exec('aaaa'); globalThis.__result = [match[0], match.groups.word];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?<word>/, /\\k<word>/] },
    }),
  ).resolves.toEqual(['aaaa', 'aa']);
});

test('aligns forward named backreferences with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const match = /\k<word>(?<word>a)/.exec('a');
globalThis.__result = [match[0], match.groups.word];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?<word>/, /\\k<word>/] },
    }),
  ).resolves.toEqual(['a', 'a']);
});

test('aligns duplicate named groups in disjoint alternatives with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const expression = /(?:(?<word>a)|(?<word>b))\k<word>/;
const first = expression.exec('aa');
const second = expression.exec('bb');
globalThis.__result = [first[0], first.groups.word, second[0], second.groups.word];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?<word>/, /\\k<word>/] },
    }),
  ).resolves.toEqual(['aa', 'a', 'bb', 'b']);
});

test('aligns escaped named-group lookalikes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const expression = /no-groups-\(?<looks-like-a-group>looks\)/;
const found = expression.exec('unrelated');
globalThis.__result = [found, expression.source];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/_wrapRegExp/] },
    }),
  ).resolves.toEqual([null, String.raw`no-groups-\(?<looks-like-a-group>looks\)`]);
});
