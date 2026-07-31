import optionalChaining from '@babel/plugin-transform-optional-chaining';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns optional calls with Babel (loose=%s)', async loose => {
  await expect(
    alignBabelBehavior({
      source: `let reads = 0; const object = { value: 42, read() { return this.value; } };
const key = () => { reads++; return 'read'; };
globalThis.__result = [object?.[key()]?.(), null?.[key()], reads];`,
      filename: 'input.js',
      plugins: [[optionalChaining, { loose }]],
      noxcturnal: { transforms: { optionalChaining: { loose } } },
      output: { mustNotMatch: [/\?\./] },
    }),
  ).resolves.toEqual([42, undefined, 1]);
});

test('aligns thrown outcomes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const object = { get value() { throw new TypeError('read failed'); } };
globalThis.__result = object?.value;`,
      filename: 'input.js',
      plugins: [[optionalChaining, { loose: false }]],
      noxcturnal: { transforms: { optionalChaining: { loose: false } } },
      output: { mustNotMatch: [/\?\./] },
    }),
  ).resolves.toEqual({ throws: { name: 'TypeError', message: 'read failed' } });
});
