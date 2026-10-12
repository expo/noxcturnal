import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';
import { compile, execute } from './runtime';

// Unlike the transform corpus, these cases execute the output. Check the source
// too so each expected value is independently grounded in JavaScript semantics.
const cases = [
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

// Executable specification gaps, not accepted output snapshots. Each source has
// a passing baseline; test.fails requires the lowered program to still disagree
// and will flag an unexpected pass when its defect is fixed.
const specificationGaps = [
  {
    // Moving the const binding to a mutable helper parameter loses its write checks.
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
    // Body extraction moves var declarations into the helper's function scope.
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
    // Both Noxcturnal and Babel currently snapshot copied-back bindings before
    // finally executes. The guard keeps broken copy-back from causing a hang.
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
    // The generated generator helper has its own arguments object.
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
    // Both default transforms omit per-iteration environments for header-only
    // captures. Termination is covered separately from this semantic limitation.
    name: 'retained header closures capture distinct per-iteration environments',
    source: `
      const reads = [];
      for (let i = 0; (reads.push(() => i), i < 2); i++) {}
      globalThis.result = reads.map(read => read());
    `,
    expected: [0, 1, 2],
  },
  {
    // A static block is a separate var scope but not a function boundary, so its
    // locals are incorrectly included in the outer loop's helper arguments.
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

for (const { name, source, expected } of specificationGaps) {
  test(`${name}: source baseline`, () => {
    expect(runInNewContext(source, {}, { timeout: 1_000 })).toEqual(expected);
  });
  test.fails(`${name}: specification gap`, () => {
    const output = compile(source, { transforms: { blockScoping: true } });
    expect(output).not.toMatch(/\b(?:let|const)\b/);
    expect(runInNewContext(output, {}, { timeout: 1_000 })).toEqual(expected);
  });
}
