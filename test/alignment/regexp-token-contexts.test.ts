import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { type PreflightTransforms } from '../../js';

describe('shortcut', () => {
  const cases = [
    {
      name: 'escaped property-like literal is not a Unicode property escape',
      source: String.raw`globalThis.result = /\\p{2}/u.test('\\pp');`,
      dotAll: false,
      expected: true,
      babelFailure: false,
    },
    {
      name: 'paired Unicode escapes retain their quantifier boundary',
      source: String.raw`globalThis.result = ['😀😀', '😀\uDE00'].map(value => /\uD83D\uDE00+/u.exec(value)[0]);`,
      dotAll: false,
      expected: ['😀😀', '😀'],
      babelFailure: false,
    },
    {
      name: 'dot-all lowering tracks nested Unicode-set class boundaries',
      source: String.raw`globalThis.result = ['a', 'b.c', 'bxc'].map(value => /[[a]\q{b.c}]/sv.test(value));`,
      dotAll: true,
      expected: [true, true, false],
      babelFailure: true,
    },
  ];
  describe.each(cases)('$name', entry => {
    const codes = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(entry.source, {
          transforms: entry.dotAll ? { regexpDotAll: true } : { regexpUnicode: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(entry.dotAll ? /\/sv\b/ : /\/u\b/);
        codes.set(mode, code);
      }
      const result = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          require('@babel/plugin-transform-' + (entry.dotAll ? 'dotall-regex' : 'unicode-regex')),
        ],
      });
      expect(result?.code).toBeTypeOf('string');
      codes.set('babel', result!.code!);
    });
    test('native behavior', () => expect(run(entry.source)).toEqual(entry.expected));
    const babelTest = entry.babelFailure ? test.fails : test;
    babelTest('Babel preserves native behavior', () =>
      expect(run(codes.get('babel')!)).toEqual(entry.expected),
    );
    test.each(['inline', 'runtime'])('%s lowering preserves native behavior', mode => {
      expect(run(codes.get(mode)!)).toEqual(entry.expected);
    });
  });
});

describe('escape context', () => {
  const cases = [
    {
      name: 'ignore-case folding preserves control-escape tokens',
      source: String.raw`globalThis.result = [/\cK/iu.test('\u000B'), /\cK/iu.test('\\ck'), /\cS/iu.test('\u0013'), /\cS/iu.test('\\cs')];`,
      expected: [true, false, true, false],
    },
    {
      name: 'ignore-case folding preserves named-group identifiers',
      source: String.raw`globalThis.result = /(?<k>a)/iu.exec('a').groups.k;`,
      expected: 'a',
    },
    {
      name: 'ignore-case folding combines paired Unicode escapes',
      source: String.raw`globalThis.result = ['𐐀', '𐐨'].map(value => /\uD801\uDC00/iu.test(value));`,
      expected: [true, true],
    },
  ];
  describe.each(cases)('$name', entry => {
    const codes = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(entry.source, {
          transforms: { regexpUnicode: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\/iu\b/);
        codes.set(mode, code);
      }
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      });
      expect(reference?.code).toBeTypeOf('string');
      codes.set('babel', reference!.code!);
    });
    test('native semantics', () => expect(run(entry.source)).toEqual(entry.expected));
    test('Babel preserves native semantics', () =>
      expect(run(codes.get('babel')!)).toEqual(entry.expected));
    test.each(['inline', 'runtime'])('%s lowering preserves native semantics', mode => {
      expect(run(codes.get(mode)!)).toEqual(entry.expected);
    });
  });
});

describe('dotall token', () => {
  const cases = [
    {
      name: 'escaped opening bracket leaves dot outside class',
      pattern: String.raw`/^\[.$/s`,
      inputs: ['[\n', '[x', '[', 'xx'],
    },
    {
      name: 'escaped closing bracket keeps literal dot inside class',
      pattern: String.raw`/^[\].]$/s`,
      inputs: [']', '.', '\n', 'x'],
    },
    {
      name: 'escaped backslash leaves dot active',
      pattern: String.raw`/^\\.$/s`,
      inputs: ['\\\n', '\\x', '\\', 'xx'],
    },
    {
      name: 'legacy opening bracket is not a nested class',
      pattern: String.raw`/^[[]..$/s`,
      inputs: ['[\nx', '[xx', '[[', 'xxx'],
    },
  ];
  for (const entry of cases) {
    test(entry.name, () => {
      const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.test(value));`;
      const expected = [true, true, false, false];
      expect(run(source)).toEqual(expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-dotall-regex')],
      })!.code!;
      expect(run(reference)).toEqual(expected);
      const code = compile(source, { transforms: { regexpDotAll: true } });
      expect(code).not.toMatch(/\/s\b/);
      expect(run(code)).toEqual(expected);
    });
  }
});

describe('dotall nested class', () => {
  const cases = [
    {
      name: 'dot after nested class remains literal',
      pattern: String.raw`/^[[a].]$/sv`,
      inputs: ['a', '.', 'b', '\n'],
      expected: [true, true, false, false],
    },
    {
      name: 'escaped dot after nested class remains literal',
      pattern: String.raw`/^[[a]\.]$/sv`,
      inputs: ['a', '.', 'b', '\n'],
      expected: [true, true, false, false],
    },
    {
      name: 'class dot differs from following wildcard',
      pattern: String.raw`/^[[a].].$/sv`,
      inputs: ['a\n', '.\n', 'b\n'],
      expected: [true, true, false],
    },
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      const outcomes = new Map<boolean, unknown>();
      beforeAll(() => {
        const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.test(value));`;
        expect(run(source)).toEqual(entry.expected);
        for (const unicodeSets of [false, true]) {
          const reference = transformSync(source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-dotall-regex'),
              ...(unicodeSets ? [require('@babel/plugin-transform-unicode-sets-regex')] : []),
            ],
          })!.code!;
          expect(run(reference)).toEqual(entry.expected);
          const code = compile(source, {
            transforms: { regexpDotAll: true, regexpUnicodeSets: unicodeSets },
          });
          expect(code).not.toMatch(/\/[dgimsuvy]*s[dgimsuvy]*\.test/);
          outcomes.set(unicodeSets, run(code));
        }
      });
      for (const unicodeSets of [false, true])
        test(`preserves class membership, Unicode sets=${unicodeSets}`, () => {
          expect(outcomes.get(unicodeSets)).toEqual(entry.expected);
        });
    });
});

describe('modifier scope', () => {
  const supportsModifiers = (() => {
    try {
      return new RegExp('(?-i:k)', 'iu').test('k');
    } catch {
      return false;
    }
  })();
  const cases: {
    name: string;
    source: string;
    transforms: PreflightTransforms;
    plugin: string;
    expected: boolean[];
    absent: RegExp;
  }[] = [
    {
      name: 'Unicode case folding respects a disabled ignore-case scope',
      source: String.raw`globalThis.result = ['K', 'K', 'k'].map(value => /(?-i:k)/iu.test(value));`,
      transforms: { regexpUnicode: true },
      plugin: 'unicode-regex',
      expected: [false, false, true],
      absent: /\/iu\b/,
    },
    {
      name: 'Unicode dot lowering respects a disabled dot-all scope',
      source: String.raw`globalThis.result = ['\n', 'a', '😀'].map(value => /(?-s:.)/su.test(value));`,
      transforms: { regexpUnicode: true },
      plugin: 'unicode-regex',
      expected: [false, true, true],
      absent: /\/su\b/,
    },
    {
      name: 'Unicode dot lowering respects an enabled dot-all scope',
      source: String.raw`globalThis.result = ['\n', 'a', '😀'].map(value => /(?s:.)/u.test(value));`,
      transforms: { regexpUnicode: true },
      plugin: 'unicode-regex',
      expected: [true, true, true],
      absent: /\/u\b/,
    },
    {
      name: 'Dot-all lowering respects a disabled dot-all scope',
      source: String.raw`globalThis.result = ['\n', 'a'].map(value => /(?-s:.)/s.test(value));`,
      transforms: { regexpDotAll: true },
      plugin: 'dotall-regex',
      expected: [false, true],
      absent: /\/s\b/,
    },
  ];
  describe.skipIf(!supportsModifiers).each(cases)('$name', entry => {
    const codes = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(entry.source, {
          transforms: entry.transforms,
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(entry.absent);
        codes.set(mode, code);
      }
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-' + entry.plugin)],
      });
      expect(reference?.code).toBeTypeOf('string');
      expect(reference!.code!).not.toMatch(entry.absent);
      codes.set('babel', reference!.code!);
    });
    test('native preserves the scoped flag', () =>
      expect(run(entry.source)).toEqual(entry.expected));
    test('Babel preserves the scoped flag', () =>
      expect(run(codes.get('babel')!)).toEqual(entry.expected));
    test.each(['inline', 'runtime'])('%s lowering preserves the scoped flag', mode => {
      expect(run(codes.get(mode)!)).toEqual(entry.expected);
    });
  });

  test.skipIf(!supportsModifiers)(
    'local ignore-case without global i retains the pinned Babel limitation',
    () => {
      const source = String.raw`globalThis.result=/(?i:k)/u.test('K');`;
      expect(run(source)).toBe(true);
      const reference = transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      })!.code!;
      const code = compile(source, { transforms: { regexpUnicode: true } });
      for (const output of [reference, code]) {
        expect(output).not.toMatch(/\/u\b/);
        expect(run(output)).toBe(false);
      }
    },
  );
});

test('opening bracket remains literal in a Unicode ignore-case class', () => {
  const source = String.raw`globalThis.result=['[','K','K'].map(value=>/^[[]k$/iu.test(value+'K'));`;
  const code = compile(source, { transforms: { regexpUnicode: true } });
  expect(code).not.toMatch(/\/iu\b/);
  expect(run(code)).toEqual(run(source));
});

test('legacy identity escape k is not a named reference without named captures', () => {
  const source = String.raw`globalThis.result=['k<a\nb>','k<a.b>'].map(value=>/^\k<a.b>$/s.test(value));`;
  const code = compile(source, { transforms: { regexpDotAll: true } });
  expect(code).not.toMatch(/\/s\b/);
  expect(run(code)).toEqual(run(source));
});

describe('escaped property postconditions', () => {
  const cases: {
    name: string;
    pattern: string;
    inputs: string[];
    transforms: PreflightTransforms;
    plugins: string[];
    standard?: string;
  }[] = [
    {
      name: 'escaped property-like token through property postcondition',
      pattern: String.raw`/^\\p{2}$/u`,
      inputs: ['\\pp', 'p'],
      transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
      plugins: ['unicode-regex', 'unicode-property-regex'],
    },
  ];
  describe.each(cases)('$name', entry => {
    test('preserves native and Babel matching', () => {
      const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.exec(value)?.[0]);`;
      const expected = run(entry.standard ? source.replace(entry.pattern, entry.standard) : source);
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: entry.plugins.map(name => require('@babel/plugin-transform-' + name)),
      })!.code!;
      expect(run(reference)).toEqual(expected);
      const code = compile(source, { transforms: entry.transforms });
      expect(code).not.toMatch(
        entry.transforms.regexpUnicode
          ? /\/[dgimsuvy]*u[dgimsuvy]*\./
          : /\/[dgimsuvy]*v[dgimsuvy]*\./,
      );
      expect(run(code)).toEqual(expected);
    });
  });
});
