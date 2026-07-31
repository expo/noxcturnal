import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('folds constant expressions', async () => {
  expect(
    await transformSource(`export const value = 2 * 3 + 1;`, 'input.js', {
      optimize: { constantFolding: true },
    }),
  ).toMatchInlineSnapshot(`"export const value = 7;"`);
});
