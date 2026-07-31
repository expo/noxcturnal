// Generated from apps/test-suite/tests/JSAsyncGenerator.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Async Generator > sync generators > basic generator yields values', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        const g = gen();\n        expect(g.next()).toEqual({ value: 1, done: false });\n        expect(g.next()).toEqual({ value: 2, done: false });\n        expect(g.next()).toEqual({ value: 3, done: false });\n        expect(g.next()).toEqual({ value: undefined, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('002 JS Async Generator > sync generators > generator with return value', async () => {
  const source =
    "() => {\n        function* gen() {\n          yield 1;\n          return 'done';\n        }\n        const g = gen();\n        expect(g.next()).toEqual({ value: 1, done: false });\n        expect(g.next()).toEqual({ value: 'done', done: true });\n        expect(g.next()).toEqual({ value: undefined, done: true });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        yield 1;
        return 'done';
      }
      const g = gen();
      expect(g.next()).toEqual({ value: 1, done: false });
      expect(g.next()).toEqual({ value: 'done', done: true });
      expect(g.next()).toEqual({ value: undefined, done: true });
    };"
  `);
});

test('003 JS Async Generator > sync generators > generator with try-catch and no throw', async () => {
  const source =
    '() => {\n        function* foobar() {\n          try {\n            yield 1;\n          } catch {\n            return false;\n          }\n        }\n        const gen = foobar();\n        expect(gen.next().value).toBe(1);\n        expect(gen.next().value).toBeUndefined();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('004 JS Async Generator > sync generators > generator with try-finally and early return', async () => {
  const source =
    '() => {\n        function* gen() {\n          try {\n            return;\n          } finally {\n            // noop\n          }\n        }\n        expect(gen().next()).toEqual({ done: true, value: undefined });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        try {
          return;
        } finally {
          // noop
        }
      }
      expect(gen().next()).toEqual({ done: true, value: undefined });
    };"
  `);
});

test('005 JS Async Generator > sync generators > generator with switch-default-break', async () => {
  const source =
    "() => {\n        function* gen(type) {\n          switch (type) {\n            default:\n              break;\n          }\n        }\n        expect(gen(1).next().done).toBe(true);\n\n        function* gen2(type) {\n          switch (type) {\n            case 0:\n              throw 'unreachable';\n            default:\n              break;\n          }\n        }\n        expect(gen2(1).next().done).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('006 JS Async Generator > sync generators > generator with default parameters', async () => {
  const source =
    "() => {\n        function* foo(bar = 'bar') {\n          return bar;\n        }\n        expect(foo().next().value).toBe('bar');\n        expect(foo('foo').next().value).toBe('foo');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* foo(bar = 'bar') {
        return bar;
      }
      expect(foo().next().value).toBe('bar');
      expect(foo('foo').next().value).toBe('foo');
    };"
  `);
});

test('007 JS Async Generator > sync generators > generator with destructured parameters', async () => {
  const source =
    "() => {\n        function* foo({ bar }) {\n          return bar;\n        }\n        expect(foo({ bar: 'bar' }).next().value).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* foo({ bar }) {
        return bar;
      }
      expect(foo({ bar: 'bar' }).next().value).toBe('bar');
    };"
  `);
});

test('008 JS Async Generator > sync generators > generator with rest parameters', async () => {
  const source =
    '() => {\n        function* foo(...items) {\n          return items;\n        }\n        expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* foo(...items) {
        return items;
      }
      expect(foo(1, 2, 3).next().value).toEqual([1, 2, 3]);
    };"
  `);
});

test('009 JS Async Generator > sync generators > generator with throw()', async () => {
  const source =
    "() => {\n        function* gen() {\n          try {\n            yield 1;\n            yield 2;\n          } catch (e) {\n            yield 'caught: ' + e.message;\n          }\n        }\n        const g = gen();\n        expect(g.next()).toEqual({ value: 1, done: false });\n        expect(g.throw(new Error('test'))).toEqual({ value: 'caught: test', done: false });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('010 JS Async Generator > sync generators > generator with return()', async () => {
  const source =
    "() => {\n        function* gen() {\n          try {\n            yield 1;\n            yield 2;\n          } finally {\n            yield 'cleanup';\n          }\n        }\n        const g = gen();\n        expect(g.next()).toEqual({ value: 1, done: false });\n        expect(g.return('early')).toEqual({ value: 'cleanup', done: false });\n        expect(g.next()).toEqual({ value: 'early', done: true });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('011 JS Async Generator > sync generators > yield* delegation to another generator', async () => {
  const source =
    "() => {\n        function* inner() {\n          yield 'a';\n          yield 'b';\n        }\n        function* outer() {\n          yield 1;\n          yield* inner();\n          yield 2;\n        }\n        expect([...outer()]).toEqual([1, 'a', 'b', 2]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('012 JS Async Generator > sync generators > yield* delegation to array', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield* [10, 20, 30];\n        }\n        expect([...gen()]).toEqual([10, 20, 30]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        yield* [10, 20, 30];
      }
      expect([...gen()]).toEqual([10, 20, 30]);
    };"
  `);
});

test('013 JS Async Generator > sync generators > yield* with iterable that has no return method', async () => {
  const source =
    '() => {\n        function* inner() {\n          yield 1;\n          yield 2;\n        }\n        function* outer() {\n          const result = yield* inner();\n          yield result;\n        }\n        const g = outer();\n        expect(g.next()).toEqual({ value: 1, done: false });\n        expect(g.next()).toEqual({ value: 2, done: false });\n        expect(g.next()).toEqual({ value: undefined, done: false });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('014 JS Async Generator > sync generators > generator used in spread', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        expect([...gen()]).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      expect([...gen()]).toEqual([1, 2, 3]);
    };"
  `);
});

test('015 JS Async Generator > sync generators > generator used in destructuring', async () => {
  const source =
    "() => {\n        function* gen() {\n          yield 'a';\n          yield 'b';\n          yield 'c';\n        }\n        const [x, y, z] = gen();\n        expect(x).toBe('a');\n        expect(y).toBe('b');\n        expect(z).toBe('c');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        yield 'a';
        yield 'b';
        yield 'c';
      }
      const [x, y, z] = gen();
      expect(x).toBe('a');
      expect(y).toBe('b');
      expect(z).toBe('c');
    };"
  `);
});

test('016 JS Async Generator > sync generators > generator with complex control flow', async () => {
  const source =
    '() => {\n        function* gen(n) {\n          for (let i = 0; i < n; i++) {\n            if (i % 2 === 0) {\n              yield i;\n            }\n          }\n        }\n        expect([...gen(6)]).toEqual([0, 2, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen(n) {
        for (let i = 0; i < n; i++) {
          if (i % 2 === 0) {
            yield i;
          }
        }
      }
      expect([...gen(6)]).toEqual([0, 2, 4]);
    };"
  `);
});

test('017 JS Async Generator > sync generators > nested generators with yield*', async () => {
  const source =
    '() => {\n        function* a() {\n          yield 1;\n        }\n        function* b() {\n          yield* a();\n          yield 2;\n        }\n        function* c() {\n          yield* b();\n          yield 3;\n        }\n        expect([...c()]).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('018 JS Async Generator > sync generators > generator passing values via next()', async () => {
  const source =
    "() => {\n        function* gen() {\n          const a = yield 'first';\n          const b = yield 'second';\n          return a + b;\n        }\n        const g = gen();\n        expect(g.next().value).toBe('first');\n        expect(g.next(10).value).toBe('second');\n        expect(g.next(32).value).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        const a = yield 'first';
        const b = yield 'second';
        return a + b;
      }
      const g = gen();
      expect(g.next().value).toBe('first');
      expect(g.next(10).value).toBe('second');
      expect(g.next(32).value).toBe(42);
    };"
  `);
});

test('019 JS Async Generator > sync generators > infinite generator with break', async () => {
  const source =
    '() => {\n        function* counter() {\n          let i = 0;\n          while (true) {\n            yield i++;\n          }\n        }\n        const results = [];\n        for (const n of counter()) {\n          results.push(n);\n          if (n >= 4) break;\n        }\n        expect(results).toEqual([0, 1, 2, 3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('020 JS Async Generator > for-of iteration > for-of with array', async () => {
  const source =
    '() => {\n        var arr = [1, 2, 3];\n        var res = [];\n        for (const x of arr) res.push(x);\n        expect(res).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var arr = [1, 2, 3];
      var res = [];
      for (const x of arr) res.push(x);
      expect(res).toEqual([1, 2, 3]);
    };"
  `);
});

test('021 JS Async Generator > for-of iteration > for-of with array and break', async () => {
  const source =
    '() => {\n        var arr = [1, 2, 3];\n        var res = [];\n        for (const x of arr) {\n          if (x === 2) break;\n          res.push(x);\n        }\n        expect(res).toEqual([1]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var arr = [1, 2, 3];
      var res = [];
      for (const x of arr) {
        if (x === 2) break;
        res.push(x);
      }
      expect(res).toEqual([1]);
    };"
  `);
});

test('022 JS Async Generator > for-of iteration > for-of with array and continue', async () => {
  const source =
    '() => {\n        var arr = [1, 2, 3];\n        var res = [];\n        for (const x of arr) {\n          if (x === 2) continue;\n          res.push(x);\n        }\n        expect(res).toEqual([1, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var arr = [1, 2, 3];
      var res = [];
      for (const x of arr) {
        if (x === 2) continue;
        res.push(x);
      }
      expect(res).toEqual([1, 3]);
    };"
  `);
});

test('023 JS Async Generator > for-of iteration > for-of with generator', async () => {
  const source =
    '() => {\n        function* f() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        var res = [];\n        for (const x of f()) res.push(x);\n        expect(res).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* f() {
        yield 1;
        yield 2;
        yield 3;
      }
      var res = [];
      for (const x of f()) res.push(x);
      expect(res).toEqual([1, 2, 3]);
    };"
  `);
});

test('024 JS Async Generator > for-of iteration > for-of with generator and break', async () => {
  const source =
    '() => {\n        function* f() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        var res = [];\n        for (const x of f()) {\n          if (x === 2) break;\n          res.push(x);\n        }\n        expect(res).toEqual([1]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('025 JS Async Generator > for-of iteration > for-of with generator and continue', async () => {
  const source =
    '() => {\n        function* f() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        var res = [];\n        for (const x of f()) {\n          if (x === 2) continue;\n          res.push(x);\n        }\n        expect(res).toEqual([1, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('026 JS Async Generator > for-of iteration > for-of with string', async () => {
  const source =
    "() => {\n        var res = [];\n        for (const ch of 'abc') res.push(ch);\n        expect(res).toEqual(['a', 'b', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var res = [];
      for (const ch of 'abc') res.push(ch);
      expect(res).toEqual(['a', 'b', 'c']);
    };"
  `);
});

test('027 JS Async Generator > for-of iteration > for-of with Set', async () => {
  const source =
    '() => {\n        var res = [];\n        for (const x of new Set([1, 2, 3])) res.push(x);\n        expect(res).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var res = [];
      for (const x of new Set([1, 2, 3])) res.push(x);
      expect(res).toEqual([1, 2, 3]);
    };"
  `);
});

test('028 JS Async Generator > for-of iteration > for-of with Map', async () => {
  const source =
    "() => {\n        var res = [];\n        for (const [k, v] of new Map([\n          ['a', 1],\n          ['b', 2],\n        ])) {\n          res.push(k + ':' + v);\n        }\n        expect(res).toEqual(['a:1', 'b:2']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var res = [];
      for (const [k, v] of new Map([
        ['a', 1],
        ['b', 2],
      ])) {
        res.push(k + ':' + v);
      }
      expect(res).toEqual(['a:1', 'b:2']);
    };"
  `);
});

test('029 JS Async Generator > for-of iteration > for-of with custom iterable', async () => {
  const source =
    '() => {\n        const iterable = {\n          [Symbol.iterator]() {\n            let i = 0;\n            return {\n              next() {\n                if (i < 3) return { value: i++, done: false };\n                return { value: undefined, done: true };\n              },\n            };\n          },\n        };\n        var res = [];\n        for (const x of iterable) res.push(x);\n        expect(res).toEqual([0, 1, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('030 [upstream xit] JS Async Generator > for-of iteration > for-of calls return() on iterator when break occurs', async () => {
  const source =
    '() => {\n        let returnCalled = false;\n        const iterable = {\n          [Symbol.iterator]() {\n            let i = 0;\n            return {\n              next() {\n                return { value: i++, done: false };\n              },\n              return() {\n                returnCalled = true;\n                return { value: undefined, done: true };\n              },\n            };\n          },\n        };\n        for (const x of iterable) {\n          if (x === 2) break;\n        }\n        expect(returnCalled).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('031 [upstream xit] JS Async Generator > for-of iteration > for-of calls return() on iterator when exception is thrown', async () => {
  const source =
    "() => {\n        let returnCalled = false;\n        const iterable = {\n          [Symbol.iterator]() {\n            let i = 0;\n            return {\n              next() {\n                return { value: i++, done: false };\n              },\n              return() {\n                returnCalled = true;\n                return { value: undefined, done: true };\n              },\n            };\n          },\n        };\n        try {\n          for (const x of iterable) {\n            if (x === 1) throw new Error('bail');\n          }\n        } catch (e) {}\n        expect(returnCalled).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('032 JS Async Generator > for-of iteration > for-of with let creates per-iteration binding', async () => {
  const source =
    '() => {\n        const funcs = [];\n        for (let x of [0, 1, 2]) {\n          funcs.push(() => x);\n        }\n        expect(funcs[0]()).toBe(0);\n        expect(funcs[1]()).toBe(1);\n        expect(funcs[2]()).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const funcs = [];
      for (let x of [0, 1, 2]) {
        funcs.push(() => x);
      }
      expect(funcs[0]()).toBe(0);
      expect(funcs[1]()).toBe(1);
      expect(funcs[2]()).toBe(2);
    };"
  `);
});

test('033 JS Async Generator > for-of iteration > for-of with destructuring', async () => {
  const source =
    "() => {\n        const pairs = [\n          [1, 'a'],\n          [2, 'b'],\n          [3, 'c'],\n        ];\n        var nums = [];\n        var strs = [];\n        for (const [n, s] of pairs) {\n          nums.push(n);\n          strs.push(s);\n        }\n        expect(nums).toEqual([1, 2, 3]);\n        expect(strs).toEqual(['a', 'b', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('034 JS Async Generator > for-of iteration > for-of with arguments object', async () => {
  const source =
    '() => {\n        function getArgs() {\n          return arguments;\n        }\n        var args = getArgs(1, 2, 3);\n        var res = [];\n        for (const x of args) res.push(x);\n        expect(res).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function getArgs() {
        return arguments;
      }
      var args = getArgs(1, 2, 3);
      var res = [];
      for (const x of args) res.push(x);
      expect(res).toEqual([1, 2, 3]);
    };"
  `);
});

test('035 JS Async Generator > async generators > basic async generator yields resolved values', async () => {
  const source =
    "async () => {\n        async function* gen() {\n          yield await Promise.resolve('foo');\n          yield await Promise.resolve('bar');\n          yield await Promise.resolve('baz');\n        }\n        const g = gen();\n        expect(await g.next()).toEqual({ value: 'foo', done: false });\n        expect(await g.next()).toEqual({ value: 'bar', done: false });\n        expect(await g.next()).toEqual({ value: 'baz', done: false });\n        expect(await g.next()).toEqual({ value: undefined, done: true });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('036 JS Async Generator > async generators > async generator execution order with delays', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* gen() {\n          log.push('a');\n          yield Promise.resolve();\n          log.push('b');\n          yield Promise.resolve();\n          log.push('c');\n        }\n        const g = gen();\n        await g.next();\n        await g.next();\n        await g.next();\n        expect(log).toEqual(['a', 'b', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('037 JS Async Generator > async generators > async generator with return value', async () => {
  const source =
    "async () => {\n        async function* gen() {\n          yield 1;\n          yield 2;\n          return 'done';\n        }\n        const g = gen();\n        expect(await g.next()).toEqual({ value: 1, done: false });\n        expect(await g.next()).toEqual({ value: 2, done: false });\n        expect(await g.next()).toEqual({ value: 'done', done: true });\n        expect(await g.next()).toEqual({ value: undefined, done: true });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('038 JS Async Generator > async generators > async generator with throw()', async () => {
  const source =
    "async () => {\n        async function* gen() {\n          try {\n            yield 1;\n            yield 2;\n          } catch (e) {\n            yield 'caught: ' + e.message;\n          }\n        }\n        const g = gen();\n        expect(await g.next()).toEqual({ value: 1, done: false });\n        const result = await g.throw(new Error('test'));\n        expect(result).toEqual({ value: 'caught: test', done: false });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('039 JS Async Generator > async generators > async generator with return() for cleanup', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* gen() {\n          try {\n            log.push('start');\n            yield 1;\n            log.push('after yield 1');\n            yield 2;\n          } finally {\n            log.push('cleanup');\n          }\n        }\n        const g = gen();\n        await g.next();\n        await g.return();\n        expect(log).toEqual(['start', 'cleanup']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('040 JS Async Generator > async generators > async generator passing values via next()', async () => {
  const source =
    "async () => {\n        async function* gen() {\n          const a = yield 'first';\n          const b = yield 'second';\n          return a + b;\n        }\n        const g = gen();\n        expect((await g.next()).value).toBe('first');\n        expect((await g.next(10)).value).toBe('second');\n        expect((await g.next(32)).value).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('041 JS Async Generator > async generators > async generator with try-finally', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* gen() {\n          try {\n            yield 1;\n            yield 2;\n          } finally {\n            log.push('finally');\n          }\n        }\n        const g = gen();\n        await g.next();\n        await g.next();\n        await g.next();\n        expect(log).toEqual(['finally']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('042 JS Async Generator > async generators > async generator with nested await', async () => {
  const source =
    'async () => {\n        async function fetchVal(x) {\n          return Promise.resolve(x * 2);\n        }\n        async function* gen() {\n          yield await fetchVal(1);\n          yield await fetchVal(2);\n          yield await fetchVal(3);\n        }\n        const results = [];\n        const g = gen();\n        let r = await g.next();\n        while (!r.done) {\n          results.push(r.value);\n          r = await g.next();\n        }\n        expect(results).toEqual([2, 4, 6]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('043 JS Async Generator > async generators > async generator expression', async () => {
  const source =
    'async () => {\n        const gen = async function* () {\n          yield 1;\n          yield 2;\n        };\n        const g = gen();\n        expect(await g.next()).toEqual({ value: 1, done: false });\n        expect(await g.next()).toEqual({ value: 2, done: false });\n        expect(await g.next()).toEqual({ value: undefined, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('044 JS Async Generator > async generators > async generator as class method', async () => {
  const source =
    "async () => {\n        class Foo {\n          async *items() {\n            yield 'a';\n            yield 'b';\n          }\n        }\n        const results = [];\n        for await (const val of new Foo().items()) {\n          results.push(val);\n        }\n        expect(results).toEqual(['a', 'b']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('045 JS Async Generator > for-await-of > for-await-of with async generator (cumulative sum)', async () => {
  const source =
    'async () => {\n        async function* genAnswers() {\n          var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];\n          var total = 0;\n          for await (let val of stream) {\n            total += await val;\n            yield total;\n          }\n        }\n        const results = [];\n        for await (const val of genAnswers()) {\n          results.push(val);\n        }\n        expect(results).toEqual([4, 13, 25]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('046 JS Async Generator > for-await-of > for-await-of with array of promises', async () => {
  const source =
    'async () => {\n        const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];\n        const results = [];\n        for await (const val of promises) {\n          results.push(val);\n        }\n        expect(results).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('047 JS Async Generator > for-await-of > for-await-of with custom async iterable', async () => {
  const source =
    'async () => {\n        const iterable = {\n          [Symbol.asyncIterator]() {\n            let i = 0;\n            return {\n              next() {\n                if (i < 3) return Promise.resolve({ value: i++, done: false });\n                return Promise.resolve({ value: undefined, done: true });\n              },\n            };\n          },\n        };\n        const results = [];\n        for await (const val of iterable) {\n          results.push(val);\n        }\n        expect(results).toEqual([0, 1, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('048 JS Async Generator > for-await-of > for-await-of with break', async () => {
  const source =
    'async () => {\n        async function* gen() {\n          yield 1;\n          yield 2;\n          yield 3;\n          yield 4;\n          yield 5;\n        }\n        const results = [];\n        for await (const val of gen()) {\n          results.push(val);\n          if (val === 3) break;\n        }\n        expect(results).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('049 JS Async Generator > for-await-of > for-await-of with error in iterable', async () => {
  const source =
    "async () => {\n        async function* gen() {\n          yield 1;\n          throw new Error('gen error');\n        }\n        const results = [];\n        try {\n          for await (const val of gen()) {\n            results.push(val);\n          }\n        } catch (e) {\n          results.push('error: ' + e.message);\n        }\n        expect(results).toEqual([1, 'error: gen error']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('050 JS Async Generator > for-await-of > for-await-of does not access value when done', async () => {
  const source =
    'async () => {\n        let gotValue = false;\n        const iterable = {\n          [Symbol.asyncIterator]() {\n            return {\n              next: () =>\n                Promise.resolve({\n                  get value() {\n                    gotValue = true;\n                  },\n                  done: true,\n                }),\n            };\n          },\n        };\n        for await (let value of iterable) {\n        }\n        expect(gotValue).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('051 JS Async Generator > for-await-of > for-await-of with member expression as LHS', async () => {
  const source =
    'async () => {\n        let obj = {};\n        for await (obj.x of [1, 2]) {\n        }\n        expect(obj.x).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('052 JS Async Generator > for-await-of > for-await-of allows re-declaration of let in body', async () => {
  const source =
    'async () => {\n        // Should not throw a SyntaxError\n        for await (let x of []) {\n          let x;\n        }\n        expect(true).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('053 JS Async Generator > for-await-of > for-await-of with destructuring', async () => {
  const source =
    'async () => {\n        async function* gen() {\n          yield { a: 1, b: 2 };\n          yield { a: 3, b: 4 };\n        }\n        const results = [];\n        for await (const { a, b } of gen()) {\n          results.push(a + b);\n        }\n        expect(results).toEqual([3, 7]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('054 JS Async Generator > for-await-of > for-await-of with sync iterable (fallback)', async () => {
  const source =
    'async () => {\n        // for-await-of should work with sync iterables too\n        const results = [];\n        for await (const val of [10, 20, 30]) {\n          results.push(val);\n        }\n        expect(results).toEqual([10, 20, 30]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('055 JS Async Generator > async generator yield* delegation > yield* delegation with early return()', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* inner() {\n          log.push(1);\n          yield 'a';\n          log.push(2);\n          yield 'b';\n          log.push(3);\n        }\n        async function* outer() {\n          log.push(4);\n          yield* inner();\n          log.push(5);\n        }\n        const iter = outer();\n        const res = await iter.next();\n        expect(res).toEqual({ value: 'a', done: false });\n        expect(log).toEqual([4, 1]);\n\n        await iter.return();\n        expect(log).toEqual([4, 1]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('056 JS Async Generator > async generator yield* delegation > yield* delegation with throw() caught by inner', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* inner() {\n          try {\n            log.push(1);\n            yield 'a';\n            log.push(2);\n          } catch (e) {\n            log.push(3);\n            yield 'caught';\n            log.push(4);\n          }\n        }\n        async function* outer() {\n          log.push(5);\n          yield* inner();\n          log.push(6);\n        }\n        const iter = outer();\n        await iter.next();\n        expect(log).toEqual([5, 1]);\n\n        const res = await iter.throw(new Error('TEST'));\n        expect(res).toEqual({ value: 'caught', done: false });\n        expect(log).toEqual([5, 1, 3]);\n\n        await iter.next();\n        expect(log).toEqual([5, 1, 3, 4, 6]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('057 JS Async Generator > async generator yield* delegation > yield* from sync iterable in async generator', async () => {
  const source =
    "async () => {\n        async function* fn() {\n          yield* [Promise.resolve('ok')];\n        }\n        const result = await fn().next();\n        expect(result.done).toBe(false);\n        // CreateAsyncFromSyncIterator awaits the yielded promise,\n        // so the value is the resolved string, not the Promise itself.\n        expect(result.value).toBe('ok');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('058 JS Async Generator > async generator yield* delegation > yield* early return does not execute rest of inner', async () => {
  const source =
    "async () => {\n        const log = [];\n        async function* func1() {\n          log.push(1);\n          yield 'a';\n          log.push(2);\n        }\n        async function* func2() {\n          yield* func1();\n          log.push(3);\n        }\n        const iter = func2();\n        await iter.next();\n        await iter.return();\n        expect(log).toEqual([1]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('059 JS Async Generator > async generator yield* delegation > yield* delegation with async inner values', async () => {
  const source =
    'async () => {\n        async function* inner() {\n          yield await Promise.resolve(10);\n          yield await Promise.resolve(20);\n        }\n        async function* outer() {\n          yield 1;\n          yield* inner();\n          yield 2;\n        }\n        const results = [];\n        for await (const val of outer()) {\n          results.push(val);\n        }\n        expect(results).toEqual([1, 10, 20, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('060 JS Async Generator > async generator yield* delegation > yield* nested three levels deep', async () => {
  const source =
    "async () => {\n        async function* a() {\n          yield 'a';\n        }\n        async function* b() {\n          yield* a();\n          yield 'b';\n        }\n        async function* c() {\n          yield* b();\n          yield 'c';\n        }\n        const results = [];\n        for await (const val of c()) {\n          results.push(val);\n        }\n        expect(results).toEqual(['a', 'b', 'c']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('061 JS Async Generator > edge cases > generator with labeled loop and break', async () => {
  const source =
    '() => {\n        function* gen() {\n          outer: for (let i = 0; i < 3; i++) {\n            for (let j = 0; j < 3; j++) {\n              if (j === 1) continue outer;\n              yield [i, j];\n            }\n          }\n        }\n        expect([...gen()]).toEqual([\n          [0, 0],\n          [1, 0],\n          [2, 0],\n        ]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('062 JS Async Generator > edge cases > async generator with for-of inside', async () => {
  const source =
    'async () => {\n        async function* gen() {\n          for (const x of [1, 2, 3]) {\n            yield await Promise.resolve(x * 10);\n          }\n        }\n        const results = [];\n        for await (const val of gen()) {\n          results.push(val);\n        }\n        expect(results).toEqual([10, 20, 30]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('063 JS Async Generator > edge cases > async generator with for-await-of inside', async () => {
  const source =
    'async () => {\n        async function* gen() {\n          for await (const x of [Promise.resolve(1), Promise.resolve(2)]) {\n            yield x * 10;\n          }\n        }\n        const results = [];\n        for await (const val of gen()) {\n          results.push(val);\n        }\n        expect(results).toEqual([10, 20]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _asyncIterator = require('@babel/runtime/helpers/asyncIterator');
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
    };"
  `);
});

test('064 JS Async Generator > edge cases > for-of with empty iterable', async () => {
  const source =
    '() => {\n        var count = 0;\n        for (const x of []) {\n          count++;\n        }\n        expect(count).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var count = 0;
      for (const x of []) {
        count++;
      }
      expect(count).toBe(0);
    };"
  `);
});

test('065 JS Async Generator > edge cases > for-await-of with empty async iterable', async () => {
  const source =
    'async () => {\n        async function* empty() {}\n        var count = 0;\n        for await (const x of empty()) {\n          count++;\n        }\n        expect(count).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('066 JS Async Generator > edge cases > generator function length property', async () => {
  const source =
    '() => {\n        function* gen(a, b, c) {}\n        expect(gen.length).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen(a, b, c) {}
      expect(gen.length).toBe(3);
    };"
  `);
});

test('067 JS Async Generator > edge cases > generator is iterable (Symbol.iterator)', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield 1;\n        }\n        const g = gen();\n        expect(g[Symbol.iterator]() === g).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen() {
        yield 1;
      }
      const g = gen();
      expect(g[Symbol.iterator]() === g).toBe(true);
    };"
  `);
});

test('068 JS Async Generator > edge cases > async generator is async iterable (Symbol.asyncIterator)', async () => {
  const source =
    '() => {\n        async function* gen() {\n          yield 1;\n        }\n        const g = gen();\n        expect(g[Symbol.asyncIterator]() === g).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('069 JS Async Generator > edge cases > for-of with TypedArray', async () => {
  const source =
    '() => {\n        var res = [];\n        for (const x of new Uint8Array([10, 20, 30])) {\n          res.push(x);\n        }\n        expect(res).toEqual([10, 20, 30]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var res = [];
      for (const x of new Uint8Array([10, 20, 30])) {
        res.push(x);
      }
      expect(res).toEqual([10, 20, 30]);
    };"
  `);
});

test('070 JS Async Generator > edge cases > async generator with Promise.all inside', async () => {
  const source =
    'async () => {\n        async function* gen() {\n          const [a, b, c] = await Promise.all([\n            Promise.resolve(1),\n            Promise.resolve(2),\n            Promise.resolve(3),\n          ]);\n          yield a;\n          yield b;\n          yield c;\n        }\n        const results = [];\n        for await (const val of gen()) {\n          results.push(val);\n        }\n        expect(results).toEqual([1, 2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('071 JS Async Generator > stack traces > error thrown inside sync generator includes function name', async () => {
  const source =
    "() => {\n        function* failingGen() {\n          throw new Error('gen error');\n        }\n        const g = failingGen();\n        try {\n          g.next();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('failingGen') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('072 JS Async Generator > stack traces > generator throw() preserves caller stack', async () => {
  const source =
    "() => {\n        function* myGen() {\n          try {\n            yield 1;\n          } catch (e) {\n            throw e;\n          }\n        }\n        const g = myGen();\n        g.next();\n        try {\n          g.throw(new Error('injected'));\n        } catch (e) {\n          expect(e.message).toBe('injected');\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('073 [upstream xit] JS Async Generator > stack traces > error thrown inside async generator includes function name', async () => {
  const source =
    "async () => {\n        async function* failingAsyncGen() {\n          throw new Error('async gen error');\n        }\n        const g = failingAsyncGen();\n        try {\n          await g.next();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('failingAsyncGen') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('074 [upstream xit] JS Async Generator > stack traces > error after await inside async generator includes function name', async () => {
  const source =
    "async () => {\n        async function* genAfterAwait() {\n          yield 'sentinel';\n          await Promise.resolve();\n          throw new Error('after await');\n        }\n        const g = genAfterAwait();\n        await g.next(); // yields 'sentinel'\n        try {\n          await g.next(); // resumes, awaits, then throws\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('genAfterAwait') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('075 [upstream xit] JS Async Generator > stack traces > error propagates through for-await-of with function name', async () => {
  const source =
    "async () => {\n        async function* explodingGen() {\n          yield 1;\n          throw new Error('mid-iteration');\n        }\n        try {\n          for await (const _val of explodingGen()) {\n            // consume\n          }\n        } catch (e) {\n          expect(e.message).toBe('mid-iteration');\n          const stack = e.stack || '';\n          expect(stack.indexOf('explodingGen') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('076 JS Async Generator > stack traces > error in yield* delegation includes inner generator name', async () => {
  const source =
    "() => {\n        function* inner() {\n          yield 1;\n          throw new Error('inner fail');\n        }\n        function* outer() {\n          yield* inner();\n        }\n        const g = outer();\n        g.next(); // yields 1\n        try {\n          g.next();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('inner') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('077 [upstream xit] JS Async Generator > stack traces > async generator method name in stack', async () => {
  const source =
    "async () => {\n        class DataStream {\n          async *fetchChunks() {\n            throw new Error('stream error');\n          }\n        }\n        const s = new DataStream();\n        const g = s.fetchChunks();\n        try {\n          await g.next();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('fetchChunks') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('078 [upstream xit] JS Async Generator > stack traces > nested async generators preserve inner name', async () => {
  const source =
    "async () => {\n        async function* innerGen() {\n          await Promise.resolve();\n          throw new Error('inner async fail');\n        }\n        async function* outerGen() {\n          for await (const val of innerGen()) {\n            yield val;\n          }\n        }\n        try {\n          for await (const _val of outerGen()) {\n            // consume\n          }\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('innerGen') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('079 JS Async Generator > stack traces > for-of error in loop body has correct stack', async () => {
  const source =
    "() => {\n        function thrower() {\n          throw new Error('loop body error');\n        }\n        try {\n          for (const x of [1, 2, 3]) {\n            if (x === 2) thrower();\n          }\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('thrower') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('080 [upstream xit] JS Async Generator > stack traces > re-thrown error from async generator preserves original stack', async () => {
  const source =
    "async () => {\n        async function* originalGen() {\n          throw new Error('original gen error');\n        }\n        async function consumer() {\n          try {\n            for await (const _val of originalGen()) {\n              // consume\n            }\n          } catch (e) {\n            throw e;\n          }\n        }\n        try {\n          await consumer();\n        } catch (e) {\n          const stack = e.stack || '';\n          expect(stack.indexOf('originalGen') >= 0).toBe(true);\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('081 JS Async Generator > destructuring + state lifting (generators) > async generator with destructured object param yields binding', async () => {
  const source =
    'async () => {\n        async function* gen({ b }) {\n          yield b;\n          yield b + 1;\n        }\n        const g = gen({ b: 41 });\n        expect(await g.next()).toEqual({ value: 41, done: false });\n        expect(await g.next()).toEqual({ value: 42, done: false });\n        expect((await g.next()).done).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('082 JS Async Generator > destructuring + state lifting (generators) > async generator with destructured array param', async () => {
  const source =
    'async () => {\n        async function* gen([a, b]) {\n          yield a;\n          yield b;\n        }\n        const g = gen([1, 2]);\n        expect(await g.next()).toEqual({ value: 1, done: false });\n        expect(await g.next()).toEqual({ value: 2, done: false });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('083 JS Async Generator > destructuring + state lifting (generators) > async generator with destructured param + internal await', async () => {
  const source =
    'async () => {\n        async function* gen({ b }) {\n          const v = await Promise.resolve(b);\n          yield v;\n          return v + 1;\n        }\n        const g = gen({ b: 41 });\n        expect(await g.next()).toEqual({ value: 41, done: false });\n        expect(await g.next()).toEqual({ value: 42, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _awaitAsyncGenerator = require('@babel/runtime/helpers/awaitAsyncGenerator');
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
    };"
  `);
});

test('084 JS Async Generator > destructuring + state lifting (generators) > async generator with destructured param iterates via for-await-of', async () => {
  const source =
    'async () => {\n        async function* gen({ b }) {\n          yield b;\n          yield b + 1;\n        }\n        const collected = [];\n        for await (const v of gen({ b: 10 })) {\n          collected.push(v);\n        }\n        expect(collected).toEqual([10, 11]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('085 JS Async Generator > destructuring + state lifting (generators) > class async generator method with destructured param', async () => {
  const source =
    'async () => {\n        class C {\n          async *gen({ b }) {\n            yield b;\n            return b + 1;\n          }\n        }\n        const g = new C().gen({ b: 41 });\n        expect(await g.next()).toEqual({ value: 41, done: false });\n        expect(await g.next()).toEqual({ value: 42, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
    async () => {
      class C {
        gen({ b }) {
          return _wrapAsyncGenerator(function* () {
            yield b;
            return b + 1;
          })();
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
    };"
  `);
});

test('086 JS Async Generator > destructuring + state lifting (generators) > object shorthand async generator method with destructured param', async () => {
  const source =
    'async () => {\n        const o = {\n          async *gen({ b }) {\n            yield b;\n            return b + 1;\n          },\n        };\n        const g = o.gen({ b: 41 });\n        expect(await g.next()).toEqual({ value: 41, done: false });\n        expect(await g.next()).toEqual({ value: 42, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
    async () => {
      const o = {
        gen({ b }) {
          return _wrapAsyncGenerator(function* () {
            yield b;
            return b + 1;
          })();
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
    };"
  `);
});

test('087 JS Async Generator > destructuring + state lifting (generators) > sync generator with destructured object param yields binding', async () => {
  const source =
    '() => {\n        function* gen({ b }) {\n          yield b;\n          return b + 1;\n        }\n        const g = gen({ b: 41 });\n        expect(g.next()).toEqual({ value: 41, done: false });\n        expect(g.next()).toEqual({ value: 42, done: true });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function* gen({ b }) {
        yield b;
        return b + 1;
      }
      const g = gen({ b: 41 });
      expect(g.next()).toEqual({ value: 41, done: false });
      expect(g.next()).toEqual({ value: 42, done: true });
    };"
  `);
});

test('088 JS Async Generator > destructuring + state lifting (generators) > control: async generator with plain params', async () => {
  const source =
    'async () => {\n        async function* gen(a, b) {\n          yield a;\n          yield b;\n        }\n        const g = gen(1, 2);\n        expect(await g.next()).toEqual({ value: 1, done: false });\n        expect(await g.next()).toEqual({ value: 2, done: false });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});

test('089 JS Async Generator > destructuring + state lifting (generators) > control: async generator destructure in body (not in params)', async () => {
  const source =
    'async () => {\n        async function* gen(x) {\n          const { b } = x;\n          yield b;\n        }\n        const g = gen({ b: 42 });\n        expect(await g.next()).toEqual({ value: 42, done: false });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapAsyncGenerator = require('@babel/runtime/helpers/wrapAsyncGenerator');
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
    };"
  `);
});
