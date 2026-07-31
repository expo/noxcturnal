import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
} from '../../index';
test('supports caller-provided parser adapters for unsupported syntax', () => {
  const pipeline = defineNativePipeline({ phases: [] });
  const unregister = registerParserAdapter({
    name: 'flow-fixture',
    version: '1.0.0',
    options: { flow: 'detect' },
    supports: route => route.syntax === 'flow',
    compile: source => ({
      status: 'complete',
      code: source.replace(': number', ''),
      map: { mappings: 'AAAA', names: [] },
      syntax: 'js',
      metadata: { adapter: true },
    }),
  });
  try {
    // Named explicitly: a build with the `flow_parser` feature would otherwise
    // erase the file natively before any adapter is consulted.
    const result = transform('// @flow\nconst value: number = 1', 'fixture.js', pipeline, {
      parserAdapter: 'flow-fixture',
    });
    assert.equal(result.status, 'complete');
    assert.deepEqual(result.metadata.sourceAdapter, { adapter: true });
    assert.equal(result.code, '// @flow\nconst value = 1');
    assert.deepEqual(
      originalPositionFor(new TraceMap({ version: 3, sources: ['fixture.js'], ...result.map }), {
        line: 1,
        column: 0,
      }),
      { source: 'fixture.js', line: 1, column: 0, name: null },
    );
    assert.notEqual(
      pipelineCacheKey(pipeline, 'fixture.js'),
      pipelineCacheKey(pipeline, 'fixture.js', { parserAdapter: 'flow-fixture' }),
    );
  } finally {
    unregister();
  }
});

test('keys parser adapter version and options and preserves unsupported reasons', () => {
  const pipeline = defineNativePipeline({ phases: [] });
  const register = (version: string, flow: string) =>
    registerParserAdapter({
      name: 'flow-versioned',
      version,
      options: { flow },
      supports: route => route.syntax === 'flow',
      compile: () => ({ status: 'unsupported', reason: `unsupported-${version}` }),
    });

  let unregister = register('1.0.0', 'detect');
  const first = pipelineCacheKey(pipeline, 'fixture.js', { parserAdapter: 'flow-versioned' });
  const result = transform('// @flow\ncomponent C() {}', 'fixture.js', pipeline, {
    parserAdapter: 'flow-versioned',
  });
  assert.deepEqual(result, {
    status: 'bailout',
    reason: 'unsupported-1.0.0',
    source: '// @flow\ncomponent C() {}',
    diagnostics: [],
  });
  unregister();

  unregister = register('1.1.0', 'all');
  try {
    assert.notEqual(
      first,
      pipelineCacheKey(pipeline, 'fixture.js', { parserAdapter: 'flow-versioned' }),
    );
  } finally {
    unregister();
  }
});

test('continues native parsing in the syntax mode declared by a source adapter', () => {
  let sawJsx = false;
  const unregister = registerParserAdapter({
    name: 'flow-jsx',
    version: '1.0.0',
    supports: route => route.syntax === 'flow',
    compile: source => ({
      status: 'complete',
      code: source.replace(': number', ''),
      map: { mappings: 'AAAA', names: [] },
      syntax: 'jsx',
    }),
  });
  try {
    const result = transform(
      '// @flow\nconst view: number = <View />;',
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'observe-jsx',
            plugins: [
              defineNativePlugin({
                name: 'jsx-observer',
                visitors: [
                  defineVisitor('JSXElement', {}, () => {
                    sawJsx = true;
                  }),
                ],
              }),
            ],
          },
          {
            name: 'lower-jsx',
            native: { jsx: 'automatic' },
          },
        ],
      }),
      { parser: 'js', functionMap: true },
    );
    assert.equal(result.status, 'complete');
    assert.equal(sawJsx, true);
    assert.doesNotMatch(result.code, /<View \/>/);
    assert.match(result.code, /react\/jsx-runtime/);
    assert.ok(result.functionMap);
  } finally {
    unregister();
  }
});
