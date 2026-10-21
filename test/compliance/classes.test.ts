import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute, executeModule } from './runtime';

test('a lowered named default class preserves its exported outer binding', async () => {
  const module = await executeModule(
    `export default class DOMException extends Error {
      #name;
      constructor(message) { super(message); this.#name = 'Error'; }
      get name() { return this.#name; }
    }
    DOMException.code = 1;`,
    {
      transforms: {
        classes: true,
        classProperties: { loose: true },
        privateMethods: true,
        privatePropertyInObject: true,
      },
    },
  );
  const DOMException = module.default as { new (message: string): Error; code: number };
  expect(DOMException.code).toBe(1);
  expect(new DOMException('message').name).toBe('Error');
});

test('auto-accessors retain prototype descriptors and per-instance storage', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Example {
        accessor value = 1;
        static accessor count = 2;
      }
      const first = new Example();
      const second = new Example();
      first.value = 7;
      Example.count = 9;
      const descriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'value');
      const staticDescriptor = Object.getOwnPropertyDescriptor(Example, 'count');
      globalThis.result = [
        first.value, second.value, Example.count,
        typeof descriptor.get, typeof descriptor.set,
        typeof staticDescriptor.get, typeof staticDescriptor.set,
        Object.prototype.hasOwnProperty.call(first, 'value'),
      ];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([7, 1, 9, 'function', 'function', 'function', 'function', false]);
});

test('lowered classes preserve inheritance, super calls, accessors, and methods', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Base {
        constructor(value) { this.value = value; }
        get doubled() { return this.value * 2; }
        read() { return this.value; }
      }
      class Child extends Base {
        constructor(value) { super(value + 1); }
        read() { return super.read() + 1; }
      }
      const child = new Child(2);
      globalThis.result = [child.read(), child.doubled, child instanceof Base, child instanceof Child];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([4, 6, true, true]);
});

test('public fields and static blocks preserve initialization order', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const order = [];
      class Example {
        first = order.push('first');
        second = order.push('second');
        static before = order.push('static-field');
        static { order.push('static-block'); this.answer = 42; }
      }
      const value = new Example();
      globalThis.result = [order, value.first, value.second, Example.answer];
    `,
    { transforms: { classProperties: { loose: true }, classStaticBlock: true } },
  );
  expect(result.result).toEqual([['static-field', 'static-block', 'first', 'second'], 3, 4, 42]);
});

test('inferred anonymous class names are visible to static initialization', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const Variable = class {
        static observed = this.name;
        static arrow = () => this;
        static ordinary = function () { return this; };
      };
      let Assigned;
      Assigned = class { static { this.observed = this.name; } };
      const object = { Property: class { static observed = this.name; } };
      const receiver = {};
      globalThis.result = [
        Variable.name,
        Variable.observed,
        Assigned.name,
        Assigned.observed,
        object.Property.name,
        object.Property.observed,
        Variable.arrow() === Variable,
        Variable.ordinary.call(receiver) === receiver,
      ];
    `,
    {
      transforms: {
        classes: true,
        classProperties: { loose: true },
        classStaticBlock: true,
      },
    },
  );
  expect(result.result).toEqual([
    'Variable',
    'Variable',
    'Assigned',
    'Assigned',
    'Property',
    'Property',
    true,
    true,
  ]);
});

test.each([
  {
    mode: 'spec',
    loose: false,
    expected: [21, true, 21, true, 7, 7, 1, 2, 21, 1],
  },
  {
    mode: 'loose',
    loose: true,
    expected: [undefined, true, undefined, true, 7, 7, 1, 2, undefined, 1],
  },
] as const)(
  '$mode static field initializers preserve this and super semantics',
  ({ loose, expected }) => {
    const result = execute<{ result: unknown[] }>(
      `
      class Base {
        static get value() { return this.seed; }
        static method() { return this; }
        static set written(value) { this.seen = value; }
        static count = 1;
      }
      let keyCalls = 0;
      const key = () => (keyCalls++, 'value');
      class Child extends Base {
        static seed = 21;
        static direct = super.value;
        static arrow = () => [this, super.value];
        static call = super.method();
        static assigned = (super.written = 7);
        static previous = super.count++;
        static computed = super[key()];
      }
      const original = Child;
      Child = null;
      const [receiver, value] = original.arrow();
      globalThis.result = [
        original.direct,
        receiver === original,
        value,
        original.call === original,
        original.assigned,
        original.seen,
        original.previous,
        original.count,
        original.computed,
        keyCalls,
      ];
    `,
      { transforms: { classes: true, classProperties: { loose } } },
    );
    expect(result.result).toEqual(expected);
  },
);

test.each([
  {
    mode: 'spec',
    loose: false,
    expected: [21, true, 21, true, 7, 7, 1, 2, 21, 1],
  },
  {
    mode: 'loose',
    loose: true,
    expected: [undefined, true, undefined, true, 7, 7, 1, 2, undefined, 1],
  },
] as const)(
  '$mode instance field initializers preserve this and super semantics',
  ({ loose, expected }) => {
    const result = execute<{ result: unknown[] }>(
      `
        class Base {
          get value() { return this.seed; }
          method() { return this; }
          set written(value) { this.seen = value; }
        }
        Base.prototype.count = 1;
        let keyCalls = 0;
        const key = () => (keyCalls++, 'value');
        class Child extends Base {
          seed = 21;
          direct = super.value;
          arrow = () => [this, super.value];
          call = super.method();
          assigned = (super.written = 7);
          previous = super.count++;
          computed = super[key()];
        }
        const value = new Child();
        const [receiver, arrowValue] = value.arrow();
        globalThis.result = [
          value.direct,
          receiver === value,
          arrowValue,
          value.call === value,
          value.assigned,
          value.seen,
          value.previous,
          value.count,
          value.computed,
          keyCalls,
        ];
      `,
      { transforms: { classes: true, classProperties: { loose } } },
    );
    expect(result.result).toEqual(expected);
  },
);

test('static blocks preserve this, super receivers, private access, and var isolation', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      class Base {
        static get value() { calls.push(['get', this.name]); return this.seed; }
      }
      class Child extends Base {
        static seed = 40;
        static #private = 2;
        static {
          var local = 'inside';
          this.answer = super.value + this.#private;
          calls.push([this === Child, local]);
        }
      }
      globalThis.result = [Child.answer, calls, typeof local];
    `,
    { transforms: { classStaticBlock: true } },
    {},
    'input.js',
    code => expect(code).not.toMatch(/static\s*\{/),
  );
  expect(result.result).toEqual([
    42,
    [
      ['get', 'Child'],
      [true, 'inside'],
    ],
    'undefined',
  ]);
});

test('private methods preserve receiver branding', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Counter {
        #value = 1;
        #increment(amount) { this.#value += amount; return this.#value; }
        increment(amount) { return this.#increment(amount); }
      }
      const counter = new Counter();
      globalThis.result = [counter.increment(2), counter.increment(3)];
    `,
    {
      transforms: {
        classProperties: { loose: true },
        privateMethods: true,
      },
    },
  );
  expect(result.result).toEqual([3, 6]);
});

test('lowered private methods remain non-constructable when exposed', () => {
  const result = execute<{ result: boolean }>(
    `
      class Example {
        #method() { return 1; }
        expose() { return this.#method; }
      }
      const method = new Example().expose();
      try { Reflect.construct(method, []); globalThis.result = false; }
      catch (error) { globalThis.result = error instanceof TypeError; }
    `,
    {
      transforms: {
        classes: true,
        classProperties: { loose: true },
        privateMethods: true,
      },
    },
  );
  expect(result.result).toBe(true);
});

// NOTE: Private features intentionally retain one representation.
test('selected private fields, methods, and brand checks preserve receiver semantics', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Counter {
        #value = 1;
        #increment(amount) { this.#value += amount; return this.#value; }
        increment(amount) { return this.#increment(amount); }
        static has(input) { return #value in input; }
        static read(input) { return input.#value; }
      }
      const counter = new Counter();
      let fakeError;
      let primitiveError;
      try { Counter.read({}); } catch (error) { fakeError = error instanceof TypeError; }
      try { Counter.has(1); } catch (error) { primitiveError = error instanceof TypeError; }
      globalThis.result = [
        counter.increment(2),
        Counter.has(counter),
        Counter.has({}),
        fakeError,
        primitiveError,
      ];
    `,
    {
      transforms: {
        classProperties: { loose: false },
        privateMethods: true,
        privatePropertyInObject: true,
      },
    },
  );
  expect(result.result).toEqual([3, true, false, true, true]);
});

test('private-in distinguishes branded instances from lookalikes and subclasses', () => {
  const result = execute<{ result: boolean[] }>(
    `
      class Base {
        #value;
        static has(value) { return #value in value; }
      }
      class Child extends Base {}
      globalThis.result = [Base.has(new Base()), Base.has(new Child()), Base.has({}), Base.has([])];
    `,
    {
      transforms: {
        classProperties: { loose: true },
        privatePropertyInObject: true,
      },
    },
  );
  expect(result.result).toEqual([true, true, false, false]);
});

test('computed class keys and field initializers run in specification order', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const order = [];
      const key = name => (order.push('key:' + name), name);
      class Example {
        [key('method')]() { return 'method'; }
        [key('field')] = order.push('field');
      }
      order.push('defined');
      const value = new Example();
      globalThis.result = [order, value.method(), value.field];
    `,
    { transforms: { classes: true, classProperties: { loose: true } } },
  );
  expect(result.result).toEqual([['key:method', 'key:field', 'defined', 'field'], 'method', 4]);
});

test('derived constructors preserve explicit object returns and reject primitive returns', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Base {}
      class ObjectChild extends Base { constructor() { return { answer: 42 }; } }
      class PrimitiveChild extends Base { constructor() { super(); return 1; } }
      let error;
      try { new PrimitiveChild(); } catch (caught) { error = caught instanceof TypeError; }
      globalThis.result = [new ObjectChild().answer, error];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([42, true]);
});

test('base and derived constructor return completions follow class construction rules', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class BasePrimitive { constructor() { this.value = 1; return 2; } }
      class BaseObject { constructor() { this.value = 1; return { value: 2 }; } }
      class DerivedUndefined extends BasePrimitive { constructor() { return undefined; } }
      let derivedError;
      try { new DerivedUndefined(); }
      catch (error) { derivedError = error instanceof ReferenceError; }
      globalThis.result = [
        new BasePrimitive().value,
        new BaseObject().value,
        derivedError,
      ];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([1, 2, true]);
});

test('derived fields initialize on the object returned by super', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const returned = {};
      class Base { constructor() { return returned; } }
      class Child extends Base {
        field = 42;
        constructor() { super(); this.after = this === returned; }
      }
      const child = new Child();
      globalThis.result = [child === returned, child.field, child.after];
    `,
    { transforms: { classes: true, classProperties: { loose: true } } },
  );
  expect(result.result).toEqual([true, 42, true]);
});

test('lowered constructors preserve new.target through base and derived construction', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Base { constructor() { this.baseTarget = new.target.name; } }
      class Child extends Base { constructor() { super(); this.childTarget = new.target.name; } }
      globalThis.result = [new Base().baseTarget, new Child().baseTarget, new Child().childTarget];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual(['Base', 'Child', 'Child']);
});

test('lowered constructors support alternate new targets', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Example { constructor(value) { this.value = value; } }
      function Alternate() {}
      const value = Reflect.construct(Example, [42], Alternate);
      globalThis.result = [
        value.value,
        Object.getPrototypeOf(value) === Alternate.prototype,
        value instanceof Example,
      ];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([42, true, false]);
});

test('lowered class declarations remain block scoped', () => {
  const result = execute<{ result: string }>(
    `
      { class Scoped {} }
      globalThis.result = typeof Scoped;
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toBe('undefined');
});

test('lowered class declarations preserve their temporal dead zone', () => {
  const result = execute<{ result: boolean[] }>(
    `
      let before;
      let computed;
      try { new Before(); } catch (error) { before = error instanceof ReferenceError; }
      class Before {}
      try { class Computed { [Computed]() {} } }
      catch (error) { computed = error instanceof ReferenceError; }
      globalThis.result = [before, computed];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([true, true]);
});

test('lowered classes preserve the immutable inner class-name binding', () => {
  const result = execute<{ result: boolean[] }>(
    `
      class Declaration {
        static mutate() {
          try { Declaration = null; return false; }
          catch (error) { return error instanceof TypeError; }
        }
      }
      const Expression = class Inner {
        static mutate() {
          try { Inner = null; return false; }
          catch (error) { return error instanceof TypeError; }
        }
      };
      globalThis.result = [Declaration.mutate(), Expression.mutate()];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([true, true]);
});

test('lowered class methods and accessors remain non-constructable', () => {
  const result = execute<{ result: boolean[] }>(
    `
      class Example {
        method() {}
        static staticMethod() {}
        get value() { return 1; }
        set value(next) {}
      }
      const descriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'value');
      const functions = [
        Example.prototype.method,
        Example.staticMethod,
        descriptor.get,
        descriptor.set,
      ];
      globalThis.result = functions.map(fn => {
        try { Reflect.construct(fn, []); return false; }
        catch (error) { return error instanceof TypeError; }
      });
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual([true, true, true, true]);
});

test('lowered class methods and accessors preserve inferred names', () => {
  const result = execute<{ result: string[] }>(
    `
      class Example {
        method() {}
        static staticMethod() {}
        get value() { return 1; }
        set value(next) {}
      }
      const descriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'value');
      globalThis.result = [
        Example.prototype.method.name,
        Example.staticMethod.name,
        descriptor.get.name,
        descriptor.set.name,
      ];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual(['method', 'staticMethod', 'get value', 'set value']);
});

test('lowered class constructor and method descriptors match class semantics', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const seen = [];
      class Example {
        method() {}
        static { seen.push(Object.getOwnPropertyDescriptor(this, 'prototype').writable); }
      }
      const prototype = Object.getOwnPropertyDescriptor(Example, 'prototype');
      const method = Object.getOwnPropertyDescriptor(Example.prototype, 'method');
      globalThis.result = [
        prototype.writable,
        prototype.enumerable,
        prototype.configurable,
        method.writable,
        method.enumerable,
        method.configurable,
        seen,
      ];
    `,
    { transforms: { classes: true, classStaticBlock: true } },
  );
  expect(result.result).toEqual([false, false, false, true, false, true, [false]]);
});

test('lowered computed methods preserve string, numeric, and symbol names', () => {
  const result = execute<{ result: string[] }>(
    `
      const named = Symbol('named');
      const anonymous = Symbol();
      class Example {
        ['computed']() {}
        [1]() {}
        [named]() {}
        get [anonymous]() { return 1; }
      }
      globalThis.result = [
        Example.prototype.computed.name,
        Example.prototype[1].name,
        Example.prototype[named].name,
        Object.getOwnPropertyDescriptor(Example.prototype, anonymous).get.name,
      ];
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual(['computed', '1', '[named]', 'get ']);
});

test('static inheritance and super property access preserve the receiver', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Base {
        static value = 2;
        static read() { return this.value; }
      }
      class Child extends Base {
        static value = 3;
        static read() { return super.read() + 1; }
      }
      globalThis.result = [Child.read(), Object.getPrototypeOf(Child) === Base];
    `,
    { transforms: { classes: true, classProperties: { loose: true } } },
  );
  expect(result.result).toEqual([4, true]);
});

test('class heritage expressions are evaluated exactly once before computed keys', () => {
  const result = execute<{ result: string[] }>(
    `
      const order = [];
      class Base {}
      const heritage = () => (order.push('heritage'), Base);
      const key = () => (order.push('key'), 'method');
      class Child extends heritage() { [key()]() {} }
      globalThis.result = order;
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toEqual(['heritage', 'key']);
});

test('derived classes read the superclass prototype before setting static inheritance', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const order = [];
      const originalSetPrototypeOf = Object.setPrototypeOf;
      Object.setPrototypeOf = function (target, prototype) {
        order.push('setPrototypeOf');
        return originalSetPrototypeOf(target, prototype);
      };
      function Base() {}
      const Super = new Proxy(Base, {
        get(target, key, receiver) {
          if (key === 'prototype') order.push('prototype');
          return Reflect.get(target, key, receiver);
        },
      });
      class Child extends Super {}
      Object.setPrototypeOf = originalSetPrototypeOf;
      globalThis.result = [order, new Child() instanceof Base];
    `,
    { transforms: { classes: true } },
    {},
    'input.js',
    code => expect(code).not.toMatch(/^\s*class\s/m),
  );
  expect(result.result).toEqual([['prototype', 'setPrototypeOf'], true]);
});

test('invalid superclass values throw while the class is defined', () => {
  const result = execute<{ result: boolean }>(
    `
      const invalid = { prototype: {} };
      try { class Child extends invalid {} globalThis.result = false; }
      catch (error) { globalThis.result = error instanceof TypeError; }
    `,
    { transforms: { classes: true } },
  );
  expect(result.result).toBe(true);
});

test('private accessors preserve getter and setter receivers', () => {
  const result = execute<{ result: unknown[] }>(
    `
      class Value {
        #stored = 1;
        get #current() { return this.#stored; }
        set #current(value) { this.#stored = value; }
        update(value) { this.#current = value; return this.#current; }
      }
      const value = new Value();
      globalThis.result = [value.update(7), value.update(9)];
    `,
    {
      transforms: {
        classProperties: { loose: true },
        privateMethods: true,
      },
    },
  );
  expect(result.result).toEqual([7, 9]);
});

test('static private brands reject instances and accept the declaring constructor', () => {
  const result = execute<{ result: boolean[] }>(
    `
      class Example {
        static #value;
        static has(input) { return #value in input; }
      }
      class Child extends Example {}
      globalThis.result = [Example.has(Example), Example.has(Child), Example.has(new Example())];
    `,
    {
      transforms: {
        classProperties: { loose: true },
        privatePropertyInObject: true,
      },
    },
  );
  expect(result.result).toEqual([true, false, false]);
});

// Compile outside test.fails so transform errors cannot accidentally satisfy
// known runtime regressions. Each row states its expected runtime behavior.
const additionalComplianceCases: {
  name: string;
  source: string;
  plan: import('../../js').PreflightPlan;
  expected: unknown;
  bindings?: Record<string, unknown>;
  knownFailure: boolean;
}[] = [
  {
    name: 'class literal method and accessor keys determine function names',
    source: `
      class Value {
        'literal'() {}
        123() {}
        get 'getter'() { return 1; }
        set 'setter'(value) {}
      }
      const prototype = Value.prototype;
      globalThis.result = [prototype.literal.name, prototype[123].name,
        Object.getOwnPropertyDescriptor(prototype, 'getter').get.name,
        Object.getOwnPropertyDescriptor(prototype, 'setter').set.name];
    `,
    plan: { transforms: { classes: true } },
    expected: ['literal', '123', 'get getter', 'set setter'],
    knownFailure: true,
  },
  {
    name: 'class symbol method naming does not read Symbol prototype description',
    source: `
      const calls = [];
      const descriptor = Object.getOwnPropertyDescriptor(Symbol.prototype, 'description');
      try {
        Object.defineProperty(Symbol.prototype, 'description', {
          configurable: true,
          get() { calls.push('description'); return 'override'; },
        });
        const key = Symbol('original');
        class Value { [key]() {} }
        globalThis.result = [Value.prototype[key].name, calls];
      } finally {
        Object.defineProperty(Symbol.prototype, 'description', descriptor);
      }
    `,
    plan: { transforms: { classes: true } },
    expected: ['[original]', []],
    knownFailure: false,
  },
  {
    name: 'class symbol method names distinguish absent and empty descriptions',
    source: `
      const absent = Symbol();
      const empty = Symbol('');
      const named = Symbol('key');
      class Value { [absent]() {} [empty]() {} [named]() {} }
      globalThis.result = [absent, empty, named].map(key => Value.prototype[key].name);
    `,
    plan: { transforms: { classes: true } },
    expected: ['', '[]', '[key]'],
    knownFailure: false,
  },
  {
    name: 'class computed literal keys determine function names',
    source: `
      class Value { ['literal']() {} [123]() {} [1n]() {} }
      globalThis.result = ['literal', 123, 1].map(key => Value.prototype[key].name);
    `,
    plan: { transforms: { classes: true } },
    expected: ['literal', '123', '1'],
    knownFailure: false,
  },
  {
    name: 'class method replacement clears prior accessors before a later getter',
    source: `
      class Value {
        get value() { return 1; }
        set value(next) { this.stored = next; }
        value() { return 2; }
        get value() { return 3; }
      }
      const descriptor = Object.getOwnPropertyDescriptor(Value.prototype, 'value');
      globalThis.result = [typeof descriptor.get, typeof descriptor.set,
        'value' in descriptor, descriptor.enumerable, descriptor.configurable];
    `,
    plan: { transforms: { classes: true } },
    expected: ['function', 'undefined', false, false, true],
    knownFailure: false,
  },

  {
    name: 'class lowering preserves super calls in constructor parameter defaults',
    source: `
      class Base {}
      class Child extends Base {
        constructor(value = super()) {
          this.value = value === this;
        }
      }
      globalThis.result = new Child().value;
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'class defaults in destructuring preserve names during static initialization',
    source: `
      const {
        Value = class {
          static original = this.name;
        },
      } = {};
      globalThis.result = [Value.name, Value.original];
    `,
    plan: { transforms: { classes: true, classProperties: { loose: false } } },
    expected: ['Value', 'Value'],
    knownFailure: false,
  },
  {
    name: 'named class expression keys resolve the uninitialized inner class binding',
    source: `
      let Value = 'outer';
      let result;
      try {
        const C = class Value {
          [Value]() {}
        };
        result = 'success';
      } catch (e) {
        result = e.name;
      }
      globalThis.result = result;
    `,
    plan: { transforms: { classes: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },

  {
    name: 'named class expression heritage resolves the uninitialized inner binding',
    source: `
      let Base = class {};
      let result;
      try {
        const C = class Base extends Base {};
        result = 'success';
      } catch (e) {
        result = e.name;
      }
      globalThis.result = result;
    `,
    plan: { transforms: { classes: true } },
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'closures created in named class keys retain the inner class binding',
    source: `
      let read;
      const Value = 'outer';
      const C = class Value {
        [((read = () => Value), 'x')]() {}
      };
      globalThis.result = read() === C;
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: true,
  },
  {
    name: 'super failed assignment throws in strict class method',
    source: `
      class Base {}
      Object.defineProperty(Base.prototype, 'x', { value: 1, writable: false });
      class Child extends Base {
        write() {
          try {
            super.x = 3;
            return 'success';
          } catch (e) {
            return e.name;
          }
        }
      }
      globalThis.result = new Child().write();
    `,
    expected: 'TypeError',
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super failed update throws in strict class method',
    source: `
      class Base {}
      Object.defineProperty(Base.prototype, 'x', { value: 1, writable: false });
      class Child extends Base {
        write() {
          try {
            super.x++;
            return 'success';
          } catch (e) {
            return e.name;
          }
        }
      }
      globalThis.result = new Child().write();
    `,
    expected: 'TypeError',
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super assignment RHS can reference _value',
    source: `
      class Base {}
      class Child extends Base {
        write(_value) {
          return (super.x = _value);
        }
      }
      const child = new Child();
      globalThis.result = [child.write(3), child.x];
    `,
    expected: [3, 3],
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super assignment key can reference _key',
    source: `
      class Base {}
      class Child extends Base {
        write(_key) {
          super[_key] = 3;
          return this.x;
        }
      }
      globalThis.result = new Child().write('x');
    `,
    expected: 3,
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super assignment awaits RHS in method',
    source: `
      class Base {}
      class Child extends Base {
        async write() {
          return (super.x = await Promise.resolve(3));
        }
      }
      globalThis.result = new Child().write();
    `,
    expected: 3,
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super assignment yields RHS in method',
    source: `
      class Base {}
      class Child extends Base {
        *write() {
          return (super.x = yield 1);
        }
      }
      const iterator = new Child().write();
      globalThis.result = [iterator.next(), iterator.next(3)];
    `,
    expected: [
      { value: 1, done: false },
      { value: 3, done: true },
    ],
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'super update supports BigInt',
    source: `
      class Base {
        get x() {
          return this.saved ?? 1n;
        }
        set x(v) {
          this.saved = v;
        }
      }
      class Child extends Base {
        write() {
          return [super.x++, ++super.x, this.saved];
        }
      }
      globalThis.result = new Child().write();
    `,
    expected: [1n, 3n, 3n],
    plan: { transforms: { classes: true } },
    knownFailure: false,
  },
  {
    name: 'class lowering ignores shadowed Object',
    source: `function read(Object){class Value{method(){return 1;}}return new Value().method();}globalThis.result=read(null);`,
    plan: { transforms: { classes: true } },
    expected: 1,
    knownFailure: true,
  },
  {
    name: 'super constructor lookup observes changed constructor prototype',
    source: `
 class Base {constructor(){this.value=1;}}
 class Other {constructor(){this.value=2;}}
 class Child extends Base {constructor(){super();}}
 Object.setPrototypeOf(Child,Other);
 globalThis.result=new Child().value;
    `,
    plan: { transforms: { classes: true } },
    expected: 2,
    knownFailure: false,
  },

  {
    name: 'derived constructors reject this access before super',
    source: `
 class Base {}
 class Child extends Base {constructor(){try{this.value=1;}catch(error){globalThis.result=error.name;}super();}}
 new Child();
    `,
    plan: { transforms: { classes: true } },
    expected: 'ReferenceError',
    knownFailure: false,
  },
  {
    name: 'class extends null explicit constructor may return object',
    source: `
 class Value extends null {constructor(){return {};}}
 globalThis.result=Object.getPrototypeOf(new Value())===Object.prototype;
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'derived constructor direct eval sees initialized this',
    source: `
 class Base {constructor(){this.value=3;}}
 class Child extends Base {constructor(){super();globalThis.result=eval('this.value');}}
 new Child();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },

  {
    name: 'base field closures ignore constructor lexical declarations',
    source: `
 const value='outer';
 class Example { field=()=>value; constructor(){let value='body';} }
 globalThis.result=new Example().field();
    `,
    plan: { transforms: { classes: true } },
    expected: 'outer',
    knownFailure: false,
  },
  {
    name: 'derived fields resolve outer names despite constructor parameters',
    source: `
 const value='outer';
 class Example extends Object { field=value; constructor(value){super();} }
 globalThis.result=new Example('parameter').field;
    `,
    plan: { transforms: { classes: true } },
    expected: 'outer',
    knownFailure: false,
  },
  {
    name: 'field direct eval does not see constructor locals',
    source: `
 const value='outer';
 class Example { field=eval('value'); constructor(value){} }
 globalThis.result=new Example('parameter').field;
    `,
    plan: { transforms: { classes: true } },
    expected: 'outer',
    knownFailure: false,
  },
  {
    name: 'class field functions infer property names',
    source: `
 class Example { method=function(){}; arrow=()=>{}; static method=function(){}; }
 const instance=new Example();globalThis.result=[instance.method.name,instance.arrow.name,Example.method.name];
    `,
    plan: { transforms: { classes: true } },
    expected: ['method', 'arrow', 'method'],
    knownFailure: true,
  },
  {
    name: 'computed field keys are coerced before static initialization',
    source: `
 const events=[];
 const key={[Symbol.toPrimitive](){events.push('key');return 'field';}};
 class Example { [key]=1; static value=events.push('static'); }
 events.push('defined');new Example();new Example();globalThis.result=events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['key', 'static', 'defined'],
    knownFailure: false,
  },
  {
    name: 'nested static field keeps its own this',
    source: `
 class Outer { static Inner=class Inner { static self=this; field=this; }; }
 const instance=new Outer.Inner();globalThis.result=[Outer.Inner.self===Outer.Inner,instance.field===instance];
    `,
    plan: { transforms: { classes: true } },
    expected: [true, true],
    knownFailure: false,
  },
  {
    name: 'nested class computed key keeps outer static this',
    source: `
 class Outer { static key='method';static Inner=class { [this.key](){return 3;} }; }
 globalThis.result=new Outer.Inner().method();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },
  {
    name: 'nested class heritage keeps outer static this',
    source: `
 class Outer { static Base=class {};static Inner=class extends this.Base {}; }
 globalThis.result=new Outer.Inner() instanceof Outer.Base;
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'nested class fields keep their super home object',
    source: `
 class Base {get value(){return 2;}}
 class Other {get value(){return 3;}}
 class Outer extends Base {Inner=class extends Other {field=super.value;};}
 const outer=new Outer();globalThis.result=new outer.Inner().field;
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },
  {
    name: 'static blocks keep block-local var out of other initializers',
    source: `
 const value='outer';
 class Example {static {var value='block';}static field=value;}
 globalThis.result=Example.field;
    `,
    plan: { transforms: { classes: true } },
    expected: 'outer',
    knownFailure: false,
  },
  {
    name: 'class computed keys preserve outer arguments',
    source: `
 function make(key){return class {[arguments[0]](){return 3;}};}
 const Value=make('method');globalThis.result=new Value().method();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },
  {
    name: 'super tagged templates retain method receiver',
    source: `
 class Base {tag(){return this.value;}}
 class Child extends Base {value=3;read(){return super.tag\`text\`;}}
 globalThis.result=new Child().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'super calls ignore own call property',
    source: `
 class Base {method(){return this.value;}}
 Base.prototype.method.call=()=>99;
 class Child extends Base {value=3;read(){return super.method();}}
 globalThis.result=new Child().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'delete super property throws without reading getter',
    source: `
 const events=[];
 class Base {get value(){events.push('get');return 1;}}
 class Child extends Base {read(){try{return delete super.value;}catch(error){return error.name;}}}
 globalThis.result=[new Child().read(),events];
    `,
    plan: { transforms: { classes: true } },
    expected: ['ReferenceError', []],
    knownFailure: true,
  },

  {
    name: 'computed super writes coerce keys before prototype lookup',
    source: `
 const events=[];class Base {set value(value){events.push('base');}}
 class Other {set value(value){events.push('other');}}
 class Child extends Base {write(key){super[key]=3;}}
 const key={[Symbol.toPrimitive](){Object.setPrototypeOf(Child.prototype,Other.prototype);return 'value';}};
 new Child().write(key);globalThis.result=events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['other'],
    knownFailure: true,
  },
  {
    name: 'computed super reads preserve key conversion hints',
    source: `
 const events=[];class Base {get value(){events.push('get');return 3;}}
 class Child extends Base {read(key){return super[key];}}
 const key={[Symbol.toPrimitive](hint){events.push(hint);return 'value';}};
 globalThis.result=[new Child().read(key),events];
    `,
    plan: { transforms: { classes: true } },
    expected: [3, ['string', 'get']],
    knownFailure: false,
  },
  {
    name: 'instance fields can call later private methods',
    source: `
 class Value { result=this.#read(); #read(){return 3;} }
 globalThis.result=new Value().result;
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },

  {
    name: 'private fields are unavailable before their declaration initializes',
    source: `
 class Value { result=(()=>{try{return this.#value;}catch(error){return error.name;}})(); #value=3; }
 globalThis.result=new Value().result;
    `,
    plan: { transforms: { classes: true } },
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'private method assignment evaluates RHS before rejecting write',
    source: `
      const events = [];
      class Value {
        #method() {}
        write() {
          try {
            this.#method = (events.push('rhs'), 3);
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      new Value().write();
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['rhs', 'TypeError'],
    knownFailure: false,
  },

  {
    name: 'private method logical assignment short circuits without rejecting write',
    source: `
 class Value{#method(){}write(){return (this.#method||=3)===this.#method;}}
 globalThis.result=new Value().write();
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'private calls get callable before evaluating arguments',
    source: `
      const events = [];
      class Value {
        get #method() {
          events.push('get');
          return () => events.push('call');
        }
        read() {
          this.#method(events.push('argument'));
        }
      }
      new Value().read();
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['get', 'argument', 'call'],
    knownFailure: false,
  },

  {
    name: 'private calls reject invalid receiver before arguments',
    source: `
      const events = [];
      class Value {
        #method() {}
        static read(receiver) {
          try {
            receiver.#method(events.push('argument'));
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      Value.read({});
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['TypeError'],
    knownFailure: false,
  },
  {
    name: 'optional private calls skip arguments for null callable',
    source: `
 const events=[];class Value{#method=null;read(){return this.#method?.(events.push('argument'));}}
 globalThis.result=[new Value().read(),events];
    `,
    plan: { transforms: { classes: true } },
    expected: [undefined, []],
    knownFailure: false,
  },
  {
    name: 'class methods retain private-name environment for direct eval',
    source: `
 class Value{#value=3;read(){return eval('this.#value');}}
 globalThis.result=new Value().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'class methods retain super binding for direct eval',
    source: `
 class Base{get value(){return 3;}}
 class Child extends Base{read(){return eval('super.value');}}
 globalThis.result=new Child().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: true,
  },
  {
    name: 'class methods retain strict direct eval isolation',
    source: `
 class Value{read(){eval('var leaked=3');return typeof leaked;}}
 globalThis.result=new Value().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 'undefined',
    knownFailure: false,
  },
  {
    name: 'class methods preserve direct eval this receiver',
    source: `
 class Value{value=3;read(){return eval('this.value');}}
 globalThis.result=new Value().read();
    `,
    plan: { transforms: { classes: true } },
    expected: 3,
    knownFailure: false,
  },
  {
    name: 'repeated class evaluations create distinct private brands',
    source: `
 function make(){return class{#value=3;static has(object){return #value in object;}};}
 const First=make();const Second=make();globalThis.result=[First.has(new First()),First.has(new Second())];
    `,
    plan: { transforms: { classes: true } },
    expected: [true, false],
    knownFailure: false,
  },
  {
    name: 'private access rejects instances from another class evaluation',
    source: `
      function make() {
        return class {
          #value = 3;
          static read(object) {
            return object.#value;
          }
        };
      }
      const First = make();
      const Second = make();
      try {
        globalThis.result = First.read(new Second());
      } catch (error) {
        globalThis.result = error.name;
      }
    `,
    plan: { transforms: { classes: true } },
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'repeated static private brands distinguish constructors',
    source: `
 function make(){return class{static #value=3;static has(object){return #value in object;}};}
 const First=make();const Second=make();globalThis.result=[First.has(First),First.has(Second)];
    `,
    plan: { transforms: { classes: true } },
    expected: [true, false],
    knownFailure: false,
  },

  {
    name: 'private async methods share function identity across instances',
    source: `
 class Value{async #method(){}expose(){return this.#method;}}
 globalThis.result=new Value().expose()===new Value().expose();
    `,
    plan: { transforms: { classes: true } },
    expected: true,
    knownFailure: false,
  },
  {
    name: 'private method functions preserve private names',
    source: `
 class Value{#method(){}expose(){return this.#method.name;}}
 globalThis.result=new Value().expose();
    `,
    plan: { transforms: { classes: true } },
    expected: '#method',
    knownFailure: true,
  },
  {
    name: 'private function fields retain distinct identity across instances',
    source: `
 class Value{#method=()=>{};expose(){return this.#method;}}
 globalThis.result=new Value().expose()===new Value().expose();
    `,
    plan: { transforms: { classes: true } },
    expected: false,
    knownFailure: false,
  },

  {
    name: 'private field compound assignment rejects brand before RHS',
    source: `
      const events = [];
      class Value {
        #field;
        static write(object) {
          try {
            object.#field += (events.push('rhs'), 2);
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      Value.write({});
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['TypeError'],
    knownFailure: false,
  },
  {
    name: 'private field assignment preserves RHS exception precedence',
    source: `
      class Value {
        #field;
        static write(object) {
          try {
            object.#field = (() => {
              throw new Error('rhs');
            })();
          } catch (error) {
            return error.message;
          }
        }
      }
      globalThis.result = Value.write({});
    `,
    plan: { transforms: { classes: true } },
    expected: 'rhs',
    knownFailure: true,
  },
  {
    name: 'private field logical assignment rejects brand before RHS',
    source: `
      const events = [];
      class Value {
        #field;
        static write(object) {
          try {
            object.#field ||= (events.push('rhs'), 2);
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      Value.write({});
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['TypeError'],
    knownFailure: false,
  },

  {
    name: 'private field initialization rejects an already branded replacement object',
    source: `
      const events = [];
      let next = 0;
      class Base {
        constructor(object) {
          return object;
        }
      }
      class Stamp extends Base {
        #value = (events.push('init'), ++next);
        after = events.push('after');
        static read(object) {
          return object.#value;
        }
      }
      const object = {};
      new Stamp(object);
      try {
        new Stamp(object);
        events.push('accepted');
      } catch (error) {
        events.push(error.name);
      }
      globalThis.result = [events, Stamp.read(object)];
    `,
    plan: { transforms: { classes: true } },
    expected: [['init', 'after', 'init', 'TypeError'], 1],
    knownFailure: true,
  },
  {
    name: 'private field initialization permits a fresh replacement object',
    source: `
 class Base{constructor(object){return object;}}
 class Stamp extends Base{#value=3;static read(object){return object.#value;}}
 const object={};const value=new Stamp(object);globalThis.result=[value===object,Stamp.read(object)];
    `,
    plan: { transforms: { classes: true } },
    expected: [true, 3],
    knownFailure: false,
  },

  {
    name: 'private setter-only compound assignment rejects before RHS',
    source: `
      const events = [];
      class Value {
        set #value(value) {
          events.push('set');
        }
        run() {
          try {
            this.#value += (events.push('rhs'), 1);
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      new Value().run();
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['TypeError'],
    knownFailure: true,
  },
  {
    name: 'private getter-only assignment evaluates RHS before throwing',
    source: `
      const events = [];
      class Value {
        get #value() {
          return 1;
        }
        run() {
          try {
            this.#value = (events.push('rhs'), 2);
          } catch (error) {
            events.push(error.name);
          }
        }
      }
      new Value().run();
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['rhs', 'TypeError'],
    knownFailure: false,
  },
  {
    name: 'private setter-only simple assignment calls the setter',
    source: `
 const events=[];class Value{set #value(value){events.push(value);}run(){this.#value=2;}}
 new Value().run();globalThis.result=events;
    `,
    plan: { transforms: { classes: true } },
    expected: [2],
    knownFailure: false,
  },
  {
    name: 'private paired accessors support compound assignment',
    source: `
      const events = [];
      class Value {
        get #value() {
          events.push('get');
          return 1;
        }
        set #value(value) {
          events.push(value);
        }
        run() {
          this.#value += (events.push('rhs'), 2);
        }
      }
      new Value().run();
      globalThis.result = events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['get', 'rhs', 3],
    knownFailure: false,
  },
  {
    name: 'nested classes keep shadowed private field references separate',
    source: `
 class Outer{#value=1;run(){class Inner{#value=2;read(){return this.#value;}}return [this.#value,new Inner().read()];}}
 globalThis.result=new Outer().run();
    `,
    plan: { transforms: { classes: true } },
    expected: [1, 2],
    knownFailure: false,
  },
  {
    name: 'nested classes can access unshadowed outer private fields',
    source: `
 class Outer{#value=1;run(){const outer=this;class Inner{read(){return outer.#value;}}return new Inner().read();}}
 globalThis.result=new Outer().run();
    `,
    plan: { transforms: { classes: true } },
    expected: 1,
    knownFailure: false,
  },
  {
    name: 'nested writable fields do not inherit outer private method write restrictions',
    source: `
      class Outer {
        #value() {}
        run() {
          class Inner {
            #value = 1;
            run() {
              this.#value = 2;
              return this.#value;
            }
          }
          try {
            return new Inner().run();
          } catch (error) {
            return error.name;
          }
        }
      }
      globalThis.result = new Outer().run();
    `,
    plan: { transforms: { classes: true } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'nested class heritage sees enclosing private names',
    source: `
      class Outer {
        #value = class {};
        run() {
          const outer = this;
          class Inner extends outer.#value {
            #value = 2;
            read() {
              return this.#value;
            }
          }
          return new Inner().read();
        }
      }
      globalThis.result = new Outer().run();
    `,
    plan: { transforms: { classes: true } },
    expected: 2,
    knownFailure: false,
  },
  {
    name: 'nested private brand checks use the declaring class',
    source: `
      class Outer {
        #value = 1;
        run() {
          const outer = this;
          class Inner {
            #value = 2;
            check(object) {
              return #value in object;
            }
          }
          const inner = new Inner();
          return [inner.check(outer), inner.check(inner)];
        }
      }
      globalThis.result = new Outer().run();
    `,
    plan: { transforms: { classes: true } },
    expected: [false, true],
    knownFailure: false,
  },

  {
    name: 'static field new target is undefined inside outer constructor',
    source: `
 function Factory(){class Value{static value=new.target;}return [Value.value===undefined];}
 globalThis.result=new Factory();
    `,
    plan: { transforms: { classes: true } },
    expected: [true],
    knownFailure: false,
  },

  {
    name: 'class method functions do not own prototype properties',
    source: `
      class Value {
        method() {}
        static method() {}
        get value() {
          return 1;
        }
        set value(value) {}
      }
      const descriptor = Object.getOwnPropertyDescriptor(Value.prototype, 'value');
      globalThis.result = [
        Value.prototype.method,
        Value.method,
        descriptor.get,
        descriptor.set,
      ].map(value => Object.hasOwn(value, 'prototype'));
    `,
    plan: { transforms: { classes: true } },
    expected: [false, false, false, false],
    knownFailure: true,
  },
  {
    name: 'constructing class methods rejects before parameter defaults',
    source: `
 const events=[];class Value{method(value=events.push('default')){}}
 try{new Value.prototype.method();}catch(error){events.push(error.name);}globalThis.result=events;
    `,
    plan: { transforms: { classes: true } },
    expected: ['TypeError'],
    knownFailure: true,
  },

  {
    name: 'private method functions cannot serve as newTarget',
    source: `
      class Value {
        #method() {}
        expose() {
          return this.#method;
        }
      }
      try {
        Reflect.construct(function () {}, [], new Value().expose());
        globalThis.result = 'accepted';
      } catch (error) {
        globalThis.result = error.name;
      }
    `,
    plan: { transforms: { classes: true } },
    expected: 'TypeError',
    knownFailure: true,
  },
  {
    name: 'async class methods retain native nonconstructability',
    source: `
      class Value {
        async method() {}
      }
      try {
        Reflect.construct(function () {}, [], Value.prototype.method);
        globalThis.result = 'accepted';
      } catch (error) {
        globalThis.result = error.name;
      }
    `,
    plan: { transforms: { classes: true } },
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'generator class methods have prototypes but cannot serve as newTarget',
    source: `
 class Value{*method(){}}
 const method=Value.prototype.method;let error;
 try{Reflect.construct(function(){},[],method);}catch(caught){error=caught.name;}
 globalThis.result=[Object.hasOwn(method,'prototype'),error];
    `,
    plan: { transforms: { classes: true } },
    expected: [true, 'TypeError'],
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

    const run = async (input: string) => {
      const context: Record<string, unknown> = {};
      new Function(...Object.keys(bindings), 'globalThis', input)(
        ...Object.values(bindings),
        context,
      );
      return context.result;
    };

    const transformedTest = knownFailure ? test.fails : test;
    transformedTest('transformed execution', async () => {
      expect(await run(code)).toEqual(expected);
    });
  },
);

for (const mode of ['inline', 'runtime'] as const) {
  test.each([
    ['super[key] = rhs()', ['rhs', 'key', 'set:4']],
    ['super[key] += rhs()', ['key', 'get', 'rhs', 'key', 'set:6']],
    ['super[key]++', ['key', 'get', 'key', 'set:3']],
  ])(`super reference keeps raw key conversion order: %s (${mode})`, (write, expected) => {
    const source = `
      const events = [];
      const key = { [Symbol.toPrimitive]() { events.push('key'); return 'value'; } };
      function rhs() { events.push('rhs'); return 4; }
      class Base {
        get value() { events.push('get'); return 2; }
        set value(value) { events.push('set:' + value); }
      }
      class Child extends Base { write() { ${write}; } }
      new Child().write();
      globalThis.result = events;
    `;
    const native: { result?: unknown } = {};
    new Function('globalThis', source)(native);
    expect(native.result).toEqual(expected);
    expect(
      execute<{ result: unknown }>(
        source,
        {
          transforms: { classes: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        },
        { require: createRequire(import.meta.url) },
      ).result,
    ).toEqual(expected);
  });
}

test('private optional chains do not bind intermediate collection receivers', () => {
  const result = execute<{ result: unknown[] }>(
    `class C {
       #items = new Map([['present', [{ paused: true, continue() { return this.paused; } }]]]);
       call(key) { return (this.#items.get(key)?.find(x => x.paused))?.continue(); }
       missing() { return (this.#items.get('missing')?.find(x => x.paused))?.(); }
     }
     const value = new C();
     globalThis.result = [value.call('present'), value.call('missing'), value.missing()];`,
    { transforms: { classProperties: { loose: false } } },
  );
  expect(result.result).toEqual([true, undefined, undefined]);
});

test('static-block lowering retains class binding, super, and inferred names', () => {
  const result = execute<{ result: unknown[] }>(
    `class Base { static value = 4; }
     class C extends Base { static { this.value = super.value + 1; this.self = C; } }
     const Saved = C; C = null;
     const Named = class { static { this.label = this.name; } };
     globalThis.result = [Saved.value, Saved.self === Saved, Named.label];`,
    { transforms: { classStaticBlock: true } },
  );
  expect(result.result).toEqual([5, true, 'Named']);
});
