// Generated from apps/test-suite/tests/JSAsync.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Async > basic async/await > async function returns a promise', async () => {
  const source =
    '() => {\n        async function foo() {\n          return 42;\n        }\n        const result = foo();\n        expect(result instanceof Promise).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    () => {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return 42;
        });
        return _foo.apply(this, arguments);
      }
      const result = foo();
      expect(result instanceof Promise).toBe(true);
    };"
  `);
});

test('002 JS Async > basic async/await > await resolves promise value', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return await Promise.resolve(42);\n        }\n        expect(await foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return yield Promise.resolve(42);
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(42);
    });"
  `);
});

test('003 JS Async > basic async/await > async function returning non-promise wraps in promise', async () => {
  const source =
    "async () => {\n        async function foo() {\n          return 'hello';\n        }\n        expect(await foo()).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return 'hello';
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe('hello');
    });"
  `);
});

test('004 JS Async > basic async/await > await non-promise value passes through', async () => {
  const source =
    'async () => {\n        async function foo() {\n          const x = await 42;\n          return x;\n        }\n        expect(await foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          const x = yield 42;
          return x;
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(42);
    });"
  `);
});

test('005 JS Async > basic async/await > sequential awaits', async () => {
  const source =
    'async () => {\n        async function foo() {\n          const a = await Promise.resolve(1);\n          const b = await Promise.resolve(2);\n          const c = await Promise.resolve(3);\n          return a + b + c;\n        }\n        expect(await foo()).toBe(6);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          const a = yield Promise.resolve(1);
          const b = yield Promise.resolve(2);
          const c = yield Promise.resolve(3);
          return a + b + c;
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(6);
    });"
  `);
});

test('006 JS Async > basic async/await > await in expression position', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return (await Promise.resolve(10)) + (await Promise.resolve(32));\n        }\n        expect(await foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return (yield Promise.resolve(10)) + (yield Promise.resolve(32));
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(42);
    });"
  `);
});

test('007 JS Async > error handling > rejected promise throws on await', async () => {
  const source =
    "async () => {\n        async function foo() {\n          try {\n            await Promise.reject(new Error('fail'));\n            return 'no error';\n          } catch (e) {\n            return e.message;\n          }\n        }\n        expect(await foo()).toBe('fail');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          try {
            yield Promise.reject(new Error('fail'));
            return 'no error';
          } catch (e) {
            return e.message;
          }
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe('fail');
    });"
  `);
});

test('008 JS Async > error handling > throw in async function rejects the promise', async () => {
  const source =
    "async () => {\n        async function foo() {\n          throw new Error('oops');\n        }\n        try {\n          await foo();\n          expect(true).toBe(false); // should not reach\n        } catch (e) {\n          expect(e.message).toBe('oops');\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          throw new Error('oops');
        });
        return _foo.apply(this, arguments);
      }
      try {
        yield foo();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('oops');
      }
    });"
  `);
});

test('009 JS Async > error handling > try-catch-finally with await', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function foo() {\n          try {\n            log.push('try');\n            await Promise.reject(new Error('err'));\n          } catch (e) {\n            log.push('catch');\n          } finally {\n            log.push('finally');\n          }\n        }\n        await foo();\n        expect(log).toEqual(['try', 'catch', 'finally']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const log = [];
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          try {
            log.push('try');
            yield Promise.reject(new Error('err'));
          } catch (e) {
            log.push('catch');
          } finally {
            log.push('finally');
          }
        });
        return _foo.apply(this, arguments);
      }
      yield foo();
      expect(log).toEqual(['try', 'catch', 'finally']);
    });"
  `);
});

test('010 JS Async > error handling > nested try-catch with async', async () => {
  const source =
    "async () => {\n        async function inner() {\n          throw new Error('inner');\n        }\n        async function outer() {\n          try {\n            await inner();\n          } catch (e) {\n            return 'caught: ' + e.message;\n          }\n        }\n        expect(await outer()).toBe('caught: inner');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function inner() {
        return _inner.apply(this, arguments);
      }
      function _inner() {
        _inner = _asyncToGenerator(function* () {
          throw new Error('inner');
        });
        return _inner.apply(this, arguments);
      }
      function outer() {
        return _outer.apply(this, arguments);
      }
      function _outer() {
        _outer = _asyncToGenerator(function* () {
          try {
            yield inner();
          } catch (e) {
            return 'caught: ' + e.message;
          }
        });
        return _outer.apply(this, arguments);
      }
      expect(yield outer()).toBe('caught: inner');
    });"
  `);
});

test('011 JS Async > error handling > error after await does not lose context', async () => {
  const source =
    "async () => {\n        async function foo() {\n          await Promise.resolve();\n          throw new Error('after await');\n        }\n        try {\n          await foo();\n          expect(true).toBe(false);\n        } catch (e) {\n          expect(e.message).toBe('after await');\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          yield Promise.resolve();
          throw new Error('after await');
        });
        return _foo.apply(this, arguments);
      }
      try {
        yield foo();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('after await');
      }
    });"
  `);
});

test('012 JS Async > async arrow functions > basic async arrow', async () => {
  const source =
    'async () => {\n        const foo = async () => 42;\n        expect(await foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const foo = (function () {
        var _ref = _asyncToGenerator(function* () {
          return 42;
        });
        return function foo() {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield foo()).toBe(42);
    });"
  `);
});

test('013 JS Async > async arrow functions > async arrow with await', async () => {
  const source =
    'async () => {\n        const foo = async (x) => {\n          const result = await Promise.resolve(x * 2);\n          return result;\n        };\n        expect(await foo(21)).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const foo = (function () {
        var _ref = _asyncToGenerator(function* (x) {
          const result = yield Promise.resolve(x * 2);
          return result;
        });
        return function foo(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield foo(21)).toBe(42);
    });"
  `);
});

test('014 JS Async > async arrow functions > async arrow preserves this from enclosing scope', async () => {
  const source =
    'async () => {\n        const obj = {\n          val: 42,\n          getVal: function () {\n            const fn = async () => {\n              return await Promise.resolve(this.val);\n            };\n            return fn();\n          },\n        };\n        expect(await obj.getVal()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const obj = {
        val: 42,
        getVal: function () {
          var _this = this;
          const fn = (function () {
            var _ref = _asyncToGenerator(function* () {
              return yield Promise.resolve(_this.val);
            });
            return function fn() {
              return _ref.apply(this, arguments);
            };
          })();
          return fn();
        },
      };
      expect(yield obj.getVal()).toBe(42);
    });"
  `);
});

test('015 JS Async > async arrow functions > async arrow preserves name property', async () => {
  const source =
    "() => {\n        var concat = async (...args) => {\n          var x = args[0];\n          var y = args[1];\n        };\n        expect(concat.name).toBe('concat');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    () => {
      var concat = (function () {
        var _ref = _asyncToGenerator(function* (...args) {
          var x = args[0];
          var y = args[1];
        });
        return function concat() {
          return _ref.apply(this, arguments);
        };
      })();
      expect(concat.name).toBe('concat');
    };"
  `);
});

test('016 JS Async > async arrow functions > async function preserves length property', async () => {
  const source =
    '() => {\n        var a = async (b) => {};\n        expect(a.length).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    () => {
      var a = (function () {
        var _ref = _asyncToGenerator(function* (b) {});
        return function a(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(a.length).toBe(1);
    };"
  `);
});

test('017 JS Async > async methods > async class method', async () => {
  const source =
    'async () => {\n        class Foo {\n          async bar() {\n            return await Promise.resolve(42);\n          }\n        }\n        expect(await new Foo().bar()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Foo {
        bar() {
          return _asyncToGenerator(function* () {
            return yield Promise.resolve(42);
          })();
        }
      }
      expect(yield new Foo().bar()).toBe(42);
    });"
  `);
});

test('018 JS Async > async methods > async static method', async () => {
  const source =
    'async () => {\n        class Foo {\n          static async bar() {\n            return await Promise.resolve(42);\n          }\n        }\n        expect(await Foo.bar()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Foo {
        static bar() {
          return _asyncToGenerator(function* () {
            return yield Promise.resolve(42);
          })();
        }
      }
      expect(yield Foo.bar()).toBe(42);
    });"
  `);
});

test('019 JS Async > async methods > async object method', async () => {
  const source =
    'async () => {\n        const obj = {\n          async foo() {\n            return await Promise.resolve(42);\n          },\n        };\n        expect(await obj.foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const obj = {
        foo() {
          return _asyncToGenerator(function* () {
            return yield Promise.resolve(42);
          })();
        },
      };
      expect(yield obj.foo()).toBe(42);
    });"
  `);
});

test('020 JS Async > async methods > async method preserves this', async () => {
  const source =
    'async () => {\n        class Foo {\n          constructor(val) {\n            this.val = val;\n          }\n          async getVal() {\n            return await Promise.resolve(this.val);\n          }\n        }\n        expect(await new Foo(42).getVal()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Foo {
        constructor(val) {
          this.val = val;
        }
        getVal() {
          var _this = this;
          return _asyncToGenerator(function* () {
            return yield Promise.resolve(_this.val);
          })();
        }
      }
      expect(yield new Foo(42).getVal()).toBe(42);
    });"
  `);
});

test('021 JS Async > complex parameters > async method with destructured parameter that throws', async () => {
  const source =
    'async () => {\n        let caught = false;\n        class Foo {\n          async bar(a, { b }) {}\n        }\n        try {\n          await new Foo().bar();\n        } catch (e) {\n          caught = true;\n        }\n        expect(caught).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      let caught = false;
      class Foo {
        bar(a, { b }) {
          return _asyncToGenerator(function* () {})();
        }
      }
      try {
        yield new Foo().bar();
      } catch (e) {
        caught = true;
      }
      expect(caught).toBe(true);
    });"
  `);
});

test('022 JS Async > complex parameters > async method with destructured parameter', async () => {
  const source =
    'async () => {\n        class Foo {\n          async bar(a, { b }) {\n            return [a, b];\n          }\n        }\n        expect(await new Foo().bar(1, { b: 2 })).toEqual([1, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Foo {
        bar(a, { b }) {
          return _asyncToGenerator(function* () {
            return [a, b];
          })();
        }
      }
      expect(yield new Foo().bar(1, { b: 2 })).toEqual([1, 2]);
    });"
  `);
});

test('023 JS Async > complex parameters > async method with default parameter', async () => {
  const source =
    "async () => {\n        async function foo(\n          a,\n          b = (() => {\n            throw new Error('required');\n          })()\n        ) {\n          return [a, b];\n        }\n        expect(await foo(1, 2)).toEqual([1, 2]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo(_x) {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* (
          a,
          b = (() => {
            throw new Error('required');
          })(),
        ) {
          return [a, b];
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo(1, 2)).toEqual([1, 2]);
    });"
  `);
});

test('024 JS Async > complex parameters > async function with mandatory default throws on missing param', async () => {
  const source =
    "async () => {\n        function mandatory(name) {\n          throw new Error('Missing: ' + name);\n        }\n        async function foo({ a, b = mandatory('b') } = {}) {\n          return b;\n        }\n        try {\n          await foo();\n          expect(true).toBe(false);\n        } catch (e) {\n          expect(e.message).toBe('Missing: b');\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function mandatory(name) {
        throw new Error('Missing: ' + name);
      }
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* ({ a, b = mandatory('b') } = {}) {
          return b;
        });
        return _foo.apply(this, arguments);
      }
      try {
        yield foo();
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Missing: b');
      }
    });"
  `);
});

test('025 JS Async > complex parameters > async method with rest parameter', async () => {
  const source =
    'async () => {\n        class Foo {\n          async bar(a, ...b) {\n            return [a, b];\n          }\n        }\n        expect(await new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Foo {
        bar(a, ...b) {
          return _asyncToGenerator(function* () {
            return [a, b];
          })();
        }
      }
      expect(yield new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);
    });"
  `);
});

test('026 JS Async > complex parameters > async method with super access', async () => {
  const source =
    "async () => {\n        class Base {\n          get val() {\n            return 'base';\n          }\n        }\n        class Child extends Base {\n          async foo(a, { b }) {\n            return [a, b, super.val];\n          }\n        }\n        expect(await new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Base {
        get val() {
          return 'base';
        }
      }
      class Child extends Base {
        foo(a, { b }) {
          var _superprop_getVal = () => super.val;
          return _asyncToGenerator(function* () {
            return [a, b, _superprop_getVal()];
          })();
        }
      }
      expect(yield new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);
    });"
  `);
});

test('027 JS Async > execution order > code after await runs asynchronously', async () => {
  const source =
    'async () => {\n        const log = [];\n        async function foo() {\n          log.push(1);\n          await null;\n          log.push(2);\n        }\n        const p = foo();\n        log.push(3);\n        await p;\n        expect(log).toEqual([1, 3, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const log = [];
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          log.push(1);
          yield null;
          log.push(2);
        });
        return _foo.apply(this, arguments);
      }
      const p = foo();
      log.push(3);
      yield p;
      expect(log).toEqual([1, 3, 2]);
    });"
  `);
});

test('028 JS Async > execution order > multiple async functions interleave correctly', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function a() {\n          log.push('a1');\n          await null;\n          log.push('a2');\n        }\n        async function b() {\n          log.push('b1');\n          await null;\n          log.push('b2');\n        }\n        await Promise.all([a(), b()]);\n        expect(log[0]).toBe('a1');\n        expect(log[1]).toBe('b1');\n        // a2 and b2 ordering depends on microtask queue\n        expect(log.indexOf('a2') >= 0).toBe(true);\n        expect(log.indexOf('b2') >= 0).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const log = [];
      function a() {
        return _a.apply(this, arguments);
      }
      function _a() {
        _a = _asyncToGenerator(function* () {
          log.push('a1');
          yield null;
          log.push('a2');
        });
        return _a.apply(this, arguments);
      }
      function b() {
        return _b.apply(this, arguments);
      }
      function _b() {
        _b = _asyncToGenerator(function* () {
          log.push('b1');
          yield null;
          log.push('b2');
        });
        return _b.apply(this, arguments);
      }
      yield Promise.all([a(), b()]);
      expect(log[0]).toBe('a1');
      expect(log[1]).toBe('b1');
      // a2 and b2 ordering depends on microtask queue
      expect(log.indexOf('a2') >= 0).toBe(true);
      expect(log.indexOf('b2') >= 0).toBe(true);
    });"
  `);
});

test('029 JS Async > execution order > double await adds extra microtask delay', async () => {
  const source =
    'async () => {\n        const log = [];\n\n        const p1 = (async function () {\n          log.push(1);\n          await await null;\n          log.push(2);\n        })();\n\n        const p2 = (async function () {\n          log.push(3);\n          await null;\n          log.push(4);\n        })();\n\n        log.push(5);\n\n        await Promise.all([p1, p2]);\n        // 4 should come before 2 due to double-await extra tick\n        expect(log.indexOf(4) < log.indexOf(2)).toBe(true);\n        expect(log[0]).toBe(1);\n        expect(log[1]).toBe(3);\n        expect(log[2]).toBe(5);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const log = [];
      const p1 = _asyncToGenerator(function* () {
        log.push(1);
        yield yield null;
        log.push(2);
      })();
      const p2 = _asyncToGenerator(function* () {
        log.push(3);
        yield null;
        log.push(4);
      })();
      log.push(5);
      yield Promise.all([p1, p2]);
      // 4 should come before 2 due to double-await extra tick
      expect(log.indexOf(4) < log.indexOf(2)).toBe(true);
      expect(log[0]).toBe(1);
      expect(log[1]).toBe(3);
      expect(log[2]).toBe(5);
    });"
  `);
});

test('030 JS Async > closures and loops > async closure in for-of captures correct value', async () => {
  const source =
    'async () => {\n        let items = [1, 2, 3, 4];\n        let output = [];\n        for (const item of items) {\n          await (async (x) => {\n            output.push(item);\n          })();\n        }\n        expect(output).toEqual([1, 2, 3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      let items = [1, 2, 3, 4];
      let output = [];
      for (const item of items) {
        yield (function () {
          var _ref = _asyncToGenerator(function* (x) {
            output.push(item);
          });
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })()();
      }
      expect(output).toEqual([1, 2, 3, 4]);
    });"
  `);
});

test('031 JS Async > closures and loops > await in for loop with closure', async () => {
  const source =
    'async () => {\n        const results = [];\n        for (let i = 0; i < 3; i++) {\n          const val = await Promise.resolve(i * 10);\n          results.push(() => val);\n        }\n        expect(results[0]()).toBe(0);\n        expect(results[1]()).toBe(10);\n        expect(results[2]()).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const results = [];
      for (let i = 0; i < 3; i++) {
        const val = yield Promise.resolve(i * 10);
        results.push(() => val);
      }
      expect(results[0]()).toBe(0);
      expect(results[1]()).toBe(10);
      expect(results[2]()).toBe(20);
    });"
  `);
});

test('032 JS Async > closures and loops > await in while loop', async () => {
  const source =
    'async () => {\n        let sum = 0;\n        let i = 0;\n        while (i < 5) {\n          sum += await Promise.resolve(i);\n          i++;\n        }\n        expect(sum).toBe(10);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      let sum = 0;
      let i = 0;
      while (i < 5) {
        sum += yield Promise.resolve(i);
        i++;
      }
      expect(sum).toBe(10);
    });"
  `);
});

test('033 JS Async > closures and loops > recursive async function (polling pattern)', async () => {
  const source =
    'async () => {\n        const log = [];\n        async function collect(count) {\n          log.push(await Promise.resolve(count));\n          if (count < 3) {\n            await collect(count + 1);\n          }\n        }\n        await collect(0);\n        expect(log).toEqual([0, 1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const log = [];
      function collect(_x) {
        return _collect.apply(this, arguments);
      }
      function _collect() {
        _collect = _asyncToGenerator(function* (count) {
          log.push(yield Promise.resolve(count));
          if (count < 3) {
            yield collect(count + 1);
          }
        });
        return _collect.apply(this, arguments);
      }
      yield collect(0);
      expect(log).toEqual([0, 1, 2, 3]);
    });"
  `);
});

test('034 JS Async > hoisting and declarations > async function declaration is hoisted', async () => {
  const source =
    'async () => {\n        // Call before declaration\n        const result = await foo();\n        expect(result).toBe(42);\n\n        async function foo() {\n          return 42;\n        }\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      // Call before declaration
      const result = yield foo();
      expect(result).toBe(42);
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return 42;
        });
        return _foo.apply(this, arguments);
      }
    });"
  `);
});

test('035 JS Async > hoisting and declarations > async function expression is not hoisted', async () => {
  const source =
    '() => {\n        expect(() => {\n          bar();\n        }).toThrow();\n\n        var bar = async function () {\n          return 42;\n        };\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    () => {
      expect(() => {
        bar();
      }).toThrow();
      var bar = _asyncToGenerator(function* () {
        return 42;
      });
    };"
  `);
});

test('036 JS Async > parallel patterns > Promise.all with multiple async calls', async () => {
  const source =
    'async () => {\n        async function double(x) {\n          return await Promise.resolve(x * 2);\n        }\n        const results = await Promise.all([double(1), double(2), double(3)]);\n        expect(results).toEqual([2, 4, 6]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function double(_x) {
        return _double.apply(this, arguments);
      }
      function _double() {
        _double = _asyncToGenerator(function* (x) {
          return yield Promise.resolve(x * 2);
        });
        return _double.apply(this, arguments);
      }
      const results = yield Promise.all([double(1), double(2), double(3)]);
      expect(results).toEqual([2, 4, 6]);
    });"
  `);
});

test('037 JS Async > parallel patterns > Promise.race with async functions', async () => {
  const source =
    "async () => {\n        async function fast() {\n          return 'fast';\n        }\n        async function slow() {\n          await new Promise((r) => setTimeout(r, 100));\n          return 'slow';\n        }\n        const result = await Promise.race([fast(), slow()]);\n        expect(result).toBe('fast');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function fast() {
        return _fast.apply(this, arguments);
      }
      function _fast() {
        _fast = _asyncToGenerator(function* () {
          return 'fast';
        });
        return _fast.apply(this, arguments);
      }
      function slow() {
        return _slow.apply(this, arguments);
      }
      function _slow() {
        _slow = _asyncToGenerator(function* () {
          yield new Promise(r => setTimeout(r, 100));
          return 'slow';
        });
        return _slow.apply(this, arguments);
      }
      const result = yield Promise.race([fast(), slow()]);
      expect(result).toBe('fast');
    });"
  `);
});

test('038 JS Async > parallel patterns > Promise.allSettled with mixed results', async () => {
  const source =
    "async () => {\n        async function succeed() {\n          return 'ok';\n        }\n        async function fail() {\n          throw new Error('fail');\n        }\n        const results = await Promise.allSettled([succeed(), fail()]);\n        expect(results[0].status).toBe('fulfilled');\n        expect(results[0].value).toBe('ok');\n        expect(results[1].status).toBe('rejected');\n        expect(results[1].reason.message).toBe('fail');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function succeed() {
        return _succeed.apply(this, arguments);
      }
      function _succeed() {
        _succeed = _asyncToGenerator(function* () {
          return 'ok';
        });
        return _succeed.apply(this, arguments);
      }
      function fail() {
        return _fail.apply(this, arguments);
      }
      function _fail() {
        _fail = _asyncToGenerator(function* () {
          throw new Error('fail');
        });
        return _fail.apply(this, arguments);
      }
      const results = yield Promise.allSettled([succeed(), fail()]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value).toBe('ok');
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason.message).toBe('fail');
    });"
  `);
});

test('039 JS Async > edge cases > async IIFE', async () => {
  const source =
    'async () => {\n        const result = await (async () => {\n          return await Promise.resolve(42);\n        })();\n        expect(result).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const result = yield _asyncToGenerator(function* () {
        return yield Promise.resolve(42);
      })();
      expect(result).toBe(42);
    });"
  `);
});

test('040 JS Async > edge cases > nested async functions', async () => {
  const source =
    'async () => {\n        async function outer() {\n          async function inner() {\n            return await Promise.resolve(21);\n          }\n          const val = await inner();\n          return val * 2;\n        }\n        expect(await outer()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function outer() {
        return _outer.apply(this, arguments);
      }
      function _outer() {
        _outer = _asyncToGenerator(function* () {
          function inner() {
            return _inner.apply(this, arguments);
          }
          function _inner() {
            _inner = _asyncToGenerator(function* () {
              return yield Promise.resolve(21);
            });
            return _inner.apply(this, arguments);
          }
          const val = yield inner();
          return val * 2;
        });
        return _outer.apply(this, arguments);
      }
      expect(yield outer()).toBe(42);
    });"
  `);
});

test('041 JS Async > edge cases > async function returning another async function', async () => {
  const source =
    'async () => {\n        async function factory() {\n          return async (x) => x * 2;\n        }\n        const fn = await factory();\n        expect(await fn(21)).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function factory() {
        return _factory.apply(this, arguments);
      }
      function _factory() {
        _factory = _asyncToGenerator(function* () {
          return (function () {
            var _ref = _asyncToGenerator(function* (x) {
              return x * 2;
            });
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          })();
        });
        return _factory.apply(this, arguments);
      }
      const fn = yield factory();
      expect(yield fn(21)).toBe(42);
    });"
  `);
});

test('042 JS Async > edge cases > await in conditional expression', async () => {
  const source =
    "async () => {\n        async function foo(flag) {\n          return flag ? await Promise.resolve('yes') : await Promise.resolve('no');\n        }\n        expect(await foo(true)).toBe('yes');\n        expect(await foo(false)).toBe('no');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo(_x) {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* (flag) {
          return flag ? yield Promise.resolve('yes') : yield Promise.resolve('no');
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo(true)).toBe('yes');
      expect(yield foo(false)).toBe('no');
    });"
  `);
});

test('043 JS Async > edge cases > await in template literal', async () => {
  const source =
    "async () => {\n        async function foo() {\n          return `result: ${await Promise.resolve(42)}`;\n        }\n        expect(await foo()).toBe('result: 42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return \`result: \${yield Promise.resolve(42)}\`;
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe('result: 42');
    });"
  `);
});

test('044 JS Async > edge cases > await in array literal', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return [await Promise.resolve(1), await Promise.resolve(2), await Promise.resolve(3)];\n        }\n        expect(await foo()).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return [yield Promise.resolve(1), yield Promise.resolve(2), yield Promise.resolve(3)];
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toEqual([1, 2, 3]);
    });"
  `);
});

test('045 JS Async > edge cases > await in object literal', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return {\n            a: await Promise.resolve(1),\n            b: await Promise.resolve(2),\n          };\n        }\n        expect(await foo()).toEqual({ a: 1, b: 2 });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return {
            a: yield Promise.resolve(1),
            b: yield Promise.resolve(2),
          };
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toEqual({
        a: 1,
        b: 2,
      });
    });"
  `);
});

test('046 JS Async > edge cases > await in destructuring', async () => {
  const source =
    'async () => {\n        async function foo() {\n          const { a, b } = await Promise.resolve({ a: 1, b: 2 });\n          return a + b;\n        }\n        expect(await foo()).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          const { a, b } = yield Promise.resolve({
            a: 1,
            b: 2,
          });
          return a + b;
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(3);
    });"
  `);
});

test('047 JS Async > edge cases > await in switch statement', async () => {
  const source =
    "async () => {\n        async function foo(key) {\n          switch (await Promise.resolve(key)) {\n            case 'a':\n              return 1;\n            case 'b':\n              return 2;\n            default:\n              return 0;\n          }\n        }\n        expect(await foo('a')).toBe(1);\n        expect(await foo('b')).toBe(2);\n        expect(await foo('c')).toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo(_x) {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* (key) {
          switch (yield Promise.resolve(key)) {
            case 'a':
              return 1;
            case 'b':
              return 2;
            default:
              return 0;
          }
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo('a')).toBe(1);
      expect(yield foo('b')).toBe(2);
      expect(yield foo('c')).toBe(0);
    });"
  `);
});

test('048 JS Async > edge cases > async function with no await still returns promise', async () => {
  const source =
    '() => {\n        async function foo() {\n          return 42;\n        }\n        const result = foo();\n        expect(result instanceof Promise).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    () => {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return 42;
        });
        return _foo.apply(this, arguments);
      }
      const result = foo();
      expect(result instanceof Promise).toBe(true);
    };"
  `);
});

test('049 JS Async > edge cases > returning a promise from async function does not double-wrap', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return Promise.resolve(42);\n        }\n        const result = await foo();\n        expect(result).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return Promise.resolve(42);
        });
        return _foo.apply(this, arguments);
      }
      const result = yield foo();
      expect(result).toBe(42);
    });"
  `);
});

test('050 JS Async > edge cases > returning a thenable from async function', async () => {
  const source =
    'async () => {\n        async function foo() {\n          return {\n            then(resolve) {\n              resolve(42);\n            },\n          };\n        }\n        expect(await foo()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function foo() {
        return _foo.apply(this, arguments);
      }
      function _foo() {
        _foo = _asyncToGenerator(function* () {
          return {
            then(resolve) {
              resolve(42);
            },
          };
        });
        return _foo.apply(this, arguments);
      }
      expect(yield foo()).toBe(42);
    });"
  `);
});

test('051 JS Async > stack traces > error stack includes async function name', async () => {
  const source =
    "async () => {\n        async function myAsyncFunction() {\n          throw new Error('trace test');\n        }\n        try {\n          await myAsyncFunction();\n        } catch (e) {\n          const stack = e.stack || '';\n          // The async function name should appear somewhere in the stack\n          expect(stack.indexOf('myAsyncFunction') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function myAsyncFunction() {
        return _myAsyncFunction.apply(this, arguments);
      }
      function _myAsyncFunction() {
        _myAsyncFunction = _asyncToGenerator(function* () {
          throw new Error('trace test');
        });
        return _myAsyncFunction.apply(this, arguments);
      }
      try {
        yield myAsyncFunction();
      } catch (e) {
        const stack = e.stack || '';
        // The async function name should appear somewhere in the stack
        expect(stack.indexOf('myAsyncFunction') >= 0).toBe(true);
      }
    });"
  `);
});

test('052 JS Async > stack traces > error stack includes caller chain through await', async () => {
  const source =
    "async () => {\n        async function innerFunc() {\n          throw new Error('deep trace');\n        }\n        async function middleFunc() {\n          return await innerFunc();\n        }\n        async function outerFunc() {\n          return await middleFunc();\n        }\n        try {\n          await outerFunc();\n        } catch (e) {\n          const stack = e.stack || '';\n          // At minimum, the function that threw should be in the stack\n          expect(stack.indexOf('innerFunc') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function innerFunc() {
        return _innerFunc.apply(this, arguments);
      }
      function _innerFunc() {
        _innerFunc = _asyncToGenerator(function* () {
          throw new Error('deep trace');
        });
        return _innerFunc.apply(this, arguments);
      }
      function middleFunc() {
        return _middleFunc.apply(this, arguments);
      }
      function _middleFunc() {
        _middleFunc = _asyncToGenerator(function* () {
          return yield innerFunc();
        });
        return _middleFunc.apply(this, arguments);
      }
      function outerFunc() {
        return _outerFunc.apply(this, arguments);
      }
      function _outerFunc() {
        _outerFunc = _asyncToGenerator(function* () {
          return yield middleFunc();
        });
        return _outerFunc.apply(this, arguments);
      }
      try {
        yield outerFunc();
      } catch (e) {
        const stack = e.stack || '';
        // At minimum, the function that threw should be in the stack
        expect(stack.indexOf('innerFunc') >= 0).toBe(true);
      }
    });"
  `);
});

test('053 [upstream xit] JS Async > stack traces > error created inside async function has meaningful stack', async () => {
  const source =
    "async () => {\n        async function createError() {\n          await Promise.resolve();\n          return new Error('for inspection');\n        }\n        const err = await createError();\n        const stack = err.stack || '';\n        // The error should have a stack that includes the function name\n        expect(stack.indexOf('createError') >= 0).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function createError() {
        return _createError.apply(this, arguments);
      }
      function _createError() {
        _createError = _asyncToGenerator(function* () {
          yield Promise.resolve();
          return new Error('for inspection');
        });
        return _createError.apply(this, arguments);
      }
      const err = yield createError();
      const stack = err.stack || '';
      // The error should have a stack that includes the function name
      expect(stack.indexOf('createError') >= 0).toBe(true);
    });"
  `);
});

test('054 JS Async > stack traces > console-style stack preservation through async chain', async () => {
  const source =
    "async () => {\n        // Tests that the originating call site is preserved when errors\n        // propagate through multiple await layers\n        const errors = [];\n        async function level3() {\n          throw new Error('level3 error');\n        }\n        async function level2() {\n          await level3();\n        }\n        async function level1() {\n          try {\n            await level2();\n          } catch (e) {\n            errors.push(e);\n          }\n        }\n        await level1();\n        expect(errors.length).toBe(1);\n        expect(errors[0].message).toBe('level3 error');\n        const stack = errors[0].stack || '';\n        expect(stack.indexOf('level3') >= 0).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      // Tests that the originating call site is preserved when errors
      // propagate through multiple await layers
      const errors = [];
      function level3() {
        return _level.apply(this, arguments);
      }
      function _level() {
        _level = _asyncToGenerator(function* () {
          throw new Error('level3 error');
        });
        return _level.apply(this, arguments);
      }
      function level2() {
        return _level2.apply(this, arguments);
      }
      function _level2() {
        _level2 = _asyncToGenerator(function* () {
          yield level3();
        });
        return _level2.apply(this, arguments);
      }
      function level1() {
        return _level3.apply(this, arguments);
      }
      function _level3() {
        _level3 = _asyncToGenerator(function* () {
          try {
            yield level2();
          } catch (e) {
            errors.push(e);
          }
        });
        return _level3.apply(this, arguments);
      }
      yield level1();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('level3 error');
      const stack = errors[0].stack || '';
      expect(stack.indexOf('level3') >= 0).toBe(true);
    });"
  `);
});

test('055 JS Async > stack traces > deep async chain preserves multiple function names in stack', async () => {
  const source =
    "async () => {\n        async function database() {\n          throw new Error('connection refused');\n        }\n        async function repository() {\n          return await database();\n        }\n        async function service() {\n          return await repository();\n        }\n        async function controller() {\n          return await service();\n        }\n        async function router() {\n          return await controller();\n        }\n        try {\n          await router();\n        } catch (e) {\n          const stack = e.stack || '';\n          // The throw site should always be present\n          expect(stack.indexOf('database') >= 0).toBe(true);\n          // Intermediate callers should appear in the async stack\n          expect(stack.indexOf('repository') >= 0).toBe(true);\n          expect(stack.indexOf('service') >= 0).toBe(true);\n          expect(stack.indexOf('controller') >= 0).toBe(true);\n          expect(stack.indexOf('router') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function database() {
        return _database.apply(this, arguments);
      }
      function _database() {
        _database = _asyncToGenerator(function* () {
          throw new Error('connection refused');
        });
        return _database.apply(this, arguments);
      }
      function repository() {
        return _repository.apply(this, arguments);
      }
      function _repository() {
        _repository = _asyncToGenerator(function* () {
          return yield database();
        });
        return _repository.apply(this, arguments);
      }
      function service() {
        return _service.apply(this, arguments);
      }
      function _service() {
        _service = _asyncToGenerator(function* () {
          return yield repository();
        });
        return _service.apply(this, arguments);
      }
      function controller() {
        return _controller.apply(this, arguments);
      }
      function _controller() {
        _controller = _asyncToGenerator(function* () {
          return yield service();
        });
        return _controller.apply(this, arguments);
      }
      function router() {
        return _router.apply(this, arguments);
      }
      function _router() {
        _router = _asyncToGenerator(function* () {
          return yield controller();
        });
        return _router.apply(this, arguments);
      }
      try {
        yield router();
      } catch (e) {
        const stack = e.stack || '';
        // The throw site should always be present
        expect(stack.indexOf('database') >= 0).toBe(true);
        // Intermediate callers should appear in the async stack
        expect(stack.indexOf('repository') >= 0).toBe(true);
        expect(stack.indexOf('service') >= 0).toBe(true);
        expect(stack.indexOf('controller') >= 0).toBe(true);
        expect(stack.indexOf('router') >= 0).toBe(true);
      }
    });"
  `);
});

test('056 JS Async > stack traces > error thrown synchronously before any await has function name', async () => {
  const source =
    "async () => {\n        async function failImmediately() {\n          throw new Error('sync throw');\n        }\n        try {\n          await failImmediately();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('failImmediately') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function failImmediately() {
        return _failImmediately.apply(this, arguments);
      }
      function _failImmediately() {
        _failImmediately = _asyncToGenerator(function* () {
          throw new Error('sync throw');
        });
        return _failImmediately.apply(this, arguments);
      }
      try {
        yield failImmediately();
      } catch (e) {
        const stack = e.stack || '';
        expect(stack.indexOf('failImmediately') >= 0).toBe(true);
      }
    });"
  `);
});

test('057 JS Async > stack traces > error from rejected promise includes thrower name', async () => {
  const source =
    "async () => {\n        async function rejecter() {\n          return Promise.reject(new Error('rejected'));\n        }\n        async function caller() {\n          return await rejecter();\n        }\n        try {\n          await caller();\n        } catch (e) {\n          expect(e.message).toBe('rejected');\n          const stack = e.stack || '';\n          expect(stack.indexOf('rejecter') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function rejecter() {
        return _rejecter.apply(this, arguments);
      }
      function _rejecter() {
        _rejecter = _asyncToGenerator(function* () {
          return Promise.reject(new Error('rejected'));
        });
        return _rejecter.apply(this, arguments);
      }
      function caller() {
        return _caller.apply(this, arguments);
      }
      function _caller() {
        _caller = _asyncToGenerator(function* () {
          return yield rejecter();
        });
        return _caller.apply(this, arguments);
      }
      try {
        yield caller();
      } catch (e) {
        expect(e.message).toBe('rejected');
        const stack = e.stack || '';
        expect(stack.indexOf('rejecter') >= 0).toBe(true);
      }
    });"
  `);
});

test('058 JS Async > stack traces > async arrow function name in stack', async () => {
  const source =
    "async () => {\n        const myArrowAsync = async () => {\n          throw new Error('arrow error');\n        };\n        try {\n          await myArrowAsync();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('myArrowAsync') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const myArrowAsync = (function () {
        var _ref = _asyncToGenerator(function* () {
          throw new Error('arrow error');
        });
        return function myArrowAsync() {
          return _ref.apply(this, arguments);
        };
      })();
      try {
        yield myArrowAsync();
      } catch (e) {
        const stack = e.stack || '';
        expect(stack.indexOf('myArrowAsync') >= 0).toBe(true);
      }
    });"
  `);
});

test('059 JS Async > stack traces > async method name in stack', async () => {
  const source =
    "async () => {\n        class MyService {\n          async fetchData() {\n            throw new Error('service error');\n          }\n        }\n        try {\n          await new MyService().fetchData();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('fetchData') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class MyService {
        fetchData() {
          return _asyncToGenerator(function* () {
            throw new Error('service error');
          })();
        }
      }
      try {
        yield new MyService().fetchData();
      } catch (e) {
        const stack = e.stack || '';
        expect(stack.indexOf('fetchData') >= 0).toBe(true);
      }
    });"
  `);
});

test('060 JS Async > stack traces > nested async class methods preserve inner name', async () => {
  const source =
    "async () => {\n        class Repo {\n          async query() {\n            throw new Error('db error');\n          }\n        }\n        class Service {\n          async handle() {\n            return await new Repo().query();\n          }\n        }\n        try {\n          await new Service().handle();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('query') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class Repo {
        query() {
          return _asyncToGenerator(function* () {
            throw new Error('db error');
          })();
        }
      }
      class Service {
        handle() {
          return _asyncToGenerator(function* () {
            return yield new Repo().query();
          })();
        }
      }
      try {
        yield new Service().handle();
      } catch (e) {
        const stack = e.stack || '';
        expect(stack.indexOf('query') >= 0).toBe(true);
      }
    });"
  `);
});

test('061 [upstream xit] JS Async > stack traces > error in Promise.all includes thrower name', async () => {
  const source =
    "async () => {\n        async function badTask() {\n          await Promise.resolve();\n          throw new Error('task failed');\n        }\n        try {\n          await Promise.all([Promise.resolve(1), badTask()]);\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('badTask') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function badTask() {
        return _badTask.apply(this, arguments);
      }
      function _badTask() {
        _badTask = _asyncToGenerator(function* () {
          yield Promise.resolve();
          throw new Error('task failed');
        });
        return _badTask.apply(this, arguments);
      }
      try {
        yield Promise.all([Promise.resolve(1), badTask()]);
      } catch (e) {
        const stack = e.stack || '';
        expect(stack.indexOf('badTask') >= 0).toBe(true);
      }
    });"
  `);
});

test('062 JS Async > stack traces > re-thrown error preserves original stack', async () => {
  const source =
    "async () => {\n        async function original() {\n          throw new Error('original error');\n        }\n        async function wrapper() {\n          try {\n            await original();\n          } catch (e) {\n            throw e; // re-throw\n          }\n        }\n        try {\n          await wrapper();\n        } catch (e) {\n          const stack = e.stack || '';\n          // The original throw site should still be in the stack\n          expect(stack.indexOf('original') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function original() {
        return _original.apply(this, arguments);
      }
      function _original() {
        _original = _asyncToGenerator(function* () {
          throw new Error('original error');
        });
        return _original.apply(this, arguments);
      }
      function wrapper() {
        return _wrapper.apply(this, arguments);
      }
      function _wrapper() {
        _wrapper = _asyncToGenerator(function* () {
          try {
            yield original();
          } catch (e) {
            throw e;
          }
        });
        return _wrapper.apply(this, arguments);
      }
      try {
        yield wrapper();
      } catch (e) {
        const stack = e.stack || '';
        // The original throw site should still be in the stack
        expect(stack.indexOf('original') >= 0).toBe(true);
      }
    });"
  `);
});

test('063 [upstream xit] JS Async > stack traces > error constructed after await preserves function name', async () => {
  const source =
    "async () => {\n        async function buildError() {\n          await Promise.resolve();\n          return new Error('constructed');\n        }\n        const err = await buildError();\n        const stack = err.stack || '';\n        expect(stack.indexOf('buildError') >= 0).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function buildError() {
        return _buildError.apply(this, arguments);
      }
      function _buildError() {
        _buildError = _asyncToGenerator(function* () {
          yield Promise.resolve();
          return new Error('constructed');
        });
        return _buildError.apply(this, arguments);
      }
      const err = yield buildError();
      const stack = err.stack || '';
      expect(stack.indexOf('buildError') >= 0).toBe(true);
    });"
  `);
});

test('064 JS Async > destructuring + state lifting > awaits after destructuring in arrow params', async () => {
  const source =
    'async () => {\n        const f = async ({ b: _ }) => 42;\n        const actual = await f({ b: 1 });\n        expect(actual).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ b: _ }) {
          return 42;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      const actual = yield f({ b: 1 });
      expect(actual).toBe(42);
    });"
  `);
});

test('065 JS Async > destructuring + state lifting > object destructure with rename', async () => {
  const source =
    'async () => {\n        const f = async ({ b: x }) => x;\n        expect(await f({ b: 42 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ b: x }) {
          return x;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f({ b: 42 })).toBe(42);
    });"
  `);
});

test('066 JS Async > destructuring + state lifting > object destructure with default', async () => {
  const source =
    'async () => {\n        const f = async ({ b = 7 }) => b;\n        expect(await f({})).toBe(7);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ b = 7 }) {
          return b;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f({})).toBe(7);
    });"
  `);
});

test('067 JS Async > destructuring + state lifting > object destructure with rest', async () => {
  const source =
    'async () => {\n        const f = async ({ a, ...rest }) => rest;\n        expect(await f({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3 });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ a, ...rest }) {
          return rest;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(
        yield f({
          a: 1,
          b: 2,
          c: 3,
        }),
      ).toEqual({
        b: 2,
        c: 3,
      });
    });"
  `);
});

test('068 JS Async > destructuring + state lifting > nested object destructure', async () => {
  const source =
    'async () => {\n        const f = async ({ a: { b } }) => b;\n        expect(await f({ a: { b: 42 } })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ a: { b } }) {
          return b;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f({ a: { b: 42 } })).toBe(42);
    });"
  `);
});

test('069 JS Async > destructuring + state lifting > array destructure', async () => {
  const source =
    'async () => {\n        const f = async ([a, b]) => a + b;\n        expect(await f([1, 2])).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ([a, b]) {
          return a + b;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f([1, 2])).toBe(3);
    });"
  `);
});

test('070 JS Async > destructuring + state lifting > array destructure with rest', async () => {
  const source =
    'async () => {\n        const f = async ([a, ...rest]) => rest;\n        expect(await f([1, 2, 3, 4])).toEqual([2, 3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ([a, ...rest]) {
          return rest;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f([1, 2, 3, 4])).toEqual([2, 3, 4]);
    });"
  `);
});

test('071 JS Async > destructuring + state lifting > async arrow with default-value param', async () => {
  const source =
    'async () => {\n        const f = async (x = 7) => x;\n        expect(await f()).toBe(7);\n        expect(await f(9)).toBe(9);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* (x = 7) {
          return x;
        });
        return function f() {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f()).toBe(7);
      expect(yield f(9)).toBe(9);
    });"
  `);
});

test('072 JS Async > destructuring + state lifting > async arrow with rest param', async () => {
  const source =
    'async () => {\n        const f = async (...rest) => rest.length;\n        expect(await f(1, 2, 3)).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* (...rest) {
          return rest.length;
        });
        return function f() {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f(1, 2, 3)).toBe(3);
    });"
  `);
});

test('073 JS Async > destructuring + state lifting > value visible through .then()', async () => {
  const source =
    'async () => {\n        const f = async ({ b: _ }) => 42;\n        const seen = await new Promise((resolve) => {\n          f({ b: 1 }).then((v) => resolve(v));\n        });\n        expect(seen).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ b: _ }) {
          return 42;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      const seen = yield new Promise(resolve => {
        f({ b: 1 }).then(v => resolve(v));
      });
      expect(seen).toBe(42);
    });"
  `);
});

test('074 JS Async > destructuring + state lifting > value visible through Promise.all', async () => {
  const source =
    'async () => {\n        const f = async ({ b }) => b;\n        const results = await Promise.all([f({ b: 1 }), f({ b: 2 }), f({ b: 3 })]);\n        expect(results).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* ({ b }) {
          return b;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      const results = yield Promise.all([f({ b: 1 }), f({ b: 2 }), f({ b: 3 })]);
      expect(results).toEqual([1, 2, 3]);
    });"
  `);
});

test('075 JS Async > destructuring + state lifting > control: async arrow with plain (non-destructured) params', async () => {
  const source =
    'async () => {\n        const f = async (a, b) => 42;\n        expect(await f(1, 2)).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* (a, b) {
          return 42;
        });
        return function f(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f(1, 2)).toBe(42);
    });"
  `);
});

test('076 JS Async > destructuring + state lifting > control: async function declaration with destructured param', async () => {
  const source =
    'async () => {\n        async function f({ b }) {\n          return 42;\n        }\n        expect(await f({ b: 1 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      function f(_x) {
        return _f.apply(this, arguments);
      }
      function _f() {
        _f = _asyncToGenerator(function* ({ b }) {
          return 42;
        });
        return _f.apply(this, arguments);
      }
      expect(yield f({ b: 1 })).toBe(42);
    });"
  `);
});

test('077 JS Async > destructuring + state lifting > control: async function expression with destructured param', async () => {
  const source =
    'async () => {\n        const f = async function ({ b }) {\n          return 42;\n        };\n        expect(await f({ b: 1 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = /* @__PURE__ */ (function () {
        var _ref = _asyncToGenerator(function* ({ b }) {
          return 42;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f({ b: 1 })).toBe(42);
    });"
  `);
});

test('078 JS Async > destructuring + state lifting > control: class async method with destructured param', async () => {
  const source =
    'async () => {\n        class C {\n          async m({ b }) {\n            return 42;\n          }\n        }\n        expect(await new C().m({ b: 1 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      class C {
        m({ b }) {
          return _asyncToGenerator(function* () {
            return 42;
          })();
        }
      }
      expect(yield new C().m({ b: 1 })).toBe(42);
    });"
  `);
});

test('079 JS Async > destructuring + state lifting > control: object shorthand async method with destructured param', async () => {
  const source =
    'async () => {\n        const o = {\n          async m({ b }) {\n            return 42;\n          },\n        };\n        expect(await o.m({ b: 1 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const o = {
        m({ b }) {
          return _asyncToGenerator(function* () {
            return 42;
          })();
        },
      };
      expect(yield o.m({ b: 1 })).toBe(42);
    });"
  `);
});

test('080 JS Async > destructuring + state lifting > control: arrow with body destructure (not in params)', async () => {
  const source =
    'async () => {\n        const f = async (x) => {\n          const { b } = x;\n          void b;\n          return 42;\n        };\n        expect(await f({ b: 1 })).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    _asyncToGenerator(function* () {
      const f = (function () {
        var _ref = _asyncToGenerator(function* (x) {
          const { b } = x;
          void b;
          return 42;
        });
        return function f(_x) {
          return _ref.apply(this, arguments);
        };
      })();
      expect(yield f({ b: 1 })).toBe(42);
    });"
  `);
});
