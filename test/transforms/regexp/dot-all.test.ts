import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers dot-all regular expressions', async () => {
  expect(
    await transformSource(`export const matcher = /a.b/s;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpDotAll: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = /a[^]b/;"`);
});
