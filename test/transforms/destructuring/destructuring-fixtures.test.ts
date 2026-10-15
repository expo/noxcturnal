import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  2: 'c',\n  length: 3,\n};\nvar _ref = o,\n  _arr = _toArray(_ref, 0, true),\n  rest = _arr.slice(0);\nexpect(rest).toEqual(['a', undefined, 'c']);\nexpect(1 in rest).toBe(true);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  1: 'b',\n  2: 'c',\n  length: 2,\n};\nvar _ref = o,\n  _arr = _toArray(_ref, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe('a');\nexpect(rest).toEqual(['b']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar o = {\n  0: 'a',\n  1: 'b',\n  2: 'c',\n  length: 3,\n};\nvar _ref = o,\n  _arr = _toArray(_ref, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe('a');\nexpect(rest).toEqual(['b', 'c']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref = o,\n  _arr = _toArray(_ref, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _ref = baz,\n  _arr = _toArray(_ref, 2, false),\n  foo = _arr[0],\n  bar = _arr[1];",
  "for (var [name, value] in obj) {\n  print('Name: ' + name + ', Value: ' + value);\n}\n\nfor ([name, value] in obj) {\n  print('Name: ' + name + ', Value: ' + value);\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\n((_ref = obj),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  (c = _objectWithoutProperties(_obj, ['a', 'b'])),\n  _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(a),\n  b = _obj[_key],\n  c = _objectWithoutProperties(_obj, [_key]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet sym = Symbol();\nlet _ref = {\n    a: 1,\n    b: 2,\n    [sym]: 3,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  r = _objectWithoutProperties(_obj, ['a']);\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  _obj13 = _objectDestructuringEmpty(_obj.nested),\n  b = _obj13.b,\n  c = _obj13.c,\n  d = _objectWithoutProperties(_obj13, ['b', 'c']),\n  e = _obj.e;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar a = (() => [1, 2, 3])();\n// Simulate old environment\nglobal.Symbol = void 0;\nvar _ref = a,\n  _arr = _toArray(_ref, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);\nexpect(first).toBe(1);\nexpect(rest).toEqual([2, 3]);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar a = (() => [1, 2, 3])();\n// !!! In order to run this test, this shouldn't be optimized using type inference\n// If it's optimized and doesn't call toArray, please modify this test\n// and exec.js\nvar _ref = a,\n  _arr = _toArray(_ref, 1, true),\n  first = _arr[0],\n  rest = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref26, _arr27, _ref38, _arr39, _ref40, _arr41;\nvar _ref = [1, 2],\n  _arr = _toArray(_ref, 2, false),\n  a = _arr[0],\n  b = _arr[1];\nvar _ref11 = [[1, 2]],\n  _arr12 = _toArray(_ref11, 1, false),\n  _arr13 = _toArray(_arr12[0], 2, false),\n  a = _arr13[0],\n  b = _arr13[1];\nvar _ref14 = [1, 2, 3, 4],\n  _arr15 = _toArray(_ref14, 2, true),\n  a = _arr15[0],\n  b = _arr15[1],\n  c = _arr15.slice(2);\nvar _ref16 = [[1, 2, 3, 4]],\n  _arr17 = _toArray(_ref16, 1, false),\n  _arr18 = _toArray(_arr17[0], 2, true),\n  a = _arr18[0],\n  b = _arr18[1],\n  c = _arr18.slice(2);\nvar _ref19 = [1, 2, 3],\n  _arr20 = _toArray(_ref19, 2, false),\n  a = _arr20[0],\n  b = _arr20[1];\nvar _ref21 = [[1, 2, 3]],\n  _arr22 = _toArray(_ref21, 1, false),\n  _arr23 = _toArray(_arr22[0], 2, false),\n  a = _arr23[0],\n  b = _arr23[1];\nvar _ref24 = [a, b],\n  _arr25 = _toArray(_ref24, 2, false),\n  a = _arr25[0],\n  b = _arr25[1];\n((_ref26 = [a[1], a[0]]),\n  (_arr27 = _toArray(_ref26, 2, false)),\n  (a[0] = _arr27[0]),\n  (a[1] = _arr27[1]),\n  _ref26);\nvar _ref28 = [...foo, bar],\n  _arr29 = _toArray(_ref28, 2, false),\n  a = _arr29[0],\n  b = _arr29[1];\nvar _ref30 = [foo(), bar],\n  _arr31 = _toArray(_ref30, 2, false),\n  a = _arr31[0],\n  b = _arr31[1];\nvar _ref32 = [clazz.foo(), bar],\n  _arr33 = _toArray(_ref32, 2, false),\n  a = _arr33[0],\n  b = _arr33[1];\nvar _ref34 = [clazz.foo, bar],\n  _arr35 = _toArray(_ref34, 2, false),\n  a = _arr35[0],\n  b = _arr35[1];\nvar _ref36 = [, 2],\n  _arr37 = _toArray(_ref36, 2, false),\n  a = _arr37[0],\n  b = _arr37[1];\n((_ref38 = [1, 2]),\n  (_arr39 = _toArray(_ref38, 2, false)),\n  (a = _arr39[0]),\n  (b = _arr39[1]),\n  _ref38);\n((_ref40 = [, 2]), (_arr41 = _toArray(_ref40, 2, false)), (a = _arr41[0]), (b = _arr41[1]), _ref40);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref13, _arr14, _arr15, _arr16;\nvar _ref = ['hello', [', ', 'junk'], ['world']],\n  _arr = _toArray(_ref, 3, false),\n  a = _arr[0],\n  _arr11 = _toArray(_arr[1], 1, false),\n  b = _arr11[0],\n  _arr12 = _toArray(_arr[2], 1, false),\n  c = _arr12[0];\n((_ref13 = ['hello', [', ', 'junk'], ['world']]),\n  (_arr14 = _toArray(_ref13, 3, false)),\n  (a = _arr14[0]),\n  (_arr15 = _toArray(_arr14[1], 1, false)),\n  (b = _arr15[0]),\n  (_arr16 = _toArray(_arr14[2], 1, false)),\n  (c = _arr16[0]),\n  _ref13);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n};",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\n() => {\n  var _ref, _arr;\n  return ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n};",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nvar x, y;\n((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar z = {};\nvar _ref = z,\n  _obj = _objectDestructuringEmpty(_ref),\n  _value = _obj.x,\n  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  y = _obj11.y;",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nconsole.log(((_ref = [123]), (_arr = _toArray(_ref, 1, false)), (x = _arr[0]), _ref));",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nvar x, y;\n((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref, y);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\n((_ref = f()), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref, _obj, _ref12, _obj13;\nvar a, b, c, d;\n((_ref =\n  ((_ref12 = {\n    a: 1,\n    b: 2,\n    c: 3,\n    d: 4,\n  }),\n  (_obj13 = _objectDestructuringEmpty(_ref12)),\n  (c = _obj13.c),\n  (d = _obj13.d),\n  _ref12)),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  _ref);\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toBe(3);\nexpect(d).toBe(4);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nexpect(() => {\n  var _ref = {\n      [Symbol.iterator]: () => {\n        return { return: () => {} };\n      },\n    },\n    _arr = _toArray(_ref, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref9 = {\n      [Symbol.iterator]: () => {\n        return { return: () => ({}) };\n      },\n    },\n    _arr10 = _toArray(_ref9, 0, false);\n}).not.toThrow();\nexpect(() => {\n  var _ref11 = {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({\n            done: false,\n            value: 1,\n          }),\n          return: () => {},\n        };\n      },\n    },\n    _arr12 = _toArray(_ref11, 1, false),\n    x = _arr12[0];\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref13 = {\n      [Symbol.iterator]: () => {\n        return {\n          next: () => ({\n            done: false,\n            value: 1,\n          }),\n          return: () => ({}),\n        };\n      },\n    },\n    _arr14 = _toArray(_ref13, 1, false),\n    x = _arr14[0];\n}).not.toThrow();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref = {\n    [Symbol.iterator]: () => {\n      return { return: () => {} };\n    },\n  },\n  _arr = _toArray(_ref, 0, false);\nvar _ref9 = {\n    [Symbol.iterator]: () => {\n      return { return: () => ({}) };\n    },\n  },\n  _arr10 = _toArray(_ref9, 0, false);\nvar _ref11 = {\n    [Symbol.iterator]: () => {\n      return {\n        next: () => ({\n          done: false,\n          value: 1,\n        }),\n        return: () => {},\n      };\n    },\n  },\n  _arr12 = _toArray(_ref11, 1, false),\n  x = _arr12[0];\nvar _ref13 = {\n    [Symbol.iterator]: () => {\n      return {\n        next: () => ({\n          done: false,\n          value: 1,\n        }),\n        return: () => ({}),\n      };\n    },\n  },\n  _arr14 = _toArray(_ref13, 1, false),\n  x = _arr14[0];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst example = obj => {\n  const foo = 'foo';\n  const _ref = obj,\n    _obj = _objectDestructuringEmpty(_ref),\n    _key = _toPropertyKey(`prefix_${foo}`),\n    _ = _obj[_key],\n    rest = _objectWithoutProperties(_obj, [_key]);\n};",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nconst getState = () => ({});\nconst _ref = getState(),\n  _obj = _objectDestructuringEmpty(_ref),\n  _value = _obj.data,\n  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  _value12 = _obj11.courses,\n  oldCourses = _value12 === void 0 ? [] : _value12;\nexpect(oldCourses).toEqual([]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nconst _ref = getState(),\n  _obj = _objectDestructuringEmpty(_ref),\n  _value = _obj.data,\n  _obj10 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  _value11 = _obj10.courses,\n  oldCourses = _value11 === void 0 ? [] : _value11;",
  'var f0 = function (a, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f0(1)).toEqual([1, 1, 1]);\n\nvar f1 = function ({ a }, b = a, c = b) {\n  return [a, b, c];\n};\n\nexpect(f1({ a: 1 })).toEqual([1, 1, 1]);\n\nvar f2 = function ({ a }, b = a, c = a) {\n  return [a, b, c];\n};\n\nexpect(f2({ a: 1 })).toEqual([1, 1, 1]);',
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref11, _obj12, _ref13, _obj14;\nfor (let x in y) for (;;) var _ref = x, _obj = _objectDestructuringEmpty(_ref)\nfor (let x in y) for (var _ref9 = x, _obj10 = _objectDestructuringEmpty(_ref9); ;);\nfor (let x in y)\n  for (\n    ;\n    (_ref11 = x), (_obj12 = _objectDestructuringEmpty(_ref11)), _ref11;\n    _ref13 = x, _obj14 = _objectDestructuringEmpty(_ref13), _ref13\n  )\n    var _ref15 = x, _obj16 = _objectDestructuringEmpty(_ref15)\nfor (let _ref17 = 0, _obj18 = _objectDestructuringEmpty(_ref17); 0;);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nexpect(() => {\n  var _ref = null,\n    _arr = _toArray(_ref, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref9 = 42,\n    _arr10 = _toArray(_ref9, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref11 = {},\n    _arr12 = _toArray(_ref11, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref13 = { [Symbol.iterator]: () => {} },\n    _arr14 = _toArray(_ref13, 0, false);\n}).toThrow(TypeError);\nexpect(() => {\n  var _ref15 = [],\n    _arr16 = _toArray(_ref15, 0, false);\n  var _ref17 = [0, 1, 2],\n    _arr18 = _toArray(_ref17, 0, false);\n  var _ref19 = 'foo',\n    _arr20 = _toArray(_ref19, 0, false);\n  var _ref21 = (function* () {\n      throw new Error('Should not throw');\n    })(),\n    _arr22 = _toArray(_ref21, 0, false);\n  var _ref23 = { [Symbol.iterator]: () => ({}) },\n    _arr24 = _toArray(_ref23, 0, false);\n  var _ref25 = { [Symbol.iterator]: () => () => {} },\n    _arr26 = _toArray(_ref25, 0, false);\n  var _ref27 = { [Symbol.iterator]: async function* () {} },\n    _arr28 = _toArray(_ref27, 0, false);\n}).not.toThrow();\n// iterator.return should be called\nvar returnCalled = false;\nvar _ref29 = {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {\n          returnCalled = true;\n          return {};\n        },\n      };\n    },\n  },\n  _arr30 = _toArray(_ref29, 0, false);\nexpect(returnCalled).toStrictEqual(true);\n// #15154\nexpect(() => {\n  var _ref31 = { [Symbol.iterator]: () => [] },\n    _arr32 = _toArray(_ref31, 0, false);\n}).not.toThrow();\n// #15168\nexpect(() => {\n  var _ref33 = { [Symbol.iterator]: () => async function* () {} },\n    _arr34 = _toArray(_ref33, 0, false);\n}).not.toThrow();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref = null,\n  _arr = _toArray(_ref, 0, false);\nvar _ref9 = 42,\n  _arr10 = _toArray(_ref9, 0, false);\nvar _ref11 = {},\n  _arr12 = _toArray(_ref11, 0, false);\nvar _ref13 = { [Symbol.iterator]: () => {} },\n  _arr14 = _toArray(_ref13, 0, false);\nvar _ref15 = [],\n  _arr16 = _toArray(_ref15, 0, false);\nvar _ref17 = [0, 1, 2],\n  _arr18 = _toArray(_ref17, 0, false);\nvar _ref19 = 'foo',\n  _arr20 = _toArray(_ref19, 0, false);\nvar _ref21 = (function* () {\n    throw new Error('Should not throw');\n  })(),\n  _arr22 = _toArray(_ref21, 0, false);\nvar _ref23 = { [Symbol.iterator]: () => ({}) },\n  _arr24 = _toArray(_ref23, 0, false);\nvar _ref25 = { [Symbol.iterator]: () => () => {} },\n  _arr26 = _toArray(_ref25, 0, false);\nvar _ref27 = { [Symbol.iterator]: async function* () {} },\n  _arr28 = _toArray(_ref27, 0, false);\n// iterator.return should be called\nvar returnCalled = false;\nvar _ref29 = {\n    [Symbol.iterator]: () => {\n      return {\n        return: () => {\n          returnCalled = true;\n          return {};\n        },\n      };\n    },\n  },\n  _arr30 = _toArray(_ref29, 0, false);\n// #15154\nvar _ref31 = { [Symbol.iterator]: () => [] },\n  _arr32 = _toArray(_ref31, 0, false);\n// #15168\nvar _ref33 = { [Symbol.iterator]: () => async function* () {} },\n  _arr34 = _toArray(_ref33, 0, false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexpect(function () {\n  var _ref = null,\n    _obj = _objectDestructuringEmpty(_ref);\n}).toThrow('Cannot destructure null');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref = null,\n  _obj = _objectDestructuringEmpty(_ref);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _ref = '',\n  _arr = _toArray(_ref, 1, false),\n  a = _arr[0];\nexpect(a).toBe(undefined);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet _ref = '',\n  _arr = _toArray(_ref, 1, false),\n  a = _arr[0];",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref = ['foo', 'hello', [', ', 'junk'], ['world']],\n  _arr = _toArray(_ref, 5, false),\n  a = _arr[1],\n  _arr12 = _toArray(_arr[2], 1, false),\n  b = _arr12[0],\n  _arr13 = _toArray(_arr[3], 1, false),\n  c = _arr13[0],\n  d = _arr[4];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref16, _obj17;\nvar z = {};\nvar _ref = z,\n  _obj = _objectDestructuringEmpty(_ref),\n  x = _objectWithoutProperties(_obj, []);\nvar _ref11 = z,\n  _obj12 = _objectDestructuringEmpty(_ref11),\n  x = _obj12.x,\n  y = _objectWithoutProperties(_obj12, ['x']);\nvar _ref13 = z,\n  _obj14 = _objectDestructuringEmpty(_ref13),\n  _key = _toPropertyKey(x),\n  x = _obj14[_key],\n  y = _objectWithoutProperties(_obj14, [_key]);\n(function ({ x, ...y }) {});\n((_ref16 = o),\n  (_obj17 = _objectDestructuringEmpty(_ref16)),\n  (x = _obj17.x),\n  (y = _obj17.y),\n  (z = _objectWithoutProperties(_obj17, ['x', 'y'])),\n  _ref16);",
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexport let _ref = {},\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  b = _obj.b,\n  _obj12 = _objectDestructuringEmpty(_obj.c),\n  d = _obj12.d,\n  _obj13 = _objectDestructuringEmpty(_obj12.e),\n  _value = _obj13.f,\n  f = _value === void 0 ? 4 : _value;",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nfor (\n  let _ref = [],\n    _arr = _toArray(_ref, 1, false),\n    _value = _arr[0],\n    _arr10 = _toArray(_value === void 0 ? [1] : _value, 1, false),\n    x = _arr10[0];\n  ;\n) {}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nfor (let _ref = range, _arr = _toArray(_ref, 2, false), i = _arr[0], n = _arr[1]; ;) {}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref12, _obj13, _key14;\nvar O = { a: 'a' };\nconst a = 'a';\nfor (const _ref of [O]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = a,\n    _ = _obj[_key];\n  {\n    const a = 'A';\n  }\n}\nvar _;\nfor (_ref12 of [O]) {\n  ((_obj13 = _objectDestructuringEmpty(_ref12)), (_key14 = a), (_ = _obj13[_key14]));\n  {\n    const a = 'A';\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref11, _arr12;\nfor (var _ref of test.expectation.registers) {\n  var _arr = _toArray(_ref, 3, false),\n    name = _arr[0],\n    before = _arr[1],\n    after = _arr[2];\n  {\n  }\n}\nfor (_ref11 of test.expectation.registers) {\n  ((_arr12 = _toArray(_ref11, 3, false)),\n    (name = _arr12[0]),\n    (before = _arr12[1]),\n    (after = _arr12[2]));\n  {\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst _ref = { 1: 'a' },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey((() => 1)()),\n  a = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(a).toBe('a');\nexpect(rest).toEqual({});",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nclass ExtendedArray extends Array {\n  constructor(...args) {\n    super(...args);\n  }\n}\nlet extArr = new ExtendedArray(1, 2, 3, 4, 5);\nlet _ref = extArr,\n  _arr = _toArray(_ref, 2, true),\n  first = _arr[0],\n  second = _arr[1],\n  rest = _arr.slice(2);\nexpect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref29, _arr30, _value31, _ref44, _arr45, _obj46, _ref47, _arr48, _arr49;\nlet _ref = [,],\n  _arr = _toArray(_ref, 1, false),\n  _value = _arr[0],\n  x = _value === void 0 ? 23 : _value;\nexpect(x).toEqual(23);\nconst _ref23 = [, 42],\n  _arr24 = _toArray(_ref23, 2, false),\n  _value25 = _arr24[0],\n  y = _value25 === void 0 ? 24 : _value25,\n  z = _arr24[1];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\nfunction* foo() {\n  yield 1;\n  yield 2;\n}\nlet bar = foo();\nconst _ref26 = [, bar.next().value],\n  _arr27 = _toArray(_ref26, 2, false),\n  _value28 = _arr27[0],\n  a = _value28 === void 0 ? bar.next().value : _value28,\n  b = _arr27[1];\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\nconst arr =\n  ((_ref29 = [,]),\n  (_arr30 = _toArray(_ref29, 1, false)),\n  (_value31 = _arr30[0]),\n  (c = _value31 === void 0 ? 42 : _value31),\n  _ref29);\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\nvar iterCount = 0;\nfor (\n  const _ref32 = [,],\n    _arr33 = _toArray(_ref32, 1, false),\n    _value34 = _arr33[0],\n    x = _value34 === void 0 ? 23 : _value34;\n  iterCount < 1;\n) {\n  expect(x).toEqual(23);\n  // another statement\n  iterCount += 1;\n}\nexpect(iterCount).toEqual(1);\nconst _ref35 = [,],\n  _arr36 = _toArray(_ref35, 0, true),\n  d = _arr36.slice(0);\nconst _ref37 = [,],\n  _arr38 = _toArray(_ref37, 0, true),\n  _obj = _objectDestructuringEmpty(_arr38.slice(0)),\n  e = _obj[0];\nexpect(d).toStrictEqual([undefined]);\nexpect(e).toEqual(undefined);\nconst _ref40 = [,],\n  _arr41 = _toArray(_ref40, 1, false),\n  f = _arr41[0];\nexpect(f).toEqual(undefined);\nlet _ref42 = [,],\n  _arr43 = _toArray(_ref42, 1, false),\n  g = _arr43[0];\nexpect(g).toEqual(undefined);\nlet thrown;\ntry {\n  thrown = false;\n  ((_ref44 = [,]),\n    (_arr45 = _toArray(_ref44, 1, false)),\n    (_obj46 = _objectDestructuringEmpty(_arr45[0])),\n    _ref44);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\ntry {\n  thrown = false;\n  ((_ref47 = [,]),\n    (_arr48 = _toArray(_ref47, 1, false)),\n    (_arr49 = _toArray(_arr48[0], 0, false)),\n    _ref47);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _ref29, _arr30, _value31, _ref44, _arr45, _obj46, _ref47, _arr48, _arr49;\nlet _ref = [,],\n  _arr = _toArray(_ref, 1, false),\n  _value = _arr[0],\n  x = _value === void 0 ? 23 : _value;\nexpect(x).toEqual(23);\nconst _ref23 = [, 42],\n  _arr24 = _toArray(_ref23, 2, false),\n  _value25 = _arr24[0],\n  y = _value25 === void 0 ? 24 : _value25,\n  z = _arr24[1];\nexpect(y).toEqual(24);\nexpect(z).toEqual(42);\nfunction* foo() {\n  yield 1;\n  yield 2;\n}\nlet bar = foo();\nconst _ref26 = [, bar.next().value],\n  _arr27 = _toArray(_ref26, 2, false),\n  _value28 = _arr27[0],\n  a = _value28 === void 0 ? bar.next().value : _value28,\n  b = _arr27[1];\nexpect(a).toEqual(2);\nexpect(b).toEqual(1);\nconst arr =\n  ((_ref29 = [,]),\n  (_arr30 = _toArray(_ref29, 1, false)),\n  (_value31 = _arr30[0]),\n  (c = _value31 === void 0 ? 42 : _value31),\n  _ref29);\nexpect(c).toEqual(42);\nexpect(arr).toStrictEqual([,]);\nvar iterCount = 0;\nfor (\n  const _ref32 = [,],\n    _arr33 = _toArray(_ref32, 1, false),\n    _value34 = _arr33[0],\n    x = _value34 === void 0 ? 23 : _value34;\n  iterCount < 1;\n) {\n  expect(x).toEqual(23);\n  // another statement\n  iterCount += 1;\n}\nexpect(iterCount).toEqual(1);\nconst _ref35 = [,],\n  _arr36 = _toArray(_ref35, 0, true),\n  d = _arr36.slice(0);\nconst _ref37 = [,],\n  _arr38 = _toArray(_ref37, 0, true),\n  _obj = _objectDestructuringEmpty(_arr38.slice(0)),\n  e = _obj[0];\nexpect(d).toStrictEqual([,]);\nexpect(e).toEqual(undefined);\nconst _ref40 = [,],\n  _arr41 = _toArray(_ref40, 1, false),\n  f = _arr41[0];\nexpect(f).toEqual(undefined);\nlet _ref42 = [,],\n  _arr43 = _toArray(_ref42, 1, false),\n  g = _arr43[0];\nexpect(g).toEqual(undefined);\nlet thrown;\ntry {\n  thrown = false;\n  ((_ref44 = [,]),\n    (_arr45 = _toArray(_ref44, 1, false)),\n    (_obj46 = _objectDestructuringEmpty(_arr45[0])),\n    _ref44);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);\ntry {\n  thrown = false;\n  ((_ref47 = [,]),\n    (_arr48 = _toArray(_ref47, 1, false)),\n    (_arr49 = _toArray(_arr48[0], 0, false)),\n    _ref47);\n} catch (e) {\n  thrown = true;\n}\nexpect(thrown).toEqual(true);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nlet list = [1, 2, 3, 4];\nfor (\n  let i = 0, _ref = list, _obj = _objectDestructuringEmpty(_ref), length = _obj.length;\n  i < length;\n  i++\n) {\n  list[i];\n}",
  'const assign = function ([...arr], index, value) {\n  arr[index] = value;\n  return arr;\n};\n\nconst arr = [1, 2, 3];\nassign(arr, 1, 42);\n\nexpect(arr).toEqual([1, 2, 3]);',
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\n(function () {\n  var _ref, _arr;\n  let q;\n  let w;\n  let e;\n  if (true)\n    ((_ref = [1, 2, 3].map(() => 123)),\n      (_arr = _toArray(_ref, 3, false)),\n      (q = _arr[0]),\n      (w = _arr[1]),\n      (e = _arr[2]),\n      _ref);\n})();",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\nif (true) ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);",
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nimport { NestedObjects } from './some-module';\nconst _ref = NestedObjects,\n  _obj = _objectDestructuringEmpty(_ref),\n  Foo = _obj.Foo,\n  Bar = _obj.Bar;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _ref = input,\n  _obj = _objectDestructuringEmpty(_ref),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  _key16 = _toPropertyKey(prefix + 'state'),\n  state = _obj[_key16],\n  _key17 = _toPropertyKey(`${prefix}consents`),\n  consents = _obj[_key17],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key, _key16, _key17]);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar z = [];\nvar _ref = z,\n  _arr = _toArray(_ref, 1, true),\n  x = _arr[0],\n  y = _arr.slice(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _ref, _arr;\n((_ref = [1, 2]),\n  (_arr = _toArray(_ref, 2, false)),\n  (foo.foo = _arr[0]),\n  (foo.bar = _arr[1]),\n  _ref);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar rect = {};\nvar _ref = rect,\n  _obj = _objectDestructuringEmpty(_ref),\n  _arr = _toArray(_obj.topLeft, 2, false),\n  x1 = _arr[0],\n  y1 = _arr[1],\n  _arr14 = _toArray(_obj.bottomRight, 2, false),\n  x2 = _arr14[0],\n  y2 = _arr14[1];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar coords = [1, 2];\nvar _ref = coords,\n  _obj = _objectDestructuringEmpty(_ref),\n  x = _obj.x,\n  y = _obj.y,\n  foo = 'bar';",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nlet gets = 0;\nlet it = {\n  [Symbol.iterator]: () => ({\n    get next() {\n      gets++;\n      let i = 0;\n      return () => ({\n        done: false,\n        value: i++,\n      });\n    },\n  }),\n};\nlet _ref = it,\n  _arr = _toArray(_ref, 0, false);\nexpect(gets).toBe(1);\nlet _ref14 = it,\n  _arr15 = _toArray(_ref14, 1, false),\n  a = _arr15[0];\nexpect(gets).toBe(2);\nexpect(a).toBe(0);\nlet _ref16 = it,\n  _arr17 = _toArray(_ref16, 2, false),\n  b = _arr17[0],\n  c = _arr17[1];\nexpect(gets).toBe(3);\nexpect(b).toBe(0);\nexpect(c).toBe(1);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar foo, bar;\nexpect(() => {\n  var _ref, _arr;\n  return (\n    (_ref = undefined), (_arr = _toArray(_ref, 2, false)), (foo = _arr[0]), (bar = _arr[1]), _ref\n  );\n}).toThrow(/destructure non-iterable/);\nexpect(() => {\n  var _ref10, _arr11;\n  return (\n    (_ref10 = {}),\n    (_arr11 = _toArray(_ref10, 2, false)),\n    (foo = _arr11[0]),\n    (bar = _arr11[1]),\n    _ref10\n  );\n}).toThrow(/destructure non-iterable/);\nglobal.Symbol = void 0;\nexpect(() => {\n  var _ref12, _arr13;\n  return (\n    (_ref12 = {}),\n    (_arr13 = _toArray(_ref12, 2, false)),\n    (foo = _arr13[0]),\n    (bar = _arr13[1]),\n    _ref12\n  );\n}).toThrow(/destructure non-iterable/);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst foo = {\n  1: 'a',\n  2: 'b',\n  3: 'c',\n};\nconst _ref = foo,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(1),\n  bar = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(bar).toBe('a');\nexpect(rest).toEqual({\n  2: 'b',\n  3: 'c',\n});",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar rect = {};\nvar _ref = rect,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj15 = _objectDestructuringEmpty(_obj.topLeft),\n  x1 = _obj15.x,\n  y1 = _obj15.y,\n  _obj16 = _objectDestructuringEmpty(_obj.bottomRight),\n  x2 = _obj16.x,\n  y2 = _obj16.y;\nvar _ref17 = [0, 1, 2, 3, 4, 5, 6],\n  _obj18 = _objectDestructuringEmpty(_ref17),\n  foo = _obj18[3],\n  bar = _obj18[5];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar coords = [1, 2];\nvar _ref = coords,\n  _obj = _objectDestructuringEmpty(_ref),\n  x = _obj.x,\n  y = _obj.y;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref21, _obj22, _key23;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: 1,\n    a: 1,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n// takes care of the order\nkey = 1;\nvar _ref17 = {\n    2: 2,\n    3: 3,\n  },\n  _obj18 = _objectDestructuringEmpty(_ref17),\n  _key19 = _toPropertyKey(++key),\n  y = _obj18[_key19],\n  _key20 = _toPropertyKey(++key),\n  z = _obj18[_key20],\n  rest = _objectWithoutProperties(_obj18, [_key19, _key20]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref21 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj22 = _objectDestructuringEmpty(_ref21)),\n  (_key23 = _toPropertyKey(key)),\n  (y = _obj22[_key23]),\n  (z = _obj22.z),\n  (x = _objectWithoutProperties(_obj22, [_key23, 'z'])),\n  _ref21);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push('left');\n  return 0;\n}\nfunction right() {\n  order.push('right');\n  return {};\n}\nvar _ref24 = right(),\n  _obj25 = _objectDestructuringEmpty(_ref24),\n  _key26 = _toPropertyKey(left()),\n  y = _obj25[_key26],\n  x = _objectWithoutProperties(_obj25, [_key26]);\nexpect(order).toEqual(['right', 'left']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref = z,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(fn()),\n  x = _obj[_key],\n  y = _objectWithoutProperties(_obj, [_key]);",
  "function somethingAdvanced(\n  { topLeft: { x: x1, y: y1 } = {}, bottomRight: { x: x2, y: y2 } = {} },\n  p2,\n  p3,\n) {}\n\nfunction unpackObject({ title: title, author: author }) {\n  return title + ' ' + author;\n}\n\nconsole.log(unpackObject({ title: 'title', author: 'author' }));\n\nvar unpackArray = function ([a, b, c], [x, y, z]) {\n  return a + b + c;\n};\n\nconsole.log(unpackArray(['hello', ', ', 'world'], [1, 2, 3]));",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nfunction* f() {\n  for (var i = 0; i < 3; i++) {\n    yield i;\n  }\n}\nvar _ref = f(),\n  _arr = _toArray(_ref, 0, true),\n  xs = _arr.slice(0);\nexpect(xs).toEqual([0, 1, 2]);",
  'function isSorted([x, y, ...wow]) {\n  if (!zs.length) return true;\n  if (y > x) return isSorted(zs);\n  return false;\n}',
  "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';\nvar _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nexport default class A {\n  handle = value => {\n    var _ref, _obj;\n    ((_ref = {}), (_obj = _objectDestructuringEmpty(_ref)), (value = _obj.value), _ref);\n  };\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nfunction isBetween(x, a, b) {\n  var _ref, _arr;\n  if (a > b)\n    ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);\n  return x > a && x < b;\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nconst fn = arg => {\n  var _ref = arg,\n    _arr = _toArray(_ref, 2, false),\n    x = _arr[0],\n    y = _arr[1];\n};",
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
