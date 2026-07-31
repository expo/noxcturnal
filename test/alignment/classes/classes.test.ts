import classes from '@babel/plugin-transform-classes';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns inheritance and super calls with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Base { constructor(value) { this.value = value; } read() { return this.value; } }
class Derived extends Base { read() { return super.read() * 2; } }
globalThis.__result = new Derived(21).read();`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustNotMatch: [/^\s*class\s/m, /\bsuper\s*\./] },
    }),
  ).resolves.toBe(42);
});

test('aligns ordinary public method names with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Example {
  method() {}
  static staticMethod() {}
}
globalThis.__result = [
  Example.prototype.method.name,
  Example.staticMethod.name,
];`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustMatch: [], mustNotMatch: [] },
    }),
  ).resolves.toEqual(['method', 'staticMethod']);
});

test('aligns anonymous class expression names with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const Variable = class {};
let Assigned;
Assigned = class {};
const object = { Property: class {}, 'StringProperty': class {} };
globalThis.__result = [
  Variable.name,
  Assigned.name,
  object.Property.name,
  object.StringProperty.name,
];`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustMatch: [], mustNotMatch: [/^\s*class\s/m] },
    }),
  ).resolves.toEqual(['Variable', 'Assigned', 'Property', 'StringProperty']);
});

test('aligns class binding and heritage evaluation semantics with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const order = [];
class Base {}
const heritage = () => (order.push('heritage'), Base);
const key = () => (order.push('key'), 'method');
let invalid;
class Child extends heritage() { [key()]() {} }
try { class Invalid extends { prototype: {} } {} }
catch (error) { invalid = error instanceof TypeError; }
{ class Scoped {} }
globalThis.__result = [order, invalid, typeof Scoped];`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustMatch: [], mustNotMatch: [/^\s*class\s/m] },
    }),
  ).resolves.toEqual([['heritage', 'key'], true, 'undefined']);
});

test('aligns constructor prototype descriptors with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `class Base { method() {} }
class Child extends Base {}
globalThis.__result = [Base, Child].map(value => {
  const descriptor = Object.getOwnPropertyDescriptor(value, 'prototype');
  return [descriptor.writable, descriptor.enumerable, descriptor.configurable];
});`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustMatch: [], mustNotMatch: [/^\s*class\s/m] },
    }),
  ).resolves.toEqual([
    [false, false, false],
    [false, false, false],
  ]);
});

test('aligns superclass prototype lookup before static inheritance setup', async () => {
  await expect(
    alignBabelBehavior({
      source: `const order = [];
const originalSetPrototypeOf = Object.setPrototypeOf;
Object.setPrototypeOf = function (target, prototype) {
  order.push('setPrototypeOf');
  return originalSetPrototypeOf(target, prototype);
};
function Base() {}
const Super = new Proxy(Base, {
  get(target, key, receiver) {
    if (key === 'prototype') order.push('prototype');
    return Reflect.get(target, key, receiver);
  },
});
class Child extends Super {}
Object.setPrototypeOf = originalSetPrototypeOf;
globalThis.__result = [order, new Child() instanceof Base];`,
      filename: 'input.js',
      plugins: [classes],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { classes: true } },
      output: { mustNotMatch: [/^\s*class\s/m] },
    }),
  ).resolves.toEqual([['prototype', 'setPrototypeOf'], true]);
});
