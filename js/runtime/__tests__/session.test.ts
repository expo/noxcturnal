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

test('maps UTF-16 source offsets to line and column locations', () => {
  const session = new NativeTransformSession('first\nsecond\nthird', 'fixture.js');
  assert.deepEqual(session.sourceLocation(6, 12), {
    start: { line: 2, column: 0 },
    end: { line: 2, column: 6 },
  });
  assert.deepEqual(session.sourceLocation(13, 18), {
    start: { line: 3, column: 0 },
    end: { line: 3, column: 5 },
  });
});

test('rejects native operations after the session is closed', () => {
  const session = new NativeTransformSession('const value = 1', 'fixture.js');
  session.close();
  assert.throws(() => session.commit([]), /session-closed/);
  assert.throws(
    () => session.nextRoutedPacked(packRouteManifest([], false, false)),
    /session-closed/,
  );
});
