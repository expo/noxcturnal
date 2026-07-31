import objectRestSpread from '@babel/plugin-transform-object-rest-spread';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns object rest/spread with Babel (loose=%s)', async loose => {
  const useBuiltIns = loose;
  await expect(
    alignBabelBehavior({
      source: `const source = { a: 20, b: 22 }; const { a, ...rest } = source;
globalThis.__result = [{ zero: 0, ...rest }.b + a, Object.keys(rest)];`,
      filename: 'input.js',
      plugins: [[objectRestSpread, { loose, useBuiltIns }]],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { objectRestSpread: { loose, useBuiltIns } },
      },
      output: { mustNotMatch: [/\.\.\.rest/] },
    }),
  ).resolves.toEqual([42, ['b']]);
});
