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

test.each([false, true])(
  'iterable function locals stay separate from captured loop bindings (forOf: %s)',
  forOf => {
    const result = execute<{ result: unknown[] }>(
      `
        const callbacks = [];
        const r = 'outer';
        let calls = 0;
        for (const t of (u => { calls++; const r = u; return r; })([1, 2, 3])) {
          callbacks.push(() => t);
        }
        globalThis.result = [callbacks.map(read => read()), calls, r];
      `,
      { transforms: { blockScoping: true, forOf } },
    );
    expect(result.result).toEqual([[1, 2, 3], 1, 'outer']);
  },
);

test('const assignment evaluates its right side before throwing without changing the binding', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const value = 1;
      let typeError = false;
      try { value = (calls.push('rhs'), 2); }
      catch (error) { typeError = error instanceof TypeError; calls.push('throw'); }
      globalThis.result = [value, calls, typeError];
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([1, ['rhs', 'throw'], true]);
});

test('const writes preserve logical short-circuiting, coercion, and destructuring RHS order', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const truthy = 1;
      truthy ||= calls.push('short-circuit');
      const falsy = 0;
      try { falsy ||= (calls.push('logical-rhs'), 2); }
      catch (error) { calls.push(error instanceof TypeError); }
      const coercible = { valueOf() { calls.push('coerce'); return 1; } };
      try { coercible += (calls.push('compound-rhs'), 2); }
      catch (error) { calls.push(error instanceof TypeError); }
      const updated = { valueOf() { calls.push('update-coerce'); return 1; } };
      try { updated++; }
      catch (error) { calls.push(error instanceof TypeError); }
      const fixed = 1;
      try { [fixed] = (calls.push('destructure-rhs'), [2]); }
      catch (error) { calls.push(error instanceof TypeError); }
      globalThis.result = calls;
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([
    'logical-rhs',
    true,
    'compound-rhs',
    'coerce',
    true,
    'update-coerce',
    true,
    'destructure-rhs',
    true,
  ]);
});

test('a getter-only private assignment evaluates its receiver and RHS without invoking the getter', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      class Value {
        get #readOnly() { calls.push('get'); return 1; }
        receiver() { calls.push('receiver'); return this; }
        write() {
          try { this.receiver().#readOnly = (calls.push('rhs'), 2); }
          catch (error) { calls.push(error instanceof TypeError); }
        }
      }
      new Value().write();
      globalThis.result = calls;
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual(['receiver', 'rhs', true]);
});

// Babel's default block-scoping transform does not enable its TDZ emulation,
// so it uses readOnlyError here and throws TypeError after the RHS. Keep the
// specification result executable until the canonical transform changes or a
// dedicated TDZ mode is introduced.
test.fails('assignment before a const declaration throws the TDZ ReferenceError', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      let errorName;
      try {
        value = (calls.push('rhs'), 2);
        const value = 1;
      } catch (error) {
        errorName = error.name;
      }
      globalThis.result = [calls, errorName];
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([['rhs'], 'ReferenceError']);
});

test('destructuring preserves computed-key evaluation order and object rest', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const order = [];
      const source = { first: 1, second: 2, third: 3 };
      const { [(() => { order.push('key'); return 'first'; })()]: value, second, ...rest } = source;
      globalThis.result = [order, value, second, rest];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([['key'], 1, 2, { third: 3 }]);
});

test('object rest applies ToPropertyKey to computed exclusions exactly once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const key = {
        [Symbol.toPrimitive](hint) { calls.push(hint); return 0; },
      };
      const { [key]: selected, ...rest } = { 0: 'selected', keep: 'kept' };
      globalThis.result = [selected, rest, calls];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual(['selected', { keep: 'kept' }, ['string']]);
});

test('object-rest computed keys match Babel for callable Symbol.toPrimitive results', () => {
  const result = execute<{ result: boolean }>(
    `
      const key = { [Symbol.toPrimitive]() { return function invalid() {}; } };
      let threw = false;
      try { const { [key]: selected, ...rest } = { value: 1 }; void selected; void rest; }
      catch (error) { threw = error instanceof TypeError; }
      globalThis.result = threw;
    `,
    { transforms: { destructuring: true } },
  );
  // Babel 7.29's toPrimitive helper rejects object results but treats callable
  // results as property-key-coercible values. Native helper materialization is
  // deliberately sourced from that pinned implementation.
  expect(result.result).toBe(false);
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

test('parameter and body var environments remain distinct for non-simple parameters', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function absent(a = 2) { var a; return a; }
      function initialized({ a } = { a: 2 }) { var a = 3; return a; }
      function declared(a = 2) { function a() {} return typeof a; }
      globalThis.result = [absent(), initialized(), declared()];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([2, 3, 'function']);
});

test('parameter-scope wrappers preserve the original arguments and new.target', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function Read(value = 2) {
        var value;
        return [value, arguments.length, arguments[0], new.target === Read];
      }
      globalThis.result = [Read(), new Read()];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([
    [2, 0, undefined, false],
    [2, 0, undefined, true],
  ]);
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

test('for-of IteratorClose preserves a thrown body completion over a throwing return method', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { return { value: 1, done: false }; },
            return() { calls.push('return'); throw new Error('close'); },
          };
        },
      };
      try {
        for (const value of iterable) { void value; throw new Error('body'); }
      } catch (error) {
        calls.push(error.message);
      }
      globalThis.result = calls;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual(['return', 'body']);
});

test('for-of validates IteratorClose results for non-throwing abrupt completion', () => {
  const result = execute<{ result: boolean }>(
    `
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { return { value: 1, done: false }; },
            return() { return 1; },
          };
        },
      };
      let threw = false;
      try { for (const value of iterable) { void value; break; } }
      catch (error) { threw = error instanceof TypeError; }
      globalThis.result = threw;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toBe(true);
});

test('for-of reads the return method once and calls it with the iterator receiver', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      let iterator;
      const iterable = {
        [Symbol.iterator]() {
          iterator = {
            next() { return { value: 1, done: false }; },
            get return() {
              calls.push('get');
              return function () { calls.push(['call', this === iterator]); return {}; };
            },
          };
          return iterator;
        },
      };
      for (const value of iterable) { void value; break; }
      globalThis.result = calls;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual(['get', ['call', true]]);
});

test('continue targeting the same for-of loop does not close its iterator', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let value = 0;
          return {
            next() { return value < 2 ? { value: ++value, done: false } : { done: true }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      for (const value of iterable) { calls.push(value); continue; }
      globalThis.result = calls;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual([1, 2]);
});

test('for-of captures the next method once and preserves its iterator receiver', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      let iterator;
      const iterable = {
        [Symbol.iterator]() {
          let value = 0;
          iterator = {
            get next() {
              calls.push('get');
              return function () {
                calls.push(['call', this === iterator]);
                return value < 2 ? { value: ++value, done: false } : { done: true };
              };
            },
          };
          return iterator;
        },
      };
      const values = [];
      for (const value of iterable) values.push(value);
      globalThis.result = [values, calls];
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual([
    [1, 2],
    ['get', ['call', true], ['call', true], ['call', true]],
  ]);
});

test('for-of rejects a primitive result returned by iterator.next', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let first = true;
          return {
            next() {
              calls.push('next');
              if (first) { first = false; return 1; }
              return { done: true };
            },
            return() { calls.push('return'); return {}; },
          };
        },
      };
      let typeError = false;
      try { for (const value of iterable) calls.push(value); }
      catch (error) { typeError = error instanceof TypeError; }
      globalThis.result = [typeError, calls];
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual([true, ['next']]);
});

test('for-of closes only after IteratorComplete succeeds', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const make = failingProperty => ({
        [Symbol.iterator]() {
          return {
            next() {
              calls.push('next:' + failingProperty);
              return {
                get done() {
                  calls.push('done:' + failingProperty);
                  if (failingProperty === 'done') throw new Error('done');
                  return false;
                },
                get value() {
                  calls.push('value:' + failingProperty);
                  throw new Error('value');
                },
              };
            },
            return() { calls.push('return:' + failingProperty); return {}; },
          };
        },
      });
      for (const property of ['done', 'value']) {
        try { for (const value of make(property)) void value; }
        catch (error) { calls.push('throw:' + error.message); }
      }
      globalThis.result = calls;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual([
    'next:done',
    'done:done',
    'throw:done',
    'next:value',
    'done:value',
    'value:value',
    'return:value',
    'throw:value',
  ]);
});

test('for-of lowering preserves the separate loop-body lexical environment', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const seen = [];
      for (const value of [1, 2]) {
        const value = 'body';
        seen.push(value);
      }
      globalThis.result = seen;
    `,
    { transforms: { forOf: true } },
  );
  expect(result.result).toEqual(['body', 'body']);
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
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([1, 2, ['next', 'next', 'return']]);
});

// The current bounded-array helper closes as soon as it has collected the
// requested element. BindingInitialization instead keeps the iterator live
// while the default initializer runs, and closes it on abrupt completion.
// Keep this executable specification expectation until array lowering owns an
// iterator record across the generated binding statements.
test.fails('array destructuring closes the iterator when a default initializer throws', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { calls.push('next'); return { value: undefined, done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      try {
        const [value = (() => { calls.push('default'); throw new Error('boom'); })()] = iterable;
        void value;
      } catch (error) {
        calls.push(error.message);
      }
      globalThis.result = calls;
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual(['next', 'default', 'return', 'boom']);
});

test('array rest exhausts its iterator without an extra IteratorClose', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let index = 0;
          return {
            next() {
              calls.push('next');
              return index < 2 ? { value: ++index, done: false } : { done: true };
            },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      const [first, ...rest] = iterable;
      globalThis.result = [first, rest, calls];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([1, [2], ['next', 'next', 'next']]);
});

test('IteratorClose validates a non-object return result', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { return { value: 1, done: false }; },
            return() { return 1; },
          };
        },
      };
      let threw = false;
      try { const [value] = iterable; void value; }
      catch (error) { threw = error instanceof TypeError; }
      globalThis.result = [threw];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([true]);
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
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([4, 1]);
});

test('for-of declaration destructuring preserves iteration bindings and body scope', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const key = 'value';
      const callbacks = [];
      const seen = [];
      for (const { [key]: value, nested: [first = 9] } of [
        { value: 1, nested: [] },
        { value: 2, nested: [3] },
      ]) {
        const key = 'shadow';
        callbacks.push(() => [value, first, key]);
        if (value === 1) continue;
        seen.push(value);
      }
      globalThis.result = [callbacks.map(read => read()), seen];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([
    [
      [1, 9, 'shadow'],
      [2, 3, 'shadow'],
    ],
    [2],
  ]);
});

test('for-of assignment destructuring preserves outer targets and body scope', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const key = 'value';
      let value;
      const seen = [];
      for ({ [key]: value } of [{ value: 1 }, { value: 2 }]) {
        const key = 'shadow';
        seen.push([value, key]);
      }
      globalThis.result = [value, seen];
    `,
    { transforms: { destructuring: true } },
  );
  expect(result.result).toEqual([
    2,
    [
      [1, 'shadow'],
      [2, 'shadow'],
    ],
  ]);
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

test('simple parameters before a default remain unmapped from arguments', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function read(first, second = 2) {
        first = 9;
        arguments[0] = 7;
        return [first, arguments[0], second];
      }
      globalThis.result = read(1);
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([9, 7, 2]);
});

test('default and destructured setter parameters preserve assignment behavior', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const target = {
        values: [],
        set defaulted(value = 3) { this.values.push(value); },
        set destructured({ value }) { this.values.push(value); }
      };
      target.defaulted = undefined;
      target.defaulted = 5;
      target.destructured = { value: 7 };
      const descriptors = [
        Object.getOwnPropertyDescriptor(target, 'defaulted').set.length,
        Object.getOwnPropertyDescriptor(target, 'destructured').set.length
      ];
      globalThis.result = [target.values, descriptors];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([
    [3, 5, 7],
    [1, 1],
  ]);
});

test('rest parameter arrays ignore lexical and global Array bindings', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function lexical(Array, ...rest) { return [rest, Array]; }
      const original = globalThis.Array;
      globalThis.Array = function PoisonedArray() { throw new Error('poisoned'); };
      let global;
      try { global = ((...rest) => rest)(1, 2); }
      finally { globalThis.Array = original; }
      globalThis.result = [lexical('shadow', 3, 4), global];
    `,
    { transforms: { parameters: true } },
  );
  expect(result.result).toEqual([
    [[3, 4], 'shadow'],
    [1, 2],
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
