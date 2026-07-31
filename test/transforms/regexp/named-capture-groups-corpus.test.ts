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
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'basic named groups > exec() returns groups object',
    "() => {\n  const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\n  const match = re.exec('2025-05-01');\n  expect(match).not.toBe(null);\n  expect(match.groups.year).toBe('2025');\n  expect(match.groups.month).toBe('05');\n  expect(match.groups.day).toBe('01');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/, {\n    month: 2,\n    day: 3,\n    year: 1,\n  });\n  const match = re.exec('2025-05-01');\n  expect(match).not.toBe(null);\n  expect(match.groups.year).toBe('2025');\n  expect(match.groups.month).toBe('05');\n  expect(match.groups.day).toBe('01');\n};",
  ],
  [
    'basic named groups > match() returns groups object',
    "() => {\n  const re = /(?<greeting>hello) (?<target>world)/;\n  const match = 'hello world'.match(re);\n  expect(match.groups.greeting).toBe('hello');\n  expect(match.groups.target).toBe('world');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(hello) (world)/, {\n    target: 2,\n    greeting: 1,\n  });\n  const match = 'hello world'.match(re);\n  expect(match.groups.greeting).toBe('hello');\n  expect(match.groups.target).toBe('world');\n};",
  ],
  [
    'basic named groups > single named group',
    "() => {\n  const re = /(?<name>\\w+)/;\n  const match = re.exec('foobar');\n  expect(match.groups.name).toBe('foobar');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)/, { name: 1 });\n  const match = re.exec('foobar');\n  expect(match.groups.name).toBe('foobar');\n};",
  ],
  [
    'basic named groups > named group with no match returns null',
    "() => {\n  const re = /(?<year>\\d{4})/;\n  const match = re.exec('no digits here');\n  expect(match).toBe(null);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{4})/, { year: 1 });\n  const match = re.exec('no digits here');\n  expect(match).toBe(null);\n};",
  ],
  [
    'basic named groups > groups is a null-prototype object',
    "() => {\n  const re = /(?<a>x)/;\n  const match = re.exec('x');\n  expect(match.groups.a).toBe('x');\n  // groups should not inherit from Object.prototype\n  expect(match.groups.hasOwnProperty).toBe(undefined);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(x)/, { a: 1 });\n  const match = re.exec('x');\n  expect(match.groups.a).toBe('x');\n  // groups should not inherit from Object.prototype\n  expect(match.groups.hasOwnProperty).toBe(undefined);\n};",
  ],
  [
    'basic named groups > numbered capture still works alongside named',
    "() => {\n  const re = /(?<first>\\w+) (\\w+)/;\n  const match = re.exec('hello world');\n  expect(match[1]).toBe('hello');\n  expect(match[2]).toBe('world');\n  expect(match.groups.first).toBe('hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+) (\\w+)/, { first: 1 });\n  const match = re.exec('hello world');\n  expect(match[1]).toBe('hello');\n  expect(match[2]).toBe('world');\n  expect(match.groups.first).toBe('hello');\n};",
  ],
  [
    'multiple named groups > three groups',
    "() => {\n  const re = /(?<r>\\d+)\\.(?<g>\\d+)\\.(?<b>\\d+)/;\n  const match = re.exec('255.128.0');\n  expect(match.groups.r).toBe('255');\n  expect(match.groups.g).toBe('128');\n  expect(match.groups.b).toBe('0');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)\\.(\\d+)\\.(\\d+)/, {\n    g: 2,\n    r: 1,\n    b: 3,\n  });\n  const match = re.exec('255.128.0');\n  expect(match.groups.r).toBe('255');\n  expect(match.groups.g).toBe('128');\n  expect(match.groups.b).toBe('0');\n};",
  ],
  [
    'multiple named groups > groups with different character classes',
    "() => {\n  const re = /(?<letters>[a-z]+)(?<digits>\\d+)(?<rest>.*)/;\n  const match = re.exec('abc123!@#');\n  expect(match.groups.letters).toBe('abc');\n  expect(match.groups.digits).toBe('123');\n  expect(match.groups.rest).toBe('!@#');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([a-z]+)(\\d+)(.*)/, {\n    digits: 2,\n    letters: 1,\n    rest: 3,\n  });\n  const match = re.exec('abc123!@#');\n  expect(match.groups.letters).toBe('abc');\n  expect(match.groups.digits).toBe('123');\n  expect(match.groups.rest).toBe('!@#');\n};",
  ],
  [
    'multiple named groups > five groups',
    "() => {\n  const re =\n    /(?<proto>\\w+):\\/\\/(?<host>[^/:]+)(?::(?<port>\\d+))?(?<path>\\/[^?]*)?(?:\\?(?<query>.*))?/;\n  const match = re.exec('https://example.com:8080/path?q=1');\n  expect(match.groups.proto).toBe('https');\n  expect(match.groups.host).toBe('example.com');\n  expect(match.groups.port).toBe('8080');\n  expect(match.groups.path).toBe('/path');\n  expect(match.groups.query).toBe('q=1');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+):\\/\\/([^/:]+)(?::(\\d+))?(\\/[^?]*)?(?:\\?(.*))?/, {\n    proto: 1,\n    query: 5,\n    path: 4,\n    host: 2,\n    port: 3,\n  });\n  const match = re.exec('https://example.com:8080/path?q=1');\n  expect(match.groups.proto).toBe('https');\n  expect(match.groups.host).toBe('example.com');\n  expect(match.groups.port).toBe('8080');\n  expect(match.groups.path).toBe('/path');\n  expect(match.groups.query).toBe('q=1');\n};",
  ],
  [
    'backreferences > \\k<name> matches same text as named group',
    "() => {\n  const re = /(?<quote>['\"]).*?\\k<quote>/;\n  expect(re.test(\"'hello'\")).toBe(true);\n  expect(re.test('\"hello\"')).toBe(true);\n  expect(re.test('\\'hello\"')).toBe(false);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(['\"]).*?\\1/, { quote: 1 });\n  expect(re.test(\"'hello'\")).toBe(true);\n  expect(re.test('\"hello\"')).toBe(true);\n  expect(re.test('\\'hello\"')).toBe(false);\n};",
  ],
  [
    'backreferences > \\k<name> with exec',
    "() => {\n  const re = /^(?<tag>\\w+).*\\k<tag>$/;\n  const match = re.exec('div content div');\n  expect(match).not.toBe(null);\n  expect(match.groups.tag).toBe('div');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/^(\\w+).*\\1$/, { tag: 1 });\n  const match = re.exec('div content div');\n  expect(match).not.toBe(null);\n  expect(match.groups.tag).toBe('div');\n};",
  ],
  [
    'backreferences > \\k<name> fails when group content differs',
    "() => {\n  const re = /^(?<word>\\w+) \\k<word>$/;\n  expect(re.test('abc abc')).toBe(true);\n  expect(re.test('abc def')).toBe(false);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/^(\\w+) \\1$/, { word: 1 });\n  expect(re.test('abc abc')).toBe(true);\n  expect(re.test('abc def')).toBe(false);\n};",
  ],
  [
    'backreferences > multiple backreferences',
    "() => {\n  const re = /(?<a>\\w)(?<b>\\w) \\k<a>\\k<b>/;\n  const match = re.exec('ab ab');\n  expect(match).not.toBe(null);\n  expect(match.groups.a).toBe('a');\n  expect(match.groups.b).toBe('b');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w)(\\w) \\1\\2/, {\n    a: 1,\n    b: 2,\n  });\n  const match = re.exec('ab ab');\n  expect(match).not.toBe(null);\n  expect(match.groups.a).toBe('a');\n  expect(match.groups.b).toBe('b');\n};",
  ],
  [
    'string replace with named groups > $<name> in replacement string',
    "() => {\n  const re = /(?<first>\\w+) (?<second>\\w+)/;\n  const result = 'hello world'.replace(re, '$<second> $<first>');\n  expect(result).toBe('world hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+) (\\w+)/, {\n    second: 2,\n    first: 1,\n  });\n  const result = 'hello world'.replace(re, '$<second> $<first>');\n  expect(result).toBe('world hello');\n};",
  ],
  [
    'string replace with named groups > $<name> with date reformatting',
    "() => {\n  const re = /(?<month>\\d{2})\\/(?<day>\\d{2})\\/(?<year>\\d{4})/;\n  const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');\n  expect(result).toBe('2025-05-01');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, {\n    month: 1,\n    year: 3,\n    day: 2,\n  });\n  const result = '05/01/2025'.replace(re, '$<year>-$<month>-$<day>');\n  expect(result).toBe('2025-05-01');\n};",
  ],
  [
    'string replace with named groups > $<name> with global flag replaces all',
    "() => {\n  const re = /(?<vowel>[aeiou])/g;\n  const result = 'hello'.replace(re, '[$<vowel>]');\n  expect(result).toBe('h[e]ll[o]');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([aeiou])/g, { vowel: 1 });\n  const result = 'hello'.replace(re, '[$<vowel>]');\n  expect(result).toBe('h[e]ll[o]');\n};",
  ],
  [
    'string replace with named groups > $<nonexistent> produces empty string',
    "() => {\n  const re = /(?<a>x)/;\n  const result = 'x'.replace(re, '$<a>$<b>');\n  // $<b> doesn't match a named group, should produce empty string\n  expect(result).toBe('x');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(x)/, { a: 1 });\n  const result = 'x'.replace(re, '$<a>$<b>');\n  // $<b> doesn't match a named group, should produce empty string\n  expect(result).toBe('x');\n};",
  ],
  [
    'string replace with named groups > replace function receives groups as last argument',
    "() => {\n  const re = /(?<first>\\w+) (?<second>\\w+)/;\n  let capturedGroups = null;\n  'hello world'.replace(re, function () {\n    capturedGroups = arguments[arguments.length - 1];\n  });\n  expect(capturedGroups).not.toBe(null);\n  expect(capturedGroups.first).toBe('hello');\n  expect(capturedGroups.second).toBe('world');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+) (\\w+)/, {\n    second: 2,\n    first: 1,\n  });\n  let capturedGroups = null;\n  'hello world'.replace(re, function () {\n    capturedGroups = arguments[arguments.length - 1];\n  });\n  expect(capturedGroups).not.toBe(null);\n  expect(capturedGroups.first).toBe('hello');\n  expect(capturedGroups.second).toBe('world');\n};",
  ],
  [
    'string replace with named groups > replace function return value is used',
    "() => {\n  const re = /(?<n>\\d+)/g;\n  const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {\n    return String(Number(groups.n) * 2);\n  });\n  expect(result).toBe('a2b4c6');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/g, { n: 1 });\n  const result = 'a1b2c3'.replace(re, function (match, n, offset, str, groups) {\n    return String(Number(groups.n) * 2);\n  });\n  expect(result).toBe('a2b4c6');\n};",
  ],
  [
    'string replace with named groups > numbered references $1 $2 still work',
    "() => {\n  const re = /(?<a>\\w+) (?<b>\\w+)/;\n  const result = 'hello world'.replace(re, '$2 $1');\n  expect(result).toBe('world hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+) (\\w+)/, {\n    a: 1,\n    b: 2,\n  });\n  const result = 'hello world'.replace(re, '$2 $1');\n  expect(result).toBe('world hello');\n};",
  ],
  [
    'test() method > test() works with named groups',
    "() => {\n  const re = /(?<year>\\d{4})/;\n  expect(re.test('2025')).toBe(true);\n  expect(re.test('nope')).toBe(false);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{4})/, { year: 1 });\n  expect(re.test('2025')).toBe(true);\n  expect(re.test('nope')).toBe(false);\n};",
  ],
  [
    'test() method > test() with backreference',
    "() => {\n  const re = /(?<char>.)\\k<char>/;\n  expect(re.test('aa')).toBe(true);\n  expect(re.test('ab')).toBe(false);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(.)\\1/, { char: 1 });\n  expect(re.test('aa')).toBe(true);\n  expect(re.test('ab')).toBe(false);\n};",
  ],
  [
    'test() method > test() with global flag advances lastIndex',
    "() => {\n  const re = /(?<d>\\d)/g;\n  const str = 'a1b2c3';\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(2);\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(4);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d)/g, { d: 1 });\n  const str = 'a1b2c3';\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(2);\n  expect(re.test(str)).toBe(true);\n  expect(re.lastIndex).toBe(4);\n};",
  ],
  [
    'flags > case-insensitive flag',
    "() => {\n  const re = /(?<word>[a-z]+)/i;\n  const match = re.exec('HELLO');\n  expect(match.groups.word).toBe('HELLO');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([a-z]+)/i, { word: 1 });\n  const match = re.exec('HELLO');\n  expect(match.groups.word).toBe('HELLO');\n};",
  ],
  [
    'flags > global flag with exec iteration',
    "() => {\n  const re = /(?<num>\\d+)/g;\n  const str = 'a1b22c333';\n  const results = [];\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    results.push(m.groups.num);\n  }\n  expect(results).toEqual(['1', '22', '333']);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/g, { num: 1 });\n  const str = 'a1b22c333';\n  const results = [];\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    results.push(m.groups.num);\n  }\n  expect(results).toEqual(['1', '22', '333']);\n};",
  ],
  [
    'flags > multiline flag',
    "() => {\n  const re = /^(?<first>\\w+)/gm;\n  const str = 'hello\\nworld\\nfoo';\n  const results = [];\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    results.push(m.groups.first);\n  }\n  expect(results).toEqual(['hello', 'world', 'foo']);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/^(\\w+)/gm, { first: 1 });\n  const str = 'hello\\nworld\\nfoo';\n  const results = [];\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    results.push(m.groups.first);\n  }\n  expect(results).toEqual(['hello', 'world', 'foo']);\n};",
  ],
  [
    'flags > dotAll flag',
    "() => {\n  const re = /(?<all>.*)/s;\n  const match = re.exec('line1\\nline2');\n  expect(match.groups.all).toBe('line1\\nline2');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(.*)/s, { all: 1 });\n  const match = re.exec('line1\\nline2');\n  expect(match.groups.all).toBe('line1\\nline2');\n};",
  ],
  [
    'flags > unicode flag',
    "() => {\n  const re = /(?<emoji>.)/u;\n  const match = re.exec('\\u{1F600}');\n  expect(match.groups.emoji).toBe('\\u{1F600}');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(.)/u, { emoji: 1 });\n  const match = re.exec('😀');\n  expect(match.groups.emoji).toBe('😀');\n};",
  ],
  [
    'flags > sticky flag',
    "() => {\n  const re = /(?<ch>\\w)/y;\n  re.lastIndex = 2;\n  const match = re.exec('abcdef');\n  expect(match.groups.ch).toBe('c');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w)/y, { ch: 1 });\n  re.lastIndex = 2;\n  const match = re.exec('abcdef');\n  expect(match.groups.ch).toBe('c');\n};",
  ],
  [
    'matchAll > matchAll returns groups on each match',
    "() => {\n  const re = /(?<n>\\d+)/g;\n  const matches = [...'a1b22c333'.matchAll(re)];\n  expect(matches.length).toBe(3);\n  expect(matches[0].groups.n).toBe('1');\n  expect(matches[1].groups.n).toBe('22');\n  expect(matches[2].groups.n).toBe('333');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/g, { n: 1 });\n  const matches = [...'a1b22c333'.matchAll(re)];\n  expect(matches.length).toBe(3);\n  expect(matches[0].groups.n).toBe('1');\n  expect(matches[1].groups.n).toBe('22');\n  expect(matches[2].groups.n).toBe('333');\n};",
  ],
  [
    'matchAll > matchAll with multiple named groups',
    "() => {\n  const re = /(?<key>\\w+)=(?<val>\\w+)/g;\n  const matches = [...'a=1&b=2&c=3'.matchAll(re)];\n  expect(matches.length).toBe(3);\n  expect(matches[0].groups.key).toBe('a');\n  expect(matches[0].groups.val).toBe('1');\n  expect(matches[2].groups.key).toBe('c');\n  expect(matches[2].groups.val).toBe('3');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)=(\\w+)/g, {\n    key: 1,\n    val: 2,\n  });\n  const matches = [...'a=1&b=2&c=3'.matchAll(re)];\n  expect(matches.length).toBe(3);\n  expect(matches[0].groups.key).toBe('a');\n  expect(matches[0].groups.val).toBe('1');\n  expect(matches[2].groups.key).toBe('c');\n  expect(matches[2].groups.val).toBe('3');\n};",
  ],
  [
    'optional and alternation groups > optional named group returns undefined when unmatched',
    "() => {\n  const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;\n  const match = re.exec('readme');\n  expect(match.groups.required).toBe('readme');\n  expect(match.groups.ext).toBe(undefined);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {\n    required: 1,\n    ext: 2,\n  });\n  const match = re.exec('readme');\n  expect(match.groups.required).toBe('readme');\n  expect(match.groups.ext).toBe(undefined);\n};",
  ],
  [
    'optional and alternation groups > optional named group returns value when matched',
    "() => {\n  const re = /(?<required>\\w+)(?:\\.(?<ext>\\w+))?/;\n  const match = re.exec('readme.md');\n  expect(match.groups.required).toBe('readme');\n  expect(match.groups.ext).toBe('md');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)(?:\\.(\\w+))?/, {\n    required: 1,\n    ext: 2,\n  });\n  const match = re.exec('readme.md');\n  expect(match.groups.required).toBe('readme');\n  expect(match.groups.ext).toBe('md');\n};",
  ],
  [
    'optional and alternation groups > alternation with named groups',
    "() => {\n  const re = /(?<hex>#[0-9a-f]{6})|(?<rgb>rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\))/i;\n  const hexMatch = re.exec('#ff0000');\n  expect(hexMatch.groups.hex).toBe('#ff0000');\n  expect(hexMatch.groups.rgb).toBe(undefined);\n\n  const rgbMatch = re.exec('rgb(255, 0, 0)');\n  expect(rgbMatch.groups.rgb).toBe('rgb(255, 0, 0)');\n  expect(rgbMatch.groups.hex).toBe(undefined);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(#[0-9a-f]{6})|(rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\))/i, {\n    hex: 1,\n    rgb: 2,\n  });\n  const hexMatch = re.exec('#ff0000');\n  expect(hexMatch.groups.hex).toBe('#ff0000');\n  expect(hexMatch.groups.rgb).toBe(undefined);\n  const rgbMatch = re.exec('rgb(255, 0, 0)');\n  expect(rgbMatch.groups.rgb).toBe('rgb(255, 0, 0)');\n  expect(rgbMatch.groups.hex).toBe(undefined);\n};",
  ],
  [
    'optional and alternation groups > named group in one branch of alternation',
    "() => {\n  const re = /(?:(?<a>foo)|bar)/;\n  const m1 = re.exec('foo');\n  expect(m1.groups.a).toBe('foo');\n  const m2 = re.exec('bar');\n  expect(m2.groups.a).toBe(undefined);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(?:(foo)|bar)/, { a: 1 });\n  const m1 = re.exec('foo');\n  expect(m1.groups.a).toBe('foo');\n  const m2 = re.exec('bar');\n  expect(m2.groups.a).toBe(undefined);\n};",
  ],
  [
    'mixed named and unnamed groups > unnamed groups do not appear in groups object',
    "() => {\n  const re = /(\\d+)-(?<named>\\w+)/;\n  const match = re.exec('123-abc');\n  expect(match[1]).toBe('123');\n  expect(match[2]).toBe('abc');\n  expect(match.groups.named).toBe('abc');\n  expect(Object.keys(match.groups).length).toBe(1);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)-(\\w+)/, { named: 2 });\n  const match = re.exec('123-abc');\n  expect(match[1]).toBe('123');\n  expect(match[2]).toBe('abc');\n  expect(match.groups.named).toBe('abc');\n  expect(Object.keys(match.groups).length).toBe(1);\n};",
  ],
  [
    'mixed named and unnamed groups > non-capturing groups are transparent',
    "() => {\n  const re = /(?:prefix_)(?<value>\\w+)/;\n  const match = re.exec('prefix_hello');\n  expect(match.groups.value).toBe('hello');\n  expect(match[1]).toBe('hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(?:prefix_)(\\w+)/, { value: 1 });\n  const match = re.exec('prefix_hello');\n  expect(match.groups.value).toBe('hello');\n  expect(match[1]).toBe('hello');\n};",
  ],
  [
    'mixed named and unnamed groups > nested named group inside unnamed group',
    "() => {\n  const re = /((?<inner>\\d+))/;\n  const match = re.exec('42');\n  expect(match[1]).toBe('42');\n  expect(match.groups.inner).toBe('42');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/((\\d+))/, { inner: 2 });\n  const match = re.exec('42');\n  expect(match[1]).toBe('42');\n  expect(match.groups.inner).toBe('42');\n};",
  ],
  [
    'string search and split > search() works with named groups',
    "() => {\n  const re = /(?<word>\\bhello\\b)/;\n  const idx = 'say hello there'.search(re);\n  expect(idx).toBe(4);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\bhello\\b)/, { word: 1 });\n  const idx = 'say hello there'.search(re);\n  expect(idx).toBe(4);\n};",
  ],
  [
    'string search and split > split() with named capturing group retains captures',
    "() => {\n  const re = /(?<sep>[,;])/;\n  const parts = 'a,b;c'.split(re);\n  // split includes capturing group matches\n  expect(parts).toEqual(['a', ',', 'b', ';', 'c']);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([,;])/, { sep: 1 });\n  const parts = 'a,b;c'.split(re);\n  // split includes capturing group matches\n  expect(parts).toEqual(['a', ',', 'b', ';', 'c']);\n};",
  ],
  [
    'destructuring groups > destructure groups from exec result',
    "() => {\n  const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\n  const {\n    groups: { year, month, day },\n  } = re.exec('2025-05-01');\n  expect(year).toBe('2025');\n  expect(month).toBe('05');\n  expect(day).toBe('01');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/, {\n    month: 2,\n    day: 3,\n    year: 1,\n  });\n  const {\n    groups: { year, month, day },\n  } = re.exec('2025-05-01');\n  expect(year).toBe('2025');\n  expect(month).toBe('05');\n  expect(day).toBe('01');\n};",
  ],
  [
    'destructuring groups > destructure with default for optional group',
    "() => {\n  const re = /(?<host>[^:]+)(?::(?<port>\\d+))?/;\n  const {\n    groups: { host, port = '80' },\n  } = re.exec('example.com');\n  expect(host).toBe('example.com');\n  expect(port).toBe('80');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([^:]+)(?::(\\d+))?/, {\n    host: 1,\n    port: 2,\n  });\n  const {\n    groups: { host, port = '80' },\n  } = re.exec('example.com');\n  expect(host).toBe('example.com');\n  expect(port).toBe('80');\n};",
  ],
  [
    'edge cases > empty string match',
    "() => {\n  const re = /(?<empty>)/;\n  const match = re.exec('anything');\n  expect(match.groups.empty).toBe('');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/()/, { empty: 1 });\n  const match = re.exec('anything');\n  expect(match.groups.empty).toBe('');\n};",
  ],
  [
    'edge cases > group name with underscores and digits',
    "() => {\n  const re = /(?<my_group_1>\\w+)/;\n  const match = re.exec('hello');\n  expect(match.groups.my_group_1).toBe('hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)/, { my_group_1: 1 });\n  const match = re.exec('hello');\n  expect(match.groups.my_group_1).toBe('hello');\n};",
  ],
  [
    'edge cases > group name with dollar sign',
    "() => {\n  const re = /(?<$val>\\d+)/;\n  const match = re.exec('42');\n  expect(match.groups.$val).toBe('42');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/, { $val: 1 });\n  const match = re.exec('42');\n  expect(match.groups.$val).toBe('42');\n};",
  ],
  [
    'edge cases > very long match in named group',
    "() => {\n  const long = 'a'.repeat(10000);\n  const re = /(?<all>.+)/s;\n  const match = re.exec(long);\n  expect(match.groups.all.length).toBe(10000);\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const long = 'a'.repeat(1e4);\n  const re = _wrapRegExp(/(.+)/s, { all: 1 });\n  const match = re.exec(long);\n  expect(match.groups.all.length).toBe(1e4);\n};",
  ],
  [
    'edge cases > named group with quantifier',
    "() => {\n  const re = /(?<digits>\\d+)/;\n  const match = re.exec('abc123def');\n  expect(match.groups.digits).toBe('123');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/, { digits: 1 });\n  const match = re.exec('abc123def');\n  expect(match.groups.digits).toBe('123');\n};",
  ],
  [
    'edge cases > named group captures last iteration of quantified group',
    "() => {\n  const re = /(?:(?<ch>\\w))+/;\n  const match = re.exec('abcd');\n  // A repeated capturing group only keeps the last match\n  expect(match.groups.ch).toBe('d');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(?:(\\w))+/, { ch: 1 });\n  const match = re.exec('abcd');\n  // A repeated capturing group only keeps the last match\n  expect(match.groups.ch).toBe('d');\n};",
  ],
  [
    'edge cases > lookahead does not interfere with named groups',
    "() => {\n  const re = /(?<word>\\w+)(?=\\s)/;\n  const match = re.exec('hello world');\n  expect(match.groups.word).toBe('hello');\n  expect(match[0]).toBe('hello');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\w+)(?=\\s)/, { word: 1 });\n  const match = re.exec('hello world');\n  expect(match.groups.word).toBe('hello');\n  expect(match[0]).toBe('hello');\n};",
  ],
  [
    'edge cases > lookbehind does not interfere with named groups',
    "() => {\n  const re = /(?<=\\s)(?<word>\\w+)/;\n  const match = re.exec('hello world');\n  expect(match.groups.word).toBe('world');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(?<=\\s)(\\w+)/, { word: 1 });\n  const match = re.exec('hello world');\n  expect(match.groups.word).toBe('world');\n};",
  ],
  [
    'edge cases > regex constructed with new RegExp also supports named groups',
    "() => {\n  const re = new RegExp('(?<n>\\\\d+)');\n  const match = re.exec('42');\n  expect(match.groups.n).toBe('42');\n}",
    "() => {\n  const re = new RegExp('(?<n>\\\\d+)');\n  const match = re.exec('42');\n  expect(match.groups.n).toBe('42');\n};",
  ],
  [
    'edge cases > named group in replace with special characters in replacement',
    "() => {\n  const re = /(?<val>\\d+)/;\n  const result = '42'.replace(re, '$$<val>');\n  // $$ is a literal $, so result should be literal \"$<val>\"\n  expect(result).toBe('$<val>');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d+)/, { val: 1 });\n  const result = '42'.replace(re, '$$<val>');\n  // $$ is a literal $, so result should be literal \"$<val>\"\n  expect(result).toBe('$<val>');\n};",
  ],
  [
    'edge cases > incomplete $< in replacement is literal',
    "() => {\n  const re = /(?<a>x)/;\n  // $< without closing > is treated as literal by the wrapRegExp helper\n  const result = 'x'.replace(re, '$<a');\n  expect(result).toBe('$<a');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(x)/, { a: 1 });\n  // $< without closing > is treated as literal by the wrapRegExp helper\n  const result = 'x'.replace(re, '$<a');\n  expect(result).toBe('$<a');\n};",
  ],
  [
    'practical patterns > parse semver version string',
    "() => {\n  const re =\n    /^(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)(?:-(?<pre>[a-z0-9.]+))?(?:\\+(?<build>[a-z0-9.]+))?$/i;\n  const m1 = re.exec('1.2.3');\n  expect(m1.groups.major).toBe('1');\n  expect(m1.groups.minor).toBe('2');\n  expect(m1.groups.patch).toBe('3');\n  expect(m1.groups.pre).toBe(undefined);\n\n  const m2 = re.exec('1.0.0-beta.1+build.42');\n  expect(m2.groups.pre).toBe('beta.1');\n  expect(m2.groups.build).toBe('build.42');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:-([a-z0-9.]+))?(?:\\+([a-z0-9.]+))?$/i, {\n    patch: 3,\n    major: 1,\n    build: 5,\n    minor: 2,\n    pre: 4,\n  });\n  const m1 = re.exec('1.2.3');\n  expect(m1.groups.major).toBe('1');\n  expect(m1.groups.minor).toBe('2');\n  expect(m1.groups.patch).toBe('3');\n  expect(m1.groups.pre).toBe(undefined);\n  const m2 = re.exec('1.0.0-beta.1+build.42');\n  expect(m2.groups.pre).toBe('beta.1');\n  expect(m2.groups.build).toBe('build.42');\n};",
  ],
  [
    'practical patterns > parse email-like address',
    "() => {\n  const re = /(?<user>[^@]+)@(?<domain>[^.]+)\\.(?<tld>\\w+)/;\n  const match = re.exec('user@example.com');\n  expect(match.groups.user).toBe('user');\n  expect(match.groups.domain).toBe('example');\n  expect(match.groups.tld).toBe('com');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([^@]+)@([^.]+)\\.(\\w+)/, {\n    tld: 3,\n    user: 1,\n    domain: 2,\n  });\n  const match = re.exec('user@example.com');\n  expect(match.groups.user).toBe('user');\n  expect(match.groups.domain).toBe('example');\n  expect(match.groups.tld).toBe('com');\n};",
  ],
  [
    'practical patterns > extract key-value pairs from query string',
    "() => {\n  const re = /(?<key>[^=&]+)=(?<value>[^&]*)/g;\n  const str = 'foo=bar&baz=qux&n=42';\n  const pairs = {};\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    pairs[m.groups.key] = m.groups.value;\n  }\n  expect(pairs).toEqual({ foo: 'bar', baz: 'qux', n: '42' });\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/([^=&]+)=([^&]*)/g, {\n    value: 2,\n    key: 1,\n  });\n  const str = 'foo=bar&baz=qux&n=42';\n  const pairs = {};\n  let m;\n  while ((m = re.exec(str)) !== null) {\n    pairs[m.groups.key] = m.groups.value;\n  }\n  expect(pairs).toEqual({\n    foo: 'bar',\n    baz: 'qux',\n    n: '42',\n  });\n};",
  ],
  [
    'practical patterns > reformat dates with replace',
    "() => {\n  const re = /(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/g;\n  const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');\n  expect(result).toBe('From 01/05/2025 to 31/12/2025');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/g, {\n    m: 2,\n    d: 3,\n    y: 1,\n  });\n  const result = 'From 2025-05-01 to 2025-12-31'.replace(re, '$<d>/$<m>/$<y>');\n  expect(result).toBe('From 01/05/2025 to 31/12/2025');\n};",
  ],
  [
    'practical patterns > CSS hex color extraction',
    "() => {\n  const re = /#(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})/i;\n  const match = re.exec('#FF8800');\n  expect(match.groups.r).toBe('FF');\n  expect(match.groups.g).toBe('88');\n  expect(match.groups.b).toBe('00');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, {\n    g: 2,\n    r: 1,\n    b: 3,\n  });\n  const match = re.exec('#FF8800');\n  expect(match.groups.r).toBe('FF');\n  expect(match.groups.g).toBe('88');\n  expect(match.groups.b).toBe('00');\n};",
  ],
  [
    'practical patterns > log line parsing',
    "() => {\n  const re = /\\[(?<level>\\w+)\\] (?<ts>\\d{4}-\\d{2}-\\d{2}T[\\d:]+) (?<msg>.*)/;\n  const match = re.exec('[ERROR] 2025-05-01T12:00:00 Something failed');\n  expect(match.groups.level).toBe('ERROR');\n  expect(match.groups.ts).toBe('2025-05-01T12:00:00');\n  expect(match.groups.msg).toBe('Something failed');\n}",
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },\n  _wrapRegExp = _wrapRegExp2.wrapRegExp;\n() => {\n  const re = _wrapRegExp(/\\[(\\w+)\\] (\\d{4}-\\d{2}-\\d{2}T[\\d:]+) (.*)/, {\n    ts: 2,\n    msg: 3,\n    level: 1,\n  });\n  const match = re.exec('[ERROR] 2025-05-01T12:00:00 Something failed');\n  expect(match.groups.level).toBe('ERROR');\n  expect(match.groups.ts).toBe('2025-05-01T12:00:00');\n  expect(match.groups.msg).toBe('Something failed');\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
