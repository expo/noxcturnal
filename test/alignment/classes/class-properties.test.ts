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
