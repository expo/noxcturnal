import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      optionalChaining: {
        loose: false,
      },
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'member access (?.) > accesses property on object',
    '() => {\n  const obj = { a: 1 };\n  expect(obj?.a).toBe(1);\n}',
    '() => {\n  const obj = { a: 1 };\n  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(1);\n};',
  ],
  [
    'member access (?.) > returns undefined for null base',
    '() => {\n  const obj = null;\n  expect(obj?.a).toBe(undefined);\n}',
    '() => {\n  const obj = null;\n  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);\n};',
  ],
  [
    'member access (?.) > returns undefined for undefined base',
    '() => {\n  const obj = undefined;\n  expect(obj?.a).toBe(undefined);\n}',
    '() => {\n  const obj = undefined;\n  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);\n};',
  ],
  [
    'member access (?.) > accesses nested property',
    '() => {\n  const obj = { a: { b: { c: 42 } } };\n  expect(obj?.a?.b?.c).toBe(42);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: { b: { c: 42 } } };\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$a = obj.a) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.b) === null ||\n      _obj$a === void 0\n      ? void 0\n      : _obj$a.c,\n  ).toBe(42);\n};',
  ],
  [
    'member access (?.) > short-circuits at first null',
    '() => {\n  const obj = { a: null };\n  expect(obj?.a?.b?.c).toBe(undefined);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: null };\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$a = obj.a) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.b) === null ||\n      _obj$a === void 0\n      ? void 0\n      : _obj$a.c,\n  ).toBe(undefined);\n};',
  ],
  [
    'member access (?.) > short-circuits at first undefined property',
    '() => {\n  const obj = { a: {} };\n  expect(obj?.a?.b?.c).toBe(undefined);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: {} };\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$a = obj.a) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.b) === null ||\n      _obj$a === void 0\n      ? void 0\n      : _obj$a.c,\n  ).toBe(undefined);\n};',
  ],
  [
    'member access (?.) > property exists but is falsy',
    '() => {\n  const obj = { val: 0 };\n  expect(obj?.val).toBe(0);\n}',
    '() => {\n  const obj = { val: 0 };\n  expect(obj === null || obj === void 0 ? void 0 : obj.val).toBe(0);\n};',
  ],
  [
    'member access (?.) > preserves all falsy non-nullish values',
    "() => {\n  expect({ v: 0 }?.v).toBe(0);\n  expect({ v: '' }?.v).toBe('');\n  expect({ v: false }?.v).toBe(false);\n  expect({ v: NaN }?.v).not.toBe(NaN); // NaN !== NaN\n  expect(typeof { v: NaN }?.v).toBe('number');\n}",
    "() => {\n  var _v, _v2, _v3, _v4, _v5;\n  expect((_v = { v: 0 }) === null || _v === void 0 ? void 0 : _v.v).toBe(0);\n  expect((_v2 = { v: '' }) === null || _v2 === void 0 ? void 0 : _v2.v).toBe('');\n  expect((_v3 = { v: false }) === null || _v3 === void 0 ? void 0 : _v3.v).toBe(false);\n  expect((_v4 = { v: NaN }) === null || _v4 === void 0 ? void 0 : _v4.v).not.toBe(NaN);\n  expect(typeof ((_v5 = { v: NaN }) === null || _v5 === void 0 ? void 0 : _v5.v)).toBe('number');\n};",
  ],
  [
    'member access (?.) > works on non-plain objects',
    "() => {\n  expect('hello'?.length).toBe(5);\n  expect([1, 2, 3]?.length).toBe(3);\n  expect((42)?.toFixed(2)).toBe('42.00');\n}",
    "() => {\n  var _hello, _ref, _;\n  expect((_hello = 'hello') === null || _hello === void 0 ? void 0 : _hello.length).toBe(5);\n  expect((_ref = [1, 2, 3]) === null || _ref === void 0 ? void 0 : _ref.length).toBe(3);\n  expect((_ = 42) === null || _ === void 0 ? void 0 : _.toFixed(2)).toBe('42.00');\n};",
  ],
  [
    'computed member access (?.[]) > accesses computed property',
    "() => {\n  const obj = { foo: 'bar' };\n  const key = 'foo';\n  expect(obj?.[key]).toBe('bar');\n}",
    "() => {\n  const obj = { foo: 'bar' };\n  const key = 'foo';\n  expect(obj === null || obj === void 0 ? void 0 : obj[key]).toBe('bar');\n};",
  ],
  [
    'computed member access (?.[]) > returns undefined for null base',
    "() => {\n  const obj = null;\n  expect(obj?.['foo']).toBe(undefined);\n}",
    "() => {\n  const obj = null;\n  expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);\n};",
  ],
  [
    'computed member access (?.[]) > returns undefined for undefined base',
    "() => {\n  const obj = undefined;\n  expect(obj?.['foo']).toBe(undefined);\n}",
    "() => {\n  const obj = undefined;\n  expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);\n};",
  ],
  [
    'computed member access (?.[]) > accesses array element',
    '() => {\n  const arr = [10, 20, 30];\n  expect(arr?.[1]).toBe(20);\n}',
    '() => {\n  const arr = [10, 20, 30];\n  expect(arr === null || arr === void 0 ? void 0 : arr[1]).toBe(20);\n};',
  ],
  [
    'computed member access (?.[]) > returns undefined for null array',
    '() => {\n  const arr = null;\n  expect(arr?.[0]).toBe(undefined);\n}',
    '() => {\n  const arr = null;\n  expect(arr === null || arr === void 0 ? void 0 : arr[0]).toBe(undefined);\n};',
  ],
  [
    'computed member access (?.[]) > accesses with symbol key',
    "() => {\n  const sym = Symbol('key');\n  const obj = { [sym]: 'value' };\n  expect(obj?.[sym]).toBe('value');\n}",
    "() => {\n  const sym = Symbol('key');\n  const obj = { [sym]: 'value' };\n  expect(obj === null || obj === void 0 ? void 0 : obj[sym]).toBe('value');\n};",
  ],
  [
    'computed member access (?.[]) > computed key expression is not evaluated when base is nullish',
    "() => {\n  let evaluated = false;\n  const key = () => {\n    evaluated = true;\n    return 'foo';\n  };\n  const obj = null;\n  obj?.[key()];\n  expect(evaluated).toBe(false);\n}",
    "() => {\n  let evaluated = false;\n  const key = () => {\n    evaluated = true;\n    return 'foo';\n  };\n  const obj = null;\n  obj === null || obj === void 0 ? void 0 : obj[key()];\n  expect(evaluated).toBe(false);\n};",
  ],
  [
    'computed member access (?.[]) > computed key expression evaluated once when base is non-nullish',
    "() => {\n  let count = 0;\n  const key = () => {\n    count++;\n    return 'foo';\n  };\n  const obj = { foo: 'bar' };\n  expect(obj?.[key()]).toBe('bar');\n  expect(count).toBe(1);\n}",
    "() => {\n  let count = 0;\n  const key = () => {\n    count++;\n    return 'foo';\n  };\n  const obj = { foo: 'bar' };\n  expect(obj === null || obj === void 0 ? void 0 : obj[key()]).toBe('bar');\n  expect(count).toBe(1);\n};",
  ],
  [
    'optional call (?.()) > calls function',
    '() => {\n  const fn = () => 42;\n  expect(fn?.()).toBe(42);\n}',
    '() => {\n  const fn = () => 42;\n  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(42);\n};',
  ],
  [
    'optional call (?.()) > returns undefined for null function',
    '() => {\n  const fn = null;\n  expect(fn?.()).toBe(undefined);\n}',
    '() => {\n  const fn = null;\n  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);\n};',
  ],
  [
    'optional call (?.()) > returns undefined for undefined function',
    '() => {\n  const fn = undefined;\n  expect(fn?.()).toBe(undefined);\n}',
    '() => {\n  const fn = undefined;\n  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);\n};',
  ],
  [
    'optional call (?.()) > passes arguments',
    '() => {\n  const fn = (a, b) => a + b;\n  expect(fn?.(2, 3)).toBe(5);\n}',
    '() => {\n  const fn = (a, b) => a + b;\n  expect(fn === null || fn === void 0 ? void 0 : fn(2, 3)).toBe(5);\n};',
  ],
  [
    'optional call (?.()) > arguments not evaluated when function is nullish',
    '() => {\n  let evaluated = false;\n  const fn = null;\n  fn?.((evaluated = true));\n  expect(evaluated).toBe(false);\n}',
    '() => {\n  let evaluated = false;\n  const fn = null;\n  fn === null || fn === void 0 ? void 0 : fn((evaluated = true));\n  expect(evaluated).toBe(false);\n};',
  ],
  [
    'optional call (?.()) > works with function stored in variable',
    '() => {\n  const obj = { fn: (x) => x * 2 };\n  expect(obj.fn?.(5)).toBe(10);\n}',
    '() => {\n  var _obj$fn;\n  const obj = { fn: x => x * 2 };\n  expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj, 5)).toBe(\n    10,\n  );\n};',
  ],
  [
    'optional call (?.()) > returns undefined for missing method',
    '() => {\n  const obj = {};\n  expect(obj.fn?.()).toBe(undefined);\n}',
    '() => {\n  var _obj$fn;\n  const obj = {};\n  expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj)).toBe(\n    undefined,\n  );\n};',
  ],
  [
    'method calls (?.method()) > calls method on object',
    "() => {\n  const obj = {\n    greet() {\n      return 'hello';\n    },\n  };\n  expect(obj?.greet()).toBe('hello');\n}",
    "() => {\n  const obj = {\n    greet() {\n      return 'hello';\n    },\n  };\n  expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe('hello');\n};",
  ],
  [
    'method calls (?.method()) > preserves this context',
    "() => {\n  const obj = {\n    name: 'test',\n    getName() {\n      return this.name;\n    },\n  };\n  expect(obj?.getName()).toBe('test');\n}",
    "() => {\n  const obj = {\n    name: 'test',\n    getName() {\n      return this.name;\n    },\n  };\n  expect(obj === null || obj === void 0 ? void 0 : obj.getName()).toBe('test');\n};",
  ],
  [
    'method calls (?.method()) > returns undefined when object is null',
    '() => {\n  const obj = null;\n  expect(obj?.greet()).toBe(undefined);\n}',
    '() => {\n  const obj = null;\n  expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe(undefined);\n};',
  ],
  [
    'method calls (?.method()) > returns undefined when method is undefined',
    '() => {\n  const obj = {};\n  expect(obj?.greet?.()).toBe(undefined);\n}',
    '() => {\n  var _obj$greet;\n  const obj = {};\n  expect(\n    obj === null || obj === void 0 || (_obj$greet = obj.greet) === null || _obj$greet === void 0\n      ? void 0\n      : _obj$greet.call(obj),\n  ).toBe(undefined);\n};',
  ],
  [
    'method calls (?.method()) > chained method calls',
    '() => {\n  const obj = {\n    inner: {\n      getValue() {\n        return 42;\n      },\n    },\n  };\n  expect(obj?.inner?.getValue()).toBe(42);\n}',
    '() => {\n  var _obj$inner;\n  const obj = {\n    inner: {\n      getValue() {\n        return 42;\n      },\n    },\n  };\n  expect(\n    obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0\n      ? void 0\n      : _obj$inner.getValue(),\n  ).toBe(42);\n};',
  ],
  [
    'method calls (?.method()) > method on prototype chain',
    "() => {\n  class Base {\n    hello() {\n      return 'base';\n    }\n  }\n  class Child extends Base {}\n  const c = new Child();\n  expect(c?.hello()).toBe('base');\n}",
    "() => {\n  class Base {\n    hello() {\n      return 'base';\n    }\n  }\n  class Child extends Base {}\n  const c = new Child();\n  expect(c === null || c === void 0 ? void 0 : c.hello()).toBe('base');\n};",
  ],
  [
    'method calls (?.method()) > this context preserved in nested access',
    '() => {\n  const obj = {\n    x: 10,\n    inner: {\n      x: 20,\n      getX() {\n        return this.x;\n      },\n    },\n  };\n  expect(obj?.inner?.getX()).toBe(20);\n}',
    '() => {\n  var _obj$inner;\n  const obj = {\n    x: 10,\n    inner: {\n      x: 20,\n      getX() {\n        return this.x;\n      },\n    },\n  };\n  expect(\n    obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0\n      ? void 0\n      : _obj$inner.getX(),\n  ).toBe(20);\n};',
  ],
  [
    'short-circuit evaluation > does not access further properties after null',
    '() => {\n  let accessed = false;\n  const handler = {\n    get() {\n      accessed = true;\n      return {};\n    },\n  };\n  const obj = null;\n  obj?.foo;\n  expect(accessed).toBe(false);\n}',
    '() => {\n  let accessed = false;\n  const handler = {\n    get() {\n      accessed = true;\n      return {};\n    },\n  };\n  const obj = null;\n  obj === null || obj === void 0 ? void 0 : obj.foo;\n  expect(accessed).toBe(false);\n};',
  ],
  [
    'short-circuit evaluation > does not call methods after null',
    '() => {\n  let called = false;\n  const obj = null;\n  obj?.method?.((called = true));\n  expect(called).toBe(false);\n}',
    '() => {\n  var _obj$method;\n  let called = false;\n  const obj = null;\n  obj === null || obj === void 0 || (_obj$method = obj.method) === null || _obj$method === void 0\n    ? void 0\n    : _obj$method.call(obj, (called = true));\n  expect(called).toBe(false);\n};',
  ],
  [
    'short-circuit evaluation > entire chain short-circuits',
    '() => {\n  let sideEffect = false;\n  const obj = null;\n  obj?.a.b.c.d.e?.f?.(() => {\n    sideEffect = true;\n  });\n  expect(sideEffect).toBe(false);\n}',
    '() => {\n  var _obj$a$b$c$d$e, _obj$a$b$c$d$e$f;\n  let sideEffect = false;\n  const obj = null;\n  obj === null ||\n  obj === void 0 ||\n  (_obj$a$b$c$d$e = obj.a.b.c.d.e) === null ||\n  _obj$a$b$c$d$e === void 0 ||\n  (_obj$a$b$c$d$e$f = _obj$a$b$c$d$e.f) === null ||\n  _obj$a$b$c$d$e$f === void 0\n    ? void 0\n    : _obj$a$b$c$d$e$f.call(_obj$a$b$c$d$e, () => {\n        sideEffect = true;\n      });\n  expect(sideEffect).toBe(false);\n};',
  ],
  [
    'short-circuit evaluation > short-circuits computed access after null',
    "() => {\n  let keyEvaluated = false;\n  const obj = null;\n  obj?.[\n    (() => {\n      keyEvaluated = true;\n      return 'key';\n    })()\n  ];\n  expect(keyEvaluated).toBe(false);\n}",
    "() => {\n  let keyEvaluated = false;\n  const obj = null;\n  obj === null || obj === void 0\n    ? void 0\n    : obj[\n        (() => {\n          keyEvaluated = true;\n          return 'key';\n        })()\n      ];\n  expect(keyEvaluated).toBe(false);\n};",
  ],
  [
    'short-circuit evaluation > side effects in base are evaluated once',
    '() => {\n  let count = 0;\n  const getObj = () => {\n    count++;\n    return { a: 1 };\n  };\n  expect(getObj()?.a).toBe(1);\n  expect(count).toBe(1);\n}',
    '() => {\n  var _getObj;\n  let count = 0;\n  const getObj = () => {\n    count++;\n    return { a: 1 };\n  };\n  expect((_getObj = getObj()) === null || _getObj === void 0 ? void 0 : _getObj.a).toBe(1);\n  expect(count).toBe(1);\n};',
  ],
  [
    'short-circuit evaluation > non-optional part after ?. still evaluates if base is present',
    '() => {\n  let count = 0;\n  const obj = {\n    get a() {\n      count++;\n      return { b: 42 };\n    },\n  };\n  expect(obj?.a.b).toBe(42);\n  expect(count).toBe(1);\n}',
    '() => {\n  let count = 0;\n  const obj = {\n    get a() {\n      count++;\n      return { b: 42 };\n    },\n  };\n  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);\n  expect(count).toBe(1);\n};',
  ],
  [
    'delete with optional chaining > deletes existing property',
    '() => {\n  const obj = { a: 1 };\n  expect(delete obj?.a).toBe(true);\n  expect(obj.a).toBe(undefined);\n}',
    '() => {\n  const obj = { a: 1 };\n  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);\n  expect(obj.a).toBe(undefined);\n};',
  ],
  [
    'delete with optional chaining > returns true for null base',
    '() => {\n  const obj = null;\n  expect(delete obj?.a).toBe(true);\n}',
    '() => {\n  const obj = null;\n  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);\n};',
  ],
  [
    'delete with optional chaining > returns true for undefined base',
    '() => {\n  const obj = undefined;\n  expect(delete obj?.a).toBe(true);\n}',
    '() => {\n  const obj = undefined;\n  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);\n};',
  ],
  [
    'delete with optional chaining > deletes nested property',
    '() => {\n  const obj = { a: { b: 1 } };\n  expect(delete obj?.a?.b).toBe(true);\n  expect(obj.a.b).toBe(undefined);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: { b: 1 } };\n  expect(\n    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n      ? true\n      : delete _obj$a.b,\n  ).toBe(true);\n  expect(obj.a.b).toBe(undefined);\n};',
  ],
  [
    'delete with optional chaining > returns true for null in nested delete',
    '() => {\n  const obj = { a: null };\n  expect(delete obj?.a?.b).toBe(true);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: null };\n  expect(\n    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n      ? true\n      : delete _obj$a.b,\n  ).toBe(true);\n};',
  ],
  [
    'delete with optional chaining > deletes computed property',
    "() => {\n  const obj = { foo: 'bar' };\n  const key = 'foo';\n  expect(delete obj?.[key]).toBe(true);\n  expect(obj.foo).toBe(undefined);\n}",
    "() => {\n  const obj = { foo: 'bar' };\n  const key = 'foo';\n  expect(obj === null || obj === void 0 ? true : delete obj[key]).toBe(true);\n  expect(obj.foo).toBe(undefined);\n};",
  ],
  [
    'in boolean context > if statement with optional chaining',
    "() => {\n  const obj = null;\n  let branch = 'none';\n  if (obj?.truthy) {\n    branch = 'if';\n  } else {\n    branch = 'else';\n  }\n  expect(branch).toBe('else');\n}",
    "() => {\n  const obj = null;\n  let branch = 'none';\n  if (obj === null || obj === void 0 ? void 0 : obj.truthy) {\n    branch = 'if';\n  } else {\n    branch = 'else';\n  }\n  expect(branch).toBe('else');\n};",
  ],
  [
    'in boolean context > if with non-null object and truthy value',
    "() => {\n  const obj = { flag: true };\n  let branch = 'none';\n  if (obj?.flag) {\n    branch = 'if';\n  }\n  expect(branch).toBe('if');\n}",
    "() => {\n  const obj = { flag: true };\n  let branch = 'none';\n  if (obj === null || obj === void 0 ? void 0 : obj.flag) {\n    branch = 'if';\n  }\n  expect(branch).toBe('if');\n};",
  ],
  [
    'in boolean context > if with non-null object and falsy value',
    "() => {\n  const obj = { flag: 0 };\n  let branch = 'none';\n  if (obj?.flag) {\n    branch = 'if';\n  } else {\n    branch = 'else';\n  }\n  expect(branch).toBe('else');\n}",
    "() => {\n  const obj = { flag: 0 };\n  let branch = 'none';\n  if (obj === null || obj === void 0 ? void 0 : obj.flag) {\n    branch = 'if';\n  } else {\n    branch = 'else';\n  }\n  expect(branch).toBe('else');\n};",
  ],
  [
    'in boolean context > logical NOT with optional chaining',
    '() => {\n  const obj = null;\n  expect(!obj?.foo).toBe(true);\n}',
    '() => {\n  const obj = null;\n  expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(true);\n};',
  ],
  [
    'in boolean context > logical NOT with existing value',
    "() => {\n  const obj = { foo: 'bar' };\n  expect(!obj?.foo).toBe(false);\n}",
    "() => {\n  const obj = { foo: 'bar' };\n  expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(false);\n};",
  ],
  [
    'in boolean context > double NOT coerces to boolean',
    '() => {\n  expect(!!null?.foo).toBe(false);\n  expect(!!{ foo: 1 }?.foo).toBe(true);\n  expect(!!{ foo: 0 }?.foo).toBe(false);\n}',
    '() => {\n  var _ref, _foo, _foo2;\n  expect(!!((_ref = null) === null || _ref === void 0 ? void 0 : _ref.foo)).toBe(false);\n  expect(!!((_foo = { foo: 1 }) === null || _foo === void 0 ? void 0 : _foo.foo)).toBe(true);\n  expect(!!((_foo2 = { foo: 0 }) === null || _foo2 === void 0 ? void 0 : _foo2.foo)).toBe(false);\n};',
  ],
  [
    'in boolean context > ternary with optional chaining',
    "() => {\n  const obj = null;\n  expect(obj?.val ? 'yes' : 'no').toBe('no');\n}",
    "() => {\n  const obj = null;\n  expect((obj === null || obj === void 0 ? void 0 : obj.val) ? 'yes' : 'no').toBe('no');\n};",
  ],
  [
    'in boolean context > while loop with optional chaining',
    '() => {\n  const items = [{ next: { next: { next: null } } }];\n  let node = items[0];\n  let count = 0;\n  while (node?.next) {\n    node = node.next;\n    count++;\n  }\n  expect(count).toBe(2);\n}',
    '() => {\n  const items = [{ next: { next: { next: null } } }];\n  let node = items[0];\n  let count = 0;\n  while (node === null || node === void 0 ? void 0 : node.next) {\n    node = node.next;\n    count++;\n  }\n  expect(count).toBe(2);\n};',
  ],
  [
    'with logical operators > ?. with && operator',
    "() => {\n  const obj = null;\n  expect(obj?.a && 'yes').toBe(undefined);\n}",
    "() => {\n  const obj = null;\n  expect((obj === null || obj === void 0 ? void 0 : obj.a) && 'yes').toBe(undefined);\n};",
  ],
  [
    'with logical operators > ?. with || operator',
    "() => {\n  const obj = null;\n  expect(obj?.a || 'fallback').toBe('fallback');\n}",
    "() => {\n  const obj = null;\n  expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');\n};",
  ],
  [
    'with logical operators > ?. with ?? operator',
    "() => {\n  const obj = null;\n  expect(obj?.a ?? 'fallback').toBe('fallback');\n}",
    "() => {\n  const obj = null;\n  expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe('fallback');\n};",
  ],
  [
    'with logical operators > ?. returning falsy with ??',
    "() => {\n  const obj = { a: 0 };\n  expect(obj?.a ?? 'fallback').toBe(0);\n}",
    "() => {\n  const obj = { a: 0 };\n  expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe(0);\n};",
  ],
  [
    'with logical operators > ?. returning falsy with ||',
    "() => {\n  const obj = { a: 0 };\n  expect(obj?.a || 'fallback').toBe('fallback');\n}",
    "() => {\n  const obj = { a: 0 };\n  expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');\n};",
  ],
  [
    'with logical operators > chained logical with multiple ?.',
    '() => {\n  const a = { x: 1 };\n  const b = null;\n  expect(a?.x && b?.y).toBe(undefined);\n}',
    '() => {\n  const a = { x: 1 };\n  const b = null;\n  expect(\n    (a === null || a === void 0 ? void 0 : a.x) && (b === null || b === void 0 ? void 0 : b.y),\n  ).toBe(undefined);\n};',
  ],
  [
    'mixed chains > optional then regular access',
    '() => {\n  const obj = { a: { b: 42 } };\n  expect(obj?.a.b).toBe(42);\n}',
    '() => {\n  const obj = { a: { b: 42 } };\n  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);\n};',
  ],
  [
    'mixed chains > optional then regular access on null short-circuits all',
    '() => {\n  const obj = null;\n  // The entire chain short-circuits — .b is not attempted\n  expect(obj?.a.b).toBe(undefined);\n}',
    '() => {\n  const obj = null;\n  // The entire chain short-circuits — .b is not attempted\n  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(undefined);\n};',
  ],
  [
    'mixed chains > regular then optional access',
    '() => {\n  const obj = { a: null };\n  expect(obj.a?.b).toBe(undefined);\n}',
    '() => {\n  var _obj$a;\n  const obj = { a: null };\n  expect((_obj$a = obj.a) === null || _obj$a === void 0 ? void 0 : _obj$a.b).toBe(undefined);\n};',
  ],
  [
    'mixed chains > mixed optional and regular deep chain',
    "() => {\n  const obj = { a: { b: { c: { d: 'deep' } } } };\n  expect(obj?.a.b?.c.d).toBe('deep');\n}",
    "() => {\n  var _obj$a$b;\n  const obj = { a: { b: { c: { d: 'deep' } } } };\n  expect(\n    obj === null || obj === void 0 || (_obj$a$b = obj.a.b) === null || _obj$a$b === void 0\n      ? void 0\n      : _obj$a$b.c.d,\n  ).toBe('deep');\n};",
  ],
  [
    'mixed chains > optional member then optional call',
    '() => {\n  const obj = { fn: () => 42 };\n  expect(obj?.fn?.()).toBe(42);\n}',
    '() => {\n  var _obj$fn;\n  const obj = { fn: () => 42 };\n  expect(\n    obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0\n      ? void 0\n      : _obj$fn.call(obj),\n  ).toBe(42);\n};',
  ],
  [
    'mixed chains > optional member with missing function',
    '() => {\n  const obj = {};\n  expect(obj?.fn?.()).toBe(undefined);\n}',
    '() => {\n  var _obj$fn;\n  const obj = {};\n  expect(\n    obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0\n      ? void 0\n      : _obj$fn.call(obj),\n  ).toBe(undefined);\n};',
  ],
  [
    'mixed chains > optional computed then optional member',
    "() => {\n  const obj = { items: [{ name: 'first' }] };\n  expect(obj?.items?.[0]?.name).toBe('first');\n  expect(obj?.items?.[99]?.name).toBe(undefined);\n}",
    "() => {\n  var _obj$items, _obj$items2;\n  const obj = { items: [{ name: 'first' }] };\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$items = obj.items) === null ||\n      _obj$items === void 0 ||\n      (_obj$items = _obj$items[0]) === null ||\n      _obj$items === void 0\n      ? void 0\n      : _obj$items.name,\n  ).toBe('first');\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$items2 = obj.items) === null ||\n      _obj$items2 === void 0 ||\n      (_obj$items2 = _obj$items2[99]) === null ||\n      _obj$items2 === void 0\n      ? void 0\n      : _obj$items2.name,\n  ).toBe(undefined);\n};",
  ],
  [
    'with classes > optional access on class instance',
    "() => {\n  class User {\n    constructor(name) {\n      this.name = name;\n    }\n    greet() {\n      return 'Hi, ' + this.name;\n    }\n  }\n  const user = new User('Alice');\n  expect(user?.name).toBe('Alice');\n  expect(user?.greet()).toBe('Hi, Alice');\n}",
    "() => {\n  class User {\n    constructor(name) {\n      this.name = name;\n    }\n    greet() {\n      return 'Hi, ' + this.name;\n    }\n  }\n  const user = new User('Alice');\n  expect(user === null || user === void 0 ? void 0 : user.name).toBe('Alice');\n  expect(user === null || user === void 0 ? void 0 : user.greet()).toBe('Hi, Alice');\n};",
  ],
  [
    'with classes > optional access on null instance',
    '() => {\n  const user = null;\n  expect(user?.name).toBe(undefined);\n  expect(user?.greet?.()).toBe(undefined);\n}',
    '() => {\n  var _user$greet;\n  const user = null;\n  expect(user === null || user === void 0 ? void 0 : user.name).toBe(undefined);\n  expect(\n    user === null ||\n      user === void 0 ||\n      (_user$greet = user.greet) === null ||\n      _user$greet === void 0\n      ? void 0\n      : _user$greet.call(user),\n  ).toBe(undefined);\n};',
  ],
  [
    'with classes > optional access on inherited method',
    "() => {\n  class Animal {\n    speak() {\n      return 'generic';\n    }\n  }\n  class Dog extends Animal {\n    speak() {\n      return 'woof';\n    }\n  }\n  const d = new Dog();\n  expect(d?.speak()).toBe('woof');\n  const n = null;\n  expect(n?.speak?.()).toBe(undefined);\n}",
    "() => {\n  var _n$speak;\n  class Animal {\n    speak() {\n      return 'generic';\n    }\n  }\n  class Dog extends Animal {\n    speak() {\n      return 'woof';\n    }\n  }\n  const d = new Dog();\n  expect(d === null || d === void 0 ? void 0 : d.speak()).toBe('woof');\n  const n = null;\n  expect(\n    n === null || n === void 0 || (_n$speak = n.speak) === null || _n$speak === void 0\n      ? void 0\n      : _n$speak.call(n),\n  ).toBe(undefined);\n};",
  ],
  [
    'with classes > optional access on static method',
    "() => {\n  class Utils {\n    static parse(s) {\n      return parseInt(s, 10);\n    }\n  }\n  expect(Utils?.parse('42')).toBe(42);\n  const Cls = null;\n  expect(Cls?.parse?.('42')).toBe(undefined);\n}",
    "() => {\n  var _Cls$parse;\n  class Utils {\n    static parse(s) {\n      return parseInt(s, 10);\n    }\n  }\n  expect(Utils === null || Utils === void 0 ? void 0 : Utils.parse('42')).toBe(42);\n  const Cls = null;\n  expect(\n    Cls === null || Cls === void 0 || (_Cls$parse = Cls.parse) === null || _Cls$parse === void 0\n      ? void 0\n      : _Cls$parse.call(Cls, '42'),\n  ).toBe(undefined);\n};",
  ],
  [
    'with classes > optional access on getter',
    '() => {\n  class Box {\n    #val;\n    constructor(v) {\n      this.#val = v;\n    }\n    get value() {\n      return this.#val;\n    }\n  }\n  const box = new Box(42);\n  expect(box?.value).toBe(42);\n  const empty = null;\n  expect(empty?.value).toBe(undefined);\n}',
    '() => {\n  class Box {\n    #val;\n    constructor(v) {\n      this.#val = v;\n    }\n    get value() {\n      return this.#val;\n    }\n  }\n  const box = new Box(42);\n  expect(box === null || box === void 0 ? void 0 : box.value).toBe(42);\n  const empty = null;\n  expect(empty === null || empty === void 0 ? void 0 : empty.value).toBe(undefined);\n};',
  ],
  [
    'with various types as base > number base',
    "() => {\n  const n = 42;\n  expect(n?.toFixed(2)).toBe('42.00');\n  expect(n?.toString()).toBe('42');\n}",
    "() => {\n  const n = 42;\n  expect(n === null || n === void 0 ? void 0 : n.toFixed(2)).toBe('42.00');\n  expect(n === null || n === void 0 ? void 0 : n.toString()).toBe('42');\n};",
  ],
  [
    'with various types as base > string base',
    "() => {\n  const s = 'hello';\n  expect(s?.length).toBe(5);\n  expect(s?.toUpperCase()).toBe('HELLO');\n  expect(s?.[0]).toBe('h');\n}",
    "() => {\n  const s = 'hello';\n  expect(s === null || s === void 0 ? void 0 : s.length).toBe(5);\n  expect(s === null || s === void 0 ? void 0 : s.toUpperCase()).toBe('HELLO');\n  expect(s === null || s === void 0 ? void 0 : s[0]).toBe('h');\n};",
  ],
  [
    'with various types as base > boolean base',
    "() => {\n  const b = true;\n  expect(b?.toString()).toBe('true');\n}",
    "() => {\n  const b = true;\n  expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('true');\n};",
  ],
  [
    'with various types as base > symbol base',
    "() => {\n  const s = Symbol('test');\n  expect(s?.toString()).toBe('Symbol(test)');\n  expect(s?.description).toBe('test');\n}",
    "() => {\n  const s = Symbol('test');\n  expect(s === null || s === void 0 ? void 0 : s.toString()).toBe('Symbol(test)');\n  expect(s === null || s === void 0 ? void 0 : s.description).toBe('test');\n};",
  ],
  [
    'with various types as base > bigint base',
    "() => {\n  const b = BigInt(42);\n  expect(b?.toString()).toBe('42');\n}",
    "() => {\n  const b = BigInt(42);\n  expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('42');\n};",
  ],
  [
    'with various types as base > array base',
    '() => {\n  const arr = [1, 2, 3];\n  expect(arr?.length).toBe(3);\n  expect(arr?.map((x) => x * 2)).toEqual([2, 4, 6]);\n  expect(arr?.[2]).toBe(3);\n}',
    '() => {\n  const arr = [1, 2, 3];\n  expect(arr === null || arr === void 0 ? void 0 : arr.length).toBe(3);\n  expect(arr === null || arr === void 0 ? void 0 : arr.map(x => x * 2)).toEqual([2, 4, 6]);\n  expect(arr === null || arr === void 0 ? void 0 : arr[2]).toBe(3);\n};',
  ],
  [
    'with various types as base > function base',
    "() => {\n  const fn = (x) => x * 2;\n  expect(fn?.name).toBe('fn');\n  expect(fn?.length).toBe(1);\n  expect(fn?.(5)).toBe(10);\n}",
    "() => {\n  const fn = x => x * 2;\n  expect(fn === null || fn === void 0 ? void 0 : fn.name).toBe('fn');\n  expect(fn === null || fn === void 0 ? void 0 : fn.length).toBe(1);\n  expect(fn === null || fn === void 0 ? void 0 : fn(5)).toBe(10);\n};",
  ],
  [
    'with various types as base > regex base',
    "() => {\n  const re = /test/i;\n  expect(re?.test('TEST')).toBe(true);\n  expect(re?.flags).toBe('i');\n}",
    "() => {\n  const re = /test/i;\n  expect(re === null || re === void 0 ? void 0 : re.test('TEST')).toBe(true);\n  expect(re === null || re === void 0 ? void 0 : re.flags).toBe('i');\n};",
  ],
  [
    'with destructuring > result of optional chain in destructuring default',
    "() => {\n  const obj = null;\n  const { a = obj?.b ?? 'default' } = {};\n  expect(a).toBe('default');\n}",
    "() => {\n  const obj = null;\n  const { a = (obj === null || obj === void 0 ? void 0 : obj.b) ?? 'default' } = {};\n  expect(a).toBe('default');\n};",
  ],
  [
    'with destructuring > optional chain inside destructured value',
    "() => {\n  const data = { user: { address: { city: 'NYC' } } };\n  const city = data?.user?.address?.city;\n  expect(city).toBe('NYC');\n}",
    "() => {\n  var _data$user;\n  const data = { user: { address: { city: 'NYC' } } };\n  const city =\n    data === null ||\n    data === void 0 ||\n    (_data$user = data.user) === null ||\n    _data$user === void 0 ||\n    (_data$user = _data$user.address) === null ||\n    _data$user === void 0\n      ? void 0\n      : _data$user.city;\n  expect(city).toBe('NYC');\n};",
  ],
  [
    'with destructuring > optional chain result destructured',
    '() => {\n  const obj = { coords: { x: 10, y: 20 } };\n  const { x, y } = obj?.coords ?? {};\n  expect(x).toBe(10);\n  expect(y).toBe(20);\n}',
    '() => {\n  const obj = {\n    coords: {\n      x: 10,\n      y: 20,\n    },\n  };\n  const { x, y } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};\n  expect(x).toBe(10);\n  expect(y).toBe(20);\n};',
  ],
  [
    'with destructuring > null base with destructure fallback',
    '() => {\n  const obj = null;\n  const { x = 0, y = 0 } = obj?.coords ?? {};\n  expect(x).toBe(0);\n  expect(y).toBe(0);\n}',
    '() => {\n  const obj = null;\n  const { x = 0, y = 0 } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};\n  expect(x).toBe(0);\n  expect(y).toBe(0);\n};',
  ],
  [
    'with async/await > optional chain on async function result',
    'async () => {\n  const fetchData = async () => ({ value: 42 });\n  const result = await fetchData();\n  expect(result?.value).toBe(42);\n}',
    'async () => {\n  const fetchData = async () => ({ value: 42 });\n  const result = await fetchData();\n  expect(result === null || result === void 0 ? void 0 : result.value).toBe(42);\n};',
  ],
  [
    'with async/await > optional chain on null async result',
    'async () => {\n  const fetchData = async () => null;\n  const result = await fetchData();\n  expect(result?.value).toBe(undefined);\n}',
    'async () => {\n  const fetchData = async () => null;\n  const result = await fetchData();\n  expect(result === null || result === void 0 ? void 0 : result.value).toBe(undefined);\n};',
  ],
  [
    'with async/await > optional call on async method',
    "async () => {\n  const obj = {\n    async getData() {\n      return 'data';\n    },\n  };\n  const result = await obj?.getData();\n  expect(result).toBe('data');\n}",
    "async () => {\n  const obj = {\n    async getData() {\n      return 'data';\n    },\n  };\n  const result = await (obj === null || obj === void 0 ? void 0 : obj.getData());\n  expect(result).toBe('data');\n};",
  ],
  [
    'with async/await > optional call on null async method',
    'async () => {\n  const obj = {};\n  const result = await obj?.getData?.();\n  expect(result).toBe(undefined);\n}',
    'async () => {\n  var _obj$getData;\n  const obj = {};\n  const result = await (obj === null ||\n  obj === void 0 ||\n  (_obj$getData = obj.getData) === null ||\n  _obj$getData === void 0\n    ? void 0\n    : _obj$getData.call(obj));\n  expect(result).toBe(undefined);\n};',
  ],
  [
    'with Map, Set, and WeakMap > optional method call on Map',
    "() => {\n  const map = new Map([['key', 'value']]);\n  expect(map?.get('key')).toBe('value');\n  expect(map?.get('missing')).toBe(undefined);\n}",
    "() => {\n  const map = new Map([['key', 'value']]);\n  expect(map === null || map === void 0 ? void 0 : map.get('key')).toBe('value');\n  expect(map === null || map === void 0 ? void 0 : map.get('missing')).toBe(undefined);\n};",
  ],
  [
    'with Map, Set, and WeakMap > optional on null Map',
    "() => {\n  const map = null;\n  expect(map?.get?.('key')).toBe(undefined);\n}",
    "() => {\n  var _map$get;\n  const map = null;\n  expect(\n    map === null || map === void 0 || (_map$get = map.get) === null || _map$get === void 0\n      ? void 0\n      : _map$get.call(map, 'key'),\n  ).toBe(undefined);\n};",
  ],
  [
    'with Map, Set, and WeakMap > optional on Set',
    '() => {\n  const set = new Set([1, 2, 3]);\n  expect(set?.has(2)).toBe(true);\n  expect(set?.has(4)).toBe(false);\n  expect(set?.size).toBe(3);\n}',
    '() => {\n  const set = new Set([1, 2, 3]);\n  expect(set === null || set === void 0 ? void 0 : set.has(2)).toBe(true);\n  expect(set === null || set === void 0 ? void 0 : set.has(4)).toBe(false);\n  expect(set === null || set === void 0 ? void 0 : set.size).toBe(3);\n};',
  ],
  [
    'with Map, Set, and WeakMap > optional on WeakMap',
    "() => {\n  const wm = new WeakMap();\n  const key = {};\n  wm.set(key, 'val');\n  expect(wm?.get(key)).toBe('val');\n}",
    "() => {\n  const wm = new WeakMap();\n  const key = {};\n  wm.set(key, 'val');\n  expect(wm === null || wm === void 0 ? void 0 : wm.get(key)).toBe('val');\n};",
  ],
  [
    'edge cases > optional chaining on result of typeof',
    '() => {\n  // typeof always returns a string\n  const result = (typeof undefined)?.length;\n  expect(result).toBe(9); // "undefined".length\n}',
    '() => {\n  var _undefined;\n  // typeof always returns a string\n  const result =\n    (_undefined = typeof undefined) === null || _undefined === void 0 ? void 0 : _undefined.length;\n  expect(result).toBe(9);\n};',
  ],
  [
    'edge cases > deeply nested with all nullish',
    '() => {\n  const obj = null;\n  expect(obj?.a?.b?.c?.d?.e?.f?.g?.h).toBe(undefined);\n}',
    '() => {\n  var _obj$a;\n  const obj = null;\n  expect(\n    obj === null ||\n      obj === void 0 ||\n      (_obj$a = obj.a) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.b) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.c) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.d) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.e) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.f) === null ||\n      _obj$a === void 0 ||\n      (_obj$a = _obj$a.g) === null ||\n      _obj$a === void 0\n      ? void 0\n      : _obj$a.h,\n  ).toBe(undefined);\n};',
  ],
  [
    'edge cases > optional chaining in template literal',
    "() => {\n  const obj = null;\n  const result = `value: ${obj?.foo ?? 'none'}`;\n  expect(result).toBe('value: none');\n}",
    "() => {\n  const obj = null;\n  const result = `value: ${(obj === null || obj === void 0 ? void 0 : obj.foo) ?? 'none'}`;\n  expect(result).toBe('value: none');\n};",
  ],
  [
    'edge cases > optional chaining with spread',
    '() => {\n  const obj = { arr: [1, 2, 3] };\n  const result = [...(obj?.arr ?? [])];\n  expect(result).toEqual([1, 2, 3]);\n\n  const nul = null;\n  const result2 = [...(nul?.arr ?? [])];\n  expect(result2).toEqual([]);\n}',
    '() => {\n  const obj = { arr: [1, 2, 3] };\n  const result = [...((obj === null || obj === void 0 ? void 0 : obj.arr) ?? [])];\n  expect(result).toEqual([1, 2, 3]);\n  const nul = null;\n  const result2 = [...((nul === null || nul === void 0 ? void 0 : nul.arr) ?? [])];\n  expect(result2).toEqual([]);\n};',
  ],
  [
    'edge cases > chained optional calls',
    '() => {\n  const fn = () => () => () => 42;\n  expect(fn?.()?.()?.()).toBe(42);\n}',
    '() => {\n  var _fn, _fn$call;\n  const fn = () => () => () => 42;\n  expect(\n    fn === null ||\n      fn === void 0 ||\n      (_fn = fn()) === null ||\n      _fn === void 0 ||\n      (_fn$call = _fn.call(fn)) === null ||\n      _fn$call === void 0\n      ? void 0\n      : _fn$call.call(_fn),\n  ).toBe(42);\n};',
  ],
  [
    'edge cases > chained optional calls with null',
    '() => {\n  const fn = () => () => null;\n  expect(fn?.()?.()?.()).toBe(undefined);\n}',
    '() => {\n  var _fn, _fn$call;\n  const fn = () => () => null;\n  expect(\n    fn === null ||\n      fn === void 0 ||\n      (_fn = fn()) === null ||\n      _fn === void 0 ||\n      (_fn$call = _fn.call(fn)) === null ||\n      _fn$call === void 0\n      ? void 0\n      : _fn$call.call(_fn),\n  ).toBe(undefined);\n};',
  ],
  [
    'edge cases > optional on Map.prototype.get result',
    "() => {\n  const map = new Map();\n  map.set('user', { name: 'Alice' });\n  expect(map.get('user')?.name).toBe('Alice');\n  expect(map.get('missing')?.name).toBe(undefined);\n}",
    "() => {\n  var _map$get, _map$get2;\n  const map = new Map();\n  map.set('user', { name: 'Alice' });\n  expect(\n    (_map$get = map.get('user')) === null || _map$get === void 0 ? void 0 : _map$get.name,\n  ).toBe('Alice');\n  expect(\n    (_map$get2 = map.get('missing')) === null || _map$get2 === void 0 ? void 0 : _map$get2.name,\n  ).toBe(undefined);\n};",
  ],
  [
    'edge cases > optional chaining preserves object identity',
    '() => {\n  const inner = { value: 42 };\n  const obj = { inner };\n  expect(obj?.inner).toBe(inner);\n}',
    '() => {\n  const inner = { value: 42 };\n  const obj = { inner };\n  expect(obj === null || obj === void 0 ? void 0 : obj.inner).toBe(inner);\n};',
  ],
  [
    'edge cases > parenthesized optional chain',
    '() => {\n  const obj = { a: { b: 42 } };\n  expect(obj?.a?.b).toBe(42);\n  const nul = null;\n  expect(nul?.a?.b).toBe(undefined);\n}',
    '() => {\n  var _obj$a, _nul$a;\n  const obj = { a: { b: 42 } };\n  expect(\n    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n      ? void 0\n      : _obj$a.b,\n  ).toBe(42);\n  const nul = null;\n  expect(\n    nul === null || nul === void 0 || (_nul$a = nul.a) === null || _nul$a === void 0\n      ? void 0\n      : _nul$a.b,\n  ).toBe(undefined);\n};',
  ],
  [
    'edge cases > optional chaining with comma operator',
    '() => {\n  const obj = { a: 1 };\n  const result = (0, obj)?.a;\n  expect(result).toBe(1);\n}',
    '() => {\n  var _ref;\n  const obj = { a: 1 };\n  const result = (_ref = (0, obj)) === null || _ref === void 0 ? void 0 : _ref.a;\n  expect(result).toBe(1);\n};',
  ],
  [
    'practical patterns > safe nested config access',
    "() => {\n  const config = {\n    database: {\n      connection: {\n        host: 'localhost',\n        port: 5432,\n      },\n    },\n  };\n  expect(config?.database?.connection?.host).toBe('localhost');\n  expect(config?.database?.connection?.ssl).toBe(undefined);\n  expect(config?.cache?.redis?.host).toBe(undefined);\n}",
    "() => {\n  var _config$database, _config$database2, _config$cache;\n  const config = {\n    database: {\n      connection: {\n        host: 'localhost',\n        port: 5432,\n      },\n    },\n  };\n  expect(\n    config === null ||\n      config === void 0 ||\n      (_config$database = config.database) === null ||\n      _config$database === void 0 ||\n      (_config$database = _config$database.connection) === null ||\n      _config$database === void 0\n      ? void 0\n      : _config$database.host,\n  ).toBe('localhost');\n  expect(\n    config === null ||\n      config === void 0 ||\n      (_config$database2 = config.database) === null ||\n      _config$database2 === void 0 ||\n      (_config$database2 = _config$database2.connection) === null ||\n      _config$database2 === void 0\n      ? void 0\n      : _config$database2.ssl,\n  ).toBe(undefined);\n  expect(\n    config === null ||\n      config === void 0 ||\n      (_config$cache = config.cache) === null ||\n      _config$cache === void 0 ||\n      (_config$cache = _config$cache.redis) === null ||\n      _config$cache === void 0\n      ? void 0\n      : _config$cache.host,\n  ).toBe(undefined);\n};",
  ],
  [
    'practical patterns > safe event handler invocation',
    '() => {\n  let called = false;\n  const props = {\n    onPress: () => {\n      called = true;\n    },\n  };\n  props?.onPress?.();\n  expect(called).toBe(true);\n\n  const emptyProps = {};\n  emptyProps?.onPress?.();\n  // No error thrown\n  expect(true).toBe(true);\n}',
    '() => {\n  var _props$onPress, _emptyProps$onPress;\n  let called = false;\n  const props = {\n    onPress: () => {\n      called = true;\n    },\n  };\n  props === null ||\n  props === void 0 ||\n  (_props$onPress = props.onPress) === null ||\n  _props$onPress === void 0\n    ? void 0\n    : _props$onPress.call(props);\n  expect(called).toBe(true);\n  const emptyProps = {};\n  emptyProps === null ||\n  emptyProps === void 0 ||\n  (_emptyProps$onPress = emptyProps.onPress) === null ||\n  _emptyProps$onPress === void 0\n    ? void 0\n    : _emptyProps$onPress.call(emptyProps);\n  // No error thrown\n  expect(true).toBe(true);\n};',
  ],
  [
    'practical patterns > safe array element access',
    '() => {\n  const matrix = [\n    [1, 2],\n    [3, 4],\n  ];\n  expect(matrix?.[0]?.[1]).toBe(2);\n  expect(matrix?.[5]?.[0]).toBe(undefined);\n}',
    '() => {\n  var _matrix$, _matrix$2;\n  const matrix = [\n    [1, 2],\n    [3, 4],\n  ];\n  expect(\n    matrix === null || matrix === void 0 || (_matrix$ = matrix[0]) === null || _matrix$ === void 0\n      ? void 0\n      : _matrix$[1],\n  ).toBe(2);\n  expect(\n    matrix === null || matrix === void 0 || (_matrix$2 = matrix[5]) === null || _matrix$2 === void 0\n      ? void 0\n      : _matrix$2[0],\n  ).toBe(undefined);\n};',
  ],
  [
    'practical patterns > optional chaining in reduce',
    "() => {\n  const items = [\n    { category: { name: 'A' }, value: 1 },\n    { category: null, value: 2 },\n    { category: { name: 'B' }, value: 3 },\n  ];\n  const categories = items.map((item) => item.category?.name ?? 'Unknown');\n  expect(categories).toEqual(['A', 'Unknown', 'B']);\n}",
    "() => {\n  const items = [\n    {\n      category: { name: 'A' },\n      value: 1,\n    },\n    {\n      category: null,\n      value: 2,\n    },\n    {\n      category: { name: 'B' },\n      value: 3,\n    },\n  ];\n  const categories = items.map(item => {\n    var _item$category;\n    return (\n      ((_item$category = item.category) === null || _item$category === void 0\n        ? void 0\n        : _item$category.name) ?? 'Unknown'\n    );\n  });\n  expect(categories).toEqual(['A', 'Unknown', 'B']);\n};",
  ],
  [
    'practical patterns > JSON response navigation',
    "() => {\n  const response = {\n    data: {\n      users: [\n        { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },\n        { profile: { avatar: null } },\n        { profile: null },\n      ],\n    },\n  };\n  expect(response.data?.users?.[0]?.profile?.avatar?.url).toBe(\n    'https://example.com/photo.jpg'\n  );\n  expect(response.data?.users?.[1]?.profile?.avatar?.url).toBe(undefined);\n  expect(response.data?.users?.[2]?.profile?.avatar?.url).toBe(undefined);\n  expect(response.data?.users?.[99]?.profile?.avatar?.url).toBe(undefined);\n}",
    "() => {\n  var _response$data, _response$data2, _response$data3, _response$data4;\n  const response = {\n    data: {\n      users: [\n        { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },\n        { profile: { avatar: null } },\n        { profile: null },\n      ],\n    },\n  };\n  expect(\n    (_response$data = response.data) === null ||\n      _response$data === void 0 ||\n      (_response$data = _response$data.users) === null ||\n      _response$data === void 0 ||\n      (_response$data = _response$data[0]) === null ||\n      _response$data === void 0 ||\n      (_response$data = _response$data.profile) === null ||\n      _response$data === void 0 ||\n      (_response$data = _response$data.avatar) === null ||\n      _response$data === void 0\n      ? void 0\n      : _response$data.url,\n  ).toBe('https://example.com/photo.jpg');\n  expect(\n    (_response$data2 = response.data) === null ||\n      _response$data2 === void 0 ||\n      (_response$data2 = _response$data2.users) === null ||\n      _response$data2 === void 0 ||\n      (_response$data2 = _response$data2[1]) === null ||\n      _response$data2 === void 0 ||\n      (_response$data2 = _response$data2.profile) === null ||\n      _response$data2 === void 0 ||\n      (_response$data2 = _response$data2.avatar) === null ||\n      _response$data2 === void 0\n      ? void 0\n      : _response$data2.url,\n  ).toBe(undefined);\n  expect(\n    (_response$data3 = response.data) === null ||\n      _response$data3 === void 0 ||\n      (_response$data3 = _response$data3.users) === null ||\n      _response$data3 === void 0 ||\n      (_response$data3 = _response$data3[2]) === null ||\n      _response$data3 === void 0 ||\n      (_response$data3 = _response$data3.profile) === null ||\n      _response$data3 === void 0 ||\n      (_response$data3 = _response$data3.avatar) === null ||\n      _response$data3 === void 0\n      ? void 0\n      : _response$data3.url,\n  ).toBe(undefined);\n  expect(\n    (_response$data4 = response.data) === null ||\n      _response$data4 === void 0 ||\n      (_response$data4 = _response$data4.users) === null ||\n      _response$data4 === void 0 ||\n      (_response$data4 = _response$data4[99]) === null ||\n      _response$data4 === void 0 ||\n      (_response$data4 = _response$data4.profile) === null ||\n      _response$data4 === void 0 ||\n      (_response$data4 = _response$data4.avatar) === null ||\n      _response$data4 === void 0\n      ? void 0\n      : _response$data4.url,\n  ).toBe(undefined);\n};",
  ],
  [
    'practical patterns > safe method chaining pattern',
    "() => {\n  class Builder {\n    #parts = [];\n    add(part) {\n      this.#parts.push(part);\n      return this;\n    }\n    build() {\n      return this.#parts.join(' ');\n    }\n  }\n  const builder = new Builder();\n  const result = builder?.add('hello')?.add('world')?.build();\n  expect(result).toBe('hello world');\n\n  const nullBuilder = null;\n  const nullResult = nullBuilder?.add('hello')?.add('world')?.build();\n  expect(nullResult).toBe(undefined);\n}",
    "() => {\n  var _builder$add, _nullBuilder$add;\n  class Builder {\n    #parts = [];\n    add(part) {\n      this.#parts.push(part);\n      return this;\n    }\n    build() {\n      return this.#parts.join(' ');\n    }\n  }\n  const builder = new Builder();\n  const result =\n    builder === null ||\n    builder === void 0 ||\n    (_builder$add = builder.add('hello')) === null ||\n    _builder$add === void 0 ||\n    (_builder$add = _builder$add.add('world')) === null ||\n    _builder$add === void 0\n      ? void 0\n      : _builder$add.build();\n  expect(result).toBe('hello world');\n  const nullBuilder = null;\n  const nullResult =\n    nullBuilder === null ||\n    nullBuilder === void 0 ||\n    (_nullBuilder$add = nullBuilder.add('hello')) === null ||\n    _nullBuilder$add === void 0 ||\n    (_nullBuilder$add = _nullBuilder$add.add('world')) === null ||\n    _nullBuilder$add === void 0\n      ? void 0\n      : _nullBuilder$add.build();\n  expect(nullResult).toBe(undefined);\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
