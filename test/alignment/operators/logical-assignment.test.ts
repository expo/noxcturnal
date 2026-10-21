import logicalAssignment from '@babel/plugin-transform-logical-assignment-operators';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns logical assignment evaluation order with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let reads = 0; const object = { value: 0 }; const key = () => { reads++; return 'value'; };
object[key()] ||= 42; globalThis.__result = [object.value, reads];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([42, 1]);
});

test('aligns private-field logical assignments with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Values {
  #or = 0; #and = 1; #nullish = null;
  update() {
    const first = [this.#or ||= 2, this.#and &&= 3, this.#nullish ??= 4];
    this.#or ||= 5; this.#and &&= 6; this.#nullish ??= 7;
    return [first, this.#or, this.#and, this.#nullish];
  }
}
globalThis.__result = new Values().update();`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/(?:\|\|=|&&=|\?\?=)/] },
    }),
  ).resolves.toEqual([[2, 3, 4], 2, 6, 4]);
});

test('aligns re-entrant private logical assignments with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Value {
  #value = 0;
  self() { return this; }
  update(callback) { return this.self().#value ||= callback(); }
  read() { return this.#value; }
}
const outer = new Value();
const inner = new Value();
const result = outer.update(() => {
  inner.update(() => 2);
  return 3;
});
globalThis.__result = [result, outer.read(), inner.read()];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([3, 3, 2]);
});
