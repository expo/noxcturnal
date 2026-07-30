import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  eventIsSkipped,
  resetSkippedTraversal,
  type SkipRange,
  type SkipState,
} from '../../js/runtime/path.js';
import type { NativeEvent } from '../../js/types.js';

function event(start: number, end: number, side: 'enter' | 'exit' = 'enter'): NativeEvent {
  return {
    id: start,
    type: 'Identifier',
    start,
    end,
    side,
    sequence: start,
    scopeId: 0,
    fields: [],
  };
}

test('skip lookup handles many independent ranges and resets', () => {
  const ranges: SkipRange[] = Array.from({ length: 1_024 }, (_, index) => ({
    start: index * 4,
    end: index * 4 + 2,
  }));
  const skipped: SkipState = { ranges, cursor: 0 };
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
    ranges: [
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ],
    cursor: 0,
  };
  assert.equal(eventIsSkipped(event(0, 2), skipped), false);
  assert.equal(eventIsSkipped(event(0, 2, 'exit'), skipped), false);
  assert.equal(eventIsSkipped(event(2, 4), skipped), false);
  assert.equal(eventIsSkipped(event(3, 4), skipped), true);
});
