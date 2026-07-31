import classProperties from '@babel/plugin-transform-class-properties';
import privatePropertyInObject from '@babel/plugin-transform-private-property-in-object';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns loose private brand checks with Babel', async () => {
  const loose = true;
  await expect(
    alignBabelBehavior({
      source: `class Example { #value = 1; has(value) { return #value in value; } }
const instance = new Example(); globalThis.__result = [instance.has(instance), instance.has({})];`,
      filename: 'input.js',
      plugins: [
        [privatePropertyInObject, { loose }],
        [classProperties, { loose }],
      ],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { privatePropertyInObject: true, classProperties: { loose } },
      },
      output: { mustNotMatch: [/#value\b/] },
    }),
  ).resolves.toEqual([true, false]);
});
