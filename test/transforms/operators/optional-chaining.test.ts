import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers optional chaining', async () => {
  expect(
    await transformSource(`export const value = input?.nested?.value;`, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "var _input;
    export const value =
      (_input = input) === null ||
      _input === void 0 ||
      (_input = _input.nested) === null ||
      _input === void 0
        ? void 0
        : _input.value;"
  `);
});
