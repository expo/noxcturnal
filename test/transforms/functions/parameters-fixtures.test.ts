import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'function test() {\n  let { a: b } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};\n}',
  'function t() {\n  let [, , a] = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [1, 2, 3];\n  return a;\n}\nexpect(t()).toBe(3);\nexpect(t([4, 5, 6])).toBe(6);',
  'function t() {\n  let [, , a] = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [1, 2, 3];\n  return a;\n}',
  '// @flow\nexport function transformFileSync(_arg) {\n  let filename = arguments.length > 0 ? arguments[0] : void 0;\n  let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};\n}',
  'function f(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : a;\n  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : b;\n  return c;\n}\nexpect(f(3)).toBe(3);',
  'const bar = true;\nfunction foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : bar;\n  for (var _len = arguments.length, b = [], _key = 1; _key < _len; _key++) {\n    b[_key - 1] = arguments[_key];\n  }\n  return function () {\n    const bar = false;\n    expect(b[0]).toBe(2);\n    expect(b[1]).toBe(3);\n  }.call(this);\n}\nfoo(1, 2, 3);',
  'class Ref {\n  static nextId = 0;\n  constructor() {\n    let id = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ++Ref.nextId;\n    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : id;\n    this.id = n;\n  }\n}\nexpect(new Ref().id).toBe(1);\nexpect(new Ref().id).toBe(2);',
  'class Ref {\n  constructor() {\n    let ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ref;\n    this.ref = ref;\n  }\n}\nexpect(new Ref().ref).toBe(Ref);',
  "var t = function () {\n  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';\n  let f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5;\n  return e + ' bar ' + f;\n};\nvar a = function (_arg) {\n  let e = arguments.length > 0 ? arguments[0] : void 0;\n  let f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5;\n  return e + ' bar ' + f;\n};",
  "function required(msg) {\n  throw new Error(msg);\n}\nfunction sum() {\n  let { arr = required('arr is required') } =\n    arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : { arr: (arr = []) };\n  let length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : arr.length;\n  let i = 0;\n  let acc = 0;\n  for (let item of arr) {\n    if (i >= length) return acc;\n    acc += item;\n    i++;\n  }\n  return acc;\n}\nexpect(sum({ arr: [1, 2] })).toBe(3);",
  'function fn(_arg) {\n  let a1 = arguments.length > 0 ? arguments[0] : void 0;\n  let a2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 4;\n  let { a3, a4 } = arguments.length > 2 ? arguments[2] : void 0;\n  let a5 = arguments.length > 3 ? arguments[3] : void 0;\n  let { a6, a7 } = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};\n}',
  'const a = 1;\nfunction rest() {\n  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;\n  for (var _len = arguments.length, a = [], _key = 1; _key < _len; _key++) {\n    a[_key - 1] = arguments[_key];\n  }\n  expect(b).toBe(1);\n}\nrest(undefined, 2);\nfunction rest2() {\n  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;\n  for (var _len7 = arguments.length, a = [], _key8 = 1; _key8 < _len7; _key8++) {\n    a[_key8 - 1] = arguments[_key8];\n  }\n  expect(a[0]).toBe(2);\n}\nrest2(undefined, 2);\nfunction rest3() {\n  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;\n  for (var _len9 = arguments.length, a = [], _key10 = 1; _key10 < _len9; _key10++) {\n    a[_key10 - 1] = arguments[_key10];\n  }\n  expect(a).toHaveLength(1);\n}\nrest3(undefined, 2);',
  "var t = function () {\n  let f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';\n  return f + ' bar';\n};",
  "// #3861\nfunction t() {\n  let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'default';\n  let { a, b } = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len = arguments.length, args = [], _key = 2; _key < _len; _key++) {\n    args[_key - 2] = arguments[_key];\n  }\n  console.log(x, a, b, args);\n}",
  'function t() {\n  let undefined = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 17;\n  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;\n  return a;\n}\nexpect(t()).toBe(3);',
  'let f = function () {\n  let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;\n  return x + 1;\n};',
  'function fn(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : c();\n  return b;\n}',
  'class Bar extends Foo {\n  constructor() {\n    let f = () => {\n      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : super();\n      return x;\n    };\n    f();\n  }\n}',
  'class Bar extends Foo {\n  constructor() {\n    let f = () => {\n      for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n        args[_key - 0] = arguments[_key];\n      }\n      return super(...args);\n    };\n    f();\n  }\n}',
  'async function* f() {\n  let [] = arguments.length > 0 ? arguments[0] : void 0;\n}\nexpect(() => {\n  f();\n}).toThrow(TypeError);',
  'function func() {\n  for (var _len = arguments.length, arguments = [], _key = 0; _key < _len; _key++) {\n    arguments[_key - 0] = arguments[_key];\n  }\n  return arguments;\n}\nexpect(func(1, 2, 3)).toStrictEqual([1, 2, 3]);',
  'function func() {\n  for (var _len = arguments.length, arguments = [], _key = 0; _key < _len; _key++) {\n    arguments[_key - 0] = arguments[_key];\n  }\n  console.log(arguments);\n}\nfunc(1, 2, 3);',
  "function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'foo';\n  let b = arguments.length > 1 ? arguments[1] : void 0;\n}",
  'function f(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : a;\n  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : b;\n  return c;\n}\nexpect(3).toBe(f(3));',
  "let x = 'outside';\nfunction outer() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => eval('x');\n  return function () {\n    let x = 'inside';\n    return a();\n  }.call(this);\n}\nouter();",
  'class Ref {\n  constructor() {\n    let id = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ++Ref.nextID;\n    this.id = id;\n  }\n}\nRef.nextID = 0;',
  "let x = 'outside';\nfunction outer() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => x;\n  return function () {\n    let x = 'inside';\n    return a();\n  }.call(this);\n}\nouter();",
  'class Ref {\n  constructor() {\n    let ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ref;\n    this.ref = ref;\n  }\n}\nclass X {\n  constructor() {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : foo;\n    this.x = x;\n  }\n}',
  'const defaultValue = 1;\nconst obj = {\n  set field(_arg) {\n    let num = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : defaultValue;\n    this.num = num;\n  },\n};\nobj.field = void 0;\nexpect(obj.num).toBe(defaultValue);',
  'const obj = {\n  set field(_arg) {\n    let num = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n    this.num = num;\n  },\n};',
  '// @flow\nfunction foo(_arg, _arg7) {\n  let x = arguments.length > 0 ? arguments[0] : void 0;\n  let y = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len = arguments.length, z = [], _key = 2; _key < _len; _key++) {\n    z[_key - 2] = arguments[_key];\n  }\n  x + y + z[0];\n}',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    function a() {}\n  }.call(this, a);\n}',
  'function* fn(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let [] = arguments.length > 1 ? arguments[1] : void 0;\n  let b = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;\n  yield a;\n  yield arguments;\n  yield this;\n  return b;\n}',
  "export class Test {\n  invite() {\n    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};\n    const privacy = options.privacy || 'Private';\n    console.log(this);\n  }\n}",
  'var a;\nclass Test {\n  invite() {\n    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : a;\n    return function () {\n      let a;\n      this;\n    }.call(this);\n  }\n}',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (let a = 1; a > 0; a--);\n    expect(a).toBe(2);\n  }.call(this, a);\n}\nfoo();',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (let a, i = 0; i < 1; i++) a = 1;\n    expect(a).toBe(2);\n  }.call(this, a);\n}\nfoo();',
  'function value() {\n  let { x, y } = arguments.length > 0 ? arguments[0] : void 0;\n  return x * y;\n}\nfunction valueWithDefault() {\n  let { x, y } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};\n  return x * y;\n}',
  "const args = 'bar';\nfunction foo() {\n  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n    args[_key - 0] = arguments[_key];\n  }\n  return args;\n}",
  'function first() {\n  for (var _len = arguments.length, values = [], _key = 0; _key < _len; _key++) {\n    values[_key - 0] = arguments[_key];\n  }\n  var index = 0;\n  return values[index++];\n}',
  '// @flow\nlet oneOf = function () {\n  for (var _len = arguments.length, nodes = [], _key = 0; _key < _len; _key++) {\n    nodes[_key - 0] = arguments[_key];\n  }\n  if (nodes.length === 1) {\n    return nodes[0];\n  }\n  return new OneOfNode(nodes);\n};',
  'function f1(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, rest = [], _key = 1; _key < _len; _key++) {\n    rest[_key - 1] = arguments[_key];\n  }\n  let b = rest[rest.length - 3];\n  let c = rest[rest.length - 2];\n  let d = rest[rest.length - 1];\n  return [a, b, c, d];\n}\nexpect(f1(1, 2)).toEqual([1, undefined, undefined, 2]);\nfunction f2(_arg12) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len10 = arguments.length, rest = [], _key11 = 1; _key11 < _len10; _key11++) {\n    rest[_key11 - 1] = arguments[_key11];\n  }\n  return rest[-1];\n}\nexpect(f2(1, 2)).toBeUndefined();',
  'function f(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, rest = [], _key = 1; _key < _len; _key++) {\n    rest[_key - 1] = arguments[_key];\n  }\n  let b = rest[rest.length - 3];\n  let c = rest[rest.length - 2];\n  let d = rest[rest.length - 1];\n  return [a, b, c, d];\n}\nfunction f(_arg11) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len9 = arguments.length, rest = [], _key10 = 1; _key10 < _len9; _key10++) {\n    rest[_key10 - 1] = arguments[_key10];\n  }\n  return rest[-1];\n}',
  "function func(_arg, _arg7) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len = arguments.length, arguments = [], _key = 2; _key < _len; _key++) {\n    arguments[_key - 2] = arguments[_key];\n  }\n  return [a, b, arguments];\n}\nexpect(func('a', 'b', 1, 2, 3)).toStrictEqual(['a', 'b', [1, 2, 3]]);",
  "function func(_arg, _arg7) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len = arguments.length, arguments = [], _key = 2; _key < _len; _key++) {\n    arguments[_key - 2] = arguments[_key];\n  }\n  return [a, b, arguments];\n}\nfunc('a', 'b', 1, 2, 3);",
  'function x() {\n  for (var _len = arguments.length, rest = [], _key = 0; _key < _len; _key++) {\n    rest[_key - 0] = arguments[_key];\n  }\n  arguments;\n}',
  '// @flow\nvar concat = function () {\n  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n    args[_key - 0] = arguments[_key];\n  }\n  var x = args[0];\n  var y = args[1];\n};\nvar somefun = function () {\n  let get2ndArg = function (a, b) {\n    for (var _len28 = arguments.length, args1 = [], _key29 = 2; _key29 < _len28; _key29++) {\n      args1[_key29 - 2] = arguments[_key29];\n    }\n    var _b = args1[0];\n    let somef = function (x, y, z) {\n      for (var _len30 = arguments.length, args2 = [], _key31 = 3; _key31 < _len30; _key31++) {\n        args2[_key31 - 3] = arguments[_key31];\n      }\n      var _a = args2[0];\n    };\n    let somefg = function (c, d, e, f) {\n      for (var _len32 = arguments.length, args3 = [], _key33 = 4; _key33 < _len32; _key33++) {\n        args3[_key33 - 4] = arguments[_key33];\n      }\n      var _a = args3[0];\n    };\n    var _d = args1[1];\n  };\n  let get3rdArg = function () {\n    for (var _len34 = arguments.length, args = [], _key35 = 0; _key35 < _len34; _key35++) {\n      args[_key35 - 0] = arguments[_key35];\n    }\n    return args[2];\n  };\n};\nfunction demo1() {\n  for (var _len36 = arguments.length, args = [], _key37 = 0; _key37 < _len36; _key37++) {\n    args[_key37 - 0] = arguments[_key37];\n  }\n  return i => {\n    return args[i + 0];\n  };\n}\nvar x = function () {\n  for (var _len38 = arguments.length, rest = [], _key39 = 0; _key39 < _len38; _key39++) {\n    rest[_key39 - 0] = arguments[_key39];\n  }\n  if (noNeedToWork) return 0;\n  return rest;\n};\nvar innerclassproperties = function () {\n  for (var _len40 = arguments.length, args = [], _key41 = 0; _key41 < _len40; _key41++) {\n    args[_key41 - 0] = arguments[_key41];\n  }\n  return class {\n    static args = args;\n    args = args;\n  };\n};',
  'var concat = async function () {\n  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n    args[_key - 0] = arguments[_key];\n  }\n  var x = args[0];\n  var y = args[1];\n};\nvar x = async function () {\n  for (var _len7 = arguments.length, rest = [], _key8 = 0; _key8 < _len7; _key8++) {\n    rest[_key8 - 0] = arguments[_key8];\n  }\n  if (noNeedToWork) return 0;\n  return rest;\n};',
  'const deepAssign = function () {\n  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n    args[_key - 0] = arguments[_key];\n  }\n  return (args = []);\n};',
  '// single reference\nfunction r() {\n  for (var _len = arguments.length, rest = [], _key = 0; _key < _len; _key++) {\n    rest[_key - 0] = arguments[_key];\n  }\n  if (noNeedToWork) return 0;\n  return rest;\n}\n// multiple references\nfunction r() {\n  for (var _len10 = arguments.length, rest = [], _key11 = 0; _key11 < _len10; _key11++) {\n    rest[_key11 - 0] = arguments[_key11];\n  }\n  if (noNeedToWork) return 0;\n  rest;\n  rest;\n}\n// multiple nested references\nfunction r() {\n  for (var _len12 = arguments.length, rest = [], _key13 = 0; _key13 < _len12; _key13++) {\n    rest[_key13 - 0] = arguments[_key13];\n  }\n  if (noNeedToWork) return 0;\n  if (true) {\n    return rest;\n  } else {\n    return rest;\n  }\n}\n// deeply nested\nfunction r() {\n  for (var _len14 = arguments.length, rest = [], _key15 = 0; _key15 < _len14; _key15++) {\n    rest[_key15 - 0] = arguments[_key15];\n  }\n  if (true) {\n    if (true) {\n      return rest;\n    } else {\n      return rest;\n    }\n  }\n}\n// nested reference with root reference\nfunction r() {\n  for (var _len16 = arguments.length, rest = [], _key17 = 0; _key17 < _len16; _key17++) {\n    rest[_key17 - 0] = arguments[_key17];\n  }\n  if (noNeedToWork) return 0;\n  if (lol) rest;\n  rest;\n}\n// nested functions\nfunction a() {\n  for (var _len18 = arguments.length, args = [], _key19 = 0; _key19 < _len18; _key19++) {\n    args[_key19 - 0] = arguments[_key19];\n  }\n  return function () {\n    function b() {}\n    console.log("Shouldn\'t args be from a\'s scope?", args);\n  };\n}\n// loop\nfunction runQueue(_arg) {\n  let queue = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len20 = arguments.length, args = [], _key21 = 1; _key21 < _len20; _key21++) {\n    args[_key21 - 1] = arguments[_key21];\n  }\n  for (let i = 0; i < queue.length; i++) {\n    queue[i](...args);\n  }\n}\n// nested loop\nfunction runQueue(_arg25) {\n  let queue = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len23 = arguments.length, args = [], _key24 = 1; _key24 < _len23; _key24++) {\n    args[_key24 - 1] = arguments[_key24];\n  }\n  if (foo) {\n    for (let i = 0; i < queue.length; i++) {\n      queue[i](...args);\n    }\n  }\n}\nfunction r() {\n  for (var _len26 = arguments.length, rest = [], _key27 = 0; _key27 < _len26; _key27++) {\n    rest[_key27 - 0] = arguments[_key27];\n  }\n  if (noNeedToWork) return 0;\n  [rest[0]] = x;\n  return rest;\n}',
  'var length = function (_arg, _arg7) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len = arguments.length, items = [], _key = 2; _key < _len; _key++) {\n    items[_key - 2] = arguments[_key];\n  }\n  return items.length;\n};\nexpect(length()).toBe(0);\nexpect(length(1)).toBe(0);\nexpect(length(1, 2)).toBe(0);\nexpect(length(1, 2, 3)).toBe(1);',
  'var t = function (_arg) {\n  let f = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, items = [], _key = 1; _key < _len; _key++) {\n    items[_key - 1] = arguments[_key];\n  }\n  items[0];\n  items[items.length - 1];\n};\nfunction t(_arg8) {\n  let f = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len6 = arguments.length, items = [], _key7 = 1; _key7 < _len6; _key7++) {\n    items[_key7 - 1] = arguments[_key7];\n  }\n  items;\n  items[0];\n  items[items.length - 1];\n}',
  "var x = function (_arg) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, bar = [], _key = 1; _key < _len; _key++) {\n    bar[_key - 1] = arguments[_key];\n  }\n  console.log(bar);\n};\nvar y = function (_arg27) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len25 = arguments.length, bar = [], _key26 = 1; _key26 < _len25; _key26++) {\n    bar[_key26 - 1] = arguments[_key26];\n  }\n  return function (bar) {\n    var x = function z(bar) {\n      bar[1] = 5;\n    };\n  }.call(this, bar);\n};\nvar b = function (_arg30, _arg31) {\n  let x = arguments.length > 0 ? arguments[0] : void 0;\n  let y = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len28 = arguments.length, args = [], _key29 = 2; _key29 < _len28; _key29++) {\n    args[_key29 - 2] = arguments[_key29];\n  }\n  console.log(args[0]);\n  args.pop();\n  console.log(args[1]);\n};\nvar z = function (_arg34) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len32 = arguments.length, bar = [], _key33 = 1; _key33 < _len32; _key33++) {\n    bar[_key33 - 1] = arguments[_key33];\n  }\n  var x = function () {\n    bar[1] = 5;\n  };\n};\nvar a = function (_arg37) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len35 = arguments.length, bar = [], _key36 = 1; _key36 < _len35; _key36++) {\n    bar[_key36 - 1] = arguments[_key36];\n  }\n  return bar.join(',');\n};\nvar b = function (_arg40) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len38 = arguments.length, bar = [], _key39 = 1; _key39 < _len38; _key39++) {\n    bar[_key39 - 1] = arguments[_key39];\n  }\n  var join = 'join';\n  return bar[join];\n};\nvar b = function () {\n  for (var _len41 = arguments.length, bar = [], _key42 = 0; _key42 < _len41; _key42++) {\n    bar[_key42 - 0] = arguments[_key42];\n  }\n  return bar.len;\n};\nvar b = function (_arg45) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len43 = arguments.length, bar = [], _key44 = 1; _key44 < _len43; _key44++) {\n    bar[_key44 - 1] = arguments[_key44];\n  }\n  return bar.length * 2;\n};\nvar b = function (_arg48, _arg49) {\n  let foo = arguments.length > 0 ? arguments[0] : void 0;\n  let baz = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len46 = arguments.length, bar = [], _key47 = 2; _key47 < _len46; _key47++) {\n    bar[_key47 - 2] = arguments[_key47];\n  }\n  return bar.length;\n};\nfunction x() {\n  for (var _len50 = arguments.length, rest = [], _key51 = 0; _key51 < _len50; _key51++) {\n    rest[_key51 - 0] = arguments[_key51];\n  }\n  rest[0] = 0;\n}\nfunction swap() {\n  for (var _len52 = arguments.length, rest = [], _key53 = 0; _key53 < _len52; _key53++) {\n    rest[_key53 - 0] = arguments[_key53];\n  }\n  [rest[0], rest[1]] = [rest[1], rest[0]];\n}\nfunction forIn() {\n  for (var _len54 = arguments.length, rest = [], _key55 = 0; _key55 < _len54; _key55++) {\n    rest[_key55 - 0] = arguments[_key55];\n  }\n  for (rest[0] in this) {\n    foo(rest[0]);\n  }\n}\nfunction inc() {\n  for (var _len56 = arguments.length, rest = [], _key57 = 0; _key57 < _len56; _key57++) {\n    rest[_key57 - 0] = arguments[_key57];\n  }\n  ++rest[0];\n}\nfunction dec() {\n  for (var _len58 = arguments.length, rest = [], _key59 = 0; _key59 < _len58; _key59++) {\n    rest[_key59 - 0] = arguments[_key59];\n  }\n  --rest[0];\n}\nfunction del() {\n  for (var _len60 = arguments.length, rest = [], _key61 = 0; _key61 < _len60; _key61++) {\n    rest[_key61 - 0] = arguments[_key61];\n  }\n  delete rest[0];\n}\nfunction method() {\n  for (var _len62 = arguments.length, rest = [], _key63 = 0; _key63 < _len62; _key63++) {\n    rest[_key63 - 0] = arguments[_key63];\n  }\n  rest[0]();\n}\nfunction newExp() {\n  for (var _len64 = arguments.length, rest = [], _key65 = 0; _key65 < _len64; _key65++) {\n    rest[_key65 - 0] = arguments[_key65];\n  }\n  new rest[0]();\n}\n// In addition to swap() above because at some point someone tried checking\n// grandparent path for isArrayExpression() to deopt.\nfunction arrayDestructure() {\n  for (var _len66 = arguments.length, rest = [], _key67 = 0; _key67 < _len66; _key67++) {\n    rest[_key67 - 0] = arguments[_key67];\n  }\n  [rest[0]] = x;\n}\nfunction forOf() {\n  for (var _len68 = arguments.length, rest = [], _key69 = 0; _key69 < _len68; _key69++) {\n    rest[_key69 - 0] = arguments[_key69];\n  }\n  for (rest[0] of this);\n}\nfunction postfixIncrement() {\n  for (var _len70 = arguments.length, rest = [], _key71 = 0; _key71 < _len70; _key71++) {\n    rest[_key71 - 0] = arguments[_key71];\n  }\n  rest[0]++;\n}\nfunction postfixDecrement() {\n  for (var _len72 = arguments.length, rest = [], _key73 = 0; _key73 < _len72; _key73++) {\n    rest[_key73 - 0] = arguments[_key73];\n  }\n  rest[0]--;\n}",
  'var t = function () {\n  for (var _len = arguments.length, items = [], _key = 0; _key < _len; _key++) {\n    items[_key - 0] = arguments[_key];\n  }\n  var x = items[0];\n  var y = items[1];\n};\nfunction t() {\n  for (var _len8 = arguments.length, items = [], _key9 = 0; _key9 < _len8; _key9++) {\n    items[_key9 - 0] = arguments[_key9];\n  }\n  var x = items[0];\n  var y = items[1];\n}\nfunction t() {\n  for (var _len10 = arguments.length, items = [], _key11 = 0; _key11 < _len10; _key11++) {\n    items[_key11 - 0] = arguments[_key11];\n  }\n  var a = [];\n  for (var i = 0; i < items.length; i++) {\n    a.push(i);\n  }\n  return a;\n}\n// https://github.com/babel/babel/pull/2833#issuecomment-166039291\nfunction t() {\n  for (var _len12 = arguments.length, items = [], _key13 = 0; _key13 < _len12; _key13++) {\n    items[_key13 - 0] = arguments[_key13];\n  }\n  for (let i = 0; i < items.length; i++) {\n    return items[i];\n  }\n}',
  'var t = function (_arg) {\n  let f = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, items = [], _key = 1; _key < _len; _key++) {\n    items[_key - 1] = arguments[_key];\n  }\n  var x = f;\n  x = items[0];\n  x = items[1];\n};\nfunction t(_arg13) {\n  let f = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len11 = arguments.length, items = [], _key12 = 1; _key12 < _len11; _key12++) {\n    items[_key12 - 1] = arguments[_key12];\n  }\n  var x = f;\n  x = items[0];\n  x = items[1];\n}\nfunction u(_arg16, _arg17) {\n  let f = arguments.length > 0 ? arguments[0] : void 0;\n  let g = arguments.length > 1 ? arguments[1] : void 0;\n  for (var _len14 = arguments.length, items = [], _key15 = 2; _key15 < _len14; _key15++) {\n    items[_key15 - 2] = arguments[_key15];\n  }\n  var x = f;\n  var y = g;\n  x[12] = items[0];\n  y.prop = items[1];\n  var z = items[2] | 0 || 12;\n}',
  'function a() {\n  for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n    args[_key - 0] = arguments[_key];\n  }\n  const foo = function () {\n    for (var _len10 = arguments.length, list = [], _key11 = 0; _key11 < _len10; _key11++) {\n      list[_key11 - 0] = arguments[_key11];\n    }\n    return bar(...list);\n  };\n  foo(...args);\n}\nfunction b() {\n  for (var _len12 = arguments.length, args = [], _key13 = 0; _key13 < _len12; _key13++) {\n    args[_key13 - 0] = arguments[_key13];\n  }\n  return function (args) {\n    const foo = function () {\n      for (var _len14 = arguments.length, args = [], _key15 = 0; _key15 < _len14; _key15++) {\n        args[_key15 - 0] = arguments[_key15];\n      }\n      return bar(...args);\n    };\n    foo(...args);\n  }.call(this, args);\n}\nfunction c() {\n  for (var _len16 = arguments.length, args = [], _key17 = 0; _key17 < _len16; _key17++) {\n    args[_key17 - 0] = arguments[_key17];\n  }\n  return function (args) {\n    const foo = function () {\n      for (var _len18 = arguments.length, args = [], _key19 = 0; _key19 < _len18; _key19++) {\n        args[_key19 - 0] = arguments[_key19];\n      }\n      return bar(...args);\n    };\n    foo([]);\n  }.call(this, args);\n}\nfunction d(_arg) {\n  let thing = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len20 = arguments.length, args = [], _key21 = 1; _key21 < _len20; _key21++) {\n    args[_key21 - 1] = arguments[_key21];\n  }\n  return function (args) {\n    const foo = function () {\n      for (var _len23 = arguments.length, args = [], _key24 = 0; _key24 < _len23; _key24++) {\n        args[_key24 - 0] = arguments[_key24];\n      }\n      return bar(...args);\n    };\n    {\n      let args = thing;\n      foo(thing);\n    }\n  }.call(this, args);\n}',
  'function broken(_arg) {\n  let x = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len = arguments.length, foo = [], _key = 1; _key < _len; _key++) {\n    foo[_key - 1] = arguments[_key];\n  }\n  if (true) {\n    class Foo extends Bar {}\n    return hello(...foo);\n  }\n}',
  'function foo() {\n  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {\n    _args[_key - 0] = arguments[_key];\n  }\n  let { length } = _args;\n  return length;\n}\nexpect(foo(1, 2, 3)).toEqual(3);',
  'function foo() {\n  for (var _len = arguments.length, [a] = [], _key = 0; _key < _len; _key++) {\n    [a][_key - 0] = arguments[_key];\n  }\n}',
  '// optimisation\nfunction foo() {\n  for (var _len = arguments.length, bar = [], _key = 0; _key < _len; _key++) {\n    bar[_key - 0] = arguments[_key];\n  }\n  foo(...bar);\n}\n// deoptimisation\nfunction foo(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len7 = arguments.length, b = [], _key8 = 1; _key8 < _len7; _key8++) {\n    b[_key8 - 1] = arguments[_key8];\n  }\n  foo(...b);\n}\nfunction foo() {\n  for (var _len10 = arguments.length, b = [], _key11 = 0; _key11 < _len10; _key11++) {\n    b[_key11 - 0] = arguments[_key11];\n  }\n  foo(1, ...b);\n}\nfunction foo() {\n  for (var _len12 = arguments.length, args = [], _key13 = 0; _key13 < _len12; _key13++) {\n    args[_key13 - 0] = arguments[_key13];\n  }\n  args.pop();\n  foo(...args);\n}',
  'function u() {\n  for (var _len = arguments.length, items = [], _key = 0; _key < _len; _key++) {\n    items[_key - 0] = arguments[_key];\n  }\n  items[0];\n}\nfunction v(_arg) {\n  let event = arguments.length > 0 ? arguments[0] : void 0;\n  for (var _len7 = arguments.length, args = [], _key8 = 1; _key8 < _len7; _key8++) {\n    args[_key8 - 1] = arguments[_key8];\n  }\n  args;\n}',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (var i of [0]) var a = 1;\n    expect(a).toBe(1);\n  }.call(this, a);\n}\nfoo();',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (var [a] of [[1]]);\n    expect(a).toBe(1);\n  }.call(this, a);\n}\nfoo();',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (var i of [0]) var a;\n    expect(a).toBe(2);\n  }.call(this, a);\n}\nfoo();',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    for (var a, i = 0; i < 1; i++);\n    expect(a).toBe(2);\n  }.call(this, a);\n}\nfoo();',
  'function f() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;\n  return function (a, b) {\n    var a,\n      b = 4;\n    var a;\n    var b;\n    return a + b;\n  }.call(this, a, b);\n}',
  'function f() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;\n  return function (a) {\n    var a;\n    var { a } = { a: 4 };\n    return a + b;\n  }.call(this, a);\n}',
  'function foo() {\n  let { a, b } = arguments.length > 0 ? arguments[0] : void 0;\n  return function (a) {\n    var a = 3;\n    var c = 2;\n    var d = a + b + c;\n  }.call(this, a);\n}',
  'function foo() {\n  let [a, b] = arguments.length > 0 ? arguments[0] : void 0;\n  return function (a) {\n    var a = 3;\n    var c = 2;\n    var d = a + b + c;\n  }.call(this, a);\n}',
  'var x = 1;\nfunction foo(_arg) {\n  let x = arguments.length > 0 ? arguments[0] : void 0;\n  let y =\n    arguments.length > 1 && arguments[1] !== void 0\n      ? arguments[1]\n      : function () {\n          x = 2;\n        };\n  return function (x) {\n    var x = 3;\n    y();\n    expect(x).toBe(3);\n  }.call(this, x);\n}\nfoo();\nexpect(x).toBe(1);',
  'function foo() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  return function (a) {\n    var a = 1;\n  }.call(this, a);\n}',
  'function f() {\n  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {\n    _args[_key - 0] = arguments[_key];\n  }\n  let { length: x = 0, y = x } = _args;\n  return function (x) {\n    var x;\n    return x;\n  }.call(this, x);\n}\nfunction g() {\n  for (var _len8 = arguments.length, _args7 = [], _key9 = 0; _key9 < _len8; _key9++) {\n    _args7[_key9 - 0] = arguments[_key9];\n  }\n  let { length: x = 0, y = x } = _args7;\n  return function (x) {\n    var x = 1;\n    return x;\n  }.call(this, x);\n}',
  'function f() {\n  for (var _len = arguments.length, _args = [], _key = 0; _key < _len; _key++) {\n    _args[_key - 0] = arguments[_key];\n  }\n  let [x, y = x] = _args;\n  return function (x) {\n    var x;\n    return x;\n  }.call(this, x);\n}\nfunction g() {\n  for (var _len8 = arguments.length, _args7 = [], _key9 = 0; _key9 < _len8; _key9++) {\n    _args7[_key9 - 0] = arguments[_key9];\n  }\n  let [x, y = x] = _args7;\n  return function (x) {\n    var x = 1;\n    return x;\n  }.call(this, x);\n}',
  'function f() {\n  for (var _len = arguments.length, x = [], _key = 0; _key < _len; _key++) {\n    x[_key - 0] = arguments[_key];\n  }\n  return function (x) {\n    var x;\n    return x;\n  }.call(this, x);\n}\nfunction g() {\n  for (var _len5 = arguments.length, x = [], _key6 = 0; _key6 < _len5; _key6++) {\n    x[_key6 - 0] = arguments[_key6];\n  }\n  return function (x) {\n    var x = 1;\n    return x;\n  }.call(this, x);\n}',
  'function f() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;\n  return function (a, b) {\n    var { a } = { a: 4 };\n    var a;\n    var b;\n    return a + b;\n  }.call(this, a, b);\n}',
  "(function () {\n  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '__proto__';\n  return function (i) {\n    for (var i in {});\n  }.call(this, i);\n});",
  'class A {\n  a = b => {\n    {\n      ({ b } = {});\n    }\n  };\n}',
  'function test(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;\n  return function (a) {\n    var a = a + b;\n    return a;\n  }.call(this, a);\n}\nexpect(test(2)).toBe(3);',
  'function test(_arg) {\n  let a = arguments.length > 0 ? arguments[0] : void 0;\n  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;\n  return function (a) {\n    var a = a + b;\n    return a;\n  }.call(this, a);\n}',
  '// @flow\nfunction a() {\n  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};\n  let c;\n}\nfunction d() {\n  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => {};\n  let T;\n}',
  'function a() {\n  let b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};\n  let c;\n}\nfunction d() {\n  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : () => {};\n  let T;\n}',
  'class A extends B {\n  handle = (() => {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;\n    console.log(x, this, new.target, super.y);\n  })(() => {\n    let y = 0;\n    var _this = this;\n    return function () {\n      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : y;\n      return x + _this;\n    };\n  })(function () {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n  })(this);\n}',
  'class A extends B {\n  #handle = (() => {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;\n    console.log(x, this, new.target, super.y);\n  })(() => {\n    let y = 0;\n    var _this = this;\n    return function () {\n      let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : y;\n      return x + _this;\n    };\n  })(function () {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n  })(this);\n}',
  'class A {\n  #handle = function () {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;\n    console.log(x);\n  };\n}',
  'class A {\n  handle = function () {\n    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;\n    console.log(x);\n  };\n}',
  "(function () {\n  async function* foo() {\n    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n    yield 'hello';\n    yield p;\n  }\n  return (async () => {\n    const res = [];\n    for await (const x of foo()) res.push(x);\n    expect(res).toEqual(['hello', 1]);\n  })();\n});",
  "import { copy } from './copyPaste';\nclass Thing {\n  handleCopySomething() {\n    copy();\n  }\n  completelyUnrelated() {\n    let copy = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 123;\n  }\n}",
  "import args from 'utils/url/args';\n\nexport default class App extends Component {\n  exportType = '';\n\n  componentDidMount() {\n    this.exportType = args.get('type', window.location.href);\n  }\n}",
  "const a = 'bar';\nfunction foo() {\n  for (var _len = arguments.length, a = [], _key = 0; _key < _len; _key++) {\n    a[_key - 0] = arguments[_key];\n  }\n  return a;\n}",
  'function wrapper(fn) {\n  return function () {\n    for (var _len = arguments.length, args = [], _key = 0; _key < _len; _key++) {\n      args[_key - 0] = arguments[_key];\n    }\n    while (someCondition) {\n      const val = fn(...args);\n      return val.test(() => {\n        console.log(val);\n      });\n    }\n  };\n}',
  '(function () {\n  const err = new Error();\n  async function f() {\n    let a =\n      arguments.length > 0 && arguments[0] !== void 0\n        ? arguments[0]\n        : (() => {\n            throw err;\n          })();\n    return async function (a) {\n      throw 1;\n      var a = await a;\n      return a;\n    }.call(this, a);\n  }\n  return (async () => {\n    let p;\n    expect(() => {\n      p = f();\n    }).not.toThrow();\n    await expect(p).rejects.toThrow(err);\n  })();\n});',
  'function* f() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n  return yield* function* (a) {\n    var a = yield a;\n    return a;\n  }.call(this, a);\n}\nasync function g() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n  return async function (a) {\n    var a = await a;\n    return a;\n  }.call(this, a);\n}\nasync function* h() {\n  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;\n  return yield* async function* (a) {\n    var a = await (yield a);\n    return a;\n  }.call(this, a);\n}',
] as const;

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength — complex assignment (input)',
    source: 'function test({a: b} = {}) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default array destructuring (exec)',
    source:
      'function t([,,a] = [1,2,3]) { return a }\n\nexpect(t()).toBe(3);\nexpect(t([4,5,6])).toBe(6);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default array destructuring (input)',
    source: 'function t([,,a] = [1,2,3]) { return a }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default assignment with types (input)',
    source:
      '// @flow\nexport function transformFileSync(\n  filename: string,\n  opts?: Object = {},\n): string {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default earlier params (exec)',
    source: 'function f(a, b = a, c = b) { return c; }\n\nexpect(f(3)).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife 1128 (exec)',
    source:
      'const bar = true;\n\nfunction foo(a = bar, ...b) {\n  const bar = false;\n  expect(b[0]).toBe(2);\n  expect(b[1]).toBe(3);\n}\n\nfoo(1, 2, 3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife 4253 (exec)',
    source:
      'class Ref {\n  static nextId = 0\n  constructor(id = ++Ref.nextId, n = id) {\n    this.id = n\n  }\n}\n\nexpect(new Ref().id).toBe(1);\nexpect(new Ref().id).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default iife self (exec)',
    source:
      'class Ref {\n  constructor(ref = Ref) {\n    this.ref = ref\n  }\n}\n\nexpect(new Ref().ref).toBe(Ref);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default multiple (input)',
    source:
      'var t = function (e = "foo", f = 5) {\n  return e + " bar " + f;\n};\n\nvar a = function (e, f = 5) {\n  return e + " bar " + f;\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default object destructuring (exec)',
    source:
      "function required(msg) {\n  throw new Error(msg);\n}\n\nfunction sum(\n  { arr = required('arr is required') } = { arr: arr = [] },\n  length = arr.length\n) {\n  let i = 0;\n  let acc = 0;\n  for (let item of arr) {\n    if (i >= length) return acc;\n    acc += item;\n    i++;\n  }\n  return acc;\n}\n\nexpect(sum({arr:[1,2]})).toBe(3);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default rest mix (input)',
    source: 'function fn(\n  a1,\n  a2 = 4,\n  {a3, a4},\n  a5,\n  {a6, a7} = {}) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default rest (exec)',
    source:
      'const a = 1;\nfunction rest(b = a, ...a) {\n  expect(b).toBe(1);\n}\nrest(undefined, 2)\n\nfunction rest2(b = a, ...a) {\n  expect(a[0]).toBe(2);\n}\nrest2(undefined, 2)\n\nfunction rest3(b = a, ...a) {\n  expect(a).toHaveLength(1);\n}\nrest3(undefined, 2)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — default single (input)',
    source: 'var t = function (f = "foo") {\n  return f + " bar";\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — destructuring rest (input)',
    source:
      '// #3861\nfunction t(x = "default", { a, b }, ...args) {\n  console.log(x, a, b, args);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength — overwrite undefined (exec)',
    source: 'function t(undefined = 17, a = 3) {\n  return a;\n}\n\nexpect(t()).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — default (input)',
    source: 'let f = (x = 0) => x + 1;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'loose — ignoreFunctionLength (input)',
    source: 'function fn(a, b = c()) {\n  return b;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'parameters — arrow default super no classes plugin (input)',
    source:
      'class Bar extends Foo {\n    constructor() {\n        let f = (x = super()) => x;\n        f();\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'parameters — arrow rest super no classes plugin (input)',
    source:
      'class Bar extends Foo {\n    constructor() {\n        let f = (...args) => super(...args);\n        f();\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'parameters — async generator (exec)',
    source: 'async function* f([]) {};\n\nexpect(() => {\n  f();\n}).toThrow(TypeError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'parameters — async generator (input)',
    source: 'async function* f([]) {};\n\nexpect(() => {\n  f();\n}).toThrow(TypeError);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'parameters — default arguments (exec)',
    source:
      'function func(...arguments) {\n    return arguments;\n}\nexpect(func(1, 2, 3)).toStrictEqual([1, 2, 3])\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'parameters — default arguments (input)',
    source:
      'function func(...arguments) {\n    console.log(arguments); // [1, 2, 3]\n}\nfunc(1, 2, 3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'parameters — default before last (input)',
    source: 'function foo(a = "foo", b) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'parameters — default earlier params (exec)',
    source: 'function f(a, b = a, c = b) { return c; }\n\nexpect(3).toBe(f(3));\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'parameters — default eval (input)',
    source:
      'let x = "outside";\nfunction outer(a = () => eval("x")) {\n  let x = "inside";\n  return a();\n}\nouter();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'parameters — default iife 4253 (input)',
    source:
      'class Ref {\n  constructor(id = ++Ref.nextID) {\n    this.id = id\n  }\n}\nRef.nextID = 0',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'parameters — default iife 9947 (input)',
    source:
      'let x = "outside";\nfunction outer(a = () => x) {\n  let x = "inside";\n  return a();\n}\nouter();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'parameters — default iife self (input)',
    source:
      'class Ref {\n  constructor(ref = Ref) {\n    this.ref = ref\n  }\n}\n\nclass X {\n  constructor(x = foo) {\n    this.x = x\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'parameters — default rest (input)',
    source:
      'const a = 1;\nfunction rest(b = a, ...a) {\n  expect(b).toBe(1);\n}\nrest(undefined, 2)\n\nfunction rest2(b = a, ...a) {\n  expect(a[0]).toBe(2);\n}\nrest2(undefined, 2)\n\nfunction rest3(b = a, ...a) {\n  expect(a).toHaveLength(1);\n}\nrest3(undefined, 2)\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'parameters — default setter (exec)',
    source:
      'const defaultValue = 1;\nconst obj = {\n  set field(num = defaultValue) {\n    this.num = num;\n  }\n};\nobj.field = void 0;\n\nexpect(obj.num).toBe(defaultValue);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'parameters — default setter (input)',
    source: 'const obj = {\n  set field(num = 1) {\n    this.num = num;\n  }\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'parameters — flow this param (input)',
    source:
      '// @flow\nfunction foo (this : number, x : number, y : string, ...z : any) {\n    x + y + z[0];\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'parameters — fn decl same as param (input)',
    source: 'function foo(a = 2) {\n  function a() {\n\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'parameters — generator (input)',
    source:
      'function* fn(a, [], b = 2) {\n  yield a;\n  yield arguments;\n  yield this;\n  return b;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'parameters — iife this 9385 (input)',
    source:
      'export class Test {\n  invite(options: { privacy: string } = {}) {\n    const privacy = options.privacy || "Private"\n    console.log(this)\n  }\n}',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'parameters — iife this (input)',
    source: 'var a;\n\nclass Test {\n  invite(p = a) {\n    let a;\n    this;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'parameters — let for init same as param (exec)',
    source:
      'function foo(a = 2) {\n  for (let a = 1; a > 0; a--);\n  expect(a).toBe(2);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'parameters — let no init for init same as param (exec)',
    source:
      'function foo(a = 2) {\n  for (let a, i = 0; i < 1; i++) a = 1;\n  expect(a).toBe(2);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'parameters — preserve types (input)',
    source:
      'type Point = {\n  x: number;\n  y: number;\n};\n\nfunction value({ x, y }: Point) {\n  return x * y;\n}\n\nfunction valueWithDefault({ x, y }: Point = {}) {\n  return x * y;\n}\n\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'parameters — regression 4333 (input)',
    source: "const args = 'bar';\nfunction foo(...args) {\n  return args;\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'parameters — regression 4348 (input)',
    source: 'function first(...values) {\n  var index = 0;\n  return values[index++];\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'parameters — regression 4634 (input)',
    source:
      '// @flow\nlet oneOf = (...nodes) => {\n  if (nodes.length === 1) {\n    return nodes[0];\n  }\n  return ((new OneOfNode(nodes)): any)\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'parameters — regression 5787 (exec)',
    source:
      'function f1(a, ...rest) {\n  let b = rest[rest.length - 3];\n  let c = rest[rest.length - 2];\n  let d = rest[rest.length - 1];\n  return [a, b, c, d];\n}\nexpect(f1(1, 2)).toEqual([1, undefined, undefined, 2]);\n\nfunction f2(a, ...rest) {\n  return rest[-1];\n}\nexpect(f2(1, 2)).toBeUndefined();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'parameters — regression 5787 (input)',
    source:
      'function f(a, ...rest) {\n  let b = rest[rest.length - 3];\n  let c = rest[rest.length - 2];\n  let d = rest[rest.length - 1];\n  return [a, b, c, d];\n}\n\nfunction f(a, ...rest) {\n  return rest[-1];\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'parameters — rest argument with other arguments (exec)',
    source:
      "function func(a, b, ...arguments) {\n    return [a, b, arguments];\n}\n\nexpect(func('a', 'b', 1, 2, 3)).toStrictEqual(['a', 'b', [1, 2, 3]])",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'parameters — rest argument with other arguments (input)',
    source:
      "function func(a, b, ...arguments) {\n    return [a, b, arguments];\n}\n\nfunc('a', 'b', 1, 2, 3)",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'parameters — rest arguments deoptimisation (input)',
    source: 'function x (...rest) {\n  arguments;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'parameters — rest arrow functions (input)',
    source:
      '// @flow\nvar concat = (...args) => {\n  var x = args[0];\n  var y = args[1];\n};\n\nvar somefun = function () {\n  let get2ndArg = (a, b, ...args1) => {\n    var _b = args1[0];\n    let somef = (x, y, z, ...args2) => {\n      var _a = args2[0];\n    };\n    let somefg = (c, d, e, f, ...args3) => {\n      var _a = args3[0];\n    };\n    var _d = args1[1];\n  };\n  let get3rdArg = (...args) => args[2];\n}\n\nfunction demo1(...args) {\n  return (i) => {\n    return args[i+0];\n  };\n}\n\nvar x = (...rest) => {\n  if (noNeedToWork) return 0;\n  return rest;\n};\n\nvar innerclassproperties = (...args) => (\n  class {\n    static args = args;\n    args = args;\n  }\n);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'parameters — rest async arrow functions (input)',
    source:
      'var concat = async (...args) => {\n  var x = args[0];\n  var y = args[1];\n};\n\nvar x = async (...rest) => {\n  if (noNeedToWork) return 0;\n  return rest;\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'parameters — rest binding deoptimisation (input)',
    source: 'const deepAssign = (...args) => args = [];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'parameters — rest deepest common ancestor earliest child (input)',
    source:
      '// single reference\nfunction r(...rest){\n  if (noNeedToWork) return 0;\n  return rest;\n}\n\n// multiple references\nfunction r(...rest){\n  if (noNeedToWork) return 0;\n\n  rest;\n  rest;\n}\n\n// multiple nested references\nfunction r(...rest){\n  if (noNeedToWork) return 0;\n\n  if (true) {\n    return rest;\n  } else {\n    return rest;\n  }\n}\n\n// deeply nested\nfunction r(...rest){\n  if (true) {\n    if (true) {\n      return rest;\n    } else {\n      return rest;\n    }\n  }\n}\n\n// nested reference with root reference\nfunction r(...rest){\n  if (noNeedToWork) return 0;\n\n  if (lol) rest;\n  rest;\n}\n\n// nested functions\nfunction a(...args) {\n  return function() {\n    function b() {}\n\n    console.log("Shouldn\'t args be from a\'s scope?", args);\n  };\n}\n\n// loop\nfunction runQueue(queue, ...args) {\n  for (let i = 0; i < queue.length; i++) {\n    queue[i](...args)\n  }\n}\n\n// nested loop\nfunction runQueue(queue, ...args) {\n  if (foo) {\n    for (let i = 0; i < queue.length; i++) {\n      queue[i](...args)\n    }\n  }\n}\n\nfunction r(...rest){\n  if (noNeedToWork) return 0;\n  [rest[0]] = x;\n  return rest;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[49],
      },
    ],
  },
  {
    title: 'parameters — rest length (exec)',
    source:
      'var length = function (a, b, ...items) {\n  return items.length;\n};\n\nexpect(length()).toBe(0);\nexpect(length(1)).toBe(0);\nexpect(length(1, 2)).toBe(0);\nexpect(length(1, 2, 3)).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'parameters — rest length (input)',
    source:
      'var t = function (f, ...items) {\n  items[0];\n  items[items.length - 1];\n};\n\nfunction t(f, ...items) {\n  items;\n  items[0];\n  items[items.length - 1];\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[51],
      },
    ],
  },
  {
    title: 'parameters — rest member expression deoptimisation (input)',
    source:
      'var x = function (foo, ...bar) {\n  console.log(bar);\n};\n\nvar y = function (foo, ...bar) {\n  var x = function z(bar) {\n    bar[1] = 5;\n  };\n};\n\nvar b = function (x, y, ...args) {\n  console.log(args[0]);\n  args.pop();\n  console.log(args[1]);\n};\n\nvar z = function (foo, ...bar) {\n  var x = function () {\n    bar[1] = 5;\n  };\n};\n\nvar a = function (foo, ...bar) {\n  return bar.join(",");\n};\n\nvar b = function (foo, ...bar) {\n  var join = "join";\n  return bar[join];\n};\n\nvar b = function (...bar) {\n  return bar.len;\n};\n\nvar b = function (foo, ...bar) {\n  return bar.length * 2;\n};\n\nvar b = function (foo, baz, ...bar) {\n  return bar.length;\n};\n\nfunction x (...rest) {\n  rest[0] = 0;\n}\n\nfunction swap (...rest) {\n  [rest[0], rest[1]] = [rest[1], rest[0]];\n}\n\nfunction forIn (...rest) {\n  for (rest[0] in this) {\n    foo(rest[0]);\n  }\n}\n\nfunction inc (...rest) {\n  ++rest[0];\n}\n\nfunction dec (...rest) {\n  --rest[0];\n}\n\nfunction del (...rest) {\n  delete rest[0];\n}\n\nfunction method (...rest) {\n  rest[0]();\n}\n\nfunction newExp (...rest) {\n  new rest[0]();\n}\n\n// In addition to swap() above because at some point someone tried checking\n// grandparent path for isArrayExpression() to deopt.\nfunction arrayDestructure (...rest) {\n  [rest[0]] = x;\n}\n\nfunction forOf (...rest) {\n  for (rest[0] of this);\n}\n\nfunction postfixIncrement (...rest) {\n  rest[0]++;\n}\n\nfunction postfixDecrement (...rest) {\n  rest[0]--;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'parameters — rest member expression optimisation (input)',
    source:
      'var t = function (...items) {\n  var x = items[0];\n  var y = items[1];\n}\n\nfunction t(...items) {\n  var x = items[0];\n  var y = items[1];\n}\n\nfunction t(...items) {\n  var a = [];\n  for (var i = 0; i < items.length; i++) {\n    a.push(i);\n  }\n  return a;\n}\n\n// https://github.com/babel/babel/pull/2833#issuecomment-166039291\nfunction t(...items) {\n  for (let i = 0; i < items.length; i++) {\n    return items[i];\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[53],
      },
    ],
  },
  {
    title: 'parameters — rest multiple (input)',
    source:
      'var t = function (f, ...items) {\n    var x = f;\n    x = items[0];\n    x = items[1];\n};\n\nfunction t(f, ...items) {\n    var x = f;\n    x = items[0];\n    x = items[1];\n}\n\nfunction u(f, g, ...items) {\n    var x = f;\n    var y = g;\n    x[12] = items[0];\n    y.prop = items[1];\n    var z = items[2] | 0 || 12;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'parameters — rest nested 5656 (input)',
    source:
      'function a(...args) {\n  const foo = (...list) => bar(...list);\n  foo(...args);\n}\n\nfunction b(...args) {\n  const foo = (...args) => bar(...args);\n  foo(...args);\n}\n\nfunction c(...args) {\n  const foo = (...args) => bar(...args);\n  foo([]);\n}\n\nfunction d(thing, ...args) {\n  const foo = (...args) => bar(...args);\n  {\n    let args = thing;\n    foo(thing);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[55],
      },
    ],
  },
  {
    title: 'parameters — rest nested iife (input)',
    source:
      'function broken(x, ...foo) {\n  if (true) {\n    class Foo extends Bar { }\n    return hello(...foo)\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'parameters — rest patterns (exec)',
    source:
      'function foo(...{ length }) {\n  return length;\n}\n\nexpect(foo(1, 2, 3)).toEqual(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[57],
      },
    ],
  },
  {
    title: 'parameters — rest patterns (input)',
    source: 'function foo(...[a]) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'parameters — rest spread optimisation (input)',
    source:
      '// optimisation\n\nfunction foo(...bar) {\n  foo(...bar);\n}\n\n// deoptimisation\n\nfunction foo(a, ...b) {\n  foo(...b);\n}\n\nfunction foo(...b) {\n  foo(1, ...b);\n}\n\nfunction foo(...args){\n  args.pop()\n  foo(...args);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[59],
      },
    ],
  },
  {
    title: 'parameters — rest ts this parameter (input)',
    source:
      'function u(this: Foo, ...items) {\n  items[0];\n}\n\nfunction v(this: Foo, event: string, ...args: any[]) {\n  args;\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'parameters — var for body same as param (exec)',
    source:
      'function foo(a = 2) {\n  for (var i of [0]) var a = 1;\n  expect(a).toBe(1);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[61],
      },
    ],
  },
  {
    title: 'parameters — var for init same as param (exec)',
    source: 'function foo(a = 2) {\n  for (var [a] of [[1]]);\n  expect(a).toBe(1);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'parameters — var no init for body same as param (exec)',
    source: 'function foo(a = 2) {\n  for (var i of [0]) var a;\n  expect(a).toBe(2);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[63],
      },
    ],
  },
  {
    title: 'parameters — var no init for init same as param (exec)',
    source:
      'function foo(a = 2) {\n  for (var a, i = 0; i < 1; i++);\n  expect(a).toBe(2);\n}\nfoo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'parameters — var no init same as param (input)',
    source: 'function f(a = 2, b = 3) {\n  var a, b = 4;\n  var a;\n  var b;\n  return a + b;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[65],
      },
    ],
  },
  {
    title: 'parameters — var no init then var with init same as param (input)',
    source: 'function f(a = 2, b = 3) {\n  var a;\n  var { a } = { a: 4 };\n  return a + b;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'parameters — var same as array pattern param (input)',
    source: 'function foo({a, b}) {\n  var a = 3;\n  var c = 2;\n  var d = a + b + c;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[67],
      },
    ],
  },
  {
    title: 'parameters — var same as object pattern param (input)',
    source: 'function foo([a, b]) {\n  var a = 3;\n  var c = 2;\n  var d = a + b + c;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'parameters — var same as param closure (exec)',
    source:
      'var x = 1\nfunction foo(x, y = function () { x = 2 }) {\n  var x = 3\n  y()\n  expect(x).toBe(3);\n}\nfoo()\nexpect(x).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[69],
      },
    ],
  },
  {
    title: 'parameters — var same as param (input)',
    source: 'function foo(a = 2) {\n  var a = 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'parameters — var same name as nested in rest param 2 (input)',
    source:
      'function f(...{ length: x = 0, y = x }) {\n  var x;\n  return x;\n}\n\nfunction g(...{ length: x = 0, y = x }) {\n  var x = 1;\n  return x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[71],
      },
    ],
  },
  {
    title: 'parameters — var same name as nested in rest param (input)',
    source:
      'function f(...[x, y = x]) {\n  var x;\n  return x;\n}\n\nfunction g(...[x, y = x]) {\n  var x = 1;\n  return x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'parameters — var same name as rest param (input)',
    source:
      'function f(...x) {\n  var x;\n  return x;\n}\n\nfunction g(...x) {\n  var x = 1;\n  return x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[73],
      },
    ],
  },
  {
    title: 'parameters — var with init then var no init same as param (input)',
    source:
      'function f(a = 2, b = 3) {\n  var { a } = { a: 4 };\n  var a;\n  var b;\n  return a + b;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[74],
      },
    ],
  },
  {
    title: 'regression — 11231 (input)',
    source: '(i = "__proto__") => {\n  for (var i in {});\n};\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'regression — 11256 (input)',
    source: 'class A {\n  a = b => {\n    {\n      ({ b } = {});\n    }\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[76],
      },
    ],
  },
  {
    title: 'regression — 11303 (exec)',
    source:
      'function test(a, b = 1) {\n  var a = a + b;\n  return a;\n}\n\nexpect(test(2)).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'regression — 11303 (input)',
    source: 'function test(a, b = 1) {\n  var a = a + b;\n  return a;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'regression — 11344 flow (input)',
    source:
      '// @flow\nfunction a(b: (c) => void = {}) {\n  let c;\n}\n\nfunction d(e = <T>() => {}) {\n  let T;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[79],
      },
    ],
  },
  {
    title: 'regression — 11344 typescript (input)',
    source:
      'function a(b: (c) => void = {}) {\n  let c;\n}\n\nfunction d(e = <T>() => {}) {\n  let T;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
          typescript: 'strip',
        },
        output: expectedOutputs[80],
      },
    ],
  },
  {
    title: 'regression — 13939 complex (input)',
    source:
      'class A extends B {\n  handle = ((x = 0) => {\n    console.log(x, this, new.target, super.y);\n  })(() => {\n    let y = 0;\n    return (x = y) => x + this;\n  })((x = 1) => {})(this);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'regression — 13939 private complex (input)',
    source:
      'class A extends B {\n  #handle = ((x = 0) => {\n    console.log(x, this, new.target, super.y);\n  })(() => {\n    let y = 0;\n    return (x = y) => x + this;\n  })((x = 1) => {})(this);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[82],
      },
    ],
  },
  {
    title: 'regression — 13939 private (input)',
    source: 'class A {\n  #handle = (x = 0) => {\n    console.log(x);\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'regression — 13939 (input)',
    source: 'class A {\n  handle = (x = 0) => {\n    console.log(x);\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[84],
      },
    ],
  },
  {
    title: 'regression — 15145 (exec)',
    source:
      '(function () {\nasync function * foo (p = 1) {\n  yield "hello";\n  yield p;\n}\n\nreturn (async () => {\n  const res = [];\n  for await (const x of foo()) res.push(x);\n  expect(res).toEqual(["hello", 1]);\n})();\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[85],
      },
    ],
  },
  {
    title: 'regression — 4209 (input)',
    source:
      "import { copy } from './copyPaste';\n\nclass Thing {\n  handleCopySomething() {\n    copy();\n  }\n\n  completelyUnrelated(copy = 123) {\n  }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[86],
      },
    ],
  },
  {
    title: 'regression — 6057 expanded (input)',
    source:
      "import args from 'utils/url/args';\n\nexport default class App extends Component {\n  exportType = ''\n\n  componentDidMount() {\n    this.exportType = args.get('type', window.location.href);\n  }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'regression — 6057 simple (input)',
    source: "const a = 'bar';\nfunction foo(...a) {\n  return a;\n}\n\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[88],
      },
    ],
  },
  {
    title: 'regression — regression 2364 (input)',
    source:
      'function wrapper(fn) {\n  return (...args) => {\n    while (someCondition) {\n      const val = fn(...args);\n      return val.test(() => {\n        console.log(val);\n      });\n    }\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[89],
      },
    ],
  },
  {
    title: 'regression — scope async param error async (exec)',
    source:
      '(function () {\nconst err = new Error();\n\nasync function f(a = (() => { throw err })()) {\n  throw 1;\n  var a = await a;\n  return a;\n}\n\nreturn (async () => {\n  let p;\n  expect(() => { p = f() }).not.toThrow();\n  await expect(p).rejects.toThrow(err);\n})();\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[90],
      },
    ],
  },
  {
    title: 'regression — scope gen async (input)',
    source:
      'function* f(a = 1) {\n  var a = yield a;\n  return a;\n}\n\nasync function g(a = 1) {\n  var a = await a;\n  return a;\n}\n\nasync function* h(a = 1) {\n  var a = await (yield a);\n  return a;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            parameters: true,
          },
        },
        output: expectedOutputs[91],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
