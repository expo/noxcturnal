import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

describe.each([
  ['number', 3],
  ['object', { value: 3 }],
  ['null', null],
] as const)('metadata %s value', (_label, value) => {
  describe.each(['__proto__', 'constructor'])('key %s', key => {
    let read: unknown;
    let metadata: Record<string, unknown>;
    beforeAll(() => {
      const writer = defineNativePlugin({
        name: 'metadata-property-writer',
        contract: { metadata: { writes: [key] } },
        pre(context) {
          context.metadata.set(key, value);
        },
      });
      const reader = defineNativePlugin({
        name: 'metadata-property-reader',
        contract: { metadata: { reads: [key] } },
        post(context) {
          read = context.metadata.get(key);
        },
      });
      const result = transform(
        '3;',
        'input.js',
        defineNativePipeline({
          phases: [
            { name: 'write', plugins: [writer] },
            { name: 'read', plugins: [reader] },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      metadata = result.metadata;
    });

    test('retains the declared metadata entry across phases', () => {
      expect(read).toBe(value);
      expect(Object.hasOwn(metadata, key)).toBe(true);
      expect(metadata[key]).toBe(value);
    });
  });
});
