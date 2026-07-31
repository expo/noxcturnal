import { expect, test } from 'vitest';
import { execute } from './runtime';

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
        privateMethods: { loose: true },
      },
    },
  );
  expect(result.result).toEqual([3, 6]);
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
        privatePropertyInObject: { loose: true },
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
        privateMethods: { loose: true },
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
        privatePropertyInObject: { loose: true },
      },
    },
  );
  expect(result.result).toEqual([true, false, false]);
});
