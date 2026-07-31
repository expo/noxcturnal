import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers private property checks', async () => {
  const source = `export class Counter { #value; has(input) { return #value in input; } }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privatePropertyInObject: { loose: true } },
    }),
  ).toMatchInlineSnapshot(`
    "export var Counter = (() => {
      'use strict';
      var _value = '__private_Counter_value';
      function Counter() {
        if (!(this instanceof Counter)) throw new TypeError('Cannot call a class as a function');
        Object.defineProperty(this, _value, {
          writable: true,
          value: void 0,
        });
      }
      Object.defineProperty(Counter.prototype, 'has', {
        value: function (input) {
          return Object.prototype.hasOwnProperty.call(input, _value);
        },
        writable: true,
        configurable: true,
      });
      return Counter;
    })();"
  `);
});
