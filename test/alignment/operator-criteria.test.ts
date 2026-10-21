import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import type { PreflightPlan } from '../../js';
import { alignBabelBehavior } from './transform';

const require = createRequire(import.meta.url);
const cases: {
  name: string;
  plugin: string;
  plan: PreflightPlan;
  source: string;
  expected: unknown;
  absent: RegExp;
}[] = [
  {
    name: 'dynamic BigInt exponentiation follows Babel Math.pow behavior',
    plugin: 'exponentiation-operator',
    plan: { transforms: { exponentiationOperator: true } },
    source: `
      function power(left, right) { return left ** right; }
      try { globalThis.__result = String(power(2n, 3n)); }
      catch (error) { globalThis.__result = error.name; }
    `,
    expected: 'TypeError',
    absent: /\*\*/,
  },
  {
    name: 'exponentiation follows Babel lexical Math lookup',
    plugin: 'exponentiation-operator',
    plan: { transforms: { exponentiationOperator: true } },
    source: `
      function power(Math, left, right) { return left ** right; }
      try { globalThis.__result = power(null, 2, 3); }
      catch (error) { globalThis.__result = error.name; }
    `,
    expected: 'TypeError',
    absent: /\*\*/,
  },
  {
    name: 'strict optional method call follows Babel own call dispatch',
    plugin: 'optional-chaining',
    plan: { transforms: { optionalChaining: { loose: false } } },
    source: `
      function method() { return 'method'; }
      method.call = () => 'override';
      const object = { method };
      globalThis.__result = object.method?.();
    `,
    expected: 'override',
    absent: /\?\./,
  },
  {
    name: 'strict optional call follows Babel noncallable call-property behavior',
    plugin: 'optional-chaining',
    plan: { transforms: { optionalChaining: { loose: false } } },
    source: `
      const object = { method: { call() { return 'accepted'; } } };
      try { globalThis.__result = object.method?.(); }
      catch (error) { globalThis.__result = error.name; }
    `,
    expected: 'accepted',
    absent: /\?\./,
  },
];

// These paths emit no runtime helper; helper-mode duplication adds no evidence.
for (const entry of cases) {
  test(entry.name, async () => {
    await expect(
      alignBabelBehavior({
        source: entry.source,
        filename: 'input.js',
        plugins: [[require('@babel/plugin-transform-' + entry.plugin), { loose: false }]],
        noxcturnal: { ...entry.plan, helpers: { mode: 'inline' } },
        output: { mustNotMatch: [entry.absent] },
      }),
    ).resolves.toEqual(entry.expected);
  });
}
