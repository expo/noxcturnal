import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns Unicode regular expressions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^.$/u; globalThis.__result = [expression.test('💩'), expression.test('ab')];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/u[;),\]]/] },
    }),
  ).resolves.toEqual([true, false]);
});

test('aligns Unicode property escape composition with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const ascii = /^\p{ASCII}+$/u;
const nonNumber = /^\P{Number}+$/u;
globalThis.__result = [ascii.test('abc'), ascii.test('é'), nonNumber.test('abc'), nonNumber.test('٣')];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\\[pP]\{/u, /\/[dgimsuvy]*u[dgimsuvy]*/u] },
    }),
  ).resolves.toEqual([true, false, true, false]);
});

test('aligns astral Unicode character classes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const included = /^[a-z\u{1F600}-\u{1F602}]+$/u;
const excluded = /^[^\u{1F600}]+$/u;
globalThis.__result = [included.test('a😀😂z'), included.test('😃'), excluded.test('😁😂'), excluded.test('😀'), excluded.test('\ud83d')];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\\u\{1F600\}/, /\/u[;),\]]/] },
    }),
  ).resolves.toEqual([true, false, true, false, true]);
});

test('aligns negated lone-surrogate classes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`globalThis.__result = [
        /^[^\uD800]$/u.test('😀'),
        /^[^\uD800]$/u.test('\ud800'),
        /^[^\uD800]$/u.test('\ud801'),
        /^[^\uD800-\uDBFF]$/u.test('😀'),
        /^[^\uD800-\uDBFF]$/u.test('\ud83d'),
      ];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/[dgimsuvy]*u[dgimsuvy]*/u] },
    }),
  ).resolves.toEqual([true, false, true, true, false]);
});

test('aligns non-ASCII BMP Unicode ignore-case matching with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const expression = /^[éαб]+$/iu;
globalThis.__result = ['ÉΑБ', 'éαб', 'EAB'].map(value => expression.test(value));`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/iu/] },
    }),
  ).resolves.toEqual([true, true, false]);
});

test('aligns Unicode-only BMP simple folds with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const kelvin = /^k$/iu;
const longS = /^[s]$/iu;
const ohm = /^Ω$/iu;
const sharpS = /^ß$/iu;
const angstrom = /^å$/iu;
const asciiRange = /^[a-z]$/iu;
const negatedRange = /^[^a-z]$/iu;
const mixedEndingInFold = /^[0k]$/iu;
globalThis.__result = [
  kelvin.test('K'), longS.test('ſ'), ohm.test('Ω'),
  sharpS.test('ẞ'), angstrom.test('Å'), kelvin.test('x'),
  asciiRange.test('K'), asciiRange.test('ſ'),
  negatedRange.test('K'), negatedRange.test('ſ'), negatedRange.test('1'),
  mixedEndingInFold.test('0'), mixedEndingInFold.test('K'), mixedEndingInFold.test('x'),
];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/[dgimsuvy]*u[dgimsuvy]*(?:[;,)])/] },
    }),
  ).resolves.toEqual([
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    false,
    true,
    true,
    true,
    false,
  ]);
});

test('aligns astral Unicode ignore-case atoms with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const emoji = /^\u{1F600}$/iu;
const deseretUpper = /^\u{10400}$/iu;
const deseretLower = /^\u{10428}$/iu;
const deseretClass = /^[\u{10400}]$/iu;
const mixedClass = /^[A\u{10400}]$/iu;
const rangedClass = /^[\u{10400}-\u{10401}]$/iu;
const negatedDeseret = /^[^\u{10400}]$/iu;
globalThis.__result = [
  emoji.test('😀'), emoji.test('x'),
  deseretUpper.test('\u{10400}'), deseretUpper.test('\u{10428}'),
  deseretLower.test('\u{10400}'), deseretLower.test('\u{10428}'),
  deseretClass.test('\u{10400}'), deseretClass.test('\u{10428}'),
  mixedClass.test('a'), mixedClass.test('\u{10428}'), mixedClass.test('B'),
  rangedClass.test('\u{10400}'), rangedClass.test('\u{10429}'), rangedClass.test('\u{1042A}'),
  negatedDeseret.test('\u{10400}'), negatedDeseret.test('\u{10428}'),
  negatedDeseret.test('A'),
];`,
      filename: 'input.js',
      plugins: [unicodeRegex],
      noxcturnal: { transforms: { regexpUnicode: true } },
      output: { mustNotMatch: [/\/[dgimsuvy]*u[dgimsuvy]*(?:[;,)])/] },
    }),
  ).resolves.toEqual([
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    true,
  ]);
});
