import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';
const require = createRequire(import.meta.url);

// Explicit current behavior replaces historical reference/audit comparisons.
// Boundary titles describe emitted behavior, including known semantic limits.
function observe(code: string): unknown {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
  } catch (error) {
    return { error: (error as Error).name };
  }
  return context.result;
}

type LoweringBoundary = {
  name: string;
  source: string;
  expected: unknown;
  transform: 'classes' | 'logicalAssignmentOperators';
  runtimeHelper: 'required' | 'forbidden' | 'optional';
};

function expectLoweringBoundary(entry: LoweringBoundary, mode: 'inline' | 'runtime'): void {
  const code = compile(entry.source, {
    transforms: { [entry.transform]: true },
    helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
  });
  const syntax =
    entry.transform === 'logicalAssignmentOperators'
      ? /\|\|=/
      : /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp)\b|\bclass\s*\{/;
  expect(entry.source).toMatch(syntax);
  expect(code).not.toMatch(syntax);
  if (mode === 'inline' || entry.runtimeHelper === 'forbidden')
    expect(code).not.toContain('require(');
  else if (entry.runtimeHelper === 'required') expect(code).toContain('@babel/runtime/helpers/');
  expect(observe(code)).toEqual(entry.expected);
}

describe('private storage and evaluation', () => {
  const cases = [
    {
      name: 'separate class evaluations isolate private brands',
      source: `function make() {
  return class {
    #value = 3;
    static has(object) {
      return #value in object;
    }
  };
}
const First = make(),
  Second = make();
globalThis.result = [First.has(new First()), First.has(new Second())];`,
      expected: [true, false],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private methods share identity across instances',
      source: `class Value {
  #method() {}
  expose() {
    return this.#method;
  }
}
globalThis.result = new Value().expose() === new Value().expose();`,
      expected: true,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private methods are installed before fields',
      source: `class Value {
  field = this.#method();
  #method() {
    return 3;
  }
}
try {
  globalThis.result = new Value().field;
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'invalid loose-private writes reject before the right-hand side',
      source: `const events = [];
class Value {
  #field;
  static write(object) {
    try {
      object.#field = (events.push('rhs'), 2);
    } catch (e) {
      events.push(e.name);
    }
  }
}
Value.write({});
globalThis.result = events;`,
      expected: ['TypeError'],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'repeated private initialization is accepted',
      source: `class Base {
  constructor(object) {
    return object;
  }
}
class Stamp extends Base {
  #value = 1;
}
const object = {};
new Stamp(object);
try {
  new Stamp(object);
  globalThis.result = 'accepted';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'accepted',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'setter-only private access reads undefined',
      source: `class Value {
  set #value(value) {}
  run() {
    try {
      return this.#value;
    } catch (e) {
      return e.name;
    }
  }
}
globalThis.result = new Value().run();`,
      expected: undefined,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private callee is fetched before arguments',
      source: `class Value {
  #method = () => 1;
  run() {
    return this.#method(this.#method = () => 2);
  }
}
globalThis.result = new Value().run();`,
      expected: 1,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'read-only private method writes retain RHS effects',
      source: `const events = [];
class Value {
  #method() {}
  run() {
    try {
      this.#method = (events.push('rhs'), 1);
    } catch (e) {
      events.push(e.name);
    }
  }
}
new Value().run();
globalThis.result = events;`,
      expected: ['rhs', 'TypeError'],
      transform: 'classes',
      runtimeHelper: 'required',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});

describe('private initialization and class evaluation', () => {
  const cases = [
    {
      name: 'heritage expressions retain surrounding sloppy assignment behavior',
      source: `const target = Object.freeze({
  value: 1
});
try {
  class Value extends (target.value = 2, Object) {}
  globalThis.result = 'accepted';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'accepted',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'named heritage expressions resolve the outer binding',
      source: `let Base = class {};
try {
  const C = class Base extends Base {};
  globalThis.result = 'success';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'success',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'static field calls later private method',
      source: `class Value {
  static result = this.#read();
  static #read() {
    return 3;
  }
}
globalThis.result = Value.result;`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'static field reads later private accessor',
      source: `class Value {
  static result = this.#read;
  static get #read() {
    return 3;
  }
}
globalThis.result = Value.result;`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'static private brands isolate class evaluations',
      source: `function make() {
  return class {
    static #value = 3;
    static has(object) {
      return #value in object;
    }
  };
}
const First = make(),
  Second = make();
globalThis.result = [First.has(First), First.has(Second)];`,
      expected: [true, false],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'instance field reads later private accessor',
      source: `class Value {
  result = this.#read;
  get #read() {
    return 3;
  }
}
globalThis.result = new Value().result;`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});

describe('super evaluation', () => {
  const cases = [
    {
      name: 'dynamic super constructor',
      source: `class Base {
  constructor() {
    this.value = 1;
  }
}
function Other() {
  this.value = 2;
}
class Child extends Base {
  constructor() {
    super();
  }
}
Object.setPrototypeOf(Child, Other);
globalThis.result = new Child().value;`,
      expected: 2,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'unsuccessful strict super write',
      source: `class Base {}
Object.defineProperty(Base.prototype, 'value', {
  value: 1,
  writable: false
});
class Child extends Base {
  write() {
    try {
      super.value = 3;
      return 'accepted';
    } catch (e) {
      return e.name;
    }
  }
}
globalThis.result = new Child().write();`,
      expected: 'TypeError',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'super write wrapper binding collision',
      source: `class Base {}
class Child extends Base {
  write(_value) {
    return super.value = _value;
  }
}
globalThis.result = new Child().write(3);`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'super write keeps generator suspension',
      source: `class Base {}
class Child extends Base {
  *write() {
    return super.value = yield 1;
  }
}
const iterator = new Child().write();
globalThis.result = [iterator.next().value, iterator.next(3).value];`,
      expected: [1, 3],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'super base selection precedes computed-key coercion',
      source: `class Base {
  get value() {
    return 1;
  }
}
class Other {
  get value() {
    return 2;
  }
}
class Child extends Base {
  read(key) {
    return super[key];
  }
}
const key = {
  [Symbol.toPrimitive]() {
    Object.setPrototypeOf(Child.prototype, Other.prototype);
    return 'value';
  }
};
globalThis.result = new Child().read(key);`,
      expected: 1,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'a lowered super tagged call loses its receiver',
      source: `class Base {
  tag() {
    return this.value;
  }
}
class Child extends Base {
  read() {
    this.value = 3;
    return super.tag\`text\`;
  }
}
try {
  globalThis.result = new Child().read();
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'TypeError',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'derived parameter closure this binding',
      source: `class Base {}
class Child extends Base {
  constructor(value = () => this) {
    super();
    this.matches = value() === this;
  }
}
globalThis.result = new Child().matches;`,
      expected: true,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'base field new.target resolves to the constructor',
      source: `class Value {
  value = new.target;
}
globalThis.result = new Value().value === undefined;`,
      expected: false,
      transform: 'classes',
      runtimeHelper: 'forbidden',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});

describe('class binding environments', () => {
  const cases = [
    {
      name: 'base field preserves outer parameter binding',
      source: `const value = 'outer';
class Example {
  field = value;
  constructor(value) {}
}
globalThis.result = new Example('parameter').field;`,
      expected: 'outer',
      transform: 'classes',
      runtimeHelper: 'forbidden',
    },
    {
      name: 'computed class keys retain surrounding sloppy assignment behavior',
      source: `const target = Object.freeze({
  value: 1
});
try {
  class Example {
    [target.value = 2]() {}
  }
  globalThis.result = 'accepted';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'accepted',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'named computed class keys resolve the outer binding',
      source: `const Value = 'outer';
try {
  const C = class Value {
    [Value]() {}
  };
  globalThis.result = 'accepted';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'accepted',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'method parameter default super property',
      source: `class Base {
  get value() {
    return 3;
  }
}
class Value extends Base {
  run(value = super.value) {
    return value;
  }
}
globalThis.result = new Value().run();`,
      expected: 3,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'implicit base class super property',
      source: `class Value {
  run() {
    return super.toString();
  }
}
globalThis.result = new Value().run();`,
      expected: '[object Object]',
      transform: 'classes',
      runtimeHelper: 'required',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});

describe('class construction', () => {
  const cases = [
    {
      name: 'later key expressions run before earlier key coercion',
      source: `const events = [];
const key = {
  toString() {
    events.push('coerce');
    return 'first';
  }
};
class Value {
  [key]() {}
  [(events.push('next'), 'second')]() {}
}
globalThis.result = events;`,
      expected: ['next', 'coerce'],
      transform: 'classes',
      runtimeHelper: 'optional',
    },
    {
      name: 'duplicate super calls complete without a rebinding error',
      source: `const events = [];
class Base {
  constructor() {
    events.push('base');
  }
}
class Child extends Base {
  constructor() {
    super();
    try {
      super();
    } catch (e) {
      events.push(e.name);
    }
  }
}
new Child();
globalThis.result = events;`,
      expected: ['base', 'base'],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'this access before super rejects',
      source: `class Base {}
class Child extends Base {
  constructor() {
    try {
      this.value = 1;
      globalThis.result = false;
    } catch (e) {
      globalThis.result = true;
    }
    super();
  }
}
new Child();`,
      expected: true,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'lowered ordinary methods are accepted as a newTarget',
      source: `class Value {
  method() {}
}
try {
  Reflect.construct(function () {}, [], Value.prototype.method);
  globalThis.result = 'accepted';
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: 'accepted',
      transform: 'classes',
      runtimeHelper: 'optional',
    },
    {
      name: 'lowered ordinary methods have a prototype',
      source: `class Value {
  method() {}
}
globalThis.result = Object.hasOwn(Value.prototype.method, 'prototype');`,
      expected: true,
      transform: 'classes',
      runtimeHelper: 'optional',
    },
    {
      name: 'constructor defaults execute before a plain-call error',
      source: `const events = [];
class Value {
  constructor(value = events.push('default')) {}
}
try {
  Value();
} catch (e) {
  events.push(e.name);
}
globalThis.result = events;`,
      expected: ['default', 'TypeError'],
      transform: 'classes',
      runtimeHelper: 'optional',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});

describe('private operations', () => {
  const cases = [
    {
      name: 'reentrant logical defaults overwrite the first receiver temporary',
      source: `let recurse = true,
  second;
class Value {
  constructor() {
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
  static write(obj, value = obj.self().#value ||= 3) {
    return value;
  }
}
const first = new Value();
second = new Value();
Value.write(first);
globalThis.result = [first.stored, second.stored];`,
      expected: [0, 3],
      transform: 'logicalAssignmentOperators',
      runtimeHelper: 'optional',
    },
    {
      name: 'private method compound RHS coercion',
      source: `const events = [];
class Value {
  #method() {}
  run() {
    this.#method.valueOf = () => {
      events.push('convert');
      return 1;
    };
    try {
      this.#method += (events.push('rhs'), 2);
    } catch (e) {
      events.push(e.name);
    }
  }
}
new Value().run();
globalThis.result = events;`,
      expected: ['rhs', 'convert', 'TypeError'],
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private method logical short circuit',
      source: `class Value {
  #method() {}
  run() {
    return (this.#method ||= 3) === this.#method;
  }
}
try {
  globalThis.result = new Value().run();
} catch (e) {
  globalThis.result = e.name;
}`,
      expected: true,
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private call own apply',
      source: `class Value {
  #method() {
    return 'method';
  }
  run() {
    this.#method.apply = () => 'override';
    return this.#method();
  }
}
globalThis.result = new Value().run();`,
      expected: 'method',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private noncallable with apply',
      source: `class Value {
  #field = {
    apply() {
      return 'called';
    }
  };
  run() {
    try {
      return this.#field();
    } catch (e) {
      return e.name;
    }
  }
}
globalThis.result = new Value().run();`,
      expected: 'TypeError',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'direct eval cannot recover the lowered private environment',
      source: `class Value {
  #value = 3;
  read() {
    try {
      return eval('this.#value');
    } catch (e) {
      return e.name;
    }
  }
}
globalThis.result = new Value().read();`,
      expected: 'SyntaxError',
      transform: 'classes',
      runtimeHelper: 'optional',
    },
    {
      name: 'direct eval cannot recover the lowered super environment',
      source: `class Base {
  get value() {
    return 3;
  }
}
class Child extends Base {
  read() {
    try {
      return eval('super.value');
    } catch (e) {
      return e.name;
    }
  }
}
globalThis.result = new Child().read();`,
      expected: 'SyntaxError',
      transform: 'classes',
      runtimeHelper: 'required',
    },
    {
      name: 'private logical receiver mutation',
      source: `const events = [];
let receiver;
class Value {
  constructor(name) {
    this.name = name;
  }
  get #value() {
    receiver = second;
    return 0;
  }
  set #value(value) {
    events.push(this.name, value);
  }
  static write() {
    return receiver.#value ||= 3;
  }
}
const first = new Value('first'),
  second = new Value('second');
receiver = first;
Value.write();
globalThis.result = events;`,
      expected: ['first', 3],
      transform: 'logicalAssignmentOperators',
      runtimeHelper: 'optional',
    },
  ] as const;
  for (const entry of cases) {
    test.each(['inline', 'runtime'] as const)(entry.name + ', helpers=%s', mode => {
      expectLoweringBoundary(entry, mode);
    });
  }
});
