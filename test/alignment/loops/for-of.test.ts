import { transformSync } from '@babel/core';
import forOf from '@babel/plugin-transform-for-of';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../../compliance/runtime';

import { alignBabelBehavior } from '../transform';

test('aligns for-of iteration with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let total = 0; for (const value of new Set([20, 22])) total += value;
globalThis.__result = total;`,
      filename: 'input.js',
      plugins: [forOf],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { forOf: true } },
      output: { mustNotMatch: [/for\s*\([^)]*\bof\b/] },
    }),
  ).resolves.toBe(42);
});

test('aligns loop-head and body lexical environments with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const seen = [];
for (const value of [1, 2]) {
  const value = 'body';
  seen.push(value);
}
globalThis.__result = seen;`,
      filename: 'input.js',
      plugins: [forOf],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { forOf: true } },
      output: { mustNotMatch: [/for\s*\([^)]*\bof\b/] },
    }),
  ).resolves.toEqual(['body', 'body']);
});

// The standard Babel helper accepts primitive return results. Keep the native
// control explicit while asserting the adopted helper compatibility behavior.
describe('Babel IteratorClose object-result compatibility', () => {
  let babelOutcome: unknown;
  beforeAll(() => {
    const source = `const iterable = {
      [Symbol.iterator]() {
        return {
          next() { return { value: 1, done: false }; },
          return() { return 1; },
        };
      },
    };
    let outcome = 'completed';
    try { for (const value of iterable) { void value; break; } }
    catch (error) { outcome = error.name; }
    globalThis.__result = outcome;`;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.__result;
    };
    const noxcturnal = compile(source, {
      helpers: { mode: 'inline' },
      transforms: { forOf: true },
    });
    const reference = transformSync(source, {
      filename: 'input.js',
      configFile: false,
      babelrc: false,
      plugins: [forOf],
    });
    expect(reference?.code).toBeTypeOf('string');
    const babel = reference!.code!;
    expect(noxcturnal).not.toMatch(/for\s*\([^)]*\bof\b/);
    expect(babel).not.toMatch(/for\s*\([^)]*\bof\b/);
    expect(observe(source)).toBe('TypeError');
    expect(observe(noxcturnal)).toBe('completed');
    babelOutcome = observe(babel);
    expect(babelOutcome).toBe('completed');
  });
  test('accepts primitive close results like Babel', () => {
    expect(babelOutcome).toBe('completed');
  });
});
