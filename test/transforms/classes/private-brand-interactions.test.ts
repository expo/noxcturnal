import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers inherited private brands referenced from a static block', async () => {
  const source = `
    export class Base {
      #value = 1;
      static { this.accepts = input => #value in input; }
    }
    export class Child extends Base {}
  `;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: {
        classStaticBlock: true,
        classProperties: { loose: true },
        privatePropertyInObject: true,
      },
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
    export let Base = (() => {
      'use strict';
      var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Base_value');
      function _initialize() {
        Object.defineProperty(this, _value, {
          writable: true,
          value: 1,
        });
      }
      const Base = function Base() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
      };
      Object.defineProperty(Base, 'prototype', { writable: false });
      (function () {
        this.accepts = input => Object.prototype.hasOwnProperty.call(_checkInRHS(input), _value);
      }).call(Base);
      return Base;
    })();
    export class Child extends Base {}"
  `);
});
