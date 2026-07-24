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

test('supports caller-provided parser adapters for unsupported syntax', () => {
  const unregister = registerParserAdapter({
    name: 'flow-fixture',
    supports: route => route.syntax === 'flow',
    transform: source => ({
      status: 'complete',
      code: source,
      map: { mappings: '', names: [] },
      metadata: { adapter: true },
      diagnostics: [],
    }),
  });
  try {
    const result = transform(
      '// @flow\nconst value: number = 1',
      'fixture.js',
      defineNativePipeline({ phases: [] }),
    );
    assert.equal(result.status, 'complete');
    assert.equal(result.metadata.adapter, true);
  } finally {
    unregister();
  }
});
