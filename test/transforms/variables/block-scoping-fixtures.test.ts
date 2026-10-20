import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar state1 = {};\nexpect(function () {\n  var a = 3;\n  var b = 1;\n  state1.getA = () => a;\n  state1.getB = () => b;\n  ((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state1.getA()).toBe(3);\nexpect(state1.getB()).toBe(2);\nvar state2 = {};\nexpect(function () {\n  var a = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    },\n  };\n  state2.a = a;\n  state2.getA = () => a;\n  state2.getB = () => b;\n  var b = 1;\n  ((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state2.getA()).toBe(state2.a);\nexpect(state2.getB()).toBe(2);\nexpect(state2.valueOfIsCalled).toBe(true);\nvar state3 = {};\nexpect(function () {\n  var a = 32;\n  var b = 1;\n  state3.getA = () => a;\n  state3.getB = () => b;\n  ((_readOnlyValue = a), (_readOnlyValue >>>= ++b), _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state3.getA()).toBe(32);\nexpect(state3.getB()).toBe(2);\nvar state4 = {};\nexpect(function () {\n  var a = 1;\n  var b = 1;\n  state4.getA = () => a;\n  state4.getB = () => b;\n  ((_readOnlyValue = a), (_readOnlyValue &&= (++b, _readOnlyError('a'))));\n}).toThrow('\"a\" is read-only');\nexpect(state4.getA()).toBe(1);\nexpect(state4.getB()).toBe(2);\n{\n  var a = 1;\n  var b = 1;\n  ((_readOnlyValue = a), (_readOnlyValue ||= (++b, _readOnlyError('a'))));\n  expect(a).toBe(1);\n  expect(b).toBe(1);\n}",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar a = 5;\nvar b = 0;\n((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));\n((_readOnlyValue = a), (_readOnlyValue >>>= b++), _readOnlyError('a'));\n((_readOnlyValue = a), (_readOnlyValue ||= (b++, _readOnlyError('a'))));\n((_readOnlyValue = a), (_readOnlyValue &&= (b++, _readOnlyError('a'))));\n((_readOnlyValue = a), (_readOnlyValue ??= (b++, _readOnlyError('a'))));",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nexpect(function () {\n  for (var element = 1; (_readOnlyValue = element), _readOnlyValue++, _readOnlyError('element');)\n    break;\n}).toThrow('\"element\" is read-only');\nexpect(function () {\n  for (;;) {\n    var from = 50;\n    ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));\n    break;\n  }\n}).toThrow('\"from\" is read-only');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nfor (var element = 1; (_readOnlyValue = element), _readOnlyValue++, _readOnlyError('element');) {\n  var from = 50;\n  ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));\n}",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nexpect(function () {\n  var array = [1, 2, 3];\n  for (var element of array) {\n    var from = 50;\n    ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));\n  }\n}).toThrow('\"from\" is read-only');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nfor (var element of []) {\n  var from = 50;\n  ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));\n}",
  'var bar = 123;\n{\n  var _bar = 456;\n}\nexpect(bar).toBe(123);',
  'for (var i in arr) {\n  var MULTIPLIER = 5;\n  console.log(arr[i] * MULTIPLIER);\n}',
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nfunction f() {\n  var a = 'foo';\n  if (false) ('false', _readOnlyError('a'));\n  return a;\n}\nexpect(f()).toBe('foo');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n(function () {\n  var a = 'foo';\n  if (false) ('false', _readOnlyError('a'));\n  return a;\n})();",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nexpect(function () {\n  var [a, b] = [1, 2];\n  (3, _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(function () {\n  var a = 1;\n  ([2], _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(function () {\n  var b = 1;\n  ({ b: 2 }, _readOnlyError('b'));\n}).toThrow('\"b\" is read-only');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar [a, b] = [1, 2];\n(3, _readOnlyError('a'));",
  'var [a, b] = [1, 2];\nvar [c, d] = [3, 4];\nvar { e, f } = {\n  e: 5,\n  f: 6,\n};\nvar { a: g, b: h } = {\n  a: 7,\n  b: 8,\n};',
  '// @flow\nvar foo1 = 1;',
  "var x = {};\nx.key = 'value';",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nexpect(function () {\n  for (var i = 0; i < 3; i + 1, _readOnlyError('i')) {}\n}).toThrow('\"i\" is read-only');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nfor (var i = 0; i < 3; i + 1, _readOnlyError('i')) {\n  console.log(i);\n}\nfor (var j = 0; j < 3; _readOnlyValue = j, _readOnlyValue++, _readOnlyError('j')) {\n  console.log(j);\n}",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nexpect(function () {\n  var c = 17;\n  var a = 0;\n  function f() {\n    return ((_readOnlyValue = c), ++_readOnlyValue, _readOnlyError('c')) + --a;\n  }\n  f();\n}).toThrow('\"c\" is read-only');",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar c = 17;\nvar a = 0;\nfunction f() {\n  return ((_readOnlyValue = c), ++_readOnlyValue, _readOnlyError('c')) + --a;\n}",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar state1 = {};\nexpect(function () {\n  var a = 3;\n  state1.getA = () => a;\n  (7, _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state1.getA()).toBe(3);\nvar state2 = {};\nexpect(function () {\n  var a = 3;\n  var b = 0;\n  state2.getA = () => a;\n  state2.getB = () => b;\n  (b++, _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state2.getA()).toBe(3);\nexpect(state2.getB()).toBe(1);",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar MULTIPLIER = 5;\n('overwrite', _readOnlyError('MULTIPLIER'));\nvar a = 5;\nvar b = 0;\n(b++, _readOnlyError('a'));",
  "var state = {};\nfunction f(arr) {\n  var MULTIPLIER = 5;\n  state.getMultiplier = () => MULTIPLIER;\n  for (MULTIPLIER in arr);\n  return 'survived';\n}\nexpect(function () {\n  f([1, 2, 3]);\n}).toThrow('\"MULTIPLIER\" is read-only');\nexpect(state.getMultiplier()).toBe(5);\nexpect(f([])).toBe('survived');",
  'var MULTIPLIER = 5;\nfor (MULTIPLIER in arr);',
  'var MULTIPLIER = 5;\nfor (var i in arr) {\n  console.log(arr[i] * MULTIPLIER);\n}',
  'function B() {\n  var _B = 1;\n}',
  '(function B() {\n  var _B = 1;\n});',
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar state1 = {};\nexpect(function () {\n  var a = 'str';\n  state1.getA = () => a;\n  ((_readOnlyValue = a), --_readOnlyValue, _readOnlyError('a'));\n}).toThrow('\"a\" is read-only');\nexpect(state1.getA()).toBe('str');\nvar state2 = {};\nexpect(function () {\n  var b = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    },\n  };\n  state2.b = b;\n  state2.getB = () => b;\n  ((_readOnlyValue = b), --_readOnlyValue, _readOnlyError('b'));\n}).toThrow('\"b\" is read-only');\nexpect(state2.getB()).toBe(state2.b);\nexpect(state2.valueOfIsCalled).toBe(true);",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar a = 'str';\n((_readOnlyValue = a), --_readOnlyValue, _readOnlyError('a'));",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar state1 = {};\nexpect(function () {\n  var foo = 1;\n  state1.getFoo = () => foo;\n  ((_readOnlyValue = foo), _readOnlyValue++, _readOnlyError('foo'));\n}).toThrow('\"foo\" is read-only');\nexpect(state1.getFoo()).toBe(1);\nvar state2 = {};\nexpect(function () {\n  var bar = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    },\n  };\n  state2.bar = bar;\n  state2.getBar = () => bar;\n  ((_readOnlyValue = bar), _readOnlyValue++, _readOnlyError('bar'));\n}).toThrow('\"bar\" is read-only');\nexpect(state2.getBar()).toBe(state2.bar);\nexpect(state2.valueOfIsCalled).toBe(true);",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nvar foo = 1;\n((_readOnlyValue = foo), _readOnlyValue++, _readOnlyError('foo'));",
  '// NOTE: When compiling async generators,\n// we run the async-generator-functions transform\n// as soon as in Program:enter, so when the block-scoping plugin\n// runs it has already been transpiled to a plain function.\n// The functions is thus visible to the outer scope.\n// This is a bug.\n\nif (true) {\n  async function* run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}',
  'if (true) {\n  async function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}',
  'var run = function () {\n  return false;\n};\nif (true) {\n  function run() {\n    return true;\n  }\n}\nfunction test() {\n  return run();\n}',
  'var run = function () {\n  return false;\n};\n\nif (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}',
  'if (true) {\n  function* run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}',
  'class A {\n  m() {\n    if (true) {\n      function f() {\n        return true;\n      }\n    }\n\n    function g() {\n      return f();\n    }\n\n    return g();\n  }\n}\n\nexpect(new A().m).toThrow(ReferenceError);',
  '[syntax-error] invalid-input',
  'if (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}',
  "var foo = 'foo';\nfunction foobar() {\n  for (var item of [1, 2, 3]) {\n    var _foo = 'bar';\n    [bar, _foo] = [1, 2];\n  }\n}",
  "// it shouldn't break on a case-break statement\nvar i;\nvar _loopResult;\nvar _loop = () => {\n  switch (i) {\n    case 1: {\n      break;\n    }\n  }\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult = _loop();\n}\nexpect(i).toBe(10);\n// it should continue on continue statements within switch\nvar j = 0;\nvar _loopResult8;\nvar _loop7 = () => {\n  switch (i) {\n    case 0: {\n      return {\n        type: 'continue',\n        vars: [],\n      };\n    }\n  }\n  j++;\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult8 = _loop7();\n  if (_loopResult8.type === 'continue') continue;\n}\nexpect(j).toBe(9);\n// it should work with loops nested within switch\nj = 0;\nvar k;\nvar _loopResult10;\nvar _loop9 = () => {\n  switch (i) {\n    case 0: {\n      var _loopResult12;\n      var _loop11 = () => {\n        var _z = 3;\n        () => _z;\n        j++;\n        return {\n          type: 'break',\n          vars: [],\n        };\n        return {\n          type: 'normal',\n          vars: [],\n        };\n      };\n      for (k = 0; k < 10; k++) {\n        _loopResult12 = _loop11();\n        if (_loopResult12.type === 'break') break;\n      }\n      break;\n    }\n  }\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult10 = _loop9();\n}\nexpect(j).toBe(1);",
  "// it shouldn't break on a case-break statement\nvar i;\nvar _loopResult;\nvar _loop = () => {\n  switch (i) {\n    case 1:\n      break;\n  }\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult = _loop();\n}\nexpect(i).toBe(10);\n// it should continue on continue statements within switch\nvar j = 0;\nvar _loopResult8;\nvar _loop7 = () => {\n  switch (i) {\n    case 0:\n      return {\n        type: 'continue',\n        vars: [],\n      };\n  }\n  j++;\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult8 = _loop7();\n  if (_loopResult8.type === 'continue') continue;\n}\nexpect(j).toBe(9);\n// it should work with loops nested within switch\nj = 0;\nvar k;\nvar _loopResult10;\nvar _loop9 = () => {\n  switch (i) {\n    case 0:\n      var _loopResult12;\n      var _loop11 = () => {\n        var _z = 3;\n        () => _z;\n        j++;\n        return {\n          type: 'break',\n          vars: [],\n        };\n        return {\n          type: 'normal',\n          vars: [],\n        };\n      };\n      for (k = 0; k < 10; k++) {\n        _loopResult12 = _loop11();\n        if (_loopResult12.type === 'break') break;\n      }\n      break;\n  }\n  var z = 3;\n  () => z;\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (i = 0; i < 10; i++) {\n  _loopResult10 = _loop9();\n}\nexpect(j).toBe(1);",
  '{\n  a;\n}\n{\n  var _a;\n}\n(function () {\n  {\n    b;\n  }\n  {\n    var _b;\n  }\n})();\n{\n  c = 0;\n}\n{\n  var _c;\n}\n(function () {\n  {\n    d = 0;\n  }\n  {\n    var _d;\n  }\n});',
  'var a = 1;\nfunction f() {\n  var res;\n  {\n    res = a;\n  }\n  {\n    var _a = 2;\n  }\n  return res;\n}\nexpect(f()).toBe(1);',
  'var a = 1;\nfunction f() {\n  {\n    console.log(a);\n  }\n  {\n    var _a = 2;\n  }\n}',
  "(function () {\n  function* a() {\n    var fn;\n    var _loopResult;\n    var _loop = function* () {\n      var x = yield 'iteration';\n      fn = () => x;\n      return {\n        type: 'normal',\n        vars: [],\n      };\n    };\n    do {\n      _loopResult = yield* _loop.call(this);\n    } while (false);\n    return fn;\n  }\n  async function b() {\n    var fn;\n    var _loopResult10;\n    var _loop9 = async () => {\n      var x = await 'iteration';\n      fn = () => x;\n      return {\n        type: 'normal',\n        vars: [],\n      };\n    };\n    do {\n      _loopResult10 = await _loop9();\n    } while (false);\n    return fn;\n  }\n  async function* c() {\n    var fn;\n    var _loopResult12;\n    var _loop11 = function* () {\n      var x = yield 'iteration';\n      fn = () => x;\n      return {\n        type: 'normal',\n        vars: [],\n      };\n    };\n    do {\n      _loopResult12 = yield* _loop11.call(this);\n    } while (false);\n    return fn;\n  }\n  return (async () => {\n    var it = a();\n    expect(it.next().value).toBe('iteration');\n    expect(it.next('foo').value()).toBe('foo');\n    expect((await b())()).toBe('iteration');\n    it = c();\n    expect((await it.next()).value).toBe('iteration');\n    expect((await it.next('foo')).value()).toBe('foo');\n  })();\n});",
  "function* a() {\n  var fn;\n  var _loopResult;\n  var _loop = function* () {\n    var x = yield 'iteration';\n    fn = () => x;\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  do {\n    _loopResult = yield* _loop.call(this);\n  } while (false);\n  return fn;\n}\nasync function b() {\n  var fn;\n  var _loopResult8;\n  var _loop7 = async () => {\n    var x = await 'iteration';\n    fn = () => x;\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  do {\n    _loopResult8 = await _loop7();\n  } while (false);\n  return fn;\n}\nasync function* c() {\n  var fn;\n  var _loopResult10;\n  var _loop9 = function* () {\n    var x = yield 'iteration';\n    fn = () => x;\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  do {\n    _loopResult10 = yield* _loop9.call(this);\n  } while (false);\n  return fn;\n}",
  "expect(() => {\n  var _loopResult;\n  var _loop = a => {\n    switch (true) {\n      case true: {\n        var b = 1;\n        () => b;\n        if (true) break;\n        return {\n          type: 'continue',\n          vars: [a],\n        };\n      }\n      case false: {\n        throw new Error('unreachable');\n      }\n    }\n    return {\n      type: 'normal',\n      vars: [a],\n    };\n  };\n  for (var a of [1]) {\n    _loopResult = _loop(a);\n    a = _loopResult.vars[0];\n    if (_loopResult.type === 'continue') continue;\n  }\n}).not.toThrow();",
  "var _loopResult;\nvar _loop = a => {\n  switch (true) {\n    case true: {\n      var b = 1;\n      () => b;\n      if (true) break;\n      return {\n        type: 'continue',\n        vars: [a],\n      };\n    }\n    case false: {\n      throw new Error('unreachable');\n    }\n  }\n  return {\n    type: 'normal',\n    vars: [a],\n  };\n};\nfor (var a of [1]) {\n  _loopResult = _loop(a);\n  a = _loopResult.vars[0];\n  if (_loopResult.type === 'continue') continue;\n}",
  "(function () {\n  var _loopResult;\n  var _loop = i => {\n    fns.push(function () {\n      return i;\n    });\n    if (i === 1) {\n      return {\n        type: 'continue',\n        vars: [i],\n      };\n    } else if (i === 2) {\n      return {\n        type: 'break',\n        vars: [i],\n      };\n    } else if (i === 3) {\n      return {\n        type: 'return',\n        value: i,\n        vars: [i],\n      };\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i in nums) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n    if (_loopResult.type === 'return') return _loopResult.value;\n    if (_loopResult.type === 'break') break;\n    if (_loopResult.type === 'continue') continue;\n  }\n})();",
  "var _loopResult;\nvar _loop = i => {\n  fns.push(function () {\n    return i;\n  });\n  return {\n    type: 'break',\n    vars: [i],\n  };\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i in nums) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n  if (_loopResult.type === 'break') break;\n}",
  "var _loopResult;\nvar _loop = i => {\n  var l = i;\n  setTimeout(function () {\n    console.log(l);\n  }, 1);\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 0; i < 5; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "var _loopResult;\nvar _loop = i => {\n  () => {\n    i;\n  };\n  console.log(i);\n  i += 1;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 0; i < 2; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "var _loopResult;\nvar _loop = i => {\n  fns.push(function () {\n    return i;\n  });\n  return {\n    type: 'continue',\n    vars: [i],\n  };\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i in nums) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n  if (_loopResult.type === 'continue') continue;\n}",
  "function w() {\n  var key;\n  var _loopResult;\n  var _loop = i => {\n    var outer = {};\n    for (key in someObj) {\n      var x = () => outer;\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < y; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n}\nfunction w2() {\n  var key;\n  var _loopResult11;\n  var _loop10 = i => {\n    var outer = {};\n    for (key of someObj) {\n      var x = () => outer;\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < y; i++) {\n    _loopResult11 = _loop10(i);\n    i = _loopResult11.vars[0];\n  }\n}",
  "(function () {\n  var _loopResult;\n  var _loop = i => {\n    fns.push(function () {\n      return i;\n    });\n    return {\n      type: 'return',\n      value: void 0,\n      vars: [i],\n    };\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i in nums) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n    if (_loopResult.type === 'return') return _loopResult.value;\n  }\n})();",
  "(function () {\n  var _loopResult;\n  var _loop = i => {\n    fns.push(function () {\n      return i;\n    });\n    return {\n      type: 'return',\n      value: i,\n      vars: [i],\n    };\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i in nums) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n    if (_loopResult.type === 'return') return _loopResult.value;\n  }\n})();",
  "var res = [];\nvar _loopResult;\nvar _loop = i => {\n  var y = i;\n  res.push((() => y)());\n  i++;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 1; i < 6; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}\nexpect(res).toEqual([1, 3, 5]);",
  "var _loopResult;\nvar _loop = i => {\n  var y = i;\n  () => y;\n  i++;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 4; i < 6; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "function proxyObserver(properties) {\n  var _loopResult;\n  var _loop = key => {\n    if (properties[key].observer) {\n      var base = properties[key].observer;\n      properties[key].observer = () => {\n        return base.apply(this);\n      };\n    }\n    return {\n      type: 'normal',\n      vars: [key],\n    };\n  };\n  for (var key in properties) {\n    _loopResult = _loop(key);\n    key = _loopResult.vars[0];\n  }\n  return properties;\n}\nvar results = proxyObserver([{ observer: () => 1 }, { observer: () => 2 }]);\nexpect(results[0].observer()).toBe(1);\nexpect(results[1].observer()).toBe(2);",
  "function proxyObserver(component) {\n  var _loopResult;\n  var _loop = key => {\n    if (component.properties[key].observer) {\n      var base = component.properties[key].observer;\n      component.properties[key].observer = () => {\n        base.apply(this);\n      };\n    }\n    return {\n      type: 'normal',\n      vars: [key],\n    };\n  };\n  for (var _key2 in component.properties) {\n    _loopResult = _loop(_key2);\n    _key2 = _loopResult.vars[0];\n  }\n  return component;\n}\nfunction proxyObserver2(component) {\n  var _loopResult8;\n  var _loop7 = () => {\n    var base = component.properties[key].observer;\n    component.properties[key].observer = () => {\n      base.apply(this);\n    };\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  for (var _key of component.properties)\n    while (1) {\n      _loopResult8 = _loop7();\n    }\n  return component;\n}",
  "function w() {\n  var i;\n  var _loopResult;\n  var _loop = key => {\n    var outer = {};\n    for (i = 0; i < y; i++) {\n      var x = () => outer;\n    }\n    return {\n      type: 'normal',\n      vars: [key],\n    };\n  };\n  for (var key in someObj) {\n    _loopResult = _loop(key);\n    key = _loopResult.vars[0];\n  }\n}",
  'try {\n  foo();\n} catch (x) {\n  function harmless(x) {\n    return x;\n  }\n}',
  'var foo = () => {\n  foo = () => {};\n};\nfoo();',
  "function test() {\n  var foo = 'bar';\n}",
  "var x;\nvar f;\nvar _loopResult;\nvar _loop = i => {\n  x = 5;\n  ({ f: f } = { f: 2 });\n  fns.push(function () {\n    return i * x;\n  });\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i of nums) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "(function () {\n  var code = `\n  for (const {foo, ...bar} of { bar: [] }) {\n    () => foo;\n    const [qux] = bar;\n    try {} catch (e) {\n      let quux = qux;\n    }\n  }\n`;\n  var programPath;\n  var forOfPath;\n  var functionPath;\n  return transformAsync(code, {\n    configFile: false,\n    plugins: [\n      __dirname + '/../../../../lib/index.js',\n      {\n        post({ path }) {\n          programPath = path;\n          path.traverse({\n            ForOfStatement(path) {\n              forOfPath = path;\n            },\n            FunctionExpression(path) {\n              functionPath = path;\n            },\n          });\n        },\n      },\n    ],\n  }).then(() => {\n    expect(Object.keys(programPath.scope.bindings)).toEqual(['foo', 'bar']);\n    // for declarations should be transformed to for bindings\n    expect(forOfPath.scope.bindings).toEqual({});\n    // The body should be wrapped into closure\n    expect(forOfPath.get('body').scope.bindings).toEqual({});\n    expect(Object.keys(functionPath.scope.bindings)).toEqual(['foo', 'qux', 'quux']);\n  });\n});",
  "var _loopResult;\nvar _loop = (foo, bar) => {\n  () => foo;\n  var [qux] = bar;\n  try {\n  } catch (e) {\n    var quux = qux;\n  }\n  return {\n    type: 'normal',\n    vars: [foo, bar],\n  };\n};\nfor (var { foo, ...bar } of {}) {\n  _loopResult = _loop(foo, bar);\n  foo = _loopResult.vars[0];\n  bar = _loopResult.vars[1];\n}",
  'foo.func1 = function () {\n  if (cond1) {\n    for (;;) {\n      if (cond2) {\n        function func2() {}\n        function func3() {}\n        func4(function () {\n          func2();\n        });\n        break;\n      }\n    }\n  }\n};',
  '{\n  switch (1) {\n    case 1:\n      expect(f()).toBe(1);\n      function f() {\n        return 1;\n      }\n  }\n}',
  "var res = [];\nvar i = 0;\nvar _loopResult;\nvar _loop = i => {\n  res.push((() => i)());\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}\nexpect(res).toEqual([4, 5]);",
  "var i;\nvar _loopResult;\nvar _loop = i => {\n  () => i;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}",
  "var res = [];\nvar i = 0;\nvar _loopResult;\nvar _loop = i => {\n  var y = i;\n  res.push((() => y)());\n  i++;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 1; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}\nexpect(res).toEqual([1, 3, 5]);",
  "var i;\nvar _loopResult;\nvar _loop = i => {\n  var y = i;\n  () => y;\n  i++;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}",
  "var res = [];\nvar _loopResult;\nvar _loop = i => {\n  var x = i;\n  res.push((() => x)());\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 1; i < 3; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}\nvar _loopResult8;\nvar _loop7 = i => {\n  var y = i;\n  res.push((() => y)());\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult8 = _loop7(_i);\n  _i = _loopResult8.vars[0];\n}\nexpect(res).toEqual([1, 2, 4, 5]);",
  "var _loopResult;\nvar _loop = i => {\n  var x = i;\n  () => x;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 1; i < 3; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}\nvar _loopResult6;\nvar _loop5 = i => {\n  var y = i;\n  () => y;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult6 = _loop5(_i);\n  _i = _loopResult6.vars[0];\n}",
  "var res = [];\nvar i = 0;\nvar _loopResult;\nvar _loop = i => {\n  var y = i;\n  res.push((() => y)());\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}\nexpect(res).toEqual([4, 5]);",
  "var i;\nvar _loopResult;\nvar _loop = i => {\n  var y = i;\n  () => y;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 4; _i < 6; _i++) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}",
  'var count = 0;\nfor (var outer = 0; outer < 2; outer++) {\n  do {\n    for (var done; !done; done = true) {\n      count++;\n    }\n  } while (false);\n}\nexpect(count).toBe(2);',
  'var count = 0;\nfor (var outer = 0; outer < 2; outer++) {\n  for (var done; !done; done = true) {\n    count++;\n  }\n}\nexpect(count).toBe(2);',
  'if (true) {\n  function foo() {}\n  function bar() {\n    return foo;\n  }\n  for (var x in {}) {\n  }\n}',
  'function WithoutCurlyBraces() {\n  if (true)\n    for (var k in kv) {\n      function foo() {\n        return this;\n      }\n      function bar() {\n        return foo.call(this);\n      }\n      console.log(this, k);\n    }\n}\nfunction WithCurlyBraces() {\n  if (true) {\n    for (var k in kv) {\n      function foo() {\n        return this;\n      }\n      function bar() {\n        return foo.call(this);\n      }\n      console.log(this, k);\n    }\n  }\n}',
  '(function foo() {\n  var _foo = true;\n});',
  "'use strict';\nvar results = [0, 1, 2];\nvar fns = [];\nvar _loopResult;\nvar _loop = result => {\n  result = result * 2;\n  fns.push(() => {\n    return result;\n  });\n  return {\n    type: 'normal',\n    vars: [result],\n  };\n};\nfor (var result of results) {\n  _loopResult = _loop(result);\n  result = _loopResult.vars[0];\n}\nexpect(fns[0]()).toBe(0);\nexpect(fns[1]()).toBe(2);\nexpect(fns[2]()).toBe(4);",
  "var _loopResult;\nvar _loop = result => {\n  result = otherValue;\n  fn(() => {\n    result;\n  });\n  return {\n    type: 'normal',\n    vars: [result],\n  };\n};\nfor (var result of results) {\n  _loopResult = _loop(result);\n  result = _loopResult.vars[0];\n}",
  'for (var a, { b } = {}; ;) {\n  var _a = void 0,\n    { b: _b } = {};\n  {\n    var _a2 = void 0,\n      { b: _b2 } = {};\n  }\n}',
  "for (var i = 0; i < 3; i++) {\n  var _i = 'abc';\n  console.log(_i);\n  {\n    var _i2 = 'hello';\n  }\n}",
  "var arr = [];\nfor (var i = 0; i < 10; i++) {\n  var _loopResult;\n  var _loop = i => {\n    arr.push(() => i);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var _i = 0; _i < 10; _i++) {\n    _loopResult = _loop(_i);\n    _i = _loopResult.vars[0];\n  }\n}",
  'var a = 1;\nfor (var _a = 2, i = _a + 1; i < 10; i++) {\n  console.log(i);\n}\nfor (var _a2 in [1, 2, 3]) {\n  var _a3 = 3;\n  console.log(_a3);\n}',
  '// #1683\nvar arr = [];\nfor (var i = 0; i < 4; ++i) {\n  arr.push(<i></i>);\n}',
  "outer: while (t) {\n  inner: while (t2) {\n    var _loopResult;\n    var _loop = i => {\n      later(() => i);\n      if (test1)\n        return {\n          type: 'break:outer',\n          vars: [i],\n        };\n      else if (test2)\n        return {\n          type: 'break:inner',\n          vars: [i],\n        };\n      else if (test3)\n        return {\n          type: 'continue:outer',\n          vars: [i],\n        };\n      else if (test4)\n        return {\n          type: 'continue:inner',\n          vars: [i],\n        };\n      else if (test5)\n        return {\n          type: 'break',\n          vars: [i],\n        };\n      else if (test6)\n        return {\n          type: 'continue',\n          vars: [i],\n        };\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    for (var i = 0; i < 3; i++) {\n      _loopResult = _loop(i);\n      i = _loopResult.vars[0];\n      if (_loopResult.type === 'break') break;\n      if (_loopResult.type === 'break:inner') break inner;\n      if (_loopResult.type === 'break:outer') break outer;\n      if (_loopResult.type === 'continue') continue;\n      if (_loopResult.type === 'continue:inner') continue inner;\n      if (_loopResult.type === 'continue:outer') continue outer;\n    }\n  }\n}",
  "var _loopResult;\nvar _loop = () => {\n  var z = 3;\n  () => z;\n  switch (true) {\n    case true:\n      return {\n        type: 'break:loop',\n        vars: [],\n      };\n  }\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nloop: for (var i = 0; i < 10; i++) {\n  _loopResult = _loop();\n  if (_loopResult.type === 'break:loop') break loop;\n}",
  "var _loopResult;\nvar _loop = i => {\n  if (i === 0) {\n    function test() {\n      return i;\n    }\n  }\n  expect(test()).toBe(0);\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 0; i < 3; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "var run = [];\nvar _loopResult;\nvar _loop = i => {\n  run.push(\n    class C {\n      x = i;\n    },\n  );\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 0; i < 2; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}\nexpect(new run[0]().x).toBe(0);\nexpect(new run[1]().x).toBe(1);",
  "var _loopResult;\nvar _loop = i => {\n  class C {\n    x = i;\n  }\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var i = 0; i < 2; i++) {\n  _loopResult = _loop(i);\n  i = _loopResult.vars[0];\n}",
  "var objects = [];\nvar i2 = 0;\nvar _loopResult;\nvar _loop = () => {\n  var captured = i2;\n  i2++;\n  objects.push({\n    foo() {\n      return captured;\n    },\n  });\n  return {\n    type: 'normal',\n    vars: [],\n  };\n};\nfor (var i = 0; i < 10; i++) {\n  _loopResult = _loop();\n}\nexpect(objects[0].foo()).toBe(0);\nexpect(objects[1].foo()).toBe(1);",
  'while (value) {\n  var foo = void 0;\n  if (bar) {\n    foo = [];\n  }\n  if (foo) {\n    doIt();\n  }\n}',
  "function foo() {\n  var x = 5;\n  console.log(x);\n  {\n    var _x = 7;\n    setTimeout(() => _x, 0);\n  }\n}\nfunction bar() {\n  var x = 5;\n  console.log(x);\n  var _loopResult;\n  var _loop = i => {\n    {\n      var _x2 = i;\n      setTimeout(() => _x2, 0);\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 7; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n}\nfunction baz() {\n  var x = 5;\n  console.log(x);\n  var _loopResult12;\n  var _loop11 = i => {\n    var qux = function qux(y) {\n      var _x3 = y;\n      setTimeout(() => _x3, 0);\n    };\n    qux(i);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 7; i++) {\n    _loopResult12 = _loop11(i);\n    i = _loopResult12.vars[0];\n  }\n}",
  "var test = 'foo';",
  "window.test = () => {\n  var e = 'TEST';\n  switch (e) {\n    case 'TEST':\n      var _e = [];\n      _e.push('111');\n      alert(_e);\n      break;\n    default:\n      alert('666');\n      break;\n  }\n};\nwindow.test = () => {\n  var e = 'TEST';\n  switch (e) {\n    case 'TEST':\n      var _e2 = [];\n      switch (_e2) {\n      }\n  }\n};",
  "var f1, f2;\n{\n  var z = 'z1 value';\n  f1 = function () {\n    return z;\n  };\n}\n{\n  var _z = 'z2 value';\n  f2 = function () {\n    return _z;\n  };\n}\nf1();\nf2();",
  "function foo() {\n  var _loopResult;\n  var _loop = () => {\n    switch (2) {\n      case 0: {\n        if (true) {\n          return {\n            type: 'return',\n            value: void 0,\n            vars: [],\n          };\n        }\n        var stuff = new Map();\n        var data = 0;\n        stuff.forEach(() => {\n          var d = data;\n        });\n        break;\n      }\n    }\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  while (true) {\n    _loopResult = _loop();\n    if (_loopResult.type === 'return') return _loopResult.value;\n  }\n}",
  "function fn() {\n  var _loopResult;\n  var _loop = () => {\n    switch (true) {\n      default:\n        var foo = 4;\n        if (true) {\n          var bar = () => foo;\n          console.log(bar());\n        }\n    }\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  while (true) {\n    _loopResult = _loop();\n  }\n}",
  'switch (x) {\n  default:\n    var _x;\n}',
  'var a = true;\nvar b = false;\nclass e {}\nfunction f() {}\nswitch (a) {\n  case true:\n    var c = 2;\n    var foo = true;\n    break;\n  case false:\n    var d = 3;\n    foo = false;\n    break;\n}\nswitch (true) {\n  case true:\n    var _a = false;\n    var _b = true;\n    var _c = 4;\n    var _d = 5;\n  case false:\n    class e {}\n    function f() {}\n}',
  '{\n  await using foo = null;\n}',
  '{\n  using foo = null;\n}',
  "var _loopResult;\nvar _loop = index => {\n  if (index % 2) {\n    index += 3;\n    return {\n      type: 'continue',\n      vars: [index],\n    };\n  }\n  var fn = function () {\n    index;\n  };\n  return {\n    type: 'normal',\n    vars: [index],\n  };\n};\nfor (var index = 0; index < 10; index++) {\n  _loopResult = _loop(index);\n  index = _loopResult.vars[0];\n  if (_loopResult.type === 'continue') continue;\n}",
  "var a = 1;\nvar _loopResult;\nvar _loop = a => {\n  items.forEach(item => a);\n  return {\n    type: 'normal',\n    vars: [a],\n  };\n};\nfor (var _a = 1; _a < 100; _a++) {\n  _loopResult = _loop(_a);\n  _a = _loopResult.vars[0];\n}\nconsole.log(a);",
  "// Test 1: switch(e)\nfunction test(e) {\n  var i = e;\n  {\n    var _e3 = i[0];\n    switch (_e3) {\n      case 'n':\n        var _e4 = 1;\n        return true;\n      default:\n        return false;\n    }\n  }\n}\nconsole.log(test('nn'));\n// Test 2: switch(e.x)\nfunction test2(e) {\n  var i = e;\n  {\n    var _e5 = { x: 'test' };\n    switch (_e5.x) {\n      case 'test':\n        var _e6 = 1;\n        return true;\n      default:\n        return false;\n    }\n  }\n}\nconsole.log(test2({ x: 'n' }));\n// Test 3: switch(e.x + e.y)\nfunction test3(e) {\n  var i = e;\n  {\n    var _e7 = {\n      x: 'te',\n      y: 'st',\n    };\n    switch (_e7.x + _e7.y) {\n      case 'test':\n        var _e8 = 1;\n        return true;\n      default:\n        return false;\n    }\n  }\n}\nconsole.log(\n  test3({\n    x: 'x',\n    y: 'y',\n  }),\n);\n// Test 4: switch(e.f())\nfunction test4(e) {\n  var i = e;\n  {\n    var _e9 = { f: () => 'test' };\n    switch (_e9.f()) {\n      case 'test':\n        var _e10 = 1;\n        return true;\n      default:\n        return false;\n    }\n  }\n}\nconsole.log(test4({ f: () => 'test' }));\n// Test 5: switch(id(e))\nfunction id(v) {\n  return v;\n}\nfunction test5(e) {\n  var i = e;\n  {\n    var _e = i[0];\n    switch (id(_e)) {\n      case 'n':\n        var _e2 = 1;\n        return true;\n      default:\n        return false;\n    }\n  }\n}\nconsole.log(test5('nn'));",
  'function A() {\n  var a;\n}\nfunction B() {\n  var a;\n}',
  "// https://github.com/babel/babel/pull/15361\nfunction fooBar(arrayOfThings) {\n  var _loopResult;\n  var _loop = index => {\n    var thing = arrayOfThings[index];\n    var someMapObj = {};\n    var arrow = x => someMapObj;\n    arrow(0);\n    return {\n      type: 'normal',\n      vars: [index],\n    };\n  };\n  for (var index = 0; index < arrayOfThings.length; index++) {\n    _loopResult = _loop(index);\n    index = _loopResult.vars[0];\n  }\n}\nfooBar([1, 2, 3]);",
  "var _loopResult;\nvar _loop = index => {\n  index++;\n  () => index;\n  return {\n    type: 'normal',\n    vars: [index],\n  };\n};\nfor (var index = 0; index < 10; index++) {\n  _loopResult = _loop(index);\n  index = _loopResult.vars[0];\n}",
  "// https://github.com/babel/babel/issues/15397\nvar i;\nvar _loopResult;\nvar _loop = i => {\n  i++;\n  () => i;\n  return {\n    type: 'normal',\n    vars: [i],\n  };\n};\nfor (var _i = 0; _i < 1;) {\n  _loopResult = _loop(_i);\n  _i = _loopResult.vars[0];\n}",
  'expect(() => {\n  f();\n  var f = function f() {};\n}).toThrow(ReferenceError);',
  'f();\nvar f = function f() {};',
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nfunction callNow(f) {\n  f();\n}\nfunction callLater(f) {\n  return () => f();\n}\nexpect(() => {\n  var x = 0;\n  (1, _readOnlyError('x'));\n}).toThrow(TypeError);\nexpect(() => {\n  (1, _readOnlyError('x'));\n  var x = 0;\n}).toThrow(ReferenceError);\nexpect(() => {\n  callNow(() => {\n    (1, _readOnlyError('x'));\n  });\n  var x = 0;\n}).toThrow(ReferenceError);\nexpect(() => {\n  var call = callLater(() => {\n    (1, _readOnlyError('x'));\n  });\n  var x = 0;\n  call();\n}).toThrow(TypeError);",
  "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\nmaybeCallLater(function () {\n  (2, _readOnlyError('x'));\n});\nvar x = 0;\n(1, _readOnlyError('x'));",
  'expect(() => {\n  var { b: d } = { d };\n}).toThrow(ReferenceError);',
  'var { b: d } = { d };',
  'import { foo } from \'somewhere\';\n// foo might call "bar"\nfoo();\na;\nvar a;\na;\nexport function bar() {\n  return a;\n}',
  'expect(() => {\n  function f() {\n    x;\n  }\n  var x;\n  f();\n}).not.toThrow();',
  'function f() {\n  x;\n}\nvar x;\nf();',
  'expect(() => {\n  function f() {\n    x;\n  }\n  f();\n  var x;\n}).toThrow(ReferenceError);',
  'function f() {\n  x;\n}\nf();\nvar x;',
  'expect(() => {\n  function f() {\n    x;\n  }\n  Math.random() === 2 && f();\n  var x;\n  f();\n}).not.toThrow();',
  'function f() {\n  x;\n}\nMath.random() === 2 && f();\nvar x;\nf();',
  'function f() {\n  x;\n}\nMath.random() === 2 && f();\nvar x = 3;\nexpect(x).toBe(3);',
  '// "random" :)\nvar random = (i => {\n  var vals = [0, 0, 1, 1];\n  return () => vals[i++];\n})(0);\nexpect(() => {\n  function f() {\n    x;\n  }\n  random() && f();\n  var x;\n}).not.toThrow();\nexpect(() => {\n  function f() {\n    x;\n  }\n  random() || f();\n  var x;\n}).toThrow(ReferenceError);\nexpect(() => {\n  function f() {\n    x;\n  }\n  random() && f();\n  var x;\n}).toThrow(ReferenceError);\nexpect(() => {\n  function f() {\n    x;\n  }\n  random() || f();\n  var x;\n}).not.toThrow();',
  'function f() {\n  x;\n}\nMath.random() && f();\nvar x;',
  'expect(() => {\n  function f() {\n    return function () {\n      x;\n    };\n  }\n  var g = f();\n  var x;\n  g();\n}).not.toThrow();\nexpect(() => {\n  function f() {\n    return function () {\n      x;\n    };\n  }\n  var g = f();\n  g();\n  var x;\n}).toThrow(ReferenceError);',
  'function f() {\n  return function () {\n    x;\n  };\n}\nf();\nvar x;',
  'expect(() => {\n  function f(i) {\n    if (i) f(i - 1);\n    x;\n  }\n  var x;\n  f(3);\n}).not.toThrow();',
  'function f(i) {\n  if (i) f(i - 1);\n  x;\n}\nvar x;\nf(3);',
  'expect(() => {\n  function f(i) {\n    if (i) f(i - 1);\n    x;\n  }\n  f(3);\n  var x;\n}).toThrow(ReferenceError);',
  'function f(i) {\n  if (i) f(i - 1);\n  x;\n}\nf(3);\nvar x;',
  'expect(() => {\n  function f(i) {\n    return () => {\n      x;\n      f(i - 1);\n    };\n  }\n  var g = f(1);\n  var x;\n  g();\n}).not.toThrow();',
  'function f(i) {\n  return () => {\n    x;\n    f(i - 1);\n  };\n}\nvar g = f(1);\nvar x;\ng();',
  'f(() => a);\nvar a;\nvar b;\nf(() => b);',
  'function f() {\n  x;\n}\nmaybeCall(f);\nvar x;',
  'expect(() => {\n  f();\n\n  function f() {}\n}).not.toThrow();',
  'f();\n\nfunction f() {}',
  'expect(() => {\n  x = 3;\n\n  var x;\n}).not.toThrow();',
  'x = 3;\n\nvar x;',
  'expect(() => {\n  var x = x;\n}).toThrow(ReferenceError);',
  'var x = x;',
  'expect(() => {\n  var a = 5;\n  if (a) {\n    _a;\n    var _a = 2;\n  }\n  a;\n}).toThrow(ReferenceError);',
  'var a = 5;\nif (a) {\n  _a;\n  var _a = 2;\n}\na;',
  'var i;\ni = 2;',
  'expect(() => {\n  i = 2;\n  var i;\n}).toThrow(ReferenceError);',
  'i = 2;\nvar i;',
  'expect(() => {\n  i;\n  var i;\n}).toThrow(ReferenceError);',
  'i;\nvar i;',
  'var x;\nswitch (x) {\n  default:\n    var _x;\n}',
  'maybeCallLater(function f() {\n  x++;\n  ++x;\n  x.p++;\n  ++x.p;\n});\nx++;\n++x;\nx.p++;\n++x.p;\nvar x;',
] as const;

export const fixtureCases = [
  {
    title: 'const violations — assignment expression (exec)',
    source:
      'const state1 = {};\nexpect(function() {\n  const a = 3;\n  let b = 1;\n  state1.getA = () => a;\n  state1.getB = () => b;\n\n  a += b++;\n}).toThrow(\'"a" is read-only\');\nexpect(state1.getA()).toBe(3); // Assignment did not succeed\nexpect(state1.getB()).toBe(2); // `b++` was evaluated before error thrown\n\nconst state2 = {};\nexpect(function() {\n  const a = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    }\n  };\n  state2.a = a;\n  state2.getA = () => a;\n  state2.getB = () => b;\n\n  let b = 1;\n  a += b++;\n}).toThrow(\'"a" is read-only\');\nexpect(state2.getA()).toBe(state2.a); // Assignment did not succeed\nexpect(state2.getB()).toBe(2); // `b++` was evaluated before error thrown\nexpect(state2.valueOfIsCalled).toBe(true); // `a` was read before error thrown\n\nconst state3 = {};\nexpect(function() {\n  const a = 32;\n  let b = 1;\n  state3.getA = () => a;\n  state3.getB = () => b;\n\n  a >>>= ++b;\n}).toThrow(\'"a" is read-only\');\nexpect(state3.getA()).toBe(32); // Assignment did not succeed\nexpect(state3.getB()).toBe(2); // `++b` was evaluated before error thrown\n\nconst state4 = {};\nexpect(function() {\n  const a = 1;\n  let b = 1;\n  state4.getA = () => a;\n  state4.getB = () => b;\n\n  a &&= ++b;\n}).toThrow(\'"a" is read-only\');\nexpect(state4.getA()).toBe(1); // Assignment did not succeed\nexpect(state4.getB()).toBe(2); // `++b` was evaluated before error thrown\n\n{\n  const a = 1;\n  let b = 1;\n  a ||= ++b;\n\n  expect(a).toBe(1); // Assignment not made\n  expect(b).toBe(1); // `++b` was not evaluated\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'const violations — assignment expression (input)',
    source:
      'const a = 5;\nlet b = 0;\na += b++;\na >>>= b++;\na ||= b++;\na &&= b++;\na ??= b++;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'const violations — assignment in for loop (exec)',
    source:
      'expect(function () {\n    for (const element = 1; element++;) break;\n}).toThrow(\'"element" is read-only\');\n\nexpect(function () {\n    for (;;) {\n        const from = 50;\n        from--;\n        break;\n    }\n}).toThrow(\'"from" is read-only\');\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'const violations — assignment in for loop (input)',
    source: 'for (const element = 1; element++;) {\n  const from = 50;\n  from--;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'const violations — assignment in for of loop (exec)',
    source:
      'expect(function () {\n    const array = [1, 2, 3];\n    for (const element of array) {\n        const from = 50;\n        from--;\n    }\n}).toThrow(\'"from" is read-only\');',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'const violations — assignment in for of loop (input)',
    source: 'for (const element of []) {\n  const from = 50;\n  from--;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'const violations — block scoped (exec)',
    source: 'const bar = 123;\n{ const bar = 456; }\nexpect(bar).toBe(123);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'const violations — block statement (input)',
    source:
      'for (let i in arr) {\n  const MULTIPLIER = 5;\n  console.log(arr[i] * MULTIPLIER);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'const violations — deadcode violation (exec)',
    source:
      'function f() {\n  const a = "foo";\n\n  if (false) a = "false";\n\n  return a;\n}\n\nexpect(f()).toBe("foo");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'const violations — deadcode violation (input)',
    source: '(function(){\n  const a = "foo";\n\n  if (false) a = "false";\n\n  return a;\n})();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'const violations — destructuring assignment (exec)',
    source:
      'expect(function() {\n  const [a, b] = [1, 2];\n  a = 3;\n}).toThrow(\'"a" is read-only\');\n\nexpect(function() {\n  const a = 1;\n  [a] = [2];\n}).toThrow(\'"a" is read-only\');\n\nexpect(function() {\n  const b = 1;\n  ({b} = {b: 2});\n}).toThrow(\'"b" is read-only\');\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'const violations — destructuring assignment (input)',
    source: 'const [a, b] = [1, 2];\na = 3;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'const violations — destructuring (input)',
    source:
      'const [a, b] = [1, 2];\nconst [c, d] = [3, 4];\nconst { e, f } = { e: 5, f: 6 };\nconst { a: g, b: h } = { a: 7, b: 8 };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'const violations — flow declar (input)',
    source: '// @flow\ndeclare class foo {}\nconst foo1 = 1;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'const violations — ignore member expressions (input)',
    source: 'const x = {};\nx.key = "value";\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'const violations — loop (exec)',
    source:
      'expect(function() {\n  for (const i = 0; i < 3; i = i + 1) {\n    // whatever\n  }\n}).toThrow(\'"i" is read-only\');\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'const violations — loop (input)',
    source:
      'for (const i = 0; i < 3; i = i + 1) {\n  console.log(i);\n}\n\nfor (const j = 0; j < 3; j++) {\n  console.log(j);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'const violations — nested update expressions (exec)',
    source:
      'expect(function() {\n  const c = 17;\n  let a = 0;\n\n  function f() {\n    return ++c+--a;\n  }\n\n  f();\n\n}).toThrow(\'"c" is read-only\');\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'const violations — nested update expressions (input)',
    source: 'const c = 17;\nlet a = 0;\n\nfunction f() {\n  return ++c+--a;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'const violations — no assignment (exec)',
    source:
      'const state1 = {};\nexpect(function() {\n  const a = 3;\n  state1.getA = () => a;\n\n  a = 7;\n}).toThrow(\'"a" is read-only\');\nexpect(state1.getA()).toBe(3); // Assignment did not succeed\n\nconst state2 = {};\nexpect(function() {\n  const a = 3;\n  let b = 0;\n  state2.getA = () => a;\n  state2.getB = () => b;\n\n  a = b++;\n}).toThrow(\'"a" is read-only\');\nexpect(state2.getA()).toBe(3); // Assignment did not succeed\nexpect(state2.getB()).toBe(1); // `b++` was evaluated before error thrown\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'const violations — no assignment (input)',
    source:
      'const MULTIPLIER = 5;\nMULTIPLIER = "overwrite";\n\nconst a = 5;\nlet b = 0;\na = b++;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'const violations — no for in (exec)',
    source:
      "const state = {};\nfunction f(arr) {\n  const MULTIPLIER = 5;\n  state.getMultiplier = () => MULTIPLIER;\n\n  for (MULTIPLIER in arr);\n\n  return 'survived';\n}\n\nexpect(function() {\n  f([1,2,3]);\n}).toThrow('\"MULTIPLIER\" is read-only');\nexpect(state.getMultiplier()).toBe(5); // Assignment did not succeed\n\nexpect(f([])).toBe('survived');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'const violations — no for in (input)',
    source: 'const MULTIPLIER = 5;\n\nfor (MULTIPLIER in arr);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'const violations — program (input)',
    source:
      'const MULTIPLIER = 5;\n\nfor (var i in arr) {\n  console.log(arr[i] * MULTIPLIER);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'const violations — shadowing function declaration (input)',
    source: 'function B() {\n  const B = 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'const violations — shadowing function expression (input)',
    source: '(function B() {\n  const B = 1;\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'const violations — update expression prefix (exec)',
    source:
      'const state1 = {};\nexpect(function() {\n  const a = "str";\n  state1.getA = () => a;\n\n  --a;\n}).toThrow(\'"a" is read-only\');\nexpect(state1.getA()).toBe("str"); // Assignment did not succeed\n\nconst state2 = {};\nexpect(function() {\n  const b = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    }\n  };\n  state2.b = b;\n  state2.getB = () => b;\n\n  --b;\n}).toThrow(\'"b" is read-only\');\nexpect(state2.getB()).toBe(state2.b); // Assignment did not succeed\nexpect(state2.valueOfIsCalled).toBe(true); // `bar` was read before error thrown\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'const violations — update expression prefix (input)',
    source: 'const a = "str";\n--a;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'const violations — update expression (exec)',
    source:
      'const state1 = {};\nexpect(function() {\n  const foo = 1;\n  state1.getFoo = () => foo;\n\n  foo++;\n}).toThrow(\'"foo" is read-only\');\nexpect(state1.getFoo()).toBe(1); // Assignment did not succeed\n\nconst state2 = {};\nexpect(function() {\n  const bar = {\n    valueOf() {\n      state2.valueOfIsCalled = true;\n    }\n  };\n  state2.bar = bar;\n  state2.getBar = () => bar;\n\n  bar++;\n}).toThrow(\'"bar" is read-only\');\nexpect(state2.getBar()).toBe(state2.bar); // Assignment did not succeed\nexpect(state2.valueOfIsCalled).toBe(true); // `bar` was read before error thrown\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'const violations — update expression (input)',
    source: 'const foo = 1;\nfoo++;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 async generator (input)',
    source:
      '// NOTE: When compiling async generators,\n// we run the async-generator-functions transform\n// as soon as in Program:enter, so when the block-scoping plugin\n// runs it has already been transpiled to a plain function.\n// The functions is thus visible to the outer scope.\n// This is a bug.\n\nif (true) {\n  async function* run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 async (input)',
    source:
      'if (true) {\n  async function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision const (input)',
    source:
      'const run = function () {\n  return false;\n};\n\nif (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision let (input)',
    source:
      'let run = function () {\n  return false;\n};\n\nif (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision var (input)',
    source:
      'var run = function () {\n  return false;\n};\n\nif (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 generator (input)',
    source:
      'if (true) {\n  function* run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in class (exec)',
    source:
      'class A {\n  m() {\n    if (true) {\n      function f() {\n        return true;\n      }\n    }\n\n    function g() {\n      return f();\n    }\n\n    return g();\n  }\n}\n\nexpect(new A().m).toThrow(ReferenceError);',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in class (input)',
    source:
      'class A {\n  m() {\n    if (true) {\n      function f() {\n        return true;\n      }\n    }\n\n    function g() {\n      return f();\n    }\n\n    return g();\n  }\n}\n\nexpect(new A().m).toThrow(ReferenceError);',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in module expression (input)',
    source:
      'const m = module {\n  if (true) {\n    function f() {\n      return true;\n    }\n  }\n\n  function g() {\n    return f();\n  }\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 module (input)',
    source:
      'if (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'general — annex B_3_3 (input)',
    source:
      'if (true) {\n  function run() {\n    return true;\n  }\n}\n\nfunction test() {\n  return run();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'general — assignment patterns (input)',
    source:
      'const foo = "foo";\n\nfunction foobar() {\n  for (let item of [1, 2, 3]) {\n    let foo = "bar";\n    [bar, foo] = [1, 2];\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'general — block inside switch inside loop (exec)',
    source:
      "// it shouldn't break on a case-break statement\nvar i;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 1: {\n      break;\n    }\n  }\n\n  const z = 3; // to force the plugin to convert to loop function call\n  () => z;\n}\n\nexpect(i).toBe(10);\n\n// it should continue on continue statements within switch\nvar j = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0: {\n      continue;\n    }\n  }\n  j++;\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(9);\n\n// it should work with loops nested within switch\nj = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0: {\n      for (var k = 0; k < 10; k++) {\n        const z = 3;\n        () => z;\n        j++;\n        break;\n      }\n      break;\n    }\n  }\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(1);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'general — block inside switch inside loop (input)',
    source:
      "// it shouldn't break on a case-break statement\nvar i;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 1:\n      break;\n  }\n\n  const z = 3; // to force the plugin to convert to loop function call\n  () => z;\n}\n\nexpect(i).toBe(10);\n\n// it should continue on continue statements within switch\nvar j = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0:\n      continue;\n  }\n  j++;\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(9);\n\n// it should work with loops nested within switch\nj = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0:\n      for (var k = 0; k < 10; k++) {\n        const z = 3;\n        () => z;\n        j++;\n        break;\n      }\n      break;\n  }\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(1);\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'general — block not shadow global (input)',
    source:
      '{ a; }\n{ let a; }\n\n(function () {\n  { b; }\n  { let b; }\n})();\n\n{ c = 0; }\n{ let c; }\n\n(function () {\n  { d = 0; }\n  { let d; }\n})',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'general — block not shadow outer variable (exec)',
    source:
      'let a = 1;\n\nfunction f() {\n  let res;\n  { res = a; }\n  { let a = 2; }\n  return res;\n}\n\nexpect(f()).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'general — block not shadow outer variable (input)',
    source: 'let a = 1;\n\nfunction f() {\n  { console.log(a); }\n  { let a = 2; }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'general — closure in generator or async (exec)',
    source:
      '(function () {\nfunction* a() {\n  do {\n    let x = yield "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n\nasync function b() {\n  do {\n    let x = await "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n\nasync function* c() {\n  do {\n    let x = yield "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n\nreturn (async () => {\n  let it = a();\n  expect(it.next().value).toBe("iteration");\n  expect(it.next("foo").value()).toBe("foo");\n\n  expect((await b())()).toBe("iteration");\n\n  it = c();\n  expect((await it.next()).value).toBe("iteration");\n  expect((await it.next("foo")).value()).toBe("foo");\n})();\n\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'general — closure in generator or async (input)',
    source:
      'function* a() {\n  do {\n    let x = yield "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n\nasync function b() {\n  do {\n    let x = await "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n\nasync function* c() {\n  do {\n    let x = yield "iteration";\n    var fn = () => x;\n  } while (false);\n  return fn;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'general — for break continue closure (exec)',
    source:
      'expect(() => {\n  for (const a of [1]) {\n    switch (true) {\n      case true: {\n        const b = 1;\n        () => b;\n        if (true) break;\n        continue;\n      }\n      case false: {\n        throw new Error("unreachable");\n      }\n    }\n  }\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'general — for break continue closure (input)',
    source:
      'for (const a of [1]) {\n  switch (true) {\n    case true: {\n      const b = 1;\n      () => b;\n      if (true) break;\n      continue;\n    }\n    case false: {\n      throw new Error("unreachable");\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'general — for break continue return (input)',
    source:
      '(function () {\n  for (let i in nums) {\n    fns.push(function () { return i; });\n    if (i === 1) {\n      continue;\n    } else if (i === 2) {\n      break;\n    } else if (i === 3) {\n      return i;\n    }\n  }\n})();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'general — for break (input)',
    source: 'for (let i in nums) {\n  fns.push(function () { return i; });\n  break;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[49],
      },
    ],
  },
  {
    title: 'general — for const closure (input)',
    source:
      'for (let i = 0; i < 5; i++) {\n  const l = i;\n  setTimeout(function() {\n    console.log(l);\n  }, 1);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'general — for continuation (input)',
    source: 'for (let i = 0; i < 2; i++) {\n  () => { i };\n  console.log(i);\n  i += 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[51],
      },
    ],
  },
  {
    title: 'general — for continue (input)',
    source: 'for (let i in nums) {\n  fns.push(function () { return i; });\n  continue;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'general — for inside for x (input)',
    source:
      'function w() {\n    for (let i = 0; i < y; i++) {\n        let outer = {}\n        for (var key in someObj) {\n            let x = () => outer;\n        }\n    }\n}\n\nfunction w2() {\n    for (let i = 0; i < y; i++) {\n        let outer = {}\n        for (var key of someObj) {\n            let x = () => outer;\n        }\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[53],
      },
    ],
  },
  {
    title: 'general — for return undefined (input)',
    source:
      '(function () {\n  for (let i in nums) {\n    fns.push(function () { return i; });\n    return;\n  }\n})();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'general — for return (input)',
    source:
      '(function () {\n  for (let i in nums) {\n    fns.push(function () { return i; });\n    return i;\n  }\n})();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[55],
      },
    ],
  },
  {
    title: 'general — for variable update different captured (exec)',
    source:
      'let res = [];\n\nfor (let i = 1; i < 6; i++) {\n  let y = i;\n  res.push((() => y)());\n  i++;\n}\n\nexpect(res).toEqual([1, 3, 5]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'general — for variable update different captured (input)',
    source: 'for (let i = 4; i < 6; i++) {\n  let y = i;\n  () => y;\n  i++;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[57],
      },
    ],
  },
  {
    title: 'general — for without block (exec)',
    source:
      'function proxyObserver(properties) {\n  for (let key in properties)\n    if (properties[key].observer) {\n      let base = properties[key].observer;\n      properties[key].observer = () => {\n        return base.apply(this);\n      };\n    }\n\n  return properties;\n}\n\nconst results = proxyObserver([\n  { observer: () => 1 },\n  { observer: () => 2 },\n])\nexpect(results[0].observer()).toBe(1)\nexpect(results[1].observer()).toBe(2)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'general — for without block (input)',
    source:
      'function proxyObserver(component) {\n  for (let key in component.properties)\n    if (component.properties[key].observer) {\n      let base = component.properties[key].observer;\n      component.properties[key].observer = () => {\n        base.apply(this);\n      };\n    }\n\n  return component;\n}\n\nfunction proxyObserver2(component) {\n  for (let key of component.properties)\n    while (1) {\n      let base = component.properties[key].observer;\n      component.properties[key].observer = () => {\n        base.apply(this);\n      };\n    }\n\n  return component;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[59],
      },
    ],
  },
  {
    title: 'general — for x inside for (input)',
    source:
      'function w() {\n  for (let key in someObj) {\n    let outer = {}\n    for (var i = 0; i < y; i++) {\n      let x = () => outer;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'general — function in catch (input)',
    source: 'try {\n  foo();\n} catch (x) {\n  function harmless(x) {\n    return x;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[61],
      },
    ],
  },
  {
    title: 'general — function name (input)',
    source: 'let foo = () => {\n  foo = () => { };\n};\n\nfoo();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'general — function (input)',
    source: 'function test() {\n  let foo = "bar";\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[63],
      },
    ],
  },
  {
    title: 'general — hoisting (input)',
    source:
      'for (let i of nums) {\n  var x = 5;\n  var { f } = { f: 2 };\n  fns.push(function () {\n    return i * x;\n  });\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'general — issue 10339 (exec)',
    source:
      '(function () {\nconst code = `\n  for (const {foo, ...bar} of { bar: [] }) {\n    () => foo;\n    const [qux] = bar;\n    try {} catch (e) {\n      let quux = qux;\n    }\n  }\n`;\n\nlet programPath;\nlet forOfPath;\nlet functionPath;\n\nreturn transformAsync(code, {\n  configFile: false,\n  plugins: [\n    __dirname + "/../../../../lib/index.js",\n    {\n      post({ path }) {\n        programPath = path;\n        path.traverse({\n          ForOfStatement(path) { forOfPath = path },\n          FunctionExpression(path) { functionPath = path }\n        });\n      }\n    }\n  ]\n}).then(() => {\n  expect(Object.keys(programPath.scope.bindings)).toEqual(["foo", "bar"]);\n\n  // for declarations should be transformed to for bindings\n  expect(forOfPath.scope.bindings).toEqual({});\n  // The body should be wrapped into closure\n  expect(forOfPath.get("body").scope.bindings).toEqual({});\n\n  expect(Object.keys(functionPath.scope.bindings)).toEqual(["foo", "qux", "quux"]);\n});\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[65],
      },
    ],
  },
  {
    title: 'general — issue 10339 (input)',
    source:
      'for (const {foo, ...bar} of {}) {\n  () => foo;\n  const [qux] = bar;\n  try {} catch (e) {\n    const quux = qux;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'general — issue 1051 (input)',
    source:
      'foo.func1 = function() {\n  if (cond1) {\n    for (;;) {\n      if (cond2) {\n        function func2() {}\n        function func3() {}\n        func4(function() {\n          func2();\n        });\n        break;\n      }\n    }\n  }\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[67],
      },
    ],
  },
  {
    title: 'general — issue 14960 (input)',
    source:
      '{\n  switch (1) {\n    case 1:\n      expect(f()).toBe(1);\n      function f() {\n        return 1;\n      }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and capture (exec)',
    source:
      'let res = [];\n\nlet i = 0;\nfor (let i = 4; i < 6; i++) {\n  res.push((() => i)());\n}\n\nexpect(res).toEqual([4, 5]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[69],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and capture (input)',
    source: 'let i;\nfor (let i = 4; i < 6; i++) {\n  () => i;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and update (exec)',
    source:
      'let res = [];\n\nlet i = 0;\nfor (let i = 1; i < 6; i++) {\n  let y = i;\n  res.push((() => y)());\n  i++;\n}\n\nexpect(res).toEqual([1, 3, 5]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[71],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and update (input)',
    source: 'let i;\nfor (let i = 4; i < 6; i++) {\n  let y = i;\n  () => y;\n  i++;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow original sibling scope (exec)',
    source:
      'let res = [];\n\nfor (let i = 1; i < 3; i++) {\n  let x = i;\n  res.push((() => x)());\n}\n\nfor (let i = 4; i < 6; i++) {\n  let y = i;\n  res.push((() => y)());\n}\n\nexpect(res).toEqual([1, 2, 4, 5]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[73],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow original sibling scope (input)',
    source:
      'for (let i = 1; i < 3; i++) {\n  let x = i;\n  () => x;\n}\n\nfor (let i = 4; i < 6; i++) {\n  let y = i;\n  () => y;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[74],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow (exec)',
    source:
      'let res = [];\n\nlet i = 0;\nfor (let i = 4; i < 6; i++) {\n  let y = i;\n  res.push((() => y)());\n}\n\nexpect(res).toEqual([4, 5]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow (input)',
    source: 'let i;\nfor (let i = 4; i < 6; i++) {\n  let y = i;\n  () => y;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[76],
      },
    ],
  },
  {
    title: 'general — issue 18087 indirect (exec)',
    source:
      'let count = 0;\n\nfor (let outer = 0; outer < 2; outer++) {\n  do {\n    for (let done; !done; done = true) {\n      count++;\n    }\n  } while (false);\n}\n\nexpect(count).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'general — issue 18087 indirect (input)',
    source:
      'let count = 0;\n\nfor (let outer = 0; outer < 2; outer++) {\n  do {\n    for (let done; !done; done = true) {\n      count++;\n    }\n  } while (false);\n}\n\nexpect(count).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'general — issue 18087 (exec)',
    source:
      'let count = 0;\n\nfor (let outer = 0; outer < 2; outer++) {\n  for (let done; !done; done = true) {\n    count++;\n  }\n}\n\nexpect(count).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'general — issue 18087 (input)',
    source:
      'let count = 0;\n\nfor (let outer = 0; outer < 2; outer++) {\n  for (let done; !done; done = true) {\n    count++;\n  }\n}\n\nexpect(count).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'general — issue 2174 (input)',
    source:
      'if (true) {\n  function foo() {}\n  function bar() {\n    return foo;\n  }\n  for (var x in {}) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[79],
      },
    ],
  },
  {
    title: 'general — issue 4363 (input)',
    source:
      'function WithoutCurlyBraces() {\n  if (true)\n    for (let k in kv) {\n        function foo() { return this }\n        function bar() { return foo.call(this) }\n        console.log(this, k) // => undefined\n    }\n}\n\nfunction WithCurlyBraces() {\n  if (true) {\n    for (let k in kv) {\n        function foo() { return this }\n        function bar() { return foo.call(this) }\n        console.log(this, k) // => 777\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[80],
      },
    ],
  },
  {
    title: 'general — issue 4946 (input)',
    source: '(function foo() {\n  let foo = true;\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'general — issue 8128 for of after (exec)',
    source:
      '"use strict";\n\nconst results = [0, 1, 2];\nconst fns = [];\n\nfor (let result of results) {\n  result = result * 2;\n  fns.push(() => {\n    return result;\n  });\n}\n\nexpect(fns[0]()).toBe(0);\nexpect(fns[1]()).toBe(2);\nexpect(fns[2]()).toBe(4);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[82],
      },
    ],
  },
  {
    title: 'general — issue 8128 for of after (input)',
    source:
      'for (let result of results) {\n  result = otherValue;\n  fn(() => {\n    result;\n  });\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'general — issue 8498 loop init collision destructuring (input)',
    source:
      'for (let a, { b } = {};;) {\n  let a, { b } = {};\n\n  {\n    let a, { b } = {};\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[84],
      },
    ],
  },
  {
    title: 'general — issue 8498 loop init collision (input)',
    source:
      'for (let i = 0; i < 3; i++) {\n    let i = \'abc\';\n    console.log(i);\n\n    {\n      let i = "hello";\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[85],
      },
    ],
  },
  {
    title: 'general — issue 973 (input)',
    source:
      'let arr = [];\nfor(let i = 0; i < 10; i++) {\n  for (let i = 0; i < 10; i++) {\n    arr.push(() => i);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[86],
      },
    ],
  },
  {
    title: 'general — issue T7525 (input)',
    source:
      'let a = 1;\n\nfor (let a = 2, i = a + 1; i < 10; i++) {\n  console.log(i);\n}\n\nfor (let a in [1, 2, 3]) {\n  let a = 3;\n  console.log(a);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'general — jsx identifier (input)',
    source:
      '// #1683\n\nvar arr = [];\nfor(let i = 0; i < 4; ++i) {\n  arr.push(\n    <i></i>\n  );\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
          jsx: 'preserve',
        },
        output: expectedOutputs[88],
      },
    ],
  },
  {
    title: 'general — label complex (input)',
    source:
      'outer: while (t) {\n  inner: while (t2) {\n    for (let i = 0; i < 3; i++) {\n      later(() => i);\n      if (test1) break outer;\n      else if (test2) break inner;\n      else if (test3) continue outer;\n      else if (test4) continue inner;\n      else if (test5) break;\n      else if (test6) continue;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[89],
      },
    ],
  },
  {
    title: 'general — label (input)',
    source:
      'loop:\nfor (var i = 0; i < 10; i++) {\n  const z = 3; // force loop function\n  () => z;\n  switch(true) {\n    case true:\n      break loop;\n  }\n}\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[90],
      },
    ],
  },
  {
    title: 'general — loop closure hoisted function (exec)',
    source:
      'for (let i = 0; i < 3; i++) {\n    if (i === 0) {\n        function test() {\n            return i;\n        }\n    }\n  expect(test()).toBe(0);\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'general — loop closure hoisted function (input)',
    source:
      'for (let i = 0; i < 3; i++) {\n    if (i === 0) {\n        function test() {\n            return i;\n        }\n    }\n  expect(test()).toBe(0);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'general — loop closure in class (exec)',
    source:
      'let run = [];\n\nfor (let i = 0; i < 2; i++) {\n  run.push(class C {\n    x = i;\n  });\n}\n\nexpect(new run[0]().x).toBe(0);\nexpect(new run[1]().x).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[92],
      },
    ],
  },
  {
    title: 'general — loop closure in class (input)',
    source: 'for (let i = 0; i < 2; i++) {\n  class C {\n    x = i;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'general — loop closure in method (exec)',
    source:
      'var objects = [];\nvar i2 = 0;\nfor (var i = 0; i < 10; i++) {\n  let captured = i2;\n  i2++;\n\n  objects.push({\n    foo() {\n      return captured;\n    }\n  });\n}\n\nexpect(objects[0].foo()).toBe(0);\nexpect(objects[1].foo()).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[94],
      },
    ],
  },
  {
    title: 'general — loop closure in method (input)',
    source:
      'var objects = [];\nvar i2 = 0;\nfor (var i = 0; i < 10; i++) {\n  let captured = i2;\n  i2++;\n\n  objects.push({\n    foo() {\n      return captured;\n    }\n  });\n}\n\nexpect(objects[0].foo()).toBe(0);\nexpect(objects[1].foo()).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[94],
      },
    ],
  },
  {
    title: 'general — loop initializer default (input)',
    source:
      'while (value) {\n  let foo;\n\n  if (bar) {\n    foo = [];\n  }\n\n  if (foo) {\n    doIt();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[95],
      },
    ],
  },
  {
    title: 'general — loops and no loops (input)',
    source:
      'function foo() {\n  const x = 5;\n  console.log(x);\n\n  {\n    const x = 7;\n    setTimeout(() => x, 0);\n  }\n}\n\nfunction bar() {\n  const x = 5;\n  console.log(x);\n\n  for (let i = 0; i < 7; i++) {\n    {\n      const x = i;\n      setTimeout(() => x, 0);\n    }\n  }\n}\n\nfunction baz() {\n  const x = 5;\n  console.log(x);\n\n  for (let i = 0; i < 7; i++) {\n    var qux = function qux(y) {\n      const x = y;\n      setTimeout(() => x, 0);\n    };\n    qux(i);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[96],
      },
    ],
  },
  {
    title: 'general — program (input)',
    source: 'let test = "foo";\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[97],
      },
    ],
  },
  {
    title: 'general — rename inside switch (input)',
    source:
      'window.test = () => {\n    const e = "TEST";\n    switch (e) {\n        case "TEST":\n            const e = [];\n            e.push(\'111\');\n            alert(e);\n            break;\n        default: alert(\'666\'); break;\n    }\n};\n\nwindow.test = () => {\n    const e = "TEST";\n    switch (e) {\n        case "TEST":\n            const e = [];\n            switch(e) {}\n    }\n};',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[98],
      },
    ],
  },
  {
    title: 'general — sibling scopes (input)',
    source:
      "var f1, f2;\n{\n  let z = 'z1 value';\n  f1 = function() { return z; };\n}\n{\n  let z = 'z2 value';\n  f2 = function() { return z; };\n}\nf1();\nf2();\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[99],
      },
    ],
  },
  {
    title: 'general — superswitch (input)',
    source:
      'function foo() {\n  while (true) {\n    switch (2) {\n      case 0: {\n        if (true) {\n          return;\n        }\n\n        const stuff = new Map();\n        const data = 0;\n        stuff.forEach(() => {\n          const d = data;\n        });\n        break;\n      }\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[100],
      },
    ],
  },
  {
    title: 'general — switch callbacks (input)',
    source:
      'function fn() {\n    while (true) {\n        switch (true) {\n        default:\n            let foo = 4;\n            if (true) {\n                let bar = () => foo;\n                console.log(bar());\n            }\n        }\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[101],
      },
    ],
  },
  {
    title: 'general — switch inside loop (exec)',
    source:
      "// it shouldn't break on a case-break statement\nvar i;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 1:\n      break;\n  }\n\n  const z = 3; // to force the plugin to convert to loop function call\n  () => z;\n}\n\nexpect(i).toBe(10);\n\n// it should continue on continue statements within switch\nvar j = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0:\n      continue;\n  }\n  j++;\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(9);\n\n// it should work with loops nested within switch\nj = 0;\nfor (i = 0; i < 10; i++) {\n  switch (i) {\n    case 0:\n      for (var k = 0; k < 10; k++) {\n        const z = 3;\n        () => z;\n        j++;\n        break;\n      }\n      break;\n  }\n\n  const z = 3;\n  () => z;\n}\n\nexpect(j).toBe(1);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'general — switch shadow (input)',
    source: 'switch (x) {\n  default: let x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[102],
      },
    ],
  },
  {
    title: 'general — switch (input)',
    source:
      'let a = true;\nlet b = false;\nclass e {}\nfunction f() {}\n\nswitch (a) {\n  case true:\n    let c = 2;\n    let foo = true;\n    break;\n  case false:\n    let d = 3;\n    foo = false;\n    break;\n}\n\nswitch (true) {\n  case true:\n    let a = false;\n    let b = true;\n    let c = 4;\n    let d = 5;\n\n  case false:\n    class e {}\n    function f() {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[103],
      },
    ],
  },
  {
    title: 'general — untransformed await using declaration (input)',
    source: '{\n  await using foo = null;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[104],
      },
    ],
  },
  {
    title: 'general — untransformed using declaration (input)',
    source: '{\n  using foo = null;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'general — wrap closure shadow variables reassignment (input)',
    source:
      'for (let index = 0; index < 10; index++) {\n    if (index % 2) {\n        index+=3;\n        continue;\n    }\n    let fn = function () {index;};\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[106],
      },
    ],
  },
  {
    title: 'general — wrap closure shadow variables (input)',
    source:
      'let a = 1;\nfor (let a = 1; a < 100; a++) {\n  items.forEach(item => a);\n}\nconsole.log(a);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[107],
      },
    ],
  },
  {
    title: 'regression — issue 17684 (input)',
    source:
      '// Test 1: switch(e)\nfunction test(e) {\n    let i = e;\n    {\n        const e = i[0];\n        switch (e) {\n            case "n":\n                const e = 1;\n                return true;\n            default:\n                return false;\n        }\n    }\n}\nconsole.log(test("nn"));\n\n// Test 2: switch(e.x)\nfunction test2(e) {\n    let i = e;\n    {\n        const e = { x: "test" };\n        switch (e.x) {\n            case "test":\n                const e = 1;\n                return true;\n            default:\n                return false;\n        }\n    }\n}\nconsole.log(test2({ x: "n" }));\n\n// Test 3: switch(e.x + e.y)\nfunction test3(e) {\n    let i = e;\n    {\n        const e = { x: "te", y: "st" };\n        switch (e.x + e.y) {\n            case "test":\n                const e = 1;\n                return true;\n            default:\n                return false;\n        }\n    }\n}\nconsole.log(test3({ x: "x", y: "y" }));\n\n// Test 4: switch(e.f())\nfunction test4(e) {\n    let i = e;\n    {\n        const e = { f: () => "test" };\n        switch (e.f()) {\n            case "test":\n                const e = 1;\n                return true;\n            default:\n                return false;\n        }\n    }\n}\nconsole.log(test4({ f: () => "test" }));\n\n// Test 5: switch(id(e))\nfunction id(v) {\n    return v;\n}\n\nfunction test5(e) {\n    let i = e;\n    {\n        const e = i[0];\n        switch (id(e)) {\n            case "n":\n                const e = 1;\n                return true;\n            default:\n                return false;\n        }\n    }\n}\nconsole.log(test5("nn"));\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[108],
      },
    ],
  },
  {
    title: 'regression — regression 1130 (input)',
    source: 'function A() {\n  let a;\n}\n\nfunction B() {\n  let a;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[109],
      },
    ],
  },
  {
    title: 'regression — rename with global ids (input)',
    source:
      '// https://github.com/babel/babel/pull/15361\n\nfunction fooBar(arrayOfThings) {\n    for (let index = 0; index < arrayOfThings.length; index++) {\n      const thing = arrayOfThings[index];\n      const someMapObj = {};\n      let arrow = (x) => someMapObj;\n      arrow(0)\n    }\n}\n\nfooBar([1,2,3])\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[110],
      },
    ],
  },
  {
    title: 'regression — updated for binding with tdz enabled (input)',
    source: 'for (let index = 0; index < 10; index++) {\n  index++;\n  () => index;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[111],
      },
    ],
  },
  {
    title: 'regression — wrap closure updated shadow variables (input)',
    source:
      '// https://github.com/babel/babel/issues/15397\n\nvar i;\nfor (let i = 0; i < 1; ) {\n  i++\n  () => i;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[112],
      },
    ],
  },
  {
    title: 'tdz — block ref function call (exec)',
    source: 'expect(() => {\n  f();\n\n  const f = function f() {}\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[113],
      },
    ],
  },
  {
    title: 'tdz — block ref function call (input)',
    source: 'f();\n\nconst f = function f() {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[114],
      },
    ],
  },
  {
    title: 'tdz — const readonly (exec)',
    source:
      'function callNow(f) {\n  f();\n}\n\nfunction callLater(f) {\n  return () => f();\n}\n\nexpect(() => {\n  const x = 0;\n  x = 1;\n}).toThrow(TypeError);\n\nexpect(() => {\n  x = 1;\n  const x = 0;\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  callNow(() => {\n    x = 1;\n  });\n  const x = 0;\n}).toThrow(ReferenceError);\n\n\nexpect(() => {\n  const call = callLater(() => {\n    x = 1;\n  });\n  const x = 0;\n  call();\n}).toThrow(TypeError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[115],
      },
    ],
  },
  {
    title: 'tdz — const readonly (input)',
    source: 'maybeCallLater(function () {\n  x = 2;\n});\n\nconst x = 0;\nx = 1;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[116],
      },
    ],
  },
  {
    title: 'tdz — destructured self reference (exec)',
    source: 'expect(() => {\n  let { b: d } = { d }\n}).toThrow(ReferenceError);',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[117],
      },
    ],
  },
  {
    title: 'tdz — destructured self reference (input)',
    source: 'let { b: d } = { d }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[118],
      },
    ],
  },
  {
    title: 'tdz — exported fn (input)',
    source:
      'import { foo } from "somewhere";\n\n// foo might call "bar"\nfoo();\n\na;\n\nlet a;\n\na;\n\nexport function bar() {\n  return a;\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[119],
      },
    ],
  },
  {
    title: 'tdz — function call after (exec)',
    source: 'expect(() => {\n  function f() {\n    x;\n  }\n  let x;\n  f();\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[120],
      },
    ],
  },
  {
    title: 'tdz — function call after (input)',
    source: 'function f() {\n    x;\n}\nlet x;\nf();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[121],
      },
    ],
  },
  {
    title: 'tdz — function call before (exec)',
    source:
      'expect(() => {\n  function f() {\n    x;\n  }\n  f();\n  let x;\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[122],
      },
    ],
  },
  {
    title: 'tdz — function call before (input)',
    source: 'function f() {\n    x;\n}\nf();\nlet x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'tdz — function call maybe real after (exec)',
    source:
      'expect(() => {\n  function f() { x }\n  Math.random() === 2 && f();\n  let x;\n  f();\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[124],
      },
    ],
  },
  {
    title: 'tdz — function call maybe real after (input)',
    source: 'function f() { x }\nMath.random() === 2 && f();\nlet x;\nf();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[125],
      },
    ],
  },
  {
    title: 'tdz — function call maybe value assign (exec)',
    source: 'function f() { x }\nMath.random() === 2 && f();\nlet x = 3;\n\nexpect(x).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'tdz — function call maybe value assign (input)',
    source: 'function f() { x }\nMath.random() === 2 && f();\nlet x = 3;\n\nexpect(x).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'tdz — function call maybe (exec)',
    source:
      '// "random" :)\nlet random = (i => {\n  const vals = [0, 0, 1, 1];\n  return () => vals[i++];\n})(0);\n\nexpect(() => {\n  function f() { x }\n  random() && f();\n  let x;\n}).not.toThrow();\n\nexpect(() => {\n  function f() { x }\n  random() || f();\n  let x;\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  function f() { x }\n  random() && f();\n  let x;\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  function f() { x }\n  random() || f();\n  let x;\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[127],
      },
    ],
  },
  {
    title: 'tdz — function call maybe (input)',
    source: 'function f() { x }\nMath.random() && f();\nlet x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[128],
      },
    ],
  },
  {
    title: 'tdz — function call nested function (exec)',
    source:
      'expect(() => {\n  function f() {\n    return function() { x };\n  }\n  let g = f();\n  let x;\n  g();\n}).not.toThrow();\n\nexpect(() => {\n  function f() {\n    return function() { x };\n  }\n  let g = f();\n  g();\n  let x;\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'tdz — function call nested function (input)',
    source: 'function f() {\n  return function() { x };\n}\nf();\nlet x;',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[130],
      },
    ],
  },
  {
    title: 'tdz — function call recursive after (exec)',
    source:
      'expect(() => {\n  function f(i) {\n    if (i) f(i - 1);\n    x;\n  }\n\n  let x;\n  f(3);\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[131],
      },
    ],
  },
  {
    title: 'tdz — function call recursive after (input)',
    source: 'function f(i) {\n  if (i) f(i - 1);\n  x;\n}\n\nlet x;\nf(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[132],
      },
    ],
  },
  {
    title: 'tdz — function call recursive before (exec)',
    source:
      'expect(() => {\n  function f(i) {\n    if (i) f(i - 1);\n    x;\n  }\n\n  f(3);\n  let x;\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[133],
      },
    ],
  },
  {
    title: 'tdz — function call recursive before (input)',
    source: 'function f(i) {\n  if (i) f(i - 1);\n  x;\n}\n\nf(3);\nlet x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[134],
      },
    ],
  },
  {
    title: 'tdz — function call recursive reference (exec)',
    source:
      'expect(() => {\n  function f(i) {\n    return () => {\n      x;\n      f(i - 1);\n    };\n  }\n\n  const g = f(1);\n  let x;\n  g();\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[135],
      },
    ],
  },
  {
    title: 'tdz — function call recursive reference (input)',
    source:
      'function f(i) {\n  return () => {\n    x;\n    f(i - 1);\n  };\n}\n\nconst g = f(1);\nlet x;\ng();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[136],
      },
    ],
  },
  {
    title: 'tdz — function expression (input)',
    source: 'f(() => a);\nlet a;\n\nlet b;\nf(() => b);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[137],
      },
    ],
  },
  {
    title: 'tdz — function ref (input)',
    source: 'function f() { x }\nmaybeCall(f);\nlet x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[138],
      },
    ],
  },
  {
    title: 'tdz — hoisted function (exec)',
    source: 'expect(() => {\n  f();\n\n  function f() {}\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[139],
      },
    ],
  },
  {
    title: 'tdz — hoisted function (input)',
    source: 'f();\n\nfunction f() {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[140],
      },
    ],
  },
  {
    title: 'tdz — hoisted var (exec)',
    source: 'expect(() => {\n  x = 3;\n\n  var x;\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[141],
      },
    ],
  },
  {
    title: 'tdz — hoisted var (input)',
    source: 'x = 3;\n\nvar x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[142],
      },
    ],
  },
  {
    title: 'tdz — self reference (exec)',
    source: 'expect(() => {\n  let x = x;\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[143],
      },
    ],
  },
  {
    title: 'tdz — self reference (input)',
    source: 'let x = x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[144],
      },
    ],
  },
  {
    title: 'tdz — shadow outer var (exec)',
    source:
      'expect(() => {\n  var a = 5;\n  if (a) {\n    a;\n    let a = 2;\n  }\n  a;\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[145],
      },
    ],
  },
  {
    title: 'tdz — shadow outer var (input)',
    source: 'var a = 5;\nif (a) {\n  a;\n  let a = 2;\n}\na;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[146],
      },
    ],
  },
  {
    title: 'tdz — simple assign no tdz (exec)',
    source: 'let i\ni = 2;\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[147],
      },
    ],
  },
  {
    title: 'tdz — simple assign no tdz (input)',
    source: 'let i\ni = 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[147],
      },
    ],
  },
  {
    title: 'tdz — simple assign (exec)',
    source: 'expect(() => {\n  i = 2;\n  let i\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[148],
      },
    ],
  },
  {
    title: 'tdz — simple assign (input)',
    source: 'i = 2;\nlet i\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[149],
      },
    ],
  },
  {
    title: 'tdz — simple reference (exec)',
    source: 'expect(() => {\n  i\n  let i\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[150],
      },
    ],
  },
  {
    title: 'tdz — simple reference (input)',
    source: 'i\nlet i\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[151],
      },
    ],
  },
  {
    title: 'tdz — switch shadow (input)',
    source: 'let x;\nswitch (x) {\n  default: let x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[152],
      },
    ],
  },
  {
    title: 'tdz — update expression (input)',
    source:
      'maybeCallLater(function f() {\n  x++;\n  ++x;\n  x.p++;\n  ++x.p;\n});\n\nx++;\n++x;\nx.p++;\n++x.p;\n\nlet x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
        output: expectedOutputs[153],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
