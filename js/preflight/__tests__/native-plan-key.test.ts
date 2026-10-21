import { expect, test } from 'vitest';
import { defineNativePipeline, transform, type PreflightPlan } from '../../index';

const cases = [
  { name: 'misplaced transform', plan: { blockScoping: true }, reject: true },
  {
    name: 'misspelled transform group',
    plan: { transfroms: { blockScoping: true } },
    reject: true,
  },
  {
    name: 'unknown key alongside active option',
    plan: { blockScoping: true, compact: true },
    reject: true,
  },
  {
    name: 'unknown nested transform',
    plan: { transforms: { misspelled: true } },
    reject: true,
  },
  {
    name: 'correct transform group',
    plan: { transforms: { blockScoping: true } },
    reject: false,
  },
];
test.each(cases)('native configuration validation: $name', entry => {
  // Exercise JavaScript callers and decoded configuration, beyond excess-property typing.
  const compile = () =>
    transform(
      'let value=3;',
      'input.js',
      defineNativePipeline({
        phases: [{ name: 'native-key-audit', native: entry.plan as unknown as PreflightPlan }],
      }),
    );
  if (entry.reject) {
    expect(compile).toThrow(/unknown|invalid|unsupported/i);
  } else {
    const result = compile();
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toMatch(/\bvar\b/);
  }
});
