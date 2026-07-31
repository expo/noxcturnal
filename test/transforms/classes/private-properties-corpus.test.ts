// Generated from apps/test-suite/tests/JSPrivateProperties.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Private Properties > private field declaration and access > basic private field with initializer', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 42;\n          get() {\n            return this.#x;\n          }\n        }\n        expect(new Foo().get()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 42,
          });
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      expect(new Foo().get()).toBe(42);
    };"
  `);
});

test('002 JS Private Properties > private field declaration and access > private field without initializer is undefined', async () => {
  const source =
    '() => {\n        class Foo {\n          #x;\n          get() {\n            return this.#x;\n          }\n        }\n        expect(new Foo().get()).toBeUndefined();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      expect(new Foo().get()).toBeUndefined();
    };"
  `);
});

test('003 JS Private Properties > private field declaration and access > private field initialized from constructor parameter', async () => {
  const source =
    '() => {\n        class Foo {\n          #x;\n          constructor(x) {\n            this.#x = x;\n          }\n          get() {\n            return this.#x;\n          }\n        }\n        expect(new Foo(42).get()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor(x) {
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _x)[_x] = x;
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      expect(new Foo(42).get()).toBe(42);
    };"
  `);
});

test('004 JS Private Properties > private field declaration and access > private field read and write', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 0;\n          inc() {\n            this.#x++;\n          }\n          get() {\n            return this.#x;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.get()).toBe(0);\n        foo.inc();\n        expect(foo.get()).toBe(1);\n        foo.inc();\n        expect(foo.get()).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 0,
          });
        }
        inc() {
          _classPrivateFieldLooseBase(this, _x)[_x]++;
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      const foo = new Foo();
      expect(foo.get()).toBe(0);
      foo.inc();
      expect(foo.get()).toBe(1);
      foo.inc();
      expect(foo.get()).toBe(2);
    };"
  `);
});

test('005 JS Private Properties > private field declaration and access > multiple private fields', async () => {
  const source =
    "() => {\n        class Point {\n          #x;\n          #y;\n          constructor(x, y) {\n            this.#x = x;\n            this.#y = y;\n          }\n          toString() {\n            return `(${this.#x}, ${this.#y})`;\n          }\n        }\n        expect(new Point(1, 2).toString()).toBe('(1, 2)');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
      class Point {
        constructor(x, y) {
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
          Object.defineProperty(this, _y, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _x)[_x] = x;
          _classPrivateFieldLooseBase(this, _y)[_y] = y;
        }
        toString() {
          return \`(\${_classPrivateFieldLooseBase(this, _x)[_x]}, \${_classPrivateFieldLooseBase(this, _y)[_y]})\`;
        }
      }
      expect(new Point(1, 2).toString()).toBe('(1, 2)');
    };"
  `);
});

test('006 JS Private Properties > private field declaration and access > private field with various value types', async () => {
  const source =
    "() => {\n        class Store {\n          #num = 42;\n          #str = 'hello';\n          #bool = true;\n          #nil = null;\n          #undef = undefined;\n          #arr = [1, 2, 3];\n          #obj = { a: 1 };\n          #fn = (x) => x * 2;\n          values() {\n            return {\n              num: this.#num,\n              str: this.#str,\n              bool: this.#bool,\n              nil: this.#nil,\n              undef: this.#undef,\n              arr: this.#arr,\n              obj: this.#obj,\n              fn: this.#fn(5),\n            };\n          }\n        }\n        const v = new Store().values();\n        expect(v.num).toBe(42);\n        expect(v.str).toBe('hello');\n        expect(v.bool).toBe(true);\n        expect(v.nil).toBe(null);\n        expect(v.undef).toBeUndefined();\n        expect(v.arr).toEqual([1, 2, 3]);\n        expect(v.obj).toEqual({ a: 1 });\n        expect(v.fn).toBe(10);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _num = /* @__PURE__ */ _classPrivateFieldLooseKey('num');
      var _str = /* @__PURE__ */ _classPrivateFieldLooseKey('str');
      var _bool = /* @__PURE__ */ _classPrivateFieldLooseKey('bool');
      var _nil = /* @__PURE__ */ _classPrivateFieldLooseKey('nil');
      var _undef = /* @__PURE__ */ _classPrivateFieldLooseKey('undef');
      var _arr = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');
      var _obj = /* @__PURE__ */ _classPrivateFieldLooseKey('obj');
      var _fn = /* @__PURE__ */ _classPrivateFieldLooseKey('fn');
      class Store {
        constructor() {
          Object.defineProperty(this, _num, {
            writable: true,
            value: 42,
          });
          Object.defineProperty(this, _str, {
            writable: true,
            value: 'hello',
          });
          Object.defineProperty(this, _bool, {
            writable: true,
            value: true,
          });
          Object.defineProperty(this, _nil, {
            writable: true,
            value: null,
          });
          Object.defineProperty(this, _undef, {
            writable: true,
            value: undefined,
          });
          Object.defineProperty(this, _arr, {
            writable: true,
            value: [1, 2, 3],
          });
          Object.defineProperty(this, _obj, {
            writable: true,
            value: { a: 1 },
          });
          Object.defineProperty(this, _fn, {
            writable: true,
            value: x => x * 2,
          });
        }
        values() {
          return {
            num: _classPrivateFieldLooseBase(this, _num)[_num],
            str: _classPrivateFieldLooseBase(this, _str)[_str],
            bool: _classPrivateFieldLooseBase(this, _bool)[_bool],
            nil: _classPrivateFieldLooseBase(this, _nil)[_nil],
            undef: _classPrivateFieldLooseBase(this, _undef)[_undef],
            arr: _classPrivateFieldLooseBase(this, _arr)[_arr],
            obj: _classPrivateFieldLooseBase(this, _obj)[_obj],
            fn: _classPrivateFieldLooseBase(this, _fn)[_fn](5),
          };
        }
      }
      const v = new Store().values();
      expect(v.num).toBe(42);
      expect(v.str).toBe('hello');
      expect(v.bool).toBe(true);
      expect(v.nil).toBe(null);
      expect(v.undef).toBeUndefined();
      expect(v.arr).toEqual([1, 2, 3]);
      expect(v.obj).toEqual({ a: 1 });
      expect(v.fn).toBe(10);
    };"
  `);
});

test('007 JS Private Properties > private field declaration and access > private field with computed initializer', async () => {
  const source =
    '() => {\n        let counter = 0;\n        class Foo {\n          #x = ++counter;\n          get() {\n            return this.#x;\n          }\n        }\n        const a = new Foo();\n        const b = new Foo();\n        expect(a.get()).toBe(1);\n        expect(b.get()).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      let counter = 0;
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: ++counter,
          });
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      const a = new Foo();
      const b = new Foo();
      expect(a.get()).toBe(1);
      expect(b.get()).toBe(2);
    };"
  `);
});

test('008 JS Private Properties > private field declaration and access > private field initializer runs per instance', async () => {
  const source =
    '() => {\n        class Foo {\n          #arr = [];\n          push(val) {\n            this.#arr.push(val);\n          }\n          get() {\n            return this.#arr;\n          }\n        }\n        const a = new Foo();\n        const b = new Foo();\n        a.push(1);\n        b.push(2);\n        expect(a.get()).toEqual([1]);\n        expect(b.get()).toEqual([2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _arr = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');
      class Foo {
        constructor() {
          Object.defineProperty(this, _arr, {
            writable: true,
            value: [],
          });
        }
        push(val) {
          _classPrivateFieldLooseBase(this, _arr)[_arr].push(val);
        }
        get() {
          return _classPrivateFieldLooseBase(this, _arr)[_arr];
        }
      }
      const a = new Foo();
      const b = new Foo();
      a.push(1);
      b.push(2);
      expect(a.get()).toEqual([1]);
      expect(b.get()).toEqual([2]);
    };"
  `);
});

test('009 JS Private Properties > private field declaration and access > private field not visible via Object.keys', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          y = 2;\n        }\n        const keys = Object.keys(new Foo());\n        expect(keys.length).toBe(1);\n        expect(keys[0]).toBe('y');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
          this.y = 2;
        }
      }
      const keys = Object.keys(new Foo());
      expect(keys.length).toBe(1);
      expect(keys[0]).toBe('y');
    };"
  `);
});

test('010 JS Private Properties > private field declaration and access > private field not visible via for-in', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          y = 2;\n        }\n        const keys = [];\n        for (const k in new Foo()) {\n          keys.push(k);\n        }\n        expect(keys.indexOf('y') >= 0).toBe(true);\n        expect(keys.indexOf('#x')).toBe(-1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
          this.y = 2;
        }
      }
      const keys = [];
      for (const k in new Foo()) {
        keys.push(k);
      }
      expect(keys.indexOf('y') >= 0).toBe(true);
      expect(keys.indexOf('#x')).toBe(-1);
    };"
  `);
});

test('011 JS Private Properties > private field declaration and access > private field not visible in JSON.stringify', async () => {
  const source =
    "() => {\n        class Foo {\n          #secret = 'hidden';\n          pub = 'visible';\n        }\n        const json = JSON.parse(JSON.stringify(new Foo()));\n        expect(json.pub).toBe('visible');\n        expect(Object.keys(json).length).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _secret = /* @__PURE__ */ _classPrivateFieldLooseKey('secret');
      class Foo {
        constructor() {
          Object.defineProperty(this, _secret, {
            writable: true,
            value: 'hidden',
          });
          this.pub = 'visible';
        }
      }
      const json = JSON.parse(JSON.stringify(new Foo()));
      expect(json.pub).toBe('visible');
      expect(Object.keys(json).length).toBe(1);
    };"
  `);
});

test('012 JS Private Properties > private field declaration and access > private field access from outside throws', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n        }\n        const foo = new Foo();\n        // Accessing via bracket notation with the string '#x' just returns undefined\n        // (it's a different property name, not the private field)\n        expect(foo['#x']).toBeUndefined();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        }
      }
      const foo = new Foo();
      // Accessing via bracket notation with the string '#x' just returns undefined
      // (it's a different property name, not the private field)
      expect(foo['#x']).toBeUndefined();
    };"
  `);
});

test('013 JS Private Properties > private field mutation > compound assignment operators', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 10;\n          addAssign(n) {\n            this.#x += n;\n          }\n          subAssign(n) {\n            this.#x -= n;\n          }\n          mulAssign(n) {\n            this.#x *= n;\n          }\n          get() {\n            return this.#x;\n          }\n        }\n        const foo = new Foo();\n        foo.addAssign(5);\n        expect(foo.get()).toBe(15);\n        foo.subAssign(3);\n        expect(foo.get()).toBe(12);\n        foo.mulAssign(2);\n        expect(foo.get()).toBe(24);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 10,
          });
        }
        addAssign(n) {
          _classPrivateFieldLooseBase(this, _x)[_x] += n;
        }
        subAssign(n) {
          _classPrivateFieldLooseBase(this, _x)[_x] -= n;
        }
        mulAssign(n) {
          _classPrivateFieldLooseBase(this, _x)[_x] *= n;
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      const foo = new Foo();
      foo.addAssign(5);
      expect(foo.get()).toBe(15);
      foo.subAssign(3);
      expect(foo.get()).toBe(12);
      foo.mulAssign(2);
      expect(foo.get()).toBe(24);
    };"
  `);
});

test('014 JS Private Properties > private field mutation > prefix and postfix increment/decrement', async () => {
  const source =
    '() => {\n        class Counter {\n          #x = 0;\n          preInc() {\n            return ++this.#x;\n          }\n          postInc() {\n            return this.#x++;\n          }\n          preDec() {\n            return --this.#x;\n          }\n          postDec() {\n            return this.#x--;\n          }\n          get() {\n            return this.#x;\n          }\n        }\n        const c = new Counter();\n        expect(c.preInc()).toBe(1);\n        expect(c.get()).toBe(1);\n        expect(c.postInc()).toBe(1);\n        expect(c.get()).toBe(2);\n        expect(c.preDec()).toBe(1);\n        expect(c.get()).toBe(1);\n        expect(c.postDec()).toBe(1);\n        expect(c.get()).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Counter {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 0,
          });
        }
        preInc() {
          return ++_classPrivateFieldLooseBase(this, _x)[_x];
        }
        postInc() {
          return _classPrivateFieldLooseBase(this, _x)[_x]++;
        }
        preDec() {
          return --_classPrivateFieldLooseBase(this, _x)[_x];
        }
        postDec() {
          return _classPrivateFieldLooseBase(this, _x)[_x]--;
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      const c = new Counter();
      expect(c.preInc()).toBe(1);
      expect(c.get()).toBe(1);
      expect(c.postInc()).toBe(1);
      expect(c.get()).toBe(2);
      expect(c.preDec()).toBe(1);
      expect(c.get()).toBe(1);
      expect(c.postDec()).toBe(1);
      expect(c.get()).toBe(0);
    };"
  `);
});

test('015 JS Private Properties > private field mutation > logical assignment operators', async () => {
  const source =
    "() => {\n        class Foo {\n          #a = null;\n          #b = 0;\n          #c = '';\n          nullishAssign(val) {\n            this.#a ??= val;\n          }\n          orAssign(val) {\n            this.#b ||= val;\n          }\n          andAssign(val) {\n            this.#c &&= val;\n          }\n          values() {\n            return [this.#a, this.#b, this.#c];\n          }\n        }\n        const foo = new Foo();\n        foo.nullishAssign(42);\n        foo.orAssign(7);\n        foo.andAssign('replaced');\n        expect(foo.values()).toEqual([42, 7, '']);\n        // #a is no longer null, so ??= is a no-op\n        foo.nullishAssign(100);\n        expect(foo.values()[0]).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');
      var _b = /* @__PURE__ */ _classPrivateFieldLooseKey('b');
      var _c = /* @__PURE__ */ _classPrivateFieldLooseKey('c');
      class Foo {
        constructor() {
          Object.defineProperty(this, _a, {
            writable: true,
            value: null,
          });
          Object.defineProperty(this, _b, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _c, {
            writable: true,
            value: '',
          });
        }
        nullishAssign(val) {
          _classPrivateFieldLooseBase(this, _a)[_a] ??= val;
        }
        orAssign(val) {
          _classPrivateFieldLooseBase(this, _b)[_b] ||= val;
        }
        andAssign(val) {
          _classPrivateFieldLooseBase(this, _c)[_c] &&= val;
        }
        values() {
          return [
            _classPrivateFieldLooseBase(this, _a)[_a],
            _classPrivateFieldLooseBase(this, _b)[_b],
            _classPrivateFieldLooseBase(this, _c)[_c],
          ];
        }
      }
      const foo = new Foo();
      foo.nullishAssign(42);
      foo.orAssign(7);
      foo.andAssign('replaced');
      expect(foo.values()).toEqual([42, 7, '']);
      // #a is no longer null, so ??= is a no-op
      foo.nullishAssign(100);
      expect(foo.values()[0]).toBe(42);
    };"
  `);
});

test('016 JS Private Properties > private field mutation > destructuring assignment to private field', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 0;\n          #y = 0;\n          assign(obj) {\n            ({ x: this.#x, y: this.#y } = obj);\n          }\n          get() {\n            return [this.#x, this.#y];\n          }\n        }\n        const foo = new Foo();\n        foo.assign({ x: 10, y: 20 });\n        expect(foo.get()).toEqual([10, 20]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _y, {
            writable: true,
            value: 0,
          });
        }
        assign(obj) {
          ({
            x: _classPrivateFieldLooseBase(this, _x)[_x],
            y: _classPrivateFieldLooseBase(this, _y)[_y],
          } = obj);
        }
        get() {
          return [_classPrivateFieldLooseBase(this, _x)[_x], _classPrivateFieldLooseBase(this, _y)[_y]];
        }
      }
      const foo = new Foo();
      foo.assign({
        x: 10,
        y: 20,
      });
      expect(foo.get()).toEqual([10, 20]);
    };"
  `);
});

test('017 JS Private Properties > static private fields > basic static private field', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 42;\n          static get() {\n            return Foo.#x;\n          }\n        }\n        expect(Foo.get()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        static get() {
          return _classPrivateFieldLooseBase(Foo, _x)[_x];
        }
      }
      Object.defineProperty(Foo, _x, {
        writable: true,
        value: 42,
      });
      expect(Foo.get()).toBe(42);
    };"
  `);
});

test('018 JS Private Properties > static private fields > static private field mutation', async () => {
  const source =
    '() => {\n        class Counter {\n          static #count = 0;\n          static inc() {\n            Counter.#count++;\n          }\n          static get() {\n            return Counter.#count;\n          }\n        }\n        expect(Counter.get()).toBe(0);\n        Counter.inc();\n        expect(Counter.get()).toBe(1);\n        Counter.inc();\n        expect(Counter.get()).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _count = /* @__PURE__ */ _classPrivateFieldLooseKey('count');
      class Counter {
        static inc() {
          _classPrivateFieldLooseBase(Counter, _count)[_count]++;
        }
        static get() {
          return _classPrivateFieldLooseBase(Counter, _count)[_count];
        }
      }
      Object.defineProperty(Counter, _count, {
        writable: true,
        value: 0,
      });
      expect(Counter.get()).toBe(0);
      Counter.inc();
      expect(Counter.get()).toBe(1);
      Counter.inc();
      expect(Counter.get()).toBe(2);
    };"
  `);
});

test('019 JS Private Properties > static private fields > static private field accessed via this in static method', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 99;\n          static get() {\n            return this.#x;\n          }\n        }\n        expect(Foo.get()).toBe(99);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        static get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      Object.defineProperty(Foo, _x, {
        writable: true,
        value: 99,
      });
      expect(Foo.get()).toBe(99);
    };"
  `);
});

test('020 JS Private Properties > static private fields > static private field not accessible from instance', async () => {
  const source =
    "() => {\n        class Foo {\n          static #x = 42;\n          tryAccess() {\n            // Can't do this.#x for static from instance — use class name\n            return Foo.#x;\n          }\n        }\n        expect(new Foo().tryAccess()).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        tryAccess() {
          // Can't do this.#x for static from instance — use class name
          return _classPrivateFieldLooseBase(Foo, _x)[_x];
        }
      }
      Object.defineProperty(Foo, _x, {
        writable: true,
        value: 42,
      });
      expect(new Foo().tryAccess()).toBe(42);
    };"
  `);
});

test('021 JS Private Properties > static private fields > static private field with computed initializer', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = [1, 2, 3].reduce((a, b) => a + b, 0);\n          static get() {\n            return Foo.#x;\n          }\n        }\n        expect(Foo.get()).toBe(6);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        static get() {
          return _classPrivateFieldLooseBase(Foo, _x)[_x];
        }
      }
      Object.defineProperty(Foo, _x, {
        writable: true,
        value: [1, 2, 3].reduce((a, b) => a + b, 0),
      });
      expect(Foo.get()).toBe(6);
    };"
  `);
});

test('022 JS Private Properties > private field inheritance > subclass does not inherit parent private field', async () => {
  const source =
    "() => {\n        class Base {\n          #x = 1;\n          getBase() {\n            return this.#x;\n          }\n        }\n        class Child extends Base {\n          getChild() {\n            // Cannot access this.#x — it belongs to Base\n            return typeof this['#x'];\n          }\n        }\n        const child = new Child();\n        expect(child.getBase()).toBe(1);\n        expect(child.getChild()).toBe('undefined');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Base {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        }
        getBase() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      class Child extends Base {
        getChild() {
          // Cannot access this.#x — it belongs to Base
          return typeof this['#x'];
        }
      }
      const child = new Child();
      expect(child.getBase()).toBe(1);
      expect(child.getChild()).toBe('undefined');
    };"
  `);
});

test('023 JS Private Properties > private field inheritance > subclass can have same-named private field', async () => {
  const source =
    "() => {\n        class Base {\n          #x = 'base';\n          getBaseX() {\n            return this.#x;\n          }\n        }\n        class Child extends Base {\n          #x = 'child';\n          getChildX() {\n            return this.#x;\n          }\n        }\n        const child = new Child();\n        expect(child.getBaseX()).toBe('base');\n        expect(child.getChildX()).toBe('child');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Base {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 'base',
          });
        }
        getBaseX() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      var _x2 = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Child extends Base {
        constructor(..._args) {
          super(..._args);
          Object.defineProperty(this, _x2, {
            writable: true,
            value: 'child',
          });
        }
        getChildX() {
          return _classPrivateFieldLooseBase(this, _x2)[_x2];
        }
      }
      const child = new Child();
      expect(child.getBaseX()).toBe('base');
      expect(child.getChildX()).toBe('child');
    };"
  `);
});

test('024 JS Private Properties > private field inheritance > subclass constructor can set parent private field via inherited method', async () => {
  const source =
    '() => {\n        class Base {\n          #x;\n          setX(val) {\n            this.#x = val;\n          }\n          getX() {\n            return this.#x;\n          }\n        }\n        class Child extends Base {\n          constructor(val) {\n            super();\n            this.setX(val);\n          }\n        }\n        expect(new Child(42).getX()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Base {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
        }
        setX(val) {
          _classPrivateFieldLooseBase(this, _x)[_x] = val;
        }
        getX() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      class Child extends Base {
        constructor(val) {
          super();
          this.setX(val);
        }
      }
      expect(new Child(42).getX()).toBe(42);
    };"
  `);
});

test('025 JS Private Properties > private field inheritance > private field per-instance with subclass', async () => {
  const source =
    '() => {\n        class Base {\n          #items = [];\n          push(val) {\n            this.#items.push(val);\n          }\n          get() {\n            return this.#items;\n          }\n        }\n        class Child extends Base {}\n        const a = new Child();\n        const b = new Child();\n        a.push(1);\n        b.push(2);\n        expect(a.get()).toEqual([1]);\n        expect(b.get()).toEqual([2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _items = /* @__PURE__ */ _classPrivateFieldLooseKey('items');
      class Base {
        constructor() {
          Object.defineProperty(this, _items, {
            writable: true,
            value: [],
          });
        }
        push(val) {
          _classPrivateFieldLooseBase(this, _items)[_items].push(val);
        }
        get() {
          return _classPrivateFieldLooseBase(this, _items)[_items];
        }
      }
      class Child extends Base {}
      const a = new Child();
      const b = new Child();
      a.push(1);
      b.push(2);
      expect(a.get()).toEqual([1]);
      expect(b.get()).toEqual([2]);
    };"
  `);
});

test('026 JS Private Properties > private field interactions > private field with public field', async () => {
  const source =
    "() => {\n        class Foo {\n          #priv = 'private';\n          pub = 'public';\n          get() {\n            return this.#priv + ' ' + this.pub;\n          }\n        }\n        expect(new Foo().get()).toBe('private public');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _priv = /* @__PURE__ */ _classPrivateFieldLooseKey('priv');
      class Foo {
        constructor() {
          Object.defineProperty(this, _priv, {
            writable: true,
            value: 'private',
          });
          this.pub = 'public';
        }
        get() {
          return _classPrivateFieldLooseBase(this, _priv)[_priv] + ' ' + this.pub;
        }
      }
      expect(new Foo().get()).toBe('private public');
    };"
  `);
});

test('027 JS Private Properties > private field interactions > private field initialization order', async () => {
  const source =
    "() => {\n        const order = [];\n        class Foo {\n          #a = (order.push('a'), 1);\n          b = (order.push('b'), 2);\n          #c = (order.push('c'), 3);\n          d = (order.push('d'), 4);\n          getOrder() {\n            return order;\n          }\n        }\n        new Foo();\n        expect(order).toEqual(['a', 'b', 'c', 'd']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      const order = [];
      var _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');
      var _c = /* @__PURE__ */ _classPrivateFieldLooseKey('c');
      class Foo {
        constructor() {
          Object.defineProperty(this, _a, {
            writable: true,
            value: (order.push('a'), 1),
          });
          this.b = (order.push('b'), 2);
          Object.defineProperty(this, _c, {
            writable: true,
            value: (order.push('c'), 3),
          });
          this.d = (order.push('d'), 4);
        }
        getOrder() {
          return order;
        }
      }
      new Foo();
      expect(order).toEqual(['a', 'b', 'c', 'd']);
    };"
  `);
});

test('028 JS Private Properties > private field interactions > private field with constructor', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 10;\n          constructor() {\n            this.#x += 5;\n          }\n          get() {\n            return this.#x;\n          }\n        }\n        expect(new Foo().get()).toBe(15);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 10,
          });
          _classPrivateFieldLooseBase(this, _x)[_x] += 5;
        }
        get() {
          return _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      expect(new Foo().get()).toBe(15);
    };"
  `);
});

test('029 JS Private Properties > private field interactions > private field with super constructor', async () => {
  const source =
    '() => {\n        class Base {\n          constructor(val) {\n            this.baseVal = val;\n          }\n        }\n        class Child extends Base {\n          #x;\n          constructor(a, b) {\n            super(a);\n            this.#x = b;\n          }\n          get() {\n            return this.baseVal + this.#x;\n          }\n        }\n        expect(new Child(10, 32).get()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      class Base {
        constructor(val) {
          this.baseVal = val;
        }
      }
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Child extends Base {
        constructor(a, b) {
          super(a);
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _x)[_x] = b;
        }
        get() {
          return this.baseVal + _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      expect(new Child(10, 32).get()).toBe(42);
    };"
  `);
});

test('030 JS Private Properties > private field interactions > private field used in method with destructuring', async () => {
  const source =
    "() => {\n        class Config {\n          #defaults = { color: 'blue', size: 10 };\n          merge(overrides) {\n            return { ...this.#defaults, ...overrides };\n          }\n        }\n        const c = new Config();\n        expect(c.merge({ size: 20 })).toEqual({ color: 'blue', size: 20 });\n        expect(c.merge({})).toEqual({ color: 'blue', size: 10 });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _defaults = /* @__PURE__ */ _classPrivateFieldLooseKey('defaults');
      class Config {
        constructor() {
          Object.defineProperty(this, _defaults, {
            writable: true,
            value: {
              color: 'blue',
              size: 10,
            },
          });
        }
        merge(overrides) {
          return {
            ..._classPrivateFieldLooseBase(this, _defaults)[_defaults],
            ...overrides,
          };
        }
      }
      const c = new Config();
      expect(c.merge({ size: 20 })).toEqual({
        color: 'blue',
        size: 20,
      });
      expect(c.merge({})).toEqual({
        color: 'blue',
        size: 10,
      });
    };"
  `);
});

test('031 JS Private Properties > private field interactions > private field used as Map/Set key', async () => {
  const source =
    "() => {\n        class Registry {\n          #map = new Map();\n          set(key, val) {\n            this.#map.set(key, val);\n          }\n          get(key) {\n            return this.#map.get(key);\n          }\n          size() {\n            return this.#map.size;\n          }\n        }\n        const r = new Registry();\n        r.set('a', 1);\n        r.set('b', 2);\n        expect(r.get('a')).toBe(1);\n        expect(r.size()).toBe(2);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _map = /* @__PURE__ */ _classPrivateFieldLooseKey('map');
      class Registry {
        constructor() {
          Object.defineProperty(this, _map, {
            writable: true,
            value: new Map(),
          });
        }
        set(key, val) {
          _classPrivateFieldLooseBase(this, _map)[_map].set(key, val);
        }
        get(key) {
          return _classPrivateFieldLooseBase(this, _map)[_map].get(key);
        }
        size() {
          return _classPrivateFieldLooseBase(this, _map)[_map].size;
        }
      }
      const r = new Registry();
      r.set('a', 1);
      r.set('b', 2);
      expect(r.get('a')).toBe(1);
      expect(r.size()).toBe(2);
    };"
  `);
});

test('032 JS Private Properties > private field interactions > private field accessed in arrow function preserves this', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 42;\n          getGetter() {\n            return () => this.#x;\n          }\n        }\n        const foo = new Foo();\n        const getter = foo.getGetter();\n        expect(getter()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class Foo {
        constructor() {
          Object.defineProperty(this, _x, {
            writable: true,
            value: 42,
          });
        }
        getGetter() {
          return () => _classPrivateFieldLooseBase(this, _x)[_x];
        }
      }
      const foo = new Foo();
      const getter = foo.getGetter();
      expect(getter()).toBe(42);
    };"
  `);
});

test('033 JS Private Properties > private field interactions > private field accessed in callback', async () => {
  const source =
    '() => {\n        class Multiplier {\n          #factor;\n          constructor(factor) {\n            this.#factor = factor;\n          }\n          applyAll(arr) {\n            return arr.map((x) => x * this.#factor);\n          }\n        }\n        expect(new Multiplier(3).applyAll([1, 2, 3])).toEqual([3, 6, 9]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
    var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    () => {
      var _factor = /* @__PURE__ */ _classPrivateFieldLooseKey('factor');
      class Multiplier {
        constructor(factor) {
          Object.defineProperty(this, _factor, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _factor)[_factor] = factor;
        }
        applyAll(arr) {
          return arr.map(x => x * _classPrivateFieldLooseBase(this, _factor)[_factor]);
        }
      }
      expect(new Multiplier(3).applyAll([1, 2, 3])).toEqual([3, 6, 9]);
    };"
  `);
});

test('034 JS Private Properties > private instance field brand checks > basic #field in obj returns true for own instance', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
    };"
  `);
});

test('035 JS Private Properties > private instance field brand checks > #field in obj returns false for plain object', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('036 JS Private Properties > private instance field brand checks > #field in obj returns false for instance of different class', async () => {
  const source =
    '() => {\n        class A {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        class B {\n          #x = 2;\n        }\n        expect(A.check(new B())).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let A = (() => {
        'use strict';
        var _x = '__private_A_x';
        const A = function A() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(A, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(A, 'prototype', { writable: false });
        return A;
      })();
      var _x2 = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
      class B {
        constructor() {
          Object.defineProperty(this, _x2, {
            writable: true,
            value: 2,
          });
        }
      }
      expect(A.check(new B())).toBe(false);
    };"
  `);
});

test('037 JS Private Properties > private instance field brand checks > multiple private field checks on same object', async () => {
  const source =
    '() => {\n        class Foo {\n          #a = 1;\n          #b = 2;\n          static checkA(obj) {\n            return #a in obj;\n          }\n          static checkB(obj) {\n            return #b in obj;\n          }\n        }\n        const foo = new Foo();\n        expect(Foo.checkA(foo)).toBe(true);\n        expect(Foo.checkB(foo)).toBe(true);\n        expect(Foo.checkA({})).toBe(false);\n        expect(Foo.checkB({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _a = '__private_Foo_a';
        var _b = '__private_Foo_b';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _a, {
            writable: true,
            value: 1,
          });
          Object.defineProperty(this, _b, {
            writable: true,
            value: 2,
          });
        };
        Object.defineProperty(Foo, 'checkA', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _a);
            },
            'name',
            {
              value: 'checkA',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'checkB', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _b);
            },
            'name',
            {
              value: 'checkB',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(Foo.checkA(foo)).toBe(true);
      expect(Foo.checkB(foo)).toBe(true);
      expect(Foo.checkA({})).toBe(false);
      expect(Foo.checkB({})).toBe(false);
    };"
  `);
});

test('038 JS Private Properties > private instance field brand checks > #field in obj with uninitialized field (no default)', async () => {
  const source =
    '() => {\n        class Foo {\n          #x;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: void 0,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
    };"
  `);
});

test('039 JS Private Properties > private instance field brand checks > instance method can check its own brand', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          isFoo(obj) {\n            return #x in obj;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.isFoo(foo)).toBe(true);\n        expect(foo.isFoo({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo.prototype, 'isFoo', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'isFoo',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.isFoo(foo)).toBe(true);
      expect(foo.isFoo({})).toBe(false);
    };"
  `);
});

test('040 JS Private Properties > private instance method brand checks > #method in obj returns true for instance', async () => {
  const source =
    '() => {\n        class Foo {\n          #foo() {}\n          #foo2() {}\n          test(other) {\n            return #foo in other;\n          }\n          test2(other) {\n            return #foo2 in other;\n          }\n        }\n        const cl = new Foo();\n        expect(cl.test({})).toBe(false);\n        expect(cl.test(cl)).toBe(true);\n        expect(cl.test2({})).toBe(false);\n        expect(cl.test2(cl)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _foo = '__private_Foo_foo';
        var _foo2 = '__private_Foo_foo2';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _foo, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
          Object.defineProperty(this, _foo2, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function (other) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
            },
            'name',
            {
              value: 'test',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo.prototype, 'test2', {
          value: Object.defineProperty(
            function (other) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);
            },
            'name',
            {
              value: 'test2',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const cl = new Foo();
      expect(cl.test({})).toBe(false);
      expect(cl.test(cl)).toBe(true);
      expect(cl.test2({})).toBe(false);
      expect(cl.test2(cl)).toBe(true);
    };"
  `);
});

test('041 JS Private Properties > private instance method brand checks > #method in obj for different instances of same class', async () => {
  const source =
    '() => {\n        class Foo {\n          #bar() {}\n          static check(obj) {\n            return #bar in obj;\n          }\n        }\n        const a = new Foo();\n        const b = new Foo();\n        expect(Foo.check(a)).toBe(true);\n        expect(Foo.check(b)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _bar);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const a = new Foo();
      const b = new Foo();
      expect(Foo.check(a)).toBe(true);
      expect(Foo.check(b)).toBe(true);
    };"
  `);
});

test('042 JS Private Properties > private accessor brand checks > #getter in obj returns true for instance', async () => {
  const source =
    '() => {\n        class Foo {\n          get #value() {\n            return 42;\n          }\n          static check(obj) {\n            return #value in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _value, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('043 JS Private Properties > private accessor brand checks > #setter in obj returns true for instance', async () => {
  const source =
    '() => {\n        class Foo {\n          set #value(v) {}\n          static check(obj) {\n            return #value in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _value, {
            set: function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('044 JS Private Properties > private accessor brand checks > #accessor (getter+setter) in obj returns true', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 0;\n          get #value() {\n            return this.#x;\n          }\n          set #value(v) {\n            this.#x = v;\n          }\n          static check(obj) {\n            return #value in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
    };
    function _classPrivateFieldLooseBase(e, s) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    function _classPrivateMethodCall(e, s, a) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);
    }
    var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _value, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x];
            },
            set: function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _x)[_x] = v;
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('045 JS Private Properties > private accessor brand checks > brand check does not trigger getter side effects', async () => {
  const source =
    '() => {\n        let getterCalled = false;\n        class Foo {\n          get #value() {\n            getterCalled = true;\n            return 42;\n          }\n          static check(obj) {\n            return #value in obj;\n          }\n        }\n        const foo = new Foo();\n        getterCalled = false;\n        Foo.check(foo);\n        expect(getterCalled).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let getterCalled = false;
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _value, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              getterCalled = true;
              return 42;
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      getterCalled = false;
      Foo.check(foo);
      expect(getterCalled).toBe(false);
    };"
  `);
});

test('046 JS Private Properties > private static field brand checks > #staticField in Class returns true', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(Foo)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 1,
        });
        return Foo;
      })();
      expect(Foo.check(Foo)).toBe(true);
    };"
  `);
});

test('047 JS Private Properties > private static field brand checks > #staticField in instance returns false', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 1,
        });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(false);
    };"
  `);
});

test('048 JS Private Properties > private static field brand checks > #staticField in plain object returns false', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 1,
        });
        return Foo;
      })();
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('049 JS Private Properties > private static method brand checks > #staticMethod in Class returns true', async () => {
  const source =
    '() => {\n        class Foo {\n          static #bar() {}\n          static check(obj) {\n            return #bar in obj;\n          }\n        }\n        expect(Foo.check(Foo)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _bar);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          },
        });
        return Foo;
      })();
      expect(Foo.check(Foo)).toBe(true);
    };"
  `);
});

test('050 JS Private Properties > private static method brand checks > #staticMethod in instance returns false', async () => {
  const source =
    '() => {\n        class Foo {\n          static #bar() {}\n          static check(obj) {\n            return #bar in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _bar);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          },
        });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(false);
    };"
  `);
});

test('051 JS Private Properties > private static accessor brand checks > static #getter in Class returns true', async () => {
  const source =
    '() => {\n        class Foo {\n          static get #value() {\n            return 1;\n          }\n          static check(obj) {\n            return #value in obj;\n          }\n        }\n        expect(Foo.check(Foo)).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _value, {
          get: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 1;
          },
        });
        return Foo;
      })();
      expect(Foo.check(Foo)).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('052 JS Private Properties > RHS not an object > throws TypeError for number', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(42)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(42)).toThrow();
    };"
  `);
});

test('053 JS Private Properties > RHS not an object > throws TypeError for string', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check('hello')).toThrow();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check('hello')).toThrow();
    };"
  `);
});

test('054 JS Private Properties > RHS not an object > throws TypeError for boolean', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(true)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(true)).toThrow();
    };"
  `);
});

test('055 JS Private Properties > RHS not an object > throws TypeError for undefined', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(undefined)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(undefined)).toThrow();
    };"
  `);
});

test('056 JS Private Properties > RHS not an object > throws TypeError for null', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(null)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(null)).toThrow();
    };"
  `);
});

test('057 JS Private Properties > RHS not an object > throws TypeError for symbol', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(Symbol('test'))).toThrow();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(Symbol('test'))).toThrow();
    };"
  `);
});

test('058 JS Private Properties > RHS not an object > throws for static private field with non-object RHS', async () => {
  const source =
    "() => {\n        class Foo {\n          static #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(() => Foo.check(42)).toThrow();\n        expect(() => Foo.check('str')).toThrow();\n        expect(() => Foo.check(null)).toThrow();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 1,
        });
        return Foo;
      })();
      expect(() => Foo.check(42)).toThrow();
      expect(() => Foo.check('str')).toThrow();
      expect(() => Foo.check(null)).toThrow();
    };"
  `);
});

test('059 JS Private Properties > RHS not an object > throws for private method with non-object RHS', async () => {
  const source =
    '() => {\n        class Foo {\n          #m() {}\n          static check(obj) {\n            return #m in obj;\n          }\n        }\n        expect(() => Foo.check(42)).toThrow();\n        expect(() => Foo.check(undefined)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _m = '__private_Foo_m';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _m, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _m);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(() => Foo.check(42)).toThrow();
      expect(() => Foo.check(undefined)).toThrow();
    };"
  `);
});

test('060 JS Private Properties > class name shadowing > static private field check works when class name is shadowed', async () => {
  const source =
    '() => {\n        class Test {\n          static #x = 1;\n          method(other) {\n            const Test = 2;\n            const func = () => {\n              const Test = 3;\n              return #x in other && Test;\n            };\n            return func() + Test;\n          }\n        }\n        const t = new Test();\n        expect(t.method(Test)).toBe(5);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Test = (() => {
        'use strict';
        var _x = '__private_Test_x';
        const Test = function Test() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Test.prototype, 'method', {
          value: Object.defineProperty(
            function (other) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              const Test = 2;
              const func = () => {
                const Test = 3;
                return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;
              };
              return func() + Test;
            },
            'name',
            {
              value: 'method',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Test, 'prototype', { writable: false });
        Object.defineProperty(Test, _x, {
          writable: true,
          value: 1,
        });
        return Test;
      })();
      const t = new Test();
      expect(t.method(Test)).toBe(5);
    };"
  `);
});

test('061 JS Private Properties > class name shadowing > instance private field check works when class name is shadowed', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          check(obj) {\n            const Foo = 'shadowed';\n            return #x in obj;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.check(foo)).toBe(true);\n        expect(foo.check({})).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo.prototype, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              const Foo = 'shadowed';
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.check(foo)).toBe(true);
      expect(foo.check({})).toBe(false);
    };"
  `);
});

test('062 JS Private Properties > inheritance > #field in subclass instance returns true', async () => {
  const source =
    '() => {\n        class Base {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        class Child extends Base {}\n        expect(Base.check(new Base())).toBe(true);\n        expect(Base.check(new Child())).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Base = (() => {
        'use strict';
        var _x = '__private_Base_x';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Base, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Base, 'prototype', { writable: false });
        return Base;
      })();
      class Child extends Base {}
      expect(Base.check(new Base())).toBe(true);
      expect(Base.check(new Child())).toBe(true);
    };"
  `);
});

test('063 JS Private Properties > inheritance > subclass private field is independent from parent', async () => {
  const source =
    '() => {\n        class Base {\n          #x = 1;\n          static checkBase(obj) {\n            return #x in obj;\n          }\n        }\n        class Child extends Base {\n          #y = 2;\n          static checkChild(obj) {\n            return #y in obj;\n          }\n        }\n        const child = new Child();\n        expect(Base.checkBase(child)).toBe(true);\n        expect(Child.checkChild(child)).toBe(true);\n        expect(Child.checkChild(new Base())).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
    function _construct(t, r, c) {
      return _construct2.construct(t, r, c);
    }
    () => {
      let Base = (() => {
        'use strict';
        var _x = '__private_Base_x';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Base, 'checkBase', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'checkBase',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Base, 'prototype', { writable: false });
        return Base;
      })();
      let Child = (__nox_super_141_272 => {
        'use strict';
        var _y = '__private_Child_y';
        const Child = function Child() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          var _this = _construct(__nox_super_141_272, arguments, new.target || Child);
          (function () {
            Object.defineProperty(this, _y, {
              writable: true,
              value: 2,
            });
          }).call(_this);
          return _this;
        };
        if (__nox_super_141_272 !== null && typeof __nox_super_141_272 !== 'function')
          throw new TypeError('Super expression must either be null or a function');
        Child.prototype = Object.create(__nox_super_141_272 && __nox_super_141_272.prototype, {
          constructor: {
            value: Child,
            writable: true,
            configurable: true,
          },
        });
        if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_141_272);
        else Child.__proto__ = __nox_super_141_272;
        Object.defineProperty(Child, 'checkChild', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _y);
            },
            'name',
            {
              value: 'checkChild',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Child, 'prototype', { writable: false });
        return Child;
      })(Base);
      const child = new Child();
      expect(Base.checkBase(child)).toBe(true);
      expect(Child.checkChild(child)).toBe(true);
      expect(Child.checkChild(new Base())).toBe(false);
    };"
  `);
});

test('064 JS Private Properties > inheritance > #staticField in subclass returns false', async () => {
  const source =
    '() => {\n        class Base {\n          static #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        class Child extends Base {}\n        expect(Base.check(Base)).toBe(true);\n        // Static private fields are NOT inherited\n        expect(Base.check(Child)).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Base = (() => {
        'use strict';
        var _x = '__private_Base_x';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Base, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Base, 'prototype', { writable: false });
        Object.defineProperty(Base, _x, {
          writable: true,
          value: 1,
        });
        return Base;
      })();
      class Child extends Base {}
      expect(Base.check(Base)).toBe(true);
      // Static private fields are NOT inherited
      expect(Base.check(Child)).toBe(false);
    };"
  `);
});

test('065 JS Private Properties > inheritance > private method brand check on subclass instance', async () => {
  const source =
    '() => {\n        class Base {\n          #secret() {}\n          static check(obj) {\n            return #secret in obj;\n          }\n        }\n        class Child extends Base {}\n        expect(Base.check(new Child())).toBe(true);\n        expect(Base.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Base = (() => {
        'use strict';
        var _secret = '__private_Base_secret';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _secret, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Base, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _secret);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Base, 'prototype', { writable: false });
        return Base;
      })();
      class Child extends Base {}
      expect(Base.check(new Child())).toBe(true);
      expect(Base.check({})).toBe(false);
    };"
  `);
});

test('066 JS Private Properties > usage in expressions > negation: !(#field in obj)', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static notFoo(obj) {\n            return !(#x in obj);\n          }\n        }\n        expect(Foo.notFoo(new Foo())).toBe(false);\n        expect(Foo.notFoo({})).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'notFoo', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return !Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'notFoo',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.notFoo(new Foo())).toBe(false);
      expect(Foo.notFoo({})).toBe(true);
    };"
  `);
});

test('067 JS Private Properties > usage in expressions > ternary: #field in obj ? a : b', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static label(obj) {\n            return #x in obj ? 'foo' : 'not foo';\n          }\n        }\n        expect(Foo.label(new Foo())).toBe('foo');\n        expect(Foo.label({})).toBe('not foo');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'label', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x) ? 'foo' : 'not foo';
            },
            'name',
            {
              value: 'label',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.label(new Foo())).toBe('foo');
      expect(Foo.label({})).toBe('not foo');
    };"
  `);
});

test('068 JS Private Properties > usage in expressions > logical AND: #field in obj && value', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj && 'yes';\n          }\n        }\n        expect(Foo.check(new Foo())).toBe('yes');\n        expect(Foo.check({})).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x) && 'yes';
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe('yes');
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('069 JS Private Properties > usage in expressions > logical OR: #field in obj || fallback', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj || 'fallback';\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x) || 'fallback';
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe('fallback');
    };"
  `);
});

test('070 JS Private Properties > usage in expressions > if/else with brand check', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static describe(obj) {\n            if (#x in obj) {\n              return 'is Foo';\n            } else {\n              return 'not Foo';\n            }\n          }\n        }\n        expect(Foo.describe(new Foo())).toBe('is Foo');\n        expect(Foo.describe({})).toBe('not Foo');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'describe', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              if (Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x)) {
                return 'is Foo';
              } else {
                return 'not Foo';
              }
            },
            'name',
            {
              value: 'describe',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.describe(new Foo())).toBe('is Foo');
      expect(Foo.describe({})).toBe('not Foo');
    };"
  `);
});

test('071 JS Private Properties > usage in expressions > brand check in while loop', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const items = [{}, new Foo(), {}, new Foo(), {}];\n        var count = 0;\n        for (var i = 0; i < items.length; i++) {\n          if (Foo.check(items[i])) count++;\n        }\n        expect(count).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const items = [{}, new Foo(), {}, new Foo(), {}];
      var count = 0;
      for (var i = 0; i < items.length; i++) {
        if (Foo.check(items[i])) count++;
      }
      expect(count).toBe(2);
    };"
  `);
});

test('072 JS Private Properties > usage in expressions > brand check with nullish coalescing', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj ?? 'never';\n          }\n        }\n        // #x in obj always returns boolean, never nullish\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x) ?? 'never';
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      // #x in obj always returns boolean, never nullish
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('073 JS Private Properties > practical patterns > static factory with brand check (instanceof alternative)', async () => {
  const source =
    '() => {\n        class MyClass {\n          #brand;\n          constructor() {\n            this.#brand = undefined;\n          }\n          static isMyClass(obj) {\n            try {\n              return #brand in obj;\n            } catch {\n              return false;\n            }\n          }\n        }\n        expect(MyClass.isMyClass(new MyClass())).toBe(true);\n        expect(MyClass.isMyClass({})).toBe(false);\n        expect(MyClass.isMyClass(null)).toBe(false);\n        expect(MyClass.isMyClass(42)).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
    };
    function _classPrivateFieldLooseBase(e, s) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    function _classPrivateMethodCall(e, s, a) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);
    }
    var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let MyClass = (() => {
        'use strict';
        var _brand = '__private_MyClass_brand';
        const MyClass = function MyClass() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _brand, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _brand)[_brand] = undefined;
        };
        Object.defineProperty(MyClass, 'isMyClass', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              try {
                return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _brand);
              } catch {
                return false;
              }
            },
            'name',
            {
              value: 'isMyClass',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(MyClass, 'prototype', { writable: false });
        return MyClass;
      })();
      expect(MyClass.isMyClass(new MyClass())).toBe(true);
      expect(MyClass.isMyClass({})).toBe(false);
      expect(MyClass.isMyClass(null)).toBe(false);
      expect(MyClass.isMyClass(42)).toBe(false);
    };"
  `);
});

test('074 JS Private Properties > practical patterns > safe unwrap pattern', async () => {
  const source =
    "() => {\n        class Wrapper {\n          #value;\n          constructor(value) {\n            this.#value = value;\n          }\n          static unwrap(obj) {\n            if (typeof obj === 'object' && obj !== null && #value in obj) {\n              return obj.getValue();\n            }\n            return obj;\n          }\n          getValue() {\n            return this.#value;\n          }\n        }\n        expect(Wrapper.unwrap(new Wrapper(42))).toBe(42);\n        expect(Wrapper.unwrap('plain')).toBe('plain');\n        expect(Wrapper.unwrap(null)).toBe(null);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
    };
    function _classPrivateFieldLooseBase(e, s) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    function _classPrivateMethodCall(e, s, a) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);
    }
    var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Wrapper = (() => {
        'use strict';
        var _value = '__private_Wrapper_value';
        const Wrapper = function Wrapper(value) {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _value, {
            writable: true,
            value: void 0,
          });
          _classPrivateFieldLooseBase(this, _value)[_value] = value;
        };
        Object.defineProperty(Wrapper, 'unwrap', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              if (
                typeof obj === 'object' &&
                obj !== null &&
                Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _value)
              ) {
                return obj.getValue();
              }
              return obj;
            },
            'name',
            {
              value: 'unwrap',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Wrapper.prototype, 'getValue', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _value)[_value];
            },
            'name',
            {
              value: 'getValue',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Wrapper, 'prototype', { writable: false });
        return Wrapper;
      })();
      expect(Wrapper.unwrap(new Wrapper(42))).toBe(42);
      expect(Wrapper.unwrap('plain')).toBe('plain');
      expect(Wrapper.unwrap(null)).toBe(null);
    };"
  `);
});

test('075 JS Private Properties > practical patterns > type narrowing with multiple private brands', async () => {
  const source =
    '() => {\n        class Dog {\n          #bark = true;\n          static isDog(obj) {\n            return #bark in obj;\n          }\n        }\n        class Cat {\n          #meow = true;\n          static isCat(obj) {\n            return #meow in obj;\n          }\n        }\n        const dog = new Dog();\n        const cat = new Cat();\n        expect(Dog.isDog(dog)).toBe(true);\n        expect(Cat.isCat(dog)).toBe(false);\n        expect(Dog.isDog(cat)).toBe(false);\n        expect(Cat.isCat(cat)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Dog = (() => {
        'use strict';
        var _bark = '__private_Dog_bark';
        const Dog = function Dog() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bark, {
            writable: true,
            value: true,
          });
        };
        Object.defineProperty(Dog, 'isDog', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _bark);
            },
            'name',
            {
              value: 'isDog',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Dog, 'prototype', { writable: false });
        return Dog;
      })();
      let Cat = (() => {
        'use strict';
        var _meow = '__private_Cat_meow';
        const Cat = function Cat() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _meow, {
            writable: true,
            value: true,
          });
        };
        Object.defineProperty(Cat, 'isCat', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _meow);
            },
            'name',
            {
              value: 'isCat',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Cat, 'prototype', { writable: false });
        return Cat;
      })();
      const dog = new Dog();
      const cat = new Cat();
      expect(Dog.isDog(dog)).toBe(true);
      expect(Cat.isCat(dog)).toBe(false);
      expect(Dog.isDog(cat)).toBe(false);
      expect(Cat.isCat(cat)).toBe(true);
    };"
  `);
});

test('076 JS Private Properties > practical patterns > filtering an array by brand', async () => {
  const source =
    "() => {\n        class Special {\n          #mark = true;\n          static is(obj) {\n            return typeof obj === 'object' && obj !== null && #mark in obj;\n          }\n        }\n        const items = [new Special(), {}, new Special(), 42, null, new Special()];\n        var count = 0;\n        for (var i = 0; i < items.length; i++) {\n          if (Special.is(items[i])) count++;\n        }\n        expect(count).toBe(3);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Special = (() => {
        'use strict';
        var _mark = '__private_Special_mark';
        const Special = function Special() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _mark, {
            writable: true,
            value: true,
          });
        };
        Object.defineProperty(Special, 'is', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return (
                typeof obj === 'object' &&
                obj !== null &&
                Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _mark)
              );
            },
            'name',
            {
              value: 'is',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Special, 'prototype', { writable: false });
        return Special;
      })();
      const items = [new Special(), {}, new Special(), 42, null, new Special()];
      var count = 0;
      for (var i = 0; i < items.length; i++) {
        if (Special.is(items[i])) count++;
      }
      expect(count).toBe(3);
    };"
  `);
});

test('077 JS Private Properties > cross-class isolation > same field name in different classes are independent brands', async () => {
  const source =
    '() => {\n        class A {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        class B {\n          #x = 2;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const a = new A();\n        const b = new B();\n        expect(A.check(a)).toBe(true);\n        expect(A.check(b)).toBe(false);\n        expect(B.check(b)).toBe(true);\n        expect(B.check(a)).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let A = (() => {
        'use strict';
        var _x = '__private_A_x';
        const A = function A() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(A, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(A, 'prototype', { writable: false });
        return A;
      })();
      let B = (() => {
        'use strict';
        var _x15 = '__private_B_x';
        const B = function B() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x15, {
            writable: true,
            value: 2,
          });
        };
        Object.defineProperty(B, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x15);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(B, 'prototype', { writable: false });
        return B;
      })();
      const a = new A();
      const b = new B();
      expect(A.check(a)).toBe(true);
      expect(A.check(b)).toBe(false);
      expect(B.check(b)).toBe(true);
      expect(B.check(a)).toBe(false);
    };"
  `);
});

test('078 JS Private Properties > cross-class isolation > nested class brand checks are independent', async () => {
  const source =
    '() => {\n        class Outer {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n          makeInner() {\n            return new (class Inner {\n              #x = 2;\n              static check(obj) {\n                return #x in obj;\n              }\n            })();\n          }\n        }\n        const outer = new Outer();\n        expect(Outer.check(outer)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Outer = (() => {
        'use strict';
        var _x = '__private_Outer_x';
        const Outer = function Outer() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Outer, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Outer.prototype, 'makeInner', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return new ((() => {
                'use strict';
                var _x14 = '__private_Inner_x';
                const Inner = function Inner() {
                  if (!new.target) throw new TypeError('Cannot call a class as a function');
                  Object.defineProperty(this, _x14, {
                    writable: true,
                    value: 2,
                  });
                };
                Object.defineProperty(Inner, 'check', {
                  value: Object.defineProperty(
                    function (obj) {
                      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                      return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x14);
                    },
                    'name',
                    {
                      value: 'check',
                      configurable: true,
                    },
                  ),
                  writable: true,
                  configurable: true,
                });
                Object.defineProperty(Inner, 'prototype', { writable: false });
                return Inner;
              })())();
            },
            'name',
            {
              value: 'makeInner',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Outer, 'prototype', { writable: false });
        return Outer;
      })();
      const outer = new Outer();
      expect(Outer.check(outer)).toBe(true);
    };"
  `);
});

test('079 JS Private Properties > various object types as RHS > works with arrays', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check([])).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check([])).toBe(false);
    };"
  `);
});

test('080 JS Private Properties > various object types as RHS > works with functions', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(function () {})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(function () {})).toBe(false);
    };"
  `);
});

test('081 JS Private Properties > various object types as RHS > works with class itself as object', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        // Instance brand is not on the class constructor\n        expect(Foo.check(Foo)).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      // Instance brand is not on the class constructor
      expect(Foo.check(Foo)).toBe(false);
    };"
  `);
});

test('082 JS Private Properties > various object types as RHS > works with Object.create(null)', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(Object.create(null))).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(Object.create(null))).toBe(false);
    };"
  `);
});

test('083 JS Private Properties > various object types as RHS > works with Date, RegExp, Map objects', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(new Date())).toBe(false);\n        expect(Foo.check(/test/)).toBe(false);\n        expect(Foo.check(new Map())).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(Foo.check(new Date())).toBe(false);
      expect(Foo.check(/test/)).toBe(false);
      expect(Foo.check(new Map())).toBe(false);
    };"
  `);
});

test('084 JS Private Properties > edge cases > brand check in constructor', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          hasBrand;\n          constructor() {\n            this.hasBrand = #x in this;\n          }\n        }\n        expect(new Foo().hasBrand).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
          this.hasBrand = void 0;
          this.hasBrand = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(new Foo().hasBrand).toBe(true);
    };"
  `);
});

test('085 JS Private Properties > edge cases > brand check during field initialization', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          hasBrand = #x in this;\n        }\n        expect(new Foo().hasBrand).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
          this.hasBrand = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(new Foo().hasBrand).toBe(true);
    };"
  `);
});

test('086 JS Private Properties > edge cases > brand check in static block', async () => {
  const source =
    '() => {\n        let result;\n        class Foo {\n          static #x = 1;\n          static {\n            result = #x in Foo;\n          }\n        }\n        expect(result).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let result;
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 1,
        });
        (function () {
          result = Object.prototype.hasOwnProperty.call(_checkInRHS(Foo), _x);
        }).call(Foo);
        return Foo;
      })();
      expect(result).toBe(true);
    };"
  `);
});

test('087 JS Private Properties > edge cases > brand check result is always a boolean', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(typeof Foo.check(new Foo())).toBe('boolean');\n        expect(typeof Foo.check({})).toBe('boolean');\n        expect(Foo.check(new Foo()) === true).toBe(true);\n        expect(Foo.check({}) === false).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(typeof Foo.check(new Foo())).toBe('boolean');
      expect(typeof Foo.check({})).toBe('boolean');
      expect(Foo.check(new Foo()) === true).toBe(true);
      expect(Foo.check({}) === false).toBe(true);
    };"
  `);
});

test('088 JS Private Properties > edge cases > brand check on Proxy-wrapped object', async () => {
  const source =
    "() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const foo = new Foo();\n        const proxy = new Proxy(foo, {});\n        // Proxy does not forward private field brand — should be false\n        // (or true if the engine sees through the proxy — implementation-defined)\n        var result = Foo.check(proxy);\n        expect(typeof result).toBe('boolean');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const proxy = new Proxy(foo, {});
      // Proxy does not forward private field brand — should be false
      // (or true if the engine sees through the proxy — implementation-defined)
      var result = Foo.check(proxy);
      expect(typeof result).toBe('boolean');
    };"
  `);
});

test('089 JS Private Properties > edge cases > multiple brand checks in single expression', async () => {
  const source =
    "() => {\n        class A {\n          #a = 1;\n          static check(obj) {\n            return #a in obj;\n          }\n        }\n        class B {\n          #b = 2;\n          static check(obj) {\n            return #b in obj;\n          }\n        }\n        class AB extends A {\n          #b_too = 3;\n        }\n        const ab = new AB();\n        // Has A's brand (through inheritance) but not B's\n        expect(A.check(ab) && !B.check(ab)).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
    var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let A = (() => {
        'use strict';
        var _a = '__private_A_a';
        const A = function A() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _a, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(A, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _a);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(A, 'prototype', { writable: false });
        return A;
      })();
      let B = (() => {
        'use strict';
        var _b = '__private_B_b';
        const B = function B() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _b, {
            writable: true,
            value: 2,
          });
        };
        Object.defineProperty(B, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _b);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(B, 'prototype', { writable: false });
        return B;
      })();
      var _b_too = /* @__PURE__ */ _classPrivateFieldLooseKey('b_too');
      class AB extends A {
        constructor(..._args) {
          super(..._args);
          Object.defineProperty(this, _b_too, {
            writable: true,
            value: 3,
          });
        }
      }
      const ab = new AB();
      // Has A's brand (through inheritance) but not B's
      expect(A.check(ab) && !B.check(ab)).toBe(true);
    };"
  `);
});

test('090 JS Private Properties > edge cases > brand check after Object.freeze', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const foo = Object.freeze(new Foo());\n        expect(Foo.check(foo)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = Object.freeze(new Foo());
      expect(Foo.check(foo)).toBe(true);
    };"
  `);
});

test('091 JS Private Properties > edge cases > brand check after Object.seal', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const foo = Object.seal(new Foo());\n        expect(Foo.check(foo)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = Object.seal(new Foo());
      expect(Foo.check(foo)).toBe(true);
    };"
  `);
});

test('092 JS Private Properties > edge cases > brand check with Object.preventExtensions', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        const foo = new Foo();\n        Object.preventExtensions(foo);\n        expect(Foo.check(foo)).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(Foo, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      Object.preventExtensions(foo);
      expect(Foo.check(foo)).toBe(true);
    };"
  `);
});

test('093 JS Private Properties > edge cases > expression class with brand check', async () => {
  const source =
    '() => {\n        const Foo = class {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        };\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    () => {
      const Foo = (() => {
        'use strict';
        var _x = '__private__Class_x';
        const _Class = function _Class() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 1,
          });
        };
        Object.defineProperty(_Class, 'name', {
          value: 'Foo',
          configurable: true,
        });
        Object.defineProperty(_Class, 'check', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
            },
            'name',
            {
              value: 'check',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(_Class, 'prototype', { writable: false });
        return _Class;
      })();
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
    };"
  `);
});
