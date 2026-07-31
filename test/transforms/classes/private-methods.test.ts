import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers private methods', async () => {
  const source = `export class Counter { #increment(value) { return value + 1; } add(value) { return this.#increment(value); } }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { privateMethods: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
    };
    function _classPrivateFieldLooseBase(e, s) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    function _classPrivateMethodCall(e, s, a) {
      return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);
    }
    export let Counter = (() => {
      'use strict';
      var _increment = '__private_Counter_increment';
      const Counter = function Counter() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        Object.defineProperty(this, _increment, {
          value: function (value) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return value + 1;
          },
        });
      };
      Object.defineProperty(Counter.prototype, 'add', {
        value: Object.defineProperty(
          function (value) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _classPrivateMethodCall(this, _increment, [value]);
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
