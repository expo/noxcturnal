import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../index';

describe.each([
  { field: 'jsxPragma' as const, value: 'runtime..create', fails: true },
  { field: 'jsxPragmaFrag' as const, value: 'runtime..Fragment', fails: true },
  { field: 'jsxPragma' as const, value: 'runtime.ui.create', fails: false },
  { field: 'jsxPragmaFrag' as const, value: 'runtime.ui.Fragment', fails: false },
])('$field=$value', entry => {
  let rejected: boolean;
  beforeAll(() => {
    try {
      const pipeline = defineNativePipeline({
        phases: [
          {
            name: 'jsx',
            native: { jsx: 'classic', [entry.field]: entry.value },
          },
        ],
      });
      const result = transform('globalThis.result=<><div /></>;', 'input.jsx', pipeline);
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).not.toMatch(/<div|<>/);
      expect(() => new Function(result.code)).not.toThrow();
      expect(result.code).toContain(
        entry.fails
          ? entry.field === 'jsxPragma'
            ? 'React.createElement'
            : 'React.Fragment'
          : entry.value,
      );
      rejected = false;
    } catch (error) {
      expect((error as Error).message).toMatch(/transform-error|invalid.*pragma|pragma.*invalid/i);
      rejected = true;
    }
  });
  test('rejects malformed paths instead of falling back to React', () => {
    expect(rejected).toBe(entry.fails);
  });
});
