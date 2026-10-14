import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import type { PreflightTransforms } from '../../js';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
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
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
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
  test('native preserves the scoped flag', () => expect(run(entry.source)).toEqual(entry.expected));
  test('Babel preserves the scoped flag', () =>
    expect(run(codes.get('babel')!)).toEqual(entry.expected));
  test.fails.each(['inline', 'runtime'])('%s lowering preserves the scoped flag', mode => {
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
