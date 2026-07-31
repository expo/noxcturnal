import { expect, test } from 'vitest';
import { execute } from './runtime';

test('block-scoped loop bindings are unique per iteration', () => {
  const result = execute<{ result: number[] }>(
    `
      const callbacks = [];
      for (let index = 0; index < 3; index++) callbacks.push(() => index);
      globalThis.result = callbacks.map(read => read());
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([0, 1, 2]);
});

test('destructuring preserves computed-key evaluation order and object rest', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const order = [];
      const source = { first: 1, second: 2, third: 3 };
      const { [(() => { order.push('key'); return 'first'; })()]: value, second, ...rest } = source;
      globalThis.result = [order, value, second, rest];
    `,
    { transforms: { destructuring: { useBuiltIns: true } } },
  );
  expect(result.result).toEqual([['key'], 1, 2, { third: 3 }]);
});

test('parameter defaults have their own scope and preserve function length', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let outer = 2;
      function read(first, second = () => outer, ...rest) {
        let outer = 9;
        return [second(), rest];
      }
      globalThis.result = [read.length, read(1, undefined, 3, 4)];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([1, [2, [3, 4]]]);
});

test('for-of closes an iterator on abrupt completion', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let value = 0;
          return {
            next() { calls.push('next'); return { value: ++value, done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      for (const value of iterable) { calls.push(value); break; }
      globalThis.result = calls;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual(['next', 1, 'return']);
});

test('captured loop bindings preserve mutation within each iteration', () => {
  const result = execute<{ result: number[] }>(
    `
      const callbacks = [];
      for (let value of [1, 2]) {
        callbacks.push(() => ++value);
        value += 10;
      }
      globalThis.result = callbacks.map(read => read());
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([12, 13]);
});

test('labeled continue preserves nested-loop control flow and bindings', () => {
  const result = execute<{ result: string[] }>(
    `
      const callbacks = [];
      outer: for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 3; column++) {
          if (column === 1) continue outer;
          callbacks.push(() => row + ':' + column);
        }
      }
      globalThis.result = callbacks.map(read => read());
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual(['0:0', '1:0', '2:0']);
});

test('array destructuring consumes iterators, applies defaults, and closes after rest-free completion', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let index = 0;
          return {
            next() { calls.push('next'); return { value: [undefined, 2, 3][index++], done: index > 3 }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      const [first = 1, second] = iterable;
      globalThis.result = [first, second, calls];
    `,
    { transforms: { destructuring: { useBuiltIns: true } } },
  );
  expect(result.result).toEqual([1, 2, ['next', 'next', 'return']]);
});

test('destructuring assignment evaluates its target references once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let reads = 0;
      const target = { value: 0 };
      const object = () => { reads++; return target; };
      ({ value: object().value = 4 } = { value: undefined });
      globalThis.result = [target.value, reads];
    `,
    { transforms: { destructuring: { useBuiltIns: true } } },
  );
  expect(result.result).toEqual([4, 1]);
});

test('parameter lowering preserves unmapped arguments and default visibility', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function read(value = 1) {
        value = 2;
        return [value, arguments[0], arguments.length];
      }
      globalThis.result = [read(), read(5)];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([
    [2, undefined, 0],
    [2, 5, 1],
  ]);
});

test('arrow parameter lowering preserves lexical this and arguments', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function make(prefix) {
        return ((value = this.value) => [prefix, value, arguments[0]]).call({ value: 99 });
      }
      globalThis.result = make.call({ value: 4 }, 'prefix');
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual(['prefix', 4, 'prefix']);
});
