import { expect, test } from 'vitest';
import { execute } from './runtime';

test('constant folding preserves arithmetic and coercion results', () => {
  const result = execute<{ result: unknown[] }>(
    `globalThis.result = [1 + 2 * 3, 'value:' + 4, !0, 8 >>> 2, null == undefined];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([7, 'value:4', true, 2, true]);
});

test('constant folding preserves short-circuit side effects', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const read = value => (calls.push(value), value);
      globalThis.result = [false && read('and'), true || read('or'), true ? read('yes') : read('no'), calls];
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([false, true, 'yes', ['yes']]);
});

test('dead-code elimination retains live functions and side-effecting initializers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      function dead() { calls.push('dead'); }
      function live(value) { return value + 1; }
      const retained = (calls.push('initializer'), () => 9);
      globalThis.result = [live(2), retained(), calls];
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toEqual([3, 9, ['initializer']]);
});

test('combined folding and elimination preserve the selected branch', () => {
  const result = execute<{ result: number }>(
    `
      function unused() { return 0; }
      function selected() { return 1 + 2 * 3; }
      if (1) globalThis.result = selected(); else globalThis.result = unused();
    `,
    { optimize: { constantFolding: true, deadCodeElimination: true } },
  );
  expect(result.result).toBe(7);
});
