import { expect, test } from 'vitest';
import { execute } from './runtime';

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
  '$mode static field initializers preserve Babel this and super semantics',
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
  '$mode instance field initializers preserve Babel this and super semantics',
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
