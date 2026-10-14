import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute } from './runtime';

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
    name: 'optional calls retain the receiver when the method getter reassigns it',
    source: `
      let receiver;
      const first = {
        name: 'first',
        get method() {
          receiver = { name: 'second' };
          return function () {
            return this.name;
          };
        },
      };
      receiver = first;
      globalThis.result = receiver.method?.();
    `,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 'first',
    knownFailure: false,
  },
  {
    name: 'private logical assignment retains the receiver when its getter reassigns it',
    source: `
      let receiver;
      const writes = [];
      class Value {
        constructor(name) {
          this.name = name;
        }
        get #value() {
          receiver = second;
          return 0;
        }
        set #value(value) {
          writes.push([this.name, value]);
        }
        static write() {
          return (receiver.#value ||= 3);
        }
      }
      const first = new Value('first');
      const second = new Value('second');
      receiver = first;
      globalThis.result = [Value.write(), writes];
    `,
    plan: { transforms: { logicalAssignmentOperators: true } },
    expected: [3, [['first', 3]]],
    knownFailure: false,
  },
  {
    name: 'escaped identifiers cannot collide with object spread helpers',
    source: String.raw`
    const _ext\u0065nds = 'user';
    globalThis.result = [_ext\u0065nds, {...{value: 1}}];
  `,
    plan: { transforms: { objectRestSpread: { loose: true, useBuiltIns: false } } },
    expected: ['user', { value: 1 }],
    knownFailure: false,
  },
  {
    name: 'object rest preserves an own __proto__ data property without changing its prototype',
    source: `
      const source = JSON.parse('{"__proto__":{"marker":1},"omit":2,"keep":3}');
      const { omit, ...rest } = source;
      globalThis.result = [
        Object.prototype.hasOwnProperty.call(rest, '__proto__'),
        Object.getPrototypeOf(rest) === Object.prototype,
        rest.__proto__.marker,
        rest.keep,
      ];
    `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [true, true, 1, 3],
    knownFailure: true,
  },
  {
    name: 'private logical assignment in defaults isolates receiver temporaries during reentry',
    source: `
      let recurse = true;
      let second;
      class Value {
        constructor(name) {
          this.name = name;
          this.stored = 0;
        }
        self() {
          return this;
        }
        get #value() {
          if (recurse) {
            recurse = false;
            Value.write(second);
          }
          return 0;
        }
        set #value(value) {
          this.stored = value;
        }
        static write(obj, value = (obj.self().#value ||= 3)) {
          return value;
        }
      }
      const first = new Value('first');
      second = new Value('second');
      Value.write(first);
      globalThis.result = [first.stored, second.stored];
    `,
    plan: { transforms: { logicalAssignmentOperators: true } },
    expected: [3, 3],
    knownFailure: true,
  },
  {
    name: 'private assignment field initializer static this',
    source: `class Value{static #x=0;static read=(()=>this.#x ||= 2)();static get(){return this.#x;}}globalThis.result=[Value.read,Value.get()];`,
    plan: { transforms: { logicalAssignmentOperators: true } },
    expected: [2, 2],
    knownFailure: false,
  },
  {
    name: 'strict spread preserves method and accessor names and nonconstructability',
    source: `
      const key = Symbol('key');
      const object = { ...{}, method() {}, [key]() {}, get value() { return 1; } };
      const descriptor = Object.getOwnPropertyDescriptor(object, 'value');
      globalThis.result = [object.method.name, object[key].name, descriptor.get.name,
        Object.hasOwn(object.method, 'prototype')];
    `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: ['method', '[key]', 'get value', false],
    knownFailure: false,
  },
  {
    name: 'strict spread preserves property initializer names during class initialization',
    source: `
      let observed;
      const object = {
        ...{},
        value: class { static { observed = this.name; } },
        fn: function () {},
        arrow: () => {},
      };
      globalThis.result = [observed, object.value.name, object.fn.name, object.arrow.name];
    `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: ['value', 'value', 'fn', 'arrow'],
    knownFailure: false,
  },
  {
    name: 'strict spread preserves the home object of an initial getter',
    source: `
      const object = { __proto__: { value: 1 }, get read() { return super.value; }, ...{ value: 2 } };
      Object.setPrototypeOf(object, { value: 3 });
      globalThis.result = object.read;
    `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: 3,
    knownFailure: false,
  },
  {
    name: 'strict spread skips nonenumerable properties without replacing existing accessors',
    source: `
      const source = Object.defineProperty({}, 'value', { value: 2, enumerable: false });
      const object = { get value() { return 1; }, ...source };
      globalThis.result = [object.value, typeof Object.getOwnPropertyDescriptor(object, 'value').get];
    `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, 'function'],
    knownFailure: false,
  },
  {
    name: 'strict spread copies before later property evaluation',
    source: `
   const events = [];
   const source = { get a() { events.push('get'); return 1; } };
   const result = { ...source, b: (events.push('later'), 2) };
   globalThis.result = [result, events];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [{ a: 1, b: 2 }, ['get', 'later']],
    knownFailure: false,
  },
  {
    name: 'strict spread preserves getter descriptor following spread',
    source: `
   const events = [];
   const result = { ...{}, get a() { events.push('get'); return 1; } };
   globalThis.result = [typeof Object.getOwnPropertyDescriptor(result,'a').get, events];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: ['function', []],
    knownFailure: false,
  },
  {
    name: 'strict spread methods use final object as home object',
    source: `
   const result = { ...{}, read() { return super.value; } };
   Object.setPrototypeOf(result, {value:3});
   globalThis.result = result.read();
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'strict spread prototype setter after spread',
    source: `
   const proto = {value:3};
   const result = { ...{}, __proto__: proto };
   globalThis.result = [Object.getPrototypeOf(result)===proto, result.value];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [true, 3],
    knownFailure: true,
  },
  {
    name: 'logical assignment preserves native computed-key coercion timing',
    source: `
   const events = [];
   const key = { [Symbol.toPrimitive]() { events.push('key'); return events.length===1 ? 'a' : 'b'; } };
   const object = { a: 0 };
   object[key] ||= 2;
   globalThis.result = [object, events];
     `,
    plan: { transforms: { logicalAssignmentOperators: true } },
    expected: [{ a: 0, b: 2 }, ['key', 'key']],
    knownFailure: false,
  },
  {
    name: 'exponentiation assignment preserves native computed-key coercion timing',
    source: `
   const events = [];
   const key = { [Symbol.toPrimitive]() { events.push('key'); return events.length===1 ? 'a' : 'b'; } };
   const object = { a: 3 };
   object[key] **= 2;
   globalThis.result = [object, events];
     `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [{ a: 3, b: 9 }, ['key', 'key']],
    knownFailure: false,
  },
  {
    name: 'strict spread accessor halves merge across spread',
    source: `
   const events = [];
   const result = { get value() { return 3; }, ...{}, set value(next) { events.push(next); } };
   result.value = 4;
   globalThis.result = [result.value, events];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [3, [4]],
    knownFailure: true,
  },
  {
    name: 'strict spread honors proxy key order across symbols',
    source: `
   const events = [];
   const symbol = Symbol('first');
   const source = new Proxy({ get a() { events.push('a'); return 1; }, get [symbol]() { events.push('symbol'); return 2; } }, {
     ownKeys() { events.push('keys'); return [symbol, 'a']; }
   });
   const result = {...source};
   globalThis.result = [result.a, result[symbol], events];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, 2, ['keys', 'symbol', 'a']],
    knownFailure: true,
  },
  {
    name: 'strict spread rechecks descriptors after preceding getters',
    source: `
   const source = { get a() { Object.defineProperty(this, 'b', { enumerable: false }); return 1; }, b: 2 };
   const result = {...source};
   globalThis.result = [result.a, Object.hasOwn(result, 'b')];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, false],
    knownFailure: true,
  },
  {
    name: 'strict spread does not query inherited property existence',
    source: `
   const events = [];
   const proto = new Proxy({}, { has(target, key) { events.push(String(key)); return false; } });
   const result = { __proto__: proto, ...{a:1} };
   globalThis.result = [result.a, events];
     `,
    plan: { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
    expected: [1, []],
    knownFailure: true,
  },
  {
    name: 'exponentiation preserves dynamic BigInt operands',
    source: `
 function power(left,right){return left**right;}globalThis.result=String(power(2n,3n));
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: '8',
    knownFailure: true,
  },
  {
    name: 'exponentiation converts boxed BigInts',
    source: `
 globalThis.result=String(Object(2n)**Object(3n));
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: '8',
    knownFailure: true,
  },
  {
    name: 'exponentiation preserves primitive conversion hint and order',
    source: `
 const events=[];
 const left={[Symbol.toPrimitive](hint){events.push('left:'+hint);return 2;}};
 const right={[Symbol.toPrimitive](hint){events.push('right:'+hint);return 3;}};
 globalThis.result=[left**right,events];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [8, ['left:number', 'right:number']],
    knownFailure: false,
  },
  {
    name: 'exponentiation accepts object conversions yielding BigInts',
    source: `
 const events=[];
 const left={valueOf(){events.push('left');return 2n;}};
 const right={valueOf(){events.push('right');return 3n;}};
 globalThis.result=[String(left**right),events];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: ['8', ['left', 'right']],
    knownFailure: true,
  },
  {
    name: 'exponentiation does not resolve shadowed Math',
    source: `
 function power(Math){return 2**3;}globalThis.result=power(null);
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: 8,
    knownFailure: true,
  },
  {
    name: 'exponentiation assignment retains receiver across getter mutation',
    source: `
 const writes=[];const second={value:5};let receiver;
 const first={get value(){receiver=second;return 3;},set value(value){writes.push(value);}};
 receiver=first;const result=receiver.value**=2;globalThis.result=[result,writes,second.value];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [9, [9], 5],
    knownFailure: false,
  },
  {
    name: 'exponentiation assignment retains receiver across RHS mutation',
    source: `
 const first={value:3};const second={value:5};let receiver=first;
 const result=receiver.value**=(receiver=second,2);globalThis.result=[result,first.value,second.value];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [9, 9, 5],
    knownFailure: false,
  },
  {
    name: 'exponentiation assignment retains original numeric operand across RHS mutation',
    source: `
 let value=3;const result=value**=(value=5,2);globalThis.result=[result,value];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [9, 9],
    knownFailure: false,
  },
  {
    name: 'exponentiation assignment preserves RHS before numeric conversion',
    source: `
 const events=[];const object={value:{valueOf(){events.push('convert');return 3;}}};
 const result=object.value**=(events.push('rhs'),2);globalThis.result=[result,events];
    `,
    plan: { transforms: { exponentiationOperator: true } },
    expected: [9, ['rhs', 'convert']],
    knownFailure: false,
  },
  {
    name: 'optional method calls ignore overridden call properties',
    source: `
 const object={value:2,method(){return this.value;}};object.method.call=()=>99;globalThis.result=object.method?.();
    `,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 2,
    knownFailure: true,
  },
  {
    name: 'optional method calls reject noncallables with call properties',
    source: `
 const object={method:{call(){return 99;}}};try{globalThis.result=object.method?.();}catch(error){globalThis.result=error.name;}
    `,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'optional plain calls ignore overridden call properties',
    source: `
 function method(){return 2;}method.call=()=>99;globalThis.result=method?.();
    `,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'optional method calls preserve primitive receivers',
    source: `
 globalThis.result='abc'.slice?.(1);
    `,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 'bc',
    knownFailure: false,
  },
  {
    name: 'logical assignments preserve inferred function and class names',
    source: `
 let first=null,second=0,third=1;first??=function(){};second||=()=>{};third&&=class{static observed=this.name;};globalThis.result=[first.name,second.name,third.name,third.observed];
    `,
    plan: { transforms: { logicalAssignmentOperators: true } },
    expected: ['first', 'second', 'third', 'third'],
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
