import { expect, test } from 'vitest';
import { NativeTransformSession } from '../session';
import { native } from '../../native/binding';
import { packRouteManifest } from '../../protocol/manifest';

test('visibility ranges agree with exact native bindings through nested and sibling scopes', () => {
  const source = `"😀"; let shared=0, α=1;
    function first(shared) { { let α=2; shared+=α; } return shared; }
    function second(other) { { let shared=3; other+=shared; } return shared+other; }
    try { first(shared); } catch (shared) { let local=shared; }
    const C=class Inner { method(shared) { return shared+α; } };
    for (let item of []) { const local=item; }
  `;
  const manifest = packRouteManifest([], false, true, (1 << 6) - 1);
  const session = new NativeTransformSession(source, 'input.js', {}, manifest);
  const raw = new native.NativeIndexedSession(source, 'input.js', manifest);
  try {
    const data = raw.scopeParentsBuffer();
    const parents = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    const scopes = Array.from({ length: parents.length }, (_, id) => id);
    // Revisit intervals in both directions, including misses before/after the
    // bound subtree, to exercise the visibility cursor across replay orders.
    for (const scopeId of [...scopes, ...scopes.slice().reverse(), ...scopes]) {
      for (const name of [
        'shared',
        'α',
        'other',
        'local',
        'Inner',
        'C',
        'item',
        'first',
        'missing',
      ]) {
        let candidate = scopeId;
        while (candidate !== 0xffffffff && raw.queryBindings(name, candidate).length === 0)
          candidate = parents[candidate];
        const expected = candidate === 0xffffffff ? null : candidate;
        expect(session.resolveBindingScope(name, scopeId), `${name} in scope ${scopeId}`).toBe(
          expected,
        );
        expect(session.resolveBinding(name, scopeId)?.scopeId ?? null).toBe(expected);
      }
    }
  } finally {
    raw.close();
    session.close();
  }
});
