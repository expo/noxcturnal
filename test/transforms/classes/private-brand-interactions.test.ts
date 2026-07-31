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
    "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
      _checkInRHS = _checkInRHS2.checkInRHS;
    export let Base = (() => {
      'use strict';
      var _value = '__private_Base_value';
      const Base = function Base() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        Object.defineProperty(this, _value, {
          writable: true,
          value: 1,
        });
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
