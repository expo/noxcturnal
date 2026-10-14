import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

describe.each([
  { name: 'unsupported first cleanup throws', filename: 'input.txt', throwing: 0, fails: true },
  { name: 'unsupported middle cleanup throws', filename: 'input.txt', throwing: 1, fails: true },
  { name: 'unsupported successful cleanup', filename: 'input.txt', throwing: -1, fails: false },
  { name: 'supported first cleanup throws', filename: 'input.js', throwing: 0, fails: false },
])('$name', entry => {
  let counts: number[];
  beforeAll(() => {
    counts = [0, 0, 0];
    const prepared: number[] = [];
    const plugins = counts.map((_, index) =>
      defineNativePlugin({
        name: `cleanup-${index}`,
        createState() {
          prepared.push(index);
          return index;
        },
        cleanup(_reason, state) {
          expect(state).toBe(index);
          counts[index]++;
          if (index === entry.throwing) throw new Error('cleanup sentinel');
        },
      }),
    );
    let caught: unknown;
    try {
      const result = transform(
        'const value=3;',
        entry.filename,
        defineNativePipeline({ phases: [{ name: 'scan', plugins }] }),
      );
      expect(result.status).toBe('bailout');
      if (result.status === 'bailout') expect(result.source).toBe('const value=3;');
    } catch (error) {
      caught = error;
    }
    expect(prepared).toEqual([0, 1, 2]);
    if (entry.throwing >= 0) expect((caught as Error)?.message).toMatch(/cleanup sentinel/);
    else expect(caught).toBeUndefined();
  });
  (entry.fails ? test.fails : test)('cleans every prepared state exactly once', () => {
    expect(counts).toEqual([1, 1, 1]);
  });
});
