import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers Unicode regular expressions', async () => {
  expect(
    await transformSource(`export const matcher = /😀/u;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = /(?:\\uD83D\\uDE00)/;"`);
});
