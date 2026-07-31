import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers class static blocks', async () => {
  const source = `export class Counter { static { this.value = 1; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { classStaticBlock: true } }))
    .toMatchInlineSnapshot(`
    "export class Counter {
      static #_ = (this.value = 1);
    }"
  `);
});
