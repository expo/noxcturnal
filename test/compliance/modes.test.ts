import { expect, test } from 'vitest';
import { execute } from './runtime';

test('spec class fields define properties while loose fields use assignment semantics', () => {
  const source = `
    const calls = [];
    class Base { set value(next) { calls.push(next); } }
    class Child extends Base { value = 2; }
    const child = new Child();
    globalThis.result = [calls, Object.hasOwn(child, 'value'), child.value];
  `;
  const spec = execute<{ result: unknown[] }>(source, {
    transforms: { classProperties: { loose: false } },
  });
  const loose = execute<{ result: unknown[] }>(source, {
    transforms: { classProperties: { loose: true } },
  });
  expect(spec.result).toEqual([[], true, 2]);
  expect(loose.result).toEqual([[2], false, undefined]);
});

test('spec and loose optional chaining preserve ordinary nullish short-circuiting', () => {
  const source = `
    let calls = 0;
    const read = value => (calls++, value);
    globalThis.result = [read(null)?.value, read({ value: 2 })?.value, calls];
  `;
  for (const loose of [false, true]) {
    expect(
      execute<{ result: unknown[] }>(source, {
        transforms: { optionalChaining: { loose } },
      }).result,
    ).toEqual([undefined, 2, 2]);
  }
});

test('spec and loose nullish coalescing preserve falsy and nullish values', () => {
  const source = `globalThis.result = [0 ?? 1, false ?? 2, null ?? 3, undefined ?? 4];`;
  for (const loose of [false, true]) {
    expect(
      execute<{ result: unknown[] }>(source, {
        transforms: { nullishCoalescingOperator: { loose } },
      }).result,
    ).toEqual([0, false, 3, 4]);
  }
});

test('supported object spread modes preserve values and property precedence', () => {
  const source = `
    const symbol = Symbol('value');
    const first = { value: 1, [symbol]: 2 };
    const output = { ...first, value: 3 };
    globalThis.result = [output.value, output[symbol]];
  `;
  for (const options of [
    { loose: false, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ]) {
    expect(
      execute<{ result: unknown[] }>(source, {
        transforms: { objectRestSpread: options },
      }).result,
    ).toEqual([3, 2]);
  }
});

test('destructuring helper modes preserve nested patterns and rest values', () => {
  const source = `
    const input = { nested: { first: 1 }, second: 2, third: 3 };
    const { nested: { first }, ...rest } = input;
    globalThis.result = [first, rest];
  `;
  for (const useBuiltIns of [false, true]) {
    expect(
      execute<{ result: unknown[] }>(source, {
        transforms: { destructuring: { useBuiltIns } },
      }).result,
    ).toEqual([1, { second: 2, third: 3 }]);
  }
});
