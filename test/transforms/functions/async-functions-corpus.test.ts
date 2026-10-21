import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    helpers: {
      mode: 'runtime',
      moduleName: '@babel/runtime',
      version: '7.29.7',
    },
    transforms: {
      asyncFunctions: true,
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'basic async/await > async function returns a promise',
    source: `() => {
        async function foo() {
          return 42;
        }
        const result = foo();
        expect(result instanceof Promise).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
};`,
  },
  {
    title: 'basic async/await > await resolves promise value',
    source: `async () => {
        async function foo() {
          return await Promise.resolve(42);
        }
        expect(await foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'basic async/await > async function returning non-promise wraps in promise',
    source: `async () => {
        async function foo() {
          return 'hello';
        }
        expect(await foo()).toBe('hello');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'basic async/await > await non-promise value passes through',
    source: `async () => {
        async function foo() {
          const x = await 42;
          return x;
        }
        expect(await foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'basic async/await > sequential awaits',
    source: `async () => {
        async function foo() {
          const a = await Promise.resolve(1);
          const b = await Promise.resolve(2);
          const c = await Promise.resolve(3);
          return a + b + c;
        }
        expect(await foo()).toBe(6);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'basic async/await > await in expression position',
    source: `async () => {
        async function foo() {
          return (await Promise.resolve(10)) + (await Promise.resolve(32));
        }
        expect(await foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'error handling > rejected promise throws on await',
    source: `async () => {
        async function foo() {
          try {
            await Promise.reject(new Error('fail'));
            return 'no error';
          } catch (e) {
            return e.message;
          }
        }
        expect(await foo()).toBe('fail');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'error handling > throw in async function rejects the promise',
    source: `async () => {
        async function foo() {
          throw new Error('oops');
        }
        try {
          await foo();
          expect(true).toBe(false); // should not reach
        } catch (e) {
          expect(e.message).toBe('oops');
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'error handling > try-catch-finally with await',
    source: `async () => {
        const log = [];
        async function foo() {
          try {
            log.push('try');
            await Promise.reject(new Error('err'));
          } catch (e) {
            log.push('catch');
          } finally {
            log.push('finally');
          }
        }
        await foo();
        expect(log).toEqual(['try', 'catch', 'finally']);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'error handling > nested try-catch with async',
    source: `async () => {
        async function inner() {
          throw new Error('inner');
        }
        async function outer() {
          try {
            await inner();
          } catch (e) {
            return 'caught: ' + e.message;
          }
        }
        expect(await outer()).toBe('caught: inner');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'error handling > error after await does not lose context',
    source: `async () => {
        async function foo() {
          await Promise.resolve();
          throw new Error('after await');
        }
        try {
          await foo();
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe('after await');
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'async arrow functions > basic async arrow',
    source: `async () => {
        const foo = async () => 42;
        expect(await foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'async arrow functions > async arrow with await',
    source: `async () => {
        const foo = async (x) => {
          const result = await Promise.resolve(x * 2);
          return result;
        };
        expect(await foo(21)).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'async arrow functions > async arrow preserves this from enclosing scope',
    source: `async () => {
        const obj = {
          val: 42,
          getVal: function () {
            const fn = async () => {
              return await Promise.resolve(this.val);
            };
            return fn();
          },
        };
        expect(await obj.getVal()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'async arrow functions > async arrow preserves name property',
    source: `() => {
        var concat = async (...args) => {
          var x = args[0];
          var y = args[1];
        };
        expect(concat.name).toBe('concat');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
};`,
  },
  {
    title: 'async arrow functions > async function preserves length property',
    source: `() => {
        var a = async (b) => {};
        expect(a.length).toBe(1);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
() => {
  var a = (function () {
    var _ref = _asyncToGenerator(function* (b) {});
    return function a(_x) {
      return _ref.apply(this, arguments);
    };
  })();
  expect(a.length).toBe(1);
};`,
  },
  {
    title: 'async methods > async class method',
    source: `async () => {
        class Foo {
          async bar() {
            return await Promise.resolve(42);
          }
        }
        expect(await new Foo().bar()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class Foo {
    bar() {
      return _asyncToGenerator(function* () {
        return yield Promise.resolve(42);
      })();
    }
  }
  expect(yield new Foo().bar()).toBe(42);
});`,
  },
  {
    title: 'async methods > async static method',
    source: `async () => {
        class Foo {
          static async bar() {
            return await Promise.resolve(42);
          }
        }
        expect(await Foo.bar()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class Foo {
    static bar() {
      return _asyncToGenerator(function* () {
        return yield Promise.resolve(42);
      })();
    }
  }
  expect(yield Foo.bar()).toBe(42);
});`,
  },
  {
    title: 'async methods > async object method',
    source: `async () => {
        const obj = {
          async foo() {
            return await Promise.resolve(42);
          },
        };
        expect(await obj.foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  const obj = {
    foo() {
      return _asyncToGenerator(function* () {
        return yield Promise.resolve(42);
      })();
    },
  };
  expect(yield obj.foo()).toBe(42);
});`,
  },
  {
    title: 'async methods > async method preserves this',
    source: `async () => {
        class Foo {
          constructor(val) {
            this.val = val;
          }
          async getVal() {
            return await Promise.resolve(this.val);
          }
        }
        expect(await new Foo(42).getVal()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'complex parameters > async method with destructured parameter that throws',
    source: `async () => {
        let caught = false;
        class Foo {
          async bar(a, { b }) {}
        }
        try {
          await new Foo().bar();
        } catch (e) {
          caught = true;
        }
        expect(caught).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  let caught = false;
  class Foo {
    bar(_x, _x2) {
      return _asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);
    }
  }
  try {
    yield new Foo().bar();
  } catch (e) {
    caught = true;
  }
  expect(caught).toBe(true);
});`,
  },
  {
    title: 'complex parameters > async method with destructured parameter',
    source: `async () => {
        class Foo {
          async bar(a, { b }) {
            return [a, b];
          }
        }
        expect(await new Foo().bar(1, { b: 2 })).toEqual([1, 2]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class Foo {
    bar(_x, _x2) {
      return _asyncToGenerator(function* (a, { b }) {
        return [a, b];
      }).apply(this, arguments);
    }
  }
  expect(yield new Foo().bar(1, { b: 2 })).toEqual([1, 2]);
});`,
  },
  {
    title: 'complex parameters > async method with default parameter',
    source: `async () => {
        async function foo(
          a,
          b = (() => {
            throw new Error('required');
          })()
        ) {
          return [a, b];
        }
        expect(await foo(1, 2)).toEqual([1, 2]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'complex parameters > async function with mandatory default throws on missing param',
    source: `async () => {
        function mandatory(name) {
          throw new Error('Missing: ' + name);
        }
        async function foo({ a, b = mandatory('b') } = {}) {
          return b;
        }
        try {
          await foo();
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe('Missing: b');
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'complex parameters > async method with rest parameter',
    source: `async () => {
        class Foo {
          async bar(a, ...b) {
            return [a, b];
          }
        }
        expect(await new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class Foo {
    bar(_x) {
      return _asyncToGenerator(function* (a, ...b) {
        return [a, b];
      }).apply(this, arguments);
    }
  }
  expect(yield new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);
});`,
  },
  {
    title: 'complex parameters > async method with super access',
    source: `async () => {
        class Base {
          get val() {
            return 'base';
          }
        }
        class Child extends Base {
          async foo(a, { b }) {
            return [a, b, super.val];
          }
        }
        expect(await new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class Base {
    get val() {
      return 'base';
    }
  }
  class Child extends Base {
    foo(_x, _x2) {
      var _superprop_getVal = () => super.val;
      return _asyncToGenerator(function* (a, { b }) {
        return [a, b, _superprop_getVal()];
      }).apply(this, arguments);
    }
  }
  expect(yield new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);
});`,
  },
  {
    title: 'execution order > code after await runs asynchronously',
    source: `async () => {
        const log = [];
        async function foo() {
          log.push(1);
          await null;
          log.push(2);
        }
        const p = foo();
        log.push(3);
        await p;
        expect(log).toEqual([1, 3, 2]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'execution order > multiple async functions interleave correctly',
    source: `async () => {
        const log = [];
        async function a() {
          log.push('a1');
          await null;
          log.push('a2');
        }
        async function b() {
          log.push('b1');
          await null;
          log.push('b2');
        }
        await Promise.all([a(), b()]);
        expect(log[0]).toBe('a1');
        expect(log[1]).toBe('b1');
        // a2 and b2 ordering depends on microtask queue
        expect(log.indexOf('a2') >= 0).toBe(true);
        expect(log.indexOf('b2') >= 0).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'execution order > double await adds extra microtask delay',
    source: `async () => {
        const log = [];
     \x20
        const p1 = (async function () {
          log.push(1);
          await await null;
          log.push(2);
        })();
     \x20
        const p2 = (async function () {
          log.push(3);
          await null;
          log.push(4);
        })();
     \x20
        log.push(5);
     \x20
        await Promise.all([p1, p2]);
        // 4 should come before 2 due to double-await extra tick
        expect(log.indexOf(4) < log.indexOf(2)).toBe(true);
        expect(log[0]).toBe(1);
        expect(log[1]).toBe(3);
        expect(log[2]).toBe(5);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'closures and loops > async closure in for-of captures correct value',
    source: `async () => {
        let items = [1, 2, 3, 4];
        let output = [];
        for (const item of items) {
          await (async (x) => {
            output.push(item);
          })();
        }
        expect(output).toEqual([1, 2, 3, 4]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'closures and loops > await in for loop with closure',
    source: `async () => {
        const results = [];
        for (let i = 0; i < 3; i++) {
          const val = await Promise.resolve(i * 10);
          results.push(() => val);
        }
        expect(results[0]()).toBe(0);
        expect(results[1]()).toBe(10);
        expect(results[2]()).toBe(20);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  const results = [];
  for (let i = 0; i < 3; i++) {
    const val = yield Promise.resolve(i * 10);
    results.push(() => val);
  }
  expect(results[0]()).toBe(0);
  expect(results[1]()).toBe(10);
  expect(results[2]()).toBe(20);
});`,
  },
  {
    title: 'closures and loops > await in while loop',
    source: `async () => {
        let sum = 0;
        let i = 0;
        while (i < 5) {
          sum += await Promise.resolve(i);
          i++;
        }
        expect(sum).toBe(10);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  let sum = 0;
  let i = 0;
  while (i < 5) {
    sum += yield Promise.resolve(i);
    i++;
  }
  expect(sum).toBe(10);
});`,
  },
  {
    title: 'closures and loops > recursive async function (polling pattern)',
    source: `async () => {
        const log = [];
        async function collect(count) {
          log.push(await Promise.resolve(count));
          if (count < 3) {
            await collect(count + 1);
          }
        }
        await collect(0);
        expect(log).toEqual([0, 1, 2, 3]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'hoisting and declarations > async function declaration is hoisted',
    source: `async () => {
        // Call before declaration
        const result = await foo();
        expect(result).toBe(42);
     \x20
        async function foo() {
          return 42;
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'hoisting and declarations > async function expression is not hoisted',
    source: `() => {
        expect(() => {
          bar();
        }).toThrow();
     \x20
        var bar = async function () {
          return 42;
        };
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
() => {
  expect(() => {
    bar();
  }).toThrow();
  var bar = _asyncToGenerator(function* () {
    return 42;
  });
};`,
  },
  {
    title: 'parallel patterns > Promise.all with multiple async calls',
    source: `async () => {
        async function double(x) {
          return await Promise.resolve(x * 2);
        }
        const results = await Promise.all([double(1), double(2), double(3)]);
        expect(results).toEqual([2, 4, 6]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'parallel patterns > Promise.race with async functions',
    source: `async () => {
        async function fast() {
          return 'fast';
        }
        async function slow() {
          await new Promise((r) => setTimeout(r, 100));
          return 'slow';
        }
        const result = await Promise.race([fast(), slow()]);
        expect(result).toBe('fast');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'parallel patterns > Promise.allSettled with mixed results',
    source: `async () => {
        async function succeed() {
          return 'ok';
        }
        async function fail() {
          throw new Error('fail');
        }
        const results = await Promise.allSettled([succeed(), fail()]);
        expect(results[0].status).toBe('fulfilled');
        expect(results[0].value).toBe('ok');
        expect(results[1].status).toBe('rejected');
        expect(results[1].reason.message).toBe('fail');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > async IIFE',
    source: `async () => {
        const result = await (async () => {
          return await Promise.resolve(42);
        })();
        expect(result).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  const result = yield _asyncToGenerator(function* () {
    return yield Promise.resolve(42);
  })();
  expect(result).toBe(42);
});`,
  },
  {
    title: 'edge cases > nested async functions',
    source: `async () => {
        async function outer() {
          async function inner() {
            return await Promise.resolve(21);
          }
          const val = await inner();
          return val * 2;
        }
        expect(await outer()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > async function returning another async function',
    source: `async () => {
        async function factory() {
          return async (x) => x * 2;
        }
        const fn = await factory();
        expect(await fn(21)).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in conditional expression',
    source: `async () => {
        async function foo(flag) {
          return flag ? await Promise.resolve('yes') : await Promise.resolve('no');
        }
        expect(await foo(true)).toBe('yes');
        expect(await foo(false)).toBe('no');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in template literal',
    source: `async () => {
        async function foo() {
          return \`result: \${await Promise.resolve(42)}\`;
        }
        expect(await foo()).toBe('result: 42');
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in array literal',
    source: `async () => {
        async function foo() {
          return [await Promise.resolve(1), await Promise.resolve(2), await Promise.resolve(3)];
        }
        expect(await foo()).toEqual([1, 2, 3]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in object literal',
    source: `async () => {
        async function foo() {
          return {
            a: await Promise.resolve(1),
            b: await Promise.resolve(2),
          };
        }
        expect(await foo()).toEqual({ a: 1, b: 2 });
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in destructuring',
    source: `async () => {
        async function foo() {
          const { a, b } = await Promise.resolve({ a: 1, b: 2 });
          return a + b;
        }
        expect(await foo()).toBe(3);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > await in switch statement',
    source: `async () => {
        async function foo(key) {
          switch (await Promise.resolve(key)) {
            case 'a':
              return 1;
            case 'b':
              return 2;
            default:
              return 0;
          }
        }
        expect(await foo('a')).toBe(1);
        expect(await foo('b')).toBe(2);
        expect(await foo('c')).toBe(0);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > returning a promise from async function does not double-wrap',
    source: `async () => {
        async function foo() {
          return Promise.resolve(42);
        }
        const result = await foo();
        expect(result).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'edge cases > returning a thenable from async function',
    source: `async () => {
        async function foo() {
          return {
            then(resolve) {
              resolve(42);
            },
          };
        }
        expect(await foo()).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error stack includes async function name',
    source: `async () => {
        async function myAsyncFunction() {
          throw new Error('trace test');
        }
        try {
          await myAsyncFunction();
        } catch (e) {
          const stack = e.stack || '';
          // The async function name should appear somewhere in the stack
          expect(stack.indexOf('myAsyncFunction') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error stack includes caller chain through await',
    source: `async () => {
        async function innerFunc() {
          throw new Error('deep trace');
        }
        async function middleFunc() {
          return await innerFunc();
        }
        async function outerFunc() {
          return await middleFunc();
        }
        try {
          await outerFunc();
        } catch (e) {
          const stack = e.stack || '';
          // At minimum, the function that threw should be in the stack
          expect(stack.indexOf('innerFunc') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error created inside async function has meaningful stack',
    source: `async () => {
        async function createError() {
          await Promise.resolve();
          return new Error('for inspection');
        }
        const err = await createError();
        const stack = err.stack || '';
        // The error should have a stack that includes the function name
        expect(stack.indexOf('createError') >= 0).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > console-style stack preservation through async chain',
    source: `async () => {
        // Tests that the originating call site is preserved when errors
        // propagate through multiple await layers
        const errors = [];
        async function level3() {
          throw new Error('level3 error');
        }
        async function level2() {
          await level3();
        }
        async function level1() {
          try {
            await level2();
          } catch (e) {
            errors.push(e);
          }
        }
        await level1();
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('level3 error');
        const stack = errors[0].stack || '';
        expect(stack.indexOf('level3') >= 0).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > deep async chain preserves multiple function names in stack',
    source: `async () => {
        async function database() {
          throw new Error('connection refused');
        }
        async function repository() {
          return await database();
        }
        async function service() {
          return await repository();
        }
        async function controller() {
          return await service();
        }
        async function router() {
          return await controller();
        }
        try {
          await router();
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
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error thrown synchronously before any await has function name',
    source: `async () => {
        async function failImmediately() {
          throw new Error('sync throw');
        }
        try {
          await failImmediately();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('failImmediately') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error from rejected promise includes thrower name',
    source: `async () => {
        async function rejecter() {
          return Promise.reject(new Error('rejected'));
        }
        async function caller() {
          return await rejecter();
        }
        try {
          await caller();
        } catch (e) {
          expect(e.message).toBe('rejected');
          const stack = e.stack || '';
          expect(stack.indexOf('rejecter') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > async arrow function name in stack',
    source: `async () => {
        const myArrowAsync = async () => {
          throw new Error('arrow error');
        };
        try {
          await myArrowAsync();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('myArrowAsync') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > async method name in stack',
    source: `async () => {
        class MyService {
          async fetchData() {
            throw new Error('service error');
          }
        }
        try {
          await new MyService().fetchData();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('fetchData') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > nested async class methods preserve inner name',
    source: `async () => {
        class Repo {
          async query() {
            throw new Error('db error');
          }
        }
        class Service {
          async handle() {
            return await new Repo().query();
          }
        }
        try {
          await new Service().handle();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('query') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error in Promise.all includes thrower name',
    source: `async () => {
        async function badTask() {
          await Promise.resolve();
          throw new Error('task failed');
        }
        try {
          await Promise.all([Promise.resolve(1), badTask()]);
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('badTask') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > re-thrown error preserves original stack',
    source: `async () => {
        async function original() {
          throw new Error('original error');
        }
        async function wrapper() {
          try {
            await original();
          } catch (e) {
            throw e; // re-throw
          }
        }
        try {
          await wrapper();
        } catch (e) {
          const stack = e.stack || '';
          // The original throw site should still be in the stack
          expect(stack.indexOf('original') >= 0).toBe(true);
        }
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'stack traces > error constructed after await preserves function name',
    source: `async () => {
        async function buildError() {
          await Promise.resolve();
          return new Error('constructed');
        }
        const err = await buildError();
        const stack = err.stack || '';
        expect(stack.indexOf('buildError') >= 0).toBe(true);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > awaits after destructuring in arrow params',
    source: `async () => {
        const f = async ({ b: _ }) => 42;
        const actual = await f({ b: 1 });
        expect(actual).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > object destructure with rename',
    source: `async () => {
        const f = async ({ b: x }) => x;
        expect(await f({ b: 42 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > object destructure with default',
    source: `async () => {
        const f = async ({ b = 7 }) => b;
        expect(await f({})).toBe(7);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > object destructure with rest',
    source: `async () => {
        const f = async ({ a, ...rest }) => rest;
        expect(await f({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3 });
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > nested object destructure',
    source: `async () => {
        const f = async ({ a: { b } }) => b;
        expect(await f({ a: { b: 42 } })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > array destructure',
    source: `async () => {
        const f = async ([a, b]) => a + b;
        expect(await f([1, 2])).toBe(3);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > array destructure with rest',
    source: `async () => {
        const f = async ([a, ...rest]) => rest;
        expect(await f([1, 2, 3, 4])).toEqual([2, 3, 4]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > async arrow with default-value param',
    source: `async () => {
        const f = async (x = 7) => x;
        expect(await f()).toBe(7);
        expect(await f(9)).toBe(9);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > async arrow with rest param',
    source: `async () => {
        const f = async (...rest) => rest.length;
        expect(await f(1, 2, 3)).toBe(3);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > value visible through .then()',
    source: `async () => {
        const f = async ({ b: _ }) => 42;
        const seen = await new Promise((resolve) => {
          f({ b: 1 }).then((v) => resolve(v));
        });
        expect(seen).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > value visible through Promise.all',
    source: `async () => {
        const f = async ({ b }) => b;
        const results = await Promise.all([f({ b: 1 }), f({ b: 2 }), f({ b: 3 })]);
        expect(results).toEqual([1, 2, 3]);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title:
      'destructuring + state lifting > control: async arrow with plain (non-destructured) params',
    source: `async () => {
        const f = async (a, b) => 42;
        expect(await f(1, 2)).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title:
      'destructuring + state lifting > control: async function declaration with destructured param',
    source: `async () => {
        async function f({ b }) {
          return 42;
        }
        expect(await f({ b: 1 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title:
      'destructuring + state lifting > control: async function expression with destructured param',
    source: `async () => {
        const f = async function ({ b }) {
          return 42;
        };
        expect(await f({ b: 1 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
  {
    title: 'destructuring + state lifting > control: class async method with destructured param',
    source: `async () => {
        class C {
          async m({ b }) {
            return 42;
          }
        }
        expect(await new C().m({ b: 1 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  class C {
    m(_x) {
      return _asyncToGenerator(function* ({ b }) {
        return 42;
      }).apply(this, arguments);
    }
  }
  expect(yield new C().m({ b: 1 })).toBe(42);
});`,
  },
  {
    title:
      'destructuring + state lifting > control: object shorthand async method with destructured param',
    source: `async () => {
        const o = {
          async m({ b }) {
            return 42;
          },
        };
        expect(await o.m({ b: 1 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
_asyncToGenerator(function* () {
  const o = {
    m(_x) {
      return _asyncToGenerator(function* ({ b }) {
        return 42;
      }).apply(this, arguments);
    },
  };
  expect(yield o.m({ b: 1 })).toBe(42);
});`,
  },
  {
    title: 'destructuring + state lifting > control: arrow with body destructure (not in params)',
    source: `async () => {
        const f = async (x) => {
          const { b } = x;
          void b;
          return 42;
        };
        expect(await f({ b: 1 })).toBe(42);
      }`,
    output: `var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
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
});`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
