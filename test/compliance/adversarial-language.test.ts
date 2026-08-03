import { expect, test } from 'vitest';
import { execute, executeModule } from './runtime';

test('empty array destructuring acquires and closes its iterator without advancing it', () => {
  const result = execute<{ result: string[] }>(
    `
    const calls = [];
    const iterable = { [Symbol.iterator]() { calls.push('iterator'); return {
      next() { calls.push('next'); return { done: false, value: 1 }; },
      return() { calls.push('return'); return {}; },
    }; } };
    const [] = iterable;
    globalThis.result = calls;
  `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual(['iterator', 'return']);
});

test('parameter defaults observe the original arguments object', () => {
  const result = execute<{ result: unknown[] }>(
    `
    function read(first = arguments[1], second = arguments.length) {
      return [first, second, arguments.length, arguments[0]];
    }
    globalThis.result = [read(undefined, 7), read()];
  `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([
    [7, 7, 2, undefined],
    [undefined, 0, 0, undefined],
  ]);
});

test('derived class fields initialize the constructed receiver even when the constructor returns another object', () => {
  const result = execute<{ result: unknown[] }>(
    `
    let receiver;
    class Base { constructor() { receiver = this; } }
    class Child extends Base { field = 1; constructor() { super(); return { alternate: true }; } }
    const returned = new Child();
    globalThis.result = [returned.alternate, returned.field, receiver.field, receiver instanceof Child];
  `,
    { transforms: { classes: true, classProperties: { loose: false } } },
  );
  expect(result.result).toEqual([true, undefined, 1, true]);
});

test('a failing disposer lookup disposes resources registered earlier in the scope', () => {
  const result = execute<{ result: unknown[] }>(
    `
    const calls = [];
    try {
      using first = { [Symbol.dispose]() { calls.push('dispose:first'); } };
      using second = { get [Symbol.dispose]() { calls.push('get:second'); throw new Error('lookup'); } };
      void first; void second;
    } catch (error) { calls.push(error.message); }
    globalThis.result = calls;
  `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['get:second', 'dispose:first', 'lookup']);
});

test('computed logical assignment evaluates base then key and does not repeat either', () => {
  const result = execute<{ result: unknown[] }>(
    `
    const calls = [];
    const target = { value: 0 };
    const base = () => (calls.push('base'), target);
    const key = () => (calls.push('key'), 'value');
    base()[key()] ||= (calls.push('rhs'), 2);
    globalThis.result = [target.value, calls];
  `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([2, ['base', 'key', 'rhs']]);
});

test('dead-code elimination retains dependencies of a default-exported function', async () => {
  const module = await executeModule(
    `
      const helper = () => 42;
      function nested() { return helper(); }
      export default function entry() { return nested(); }
    `,
    { optimize: { deadCodeElimination: true } },
  );
  expect((module.default as () => number)()).toBe(42);
});
