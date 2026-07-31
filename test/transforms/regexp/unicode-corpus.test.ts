// Generated from apps/test-suite/tests/JSUnicodeRegexes.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Unicode Regexes > basic /u flag semantics > /u flag regex matches ASCII text', async () => {
  const source =
    "() => {\n        const re = /hello/u;\n        expect(re.test('hello')).toBe(true);\n        expect(re.test('world')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /hello/;
      expect(re.test('hello')).toBe(true);
      expect(re.test('world')).toBe(false);
    };"
  `);
});

test('002 JS Unicode Regexes > basic /u flag semantics > /u flag regex works with exec()', async () => {
  const source =
    "() => {\n        const re = /(\\w+)/u;\n        const match = re.exec('hello');\n        expect(match[0]).toBe('hello');\n        expect(match[1]).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(\\w+)/;
      const match = re.exec('hello');
      expect(match[0]).toBe('hello');
      expect(match[1]).toBe('hello');
    };"
  `);
});

test('003 JS Unicode Regexes > basic /u flag semantics > /u flag regex works with match()', async () => {
  const source =
    "() => {\n        const match = 'hello world'.match(/(\\w+)/u);\n        expect(match[0]).toBe('hello');\n        expect(match[1]).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const match = 'hello world'.match(/(\\w+)/);
      expect(match[0]).toBe('hello');
      expect(match[1]).toBe('hello');
    };"
  `);
});

test('004 JS Unicode Regexes > basic /u flag semantics > /u flag regex works with global search', async () => {
  const source =
    "() => {\n        const re = /\\w+/gu;\n        const matches = 'hello world'.match(re);\n        expect(matches.length).toBe(2);\n        expect(matches[0]).toBe('hello');\n        expect(matches[1]).toBe('world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\w+/g;
      const matches = 'hello world'.match(re);
      expect(matches.length).toBe(2);
      expect(matches[0]).toBe('hello');
      expect(matches[1]).toBe('world');
    };"
  `);
});

test('005 JS Unicode Regexes > basic /u flag semantics > /u flag regex works with test()', async () => {
  const source =
    "() => {\n        expect(/^\\d+$/u.test('12345')).toBe(true);\n        expect(/^\\d+$/u.test('123a5')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\d+$/.test('12345')).toBe(true);
      expect(/^\\d+$/.test('123a5')).toBe(false);
    };"
  `);
});

test('006 JS Unicode Regexes > basic /u flag semantics > /u flag regex preserves lastIndex with global flag', async () => {
  const source =
    "() => {\n        const re = /\\d+/gu;\n        const str = 'a1b22c333';\n        expect(re.test(str)).toBe(true);\n        expect(re.lastIndex).toBe(2);\n        expect(re.test(str)).toBe(true);\n        expect(re.lastIndex).toBe(5);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\d+/g;
      const str = 'a1b22c333';
      expect(re.test(str)).toBe(true);
      expect(re.lastIndex).toBe(2);
      expect(re.test(str)).toBe(true);
      expect(re.lastIndex).toBe(5);
    };"
  `);
});

test('007 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} matches BMP character', async () => {
  const source =
    "() => {\n        const re = /\\u{0041}/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('B')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\u0041/;
      expect(re.test('A')).toBe(true);
      expect(re.test('B')).toBe(false);
    };"
  `);
});

test('008 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} matches multi-digit BMP code point', async () => {
  const source =
    "() => {\n        const re = /\\u{00E9}/u;\n        expect(re.test('\\u00E9')).toBe(true); // é\n        expect(re.test('e')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\u00E9/;
      expect(re.test('é')).toBe(true);
      expect(re.test('e')).toBe(false);
    };"
  `);
});

test('009 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} matches astral plane character', async () => {
  const source =
    "() => {\n        const re = /\\u{1F600}/u;\n        expect(re.test('\\u{1F600}')).toBe(true); // 😀\n        expect(re.test('A')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:\\uD83D\\uDE00)/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('A')).toBe(false);
    };"
  `);
});

test('010 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} matches musical symbol (astral plane)', async () => {
  const source =
    "() => {\n        // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)\n        const re = /\\u{1D306}/u;\n        expect(re.test('\\u{1D306}')).toBe(true);\n        expect(re.test('A')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // U+1D306 = TETRAGRAM FOR CENTRE (𝌆)
      const re = /(?:\\uD834\\uDF06)/;
      expect(re.test('𝌆')).toBe(true);
      expect(re.test('A')).toBe(false);
    };"
  `);
});

test('011 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} in character class', async () => {
  const source =
    "() => {\n        const re = /[\\u{1F600}\\u{1F601}\\u{1F602}]/u;\n        expect(re.test('\\u{1F600}')).toBe(true); // 😀\n        expect(re.test('\\u{1F601}')).toBe(true); // 😁\n        expect(re.test('\\u{1F602}')).toBe(true); // 😂\n        expect(re.test('\\u{1F603}')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('012 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} range in character class', async () => {
  const source =
    "() => {\n        const re = /[\\u{1F600}-\\u{1F602}]/u;\n        expect(re.test('\\u{1F600}')).toBe(true);\n        expect(re.test('\\u{1F601}')).toBe(true);\n        expect(re.test('\\u{1F602}')).toBe(true);\n        expect(re.test('\\u{1F603}')).toBe(false);\n        expect(re.test('\\u{1F5FF}')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('013 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} with zero-padded code point', async () => {
  const source =
    "() => {\n        const re = /\\u{00000041}/u;\n        expect(re.test('A')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\u0041/;
      expect(re.test('A')).toBe(true);
    };"
  `);
});

test('014 JS Unicode Regexes > Unicode code point escapes (\\u{XXXXX}) > \\u{} maximum valid code point', async () => {
  const source =
    "() => {\n        const re = /\\u{10FFFF}/u;\n        expect(re.test('\\u{10FFFF}')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:\\uDBFF\\uDFFF)/;
      expect(re.test('􏿿')).toBe(true);
    };"
  `);
});

test('015 JS Unicode Regexes > astral plane character matching > astral character literal in pattern', async () => {
  const source =
    "() => {\n        const re = /𝌆/u;\n        expect(re.test('𝌆')).toBe(true);\n        expect(re.test('A')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:\\uD834\\uDF06)/;
      expect(re.test('𝌆')).toBe(true);
      expect(re.test('A')).toBe(false);
    };"
  `);
});

test('016 JS Unicode Regexes > astral plane character matching > emoji literal in pattern', async () => {
  const source =
    "() => {\n        const re = /😀/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('😁')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:\\uD83D\\uDE00)/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('😁')).toBe(false);
    };"
  `);
});

test('017 JS Unicode Regexes > astral plane character matching > astral character is one code point, not two code units', async () => {
  const source =
    "() => {\n        // Without /u, emoji is two code units (surrogate pair) and . matches one unit\n        // With /u, emoji is one code point and . matches the full character\n        const re = /^.$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('A')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // Without /u, emoji is two code units (surrogate pair) and . matches one unit
      // With /u, emoji is one code point and . matches the full character
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('A')).toBe(true);
    };"
  `);
});

test('018 JS Unicode Regexes > astral plane character matching > without /u, astral character is two code units', async () => {
  const source =
    "() => {\n        // Without /u, . matches one code unit, so emoji (2 units) needs ..\n        const re = /^.$/;\n        expect(re.test('😀')).toBe(false); // Two code units, . only matches one\n        const re2 = /^..$/;\n        expect(re2.test('😀')).toBe(true); // Two code units matched by two dots\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // Without /u, . matches one code unit, so emoji (2 units) needs ..
      const re = /^.$/;
      expect(re.test('😀')).toBe(false); // Two code units, . only matches one
      const re2 = /^..$/;
      expect(re2.test('😀')).toBe(true); // Two code units matched by two dots
    };"
  `);
});

test('019 JS Unicode Regexes > astral plane character matching > string of astral characters matches with /u', async () => {
  const source =
    "() => {\n        const re = /^.{3}$/u;\n        expect(re.test('😀😁😂')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]){3}$/;
      expect(re.test('😀😁😂')).toBe(true);
    };"
  `);
});

test('020 JS Unicode Regexes > astral plane character matching > astral characters in character class range', async () => {
  const source =
    "() => {\n        // U+1D306 to U+1D308\n        const re = /[\\u{1D306}-\\u{1D308}]/u;\n        expect(re.test('\\u{1D306}')).toBe(true);\n        expect(re.test('\\u{1D307}')).toBe(true);\n        expect(re.test('\\u{1D308}')).toBe(true);\n        expect(re.test('\\u{1D305}')).toBe(false);\n        expect(re.test('\\u{1D309}')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('021 JS Unicode Regexes > astral plane character matching > mixed BMP and astral in character class', async () => {
  const source =
    "() => {\n        const re = /[a-z\\u{1F600}-\\u{1F602}]/u;\n        expect(re.test('a')).toBe(true);\n        expect(re.test('z')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('😂')).toBe(true);\n        expect(re.test('1')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('022 JS Unicode Regexes > astral plane character matching > exec returns full code point, not surrogate halves', async () => {
  const source =
    "() => {\n        const re = /(.)/u;\n        const match = re.exec('😀');\n        expect(match[0]).toBe('😀');\n        expect(match[1]).toBe('😀');\n        expect(match[0].length).toBe(2); // Still 2 UTF-16 code units\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))/;
      const match = re.exec('😀');
      expect(match[0]).toBe('😀');
      expect(match[1]).toBe('😀');
      expect(match[0].length).toBe(2);
    };"
  `);
});

test('023 JS Unicode Regexes > astral plane character matching > quantifier applies to full code point', async () => {
  const source =
    "() => {\n        const re = /^(.)\\1$/u;\n        expect(re.test('😀😀')).toBe(true);\n        expect(re.test('😀😁')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))\\1$/;
      expect(re.test('😀😀')).toBe(true);
      expect(re.test('😀😁')).toBe(false);
    };"
  `);
});

test('024 JS Unicode Regexes > dot matching with /u > dot matches BMP character with /u', async () => {
  const source =
    "() => {\n        const re = /^.$/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('\\u00E9')).toBe(true); // é\n        expect(re.test('\\u4E16')).toBe(true); // 世\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('A')).toBe(true);
      expect(re.test('é')).toBe(true);
      expect(re.test('世')).toBe(true);
    };"
  `);
});

test('025 JS Unicode Regexes > dot matching with /u > dot matches astral plane character with /u', async () => {
  const source =
    "() => {\n        const re = /^.$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('𝌆')).toBe(true);\n        expect(re.test('\\u{1F4A9}')).toBe(true); // 💩\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('𝌆')).toBe(true);
      expect(re.test('💩')).toBe(true);
    };"
  `);
});

test('026 JS Unicode Regexes > dot matching with /u > dot does not match newline with /u', async () => {
  const source =
    "() => {\n        const re = /^.$/u;\n        expect(re.test('\\n')).toBe(false);\n        expect(re.test('\\r')).toBe(false);\n        expect(re.test('\\u2028')).toBe(false); // Line separator\n        expect(re.test('\\u2029')).toBe(false); // Paragraph separator\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('\\n')).toBe(false);
      expect(re.test('\\r')).toBe(false);
      expect(re.test('\\u2028')).toBe(false);
      expect(re.test('\\u2029')).toBe(false);
    };"
  `);
});

test('027 JS Unicode Regexes > dot matching with /u > dot matches newline with /su', async () => {
  const source =
    "() => {\n        const re = /^.$/su;\n        expect(re.test('\\n')).toBe(true);\n        expect(re.test('\\r')).toBe(true);\n        expect(re.test('\\u2028')).toBe(true);\n        expect(re.test('\\u2029')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])$/s;
      expect(re.test('\\n')).toBe(true);
      expect(re.test('\\r')).toBe(true);
      expect(re.test('\\u2028')).toBe(true);
      expect(re.test('\\u2029')).toBe(true);
    };"
  `);
});

test('028 JS Unicode Regexes > dot matching with /u > dot with /su matches astral characters', async () => {
  const source =
    "() => {\n        const re = /^.$/su;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('A')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])$/s;
      expect(re.test('😀')).toBe(true);
      expect(re.test('A')).toBe(true);
    };"
  `);
});

test('029 JS Unicode Regexes > dot matching with /u > multiple dots match multiple code points', async () => {
  const source =
    "() => {\n        const re = /^..$/u;\n        expect(re.test('AB')).toBe(true);\n        expect(re.test('😀😁')).toBe(true);\n        expect(re.test('A😀')).toBe(true);\n        expect(re.test('ABC')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('AB')).toBe(true);
      expect(re.test('😀😁')).toBe(true);
      expect(re.test('A😀')).toBe(true);
      expect(re.test('ABC')).toBe(false);
    };"
  `);
});

test('030 JS Unicode Regexes > dot matching with /u > dot with quantifier counts code points', async () => {
  const source =
    "() => {\n        const re = /^.{2}$/u;\n        expect(re.test('AB')).toBe(true);\n        expect(re.test('😀😁')).toBe(true);\n        expect(re.test('😀')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]){2}$/;
      expect(re.test('AB')).toBe(true);
      expect(re.test('😀😁')).toBe(true);
      expect(re.test('😀')).toBe(false);
    };"
  `);
});

test('031 JS Unicode Regexes > character class escapes with /u > \\d matches digits with /u', async () => {
  const source =
    "() => {\n        const re = /^\\d+$/u;\n        expect(re.test('12345')).toBe(true);\n        expect(re.test('abc')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\d+$/;
      expect(re.test('12345')).toBe(true);
      expect(re.test('abc')).toBe(false);
    };"
  `);
});

test('032 JS Unicode Regexes > character class escapes with /u > \\D matches non-digits including astral with /u', async () => {
  const source =
    "() => {\n        const re = /^\\D$/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('5')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\D$/;
      expect(re.test('A')).toBe(true);
      expect(re.test('😀')).toBe(true);
      expect(re.test('5')).toBe(false);
    };"
  `);
});

test('033 JS Unicode Regexes > character class escapes with /u > \\w matches word characters with /u', async () => {
  const source =
    "() => {\n        const re = /^\\w+$/u;\n        expect(re.test('hello_123')).toBe(true);\n        expect(re.test('hello world')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\w+$/;
      expect(re.test('hello_123')).toBe(true);
      expect(re.test('hello world')).toBe(false);
    };"
  `);
});

test('034 JS Unicode Regexes > character class escapes with /u > \\W matches non-word characters including astral with /u', async () => {
  const source =
    "() => {\n        const re = /^\\W$/u;\n        expect(re.test('!')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('a')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\W$/;
      expect(re.test('!')).toBe(true);
      expect(re.test('😀')).toBe(true);
      expect(re.test('a')).toBe(false);
    };"
  `);
});

test('035 JS Unicode Regexes > character class escapes with /u > \\s matches whitespace with /u', async () => {
  const source =
    "() => {\n        const re = /^\\s+$/u;\n        expect(re.test(' \\t\\n')).toBe(true);\n        expect(re.test('\\u00A0')).toBe(true); // non-breaking space\n        expect(re.test('a')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\s+$/;
      expect(re.test(' 	\\n')).toBe(true);
      expect(re.test('\\xA0')).toBe(true);
      expect(re.test('a')).toBe(false);
    };"
  `);
});

test('036 JS Unicode Regexes > character class escapes with /u > \\S matches non-whitespace including astral with /u', async () => {
  const source =
    "() => {\n        const re = /^\\S$/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test(' ')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^\\S$/;
      expect(re.test('A')).toBe(true);
      expect(re.test('😀')).toBe(true);
      expect(re.test(' ')).toBe(false);
    };"
  `);
});

test('037 JS Unicode Regexes > character class escapes with /u > \\b word boundary works with /u', async () => {
  const source =
    "() => {\n        const re = /\\bhello\\b/u;\n        expect(re.test('hello world')).toBe(true);\n        expect(re.test('helloworld')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\bhello\\b/;
      expect(re.test('hello world')).toBe(true);
      expect(re.test('helloworld')).toBe(false);
    };"
  `);
});

test('038 JS Unicode Regexes > negated character classes with /u > negated class [^...] with BMP characters', async () => {
  const source =
    "() => {\n        const re = /^[^abc]$/u;\n        expect(re.test('d')).toBe(true);\n        expect(re.test('a')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^[^abc]$/;
      expect(re.test('d')).toBe(true);
      expect(re.test('a')).toBe(false);
    };"
  `);
});

test('039 JS Unicode Regexes > negated character classes with /u > negated class matches astral characters', async () => {
  const source =
    "() => {\n        const re = /^[^abc]$/u;\n        expect(re.test('😀')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^[^abc]$/;
      expect(re.test('😀')).toBe(true);
    };"
  `);
});

test('040 JS Unicode Regexes > negated character classes with /u > negated class with astral character', async () => {
  const source =
    "() => {\n        const re = /^[^\\u{1F600}]$/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('😁')).toBe(true);\n        expect(re.test('😀')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('041 JS Unicode Regexes > negated character classes with /u > negated class excludes full code point', async () => {
  const source =
    "() => {\n        // Without /u, [^\\u{1F600}] would exclude the individual surrogate halves\n        // With /u, it excludes the whole code point\n        const re = /^[^\\u{1F600}]+$/u;\n        expect(re.test('hello')).toBe(true);\n        expect(re.test('😁😂')).toBe(true);\n        expect(re.test('😀')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('042 JS Unicode Regexes > case-insensitive with /u (ui flags) > basic ASCII case insensitive', async () => {
  const source =
    "() => {\n        const re = /^[a-z]+$/iu;\n        expect(re.test('hello')).toBe(true);\n        expect(re.test('HELLO')).toBe(true);\n        expect(re.test('Hello')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^[a-z]+$/i;
      expect(re.test('hello')).toBe(true);
      expect(re.test('HELLO')).toBe(true);
      expect(re.test('Hello')).toBe(true);
    };"
  `);
});

test('043 JS Unicode Regexes > case-insensitive with /u (ui flags) > Unicode case equivalence: K (U+212A) matches k', async () => {
  const source =
    "() => {\n        // U+212A is KELVIN SIGN, which case-folds to 'k'\n        const re = /k/iu;\n        expect(re.test('k')).toBe(true);\n        expect(re.test('K')).toBe(true);\n        expect(re.test('\\u212A')).toBe(true); // Kelvin sign\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // U+212A is KELVIN SIGN, which case-folds to 'k'
      const re = /k/i;
      expect(re.test('k')).toBe(true);
      expect(re.test('K')).toBe(true);
      expect(re.test('K')).toBe(true);
    };"
  `);
});

test('044 JS Unicode Regexes > case-insensitive with /u (ui flags) > Unicode case equivalence: long s (U+017F) matches s', async () => {
  const source =
    "() => {\n        // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'\n        const re = /s/iu;\n        expect(re.test('s')).toBe(true);\n        expect(re.test('S')).toBe(true);\n        expect(re.test('\\u017F')).toBe(true); // ſ (long s)\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // U+017F is LATIN SMALL LETTER LONG S, which case-folds to 's'
      const re = /s/i;
      expect(re.test('s')).toBe(true);
      expect(re.test('S')).toBe(true);
      expect(re.test('ſ')).toBe(true);
    };"
  `);
});

test('045 JS Unicode Regexes > case-insensitive with /u (ui flags) > case insensitive match for accented characters', async () => {
  const source =
    "() => {\n        const re = /é/iu;\n        expect(re.test('\\u00E9')).toBe(true); // é\n        expect(re.test('\\u00C9')).toBe(true); // É\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(
    `"[bailout] preflight:regexp-unicode-ignore-case-complex-not-implemented"`,
  );
});

test('046 JS Unicode Regexes > case-insensitive with /u (ui flags) > case insensitive with character class range', async () => {
  const source =
    "() => {\n        const re = /^[a-z]$/iu;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('z')).toBe(true);\n        expect(re.test('Z')).toBe(true);\n        // Long s and Kelvin sign are case equivalents of s and k\n        expect(re.test('\\u017F')).toBe(true); // ſ\n        expect(re.test('\\u212A')).toBe(true); // K (Kelvin)\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^[a-z]$/i;
      expect(re.test('A')).toBe(true);
      expect(re.test('z')).toBe(true);
      expect(re.test('Z')).toBe(true);
      // Long s and Kelvin sign are case equivalents of s and k
      expect(re.test('ſ')).toBe(true);
      expect(re.test('K')).toBe(true);
    };"
  `);
});

test('047 JS Unicode Regexes > case-insensitive with /u (ui flags) > case insensitive with astral characters', async () => {
  const source =
    "() => {\n        // Most astral characters don't have case variants\n        // But the flag combination should still work\n        const re = /\\u{1F600}/iu;\n        expect(re.test('\\u{1F600}')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // Most astral characters don't have case variants
      // But the flag combination should still work
      const re = /(?:\\uD83D\\uDE00)/i;
      expect(re.test('😀')).toBe(true);
    };"
  `);
});

test('048 JS Unicode Regexes > case-insensitive with /u (ui flags) > Greek case insensitive', async () => {
  const source =
    "() => {\n        const re = /α/iu;\n        expect(re.test('α')).toBe(true); // lowercase alpha\n        expect(re.test('Α')).toBe(true); // uppercase Alpha\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(
    `"[bailout] preflight:regexp-unicode-ignore-case-complex-not-implemented"`,
  );
});

test('049 JS Unicode Regexes > case-insensitive with /u (ui flags) > Cyrillic case insensitive', async () => {
  const source =
    "() => {\n        const re = /б/iu;\n        expect(re.test('б')).toBe(true); // lowercase\n        expect(re.test('Б')).toBe(true); // uppercase\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(
    `"[bailout] preflight:regexp-unicode-ignore-case-complex-not-implemented"`,
  );
});

test('050 JS Unicode Regexes > surrogate pair handling > /u treats surrogate pair as single code point', async () => {
  const source =
    "() => {\n        // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00\n        const str = '\\uD83D\\uDE00';\n        const re = /^.$/u;\n        expect(re.test(str)).toBe(true); // One code point\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // 😀 is U+1F600, stored as surrogate pair \\uD83D\\uDE00
      const str = '😀';
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test(str)).toBe(true);
    };"
  `);
});

test('051 JS Unicode Regexes > surrogate pair handling > without /u, surrogate pair is two code units', async () => {
  const source =
    "() => {\n        const str = '\\uD83D\\uDE00';\n        const re = /^..$/;\n        expect(re.test(str)).toBe(true); // Two code units\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const str = '\\uD83D\\uDE00';
      const re = /^..$/;
      expect(re.test(str)).toBe(true); // Two code units
    };"
  `);
});

test('052 JS Unicode Regexes > surrogate pair handling > lone high surrogate does not match . with /u', async () => {
  const source =
    "() => {\n        // A lone high surrogate is not a valid code point sequence\n        const re = /^.$/u;\n        expect(re.test('\\uD83D')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // A lone high surrogate is not a valid code point sequence
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/;
      expect(re.test('\\ud83d')).toBe(true);
    };"
  `);
});

test('053 JS Unicode Regexes > surrogate pair handling > astral range boundary correctness', async () => {
  const source =
    "() => {\n        // U+10000 is the first astral code point\n        const re = /\\u{10000}/u;\n        expect(re.test('\\u{10000}')).toBe(true);\n        expect(re.test('\\uFFFF')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // U+10000 is the first astral code point
      const re = /(?:\\uD800\\uDC00)/;
      expect(re.test('𐀀')).toBe(true);
      expect(re.test('￿')).toBe(false);
    };"
  `);
});

test('054 JS Unicode Regexes > surrogate pair handling > consecutive astral characters', async () => {
  const source =
    "() => {\n        const re = /^(.)(.)$/u;\n        const match = re.exec('😀😁');\n        expect(match[1]).toBe('😀');\n        expect(match[2]).toBe('😁');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))$/;
      const match = re.exec('😀😁');
      expect(match[1]).toBe('😀');
      expect(match[2]).toBe('😁');
    };"
  `);
});

test('055 JS Unicode Regexes > quantifiers with /u > + quantifier applies to full code point', async () => {
  const source =
    "() => {\n        const re = /^a+$/u;\n        expect(re.test('aaa')).toBe(true);\n        expect(re.test('')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^a+$/;
      expect(re.test('aaa')).toBe(true);
      expect(re.test('')).toBe(false);
    };"
  `);
});

test('056 JS Unicode Regexes > quantifiers with /u > * quantifier with astral characters', async () => {
  const source =
    "() => {\n        const re = /^😀*$/u;\n        expect(re.test('')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('😀😀😀')).toBe(true);\n        expect(re.test('😀a')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:\\uD83D\\uDE00)*$/;
      expect(re.test('')).toBe(true);
      expect(re.test('😀')).toBe(true);
      expect(re.test('😀😀😀')).toBe(true);
      expect(re.test('😀a')).toBe(false);
    };"
  `);
});

test('057 JS Unicode Regexes > quantifiers with /u > {n} quantifier counts code points', async () => {
  const source =
    "() => {\n        const re = /^.{3}$/u;\n        expect(re.test('abc')).toBe(true);\n        expect(re.test('😀😁😂')).toBe(true);\n        expect(re.test('a😀b')).toBe(true);\n        expect(re.test('abcd')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]){3}$/;
      expect(re.test('abc')).toBe(true);
      expect(re.test('😀😁😂')).toBe(true);
      expect(re.test('a😀b')).toBe(true);
      expect(re.test('abcd')).toBe(false);
    };"
  `);
});

test('058 JS Unicode Regexes > quantifiers with /u > {n,m} range quantifier with code points', async () => {
  const source =
    "() => {\n        const re = /^.{2,4}$/u;\n        expect(re.test('ab')).toBe(true);\n        expect(re.test('😀😁')).toBe(true);\n        expect(re.test('😀😁😂😃')).toBe(true);\n        expect(re.test('a')).toBe(false);\n        expect(re.test('abcde')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]){2,4}$/;
      expect(re.test('ab')).toBe(true);
      expect(re.test('😀😁')).toBe(true);
      expect(re.test('😀😁😂😃')).toBe(true);
      expect(re.test('a')).toBe(false);
      expect(re.test('abcde')).toBe(false);
    };"
  `);
});

test('059 JS Unicode Regexes > quantifiers with /u > ? quantifier on astral character', async () => {
  const source =
    "() => {\n        const re = /^a😀?b$/u;\n        expect(re.test('ab')).toBe(true);\n        expect(re.test('a😀b')).toBe(true);\n        expect(re.test('a😀😀b')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^a(?:\\uD83D\\uDE00)?b$/;
      expect(re.test('ab')).toBe(true);
      expect(re.test('a😀b')).toBe(true);
      expect(re.test('a😀😀b')).toBe(false);
    };"
  `);
});

test('060 JS Unicode Regexes > capturing groups with /u > capturing group captures full code point', async () => {
  const source =
    "() => {\n        const re = /^(.)$/u;\n        const match = re.exec('😀');\n        expect(match[1]).toBe('😀');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))$/;
      const match = re.exec('😀');
      expect(match[1]).toBe('😀');
    };"
  `);
});

test('061 JS Unicode Regexes > capturing groups with /u > multiple groups with astral characters', async () => {
  const source =
    "() => {\n        const re = /^(.)(.)(.)$/u;\n        const match = re.exec('a😀b');\n        expect(match[1]).toBe('a');\n        expect(match[2]).toBe('😀');\n        expect(match[3]).toBe('b');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))$/;
      const match = re.exec('a😀b');
      expect(match[1]).toBe('a');
      expect(match[2]).toBe('😀');
      expect(match[3]).toBe('b');
    };"
  `);
});

test('062 JS Unicode Regexes > capturing groups with /u > backreference matches same code point', async () => {
  const source =
    "() => {\n        const re = /^(.)\\1$/u;\n        expect(re.test('aa')).toBe(true);\n        expect(re.test('😀😀')).toBe(true);\n        expect(re.test('😀😁')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))\\1$/;
      expect(re.test('aa')).toBe(true);
      expect(re.test('😀😀')).toBe(true);
      expect(re.test('😀😁')).toBe(false);
    };"
  `);
});

test('063 JS Unicode Regexes > capturing groups with /u > named group with /u', async () => {
  const source =
    "() => {\n        const re = /(?<emoji>.)/u;\n        const match = re.exec('😀');\n        expect(match.groups.emoji).toBe('😀');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /(?<emoji>(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))/;
      const match = re.exec('😀');
      expect(match.groups.emoji).toBe('😀');
    };"
  `);
});

test('064 JS Unicode Regexes > capturing groups with /u > non-capturing group with /u', async () => {
  const source =
    "() => {\n        const re = /^(?:.)$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('A')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('A')).toBe(true);
    };"
  `);
});

test('065 JS Unicode Regexes > anchors and boundaries with /u > ^ and $ work with astral characters', async () => {
  const source =
    "() => {\n        const re = /^😀$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('😀😀')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:\\uD83D\\uDE00)$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('😀😀')).toBe(false);
    };"
  `);
});

test('066 JS Unicode Regexes > anchors and boundaries with /u > multiline anchors with /u', async () => {
  const source =
    "() => {\n        const re = /^.$/gmu;\n        const matches = 'a\\n😀\\nb'.match(re);\n        expect(matches.length).toBe(3);\n        expect(matches[0]).toBe('a');\n        expect(matches[1]).toBe('😀');\n        expect(matches[2]).toBe('b');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/gm;
      const matches = 'a\\n😀\\nb'.match(re);
      expect(matches.length).toBe(3);
      expect(matches[0]).toBe('a');
      expect(matches[1]).toBe('😀');
      expect(matches[2]).toBe('b');
    };"
  `);
});

test('067 JS Unicode Regexes > anchors and boundaries with /u > \\b boundary with /u before astral character', async () => {
  const source =
    "() => {\n        const re = /\\bword/u;\n        expect(re.test('word')).toBe(true);\n        expect(re.test('a word')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\bword/;
      expect(re.test('word')).toBe(true);
      expect(re.test('a word')).toBe(true);
    };"
  `);
});

test('068 JS Unicode Regexes > alternation with /u > alternation between BMP and astral', async () => {
  const source =
    "() => {\n        const re = /^(?:A|😀)$/u;\n        expect(re.test('A')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('B')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:A|(?:\\uD83D\\uDE00))$/;
      expect(re.test('A')).toBe(true);
      expect(re.test('😀')).toBe(true);
      expect(re.test('B')).toBe(false);
    };"
  `);
});

test('069 JS Unicode Regexes > alternation with /u > alternation between astral characters', async () => {
  const source =
    "() => {\n        const re = /^(?:😀|😁|😂)$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('😁')).toBe(true);\n        expect(re.test('😂')).toBe(true);\n        expect(re.test('😃')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:(?:\\uD83D\\uDE00)|(?:\\uD83D\\uDE01)|(?:\\uD83D\\uDE02))$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('😁')).toBe(true);
      expect(re.test('😂')).toBe(true);
      expect(re.test('😃')).toBe(false);
    };"
  `);
});

test('070 JS Unicode Regexes > lookahead and lookbehind with /u > positive lookahead with astral', async () => {
  const source =
    "() => {\n        const re = /A(?=😀)/u;\n        expect(re.test('A😀')).toBe(true);\n        expect(re.test('AB')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /A(?=(?:\\uD83D\\uDE00))/;
      expect(re.test('A😀')).toBe(true);
      expect(re.test('AB')).toBe(false);
    };"
  `);
});

test('071 JS Unicode Regexes > lookahead and lookbehind with /u > negative lookahead with astral', async () => {
  const source =
    "() => {\n        const re = /A(?!😀)/u;\n        expect(re.test('AB')).toBe(true);\n        expect(re.test('A😀')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /A(?!(?:\\uD83D\\uDE00))/;
      expect(re.test('AB')).toBe(true);
      expect(re.test('A😀')).toBe(false);
    };"
  `);
});

test('072 JS Unicode Regexes > lookahead and lookbehind with /u > positive lookbehind with astral', async () => {
  const source =
    "() => {\n        const re = /(?<=😀)B/u;\n        expect(re.test('😀B')).toBe(true);\n        expect(re.test('AB')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?<=(?:\\uD83D\\uDE00))B/;
      expect(re.test('😀B')).toBe(true);
      expect(re.test('AB')).toBe(false);
    };"
  `);
});

test('073 JS Unicode Regexes > lookahead and lookbehind with /u > negative lookbehind with astral', async () => {
  const source =
    "() => {\n        const re = /(?<!😀)B/u;\n        expect(re.test('AB')).toBe(true);\n        expect(re.test('😀B')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?<!(?:\\uD83D\\uDE00))B/;
      expect(re.test('AB')).toBe(true);
      expect(re.test('😀B')).toBe(false);
    };"
  `);
});

test('074 JS Unicode Regexes > replace and split with /u > replace astral character', async () => {
  const source =
    "() => {\n        const result = '😀'.replace(/😀/u, 'smile');\n        expect(result).toBe('smile');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const result = '😀'.replace(/(?:\\uD83D\\uDE00)/, 'smile');
      expect(result).toBe('smile');
    };"
  `);
});

test('075 JS Unicode Regexes > replace and split with /u > global replace of astral characters', async () => {
  const source =
    "() => {\n        const result = 'a😀b😀c'.replace(/😀/gu, 'X');\n        expect(result).toBe('aXbXc');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const result = 'a😀b😀c'.replace(/(?:\\uD83D\\uDE00)/g, 'X');
      expect(result).toBe('aXbXc');
    };"
  `);
});

test('076 JS Unicode Regexes > replace and split with /u > replace with capture group on astral', async () => {
  const source =
    "() => {\n        const result = 'a😀b'.replace(/(😀)/u, '[$1]');\n        expect(result).toBe('a[😀]b');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const result = 'a😀b'.replace(/((?:\\uD83D\\uDE00))/, '[$1]');
      expect(result).toBe('a[😀]b');
    };"
  `);
});

test('077 JS Unicode Regexes > replace and split with /u > split on astral character', async () => {
  const source =
    "() => {\n        const parts = 'a😀b😀c'.split(/😀/u);\n        expect(parts).toEqual(['a', 'b', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const parts = 'a😀b😀c'.split(/(?:\\uD83D\\uDE00)/);
      expect(parts).toEqual(['a', 'b', 'c']);
    };"
  `);
});

test('078 JS Unicode Regexes > replace and split with /u > replace dot-matched astral character', async () => {
  const source =
    "() => {\n        const result = 'a😀b'.replace(/(.)/gu, '[$1]');\n        expect(result).toBe('[a][😀][b]');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const result = 'a😀b'.replace(
        /((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))/g,
        '[$1]',
      );
      expect(result).toBe('[a][😀][b]');
    };"
  `);
});

test('079 JS Unicode Regexes > replace and split with /u > search for astral character', async () => {
  const source =
    "() => {\n        const idx = 'hello😀world'.search(/😀/u);\n        expect(idx).toBe(5);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const idx = 'hello😀world'.search(/(?:\\uD83D\\uDE00)/);
      expect(idx).toBe(5);
    };"
  `);
});

test('080 JS Unicode Regexes > combined flags > /gu global unicode', async () => {
  const source =
    "() => {\n        const re = /./gu;\n        const matches = '😀😁😂'.match(re);\n        expect(matches.length).toBe(3);\n        expect(matches[0]).toBe('😀');\n        expect(matches[1]).toBe('😁');\n        expect(matches[2]).toBe('😂');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g;
      const matches = '😀😁😂'.match(re);
      expect(matches.length).toBe(3);
      expect(matches[0]).toBe('😀');
      expect(matches[1]).toBe('😁');
      expect(matches[2]).toBe('😂');
    };"
  `);
});

test('081 JS Unicode Regexes > combined flags > /giu global case-insensitive unicode', async () => {
  const source =
    "() => {\n        const re = /[a-z]/giu;\n        const matches = 'Hello'.match(re);\n        expect(matches.length).toBe(5);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /[a-z]/gi;
      const matches = 'Hello'.match(re);
      expect(matches.length).toBe(5);
    };"
  `);
});

test('082 JS Unicode Regexes > combined flags > /mu multiline unicode', async () => {
  const source =
    "() => {\n        const re = /^.$/mu;\n        expect(re.test('😀')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /^(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])$/m;
      expect(re.test('😀')).toBe(true);
    };"
  `);
});

test('083 JS Unicode Regexes > combined flags > /siu dotAll case-insensitive unicode', async () => {
  const source =
    "() => {\n        const re = /^.$/isu;\n        expect(re.test('\\n')).toBe(true);\n        expect(re.test('😀')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])$/is;
      expect(re.test('\\n')).toBe(true);
      expect(re.test('😀')).toBe(true);
    };"
  `);
});

test('084 JS Unicode Regexes > combined flags > /yu sticky unicode', async () => {
  const source =
    "() => {\n        const re = /./uy;\n        re.lastIndex = 0;\n        const match = re.exec('😀A');\n        expect(match[0]).toBe('😀');\n        expect(re.lastIndex).toBe(2); // 2 code units for the surrogate pair\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/y;
      re.lastIndex = 0;
      const match = re.exec('😀A');
      expect(match[0]).toBe('😀');
      expect(re.lastIndex).toBe(2);
    };"
  `);
});

test('085 JS Unicode Regexes > escapes with /u > \\t \\n \\r work with /u', async () => {
  const source =
    "() => {\n        expect(/^\\t$/u.test('\\t')).toBe(true);\n        expect(/^\\n$/u.test('\\n')).toBe(true);\n        expect(/^\\r$/u.test('\\r')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\t$/.test('	')).toBe(true);
      expect(/^\\n$/.test('\\n')).toBe(true);
      expect(/^\\r$/.test('\\r')).toBe(true);
    };"
  `);
});

test('086 JS Unicode Regexes > escapes with /u > \\0 matches null character', async () => {
  const source = "() => {\n        expect(/^\\0$/u.test('\\0')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\0$/.test('\\0')).toBe(true);
    };"
  `);
});

test('087 JS Unicode Regexes > escapes with /u > hex escape \\xNN works with /u', async () => {
  const source =
    "() => {\n        expect(/^\\x41$/u.test('A')).toBe(true);\n        expect(/^\\xFF$/u.test('\\xFF')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\x41$/.test('A')).toBe(true);
      expect(/^\\xFF$/.test('ÿ')).toBe(true);
    };"
  `);
});

test('088 JS Unicode Regexes > escapes with /u > BMP unicode escape \\uNNNN works with /u', async () => {
  const source =
    "() => {\n        expect(/^\\u0041$/u.test('A')).toBe(true);\n        expect(/^\\u00E9$/u.test('é')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\u0041$/.test('A')).toBe(true);
      expect(/^\\u00E9$/.test('é')).toBe(true);
    };"
  `);
});

test('089 JS Unicode Regexes > escapes with /u > escaped special characters with /u', async () => {
  const source =
    "() => {\n        expect(/^\\.$/u.test('.')).toBe(true);\n        expect(/^\\*$/u.test('*')).toBe(true);\n        expect(/^\\($/u.test('(')).toBe(true);\n        expect(/^\\)$/u.test(')')).toBe(true);\n        expect(/^\\[$/u.test('[')).toBe(true);\n        expect(/^\\]$/u.test(']')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      expect(/^\\.$/.test('.')).toBe(true);
      expect(/^\\*$/.test('*')).toBe(true);
      expect(/^\\($/.test('(')).toBe(true);
      expect(/^\\)$/.test(')')).toBe(true);
      expect(/^\\[$/.test('[')).toBe(true);
      expect(/^\\]$/.test(']')).toBe(true);
    };"
  `);
});

test('090 JS Unicode Regexes > edge cases > empty regex with /u', async () => {
  const source =
    "() => {\n        const re = /(?:)/u;\n        expect(re.test('')).toBe(true);\n        expect(re.test('a')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:)/;
      expect(re.test('')).toBe(true);
      expect(re.test('a')).toBe(true);
    };"
  `);
});

test('091 JS Unicode Regexes > edge cases > empty character class complement matches astral', async () => {
  const source =
    "() => {\n        // [^] without /u matches any character including newlines\n        // With /u we use [\\s\\S] to match any character\n        const re = /^[\\s\\S]$/u;\n        expect(re.test('😀')).toBe(true);\n        expect(re.test('\\n')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // [^] without /u matches any character including newlines
      // With /u we use [\\s\\S] to match any character
      const re = /^[\\s\\S]$/;
      expect(re.test('😀')).toBe(true);
      expect(re.test('\\n')).toBe(true);
    };"
  `);
});

test('092 JS Unicode Regexes > edge cases > consecutive astral characters in class', async () => {
  const source =
    "() => {\n        const re = /^[😀😁😂]+$/u;\n        expect(re.test('😀😁😂😀')).toBe(true);\n        expect(re.test('😃')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('093 JS Unicode Regexes > edge cases > astral character at string boundaries', async () => {
  const source =
    "() => {\n        const re = /^😀/u;\n        expect(re.test('😀hello')).toBe(true);\n        const re2 = /😀$/u;\n        expect(re2.test('hello😀')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^(?:\\uD83D\\uDE00)/;
      expect(re.test('😀hello')).toBe(true);
      const re2 = /(?:\\uD83D\\uDE00)$/;
      expect(re2.test('hello😀')).toBe(true);
    };"
  `);
});

test('094 JS Unicode Regexes > edge cases > very long string with astral characters', async () => {
  const source =
    "() => {\n        const str = '😀'.repeat(1000);\n        const re = /^(😀)+$/u;\n        expect(re.test(str)).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const str = '😀'.repeat(1e3);
      const re = /^((?:\\uD83D\\uDE00))+$/;
      expect(re.test(str)).toBe(true);
    };"
  `);
});

test('095 JS Unicode Regexes > edge cases > mixed BMP and astral string', async () => {
  const source =
    "() => {\n        const re = /^[a-z😀]+$/u;\n        expect(re.test('hello😀world')).toBe(true);\n        expect(re.test('hello😀world!')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('096 JS Unicode Regexes > edge cases > new RegExp with /u flag', async () => {
  const source =
    "() => {\n        const re = new RegExp('.', 'u');\n        const match = re.exec('😀');\n        expect(match[0]).toBe('😀');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = new RegExp('.', 'u');
      const match = re.exec('😀');
      expect(match[0]).toBe('😀');
    };"
  `);
});

test('097 JS Unicode Regexes > edge cases > new RegExp with \\u{} escape and /u flag', async () => {
  const source =
    "() => {\n        const re = new RegExp('\\\\u{1F600}', 'u');\n        expect(re.test('😀')).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = new RegExp('\\\\u{1F600}', 'u');
      expect(re.test('😀')).toBe(true);
    };"
  `);
});

test('098 JS Unicode Regexes > edge cases > lastIndex advances by code units, not code points', async () => {
  const source =
    "() => {\n        const re = /./gu;\n        const str = '😀a';\n        const m1 = re.exec(str);\n        expect(m1[0]).toBe('😀');\n        expect(re.lastIndex).toBe(2); // 2 code units\n        const m2 = re.exec(str);\n        expect(m2[0]).toBe('a');\n        expect(re.lastIndex).toBe(3); // 3 code units total\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re =
        /(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g;
      const str = '😀a';
      const m1 = re.exec(str);
      expect(m1[0]).toBe('😀');
      expect(re.lastIndex).toBe(2);
      const m2 = re.exec(str);
      expect(m2[0]).toBe('a');
      expect(re.lastIndex).toBe(3);
    };"
  `);
});

test('099 JS Unicode Regexes > practical patterns > match any emoji in range', async () => {
  const source =
    "() => {\n        const re = /[\\u{1F600}-\\u{1F64F}]/u;\n        expect(re.test('😀')).toBe(true); // U+1F600\n        expect(re.test('🙏')).toBe(true); // U+1F64F\n        expect(re.test('A')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('100 JS Unicode Regexes > practical patterns > extract emoji from text', async () => {
  const source =
    "() => {\n        const re = /[\\u{1F600}-\\u{1F64F}]/gu;\n        const matches = 'Hello 😀 World 😂!'.match(re);\n        expect(matches.length).toBe(2);\n        expect(matches[0]).toBe('😀');\n        expect(matches[1]).toBe('😂');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('101 JS Unicode Regexes > practical patterns > count code points in string', async () => {
  const source =
    "() => {\n        const re = /./gsu;\n        const str = 'a😀b😁c';\n        const count = str.match(re).length;\n        expect(count).toBe(5); // 5 code points\n        expect(str.length).toBe(7); // 7 code units\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])/gs;
      const str = 'a😀b😁c';
      const count = str.match(re).length;
      expect(count).toBe(5);
      expect(str.length).toBe(7);
    };"
  `);
});

test('102 JS Unicode Regexes > practical patterns > validate hex color with /u', async () => {
  const source =
    "() => {\n        const re = /^#[0-9a-f]{6}$/iu;\n        expect(re.test('#FF8800')).toBe(true);\n        expect(re.test('#ff8800')).toBe(true);\n        expect(re.test('#GGGGGG')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^#[0-9a-f]{6}$/i;
      expect(re.test('#FF8800')).toBe(true);
      expect(re.test('#ff8800')).toBe(true);
      expect(re.test('#GGGGGG')).toBe(false);
    };"
  `);
});

test('103 JS Unicode Regexes > practical patterns > match CJK characters', async () => {
  const source =
    "() => {\n        const re = /^[\\u4E00-\\u9FFF]+$/u;\n        expect(re.test('你好世界')).toBe(true);\n        expect(re.test('hello')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /^[\\u4E00-\\u9FFF]+$/;
      expect(re.test('你好世界')).toBe(true);
      expect(re.test('hello')).toBe(false);
    };"
  `);
});

test('104 JS Unicode Regexes > practical patterns > match mathematical symbols (astral plane)', async () => {
  const source =
    "() => {\n        // U+1D400-U+1D7FF: Mathematical Alphanumeric Symbols\n        const re = /[\\u{1D400}-\\u{1D7FF}]/u;\n        expect(re.test('\\u{1D400}')).toBe(true); // 𝐀 (Math bold A)\n        expect(re.test('\\u{1D7FF}')).toBe(true); // 𝟿 (Math monospace 9)\n        expect(re.test('A')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-unicode-astral-class-not-implemented"`);
});

test('105 JS Unicode Regexes > practical patterns > split text preserving emoji', async () => {
  const source =
    "() => {\n        const re = /\\s+/u;\n        const parts = 'hello 😀 world'.split(re);\n        expect(parts).toEqual(['hello', '😀', 'world']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /\\s+/;
      const parts = 'hello 😀 world'.split(re);
      expect(parts).toEqual(['hello', '😀', 'world']);
    };"
  `);
});

test('106 JS Unicode Regexes > practical patterns > replace each code point individually', async () => {
  const source =
    "() => {\n        const result = 'a😀b'.replace(/./gu, (ch) => `[${ch}]`);\n        expect(result).toBe('[a][😀][b]');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const result = 'a😀b'.replace(
        /(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])/g,
        ch => \`[\${ch}]\`,
      );
      expect(result).toBe('[a][😀][b]');
    };"
  `);
});
