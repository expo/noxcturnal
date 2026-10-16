import { expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

test('global-only retention preserves semantic references without scope-editing metadata', () => {
  const source = 'function f(){return {external}}';
  const observe = (scope: boolean) => {
    const session = new NativeTransformSession(
      source,
      'input.js',
      {},
      packRouteManifest([], false, scope, 1),
    );
    try {
      return {
        globals: session.query({ globals: [{ name: 'external', references: true }] }).globals,
        references: session.globalBindingReferences('external'),
        metadata: session.scopeMetadata(0),
        bytes: session.retentionDebugSummary().retainedIndexBytes,
      };
    } finally {
      session.close();
    }
  };
  const globalOnly = observe(false);
  const scoped = observe(true);
  expect(globalOnly.globals).toEqual(scoped.globals);
  expect(globalOnly.references).toEqual(scoped.references);
  expect(globalOnly.references[0]).toMatchObject({ scopeId: 1, read: true, write: false });
  expect(globalOnly.metadata).toBeNull();
  expect(scoped.metadata).not.toBeNull();
  expect(globalOnly.bytes).toBeLessThan(scoped.bytes);
});

test.each(['none', 'text-only', 'whole-program'] as const)(
  'a reused %s global-query session retains scope data needed by the next phase',
  editEffect => {
    const request = { globals: [{ name: 'globalThis', references: true }] };
    const next = vi.spyOn(NativeTransformSession.prototype, 'nextRoutedPacked');
    let references = 0;
    try {
      const result = transform(
        'for(let i=0;i<2;i++){globalThis.result.push(i+injected)}',
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'query',
              plugins: [
                defineNativePlugin({
                  name: 'globals',
                  editEffect,
                  contract: { queries: [request] },
                  pre(context) {
                    references = context.query(request).globals.globalThis.references.length;
                  },
                  visitors: [defineVisitor('Program', {}, () => {})],
                }),
              ],
            },
            {
              name: 'insert',
              plugins: [
                defineNativePlugin({
                  name: 'scoped',
                  visitors: [
                    defineVisitor('ForStatement', { scope: true }, path => {
                      expect(path.scope.hasBinding('i')).toBe(true);
                      path.scope.push('var injected=1;');
                    }),
                  ],
                }),
              ],
            },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(references).toBe(1);
      expect(next.mock.contexts).toHaveLength(2);
      expect(next.mock.contexts[0]).toBe(next.mock.contexts[1]);
      const context = { result: [] };
      new Function('globalThis', result.code)(context);
      expect(context.result).toEqual([1, 2]);
    } finally {
      next.mockRestore();
    }
  },
);
