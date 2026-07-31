import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers private property checks', async () => {
  const source = `export class Counter { #value; has(input) { return #value in input; } }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privatePropertyInObject: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    export let Counter = (() => {
      'use strict';
      var _value = '__private_Counter_value';
      const Counter = function Counter() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        Object.defineProperty(this, _value, {
          writable: true,
          value: void 0,
        });
      };
      Object.defineProperty(Counter.prototype, 'has', {
        value: Object.defineProperty(
          function (input) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return Object.prototype.hasOwnProperty.call(_checkInRHS(input), _value);
          },
          'name',
          {
            value: 'has',
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
