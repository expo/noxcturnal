import assert from 'node:assert/strict';
import { test, vi } from 'vitest';
import { defineNativePlugin, defineVisitor } from '../../index';
import { NODE_TYPES } from '../../generated/event-schema';
import { preparePhase } from '../../pipeline/routes';
import { decodeRoutedEnvelope, dispatchRoutedEvents } from '../../protocol/events';
import type { NativeEvent } from '../../types';
import { native } from '../binding';
import { nativeChildPrefetch } from '../child-prefetch';
import { NativeTransformSession } from '../../runtime/session';

for (const mode of ['parent', 2, 2 ** 32, 'findParent'] as const) {
  test(`bulk child roots preserve routed delivery selection and ${mode} ancestry`, () => {
    const prepared = preparePhase({
      name: 'roots',
      plugins: [
        defineNativePlugin({
          name: 'direct',
          visitors: [
            defineVisitor(
              'CallExpression',
              {
                fields: ['calleeName'],
                comments: 'inner',
                controlFlow: ['skip'],
                children: { arguments: { route: 'Expression' } },
              },
              { enter() {}, exit() {} },
            ),
          ],
        }),
        defineNativePlugin({
          name: 'ancestors',
          visitors: [
            defineVisitor(
              'Identifier',
              {
                scope: true,
                ancestry: {
                  mode,
                  routes: {
                    CallExpression: { children: { callee: { route: 'Expression' } } },
                    Program: { children: { body: { route: 'Statement' } } },
                  },
                },
              },
              () => {},
            ),
          ],
        }),
      ],
    });
    const raw = new native.NativeIndexedSession(
      'outer(/* 雪😀 */ inner(value)); other();',
      'input.js',
      prepared.manifest,
      prepared.manifest,
    );
    try {
      const initial = decodeRoutedEnvelope(raw.nextRoutedPacked(prepared.manifest));
      let root: Pick<NativeEvent, 'id' | 'start' | 'end'> | undefined;
      dispatchRoutedEvents(
        initial,
        prepared.dispatchRoutes.map(() => () => {}),
        event => {
          if (!root && event.side === 'enter' && event.type === 'CallExpression') root = event;
        },
      );
      assert.ok(root);
      const batches = [
        initial,
        decodeRoutedEnvelope(raw.nextRoutedPacked(prepared.manifest, root.start, root.end)),
        decodeRoutedEnvelope(
          raw.nextRoutedPacked(prepared.manifest, undefined, undefined, root.id),
        ),
      ];
      const routes = prepared.childPrefetch!;
      const plan = nativeChildPrefetch(routes);
      assert.equal(nativeChildPrefetch(routes), plan);
      assert.notEqual(nativeChildPrefetch([...routes]), plan);
      for (const batch of batches) {
        const words = new Uint32Array(
          batch.data.buffer,
          batch.data.byteOffset,
          batch.data.byteLength / 4,
        );
        const flags =
          Number(batch.includeParent) |
          (Number(batch.includeScope) << 1) |
          (Number(batch.includeExit) << 2) |
          (Number(batch.includeComments) << 3) |
          (Number(batch.includeTraversal) << 4);
        for (const stopped of [[], [0], [1], [0, 1]]) {
          const stoppedFlags = new Uint8Array(2);
          for (const id of stopped) stoppedFlags[id] = 1;
          const expected = new Set<number>();
          // Reference the existing JS delivery/ancestry behavior independently of
          // the native tape scanner and the compiled bitset representation.
          dispatchRoutedEvents(
            batch,
            routes.map(members => event => {
              for (const { pluginId, capabilities: caps } of members) {
                if (stopped.includes(pluginId)) continue;
                if (caps.childRules?.[event.type]) expected.add(event.id);
                if (!caps.ancestorChildRules || !caps.ancestry) continue;
                const mode = caps.ancestry.mode;
                const depth = typeof mode === 'number' ? mode : mode === 'parent' ? 1 : Infinity;
                let parentId = event.parentId;
                for (let level = 0; parentId != null && level < depth; level++) {
                  const data = raw.nodeSummaryBuffer(parentId);
                  if (!data.length) break;
                  const summary = new Uint32Array(data.buffer, data.byteOffset, 7);
                  const parent: Pick<NativeEvent, 'id' | 'type'> = {
                    id: parentId,
                    type: NODE_TYPES[summary[0]],
                  };
                  if (caps.ancestorChildRules[parent.type]) expected.add(parent.id);
                  parentId = summary[3] === 0xffffffff ? undefined : summary[3];
                }
              }
            }),
          );
          assert.deepEqual(raw.routedChildRoots(words, flags, plan, stoppedFlags), [...expected]);
          const fused = raw.childrenRoutedPackedBuffer(words, flags, plan, stoppedFlags);
          assert.deepEqual(
            fused,
            expected.size > 0 ? raw.childrenPackedBuffer([...expected], [], [], true) : null,
          );
        }
      }
    } finally {
      raw.close();
    }
  });
}

test('single-route replay upgrades shallow children and reuses a complete graph without a root query', () => {
  const prepared = preparePhase({
    name: 'one',
    plugins: [
      defineNativePlugin({
        name: 'one',
        visitors: [
          defineVisitor(
            'CallExpression',
            {
              children: { arguments: { route: 'NumericLiteral', fields: ['value'] } },
            },
            () => {},
          ),
        ],
      }),
    ],
  });
  const session = new NativeTransformSession(
    'read(1);',
    'input.js',
    {},
    prepared.manifest,
    prepared.manifest,
  );
  const roots = vi.spyOn(native.NativeIndexedSession.prototype, 'routedChildRoots');
  const children = vi.spyOn(native.NativeIndexedSession.prototype, 'childrenPackedBuffer');
  try {
    const batch = session.nextRoutedPacked(prepared.manifest);
    assert.equal(batch.nodeRecordCount, 1);
    const call = session.nodes(['CallExpression'])[0];
    session.prefetchChildren([call.id]);
    assert.equal(children.mock.calls.length, 1);
    session.prefetchRoutedChildren(batch, prepared.childPrefetch);
    assert.equal(roots.mock.calls.length, 1);
    assert.equal(children.mock.calls.length, 2);
    session.prefetchRoutedChildren(batch, prepared.childPrefetch);
    assert.equal(roots.mock.calls.length, 1);
    assert.equal(children.mock.calls.length, 2);
    assert.equal(session.nodeView(session.children(call.id)[0]).value, 1);
  } finally {
    roots.mockRestore();
    children.mockRestore();
    session.close();
  }
});
