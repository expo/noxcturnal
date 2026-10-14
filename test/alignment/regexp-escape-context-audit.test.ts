import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
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
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
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
  test.fails.each(['inline', 'runtime'])('%s lowering preserves native semantics', mode => {
    expect(run(codes.get(mode)!)).toEqual(entry.expected);
  });
});
