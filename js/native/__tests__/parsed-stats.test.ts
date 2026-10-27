import assert from 'node:assert/strict';
import { test } from 'vitest';

import { native } from '../binding';
import { packRouteManifest } from '../../protocol/manifest';

const manifest = () =>
  packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        order: 0,
        nodeType: 'Identifier',
        side: 'enter',
        predicates: {},
        payloadFields: ['name'],
      },
    ],
    true,
    true,
    (1 << 6) - 1,
  );
const source = `export function run(input = fallback) {
  const result = require('雪😀');
  return () => result + input;
}`;

test('syntax selection preserves parsed materialization identities and scope facts', () => {
  const raw = manifest();
  const selected = new native.NativeParsedSource(source, 'input.js');
  const direct = new native.NativeParsedSource(source, 'input.js');
  const facts = selected.syntaxFacts();
  assert.deepEqual(selected.syntaxFacts(), facts);
  const selectedSession = selected.materialize(raw, raw);
  const directSession = direct.materialize(raw, raw);
  try {
    assert.deepEqual(selectedSession.nextRoutedPacked(raw), directSession.nextRoutedPacked(raw));
    assert.deepEqual(
      selectedSession.nextRoutedPacked(raw, undefined, undefined, 0),
      directSession.nextRoutedPacked(raw, undefined, undefined, 0),
    );
    assert.deepEqual(
      selectedSession.queryBindings('result', undefined, false, false),
      directSession.queryBindings('result', undefined, false, false),
    );
    assert.throws(() => selected.syntaxFacts(), /parsed-source-consumed/);
    assert.throws(() => selected.materialize(raw, raw), /parsed-source-consumed/);
  } finally {
    selectedSession.close();
    directSession.close();
  }
});

test('syntax selection preserves stateless routing and early-error validation', () => {
  const raw = manifest();
  const parsed = new native.NativeParsedSource(source, 'input.js');
  parsed.syntaxFacts();
  assert.deepEqual(
    parsed.materializeRouted(raw),
    native.materializeRoutedBuffer(source, 'input.js', raw),
  );
  assert.throws(() => parsed.materializeRouted(raw), /parsed-source-consumed/);

  const invalid = new native.NativeParsedSource('let duplicate; let duplicate;', 'input.js');
  invalid.syntaxFacts();
  assert.throws(() => invalid.materializeRouted(raw), /duplicate|declared/i);
  assert.throws(() => invalid.syntaxFacts(), /parsed-source-consumed/);
});
