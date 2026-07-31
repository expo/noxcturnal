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

test.each([
  { mode: 'spec', loose: false },
  { mode: 'loose', loose: true },
] as const)('$mode optional chaining preserves ordinary nullish short-circuiting', ({ loose }) => {
  const source = `
    let calls = 0;
    const read = value => (calls++, value);
    globalThis.result = [read(null)?.value, read({ value: 2 })?.value, calls];
  `;
  expect(
    execute<{ result: unknown[] }>(source, {
      transforms: { optionalChaining: { loose } },
    }).result,
  ).toEqual([undefined, 2, 2]);
});

test.each([
  { mode: 'spec', loose: false },
  { mode: 'loose', loose: true },
] as const)('$mode nullish coalescing preserves falsy and nullish values', ({ loose }) => {
  const source = `globalThis.result = [0 ?? 1, false ?? 2, null ?? 3, undefined ?? 4];`;
  expect(
    execute<{ result: unknown[] }>(source, {
      transforms: { nullishCoalescingOperator: { loose } },
    }).result,
  ).toEqual([0, false, 3, 4]);
});

test.each([
  {
    mode: 'spec helpers',
    options: { loose: false, useBuiltIns: false },
    expected: [3, 2, 2, 2],
  },
  {
    mode: 'spec built-ins',
    options: { loose: false, useBuiltIns: true },
    expected: [3, 2, 2, 2],
  },
  {
    mode: 'loose helpers',
    options: { loose: true, useBuiltIns: false },
    expected: [3, 2, undefined, undefined],
  },
  {
    mode: 'loose built-ins',
    options: { loose: true, useBuiltIns: true },
    expected: [3, 2, undefined, undefined],
  },
] as const)(
  '$mode object rest/spread preserves its specified semantics',
  ({ options, expected }) => {
    const source = `
    const symbol = Symbol('value');
    const first = { value: 1, [symbol]: 2 };
    const output = { ...first, value: 3 };
    const { value, ...rest } = output;
    function pick({ value, ...parameterRest }) { return parameterRest[symbol]; }
    globalThis.result = [value, output[symbol], rest[symbol], pick(output)];
  `;
    expect(
      execute<{ result: unknown[] }>(source, {
        transforms: { objectRestSpread: options },
      }).result,
    ).toEqual(expected);
  },
);

test('destructuring helper modes preserve nested patterns and rest values', () => {
  const source = `
    const input = { nested: { first: 1 }, second: 2, third: 3 };
    const { nested: { first }, ...rest } = input;
    globalThis.result = [first, rest];
  `;
  expect(
    execute<{ result: unknown[] }>(source, {
      transforms: { destructuring: true },
    }).result,
  ).toEqual([1, { second: 2, third: 3 }]);
});
