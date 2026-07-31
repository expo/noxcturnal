import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers classes', async () => {
  const source = `export class Counter { add(value) { return value + 1; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { classes: true } }))
    .toMatchInlineSnapshot(`
      "export let Counter = (() => {
        'use strict';
        const Counter = function Counter() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Counter.prototype, 'add', {
          value: Object.defineProperty(
            function (value) {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return value + 1;
            },
            'name',
            {
              value: 'add',
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Counter, 'prototype', { writable: false });
        return Counter;
      })();"
    `);
});
