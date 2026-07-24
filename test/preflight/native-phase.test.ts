import assert from 'node:assert/strict';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  pipelineCacheKey,
  transform,
} from '../../dist/index.js';

test('freezes native options and includes them in the pipeline cache key', () => {
  const options = {
    typescript: 'strip' as const,
    transforms: { classStaticBlock: true as const },
    helpers: { mode: 'runtime' as const, moduleName: '@babel/runtime', version: '7.0.0' },
  };
  const pipeline = defineNativePipeline({
    phases: [{ name: 'preflight', native: options }],
  });
  options.helpers.moduleName = 'mutated-after-definition';

  assert.ok(Object.isFrozen(pipeline.phases[0].native));
  assert.ok(Object.isFrozen(pipeline.phases[0].native?.helpers));
  assert.ok(Object.isFrozen(pipeline.phases[0].native?.transforms));
  assert.equal(pipeline.phases[0].native?.helpers?.moduleName, '@babel/runtime');
  assert.notEqual(
    pipelineCacheKey(pipeline, 'fixture.ts'),
    pipelineCacheKey(
      defineNativePipeline({
        phases: [
          {
            name: 'preflight',
            native: {
              typescript: 'strip',
              helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.1.0' },
            },
          },
        ],
      }),
      'fixture.ts',
    ),
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [{ name: 'invalid', native: {}, plugins: [] }],
      }),
    /cannot contain visitor plugins/,
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid-transform',
            native: { transforms: { classStaticBlock: false as never } },
          },
        ],
      }),
    /must be true or absent/,
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'unknown-transform',
            native: { transforms: { targetPreset: true } as never },
          },
        ],
      }),
    /unknown native transform targetPreset/,
  );
});

test('runs a fused native TypeScript phase and reports its own timing', () => {
  const result = transform(
    'const value: number = 1;',
    'fixture.ts',
    defineNativePipeline({
      phases: [{ name: 'preflight', native: { typescript: 'strip' } }],
    }),
    { debugPerformance: true },
  );

  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 1;\n');
  assert.notEqual(result.map.mappings, '');
  const performance = result.metadata.performance as {
    nativeTransformMs: number;
    nativeParses: number;
    phaseExecutions: { name: string; nativeTransformMs: number }[];
  };
  assert.equal(performance.nativeParses, 1);
  assert.ok(performance.nativeTransformMs > 0);
  assert.equal(performance.phaseExecutions[0].name, 'preflight');
  assert.ok(performance.phaseExecutions[0].nativeTransformMs > 0);
});

test('composes a native decoded layer with a following visitor layer', () => {
  const replace = defineNativePlugin({
    name: 'replace',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '200', mapping: 'anchor-start' }),
      ),
    ],
  });
  const result = transform(
    'const value: number = 1;',
    'fixture.ts',
    defineNativePipeline({
      phases: [
        { name: 'preflight', native: { typescript: 'strip' } },
        { name: 'visitor', plugins: [replace] },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 200;\n');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.ts'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 14 }), {
    source: 'fixture.ts',
    line: 1,
    column: 22,
    name: null,
  });
});

test('returns a pristine structured bailout for a requested unavailable transform', () => {
  const source = 'const pristine = true;';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'preflight', native: { transforms: { blockScoping: true } } }],
    }),
  );

  assert.deepEqual(result, {
    status: 'bailout',
    reason: 'preflight:block-scoping-not-implemented',
    source,
    diagnostics: [],
  });
});
