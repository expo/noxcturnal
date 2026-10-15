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
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'basic async/await > async function returns a promise',
    '() => {\n  async function foo() {\n    return 42;\n  }\n  const result = foo();\n  expect(result instanceof Promise).toBe(true);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n() => {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return 42;\n    });\n    return _foo.apply(this, arguments);\n  }\n  const result = foo();\n  expect(result instanceof Promise).toBe(true);\n};",
  ],
  [
    'basic async/await > await resolves promise value',
    'async () => {\n  async function foo() {\n    return await Promise.resolve(42);\n  }\n  expect(await foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return yield Promise.resolve(42);\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(42);\n});",
  ],
  [
    'basic async/await > async function returning non-promise wraps in promise',
    "async () => {\n  async function foo() {\n    return 'hello';\n  }\n  expect(await foo()).toBe('hello');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return 'hello';\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe('hello');\n});",
  ],
  [
    'basic async/await > await non-promise value passes through',
    'async () => {\n  async function foo() {\n    const x = await 42;\n    return x;\n  }\n  expect(await foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      const x = yield 42;\n      return x;\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(42);\n});",
  ],
  [
    'basic async/await > sequential awaits',
    'async () => {\n  async function foo() {\n    const a = await Promise.resolve(1);\n    const b = await Promise.resolve(2);\n    const c = await Promise.resolve(3);\n    return a + b + c;\n  }\n  expect(await foo()).toBe(6);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      const a = yield Promise.resolve(1);\n      const b = yield Promise.resolve(2);\n      const c = yield Promise.resolve(3);\n      return a + b + c;\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(6);\n});",
  ],
  [
    'basic async/await > await in expression position',
    'async () => {\n  async function foo() {\n    return (await Promise.resolve(10)) + (await Promise.resolve(32));\n  }\n  expect(await foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return (yield Promise.resolve(10)) + (yield Promise.resolve(32));\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(42);\n});",
  ],
  [
    'error handling > rejected promise throws on await',
    "async () => {\n  async function foo() {\n    try {\n      await Promise.reject(new Error('fail'));\n      return 'no error';\n    } catch (e) {\n      return e.message;\n    }\n  }\n  expect(await foo()).toBe('fail');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      try {\n        yield Promise.reject(new Error('fail'));\n        return 'no error';\n      } catch (e) {\n        return e.message;\n      }\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe('fail');\n});",
  ],
  [
    'error handling > throw in async function rejects the promise',
    "async () => {\n  async function foo() {\n    throw new Error('oops');\n  }\n  try {\n    await foo();\n    expect(true).toBe(false); // should not reach\n  } catch (e) {\n    expect(e.message).toBe('oops');\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      throw new Error('oops');\n    });\n    return _foo.apply(this, arguments);\n  }\n  try {\n    yield foo();\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('oops');\n  }\n});",
  ],
  [
    'error handling > try-catch-finally with await',
    "async () => {\n  const log = [];\n  async function foo() {\n    try {\n      log.push('try');\n      await Promise.reject(new Error('err'));\n    } catch (e) {\n      log.push('catch');\n    } finally {\n      log.push('finally');\n    }\n  }\n  await foo();\n  expect(log).toEqual(['try', 'catch', 'finally']);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const log = [];\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      try {\n        log.push('try');\n        yield Promise.reject(new Error('err'));\n      } catch (e) {\n        log.push('catch');\n      } finally {\n        log.push('finally');\n      }\n    });\n    return _foo.apply(this, arguments);\n  }\n  yield foo();\n  expect(log).toEqual(['try', 'catch', 'finally']);\n});",
  ],
  [
    'error handling > nested try-catch with async',
    "async () => {\n  async function inner() {\n    throw new Error('inner');\n  }\n  async function outer() {\n    try {\n      await inner();\n    } catch (e) {\n      return 'caught: ' + e.message;\n    }\n  }\n  expect(await outer()).toBe('caught: inner');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function inner() {\n    return _inner.apply(this, arguments);\n  }\n  function _inner() {\n    _inner = _asyncToGenerator(function* () {\n      throw new Error('inner');\n    });\n    return _inner.apply(this, arguments);\n  }\n  function outer() {\n    return _outer.apply(this, arguments);\n  }\n  function _outer() {\n    _outer = _asyncToGenerator(function* () {\n      try {\n        yield inner();\n      } catch (e) {\n        return 'caught: ' + e.message;\n      }\n    });\n    return _outer.apply(this, arguments);\n  }\n  expect(yield outer()).toBe('caught: inner');\n});",
  ],
  [
    'error handling > error after await does not lose context',
    "async () => {\n  async function foo() {\n    await Promise.resolve();\n    throw new Error('after await');\n  }\n  try {\n    await foo();\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('after await');\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      yield Promise.resolve();\n      throw new Error('after await');\n    });\n    return _foo.apply(this, arguments);\n  }\n  try {\n    yield foo();\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('after await');\n  }\n});",
  ],
  [
    'async arrow functions > basic async arrow',
    'async () => {\n  const foo = async () => 42;\n  expect(await foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const foo = (function () {\n    var _ref = _asyncToGenerator(function* () {\n      return 42;\n    });\n    return function foo() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield foo()).toBe(42);\n});",
  ],
  [
    'async arrow functions > async arrow with await',
    'async () => {\n  const foo = async (x) => {\n    const result = await Promise.resolve(x * 2);\n    return result;\n  };\n  expect(await foo(21)).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const foo = (function () {\n    var _ref = _asyncToGenerator(function* (x) {\n      const result = yield Promise.resolve(x * 2);\n      return result;\n    });\n    return function foo(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield foo(21)).toBe(42);\n});",
  ],
  [
    'async arrow functions > async arrow preserves this from enclosing scope',
    'async () => {\n  const obj = {\n    val: 42,\n    getVal: function () {\n      const fn = async () => {\n        return await Promise.resolve(this.val);\n      };\n      return fn();\n    },\n  };\n  expect(await obj.getVal()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const obj = {\n    val: 42,\n    getVal: function () {\n      var _this = this;\n      const fn = (function () {\n        var _ref = _asyncToGenerator(function* () {\n          return yield Promise.resolve(_this.val);\n        });\n        return function fn() {\n          return _ref.apply(this, arguments);\n        };\n      })();\n      return fn();\n    },\n  };\n  expect(yield obj.getVal()).toBe(42);\n});",
  ],
  [
    'async arrow functions > async arrow preserves name property',
    "() => {\n  var concat = async (...args) => {\n    var x = args[0];\n    var y = args[1];\n  };\n  expect(concat.name).toBe('concat');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n() => {\n  var concat = (function () {\n    var _ref = _asyncToGenerator(function* (...args) {\n      var x = args[0];\n      var y = args[1];\n    });\n    return function concat() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(concat.name).toBe('concat');\n};",
  ],
  [
    'async arrow functions > async function preserves length property',
    '() => {\n  var a = async (b) => {};\n  expect(a.length).toBe(1);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n() => {\n  var a = (function () {\n    var _ref = _asyncToGenerator(function* (b) {});\n    return function a(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(a.length).toBe(1);\n};",
  ],
  [
    'async methods > async class method',
    'async () => {\n  class Foo {\n    async bar() {\n      return await Promise.resolve(42);\n    }\n  }\n  expect(await new Foo().bar()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Foo {\n    bar() {\n      return _asyncToGenerator(function* () {\n        return yield Promise.resolve(42);\n      })();\n    }\n  }\n  expect(yield new Foo().bar()).toBe(42);\n});",
  ],
  [
    'async methods > async static method',
    'async () => {\n  class Foo {\n    static async bar() {\n      return await Promise.resolve(42);\n    }\n  }\n  expect(await Foo.bar()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Foo {\n    static bar() {\n      return _asyncToGenerator(function* () {\n        return yield Promise.resolve(42);\n      })();\n    }\n  }\n  expect(yield Foo.bar()).toBe(42);\n});",
  ],
  [
    'async methods > async object method',
    'async () => {\n  const obj = {\n    async foo() {\n      return await Promise.resolve(42);\n    },\n  };\n  expect(await obj.foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const obj = {\n    foo() {\n      return _asyncToGenerator(function* () {\n        return yield Promise.resolve(42);\n      })();\n    },\n  };\n  expect(yield obj.foo()).toBe(42);\n});",
  ],
  [
    'async methods > async method preserves this',
    'async () => {\n  class Foo {\n    constructor(val) {\n      this.val = val;\n    }\n    async getVal() {\n      return await Promise.resolve(this.val);\n    }\n  }\n  expect(await new Foo(42).getVal()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Foo {\n    constructor(val) {\n      this.val = val;\n    }\n    getVal() {\n      var _this = this;\n      return _asyncToGenerator(function* () {\n        return yield Promise.resolve(_this.val);\n      })();\n    }\n  }\n  expect(yield new Foo(42).getVal()).toBe(42);\n});",
  ],
  [
    'complex parameters > async method with destructured parameter that throws',
    'async () => {\n  let caught = false;\n  class Foo {\n    async bar(a, { b }) {}\n  }\n  try {\n    await new Foo().bar();\n  } catch (e) {\n    caught = true;\n  }\n  expect(caught).toBe(true);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  let caught = false;\n  class Foo {\n    bar(_x, _x2) {\n      return _asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);\n    }\n  }\n  try {\n    yield new Foo().bar();\n  } catch (e) {\n    caught = true;\n  }\n  expect(caught).toBe(true);\n});",
  ],
  [
    'complex parameters > async method with destructured parameter',
    'async () => {\n  class Foo {\n    async bar(a, { b }) {\n      return [a, b];\n    }\n  }\n  expect(await new Foo().bar(1, { b: 2 })).toEqual([1, 2]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Foo {\n    bar(_x, _x2) {\n      return _asyncToGenerator(function* (a, { b }) {\n        return [a, b];\n      }).apply(this, arguments);\n    }\n  }\n  expect(yield new Foo().bar(1, { b: 2 })).toEqual([1, 2]);\n});",
  ],
  [
    'complex parameters > async method with default parameter',
    "async () => {\n  async function foo(\n    a,\n    b = (() => {\n      throw new Error('required');\n    })()\n  ) {\n    return [a, b];\n  }\n  expect(await foo(1, 2)).toEqual([1, 2]);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo(_x) {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* (\n      a,\n      b = (() => {\n        throw new Error('required');\n      })(),\n    ) {\n      return [a, b];\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo(1, 2)).toEqual([1, 2]);\n});",
  ],
  [
    'complex parameters > async function with mandatory default throws on missing param',
    "async () => {\n  function mandatory(name) {\n    throw new Error('Missing: ' + name);\n  }\n  async function foo({ a, b = mandatory('b') } = {}) {\n    return b;\n  }\n  try {\n    await foo();\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('Missing: b');\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function mandatory(name) {\n    throw new Error('Missing: ' + name);\n  }\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* ({ a, b = mandatory('b') } = {}) {\n      return b;\n    });\n    return _foo.apply(this, arguments);\n  }\n  try {\n    yield foo();\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('Missing: b');\n  }\n});",
  ],
  [
    'complex parameters > async method with rest parameter',
    'async () => {\n  class Foo {\n    async bar(a, ...b) {\n      return [a, b];\n    }\n  }\n  expect(await new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Foo {\n    bar(_x) {\n      return _asyncToGenerator(function* (a, ...b) {\n        return [a, b];\n      }).apply(this, arguments);\n    }\n  }\n  expect(yield new Foo().bar(1, 2, 3)).toEqual([1, [2, 3]]);\n});",
  ],
  [
    'complex parameters > async method with super access',
    "async () => {\n  class Base {\n    get val() {\n      return 'base';\n    }\n  }\n  class Child extends Base {\n    async foo(a, { b }) {\n      return [a, b, super.val];\n    }\n  }\n  expect(await new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Base {\n    get val() {\n      return 'base';\n    }\n  }\n  class Child extends Base {\n    foo(_x, _x2) {\n      var _superprop_getVal = () => super.val;\n      return _asyncToGenerator(function* (a, { b }) {\n        return [a, b, _superprop_getVal()];\n      }).apply(this, arguments);\n    }\n  }\n  expect(yield new Child().foo(1, { b: 2 })).toEqual([1, 2, 'base']);\n});",
  ],
  [
    'execution order > code after await runs asynchronously',
    'async () => {\n  const log = [];\n  async function foo() {\n    log.push(1);\n    await null;\n    log.push(2);\n  }\n  const p = foo();\n  log.push(3);\n  await p;\n  expect(log).toEqual([1, 3, 2]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const log = [];\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      log.push(1);\n      yield null;\n      log.push(2);\n    });\n    return _foo.apply(this, arguments);\n  }\n  const p = foo();\n  log.push(3);\n  yield p;\n  expect(log).toEqual([1, 3, 2]);\n});",
  ],
  [
    'execution order > multiple async functions interleave correctly',
    "async () => {\n  const log = [];\n  async function a() {\n    log.push('a1');\n    await null;\n    log.push('a2');\n  }\n  async function b() {\n    log.push('b1');\n    await null;\n    log.push('b2');\n  }\n  await Promise.all([a(), b()]);\n  expect(log[0]).toBe('a1');\n  expect(log[1]).toBe('b1');\n  // a2 and b2 ordering depends on microtask queue\n  expect(log.indexOf('a2') >= 0).toBe(true);\n  expect(log.indexOf('b2') >= 0).toBe(true);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const log = [];\n  function a() {\n    return _a.apply(this, arguments);\n  }\n  function _a() {\n    _a = _asyncToGenerator(function* () {\n      log.push('a1');\n      yield null;\n      log.push('a2');\n    });\n    return _a.apply(this, arguments);\n  }\n  function b() {\n    return _b.apply(this, arguments);\n  }\n  function _b() {\n    _b = _asyncToGenerator(function* () {\n      log.push('b1');\n      yield null;\n      log.push('b2');\n    });\n    return _b.apply(this, arguments);\n  }\n  yield Promise.all([a(), b()]);\n  expect(log[0]).toBe('a1');\n  expect(log[1]).toBe('b1');\n  // a2 and b2 ordering depends on microtask queue\n  expect(log.indexOf('a2') >= 0).toBe(true);\n  expect(log.indexOf('b2') >= 0).toBe(true);\n});",
  ],
  [
    'execution order > double await adds extra microtask delay',
    'async () => {\n  const log = [];\n\n  const p1 = (async function () {\n    log.push(1);\n    await await null;\n    log.push(2);\n  })();\n\n  const p2 = (async function () {\n    log.push(3);\n    await null;\n    log.push(4);\n  })();\n\n  log.push(5);\n\n  await Promise.all([p1, p2]);\n  // 4 should come before 2 due to double-await extra tick\n  expect(log.indexOf(4) < log.indexOf(2)).toBe(true);\n  expect(log[0]).toBe(1);\n  expect(log[1]).toBe(3);\n  expect(log[2]).toBe(5);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const log = [];\n  const p1 = _asyncToGenerator(function* () {\n    log.push(1);\n    yield yield null;\n    log.push(2);\n  })();\n  const p2 = _asyncToGenerator(function* () {\n    log.push(3);\n    yield null;\n    log.push(4);\n  })();\n  log.push(5);\n  yield Promise.all([p1, p2]);\n  // 4 should come before 2 due to double-await extra tick\n  expect(log.indexOf(4) < log.indexOf(2)).toBe(true);\n  expect(log[0]).toBe(1);\n  expect(log[1]).toBe(3);\n  expect(log[2]).toBe(5);\n});",
  ],
  [
    'closures and loops > async closure in for-of captures correct value',
    'async () => {\n  let items = [1, 2, 3, 4];\n  let output = [];\n  for (const item of items) {\n    await (async (x) => {\n      output.push(item);\n    })();\n  }\n  expect(output).toEqual([1, 2, 3, 4]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  let items = [1, 2, 3, 4];\n  let output = [];\n  for (const item of items) {\n    yield (function () {\n      var _ref = _asyncToGenerator(function* (x) {\n        output.push(item);\n      });\n      return function (_x) {\n        return _ref.apply(this, arguments);\n      };\n    })()();\n  }\n  expect(output).toEqual([1, 2, 3, 4]);\n});",
  ],
  [
    'closures and loops > await in for loop with closure',
    'async () => {\n  const results = [];\n  for (let i = 0; i < 3; i++) {\n    const val = await Promise.resolve(i * 10);\n    results.push(() => val);\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(10);\n  expect(results[2]()).toBe(20);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const results = [];\n  for (let i = 0; i < 3; i++) {\n    const val = yield Promise.resolve(i * 10);\n    results.push(() => val);\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(10);\n  expect(results[2]()).toBe(20);\n});",
  ],
  [
    'closures and loops > await in while loop',
    'async () => {\n  let sum = 0;\n  let i = 0;\n  while (i < 5) {\n    sum += await Promise.resolve(i);\n    i++;\n  }\n  expect(sum).toBe(10);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  let sum = 0;\n  let i = 0;\n  while (i < 5) {\n    sum += yield Promise.resolve(i);\n    i++;\n  }\n  expect(sum).toBe(10);\n});",
  ],
  [
    'closures and loops > recursive async function (polling pattern)',
    'async () => {\n  const log = [];\n  async function collect(count) {\n    log.push(await Promise.resolve(count));\n    if (count < 3) {\n      await collect(count + 1);\n    }\n  }\n  await collect(0);\n  expect(log).toEqual([0, 1, 2, 3]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const log = [];\n  function collect(_x) {\n    return _collect.apply(this, arguments);\n  }\n  function _collect() {\n    _collect = _asyncToGenerator(function* (count) {\n      log.push(yield Promise.resolve(count));\n      if (count < 3) {\n        yield collect(count + 1);\n      }\n    });\n    return _collect.apply(this, arguments);\n  }\n  yield collect(0);\n  expect(log).toEqual([0, 1, 2, 3]);\n});",
  ],
  [
    'hoisting and declarations > async function declaration is hoisted',
    'async () => {\n  // Call before declaration\n  const result = await foo();\n  expect(result).toBe(42);\n\n  async function foo() {\n    return 42;\n  }\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  // Call before declaration\n  const result = yield foo();\n  expect(result).toBe(42);\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return 42;\n    });\n    return _foo.apply(this, arguments);\n  }\n});",
  ],
  [
    'hoisting and declarations > async function expression is not hoisted',
    '() => {\n  expect(() => {\n    bar();\n  }).toThrow();\n\n  var bar = async function () {\n    return 42;\n  };\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n() => {\n  expect(() => {\n    bar();\n  }).toThrow();\n  var bar = _asyncToGenerator(function* () {\n    return 42;\n  });\n};",
  ],
  [
    'parallel patterns > Promise.all with multiple async calls',
    'async () => {\n  async function double(x) {\n    return await Promise.resolve(x * 2);\n  }\n  const results = await Promise.all([double(1), double(2), double(3)]);\n  expect(results).toEqual([2, 4, 6]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function double(_x) {\n    return _double.apply(this, arguments);\n  }\n  function _double() {\n    _double = _asyncToGenerator(function* (x) {\n      return yield Promise.resolve(x * 2);\n    });\n    return _double.apply(this, arguments);\n  }\n  const results = yield Promise.all([double(1), double(2), double(3)]);\n  expect(results).toEqual([2, 4, 6]);\n});",
  ],
  [
    'parallel patterns > Promise.race with async functions',
    "async () => {\n  async function fast() {\n    return 'fast';\n  }\n  async function slow() {\n    await new Promise((r) => setTimeout(r, 100));\n    return 'slow';\n  }\n  const result = await Promise.race([fast(), slow()]);\n  expect(result).toBe('fast');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function fast() {\n    return _fast.apply(this, arguments);\n  }\n  function _fast() {\n    _fast = _asyncToGenerator(function* () {\n      return 'fast';\n    });\n    return _fast.apply(this, arguments);\n  }\n  function slow() {\n    return _slow.apply(this, arguments);\n  }\n  function _slow() {\n    _slow = _asyncToGenerator(function* () {\n      yield new Promise(r => setTimeout(r, 100));\n      return 'slow';\n    });\n    return _slow.apply(this, arguments);\n  }\n  const result = yield Promise.race([fast(), slow()]);\n  expect(result).toBe('fast');\n});",
  ],
  [
    'parallel patterns > Promise.allSettled with mixed results',
    "async () => {\n  async function succeed() {\n    return 'ok';\n  }\n  async function fail() {\n    throw new Error('fail');\n  }\n  const results = await Promise.allSettled([succeed(), fail()]);\n  expect(results[0].status).toBe('fulfilled');\n  expect(results[0].value).toBe('ok');\n  expect(results[1].status).toBe('rejected');\n  expect(results[1].reason.message).toBe('fail');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function succeed() {\n    return _succeed.apply(this, arguments);\n  }\n  function _succeed() {\n    _succeed = _asyncToGenerator(function* () {\n      return 'ok';\n    });\n    return _succeed.apply(this, arguments);\n  }\n  function fail() {\n    return _fail.apply(this, arguments);\n  }\n  function _fail() {\n    _fail = _asyncToGenerator(function* () {\n      throw new Error('fail');\n    });\n    return _fail.apply(this, arguments);\n  }\n  const results = yield Promise.allSettled([succeed(), fail()]);\n  expect(results[0].status).toBe('fulfilled');\n  expect(results[0].value).toBe('ok');\n  expect(results[1].status).toBe('rejected');\n  expect(results[1].reason.message).toBe('fail');\n});",
  ],
  [
    'edge cases > async IIFE',
    'async () => {\n  const result = await (async () => {\n    return await Promise.resolve(42);\n  })();\n  expect(result).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const result = yield _asyncToGenerator(function* () {\n    return yield Promise.resolve(42);\n  })();\n  expect(result).toBe(42);\n});",
  ],
  [
    'edge cases > nested async functions',
    'async () => {\n  async function outer() {\n    async function inner() {\n      return await Promise.resolve(21);\n    }\n    const val = await inner();\n    return val * 2;\n  }\n  expect(await outer()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function outer() {\n    return _outer.apply(this, arguments);\n  }\n  function _outer() {\n    _outer = _asyncToGenerator(function* () {\n      function inner() {\n        return _inner.apply(this, arguments);\n      }\n      function _inner() {\n        _inner = _asyncToGenerator(function* () {\n          return yield Promise.resolve(21);\n        });\n        return _inner.apply(this, arguments);\n      }\n      const val = yield inner();\n      return val * 2;\n    });\n    return _outer.apply(this, arguments);\n  }\n  expect(yield outer()).toBe(42);\n});",
  ],
  [
    'edge cases > async function returning another async function',
    'async () => {\n  async function factory() {\n    return async (x) => x * 2;\n  }\n  const fn = await factory();\n  expect(await fn(21)).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function factory() {\n    return _factory.apply(this, arguments);\n  }\n  function _factory() {\n    _factory = _asyncToGenerator(function* () {\n      return (function () {\n        var _ref = _asyncToGenerator(function* (x) {\n          return x * 2;\n        });\n        return function (_x) {\n          return _ref.apply(this, arguments);\n        };\n      })();\n    });\n    return _factory.apply(this, arguments);\n  }\n  const fn = yield factory();\n  expect(yield fn(21)).toBe(42);\n});",
  ],
  [
    'edge cases > await in conditional expression',
    "async () => {\n  async function foo(flag) {\n    return flag ? await Promise.resolve('yes') : await Promise.resolve('no');\n  }\n  expect(await foo(true)).toBe('yes');\n  expect(await foo(false)).toBe('no');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo(_x) {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* (flag) {\n      return flag ? yield Promise.resolve('yes') : yield Promise.resolve('no');\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo(true)).toBe('yes');\n  expect(yield foo(false)).toBe('no');\n});",
  ],
  [
    'edge cases > await in template literal',
    "async () => {\n  async function foo() {\n    return `result: ${await Promise.resolve(42)}`;\n  }\n  expect(await foo()).toBe('result: 42');\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return `result: ${yield Promise.resolve(42)}`;\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe('result: 42');\n});",
  ],
  [
    'edge cases > await in array literal',
    'async () => {\n  async function foo() {\n    return [await Promise.resolve(1), await Promise.resolve(2), await Promise.resolve(3)];\n  }\n  expect(await foo()).toEqual([1, 2, 3]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return [yield Promise.resolve(1), yield Promise.resolve(2), yield Promise.resolve(3)];\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toEqual([1, 2, 3]);\n});",
  ],
  [
    'edge cases > await in object literal',
    'async () => {\n  async function foo() {\n    return {\n      a: await Promise.resolve(1),\n      b: await Promise.resolve(2),\n    };\n  }\n  expect(await foo()).toEqual({ a: 1, b: 2 });\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return {\n        a: yield Promise.resolve(1),\n        b: yield Promise.resolve(2),\n      };\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toEqual({\n    a: 1,\n    b: 2,\n  });\n});",
  ],
  [
    'edge cases > await in destructuring',
    'async () => {\n  async function foo() {\n    const { a, b } = await Promise.resolve({ a: 1, b: 2 });\n    return a + b;\n  }\n  expect(await foo()).toBe(3);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      const { a, b } = yield Promise.resolve({\n        a: 1,\n        b: 2,\n      });\n      return a + b;\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(3);\n});",
  ],
  [
    'edge cases > await in switch statement',
    "async () => {\n  async function foo(key) {\n    switch (await Promise.resolve(key)) {\n      case 'a':\n        return 1;\n      case 'b':\n        return 2;\n      default:\n        return 0;\n    }\n  }\n  expect(await foo('a')).toBe(1);\n  expect(await foo('b')).toBe(2);\n  expect(await foo('c')).toBe(0);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo(_x) {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* (key) {\n      switch (yield Promise.resolve(key)) {\n        case 'a':\n          return 1;\n        case 'b':\n          return 2;\n        default:\n          return 0;\n      }\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo('a')).toBe(1);\n  expect(yield foo('b')).toBe(2);\n  expect(yield foo('c')).toBe(0);\n});",
  ],
  [
    'edge cases > returning a promise from async function does not double-wrap',
    'async () => {\n  async function foo() {\n    return Promise.resolve(42);\n  }\n  const result = await foo();\n  expect(result).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return Promise.resolve(42);\n    });\n    return _foo.apply(this, arguments);\n  }\n  const result = yield foo();\n  expect(result).toBe(42);\n});",
  ],
  [
    'edge cases > returning a thenable from async function',
    'async () => {\n  async function foo() {\n    return {\n      then(resolve) {\n        resolve(42);\n      },\n    };\n  }\n  expect(await foo()).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = _asyncToGenerator(function* () {\n      return {\n        then(resolve) {\n          resolve(42);\n        },\n      };\n    });\n    return _foo.apply(this, arguments);\n  }\n  expect(yield foo()).toBe(42);\n});",
  ],
  [
    'stack traces > error stack includes async function name',
    "async () => {\n  async function myAsyncFunction() {\n    throw new Error('trace test');\n  }\n  try {\n    await myAsyncFunction();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The async function name should appear somewhere in the stack\n    expect(stack.indexOf('myAsyncFunction') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function myAsyncFunction() {\n    return _myAsyncFunction.apply(this, arguments);\n  }\n  function _myAsyncFunction() {\n    _myAsyncFunction = _asyncToGenerator(function* () {\n      throw new Error('trace test');\n    });\n    return _myAsyncFunction.apply(this, arguments);\n  }\n  try {\n    yield myAsyncFunction();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The async function name should appear somewhere in the stack\n    expect(stack.indexOf('myAsyncFunction') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error stack includes caller chain through await',
    "async () => {\n  async function innerFunc() {\n    throw new Error('deep trace');\n  }\n  async function middleFunc() {\n    return await innerFunc();\n  }\n  async function outerFunc() {\n    return await middleFunc();\n  }\n  try {\n    await outerFunc();\n  } catch (e) {\n    const stack = e.stack || '';\n    // At minimum, the function that threw should be in the stack\n    expect(stack.indexOf('innerFunc') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function innerFunc() {\n    return _innerFunc.apply(this, arguments);\n  }\n  function _innerFunc() {\n    _innerFunc = _asyncToGenerator(function* () {\n      throw new Error('deep trace');\n    });\n    return _innerFunc.apply(this, arguments);\n  }\n  function middleFunc() {\n    return _middleFunc.apply(this, arguments);\n  }\n  function _middleFunc() {\n    _middleFunc = _asyncToGenerator(function* () {\n      return yield innerFunc();\n    });\n    return _middleFunc.apply(this, arguments);\n  }\n  function outerFunc() {\n    return _outerFunc.apply(this, arguments);\n  }\n  function _outerFunc() {\n    _outerFunc = _asyncToGenerator(function* () {\n      return yield middleFunc();\n    });\n    return _outerFunc.apply(this, arguments);\n  }\n  try {\n    yield outerFunc();\n  } catch (e) {\n    const stack = e.stack || '';\n    // At minimum, the function that threw should be in the stack\n    expect(stack.indexOf('innerFunc') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error created inside async function has meaningful stack',
    "async () => {\n  async function createError() {\n    await Promise.resolve();\n    return new Error('for inspection');\n  }\n  const err = await createError();\n  const stack = err.stack || '';\n  // The error should have a stack that includes the function name\n  expect(stack.indexOf('createError') >= 0).toBe(true);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function createError() {\n    return _createError.apply(this, arguments);\n  }\n  function _createError() {\n    _createError = _asyncToGenerator(function* () {\n      yield Promise.resolve();\n      return new Error('for inspection');\n    });\n    return _createError.apply(this, arguments);\n  }\n  const err = yield createError();\n  const stack = err.stack || '';\n  // The error should have a stack that includes the function name\n  expect(stack.indexOf('createError') >= 0).toBe(true);\n});",
  ],
  [
    'stack traces > console-style stack preservation through async chain',
    "async () => {\n  // Tests that the originating call site is preserved when errors\n  // propagate through multiple await layers\n  const errors = [];\n  async function level3() {\n    throw new Error('level3 error');\n  }\n  async function level2() {\n    await level3();\n  }\n  async function level1() {\n    try {\n      await level2();\n    } catch (e) {\n      errors.push(e);\n    }\n  }\n  await level1();\n  expect(errors.length).toBe(1);\n  expect(errors[0].message).toBe('level3 error');\n  const stack = errors[0].stack || '';\n  expect(stack.indexOf('level3') >= 0).toBe(true);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  // Tests that the originating call site is preserved when errors\n  // propagate through multiple await layers\n  const errors = [];\n  function level3() {\n    return _level.apply(this, arguments);\n  }\n  function _level() {\n    _level = _asyncToGenerator(function* () {\n      throw new Error('level3 error');\n    });\n    return _level.apply(this, arguments);\n  }\n  function level2() {\n    return _level2.apply(this, arguments);\n  }\n  function _level2() {\n    _level2 = _asyncToGenerator(function* () {\n      yield level3();\n    });\n    return _level2.apply(this, arguments);\n  }\n  function level1() {\n    return _level3.apply(this, arguments);\n  }\n  function _level3() {\n    _level3 = _asyncToGenerator(function* () {\n      try {\n        yield level2();\n      } catch (e) {\n        errors.push(e);\n      }\n    });\n    return _level3.apply(this, arguments);\n  }\n  yield level1();\n  expect(errors.length).toBe(1);\n  expect(errors[0].message).toBe('level3 error');\n  const stack = errors[0].stack || '';\n  expect(stack.indexOf('level3') >= 0).toBe(true);\n});",
  ],
  [
    'stack traces > deep async chain preserves multiple function names in stack',
    "async () => {\n  async function database() {\n    throw new Error('connection refused');\n  }\n  async function repository() {\n    return await database();\n  }\n  async function service() {\n    return await repository();\n  }\n  async function controller() {\n    return await service();\n  }\n  async function router() {\n    return await controller();\n  }\n  try {\n    await router();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The throw site should always be present\n    expect(stack.indexOf('database') >= 0).toBe(true);\n    // Intermediate callers should appear in the async stack\n    expect(stack.indexOf('repository') >= 0).toBe(true);\n    expect(stack.indexOf('service') >= 0).toBe(true);\n    expect(stack.indexOf('controller') >= 0).toBe(true);\n    expect(stack.indexOf('router') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function database() {\n    return _database.apply(this, arguments);\n  }\n  function _database() {\n    _database = _asyncToGenerator(function* () {\n      throw new Error('connection refused');\n    });\n    return _database.apply(this, arguments);\n  }\n  function repository() {\n    return _repository.apply(this, arguments);\n  }\n  function _repository() {\n    _repository = _asyncToGenerator(function* () {\n      return yield database();\n    });\n    return _repository.apply(this, arguments);\n  }\n  function service() {\n    return _service.apply(this, arguments);\n  }\n  function _service() {\n    _service = _asyncToGenerator(function* () {\n      return yield repository();\n    });\n    return _service.apply(this, arguments);\n  }\n  function controller() {\n    return _controller.apply(this, arguments);\n  }\n  function _controller() {\n    _controller = _asyncToGenerator(function* () {\n      return yield service();\n    });\n    return _controller.apply(this, arguments);\n  }\n  function router() {\n    return _router.apply(this, arguments);\n  }\n  function _router() {\n    _router = _asyncToGenerator(function* () {\n      return yield controller();\n    });\n    return _router.apply(this, arguments);\n  }\n  try {\n    yield router();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The throw site should always be present\n    expect(stack.indexOf('database') >= 0).toBe(true);\n    // Intermediate callers should appear in the async stack\n    expect(stack.indexOf('repository') >= 0).toBe(true);\n    expect(stack.indexOf('service') >= 0).toBe(true);\n    expect(stack.indexOf('controller') >= 0).toBe(true);\n    expect(stack.indexOf('router') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error thrown synchronously before any await has function name',
    "async () => {\n  async function failImmediately() {\n    throw new Error('sync throw');\n  }\n  try {\n    await failImmediately();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failImmediately') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function failImmediately() {\n    return _failImmediately.apply(this, arguments);\n  }\n  function _failImmediately() {\n    _failImmediately = _asyncToGenerator(function* () {\n      throw new Error('sync throw');\n    });\n    return _failImmediately.apply(this, arguments);\n  }\n  try {\n    yield failImmediately();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failImmediately') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error from rejected promise includes thrower name',
    "async () => {\n  async function rejecter() {\n    return Promise.reject(new Error('rejected'));\n  }\n  async function caller() {\n    return await rejecter();\n  }\n  try {\n    await caller();\n  } catch (e) {\n    expect(e.message).toBe('rejected');\n    const stack = e.stack || '';\n    expect(stack.indexOf('rejecter') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function rejecter() {\n    return _rejecter.apply(this, arguments);\n  }\n  function _rejecter() {\n    _rejecter = _asyncToGenerator(function* () {\n      return Promise.reject(new Error('rejected'));\n    });\n    return _rejecter.apply(this, arguments);\n  }\n  function caller() {\n    return _caller.apply(this, arguments);\n  }\n  function _caller() {\n    _caller = _asyncToGenerator(function* () {\n      return yield rejecter();\n    });\n    return _caller.apply(this, arguments);\n  }\n  try {\n    yield caller();\n  } catch (e) {\n    expect(e.message).toBe('rejected');\n    const stack = e.stack || '';\n    expect(stack.indexOf('rejecter') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > async arrow function name in stack',
    "async () => {\n  const myArrowAsync = async () => {\n    throw new Error('arrow error');\n  };\n  try {\n    await myArrowAsync();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('myArrowAsync') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const myArrowAsync = (function () {\n    var _ref = _asyncToGenerator(function* () {\n      throw new Error('arrow error');\n    });\n    return function myArrowAsync() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  try {\n    yield myArrowAsync();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('myArrowAsync') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > async method name in stack',
    "async () => {\n  class MyService {\n    async fetchData() {\n      throw new Error('service error');\n    }\n  }\n  try {\n    await new MyService().fetchData();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('fetchData') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class MyService {\n    fetchData() {\n      return _asyncToGenerator(function* () {\n        throw new Error('service error');\n      })();\n    }\n  }\n  try {\n    yield new MyService().fetchData();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('fetchData') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > nested async class methods preserve inner name',
    "async () => {\n  class Repo {\n    async query() {\n      throw new Error('db error');\n    }\n  }\n  class Service {\n    async handle() {\n      return await new Repo().query();\n    }\n  }\n  try {\n    await new Service().handle();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('query') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class Repo {\n    query() {\n      return _asyncToGenerator(function* () {\n        throw new Error('db error');\n      })();\n    }\n  }\n  class Service {\n    handle() {\n      return _asyncToGenerator(function* () {\n        return yield new Repo().query();\n      })();\n    }\n  }\n  try {\n    yield new Service().handle();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('query') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error in Promise.all includes thrower name',
    "async () => {\n  async function badTask() {\n    await Promise.resolve();\n    throw new Error('task failed');\n  }\n  try {\n    await Promise.all([Promise.resolve(1), badTask()]);\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('badTask') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function badTask() {\n    return _badTask.apply(this, arguments);\n  }\n  function _badTask() {\n    _badTask = _asyncToGenerator(function* () {\n      yield Promise.resolve();\n      throw new Error('task failed');\n    });\n    return _badTask.apply(this, arguments);\n  }\n  try {\n    yield Promise.all([Promise.resolve(1), badTask()]);\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('badTask') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > re-thrown error preserves original stack',
    "async () => {\n  async function original() {\n    throw new Error('original error');\n  }\n  async function wrapper() {\n    try {\n      await original();\n    } catch (e) {\n      throw e; // re-throw\n    }\n  }\n  try {\n    await wrapper();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The original throw site should still be in the stack\n    expect(stack.indexOf('original') >= 0).toBe(true);\n  }\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function original() {\n    return _original.apply(this, arguments);\n  }\n  function _original() {\n    _original = _asyncToGenerator(function* () {\n      throw new Error('original error');\n    });\n    return _original.apply(this, arguments);\n  }\n  function wrapper() {\n    return _wrapper.apply(this, arguments);\n  }\n  function _wrapper() {\n    _wrapper = _asyncToGenerator(function* () {\n      try {\n        yield original();\n      } catch (e) {\n        throw e;\n      }\n    });\n    return _wrapper.apply(this, arguments);\n  }\n  try {\n    yield wrapper();\n  } catch (e) {\n    const stack = e.stack || '';\n    // The original throw site should still be in the stack\n    expect(stack.indexOf('original') >= 0).toBe(true);\n  }\n});",
  ],
  [
    'stack traces > error constructed after await preserves function name',
    "async () => {\n  async function buildError() {\n    await Promise.resolve();\n    return new Error('constructed');\n  }\n  const err = await buildError();\n  const stack = err.stack || '';\n  expect(stack.indexOf('buildError') >= 0).toBe(true);\n}",
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function buildError() {\n    return _buildError.apply(this, arguments);\n  }\n  function _buildError() {\n    _buildError = _asyncToGenerator(function* () {\n      yield Promise.resolve();\n      return new Error('constructed');\n    });\n    return _buildError.apply(this, arguments);\n  }\n  const err = yield buildError();\n  const stack = err.stack || '';\n  expect(stack.indexOf('buildError') >= 0).toBe(true);\n});",
  ],
  [
    'destructuring + state lifting > awaits after destructuring in arrow params',
    'async () => {\n  const f = async ({ b: _ }) => 42;\n  const actual = await f({ b: 1 });\n  expect(actual).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ b: _ }) {\n      return 42;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  const actual = yield f({ b: 1 });\n  expect(actual).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > object destructure with rename',
    'async () => {\n  const f = async ({ b: x }) => x;\n  expect(await f({ b: 42 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ b: x }) {\n      return x;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f({ b: 42 })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > object destructure with default',
    'async () => {\n  const f = async ({ b = 7 }) => b;\n  expect(await f({})).toBe(7);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ b = 7 }) {\n      return b;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f({})).toBe(7);\n});",
  ],
  [
    'destructuring + state lifting > object destructure with rest',
    'async () => {\n  const f = async ({ a, ...rest }) => rest;\n  expect(await f({ a: 1, b: 2, c: 3 })).toEqual({ b: 2, c: 3 });\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ a, ...rest }) {\n      return rest;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(\n    yield f({\n      a: 1,\n      b: 2,\n      c: 3,\n    }),\n  ).toEqual({\n    b: 2,\n    c: 3,\n  });\n});",
  ],
  [
    'destructuring + state lifting > nested object destructure',
    'async () => {\n  const f = async ({ a: { b } }) => b;\n  expect(await f({ a: { b: 42 } })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ a: { b } }) {\n      return b;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f({ a: { b: 42 } })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > array destructure',
    'async () => {\n  const f = async ([a, b]) => a + b;\n  expect(await f([1, 2])).toBe(3);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ([a, b]) {\n      return a + b;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f([1, 2])).toBe(3);\n});",
  ],
  [
    'destructuring + state lifting > array destructure with rest',
    'async () => {\n  const f = async ([a, ...rest]) => rest;\n  expect(await f([1, 2, 3, 4])).toEqual([2, 3, 4]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ([a, ...rest]) {\n      return rest;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f([1, 2, 3, 4])).toEqual([2, 3, 4]);\n});",
  ],
  [
    'destructuring + state lifting > async arrow with default-value param',
    'async () => {\n  const f = async (x = 7) => x;\n  expect(await f()).toBe(7);\n  expect(await f(9)).toBe(9);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* (x = 7) {\n      return x;\n    });\n    return function f() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f()).toBe(7);\n  expect(yield f(9)).toBe(9);\n});",
  ],
  [
    'destructuring + state lifting > async arrow with rest param',
    'async () => {\n  const f = async (...rest) => rest.length;\n  expect(await f(1, 2, 3)).toBe(3);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* (...rest) {\n      return rest.length;\n    });\n    return function f() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f(1, 2, 3)).toBe(3);\n});",
  ],
  [
    'destructuring + state lifting > value visible through .then()',
    'async () => {\n  const f = async ({ b: _ }) => 42;\n  const seen = await new Promise((resolve) => {\n    f({ b: 1 }).then((v) => resolve(v));\n  });\n  expect(seen).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ b: _ }) {\n      return 42;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  const seen = yield new Promise(resolve => {\n    f({ b: 1 }).then(v => resolve(v));\n  });\n  expect(seen).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > value visible through Promise.all',
    'async () => {\n  const f = async ({ b }) => b;\n  const results = await Promise.all([f({ b: 1 }), f({ b: 2 }), f({ b: 3 })]);\n  expect(results).toEqual([1, 2, 3]);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* ({ b }) {\n      return b;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  const results = yield Promise.all([f({ b: 1 }), f({ b: 2 }), f({ b: 3 })]);\n  expect(results).toEqual([1, 2, 3]);\n});",
  ],
  [
    'destructuring + state lifting > control: async arrow with plain (non-destructured) params',
    'async () => {\n  const f = async (a, b) => 42;\n  expect(await f(1, 2)).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* (a, b) {\n      return 42;\n    });\n    return function f(_x, _x2) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f(1, 2)).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > control: async function declaration with destructured param',
    'async () => {\n  async function f({ b }) {\n    return 42;\n  }\n  expect(await f({ b: 1 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  function f(_x) {\n    return _f.apply(this, arguments);\n  }\n  function _f() {\n    _f = _asyncToGenerator(function* ({ b }) {\n      return 42;\n    });\n    return _f.apply(this, arguments);\n  }\n  expect(yield f({ b: 1 })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > control: async function expression with destructured param',
    'async () => {\n  const f = async function ({ b }) {\n    return 42;\n  };\n  expect(await f({ b: 1 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = /* @__PURE__ */ (function () {\n    var _ref = _asyncToGenerator(function* ({ b }) {\n      return 42;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f({ b: 1 })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > control: class async method with destructured param',
    'async () => {\n  class C {\n    async m({ b }) {\n      return 42;\n    }\n  }\n  expect(await new C().m({ b: 1 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  class C {\n    m(_x) {\n      return _asyncToGenerator(function* ({ b }) {\n        return 42;\n      }).apply(this, arguments);\n    }\n  }\n  expect(yield new C().m({ b: 1 })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > control: object shorthand async method with destructured param',
    'async () => {\n  const o = {\n    async m({ b }) {\n      return 42;\n    },\n  };\n  expect(await o.m({ b: 1 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const o = {\n    m(_x) {\n      return _asyncToGenerator(function* ({ b }) {\n        return 42;\n      }).apply(this, arguments);\n    },\n  };\n  expect(yield o.m({ b: 1 })).toBe(42);\n});",
  ],
  [
    'destructuring + state lifting > control: arrow with body destructure (not in params)',
    'async () => {\n  const f = async (x) => {\n    const { b } = x;\n    void b;\n    return 42;\n  };\n  expect(await f({ b: 1 })).toBe(42);\n}',
    "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');\n_asyncToGenerator(function* () {\n  const f = (function () {\n    var _ref = _asyncToGenerator(function* (x) {\n      const { b } = x;\n      void b;\n      return 42;\n    });\n    return function f(_x) {\n      return _ref.apply(this, arguments);\n    };\n  })();\n  expect(yield f({ b: 1 })).toBe(42);\n});",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
