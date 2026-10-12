import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      blockScoping: true,
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'basic block scoping > nested let declarations create independent scopes',
    '() => {\n  let x = 1;\n  {\n    let x = 2;\n    expect(x).toBe(2);\n    {\n      let x = 3;\n      expect(x).toBe(3);\n      x++;\n      expect(x).toBe(4);\n    }\n  }\n  expect(x).toBe(1);\n}',
    '() => {\n  var x = 1;\n  {\n    var _x = 2;\n    expect(_x).toBe(2);\n    {\n      var _x2 = 3;\n      expect(_x2).toBe(3);\n      _x2++;\n      expect(_x2).toBe(4);\n    }\n  }\n  expect(x).toBe(1);\n};',
  ],
  [
    'basic block scoping > closures in nested blocks capture correct binding',
    '() => {\n  expect(\n    (() => {\n      let sum = 0;\n      let a = 0;\n      {\n        let a = 10;\n        for (let i = 0; i < a; i++) {\n          let a = 1;\n          sum += (() => a)();\n        }\n      }\n      return sum;\n    })()\n  ).toBe(10);\n}',
    "() => {\n  expect(\n    (() => {\n      var sum = 0;\n      var a = 0;\n      {\n        var _a = 10;\n        var _loopResult;\n        var _loop = i => {\n          var _a2 = 1;\n          sum += (() => _a2)();\n          return {\n            type: 'normal',\n            vars: [i],\n          };\n        };\n        for (var i = 0; i < _a; i++) {\n          _loopResult = _loop(i);\n          i = _loopResult.vars[0];\n        }\n      }\n      return sum;\n    })(),\n  ).toBe(10);\n};",
  ],
  [
    'basic block scoping > inner scope shadows outer function scope',
    "() => {\n  function test() {\n    let value = 'outer';\n    return (function () {\n      let value = 'inner';\n      return value;\n    })();\n  }\n  expect(test()).toBe('inner');\n}",
    "() => {\n  function test() {\n    var value = 'outer';\n    return (function () {\n      var _value = 'inner';\n      return _value;\n    })();\n  }\n  expect(test()).toBe('inner');\n};",
  ],
  [
    'basic block scoping > let in loop body shadows outer let',
    '() => {\n  let x = 0;\n  for (;;) {\n    let x = 1;\n    expect(x).toBe(1);\n    break;\n  }\n  expect(x).toBe(0);\n}',
    '() => {\n  var x = 0;\n  for (;;) {\n    var _x = 1;\n    expect(_x).toBe(1);\n    break;\n  }\n  expect(x).toBe(0);\n};',
  ],
  [
    'basic block scoping > const in block is not visible outside',
    "() => {\n  {\n    const a = 1;\n    expect(a).toBe(1);\n  }\n  expect(typeof a).toBe('undefined');\n}",
    "() => {\n  {\n    var _a = 1;\n    expect(_a).toBe(1);\n  }\n  expect(typeof a).toBe('undefined');\n};",
  ],
  [
    'basic block scoping > let in block is not visible outside',
    "() => {\n  {\n    let b = 2;\n    expect(b).toBe(2);\n  }\n  expect(typeof b).toBe('undefined');\n}",
    "() => {\n  {\n    var _b = 2;\n    expect(_b).toBe(2);\n  }\n  expect(typeof b).toBe('undefined');\n};",
  ],
  [
    'basic block scoping > if-block scoping',
    "() => {\n  let x = 'outer';\n  if (true) {\n    let x = 'inner';\n    expect(x).toBe('inner');\n  }\n  expect(x).toBe('outer');\n}",
    "() => {\n  var x = 'outer';\n  if (true) {\n    var _x = 'inner';\n    expect(_x).toBe('inner');\n  }\n  expect(x).toBe('outer');\n};",
  ],
  [
    'for loop scoping > let in for-loop head does not leak',
    '() => {\n  expect(\n    (function () {\n      let a = 1;\n      for (let a = 0; a < 8; a++) {}\n      return a;\n    })()\n  ).toBe(1);\n}',
    '() => {\n  expect(\n    (function () {\n      var a = 1;\n      for (var _a = 0; _a < 8; _a++) {}\n      return a;\n    })(),\n  ).toBe(1);\n};',
  ],
  [
    'for loop scoping > multiple let declarations in for-loop head do not leak',
    "() => {\n  for (let i = 0, x = 2; i < 5; i++);\n  expect(typeof i).toBe('undefined');\n  expect(typeof x).toBe('undefined');\n}",
    "() => {\n  for (var _i = 0, _x = 2; _i < 5; _i++);\n  expect(typeof i).toBe('undefined');\n  expect(typeof x).toBe('undefined');\n};",
  ],
  [
    'for loop scoping > closures capture per-iteration let binding in for loop',
    '() => {\n  var fns = [];\n  for (let i = 0; i < 10; i++) {\n    fns.push(function () {\n      return i;\n    });\n    i += 1;\n  }\n  expect(fns[0]()).toBe(1);\n  expect(fns[1]()).toBe(3);\n  expect(fns[2]()).toBe(5);\n  expect(fns[3]()).toBe(7);\n  expect(fns[4]()).toBe(9);\n}',
    "() => {\n  var fns = [];\n  var _loopResult;\n  var _loop = i => {\n    fns.push(function () {\n      return i;\n    });\n    i += 1;\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 10; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(fns[0]()).toBe(1);\n  expect(fns[1]()).toBe(3);\n  expect(fns[2]()).toBe(5);\n  expect(fns[3]()).toBe(7);\n  expect(fns[4]()).toBe(9);\n};",
  ],
  [
    'for loop scoping > closures with splice and index mutation in for loop',
    '() => {\n  let data = [true, false, false, true, false];\n  for (let index = 0; index < data.length; index++) {\n    let item = data[index];\n    if (!item) {\n      data.splice(index, 1);\n      index--;\n      continue;\n    }\n    let fn = function () {\n      item;\n    };\n  }\n  expect(data.every((item) => item)).toBe(true);\n}',
    "() => {\n  var data = [true, false, false, true, false];\n  var _loopResult;\n  var _loop = index => {\n    var item = data[index];\n    if (!item) {\n      data.splice(index, 1);\n      index--;\n      return {\n        type: 'continue',\n        vars: [index],\n      };\n    }\n    var fn = function () {\n      item;\n    };\n    return {\n      type: 'normal',\n      vars: [index],\n    };\n  };\n  for (var index = 0; index < data.length; index++) {\n    _loopResult = _loop(index);\n    index = _loopResult.vars[0];\n    if (_loopResult.type === 'continue') continue;\n  }\n  expect(data.every(item => item)).toBe(true);\n};",
  ],
  [
    'for loop scoping > each for-loop iteration gets its own let binding',
    '() => {\n  var funcs = [];\n  for (let i = 0; i < 5; i++) {\n    funcs.push(() => i);\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n  expect(funcs[3]()).toBe(3);\n  expect(funcs[4]()).toBe(4);\n}',
    "() => {\n  var funcs = [];\n  var _loopResult;\n  var _loop = i => {\n    funcs.push(() => i);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 5; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n  expect(funcs[3]()).toBe(3);\n  expect(funcs[4]()).toBe(4);\n};",
  ],
  [
    'for loop scoping > const in for-of creates per-iteration binding',
    '() => {\n  var funcs = [];\n  for (const val of [10, 20, 30]) {\n    funcs.push(() => val);\n  }\n  expect(funcs[0]()).toBe(10);\n  expect(funcs[1]()).toBe(20);\n  expect(funcs[2]()).toBe(30);\n}',
    "() => {\n  var funcs = [];\n  var _loopResult;\n  var _loop = val => {\n    funcs.push(() => val);\n    return {\n      type: 'normal',\n      vars: [val],\n    };\n  };\n  for (var val of [10, 20, 30]) {\n    _loopResult = _loop(val);\n    val = _loopResult.vars[0];\n  }\n  expect(funcs[0]()).toBe(10);\n  expect(funcs[1]()).toBe(20);\n  expect(funcs[2]()).toBe(30);\n};",
  ],
  [
    'for loop scoping > const in for-in creates per-iteration binding (hermes#575)',
    "() => {\n  const target = {\n    a: 'a',\n    b: 'b',\n    c: 'c',\n  };\n  const copy = {};\n  let keys = '';\n  for (const prop in target) {\n    keys += ' ' + prop;\n    Object.defineProperty(copy, prop, {\n      get: () => target[prop],\n      enumerable: true,\n    });\n  }\n  expect(copy.a).toBe('a');\n  expect(copy.b).toBe('b');\n  expect(copy.c).toBe('c');\n}",
    "() => {\n  var target = {\n    a: 'a',\n    b: 'b',\n    c: 'c',\n  };\n  var copy = {};\n  var keys = '';\n  var _loopResult;\n  var _loop = prop => {\n    keys += ' ' + prop;\n    Object.defineProperty(copy, prop, {\n      get: () => target[prop],\n      enumerable: true,\n    });\n    return {\n      type: 'normal',\n      vars: [prop],\n    };\n  };\n  for (var prop in target) {\n    _loopResult = _loop(prop);\n    prop = _loopResult.vars[0];\n  }\n  expect(copy.a).toBe('a');\n  expect(copy.b).toBe('b');\n  expect(copy.c).toBe('c');\n};",
  ],
  [
    'for loop scoping > let in for-in creates per-iteration binding',
    "() => {\n  const obj = { x: 1, y: 2, z: 3 };\n  var funcs = [];\n  for (let key in obj) {\n    funcs.push(() => key);\n  }\n  var results = funcs.map((f) => f());\n  expect(results).toContain('x');\n  expect(results).toContain('y');\n  expect(results).toContain('z');\n}",
    "() => {\n  var obj = {\n    x: 1,\n    y: 2,\n    z: 3,\n  };\n  var funcs = [];\n  var _loopResult;\n  var _loop = key => {\n    funcs.push(() => key);\n    return {\n      type: 'normal',\n      vars: [key],\n    };\n  };\n  for (var key in obj) {\n    _loopResult = _loop(key);\n    key = _loopResult.vars[0];\n  }\n  var results = funcs.map(f => f());\n  expect(results).toContain('x');\n  expect(results).toContain('y');\n  expect(results).toContain('z');\n};",
  ],
  [
    'for loop scoping > destructuring with defaults in for-of',
    "() => {\n  var fields = [{ name: 'title' }, { name: 'content' }];\n  for (let { name, value = 'Default value' } of fields) {\n    expect(value).toBe('Default value');\n  }\n}",
    "() => {\n  var fields = [{ name: 'title' }, { name: 'content' }];\n  for (var { name, value = 'Default value' } of fields) {\n    expect(value).toBe('Default value');\n  }\n};",
  ],
  [
    'labels and control flow > labeled break with closures in for-in',
    '() => {\n  var heh = [];\n  var nums = [1, 2, 3];\n\n  loop1: for (let i in nums) {\n    let num = nums[i];\n    heh.push((x) => x * num);\n    if (num >= 2) {\n      break loop1;\n    }\n  }\n  expect(heh.length).toBe(2);\n  expect(heh[0](2)).toBe(2);\n  expect(heh[1](4)).toBe(8);\n}',
    "() => {\n  var heh = [];\n  var nums = [1, 2, 3];\n  var _loopResult;\n  var _loop = i => {\n    var num = nums[i];\n    heh.push(x => x * num);\n    if (num >= 2) {\n      return {\n        type: 'break',\n        vars: [i],\n      };\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  loop1: for (var i in nums) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n    if (_loopResult.type === 'break') break loop1;\n  }\n  expect(heh.length).toBe(2);\n  expect(heh[0](2)).toBe(2);\n  expect(heh[1](4)).toBe(8);\n};",
  ],
  [
    'labels and control flow > nested loops with labeled continue and closures',
    '() => {\n  var stack = [];\n  loop1: for (let j = 0; j < 10; j++) {\n    for (let i = 0; i < 10; i++) {\n      stack.push(() => [i, j]);\n      continue loop1;\n    }\n  }\n  expect(stack[0]()).toEqual([0, 0]);\n  expect(stack[1]()).toEqual([0, 1]);\n  expect(stack[4]()).toEqual([0, 4]);\n  expect(stack[9]()).toEqual([0, 9]);\n}',
    "() => {\n  var stack = [];\n  var _loopResult;\n  var _loop = j => {\n    var _loopResult6;\n    var _loop5 = i => {\n      stack.push(() => [i, j]);\n      return {\n        type: 'return',\n        value: {\n          type: 'continue',\n          vars: [j],\n        },\n        vars: [i],\n      };\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    for (var i = 0; i < 10; i++) {\n      _loopResult6 = _loop5(i);\n      i = _loopResult6.vars[0];\n      if (_loopResult6.type === 'return') return _loopResult6.value;\n    }\n    return {\n      type: 'normal',\n      vars: [j],\n    };\n  };\n  loop1: for (var j = 0; j < 10; j++) {\n    _loopResult = _loop(j);\n    j = _loopResult.vars[0];\n    if (_loopResult.type === 'continue') continue loop1;\n  }\n  expect(stack[0]()).toEqual([0, 0]);\n  expect(stack[1]()).toEqual([0, 1]);\n  expect(stack[4]()).toEqual([0, 4]);\n  expect(stack[9]()).toEqual([0, 9]);\n};",
  ],
  [
    'labels and control flow > nested loops with inner break and closures',
    '() => {\n  var stack = [];\n  for (let j = 0; j < 10; j++) {\n    for (let i = 0; i < 10; i++) {\n      stack.push(() => [i, j]);\n      break;\n    }\n  }\n  expect(stack[0]()).toEqual([0, 0]);\n  expect(stack[1]()).toEqual([0, 1]);\n  expect(stack[9]()).toEqual([0, 9]);\n}',
    "() => {\n  var stack = [];\n  var _loopResult;\n  var _loop = j => {\n    var _loopResult6;\n    var _loop5 = i => {\n      stack.push(() => [i, j]);\n      return {\n        type: 'break',\n        vars: [i],\n      };\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    for (var i = 0; i < 10; i++) {\n      _loopResult6 = _loop5(i);\n      i = _loopResult6.vars[0];\n      if (_loopResult6.type === 'break') break;\n    }\n    return {\n      type: 'normal',\n      vars: [j],\n    };\n  };\n  for (var j = 0; j < 10; j++) {\n    _loopResult = _loop(j);\n    j = _loopResult.vars[0];\n  }\n  expect(stack[0]()).toEqual([0, 0]);\n  expect(stack[1]()).toEqual([0, 1]);\n  expect(stack[9]()).toEqual([0, 9]);\n};",
  ],
  [
    'labels and control flow > triple-nested loops with labeled continue and closures',
    '() => {\n  var stack = [];\n  loop1: for (let j = 0; j < 10; j++) {\n    loop2: for (let i = 0; i < 10; i++) {\n      for (let x = 0; x < 10; x++) {\n        stack.push(() => [j, i, x]);\n        continue loop2;\n      }\n    }\n  }\n  expect(stack[0]()).toEqual([0, 0, 0]);\n  expect(stack[1]()).toEqual([0, 1, 0]);\n  expect(stack[9]()).toEqual([0, 9, 0]);\n}',
    "() => {\n  var stack = [];\n  var _loopResult;\n  var _loop = j => {\n    var _loopResult7;\n    var _loop6 = i => {\n      var _loopResult9;\n      var _loop8 = x => {\n        stack.push(() => [j, i, x]);\n        return {\n          type: 'return',\n          value: {\n            type: 'continue',\n            vars: [i],\n          },\n          vars: [x],\n        };\n        return {\n          type: 'normal',\n          vars: [x],\n        };\n      };\n      for (var x = 0; x < 10; x++) {\n        _loopResult9 = _loop8(x);\n        x = _loopResult9.vars[0];\n        if (_loopResult9.type === 'return') return _loopResult9.value;\n      }\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    loop2: for (var i = 0; i < 10; i++) {\n      _loopResult7 = _loop6(i);\n      i = _loopResult7.vars[0];\n      if (_loopResult7.type === 'continue') continue loop2;\n    }\n    return {\n      type: 'normal',\n      vars: [j],\n    };\n  };\n  loop1: for (var j = 0; j < 10; j++) {\n    _loopResult = _loop(j);\n    j = _loopResult.vars[0];\n  }\n  expect(stack[0]()).toEqual([0, 0, 0]);\n  expect(stack[1]()).toEqual([0, 1, 0]);\n  expect(stack[9]()).toEqual([0, 9, 0]);\n};",
  ],
  [
    'labels and control flow > labeled break exits all nested loops',
    '() => {\n  var stack = [];\n  loop1: for (let j = 0; j < 10; j++) {\n    for (let i = 0; i < 10; i++) {\n      stack.push(() => [i, j]);\n      break loop1;\n    }\n  }\n  expect(stack.length).toBe(1);\n  expect(stack[0]()).toEqual([0, 0]);\n}',
    "() => {\n  var stack = [];\n  var _loopResult;\n  var _loop = j => {\n    var _loopResult6;\n    var _loop5 = i => {\n      stack.push(() => [i, j]);\n      return {\n        type: 'return',\n        value: {\n          type: 'break',\n          vars: [j],\n        },\n        vars: [i],\n      };\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    for (var i = 0; i < 10; i++) {\n      _loopResult6 = _loop5(i);\n      i = _loopResult6.vars[0];\n      if (_loopResult6.type === 'return') return _loopResult6.value;\n    }\n    return {\n      type: 'normal',\n      vars: [j],\n    };\n  };\n  loop1: for (var j = 0; j < 10; j++) {\n    _loopResult = _loop(j);\n    j = _loopResult.vars[0];\n    if (_loopResult.type === 'break') break loop1;\n  }\n  expect(stack.length).toBe(1);\n  expect(stack[0]()).toEqual([0, 0]);\n};",
  ],
  [
    'switch statements > const in switch case block is accessible',
    '() => {\n  if (true) {\n    const x = 1;\n    switch (x) {\n      case 1: {\n        expect(x).toBe(1);\n        break;\n      }\n    }\n  }\n}',
    '() => {\n  if (true) {\n    var x = 1;\n    switch (x) {\n      case 1: {\n        expect(x).toBe(1);\n        break;\n      }\n    }\n  }\n};',
  ],
  [
    'switch statements > labeled break inside switch exits outer loop',
    '() => {\n  var i;\n  the_loop: for (i = 0; i < 10; i++) {\n    switch (i) {\n      case 3: {\n        break the_loop;\n      }\n    }\n    const z = 3;\n    (() => z)();\n  }\n  expect(i).toBe(3);\n}',
    "() => {\n  var i;\n  var _loopResult;\n  var _loop = () => {\n    switch (i) {\n      case 3: {\n        return {\n          type: 'break',\n          vars: [],\n        };\n      }\n    }\n    var z = 3;\n    (() => z)();\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  the_loop: for (i = 0; i < 10; i++) {\n    _loopResult = _loop();\n    if (_loopResult.type === 'break') break the_loop;\n  }\n  expect(i).toBe(3);\n};",
  ],
  [
    'switch statements > switch break does not exit for loop',
    '() => {\n  var i;\n  for (i = 0; i < 10; i++) {\n    switch (i) {\n      case 1: {\n        break;\n      }\n    }\n    const z = 3;\n    (() => z)();\n  }\n  expect(i).toBe(10);\n}',
    "() => {\n  var i;\n  var _loopResult;\n  var _loop = () => {\n    switch (i) {\n      case 1: {\n        break;\n      }\n    }\n    var z = 3;\n    (() => z)();\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  for (i = 0; i < 10; i++) {\n    _loopResult = _loop();\n  }\n  expect(i).toBe(10);\n};",
  ],
  [
    'switch statements > continue in switch case continues loop',
    '() => {\n  var j = 0;\n  var i;\n  for (i = 0; i < 10; i++) {\n    switch (i) {\n      case 0: {\n        continue;\n      }\n    }\n    j++;\n    const z = 3;\n    (() => z)();\n  }\n  expect(j).toBe(9);\n}',
    "() => {\n  var j = 0;\n  var i;\n  var _loopResult;\n  var _loop = () => {\n    switch (i) {\n      case 0: {\n        return {\n          type: 'continue',\n          vars: [],\n        };\n      }\n    }\n    j++;\n    var z = 3;\n    (() => z)();\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  for (i = 0; i < 10; i++) {\n    _loopResult = _loop();\n    if (_loopResult.type === 'continue') continue;\n  }\n  expect(j).toBe(9);\n};",
  ],
  [
    'switch statements > nested loop inside switch with break',
    '() => {\n  var j = 0;\n  var i;\n  for (i = 0; i < 10; i++) {\n    switch (i) {\n      case 0: {\n        for (var k = 0; k < 10; k++) {\n          const z = 3;\n          (() => z)();\n          j++;\n          break;\n        }\n        break;\n      }\n    }\n    const z = 3;\n    (() => z)();\n  }\n  expect(j).toBe(1);\n}',
    "() => {\n  var j = 0;\n  var i;\n  var k;\n  var _loopResult;\n  var _loop = () => {\n    switch (i) {\n      case 0: {\n        var _loopResult7;\n        var _loop6 = () => {\n          var _z = 3;\n          (() => _z)();\n          j++;\n          return {\n            type: 'break',\n            vars: [],\n          };\n          return {\n            type: 'normal',\n            vars: [],\n          };\n        };\n        for (k = 0; k < 10; k++) {\n          _loopResult7 = _loop6();\n          if (_loopResult7.type === 'break') break;\n        }\n        break;\n      }\n    }\n    var z = 3;\n    (() => z)();\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  for (i = 0; i < 10; i++) {\n    _loopResult = _loop();\n  }\n  expect(j).toBe(1);\n};",
  ],
  [
    'switch statements > let in switch cases are block-scoped',
    "() => {\n  let result;\n  switch (1) {\n    case 1: {\n      let x = 'one';\n      result = x;\n      break;\n    }\n    case 2: {\n      let x = 'two';\n      result = x;\n      break;\n    }\n  }\n  expect(result).toBe('one');\n}",
    "() => {\n  var result;\n  switch (1) {\n    case 1: {\n      var x = 'one';\n      result = x;\n      break;\n    }\n    case 2: {\n      var _x = 'two';\n      result = _x;\n      break;\n    }\n  }\n  expect(result).toBe('one');\n};",
  ],
  [
    'temporal dead zone > reference before let declaration throws',
    '() => {\n  expect(() => {\n    i;\n    let i;\n  }).toThrow();\n}',
    '() => {\n  expect(() => {\n    i;\n    var i;\n  }).toThrow();\n};',
  ],
  [
    'temporal dead zone > let x = x throws ReferenceError',
    '() => {\n  expect(() => {\n    let x = x;\n  }).toThrow();\n}',
    '() => {\n  expect(() => {\n    var x = x;\n  }).toThrow();\n};',
  ],
  [
    'temporal dead zone > const reassignment throws TypeError',
    '() => {\n  expect(() => {\n    const x = 0;\n    x = 1;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    var x = 0;\n    (1, _readOnlyError('x'));\n  }).toThrow();\n};",
  ],
  [
    'temporal dead zone > assignment before const declaration throws',
    '() => {\n  expect(() => {\n    x = 1;\n    const x = 0;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    (1, _readOnlyError('x'));\n    var x = 0;\n  }).toThrow();\n};",
  ],
  [
    'temporal dead zone > closure called before const declaration throws',
    '() => {\n  expect(() => {\n    (() => {\n      x = 1;\n    })();\n    const x = 0;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    (() => {\n      (1, _readOnlyError('x'));\n    })();\n    var x = 0;\n  }).toThrow();\n};",
  ],
  [
    'temporal dead zone > deferred closure called after const declaration throws TypeError',
    '() => {\n  expect(() => {\n    const call = (() => {\n      return () => {\n        x = 1;\n      };\n    })();\n    const x = 0;\n    call();\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    var call = (() => {\n      return () => {\n        (1, _readOnlyError('x'));\n      };\n    })();\n    var x = 0;\n    call();\n  }).toThrow();\n};",
  ],
  [
    'temporal dead zone > let is undefined before initialization in same scope',
    '() => {\n  expect(() => {\n    expect(y).toBeUndefined();\n    let y = 1;\n  }).toThrow();\n}',
    '() => {\n  expect(() => {\n    expect(y).toBeUndefined();\n    var y = 1;\n  }).toThrow();\n};',
  ],
  [
    'temporal dead zone > typeof on TDZ variable does not throw',
    "() => {\n  // typeof is special - it doesn't throw even in TDZ in some engines\n  // but per spec it should throw for let/const. We just check it doesn't crash.\n  let didThrow = false;\n  try {\n    typeof tdz_var;\n    let tdz_var = 1;\n  } catch (e) {\n    didThrow = true;\n  }\n  // Either behavior is acceptable for this edge case\n  expect(typeof didThrow).toBe('boolean');\n}",
    "() => {\n  // typeof is special - it doesn't throw even in TDZ in some engines\n  // but per spec it should throw for let/const. We just check it doesn't crash.\n  var didThrow = false;\n  try {\n    typeof tdz_var;\n    var tdz_var = 1;\n  } catch (e) {\n    didThrow = true;\n  }\n  // Either behavior is acceptable for this edge case\n  expect(typeof didThrow).toBe('boolean');\n};",
  ],
  [
    'temporal dead zone > TDZ applies per-block',
    "() => {\n  let x = 'outer';\n  {\n    expect(() => {\n      return x;\n      let x = 'inner';\n    }).toThrow();\n  }\n}",
    "() => {\n  var x = 'outer';\n  {\n    expect(() => {\n      return _x;\n      var _x = 'inner';\n    }).toThrow();\n  }\n};",
  ],
  [
    'temporal dead zone > function hoisting is not affected by TDZ',
    '() => {\n  expect(() => {\n    foo();\n    function foo() {}\n  }).not.toThrow();\n}',
    '() => {\n  expect(() => {\n    foo();\n    function foo() {}\n  }).not.toThrow();\n};',
  ],
  [
    'closures in loops > var in for-loop shares binding (baseline)',
    '() => {\n  var funcs = [];\n  for (var i = 0; i < 5; i++) {\n    funcs.push(() => i);\n  }\n  // All closures see the same i = 5\n  expect(funcs[0]()).toBe(5);\n  expect(funcs[4]()).toBe(5);\n}',
    '() => {\n  var funcs = [];\n  for (var i = 0; i < 5; i++) {\n    funcs.push(() => i);\n  }\n  // All closures see the same i = 5\n  expect(funcs[0]()).toBe(5);\n  expect(funcs[4]()).toBe(5);\n};',
  ],
  [
    'closures in loops > let in for-loop with setTimeout pattern',
    '() => {\n  var results = [];\n  var callbacks = [];\n  for (let i = 0; i < 3; i++) {\n    callbacks.push(() => {\n      results.push(i);\n    });\n  }\n  callbacks.forEach((cb) => cb());\n  expect(results).toEqual([0, 1, 2]);\n}',
    "() => {\n  var results = [];\n  var callbacks = [];\n  var _loopResult;\n  var _loop = i => {\n    callbacks.push(() => {\n      results.push(i);\n    });\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 3; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  callbacks.forEach(cb => cb());\n  expect(results).toEqual([0, 1, 2]);\n};",
  ],
  [
    'closures in loops > const in for-of with async-like closures',
    "() => {\n  var tasks = [];\n  for (const item of ['a', 'b', 'c']) {\n    tasks.push(() => item);\n  }\n  expect(tasks.map((t) => t())).toEqual(['a', 'b', 'c']);\n}",
    "() => {\n  var tasks = [];\n  var _loopResult;\n  var _loop = item => {\n    tasks.push(() => item);\n    return {\n      type: 'normal',\n      vars: [item],\n    };\n  };\n  for (var item of ['a', 'b', 'c']) {\n    _loopResult = _loop(item);\n    item = _loopResult.vars[0];\n  }\n  expect(tasks.map(t => t())).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'closures in loops > let in for-loop with nested closures',
    '() => {\n  var outer = [];\n  for (let i = 0; i < 3; i++) {\n    var inner = [];\n    for (let j = 0; j < 3; j++) {\n      inner.push(() => [i, j]);\n    }\n    outer.push(inner);\n  }\n  expect(outer[0][0]()).toEqual([0, 0]);\n  expect(outer[0][2]()).toEqual([0, 2]);\n  expect(outer[2][1]()).toEqual([2, 1]);\n}',
    "() => {\n  var outer = [];\n  var inner;\n  var _loopResult;\n  var _loop = i => {\n    inner = [];\n    var _loopResult7;\n    var _loop6 = j => {\n      inner.push(() => [i, j]);\n      return {\n        type: 'normal',\n        vars: [j],\n      };\n    };\n    for (var j = 0; j < 3; j++) {\n      _loopResult7 = _loop6(j);\n      j = _loopResult7.vars[0];\n    }\n    outer.push(inner);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 3; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(outer[0][0]()).toEqual([0, 0]);\n  expect(outer[0][2]()).toEqual([0, 2]);\n  expect(outer[2][1]()).toEqual([2, 1]);\n};",
  ],
  [
    'closures in loops > let in while loop with closure',
    '() => {\n  var funcs = [];\n  let i = 0;\n  while (i < 3) {\n    let captured = i;\n    funcs.push(() => captured);\n    i++;\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n}',
    "() => {\n  var funcs = [];\n  var i = 0;\n  var _loopResult;\n  var _loop = () => {\n    var captured = i;\n    funcs.push(() => captured);\n    i++;\n    return {\n      type: 'normal',\n      vars: [],\n    };\n  };\n  while (i < 3) {\n    _loopResult = _loop();\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(1);\n  expect(funcs[2]()).toBe(2);\n};",
  ],
  [
    'closures in loops > let in for-in with closure captures each key',
    "() => {\n  var obj = { a: 1, b: 2, c: 3 };\n  var funcs = [];\n  for (let k in obj) {\n    funcs.push(() => k);\n  }\n  var keys = funcs.map((f) => f()).sort();\n  expect(keys).toEqual(['a', 'b', 'c']);\n}",
    "() => {\n  var obj = {\n    a: 1,\n    b: 2,\n    c: 3,\n  };\n  var funcs = [];\n  var _loopResult;\n  var _loop = k => {\n    funcs.push(() => k);\n    return {\n      type: 'normal',\n      vars: [k],\n    };\n  };\n  for (var k in obj) {\n    _loopResult = _loop(k);\n    k = _loopResult.vars[0];\n  }\n  var keys = funcs.map(f => f()).sort();\n  expect(keys).toEqual(['a', 'b', 'c']);\n};",
  ],
  [
    'Hermes issues > for-in closure with Object.defineProperty (hermes#575)',
    '() => {\n  const target = { x: 10, y: 20, z: 30 };\n  const proxy = {};\n  for (const key in target) {\n    Object.defineProperty(proxy, key, {\n      get: () => target[key],\n      enumerable: true,\n    });\n  }\n  expect(proxy.x).toBe(10);\n  expect(proxy.y).toBe(20);\n  expect(proxy.z).toBe(30);\n}',
    "() => {\n  var target = {\n    x: 10,\n    y: 20,\n    z: 30,\n  };\n  var proxy = {};\n  var _loopResult;\n  var _loop = key => {\n    Object.defineProperty(proxy, key, {\n      get: () => target[key],\n      enumerable: true,\n    });\n    return {\n      type: 'normal',\n      vars: [key],\n    };\n  };\n  for (var key in target) {\n    _loopResult = _loop(key);\n    key = _loopResult.vars[0];\n  }\n  expect(proxy.x).toBe(10);\n  expect(proxy.y).toBe(20);\n  expect(proxy.z).toBe(30);\n};",
  ],
  [
    'Hermes issues > block-scoped shadow does not affect outer closure (hermes#1599)',
    '() => {\n  function repro(t) {\n    const lambda = () => {\n      // Under the Hermes bug, t would be undefined here due to\n      // the const t declaration in the if-block below\n      const result = t === 42;\n      if (result) {\n        const t = 69;\n        void t; // use it to prevent removal\n      }\n      return result;\n    };\n    return lambda();\n  }\n  expect(repro(42)).toBe(true);\n}',
    '() => {\n  function repro(t) {\n    var lambda = () => {\n      // Under the Hermes bug, t would be undefined here due to\n      // the const t declaration in the if-block below\n      var result = t === 42;\n      if (result) {\n        var _t = 69;\n        void _t;\n      }\n      return result;\n    };\n    return lambda();\n  }\n  expect(repro(42)).toBe(true);\n};',
  ],
  [
    'Hermes issues > deeply nested shadow does not affect outer reference',
    "() => {\n  function test(value) {\n    const check = () => {\n      const captured = value;\n      if (true) {\n        if (true) {\n          const value = 'shadow';\n          void value;\n        }\n      }\n      return captured;\n    };\n    return check();\n  }\n  expect(test('original')).toBe('original');\n}",
    "() => {\n  function test(value) {\n    var check = () => {\n      var captured = value;\n      if (true) {\n        if (true) {\n          var _value = 'shadow';\n          void _value;\n        }\n      }\n      return captured;\n    };\n    return check();\n  }\n  expect(test('original')).toBe('original');\n};",
  ],
  [
    'Hermes issues > multiple shadows in different blocks',
    "() => {\n  function test(x) {\n    const fn = () => x;\n    {\n      const x = 'a';\n      void x;\n    }\n    {\n      const x = 'b';\n      void x;\n    }\n    return fn();\n  }\n  expect(test(42)).toBe(42);\n}",
    "() => {\n  function test(x) {\n    var fn = () => x;\n    {\n      var _x = 'a';\n      void _x;\n    }\n    {\n      var _x2 = 'b';\n      void _x2;\n    }\n    return fn();\n  }\n  expect(test(42)).toBe(42);\n};",
  ],
  [
    'assignment and mutation > let allows reassignment',
    '() => {\n  let x = 1;\n  x = 2;\n  expect(x).toBe(2);\n}',
    '() => {\n  var x = 1;\n  x = 2;\n  expect(x).toBe(2);\n};',
  ],
  [
    'assignment and mutation > const does not allow reassignment',
    '() => {\n  expect(() => {\n    const x = 1;\n    x = 2;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    var x = 1;\n    (2, _readOnlyError('x'));\n  }).toThrow();\n};",
  ],
  [
    'assignment and mutation > const object properties can be mutated',
    '() => {\n  const obj = { a: 1 };\n  obj.a = 2;\n  expect(obj.a).toBe(2);\n}',
    '() => {\n  var obj = { a: 1 };\n  obj.a = 2;\n  expect(obj.a).toBe(2);\n};',
  ],
  [
    'assignment and mutation > const array elements can be mutated',
    '() => {\n  const arr = [1, 2, 3];\n  arr[0] = 10;\n  expect(arr[0]).toBe(10);\n}',
    '() => {\n  var arr = [1, 2, 3];\n  arr[0] = 10;\n  expect(arr[0]).toBe(10);\n};',
  ],
  [
    'assignment and mutation > const += throws TypeError',
    '() => {\n  expect(() => {\n    const a = 1;\n    a += 2;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    var a = 1;\n    ((_readOnlyValue = a), (_readOnlyValue += 2), _readOnlyError('a'));\n  }).toThrow();\n};",
  ],
  [
    'assignment and mutation > const++ throws TypeError',
    '() => {\n  expect(() => {\n    const a = 1;\n    a++;\n  }).toThrow();\n}',
    "var _readOnlyValue;\nfunction _readOnlyError(r) {\n  throw new TypeError('\"' + r + '\" is read-only');\n}\n() => {\n  expect(() => {\n    var a = 1;\n    ((_readOnlyValue = a), _readOnlyValue++, _readOnlyError('a'));\n  }).toThrow();\n};",
  ],
  [
    'edge cases > let in try-catch blocks',
    "() => {\n  let x = 'outer';\n  try {\n    let x = 'try';\n    expect(x).toBe('try');\n    throw new Error('test');\n  } catch (e) {\n    let x = 'catch';\n    expect(x).toBe('catch');\n  } finally {\n    let x = 'finally';\n    expect(x).toBe('finally');\n  }\n  expect(x).toBe('outer');\n}",
    "() => {\n  var x = 'outer';\n  try {\n    var _x = 'try';\n    expect(_x).toBe('try');\n    throw new Error('test');\n  } catch (e) {\n    var _x3 = 'catch';\n    expect(_x3).toBe('catch');\n  } finally {\n    var _x2 = 'finally';\n    expect(_x2).toBe('finally');\n  }\n  expect(x).toBe('outer');\n};",
  ],
  [
    'edge cases > let in labeled block',
    "() => {\n  let x = 'outer';\n  block: {\n    let x = 'inner';\n    expect(x).toBe('inner');\n    break block;\n  }\n  expect(x).toBe('outer');\n}",
    "() => {\n  var x = 'outer';\n  block: {\n    var _x = 'inner';\n    expect(_x).toBe('inner');\n    break block;\n  }\n  expect(x).toBe('outer');\n};",
  ],
  [
    'edge cases > const declaration in case block does not leak to other cases',
    "() => {\n  function test(val) {\n    switch (val) {\n      case 1: {\n        const x = 'one';\n        return x;\n      }\n      case 2: {\n        const x = 'two';\n        return x;\n      }\n      default: {\n        const x = 'default';\n        return x;\n      }\n    }\n  }\n  expect(test(1)).toBe('one');\n  expect(test(2)).toBe('two');\n  expect(test(3)).toBe('default');\n}",
    "() => {\n  function test(val) {\n    switch (val) {\n      case 1: {\n        var x = 'one';\n        return x;\n      }\n      case 2: {\n        var _x = 'two';\n        return _x;\n      }\n      default: {\n        var _x2 = 'default';\n        return _x2;\n      }\n    }\n  }\n  expect(test(1)).toBe('one');\n  expect(test(2)).toBe('two');\n  expect(test(3)).toBe('default');\n};",
  ],
  [
    'edge cases > block scoping with comma operator',
    "() => {\n  let x;\n  {\n    let a = 1,\n      b = 2;\n    x = a + b;\n  }\n  expect(x).toBe(3);\n  expect(typeof a).toBe('undefined');\n  expect(typeof b).toBe('undefined');\n}",
    "() => {\n  var x;\n  {\n    var _a = 1,\n      _b = 2;\n    x = _a + _b;\n  }\n  expect(x).toBe(3);\n  expect(typeof a).toBe('undefined');\n  expect(typeof b).toBe('undefined');\n};",
  ],
  [
    'edge cases > for loop with let and complex update expression',
    '() => {\n  var results = [];\n  for (let i = 0; i < 6; i += 2) {\n    results.push(() => i);\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(2);\n  expect(results[2]()).toBe(4);\n}',
    "() => {\n  var results = [];\n  var _loopResult;\n  var _loop = i => {\n    results.push(() => i);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 6; i += 2) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(2);\n  expect(results[2]()).toBe(4);\n};",
  ],
  [
    'edge cases > immediately invoked closure in for loop captures correct value',
    '() => {\n  var results = [];\n  for (let i = 0; i < 3; i++) {\n    results.push(\n      (\n        (val) => () =>\n          val\n      )(i)\n    );\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(1);\n  expect(results[2]()).toBe(2);\n}',
    '() => {\n  var results = [];\n  for (var i = 0; i < 3; i++) {\n    results.push(\n      (\n        val => () =>\n          val\n      )(i),\n    );\n  }\n  expect(results[0]()).toBe(0);\n  expect(results[1]()).toBe(1);\n  expect(results[2]()).toBe(2);\n};',
  ],
  [
    'edge cases > let in arrow function parameter default does not leak',
    "() => {\n  let x = 'outer';\n  const fn = (\n    val = (() => {\n      let x = 'default';\n      return x;\n    })()\n  ) => val;\n  expect(fn()).toBe('default');\n  expect(x).toBe('outer');\n}",
    "() => {\n  var x = 'outer';\n  var fn = (\n    val = (() => {\n      var _x = 'default';\n      return _x;\n    })(),\n  ) => val;\n  expect(fn()).toBe('default');\n  expect(x).toBe('outer');\n};",
  ],
  [
    'edge cases > nested for loops with same variable name',
    '() => {\n  var outer = [];\n  var inner = [];\n  for (let i = 0; i < 3; i++) {\n    outer.push(() => i);\n    for (let i = 10; i < 13; i++) {\n      inner.push(() => i);\n    }\n  }\n  expect(outer[0]()).toBe(0);\n  expect(outer[1]()).toBe(1);\n  expect(outer[2]()).toBe(2);\n  expect(inner[0]()).toBe(10);\n  expect(inner[1]()).toBe(11);\n  expect(inner[2]()).toBe(12);\n}',
    "() => {\n  var outer = [];\n  var inner = [];\n  var _loopResult;\n  var _loop = i => {\n    outer.push(() => i);\n    var _loopResult6;\n    var _loop5 = i => {\n      inner.push(() => i);\n      return {\n        type: 'normal',\n        vars: [i],\n      };\n    };\n    for (var _i = 10; _i < 13; _i++) {\n      _loopResult6 = _loop5(_i);\n      _i = _loopResult6.vars[0];\n    }\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 3; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(outer[0]()).toBe(0);\n  expect(outer[1]()).toBe(1);\n  expect(outer[2]()).toBe(2);\n  expect(inner[0]()).toBe(10);\n  expect(inner[1]()).toBe(11);\n  expect(inner[2]()).toBe(12);\n};",
  ],
  [
    'edge cases > for-of with let and break',
    '() => {\n  var funcs = [];\n  for (const x of [1, 2, 3, 4, 5]) {\n    funcs.push(() => x);\n    if (x === 3) break;\n  }\n  expect(funcs.length).toBe(3);\n  expect(funcs[0]()).toBe(1);\n  expect(funcs[1]()).toBe(2);\n  expect(funcs[2]()).toBe(3);\n}',
    "() => {\n  var funcs = [];\n  var _loopResult;\n  var _loop = x => {\n    funcs.push(() => x);\n    if (x === 3)\n      return {\n        type: 'break',\n        vars: [x],\n      };\n    return {\n      type: 'normal',\n      vars: [x],\n    };\n  };\n  for (var x of [1, 2, 3, 4, 5]) {\n    _loopResult = _loop(x);\n    x = _loopResult.vars[0];\n    if (_loopResult.type === 'break') break;\n  }\n  expect(funcs.length).toBe(3);\n  expect(funcs[0]()).toBe(1);\n  expect(funcs[1]()).toBe(2);\n  expect(funcs[2]()).toBe(3);\n};",
  ],
  [
    'edge cases > closure captures let after mutation within same iteration',
    '() => {\n  var funcs = [];\n  for (let i = 0; i < 3; i++) {\n    let val = i;\n    val *= 10;\n    funcs.push(() => val);\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(10);\n  expect(funcs[2]()).toBe(20);\n}',
    "() => {\n  var funcs = [];\n  var _loopResult;\n  var _loop = i => {\n    var val = i;\n    val *= 10;\n    funcs.push(() => val);\n    return {\n      type: 'normal',\n      vars: [i],\n    };\n  };\n  for (var i = 0; i < 3; i++) {\n    _loopResult = _loop(i);\n    i = _loopResult.vars[0];\n  }\n  expect(funcs[0]()).toBe(0);\n  expect(funcs[1]()).toBe(10);\n  expect(funcs[2]()).toBe(20);\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
