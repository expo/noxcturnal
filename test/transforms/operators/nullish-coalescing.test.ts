import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers nullish coalescing', async () => {
  expect(
    await transformSource(`export const value = input ?? fallback;`, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "var _input;
    export const value = (_input = input) !== null && _input !== void 0 ? _input : fallback;"
  `);
});
