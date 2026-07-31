import { expect, test } from 'vitest';
import { execute } from './runtime';

test('Flow components preserve renamed, defaulted, destructured, and rest props', () => {
  const result = execute<{ result: unknown[] }>(
    `
      // @flow
      component Read(
        external as local: number = 2,
        nested as { value }: { value: number },
        ...rest: { label?: string }
      ) {
        return [local, value, rest.label];
      }
      globalThis.result = [
        Read({ external: 3, nested: { value: 4 }, label: 'first' }),
        Read({ nested: { value: 5 } }),
      ];
    `,
    {},
  );
  expect(result.result).toEqual([
    [3, 4, 'first'],
    [2, 5, undefined],
  ]);
});

test('Flow hooks preserve defaults, rest parameters, and return values', () => {
  const result = execute<{ result: number[] }>(
    `
      // @flow
      hook useTotal(first: number = 1, ...rest: Array<number>): number {
        return first + rest.reduce((sum, value) => sum + value, 0);
      }
      globalThis.result = [useTotal(), useTotal(2, 3, 4)];
    `,
    {},
  );
  expect(result.result).toEqual([1, 9]);
});

test('Flow match evaluates its argument once and selects guarded patterns', () => {
  const result = execute<{ result: unknown[] }>(
    `
      // @flow
      let reads = 0;
      const read = value => { reads++; return value; };
      const classify = value => match (read(value)) {
        { kind: 'count', value: const count } if (count > 0) => ['positive', count],
        { kind: 'count' } => ['non-positive'],
        [const first, ...const rest] => ['array', first, rest.length],
        _ => ['other'],
      };
      globalThis.result = [classify({ kind: 'count', value: 2 }), classify([1, 2, 3]), reads];
    `,
    {},
  );
  expect(result.result).toEqual([['positive', 2], ['array', 1, 2], 2]);
});

test('non-exhaustive Flow match throws after all cases fail', () => {
  const result = execute<{ result: string }>(
    `
      // @flow
      try {
        match (2) { 1 => { globalThis.result = 'matched'; } }
      } catch (error) {
        globalThis.result = error.message;
      }
    `,
    {},
  );
  expect(result.result).toMatch(/No case succesfully matched/);
});

function flowEnumRuntime() {
  const runtime = (members: Record<string, unknown>) => Object.freeze({ ...members });
  runtime.Mirrored = (members: string[]) =>
    Object.freeze(Object.fromEntries(members.map(member => [member, member])));
  return runtime;
}

test('Flow enum representations preserve mirrored, string, number, and symbol values', () => {
  const result = execute<{ result: unknown[] }>(
    `
      // @flow
      enum Mirrored { First, Second }
      enum Text of string { First = 'first', Second = 'second' }
      enum Numeric of number { First = 1, Second = 2 }
      enum Symbols of symbol { First, Second }
      globalThis.result = [
        Mirrored.First,
        Text.Second,
        Numeric.First,
        typeof Symbols.Second,
        Object.isFrozen(Mirrored),
      ];
    `,
    {},
    {
      require(specifier: string) {
        if (specifier !== 'flow-enums-runtime') throw new Error(`Unexpected module: ${specifier}`);
        return flowEnumRuntime();
      },
    },
  );
  expect(result.result).toEqual(['First', 'second', 1, 'symbol', true]);
});

test('Flow match supports aliases, alternation, NaN, and instance patterns', () => {
  const result = execute<{ result: string[] }>(
    `
      // @flow
      class Box {}
      const classify = value => match (value) {
        NaN => 'nan',
        1 | 2 => 'small',
        Box {} as const box => box instanceof Box ? 'box' : 'wrong',
        _ => 'other',
      };
      globalThis.result = [classify(NaN), classify(2), classify(new Box()), classify(9)];
    `,
    {},
  );
  expect(result.result).toEqual(['nan', 'small', 'box', 'other']);
});

test('Flow match object patterns ignore unrelated properties and bind rest', () => {
  const result = execute<{ result: unknown[] }>(
    `
      // @flow
      const read = value => match (value) {
        { selected: const selected, ...const rest } => [selected, rest],
      };
      globalThis.result = read({ selected: 1, kept: 2 });
    `,
    {},
  );
  expect(result.result).toEqual([1, { kept: 2 }]);
});
