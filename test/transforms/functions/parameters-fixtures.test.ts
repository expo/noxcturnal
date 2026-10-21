import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength — complex assignment (input)',
    source: `function test({a: b} = {}) {}
`,
    filename: 'input.js',
    output: `function test() {
  let { a: b } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default array destructuring (exec)',
    source: `function t([,,a] = [1,2,3]) { return a }

expect(t()).toBe(3);
expect(t([4,5,6])).toBe(6);
`,
    filename: 'exec.js',
    output: `function t() {
  let [, , a] = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [1, 2, 3];
  return a;
}
expect(t()).toBe(3);
expect(t([4, 5, 6])).toBe(6);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default array destructuring (input)',
    source: `function t([,,a] = [1,2,3]) { return a }
`,
    filename: 'input.js',
    output: `function t() {
  let [, , a] = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [1, 2, 3];
  return a;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default assignment with types (input)',
    source: `// @flow
export function transformFileSync(
  filename: string,
  opts?: Object = {},
): string {}
`,
    filename: 'input.mjs',
    output: `// @flow
export function transformFileSync(_arg) {
  let filename = arguments.length > 0 ? arguments[0] : void 0;
  let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default earlier params (exec)',
    source: `function f(a, b = a, c = b) { return c; }

expect(f(3)).toBe(3);
`,
    filename: 'exec.js',
    output: `function f(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : a;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : b;
  return c;
}
expect(f(3)).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife 1128 (exec)',
    source: `const bar = true;

function foo(a = bar, ...b) {
  const bar = false;
  expect(b[0]).toBe(2);
  expect(b[1]).toBe(3);
}

foo(1, 2, 3);
`,
    filename: 'exec.js',
    output: `const bar = true;
function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : bar;
  for (var _len = arguments.length, b = [], _key = 1; _key < _len; _key++) {
    b[_key - 1] = arguments[_key];
  }
  return (() => {
    const bar = false;
    expect(b[0]).toBe(2);
    expect(b[1]).toBe(3);
  })();
}
foo(1, 2, 3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife 4253 (exec)',
    source: `class Ref {
  static nextId = 0
  constructor(id = ++Ref.nextId, n = id) {
    this.id = n
  }
}

expect(new Ref().id).toBe(1);
expect(new Ref().id).toBe(2);
`,
    filename: 'exec.js',
    output: `class Ref {
  static nextId = 0;
  constructor() {
    let id = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ++Ref.nextId;
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : id;
    this.id = n;
  }
}
expect(new Ref().id).toBe(1);
expect(new Ref().id).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife self (exec)',
    source: `class Ref {
  constructor(ref = Ref) {
    this.ref = ref
  }
}

expect(new Ref().ref).toBe(Ref);
`,
    filename: 'exec.js',
    output: `class Ref {
  constructor() {
    let ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ref;
    this.ref = ref;
  }
}
expect(new Ref().ref).toBe(Ref);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default multiple (input)',
    source: `var t = function (e = "foo", f = 5) {
  return e + " bar " + f;
};

var a = function (e, f = 5) {
  return e + " bar " + f;
};
`,
    filename: 'input.js',
    output: `var t = function () {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';
  let f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5;
  return e + ' bar ' + f;
};
var a = function (_arg) {
  let e = arguments.length > 0 ? arguments[0] : void 0;
  let f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5;
  return e + ' bar ' + f;
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default object destructuring (exec)',
    source: `function required(msg) {
  throw new Error(msg);
}

function sum(
  { arr = required('arr is required') } = { arr: arr = [] },
  length = arr.length
) {
  let i = 0;
  let acc = 0;
  for (let item of arr) {
    if (i >= length) return acc;
    acc += item;
    i++;
  }
  return acc;
}

expect(sum({arr:[1,2]})).toBe(3);
`,
    filename: 'exec.js',
    output: `function required(msg) {
  throw new Error(msg);
}
function sum() {
  let { arr = required('arr is required') } =
    arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : { arr: (arr = []) };
  let length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : arr.length;
  let i = 0;
  let acc = 0;
  for (let item of arr) {
    if (i >= length) return acc;
    acc += item;
    i++;
  }
  return acc;
}
expect(sum({ arr: [1, 2] })).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default rest mix (input)',
    source: `function fn(
  a1,
  a2 = 4,
  {a3, a4},
  a5,
  {a6, a7} = {}) {

}
`,
    filename: 'input.js',
    output: `function fn(_arg) {
  let a1 = arguments.length > 0 ? arguments[0] : void 0;
  let a2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 4;
  let { a3, a4 } = arguments.length > 2 ? arguments[2] : void 0;
  let a5 = arguments.length > 3 ? arguments[3] : void 0;
  let { a6, a7 } = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default rest (exec)',
    source: `const a = 1;
function rest(b = a, ...a) {
  expect(b).toBe(1);
}
rest(undefined, 2)

function rest2(b = a, ...a) {
  expect(a[0]).toBe(2);
}
rest2(undefined, 2)

function rest3(b = a, ...a) {
  expect(a).toHaveLength(1);
}
rest3(undefined, 2)
`,
    filename: 'exec.js',
    output: `const a = 1;
function rest() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len = arguments.length, a = [], _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }
  expect(b).toBe(1);
}
rest(undefined, 2);
function rest2() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len9 = arguments.length, a = [], _key10 = 1; _key10 < _len9; _key10++) {
    a[_key10 - 1] = arguments[_key10];
  }
  expect(a[0]).toBe(2);
}
rest2(undefined, 2);
function rest3() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len11 = arguments.length, a = [], _key12 = 1; _key12 < _len11; _key12++) {
    a[_key12 - 1] = arguments[_key12];
  }
  expect(a).toHaveLength(1);
}
rest3(undefined, 2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default single (input)',
    source: `var t = function (f = "foo") {
  return f + " bar";
};
`,
    filename: 'input.js',
    output: `var t = function () {
  let f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';
  return f + ' bar';
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — destructuring rest (input)',
    source: `// #3861
function t(x = "default", { a, b }, ...args) {
  console.log(x, a, b, args);
}
`,
    filename: 'input.js',
    output: `// #3861
function t() {
  let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'default';
  let { a, b } = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len = arguments.length, args = [], _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  console.log(x, a, b, args);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — overwrite undefined (exec)',
    source: `function t(undefined = 17, a = 3) {
  return a;
}

expect(t()).toBe(3);
`,
    filename: 'exec.js',
    output: `function t() {
  let undefined = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 17;
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
  return a;
}
expect(t()).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — default (input)',
    source: `let f = (x = 0) => x + 1;
`,
    filename: 'input.js',
    output: `let f = function () {
  let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
  return x + 1;
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'loose — ignoreFunctionLength (input)',
    source: `function fn(a, b = c()) {
  return b;
}
`,
    filename: 'input.js',
    output: `function fn(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : c();
  return b;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — arrow default super no classes plugin (input)',
    source: `class Bar extends Foo {
    constructor() {
        let f = (x = super()) => x;
        f();
    }
}
`,
    filename: 'input.js',
    output: `class Bar extends Foo {
  constructor() {
    let f = () => {
      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : super();
      return x;
    };
    f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — arrow rest super no classes plugin (input)',
    source: `class Bar extends Foo {
    constructor() {
        let f = (...args) => super(...args);
        f();
    }
}
`,
    filename: 'input.js',
    output: `class Bar extends Foo {
  constructor() {
    let f = () => {
      for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
        args[_key - 0] = arguments[_key];
      }
      return super(...args);
    };
    f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — async generator (exec)',
    source: `async function* f([]) {};

expect(() => {
  f();
}).toThrow(TypeError);
`,
    filename: 'exec.js',
    output: `function f() {
  let [] = arguments.length > 0 ? arguments[0] : void 0;
  return async function* () {}.call(this);
}
expect(() => {
  f();
}).toThrow(TypeError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — async generator (input)',
    source: `async function* f([]) {};

expect(() => {
  f();
}).toThrow(TypeError);
`,
    filename: 'input.js',
    output: `function f() {
  let [] = arguments.length > 0 ? arguments[0] : void 0;
  return async function* () {}.call(this);
}
expect(() => {
  f();
}).toThrow(TypeError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default arguments (exec)',
    source: `function func(...arguments) {
    return arguments;
}
expect(func(1, 2, 3)).toStrictEqual([1, 2, 3])
`,
    filename: 'exec.js',
    output: `function func() {
  for (var _len = arguments.length, arguments = [], _key = 0; _key < _len; _key++) {
    arguments[_key - 0] = arguments[_key];
  }
  return arguments;
}
expect(func(1, 2, 3)).toStrictEqual([1, 2, 3]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default arguments (input)',
    source: `function func(...arguments) {
    console.log(arguments); // [1, 2, 3]
}
func(1, 2, 3);
`,
    filename: 'input.js',
    output: `function func() {
  for (var _len = arguments.length, arguments = [], _key = 0; _key < _len; _key++) {
    arguments[_key - 0] = arguments[_key];
  }
  console.log(arguments);
}
func(1, 2, 3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default before last (input)',
    source: `function foo(a = "foo", b) {

}
`,
    filename: 'input.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';
  let b = arguments.length > 1 ? arguments[1] : void 0;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default earlier params (exec)',
    source: `function f(a, b = a, c = b) { return c; }

expect(3).toBe(f(3));
`,
    filename: 'exec.js',
    output: `function f(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : a;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : b;
  return c;
}
expect(3).toBe(f(3));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default eval (input)',
    source: `let x = "outside";
function outer(a = () => eval("x")) {
  let x = "inside";
  return a();
}
outer();
`,
    filename: 'input.js',
    output: `let x = 'outside';
function outer() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => eval('x');
  return (() => {
    let x = 'inside';
    return a();
  })();
}
outer();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default iife 4253 (input)',
    source: `class Ref {
  constructor(id = ++Ref.nextID) {
    this.id = id
  }
}
Ref.nextID = 0`,
    filename: 'input.js',
    output: `class Ref {
  constructor() {
    let id = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ++Ref.nextID;
    this.id = id;
  }
}
Ref.nextID = 0;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default iife 9947 (input)',
    source: `let x = "outside";
function outer(a = () => x) {
  let x = "inside";
  return a();
}
outer();
`,
    filename: 'input.js',
    output: `let x = 'outside';
function outer() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => x;
  return (() => {
    let x = 'inside';
    return a();
  })();
}
outer();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default iife self (input)',
    source: `class Ref {
  constructor(ref = Ref) {
    this.ref = ref
  }
}

class X {
  constructor(x = foo) {
    this.x = x
  }
}
`,
    filename: 'input.js',
    output: `class Ref {
  constructor() {
    let ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ref;
    this.ref = ref;
  }
}
class X {
  constructor() {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : foo;
    this.x = x;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default rest (input)',
    source: `const a = 1;
function rest(b = a, ...a) {
  expect(b).toBe(1);
}
rest(undefined, 2)

function rest2(b = a, ...a) {
  expect(a[0]).toBe(2);
}
rest2(undefined, 2)

function rest3(b = a, ...a) {
  expect(a).toHaveLength(1);
}
rest3(undefined, 2)
`,
    filename: 'input.js',
    output: `const a = 1;
function rest() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len = arguments.length, a = [], _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }
  expect(b).toBe(1);
}
rest(undefined, 2);
function rest2() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len9 = arguments.length, a = [], _key10 = 1; _key10 < _len9; _key10++) {
    a[_key10 - 1] = arguments[_key10];
  }
  expect(a[0]).toBe(2);
}
rest2(undefined, 2);
function rest3() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
  for (var _len11 = arguments.length, a = [], _key12 = 1; _key12 < _len11; _key12++) {
    a[_key12 - 1] = arguments[_key12];
  }
  expect(a).toHaveLength(1);
}
rest3(undefined, 2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default setter (exec)',
    source: `const defaultValue = 1;
const obj = {
  set field(num = defaultValue) {
    this.num = num;
  }
};
obj.field = void 0;

expect(obj.num).toBe(defaultValue);
`,
    filename: 'exec.js',
    output: `const defaultValue = 1;
const obj = {
  set field(_arg) {
    let num = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : defaultValue;
    this.num = num;
  },
};
obj.field = void 0;
expect(obj.num).toBe(defaultValue);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — default setter (input)',
    source: `const obj = {
  set field(num = 1) {
    this.num = num;
  }
};
`,
    filename: 'input.js',
    output: `const obj = {
  set field(_arg) {
    let num = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
    this.num = num;
  },
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — flow this param (input)',
    source: `// @flow
function foo (this : number, x : number, y : string, ...z : any) {
    x + y + z[0];
}
`,
    filename: 'input.js',
    output: `// @flow
function foo(_arg, _arg7) {
  let x = arguments.length > 0 ? arguments[0] : void 0;
  let y = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len = arguments.length, z = [], _key = 2; _key < _len; _key++) {
    z[_key - 2] = arguments[_key];
  }
  x + y + z[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — fn decl same as param (input)',
    source: `function foo(a = 2) {
  function a() {

  }
}
`,
    filename: 'input.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    function a() {}
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — generator (input)',
    source: `function* fn(a, [], b = 2) {
  yield a;
  yield arguments;
  yield this;
  return b;
}
`,
    filename: 'input.ts',
    output: `function fn(_arg) {
  var _arguments = typeof arguments === 'undefined' ? void 0 : arguments;
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let [] = arguments.length > 1 ? arguments[1] : void 0;
  let b = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  return function* () {
    yield a;
    yield _arguments;
    yield this;
    return b;
  }.call(this);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — iife this 9385 (input)',
    source: `export class Test {
  invite(options: { privacy: string } = {}) {
    const privacy = options.privacy || "Private"
    console.log(this)
  }
}`,
    filename: 'input.mjs',
    output: `export class Test {
  invite() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const privacy = options.privacy || 'Private';
    console.log(this);
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'parameters — iife this (input)',
    source: `var a;

class Test {
  invite(p = a) {
    let a;
    this;
  }
}`,
    filename: 'input.js',
    output: `var a;
class Test {
  invite() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;
    return (() => {
      let a;
      this;
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — let for init same as param (exec)',
    source: `function foo(a = 2) {
  for (let a = 1; a > 0; a--);
  expect(a).toBe(2);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (let a = 1; a > 0; a--);
    expect(a).toBe(2);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — let no init for init same as param (exec)',
    source: `function foo(a = 2) {
  for (let a, i = 0; i < 1; i++) a = 1;
  expect(a).toBe(2);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (let a, i = 0; i < 1; i++) a = 1;
    expect(a).toBe(2);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — preserve types (input)',
    source: `type Point = {
  x: number;
  y: number;
};

function value({ x, y }: Point) {
  return x * y;
}

function valueWithDefault({ x, y }: Point = {}) {
  return x * y;
}

`,
    filename: 'input.ts',
    output: `function value() {
  let { x, y } = arguments.length > 0 ? arguments[0] : void 0;
  return x * y;
}
function valueWithDefault() {
  let { x, y } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  return x * y;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'parameters — regression 4333 (input)',
    source: `const args = 'bar';
function foo(...args) {
  return args;
}
`,
    filename: 'input.js',
    output: `const args = 'bar';
function foo() {
  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
    args[_key - 0] = arguments[_key];
  }
  return args;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — regression 4348 (input)',
    source: `function first(...values) {
  var index = 0;
  return values[index++];
}
`,
    filename: 'input.js',
    output: `function first() {
  for (var _len = arguments.length, values = [], _key = 0; _key < _len; _key++) {
    values[_key - 0] = arguments[_key];
  }
  var index = 0;
  return values[index++];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — regression 4634 (input)',
    source: `// @flow
let oneOf = (...nodes) => {
  if (nodes.length === 1) {
    return nodes[0];
  }
  return ((new OneOfNode(nodes)): any)
}
`,
    filename: 'input.js',
    output: `// @flow
let oneOf = function () {
  for (var _len = arguments.length, nodes = [], _key = 0; _key < _len; _key++) {
    nodes[_key - 0] = arguments[_key];
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  return new OneOfNode(nodes);
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — regression 5787 (exec)',
    source: `function f1(a, ...rest) {
  let b = rest[rest.length - 3];
  let c = rest[rest.length - 2];
  let d = rest[rest.length - 1];
  return [a, b, c, d];
}
expect(f1(1, 2)).toEqual([1, undefined, undefined, 2]);

function f2(a, ...rest) {
  return rest[-1];
}
expect(f2(1, 2)).toBeUndefined();
`,
    filename: 'exec.js',
    output: `function f1(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, rest = [], _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }
  let b = rest[rest.length - 3];
  let c = rest[rest.length - 2];
  let d = rest[rest.length - 1];
  return [a, b, c, d];
}
expect(f1(1, 2)).toEqual([1, undefined, undefined, 2]);
function f2(_arg14) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len12 = arguments.length, rest = [], _key13 = 1; _key13 < _len12; _key13++) {
    rest[_key13 - 1] = arguments[_key13];
  }
  return rest[-1];
}
expect(f2(1, 2)).toBeUndefined();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — regression 5787 (input)',
    source: `function f(a, ...rest) {
  let b = rest[rest.length - 3];
  let c = rest[rest.length - 2];
  let d = rest[rest.length - 1];
  return [a, b, c, d];
}

function f(a, ...rest) {
  return rest[-1];
}
`,
    filename: 'input.js',
    output: `function f(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, rest = [], _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }
  let b = rest[rest.length - 3];
  let c = rest[rest.length - 2];
  let d = rest[rest.length - 1];
  return [a, b, c, d];
}
function f(_arg11) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len9 = arguments.length, rest = [], _key10 = 1; _key10 < _len9; _key10++) {
    rest[_key10 - 1] = arguments[_key10];
  }
  return rest[-1];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest argument with other arguments (exec)',
    source: `function func(a, b, ...arguments) {
    return [a, b, arguments];
}

expect(func('a', 'b', 1, 2, 3)).toStrictEqual(['a', 'b', [1, 2, 3]])`,
    filename: 'exec.js',
    output: `function func(_arg, _arg8) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len = arguments.length, arguments = [], _key = 2; _key < _len; _key++) {
    arguments[_key - 2] = arguments[_key];
  }
  return [a, b, arguments];
}
expect(func('a', 'b', 1, 2, 3)).toStrictEqual(['a', 'b', [1, 2, 3]]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest argument with other arguments (input)',
    source: `function func(a, b, ...arguments) {
    return [a, b, arguments];
}

func('a', 'b', 1, 2, 3)`,
    filename: 'input.js',
    output: `function func(_arg, _arg7) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len = arguments.length, arguments = [], _key = 2; _key < _len; _key++) {
    arguments[_key - 2] = arguments[_key];
  }
  return [a, b, arguments];
}
func('a', 'b', 1, 2, 3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest arguments deoptimisation (input)',
    source: `function x (...rest) {
  arguments;
}
`,
    filename: 'input.js',
    output: `function x() {
  for (var _len = arguments.length, rest = [], _key = 0; _key < _len; _key++) {
    rest[_key - 0] = arguments[_key];
  }
  arguments;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest arrow functions (input)',
    source: `// @flow
var concat = (...args) => {
  var x = args[0];
  var y = args[1];
};

var somefun = function () {
  let get2ndArg = (a, b, ...args1) => {
    var _b = args1[0];
    let somef = (x, y, z, ...args2) => {
      var _a = args2[0];
    };
    let somefg = (c, d, e, f, ...args3) => {
      var _a = args3[0];
    };
    var _d = args1[1];
  };
  let get3rdArg = (...args) => args[2];
}

function demo1(...args) {
  return (i) => {
    return args[i+0];
  };
}

var x = (...rest) => {
  if (noNeedToWork) return 0;
  return rest;
};

var innerclassproperties = (...args) => (
  class {
    static args = args;
    args = args;
  }
);
`,
    filename: 'input.js',
    output: `// @flow
var concat = function () {
  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
    args[_key - 0] = arguments[_key];
  }
  var x = args[0];
  var y = args[1];
};
var somefun = function () {
  let get2ndArg = function (a, b) {
    for (var _len29 = arguments.length, args1 = [], _key30 = 2; _key30 < _len29; _key30++) {
      args1[_key30 - 2] = arguments[_key30];
    }
    var _b = args1[0];
    let somef = function (x, y, z) {
      for (var _len31 = arguments.length, args2 = [], _key32 = 3; _key32 < _len31; _key32++) {
        args2[_key32 - 3] = arguments[_key32];
      }
      var _a = args2[0];
    };
    let somefg = function (c, d, e, f) {
      for (var _len33 = arguments.length, args3 = [], _key34 = 4; _key34 < _len33; _key34++) {
        args3[_key34 - 4] = arguments[_key34];
      }
      var _a = args3[0];
    };
    var _d = args1[1];
  };
  let get3rdArg = function () {
    for (var _len35 = arguments.length, args = [], _key36 = 0; _key36 < _len35; _key36++) {
      args[_key36 - 0] = arguments[_key36];
    }
    return args[2];
  };
};
function demo1() {
  for (var _len37 = arguments.length, args = [], _key38 = 0; _key38 < _len37; _key38++) {
    args[_key38 - 0] = arguments[_key38];
  }
  return i => {
    return args[i + 0];
  };
}
var x = function () {
  for (var _len39 = arguments.length, rest = [], _key40 = 0; _key40 < _len39; _key40++) {
    rest[_key40 - 0] = arguments[_key40];
  }
  if (noNeedToWork) return 0;
  return rest;
};
var innerclassproperties = function () {
  for (var _len41 = arguments.length, args = [], _key42 = 0; _key42 < _len41; _key42++) {
    args[_key42 - 0] = arguments[_key42];
  }
  return class {
    static args = args;
    args = args;
  };
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest async arrow functions (input)',
    source: `var concat = async (...args) => {
  var x = args[0];
  var y = args[1];
};

var x = async (...rest) => {
  if (noNeedToWork) return 0;
  return rest;
};
`,
    filename: 'input.js',
    output: `var concat = async function () {
  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
    args[_key - 0] = arguments[_key];
  }
  var x = args[0];
  var y = args[1];
};
var x = async function () {
  for (var _len8 = arguments.length, rest = [], _key9 = 0; _key9 < _len8; _key9++) {
    rest[_key9 - 0] = arguments[_key9];
  }
  if (noNeedToWork) return 0;
  return rest;
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest binding deoptimisation (input)',
    source: `const deepAssign = (...args) => args = [];
`,
    filename: 'input.js',
    output: `const deepAssign = function () {
  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
    args[_key - 0] = arguments[_key];
  }
  return (args = []);
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest deepest common ancestor earliest child (input)',
    source: `// single reference
function r(...rest){
  if (noNeedToWork) return 0;
  return rest;
}

// multiple references
function r(...rest){
  if (noNeedToWork) return 0;

  rest;
  rest;
}

// multiple nested references
function r(...rest){
  if (noNeedToWork) return 0;

  if (true) {
    return rest;
  } else {
    return rest;
  }
}

// deeply nested
function r(...rest){
  if (true) {
    if (true) {
      return rest;
    } else {
      return rest;
    }
  }
}

// nested reference with root reference
function r(...rest){
  if (noNeedToWork) return 0;

  if (lol) rest;
  rest;
}

// nested functions
function a(...args) {
  return function() {
    function b() {}

    console.log("Shouldn't args be from a's scope?", args);
  };
}

// loop
function runQueue(queue, ...args) {
  for (let i = 0; i < queue.length; i++) {
    queue[i](...args)
  }
}

// nested loop
function runQueue(queue, ...args) {
  if (foo) {
    for (let i = 0; i < queue.length; i++) {
      queue[i](...args)
    }
  }
}

function r(...rest){
  if (noNeedToWork) return 0;
  [rest[0]] = x;
  return rest;
}
`,
    filename: 'input.js',
    output: `// single reference
function r() {
  for (var _len = arguments.length, rest = [], _key = 0; _key < _len; _key++) {
    rest[_key - 0] = arguments[_key];
  }
  if (noNeedToWork) return 0;
  return rest;
}
// multiple references
function r() {
  for (var _len15 = arguments.length, rest = [], _key16 = 0; _key16 < _len15; _key16++) {
    rest[_key16 - 0] = arguments[_key16];
  }
  if (noNeedToWork) return 0;
  rest;
  rest;
}
// multiple nested references
function r() {
  for (var _len17 = arguments.length, rest = [], _key18 = 0; _key18 < _len17; _key18++) {
    rest[_key18 - 0] = arguments[_key18];
  }
  if (noNeedToWork) return 0;
  if (true) {
    return rest;
  } else {
    return rest;
  }
}
// deeply nested
function r() {
  for (var _len19 = arguments.length, rest = [], _key20 = 0; _key20 < _len19; _key20++) {
    rest[_key20 - 0] = arguments[_key20];
  }
  if (true) {
    if (true) {
      return rest;
    } else {
      return rest;
    }
  }
}
// nested reference with root reference
function r() {
  for (var _len21 = arguments.length, rest = [], _key22 = 0; _key22 < _len21; _key22++) {
    rest[_key22 - 0] = arguments[_key22];
  }
  if (noNeedToWork) return 0;
  if (lol) rest;
  rest;
}
// nested functions
function a() {
  for (var _len23 = arguments.length, args = [], _key24 = 0; _key24 < _len23; _key24++) {
    args[_key24 - 0] = arguments[_key24];
  }
  return function () {
    function b() {}
    console.log("Shouldn't args be from a's scope?", args);
  };
}
// loop
function runQueue(_arg) {
  let queue = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len25 = arguments.length, args = [], _key26 = 1; _key26 < _len25; _key26++) {
    args[_key26 - 1] = arguments[_key26];
  }
  for (let i = 0; i < queue.length; i++) {
    queue[i](...args);
  }
}
// nested loop
function runQueue(_arg30) {
  let queue = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len28 = arguments.length, args = [], _key29 = 1; _key29 < _len28; _key29++) {
    args[_key29 - 1] = arguments[_key29];
  }
  if (foo) {
    for (let i = 0; i < queue.length; i++) {
      queue[i](...args);
    }
  }
}
function r() {
  for (var _len31 = arguments.length, rest = [], _key32 = 0; _key32 < _len31; _key32++) {
    rest[_key32 - 0] = arguments[_key32];
  }
  if (noNeedToWork) return 0;
  [rest[0]] = x;
  return rest;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest length (exec)',
    source: `var length = function (a, b, ...items) {
  return items.length;
};

expect(length()).toBe(0);
expect(length(1)).toBe(0);
expect(length(1, 2)).toBe(0);
expect(length(1, 2, 3)).toBe(1);
`,
    filename: 'exec.js',
    output: `var length = function (_arg, _arg8) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len = arguments.length, items = [], _key = 2; _key < _len; _key++) {
    items[_key - 2] = arguments[_key];
  }
  return items.length;
};
expect(length()).toBe(0);
expect(length(1)).toBe(0);
expect(length(1, 2)).toBe(0);
expect(length(1, 2, 3)).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest length (input)',
    source: `var t = function (f, ...items) {
  items[0];
  items[items.length - 1];
};

function t(f, ...items) {
  items;
  items[0];
  items[items.length - 1];
}
`,
    filename: 'input.js',
    output: `var t = function (_arg) {
  let f = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, items = [], _key = 1; _key < _len; _key++) {
    items[_key - 1] = arguments[_key];
  }
  items[0];
  items[items.length - 1];
};
function t(_arg8) {
  let f = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len6 = arguments.length, items = [], _key7 = 1; _key7 < _len6; _key7++) {
    items[_key7 - 1] = arguments[_key7];
  }
  items;
  items[0];
  items[items.length - 1];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest member expression deoptimisation (input)',
    source: `var x = function (foo, ...bar) {
  console.log(bar);
};

var y = function (foo, ...bar) {
  var x = function z(bar) {
    bar[1] = 5;
  };
};

var b = function (x, y, ...args) {
  console.log(args[0]);
  args.pop();
  console.log(args[1]);
};

var z = function (foo, ...bar) {
  var x = function () {
    bar[1] = 5;
  };
};

var a = function (foo, ...bar) {
  return bar.join(",");
};

var b = function (foo, ...bar) {
  var join = "join";
  return bar[join];
};

var b = function (...bar) {
  return bar.len;
};

var b = function (foo, ...bar) {
  return bar.length * 2;
};

var b = function (foo, baz, ...bar) {
  return bar.length;
};

function x (...rest) {
  rest[0] = 0;
}

function swap (...rest) {
  [rest[0], rest[1]] = [rest[1], rest[0]];
}

function forIn (...rest) {
  for (rest[0] in this) {
    foo(rest[0]);
  }
}

function inc (...rest) {
  ++rest[0];
}

function dec (...rest) {
  --rest[0];
}

function del (...rest) {
  delete rest[0];
}

function method (...rest) {
  rest[0]();
}

function newExp (...rest) {
  new rest[0]();
}

// In addition to swap() above because at some point someone tried checking
// grandparent path for isArrayExpression() to deopt.
function arrayDestructure (...rest) {
  [rest[0]] = x;
}

function forOf (...rest) {
  for (rest[0] of this);
}

function postfixIncrement (...rest) {
  rest[0]++;
}

function postfixDecrement (...rest) {
  rest[0]--;
}
`,
    filename: 'input.js',
    output: `var x = function (_arg) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, bar = [], _key = 1; _key < _len; _key++) {
    bar[_key - 1] = arguments[_key];
  }
  console.log(bar);
};
var y = function (_arg28) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len26 = arguments.length, bar = [], _key27 = 1; _key27 < _len26; _key27++) {
    bar[_key27 - 1] = arguments[_key27];
  }
  return (bar => {
    var x = function z(bar) {
      bar[1] = 5;
    };
  })(bar);
};
var b = function (_arg31, _arg32) {
  let x = arguments.length > 0 ? arguments[0] : void 0;
  let y = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len29 = arguments.length, args = [], _key30 = 2; _key30 < _len29; _key30++) {
    args[_key30 - 2] = arguments[_key30];
  }
  console.log(args[0]);
  args.pop();
  console.log(args[1]);
};
var z = function (_arg35) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len33 = arguments.length, bar = [], _key34 = 1; _key34 < _len33; _key34++) {
    bar[_key34 - 1] = arguments[_key34];
  }
  var x = function () {
    bar[1] = 5;
  };
};
var a = function (_arg38) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len36 = arguments.length, bar = [], _key37 = 1; _key37 < _len36; _key37++) {
    bar[_key37 - 1] = arguments[_key37];
  }
  return bar.join(',');
};
var b = function (_arg41) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len39 = arguments.length, bar = [], _key40 = 1; _key40 < _len39; _key40++) {
    bar[_key40 - 1] = arguments[_key40];
  }
  var join = 'join';
  return bar[join];
};
var b = function () {
  for (var _len42 = arguments.length, bar = [], _key43 = 0; _key43 < _len42; _key43++) {
    bar[_key43 - 0] = arguments[_key43];
  }
  return bar.len;
};
var b = function (_arg46) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len44 = arguments.length, bar = [], _key45 = 1; _key45 < _len44; _key45++) {
    bar[_key45 - 1] = arguments[_key45];
  }
  return bar.length * 2;
};
var b = function (_arg49, _arg50) {
  let foo = arguments.length > 0 ? arguments[0] : void 0;
  let baz = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len47 = arguments.length, bar = [], _key48 = 2; _key48 < _len47; _key48++) {
    bar[_key48 - 2] = arguments[_key48];
  }
  return bar.length;
};
function x() {
  for (var _len51 = arguments.length, rest = [], _key52 = 0; _key52 < _len51; _key52++) {
    rest[_key52 - 0] = arguments[_key52];
  }
  rest[0] = 0;
}
function swap() {
  for (var _len53 = arguments.length, rest = [], _key54 = 0; _key54 < _len53; _key54++) {
    rest[_key54 - 0] = arguments[_key54];
  }
  [rest[0], rest[1]] = [rest[1], rest[0]];
}
function forIn() {
  for (var _len55 = arguments.length, rest = [], _key56 = 0; _key56 < _len55; _key56++) {
    rest[_key56 - 0] = arguments[_key56];
  }
  for (rest[0] in this) {
    foo(rest[0]);
  }
}
function inc() {
  for (var _len57 = arguments.length, rest = [], _key58 = 0; _key58 < _len57; _key58++) {
    rest[_key58 - 0] = arguments[_key58];
  }
  ++rest[0];
}
function dec() {
  for (var _len59 = arguments.length, rest = [], _key60 = 0; _key60 < _len59; _key60++) {
    rest[_key60 - 0] = arguments[_key60];
  }
  --rest[0];
}
function del() {
  for (var _len61 = arguments.length, rest = [], _key62 = 0; _key62 < _len61; _key62++) {
    rest[_key62 - 0] = arguments[_key62];
  }
  delete rest[0];
}
function method() {
  for (var _len63 = arguments.length, rest = [], _key64 = 0; _key64 < _len63; _key64++) {
    rest[_key64 - 0] = arguments[_key64];
  }
  rest[0]();
}
function newExp() {
  for (var _len65 = arguments.length, rest = [], _key66 = 0; _key66 < _len65; _key66++) {
    rest[_key66 - 0] = arguments[_key66];
  }
  new rest[0]();
}
// In addition to swap() above because at some point someone tried checking
// grandparent path for isArrayExpression() to deopt.
function arrayDestructure() {
  for (var _len67 = arguments.length, rest = [], _key68 = 0; _key68 < _len67; _key68++) {
    rest[_key68 - 0] = arguments[_key68];
  }
  [rest[0]] = x;
}
function forOf() {
  for (var _len69 = arguments.length, rest = [], _key70 = 0; _key70 < _len69; _key70++) {
    rest[_key70 - 0] = arguments[_key70];
  }
  for (rest[0] of this);
}
function postfixIncrement() {
  for (var _len71 = arguments.length, rest = [], _key72 = 0; _key72 < _len71; _key72++) {
    rest[_key72 - 0] = arguments[_key72];
  }
  rest[0]++;
}
function postfixDecrement() {
  for (var _len73 = arguments.length, rest = [], _key74 = 0; _key74 < _len73; _key74++) {
    rest[_key74 - 0] = arguments[_key74];
  }
  rest[0]--;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest member expression optimisation (input)',
    source: `var t = function (...items) {
  var x = items[0];
  var y = items[1];
}

function t(...items) {
  var x = items[0];
  var y = items[1];
}

function t(...items) {
  var a = [];
  for (var i = 0; i < items.length; i++) {
    a.push(i);
  }
  return a;
}

// https://github.com/babel/babel/pull/2833#issuecomment-166039291
function t(...items) {
  for (let i = 0; i < items.length; i++) {
    return items[i];
  }
}
`,
    filename: 'input.js',
    output: `var t = function () {
  for (var _len = arguments.length, items = [], _key = 0; _key < _len; _key++) {
    items[_key - 0] = arguments[_key];
  }
  var x = items[0];
  var y = items[1];
};
function t() {
  for (var _len8 = arguments.length, items = [], _key9 = 0; _key9 < _len8; _key9++) {
    items[_key9 - 0] = arguments[_key9];
  }
  var x = items[0];
  var y = items[1];
}
function t() {
  for (var _len10 = arguments.length, items = [], _key11 = 0; _key11 < _len10; _key11++) {
    items[_key11 - 0] = arguments[_key11];
  }
  var a = [];
  for (var i = 0; i < items.length; i++) {
    a.push(i);
  }
  return a;
}
// https://github.com/babel/babel/pull/2833#issuecomment-166039291
function t() {
  for (var _len12 = arguments.length, items = [], _key13 = 0; _key13 < _len12; _key13++) {
    items[_key13 - 0] = arguments[_key13];
  }
  for (let i = 0; i < items.length; i++) {
    return items[i];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest multiple (input)',
    source: `var t = function (f, ...items) {
    var x = f;
    x = items[0];
    x = items[1];
};

function t(f, ...items) {
    var x = f;
    x = items[0];
    x = items[1];
}

function u(f, g, ...items) {
    var x = f;
    var y = g;
    x[12] = items[0];
    y.prop = items[1];
    var z = items[2] | 0 || 12;
}
`,
    filename: 'input.js',
    output: `var t = function (_arg) {
  let f = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, items = [], _key = 1; _key < _len; _key++) {
    items[_key - 1] = arguments[_key];
  }
  var x = f;
  x = items[0];
  x = items[1];
};
function t(_arg13) {
  let f = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len11 = arguments.length, items = [], _key12 = 1; _key12 < _len11; _key12++) {
    items[_key12 - 1] = arguments[_key12];
  }
  var x = f;
  x = items[0];
  x = items[1];
}
function u(_arg16, _arg17) {
  let f = arguments.length > 0 ? arguments[0] : void 0;
  let g = arguments.length > 1 ? arguments[1] : void 0;
  for (var _len14 = arguments.length, items = [], _key15 = 2; _key15 < _len14; _key15++) {
    items[_key15 - 2] = arguments[_key15];
  }
  var x = f;
  var y = g;
  x[12] = items[0];
  y.prop = items[1];
  var z = items[2] | 0 || 12;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest nested 5656 (input)',
    source: `function a(...args) {
  const foo = (...list) => bar(...list);
  foo(...args);
}

function b(...args) {
  const foo = (...args) => bar(...args);
  foo(...args);
}

function c(...args) {
  const foo = (...args) => bar(...args);
  foo([]);
}

function d(thing, ...args) {
  const foo = (...args) => bar(...args);
  {
    let args = thing;
    foo(thing);
  }
}
`,
    filename: 'input.js',
    output: `function a() {
  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
    args[_key - 0] = arguments[_key];
  }
  const foo = function () {
    for (var _len11 = arguments.length, list = [], _key12 = 0; _key12 < _len11; _key12++) {
      list[_key12 - 0] = arguments[_key12];
    }
    return bar(...list);
  };
  foo(...args);
}
function b() {
  for (var _len13 = arguments.length, args = [], _key14 = 0; _key14 < _len13; _key14++) {
    args[_key14 - 0] = arguments[_key14];
  }
  return (args => {
    const foo = function () {
      for (var _len15 = arguments.length, args = [], _key16 = 0; _key16 < _len15; _key16++) {
        args[_key16 - 0] = arguments[_key16];
      }
      return bar(...args);
    };
    foo(...args);
  })(args);
}
function c() {
  for (var _len17 = arguments.length, args = [], _key18 = 0; _key18 < _len17; _key18++) {
    args[_key18 - 0] = arguments[_key18];
  }
  return (args => {
    const foo = function () {
      for (var _len19 = arguments.length, args = [], _key20 = 0; _key20 < _len19; _key20++) {
        args[_key20 - 0] = arguments[_key20];
      }
      return bar(...args);
    };
    foo([]);
  })(args);
}
function d(_arg) {
  let thing = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len21 = arguments.length, args = [], _key22 = 1; _key22 < _len21; _key22++) {
    args[_key22 - 1] = arguments[_key22];
  }
  return (args => {
    const foo = function () {
      for (var _len24 = arguments.length, args = [], _key25 = 0; _key25 < _len24; _key25++) {
        args[_key25 - 0] = arguments[_key25];
      }
      return bar(...args);
    };
    {
      let args = thing;
      foo(thing);
    }
  })(args);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest nested iife (input)',
    source: `function broken(x, ...foo) {
  if (true) {
    class Foo extends Bar { }
    return hello(...foo)
  }
}
`,
    filename: 'input.js',
    output: `function broken(_arg) {
  let x = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len = arguments.length, foo = [], _key = 1; _key < _len; _key++) {
    foo[_key - 1] = arguments[_key];
  }
  if (true) {
    class Foo extends Bar {}
    return hello(...foo);
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest patterns (exec)',
    source: `function foo(...{ length }) {
  return length;
}

expect(foo(1, 2, 3)).toEqual(3);
`,
    filename: 'exec.js',
    output: `function foo() {
  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {
    _args[_key - 0] = arguments[_key];
  }
  let { length } = _args;
  return length;
}
expect(foo(1, 2, 3)).toEqual(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest patterns (input)',
    source: `function foo(...[a]) {}
`,
    filename: 'input.js',
    output: `function foo() {
  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {
    _args[_key - 0] = arguments[_key];
  }
  let [a] = _args;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest spread optimisation (input)',
    source: `// optimisation

function foo(...bar) {
  foo(...bar);
}

// deoptimisation

function foo(a, ...b) {
  foo(...b);
}

function foo(...b) {
  foo(1, ...b);
}

function foo(...args){
  args.pop()
  foo(...args);
}
`,
    filename: 'input.js',
    output: `// optimisation
function foo() {
  for (var _len = arguments.length, bar = [], _key = 0; _key < _len; _key++) {
    bar[_key - 0] = arguments[_key];
  }
  foo(...bar);
}
// deoptimisation
function foo(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len7 = arguments.length, b = [], _key8 = 1; _key8 < _len7; _key8++) {
    b[_key8 - 1] = arguments[_key8];
  }
  foo(...b);
}
function foo() {
  for (var _len10 = arguments.length, b = [], _key11 = 0; _key11 < _len10; _key11++) {
    b[_key11 - 0] = arguments[_key11];
  }
  foo(1, ...b);
}
function foo() {
  for (var _len12 = arguments.length, args = [], _key13 = 0; _key13 < _len12; _key13++) {
    args[_key13 - 0] = arguments[_key13];
  }
  args.pop();
  foo(...args);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — rest ts this parameter (input)',
    source: `function u(this: Foo, ...items) {
  items[0];
}

function v(this: Foo, event: string, ...args: any[]) {
  args;
}
`,
    filename: 'input.ts',
    output: `function u() {
  for (var _len = arguments.length, items = [], _key = 0; _key < _len; _key++) {
    items[_key - 0] = arguments[_key];
  }
  items[0];
}
function v(_arg) {
  let event = arguments.length > 0 ? arguments[0] : void 0;
  for (var _len7 = arguments.length, args = [], _key8 = 1; _key8 < _len7; _key8++) {
    args[_key8 - 1] = arguments[_key8];
  }
  args;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'parameters — var for body same as param (exec)',
    source: `function foo(a = 2) {
  for (var i of [0]) var a = 1;
  expect(a).toBe(1);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (var i of [0]) var a = 1;
    expect(a).toBe(1);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var for init same as param (exec)',
    source: `function foo(a = 2) {
  for (var [a] of [[1]]);
  expect(a).toBe(1);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (var [a] of [[1]]);
    expect(a).toBe(1);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var no init for body same as param (exec)',
    source: `function foo(a = 2) {
  for (var i of [0]) var a;
  expect(a).toBe(2);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (var i of [0]) var a;
    expect(a).toBe(2);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var no init for init same as param (exec)',
    source: `function foo(a = 2) {
  for (var a, i = 0; i < 1; i++);
  expect(a).toBe(2);
}
foo();
`,
    filename: 'exec.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    for (var a, i = 0; i < 1; i++);
    expect(a).toBe(2);
  })(a);
}
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var no init same as param (input)',
    source: `function f(a = 2, b = 3) {
  var a, b = 4;
  var a;
  var b;
  return a + b;
}
`,
    filename: 'input.js',
    output: `function f() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
  return ((a, b) => {
    var a,
      b = 4;
    var a;
    var b;
    return a + b;
  })(a, b);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var no init then var with init same as param (input)',
    source: `function f(a = 2, b = 3) {
  var a;
  var { a } = { a: 4 };
  return a + b;
}
`,
    filename: 'input.js',
    output: `function f() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
  return (a => {
    var a;
    var { a } = { a: 4 };
    return a + b;
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same as array pattern param (input)',
    source: `function foo({a, b}) {
  var a = 3;
  var c = 2;
  var d = a + b + c;
}
`,
    filename: 'input.js',
    output: `function foo() {
  let { a, b } = arguments.length > 0 ? arguments[0] : void 0;
  return (a => {
    var a = 3;
    var c = 2;
    var d = a + b + c;
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same as object pattern param (input)',
    source: `function foo([a, b]) {
  var a = 3;
  var c = 2;
  var d = a + b + c;
}
`,
    filename: 'input.js',
    output: `function foo() {
  let [a, b] = arguments.length > 0 ? arguments[0] : void 0;
  return (a => {
    var a = 3;
    var c = 2;
    var d = a + b + c;
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same as param closure (exec)',
    source: `var x = 1
function foo(x, y = function () { x = 2 }) {
  var x = 3
  y()
  expect(x).toBe(3);
}
foo()
expect(x).toBe(1);
`,
    filename: 'exec.js',
    output: `var x = 1;
function foo(_arg) {
  let x = arguments.length > 0 ? arguments[0] : void 0;
  let y =
    arguments.length > 1 && arguments[1] !== void 0
      ? arguments[1]
      : function () {
          x = 2;
        };
  return (x => {
    var x = 3;
    y();
    expect(x).toBe(3);
  })(x);
}
foo();
expect(x).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same as param (input)',
    source: `function foo(a = 2) {
  var a = 1;
}
`,
    filename: 'input.js',
    output: `function foo() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  return (a => {
    var a = 1;
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same name as nested in rest param 2 (input)',
    source: `function f(...{ length: x = 0, y = x }) {
  var x;
  return x;
}

function g(...{ length: x = 0, y = x }) {
  var x = 1;
  return x;
}
`,
    filename: 'input.js',
    output: `function f() {
  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {
    _args[_key - 0] = arguments[_key];
  }
  let { length: x = 0, y = x } = _args;
  return (x => {
    var x;
    return x;
  })(x);
}
function g() {
  for (var _len8 = arguments.length, _args7 = [], _key9 = 0; _key9 < _len8; _key9++) {
    _args7[_key9 - 0] = arguments[_key9];
  }
  let { length: x = 0, y = x } = _args7;
  return (x => {
    var x = 1;
    return x;
  })(x);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same name as nested in rest param (input)',
    source: `function f(...[x, y = x]) {
  var x;
  return x;
}

function g(...[x, y = x]) {
  var x = 1;
  return x;
}
`,
    filename: 'input.js',
    output: `function f() {
  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {
    _args[_key - 0] = arguments[_key];
  }
  let [x, y = x] = _args;
  return (x => {
    var x;
    return x;
  })(x);
}
function g() {
  for (var _len8 = arguments.length, _args7 = [], _key9 = 0; _key9 < _len8; _key9++) {
    _args7[_key9 - 0] = arguments[_key9];
  }
  let [x, y = x] = _args7;
  return (x => {
    var x = 1;
    return x;
  })(x);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var same name as rest param (input)',
    source: `function f(...x) {
  var x;
  return x;
}

function g(...x) {
  var x = 1;
  return x;
}
`,
    filename: 'input.js',
    output: `function f() {
  for (var _len = arguments.length, x = [], _key = 0; _key < _len; _key++) {
    x[_key - 0] = arguments[_key];
  }
  return (x => {
    var x;
    return x;
  })(x);
}
function g() {
  for (var _len5 = arguments.length, x = [], _key6 = 0; _key6 < _len5; _key6++) {
    x[_key6 - 0] = arguments[_key6];
  }
  return (x => {
    var x = 1;
    return x;
  })(x);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'parameters — var with init then var no init same as param (input)',
    source: `function f(a = 2, b = 3) {
  var { a } = { a: 4 };
  var a;
  var b;
  return a + b;
}
`,
    filename: 'input.js',
    output: `function f() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
  return ((a, b) => {
    var { a } = { a: 4 };
    var a;
    var b;
    return a + b;
  })(a, b);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11231 (input)',
    source: `(i = "__proto__") => {
  for (var i in {});
};
`,
    filename: 'input.mjs',
    output: `(function () {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '__proto__';
  return (i => {
    for (var i in {});
  })(i);
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11256 (input)',
    source: `class A {
  a = b => {
    {
      ({ b } = {});
    }
  };
}
`,
    filename: 'input.js',
    output: `class A {
  a = b => {
    {
      ({ b } = {});
    }
  };
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11303 (exec)',
    source: `function test(a, b = 1) {
  var a = a + b;
  return a;
}

expect(test(2)).toBe(3);
`,
    filename: 'exec.js',
    output: `function test(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  return (a => {
    var a = a + b;
    return a;
  })(a);
}
expect(test(2)).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11303 (input)',
    source: `function test(a, b = 1) {
  var a = a + b;
  return a;
}
`,
    filename: 'input.js',
    output: `function test(_arg) {
  let a = arguments.length > 0 ? arguments[0] : void 0;
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  return (a => {
    var a = a + b;
    return a;
  })(a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11344 flow (input)',
    source: `// @flow
function a(b: (c) => void = {}) {
  let c;
}

function d(e = <T>() => {}) {
  let T;
}
`,
    filename: 'input.js',
    output: `// @flow
function a() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  let c;
}
function d() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => {};
  let T;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 11344 typescript (input)',
    source: `function a(b: (c) => void = {}) {
  let c;
}

function d(e = <T>() => {}) {
  let T;
}
`,
    filename: 'input.js',
    output: `function a() {
  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  let c;
}
function d() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => {};
  let T;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
      },
    ],
  },
  {
    title: 'regression — 13939 complex (input)',
    source: `class A extends B {
  handle = ((x = 0) => {
    console.log(x, this, new.target, super.y);
  })(() => {
    let y = 0;
    return (x = y) => x + this;
  })((x = 1) => {})(this);
}
`,
    filename: 'input.js',
    output: `class A extends B {
  handle = (() => {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    console.log(x, this, new.target, super.y);
  })(() => {
    let y = 0;
    var _this = this;
    return function () {
      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : y;
      return x + _this;
    };
  })(function () {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  })(this);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 13939 private complex (input)',
    source: `class A extends B {
  #handle = ((x = 0) => {
    console.log(x, this, new.target, super.y);
  })(() => {
    let y = 0;
    return (x = y) => x + this;
  })((x = 1) => {})(this);
}
`,
    filename: 'input.js',
    output: `class A extends B {
  #handle = (() => {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    console.log(x, this, new.target, super.y);
  })(() => {
    let y = 0;
    var _this = this;
    return function () {
      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : y;
      return x + _this;
    };
  })(function () {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  })(this);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 13939 private (input)',
    source: `class A {
  #handle = (x = 0) => {
    console.log(x);
  };
}
`,
    filename: 'input.js',
    output: `class A {
  #handle = function () {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    console.log(x);
  };
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 13939 (input)',
    source: `class A {
  handle = (x = 0) => {
    console.log(x);
  };
}
`,
    filename: 'input.js',
    output: `class A {
  handle = function () {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    console.log(x);
  };
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 15145 (exec)',
    source: `(function () {
async function * foo (p = 1) {
  yield "hello";
  yield p;
}

return (async () => {
  const res = [];
  for await (const x of foo()) res.push(x);
  expect(res).toEqual(["hello", 1]);
})();

});
`,
    filename: 'exec.js',
    output: `(function () {
  function foo() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
    return async function* () {
      yield 'hello';
      yield p;
    }.call(this);
  }
  return (async () => {
    const res = [];
    for await (const x of foo()) res.push(x);
    expect(res).toEqual(['hello', 1]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4209 (input)',
    source: `import { copy } from './copyPaste';

class Thing {
  handleCopySomething() {
    copy();
  }

  completelyUnrelated(copy = 123) {
  }
}
`,
    filename: 'input.mjs',
    output: `import { copy } from './copyPaste';
class Thing {
  handleCopySomething() {
    copy();
  }
  completelyUnrelated() {
    let copy = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 123;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 6057 expanded (input)',
    source: `import args from 'utils/url/args';

export default class App extends Component {
  exportType = ''

  componentDidMount() {
    this.exportType = args.get('type', window.location.href);
  }
}
`,
    filename: 'input.mjs',
    output: `import args from 'utils/url/args';

export default class App extends Component {
  exportType = '';

  componentDidMount() {
    this.exportType = args.get('type', window.location.href);
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — 6057 simple (input)',
    source: `const a = 'bar';
function foo(...a) {
  return a;
}

`,
    filename: 'input.js',
    output: `const a = 'bar';
function foo() {
  for (var _len = arguments.length, a = [], _key = 0; _key < _len; _key++) {
    a[_key - 0] = arguments[_key];
  }
  return a;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — regression 2364 (input)',
    source: `function wrapper(fn) {
  return (...args) => {
    while (someCondition) {
      const val = fn(...args);
      return val.test(() => {
        console.log(val);
      });
    }
  };
}
`,
    filename: 'input.js',
    output: `function wrapper(fn) {
  return function () {
    for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {
      args[_key - 0] = arguments[_key];
    }
    while (someCondition) {
      const val = fn(...args);
      return val.test(() => {
        console.log(val);
      });
    }
  };
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — scope async param error async (exec)',
    source: `(function () {
const err = new Error();

async function f(a = (() => { throw err })()) {
  throw 1;
  var a = await a;
  return a;
}

return (async () => {
  let p;
  expect(() => { p = f() }).not.toThrow();
  await expect(p).rejects.toThrow(err);
})();

});
`,
    filename: 'exec.js',
    output: `(function () {
  const err = new Error();
  async function f() {
    let a =
      arguments.length > 0 && arguments[0] !== void 0
        ? arguments[0]
        : (() => {
            throw err;
          })();
    return (async a => {
      throw 1;
      var a = await a;
      return a;
    })(a);
  }
  return (async () => {
    let p;
    expect(() => {
      p = f();
    }).not.toThrow();
    await expect(p).rejects.toThrow(err);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — scope gen async (input)',
    source: `function* f(a = 1) {
  var a = yield a;
  return a;
}

async function g(a = 1) {
  var a = await a;
  return a;
}

async function* h(a = 1) {
  var a = await (yield a);
  return a;
}
`,
    filename: 'input.js',
    output: `function f() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  return function* (a) {
    var a = yield a;
    return a;
  }.call(this, a);
}
async function g() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  return (async a => {
    var a = await a;
    return a;
  })(a);
}
function h() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
  return async function* (a) {
    var a = await (yield a);
    return a;
  }.call(this, a);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
