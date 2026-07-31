import destructuring from '@babel/plugin-transform-destructuring';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns destructuring with Babel (built-ins=%s)', async useBuiltIns => {
  await expect(
    alignBabelBehavior({
      source: `let calls = 0; const read = () => { calls++; return { a: 20, nested: [22] }; };
const { a, nested: [b] } = read(); globalThis.__result = [a + b, calls];`,
      filename: 'input.js',
      plugins: [[destructuring, { useBuiltIns }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { destructuring: true },
      },
      output: { mustNotMatch: [/\{\s*a\s*,\s*nested\s*:/] },
    }),
  ).resolves.toEqual([42, 1]);
});

test.each([false, true])(
  'aligns primitive computed object-rest key coercion with Babel (built-ins=%s)',
  async useBuiltIns => {
    await expect(
      alignBabelBehavior({
        source: `const key = 0;
const { [key]: selected, ...rest } = { 0: 'selected', keep: 'kept' };
globalThis.__result = [selected, rest];`,
        filename: 'input.js',
        plugins: [[destructuring, { useBuiltIns }]],
        noxcturnal: {
          helpers: { mode: 'inline' },
          transforms: { destructuring: true },
        },
        output: { mustNotMatch: [/\.\.\.rest/] },
      }),
    ).resolves.toEqual(['selected', { keep: 'kept' }]);
  },
);

test.each([false, true])(
  'aligns for-of declaration destructuring and body lexical scope with Babel (built-ins=%s)',
  async useBuiltIns => {
    await expect(
      alignBabelBehavior({
        source: `const key = 'value'; const callbacks = []; const seen = [];
for (const { [key]: value, nested: [first = 9] } of [
  { value: 1, nested: [] }, { value: 2, nested: [3] }
]) {
  const key = 'shadow';
  callbacks.push(() => [value, first, key]);
  if (value === 1) continue;
  seen.push(value);
}
globalThis.__result = [callbacks.map(read => read()), seen];`,
        filename: 'input.js',
        plugins: [[destructuring, { useBuiltIns }]],
        noxcturnal: {
          helpers: { mode: 'inline' },
          transforms: { destructuring: true },
        },
        output: { mustNotMatch: [/for\s*\(const\s*\{/] },
      }),
    ).resolves.toEqual([
      [
        [1, 9, 'shadow'],
        [2, 3, 'shadow'],
      ],
      [2],
    ]);
  },
);

test.each([false, true])(
  'aligns for-of assignment destructuring with Babel (built-ins=%s)',
  async useBuiltIns => {
    await expect(
      alignBabelBehavior({
        source: `const key = 'value'; let value; const seen = [];
for ({ [key]: value } of [{ value: 1 }, { value: 2 }]) {
  const key = 'shadow';
  seen.push([value, key]);
}
globalThis.__result = [value, seen];`,
        filename: 'input.js',
        plugins: [[destructuring, { useBuiltIns }]],
        noxcturnal: {
          helpers: { mode: 'inline' },
          transforms: { destructuring: true },
        },
        output: { mustNotMatch: [/for\s*\(\s*\{/] },
      }),
    ).resolves.toEqual([
      2,
      [
        [1, 'shadow'],
        [2, 'shadow'],
      ],
    ]);
  },
);

test.each([false, true])(
  'aligns Babel helper IteratorClose ordering around default initializers (built-ins=%s)',
  async useBuiltIns => {
    await expect(
      alignBabelBehavior({
        source: `const calls = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() { calls.push('next'); return { value: undefined, done: false }; },
      return() { calls.push('return'); return { done: true }; },
    };
  },
};
try {
  const [value = (() => { calls.push('default'); throw new Error('boom'); })()] = iterable;
  void value;
} catch (error) {
  calls.push(error.message);
}
globalThis.__result = calls;`,
        filename: 'input.js',
        plugins: [[destructuring, { useBuiltIns }]],
        noxcturnal: {
          helpers: { mode: 'inline' },
          transforms: { destructuring: true },
        },
        output: { mustNotMatch: [/\[value\s*=/] },
      }),
    ).resolves.toEqual(['next', 'return', 'default', 'boom']);
  },
);
