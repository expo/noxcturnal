import classStaticBlock from '@babel/plugin-transform-class-static-block';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns class static blocks with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const trace = [];
class Example { static { trace.push(this.value); this.value = 3; } }
globalThis.__result = [Example.value, trace];`,
      filename: 'input.js',
      plugins: [[classStaticBlock, { loose: true }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { classStaticBlock: true },
      },
      output: { mustNotMatch: [/static\s*\{/] },
    }),
  ).resolves.toEqual([3, [undefined]]);
});

test('aligns static-block this, super, private access, and var isolation with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
class Base { static get value() { calls.push(['get', this.name]); return this.seed; } }
class Child extends Base {
  static seed = 40;
  static #private = 2;
  static {
    var local = 'inside';
    this.answer = super.value + this.#private;
    calls.push([this === Child, local]);
  }
}
globalThis.__result = [Child.answer, calls, typeof local];`,
      filename: 'input.js',
      plugins: [classStaticBlock],
      noxcturnal: { transforms: { classStaticBlock: true } },
      output: { mustNotMatch: [/static\s*\{/] },
    }),
  ).resolves.toEqual([
    42,
    [
      ['get', 'Child'],
      [true, 'inside'],
    ],
    'undefined',
  ]);
});
