import type { PreflightTransforms } from '../../js';
import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('empty', () => {
  const cases = [
    {
      name: 'an empty-only string set remains a valid regexp literal',
      source: String.raw`globalThis.result = /[\q{}]/v.test('');`,
      expected: true,
    },
    {
      name: 'empty string alternatives follow one-character matches',
      source: String.raw`globalThis.result = /[\q{|a}]/v.exec('a')[0];`,
      expected: 'a',
    },
  ];
  describe.each(cases)('$name', entry => {
    const codes = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(entry.source, {
          transforms: { regexpUnicodeSets: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toContain('\\q{');
        codes.set(mode, code);
      }
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      });
      expect(reference?.code).toBeTypeOf('string');
      codes.set('babel', reference!.code!);
    });
    test('native semantics', () => expect(run(entry.source)).toEqual(entry.expected));
    test('Babel lowering preserves semantics', () =>
      expect(run(codes.get('babel')!)).toEqual(entry.expected));
    test.each(['inline', 'runtime'])('%s lowering preserves semantics', mode => {
      expect(run(codes.get(mode)!)).toEqual(entry.expected);
    });
  });
});

describe('string atom', () => {
  const inputs = ['ab', 'abab', 'abb', 'abcd', '😀a😀a', '😀aa'];
  const cases = [
    {
      name: 'single string retains plus atom',
      pattern: String.raw`/^[\q{ab}]+$/v`,
      expected: [true, true, false, false, false, false],
    },
    {
      name: 'single string retains bounded repetition atom',
      pattern: String.raw`/^[\q{ab}]{2}$/v`,
      expected: [false, true, false, false, false, false],
    },
    {
      name: 'deduplicated strings retain their atom',
      pattern: String.raw`/^[\q{ab|ab}]+$/v`,
      expected: [true, true, false, false, false, false],
    },
    {
      name: 'distinct strings retain the alternation atom',
      pattern: String.raw`/^[\q{ab|cd}]+$/v`,
      expected: [true, true, false, true, false, false],
    },
    {
      name: 'supplementary string retains its whole atom',
      pattern: String.raw`/^[\q{😀a}]+$/v`,
      expected: [false, false, false, false, true, false],
    },
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>${entry.pattern}.test(value));`;
        expect(run(source)).toEqual(entry.expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(source, { transforms: { regexpUnicodeSets: true } });
        expect(code).not.toContain('\\q{');
        expect(code).not.toMatch(/\/v\b/);
        actual = run(code);
      });
      test('preserves quantified string membership', () => {
        expect(actual).toEqual(entry.expected);
      });
    });
});

describe('string render', () => {
  const cases = [
    { name: 'line feed', escape: String.raw`\n`, value: '\n' },
    { name: 'carriage return', escape: String.raw`\r`, value: '\r' },
    { name: 'line separator', escape: String.raw`\u2028`, value: '\u2028' },
    { name: 'paragraph separator', escape: String.raw`\u2029`, value: '\u2029' },
    { name: 'NUL', escape: String.raw`\x00`, value: '\0' },
    {
      name: 'escaped slash and metacharacters',
      escape: String.raw`\/\.\*`,
      value: '/.*',
    },
  ];
  function execute(fn: Function): unknown {
    const context: Record<string, unknown> = {};
    fn(context);
    return context.result;
  }
  for (const entry of cases) {
    describe(entry.name, () => {
      let parseError: unknown;
      let actual: unknown;
      beforeAll(() => {
        const inputs = [`a${entry.value}`, 'b', 'a', 'c'];
        const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^[\\q{a${entry.escape}|b}]$/v.test(value));`;
        const expected = [true, true, false, false];
        expect(execute(new Function('globalThis', source))).toEqual(expected);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
        })!.code!;
        expect(execute(new Function('globalThis', reference))).toEqual(expected);
        const code = compile(source, { transforms: { regexpUnicodeSets: true } });
        expect(code).not.toContain('\\q{');
        expect(code).not.toMatch(/\/v\b/);
        let fn: Function | undefined;
        try {
          fn = new Function('globalThis', code);
        } catch (error) {
          if (!(error instanceof SyntaxError)) throw error;
          parseError = error;
        }
        if (fn) actual = execute(fn);
      });
      test('emits a valid literal with equivalent membership', () => {
        expect(parseError).toBeUndefined();
        expect(actual).toEqual([true, true, false, false]);
      });
    });
  }
});

describe('set casefold', () => {
  const inputs = ['a', 'A', 'k', 'K', '1', '-'];
  const cases = [
    {
      name: 'case folding precedes Unicode-set intersection',
      pattern: String.raw`/^[[a-z]&&[A-Z]]$/iv`,
      expected: [true, true, true, true, false, false],
    },
    {
      name: 'case folding precedes Unicode-set subtraction',
      pattern: String.raw`/^[\p{ASCII}--[a-z]]$/iv`,
      expected: [false, false, false, false, true, true],
    },
    {
      name: 'case folding precedes Unicode-set complement',
      pattern: String.raw`/^[^\p{Lowercase_Letter}]$/iv`,
      expected: [false, false, false, false, true, true],
    },
  ];

  describe.each(cases)('$name', entry => {
    const source = `globalThis.result = ${JSON.stringify(inputs)}.map(value => ${entry.pattern}.test(value));`;
    const outputs = new Map<string, string>();
    beforeAll(() => {
      for (const mode of ['inline', 'runtime'] as const) {
        const code = compile(source, {
          transforms: { regexpUnicodeSets: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/\/iv\b/);
        outputs.set(mode, code);
      }
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      });
      expect(reference?.code).toBeTypeOf('string');
      outputs.set('babel', reference!.code!);
    });
    test('native set semantics', () => {
      expect(run(source)).toEqual(entry.expected);
    });
    test('Babel set semantics', () => {
      expect(run(outputs.get('babel')!)).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'])('%s transform preserves set semantics', mode => {
      expect(run(outputs.get(mode)!)).toEqual(entry.expected);
    });
  });
});

describe('uppercase singleton string-set alternative', () => {
  const source = String.raw`globalThis.result=['a','A','ab','AB'].map(value=>/^[\q{ab|A}]$/iv.test(value));`;
  // ECMA-262 CompileToCharSet and MaybeSimpleCaseFolding fold each string element.
  // Node 22/24's native v-mode case is not the oracle for this disputed boundary.
  const control = String.raw`globalThis.result=['a','A','ab','AB'].map(value=>/^(?:ab|a)$/iu.test(value));`;
  test('explicit folded-alternative control accepts all four inputs', () =>
    expect(run(control)).toEqual([true, true, true, true]));
  test('Babel preserves the folded alternative', () => {
    const code = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
    })!.code!;
    expect(code).not.toContain('\\q{');
    expect(run(code)).toEqual([true, true, true, true]);
  });
  test.each(['inline', 'runtime'] as const)('%s preserves the folded alternative', mode => {
    const code = compile(source, {
      transforms: { regexpUnicodeSets: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toContain('\\q{');
    expect(run(code)).toEqual([true, true, true, true]);
  });
});

test('standalone v negative property complements folded membership', () => {
  const source = String.raw`globalThis.result=['a','A','K','1'].map(value=>/^\P{Lowercase_Letter}$/iv.test(value));`;
  const code = compile(source, { transforms: { regexpUnicodeSets: true } });
  expect(code).not.toMatch(/\/iv\b/);
  expect(run(code)).toEqual(run(source));
});

describe('folded set and string composition', () => {
  const cases: {
    name: string;
    pattern: string;
    inputs: string[];
    transforms: PreflightTransforms;
    plugins: string[];
    standard?: string;
  }[] = [
    {
      name: 'fallback set folding precedes intersection',
      pattern: '/^[a-z&&[A-Z]]$/iv',
      standard: '/^[[a-z]&&[A-Z]]$/iv',
      inputs: ['a', 'A', 'K', 'k', '1'],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
    },
    {
      name: 'fallback set folding precedes complemented operand',
      pattern: '/^[a-z&&[^A-Z]]$/iv',
      standard: '/^[[a-z]&&[^A-Z]]$/iv',
      inputs: ['a', 'A', 'K', 'k', '1'],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
    },
    {
      name: 'string intersection folds each operand',
      pattern: String.raw`/^[\q{ab|cd}&&\q{AB}]$/iv`,
      inputs: ['ab', 'AB', 'cd', 'CD'],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
    },
    {
      name: 'negative property folds before set complement',
      pattern: String.raw`/^[\P{Lowercase_Letter}]$/iv`,
      inputs: ['a', 'A', 'k', 'K', '1'],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
    },
    {
      name: 'negative word set keeps Unicode case-fold exclusions',
      pattern: String.raw`/^[\W]$/iv`,
      inputs: ['s', 'ſ', 'k', 'K', '!'],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
    },
    {
      name: 'empty string alternative follows a consuming range',
      pattern: String.raw`/[\q{|a}]/v`,
      inputs: ['a', 'b', ''],
      transforms: { regexpUnicodeSets: true },
      plugins: ['unicode-sets-regex'],
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
