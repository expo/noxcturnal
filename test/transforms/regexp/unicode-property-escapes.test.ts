import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers Unicode property escapes', async () => {
  expect(
    await transformSource(String.raw`export const matcher = /\p{ASCII}+/u;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicodePropertyEscapes: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = /[\\u0000-\\u007F]+/u;"`);
});
