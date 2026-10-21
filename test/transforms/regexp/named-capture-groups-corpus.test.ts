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
      regexpNamedCaptureGroups: true,
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'basic named groups > exec() returns groups object',
    source: `() => {
        const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
        const match = re.exec('2025-05-01');
        expect(match).not.toBe(null);
        expect(match.groups.year).toBe('2025');
        expect(match.groups.month).toBe('05');
        expect(match.groups.day).toBe('01');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'basic named groups > match() returns groups object',
    source: `() => {
        const re = /(?<greeting>hello) (?<target>world)/;
        const match = 'hello world'.match(re);
        expect(match.groups.greeting).toBe('hello');
        expect(match.groups.target).toBe('world');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(hello) (world)/, {
    target: 2,
    greeting: 1,
  });
  const match = 'hello world'.match(re);
  expect(match.groups.greeting).toBe('hello');
  expect(match.groups.target).toBe('world');
};`,
  },
  {
    title: 'basic named groups > single named group',
    source: `() => {
        const re = /(?<name>\\w+)/;
        const match = re.exec('foobar');
        expect(match.groups.name).toBe('foobar');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+)/, { name: 1 });
  const match = re.exec('foobar');
  expect(match.groups.name).toBe('foobar');
};`,
  },
  {
    title: 'basic named groups > named group with no match returns null',
    source: `() => {
        const re = /(?<year>\\d{4})/;
        const match = re.exec('no digits here');
        expect(match).toBe(null);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d{4})/, { year: 1 });
  const match = re.exec('no digits here');
  expect(match).toBe(null);
};`,
  },
  {
    title: 'basic named groups > groups is a null-prototype object',
    source: `() => {
        const re = /(?<a>x)/;
        const match = re.exec('x');
        expect(match.groups.a).toBe('x');
        // groups should not inherit from Object.prototype
        expect(match.groups.hasOwnProperty).toBe(undefined);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(x)/, { a: 1 });
  const match = re.exec('x');
  expect(match.groups.a).toBe('x');
  // groups should not inherit from Object.prototype
  expect(match.groups.hasOwnProperty).toBe(undefined);
};`,
  },
  {
    title: 'basic named groups > numbered capture still works alongside named',
    source: `() => {
        const re = /(?<first>\\w+) (\\w+)/;
        const match = re.exec('hello world');
        expect(match[1]).toBe('hello');
        expect(match[2]).toBe('world');
        expect(match.groups.first).toBe('hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+) (\\w+)/, { first: 1 });
  const match = re.exec('hello world');
  expect(match[1]).toBe('hello');
  expect(match[2]).toBe('world');
  expect(match.groups.first).toBe('hello');
};`,
  },
  {
    title: 'multiple named groups > three groups',
    source: `() => {
        const re = /(?<r>\\d+)\\.(?<g>\\d+)\\.(?<b>\\d+)/;
        const match = re.exec('255.128.0');
        expect(match.groups.r).toBe('255');
        expect(match.groups.g).toBe('128');
        expect(match.groups.b).toBe('0');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'multiple named groups > groups with different character classes',
    source: `() => {
        const re = /(?<letters>[a-z]+)(?<digits>\\d+)(?<rest>.*)/;
        const match = re.exec('abc123!@#');
        expect(match.groups.letters).toBe('abc');
        expect(match.groups.digits).toBe('123');
        expect(match.groups.rest).toBe('!@#');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'multiple named groups > five groups',
    source: `() => {
        const re =
          /(?<proto>\\w+):\\/\\/(?<host>[^/:]+)(?::(?<port>\\d+))?(?<path>\\/[^?]*)?(?:\\?(?<query>.*))?/;
        const match = re.exec('https://example.com:8080/path?q=1');
        expect(match.groups.proto).toBe('https');
        expect(match.groups.host).toBe('example.com');
        expect(match.groups.port).toBe('8080');
        expect(match.groups.path).toBe('/path');
        expect(match.groups.query).toBe('q=1');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'backreferences > \\k<name> matches same text as named group',
    source: `() => {
        const re = /(?<quote>['"]).*?\\k<quote>/;
        expect(re.test("'hello'")).toBe(true);
        expect(re.test('"hello"')).toBe(true);
        expect(re.test('\\'hello"')).toBe(false);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(['"]).*?\\1/, { quote: 1 });
  expect(re.test("'hello'")).toBe(true);
  expect(re.test('"hello"')).toBe(true);
  expect(re.test('\\'hello"')).toBe(false);
};`,
  },
  {
    title: 'backreferences > \\k<name> with exec',
    source: `() => {
        const re = /^(?<tag>\\w+).*\\k<tag>$/;
        const match = re.exec('div content div');
        expect(match).not.toBe(null);
        expect(match.groups.tag).toBe('div');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/^(\\w+).*\\1$/, { tag: 1 });
  const match = re.exec('div content div');
  expect(match).not.toBe(null);
  expect(match.groups.tag).toBe('div');
};`,
  },
  {
    title: 'backreferences > \\k<name> fails when group content differs',
    source: `() => {
        const re = /^(?<word>\\w+) \\k<word>$/;
        expect(re.test('abc abc')).toBe(true);
        expect(re.test('abc def')).toBe(false);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/^(\\w+) \\1$/, { word: 1 });
  expect(re.test('abc abc')).toBe(true);
  expect(re.test('abc def')).toBe(false);
};`,
  },
  {
    title: 'backreferences > multiple backreferences',
    source: `() => {
        const re = /(?<a>\\w)(?<b>\\w) \\k<a>\\k<b>/;
        const match = re.exec('ab ab');
        expect(match).not.toBe(null);
        expect(match.groups.a).toBe('a');
        expect(match.groups.b).toBe('b');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'string replace with named groups > $<name> in replacement string',
    source: `() => {
        const re = /(?<first>\\w+) (?<second>\\w+)/;
        const result = 'hello world'.replace(re, '$<second> $<first>');
        expect(result).toBe('world hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+) (\\w+)/, {
    second: 2,
    first: 1,
  });
  const result = 'hello world'.replace(re, '$<second> $<first>');
  expect(result).toBe('world hello');
};`,
  },
  {
    title: 'string replace with named groups > $<name> with date reformatting',
    source: `() => {
        const re = /(?<month>\\d{2})\\/(?<day>\\d{2})\\/(?<year>\\d{4})/;
        const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');
        expect(result).toBe('2025-05-01');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, {
    month: 1,
    year: 3,
    day: 2,
  });
  const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');
  expect(result).toBe('2025-05-01');
};`,
  },
  {
    title: 'string replace with named groups > $<name> with global flag replaces all',
    source: `() => {
        const re = /(?<vowel>[aeiou])/g;
        const result = 'hello'.replace(re, '[$<vowel>]');
        expect(result).toBe('h[e]ll[o]');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/([aeiou])/g, { vowel: 1 });
  const result = 'hello'.replace(re, '[$<vowel>]');
  expect(result).toBe('h[e]ll[o]');
};`,
  },
  {
    title: 'string replace with named groups > $<nonexistent> produces empty string',
    source: `() => {
        const re = /(?<a>x)/;
        const result = 'x'.replace(re, '$<a>$<b>');
        // $<b> doesn't match a named group, should produce empty string
        expect(result).toBe('x');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(x)/, { a: 1 });
  const result = 'x'.replace(re, '$<a>$<b>');
  // $<b> doesn't match a named group, should produce empty string
  expect(result).toBe('x');
};`,
  },
  {
    title: 'string replace with named groups > replace function receives groups as last argument',
    source: `() => {
        const re = /(?<first>\\w+) (?<second>\\w+)/;
        let capturedGroups = null;
        'hello world'.replace(re, function () {
          capturedGroups = arguments[arguments.length - 1];
        });
        expect(capturedGroups).not.toBe(null);
        expect(capturedGroups.first).toBe('hello');
        expect(capturedGroups.second).toBe('world');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'string replace with named groups > replace function return value is used',
    source: `() => {
        const re = /(?<n>\\d+)/g;
        const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {
          return String(Number(groups.n) * 2);
        });
        expect(result).toBe('a2b4c6');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)/g, { n: 1 });
  const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {
    return String(Number(groups.n) * 2);
  });
  expect(result).toBe('a2b4c6');
};`,
  },
  {
    title: 'string replace with named groups > numbered references $1 $2 still work',
    source: `() => {
        const re = /(?<a>\\w+) (?<b>\\w+)/;
        const result = 'hello world'.replace(re, '$2 $1');
        expect(result).toBe('world hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+) (\\w+)/, {
    a: 1,
    b: 2,
  });
  const result = 'hello world'.replace(re, '$2 $1');
  expect(result).toBe('world hello');
};`,
  },
  {
    title: 'test() method > test() works with named groups',
    source: `() => {
        const re = /(?<year>\\d{4})/;
        expect(re.test('2025')).toBe(true);
        expect(re.test('nope')).toBe(false);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d{4})/, { year: 1 });
  expect(re.test('2025')).toBe(true);
  expect(re.test('nope')).toBe(false);
};`,
  },
  {
    title: 'test() method > test() with backreference',
    source: `() => {
        const re = /(?<char>.)\\k<char>/;
        expect(re.test('aa')).toBe(true);
        expect(re.test('ab')).toBe(false);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(.)\\1/, { char: 1 });
  expect(re.test('aa')).toBe(true);
  expect(re.test('ab')).toBe(false);
};`,
  },
  {
    title: 'test() method > test() with global flag advances lastIndex',
    source: `() => {
        const re = /(?<d>\\d)/g;
        const str = 'a1b2c3';
        expect(re.test(str)).toBe(true);
        expect(re.lastIndex).toBe(2);
        expect(re.test(str)).toBe(true);
        expect(re.lastIndex).toBe(4);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d)/g, { d: 1 });
  const str = 'a1b2c3';
  expect(re.test(str)).toBe(true);
  expect(re.lastIndex).toBe(2);
  expect(re.test(str)).toBe(true);
  expect(re.lastIndex).toBe(4);
};`,
  },
  {
    title: 'flags > case-insensitive flag',
    source: `() => {
        const re = /(?<word>[a-z]+)/i;
        const match = re.exec('HELLO');
        expect(match.groups.word).toBe('HELLO');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/([a-z]+)/i, { word: 1 });
  const match = re.exec('HELLO');
  expect(match.groups.word).toBe('HELLO');
};`,
  },
  {
    title: 'flags > global flag with exec iteration',
    source: `() => {
        const re = /(?<num>\\d+)/g;
        const str = 'a1b22c333';
        const results = [];
        let m;
        while ((m = re.exec(str)) !== null) {
          results.push(m.groups.num);
        }
        expect(results).toEqual(['1', '22', '333']);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'flags > multiline flag',
    source: `() => {
        const re = /^(?<first>\\w+)/gm;
        const str = 'hello\\nworld\\nfoo';
        const results = [];
        let m;
        while ((m = re.exec(str)) !== null) {
          results.push(m.groups.first);
        }
        expect(results).toEqual(['hello', 'world', 'foo']);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'flags > dotAll flag',
    source: `() => {
        const re = /(?<all>.*)/s;
        const match = re.exec('line1\\nline2');
        expect(match.groups.all).toBe('line1\\nline2');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(.*)/s, { all: 1 });
  const match = re.exec('line1\\nline2');
  expect(match.groups.all).toBe('line1\\nline2');
};`,
  },
  {
    title: 'flags > unicode flag',
    source: `() => {
        const re = /(?<emoji>.)/u;
        const match = re.exec('\\u{1F600}');
        expect(match.groups.emoji).toBe('\\u{1F600}');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(.)/u, { emoji: 1 });
  const match = re.exec('😀');
  expect(match.groups.emoji).toBe('😀');
};`,
  },
  {
    title: 'flags > sticky flag',
    source: `() => {
        const re = /(?<ch>\\w)/y;
        re.lastIndex = 2;
        const match = re.exec('abcdef');
        expect(match.groups.ch).toBe('c');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w)/y, { ch: 1 });
  re.lastIndex = 2;
  const match = re.exec('abcdef');
  expect(match.groups.ch).toBe('c');
};`,
  },
  {
    title: 'matchAll > matchAll returns groups on each match',
    source: `() => {
        const re = /(?<n>\\d+)/g;
        const matches = [...'a1b22c333'.matchAll(re)];
        expect(matches.length).toBe(3);
        expect(matches[0].groups.n).toBe('1');
        expect(matches[1].groups.n).toBe('22');
        expect(matches[2].groups.n).toBe('333');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)/g, { n: 1 });
  const matches = [...'a1b22c333'.matchAll(re)];
  expect(matches.length).toBe(3);
  expect(matches[0].groups.n).toBe('1');
  expect(matches[1].groups.n).toBe('22');
  expect(matches[2].groups.n).toBe('333');
};`,
  },
  {
    title: 'matchAll > matchAll with multiple named groups',
    source: `() => {
        const re = /(?<key>\\w+)=(?<val>\\w+)/g;
        const matches = [...'a=1&b=2&c=3'.matchAll(re)];
        expect(matches.length).toBe(3);
        expect(matches[0].groups.key).toBe('a');
        expect(matches[0].groups.val).toBe('1');
        expect(matches[2].groups.key).toBe('c');
        expect(matches[2].groups.val).toBe('3');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title:
      'optional and alternation groups > optional named group returns undefined when unmatched',
    source: `() => {
        const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;
        const match = re.exec('readme');
        expect(match.groups.required).toBe('readme');
        expect(match.groups.ext).toBe(undefined);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {
    required: 1,
    ext: 2,
  });
  const match = re.exec('readme');
  expect(match.groups.required).toBe('readme');
  expect(match.groups.ext).toBe(undefined);
};`,
  },
  {
    title: 'optional and alternation groups > optional named group returns value when matched',
    source: `() => {
        const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;
        const match = re.exec('readme.md');
        expect(match.groups.required).toBe('readme');
        expect(match.groups.ext).toBe('md');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {
    required: 1,
    ext: 2,
  });
  const match = re.exec('readme.md');
  expect(match.groups.required).toBe('readme');
  expect(match.groups.ext).toBe('md');
};`,
  },
  {
    title: 'optional and alternation groups > alternation with named groups',
    source: `() => {
        const re = /(?<hex>#[0-9a-f]{6})|(?<rgb>rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\))/i;
        const hexMatch = re.exec('#ff0000');
        expect(hexMatch.groups.hex).toBe('#ff0000');
        expect(hexMatch.groups.rgb).toBe(undefined);
     \x20
        const rgbMatch = re.exec('rgb(255, 0, 0)');
        expect(rgbMatch.groups.rgb).toBe('rgb(255, 0, 0)');
        expect(rgbMatch.groups.hex).toBe(undefined);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'optional and alternation groups > named group in one branch of alternation',
    source: `() => {
        const re = /(?:(?<a>foo)|bar)/;
        const m1 = re.exec('foo');
        expect(m1.groups.a).toBe('foo');
        const m2 = re.exec('bar');
        expect(m2.groups.a).toBe(undefined);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(?:(foo)|bar)/, { a: 1 });
  const m1 = re.exec('foo');
  expect(m1.groups.a).toBe('foo');
  const m2 = re.exec('bar');
  expect(m2.groups.a).toBe(undefined);
};`,
  },
  {
    title: 'mixed named and unnamed groups > unnamed groups do not appear in groups object',
    source: `() => {
        const re = /(\\d+)-(?<named>\\w+)/;
        const match = re.exec('123-abc');
        expect(match[1]).toBe('123');
        expect(match[2]).toBe('abc');
        expect(match.groups.named).toBe('abc');
        expect(Object.keys(match.groups).length).toBe(1);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)-(\\w+)/, { named: 2 });
  const match = re.exec('123-abc');
  expect(match[1]).toBe('123');
  expect(match[2]).toBe('abc');
  expect(match.groups.named).toBe('abc');
  expect(Object.keys(match.groups).length).toBe(1);
};`,
  },
  {
    title: 'mixed named and unnamed groups > non-capturing groups are transparent',
    source: `() => {
        const re = /(?:prefix_)(?<value>\\w+)/;
        const match = re.exec('prefix_hello');
        expect(match.groups.value).toBe('hello');
        expect(match[1]).toBe('hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(?:prefix_)(\\w+)/, { value: 1 });
  const match = re.exec('prefix_hello');
  expect(match.groups.value).toBe('hello');
  expect(match[1]).toBe('hello');
};`,
  },
  {
    title: 'mixed named and unnamed groups > nested named group inside unnamed group',
    source: `() => {
        const re = /((?<inner>\\d+))/;
        const match = re.exec('42');
        expect(match[1]).toBe('42');
        expect(match.groups.inner).toBe('42');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/((\\d+))/, { inner: 2 });
  const match = re.exec('42');
  expect(match[1]).toBe('42');
  expect(match.groups.inner).toBe('42');
};`,
  },
  {
    title: 'string search and split > search() works with named groups',
    source: `() => {
        const re = /(?<word>\\bhello\\b)/;
        const idx = 'say hello there'.search(re);
        expect(idx).toBe(4);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\bhello\\b)/, { word: 1 });
  const idx = 'say hello there'.search(re);
  expect(idx).toBe(4);
};`,
  },
  {
    title: 'string search and split > split() with named capturing group retains captures',
    source: `() => {
        const re = /(?<sep>[,;])/;
        const parts = 'a,b;c'.split(re);
        // split includes capturing group matches
        expect(parts).toEqual(['a', ',', 'b', ';', 'c']);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/([,;])/, { sep: 1 });
  const parts = 'a,b;c'.split(re);
  // split includes capturing group matches
  expect(parts).toEqual(['a', ',', 'b', ';', 'c']);
};`,
  },
  {
    title: 'destructuring groups > destructure groups from exec result',
    source: `() => {
        const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
        const {
          groups: { year, month, day },
        } = re.exec('2025-05-01');
        expect(year).toBe('2025');
        expect(month).toBe('05');
        expect(day).toBe('01');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'destructuring groups > destructure with default for optional group',
    source: `() => {
        const re = /(?<host>[^:]+)(?::(?<port>\\d+))?/;
        const {
          groups: { host, port = '80' },
        } = re.exec('example.com');
        expect(host).toBe('example.com');
        expect(port).toBe('80');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'edge cases > empty string match',
    source: `() => {
        const re = /(?<empty>)/;
        const match = re.exec('anything');
        expect(match.groups.empty).toBe('');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/()/, { empty: 1 });
  const match = re.exec('anything');
  expect(match.groups.empty).toBe('');
};`,
  },
  {
    title: 'edge cases > group name with underscores and digits',
    source: `() => {
        const re = /(?<my_group_1>\\w+)/;
        const match = re.exec('hello');
        expect(match.groups.my_group_1).toBe('hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+)/, { my_group_1: 1 });
  const match = re.exec('hello');
  expect(match.groups.my_group_1).toBe('hello');
};`,
  },
  {
    title: 'edge cases > group name with dollar sign',
    source: `() => {
        const re = /(?<$val>\\d+)/;
        const match = re.exec('42');
        expect(match.groups.$val).toBe('42');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)/, { $val: 1 });
  const match = re.exec('42');
  expect(match.groups.$val).toBe('42');
};`,
  },
  {
    title: 'edge cases > very long match in named group',
    source: `() => {
        const long = 'a'.repeat(10000);
        const re = /(?<all>.+)/s;
        const match = re.exec(long);
        expect(match.groups.all.length).toBe(10000);
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const long = 'a'.repeat(1e4);
  const re = _wrapRegExp(/(.+)/s, { all: 1 });
  const match = re.exec(long);
  expect(match.groups.all.length).toBe(1e4);
};`,
  },
  {
    title: 'edge cases > named group with quantifier',
    source: `() => {
        const re = /(?<digits>\\d+)/;
        const match = re.exec('abc123def');
        expect(match.groups.digits).toBe('123');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)/, { digits: 1 });
  const match = re.exec('abc123def');
  expect(match.groups.digits).toBe('123');
};`,
  },
  {
    title: 'edge cases > named group captures last iteration of quantified group',
    source: `() => {
        const re = /(?:(?<ch>\\w))+/;
        const match = re.exec('abcd');
        // A repeated capturing group only keeps the last match
        expect(match.groups.ch).toBe('d');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(?:(\\w))+/, { ch: 1 });
  const match = re.exec('abcd');
  // A repeated capturing group only keeps the last match
  expect(match.groups.ch).toBe('d');
};`,
  },
  {
    title: 'edge cases > lookahead does not interfere with named groups',
    source: `() => {
        const re = /(?<word>\\w+)(?=\\s)/;
        const match = re.exec('hello world');
        expect(match.groups.word).toBe('hello');
        expect(match[0]).toBe('hello');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\w+)(?=\\s)/, { word: 1 });
  const match = re.exec('hello world');
  expect(match.groups.word).toBe('hello');
  expect(match[0]).toBe('hello');
};`,
  },
  {
    title: 'edge cases > lookbehind does not interfere with named groups',
    source: `() => {
        const re = /(?<=\\s)(?<word>\\w+)/;
        const match = re.exec('hello world');
        expect(match.groups.word).toBe('world');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(?<=\\s)(\\w+)/, { word: 1 });
  const match = re.exec('hello world');
  expect(match.groups.word).toBe('world');
};`,
  },
  {
    title: 'edge cases > regex constructed with new RegExp also supports named groups',
    source: `() => {
        const re = new RegExp('(?<n>\\\\d+)');
        const match = re.exec('42');
        expect(match.groups.n).toBe('42');
      }`,
    output: `() => {
  const re = new RegExp('(?<n>\\\\d+)');
  const match = re.exec('42');
  expect(match.groups.n).toBe('42');
};`,
  },
  {
    title: 'edge cases > named group in replace with special characters in replacement',
    source: `() => {
        const re = /(?<val>\\d+)/;
        const result = '42'.replace(re, '$$<val>');
        // $$ is a literal $, so result should be literal "$<val>"
        expect(result).toBe('$<val>');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d+)/, { val: 1 });
  const result = '42'.replace(re, '$$<val>');
  // $$ is a literal $, so result should be literal "$<val>"
  expect(result).toBe('$<val>');
};`,
  },
  {
    title: 'edge cases > incomplete $< in replacement is literal',
    source: `() => {
        const re = /(?<a>x)/;
        // $< without closing > is treated as literal by the wrapRegExp helper
        const result = 'x'.replace(re, '$<a');
        expect(result).toBe('$<a');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(x)/, { a: 1 });
  // $< without closing > is treated as literal by the wrapRegExp helper
  const result = 'x'.replace(re, '$<a');
  expect(result).toBe('$<a');
};`,
  },
  {
    title: 'practical patterns > parse semver version string',
    source: `() => {
        const re =
          /^(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)(?:-(?<pre>[a-z0-9.]+))?(?:\\+(?<build>[a-z0-9.]+))?$/i;
        const m1 = re.exec('1.2.3');
        expect(m1.groups.major).toBe('1');
        expect(m1.groups.minor).toBe('2');
        expect(m1.groups.patch).toBe('3');
        expect(m1.groups.pre).toBe(undefined);
     \x20
        const m2 = re.exec('1.0.0-beta.1+build.42');
        expect(m2.groups.pre).toBe('beta.1');
        expect(m2.groups.build).toBe('build.42');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'practical patterns > parse email-like address',
    source: `() => {
        const re = /(?<user>[^@]+)@(?<domain>[^.]+)\\.(?<tld>\\w+)/;
        const match = re.exec('user@example.com');
        expect(match.groups.user).toBe('user');
        expect(match.groups.domain).toBe('example');
        expect(match.groups.tld).toBe('com');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'practical patterns > extract key-value pairs from query string',
    source: `() => {
        const re = /(?<key>[^=&]+)=(?<value>[^&]*)/g;
        const str = 'foo=bar&baz=qux&n=42';
        const pairs = {};
        let m;
        while ((m = re.exec(str)) !== null) {
          pairs[m.groups.key] = m.groups.value;
        }
        expect(pairs).toEqual({ foo: 'bar', baz: 'qux', n: '42' });
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'practical patterns > reformat dates with replace',
    source: `() => {
        const re = /(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/g;
        const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');
        expect(result).toBe('From 01/05/2025 to 31/12/2025');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
() => {
  const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/g, {
    m: 2,
    d: 3,
    y: 1,
  });
  const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');
  expect(result).toBe('From 01/05/2025 to 31/12/2025');
};`,
  },
  {
    title: 'practical patterns > CSS hex color extraction',
    source: `() => {
        const re = /#(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})/i;
        const match = re.exec('#FF8800');
        expect(match.groups.r).toBe('FF');
        expect(match.groups.g).toBe('88');
        expect(match.groups.b).toBe('00');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
  {
    title: 'practical patterns > log line parsing',
    source: `() => {
        const re = /\\[(?<level>\\w+)\\] (?<ts>\\d{4}-\\d{2}-\\d{2}T[\\d:]+) (?<msg>.*)/;
        const match = re.exec('[ERROR] 2025-05-01T12:00:00 Something failed');
        expect(match.groups.level).toBe('ERROR');
        expect(match.groups.ts).toBe('2025-05-01T12:00:00');
        expect(match.groups.msg).toBe('Something failed');
      }`,
    output: `var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
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
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
