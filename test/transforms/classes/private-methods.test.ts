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
    "import _babelHelper from '@babel/runtime/helpers/classPrivateFieldLooseBase';
    import _babelHelper2 from '@babel/runtime/helpers/classPrivateFieldLooseKey';
    var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: _babelHelper,
      classPrivateFieldLooseKey: _babelHelper2,
    };
    function _classPrivateFieldLooseBase(e, s, a) {
      return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    export let Counter = (() => {
      'use strict';
      var _increment = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
        '__private_Counter_increment',
      );
      var _privateMethod = function (value) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return value + 1;
      };
      function _initialize() {
        Object.defineProperty(this, _increment, { value: _privateMethod });
      }
      const Counter = function Counter() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
      };
      Object.defineProperty(Counter.prototype, 'add', {
        value: Object.defineProperty(
          function (value) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return _classPrivateFieldLooseBase(this, _increment)[_increment](value);
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
