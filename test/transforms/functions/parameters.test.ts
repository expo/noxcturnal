import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers default and rest parameters', async () => {
  const source = `export function join(first = 'a', ...rest) { return [first, rest]; }`;
  expect(await transformSource(source, 'input.js', { transforms: { parameters: true } }))
    .toMatchInlineSnapshot(`
      "export function join() {
        let first = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'a';
        for (var _len = arguments.length, rest = [], _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }
        return [first, rest];
      }"
    `);
});
