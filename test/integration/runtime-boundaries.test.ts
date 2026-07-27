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

test('enforces native memory and follow-up batch budgets', () => {
  assert.throws(
    () => openRetained('const value = 1', 'fixture.js', { maxNativeMemoryBytes: 1 }),
    /native-memory-budget-exceeded/,
  );
  const session = openRetained('const value = 1', 'fixture.js', {
    maxFollowUpBatches: 1,
  });
  session.nextRoutedPacked(packRouteManifest([], false, false));
  assert.throws(
    () => session.nextRoutedPacked(packRouteManifest([], false, false)),
    /follow-up-batch-budget-exceeded/,
  );
  session.close();
});

test('does not impose an arbitrary follow-up batch limit by default', () => {
  const session = openRetained('const value = 1', 'fixture.js');
  const manifest = packRouteManifest([], false, false);
  for (let index = 0; index < 128; index++) session.nextRoutedPacked(manifest);
  session.close();
});

test('keeps native sessions worker-thread isolated', async () => {
  const moduleUrl = new URL('../../dist/native/binding.js', import.meta.url).href;
  const manifest = packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES).toString(
    'base64',
  );
  const value = await new Promise((resolve, reject) => {
    const worker = new Worker(
      `import { parentPort } from 'node:worker_threads'; import(${JSON.stringify(moduleUrl)}).then(({ native }) => { const session = new native.NativeIndexedSession('const value = 1', 'worker.js', false, Buffer.from(${JSON.stringify(manifest)}, 'base64')); parentPort.postMessage(session.parseCount()); session.close(); }, error => { throw error; });`,
      { eval: true },
    );
    worker.once('message', resolve);
    worker.once('error', reject);
  });
  assert.equal(value, 1);
});
