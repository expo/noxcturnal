import classProperties from '@babel/plugin-transform-class-properties';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

function alignClassPropertiesBehavior(
  source: string,
  loose: boolean,
  mustNotMatch: RegExp[],
): Promise<unknown> {
  return alignBabelBehavior({
    source,
    filename: 'input.js',
    plugins: [[classProperties, { loose }]],
    noxcturnal: {
      helpers: { mode: 'inline' },
      transforms: { classProperties: { loose } },
    },
    output: { mustNotMatch },
  });
}

test.each([false, true])('aligns class properties with Babel (loose=%s)', async loose => {
  await expect(
    alignClassPropertiesBehavior(
      `class Counter {
  value = 2;
  static factor = 3;
  read() { return this.value * Counter.factor; }
}
globalThis.__result = new Counter().read();`,
      loose,
      [/^\s*value\s*=/m, /^\s*static\s+factor\s*=/m],
    ),
  ).resolves.toBe(6);
});

async function alignStaticFieldSuper(loose: boolean): Promise<unknown> {
  return alignClassPropertiesBehavior(
    `class Base {
  static get value() { return this.seed; }
}
class Child extends Base {
  static seed = 21;
  static direct = super.value;
  static arrow = () => [this, super.value];
}
const original = Child;
Child = null;
const [receiver, value] = original.arrow();
globalThis.__result = [original.direct, receiver === original, value];`,
    loose,
    [/^\s*static\s+(?:seed|direct|arrow)\s*=/m],
  );
}

test('aligns static field this and super evaluation with Babel in spec mode', async () => {
  await expect(alignStaticFieldSuper(false)).resolves.toEqual([21, true, 21]);
});

test('aligns static field this and super evaluation in loose mode', async () => {
  await expect(alignStaticFieldSuper(true)).resolves.toEqual([undefined, true, undefined]);
});

test('aligns loose computed super calls with a complex heritage expression', async () => {
  await expect(
    alignClassPropertiesBehavior(
      `let heritageCalls = 0;
const key = 'read';
class Base { static read() { return this.seed; } }
class Child extends (heritageCalls++, Base) {
  static seed = 34;
  static value = super[key]();
}
globalThis.__result = [heritageCalls, Child.value];`,
      true,
      [/^\s*static\s+(?:seed|value)\s*=/m],
    ),
  ).resolves.toEqual([1, 34]);
});
