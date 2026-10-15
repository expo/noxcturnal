import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';

describe('fallback branches', () => {
  const cases = [
    {
      name: 'string property outside a class',
      tail: String.raw`\p{RGI_Emoji_Flag_Sequence}`,
      inputs: ['a🇬🇧', 'a🇺🇸', 'az'],
      expected: [true, true, false],
    },
    {
      name: 'sole string property inside a class',
      tail: String.raw`[\p{RGI_Emoji_Flag_Sequence}]`,
      inputs: ['a🇬🇧', 'az'],
      expected: [true, false],
    },
    {
      name: 'string property and character union',
      tail: String.raw`[\p{RGI_Emoji_Flag_Sequence}z]`,
      inputs: ['a🇬🇧', 'az', 'ay'],
      expected: [true, true, false],
    },
    {
      name: 'sole string retains its quantified atom',
      tail: String.raw`[\q{ab}]+`,
      inputs: ['aab', 'aabab', 'aabb'],
      expected: [true, true, false],
    },
    {
      name: 'empty sole string remains an empty atom',
      tail: String.raw`[\q{}]`,
      inputs: ['a', 'aa'],
      expected: [true, false],
    },
    {
      name: 'empty member follows longer alternatives',
      tail: String.raw`[\q{|b}]`,
      inputs: ['a', 'ab', 'abb'],
      expected: [true, true, false],
    },
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>/^[a-z&&[^x]]${entry.tail}$/v.test(value));`;
        const standard = source.replace('[a-z&&', '[[a-z]&&');
        expect(() => new Function(source)).toThrow(SyntaxError);
        expect(run(standard)).toEqual(entry.expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(source, { transforms: { regexpUnicodeSets: true } });
        expect(code).not.toMatch(/\/v\b/);
        expect(code).not.toContain('\\q{');
        expect(code).not.toContain('\\p{RGI_Emoji_Flag_Sequence}');
        actual = run(code);
      });
      test('preserves membership through the textual fallback', () => {
        expect(actual).toEqual(entry.expected);
      });
    });

  test('named-group selection makes nonstandard range grammar a pristine bailout', () => {
    const source = String.raw`/* original */ globalThis.result = /(?<letter>[a-z&&[^x]])/v.test('a');`;
    const standard = source.replace('[a-z&&', '[[a-z]&&');
    expect(run(standard)).toBe(true);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [
        require('@babel/plugin-transform-unicode-sets-regex'),
        require('@babel/plugin-transform-named-capturing-groups-regex'),
      ],
    })!.code!;
    // Babel's named helper is inline for this comparison.
    expect(run(reference)).toBe(true);
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'audit',
            native: {
              transforms: { regexpUnicodeSets: true, regexpNamedCaptureGroups: true },
            },
          },
        ],
      }),
    );
    expect(result.status).toBe('bailout');
    if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
    expect(result.reason).toBe('audit:regexp-pattern-invalid');
    expect(result.source).toBe(source);
  });
});

describe('fallback order', () => {
  const cases = [
    {
      name: 'paired escape before code-point escape',
      members: String.raw`\uD83D\uDE00|\u{1F600}a`,
    },
    {
      name: 'paired escape before literal string',
      members: String.raw`\uD83D\uDE00|😀a`,
    },
    { name: 'code-point escape ordering', members: String.raw`\u{1F600}|😀a` },
    { name: 'literal ordering', members: '😀|😀a' },
  ];
  for (const entry of cases) {
    describe(entry.name, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `globalThis.result=/[a-z&&[^x]][\\q{${entry.members}}]/v.exec('a😀a')[0];`;
        const standard = source.replace('[a-z&&', '[[a-z]&&');
        // Direct range operands are an explicit Babel compatibility extension.
        expect(() => new Function(source)).toThrow(SyntaxError);
        expect(run(standard)).toBe('a😀a');
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
        })!.code!;
        expect(run(reference)).toBe('a😀a');
        const options = { transforms: { regexpUnicodeSets: true } } as const;
        const standardCode = compile(standard, options);
        expect(standardCode).not.toMatch(/\/v\b/);
        expect(run(standardCode)).toBe('a😀a');
        const code = compile(source, options);
        expect(code).not.toMatch(/\/v\b/);
        expect(code).not.toContain('\\q{');
        actual = run(code);
      });
      test('preserves longest string alternative', () => {
        expect(actual).toBe('a😀a');
      });
    });
  }
});

describe('set bailout', () => {
  for (const mode of ['inline', 'runtime'] as const) {
    for (const spelling of [String.raw`\uD800`, String.raw`a\uD800`]) {
      for (const position of ['before', 'after'] as const) {
        test(`${mode}: ${spelling} string bailout ${position} another rewritten literal`, () => {
          const candidate = `const candidate = /^[\\q{${spelling}|b}]$/v;`;
          const other = String.raw`const other = /(?<letter>.)/s;`;
          const source = `/* preserve this spacing */\n${position === 'before' ? candidate + other : other + candidate}\nglobalThis.result = candidate.test(${JSON.stringify(spelling.startsWith('a') ? 'a\uD800' : '\uD800')});`;
          expect(run(source)).toBe(true);
          const reference = transformSync(source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: ['unicode-sets-regex', 'named-capturing-groups-regex', 'dotall-regex'].map(
              name => require('@babel/plugin-transform-' + name),
            ),
          })!.code!;
          expect(run(reference)).toBe(true);
          const result = transform(
            source,
            'input.js',
            defineNativePipeline({
              phases: [
                {
                  name: 'audit',
                  native: {
                    transforms: {
                      regexpUnicodeSets: true,
                      regexpNamedCaptureGroups: true,
                      regexpDotAll: true,
                    },
                    helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                  },
                },
              ],
            }),
          );
          expect(result.status).toBe('bailout');
          if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
          expect(result.reason).toBe('audit:regexp-unicode-code-point-out-of-range');
          expect(result.source).toBe(source);
        });
      }
    }
    test(`${mode}: lone surrogate character range lowers successfully`, () => {
      const source = String.raw`globalThis.result = /^[\uD800]$/v.test('\uD800');`;
      expect(run(source)).toBe(true);
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'audit',
              native: {
                transforms: { regexpUnicodeSets: true },
                helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
              },
            },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      expect(result.code).not.toMatch(/\/v\b/);
      expect(run(result.code)).toBe(true);
    });
  }
});
