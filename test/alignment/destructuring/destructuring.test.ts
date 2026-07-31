import destructuring from '@babel/plugin-transform-destructuring';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

const babelModes = [{ useBuiltIns: false }, { useBuiltIns: true }] as const;

function alignDestructuringBehavior(
  source: string,
  useBuiltIns: boolean,
  mustNotMatch: RegExp,
): Promise<unknown> {
  return alignBabelBehavior({
    source,
    filename: 'input.js',
    plugins: [[destructuring, { useBuiltIns }]],
    noxcturnal: {
      helpers: { mode: 'inline' },
      transforms: { destructuring: true },
    },
    output: { mustNotMatch: [mustNotMatch] },
  });
}

test.each(babelModes)(
  'aligns destructuring with Babel (built-ins=$useBuiltIns)',
  async ({ useBuiltIns }) => {
    await expect(
      alignDestructuringBehavior(
        `let calls = 0; const read = () => { calls++; return { a: 20, nested: [22] }; };
const { a, nested: [b] } = read(); globalThis.__result = [a + b, calls];`,
        useBuiltIns,
        /\{\s*a\s*,\s*nested\s*:/,
      ),
    ).resolves.toEqual([42, 1]);
  },
);

test.each(babelModes)(
  'aligns primitive computed object-rest key coercion with Babel (built-ins=$useBuiltIns)',
  async ({ useBuiltIns }) => {
    await expect(
      alignDestructuringBehavior(
        `const key = 0;
const { [key]: selected, ...rest } = { 0: 'selected', keep: 'kept' };
globalThis.__result = [selected, rest];`,
        useBuiltIns,
        /\.\.\.rest/,
      ),
    ).resolves.toEqual(['selected', { keep: 'kept' }]);
  },
);

test.each(babelModes)(
  'aligns for-of declaration destructuring and body lexical scope with Babel (built-ins=$useBuiltIns)',
  async ({ useBuiltIns }) => {
    await expect(
      alignDestructuringBehavior(
        `const key = 'value'; const callbacks = []; const seen = [];
for (const { [key]: value, nested: [first = 9] } of [
  { value: 1, nested: [] }, { value: 2, nested: [3] }
]) {
  const key = 'shadow';
  callbacks.push(() => [value, first, key]);
  if (value === 1) continue;
  seen.push(value);
}
globalThis.__result = [callbacks.map(read => read()), seen];`,
        useBuiltIns,
        /for\s*\(const\s*\{/,
      ),
    ).resolves.toEqual([
      [
        [1, 9, 'shadow'],
        [2, 3, 'shadow'],
      ],
      [2],
    ]);
  },
);

test.each(babelModes)(
  'aligns for-of assignment destructuring with Babel (built-ins=$useBuiltIns)',
  async ({ useBuiltIns }) => {
    await expect(
      alignDestructuringBehavior(
        `const key = 'value'; let value; const seen = [];
for ({ [key]: value } of [{ value: 1 }, { value: 2 }]) {
  const key = 'shadow';
  seen.push([value, key]);
}
globalThis.__result = [value, seen];`,
        useBuiltIns,
        /for\s*\(\s*\{/,
      ),
    ).resolves.toEqual([
      2,
      [
        [1, 'shadow'],
        [2, 'shadow'],
      ],
    ]);
  },
);

test.each(babelModes)(
  'aligns Babel helper IteratorClose ordering around default initializers (built-ins=$useBuiltIns)',
  async ({ useBuiltIns }) => {
    await expect(
      alignDestructuringBehavior(
        `const calls = [];
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
        useBuiltIns,
        /\[value\s*=/,
      ),
    ).resolves.toEqual(['next', 'return', 'default', 'boom']);
  },
);
