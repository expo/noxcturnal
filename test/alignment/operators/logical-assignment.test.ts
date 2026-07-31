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

test('aligns effectful private-field receivers with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Value {
  #value = 0; calls = 0;
  self() { this.calls++; return this; }
  update() {
    const first = this.self().#value ||= 2;
    const second = this.self().#value ||= 3;
    return [first, second, this.#value, this.calls];
  }
}
globalThis.__result = new Value().update();`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([2, 2, 2, 2]);
});

test('aligns computed super references and receiver semantics with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
class Base {
  get value() { calls.push(['get', this.current]); return this.current; }
  set value(value) { calls.push(['set', this.current, value]); this.current = value; }
}
class Child extends Base {
  current = 0;
  update() {
    const key = () => (calls.push('key'), 'value');
    const first = super[key()] ||= 2;
    const second = super[key()] ||= 3;
    return [first, second, this.current];
  }
}
const child = new Child();
globalThis.__result = [child.update(), calls];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([
    [2, 2, 2],
    ['key', ['get', 0], ['set', 0, 2], 'key', ['get', 2]],
  ]);
});

test('aligns nested effectful private-field receivers with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Value {
  #value;
  constructor(value) { this.#value = value; }
  self(calls, name) { calls.push(name); return this; }
  update(other, calls) {
    const result = this.self(calls, 'outer').#value ||= other.self(calls, 'inner').#value ||= 2;
    return [result, this.#value, other.#value];
  }
}
const outer = new Value(0);
const inner = new Value(0);
const calls = [];
globalThis.__result = [outer.update(inner, calls), calls];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/\|\|=/] },
    }),
  ).resolves.toEqual([
    [2, 2, 2],
    ['outer', 'inner'],
  ]);
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

test('aligns private receiver temporaries across arrows, defaults, and static blocks', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Value {
  #value = 0;
  self() { return this; }
  arrow = () => this.self().#value ||= 2;
  withDefault(value = this.self().#value ||= 3) { return value; }
  read() { return this.#value; }
}
class StaticValue {
  static #value = 0;
  static self() { return this; }
  static { this.self().#value ||= 4; }
  static read() { return this.#value; }
}
const first = new Value();
const second = new Value();
globalThis.__result = [first.arrow(), second.withDefault(), first.read(), second.read(), StaticValue.read()];`,
      filename: 'input.js',
      plugins: [[logicalAssignment, { loose: true }]],
      noxcturnal: { transforms: { logicalAssignmentOperators: true } },
      output: { mustNotMatch: [/(?:\|\|=|&&=|\?\?=)/] },
    }),
  ).resolves.toEqual([2, 3, 2, 3, 4]);
});
