import classProperties from '@babel/plugin-transform-class-properties';
import privateMethods from '@babel/plugin-transform-private-methods';
import privatePropertyInObject from '@babel/plugin-transform-private-property-in-object';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns loose private methods with Babel', async () => {
  const loose = true;
  await expect(
    alignBabelBehavior({
      source: `class Example { #read() { return 42; } run() { return this.#read(); } }
globalThis.__result = new Example().run();`,
      filename: 'input.js',
      plugins: [[privateMethods, { loose }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { privateMethods: { loose } },
      },
      output: { mustNotMatch: [/#read\b/] },
    }),
  ).resolves.toBe(42);
});

test('leaves private fields and brand checks to their individual Babel transforms', async () => {
  const loose = true;
  await expect(
    alignBabelBehavior({
      source: `class Example {
  #value = 42;
  static has(input) { return #value in input; }
  read() { return this.#value; }
}
const value = new Example();
globalThis.__result = [value.read(), Example.has(value), Example.has({})];`,
      filename: 'input.js',
      plugins: [[privateMethods, { loose }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { privateMethods: { loose } },
      },
      output: { mustMatch: [/#value\b/, /#value in input/], mustNotMatch: [] },
    }),
  ).resolves.toEqual([42, true, false]);
});

test('aligns the complete spec private-feature bundle with Babel', async () => {
  const loose = false;
  await expect(
    alignBabelBehavior({
      source: `class Counter {
  #value = 1;
  #increment(amount) { this.#value += amount; return this.#value; }
  increment(amount) { return this.#increment(amount); }
  static has(input) { return #value in input; }
}
const counter = new Counter();
let primitiveError;
try { Counter.has(1); } catch (error) { primitiveError = error instanceof TypeError; }
globalThis.__result = [counter.increment(2), Counter.has(counter), Counter.has({}), primitiveError];`,
      filename: 'input.js',
      plugins: [
        [privatePropertyInObject, { loose }],
        [privateMethods, { loose }],
        [classProperties, { loose }],
      ],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: {
          classProperties: { loose },
          privateMethods: { loose },
          privatePropertyInObject: { loose },
        },
      },
      output: { mustNotMatch: [/#value\b/, /#increment\b/] },
    }),
  ).resolves.toEqual([3, true, false, true]);
});
