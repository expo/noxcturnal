import classProperties from '@babel/plugin-transform-class-properties';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns class properties with Babel (loose=%s)', async loose => {
  await expect(
    alignBabelBehavior({
      source: `class Counter { value = 2; static factor = 3; read() { return this.value * Counter.factor; } }
globalThis.__result = new Counter().read();`,
      filename: 'input.js',
      plugins: [[classProperties, { loose }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { classProperties: { loose } },
      },
      output: { mustNotMatch: [/^\s*value\s*=/m, /^\s*static\s+factor\s*=/m] },
    }),
  ).resolves.toBe(6);
});

async function alignStaticFieldSuper(loose: boolean): Promise<unknown> {
  return alignBabelBehavior({
    source: `class Base {
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
    filename: 'input.js',
    plugins: [[classProperties, { loose }]],
    noxcturnal: {
      helpers: { mode: 'inline' },
      transforms: { classProperties: { loose } },
    },
    output: { mustNotMatch: [/^\s*static\s+(?:seed|direct|arrow)\s*=/m] },
  });
}

test('aligns static field this and super evaluation with Babel in spec mode', async () => {
  await expect(alignStaticFieldSuper(false)).resolves.toEqual([21, true, 21]);
});

test.fails('documents Oxc loose static-super getter receiver divergence from Babel', async () => {
  await alignStaticFieldSuper(true);
});
