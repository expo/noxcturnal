import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers class properties', async () => {
  const source = `export class Counter { value = 0; static name = 'counter'; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { classProperties: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "import _defineProperty from '@babel/runtime/helpers/defineProperty';
    export class Counter {
      constructor() {
        this.value = 0;
      }
    }
    _defineProperty(Counter, 'name', 'counter');"
  `);
});
