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

test('optional super calls preserve lookup and call receivers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      class Base {
        method(extra) { return this.value + extra; }
        get callable() {
          calls.push(['get', this.value]);
          return function (extra) {
            calls.push(['call', this.value]);
            return this.value + extra;
          };
        }
      }
      class Child extends Base {
        value = 40;
        read() {
          const key = (calls.push('key'), 'method');
          return [super.method?.(1), super[key]?.(2), super.callable?.(3), super.missing?.()];
        }
      }
      globalThis.result = [new Child().read(), calls];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([
    [41, 42, 43, undefined],
    ['key', ['get', 40], ['call', 40]],
  ]);
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

test('spec object spread defines data properties without triggering __proto__ mutation or setters', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const source = {};
      Object.defineProperty(source, '__proto__', {
        enumerable: true,
        get() { calls.push('get:proto'); return { polluted: true }; },
      });
      Object.defineProperty(source, 'value', {
        enumerable: true,
        get() { calls.push('get:value'); return 42; },
      });
      const target = { ...null, ...undefined, ...source };
      const descriptor = Object.getOwnPropertyDescriptor(target, 'value');
      globalThis.result = [
        calls,
        Object.getPrototypeOf(target) === Object.prototype,
        Object.hasOwn(target, '__proto__'),
        target.__proto__.polluted,
        descriptor.value,
        'get' in descriptor,
      ];
    `,
    { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
  );
  expect(result.result).toEqual([['get:proto', 'get:value'], true, true, true, 42, false]);
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

test('optional private access short-circuits before branding and preserves private-call receivers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #value = 4;
        #read(extra) { return this.#value + extra; }
        inspect(input) { return [input?.#value, input?.#read(3)]; }
      }
      const value = new Value();
      let fakeError = false;
      try { value.inspect({}); } catch (error) { fakeError = error instanceof TypeError; }
      globalThis.result = [value.inspect(null), value.inspect(value), fakeError];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([[undefined, undefined], [4, 7], true]);
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

test('optional-chain continuity ends at grouping boundaries', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const missing = null;
      let groupedThrows = false;
      try { (missing?.nested).value; } catch (error) { groupedThrows = error instanceof TypeError; }
      globalThis.result = [missing?.nested.value, groupedThrows];
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([undefined, true]);
});

test('optional eval call is indirect and cannot see local bindings', () => {
  const result = execute<{ result: unknown[] }>(
    `
      function inspect() {
        const local = 42;
        return [eval('local'), eval?.('typeof local')];
      }
      globalThis.result = inspect();
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toEqual([42, 'undefined']);
});

test('an undeclared optional-chain root still throws a ReferenceError', () => {
  const result = execute<{ result: boolean }>(
    `
      let threw = false;
      try { undeclaredRoot?.value; } catch (error) { threw = error instanceof ReferenceError; }
      globalThis.result = threw;
    `,
    { transforms: { optionalChaining: { loose: false } } },
  );
  expect(result.result).toBe(true);
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

test('nullish coalescing preserves super receivers and never coerces a non-nullish object', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const nonNullish = { valueOf() { calls.push('coerce'); return null; } };
      class Base {
        get value() { calls.push(['get', this.current]); return this.current; }
      }
      class Child extends Base {
        current = null;
        read() {
          const key = () => (calls.push('key'), 'value');
          const first = super[key()] ?? 42;
          this.current = 0;
          const second = super[key()] ?? 43;
          return [first, second, nonNullish ?? 44];
        }
      }
      const values = new Child().read();
      globalThis.result = [values[0], values[1], values[2] === nonNullish, calls];
    `,
    { transforms: { nullishCoalescingOperator: { loose: false } } },
  );
  expect(result.result).toEqual([42, 0, true, ['key', ['get', null], 'key', ['get', 0]]]);
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

test('logical assignment lowers private fields and preserves short-circuit writes', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Values {
        #or = 0;
        #and = 1;
        #nullish = null;
        update() {
          const results = [this.#or ||= 2, this.#and &&= 3, this.#nullish ??= 4];
          this.#or ||= 5;
          this.#and &&= 6;
          this.#nullish ??= 7;
          return [results, this.#or, this.#and, this.#nullish];
        }
      }
      globalThis.result = new Values().update();
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([[2, 3, 4], 2, 6, 4]);
});

test('logical assignment evaluates an effectful private-field receiver once', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #value = 0;
        calls = 0;
        self() { this.calls++; return this; }
        update() {
          const first = this.self().#value ||= 2;
          const second = this.self().#value ||= 3;
          return [first, second, this.#value, this.calls];
        }
      }
      globalThis.result = new Value().update();
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([2, 2, 2, 2]);
});

test('nested private logical assignments retain each effectful receiver', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #value;
        constructor(value) { this.#value = value; }
        self(calls, name) { calls.push(name); return this; }
        update(other, calls) {
          const result = this.self(calls, 'outer').#value ||= other.self(calls, 'inner').#value ||= 2;
          return [result, this.#value, other.#value];
        }
      }
      const outer = new Value(0);
      const inner = new Value(0);
      const calls = [];
      globalThis.result = [outer.update(inner, calls), calls];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([
    [2, 2, 2],
    ['outer', 'inner'],
  ]);
});

test('re-entrant private logical assignments isolate receiver temporaries per call', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #value = 0;
        self() { return this; }
        update(callback) { return this.self().#value ||= callback(); }
        read() { return this.#value; }
      }
      const outer = new Value();
      const inner = new Value();
      const value = outer.update(() => {
        inner.update(() => 2);
        return 3;
      });
      globalThis.result = [value, outer.read(), inner.read()];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([3, 3, 2]);
});

test('private logical assignment scopes temporaries across arrows, defaults, and static blocks', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #value = 0;
        self() { return this; }
        arrow = () => this.self().#value ||= 2;
        withDefault(value = this.self().#value ||= 3) { return value; }
        read() { return this.#value; }
      }
      class StaticValue {
        static #value = 0;
        static self() { return this; }
        static { this.self().#value ||= 4; }
        static read() { return this.#value; }
      }
      const first = new Value();
      const second = new Value();
      globalThis.result = [
        first.arrow(),
        second.withDefault(),
        first.read(),
        second.read(),
        StaticValue.read(),
      ];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([2, 3, 2, 3, 4]);
});

test('logical assignment preserves super references, receivers, and computed-key evaluation', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      class Base {
        get value() { calls.push(['get', this.current]); return this.current; }
        set value(value) { calls.push(['set', this.current, value]); this.current = value; }
      }
      class Child extends Base {
        current = 0;
        update() {
          const key = () => (calls.push('key'), 'value');
          const first = super[key()] ||= 2;
          const second = super[key()] ||= 3;
          return [first, second, this.current];
        }
      }
      const child = new Child();
      globalThis.result = [child.update(), calls];
    `,
    { transforms: { logicalAssignmentOperators: true } },
  );
  expect(result.result).toEqual([
    [2, 2, 2],
    ['key', ['get', 0], ['set', 0, 2], 'key', ['get', 2]],
  ]);
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

test('exponentiation assignment preserves computed super references and receivers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      class Base {
        get value() { calls.push(['get', this.current]); return this.current; }
        set value(value) { calls.push(['set', this.current, value]); this.current = value; }
      }
      class Child extends Base {
        current = 3;
        update() {
          const key = () => (calls.push('key'), 'value');
          return super[key()] **= 2;
        }
      }
      const child = new Child();
      globalThis.result = [child.update(), child.current, calls];
    `,
    { transforms: { exponentiationOperator: true } },
  );
  expect(result.result).toEqual([9, 9, ['key', ['get', 3], ['set', 3, 9]]]);
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
