import assert from 'node:assert/strict';
import { test } from 'vitest';

import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

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
