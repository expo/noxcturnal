import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers classes', async () => {
  const source = `export class Counter { add(value) { return value + 1; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { classes: true } }))
    .toMatchInlineSnapshot(`
    "export var Counter = (() => {
      'use strict';
      function Counter() {
        if (!(this instanceof Counter)) throw new TypeError('Cannot call a class as a function');
      }
      Object.defineProperty(Counter.prototype, 'add', {
        value: function (value) {
          return value + 1;
        },
        writable: true,
        configurable: true,
      });
      return Counter;
    })();"
  `);
});
