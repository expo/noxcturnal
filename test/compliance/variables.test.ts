import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute } from './runtime';

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

// Native execution establishes the specification result independently of the
// transform. Compile outside test.fails so transform errors cannot accidentally
// satisfy these known runtime regressions.
const additionalComplianceCases: {
  name: string;
  source: string;
  plan: import('../../js').PreflightPlan;
  expected: unknown;
  bindings?: Record<string, unknown>;
  knownFailure: boolean;
}[] = [
  {
    name: 'destructuring evaluates the assignment target before the source getter',
    source: `
      const events = [];
      const target = {};
      function receiver() {
        events.push('target');
        return target;
      }
      const source = {
        get value() {
          events.push('get');
          return 1;
        },
      };
      ({ value: receiver().value } = source);
      globalThis.result = [events, target.value];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [['target', 'get'], 1],
    knownFailure: false,
  },
  {
    name: 'for-of invokes next without consulting its own call property',
    source: `
      const events = [];
      const next = function () {
        events.push('next');
        return { done: true };
      };
      next.call = function () {
        events.push('wrong');
        return { done: true };
      };
      for (const value of {
        [Symbol.iterator]() {
          return { next };
        },
      }) {
      }
      globalThis.result = events;
    `,
    plan: { transforms: { forOf: true } },
    expected: ['next'],
    knownFailure: false,
  },
  {
    name: 'parameter defaults resolve dollar-prefixed names outside the body',
    source: `
      let $outer = 2;
      function read(value = $outer) {
        let $outer = 9;
        return value;
      }
      globalThis.result = read();
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'destructured parameter defaults resolve names outside the body',
    source: `
      let outer = 2;
      function read({ value = outer }) {
        let outer = 9;
        return value;
      }
      globalThis.result = read({});
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'parameter defaults resolve escaped identifiers outside the body',
    source: String.raw`
      let outer = 2;
      function read(value = \u006futer) {
        let outer = 9;
        return value;
      }
      globalThis.result = read();
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'for-of generated iterator names do not shadow external references',
    source: `
      const values = [];
      for (const value of [1]) values.push(_iterator);
      globalThis.result = values;
    `,
    plan: { transforms: { forOf: true } },
    bindings: { _iterator: 'external' },
    expected: ['external'],
    knownFailure: false,
  },
  {
    name: 'rest parameter temporaries do not shadow external references',
    source: `
      function read(...values) {
        return [_len, values];
      }
      globalThis.result = read(1, 2);
    `,
    plan: { transforms: { parameters: true } },
    bindings: { _len: 'external' },
    expected: ['external', [1, 2]],
    knownFailure: true,
  },
  {
    name: 'for-of validates next results before reading inherited done getters',
    source: `
      const events = [];
      const previous = Object.getOwnPropertyDescriptor(Number.prototype, 'done');
      Object.defineProperty(Number.prototype, 'done', {
        configurable: true,
        get() {
          events.push('done');
          return true;
        },
      });
      try {
        try {
          for (const value of {
            [Symbol.iterator]() {
              return {
                next() {
                  return 1;
                },
              };
            },
          }) {
          }
        } catch (error) {
          events.push(error.name);
        }
      } finally {
        if (previous) Object.defineProperty(Number.prototype, 'done', previous);
        else delete Number.prototype.done;
      }
      globalThis.result = events;
    `,
    plan: { transforms: { forOf: true } },
    expected: ['TypeError'],
    knownFailure: true,
  },
  {
    name: 'parameter eval cannot see body bindings',
    source: `
    let outer = 2;
    function read(value = eval('out' + 'er')) { let outer = 9; return value; }
    globalThis.result = read();
  `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },

  {
    name: 'parameter scope includes combining-mark identifiers',
    source: `
    let café = 2;
    function read(value = café) { let café = 9; return value; }
    globalThis.result = read();
  `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'parameter defaults preserve anonymous function names',
    source: `
      function read(value = function () {}) {
        return value.name;
      }
      globalThis.result = read();
    `,
    plan: { transforms: { parameters: true } },
    expected: 'value',
    knownFailure: true,
  },
  {
    name: 'for-of iterable evaluation preserves the loop-head TDZ',
    source: `
      let values = [1];
      let outcome = 'no error';
      try {
        for (let values of values) {
        }
      } catch (e) {
        outcome = e.name;
      }
      globalThis.result = outcome;
    `,
    plan: { transforms: { forOf: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'array destructuring honors an overridden array iterator',
    source: `
      const input = [1, 2];
      input[Symbol.iterator] = function* () {
        yield 9;
      };
      const [value] = input;
      globalThis.result = value;
    `,
    plan: { transforms: { destructuring: true } },
    expected: 9,
    knownFailure: true,
  },
  {
    name: 'parameter arrows created before super defer reading this until called',
    source: `
      class Base {}
      class Child extends Base {
        constructor() {
          const read = (value = 1) => this;
          super();
          this.matches = read() === this;
        }
      }
      globalThis.result = new Child().matches;
    `,
    plan: { transforms: { parameters: true } },
    expected: true,
    knownFailure: true,
  },
  {
    name: 'destructuring defaults preserve anonymous function names in bindings and assignments',
    source: `
      const { value = function () {} } = {};
      let other;
      ({ other = function () {} } = {});
      globalThis.result = [value.name, other.name];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['value', 'other'],
    knownFailure: true,
  },
  {
    name: 'generator parameter defaults execute when the generator is called',
    source: `
      let calls = 0;
      function* values(value = (calls++, 1)) {
        yield value;
      }
      const iterator = values();
      globalThis.result = [calls, iterator.next().value, calls];
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, 1, 1],
    knownFailure: true,
  },
  {
    name: 'generator parameter scope wrappers delegate body yields and return values',
    source: `
      function* values(value = 1) {
        var value;
        yield value;
        return 2;
      }
      const iterator = values();
      globalThis.result = [iterator.next(), iterator.next()];
    `,
    plan: { transforms: { parameters: true } },
    expected: [
      { value: 1, done: false },
      { value: 2, done: true },
    ],
    knownFailure: false,
  },
  {
    name: 'for-of does not close the iterator when the step value getter throws',
    source: `
      const events = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() {
              return {
                done: false,
                get value() {
                  events.push('value');
                  throw new Error('fail');
                },
              };
            },
            return() {
              events.push('return');
              return {};
            },
          };
        },
      };
      try {
        for (const value of iterable) {
        }
      } catch (e) {
        events.push(e.message);
      }
      globalThis.result = events;
    `,
    plan: { transforms: { forOf: true } },
    expected: ['value', 'fail'],
    knownFailure: true,
  },
  {
    name: 'default parameters named arguments do not shadow generated argument reads',
    source: `
      function read(arguments = 1) {
        return arguments;
      }
      globalThis.result = [read(), read(2)];
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, 2],
    knownFailure: true,
  },
  {
    name: 'non-simple parameters preserve the throwing arguments.callee accessor',
    source: `
      function read(value = 1) {
        try {
          return arguments.callee === read;
        } catch (e) {
          return e.name;
        }
      }
      globalThis.result = read();
    `,
    plan: { transforms: { parameters: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'parameter arrows observe reassignment of the enclosing arguments binding',
    source: `
      function outer() {
        const read = (value = 1) => arguments[0];
        arguments = ['changed'];
        return read();
      }
      globalThis.result = outer('original');
    `,
    plan: { transforms: { parameters: true } },
    expected: 'changed',
    knownFailure: true,
  },
  {
    name: 'parameter lowering preserves arrow non-constructability and absence of prototype',
    source: `
      const read = (value = 1) => value;
      let outcome;
      try {
        new read();
        outcome = 'constructed';
      } catch (e) {
        outcome = e.name;
      }
      globalThis.result = [
        outcome,
        Object.prototype.hasOwnProperty.call(read, 'prototype'),
      ];
    `,
    plan: { transforms: { parameters: true } },
    expected: ['TypeError', false],
    knownFailure: true,
  },
  {
    name: 'array destructuring assignment evaluates its target before advancing the iterator',
    source: `
      const events = [];
      const target = {};
      const iterable = {
        [Symbol.iterator]() {
          events.push('iterator');
          return {
            next() {
              events.push('next');
              return { value: 3, done: false };
            },
            return() {
              events.push('return');
              return {};
            },
          };
        },
      };
      function object() {
        events.push('target');
        return target;
      }
      [object().value] = iterable;
      globalThis.result = [events, target.value];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [['iterator', 'target', 'next', 'return'], 3],
    knownFailure: true,
  },
  {
    name: 'object destructuring coerces computed keys before evaluating assignment targets',
    source: `
      const events = [];
      const key = {
        toString() {
          events.push('key');
          return 'x';
        },
      };
      function target() {
        events.push('target');
        return {};
      }
      ({ [key]: target().value } = { x: 1 });
      globalThis.result = events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['key', 'target'],
    knownFailure: true,
  },
  {
    name: 'parameter body-scope wrappers preserve super property calls in methods',
    source: `
      class Base {
        read() {
          return 2;
        }
      }
      class Child extends Base {
        read(value = 1) {
          var value;
          return super.read() + value;
        }
      }
      globalThis.result = new Child().read();
    `,
    plan: { transforms: { parameters: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'parameter body-scope wrappers preserve super constructor calls',
    source: `
      class Base {}
      class Child extends Base {
        constructor(value = 1) {
          var value;
          super();
          this.value = value;
        }
      }
      globalThis.result = new Child().value;
    `,
    plan: { transforms: { parameters: true } },
    expected: 1,
    knownFailure: true,
  },
  {
    name: 'for-of ignores shadowed Symbol',
    source: `function read(Symbol){const values=[];for(const value of [1,2])values.push(value);return values;}globalThis.result=read(null);`,
    plan: { transforms: { forOf: true } },
    expected: [1, 2],
    knownFailure: false,
  },
  {
    name: 'iterator acquisition must reject primitive iterator',
    source: `const events=[];const descriptor=Object.getOwnPropertyDescriptor(Number.prototype,'next');Object.defineProperty(Number.prototype,'next',{configurable:true,value(){events.push('next');return{done:true};}});try{try{for(const value of {[Symbol.iterator](){return 1;}}){}}catch(e){events.push(e.name);}}finally{if(descriptor)Object.defineProperty(Number.prototype,'next',descriptor);else delete Number.prototype.next;}globalThis.result=events;`,
    plan: { transforms: { forOf: true } },
    expected: ['TypeError'],
    knownFailure: true,
  },
  {
    name: 'array elisions do not read iterator values',
    source: `
    const events = [];
    const iterable = { [Symbol.iterator]() { return {
      next() { return { done: false, get value() { events.push('value'); return 1; } }; },
      return() { events.push('return'); return {}; }
    }; } };
    const [,] = iterable;
    globalThis.result = events;
      `,
    plan: { transforms: { destructuring: true } },
    expected: ['return'],
    knownFailure: true,
  },
  {
    name: 'array rest creates dense elements for holes',
    source: `
    const [...rest] = Array(2);
    globalThis.result = [rest.length, Object.hasOwn(rest, 0), Object.hasOwn(rest, 1)];
      `,
    plan: { transforms: { destructuring: true } },
    expected: [2, true, true],
    knownFailure: true,
  },
  {
    name: 'array rest does not call user slice',
    source: `
    const input = [1, 2]; input.slice = () => ['wrong'];
    const [first, ...rest] = input;
    globalThis.result = [first, rest];
      `,
    plan: { transforms: { destructuring: true } },
    expected: [1, [2]],
    knownFailure: true,
  },
  {
    name: 'array rest ignores species',
    source: `
    const events = [];
    class Values extends Array { static get [Symbol.species]() { events.push('species'); return Array; } }
    const [...rest] = new Values(1, 2);
    globalThis.result = [rest, events];
      `,
    plan: { transforms: { destructuring: true } },
    expected: [[1, 2], []],
    knownFailure: true,
  },
  {
    name: 'object rest uses a single ownKeys snapshot',
    source: `
    const events = [];
    const source = new Proxy({ a: 1 }, { ownKeys(target) { events.push('keys'); return Reflect.ownKeys(target); } });
    const { ...rest } = source;
    globalThis.result = [rest.a, events];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, ['keys']],
    knownFailure: false,
  },
  {
    name: 'object rest excludes symbols added during copying',
    source: `
    const symbol = Symbol('late');
    const source = { get a() { this[symbol] = 2; return 1; } };
    const { ...rest } = source;
    globalThis.result = [rest.a, Object.hasOwn(rest, symbol)];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, false],
    knownFailure: false,
  },
  {
    name: 'array destructuring rejects legacy iterator-only object',
    source: `
    const input = { '@@iterator'() { return { next() { return { value: 1, done: false }; }, return() { return {}; } }; } };
    try { const [value] = input; globalThis.result = value; }
    catch (error) { globalThis.result = error.name; }
      `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'object rest rechecks enumerability after earlier getter',
    source: `
    const source = { get a() { Object.defineProperty(this, 'b', { enumerable: false }); return 1; }, b: 2 };
    const { ...rest } = source;
    globalThis.result = [rest.a, Object.hasOwn(rest, 'b')];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, false],
    knownFailure: false,
  },
  {
    name: 'object rest uses a single ownKeys snapshot with excluded key',
    source: `
    const events = [];
    const source = new Proxy({ a: 1 }, { ownKeys(target) { events.push('keys'); return Reflect.ownKeys(target); } });
    const { missing, ...rest } = source;
    globalThis.result = [rest.a, events];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, ['keys']],
    knownFailure: true,
  },
  {
    name: 'object rest excludes symbols added during copying with excluded key',
    source: `
    const symbol = Symbol('late');
    const source = { get a() { this[symbol] = 2; return 1; } };
    const { missing, ...rest } = source;
    globalThis.result = [rest.a, Object.hasOwn(rest, symbol)];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, false],
    knownFailure: true,
  },
  {
    name: 'object rest rechecks enumerability after earlier getter with excluded key',
    source: `
    const source = { get a() { Object.defineProperty(this, 'b', { enumerable: false }); return 1; }, b: 2 };
    const { missing, ...rest } = source;
    globalThis.result = [rest.a, Object.hasOwn(rest, 'b')];
      `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, false],
    knownFailure: true,
  },
  {
    name: 'array assignment returns original iterable',
    source: `
 const source=new Set([1]);let value;const result=([value]=source);globalThis.result=[result===source,value];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, 1],
    knownFailure: false,
  },
  {
    name: 'empty object pattern rejects null',
    source: `
 try{const {}=null;globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'empty array pattern acquires and closes without stepping',
    source: `
 const events=[];const source={[Symbol.iterator](){events.push('iterator');return{get next(){events.push('next:get');return()=>{events.push('next:call');return{done:true};};},return(){events.push('return');return{};}};}};
 const []=source;globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['iterator', 'next:get', 'return'],
    knownFailure: false,
  },
  {
    name: 'object assignment target precedes default initializer',
    source: `
 const events=[];const output={};function target(){events.push('target');return output;}function fallback(){events.push('default');return 3;}
 ({value:target().value=fallback()}={});globalThis.result=[output.value,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [3, ['target', 'default']],
    knownFailure: false,
  },
  {
    name: 'object assignment target exception prevents default initializer',
    source: `
 const events=[];function target(){events.push('target');throw new Error('target');}function fallback(){events.push('default');return 3;}
 try{({value:target().value=fallback()}={});}catch(error){events.push(error.message);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['target', 'target'],
    knownFailure: false,
  },
  {
    name: 'array binding defaults interleave iterator steps',
    source: `
 const events=[];const source={[Symbol.iterator](){return{next(){events.push('next');return{value:undefined,done:false};},return(){events.push('return');return{};}};}};
 const [a=(events.push('a'),1),b=(events.push('b'),2)]=source;globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['next', 'a', 'next', 'b', 'return'],
    knownFailure: true,
  },
  {
    name: 'object assignment with default evaluates target before source getter',
    source: `
 const events=[];const output={};function target(){events.push('target');return output;}
 const source={get value(){events.push('get');return 3;}};
 ({value:target().value=1}=source);globalThis.result=[output.value,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [3, ['target', 'get']],
    knownFailure: true,
  },
  {
    name: 'array destructuring stops before next step on nested pattern failure',
    source: `
 const events=[];let i=0;const source={[Symbol.iterator](){return{next(){events.push('next');return{value:i++===0?null:2,done:false};},return(){events.push('return');return{};}};}};
 try{const [{value},second]=source;}catch(error){events.push(error.name);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['next', 'return', 'TypeError'],
    knownFailure: true,
  },
  {
    name: 'parameter body wrappers preserve new.target in direct eval',
    source: `
 function Read(value=1){var value;return [eval('new.target')===Read];}
 globalThis.result=new Read();
    `,
    plan: { transforms: { parameters: true } },
    expected: [true],
    knownFailure: true,
  },
  {
    name: 'parameter body wrappers preserve arguments identity in direct eval',
    source: `
 function read(value=arguments){var value;return eval('arguments')===value;}
 globalThis.result=read();
    `,
    plan: { transforms: { parameters: true } },
    expected: true,
    knownFailure: true,
  },
  {
    name: 'parameter arrows preserve lexical this in direct eval',
    source: `
 function make(){return (value=1)=>eval('this.value');}
 const read=make.call({value:3});globalThis.result=read.call({value:9});
    `,
    plan: { transforms: { parameters: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'parameter arrows preserve lexical arguments in direct eval',
    source: `
 function make(value){return (unused=1)=>eval('arguments[0]');}
 globalThis.result=make(3)(9);
    `,
    plan: { transforms: { parameters: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'catch destructuring defaults cannot see body lexical bindings',
    source: `
 const value='outer';let result;
 try{throw {};}catch({item=value}){let value='body';result=item;}
 globalThis.result=result;
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'outer',
    knownFailure: true,
  },
  {
    name: 'catch destructuring default closures keep outer lexical bindings',
    source: `
 const value='outer';let result;try{throw {};}catch({read=()=>value}){let value='body';result=read();}
 globalThis.result=result;
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'outer',
    knownFailure: true,
  },
  {
    name: 'for-of destructuring defaults cannot see body lexical bindings',
    source: `
 const value='outer';const results=[];
 for(const {item=value} of [{}]){let value='body';results.push(item);}
 globalThis.result=results;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['outer'],
    knownFailure: false,
  },
  {
    name: 'for-of destructuring closes iterator if nested pattern fails',
    source: `
 const events=[];const source={[Symbol.iterator](){return{next(){events.push('next');return{value:null,done:false};},return(){events.push('return');return{};}};}};
 try{for(const {value} of source){}}catch(error){events.push(error.name);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['next', 'return', 'TypeError'],
    knownFailure: false,
  },
  {
    name: 'array destructuring does not close after iterator value getter throws',
    source: `
 const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,get value(){events.push('value');throw new Error('value');}};},return(){events.push('return');return {};}};}};
 try{const [value]=iterable;}catch(error){events.push(error.message);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['value', 'value'],
    knownFailure: true,
  },
  {
    name: 'array destructuring rejects primitive iterator result objects',
    source: `
 const events=[];const iterable={[Symbol.iterator](){return {next(){events.push('next');return 1;},return(){events.push('return');return {};}};}};
 try{const [value]=iterable;events.push(value===undefined?'accepted':'value');}catch(error){events.push(error.name);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['next', 'TypeError'],
    knownFailure: true,
  },
  {
    name: 'array destructuring retrieves iterator return once',
    source: `
 const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,value:1};},get return(){events.push('get:return');return function(){events.push('return');return {};};}};}};
 const [value]=iterable;globalThis.result=[value,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, ['get:return', 'return']],
    knownFailure: true,
  },
  {
    name: 'array destructuring does not close after iterator done getter throws',
    source: `
 const events=[];const iterable={[Symbol.iterator](){return {next(){return {get done(){events.push('done');throw new Error('done');}};},return(){events.push('return');return {};}};}};
 try{const [value]=iterable;}catch(error){events.push(error.message);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['done', 'done'],
    knownFailure: false,
  },
  {
    name: 'array binding initializer errors take precedence over iterator close errors',
    source: `
 const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,value:undefined};},return(){events.push('return');throw new Error('close');}};}};
 function initialize(){events.push('init');throw new Error('init');}
 try{const [value=initialize()]=iterable;}catch(error){events.push(error.message);}globalThis.result=events;
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['init', 'return', 'init'],
    knownFailure: true,
  },
  {
    name: 'object rest excludes numeric literal binding keys',
    source: `
 const {1:value,...rest}={1:'one',other:'other'};globalThis.result=[value,rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['one', { other: 'other' }],
    knownFailure: true,
  },
  {
    name: 'object rest excludes bigint literal binding keys',
    source: `
 const {1n:value,...rest}={1:'one',other:'other'};globalThis.result=[value,rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['one', { other: 'other' }],
    knownFailure: true,
  },
  {
    name: 'object rest excludes numeric literal assignment keys',
    source: `
 let value,rest;({1:value,...rest}={1:'one',other:'other'});globalThis.result=[value,rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['one', { other: 'other' }],
    knownFailure: true,
  },
  {
    name: 'object rest coerces computed keys once before source reads',
    source: `
 const events=[];const key={[Symbol.toPrimitive](hint){events.push(hint);return 'value';}};
 const {[key]:value,...rest}={get value(){events.push('get');return 1;},other:2};globalThis.result=[value,rest,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }, ['string', 'get']],
    knownFailure: false,
  },
  {
    name: 'object rest excludes computed symbol keys',
    source: `
 const key=Symbol();const {[key]:value,...rest}={[key]:1,other:2};globalThis.result=[value,Reflect.ownKeys(rest)];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, ['other']],
    knownFailure: false,
  },
  {
    name: 'object rest excludes computed numeric keys',
    source: `
 const {[1]:value,...rest}={1:'one',other:'other'};globalThis.result=[value,rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['one', { other: 'other' }],
    knownFailure: false,
  },
  {
    name: 'object rest excludes string literal numeric keys',
    source: `
 const {'1':value,...rest}={1:'one',other:'other'};globalThis.result=[value,rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: ['one', { other: 'other' }],
    knownFailure: false,
  },
  {
    name: 'destructuring assignments in parameter defaults isolate reentrant temporaries',
    source: `
 let a,b;function read(source,result=({a,b}=source)){return [result===source,b];}
 const inner={a:10,b:20};const outer={get a(){read(inner);return 1;},b:2};
 globalThis.result=read(outer);
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, 2],
    knownFailure: true,
  },
  {
    name: 'destructuring assignments in field initializers isolate reentrant temporaries',
    source: `
 let a,b;let source;class Value{result=({a,b}=source);}
 const inner={a:10,b:20};const outer={get a(){source=inner;new Value();return 1;},b:2};source=outer;
 const value=new Value();globalThis.result=[value.result===outer,b];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, 2],
    knownFailure: true,
  },
  {
    name: 'destructuring assignments in function bodies isolate reentrant temporaries',
    source: `
 let a,b;function read(source){const result=({a,b}=source);return [result===source,b];}
 const inner={a:10,b:20};const outer={get a(){read(inner);return 1;},b:2};
 globalThis.result=read(outer);
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, 2],
    knownFailure: false,
  },
  {
    name: 'nested default assignments preserve both assignment results',
    source: `
 let a,b,c;const inner={c:3};const outer={b:2};const result=({a=({c}=inner),b}=outer);globalThis.result=[result===outer,a===inner,b,c];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, true, 2, 3],
    knownFailure: false,
  },
  {
    name: 'nested default assignments preserve later outer array elements',
    source: `
 let a,b,c;const inner=[3];const outer=[undefined,2];const result=([a=([c]=inner),b]=outer);globalThis.result=[result===outer,a===inner,b,c];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [true, true, 2, 3],
    knownFailure: false,
  },
  {
    name: 'destructuring assignment rest target runs before source copying',
    source: `
 const events=[];const source={get a(){events.push('get');return 1;}};const target={};function receiver(){events.push('target');return target;}({...receiver().rest}=source);globalThis.result=[events,target.rest];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [['target', 'get'], { a: 1 }],
    knownFailure: false,
  },
  {
    name: 'array patterns in rest parameters use the rest array iterator',
    source: `
 const original=Array.prototype[Symbol.iterator];
 try{Array.prototype[Symbol.iterator]=function*(){yield 77;};function read(...[value]){return value;}globalThis.result=read(1,2);}finally{Array.prototype[Symbol.iterator]=original;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 77,
    knownFailure: false,
  },
  {
    name: 'empty array rest parameter patterns acquire and close iterators',
    source: `
 const events=[];const original=Array.prototype[Symbol.iterator];
 try{Array.prototype[Symbol.iterator]=function(){events.push('iterator');return {next(){events.push('next');return {done:true};},return(){events.push('return');return {};}};};function read(...[]){return 1;}read(1);globalThis.result=events;}finally{Array.prototype[Symbol.iterator]=original;}
    `,
    plan: { transforms: { parameters: true } },
    expected: ['iterator', 'return'],
    knownFailure: false,
  },
  {
    name: 'rest identifier parameters do not acquire array iterators',
    source: `
 const events=[];const original=Array.prototype[Symbol.iterator];
 try{Array.prototype[Symbol.iterator]=function(){events.push('iterator');throw new Error('unexpected');};function read(...values){return values[0];}globalThis.result=[read(1,2),events];}finally{Array.prototype[Symbol.iterator]=original;}
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, []],
    knownFailure: false,
  },
  {
    name: 'array rest parameter bindings receive supplied argument values',
    source: `
 function read(...[first,second]){return [first,second];}globalThis.result=read(1,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, 2],
    knownFailure: true,
  },
  {
    name: 'array rest parameter elisions preserve later supplied values',
    source: `
 function read(...[,second]){return second;}globalThis.result=read(1,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'array rest parameter iterator observes the populated rest array',
    source: `
 const original=Array.prototype[Symbol.iterator];
 try{Array.prototype[Symbol.iterator]=function*(){yield this.length;};function read(...[value]){return value;}globalThis.result=read(1,2);}finally{Array.prototype[Symbol.iterator]=original;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'later parameters read original arguments after earlier defaults mutate arguments',
    source: `
 function read(first=(arguments[1]=99),second){return [first,second,arguments[1]];}globalThis.result=read(undefined,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: [99, 2, 99],
    knownFailure: true,
  },
  {
    name: 'rest parameters read original arguments after defaults mutate arguments',
    source: `
 function read(first=(arguments[1]=99),...rest){return [rest,arguments[1]];}globalThis.result=read(undefined,2,3);
    `,
    plan: { transforms: { parameters: true } },
    expected: [[2, 3], 99],
    knownFailure: true,
  },
  {
    name: 'rest parameter length ignores arguments length mutations in defaults',
    source: `
 function read(first=(arguments.length=1),...rest){return rest;}globalThis.result=read(undefined,2,3);
    `,
    plan: { transforms: { parameters: true } },
    expected: [2, 3],
    knownFailure: true,
  },
  {
    name: 'later parameter defaults ignore newly inserted arguments entries',
    source: `
 function read(first=(arguments[1]=99),second=2){return [first,second,arguments[1]];}globalThis.result=read();
    `,
    plan: { transforms: { parameters: true } },
    expected: [99, 2, 99],
    knownFailure: false,
  },
  {
    name: 'parameter assignment does not mutate unmapped arguments',
    source: `
 function read(first=1,second){first=9;second=8;return [arguments[0],arguments[1]];}globalThis.result=read(1,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, 2],
    knownFailure: false,
  },
  {
    name: 'leading parameters remain unmapped when a later parameter has a default',
    source: `
 function read(first,second=2){first=9;return arguments[0];}globalThis.result=read(1);
    `,
    plan: { transforms: { parameters: true } },
    expected: 1,
    knownFailure: false,
  },
  {
    name: 'leading parameters remain unmapped when followed by rest',
    source: `
 function read(first,...rest){arguments[0]=9;return first;}globalThis.result=read(1,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: 1,
    knownFailure: false,
  },
  {
    name: 'earlier parameter defaults reject reads of uninitialized rest bindings',
    source: `
 function read(first=rest,...rest){return first;}try{read();globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'typeof uninitialized rest bindings throws during defaults',
    source: `
 function read(first=typeof rest,...rest){return first;}try{globalThis.result=read();}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'earlier defaults cannot assign to uninitialized rest bindings',
    source: `
 function read(first=(rest=2),...rest){return first;}try{globalThis.result=read();}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'earlier defaults reject uninitialized array rest pattern bindings',
    source: `
 function read(first=second,...[second]){return first;}try{read();globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'parameter closures can read rest after initialization',
    source: `
 function read(first=()=>rest,...rest){return first();}globalThis.result=read(undefined,2,3);
    `,
    plan: { transforms: { parameters: true } },
    expected: [2, 3],
    knownFailure: false,
  },
  {
    name: 'earlier defaults reject uninitialized object rest pattern bindings',
    source: `
 function read(first=length,...{length}){return first;}try{read();globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { parameters: true } },
    expected: 'ReferenceError',
    knownFailure: false,
  },
  {
    name: 'object rest parameters allow matching body var declarations',
    source: `
 function read(...{length}){var length;return length;}globalThis.result=read(1,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'nested rest parameters allow matching body var declarations',
    source: `
 function read(...[{value}]){var value;return value;}globalThis.result=read({value:2});
    `,
    plan: { transforms: { parameters: true } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'body function declarations override rest parameter bindings',
    source: `
 function read(...rest){function rest(){return 2;}return typeof rest;}globalThis.result=read(1);
    `,
    plan: { transforms: { parameters: true } },
    expected: 'function',
    knownFailure: false,
  },
  {
    name: 'parameter closures keep rest bindings separate from body var bindings',
    source: `
 function read(get=()=>rest,...rest){var rest=9;return [get(),rest];}globalThis.result=read(undefined,2);
    `,
    plan: { transforms: { parameters: true } },
    expected: [[2], 9],
    knownFailure: false,
  },
  {
    name: 'parameter closures keep ordinary bindings separate from body var bindings',
    source: `
 function read(value=1,get=()=>value){var value=9;return [get(),value];}globalThis.result=read();
    `,
    plan: { transforms: { parameters: true } },
    expected: [1, 9],
    knownFailure: false,
  },
  {
    name: 'rest array creation bypasses inherited numeric setters',
    source: `
 const original=Object.getOwnPropertyDescriptor(Array.prototype,'0');let calls=0;
 try{Object.defineProperty(Array.prototype,'0',{configurable:true,set(value){calls++;}});function read(...rest){return [Object.hasOwn(rest,'0'),rest[0]];}const value=read(1);globalThis.result=[value,calls];}finally{if(original)Object.defineProperty(Array.prototype,'0',original);else delete Array.prototype[0];}
    `,
    plan: { transforms: { parameters: true } },
    expected: [[true, 1], 0],
    knownFailure: true,
  },
  {
    name: 'rest array creation bypasses inherited nonwritable numeric properties',
    source: `
 const original=Object.getOwnPropertyDescriptor(Array.prototype,'0');
 try{Object.defineProperty(Array.prototype,'0',{configurable:true,value:99,writable:false});function read(...rest){return [Object.hasOwn(rest,'0'),rest[0]];}try{globalThis.result=read(1);}catch(error){globalThis.result=error.name;}}finally{if(original)Object.defineProperty(Array.prototype,'0',original);else delete Array.prototype[0];}
    `,
    plan: { transforms: { parameters: true } },
    expected: [true, 1],
    knownFailure: true,
  },
  {
    name: 'for-of closing ignores own call properties on return methods',
    source: `
 const events=[];function close(){events.push('close');return {};}close.call=()=>{events.push('override');return {};};const source={[Symbol.iterator](){return {next(){return {done:false,value:1};},return:close};}};for(const value of source){break;}globalThis.result=events;
    `,
    plan: { transforms: { forOf: true } },
    expected: ['close'],
    knownFailure: false,
  },
  {
    name: 'for-of closing rejects noncallable return objects with call properties',
    source: `
 const events=[];const source={[Symbol.iterator](){return {next(){return {done:false,value:1};},return:{call(){events.push('override');return {};}}};}};try{for(const value of source){break;}}catch(error){events.push(error.name);}globalThis.result=events;
    `,
    plan: { transforms: { forOf: true } },
    expected: ['TypeError'],
    knownFailure: false,
  },
  {
    name: 'object rest rejects callable results from Symbol.toPrimitive',
    source: `
 const key={[Symbol.toPrimitive](){return function invalid(){};}};try{const {[key]:value,...rest}={};globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'object rest accepts null results from Symbol.toPrimitive',
    source: `
 const key={[Symbol.toPrimitive](){return null;}};try{const {[key]:value,...rest}={null:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }],
    knownFailure: true,
  },
  {
    name: 'object rest treats null Symbol.toPrimitive methods as absent',
    source: `
 const key={[Symbol.toPrimitive]:null,toString(){return 'value';}};try{const {[key]:value,...rest}={value:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }],
    knownFailure: true,
  },
  {
    name: 'object rest coerces callable keys with the string hint',
    source: `
 const hints=[];function key(){}key[Symbol.toPrimitive]=hint=>{hints.push(hint);return hint;};const {[key]:value,...rest}={string:1,default:2};globalThis.result=[value,rest,hints];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { default: 2 }, ['string']],
    knownFailure: true,
  },
  {
    name: 'object rest rejects ordinary object primitive conversion results',
    source: `
 const key={[Symbol.toPrimitive](){return {};}};try{const {[key]:value,...rest}={};globalThis.result='accepted';}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'object rest preserves symbols returned by ordinary key conversion',
    source: `
 const symbol=Symbol();const key={toString(){return symbol;}};try{const {[key]:value,...rest}={[symbol]:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }],
    knownFailure: true,
  },
  {
    name: 'object rest reads absent Symbol.toPrimitive hooks once',
    source: `
 const events=[];const key={get [Symbol.toPrimitive](){events.push('hook');return undefined;},toString(){events.push('string');return 'value';}};const {[key]:value,...rest}={value:1,other:2};globalThis.result=[value,rest,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }, ['hook', 'string']],
    knownFailure: true,
  },
  {
    name: 'object rest falls back from object toString results to valueOf',
    source: `
 const events=[];const key={toString(){events.push('string');return {};},valueOf(){events.push('value');return 'key';}};const {[key]:value,...rest}={key:1,other:2};globalThis.result=[value,rest,events];
    `,
    plan: { transforms: { destructuring: true } },
    expected: [1, { other: 2 }, ['string', 'value']],
    knownFailure: false,
  },
  {
    name: 'array destructuring rejects typed arrays with disabled iterators',
    source: `
 const source=new Uint8Array([1,2]);source[Symbol.iterator]=null;try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'array destructuring rejects spoofed typed array tags',
    source: `
 const source={0:1,length:1,[Symbol.toStringTag]:'Uint8Array'};try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'array destructuring rejects Maps with disabled iterators',
    source: `
 const source=new Map([['a',1]]);source[Symbol.iterator]=null;try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { destructuring: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'array destructuring honors a valid custom typed array iterator',
    source: `
 const source=new Uint8Array([1,2]);source[Symbol.iterator]=function*(){yield 3;};const [value]=source;globalThis.result=value;
    `,
    plan: { transforms: { destructuring: true } },
    expected: 3,
    knownFailure: false,
  },
];

describe.each(additionalComplianceCases)(
  '$name',
  ({ source, plan, expected, bindings = {}, knownFailure }) => {
    let code: string;
    beforeAll(() => {
      code = compile(source, plan);
    });

    const run = (input: string) => {
      const context: Record<string, unknown> = {};
      new Function(...Object.keys(bindings), 'globalThis', input)(
        ...Object.values(bindings),
        context,
      );
      return context.result;
    };

    test('native execution', () => {
      expect(run(source)).toEqual(expected);
    });
    const transformedTest = knownFailure ? test.fails : test;
    transformedTest('transformed execution', () => {
      expect(run(code)).toEqual(expected);
    });
  },
);
