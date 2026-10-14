import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    helpers: {
      mode: 'runtime',
      moduleName: '@babel/runtime',
      version: '7.29.7',
    },
    transforms: {
      destructuring: true,
    },
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'object patterns > extracts basic properties',
    '() => {\n  const { a, b } = { a: 1, b: 2, c: 3 };\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      a: 1,\n      b: 2,\n      c: 3,\n    }),\n    a = _obj.a,\n    b = _obj.b;\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n};",
  ],
  [
    'object patterns > renames properties',
    '() => {\n  const { a: x, b: y } = { a: 1, b: 2 };\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      a: 1,\n      b: 2,\n    }),\n    x = _obj.a,\n    y = _obj.b;\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n};",
  ],
  [
    'object patterns > applies default values for missing properties',
    '() => {\n  const { a = 10, b = 20 } = { a: 1 };\n  expect(a).toBe(1);\n  expect(b).toBe(20);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ a: 1 }),\n    _value = _obj.a,\n    a = _value === void 0 ? 10 : _value,\n    _value12 = _obj.b,\n    b = _value12 === void 0 ? 20 : _value12;\n  expect(a).toBe(1);\n  expect(b).toBe(20);\n};",
  ],
  [
    'object patterns > applies default values only for undefined, not null',
    '() => {\n  const { a = 10, b = 20 } = { a: null, b: undefined };\n  expect(a).toBe(null);\n  expect(b).toBe(20);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      a: null,\n      b: undefined,\n    }),\n    _value = _obj.a,\n    a = _value === void 0 ? 10 : _value,\n    _value13 = _obj.b,\n    b = _value13 === void 0 ? 20 : _value13;\n  expect(a).toBe(null);\n  expect(b).toBe(20);\n};",
  ],
  [
    'object patterns > renames with default values',
    '() => {\n  const { a: x = 10, b: y = 20 } = { a: 1 };\n  expect(x).toBe(1);\n  expect(y).toBe(20);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ a: 1 }),\n    _value = _obj.a,\n    x = _value === void 0 ? 10 : _value,\n    _value12 = _obj.b,\n    y = _value12 === void 0 ? 20 : _value12;\n  expect(x).toBe(1);\n  expect(y).toBe(20);\n};",
  ],
  [
    'object patterns > extracts computed property keys',
    "() => {\n  const key = 'hello';\n  const { [key]: val } = { hello: 42 };\n  expect(val).toBe(42);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const key = 'hello';\n  const _obj = _objectDestructuringEmpty({ hello: 42 }),\n    _key = key,\n    val = _obj[_key];\n  expect(val).toBe(42);\n};",
  ],
  [
    'object patterns > extracts computed property keys with side effects',
    "() => {\n  let counter = 0;\n  const keyFn = () => 'k' + counter++;\n  const obj = { k0: 'a', k1: 'b' };\n  const { [keyFn()]: first, [keyFn()]: second } = obj;\n  expect(first).toBe('a');\n  expect(second).toBe('b');\n  expect(counter).toBe(2);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  let counter = 0;\n  const keyFn = () => 'k' + counter++;\n  const obj = {\n    k0: 'a',\n    k1: 'b',\n  };\n  const _obj = _objectDestructuringEmpty(obj),\n    _key = keyFn(),\n    first = _obj[_key],\n    _key15 = keyFn(),\n    second = _obj[_key15];\n  expect(first).toBe('a');\n  expect(second).toBe('b');\n  expect(counter).toBe(2);\n};",
  ],
  [
    'object patterns > collects rest properties',
    '() => {\n  const { a, ...rest } = { a: 1, b: 2, c: 3 };\n  expect(a).toBe(1);\n  expect(rest).toEqual({ b: 2, c: 3 });\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      a: 1,\n      b: 2,\n      c: 3,\n    }),\n    a = _obj.a,\n    rest = _objectWithoutProperties(_obj, ['a']);\n  expect(a).toBe(1);\n  expect(rest).toEqual({\n    b: 2,\n    c: 3,\n  });\n};",
  ],
  [
    'object patterns > rest does not include extracted keys',
    '() => {\n  const { x, y, ...rest } = { x: 1, y: 2, z: 3, w: 4 };\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n  expect(rest).toEqual({ z: 3, w: 4 });\n  expect(rest.x).toBeUndefined();\n  expect(rest.y).toBeUndefined();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      x: 1,\n      y: 2,\n      z: 3,\n      w: 4,\n    }),\n    x = _obj.x,\n    y = _obj.y,\n    rest = _objectWithoutProperties(_obj, ['x', 'y']);\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n  expect(rest).toEqual({\n    z: 3,\n    w: 4,\n  });\n  expect(rest.x).toBeUndefined();\n  expect(rest.y).toBeUndefined();\n};",
  ],
  [
    'object patterns > rest produces an empty object when all keys extracted',
    '() => {\n  const { a, b, ...rest } = { a: 1, b: 2 };\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(rest).toEqual({});\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      a: 1,\n      b: 2,\n    }),\n    a = _obj.a,\n    b = _obj.b,\n    rest = _objectWithoutProperties(_obj, ['a', 'b']);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(rest).toEqual({});\n};",
  ],
  [
    'object patterns > handles nested object patterns',
    '() => {\n  const {\n    a: { b },\n  } = { a: { b: 42 } };\n  expect(b).toBe(42);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ a: { b: 42 } }),\n    _obj10 = _objectDestructuringEmpty(_obj.a),\n    b = _obj10.b;\n  expect(b).toBe(42);\n};",
  ],
  [
    'object patterns > handles nested objects with defaults',
    '() => {\n  const {\n    a: { b = 99 },\n  } = { a: {} };\n  expect(b).toBe(99);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ a: {} }),\n    _obj10 = _objectDestructuringEmpty(_obj.a),\n    _value = _obj10.b,\n    b = _value === void 0 ? 99 : _value;\n  expect(b).toBe(99);\n};",
  ],
  [
    'object patterns > handles shorthand for prototype properties',
    "() => {\n  const { toString } = {};\n  expect(typeof toString).toBe('function');\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({}),\n    toString = _obj.toString;\n  expect(typeof toString).toBe('function');\n};",
  ],
  [
    'object patterns > handles string keys with special characters',
    "() => {\n  const { 'foo-bar': val } = { 'foo-bar': 42 };\n  expect(val).toBe(42);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ 'foo-bar': 42 }),\n    val = _obj['foo-bar'];\n  expect(val).toBe(42);\n};",
  ],
  [
    'object patterns > handles numeric keys',
    "() => {\n  const { 0: first, 1: second } = { 0: 'a', 1: 'b' };\n  expect(first).toBe('a');\n  expect(second).toBe('b');\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      0: 'a',\n      1: 'b',\n    }),\n    first = _obj[0],\n    second = _obj[1];\n  expect(first).toBe('a');\n  expect(second).toBe('b');\n};",
  ],
  [
    'object patterns > extracts from nested defaults at multiple levels',
    '() => {\n  const { a: { b: { c = 3 } = {} } = {} } = {};\n  expect(c).toBe(3);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({}),\n    _value = _obj.a,\n    _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n    _value12 = _obj11.b,\n    _obj13 = _objectDestructuringEmpty(_value12 === void 0 ? {} : _value12),\n    _value14 = _obj13.c,\n    c = _value14 === void 0 ? 3 : _value14;\n  expect(c).toBe(3);\n};",
  ],
  [
    'object patterns > does not copy prototype properties into rest',
    '() => {\n  function Parent() {}\n  Parent.prototype.inherited = true;\n  const obj = Object.create(Parent.prototype);\n  obj.own = 1;\n  const { own, ...rest } = obj;\n  expect(own).toBe(1);\n  expect(rest.inherited).toBeUndefined();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  function Parent() {}\n  Parent.prototype.inherited = true;\n  const obj = Object.create(Parent.prototype);\n  obj.own = 1;\n  const _obj = _objectDestructuringEmpty(obj),\n    own = _obj.own,\n    rest = _objectWithoutProperties(_obj, ['own']);\n  expect(own).toBe(1);\n  expect(rest.inherited).toBeUndefined();\n};",
  ],
  [
    'object patterns > number key with object rest spread',
    "() => {\n  const foo = {\n    1: 'a',\n    2: 'b',\n    3: 'c',\n  };\n  const { [1]: bar, ...rest } = foo;\n  expect(bar).toBe('a');\n  expect(rest).toEqual({ 2: 'b', 3: 'c' });\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\n() => {\n  const foo = {\n    1: 'a',\n    2: 'b',\n    3: 'c',\n  };\n  const _obj = _objectDestructuringEmpty(foo),\n    _key = _toPropertyKey(1),\n    bar = _obj[_key],\n    rest = _objectWithoutProperties(_obj, [_key]);\n  expect(bar).toBe('a');\n  expect(rest).toEqual({\n    2: 'b',\n    3: 'c',\n  });\n};",
  ],
  [
    'object patterns > function key with object rest spread',
    "() => {\n  const { [(() => 1)()]: a, ...rest } = { 1: 'a' };\n  expect(a).toBe('a');\n  expect(rest).toEqual({});\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ 1: 'a' }),\n    _key = _toPropertyKey((() => 1)()),\n    a = _obj[_key],\n    rest = _objectWithoutProperties(_obj, [_key]);\n  expect(a).toBe('a');\n  expect(rest).toEqual({});\n};",
  ],
  [
    'object patterns > object rest with impure computed keys',
    "() => {\n  var key, x, y, z;\n\n  // impure key\n  key = 1;\n  ({ [key++]: y, ...x } = { 1: 1, a: 1 });\n  expect(x).toEqual({ a: 1 });\n  expect(key).toBe(2);\n  expect(y).toBe(1);\n\n  // takes care of the order\n  key = 1;\n  ({ [++key]: y, [++key]: z, ...x } = { 2: 2, 3: 3 });\n  expect(y).toBe(2);\n  expect(z).toBe(3);\n\n  // pure computed property should remain as-is\n  key = 2;\n  ({ [key]: y, z, ...x } = { 2: 'two', z: 'zee' });\n  expect(y).toBe('two');\n  expect(x).toEqual({});\n  expect(z).toBe('zee');\n\n  // rhs evaluated before lhs\n  var order = [];\n  function left() {\n    order.push('left');\n    return 0;\n  }\n  function right() {\n    order.push('right');\n    return {};\n  }\n  ({ [left()]: y, ...x } = right());\n  expect(order).toEqual(['right', 'left']);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\n() => {\n  var _ref,\n    _obj,\n    _key,\n    _ref17,\n    _obj18,\n    _key19,\n    _key20,\n    _ref21,\n    _obj22,\n    _key23,\n    _ref24,\n    _obj25,\n    _key26;\n  var key, x, y, z;\n  // impure key\n  key = 1;\n  ((_ref = {\n    1: 1,\n    a: 1,\n  }),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(key++)),\n    (y = _obj[_key]),\n    (x = _objectWithoutProperties(_obj, [_key])),\n    _ref);\n  expect(x).toEqual({ a: 1 });\n  expect(key).toBe(2);\n  expect(y).toBe(1);\n  // takes care of the order\n  key = 1;\n  ((_ref17 = {\n    2: 2,\n    3: 3,\n  }),\n    (_obj18 = _objectDestructuringEmpty(_ref17)),\n    (_key19 = _toPropertyKey(++key)),\n    (y = _obj18[_key19]),\n    (_key20 = _toPropertyKey(++key)),\n    (z = _obj18[_key20]),\n    (x = _objectWithoutProperties(_obj18, [_key19, _key20])),\n    _ref17);\n  expect(y).toBe(2);\n  expect(z).toBe(3);\n  // pure computed property should remain as-is\n  key = 2;\n  ((_ref21 = {\n    2: 'two',\n    z: 'zee',\n  }),\n    (_obj22 = _objectDestructuringEmpty(_ref21)),\n    (_key23 = _toPropertyKey(key)),\n    (y = _obj22[_key23]),\n    (z = _obj22.z),\n    (x = _objectWithoutProperties(_obj22, [_key23, 'z'])),\n    _ref21);\n  expect(y).toBe('two');\n  expect(x).toEqual({});\n  expect(z).toBe('zee');\n  // rhs evaluated before lhs\n  var order = [];\n  function left() {\n    order.push('left');\n    return 0;\n  }\n  function right() {\n    order.push('right');\n    return {};\n  }\n  ((_ref24 = right()),\n    (_obj25 = _objectDestructuringEmpty(_ref24)),\n    (_key26 = _toPropertyKey(left())),\n    (y = _obj25[_key26]),\n    (x = _objectWithoutProperties(_obj25, [_key26])),\n    _ref24);\n  expect(order).toEqual(['right', 'left']);\n};",
  ],
  [
    'object patterns > empty object pattern throws on null',
    '() => {\n  expect(function () {\n    var {} = null;\n  }).toThrow();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  expect(function () {\n    var _obj = _objectDestructuringEmpty(null);\n  }).toThrow();\n};",
  ],
  [
    'array patterns > extracts basic elements',
    '() => {\n  const [a, b, c] = [1, 2, 3];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1, 2, 3], 3, false),\n    a = _arr[0],\n    b = _arr[1],\n    c = _arr[2];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n};",
  ],
  [
    'array patterns > skips elements with elision',
    '() => {\n  const [, second, , fourth] = [1, 2, 3, 4];\n  expect(second).toBe(2);\n  expect(fourth).toBe(4);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1, 2, 3, 4], 4, false),\n    second = _arr[1],\n    fourth = _arr[3];\n  expect(second).toBe(2);\n  expect(fourth).toBe(4);\n};",
  ],
  [
    'array patterns > applies default values for missing elements',
    '() => {\n  const [a = 10, b = 20, c = 30] = [1];\n  expect(a).toBe(1);\n  expect(b).toBe(20);\n  expect(c).toBe(30);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1], 3, false),\n    _value = _arr[0],\n    a = _value === void 0 ? 10 : _value,\n    _value13 = _arr[1],\n    b = _value13 === void 0 ? 20 : _value13,\n    _value14 = _arr[2],\n    c = _value14 === void 0 ? 30 : _value14;\n  expect(a).toBe(1);\n  expect(b).toBe(20);\n  expect(c).toBe(30);\n};",
  ],
  [
    'array patterns > applies default values only for undefined, not null or 0',
    '() => {\n  const [a = 10, b = 20, c = 30] = [null, 0, undefined];\n  expect(a).toBe(null);\n  expect(b).toBe(0);\n  expect(c).toBe(30);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([null, 0, undefined], 3, false),\n    _value = _arr[0],\n    a = _value === void 0 ? 10 : _value,\n    _value14 = _arr[1],\n    b = _value14 === void 0 ? 20 : _value14,\n    _value15 = _arr[2],\n    c = _value15 === void 0 ? 30 : _value15;\n  expect(a).toBe(null);\n  expect(b).toBe(0);\n  expect(c).toBe(30);\n};",
  ],
  [
    'array patterns > collects rest elements',
    '() => {\n  const [head, ...tail] = [1, 2, 3, 4];\n  expect(head).toBe(1);\n  expect(tail).toEqual([2, 3, 4]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1, 2, 3, 4], 1, true),\n    head = _arr[0],\n    tail = _arr.slice(1);\n  expect(head).toBe(1);\n  expect(tail).toEqual([2, 3, 4]);\n};",
  ],
  [
    'array patterns > rest produces empty array when no remaining elements',
    '() => {\n  const [a, ...rest] = [1];\n  expect(a).toBe(1);\n  expect(rest).toEqual([]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1], 1, true),\n    a = _arr[0],\n    rest = _arr.slice(1);\n  expect(a).toBe(1);\n  expect(rest).toEqual([]);\n};",
  ],
  [
    'array patterns > handles nested array patterns',
    '() => {\n  const [a, [b, c]] = [1, [2, 3]];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray([1, [2, 3]], 2, false),\n    a = _arr[0],\n    _arr12 = _toArray(_arr[1], 2, false),\n    b = _arr12[0],\n    c = _arr12[1];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n};",
  ],
  [
    'array patterns > destructures string as iterable',
    "() => {\n  const [a, b, c] = 'xyz';\n  expect(a).toBe('x');\n  expect(b).toBe('y');\n  expect(c).toBe('z');\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray('xyz', 3, false),\n    a = _arr[0],\n    b = _arr[1],\n    c = _arr[2];\n  expect(a).toBe('x');\n  expect(b).toBe('y');\n  expect(c).toBe('z');\n};",
  ],
  [
    'array patterns > destructures string with rest',
    "() => {\n  const [first, ...rest] = 'hello';\n  expect(first).toBe('h');\n  expect(rest).toEqual(['e', 'l', 'l', 'o']);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray('hello', 1, true),\n    first = _arr[0],\n    rest = _arr.slice(1);\n  expect(first).toBe('h');\n  expect(rest).toEqual(['e', 'l', 'l', 'o']);\n};",
  ],
  [
    'array patterns > handles holes in source array',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [a, b, c] = [1, , 3];\n  expect(a).toBe(1);\n  expect(b).toBeUndefined();\n  expect(c).toBe(3);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([1, , 3], 3, false),\n    a = _arr[0],\n    b = _arr[1],\n    c = _arr[2];\n  expect(a).toBe(1);\n  expect(b).toBeUndefined();\n  expect(c).toBe(3);\n};",
  ],
  [
    'array patterns > handles holes with defaults',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [a = 10, b = 20, c = 30] = [, , 3];\n  expect(a).toBe(10);\n  expect(b).toBe(20);\n  expect(c).toBe(3);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([, , 3], 3, false),\n    _value = _arr[0],\n    a = _value === void 0 ? 10 : _value,\n    _value13 = _arr[1],\n    b = _value13 === void 0 ? 20 : _value13,\n    _value14 = _arr[2],\n    c = _value14 === void 0 ? 30 : _value14;\n  expect(a).toBe(10);\n  expect(b).toBe(20);\n  expect(c).toBe(3);\n};",
  ],
  [
    'array patterns > destructures Set iterable',
    '() => {\n  const [a, b, c] = new Set([1, 2, 3]);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const _arr = _toArray(new Set([1, 2, 3]), 3, false),\n    a = _arr[0],\n    b = _arr[1],\n    c = _arr[2];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n};",
  ],
  [
    'array patterns > destructures Map iterable',
    "() => {\n  const map = new Map();\n  map.set('x', 1);\n  map.set('y', 2);\n  const [[k1, v1], [k2, v2]] = map;\n  expect(k1).toBe('x');\n  expect(v1).toBe(1);\n  expect(k2).toBe('y');\n  expect(v2).toBe(2);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const map = new Map();\n  map.set('x', 1);\n  map.set('y', 2);\n  const _arr = _toArray(map, 2, false),\n    _arr15 = _toArray(_arr[0], 2, false),\n    k1 = _arr15[0],\n    v1 = _arr15[1],\n    _arr16 = _toArray(_arr[1], 2, false),\n    k2 = _arr16[0],\n    v2 = _arr16[1];\n  expect(k1).toBe('x');\n  expect(v1).toBe(1);\n  expect(k2).toBe('y');\n  expect(v2).toBe(2);\n};",
  ],
  [
    'array patterns > destructures generator iterable',
    '() => {\n  function* gen() {\n    yield 10;\n    yield 20;\n    yield 30;\n  }\n  const [a, b] = gen();\n  expect(a).toBe(10);\n  expect(b).toBe(20);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  function* gen() {\n    yield 10;\n    yield 20;\n    yield 30;\n  }\n  const _arr = _toArray(gen(), 2, false),\n    a = _arr[0],\n    b = _arr[1];\n  expect(a).toBe(10);\n  expect(b).toBe(20);\n};",
  ],
  [
    'array patterns > rest with generator consumes remaining yields',
    '() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  const [first, ...rest] = gen();\n  expect(first).toBe(1);\n  expect(rest).toEqual([2, 3]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  function* gen() {\n    yield 1;\n    yield 2;\n    yield 3;\n  }\n  const _arr = _toArray(gen(), 1, true),\n    first = _arr[0],\n    rest = _arr.slice(1);\n  expect(first).toBe(1);\n  expect(rest).toEqual([2, 3]);\n};",
  ],
  [
    'array patterns > destructures custom iterable',
    '() => {\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return i < 3 ? { value: i++, done: false } : { done: true };\n        },\n      };\n    },\n  };\n  const [a, b, c] = iterable;\n  expect(a).toBe(0);\n  expect(b).toBe(1);\n  expect(c).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const iterable = {\n    [Symbol.iterator]() {\n      let i = 0;\n      return {\n        next() {\n          return i < 3\n            ? {\n                value: i++,\n                done: false,\n              }\n            : { done: true };\n        },\n      };\n    },\n  };\n  const _arr = _toArray(iterable, 3, false),\n    a = _arr[0],\n    b = _arr[1],\n    c = _arr[2];\n  expect(a).toBe(0);\n  expect(b).toBe(1);\n  expect(c).toBe(2);\n};",
  ],
  [
    'array patterns > destructures empty string',
    "() => {\n  let [a] = '';\n  expect(a).toBe(undefined);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  let _arr = _toArray('', 1, false),\n    a = _arr[0];\n  expect(a).toBe(undefined);\n};",
  ],
  [
    'array patterns > spread from generator into rest',
    '() => {\n  function* f() {\n    for (var i = 0; i < 3; i++) {\n      yield i;\n    }\n  }\n  var [...xs] = f();\n  expect(xs).toEqual([0, 1, 2]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  function* f() {\n    for (var i = 0; i < 3; i++) {\n      yield i;\n    }\n  }\n  var _arr = _toArray(f(), 0, true),\n    xs = _arr.slice(0);\n  expect(xs).toEqual([0, 1, 2]);\n};",
  ],
  [
    'array patterns > rest from extended array produces plain Array',
    "() => {\n  class ExtendedArray extends Array {\n    constructor(...args) {\n      super(...args);\n    }\n  }\n  let extArr = new ExtendedArray(1, 2, 3, 4, 5);\n  let [first, second, ...rest] = extArr;\n  expect(first).toBe(1);\n  expect(second).toBe(2);\n  expect(rest).toEqual([3, 4, 5]);\n  expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  class ExtendedArray extends Array {\n    constructor(...args) {\n      super(...args);\n    }\n  }\n  let extArr = new ExtendedArray(1, 2, 3, 4, 5);\n  let _arr = _toArray(extArr, 2, true),\n    first = _arr[0],\n    second = _arr[1],\n    rest = _arr.slice(2);\n  expect(first).toBe(1);\n  expect(second).toBe(2);\n  expect(rest).toEqual([3, 4, 5]);\n  expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');\n};",
  ],
  [
    'array patterns > array rest in params does not mutate original (issue-5090)',
    '() => {\n  const assign = function ([...arr], index, value) {\n    arr[index] = value;\n    return arr;\n  };\n  const arr = [1, 2, 3];\n  const result = assign(arr, 1, 42);\n  expect(arr).toEqual([1, 2, 3]);\n  expect(result).toEqual([1, 42, 3]);\n}',
    '() => {\n  const assign = function ([...arr], index, value) {\n    arr[index] = value;\n    return arr;\n  };\n  const arr = [1, 2, 3];\n  const result = assign(arr, 1, 42);\n  expect(arr).toEqual([1, 2, 3]);\n  expect(result).toEqual([1, 42, 3]);\n};',
  ],
  [
    'array patterns > iterator .next getter is evaluated only once per destructuring',
    '() => {\n  let gets = 0;\n  let it = {\n    [Symbol.iterator]: () => ({\n      get next() {\n        gets++;\n        let i = 0;\n        return () => ({ done: false, value: i++ });\n      },\n    }),\n  };\n\n  // eslint-disable-next-line no-empty-pattern\n  let [] = it;\n  expect(gets).toBe(1);\n\n  let [a] = it;\n  expect(gets).toBe(2);\n  expect(a).toBe(0);\n\n  let [b, c] = it;\n  expect(gets).toBe(3);\n  expect(b).toBe(0);\n  expect(c).toBe(1);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  let gets = 0;\n  let it = {\n    [Symbol.iterator]: () => ({\n      get next() {\n        gets++;\n        let i = 0;\n        return () => ({\n          done: false,\n          value: i++,\n        });\n      },\n    }),\n  };\n  // eslint-disable-next-line no-empty-pattern\n  let _arr = _toArray(it, 0, false);\n  expect(gets).toBe(1);\n  let _arr17 = _toArray(it, 1, false),\n    a = _arr17[0];\n  expect(gets).toBe(2);\n  expect(a).toBe(0);\n  let _arr19 = _toArray(it, 2, false),\n    b = _arr19[0],\n    c = _arr19[1];\n  expect(gets).toBe(3);\n  expect(b).toBe(0);\n  expect(c).toBe(1);\n};",
  ],
  [
    'mixed patterns > array pattern inside object',
    '() => {\n  const {\n    items: [x, y],\n  } = { items: [1, 2] };\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({ items: [1, 2] }),\n    _arr = _toArray(_obj.items, 2, false),\n    x = _arr[0],\n    y = _arr[1];\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n};",
  ],
  [
    'mixed patterns > object pattern inside array',
    '() => {\n  const [{ a, b }] = [{ a: 1, b: 2 }];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _arr = _toArray(\n      [\n        {\n          a: 1,\n          b: 2,\n        },\n      ],\n      1,\n      false,\n    ),\n    _obj = _objectDestructuringEmpty(_arr[0]),\n    a = _obj.a,\n    b = _obj.b;\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n};",
  ],
  [
    'mixed patterns > deeply nested mixed patterns',
    "() => {\n  const data = {\n    users: [{ name: 'Alice', scores: [10, 20, 30] }],\n  };\n  const {\n    users: [\n      {\n        name,\n        scores: [first, , third],\n      },\n    ],\n  } = data;\n  expect(name).toBe('Alice');\n  expect(first).toBe(10);\n  expect(third).toBe(30);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const data = {\n    users: [\n      {\n        name: 'Alice',\n        scores: [10, 20, 30],\n      },\n    ],\n  };\n  const _obj = _objectDestructuringEmpty(data),\n    _arr = _toArray(_obj.users, 1, false),\n    _obj14 = _objectDestructuringEmpty(_arr[0]),\n    name = _obj14.name,\n    _arr15 = _toArray(_obj14.scores, 3, false),\n    first = _arr15[0],\n    third = _arr15[2];\n  expect(name).toBe('Alice');\n  expect(first).toBe(10);\n  expect(third).toBe(30);\n};",
  ],
  [
    'mixed patterns > object rest with nested array',
    "() => {\n  const {\n    data: [head, ...tail],\n    ...meta\n  } = {\n    data: [1, 2, 3],\n    type: 'test',\n    version: 2,\n  };\n  expect(head).toBe(1);\n  expect(tail).toEqual([2, 3]);\n  expect(meta).toEqual({ type: 'test', version: 2 });\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      data: [1, 2, 3],\n      type: 'test',\n      version: 2,\n    }),\n    _arr = _toArray(_obj.data, 1, true),\n    head = _arr[0],\n    tail = _arr.slice(1),\n    meta = _objectWithoutProperties(_obj, ['data']);\n  expect(head).toBe(1);\n  expect(tail).toEqual([2, 3]);\n  expect(meta).toEqual({\n    type: 'test',\n    version: 2,\n  });\n};",
  ],
  [
    'function parameters > object destructuring in function params',
    "() => {\n  function greet({ name, greeting }) {\n    return greeting + ' ' + name;\n  }\n  expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');\n}",
    "() => {\n  function greet({ name, greeting }) {\n    return greeting + ' ' + name;\n  }\n  expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');\n};",
  ],
  [
    'function parameters > object destructuring with defaults in params',
    '() => {\n  function point({ x = 0, y = 0 }) {\n    return [x, y];\n  }\n  expect(point({})).toEqual([0, 0]);\n  expect(point({ x: 5 })).toEqual([5, 0]);\n  expect(point({ x: 3, y: 4 })).toEqual([3, 4]);\n}',
    '() => {\n  function point({ x = 0, y = 0 }) {\n    return [x, y];\n  }\n  expect(point({})).toEqual([0, 0]);\n  expect(point({ x: 5 })).toEqual([5, 0]);\n  expect(point({ x: 3, y: 4 })).toEqual([3, 4]);\n};',
  ],
  [
    'function parameters > array destructuring in function params',
    '() => {\n  function first([a]) {\n    return a;\n  }\n  expect(first([42, 99])).toBe(42);\n}',
    '() => {\n  function first([a]) {\n    return a;\n  }\n  expect(first([42, 99])).toBe(42);\n};',
  ],
  [
    'function parameters > arrow function with object destructuring',
    '() => {\n  const sum = ({ a, b }) => a + b;\n  expect(sum({ a: 3, b: 4 })).toBe(7);\n}',
    '() => {\n  const sum = ({ a, b }) => a + b;\n  expect(sum({ a: 3, b: 4 })).toBe(7);\n};',
  ],
  [
    'function parameters > arrow function with array destructuring',
    '() => {\n  const head = ([first]) => first;\n  expect(head([10, 20, 30])).toBe(10);\n}',
    '() => {\n  const head = ([first]) => first;\n  expect(head([10, 20, 30])).toBe(10);\n};',
  ],
  [
    'function parameters > nested destructuring in arrow params',
    '() => {\n  const fn = ({ data: { id, value = 0 } }) => id + value;\n  expect(fn({ data: { id: 10 } })).toBe(10);\n  expect(fn({ data: { id: 10, value: 5 } })).toBe(15);\n}',
    '() => {\n  const fn = ({ data: { id, value = 0 } }) => id + value;\n  expect(fn({ data: { id: 10 } })).toBe(10);\n  expect(fn({ data: { id: 10, value: 5 } })).toBe(15);\n};',
  ],
  [
    'function parameters > rest in function params',
    "() => {\n  function f({ required, ...options }) {\n    return { required, keys: Object.keys(options) };\n  }\n  const result = f({ required: true, a: 1, b: 2 });\n  expect(result.required).toBe(true);\n  expect(result.keys.sort()).toEqual(['a', 'b']);\n}",
    "() => {\n  function f({ required, ...options }) {\n    return { required, keys: Object.keys(options) };\n  }\n  const result = f({ required: true, a: 1, b: 2 });\n  expect(result.required).toBe(true);\n  expect(result.keys.sort()).toEqual(['a', 'b']);\n};",
  ],
  [
    'function parameters > default parameter value for entire destructured param',
    '() => {\n  function f({ x, y } = { x: 0, y: 0 }) {\n    return x + y;\n  }\n  expect(f()).toBe(0);\n  expect(f({ x: 1, y: 2 })).toBe(3);\n}',
    '() => {\n  function f({ x, y } = { x: 0, y: 0 }) {\n    return x + y;\n  }\n  expect(f()).toBe(0);\n  expect(f({ x: 1, y: 2 })).toBe(3);\n};',
  ],
  [
    'function parameters > mixed defaults: param-level and property-level',
    '() => {\n  function f({ x = 1, y = 2 } = {}) {\n    return x + y;\n  }\n  expect(f()).toBe(3);\n  expect(f({})).toBe(3);\n  expect(f({ x: 10 })).toBe(12);\n}',
    '() => {\n  function f({ x = 1, y = 2 } = {}) {\n    return x + y;\n  }\n  expect(f()).toBe(3);\n  expect(f({})).toBe(3);\n  expect(f({ x: 10 })).toBe(12);\n};',
  ],
  [
    'function parameters > default value references previous params',
    '() => {\n  var f0 = function (a, b = a, c = b) {\n    return [a, b, c];\n  };\n  expect(f0(1)).toEqual([1, 1, 1]);\n\n  var f1 = function ({ a }, b = a, c = b) {\n    return [a, b, c];\n  };\n  expect(f1({ a: 1 })).toEqual([1, 1, 1]);\n\n  var f2 = function ({ a }, b = a, c = a) {\n    return [a, b, c];\n  };\n  expect(f2({ a: 1 })).toEqual([1, 1, 1]);\n}',
    '() => {\n  var f0 = function (a, b = a, c = b) {\n    return [a, b, c];\n  };\n  expect(f0(1)).toEqual([1, 1, 1]);\n\n  var f1 = function ({ a }, b = a, c = b) {\n    return [a, b, c];\n  };\n  expect(f1({ a: 1 })).toEqual([1, 1, 1]);\n\n  var f2 = function ({ a }, b = a, c = a) {\n    return [a, b, c];\n  };\n  expect(f2({ a: 1 })).toEqual([1, 1, 1]);\n};',
  ],
  [
    'loops > for-of with object destructuring',
    "() => {\n  const items = [\n    { id: 1, value: 'a' },\n    { id: 2, value: 'b' },\n  ];\n  const ids = [];\n  for (const { id } of items) {\n    ids.push(id);\n  }\n  expect(ids).toEqual([1, 2]);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const items = [\n    {\n      id: 1,\n      value: 'a',\n    },\n    {\n      id: 2,\n      value: 'b',\n    },\n  ];\n  const ids = [];\n  for (const _ref of items) {\n    const _obj = _objectDestructuringEmpty(_ref),\n      id = _obj.id;\n    {\n      ids.push(id);\n    }\n  }\n  expect(ids).toEqual([1, 2]);\n};",
  ],
  [
    'loops > for-of with array destructuring',
    "() => {\n  const pairs = [\n    [1, 'a'],\n    [2, 'b'],\n  ];\n  const keys = [];\n  const values = [];\n  for (const [k, v] of pairs) {\n    keys.push(k);\n    values.push(v);\n  }\n  expect(keys).toEqual([1, 2]);\n  expect(values).toEqual(['a', 'b']);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const pairs = [\n    [1, 'a'],\n    [2, 'b'],\n  ];\n  const keys = [];\n  const values = [];\n  for (const _ref of pairs) {\n    const _arr = _toArray(_ref, 2, false),\n      k = _arr[0],\n      v = _arr[1];\n    {\n      keys.push(k);\n      values.push(v);\n    }\n  }\n  expect(keys).toEqual([1, 2]);\n  expect(values).toEqual(['a', 'b']);\n};",
  ],
  [
    'loops > for-of with nested destructuring',
    "() => {\n  const data = [\n    { user: { name: 'Alice' }, scores: [10] },\n    { user: { name: 'Bob' }, scores: [20] },\n  ];\n  const results = [];\n  for (const {\n    user: { name },\n    scores: [score],\n  } of data) {\n    results.push({ name, score });\n  }\n  expect(results).toEqual([\n    { name: 'Alice', score: 10 },\n    { name: 'Bob', score: 20 },\n  ]);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const data = [\n    {\n      user: { name: 'Alice' },\n      scores: [10],\n    },\n    {\n      user: { name: 'Bob' },\n      scores: [20],\n    },\n  ];\n  const results = [];\n  for (const _ref of data) {\n    const _obj = _objectDestructuringEmpty(_ref),\n      _obj13 = _objectDestructuringEmpty(_obj.user),\n      name = _obj13.name,\n      _arr = _toArray(_obj.scores, 1, false),\n      score = _arr[0];\n    {\n      results.push({\n        name,\n        score,\n      });\n    }\n  }\n  expect(results).toEqual([\n    {\n      name: 'Alice',\n      score: 10,\n    },\n    {\n      name: 'Bob',\n      score: 20,\n    },\n  ]);\n};",
  ],
  [
    'loops > for-of with Map entries',
    "() => {\n  const map = new Map([\n    ['x', 1],\n    ['y', 2],\n  ]);\n  const result = {};\n  for (const [key, val] of map) {\n    result[key] = val;\n  }\n  expect(result).toEqual({ x: 1, y: 2 });\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  const map = new Map([\n    ['x', 1],\n    ['y', 2],\n  ]);\n  const result = {};\n  for (const _ref of map) {\n    const _arr = _toArray(_ref, 2, false),\n      key = _arr[0],\n      val = _arr[1];\n    {\n      result[key] = val;\n    }\n  }\n  expect(result).toEqual({\n    x: 1,\n    y: 2,\n  });\n};",
  ],
  [
    'loops > for-of with computed key referencing outer scope despite inner shadow',
    "() => {\n  var O = { a: 'a' };\n  const a = 'a';\n  var ran = false;\n  for (const { [a]: _ } of [O]) {\n    const a = 'A'; // shadows outer `a`, but computed key already evaluated\n    expect(_).toBe('a');\n    ran = true;\n  }\n  expect(ran).toBe(true);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var O = { a: 'a' };\n  const a = 'a';\n  var ran = false;\n  for (const _ref of [O]) {\n    const _obj = _objectDestructuringEmpty(_ref),\n      _key = a,\n      _ = _obj[_key];\n    {\n      const a = 'A';\n      expect(_).toBe('a');\n      ran = true;\n    }\n  }\n  expect(ran).toBe(true);\n};",
  ],
  [
    'assignment expressions > object destructuring assignment',
    '() => {\n  let a, b;\n  ({ a, b } = { a: 1, b: 2 });\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var _ref, _obj;\n  let a, b;\n  ((_ref = {\n    a: 1,\n    b: 2,\n  }),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (a = _obj.a),\n    (b = _obj.b),\n    _ref);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n};",
  ],
  [
    'assignment expressions > array destructuring assignment',
    '() => {\n  let x, y;\n  [x, y] = [1, 2];\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  let x, y;\n  ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n};",
  ],
  [
    'assignment expressions > swap via array destructuring',
    '() => {\n  let a = 1,\n    b = 2;\n  [a, b] = [b, a];\n  expect(a).toBe(2);\n  expect(b).toBe(1);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  let a = 1,\n    b = 2;\n  ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n  expect(a).toBe(2);\n  expect(b).toBe(1);\n};",
  ],
  [
    'assignment expressions > nested assignment',
    "() => {\n  let name, score;\n  ({\n    user: { name },\n    scores: [score],\n  } = { user: { name: 'test' }, scores: [100] });\n  expect(name).toBe('test');\n  expect(score).toBe(100);\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var _ref, _obj, _obj11, _arr;\n  let name, score;\n  ((_ref = {\n    user: { name: 'test' },\n    scores: [100],\n  }),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (_obj11 = _objectDestructuringEmpty(_obj.user)),\n    (name = _obj11.name),\n    (_arr = _toArray(_obj.scores, 1, false)),\n    (score = _arr[0]),\n    _ref);\n  expect(name).toBe('test');\n  expect(score).toBe(100);\n};",
  ],
  [
    'assignment expressions > assignment with rest',
    '() => {\n  let first, rest;\n  [first, ...rest] = [1, 2, 3, 4];\n  expect(first).toBe(1);\n  expect(rest).toEqual([2, 3, 4]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  let first, rest;\n  ((_ref = [1, 2, 3, 4]),\n    (_arr = _toArray(_ref, 1, true)),\n    (first = _arr[0]),\n    (rest = _arr.slice(1)),\n    _ref);\n  expect(first).toBe(1);\n  expect(rest).toEqual([2, 3, 4]);\n};",
  ],
  [
    'assignment expressions > chained destructuring assignment',
    '() => {\n  var a, b, c, d;\n  ({ a, b } = { c, d } = { a: 1, b: 2, c: 3, d: 4 });\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n  expect(d).toBe(4);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var _ref, _obj, _ref13, _obj14;\n  var a, b, c, d;\n  ((_ref =\n    ((_ref13 = {\n      a: 1,\n      b: 2,\n      c: 3,\n      d: 4,\n    }),\n    (_obj14 = _objectDestructuringEmpty(_ref13)),\n    (c = _obj14.c),\n    (d = _obj14.d),\n    _ref13)),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (a = _obj.a),\n    (b = _obj.b),\n    _ref);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(c).toBe(3);\n  expect(d).toBe(4);\n};",
  ],
  [
    'catch clause > destructures error object in catch',
    "() => {\n  let msg, code;\n  try {\n    throw { message: 'fail', code: 42 };\n  } catch ({ message, code: c }) {\n    msg = message;\n    code = c;\n  }\n  expect(msg).toBe('fail');\n  expect(code).toBe(42);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  let msg, code;\n  try {\n    throw {\n      message: 'fail',\n      code: 42,\n    };\n  } catch (_caught) {\n    let _obj = _objectDestructuringEmpty(_caught),\n      message = _obj.message,\n      c = _obj.code;\n    msg = message;\n    code = c;\n  }\n  expect(msg).toBe('fail');\n  expect(code).toBe(42);\n};",
  ],
  [
    'catch clause > destructures Error instance properties',
    "() => {\n  let msg;\n  try {\n    throw new TypeError('bad type');\n  } catch ({ message }) {\n    msg = message;\n  }\n  expect(msg).toBe('bad type');\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  let msg;\n  try {\n    throw new TypeError('bad type');\n  } catch (_caught) {\n    let _obj = _objectDestructuringEmpty(_caught),\n      message = _obj.message;\n    msg = message;\n  }\n  expect(msg).toBe('bad type');\n};",
  ],
  [
    'declaration variants > const with object destructuring',
    '() => {\n  const { x, y } = { x: 1, y: 2 };\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _obj = _objectDestructuringEmpty({\n      x: 1,\n      y: 2,\n    }),\n    x = _obj.x,\n    y = _obj.y;\n  expect(x).toBe(1);\n  expect(y).toBe(2);\n};",
  ],
  [
    'declaration variants > let with array destructuring',
    '() => {\n  let [a, b] = [1, 2];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  // let allows reassignment\n  [a, b] = [3, 4];\n  expect(a).toBe(3);\n  expect(b).toBe(4);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref11, _arr12;\n  let _arr = _toArray([1, 2], 2, false),\n    a = _arr[0],\n    b = _arr[1];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  // let allows reassignment\n  ((_ref11 = [3, 4]),\n    (_arr12 = _toArray(_ref11, 2, false)),\n    (a = _arr12[0]),\n    (b = _arr12[1]),\n    _ref11);\n  expect(a).toBe(3);\n  expect(b).toBe(4);\n};",
  ],
  [
    'declaration variants > var with multiple destructuring patterns',
    '() => {\n  var { a } = { a: 1 },\n    [b] = [2];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var _obj = _objectDestructuringEmpty({ a: 1 }),\n    a = _obj.a,\n    _arr = _toArray([2], 1, false),\n    b = _arr[0];\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n};",
  ],
  [
    'declaration variants > const with nested defaults from function return',
    '() => {\n  const getState = () => ({});\n  const { data: { courses: oldCourses = [] } = {} } = getState();\n  expect(oldCourses).toEqual([]);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const getState = () => ({});\n  const _obj = _objectDestructuringEmpty(getState()),\n    _value = _obj.data,\n    _obj12 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n    _value13 = _obj12.courses,\n    oldCourses = _value13 === void 0 ? [] : _value13;\n  expect(oldCourses).toEqual([]);\n};",
  ],
  [
    'iterator protocol > empty pattern calls iterator.return when return() returns object',
    '() => {\n  var returnCalled = false;\n  // eslint-disable-next-line no-empty-pattern\n  var [] = {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {\n          returnCalled = true;\n          return {};\n        },\n      };\n    },\n  };\n  expect(returnCalled).toBe(true);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var returnCalled = false;\n  // eslint-disable-next-line no-empty-pattern\n  var _arr = _toArray(\n    {\n      [Symbol.iterator]: () => {\n        return {\n          return: () => {\n            returnCalled = true;\n            return {};\n          },\n        };\n      },\n    },\n    0,\n    false,\n  );\n  expect(returnCalled).toBe(true);\n};",
  ],
  [
    'iterator protocol > empty pattern throws if iterator.return() returns non-object',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = {\n      [Symbol.iterator]: () => {\n        return {\n          return: () => {},\n        };\n      },\n    };\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray(\n      {\n        [Symbol.iterator]: () => {\n          return { return: () => {} };\n        },\n      },\n      0,\n      false,\n    );\n  }).toThrow();\n};",
  ],
  [
    'iterator protocol > single-element pattern throws if iterator.return() returns non-object',
    '() => {\n  expect(() => {\n    var [x] = {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({ done: false, value: 1 }),\n          return: () => {},\n        };\n      },\n    };\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    var _arr = _toArray(\n        {\n          [Symbol.iterator]: () => {\n            return {\n              next: () => ({\n                done: false,\n                value: 1,\n              }),\n              return: () => {},\n            };\n          },\n        },\n        1,\n        false,\n      ),\n      x = _arr[0];\n  }).toThrow();\n};",
  ],
  [
    'iterator protocol > single-element pattern does not throw if iterator.return() returns object',
    '() => {\n  expect(() => {\n    var [x] = {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({ done: false, value: 1 }),\n          return: () => ({}),\n        };\n      },\n    };\n  }).not.toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    var _arr = _toArray(\n        {\n          [Symbol.iterator]: () => {\n            return {\n              next: () => ({\n                done: false,\n                value: 1,\n              }),\n              return: () => ({}),\n            };\n          },\n        },\n        1,\n        false,\n      ),\n      x = _arr[0];\n  }).not.toThrow();\n};",
  ],
  [
    'holes and sparse arrays > default with explicit hole (let)',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  let [x = 23] = [,];\n  expect(x).toBe(23);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  let _arr = _toArray([,], 1, false),\n    _value = _arr[0],\n    x = _value === void 0 ? 23 : _value;\n  expect(x).toBe(23);\n};",
  ],
  [
    'holes and sparse arrays > default with hole and trailing value (const)',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [y = 24, z] = [, 42];\n  expect(y).toBe(24);\n  expect(z).toBe(42);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([, 42], 2, false),\n    _value = _arr[0],\n    y = _value === void 0 ? 24 : _value,\n    z = _arr[1];\n  expect(y).toBe(24);\n  expect(z).toBe(42);\n};",
  ],
  [
    'holes and sparse arrays > default interleaves with generator evaluation order',
    '() => {\n  function* foo() {\n    yield 1;\n    yield 2;\n  }\n  let bar = foo();\n  // The default for `a` is bar.next().value, but it only runs because\n  // position 0 is a hole. By the time it runs, bar has already yielded 1\n  // (for position 1), so the default produces 2.\n  // eslint-disable-next-line no-sparse-arrays\n  const [a = bar.next().value, b] = [, bar.next().value];\n  expect(a).toBe(2);\n  expect(b).toBe(1);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  function* foo() {\n    yield 1;\n    yield 2;\n  }\n  let bar = foo();\n  // The default for `a` is bar.next().value, but it only runs because\n  // position 0 is a hole. By the time it runs, bar has already yielded 1\n  // (for position 1), so the default produces 2.\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([, bar.next().value], 2, false),\n    _value = _arr[0],\n    a = _value === void 0 ? bar.next().value : _value,\n    b = _arr[1];\n  expect(a).toBe(2);\n  expect(b).toBe(1);\n};",
  ],
  [
    'holes and sparse arrays > assignment pattern with hole',
    '() => {\n  var c;\n  // eslint-disable-next-line no-sparse-arrays\n  const arr = ([c = 42] = [,]);\n  expect(c).toBe(42);\n  // eslint-disable-next-line no-sparse-arrays\n  expect(arr).toEqual([,]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr, _value;\n  var c;\n  // eslint-disable-next-line no-sparse-arrays\n  const arr =\n    ((_ref = [,]),\n    (_arr = _toArray(_ref, 1, false)),\n    (_value = _arr[0]),\n    (c = _value === void 0 ? 42 : _value),\n    _ref);\n  expect(c).toBe(42);\n  // eslint-disable-next-line no-sparse-arrays\n  expect(arr).toEqual([,]);\n};",
  ],
  [
    'holes and sparse arrays > rest from sparse array fills holes with undefined',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [...d] = [,];\n  expect(d).toEqual([undefined]);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([,], 0, true),\n    d = _arr.slice(0);\n  expect(d).toEqual([undefined]);\n};",
  ],
  [
    'holes and sparse arrays > rest with object pattern from sparse array',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [...{ 0: e }] = [,];\n  expect(e).toEqual(undefined);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([,], 0, true),\n    _obj = _objectDestructuringEmpty(_arr.slice(0)),\n    e = _obj[0];\n  expect(e).toEqual(undefined);\n};",
  ],
  [
    'holes and sparse arrays > single element from sparse array is undefined',
    '() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const [f] = [,];\n  expect(f).toEqual(undefined);\n  // eslint-disable-next-line no-sparse-arrays\n  let [g] = [,];\n  expect(g).toEqual(undefined);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  // eslint-disable-next-line no-sparse-arrays\n  const _arr = _toArray([,], 1, false),\n    f = _arr[0];\n  expect(f).toEqual(undefined);\n  // eslint-disable-next-line no-sparse-arrays\n  let _arr13 = _toArray([,], 1, false),\n    g = _arr13[0];\n  expect(g).toEqual(undefined);\n};",
  ],
  [
    'holes and sparse arrays > object pattern from hole throws',
    '() => {\n  var thrown;\n  try {\n    thrown = false;\n    // eslint-disable-next-line no-sparse-arrays\n    [{}] = [,];\n  } catch (e) {\n    thrown = true;\n  }\n  expect(thrown).toBe(true);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  var _ref, _arr, _obj;\n  var thrown;\n  try {\n    thrown = false;\n    // eslint-disable-next-line no-sparse-arrays\n    ((_ref = [,]),\n      (_arr = _toArray(_ref, 1, false)),\n      (_obj = _objectDestructuringEmpty(_arr[0])),\n      _ref);\n  } catch (e) {\n    thrown = true;\n  }\n  expect(thrown).toBe(true);\n};",
  ],
  [
    'holes and sparse arrays > array pattern from hole throws',
    '() => {\n  var thrown;\n  try {\n    thrown = false;\n    // eslint-disable-next-line no-sparse-arrays\n    [[]] = [,];\n  } catch (e) {\n    thrown = true;\n  }\n  expect(thrown).toBe(true);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr, _arr11;\n  var thrown;\n  try {\n    thrown = false;\n    // eslint-disable-next-line no-sparse-arrays\n    ((_ref = [,]), (_arr = _toArray(_ref, 1, false)), (_arr11 = _toArray(_arr[0], 0, false)), _ref);\n  } catch (e) {\n    thrown = true;\n  }\n  expect(thrown).toBe(true);\n};",
  ],
  [
    'empty array pattern > throws on null',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = null;\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray(null, 0, false);\n  }).toThrow();\n};",
  ],
  [
    'empty array pattern > throws on number',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = 42;\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray(42, 0, false);\n  }).toThrow();\n};",
  ],
  [
    'empty array pattern > throws on plain object',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = {};\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray({}, 0, false);\n  }).toThrow();\n};",
  ],
  [
    'empty array pattern > throws if Symbol.iterator returns non-object',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = { [Symbol.iterator]: () => {} };\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray({ [Symbol.iterator]: () => {} }, 0, false);\n  }).toThrow();\n};",
  ],
  [
    'empty array pattern > does not throw on valid iterables',
    "() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var [] = [];\n    // eslint-disable-next-line no-empty-pattern\n    var [] = [0, 1, 2];\n    // eslint-disable-next-line no-empty-pattern\n    var [] = 'foo';\n    // eslint-disable-next-line no-empty-pattern\n    var [] = (function* () {\n      throw new Error('Should not throw');\n    })();\n    // eslint-disable-next-line no-empty-pattern\n    var [] = { [Symbol.iterator]: () => ({}) };\n  }).not.toThrow();\n}",
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    var _arr = _toArray([], 0, false);\n    // eslint-disable-next-line no-empty-pattern\n    var _arr12 = _toArray([0, 1, 2], 0, false);\n    // eslint-disable-next-line no-empty-pattern\n    var _arr14 = _toArray('foo', 0, false);\n    // eslint-disable-next-line no-empty-pattern\n    var _arr16 = _toArray(\n      (function* () {\n        throw new Error('Should not throw');\n      })(),\n      0,\n      false,\n    );\n    // eslint-disable-next-line no-empty-pattern\n    var _arr18 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);\n  }).not.toThrow();\n};",
  ],
  [
    'non-iterable errors > throws on undefined',
    '() => {\n  var foo;\n  expect(() => {\n    [foo] = undefined;\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var foo;\n  expect(() => {\n    var _ref, _arr;\n    ((_ref = undefined), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);\n  }).toThrow();\n};",
  ],
  [
    'non-iterable errors > throws on plain object',
    '() => {\n  var foo;\n  expect(() => {\n    [foo] = {};\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var foo;\n  expect(() => {\n    var _ref, _arr;\n    ((_ref = {}), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);\n  }).toThrow();\n};",
  ],
  [
    'edge cases > empty object pattern does not throw on object',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    const {} = { a: 1 };\n  }).not.toThrow();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    const _obj = _objectDestructuringEmpty({ a: 1 });\n  }).not.toThrow();\n};",
  ],
  [
    'edge cases > empty array pattern does not throw on array',
    '() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    const [] = [1, 2];\n  }).not.toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    // eslint-disable-next-line no-empty-pattern\n    const _arr = _toArray([1, 2], 0, false);\n  }).not.toThrow();\n};",
  ],
  [
    'edge cases > destructuring null throws TypeError',
    '() => {\n  expect(() => {\n    const { a } = null;\n  }).toThrow();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  expect(() => {\n    const _obj = _objectDestructuringEmpty(null),\n      a = _obj.a;\n  }).toThrow();\n};",
  ],
  [
    'edge cases > destructuring undefined throws TypeError',
    '() => {\n  expect(() => {\n    const { a } = undefined;\n  }).toThrow();\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  expect(() => {\n    const _obj = _objectDestructuringEmpty(undefined),\n      a = _obj.a;\n  }).toThrow();\n};",
  ],
  [
    'edge cases > array destructuring from non-iterable throws',
    '() => {\n  expect(() => {\n    const [a] = 42;\n  }).toThrow();\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  expect(() => {\n    const _arr = _toArray(42, 1, false),\n      a = _arr[0];\n  }).toThrow();\n};",
  ],
  [
    'edge cases > default value expression is lazily evaluated',
    '() => {\n  let evaluated = false;\n  const { a = (evaluated = true) } = { a: 1 };\n  expect(a).toBe(1);\n  expect(evaluated).toBe(false);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  let evaluated = false;\n  const _obj = _objectDestructuringEmpty({ a: 1 }),\n    _value = _obj.a,\n    a = _value === void 0 ? (evaluated = true) : _value;\n  expect(a).toBe(1);\n  expect(evaluated).toBe(false);\n};",
  ],
  [
    'edge cases > default value expression evaluated when value is undefined',
    '() => {\n  let count = 0;\n  const { a = ++count, b = ++count } = { a: undefined };\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(count).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  let count = 0;\n  const _obj = _objectDestructuringEmpty({ a: undefined }),\n    _value = _obj.a,\n    a = _value === void 0 ? ++count : _value,\n    _value14 = _obj.b,\n    b = _value14 === void 0 ? ++count : _value14;\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(count).toBe(2);\n};",
  ],
  [
    'edge cases > array default value expression is lazily evaluated',
    '() => {\n  let evaluated = false;\n  const [a = (evaluated = true)] = [42];\n  expect(a).toBe(42);\n  expect(evaluated).toBe(false);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  let evaluated = false;\n  const _arr = _toArray([42], 1, false),\n    _value = _arr[0],\n    a = _value === void 0 ? (evaluated = true) : _value;\n  expect(a).toBe(42);\n  expect(evaluated).toBe(false);\n};",
  ],
  [
    'edge cases > evaluation order matches spec for object destructuring',
    "() => {\n  const order = [];\n  const obj = {\n    get a() {\n      order.push('get a');\n      return 1;\n    },\n    get b() {\n      order.push('get b');\n      return 2;\n    },\n  };\n  const { a, b } = obj;\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(order).toEqual(['get a', 'get b']);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const order = [];\n  const obj = {\n    get a() {\n      order.push('get a');\n      return 1;\n    },\n    get b() {\n      order.push('get b');\n      return 2;\n    },\n  };\n  const _obj = _objectDestructuringEmpty(obj),\n    a = _obj.a,\n    b = _obj.b;\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n  expect(order).toEqual(['get a', 'get b']);\n};",
  ],
  [
    'edge cases > rest creates a shallow copy',
    '() => {\n  const inner = { value: 1 };\n  const { a, ...rest } = { a: 1, b: inner };\n  expect(rest.b).toBe(inner);\n  inner.value = 2;\n  expect(rest.b.value).toBe(2);\n}',
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const inner = { value: 1 };\n  const _obj = _objectDestructuringEmpty({\n      a: 1,\n      b: inner,\n    }),\n    a = _obj.a,\n    rest = _objectWithoutProperties(_obj, ['a']);\n  expect(rest.b).toBe(inner);\n  inner.value = 2;\n  expect(rest.b.value).toBe(2);\n};",
  ],
  [
    'edge cases > rest with symbol keys are included',
    "() => {\n  const sym = Symbol('test');\n  const obj = { a: 1, [sym]: 2 };\n  const { a, ...rest } = obj;\n  expect(a).toBe(1);\n  expect(rest[sym]).toBe(2);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const sym = Symbol('test');\n  const obj = {\n    a: 1,\n    [sym]: 2,\n  };\n  const _obj = _objectDestructuringEmpty(obj),\n    a = _obj.a,\n    rest = _objectWithoutProperties(_obj, ['a']);\n  expect(a).toBe(1);\n  expect(rest[sym]).toBe(2);\n};",
  ],
  [
    'edge cases > destructuring assignment returns the right-hand value',
    '() => {\n  let a, b;\n  const result = ([a, b] = [1, 2]);\n  expect(result).toEqual([1, 2]);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  let a, b;\n  const result =\n    ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n  expect(result).toEqual([1, 2]);\n  expect(a).toBe(1);\n  expect(b).toBe(2);\n};",
  ],
  [
    'edge cases > array rest with object pattern',
    '() => {\n  const [first, ...{ length }] = [1, 2, 3];\n  expect(first).toBe(1);\n  expect(length).toBe(2);\n}',
    "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\n() => {\n  const _arr = _toArray([1, 2, 3], 1, true),\n    first = _arr[0],\n    _obj = _objectDestructuringEmpty(_arr.slice(1)),\n    length = _obj.length;\n  expect(first).toBe(1);\n  expect(length).toBe(2);\n};",
  ],
  [
    'edge cases > handles large number of properties',
    "() => {\n  const obj = {};\n  for (let i = 0; i < 100; i++) {\n    obj['k' + i] = i;\n  }\n  const { k0, k50, k99, ...rest } = obj;\n  expect(k0).toBe(0);\n  expect(k50).toBe(50);\n  expect(k99).toBe(99);\n  expect(Object.keys(rest).length).toBe(97);\n}",
    "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n() => {\n  const obj = {};\n  for (let i = 0; i < 100; i++) {\n    obj['k' + i] = i;\n  }\n  const _obj = _objectDestructuringEmpty(obj),\n    k0 = _obj.k0,\n    k50 = _obj.k50,\n    k99 = _obj.k99,\n    rest = _objectWithoutProperties(_obj, ['k0', 'k50', 'k99']);\n  expect(k0).toBe(0);\n  expect(k50).toBe(50);\n  expect(k99).toBe(99);\n  expect(Object.keys(rest).length).toBe(97);\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
