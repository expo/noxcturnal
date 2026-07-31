// Generated from apps/test-suite/tests/JSPrivateMethods.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Private Methods > private instance methods > private method can be called from constructor', async () => {
  const source =
    '() => {\n        class Foo {\n          #bar() {\n            return 42;\n          }\n          constructor() {\n            this.result = this.#bar();\n          }\n        }\n        const foo = new Foo();\n        expect(foo.result).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
          this.result = _classPrivateMethodCall(this, _bar, []);
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.result).toBe(42);
    };"
  `);
});

test('002 JS Private Methods > private instance methods > private method preserves this context', async () => {
  const source =
    "() => {\n        class Foo {\n          #name = 'foo';\n          #bar() {\n            return this.#name;\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe('foo');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _name = '__private_Foo_name';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _name, {
            writable: true,
            value: 'foo',
          });
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _name)[_name];
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe('foo');
    };"
  `);
});

test('003 JS Private Methods > private instance methods > private method called with different this via call/apply', async () => {
  const source =
    '() => {\n        class Foo {\n          x = 1;\n          #bar() {\n            return this.x;\n          }\n          getBar() {\n            return this.#bar;\n          }\n        }\n        const foo = new Foo();\n        const bar = foo.getBar();\n        // Private method extracted — calling with original receiver\n        expect(bar.call(foo)).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.x = 1;
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return this.x;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'getBar', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _bar)[_bar];
            },
            'name',
            {
              value: 'getBar',
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
      const bar = foo.getBar();
      // Private method extracted — calling with original receiver
      expect(bar.call(foo)).toBe(1);
    };"
  `);
});

test('004 JS Private Methods > private instance methods > exfiltrated private method has stable identity', async () => {
  const source =
    "() => {\n        class Foo {\n          #bar() {\n            return 'bar';\n          }\n          getBar() {\n            return this.#bar;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.getBar()).toBe(foo.getBar());\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'bar';
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'getBar', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _bar)[_bar];
            },
            'name',
            {
              value: 'getBar',
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
      expect(foo.getBar()).toBe(foo.getBar());
    };"
  `);
});

test('005 JS Private Methods > private instance methods > private method available during field initialization', async () => {
  const source =
    "() => {\n        class Foo {\n          #bar() {\n            return 'bar';\n          }\n          foo = this.#bar();\n        }\n        const foo = new Foo();\n        expect(foo.foo).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.foo = _classPrivateMethodCall(this, _bar, []);
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'bar';
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.foo).toBe('bar');
    };"
  `);
});

test('006 JS Private Methods > private instance methods > multiple private methods in same class', async () => {
  const source =
    "() => {\n        class Foo {\n          #bar() {\n            return 'bar';\n          }\n          #baz() {\n            return 'baz';\n          }\n          test() {\n            return this.#bar() + this.#baz();\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe('barbaz');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _baz = '__private_Foo_baz';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'bar';
            },
          });
          Object.defineProperty(this, _baz, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'baz';
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []) + _classPrivateMethodCall(this, _baz, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe('barbaz');
    };"
  `);
});

test('007 JS Private Methods > private instance methods > private method is read-only (assignment throws)', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              #bar() {}\n              constructor() {\n                this.#bar = 1;\n              }\n            }\n            new Foo();\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
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
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          return Foo;
        })();
        new Foo();
      }).toThrow();
    };"
  `);
});

test('008 JS Private Methods > private instance methods > private method compound assignment throws', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              #bar() {}\n              constructor() {\n                this.#bar += 1;\n              }\n            }\n            new Foo();\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
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
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          return Foo;
        })();
        new Foo();
      }).toThrow();
    };"
  `);
});

test('009 JS Private Methods > private instance methods > private method increment throws', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              #bar() {}\n              constructor() {\n                this.#bar++;\n              }\n            }\n            new Foo();\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
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
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          return Foo;
        })();
        new Foo();
      }).toThrow();
    };"
  `);
});

test('010 JS Private Methods > private instance methods > class name binding preserved inside private method', async () => {
  const source =
    '() => {\n        class Foo {\n          #bar() {\n            return Foo;\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe(Foo);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return Foo;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe(Foo);
    };"
  `);
});

test('011 JS Private Methods > private instance methods > super method access from private method', async () => {
  const source =
    "() => {\n        class Base {\n          greet() {\n            return 'hello';\n          }\n        }\n        class Derived extends Base {\n          #bar() {\n            return super.greet();\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        const d = new Derived();\n        expect(d.test()).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
    function _construct(t, r, c) {
      return _construct2.construct(t, r, c);
    }
    var _get2 = { get: require('@babel/runtime/helpers/get') };
    function _get(e, t, r) {
      return _get2.get(e, t, r);
    }
    () => {
      class Base {
        greet() {
          return 'hello';
        }
      }
      let Derived = (__nox_super_107_273 => {
        'use strict';
        var _bar = '__private_Derived_bar';
        const Derived = function Derived() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          var _this = _construct(__nox_super_107_273, arguments, new.target || Derived);
          (function () {
            Object.defineProperty(this, _bar, {
              value: function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                return _get(Object.getPrototypeOf(Derived.prototype), 'greet', this).call(this);
              },
            });
          }).call(_this);
          return _this;
        };
        if (__nox_super_107_273 !== null && typeof __nox_super_107_273 !== 'function')
          throw new TypeError('Super expression must either be null or a function');
        Derived.prototype = Object.create(__nox_super_107_273 && __nox_super_107_273.prototype, {
          constructor: {
            value: Derived,
            writable: true,
            configurable: true,
          },
        });
        if (Object.setPrototypeOf) Object.setPrototypeOf(Derived, __nox_super_107_273);
        else Derived.__proto__ = __nox_super_107_273;
        Object.defineProperty(Derived.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Derived, 'prototype', { writable: false });
        return Derived;
      })(Base);
      const d = new Derived();
      expect(d.test()).toBe('hello');
    };"
  `);
});

test('012 [upstream xit] JS Private Methods > private instance methods > private method as tagged template', async () => {
  const source =
    "() => {\n        class Foo {\n          #tag(strings, ...values) {\n            return { strings: Array.from(strings), values };\n          }\n          test() {\n            return this.#tag`hello ${'world'}`;\n          }\n        }\n        const foo = new Foo();\n        const result = foo.test();\n        expect(result.strings).toEqual(['hello ', '']);\n        expect(result.values).toEqual(['world']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _tag = '__private_Foo_tag';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _tag, {
            value: function (strings, ...values) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return {
                strings: Array.from(strings),
                values,
              };
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _tag)[_tag]\`hello \${'world'}\`;
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const result = foo.test();
      expect(result.strings).toEqual(['hello ', '']);
      expect(result.values).toEqual(['world']);
    };"
  `);
});

test('013 JS Private Methods > private instance methods > private method with parameters', async () => {
  const source =
    '() => {\n        class Calc {\n          #add(a, b) {\n            return a + b;\n          }\n          sum(a, b) {\n            return this.#add(a, b);\n          }\n        }\n        const calc = new Calc();\n        expect(calc.sum(3, 4)).toBe(7);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Calc = (() => {
        'use strict';
        var _add = '__private_Calc_add';
        const Calc = function Calc() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _add, {
            value: function (a, b) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return a + b;
            },
          });
        };
        Object.defineProperty(Calc.prototype, 'sum', {
          value: Object.defineProperty(
            function (a, b) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _add, [a, b]);
            },
            'name',
            {
              value: 'sum',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Calc, 'prototype', { writable: false });
        return Calc;
      })();
      const calc = new Calc();
      expect(calc.sum(3, 4)).toBe(7);
    };"
  `);
});

test('014 JS Private Methods > private instance methods > private method with default parameters', async () => {
  const source =
    "() => {\n        class Foo {\n          #greet(name = 'world') {\n            return `hello ${name}`;\n          }\n          test(n) {\n            return this.#greet(n);\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe('hello world');\n        expect(foo.test('bar')).toBe('hello bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _greet = '__private_Foo_greet';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _greet, {
            value: function (name = 'world') {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return \`hello \${name}\`;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function (n) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _greet, [n]);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe('hello world');
      expect(foo.test('bar')).toBe('hello bar');
    };"
  `);
});

test('015 JS Private Methods > private instance methods > private method with rest parameters', async () => {
  const source =
    '() => {\n        class Foo {\n          #sum(...args) {\n            return args.reduce((a, b) => a + b, 0);\n          }\n          test(...args) {\n            return this.#sum(...args);\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test(1, 2, 3)).toBe(6);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _sum = '__private_Foo_sum';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _sum, {
            value: function (...args) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return args.reduce((a, b) => a + b, 0);
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function (...args) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _sum, [...args]);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test(1, 2, 3)).toBe(6);
    };"
  `);
});

test('016 JS Private Methods > private instance methods > private method with destructured parameters', async () => {
  const source =
    '() => {\n        class Foo {\n          #extract({ x, y }) {\n            return x + y;\n          }\n          test(obj) {\n            return this.#extract(obj);\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test({ x: 10, y: 20 })).toBe(30);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _extract = '__private_Foo_extract';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _extract, {
            value: function ({ x, y }) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return x + y;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _extract, [obj]);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(
        foo.test({
          x: 10,
          y: 20,
        }),
      ).toBe(30);
    };"
  `);
});

test('017 JS Private Methods > private instance methods > private method not accessible from outside', async () => {
  const source =
    "() => {\n        class Foo {\n          #secret() {\n            return 42;\n          }\n        }\n        const foo = new Foo();\n        expect(foo['#secret']).toBeUndefined();\n        expect(typeof foo['#secret']).toBe('undefined');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let Foo = (() => {
        'use strict';
        var _secret = '__private_Foo_secret';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _secret, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo['#secret']).toBeUndefined();
      expect(typeof foo['#secret']).toBe('undefined');
    };"
  `);
});

test('018 JS Private Methods > private instance methods > private method not accessible from subclass', async () => {
  const source =
    '() => {\n        class Base {\n          #secret() {\n            return 42;\n          }\n          callSecret() {\n            return this.#secret();\n          }\n        }\n        class Child extends Base {}\n        const child = new Child();\n        // Can only call through inherited public method\n        expect(child.callSecret()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Base = (() => {
        'use strict';
        var _secret = '__private_Base_secret';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _secret, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Base.prototype, 'callSecret', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _secret, []);
            },
            'name',
            {
              value: 'callSecret',
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
      const child = new Child();
      // Can only call through inherited public method
      expect(child.callSecret()).toBe(42);
    };"
  `);
});

test('019 JS Private Methods > private instance methods > private method calling another private method', async () => {
  const source =
    '() => {\n        class Foo {\n          #a() {\n            return 1;\n          }\n          #b() {\n            return this.#a() + 2;\n          }\n          test() {\n            return this.#b();\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _a = '__private_Foo_a';
        var _b = '__private_Foo_b';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _a, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 1;
            },
          });
          Object.defineProperty(this, _b, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _a, []) + 2;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _b, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe(3);
    };"
  `);
});

test('020 JS Private Methods > private instance methods > private method returning this for chaining', async () => {
  const source =
    '() => {\n        class Builder {\n          value = 0;\n          #add(n) {\n            this.value += n;\n            return this;\n          }\n          #mul(n) {\n            this.value *= n;\n            return this;\n          }\n          build(a, b) {\n            return this.#add(a).#mul(b).value;\n          }\n        }\n        const b = new Builder();\n        expect(b.build(3, 4)).toBe(12);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Builder = (() => {
        'use strict';
        var _add = '__private_Builder_add';
        var _mul = '__private_Builder_mul';
        const Builder = function Builder() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.value = 0;
          Object.defineProperty(this, _add, {
            value: function (n) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              this.value += n;
              return this;
            },
          });
          Object.defineProperty(this, _mul, {
            value: function (n) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              this.value *= n;
              return this;
            },
          });
        };
        Object.defineProperty(Builder.prototype, 'build', {
          value: Object.defineProperty(
            function (a, b) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(_classPrivateMethodCall(this, _add, [a]), _mul, [b]).value;
            },
            'name',
            {
              value: 'build',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Builder, 'prototype', { writable: false });
        return Builder;
      })();
      const b = new Builder();
      expect(b.build(3, 4)).toBe(12);
    };"
  `);
});

test('021 JS Private Methods > async private methods > async private method returns promise', async () => {
  const source =
    'async () => {\n        class Foo {\n          async #bar() {\n            return 42;\n          }\n          async test() {\n            return await this.#bar();\n          }\n        }\n        const foo = new Foo();\n        const result = await foo.test();\n        expect(result).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    async () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: async function () {
              return 42;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            async function () {
              return await _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const result = await foo.test();
      expect(result).toBe(42);
    };"
  `);
});

test('022 JS Private Methods > async private methods > async private method with await', async () => {
  const source =
    'async () => {\n        class Foo {\n          async #fetch(val) {\n            const result = await Promise.resolve(val * 2);\n            return result;\n          }\n          async test() {\n            return await this.#fetch(21);\n          }\n        }\n        const foo = new Foo();\n        expect(await foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    async () => {
      let Foo = (() => {
        'use strict';
        var _fetch = '__private_Foo_fetch';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _fetch, {
            value: async function (val) {
              const result = await Promise.resolve(val * 2);
              return result;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            async function () {
              return await _classPrivateMethodCall(this, _fetch, [21]);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(await foo.test()).toBe(42);
    };"
  `);
});

test('023 JS Private Methods > async private methods > async private method error propagation', async () => {
  const source =
    "async () => {\n        class Foo {\n          async #fail() {\n            throw new Error('private error');\n          }\n          async test() {\n            try {\n              await this.#fail();\n              return 'no error';\n            } catch (e) {\n              return e.message;\n            }\n          }\n        }\n        const foo = new Foo();\n        expect(await foo.test()).toBe('private error');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    async () => {
      let Foo = (() => {
        'use strict';
        var _fail = '__private_Foo_fail';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _fail, {
            value: async function () {
              throw new Error('private error');
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            async function () {
              try {
                await _classPrivateMethodCall(this, _fail, []);
                return 'no error';
              } catch (e) {
                return e.message;
              }
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(await foo.test()).toBe('private error');
    };"
  `);
});

test('024 JS Private Methods > generator private methods > private generator method yields values', async () => {
  const source =
    '() => {\n        class Foo {\n          *#gen() {\n            yield 1;\n            yield 2;\n            yield 3;\n          }\n          test() {\n            return [...this.#gen()];\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _gen = '__private_Foo_gen';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _gen, {
            value: function* () {
              yield 1;
              yield 2;
              yield 3;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return [..._classPrivateMethodCall(this, _gen, [])];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toEqual([1, 2, 3]);
    };"
  `);
});

test('025 JS Private Methods > generator private methods > private async generator method', async () => {
  const source =
    'async () => {\n        class Foo {\n          async *#gen() {\n            yield await Promise.resolve(1);\n            yield await Promise.resolve(2);\n            yield await Promise.resolve(3);\n          }\n          async test() {\n            const results = [];\n            for await (const val of this.#gen()) {\n              results.push(val);\n            }\n            return results;\n          }\n        }\n        const foo = new Foo();\n        expect(await foo.test()).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    async () => {
      let Foo = (() => {
        'use strict';
        var _gen = '__private_Foo_gen';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _gen, {
            value: async function* () {
              yield await Promise.resolve(1);
              yield await Promise.resolve(2);
              yield await Promise.resolve(3);
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            async function () {
              const results = [];
              for await (const val of _classPrivateMethodCall(this, _gen, [])) {
                results.push(val);
              }
              return results;
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(await foo.test()).toEqual([1, 2, 3]);
    };"
  `);
});

test('026 JS Private Methods > generator private methods > private generator with return', async () => {
  const source =
    "() => {\n        class Foo {\n          *#gen() {\n            yield 'a';\n            return 'done';\n          }\n          test() {\n            const gen = this.#gen();\n            const first = gen.next();\n            const second = gen.next();\n            return { first, second };\n          }\n        }\n        const foo = new Foo();\n        const result = foo.test();\n        expect(result.first.value).toBe('a');\n        expect(result.first.done).toBe(false);\n        expect(result.second.value).toBe('done');\n        expect(result.second.done).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _gen = '__private_Foo_gen';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _gen, {
            value: function* () {
              yield 'a';
              return 'done';
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              const gen = _classPrivateMethodCall(this, _gen, []);
              const first = gen.next();
              const second = gen.next();
              return {
                first,
                second,
              };
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const result = foo.test();
      expect(result.first.value).toBe('a');
      expect(result.first.done).toBe(false);
      expect(result.second.value).toBe('done');
      expect(result.second.done).toBe(true);
    };"
  `);
});

test('027 JS Private Methods > private accessors > private getter', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 42;\n          get #value() {\n            return this.#x;\n          }\n          test() {\n            return this.#value;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 42,
          });
          Object.defineProperty(this, _value, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x];
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _value)[_value];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe(42);
    };"
  `);
});

test('028 JS Private Methods > private accessors > private setter', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 0;\n          set #value(v) {\n            this.#x = v;\n          }\n          getValue() {\n            return this.#x;\n          }\n          test(v) {\n            this.#value = v;\n          }\n        }\n        const foo = new Foo();\n        foo.test(42);\n        expect(foo.getValue()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
            set: function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _x)[_x] = v;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'getValue', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x];
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
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _value)[_value] = v;
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      foo.test(42);
      expect(foo.getValue()).toBe(42);
    };"
  `);
});

test('029 JS Private Methods > private accessors > private getter and setter pair', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 0;\n          get #value() {\n            return this.#x;\n          }\n          set #value(v) {\n            this.#x = v * 2;\n          }\n          test() {\n            this.#value = 21;\n            return this.#value;\n          }\n        }\n        const foo = new Foo();\n        expect(foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
              _classPrivateFieldLooseBase(this, _x)[_x] = v * 2;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _value)[_value] = 21;
              return _classPrivateFieldLooseBase(this, _value)[_value];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.test()).toBe(42);
    };"
  `);
});

test('030 JS Private Methods > private accessors > getter-only private accessor throws on set', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              get #bar() {\n                return 1;\n              }\n              constructor() {\n                this.#bar = 2;\n              }\n            }\n            new Foo();\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
        let Foo = (() => {
          'use strict';
          var _bar = '__private_Foo_bar';
          const Foo = function Foo() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
            Object.defineProperty(this, _bar, {
              get: function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                return 1;
              },
            });
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          return Foo;
        })();
        new Foo();
      }).toThrow();
    };"
  `);
});

test('031 [upstream xit] JS Private Methods > private accessors > setter-only private accessor throws on get', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              set #bar(v) {}\n              constructor() {\n                const x = this.#bar;\n              }\n            }\n            new Foo();\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
        let Foo = (() => {
          'use strict';
          var _bar = '__private_Foo_bar';
          const Foo = function Foo() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
            Object.defineProperty(this, _bar, {
              set: function (v) {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              },
            });
            const x = _classPrivateFieldLooseBase(this, _bar)[_bar];
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          return Foo;
        })();
        new Foo();
      }).toThrow();
    };"
  `);
});

test('032 JS Private Methods > private accessors > private accessor available during field initialization', async () => {
  const source =
    '() => {\n        class Foo {\n          get #value() {\n            return 42;\n          }\n          field = this.#value;\n        }\n        const foo = new Foo();\n        expect(foo.field).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.field = _classPrivateFieldLooseBase(this, _value)[_value];
          Object.defineProperty(this, _value, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      expect(foo.field).toBe(42);
    };"
  `);
});

test('033 JS Private Methods > private accessors > private getter with computed value', async () => {
  const source =
    '() => {\n        class Rect {\n          #w;\n          #h;\n          constructor(w, h) {\n            this.#w = w;\n            this.#h = h;\n          }\n          get #area() {\n            return this.#w * this.#h;\n          }\n          getArea() {\n            return this.#area;\n          }\n        }\n        const r = new Rect(3, 4);\n        expect(r.getArea()).toBe(12);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Rect = (() => {
        'use strict';
        var _h = '__private_Rect_h';
        var _w = '__private_Rect_w';
        var _area = '__private_Rect_area';
        const Rect = function Rect(w, h) {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _w, {
            writable: true,
            value: void 0,
          });
          Object.defineProperty(this, _h, {
            writable: true,
            value: void 0,
          });
          Object.defineProperty(this, _area, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return (
                _classPrivateFieldLooseBase(this, _w)[_w] * _classPrivateFieldLooseBase(this, _h)[_h]
              );
            },
          });
          _classPrivateFieldLooseBase(this, _w)[_w] = w;
          _classPrivateFieldLooseBase(this, _h)[_h] = h;
        };
        Object.defineProperty(Rect.prototype, 'getArea', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _area)[_area];
            },
            'name',
            {
              value: 'getArea',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Rect, 'prototype', { writable: false });
        return Rect;
      })();
      const r = new Rect(3, 4);
      expect(r.getArea()).toBe(12);
    };"
  `);
});

test('034 JS Private Methods > private accessors > private accessor increment/decrement via getter+setter', async () => {
  const source =
    '() => {\n        class Counter {\n          #x = 0;\n          get #count() {\n            return this.#x;\n          }\n          set #count(v) {\n            this.#x = v;\n          }\n          inc() {\n            this.#count++;\n            return this.#count;\n          }\n          dec() {\n            this.#count--;\n            return this.#count;\n          }\n        }\n        const c = new Counter();\n        expect(c.inc()).toBe(1);\n        expect(c.inc()).toBe(2);\n        expect(c.dec()).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Counter = (() => {
        'use strict';
        var _x = '__private_Counter_x';
        var _count = '__private_Counter_count';
        const Counter = function Counter() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _count, {
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
        Object.defineProperty(Counter.prototype, 'inc', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _count)[_count]++;
              return _classPrivateFieldLooseBase(this, _count)[_count];
            },
            'name',
            {
              value: 'inc',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Counter.prototype, 'dec', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _count)[_count]--;
              return _classPrivateFieldLooseBase(this, _count)[_count];
            },
            'name',
            {
              value: 'dec',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Counter, 'prototype', { writable: false });
        return Counter;
      })();
      const c = new Counter();
      expect(c.inc()).toBe(1);
      expect(c.inc()).toBe(2);
      expect(c.dec()).toBe(1);
    };"
  `);
});

test('035 JS Private Methods > private static methods > basic static private method', async () => {
  const source =
    "() => {\n        class Foo {\n          static #bar() {\n            return 'bar';\n          }\n          static test() {\n            return Foo.#bar();\n          }\n        }\n        expect(Foo.test()).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(Foo, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 'bar';
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toBe('bar');
    };"
  `);
});

test('036 JS Private Methods > private static methods > static private method with class passed as argument', async () => {
  const source =
    "() => {\n        class Foo {\n          static #bar() {\n            return 'bar';\n          }\n          static extract(klass) {\n            return klass.#bar();\n          }\n        }\n        expect(Foo.extract(Foo)).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'extract', {
          value: Object.defineProperty(
            function (klass) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(klass, _bar, []);
            },
            'name',
            {
              value: 'extract',
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
            return 'bar';
          },
        });
        return Foo;
      })();
      expect(Foo.extract(Foo)).toBe('bar');
    };"
  `);
});

test('037 JS Private Methods > private static methods > exfiltrated static private method has stable identity', async () => {
  const source =
    "() => {\n        class Foo {\n          static #bar() {\n            return 'bar';\n          }\n          static getBar() {\n            return Foo.#bar;\n          }\n        }\n        expect(Foo.getBar()).toBe(Foo.getBar());\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'getBar', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
            },
            'name',
            {
              value: 'getBar',
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
            return 'bar';
          },
        });
        return Foo;
      })();
      expect(Foo.getBar()).toBe(Foo.getBar());
    };"
  `);
});

test('038 JS Private Methods > private static methods > multiple static private methods', async () => {
  const source =
    "() => {\n        class Foo {\n          static #bar() {\n            return 'bar';\n          }\n          static #baz() {\n            return 'baz';\n          }\n          static test() {\n            return Foo.#bar() + Foo.#baz();\n          }\n        }\n        expect(Foo.test()).toBe('barbaz');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _baz = '__private_Foo_baz';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(Foo, _bar, []) + _classPrivateMethodCall(Foo, _baz, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 'bar';
          },
        });
        Object.defineProperty(Foo, _baz, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 'baz';
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toBe('barbaz');
    };"
  `);
});

test('039 JS Private Methods > private static methods > static private method is read-only', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              static #bar() {}\n              static {\n                Foo.#bar = 1;\n              }\n            }\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
        let Foo = (() => {
          'use strict';
          var _bar = '__private_Foo_bar';
          const Foo = function Foo() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          (function () {
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          }).call(Foo);
          Object.defineProperty(Foo, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
          return Foo;
        })();
      }).toThrow();
    };"
  `);
});

test('040 JS Private Methods > private static methods > static private method compound assignment throws', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              static #bar() {}\n              static {\n                Foo.#bar += 1;\n              }\n            }\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
        let Foo = (() => {
          'use strict';
          var _bar = '__private_Foo_bar';
          const Foo = function Foo() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          (function () {
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          }).call(Foo);
          Object.defineProperty(Foo, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
          return Foo;
        })();
      }).toThrow();
    };"
  `);
});

test('041 JS Private Methods > private static methods > super access from static private method', async () => {
  const source =
    "() => {\n        class Base {\n          static greet() {\n            return 'hello';\n          }\n        }\n        class Derived extends Base {\n          static #bar() {\n            return super.greet();\n          }\n          static test() {\n            return Derived.#bar();\n          }\n        }\n        expect(Derived.test()).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
    function _construct(t, r, c) {
      return _construct2.construct(t, r, c);
    }
    var _get2 = { get: require('@babel/runtime/helpers/get') };
    function _get(e, t, r) {
      return _get2.get(e, t, r);
    }
    () => {
      class Base {
        static greet() {
          return 'hello';
        }
      }
      let Derived = (__nox_super_114_297 => {
        'use strict';
        var _bar = '__private_Derived_bar';
        const Derived = function Derived() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          var _this = _construct(__nox_super_114_297, arguments, new.target || Derived);
          return _this;
        };
        if (__nox_super_114_297 !== null && typeof __nox_super_114_297 !== 'function')
          throw new TypeError('Super expression must either be null or a function');
        Derived.prototype = Object.create(__nox_super_114_297 && __nox_super_114_297.prototype, {
          constructor: {
            value: Derived,
            writable: true,
            configurable: true,
          },
        });
        if (Object.setPrototypeOf) Object.setPrototypeOf(Derived, __nox_super_114_297);
        else Derived.__proto__ = __nox_super_114_297;
        Object.defineProperty(Derived, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(Derived, _bar, []);
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
        Object.defineProperty(Derived, 'prototype', { writable: false });
        Object.defineProperty(Derived, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _get(Object.getPrototypeOf(Derived), 'greet', this).call(this);
          },
        });
        return Derived;
      })(Base);
      expect(Derived.test()).toBe('hello');
    };"
  `);
});

test('042 JS Private Methods > private static methods > this in static private method refers to class', async () => {
  const source =
    '() => {\n        class Foo {\n          static val = 42;\n          static #bar() {\n            return this.val;\n          }\n          static test() {\n            return this.#bar();\n          }\n        }\n        expect(Foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Foo.val = 42;
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return this.val;
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toBe(42);
    };"
  `);
});

test('043 [upstream xit] JS Private Methods > private static methods > static private method as tagged template', async () => {
  const source =
    "() => {\n        class Foo {\n          static #tag(strings, ...values) {\n            return { strings: Array.from(strings), values };\n          }\n          static test() {\n            return Foo.#tag`hi ${'there'}`;\n          }\n        }\n        const result = Foo.test();\n        expect(result.strings).toEqual(['hi ', '']);\n        expect(result.values).toEqual(['there']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _tag = '__private_Foo_tag';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(Foo, _tag)[_tag]\`hi \${'there'}\`;
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _tag, {
          value: function (strings, ...values) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return {
              strings: Array.from(strings),
              values,
            };
          },
        });
        return Foo;
      })();
      const result = Foo.test();
      expect(result.strings).toEqual(['hi ', '']);
      expect(result.values).toEqual(['there']);
    };"
  `);
});

test('044 JS Private Methods > private static methods > static private generator method', async () => {
  const source =
    '() => {\n        class Foo {\n          static *#gen() {\n            yield 10;\n            yield 20;\n          }\n          static test() {\n            return [...Foo.#gen()];\n          }\n        }\n        expect(Foo.test()).toEqual([10, 20]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _gen = '__private_Foo_gen';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return [..._classPrivateMethodCall(Foo, _gen, [])];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _gen, {
          value: function* () {
            yield 10;
            yield 20;
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toEqual([10, 20]);
    };"
  `);
});

test('045 JS Private Methods > private static methods > static private async method', async () => {
  const source =
    'async () => {\n        class Foo {\n          static async #compute(x) {\n            return await Promise.resolve(x * 2);\n          }\n          static async test() {\n            return await Foo.#compute(21);\n          }\n        }\n        expect(await Foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    async () => {
      let Foo = (() => {
        'use strict';
        var _compute = '__private_Foo_compute';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            async function () {
              return await _classPrivateMethodCall(Foo, _compute, [21]);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _compute, {
          value: async function (x) {
            return await Promise.resolve(x * 2);
          },
        });
        return Foo;
      })();
      expect(await Foo.test()).toBe(42);
    };"
  `);
});

test('046 JS Private Methods > private static accessors > static private getter', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 42;\n          static get #value() {\n            return Foo.#x;\n          }\n          static test() {\n            return Foo.#value;\n          }\n        }\n        expect(Foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(Foo, _value)[_value];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 42,
        });
        Object.defineProperty(Foo, _value, {
          get: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _classPrivateFieldLooseBase(Foo, _x)[_x];
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toBe(42);
    };"
  `);
});

test('047 JS Private Methods > private static accessors > static private setter', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 0;\n          static set #value(v) {\n            Foo.#x = v;\n          }\n          static get() {\n            return Foo.#x;\n          }\n          static test(v) {\n            Foo.#value = v;\n          }\n        }\n        Foo.test(42);\n        expect(Foo.get()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'get', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(Foo, _x)[_x];
            },
            'name',
            {
              value: 'get',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(Foo, _value)[_value] = v;
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 0,
        });
        Object.defineProperty(Foo, _value, {
          set: function (v) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            _classPrivateFieldLooseBase(Foo, _x)[_x] = v;
          },
        });
        return Foo;
      })();
      Foo.test(42);
      expect(Foo.get()).toBe(42);
    };"
  `);
});

test('048 JS Private Methods > private static accessors > static private getter and setter pair', async () => {
  const source =
    '() => {\n        class Foo {\n          static #x = 0;\n          static get #value() {\n            return Foo.#x;\n          }\n          static set #value(v) {\n            Foo.#x = v * 2;\n          }\n          static test() {\n            Foo.#value = 21;\n            return Foo.#value;\n          }\n        }\n        expect(Foo.test()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(Foo, _value)[_value] = 21;
              return _classPrivateFieldLooseBase(Foo, _value)[_value];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 0,
        });
        Object.defineProperty(Foo, _value, {
          get: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _classPrivateFieldLooseBase(Foo, _x)[_x];
          },
          set: function (v) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            _classPrivateFieldLooseBase(Foo, _x)[_x] = v * 2;
          },
        });
        return Foo;
      })();
      expect(Foo.test()).toBe(42);
    };"
  `);
});

test('049 JS Private Methods > private static accessors > static getter-only throws on set', async () => {
  const source =
    '() => {\n          expect(() => {\n            class Foo {\n              static get #bar() {\n                return 1;\n              }\n              static {\n                Foo.#bar = 2;\n              }\n            }\n          }).toThrow();\n        }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      expect(() => {
        let Foo = (() => {
          'use strict';
          var _bar = '__private_Foo_bar';
          const Foo = function Foo() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
          };
          Object.defineProperty(Foo, 'prototype', { writable: false });
          (function () {
            (() => {
              throw new TypeError('Attempted to set read only private field');
            })();
          }).call(Foo);
          Object.defineProperty(Foo, _bar, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 1;
            },
          });
          return Foo;
        })();
      }).toThrow();
    };"
  `);
});

test('050 JS Private Methods > inheritance and isolation > private methods are per-class (not inherited)', async () => {
  const source =
    "() => {\n        class Base {\n          #greet() {\n            return 'base';\n          }\n          test() {\n            return this.#greet();\n          }\n        }\n        class Child extends Base {\n          // Child does NOT have access to Base's #greet\n        }\n        const child = new Child();\n        // inherited public method still works because it calls #greet on Base\n        expect(child.test()).toBe('base');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Base = (() => {
        'use strict';
        var _greet = '__private_Base_greet';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _greet, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'base';
            },
          });
        };
        Object.defineProperty(Base.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _greet, []);
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
        Object.defineProperty(Base, 'prototype', { writable: false });
        return Base;
      })();
      class Child extends Base {}
      const child = new Child();
      // inherited public method still works because it calls #greet on Base
      expect(child.test()).toBe('base');
    };"
  `);
});

test('051 JS Private Methods > inheritance and isolation > subclass can define same-named private method', async () => {
  const source =
    "() => {\n        class Base {\n          #method() {\n            return 'base';\n          }\n          baseTest() {\n            return this.#method();\n          }\n        }\n        class Child extends Base {\n          #method() {\n            return 'child';\n          }\n          childTest() {\n            return this.#method();\n          }\n        }\n        const c = new Child();\n        expect(c.baseTest()).toBe('base');\n        expect(c.childTest()).toBe('child');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
    function _construct(t, r, c) {
      return _construct2.construct(t, r, c);
    }
    () => {
      let Base = (() => {
        'use strict';
        var _method = '__private_Base_method';
        const Base = function Base() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _method, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'base';
            },
          });
        };
        Object.defineProperty(Base.prototype, 'baseTest', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _method, []);
            },
            'name',
            {
              value: 'baseTest',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Base, 'prototype', { writable: false });
        return Base;
      })();
      let Child = (__nox_super_178_347 => {
        'use strict';
        var _method13 = '__private_Child_method';
        const Child = function Child() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          var _this = _construct(__nox_super_178_347, arguments, new.target || Child);
          (function () {
            Object.defineProperty(this, _method13, {
              value: function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                return 'child';
              },
            });
          }).call(_this);
          return _this;
        };
        if (__nox_super_178_347 !== null && typeof __nox_super_178_347 !== 'function')
          throw new TypeError('Super expression must either be null or a function');
        Child.prototype = Object.create(__nox_super_178_347 && __nox_super_178_347.prototype, {
          constructor: {
            value: Child,
            writable: true,
            configurable: true,
          },
        });
        if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_178_347);
        else Child.__proto__ = __nox_super_178_347;
        Object.defineProperty(Child.prototype, 'childTest', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _method13, []);
            },
            'name',
            {
              value: 'childTest',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Child, 'prototype', { writable: false });
        return Child;
      })(Base);
      const c = new Child();
      expect(c.baseTest()).toBe('base');
      expect(c.childTest()).toBe('child');
    };"
  `);
});

test('052 JS Private Methods > inheritance and isolation > private method access on wrong class instance throws', async () => {
  const source =
    "() => {\n        class A {\n          #foo() {\n            return 'a';\n          }\n          test(obj) {\n            return obj.#foo();\n          }\n        }\n        class B {}\n        const a = new A();\n        const b = new B();\n        expect(() => a.test(b)).toThrow();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let A = (() => {
        'use strict';
        var _foo = '__private_A_foo';
        const A = function A() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _foo, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'a';
            },
          });
        };
        Object.defineProperty(A.prototype, 'test', {
          value: Object.defineProperty(
            function (obj) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(obj, _foo, []);
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
        Object.defineProperty(A, 'prototype', { writable: false });
        return A;
      })();
      class B {}
      const a = new A();
      const b = new B();
      expect(() => a.test(b)).toThrow();
    };"
  `);
});

test('053 JS Private Methods > inheritance and isolation > different classes with same private method name are independent', async () => {
  const source =
    "() => {\n        class A {\n          #x() {\n            return 'A';\n          }\n          test() {\n            return this.#x();\n          }\n        }\n        class B {\n          #x() {\n            return 'B';\n          }\n          test() {\n            return this.#x();\n          }\n        }\n        expect(new A().test()).toBe('A');\n        expect(new B().test()).toBe('B');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let A = (() => {
        'use strict';
        var _x = '__private_A_x';
        const A = function A() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'A';
            },
          });
        };
        Object.defineProperty(A.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _x, []);
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
        Object.defineProperty(A, 'prototype', { writable: false });
        return A;
      })();
      let B = (() => {
        'use strict';
        var _x12 = '__private_B_x';
        const B = function B() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x12, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'B';
            },
          });
        };
        Object.defineProperty(B.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _x12, []);
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
        Object.defineProperty(B, 'prototype', { writable: false });
        return B;
      })();
      expect(new A().test()).toBe('A');
      expect(new B().test()).toBe('B');
    };"
  `);
});

test('054 JS Private Methods > private fields interaction > private method accessing private field', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 10;\n          #double() {\n            return this.#x * 2;\n          }\n          test() {\n            return this.#double();\n          }\n        }\n        expect(new Foo().test()).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _double = '__private_Foo_double';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 10,
          });
          Object.defineProperty(this, _double, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x] * 2;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _double, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(new Foo().test()).toBe(20);
    };"
  `);
});

test('055 JS Private Methods > private fields interaction > private method mutating private field', async () => {
  const source =
    '() => {\n        class Counter {\n          #count = 0;\n          #increment() {\n            this.#count++;\n          }\n          inc() {\n            this.#increment();\n            return this.#count;\n          }\n        }\n        const c = new Counter();\n        expect(c.inc()).toBe(1);\n        expect(c.inc()).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Counter = (() => {
        'use strict';
        var _increment = '__private_Counter_increment';
        var _count = '__private_Counter_count';
        const Counter = function Counter() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _count, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _increment, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _count)[_count]++;
            },
          });
        };
        Object.defineProperty(Counter.prototype, 'inc', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateMethodCall(this, _increment, []);
              return _classPrivateFieldLooseBase(this, _count)[_count];
            },
            'name',
            {
              value: 'inc',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Counter, 'prototype', { writable: false });
        return Counter;
      })();
      const c = new Counter();
      expect(c.inc()).toBe(1);
      expect(c.inc()).toBe(2);
    };"
  `);
});

test('056 JS Private Methods > private fields interaction > private setter validating before setting private field', async () => {
  const source =
    "() => {\n        class Temp {\n          #celsius = 0;\n          set #temperature(v) {\n            if (v < -273.15) throw new Error('below absolute zero');\n            this.#celsius = v;\n          }\n          get #temperature() {\n            return this.#celsius;\n          }\n          setTemp(v) {\n            this.#temperature = v;\n          }\n          getTemp() {\n            return this.#temperature;\n          }\n        }\n        const t = new Temp();\n        t.setTemp(100);\n        expect(t.getTemp()).toBe(100);\n        expect(() => t.setTemp(-300)).toThrow();\n        // Value unchanged after rejected set\n        expect(t.getTemp()).toBe(100);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Temp = (() => {
        'use strict';
        var _temperature = '__private_Temp_temperature';
        var _celsius = '__private_Temp_celsius';
        const Temp = function Temp() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _celsius, {
            writable: true,
            value: 0,
          });
          Object.defineProperty(this, _temperature, {
            get: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _celsius)[_celsius];
            },
            set: function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              if (v < -273.15) throw new Error('below absolute zero');
              _classPrivateFieldLooseBase(this, _celsius)[_celsius] = v;
            },
          });
        };
        Object.defineProperty(Temp.prototype, 'setTemp', {
          value: Object.defineProperty(
            function (v) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              _classPrivateFieldLooseBase(this, _temperature)[_temperature] = v;
            },
            'name',
            {
              value: 'setTemp',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Temp.prototype, 'getTemp', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _temperature)[_temperature];
            },
            'name',
            {
              value: 'getTemp',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Temp, 'prototype', { writable: false });
        return Temp;
      })();
      const t = new Temp();
      t.setTemp(100);
      expect(t.getTemp()).toBe(100);
      expect(() => t.setTemp(-300)).toThrow();
      // Value unchanged after rejected set
      expect(t.getTemp()).toBe(100);
    };"
  `);
});

test('057 JS Private Methods > edge cases > private method in expression class', async () => {
  const source =
    "() => {\n        const Foo = class {\n          #bar() {\n            return 'bar';\n          }\n          test() {\n            return this.#bar();\n          }\n        };\n        expect(new Foo().test()).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      const Foo = (() => {
        'use strict';
        var _bar = '__private__Class_bar';
        const _Class = function _Class() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'bar';
            },
          });
        };
        Object.defineProperty(_Class, 'name', {
          value: 'Foo',
          configurable: true,
        });
        Object.defineProperty(_Class.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(_Class, 'prototype', { writable: false });
        return _Class;
      })();
      expect(new Foo().test()).toBe('bar');
    };"
  `);
});

test('058 JS Private Methods > edge cases > private method in nested class', async () => {
  const source =
    "() => {\n        class Outer {\n          test() {\n            class Inner {\n              #foo() {\n                return 'inner';\n              }\n              test() {\n                return this.#foo();\n              }\n            }\n            return new Inner().test();\n          }\n        }\n        expect(new Outer().test()).toBe('inner');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      class Outer {
        test() {
          let Inner = (() => {
            'use strict';
            var _foo = '__private_Inner_foo';
            const Inner = function Inner() {
              if (!new.target) throw new TypeError('Cannot call a class as a function');
              Object.defineProperty(this, _foo, {
                value: function () {
                  if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                  return 'inner';
                },
              });
            };
            Object.defineProperty(Inner.prototype, 'test', {
              value: Object.defineProperty(
                function () {
                  if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                  return _classPrivateMethodCall(this, _foo, []);
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
            Object.defineProperty(Inner, 'prototype', { writable: false });
            return Inner;
          })();
          return new Inner().test();
        }
      }
      expect(new Outer().test()).toBe('inner');
    };"
  `);
});

test('059 JS Private Methods > edge cases > private method with symbol property on instance', async () => {
  const source =
    "() => {\n        const sym = Symbol('test');\n        class Foo {\n          [sym] = 'symbol-val';\n          #bar() {\n            return this[sym];\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        expect(new Foo().test()).toBe('symbol-val');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      const sym = Symbol('test');
      let Foo = (_key => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this[_key] = 'symbol-val';
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return this[sym];
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })(sym);
      expect(new Foo().test()).toBe('symbol-val');
    };"
  `);
});

test('060 JS Private Methods > edge cases > private method with computed public method', async () => {
  const source =
    "() => {\n        const key = 'myMethod';\n        class Foo {\n          #priv() {\n            return 'private';\n          }\n          [key]() {\n            return this.#priv();\n          }\n        }\n        expect(new Foo().myMethod()).toBe('private');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      const key = 'myMethod';
      let Foo = (_key => {
        'use strict';
        var _priv = '__private_Foo_priv';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _priv, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'private';
            },
          });
        };
        Object.defineProperty(Foo.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _priv, []);
            },
            'name',
            {
              value:
                typeof _key === 'symbol'
                  ? _key.description === void 0
                    ? ''
                    : '[' + _key.description + ']'
                  : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })(key);
      expect(new Foo().myMethod()).toBe('private');
    };"
  `);
});

test('061 JS Private Methods > edge cases > multiple instances have independent private state but shared method identity', async () => {
  const source =
    '() => {\n        class Foo {\n          #val;\n          constructor(val) {\n            this.#val = val;\n          }\n          #getVal() {\n            return this.#val;\n          }\n          test() {\n            return this.#getVal();\n          }\n          getMethod() {\n            return this.#getVal;\n          }\n        }\n        const a = new Foo(1);\n        const b = new Foo(2);\n        expect(a.test()).toBe(1);\n        expect(b.test()).toBe(2);\n        // Private methods share identity across instances\n        expect(a.getMethod()).toBe(b.getMethod());\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _getVal = '__private_Foo_getVal';
        var _val = '__private_Foo_val';
        const Foo = function Foo(val) {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _val, {
            writable: true,
            value: void 0,
          });
          Object.defineProperty(this, _getVal, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _val)[_val];
            },
          });
          _classPrivateFieldLooseBase(this, _val)[_val] = val;
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _getVal, []);
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
        Object.defineProperty(Foo.prototype, 'getMethod', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _getVal)[_getVal];
            },
            'name',
            {
              value: 'getMethod',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const a = new Foo(1);
      const b = new Foo(2);
      expect(a.test()).toBe(1);
      expect(b.test()).toBe(2);
      // Private methods share identity across instances
      expect(a.getMethod()).toBe(b.getMethod());
    };"
  `);
});

test('062 JS Private Methods > edge cases > private method in class with constructor returning different object', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 10;\n          #bar() {\n            return this.#x;\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        // Normal instance works\n        expect(new Foo().test()).toBe(10);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 10,
          });
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x];
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      // Normal instance works
      expect(new Foo().test()).toBe(10);
    };"
  `);
});

test('063 JS Private Methods > edge cases > private static method not accessible on instances', async () => {
  const source =
    "() => {\n        class Foo {\n          static #bar() {\n            return 42;\n          }\n          static test() {\n            return Foo.#bar();\n          }\n          instanceTest() {\n            // Can't access static private from instance\n            return Foo.test();\n          }\n        }\n        expect(new Foo().instanceTest()).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(Foo, _bar, []);
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
        Object.defineProperty(Foo.prototype, 'instanceTest', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              // Can't access static private from instance
              return Foo.test();
            },
            'name',
            {
              value: 'instanceTest',
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
            return 42;
          },
        });
        return Foo;
      })();
      expect(new Foo().instanceTest()).toBe(42);
    };"
  `);
});

test('064 [upstream xit] JS Private Methods > edge cases > toString does not reveal private method names', async () => {
  const source =
    "() => {\n        class Foo {\n          #secret() {\n            return 42;\n          }\n          test() {\n            return this.#secret();\n          }\n        }\n        const foo = new Foo();\n        const keys = Object.getOwnPropertyNames(foo);\n        const hasPrivate = keys.some((k) => k.includes('secret'));\n        expect(hasPrivate).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _secret = '__private_Foo_secret';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _secret, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _secret, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const keys = Object.getOwnPropertyNames(foo);
      const hasPrivate = keys.some(k => k.includes('secret'));
      expect(hasPrivate).toBe(false);
    };"
  `);
});

test('065 JS Private Methods > edge cases > for-in does not enumerate private methods', async () => {
  const source =
    "() => {\n        class Foo {\n          #secret() {}\n          pub = 1;\n        }\n        const foo = new Foo();\n        const keys = [];\n        for (const k in foo) {\n          keys.push(k);\n        }\n        // In loose mode, the transformed key is non-enumerable.\n        // With native private methods, the key wouldn't exist at all.\n        // Either way, no key named '#secret' is enumerable.\n        expect(keys.indexOf('#secret')).toBe(-1);\n        expect(keys.indexOf('pub') >= 0).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let Foo = (() => {
        'use strict';
        var _secret = '__private_Foo_secret';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.pub = 1;
          Object.defineProperty(this, _secret, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const keys = [];
      for (const k in foo) {
        keys.push(k);
      }
      // In loose mode, the transformed key is non-enumerable.
      // With native private methods, the key wouldn't exist at all.
      // Either way, no key named '#secret' is enumerable.
      expect(keys.indexOf('#secret')).toBe(-1);
      expect(keys.indexOf('pub') >= 0).toBe(true);
    };"
  `);
});

test('066 JS Private Methods > edge cases > JSON.stringify only includes public properties', async () => {
  const source =
    '() => {\n        class Foo {\n          #method() {\n            return 42;\n          }\n          x = 1;\n        }\n        const foo = new Foo();\n        const parsed = JSON.parse(JSON.stringify(foo));\n        expect(parsed.x).toBe(1);\n        // Private method storage (loose or native) should not appear\n        var keyCount = Object.keys(parsed).length;\n        expect(keyCount).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let Foo = (() => {
        'use strict';
        var _method = '__private_Foo_method';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.x = 1;
          Object.defineProperty(this, _method, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 42;
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const foo = new Foo();
      const parsed = JSON.parse(JSON.stringify(foo));
      expect(parsed.x).toBe(1);
      // Private method storage (loose or native) should not appear
      var keyCount = Object.keys(parsed).length;
      expect(keyCount).toBe(1);
    };"
  `);
});

test('067 JS Private Methods > edge cases > Object.keys does not include private methods', async () => {
  const source =
    "() => {\n        class Foo {\n          #method() {}\n          x = 1;\n        }\n        const keys = Object.keys(new Foo());\n        expect(keys.indexOf('x') >= 0).toBe(true);\n        expect(keys.length).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let Foo = (() => {
        'use strict';
        var _method = '__private_Foo_method';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          this.x = 1;
          Object.defineProperty(this, _method, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
          });
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      const keys = Object.keys(new Foo());
      expect(keys.indexOf('x') >= 0).toBe(true);
      expect(keys.length).toBe(1);
    };"
  `);
});

test('068 JS Private Methods > edge cases > typeof private method is function', async () => {
  const source =
    "() => {\n        class Foo {\n          #bar() {}\n          test() {\n            return typeof this.#bar;\n          }\n        }\n        expect(new Foo().test()).toBe('function');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return typeof _classPrivateFieldLooseBase(this, _bar)[_bar];
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      expect(new Foo().test()).toBe('function');
    };"
  `);
});

test('069 JS Private Methods > edge cases > constructor returning different object loses private brand', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 10;\n          #bar() {\n            return this.#x;\n          }\n          constructor(override) {\n            if (override) return override;\n          }\n          test() {\n            return this.#bar();\n          }\n        }\n        // Normal construction installs brand\n        expect(new Foo().test()).toBe(10);\n        // Overridden constructor returns a plain object without the brand\n        const plain = {};\n        const result = new Foo(plain);\n        expect(result).toBe(plain);\n        expect(result.test).toBeUndefined();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _x = '__private_Foo_x';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo(override) {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _x, {
            writable: true,
            value: 10,
          });
          Object.defineProperty(this, _bar, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _x)[_x];
            },
          });
          if (override) return override;
        };
        Object.defineProperty(Foo.prototype, 'test', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateMethodCall(this, _bar, []);
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
        Object.defineProperty(Foo, 'prototype', { writable: false });
        return Foo;
      })();
      // Normal construction installs brand
      expect(new Foo().test()).toBe(10);
      // Overridden constructor returns a plain object without the brand
      const plain = {};
      const result = new Foo(plain);
      expect(result).toBe(plain);
      expect(result.test).toBeUndefined();
    };"
  `);
});

test('070 JS Private Methods > edge cases > private method as detached callback loses this', async () => {
  const source =
    '() => {\n        class Foo {\n          #val = 42;\n          #getVal() {\n            return this.#val;\n          }\n          getCallback() {\n            // Wrapping in arrow preserves this\n            return () => this.#getVal();\n          }\n          getDetached() {\n            return this.#getVal;\n          }\n        }\n        const foo = new Foo();\n        // Arrow-wrapped callback works\n        expect(foo.getCallback()()).toBe(42);\n        // Detached loses this context — calling without a receiver\n        const detached = foo.getDetached();\n        expect(() => detached()).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let Foo = (() => {
        'use strict';
        var _getVal = '__private_Foo_getVal';
        var _val = '__private_Foo_val';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          Object.defineProperty(this, _val, {
            writable: true,
            value: 42,
          });
          Object.defineProperty(this, _getVal, {
            value: function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _val)[_val];
            },
          });
        };
        Object.defineProperty(Foo.prototype, 'getCallback', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              // Wrapping in arrow preserves this
              return () => _classPrivateMethodCall(this, _getVal, []);
            },
            'name',
            {
              value: 'getCallback',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Foo.prototype, 'getDetached', {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return _classPrivateFieldLooseBase(this, _getVal)[_getVal];
            },
            'name',
            {
              value: 'getDetached',
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
      // Arrow-wrapped callback works
      expect(foo.getCallback()()).toBe(42);
      // Detached loses this context — calling without a receiver
      const detached = foo.getDetached();
      expect(() => detached()).toThrow();
    };"
  `);
});

test('071 JS Private Methods > edge cases > private method with closure over constructor parameter', async () => {
  const source =
    '() => {\n        class Foo {\n          #fn;\n          constructor(multiplier) {\n            this.#fn = (x) => x * multiplier;\n          }\n          test(x) {\n            return this.#fn(x);\n          }\n        }\n        expect(new Foo(3).test(7)).toBe(21);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Foo {
        #fn;
        constructor(multiplier) {
          this.#fn = x => x * multiplier;
        }
        test(x) {
          return this.#fn(x);
        }
      }
      expect(new Foo(3).test(7)).toBe(21);
    };"
  `);
});

test('072 JS Private Methods > static blocks > static block can access private static method', async () => {
  const source =
    "() => {\n        let captured;\n        class Foo {\n          static #bar() {\n            return 'from static block';\n          }\n          static {\n            captured = Foo.#bar();\n          }\n        }\n        expect(captured).toBe('from static block');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let captured;
      let Foo = (() => {
        'use strict';
        var _bar = '__private_Foo_bar';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        (function () {
          captured = _classPrivateMethodCall(Foo, _bar, []);
        }).call(Foo);
        Object.defineProperty(Foo, _bar, {
          value: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 'from static block';
          },
        });
        return Foo;
      })();
      expect(captured).toBe('from static block');
    };"
  `);
});

test('073 JS Private Methods > static blocks > static block can access private static accessor', async () => {
  const source =
    '() => {\n        let captured;\n        class Foo {\n          static #x = 42;\n          static get #value() {\n            return Foo.#x;\n          }\n          static {\n            captured = Foo.#value;\n          }\n        }\n        expect(captured).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
    () => {
      let captured;
      let Foo = (() => {
        'use strict';
        var _value = '__private_Foo_value';
        var _x = '__private_Foo_x';
        const Foo = function Foo() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Foo, 'prototype', { writable: false });
        Object.defineProperty(Foo, _x, {
          writable: true,
          value: 42,
        });
        (function () {
          captured = _classPrivateFieldLooseBase(Foo, _value)[_value];
        }).call(Foo);
        Object.defineProperty(Foo, _value, {
          get: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _classPrivateFieldLooseBase(Foo, _x)[_x];
          },
        });
        return Foo;
      })();
      expect(captured).toBe(42);
    };"
  `);
});

test('074 JS Private Methods > private-in checks (ergonomic brand checks) > #field in obj for instance with private method', async () => {
  const source =
    '() => {\n        class Foo {\n          #bar() {}\n          static check(obj) {\n            return #bar in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n        // `in` operator throws TypeError for non-object right-hand side\n        expect(() => Foo.check(42)).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
      expect(Foo.check(new Foo())).toBe(true);
      expect(Foo.check({})).toBe(false);
      // \`in\` operator throws TypeError for non-object right-hand side
      expect(() => Foo.check(42)).toThrow();
    };"
  `);
});

test('075 JS Private Methods > private-in checks (ergonomic brand checks) > #field in obj for instance with private field', async () => {
  const source =
    '() => {\n        class Foo {\n          #x = 1;\n          static check(obj) {\n            return #x in obj;\n          }\n        }\n        expect(Foo.check(new Foo())).toBe(true);\n        expect(Foo.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
      expect(Foo.check({})).toBe(false);
    };"
  `);
});

test('076 JS Private Methods > private-in checks (ergonomic brand checks) > #field in obj with inheritance', async () => {
  const source =
    '() => {\n        class Base {\n          #secret() {}\n          static check(obj) {\n            return #secret in obj;\n          }\n        }\n        class Child extends Base {}\n        expect(Base.check(new Base())).toBe(true);\n        expect(Base.check(new Child())).toBe(true);\n        expect(Base.check({})).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: { loose: true } },
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
      expect(Base.check(new Base())).toBe(true);
      expect(Base.check(new Child())).toBe(true);
      expect(Base.check({})).toBe(false);
    };"
  `);
});
