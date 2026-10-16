import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { defineNativePipeline, transform, type PreflightTransforms } from '../../js';

describe('name context', () => {
  const source = `globalThis.result = /(?<𝒜>a)/u.exec('a').groups['𝒜'];`;
  const codes = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { regexpUnicode: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('/u');
      codes.set(mode, code);
    }
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-unicode-regex')],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(reference!.code!).not.toContain('/u');
    codes.set('babel', reference!.code!);
  });
  test('native preserves a supplementary capture identifier', () => {
    expect(run(source)).toBe('a');
  });
  test('Babel Unicode lowering preserves a supplementary capture identifier', () => {
    expect(run(codes.get('babel')!)).toBe('a');
  });
  test.each(['inline', 'runtime'])(
    '%s Unicode lowering preserves a supplementary capture identifier',
    mode => {
      expect(run(codes.get(mode)!)).toBe('a');
    },
  );
  test('Unicode lowering preserves a BMP escaped capture identifier', () => {
    const control = String.raw`globalThis.result = /(?<\u0061>a)/u.exec('a').groups.a;`;
    expect(run(control)).toBe('a');
    const reference = transformSync(control, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-unicode-regex')],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(reference!.code!).not.toContain('/u');
    expect(run(reference!.code!)).toBe('a');
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(control, {
        transforms: { regexpUnicode: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('/u');
      expect(run(code)).toBe('a');
    }
  });
});

describe('name unicode', () => {
  function run(fn: Function): unknown {
    const context: Record<string, unknown> = {};
    fn(context);
    return context.result;
  }
  for (const [name, pattern] of [
    ['literal supplementary name', String.raw`/(?<𐐀>a)\k<𐐀>/u`],
    ['braced escape supplementary name', String.raw`/(?<\u{10400}>a)\k<\u{10400}>/u`],
  ]) {
    describe(name, () => {
      const source = `globalThis.result=${pattern}.exec('aa').groups['𐐀'];`;
      let parseError: unknown;
      let actual: unknown;
      beforeAll(() => {
        expect(run(new Function('globalThis', source))).toBe('a');
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-regex')],
        })!.code!;
        expect(run(new Function('globalThis', reference))).toBe('a');
        const code = compile(source, { transforms: { regexpUnicode: true } });
        expect(code).not.toMatch(/\/u\b/);
        let fn: Function | undefined;
        try {
          fn = new Function('globalThis', code);
        } catch (error) {
          if (!(error instanceof SyntaxError)) throw error;
          parseError = error;
        }
        if (fn) actual = run(fn);
      });
      test('Unicode-only lowering preserves valid capture names', () => {
        expect(parseError).toBeUndefined();
        expect(actual).toBe('a');
      });
      test('explicit named-group lowering removes identifier context before Unicode lowering', () => {
        const code = compile(source, {
          transforms: { regexpUnicode: true, regexpNamedCaptureGroups: true },
        });
        expect(code).not.toMatch(/\(\?<|\\k<|\/u\b/);
        expect(run(new Function('globalThis', code))).toBe('a');
      });
    });
  }
});

describe('combination', () => {
  const cases: {
    name: string;
    source: string;
    transforms: PreflightTransforms;
    plugins: string[];
    expected: unknown;
  }[] = [
    {
      name: 'singleton astral Unicode character class',
      source: `globalThis.result = ['😀', 'a'].map(value => /^[😀]$/u.test(value));`,
      transforms: { regexpUnicode: true },
      plugins: ['unicode-regex'],
      expected: [true, false],
    },
    {
      name: 'named Unicode string-set composition containing an astral singleton',
      source: String.raw`globalThis.result = ['😀😀', 'abab', '😀ab', 'ab😀'].map(value => /^(?<x>[\q{😀|ab}])\k<x>$/v.test(value));`,
      transforms: { regexpUnicodeSets: true, regexpNamedCaptureGroups: true, regexpUnicode: true },
      plugins: ['named-capturing-groups-regex', 'unicode-sets-regex', 'unicode-regex'],
      expected: [true, true, false, false],
    },
  ];
  describe.each(cases)('$name', entry => {
    const outcomes = new Map<string, { status: string; code?: string }>();
    let reference: string;
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const result = transform(
          entry.source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'audit',
                native: {
                  transforms: entry.transforms,
                  helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                },
              },
            ],
          }),
        );
        outcomes.set(
          mode,
          result.status === 'complete'
            ? { status: result.status, code: result.code }
            : { status: result.status },
        );
      }
      const result = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: entry.plugins.map(plugin => require('@babel/plugin-transform-' + plugin)),
      });
      expect(result?.code).toBeTypeOf('string');
      reference = result!.code!;
    });
    test('native accepts and executes the pattern', () =>
      expect(run(entry.source)).toEqual(entry.expected));
    test('Babel accepts and lowers the pattern', () => {
      expect(reference).not.toMatch(/\(\?<x>|\\q\{|\/[uv]\b/);
      expect(run(reference)).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'])('%s lowering accepts supported input', mode => {
      expect(outcomes.get(mode)?.status).toBe('complete');
      const code = outcomes.get(mode)!.code!;
      expect(code).not.toMatch(/\(\?<x>|\\q\{|\/[uv]\b/);
      expect(run(code)).toEqual(entry.expected);
    });
  });
});

describe('named reference compatibility', () => {
  function babel(source: string, plugin: string): string {
    return transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-' + plugin)],
    })!.code!;
  }
  describe('escaped declaration with a literal reference', () => {
    const source = String.raw`globalThis.result=/^(?<\uD835\uDC9C>a)\k<𝒜>$/u.test('aa');`;
    test('identity selection accepts the source without structural regexp parsing', () =>
      expect(run(compile(source, { transforms: {} }))).toBe(true));
    test('Babel accepts the equivalent names', () =>
      expect(run(babel(source, 'named-capturing-groups-regex'))).toBe(true));
    test.each(['inline', 'runtime'] as const)(
      '%s lowers equivalent names and matches Babel behavior',
      mode => {
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'regexp',
                native: {
                  helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                  transforms: { regexpNamedCaptureGroups: true },
                },
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status === 'complete') {
          expect(result.code).not.toContain('(?<');
          expect(run(result.code)).toBe(run(babel(source, 'named-capturing-groups-regex')));
        }
      },
    );
  });
  describe('duplicate named quantified reference', () => {
    const source = String.raw`globalThis.result=['aaa','bbb'].map(value=>/^(?:(?<x>a)|(?<x>b))\k<x>+$/.test(value));`;
    const control = String.raw`globalThis.result=['aaa','bbb'].map(value=>/^(?:(a)|(b))(?:\1\2)+$/.test(value));`;
    const codes = new Map<string, string>();
    let babelError: unknown;
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(source, {
          transforms: { regexpNamedCaptureGroups: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toContain('(?<x>');
        codes.set(mode, code);
      }
      try {
        babel(source, 'named-capturing-groups-regex');
      } catch (error) {
        babelError = error;
      }
    });
    const supported = (() => {
      try {
        new RegExp('(?<x>a)|(?<x>b)');
        return true;
      } catch {
        return false;
      }
    })();
    test.skipIf(!supported)('capable native runtime executes the original pattern', () =>
      expect(run(source)).toEqual([true, true]),
    );
    test('numbered control agrees with the direct capable-runtime oracle', () =>
      expect(run(control)).toEqual([true, true]));
    test('pinned Babel has no successful semantic baseline for this shape', () => {
      expect(babelError).toBeInstanceOf(Error);
      expect((babelError as Error).message).toContain('Invalid node type: alternative');
    });
    test.each(['inline', 'runtime'])('%s repeats the selected capture', mode =>
      expect(run(codes.get(mode)!)).toEqual([true, true]),
    );
  });
});
