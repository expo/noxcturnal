import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';
import { compile, execute } from './runtime';

// Unlike the transform corpus, these cases execute the output. Check the source
// too so each expected value is independently grounded in JavaScript semantics.
const cases = [
  {
    name: 'nested loop initializer resets on each outer iteration',
    source: `
      const seen = [];
      for (let i = 0; i < 2; i++) {
        for (let value; seen.push(value), value === undefined;) { value = i; }
      }
      globalThis.result = seen;
    `,
    expected: [undefined, 0, undefined, 1],
  },
  {
    name: 'for-in iterable functions have private locals and run once',
    source: `
      const reads = []; let calls = 0;
      for (const key in (function () { calls++; const local = { a: 1, b: 2 }; return local; })()) {
        reads.push(() => key);
      }
      globalThis.result = [reads.map(read => read()), calls, typeof local];
    `,
    expected: [['a', 'b'], 1, 'undefined'],
  },
  {
    name: 'for initializer, test, and update functions keep locals out of loop parameters',
    source: `
      const reads = []; const calls = [];
      for (let i = (() => { const start = 0; calls.push('init'); return start; })();
           (() => { const limit = 2; calls.push('test'); return i < limit; })();
           (() => { const step = 1; calls.push('update'); i += step; })()) {
        reads.push(() => i);
      }
      globalThis.result = [reads.map(read => read()), calls];
    `,
    expected: [
      [0, 1],
      ['init', 'test', 'update', 'test', 'update', 'test'],
    ],
  },
  {
    name: 'while tests retain their own locals beside captured body locals',
    source: `
      let i = 0; const reads = []; const calls = [];
      while ((() => { const more = i < 2; calls.push(i); return more; })()) {
        const value = i++; reads.push(() => value);
      }
      globalThis.result = [reads.map(read => read()), calls];
    `,
    expected: [
      [0, 1],
      [0, 1, 2],
    ],
  },
  {
    name: 'do-while continue evaluates the test after capturing the body local',
    source: `
      let i = 0; const reads = []; const calls = [];
      do {
        const value = i++; reads.push(() => value); continue;
      } while ((() => { const more = i < 2; calls.push(i); return more; })());
      globalThis.result = [reads.map(read => read()), calls];
    `,
    expected: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    name: 'nested captured loops inside an iterable terminate before the outer loop',
    source: `
      const reads = [];
      for (const value of (() => {
        const inner = [];
        for (let i = 0; i < 2; i++) inner.push(() => i);
        return inner.map(read => read());
      })()) reads.push(() => value);
      globalThis.result = reads.map(read => read());
    `,
    expected: [0, 1],
  },
  {
    name: 'sibling captured loops keep their helpers and shadowed bindings separate',
    source: `
      const reads = []; const _loop = 'user'; const _loopResult = 'result';
      for (let value = 0; value < 2; value++) reads.push(() => value);
      for (let value = 4; value < 6; value++) reads.push(() => value);
      globalThis.result = [reads.map(read => read()), _loop, _loopResult, typeof value];
    `,
    expected: [[0, 1, 4, 5], 'user', 'result', 'undefined'],
  },
  {
    name: 'uninitialized locals reset on every iteration without resetting enclosing locals',
    source: `
      const seen = []; let outer;
      for (let i = 0; i < 3; i++) {
        let value; seen.push([value, outer]); value = i; outer = i;
      }
      globalThis.result = seen;
    `,
    expected: [
      [undefined, undefined],
      [undefined, 0],
      [undefined, 1],
    ],
  },
  {
    name: 'uninitialized captured locals have independent mutable storage',
    source: `
      const reads = []; const writes = [];
      for (let i = 0; i < 2; i++) {
        let value; reads.push(() => value); writes.push(next => value = next);
      }
      writes[0](7);
      globalThis.result = reads.map(read => read());
    `,
    expected: [7, undefined],
  },
  {
    name: 'switch breaks do not exit a captured loop and continue still runs the update',
    source: `
      const reads = []; const seen = [];
      for (let i = 0; i < 3; i++) {
        reads.push(() => i);
        switch (i) { case 0: break; case 1: continue; default: seen.push('switch'); }
        seen.push(i);
      }
      globalThis.result = [reads.map(read => read()), seen];
    `,
    expected: [
      [0, 1, 2],
      [0, 'switch', 2],
    ],
  },
  {
    name: 'return without a value exits the containing function after finally',
    source: `
      const calls = []; const reads = [];
      function run() {
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          try { if (i === 1) return; calls.push(i); }
          finally { calls.push('finally:' + i); }
        }
        return 'unreachable';
      }
      globalThis.result = [run(), calls, reads.map(read => read())];
    `,
    expected: [undefined, [0, 'finally:0', 'finally:1'], [0, 1]],
  },
  {
    name: 'nested function returns do not become returns from the captured loop',
    source: `
      const reads = []; const seen = [];
      for (let i = 0; i < 2; i++) {
        reads.push(() => i);
        function read() { return i + 10; }
        seen.push(read());
      }
      globalThis.result = [reads.map(read => read()), seen];
    `,
    expected: [
      [0, 1],
      [10, 11],
    ],
  },
  {
    name: 'captured bodies preserve lexical this, arguments, and new.target',
    source: `
      function Reader(prefix) {
        this.reads = [];
        for (let i = 0; i < 2; i++) {
          this.reads.push(() => [this === instance, arguments[0], new.target === Reader, i]);
        }
      }
      const instance = new Reader('prefix');
      globalThis.result = instance.reads.map(read => read());
    `,
    expected: [
      [true, 'prefix', true, 0],
      [true, 'prefix', true, 1],
    ],
  },
  {
    name: 'renamed bindings preserve object shorthand keys and assignment defaults',
    source: `
      let value = 'outer'; const seen = [];
      { let value = 'inner'; seen.push({ value }); ({ value = 'default' } = {}); seen.push({ value }); }
      globalThis.result = [value, seen];
    `,
    expected: ['outer', [{ value: 'inner' }, { value: 'default' }]],
  },
  {
    name: 'lexical declarations do not capture unresolved references in sibling functions',
    source: `
      const outside = () => typeof hidden;
      { const hidden = 7; globalThis.inside = (() => hidden)(); }
      globalThis.result = [outside(), globalThis.inside];
    `,
    expected: ['undefined', 7],
  },
  {
    name: 'catch parameters and sibling lexical bindings do not overwrite each other',
    source: `
      let error = 'outer'; const reads = [];
      try { throw 'caught'; } catch (error) { reads.push(() => error); }
      { let error = 'block'; reads.push(() => error); }
      globalThis.result = [error, reads.map(read => read())];
    `,
    expected: ['outer', ['caught', 'block']],
  },
  {
    name: 'multiple header bindings copy body mutations back before the loop update',
    source: `
      const reads = [];
      for (let i = 0, step = 1; i < 5; i += step) {
        reads.push(() => i); step = 2;
      }
      globalThis.result = reads.map(read => read());
    `,
    expected: [0, 2, 4],
  },
  {
    name: 'labeled break exits nested captured loops without changing their closures',
    source: `
      const reads = [];
      outer: for (let row = 0; row < 2; row++) {
        for (let column = 0; column < 3; column++) {
          reads.push(() => [row, column]);
          if (column === 1) break outer;
        }
      }
      globalThis.result = reads.map(read => read());
    `,
    expected: [
      [0, 0],
      [0, 1],
    ],
  },
];

test.each(cases)('$name', ({ source, expected }) => {
  const original = runInNewContext(source, {}, { timeout: 1_000 });
  expect(original).toEqual(expected);
  const output = compile(source, { transforms: { blockScoping: true } });
  expect(output).not.toMatch(/\b(?:let|const)\b/);
  expect(runInNewContext(output, {}, { timeout: 1_000 })).toEqual(expected);
});

test.each([
  {
    name: 'short-circuited &&=',
    initial: '0',
    expression: 'value &&= rhs()',
    expected: [0, [], false],
  },
  {
    name: 'writing &&=',
    initial: '1',
    expression: 'value &&= rhs()',
    expected: [1, ['rhs'], true],
  },
  {
    name: 'short-circuited ??=',
    initial: '0',
    expression: 'value ??= rhs()',
    expected: [0, [], false],
  },
  {
    name: 'writing ??=',
    initial: 'null',
    expression: 'value ??= rhs()',
    expected: [null, ['rhs'], true],
  },
  {
    name: 'BigInt postfix decrement',
    initial: '2n',
    expression: 'value--',
    expected: [2n, [], true],
  },
  {
    name: 'BigInt prefix increment',
    initial: '2n',
    expression: '++value',
    expected: [2n, [], true],
  },
])('const writes: $name', ({ initial, expression, expected }) => {
  const source = `
    const value = ${initial}; const calls = []; let threw = false;
    function rhs() { calls.push('rhs'); return 9; }
    try { ${expression}; } catch (error) { threw = error instanceof TypeError; }
    globalThis.result = [value, calls, threw];
  `;
  expect(runInNewContext(source, {}, { timeout: 1_000 })).toEqual(expected);
  expect(execute(source, { transforms: { blockScoping: true } }).result).toEqual(expected);
});

test('async captured loop bodies preserve await, continue, and returned values', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      async function run() {
        const reads = []; const seen = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          seen.push(await Promise.resolve(i));
          if (i === 0) continue;
          if (i === 1) return [reads.map(read => read()), seen];
        }
      }
      globalThis.result = run();
    `,
    { transforms: { blockScoping: true } },
  );
  await expect(result.result).resolves.toEqual([
    [0, 1],
    [0, 1],
  ]);
});

test('generator captured loop bodies preserve yielded values and final return', () => {
  const result = execute(
    `
      const reads = [];
      function* run() {
        for (let i = 0; i < 2; i++) {
          reads.push(() => i); yield i;
        }
        return reads.map(read => read());
      }
      const iterator = run();
      globalThis.result = [iterator.next(), iterator.next(), iterator.next()];
    `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([
    { value: 0, done: false },
    { value: 1, done: false },
    { value: [0, 1], done: true },
  ]);
});

test.each([
  { name: 'block scoping', transforms: { blockScoping: true } },
  {
    name: 'with for-of and destructuring',
    transforms: { blockScoping: true, forOf: true, destructuring: true },
  },
])('captured destructured bindings preserve defaults and mutation: $name', ({ transforms }) => {
  const source = `
    const reads = []; let defaults = 0;
    for (let [value, delta = (++defaults, 10)] of [[1], [2, 20]]) {
      reads.push(() => value); value += delta;
    }
    globalThis.result = [reads.map(read => read()), defaults];
  `;
  const expected = [[11, 22], 1];
  expect(runInNewContext(source, {}, { timeout: 1_000 })).toEqual(expected);
  const output = compile(source, { transforms });
  expect(output).not.toMatch(/\b(?:let|const)\b/);
  expect(runInNewContext(output, {}, { timeout: 1_000 })).toEqual(expected);
});

test.each([
  { name: 'block scoping', transforms: { blockScoping: true } },
  { name: 'with for-of lowering', transforms: { blockScoping: true, forOf: true } },
])(
  'throwing from a captured body closes the iterator and preserves the error: $name',
  ({ transforms }) => {
    const source = `
    const reads = []; const calls = []; const error = new Error('body');
    const iterable = {
      [Symbol.iterator]() {
        return {
          next() { calls.push('next'); return { value: 7, done: false }; },
          return() { calls.push('close'); return {}; },
        };
      },
    };
    let sameError = false;
    try { for (let value of iterable) { reads.push(() => value); throw error; } }
    catch (caught) { sameError = caught === error; }
    globalThis.result = [reads.map(read => read()), calls, sameError];
  `;
    const expected = [[7], ['next', 'close'], true];
    expect(runInNewContext(source, {}, { timeout: 1_000 })).toEqual(expected);
    const output = compile(source, { transforms });
    expect(output).not.toMatch(/\b(?:let|const)\b/);
    expect(runInNewContext(output, {}, { timeout: 1_000 })).toEqual(expected);
  },
);

// These regressions execute both the source and the lowered program against
// the same specification expectation.
const extractionRegressions = [
  {
    name: 'new capture aliases do not hide unresolved global names',
    source: `
      globalThis._arguments = 'args'; globalThis._value = 'value';
      globalThis._first = 'first'; globalThis._initial = 'initial';
      const seen = []; const reads = [];
      function* run() {
        for (const value of [1]) {
          reads.push(() => value);
          try { value = 2; } catch (error) { seen.push(_value); }
          yield [arguments[0], _arguments];
        }
      }
      for (let i = 0, read = () => i; (reads.push(() => i), i < 1); i++) {
        seen.push(_first, _initial, read());
      }
      globalThis.result = [[...run('outer')], seen, reads.map(read => read())];
    `,
    expected: [[['outer', 'args']], ['first', 'initial', 0, 'value'], [0, 1, 1]],
  },
  {
    name: 'captured header and body shadow bindings keep separate lexical scopes',
    source: `
      const heads = []; const bodies = [];
      for (let i = 0; (heads.push(() => i), i < 2); i++) {
        let i = 10; bodies.push(() => i);
      }
      globalThis.result = [heads.map(read => read()), bodies.map(read => read())];
    `,
    expected: [
      [0, 1, 2],
      [10, 10],
    ],
  },
  {
    name: 'const writes remain protected in callbacks and destructured loop bindings',
    source: `
      const writes = []; const reads = [];
      for (const [value] of [[1], [2]]) {
        reads.push(() => value);
        writes.push(() => { try { value++; } catch (error) { return error.name; } });
      }
      globalThis.result = [writes.map(write => write()), reads.map(read => read())];
    `,
    expected: [
      ['TypeError', 'TypeError'],
      [1, 2],
    ],
  },
  {
    name: 'destructured var hoists preserve initialization order and nested loop targets',
    source: `
      function run() {
        const reads = []; const calls = [];
        for (let i = 0; i < 2; i++) {
          reads.push(() => i);
          var [first = (calls.push(i), i), ...rest] = [undefined, 9];
          var { value: second, ...other } = { value: i + 1, keep: true };
          for (var index = 0; index < 1; index++) {}
          for (var key in { a: 1 }) {}
          for (var [last] of [[i + 2]]) {}
          var absent;
        }
        return [first, rest, second, other, index, key, last, absent, calls, reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [1, [9], 2, { keep: true }, 1, 'a', 3, undefined, [0, 1], [0, 1]],
  },
  {
    name: 'var hoisting stops at nested function and static-block scopes',
    source: `
      const reads = [];
      for (let i = 0; i < 2; i++) {
        reads.push(() => i);
        function nested() { var privateValue = i; return privateValue; }
        class Value { static { var staticValue = nested(); this.value = staticValue; } }
        reads.push(() => Value.value);
      }
      globalThis.result = [reads.map(read => read()), typeof privateValue, typeof staticValue];
    `,
    expected: [[0, 0, 1, 1], 'undefined', 'undefined'],
  },
  {
    name: 'iteration-local vars retain initialization order and updates',
    source: `
      function run() {
        const reads = []; const values = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          var first = i;
          var second = first + 1, third = i + 2;
          var reset = undefined;
          if (i === 0) reset = 9;
          second++; values.push([first, second, third, reset]);
        }
        return [values, reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [
      [
        [0, 2, 2, 9],
        [1, 3, 3, undefined],
        [2, 4, 4, undefined],
      ],
      [0, 1, 2],
    ],
  },
  {
    name: 'uninitialized and conditionally initialized vars carry values between iterations',
    source: `
      function run() {
        const reads = []; const values = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          var previous;
          if (i === 0) var counter = 10;
          values.push([previous, counter++]); previous = i;
        }
        return [values, reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [
      [
        [undefined, 10],
        [0, 11],
        [1, 12],
      ],
      [0, 1, 2],
    ],
  },
  {
    name: 'var reads before initialization and self-initializers observe prior iterations',
    source: `
      function run() {
        const reads = []; const values = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i); values.push(previous);
          var previous = i;
          var total = (total || 0) + i + 1;
          values.push(total);
        }
        return [values, reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [
      [undefined, 1, 0, 3, 1, 6],
      [0, 1, 2],
    ],
  },
  {
    name: 'captured var bindings remain shared by escaping closures and instance fields',
    source: `
      function run() {
        const reads = []; const classes = [];
        for (let i = 0; i < 3; i++) {
          var value = i;
          var field = i;
          reads.push(() => [i, value]);
          classes.push(class { value = field; });
        }
        return [reads.map(read => read()), classes.map(Value => new Value().value)];
      }
      globalThis.result = run();
    `,
    expected: [
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      [2, 2, 2],
    ],
  },
  {
    name: 'var redeclarations retain parameter identity and mapped arguments',
    source: `
      function run(value) {
        const reads = []; const values = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          var value = i;
          values.push(arguments[0]);
        }
        return [values, reads.map(read => read())];
      }
      globalThis.result = run(9);
    `,
    expected: [
      [0, 1, 2],
      [0, 1, 2],
    ],
  },
  {
    name: 'vars visible to direct eval stay in their containing function',
    source: `
      function run() {
        const reads = [];
        for (let i = 0; i < 3; i++) {
          reads.push(() => i);
          var value = i;
        }
        return [eval('value'), reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [2, [0, 1, 2]],
  },
  {
    name: 'top-level vars retain their global object binding',
    source: `
      const reads = [];
      for (let i = 0; i < 3; i++) { reads.push(() => i); var exposed = i; }
      globalThis.result = [globalThis.exposed, reads.map(read => read())];
    `,
    expected: [2, [0, 1, 2]],
  },
  {
    name: 'initialization closures stay separate from test, update, and body closures',
    source: `
      const tests = []; const updates = []; const bodies = []; let initial;
      for (let i = 0, read = () => i;
           (tests.push(() => i), i < 2);
           (updates.push(() => i), i++)) {
        initial = read; bodies.push(() => i);
      }
      globalThis.result = [initial(), tests.map(read => read()), updates.map(read => read()), bodies.map(read => read())];
    `,
    expected: [0, [0, 1, 2], [1, 2], [0, 1]],
  },
  {
    name: 'initializer-only captures preserve labels, writes, and destructured forward bindings',
    source: `
      const reads = []; const steps = [];
      outer: for (let read = () => ++i, [i, limit] = [0, 4]; i < limit; i++) {
        reads.push(read);
        try { if (i === 1) continue outer; if (i === 2) break outer; }
        finally { steps.push([read(), i]); }
      }
      globalThis.result = [steps, reads.map(read => read())];
    `,
    expected: [
      [
        [1, 0],
        [2, 1],
        [3, 2],
      ],
      [4, 5, 6],
    ],
  },
  {
    name: 'initializer-only captures get a fresh environment on each outer iteration',
    source: `
      const reads = [];
      for (let outer = 0; outer < 3; outer++) {
        for (let read = () => i, i = outer; i < outer + 2; i++) reads.push(read);
      }
      globalThis.result = reads.map(read => read());
    `,
    expected: [0, 0, 1, 1, 2, 2],
  },
  {
    name: 'initializer-only captures preserve false tests and containing returns',
    source: `
      const reads = []; let calls = 0;
      function run(enter) {
        for (let read = () => i, i = (++calls, 7); (reads.push(read), enter); i++) {
          var value = i;
          return [read(), value];
        }
        return typeof value;
      }
      globalThis.result = [run(false), run(true), calls, reads.map(read => read())];
    `,
    expected: ['undefined', [7, 7], 2, [7, 7]],
  },
  {
    name: 'initializer closures can reference later declarations under a loop label',
    source: `
      const reads = []; let calls = 0;
      if (false) for (let i = (++calls, 0), read = () => i; i < 2; i++) reads.push(read);
      outer: for (let read = () => i, i = 0; i < 3; i++) {
        reads.push(() => [read(), i]);
        if (i === 1) break outer;
        continue outer;
      }
      globalThis.result = [reads.map(read => read()), calls];
    `,
    expected: [
      [
        [0, 0],
        [0, 1],
      ],
      0,
    ],
  },
  {
    name: 'finally may override a return while updating the captured binding',
    source: `
      const reads = [];
      function run() {
        for (let i = 0; i < 4; i++) {
          reads.push(() => i);
          try { return 'discarded'; }
          finally { i++; if (i < 3) continue; return 'finally'; }
        }
      }
      globalThis.result = [run(), reads.map(read => read())];
    `,
    expected: ['finally', [1, 3]],
  },
  {
    name: 'finally copies multiple bindings back after nested finalizers',
    source: `
      const reads = [];
      for (let i = 0, j = 10; i < 4; i++) {
        reads.push(() => [i, j]);
        try { try { continue; } finally { i++; } }
        finally { j += i; }
      }
      globalThis.result = reads.map(read => read());
    `,
    expected: [
      [1, 11],
      [3, 14],
    ],
  },
  {
    name: 'generator return expressions preserve arguments through arrows',
    source: `
      function* run(value) {
        for (let i = 0; i < 2; i++) {
          yield () => i;
          return (() => [arguments[0], i])();
        }
      }
      const iterator = run('outer');
      const read = iterator.next().value;
      globalThis.result = [iterator.next().value, read()];
    `,
    expected: [['outer', 0], 0],
  },
  {
    name: 'generator arguments capture crosses arrows but not ordinary functions or local bindings',
    source: `
      const reads = [];
      function* run(prefix) {
        for (let i = 0; i < 2; i++) {
          reads.push(() => i);
          const arrow = () => arguments[0];
          function nested(value) { return arguments[0]; }
          yield [arrow(), nested('inner')];
        }
      }
      globalThis.result = [...run('outer')];
    `,
    expected: [
      ['outer', 'inner'],
      ['outer', 'inner'],
    ],
  },
  {
    // Extraction must retain const write checks inside closures as well as the body.
    name: 'captured const loop bindings remain read-only',
    source: `
      const reads = []; const errors = [];
      for (const value of [1, 2]) {
        reads.push(() => value);
        try { value = 9; } catch (error) { errors.push(error.name); }
      }
      globalThis.result = [reads.map(read => read()), errors];
    `,
    expected: [
      [1, 2],
      ['TypeError', 'TypeError'],
    ],
  },
  {
    // Body extraction must leave var declarations in the containing function.
    name: 'var declarations in captured bodies belong to the containing function',
    source: `
      function run() {
        const reads = [];
        for (let i = 0; i < 2; i++) { reads.push(() => i); var value = i; }
        return [value, reads.map(read => read())];
      }
      globalThis.result = run();
    `,
    expected: [1, [0, 1]],
  },
  {
    // Read copied-back bindings after finally. The guard bounds a broken rewrite.
    name: 'continue copies loop bindings back after finally mutations',
    source: `
      const reads = []; let guard = 0;
      for (let i = 0; i < 4 && guard++ < 5; i++) {
        reads.push(() => i);
        try { continue; } finally { i++; }
      }
      globalThis.result = reads.map(read => read());
    `,
    expected: [1, 3],
  },
  {
    // The generated generator helper must retain lexical arguments references.
    name: 'generator captured bodies read the containing generator arguments',
    source: `
      const reads = [];
      const owner = {
        *run(prefix) {
          for (let i = 0; i < 2; i++) {
            reads.push(() => i); yield [this === owner, arguments[0], i];
          }
        },
      };
      globalThis.result = [...owner.run('prefix')];
    `,
    expected: [
      [true, 'prefix', 0],
      [true, 'prefix', 1],
    ],
  },
  {
    // Header closures must retain the update/test/body iteration environment.
    name: 'retained header closures capture distinct per-iteration environments',
    source: `
      const reads = [];
      for (let i = 0; (reads.push(() => i), i < 2); i++) {}
      globalThis.result = reads.map(read => read());
    `,
    expected: [0, 1, 2],
  },
  {
    // A static block owns its locals independently of the outer loop.
    name: 'class static-block locals in the iterable are not loop bindings',
    source: `
      const reads = [];
      for (const value of class {
        static { const local = [1, 2]; this.values = local; }
      }.values) reads.push(() => value);
      globalThis.result = reads.map(read => read());
    `,
    expected: [1, 2],
  },
];

for (const { name, source, expected } of extractionRegressions) {
  test(`${name}: source baseline`, () => {
    expect(runInNewContext(source, {}, { timeout: 1_000 })).toEqual(expected);
  });
  test(`${name}: lowered program`, () => {
    const output = compile(source, { transforms: { blockScoping: true } });
    expect(output).not.toMatch(/\b(?:let|const)\b/);
    expect(runInNewContext(output, {}, { timeout: 1_000 })).toEqual(expected);
  });
}

test('async captured headers await in the next iteration environment', async () => {
  const result = execute<{ result: Promise<unknown> }>(
    `
    async function run() {
      const reads = [];
      for (let i = 0; (reads.push(() => i), await Promise.resolve(i < 2)); i++) {}
      return reads.map(read => read());
    }
    globalThis.result = run();
  `,
    { transforms: { blockScoping: true } },
  );
  await expect(result.result).resolves.toEqual([0, 1, 2]);
});

test('generator captured headers yield with the containing arguments object', () => {
  const result = execute(
    `
    function* run(limit) {
      const reads = [];
      for (let i = 0; (reads.push(() => i), yield i < arguments[0]); i++) {}
      return reads.map(read => read());
    }
    const iterator = run(2);
    globalThis.result = [iterator.next(), iterator.next(true), iterator.next(true), iterator.next(false)];
  `,
    { transforms: { blockScoping: true } },
  );
  expect(result.result).toEqual([
    { value: true, done: false },
    { value: true, done: false },
    { value: false, done: false },
    { value: [0, 1, 2], done: true },
  ]);
});

test.each([
  {
    name: 'arrow parameter',
    callback: '([name, value]) => () => [name, value]',
    expected: [
      ['first', { value: 1, extra: 2 }],
      ['second', { value: 3, extra: 4 }],
    ],
  },
  {
    name: 'ordinary parameter',
    callback: 'function ([name, value]) { return () => [name, value]; }',
    expected: [
      ['first', { value: 1, extra: 2 }],
      ['second', { value: 3, extra: 4 }],
    ],
  },
  {
    name: 'object-rest parameter',
    callback: '([name, { value, ...rest }]) => () => [name, value, rest]',
    expected: [
      ['first', 1, { extra: 2 }],
      ['second', 3, { extra: 4 }],
    ],
  },
])(
  'captures bindings introduced by parameter lowering in a loop: $name',
  ({ callback, expected }) => {
    const source = `
    const reads = [];
    for (const key in { a: true, b: true }) {
      reads.push(...[['first', { value: 1, extra: 2 }], ['second', { value: 3, extra: 4 }]]
        .map(${callback}));
    }
    globalThis.result = reads.map(read => read());
  `;
    expect(runInNewContext(source)).toEqual([...expected, ...expected]);
    const code = compile(source, {
      transforms: {
        blockScoping: true,
        parameters: true,
        destructuring: true,
        objectRestSpread: { loose: true, useBuiltIns: true },
      },
    });
    expect(code).not.toMatch(/\b(?:let|const)\b/);
    const context: Record<string, unknown> = {};
    new Function('globalThis', code)(context);
    expect(context.result).toEqual([...expected, ...expected]);
  },
);
