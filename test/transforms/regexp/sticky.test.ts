import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('handles sticky regular expressions', async () => {
  expect(
    await transformSource(`export const matcher = /value/y;`, 'input.js', {
      transforms: { regexpSticky: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = new RegExp('value', 'y');"`);
});
