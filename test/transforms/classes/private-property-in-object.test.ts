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
    "import _babelHelper from '@babel/runtime/helpers/classPrivateFieldLooseBase';
    import _babelHelper2 from '@babel/runtime/helpers/classPrivateFieldLooseKey';
    import _babelHelper3 from '@babel/runtime/helpers/checkInRHS';
    var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: _babelHelper,
      classPrivateFieldLooseKey: _babelHelper2,
    };
    function _classPrivateFieldLooseBase(e, s, a) {
      return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    var _checkInRHS2 = { checkInRHS: _babelHelper3 },
      _checkInRHS = _checkInRHS2.checkInRHS;
    export let Counter = (() => {
      'use strict';
      var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Counter_value');
      function _initialize() {
        Object.defineProperty(this, _value, {
          writable: true,
          value: void 0,
        });
      }
      const Counter = function Counter() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
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
