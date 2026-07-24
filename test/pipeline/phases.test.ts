import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import type { SourceFragment } from '../../dist/index.js';
import {
  classify,
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../../dist/index.js';
import { NativeTransformSession } from '../../dist/runtime/session.js';
import { native } from '../../dist/native/binding.js';
import { packEdits } from '../../dist/protocol/edits.js';
import { decodeRoutedEnvelope } from '../../dist/protocol/events.js';
import { packRouteManifest } from '../../dist/protocol/manifest.js';

const ALL_RETAINED_CAPABILITIES = (1 << 6) - 1;
const openRetained = (
  source: string,
  filename: string,
  options: ConstructorParameters<typeof NativeTransformSession>[2] = {},
) =>
  new NativeTransformSession(
    source,
    filename,
    options,
    packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES),
  );

test('keys scheduler classification and phase planning', () => {
  const pipeline = defineNativePipeline({ phases: [{ name: 'transform', plugins: [] }] });
  const js = transformClassificationCacheKey(pipeline, 'fixture.js', 'const value = 1');
  const flow = transformClassificationCacheKey(
    pipeline,
    'fixture.js',
    '// @flow\nconst value: number = 1',
  );
  assert.notEqual(js, flow);
  assert.equal(js, transformClassificationCacheKey(pipeline, 'fixture.js', 'const other = 2'));
});

test('compiles conservative phase boundaries and edit effects', () => {
  const text = defineNativePlugin({ name: 'text', editEffect: 'text-only' });
  const unknown = defineNativePlugin({ name: 'unknown' });
  const plans = compilePhasePlan(
    defineNativePipeline({
      phases: [
        { name: 'text', plugins: [text], observes: 'current-ast' },
        { name: 'original-observer', plugins: [text], observes: 'original' },
        { name: 'compiler', plugins: [unknown], observes: 'rendered-source' },
      ],
    }),
  );
  assert.equal(plans[0].editEffect, 'text-only');
  assert.equal(plans[1].canReuseAst, true);
  assert.equal(plans[2].boundaryBefore, true);
  assert.equal(plans[2].editEffect, 'whole-program');
  assert.ok(Object.isFrozen(plans));
  assert.throws(
    () =>
      compilePhasePlan(
        defineNativePipeline({
          phases: [
            {
              name: 'invalid',
              plugins: [],
              editEffect: 'sometimes' as never,
            },
          ],
        }),
      ),
    /invalid edit effect/,
  );
});

test('rejects edits that violate a none effect contract', () => {
  const plugin = defineNativePlugin({
    name: 'false-none-contract',
    editEffect: 'none',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('changed');
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
      ),
    /declared edit effect none but emitted edits/,
  );
});

test('defers text-only rendering across phases that observe the retained AST', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'edit-text',
    prepare: () => ({ editEffect: 'text-only' }),
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('renamed');
      }),
    ],
  });
  const observe = defineNativePlugin({
    name: 'observe-original-ast',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        observed = path.sourceText();
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [edit], observes: 'current-ast' },
        { name: 'observe', plugins: [observe], observes: 'current-ast' },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'value');
  assert.equal(result.code, 'const renamed = 1');
  const performance = result.metadata.performance as {
    reparses: number;
    nativeParses: number;
    phaseExecutions: { editEffect: string; render: string; reusedParse: boolean }[];
  };
  assert.equal(performance.reparses, 0);
  assert.equal(performance.nativeParses, 1);
  assert.deepEqual(
    performance.phaseExecutions.map(phase => [phase.editEffect, phase.render, phase.reusedParse]),
    [
      ['text-only', 'deferred', false],
      ['whole-program', 'committed', true],
    ],
  );
});

test('runs original observers against pristine source after a rendered boundary', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'rendered-edit',
    editEffect: 'whole-program',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('renamed');
      }),
    ],
  });
  const observe = defineNativePlugin({
    name: 'original-observer',
    editEffect: 'none',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        observed = path.sourceText();
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'render', plugins: [edit], observes: 'current-ast' },
        { name: 'original', plugins: [observe], observes: 'original' },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'value');
  assert.equal(result.code, 'const renamed = 1');
  const performance = result.metadata.performance as {
    nativeParses: number;
    phaseExecutions: { source: string; render: string; reusedParse: boolean }[];
  };
  assert.equal(performance.nativeParses, 2);
  assert.deepEqual(performance.phaseExecutions[1], {
    name: 'original',
    observes: 'original',
    editEffect: 'none',
    source: 'original',
    reusedParse: false,
    render: 'unchanged',
  });
});

test('rejects ambiguous original-source edits after rendering', () => {
  const edit = (name: string) =>
    defineNativePlugin({
      name,
      editEffect: 'whole-program',
      visitors: [
        defineVisitor('Identifier', {}, path => {
          path.replaceWith('renamed');
        }),
      ],
    });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({
          phases: [
            { name: 'render', plugins: [edit('first')] },
            { name: 'original-edit', plugins: [edit('second')], observes: 'original' },
          ],
        }),
      ),
    /edits against original source are ambiguous/,
  );
});

test('realizes an explicitly required map once and reuses it at final composition', () => {
  const edit = defineNativePlugin({
    name: 'mapped-edit',
    editEffect: 'text-only',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith({
          code: 'renamed',
          mapping: 'anchor-boundaries',
          names: ['value'],
        });
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'mapped',
          plugins: [edit],
          requiresRealizedMap: true,
        },
        {
          name: 'observe-rendered',
          plugins: [],
          observes: 'rendered-source',
        },
      ],
    }),
    { debugPerformance: true, sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamed = 1');
  assert.deepEqual(result.map.names, ['value']);
  const performance = result.metadata.performance as {
    mapEncodes: number;
    mappingSegments: number;
  };
  assert.equal(performance.mapEncodes, 1);
  assert.ok(performance.mappingSegments > 0);
});
