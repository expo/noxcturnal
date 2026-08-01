import assert from 'node:assert/strict';

import { transformSync, types as t, type PluginObj } from '@babel/core';
import { minVersion } from '@babel/helpers';
import transformRuntime from '@babel/plugin-transform-runtime';
import { test } from 'vitest';

function requestHelpers(names: string[]): PluginObj {
  return {
    visitor: {
      Program(path, state) {
        const file = state.file as typeof state.file & {
          addHelper(name: string): ReturnType<typeof t.identifier>;
        };
        for (const name of names) {
          const helper = file.addHelper(name);
          path.pushContainer('body', t.expressionStatement(t.callExpression(helper, [])));
        }
      },
    },
  };
}

function babelOutput(
  names: string[],
  version?: string,
  sourceType: 'module' | 'script' = 'script',
) {
  const runtimeOptions = version === undefined ? {} : { version };
  return transformSync(sourceType === 'module' ? 'export {}' : '', {
    babelrc: false,
    configFile: false,
    compact: false,
    sourceType,
    plugins: [[transformRuntime, runtimeOptions], requestHelpers(names)],
  })!.code!;
}

test('pinned Babel exact-version helper boundary is executable evidence', () => {
  assert.equal(minVersion('usingCtx'), '7.23.9');
  for (const [version, runtime] of [
    ['7.23.8', false],
    ['7.23.9', true],
    ['7.24.0', true],
    ['7.23.9-beta.0', false],
    ['8.0.0', false],
  ] as const) {
    const code = babelOutput(['usingCtx'], version);
    assert.equal(code.includes('@babel/runtime/helpers/usingCtx'), runtime, `${version}:\n${code}`);
    assert.equal((code.match(/function _usingCtx/g) ?? []).length, runtime ? 0 : 1, code);
  }
});

test('pinned Babel emits runtime and inline helpers together with structural module imports', () => {
  const script = babelOutput(['asyncToGenerator', 'usingCtx'], '7.20.0');
  assert.match(script, /require\("@babel\/runtime\/helpers\/asyncToGenerator"\)/);
  assert.doesNotMatch(script, /require\("@babel\/runtime\/helpers\/usingCtx"\)/);
  assert.match(script, /function _usingCtx/);

  const module = babelOutput(['asyncToGenerator', 'usingCtx'], '7.20.0', 'module');
  assert.match(
    module,
    /import _asyncToGenerator from "@babel\/runtime\/helpers\/asyncToGenerator"/,
  );
  assert.doesNotMatch(module, /@babel\/runtime\/helpers\/usingCtx/);
  assert.match(module, /function _usingCtx/);
});

test('pinned Babel omitted, empty, and malformed version behavior stays visible', () => {
  assert.doesNotMatch(babelOutput(['usingCtx']), /@babel\/runtime\/helpers\/usingCtx/);
  assert.doesNotMatch(babelOutput(['usingCtx'], ''), /@babel\/runtime\/helpers\/usingCtx/);
  assert.throws(() => babelOutput(['usingCtx'], 'not-semver'));
});
