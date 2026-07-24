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

test('loads the Noxcturnal binding and classifies parser routes', () => {
  assert.deepEqual(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');
  assert.equal(classify('fixture.js', '// @flow\nconst x: number = 1').supported, false);
});

test('rejects malformed routed string tables before decoding records', () => {
  const invalidCount = Buffer.alloc(32);
  invalidCount.writeUInt32LE(0x4e525446, 0);
  invalidCount.writeUInt32LE(1, 20);
  invalidCount.writeUInt32LE(32, 24);
  assert.throws(() => decodeRoutedEnvelope(invalidCount), /string count/);

  const invalidLength = Buffer.alloc(36);
  invalidLength.writeUInt32LE(0x4e525446, 0);
  invalidLength.writeUInt32LE(1, 20);
  invalidLength.writeUInt32LE(36, 24);
  invalidLength.writeUInt32LE(100, 32);
  assert.throws(() => decodeRoutedEnvelope(invalidLength), /string length/);

  const invalidParents = Buffer.alloc(32);
  invalidParents.writeUInt32LE(0x4e525446, 0);
  invalidParents.writeUInt32LE(32, 24);
  invalidParents.writeUInt32LE(4, 28);
  assert.throws(() => decodeRoutedEnvelope(invalidParents), /string count/);

  const empty = Buffer.alloc(32);
  empty.writeUInt32LE(0x4e525446, 0);
  empty.writeUInt32LE(32, 24);
  assert.throws(() => decodeRoutedEnvelope(empty).stringAt(0), /string id/);
});
