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

test('constant folding respects shadowed undefined and wraps bitwise operands', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function inspect(undefined, Infinity, NaN) {
        return [
          void 0,
          1 / 0,
          0 / 0,
          4294967296 | 0,
          4294967295 | 0,
          4294967296 >>> 0,
        ];
      }
      globalThis.result = inspect('shadowed', 'shadowed', 'shadowed');
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result.slice(0, 2)).toEqual([undefined, Infinity]);
  expect(Number.isNaN(result.result[2])).toBe(true);
  expect(result.result.slice(3)).toEqual([0, -1, 0]);
});

test('dead-function elimination preserves bindings observable through direct eval', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function inspect() {
        const hidden = () => 42;
        return eval('hidden()');
      }
      globalThis.result = [inspect()];
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toEqual([42]);
});

test('dead-function elimination preserves valid for-loop initializers', () => {
  const result = execute<{ result: boolean }>(
    `
      let ran = false;
      for (let unused = () => 1; !ran; ran = true) {}
      globalThis.result = ran;
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect(result.result).toBe(true);
});

test('constant folding preserves Annex B bindings from unreachable if functions', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let threw = false;
      let value = 'initial';
      if (false) function hidden() {}
      try { value = hidden; } catch (error) { threw = error instanceof ReferenceError; }
      globalThis.result = [value, threw];
    `,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([undefined, false]);
});

test('constant folding uses UTF-16 code-unit ordering for strings', () => {
  const result = execute<{ result: boolean[] }>(
    `globalThis.result = ['\\u{10000}' < '\\uE000', '\\uE000' < '\\u{10000}'];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([true, false]);
});

test('constant folding follows ECMAScript StringNumericLiteral parsing', () => {
  const largeBinary =
    '0001101100000000000001001011101011011100011011001011010011000101111011000000101000111001101111110010100111111101101';
  const result = execute<{ result: unknown[] }>(
    `globalThis.result = [!+'inf', !+'-inf', !!+'Infinity', +'0x10', +'0b10', +'0o10', !+'1_0', '-inf' < 0, +'1\\u00a0', !+'\\ufeff', +'0b${largeBinary}'];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([
    true,
    true,
    true,
    16,
    2,
    8,
    true,
    false,
    1,
    true,
    Number(`0b${largeBinary}`),
  ]);
});

test('constant folding preserves signed zero semantics', () => {
  const result = execute<{ result: number[] }>(
    `globalThis.result = [1 / -0, 1 / +'-0', 1 / ((0 * -1) ** 3), 1 / ((0 * -1) ** 2)];`,
    { optimize: { constantFolding: true } },
  );
  expect(result.result).toEqual([-Infinity, -Infinity, -Infinity, Infinity]);
});
