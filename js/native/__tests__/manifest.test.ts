import assert from 'node:assert/strict';
import { test } from 'vitest';

import { native } from '../binding';
import { nativeManifest, shareManifest } from '../manifest';
import { packRouteManifest } from '../../protocol/manifest';

const source = 'const value = read("雪😀"); value;';
const manifest = (type: 'Identifier' | 'Program' = 'Identifier') =>
  packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        order: 0,
        nodeType: type,
        side: 'enter',
        predicates: {},
        payloadFields: type === 'Identifier' ? ['name'] : [],
      },
    ],
    true,
    true,
    (1 << 6) - 1,
  );

test('only compiler-owned manifest buffers reuse a native snapshot', () => {
  const raw = manifest();
  assert.equal(nativeManifest(raw), raw);
  assert.equal(shareManifest(raw), raw);
  const compiled = nativeManifest(raw);
  assert.notEqual(compiled, raw);
  assert.equal(nativeManifest(raw), compiled);
  shareManifest(raw);
  assert.equal(nativeManifest(raw), compiled);
  // Equal bytes in an independently owned buffer have an independent lifetime.
  const independent = Buffer.from(raw);
  assert.equal(nativeManifest(independent), independent);
  assert.notEqual(nativeManifest(shareManifest(independent)), compiled);
});

test('native manifest handles snapshot bytes while raw buffers remain freshly validated', () => {
  const raw = manifest();
  const compiled = new native.NativeCompiledManifest(raw);
  const expected = native.materializeRoutedBuffer(source, 'input.js', raw);
  const session = new native.NativeIndexedSession(source, 'input.js', compiled, compiled, false);
  try {
    assert.deepEqual(native.materializeRoutedBuffer(source, 'input.js', compiled), expected);
    assert.deepEqual(session.nextRoutedPacked(raw), expected);
    raw.writeUInt32LE(1 << 15, 4);
    assert.throws(() => session.nextRoutedPacked(raw), /unknown routed manifest flags/);
    assert.throws(
      () => native.materializeRoutedBuffer(source, 'input.js', raw),
      /unknown routed manifest flags/,
    );
    assert.throws(() => new native.NativeCompiledManifest(raw), /unknown routed manifest flags/);
    assert.deepEqual(session.nextRoutedPacked(compiled), expected);
    assert.deepEqual(native.materializeRoutedBuffer(source, 'input.js', compiled), expected);
  } finally {
    session.close();
  }
});

test('compiled handles preserve parsed materialization and repeated range/subtree routing', () => {
  const raw = manifest();
  const compiled = new native.NativeCompiledManifest(raw);
  const parsed = new native.NativeParsedSource(source, 'input.js');
  const expectedParsed = new native.NativeParsedSource(source, 'input.js');
  const session = parsed.materialize(compiled, compiled);
  const expected = expectedParsed.materialize(raw, raw);
  try {
    assert.deepEqual(session.nextRoutedPacked(compiled), expected.nextRoutedPacked(raw));
    for (const root of [{ start: 0, end: source.length }, { id: 0 }]) {
      assert.deepEqual(
        session.nextRoutedPacked(
          compiled,
          'start' in root ? root.start : undefined,
          'end' in root ? root.end : undefined,
          'id' in root ? root.id : undefined,
        ),
        expected.nextRoutedPacked(
          raw,
          'start' in root ? root.start : undefined,
          'end' in root ? root.end : undefined,
          'id' in root ? root.id : undefined,
        ),
      );
    }
    const parsedRouted = new native.NativeParsedSource(source, 'input.js');
    assert.deepEqual(
      parsedRouted.materializeRouted(compiled),
      native.materializeRoutedBuffer(source, 'input.js', raw),
    );
    assert.throws(() => parsedRouted.materializeRouted(compiled), /parsed-source-consumed/);
  } finally {
    session.close();
    expected.close();
  }
});

test('initial tape guards preserve byte equality across handle and buffer inputs', () => {
  const raw = manifest();
  const compiled = new native.NativeCompiledManifest(raw);
  const different = new native.NativeCompiledManifest(manifest('Program'));
  for (const initial of [raw, compiled]) {
    for (const same of [raw, compiled, new native.NativeCompiledManifest(Buffer.from(raw))]) {
      const session = new native.NativeIndexedSession(source, 'input.js', compiled, initial);
      try {
        assert.throws(() => session.nextRoutedPacked(different), /route manifest does not match/);
        const first = session.nextRoutedPacked(same);
        assert.deepEqual(first, session.nextRoutedPacked(compiled));
      } finally {
        session.close();
      }
    }
  }
});

test('raw buffers are validated before serving an initial tape', () => {
  const raw = manifest();
  const valid = Buffer.from(raw);
  const session = new native.NativeIndexedSession(source, 'input.js', raw, raw);
  try {
    raw.writeUInt32LE(1 << 15, 4);
    assert.throws(() => session.nextRoutedPacked(raw), /unknown routed manifest flags/);
    assert.deepEqual(
      session.nextRoutedPacked(valid),
      native.materializeRoutedBuffer(source, 'input.js', valid),
    );
  } finally {
    session.close();
  }
});

test('closing a session leaves shared manifest handles and other sessions usable', () => {
  const compiled = nativeManifest(shareManifest(manifest()));
  const expected = native.materializeRoutedBuffer(source, 'input.js', compiled);
  const first = new native.NativeIndexedSession(source, 'input.js', compiled, compiled);
  const second = new native.NativeIndexedSession(source, 'input.js', compiled, compiled);
  try {
    first.close();
    assert.throws(() => first.nextRoutedPacked(compiled), /closed/);
    assert.deepEqual(second.nextRoutedPacked(compiled), expected);
    assert.deepEqual(second.nextRoutedPacked(compiled), expected);
    const parsed = new native.NativeParsedSource(source, 'input.js');
    assert.deepEqual(parsed.materializeRouted(compiled), expected);
  } finally {
    first.close();
    second.close();
  }
});
