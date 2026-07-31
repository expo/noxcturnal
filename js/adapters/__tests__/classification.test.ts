import assert from 'node:assert/strict';
import { test } from 'vitest';

import { classify } from '../../index';
test('loads the Noxcturnal binding and classifies parser routes', () => {
  assert.deepEqual(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');
  assert.equal(classify('fixture.js', '// @flow\nconst x: number = 1').supported, false);
});
