import assert from 'node:assert/strict';
import { test } from 'vitest';

import type { NativeEvent } from '../../types';
import { eventIsSkipped, resetSkippedTraversal, type SkipRange, type SkipState } from '../path';

function event(start: number, _end: number, side: 'enter' | 'exit' = 'enter'): NativeEvent {
  return {
    id: start,
    type: 'Identifier',
    start: 0,
    end: 0,
    side,
    sequence: start,
    scopeId: 0,
    fields: [],
  };
}

function intervals(count: number): Uint32Array {
  return Uint32Array.from({ length: count * 2 }, (_, word) => Math.floor(word / 2) + (word % 2));
}

test('skip lookup handles many independent ranges and resets', () => {
  const ranges: SkipRange[] = Array.from({ length: 1_024 }, (_, index) => ({
    id: index * 4,
    start: index * 4,
    end: index * 4 + 2,
  }));
  const skipped: SkipState = { ranges, cursor: 0, intervals: intervals(4096) };
  for (let index = 0; index < ranges.length; index++) {
    const start = index * 4;
    assert.equal(eventIsSkipped(event(start, start + 2), skipped), false);
    assert.equal(eventIsSkipped(event(start + 1, start + 2), skipped), true);
    assert.equal(eventIsSkipped(event(start, start + 2, 'exit'), skipped), false);
  }
  resetSkippedTraversal(skipped);
  assert.equal(eventIsSkipped(event(1, 2), skipped), true);
});

test('adjacent skipped roots remain independently deliverable', () => {
  const skipped: SkipState = {
    intervals: intervals(4),
    ranges: [
      { id: 0, start: 0, end: 2 },
      { id: 2, start: 2, end: 4 },
    ],
    cursor: 0,
  };
  assert.equal(eventIsSkipped(event(0, 2), skipped), false);
  assert.equal(eventIsSkipped(event(0, 2, 'exit'), skipped), false);
  assert.equal(eventIsSkipped(event(2, 4), skipped), false);
  assert.equal(eventIsSkipped(event(3, 4), skipped), true);
});

test('inline skip bounds work without an ID-indexed table or ordered IDs', () => {
  const skipped: SkipState = { ranges: [{ id: 91, start: 0, end: 4 }], cursor: 0 };
  const root = { ...event(91, 0), sequence: 0, traversalStart: 0, traversalEnd: 4 };
  const descendant = { ...event(2, 0), sequence: 3, traversalStart: 3, traversalEnd: 4 };
  const sibling = { ...event(1, 0), sequence: 4, traversalStart: 4, traversalEnd: 5 };
  assert.equal(eventIsSkipped(root, skipped), false);
  assert.equal(eventIsSkipped(descendant, skipped), true);
  assert.equal(eventIsSkipped({ ...descendant, side: 'exit' }, skipped), true);
  assert.equal(eventIsSkipped({ ...root, side: 'exit', sequence: 4 }, skipped), false);
  assert.equal(eventIsSkipped(sibling, skipped), false);
});
