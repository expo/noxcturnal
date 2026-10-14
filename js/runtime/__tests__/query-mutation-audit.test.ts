import { beforeAll, describe, expect, test } from 'vitest';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';
import type { QueryRequest } from '../../index';

describe('query request mutation after identity caching', () => {
  let currentNames: string[];
  let rejectsConflict: boolean;
  beforeAll(() => {
    const session = new NativeTransformSession(
      'first; second; const outer=1; function fn(){return outer;}',
      'input.js',
      {},
      packRouteManifest([], false, false, (1 << 6) - 1),
    );
    try {
      const request: QueryRequest = { globals: [{ name: 'first', references: true }] };
      const initial = session.query(request);
      expect(initial.globals.first.references).toHaveLength(1);
      expect(session.query(request)).toBe(initial);
      request.globals![0].name = 'second';
      const stale = session.query(request);
      expect(stale).toBe(initial);
      currentNames = Object.keys(stale.globals);
      expect(currentNames).toEqual(['first']);
      const fresh = session.query({ globals: [{ name: 'second', references: true }] });
      expect(Object.keys(fresh.globals)).toEqual(['second']);
      expect(fresh.globals.second.references).toHaveLength(1);

      const functions = session.nodes(['Function']);
      expect(functions).toHaveLength(1);
      const fn = functions[0];
      const captures: NonNullable<QueryRequest['captures']> = [
        { functionId: fn.id, programBindings: true },
      ];
      const captureRequest: QueryRequest = { captures };
      const initialCaptures = session.query(captureRequest);
      expect(initialCaptures.captures[fn.id].map(node => node.name)).toEqual(['outer']);
      captures.push({ functionId: fn.id, programBindings: false });
      expect(() => session.query({ captures: captures.map(entry => ({ ...entry })) })).toThrow(
        'Conflicting programBindings filters',
      );
      rejectsConflict = false;
      try {
        expect(session.query(captureRequest)).toBe(initialCaptures);
      } catch (error) {
        expect(String(error)).toContain('Conflicting programBindings filters');
        rejectsConflict = true;
      }
      expect(rejectsConflict).toBe(false);
    } finally {
      session.close();
    }
  });

  test.fails('returns facts for the current mutable request', () =>
    expect(currentNames).toEqual(['second']));
  test.fails('still rejects conflicting capture filters after cache warmup', () =>
    expect(rejectsConflict).toBe(true));
});
