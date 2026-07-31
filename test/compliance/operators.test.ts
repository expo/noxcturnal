import { expect, test } from 'vitest';
import { execute } from './runtime';

test('optional chaining short-circuits without evaluating keys or arguments', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let effects = 0;
      const missing = null;
      const present = { method(value) { return value; }, nested: { value: 3 } };
      globalThis.result = [
        missing?.[++effects],
        missing?.method(++effects),
        present?.nested?.value,
        present.method?.(++effects),
        effects,
      ];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([undefined, undefined, 3, 1, 1]);
});

test('nullish coalescing evaluates its left side once and only falls back for nullish values', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let reads = 0;
      const read = value => { reads++; return value; };
      globalThis.result = [read(0) ?? 1, read('') ?? 2, read(null) ?? 3, read(undefined) ?? 4, reads];
    `,
    { transforms: { nullishCoalescingOperator: { loose: false } } },
  );
  expect(result.result).toEqual([0, '', 3, 4, 4]);
});

test('logical assignment evaluates a computed reference once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let keyReads = 0;
      const key = () => { keyReads++; return 'value'; };
      const left = { value: 0 };
      const right = { value: null };
      left[key()] ||= 2;
      right[key()] ??= 3;
      left[key()] &&= 4;
      globalThis.result = [left.value, right.value, keyReads];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([4, 3, 3]);
});

test('exponentiation preserves precedence, associativity, and assignment references', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let reads = 0;
      const holder = { value: 2 };
      const object = () => { reads++; return holder; };
      object().value **= 3;
      globalThis.result = [2 ** 3 ** 2, holder.value, reads];
    `,
    { transforms: { exponentiationOperator: true } },
  );
  expect(result.result).toEqual([512, 8, 1]);
});

test('object spread preserves key order, symbols, and later-property precedence', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const symbol = Symbol('value');
      const source = { first: 1, [symbol]: 2, overwritten: 3 };
      const value = { ...source, overwritten: 4, last: 5 };
      globalThis.result = [Object.keys(value), value[symbol], value.overwritten];
    `,
    { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
  );
  expect(result.result).toEqual([['first', 'overwritten', 'last'], 2, 4]);
});

test('optional catch binding preserves thrown values and nested scope', () => {
  const result = execute<{ result: string }>(
    `
      let value = 'outer';
      try { throw new Error('ignored'); } catch { let value = 'inner'; void value; }
      globalThis.result = value;
    `,
    { transforms: { optionalCatchBinding: true } },
  );
  expect(result.result).toBe('outer');
});

test('optional method calls preserve this and evaluate the base once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let reads = 0;
      const receiver = { value: 4, read(extra) { return this.value + extra; } };
      const base = () => (reads++, receiver);
      globalThis.result = [base()?.read?.(3), reads];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([7, 1]);
});

test('optional delete succeeds when the chain short-circuits', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const missing = null;
      const present = { value: 1 };
      globalThis.result = [delete missing?.value, delete present?.value, 'value' in present];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([true, true, false]);
});

test('nullish coalescing reads an accessor exactly once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let reads = 0;
      const source = { get value() { reads++; return null; } };
      globalThis.result = [source.value ?? 4, reads];
    `,
    { transforms: { nullishCoalescingOperator: { loose: false } } },
  );
  expect(result.result).toEqual([4, 1]);
});

test('logical assignment calls accessors according to short-circuit semantics', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      let stored = 0;
      const source = {
        get value() { calls.push('get'); return stored; },
        set value(value) { calls.push('set:' + value); stored = value; },
      };
      source.value ||= 2;
      source.value ||= 3;
      globalThis.result = [stored, calls];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([2, ['get', 'set:2', 'get']]);
});

test('BigInt exponentiation remains exact', () => {
  const result = execute<{ result: bigint[] }>(
    `
      let value = 3n;
      value **= 4n;
      globalThis.result = [2n ** 64n, value];
    `,
    { transforms: { exponentiationOperator: true } },
  );
  expect(result.result).toEqual([18446744073709551616n, 81n]);
});

test('object rest copies enumerable own properties and excludes selected keys', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const symbol = Symbol('symbol');
      const source = Object.create({ inherited: 1 });
      Object.defineProperty(source, 'hidden', { value: 2, enumerable: false });
      source.selected = 3;
      source.kept = 4;
      source[symbol] = 5;
      const { selected, ...rest } = source;
      globalThis.result = [selected, rest.kept, rest[symbol], 'hidden' in rest, 'inherited' in rest];
    `,
    { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
  );
  expect(result.result).toEqual([3, 4, 5, false, false]);
});
