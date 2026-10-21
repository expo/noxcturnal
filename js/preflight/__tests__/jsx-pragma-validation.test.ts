import { expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../index';

test.each([
  { field: 'jsxPragma' as const, value: 'runtime..create', rejects: true },
  { field: 'jsxPragmaFrag' as const, value: 'runtime..Fragment', rejects: true },
  { field: 'jsxPragma' as const, value: 'runtime.ui.create', rejects: false },
  { field: 'jsxPragmaFrag' as const, value: 'runtime.ui.Fragment', rejects: false },
])('JSX pragma validation: $field=$value', entry => {
  const compile = () =>
    transform(
      'globalThis.result=<><div /></>;',
      'input.jsx',
      defineNativePipeline({
        phases: [{ name: 'jsx', native: { jsx: 'classic', [entry.field]: entry.value } }],
      }),
    );
  if (entry.rejects) {
    expect(compile).toThrow(/transform-error|invalid.*pragma|pragma.*invalid/i);
  } else {
    const result = compile();
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).not.toMatch(/<div|<>/);
    expect(() => new Function(result.code)).not.toThrow();
    expect(result.code).toContain(entry.value);
  }
});
