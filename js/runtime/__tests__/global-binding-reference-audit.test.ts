import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

const cases = [
  { name: 'read', operation: 'external;', flags: [true, false, false] },
  { name: 'write', operation: 'external=1;', flags: [false, true, false] },
  { name: 'compound', operation: 'external+=1;', flags: [true, true, false] },
  { name: 'member write', operation: 'external.value=1;', flags: [true, false, true] },
];
for (const global of [false, true])
  describe.each(cases)(`global=${global}: $name`, entry => {
    let actual: unknown[];
    beforeAll(() => {
      let visits = 0;
      const source = `${global ? '' : 'let external={};'}${entry.operation}function f(){return 7;}`;
      const plugin = defineNativePlugin({
        name: 'reference-audit',
        visitors: [
          defineVisitor('NumericLiteral', { scope: true, fields: ['value'] }, path => {
            if (path.node.value !== 7) return;
            visits++;
            const binding = path.scope.getBinding('external')!;
            expect(binding.global).toBe(global);
            expect(binding.references).toHaveLength(1);
            const reference = binding.references[0];
            expect(source.slice(reference.start, reference.end)).toBe('external');
            actual = [reference.scopeId, reference.read, reference.write, reference.memberWrite];
          }),
        ],
      });
      expect(
        transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [{ name: 'scan', plugins: [plugin] }],
          }),
        ).status,
      ).toBe('complete');
      expect(visits).toBe(1);
    });
    (global ? test : test)('returns the required semantic reference fields', () => {
      expect(actual).toEqual([0, ...entry.flags]);
    });
  });

test('binding facts stay semantic when coarse global queries are cached first', () => {
  const source = '/*😀*/function f(){external+=1;external.value=2}';
  const session = new NativeTransformSession(
    source,
    'input.js',
    {},
    packRouteManifest([], false, false, (1 << 6) - 1),
  );
  try {
    const coarse = session.globalReferences('external');
    expect(coarse).toHaveLength(2);
    expect(coarse[0].read).toBeUndefined();
    const references = session.globalBindingReferences('external');
    expect(session.globalBindingReferences('external')).toBe(references);
    expect(
      references.map(reference => [reference.read, reference.write, reference.memberWrite]),
    ).toEqual([
      [true, true, false],
      [true, false, true],
    ]);
    for (const reference of references) {
      expect(reference.scopeId).toBeGreaterThan(0);
      expect(source.slice(reference.start, reference.end)).toBe('external');
      expect(reference.parentId).toBeTypeOf('number');
      const parent = session.inspect([{ nodeId: reference.parentId!, fields: [] }])[0];
      expect(reference.parentType).toBe(parent.type);
      expect(reference.parentStart).toBe(parent.start);
    }
    const missing = session.globalBindingReferences('missing');
    expect(missing).toEqual([]);
    expect(session.globalBindingReferences('missing')).toBe(missing);
    expect(session.globalReferences('external')).toBe(coarse);
    expect(coarse[0].read).toBeUndefined();
  } finally {
    session.close();
  }
  expect(() => session.globalBindingReferences('external')).toThrow('session-closed');
});

test('semantic global references belong to one source session', () => {
  const manifest = packRouteManifest([], false, false, (1 << 6) - 1);
  const first = new NativeTransformSession('external;', 'input.js', {}, manifest);
  const next = new NativeTransformSession('external=1;', 'input.js', {}, manifest);
  try {
    const read = first.globalBindingReferences('external');
    const write = next.globalBindingReferences('external');
    expect(write).not.toBe(read);
    expect([read[0].read, read[0].write]).toEqual([true, false]);
    expect([write[0].read, write[0].write]).toEqual([false, true]);
  } finally {
    first.close();
    next.close();
  }
});
