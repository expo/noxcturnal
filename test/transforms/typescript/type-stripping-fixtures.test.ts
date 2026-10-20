import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'x;',
  'a = 42;',
  'try {\n} catch (e) {}',
  'class A {}',
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nimport { computed } from 'mobx';\nclass Foo {\n  get id() {}\n}\n_decorate([computed], Foo.prototype, 'id', null);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nimport { observable } from 'mobx';\nclass Foo {\n  id = null;\n}\n_decorate([observable], Foo.prototype, 'id', void 0);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nimport { observer } from 'mobx-react';\nlet Foo = class Foo {};\nFoo = _decorate([observer], Foo);",
  '[syntax-error] invalid-input',
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass A {}\n_decorate([foo], A.prototype, 'y', void 0);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Foo {}\n_decorate([decorator], Foo.prototype, 'bar', void 0);",
  'export default class {}',
  'class A {\n  x;\n}',
  'class C extends D {}',
  'class C {}',
  'class C {\n  #m(x) {}\n  m(x, ...y) {}\n  constructor() {}\n}',
  "class Foo extends Bar {\n  foo() {}\n  bar = 'bar';\n}",
  "class B extends A {\n  p;\n  constructor(p) {\n    var _initialize = () => ((this.p = p), this);\n    console.log('anything before super');\n    if (p) _initialize(super());\n    else {\n      _initialize(super());\n    }\n  }\n}",
  'class Employee extends Person {\n  name;\n  constructor(name) {\n    super();\n    this.name = name;\n  }\n}',
  'class Person {\n  name;\n  constructor(name) {\n    this.name = name;\n  }\n}',
  'export default class Example {\n  arg1;\n  constructor(arg1 = null) {\n    this.arg1 = arg1;\n  }\n}',
  'class C extends Object {\n  x;\n  constructor(x) {\n    super();\n    this.x = x;\n  }\n}',
  'class C {\n  x;\n  y;\n  z;\n  constructor(x, y = 0, z = 0) {\n    this.x = x;\n    this.y = y;\n    this.z = z;\n  }\n}',
  "class Test {\n  #f(x) {\n    return typeof x === 'string' ? parseInt(x) : x.toString();\n  }\n}",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass C {\n  a;\n  b = 0;\n  c = 1;\n  d;\n  e = 3;\n  f;\n  g;\n  #h;\n  #i = 10;\n}\n_decorate([foo], C.prototype, 'd', void 0);\n_decorate([foo], C.prototype, 'e', void 0);\n_decorate([foo], C.prototype, 'g', void 0);",
  'class A {\n  y;\n}',
  '',
  'export {};',
  "// Not type-correct code\nvar E = (function (E) {\n  E[(E['A'] = true)] = 'A';\n  return E;\n})(E || {});",
  '// With --isolatedModules, TSC ignores the "const" modifier when compiling enums\nvar E = /* @__PURE__ */ (function (E) {\n  return E;\n})(E || {});',
  "var E = /* @__PURE__ */ (function (E) {\n  E[(E['a'] = 0)] = 'a';\n  E[(E['b'] = 3)] = 'b';\n  E[(E['c'] = 1)] = 'c';\n  E[(E['d'] = 2)] = 'd';\n  E[(E['e'] = 4)] = 'e';\n  E[(E['f'] = 8)] = 'f';\n  E[(E['g'] = 5)] = 'g';\n  E[(E['h'] = 6)] = 'h';\n  E[(E['i'] = 0.6666666666666666)] = 'i';\n  E[(E['j'] = 7)] = 'j';\n  E[(E['k'] = -2)] = 'k';\n  E[(E['l'] = 0.5)] = 'l';\n  E[(E['m'] = 8589934592)] = 'm';\n  E[(E['n'] = 9)] = 'n';\n  E[(E['o'] = -1)] = 'o';\n  E[(E['p'] = -3)] = 'p';\n  E[(E['q'] = 5.4)] = 'q';\n  E[(E['r'] = 6.4)] = 'r';\n  return E;\n})(E || {});",
  "const Cat = 10;\nconst Dog = 20;\nvar Animals = /* @__PURE__ */ (function (Animals) {\n  Animals[(Animals['Cat'] = 1)] = 'Cat';\n  return Animals;\n})(Animals || {});\nAnimals = /* @__PURE__ */ (function (Animals) {\n  Animals[(Animals['Dog'] = 2)] = 'Dog';\n  return Animals;\n})(Animals || {});\nAnimals = /* @__PURE__ */ (function (Animals) {\n  Animals[(Animals['CatDog'] = 3)] = 'CatDog';\n  return Animals;\n})(Animals || {});",
  "var Animals = /* @__PURE__ */ (function (Animals) {\n  Animals[(Animals['Cat'] = 1)] = 'Cat';\n  Animals[(Animals['Dog'] = 2)] = 'Dog';\n  return Animals;\n})(Animals || {});\nAnimals = /* @__PURE__ */ (function (Animals) {\n  Animals[(Animals['CatDog'] = -1)] = 'CatDog';\n  return Animals;\n})(Animals || {});",
  "export let E = /* @__PURE__ */ (function (E) {\n  E[(E['A'] = 1)] = 'A';\n  return E;\n})({});\nE = /* @__PURE__ */ (function (E) {\n  E[(E['B'] = 2)] = 'B';\n  return E;\n})(E || {});",
  "var E = /* @__PURE__ */ (function (E) {\n  E[(E['x'] = 0)] = 'x';\n  E[(E['y'] = 1)] = 'y';\n  return E;\n})(E || {});",
  "var E = /* @__PURE__ */ (function (E) {\n  E[(E['a'] = 10)] = 'a';\n  E[(E['b'] = 10)] = 'b';\n  return E;\n})(E || {});",
  "var x = 10;\nvar Foo = (function (Foo) {\n  Foo[(Foo['a'] = 10)] = 'a';\n  Foo[(Foo['b'] = 10)] = 'b';\n  Foo[(Foo['c'] = Foo.b + x)] = 'c';\n  return Foo;\n})(Foo || {});\nvar Bar = (function (Bar) {\n  Bar[(Bar['D'] = 10)] = 'D';\n  Bar[(Bar['E'] = 10)] = 'E';\n  Bar[(Bar['F'] = Math.E)] = 'F';\n  Bar[(Bar['G'] = Bar.E + Foo.c)] = 'G';\n  return Bar;\n})(Bar || {});\nvar Baz = (function (Baz) {\n  Baz[(Baz['a'] = 0)] = 'a';\n  Baz[(Baz['b'] = 1)] = 'b';\n  // @ts-ignore\n  Baz[(Baz['x'] = Baz.a.toString())] = 'x';\n  return Baz;\n})(Baz || {});\nvar A = (function (A) {\n  A[(A['a'] = 0)] = 'a';\n  A[\n    (A['b'] = (() => {\n      let a = 1;\n      return a + 1;\n    })())\n  ] = 'b';\n  A[\n    (A['c'] = (() => {\n      return A.a + 2;\n    })())\n  ] = 'c';\n  return A;\n})(A || {});",
  "var A = 'hello';\nvar Foo = (function (Foo) {\n  Foo[(Foo['A'] = Math.random())] = 'A';\n  Foo[(Foo['B'] = Foo.A)] = 'B';\n  Foo[(Foo['C'] = (() => Foo.A)())] = 'C';\n  Foo[\n    (Foo['D'] = (() => {\n      const A = 1;\n      return (() => A)();\n    })())\n  ] = 'D';\n  return Foo;\n})(Foo || {});",
  '[syntax-error] invalid-input',
  "var E = /* @__PURE__ */ (function (E) {\n  E[(E['x'] = 1)] = 'x';\n  E[(E['y'] = 2)] = 'y';\n  return E;\n})(E || {});\nE = /* @__PURE__ */ (function (E) {\n  E[(E['z'] = 3)] = 'z';\n  return E;\n})(E || {});",
  "var socketType = /* @__PURE__ */ (function (socketType) {\n  socketType[(socketType['SOCKET'] = 0)] = 'SOCKET';\n  socketType[(socketType['SERVER'] = 1)] = 'SERVER';\n  socketType[(socketType['IPC'] = 2)] = 'IPC';\n  return socketType;\n})(socketType || {});\nvar constants = /* @__PURE__ */ (function (constants) {\n  constants[(constants['SOCKET'] = 0)] = 'SOCKET';\n  constants[(constants['SERVER'] = 1)] = 'SERVER';\n  constants[(constants['IPC'] = 2)] = 'IPC';\n  constants[(constants['UV_READABLE'] = 3)] = 'UV_READABLE';\n  constants[(constants['UV_WRITABLE'] = 4)] = 'UV_WRITABLE';\n  return constants;\n})(constants || {});",
  "const BAR = (2).toFixed(0);\nvar Foo = (function (Foo) {\n  Foo['A'] = `${BAR}`;\n  Foo['B'] = '2' + BAR;\n  Foo['C'] = `${BAR}`;\n  Foo[(Foo['D'] = `${BAR}}`)] = 'D';\n  Foo[(Foo['E'] = `${BAR}`)] = 'E';\n  return Foo;\n})(Foo || {});",
  "{\n  // Uses 'let' within a scope\n  let E = /* @__PURE__ */ (function (E) {\n    return E;\n  })({});\n}",
  "var E = /* @__PURE__ */ (function (E) {\n  E['A'] = 'Hey';\n  return E;\n})(E || {});",
  "var E = /* @__PURE__ */ (function (E) {\n  E[(E['A'] = 0)] = 'A';\n  E['B'] = '';\n  E[(E['A2'] = 0)] = 'A2';\n  E['B2'] = '';\n  return E;\n})(E || {});",
  "var E = /* @__PURE__ */ (function (E) {\n  E['A'] = 'HALLOWERLD';\n  return E;\n})(E || {});",
  "// ts 5.0 feature\nconst BaseValue = 10;\nconst Prefix = '/data';\nvar Values = (function (Values) {\n  Values[(Values['First'] = BaseValue)] = 'First';\n  Values[(Values['Second'] = 1 + Values['First'])] = 'Second';\n  Values[(Values['Third'] = 1 + Values['Second'])] = 'Third';\n  return Values;\n})(Values || {});\nconst xxx = 100 + Values.First;\nconst yyy = xxx;\nvar Routes = (function (Routes) {\n  Routes['Parts'] = `${Prefix}/parts`;\n  Routes['Invoices'] = `${Prefix}/invoices`;\n  Routes['x'] = `${Values.First}/x`;\n  Routes['y'] = `${yyy}/y`;\n  return Routes;\n})(Routes || {});",
  'export class N {\n  f1(value) {\n    value.f2();\n  }\n}\nexport default N;',
  'function Signal(value) {\n  this.value = value;\n}\nexport { Signal };\nfunction Signal2(value) {\n  this.value = value;\n}\nexport { Signal2 };',
  "export class C2 {}\nexport { C2 as C3 };\nvar BB = /* @__PURE__ */ (function (BB) {\n  BB[(BB['K'] = 0)] = 'K';\n  return BB;\n})(BB || {});\nBB = /* @__PURE__ */ (function (BB) {\n  BB['L'] = 'LL';\n  return BB;\n})(BB || {});\nexport { BB };\nexport { BB as BB1 };\nvar BB2 = /* @__PURE__ */ (function (BB2) {\n  return BB2;\n})(BB2 || {});\nfunction foo() {}\nexport { BB2 as BB3, foo };\nexport { C2 as C4 };",
  'export default function (choiceField, selection) {}',
  "export default 'foo';",
  'var None = /* @__PURE__ */ (function (None) {\n  return None;\n})(None || {});\nexport {};',
  'export default undefined;',
  "export { bar } from './bar';",
  'export default Math;',
  "import * as joint from '@joint/core';\nexport var JGraph = joint.dia.Graph;",
  'module.exports = 0;',
  "import C from 'C';\nexport { C };",
  "/**\n * @module\n */\nimport '../message-bus';\nvar a;",
  "/**\n * @module\n */\nimport '../message-bus';",
  'var a;\nexport {};',
  'export class N {}\nexport default N;',
  'class Foo {}\nexport {};',
  "export { A3 } from 'a';",
  'function f() {}\nexport { f };',
  'function f() {}',
  'function f(x, ...y) {}\nfunction g(x = 0) {}',
  'function f() {}\nconst o = { m() {} };\nclass C {\n  m() {}\n}\nconst g = { get m() {} };\nconst s = { set m(value) {} };',
  'function foo(...args) {}',
  'a();',
  "/* @jsx jsx.htm */\n// Don't elide htm if a JSX element appears somewhere.\nimport * as jsx from 'fake-jsx-package';\n<div></div>;",
  "/* @jsx htm */\n// Don't elide htm if a JSX element appears somewhere.\nimport { htm } from 'fake-jsx-package';\n<div></div>;",
  "/* @jsxFrag jsx.htm */\n// Don't elide htm if a JSX fragment appears somewhere.\nimport * as jsx from 'fake-jsx-package';\n<></>;",
  "/* @jsxFrag htm */\n// Don't elide htm if a JSX fragment appears somewhere.\nimport { htm } from 'fake-jsx-package';\n<></>;",
  "import 'a';\nimport 'b';",
  '<div></div>;\n<></>;\nexport {};',
  '<></>;\nexport {};',
  'const x = 0;\nexport {};',
  "// Don't elide React if a JSX element appears somewhere.\nimport * as React from 'react';\n<div></div>;",
  "// Don't elide React if a JSX element appears somewhere.\nimport * as React from 'react';\n<div />;",
  "// Don't elide React if a JSX fragment appears somewhere.\nimport * as React from 'react';\n<></>;",
  "import { A } from './mod';\nA;\nimport B from './mod';\nB;",
  "import { A } from 'm';\nclass Class extends A {}\nconst x = 0;\nconst y = 0;",
  "import 'lib';\nimport { Used } from 'lib';\nimport Used2 from 'lib';\nimport * as Used3 from 'lib';\nconst x = Used;\nconst y = Used2;\nconst z = Used3;",
  "var Enum = /* @__PURE__ */ (function (Enum) {\n  Enum[(Enum['A'] = 0)] = 'A';\n  return Enum;\n})(Enum || {});\nexport {};",
  "import { A } from 'lib';\nvar Enum = (function (Enum) {\n  Enum[(Enum['id'] = A)] = 'id';\n  return Enum;\n})(Enum || {});",
  "import 'f';\nimport 'g';",
  'function Foo() {}\nfunction Foo2() {}\nexport {};',
  'var foo = bar;\nfoo.x;',
  "const lib = require('lib');\nlib();",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction _decorateParam(index, decorator) {\n  return function (target, key) {\n    decorator(target, key, index);\n  };\n}\nimport { NgModule, Optional, SkipSelf } from '@angular/core';\nlet CoreModule = class CoreModule {\n  constructor(parentModule) {}\n};\nCoreModule = _decorate(\n  [NgModule({}), _decorateParam(0, Optional()), _decorateParam(0, SkipSelf())],\n  CoreModule,\n);\nexport { CoreModule };",
  "const obj = { A: 'foo' };\nexport {};",
  "import { Foo1 } from 'Foo';\nFoo1;",
  'x += 1;',
  'var AliasModule = LongNameModule;\nconst some = 3;\nconst bar = AliasModule.foo;\nconst baz = AliasModule.Inner.bar;\nlet str;\nlet node;\nconsole.log(some);\nexport {};',
  "let Validation;\n(function (_Validation) {\n  const lettersRegexp = /^[A-Za-z]+$/;\n  const numberRegexp = /^[0-9]+$/;\n  class LettersOnlyValidator {\n    constructor() {\n      console.log('1');\n    }\n    isAcceptable(s) {\n      return lettersRegexp.test(s);\n    }\n  }\n  _Validation.LettersOnlyValidator = LettersOnlyValidator;\n  class ZipCodeValidator {\n    isAcceptable(s) {\n      return s.length === 5 && numberRegexp.test(s);\n    }\n  }\n  _Validation.ZipCodeValidator = ZipCodeValidator;\n})(Validation || (Validation = {}));\nlet strings = ['Hello', '98052', '101'];\nlet validators = {};\nvalidators['ZIP code'] = new Validation.ZipCodeValidator();\nvalidators['Letters only'] = new Validation.LettersOnlyValidator();\nfor (let s of strings) {\n  for (let name in validators) {\n    console.log(\n      `\"${s}\" - ${validators[name].isAcceptable(s) ? 'matches' : 'does not match'} ${name}`,\n    );\n  }\n}",
  'class A {}\n(function (_A) {\n  const B = (_A.B = 1);\n})(A || (A = {}));',
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['C'] = 2)] = 'C';\n  return A;\n})(A || {});\n(function (_A) {\n  const B = (_A.B = 1);\n})(A || (A = {}));",
  'export class N {}\n(function (_N) {\n  var x;\n})(N || (N = {}));\nexport default N;',
  "import N from 'n';\n(function (_N) {\n  var x;\n})(N || (N = {}));",
  'let N;\n(function (_N) {\n  let N;\n  (function (_N2) {\n    var x;\n  })(N || (N = {}));\n  let constructor;\n  (function (_constructor) {\n    var x;\n  })(constructor || (constructor = {}));\n  let length;\n  (function (_length) {\n    var x;\n  })(length || (length = {}));\n  let concat;\n  (function (_concat) {\n    var x;\n  })(concat || (concat = {}));\n  let copyWithin;\n  (function (_copyWithin) {\n    var x;\n  })(copyWithin || (copyWithin = {}));\n  let fill;\n  (function (_fill) {\n    var x;\n  })(fill || (fill = {}));\n  let find;\n  (function (_find) {\n    var x;\n  })(find || (find = {}));\n  let findIndex;\n  (function (_findIndex) {\n    var x;\n  })(findIndex || (findIndex = {}));\n  let lastIndexOf;\n  (function (_lastIndexOf) {\n    var x;\n  })(lastIndexOf || (lastIndexOf = {}));\n  let pop;\n  (function (_pop) {\n    var x;\n  })(pop || (pop = {}));\n  let push;\n  (function (_push) {\n    var x;\n  })(push || (push = {}));\n  let reverse;\n  (function (_reverse) {\n    var x;\n  })(reverse || (reverse = {}));\n  let shift;\n  (function (_shift) {\n    var x;\n  })(shift || (shift = {}));\n  let unshift;\n  (function (_unshift) {\n    var x;\n  })(unshift || (unshift = {}));\n  let slice;\n  (function (_slice) {\n    var x;\n  })(slice || (slice = {}));\n  let sort;\n  (function (_sort) {\n    var x;\n  })(sort || (sort = {}));\n  let splice;\n  (function (_splice) {\n    var x;\n  })(splice || (splice = {}));\n  let includes;\n  (function (_includes) {\n    var x;\n  })(includes || (includes = {}));\n  let indexOf;\n  (function (_indexOf) {\n    var x;\n  })(indexOf || (indexOf = {}));\n  let join;\n  (function (_join) {\n    var x;\n  })(join || (join = {}));\n  let keys;\n  (function (_keys) {\n    var x;\n  })(keys || (keys = {}));\n  let entries;\n  (function (_entries) {\n    var x;\n  })(entries || (entries = {}));\n  let values;\n  (function (_values) {\n    var x;\n  })(values || (values = {}));\n  let forEach;\n  (function (_forEach) {\n    var x;\n  })(forEach || (forEach = {}));\n  let filter;\n  (function (_filter) {\n    var x;\n  })(filter || (filter = {}));\n  let map;\n  (function (_map) {\n    var x;\n  })(map || (map = {}));\n  let every;\n  (function (_every) {\n    var x;\n  })(every || (every = {}));\n  let some;\n  (function (_some) {\n    var x;\n  })(some || (some = {}));\n  let reduce;\n  (function (_reduce) {\n    var x;\n  })(reduce || (reduce = {}));\n  let reduceRight;\n  (function (_reduceRight) {\n    var x;\n  })(reduceRight || (reduceRight = {}));\n  let toLocaleString;\n  (function (_toLocaleString) {\n    var x;\n  })(toLocaleString || (toLocaleString = {}));\n  let toString;\n  (function (_toString) {\n    var x;\n  })(toString || (toString = {}));\n  let flat;\n  (function (_flat) {\n    var x;\n  })(flat || (flat = {}));\n  let flatMap;\n  (function (_flatMap) {\n    var x;\n  })(flatMap || (flatMap = {}));\n})(N || (N = {}));',
  'let X;\n(function (_X) {\n  var i18n;\n})(X || (X = {}));\nexport class i18n {}',
  'export let N;\n(function (_N) {})(N || (N = {}));',
  'let a;\n(function (_a) {\n  let c;\n  (function (_c) {\n    var x;\n  })(c || (c = {}));\n})(a || (a = {}));\nlet WithTypes;\n(function (_WithTypes) {\n  let d;\n  (function (_d) {})(d || (d = {}));\n})(WithTypes || (WithTypes = {}));\nlet WithValues;\n(function (_WithValues) {\n  let a;\n  (function (_a2) {\n    class A {}\n  })(a || (a = {}));\n  let b;\n  (function (_b) {\n    let B = /* @__PURE__ */ (function (B) {\n      return B;\n    })({});\n  })(b || (b = {}));\n  let c;\n  (function (_c2) {\n    function C() {}\n  })(c || (c = {}));\n  let d;\n  (function (_d2) {\n    var D;\n  })(d || (d = {}));\n  let e;\n  (function (_e) {\n    E;\n  })(e || (e = {}));\n})(WithValues || (WithValues = {}));',
  'export let N;\n(function (_N) {\n  var x;\n})(N || (N = {}));',
  'let N;\n(function (_N) {\n  var x;\n})(N || (N = {}));\n(function (_N2) {\n  var y;\n})(N || (N = {}));',
  '[bailout] preflight:mutable-namespace-export',
  'class C {}\nlet N;\n(function (_N) {\n  const { a } = C;\n  _N.a = a;\n  const [b] = C;\n  _N.b = b;\n  const [\n      {\n        a: [{ b: c }],\n      },\n    ] = A,\n    { a: { b: { d = 1 } } = {}, ...e } = C;\n  ((_N.c = c), (_N.d = d), (_N.e = e));\n})(N || (N = {}));',
  "export let A;\n(function (_A) {\n  let G = /* @__PURE__ */ (function (G) {\n    G[(G['H'] = 0)] = 'H';\n    return G;\n  })({});\n  _A.G = G;\n})(A || (A = {}));",
  'export let ui;\n(function (_ui) {\n  let a;\n  (function (_a) {\n    const x = (_a.x = 1);\n  })(a || (a = _ui.a || (_ui.a = {})));\n})(ui || (ui = {}));\n(function (_ui2) {\n  let b;\n  (function (_b) {\n    const y = (_b.y = 2);\n  })(b || (b = _ui2.b || (_ui2.b = {})));\n})(ui || (ui = {}));',
  'let X;\n(function (_X) {\n  let Y;\n  (function (_Y) {\n    const Z = (_Y.Z = 1);\n  })(Y || (Y = _X.Y || (_X.Y = {})));\n})(X || (X = {}));\nlet proj;\n(function (_proj) {\n  let data;\n  (function (_data) {\n    let util;\n    (function (_util) {\n      let api;\n      (function (_api) {\n        const X = (_api.X = 1);\n      })(api || (api = _util.api || (_util.api = {})));\n    })(util || (util = _data.util || (_data.util = {})));\n  })(data || (data = _proj.data || (_proj.data = {})));\n})(proj || (proj = {}));',
  "class A {}\n(function (_A) {\n  let C;\n  (function (_C) {\n    class G {}\n    _C.G = G;\n    const E = (_C.E = 7);\n  })(C || (C = _A.C || (_A.C = {})));\n  function M() {}\n  (function (_M) {\n    const N = (_M.N = C.E);\n  })(M || (M = {}));\n  function D() {}\n  _A.D = D;\n  (function (_D) {\n    const C = 5;\n    let H = /* @__PURE__ */ (function (H) {\n      H[(H['I'] = 11)] = 'I';\n      H[(H['J'] = 13)] = 'J';\n      H[(H['K'] = 17)] = 'K';\n      return H;\n    })({});\n    _D.H = H;\n  })(D || (D = _A.D || (_A.D = {})));\n  class F {}\n  (function (_F) {\n    var x;\n  })(F || (F = {}));\n  let G;\n  (function (_G) {\n    var x;\n  })(G || (G = {}));\n  let L = /* @__PURE__ */ (function (L) {\n    L[(L['M'] = 19)] = 'M';\n    return L;\n  })({});\n})(A || (A = {}));",
  'let N;\n(function (_N8) {\n  let _N7;\n  (function (_N9) {\n    var x;\n  })(_N7 || (_N7 = {}));\n  let N;\n  (function (_N10) {\n    function _N3() {}\n    _N10._N3 = _N3;\n  })(N || (N = _N8.N || (_N8.N = {})));\n  (function (_N11) {\n    class _N5 {}\n    _N11._N5 = _N5;\n  })(N || (N = _N8.N || (_N8.N = {})));\n  (function (_N12) {\n    let _N = /* @__PURE__ */ (function (_N) {\n      return _N;\n    })({});\n    _N12._N = _N;\n  })(N || (N = _N8.N || (_N8.N = {})));\n})(N || (N = {}));',
  'let N;\n(function (_N) {\n  var x;\n})(N || (N = {}));',
  "export let A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 3)] = 'x';\n  A['y'] = 'f';\n  A[(A['z'] = 16)] = 'z';\n  A['w'] = 'f';\n  return A;\n})({});\nA.x;\nA.y;\nA.z;\nA.w;",
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 3)] = 'x';\n  A['y'] = 'f';\n  A[(A['z'] = 16)] = 'z';\n  A['w'] = 'f';\n  return A;\n})(A || {});\nA.x;\nA.y;\nA.z;\nA.w;",
  'A.x;',
  "var WhitespaceFlag = /* @__PURE__ */ (function (WhitespaceFlag) {\n  WhitespaceFlag[(WhitespaceFlag['before'] = 1)] = 'before';\n  WhitespaceFlag[(WhitespaceFlag['after'] = 2)] = 'after';\n  return WhitespaceFlag;\n})(WhitespaceFlag || {});\nexport { WhitespaceFlag as WF2 };\nexport const before = WhitespaceFlag.before;",
  "var WhitespaceFlag = /* @__PURE__ */ (function (WhitespaceFlag) {\n  WhitespaceFlag[(WhitespaceFlag['before'] = 1)] = 'before';\n  WhitespaceFlag[(WhitespaceFlag['after'] = 2)] = 'after';\n  return WhitespaceFlag;\n})(WhitespaceFlag || {});\nexport const before = WhitespaceFlag.before;",
  "export let A = /* @__PURE__ */ (function (A) {\n  A[(A['y'] = 0)] = 'y';\n  return A;\n})({});\nlet x = A.y;",
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['y'] = 0)] = 'y';\n  return A;\n})(A || {});\nlet x = A.y;\nexport { A };",
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 0)] = 'x';\n  return A;\n})(A || {});\n{\n  let A = {};\n  A.x;\n}\nA.x;",
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 0)] = 'x';\n  A[(A['y'] = 1)] = 'y';\n  return A;\n})(A || {});\nA.x;\nA['y'];\nA.z;\nA;",
  "export let A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 0)] = 'x';\n  A[(A['y'] = 1)] = 'y';\n  return A;\n})({});\nA = /* @__PURE__ */ (function (A) {\n  A[(A['z'] = 0)] = 'z';\n  return A;\n})(A || {});\nA.x;\nA['y'];\nA.z;\nA.w;\nA;",
  "var A = /* @__PURE__ */ (function (A) {\n  A[(A['x'] = 0)] = 'x';\n  A[(A['y'] = 1)] = 'y';\n  return A;\n})(A || {});\nA = /* @__PURE__ */ (function (A) {\n  A[(A['z'] = 0)] = 'z';\n  return A;\n})(A || {});\nA.x;\nA['y'];\nA.z;\nA.w;\nA;",
  "export let Tags;\n(function (_Tags) {\n  let TagsType = /* @__PURE__ */ (function (TagsType) {\n    TagsType[(TagsType['Unknown'] = 0)] = 'Unknown';\n    TagsType[(TagsType['PC'] = 1)] = 'PC';\n    TagsType[(TagsType['Mobile'] = 2)] = 'Mobile';\n    TagsType[(TagsType['Console'] = 3)] = 'Console';\n    return TagsType;\n  })({});\n  _Tags.TagsType = TagsType;\n})(Tags || (Tags = {}));",
  'export default 2;',
  'const { result } = idArray.reduce((a, b) => {}, { result: [] });',
  'export class Something {\n  messaging;\n  constructor(messaging) {\n    this.messaging = messaging;\n  }\n}',
  "const v = 42;\nconst v2 = Infinity;\nconst v3 = NaN;\n{\n  let Infinity = 1;\n  let NaN = 2;\n  let StateEnum = (function (StateEnum) {\n    StateEnum[(StateEnum['okay'] = 0)] = 'okay';\n    StateEnum[(StateEnum['neg'] = -Infinity)] = 'neg';\n    StateEnum[(StateEnum['pos'] = Infinity)] = 'pos';\n    StateEnum[(StateEnum['nan'] = NaN)] = 'nan';\n    StateEnum[(StateEnum['negReal'] = -Infinity)] = 'negReal';\n    StateEnum[(StateEnum['posReal'] = Infinity)] = 'posReal';\n    StateEnum[(StateEnum['nanReal'] = NaN)] = 'nanReal';\n    StateEnum[(StateEnum['ext'] = v)] = 'ext';\n    StateEnum[(StateEnum['ext2'] = v2)] = 'ext2';\n    StateEnum[(StateEnum['ext3'] = v3)] = 'ext3';\n    return StateEnum;\n  })({});\n}",
  'f();',
  'f;',
  'new C();',
  'x?.f();\nx?.f?.();\nf?.();',
  'f``;',
  '<C></C>;\n<C />;',
  'let x;',
  'const a = 1;\nconst b = () => a?.b?.c.d;',
  'const n = 0;\nconst [a, b] = 0;\nconst { x, y } = 0;',
] as const;

export const fixtureCases = [
  {
    title: 'cast — as expression (input)',
    source: 'x as T;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'cast — multiple assert and assign (input)',
    source: '(a as number as any) = 42;',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'cast — non null assertion (input)',
    source: 'x!;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'cast — type assertion (input)',
    source: '<T> x;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'catch clause — param type (input)',
    source: 'try {} catch (e: any) {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'class — abstract allowDeclareFields false (input)',
    source: 'abstract class A {\n    abstract prop: string;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'class — abstract class decorated method (input)',
    source:
      "import { computed } from 'mobx';\n\nabstract class Foo {\n  @computed get id() {}\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'class — abstract class decorated parameter (input)',
    source:
      "import { observable } from 'mobx';\n\nabstract class Foo {\n  @observable id = null;\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'class — abstract class decorated (input)',
    source: "import { observer } from 'mobx-react';\n\n@observer\nabstract class Foo {}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'class — accessor allowDeclareFields false (input)',
    source:
      'abstract class Foo {\n  accessor prop: number = 1;\n  static accessor prop2: number = 1;\n  accessor #prop3: number = 1;\n  accessor [prop4]: number = 1;\n  private accessor prop5: number = 1;\n  abstract accessor prop6: number;\n  private accessor #p: any;\n\n  accessor a!: any;\n  accessor aa!: any;\n  abstract accessor #s;\n  abstract accessor f = 1;\n  readonly accessor g;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'class — declare (input)',
    source: 'class A {\n  declare x;\n  @foo declare y: string;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'class — decorated declare properties (input)',
    source: 'class Foo {\n  @decorator declare bar: string;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'class — export default abstract (input)',
    source: 'export default abstract class {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'class — field not initialized (input)',
    source: 'class A {\n  x;\n}',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'class — head (input)',
    source: 'abstract class C<T> extends D<T> implements I {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'class — index signature (input)',
    source: 'class C {\n    [s: string]: number;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'class — methods (input)',
    source:
      'class C {\n    #m(x: number): void {}\n    m(): void;\n    public m(x?: number, ...y: number[]): void {}\n    public constructor() {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'class — override (input)',
    source: 'class Foo extends Bar {\n  override foo() {}\n  override bar: string = "bar";\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'class — parameter properties late super (input)',
    source:
      "class B extends A {\n  constructor(public p: string) {\n    console.log('anything before super');\n    if (p) super();\n    else {\n      super();\n    }\n  }\n}",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'class — parameter properties with class and super (input)',
    source:
      'class Employee extends Person {\n  constructor(public name: string) {\n    super();\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'class — parameter properties with class (input)',
    source: 'class Person {\n  constructor(public name: string) {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'class — parameter properties with parameters (input)',
    source: 'export default class Example {\n  constructor(public arg1 = null) { }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'class — parameter properties with super (input)',
    source: 'class C extends Object {\n    constructor(public x) {\n        super();\n    }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'class — parameter properties (input)',
    source: 'class C {\n    constructor(public x, public y = 0, public z: number = 0) {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'class — private method override transform private (input)',
    source:
      "class Test {\n  #f(x: string): number;\n  #f(x: number): string;\n  #f(x: string | number): string | number {\n    return (typeof x === 'string') ? parseInt(x) : x.toString();\n  }\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'class — properties (input)',
    source:
      'class C {\n    public a?: number;\n    private b: number = 0;\n    readonly c: number = 1;\n    @foo d: number;\n    @foo e: number = 3;\n    f!: number;\n    @foo g!: number;\n    #h: string;\n    #i: number = 10;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'class — transform properties declare wrong order (input)',
    source: 'class A {\n  declare x;\n  y;\n}',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'class — uninitialized definite (input)',
    source: 'class A {\n  x!: number;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'declarations — const enum (input)',
    source: 'declare const enum E {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'declarations — erased (input)',
    source:
      '; // Otherwise-empty file\ndeclare const x: number;\ndeclare function f(): void;\ndeclare class C {}\ndeclare enum E {}\ndeclare module "m" {}\ndeclare namespace N {}\nexport interface I {}\nexport type T = number;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'declarations — export declare enum (input)',
    source: 'export declare enum A {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'declarations — nested namespace (input)',
    source: '; // Otherwise-empty file\nexport declare namespace P {\n  export namespace C {}\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'enum — boolean value (input)',
    source: '// Not type-correct code\nenum E {\n  A = true\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'enum — const (input)',
    source:
      '// With --isolatedModules, TSC ignores the "const" modifier when compiling enums\nconst enum E {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'enum — constant folding (input)',
    source:
      'enum E {\n    a,\n    b = 1 | 2,\n    c = 1 & 3,\n    d = 4 >> 1,\n    e = 8 >>> 1,\n    f = 1 << 3,\n    g = 2 ^ 7,\n    h = 2 * 3,\n    i = 2 / 3,\n    j = 2 + 5,\n    k = 2 - 4,\n    l = 2.5 % 2,\n    m = 2 ** 33,\n    n = +9,\n    o = -1,\n    p = ~2,\n    q = 1 + 2 - 3 * 4 / -5,\n    r,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'enum — enum merging inner references shadow (input)',
    source:
      'const Cat = 10;\nconst Dog = 20;\n\nenum Animals {\n\tCat = 1\n}\n\nenum Animals {\n\tDog = 2\n}\n\nenum Animals {\n\tCatDog =  Cat | Dog\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'enum — enum merging inner references (input)',
    source: 'enum Animals {\n\tCat = 1,\n\tDog = 2\n}\nenum Animals {\n\tCatDog =  Cat - Dog\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'enum — export (input)',
    source: 'export enum E {\n    A = 1\n}\nexport enum E {\n    B = 2\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'enum — inferred (input)',
    source: 'enum E {\n    x,\n    y,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'enum — inner references (input)',
    source: 'enum E {\n    a = 10,\n    b = a,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'enum — mix references (input)',
    source:
      'var x = 10;\n\nenum Foo {\n    a = 10,\n    b = a,\n    c = b + x,\n}\n\nenum Bar {\n    D = Foo.a,\n    E = D,\n    F = Math.E,\n    G = E + Foo.c,\n}\n\nenum Baz {\n    a = 0,\n    b = 1,\n    // @ts-ignore\n    x = a.toString(),\n}\n\nenum A {\n    a = 0,\n    b = (() => { let a = 1; return a + 1 })(), // a is shadowed\n    c = (() => { return a + 2 })(), // a refers to A.a\n}',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'enum — non constant member reference (input)',
    source:
      "var A = 'hello';\nenum Foo {\n  A = Math.random(),\n  B = A,\n  C = (() => A)(),\n  D = (() => {\n    const A = 1;\n    return (() => A)()\n  })(),\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'enum — non foldable constant (input)',
    source: 'enum E {\n    a = Math.sin(1),\n    b,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'enum — non scoped (input)',
    source: 'enum E {\n    x = 1,\n    "y" = 2,\n}\nenum E { z = 3 }\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'enum — outer references (input)',
    source:
      'enum socketType {\n  SOCKET,\n  SERVER,\n  IPC,\n}\n\nenum constants {\n  SOCKET = socketType.SOCKET,\n  SERVER = socketType.SERVER,\n  IPC = socketType.IPC,\n  UV_READABLE,\n  UV_WRITABLE,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'enum — reverse mappings syntactically determinable (input)',
    source:
      'const BAR = 2..toFixed(0);\n\nenum Foo {\n    A = `${BAR}`,\n    B = "2" + BAR,\n    C = (`${BAR}`),\n    D = (`${BAR}}`) as string,\n    E = `${BAR}`!,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'enum — scoped (input)',
    source: "{\n    // Uses 'let' within a scope\n    enum E {}\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'enum — string value template (input)',
    source: 'enum E {\n  A = `Hey`\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'enum — string value (input)',
    source: 'enum E {\n    A = 0,\n    B = "",\n    A2 = A,\n    B2 = B,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'enum — string values computed (input)',
    source: 'enum E {\n  A = "HALLO" + "WERLD"\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'enum — ts5.0 const foldable (input)',
    source:
      '// ts 5.0 feature\n\nconst BaseValue = 10;\nconst Prefix = "/data";\nconst enum Values {\n  First = BaseValue, // 10\n  Second, // 11\n  Third, // 12\n}\n\nconst xxx = 100 + Values.First;\nconst yyy = xxx;\n\nconst enum Routes {\n  Parts = `${Prefix}/parts`, // "/data/parts"\n  Invoices = `${Prefix}/invoices`, // "/data/invoices"\n  x = `${Values.First}/x`,\n  y = `${yyy}/y`,\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'exports — declare namespace (input)',
    source:
      'export class N {\n  f1(value: N.I) {\n    value.f2();\n  }\n}\nexport declare namespace N {\n  export interface I {\n    f2();\n  }\n}\nexport default N;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'exports — declare shadowed (input)',
    source:
      'declare class Signal<T = any> {\n\tvalue: T\n}\n\nfunction Signal(this: Signal, value?: unknown) {\n\tthis.value = value\n}\n\nexport { Signal };\n\n\nfunction Signal2(this: Signal2, value?: unknown) {\n\tthis.value = value\n}\ndeclare class Signal2<T = any> {\n\tvalue: T\n}\n\nexport { Signal2 };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'exports — declared types (input)',
    source:
      'declare const x: number;\ndeclare function f(): void;\ndeclare class C {}\ndeclare enum E {}\ndeclare module "m" {}\ndeclare namespace N {}\nexport interface I {}\nexport type T = number;\nexport class C2 {}\n\nexport { x, f, E, C }; // Not-even E\nexport { N, I as I1, T as T1 }; // everything removed\nexport {\n  x as x2,\n  f as f2,\n  C as CC2,\n  E as E2,\n  N as N2,\n  I as I2,\n  T as T2,\n  C2 as C3\n}; // only C2->C3\n\ninterface II2 {}\ntype AA = {};\nenum BB {\n  K\n}\nenum BB {\n  L = "LL"\n}\nexport { II2, AA, BB };  // only BB\nexport { II2 as II3, AA as AA2 };  // everything removed\nexport { BB as BB1 }; // BB->BB1\n\ninterface II3 {}\ntype AA2 = {};\nenum BB2 {}\nfunction foo() {}\nexport { II3 as default, AA2 as A, BB2 as BB3, foo }; // only BB2->BB3 and foo\n\n// export an interface before declaration\nexport default Bar;\nexport { Bar } // everything removed\nexport { Bar as Bar2, C2 as C4 } // only C2->C4\ninterface Bar {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'exports — default function (input)',
    source:
      'export default function(choiceField: any, selectedIndex: number): void;\nexport default function(choiceField: any, selectedValue: string): void;\nexport default function(choiceField: any, selection: number | string) {}',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[49],
      },
    ],
  },
  {
    title: 'exports — default literal (input)',
    source: 'export default "foo";\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'exports — export const enums (input)',
    source: 'const enum None {};\nexport type { None };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[51],
      },
    ],
  },
  {
    title: 'exports — export context variables (input)',
    source: 'export default undefined;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'exports — export from (input)',
    source: "export { bar } from './bar';\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[53],
      },
    ],
  },
  {
    title: 'exports — export globals (input)',
    source: 'export default Math;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'exports — export import= (input)',
    source: "import * as joint from '@joint/core';\n\nexport import JGraph = joint.dia.Graph;\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[55],
      },
    ],
  },
  {
    title: 'exports — export type from (input)',
    source: 'export type { A } from "./mod";\n;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'exports — export type star from (input)',
    source:
      "export type * from './mod';\nexport type * as ns from './mod';\n// Note: TSC doesn't support string module specifiers yet,\n// but it's easier for us to support them than not.\nexport type * as \"ns2\" from './mod';\n\n;\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'exports — export type (input)',
    source: 'type A = 2;\n\nexport type { A };\n;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'exports — export= to cjs (input)',
    source: 'export = 0;',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'exports — imported types only remove type imports (input)',
    source:
      'import type A from "A";\nimport type { B } from "B";\nimport C from "C";\n\nexport { A, B, C } // <-- A and B will be removed\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[57],
      },
    ],
  },
  {
    title: 'exports — interface (input)',
    source: '; // Otherwise-empty file\nexport interface I {}\nexport default interface A {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'exports — issue 9916 1 (input)',
    source:
      "/**\n * @module\n */\n\nimport '../message-bus';\n\n/**\n * @typedef {Function} PromiseResolveCb\n */\nexport type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;\n\n/**\n * @typedef {Function} PromiseRejectCb\n */\nexport type PromiseRejectCb = (reason?: any) => void;\n\nvar a;",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'exports — issue 9916 2 (input)',
    source:
      "/**\n * @module\n */\n\nimport '../message-bus';\n\n/**\n * @typedef {Function} PromiseResolveCb\n */\nexport type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;\n\n/**\n * @typedef {Function} PromiseRejectCb\n */\nexport type PromiseRejectCb = (reason?: any) => void;\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[59],
      },
    ],
  },
  {
    title: 'exports — issue 9916 3 (input)',
    source:
      '/**\n * @module\n */\n\n/**\n * @typedef {Function} PromiseResolveCb\n */\nexport type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;\n\n/**\n * @typedef {Function} PromiseRejectCb\n */\nexport type PromiseRejectCb = (reason?: any) => void;\n\nvar a;',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'exports — simple (input)',
    source: 'export class N {}\nexport default N;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[61],
      },
    ],
  },
  {
    title: 'exports — type only export specifier 1 (input)',
    source: 'class Foo {}\nexport { type Foo };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'exports — type only export specifier 2 (input)',
    source: 'export { type A1, type A2 } from "a"\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'exports — type only export specifier 3 (input)',
    source: 'export { type A1, type A2, A3 } from "a"\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[63],
      },
    ],
  },
  {
    title: 'function — overloads exports (input)',
    source: 'function f(): void;\nfunction f(): void {\n}\nexport { f }',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'function — overloads (input)',
    source: 'function f(): void;\nfunction f(): void {\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[65],
      },
    ],
  },
  {
    title: 'function — parameters (input)',
    source: 'function f<T>(x?: T, ...y: T[]): T {}\nfunction g(x: number = 0): number {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'function — this parameter (input)',
    source:
      'function f(this: {}) {}\nconst o = {\n    m(this: {}) {}\n};\nclass C {\n    m(this: {}) {}\n}\nconst g = {\n    get m(this: {}) {}\n};\nconst s = {\n    set m(this: {}, value: {}) {}\n};',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[67],
      },
    ],
  },
  {
    title: 'function — tuple parameter (input)',
    source: 'function foo(...args: [number, string?, ...number[]]) {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'imports — elide injected (input)',
    source: 'a();\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[69],
      },
    ],
  },
  {
    title: 'imports — elide jsx pragma namespace no (input)',
    source:
      '/* @jsx jsx.htm */\n// Don\'t elide htm if a JSX element appears somewhere.\nimport * as jsx from "fake-jsx-package";\n<div></div>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'imports — elide jsx pragma no (input)',
    source:
      '/* @jsx htm */\n// Don\'t elide htm if a JSX element appears somewhere.\nimport { htm } from "fake-jsx-package";\n<div></div>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[71],
      },
    ],
  },
  {
    title: 'imports — elide jsx pragmaFrag namespace no (input)',
    source:
      '/* @jsxFrag jsx.htm */\n// Don\'t elide htm if a JSX fragment appears somewhere.\nimport * as jsx from "fake-jsx-package";\n<></>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'imports — elide jsx pragmaFrag no (input)',
    source:
      '/* @jsxFrag htm */\n// Don\'t elide htm if a JSX fragment appears somewhere.\nimport { htm } from "fake-jsx-package";\n<></>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[73],
      },
    ],
  },
  {
    title: 'imports — elide no import specifiers (input)',
    source: 'import {} from "a";\nimport "b";\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[74],
      },
    ],
  },
  {
    title: 'imports — elide preact no 1 (input)',
    source:
      '// Don\'t elide Preact if a JSX element appears somewhere.\nimport { h, Fragment, render } from "preact";\n<div></div>;\n<></>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'imports — elide preact no 2 (input)',
    source:
      '// Don\'t elide Preact if a JSX fragment appears somewhere.\nimport { Fragment, render } from "preact";\n<></>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[76],
      },
    ],
  },
  {
    title: 'imports — elide preact (input)',
    source: 'import { FooBar, h, Fragment } from "preact";\nconst x: FooBar = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'imports — elide react no 1 (input)',
    source:
      '// Don\'t elide React if a JSX element appears somewhere.\nimport * as React from "react";\n<div></div>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'imports — elide react no 2 (input)',
    source:
      '// Don\'t elide React if a JSX element appears somewhere.\nimport * as React from "react";\n<div/>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[79],
      },
    ],
  },
  {
    title: 'imports — elide react no 3 (input)',
    source:
      '// Don\'t elide React if a JSX fragment appears somewhere.\nimport * as React from "react";\n<></>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[80],
      },
    ],
  },
  {
    title: 'imports — elide react (input)',
    source: 'import * as React from "react";\nconst x: React.T = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'imports — elide type referenced in imports equal no (input)',
    source:
      'import nsa from "./module-a";\nimport foo = nsa.bar;\n\nimport nsb from "./module-b";\nimport bar = nsb.foo.bar;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — elide typeof (input)',
    source: 'import { A } from "mod";\nconst x: typeof A = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'imports — elision export type (input)',
    source:
      "import {A, T} from './mod';\nA;\nimport B, {T1} from './mod';\nB;\nexport type {T, T1};\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'imports — elision locations (input)',
    source:
      'import { A, B, C, D, E, F, G, H } from "m";\n\nclass Class extends A<B> implements C<D> {}\ninterface Iface extends E<F> {}\nconst x: G = 0;\nconst y: H.T = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[82],
      },
    ],
  },
  {
    title: 'imports — elision qualifiedname (input)',
    source: 'import * as A from "lib";\nconst x: A.B = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'imports — elision rename (input)',
    source: 'import { A as B } from "lib";\nconst x: B = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'imports — elision (input)',
    source:
      'import "lib";\nimport A, { B, Used } from "lib";\nimport Used2, { C } from "lib";\nimport * as D from "lib";\nimport * as Used3 from "lib";\nconst x: A = Used;\nconst y: B = Used2;\nconst z: C | D = Used3;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'imports — enum id (input)',
    source: "import { A } from 'lib'\nenum Enum { A };",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[84],
      },
    ],
  },
  {
    title: 'imports — enum value (input)',
    source: "import { A } from 'lib'\nenum Enum { id = A };",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[85],
      },
    ],
  },
  {
    title: 'imports — import named type default and named (input)',
    source: "import type, { bar } from 'foo';\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — import named type (input)',
    source: "import type from 'foo';\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — import removed exceptions (input)',
    source:
      'import a from "a";\nimport { b } from "b";\nimport { c as c2 } from "c";\nimport d, { d2 } from "d";\nimport e, { e3 as e4 } from "e";\n\nimport {} from "f";\nimport "g";\n\nimport type H from "h";\nimport type { I, I2 } from "i";\nimport type * as J from "j";\n;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[86],
      },
    ],
  },
  {
    title: 'imports — import type func with duplicate name (input)',
    source:
      "import type {Foo} from 'foo';\nimport {type Foo2} from 'foo';\nfunction Foo(){}\nfunction Foo2(){}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'imports — import type not removed (input)',
    source: 'import type A from "x";\n// TODO: This should not be removed\nimport B from "y";\n;',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — import type (input)',
    source:
      "import type T from './mod';\nimport type { A, B } from './mod';\nimport type * as Types from './mod';\n;",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — import= declaration (input)',
    source: 'import foo = bar\nfoo.x\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[88],
      },
    ],
  },
  {
    title: 'imports — import= module to cjs (input)',
    source: 'import lib = require("lib");\nlib();\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[89],
      },
    ],
  },
  {
    title: 'imports — only remove type imports (input)',
    source:
      'import a from "a";\nimport { b } from "b";\nimport { c as c2 } from "c";\nimport d, { d2 } from "d";\nimport e, { e3 as e4 } from "e";\n\nimport {} from "f";\nimport "g";\n\nimport type H from "h";\nimport type { I, I2 } from "i";\nimport type * as J from "j";\nimport { type K1, type K2 } from "k";\nimport { type L1, L2, type L3 } from "l";\n\nimport x = a;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[86],
      },
    ],
  },
  {
    title: 'imports — parameter decorators (input)',
    source:
      "import { NgModule, Optional, SkipSelf } from '@angular/core';\n\n@NgModule({})\nexport class CoreModule {\n  constructor(@Optional() @SkipSelf() parentModule) { }\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[90],
      },
    ],
  },
  {
    title: 'imports — property signature (input)',
    source: "import { A } from 'lib'\nconst obj: { A: A } = { A: 'foo' };",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'imports — type only export specifier 1 (input)',
    source:
      'import { foo, bar, type baz } from "Foo";\nexport { type foo };\nexport type { bar };\nexport { baz };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — type only import specifier 1 (input)',
    source: 'import { Foo1, type Foo2  } from "Foo";\nFoo1;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[92],
      },
    ],
  },
  {
    title: 'imports — type only import specifier 2 (input)',
    source: 'import { type Foo1, type Foo2 } from "Foo";\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — type only import specifier 3 (input)',
    source: 'import { type Foo1, type Foo2 } from "Foo";\nexport { Foo1, Foo2 };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'imports — type only import specifier 4 (input)',
    source: 'import { type A } from "x";\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'lvalues — as expression (input)',
    source: '(x as number) += 1;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'lvalues — non null (input)',
    source: 'x! += 1;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'lvalues — type assertion (input)',
    source: '(<number> x) += 1;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'namespace — alias (input)',
    source:
      "declare namespace LongNameModule {\n  export type SomeType = number;\n  export const foo: number;\n  namespace Inner {\n    export type T = string;\n    export const bar: boolean;\n  }\n}\n\nimport * as babel from '@babel/core';\n\n/** type only */\nimport b = babel;\nimport AliasModule = LongNameModule;\n\nconst some: AliasModule.SomeType = 3;\nconst bar = AliasModule.foo;\nconst baz = AliasModule.Inner.bar;\nlet str: LongNameModule.Inner.T;\nlet node: b.OptionManager;\n\nconsole.log(some);\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[94],
      },
    ],
  },
  {
    title: 'namespace — ambient module nested exported (input)',
    source: 'namespace X {\n  export module "m" {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: '[syntax-error] invalid-input',
      },
    ],
  },
  {
    title: 'namespace — ambient module nested (input)',
    source: 'namespace X {\n  module "m" {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: '[syntax-error] invalid-input',
      },
    ],
  },
  {
    title: 'namespace — canonical (input)',
    source:
      'namespace Validation {\n  export interface StringValidator {\n    isAcceptable(s: string): boolean;\n  }\n\n  const lettersRegexp = /^[A-Za-z]+$/;\n  const numberRegexp = /^[0-9]+$/;\n\n  export class LettersOnlyValidator implements StringValidator {\n    constructor() {\n      console.log("1");\n    }\n    isAcceptable(s: string) {\n      return lettersRegexp.test(s);\n    }\n  }\n\n  export class ZipCodeValidator implements StringValidator {\n    isAcceptable(s: string) {\n      return s.length === 5 && numberRegexp.test(s);\n    }\n  }\n}\n\nlet strings = ["Hello", "98052", "101"];\n\nlet validators: { [s: string]: Validation.StringValidator; } = {};\nvalidators["ZIP code"] = new Validation.ZipCodeValidator();\nvalidators["Letters only"] = new Validation.LettersOnlyValidator();\n\nfor (let s of strings) {\n  for (let name in validators) {\n    console.log(`"${ s }" - ${ validators[name].isAcceptable(s) ? "matches" : "does not match" } ${ name }`);\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[95],
      },
    ],
  },
  {
    title: 'namespace — clobber class (input)',
    source: 'class A { }\nnamespace A {\n  export const B = 1;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[96],
      },
    ],
  },
  {
    title: 'namespace — clobber enum (input)',
    source: 'enum A {\n  C = 2,\n}\nnamespace A {\n  export const B = 1;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[97],
      },
    ],
  },
  {
    title: 'namespace — clobber export (input)',
    source: 'export class N {}\nexport namespace N { var x; }\nexport default N;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[98],
      },
    ],
  },
  {
    title: 'namespace — clobber import (input)',
    source: "import N from 'n';\n\nnamespace N { var x }\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[99],
      },
    ],
  },
  {
    title: 'namespace — contentious names (input)',
    source:
      'namespace N {\n  namespace N { var x }\n  namespace constructor { var x }\n  namespace length { var x }\n  namespace concat { var x }\n  namespace copyWithin { var x }\n  namespace fill { var x }\n  namespace find { var x }\n  namespace findIndex { var x }\n  namespace lastIndexOf { var x }\n  namespace pop { var x }\n  namespace push { var x }\n  namespace reverse { var x }\n  namespace shift { var x }\n  namespace unshift { var x }\n  namespace slice { var x }\n  namespace sort { var x }\n  namespace splice { var x }\n  namespace includes { var x }\n  namespace indexOf { var x }\n  namespace join { var x }\n  namespace keys { var x }\n  namespace entries { var x }\n  namespace values { var x }\n  namespace forEach { var x }\n  namespace filter { var x }\n  namespace map { var x }\n  namespace every { var x }\n  namespace some { var x }\n  namespace reduce { var x }\n  namespace reduceRight { var x }\n  namespace toLocaleString { var x }\n  namespace toString { var x }\n  namespace flat { var x }\n  namespace flatMap { var x }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[100],
      },
    ],
  },
  {
    title: 'namespace — declare global nested namespace (input)',
    source:
      'declare global { namespace globalThis { var i18n: any; } }\n\nnamespace X { var i18n: any; }\n\nexport class i18n {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[101],
      },
    ],
  },
  {
    title: 'namespace — declare (input)',
    source:
      'export namespace N {\n  export declare class C {\n  }\n  export declare enum e { };\n  export declare function f(): void;\n  export declare const v: unknown;\n  export declare namespace B {\n    export interface C { }\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[102],
      },
    ],
  },
  {
    title: 'namespace — empty removed (input)',
    source:
      'namespace a {\n  namespace b {}\n  namespace c { var x }\n  namespace d {\n    namespace e {}\n  }\n}\n\nnamespace WithTypes {\n  namespace a { type A = 1 }\n  namespace b { interface B {} }\n  namespace c { import C = a }\n  namespace d { declare class D {} }\n}\n\nnamespace WithValues {\n  namespace a { class A {} }\n  namespace b { enum B {} }\n  namespace c { function C() {} }\n  namespace d { var D }\n  namespace e { E; }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[103],
      },
    ],
  },
  {
    title: 'namespace — export type only (input)',
    source:
      '// #15940\nnamespace Platform {\n  export type Name = "web";\n\n  export namespace Data {\n    export type Type = string;\n    export declare namespace Empty {}\n  }\n}\n\nexport { Platform };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'namespace — export (input)',
    source: 'export namespace N { var x }\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[104],
      },
    ],
  },
  {
    title: 'namespace — multiple (input)',
    source: 'namespace N { var x; }\nnamespace N { var y; }\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'namespace — mutable fail (input)',
    source: 'namespace N {\n  export let V;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[106],
      },
    ],
  },
  {
    title: 'namespace — namespace flag (input)',
    source: 'namespace N {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'namespace — nested destructuring (input)',
    source:
      'class C { }\nnamespace N {\n  export const { a } = C;\n  export const [ b ] = C;\n  export const [ { a: [{ b: c }] }] = A, { a: { b: { d = 1 } } = {}, ...e } = C;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[107],
      },
    ],
  },
  {
    title: 'namespace — nested namespace (input)',
    source:
      'export namespace A {\n  export namespace B {\n    export interface C {\n      D?: number;\n      E?: number;\n      F?: string;\n    }\n  }\n\n  export enum G {\n    H = 0\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[108],
      },
    ],
  },
  {
    title: 'namespace — nested shorthand export (input)',
    source:
      'export namespace ui.a {\n  export const x = 1;\n}\nexport namespace ui.b {\n  export const y = 2;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[109],
      },
    ],
  },
  {
    title: 'namespace — nested shorthand (input)',
    source:
      'namespace X.Y {\n  export const Z = 1;\n}\n\nnamespace proj.data.util.api {\n  export const X = 1;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[110],
      },
    ],
  },
  {
    title: 'namespace — nested (input)',
    source:
      'class A { }\nnamespace A {\n  export namespace C {\n    export class G {}\n    export const E = 7;\n  }\n  function M() {}\n  namespace M {\n    export const N = C.E;\n  }\n  export function D() {}\n  export namespace D {\n    const C = 5;\n    export enum H {\n      I = 11,\n      J = 13,\n      K = 17,\n    }\n  }\n  class F {}\n  namespace F { var x; }\n  namespace G { var x; }\n  enum L {\n    M = 19,\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[111],
      },
    ],
  },
  {
    title: 'namespace — same name (input)',
    source:
      'namespace N {\n  namespace _N7 { var x }\n  export namespace N {\n    export function _N3() {}\n  }\n  export namespace N {\n    export class _N5 {}\n  }\n  export namespace N {\n    export enum _N {}\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[112],
      },
    ],
  },
  {
    title: 'namespace — undeclared (input)',
    source: 'namespace N { var x }\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[113],
      },
    ],
  },
  {
    title: 'optimize const enums — custom values exported (input)',
    source:
      'export const enum A {\n  x = 3,\n  y = "f",\n  z = 4 << 2,\n  w = y\n}\n\nA.x;\nA.y;\nA.z;\nA.w;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[114],
      },
    ],
  },
  {
    title: 'optimize const enums — custom values (input)',
    source:
      'const enum A {\n  x = 3,\n  y = "f",\n  z = 4 << 2,\n  w = y\n}\n\nA.x;\nA.y;\nA.z;\nA.w;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[115],
      },
    ],
  },
  {
    title: 'optimize const enums — declare (input)',
    source: 'declare const enum A { x }\n\nA.x;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[116],
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum type and value (input)',
    source:
      'const enum WhitespaceFlag {\n  before = 1 << 0,\n  after = 1 << 1,\n}\n\nexport type { WhitespaceFlag as WF1 };\nexport { WhitespaceFlag as WF2 };\n\nexport const before = WhitespaceFlag.before;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[117],
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum type no deopt (input)',
    source:
      'const enum WhitespaceFlag {\n  before = 1 << 0,\n  after = 1 << 1,\n}\n\nexport type { WhitespaceFlag as WF1 };\nexport { type WhitespaceFlag as WF2 };\n\nexport const before = WhitespaceFlag.before;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[118],
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum (input)',
    source: 'export const enum A { y }\n\nlet x = A.y;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[119],
      },
    ],
  },
  {
    title: 'optimize const enums — exported (input)',
    source: 'const enum A { y }\n\nlet x = A.y;\n\nexport { A };\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[120],
      },
    ],
  },
  {
    title: 'optimize const enums — local shadowed (input)',
    source: 'const enum A { x }\n\n{\n  let A = {};\n  A.x;\n}\n\nA.x;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[121],
      },
    ],
  },
  {
    title: 'optimize const enums — local (input)',
    source: 'const enum A {\n  x, y\n}\n\nA.x;\nA["y"];\nA.z;\nA;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[122],
      },
    ],
  },
  {
    title: 'optimize const enums — merged exported (input)',
    source:
      'export const enum A {\n  x, y\n}\n\nexport const enum A {\n  z\n}\n\nA.x;\nA["y"];\nA.z;\nA.w;\nA;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'optimize const enums — merged (input)',
    source:
      'const enum A {\n  x, y\n}\n\nconst enum A {\n  z\n}\n\nA.x;\nA["y"];\nA.z;\nA.w;\nA;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[124],
      },
    ],
  },
  {
    title: 'optimize const enums — namespace (input)',
    source:
      'export namespace Tags {\n  export const enum TagsType {\n    Unknown = 0,\n    PC = 1,\n    Mobile = 2,\n    Console = 3,\n  }\n  export interface TagsCategory {\n    type?: Tags.TagsType;\n    title?: string;\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[125],
      },
    ],
  },
  {
    title: 'regression — 10162 (input)',
    source: 'export default 2;',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'regression — 10338 (input)',
    source:
      'const {result} = idArray.reduce(\n  (a, b) => {},\n  {result: [] as (number | bigint)[]},\n)',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[127],
      },
    ],
  },
  {
    title: 'regression — 11061 (input)',
    source:
      "import { messaging } from 'firebase-admin'\n\nexport class Something {\n  constructor(\n  \tpublic messaging: messaging.Messaging\n  ) {\n  }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[128],
      },
    ],
  },
  {
    title: 'regression — 15768 (input)',
    source:
      'const v = 42;\nconst v2 = Infinity;\nconst v3 = NaN;\n\n{\n\tlet Infinity = 1;\n\tlet NaN = 2;\n\n\tenum StateEnum {\n\t\tokay = 0,\n\t\tneg = -Infinity,\n\t\tpos = Infinity,\n\t\tnan = NaN,\n\t\tnegReal = -1 / 0,\n\t\tposReal = 1 / 0,\n\t\tnanReal = 0 / 0,\n\t\text = v,\n\t\text2 = v2,\n\t\text3 = v3,\n\t}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'type arguments — call (input)',
    source: 'f<T>();\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[130],
      },
    ],
  },
  {
    title: 'type arguments — expr (input)',
    source: 'f<T>;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[131],
      },
    ],
  },
  {
    title: 'type arguments — new (input)',
    source: 'new C<T>();\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[132],
      },
    ],
  },
  {
    title: 'type arguments — optional call (input)',
    source: 'x?.f<T>();\nx?.f?.<T>();\nf?.<Q>();\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[133],
      },
    ],
  },
  {
    title: 'type arguments — tagged template (input)',
    source: 'f<T>``;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[134],
      },
    ],
  },
  {
    title: 'type arguments — tsx (input)',
    source: '<C<number>></C>;\n<C<number>/>;\n',
    filename: 'input.tsx',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
        output: expectedOutputs[135],
      },
    ],
  },
  {
    title: 'variable declaration — exclamation (input)',
    source: 'let x!: number;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[136],
      },
    ],
  },
  {
    title: 'variable declaration — non null in optional chain (input)',
    source: 'const a = 1;\nconst b = () => a?.b?.c!.d;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[137],
      },
    ],
  },
  {
    title: 'variable declaration — types erased (input)',
    source: 'const n: number = 0;\nconst [a, b]: any = 0;\nconst { x, y }: any = 0;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
        output: expectedOutputs[138],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
