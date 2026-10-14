import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
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
  test.fails.each(['inline', 'runtime'])('%s lowering preserves semantics', mode => {
    expect(run(codes.get(mode)!)).toEqual(entry.expected);
  });
});
