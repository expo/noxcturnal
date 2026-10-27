import { expect, test } from 'vitest';
import { NodeCache } from '../node-cache';

test('sparse node identities survive replacement, page growth, and unordered reads', () => {
  const cache = new NodeCache<object>();
  const first = { start: 0, end: 0 };
  const second = { start: 0, end: 0 };
  cache.set(65537, first);
  cache.set(0, second);
  expect(cache.get(65537)).toBe(first);
  expect(cache.get(0)).toBe(second);
  expect(cache.get(65536)).toBeUndefined();
  expect(cache.get(255)).toBeUndefined();
  expect(cache.get(0)).toBe(second);
  expect(cache.get(65537)).toBe(first);
  cache.set(65537, second);
  expect(cache.get(65537)).toBe(second);
  cache.set(200001, first);
  expect(cache.get(200001)).toBe(first);
  expect(new NodeCache().get(65537)).toBeUndefined();
});

test('invalid numeric identities cannot alias a cached node through bitwise coercion', () => {
  const cache = new NodeCache<object>();
  const value = {};
  cache.set(0, value);
  cache.set(1, value);
  for (const id of [-1, 1.5, NaN, Infinity, 2 ** 32, 2 ** 32 + 1]) {
    expect(() => cache.get(id)).toThrow(/invalid node id/);
    expect(() => cache.set(id, {})).toThrow(/invalid node id/);
  }
  expect(cache.get(0)).toBe(value);
  expect(cache.get(1)).toBe(value);
});
