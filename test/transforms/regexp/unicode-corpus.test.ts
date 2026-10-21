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
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'basic /u flag semantics > /u flag regex matches ASCII text',
    source: `() => {
        const re = /hello/u;
        expect(re.test('hello')).toBe(true);
        expect(re.test('world')).toBe(false);
      }`,
    output: `() => {
  const re = /hello/;
  expect(re.test('hello')).toBe(true);
  expect(re.test('world')).toBe(false);
};`,
  },
  {
    title: 'basic /u flag semantics > /u flag regex works with exec()',
    source: `() => {
        const re = /(\\w+)/u;
        const match = re.exec('hello');
        expect(match[0]).toBe('hello');
        expect(match[1]).toBe('hello');
      }`,
    output: `() => {
  const re = /(\\w+)/;
  const match = re.exec('hello');
  expect(match[0]).toBe('hello');
  expect(match[1]).toBe('hello');
};`,
  },
  {
    title: 'basic /u flag semantics > /u flag regex works with match()',
    source: `() => {
        const match = 'hello world'.match(/(\\w+)/u);
        expect(match[0]).toBe('hello');
        expect(match[1]).toBe('hello');
      }`,
    output: `() => {
  const match = 'hello world'.match(/(\\w+)/);
  expect(match[0]).toBe('hello');
  expect(match[1]).toBe('hello');
};`,
  },
  {
    title: 'basic /u flag semantics > /u flag regex works with global search',
    source: `() => {
        const re = /\\w+/gu;
        const matches = 'hello world'.match(re);
        expect(matches.length).toBe(2);
        expect(matches[0]).toBe('hello');
        expect(matches[1]).toBe('world');
      }`,
    output: `() => {
  const re = /\\w+/g;
  const matches = 'hello world'.match(re);
  expect(matches.length).toBe(2);
  expect(matches[0]).toBe('hello');
  expect(matches[1]).toBe('world');
};`,
  },
  {
    title: 'basic /u flag semantics > /u flag regex works with test()',
    source: `() => {
        expect(/^\\d+$/u.test('12345')).toBe(true);
        expect(/^\\d+$/u.test('123a5')).toBe(false);
      }`,
    output: `() => {
  expect(/^\\d+$/.test('12345')).toBe(true);
  expect(/^\\d+$/.test('123a5')).toBe(false);
};`,
  },
  {
    title: 'basic /u flag semantics > /u flag regex preserves lastIndex with global flag',
    source: `() => {
        const re = /\\d+/gu;
        const str = 'a1b22c333';
        expect(re.test(str)).toBe(true);
        expect(re.lastIndex).toBe(2);
        expect(re.test(str)).toBe(true);
        expect(re.lastIndex).toBe(5);
      }`,
    output: `() => {
  const re = /\\d+/g;
  const str = 'a1b22c333';
  expect(re.test(str)).toBe(true);
  expect(re.lastIndex).toBe(2);
  expect(re.test(str)).toBe(true);
  expect(re.lastIndex).toBe(5);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches BMP character',
    source: `() => {
        const re = /\\u{0041}/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('B')).toBe(false);
      }`,
    output: `() => {
  const re = /\\u0041/;
  expect(re.test('A')).toBe(true);
  expect(re.test('B')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches multi-digit BMP code point',
    source: `() => {
        const re = /\\u{00E9}/u;
        expect(re.test('\\u00E9')).toBe(true); // é
        expect(re.test('e')).toBe(false);
      }`,
    output: `() => {
  const re = /\\u00E9/;
  expect(re.test('é')).toBe(true);
  expect(re.test('e')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches astral plane character',
    source: `() => {
        const re = /\\u{1F600}/u;
        expect(re.test('\\u{1F600}')).toBe(true); // 😀
        expect(re.test('A')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD83D\\uDE00)/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('A')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} matches musical symbol (astral plane)',
    source: `() => {
        // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)
        const re = /\\u{1D306}/u;
        expect(re.test('\\u{1D306}')).toBe(true);
        expect(re.test('A')).toBe(false);
      }`,
    output: `() => {
  // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)
  const re = /(?:\\uD834\\uDF06)/;
  expect(re.test('𝌆')).toBe(true);
  expect(re.test('A')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} in character class',
    source: `() => {
        const re = /[\\u{1F600}\\u{1F601}\\u{1F602}]/u;
        expect(re.test('\\u{1F600}')).toBe(true); // 😀
        expect(re.test('\\u{1F601}')).toBe(true); // 😁
        expect(re.test('\\u{1F602}')).toBe(true); // 😂
        expect(re.test('\\u{1F603}')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD83D[\\uDE00-\\uDE02])/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('😁')).toBe(true);
  expect(re.test('😂')).toBe(true);
  expect(re.test('😃')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} range in character class',
    source: `() => {
        const re = /[\\u{1F600}-\\u{1F602}]/u;
        expect(re.test('\\u{1F600}')).toBe(true);
        expect(re.test('\\u{1F601}')).toBe(true);
        expect(re.test('\\u{1F602}')).toBe(true);
        expect(re.test('\\u{1F603}')).toBe(false);
        expect(re.test('\\u{1F5FF}')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD83D[\\uDE00-\\uDE02])/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('😁')).toBe(true);
  expect(re.test('😂')).toBe(true);
  expect(re.test('😃')).toBe(false);
  expect(re.test('🗿')).toBe(false);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} with zero-padded code point',
    source: `() => {
        const re = /\\u{00000041}/u;
        expect(re.test('A')).toBe(true);
      }`,
    output: `() => {
  const re = /\\u0041/;
  expect(re.test('A')).toBe(true);
};`,
  },
  {
    title: 'Unicode code point escapes (\\u{XXXXX}) > \\u{} maximum valid code point',
    source: `() => {
        const re = /\\u{10FFFF}/u;
        expect(re.test('\\u{10FFFF}')).toBe(true);
      }`,
    output: `() => {
  const re = /(?:\\uDBFF\\uDFFF)/;
  expect(re.test('􏿿')).toBe(true);
};`,
  },
  {
    title: 'astral plane character matching > astral character literal in pattern',
    source: `() => {
        const re = /𝌆/u;
        expect(re.test('𝌆')).toBe(true);
        expect(re.test('A')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD834\\uDF06)/;
  expect(re.test('𝌆')).toBe(true);
  expect(re.test('A')).toBe(false);
};`,
  },
  {
    title: 'astral plane character matching > emoji literal in pattern',
    source: `() => {
        const re = /😀/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('😁')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD83D\\uDE00)/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('😁')).toBe(false);
};`,
  },
  {
    title:
      'astral plane character matching > astral character is one code point, not two code units',
    source: `() => {
        // Without /u, emoji is two code units (surrogate pair) and . matches one unit
        // With /u, emoji is one code point and . matches the full character
        const re = /^.$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('A')).toBe(true);
      }`,
    output: `() => {
  // Without /u, emoji is two code units (surrogate pair) and . matches one unit
  // With /u, emoji is one code point and . matches the full character
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('A')).toBe(true);
};`,
  },
  {
    title: 'astral plane character matching > without /u, astral character is two code units',
    source: `() => {
        // Without /u, . matches one code unit, so emoji (2 units) needs ..
        const re = /^.$/;
        expect(re.test('😀')).toBe(false); // Two code units, . only matches one
        const re2 = /^..$/;
        expect(re2.test('😀')).toBe(true); // Two code units matched by two dots
      }`,
    output: `() => {
  // Without /u, . matches one code unit, so emoji (2 units) needs ..
  const re = /^.$/;
  expect(re.test('😀')).toBe(false); // Two code units, . only matches one
  const re2 = /^..$/;
  expect(re2.test('😀')).toBe(true); // Two code units matched by two dots
};`,
  },
  {
    title: 'astral plane character matching > string of astral characters matches with /u',
    source: `() => {
        const re = /^.{3}$/u;
        expect(re.test('😀😁😂')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){3}$/;
  expect(re.test('😀😁😂')).toBe(true);
};`,
  },
  {
    title: 'astral plane character matching > astral characters in character class range',
    source: `() => {
        // U+1D306 to U+1D308
        const re = /[\\u{1D306}-\\u{1D308}]/u;
        expect(re.test('\\u{1D306}')).toBe(true);
        expect(re.test('\\u{1D307}')).toBe(true);
        expect(re.test('\\u{1D308}')).toBe(true);
        expect(re.test('\\u{1D305}')).toBe(false);
        expect(re.test('\\u{1D309}')).toBe(false);
      }`,
    output: `() => {
  // U+1D306 to U+1D308
  const re = /(?:\\uD834[\\uDF06-\\uDF08])/;
  expect(re.test('𝌆')).toBe(true);
  expect(re.test('𝌇')).toBe(true);
  expect(re.test('𝌈')).toBe(true);
  expect(re.test('𝌅')).toBe(false);
  expect(re.test('𝌉')).toBe(false);
};`,
  },
  {
    title: 'astral plane character matching > mixed BMP and astral in character class',
    source: `() => {
        const re = /[a-z\\u{1F600}-\\u{1F602}]/u;
        expect(re.test('a')).toBe(true);
        expect(re.test('z')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test('😂')).toBe(true);
        expect(re.test('1')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:[\\u0061-\\u007A]|\\uD83D[\\uDE00-\\uDE02])/;
  expect(re.test('a')).toBe(true);
  expect(re.test('z')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test('😂')).toBe(true);
  expect(re.test('1')).toBe(false);
};`,
  },
  {
    title: 'astral plane character matching > exec returns full code point, not surrogate halves',
    source: `() => {
        const re = /(.)/u;
        const match = re.exec('😀');
        expect(match[0]).toBe('😀');
        expect(match[1]).toBe('😀');
        expect(match[0].length).toBe(2); // Still 2 UTF-16 code units
      }`,
    output: `() => {
  const re =
    /((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/;
  const match = re.exec('😀');
  expect(match[0]).toBe('😀');
  expect(match[1]).toBe('😀');
  expect(match[0].length).toBe(2);
};`,
  },
  {
    title: 'astral plane character matching > quantifier applies to full code point',
    source: `() => {
        const re = /^(.)\\1$/u;
        expect(re.test('😀😀')).toBe(true);
        expect(re.test('😀😁')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))\\1$/;
  expect(re.test('😀😀')).toBe(true);
  expect(re.test('😀😁')).toBe(false);
};`,
  },
  {
    title: 'dot matching with /u > dot matches BMP character with /u',
    source: `() => {
        const re = /^.$/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('\\u00E9')).toBe(true); // é
        expect(re.test('\\u4E16')).toBe(true); // 世
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('A')).toBe(true);
  expect(re.test('é')).toBe(true);
  expect(re.test('世')).toBe(true);
};`,
  },
  {
    title: 'dot matching with /u > dot matches astral plane character with /u',
    source: `() => {
        const re = /^.$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('𝌆')).toBe(true);
        expect(re.test('\\u{1F4A9}')).toBe(true); // 💩
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('𝌆')).toBe(true);
  expect(re.test('💩')).toBe(true);
};`,
  },
  {
    title: 'dot matching with /u > dot does not match newline with /u',
    source: `() => {
        const re = /^.$/u;
        expect(re.test('\\n')).toBe(false);
        expect(re.test('\\r')).toBe(false);
        expect(re.test('\\u2028')).toBe(false); // Line separator
        expect(re.test('\\u2029')).toBe(false); // Paragraph separator
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('\\n')).toBe(false);
  expect(re.test('\\r')).toBe(false);
  expect(re.test('\\u2028')).toBe(false);
  expect(re.test('\\u2029')).toBe(false);
};`,
  },
  {
    title: 'dot matching with /u > dot matches newline with /su',
    source: `() => {
        const re = /^.$/su;
        expect(re.test('\\n')).toBe(true);
        expect(re.test('\\r')).toBe(true);
        expect(re.test('\\u2028')).toBe(true);
        expect(re.test('\\u2029')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/s;
  expect(re.test('\\n')).toBe(true);
  expect(re.test('\\r')).toBe(true);
  expect(re.test('\\u2028')).toBe(true);
  expect(re.test('\\u2029')).toBe(true);
};`,
  },
  {
    title: 'dot matching with /u > dot with /su matches astral characters',
    source: `() => {
        const re = /^.$/su;
        expect(re.test('😀')).toBe(true);
        expect(re.test('A')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/s;
  expect(re.test('😀')).toBe(true);
  expect(re.test('A')).toBe(true);
};`,
  },
  {
    title: 'dot matching with /u > multiple dots match multiple code points',
    source: `() => {
        const re = /^..$/u;
        expect(re.test('AB')).toBe(true);
        expect(re.test('😀😁')).toBe(true);
        expect(re.test('A😀')).toBe(true);
        expect(re.test('ABC')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('AB')).toBe(true);
  expect(re.test('😀😁')).toBe(true);
  expect(re.test('A😀')).toBe(true);
  expect(re.test('ABC')).toBe(false);
};`,
  },
  {
    title: 'dot matching with /u > dot with quantifier counts code points',
    source: `() => {
        const re = /^.{2}$/u;
        expect(re.test('AB')).toBe(true);
        expect(re.test('😀😁')).toBe(true);
        expect(re.test('😀')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){2}$/;
  expect(re.test('AB')).toBe(true);
  expect(re.test('😀😁')).toBe(true);
  expect(re.test('😀')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\d matches digits with /u',
    source: `() => {
        const re = /^\\d+$/u;
        expect(re.test('12345')).toBe(true);
        expect(re.test('abc')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\d+$/;
  expect(re.test('12345')).toBe(true);
  expect(re.test('abc')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\D matches non-digits including astral with /u',
    source: `() => {
        const re = /^\\D$/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test('5')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\D$/;
  expect(re.test('A')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test('5')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\w matches word characters with /u',
    source: `() => {
        const re = /^\\w+$/u;
        expect(re.test('hello_123')).toBe(true);
        expect(re.test('hello world')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\w+$/;
  expect(re.test('hello_123')).toBe(true);
  expect(re.test('hello world')).toBe(false);
};`,
  },
  {
    title:
      'character class escapes with /u > \\W matches non-word characters including astral with /u',
    source: `() => {
        const re = /^\\W$/u;
        expect(re.test('!')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test('a')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\W$/;
  expect(re.test('!')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test('a')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\s matches whitespace with /u',
    source: `() => {
        const re = /^\\s+$/u;
        expect(re.test(' \\t\\n')).toBe(true);
        expect(re.test('\\u00A0')).toBe(true); // non-breaking space
        expect(re.test('a')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\s+$/;
  expect(re.test(' \t\\n')).toBe(true);
  expect(re.test('\\xA0')).toBe(true);
  expect(re.test('a')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\S matches non-whitespace including astral with /u',
    source: `() => {
        const re = /^\\S$/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test(' ')).toBe(false);
      }`,
    output: `() => {
  const re = /^\\S$/;
  expect(re.test('A')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test(' ')).toBe(false);
};`,
  },
  {
    title: 'character class escapes with /u > \\b word boundary works with /u',
    source: `() => {
        const re = /\\bhello\\b/u;
        expect(re.test('hello world')).toBe(true);
        expect(re.test('helloworld')).toBe(false);
      }`,
    output: `() => {
  const re = /\\bhello\\b/;
  expect(re.test('hello world')).toBe(true);
  expect(re.test('helloworld')).toBe(false);
};`,
  },
  {
    title: 'negated character classes with /u > negated class [^...] with BMP characters',
    source: `() => {
        const re = /^[^abc]$/u;
        expect(re.test('d')).toBe(true);
        expect(re.test('a')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0060\\u0064-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('d')).toBe(true);
  expect(re.test('a')).toBe(false);
};`,
  },
  {
    title: 'negated character classes with /u > negated class matches astral characters',
    source: `() => {
        const re = /^[^abc]$/u;
        expect(re.test('😀')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0060\\u0064-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('😀')).toBe(true);
};`,
  },
  {
    title: 'negated character classes with /u > negated class with astral character',
    source: `() => {
        const re = /^[^\\u{1F600}]$/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('😁')).toBe(true);
        expect(re.test('😀')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uD83C][\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDDFF]|\\uD83D[\\uDE01-\\uDFFF]|[\\uD83E-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('A')).toBe(true);
  expect(re.test('😁')).toBe(true);
  expect(re.test('😀')).toBe(false);
};`,
  },
  {
    title: 'negated character classes with /u > negated class excludes full code point',
    source: `() => {
        // Without /u, [^\\u{1F600}] would exclude the individual surrogate halves
        // With /u, it excludes the whole code point
        const re = /^[^\\u{1F600}]+$/u;
        expect(re.test('hello')).toBe(true);
        expect(re.test('😁😂')).toBe(true);
        expect(re.test('😀')).toBe(false);
      }`,
    output: `() => {
  // Without /u, [^\\u{1F600}] would exclude the individual surrogate halves
  // With /u, it excludes the whole code point
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uD83C][\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDDFF]|\\uD83D[\\uDE01-\\uDFFF]|[\\uD83E-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])+$/;
  expect(re.test('hello')).toBe(true);
  expect(re.test('😁😂')).toBe(true);
  expect(re.test('😀')).toBe(false);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > basic ASCII case insensitive',
    source: `() => {
        const re = /^[a-z]+$/iu;
        expect(re.test('hello')).toBe(true);
        expect(re.test('HELLO')).toBe(true);
        expect(re.test('Hello')).toBe(true);
      }`,
    output: `() => {
  const re = /^[a-z\\u017F\\u212A]+$/i;
  expect(re.test('hello')).toBe(true);
  expect(re.test('HELLO')).toBe(true);
  expect(re.test('Hello')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > Unicode case equivalence: K (U+212A) matches k',
    source: `() => {
        // U+212A is KELVIN SIGN, which case-folds to 'k'
        const re = /k/iu;
        expect(re.test('k')).toBe(true);
        expect(re.test('K')).toBe(true);
        expect(re.test('\\u212A')).toBe(true); // Kelvin sign
      }`,
    output: `() => {
  // U+212A is KELVIN SIGN, which case-folds to 'k'
  const re = /[k\\u212A]/i;
  expect(re.test('k')).toBe(true);
  expect(re.test('K')).toBe(true);
  expect(re.test('K')).toBe(true);
};`,
  },
  {
    title:
      'case-insensitive with /u (ui flags) > Unicode case equivalence: long s (U+017F) matches s',
    source: `() => {
        // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'
        const re = /s/iu;
        expect(re.test('s')).toBe(true);
        expect(re.test('S')).toBe(true);
        expect(re.test('\\u017F')).toBe(true); // ſ (long s)
      }`,
    output: `() => {
  // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'
  const re = /[s\\u017F]/i;
  expect(re.test('s')).toBe(true);
  expect(re.test('S')).toBe(true);
  expect(re.test('ſ')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > case insensitive match for accented characters',
    source: `() => {
        const re = /é/iu;
        expect(re.test('\\u00E9')).toBe(true); // é
        expect(re.test('\\u00C9')).toBe(true); // É
      }`,
    output: `() => {
  const re = /é/i;
  expect(re.test('é')).toBe(true);
  expect(re.test('É')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > case insensitive with character class range',
    source: `() => {
        const re = /^[a-z]$/iu;
        expect(re.test('A')).toBe(true);
        expect(re.test('z')).toBe(true);
        expect(re.test('Z')).toBe(true);
        // Long s and Kelvin sign are case equivalents of s and k
        expect(re.test('\\u017F')).toBe(true); // ſ
        expect(re.test('\\u212A')).toBe(true); // K (Kelvin)
      }`,
    output: `() => {
  const re = /^[a-z\\u017F\\u212A]$/i;
  expect(re.test('A')).toBe(true);
  expect(re.test('z')).toBe(true);
  expect(re.test('Z')).toBe(true);
  // Long s and Kelvin sign are case equivalents of s and k
  expect(re.test('ſ')).toBe(true);
  expect(re.test('K')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > case insensitive with astral characters',
    source: `() => {
        // Most astral characters don't have case variants
        // But the flag combination should still work
        const re = /\\u{1F600}/iu;
        expect(re.test('\\u{1F600}')).toBe(true);
      }`,
    output: `() => {
  // Most astral characters don't have case variants
  // But the flag combination should still work
  const re = /(?:\\uD83D\\uDE00)/i;
  expect(re.test('😀')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > Greek case insensitive',
    source: `() => {
        const re = /α/iu;
        expect(re.test('α')).toBe(true); // lowercase alpha
        expect(re.test('Α')).toBe(true); // uppercase Alpha
      }`,
    output: `() => {
  const re = /α/i;
  expect(re.test('α')).toBe(true);
  expect(re.test('Α')).toBe(true);
};`,
  },
  {
    title: 'case-insensitive with /u (ui flags) > Cyrillic case insensitive',
    source: `() => {
        const re = /б/iu;
        expect(re.test('б')).toBe(true); // lowercase
        expect(re.test('Б')).toBe(true); // uppercase
      }`,
    output: `() => {
  const re = /б/i;
  expect(re.test('б')).toBe(true);
  expect(re.test('Б')).toBe(true);
};`,
  },
  {
    title: 'surrogate pair handling > /u treats surrogate pair as single code point',
    source: `() => {
        // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00
        const str = '\\uD83D\\uDE00';
        const re = /^.$/u;
        expect(re.test(str)).toBe(true); // One code point
      }`,
    output: `() => {
  // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00
  const str = '😀';
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test(str)).toBe(true);
};`,
  },
  {
    title: 'surrogate pair handling > without /u, surrogate pair is two code units',
    source: `() => {
        const str = '\\uD83D\\uDE00';
        const re = /^..$/;
        expect(re.test(str)).toBe(true); // Two code units
      }`,
    output: `() => {
  const str = '\\uD83D\\uDE00';
  const re = /^..$/;
  expect(re.test(str)).toBe(true); // Two code units
};`,
  },
  {
    title: 'surrogate pair handling > lone high surrogate does not match . with /u',
    source: `() => {
        // A lone high surrogate is not a valid code point sequence
        const re = /^.$/u;
        expect(re.test('\\uD83D')).toBe(true);
      }`,
    output: `() => {
  // A lone high surrogate is not a valid code point sequence
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('\\ud83d')).toBe(true);
};`,
  },
  {
    title: 'surrogate pair handling > astral range boundary correctness',
    source: `() => {
        // U+10000 is the first astral code point
        const re = /\\u{10000}/u;
        expect(re.test('\\u{10000}')).toBe(true);
        expect(re.test('\\uFFFF')).toBe(false);
      }`,
    output: `() => {
  // U+10000 is the first astral code point
  const re = /(?:\\uD800\\uDC00)/;
  expect(re.test('𐀀')).toBe(true);
  expect(re.test('￿')).toBe(false);
};`,
  },
  {
    title: 'surrogate pair handling > consecutive astral characters',
    source: `() => {
        const re = /^(.)(.)$/u;
        const match = re.exec('😀😁');
        expect(match[1]).toBe('😀');
        expect(match[2]).toBe('😁');
      }`,
    output: `() => {
  const re =
    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;
  const match = re.exec('😀😁');
  expect(match[1]).toBe('😀');
  expect(match[2]).toBe('😁');
};`,
  },
  {
    title: 'quantifiers with /u > + quantifier applies to full code point',
    source: `() => {
        const re = /^a+$/u;
        expect(re.test('aaa')).toBe(true);
        expect(re.test('')).toBe(false);
      }`,
    output: `() => {
  const re = /^a+$/;
  expect(re.test('aaa')).toBe(true);
  expect(re.test('')).toBe(false);
};`,
  },
  {
    title: 'quantifiers with /u > * quantifier with astral characters',
    source: `() => {
        const re = /^😀*$/u;
        expect(re.test('')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test('😀😀😀')).toBe(true);
        expect(re.test('😀a')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:\\uD83D\\uDE00)*$/;
  expect(re.test('')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test('😀😀😀')).toBe(true);
  expect(re.test('😀a')).toBe(false);
};`,
  },
  {
    title: 'quantifiers with /u > {n} quantifier counts code points',
    source: `() => {
        const re = /^.{3}$/u;
        expect(re.test('abc')).toBe(true);
        expect(re.test('😀😁😂')).toBe(true);
        expect(re.test('a😀b')).toBe(true);
        expect(re.test('abcd')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){3}$/;
  expect(re.test('abc')).toBe(true);
  expect(re.test('😀😁😂')).toBe(true);
  expect(re.test('a😀b')).toBe(true);
  expect(re.test('abcd')).toBe(false);
};`,
  },
  {
    title: 'quantifiers with /u > {n,m} range quantifier with code points',
    source: `() => {
        const re = /^.{2,4}$/u;
        expect(re.test('ab')).toBe(true);
        expect(re.test('😀😁')).toBe(true);
        expect(re.test('😀😁😂😃')).toBe(true);
        expect(re.test('a')).toBe(false);
        expect(re.test('abcde')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]){2,4}$/;
  expect(re.test('ab')).toBe(true);
  expect(re.test('😀😁')).toBe(true);
  expect(re.test('😀😁😂😃')).toBe(true);
  expect(re.test('a')).toBe(false);
  expect(re.test('abcde')).toBe(false);
};`,
  },
  {
    title: 'quantifiers with /u > ? quantifier on astral character',
    source: `() => {
        const re = /^a😀?b$/u;
        expect(re.test('ab')).toBe(true);
        expect(re.test('a😀b')).toBe(true);
        expect(re.test('a😀😀b')).toBe(false);
      }`,
    output: `() => {
  const re = /^a(?:\\uD83D\\uDE00)?b$/;
  expect(re.test('ab')).toBe(true);
  expect(re.test('a😀b')).toBe(true);
  expect(re.test('a😀😀b')).toBe(false);
};`,
  },
  {
    title: 'capturing groups with /u > capturing group captures full code point',
    source: `() => {
        const re = /^(.)$/u;
        const match = re.exec('😀');
        expect(match[1]).toBe('😀');
      }`,
    output: `() => {
  const re =
    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;
  const match = re.exec('😀');
  expect(match[1]).toBe('😀');
};`,
  },
  {
    title: 'capturing groups with /u > multiple groups with astral characters',
    source: `() => {
        const re = /^(.)(.)(.)$/u;
        const match = re.exec('a😀b');
        expect(match[1]).toBe('a');
        expect(match[2]).toBe('😀');
        expect(match[3]).toBe('b');
      }`,
    output: `() => {
  const re =
    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;
  const match = re.exec('a😀b');
  expect(match[1]).toBe('a');
  expect(match[2]).toBe('😀');
  expect(match[3]).toBe('b');
};`,
  },
  {
    title: 'capturing groups with /u > backreference matches same code point',
    source: `() => {
        const re = /^(.)\\1$/u;
        expect(re.test('aa')).toBe(true);
        expect(re.test('😀😀')).toBe(true);
        expect(re.test('😀😁')).toBe(false);
      }`,
    output: `() => {
  const re =
    /^((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))\\1$/;
  expect(re.test('aa')).toBe(true);
  expect(re.test('😀😀')).toBe(true);
  expect(re.test('😀😁')).toBe(false);
};`,
  },
  {
    title: 'capturing groups with /u > named group with /u',
    source: `() => {
        const re = /(?<emoji>.)/u;
        const match = re.exec('😀');
        expect(match.groups.emoji).toBe('😀');
      }`,
    output: `() => {
  const re =
    /(?<emoji>(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/;
  const match = re.exec('😀');
  expect(match.groups.emoji).toBe('😀');
};`,
  },
  {
    title: 'capturing groups with /u > non-capturing group with /u',
    source: `() => {
        const re = /^(?:.)$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('A')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('A')).toBe(true);
};`,
  },
  {
    title: 'anchors and boundaries with /u > ^ and $ work with astral characters',
    source: `() => {
        const re = /^😀$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('😀😀')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:\\uD83D\\uDE00)$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('😀😀')).toBe(false);
};`,
  },
  {
    title: 'anchors and boundaries with /u > multiline anchors with /u',
    source: `() => {
        const re = /^.$/gmu;
        const matches = 'a\\n😀\\nb'.match(re);
        expect(matches.length).toBe(3);
        expect(matches[0]).toBe('a');
        expect(matches[1]).toBe('😀');
        expect(matches[2]).toBe('b');
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/gm;
  const matches = 'a\\n😀\\nb'.match(re);
  expect(matches.length).toBe(3);
  expect(matches[0]).toBe('a');
  expect(matches[1]).toBe('😀');
  expect(matches[2]).toBe('b');
};`,
  },
  {
    title: 'anchors and boundaries with /u > \\b boundary with /u before astral character',
    source: `() => {
        const re = /\\bword/u;
        expect(re.test('word')).toBe(true);
        expect(re.test('a word')).toBe(true);
      }`,
    output: `() => {
  const re = /\\bword/;
  expect(re.test('word')).toBe(true);
  expect(re.test('a word')).toBe(true);
};`,
  },
  {
    title: 'alternation with /u > alternation between BMP and astral',
    source: `() => {
        const re = /^(?:A|😀)$/u;
        expect(re.test('A')).toBe(true);
        expect(re.test('😀')).toBe(true);
        expect(re.test('B')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:A|(?:\\uD83D\\uDE00))$/;
  expect(re.test('A')).toBe(true);
  expect(re.test('😀')).toBe(true);
  expect(re.test('B')).toBe(false);
};`,
  },
  {
    title: 'alternation with /u > alternation between astral characters',
    source: `() => {
        const re = /^(?:😀|😁|😂)$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('😁')).toBe(true);
        expect(re.test('😂')).toBe(true);
        expect(re.test('😃')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:(?:\\uD83D\\uDE00)|(?:\\uD83D\\uDE01)|(?:\\uD83D\\uDE02))$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('😁')).toBe(true);
  expect(re.test('😂')).toBe(true);
  expect(re.test('😃')).toBe(false);
};`,
  },
  {
    title: 'lookahead and lookbehind with /u > positive lookahead with astral',
    source: `() => {
        const re = /A(?=😀)/u;
        expect(re.test('A😀')).toBe(true);
        expect(re.test('AB')).toBe(false);
      }`,
    output: `() => {
  const re = /A(?=(?:\\uD83D\\uDE00))/;
  expect(re.test('A😀')).toBe(true);
  expect(re.test('AB')).toBe(false);
};`,
  },
  {
    title: 'lookahead and lookbehind with /u > negative lookahead with astral',
    source: `() => {
        const re = /A(?!😀)/u;
        expect(re.test('AB')).toBe(true);
        expect(re.test('A😀')).toBe(false);
      }`,
    output: `() => {
  const re = /A(?!(?:\\uD83D\\uDE00))/;
  expect(re.test('AB')).toBe(true);
  expect(re.test('A😀')).toBe(false);
};`,
  },
  {
    title: 'lookahead and lookbehind with /u > positive lookbehind with astral',
    source: `() => {
        const re = /(?<=😀)B/u;
        expect(re.test('😀B')).toBe(true);
        expect(re.test('AB')).toBe(false);
      }`,
    output: `() => {
  const re = /(?<=(?:\\uD83D\\uDE00))B/;
  expect(re.test('😀B')).toBe(true);
  expect(re.test('AB')).toBe(false);
};`,
  },
  {
    title: 'lookahead and lookbehind with /u > negative lookbehind with astral',
    source: `() => {
        const re = /(?<!😀)B/u;
        expect(re.test('AB')).toBe(true);
        expect(re.test('😀B')).toBe(false);
      }`,
    output: `() => {
  const re = /(?<!(?:\\uD83D\\uDE00))B/;
  expect(re.test('AB')).toBe(true);
  expect(re.test('😀B')).toBe(false);
};`,
  },
  {
    title: 'replace and split with /u > replace astral character',
    source: `() => {
        const result = '😀'.replace(/😀/u, 'smile');
        expect(result).toBe('smile');
      }`,
    output: `() => {
  const result = '😀'.replace(/(?:\\uD83D\\uDE00)/, 'smile');
  expect(result).toBe('smile');
};`,
  },
  {
    title: 'replace and split with /u > global replace of astral characters',
    source: `() => {
        const result = 'a😀b😀c'.replace(/😀/gu, 'X');
        expect(result).toBe('aXbXc');
      }`,
    output: `() => {
  const result = 'a😀b😀c'.replace(/(?:\\uD83D\\uDE00)/g, 'X');
  expect(result).toBe('aXbXc');
};`,
  },
  {
    title: 'replace and split with /u > replace with capture group on astral',
    source: `() => {
        const result = 'a😀b'.replace(/(😀)/u, '[$1]');
        expect(result).toBe('a[😀]b');
      }`,
    output: `() => {
  const result = 'a😀b'.replace(/((?:\\uD83D\\uDE00))/, '[$1]');
  expect(result).toBe('a[😀]b');
};`,
  },
  {
    title: 'replace and split with /u > split on astral character',
    source: `() => {
        const parts = 'a😀b😀c'.split(/😀/u);
        expect(parts).toEqual(['a', 'b', 'c']);
      }`,
    output: `() => {
  const parts = 'a😀b😀c'.split(/(?:\\uD83D\\uDE00)/);
  expect(parts).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'replace and split with /u > replace dot-matched astral character',
    source: `() => {
        const result = 'a😀b'.replace(/(.)/gu, '[$1]');
        expect(result).toBe('[a][😀][b]');
      }`,
    output: `() => {
  const result = 'a😀b'.replace(
    /((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))/g,
    '[$1]',
  );
  expect(result).toBe('[a][😀][b]');
};`,
  },
  {
    title: 'replace and split with /u > search for astral character',
    source: `() => {
        const idx = 'hello😀world'.search(/😀/u);
        expect(idx).toBe(5);
      }`,
    output: `() => {
  const idx = 'hello😀world'.search(/(?:\\uD83D\\uDE00)/);
  expect(idx).toBe(5);
};`,
  },
  {
    title: 'combined flags > /gu global unicode',
    source: `() => {
        const re = /./gu;
        const matches = '😀😁😂'.match(re);
        expect(matches.length).toBe(3);
        expect(matches[0]).toBe('😀');
        expect(matches[1]).toBe('😁');
        expect(matches[2]).toBe('😂');
      }`,
    output: `() => {
  const re =
    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g;
  const matches = '😀😁😂'.match(re);
  expect(matches.length).toBe(3);
  expect(matches[0]).toBe('😀');
  expect(matches[1]).toBe('😁');
  expect(matches[2]).toBe('😂');
};`,
  },
  {
    title: 'combined flags > /giu global case-insensitive unicode',
    source: `() => {
        const re = /[a-z]/giu;
        const matches = 'Hello'.match(re);
        expect(matches.length).toBe(5);
      }`,
    output: `() => {
  const re = /[a-z\\u017F\\u212A]/gi;
  const matches = 'Hello'.match(re);
  expect(matches.length).toBe(5);
};`,
  },
  {
    title: 'combined flags > /mu multiline unicode',
    source: `() => {
        const re = /^.$/mu;
        expect(re.test('😀')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/m;
  expect(re.test('😀')).toBe(true);
};`,
  },
  {
    title: 'combined flags > /siu dotAll case-insensitive unicode',
    source: `() => {
        const re = /^.$/isu;
        expect(re.test('\\n')).toBe(true);
        expect(re.test('😀')).toBe(true);
      }`,
    output: `() => {
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/is;
  expect(re.test('\\n')).toBe(true);
  expect(re.test('😀')).toBe(true);
};`,
  },
  {
    title: 'combined flags > /yu sticky unicode',
    source: `() => {
        const re = /./uy;
        re.lastIndex = 0;
        const match = re.exec('😀A');
        expect(match[0]).toBe('😀');
        expect(re.lastIndex).toBe(2); // 2 code units for the surrogate pair
      }`,
    output: `() => {
  const re =
    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/y;
  re.lastIndex = 0;
  const match = re.exec('😀A');
  expect(match[0]).toBe('😀');
  expect(re.lastIndex).toBe(2);
};`,
  },
  {
    title: 'escapes with /u > \\t \\n \\r work with /u',
    source: `() => {
        expect(/^\\t$/u.test('\\t')).toBe(true);
        expect(/^\\n$/u.test('\\n')).toBe(true);
        expect(/^\\r$/u.test('\\r')).toBe(true);
      }`,
    output: `() => {
  expect(/^\\t$/.test('\t')).toBe(true);
  expect(/^\\n$/.test('\\n')).toBe(true);
  expect(/^\\r$/.test('\\r')).toBe(true);
};`,
  },
  {
    title: 'escapes with /u > \\0 matches null character',
    source: `() => {
        expect(/^\\0$/u.test('\\0')).toBe(true);
      }`,
    output: `() => {
  expect(/^\\0$/.test('\\0')).toBe(true);
};`,
  },
  {
    title: 'escapes with /u > hex escape \\xNN works with /u',
    source: `() => {
        expect(/^\\x41$/u.test('A')).toBe(true);
        expect(/^\\xFF$/u.test('\\xFF')).toBe(true);
      }`,
    output: `() => {
  expect(/^\\x41$/.test('A')).toBe(true);
  expect(/^\\xFF$/.test('ÿ')).toBe(true);
};`,
  },
  {
    title: 'escapes with /u > BMP unicode escape \\uNNNN works with /u',
    source: `() => {
        expect(/^\\u0041$/u.test('A')).toBe(true);
        expect(/^\\u00E9$/u.test('é')).toBe(true);
      }`,
    output: `() => {
  expect(/^\\u0041$/.test('A')).toBe(true);
  expect(/^\\u00E9$/.test('é')).toBe(true);
};`,
  },
  {
    title: 'escapes with /u > escaped special characters with /u',
    source: `() => {
        expect(/^\\.$/u.test('.')).toBe(true);
        expect(/^\\*$/u.test('*')).toBe(true);
        expect(/^\\($/u.test('(')).toBe(true);
        expect(/^\\)$/u.test(')')).toBe(true);
        expect(/^\\[$/u.test('[')).toBe(true);
        expect(/^\\]$/u.test(']')).toBe(true);
      }`,
    output: `() => {
  expect(/^\\.$/.test('.')).toBe(true);
  expect(/^\\*$/.test('*')).toBe(true);
  expect(/^\\($/.test('(')).toBe(true);
  expect(/^\\)$/.test(')')).toBe(true);
  expect(/^\\[$/.test('[')).toBe(true);
  expect(/^\\]$/.test(']')).toBe(true);
};`,
  },
  {
    title: 'edge cases > empty regex with /u',
    source: `() => {
        const re = /(?:)/u;
        expect(re.test('')).toBe(true);
        expect(re.test('a')).toBe(true);
      }`,
    output: `() => {
  const re = /(?:)/;
  expect(re.test('')).toBe(true);
  expect(re.test('a')).toBe(true);
};`,
  },
  {
    title: 'edge cases > empty character class complement matches astral',
    source: `() => {
        // [^] without /u matches any character including newlines
        // With /u we use [\\s\\S] to match any character
        const re = /^[\\s\\S]$/u;
        expect(re.test('😀')).toBe(true);
        expect(re.test('\\n')).toBe(true);
      }`,
    output: `() => {
  // [^] without /u matches any character including newlines
  // With /u we use [\\s\\S] to match any character
  const re =
    /^(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])$/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('\\n')).toBe(true);
};`,
  },
  {
    title: 'edge cases > consecutive astral characters in class',
    source: `() => {
        const re = /^[😀😁😂]+$/u;
        expect(re.test('😀😁😂😀')).toBe(true);
        expect(re.test('😃')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:\\uD83D[\\uDE00-\\uDE02])+$/;
  expect(re.test('😀😁😂😀')).toBe(true);
  expect(re.test('😃')).toBe(false);
};`,
  },
  {
    title: 'edge cases > astral character at string boundaries',
    source: `() => {
        const re = /^😀/u;
        expect(re.test('😀hello')).toBe(true);
        const re2 = /😀$/u;
        expect(re2.test('hello😀')).toBe(true);
      }`,
    output: `() => {
  const re = /^(?:\\uD83D\\uDE00)/;
  expect(re.test('😀hello')).toBe(true);
  const re2 = /(?:\\uD83D\\uDE00)$/;
  expect(re2.test('hello😀')).toBe(true);
};`,
  },
  {
    title: 'edge cases > very long string with astral characters',
    source: `() => {
        const str = '😀'.repeat(1000);
        const re = /^(😀)+$/u;
        expect(re.test(str)).toBe(true);
      }`,
    output: `() => {
  const str = '😀'.repeat(1e3);
  const re = /^((?:\\uD83D\\uDE00))+$/;
  expect(re.test(str)).toBe(true);
};`,
  },
  {
    title: 'edge cases > mixed BMP and astral string',
    source: `() => {
        const re = /^[a-z😀]+$/u;
        expect(re.test('hello😀world')).toBe(true);
        expect(re.test('hello😀world!')).toBe(false);
      }`,
    output: `() => {
  const re = /^(?:[\\u0061-\\u007A]|\\uD83D\\uDE00)+$/;
  expect(re.test('hello😀world')).toBe(true);
  expect(re.test('hello😀world!')).toBe(false);
};`,
  },
  {
    title: 'edge cases > new RegExp with /u flag',
    source: `() => {
        const re = new RegExp('.', 'u');
        const match = re.exec('😀');
        expect(match[0]).toBe('😀');
      }`,
    output: `() => {
  const re = new RegExp('.', 'u');
  const match = re.exec('😀');
  expect(match[0]).toBe('😀');
};`,
  },
  {
    title: 'edge cases > new RegExp with \\u{} escape and /u flag',
    source: `() => {
        const re = new RegExp('\\\\u{1F600}', 'u');
        expect(re.test('😀')).toBe(true);
      }`,
    output: `() => {
  const re = new RegExp('\\\\u{1F600}', 'u');
  expect(re.test('😀')).toBe(true);
};`,
  },
  {
    title: 'edge cases > lastIndex advances by code units, not code points',
    source: `() => {
        const re = /./gu;
        const str = '😀a';
        const m1 = re.exec(str);
        expect(m1[0]).toBe('😀');
        expect(re.lastIndex).toBe(2); // 2 code units
        const m2 = re.exec(str);
        expect(m2[0]).toBe('a');
        expect(re.lastIndex).toBe(3); // 3 code units total
      }`,
    output: `() => {
  const re =
    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g;
  const str = '😀a';
  const m1 = re.exec(str);
  expect(m1[0]).toBe('😀');
  expect(re.lastIndex).toBe(2);
  const m2 = re.exec(str);
  expect(m2[0]).toBe('a');
  expect(re.lastIndex).toBe(3);
};`,
  },
  {
    title: 'practical patterns > match any emoji in range',
    source: `() => {
        const re = /[\\u{1F600}-\\u{1F64F}]/u;
        expect(re.test('😀')).toBe(true); // U+1F600
        expect(re.test('🙏')).toBe(true); // U+1F64F
        expect(re.test('A')).toBe(false);
      }`,
    output: `() => {
  const re = /(?:\\uD83D[\\uDE00-\\uDE4F])/;
  expect(re.test('😀')).toBe(true);
  expect(re.test('🙏')).toBe(true);
  expect(re.test('A')).toBe(false);
};`,
  },
  {
    title: 'practical patterns > extract emoji from text',
    source: `() => {
        const re = /[\\u{1F600}-\\u{1F64F}]/gu;
        const matches = 'Hello 😀 World 😂!'.match(re);
        expect(matches.length).toBe(2);
        expect(matches[0]).toBe('😀');
        expect(matches[1]).toBe('😂');
      }`,
    output: `() => {
  const re = /(?:\\uD83D[\\uDE00-\\uDE4F])/g;
  const matches = 'Hello 😀 World 😂!'.match(re);
  expect(matches.length).toBe(2);
  expect(matches[0]).toBe('😀');
  expect(matches[1]).toBe('😂');
};`,
  },
  {
    title: 'practical patterns > count code points in string',
    source: `() => {
        const re = /./gsu;
        const str = 'a😀b😁c';
        const count = str.match(re).length;
        expect(count).toBe(5); // 5 code points
        expect(str.length).toBe(7); // 7 code units
      }`,
    output: `() => {
  const re =
    /(?:[\\u0000-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/gs;
  const str = 'a😀b😁c';
  const count = str.match(re).length;
  expect(count).toBe(5);
  expect(str.length).toBe(7);
};`,
  },
  {
    title: 'practical patterns > validate hex color with /u',
    source: `() => {
        const re = /^#[0-9a-f]{6}$/iu;
        expect(re.test('#FF8800')).toBe(true);
        expect(re.test('#ff8800')).toBe(true);
        expect(re.test('#GGGGGG')).toBe(false);
      }`,
    output: `() => {
  const re = /^#[0-9a-f]{6}$/i;
  expect(re.test('#FF8800')).toBe(true);
  expect(re.test('#ff8800')).toBe(true);
  expect(re.test('#GGGGGG')).toBe(false);
};`,
  },
  {
    title: 'practical patterns > match CJK characters',
    source: `() => {
        const re = /^[\\u4E00-\\u9FFF]+$/u;
        expect(re.test('你好世界')).toBe(true);
        expect(re.test('hello')).toBe(false);
      }`,
    output: `() => {
  const re = /^[\\u4E00-\\u9FFF]+$/;
  expect(re.test('你好世界')).toBe(true);
  expect(re.test('hello')).toBe(false);
};`,
  },
  {
    title: 'practical patterns > match mathematical symbols (astral plane)',
    source: `() => {
        // U+1D400-U+1D7FF: Mathematical Alphanumeric Symbols
        const re = /[\\u{1D400}-\\u{1D7FF}]/u;
        expect(re.test('\\u{1D400}')).toBe(true); // 𝐀 (Math bold A)
        expect(re.test('\\u{1D7FF}')).toBe(true); // 𝟿 (Math monospace 9)
        expect(re.test('A')).toBe(false);
      }`,
    output: `() => {
  // U+1D400-U+1D7FF: Mathematical Alphanumeric Symbols
  const re = /(?:[\\uD835][\\uDC00-\\uDFFF])/;
  expect(re.test('𝐀')).toBe(true);
  expect(re.test('𝟿')).toBe(true);
  expect(re.test('A')).toBe(false);
};`,
  },
  {
    title: 'practical patterns > split text preserving emoji',
    source: `() => {
        const re = /\\s+/u;
        const parts = 'hello 😀 world'.split(re);
        expect(parts).toEqual(['hello', '😀', 'world']);
      }`,
    output: `() => {
  const re = /\\s+/;
  const parts = 'hello 😀 world'.split(re);
  expect(parts).toEqual(['hello', '😀', 'world']);
};`,
  },
  {
    title: 'practical patterns > replace each code point individually',
    source: `() => {
        const result = 'a😀b'.replace(/./gu, (ch) => \`[\${ch}]\`);
        expect(result).toBe('[a][😀][b]');
      }`,
    output: `() => {
  const result = 'a😀b'.replace(
    /(?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/g,
    ch => \`[\${ch}]\`,
  );
  expect(result).toBe('[a][😀][b]');
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
