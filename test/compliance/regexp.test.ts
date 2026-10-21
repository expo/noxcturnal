import { beforeAll, describe, expect, test } from 'vitest';
import type { PreflightTransforms } from '../../js';
import { compile, execute } from './runtime';

function match(regexp: string, transforms: PreflightTransforms, inputs: string[]): unknown[] {
  return execute<{ result: unknown[] }>(
    `
      const expression = ${regexp};
      globalThis.result = ${JSON.stringify(inputs)}.map(input => {
        expression.lastIndex = 0;
        const result = expression.exec(input);
        return result && [result[0], result.index];
      });
    `,
    { transforms },
  ).result;
}

test('selected lookbehind preserves native assertion semantics', () => {
  expect(match('/(?<=(a|bc))d/g', { regexpLookBehind: true }, ['ad', 'bcd', 'xd'])).toEqual([
    ['d', 1],
    ['d', 2],
    null,
  ]);
});

test('selected match indices preserves native capture metadata', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const match = /(?<first>a)(b)?/d.exec('a');
      globalThis.result = [match.indices[0], match.indices[1], match.indices[2], match.indices.groups.first];
    `,
    { transforms: { regexpMatchIndices: true } },
  );
  expect(result.result).toEqual([[0, 1], [0, 1], undefined, [0, 1]]);
});

test('dot-all matches line terminators but not unrelated prefixes', () => {
  expect(match('/^a.b$/s', { regexpDotAll: true }, ['a\nb', 'acb', 'xa\nb'])).toEqual([
    ['a\nb', 0],
    ['acb', 0],
    null,
  ]);
});

test('dot-all covers every line terminator without rewriting literal dots', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const wildcard = /^.$/s;
      const literalDots = /^[.]\\.$/s;
      const unicode = /^.$/su;
      globalThis.result = [
        ['\\n', '\\r', '\\u2028', '\\u2029'].map(value => wildcard.test(value)),
        literalDots.test('..'),
        literalDots.test('a.'),
        unicode.test('😀'),
      ];
    `,
    { transforms: { regexpDotAll: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\/s[;),\]]/);
    },
  );
  expect(result.result).toEqual([[true, true, true, true], true, false, true]);
});

test('sticky expressions only match at lastIndex', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /a/y;
      expression.lastIndex = 1;
      const found = expression.exec('ba');
      expression.lastIndex = 0;
      const missed = expression.exec('ba');
      globalThis.result = [found && found[0], found && found.index, missed];
    `,
    { transforms: { regexpSticky: true } },
  );
  expect(result.result).toEqual(['a', 1, null]);
});

test('sticky expressions preserve combined flags and empty-match lastIndex behavior', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const combined = /a/gy;
      combined.lastIndex = 1;
      const empty = /(?:)/y;
      empty.lastIndex = 1;
      const found = combined.exec('ba');
      const emptyMatch = empty.exec('x');
      globalThis.result = [found[0], combined.lastIndex, emptyMatch.index, empty.lastIndex];
    `,
    { transforms: { regexpSticky: true } },
  );
  expect(result.result).toEqual(['a', 2, 1, 1]);
});

test('Unicode code-point escapes match astral characters as one value', () => {
  expect(match(String.raw`/^\u{1F600}$/u`, { regexpUnicode: true }, ['😀', 'x'])).toEqual([
    ['😀', 0],
    null,
  ]);
});

test('Unicode astral character classes preserve ranges, negation, and quantifiers', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const included = /^[a-z\u{1F600}-\u{1F602}]+$/u;
      const excluded = /^[^\u{1F600}]+$/u;
      globalThis.result = [
        included.test('a😀😂z'),
        included.test('😃'),
        excluded.test('😁😂'),
        excluded.test('😀'),
        excluded.test('\ud83d'),
      ];
    `,
    { transforms: { regexpUnicode: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\\u\{1F600\}/);
      expect(code).not.toMatch(/\/u[;),\]]/);
    },
  );
  expect(result.result).toEqual([true, false, true, false, true]);
});

test('Unicode ignore-case lowering preserves non-ASCII BMP case pairs', () => {
  expect(match('/^[éαб]+$/iu', { regexpUnicode: true }, ['ÉΑБ', 'éαб', 'EAB'])).toEqual([
    ['ÉΑБ', 0],
    ['éαб', 0],
    null,
  ]);
});

test('Unicode ignore-case lowering preserves Unicode-only BMP simple folds', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const kelvin = /^k$/iu;
      const longS = /^[s]$/iu;
      const ohm = /^Ω$/iu;
      const sharpS = /^ß$/iu;
      const angstrom = /^å$/iu;
      const asciiRange = /^[a-z]$/iu;
      const negatedRange = /^[^a-z]$/iu;
      const mixedEndingInFold = /^[0k]$/iu;
      globalThis.result = [
        kelvin.test('K'), longS.test('ſ'), ohm.test('Ω'),
        sharpS.test('ẞ'), angstrom.test('Å'), kelvin.test('x'),
        asciiRange.test('K'), asciiRange.test('ſ'),
        negatedRange.test('K'), negatedRange.test('ſ'), negatedRange.test('1'),
        mixedEndingInFold.test('0'), mixedEndingInFold.test('K'), mixedEndingInFold.test('x'),
      ];
    `,
    { transforms: { regexpUnicode: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*/);
    },
  );
  expect(result.result).toEqual([
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

test('Unicode ignore-case lowering preserves astral atoms and their case folds', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const emoji = /^\u{1F600}$/iu;
      const deseretUpper = /^\u{10400}$/iu;
      const deseretLower = /^\u{10428}$/iu;
      const deseretClass = /^[\u{10400}]$/iu;
      const mixedClass = /^[A\u{10400}]$/iu;
      const rangedClass = /^[\u{10400}-\u{10401}]$/iu;
      const negatedDeseret = /^[^\u{10400}]$/iu;
      globalThis.result = [
        emoji.test('😀'), emoji.test('x'),
        deseretUpper.test('\u{10400}'), deseretUpper.test('\u{10428}'),
        deseretLower.test('\u{10400}'), deseretLower.test('\u{10428}'),
        deseretClass.test('\u{10400}'), deseretClass.test('\u{10428}'),
        mixedClass.test('a'), mixedClass.test('\u{10428}'), mixedClass.test('B'),
        rangedClass.test('\u{10400}'), rangedClass.test('\u{10429}'), rangedClass.test('\u{1042A}'),
        negatedDeseret.test('\u{10400}'), negatedDeseret.test('\u{10428}'),
        negatedDeseret.test('A'), negatedDeseret.test('\ud801'),
      ];
    `,
    { transforms: { regexpUnicode: true } },
  );
  expect(result.result).toEqual([
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
    true,
  ]);
});

test('Unicode property escapes recognize letters across scripts', () => {
  expect(
    match(String.raw`/^\p{Letter}+$/u`, { regexpUnicodePropertyEscapes: true }, [
      'hello',
      'λ',
      '1',
    ]),
  ).toEqual([['hello', 0], ['λ', 0], null]);
});

test('Unicode property escapes recognize every generated Unicode-data fallback', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const unknown = /^\p{Script=Zzzz}$/u;
      const beriaErfe = /^\p{Script_Extensions=Berf}$/u;
      const line = /^\p{Line_Separator}$/u;
      const paragraph = /^\p{Paragraph_Separator}$/u;
      const sidetic = /^\p{Script=Sidetic}$/u;
      const taiYo = /^\p{Script_Extensions=Tai_Yo}$/u;
      const tolongSiki = /^\p{Script=Tolong_Siki}$/u;
      const nfkc = /^\p{Changes_When_NFKC_Casefolded}$/u;
      globalThis.result = [
        unknown.test('\uD800'),
        unknown.test('\uE800'),
        unknown.test('A'),
        beriaErfe.test('\u{16EA0}'),
        beriaErfe.test('\u{16EBA}'),
        beriaErfe.test('\u{16EBB}'),
        line.test('\u2028'), paragraph.test('\u2029'),
        sidetic.test('\u{10940}'), taiYo.test('\u{1E6C0}'),
        tolongSiki.test('\u{11DB0}'), nfkc.test('A'), nfkc.test('a'),
      ];
    `,
    { transforms: { regexpUnicodePropertyEscapes: true } },
  );
  expect(result.result).toEqual([
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
});

test('Unicode property classes support outer negation and ECMAScript set escapes', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const outerNegation = /^[^\p{ASCII}]$/u;
      const nestedComplement = /^[\P{ASCII}]$/u;
      const mixed = /^[\p{Lowercase_Letter}\d\s]$/u;
      const universalUnion = /^[\p{ASCII}\D]$/u;
      globalThis.result = [
        outerNegation.test('é'), outerNegation.test('😀'), outerNegation.test('A'),
        nestedComplement.test('é'), nestedComplement.test('😀'), nestedComplement.test('A'),
        mixed.test('a'), mixed.test('5'), mixed.test('\u2028'), mixed.test('\uFEFF'),
        mixed.test('A'), mixed.test('\u0661'), mixed.test('😀'),
        universalUnion.test('A'), universalUnion.test('\u0661'), universalUnion.test('😀'),
      ];
    `,
    { transforms: { regexpUnicodePropertyEscapes: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\\[pP]\{/u);
    },
  );
  expect(result.result).toEqual([
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
  ]);
});

test('Unicode property complements remain code-point atomic after Unicode-flag removal', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const excludedDeseret = /^[^\p{Script=Deseret}]+$/u;
      const oneNonAscii = /^[^\p{ASCII}]{1}$/u;
      const surrogate = /^\p{Surrogate}$/u;
      globalThis.result = [
        excludedDeseret.test('\u{10400}'), excludedDeseret.test('\u{10428}'),
        excludedDeseret.test('A'), excludedDeseret.test('😀'),
        oneNonAscii.test('é'), oneNonAscii.test('😀'), oneNonAscii.test('ab'),
        surrogate.test('\ud800'), surrogate.test('😀'),
      ];
    `,
    { transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\\[pP]\{/u);
      expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*/);
    },
  );
  expect(result.result).toEqual([false, false, true, true, true, true, false, true, false]);
});

test('Unicode lowering automatically composes property-escape lowering', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const ascii = /^\p{ASCII}+$/u;
      const nonNumber = /^\P{Number}+$/u;
      globalThis.result = [
        ascii.test('abc'), ascii.test('é'),
        nonNumber.test('abc'), nonNumber.test('٣')
      ];
    `,
    { transforms: { regexpUnicode: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\\[pP]\{/u);
      expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*/);
    },
  );
  expect(result.result).toEqual([true, false, true, false]);
});

test('Unicode sets preserve intersection, subtraction, negation, empty sets, and strings', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const letters = /^[\p{ASCII}&&\p{Letter}]+$/v;
      const consonants = /^[a-z&&[^aeiou]]+$/v;
      const greekUpper = /^[\p{Script=Greek}--\p{Lowercase_Letter}]+$/v;
      const empty = /[a&&b]/v;
      const keycap = /^\p{Emoji_Keycap_Sequence}$/v;
      const strings = /^[x\q{a|long|mid}]$/v;
      const chainedIntersection = /^[a-z&&[^aeiou]&&[^x-z]]+$/v;
      const chainedSubtraction = /^[a-z--[aeiou]--[x-z]]+$/v;
      globalThis.result = [
        letters.test('Az'), letters.test('é'), letters.test('7'),
        consonants.test('bcdf'), consonants.test('face'),
        greekUpper.test('Α'), greekUpper.test('α'),
        empty.test('a'), keycap.test('#️⃣'), keycap.test('#'),
        strings.test('long'), strings.test('mid'), strings.test('x'), strings.test('lo'),
        chainedIntersection.test('bcdf'), chainedIntersection.test('xyz'),
        chainedSubtraction.test('bcdf'), chainedSubtraction.test('z'),
      ];
    `,
    { transforms: { regexpUnicodeSets: true } },
  );
  expect(result.result).toEqual([
    true,
    false,
    false,
    true,
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
    true,
    false,
    true,
    false,
  ]);
});

test('Unicode-set string alternatives prefer the longest string and preserve escaped literals', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const longest = /[\q{a|long|mid}]/v.exec('long');
      const escaped = /^[\q{\+|a\.}]$/v;
      const unicode = /^[\q{\u{1F600}|\u0061\x62}]$/v;
      globalThis.result = [
        longest[0], escaped.test('+'), escaped.test('a.'), escaped.test('aX'),
        unicode.test('😀'), unicode.test('ab'), unicode.test('a'),
      ];
    `,
    { transforms: { regexpUnicodeSets: true } },
  );
  expect(result.result).toEqual(['long', true, true, false, true, true, false]);
});

test('Unicode-set algebra operates on strings and string properties', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const intersection = /^[\q{ab|cd}&&\q{cd|ef}]$/v;
      const subtraction = /^[\q{ab|cd}--\q{cd}]$/v;
      const propertyIntersection = /^[\p{Basic_Emoji}&&\q{a|😀}]$/v;
      const propertySubtraction = /^[\p{Basic_Emoji}--\q{😀}]$/v;
      globalThis.result = [
        intersection.test('cd'), intersection.test('ab'),
        subtraction.test('ab'), subtraction.test('cd'),
        propertyIntersection.test('😀'), propertyIntersection.test('a'),
        propertySubtraction.test('😀'), propertySubtraction.test('©️'),
      ];
    `,
    { transforms: { regexpUnicodeSets: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\/v\b/);
      expect(code).not.toMatch(/&&/);
      expect(code).not.toMatch(/--/);
    },
  );
  expect(result.result).toEqual([true, false, true, false, true, false, false, true]);
});

test('Unicode properties of strings match complete canonical emoji sequences', () => {
  const result = execute<{ result: boolean[] }>(
    String.raw`
      const basic = /^\p{Basic_Emoji}$/v;
      const modifier = /^\p{RGI_Emoji_Modifier_Sequence}$/v;
      const flag = /^\p{RGI_Emoji_Flag_Sequence}$/v;
      const tag = /^\p{RGI_Emoji_Tag_Sequence}$/v;
      const zwj = /^\p{RGI_Emoji_ZWJ_Sequence}$/v;
      const rgi = /^\p{RGI_Emoji}$/v;
      const bracketed = /^[\p{RGI_Emoji}]$/v;
      const mixed = /^[x\p{RGI_Emoji}]$/v;
      const england = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
      globalThis.result = [
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
    { transforms: { regexpUnicodeSets: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\\p\{/u);
      expect(code).not.toMatch(/\/v/u);
    },
  );
  expect(result.result).toEqual([
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

test('named capture groups expose groups and preserve backreferences', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /(?<word>[a-z]+)-\\k<word>/;
      const found = expression.exec('test-test');
      globalThis.result = [found && found[0], found && found.groups.word, expression.test('test-other')];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
  );
  expect(result.result).toEqual(['test-test', 'test', false]);
});

test('forward named backreferences resolve against later capture groups', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const match = /\k<word>(?<word>a)/.exec('a');
      globalThis.result = [match[0], match.groups.word];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\(\?<word>/);
      expect(code).not.toMatch(/\\k<word>/);
    },
  );
  expect(result.result).toEqual(['a', 'a']);
});

test('duplicate named groups in disjoint alternatives expose the participating capture', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const expression = /(?:(?<word>a)|(?<word>b))\k<word>/;
      const first = expression.exec('aa');
      const second = expression.exec('bb');
      globalThis.result = [first[0], first.groups.word, second[0], second.groups.word];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\(\?<word>/);
      expect(code).not.toMatch(/\\k<word>/);
    },
  );
  expect(result.result).toEqual(['aa', 'a', 'bb', 'b']);
});

test('named captures work with replacement strings', () => {
  const result = execute<{ result: string }>(
    `globalThis.result = 'first-last'.replace(/(?<first>\\w+)-(?<last>\\w+)/, '$<last>, $<first>');`,
    { transforms: { regexpNamedCaptureGroups: true } },
  );
  expect(result.result).toBe('last, first');
});

test('named captures reach functional replacers and indices groups', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const argumentsSeen = [];
      const replaced = 'ab'.replace(/(?<first>a)(?<optional>z)?/d, function () {
        const args = Array.from(arguments);
        const groups = args.at(-1);
        argumentsSeen.push([
          args[0], args[1], args[2], args[args.length - 3], args[args.length - 2],
          Object.getPrototypeOf(groups) === null, groups.first, groups.optional,
        ]);
        return groups.first.toUpperCase();
      });
      const match = /(?<first>a)(?<optional>z)?/d.exec('ab');
      globalThis.result = [
        replaced,
        argumentsSeen,
        match.indices.groups.first,
        match.indices.groups.optional,
        Object.getPrototypeOf(match.indices.groups) === null,
      ];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
  );
  expect(result.result).toEqual([
    'Ab',
    [['a', 'a', undefined, 0, 'ab', true, 'a', undefined]],
    [0, 1],
    undefined,
    true,
  ]);
});

test('escaped named-group lookalikes remain ordinary regexp text', () => {
  const result = execute<{ result: unknown[] }>(
    String.raw`
      const expression = /no-groups-\(?<looks-like-a-group>looks\)/;
      const found = expression.exec('unrelated');
      globalThis.result = [found, expression.source];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/_wrapRegExp/);
    },
  );
  expect(result.result).toEqual([null, String.raw`no-groups-\(?<looks-like-a-group>looks\)`]);
});

test('global transformed expressions update and reset lastIndex', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /a.b/gs;
      const first = expression.exec('a\\nb a-b');
      const second = expression.exec('a\\nb a-b');
      const missed = expression.exec('a\\nb a-b');
      globalThis.result = [first.index, second.index, missed, expression.lastIndex];
    `,
    { transforms: { regexpDotAll: true } },
  );
  expect(result.result).toEqual([0, 4, null, 0]);
});

test('Unicode matching keeps lone surrogates distinct from astral code points', () => {
  const result = execute<{ result: unknown[] }>(
    `
      globalThis.result = [
        /^.$/u.test('😀'),
        /^.$/u.test('\\ud83d'),
        /^..$/u.test('😀'),
        /^[^\\uD800]$/u.test('😀'),
        /^[^\\uD800]$/u.test('\\ud800'),
        /^[^\\uD800]$/u.test('\\ud801'),
        /^[^\\uD800-\\uDBFF]$/u.test('😀'),
        /^[^\\uD800-\\uDBFF]$/u.test('\\ud83d'),
      ];
    `,
    { transforms: { regexpUnicode: true } },
  );
  expect(result.result).toEqual([true, true, false, true, false, true, true, false]);
});

test('Unicode property escapes support negation and case-insensitive matching', () => {
  expect(
    match(String.raw`/^\P{Number}+$/iu`, { regexpUnicodePropertyEscapes: true }, [
      'Text',
      'λ',
      '2',
    ]),
  ).toEqual([['Text', 0], ['λ', 0], null]);
});

// Compile outside expected failures so only emitted-code behavior satisfies them.
const additionalComplianceCases: {
  name: string;
  source: string;
  plan: import('../../js').PreflightPlan;
  expected: unknown;
  knownFailure: boolean;
}[] = [
  {
    name: 'named regexp groups preserve a capture named __proto__',
    source: `
      const match = /(?<__proto__>a)/.exec('a');
      globalThis.result = [
        match.groups.__proto__,
        Object.getPrototypeOf(match.groups) === null,
      ];
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: ['a', true],
    knownFailure: false,
  },

  {
    name: 'duplicate named quantified backreference',
    source: String.raw`globalThis.result=[/^(?:(?<x>a)|(?<x>b))\k<x>+$/.test('aaa'),/^(?:(?<x>a)|(?<x>b))\k<x>+$/.test('bbb')];`,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: [true, true],
    knownFailure: false,
  },

  {
    name: 'named backreference before digit unicode',
    source: String.raw`globalThis.result=/^(?<x>a)\k<x>2$/u.test('aa2');`,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'named capture dollar replacement absent unmatched',
    source: `globalThis.result='b'.replace(/(?<x>a)?b/,'[$<x>]');`,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: '[]',
    knownFailure: false,
  },
  {
    name: 'named captures null prototype replacement groups',
    source: `globalThis.result='a'.replace(/(?<constructor>a)/, (...args)=>String(Object.getPrototypeOf(args.at(-1))===null)+':'+args.at(-1).constructor);`,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: 'true:a',
    knownFailure: false,
  },
  {
    name: 'named captures preserve backwards matching inside lookbehind',
    source: String.raw`
 const match=/(?<=(?<left>[ab]+)(?<right>[bc]+))$/.exec('abc');
 globalThis.result=[match.groups.left,match.groups.right];
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: ['a', 'bc'],
    knownFailure: false,
  },
  {
    name: 'named captures decode surrogate-pair escapes in names',
    source: String.raw`
 const match=/(?<\uD835\uDC9C>a)/u.exec('a');
 globalThis.result=[Object.keys(match.groups),match.groups['𝒜']];
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: [['𝒜'], 'a'],
    knownFailure: false,
  },
  {
    name: 'named capture groups preserve source declaration order',
    source: String.raw`
 const match=/(?<z>a)(?<a>b)(?<m>c)/.exec('abc');
 globalThis.result=Object.keys(match.groups);
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: ['z', 'a', 'm'],
    knownFailure: false,
  },

  {
    name: 'Unicode ignore-case literals fold Kelvin sign',
    source: String.raw`
 globalThis.result=[/^k$/iu.test('K'),/^K$/iu.test('k')];
    `,
    plan: { transforms: { regexpUnicode: true } },
    expected: [true, true],
    knownFailure: false,
  },
  {
    name: 'Unicode backreferences retain astral capture boundaries',
    source: String.raw`
 const match=/^(.)\1$/u.exec('😀😀');globalThis.result=match&&[match[0],match[1]];
    `,
    plan: { transforms: { regexpUnicode: true } },
    expected: ['😀😀', '😀'],
    knownFailure: false,
  },

  {
    name: 'named replacement strings preserve unknown capture expansion',
    source: `
 globalThis.result='a'.replace(/(?<x>a)/,'$<missing>:$<x>');
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: ':a',
    knownFailure: false,
  },

  {
    name: 'named replacement callback uses groups returned by custom exec',
    source: `
 const pattern=/(?<x>a)/;pattern.exec=function(){const match=['a','positional'];match.index=0;match.input='a';match.groups={x:'custom'};return match;};globalThis.result='a'.replace(pattern,(...args)=>args.at(-1).x);
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: 'custom',
    knownFailure: false,
  },

  {
    name: 'named capture global exec resets lastIndex after failure',
    source: `
 const pattern=/(?<x>a)/g;pattern.lastIndex=1;const match=pattern.exec('ba');const first=pattern.lastIndex;const missing=pattern.exec('ba');globalThis.result=[match.groups.x,first,missing,pattern.lastIndex];
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: ['a', 2, null, 0],
    knownFailure: false,
  },
  {
    name: 'native replacement entry point reads wrapper supplied named groups',
    source: `
 const pattern=/(?<x>a)/;globalThis.result=RegExp.prototype[Symbol.replace].call(pattern,'a','$<x>');
    `,
    plan: { transforms: { regexpNamedCaptureGroups: true } },
    expected: 'a',
    knownFailure: false,
  },
];

describe.each(additionalComplianceCases)('$name', ({ source, plan, expected, knownFailure }) => {
  let code: string;
  beforeAll(() => {
    code = compile(source, plan);
  });

  const run = (input: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', input)(context);
    return context.result;
  };

  const transformedTest = knownFailure ? test.fails : test;
  transformedTest('transformed execution', () => {
    expect(run(code)).toEqual(expected);
  });
});
