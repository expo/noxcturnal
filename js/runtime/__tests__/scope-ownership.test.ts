import { expect, test, vi } from 'vitest';
import { native } from '../../native/binding';
import { NativeTransformSession } from '../session';

test('scope ownership resolves exact identities through collisions and repeated owner overrides', () => {
  // Four scope records, with coincident spans and non-monotonic owner identities.
  // The native encoder's fixture is checked independently in retained_index.rs.
  const words = [
    ...[4, 7, 0x9e3779b1], // count, bucket mask, hash multiplier
    ...[
      [26, 5, 5, 3],
      [10, 5, 5, 3],
      [18, 5, 5, 3],
      [10, 5, 5, 3],
    ].flat(),
    ...[26, 2, 10, 3, 18, 1], // occupied owner/scope buckets
    ...Array<number>(10).fill(0xffffffff),
  ];
  const data = Buffer.alloc(words.length * 4);
  words.forEach((word, index) => data.writeUInt32LE(word, index * 4));
  const metadata = vi
    .spyOn(native.NativeIndexedSession.prototype, 'scopeMetadataBuffer')
    .mockReturnValue(data);
  const session = new NativeTransformSession('', 'input.js');
  try {
    for (let round = 0; round < 3; round++) {
      expect(session.ownedScopeId(18)).toBe(1);
      expect(session.ownedScopeId(10)).toBe(3);
      expect(session.ownedScopeId(26)).toBe(2);
      for (const missing of [0, 2, 34, NaN, 1.5, 2 ** 32 + 10, 0xffffffff])
        expect(session.ownedScopeId(missing)).toBeUndefined();
    }
    expect(session.scopeMetadata(0)).toEqual({ ownerId: 26, start: 5, end: 5, kind: 3 });
    expect(session.scopeMetadata(3)).toEqual({ ownerId: 10, start: 5, end: 5, kind: 3 });
    expect(session.scopeMetadata(4)).toBeNull();
    expect(metadata).toHaveBeenCalledTimes(1);
  } finally {
    session.close();
    metadata.mockRestore();
  }
});
