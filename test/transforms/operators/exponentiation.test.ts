import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers exponentiation', async () => {
  expect(
    await transformSource(`export const value = base ** power;`, 'input.js', {
      transforms: { exponentiationOperator: true },
    }),
  ).toMatchInlineSnapshot(`"export const value = Math.pow(base, power);"`);
});
