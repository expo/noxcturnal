import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform, type PreflightTransforms } from '../../js';
const require = createRequire(import.meta.url);
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
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  const outcomes = new Map<string, { status: string; code?: string }>();
  let reference: string;
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      try {
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
      } catch (error) {
        // Preserve the exact compiler failure outside the expected-failure assertion.
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          'regexp-unicode-astral-class-postcondition-failed',
        );
        outcomes.set(mode, { status: 'thrown' });
      }
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
  test.fails.each(['inline', 'runtime'])('%s lowering accepts supported input', mode => {
    expect(outcomes.get(mode)?.status).toBe('complete');
  });
});
