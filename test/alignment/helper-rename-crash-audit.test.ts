import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { nativePreflightOptions } from '../../js/native/binding';
const require = createRequire(import.meta.url);
const source = `const _wrapRegExp = 9; globalThis.result = [/(?<x>a)/.exec('a').groups.x, _wrapRegExp];`;
const cases = [
  { name: 'inline', mode: 'inline' as const, version: '7.29.7' },
  { name: 'runtime', mode: 'runtime' as const, version: '7.29.7' },
  { name: 'old-runtime fallback', mode: 'runtime' as const, version: '7.0.0' },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each([
  {
    name: 'regexp',
    source,
    transforms: { regexpNamedCaptureGroups: true },
    plugin: 'named-capturing-groups-regex',
    expected: ['a', 9],
  },
  {
    name: 'destructuring',
    source: 'const _toArray=9;const [a]=new Set([1]);globalThis.result=[a,_toArray];',
    transforms: { destructuring: true },
    plugin: 'destructuring',
    expected: [1, 9],
  },
  {
    name: 'classes',
    source:
      'const _construct=9;class A extends Array{}globalThis.result=[new A(2).length,_construct];',
    transforms: { classes: true },
    plugin: 'classes',
    expected: [2, 9],
  },
])('$name overlapping helper aliases', ({ source, transforms, plugin, expected }) => {
  test('native source preserves the user binding', () => {
    expect(run(source)).toEqual(expected);
  });
  test('Babel reserves a non-conflicting named-regexp helper', () => {
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-' + plugin)],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(run(reference!.code!)).toEqual(expected);
  });
  describe.each(cases)('$name', entry => {
    const results = new Map<boolean, SpawnSyncReturns<string>>();
    beforeAll(() => {
      // Importing nativePreflightOptions loads the same checked native artifact used by source tests.
      const binding = Object.keys(require.cache).find(filename =>
        /noxcturnal\.[^/]+\.node$/.test(filename),
      );
      expect(binding).toBeTypeOf('string');
      for (const compact of [false, true]) {
        const options = nativePreflightOptions({
          transforms,
          compact,
          helpers: { mode: entry.mode, moduleName: '@babel/runtime', version: entry.version },
        });
        const child = spawnSync(process.execPath, [], {
          encoding: 'utf8',
          timeout: 3000,
          input: `const native = require(${JSON.stringify(binding)});
          const result = native.runNativePipeline('input.js', ${JSON.stringify(source)}, [${JSON.stringify(options)}]);
          if (!result.code) throw new Error('Missing transformed output');
          const context = {};
          new Function('require', 'globalThis', result.code)(require, context);
          process.stdout.write(JSON.stringify(context.result));`,
        });
        expect(child.error).toBeUndefined();
        if (child.status !== 0) {
          if (process.platform !== 'win32') expect(child.signal).toBe('SIGABRT');
          expect(child.stderr).toContain('src/preflight/helpers.rs');
          expect(child.stderr).toContain(
            'assertion failed: !contains_identifier_token(&selected_source, binding)',
          );
        }
        results.set(compact, child);
      }
    });
    // The compiler panic remains outside the runner and outside expected-failure assertions.
    test.each([false, true])('compact=%s preserves source without aborting', compact => {
      const child = results.get(compact)!;
      expect(child.status).toBe(0);
      expect(JSON.parse(child.stdout)).toEqual(expected);
    });
  });
});
