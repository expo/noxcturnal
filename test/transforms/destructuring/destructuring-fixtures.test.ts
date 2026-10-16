import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  2: 'c',\n  length: 3,\n};\nvar _arr = _toArray(o, 0, true),\n  rest = _arr;\nexpect(rest).toEqual(['a', undefined, 'c']);\nexpect(1 in rest).toBe(true);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  1: 'b',\n  2: 'c',\n  length: 2,\n};\nvar _arr = _toArray(o, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe('a');\nexpect(rest).toEqual(['b']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  1: 'b',\n  2: 'c',\n  length: 3,\n};\nvar _arr = _toArray(o, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe('a');\nexpect(rest).toEqual(['b', 'c']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _arr = _toArray(o, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _arr = _toArray(baz, 2, false),\n  foo = _arr[0],\n  bar = _arr[1];",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref12, _arr13;\nfor (var _ref in obj) {\n  var _arr = _toArray(_ref, 2, false),\n    name = _arr[0],\n    value = _arr[1];\n  {\n    print('Name: ' + name + ', Value: ' + value);\n  }\n}\nfor (_ref12 in obj) {\n  ((_arr13 = _toArray(_ref12, 2, false)), (name = _arr13[0]), (value = _arr13[1]));\n  {\n    print('Name: ' + name + ', Value: ' + value);\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\n((_ref = obj),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  (c = _objectWithoutProperties(_obj, ['a', 'b'])),\n  _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet _obj = _objectDestructuringEmpty(obj),\n  _key = _toPropertyKey(a),\n  b = _obj[_key],\n  c = _objectWithoutProperties(_obj, [_key]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet sym = Symbol();\nlet _obj = _objectDestructuringEmpty({\n    a: 1,\n    b: 2,\n    [sym]: 3,\n  }),\n  a = _obj.a,\n  r = _objectWithoutProperties(_obj, ['a']);\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet _obj = _objectDestructuringEmpty(obj),\n  a = _obj.a,\n  _obj14 = _objectDestructuringEmpty(_obj.nested),\n  b = _obj14.b,\n  c = _obj14.c,\n  d = _objectWithoutProperties(_obj14, ['b', 'c']),\n  e = _obj.e;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _obj = _objectDestructuringEmpty(obj),\n  a = _obj.a,\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar a = (() => [1, 2, 3])();\n// Simulate old environment\nglobal.Symbol = void 0;\nvar _arr = _toArray(a, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe(1);\nexpect(rest).toEqual([2, 3]);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar a = (() => [1, 2, 3])();\n// !!! In order to run this test, this shouldn't be optimized using type inference\n// If it's optimized and doesn't call toArray, please modify this test\n// and exec.js\nvar _arr = _toArray(a, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref29, _arr30, _ref41, _arr42, _ref43, _arr44;\nvar _arr = _toArray([1, 2], 2, false),\n  a = _arr[0],\n  b = _arr[1];\nvar _arr15 = _toArray([[1, 2]], 1, false),\n  _arr16 = _toArray(_arr15[0], 2, false),\n  a = _arr16[0],\n  b = _arr16[1];\nvar _arr18 = _toArray([1, 2, 3, 4], 2, true),\n  a = _arr18[0],\n  b = _arr18[1],\n  c = _arr18.slice(2);\nvar _arr20 = _toArray([[1, 2, 3, 4]], 1, false),\n  _arr21 = _toArray(_arr20[0], 2, true),\n  a = _arr21[0],\n  b = _arr21[1],\n  c = _arr21.slice(2);\nvar _arr23 = _toArray([1, 2, 3], 2, false),\n  a = _arr23[0],\n  b = _arr23[1];\nvar _arr25 = _toArray([[1, 2, 3]], 1, false),\n  _arr26 = _toArray(_arr25[0], 2, false),\n  a = _arr26[0],\n  b = _arr26[1];\nvar _arr28 = _toArray([a, b], 2, false),\n  a = _arr28[0],\n  b = _arr28[1];\n((_ref29 = [a[1], a[0]]),\n  (_arr30 = _toArray(_ref29, 2, false)),\n  (a[0] = _arr30[0]),\n  (a[1] = _arr30[1]),\n  _ref29);\nvar _arr32 = _toArray([...foo, bar], 2, false),\n  a = _arr32[0],\n  b = _arr32[1];\nvar _arr34 = _toArray([foo(), bar], 2, false),\n  a = _arr34[0],\n  b = _arr34[1];\nvar _arr36 = _toArray([clazz.foo(), bar], 2, false),\n  a = _arr36[0],\n  b = _arr36[1];\nvar _arr38 = _toArray([clazz.foo, bar], 2, false),\n  a = _arr38[0],\n  b = _arr38[1];\nvar _arr40 = _toArray([, 2], 2, false),\n  a = _arr40[0],\n  b = _arr40[1];\n((_ref41 = [1, 2]),\n  (_arr42 = _toArray(_ref41, 2, false)),\n  (a = _arr42[0]),\n  (b = _arr42[1]),\n  _ref41);\n((_ref43 = [, 2]), (_arr44 = _toArray(_ref43, 2, false)), (a = _arr44[0]), (b = _arr44[1]), _ref43);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref13, _arr14, _arr15, _arr16;\nvar _arr = _toArray(['hello', [', ', 'junk'], ['world']], 3, false),\n  a = _arr[0],\n  _arr11 = _toArray(_arr[1], 1, false),\n  b = _arr11[0],\n  _arr12 = _toArray(_arr[2], 1, false),\n  c = _arr12[0];\n((_ref13 = ['hello', [', ', 'junk'], ['world']]),\n  (_arr14 = _toArray(_ref13, 3, false)),\n  (a = _arr14[0]),\n  (_arr15 = _toArray(_arr14[1], 1, false)),\n  (b = _arr15[0]),\n  (_arr16 = _toArray(_arr14[2], 1, false)),\n  (c = _arr16[0]),\n  _ref13);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n};",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  return ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n};",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nvar x, y;\n((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar z = {};\nvar _obj = _objectDestructuringEmpty(z),\n  _value = _obj.x,\n  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  y = _obj11.y;",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nconsole.log(((_ref = [123]), (_arr = _toArray(_ref, 1, false)), (x = _arr[0]), _ref));",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nvar x, y;\n((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref, y);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\n((_ref = f()), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref, _obj, _ref13, _obj14;\nvar a, b, c, d;\n((_ref =\n  ((_ref13 = {\n    a: 1,\n    b: 2,\n    c: 3,\n    d: 4,\n  }),\n  (_obj14 = _objectDestructuringEmpty(_ref13)),\n  (c = _obj14.c),\n  (d = _obj14.d),\n  _ref13)),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  _ref);\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toBe(3);\nexpect(d).toBe(4);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nexpect(() => {\n  var _arr = _toArray(\n    {\n      [Symbol.iterator]: () => {\n        return { return: () => {} };\n      },\n    },\n    0,\n    false,\n  );\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr13 = _toArray(\n    {\n      [Symbol.iterator]: () => {\n        return { return: () => ({}) };\n      },\n    },\n    0,\n    false,\n  );\n}).not.toThrow();\nexpect(() => {\n  var _arr15 = _toArray(\n      {\n        [Symbol.iterator]: () => {\n          return {\n            next: () => ({\n              done: false,\n              value: 1,\n            }),\n            return: () => {},\n          };\n        },\n      },\n      1,\n      false,\n    ),\n    x = _arr15[0];\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr17 = _toArray(\n      {\n        [Symbol.iterator]: () => {\n          return {\n            next: () => ({\n              done: false,\n              value: 1,\n            }),\n            return: () => ({}),\n          };\n        },\n      },\n      1,\n      false,\n    ),\n    x = _arr17[0];\n}).not.toThrow();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _arr = _toArray(\n  {\n    [Symbol.iterator]: () => {\n      return { return: () => {} };\n    },\n  },\n  0,\n  false,\n);\nvar _arr11 = _toArray(\n  {\n    [Symbol.iterator]: () => {\n      return { return: () => ({}) };\n    },\n  },\n  0,\n  false,\n);\nvar _arr13 = _toArray(\n    {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({\n            done: false,\n            value: 1,\n          }),\n          return: () => {},\n        };\n      },\n    },\n    1,\n    false,\n  ),\n  x = _arr13[0];\nvar _arr15 = _toArray(\n    {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({\n            done: false,\n            value: 1,\n          }),\n          return: () => ({}),\n        };\n      },\n    },\n    1,\n    false,\n  ),\n  x = _arr15[0];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst example = obj => {\n  const foo = 'foo';\n  const _obj = _objectDestructuringEmpty(obj),\n    _key = _toPropertyKey(`prefix_${foo}`),\n    _ = _obj[_key],\n    rest = _objectWithoutProperties(_obj, [_key]);\n};",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nconst getState = () => ({});\nconst _obj = _objectDestructuringEmpty(getState()),\n  _value = _obj.data,\n  _obj12 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  _value13 = _obj12.courses,\n  oldCourses = _value13 === void 0 ? [] : _value13;\nexpect(oldCourses).toEqual([]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nconst _obj = _objectDestructuringEmpty(getState()),\n  _value = _obj.data,\n  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  _value12 = _obj11.courses,\n  oldCourses = _value12 === void 0 ? [] : _value12;",
  'var f0 = function (a, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f0(1)).toEqual([1, 1, 1]);\n\nvar f1 = function ({ a }, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f1({ a: 1 })).toEqual([1, 1, 1]);\n\nvar f2 = function ({ a }, b = a, c = a) {\n  return [a, b, c];\n};\n\nexpect(f2({ a: 1 })).toEqual([1, 1, 1]);',
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref12, _obj13, _ref14, _obj15;\nfor (let x in y) for (;;) var _obj = _objectDestructuringEmpty(x);\nfor (let x in y) for (var _obj11 = _objectDestructuringEmpty(x); ;);\nfor (let x in y)\n  for (\n    ;\n    (_ref12 = x), (_obj13 = _objectDestructuringEmpty(_ref12)), _ref12;\n    _ref14 = x, _obj15 = _objectDestructuringEmpty(_ref14), _ref14\n  )\n    var _obj17 = _objectDestructuringEmpty(x);\nfor (let _obj19 = _objectDestructuringEmpty(0); 0;);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nexpect(() => {\n  var _arr = _toArray(null, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr14 = _toArray(42, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr16 = _toArray({}, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr18 = _toArray({ [Symbol.iterator]: () => {} }, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _arr20 = _toArray([], 0, false);\n  var _arr22 = _toArray([0, 1, 2], 0, false);\n  var _arr24 = _toArray('foo', 0, false);\n  var _arr26 = _toArray(\n    (function* () {\n      throw new Error('Should not throw');\n    })(),\n    0,\n    false,\n  );\n  var _arr28 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);\n  var _arr30 = _toArray({ [Symbol.iterator]: () => () => {} }, 0, false);\n  var _arr32 = _toArray({ [Symbol.iterator]: async function* () {} }, 0, false);\n}).not.toThrow();\n// iterator.return should be called\nvar returnCalled = false;\nvar _arr34 = _toArray(\n  {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {\n          returnCalled = true;\n          return {};\n        },\n      };\n    },\n  },\n  0,\n  false,\n);\nexpect(returnCalled).toStrictEqual(true);\n// #15154\nexpect(() => {\n  var _arr36 = _toArray({ [Symbol.iterator]: () => [] }, 0, false);\n}).not.toThrow();\n// #15168\nexpect(() => {\n  var _arr38 = _toArray({ [Symbol.iterator]: () => async function* () {} }, 0, false);\n}).not.toThrow();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _arr = _toArray(null, 0, false);\nvar _arr12 = _toArray(42, 0, false);\nvar _arr14 = _toArray({}, 0, false);\nvar _arr16 = _toArray({ [Symbol.iterator]: () => {} }, 0, false);\nvar _arr18 = _toArray([], 0, false);\nvar _arr20 = _toArray([0, 1, 2], 0, false);\nvar _arr22 = _toArray('foo', 0, false);\nvar _arr24 = _toArray(\n  (function* () {\n    throw new Error('Should not throw');\n  })(),\n  0,\n  false,\n);\nvar _arr26 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);\nvar _arr28 = _toArray({ [Symbol.iterator]: () => () => {} }, 0, false);\nvar _arr30 = _toArray({ [Symbol.iterator]: async function* () {} }, 0, false);\n// iterator.return should be called\nvar returnCalled = false;\nvar _arr32 = _toArray(\n  {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {\n          returnCalled = true;\n          return {};\n        },\n      };\n    },\n  },\n  0,\n  false,\n);\n// #15154\nvar _arr34 = _toArray({ [Symbol.iterator]: () => [] }, 0, false);\n// #15168\nvar _arr36 = _toArray({ [Symbol.iterator]: () => async function* () {} }, 0, false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexpect(function () {\n  var _obj = _objectDestructuringEmpty(null);\n}).toThrow('Cannot destructure null');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _obj = _objectDestructuringEmpty(null);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _arr = _toArray('', 1, false),\n  a = _arr[0];\nexpect(a).toBe(undefined);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _arr = _toArray('', 1, false),\n  a = _arr[0];",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _arr = _toArray(['foo', 'hello', [', ', 'junk'], ['world']], 5, false),\n  a = _arr[1],\n  _arr12 = _toArray(_arr[2], 1, false),\n  b = _arr12[0],\n  _arr13 = _toArray(_arr[3], 1, false),\n  c = _arr13[0],\n  d = _arr[4];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref17, _obj18;\nvar z = {};\nvar _obj = _objectDestructuringEmpty(z),\n  x = _extends({}, _obj);\nvar _obj13 = _objectDestructuringEmpty(z),\n  x = _obj13.x,\n  y = _objectWithoutProperties(_obj13, ['x']);\nvar _obj15 = _objectDestructuringEmpty(z),\n  _key = _toPropertyKey(x),\n  x = _obj15[_key],\n  y = _objectWithoutProperties(_obj15, [_key]);\n(function ({ x, ...y }) {});\n((_ref17 = o),\n  (_obj18 = _objectDestructuringEmpty(_ref17)),\n  (x = _obj18.x),\n  (y = _obj18.y),\n  (z = _objectWithoutProperties(_obj18, ['x', 'y'])),\n  _ref17);",
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexport let _obj = _objectDestructuringEmpty({}),\n  a = _obj.a,\n  b = _obj.b,\n  _obj12 = _objectDestructuringEmpty(_obj.c),\n  d = _obj12.d,\n  _obj13 = _objectDestructuringEmpty(_obj12.e),\n  _value = _obj13.f,\n  f = _value === void 0 ? 4 : _value;",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nfor (\n  let _arr = _toArray([], 1, false),\n    _value = _arr[0],\n    _arr10 = _toArray(_value === void 0 ? [1] : _value, 1, false),\n    x = _arr10[0];\n  ;\n) {}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nfor (let _arr = _toArray(range, 2, false), i = _arr[0], n = _arr[1]; ;) {}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref12, _obj13, _key14;\nvar O = { a: 'a' };\nconst a = 'a';\nfor (const _ref of [O]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = a,\n    _ = _obj[_key];\n  {\n    const a = 'A';\n  }\n}\nvar _;\nfor (_ref12 of [O]) {\n  ((_obj13 = _objectDestructuringEmpty(_ref12)), (_key14 = a), (_ = _obj13[_key14]));\n  {\n    const a = 'A';\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref12, _arr13;\nfor (var _ref of test.expectation.registers) {\n  var _arr = _toArray(_ref, 3, false),\n    name = _arr[0],\n    before = _arr[1],\n    after = _arr[2];\n  {\n  }\n}\nfor (_ref12 of test.expectation.registers) {\n  ((_arr13 = _toArray(_ref12, 3, false)),\n    (name = _arr13[0]),\n    (before = _arr13[1]),\n    (after = _arr13[2]));\n  {\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst _obj = _objectDestructuringEmpty({ 1: 'a' }),\n  _key = _toPropertyKey((() => 1)()),\n  a = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(a).toBe('a');\nexpect(rest).toEqual({});",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nclass ExtendedArray extends Array {\n  constructor(...args) {\n    super(...args);\n  }\n}\nlet extArr = new ExtendedArray(1, 2, 3, 4, 5);\nlet _arr = _toArray(extArr, 2, true),\n  first = _arr[0],\n  second = _arr[1],\n  rest = _arr.slice(2);\nexpect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref32, _arr33, _value34, _ref47, _arr48, _obj49, _ref50, _arr51, _arr52;\nlet _arr = _toArray([,], 1, false),\n  _value = _arr[0],\n  x = _value === void 0 ? 23 : _value;\nexpect(x).toEqual(23);\nconst _arr27 = _toArray([, 42], 2, false),\n  _value28 = _arr27[0],\n  y = _value28 === void 0 ? 24 : _value28,\n  z = _arr27[1];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\nfunction* foo() {\n  yield 1;\n  yield 2;\n}\nlet bar = foo();\nconst _arr30 = _toArray([, bar.next().value], 2, false),\n  _value31 = _arr30[0],\n  a = _value31 === void 0 ? bar.next().value : _value31,\n  b = _arr30[1];\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\nconst arr =\n  ((_ref32 = [,]),\n  (_arr33 = _toArray(_ref32, 1, false)),\n  (_value34 = _arr33[0]),\n  (c = _value34 === void 0 ? 42 : _value34),\n  _ref32);\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\nvar iterCount = 0;\nfor (\n  const _arr36 = _toArray([,], 1, false),\n    _value37 = _arr36[0],\n    x = _value37 === void 0 ? 23 : _value37;\n  iterCount < 1;\n) {\n  expect(x).toEqual(23);\n  // another statement\n  iterCount += 1;\n}\nexpect(iterCount).toEqual(1);\nconst _arr39 = _toArray([,], 0, true),\n  d = _arr39;\nconst _arr41 = _toArray([,], 0, true),\n  _obj = _objectDestructuringEmpty(_arr41),\n  e = _obj[0];\nexpect(d).toStrictEqual([undefined]);\nexpect(e).toEqual(undefined);\nconst _arr44 = _toArray([,], 1, false),\n  f = _arr44[0];\nexpect(f).toEqual(undefined);\nlet _arr46 = _toArray([,], 1, false),\n  g = _arr46[0];\nexpect(g).toEqual(undefined);\nlet thrown;\ntry {\n  thrown = false;\n  ((_ref47 = [,]),\n    (_arr48 = _toArray(_ref47, 1, false)),\n    (_obj49 = _objectDestructuringEmpty(_arr48[0])),\n    _ref47);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\ntry {\n  thrown = false;\n  ((_ref50 = [,]),\n    (_arr51 = _toArray(_ref50, 1, false)),\n    (_arr52 = _toArray(_arr51[0], 0, false)),\n    _ref50);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref32, _arr33, _value34, _ref47, _arr48, _obj49, _ref50, _arr51, _arr52;\nlet _arr = _toArray([,], 1, false),\n  _value = _arr[0],\n  x = _value === void 0 ? 23 : _value;\nexpect(x).toEqual(23);\nconst _arr27 = _toArray([, 42], 2, false),\n  _value28 = _arr27[0],\n  y = _value28 === void 0 ? 24 : _value28,\n  z = _arr27[1];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\nfunction* foo() {\n  yield 1;\n  yield 2;\n}\nlet bar = foo();\nconst _arr30 = _toArray([, bar.next().value], 2, false),\n  _value31 = _arr30[0],\n  a = _value31 === void 0 ? bar.next().value : _value31,\n  b = _arr30[1];\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\nconst arr =\n  ((_ref32 = [,]),\n  (_arr33 = _toArray(_ref32, 1, false)),\n  (_value34 = _arr33[0]),\n  (c = _value34 === void 0 ? 42 : _value34),\n  _ref32);\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\nvar iterCount = 0;\nfor (\n  const _arr36 = _toArray([,], 1, false),\n    _value37 = _arr36[0],\n    x = _value37 === void 0 ? 23 : _value37;\n  iterCount < 1;\n) {\n  expect(x).toEqual(23);\n  // another statement\n  iterCount += 1;\n}\nexpect(iterCount).toEqual(1);\nconst _arr39 = _toArray([,], 0, true),\n  d = _arr39;\nconst _arr41 = _toArray([,], 0, true),\n  _obj = _objectDestructuringEmpty(_arr41),\n  e = _obj[0];\nexpect(d).toStrictEqual([,]);\nexpect(e).toEqual(undefined);\nconst _arr44 = _toArray([,], 1, false),\n  f = _arr44[0];\nexpect(f).toEqual(undefined);\nlet _arr46 = _toArray([,], 1, false),\n  g = _arr46[0];\nexpect(g).toEqual(undefined);\nlet thrown;\ntry {\n  thrown = false;\n  ((_ref47 = [,]),\n    (_arr48 = _toArray(_ref47, 1, false)),\n    (_obj49 = _objectDestructuringEmpty(_arr48[0])),\n    _ref47);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\ntry {\n  thrown = false;\n  ((_ref50 = [,]),\n    (_arr51 = _toArray(_ref50, 1, false)),\n    (_arr52 = _toArray(_arr51[0], 0, false)),\n    _ref50);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nlet list = [1, 2, 3, 4];\nfor (let i = 0, _obj = _objectDestructuringEmpty(list), length = _obj.length; i < length; i++) {\n  list[i];\n}",
  'const assign = function ([...arr], index, value) {\n  arr[index] = value;\n  return arr;\n};\n\nconst arr = [1, 2, 3];\nassign(arr, 1, 42);\n\nexpect(arr).toEqual([1, 2, 3]);',
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\n(function () {\n  var _ref, _arr;\n  let q;\n  let w;\n  let e;\n  if (true)\n    ((_ref = [1, 2, 3].map(() => 123)),\n      (_arr = _toArray(_ref, 3, false)),\n      (q = _arr[0]),\n      (w = _arr[1]),\n      (e = _arr[2]),\n      _ref);\n})();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nif (true) ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);",
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nimport { NestedObjects } from './some-module';\nconst _obj = _objectDestructuringEmpty(NestedObjects),\n  Foo = _obj.Foo,\n  Bar = _obj.Bar;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _obj = _objectDestructuringEmpty(input),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  _key17 = _toPropertyKey(prefix + 'state'),\n  state = _obj[_key17],\n  _key18 = _toPropertyKey(`${prefix}consents`),\n  consents = _obj[_key18],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key, _key17, _key18]);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar z = [];\nvar _arr = _toArray(z, 1, true),\n  x = _arr[0],\n  y = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\n((_ref = [1, 2]),\n  (_arr = _toArray(_ref, 2, false)),\n  (foo.foo = _arr[0]),\n  (foo.bar = _arr[1]),\n  _ref);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar rect = {};\nvar _obj = _objectDestructuringEmpty(rect),\n  _arr = _toArray(_obj.topLeft, 2, false),\n  x1 = _arr[0],\n  y1 = _arr[1],\n  _arr14 = _toArray(_obj.bottomRight, 2, false),\n  x2 = _arr14[0],\n  y2 = _arr14[1];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar coords = [1, 2];\nvar _obj = _objectDestructuringEmpty(coords),\n  x = _obj.x,\n  y = _obj.y,\n  foo = 'bar';",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet gets = 0;\nlet it = {\n  [Symbol.iterator]: () => ({\n    get next() {\n      gets++;\n      let i = 0;\n      return () => ({\n        done: false,\n        value: i++,\n      });\n    },\n  }),\n};\nlet _arr = _toArray(it, 0, false);\nexpect(gets).toBe(1);\nlet _arr17 = _toArray(it, 1, false),\n  a = _arr17[0];\nexpect(gets).toBe(2);\nexpect(a).toBe(0);\nlet _arr19 = _toArray(it, 2, false),\n  b = _arr19[0],\n  c = _arr19[1];\nexpect(gets).toBe(3);\nexpect(b).toBe(0);\nexpect(c).toBe(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar foo, bar;\nexpect(() => {\n  var _ref, _arr;\n  return (\n    (_ref = undefined), (_arr = _toArray(_ref, 2, false)), (foo = _arr[0]), (bar = _arr[1]), _ref\n  );\n}).toThrow(/destructure non-iterable/);\nexpect(() => {\n  var _ref13, _arr14;\n  return (\n    (_ref13 = {}),\n    (_arr14 = _toArray(_ref13, 2, false)),\n    (foo = _arr14[0]),\n    (bar = _arr14[1]),\n    _ref13\n  );\n}).toThrow(/destructure non-iterable/);\nglobal.Symbol = void 0;\nexpect(() => {\n  var _ref15, _arr16;\n  return (\n    (_ref15 = {}),\n    (_arr16 = _toArray(_ref15, 2, false)),\n    (foo = _arr16[0]),\n    (bar = _arr16[1]),\n    _ref15\n  );\n}).toThrow(/destructure non-iterable/);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst foo = {\n  1: 'a',\n  2: 'b',\n  3: 'c',\n};\nconst _obj = _objectDestructuringEmpty(foo),\n  _key = _toPropertyKey(1),\n  bar = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(bar).toBe('a');\nexpect(rest).toEqual({\n  2: 'b',\n  3: 'c',\n});",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar rect = {};\nvar _obj = _objectDestructuringEmpty(rect),\n  _obj15 = _objectDestructuringEmpty(_obj.topLeft),\n  x1 = _obj15.x,\n  y1 = _obj15.y,\n  _obj16 = _objectDestructuringEmpty(_obj.bottomRight),\n  x2 = _obj16.x,\n  y2 = _obj16.y;\nvar _obj18 = _objectDestructuringEmpty([0, 1, 2, 3, 4, 5, 6]),\n  foo = _obj18[3],\n  bar = _obj18[5];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar coords = [1, 2];\nvar _obj = _objectDestructuringEmpty(coords),\n  x = _obj.x,\n  y = _obj.y;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref22, _obj23, _key24;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _obj = _objectDestructuringEmpty({\n    1: 1,\n    a: 1,\n  }),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n// takes care of the order\nkey = 1;\nvar _obj19 = _objectDestructuringEmpty({\n    2: 2,\n    3: 3,\n  }),\n  _key20 = _toPropertyKey(++key),\n  y = _obj19[_key20],\n  _key21 = _toPropertyKey(++key),\n  z = _obj19[_key21],\n  rest = _objectWithoutProperties(_obj19, [_key20, _key21]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref22 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj23 = _objectDestructuringEmpty(_ref22)),\n  (_key24 = _toPropertyKey(key)),\n  (y = _obj23[_key24]),\n  (z = _obj23.z),\n  (x = _objectWithoutProperties(_obj23, [_key24, 'z'])),\n  _ref22);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push('left');\n  return 0;\n}\nfunction right() {\n  order.push('right');\n  return {};\n}\nvar _obj26 = _objectDestructuringEmpty(right()),\n  _key27 = _toPropertyKey(left()),\n  y = _obj26[_key27],\n  x = _objectWithoutProperties(_obj26, [_key27]);\nexpect(order).toEqual(['right', 'left']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _obj = _objectDestructuringEmpty(z),\n  _key = _toPropertyKey(fn()),\n  x = _obj[_key],\n  y = _objectWithoutProperties(_obj, [_key]);",
  "function somethingAdvanced(\n  { topLeft: { x: x1, y: y1 } = {}, bottomRight: { x: x2, y: y2 } = {} },\n  p2,\n  p3,\n) {}\n\nfunction unpackObject({ title: title, author: author }) {\n  return title + ' ' + author;\n}\n\nconsole.log(unpackObject({ title: 'title', author: 'author' }));\n\nvar unpackArray = function ([a, b, c], [x, y, z]) {\n  return a + b + c;\n};\n\nconsole.log(unpackArray(['hello', ', ', 'world'], [1, 2, 3]));",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nfunction* f() {\n  for (var i = 0; i < 3; i++) {\n    yield i;\n  }\n}\nvar _arr = _toArray(f(), 0, true),\n  xs = _arr;\nexpect(xs).toEqual([0, 1, 2]);",
  'function isSorted([x, y, ...wow]) {\n  if (!zs.length) return true;\n  if (y > x) return isSorted(zs);\n  return false;\n}',
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexport default class A {\n  handle = value => {\n    var _ref, _obj;\n    ((_ref = {}), (_obj = _objectDestructuringEmpty(_ref)), (value = _obj.value), _ref);\n  };\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nfunction isBetween(x, a, b) {\n  var _ref, _arr;\n  if (a > b)\n    ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n  return x > a && x < b;\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);\n}\nconst fn = arg => {\n  var _arr = _toArray(arg, 2, false),\n    x = _arr[0],\n    y = _arr[1];\n};",
] as const;

export const fixtureCases = [
  {
    title: 'allowArrayLike — holes (exec)',
    source:
      'var o = { 0: "a", 2: "c", length: 3 };\n\nvar [...rest] = o;\n\nexpect(rest).toEqual(["a", undefined, "c"]);\nexpect(1 in rest).toBe(true); // Not holey\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'allowArrayLike — length cropped (exec)',
    source:
      'var o = { 0: "a", 1: "b", 2: "c", length: 2 };\n\nvar [first, ...rest] = o;\n\nexpect(first).toBe("a");\nexpect(rest).toEqual(["b"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (exec)',
    source:
      'var o = { 0: "a", 1: "b", 2: "c", length: 3 };\n\nvar [first, ...rest] = o;\n\nexpect(first).toBe("a");\nexpect(rest).toEqual(["b", "c"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (input)',
    source: 'var [first, ...rest] = o;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — basic (input)',
    source: 'let [foo, bar] = baz;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for in (input)',
    source:
      'for (var [name, value] in obj) {\n  print("Name: " + name + ", Value: " + value);\n}\n\nfor ([name, value] in obj) {\n  print("Name: " + name + ", Value: " + value);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest assignment expression (input)',
    source: '({ a, b, ...c } = obj);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest computed (input)',
    source: 'let { [a]: b, ...c } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest ignore symbols (exec)',
    source:
      'let sym = Symbol();\n\nlet { a, ...r } = { a: 1, b: 2, [sym]: 3 };\n\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest nested (input)',
    source: 'let { a, nested: { b, c, ...d }, e } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest var declaration (input)',
    source: 'var { a, b, ...c } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'destructuring — array symbol unsupported (exec)',
    source:
      'var a = (() => [1, 2, 3])();\n\n// Simulate old environment\nglobal.Symbol = void 0;\n\nvar [first, ...rest] = a;\n\nexpect(first).toBe(1);\nexpect(rest).toEqual([2, 3]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'destructuring — array symbol unsupported (input)',
    source:
      "var a = (() => [1, 2, 3])();\n\n// !!! In order to run this test, this shouldn't be optimized using type inference\n// If it's optimized and doesn't call toArray, please modify this test\n// and exec.js\nvar [first, ...rest] = a;\n",
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'destructuring — array unpack optimisation (input)',
    source:
      'var [a, b] = [1, 2];\nvar [[a, b]] = [[1, 2]];\nvar [a, b, ...c] = [1, 2, 3, 4];\nvar [[a, b, ...c]] = [[1, 2, 3, 4]];\n\nvar [a, b] = [1, 2, 3];\nvar [[a, b]] = [[1, 2, 3]];\nvar [a, b] = [a, b];\n[a[0], a[1]] = [a[1], a[0]];\nvar [a, b] = [...foo, bar];\nvar [a, b] = [foo(), bar];\nvar [a, b] = [clazz.foo(), bar];\nvar [a, b] = [clazz.foo, bar];\nvar [a, b] = [, 2];\n[a, b] = [1, 2];\n[a, b] = [, 2];\n; // Avoid completion record special case\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'destructuring — array (input)',
    source:
      'var [a, [b], [c]] = ["hello", [", ", "junk"], ["world"]];\n[a, [b], [c]] = ["hello", [", ", "junk"], ["world"]];\n;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'destructuring — assignment arrow function block (input)',
    source: '() => { [a, b] = [1, 2] }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'destructuring — assignment arrow function no block (input)',
    source: '() => [a, b] = [1, 2]\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'destructuring — assignment expression completion record (input)',
    source: 'var x, y;\n[x, y] = [1, 2];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'destructuring — assignment expression pattern (input)',
    source: 'var z = {};\nvar { x: { y } = {} } = z;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'destructuring — assignment expression (input)',
    source: 'console.log([x] = [123]);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'destructuring — assignment sequence expression completion record (input)',
    source: 'var x, y;\n([x, y] = [1, 2], y);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'destructuring — assignment statement (input)',
    source: '[a, b] = f();\n;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'destructuring — chained (exec)',
    source:
      'var a, b, c, d;\n({ a, b } = ({ c, d } = { a: 1, b: 2, c: 3, d: 4}));\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toBe(3);\nexpect(d).toBe(4);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'destructuring — check iterator return (exec)',
    source:
      'expect(() => {\n  var [] = {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {},\n      };\n    },\n  };\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [] = {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => ({}),\n      };\n    },\n  };\n}).not.toThrow();\n\nexpect(() => {\n  var [x] = {\n    [Symbol.iterator]: () => {\n      return {\n        next: () => ({ done: false, value: 1 }),\n        return: () => {},\n      };\n    },\n  };\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [x] = {\n    [Symbol.iterator]: () => {\n      return {\n        next: () => ({ done: false, value: 1 }),\n        return: () => ({}),\n      };\n    },\n  };\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'destructuring — check iterator return (input)',
    source:
      'var [] = {\n  [Symbol.iterator]: () => {\n    return {\n      return: () => {},\n    };\n  },\n};\n\nvar [] = {\n  [Symbol.iterator]: () => {\n    return {\n      return: () => ({}),\n    };\n  },\n};\n\nvar [x] = {\n  [Symbol.iterator]: () => {\n    return {\n      next: () => ({ done: false, value: 1 }),\n      return: () => {},\n    };\n  },\n};\n\nvar [x] = {\n  [Symbol.iterator]: () => {\n    return {\n      next: () => ({ done: false, value: 1 }),\n      return: () => ({}),\n    };\n  },\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'destructuring — check no hoisting when using template strings (input)',
    source:
      "const example = (obj) => {\n  const foo = 'foo';\n  const { [`prefix_${foo}`]: _, ...rest } = obj;\n};\n",
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'destructuring — const (exec)',
    source:
      'const getState = () => ({});\n\nconst { data: { courses: oldCourses = [] } = {} } = getState();\n\nexpect(oldCourses).toEqual([]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'destructuring — const (input)',
    source: 'const { data: { courses: oldCourses = [] } = {} } = getState();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'destructuring — default precedence (exec)',
    source:
      'var f0 = function (a, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f0(1)).toEqual([1, 1, 1]);\n\nvar f1 = function ({a}, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f1({a: 1})).toEqual([1, 1, 1]);\n\nvar f2 = function ({a}, b = a, c = a) {\n  return [a, b, c];\n};\n\nexpect(f2({a: 1})).toEqual([1, 1, 1]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'destructuring — default precedence (input)',
    source:
      'var f0 = function (a, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f0(1)).toEqual([1, 1, 1]);\n\nvar f1 = function ({a}, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f1({a: 1})).toEqual([1, 1, 1]);\n\nvar f2 = function ({a}, b = a, c = a) {\n  return [a, b, c];\n};\n\nexpect(f2({a: 1})).toEqual([1, 1, 1]);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'destructuring — destructuring empty in for (input)',
    source:
      'for ( let x in y ) for ( ; ; ) var { } = x ;\n\nfor ( let x in y ) for ( var { } = x ; ; ) ;\n\nfor ( let x in y ) for ( ; { } = x ; {} = x ) var { } = x ;\n\nfor ( let { } = 0 ; 0 ; ) ;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'destructuring — empty array pattern (exec)',
    source:
      'expect(() => {\n  var [] = null;\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [] = 42;\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [] = {};\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [] = { [Symbol.iterator]: () => {} };\n}).toThrow(TypeError);\n\nexpect(() => {\n  var [] = [];\n  var [] = [0, 1, 2];\n  var [] = "foo";\n  var [] = (function*() { throw new Error("Should not throw"); })();\n  var [] = { [Symbol.iterator]: () => ({}) };\n  var [] = { [Symbol.iterator]: () => () => {} };\n  var [] = { [Symbol.iterator]: async function*() {} };\n}).not.toThrow();\n\n// iterator.return should be called\nvar returnCalled = false;\nvar [] = {\n  [Symbol.iterator]: () => {\n    return {\n      return: () => {\n        returnCalled = true;\n        return {};\n      },\n    };\n  },\n};\nexpect(returnCalled).toStrictEqual(true);\n\n// #15154\nexpect(() => {\n  var [] = { [Symbol.iterator]: () => [] };\n}).not.toThrow();\n\n// #15168\nexpect(() => {\n  var [] = { [Symbol.iterator]: () => async function* () {} };\n}).not.toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'destructuring — empty array pattern (input)',
    source:
      'var [] = null;\nvar [] = 42;\nvar [] = {};\nvar [] = { [Symbol.iterator]: () => {} };\n\nvar [] = [];\nvar [] = [0, 1, 2];\nvar [] = "foo";\nvar [] = (function*() { throw new Error("Should not throw"); })();\nvar [] = { [Symbol.iterator]: () => ({}) };\nvar [] = { [Symbol.iterator]: () => () => {} };\nvar [] = { [Symbol.iterator]: async function*() {} };\n\n// iterator.return should be called\nvar returnCalled = false;\nvar [] = {\n  [Symbol.iterator]: () => {\n    return {\n      return: () => {\n        returnCalled = true;\n        return {};\n      },\n    };\n  },\n};\n\n// #15154\nvar [] = { [Symbol.iterator]: () => [] };\n\n// #15168\nvar [] = { [Symbol.iterator]: () => async function* () {} };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'destructuring — empty object pattern (exec)',
    source: 'expect(function () {\n  var {} = null;\n}).toThrow("Cannot destructure null");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'destructuring — empty object pattern (input)',
    source: 'var {} = null;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'destructuring — empty string (exec)',
    source: "let [a] = '';\n\nexpect(a).toBe(undefined)\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'destructuring — empty string (input)',
    source: "let [a] = '';\n",
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'destructuring — empty (input)',
    source: 'var [, a, [b], [c], d] = ["foo", "hello", [", ", "junk"], ["world"]];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'destructuring — es7 object rest builtins (input)',
    source:
      'var z = {};\nvar { ...x } = z;\nvar { x, ...y } = z;\nvar { [x]: x, ...y } = z;\n(function({ x, ...y }) { });\n\n({ x, y, ...z } = o);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'destructuring — export variable (input)',
    source: '\nexport let {a, b, c: {d, e: {f = 4}}} = {};\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'destructuring — for let nest (input)',
    source: 'for (let [[x] = [1]] = [];  ;  ) {\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'destructuring — for let (input)',
    source: 'for (let [ i, n ] = range; ; ) {\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'destructuring — for of shadowed block scoped (exec)',
    source:
      'var O = {\n  a: "a"\n}\nconst a = "a";\nfor (const { [a]: _ } of [O]) { const a = "A"; }\n\nvar _;\nfor ({ [a]: _ } of [O]) { const a = "A"; }\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'destructuring — for of shadowed block scoped (input)',
    source:
      'var O = {\n  a: "a"\n}\nconst a = "a";\nfor (const { [a]: _ } of [O]) { const a = "A"; }\n\nvar _;\nfor ({ [a]: _ } of [O]) { const a = "A"; }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'destructuring — for of (input)',
    source:
      'for (var [ name, before, after ] of test.expectation.registers) {\n\n}\n\nfor ([ name, before, after ] of test.expectation.registers) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'destructuring — function key with object rest spread (exec)',
    source:
      'const { [(() => 1)()]: a, ...rest } = { 1: "a" };\n\nexpect(a).toBe("a");\nexpect(rest).toEqual({});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'destructuring — inherited array (exec)',
    source:
      'class ExtendedArray extends Array {\n  constructor(...args) {\n    super(...args);\n  }\n}\n\nlet extArr = new ExtendedArray(1,2,3,4,5);\nlet [first, second , ...rest] = extArr;\n\nexpect(Object.getPrototypeOf(rest).constructor.name).toBe("Array");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'destructuring — init hole (exec)',
    source:
      'let [x = 23] = [,];\nexpect(x).toEqual(23);\n\nconst [y = 24, z] = [, 42];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\n\nfunction* foo() {\n    yield 1;\n    yield 2;\n}\n\nlet bar = foo();\n\nconst [a = bar.next().value, b] = [, bar.next().value];\n\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\n\nconst arr = [c = 42] = [,];\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\n\nvar iterCount = 0;\n\nfor (const [x = 23] = [,]; iterCount < 1; ) {\n    expect(x).toEqual(23);\n    // another statement\n\n    iterCount += 1;\n}\n\nexpect(iterCount).toEqual(1);\n\nconst [...d] = [,];\nconst [...{ 0: e }] = [,];\n\nexpect(d).toStrictEqual([undefined,]);\nexpect(e).toEqual(undefined);\n\nconst [f] = [,];\nexpect(f).toEqual(undefined);\n\nlet [g] = [,];\nexpect(g).toEqual(undefined);\n\nlet thrown;\ntry {\n  thrown = false;\n  [{}] = [,];\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\n\ntry {\n  thrown = false;\n  [[]] = [,];\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'destructuring — init hole (input)',
    source:
      'let [x = 23] = [,];\nexpect(x).toEqual(23);\n\nconst [y = 24, z] = [, 42];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\n\nfunction* foo() {\n    yield 1;\n    yield 2;\n}\n\nlet bar = foo();\n\nconst [a = bar.next().value, b] = [, bar.next().value];\n\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\n\nconst arr = [c = 42] = [,];\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\n\nvar iterCount = 0;\n\nfor (const [x = 23] = [,]; iterCount < 1; ) {\n    expect(x).toEqual(23);\n    // another statement\n\n    iterCount += 1;\n}\n\nexpect(iterCount).toEqual(1);\n\nconst [...d] = [,];\nconst [...{ 0: e }] = [,];\n\nexpect(d).toStrictEqual([,]);\nexpect(e).toEqual(undefined);\n\nconst [f] = [,];\nexpect(f).toEqual(undefined);\n\nlet [g] = [,];\nexpect(g).toEqual(undefined);\n\nlet thrown;\ntry {\n  thrown = false;\n  [{}] = [,];\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\n\ntry {\n  thrown = false;\n  [[]] = [,];\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'destructuring — issue 3081 (input)',
    source:
      'let list = [1, 2, 3, 4];\nfor (let i = 0, { length } = list; i < length; i++) {\n  list[i];\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'destructuring — issue 5090 (exec)',
    source:
      'const assign = function([...arr], index, value) {\n  arr[index] = value;\n  return arr;\n}\n\nconst arr = [1, 2, 3];\nassign(arr, 1, 42);\n\nexpect(arr).toEqual([1, 2, 3]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'destructuring — issue 5628 (input)',
    source:
      '(function () {\n  let q;\n  let w;\n  let e;\n  if (true) [q, w, e] = [1, 2, 3].map(()=>123);\n})();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[49],
      },
    ],
  },
  {
    title: 'destructuring — issue 5744 (input)',
    source: 'if (true) [a, b] = [b, a];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'destructuring — issue 6373 (input)',
    source: 'import { NestedObjects } from "./some-module"\n\nconst { Foo, Bar } = NestedObjects\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[51],
      },
    ],
  },
  {
    title: 'destructuring — issue 9834 (input)',
    source:
      "const input = {};\n\nconst {\n  given_name: givenName,\n  'last_name': lastName,\n  [`country`]: country,\n  [prefix + 'state']: state,\n  [`${prefix}consents`]: consents,\n  ...rest\n} = input;\n",
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'destructuring — known array (input)',
    source: 'var z = [];\nvar [x, ...y] = z;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[53],
      },
    ],
  },
  {
    title: 'destructuring — member expression (input)',
    source: '[foo.foo, foo.bar] = [1, 2];\n;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'destructuring — mixed (input)',
    source: 'var rect = {};\nvar {topLeft: [x1, y1], bottomRight: [x2, y2] } = rect;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[55],
      },
    ],
  },
  {
    title: 'destructuring — multiple (input)',
    source: 'var coords = [1, 2];\nvar { x, y } = coords,\n    foo = "bar";\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'destructuring — next eval once (exec)',
    source:
      'let gets = 0;\nlet it = {\n  [Symbol.iterator]: () => ({\n    get next() {\n      gets++;\n      let i = 0;\n      return () => ({ done: false, value: i++ });\n    },\n  }),\n};\n\nlet [] = it;\nexpect(gets).toBe(1);\n\nlet [a] = it;\nexpect(gets).toBe(2);\nexpect(a).toBe(0);\n\nlet [b, c] = it;\nexpect(gets).toBe(3);\nexpect(b).toBe(0);\nexpect(c).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[57],
      },
    ],
  },
  {
    title: 'destructuring — non iterable (exec)',
    source:
      'var foo, bar;\n\nexpect(\n  () => [foo, bar] = undefined\n).toThrow(/destructure non-iterable/);\n\nexpect(\n  () => [foo, bar] = {}\n).toThrow(/destructure non-iterable/);\n\nglobal.Symbol = void 0;\n\nexpect(\n  () => [foo, bar] = {}\n).toThrow(/destructure non-iterable/);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'destructuring — number key with object rest spread (exec)',
    source:
      'const foo = {\n  1: "a",\n  2: "b",\n  3: "c",\n};\n\nconst { [1]: bar, ...rest } = foo;\n\nexpect(bar).toBe("a");\nexpect(rest).toEqual({ 2: "b", 3: "c" });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[59],
      },
    ],
  },
  {
    title: 'destructuring — object advanced (input)',
    source:
      'var rect = {};\nvar {topLeft: {x: x1, y: y1}, bottomRight: {x: x2, y: y2}} = rect;\nvar { 3: foo, 5: bar } = [0, 1, 2, 3, 4, 5, 6];\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'destructuring — object basic (input)',
    source: 'var coords = [1, 2];\nvar { x, y } = coords;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[61],
      },
    ],
  },
  {
    title: 'destructuring — object rest impure computed keys (exec)',
    source:
      'var key, x, y, z;\n// impure\nkey = 1;\nvar { [key++]: y, ...x } = { 1: 1, a: 1 };\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n\n// takes care of the order\n\nkey = 1;\nvar { [++key]: y, [++key]: z, ...rest} = {2: 2, 3: 3};\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n\n// pure, computed property should remain as-is\nkey = 2;\n({ [key]: y, z, ...x } = {2: "two", z: "zee"});\nexpect(y).toBe("two");\nexpect(x).toEqual({});\nexpect(z).toBe("zee");\n\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push("left");\n  return 0;\n}\nfunction right() {\n  order.push("right");\n  return {};\n}\nvar { [left()]: y, ...x} = right();\nexpect(order).toEqual(["right", "left"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'destructuring — object rest impure computed keys (input)',
    source: 'var { [fn()]: x, ...y } = z;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[63],
      },
    ],
  },
  {
    title: 'destructuring — parameters (input)',
    source:
      'function somethingAdvanced({topLeft: {x: x1, y: y1} = {}, bottomRight: {x: x2, y: y2} = {}}, p2, p3){\n\n}\n\nfunction unpackObject({title: title, author: author}) {\n  return title + " " + author;\n}\n\nconsole.log(unpackObject({title: "title", author: "author"}));\n\nvar unpackArray = function ([a, b, c], [x, y, z]) {\n  return a+b+c;\n};\n\nconsole.log(unpackArray(["hello", ", ", "world"], [1, 2, 3]));\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'destructuring — spread generator (exec)',
    source:
      'function* f() {\n  for (var i = 0; i < 3; i++) {\n    yield i;\n  }\n}\nvar [...xs] = f();\nexpect(xs).toEqual([0, 1, 2]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[65],
      },
    ],
  },
  {
    title: 'destructuring — spread (input)',
    source:
      'function isSorted([x, y, ...wow]) {\n  if (!zs.length) return true\n  if (y > x) return isSorted(zs)\n  return false\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'regression — 11210 (input)',
    source: 'export default class A {\n  handle = value => {\n    ({ value } = {});\n  }\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[67],
      },
    ],
  },
  {
    title: 'regression — 8528 (input)',
    source:
      'function isBetween(x, a, b) {\n  if (a > b) [a, b] = [b, a];\n  return x > a && x < b;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'sourcemap — declaration loc (input)',
    source: 'const fn = (arg) => {\n  var [x, y] = arg;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'runtime',
        options: {
          transforms: {
            destructuring: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[69],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
