import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  '// @flow\nclass A {}',
  '// @flow\nconst find2 = () => {};',
  '// @flow\nclass X {\n  foo = 2;\n  bar = 3;\n}',
  '// @flow\nclass Test {\n  prop;\n}',
  '// @flow\n// @flow\nvar obj = {\n  method(a) {\n    return 5 + 5;\n  },\n};',
  '// @flow\nclass C {\n  p = e;\n}',
  "// @flow\nfunction test(x = 'hi') {\n  return x;\n}",
  "// @flow\n// @flow\nclass C {\n  m(x) {\n    return 'a';\n  }\n}",
  '// @flow\nfunction foo(numVal, strVal) {}',
  '// @flow\n// @flow\n\nfunction foo(numVal, strVal) {}',
  '// @flow\nclass C1 {}\nfunction f() {}\n\nclass C2 {\n  p;\n}\nclass C3 {\n  p;\n}',
  '// @flow\nfunction foo(numVal) {}\nfunction foo(numVal = 2) {}\nfunction foo(numVal) {}\nfunction foo(numVal) {}\nfunction foo(numVal = 2) {}\nfunction foo(numVal = 2) {}',
  '// @flow\nvar a;\nvar a;\nvar a;\nvar a;\nvar a;\nvar a;',
  '// @flow\nvar a;\nvar a;\nvar a;\nvar a;',
  '// @flow\n// @noflow\nconst a = 1;',
  '[bailout] flow-requires-parser-adapter',
  '// @flow',
  '/*@flow*/\n\n/* @flow */\n\n/**\n * @flow\n */\n\n/**\n * @providesModule Foo\n * @flow\n */',
  '[bailout] preflight:parse-error',
  '// @flow\n\nclass Foo {}\nclass Foo2 extends Bar {}\nclass Foo3 extends class Bar {} {}\nclass Foo4 extends class Bar {} {}',
  '// @flow\nfunction createElement(tagName) {}\nfunction createElement(tagName) {}',
  '// @flow\nfunction one() {}\nfunction two(a) {}\nfunction three(...a) {}\nfunction four(a, b, ...c) {}\nfunction five() {}\n\nclass Ten {\n  m1() {}\n  m2(a) {}\n  m3(...a) {}\n  m4(a, b, ...c) {}\n  m5() {}\n}\n\nlet eleven = {\n  m1() {},\n  m2(a) {},\n  m3(...a) {},\n  m4(a, b, ...c) {},\n  m5() {},\n};',
  "// @flow\nvar a = [];\nvar a = [foo];\nvar a = [123];\nvar a = [123, 'duck'];",
  '// @flow\n// @flow\n<Foo></Foo>;',
  "// @flow\nfunction foo1(numVal) {}\nfunction foo2(numVal) {}\nfunction foo3(numVal, strVal) {}\nfunction foo4(numVal, untypedVal) {}\nfunction foo5(untypedVal, numVal) {}\nfunction foo6(nullableNum) {}\nfunction foo7(callback) {}\nfunction foo8(callback) {}\nfunction foo9(callback) {}\nfunction foo10(callback) {}\nfunction foo11(callback) {}\nfunction foo12() {}\nfunction foo13() {}\nfunction foo14() {}\nfunction foo15() {}\nfunction foo16() {}\nfunction foo17() {}\nfunction foo18() {}\na1 = function () {};\na2 = { set fooProp(value) {} };\na3 = { set fooProp(value) {} };\na4 = { get fooProp() {} };\na5 = { id(x) {} };\na6 = { *id(x) {} };\na7 = { async id(x) {} };\na8 = { 123(x) {} };\nclass Foo {\n  set fooProp(value) {}\n}\nclass Foo2 {\n  set fooProp(value) {}\n}\nclass Foo3 {\n  get fooProp() {}\n}\nvar numVal;\nvar numVal = otherNumVal;\nvar a1;\nvar a2;\nvar a3;\nvar a4;\nvar a5;\nvar a6;\nvar a7;\nvar a8;\nvar a9;\nvar a10;\nvar a11;\nvar a12;\nvar a13;\nvar a14 = [1, 2, 3];\na13 = class Foo {};\na14 = class Foo extends Bar {};\nclass Foo4 {}\nclass Foo5 extends Bar {}\nclass Foo6 extends mixin(Bar) {}\nclass Foo7 {\n  bar() {\n    return 42;\n  }\n}\nclass Foo8 {\n  bar() {}\n}\nfunction foo19(requiredParam, optParam) {}\nclass Foo9 {\n  prop1;\n  prop2;\n}\nclass Foo10 {\n  static prop1;\n  prop2;\n}\nclass Foo11 {\n  #prop1;\n  #prop2;\n}\nvar x1 = 4;\nclass Array {\n  concat(items) {}\n}\nvar x2 = fn;\nvar x3 = Y;\nvar x4 = Y;\nvar { x5 } = { x5: 'hello' };\nvar { x6 } = { x6: 'hello' };\nvar [x7] = ['hello'];\nfunction foo20({ x }) {}\nfunction foo21([x]) {}\nfunction foo22(...rest) {}\n(function (...rest) {});\n(...rest) => rest;\nvar a15;\nvar a16;\nvar a17;\nvar a18;\nvar a19;\nvar a20;\nvar identity1;\nvar identity2;\n\nimport type from 'foo';\n\nimport { V1 } from 'foo';\n\nimport { V4 } from 'foo';\n\nimport 'foo';",
  '// @flow\n// @flow\nf();\nf < T > <U></U>;\nnew C();\nf(e);\no[e]();\nf(x)(y);\nasync () => {};\nasync () => {};\nnew C(e);\nf < T > [e];\nnew C();\no.m();\nf < T > 0;\no?.m(e);\no.m?.(e);\nasync();\nf?.(e);',
  "// @flow\nxxx;\n({ xxx: 0, yyy: 'hey' });\nxxx => xxx + 1;\n(xxx, yyy);",
  '// @flow\nvar x = 1;\n// comment 1\n\nvar y = 2;',
] as const;

export const fixtureCases = [
  {
    title: 'class — declare (input)',
    source: '// @flow\nclass A {\n  declare x;\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'regression — arrow type declaration (input)',
    source: '// @flow\nconst find2 = <X>() => {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'regression — class fields initialized (input)',
    source: '// @flow\nclass X {\n  foo = 2\n  bar: number = 3\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'regression — class fields uninitialized (input)',
    source: '// @flow\nclass Test {\n  prop: string;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'regression — object method type annotations (input)',
    source:
      '// @flow\n// @flow\nvar obj = {\n  method(a: string): number {\n    return 5 + 5;\n  }\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'regression — property variance with class properties (input)',
    source: '// @flow\nclass C {\n  +p: T = e;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'regression — regression 1168 (input)',
    source: '// @flow\nfunction test(x: string = "hi"): string {\n  return x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'regression — transformed class method loose return type annotation (input)',
    source: "// @flow\n// @flow\nclass C {\n  m(x: number): string {\n    return 'a';\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'requireDirective — true does not throw with directive (input)',
    source: '// @flow\nfunction foo(numVal, strVal) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'requireDirective — true strips with directive (input)',
    source: '// @flow\n// @flow\n\nfunction foo(numVal: number, strVal: string) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'strip types — def site variance (input)',
    source:
      '// @flow\nclass C1<+T, -U> {}\nfunction f<+T, -U>() {}\ntype T<+T, -U> = {}\ntype T1 = { +p: T }\ntype T2 = { -p: T }\ntype T3 = { +[k:K]: V }\ntype T4 = { -[k:K]: V }\ninterface I1 { +p: T }\ninterface I2 { -p: T }\ninterface I3 { +[k:K]: V }\ninterface I4 { -[k:K]: V }\ndeclare class I { +p: T }\ndeclare class I { -p: T }\ndeclare class I { +[k:K]: V }\ndeclare class I { -[k:K]: V }\nclass C2 { +p: T }\nclass C3 { -p: T }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'strip types — default parameters (input)',
    source:
      '// @flow\nfunction foo(numVal?) {}\nfunction foo(numVal? = 2) {}\nfunction foo(numVal: number) {}\nfunction foo(numVal?: number) {}\nfunction foo(numVal: number = 2) {}\nfunction foo(numVal?: number = 2) {}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'strip types — strip array types (input)',
    source:
      '// @flow\nvar a: number[];\nvar a: ?number[];\nvar a: (?number)[];\nvar a: () => number[];\nvar a: (() => number)[];\nvar a: typeof A[];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'strip types — strip call properties (input)',
    source:
      '// @flow\nvar a: { (): number };\nvar a: { (): number; };\nvar a: { (): number; y: string; (x: string): string };\nvar a: { <T>(x: T): number; };\ninterface A { (): number; }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'strip types — strip comment noflow (input)',
    source: '// @flow\n// @noflow\nconst a = 1;',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'strip types — strip declare exports (input)',
    source:
      '// @flow\ndeclare export var foo\ndeclare export var foo;\ndeclare export function foo(): void\ndeclare export function foo(): void;\ndeclare export function foo<T>(): void;\ndeclare export function foo(x: number, y: string): void;\ndeclare export class A {}\ndeclare export class A<T> extends B<T> { x: number }\ndeclare export class A { static foo(): number; static x : string }\ndeclare export class A { static [ indexer: number]: string }\ndeclare export class A { static () : number }\ndeclare export class A mixins B<T>, C {}\ndeclare export default class A {}\ndeclare export default function foo(): void;\ndeclare export default string\ndeclare module "foo" { declare export type * from "bar"; }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'strip types — strip declare module (input)',
    source:
      '// @flow\ndeclare module A {}\ndeclare module "./a/b.js" {}\ndeclare module A { declare var x: number; }\ndeclare module A { declare function foo(): number; }\ndeclare module A { declare class B { foo(): number; } }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'strip types — strip declare statements (input)',
    source:
      '// @flow\ndeclare var foo\ndeclare var foo;\ndeclare function foo(): void\ndeclare function foo(): void;\ndeclare function foo<T>(): void;\ndeclare function foo(x: number, y: string): void;\ndeclare class A1 {}\ndeclare class A1<T> extends B<T> { x: number }\ndeclare class A1 { static foo(): number; static x : string }\ndeclare class A1 { static [ indexer: number]: string }\ndeclare class A1 { static () : number }\ndeclare class A1 mixins B<T>, C {}\ndeclare type A2 = string\ndeclare type T<U> = { [k:string]: U }\ndeclare interface I1 { foo: string }\ndeclare interface I2<T> { foo: T }\ndeclare module.exports: string;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'strip types — strip declared checks annotation (input)',
    source: '// @flow\ndeclare function foo(x: mixed): boolean %checks(typeof x === "string");\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'strip types — strip directive (input)',
    source:
      '/*@flow*/\n\n/* @flow */\n\n/**\n * @flow\n */\n\n/**\n * @providesModule Foo\n * @flow\n */\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'strip types — strip inferred checks annotation (input)',
    source:
      '// @flow\nvar f = (x): %checks => typeof x === "string";\nvar g = (x: mixed): boolean %checks => typeof x === "string";\nfunction h(x: mixed): %checks {\n  return typeof x === "string";\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'strip types — strip interfaces module and script (input)',
    source:
      '// @flow\ninterface A1 {}\ninterface A2 extends B {}\ninterface A3<T> extends B<T>, C<T> {}\ninterface A4 { foo: () => number; }\ninterface Dictionary { [index: string]: string; length: number; }\nclass Foo implements Bar {}\nclass Foo2 extends Bar implements Bat, Man<number> {}\nclass Foo3 extends class Bar implements Bat {} {}\nclass Foo4 extends class Bar implements Bat {} implements Man {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'strip types — strip iterator (input)',
    source:
      '// @flow\ndeclare class A {\n  @@iterator(): Iterator<File>;\n}\n\ndeclare class A {\n  @@asyncIterator(): Iterator<File>;\n}\n\ninterface A1 {\n  @@iterator(): Iterator<File>;\n}\n\ninterface A2 {\n  @@asyncIterator(): Iterator<File>;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'strip types — strip opaque type alias (input)',
    source:
      '// @flow\nopaque type ID = string;\nopaque type Foo<T> = Bar<T>\nexport opaque type Foo1 = number;\n\nopaque type union =\n | {type: "A"}\n | {type: "B"}\n;\n\nopaque type overloads =\n  & ((x: string) => number)\n  & ((x: number) => string)\n;\n\ndeclare opaque type Foo2: Bar;\ndeclare export opaque type Fo3: Bar;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'strip types — strip qualified generic type (input)',
    source: '// @flow\nvar a: A.B;\nvar a: A.B.C;\nvar a: A.B<T>;\nvar a: typeof A.B<T>;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'strip types — strip string literal types (input)',
    source:
      '// @flow\nfunction createElement(tagName: "div"): HTMLDivElement {}\nfunction createElement(tagName: \'div\'): HTMLDivElement {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'strip types — strip this param (input)',
    source:
      '// @flow\nfunction one (this : number) {}\nfunction two (this : number, a) {}\nfunction three (this : number, ...a) {}\nfunction four (this : number, a, b, ...c) {}\nfunction five<T> (this : T) {}\n\ntype six = (this : number) => void\ntype seven = { o(this : string) : void }\ndeclare function eight (this : number) : void\ndeclare class Nine { m (this : number) : void }\n\nclass Ten {\n    m1 (this : number) {}\n    m2 (this : number, a) {}\n    m3 (this : number, ...a) {}\n    m4 (this : number, a, b, ...c) {}\n    m5<T> (this : T) {}\n}\n\nlet eleven = {\n    m1 (this : number) {},\n    m2 (this : number, a) {},\n    m3 (this : number, ...a) {},\n    m4 (this : number, a, b, ...c) {},\n    m5<T> (this : T) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'strip types — strip tuples (input)',
    source:
      '// @flow\nvar a: [] = [];\nvar a: [Foo<T>] = [foo];\nvar a: [number,] = [123,];\nvar a: [number, string] = [123, "duck"];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'strip types — strip type alias (input)',
    source:
      '// @flow\ntype FBID = number;\ntype Foo<T> = Bar<T>\nexport type Foo1 = number;\n\ntype union =\n | {type: "A"}\n | {type: "B"}\n;\n\ntype overloads =\n  & ((x: string) => number)\n  & ((x: number) => string)\n;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'strip types — strip type annotations 2 (input)',
    source: '// @flow\nimport type, { imp } from "bar";\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'strip types — strip type annotations syntax jsx (input)',
    source: '// @flow\n// @flow\n<Foo<T>></Foo>\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'strip types — strip type annotations (input)',
    source:
      '// @flow\nfunction foo1(numVal: any) {}\nfunction foo2(numVal: number) {}\nfunction foo3(numVal: number, strVal: string) {}\nfunction foo4(numVal: number, untypedVal) {}\nfunction foo5(untypedVal, numVal: number) {}\nfunction foo6(nullableNum: ?number) {}\nfunction foo7(callback: () => void) {}\nfunction foo8(callback: () => number) {}\nfunction foo9(callback: (_: bool) => number) {}\nfunction foo10(callback: (_1: bool, _2: string) => number) {}\nfunction foo11(callback: (_1: bool, ...foo: Array<number>) => number) {}\nfunction foo12(): number{}\nfunction foo13():() => void {}\nfunction foo14():(_:bool) => number{}\nfunction foo15():(_?:bool) => number{}\nfunction foo16(): {} {}\nfunction foo17<T>() {}\nfunction foo18<T,S>() {}\na1 = function<T,S>() {};\na2 = { set fooProp(value: number) {} };\na3 = { set fooProp(value: number): void {} };\na4 = { get fooProp():number{} };\na5 = { id<T>(x: T): T {} };\na6 = { *id<T>(x: T): T {} };\na7 = { async id<T>(x: T): T {} };\na8 = { 123<T>(x: T): T {} };\nclass Foo {\n  set fooProp(value: number) {}\n}\nclass Foo2 {\n  set fooProp(value: number): void {}\n}\nclass Foo3 {\n  get fooProp(): number {}\n}\nvar numVal: number;\nvar numVal: number = otherNumVal;\nvar a1: { numVal: number };\nvar a2: { numVal: number; };\nvar a3: { numVal: number; [indexer: string]: number };\nvar a4: ?{ numVal: number };\nvar a5: { numVal: number; strVal: string }\nvar a6: { subObj: {strVal: string} }\nvar a7: { subObj: ?{strVal: string} }\nvar a8: { param1: number; param2: string }\nvar a9: { param1: number; param2?: string }\nvar a10: { ...any; ...{}|{p: void} };\nvar a11: { [a: number]: string; [b: number]: string; };\nvar a12: { add(x: number, ...y: Array<string>): void };\nvar a13: { id<T>(x: T): T; };\nvar a14:Array<number> = [1, 2, 3]\na13 = class Foo<T> {}\na14 = class Foo<T> extends Bar<T> {}\nclass Foo4<T> {}\nclass Foo5<T> extends Bar<T> {}\nclass Foo6<T> extends mixin(Bar) {}\nclass Foo7<T> {\n  bar<U>():number { return 42; }\n}\nclass Foo8 {\n  "bar"<T>() {}\n}\nfunction foo19(requiredParam, optParam?) {}\nclass Foo9 {\n  prop1: string;\n  prop2: number;\n}\nclass Foo10 {\n  static prop1: string;\n  prop2: number;\n}\nclass Foo11 {\n  #prop1: string;\n  #prop2: number;\n}\nvar x1: number | string = 4;\nclass Array { concat(items:number | string) {}; }\nvar x2: () => number | () => string = fn;\nvar x3: typeof Y = Y;\nvar x4: typeof Y | number = Y;\nvar {x5}: {x5: string; } = { x5: "hello" };\nvar {x6}: {x6: string } = { x6: "hello" };\nvar [x7]: Array<string> = [ "hello" ];\nfunction foo20({x}: { x: string; }) {}\nfunction foo21([x]: Array<string>) {}\nfunction foo22(...rest: Array<number>) {}\n(function (...rest: Array<number>) {});\n((...rest: Array<number>) => rest);\nvar a15: Map<string, Array<string> >\nvar a16: Map<string, Array<string>>\nvar a17: number[]\nvar a18: ?string[]\nvar a19: Promise<bool>[]\nvar a20:(...rest:Array<number>) => number\nvar identity1: <T>(x: T) => T\nvar identity2: <T>(x: T, ...y:T[]) => T\nimport type imp1 from "bar";\nimport type { imp2, imp3 } from "baz";\nimport type { foo as imp4 } from "baz";\nimport type from "foo";\nimport typeof * as namespace from "bar";\nexport type { foo1 };\nexport type { foo2 } from "bar";\nimport {type T} from "foo";\nimport {type T2, V1} from "foo";\nimport {typeof V2} from "foo";\nimport {typeof V3, V4} from "foo";\nexport interface int5 { p: number }\nexport interface int6<T> { p: T }\nimport \'foo\';\nexport type * from "foo";\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'strip types — strip typeapp call (input)',
    source:
      '// @flow\n// @flow\nf<T>();\nf<T><U></U>;\nnew C<T>;\nf<T>(e);\no[e]<T>();\nf<T>(x)<U>(y);\nasync <T>() => {};\nasync <T>(): T => {}\nnew C<T>(e);\nf<T>[e];\nnew C<T>();\no.m<T>();\nf<T>.0;\no?.m<T>(e);\no.m?.<T>(e);\nasync<T>();\nf?.<T>(e);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          jsx: 'preserve',
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'strip types — strip typecasts (input)',
    source:
      '// @flow\n(xxx: number);\n({ xxx: 0, yyy: "hey" }: { xxx: number; yyy: string });\n(xxx => xxx + 1: (xxx: number) => number);\n((xxx: number), (yyy: string));\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'strip types — type comments (input)',
    source: '// @flow\nvar x = 1;\n// comment 1\ntype FunWithComments = number\nvar y = 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            legacyDecorators: true,
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
