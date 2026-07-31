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
      asyncGeneratorFunctions: true,
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'sync generators > basic generator yields values',
    '() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 2, done: false });\n  expect(g.next()).toEqual({ value: 3, done: false });\n  expect(g.next()).toEqual({ value: undefined, done: true });\n}',
    '() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 2, done: false });\n  expect(g.next()).toEqual({ value: 3, done: false });\n  expect(g.next()).toEqual({ value: undefined, done: true });\n};',
  ],
  [
    'sync generators > generator with return value',
    "() => {\n  function* gen() {\n    yield 1;\n    return 'done';\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 'done', done: true });\n  expect(g.next()).toEqual({ value: undefined, done: true });\n}",
    "() => {\n  function* gen() {\n    yield 1;\n    return 'done';\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 'done', done: true });\n  expect(g.next()).toEqual({ value: undefined, done: true });\n};",
  ],
  [
    'sync generators > generator with try-catch and no throw',
    '() => {\n  function* foobar() {\n    try {\n      yield 1;\n    } catch {\n      return false;\n    }\n  }\n  const gen = foobar();\n  expect(gen.next().value).toBe(1);\n  expect(gen.next().value).toBeUndefined();\n}',
    '() => {\n  function* foobar() {\n    try {\n      yield 1;\n    } catch {\n      return false;\n    }\n  }\n  const gen = foobar();\n  expect(gen.next().value).toBe(1);\n  expect(gen.next().value).toBeUndefined();\n};',
  ],
  [
    'sync generators > generator with try-finally and early return',
    '() => {\n  function* gen() {\n    try {\n      return;\n    } finally {\n      // noop\n    }\n  }\n  expect(gen().next()).toEqual({ done: true, value: undefined });\n}',
    '() => {\n  function* gen() {\n    try {\n      return;\n    } finally {\n      // noop\n    }\n  }\n  expect(gen().next()).toEqual({ done: true, value: undefined });\n};',
  ],
  [
    'sync generators > generator with switch-default-break',
    "() => {\n  function* gen(type) {\n    switch (type) {\n      default:\n        break;\n    }\n  }\n  expect(gen(1).next().done).toBe(true);\n\n  function* gen2(type) {\n    switch (type) {\n      case 0:\n        throw 'unreachable';\n      default:\n        break;\n    }\n  }\n  expect(gen2(1).next().done).toBe(true);\n}",
    "() => {\n  function* gen(type) {\n    switch (type) {\n      default:\n        break;\n    }\n  }\n  expect(gen(1).next().done).toBe(true);\n\n  function* gen2(type) {\n    switch (type) {\n      case 0:\n        throw 'unreachable';\n      default:\n        break;\n    }\n  }\n  expect(gen2(1).next().done).toBe(true);\n};",
  ],
  [
    'sync generators > generator with default parameters',
    "() => {\n  function* foo(bar = 'bar') {\n    return bar;\n  }\n  expect(foo().next().value).toBe('bar');\n  expect(foo('foo').next().value).toBe('foo');\n}",
    "() => {\n  function* foo(bar = 'bar') {\n    return bar;\n  }\n  expect(foo().next().value).toBe('bar');\n  expect(foo('foo').next().value).toBe('foo');\n};",
  ],
  [
    'sync generators > generator with destructured parameters',
    "() => {\n  function* foo({ bar }) {\n    return bar;\n  }\n  expect(foo({ bar: 'bar' }).next().value).toBe('bar');\n}",
    "() => {\n  function* foo({ bar }) {\n    return bar;\n  }\n  expect(foo({ bar: 'bar' }).next().value).toBe('bar');\n};",
  ],
  [
    'sync generators > generator with rest parameters',
    '() => {\n  function* foo(...items) {\n    return items;\n  }\n  expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);\n}',
    '() => {\n  function* foo(...items) {\n    return items;\n  }\n  expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);\n};',
  ],
  [
    'sync generators > generator with throw()',
    "() => {\n  function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } catch (e) {\n      yield 'caught: ' + e.message;\n    }\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.throw(new Error('test'))).toEqual({ value: 'caught: test', done: false });\n}",
    "() => {\n  function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } catch (e) {\n      yield 'caught: ' + e.message;\n    }\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.throw(new Error('test'))).toEqual({ value: 'caught: test', done: false });\n};",
  ],
  [
    'sync generators > generator with return()',
    "() => {\n  function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } finally {\n      yield 'cleanup';\n    }\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.return('early')).toEqual({ value: 'cleanup', done: false });\n  expect(g.next()).toEqual({ value: 'early', done: true });\n}",
    "() => {\n  function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } finally {\n      yield 'cleanup';\n    }\n  }\n  const g = gen();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.return('early')).toEqual({ value: 'cleanup', done: false });\n  expect(g.next()).toEqual({ value: 'early', done: true });\n};",
  ],
  [
    'sync generators > yield* delegation to another generator',
    "() => {\n  function* inner() {\n    yield 'a';\n    yield 'b';\n  }\n  function* outer() {\n    yield 1;\n    yield* inner();\n    yield 2;\n  }\n  expect([...outer()]).toEqual([1, 'a', 'b', 2]);\n}",
    "() => {\n  function* inner() {\n    yield 'a';\n    yield 'b';\n  }\n  function* outer() {\n    yield 1;\n    yield* inner();\n    yield 2;\n  }\n  expect([...outer()]).toEqual([1, 'a', 'b', 2]);\n};",
  ],
  [
    'sync generators > yield* delegation to array',
    '() => {\n  function* gen() {\n    yield* [10, 20, 30];\n  }\n  expect([...gen()]).toEqual([10, 20, 30]);\n}',
    '() => {\n  function* gen() {\n    yield* [10, 20, 30];\n  }\n  expect([...gen()]).toEqual([10, 20, 30]);\n};',
  ],
  [
    'sync generators > yield* with iterable that has no return method',
    '() => {\n  function* inner() {\n    yield 1;\n    yield 2;\n  }\n  function* outer() {\n    const result = yield* inner();\n    yield result;\n  }\n  const g = outer();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 2, done: false });\n  expect(g.next()).toEqual({ value: undefined, done: false });\n}',
    '() => {\n  function* inner() {\n    yield 1;\n    yield 2;\n  }\n  function* outer() {\n    const result = yield* inner();\n    yield result;\n  }\n  const g = outer();\n  expect(g.next()).toEqual({ value: 1, done: false });\n  expect(g.next()).toEqual({ value: 2, done: false });\n  expect(g.next()).toEqual({ value: undefined, done: false });\n};',
  ],
  [
    'sync generators > generator used in spread',
    '() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  expect([...gen()]).toEqual([1, 2, 3]);\n}',
    '() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  expect([...gen()]).toEqual([1, 2, 3]);\n};',
  ],
  [
    'sync generators > generator used in destructuring',
    "() => {\n  function* gen() {\n    yield 'a';\n    yield 'b';\n    yield 'c';\n  }\n  const [x, y, z] = gen();\n  expect(x).toBe('a');\n  expect(y).toBe('b');\n  expect(z).toBe('c');\n}",
    "() => {\n  function* gen() {\n    yield 'a';\n    yield 'b';\n    yield 'c';\n  }\n  const [x, y, z] = gen();\n  expect(x).toBe('a');\n  expect(y).toBe('b');\n  expect(z).toBe('c');\n};",
  ],
  [
    'sync generators > generator with complex control flow',
    '() => {\n  function* gen(n) {\n    for (let i = 0; i < n; i++) {\n      if (i % 2 === 0) {\n        yield i;\n      }\n    }\n  }\n  expect([...gen(6)]).toEqual([0, 2, 4]);\n}',
    '() => {\n  function* gen(n) {\n    for (let i = 0; i < n; i++) {\n      if (i % 2 === 0) {\n        yield i;\n      }\n    }\n  }\n  expect([...gen(6)]).toEqual([0, 2, 4]);\n};',
  ],
  [
    'sync generators > nested generators with yield*',
    '() => {\n  function* a() {\n    yield 1;\n  }\n  function* b() {\n    yield* a();\n    yield 2;\n  }\n  function* c() {\n    yield* b();\n    yield 3;\n  }\n  expect([...c()]).toEqual([1, 2, 3]);\n}',
    '() => {\n  function* a() {\n    yield 1;\n  }\n  function* b() {\n    yield* a();\n    yield 2;\n  }\n  function* c() {\n    yield* b();\n    yield 3;\n  }\n  expect([...c()]).toEqual([1, 2, 3]);\n};',
  ],
  [
    'sync generators > generator passing values via next()',
    "() => {\n  function* gen() {\n    const a = yield 'first';\n    const b = yield 'second';\n    return a + b;\n  }\n  const g = gen();\n  expect(g.next().value).toBe('first');\n  expect(g.next(10).value).toBe('second');\n  expect(g.next(32).value).toBe(42);\n}",
    "() => {\n  function* gen() {\n    const a = yield 'first';\n    const b = yield 'second';\n    return a + b;\n  }\n  const g = gen();\n  expect(g.next().value).toBe('first');\n  expect(g.next(10).value).toBe('second');\n  expect(g.next(32).value).toBe(42);\n};",
  ],
  [
    'sync generators > infinite generator with break',
    '() => {\n  function* counter() {\n    let i = 0;\n    while (true) {\n      yield i++;\n    }\n  }\n  const results = [];\n  for (const n of counter()) {\n    results.push(n);\n    if (n >= 4) break;\n  }\n  expect(results).toEqual([0, 1, 2, 3, 4]);\n}',
    '() => {\n  function* counter() {\n    let i = 0;\n    while (true) {\n      yield i++;\n    }\n  }\n  const results = [];\n  for (const n of counter()) {\n    results.push(n);\n    if (n >= 4) break;\n  }\n  expect(results).toEqual([0, 1, 2, 3, 4]);\n};',
  ],
  [
    'for-of iteration > for-of with array',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n}',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n};',
  ],
  [
    'for-of iteration > for-of with array and break',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) {\n    if (x === 2) break;\n    res.push(x);\n  }\n  expect(res).toEqual([1]);\n}',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) {\n    if (x === 2) break;\n    res.push(x);\n  }\n  expect(res).toEqual([1]);\n};',
  ],
  [
    'for-of iteration > for-of with array and continue',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) {\n    if (x === 2) continue;\n    res.push(x);\n  }\n  expect(res).toEqual([1, 3]);\n}',
    '() => {\n  var arr = [1, 2, 3];\n  var res = [];\n  for (const x of arr) {\n    if (x === 2) continue;\n    res.push(x);\n  }\n  expect(res).toEqual([1, 3]);\n};',
  ],
  [
    'for-of iteration > for-of with generator',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n}',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n};',
  ],
  [
    'for-of iteration > for-of with generator and break',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) {\n    if (x === 2) break;\n    res.push(x);\n  }\n  expect(res).toEqual([1]);\n}',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) {\n    if (x === 2) break;\n    res.push(x);\n  }\n  expect(res).toEqual([1]);\n};',
  ],
  [
    'for-of iteration > for-of with generator and continue',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) {\n    if (x === 2) continue;\n    res.push(x);\n  }\n  expect(res).toEqual([1, 3]);\n}',
    '() => {\n  function* f() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  var res = [];\n  for (const x of f()) {\n    if (x === 2) continue;\n    res.push(x);\n  }\n  expect(res).toEqual([1, 3]);\n};',
  ],
  [
    'for-of iteration > for-of with string',
    "() => {\n  var res = [];\n  for (const ch of 'abc') res.push(ch);\n  expect(res).toEqual(['a', 'b', 'c']);\n}",
    "() => {\n  var res = [];\n  for (const ch of 'abc') res.push(ch);\n  expect(res).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'for-of iteration > for-of with Set',
    '() => {\n  var res = [];\n  for (const x of new Set([1, 2, 3])) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n}',
    '() => {\n  var res = [];\n  for (const x of new Set([1, 2, 3])) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n};',
  ],
  [
    'for-of iteration > for-of with Map',
    "() => {\n  var res = [];\n  for (const [k, v] of new Map([\n    ['a', 1],\n    ['b', 2],\n  ])) {\n    res.push(k + ':' + v);\n  }\n  expect(res).toEqual(['a:1', 'b:2']);\n}",
    "() => {\n  var res = [];\n  for (const [k, v] of new Map([\n    ['a', 1],\n    ['b', 2],\n  ])) {\n    res.push(k + ':' + v);\n  }\n  expect(res).toEqual(['a:1', 'b:2']);\n};",
  ],
  [
    'for-of iteration > for-of with custom iterable',
    '() => {\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          if (i < 3) return { value: i++, done: false };\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  var res = [];\n  for (const x of iterable) res.push(x);\n  expect(res).toEqual([0, 1, 2]);\n}',
    '() => {\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          if (i < 3) return { value: i++, done: false };\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  var res = [];\n  for (const x of iterable) res.push(x);\n  expect(res).toEqual([0, 1, 2]);\n};',
  ],
  [
    'for-of iteration > for-of calls return() on iterator when break occurs',
    '() => {\n  let returnCalled = false;\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return { value: i++, done: false };\n        },\n        return() {\n          returnCalled = true;\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  for (const x of iterable) {\n    if (x === 2) break;\n  }\n  expect(returnCalled).toBe(true);\n}',
    '() => {\n  let returnCalled = false;\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return { value: i++, done: false };\n        },\n        return() {\n          returnCalled = true;\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  for (const x of iterable) {\n    if (x === 2) break;\n  }\n  expect(returnCalled).toBe(true);\n};',
  ],
  [
    'for-of iteration > for-of calls return() on iterator when exception is thrown',
    "() => {\n  let returnCalled = false;\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return { value: i++, done: false };\n        },\n        return() {\n          returnCalled = true;\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  try {\n    for (const x of iterable) {\n      if (x === 1) throw new Error('bail');\n    }\n  } catch (e) {}\n  expect(returnCalled).toBe(true);\n}",
    "() => {\n  let returnCalled = false;\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return { value: i++, done: false };\n        },\n        return() {\n          returnCalled = true;\n          return { value: undefined, done: true };\n        },\n      };\n    },\n  };\n  try {\n    for (const x of iterable) {\n      if (x === 1) throw new Error('bail');\n    }\n  } catch (e) {}\n  expect(returnCalled).toBe(true);\n};",
  ],
  [
    'for-of iteration > for-of with let creates per-iteration binding',
    '() => {\n  const funcs = [];\n  for (let x of [0, 1, 2]) {\n    funcs.push(() => x);\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n}',
    '() => {\n  const funcs = [];\n  for (let x of [0, 1, 2]) {\n    funcs.push(() => x);\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n};',
  ],
  [
    'for-of iteration > for-of with destructuring',
    "() => {\n  const pairs = [\n    [1, 'a'],\n    [2, 'b'],\n    [3, 'c'],\n  ];\n  var nums = [];\n  var strs = [];\n  for (const [n, s] of pairs) {\n    nums.push(n);\n    strs.push(s);\n  }\n  expect(nums).toEqual([1, 2, 3]);\n  expect(strs).toEqual(['a', 'b', 'c']);\n}",
    "() => {\n  const pairs = [\n    [1, 'a'],\n    [2, 'b'],\n    [3, 'c'],\n  ];\n  var nums = [];\n  var strs = [];\n  for (const [n, s] of pairs) {\n    nums.push(n);\n    strs.push(s);\n  }\n  expect(nums).toEqual([1, 2, 3]);\n  expect(strs).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'for-of iteration > for-of with arguments object',
    '() => {\n  function getArgs() {\n    return arguments;\n  }\n  var args = getArgs(1, 2, 3);\n  var res = [];\n  for (const x of args) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n}',
    '() => {\n  function getArgs() {\n    return arguments;\n  }\n  var args = getArgs(1, 2, 3);\n  var res = [];\n  for (const x of args) res.push(x);\n  expect(res).toEqual([1, 2, 3]);\n};',
  ],
  [
    'async generators > basic async generator yields resolved values',
    "async () => {\n  async function* gen() {\n    yield await Promise.resolve('foo');\n    yield await Promise.resolve('bar');\n    yield await Promise.resolve('baz');\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({ value: 'foo', done: false });\n  expect(await g.next()).toEqual({ value: 'bar', done: false });\n  expect(await g.next()).toEqual({ value: 'baz', done: false });\n  expect(await g.next()).toEqual({ value: undefined, done: true });\n}",
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield yield _awaitAsyncGenerator(Promise.resolve('foo'));\n      yield yield _awaitAsyncGenerator(Promise.resolve('bar'));\n      yield yield _awaitAsyncGenerator(Promise.resolve('baz'));\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({\n    value: 'foo',\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 'bar',\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 'baz',\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: undefined,\n    done: true,\n  });\n};",
  ],
  [
    'async generators > async generator execution order with delays',
    "async () => {\n  const log = [];\n  async function* gen() {\n    log.push('a');\n    yield Promise.resolve();\n    log.push('b');\n    yield Promise.resolve();\n    log.push('c');\n  }\n  const g = gen();\n  await g.next();\n  await g.next();\n  await g.next();\n  expect(log).toEqual(['a', 'b', 'c']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  const log = [];\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      log.push('a');\n      yield Promise.resolve();\n      log.push('b');\n      yield Promise.resolve();\n      log.push('c');\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  await g.next();\n  await g.next();\n  await g.next();\n  expect(log).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'async generators > async generator with return value',
    "async () => {\n  async function* gen() {\n    yield 1;\n    yield 2;\n    return 'done';\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({ value: 1, done: false });\n  expect(await g.next()).toEqual({ value: 2, done: false });\n  expect(await g.next()).toEqual({ value: 'done', done: true });\n  expect(await g.next()).toEqual({ value: undefined, done: true });\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield 1;\n      yield 2;\n      return 'done';\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({\n    value: 1,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 2,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 'done',\n    done: true,\n  });\n  expect(await g.next()).toEqual({\n    value: undefined,\n    done: true,\n  });\n};",
  ],
  [
    'async generators > async generator with throw()',
    "async () => {\n  async function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } catch (e) {\n      yield 'caught: ' + e.message;\n    }\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({ value: 1, done: false });\n  const result = await g.throw(new Error('test'));\n  expect(result).toEqual({ value: 'caught: test', done: false });\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      try {\n        yield 1;\n        yield 2;\n      } catch (e) {\n        yield 'caught: ' + e.message;\n      }\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  expect(await g.next()).toEqual({\n    value: 1,\n    done: false,\n  });\n  const result = await g.throw(new Error('test'));\n  expect(result).toEqual({\n    value: 'caught: test',\n    done: false,\n  });\n};",
  ],
  [
    'async generators > async generator with return() for cleanup',
    "async () => {\n  const log = [];\n  async function* gen() {\n    try {\n      log.push('start');\n      yield 1;\n      log.push('after yield 1');\n      yield 2;\n    } finally {\n      log.push('cleanup');\n    }\n  }\n  const g = gen();\n  await g.next();\n  await g.return();\n  expect(log).toEqual(['start', 'cleanup']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  const log = [];\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      try {\n        log.push('start');\n        yield 1;\n        log.push('after yield 1');\n        yield 2;\n      } finally {\n        log.push('cleanup');\n      }\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  await g.next();\n  await g.return();\n  expect(log).toEqual(['start', 'cleanup']);\n};",
  ],
  [
    'async generators > async generator passing values via next()',
    "async () => {\n  async function* gen() {\n    const a = yield 'first';\n    const b = yield 'second';\n    return a + b;\n  }\n  const g = gen();\n  expect((await g.next()).value).toBe('first');\n  expect((await g.next(10)).value).toBe('second');\n  expect((await g.next(32)).value).toBe(42);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      const a = yield 'first';\n      const b = yield 'second';\n      return a + b;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  expect((await g.next()).value).toBe('first');\n  expect((await g.next(10)).value).toBe('second');\n  expect((await g.next(32)).value).toBe(42);\n};",
  ],
  [
    'async generators > async generator with try-finally',
    "async () => {\n  const log = [];\n  async function* gen() {\n    try {\n      yield 1;\n      yield 2;\n    } finally {\n      log.push('finally');\n    }\n  }\n  const g = gen();\n  await g.next();\n  await g.next();\n  await g.next();\n  expect(log).toEqual(['finally']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  const log = [];\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      try {\n        yield 1;\n        yield 2;\n      } finally {\n        log.push('finally');\n      }\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  await g.next();\n  await g.next();\n  await g.next();\n  expect(log).toEqual(['finally']);\n};",
  ],
  [
    'async generators > async generator with nested await',
    'async () => {\n  async function fetchVal(x) {\n    return Promise.resolve(x * 2);\n  }\n  async function* gen() {\n    yield await fetchVal(1);\n    yield await fetchVal(2);\n    yield await fetchVal(3);\n  }\n  const results = [];\n  const g = gen();\n  let r = await g.next();\n  while (!r.done) {\n    results.push(r.value);\n    r = await g.next();\n  }\n  expect(results).toEqual([2, 4, 6]);\n}',
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  async function fetchVal(x) {\n    return Promise.resolve(x * 2);\n  }\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield yield _awaitAsyncGenerator(fetchVal(1));\n      yield yield _awaitAsyncGenerator(fetchVal(2));\n      yield yield _awaitAsyncGenerator(fetchVal(3));\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  const g = gen();\n  let r = await g.next();\n  while (!r.done) {\n    results.push(r.value);\n    r = await g.next();\n  }\n  expect(results).toEqual([2, 4, 6]);\n};",
  ],
  [
    'async generators > async generator expression',
    'async () => {\n  const gen = async function* () {\n    yield 1;\n    yield 2;\n  };\n  const g = gen();\n  expect(await g.next()).toEqual({ value: 1, done: false });\n  expect(await g.next()).toEqual({ value: 2, done: false });\n  expect(await g.next()).toEqual({ value: undefined, done: true });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  const gen = _wrapAsyncGenerator(function* () {\n    yield 1;\n    yield 2;\n  });\n  const g = gen();\n  expect(await g.next()).toEqual({\n    value: 1,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 2,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: undefined,\n    done: true,\n  });\n};",
  ],
  [
    'async generators > async generator as class method',
    "async () => {\n  class Foo {\n    async *items() {\n      yield 'a';\n      yield 'b';\n    }\n  }\n  const results = [];\n  for await (const val of new Foo().items()) {\n    results.push(val);\n  }\n  expect(results).toEqual(['a', 'b']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  class Foo {\n    items() {\n      return _wrapAsyncGenerator(function* () {\n        yield 'a';\n        yield 'b';\n      })();\n    }\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(new Foo().items()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual(['a', 'b']);\n};",
  ],
  [
    'for-await-of > for-await-of with async generator (cumulative sum)',
    'async () => {\n  async function* genAnswers() {\n    var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];\n    var total = 0;\n    for await (let val of stream) {\n      total += await val;\n      yield total;\n    }\n  }\n  const results = [];\n  for await (const val of genAnswers()) {\n    results.push(val);\n  }\n  expect(results).toEqual([4, 13, 25]);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function genAnswers() {\n    return _genAnswers.apply(this, arguments);\n  }\n  function _genAnswers() {\n    _genAnswers = _wrapAsyncGenerator(function* () {\n      var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];\n      var total = 0;\n      var _iteratorAbruptCompletion = false;\n      var _didIteratorError = false;\n      var _iteratorError;\n      try {\n        for (\n          var _iterator = _asyncIterator(stream), _step;\n          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))\n            .done);\n          _iteratorAbruptCompletion = false\n        ) {\n          let val = _step.value;\n          {\n            total += yield _awaitAsyncGenerator(val);\n            yield total;\n          }\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (_iteratorAbruptCompletion && _iterator.return != null) {\n            yield _awaitAsyncGenerator(_iterator.return());\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    });\n    return _genAnswers.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion2 = false;\n  var _didIteratorError2 = false;\n  var _iteratorError2;\n  try {\n    for (\n      var _iterator2 = _asyncIterator(genAnswers()), _step2;\n      (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);\n      _iteratorAbruptCompletion2 = false\n    ) {\n      const val = _step2.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError2 = true;\n    _iteratorError2 = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion2 && _iterator2.return != null) {\n        _iteratorResult(await _iterator2.return());\n      }\n    } finally {\n      if (_didIteratorError2) {\n        throw _iteratorError2;\n      }\n    }\n  }\n  expect(results).toEqual([4, 13, 25]);\n};",
  ],
  [
    'for-await-of > for-await-of with array of promises',
    'async () => {\n  const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];\n  const results = [];\n  for await (const val of promises) {\n    results.push(val);\n  }\n  expect(results).toEqual([1, 2, 3]);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(promises), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([1, 2, 3]);\n};",
  ],
  [
    'for-await-of > for-await-of with custom async iterable',
    'async () => {\n  const iterable = {\n    [Symbol.asyncIterator]() {\n      let i = 0;\n      return {\n        next() {\n          if (i < 3) return Promise.resolve({ value: i++, done: false });\n          return Promise.resolve({ value: undefined, done: true });\n        },\n      };\n    },\n  };\n  const results = [];\n  for await (const val of iterable) {\n    results.push(val);\n  }\n  expect(results).toEqual([0, 1, 2]);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  const iterable = {\n    [Symbol.asyncIterator]() {\n      let i = 0;\n      return {\n        next() {\n          if (i < 3)\n            return Promise.resolve({\n              value: i++,\n              done: false,\n            });\n          return Promise.resolve({\n            value: undefined,\n            done: true,\n          });\n        },\n      };\n    },\n  };\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(iterable), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([0, 1, 2]);\n};",
  ],
  [
    'for-await-of > for-await-of with break',
    'async () => {\n  async function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n    yield 4;\n    yield 5;\n  }\n  const results = [];\n  for await (const val of gen()) {\n    results.push(val);\n    if (val === 3) break;\n  }\n  expect(results).toEqual([1, 2, 3]);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield 1;\n      yield 2;\n      yield 3;\n      yield 4;\n      yield 5;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(gen()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n        if (val === 3) break;\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([1, 2, 3]);\n};",
  ],
  [
    'for-await-of > for-await-of with error in iterable',
    "async () => {\n  async function* gen() {\n    yield 1;\n    throw new Error('gen error');\n  }\n  const results = [];\n  try {\n    for await (const val of gen()) {\n      results.push(val);\n    }\n  } catch (e) {\n    results.push('error: ' + e.message);\n  }\n  expect(results).toEqual([1, 'error: gen error']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield 1;\n      throw new Error('gen error');\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  try {\n    var _iteratorAbruptCompletion = false;\n    var _didIteratorError = false;\n    var _iteratorError;\n    try {\n      for (\n        var _iterator = _asyncIterator(gen()), _step;\n        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n        _iteratorAbruptCompletion = false\n      ) {\n        const val = _step.value;\n        {\n          results.push(val);\n        }\n      }\n    } catch (err) {\n      _didIteratorError = true;\n      _iteratorError = err;\n    } finally {\n      try {\n        if (_iteratorAbruptCompletion && _iterator.return != null) {\n          _iteratorResult(await _iterator.return());\n        }\n      } finally {\n        if (_didIteratorError) {\n          throw _iteratorError;\n        }\n      }\n    }\n  } catch (e) {\n    results.push('error: ' + e.message);\n  }\n  expect(results).toEqual([1, 'error: gen error']);\n};",
  ],
  [
    'for-await-of > for-await-of does not access value when done',
    'async () => {\n  let gotValue = false;\n  const iterable = {\n    [Symbol.asyncIterator]() {\n      return {\n        next: () =>\n          Promise.resolve({\n            get value() {\n              gotValue = true;\n            },\n            done: true,\n          }),\n      };\n    },\n  };\n  for await (let value of iterable) {\n  }\n  expect(gotValue).toBe(false);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  let gotValue = false;\n  const iterable = {\n    [Symbol.asyncIterator]() {\n      return {\n        next: () =>\n          Promise.resolve({\n            get value() {\n              gotValue = true;\n            },\n            done: true,\n          }),\n      };\n    },\n  };\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(iterable), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      let value = _step.value;\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(gotValue).toBe(false);\n};",
  ],
  [
    'for-await-of > for-await-of with member expression as LHS',
    'async () => {\n  let obj = {};\n  for await (obj.x of [1, 2]) {\n  }\n  expect(obj.x).toBe(2);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  let obj = {};\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator([1, 2]), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      obj.x = _step.value;\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(obj.x).toBe(2);\n};",
  ],
  [
    'for-await-of > for-await-of allows re-declaration of let in body',
    'async () => {\n  // Should not throw a SyntaxError\n  for await (let x of []) {\n    let x;\n  }\n  expect(true).toBe(true);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  // Should not throw a SyntaxError\n  try {\n    for (\n      var _iterator = _asyncIterator([]), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      let x = _step.value;\n      {\n        let x;\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(true).toBe(true);\n};",
  ],
  [
    'for-await-of > for-await-of with destructuring',
    'async () => {\n  async function* gen() {\n    yield { a: 1, b: 2 };\n    yield { a: 3, b: 4 };\n  }\n  const results = [];\n  for await (const { a, b } of gen()) {\n    results.push(a + b);\n  }\n  expect(results).toEqual([3, 7]);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield {\n        a: 1,\n        b: 2,\n      };\n      yield {\n        a: 3,\n        b: 4,\n      };\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(gen()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const { a, b } = _step.value;\n      {\n        results.push(a + b);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([3, 7]);\n};",
  ],
  [
    'for-await-of > for-await-of with sync iterable (fallback)',
    'async () => {\n  // for-await-of should work with sync iterables too\n  const results = [];\n  for await (const val of [10, 20, 30]) {\n    results.push(val);\n  }\n  expect(results).toEqual([10, 20, 30]);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  // for-await-of should work with sync iterables too\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator([10, 20, 30]), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([10, 20, 30]);\n};",
  ],
  [
    'async generator yield* delegation > yield* delegation with early return()',
    "async () => {\n  const log = [];\n  async function* inner() {\n    log.push(1);\n    yield 'a';\n    log.push(2);\n    yield 'b';\n    log.push(3);\n  }\n  async function* outer() {\n    log.push(4);\n    yield* inner();\n    log.push(5);\n  }\n  const iter = outer();\n  const res = await iter.next();\n  expect(res).toEqual({ value: 'a', done: false });\n  expect(log).toEqual([4, 1]);\n\n  await iter.return();\n  expect(log).toEqual([4, 1]);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nasync () => {\n  const log = [];\n  function inner() {\n    return _inner.apply(this, arguments);\n  }\n  function _inner() {\n    _inner = _wrapAsyncGenerator(function* () {\n      log.push(1);\n      yield 'a';\n      log.push(2);\n      yield 'b';\n      log.push(3);\n    });\n    return _inner.apply(this, arguments);\n  }\n  function outer() {\n    return _outer.apply(this, arguments);\n  }\n  function _outer() {\n    _outer = _wrapAsyncGenerator(function* () {\n      log.push(4);\n      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));\n      log.push(5);\n    });\n    return _outer.apply(this, arguments);\n  }\n  const iter = outer();\n  const res = await iter.next();\n  expect(res).toEqual({\n    value: 'a',\n    done: false,\n  });\n  expect(log).toEqual([4, 1]);\n  await iter.return();\n  expect(log).toEqual([4, 1]);\n};",
  ],
  [
    'async generator yield* delegation > yield* delegation with throw() caught by inner',
    "async () => {\n  const log = [];\n  async function* inner() {\n    try {\n      log.push(1);\n      yield 'a';\n      log.push(2);\n    } catch (e) {\n      log.push(3);\n      yield 'caught';\n      log.push(4);\n    }\n  }\n  async function* outer() {\n    log.push(5);\n    yield* inner();\n    log.push(6);\n  }\n  const iter = outer();\n  await iter.next();\n  expect(log).toEqual([5, 1]);\n\n  const res = await iter.throw(new Error('TEST'));\n  expect(res).toEqual({ value: 'caught', done: false });\n  expect(log).toEqual([5, 1, 3]);\n\n  await iter.next();\n  expect(log).toEqual([5, 1, 3, 4, 6]);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nasync () => {\n  const log = [];\n  function inner() {\n    return _inner.apply(this, arguments);\n  }\n  function _inner() {\n    _inner = _wrapAsyncGenerator(function* () {\n      try {\n        log.push(1);\n        yield 'a';\n        log.push(2);\n      } catch (e) {\n        log.push(3);\n        yield 'caught';\n        log.push(4);\n      }\n    });\n    return _inner.apply(this, arguments);\n  }\n  function outer() {\n    return _outer.apply(this, arguments);\n  }\n  function _outer() {\n    _outer = _wrapAsyncGenerator(function* () {\n      log.push(5);\n      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));\n      log.push(6);\n    });\n    return _outer.apply(this, arguments);\n  }\n  const iter = outer();\n  await iter.next();\n  expect(log).toEqual([5, 1]);\n  const res = await iter.throw(new Error('TEST'));\n  expect(res).toEqual({\n    value: 'caught',\n    done: false,\n  });\n  expect(log).toEqual([5, 1, 3]);\n  await iter.next();\n  expect(log).toEqual([5, 1, 3, 4, 6]);\n};",
  ],
  [
    'async generator yield* delegation > yield* from sync iterable in async generator',
    "async () => {\n  async function* fn() {\n    yield* [Promise.resolve('ok')];\n  }\n  const result = await fn().next();\n  expect(result.done).toBe(false);\n  // CreateAsyncFromSyncIterator awaits the yielded promise,\n  // so the value is the resolved string, not the Promise itself.\n  expect(result.value).toBe('ok');\n}",
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function fn() {\n    return _fn.apply(this, arguments);\n  }\n  function _fn() {\n    _fn = _wrapAsyncGenerator(function* () {\n      yield* _asyncGeneratorDelegate(_asyncIterator([Promise.resolve('ok')]));\n    });\n    return _fn.apply(this, arguments);\n  }\n  const result = await fn().next();\n  expect(result.done).toBe(false);\n  // CreateAsyncFromSyncIterator awaits the yielded promise,\n  // so the value is the resolved string, not the Promise itself.\n  expect(result.value).toBe('ok');\n};",
  ],
  [
    'async generator yield* delegation > yield* early return does not execute rest of inner',
    "async () => {\n  const log = [];\n  async function* func1() {\n    log.push(1);\n    yield 'a';\n    log.push(2);\n  }\n  async function* func2() {\n    yield* func1();\n    log.push(3);\n  }\n  const iter = func2();\n  await iter.next();\n  await iter.return();\n  expect(log).toEqual([1]);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nasync () => {\n  const log = [];\n  function func1() {\n    return _func.apply(this, arguments);\n  }\n  function _func() {\n    _func = _wrapAsyncGenerator(function* () {\n      log.push(1);\n      yield 'a';\n      log.push(2);\n    });\n    return _func.apply(this, arguments);\n  }\n  function func2() {\n    return _func2.apply(this, arguments);\n  }\n  function _func2() {\n    _func2 = _wrapAsyncGenerator(function* () {\n      yield* _asyncGeneratorDelegate(_asyncIterator(func1()));\n      log.push(3);\n    });\n    return _func2.apply(this, arguments);\n  }\n  const iter = func2();\n  await iter.next();\n  await iter.return();\n  expect(log).toEqual([1]);\n};",
  ],
  [
    'async generator yield* delegation > yield* delegation with async inner values',
    'async () => {\n  async function* inner() {\n    yield await Promise.resolve(10);\n    yield await Promise.resolve(20);\n  }\n  async function* outer() {\n    yield 1;\n    yield* inner();\n    yield 2;\n  }\n  const results = [];\n  for await (const val of outer()) {\n    results.push(val);\n  }\n  expect(results).toEqual([1, 10, 20, 2]);\n}',
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function inner() {\n    return _inner.apply(this, arguments);\n  }\n  function _inner() {\n    _inner = _wrapAsyncGenerator(function* () {\n      yield yield _awaitAsyncGenerator(Promise.resolve(10));\n      yield yield _awaitAsyncGenerator(Promise.resolve(20));\n    });\n    return _inner.apply(this, arguments);\n  }\n  function outer() {\n    return _outer.apply(this, arguments);\n  }\n  function _outer() {\n    _outer = _wrapAsyncGenerator(function* () {\n      yield 1;\n      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));\n      yield 2;\n    });\n    return _outer.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(outer()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([1, 10, 20, 2]);\n};",
  ],
  [
    'async generator yield* delegation > yield* nested three levels deep',
    "async () => {\n  async function* a() {\n    yield 'a';\n  }\n  async function* b() {\n    yield* a();\n    yield 'b';\n  }\n  async function* c() {\n    yield* b();\n    yield 'c';\n  }\n  const results = [];\n  for await (const val of c()) {\n    results.push(val);\n  }\n  expect(results).toEqual(['a', 'b', 'c']);\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function a() {\n    return _a.apply(this, arguments);\n  }\n  function _a() {\n    _a = _wrapAsyncGenerator(function* () {\n      yield 'a';\n    });\n    return _a.apply(this, arguments);\n  }\n  function b() {\n    return _b.apply(this, arguments);\n  }\n  function _b() {\n    _b = _wrapAsyncGenerator(function* () {\n      yield* _asyncGeneratorDelegate(_asyncIterator(a()));\n      yield 'b';\n    });\n    return _b.apply(this, arguments);\n  }\n  function c() {\n    return _c.apply(this, arguments);\n  }\n  function _c() {\n    _c = _wrapAsyncGenerator(function* () {\n      yield* _asyncGeneratorDelegate(_asyncIterator(b()));\n      yield 'c';\n    });\n    return _c.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(c()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'edge cases > generator with labeled loop and break',
    '() => {\n  function* gen() {\n    outer: for (let i = 0; i < 3; i++) {\n      for (let j = 0; j < 3; j++) {\n        if (j === 1) continue outer;\n        yield [i, j];\n      }\n    }\n  }\n  expect([...gen()]).toEqual([\n    [0, 0],\n    [1, 0],\n    [2, 0],\n  ]);\n}',
    '() => {\n  function* gen() {\n    outer: for (let i = 0; i < 3; i++) {\n      for (let j = 0; j < 3; j++) {\n        if (j === 1) continue outer;\n        yield [i, j];\n      }\n    }\n  }\n  expect([...gen()]).toEqual([\n    [0, 0],\n    [1, 0],\n    [2, 0],\n  ]);\n};',
  ],
  [
    'edge cases > async generator with for-of inside',
    'async () => {\n  async function* gen() {\n    for (const x of [1, 2, 3]) {\n      yield await Promise.resolve(x * 10);\n    }\n  }\n  const results = [];\n  for await (const val of gen()) {\n    results.push(val);\n  }\n  expect(results).toEqual([10, 20, 30]);\n}',
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      for (const x of [1, 2, 3]) {\n        yield yield _awaitAsyncGenerator(Promise.resolve(x * 10));\n      }\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(gen()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([10, 20, 30]);\n};",
  ],
  [
    'edge cases > async generator with for-await-of inside',
    'async () => {\n  async function* gen() {\n    for await (const x of [Promise.resolve(1), Promise.resolve(2)]) {\n      yield x * 10;\n    }\n  }\n  const results = [];\n  for await (const val of gen()) {\n    results.push(val);\n  }\n  expect(results).toEqual([10, 20]);\n}',
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nvar _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      var _iteratorAbruptCompletion = false;\n      var _didIteratorError = false;\n      var _iteratorError;\n      try {\n        for (\n          var _iterator = _asyncIterator([Promise.resolve(1), Promise.resolve(2)]), _step;\n          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))\n            .done);\n          _iteratorAbruptCompletion = false\n        ) {\n          const x = _step.value;\n          {\n            yield x * 10;\n          }\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (_iteratorAbruptCompletion && _iterator.return != null) {\n            yield _awaitAsyncGenerator(_iterator.return());\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion2 = false;\n  var _didIteratorError2 = false;\n  var _iteratorError2;\n  try {\n    for (\n      var _iterator2 = _asyncIterator(gen()), _step2;\n      (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);\n      _iteratorAbruptCompletion2 = false\n    ) {\n      const val = _step2.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError2 = true;\n    _iteratorError2 = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion2 && _iterator2.return != null) {\n        _iteratorResult(await _iterator2.return());\n      }\n    } finally {\n      if (_didIteratorError2) {\n        throw _iteratorError2;\n      }\n    }\n  }\n  expect(results).toEqual([10, 20]);\n};",
  ],
  [
    'edge cases > for-of with empty iterable',
    '() => {\n  var count = 0;\n  for (const x of []) {\n    count++;\n  }\n  expect(count).toBe(0);\n}',
    '() => {\n  var count = 0;\n  for (const x of []) {\n    count++;\n  }\n  expect(count).toBe(0);\n};',
  ],
  [
    'edge cases > for-await-of with empty async iterable',
    'async () => {\n  async function* empty() {}\n  var count = 0;\n  for await (const x of empty()) {\n    count++;\n  }\n  expect(count).toBe(0);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function empty() {\n    return _empty.apply(this, arguments);\n  }\n  function _empty() {\n    _empty = _wrapAsyncGenerator(function* () {});\n    return _empty.apply(this, arguments);\n  }\n  var count = 0;\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(empty()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const x = _step.value;\n      {\n        count++;\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(count).toBe(0);\n};",
  ],
  [
    'edge cases > generator function length property',
    '() => {\n  function* gen(a, b, c) {}\n  expect(gen.length).toBe(3);\n}',
    '() => {\n  function* gen(a, b, c) {}\n  expect(gen.length).toBe(3);\n};',
  ],
  [
    'edge cases > generator is iterable (Symbol.iterator)',
    '() => {\n  function* gen() {\n    yield 1;\n  }\n  const g = gen();\n  expect(g[Symbol.iterator]() === g).toBe(true);\n}',
    '() => {\n  function* gen() {\n    yield 1;\n  }\n  const g = gen();\n  expect(g[Symbol.iterator]() === g).toBe(true);\n};',
  ],
  [
    'edge cases > async generator is async iterable (Symbol.asyncIterator)',
    '() => {\n  async function* gen() {\n    yield 1;\n  }\n  const g = gen();\n  expect(g[Symbol.asyncIterator]() === g).toBe(true);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\n() => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      yield 1;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen();\n  expect(g[Symbol.asyncIterator]() === g).toBe(true);\n};",
  ],
  [
    'edge cases > for-of with TypedArray',
    '() => {\n  var res = [];\n  for (const x of new Uint8Array([10, 20, 30])) {\n    res.push(x);\n  }\n  expect(res).toEqual([10, 20, 30]);\n}',
    '() => {\n  var res = [];\n  for (const x of new Uint8Array([10, 20, 30])) {\n    res.push(x);\n  }\n  expect(res).toEqual([10, 20, 30]);\n};',
  ],
  [
    'edge cases > async generator with Promise.all inside',
    'async () => {\n  async function* gen() {\n    const [a, b, c] = await Promise.all([\n      Promise.resolve(1),\n      Promise.resolve(2),\n      Promise.resolve(3),\n    ]);\n    yield a;\n    yield b;\n    yield c;\n  }\n  const results = [];\n  for await (const val of gen()) {\n    results.push(val);\n  }\n  expect(results).toEqual([1, 2, 3]);\n}',
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen() {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* () {\n      const [a, b, c] = yield _awaitAsyncGenerator(\n        Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]),\n      );\n      yield a;\n      yield b;\n      yield c;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const results = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(gen()), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const val = _step.value;\n      {\n        results.push(val);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(results).toEqual([1, 2, 3]);\n};",
  ],
  [
    'stack traces > error thrown inside sync generator includes function name',
    "() => {\n  function* failingGen() {\n    throw new Error('gen error');\n  }\n  const g = failingGen();\n  try {\n    g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failingGen') >= 0).toBe(true);\n  }\n}",
    "() => {\n  function* failingGen() {\n    throw new Error('gen error');\n  }\n  const g = failingGen();\n  try {\n    g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failingGen') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > generator throw() preserves caller stack',
    "() => {\n  function* myGen() {\n    try {\n      yield 1;\n    } catch (e) {\n      throw e;\n    }\n  }\n  const g = myGen();\n  g.next();\n  try {\n    g.throw(new Error('injected'));\n  } catch (e) {\n    expect(e.message).toBe('injected');\n  }\n}",
    "() => {\n  function* myGen() {\n    try {\n      yield 1;\n    } catch (e) {\n      throw e;\n    }\n  }\n  const g = myGen();\n  g.next();\n  try {\n    g.throw(new Error('injected'));\n  } catch (e) {\n    expect(e.message).toBe('injected');\n  }\n};",
  ],
  [
    'stack traces > error thrown inside async generator includes function name',
    "async () => {\n  async function* failingAsyncGen() {\n    throw new Error('async gen error');\n  }\n  const g = failingAsyncGen();\n  try {\n    await g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failingAsyncGen') >= 0).toBe(true);\n  }\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function failingAsyncGen() {\n    return _failingAsyncGen.apply(this, arguments);\n  }\n  function _failingAsyncGen() {\n    _failingAsyncGen = _wrapAsyncGenerator(function* () {\n      throw new Error('async gen error');\n    });\n    return _failingAsyncGen.apply(this, arguments);\n  }\n  const g = failingAsyncGen();\n  try {\n    await g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('failingAsyncGen') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > error after await inside async generator includes function name',
    "async () => {\n  async function* genAfterAwait() {\n    yield 'sentinel';\n    await Promise.resolve();\n    throw new Error('after await');\n  }\n  const g = genAfterAwait();\n  await g.next(); // yields 'sentinel'\n  try {\n    await g.next(); // resumes, awaits, then throws\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('genAfterAwait') >= 0).toBe(true);\n  }\n}",
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function genAfterAwait() {\n    return _genAfterAwait.apply(this, arguments);\n  }\n  function _genAfterAwait() {\n    _genAfterAwait = _wrapAsyncGenerator(function* () {\n      yield 'sentinel';\n      yield _awaitAsyncGenerator(Promise.resolve());\n      throw new Error('after await');\n    });\n    return _genAfterAwait.apply(this, arguments);\n  }\n  const g = genAfterAwait();\n  await g.next();\n  try {\n    await g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('genAfterAwait') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > error propagates through for-await-of with function name',
    "async () => {\n  async function* explodingGen() {\n    yield 1;\n    throw new Error('mid-iteration');\n  }\n  try {\n    for await (const _val of explodingGen()) {\n      // consume\n    }\n  } catch (e) {\n    expect(e.message).toBe('mid-iteration');\n    const stack = e.stack || '';\n    expect(stack.indexOf('explodingGen') >= 0).toBe(true);\n  }\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function explodingGen() {\n    return _explodingGen.apply(this, arguments);\n  }\n  function _explodingGen() {\n    _explodingGen = _wrapAsyncGenerator(function* () {\n      yield 1;\n      throw new Error('mid-iteration');\n    });\n    return _explodingGen.apply(this, arguments);\n  }\n  try {\n    var _iteratorAbruptCompletion = false;\n    var _didIteratorError = false;\n    var _iteratorError;\n    try {\n      for (\n        var _iterator = _asyncIterator(explodingGen()), _step;\n        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n        _iteratorAbruptCompletion = false\n      ) {\n        const _val = _step.value;\n      }\n    } catch (err) {\n      _didIteratorError = true;\n      _iteratorError = err;\n    } finally {\n      try {\n        if (_iteratorAbruptCompletion && _iterator.return != null) {\n          _iteratorResult(await _iterator.return());\n        }\n      } finally {\n        if (_didIteratorError) {\n          throw _iteratorError;\n        }\n      }\n    }\n  } catch (e) {\n    expect(e.message).toBe('mid-iteration');\n    const stack = e.stack || '';\n    expect(stack.indexOf('explodingGen') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > error in yield* delegation includes inner generator name',
    "() => {\n  function* inner() {\n    yield 1;\n    throw new Error('inner fail');\n  }\n  function* outer() {\n    yield* inner();\n  }\n  const g = outer();\n  g.next(); // yields 1\n  try {\n    g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('inner') >= 0).toBe(true);\n  }\n}",
    "() => {\n  function* inner() {\n    yield 1;\n    throw new Error('inner fail');\n  }\n  function* outer() {\n    yield* inner();\n  }\n  const g = outer();\n  g.next(); // yields 1\n  try {\n    g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('inner') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > async generator method name in stack',
    "async () => {\n  class DataStream {\n    async *fetchChunks() {\n      throw new Error('stream error');\n    }\n  }\n  const s = new DataStream();\n  const g = s.fetchChunks();\n  try {\n    await g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('fetchChunks') >= 0).toBe(true);\n  }\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  class DataStream {\n    fetchChunks() {\n      return _wrapAsyncGenerator(function* () {\n        throw new Error('stream error');\n      })();\n    }\n  }\n  const s = new DataStream();\n  const g = s.fetchChunks();\n  try {\n    await g.next();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('fetchChunks') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > nested async generators preserve inner name',
    "async () => {\n  async function* innerGen() {\n    await Promise.resolve();\n    throw new Error('inner async fail');\n  }\n  async function* outerGen() {\n    for await (const val of innerGen()) {\n      yield val;\n    }\n  }\n  try {\n    for await (const _val of outerGen()) {\n      // consume\n    }\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('innerGen') >= 0).toBe(true);\n  }\n}",
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function innerGen() {\n    return _innerGen.apply(this, arguments);\n  }\n  function _innerGen() {\n    _innerGen = _wrapAsyncGenerator(function* () {\n      yield _awaitAsyncGenerator(Promise.resolve());\n      throw new Error('inner async fail');\n    });\n    return _innerGen.apply(this, arguments);\n  }\n  function outerGen() {\n    return _outerGen.apply(this, arguments);\n  }\n  function _outerGen() {\n    _outerGen = _wrapAsyncGenerator(function* () {\n      var _iteratorAbruptCompletion = false;\n      var _didIteratorError = false;\n      var _iteratorError;\n      try {\n        for (\n          var _iterator = _asyncIterator(innerGen()), _step;\n          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))\n            .done);\n          _iteratorAbruptCompletion = false\n        ) {\n          const val = _step.value;\n          {\n            yield val;\n          }\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (_iteratorAbruptCompletion && _iterator.return != null) {\n            yield _awaitAsyncGenerator(_iterator.return());\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    });\n    return _outerGen.apply(this, arguments);\n  }\n  try {\n    var _iteratorAbruptCompletion2 = false;\n    var _didIteratorError2 = false;\n    var _iteratorError2;\n    try {\n      for (\n        var _iterator2 = _asyncIterator(outerGen()), _step2;\n        (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);\n        _iteratorAbruptCompletion2 = false\n      ) {\n        const _val = _step2.value;\n      }\n    } catch (err) {\n      _didIteratorError2 = true;\n      _iteratorError2 = err;\n    } finally {\n      try {\n        if (_iteratorAbruptCompletion2 && _iterator2.return != null) {\n          _iteratorResult(await _iterator2.return());\n        }\n      } finally {\n        if (_didIteratorError2) {\n          throw _iteratorError2;\n        }\n      }\n    }\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('innerGen') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > for-of error in loop body has correct stack',
    "() => {\n  function thrower() {\n    throw new Error('loop body error');\n  }\n  try {\n    for (const x of [1, 2, 3]) {\n      if (x === 2) thrower();\n    }\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('thrower') >= 0).toBe(true);\n  }\n}",
    "() => {\n  function thrower() {\n    throw new Error('loop body error');\n  }\n  try {\n    for (const x of [1, 2, 3]) {\n      if (x === 2) thrower();\n    }\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('thrower') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'stack traces > re-thrown error from async generator preserves original stack',
    "async () => {\n  async function* originalGen() {\n    throw new Error('original gen error');\n  }\n  async function consumer() {\n    try {\n      for await (const _val of originalGen()) {\n        // consume\n      }\n    } catch (e) {\n      throw e;\n    }\n  }\n  try {\n    await consumer();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('originalGen') >= 0).toBe(true);\n  }\n}",
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function originalGen() {\n    return _originalGen.apply(this, arguments);\n  }\n  function _originalGen() {\n    _originalGen = _wrapAsyncGenerator(function* () {\n      throw new Error('original gen error');\n    });\n    return _originalGen.apply(this, arguments);\n  }\n  async function consumer() {\n    try {\n      var _iteratorAbruptCompletion = false;\n      var _didIteratorError = false;\n      var _iteratorError;\n      try {\n        for (\n          var _iterator = _asyncIterator(originalGen()), _step;\n          (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n          _iteratorAbruptCompletion = false\n        ) {\n          const _val = _step.value;\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (_iteratorAbruptCompletion && _iterator.return != null) {\n            _iteratorResult(await _iterator.return());\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    } catch (e) {\n      throw e;\n    }\n  }\n  try {\n    await consumer();\n  } catch (e) {\n    const stack = e.stack || '';\n    expect(stack.indexOf('originalGen') >= 0).toBe(true);\n  }\n};",
  ],
  [
    'destructuring + state lifting (generators) > async generator with destructured object param yields binding',
    'async () => {\n  async function* gen({ b }) {\n    yield b;\n    yield b + 1;\n  }\n  const g = gen({ b: 41 });\n  expect(await g.next()).toEqual({ value: 41, done: false });\n  expect(await g.next()).toEqual({ value: 42, done: false });\n  expect((await g.next()).done).toBe(true);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen(_x) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* ({ b }) {\n      yield b;\n      yield b + 1;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen({ b: 41 });\n  expect(await g.next()).toEqual({\n    value: 41,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 42,\n    done: false,\n  });\n  expect((await g.next()).done).toBe(true);\n};",
  ],
  [
    'destructuring + state lifting (generators) > async generator with destructured array param',
    'async () => {\n  async function* gen([a, b]) {\n    yield a;\n    yield b;\n  }\n  const g = gen([1, 2]);\n  expect(await g.next()).toEqual({ value: 1, done: false });\n  expect(await g.next()).toEqual({ value: 2, done: false });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen(_x) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* ([a, b]) {\n      yield a;\n      yield b;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen([1, 2]);\n  expect(await g.next()).toEqual({\n    value: 1,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 2,\n    done: false,\n  });\n};",
  ],
  [
    'destructuring + state lifting (generators) > async generator with destructured param + internal await',
    'async () => {\n  async function* gen({ b }) {\n    const v = await Promise.resolve(b);\n    yield v;\n    return v + 1;\n  }\n  const g = gen({ b: 41 });\n  expect(await g.next()).toEqual({ value: 41, done: false });\n  expect(await g.next()).toEqual({ value: 42, done: true });\n}',
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');\nvar _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen(_x) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* ({ b }) {\n      const v = yield _awaitAsyncGenerator(Promise.resolve(b));\n      yield v;\n      return v + 1;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen({ b: 41 });\n  expect(await g.next()).toEqual({\n    value: 41,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 42,\n    done: true,\n  });\n};",
  ],
  [
    'destructuring + state lifting (generators) > async generator with destructured param iterates via for-await-of',
    'async () => {\n  async function* gen({ b }) {\n    yield b;\n    yield b + 1;\n  }\n  const collected = [];\n  for await (const v of gen({ b: 10 })) {\n    collected.push(v);\n  }\n  expect(collected).toEqual([10, 11]);\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nvar _asyncIterator = require('@babel/runtime/helpers/asyncIterator');\nfunction _iteratorResult(value) {\n  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');\n  return value;\n}\nasync () => {\n  function gen(_x) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* ({ b }) {\n      yield b;\n      yield b + 1;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const collected = [];\n  var _iteratorAbruptCompletion = false;\n  var _didIteratorError = false;\n  var _iteratorError;\n  try {\n    for (\n      var _iterator = _asyncIterator(gen({ b: 10 })), _step;\n      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);\n      _iteratorAbruptCompletion = false\n    ) {\n      const v = _step.value;\n      {\n        collected.push(v);\n      }\n    }\n  } catch (err) {\n    _didIteratorError = true;\n    _iteratorError = err;\n  } finally {\n    try {\n      if (_iteratorAbruptCompletion && _iterator.return != null) {\n        _iteratorResult(await _iterator.return());\n      }\n    } finally {\n      if (_didIteratorError) {\n        throw _iteratorError;\n      }\n    }\n  }\n  expect(collected).toEqual([10, 11]);\n};",
  ],
  [
    'destructuring + state lifting (generators) > class async generator method with destructured param',
    'async () => {\n  class C {\n    async *gen({ b }) {\n      yield b;\n      return b + 1;\n    }\n  }\n  const g = new C().gen({ b: 41 });\n  expect(await g.next()).toEqual({ value: 41, done: false });\n  expect(await g.next()).toEqual({ value: 42, done: true });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  class C {\n    gen({ b }) {\n      return _wrapAsyncGenerator(function* () {\n        yield b;\n        return b + 1;\n      })();\n    }\n  }\n  const g = new C().gen({ b: 41 });\n  expect(await g.next()).toEqual({\n    value: 41,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 42,\n    done: true,\n  });\n};",
  ],
  [
    'destructuring + state lifting (generators) > object shorthand async generator method with destructured param',
    'async () => {\n  const o = {\n    async *gen({ b }) {\n      yield b;\n      return b + 1;\n    },\n  };\n  const g = o.gen({ b: 41 });\n  expect(await g.next()).toEqual({ value: 41, done: false });\n  expect(await g.next()).toEqual({ value: 42, done: true });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  const o = {\n    gen({ b }) {\n      return _wrapAsyncGenerator(function* () {\n        yield b;\n        return b + 1;\n      })();\n    },\n  };\n  const g = o.gen({ b: 41 });\n  expect(await g.next()).toEqual({\n    value: 41,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 42,\n    done: true,\n  });\n};",
  ],
  [
    'destructuring + state lifting (generators) > sync generator with destructured object param yields binding',
    '() => {\n  function* gen({ b }) {\n    yield b;\n    return b + 1;\n  }\n  const g = gen({ b: 41 });\n  expect(g.next()).toEqual({ value: 41, done: false });\n  expect(g.next()).toEqual({ value: 42, done: true });\n}',
    '() => {\n  function* gen({ b }) {\n    yield b;\n    return b + 1;\n  }\n  const g = gen({ b: 41 });\n  expect(g.next()).toEqual({ value: 41, done: false });\n  expect(g.next()).toEqual({ value: 42, done: true });\n};',
  ],
  [
    'destructuring + state lifting (generators) > control: async generator with plain params',
    'async () => {\n  async function* gen(a, b) {\n    yield a;\n    yield b;\n  }\n  const g = gen(1, 2);\n  expect(await g.next()).toEqual({ value: 1, done: false });\n  expect(await g.next()).toEqual({ value: 2, done: false });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen(_x, _x2) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* (a, b) {\n      yield a;\n      yield b;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen(1, 2);\n  expect(await g.next()).toEqual({\n    value: 1,\n    done: false,\n  });\n  expect(await g.next()).toEqual({\n    value: 2,\n    done: false,\n  });\n};",
  ],
  [
    'destructuring + state lifting (generators) > control: async generator destructure in body (not in params)',
    'async () => {\n  async function* gen(x) {\n    const { b } = x;\n    yield b;\n  }\n  const g = gen({ b: 42 });\n  expect(await g.next()).toEqual({ value: 42, done: false });\n}',
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');\nasync () => {\n  function gen(_x) {\n    return _gen.apply(this, arguments);\n  }\n  function _gen() {\n    _gen = _wrapAsyncGenerator(function* (x) {\n      const { b } = x;\n      yield b;\n    });\n    return _gen.apply(this, arguments);\n  }\n  const g = gen({ b: 42 });\n  expect(await g.next()).toEqual({\n    value: 42,\n    done: false,\n  });\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
