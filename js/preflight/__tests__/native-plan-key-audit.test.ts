import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform, type PreflightPlan } from '../../index';

const cases = [
  { name: 'misplaced transform', plan: { blockScoping: true }, reject: true, fails: true },
  {
    name: 'misspelled transform group',
    plan: { transfroms: { blockScoping: true } },
    reject: true,
    fails: true,
  },
  {
    name: 'unknown key alongside active option',
    plan: { blockScoping: true, compact: true },
    reject: true,
    fails: true,
  },
  {
    name: 'unknown nested transform',
    plan: { transforms: { misspelled: true } },
    reject: true,
    fails: false,
  },
  {
    name: 'correct transform group',
    plan: { transforms: { blockScoping: true } },
    reject: false,
    fails: false,
  },
];
describe.each(cases)('$name', entry => {
  let rejected: boolean;
  beforeAll(() => {
    try {
      // Exercise JavaScript callers and decoded configuration, beyond excess-property typing.
      const pipeline = defineNativePipeline({
        phases: [{ name: 'native-key-audit', native: entry.plan as unknown as PreflightPlan }],
      });
      const result = transform('let value=3;', 'input.js', pipeline);
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      if (entry.reject) expect(result.code).toMatch(/\blet\b/);
      else expect(result.code).toMatch(/\bvar\b/);
      rejected = false;
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/unknown|invalid|unsupported/i);
      rejected = true;
    }
  });
  (entry.fails ? test.fails : test)(
    'rejects invalid enabled configuration rather than ignoring it',
    () => {
      expect(rejected).toBe(entry.reject);
    },
  );
});
