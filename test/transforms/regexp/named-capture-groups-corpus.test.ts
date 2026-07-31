// Generated from apps/test-suite/tests/JSNamedGroupsRegexes.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Named Groups Regexes > basic named groups > exec() returns groups object', async () => {
  const source =
    "() => {\n        const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\n        const match = re.exec('2025-05-01');\n        expect(match).not.toBe(null);\n        expect(match.groups.year).toBe('2025');\n        expect(match.groups.month).toBe('05');\n        expect(match.groups.day).toBe('01');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/, {
        month: 2,
        day: 3,
        year: 1,
      });
      const match = re.exec('2025-05-01');
      expect(match).not.toBe(null);
      expect(match.groups.year).toBe('2025');
      expect(match.groups.month).toBe('05');
      expect(match.groups.day).toBe('01');
    };"
  `);
});

test('002 JS Named Groups Regexes > basic named groups > match() returns groups object', async () => {
  const source =
    "() => {\n        const re = /(?<greeting>hello) (?<target>world)/;\n        const match = 'hello world'.match(re);\n        expect(match.groups.greeting).toBe('hello');\n        expect(match.groups.target).toBe('world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(hello) (world)/, {
        target: 2,
        greeting: 1,
      });
      const match = 'hello world'.match(re);
      expect(match.groups.greeting).toBe('hello');
      expect(match.groups.target).toBe('world');
    };"
  `);
});

test('003 JS Named Groups Regexes > basic named groups > single named group', async () => {
  const source =
    "() => {\n        const re = /(?<name>\\w+)/;\n        const match = re.exec('foobar');\n        expect(match.groups.name).toBe('foobar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)/, { name: 1 });
      const match = re.exec('foobar');
      expect(match.groups.name).toBe('foobar');
    };"
  `);
});

test('004 JS Named Groups Regexes > basic named groups > named group with no match returns null', async () => {
  const source =
    "() => {\n        const re = /(?<year>\\d{4})/;\n        const match = re.exec('no digits here');\n        expect(match).toBe(null);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{4})/, { year: 1 });
      const match = re.exec('no digits here');
      expect(match).toBe(null);
    };"
  `);
});

test('005 JS Named Groups Regexes > basic named groups > groups is a null-prototype object', async () => {
  const source =
    "() => {\n        const re = /(?<a>x)/;\n        const match = re.exec('x');\n        expect(match.groups.a).toBe('x');\n        // groups should not inherit from Object.prototype\n        expect(match.groups.hasOwnProperty).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(x)/, { a: 1 });
      const match = re.exec('x');
      expect(match.groups.a).toBe('x');
      // groups should not inherit from Object.prototype
      expect(match.groups.hasOwnProperty).toBe(undefined);
    };"
  `);
});

test('006 JS Named Groups Regexes > basic named groups > numbered capture still works alongside named', async () => {
  const source =
    "() => {\n        const re = /(?<first>\\w+) (\\w+)/;\n        const match = re.exec('hello world');\n        expect(match[1]).toBe('hello');\n        expect(match[2]).toBe('world');\n        expect(match.groups.first).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+) (\\w+)/, { first: 1 });
      const match = re.exec('hello world');
      expect(match[1]).toBe('hello');
      expect(match[2]).toBe('world');
      expect(match.groups.first).toBe('hello');
    };"
  `);
});

test('007 JS Named Groups Regexes > multiple named groups > three groups', async () => {
  const source =
    "() => {\n        const re = /(?<r>\\d+)\\.(?<g>\\d+)\\.(?<b>\\d+)/;\n        const match = re.exec('255.128.0');\n        expect(match.groups.r).toBe('255');\n        expect(match.groups.g).toBe('128');\n        expect(match.groups.b).toBe('0');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)\\.(\\d+)\\.(\\d+)/, {
        g: 2,
        r: 1,
        b: 3,
      });
      const match = re.exec('255.128.0');
      expect(match.groups.r).toBe('255');
      expect(match.groups.g).toBe('128');
      expect(match.groups.b).toBe('0');
    };"
  `);
});

test('008 JS Named Groups Regexes > multiple named groups > groups with different character classes', async () => {
  const source =
    "() => {\n        const re = /(?<letters>[a-z]+)(?<digits>\\d+)(?<rest>.*)/;\n        const match = re.exec('abc123!@#');\n        expect(match.groups.letters).toBe('abc');\n        expect(match.groups.digits).toBe('123');\n        expect(match.groups.rest).toBe('!@#');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([a-z]+)(\\d+)(.*)/, {
        digits: 2,
        letters: 1,
        rest: 3,
      });
      const match = re.exec('abc123!@#');
      expect(match.groups.letters).toBe('abc');
      expect(match.groups.digits).toBe('123');
      expect(match.groups.rest).toBe('!@#');
    };"
  `);
});

test('009 JS Named Groups Regexes > multiple named groups > five groups', async () => {
  const source =
    "() => {\n        const re =\n          /(?<proto>\\w+):\\/\\/(?<host>[^/:]+)(?::(?<port>\\d+))?(?<path>\\/[^?]*)?(?:\\?(?<query>.*))?/;\n        const match = re.exec('https://example.com:8080/path?q=1');\n        expect(match.groups.proto).toBe('https');\n        expect(match.groups.host).toBe('example.com');\n        expect(match.groups.port).toBe('8080');\n        expect(match.groups.path).toBe('/path');\n        expect(match.groups.query).toBe('q=1');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+):\\/\\/([^/:]+)(?::(\\d+))?(\\/[^?]*)?(?:\\?(.*))?/, {
        proto: 1,
        query: 5,
        path: 4,
        host: 2,
        port: 3,
      });
      const match = re.exec('https://example.com:8080/path?q=1');
      expect(match.groups.proto).toBe('https');
      expect(match.groups.host).toBe('example.com');
      expect(match.groups.port).toBe('8080');
      expect(match.groups.path).toBe('/path');
      expect(match.groups.query).toBe('q=1');
    };"
  `);
});

test('010 JS Named Groups Regexes > backreferences > \\k<name> matches same text as named group', async () => {
  const source =
    "() => {\n        const re = /(?<quote>['\"]).*?\\k<quote>/;\n        expect(re.test(\"'hello'\")).toBe(true);\n        expect(re.test('\"hello\"')).toBe(true);\n        expect(re.test('\\'hello\"')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(['"]).*?\\1/, { quote: 1 });
      expect(re.test("'hello'")).toBe(true);
      expect(re.test('"hello"')).toBe(true);
      expect(re.test('\\'hello"')).toBe(false);
    };"
  `);
});

test('011 JS Named Groups Regexes > backreferences > \\k<name> with exec', async () => {
  const source =
    "() => {\n        const re = /^(?<tag>\\w+).*\\k<tag>$/;\n        const match = re.exec('div content div');\n        expect(match).not.toBe(null);\n        expect(match.groups.tag).toBe('div');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/^(\\w+).*\\1$/, { tag: 1 });
      const match = re.exec('div content div');
      expect(match).not.toBe(null);
      expect(match.groups.tag).toBe('div');
    };"
  `);
});

test('012 JS Named Groups Regexes > backreferences > \\k<name> fails when group content differs', async () => {
  const source =
    "() => {\n        const re = /^(?<word>\\w+) \\k<word>$/;\n        expect(re.test('abc abc')).toBe(true);\n        expect(re.test('abc def')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/^(\\w+) \\1$/, { word: 1 });
      expect(re.test('abc abc')).toBe(true);
      expect(re.test('abc def')).toBe(false);
    };"
  `);
});

test('013 JS Named Groups Regexes > backreferences > multiple backreferences', async () => {
  const source =
    "() => {\n        const re = /(?<a>\\w)(?<b>\\w) \\k<a>\\k<b>/;\n        const match = re.exec('ab ab');\n        expect(match).not.toBe(null);\n        expect(match.groups.a).toBe('a');\n        expect(match.groups.b).toBe('b');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w)(\\w) \\1\\2/, {
        a: 1,
        b: 2,
      });
      const match = re.exec('ab ab');
      expect(match).not.toBe(null);
      expect(match.groups.a).toBe('a');
      expect(match.groups.b).toBe('b');
    };"
  `);
});

test('014 JS Named Groups Regexes > string replace with named groups > $<name> in replacement string', async () => {
  const source =
    "() => {\n        const re = /(?<first>\\w+) (?<second>\\w+)/;\n        const result = 'hello world'.replace(re, '$<second> $<first>');\n        expect(result).toBe('world hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+) (\\w+)/, {
        second: 2,
        first: 1,
      });
      const result = 'hello world'.replace(re, '$<second> $<first>');
      expect(result).toBe('world hello');
    };"
  `);
});

test('015 JS Named Groups Regexes > string replace with named groups > $<name> with date reformatting', async () => {
  const source =
    "() => {\n        const re = /(?<month>\\d{2})\\/(?<day>\\d{2})\\/(?<year>\\d{4})/;\n        const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');\n        expect(result).toBe('2025-05-01');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, {
        month: 1,
        year: 3,
        day: 2,
      });
      const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');
      expect(result).toBe('2025-05-01');
    };"
  `);
});

test('016 JS Named Groups Regexes > string replace with named groups > $<name> with global flag replaces all', async () => {
  const source =
    "() => {\n        const re = /(?<vowel>[aeiou])/g;\n        const result = 'hello'.replace(re, '[$<vowel>]');\n        expect(result).toBe('h[e]ll[o]');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([aeiou])/g, { vowel: 1 });
      const result = 'hello'.replace(re, '[$<vowel>]');
      expect(result).toBe('h[e]ll[o]');
    };"
  `);
});

test('017 JS Named Groups Regexes > string replace with named groups > $<nonexistent> produces empty string', async () => {
  const source =
    "() => {\n        const re = /(?<a>x)/;\n        const result = 'x'.replace(re, '$<a>$<b>');\n        // $<b> doesn't match a named group, should produce empty string\n        expect(result).toBe('x');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(x)/, { a: 1 });
      const result = 'x'.replace(re, '$<a>$<b>');
      // $<b> doesn't match a named group, should produce empty string
      expect(result).toBe('x');
    };"
  `);
});

test('018 JS Named Groups Regexes > string replace with named groups > replace function receives groups as last argument', async () => {
  const source =
    "() => {\n        const re = /(?<first>\\w+) (?<second>\\w+)/;\n        let capturedGroups = null;\n        'hello world'.replace(re, function () {\n          capturedGroups = arguments[arguments.length - 1];\n        });\n        expect(capturedGroups).not.toBe(null);\n        expect(capturedGroups.first).toBe('hello');\n        expect(capturedGroups.second).toBe('world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+) (\\w+)/, {
        second: 2,
        first: 1,
      });
      let capturedGroups = null;
      'hello world'.replace(re, function () {
        capturedGroups = arguments[arguments.length - 1];
      });
      expect(capturedGroups).not.toBe(null);
      expect(capturedGroups.first).toBe('hello');
      expect(capturedGroups.second).toBe('world');
    };"
  `);
});

test('019 JS Named Groups Regexes > string replace with named groups > replace function return value is used', async () => {
  const source =
    "() => {\n        const re = /(?<n>\\d+)/g;\n        const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {\n          return String(Number(groups.n) * 2);\n        });\n        expect(result).toBe('a2b4c6');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/g, { n: 1 });
      const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {
        return String(Number(groups.n) * 2);
      });
      expect(result).toBe('a2b4c6');
    };"
  `);
});

test('020 JS Named Groups Regexes > string replace with named groups > numbered references $1 $2 still work', async () => {
  const source =
    "() => {\n        const re = /(?<a>\\w+) (?<b>\\w+)/;\n        const result = 'hello world'.replace(re, '$2 $1');\n        expect(result).toBe('world hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+) (\\w+)/, {
        a: 1,
        b: 2,
      });
      const result = 'hello world'.replace(re, '$2 $1');
      expect(result).toBe('world hello');
    };"
  `);
});

test('021 JS Named Groups Regexes > test() method > test() works with named groups', async () => {
  const source =
    "() => {\n        const re = /(?<year>\\d{4})/;\n        expect(re.test('2025')).toBe(true);\n        expect(re.test('nope')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{4})/, { year: 1 });
      expect(re.test('2025')).toBe(true);
      expect(re.test('nope')).toBe(false);
    };"
  `);
});

test('022 JS Named Groups Regexes > test() method > test() with backreference', async () => {
  const source =
    "() => {\n        const re = /(?<char>.)\\k<char>/;\n        expect(re.test('aa')).toBe(true);\n        expect(re.test('ab')).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(.)\\1/, { char: 1 });
      expect(re.test('aa')).toBe(true);
      expect(re.test('ab')).toBe(false);
    };"
  `);
});

test('023 JS Named Groups Regexes > test() method > test() with global flag advances lastIndex', async () => {
  const source =
    "() => {\n        const re = /(?<d>\\d)/g;\n        const str = 'a1b2c3';\n        expect(re.test(str)).toBe(true);\n        expect(re.lastIndex).toBe(2);\n        expect(re.test(str)).toBe(true);\n        expect(re.lastIndex).toBe(4);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d)/g, { d: 1 });
      const str = 'a1b2c3';
      expect(re.test(str)).toBe(true);
      expect(re.lastIndex).toBe(2);
      expect(re.test(str)).toBe(true);
      expect(re.lastIndex).toBe(4);
    };"
  `);
});

test('024 JS Named Groups Regexes > flags > case-insensitive flag', async () => {
  const source =
    "() => {\n        const re = /(?<word>[a-z]+)/i;\n        const match = re.exec('HELLO');\n        expect(match.groups.word).toBe('HELLO');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([a-z]+)/i, { word: 1 });
      const match = re.exec('HELLO');
      expect(match.groups.word).toBe('HELLO');
    };"
  `);
});

test('025 JS Named Groups Regexes > flags > global flag with exec iteration', async () => {
  const source =
    "() => {\n        const re = /(?<num>\\d+)/g;\n        const str = 'a1b22c333';\n        const results = [];\n        let m;\n        while ((m = re.exec(str)) !== null) {\n          results.push(m.groups.num);\n        }\n        expect(results).toEqual(['1', '22', '333']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/g, { num: 1 });
      const str = 'a1b22c333';
      const results = [];
      let m;
      while ((m = re.exec(str)) !== null) {
        results.push(m.groups.num);
      }
      expect(results).toEqual(['1', '22', '333']);
    };"
  `);
});

test('026 JS Named Groups Regexes > flags > multiline flag', async () => {
  const source =
    "() => {\n        const re = /^(?<first>\\w+)/gm;\n        const str = 'hello\\nworld\\nfoo';\n        const results = [];\n        let m;\n        while ((m = re.exec(str)) !== null) {\n          results.push(m.groups.first);\n        }\n        expect(results).toEqual(['hello', 'world', 'foo']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/^(\\w+)/gm, { first: 1 });
      const str = 'hello\\nworld\\nfoo';
      const results = [];
      let m;
      while ((m = re.exec(str)) !== null) {
        results.push(m.groups.first);
      }
      expect(results).toEqual(['hello', 'world', 'foo']);
    };"
  `);
});

test('027 JS Named Groups Regexes > flags > dotAll flag', async () => {
  const source =
    "() => {\n        const re = /(?<all>.*)/s;\n        const match = re.exec('line1\\nline2');\n        expect(match.groups.all).toBe('line1\\nline2');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(.*)/s, { all: 1 });
      const match = re.exec('line1\\nline2');
      expect(match.groups.all).toBe('line1\\nline2');
    };"
  `);
});

test('028 JS Named Groups Regexes > flags > unicode flag', async () => {
  const source =
    "() => {\n        const re = /(?<emoji>.)/u;\n        const match = re.exec('\\u{1F600}');\n        expect(match.groups.emoji).toBe('\\u{1F600}');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(.)/u, { emoji: 1 });
      const match = re.exec('😀');
      expect(match.groups.emoji).toBe('😀');
    };"
  `);
});

test('029 JS Named Groups Regexes > flags > sticky flag', async () => {
  const source =
    "() => {\n        const re = /(?<ch>\\w)/y;\n        re.lastIndex = 2;\n        const match = re.exec('abcdef');\n        expect(match.groups.ch).toBe('c');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w)/y, { ch: 1 });
      re.lastIndex = 2;
      const match = re.exec('abcdef');
      expect(match.groups.ch).toBe('c');
    };"
  `);
});

test('030 [upstream xit] JS Named Groups Regexes > matchAll > matchAll returns groups on each match', async () => {
  const source =
    "() => {\n        const re = /(?<n>\\d+)/g;\n        const matches = [...'a1b22c333'.matchAll(re)];\n        expect(matches.length).toBe(3);\n        expect(matches[0].groups.n).toBe('1');\n        expect(matches[1].groups.n).toBe('22');\n        expect(matches[2].groups.n).toBe('333');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/g, { n: 1 });
      const matches = [...'a1b22c333'.matchAll(re)];
      expect(matches.length).toBe(3);
      expect(matches[0].groups.n).toBe('1');
      expect(matches[1].groups.n).toBe('22');
      expect(matches[2].groups.n).toBe('333');
    };"
  `);
});

test('031 [upstream xit] JS Named Groups Regexes > matchAll > matchAll with multiple named groups', async () => {
  const source =
    "() => {\n        const re = /(?<key>\\w+)=(?<val>\\w+)/g;\n        const matches = [...'a=1&b=2&c=3'.matchAll(re)];\n        expect(matches.length).toBe(3);\n        expect(matches[0].groups.key).toBe('a');\n        expect(matches[0].groups.val).toBe('1');\n        expect(matches[2].groups.key).toBe('c');\n        expect(matches[2].groups.val).toBe('3');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)=(\\w+)/g, {
        key: 1,
        val: 2,
      });
      const matches = [...'a=1&b=2&c=3'.matchAll(re)];
      expect(matches.length).toBe(3);
      expect(matches[0].groups.key).toBe('a');
      expect(matches[0].groups.val).toBe('1');
      expect(matches[2].groups.key).toBe('c');
      expect(matches[2].groups.val).toBe('3');
    };"
  `);
});

test('032 JS Named Groups Regexes > optional and alternation groups > optional named group returns undefined when unmatched', async () => {
  const source =
    "() => {\n        const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;\n        const match = re.exec('readme');\n        expect(match.groups.required).toBe('readme');\n        expect(match.groups.ext).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {
        required: 1,
        ext: 2,
      });
      const match = re.exec('readme');
      expect(match.groups.required).toBe('readme');
      expect(match.groups.ext).toBe(undefined);
    };"
  `);
});

test('033 JS Named Groups Regexes > optional and alternation groups > optional named group returns value when matched', async () => {
  const source =
    "() => {\n        const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;\n        const match = re.exec('readme.md');\n        expect(match.groups.required).toBe('readme');\n        expect(match.groups.ext).toBe('md');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {
        required: 1,
        ext: 2,
      });
      const match = re.exec('readme.md');
      expect(match.groups.required).toBe('readme');
      expect(match.groups.ext).toBe('md');
    };"
  `);
});

test('034 JS Named Groups Regexes > optional and alternation groups > alternation with named groups', async () => {
  const source =
    "() => {\n        const re = /(?<hex>#[0-9a-f]{6})|(?<rgb>rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\))/i;\n        const hexMatch = re.exec('#ff0000');\n        expect(hexMatch.groups.hex).toBe('#ff0000');\n        expect(hexMatch.groups.rgb).toBe(undefined);\n\n        const rgbMatch = re.exec('rgb(255, 0, 0)');\n        expect(rgbMatch.groups.rgb).toBe('rgb(255, 0, 0)');\n        expect(rgbMatch.groups.hex).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(#[0-9a-f]{6})|(rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\))/i, {
        hex: 1,
        rgb: 2,
      });
      const hexMatch = re.exec('#ff0000');
      expect(hexMatch.groups.hex).toBe('#ff0000');
      expect(hexMatch.groups.rgb).toBe(undefined);
      const rgbMatch = re.exec('rgb(255, 0, 0)');
      expect(rgbMatch.groups.rgb).toBe('rgb(255, 0, 0)');
      expect(rgbMatch.groups.hex).toBe(undefined);
    };"
  `);
});

test('035 JS Named Groups Regexes > optional and alternation groups > named group in one branch of alternation', async () => {
  const source =
    "() => {\n        const re = /(?:(?<a>foo)|bar)/;\n        const m1 = re.exec('foo');\n        expect(m1.groups.a).toBe('foo');\n        const m2 = re.exec('bar');\n        expect(m2.groups.a).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(?:(foo)|bar)/, { a: 1 });
      const m1 = re.exec('foo');
      expect(m1.groups.a).toBe('foo');
      const m2 = re.exec('bar');
      expect(m2.groups.a).toBe(undefined);
    };"
  `);
});

test('036 JS Named Groups Regexes > mixed named and unnamed groups > unnamed groups do not appear in groups object', async () => {
  const source =
    "() => {\n        const re = /(\\d+)-(?<named>\\w+)/;\n        const match = re.exec('123-abc');\n        expect(match[1]).toBe('123');\n        expect(match[2]).toBe('abc');\n        expect(match.groups.named).toBe('abc');\n        expect(Object.keys(match.groups).length).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)-(\\w+)/, { named: 2 });
      const match = re.exec('123-abc');
      expect(match[1]).toBe('123');
      expect(match[2]).toBe('abc');
      expect(match.groups.named).toBe('abc');
      expect(Object.keys(match.groups).length).toBe(1);
    };"
  `);
});

test('037 JS Named Groups Regexes > mixed named and unnamed groups > non-capturing groups are transparent', async () => {
  const source =
    "() => {\n        const re = /(?:prefix_)(?<value>\\w+)/;\n        const match = re.exec('prefix_hello');\n        expect(match.groups.value).toBe('hello');\n        expect(match[1]).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(?:prefix_)(\\w+)/, { value: 1 });
      const match = re.exec('prefix_hello');
      expect(match.groups.value).toBe('hello');
      expect(match[1]).toBe('hello');
    };"
  `);
});

test('038 JS Named Groups Regexes > mixed named and unnamed groups > nested named group inside unnamed group', async () => {
  const source =
    "() => {\n        const re = /((?<inner>\\d+))/;\n        const match = re.exec('42');\n        expect(match[1]).toBe('42');\n        expect(match.groups.inner).toBe('42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/((\\d+))/, { inner: 2 });
      const match = re.exec('42');
      expect(match[1]).toBe('42');
      expect(match.groups.inner).toBe('42');
    };"
  `);
});

test('039 JS Named Groups Regexes > string search and split > search() works with named groups', async () => {
  const source =
    "() => {\n        const re = /(?<word>\\bhello\\b)/;\n        const idx = 'say hello there'.search(re);\n        expect(idx).toBe(4);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\bhello\\b)/, { word: 1 });
      const idx = 'say hello there'.search(re);
      expect(idx).toBe(4);
    };"
  `);
});

test('040 JS Named Groups Regexes > string search and split > split() with named capturing group retains captures', async () => {
  const source =
    "() => {\n        const re = /(?<sep>[,;])/;\n        const parts = 'a,b;c'.split(re);\n        // split includes capturing group matches\n        expect(parts).toEqual(['a', ',', 'b', ';', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([,;])/, { sep: 1 });
      const parts = 'a,b;c'.split(re);
      // split includes capturing group matches
      expect(parts).toEqual(['a', ',', 'b', ';', 'c']);
    };"
  `);
});

test('041 JS Named Groups Regexes > destructuring groups > destructure groups from exec result', async () => {
  const source =
    "() => {\n        const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\n        const {\n          groups: { year, month, day },\n        } = re.exec('2025-05-01');\n        expect(year).toBe('2025');\n        expect(month).toBe('05');\n        expect(day).toBe('01');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/, {
        month: 2,
        day: 3,
        year: 1,
      });
      const {
        groups: { year, month, day },
      } = re.exec('2025-05-01');
      expect(year).toBe('2025');
      expect(month).toBe('05');
      expect(day).toBe('01');
    };"
  `);
});

test('042 JS Named Groups Regexes > destructuring groups > destructure with default for optional group', async () => {
  const source =
    "() => {\n        const re = /(?<host>[^:]+)(?::(?<port>\\d+))?/;\n        const {\n          groups: { host, port = '80' },\n        } = re.exec('example.com');\n        expect(host).toBe('example.com');\n        expect(port).toBe('80');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([^:]+)(?::(\\d+))?/, {
        host: 1,
        port: 2,
      });
      const {
        groups: { host, port = '80' },
      } = re.exec('example.com');
      expect(host).toBe('example.com');
      expect(port).toBe('80');
    };"
  `);
});

test('043 JS Named Groups Regexes > edge cases > empty string match', async () => {
  const source =
    "() => {\n        const re = /(?<empty>)/;\n        const match = re.exec('anything');\n        expect(match.groups.empty).toBe('');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/()/, { empty: 1 });
      const match = re.exec('anything');
      expect(match.groups.empty).toBe('');
    };"
  `);
});

test('044 JS Named Groups Regexes > edge cases > group name with underscores and digits', async () => {
  const source =
    "() => {\n        const re = /(?<my_group_1>\\w+)/;\n        const match = re.exec('hello');\n        expect(match.groups.my_group_1).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)/, { my_group_1: 1 });
      const match = re.exec('hello');
      expect(match.groups.my_group_1).toBe('hello');
    };"
  `);
});

test('045 JS Named Groups Regexes > edge cases > group name with dollar sign', async () => {
  const source =
    "() => {\n        const re = /(?<$val>\\d+)/;\n        const match = re.exec('42');\n        expect(match.groups.$val).toBe('42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/, { $val: 1 });
      const match = re.exec('42');
      expect(match.groups.$val).toBe('42');
    };"
  `);
});

test('046 JS Named Groups Regexes > edge cases > very long match in named group', async () => {
  const source =
    "() => {\n        const long = 'a'.repeat(10000);\n        const re = /(?<all>.+)/s;\n        const match = re.exec(long);\n        expect(match.groups.all.length).toBe(10000);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const long = 'a'.repeat(1e4);
      const re = _wrapRegExp(/(.+)/s, { all: 1 });
      const match = re.exec(long);
      expect(match.groups.all.length).toBe(1e4);
    };"
  `);
});

test('047 JS Named Groups Regexes > edge cases > named group with quantifier', async () => {
  const source =
    "() => {\n        const re = /(?<digits>\\d+)/;\n        const match = re.exec('abc123def');\n        expect(match.groups.digits).toBe('123');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/, { digits: 1 });
      const match = re.exec('abc123def');
      expect(match.groups.digits).toBe('123');
    };"
  `);
});

test('048 JS Named Groups Regexes > edge cases > named group captures last iteration of quantified group', async () => {
  const source =
    "() => {\n        const re = /(?:(?<ch>\\w))+/;\n        const match = re.exec('abcd');\n        // A repeated capturing group only keeps the last match\n        expect(match.groups.ch).toBe('d');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(?:(\\w))+/, { ch: 1 });
      const match = re.exec('abcd');
      // A repeated capturing group only keeps the last match
      expect(match.groups.ch).toBe('d');
    };"
  `);
});

test('049 JS Named Groups Regexes > edge cases > lookahead does not interfere with named groups', async () => {
  const source =
    "() => {\n        const re = /(?<word>\\w+)(?=\\s)/;\n        const match = re.exec('hello world');\n        expect(match.groups.word).toBe('hello');\n        expect(match[0]).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\w+)(?=\\s)/, { word: 1 });
      const match = re.exec('hello world');
      expect(match.groups.word).toBe('hello');
      expect(match[0]).toBe('hello');
    };"
  `);
});

test('050 JS Named Groups Regexes > edge cases > lookbehind does not interfere with named groups', async () => {
  const source =
    "() => {\n        const re = /(?<=\\s)(?<word>\\w+)/;\n        const match = re.exec('hello world');\n        expect(match.groups.word).toBe('world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(?<=\\s)(\\w+)/, { word: 1 });
      const match = re.exec('hello world');
      expect(match.groups.word).toBe('world');
    };"
  `);
});

test('051 JS Named Groups Regexes > edge cases > regex constructed with new RegExp also supports named groups', async () => {
  const source =
    "() => {\n        const re = new RegExp('(?<n>\\\\d+)');\n        const match = re.exec('42');\n        expect(match.groups.n).toBe('42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = new RegExp('(?<n>\\\\d+)');
      const match = re.exec('42');
      expect(match.groups.n).toBe('42');
    };"
  `);
});

test('052 [upstream xit] JS Named Groups Regexes > edge cases > named group in replace with special characters in replacement', async () => {
  const source =
    "() => {\n        const re = /(?<val>\\d+)/;\n        const result = '42'.replace(re, '$$<val>');\n        // $$ is a literal $, so result should be literal \"$<val>\"\n        expect(result).toBe('$<val>');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d+)/, { val: 1 });
      const result = '42'.replace(re, '$$<val>');
      // $$ is a literal $, so result should be literal "$<val>"
      expect(result).toBe('$<val>');
    };"
  `);
});

test('053 JS Named Groups Regexes > edge cases > incomplete $< in replacement is literal', async () => {
  const source =
    "() => {\n        const re = /(?<a>x)/;\n        // $< without closing > is treated as literal by the wrapRegExp helper\n        const result = 'x'.replace(re, '$<a');\n        expect(result).toBe('$<a');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(x)/, { a: 1 });
      // $< without closing > is treated as literal by the wrapRegExp helper
      const result = 'x'.replace(re, '$<a');
      expect(result).toBe('$<a');
    };"
  `);
});

test('054 JS Named Groups Regexes > practical patterns > parse semver version string', async () => {
  const source =
    "() => {\n        const re =\n          /^(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)(?:-(?<pre>[a-z0-9.]+))?(?:\\+(?<build>[a-z0-9.]+))?$/i;\n        const m1 = re.exec('1.2.3');\n        expect(m1.groups.major).toBe('1');\n        expect(m1.groups.minor).toBe('2');\n        expect(m1.groups.patch).toBe('3');\n        expect(m1.groups.pre).toBe(undefined);\n\n        const m2 = re.exec('1.0.0-beta.1+build.42');\n        expect(m2.groups.pre).toBe('beta.1');\n        expect(m2.groups.build).toBe('build.42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:-([a-z0-9.]+))?(?:\\+([a-z0-9.]+))?$/i, {
        patch: 3,
        major: 1,
        build: 5,
        minor: 2,
        pre: 4,
      });
      const m1 = re.exec('1.2.3');
      expect(m1.groups.major).toBe('1');
      expect(m1.groups.minor).toBe('2');
      expect(m1.groups.patch).toBe('3');
      expect(m1.groups.pre).toBe(undefined);
      const m2 = re.exec('1.0.0-beta.1+build.42');
      expect(m2.groups.pre).toBe('beta.1');
      expect(m2.groups.build).toBe('build.42');
    };"
  `);
});

test('055 JS Named Groups Regexes > practical patterns > parse email-like address', async () => {
  const source =
    "() => {\n        const re = /(?<user>[^@]+)@(?<domain>[^.]+)\\.(?<tld>\\w+)/;\n        const match = re.exec('user@example.com');\n        expect(match.groups.user).toBe('user');\n        expect(match.groups.domain).toBe('example');\n        expect(match.groups.tld).toBe('com');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([^@]+)@([^.]+)\\.(\\w+)/, {
        tld: 3,
        user: 1,
        domain: 2,
      });
      const match = re.exec('user@example.com');
      expect(match.groups.user).toBe('user');
      expect(match.groups.domain).toBe('example');
      expect(match.groups.tld).toBe('com');
    };"
  `);
});

test('056 JS Named Groups Regexes > practical patterns > extract key-value pairs from query string', async () => {
  const source =
    "() => {\n        const re = /(?<key>[^=&]+)=(?<value>[^&]*)/g;\n        const str = 'foo=bar&baz=qux&n=42';\n        const pairs = {};\n        let m;\n        while ((m = re.exec(str)) !== null) {\n          pairs[m.groups.key] = m.groups.value;\n        }\n        expect(pairs).toEqual({ foo: 'bar', baz: 'qux', n: '42' });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/([^=&]+)=([^&]*)/g, {
        value: 2,
        key: 1,
      });
      const str = 'foo=bar&baz=qux&n=42';
      const pairs = {};
      let m;
      while ((m = re.exec(str)) !== null) {
        pairs[m.groups.key] = m.groups.value;
      }
      expect(pairs).toEqual({
        foo: 'bar',
        baz: 'qux',
        n: '42',
      });
    };"
  `);
});

test('057 JS Named Groups Regexes > practical patterns > reformat dates with replace', async () => {
  const source =
    "() => {\n        const re = /(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/g;\n        const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');\n        expect(result).toBe('From 01/05/2025 to 31/12/2025');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/g, {
        m: 2,
        d: 3,
        y: 1,
      });
      const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');
      expect(result).toBe('From 01/05/2025 to 31/12/2025');
    };"
  `);
});

test('058 JS Named Groups Regexes > practical patterns > CSS hex color extraction', async () => {
  const source =
    "() => {\n        const re = /#(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})/i;\n        const match = re.exec('#FF8800');\n        expect(match.groups.r).toBe('FF');\n        expect(match.groups.g).toBe('88');\n        expect(match.groups.b).toBe('00');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, {
        g: 2,
        r: 1,
        b: 3,
      });
      const match = re.exec('#FF8800');
      expect(match.groups.r).toBe('FF');
      expect(match.groups.g).toBe('88');
      expect(match.groups.b).toBe('00');
    };"
  `);
});

test('059 JS Named Groups Regexes > practical patterns > log line parsing', async () => {
  const source =
    "() => {\n        const re = /\\[(?<level>\\w+)\\] (?<ts>\\d{4}-\\d{2}-\\d{2}T[\\d:]+) (?<msg>.*)/;\n        const match = re.exec('[ERROR] 2025-05-01T12:00:00 Something failed');\n        expect(match.groups.level).toBe('ERROR');\n        expect(match.groups.ts).toBe('2025-05-01T12:00:00');\n        expect(match.groups.msg).toBe('Something failed');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    () => {
      const re = _wrapRegExp(/\\[(\\w+)\\] (\\d{4}-\\d{2}-\\d{2}T[\\d:]+) (.*)/, {
        ts: 2,
        msg: 3,
        level: 1,
      });
      const match = re.exec('[ERROR] 2025-05-01T12:00:00 Something failed');
      expect(match.groups.level).toBe('ERROR');
      expect(match.groups.ts).toBe('2025-05-01T12:00:00');
      expect(match.groups.msg).toBe('Something failed');
    };"
  `);
});
