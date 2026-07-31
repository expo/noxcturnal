import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      nullishCoalescingOperator: {
        loose: false,
      },
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'basic semantics > returns left side when not null or undefined',
    "() => {\n  expect('hello' ?? 'default').toBe('hello');\n  expect(42 ?? 0).toBe(42);\n  expect(true ?? false).toBe(true);\n}",
    "() => {\n  var _hello, _, _true;\n  expect((_hello = 'hello') !== null && _hello !== void 0 ? _hello : 'default').toBe('hello');\n  expect((_ = 42) !== null && _ !== void 0 ? _ : 0).toBe(42);\n  expect((_true = true) !== null && _true !== void 0 ? _true : false).toBe(true);\n};",
  ],
  [
    'basic semantics > returns right side when left is null',
    "() => {\n  expect(null ?? 'default').toBe('default');\n}",
    "() => {\n  var _ref;\n  expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'default').toBe('default');\n};",
  ],
  [
    'basic semantics > returns right side when left is undefined',
    "() => {\n  expect(undefined ?? 'default').toBe('default');\n}",
    "() => {\n  var _undefined;\n  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'default').toBe(\n    'default',\n  );\n};",
  ],
  [
    'basic semantics > returns right side when left is void 0',
    "() => {\n  expect(void 0 ?? 'default').toBe('default');\n}",
    "() => {\n  var _;\n  expect((_ = void 0) !== null && _ !== void 0 ? _ : 'default').toBe('default');\n};",
  ],
  [
    'basic semantics > preserves falsy non-nullish values',
    "() => {\n  expect(0 ?? 'default').toBe(0);\n  expect('' ?? 'default').toBe('');\n  expect(false ?? 'default').toBe(false);\n  expect(NaN ?? 'default').not.toBe('default');\n}",
    "() => {\n  var _, _ref, _false, _NaN;\n  expect((_ = 0) !== null && _ !== void 0 ? _ : 'default').toBe(0);\n  expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'default').toBe('');\n  expect((_false = false) !== null && _false !== void 0 ? _false : 'default').toBe(false);\n  expect((_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'default').not.toBe('default');\n};",
  ],
  [
    'basic semantics > returns -0 without falling through',
    "() => {\n  const result = -0 ?? 'default';\n  expect(result).toBe(-0);\n  expect(1 / result).toBe(-Infinity);\n}",
    "() => {\n  var _;\n  const result = (_ = -0) !== null && _ !== void 0 ? _ : 'default';\n  expect(result).toBe(-0);\n  expect(1 / result).toBe(-Infinity);\n};",
  ],
  [
    'difference from || operator > ?? keeps 0, || does not',
    "() => {\n  expect(0 ?? 'fallback').toBe(0);\n  expect(0 || 'fallback').toBe('fallback');\n}",
    "() => {\n  var _;\n  expect((_ = 0) !== null && _ !== void 0 ? _ : 'fallback').toBe(0);\n  expect(0 || 'fallback').toBe('fallback');\n};",
  ],
  [
    'difference from || operator > ?? keeps empty string, || does not',
    "() => {\n  expect('' ?? 'fallback').toBe('');\n  expect('' || 'fallback').toBe('fallback');\n}",
    "() => {\n  var _ref;\n  expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'fallback').toBe('');\n  expect('' || 'fallback').toBe('fallback');\n};",
  ],
  [
    'difference from || operator > ?? keeps false, || does not',
    "() => {\n  expect(false ?? 'fallback').toBe(false);\n  expect(false || 'fallback').toBe('fallback');\n}",
    "() => {\n  var _false;\n  expect((_false = false) !== null && _false !== void 0 ? _false : 'fallback').toBe(false);\n  expect(false || 'fallback').toBe('fallback');\n};",
  ],
  [
    'difference from || operator > ?? keeps NaN, || does not',
    "() => {\n  const qqResult = NaN ?? 'fallback';\n  const orResult = NaN || 'fallback';\n  expect(typeof qqResult).toBe('number');\n  expect(orResult).toBe('fallback');\n}",
    "() => {\n  var _NaN;\n  const qqResult = (_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'fallback';\n  const orResult = NaN || 'fallback';\n  expect(typeof qqResult).toBe('number');\n  expect(orResult).toBe('fallback');\n};",
  ],
  [
    'difference from || operator > both fall through on null',
    "() => {\n  expect(null ?? 'fallback').toBe('fallback');\n  expect(null || 'fallback').toBe('fallback');\n}",
    "() => {\n  var _ref;\n  expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'fallback').toBe('fallback');\n  expect(null || 'fallback').toBe('fallback');\n};",
  ],
  [
    'difference from || operator > both fall through on undefined',
    "() => {\n  expect(undefined ?? 'fallback').toBe('fallback');\n  expect(undefined || 'fallback').toBe('fallback');\n}",
    "() => {\n  var _undefined;\n  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'fallback').toBe(\n    'fallback',\n  );\n  expect(undefined || 'fallback').toBe('fallback');\n};",
  ],
  [
    'chaining > multiple ?? operators',
    "() => {\n  expect(null ?? undefined ?? 'found').toBe('found');\n}",
    "() => {\n  var _ref, _ref2;\n  expect(\n    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : undefined) !== null &&\n      _ref !== void 0\n      ? _ref\n      : 'found',\n  ).toBe('found');\n};",
  ],
  [
    'chaining > first non-nullish wins in chain',
    "() => {\n  expect(null ?? 0 ?? 'fallback').toBe(0);\n}",
    "() => {\n  var _ref, _ref2;\n  expect(\n    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : 0) !== null && _ref !== void 0\n      ? _ref\n      : 'fallback',\n  ).toBe(0);\n};",
  ],
  [
    'chaining > all null/undefined falls through to last',
    "() => {\n  expect(null ?? undefined ?? null ?? 'end').toBe('end');\n}",
    "() => {\n  var _ref, _ref2, _ref3;\n  expect(\n    (_ref =\n      (_ref2 = (_ref3 = null) !== null && _ref3 !== void 0 ? _ref3 : undefined) !== null &&\n      _ref2 !== void 0\n        ? _ref2\n        : null) !== null && _ref !== void 0\n      ? _ref\n      : 'end',\n  ).toBe('end');\n};",
  ],
  [
    'chaining > first value returned if not nullish',
    "() => {\n  expect('first' ?? 'second' ?? 'third').toBe('first');\n}",
    "() => {\n  var _ref, _first;\n  expect(\n    (_ref = (_first = 'first') !== null && _first !== void 0 ? _first : 'second') !== null &&\n      _ref !== void 0\n      ? _ref\n      : 'third',\n  ).toBe('first');\n};",
  ],
  [
    'chaining > chain with false',
    "() => {\n  expect(null ?? false ?? 'fallback').toBe(false);\n}",
    "() => {\n  var _ref, _ref2;\n  expect(\n    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : false) !== null && _ref !== void 0\n      ? _ref\n      : 'fallback',\n  ).toBe(false);\n};",
  ],
  [
    'with member expressions > property access on object',
    "() => {\n  const obj = { foo: 'bar' };\n  expect(obj.foo ?? 'default').toBe('bar');\n}",
    "() => {\n  var _obj$foo;\n  const obj = { foo: 'bar' };\n  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe('bar');\n};",
  ],
  [
    'with member expressions > missing property returns default',
    "() => {\n  const obj = {};\n  expect(obj.foo ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$foo;\n  const obj = {};\n  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(\n    'default',\n  );\n};",
  ],
  [
    'with member expressions > null property value returns default',
    "() => {\n  const obj = { foo: null };\n  expect(obj.foo ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$foo;\n  const obj = { foo: null };\n  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(\n    'default',\n  );\n};",
  ],
  [
    'with member expressions > falsy property value is preserved',
    "() => {\n  const obj = { count: 0, name: '', active: false };\n  expect(obj.count ?? 99).toBe(0);\n  expect(obj.name ?? 'anonymous').toBe('');\n  expect(obj.active ?? true).toBe(false);\n}",
    "() => {\n  var _obj$count, _obj$name, _obj$active;\n  const obj = {\n    count: 0,\n    name: '',\n    active: false,\n  };\n  expect((_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : 99).toBe(0);\n  expect((_obj$name = obj.name) !== null && _obj$name !== void 0 ? _obj$name : 'anonymous').toBe(\n    '',\n  );\n  expect((_obj$active = obj.active) !== null && _obj$active !== void 0 ? _obj$active : true).toBe(\n    false,\n  );\n};",
  ],
  [
    'with member expressions > nested property access',
    "() => {\n  const obj = { a: { b: { c: null } } };\n  expect(obj.a.b.c ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$a$b$c;\n  const obj = { a: { b: { c: null } } };\n  expect((_obj$a$b$c = obj.a.b.c) !== null && _obj$a$b$c !== void 0 ? _obj$a$b$c : 'default').toBe(\n    'default',\n  );\n};",
  ],
  [
    'with member expressions > computed property access',
    "() => {\n  const obj = { key: 'value' };\n  const key = 'key';\n  expect(obj[key] ?? 'default').toBe('value');\n  expect(obj['missing'] ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$key, _obj$missing;\n  const obj = { key: 'value' };\n  const key = 'key';\n  expect((_obj$key = obj[key]) !== null && _obj$key !== void 0 ? _obj$key : 'default').toBe(\n    'value',\n  );\n  expect(\n    (_obj$missing = obj['missing']) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'with member expressions > array element access',
    "() => {\n  const arr = [1, null, undefined, 0];\n  expect(arr[0] ?? 'default').toBe(1);\n  expect(arr[1] ?? 'default').toBe('default');\n  expect(arr[2] ?? 'default').toBe('default');\n  expect(arr[3] ?? 'default').toBe(0);\n  expect(arr[99] ?? 'default').toBe('default');\n}",
    "() => {\n  var _arr$, _arr$2, _arr$3, _arr$4, _arr$5;\n  const arr = [1, null, undefined, 0];\n  expect((_arr$ = arr[0]) !== null && _arr$ !== void 0 ? _arr$ : 'default').toBe(1);\n  expect((_arr$2 = arr[1]) !== null && _arr$2 !== void 0 ? _arr$2 : 'default').toBe('default');\n  expect((_arr$3 = arr[2]) !== null && _arr$3 !== void 0 ? _arr$3 : 'default').toBe('default');\n  expect((_arr$4 = arr[3]) !== null && _arr$4 !== void 0 ? _arr$4 : 'default').toBe(0);\n  expect((_arr$5 = arr[99]) !== null && _arr$5 !== void 0 ? _arr$5 : 'default').toBe('default');\n};",
  ],
  [
    'with function calls > function returning null',
    "() => {\n  const fn = () => null;\n  expect(fn() ?? 'default').toBe('default');\n}",
    "() => {\n  var _fn;\n  const fn = () => null;\n  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');\n};",
  ],
  [
    'with function calls > function returning undefined',
    "() => {\n  const fn = () => undefined;\n  expect(fn() ?? 'default').toBe('default');\n}",
    "() => {\n  var _fn;\n  const fn = () => undefined;\n  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');\n};",
  ],
  [
    'with function calls > function returning value',
    "() => {\n  const fn = () => 42;\n  expect(fn() ?? 'default').toBe(42);\n}",
    "() => {\n  var _fn;\n  const fn = () => 42;\n  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe(42);\n};",
  ],
  [
    'with function calls > function returning falsy non-nullish',
    "() => {\n  expect((() => 0)() ?? 'default').toBe(0);\n  expect((() => '')() ?? 'default').toBe('');\n  expect((() => false)() ?? 'default').toBe(false);\n}",
    "() => {\n  var _ref, _ref2, _ref3;\n  expect((_ref = (() => 0)()) !== null && _ref !== void 0 ? _ref : 'default').toBe(0);\n  expect((_ref2 = (() => '')()) !== null && _ref2 !== void 0 ? _ref2 : 'default').toBe('');\n  expect((_ref3 = (() => false)()) !== null && _ref3 !== void 0 ? _ref3 : 'default').toBe(false);\n};",
  ],
  [
    'with function calls > left side evaluated only once',
    "() => {\n  let count = 0;\n  const fn = () => {\n    count++;\n    return null;\n  };\n  fn() ?? 'default';\n  expect(count).toBe(1);\n}",
    "() => {\n  var _fn;\n  let count = 0;\n  const fn = () => {\n    count++;\n    return null;\n  };\n  (_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default';\n  expect(count).toBe(1);\n};",
  ],
  [
    'with function calls > right side not evaluated when left is non-nullish',
    "() => {\n  let evaluated = false;\n  const right = () => {\n    evaluated = true;\n    return 'right';\n  };\n  'left' ?? right();\n  expect(evaluated).toBe(false);\n}",
    "() => {\n  var _left;\n  let evaluated = false;\n  const right = () => {\n    evaluated = true;\n    return 'right';\n  };\n  (_left = 'left') !== null && _left !== void 0 ? _left : right();\n  expect(evaluated).toBe(false);\n};",
  ],
  [
    'with function calls > right side evaluated when left is nullish',
    "() => {\n  let evaluated = false;\n  const right = () => {\n    evaluated = true;\n    return 'right';\n  };\n  const result = null ?? right();\n  expect(evaluated).toBe(true);\n  expect(result).toBe('right');\n}",
    "() => {\n  var _ref;\n  let evaluated = false;\n  const right = () => {\n    evaluated = true;\n    return 'right';\n  };\n  const result = (_ref = null) !== null && _ref !== void 0 ? _ref : right();\n  expect(evaluated).toBe(true);\n  expect(result).toBe('right');\n};",
  ],
  [
    'short-circuit evaluation > does not evaluate right side when left is 0',
    "() => {\n  let sideEffect = false;\n  const result = 0 ?? ((sideEffect = true), 'fallback');\n  expect(result).toBe(0);\n  expect(sideEffect).toBe(false);\n}",
    "() => {\n  var _;\n  let sideEffect = false;\n  const result = (_ = 0) !== null && _ !== void 0 ? _ : ((sideEffect = true), 'fallback');\n  expect(result).toBe(0);\n  expect(sideEffect).toBe(false);\n};",
  ],
  [
    'short-circuit evaluation > does not evaluate right side when left is empty string',
    "() => {\n  let sideEffect = false;\n  const result = '' ?? ((sideEffect = true), 'fallback');\n  expect(result).toBe('');\n  expect(sideEffect).toBe(false);\n}",
    "() => {\n  var _ref;\n  let sideEffect = false;\n  const result = (_ref = '') !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');\n  expect(result).toBe('');\n  expect(sideEffect).toBe(false);\n};",
  ],
  [
    'short-circuit evaluation > does not evaluate right side when left is false',
    "() => {\n  let sideEffect = false;\n  const result = false ?? ((sideEffect = true), 'fallback');\n  expect(result).toBe(false);\n  expect(sideEffect).toBe(false);\n}",
    "() => {\n  var _false;\n  let sideEffect = false;\n  const result =\n    (_false = false) !== null && _false !== void 0 ? _false : ((sideEffect = true), 'fallback');\n  expect(result).toBe(false);\n  expect(sideEffect).toBe(false);\n};",
  ],
  [
    'short-circuit evaluation > evaluates right side when left is null',
    "() => {\n  let sideEffect = false;\n  const result = null ?? ((sideEffect = true), 'fallback');\n  expect(result).toBe('fallback');\n  expect(sideEffect).toBe(true);\n}",
    "() => {\n  var _ref;\n  let sideEffect = false;\n  const result =\n    (_ref = null) !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');\n  expect(result).toBe('fallback');\n  expect(sideEffect).toBe(true);\n};",
  ],
  [
    'short-circuit evaluation > evaluates right side when left is undefined',
    "() => {\n  let sideEffect = false;\n  const result = undefined ?? ((sideEffect = true), 'fallback');\n  expect(result).toBe('fallback');\n  expect(sideEffect).toBe(true);\n}",
    "() => {\n  var _undefined;\n  let sideEffect = false;\n  const result =\n    (_undefined = undefined) !== null && _undefined !== void 0\n      ? _undefined\n      : ((sideEffect = true), 'fallback');\n  expect(result).toBe('fallback');\n  expect(sideEffect).toBe(true);\n};",
  ],
  [
    'short-circuit evaluation > complex left side evaluated once with side effects',
    "() => {\n  const calls = [];\n  const obj = {\n    get prop() {\n      calls.push('get');\n      return null;\n    },\n  };\n  obj.prop ?? 'default';\n  expect(calls.length).toBe(1);\n}",
    "() => {\n  var _obj$prop;\n  const calls = [];\n  const obj = {\n    get prop() {\n      calls.push('get');\n      return null;\n    },\n  };\n  (_obj$prop = obj.prop) !== null && _obj$prop !== void 0 ? _obj$prop : 'default';\n  expect(calls.length).toBe(1);\n};",
  ],
  [
    'with assignment > assign result to variable',
    '() => {\n  const x = null ?? 42;\n  expect(x).toBe(42);\n}',
    '() => {\n  var _ref;\n  const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 42;\n  expect(x).toBe(42);\n};',
  ],
  [
    'with assignment > assign with non-nullish left',
    '() => {\n  const x = 0 ?? 42;\n  expect(x).toBe(0);\n}',
    '() => {\n  var _;\n  const x = (_ = 0) !== null && _ !== void 0 ? _ : 42;\n  expect(x).toBe(0);\n};',
  ],
  [
    'with assignment > nullish coalescing assignment (??=)',
    "() => {\n  let a = null;\n  a ??= 'default';\n  expect(a).toBe('default');\n}",
    "() => {\n  let a = null;\n  a ??= 'default';\n  expect(a).toBe('default');\n};",
  ],
  [
    'with assignment > ??= does not assign when non-nullish',
    '() => {\n  let a = 0;\n  a ??= 99;\n  expect(a).toBe(0);\n}',
    '() => {\n  let a = 0;\n  a ??= 99;\n  expect(a).toBe(0);\n};',
  ],
  [
    'with assignment > ??= with undefined',
    "() => {\n  let a = undefined;\n  a ??= 'filled';\n  expect(a).toBe('filled');\n}",
    "() => {\n  let a = undefined;\n  a ??= 'filled';\n  expect(a).toBe('filled');\n};",
  ],
  [
    'with assignment > ??= with false',
    '() => {\n  let a = false;\n  a ??= true;\n  expect(a).toBe(false);\n}',
    '() => {\n  let a = false;\n  a ??= true;\n  expect(a).toBe(false);\n};',
  ],
  [
    'with assignment > ??= with empty string',
    "() => {\n  let a = '';\n  a ??= 'nonempty';\n  expect(a).toBe('');\n}",
    "() => {\n  let a = '';\n  a ??= 'nonempty';\n  expect(a).toBe('');\n};",
  ],
  [
    'with assignment > ??= on object property',
    "() => {\n  const obj = { a: null, b: 0 };\n  obj.a ??= 'filled';\n  obj.b ??= 99;\n  expect(obj.a).toBe('filled');\n  expect(obj.b).toBe(0);\n}",
    "() => {\n  const obj = {\n    a: null,\n    b: 0,\n  };\n  obj.a ??= 'filled';\n  obj.b ??= 99;\n  expect(obj.a).toBe('filled');\n  expect(obj.b).toBe(0);\n};",
  ],
  [
    'with various types > object value preserved',
    "() => {\n  const obj = { key: 'value' };\n  expect((obj ?? {}).key).toBe('value');\n}",
    "() => {\n  const obj = { key: 'value' };\n  expect((obj !== null && obj !== void 0 ? obj : {}).key).toBe('value');\n};",
  ],
  [
    'with various types > null falls through to object default',
    "() => {\n  const result = null ?? { key: 'default' };\n  expect(result.key).toBe('default');\n}",
    "() => {\n  var _ref;\n  const result = (_ref = null) !== null && _ref !== void 0 ? _ref : { key: 'default' };\n  expect(result.key).toBe('default');\n};",
  ],
  [
    'with various types > array value preserved',
    '() => {\n  const arr = [1, 2, 3];\n  const result = arr ?? [];\n  expect(result.length).toBe(3);\n}',
    '() => {\n  const arr = [1, 2, 3];\n  const result = arr !== null && arr !== void 0 ? arr : [];\n  expect(result.length).toBe(3);\n};',
  ],
  [
    'with various types > function value preserved',
    '() => {\n  const fn = () => 42;\n  const result = fn ?? (() => 0);\n  expect(result()).toBe(42);\n}',
    '() => {\n  const fn = () => 42;\n  const result = fn !== null && fn !== void 0 ? fn : () => 0;\n  expect(result()).toBe(42);\n};',
  ],
  [
    'with various types > symbol value preserved',
    "() => {\n  const sym = Symbol('test');\n  expect(sym ?? 'fallback').toBe(sym);\n}",
    "() => {\n  const sym = Symbol('test');\n  expect(sym !== null && sym !== void 0 ? sym : 'fallback').toBe(sym);\n};",
  ],
  [
    'with various types > bigint value preserved',
    "() => {\n  const big = BigInt(0);\n  expect(big ?? 'fallback').toBe(big);\n}",
    "() => {\n  const big = BigInt(0);\n  expect(big !== null && big !== void 0 ? big : 'fallback').toBe(big);\n};",
  ],
  [
    'with various types > regex value preserved',
    "() => {\n  const re = /test/;\n  expect(re ?? 'fallback').toBe(re);\n}",
    "() => {\n  const re = /test/;\n  expect(re !== null && re !== void 0 ? re : 'fallback').toBe(re);\n};",
  ],
  [
    'with various types > Date value preserved',
    "() => {\n  const date = new Date(0);\n  expect(date ?? 'fallback').toBe(date);\n}",
    "() => {\n  const date = new Date(0);\n  expect(date !== null && date !== void 0 ? date : 'fallback').toBe(date);\n};",
  ],
  [
    'with optional chaining > ?. producing undefined triggers ??',
    "() => {\n  const obj = {};\n  expect(obj.foo?.bar ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$foo$bar;\n  const obj = {};\n  expect(\n    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'with optional chaining > ?. on null triggers ??',
    "() => {\n  const obj = { foo: null };\n  expect(obj.foo?.bar ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$foo$bar;\n  const obj = { foo: null };\n  expect(\n    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'with optional chaining > ?. producing value does not trigger ??',
    "() => {\n  const obj = { foo: { bar: 'value' } };\n  expect(obj.foo?.bar ?? 'default').toBe('value');\n}",
    "() => {\n  var _obj$foo$bar;\n  const obj = { foo: { bar: 'value' } };\n  expect(\n    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',\n  ).toBe('value');\n};",
  ],
  [
    'with optional chaining > ?. producing 0 does not trigger ??',
    '() => {\n  const obj = { foo: { bar: 0 } };\n  expect(obj.foo?.bar ?? 99).toBe(0);\n}',
    '() => {\n  var _obj$foo$bar;\n  const obj = { foo: { bar: 0 } };\n  expect(\n    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 99,\n  ).toBe(0);\n};',
  ],
  [
    'with optional chaining > deep optional chain with ??',
    "() => {\n  const obj = { a: { b: { c: { d: null } } } };\n  expect(obj.a?.b?.c?.d ?? 'default').toBe('default');\n  expect(obj.a?.b?.c?.e ?? 'default').toBe('default');\n  expect(obj.x?.y?.z ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$a$b$c$d, _obj$a$b$c$e, _obj$x$y$z;\n  const obj = { a: { b: { c: { d: null } } } };\n  expect(\n    (_obj$a$b$c$d = obj.a?.b?.c?.d) !== null && _obj$a$b$c$d !== void 0 ? _obj$a$b$c$d : 'default',\n  ).toBe('default');\n  expect(\n    (_obj$a$b$c$e = obj.a?.b?.c?.e) !== null && _obj$a$b$c$e !== void 0 ? _obj$a$b$c$e : 'default',\n  ).toBe('default');\n  expect(\n    (_obj$x$y$z = obj.x?.y?.z) !== null && _obj$x$y$z !== void 0 ? _obj$x$y$z : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'with optional chaining > optional method call with ??',
    "() => {\n  const obj = { fn: () => null };\n  expect(obj.fn?.() ?? 'default').toBe('default');\n  expect(obj.missing?.() ?? 'default').toBe('default');\n}",
    "() => {\n  var _obj$fn, _obj$missing;\n  const obj = { fn: () => null };\n  expect((_obj$fn = obj.fn?.()) !== null && _obj$fn !== void 0 ? _obj$fn : 'default').toBe(\n    'default',\n  );\n  expect(\n    (_obj$missing = obj.missing?.()) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'in function parameters > default parameter with ??',
    "() => {\n  function greet(name) {\n    const displayName = name ?? 'stranger';\n    return 'Hello, ' + displayName;\n  }\n  expect(greet('Alice')).toBe('Hello, Alice');\n  expect(greet(null)).toBe('Hello, stranger');\n  expect(greet(undefined)).toBe('Hello, stranger');\n  expect(greet('')).toBe('Hello, ');\n}",
    "() => {\n  function greet(name) {\n    const displayName = name !== null && name !== void 0 ? name : 'stranger';\n    return 'Hello, ' + displayName;\n  }\n  expect(greet('Alice')).toBe('Hello, Alice');\n  expect(greet(null)).toBe('Hello, stranger');\n  expect(greet(undefined)).toBe('Hello, stranger');\n  expect(greet('')).toBe('Hello, ');\n};",
  ],
  [
    'in function parameters > multiple parameters with ??',
    "() => {\n  function config(host, port, secure) {\n    return {\n      host: host ?? 'localhost',\n      port: port ?? 3000,\n      secure: secure ?? false,\n    };\n  }\n  const c = config(null, 0, undefined);\n  expect(c.host).toBe('localhost');\n  expect(c.port).toBe(0);\n  expect(c.secure).toBe(false);\n}",
    "() => {\n  function config(host, port, secure) {\n    return {\n      host: host !== null && host !== void 0 ? host : 'localhost',\n      port: port !== null && port !== void 0 ? port : 3e3,\n      secure: secure !== null && secure !== void 0 ? secure : false,\n    };\n  }\n  const c = config(null, 0, undefined);\n  expect(c.host).toBe('localhost');\n  expect(c.port).toBe(0);\n  expect(c.secure).toBe(false);\n};",
  ],
  [
    'in function parameters > arrow function with ??',
    "() => {\n  const getVal = (x) => x ?? 'default';\n  expect(getVal(null)).toBe('default');\n  expect(getVal(0)).toBe(0);\n}",
    "() => {\n  const getVal = x => (x !== null && x !== void 0 ? x : 'default');\n  expect(getVal(null)).toBe('default');\n  expect(getVal(0)).toBe(0);\n};",
  ],
  [
    'in expressions > ternary on left side',
    "() => {\n  const x = true ? null : 'value';\n  expect(x ?? 'default').toBe('default');\n}",
    "() => {\n  const x = true ? null : 'value';\n  expect(x !== null && x !== void 0 ? x : 'default').toBe('default');\n};",
  ],
  [
    'in expressions > arithmetic on right side',
    '() => {\n  const x = null ?? 2 + 3;\n  expect(x).toBe(5);\n}',
    '() => {\n  var _ref;\n  const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 2 + 3;\n  expect(x).toBe(5);\n};',
  ],
  [
    'in expressions > template literal on right side',
    "() => {\n  const name = null ?? `world`;\n  expect(name).toBe('world');\n}",
    "() => {\n  var _ref;\n  const name = (_ref = null) !== null && _ref !== void 0 ? _ref : `world`;\n  expect(name).toBe('world');\n};",
  ],
  [
    'in expressions > nested ?? in right side',
    "() => {\n  const a = null;\n  const b = undefined;\n  const c = 'found';\n  expect(a ?? b ?? c).toBe('found');\n}",
    "() => {\n  var _ref;\n  const a = null;\n  const b = undefined;\n  const c = 'found';\n  expect((_ref = a !== null && a !== void 0 ? a : b) !== null && _ref !== void 0 ? _ref : c).toBe(\n    'found',\n  );\n};",
  ],
  [
    'in expressions > in return statement',
    "() => {\n  function getValue(obj) {\n    return obj.value ?? 'empty';\n  }\n  expect(getValue({ value: null })).toBe('empty');\n  expect(getValue({ value: 0 })).toBe(0);\n}",
    "() => {\n  function getValue(obj) {\n    var _obj$value;\n    return (_obj$value = obj.value) !== null && _obj$value !== void 0 ? _obj$value : 'empty';\n  }\n  expect(getValue({ value: null })).toBe('empty');\n  expect(getValue({ value: 0 })).toBe(0);\n};",
  ],
  [
    'in expressions > in throw expression right side',
    "() => {\n  const val = null;\n  try {\n    const result =\n      val ??\n      (() => {\n        throw new Error('nullish');\n      })();\n    // Should have thrown\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('nullish');\n  }\n}",
    "() => {\n  const val = null;\n  try {\n    const result =\n      val !== null && val !== void 0\n        ? val\n        : (() => {\n            throw new Error('nullish');\n          })();\n    // Should have thrown\n    expect(true).toBe(false);\n  } catch (e) {\n    expect(e.message).toBe('nullish');\n  }\n};",
  ],
  [
    'in destructuring > with destructured property',
    "() => {\n  const { a } = { a: null };\n  expect(a ?? 'default').toBe('default');\n}",
    "() => {\n  const { a } = { a: null };\n  expect(a !== null && a !== void 0 ? a : 'default').toBe('default');\n};",
  ],
  [
    'in destructuring > with default destructuring vs ??',
    "() => {\n  // Default destructuring only triggers on undefined, not null\n  const { a = 'destructure-default' } = { a: null };\n  // a is null because destructuring default only applies on undefined\n  expect(a).toBe(null);\n  expect(a ?? 'nullish-default').toBe('nullish-default');\n}",
    "() => {\n  // Default destructuring only triggers on undefined, not null\n  const { a = 'destructure-default' } = { a: null };\n  // a is null because destructuring default only applies on undefined\n  expect(a).toBe(null);\n  expect(a !== null && a !== void 0 ? a : 'nullish-default').toBe('nullish-default');\n};",
  ],
  [
    'in destructuring > with array destructuring',
    "() => {\n  const [a, b] = [null, undefined];\n  expect(a ?? 'first').toBe('first');\n  expect(b ?? 'second').toBe('second');\n}",
    "() => {\n  const [a, b] = [null, undefined];\n  expect(a !== null && a !== void 0 ? a : 'first').toBe('first');\n  expect(b !== null && b !== void 0 ? b : 'second').toBe('second');\n};",
  ],
  [
    'in loops and conditionals > in if condition',
    '() => {\n  const x = null;\n  const val = x ?? 0;\n  if (val === 0) {\n    expect(true).toBe(true);\n  } else {\n    expect(true).toBe(false);\n  }\n}',
    '() => {\n  const x = null;\n  const val = x !== null && x !== void 0 ? x : 0;\n  if (val === 0) {\n    expect(true).toBe(true);\n  } else {\n    expect(true).toBe(false);\n  }\n};',
  ],
  [
    'in loops and conditionals > in for loop initializer',
    '() => {\n  const values = [];\n  for (let i = null ?? 0; i < 3; i++) {\n    values.push(i);\n  }\n  expect(values).toEqual([0, 1, 2]);\n}',
    '() => {\n  var _ref;\n  const values = [];\n  for (let i = (_ref = null) !== null && _ref !== void 0 ? _ref : 0; i < 3; i++) {\n    values.push(i);\n  }\n  expect(values).toEqual([0, 1, 2]);\n};',
  ],
  [
    'in loops and conditionals > in while condition',
    "() => {\n  let arr = [1, 2, null, 3];\n  let results = [];\n  let idx = 0;\n  while (idx < arr.length) {\n    results.push(arr[idx] ?? 'nil');\n    idx++;\n  }\n  expect(results).toEqual([1, 2, 'nil', 3]);\n}",
    "() => {\n  let arr = [1, 2, null, 3];\n  let results = [];\n  let idx = 0;\n  while (idx < arr.length) {\n    var _arr$idx;\n    results.push((_arr$idx = arr[idx]) !== null && _arr$idx !== void 0 ? _arr$idx : 'nil');\n    idx++;\n  }\n  expect(results).toEqual([1, 2, 'nil', 3]);\n};",
  ],
  [
    'class contexts > in class method',
    "() => {\n  class Config {\n    constructor(value) {\n      this.value = value ?? 'default';\n    }\n    getValue() {\n      return this.value ?? 'none';\n    }\n  }\n  expect(new Config(null).value).toBe('default');\n  expect(new Config(0).value).toBe(0);\n  expect(new Config(null).getValue()).toBe('default');\n}",
    "() => {\n  class Config {\n    constructor(value) {\n      this.value = value !== null && value !== void 0 ? value : 'default';\n    }\n    getValue() {\n      var _this$value;\n      return (_this$value = this.value) !== null && _this$value !== void 0 ? _this$value : 'none';\n    }\n  }\n  expect(new Config(null).value).toBe('default');\n  expect(new Config(0).value).toBe(0);\n  expect(new Config(null).getValue()).toBe('default');\n};",
  ],
  [
    'class contexts > in static method',
    "() => {\n  class Utils {\n    static getDefault(val) {\n      return val ?? 'default';\n    }\n  }\n  expect(Utils.getDefault(null)).toBe('default');\n  expect(Utils.getDefault('')).toBe('');\n}",
    "() => {\n  class Utils {\n    static getDefault(val) {\n      return val !== null && val !== void 0 ? val : 'default';\n    }\n  }\n  expect(Utils.getDefault(null)).toBe('default');\n  expect(Utils.getDefault('')).toBe('');\n};",
  ],
  [
    'class contexts > in getter',
    "() => {\n  class Box {\n    #value;\n    constructor(v) {\n      this.#value = v;\n    }\n    get content() {\n      return this.#value ?? 'empty';\n    }\n  }\n  expect(new Box(null).content).toBe('empty');\n  expect(new Box(0).content).toBe(0);\n  expect(new Box(false).content).toBe(false);\n}",
    "() => {\n  class Box {\n    #value;\n    constructor(v) {\n      this.#value = v;\n    }\n    get content() {\n      var _this$value;\n      return (_this$value = this.#value) !== null && _this$value !== void 0 ? _this$value : 'empty';\n    }\n  }\n  expect(new Box(null).content).toBe('empty');\n  expect(new Box(0).content).toBe(0);\n  expect(new Box(false).content).toBe(false);\n};",
  ],
  [
    'edge cases > both sides are null',
    '() => {\n  expect(null ?? null).toBe(null);\n}',
    '() => {\n  var _ref;\n  expect((_ref = null) !== null && _ref !== void 0 ? _ref : null).toBe(null);\n};',
  ],
  [
    'edge cases > both sides are undefined',
    '() => {\n  expect(undefined ?? undefined).toBe(undefined);\n}',
    '() => {\n  var _undefined;\n  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : undefined).toBe(\n    undefined,\n  );\n};',
  ],
  [
    'edge cases > right side is null',
    '() => {\n  expect(undefined ?? null).toBe(null);\n}',
    '() => {\n  var _undefined;\n  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBe(null);\n};',
  ],
  [
    'edge cases > left side is an expression returning null',
    "() => {\n  expect((1 > 2 ? 'yes' : null) ?? 'default').toBe('default');\n}",
    "() => {\n  var _ref;\n  expect((_ref = 1 > 2 ? 'yes' : null) !== null && _ref !== void 0 ? _ref : 'default').toBe(\n    'default',\n  );\n};",
  ],
  [
    'edge cases > works with comma operator',
    "() => {\n  let x;\n  const result = ((x = null), x) ?? 'default';\n  expect(result).toBe('default');\n}",
    "() => {\n  var _ref;\n  let x;\n  const result = (_ref = ((x = null), x)) !== null && _ref !== void 0 ? _ref : 'default';\n  expect(result).toBe('default');\n};",
  ],
  [
    'edge cases > typeof does not throw for undeclared variable in right side',
    "() => {\n  const result = 'value' ?? undeclaredVar;\n  expect(result).toBe('value');\n}",
    "() => {\n  var _value;\n  const result = (_value = 'value') !== null && _value !== void 0 ? _value : undeclaredVar;\n  expect(result).toBe('value');\n};",
  ],
  [
    'edge cases > deeply nested nullish coalescing',
    "() => {\n  const a = null ?? null ?? null ?? null ?? 'deep';\n  expect(a).toBe('deep');\n}",
    "() => {\n  var _ref, _ref2, _ref3, _ref4;\n  const a =\n    (_ref =\n      (_ref2 =\n        (_ref3 = (_ref4 = null) !== null && _ref4 !== void 0 ? _ref4 : null) !== null &&\n        _ref3 !== void 0\n          ? _ref3\n          : null) !== null && _ref2 !== void 0\n        ? _ref2\n        : null) !== null && _ref !== void 0\n      ? _ref\n      : 'deep';\n  expect(a).toBe('deep');\n};",
  ],
  [
    'edge cases > with Map.get()',
    "() => {\n  const map = new Map();\n  map.set('key', 0);\n  expect(map.get('key') ?? 'default').toBe(0);\n  expect(map.get('missing') ?? 'default').toBe('default');\n}",
    "() => {\n  var _map$get, _map$get2;\n  const map = new Map();\n  map.set('key', 0);\n  expect((_map$get = map.get('key')) !== null && _map$get !== void 0 ? _map$get : 'default').toBe(\n    0,\n  );\n  expect(\n    (_map$get2 = map.get('missing')) !== null && _map$get2 !== void 0 ? _map$get2 : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'edge cases > with WeakRef deref',
    "() => {\n  let obj = { name: 'test' };\n  const ref = new WeakRef(obj);\n  expect(ref.deref() ?? 'collected').toBe(obj);\n}",
    "() => {\n  var _ref$deref;\n  let obj = { name: 'test' };\n  const ref = new WeakRef(obj);\n  expect(\n    (_ref$deref = ref.deref()) !== null && _ref$deref !== void 0 ? _ref$deref : 'collected',\n  ).toBe(obj);\n};",
  ],
  [
    'edge cases > preserves object identity',
    '() => {\n  const obj = {};\n  const result = obj ?? {};\n  expect(result).toBe(obj);\n}',
    '() => {\n  const obj = {};\n  const result = obj !== null && obj !== void 0 ? obj : {};\n  expect(result).toBe(obj);\n};',
  ],
  [
    'practical patterns > config merging with ??',
    "() => {\n  const defaults = { host: 'localhost', port: 3000, debug: false };\n  const userConfig = { host: null, port: 8080, debug: undefined };\n  const config = {\n    host: userConfig.host ?? defaults.host,\n    port: userConfig.port ?? defaults.port,\n    debug: userConfig.debug ?? defaults.debug,\n  };\n  expect(config.host).toBe('localhost');\n  expect(config.port).toBe(8080);\n  expect(config.debug).toBe(false);\n}",
    "() => {\n  var _userConfig$host, _userConfig$port, _userConfig$debug;\n  const defaults = {\n    host: 'localhost',\n    port: 3e3,\n    debug: false,\n  };\n  const userConfig = {\n    host: null,\n    port: 8080,\n    debug: undefined,\n  };\n  const config = {\n    host:\n      (_userConfig$host = userConfig.host) !== null && _userConfig$host !== void 0\n        ? _userConfig$host\n        : defaults.host,\n    port:\n      (_userConfig$port = userConfig.port) !== null && _userConfig$port !== void 0\n        ? _userConfig$port\n        : defaults.port,\n    debug:\n      (_userConfig$debug = userConfig.debug) !== null && _userConfig$debug !== void 0\n        ? _userConfig$debug\n        : defaults.debug,\n  };\n  expect(config.host).toBe('localhost');\n  expect(config.port).toBe(8080);\n  expect(config.debug).toBe(false);\n};",
  ],
  [
    'practical patterns > safe access with fallback',
    '() => {\n  const response = { data: { users: null } };\n  const users = response.data?.users ?? [];\n  expect(users).toEqual([]);\n}',
    '() => {\n  var _response$data$users;\n  const response = { data: { users: null } };\n  const users =\n    (_response$data$users = response.data?.users) !== null && _response$data$users !== void 0\n      ? _response$data$users\n      : [];\n  expect(users).toEqual([]);\n};',
  ],
  [
    'practical patterns > counting with zero preservation',
    '() => {\n  function getCount(obj) {\n    return obj.count ?? -1;\n  }\n  expect(getCount({ count: 0 })).toBe(0);\n  expect(getCount({ count: 10 })).toBe(10);\n  expect(getCount({})).toBe(-1);\n}',
    '() => {\n  function getCount(obj) {\n    var _obj$count;\n    return (_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : -1;\n  }\n  expect(getCount({ count: 0 })).toBe(0);\n  expect(getCount({ count: 10 })).toBe(10);\n  expect(getCount({})).toBe(-1);\n};',
  ],
  [
    'practical patterns > DOM-style attribute defaults',
    "() => {\n  const attrs = { tabIndex: 0, disabled: false, id: '' };\n  expect(attrs.tabIndex ?? -1).toBe(0);\n  expect(attrs.disabled ?? false).toBe(false);\n  expect(attrs.id ?? 'auto').toBe('');\n  expect(attrs.className ?? 'default').toBe('default');\n}",
    "() => {\n  var _attrs$tabIndex, _attrs$disabled, _attrs$id, _attrs$className;\n  const attrs = {\n    tabIndex: 0,\n    disabled: false,\n    id: '',\n  };\n  expect(\n    (_attrs$tabIndex = attrs.tabIndex) !== null && _attrs$tabIndex !== void 0\n      ? _attrs$tabIndex\n      : -1,\n  ).toBe(0);\n  expect(\n    (_attrs$disabled = attrs.disabled) !== null && _attrs$disabled !== void 0\n      ? _attrs$disabled\n      : false,\n  ).toBe(false);\n  expect((_attrs$id = attrs.id) !== null && _attrs$id !== void 0 ? _attrs$id : 'auto').toBe('');\n  expect(\n    (_attrs$className = attrs.className) !== null && _attrs$className !== void 0\n      ? _attrs$className\n      : 'default',\n  ).toBe('default');\n};",
  ],
  [
    'practical patterns > nested defaults',
    "() => {\n  function getTheme(prefs) {\n    return {\n      color: prefs?.theme?.color ?? prefs?.color ?? 'blue',\n      size: prefs?.theme?.size ?? 16,\n    };\n  }\n  expect(getTheme(null).color).toBe('blue');\n  expect(getTheme({ color: 'red' }).color).toBe('red');\n  expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');\n  expect(getTheme({}).size).toBe(16);\n}",
    "() => {\n  function getTheme(prefs) {\n    var _ref, _prefs$theme$color, _prefs$theme$size;\n    return {\n      color:\n        (_ref =\n          (_prefs$theme$color = prefs?.theme?.color) !== null && _prefs$theme$color !== void 0\n            ? _prefs$theme$color\n            : prefs?.color) !== null && _ref !== void 0\n          ? _ref\n          : 'blue',\n      size:\n        (_prefs$theme$size = prefs?.theme?.size) !== null && _prefs$theme$size !== void 0\n          ? _prefs$theme$size\n          : 16,\n    };\n  }\n  expect(getTheme(null).color).toBe('blue');\n  expect(getTheme({ color: 'red' }).color).toBe('red');\n  expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');\n  expect(getTheme({}).size).toBe(16);\n};",
  ],
  [
    'practical patterns > error message fallback',
    "() => {\n  function getErrorMessage(error) {\n    return error?.message ?? error?.code ?? 'Unknown error';\n  }\n  expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');\n  expect(getErrorMessage({ code: 404 })).toBe(404);\n  expect(getErrorMessage({})).toBe('Unknown error');\n  expect(getErrorMessage(null)).toBe('Unknown error');\n}",
    "() => {\n  function getErrorMessage(error) {\n    var _ref, _error$message;\n    return (_ref =\n      (_error$message = error?.message) !== null && _error$message !== void 0\n        ? _error$message\n        : error?.code) !== null && _ref !== void 0\n      ? _ref\n      : 'Unknown error';\n  }\n  expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');\n  expect(getErrorMessage({ code: 404 })).toBe(404);\n  expect(getErrorMessage({})).toBe('Unknown error');\n  expect(getErrorMessage(null)).toBe('Unknown error');\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
