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
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'sync generators > basic generator yields values',
    source: `() => {
        function* gen() {
          yield 1;
          yield 2;
          yield 3;
        }
        const g = gen();
        expect(g.next()).toEqual({ value: 1, done: false });
        expect(g.next()).toEqual({ value: 2, done: false });
        expect(g.next()).toEqual({ value: 3, done: false });
        expect(g.next()).toEqual({ value: undefined, done: true });
      }`,
    output: `() => {
  function* gen() {
    yield 1;
    yield 2;
    yield 3;
  }
  const g = gen();
  expect(g.next()).toEqual({ value: 1, done: false });
  expect(g.next()).toEqual({ value: 2, done: false });
  expect(g.next()).toEqual({ value: 3, done: false });
  expect(g.next()).toEqual({ value: undefined, done: true });
};`,
  },
  {
    title: 'sync generators > generator with return value',
    source: `() => {
        function* gen() {
          yield 1;
          return 'done';
        }
        const g = gen();
        expect(g.next()).toEqual({ value: 1, done: false });
        expect(g.next()).toEqual({ value: 'done', done: true });
        expect(g.next()).toEqual({ value: undefined, done: true });
      }`,
    output: `() => {
  function* gen() {
    yield 1;
    return 'done';
  }
  const g = gen();
  expect(g.next()).toEqual({ value: 1, done: false });
  expect(g.next()).toEqual({ value: 'done', done: true });
  expect(g.next()).toEqual({ value: undefined, done: true });
};`,
  },
  {
    title: 'sync generators > generator with try-catch and no throw',
    source: `() => {
        function* foobar() {
          try {
            yield 1;
          } catch {
            return false;
          }
        }
        const gen = foobar();
        expect(gen.next().value).toBe(1);
        expect(gen.next().value).toBeUndefined();
      }`,
    output: `() => {
  function* foobar() {
    try {
      yield 1;
    } catch {
      return false;
    }
  }
  const gen = foobar();
  expect(gen.next().value).toBe(1);
  expect(gen.next().value).toBeUndefined();
};`,
  },
  {
    title: 'sync generators > generator with try-finally and early return',
    source: `() => {
        function* gen() {
          try {
            return;
          } finally {
            // noop
          }
        }
        expect(gen().next()).toEqual({ done: true, value: undefined });
      }`,
    output: `() => {
  function* gen() {
    try {
      return;
    } finally {
      // noop
    }
  }
  expect(gen().next()).toEqual({ done: true, value: undefined });
};`,
  },
  {
    title: 'sync generators > generator with switch-default-break',
    source: `() => {
        function* gen(type) {
          switch (type) {
            default:
              break;
          }
        }
        expect(gen(1).next().done).toBe(true);
     \x20
        function* gen2(type) {
          switch (type) {
            case 0:
              throw 'unreachable';
            default:
              break;
          }
        }
        expect(gen2(1).next().done).toBe(true);
      }`,
    output: `() => {
  function* gen(type) {
    switch (type) {
      default:
        break;
    }
  }
  expect(gen(1).next().done).toBe(true);

  function* gen2(type) {
    switch (type) {
      case 0:
        throw 'unreachable';
      default:
        break;
    }
  }
  expect(gen2(1).next().done).toBe(true);
};`,
  },
  {
    title: 'sync generators > generator with default parameters',
    source: `() => {
        function* foo(bar = 'bar') {
          return bar;
        }
        expect(foo().next().value).toBe('bar');
        expect(foo('foo').next().value).toBe('foo');
      }`,
    output: `() => {
  function* foo(bar = 'bar') {
    return bar;
  }
  expect(foo().next().value).toBe('bar');
  expect(foo('foo').next().value).toBe('foo');
};`,
  },
  {
    title: 'sync generators > generator with destructured parameters',
    source: `() => {
        function* foo({ bar }) {
          return bar;
        }
        expect(foo({ bar: 'bar' }).next().value).toBe('bar');
      }`,
    output: `() => {
  function* foo({ bar }) {
    return bar;
  }
  expect(foo({ bar: 'bar' }).next().value).toBe('bar');
};`,
  },
  {
    title: 'sync generators > generator with rest parameters',
    source: `() => {
        function* foo(...items) {
          return items;
        }
        expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  function* foo(...items) {
    return items;
  }
  expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'sync generators > generator with throw()',
    source: `() => {
        function* gen() {
          try {
            yield 1;
            yield 2;
          } catch (e) {
            yield 'caught: ' + e.message;
          }
        }
        const g = gen();
        expect(g.next()).toEqual({ value: 1, done: false });
        expect(g.throw(new Error('test'))).toEqual({ value: 'caught: test', done: false });
      }`,
    output: `() => {
  function* gen() {
    try {
      yield 1;
      yield 2;
    } catch (e) {
      yield 'caught: ' + e.message;
    }
  }
  const g = gen();
  expect(g.next()).toEqual({ value: 1, done: false });
  expect(g.throw(new Error('test'))).toEqual({ value: 'caught: test', done: false });
};`,
  },
  {
    title: 'sync generators > generator with return()',
    source: `() => {
        function* gen() {
          try {
            yield 1;
            yield 2;
          } finally {
            yield 'cleanup';
          }
        }
        const g = gen();
        expect(g.next()).toEqual({ value: 1, done: false });
        expect(g.return('early')).toEqual({ value: 'cleanup', done: false });
        expect(g.next()).toEqual({ value: 'early', done: true });
      }`,
    output: `() => {
  function* gen() {
    try {
      yield 1;
      yield 2;
    } finally {
      yield 'cleanup';
    }
  }
  const g = gen();
  expect(g.next()).toEqual({ value: 1, done: false });
  expect(g.return('early')).toEqual({ value: 'cleanup', done: false });
  expect(g.next()).toEqual({ value: 'early', done: true });
};`,
  },
  {
    title: 'sync generators > yield* delegation to another generator',
    source: `() => {
        function* inner() {
          yield 'a';
          yield 'b';
        }
        function* outer() {
          yield 1;
          yield* inner();
          yield 2;
        }
        expect([...outer()]).toEqual([1, 'a', 'b', 2]);
      }`,
    output: `() => {
  function* inner() {
    yield 'a';
    yield 'b';
  }
  function* outer() {
    yield 1;
    yield* inner();
    yield 2;
  }
  expect([...outer()]).toEqual([1, 'a', 'b', 2]);
};`,
  },
  {
    title: 'sync generators > yield* delegation to array',
    source: `() => {
        function* gen() {
          yield* [10, 20, 30];
        }
        expect([...gen()]).toEqual([10, 20, 30]);
      }`,
    output: `() => {
  function* gen() {
    yield* [10, 20, 30];
  }
  expect([...gen()]).toEqual([10, 20, 30]);
};`,
  },
  {
    title: 'sync generators > yield* with iterable that has no return method',
    source: `() => {
        function* inner() {
          yield 1;
          yield 2;
        }
        function* outer() {
          const result = yield* inner();
          yield result;
        }
        const g = outer();
        expect(g.next()).toEqual({ value: 1, done: false });
        expect(g.next()).toEqual({ value: 2, done: false });
        expect(g.next()).toEqual({ value: undefined, done: false });
      }`,
    output: `() => {
  function* inner() {
    yield 1;
    yield 2;
  }
  function* outer() {
    const result = yield* inner();
    yield result;
  }
  const g = outer();
  expect(g.next()).toEqual({ value: 1, done: false });
  expect(g.next()).toEqual({ value: 2, done: false });
  expect(g.next()).toEqual({ value: undefined, done: false });
};`,
  },
  {
    title: 'sync generators > generator used in spread',
    source: `() => {
        function* gen() {
          yield 1;
          yield 2;
          yield 3;
        }
        expect([...gen()]).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  function* gen() {
    yield 1;
    yield 2;
    yield 3;
  }
  expect([...gen()]).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'sync generators > generator used in destructuring',
    source: `() => {
        function* gen() {
          yield 'a';
          yield 'b';
          yield 'c';
        }
        const [x, y, z] = gen();
        expect(x).toBe('a');
        expect(y).toBe('b');
        expect(z).toBe('c');
      }`,
    output: `() => {
  function* gen() {
    yield 'a';
    yield 'b';
    yield 'c';
  }
  const [x, y, z] = gen();
  expect(x).toBe('a');
  expect(y).toBe('b');
  expect(z).toBe('c');
};`,
  },
  {
    title: 'sync generators > generator with complex control flow',
    source: `() => {
        function* gen(n) {
          for (let i = 0; i < n; i++) {
            if (i % 2 === 0) {
              yield i;
            }
          }
        }
        expect([...gen(6)]).toEqual([0, 2, 4]);
      }`,
    output: `() => {
  function* gen(n) {
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) {
        yield i;
      }
    }
  }
  expect([...gen(6)]).toEqual([0, 2, 4]);
};`,
  },
  {
    title: 'sync generators > nested generators with yield*',
    source: `() => {
        function* a() {
          yield 1;
        }
        function* b() {
          yield* a();
          yield 2;
        }
        function* c() {
          yield* b();
          yield 3;
        }
        expect([...c()]).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  function* a() {
    yield 1;
  }
  function* b() {
    yield* a();
    yield 2;
  }
  function* c() {
    yield* b();
    yield 3;
  }
  expect([...c()]).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'sync generators > generator passing values via next()',
    source: `() => {
        function* gen() {
          const a = yield 'first';
          const b = yield 'second';
          return a + b;
        }
        const g = gen();
        expect(g.next().value).toBe('first');
        expect(g.next(10).value).toBe('second');
        expect(g.next(32).value).toBe(42);
      }`,
    output: `() => {
  function* gen() {
    const a = yield 'first';
    const b = yield 'second';
    return a + b;
  }
  const g = gen();
  expect(g.next().value).toBe('first');
  expect(g.next(10).value).toBe('second');
  expect(g.next(32).value).toBe(42);
};`,
  },
  {
    title: 'sync generators > infinite generator with break',
    source: `() => {
        function* counter() {
          let i = 0;
          while (true) {
            yield i++;
          }
        }
        const results = [];
        for (const n of counter()) {
          results.push(n);
          if (n >= 4) break;
        }
        expect(results).toEqual([0, 1, 2, 3, 4]);
      }`,
    output: `() => {
  function* counter() {
    let i = 0;
    while (true) {
      yield i++;
    }
  }
  const results = [];
  for (const n of counter()) {
    results.push(n);
    if (n >= 4) break;
  }
  expect(results).toEqual([0, 1, 2, 3, 4]);
};`,
  },
  {
    title: 'for-of iteration > for-of with array',
    source: `() => {
        var arr = [1, 2, 3];
        var res = [];
        for (const x of arr) res.push(x);
        expect(res).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  var arr = [1, 2, 3];
  var res = [];
  for (const x of arr) res.push(x);
  expect(res).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'for-of iteration > for-of with array and break',
    source: `() => {
        var arr = [1, 2, 3];
        var res = [];
        for (const x of arr) {
          if (x === 2) break;
          res.push(x);
        }
        expect(res).toEqual([1]);
      }`,
    output: `() => {
  var arr = [1, 2, 3];
  var res = [];
  for (const x of arr) {
    if (x === 2) break;
    res.push(x);
  }
  expect(res).toEqual([1]);
};`,
  },
  {
    title: 'for-of iteration > for-of with array and continue',
    source: `() => {
        var arr = [1, 2, 3];
        var res = [];
        for (const x of arr) {
          if (x === 2) continue;
          res.push(x);
        }
        expect(res).toEqual([1, 3]);
      }`,
    output: `() => {
  var arr = [1, 2, 3];
  var res = [];
  for (const x of arr) {
    if (x === 2) continue;
    res.push(x);
  }
  expect(res).toEqual([1, 3]);
};`,
  },
  {
    title: 'for-of iteration > for-of with generator',
    source: `() => {
        function* f() {
          yield 1;
          yield 2;
          yield 3;
        }
        var res = [];
        for (const x of f()) res.push(x);
        expect(res).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  function* f() {
    yield 1;
    yield 2;
    yield 3;
  }
  var res = [];
  for (const x of f()) res.push(x);
  expect(res).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'for-of iteration > for-of with generator and break',
    source: `() => {
        function* f() {
          yield 1;
          yield 2;
          yield 3;
        }
        var res = [];
        for (const x of f()) {
          if (x === 2) break;
          res.push(x);
        }
        expect(res).toEqual([1]);
      }`,
    output: `() => {
  function* f() {
    yield 1;
    yield 2;
    yield 3;
  }
  var res = [];
  for (const x of f()) {
    if (x === 2) break;
    res.push(x);
  }
  expect(res).toEqual([1]);
};`,
  },
  {
    title: 'for-of iteration > for-of with generator and continue',
    source: `() => {
        function* f() {
          yield 1;
          yield 2;
          yield 3;
        }
        var res = [];
        for (const x of f()) {
          if (x === 2) continue;
          res.push(x);
        }
        expect(res).toEqual([1, 3]);
      }`,
    output: `() => {
  function* f() {
    yield 1;
    yield 2;
    yield 3;
  }
  var res = [];
  for (const x of f()) {
    if (x === 2) continue;
    res.push(x);
  }
  expect(res).toEqual([1, 3]);
};`,
  },
  {
    title: 'for-of iteration > for-of with string',
    source: `() => {
        var res = [];
        for (const ch of 'abc') res.push(ch);
        expect(res).toEqual(['a', 'b', 'c']);
      }`,
    output: `() => {
  var res = [];
  for (const ch of 'abc') res.push(ch);
  expect(res).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'for-of iteration > for-of with Set',
    source: `() => {
        var res = [];
        for (const x of new Set([1, 2, 3])) res.push(x);
        expect(res).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  var res = [];
  for (const x of new Set([1, 2, 3])) res.push(x);
  expect(res).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'for-of iteration > for-of with Map',
    source: `() => {
        var res = [];
        for (const [k, v] of new Map([
          ['a', 1],
          ['b', 2],
        ])) {
          res.push(k + ':' + v);
        }
        expect(res).toEqual(['a:1', 'b:2']);
      }`,
    output: `() => {
  var res = [];
  for (const [k, v] of new Map([
    ['a', 1],
    ['b', 2],
  ])) {
    res.push(k + ':' + v);
  }
  expect(res).toEqual(['a:1', 'b:2']);
};`,
  },
  {
    title: 'for-of iteration > for-of with custom iterable',
    source: `() => {
        const iterable = {
          [Symbol.iterator]() {
            let i = 0;
            return {
              next() {
                if (i < 3) return { value: i++, done: false };
                return { value: undefined, done: true };
              },
            };
          },
        };
        var res = [];
        for (const x of iterable) res.push(x);
        expect(res).toEqual([0, 1, 2]);
      }`,
    output: `() => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          if (i < 3) return { value: i++, done: false };
          return { value: undefined, done: true };
        },
      };
    },
  };
  var res = [];
  for (const x of iterable) res.push(x);
  expect(res).toEqual([0, 1, 2]);
};`,
  },
  {
    title: 'for-of iteration > for-of calls return() on iterator when break occurs',
    source: `() => {
        let returnCalled = false;
        const iterable = {
          [Symbol.iterator]() {
            let i = 0;
            return {
              next() {
                return { value: i++, done: false };
              },
              return() {
                returnCalled = true;
                return { value: undefined, done: true };
              },
            };
          },
        };
        for (const x of iterable) {
          if (x === 2) break;
        }
        expect(returnCalled).toBe(true);
      }`,
    output: `() => {
  let returnCalled = false;
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          return { value: i++, done: false };
        },
        return() {
          returnCalled = true;
          return { value: undefined, done: true };
        },
      };
    },
  };
  for (const x of iterable) {
    if (x === 2) break;
  }
  expect(returnCalled).toBe(true);
};`,
  },
  {
    title: 'for-of iteration > for-of calls return() on iterator when exception is thrown',
    source: `() => {
        let returnCalled = false;
        const iterable = {
          [Symbol.iterator]() {
            let i = 0;
            return {
              next() {
                return { value: i++, done: false };
              },
              return() {
                returnCalled = true;
                return { value: undefined, done: true };
              },
            };
          },
        };
        try {
          for (const x of iterable) {
            if (x === 1) throw new Error('bail');
          }
        } catch (e) {}
        expect(returnCalled).toBe(true);
      }`,
    output: `() => {
  let returnCalled = false;
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          return { value: i++, done: false };
        },
        return() {
          returnCalled = true;
          return { value: undefined, done: true };
        },
      };
    },
  };
  try {
    for (const x of iterable) {
      if (x === 1) throw new Error('bail');
    }
  } catch (e) {}
  expect(returnCalled).toBe(true);
};`,
  },
  {
    title: 'for-of iteration > for-of with let creates per-iteration binding',
    source: `() => {
        const funcs = [];
        for (let x of [0, 1, 2]) {
          funcs.push(() => x);
        }
        expect(funcs[0]()).toBe(0);
        expect(funcs[1]()).toBe(1);
        expect(funcs[2]()).toBe(2);
      }`,
    output: `() => {
  const funcs = [];
  for (let x of [0, 1, 2]) {
    funcs.push(() => x);
  }
  expect(funcs[0]()).toBe(0);
  expect(funcs[1]()).toBe(1);
  expect(funcs[2]()).toBe(2);
};`,
  },
  {
    title: 'for-of iteration > for-of with destructuring',
    source: `() => {
        const pairs = [
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ];
        var nums = [];
        var strs = [];
        for (const [n, s] of pairs) {
          nums.push(n);
          strs.push(s);
        }
        expect(nums).toEqual([1, 2, 3]);
        expect(strs).toEqual(['a', 'b', 'c']);
      }`,
    output: `() => {
  const pairs = [
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
  ];
  var nums = [];
  var strs = [];
  for (const [n, s] of pairs) {
    nums.push(n);
    strs.push(s);
  }
  expect(nums).toEqual([1, 2, 3]);
  expect(strs).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'for-of iteration > for-of with arguments object',
    source: `() => {
        function getArgs() {
          return arguments;
        }
        var args = getArgs(1, 2, 3);
        var res = [];
        for (const x of args) res.push(x);
        expect(res).toEqual([1, 2, 3]);
      }`,
    output: `() => {
  function getArgs() {
    return arguments;
  }
  var args = getArgs(1, 2, 3);
  var res = [];
  for (const x of args) res.push(x);
  expect(res).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'async generators > basic async generator yields resolved values',
    source: `async () => {
        async function* gen() {
          yield await Promise.resolve('foo');
          yield await Promise.resolve('bar');
          yield await Promise.resolve('baz');
        }
        const g = gen();
        expect(await g.next()).toEqual({ value: 'foo', done: false });
        expect(await g.next()).toEqual({ value: 'bar', done: false });
        expect(await g.next()).toEqual({ value: 'baz', done: false });
        expect(await g.next()).toEqual({ value: undefined, done: true });
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield yield _awaitAsyncGenerator(Promise.resolve('foo'));
      yield yield _awaitAsyncGenerator(Promise.resolve('bar'));
      yield yield _awaitAsyncGenerator(Promise.resolve('baz'));
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  expect(await g.next()).toEqual({
    value: 'foo',
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 'bar',
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 'baz',
    done: false,
  });
  expect(await g.next()).toEqual({
    value: undefined,
    done: true,
  });
};`,
  },
  {
    title: 'async generators > async generator execution order with delays',
    source: `async () => {
        const log = [];
        async function* gen() {
          log.push('a');
          yield Promise.resolve();
          log.push('b');
          yield Promise.resolve();
          log.push('c');
        }
        const g = gen();
        await g.next();
        await g.next();
        await g.next();
        expect(log).toEqual(['a', 'b', 'c']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  const log = [];
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      log.push('a');
      yield Promise.resolve();
      log.push('b');
      yield Promise.resolve();
      log.push('c');
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  await g.next();
  await g.next();
  await g.next();
  expect(log).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'async generators > async generator with return value',
    source: `async () => {
        async function* gen() {
          yield 1;
          yield 2;
          return 'done';
        }
        const g = gen();
        expect(await g.next()).toEqual({ value: 1, done: false });
        expect(await g.next()).toEqual({ value: 2, done: false });
        expect(await g.next()).toEqual({ value: 'done', done: true });
        expect(await g.next()).toEqual({ value: undefined, done: true });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield 1;
      yield 2;
      return 'done';
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  expect(await g.next()).toEqual({
    value: 1,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 2,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 'done',
    done: true,
  });
  expect(await g.next()).toEqual({
    value: undefined,
    done: true,
  });
};`,
  },
  {
    title: 'async generators > async generator with throw()',
    source: `async () => {
        async function* gen() {
          try {
            yield 1;
            yield 2;
          } catch (e) {
            yield 'caught: ' + e.message;
          }
        }
        const g = gen();
        expect(await g.next()).toEqual({ value: 1, done: false });
        const result = await g.throw(new Error('test'));
        expect(result).toEqual({ value: 'caught: test', done: false });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      try {
        yield 1;
        yield 2;
      } catch (e) {
        yield 'caught: ' + e.message;
      }
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  expect(await g.next()).toEqual({
    value: 1,
    done: false,
  });
  const result = await g.throw(new Error('test'));
  expect(result).toEqual({
    value: 'caught: test',
    done: false,
  });
};`,
  },
  {
    title: 'async generators > async generator with return() for cleanup',
    source: `async () => {
        const log = [];
        async function* gen() {
          try {
            log.push('start');
            yield 1;
            log.push('after yield 1');
            yield 2;
          } finally {
            log.push('cleanup');
          }
        }
        const g = gen();
        await g.next();
        await g.return();
        expect(log).toEqual(['start', 'cleanup']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  const log = [];
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      try {
        log.push('start');
        yield 1;
        log.push('after yield 1');
        yield 2;
      } finally {
        log.push('cleanup');
      }
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  await g.next();
  await g.return();
  expect(log).toEqual(['start', 'cleanup']);
};`,
  },
  {
    title: 'async generators > async generator passing values via next()',
    source: `async () => {
        async function* gen() {
          const a = yield 'first';
          const b = yield 'second';
          return a + b;
        }
        const g = gen();
        expect((await g.next()).value).toBe('first');
        expect((await g.next(10)).value).toBe('second');
        expect((await g.next(32)).value).toBe(42);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      const a = yield 'first';
      const b = yield 'second';
      return a + b;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  expect((await g.next()).value).toBe('first');
  expect((await g.next(10)).value).toBe('second');
  expect((await g.next(32)).value).toBe(42);
};`,
  },
  {
    title: 'async generators > async generator with try-finally',
    source: `async () => {
        const log = [];
        async function* gen() {
          try {
            yield 1;
            yield 2;
          } finally {
            log.push('finally');
          }
        }
        const g = gen();
        await g.next();
        await g.next();
        await g.next();
        expect(log).toEqual(['finally']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  const log = [];
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      try {
        yield 1;
        yield 2;
      } finally {
        log.push('finally');
      }
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  await g.next();
  await g.next();
  await g.next();
  expect(log).toEqual(['finally']);
};`,
  },
  {
    title: 'async generators > async generator with nested await',
    source: `async () => {
        async function fetchVal(x) {
          return Promise.resolve(x * 2);
        }
        async function* gen() {
          yield await fetchVal(1);
          yield await fetchVal(2);
          yield await fetchVal(3);
        }
        const results = [];
        const g = gen();
        let r = await g.next();
        while (!r.done) {
          results.push(r.value);
          r = await g.next();
        }
        expect(results).toEqual([2, 4, 6]);
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  async function fetchVal(x) {
    return Promise.resolve(x * 2);
  }
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield yield _awaitAsyncGenerator(fetchVal(1));
      yield yield _awaitAsyncGenerator(fetchVal(2));
      yield yield _awaitAsyncGenerator(fetchVal(3));
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  const g = gen();
  let r = await g.next();
  while (!r.done) {
    results.push(r.value);
    r = await g.next();
  }
  expect(results).toEqual([2, 4, 6]);
};`,
  },
  {
    title: 'async generators > async generator expression',
    source: `async () => {
        const gen = async function* () {
          yield 1;
          yield 2;
        };
        const g = gen();
        expect(await g.next()).toEqual({ value: 1, done: false });
        expect(await g.next()).toEqual({ value: 2, done: false });
        expect(await g.next()).toEqual({ value: undefined, done: true });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  const gen = _wrapAsyncGenerator(function* () {
    yield 1;
    yield 2;
  });
  const g = gen();
  expect(await g.next()).toEqual({
    value: 1,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 2,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: undefined,
    done: true,
  });
};`,
  },
  {
    title: 'async generators > async generator as class method',
    source: `async () => {
        class Foo {
          async *items() {
            yield 'a';
            yield 'b';
          }
        }
        const results = [];
        for await (const val of new Foo().items()) {
          results.push(val);
        }
        expect(results).toEqual(['a', 'b']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  class Foo {
    items() {
      return _wrapAsyncGenerator(function* () {
        yield 'a';
        yield 'b';
      })();
    }
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(new Foo().items()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual(['a', 'b']);
};`,
  },
  {
    title: 'for-await-of > for-await-of with async generator (cumulative sum)',
    source: `async () => {
        async function* genAnswers() {
          var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];
          var total = 0;
          for await (let val of stream) {
            total += await val;
            yield total;
          }
        }
        const results = [];
        for await (const val of genAnswers()) {
          results.push(val);
        }
        expect(results).toEqual([4, 13, 25]);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function genAnswers() {
    return _genAnswers.apply(this, arguments);
  }
  function _genAnswers() {
    _genAnswers = _wrapAsyncGenerator(function* () {
      var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];
      var total = 0;
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = _asyncIterator(stream), _step;
          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
            .done);
          _iteratorAbruptCompletion = false
        ) {
          let val = _step.value;
          {
            total += yield _awaitAsyncGenerator(val);
            yield total;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            yield _awaitAsyncGenerator(_iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
    return _genAnswers.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion2 = false;
  var _didIteratorError2 = false;
  var _iteratorError2;
  try {
    for (
      var _iterator2 = _asyncIterator(genAnswers()), _step2;
      (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);
      _iteratorAbruptCompletion2 = false
    ) {
      const val = _step2.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion2 && _iterator2.return != null) {
        _iteratorResult(await _iterator2.return());
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
  expect(results).toEqual([4, 13, 25]);
};`,
  },
  {
    title: 'for-await-of > for-await-of with array of promises',
    source: `async () => {
        const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
        const results = [];
        for await (const val of promises) {
          results.push(val);
        }
        expect(results).toEqual([1, 2, 3]);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(promises), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'for-await-of > for-await-of with custom async iterable',
    source: `async () => {
        const iterable = {
          [Symbol.asyncIterator]() {
            let i = 0;
            return {
              next() {
                if (i < 3) return Promise.resolve({ value: i++, done: false });
                return Promise.resolve({ value: undefined, done: true });
              },
            };
          },
        };
        const results = [];
        for await (const val of iterable) {
          results.push(val);
        }
        expect(results).toEqual([0, 1, 2]);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  const iterable = {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next() {
          if (i < 3)
            return Promise.resolve({
              value: i++,
              done: false,
            });
          return Promise.resolve({
            value: undefined,
            done: true,
          });
        },
      };
    },
  };
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(iterable), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([0, 1, 2]);
};`,
  },
  {
    title: 'for-await-of > for-await-of with break',
    source: `async () => {
        async function* gen() {
          yield 1;
          yield 2;
          yield 3;
          yield 4;
          yield 5;
        }
        const results = [];
        for await (const val of gen()) {
          results.push(val);
          if (val === 3) break;
        }
        expect(results).toEqual([1, 2, 3]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(gen()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
        if (val === 3) break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'for-await-of > for-await-of with error in iterable',
    source: `async () => {
        async function* gen() {
          yield 1;
          throw new Error('gen error');
        }
        const results = [];
        try {
          for await (const val of gen()) {
            results.push(val);
          }
        } catch (e) {
          results.push('error: ' + e.message);
        }
        expect(results).toEqual([1, 'error: gen error']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield 1;
      throw new Error('gen error');
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  try {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = _asyncIterator(gen()), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        const val = _step.value;
        {
          results.push(val);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } catch (e) {
    results.push('error: ' + e.message);
  }
  expect(results).toEqual([1, 'error: gen error']);
};`,
  },
  {
    title: 'for-await-of > for-await-of does not access value when done',
    source: `async () => {
        let gotValue = false;
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              next: () =>
                Promise.resolve({
                  get value() {
                    gotValue = true;
                  },
                  done: true,
                }),
            };
          },
        };
        for await (let value of iterable) {
        }
        expect(gotValue).toBe(false);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  let gotValue = false;
  const iterable = {
    [Symbol.asyncIterator]() {
      return {
        next: () =>
          Promise.resolve({
            get value() {
              gotValue = true;
            },
            done: true,
          }),
      };
    },
  };
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(iterable), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let value = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(gotValue).toBe(false);
};`,
  },
  {
    title: 'for-await-of > for-await-of with member expression as LHS',
    source: `async () => {
        let obj = {};
        for await (obj.x of [1, 2]) {
        }
        expect(obj.x).toBe(2);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  let obj = {};
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator([1, 2]), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      obj.x = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(obj.x).toBe(2);
};`,
  },
  {
    title: 'for-await-of > for-await-of allows re-declaration of let in body',
    source: `async () => {
        // Should not throw a SyntaxError
        for await (let x of []) {
          let x;
        }
        expect(true).toBe(true);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  // Should not throw a SyntaxError
  try {
    for (
      var _iterator = _asyncIterator([]), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let x = _step.value;
      {
        let x;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(true).toBe(true);
};`,
  },
  {
    title: 'for-await-of > for-await-of with destructuring',
    source: `async () => {
        async function* gen() {
          yield { a: 1, b: 2 };
          yield { a: 3, b: 4 };
        }
        const results = [];
        for await (const { a, b } of gen()) {
          results.push(a + b);
        }
        expect(results).toEqual([3, 7]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield {
        a: 1,
        b: 2,
      };
      yield {
        a: 3,
        b: 4,
      };
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(gen()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const { a, b } = _step.value;
      {
        results.push(a + b);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([3, 7]);
};`,
  },
  {
    title: 'for-await-of > for-await-of with sync iterable (fallback)',
    source: `async () => {
        // for-await-of should work with sync iterables too
        const results = [];
        for await (const val of [10, 20, 30]) {
          results.push(val);
        }
        expect(results).toEqual([10, 20, 30]);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  // for-await-of should work with sync iterables too
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator([10, 20, 30]), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([10, 20, 30]);
};`,
  },
  {
    title: 'async generator yield* delegation > yield* delegation with early return()',
    source: `async () => {
        const log = [];
        async function* inner() {
          log.push(1);
          yield 'a';
          log.push(2);
          yield 'b';
          log.push(3);
        }
        async function* outer() {
          log.push(4);
          yield* inner();
          log.push(5);
        }
        const iter = outer();
        const res = await iter.next();
        expect(res).toEqual({ value: 'a', done: false });
        expect(log).toEqual([4, 1]);
     \x20
        await iter.return();
        expect(log).toEqual([4, 1]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
async () => {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = _wrapAsyncGenerator(function* () {
      log.push(1);
      yield 'a';
      log.push(2);
      yield 'b';
      log.push(3);
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = _wrapAsyncGenerator(function* () {
      log.push(4);
      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));
      log.push(5);
    });
    return _outer.apply(this, arguments);
  }
  const iter = outer();
  const res = await iter.next();
  expect(res).toEqual({
    value: 'a',
    done: false,
  });
  expect(log).toEqual([4, 1]);
  await iter.return();
  expect(log).toEqual([4, 1]);
};`,
  },
  {
    title: 'async generator yield* delegation > yield* delegation with throw() caught by inner',
    source: `async () => {
        const log = [];
        async function* inner() {
          try {
            log.push(1);
            yield 'a';
            log.push(2);
          } catch (e) {
            log.push(3);
            yield 'caught';
            log.push(4);
          }
        }
        async function* outer() {
          log.push(5);
          yield* inner();
          log.push(6);
        }
        const iter = outer();
        await iter.next();
        expect(log).toEqual([5, 1]);
     \x20
        const res = await iter.throw(new Error('TEST'));
        expect(res).toEqual({ value: 'caught', done: false });
        expect(log).toEqual([5, 1, 3]);
     \x20
        await iter.next();
        expect(log).toEqual([5, 1, 3, 4, 6]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
async () => {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = _wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
      } catch (e) {
        log.push(3);
        yield 'caught';
        log.push(4);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = _wrapAsyncGenerator(function* () {
      log.push(5);
      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));
      log.push(6);
    });
    return _outer.apply(this, arguments);
  }
  const iter = outer();
  await iter.next();
  expect(log).toEqual([5, 1]);
  const res = await iter.throw(new Error('TEST'));
  expect(res).toEqual({
    value: 'caught',
    done: false,
  });
  expect(log).toEqual([5, 1, 3]);
  await iter.next();
  expect(log).toEqual([5, 1, 3, 4, 6]);
};`,
  },
  {
    title: 'async generator yield* delegation > yield* from sync iterable in async generator',
    source: `async () => {
        async function* fn() {
          yield* [Promise.resolve('ok')];
        }
        const result = await fn().next();
        expect(result.done).toBe(false);
        // CreateAsyncFromSyncIterator awaits the yielded promise,
        // so the value is the resolved string, not the Promise itself.
        expect(result.value).toBe('ok');
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function fn() {
    return _fn.apply(this, arguments);
  }
  function _fn() {
    _fn = _wrapAsyncGenerator(function* () {
      yield* _asyncGeneratorDelegate(_asyncIterator([Promise.resolve('ok')]));
    });
    return _fn.apply(this, arguments);
  }
  const result = await fn().next();
  expect(result.done).toBe(false);
  // CreateAsyncFromSyncIterator awaits the yielded promise,
  // so the value is the resolved string, not the Promise itself.
  expect(result.value).toBe('ok');
};`,
  },
  {
    title: 'async generator yield* delegation > yield* early return does not execute rest of inner',
    source: `async () => {
        const log = [];
        async function* func1() {
          log.push(1);
          yield 'a';
          log.push(2);
        }
        async function* func2() {
          yield* func1();
          log.push(3);
        }
        const iter = func2();
        await iter.next();
        await iter.return();
        expect(log).toEqual([1]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
async () => {
  const log = [];
  function func1() {
    return _func.apply(this, arguments);
  }
  function _func() {
    _func = _wrapAsyncGenerator(function* () {
      log.push(1);
      yield 'a';
      log.push(2);
    });
    return _func.apply(this, arguments);
  }
  function func2() {
    return _func2.apply(this, arguments);
  }
  function _func2() {
    _func2 = _wrapAsyncGenerator(function* () {
      yield* _asyncGeneratorDelegate(_asyncIterator(func1()));
      log.push(3);
    });
    return _func2.apply(this, arguments);
  }
  const iter = func2();
  await iter.next();
  await iter.return();
  expect(log).toEqual([1]);
};`,
  },
  {
    title: 'async generator yield* delegation > yield* delegation with async inner values',
    source: `async () => {
        async function* inner() {
          yield await Promise.resolve(10);
          yield await Promise.resolve(20);
        }
        async function* outer() {
          yield 1;
          yield* inner();
          yield 2;
        }
        const results = [];
        for await (const val of outer()) {
          results.push(val);
        }
        expect(results).toEqual([1, 10, 20, 2]);
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = _wrapAsyncGenerator(function* () {
      yield yield _awaitAsyncGenerator(Promise.resolve(10));
      yield yield _awaitAsyncGenerator(Promise.resolve(20));
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = _wrapAsyncGenerator(function* () {
      yield 1;
      yield* _asyncGeneratorDelegate(_asyncIterator(inner()));
      yield 2;
    });
    return _outer.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(outer()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([1, 10, 20, 2]);
};`,
  },
  {
    title: 'async generator yield* delegation > yield* nested three levels deep',
    source: `async () => {
        async function* a() {
          yield 'a';
        }
        async function* b() {
          yield* a();
          yield 'b';
        }
        async function* c() {
          yield* b();
          yield 'c';
        }
        const results = [];
        for await (const val of c()) {
          results.push(val);
        }
        expect(results).toEqual(['a', 'b', 'c']);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _asyncGeneratorDelegate = require('@babel/runtime/helpers/asyncGeneratorDelegate');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function a() {
    return _a.apply(this, arguments);
  }
  function _a() {
    _a = _wrapAsyncGenerator(function* () {
      yield 'a';
    });
    return _a.apply(this, arguments);
  }
  function b() {
    return _b.apply(this, arguments);
  }
  function _b() {
    _b = _wrapAsyncGenerator(function* () {
      yield* _asyncGeneratorDelegate(_asyncIterator(a()));
      yield 'b';
    });
    return _b.apply(this, arguments);
  }
  function c() {
    return _c.apply(this, arguments);
  }
  function _c() {
    _c = _wrapAsyncGenerator(function* () {
      yield* _asyncGeneratorDelegate(_asyncIterator(b()));
      yield 'c';
    });
    return _c.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(c()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual(['a', 'b', 'c']);
};`,
  },
  {
    title: 'edge cases > generator with labeled loop and break',
    source: `() => {
        function* gen() {
          outer: for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              if (j === 1) continue outer;
              yield [i, j];
            }
          }
        }
        expect([...gen()]).toEqual([
          [0, 0],
          [1, 0],
          [2, 0],
        ]);
      }`,
    output: `() => {
  function* gen() {
    outer: for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (j === 1) continue outer;
        yield [i, j];
      }
    }
  }
  expect([...gen()]).toEqual([
    [0, 0],
    [1, 0],
    [2, 0],
  ]);
};`,
  },
  {
    title: 'edge cases > async generator with for-of inside',
    source: `async () => {
        async function* gen() {
          for (const x of [1, 2, 3]) {
            yield await Promise.resolve(x * 10);
          }
        }
        const results = [];
        for await (const val of gen()) {
          results.push(val);
        }
        expect(results).toEqual([10, 20, 30]);
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      for (const x of [1, 2, 3]) {
        yield yield _awaitAsyncGenerator(Promise.resolve(x * 10));
      }
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(gen()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([10, 20, 30]);
};`,
  },
  {
    title: 'edge cases > async generator with for-await-of inside',
    source: `async () => {
        async function* gen() {
          for await (const x of [Promise.resolve(1), Promise.resolve(2)]) {
            yield x * 10;
          }
        }
        const results = [];
        for await (const val of gen()) {
          results.push(val);
        }
        expect(results).toEqual([10, 20]);
      }`,
    output: `var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = _asyncIterator([Promise.resolve(1), Promise.resolve(2)]), _step;
          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
            .done);
          _iteratorAbruptCompletion = false
        ) {
          const x = _step.value;
          {
            yield x * 10;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            yield _awaitAsyncGenerator(_iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion2 = false;
  var _didIteratorError2 = false;
  var _iteratorError2;
  try {
    for (
      var _iterator2 = _asyncIterator(gen()), _step2;
      (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);
      _iteratorAbruptCompletion2 = false
    ) {
      const val = _step2.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion2 && _iterator2.return != null) {
        _iteratorResult(await _iterator2.return());
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
  expect(results).toEqual([10, 20]);
};`,
  },
  {
    title: 'edge cases > for-of with empty iterable',
    source: `() => {
        var count = 0;
        for (const x of []) {
          count++;
        }
        expect(count).toBe(0);
      }`,
    output: `() => {
  var count = 0;
  for (const x of []) {
    count++;
  }
  expect(count).toBe(0);
};`,
  },
  {
    title: 'edge cases > for-await-of with empty async iterable',
    source: `async () => {
        async function* empty() {}
        var count = 0;
        for await (const x of empty()) {
          count++;
        }
        expect(count).toBe(0);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function empty() {
    return _empty.apply(this, arguments);
  }
  function _empty() {
    _empty = _wrapAsyncGenerator(function* () {});
    return _empty.apply(this, arguments);
  }
  var count = 0;
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(empty()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const x = _step.value;
      {
        count++;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(count).toBe(0);
};`,
  },
  {
    title: 'edge cases > generator function length property',
    source: `() => {
        function* gen(a, b, c) {}
        expect(gen.length).toBe(3);
      }`,
    output: `() => {
  function* gen(a, b, c) {}
  expect(gen.length).toBe(3);
};`,
  },
  {
    title: 'edge cases > generator is iterable (Symbol.iterator)',
    source: `() => {
        function* gen() {
          yield 1;
        }
        const g = gen();
        expect(g[Symbol.iterator]() === g).toBe(true);
      }`,
    output: `() => {
  function* gen() {
    yield 1;
  }
  const g = gen();
  expect(g[Symbol.iterator]() === g).toBe(true);
};`,
  },
  {
    title: 'edge cases > async generator is async iterable (Symbol.asyncIterator)',
    source: `() => {
        async function* gen() {
          yield 1;
        }
        const g = gen();
        expect(g[Symbol.asyncIterator]() === g).toBe(true);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
() => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      yield 1;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen();
  expect(g[Symbol.asyncIterator]() === g).toBe(true);
};`,
  },
  {
    title: 'edge cases > for-of with TypedArray',
    source: `() => {
        var res = [];
        for (const x of new Uint8Array([10, 20, 30])) {
          res.push(x);
        }
        expect(res).toEqual([10, 20, 30]);
      }`,
    output: `() => {
  var res = [];
  for (const x of new Uint8Array([10, 20, 30])) {
    res.push(x);
  }
  expect(res).toEqual([10, 20, 30]);
};`,
  },
  {
    title: 'edge cases > async generator with Promise.all inside',
    source: `async () => {
        async function* gen() {
          const [a, b, c] = await Promise.all([
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3),
          ]);
          yield a;
          yield b;
          yield c;
        }
        const results = [];
        for await (const val of gen()) {
          results.push(val);
        }
        expect(results).toEqual([1, 2, 3]);
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen() {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* () {
      const [a, b, c] = yield _awaitAsyncGenerator(
        Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]),
      );
      yield a;
      yield b;
      yield c;
    });
    return _gen.apply(this, arguments);
  }
  const results = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(gen()), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const val = _step.value;
      {
        results.push(val);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(results).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'stack traces > error thrown inside sync generator includes function name',
    source: `() => {
        function* failingGen() {
          throw new Error('gen error');
        }
        const g = failingGen();
        try {
          g.next();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('failingGen') >= 0).toBe(true);
        }
      }`,
    output: `() => {
  function* failingGen() {
    throw new Error('gen error');
  }
  const g = failingGen();
  try {
    g.next();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('failingGen') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > generator throw() preserves caller stack',
    source: `() => {
        function* myGen() {
          try {
            yield 1;
          } catch (e) {
            throw e;
          }
        }
        const g = myGen();
        g.next();
        try {
          g.throw(new Error('injected'));
        } catch (e) {
          expect(e.message).toBe('injected');
        }
      }`,
    output: `() => {
  function* myGen() {
    try {
      yield 1;
    } catch (e) {
      throw e;
    }
  }
  const g = myGen();
  g.next();
  try {
    g.throw(new Error('injected'));
  } catch (e) {
    expect(e.message).toBe('injected');
  }
};`,
  },
  {
    title: 'stack traces > error thrown inside async generator includes function name',
    source: `async () => {
        async function* failingAsyncGen() {
          throw new Error('async gen error');
        }
        const g = failingAsyncGen();
        try {
          await g.next();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('failingAsyncGen') >= 0).toBe(true);
        }
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function failingAsyncGen() {
    return _failingAsyncGen.apply(this, arguments);
  }
  function _failingAsyncGen() {
    _failingAsyncGen = _wrapAsyncGenerator(function* () {
      throw new Error('async gen error');
    });
    return _failingAsyncGen.apply(this, arguments);
  }
  const g = failingAsyncGen();
  try {
    await g.next();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('failingAsyncGen') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > error after await inside async generator includes function name',
    source: `async () => {
        async function* genAfterAwait() {
          yield 'sentinel';
          await Promise.resolve();
          throw new Error('after await');
        }
        const g = genAfterAwait();
        await g.next(); // yields 'sentinel'
        try {
          await g.next(); // resumes, awaits, then throws
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('genAfterAwait') >= 0).toBe(true);
        }
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function genAfterAwait() {
    return _genAfterAwait.apply(this, arguments);
  }
  function _genAfterAwait() {
    _genAfterAwait = _wrapAsyncGenerator(function* () {
      yield 'sentinel';
      yield _awaitAsyncGenerator(Promise.resolve());
      throw new Error('after await');
    });
    return _genAfterAwait.apply(this, arguments);
  }
  const g = genAfterAwait();
  await g.next();
  try {
    await g.next();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('genAfterAwait') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > error propagates through for-await-of with function name',
    source: `async () => {
        async function* explodingGen() {
          yield 1;
          throw new Error('mid-iteration');
        }
        try {
          for await (const _val of explodingGen()) {
            // consume
          }
        } catch (e) {
          expect(e.message).toBe('mid-iteration');
          const stack = e.stack || '';
          expect(stack.indexOf('explodingGen') >= 0).toBe(true);
        }
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function explodingGen() {
    return _explodingGen.apply(this, arguments);
  }
  function _explodingGen() {
    _explodingGen = _wrapAsyncGenerator(function* () {
      yield 1;
      throw new Error('mid-iteration');
    });
    return _explodingGen.apply(this, arguments);
  }
  try {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = _asyncIterator(explodingGen()), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        const _val = _step.value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } catch (e) {
    expect(e.message).toBe('mid-iteration');
    const stack = e.stack || '';
    expect(stack.indexOf('explodingGen') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > error in yield* delegation includes inner generator name',
    source: `() => {
        function* inner() {
          yield 1;
          throw new Error('inner fail');
        }
        function* outer() {
          yield* inner();
        }
        const g = outer();
        g.next(); // yields 1
        try {
          g.next();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('inner') >= 0).toBe(true);
        }
      }`,
    output: `() => {
  function* inner() {
    yield 1;
    throw new Error('inner fail');
  }
  function* outer() {
    yield* inner();
  }
  const g = outer();
  g.next(); // yields 1
  try {
    g.next();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('inner') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > async generator method name in stack',
    source: `async () => {
        class DataStream {
          async *fetchChunks() {
            throw new Error('stream error');
          }
        }
        const s = new DataStream();
        const g = s.fetchChunks();
        try {
          await g.next();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('fetchChunks') >= 0).toBe(true);
        }
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  class DataStream {
    fetchChunks() {
      return _wrapAsyncGenerator(function* () {
        throw new Error('stream error');
      })();
    }
  }
  const s = new DataStream();
  const g = s.fetchChunks();
  try {
    await g.next();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('fetchChunks') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > nested async generators preserve inner name',
    source: `async () => {
        async function* innerGen() {
          await Promise.resolve();
          throw new Error('inner async fail');
        }
        async function* outerGen() {
          for await (const val of innerGen()) {
            yield val;
          }
        }
        try {
          for await (const _val of outerGen()) {
            // consume
          }
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('innerGen') >= 0).toBe(true);
        }
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function innerGen() {
    return _innerGen.apply(this, arguments);
  }
  function _innerGen() {
    _innerGen = _wrapAsyncGenerator(function* () {
      yield _awaitAsyncGenerator(Promise.resolve());
      throw new Error('inner async fail');
    });
    return _innerGen.apply(this, arguments);
  }
  function outerGen() {
    return _outerGen.apply(this, arguments);
  }
  function _outerGen() {
    _outerGen = _wrapAsyncGenerator(function* () {
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = _asyncIterator(innerGen()), _step;
          (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
            .done);
          _iteratorAbruptCompletion = false
        ) {
          const val = _step.value;
          {
            yield val;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            yield _awaitAsyncGenerator(_iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
    return _outerGen.apply(this, arguments);
  }
  try {
    var _iteratorAbruptCompletion2 = false;
    var _didIteratorError2 = false;
    var _iteratorError2;
    try {
      for (
        var _iterator2 = _asyncIterator(outerGen()), _step2;
        (_iteratorAbruptCompletion2 = !(_step2 = _iteratorResult(await _iterator2.next())).done);
        _iteratorAbruptCompletion2 = false
      ) {
        const _val = _step2.value;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion2 && _iterator2.return != null) {
          _iteratorResult(await _iterator2.return());
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('innerGen') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > for-of error in loop body has correct stack',
    source: `() => {
        function thrower() {
          throw new Error('loop body error');
        }
        try {
          for (const x of [1, 2, 3]) {
            if (x === 2) thrower();
          }
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('thrower') >= 0).toBe(true);
        }
      }`,
    output: `() => {
  function thrower() {
    throw new Error('loop body error');
  }
  try {
    for (const x of [1, 2, 3]) {
      if (x === 2) thrower();
    }
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('thrower') >= 0).toBe(true);
  }
};`,
  },
  {
    title: 'stack traces > re-thrown error from async generator preserves original stack',
    source: `async () => {
        async function* originalGen() {
          throw new Error('original gen error');
        }
        async function consumer() {
          try {
            for await (const _val of originalGen()) {
              // consume
            }
          } catch (e) {
            throw e;
          }
        }
        try {
          await consumer();
        } catch (e) {
          const stack = e.stack || '';
          expect(stack.indexOf('originalGen') >= 0).toBe(true);
        }
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function originalGen() {
    return _originalGen.apply(this, arguments);
  }
  function _originalGen() {
    _originalGen = _wrapAsyncGenerator(function* () {
      throw new Error('original gen error');
    });
    return _originalGen.apply(this, arguments);
  }
  async function consumer() {
    try {
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = _asyncIterator(originalGen()), _step;
          (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
          _iteratorAbruptCompletion = false
        ) {
          const _val = _step.value;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            _iteratorResult(await _iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }
  try {
    await consumer();
  } catch (e) {
    const stack = e.stack || '';
    expect(stack.indexOf('originalGen') >= 0).toBe(true);
  }
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > async generator with destructured object param yields binding',
    source: `async () => {
        async function* gen({ b }) {
          yield b;
          yield b + 1;
        }
        const g = gen({ b: 41 });
        expect(await g.next()).toEqual({ value: 41, done: false });
        expect(await g.next()).toEqual({ value: 42, done: false });
        expect((await g.next()).done).toBe(true);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen(_x) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* ({ b }) {
      yield b;
      yield b + 1;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen({ b: 41 });
  expect(await g.next()).toEqual({
    value: 41,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 42,
    done: false,
  });
  expect((await g.next()).done).toBe(true);
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > async generator with destructured array param',
    source: `async () => {
        async function* gen([a, b]) {
          yield a;
          yield b;
        }
        const g = gen([1, 2]);
        expect(await g.next()).toEqual({ value: 1, done: false });
        expect(await g.next()).toEqual({ value: 2, done: false });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen(_x) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* ([a, b]) {
      yield a;
      yield b;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen([1, 2]);
  expect(await g.next()).toEqual({
    value: 1,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 2,
    done: false,
  });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > async generator with destructured param + internal await',
    source: `async () => {
        async function* gen({ b }) {
          const v = await Promise.resolve(b);
          yield v;
          return v + 1;
        }
        const g = gen({ b: 41 });
        expect(await g.next()).toEqual({ value: 41, done: false });
        expect(await g.next()).toEqual({ value: 42, done: true });
      }`,
    output: `var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen(_x) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* ({ b }) {
      const v = yield _awaitAsyncGenerator(Promise.resolve(b));
      yield v;
      return v + 1;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen({ b: 41 });
  expect(await g.next()).toEqual({
    value: 41,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 42,
    done: true,
  });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > async generator with destructured param iterates via for-await-of',
    source: `async () => {
        async function* gen({ b }) {
          yield b;
          yield b + 1;
        }
        const collected = [];
        for await (const v of gen({ b: 10 })) {
          collected.push(v);
        }
        expect(collected).toEqual([10, 11]);
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  function gen(_x) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* ({ b }) {
      yield b;
      yield b + 1;
    });
    return _gen.apply(this, arguments);
  }
  const collected = [];
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = _asyncIterator(gen({ b: 10 })), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const v = _step.value;
      {
        collected.push(v);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  expect(collected).toEqual([10, 11]);
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > class async generator method with destructured param',
    source: `async () => {
        class C {
          async *gen({ b }) {
            yield b;
            return b + 1;
          }
        }
        const g = new C().gen({ b: 41 });
        expect(await g.next()).toEqual({ value: 41, done: false });
        expect(await g.next()).toEqual({ value: 42, done: true });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  class C {
    gen(_x) {
      return _wrapAsyncGenerator(function* ({ b }) {
        yield b;
        return b + 1;
      }).apply(this, arguments);
    }
  }
  const g = new C().gen({ b: 41 });
  expect(await g.next()).toEqual({
    value: 41,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 42,
    done: true,
  });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > object shorthand async generator method with destructured param',
    source: `async () => {
        const o = {
          async *gen({ b }) {
            yield b;
            return b + 1;
          },
        };
        const g = o.gen({ b: 41 });
        expect(await g.next()).toEqual({ value: 41, done: false });
        expect(await g.next()).toEqual({ value: 42, done: true });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  const o = {
    gen(_x) {
      return _wrapAsyncGenerator(function* ({ b }) {
        yield b;
        return b + 1;
      }).apply(this, arguments);
    },
  };
  const g = o.gen({ b: 41 });
  expect(await g.next()).toEqual({
    value: 41,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 42,
    done: true,
  });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > sync generator with destructured object param yields binding',
    source: `() => {
        function* gen({ b }) {
          yield b;
          return b + 1;
        }
        const g = gen({ b: 41 });
        expect(g.next()).toEqual({ value: 41, done: false });
        expect(g.next()).toEqual({ value: 42, done: true });
      }`,
    output: `() => {
  function* gen({ b }) {
    yield b;
    return b + 1;
  }
  const g = gen({ b: 41 });
  expect(g.next()).toEqual({ value: 41, done: false });
  expect(g.next()).toEqual({ value: 42, done: true });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > control: async generator with plain params',
    source: `async () => {
        async function* gen(a, b) {
          yield a;
          yield b;
        }
        const g = gen(1, 2);
        expect(await g.next()).toEqual({ value: 1, done: false });
        expect(await g.next()).toEqual({ value: 2, done: false });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen(_x, _x2) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* (a, b) {
      yield a;
      yield b;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen(1, 2);
  expect(await g.next()).toEqual({
    value: 1,
    done: false,
  });
  expect(await g.next()).toEqual({
    value: 2,
    done: false,
  });
};`,
  },
  {
    title:
      'destructuring + state lifting (generators) > control: async generator destructure in body (not in params)',
    source: `async () => {
        async function* gen(x) {
          const { b } = x;
          yield b;
        }
        const g = gen({ b: 42 });
        expect(await g.next()).toEqual({ value: 42, done: false });
      }`,
    output: `var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
async () => {
  function gen(_x) {
    return _gen.apply(this, arguments);
  }
  function _gen() {
    _gen = _wrapAsyncGenerator(function* (x) {
      const { b } = x;
      yield b;
    });
    return _gen.apply(this, arguments);
  }
  const g = gen({ b: 42 });
  expect(await g.next()).toEqual({
    value: 42,
    done: false,
  });
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
