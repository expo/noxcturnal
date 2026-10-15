import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { defineNativePipeline, transform, type PreflightTransforms } from '../../js';

describe('range', () => {
  const cases = [
    {
      name: 'positive surrogate classes exclude halves of valid pairs',
      source: String.raw`globalThis.result = [/[\uD800]/u.test('𐀀'), /[\uDC00]/u.test('𐀀'), /[\uD800]/u.test('\uD800'), /[\uDC00]/u.test('\uDC00')];`,
      expected: [false, false, true, true],
    },
    {
      name: 'quantifiers repeat complete astral-range atoms',
      source: String.raw`globalThis.result = ['😀😀', '😀😁'].map(value => /[\u{1F600}-\u{1F601}]+/u.exec(value)[0]);`,
      expected: ['😀😀', '😀😁'],
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
        expect(code).not.toMatch(/\/u\b/);
        codes.set(mode, code);
      }
      const result = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      });
      expect(result?.code).toBeTypeOf('string');
      codes.set('babel', result!.code!);
    });
    test('native matching', () => expect(run(entry.source)).toEqual(entry.expected));
    test('Babel lowering matches native', () =>
      expect(run(codes.get('babel')!)).toEqual(entry.expected));
    test.each(['inline', 'runtime'])('%s lowering matches native', mode => {
      expect(run(codes.get(mode)!)).toEqual(entry.expected);
    });
  });
});

describe('range partition', () => {
  const cases = [
    { name: 'BMP to supplementary boundary', start: 0xffff, end: 0x10001 },
    { name: 'adjacent lead-surrogate partitions', start: 0x103ff, end: 0x10401 },
    { name: 'interior complete lead-surrogate partition', start: 0x103ff, end: 0x10c01 },
    { name: 'maximum Unicode code point', start: 0x10fbff, end: 0x10ffff },
  ];
  for (const entry of cases) {
    test(entry.name, () => {
      const points = [entry.start - 1, entry.start, entry.start + 1, entry.end - 1, entry.end];
      if (entry.end < 0x10ffff) points.push(entry.end + 1);
      const inputs = points.map(point => String.fromCodePoint(point).repeat(2));
      inputs.push(String.fromCodePoint(entry.start, entry.end));
      const expected = points.map(point => point >= entry.start && point <= entry.end);
      expected.push(true);
      const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^[\\u{${entry.start.toString(16)}}-\\u{${entry.end.toString(16)}}]+$/u.test(value));`;
      expect(run(source)).toEqual(expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      })!.code!;
      expect(run(reference)).toEqual(expected);
      const code = compile(source, { transforms: { regexpUnicode: true } });
      expect(code).not.toMatch(/\/u\b/);
      expect(run(code)).toEqual(expected);
    });
  }
});

describe('dot backtrack', () => {
  const cases = [
    { name: 'two dots', pattern: '/^..$/su', expected: null },
    { name: 'bounded dot repetition', pattern: '/^.{2}$/su', expected: null },
    {
      name: 'greedy capture backtracking',
      pattern: '/^(.*)(.)$/su',
      expected: ['😀', '', '😀'],
    },
    { name: 'non-dot-all control', pattern: '/^..$/u', expected: null },
  ];
  for (const dotAll of [false, true]) {
    for (const entry of cases) {
      describe(`${entry.name}, dot-all lowering=${dotAll}`, () => {
        let actual: unknown;
        beforeAll(() => {
          const source = `const match=${entry.pattern}.exec('😀');globalThis.result=match&&Array.from(match);`;
          expect(run(source)).toEqual(entry.expected);
          const plugins = [require('@babel/plugin-transform-unicode-regex')];
          if (dotAll) plugins.push(require('@babel/plugin-transform-dotall-regex'));
          const reference = transformSync(source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins,
          })!.code!;
          expect(run(reference)).toEqual(entry.expected);
          const code = compile(source, {
            transforms: { regexpUnicode: true, regexpDotAll: dotAll },
          });
          expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*\b/);
          if (dotAll) expect(code).not.toMatch(/\/[dgimsuvy]*s[dgimsuvy]*\b/);
          actual = run(code);
        });
        test('preserves complete Unicode characters during backtracking', () => {
          expect(actual).toEqual(entry.expected);
        });
      });
    }
  }
});

describe('property surrogate', () => {
  const inputs = ['\uD800', '\uDFFF', '😀', 'a'];
  const cases = [
    { property: 'Assigned', escape: 'p', expected: [true, true, true, true] },
    { property: 'Assigned', escape: 'P', expected: [false, false, false, false] },
    { property: 'Other', escape: 'P', expected: [false, false, true, true] },
    { property: 'Other', escape: 'p', expected: [true, true, false, false] },
    { property: 'Any', escape: 'p', expected: [true, true, true, true] },
    { property: 'Surrogate', escape: 'p', expected: [true, true, false, false] },
  ];
  function reference(source: string): string {
    return transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-unicode-property-regex')],
    })!.code!;
  }
  for (const entry of cases) {
    describe(`${entry.escape}{${entry.property}}`, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^\\${entry.escape}{${entry.property}}$/u.test(value));`;
        expect(run(source)).toEqual(entry.expected);
        expect(run(reference(source))).toEqual(entry.expected);
        const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
        expect(code).not.toMatch(/\\[pP]\{/);
        actual = run(code);
      });
      test('preserves surrogate membership', () => {
        expect(actual).toEqual(entry.expected);
      });
    });
  }
  test('empty Any complement has a pristine unsupported outcome', () => {
    const source = String.raw`/* original */ globalThis.result = /^\P{Any}$/u.test('a');`;
    expect(run(source)).toBe(false);
    expect(run(reference(source))).toBe(false);
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [{ name: 'audit', native: { transforms: { regexpUnicodePropertyEscapes: true } } }],
      }),
    );
    expect(result.status).toBe('bailout');
    if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
    expect(result.reason).toBe('audit:regexp-unicode-property-invalid');
    expect(result.source).toBe(source);
  });
});

describe('property word', () => {
  const inputs = ['K', 'ſ', 'k', 's', '1', '!'];
  const cases = [
    {
      name: 'negative word escape with hex property',
      pattern: String.raw`/^[\W\p{ASCII_Hex_Digit}]$/iu`,
      expected: [false, false, false, false, true, true],
    },
    {
      name: 'negative word escape with decimal property',
      pattern: String.raw`/^[\W\p{Decimal_Number}]$/iu`,
      expected: [false, false, false, false, true, true],
    },
    {
      name: 'outer complement of word and property union',
      pattern: String.raw`/^[^\w\p{ASCII_Hex_Digit}]$/iu`,
      expected: [false, false, false, false, false, true],
    },
    {
      name: 'negative word escape without case folding',
      pattern: String.raw`/^[\W\p{ASCII_Hex_Digit}]$/u`,
      expected: [true, true, false, false, true, true],
    },
    {
      name: 'positive word escape with case folding',
      pattern: String.raw`/^[\w\p{ASCII_Hex_Digit}]$/iu`,
      expected: [true, true, true, true, true, false],
    },
  ];
  for (const entry of cases) {
    describe(entry.name, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>${entry.pattern}.test(value));`;
        expect(run(source)).toEqual(entry.expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-property-regex')],
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
        expect(code).not.toMatch(/\\[pP]\{/);
        actual = run(code);
      });
      test('preserves Unicode word membership', () => {
        expect(actual).toEqual(entry.expected);
      });
    });
  }
});

describe('Unicode class escape composition', () => {
  const cases: {
    name: string;
    pattern: string;
    inputs: string[];
    transforms: PreflightTransforms;
    plugins: string[];
    standard?: string;
  }[] = [
    {
      name: 'control and paired escapes in Unicode classes',
      pattern: String.raw`/^[\cK\uD801\uDC00]+$/iu`,
      inputs: ['\u000b', '𐐀', '𐐨', 'K', 'k'],
      transforms: { regexpUnicode: true },
      plugins: ['unicode-regex'],
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
describe('Unicode complements and scoped flags', () => {
  const modifiers = (() => {
    try {
      new RegExp('(?i:a)');
      return true;
    } catch {
      return false;
    }
  })();
  test.skipIf(!modifiers)(
    'nested modifier scopes restore flags across siblings and property collectors',
    () => {
      const source = String.raw`globalThis.result=['K','k','K','!'].map(value=>[/^(?-i:[\W\p{ASCII_Hex_Digit}])$/iu.test(value), /^(?i:[\W\p{ASCII_Hex_Digit}])$/u.test(value), /^(?-i:(?i:k))k$/iu.test(value+'K')]);`;
      const expected = run(source);
      const code = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
      expect(code).not.toMatch(/\\[pP]\{/);
      expect(run(code)).toEqual(expected);
    },
  );

  describe.each([false, true])(
    'case closure before class complement (drop Unicode: %s)',
    regexpUnicode => {
      test.each([
        String.raw`/^[^\p{Lowercase_Letter}]$/iu`,
        String.raw`/^\P{Lowercase_Letter}$/iu`,
        String.raw`/^[^a]$/iu`,
      ])('%s keeps property and class negation distinct', pattern => {
        const source = `globalThis.result=['a','A','k','K','1','😀'].map(value=>${pattern}.test(value));`;
        const expected = run(source);
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [
            require('@babel/plugin-transform-unicode-property-regex'),
            ...(regexpUnicode ? [require('@babel/plugin-transform-unicode-regex')] : []),
          ],
        })!.code!;
        expect(run(reference)).toEqual(expected);
        const code = compile(source, {
          transforms: { regexpUnicodePropertyEscapes: true, regexpUnicode },
        });
        expect(code).not.toMatch(/\\[pP]\{/);
        if (regexpUnicode) expect(code).not.toMatch(/\/iu\b/);
        expect(run(code)).toEqual(expected);
      });
    },
  );
  test.skipIf(!modifiers)(
    'property class complements use effective local ignore-case flags',
    () => {
      const source = String.raw`globalThis.result=['a','A','k','K','1'].map(value=>[/^(?-i:[^\p{Lowercase_Letter}])$/iu.test(value),/^(?i:[^\p{Lowercase_Letter}])$/u.test(value),/^(?i:\P{Lowercase_Letter})$/u.test(value)]);`;
      const expected = run(source);
      for (const regexpUnicode of [false, true]) {
        const code = compile(source, {
          transforms: { regexpUnicodePropertyEscapes: true, regexpUnicode },
        });
        expect(code).not.toMatch(/\\[pP]\{/);
        expect(run(code)).toEqual(expected);
      }
    },
  );

  describe.each([
    String.raw`\w`,
    String.raw`\W`,
    String.raw`[\w]`,
    String.raw`[\W]`,
    String.raw`[^\w]`,
    String.raw`[^\W]`,
  ])('Unicode word atom %s', atom => {
    test('closes Unicode word membership before outer complement', () => {
      const source = `globalThis.result=['K','k','s','S','K','ſ','1','!','😀'].map(value=>/^${atom}$/iu.test(value));`;
      const expected = run(source);
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      })!.code!;
      expect(run(reference)).toEqual(expected);
      for (const regexpUnicodePropertyEscapes of [false, true]) {
        const code = compile(source, {
          transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes },
        });
        expect(code).not.toMatch(/\/iu\b/);
        expect(run(code)).toEqual(expected);
      }
    });
  });
});
