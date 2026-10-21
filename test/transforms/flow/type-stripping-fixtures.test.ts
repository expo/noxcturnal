import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'class — declare (input)',
    source: `// @flow
class A {
  declare x;
}`,
    filename: 'input.js',
    output: `// @flow
class A {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — arrow type declaration (input)',
    source: `// @flow
const find2 = <X>() => {}
`,
    filename: 'input.js',
    output: `// @flow
const find2 = () => {};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — class fields initialized (input)',
    source: `// @flow
class X {
  foo = 2
  bar: number = 3
}
`,
    filename: 'input.js',
    output: `// @flow
class X {
  foo = 2;
  bar = 3;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — class fields uninitialized (input)',
    source: `// @flow
class Test {
  prop: string;
}
`,
    filename: 'input.js',
    output: `// @flow
class Test {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — object method type annotations (input)',
    source: `// @flow
// @flow
var obj = {
  method(a: string): number {
    return 5 + 5;
  }
};
`,
    filename: 'input.js',
    output: `// @flow
// @flow
var obj = {
  method(a) {
    return 5 + 5;
  },
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — property variance with class properties (input)',
    source: `// @flow
class C {
  +p: T = e;
}
`,
    filename: 'input.js',
    output: `// @flow
class C {
  p = e;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — regression 1168 (input)',
    source: `// @flow
function test(x: string = "hi"): string {
  return x;
}
`,
    filename: 'input.js',
    output: `// @flow
function test(x = 'hi') {
  return x;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — transformed class method loose return type annotation (input)',
    source: `// @flow
// @flow
class C {
  m(x: number): string {
    return 'a';
  }
}
`,
    filename: 'input.js',
    output: `// @flow
// @flow
class C {
  m(x) {
    return 'a';
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'requireDirective — true does not throw with directive (input)',
    source: `// @flow
function foo(numVal, strVal) {}
`,
    filename: 'input.js',
    output: `// @flow
function foo(numVal, strVal) {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'requireDirective — true strips with directive (input)',
    source: `// @flow
// @flow

function foo(numVal: number, strVal: string) {}
`,
    filename: 'input.js',
    output: `// @flow
// @flow

function foo(numVal, strVal) {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — def site variance (input)',
    source: `// @flow
class C1<+T, -U> {}
function f<+T, -U>() {}
type T<+T, -U> = {}
type T1 = { +p: T }
type T2 = { -p: T }
type T3 = { +[k:K]: V }
type T4 = { -[k:K]: V }
interface I1 { +p: T }
interface I2 { -p: T }
interface I3 { +[k:K]: V }
interface I4 { -[k:K]: V }
declare class I { +p: T }
declare class I { -p: T }
declare class I { +[k:K]: V }
declare class I { -[k:K]: V }
class C2 { +p: T }
class C3 { -p: T }
`,
    filename: 'input.js',
    output: `// @flow
class C1 {}
function f() {}

class C2 {}
class C3 {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — default parameters (input)',
    source: `// @flow
function foo(numVal?) {}
function foo(numVal? = 2) {}
function foo(numVal: number) {}
function foo(numVal?: number) {}
function foo(numVal: number = 2) {}
function foo(numVal?: number = 2) {}`,
    filename: 'input.js',
    output: `// @flow
function foo(numVal) {}
function foo(numVal = 2) {}
function foo(numVal) {}
function foo(numVal) {}
function foo(numVal = 2) {}
function foo(numVal = 2) {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip array types (input)',
    source: `// @flow
var a: number[];
var a: ?number[];
var a: (?number)[];
var a: () => number[];
var a: (() => number)[];
var a: typeof A[];
`,
    filename: 'input.js',
    output: `// @flow
var a;
var a;
var a;
var a;
var a;
var a;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip call properties (input)',
    source: `// @flow
var a: { (): number };
var a: { (): number; };
var a: { (): number; y: string; (x: string): string };
var a: { <T>(x: T): number; };
interface A { (): number; }
`,
    filename: 'input.js',
    output: `// @flow
var a;
var a;
var a;
var a;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip comment noflow (input)',
    source: `// @flow
// @noflow
const a = 1;`,
    filename: 'input.js',
    output: `// @flow
// @noflow
const a = 1;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip declare exports (input)',
    source: `// @flow
declare export var foo
declare export var foo;
declare export function foo(): void
declare export function foo(): void;
declare export function foo<T>(): void;
declare export function foo(x: number, y: string): void;
declare export class A {}
declare export class A<T> extends B<T> { x: number }
declare export class A { static foo(): number; static x : string }
declare export class A { static [ indexer: number]: string }
declare export class A { static () : number }
declare export class A mixins B<T>, C {}
declare export default class A {}
declare export default function foo(): void;
declare export default string
declare module "foo" { declare export type * from "bar"; }
`,
    filename: 'input.js',
    output: '[bailout] flow-requires-parser-adapter',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip declare module (input)',
    source: `// @flow
declare module A {}
declare module "./a/b.js" {}
declare module A { declare var x: number; }
declare module A { declare function foo(): number; }
declare module A { declare class B { foo(): number; } }
`,
    filename: 'input.js',
    output: '// @flow',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip declare statements (input)',
    source: `// @flow
declare var foo
declare var foo;
declare function foo(): void
declare function foo(): void;
declare function foo<T>(): void;
declare function foo(x: number, y: string): void;
declare class A1 {}
declare class A1<T> extends B<T> { x: number }
declare class A1 { static foo(): number; static x : string }
declare class A1 { static [ indexer: number]: string }
declare class A1 { static () : number }
declare class A1 mixins B<T>, C {}
declare type A2 = string
declare type T<U> = { [k:string]: U }
declare interface I1 { foo: string }
declare interface I2<T> { foo: T }
declare module.exports: string;
`,
    filename: 'input.js',
    output: '[bailout] flow-requires-parser-adapter',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip declared checks annotation (input)',
    source: `// @flow
declare function foo(x: mixed): boolean %checks(typeof x === "string");
`,
    filename: 'input.js',
    output: '// @flow',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip directive (input)',
    source: `/*@flow*/

/* @flow */

/**
 * @flow
 */

/**
 * @providesModule Foo
 * @flow
 */
`,
    filename: 'input.js',
    output: `/*@flow*/

/* @flow */

/**
 * @flow
 */

/**
 * @providesModule Foo
 * @flow
 */`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip inferred checks annotation (input)',
    source: `// @flow
var f = (x): %checks => typeof x === "string";
var g = (x: mixed): boolean %checks => typeof x === "string";
function h(x: mixed): %checks {
  return typeof x === "string";
}
`,
    filename: 'input.js',
    output: `// @flow
var f = x => typeof x === 'string';
var g = x => typeof x === 'string';
function h(x) {
  return typeof x === 'string';
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip interfaces module and script (input)',
    source: `// @flow
interface A1 {}
interface A2 extends B {}
interface A3<T> extends B<T>, C<T> {}
interface A4 { foo: () => number; }
interface Dictionary { [index: string]: string; length: number; }
class Foo implements Bar {}
class Foo2 extends Bar implements Bat, Man<number> {}
class Foo3 extends class Bar implements Bat {} {}
class Foo4 extends class Bar implements Bat {} implements Man {}
`,
    filename: 'input.js',
    output: `// @flow

class Foo {}
class Foo2 extends Bar {}
class Foo3 extends class Bar {} {}
class Foo4 extends class Bar {} {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip iterator (input)',
    source: `// @flow
declare class A {
  @@iterator(): Iterator<File>;
}

declare class A {
  @@asyncIterator(): Iterator<File>;
}

interface A1 {
  @@iterator(): Iterator<File>;
}

interface A2 {
  @@asyncIterator(): Iterator<File>;
}
`,
    filename: 'input.js',
    output: '// @flow',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip opaque type alias (input)',
    source: `// @flow
opaque type ID = string;
opaque type Foo<T> = Bar<T>
export opaque type Foo1 = number;

opaque type union =
 | {type: "A"}
 | {type: "B"}
;

opaque type overloads =
  & ((x: string) => number)
  & ((x: number) => string)
;

declare opaque type Foo2: Bar;
declare export opaque type Fo3: Bar;
`,
    filename: 'input.js',
    output: '// @flow',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip qualified generic type (input)',
    source: `// @flow
var a: A.B;
var a: A.B.C;
var a: A.B<T>;
var a: typeof A.B<T>;
`,
    filename: 'input.js',
    output: `// @flow
var a;
var a;
var a;
var a;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip string literal types (input)',
    source: `// @flow
function createElement(tagName: "div"): HTMLDivElement {}
function createElement(tagName: 'div'): HTMLDivElement {}
`,
    filename: 'input.js',
    output: `// @flow
function createElement(tagName) {}
function createElement(tagName) {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip this param (input)',
    source: `// @flow
function one (this : number) {}
function two (this : number, a) {}
function three (this : number, ...a) {}
function four (this : number, a, b, ...c) {}
function five<T> (this : T) {}

type six = (this : number) => void
type seven = { o(this : string) : void }
declare function eight (this : number) : void
declare class Nine { m (this : number) : void }

class Ten {
    m1 (this : number) {}
    m2 (this : number, a) {}
    m3 (this : number, ...a) {}
    m4 (this : number, a, b, ...c) {}
    m5<T> (this : T) {}
}

let eleven = {
    m1 (this : number) {},
    m2 (this : number, a) {},
    m3 (this : number, ...a) {},
    m4 (this : number, a, b, ...c) {},
    m5<T> (this : T) {}
}
`,
    filename: 'input.js',
    output: `// @flow
function one() {}
function two(a) {}
function three(...a) {}
function four(a, b, ...c) {}
function five() {}

class Ten {
  m1() {}
  m2(a) {}
  m3(...a) {}
  m4(a, b, ...c) {}
  m5() {}
}

let eleven = {
  m1() {},
  m2(a) {},
  m3(...a) {},
  m4(a, b, ...c) {},
  m5() {},
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip tuples (input)',
    source: `// @flow
var a: [] = [];
var a: [Foo<T>] = [foo];
var a: [number,] = [123,];
var a: [number, string] = [123, "duck"];
`,
    filename: 'input.js',
    output: `// @flow
var a = [];
var a = [foo];
var a = [123];
var a = [123, 'duck'];`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip type alias (input)',
    source: `// @flow
type FBID = number;
type Foo<T> = Bar<T>
export type Foo1 = number;

type union =
 | {type: "A"}
 | {type: "B"}
;

type overloads =
  & ((x: string) => number)
  & ((x: number) => string)
;
`,
    filename: 'input.js',
    output: '// @flow',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip type annotations 2 (input)',
    source: `// @flow
import type, { imp } from "bar";
`,
    filename: 'input.mjs',
    output: '[bailout] flow-requires-parser-adapter',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip type annotations syntax jsx (input)',
    source: `// @flow
// @flow
<Foo<T>></Foo>
`,
    filename: 'input.mjs',
    output: `// @flow
// @flow
<Foo></Foo>;`,
    modes: [
      {
        title: 'default',
        options: {
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip type annotations (input)',
    source: `// @flow
function foo1(numVal: any) {}
function foo2(numVal: number) {}
function foo3(numVal: number, strVal: string) {}
function foo4(numVal: number, untypedVal) {}
function foo5(untypedVal, numVal: number) {}
function foo6(nullableNum: ?number) {}
function foo7(callback: () => void) {}
function foo8(callback: () => number) {}
function foo9(callback: (_: bool) => number) {}
function foo10(callback: (_1: bool, _2: string) => number) {}
function foo11(callback: (_1: bool, ...foo: Array<number>) => number) {}
function foo12(): number{}
function foo13():() => void {}
function foo14():(_:bool) => number{}
function foo15():(_?:bool) => number{}
function foo16(): {} {}
function foo17<T>() {}
function foo18<T,S>() {}
a1 = function<T,S>() {};
a2 = { set fooProp(value: number) {} };
a3 = { set fooProp(value: number): void {} };
a4 = { get fooProp():number{} };
a5 = { id<T>(x: T): T {} };
a6 = { *id<T>(x: T): T {} };
a7 = { async id<T>(x: T): T {} };
a8 = { 123<T>(x: T): T {} };
class Foo {
  set fooProp(value: number) {}
}
class Foo2 {
  set fooProp(value: number): void {}
}
class Foo3 {
  get fooProp(): number {}
}
var numVal: number;
var numVal: number = otherNumVal;
var a1: { numVal: number };
var a2: { numVal: number; };
var a3: { numVal: number; [indexer: string]: number };
var a4: ?{ numVal: number };
var a5: { numVal: number; strVal: string }
var a6: { subObj: {strVal: string} }
var a7: { subObj: ?{strVal: string} }
var a8: { param1: number; param2: string }
var a9: { param1: number; param2?: string }
var a10: { ...any; ...{}|{p: void} };
var a11: { [a: number]: string; [b: number]: string; };
var a12: { add(x: number, ...y: Array<string>): void };
var a13: { id<T>(x: T): T; };
var a14:Array<number> = [1, 2, 3]
a13 = class Foo<T> {}
a14 = class Foo<T> extends Bar<T> {}
class Foo4<T> {}
class Foo5<T> extends Bar<T> {}
class Foo6<T> extends mixin(Bar) {}
class Foo7<T> {
  bar<U>():number { return 42; }
}
class Foo8 {
  "bar"<T>() {}
}
function foo19(requiredParam, optParam?) {}
class Foo9 {
  prop1: string;
  prop2: number;
}
class Foo10 {
  static prop1: string;
  prop2: number;
}
class Foo11 {
  #prop1: string;
  #prop2: number;
}
var x1: number | string = 4;
class Array { concat(items:number | string) {}; }
var x2: () => number | () => string = fn;
var x3: typeof Y = Y;
var x4: typeof Y | number = Y;
var {x5}: {x5: string; } = { x5: "hello" };
var {x6}: {x6: string } = { x6: "hello" };
var [x7]: Array<string> = [ "hello" ];
function foo20({x}: { x: string; }) {}
function foo21([x]: Array<string>) {}
function foo22(...rest: Array<number>) {}
(function (...rest: Array<number>) {});
((...rest: Array<number>) => rest);
var a15: Map<string, Array<string> >
var a16: Map<string, Array<string>>
var a17: number[]
var a18: ?string[]
var a19: Promise<bool>[]
var a20:(...rest:Array<number>) => number
var identity1: <T>(x: T) => T
var identity2: <T>(x: T, ...y:T[]) => T
import type imp1 from "bar";
import type { imp2, imp3 } from "baz";
import type { foo as imp4 } from "baz";
import type from "foo";
import typeof * as namespace from "bar";
export type { foo1 };
export type { foo2 } from "bar";
import {type T} from "foo";
import {type T2, V1} from "foo";
import {typeof V2} from "foo";
import {typeof V3, V4} from "foo";
export interface int5 { p: number }
export interface int6<T> { p: T }
import 'foo';
export type * from "foo";
`,
    filename: 'input.mjs',
    output: `// @flow
function foo1(numVal) {}
function foo2(numVal) {}
function foo3(numVal, strVal) {}
function foo4(numVal, untypedVal) {}
function foo5(untypedVal, numVal) {}
function foo6(nullableNum) {}
function foo7(callback) {}
function foo8(callback) {}
function foo9(callback) {}
function foo10(callback) {}
function foo11(callback) {}
function foo12() {}
function foo13() {}
function foo14() {}
function foo15() {}
function foo16() {}
function foo17() {}
function foo18() {}
a1 = function () {};
a2 = { set fooProp(value) {} };
a3 = { set fooProp(value) {} };
a4 = { get fooProp() {} };
a5 = { id(x) {} };
a6 = { *id(x) {} };
a7 = { async id(x) {} };
a8 = { 123(x) {} };
class Foo {
  set fooProp(value) {}
}
class Foo2 {
  set fooProp(value) {}
}
class Foo3 {
  get fooProp() {}
}
var numVal;
var numVal = otherNumVal;
var a1;
var a2;
var a3;
var a4;
var a5;
var a6;
var a7;
var a8;
var a9;
var a10;
var a11;
var a12;
var a13;
var a14 = [1, 2, 3];
a13 = class Foo {};
a14 = class Foo extends Bar {};
class Foo4 {}
class Foo5 extends Bar {}
class Foo6 extends mixin(Bar) {}
class Foo7 {
  bar() {
    return 42;
  }
}
class Foo8 {
  bar() {}
}
function foo19(requiredParam, optParam) {}
class Foo9 {}
class Foo10 {}
class Foo11 {
  #prop1;
  #prop2;
}
var x1 = 4;
class Array {
  concat(items) {}
}
var x2 = fn;
var x3 = Y;
var x4 = Y;
var { x5 } = { x5: 'hello' };
var { x6 } = { x6: 'hello' };
var [x7] = ['hello'];
function foo20({ x }) {}
function foo21([x]) {}
function foo22(...rest) {}
(function (...rest) {});
(...rest) => rest;
var a15;
var a16;
var a17;
var a18;
var a19;
var a20;
var identity1;
var identity2;

import type from 'foo';

import { V1 } from 'foo';

import { V4 } from 'foo';

import 'foo';`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip typeapp call (input)',
    source: `// @flow
// @flow
f<T>();
f<T><U></U>;
new C<T>;
f<T>(e);
o[e]<T>();
f<T>(x)<U>(y);
async <T>() => {};
async <T>(): T => {}
new C<T>(e);
f<T>[e];
new C<T>();
o.m<T>();
f<T>.0;
o?.m<T>(e);
o.m?.<T>(e);
async<T>();
f?.<T>(e);
`,
    filename: 'input.js',
    output: `// @flow
// @flow
f();
f < T > <U></U>;
new C();
f(e);
o[e]();
f(x)(y);
async () => {};
async () => {};
new C(e);
f < T > [e];
new C();
o.m();
f < T > 0;
o?.m(e);
o.m?.(e);
async();
f?.(e);`,
    modes: [
      {
        title: 'default',
        options: {
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — strip typecasts (input)',
    source: `// @flow
(xxx: number);
({ xxx: 0, yyy: "hey" }: { xxx: number; yyy: string });
(xxx => xxx + 1: (xxx: number) => number);
((xxx: number), (yyy: string));
`,
    filename: 'input.js',
    output: `// @flow
xxx;
({ xxx: 0, yyy: 'hey' });
xxx => xxx + 1;
(xxx, yyy);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
  {
    title: 'strip types — type comments (input)',
    source: `// @flow
var x = 1;
// comment 1
type FunWithComments = number
var y = 2;
`,
    filename: 'input.js',
    output: `// @flow
var x = 1;
// comment 1

var y = 2;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
