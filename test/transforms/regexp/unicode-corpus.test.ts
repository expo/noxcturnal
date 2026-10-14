import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    helpers: {
      mode: 'runtime',
      moduleName: '@babel/runtime',
      version: '7.29.7',
    },
    transforms: {
      regexpUnicode: true,
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'basic /u flag semantics > /u flag regex matches ASCII text',
    "() => {\n  const re = /hello/u;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('world')).toBe(false);\n}",
    "() => {\n  const re = /hello/;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('world')).toBe(false);\n};",
  ],
  [
    'basic /u flag semantics > /u flag regex works with exec()',
    "() => {\n  const re = /(\\w+)/u;\n  const match = re.exec('hello');\n  expect(match[0]).toBe('hello');\n  expect(match[1]).toBe('hello');\n}",
    "() => {\n  const re = /(\\w+)/;\n  const match = re.exec('hello');\n  expect(match[0]).toBe('hello');\n  expect(match[1]).toBe('hello');\n};",
  ],
  [
    'basic /u flag semantics > /u flag regex works with match()',
    "() => {\n  const match = 'hello world'.match(/(\\w+)/u);\n  expect(match[0]).toBe('hello');\n  expect(match[1]).toBe('hello');\n}",
    "() => {\n  const match = 'hello world'.match(/(\\w+)/);\n  expect(match[0]).toBe('hello');\n  expect(match[1]).toBe('hello');\n};",
  ],
  [
    'basic /u flag semantics > /u flag regex works with global search',
    "() => {\n  const re = /\\w+/gu;\n  const matches = 'hello world'.match(re);\n  expect(matches.length).toBe(2);\n  expect(matches[0]).toBe('hello');\n  expect(matches[1]).toBe('world');\n}",
    "() => {\n  const re = /\\w+/g;\n  const matches = 'hello world'.match(re);\n  expect(matches.length).toBe(2);\n  expect(matches[0]).toBe('hello');\n  expect(matches[1]).toBe('world');\n};",
  ],
  [
    'basic /u flag semantics > /u flag regex works with test()',
    "() => {\n  expect(/^\\d+$/u.test('12345')).toBe(true);\n  expect(/^\\d+$/u.test('123a5')).toBe(false);\n}",
    "() => {\n  expect(/^\\d+$/.test('12345')).toBe(true);\n  expect(/^\\d+$/.test('123a5')).toBe(false);\n};",
  ],
  [
    'basic /u flag semantics > /u flag regex preserves lastIndex with global flag',
    "() => {\n  const re = /\\d+/gu;\n  const str = 'a1b22c333';\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(2);\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(5);\n}",
    "() => {\n  const re = /\\d+/g;\n  const str = 'a1b22c333';\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(2);\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(5);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches BMP character',
    "() => {\n  const re = /\\u{0041}/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('B')).toBe(false);\n}",
    "() => {\n  const re = /\\u0041/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('B')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches multi-digit BMP code point',
    "() => {\n  const re = /\\u{00E9}/u;\n  expect(re.test('\\u00E9')).toBe(true); // é\n  expect(re.test('e')).toBe(false);\n}",
    "() => {\n  const re = /\\u00E9/;\n  expect(re.test('é')).toBe(true);\n  expect(re.test('e')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches astral plane character',
    "() => {\n  const re = /\\u{1F600}/u;\n  expect(re.test('\\u{1F600}')).toBe(true); // 😀\n  expect(re.test('A')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD83D\\uDE00)/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches musical symbol (astral plane)',
    "() => {\n  // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)\n  const re = /\\u{1D306}/u;\n  expect(re.test('\\u{1D306}')).toBe(true);\n  expect(re.test('A')).toBe(false);\n}",
    "() => {\n  // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)\n  const re = /(?:\\uD834\\uDF06)/;\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('A')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} in character class',
    "() => {\n  const re = /[\\u{1F600}\\u{1F601}\\u{1F602}]/u;\n  expect(re.test('\\u{1F600}')).toBe(true); // 😀\n  expect(re.test('\\u{1F601}')).toBe(true); // 😁\n  expect(re.test('\\u{1F602}')).toBe(true); // 😂\n  expect(re.test('\\u{1F603}')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD83D[\\uDE00-\\uDE02])/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} range in character class',
    "() => {\n  const re = /[\\u{1F600}-\\u{1F602}]/u;\n  expect(re.test('\\u{1F600}')).toBe(true);\n  expect(re.test('\\u{1F601}')).toBe(true);\n  expect(re.test('\\u{1F602}')).toBe(true);\n  expect(re.test('\\u{1F603}')).toBe(false);\n  expect(re.test('\\u{1F5FF}')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD83D[\\uDE00-\\uDE02])/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n  expect(re.test('🗿')).toBe(false);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} with zero-padded code point',
    "() => {\n  const re = /\\u{00000041}/u;\n  expect(re.test('A')).toBe(true);\n}",
    "() => {\n  const re = /\\u0041/;\n  expect(re.test('A')).toBe(true);\n};",
  ],
  [
    'Unicode code point escapes (\\u{XXXXX}) > \\u{} maximum valid code point',
    "() => {\n  const re = /\\u{10FFFF}/u;\n  expect(re.test('\\u{10FFFF}')).toBe(true);\n}",
    "() => {\n  const re = /(?:\\uDBFF\\uDFFF)/;\n  expect(re.test('􏿿')).toBe(true);\n};",
  ],
  [
    'astral plane character matching > astral character literal in pattern',
    "() => {\n  const re = /𝌆/u;\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('A')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD834\\uDF06)/;\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('A')).toBe(false);\n};",
  ],
  [
    'astral plane character matching > emoji literal in pattern',
    "() => {\n  const re = /😀/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD83D\\uDE00)/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(false);\n};",
  ],
  [
    'astral plane character matching > astral character is one code point, not two code units',
    "() => {\n  // Without /u, emoji is two code units (surrogate pair) and . matches one unit\n  // With /u, emoji is one code point and . matches the full character\n  const re = /^.$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n}",
    "() => {\n  // Without /u, emoji is two code units (surrogate pair) and . matches one unit\n  // With /u, emoji is one code point and . matches the full character\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n};",
  ],
  [
    'astral plane character matching > without /u, astral character is two code units',
    "() => {\n  // Without /u, . matches one code unit, so emoji (2 units) needs ..\n  const re = /^.$/;\n  expect(re.test('😀')).toBe(false); // Two code units, . only matches one\n  const re2 = /^..$/;\n  expect(re2.test('😀')).toBe(true); // Two code units matched by two dots\n}",
    "() => {\n  // Without /u, . matches one code unit, so emoji (2 units) needs ..\n  const re = /^.$/;\n  expect(re.test('😀')).toBe(false); // Two code units, . only matches one\n  const re2 = /^..$/;\n  expect(re2.test('😀')).toBe(true); // Two code units matched by two dots\n};",
  ],
  [
    'astral plane character matching > string of astral characters matches with /u',
    "() => {\n  const re = /^.{3}$/u;\n  expect(re.test('😀😁😂')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){3}$/;\n  expect(re.test('😀😁😂')).toBe(true);\n};",
  ],
  [
    'astral plane character matching > astral characters in character class range',
    "() => {\n  // U+1D306 to U+1D308\n  const re = /[\\u{1D306}-\\u{1D308}]/u;\n  expect(re.test('\\u{1D306}')).toBe(true);\n  expect(re.test('\\u{1D307}')).toBe(true);\n  expect(re.test('\\u{1D308}')).toBe(true);\n  expect(re.test('\\u{1D305}')).toBe(false);\n  expect(re.test('\\u{1D309}')).toBe(false);\n}",
    "() => {\n  // U+1D306 to U+1D308\n  const re = /(?:\\uD834[\\uDF06-\\uDF08])/;\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('𝌇')).toBe(true);\n  expect(re.test('𝌈')).toBe(true);\n  expect(re.test('𝌅')).toBe(false);\n  expect(re.test('𝌉')).toBe(false);\n};",
  ],
  [
    'astral plane character matching > mixed BMP and astral in character class',
    "() => {\n  const re = /[a-z\\u{1F600}-\\u{1F602}]/u;\n  expect(re.test('a')).toBe(true);\n  expect(re.test('z')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('1')).toBe(false);\n}",
    "() => {\n  const re = /(?:[\\u0061-\\u007A]|\\uD83D[\\uDE00-\\uDE02])/;\n  expect(re.test('a')).toBe(true);\n  expect(re.test('z')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('1')).toBe(false);\n};",
  ],
  [
    'astral plane character matching > exec returns full code point, not surrogate halves',
    "() => {\n  const re = /(.)/u;\n  const match = re.exec('😀');\n  expect(match[0]).toBe('😀');\n  expect(match[1]).toBe('😀');\n  expect(match[0].length).toBe(2); // Still 2 UTF-16 code units\n}",
    "() => {\n  const re =\n    /((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/;\n  const match = re.exec('😀');\n  expect(match[0]).toBe('😀');\n  expect(match[1]).toBe('😀');\n  expect(match[0].length).toBe(2);\n};",
  ],
  [
    'astral plane character matching > quantifier applies to full code point',
    "() => {\n  const re = /^(.)\\1$/u;\n  expect(re.test('😀😀')).toBe(true);\n  expect(re.test('😀😁')).toBe(false);\n}",
    "() => {\n  const re =\n    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))\\1$/;\n  expect(re.test('😀😀')).toBe(true);\n  expect(re.test('😀😁')).toBe(false);\n};",
  ],
  [
    'dot matching with /u > dot matches BMP character with /u',
    "() => {\n  const re = /^.$/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('\\u00E9')).toBe(true); // é\n  expect(re.test('\\u4E16')).toBe(true); // 世\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('é')).toBe(true);\n  expect(re.test('世')).toBe(true);\n};",
  ],
  [
    'dot matching with /u > dot matches astral plane character with /u',
    "() => {\n  const re = /^.$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('\\u{1F4A9}')).toBe(true); // 💩\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('𝌆')).toBe(true);\n  expect(re.test('💩')).toBe(true);\n};",
  ],
  [
    'dot matching with /u > dot does not match newline with /u',
    "() => {\n  const re = /^.$/u;\n  expect(re.test('\\n')).toBe(false);\n  expect(re.test('\\r')).toBe(false);\n  expect(re.test('\\u2028')).toBe(false); // Line separator\n  expect(re.test('\\u2029')).toBe(false); // Paragraph separator\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('\\n')).toBe(false);\n  expect(re.test('\\r')).toBe(false);\n  expect(re.test('\\u2028')).toBe(false);\n  expect(re.test('\\u2029')).toBe(false);\n};",
  ],
  [
    'dot matching with /u > dot matches newline with /su',
    "() => {\n  const re = /^.$/su;\n  expect(re.test('\\n')).toBe(true);\n  expect(re.test('\\r')).toBe(true);\n  expect(re.test('\\u2028')).toBe(true);\n  expect(re.test('\\u2029')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/s;\n  expect(re.test('\\n')).toBe(true);\n  expect(re.test('\\r')).toBe(true);\n  expect(re.test('\\u2028')).toBe(true);\n  expect(re.test('\\u2029')).toBe(true);\n};",
  ],
  [
    'dot matching with /u > dot with /su matches astral characters',
    "() => {\n  const re = /^.$/su;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/s;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n};",
  ],
  [
    'dot matching with /u > multiple dots match multiple code points',
    "() => {\n  const re = /^..$/u;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('A😀')).toBe(true);\n  expect(re.test('ABC')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('A😀')).toBe(true);\n  expect(re.test('ABC')).toBe(false);\n};",
  ],
  [
    'dot matching with /u > dot with quantifier counts code points',
    "() => {\n  const re = /^.{2}$/u;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){2}$/;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\d matches digits with /u',
    "() => {\n  const re = /^\\d+$/u;\n  expect(re.test('12345')).toBe(true);\n  expect(re.test('abc')).toBe(false);\n}",
    "() => {\n  const re = /^\\d+$/;\n  expect(re.test('12345')).toBe(true);\n  expect(re.test('abc')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\D matches non-digits including astral with /u',
    "() => {\n  const re = /^\\D$/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('5')).toBe(false);\n}",
    "() => {\n  const re = /^\\D$/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('5')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\w matches word characters with /u',
    "() => {\n  const re = /^\\w+$/u;\n  expect(re.test('hello_123')).toBe(true);\n  expect(re.test('hello world')).toBe(false);\n}",
    "() => {\n  const re = /^\\w+$/;\n  expect(re.test('hello_123')).toBe(true);\n  expect(re.test('hello world')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\W matches non-word characters including astral with /u',
    "() => {\n  const re = /^\\W$/u;\n  expect(re.test('!')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('a')).toBe(false);\n}",
    "() => {\n  const re = /^\\W$/;\n  expect(re.test('!')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('a')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\s matches whitespace with /u',
    "() => {\n  const re = /^\\s+$/u;\n  expect(re.test(' \\t\\n')).toBe(true);\n  expect(re.test('\\u00A0')).toBe(true); // non-breaking space\n  expect(re.test('a')).toBe(false);\n}",
    "() => {\n  const re = /^\\s+$/;\n  expect(re.test(' \t\\n')).toBe(true);\n  expect(re.test('\\xA0')).toBe(true);\n  expect(re.test('a')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\S matches non-whitespace including astral with /u',
    "() => {\n  const re = /^\\S$/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test(' ')).toBe(false);\n}",
    "() => {\n  const re = /^\\S$/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test(' ')).toBe(false);\n};",
  ],
  [
    'character class escapes with /u > \\b word boundary works with /u',
    "() => {\n  const re = /\\bhello\\b/u;\n  expect(re.test('hello world')).toBe(true);\n  expect(re.test('helloworld')).toBe(false);\n}",
    "() => {\n  const re = /\\bhello\\b/;\n  expect(re.test('hello world')).toBe(true);\n  expect(re.test('helloworld')).toBe(false);\n};",
  ],
  [
    'negated character classes with /u > negated class [^...] with BMP characters',
    "() => {\n  const re = /^[^abc]$/u;\n  expect(re.test('d')).toBe(true);\n  expect(re.test('a')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0060\\u0064-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('d')).toBe(true);\n  expect(re.test('a')).toBe(false);\n};",
  ],
  [
    'negated character classes with /u > negated class matches astral characters',
    "() => {\n  const re = /^[^abc]$/u;\n  expect(re.test('😀')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0060\\u0064-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('😀')).toBe(true);\n};",
  ],
  [
    'negated character classes with /u > negated class with astral character',
    "() => {\n  const re = /^[^\\u{1F600}]$/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uD83C][\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDDFF]|\\uD83D[\\uDE01-\\uDFFF]|[\\uD83E-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n};",
  ],
  [
    'negated character classes with /u > negated class excludes full code point',
    "() => {\n  // Without /u, [^\\u{1F600}] would exclude the individual surrogate halves\n  // With /u, it excludes the whole code point\n  const re = /^[^\\u{1F600}]+$/u;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('😁😂')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n}",
    "() => {\n  // Without /u, [^\\u{1F600}] would exclude the individual surrogate halves\n  // With /u, it excludes the whole code point\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uD83C][\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDDFF]|\\uD83D[\\uDE01-\\uDFFF]|[\\uD83E-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])+$/;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('😁😂')).toBe(true);\n  expect(re.test('😀')).toBe(false);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > basic ASCII case insensitive',
    "() => {\n  const re = /^[a-z]+$/iu;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('HELLO')).toBe(true);\n  expect(re.test('Hello')).toBe(true);\n}",
    "() => {\n  const re = /^[a-z\\u017F\\u212A]+$/i;\n  expect(re.test('hello')).toBe(true);\n  expect(re.test('HELLO')).toBe(true);\n  expect(re.test('Hello')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > Unicode case equivalence: K (U+212A) matches k',
    "() => {\n  // U+212A is KELVIN SIGN, which case-folds to 'k'\n  const re = /k/iu;\n  expect(re.test('k')).toBe(true);\n  expect(re.test('K')).toBe(true);\n  expect(re.test('\\u212A')).toBe(true); // Kelvin sign\n}",
    "() => {\n  // U+212A is KELVIN SIGN, which case-folds to 'k'\n  const re = /[k\\u212A]/i;\n  expect(re.test('k')).toBe(true);\n  expect(re.test('K')).toBe(true);\n  expect(re.test('K')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > Unicode case equivalence: long s (U+017F) matches s',
    "() => {\n  // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'\n  const re = /s/iu;\n  expect(re.test('s')).toBe(true);\n  expect(re.test('S')).toBe(true);\n  expect(re.test('\\u017F')).toBe(true); // ſ (long s)\n}",
    "() => {\n  // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'\n  const re = /[s\\u017F]/i;\n  expect(re.test('s')).toBe(true);\n  expect(re.test('S')).toBe(true);\n  expect(re.test('ſ')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > case insensitive match for accented characters',
    "() => {\n  const re = /é/iu;\n  expect(re.test('\\u00E9')).toBe(true); // é\n  expect(re.test('\\u00C9')).toBe(true); // É\n}",
    "() => {\n  const re = /é/i;\n  expect(re.test('é')).toBe(true);\n  expect(re.test('É')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > case insensitive with character class range',
    "() => {\n  const re = /^[a-z]$/iu;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('z')).toBe(true);\n  expect(re.test('Z')).toBe(true);\n  // Long s and Kelvin sign are case equivalents of s and k\n  expect(re.test('\\u017F')).toBe(true); // ſ\n  expect(re.test('\\u212A')).toBe(true); // K (Kelvin)\n}",
    "() => {\n  const re = /^[a-z\\u017F\\u212A]$/i;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('z')).toBe(true);\n  expect(re.test('Z')).toBe(true);\n  // Long s and Kelvin sign are case equivalents of s and k\n  expect(re.test('ſ')).toBe(true);\n  expect(re.test('K')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > case insensitive with astral characters',
    "() => {\n  // Most astral characters don't have case variants\n  // But the flag combination should still work\n  const re = /\\u{1F600}/iu;\n  expect(re.test('\\u{1F600}')).toBe(true);\n}",
    "() => {\n  // Most astral characters don't have case variants\n  // But the flag combination should still work\n  const re = /(?:\\uD83D\\uDE00)/i;\n  expect(re.test('😀')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > Greek case insensitive',
    "() => {\n  const re = /α/iu;\n  expect(re.test('α')).toBe(true); // lowercase alpha\n  expect(re.test('Α')).toBe(true); // uppercase Alpha\n}",
    "() => {\n  const re = /α/i;\n  expect(re.test('α')).toBe(true);\n  expect(re.test('Α')).toBe(true);\n};",
  ],
  [
    'case-insensitive with /u (ui flags) > Cyrillic case insensitive',
    "() => {\n  const re = /б/iu;\n  expect(re.test('б')).toBe(true); // lowercase\n  expect(re.test('Б')).toBe(true); // uppercase\n}",
    "() => {\n  const re = /б/i;\n  expect(re.test('б')).toBe(true);\n  expect(re.test('Б')).toBe(true);\n};",
  ],
  [
    'surrogate pair handling > /u treats surrogate pair as single code point',
    "() => {\n  // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00\n  const str = '\\uD83D\\uDE00';\n  const re = /^.$/u;\n  expect(re.test(str)).toBe(true); // One code point\n}",
    "() => {\n  // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00\n  const str = '😀';\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test(str)).toBe(true);\n};",
  ],
  [
    'surrogate pair handling > without /u, surrogate pair is two code units',
    "() => {\n  const str = '\\uD83D\\uDE00';\n  const re = /^..$/;\n  expect(re.test(str)).toBe(true); // Two code units\n}",
    "() => {\n  const str = '\\uD83D\\uDE00';\n  const re = /^..$/;\n  expect(re.test(str)).toBe(true); // Two code units\n};",
  ],
  [
    'surrogate pair handling > lone high surrogate does not match . with /u',
    "() => {\n  // A lone high surrogate is not a valid code point sequence\n  const re = /^.$/u;\n  expect(re.test('\\uD83D')).toBe(true);\n}",
    "() => {\n  // A lone high surrogate is not a valid code point sequence\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('\\ud83d')).toBe(true);\n};",
  ],
  [
    'surrogate pair handling > astral range boundary correctness',
    "() => {\n  // U+10000 is the first astral code point\n  const re = /\\u{10000}/u;\n  expect(re.test('\\u{10000}')).toBe(true);\n  expect(re.test('\\uFFFF')).toBe(false);\n}",
    "() => {\n  // U+10000 is the first astral code point\n  const re = /(?:\\uD800\\uDC00)/;\n  expect(re.test('𐀀')).toBe(true);\n  expect(re.test('￿')).toBe(false);\n};",
  ],
  [
    'surrogate pair handling > consecutive astral characters',
    "() => {\n  const re = /^(.)(.)$/u;\n  const match = re.exec('😀😁');\n  expect(match[1]).toBe('😀');\n  expect(match[2]).toBe('😁');\n}",
    "() => {\n  const re =\n    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;\n  const match = re.exec('😀😁');\n  expect(match[1]).toBe('😀');\n  expect(match[2]).toBe('😁');\n};",
  ],
  [
    'quantifiers with /u > + quantifier applies to full code point',
    "() => {\n  const re = /^a+$/u;\n  expect(re.test('aaa')).toBe(true);\n  expect(re.test('')).toBe(false);\n}",
    "() => {\n  const re = /^a+$/;\n  expect(re.test('aaa')).toBe(true);\n  expect(re.test('')).toBe(false);\n};",
  ],
  [
    'quantifiers with /u > * quantifier with astral characters',
    "() => {\n  const re = /^😀*$/u;\n  expect(re.test('')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😀😀😀')).toBe(true);\n  expect(re.test('😀a')).toBe(false);\n}",
    "() => {\n  const re = /^(?:\\uD83D\\uDE00)*$/;\n  expect(re.test('')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😀😀😀')).toBe(true);\n  expect(re.test('😀a')).toBe(false);\n};",
  ],
  [
    'quantifiers with /u > {n} quantifier counts code points',
    "() => {\n  const re = /^.{3}$/u;\n  expect(re.test('abc')).toBe(true);\n  expect(re.test('😀😁😂')).toBe(true);\n  expect(re.test('a😀b')).toBe(true);\n  expect(re.test('abcd')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){3}$/;\n  expect(re.test('abc')).toBe(true);\n  expect(re.test('😀😁😂')).toBe(true);\n  expect(re.test('a😀b')).toBe(true);\n  expect(re.test('abcd')).toBe(false);\n};",
  ],
  [
    'quantifiers with /u > {n,m} range quantifier with code points',
    "() => {\n  const re = /^.{2,4}$/u;\n  expect(re.test('ab')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('😀😁😂😃')).toBe(true);\n  expect(re.test('a')).toBe(false);\n  expect(re.test('abcde')).toBe(false);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){2,4}$/;\n  expect(re.test('ab')).toBe(true);\n  expect(re.test('😀😁')).toBe(true);\n  expect(re.test('😀😁😂😃')).toBe(true);\n  expect(re.test('a')).toBe(false);\n  expect(re.test('abcde')).toBe(false);\n};",
  ],
  [
    'quantifiers with /u > ? quantifier on astral character',
    "() => {\n  const re = /^a😀?b$/u;\n  expect(re.test('ab')).toBe(true);\n  expect(re.test('a😀b')).toBe(true);\n  expect(re.test('a😀😀b')).toBe(false);\n}",
    "() => {\n  const re = /^a(?:\\uD83D\\uDE00)?b$/;\n  expect(re.test('ab')).toBe(true);\n  expect(re.test('a😀b')).toBe(true);\n  expect(re.test('a😀😀b')).toBe(false);\n};",
  ],
  [
    'capturing groups with /u > capturing group captures full code point',
    "() => {\n  const re = /^(.)$/u;\n  const match = re.exec('😀');\n  expect(match[1]).toBe('😀');\n}",
    "() => {\n  const re =\n    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;\n  const match = re.exec('😀');\n  expect(match[1]).toBe('😀');\n};",
  ],
  [
    'capturing groups with /u > multiple groups with astral characters',
    "() => {\n  const re = /^(.)(.)(.)$/u;\n  const match = re.exec('a😀b');\n  expect(match[1]).toBe('a');\n  expect(match[2]).toBe('😀');\n  expect(match[3]).toBe('b');\n}",
    "() => {\n  const re =\n    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;\n  const match = re.exec('a😀b');\n  expect(match[1]).toBe('a');\n  expect(match[2]).toBe('😀');\n  expect(match[3]).toBe('b');\n};",
  ],
  [
    'capturing groups with /u > backreference matches same code point',
    "() => {\n  const re = /^(.)\\1$/u;\n  expect(re.test('aa')).toBe(true);\n  expect(re.test('😀😀')).toBe(true);\n  expect(re.test('😀😁')).toBe(false);\n}",
    "() => {\n  const re =\n    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))\\1$/;\n  expect(re.test('aa')).toBe(true);\n  expect(re.test('😀😀')).toBe(true);\n  expect(re.test('😀😁')).toBe(false);\n};",
  ],
  [
    'capturing groups with /u > named group with /u',
    "() => {\n  const re = /(?<emoji>.)/u;\n  const match = re.exec('😀');\n  expect(match.groups.emoji).toBe('😀');\n}",
    "() => {\n  const re =\n    /(?<emoji>(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/;\n  const match = re.exec('😀');\n  expect(match.groups.emoji).toBe('😀');\n};",
  ],
  [
    'capturing groups with /u > non-capturing group with /u',
    "() => {\n  const re = /^(?:.)$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('A')).toBe(true);\n};",
  ],
  [
    'anchors and boundaries with /u > ^ and $ work with astral characters',
    "() => {\n  const re = /^😀$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😀😀')).toBe(false);\n}",
    "() => {\n  const re = /^(?:\\uD83D\\uDE00)$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😀😀')).toBe(false);\n};",
  ],
  [
    'anchors and boundaries with /u > multiline anchors with /u',
    "() => {\n  const re = /^.$/gmu;\n  const matches = 'a\\n😀\\nb'.match(re);\n  expect(matches.length).toBe(3);\n  expect(matches[0]).toBe('a');\n  expect(matches[1]).toBe('😀');\n  expect(matches[2]).toBe('b');\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/gm;\n  const matches = 'a\\n😀\\nb'.match(re);\n  expect(matches.length).toBe(3);\n  expect(matches[0]).toBe('a');\n  expect(matches[1]).toBe('😀');\n  expect(matches[2]).toBe('b');\n};",
  ],
  [
    'anchors and boundaries with /u > \\b boundary with /u before astral character',
    "() => {\n  const re = /\\bword/u;\n  expect(re.test('word')).toBe(true);\n  expect(re.test('a word')).toBe(true);\n}",
    "() => {\n  const re = /\\bword/;\n  expect(re.test('word')).toBe(true);\n  expect(re.test('a word')).toBe(true);\n};",
  ],
  [
    'alternation with /u > alternation between BMP and astral',
    "() => {\n  const re = /^(?:A|😀)$/u;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('B')).toBe(false);\n}",
    "() => {\n  const re = /^(?:A|(?:\\uD83D\\uDE00))$/;\n  expect(re.test('A')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('B')).toBe(false);\n};",
  ],
  [
    'alternation with /u > alternation between astral characters',
    "() => {\n  const re = /^(?:😀|😁|😂)$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n}",
    "() => {\n  const re = /^(?:(?:\\uD83D\\uDE00)|(?:\\uD83D\\uDE01)|(?:\\uD83D\\uDE02))$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('😁')).toBe(true);\n  expect(re.test('😂')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n};",
  ],
  [
    'lookahead and lookbehind with /u > positive lookahead with astral',
    "() => {\n  const re = /A(?=😀)/u;\n  expect(re.test('A😀')).toBe(true);\n  expect(re.test('AB')).toBe(false);\n}",
    "() => {\n  const re = /A(?=(?:\\uD83D\\uDE00))/;\n  expect(re.test('A😀')).toBe(true);\n  expect(re.test('AB')).toBe(false);\n};",
  ],
  [
    'lookahead and lookbehind with /u > negative lookahead with astral',
    "() => {\n  const re = /A(?!😀)/u;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('A😀')).toBe(false);\n}",
    "() => {\n  const re = /A(?!(?:\\uD83D\\uDE00))/;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('A😀')).toBe(false);\n};",
  ],
  [
    'lookahead and lookbehind with /u > positive lookbehind with astral',
    "() => {\n  const re = /(?<=😀)B/u;\n  expect(re.test('😀B')).toBe(true);\n  expect(re.test('AB')).toBe(false);\n}",
    "() => {\n  const re = /(?<=(?:\\uD83D\\uDE00))B/;\n  expect(re.test('😀B')).toBe(true);\n  expect(re.test('AB')).toBe(false);\n};",
  ],
  [
    'lookahead and lookbehind with /u > negative lookbehind with astral',
    "() => {\n  const re = /(?<!😀)B/u;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀B')).toBe(false);\n}",
    "() => {\n  const re = /(?<!(?:\\uD83D\\uDE00))B/;\n  expect(re.test('AB')).toBe(true);\n  expect(re.test('😀B')).toBe(false);\n};",
  ],
  [
    'replace and split with /u > replace astral character',
    "() => {\n  const result = '😀'.replace(/😀/u, 'smile');\n  expect(result).toBe('smile');\n}",
    "() => {\n  const result = '😀'.replace(/(?:\\uD83D\\uDE00)/, 'smile');\n  expect(result).toBe('smile');\n};",
  ],
  [
    'replace and split with /u > global replace of astral characters',
    "() => {\n  const result = 'a😀b😀c'.replace(/😀/gu, 'X');\n  expect(result).toBe('aXbXc');\n}",
    "() => {\n  const result = 'a😀b😀c'.replace(/(?:\\uD83D\\uDE00)/g, 'X');\n  expect(result).toBe('aXbXc');\n};",
  ],
  [
    'replace and split with /u > replace with capture group on astral',
    "() => {\n  const result = 'a😀b'.replace(/(😀)/u, '[$1]');\n  expect(result).toBe('a[😀]b');\n}",
    "() => {\n  const result = 'a😀b'.replace(/((?:\\uD83D\\uDE00))/, '[$1]');\n  expect(result).toBe('a[😀]b');\n};",
  ],
  [
    'replace and split with /u > split on astral character',
    "() => {\n  const parts = 'a😀b😀c'.split(/😀/u);\n  expect(parts).toEqual(['a', 'b', 'c']);\n}",
    "() => {\n  const parts = 'a😀b😀c'.split(/(?:\\uD83D\\uDE00)/);\n  expect(parts).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'replace and split with /u > replace dot-matched astral character',
    "() => {\n  const result = 'a😀b'.replace(/(.)/gu, '[$1]');\n  expect(result).toBe('[a][😀][b]');\n}",
    "() => {\n  const result = 'a😀b'.replace(\n    /((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/g,\n    '[$1]',\n  );\n  expect(result).toBe('[a][😀][b]');\n};",
  ],
  [
    'replace and split with /u > search for astral character',
    "() => {\n  const idx = 'hello😀world'.search(/😀/u);\n  expect(idx).toBe(5);\n}",
    "() => {\n  const idx = 'hello😀world'.search(/(?:\\uD83D\\uDE00)/);\n  expect(idx).toBe(5);\n};",
  ],
  [
    'combined flags > /gu global unicode',
    "() => {\n  const re = /./gu;\n  const matches = '😀😁😂'.match(re);\n  expect(matches.length).toBe(3);\n  expect(matches[0]).toBe('😀');\n  expect(matches[1]).toBe('😁');\n  expect(matches[2]).toBe('😂');\n}",
    "() => {\n  const re =\n    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g;\n  const matches = '😀😁😂'.match(re);\n  expect(matches.length).toBe(3);\n  expect(matches[0]).toBe('😀');\n  expect(matches[1]).toBe('😁');\n  expect(matches[2]).toBe('😂');\n};",
  ],
  [
    'combined flags > /giu global case-insensitive unicode',
    "() => {\n  const re = /[a-z]/giu;\n  const matches = 'Hello'.match(re);\n  expect(matches.length).toBe(5);\n}",
    "() => {\n  const re = /[a-z\\u017F\\u212A]/gi;\n  const matches = 'Hello'.match(re);\n  expect(matches.length).toBe(5);\n};",
  ],
  [
    'combined flags > /mu multiline unicode',
    "() => {\n  const re = /^.$/mu;\n  expect(re.test('😀')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/m;\n  expect(re.test('😀')).toBe(true);\n};",
  ],
  [
    'combined flags > /siu dotAll case-insensitive unicode',
    "() => {\n  const re = /^.$/isu;\n  expect(re.test('\\n')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n}",
    "() => {\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/is;\n  expect(re.test('\\n')).toBe(true);\n  expect(re.test('😀')).toBe(true);\n};",
  ],
  [
    'combined flags > /yu sticky unicode',
    "() => {\n  const re = /./uy;\n  re.lastIndex = 0;\n  const match = re.exec('😀A');\n  expect(match[0]).toBe('😀');\n  expect(re.lastIndex).toBe(2); // 2 code units for the surrogate pair\n}",
    "() => {\n  const re =\n    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/y;\n  re.lastIndex = 0;\n  const match = re.exec('😀A');\n  expect(match[0]).toBe('😀');\n  expect(re.lastIndex).toBe(2);\n};",
  ],
  [
    'escapes with /u > \\t \\n \\r work with /u',
    "() => {\n  expect(/^\\t$/u.test('\\t')).toBe(true);\n  expect(/^\\n$/u.test('\\n')).toBe(true);\n  expect(/^\\r$/u.test('\\r')).toBe(true);\n}",
    "() => {\n  expect(/^\\t$/.test('\t')).toBe(true);\n  expect(/^\\n$/.test('\\n')).toBe(true);\n  expect(/^\\r$/.test('\\r')).toBe(true);\n};",
  ],
  [
    'escapes with /u > \\0 matches null character',
    "() => {\n  expect(/^\\0$/u.test('\\0')).toBe(true);\n}",
    "() => {\n  expect(/^\\0$/.test('\\0')).toBe(true);\n};",
  ],
  [
    'escapes with /u > hex escape \\xNN works with /u',
    "() => {\n  expect(/^\\x41$/u.test('A')).toBe(true);\n  expect(/^\\xFF$/u.test('\\xFF')).toBe(true);\n}",
    "() => {\n  expect(/^\\x41$/.test('A')).toBe(true);\n  expect(/^\\xFF$/.test('ÿ')).toBe(true);\n};",
  ],
  [
    'escapes with /u > BMP unicode escape \\uNNNN works with /u',
    "() => {\n  expect(/^\\u0041$/u.test('A')).toBe(true);\n  expect(/^\\u00E9$/u.test('é')).toBe(true);\n}",
    "() => {\n  expect(/^\\u0041$/.test('A')).toBe(true);\n  expect(/^\\u00E9$/.test('é')).toBe(true);\n};",
  ],
  [
    'escapes with /u > escaped special characters with /u',
    "() => {\n  expect(/^\\.$/u.test('.')).toBe(true);\n  expect(/^\\*$/u.test('*')).toBe(true);\n  expect(/^\\($/u.test('(')).toBe(true);\n  expect(/^\\)$/u.test(')')).toBe(true);\n  expect(/^\\[$/u.test('[')).toBe(true);\n  expect(/^\\]$/u.test(']')).toBe(true);\n}",
    "() => {\n  expect(/^\\.$/.test('.')).toBe(true);\n  expect(/^\\*$/.test('*')).toBe(true);\n  expect(/^\\($/.test('(')).toBe(true);\n  expect(/^\\)$/.test(')')).toBe(true);\n  expect(/^\\[$/.test('[')).toBe(true);\n  expect(/^\\]$/.test(']')).toBe(true);\n};",
  ],
  [
    'edge cases > empty regex with /u',
    "() => {\n  const re = /(?:)/u;\n  expect(re.test('')).toBe(true);\n  expect(re.test('a')).toBe(true);\n}",
    "() => {\n  const re = /(?:)/;\n  expect(re.test('')).toBe(true);\n  expect(re.test('a')).toBe(true);\n};",
  ],
  [
    'edge cases > empty character class complement matches astral',
    "() => {\n  // [^] without /u matches any character including newlines\n  // With /u we use [\\s\\S] to match any character\n  const re = /^[\\s\\S]$/u;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('\\n')).toBe(true);\n}",
    "() => {\n  // [^] without /u matches any character including newlines\n  // With /u we use [\\s\\S] to match any character\n  const re =\n    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('\\n')).toBe(true);\n};",
  ],
  [
    'edge cases > consecutive astral characters in class',
    "() => {\n  const re = /^[😀😁😂]+$/u;\n  expect(re.test('😀😁😂😀')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n}",
    "() => {\n  const re = /^(?:\\uD83D[\\uDE00-\\uDE02])+$/;\n  expect(re.test('😀😁😂😀')).toBe(true);\n  expect(re.test('😃')).toBe(false);\n};",
  ],
  [
    'edge cases > astral character at string boundaries',
    "() => {\n  const re = /^😀/u;\n  expect(re.test('😀hello')).toBe(true);\n  const re2 = /😀$/u;\n  expect(re2.test('hello😀')).toBe(true);\n}",
    "() => {\n  const re = /^(?:\\uD83D\\uDE00)/;\n  expect(re.test('😀hello')).toBe(true);\n  const re2 = /(?:\\uD83D\\uDE00)$/;\n  expect(re2.test('hello😀')).toBe(true);\n};",
  ],
  [
    'edge cases > very long string with astral characters',
    "() => {\n  const str = '😀'.repeat(1000);\n  const re = /^(😀)+$/u;\n  expect(re.test(str)).toBe(true);\n}",
    "() => {\n  const str = '😀'.repeat(1e3);\n  const re = /^((?:\\uD83D\\uDE00))+$/;\n  expect(re.test(str)).toBe(true);\n};",
  ],
  [
    'edge cases > mixed BMP and astral string',
    "() => {\n  const re = /^[a-z😀]+$/u;\n  expect(re.test('hello😀world')).toBe(true);\n  expect(re.test('hello😀world!')).toBe(false);\n}",
    "() => {\n  const re = /^(?:[\\u0061-\\u007A]|\\uD83D\\uDE00)+$/;\n  expect(re.test('hello😀world')).toBe(true);\n  expect(re.test('hello😀world!')).toBe(false);\n};",
  ],
  [
    'edge cases > new RegExp with /u flag',
    "() => {\n  const re = new RegExp('.', 'u');\n  const match = re.exec('😀');\n  expect(match[0]).toBe('😀');\n}",
    "() => {\n  const re = new RegExp('.', 'u');\n  const match = re.exec('😀');\n  expect(match[0]).toBe('😀');\n};",
  ],
  [
    'edge cases > new RegExp with \\u{} escape and /u flag',
    "() => {\n  const re = new RegExp('\\\\u{1F600}', 'u');\n  expect(re.test('😀')).toBe(true);\n}",
    "() => {\n  const re = new RegExp('\\\\u{1F600}', 'u');\n  expect(re.test('😀')).toBe(true);\n};",
  ],
  [
    'edge cases > lastIndex advances by code units, not code points',
    "() => {\n  const re = /./gu;\n  const str = '😀a';\n  const m1 = re.exec(str);\n  expect(m1[0]).toBe('😀');\n  expect(re.lastIndex).toBe(2); // 2 code units\n  const m2 = re.exec(str);\n  expect(m2[0]).toBe('a');\n  expect(re.lastIndex).toBe(3); // 3 code units total\n}",
    "() => {\n  const re =\n    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g;\n  const str = '😀a';\n  const m1 = re.exec(str);\n  expect(m1[0]).toBe('😀');\n  expect(re.lastIndex).toBe(2);\n  const m2 = re.exec(str);\n  expect(m2[0]).toBe('a');\n  expect(re.lastIndex).toBe(3);\n};",
  ],
  [
    'practical patterns > match any emoji in range',
    "() => {\n  const re = /[\\u{1F600}-\\u{1F64F}]/u;\n  expect(re.test('😀')).toBe(true); // U+1F600\n  expect(re.test('🙏')).toBe(true); // U+1F64F\n  expect(re.test('A')).toBe(false);\n}",
    "() => {\n  const re = /(?:\\uD83D[\\uDE00-\\uDE4F])/;\n  expect(re.test('😀')).toBe(true);\n  expect(re.test('🙏')).toBe(true);\n  expect(re.test('A')).toBe(false);\n};",
  ],
  [
    'practical patterns > extract emoji from text',
    "() => {\n  const re = /[\\u{1F600}-\\u{1F64F}]/gu;\n  const matches = 'Hello 😀 World 😂!'.match(re);\n  expect(matches.length).toBe(2);\n  expect(matches[0]).toBe('😀');\n  expect(matches[1]).toBe('😂');\n}",
    "() => {\n  const re = /(?:\\uD83D[\\uDE00-\\uDE4F])/g;\n  const matches = 'Hello 😀 World 😂!'.match(re);\n  expect(matches.length).toBe(2);\n  expect(matches[0]).toBe('😀');\n  expect(matches[1]).toBe('😂');\n};",
  ],
  [
    'practical patterns > count code points in string',
    "() => {\n  const re = /./gsu;\n  const str = 'a😀b😁c';\n  const count = str.match(re).length;\n  expect(count).toBe(5); // 5 code points\n  expect(str.length).toBe(7); // 7 code units\n}",
    "() => {\n  const re =\n    /(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/gs;\n  const str = 'a😀b😁c';\n  const count = str.match(re).length;\n  expect(count).toBe(5);\n  expect(str.length).toBe(7);\n};",
  ],
  [
    'practical patterns > validate hex color with /u',
    "() => {\n  const re = /^#[0-9a-f]{6}$/iu;\n  expect(re.test('#FF8800')).toBe(true);\n  expect(re.test('#ff8800')).toBe(true);\n  expect(re.test('#GGGGGG')).toBe(false);\n}",
    "() => {\n  const re = /^#[0-9a-f]{6}$/i;\n  expect(re.test('#FF8800')).toBe(true);\n  expect(re.test('#ff8800')).toBe(true);\n  expect(re.test('#GGGGGG')).toBe(false);\n};",
  ],
  [
    'practical patterns > match CJK characters',
    "() => {\n  const re = /^[\\u4E00-\\u9FFF]+$/u;\n  expect(re.test('你好世界')).toBe(true);\n  expect(re.test('hello')).toBe(false);\n}",
    "() => {\n  const re = /^[\\u4E00-\\u9FFF]+$/;\n  expect(re.test('你好世界')).toBe(true);\n  expect(re.test('hello')).toBe(false);\n};",
  ],
  [
    'practical patterns > match mathematical symbols (astral plane)',
    "() => {\n  // U+1D400-U+1D7FF: Mathematical Alphanumeric Symbols\n  const re = /[\\u{1D400}-\\u{1D7FF}]/u;\n  expect(re.test('\\u{1D400}')).toBe(true); // 𝐀 (Math bold A)\n  expect(re.test('\\u{1D7FF}')).toBe(true); // 𝟿 (Math monospace 9)\n  expect(re.test('A')).toBe(false);\n}",
    "() => {\n  // U+1D400-U+1D7FF: Mathematical Alphanumeric Symbols\n  const re = /(?:[\\uD835][\\uDC00-\\uDFFF])/;\n  expect(re.test('𝐀')).toBe(true);\n  expect(re.test('𝟿')).toBe(true);\n  expect(re.test('A')).toBe(false);\n};",
  ],
  [
    'practical patterns > split text preserving emoji',
    "() => {\n  const re = /\\s+/u;\n  const parts = 'hello 😀 world'.split(re);\n  expect(parts).toEqual(['hello', '😀', 'world']);\n}",
    "() => {\n  const re = /\\s+/;\n  const parts = 'hello 😀 world'.split(re);\n  expect(parts).toEqual(['hello', '😀', 'world']);\n};",
  ],
  [
    'practical patterns > replace each code point individually',
    "() => {\n  const result = 'a😀b'.replace(/./gu, (ch) => `[${ch}]`);\n  expect(result).toBe('[a][😀][b]');\n}",
    "() => {\n  const result = 'a😀b'.replace(\n    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g,\n    ch => `[${ch}]`,\n  );\n  expect(result).toBe('[a][😀][b]');\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
