import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformError,
  transform,
} from '../../index';

const cases = [
  { name: 'distinct phase names', together: false, repeated: false, rejected: false },
  { name: 'repeated phase names', together: false, repeated: true, rejected: false },
  {
    name: 'different ranges within one phase',
    together: true,
    repeated: false,
    rejected: true,
  },
];
describe.each(cases)('$name', entry => {
  let rejected: boolean;
  beforeAll(() => {
    const claim = (name: string, start: number) =>
      defineNativePlugin({
        name,
        pre(context) {
          context.ensureReplace('shared/value', start, start + 3, 'xxx');
        },
      });
    const first = claim('first', 0);
    const second = claim('second', 5);
    const pipeline = defineNativePipeline({
      phases: entry.together
        ? [{ name: 'edit', plugins: [first, second] }]
        : [
            { name: 'edit', plugins: [first] },
            { name: entry.repeated ? 'edit' : 'later', plugins: [second] },
          ],
    });
    try {
      const result = transform('aaa; bbb;', 'input.js', pipeline);
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe('xxx; bbb;');
      rejected = false;
    } catch (error) {
      expect(error).toBeInstanceOf(NativeTransformError);
      expect((error as Error).message).toMatch(/targets 5\.\.8.*but 0\.\.3/);
      expect((error as NativeTransformError).owners).toEqual(['second', 'first']);
      rejected = true;
    }
  });
  test('applies range equality only within the same phase occurrence', () => {
    expect(rejected).toBe(entry.rejected);
  });
});
