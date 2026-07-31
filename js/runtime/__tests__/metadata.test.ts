import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, transform } from '../../index';
test('validates metadata ownership', () => {
  const plugin = defineNativePlugin({
    name: 'metadata',
    pre(context) {
      context.metadata.set('undeclared', true);
    },
  });
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /undeclared metadata key/,
  );
});
