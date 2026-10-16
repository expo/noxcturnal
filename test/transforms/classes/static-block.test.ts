import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers class static blocks', async () => {
  const source = `export class Counter { static { this.value = 1; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { classStaticBlock: true } }))
    .toMatchInlineSnapshot(`
      "var _staticBlock;
      export let Counter =
        (class Counter {
          static #_ = (_staticBlock = () => ((this.value = 1), this));
        },
        _staticBlock());"
    `);
});
