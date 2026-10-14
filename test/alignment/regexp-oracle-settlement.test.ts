import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
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
    '%s preserves the source at the structural parser boundary',
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
      expect(result.status).toBe('bailout');
      if (result.status === 'bailout') {
        expect(result.source).toBe(source);
        expect(result.reason).toBe('regexp:parse-error');
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
describe('uppercase singleton string-set alternative', () => {
  const source = String.raw`globalThis.result=['a','A','ab','AB'].map(value=>/^[\q{ab|A}]$/iv.test(value));`;
  // ECMA-262 CompileToCharSet and MaybeSimpleCaseFolding fold each string element.
  // Node 22/24's native v-mode case is not the oracle for this disputed boundary.
  const control = String.raw`globalThis.result=['a','A','ab','AB'].map(value=>/^(?:ab|a)$/iu.test(value));`;
  test('explicit folded-alternative control accepts all four inputs', () =>
    expect(run(control)).toEqual([true, true, true, true]));
  test('Babel preserves the folded alternative', () => {
    const code = babel(source, 'unicode-sets-regex');
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
