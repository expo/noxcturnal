import asyncGenerators from '@babel/plugin-transform-async-generator-functions';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns async generators with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `async function* values() { yield 20; yield await Promise.resolve(22); }
globalThis.__result = (async () => { const found = []; for await (const value of values()) found.push(value); return found; })();`,
      filename: 'input.js',
      plugins: [asyncGenerators],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { asyncGeneratorFunctions: true },
      },
      output: { mustNotMatch: [/async\s+function\s*\*/, /for\s+await\s*\(/] },
    }),
  ).resolves.toEqual([20, 22]);
});

test('aligns queued async-generator requests and return completion with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
async function* values() {
  try {
    calls.push('start');
    const sent = yield Promise.resolve(1);
    calls.push(['sent', sent]);
    yield await Promise.resolve(sent * 2);
    return 9;
  } finally {
    calls.push('finally');
  }
}
globalThis.__result = (async () => {
  const iterator = values();
  const first = iterator.next();
  const second = iterator.next(3);
  const returned = iterator.return(7);
  const results = await Promise.all([first, second, returned]);
  return [results.map(result => [result.value, result.done]), calls];
})();`,
      filename: 'input.js',
      plugins: [asyncGenerators],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { asyncGeneratorFunctions: true },
      },
      output: { mustNotMatch: [/async\s+function\s*\*/] },
    }),
  ).resolves.toEqual([
    [
      [1, false],
      [6, false],
      [7, true],
    ],
    ['start', ['sent', 3], 'finally'],
  ]);
});

// Babel's generated for-await state machine currently accepts primitive
// results from native async iterators. Keep the behavioral comparison live so
// an upstream fix turns this into ordinary alignment coverage.
test.fails('records Babel divergence for async iterator result validation', async () => {
  await expect(
    alignBabelBehavior({
      source: `globalThis.__result = (async () => {
  const inspect = async kind => {
    const calls = [];
    const iterable = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            calls.push('next');
            return Promise.resolve(kind === 'next' ? 1 : { value: 1, done: false });
          },
          return() { calls.push('return'); return Promise.resolve(1); },
        };
      },
    };
    let errorName;
    try { for await (const value of iterable) { calls.push(value); break; } }
    catch (error) { errorName = error.name; }
    return [errorName, calls];
  };
  return Promise.all([inspect('next'), inspect('return')]);
})();`,
      filename: 'input.js',
      plugins: [asyncGenerators],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { asyncGeneratorFunctions: true },
      },
      output: { mustNotMatch: [/for\s+await/] },
    }),
  ).resolves.toEqual([
    ['TypeError', ['next']],
    ['TypeError', ['next', 1, 'return']],
  ]);
});
