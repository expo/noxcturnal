import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
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
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  const codes = new Map<string, string>();
  const failedCompilation = new Set<string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      try {
        const code = compile(entry.source, {
          transforms: entry.dotAll ? { regexpDotAll: true } : { regexpUnicode: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(entry.dotAll ? /\/sv\b/ : /\/u\b/);
        codes.set(mode, code);
      } catch (error) {
        expect(entry.name).toBe('escaped property-like literal is not a Unicode property escape');
        expect((error as Error).message).toContain(
          'regexp-unicode-property-prerequisite-postcondition-failed',
        );
        failedCompilation.add(mode);
      }
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
    expect(failedCompilation.has(mode)).toBe(false);
    expect(run(codes.get(mode)!)).toEqual(entry.expected);
  });
});
