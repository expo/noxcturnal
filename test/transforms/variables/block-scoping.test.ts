import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers block-scoped declarations', async () => {
  const source = `export function read(flag) { if (flag) { let value = 1; return value; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "export function read(flag) {
      if (flag) {
        var value = 1;
        return value;
      }
    }"
  `);
});
