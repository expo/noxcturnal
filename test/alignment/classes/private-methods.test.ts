import classProperties from '@babel/plugin-transform-class-properties';
import privateMethods from '@babel/plugin-transform-private-methods';
import privatePropertyInObject from '@babel/plugin-transform-private-property-in-object';
import babel from '@babel/core';
import { expect, test } from 'vitest';

import type { PreflightTransforms } from '../../../js';
import { defineNativePipeline, transform } from '../../../js';
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
        transforms: { privateMethods: true },
      },
      output: { mustNotMatch: [/#read\b/] },
    }),
  ).resolves.toBe(42);
});

test('documents the focused class-feature prerequisite matrix against standalone Babel plugins', () => {
  const source = `class Example {
  field = 1;
  #privateField = 2;
  #method() { return this.#privateField; }
  static { this.ready = true; }
  static has(input) { return #privateField in input; }
}`;
  const cases = [
    ['classProperties', classProperties, { classProperties: { loose: true } }],
    ['privateMethods', privateMethods, { privateMethods: true }],
    ['privatePropertyInObject', privatePropertyInObject, { privatePropertyInObject: true }],
  ] as const;

  for (const [name, plugin, transforms] of cases) {
    // Babel's standalone plugins either retain sibling syntax or reject the
    // mixed-feature source and require sibling plugins. Noxcturnal deliberately
    // compiles that prerequisite bundle internally instead.
    let reference: string | undefined;
    let rejected = false;
    try {
      reference =
        babel.transformSync(source, {
          babelrc: false,
          configFile: false,
          plugins: [[plugin, { loose: true }]],
        })?.code ?? undefined;
    } catch (error) {
      rejected = /not enabled|plugin-transform-/.test(String(error));
    }
    expect(
      rejected || /#method|#privateField|static \{/.test(reference ?? ''),
      `${name} standalone Babel boundary`,
    ).toBe(true);

    const result = transformSourceForMatrix(source, transforms);
    expect(result.status).toBe('complete');
    if (result.status === 'complete') {
      expect(result.code).not.toMatch(/\bclass\s+Example\b|#method|#privateField|static \{/);
    }
  }
});

function transformSourceForMatrix(source: string, transforms: PreflightTransforms) {
  return transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'class-feature-matrix',
          native: { transforms, helpers: { mode: 'inline' } },
        },
      ],
    }),
  );
}

test('composes private fields and brand checks as prerequisites', async () => {
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
      plugins: [
        [privatePropertyInObject, { loose }],
        [privateMethods, { loose }],
        [classProperties, { loose }],
      ],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { privateMethods: true },
      },
      output: { mustNotMatch: [/#value\b/, /#value in input/] },
    }),
  ).resolves.toEqual([42, true, false]);
});

// NOTE: Private features intentionally retain one representation.
test('aligns the selected private-feature representation with Babel', async () => {
  const loose = true;
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
          privateMethods: true,
          privatePropertyInObject: true,
        },
      },
      output: { mustNotMatch: [/#value\b/, /#increment\b/] },
    }),
  ).resolves.toEqual([3, true, false, true]);
});
