import unicodeSetsRegex from '@babel/plugin-transform-unicode-sets-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns Unicode-set range algebra and string properties with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const letters = /^[\p{ASCII}&&\p{Letter}]+$/v;
        const consonants = /^[a-z&&[^aeiou]]+$/v;
        const empty = /[a&&b]/v;
        const keycap = /^\p{Emoji_Keycap_Sequence}$/v;
        const strings = /^[x\q{a|long|mid}]$/v;
        const longest = /[\q{a|long|mid}]/v.exec('long');
        const escaped = /^[\q{\+|a\.}]$/v;
        const unicodeStrings = /^[\q{\u{1F600}|\u0061\x62}]$/v;
        const chainedIntersection = /^[a-z&&[^aeiou]&&[^x-z]]+$/v;
        const chainedSubtraction = /^[a-z--[aeiou]--[x-z]]+$/v;
        globalThis.__result = [
          letters.test('Az'), letters.test('é'), letters.test('7'),
          consonants.test('bcdf'), consonants.test('face'),
          empty.test('a'), keycap.test('1️⃣'), keycap.test('1'),
          strings.test('long'), strings.test('mid'), strings.test('x'), strings.test('lo'),
          longest[0], escaped.test('+'), escaped.test('a.'), escaped.test('aX'),
          unicodeStrings.test('😀'), unicodeStrings.test('ab'), unicodeStrings.test('a'),
          chainedIntersection.test('bcdf'), chainedIntersection.test('xyz'),
          chainedSubtraction.test('bcdf'), chainedSubtraction.test('z'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodeSetsRegex],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpUnicodeSets: true } },
      output: { mustNotMatch: [/\/v\b/, /&&/, /--/] },
    }),
  ).resolves.toEqual([
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    true,
    true,
    true,
    false,
    'long',
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
  ]);
});

test('aligns every Unicode property of strings with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const basic = /^\p{Basic_Emoji}$/v;
        const modifier = /^\p{RGI_Emoji_Modifier_Sequence}$/v;
        const flag = /^\p{RGI_Emoji_Flag_Sequence}$/v;
        const tag = /^\p{RGI_Emoji_Tag_Sequence}$/v;
        const zwj = /^\p{RGI_Emoji_ZWJ_Sequence}$/v;
        const rgi = /^\p{RGI_Emoji}$/v;
        const bracketed = /^[\p{RGI_Emoji}]$/v;
        const mixed = /^[x\p{RGI_Emoji}]$/v;
        const england = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
        globalThis.__result = [
          basic.test('😀'), basic.test('A'),
          modifier.test('👍🏽'), modifier.test('👍'),
          flag.test('🇬🇧'), flag.test('🇬'),
          tag.test(england), tag.test('🏴'),
          zwj.test('👨‍👩‍👧'), zwj.test('👨'),
          rgi.test('👨‍👩‍👧'), rgi.test('🇬🇧'), rgi.test('A'),
          bracketed.test('👨‍👩‍👧'), bracketed.test('A'),
          mixed.test('x'), mixed.test('🇬🇧'), mixed.test('A'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodeSetsRegex],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpUnicodeSets: true } },
      output: { mustNotMatch: [/\\p\{/u, /\/v/u] },
    }),
  ).resolves.toEqual([
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
  ]);
});

test('aligns Unicode-set string intersection and subtraction with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const intersection = /^[\q{ab|cd}&&\q{cd|ef}]$/v;
        const subtraction = /^[\q{ab|cd}--\q{cd}]$/v;
        const propertyIntersection = /^[\p{Basic_Emoji}&&\q{a|😀}]$/v;
        const propertySubtraction = /^[\p{Basic_Emoji}--\q{😀}]$/v;
        globalThis.__result = [
          intersection.test('cd'), intersection.test('ab'),
          subtraction.test('ab'), subtraction.test('cd'),
          propertyIntersection.test('😀'), propertyIntersection.test('a'),
          propertySubtraction.test('😀'), propertySubtraction.test('©️'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodeSetsRegex],
      noxcturnal: { transforms: { regexpUnicodeSets: true } },
      output: { mustNotMatch: [/\/v\b/, /&&/, /--/] },
    }),
  ).resolves.toEqual([true, false, true, false, true, false, false, true]);
});

test('aligns string alternatives under quantification and case-insensitive set algebra', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const strings = /[\q{ab|a}]+/v;
        const letters = /[A-Z&&[^Q]]/vi;
        globalThis.__result = [
          strings.exec('abab')[0],
          letters.test('q'),
          letters.test('k'),
          letters.test('K'),
        ];
      `,
      filename: 'input.js',
      plugins: [unicodeSetsRegex],
      noxcturnal: { transforms: { regexpUnicodeSets: true } },
      output: { mustNotMatch: [/\/v\b/, /&&/] },
    }),
  ).resolves.toEqual(['abab', false, true, true]);
});
