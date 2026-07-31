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
        privatePropertyInObject: { loose: true },
      },
    }),
  ).toMatchInlineSnapshot(`
    "export var Base = (() => {
      'use strict';
      var _value = '__private_Base_value';
      function Base() {
        if (!(this instanceof Base)) throw new TypeError('Cannot call a class as a function');
        Object.defineProperty(this, _value, {
          writable: true,
          value: 1,
        });
      }
      (function () {
        this.accepts = input => Object.prototype.hasOwnProperty.call(input, _value);
      }).call(Base);
      return Base;
    })();
    export class Child extends Base {}"
  `);
});
