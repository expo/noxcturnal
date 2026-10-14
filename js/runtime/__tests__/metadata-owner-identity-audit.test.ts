import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

describe.each([false, true])('shared plugin name=%s', sharedName => {
  let rejected: boolean;
  beforeAll(() => {
    const make = (name: string, value: number) =>
      defineNativePlugin({
        name,
        contract: { metadata: { writes: ['shared'] } },
        pre(context) {
          context.metadata.set('shared', value);
        },
      });
    const first = make('writer', 1);
    const second = make(sharedName ? 'writer' : 'peer', 2);
    expect(first).not.toBe(second);
    try {
      const result = transform(
        '3;',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'write', plugins: [first, second] }],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.metadata.shared).toBe(2);
      rejected = false;
    } catch (error) {
      expect((error as Error).message).toMatch(/metadata key shared is owned by both/);
      rejected = true;
    }
  });
  test('rejects two definitions claiming the same metadata key', () => {
    expect(rejected).toBe(true);
  });
});
