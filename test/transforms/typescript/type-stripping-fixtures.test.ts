import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'cast — as expression (input)',
    source: `x as T;
`,
    filename: 'input.ts',
    output: 'x;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'cast — multiple assert and assign (input)',
    source: '(a as number as any) = 42;',
    filename: 'input.ts',
    output: 'a = 42;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'cast — non null assertion (input)',
    source: `x!;
`,
    filename: 'input.ts',
    output: 'x;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'cast — type assertion (input)',
    source: `<T> x;
`,
    filename: 'input.ts',
    output: 'x;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'catch clause — param type (input)',
    source: `try {} catch (e: any) {}
`,
    filename: 'input.ts',
    output: `try {
} catch (e) {}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — abstract allowDeclareFields false (input)',
    source: `abstract class A {
    abstract prop: string;
}
`,
    filename: 'input.ts',
    output: 'class A {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — abstract class decorated method (input)',
    source: `import { computed } from 'mobx';

abstract class Foo {
  @computed get id() {}
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
import { computed } from 'mobx';
class Foo {
  get id() {}
}
_decorate([computed], Foo.prototype, 'id', null);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — abstract class decorated parameter (input)',
    source: `import { observable } from 'mobx';

abstract class Foo {
  @observable id = null;
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
import { observable } from 'mobx';
class Foo {
  id = null;
}
_decorate([observable], Foo.prototype, 'id', void 0);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — abstract class decorated (input)',
    source: `import { observer } from 'mobx-react';

@observer
abstract class Foo {}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
import { observer } from 'mobx-react';
let Foo = class Foo {};
Foo = _decorate([observer], Foo);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — accessor allowDeclareFields false (input)',
    source: `abstract class Foo {
  accessor prop: number = 1;
  static accessor prop2: number = 1;
  accessor #prop3: number = 1;
  accessor [prop4]: number = 1;
  private accessor prop5: number = 1;
  abstract accessor prop6: number;
  private accessor #p: any;

  accessor a!: any;
  accessor aa!: any;
  abstract accessor #s;
  abstract accessor f = 1;
  readonly accessor g;
}
`,
    filename: 'input.ts',
    output: '[syntax-error] invalid-input',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — declare (input)',
    source: `class A {
  declare x;
  @foo declare y: string;
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class A {}
_decorate([foo], A.prototype, 'y', void 0);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — decorated declare properties (input)',
    source: `class Foo {
  @decorator declare bar: string;
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Foo {}
_decorate([decorator], Foo.prototype, 'bar', void 0);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — export default abstract (input)',
    source: `export default abstract class {}
`,
    filename: 'input.ts',
    output: 'export default class {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — field not initialized (input)',
    source: `class A {
  x;
}`,
    filename: 'input.ts',
    output: `class A {
  x;
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — head (input)',
    source: `abstract class C<T> extends D<T> implements I {}
`,
    filename: 'input.ts',
    output: 'class C extends D {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — index signature (input)',
    source: `class C {
    [s: string]: number;
}
`,
    filename: 'input.ts',
    output: 'class C {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — methods (input)',
    source: `class C {
    #m(x: number): void {}
    m(): void;
    public m(x?: number, ...y: number[]): void {}
    public constructor() {}
}
`,
    filename: 'input.ts',
    output: `class C {
  #m(x) {}
  m(x, ...y) {}
  constructor() {}
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — override (input)',
    source: `class Foo extends Bar {
  override foo() {}
  override bar: string = "bar";
}
`,
    filename: 'input.ts',
    output: `class Foo extends Bar {
  foo() {}
  bar = 'bar';
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties late super (input)',
    source: `class B extends A {
  constructor(public p: string) {
    console.log('anything before super');
    if (p) super();
    else {
      super();
    }
  }
}`,
    filename: 'input.ts',
    output: `class B extends A {
  p;
  constructor(p) {
    var _initialize = () => ((this.p = p), this);
    console.log('anything before super');
    if (p) _initialize(super());
    else {
      _initialize(super());
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties with class and super (input)',
    source: `class Employee extends Person {
  constructor(public name: string) {
    super();
  }
}
`,
    filename: 'input.ts',
    output: `class Employee extends Person {
  name;
  constructor(name) {
    super();
    this.name = name;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties with class (input)',
    source: `class Person {
  constructor(public name: string) {}
}
`,
    filename: 'input.ts',
    output: `class Person {
  name;
  constructor(name) {
    this.name = name;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties with parameters (input)',
    source: `export default class Example {
  constructor(public arg1 = null) { }
}
`,
    filename: 'input.ts',
    output: `export default class Example {
  arg1;
  constructor(arg1 = null) {
    this.arg1 = arg1;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties with super (input)',
    source: `class C extends Object {
    constructor(public x) {
        super();
    }
}
`,
    filename: 'input.ts',
    output: `class C extends Object {
  x;
  constructor(x) {
    super();
    this.x = x;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — parameter properties (input)',
    source: `class C {
    constructor(public x, public y = 0, public z: number = 0) {}
}
`,
    filename: 'input.ts',
    output: `class C {
  x;
  y;
  z;
  constructor(x, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — private method override transform private (input)',
    source: `class Test {
  #f(x: string): number;
  #f(x: number): string;
  #f(x: string | number): string | number {
    return (typeof x === 'string') ? parseInt(x) : x.toString();
  }
}
`,
    filename: 'input.ts',
    output: `class Test {
  #f(x) {
    return typeof x === 'string' ? parseInt(x) : x.toString();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — properties (input)',
    source: `class C {
    public a?: number;
    private b: number = 0;
    readonly c: number = 1;
    @foo d: number;
    @foo e: number = 3;
    f!: number;
    @foo g!: number;
    #h: string;
    #i: number = 10;
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class C {
  a;
  b = 0;
  c = 1;
  d;
  e = 3;
  f;
  g;
  #h;
  #i = 10;
}
_decorate([foo], C.prototype, 'd', void 0);
_decorate([foo], C.prototype, 'e', void 0);
_decorate([foo], C.prototype, 'g', void 0);`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'class — transform properties declare wrong order (input)',
    source: `class A {
  declare x;
  y;
}`,
    filename: 'input.ts',
    output: `class A {
  y;
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'class — uninitialized definite (input)',
    source: `class A {
  x!: number;
}
`,
    filename: 'input.ts',
    output: `class A {
  x;
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'declarations — const enum (input)',
    source: `declare const enum E {}
`,
    filename: 'input.ts',
    output: '',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'declarations — erased (input)',
    source: `; // Otherwise-empty file
declare const x: number;
declare function f(): void;
declare class C {}
declare enum E {}
declare module "m" {}
declare namespace N {}
export interface I {}
export type T = number;
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'declarations — export declare enum (input)',
    source: `export declare enum A {}
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'declarations — nested namespace (input)',
    source: `; // Otherwise-empty file
export declare namespace P {
  export namespace C {}
}
`,
    filename: 'input.mjs',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — boolean value (input)',
    source: `// Not type-correct code
enum E {
  A = true
}
`,
    filename: 'input.ts',
    output: `// Not type-correct code
var E = (function (E) {
  E[(E['A'] = true)] = 'A';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — const (input)',
    source: `// With --isolatedModules, TSC ignores the "const" modifier when compiling enums
const enum E {}
`,
    filename: 'input.ts',
    output: `// With --isolatedModules, TSC ignores the "const" modifier when compiling enums
var E = /* @__PURE__ */ (function (E) {
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — constant folding (input)',
    source: `enum E {
    a,
    b = 1 | 2,
    c = 1 & 3,
    d = 4 >> 1,
    e = 8 >>> 1,
    f = 1 << 3,
    g = 2 ^ 7,
    h = 2 * 3,
    i = 2 / 3,
    j = 2 + 5,
    k = 2 - 4,
    l = 2.5 % 2,
    m = 2 ** 33,
    n = +9,
    o = -1,
    p = ~2,
    q = 1 + 2 - 3 * 4 / -5,
    r,
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E[(E['a'] = 0)] = 'a';
  E[(E['b'] = 3)] = 'b';
  E[(E['c'] = 1)] = 'c';
  E[(E['d'] = 2)] = 'd';
  E[(E['e'] = 4)] = 'e';
  E[(E['f'] = 8)] = 'f';
  E[(E['g'] = 5)] = 'g';
  E[(E['h'] = 6)] = 'h';
  E[(E['i'] = 0.6666666666666666)] = 'i';
  E[(E['j'] = 7)] = 'j';
  E[(E['k'] = -2)] = 'k';
  E[(E['l'] = 0.5)] = 'l';
  E[(E['m'] = 8589934592)] = 'm';
  E[(E['n'] = 9)] = 'n';
  E[(E['o'] = -1)] = 'o';
  E[(E['p'] = -3)] = 'p';
  E[(E['q'] = 5.4)] = 'q';
  E[(E['r'] = 6.4)] = 'r';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — enum merging inner references shadow (input)',
    source: `const Cat = 10;
const Dog = 20;

enum Animals {
\tCat = 1
}

enum Animals {
\tDog = 2
}

enum Animals {
\tCatDog =  Cat | Dog
}
`,
    filename: 'input.ts',
    output: `const Cat = 10;
const Dog = 20;
var Animals = /* @__PURE__ */ (function (Animals) {
  Animals[(Animals['Cat'] = 1)] = 'Cat';
  return Animals;
})(Animals || {});
Animals = /* @__PURE__ */ (function (Animals) {
  Animals[(Animals['Dog'] = 2)] = 'Dog';
  return Animals;
})(Animals || {});
Animals = /* @__PURE__ */ (function (Animals) {
  Animals[(Animals['CatDog'] = 3)] = 'CatDog';
  return Animals;
})(Animals || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — enum merging inner references (input)',
    source: `enum Animals {
\tCat = 1,
\tDog = 2
}
enum Animals {
\tCatDog =  Cat - Dog
}
`,
    filename: 'input.ts',
    output: `var Animals = /* @__PURE__ */ (function (Animals) {
  Animals[(Animals['Cat'] = 1)] = 'Cat';
  Animals[(Animals['Dog'] = 2)] = 'Dog';
  return Animals;
})(Animals || {});
Animals = /* @__PURE__ */ (function (Animals) {
  Animals[(Animals['CatDog'] = -1)] = 'CatDog';
  return Animals;
})(Animals || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — export (input)',
    source: `export enum E {
    A = 1
}
export enum E {
    B = 2
}
`,
    filename: 'input.ts',
    output: `export let E = /* @__PURE__ */ (function (E) {
  E[(E['A'] = 1)] = 'A';
  return E;
})({});
E = /* @__PURE__ */ (function (E) {
  E[(E['B'] = 2)] = 'B';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — inferred (input)',
    source: `enum E {
    x,
    y,
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E[(E['x'] = 0)] = 'x';
  E[(E['y'] = 1)] = 'y';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — inner references (input)',
    source: `enum E {
    a = 10,
    b = a,
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E[(E['a'] = 10)] = 'a';
  E[(E['b'] = 10)] = 'b';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — mix references (input)',
    source: `var x = 10;

enum Foo {
    a = 10,
    b = a,
    c = b + x,
}

enum Bar {
    D = Foo.a,
    E = D,
    F = Math.E,
    G = E + Foo.c,
}

enum Baz {
    a = 0,
    b = 1,
    // @ts-ignore
    x = a.toString(),
}

enum A {
    a = 0,
    b = (() => { let a = 1; return a + 1 })(), // a is shadowed
    c = (() => { return a + 2 })(), // a refers to A.a
}`,
    filename: 'input.ts',
    output: `var x = 10;
var Foo = (function (Foo) {
  Foo[(Foo['a'] = 10)] = 'a';
  Foo[(Foo['b'] = 10)] = 'b';
  Foo[(Foo['c'] = Foo.b + x)] = 'c';
  return Foo;
})(Foo || {});
var Bar = (function (Bar) {
  Bar[(Bar['D'] = 10)] = 'D';
  Bar[(Bar['E'] = 10)] = 'E';
  Bar[(Bar['F'] = Math.E)] = 'F';
  Bar[(Bar['G'] = Bar.E + Foo.c)] = 'G';
  return Bar;
})(Bar || {});
var Baz = (function (Baz) {
  Baz[(Baz['a'] = 0)] = 'a';
  Baz[(Baz['b'] = 1)] = 'b';
  // @ts-ignore
  Baz[(Baz['x'] = Baz.a.toString())] = 'x';
  return Baz;
})(Baz || {});
var A = (function (A) {
  A[(A['a'] = 0)] = 'a';
  A[
    (A['b'] = (() => {
      let a = 1;
      return a + 1;
    })())
  ] = 'b';
  A[
    (A['c'] = (() => {
      return A.a + 2;
    })())
  ] = 'c';
  return A;
})(A || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'enum — non constant member reference (input)',
    source: `var A = 'hello';
enum Foo {
  A = Math.random(),
  B = A,
  C = (() => A)(),
  D = (() => {
    const A = 1;
    return (() => A)()
  })(),
}
`,
    filename: 'input.ts',
    output: `var A = 'hello';
var Foo = (function (Foo) {
  Foo[(Foo['A'] = Math.random())] = 'A';
  Foo[(Foo['B'] = Foo.A)] = 'B';
  Foo[(Foo['C'] = (() => Foo.A)())] = 'C';
  Foo[
    (Foo['D'] = (() => {
      const A = 1;
      return (() => A)();
    })())
  ] = 'D';
  return Foo;
})(Foo || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — non foldable constant (input)',
    source: `enum E {
    a = Math.sin(1),
    b,
}
`,
    filename: 'input.ts',
    output: '[syntax-error] invalid-input',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — non scoped (input)',
    source: `enum E {
    x = 1,
    "y" = 2,
}
enum E { z = 3 }
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E[(E['x'] = 1)] = 'x';
  E[(E['y'] = 2)] = 'y';
  return E;
})(E || {});
E = /* @__PURE__ */ (function (E) {
  E[(E['z'] = 3)] = 'z';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — outer references (input)',
    source: `enum socketType {
  SOCKET,
  SERVER,
  IPC,
}

enum constants {
  SOCKET = socketType.SOCKET,
  SERVER = socketType.SERVER,
  IPC = socketType.IPC,
  UV_READABLE,
  UV_WRITABLE,
}
`,
    filename: 'input.ts',
    output: `var socketType = /* @__PURE__ */ (function (socketType) {
  socketType[(socketType['SOCKET'] = 0)] = 'SOCKET';
  socketType[(socketType['SERVER'] = 1)] = 'SERVER';
  socketType[(socketType['IPC'] = 2)] = 'IPC';
  return socketType;
})(socketType || {});
var constants = /* @__PURE__ */ (function (constants) {
  constants[(constants['SOCKET'] = 0)] = 'SOCKET';
  constants[(constants['SERVER'] = 1)] = 'SERVER';
  constants[(constants['IPC'] = 2)] = 'IPC';
  constants[(constants['UV_READABLE'] = 3)] = 'UV_READABLE';
  constants[(constants['UV_WRITABLE'] = 4)] = 'UV_WRITABLE';
  return constants;
})(constants || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — reverse mappings syntactically determinable (input)',
    source: `const BAR = 2..toFixed(0);

enum Foo {
    A = \`\${BAR}\`,
    B = "2" + BAR,
    C = (\`\${BAR}\`),
    D = (\`\${BAR}}\`) as string,
    E = \`\${BAR}\`!,
}
`,
    filename: 'input.ts',
    output: `const BAR = (2).toFixed(0);
var Foo = (function (Foo) {
  Foo['A'] = \`\${BAR}\`;
  Foo['B'] = '2' + BAR;
  Foo['C'] = \`\${BAR}\`;
  Foo[(Foo['D'] = \`\${BAR}}\`)] = 'D';
  Foo[(Foo['E'] = \`\${BAR}\`)] = 'E';
  return Foo;
})(Foo || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — scoped (input)',
    source: `{
    // Uses 'let' within a scope
    enum E {}
}
`,
    filename: 'input.ts',
    output: `{
  // Uses 'let' within a scope
  let E = /* @__PURE__ */ (function (E) {
    return E;
  })({});
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — string value template (input)',
    source: `enum E {
  A = \`Hey\`
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E['A'] = 'Hey';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — string value (input)',
    source: `enum E {
    A = 0,
    B = "",
    A2 = A,
    B2 = B,
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E[(E['A'] = 0)] = 'A';
  E['B'] = '';
  E[(E['A2'] = 0)] = 'A2';
  E['B2'] = '';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — string values computed (input)',
    source: `enum E {
  A = "HALLO" + "WERLD"
}
`,
    filename: 'input.ts',
    output: `var E = /* @__PURE__ */ (function (E) {
  E['A'] = 'HALLOWERLD';
  return E;
})(E || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'enum — ts5.0 const foldable (input)',
    source: `// ts 5.0 feature

const BaseValue = 10;
const Prefix = "/data";
const enum Values {
  First = BaseValue, // 10
  Second, // 11
  Third, // 12
}

const xxx = 100 + Values.First;
const yyy = xxx;

const enum Routes {
  Parts = \`\${Prefix}/parts\`, // "/data/parts"
  Invoices = \`\${Prefix}/invoices\`, // "/data/invoices"
  x = \`\${Values.First}/x\`,
  y = \`\${yyy}/y\`,
}
`,
    filename: 'input.ts',
    output: `// ts 5.0 feature
const BaseValue = 10;
const Prefix = '/data';
var Values = (function (Values) {
  Values[(Values['First'] = BaseValue)] = 'First';
  Values[(Values['Second'] = 1 + Values['First'])] = 'Second';
  Values[(Values['Third'] = 1 + Values['Second'])] = 'Third';
  return Values;
})(Values || {});
const xxx = 100 + Values.First;
const yyy = xxx;
var Routes = (function (Routes) {
  Routes['Parts'] = \`\${Prefix}/parts\`;
  Routes['Invoices'] = \`\${Prefix}/invoices\`;
  Routes['x'] = \`\${Values.First}/x\`;
  Routes['y'] = \`\${yyy}/y\`;
  return Routes;
})(Routes || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — declare namespace (input)',
    source: `export class N {
  f1(value: N.I) {
    value.f2();
  }
}
export declare namespace N {
  export interface I {
    f2();
  }
}
export default N;
`,
    filename: 'input.ts',
    output: `export class N {
  f1(value) {
    value.f2();
  }
}
export default N;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — declare shadowed (input)',
    source: `declare class Signal<T = any> {
\tvalue: T
}

function Signal(this: Signal, value?: unknown) {
\tthis.value = value
}

export { Signal };


function Signal2(this: Signal2, value?: unknown) {
\tthis.value = value
}
declare class Signal2<T = any> {
\tvalue: T
}

export { Signal2 };
`,
    filename: 'input.ts',
    output: `function Signal(value) {
  this.value = value;
}
export { Signal };
function Signal2(value) {
  this.value = value;
}
export { Signal2 };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — declared types (input)',
    source: `declare const x: number;
declare function f(): void;
declare class C {}
declare enum E {}
declare module "m" {}
declare namespace N {}
export interface I {}
export type T = number;
export class C2 {}

export { x, f, E, C }; // Not-even E
export { N, I as I1, T as T1 }; // everything removed
export {
  x as x2,
  f as f2,
  C as CC2,
  E as E2,
  N as N2,
  I as I2,
  T as T2,
  C2 as C3
}; // only C2->C3

interface II2 {}
type AA = {};
enum BB {
  K
}
enum BB {
  L = "LL"
}
export { II2, AA, BB };  // only BB
export { II2 as II3, AA as AA2 };  // everything removed
export { BB as BB1 }; // BB->BB1

interface II3 {}
type AA2 = {};
enum BB2 {}
function foo() {}
export { II3 as default, AA2 as A, BB2 as BB3, foo }; // only BB2->BB3 and foo

// export an interface before declaration
export default Bar;
export { Bar } // everything removed
export { Bar as Bar2, C2 as C4 } // only C2->C4
interface Bar {}
`,
    filename: 'input.ts',
    output: `export class C2 {}
export { C2 as C3 };
var BB = /* @__PURE__ */ (function (BB) {
  BB[(BB['K'] = 0)] = 'K';
  return BB;
})(BB || {});
BB = /* @__PURE__ */ (function (BB) {
  BB['L'] = 'LL';
  return BB;
})(BB || {});
export { BB };
export { BB as BB1 };
var BB2 = /* @__PURE__ */ (function (BB2) {
  return BB2;
})(BB2 || {});
function foo() {}
export { BB2 as BB3, foo };
export { C2 as C4 };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — default function (input)',
    source: `export default function(choiceField: any, selectedIndex: number): void;
export default function(choiceField: any, selectedValue: string): void;
export default function(choiceField: any, selection: number | string) {}`,
    filename: 'input.ts',
    output: 'export default function (choiceField, selection) {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — default literal (input)',
    source: `export default "foo";
`,
    filename: 'input.ts',
    output: "export default 'foo';",
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export const enums (input)',
    source: `const enum None {};
export type { None };
`,
    filename: 'input.ts',
    output: `var None = /* @__PURE__ */ (function (None) {
  return None;
})(None || {});
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export context variables (input)',
    source: `export default undefined;
`,
    filename: 'input.ts',
    output: 'export default undefined;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export from (input)',
    source: `export { bar } from './bar';
`,
    filename: 'input.ts',
    output: "export { bar } from './bar';",
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export globals (input)',
    source: `export default Math;
`,
    filename: 'input.ts',
    output: 'export default Math;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export import= (input)',
    source: `import * as joint from '@joint/core';

export import JGraph = joint.dia.Graph;
`,
    filename: 'input.ts',
    output: `import * as joint from '@joint/core';
export var JGraph = joint.dia.Graph;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'exports — export type from (input)',
    source: `export type { A } from "./mod";
;
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export type star from (input)',
    source: `export type * from './mod';
export type * as ns from './mod';
// Note: TSC doesn't support string module specifiers yet,
// but it's easier for us to support them than not.
export type * as "ns2" from './mod';

;
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export type (input)',
    source: `type A = 2;

export type { A };
;
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — export= to cjs (input)',
    source: 'export = 0;',
    filename: 'input.ts',
    output: 'module.exports = 0;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — imported types only remove type imports (input)',
    source: `import type A from "A";
import type { B } from "B";
import C from "C";

export { A, B, C } // <-- A and B will be removed
`,
    filename: 'input.ts',
    output: `import C from 'C';
export { C };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — interface (input)',
    source: `; // Otherwise-empty file
export interface I {}
export default interface A {}
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — issue 9916 1 (input)',
    source: `/**
 * @module
 */

import '../message-bus';

/**
 * @typedef {Function} PromiseResolveCb
 */
export type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;

/**
 * @typedef {Function} PromiseRejectCb
 */
export type PromiseRejectCb = (reason?: any) => void;

var a;`,
    filename: 'input.ts',
    output: `/**
 * @module
 */
import '../message-bus';
var a;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'exports — issue 9916 2 (input)',
    source: `/**
 * @module
 */

import '../message-bus';

/**
 * @typedef {Function} PromiseResolveCb
 */
export type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;

/**
 * @typedef {Function} PromiseRejectCb
 */
export type PromiseRejectCb = (reason?: any) => void;
`,
    filename: 'input.ts',
    output: `/**
 * @module
 */
import '../message-bus';`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'exports — issue 9916 3 (input)',
    source: `/**
 * @module
 */

/**
 * @typedef {Function} PromiseResolveCb
 */
export type PromiseResolveCb<T> = (value?: T | PromiseLike<T>) => void;

/**
 * @typedef {Function} PromiseRejectCb
 */
export type PromiseRejectCb = (reason?: any) => void;

var a;`,
    filename: 'input.ts',
    output: `var a;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'exports — simple (input)',
    source: `export class N {}
export default N;
`,
    filename: 'input.ts',
    output: `export class N {}
export default N;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — type only export specifier 1 (input)',
    source: `class Foo {}
export { type Foo };
`,
    filename: 'input.ts',
    output: `class Foo {}
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — type only export specifier 2 (input)',
    source: `export { type A1, type A2 } from "a"
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'exports — type only export specifier 3 (input)',
    source: `export { type A1, type A2, A3 } from "a"
`,
    filename: 'input.ts',
    output: "export { A3 } from 'a';",
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'function — overloads exports (input)',
    source: `function f(): void;
function f(): void {
}
export { f }`,
    filename: 'input.mjs',
    output: `function f() {}
export { f };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'function — overloads (input)',
    source: `function f(): void;
function f(): void {
}
`,
    filename: 'input.ts',
    output: 'function f() {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'function — parameters (input)',
    source: `function f<T>(x?: T, ...y: T[]): T {}
function g(x: number = 0): number {}
`,
    filename: 'input.ts',
    output: `function f(x, ...y) {}
function g(x = 0) {}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'function — this parameter (input)',
    source: `function f(this: {}) {}
const o = {
    m(this: {}) {}
};
class C {
    m(this: {}) {}
}
const g = {
    get m(this: {}) {}
};
const s = {
    set m(this: {}, value: {}) {}
};`,
    filename: 'input.ts',
    output: `function f() {}
const o = { m() {} };
class C {
  m() {}
}
const g = { get m() {} };
const s = { set m(value) {} };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'function — tuple parameter (input)',
    source: `function foo(...args: [number, string?, ...number[]]) {}
`,
    filename: 'input.ts',
    output: 'function foo(...args) {}',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide injected (input)',
    source: `a();
`,
    filename: 'input.ts',
    output: 'a();',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide jsx pragma namespace no (input)',
    source: `/* @jsx jsx.htm */
// Don't elide htm if a JSX element appears somewhere.
import * as jsx from "fake-jsx-package";
<div></div>;
`,
    filename: 'input.tsx',
    output: `/* @jsx jsx.htm */
// Don't elide htm if a JSX element appears somewhere.
import * as jsx from 'fake-jsx-package';
<div></div>;`,
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
      },
    ],
  },
  {
    title: 'imports — elide jsx pragma no (input)',
    source: `/* @jsx htm */
// Don't elide htm if a JSX element appears somewhere.
import { htm } from "fake-jsx-package";
<div></div>;
`,
    filename: 'input.tsx',
    output: `/* @jsx htm */
// Don't elide htm if a JSX element appears somewhere.
import { htm } from 'fake-jsx-package';
<div></div>;`,
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
      },
    ],
  },
  {
    title: 'imports — elide jsx pragmaFrag namespace no (input)',
    source: `/* @jsxFrag jsx.htm */
// Don't elide htm if a JSX fragment appears somewhere.
import * as jsx from "fake-jsx-package";
<></>;
`,
    filename: 'input.tsx',
    output: `/* @jsxFrag jsx.htm */
// Don't elide htm if a JSX fragment appears somewhere.
import * as jsx from 'fake-jsx-package';
<></>;`,
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
      },
    ],
  },
  {
    title: 'imports — elide jsx pragmaFrag no (input)',
    source: `/* @jsxFrag htm */
// Don't elide htm if a JSX fragment appears somewhere.
import { htm } from "fake-jsx-package";
<></>;
`,
    filename: 'input.tsx',
    output: `/* @jsxFrag htm */
// Don't elide htm if a JSX fragment appears somewhere.
import { htm } from 'fake-jsx-package';
<></>;`,
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
      },
    ],
  },
  {
    title: 'imports — elide no import specifiers (input)',
    source: `import {} from "a";
import "b";
`,
    filename: 'input.ts',
    output: `import 'a';
import 'b';`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide preact no 1 (input)',
    source: `// Don't elide Preact if a JSX element appears somewhere.
import { h, Fragment, render } from "preact";
<div></div>;
<></>;
`,
    filename: 'input.tsx',
    output: `<div></div>;
<></>;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'imports — elide preact no 2 (input)',
    source: `// Don't elide Preact if a JSX fragment appears somewhere.
import { Fragment, render } from "preact";
<></>;
`,
    filename: 'input.tsx',
    output: `<></>;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'imports — elide preact (input)',
    source: `import { FooBar, h, Fragment } from "preact";
const x: FooBar = 0;
`,
    filename: 'input.ts',
    output: `const x = 0;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide react no 1 (input)',
    source: `// Don't elide React if a JSX element appears somewhere.
import * as React from "react";
<div></div>;
`,
    filename: 'input.tsx',
    output: `// Don't elide React if a JSX element appears somewhere.
import * as React from 'react';
<div></div>;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'imports — elide react no 2 (input)',
    source: `// Don't elide React if a JSX element appears somewhere.
import * as React from "react";
<div/>;
`,
    filename: 'input.tsx',
    output: `// Don't elide React if a JSX element appears somewhere.
import * as React from 'react';
<div />;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'imports — elide react no 3 (input)',
    source: `// Don't elide React if a JSX fragment appears somewhere.
import * as React from "react";
<></>;
`,
    filename: 'input.tsx',
    output: `// Don't elide React if a JSX fragment appears somewhere.
import * as React from 'react';
<></>;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'imports — elide react (input)',
    source: `import * as React from "react";
const x: React.T = 0;
`,
    filename: 'input.ts',
    output: `const x = 0;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide type referenced in imports equal no (input)',
    source: `import nsa from "./module-a";
import foo = nsa.bar;

import nsb from "./module-b";
import bar = nsb.foo.bar;
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elide typeof (input)',
    source: `import { A } from "mod";
const x: typeof A = 0;
`,
    filename: 'input.ts',
    output: `const x = 0;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elision export type (input)',
    source: `import {A, T} from './mod';
A;
import B, {T1} from './mod';
B;
export type {T, T1};
`,
    filename: 'input.ts',
    output: `import { A } from './mod';
A;
import B from './mod';
B;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elision locations (input)',
    source: `import { A, B, C, D, E, F, G, H } from "m";

class Class extends A<B> implements C<D> {}
interface Iface extends E<F> {}
const x: G = 0;
const y: H.T = 0;
`,
    filename: 'input.ts',
    output: `import { A } from 'm';
class Class extends A {}
const x = 0;
const y = 0;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elision qualifiedname (input)',
    source: `import * as A from "lib";
const x: A.B = 0;
`,
    filename: 'input.ts',
    output: `const x = 0;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elision rename (input)',
    source: `import { A as B } from "lib";
const x: B = 0;
`,
    filename: 'input.ts',
    output: `const x = 0;
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — elision (input)',
    source: `import "lib";
import A, { B, Used } from "lib";
import Used2, { C } from "lib";
import * as D from "lib";
import * as Used3 from "lib";
const x: A = Used;
const y: B = Used2;
const z: C | D = Used3;
`,
    filename: 'input.ts',
    output: `import 'lib';
import { Used } from 'lib';
import Used2 from 'lib';
import * as Used3 from 'lib';
const x = Used;
const y = Used2;
const z = Used3;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — enum id (input)',
    source: `import { A } from 'lib'
enum Enum { A };`,
    filename: 'input.ts',
    output: `var Enum = /* @__PURE__ */ (function (Enum) {
  Enum[(Enum['A'] = 0)] = 'A';
  return Enum;
})(Enum || {});
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — enum value (input)',
    source: `import { A } from 'lib'
enum Enum { id = A };`,
    filename: 'input.ts',
    output: `import { A } from 'lib';
var Enum = (function (Enum) {
  Enum[(Enum['id'] = A)] = 'id';
  return Enum;
})(Enum || {});`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import named type default and named (input)',
    source: `import type, { bar } from 'foo';
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import named type (input)',
    source: `import type from 'foo';
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import removed exceptions (input)',
    source: `import a from "a";
import { b } from "b";
import { c as c2 } from "c";
import d, { d2 } from "d";
import e, { e3 as e4 } from "e";

import {} from "f";
import "g";

import type H from "h";
import type { I, I2 } from "i";
import type * as J from "j";
;
`,
    filename: 'input.ts',
    output: `import 'f';
import 'g';`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import type func with duplicate name (input)',
    source: `import type {Foo} from 'foo';
import {type Foo2} from 'foo';
function Foo(){}
function Foo2(){}
`,
    filename: 'input.ts',
    output: `function Foo() {}
function Foo2() {}
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import type not removed (input)',
    source: `import type A from "x";
// TODO: This should not be removed
import B from "y";
;`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import type (input)',
    source: `import type T from './mod';
import type { A, B } from './mod';
import type * as Types from './mod';
;`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import= declaration (input)',
    source: `import foo = bar
foo.x
`,
    filename: 'input.ts',
    output: `var foo = bar;
foo.x;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — import= module to cjs (input)',
    source: `import lib = require("lib");
lib();
`,
    filename: 'input.ts',
    output: `const lib = require('lib');
lib();`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — only remove type imports (input)',
    source: `import a from "a";
import { b } from "b";
import { c as c2 } from "c";
import d, { d2 } from "d";
import e, { e3 as e4 } from "e";

import {} from "f";
import "g";

import type H from "h";
import type { I, I2 } from "i";
import type * as J from "j";
import { type K1, type K2 } from "k";
import { type L1, L2, type L3 } from "l";

import x = a;
`,
    filename: 'input.ts',
    output: `import 'f';
import 'g';`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — parameter decorators (input)',
    source: `import { NgModule, Optional, SkipSelf } from '@angular/core';

@NgModule({})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule) { }
}
`,
    filename: 'input.ts',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function _decorateParam(index, decorator) {
  return function (target, key) {
    decorator(target, key, index);
  };
}
import { NgModule, Optional, SkipSelf } from '@angular/core';
let CoreModule = class CoreModule {
  constructor(parentModule) {}
};
CoreModule = _decorate(
  [NgModule({}), _decorateParam(0, Optional()), _decorateParam(0, SkipSelf())],
  CoreModule,
);
export { CoreModule };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'imports — property signature (input)',
    source: `import { A } from 'lib'
const obj: { A: A } = { A: 'foo' };`,
    filename: 'input.ts',
    output: `const obj = { A: 'foo' };
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — type only export specifier 1 (input)',
    source: `import { foo, bar, type baz } from "Foo";
export { type foo };
export type { bar };
export { baz };
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — type only import specifier 1 (input)',
    source: `import { Foo1, type Foo2  } from "Foo";
Foo1;
`,
    filename: 'input.ts',
    output: `import { Foo1 } from 'Foo';
Foo1;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — type only import specifier 2 (input)',
    source: `import { type Foo1, type Foo2 } from "Foo";
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — type only import specifier 3 (input)',
    source: `import { type Foo1, type Foo2 } from "Foo";
export { Foo1, Foo2 };
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'imports — type only import specifier 4 (input)',
    source: `import { type A } from "x";
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'lvalues — as expression (input)',
    source: `(x as number) += 1;
`,
    filename: 'input.ts',
    output: 'x += 1;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'lvalues — non null (input)',
    source: `x! += 1;
`,
    filename: 'input.ts',
    output: 'x += 1;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'lvalues — type assertion (input)',
    source: `(<number> x) += 1;
`,
    filename: 'input.ts',
    output: 'x += 1;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — alias (input)',
    source: `declare namespace LongNameModule {
  export type SomeType = number;
  export const foo: number;
  namespace Inner {
    export type T = string;
    export const bar: boolean;
  }
}

import * as babel from '@babel/core';

/** type only */
import b = babel;
import AliasModule = LongNameModule;

const some: AliasModule.SomeType = 3;
const bar = AliasModule.foo;
const baz = AliasModule.Inner.bar;
let str: LongNameModule.Inner.T;
let node: b.OptionManager;

console.log(some);
`,
    filename: 'input.ts',
    output: `var AliasModule = LongNameModule;
const some = 3;
const bar = AliasModule.foo;
const baz = AliasModule.Inner.bar;
let str;
let node;
console.log(some);
export {};`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'namespace — ambient module nested exported (input)',
    source: `namespace X {
  export module "m" {}
}
`,
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
    source: `namespace X {
  module "m" {}
}
`,
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
    source: `namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    constructor() {
      console.log("1");
    }
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

let strings = ["Hello", "98052", "101"];

let validators: { [s: string]: Validation.StringValidator; } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

for (let s of strings) {
  for (let name in validators) {
    console.log(\`"\${ s }" - \${ validators[name].isAcceptable(s) ? "matches" : "does not match" } \${ name }\`);
  }
}
`,
    filename: 'input.ts',
    output: `let Validation;
(function (_Validation) {
  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;
  class LettersOnlyValidator {
    constructor() {
      console.log('1');
    }
    isAcceptable(s) {
      return lettersRegexp.test(s);
    }
  }
  _Validation.LettersOnlyValidator = LettersOnlyValidator;
  class ZipCodeValidator {
    isAcceptable(s) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
  _Validation.ZipCodeValidator = ZipCodeValidator;
})(Validation || (Validation = {}));
let strings = ['Hello', '98052', '101'];
let validators = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();
for (let s of strings) {
  for (let name in validators) {
    console.log(
      \`"\${s}" - \${validators[name].isAcceptable(s) ? 'matches' : 'does not match'} \${name}\`,
    );
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — clobber class (input)',
    source: `class A { }
namespace A {
  export const B = 1;
}
`,
    filename: 'input.ts',
    output: `class A {}
(function (_A) {
  const B = (_A.B = 1);
})(A || (A = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — clobber enum (input)',
    source: `enum A {
  C = 2,
}
namespace A {
  export const B = 1;
}
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['C'] = 2)] = 'C';
  return A;
})(A || {});
(function (_A) {
  const B = (_A.B = 1);
})(A || (A = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — clobber export (input)',
    source: `export class N {}
export namespace N { var x; }
export default N;
`,
    filename: 'input.ts',
    output: `export class N {}
(function (_N) {
  var x;
})(N || (N = {}));
export default N;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — clobber import (input)',
    source: `import N from 'n';

namespace N { var x }
`,
    filename: 'input.ts',
    output: `import N from 'n';
(function (_N) {
  var x;
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — contentious names (input)',
    source: `namespace N {
  namespace N { var x }
  namespace constructor { var x }
  namespace length { var x }
  namespace concat { var x }
  namespace copyWithin { var x }
  namespace fill { var x }
  namespace find { var x }
  namespace findIndex { var x }
  namespace lastIndexOf { var x }
  namespace pop { var x }
  namespace push { var x }
  namespace reverse { var x }
  namespace shift { var x }
  namespace unshift { var x }
  namespace slice { var x }
  namespace sort { var x }
  namespace splice { var x }
  namespace includes { var x }
  namespace indexOf { var x }
  namespace join { var x }
  namespace keys { var x }
  namespace entries { var x }
  namespace values { var x }
  namespace forEach { var x }
  namespace filter { var x }
  namespace map { var x }
  namespace every { var x }
  namespace some { var x }
  namespace reduce { var x }
  namespace reduceRight { var x }
  namespace toLocaleString { var x }
  namespace toString { var x }
  namespace flat { var x }
  namespace flatMap { var x }
}
`,
    filename: 'input.ts',
    output: `let N;
(function (_N) {
  let N;
  (function (_N2) {
    var x;
  })(N || (N = {}));
  let constructor;
  (function (_constructor) {
    var x;
  })(constructor || (constructor = {}));
  let length;
  (function (_length) {
    var x;
  })(length || (length = {}));
  let concat;
  (function (_concat) {
    var x;
  })(concat || (concat = {}));
  let copyWithin;
  (function (_copyWithin) {
    var x;
  })(copyWithin || (copyWithin = {}));
  let fill;
  (function (_fill) {
    var x;
  })(fill || (fill = {}));
  let find;
  (function (_find) {
    var x;
  })(find || (find = {}));
  let findIndex;
  (function (_findIndex) {
    var x;
  })(findIndex || (findIndex = {}));
  let lastIndexOf;
  (function (_lastIndexOf) {
    var x;
  })(lastIndexOf || (lastIndexOf = {}));
  let pop;
  (function (_pop) {
    var x;
  })(pop || (pop = {}));
  let push;
  (function (_push) {
    var x;
  })(push || (push = {}));
  let reverse;
  (function (_reverse) {
    var x;
  })(reverse || (reverse = {}));
  let shift;
  (function (_shift) {
    var x;
  })(shift || (shift = {}));
  let unshift;
  (function (_unshift) {
    var x;
  })(unshift || (unshift = {}));
  let slice;
  (function (_slice) {
    var x;
  })(slice || (slice = {}));
  let sort;
  (function (_sort) {
    var x;
  })(sort || (sort = {}));
  let splice;
  (function (_splice) {
    var x;
  })(splice || (splice = {}));
  let includes;
  (function (_includes) {
    var x;
  })(includes || (includes = {}));
  let indexOf;
  (function (_indexOf) {
    var x;
  })(indexOf || (indexOf = {}));
  let join;
  (function (_join) {
    var x;
  })(join || (join = {}));
  let keys;
  (function (_keys) {
    var x;
  })(keys || (keys = {}));
  let entries;
  (function (_entries) {
    var x;
  })(entries || (entries = {}));
  let values;
  (function (_values) {
    var x;
  })(values || (values = {}));
  let forEach;
  (function (_forEach) {
    var x;
  })(forEach || (forEach = {}));
  let filter;
  (function (_filter) {
    var x;
  })(filter || (filter = {}));
  let map;
  (function (_map) {
    var x;
  })(map || (map = {}));
  let every;
  (function (_every) {
    var x;
  })(every || (every = {}));
  let some;
  (function (_some) {
    var x;
  })(some || (some = {}));
  let reduce;
  (function (_reduce) {
    var x;
  })(reduce || (reduce = {}));
  let reduceRight;
  (function (_reduceRight) {
    var x;
  })(reduceRight || (reduceRight = {}));
  let toLocaleString;
  (function (_toLocaleString) {
    var x;
  })(toLocaleString || (toLocaleString = {}));
  let toString;
  (function (_toString) {
    var x;
  })(toString || (toString = {}));
  let flat;
  (function (_flat) {
    var x;
  })(flat || (flat = {}));
  let flatMap;
  (function (_flatMap) {
    var x;
  })(flatMap || (flatMap = {}));
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — declare global nested namespace (input)',
    source: `declare global { namespace globalThis { var i18n: any; } }

namespace X { var i18n: any; }

export class i18n {}
`,
    filename: 'input.ts',
    output: `let X;
(function (_X) {
  var i18n;
})(X || (X = {}));
export class i18n {}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — declare (input)',
    source: `export namespace N {
  export declare class C {
  }
  export declare enum e { };
  export declare function f(): void;
  export declare const v: unknown;
  export declare namespace B {
    export interface C { }
  }
}
`,
    filename: 'input.ts',
    output: `export let N;
(function (_N) {})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — empty removed (input)',
    source: `namespace a {
  namespace b {}
  namespace c { var x }
  namespace d {
    namespace e {}
  }
}

namespace WithTypes {
  namespace a { type A = 1 }
  namespace b { interface B {} }
  namespace c { import C = a }
  namespace d { declare class D {} }
}

namespace WithValues {
  namespace a { class A {} }
  namespace b { enum B {} }
  namespace c { function C() {} }
  namespace d { var D }
  namespace e { E; }
}
`,
    filename: 'input.ts',
    output: `let a;
(function (_a) {
  let c;
  (function (_c) {
    var x;
  })(c || (c = {}));
})(a || (a = {}));
let WithTypes;
(function (_WithTypes) {
  let d;
  (function (_d) {})(d || (d = {}));
})(WithTypes || (WithTypes = {}));
let WithValues;
(function (_WithValues) {
  let a;
  (function (_a2) {
    class A {}
  })(a || (a = {}));
  let b;
  (function (_b) {
    let B = /* @__PURE__ */ (function (B) {
      return B;
    })({});
  })(b || (b = {}));
  let c;
  (function (_c2) {
    function C() {}
  })(c || (c = {}));
  let d;
  (function (_d2) {
    var D;
  })(d || (d = {}));
  let e;
  (function (_e) {
    E;
  })(e || (e = {}));
})(WithValues || (WithValues = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — export type only (input)',
    source: `// #15940
namespace Platform {
  export type Name = "web";

  export namespace Data {
    export type Type = string;
    export declare namespace Empty {}
  }
}

export { Platform };
`,
    filename: 'input.ts',
    output: 'export {};',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — export (input)',
    source: `export namespace N { var x }
`,
    filename: 'input.ts',
    output: `export let N;
(function (_N) {
  var x;
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — multiple (input)',
    source: `namespace N { var x; }
namespace N { var y; }
`,
    filename: 'input.ts',
    output: `let N;
(function (_N) {
  var x;
})(N || (N = {}));
(function (_N2) {
  var y;
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — mutable fail (input)',
    source: `namespace N {
  export let V;
}
`,
    filename: 'input.ts',
    output: '[bailout] preflight:mutable-namespace-export',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — namespace flag (input)',
    source: `namespace N {}
`,
    filename: 'input.ts',
    output: '',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — nested destructuring (input)',
    source: `class C { }
namespace N {
  export const { a } = C;
  export const [ b ] = C;
  export const [ { a: [{ b: c }] }] = A, { a: { b: { d = 1 } } = {}, ...e } = C;
}
`,
    filename: 'input.ts',
    output: `class C {}
let N;
(function (_N) {
  const { a } = C;
  _N.a = a;
  const [b] = C;
  _N.b = b;
  const [
      {
        a: [{ b: c }],
      },
    ] = A,
    { a: { b: { d = 1 } } = {}, ...e } = C;
  ((_N.c = c), (_N.d = d), (_N.e = e));
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — nested namespace (input)',
    source: `export namespace A {
  export namespace B {
    export interface C {
      D?: number;
      E?: number;
      F?: string;
    }
  }

  export enum G {
    H = 0
  }
}
`,
    filename: 'input.ts',
    output: `export let A;
(function (_A) {
  let G = /* @__PURE__ */ (function (G) {
    G[(G['H'] = 0)] = 'H';
    return G;
  })({});
  _A.G = G;
})(A || (A = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — nested shorthand export (input)',
    source: `export namespace ui.a {
  export const x = 1;
}
export namespace ui.b {
  export const y = 2;
}
`,
    filename: 'input.ts',
    output: `export let ui;
(function (_ui) {
  let a;
  (function (_a) {
    const x = (_a.x = 1);
  })(a || (a = _ui.a || (_ui.a = {})));
})(ui || (ui = {}));
(function (_ui2) {
  let b;
  (function (_b) {
    const y = (_b.y = 2);
  })(b || (b = _ui2.b || (_ui2.b = {})));
})(ui || (ui = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — nested shorthand (input)',
    source: `namespace X.Y {
  export const Z = 1;
}

namespace proj.data.util.api {
  export const X = 1;
}
`,
    filename: 'input.ts',
    output: `let X;
(function (_X) {
  let Y;
  (function (_Y) {
    const Z = (_Y.Z = 1);
  })(Y || (Y = _X.Y || (_X.Y = {})));
})(X || (X = {}));
let proj;
(function (_proj) {
  let data;
  (function (_data) {
    let util;
    (function (_util) {
      let api;
      (function (_api) {
        const X = (_api.X = 1);
      })(api || (api = _util.api || (_util.api = {})));
    })(util || (util = _data.util || (_data.util = {})));
  })(data || (data = _proj.data || (_proj.data = {})));
})(proj || (proj = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — nested (input)',
    source: `class A { }
namespace A {
  export namespace C {
    export class G {}
    export const E = 7;
  }
  function M() {}
  namespace M {
    export const N = C.E;
  }
  export function D() {}
  export namespace D {
    const C = 5;
    export enum H {
      I = 11,
      J = 13,
      K = 17,
    }
  }
  class F {}
  namespace F { var x; }
  namespace G { var x; }
  enum L {
    M = 19,
  }
}
`,
    filename: 'input.ts',
    output: `class A {}
(function (_A) {
  let C;
  (function (_C) {
    class G {}
    _C.G = G;
    const E = (_C.E = 7);
  })(C || (C = _A.C || (_A.C = {})));
  function M() {}
  (function (_M) {
    const N = (_M.N = C.E);
  })(M || (M = {}));
  function D() {}
  _A.D = D;
  (function (_D) {
    const C = 5;
    let H = /* @__PURE__ */ (function (H) {
      H[(H['I'] = 11)] = 'I';
      H[(H['J'] = 13)] = 'J';
      H[(H['K'] = 17)] = 'K';
      return H;
    })({});
    _D.H = H;
  })(D || (D = _A.D || (_A.D = {})));
  class F {}
  (function (_F) {
    var x;
  })(F || (F = {}));
  let G;
  (function (_G) {
    var x;
  })(G || (G = {}));
  let L = /* @__PURE__ */ (function (L) {
    L[(L['M'] = 19)] = 'M';
    return L;
  })({});
})(A || (A = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — same name (input)',
    source: `namespace N {
  namespace _N7 { var x }
  export namespace N {
    export function _N3() {}
  }
  export namespace N {
    export class _N5 {}
  }
  export namespace N {
    export enum _N {}
  }
}
`,
    filename: 'input.ts',
    output: `let N;
(function (_N8) {
  let _N7;
  (function (_N9) {
    var x;
  })(_N7 || (_N7 = {}));
  let N;
  (function (_N10) {
    function _N3() {}
    _N10._N3 = _N3;
  })(N || (N = _N8.N || (_N8.N = {})));
  (function (_N11) {
    class _N5 {}
    _N11._N5 = _N5;
  })(N || (N = _N8.N || (_N8.N = {})));
  (function (_N12) {
    let _N = /* @__PURE__ */ (function (_N) {
      return _N;
    })({});
    _N12._N = _N;
  })(N || (N = _N8.N || (_N8.N = {})));
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'namespace — undeclared (input)',
    source: `namespace N { var x }
`,
    filename: 'input.ts',
    output: `let N;
(function (_N) {
  var x;
})(N || (N = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — custom values exported (input)',
    source: `export const enum A {
  x = 3,
  y = "f",
  z = 4 << 2,
  w = y
}

A.x;
A.y;
A.z;
A.w;
`,
    filename: 'input.ts',
    output: `export let A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 3)] = 'x';
  A['y'] = 'f';
  A[(A['z'] = 16)] = 'z';
  A['w'] = 'f';
  return A;
})({});
A.x;
A.y;
A.z;
A.w;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — custom values (input)',
    source: `const enum A {
  x = 3,
  y = "f",
  z = 4 << 2,
  w = y
}

A.x;
A.y;
A.z;
A.w;
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 3)] = 'x';
  A['y'] = 'f';
  A[(A['z'] = 16)] = 'z';
  A['w'] = 'f';
  return A;
})(A || {});
A.x;
A.y;
A.z;
A.w;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — declare (input)',
    source: `declare const enum A { x }

A.x;
`,
    filename: 'input.ts',
    output: 'A.x;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum type and value (input)',
    source: `const enum WhitespaceFlag {
  before = 1 << 0,
  after = 1 << 1,
}

export type { WhitespaceFlag as WF1 };
export { WhitespaceFlag as WF2 };

export const before = WhitespaceFlag.before;
`,
    filename: 'input.ts',
    output: `var WhitespaceFlag = /* @__PURE__ */ (function (WhitespaceFlag) {
  WhitespaceFlag[(WhitespaceFlag['before'] = 1)] = 'before';
  WhitespaceFlag[(WhitespaceFlag['after'] = 2)] = 'after';
  return WhitespaceFlag;
})(WhitespaceFlag || {});
export { WhitespaceFlag as WF2 };
export const before = WhitespaceFlag.before;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum type no deopt (input)',
    source: `const enum WhitespaceFlag {
  before = 1 << 0,
  after = 1 << 1,
}

export type { WhitespaceFlag as WF1 };
export { type WhitespaceFlag as WF2 };

export const before = WhitespaceFlag.before;
`,
    filename: 'input.ts',
    output: `var WhitespaceFlag = /* @__PURE__ */ (function (WhitespaceFlag) {
  WhitespaceFlag[(WhitespaceFlag['before'] = 1)] = 'before';
  WhitespaceFlag[(WhitespaceFlag['after'] = 2)] = 'after';
  return WhitespaceFlag;
})(WhitespaceFlag || {});
export const before = WhitespaceFlag.before;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — export const enum (input)',
    source: `export const enum A { y }

let x = A.y;
`,
    filename: 'input.ts',
    output: `export let A = /* @__PURE__ */ (function (A) {
  A[(A['y'] = 0)] = 'y';
  return A;
})({});
let x = A.y;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — exported (input)',
    source: `const enum A { y }

let x = A.y;

export { A };
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['y'] = 0)] = 'y';
  return A;
})(A || {});
let x = A.y;
export { A };`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — local shadowed (input)',
    source: `const enum A { x }

{
  let A = {};
  A.x;
}

A.x;
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 0)] = 'x';
  return A;
})(A || {});
{
  let A = {};
  A.x;
}
A.x;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — local (input)',
    source: `const enum A {
  x, y
}

A.x;
A["y"];
A.z;
A;
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 0)] = 'x';
  A[(A['y'] = 1)] = 'y';
  return A;
})(A || {});
A.x;
A['y'];
A.z;
A;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — merged exported (input)',
    source: `export const enum A {
  x, y
}

export const enum A {
  z
}

A.x;
A["y"];
A.z;
A.w;
A;
`,
    filename: 'input.ts',
    output: `export let A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 0)] = 'x';
  A[(A['y'] = 1)] = 'y';
  return A;
})({});
A = /* @__PURE__ */ (function (A) {
  A[(A['z'] = 0)] = 'z';
  return A;
})(A || {});
A.x;
A['y'];
A.z;
A.w;
A;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — merged (input)',
    source: `const enum A {
  x, y
}

const enum A {
  z
}

A.x;
A["y"];
A.z;
A.w;
A;
`,
    filename: 'input.ts',
    output: `var A = /* @__PURE__ */ (function (A) {
  A[(A['x'] = 0)] = 'x';
  A[(A['y'] = 1)] = 'y';
  return A;
})(A || {});
A = /* @__PURE__ */ (function (A) {
  A[(A['z'] = 0)] = 'z';
  return A;
})(A || {});
A.x;
A['y'];
A.z;
A.w;
A;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'optimize const enums — namespace (input)',
    source: `export namespace Tags {
  export const enum TagsType {
    Unknown = 0,
    PC = 1,
    Mobile = 2,
    Console = 3,
  }
  export interface TagsCategory {
    type?: Tags.TagsType;
    title?: string;
  }
}
`,
    filename: 'input.ts',
    output: `export let Tags;
(function (_Tags) {
  let TagsType = /* @__PURE__ */ (function (TagsType) {
    TagsType[(TagsType['Unknown'] = 0)] = 'Unknown';
    TagsType[(TagsType['PC'] = 1)] = 'PC';
    TagsType[(TagsType['Mobile'] = 2)] = 'Mobile';
    TagsType[(TagsType['Console'] = 3)] = 'Console';
    return TagsType;
  })({});
  _Tags.TagsType = TagsType;
})(Tags || (Tags = {}));`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'regression — 10162 (input)',
    source: 'export default 2;',
    filename: 'input.ts',
    output: 'export default 2;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'regression — 10338 (input)',
    source: `const {result} = idArray.reduce(
  (a, b) => {},
  {result: [] as (number | bigint)[]},
)`,
    filename: 'input.ts',
    output: 'const { result } = idArray.reduce((a, b) => {}, { result: [] });',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'regression — 11061 (input)',
    source: `import { messaging } from 'firebase-admin'

export class Something {
  constructor(
  \tpublic messaging: messaging.Messaging
  ) {
  }
}
`,
    filename: 'input.mjs',
    output: `export class Something {
  messaging;
  constructor(messaging) {
    this.messaging = messaging;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'regression — 15768 (input)',
    source: `const v = 42;
const v2 = Infinity;
const v3 = NaN;

{
\tlet Infinity = 1;
\tlet NaN = 2;

\tenum StateEnum {
\t\tokay = 0,
\t\tneg = -Infinity,
\t\tpos = Infinity,
\t\tnan = NaN,
\t\tnegReal = -1 / 0,
\t\tposReal = 1 / 0,
\t\tnanReal = 0 / 0,
\t\text = v,
\t\text2 = v2,
\t\text3 = v3,
\t}
}
`,
    filename: 'input.ts',
    output: `const v = 42;
const v2 = Infinity;
const v3 = NaN;
{
  let Infinity = 1;
  let NaN = 2;
  let StateEnum = (function (StateEnum) {
    StateEnum[(StateEnum['okay'] = 0)] = 'okay';
    StateEnum[(StateEnum['neg'] = -Infinity)] = 'neg';
    StateEnum[(StateEnum['pos'] = Infinity)] = 'pos';
    StateEnum[(StateEnum['nan'] = NaN)] = 'nan';
    StateEnum[(StateEnum['negReal'] = -Infinity)] = 'negReal';
    StateEnum[(StateEnum['posReal'] = Infinity)] = 'posReal';
    StateEnum[(StateEnum['nanReal'] = NaN)] = 'nanReal';
    StateEnum[(StateEnum['ext'] = v)] = 'ext';
    StateEnum[(StateEnum['ext2'] = v2)] = 'ext2';
    StateEnum[(StateEnum['ext3'] = v3)] = 'ext3';
    return StateEnum;
  })({});
}`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — call (input)',
    source: `f<T>();
`,
    filename: 'input.ts',
    output: 'f();',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — expr (input)',
    source: `f<T>;
`,
    filename: 'input.ts',
    output: 'f;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — new (input)',
    source: `new C<T>();
`,
    filename: 'input.ts',
    output: 'new C();',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — optional call (input)',
    source: `x?.f<T>();
x?.f?.<T>();
f?.<Q>();
`,
    filename: 'input.ts',
    output: `x?.f();
x?.f?.();
f?.();`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — tagged template (input)',
    source: `f<T>\`\`;
`,
    filename: 'input.ts',
    output: 'f``;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'type arguments — tsx (input)',
    source: `<C<number>></C>;
<C<number>/>;
`,
    filename: 'input.tsx',
    output: `<C></C>;
<C />;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'variable declaration — exclamation (input)',
    source: `let x!: number;
`,
    filename: 'input.ts',
    output: 'let x;',
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'variable declaration — non null in optional chain (input)',
    source: `const a = 1;
const b = () => a?.b?.c!.d;
`,
    filename: 'input.ts',
    output: `const a = 1;
const b = () => a?.b?.c.d;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'variable declaration — types erased (input)',
    source: `const n: number = 0;
const [a, b]: any = 0;
const { x, y }: any = 0;
`,
    filename: 'input.ts',
    output: `const n = 0;
const [a, b] = 0;
const { x, y } = 0;`,
    modes: [
      {
        title: 'default',
        options: {
          typescript: 'strip',
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
