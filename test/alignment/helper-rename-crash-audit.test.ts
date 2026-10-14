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
test('native source preserves the user binding', () => {
  expect(run(source)).toEqual(['a', 9]);
});
test('Babel reserves a non-conflicting named-regexp helper', () => {
  const reference = transformSync(source, {
    configFile: false,
    babelrc: false,
    sourceType: 'script',
    plugins: [require('@babel/plugin-transform-named-capturing-groups-regex')],
  });
  expect(reference?.code).toBeTypeOf('string');
  expect(run(reference!.code!)).toEqual(['a', 9]);
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
        transforms: { regexpNamedCaptureGroups: true },
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
  test.fails.each([false, true])('compact=%s preserves source without aborting', compact => {
    const child = results.get(compact)!;
    expect(child.status).toBe(0);
    expect(JSON.parse(child.stdout)).toEqual(['a', 9]);
  });
});
