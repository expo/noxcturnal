import { beforeAll, describe, expect, test } from 'vitest';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';
import type { QueryRequest } from '../../index';

test('large warm query requests still detect mutation of the final descriptor', () => {
  const session = new NativeTransformSession(
    'first; second;',
    'input.js',
    {},
    packRouteManifest([], false, false, (1 << 6) - 1),
  );
  try {
    const request: QueryRequest = {
      globals: Array.from({ length: 512 }, () => ({ name: 'first' })),
    };
    const initial = session.query(request);
    expect(session.query(request)).toBe(initial);
    request.globals![511].name = 'second';
    const refreshed = session.query(request);
    expect(refreshed).not.toBe(initial);
    expect(refreshed.globals.second.references).toHaveLength(1);
    expect(session.query(request)).toBe(refreshed);
  } finally {
    session.close();
  }
});

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
      expect(stale).not.toBe(initial);
      currentNames = Object.keys(stale.globals);
      expect(currentNames).toEqual(['second']);
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
      expect(rejectsConflict).toBe(true);
    } finally {
      session.close();
    }
  });

  test('returns facts for the current mutable request', () =>
    expect(currentNames).toEqual(['second']));
  test('still rejects conflicting capture filters after cache warmup', () =>
    expect(rejectsConflict).toBe(true));
});

test.each(['calls', 'globals', 'imports', 'exports', 'bindings', 'constants', 'captures'] as const)(
  'mutable %s descriptors agree with fresh requests after reuse',
  category => {
    const session = new NativeTransformSession(
      'import value from "pkg"; export { value }; first; second; require("one"); load("two"); const a=1, b=2; function f(){ return a; } function g(){ return b; }',
      'input.js',
      {},
      packRouteManifest([], false, false, (1 << 6) - 1),
    );
    try {
      const functions = session.nodes(['Function']);
      const constants = session.nodes(['NumericLiteral']);
      const request: QueryRequest =
        category === 'calls'
          ? { calls: [{ callee: 'require', staticArguments: false }] }
          : category === 'globals'
            ? { globals: [{ name: 'first', references: true }] }
            : category === 'imports'
              ? { imports: false }
              : category === 'exports'
                ? { exports: false }
                : category === 'bindings'
                  ? { bindings: [{ name: 'a', reads: true }] }
                  : category === 'constants'
                    ? { constants: [constants[0].id] }
                    : { captures: [{ functionId: functions[0].id, programBindings: true }] };
      const first = session.query(request);
      expect(session.query(request)).toBe(first);
      switch (category) {
        case 'calls':
          request.calls![0].callee = 'load';
          request.calls![0].staticArguments = true;
          break;
        case 'globals':
          request.globals![0].name = 'second';
          break;
        case 'imports':
          request.imports = true;
          break;
        case 'exports':
          request.exports = true;
          break;
        case 'bindings':
          request.bindings![0].name = 'b';
          request.bindings![0].reads = false;
          break;
        case 'constants':
          request.constants![0] = constants[1].id;
          break;
        case 'captures':
          request.captures![0].functionId = functions[1].id;
          request.captures![0].programBindings = false;
          break;
      }
      const current = session.query(request);
      expect(current).not.toBe(first);
      expect(current).toEqual(session.query(structuredClone(request)));
      expect(session.query(request)).toBe(current);
    } finally {
      session.close();
    }
  },
);

test('query descriptor lists can be cleared, refilled, and removed after caching', () => {
  const session = new NativeTransformSession(
    'first; second;',
    'input.js',
    {},
    packRouteManifest([], false, false, (1 << 6) - 1),
  );
  try {
    const request: QueryRequest = { globals: [{ name: 'first' }] };
    expect(Object.keys(session.query(request).globals)).toEqual(['first']);
    request.globals!.length = 0;
    const empty = session.query(request);
    expect(empty.globals).toEqual({});
    expect(session.query(request)).toBe(empty);
    request.globals!.push({ name: 'second' });
    expect(Object.keys(session.query(request).globals)).toEqual(['second']);
    delete request.globals;
    const absent = session.query(request);
    expect(absent.globals).toEqual({});
    expect(session.query(request)).toBe(absent);
  } finally {
    session.close();
  }
});
