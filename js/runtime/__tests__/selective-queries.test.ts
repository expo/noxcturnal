import assert from 'node:assert/strict';
import { test, vi } from 'vitest';
import { native } from '../../native/binding';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

const source = `load('first'); other('other'); load(dynamic);
function local(load) { load('shadowed'); } load('last');`;

test('batches call queries while preserving filters, request order, caching, and duplicate keys', () => {
  const session = new NativeTransformSession(
    source,
    'fixture.js',
    {},
    packRouteManifest([], false, false, (1 << 0) | (1 << 2)),
  );
  const batch = vi.spyOn(native.NativeIndexedSession.prototype, 'queryCallsBatch');
  const single = vi.spyOn(native.NativeIndexedSession.prototype, 'queryCalls');
  try {
    const request = {
      calls: [
        { callee: 'load', globalOnly: true, staticArguments: true },
        { callee: 'other' },
        { callee: 'missing' },
      ],
    };
    const result = session.query(request);
    assert.deepEqual(
      result.calls.load.map(call => call.staticArgument),
      ['first', 'last'],
    );
    assert.deepEqual(
      result.calls.other.map(call => call.staticArgument),
      ['other'],
    );
    assert.deepEqual(result.calls.missing, []);
    assert.equal(batch.mock.calls.length, 1);
    assert.equal(single.mock.calls.length, 0);
    assert.equal(session.query(request), result);
    assert.equal(batch.mock.calls.length, 1);
    const duplicates = session.query({
      calls: [{ callee: 'load', globalOnly: true, staticArguments: true }, { callee: 'load' }],
    });
    assert.deepEqual(
      duplicates.calls.load.map(call => call.staticArgument),
      ['first', undefined, 'shadowed', 'last'],
    );
    assert.deepEqual(
      duplicates.calls.load.map(call => call.calleeGlobal),
      [true, true, false, true],
    );
    assert.equal(batch.mock.calls.length, 2);
    session.query({});
    assert.equal(batch.mock.calls.length, 2);
    session.close();
    assert.throws(() => session.query({ calls: [{ callee: 'load' }] }), /closed/);
  } finally {
    batch.mockRestore();
    single.mockRestore();
    session.close();
  }
});

test('node type queries preserve source ID ordering across sparse type buckets', () => {
  const source = "import 'first'; call(); export const value = 1; import 'last';";
  const session = new NativeTransformSession(
    source,
    'fixture.js',
    {},
    packRouteManifest([], false, false, (1 << 4) | (1 << 5)),
  );
  try {
    const first = session.nodes(['ImportDeclaration', 'ExportNamedDeclaration']);
    assert.deepEqual(
      first.map(node => source.slice(node.start, node.end)),
      ["import 'first';", 'export const value = 1;', "import 'last';"],
    );
    assert.deepEqual(
      session.nodes(['ExportNamedDeclaration', 'ImportDeclaration', 'ImportDeclaration']),
      first,
    );
    assert.deepEqual(session.nodes([]), []);
    assert.deepEqual(session.nodes(['ClassDeclaration']), []);
    assert.deepEqual(
      session.nodes(['ImportDeclaration']).map(node => node.start),
      [0, source.indexOf("import 'last'")],
    );
  } finally {
    session.close();
  }
});
