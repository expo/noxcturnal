import { expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { native } from '../../native/binding';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

test('global presence checks cache booleans across scopes without hydrating reference lists', () => {
  const presence = vi.spyOn(native.NativeIndexedSession.prototype, 'hasGlobal');
  const coarse = vi.spyOn(native.NativeIndexedSession.prototype, 'queryGlobalsBuffer');
  const semantic = vi.spyOn(native.NativeIndexedSession.prototype, 'globalBindingReferencesBuffer');
  const expected: [string, boolean][] = [
    ['external', true],
    ['外部', true],
    ['constructor', true],
    ['__proto__', true],
    ['local', false],
    ['propertyOnly', false],
    ['parameter', false],
    ['missing', false],
  ];
  let visits = 0;
  try {
    const source =
      'const local={propertyOnly:0};local.propertyOnly;external;外部;constructor;__proto__;function owner(external,parameter){external;return parameter;}';
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'read',
            plugins: [
              defineNativePlugin({
                name: 'global-presence',
                visitors: [
                  defineVisitor('Program|FunctionDeclaration', { scope: true }, path => {
                    visits++;
                    for (let round = 0; round < 3; round++)
                      for (const [name, present] of expected)
                        expect(path.scope.hasGlobal(name)).toBe(present);
                    if (path.type === 'Function')
                      expect(path.scope.hasBinding('external')).toBe(true);
                  }),
                ],
              }),
            ],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    expect(visits).toBe(2);
    expect(presence).toHaveBeenCalledTimes(expected.length);
    expect(coarse).not.toHaveBeenCalled();
    expect(semantic).not.toHaveBeenCalled();
  } finally {
    presence.mockRestore();
    coarse.mockRestore();
    semantic.mockRestore();
  }
});

test('presence observes immutable phase input and refreshes after edits and between files', () => {
  const observations: boolean[][] = [];
  const reader = (edit: boolean) =>
    defineNativePlugin({
      name: edit ? 'edit-global' : 'observe-global',
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          const read = () => [path.scope.hasGlobal('external'), path.scope.hasGlobal('renamed')];
          observations.push(read());
          if (edit) {
            path.replaceWith('renamed;');
            observations.push(read());
          }
        }),
      ],
    });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'edit', plugins: [reader(true)] },
      { name: 'observe', plugins: [reader(false)] },
    ],
  });
  for (const filename of ['first.js', 'second.js']) {
    observations.length = 0;
    const result = transform('external;', filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.code).toBe('renamed;');
    expect(observations).toEqual([
      [true, false],
      [true, false],
      [false, true],
    ]);
  }
});

for (const first of ['presence', 'coarse', 'semantic'] as const)
  test(`${first} queries preserve presence and both reference view contracts`, () => {
    const source = 'external+=1;external.value=2;';
    const session = new NativeTransformSession(
      source,
      'input.js',
      {},
      packRouteManifest([], false, false, (1 << 6) - 1),
    );
    try {
      if (first === 'presence') expect(session.hasGlobal('external')).toBe(true);
      if (first === 'coarse') expect(session.globalReferences('external')).toHaveLength(2);
      if (first === 'semantic') expect(session.globalBindingReferences('external')).toHaveLength(2);
      expect(session.hasGlobal('external')).toBe(true);
      expect(session.hasGlobal('missing')).toBe(false);
      const coarse = session.globalReferences('external');
      expect(coarse).toHaveLength(2);
      expect(session.globalReferences('external')).toBe(coarse);
      expect(coarse[0].read).toBeUndefined();
      const missing = session.globalReferences('missing');
      expect(missing).toEqual([]);
      expect(session.globalReferences('missing')).toBe(missing);
      const semantic = session.globalBindingReferences('external');
      expect(
        semantic.map(({ read, write, memberWrite }) => ({ read, write, memberWrite })),
      ).toEqual([
        { read: true, write: true, memberWrite: false },
        { read: true, write: false, memberWrite: true },
      ]);
      const query = session.query({ globals: [{ name: 'external' }, { name: 'missing' }] });
      expect(query.globals.external.references).toHaveLength(2);
      expect(query.globals.missing.references).toEqual([]);
      expect(session.hasGlobal('external')).toBe(true);
      expect(session.hasGlobal('missing')).toBe(false);
      expect(session.globalBindingReferences('external')).toBe(semantic);
    } finally {
      session.close();
    }
    expect(() => session.hasGlobal('external')).toThrow('session-closed');
  });
