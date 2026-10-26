import assert from 'node:assert/strict';
import { expect, test } from 'vitest';

import { dispatchRoutedEvents } from '../../protocol/events';
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

test('supports repeated routing requests', () => {
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

test('retained sessions close repeatedly and reject cached event/query/children operations', () => {
  const session = openRetained('const value = 1; value;', 'input.js');
  const request = { globals: [{ name: 'value' }] };
  const program = session.nodes(['Program'])[0];
  expect(program).toBeDefined();
  expect(session.event(program.id)).toBeDefined();
  session.query(request);
  session.prefetchChildren([program.id]);
  session.children(program.id);
  session.close();
  expect(() => session.close()).not.toThrow();
  expect(() => session.event(program.id)).toThrow('session-closed');
  expect(() => session.query(request)).toThrow('session-closed');
  expect(() => session.children(program.id)).toThrow('session-closed');
});

test('node-root routing preserves the separate coordinate-query contract', () => {
  const source = 'import {value} from "pkg";value;';
  const session = openRetained(source, 'input.mjs');
  const target = session.nodes(['Identifier'])[0]!;
  const manifest = packRouteManifest(
    ['Identifier', 'ImportSpecifier'].map((nodeType, id) => ({
      id,
      pluginId: 0,
      nodeType,
      side: 'enter' as const,
      order: 0,
      predicates: {},
      payloadFields: [],
    })),
    false,
    false,
  );
  const collect = (root: { id: number } | { start: number; end: number }) => {
    const events: { id: number; type: string }[] = [];
    const receive = (event: { id: number; type: string }) => {
      events.push({ id: event.id, type: event.type });
    };
    dispatchRoutedEvents(session.nextRoutedPacked(manifest, root), [receive, receive]);
    return events;
  };
  expect(collect({ start: target.start, end: target.end }).map(event => event.type)).toEqual([
    'ImportSpecifier',
    'Identifier',
    'Identifier',
  ]);
  expect(collect({ id: target.id })).toEqual([{ id: target.id, type: 'Identifier' }]);
  expect(collect({ id: 999 })).toEqual([]);
  session.close();
  expect(() => collect({ id: target.id })).toThrow('session-closed');
});
