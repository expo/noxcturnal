import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
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
