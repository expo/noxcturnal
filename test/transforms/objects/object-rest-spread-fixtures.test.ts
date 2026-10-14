import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\n(_ref, a = R) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n};\n(_ref2, e, c = 2, a = R, f = q) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));\n  let q;\n};\n(_ref3, a = f(R)) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));\n};",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _obj;\n((_obj = obj), ({ a, b } = _obj), (c = _objectWithoutProperties(_obj, ['a', 'b'])));",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\n((_ref = obj),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  (c = _objectWithoutProperties(_obj, ['a', 'b'])),\n  _ref);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref, _obj;\n((_ref = obj),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a = _obj.a),\n  (b = _obj.b),\n  (c = _objectWithoutProperties(_obj, ['a', 'b'])),\n  _ref);",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet _a = a,\n  { [_a]: b } = obj,\n  c = _objectWithoutProperties(obj, [_a].map(_toPropertyKey));",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(a),\n  b = _obj[_key],\n  c = _objectWithoutProperties(_obj, [_key]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(a),\n  b = _obj[_key],\n  c = _objectWithoutProperties(_obj, [_key]);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet sym = Symbol();\nlet _a$b$sym = {\n    a: 1,\n    b: 2,\n    [sym]: 3,\n  },\n  { a } = _a$b$sym,\n  r = _objectWithoutProperties(_a$b$sym, ['a']);\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet sym = Symbol();\nlet _ref = {\n    a: 1,\n    b: 2,\n    [sym]: 3,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  r = _objectWithoutProperties(_obj, ['a']);\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet sym = Symbol();\nlet _ref = {\n    a: 1,\n    b: 2,\n    [sym]: 3,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  r = _objectWithoutProperties(_obj, ['a']);\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet { a, nested: _ref, e } = obj,\n  { b, c } = _ref,\n  d = _objectWithoutProperties(_ref, ['b', 'c']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  _obj13 = _objectDestructuringEmpty(_obj.nested),\n  b = _obj13.b,\n  c = _obj13.c,\n  d = _objectWithoutProperties(_obj13, ['b', 'c']),\n  e = _obj.e;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  _obj13 = _objectDestructuringEmpty(_obj.nested),\n  b = _obj13.b,\n  c = _obj13.c,\n  d = _objectWithoutProperties(_obj13, ['b', 'c']),\n  e = _obj.e;",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar { a, b } = obj,\n  c = _objectWithoutProperties(obj, ['a', 'b']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  a = _obj.a,\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet called = false;\nlet obj = {\n  get foo() {\n    called = true;\n  },\n};\nlet { foo } = obj,\n  rest = _objectWithoutProperties(obj, ['foo']);\nexpect('foo' in rest).toBe(false);\n// Without assuming that getters are pure (in this case it isn't), this should be true\nexpect(called).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet called = false;\nlet obj = {\n  get foo() {\n    called = true;\n  },\n};\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  foo = _obj.foo,\n  rest = _objectWithoutProperties(_obj, ['foo']);\nexpect('foo' in rest).toBe(false);\n// Without assuming that getters are pure (in this case it isn't), this should be true\nexpect(called).toBe(false);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet called = false;\nlet obj = {\n  get foo() {\n    called = true;\n  },\n};\nlet _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  foo = _obj.foo,\n  rest = _objectWithoutProperties(_obj, ['foo']);\nexpect('foo' in rest).toBe(false);\n// Without assuming that getters are pure (in this case it isn't), this should be true\nexpect(called).toBe(false);",
  "const _excluded = ['excluded', 'excluded2', 'used', 'used2'],\n  _excluded2 = ['unused'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _c;\n// should not remove when destructuring into existing bindings\n((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));\nfunction render() {\n  const _this$props = this.props,\n    { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,\n    props = _objectWithoutProperties(_this$props, _excluded);\n  console.log(used, usedRenamed);\n  return React.createElement('input', props);\n}\nfunction smth(_ref) {\n  let { unused } = _ref,\n    rest = _objectWithoutProperties(_ref, _excluded2);\n  call(rest);\n}",
  "const _excluded = ['unused'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\n// should not remove when destructuring into existing bindings\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nfunction render() {\n  const _ref17 = this.props,\n    _obj18 = _objectDestructuringEmpty(_ref17),\n    excluded = _obj18.excluded,\n    excludedRenamed = _obj18.excluded2,\n    used = _obj18.used,\n    usedRenamed = _obj18.used2,\n    props = _objectWithoutProperties(_obj18, ['excluded', 'excluded2', 'used', 'used2']);\n  console.log(used, usedRenamed);\n  return React.createElement('input', props);\n}\nfunction smth(_ref18) {\n  let { unused } = _ref18,\n    rest = _objectWithoutProperties3(_ref18, _excluded);\n  call(rest);\n}",
  "const _excluded = ['unused'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref, _obj;\n// should not remove when destructuring into existing bindings\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nfunction render() {\n  const _ref17 = this.props,\n    _obj18 = _objectDestructuringEmpty(_ref17),\n    excluded = _obj18.excluded,\n    excludedRenamed = _obj18.excluded2,\n    used = _obj18.used,\n    usedRenamed = _obj18.used2,\n    props = _objectWithoutProperties(_obj18, ['excluded', 'excluded2', 'used', 'used2']);\n  console.log(used, usedRenamed);\n  return React.createElement('input', props);\n}\nfunction smth(_ref18) {\n  let { unused } = _ref18,\n    rest = _objectWithoutProperties3(_ref18, _excluded);\n  call(rest);\n}",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nlet count = 0;\nlet withFoo = {\n  get foo() {\n    return count++;\n  },\n};\nlet withBar = {\n  get bar() {\n    return count++;\n  },\n};\nlet res = _objectSpread(_objectSpread({}, withFoo), {}, { middle: count }, withBar);\n// Without assuming that getters are pure (in this case it isn't),\n// the result should be { foo: 0, middle: 1, bar: 1 }\nexpect(res).toEqual({\n  foo: 0,\n  middle: 0,\n  bar: 1,\n});",
  "let count = 0;\nlet withFoo = {\n  get foo() {\n    return count++;\n  },\n};\nlet withBar = {\n  get bar() {\n    return count++;\n  },\n};\nlet res = Object.assign({}, withFoo, { middle: count }, withBar);\n// Without assuming that getters are pure (in this case it isn't),\n// the result should be { foo: 0, middle: 1, bar: 1 }\nexpect(res).toEqual({\n  foo: 0,\n  middle: 0,\n  bar: 1,\n});",
  "var _extends = require('@babel/runtime/helpers/extends');\nlet count = 0;\nlet withFoo = {\n  get foo() {\n    return count++;\n  },\n};\nlet withBar = {\n  get bar() {\n    return count++;\n  },\n};\nlet res = _extends({}, withFoo, { middle: count }, withBar);\n// Without assuming that getters are pure (in this case it isn't),\n// the result should be { foo: 0, middle: 1, bar: 1 }\nexpect(res).toEqual({\n  foo: 0,\n  middle: 0,\n  bar: 1,\n});",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nlet obj = _objectSpread(_objectSpread(_objectSpread({ a }, b), {}, { c }, d), {}, { e });",
  'let obj = Object.assign({ a }, b, { c }, d, { e });',
  "var _extends = require('@babel/runtime/helpers/extends');\nlet obj = _extends({ a }, b, { c }, d, { e });",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar x;\nvar y;\nvar z;\nz = _objectSpread({ x }, y);\nz = {\n  x,\n  w: _objectSpread({}, y),\n};",
  'var x;\nvar y;\nvar z;\nz = Object.assign({ x }, y);\nz = {\n  x,\n  w: Object.assign({}, y),\n};',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar x;\nvar y;\nvar z;\nz = _extends({ x }, y);\nz = {\n  x,\n  w: _extends({}, y),\n};",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar log = [];\nvar a = _objectSpread(\n  _objectSpread(\n    {},\n    {\n      get foo() {\n        log.push(1);\n      },\n    },\n  ),\n  {},\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\n// Loose mode uses regular Get, not GetOwnProperty.\nexpect(log).toEqual([1, 2]);",
  'var log = [];\nvar a = Object.assign(\n  {},\n  {\n    get foo() {\n      log.push(1);\n    },\n  },\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\n// Loose mode uses regular Get, not GetOwnProperty.\nexpect(log).toEqual([1, 2]);',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar log = [];\nvar a = _extends(\n  {},\n  {\n    get foo() {\n      log.push(1);\n    },\n  },\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\n// Loose mode uses regular Get, not GetOwnProperty.\nexpect(log).toEqual([1, 2]);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar a;\nvar b;\nvar c;\nvar d;\nvar x;\nvar y;\n_objectSpread(_objectSpread(_objectSpread({ x }, y), {}, { a }, b), {}, { c });\n_objectSpread({}, Object.prototype);\n_objectSpread({}, { foo: 'bar' });\n_objectSpread(_objectSpread({}, { foo: 'bar' }), { bar: 'baz' });\n_objectSpread(\n  {},\n  {\n    get foo() {\n      return 'foo';\n    },\n  },\n);",
  "var a;\nvar b;\nvar c;\nvar d;\nvar x;\nvar y;\nObject.assign({ x }, y, { a }, b, { c });\nObject.assign({}, Object.prototype);\nObject.assign({}, { foo: 'bar' });\nObject.assign({}, { foo: 'bar' }, { bar: 'baz' });\nObject.assign(\n  {},\n  {\n    get foo() {\n      return 'foo';\n    },\n  },\n);",
  "var _extends = require('@babel/runtime/helpers/extends');\nvar a;\nvar b;\nvar c;\nvar d;\nvar x;\nvar y;\n_extends({ x }, y, { a }, b, { c });\n_extends({}, Object.prototype);\n_extends({}, { foo: 'bar' });\n_extends({}, { foo: 'bar' }, { bar: 'baz' });\n_extends(\n  {},\n  {\n    get foo() {\n      return 'foo';\n    },\n  },\n);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nconst oldGOPDs = Object.getOwnPropertyDescriptors;\nObject.getOwnPropertyDescriptors = null;\ntry {\n  _objectSpread(_objectSpread({}, { a: 1 }), {}, { b: 1 }, {});\n} finally {\n  Object.getOwnPropertyDescriptors = oldGOPDs;\n}",
  'const oldGOPDs = Object.getOwnPropertyDescriptors;\nObject.getOwnPropertyDescriptors = null;\ntry {\n  Object.assign({}, { a: 1 }, { b: 1 }, {});\n} finally {\n  Object.getOwnPropertyDescriptors = oldGOPDs;\n}',
  "var _extends = require('@babel/runtime/helpers/extends');\nconst oldGOPDs = Object.getOwnPropertyDescriptors;\nObject.getOwnPropertyDescriptors = null;\ntry {\n  _extends({}, { a: 1 }, { b: 1 }, {});\n} finally {\n  Object.getOwnPropertyDescriptors = oldGOPDs;\n}",
  "'use strict';\nvar _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this won't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nexpect(() => {\n  const objSpread = _objectSpread({}, obj);\n}).toThrow();\nconst obj2 = { NOWRITE: 456 };\n// this throws `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nexpect(() => {\n  const obj2Spread = _objectSpread({}, obj2);\n}).toThrow();\nconst KEY = Symbol('key');\nconst obj3Spread = _objectSpread(\n  _objectSpread(\n    {},\n    {\n      get foo() {\n        return 'bar';\n      },\n    },\n  ),\n  {},\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = _objectSpread({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = _objectSpread({}, o);\n// Loose will do o2.__proto__ = []\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);",
  "'use strict';\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this won't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nexpect(() => {\n  const objSpread = Object.assign({}, obj);\n}).toThrow();\nconst obj2 = { NOWRITE: 456 };\n// this throws `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nexpect(() => {\n  const obj2Spread = Object.assign({}, obj2);\n}).toThrow();\nconst KEY = Symbol('key');\nconst obj3Spread = Object.assign(\n  {},\n  {\n    get foo() {\n      return 'bar';\n    },\n  },\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = Object.assign({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => Object.assign({}, null, undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = Object.assign({}, o);\n// Loose will do o2.__proto__ = []\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);",
  "'use strict';\nvar _extends = require('@babel/runtime/helpers/extends');\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this won't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nexpect(() => {\n  const objSpread = _extends({}, obj);\n}).toThrow();\nconst obj2 = { NOWRITE: 456 };\n// this throws `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nexpect(() => {\n  const obj2Spread = _extends({}, obj2);\n}).toThrow();\nconst KEY = Symbol('key');\nconst obj3Spread = _extends(\n  {},\n  {\n    get foo() {\n      return 'bar';\n    },\n  },\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = _extends({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => _extends({}, null, undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = _extends({}, o);\n// Loose will do o2.__proto__ = []\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nlet a = _objectSpread({ x: 1 }, b);",
  'let a = Object.assign({ x: 1 }, b);',
  "var _extends = require('@babel/runtime/helpers/extends');\nlet a = _extends({ x: 1 }, b);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\n({ a1 } = c1);\nvar _c;\n((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));\nvar _c2;\nconsole.log(((_c2 = c3), ({ a3 } = _c2), (b3 = _objectWithoutProperties(_c2, ['a3'])), _c2));",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj, _ref8, _obj9;\n({ a1 } = c1);\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nconsole.log(\n  ((_ref8 = c3),\n  (_obj9 = _objectDestructuringEmpty(_ref8)),\n  (a3 = _obj9.a3),\n  (b3 = _objectWithoutProperties(_obj9, ['a3'])),\n  _ref8),\n);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref, _obj, _ref8, _obj9;\n({ a1 } = c1);\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nconsole.log(\n  ((_ref8 = c3),\n  (_obj9 = _objectDestructuringEmpty(_ref8)),\n  (a3 = _obj9.a3),\n  (b3 = _objectWithoutProperties(_obj9, ['a3'])),\n  _ref8),\n);",
  "const _excluded = ['a1'],\n  _excluded2 = ['a2', 'b2'],\n  _excluded3 = ['c3'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\ntry {\n} catch (_ref) {\n  let a34 = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n}\ntry {\n} catch (_ref2) {\n  let { a1 } = _ref2,\n    b1 = _objectWithoutProperties(_ref2, _excluded);\n}\ntry {\n} catch (_ref3) {\n  let { a2, b2 } = _ref3,\n    c2 = _objectWithoutProperties(_ref3, _excluded2);\n}\ntry {\n} catch (_ref4) {\n  let { a2, b2, c2: _ref5 } = _ref4,\n    { c3 } = _ref5,\n    c4 = _objectWithoutProperties(_ref5, _excluded3);\n}\n// Unchanged\ntry {\n} catch (a) {}\ntry {\n} catch ({ b }) {}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\ntry {\n} catch (_caught) {\n  let _obj = _objectDestructuringEmpty(_caught),\n    a34 = _objectWithoutProperties(_obj, []);\n}\ntry {\n} catch (_caught18) {\n  let _obj19 = _objectDestructuringEmpty(_caught18),\n    a1 = _obj19.a1,\n    b1 = _objectWithoutProperties(_obj19, ['a1']);\n}\ntry {\n} catch (_caught20) {\n  let _obj21 = _objectDestructuringEmpty(_caught20),\n    a2 = _obj21.a2,\n    b2 = _obj21.b2,\n    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);\n}\ntry {\n} catch (_caught22) {\n  let _obj23 = _objectDestructuringEmpty(_caught22),\n    a2 = _obj23.a2,\n    b2 = _obj23.b2,\n    _obj24 = _objectDestructuringEmpty(_obj23.c2),\n    c3 = _obj24.c3,\n    c4 = _objectWithoutProperties(_obj24, ['c3']);\n}\n// Unchanged\ntry {\n} catch (a) {}\ntry {\n} catch ({ b }) {}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\ntry {\n} catch (_caught) {\n  let _obj = _objectDestructuringEmpty(_caught),\n    a34 = _objectWithoutProperties(_obj, []);\n}\ntry {\n} catch (_caught18) {\n  let _obj19 = _objectDestructuringEmpty(_caught18),\n    a1 = _obj19.a1,\n    b1 = _objectWithoutProperties(_obj19, ['a1']);\n}\ntry {\n} catch (_caught20) {\n  let _obj21 = _objectDestructuringEmpty(_caught20),\n    a2 = _obj21.a2,\n    b2 = _obj21.b2,\n    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);\n}\ntry {\n} catch (_caught22) {\n  let _obj23 = _objectDestructuringEmpty(_caught22),\n    a2 = _obj23.a2,\n    b2 = _obj23.b2,\n    _obj24 = _objectDestructuringEmpty(_obj23.c2),\n    c3 = _obj24.c3,\n    c4 = _objectWithoutProperties(_obj24, ['c3']);\n}\n// Unchanged\ntry {\n} catch (a) {}\ntry {\n} catch ({ b }) {}",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nit('es7.objectRestSpread', () => {\n  let original = {\n    a: 1,\n    b: 2,\n  };\n  let copy = _extends({}, (_objectDestructuringEmpty(original), original));\n});",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nit('es7.objectRestSpread', () => {\n  let original = {\n    a: 1,\n    b: 2,\n  };\n  let _ref = original,\n    _obj = _objectDestructuringEmpty(_ref),\n    copy = _objectWithoutProperties(_obj, []);\n});",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nit('es7.objectRestSpread', () => {\n  let original = {\n    a: 1,\n    b: 2,\n  };\n  let _ref = original,\n    _obj = _objectDestructuringEmpty(_ref),\n    copy = _objectWithoutProperties(_obj, []);\n});",
  "import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';\n// ExportNamedDeclaration\nexport var { b } = asdf2,\n  c = _objectWithoutProperties(asdf2, ['b']);\n// Skip\nexport var { bb, cc } = ads;\nexport var [dd, ee, ...ff] = ads;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\n// ExportNamedDeclaration\nexport var _ref = asdf2,\n  _obj = _objectDestructuringEmpty(_ref),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\n// Skip\nexport var { bb, cc } = ads;\nexport var [dd, ee, ...ff] = ads;",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\n// ExportNamedDeclaration\nexport var _ref = asdf2,\n  _obj = _objectDestructuringEmpty(_ref),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\n// Skip\nexport var { bb, cc } = ads;\nexport var [dd, ee, ...ff] = ads;",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nlet a, result;\nfor (const [_ref] of [[{ a: 0 }]]) {\n  let a = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n  result = a;\n}\nexpect(result).toEqual({ a: 0 });",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet a, result;\nfor (const _ref of [[{ a: 0 }]]) {\n  const _arr = _toArray(_ref, 1, false),\n    _obj = _objectDestructuringEmpty(_arr[0]),\n    a = _objectWithoutProperties(_obj, []);\n  {\n    result = a;\n  }\n}\nexpect(result).toEqual({ a: 0 });",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet a, result;\nfor (const _ref of [[{ a: 0 }]]) {\n  const _arr = _toArray(_ref, 1, false),\n    _obj = _objectDestructuringEmpty(_arr[0]),\n    a = _objectWithoutProperties(_obj, []);\n  {\n    result = a;\n  }\n}\nexpect(result).toEqual({ a: 0 });",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\n// ForXStatement\n{\n  let a;\n  for (const [_ref] of []) {\n    let a = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n  }\n  for (var _ref2 of []) {\n    var _ref3;\n    var _ref4;\n    (([_ref3] = _ref2),\n      (_ref4 = _ref3),\n      ({} = _ref4),\n      (a = _extends({}, (_objectDestructuringEmpty(_ref4), _ref4))),\n      _ref4);\n  }\n  async function f() {\n    for await (var _ref5 of []) {\n      var _ref6;\n      var _ref7;\n      (([_ref6] = _ref5),\n        (_ref7 = _ref6),\n        ({} = _ref7),\n        (a = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7))),\n        _ref7);\n    }\n  }\n}\n// skip\n{\n  for ([...a] in {}) {\n  }\n  for ([...a] of []) {\n  }\n  async function a() {\n    for await ([...a] of []) {\n    }\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref11, _arr12, _obj13;\n// ForXStatement\n{\n  let a;\n  for (const _ref of []) {\n    const _arr = _toArray(_ref, 1, false),\n      _obj = _objectDestructuringEmpty(_arr[0]),\n      a = _objectWithoutProperties(_obj, []);\n    {\n    }\n  }\n  for (_ref11 of []) {\n    ((_arr12 = _toArray(_ref11, 1, false)),\n      (_obj13 = _objectDestructuringEmpty(_arr12[0])),\n      (a = _objectWithoutProperties(_obj13, [])));\n    {\n    }\n  }\n  async function f() {\n    var _ref14, _arr15, _obj16;\n    for await (_ref14 of []) {\n      ((_arr15 = _toArray(_ref14, 1, false)),\n        (_obj16 = _objectDestructuringEmpty(_arr15[0])),\n        (a = _objectWithoutProperties(_obj16, [])));\n      {\n      }\n    }\n  }\n}\n// skip\n{\n  for ([...a] in {}) {\n  }\n  for ([...a] of []) {\n  }\n  async function a() {\n    for await ([...a] of []) {\n    }\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref11, _arr12, _obj13;\n// ForXStatement\n{\n  let a;\n  for (const _ref of []) {\n    const _arr = _toArray(_ref, 1, false),\n      _obj = _objectDestructuringEmpty(_arr[0]),\n      a = _objectWithoutProperties(_obj, []);\n    {\n    }\n  }\n  for (_ref11 of []) {\n    ((_arr12 = _toArray(_ref11, 1, false)),\n      (_obj13 = _objectDestructuringEmpty(_arr12[0])),\n      (a = _objectWithoutProperties(_obj13, [])));\n    {\n    }\n  }\n  async function f() {\n    var _ref14, _arr15, _obj16;\n    for await (_ref14 of []) {\n      ((_arr15 = _toArray(_ref14, 1, false)),\n        (_obj16 = _objectDestructuringEmpty(_arr15[0])),\n        (a = _objectWithoutProperties(_obj16, [])));\n      {\n      }\n    }\n  }\n}\n// skip\n{\n  for ([...a] in {}) {\n  }\n  for ([...a] of []) {\n  }\n  async function a() {\n    for await ([...a] of []) {\n    }\n  }\n}",
  "const _excluded = ['a'],\n  _excluded2 = ['a'],\n  _excluded3 = ['a'],\n  _excluded4 = ['a'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\n// ForXStatement\n{\n  let a, b;\n  for (const [_ref] of []) {\n    let { a } = _ref,\n      b = _objectWithoutProperties(_ref, _excluded);\n  }\n  for (var _ref2 of []) {\n    var _ref3;\n    var _ref4;\n    (([_ref3] = _ref2),\n      (_ref4 = _ref3),\n      ({ a } = _ref4),\n      (b = _objectWithoutProperties(_ref4, _excluded2)),\n      _ref4);\n  }\n  async function f() {\n    for await (var _ref5 of []) {\n      var _ref6;\n      var _ref7;\n      (([_ref6] = _ref5),\n        (_ref7 = _ref6),\n        ({ a } = _ref7),\n        (b = _objectWithoutProperties(_ref7, _excluded3)),\n        _ref7);\n    }\n  }\n  for (const _ref8 of []) {\n    let {\n        a: [_ref9],\n      } = _ref8,\n      { a } = _ref9,\n      b = _objectWithoutProperties(_ref9, _excluded4);\n  }\n}\n// skip\n{\n  for ([{ a }] in {}) {\n  }\n  for ([{ a }] of []) {\n  }\n  async function a() {\n    for await ([{ a }] of []) {\n    }\n  }\n}\n{\n  for ([a, ...b] in {}) {\n  }\n  for ([a, ...b] of []) {\n  }\n  async function a() {\n    for await ([a, ...b] of []) {\n    }\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref12, _arr13, _obj14;\n// ForXStatement\n{\n  let a, b;\n  for (const _ref of []) {\n    const _arr = _toArray(_ref, 1, false),\n      _obj = _objectDestructuringEmpty(_arr[0]),\n      a = _obj.a,\n      b = _objectWithoutProperties(_obj, ['a']);\n    {\n    }\n  }\n  for (_ref12 of []) {\n    ((_arr13 = _toArray(_ref12, 1, false)),\n      (_obj14 = _objectDestructuringEmpty(_arr13[0])),\n      (a = _obj14.a),\n      (b = _objectWithoutProperties(_obj14, ['a'])));\n    {\n    }\n  }\n  async function f() {\n    var _ref15, _arr16, _obj17;\n    for await (_ref15 of []) {\n      ((_arr16 = _toArray(_ref15, 1, false)),\n        (_obj17 = _objectDestructuringEmpty(_arr16[0])),\n        (a = _obj17.a),\n        (b = _objectWithoutProperties(_obj17, ['a'])));\n      {\n      }\n    }\n  }\n  for (const _ref18 of []) {\n    const _obj19 = _objectDestructuringEmpty(_ref18),\n      _arr20 = _toArray(_obj19.a, 1, false),\n      _obj21 = _objectDestructuringEmpty(_arr20[0]),\n      a = _obj21.a,\n      b = _objectWithoutProperties(_obj21, ['a']);\n    {\n    }\n  }\n}\n// skip\n{\n  for ([{ a }] in {}) {\n  }\n  for ([{ a }] of []) {\n  }\n  async function a() {\n    for await ([{ a }] of []) {\n    }\n  }\n}\n{\n  for ([a, ...b] in {}) {\n  }\n  for ([a, ...b] of []) {\n  }\n  async function a() {\n    for await ([a, ...b] of []) {\n    }\n  }\n}",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref12, _arr13, _obj14;\n// ForXStatement\n{\n  let a, b;\n  for (const _ref of []) {\n    const _arr = _toArray(_ref, 1, false),\n      _obj = _objectDestructuringEmpty(_arr[0]),\n      a = _obj.a,\n      b = _objectWithoutProperties(_obj, ['a']);\n    {\n    }\n  }\n  for (_ref12 of []) {\n    ((_arr13 = _toArray(_ref12, 1, false)),\n      (_obj14 = _objectDestructuringEmpty(_arr13[0])),\n      (a = _obj14.a),\n      (b = _objectWithoutProperties(_obj14, ['a'])));\n    {\n    }\n  }\n  async function f() {\n    var _ref15, _arr16, _obj17;\n    for await (_ref15 of []) {\n      ((_arr16 = _toArray(_ref15, 1, false)),\n        (_obj17 = _objectDestructuringEmpty(_arr16[0])),\n        (a = _obj17.a),\n        (b = _objectWithoutProperties(_obj17, ['a'])));\n      {\n      }\n    }\n  }\n  for (const _ref18 of []) {\n    const _obj19 = _objectDestructuringEmpty(_ref18),\n      _arr20 = _toArray(_obj19.a, 1, false),\n      _obj21 = _objectDestructuringEmpty(_arr20[0]),\n      a = _obj21.a,\n      b = _objectWithoutProperties(_obj21, ['a']);\n    {\n    }\n  }\n}\n// skip\n{\n  for ([{ a }] in {}) {\n  }\n  for ([{ a }] of []) {\n  }\n  async function a() {\n    for await ([{ a }] of []) {\n    }\n  }\n}\n{\n  for ([a, ...b] in {}) {\n  }\n  for ([a, ...b] of []) {\n  }\n  async function a() {\n    for await ([a, ...b] of []) {\n    }\n  }\n}",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet a = 0,\n  result,\n  y;\nfor (var _ref of [['0', '1']]) {\n  var _ref2,\n    _a = a++;\n  ((_ref2 = _ref),\n    ({ [_a]: result } = _ref2),\n    (y = _objectWithoutProperties(_ref2, [_a].map(_toPropertyKey))));\n  const a = 1;\n}\nexpect(result).toBe('0');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref, _obj, _key;\nlet a = 0,\n  result,\n  y;\nfor (_ref of [['0', '1']]) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(a++)),\n    (result = _obj[_key]),\n    (y = _objectWithoutProperties(_obj, [_key])));\n  {\n    const a = 1;\n  }\n}\nexpect(result).toBe('0');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref, _obj, _key;\nlet a = 0,\n  result,\n  y;\nfor (_ref of [['0', '1']]) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(a++)),\n    (result = _obj[_key]),\n    (y = _objectWithoutProperties(_obj, [_key])));\n  {\n    const a = 1;\n  }\n}\nexpect(result).toBe('0');",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet a = 0,\n  result,\n  y;\nfor (var _ref of [['0', '1']]) {\n  var _ref2,\n    _a = a++;\n  ((_ref2 = _ref),\n    ({ [_a]: result } = _ref2),\n    (y = _objectWithoutProperties(_ref2, [_a].map(_toPropertyKey))));\n  const a = 1;\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref, _obj, _key;\nlet a = 0,\n  result,\n  y;\nfor (_ref of [['0', '1']]) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(a++)),\n    (result = _obj[_key]),\n    (y = _objectWithoutProperties(_obj, [_key])));\n  {\n    const a = 1;\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref, _obj, _key;\nlet a = 0,\n  result,\n  y;\nfor (_ref of [['0', '1']]) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(a++)),\n    (result = _obj[_key]),\n    (y = _objectWithoutProperties(_obj, [_key])));\n  {\n    const a = 1;\n  }\n}",
  "const _excluded = ['a'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nfor (var _ref of []) {\n  var _ref2;\n  ((_ref2 = _ref), ({ a } = _ref2), (b = _objectWithoutProperties(_ref2, _excluded)));\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\nfor (_ref of []) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (a = _obj.a),\n    (b = _objectWithoutProperties(_obj, ['a'])));\n  {\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref, _obj;\nfor (_ref of []) {\n  ((_obj = _objectDestructuringEmpty(_ref)),\n    (a = _obj.a),\n    (b = _objectWithoutProperties(_obj, ['a'])));\n  {\n  }\n}",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  let _a = a++,\n    { [_a]: x } = _ref,\n    y = _objectWithoutProperties(_ref, [_a].map(_toPropertyKey));\n  const a = 1;\n  result = x;\n}\nexpect(result).toBe('0');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = _toPropertyKey(a++),\n    x = _obj[_key],\n    y = _objectWithoutProperties(_obj, [_key]);\n  {\n    const a = 1;\n    result = x;\n  }\n}\nexpect(result).toBe('0');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = _toPropertyKey(a++),\n    x = _obj[_key],\n    y = _objectWithoutProperties(_obj, [_key]);\n  {\n    const a = 1;\n    result = x;\n  }\n}\nexpect(result).toBe('0');",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  let _a = a++,\n    { [_a]: x } = _ref,\n    y = _objectWithoutProperties(_ref, [_a].map(_toPropertyKey));\n  const a = 1;\n  result = x;\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = _toPropertyKey(a++),\n    x = _obj[_key],\n    y = _objectWithoutProperties(_obj, [_key]);\n  {\n    const a = 1;\n    result = x;\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nlet a = 0,\n  result;\nfor (const _ref of [['0', '1']]) {\n  const _obj = _objectDestructuringEmpty(_ref),\n    _key = _toPropertyKey(a++),\n    x = _obj[_key],\n    y = _objectWithoutProperties(_obj, [_key]);\n  {\n    const a = 1;\n    result = x;\n  }\n}",
  "const _excluded = ['a'],\n  _excluded2 = ['a'],\n  _excluded3 = ['a'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\n// ForXStatement\nfor (var _ref of []) {\n  let { a } = _ref,\n    b = _objectWithoutProperties(_ref, _excluded);\n}\nfor (var _ref2 of []) {\n  var _ref3;\n  ((_ref3 = _ref2), ({ a } = _ref3), (b = _objectWithoutProperties(_ref3, _excluded2)));\n}\nasync function a() {\n  for await (var _ref4 of []) {\n    var _ref5;\n    ((_ref5 = _ref4), ({ a } = _ref5), (b = _objectWithoutProperties(_ref5, _excluded3)));\n  }\n}\n// skip\nfor ({ a } in {}) {\n}\nfor ({ a } of []) {\n}\nasync function a() {\n  for await ({ a } of []) {\n  }\n}\nfor (a in {}) {\n}\nfor (a of []) {\n}\nasync function a() {\n  for await (a of []) {\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref10, _obj11;\n// ForXStatement\nfor (var _ref of []) {\n  var _obj = _objectDestructuringEmpty(_ref),\n    a = _obj.a,\n    b = _objectWithoutProperties(_obj, ['a']);\n  {\n  }\n}\nfor (_ref10 of []) {\n  ((_obj11 = _objectDestructuringEmpty(_ref10)),\n    (a = _obj11.a),\n    (b = _objectWithoutProperties(_obj11, ['a'])));\n  {\n  }\n}\nasync function a() {\n  var _ref12, _obj13;\n  for await (_ref12 of []) {\n    ((_obj13 = _objectDestructuringEmpty(_ref12)),\n      (a = _obj13.a),\n      (b = _objectWithoutProperties(_obj13, ['a'])));\n    {\n    }\n  }\n}\n// skip\nfor ({ a } in {}) {\n}\nfor ({ a } of []) {\n}\nasync function a() {\n  for await ({ a } of []) {\n  }\n}\nfor (a in {}) {\n}\nfor (a of []) {\n}\nasync function a() {\n  for await (a of []) {\n  }\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref10, _obj11;\n// ForXStatement\nfor (var _ref of []) {\n  var _obj = _objectDestructuringEmpty(_ref),\n    a = _obj.a,\n    b = _objectWithoutProperties(_obj, ['a']);\n  {\n  }\n}\nfor (_ref10 of []) {\n  ((_obj11 = _objectDestructuringEmpty(_ref10)),\n    (a = _obj11.a),\n    (b = _objectWithoutProperties(_obj11, ['a'])));\n  {\n  }\n}\nasync function a() {\n  var _ref12, _obj13;\n  for await (_ref12 of []) {\n    ((_obj13 = _objectDestructuringEmpty(_ref12)),\n      (a = _obj13.a),\n      (b = _objectWithoutProperties(_obj13, ['a'])));\n    {\n    }\n  }\n}\n// skip\nfor ({ a } in {}) {\n}\nfor ({ a } of []) {\n}\nasync function a() {\n  for await ({ a } of []) {\n  }\n}\nfor (a in {}) {\n}\nfor (a of []) {\n}\nasync function a() {\n  for await (a of []) {\n  }\n}",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _$a = {\n    1: 1,\n    a: 1,\n  },\n  _key = key++,\n  { [_key]: y } = _$a,\n  x = _objectWithoutProperties(_$a, [_key].map(_toPropertyKey));\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n// takes care of the order\nkey = 1;\nvar _$ = {\n    2: 2,\n    3: 3,\n  },\n  _key2 = ++key,\n  _key3 = ++key,\n  { [_key2]: y, [_key3]: z } = _$,\n  rest = _objectWithoutProperties(_$, [_key2, _key3].map(_toPropertyKey));\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\nvar _$z;\n((_$z = {\n  2: 'two',\n  z: 'zee',\n}),\n  ({ [key]: y, z } = _$z),\n  (x = _objectWithoutProperties(_$z, [key, 'z'].map(_toPropertyKey))));\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push('left');\n  return 0;\n}\nfunction right() {\n  order.push('right');\n  return {};\n}\nvar _right = right(),\n  _left = left(),\n  { [_left]: y } = _right,\n  x = _objectWithoutProperties(_right, [_left].map(_toPropertyKey));\nexpect(order).toEqual(['right', 'left']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref21, _obj22, _key23;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: 1,\n    a: 1,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n// takes care of the order\nkey = 1;\nvar _ref17 = {\n    2: 2,\n    3: 3,\n  },\n  _obj18 = _objectDestructuringEmpty(_ref17),\n  _key19 = _toPropertyKey(++key),\n  y = _obj18[_key19],\n  _key20 = _toPropertyKey(++key),\n  z = _obj18[_key20],\n  rest = _objectWithoutProperties(_obj18, [_key19, _key20]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref21 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj22 = _objectDestructuringEmpty(_ref21)),\n  (_key23 = _toPropertyKey(key)),\n  (y = _obj22[_key23]),\n  (z = _obj22.z),\n  (x = _objectWithoutProperties(_obj22, [_key23, 'z'])),\n  _ref21);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push('left');\n  return 0;\n}\nfunction right() {\n  order.push('right');\n  return {};\n}\nvar _ref24 = right(),\n  _obj25 = _objectDestructuringEmpty(_ref24),\n  _key26 = _toPropertyKey(left()),\n  y = _obj25[_key26],\n  x = _objectWithoutProperties(_obj25, [_key26]);\nexpect(order).toEqual(['right', 'left']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref21, _obj22, _key23;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: 1,\n    a: 1,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n// takes care of the order\nkey = 1;\nvar _ref17 = {\n    2: 2,\n    3: 3,\n  },\n  _obj18 = _objectDestructuringEmpty(_ref17),\n  _key19 = _toPropertyKey(++key),\n  y = _obj18[_key19],\n  _key20 = _toPropertyKey(++key),\n  z = _obj18[_key20],\n  rest = _objectWithoutProperties(_obj18, [_key19, _key20]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref21 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj22 = _objectDestructuringEmpty(_ref21)),\n  (_key23 = _toPropertyKey(key)),\n  (y = _obj22[_key23]),\n  (z = _obj22.z),\n  (x = _objectWithoutProperties(_obj22, [_key23, 'z'])),\n  _ref21);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push('left');\n  return 0;\n}\nfunction right() {\n  order.push('right');\n  return {};\n}\nvar _ref24 = right(),\n  _obj25 = _objectDestructuringEmpty(_ref24),\n  _key26 = _toPropertyKey(left()),\n  y = _obj25[_key26],\n  x = _objectWithoutProperties(_obj25, [_key26]);\nexpect(order).toEqual(['right', 'left']);",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _$a = {\n    1: 1,\n    a: 1,\n  },\n  _key = key++,\n  { [_key]: y } = _$a,\n  x = _objectWithoutProperties(_$a, [_key].map(_toPropertyKey));\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _$ = {\n    2: 2,\n    3: 3,\n  },\n  _key2 = ++key,\n  _key3 = ++key,\n  { [_key2]: y, [_key3]: z } = _$,\n  rest = _objectWithoutProperties(_$, [_key2, _key3].map(_toPropertyKey));\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\nvar _$z;\n((_$z = {\n  2: 'two',\n  z: 'zee',\n}),\n  ({ [key]: y, z } = _$z),\n  (x = _objectWithoutProperties(_$z, [key, 'z'].map(_toPropertyKey))));\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref18, _obj19, _key20;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: 1,\n    a: 1,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _ref14 = {\n    2: 2,\n    3: 3,\n  },\n  _obj15 = _objectDestructuringEmpty(_ref14),\n  _key16 = _toPropertyKey(++key),\n  y = _obj15[_key16],\n  _key17 = _toPropertyKey(++key),\n  z = _obj15[_key17],\n  rest = _objectWithoutProperties(_obj15, [_key16, _key17]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref18 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj19 = _objectDestructuringEmpty(_ref18)),\n  (_key20 = _toPropertyKey(key)),\n  (y = _obj19[_key20]),\n  (z = _obj19.z),\n  (x = _objectWithoutProperties(_obj19, [_key20, 'z'])),\n  _ref18);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref18, _obj19, _key20;\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: 1,\n    a: 1,\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(key++),\n  y = _obj[_key],\n  x = _objectWithoutProperties(_obj, [_key]);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _ref14 = {\n    2: 2,\n    3: 3,\n  },\n  _obj15 = _objectDestructuringEmpty(_ref14),\n  _key16 = _toPropertyKey(++key),\n  y = _obj15[_key16],\n  _key17 = _toPropertyKey(++key),\n  z = _obj15[_key17],\n  rest = _objectWithoutProperties(_obj15, [_key16, _key17]);\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n// pure, computed property should remain as-is\nkey = 2;\n((_ref18 = {\n  2: 'two',\n  z: 'zee',\n}),\n  (_obj19 = _objectDestructuringEmpty(_ref18)),\n  (_key20 = _toPropertyKey(key)),\n  (y = _obj19[_key20]),\n  (z = _obj19.z),\n  (x = _objectWithoutProperties(_obj19, [_key20, 'z'])),\n  _ref18);\nexpect(y).toBe('two');\nexpect(x).toEqual({});\nexpect(z).toBe('zee');",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst test = {\n  foo: {\n    bar: {\n      baz: {\n        a: {\n          x: 1,\n          y: 2,\n          z: 3,\n        },\n      },\n    },\n  },\n};\nconst {\n    foo: {\n      bar: {\n        baz: { a: _ref },\n      },\n    },\n  } = test,\n  { x } = _ref,\n  other = _objectWithoutProperties(_ref, ['x']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst test = {\n  foo: {\n    bar: {\n      baz: {\n        a: {\n          x: 1,\n          y: 2,\n          z: 3,\n        },\n      },\n    },\n  },\n};\nconst _ref = test,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.foo),\n  _obj12 = _objectDestructuringEmpty(_obj11.bar),\n  _obj13 = _objectDestructuringEmpty(_obj12.baz),\n  _obj14 = _objectDestructuringEmpty(_obj13.a),\n  x = _obj14.x,\n  other = _objectWithoutProperties(_obj14, ['x']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst test = {\n  foo: {\n    bar: {\n      baz: {\n        a: {\n          x: 1,\n          y: 2,\n          z: 3,\n        },\n      },\n    },\n  },\n};\nconst _ref = test,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.foo),\n  _obj12 = _objectDestructuringEmpty(_obj11.bar),\n  _obj13 = _objectDestructuringEmpty(_obj12.baz),\n  _obj14 = _objectDestructuringEmpty(_obj13.a),\n  x = _obj14.x,\n  other = _objectWithoutProperties(_obj14, ['x']);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst [\n    a,\n    [_ref],\n    _ref2,\n    [\n      _ref3,\n      {\n        h: [i, _ref4],\n      },\n    ],\n  ] = x,\n  { b } = _ref,\n  c = _objectWithoutProperties(_ref, ['b']),\n  { d } = _ref2,\n  e = _objectWithoutProperties(_ref2, ['d']),\n  { f } = _ref3,\n  g = _objectWithoutProperties(_ref3, ['f']),\n  { j } = _ref4,\n  k = _objectWithoutProperties(_ref4, ['j']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst _ref = x,\n  _arr = _toArray(_ref, 4, false),\n  a = _arr[0],\n  _arr18 = _toArray(_arr[1], 1, false),\n  _obj = _objectDestructuringEmpty(_arr18[0]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']),\n  _obj20 = _objectDestructuringEmpty(_arr[2]),\n  d = _obj20.d,\n  e = _objectWithoutProperties(_obj20, ['d']),\n  _arr21 = _toArray(_arr[3], 2, false),\n  _obj22 = _objectDestructuringEmpty(_arr21[0]),\n  f = _obj22.f,\n  g = _objectWithoutProperties(_obj22, ['f']),\n  _obj23 = _objectDestructuringEmpty(_arr21[1]),\n  _arr24 = _toArray(_obj23.h, 2, false),\n  i = _arr24[0],\n  _obj25 = _objectDestructuringEmpty(_arr24[1]),\n  j = _obj25.j,\n  k = _objectWithoutProperties(_obj25, ['j']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst _ref = x,\n  _arr = _toArray(_ref, 4, false),\n  a = _arr[0],\n  _arr18 = _toArray(_arr[1], 1, false),\n  _obj = _objectDestructuringEmpty(_arr18[0]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']),\n  _obj20 = _objectDestructuringEmpty(_arr[2]),\n  d = _obj20.d,\n  e = _objectWithoutProperties(_obj20, ['d']),\n  _arr21 = _toArray(_arr[3], 2, false),\n  _obj22 = _objectDestructuringEmpty(_arr21[0]),\n  f = _obj22.f,\n  g = _objectWithoutProperties(_obj22, ['f']),\n  _obj23 = _objectDestructuringEmpty(_arr21[1]),\n  _arr24 = _toArray(_obj23.h, 2, false),\n  i = _arr24[0],\n  _obj25 = _objectDestructuringEmpty(_arr24[1]),\n  j = _obj25.j,\n  k = _objectWithoutProperties(_obj25, ['j']);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst _ref = [\n    1,\n    {\n      b: 2,\n      other: 3,\n    },\n  ],\n  [a, _ref2] = _ref,\n  { b } = _ref2,\n  c = _objectWithoutProperties(_ref2, ['b']);\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toStrictEqual({ other: 3 });\nlet _ref3 = [\n    4,\n    {\n      e: 5,\n      other: 6,\n    },\n  ],\n  [d, _ref4] = _ref3,\n  { e } = _ref4,\n  f = _objectWithoutProperties(_ref4, ['e']);\nexpect(d).toBe(4);\nexpect(e).toBe(5);\nexpect(f).toStrictEqual({ other: 6 });\nlet g, h, i;\nvar _ref5;\nvar _ref6;\n(([g, _ref5] = [\n  7,\n  {\n    h: 8,\n    other: 9,\n  },\n]),\n  (_ref6 = _ref5),\n  ({ h } = _ref6),\n  (i = _objectWithoutProperties(_ref6, ['h'])),\n  _ref6);\nexpect(g).toBe(7);\nexpect(h).toBe(8);\nexpect(i).toStrictEqual({ other: 9 });",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref21, _arr22, _obj23;\nconst _ref = [\n    1,\n    {\n      b: 2,\n      other: 3,\n    },\n  ],\n  _arr = _toArray(_ref, 2, false),\n  a = _arr[0],\n  _obj = _objectDestructuringEmpty(_arr[1]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toStrictEqual({ other: 3 });\nlet _ref18 = [\n    4,\n    {\n      e: 5,\n      other: 6,\n    },\n  ],\n  _arr19 = _toArray(_ref18, 2, false),\n  d = _arr19[0],\n  _obj20 = _objectDestructuringEmpty(_arr19[1]),\n  e = _obj20.e,\n  f = _objectWithoutProperties(_obj20, ['e']);\nexpect(d).toBe(4);\nexpect(e).toBe(5);\nexpect(f).toStrictEqual({ other: 6 });\nlet g, h, i;\n((_ref21 = [\n  7,\n  {\n    h: 8,\n    other: 9,\n  },\n]),\n  (_arr22 = _toArray(_ref21, 2, false)),\n  (g = _arr22[0]),\n  (_obj23 = _objectDestructuringEmpty(_arr22[1])),\n  (h = _obj23.h),\n  (i = _objectWithoutProperties(_obj23, ['h'])),\n  _ref21);\nexpect(g).toBe(7);\nexpect(h).toBe(8);\nexpect(i).toStrictEqual({ other: 9 });",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref21, _arr22, _obj23;\nconst _ref = [\n    1,\n    {\n      b: 2,\n      other: 3,\n    },\n  ],\n  _arr = _toArray(_ref, 2, false),\n  a = _arr[0],\n  _obj = _objectDestructuringEmpty(_arr[1]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toStrictEqual({ other: 3 });\nlet _ref18 = [\n    4,\n    {\n      e: 5,\n      other: 6,\n    },\n  ],\n  _arr19 = _toArray(_ref18, 2, false),\n  d = _arr19[0],\n  _obj20 = _objectDestructuringEmpty(_arr19[1]),\n  e = _obj20.e,\n  f = _objectWithoutProperties(_obj20, ['e']);\nexpect(d).toBe(4);\nexpect(e).toBe(5);\nexpect(f).toStrictEqual({ other: 6 });\nlet g, h, i;\n((_ref21 = [\n  7,\n  {\n    h: 8,\n    other: 9,\n  },\n]),\n  (_arr22 = _toArray(_ref21, 2, false)),\n  (g = _arr22[0]),\n  (_obj23 = _objectDestructuringEmpty(_arr22[1])),\n  (h = _obj23.h),\n  (i = _objectWithoutProperties(_obj23, ['h'])),\n  _ref21);\nexpect(g).toBe(7);\nexpect(h).toBe(8);\nexpect(i).toStrictEqual({ other: 9 });",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst [a, _ref] = x,\n  { b } = _ref,\n  c = _objectWithoutProperties(_ref, ['b']);\nlet [d, _ref2] = x,\n  { e } = _ref2,\n  f = _objectWithoutProperties(_ref2, ['e']);\nvar _ref3;\nvar _ref4;\n(([g, _ref3] = x),\n  (_ref4 = _ref3),\n  ({ h } = _ref4),\n  (i = _objectWithoutProperties(_ref4, ['h'])),\n  _ref4);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref18, _arr19, _obj20;\nconst _ref = x,\n  _arr = _toArray(_ref, 2, false),\n  a = _arr[0],\n  _obj = _objectDestructuringEmpty(_arr[1]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\nlet _ref15 = x,\n  _arr16 = _toArray(_ref15, 2, false),\n  d = _arr16[0],\n  _obj17 = _objectDestructuringEmpty(_arr16[1]),\n  e = _obj17.e,\n  f = _objectWithoutProperties(_obj17, ['e']);\n((_ref18 = x),\n  (_arr19 = _toArray(_ref18, 2, false)),\n  (g = _arr19[0]),\n  (_obj20 = _objectDestructuringEmpty(_arr19[1])),\n  (h = _obj20.h),\n  (i = _objectWithoutProperties(_obj20, ['h'])),\n  _ref18);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref18, _arr19, _obj20;\nconst _ref = x,\n  _arr = _toArray(_ref, 2, false),\n  a = _arr[0],\n  _obj = _objectDestructuringEmpty(_arr[1]),\n  b = _obj.b,\n  c = _objectWithoutProperties(_obj, ['b']);\nlet _ref15 = x,\n  _arr16 = _toArray(_ref15, 2, false),\n  d = _arr16[0],\n  _obj17 = _objectDestructuringEmpty(_arr16[1]),\n  e = _obj17.e,\n  f = _objectWithoutProperties(_obj17, ['e']);\n((_ref18 = x),\n  (_arr19 = _toArray(_ref18, 2, false)),\n  (g = _arr19[0]),\n  (_obj20 = _objectDestructuringEmpty(_arr19[1])),\n  (h = _obj20.h),\n  (i = _objectWithoutProperties(_obj20, ['h'])),\n  _ref18);",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _ref3;\nconst {\n  [_ref => {\n    let rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n    let _ref2 = {},\n      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));\n  }]: a,\n  [((_ref3 = {}),\n  ({} = _ref3),\n  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),\n  _ref3)]: c,\n} = {};",
  "var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref12, _obj13;\nconst {\n  [_ref13 => {\n    let rest = _extends({}, (_objectDestructuringEmpty3(_ref13), _ref13));\n    let _ref = {},\n      _obj = _objectDestructuringEmpty(_ref),\n      b = _objectWithoutProperties(_obj, []);\n  }]: a,\n  [((_ref12 = {}),\n  (_obj13 = _objectDestructuringEmpty(_ref12)),\n  (d = _objectWithoutProperties(_obj13, [])),\n  _ref12)]: c,\n} = {};",
  "var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref12, _obj13;\nconst {\n  [_ref13 => {\n    let rest = _extends({}, (_objectDestructuringEmpty3(_ref13), _ref13));\n    let _ref = {},\n      _obj = _objectDestructuringEmpty(_ref),\n      b = _objectWithoutProperties(_obj, []);\n  }]: a,\n  [((_ref12 = {}),\n  (_obj13 = _objectDestructuringEmpty(_ref12)),\n  (d = _objectWithoutProperties(_obj13, [])),\n  _ref12)]: c,\n} = {};",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _ref3;\nconst {\n  a = _ref => {\n    let rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n    let _ref2 = {},\n      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));\n  },\n  c = ((_ref3 = {}),\n  ({} = _ref3),\n  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),\n  _ref3),\n} = {};",
  "var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref12, _obj13;\nconst {\n  a = _ref13 => {\n    let rest = _extends({}, (_objectDestructuringEmpty3(_ref13), _ref13));\n    let _ref = {},\n      _obj = _objectDestructuringEmpty(_ref),\n      b = _objectWithoutProperties(_obj, []);\n  },\n  c = ((_ref12 = {}),\n  (_obj13 = _objectDestructuringEmpty(_ref12)),\n  (d = _objectWithoutProperties(_obj13, [])),\n  _ref12),\n} = {};",
  "var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref12, _obj13;\nconst {\n  a = _ref13 => {\n    let rest = _extends({}, (_objectDestructuringEmpty3(_ref13), _ref13));\n    let _ref = {},\n      _obj = _objectDestructuringEmpty(_ref),\n      b = _objectWithoutProperties(_obj, []);\n  },\n  c = ((_ref12 = {}),\n  (_obj13 = _objectDestructuringEmpty(_ref12)),\n  (d = _objectWithoutProperties(_obj13, [])),\n  _ref12),\n} = {};",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet useState = [{ some: 42 }, () => null];\nlet { 0: _ref, 2: _ref2, 1: setState } = useState,\n  { numeric } = _ref,\n  rest1 = _objectWithoutProperties(_ref, ['numeric']),\n  { str } = _ref2,\n  rest2 = _objectWithoutProperties(_ref2, ['str']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet useState = [{ some: 42 }, () => null];\nlet _ref = useState,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj14 = _objectDestructuringEmpty(_obj[0]),\n  numeric = _obj14.numeric,\n  rest1 = _objectWithoutProperties(_obj14, ['numeric']),\n  _obj15 = _objectDestructuringEmpty(_obj['2']),\n  str = _obj15.str,\n  rest2 = _objectWithoutProperties(_obj15, ['str']),\n  setState = _obj[1];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet useState = [{ some: 42 }, () => null];\nlet _ref = useState,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj14 = _objectDestructuringEmpty(_obj[0]),\n  numeric = _obj14.numeric,\n  rest1 = _objectWithoutProperties(_obj14, ['numeric']),\n  _obj15 = _objectDestructuringEmpty(_obj['2']),\n  str = _obj15.str,\n  rest2 = _objectWithoutProperties(_obj15, ['str']),\n  setState = _obj[1];",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar result = '';\nvar obj = {\n  get foo() {\n    result += 'foo';\n  },\n  a: {\n    get bar() {\n      result += 'bar';\n    },\n  },\n  b: {\n    get baz() {\n      result += 'baz';\n    },\n  },\n};\nvar { a: _ref, b: _ref2 } = obj,\n  bar = _extends({}, (_objectDestructuringEmpty(_ref), _ref)),\n  baz = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2)),\n  foo = _objectWithoutProperties(obj, ['a', 'b']);\nexpect(result).toBe('barbazfoo');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar result = '';\nvar obj = {\n  get foo() {\n    result += 'foo';\n  },\n  a: {\n    get bar() {\n      result += 'bar';\n    },\n  },\n  b: {\n    get baz() {\n      result += 'baz';\n    },\n  },\n};\nvar _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj13 = _objectDestructuringEmpty(_obj.a),\n  bar = _objectWithoutProperties(_obj13, []),\n  _obj14 = _objectDestructuringEmpty(_obj.b),\n  baz = _objectWithoutProperties(_obj14, []),\n  foo = _objectWithoutProperties(_obj, ['a', 'b']);\nexpect(result).toBe('barbazfoo');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar result = '';\nvar obj = {\n  get foo() {\n    result += 'foo';\n  },\n  a: {\n    get bar() {\n      result += 'bar';\n    },\n  },\n  b: {\n    get baz() {\n      result += 'baz';\n    },\n  },\n};\nvar _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj13 = _objectDestructuringEmpty(_obj.a),\n  bar = _objectWithoutProperties(_obj13, []),\n  _obj14 = _objectDestructuringEmpty(_obj.b),\n  baz = _objectWithoutProperties(_obj14, []),\n  foo = _objectWithoutProperties(_obj, ['a', 'b']);\nexpect(result).toBe('barbazfoo');",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst { a: _ref, b: _ref2 } = obj,\n  bar = _extends({}, (_objectDestructuringEmpty(_ref), _ref)),\n  baz = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2)),\n  foo = _objectWithoutProperties(obj, ['a', 'b']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.a),\n  bar = _objectWithoutProperties(_obj11, []),\n  _obj12 = _objectDestructuringEmpty(_obj.b),\n  baz = _objectWithoutProperties(_obj12, []),\n  foo = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst _ref = obj,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.a),\n  bar = _objectWithoutProperties(_obj11, []),\n  _obj12 = _objectDestructuringEmpty(_obj.b),\n  baz = _objectWithoutProperties(_obj12, []),\n  foo = _objectWithoutProperties(_obj, ['a', 'b']);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst defunct = {\n  outer: {\n    inner: {\n      three: 'three',\n      four: 'four',\n    },\n  },\n};\nconst {\n    outer: { inner: _ref },\n  } = defunct,\n  { three } = _ref,\n  other = _objectWithoutProperties(_ref, ['three']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst defunct = {\n  outer: {\n    inner: {\n      three: 'three',\n      four: 'four',\n    },\n  },\n};\nconst _ref = defunct,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.outer),\n  _obj12 = _objectDestructuringEmpty(_obj11.inner),\n  three = _obj12.three,\n  other = _objectWithoutProperties(_obj12, ['three']);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst defunct = {\n  outer: {\n    inner: {\n      three: 'three',\n      four: 'four',\n    },\n  },\n};\nconst _ref = defunct,\n  _obj = _objectDestructuringEmpty(_ref),\n  _obj11 = _objectDestructuringEmpty(_obj.outer),\n  _obj12 = _objectDestructuringEmpty(_obj11.inner),\n  three = _obj12.three,\n  other = _objectWithoutProperties(_obj12, ['three']);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nconst a = {\n  3: 'three',\n  foo: 'bar',\n};\nconst { [3]: omit } = a,\n  rest = _objectWithoutProperties(a, ['3']);\nexpect(rest).toEqual({ foo: 'bar' });\nexpect(omit).toBe('three');\nconst [k1, k2, k3, k4, k5] = [\n  null,\n  undefined,\n  true,\n  false,\n  {\n    toString() {\n      return 'warrior';\n    },\n  },\n];\nconst c = {\n  [k1]: '1',\n  [k2]: '2',\n  [k3]: '3',\n  [k4]: '4',\n  [k5]: '5',\n};\nconst { [k1]: v1, [k2]: v2, [k3]: v3, [k4]: v4, [k5]: v5 } = c,\n  vrest = _objectWithoutProperties(c, [k1, k2, k3, k4, k5].map(_toPropertyKey));\nexpect(v1).toBe('1');\nexpect(v2).toBe('2');\nexpect(v3).toBe('3');\nexpect(v4).toBe('4');\nexpect(v5).toBe('5');\nexpect(vrest).toEqual({});\n// shouldn't convert symbols to strings\nconst sx = Symbol();\nconst sy = Symbol();\nconst d = {\n  [sx]: 'sx',\n  [sy]: 'sy',\n};\nconst { [sx]: dx, [sy]: dy } = d;\nexpect(dx).toBe('sx');\nexpect(dy).toBe('sy');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst a = {\n  3: 'three',\n  foo: 'bar',\n};\nconst _ref = a,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(3),\n  omit = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(rest).toEqual({ foo: 'bar' });\nexpect(omit).toBe('three');\nconst [k1, k2, k3, k4, k5] = [\n  null,\n  undefined,\n  true,\n  false,\n  {\n    toString() {\n      return 'warrior';\n    },\n  },\n];\nconst c = {\n  [k1]: '1',\n  [k2]: '2',\n  [k3]: '3',\n  [k4]: '4',\n  [k5]: '5',\n};\nconst _ref29 = c,\n  _obj30 = _objectDestructuringEmpty(_ref29),\n  _key31 = _toPropertyKey(k1),\n  v1 = _obj30[_key31],\n  _key32 = _toPropertyKey(k2),\n  v2 = _obj30[_key32],\n  _key33 = _toPropertyKey(k3),\n  v3 = _obj30[_key33],\n  _key34 = _toPropertyKey(k4),\n  v4 = _obj30[_key34],\n  _key35 = _toPropertyKey(k5),\n  v5 = _obj30[_key35],\n  vrest = _objectWithoutProperties(_obj30, [_key31, _key32, _key33, _key34, _key35]);\nexpect(v1).toBe('1');\nexpect(v2).toBe('2');\nexpect(v3).toBe('3');\nexpect(v4).toBe('4');\nexpect(v5).toBe('5');\nexpect(vrest).toEqual({});\n// shouldn't convert symbols to strings\nconst sx = Symbol();\nconst sy = Symbol();\nconst d = {\n  [sx]: 'sx',\n  [sy]: 'sy',\n};\nconst { [sx]: dx, [sy]: dy } = d;\nexpect(dx).toBe('sx');\nexpect(dy).toBe('sy');",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst a = {\n  3: 'three',\n  foo: 'bar',\n};\nconst _ref = a,\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(3),\n  omit = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\nexpect(rest).toEqual({ foo: 'bar' });\nexpect(omit).toBe('three');\nconst [k1, k2, k3, k4, k5] = [\n  null,\n  undefined,\n  true,\n  false,\n  {\n    toString() {\n      return 'warrior';\n    },\n  },\n];\nconst c = {\n  [k1]: '1',\n  [k2]: '2',\n  [k3]: '3',\n  [k4]: '4',\n  [k5]: '5',\n};\nconst _ref29 = c,\n  _obj30 = _objectDestructuringEmpty(_ref29),\n  _key31 = _toPropertyKey(k1),\n  v1 = _obj30[_key31],\n  _key32 = _toPropertyKey(k2),\n  v2 = _obj30[_key32],\n  _key33 = _toPropertyKey(k3),\n  v3 = _obj30[_key33],\n  _key34 = _toPropertyKey(k4),\n  v4 = _obj30[_key34],\n  _key35 = _toPropertyKey(k5),\n  v5 = _obj30[_key35],\n  vrest = _objectWithoutProperties(_obj30, [_key31, _key32, _key33, _key34, _key35]);\nexpect(v1).toBe('1');\nexpect(v2).toBe('2');\nexpect(v3).toBe('3');\nexpect(v4).toBe('4');\nexpect(v5).toBe('5');\nexpect(vrest).toEqual({});\n// shouldn't convert symbols to strings\nconst sx = Symbol();\nconst sy = Symbol();\nconst d = {\n  [sx]: 'sx',\n  [sy]: 'sy',\n};\nconst { [sx]: dx, [sy]: dy } = d;\nexpect(dx).toBe('sx');\nexpect(dy).toBe('sy');",
  "const _excluded = ['x'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nexpect(() => {\n  var _ref = null,\n    x = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n}).toThrow(/null/);\nexpect(() => {\n  var _ref2 = null,\n    { x } = _ref2,\n    y = _objectWithoutProperties(_ref2, _excluded);\n}).toThrow(/null/);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nexpect(() => {\n  var _ref = null,\n    _obj = _objectDestructuringEmpty(_ref),\n    x = _objectWithoutProperties(_obj, []);\n}).toThrow(/null/);\nexpect(() => {\n  var _ref10 = null,\n    _obj11 = _objectDestructuringEmpty(_ref10),\n    x = _obj11.x,\n    y = _objectWithoutProperties(_obj11, ['x']);\n}).toThrow(/null/);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nexpect(() => {\n  var _ref = null,\n    _obj = _objectDestructuringEmpty(_ref),\n    x = _objectWithoutProperties(_obj, []);\n}).toThrow(/null/);\nexpect(() => {\n  var _ref10 = null,\n    _obj11 = _objectDestructuringEmpty(_ref10),\n    x = _obj11.x,\n    y = _objectWithoutProperties(_obj11, ['x']);\n}).toThrow(/null/);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ = {\n    1: {\n      a: 1,\n      y: 1,\n    },\n  },\n  { [key++]: _ref } = _,\n  { y } = _ref,\n  x = _objectWithoutProperties(_ref, ['y']);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _$ = {\n    2: {\n      y: 2,\n      z: 3,\n    },\n    3: {\n      y: 4,\n      z: 6,\n    },\n  },\n  { [++key]: _ref2, [++key]: _ref3 } = _$,\n  { y } = _ref2,\n  rest_y = _objectWithoutProperties(_ref2, ['y']),\n  { z } = _ref3,\n  rest_z = _objectWithoutProperties(_ref3, ['z']);\nexpect(y).toBe(2);\nexpect(rest_y).toEqual({ z: 3 });\nexpect(z).toBe(6);\nexpect(rest_z).toEqual({ y: 4 });\nexpect(key).toBe(3);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: {\n      a: 1,\n      y: 1,\n    },\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = key++,\n  _obj15 = _objectDestructuringEmpty(_obj[_key]),\n  y = _obj15.y,\n  x = _objectWithoutProperties(_obj15, ['y']);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _ref16 = {\n    2: {\n      y: 2,\n      z: 3,\n    },\n    3: {\n      y: 4,\n      z: 6,\n    },\n  },\n  _obj17 = _objectDestructuringEmpty(_ref16),\n  _key18 = ++key,\n  _obj19 = _objectDestructuringEmpty(_obj17[_key18]),\n  y = _obj19.y,\n  rest_y = _objectWithoutProperties(_obj19, ['y']),\n  _key20 = ++key,\n  _obj21 = _objectDestructuringEmpty(_obj17[_key20]),\n  z = _obj21.z,\n  rest_z = _objectWithoutProperties(_obj21, ['z']);\nexpect(y).toBe(2);\nexpect(rest_y).toEqual({ z: 3 });\nexpect(z).toBe(6);\nexpect(rest_z).toEqual({ y: 4 });\nexpect(key).toBe(3);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar key, x, y, z;\n// impure\nkey = 1;\nvar _ref = {\n    1: {\n      a: 1,\n      y: 1,\n    },\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = key++,\n  _obj15 = _objectDestructuringEmpty(_obj[_key]),\n  y = _obj15.y,\n  x = _objectWithoutProperties(_obj15, ['y']);\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n// takes care of the order\nkey = 1;\nvar _ref16 = {\n    2: {\n      y: 2,\n      z: 3,\n    },\n    3: {\n      y: 4,\n      z: 6,\n    },\n  },\n  _obj17 = _objectDestructuringEmpty(_ref16),\n  _key18 = ++key,\n  _obj19 = _objectDestructuringEmpty(_obj17[_key18]),\n  y = _obj19.y,\n  rest_y = _objectWithoutProperties(_obj19, ['y']),\n  _key20 = ++key,\n  _obj21 = _objectDestructuringEmpty(_obj17[_key20]),\n  z = _obj21.z,\n  rest_z = _objectWithoutProperties(_obj21, ['z']);\nexpect(y).toBe(2);\nexpect(rest_y).toEqual({ z: 3 });\nexpect(z).toBe(6);\nexpect(rest_z).toEqual({ y: 4 });\nexpect(key).toBe(3);",
  'function sum(x, y, z) {\n  return x + y + z;\n}\nfunction test() {\n  var args = arguments;\n  return sum(...args);\n}\nexpect(test(1, 2, 3)).toBe(6);',
  "const _excluded = ['X'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\n(_ref, a = R) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n};\n(_ref2, { a = { Y } }) => {\n  let { X: Y } = _ref2,\n    R = _objectWithoutProperties(_ref2, _excluded);\n};\n(a = R, _ref3) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));\n};\n(_ref4, e, c = 2, a = R, f = q) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref4), _ref4));\n  let q;\n};\n(_ref5, a = f(R)) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref5), _ref5));\n};\n(_ref6, { [R.key]: a = 42 }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref6), _ref6));\n};\n(_ref7, { a = { R: b } }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7));\n};\n(_ref8, { a = R => R } = { b: R => R }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref8), _ref8));\n};",
  "const _excluded = ['X'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\n(_ref, a = R) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n};\n(_ref2, { a = { Y } }) => {\n  let { X: Y } = _ref2,\n    R = _objectWithoutProperties(_ref2, _excluded);\n};\n(a = R, _ref3) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));\n};\n(_ref4, e, c = 2, a = R, f = q) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref4), _ref4));\n  let q;\n};\n(_ref5, a = f(R)) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref5), _ref5));\n};\n(_ref6, { [R.key]: a = 42 }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref6), _ref6));\n};\n(_ref7, { a = { R: b } }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7));\n};\n(_ref8, { a = R => R } = { b: R => R }) => {\n  let R = _extends({}, (_objectDestructuringEmpty(_ref8), _ref8));\n};",
  "const _excluded = ['a1'],\n  _excluded2 = ['a2', 'b2'],\n  _excluded3 = ['a5'],\n  _excluded4 = ['a3'],\n  _excluded5 = ['ba1'],\n  _excluded6 = ['a3', 'b2'],\n  _excluded7 = ['ba1'],\n  _excluded8 = ['a1'],\n  _excluded9 = ['a1'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nfunction a(_ref) {\n  let a34 = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n}\nfunction a2(_ref2) {\n  let { a1 } = _ref2,\n    b1 = _objectWithoutProperties(_ref2, _excluded);\n}\nfunction a3(_ref3) {\n  let { a2, b2 } = _ref3,\n    c2 = _objectWithoutProperties(_ref3, _excluded2);\n}\nfunction a4(_ref4, _ref5) {\n  let { a5 } = _ref5,\n    c5 = _objectWithoutProperties(_ref5, _excluded3);\n  let { a3 } = _ref4,\n    c3 = _objectWithoutProperties(_ref4, _excluded4);\n}\nfunction a5(_ref6) {\n  let { a3, b2: _ref7 } = _ref6,\n    { ba1 } = _ref7,\n    ba2 = _objectWithoutProperties(_ref7, _excluded5),\n    c3 = _objectWithoutProperties(_ref6, _excluded6);\n}\nfunction a6(_ref8) {\n  let { a3, b2: _ref9 } = _ref8,\n    { ba1 } = _ref9,\n    ba2 = _objectWithoutProperties(_ref9, _excluded7);\n}\nfunction a7(_ref10 = {}) {\n  let { a1 = 1 } = _ref10,\n    b1 = _objectWithoutProperties(_ref10, _excluded8);\n}\nfunction a8([_ref11]) {\n  let a1 = _extends({}, (_objectDestructuringEmpty(_ref11), _ref11));\n}\nfunction a9([_ref12]) {\n  let { a1 } = _ref12,\n    a2 = _objectWithoutProperties(_ref12, _excluded9);\n}\nfunction a10([a1, _ref13]) {\n  let a2 = _extends({}, (_objectDestructuringEmpty(_ref13), _ref13));\n}\n// Unchanged\nfunction b(a) {}\nfunction b2(a, ...b) {}\nfunction b3({ b }) {}",
  "const _excluded = ['a1'],\n  _excluded2 = ['a2', 'b2'],\n  _excluded3 = ['a5'],\n  _excluded4 = ['a3'],\n  _excluded5 = ['ba1'],\n  _excluded6 = ['a3', 'b2'],\n  _excluded7 = ['ba1'],\n  _excluded8 = ['a1'],\n  _excluded9 = ['a1'];\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\nfunction a(_ref) {\n  let a34 = _extends({}, (_objectDestructuringEmpty(_ref), _ref));\n}\nfunction a2(_ref2) {\n  let { a1 } = _ref2,\n    b1 = _objectWithoutProperties(_ref2, _excluded);\n}\nfunction a3(_ref3) {\n  let { a2, b2 } = _ref3,\n    c2 = _objectWithoutProperties(_ref3, _excluded2);\n}\nfunction a4(_ref4, _ref5) {\n  let { a5 } = _ref5,\n    c5 = _objectWithoutProperties(_ref5, _excluded3);\n  let { a3 } = _ref4,\n    c3 = _objectWithoutProperties(_ref4, _excluded4);\n}\nfunction a5(_ref6) {\n  let { a3, b2: _ref7 } = _ref6,\n    { ba1 } = _ref7,\n    ba2 = _objectWithoutProperties(_ref7, _excluded5),\n    c3 = _objectWithoutProperties(_ref6, _excluded6);\n}\nfunction a6(_ref8) {\n  let { a3, b2: _ref9 } = _ref8,\n    { ba1 } = _ref9,\n    ba2 = _objectWithoutProperties(_ref9, _excluded7);\n}\nfunction a7(_ref10 = {}) {\n  let { a1 = 1 } = _ref10,\n    b1 = _objectWithoutProperties(_ref10, _excluded8);\n}\nfunction a8([_ref11]) {\n  let a1 = _extends({}, (_objectDestructuringEmpty(_ref11), _ref11));\n}\nfunction a9([_ref12]) {\n  let { a1 } = _ref12,\n    a2 = _objectWithoutProperties(_ref12, _excluded9);\n}\nfunction a10([a1, _ref13]) {\n  let a2 = _extends({}, (_objectDestructuringEmpty(_ref13), _ref13));\n}\n// Unchanged\nfunction b(a) {}\nfunction b2(a, ...b) {}\nfunction b3({ b }) {}",
  "const _excluded = ['excluded', 'excluded2', 'used', 'used2'],\n  _excluded2 = ['unused'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _c;\n// should not remove when destructuring into existing bindings\n((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));\nclass Comp extends React.Component {\n  render() {\n    const _this$props = this.props,\n      { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,\n      props = _objectWithoutProperties(_this$props, _excluded);\n    console.log(used, usedRenamed);\n    return React.createElement('input', props);\n  }\n}\nfunction smth(_ref) {\n  let { unused } = _ref,\n    rest = _objectWithoutProperties(_ref, _excluded2);\n  call(rest);\n}",
  "const _excluded = ['unused'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _ref, _obj;\n// should not remove when destructuring into existing bindings\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nclass Comp extends React.Component {\n  render() {\n    const _ref17 = this.props,\n      _obj18 = _objectDestructuringEmpty(_ref17),\n      excluded = _obj18.excluded,\n      excludedRenamed = _obj18.excluded2,\n      used = _obj18.used,\n      usedRenamed = _obj18.used2,\n      props = _objectWithoutProperties(_obj18, ['excluded', 'excluded2', 'used', 'used2']);\n    console.log(used, usedRenamed);\n    return React.createElement('input', props);\n  }\n}\nfunction smth(_ref18) {\n  let { unused } = _ref18,\n    rest = _objectWithoutProperties3(_ref18, _excluded);\n  call(rest);\n}",
  "const _excluded = ['unused'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _ref, _obj;\n// should not remove when destructuring into existing bindings\n((_ref = c2),\n  (_obj = _objectDestructuringEmpty(_ref)),\n  (a2 = _obj.a2),\n  (b2 = _objectWithoutProperties(_obj, ['a2'])),\n  _ref);\nclass Comp extends React.Component {\n  render() {\n    const _ref17 = this.props,\n      _obj18 = _objectDestructuringEmpty(_ref17),\n      excluded = _obj18.excluded,\n      excludedRenamed = _obj18.excluded2,\n      used = _obj18.used,\n      usedRenamed = _obj18.used2,\n      props = _objectWithoutProperties(_obj18, ['excluded', 'excluded2', 'used', 'used2']);\n    console.log(used, usedRenamed);\n    return React.createElement('input', props);\n  }\n}\nfunction smth(_ref18) {\n  let { unused } = _ref18,\n    rest = _objectWithoutProperties3(_ref18, _excluded);\n  call(rest);\n}",
  "var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nvar _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst sym = Symbol('test');\nconst sym2 = Symbol('not enumerable');\nconst src = { a: 'string' };\nObject.defineProperty(src, 'b', { value: 'not enumerable' });\nObject.defineProperty(src, sym, {\n  enumerable: true,\n  value: 'symbol',\n});\nObject.defineProperty(src, sym2, { value: 'not enumerable' });\nconst rest = _extends({}, (_objectDestructuringEmpty(src), src));\nexpect(rest[sym]).toBe('symbol');\nexpect(rest.a).toBe('string');\nexpect(Object.getOwnPropertyNames(rest)).toEqual(['a']);\nexpect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);\nconst { [sym]: dst } = src,\n  noSym = _objectWithoutProperties(src, [sym].map(_toPropertyKey));\nexpect(dst).toBe('symbol');\nexpect(noSym.a).toBe('string');\nexpect(Object.getOwnPropertySymbols(noSym)).toEqual([]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst sym = Symbol('test');\nconst sym2 = Symbol('not enumerable');\nconst src = { a: 'string' };\nObject.defineProperty(src, 'b', { value: 'not enumerable' });\nObject.defineProperty(src, sym, {\n  enumerable: true,\n  value: 'symbol',\n});\nObject.defineProperty(src, sym2, { value: 'not enumerable' });\nconst _ref = src,\n  _obj = _objectDestructuringEmpty(_ref),\n  rest = _objectWithoutProperties(_obj, []);\nexpect(rest[sym]).toBe('symbol');\nexpect(rest.a).toBe('string');\nexpect(Object.getOwnPropertyNames(rest)).toEqual(['a']);\nexpect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);\nconst _ref14 = src,\n  _obj15 = _objectDestructuringEmpty(_ref14),\n  _key = _toPropertyKey(sym),\n  dst = _obj15[_key],\n  noSym = _objectWithoutProperties(_obj15, [_key]);\nexpect(dst).toBe('symbol');\nexpect(noSym.a).toBe('string');\nexpect(Object.getOwnPropertySymbols(noSym)).toEqual([]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst sym = Symbol('test');\nconst sym2 = Symbol('not enumerable');\nconst src = { a: 'string' };\nObject.defineProperty(src, 'b', { value: 'not enumerable' });\nObject.defineProperty(src, sym, {\n  enumerable: true,\n  value: 'symbol',\n});\nObject.defineProperty(src, sym2, { value: 'not enumerable' });\nconst _ref = src,\n  _obj = _objectDestructuringEmpty(_ref),\n  rest = _objectWithoutProperties(_obj, []);\nexpect(rest[sym]).toBe('symbol');\nexpect(rest.a).toBe('string');\nexpect(Object.getOwnPropertyNames(rest)).toEqual(['a']);\nexpect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);\nconst _ref14 = src,\n  _obj15 = _objectDestructuringEmpty(_ref14),\n  _key = _toPropertyKey(sym),\n  dst = _obj15[_key],\n  noSym = _objectWithoutProperties(_obj15, [_key]);\nexpect(dst).toBe('symbol');\nexpect(noSym.a).toBe('string');\nexpect(Object.getOwnPropertySymbols(noSym)).toEqual([]);",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet _ref = {},\n  _Symbol$for = Symbol.for('foo'),\n  { [_Symbol$for]: foo } = _ref,\n  rest = _objectWithoutProperties(_ref, [_Symbol$for].map(_toPropertyKey));\nvar _ref2,\n  _Symbol$for2 = Symbol.for('foo');\n((_ref2 = {}),\n  ({ [_Symbol$for2]: foo } = _ref2),\n  (rest = _objectWithoutProperties(_ref2, [_Symbol$for2].map(_toPropertyKey))));\nvar _ref3,\n  _Symbol$for3 = Symbol.for('foo');\nif (\n  ((_ref3 = {}),\n  ({ [_Symbol$for3]: foo } = _ref3),\n  (rest = _objectWithoutProperties(_ref3, [_Symbol$for3].map(_toPropertyKey))),\n  _ref3)\n) {\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref11, _obj12, _key13, _ref14, _obj15, _key16;\nlet _ref = {},\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(Symbol.for('foo')),\n  foo = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\n((_ref11 = {}),\n  (_obj12 = _objectDestructuringEmpty(_ref11)),\n  (_key13 = _toPropertyKey(Symbol.for('foo'))),\n  (foo = _obj12[_key13]),\n  (rest = _objectWithoutProperties(_obj12, [_key13])),\n  _ref11);\nif (\n  ((_ref14 = {}),\n  (_obj15 = _objectDestructuringEmpty(_ref14)),\n  (_key16 = _toPropertyKey(Symbol.for('foo'))),\n  (foo = _obj15[_key16]),\n  (rest = _objectWithoutProperties(_obj15, [_key16])),\n  _ref14)\n) {\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nvar _ref11, _obj12, _key13, _ref14, _obj15, _key16;\nlet _ref = {},\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = _toPropertyKey(Symbol.for('foo')),\n  foo = _obj[_key],\n  rest = _objectWithoutProperties(_obj, [_key]);\n((_ref11 = {}),\n  (_obj12 = _objectDestructuringEmpty(_ref11)),\n  (_key13 = _toPropertyKey(Symbol.for('foo'))),\n  (foo = _obj12[_key13]),\n  (rest = _objectWithoutProperties(_obj12, [_key13])),\n  _ref11);\nif (\n  ((_ref14 = {}),\n  (_obj15 = _objectDestructuringEmpty(_ref14)),\n  (_key16 = _toPropertyKey(Symbol.for('foo'))),\n  (foo = _obj15[_key16]),\n  (rest = _objectWithoutProperties(_obj15, [_key16])),\n  _ref14)\n) {\n}",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst example = () => {\n  const input = {};\n  const foo = 'foo';\n  var _input,\n    _ref = `${foo}_bar`;\n  ((_input = input),\n    ({ [_ref]: country } = _input),\n    (rest = _objectWithoutProperties(_input, [_ref].map(_toPropertyKey))));\n};",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst example = () => {\n  var _ref, _obj, _key;\n  const input = {};\n  const foo = 'foo';\n  ((_ref = input),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(`${foo}_bar`)),\n    (country = _obj[_key]),\n    (rest = _objectWithoutProperties(_obj, [_key])),\n    _ref);\n};",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst example = () => {\n  var _ref, _obj, _key;\n  const input = {};\n  const foo = 'foo';\n  ((_ref = input),\n    (_obj = _objectDestructuringEmpty(_ref)),\n    (_key = _toPropertyKey(`${foo}_bar`)),\n    (country = _obj[_key]),\n    (rest = _objectWithoutProperties(_obj, [_key])),\n    _ref);\n};",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst input = {};\nconst _ref = prefix + 'state',\n  _ref2 = `${prefix}consents`,\n  {\n    given_name: givenName,\n    last_name: lastName,\n    [`country`]: country,\n    [_ref]: state,\n    [_ref2]: consents,\n  } = input,\n  rest = _objectWithoutProperties(\n    input,\n    ['given_name', 'last_name', `country`, _ref, _ref2].map(_toPropertyKey),\n  );",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _ref = input,\n  _obj = _objectDestructuringEmpty(_ref),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  _key16 = _toPropertyKey(prefix + 'state'),\n  state = _obj[_key16],\n  _key17 = _toPropertyKey(`${prefix}consents`),\n  consents = _obj[_key17],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key, _key16, _key17]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _ref = input,\n  _obj = _objectDestructuringEmpty(_ref),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  _key16 = _toPropertyKey(prefix + 'state'),\n  state = _obj[_key16],\n  _key17 = _toPropertyKey(`${prefix}consents`),\n  consents = _obj[_key17],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key, _key16, _key17]);",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst input = {};\nconst { given_name: givenName, last_name: lastName, [`country`]: country } = input,\n  rest = _objectWithoutProperties(input, ['given_name', 'last_name', `country`]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _ref = input,\n  _obj = _objectDestructuringEmpty(_ref),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst input = {};\nconst _ref = input,\n  _obj = _objectDestructuringEmpty(_ref),\n  givenName = _obj.given_name,\n  lastName = _obj['last_name'],\n  _key = _toPropertyKey(`country`),\n  country = _obj[_key],\n  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nconst _z = z(),\n  {\n    x15: [...{ ...y15 }],\n  } = _z;\nlet { x: _ref, y: _ref2 } = complex,\n  { a: xa, [d]: f } = _ref,\n  asdf = _objectWithoutProperties(_ref, ['a', d].map(_toPropertyKey)),\n  d = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2)),\n  g = _objectWithoutProperties(complex, ['x', 'y']);\nlet _z2 = z(),\n  { x4: _ref3 } = _z2,\n  y4 = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));\nlet _z3 = z(),\n  { x5: _ref4 } = _z3,\n  { w5 } = _ref4,\n  y5 = _objectWithoutProperties(_ref4, ['w5']);\nlet _z4 = z(),\n  {\n    x6: { w6: _ref5 },\n  } = _z4,\n  { a6 } = _ref5,\n  y6 = _objectWithoutProperties(_ref5, ['a6']);\nlet _z5 = z(),\n  {\n    x7: { e7, r7 },\n    q7: { w7: _ref6 },\n  } = _z5,\n  { a7 } = _ref6,\n  y7 = _objectWithoutProperties(_ref6, ['a7']);\nlet _z6 = z(),\n  { x8 } = _z6,\n  y8 = _objectWithoutProperties(_z6, ['x8']);\nlet _z7 = z(),\n  {\n    x9: { w9: _ref7 },\n    x10: _ref8,\n  } = _z7,\n  { a9 } = _ref7,\n  y9 = _objectWithoutProperties(_ref7, ['a9']),\n  { a10 } = _ref8,\n  y10 = _objectWithoutProperties(_ref8, ['a10']);\nlet _z8 = z(),\n  {\n    x11: [_ref9],\n  } = _z8,\n  { w11 } = _ref9,\n  z11 = _objectWithoutProperties(_ref9, ['w11']);\nlet _z9 = z(),\n  {\n    x12: [{ a12, b12 }, _ref10],\n  } = _z9,\n  { c12 } = _ref10,\n  d12 = _objectWithoutProperties(_ref10, ['c12']);\nlet _z10 = z(),\n  {\n    x13: [, _ref11],\n  } = _z10,\n  { c13 } = _ref11,\n  d13 = _objectWithoutProperties(_ref11, ['c13']);\nconst _z11 = z(),\n  {\n    x14: [...{ q14, ...y14 }],\n  } = _z11;\nconst _z12 = z(),\n  {\n    x15: [...{ ...y16 }],\n  } = _z12;\nconst {\n  x16: [],\n} = z();\nconst [...[...y17]] = z();\nconst _z13 = z(),\n  [...{ ...y18 }] = _z13;\nconst _z14 = z(),\n  [...{ a19, ...y19 }] = _z14;\nconst _z15 = z(),\n  { x20: _ref12 = {} } = _z15,\n  y20 = _extends({}, (_objectDestructuringEmpty(_ref12), _ref12));\nconst _z16 = z(),\n  { x22: _ref13 = {} } = _z16,\n  { q22 } = _ref13,\n  y22 = _objectWithoutProperties(_ref13, ['q22']);\nconst [[...y23] = []] = z();\nconst _z17 = z(),\n  [_ref14 = []] = _z17,\n  y24 = _extends({}, (_objectDestructuringEmpty(_ref14), _ref14));\nconst { x25: [...y25] = [] } = z();\nconst { x26: [q26, ...y26] = [] } = z();\nconst {} = {};\nconst [, , x27] = z();\nconst _z18 = z(),\n  {\n    x28: [, , _ref15],\n  } = _z18,\n  y28 = _extends({}, (_objectDestructuringEmpty(_ref15), _ref15));\nconst _z19 = z(),\n  {\n    x29: [, , _ref16],\n  } = _z19,\n  { q29 } = _ref16,\n  y29 = _objectWithoutProperties(_ref16, ['q29']);\nconst _z20 = z(),\n  [, , _ref17] = _z20,\n  { y30 } = _ref17,\n  x30 = _objectWithoutProperties(_ref17, ['y30']);\nconst _z21 = z(),\n  [, , _ref18] = _z21,\n  x31 = _extends({}, (_objectDestructuringEmpty(_ref18), _ref18));\nconst _z22 = z(),\n  {\n    x32: {},\n    w32: _ref19,\n  } = _z22,\n  y32 = _extends({}, (_objectDestructuringEmpty(_ref19), _ref19));\nconst _z23 = z(),\n  [, , {}, _ref20] = _z23,\n  q32 = _extends({}, (_objectDestructuringEmpty(_ref20), _ref20));\nconst _z24 = z(),\n  y33 = _extends({}, (_objectDestructuringEmpty(_z24), _z24));",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst _ref = z(),\n  _obj = _objectDestructuringEmpty(_ref),\n  _arr = _toArray(_obj.x15, 0, true),\n  _obj63 = _objectDestructuringEmpty(_arr.slice(0)),\n  y15 = _objectWithoutProperties(_obj63, []);\nlet _ref64 = complex,\n  _obj65 = _objectDestructuringEmpty(_ref64),\n  _obj66 = _objectDestructuringEmpty(_obj65.x),\n  xa = _obj66.a,\n  _key = _toPropertyKey(d),\n  f = _obj66[_key],\n  asdf = _objectWithoutProperties(_obj66, ['a', _key]),\n  _obj68 = _objectDestructuringEmpty(_obj65.y),\n  d = _objectWithoutProperties(_obj68, []),\n  g = _objectWithoutProperties(_obj65, ['x', 'y']);\nlet _ref69 = z(),\n  _obj70 = _objectDestructuringEmpty(_ref69),\n  _obj71 = _objectDestructuringEmpty(_obj70.x4),\n  y4 = _objectWithoutProperties(_obj71, []);\nlet _ref72 = z(),\n  _obj73 = _objectDestructuringEmpty(_ref72),\n  _obj74 = _objectDestructuringEmpty(_obj73.x5),\n  w5 = _obj74.w5,\n  y5 = _objectWithoutProperties(_obj74, ['w5']);\nlet _ref75 = z(),\n  _obj76 = _objectDestructuringEmpty(_ref75),\n  _obj77 = _objectDestructuringEmpty(_obj76.x6),\n  _obj78 = _objectDestructuringEmpty(_obj77.w6),\n  a6 = _obj78.a6,\n  y6 = _objectWithoutProperties(_obj78, ['a6']);\nlet _ref79 = z(),\n  _obj80 = _objectDestructuringEmpty(_ref79),\n  _obj81 = _objectDestructuringEmpty(_obj80.x7),\n  e7 = _obj81.e7,\n  r7 = _obj81.r7,\n  _obj82 = _objectDestructuringEmpty(_obj80.q7),\n  _obj83 = _objectDestructuringEmpty(_obj82.w7),\n  a7 = _obj83.a7,\n  y7 = _objectWithoutProperties(_obj83, ['a7']);\nlet _ref84 = z(),\n  _obj85 = _objectDestructuringEmpty(_ref84),\n  x8 = _obj85.x8,\n  y8 = _objectWithoutProperties(_obj85, ['x8']);\nlet _ref86 = z(),\n  _obj87 = _objectDestructuringEmpty(_ref86),\n  _obj88 = _objectDestructuringEmpty(_obj87.x9),\n  _obj89 = _objectDestructuringEmpty(_obj88.w9),\n  a9 = _obj89.a9,\n  y9 = _objectWithoutProperties(_obj89, ['a9']),\n  _obj90 = _objectDestructuringEmpty(_obj87.x10),\n  a10 = _obj90.a10,\n  y10 = _objectWithoutProperties(_obj90, ['a10']);\nlet _ref91 = z(),\n  _obj92 = _objectDestructuringEmpty(_ref91),\n  _arr93 = _toArray(_obj92.x11, 1, false),\n  _obj94 = _objectDestructuringEmpty(_arr93[0]),\n  w11 = _obj94.w11,\n  z11 = _objectWithoutProperties(_obj94, ['w11']);\nlet _ref95 = z(),\n  _obj96 = _objectDestructuringEmpty(_ref95),\n  _arr97 = _toArray(_obj96.x12, 2, false),\n  _obj98 = _objectDestructuringEmpty(_arr97[0]),\n  a12 = _obj98.a12,\n  b12 = _obj98.b12,\n  _obj99 = _objectDestructuringEmpty(_arr97[1]),\n  c12 = _obj99.c12,\n  d12 = _objectWithoutProperties(_obj99, ['c12']);\nlet _ref100 = z(),\n  _obj101 = _objectDestructuringEmpty(_ref100),\n  _arr102 = _toArray(_obj101.x13, 2, false),\n  _obj103 = _objectDestructuringEmpty(_arr102[1]),\n  c13 = _obj103.c13,\n  d13 = _objectWithoutProperties(_obj103, ['c13']);\nconst _ref104 = z(),\n  _obj105 = _objectDestructuringEmpty(_ref104),\n  _arr106 = _toArray(_obj105.x14, 0, true),\n  _obj107 = _objectDestructuringEmpty(_arr106.slice(0)),\n  q14 = _obj107.q14,\n  y14 = _objectWithoutProperties(_obj107, ['q14']);\nconst _ref108 = z(),\n  _obj109 = _objectDestructuringEmpty(_ref108),\n  _arr110 = _toArray(_obj109.x15, 0, true),\n  _obj111 = _objectDestructuringEmpty(_arr110.slice(0)),\n  y16 = _objectWithoutProperties(_obj111, []);\nconst {\n  x16: [],\n} = z();\nconst [...[...y17]] = z();\nconst _ref112 = z(),\n  _arr113 = _toArray(_ref112, 0, true),\n  _obj114 = _objectDestructuringEmpty(_arr113.slice(0)),\n  y18 = _objectWithoutProperties(_obj114, []);\nconst _ref115 = z(),\n  _arr116 = _toArray(_ref115, 0, true),\n  _obj117 = _objectDestructuringEmpty(_arr116.slice(0)),\n  a19 = _obj117.a19,\n  y19 = _objectWithoutProperties(_obj117, ['a19']);\nconst _ref118 = z(),\n  _obj119 = _objectDestructuringEmpty(_ref118),\n  _value = _obj119.x20,\n  _obj121 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  y20 = _objectWithoutProperties(_obj121, []);\nconst _ref122 = z(),\n  _obj123 = _objectDestructuringEmpty(_ref122),\n  _value124 = _obj123.x22,\n  _obj125 = _objectDestructuringEmpty(_value124 === void 0 ? {} : _value124),\n  q22 = _obj125.q22,\n  y22 = _objectWithoutProperties(_obj125, ['q22']);\nconst [[...y23] = []] = z();\nconst _ref126 = z(),\n  _arr127 = _toArray(_ref126, 1, false),\n  _value128 = _arr127[0],\n  _obj129 = _objectDestructuringEmpty(_value128 === void 0 ? [] : _value128),\n  y24 = _objectWithoutProperties(_obj129, []);\nconst { x25: [...y25] = [] } = z();\nconst { x26: [q26, ...y26] = [] } = z();\nconst {} = {};\nconst [, , x27] = z();\nconst _ref130 = z(),\n  _obj131 = _objectDestructuringEmpty(_ref130),\n  _arr132 = _toArray(_obj131.x28, 3, false),\n  _obj133 = _objectDestructuringEmpty(_arr132[2]),\n  y28 = _objectWithoutProperties(_obj133, []);\nconst _ref134 = z(),\n  _obj135 = _objectDestructuringEmpty(_ref134),\n  _arr136 = _toArray(_obj135.x29, 3, false),\n  _obj137 = _objectDestructuringEmpty(_arr136[2]),\n  q29 = _obj137.q29,\n  y29 = _objectWithoutProperties(_obj137, ['q29']);\nconst _ref138 = z(),\n  _arr139 = _toArray(_ref138, 3, false),\n  _obj140 = _objectDestructuringEmpty(_arr139[2]),\n  y30 = _obj140.y30,\n  x30 = _objectWithoutProperties(_obj140, ['y30']);\nconst _ref141 = z(),\n  _arr142 = _toArray(_ref141, 3, false),\n  _obj143 = _objectDestructuringEmpty(_arr142[2]),\n  x31 = _objectWithoutProperties(_obj143, []);\nconst _ref144 = z(),\n  _obj145 = _objectDestructuringEmpty(_ref144),\n  _obj146 = _objectDestructuringEmpty(_obj145.x32),\n  _obj147 = _objectDestructuringEmpty(_obj145.w32),\n  y32 = _objectWithoutProperties(_obj147, []);\nconst _ref148 = z(),\n  _arr149 = _toArray(_ref148, 4, false),\n  _obj150 = _objectDestructuringEmpty(_arr149[2]),\n  _obj151 = _objectDestructuringEmpty(_arr149[3]),\n  q32 = _objectWithoutProperties(_obj151, []);\nconst _ref152 = z(),\n  _obj153 = _objectDestructuringEmpty(_ref152),\n  y33 = _objectWithoutProperties(_obj153, []);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\nconst _ref = z(),\n  _obj = _objectDestructuringEmpty(_ref),\n  _arr = _toArray(_obj.x15, 0, true),\n  _obj63 = _objectDestructuringEmpty(_arr.slice(0)),\n  y15 = _objectWithoutProperties(_obj63, []);\nlet _ref64 = complex,\n  _obj65 = _objectDestructuringEmpty(_ref64),\n  _obj66 = _objectDestructuringEmpty(_obj65.x),\n  xa = _obj66.a,\n  _key = _toPropertyKey(d),\n  f = _obj66[_key],\n  asdf = _objectWithoutProperties(_obj66, ['a', _key]),\n  _obj68 = _objectDestructuringEmpty(_obj65.y),\n  d = _objectWithoutProperties(_obj68, []),\n  g = _objectWithoutProperties(_obj65, ['x', 'y']);\nlet _ref69 = z(),\n  _obj70 = _objectDestructuringEmpty(_ref69),\n  _obj71 = _objectDestructuringEmpty(_obj70.x4),\n  y4 = _objectWithoutProperties(_obj71, []);\nlet _ref72 = z(),\n  _obj73 = _objectDestructuringEmpty(_ref72),\n  _obj74 = _objectDestructuringEmpty(_obj73.x5),\n  w5 = _obj74.w5,\n  y5 = _objectWithoutProperties(_obj74, ['w5']);\nlet _ref75 = z(),\n  _obj76 = _objectDestructuringEmpty(_ref75),\n  _obj77 = _objectDestructuringEmpty(_obj76.x6),\n  _obj78 = _objectDestructuringEmpty(_obj77.w6),\n  a6 = _obj78.a6,\n  y6 = _objectWithoutProperties(_obj78, ['a6']);\nlet _ref79 = z(),\n  _obj80 = _objectDestructuringEmpty(_ref79),\n  _obj81 = _objectDestructuringEmpty(_obj80.x7),\n  e7 = _obj81.e7,\n  r7 = _obj81.r7,\n  _obj82 = _objectDestructuringEmpty(_obj80.q7),\n  _obj83 = _objectDestructuringEmpty(_obj82.w7),\n  a7 = _obj83.a7,\n  y7 = _objectWithoutProperties(_obj83, ['a7']);\nlet _ref84 = z(),\n  _obj85 = _objectDestructuringEmpty(_ref84),\n  x8 = _obj85.x8,\n  y8 = _objectWithoutProperties(_obj85, ['x8']);\nlet _ref86 = z(),\n  _obj87 = _objectDestructuringEmpty(_ref86),\n  _obj88 = _objectDestructuringEmpty(_obj87.x9),\n  _obj89 = _objectDestructuringEmpty(_obj88.w9),\n  a9 = _obj89.a9,\n  y9 = _objectWithoutProperties(_obj89, ['a9']),\n  _obj90 = _objectDestructuringEmpty(_obj87.x10),\n  a10 = _obj90.a10,\n  y10 = _objectWithoutProperties(_obj90, ['a10']);\nlet _ref91 = z(),\n  _obj92 = _objectDestructuringEmpty(_ref91),\n  _arr93 = _toArray(_obj92.x11, 1, false),\n  _obj94 = _objectDestructuringEmpty(_arr93[0]),\n  w11 = _obj94.w11,\n  z11 = _objectWithoutProperties(_obj94, ['w11']);\nlet _ref95 = z(),\n  _obj96 = _objectDestructuringEmpty(_ref95),\n  _arr97 = _toArray(_obj96.x12, 2, false),\n  _obj98 = _objectDestructuringEmpty(_arr97[0]),\n  a12 = _obj98.a12,\n  b12 = _obj98.b12,\n  _obj99 = _objectDestructuringEmpty(_arr97[1]),\n  c12 = _obj99.c12,\n  d12 = _objectWithoutProperties(_obj99, ['c12']);\nlet _ref100 = z(),\n  _obj101 = _objectDestructuringEmpty(_ref100),\n  _arr102 = _toArray(_obj101.x13, 2, false),\n  _obj103 = _objectDestructuringEmpty(_arr102[1]),\n  c13 = _obj103.c13,\n  d13 = _objectWithoutProperties(_obj103, ['c13']);\nconst _ref104 = z(),\n  _obj105 = _objectDestructuringEmpty(_ref104),\n  _arr106 = _toArray(_obj105.x14, 0, true),\n  _obj107 = _objectDestructuringEmpty(_arr106.slice(0)),\n  q14 = _obj107.q14,\n  y14 = _objectWithoutProperties(_obj107, ['q14']);\nconst _ref108 = z(),\n  _obj109 = _objectDestructuringEmpty(_ref108),\n  _arr110 = _toArray(_obj109.x15, 0, true),\n  _obj111 = _objectDestructuringEmpty(_arr110.slice(0)),\n  y16 = _objectWithoutProperties(_obj111, []);\nconst {\n  x16: [],\n} = z();\nconst [...[...y17]] = z();\nconst _ref112 = z(),\n  _arr113 = _toArray(_ref112, 0, true),\n  _obj114 = _objectDestructuringEmpty(_arr113.slice(0)),\n  y18 = _objectWithoutProperties(_obj114, []);\nconst _ref115 = z(),\n  _arr116 = _toArray(_ref115, 0, true),\n  _obj117 = _objectDestructuringEmpty(_arr116.slice(0)),\n  a19 = _obj117.a19,\n  y19 = _objectWithoutProperties(_obj117, ['a19']);\nconst _ref118 = z(),\n  _obj119 = _objectDestructuringEmpty(_ref118),\n  _value = _obj119.x20,\n  _obj121 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),\n  y20 = _objectWithoutProperties(_obj121, []);\nconst _ref122 = z(),\n  _obj123 = _objectDestructuringEmpty(_ref122),\n  _value124 = _obj123.x22,\n  _obj125 = _objectDestructuringEmpty(_value124 === void 0 ? {} : _value124),\n  q22 = _obj125.q22,\n  y22 = _objectWithoutProperties(_obj125, ['q22']);\nconst [[...y23] = []] = z();\nconst _ref126 = z(),\n  _arr127 = _toArray(_ref126, 1, false),\n  _value128 = _arr127[0],\n  _obj129 = _objectDestructuringEmpty(_value128 === void 0 ? [] : _value128),\n  y24 = _objectWithoutProperties(_obj129, []);\nconst { x25: [...y25] = [] } = z();\nconst { x26: [q26, ...y26] = [] } = z();\nconst {} = {};\nconst [, , x27] = z();\nconst _ref130 = z(),\n  _obj131 = _objectDestructuringEmpty(_ref130),\n  _arr132 = _toArray(_obj131.x28, 3, false),\n  _obj133 = _objectDestructuringEmpty(_arr132[2]),\n  y28 = _objectWithoutProperties(_obj133, []);\nconst _ref134 = z(),\n  _obj135 = _objectDestructuringEmpty(_ref134),\n  _arr136 = _toArray(_obj135.x29, 3, false),\n  _obj137 = _objectDestructuringEmpty(_arr136[2]),\n  q29 = _obj137.q29,\n  y29 = _objectWithoutProperties(_obj137, ['q29']);\nconst _ref138 = z(),\n  _arr139 = _toArray(_ref138, 3, false),\n  _obj140 = _objectDestructuringEmpty(_arr139[2]),\n  y30 = _obj140.y30,\n  x30 = _objectWithoutProperties(_obj140, ['y30']);\nconst _ref141 = z(),\n  _arr142 = _toArray(_ref141, 3, false),\n  _obj143 = _objectDestructuringEmpty(_arr142[2]),\n  x31 = _objectWithoutProperties(_obj143, []);\nconst _ref144 = z(),\n  _obj145 = _objectDestructuringEmpty(_ref144),\n  _obj146 = _objectDestructuringEmpty(_obj145.x32),\n  _obj147 = _objectDestructuringEmpty(_obj145.w32),\n  y32 = _objectWithoutProperties(_obj147, []);\nconst _ref148 = z(),\n  _arr149 = _toArray(_ref148, 4, false),\n  _obj150 = _objectDestructuringEmpty(_arr149[2]),\n  _obj151 = _objectDestructuringEmpty(_arr149[3]),\n  q32 = _objectWithoutProperties(_obj151, []);\nconst _ref152 = z(),\n  _obj153 = _objectDestructuringEmpty(_ref152),\n  y33 = _objectWithoutProperties(_obj153, []);",
  '// var { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };\n// expect(x).toBe(1);\n// expect(y).toBe(2);\n// expect(z).toEqual({ a: 3, b: 4 });\n// var complex = {\n//   x: { a: 1, b: 2, c: 3 },\n// };\n// var {\n//   x: { a: xa, ...xbc }\n// } = complex;\n// expect(xa).toBe(1);\n// expect(xbc).toEqual({ b: 2, c: 3});\n// // own properties\n// function ownX({ ...properties }) {\n//   return properties.x;\n// }\n// expect(ownX(Object.create({ x: 1 }))).toBeUndefined();',
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nlet _a$d = {\n    a: [1, 2, 3, 4],\n    d: 'oyez',\n  },\n  {\n    a: [b, ...arrayRest],\n    c = function (...functionRest) {},\n  } = _a$d,\n  objectRest = _objectWithoutProperties(_a$d, ['a', 'c']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nlet _ref = {\n    a: [1, 2, 3, 4],\n    d: 'oyez',\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _arr = _toArray(_obj.a, 1, true),\n  b = _arr[0],\n  arrayRest = _arr.slice(1),\n  _value = _obj.c,\n  c = _value === void 0 ? function (...functionRest) {} : _value,\n  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);",
  "var _toArray2 = {\n  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),\n  toArray: require('@babel/runtime/helpers/toArray'),\n};\nfunction _toArray(r, e, a) {\n  return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);\n}\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nlet _ref = {\n    a: [1, 2, 3, 4],\n    d: 'oyez',\n  },\n  _obj = _objectDestructuringEmpty(_ref),\n  _arr = _toArray(_obj.a, 1, true),\n  b = _arr[0],\n  arrayRest = _arr.slice(1),\n  _value = _obj.c,\n  c = _value === void 0 ? function (...functionRest) {} : _value,\n  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });\n// Loose will evaluate the static `b: k.a++` before spreading `...k`.\n// It should be {a: 1, b: 1}\nexpect(o).toEqual({\n  a: 2,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = _objectSpread(_objectSpread({}, k), l);\n// Loose will evaluate the `l` before spreading `...k`.\n// It should be {a: 1, b: 2, z: 9}\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  c: 3,\n});",
  'var k = {\n  a: 1,\n  b: 2,\n};\nvar o = Object.assign({ a: 3 }, k, { b: k.a++ });\n// Loose will evaluate the static `b: k.a++` before spreading `...k`.\n// It should be {a: 1, b: 1}\nexpect(o).toEqual({\n  a: 2,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = Object.assign({}, k, l);\n// Loose will evaluate the `l` before spreading `...k`.\n// It should be {a: 1, b: 2, z: 9}\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  c: 3,\n});',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _extends({ a: 3 }, k, { b: k.a++ });\n// Loose will evaluate the static `b: k.a++` before spreading `...k`.\n// It should be {a: 1, b: 1}\nexpect(o).toEqual({\n  a: 2,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = _extends({}, k, l);\n// Loose will evaluate the `l` before spreading `...k`.\n// It should be {a: 1, b: 2, z: 9}\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  c: 3,\n});",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });\nvar pureA = {};\nvar pureB = {};\nvar pureC = {};\nvar pureD = {};\nvar pureE = {};\nfunction impureFunc() {\n  console.log('hello');\n}\nvar output = _objectSpread(\n  _objectSpread(\n    _objectSpread(\n      _objectSpread(\n        _objectSpread(\n          _objectSpread({}, pureA),\n          {},\n          {\n            get foo() {},\n            get bar() {},\n          },\n          pureB,\n        ),\n        pureC,\n      ),\n      impureFunc(),\n    ),\n    pureD,\n  ),\n  {},\n  { pureD },\n);\nvar simpleOutput = _objectSpread(_objectSpread({}, pureA), {}, { test: '1' }, pureB);",
  "var k = {\n  a: 1,\n  b: 2,\n};\nvar o = Object.assign({ a: 3 }, k, { b: k.a++ });\nvar pureA = {};\nvar pureB = {};\nvar pureC = {};\nvar pureD = {};\nvar pureE = {};\nfunction impureFunc() {\n  console.log('hello');\n}\nvar output = Object.assign(\n  {},\n  pureA,\n  {\n    get foo() {},\n    get bar() {},\n  },\n  pureB,\n  pureC,\n  impureFunc(),\n  pureD,\n  { pureD },\n);\nvar simpleOutput = Object.assign({}, pureA, { test: '1' }, pureB);",
  "var _extends = require('@babel/runtime/helpers/extends');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _extends({ a: 3 }, k, { b: k.a++ });\nvar pureA = {};\nvar pureB = {};\nvar pureC = {};\nvar pureD = {};\nvar pureE = {};\nfunction impureFunc() {\n  console.log('hello');\n}\nvar output = _extends(\n  {},\n  pureA,\n  {\n    get foo() {},\n    get bar() {},\n  },\n  pureB,\n  pureC,\n  impureFunc(),\n  pureD,\n  { pureD },\n);\nvar simpleOutput = _extends({}, pureA, { test: '1' }, pureB);",
  "expect([...'']).toHaveLength(0);\nexpect([...'abc']).toHaveLength(3);\nexpect([...'def']).toMatchObject(['d', 'e', 'f']);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar z = _objectSpread({}, x);",
  'var z = Object.assign({}, x);',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar z = _extends({}, x);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar log = [];\nvar a = _objectSpread(\n  _objectSpread(\n    {},\n    {\n      get foo() {\n        log.push(1);\n      },\n    },\n  ),\n  {},\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\nexpect(log).toEqual([1]);",
  'var log = [];\nvar a = Object.assign(\n  {},\n  {\n    get foo() {\n      log.push(1);\n    },\n  },\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\nexpect(log).toEqual([1]);',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar log = [];\nvar a = _extends(\n  {},\n  {\n    get foo() {\n      log.push(1);\n    },\n  },\n  {\n    get bar() {\n      log.push(2);\n    },\n  },\n);\nexpect(log).toEqual([1]);",
  "'use strict';\nvar _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this wouldn't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nconst objSpread = _objectSpread({}, obj);\nexpect(objSpread).toHaveProperty('NOSET', 123);\nconst obj2 = { NOWRITE: 456 };\n// this line would throw `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nconst obj2Spread = _objectSpread({}, obj2);\nexpect(obj2Spread).toHaveProperty('NOWRITE', 456);\nconst KEY = Symbol('key');\nconst obj3Spread = _objectSpread(\n  _objectSpread(\n    {},\n    {\n      get foo() {\n        return 'bar';\n      },\n    },\n  ),\n  {},\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = _objectSpread({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = _objectSpread({}, o);\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);",
  "'use strict';\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this wouldn't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nconst objSpread = Object.assign({}, obj);\nexpect(objSpread).toHaveProperty('NOSET', 123);\nconst obj2 = { NOWRITE: 456 };\n// this line would throw `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nconst obj2Spread = Object.assign({}, obj2);\nexpect(obj2Spread).toHaveProperty('NOWRITE', 456);\nconst KEY = Symbol('key');\nconst obj3Spread = Object.assign(\n  {},\n  {\n    get foo() {\n      return 'bar';\n    },\n  },\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = Object.assign({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => Object.assign({}, null, undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = Object.assign({}, o);\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);",
  "'use strict';\nvar _extends = require('@babel/runtime/helpers/extends');\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\nconst obj = { NOSET: 123 };\n// this wouldn't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nconst objSpread = _extends({}, obj);\nexpect(objSpread).toHaveProperty('NOSET', 123);\nconst obj2 = { NOWRITE: 456 };\n// this line would throw `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nconst obj2Spread = _extends({}, obj2);\nexpect(obj2Spread).toHaveProperty('NOWRITE', 456);\nconst KEY = Symbol('key');\nconst obj3Spread = _extends(\n  {},\n  {\n    get foo() {\n      return 'bar';\n    },\n  },\n  { [KEY]: 'symbol' },\n);\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\nconst obj4Spread = _extends({}, Object.prototype);\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\nexpect(() => _extends({}, null, undefined)).not.toThrow();\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = _extends({}, o);\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);",
  "var _objectSpread = require('@babel/runtime/helpers/objectSpread2');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });\nexpect(o).toEqual({\n  a: 1,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = _objectSpread(_objectSpread({}, k), l);\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  z: 9,\n});",
  'var k = {\n  a: 1,\n  b: 2,\n};\nvar o = Object.assign({ a: 3 }, k, { b: k.a++ });\nexpect(o).toEqual({\n  a: 1,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = Object.assign({}, k, l);\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  z: 9,\n});',
  "var _extends = require('@babel/runtime/helpers/extends');\nvar k = {\n  a: 1,\n  b: 2,\n};\nvar o = _extends({ a: 3 }, k, { b: k.a++ });\nexpect(o).toEqual({\n  a: 1,\n  b: 1,\n});\nvar k = {\n  a: 1,\n  get b() {\n    l = { z: 9 };\n    return 2;\n  },\n};\nvar l = { c: 3 };\nvar o = _extends({}, k, l);\nexpect(o).toEqual({\n  a: 1,\n  b: 2,\n  z: 9,\n});",
  "import props from 'props';\nimport _objectDestructuringEmpty from '@babel/runtime/helpers/objectDestructuringEmpty';\nimport _extends from '@babel/runtime/helpers/extends';\nconsole.log(props);\n(function () {\n  const _this$props = this.props,\n    props = _extends({}, (_objectDestructuringEmpty(_this$props), _this$props));\n  console.log(props);\n})();",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nimport props from 'props';\nconsole.log(props);\n(function () {\n  const _ref = this.props,\n    _obj = _objectDestructuringEmpty(_ref),\n    props = _objectWithoutProperties(_obj, []);\n  console.log(props);\n})();",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nimport props from 'props';\nconsole.log(props);\n(function () {\n  const _ref = this.props,\n    _obj = _objectDestructuringEmpty(_ref),\n    props = _objectWithoutProperties(_obj, []);\n  console.log(props);\n})();",
  "var _toPropertyKey = require('@babel/runtime/helpers/toPropertyKey');\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\n// Computed keys must be evaluated in source order (left-to-right)\n// even when nested object rest is involved. This test verifies\n// that log(0), log(1), log(2), log(3) execute in that order.\nfunction log(n) {\n  console.log(n);\n  return 'x';\n}\nconst _x = { x: { x: {} } },\n  { [log(0)]: _ref, [log(3)]: z } = _x,\n  _log = log(1),\n  _log2 = log(2),\n  { [_log]: x, [_log2]: y } = _ref,\n  rest = _objectWithoutProperties(_ref, [_log, _log2].map(_toPropertyKey));",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\n// Computed keys must be evaluated in source order (left-to-right)\n// even when nested object rest is involved. This test verifies\n// that log(0), log(1), log(2), log(3) execute in that order.\nfunction log(n) {\n  console.log(n);\n  return 'x';\n}\nconst _ref = { x: { x: {} } },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = log(0),\n  _obj15 = _objectDestructuringEmpty(_obj[_key]),\n  _key16 = _toPropertyKey(log(1)),\n  x = _obj15[_key16],\n  _key17 = _toPropertyKey(log(2)),\n  y = _obj15[_key17],\n  rest = _objectWithoutProperties(_obj15, [_key16, _key17]),\n  _key18 = log(3),\n  z = _obj[_key18];",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nvar _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');\nfunction _toPropertyKey(value) {\n  return _toPropertyKey2(value);\n}\n// Computed keys must be evaluated in source order (left-to-right)\n// even when nested object rest is involved. This test verifies\n// that log(0), log(1), log(2), log(3) execute in that order.\nfunction log(n) {\n  console.log(n);\n  return 'x';\n}\nconst _ref = { x: { x: {} } },\n  _obj = _objectDestructuringEmpty(_ref),\n  _key = log(0),\n  _obj15 = _objectDestructuringEmpty(_obj[_key]),\n  _key16 = _toPropertyKey(log(1)),\n  x = _obj15[_key16],\n  _key17 = _toPropertyKey(log(2)),\n  y = _obj15[_key17],\n  rest = _objectWithoutProperties(_obj15, [_key16, _key17]),\n  _key18 = log(3),\n  z = _obj[_key18];",
  "const _excluded = ['b'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst _foo = foo(),\n  { s } = _foo,\n  t = _objectWithoutProperties(_foo, ['s']);\nconst _bar = bar(),\n  { s: _ref } = _bar,\n  { q1 } = _ref,\n  q2 = _objectWithoutProperties(_ref, ['q1']),\n  q3 = _objectWithoutProperties(_bar, ['s']);\nconst { a } = foo(_ref2 => {\n  let { b } = _ref2,\n    c = _objectWithoutProperties(_ref2, _excluded);\n  console.log(b, c);\n});",
  "const _excluded = ['b'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst _ref = foo(),\n  _obj = _objectDestructuringEmpty(_ref),\n  s = _obj.s,\n  t = _objectWithoutProperties(_obj, ['s']);\nconst _ref16 = bar(),\n  _obj17 = _objectDestructuringEmpty(_ref16),\n  _obj18 = _objectDestructuringEmpty(_obj17.s),\n  q1 = _obj18.q1,\n  q2 = _objectWithoutProperties(_obj18, ['q1']),\n  q3 = _objectWithoutProperties(_obj17, ['s']);\nconst { a } = foo(_ref17 => {\n  let { b } = _ref17,\n    c = _objectWithoutProperties3(_ref17, _excluded);\n  console.log(b, c);\n});",
  "const _excluded = ['b'];\nvar _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\nvar _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst _ref = foo(),\n  _obj = _objectDestructuringEmpty(_ref),\n  s = _obj.s,\n  t = _objectWithoutProperties(_obj, ['s']);\nconst _ref16 = bar(),\n  _obj17 = _objectDestructuringEmpty(_ref16),\n  _obj18 = _objectDestructuringEmpty(_obj17.s),\n  q1 = _obj18.q1,\n  q2 = _objectWithoutProperties(_obj18, ['q1']),\n  q3 = _objectWithoutProperties(_obj17, ['s']);\nconst { a } = foo(_ref17 => {\n  let { b } = _ref17,\n    c = _objectWithoutProperties3(_ref17, _excluded);\n  console.log(b, c);\n});",
  "var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nvar _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');\nvar _extends = require('@babel/runtime/helpers/extends');\nconst { x } = a,\n  y = _objectWithoutProperties(a, ['x']),\n  z = foo(y);\nconst s = _extends({}, (_objectDestructuringEmpty(r), r)),\n  t = foo(s);\n// ordering is preserved\nvar l = foo(),\n  _bar = bar(),\n  { m: _ref } = _bar,\n  { n } = _ref,\n  o = _objectWithoutProperties(_ref, ['n']),\n  p = _objectWithoutProperties(_bar, ['m']),\n  q = baz();",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nconst _ref = a,\n  _obj = _objectDestructuringEmpty(_ref),\n  x = _obj.x,\n  y = _objectWithoutProperties(_obj, ['x']),\n  z = foo(y);\nconst _ref18 = r,\n  _obj19 = _objectDestructuringEmpty(_ref18),\n  s = _objectWithoutProperties(_obj19, []),\n  t = foo(s);\n// ordering is preserved\nvar l = foo(),\n  _ref20 = bar(),\n  _obj21 = _objectDestructuringEmpty(_ref20),\n  _obj22 = _objectDestructuringEmpty(_obj21.m),\n  n = _obj22.n,\n  o = _objectWithoutProperties(_obj22, ['n']),\n  p = _objectWithoutProperties(_obj21, ['m']),\n  q = baz();",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nconst _ref = a,\n  _obj = _objectDestructuringEmpty(_ref),\n  x = _obj.x,\n  y = _objectWithoutProperties(_obj, ['x']),\n  z = foo(y);\nconst _ref18 = r,\n  _obj19 = _objectDestructuringEmpty(_ref18),\n  s = _objectWithoutProperties(_obj19, []),\n  t = foo(s);\n// ordering is preserved\nvar l = foo(),\n  _ref20 = bar(),\n  _obj21 = _objectDestructuringEmpty(_ref20),\n  _obj22 = _objectDestructuringEmpty(_obj21.m),\n  n = _obj22.n,\n  o = _objectWithoutProperties(_obj22, ['n']),\n  p = _objectWithoutProperties(_obj21, ['m']),\n  q = baz();",
  "const _excluded = ['a'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nfunction fn0(obj0) {\n  const {\n    fn1 = (obj1 = {}) => {\n      const {\n        fn2 = (obj2 = {}) => {\n          const { a } = obj2,\n            rest = _objectWithoutProperties(obj2, _excluded);\n          console.log(rest);\n        },\n      } = obj1;\n    },\n  } = obj0;\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),\n};\nfunction _objectWithoutProperties(t, e) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(t),\n    _objectWithoutProperties2.objectWithoutProperties(t, e)\n  );\n}\nfunction fn0(obj0) {\n  const {\n    fn1 = (obj1 = {}) => {\n      const {\n        fn2 = (obj2 = {}) => {\n          const _ref = obj2,\n            _obj = _objectDestructuringEmpty(_ref),\n            a = _obj.a,\n            rest = _objectWithoutProperties(_obj, ['a']);\n          console.log(rest);\n        },\n      } = obj1;\n    },\n  } = obj0;\n}",
  "var _objectDestructuringEmpty2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n};\nfunction _objectDestructuringEmpty(t) {\n  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);\n}\nvar _objectWithoutProperties2 = {\n  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),\n  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),\n};\nfunction _objectWithoutProperties(e, t) {\n  return (\n    _objectWithoutProperties2.objectDestructuringEmpty(e),\n    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)\n  );\n}\nfunction fn0(obj0) {\n  const {\n    fn1 = (obj1 = {}) => {\n      const {\n        fn2 = (obj2 = {}) => {\n          const _ref = obj2,\n            _obj = _objectDestructuringEmpty(_ref),\n            a = _obj.a,\n            rest = _objectWithoutProperties(_obj, ['a']);\n          console.log(rest);\n        },\n      } = obj1;\n    },\n  } = obj0;\n}",
  "const _excluded = ['a', 'b', 'c'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');\nconst get = () => {\n  fireTheMissiles();\n  return 3;\n};\nconst f = _ref => {\n  let { a = get(), b, c } = _ref,\n    z = _objectWithoutProperties(_ref, _excluded);\n  const v = b + 3;\n};",
  "const _excluded = ['a', 'b', 'c'];\nvar _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutPropertiesLoose');\nconst get = () => {\n  fireTheMissiles();\n  return 3;\n};\nconst f = _ref => {\n  let { a = get(), b, c } = _ref,\n    z = _objectWithoutProperties(_ref, _excluded);\n  const v = b + 3;\n};",
] as const;

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength — parameters object rest used in default (input)',
    source:
      '({...R}, a = R) => {}\n({...R}, e, c = 2, a = R, f = q) => { let q; }\n({...R}, a = f(R)) => {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[0],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[0],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[0],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption objectRestNoSymbols — rest assignment expression (input)',
    source: '({ a, b, ...c } = obj);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[1],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[2],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[3],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption objectRestNoSymbols — rest computed (input)',
    source: 'let { [a]: b, ...c } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[4],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[5],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[6],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption objectRestNoSymbols — rest ignore symbols (exec)',
    source:
      'let sym = Symbol();\n\nlet { a, ...r } = { a: 1, b: 2, [sym]: 3 };\n\nexpect(a).toBe(1);\nexpect(r.b).toBe(2);\nexpect(sym in r).toBe(false);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[7],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[8],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[9],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption objectRestNoSymbols — rest nested (input)',
    source: 'let { a, nested: { b, c, ...d }, e } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[10],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[11],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[12],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption objectRestNoSymbols — rest var declaration (input)',
    source: 'var { a, b, ...c } = obj;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[13],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[14],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[15],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption pureGetters — rest remove unused excluded keys (exec)',
    source:
      'let called = false;\nlet obj = {\n  get foo() { called = true }\n};\n\nlet { foo, ...rest } = obj;\n\nexpect("foo" in rest).toBe(false);\n\n// Without assuming that getters are pure (in this case it isn\'t), this should be true\nexpect(called).toBe(false);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[16],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[17],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[18],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption pureGetters — rest remove unused excluded keys (input)',
    source:
      '// should not remove when destructuring into existing bindings\n({ a2, ...b2 } = c2);\n\nfunction render() {\n  const {\n    excluded,\n    excluded2: excludedRenamed,\n    used,\n    used2: usedRenamed,\n    ...props\n  } = this.props;\n\n  console.log(used, usedRenamed);\n\n  return React.createElement("input", props);\n}\n\nfunction smth({ unused, ...rest }) {\n  call(rest);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[19],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[20],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[21],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption pureGetters — spread single call (exec)',
    source:
      "let count = 0;\n\nlet withFoo = { get foo() { return count++; } };\nlet withBar = { get bar() { return count++; } };\n\nlet res = { ...withFoo, middle: count, ...withBar };\n\n// Without assuming that getters are pure (in this case it isn't),\n// the result should be { foo: 0, middle: 1, bar: 1 }\nexpect(res).toEqual({ foo: 0, middle: 0, bar: 1 });\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[22],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[22],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[24],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption pureGetters — spread single call (input)',
    source: 'let obj = { a, ...b, c, ...d, e };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[25],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[25],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[27],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties with useBuiltIns — assignment (input)',
    source: 'var x;\nvar y;\nvar z;\n\nz = { x, ...y };\n\nz = { x, w: { ...y } };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[28],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[28],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[30],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties with useBuiltIns — expression (exec)',
    source:
      'var log = [];\n\nvar a = {\n  ...{ get foo() { log.push(1); } },\n  get bar() { log.push(2); }\n};\n\n// Loose mode uses regular Get, not GetOwnProperty.\nexpect(log).toEqual([1, 2]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[31],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[31],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[33],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties with useBuiltIns — expression (input)',
    source:
      "var a;\nvar b;\nvar c;\nvar d;\nvar x;\nvar y;\n\n({ x, ...y, a, ...b, c });\n\n({ ...Object.prototype });\n\n({ ...{ foo: 'bar' } });\n\n({ ...{ foo: 'bar' }, ...{ bar: 'baz' } });\n\n({ ...{ get foo () { return 'foo' } } });\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[34],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[34],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[36],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties with useBuiltIns — no getOwnPropertyDescriptors (exec)',
    source:
      'const oldGOPDs = Object.getOwnPropertyDescriptors;\nObject.getOwnPropertyDescriptors = null;\n\ntry {\n  ({ ...{ a: 1 }, b: 1, ...{} });\n} finally {\n  Object.getOwnPropertyDescriptors = oldGOPDs;\n}\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[37],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[37],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[39],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties with useBuiltIns — no object assign exec (exec)',
    source:
      "\"use strict\";\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\n\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\n\nconst obj = { 'NOSET': 123 };\n// this won't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nexpect(() => {\n  const objSpread = { ...obj };\n}).toThrow();\n\nconst obj2 = { 'NOWRITE': 456 };\n// this throws `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nexpect(() => {\n  const obj2Spread = { ...obj2 };\n}).toThrow();\n\nconst KEY = Symbol('key');\nconst obj3Spread = { ...{ get foo () { return 'bar' } }, [KEY]: 'symbol' };\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\n\nconst obj4Spread = { ...Object.prototype };\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\n\nexpect(() => ({ ...null, ...undefined })).not.toThrow();\n\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = { ...o };\n// Loose will do o2.__proto__ = []\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[40],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[40],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[42],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'assumption setSpreadProperties — targets support object assign (input)',
    source: 'let a = { x: 1, ...b };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[43],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[43],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[45],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — assignment expression (input)',
    source: '({ a1 } = c1);\n({ a2, ...b2 } = c2);\n\nconsole.log({ a3, ...b3 } = c3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[46],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[47],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[48],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — catch clause (input)',
    source:
      'try {} catch({ ...a34 }) {}\ntry {} catch({a1, ...b1}) {}\ntry {} catch({a2, b2, ...c2}) {}\ntry {} catch({a2, b2, c2: { c3, ...c4 }}) {}\n\n// Unchanged\ntry {} catch(a) {}\ntry {} catch({ b }) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[49],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[50],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[51],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — duplicate decl bug (input)',
    source:
      'it("es7.objectRestSpread", () => {\n  let original = { a: 1, b: 2 };\n  let { ...copy } = original;\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[52],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[53],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[54],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — export (input)',
    source:
      '// ExportNamedDeclaration\nexport var { b, ...c } = asdf2;\n// Skip\nexport var { bb, cc } = ads;\nexport var [ dd, ee, ...ff ] = ads;\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[55],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[56],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[57],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — for x array pattern rest only (exec)',
    source:
      'let a, result;\nfor (const [{...a}] of [[{ a: 0}]]) { result = a; }\n\nexpect(result).toEqual({ a: 0 });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[58],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[59],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[60],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — for x array pattern rest only (input)',
    source:
      '// ForXStatement\n{\n  let a;\n  for (const [{...a}] of []) {}\n  for ([{...a}] of []) {}\n  async function f() {\n    for await ([{...a}] of []) {}\n  }\n}\n\n// skip\n{\n  for ([...a] in {}) {}\n  for ([...a] of []) {}\n  async function a() {\n    for await ([...a] of []) {}\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[61],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[62],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[63],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — for x array pattern (input)',
    source:
      '// ForXStatement\n{\n  let a, b;\n  for (const [{a, ...b}] of []) {}\n  for ([{a, ...b}] of []) {}\n  async function f() {\n    for await ([{a, ...b}] of []) {}\n  }\n\n  for (const { a: [{a, ...b}] } of []) {}\n}\n\n// skip\n{\n  for ([{a}] in {}) {}\n  for ([{a}] of []) {}\n  async function a() {\n    for await ([{a}] of []) {}\n  }\n}\n{\n  for ([a, ...b] in {}) {}\n  for ([a, ...b] of []) {}\n  async function a() {\n    for await ([a, ...b] of []) {}\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[64],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[65],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[66],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
    title: 'object rest — for x assignment shadowed block scoped bindings (exec)',
    source:
      'let a = 0, result, y;\n\nfor ({ [a++]: result, ...y} of [["0", "1"]]) {\n  const a = 1;\n}\n\nexpect(result).toBe("0");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[67],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[68],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[69],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
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
  {
    title: 'object rest — for x assignment shadowed block scoped bindings (input)',
    source:
      'let a = 0, result, y;\n\nfor ({ [a++]: result, ...y} of [["0", "1"]]) {\n  const a = 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[70],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[71],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[72],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'object rest — for x completion record (input)',
    source: 'for ({a, ...b} of []) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[73],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[74],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[75],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'object rest — for x declaration shadowed block scoped bindings (exec)',
    source:
      'let a = 0, result;\n\nfor (const { [a++]: x, ...y} of [["0", "1"]]) {\n  const a = 1;\n  result = x;\n}\n\nexpect(result).toBe("0");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[76],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[77],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[78],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'object rest — for x declaration shadowed block scoped bindings (input)',
    source:
      'let a = 0, result;\n\nfor (const { [a++]: x, ...y} of [["0", "1"]]) {\n  const a = 1;\n  result = x;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[79],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[80],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[81],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'object rest — for x (input)',
    source:
      '// ForXStatement\nfor (var {a, ...b} of []) {}\nfor ({a, ...b} of []) {}\nasync function a() {\n  for await ({a, ...b} of []) {}\n}\n\n// skip\nfor ({a} in {}) {}\nfor ({a} of []) {}\nasync function a() {\n  for await ({a} of []) {}\n}\n\nfor (a in {}) {}\nfor (a of []) {}\nasync function a() {\n  for await (a of []) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[82],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[83],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[84],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[84],
      },
    ],
  },
  {
    title: 'object rest — impure computed exec (exec)',
    source:
      'var key, x, y, z;\n// impure\nkey = 1;\nvar { [key++]: y, ...x } = { 1: 1, a: 1 };\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(1).toBe(y);\n\n// takes care of the order\n\nkey = 1;\nvar { [++key]: y, [++key]: z, ...rest} = {2: 2, 3: 3};\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n\n// pure, computed property should remain as-is\nkey = 2;\n({ [key]: y, z, ...x } = {2: "two", z: "zee"});\nexpect(y).toBe("two");\nexpect(x).toEqual({});\nexpect(z).toBe("zee");\n\n// rhs evaluated before lhs\nvar order = [];\nfunction left() {\n  order.push("left");\n  return 0;\n}\nfunction right() {\n  order.push("right");\n  return {};\n}\nvar { [left()]: y, ...x} = right();\nexpect(order).toEqual(["right", "left"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[85],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[86],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[87],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'object rest — impure computed (input)',
    source:
      'var key, x, y, z;\n// impure\nkey = 1;\nvar { [key++]: y, ...x } = { 1: 1, a: 1 };\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n\n// takes care of the order\n\nkey = 1;\nvar { [++key]: y, [++key]: z, ...rest} = {2: 2, 3: 3};\nexpect(y).toBe(2);\nexpect(z).toBe(3);\n\n// pure, computed property should remain as-is\nkey = 2;\n({ [key]: y, z, ...x } = {2: "two", z: "zee"});\nexpect(y).toBe("two");\nexpect(x).toEqual({});\nexpect(z).toBe("zee");\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[88],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[89],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[90],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[90],
      },
    ],
  },
  {
    title: 'object rest — nested 2 (input)',
    source:
      'const test = {\n  foo: {\n    bar: {\n      baz: {\n        a: {\n          x: 1,\n          y: 2,\n          z: 3,\n        },\n      },\n    },\n  },\n};\n\nconst { foo: { bar: { baz: { a: { x, ...other } } } } } = test;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[91],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[92],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[93],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'object rest — nested array 2 (input)',
    source: 'const [a, [{b, ...c}], {d, ...e}, [{ f, ...g}, {h: [i, {j, ...k}] }]] = x;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[94],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[95],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[96],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[96],
      },
    ],
  },
  {
    title: 'object rest — nested array (exec)',
    source:
      'const [a, {b, ...c}] = [1, { b: 2, other: 3 }];\nexpect(a).toBe(1);\nexpect(b).toBe(2);\nexpect(c).toStrictEqual({ other: 3 });\n\nlet [d, {e, ...f}] = [4, { e: 5, other: 6 }];\nexpect(d).toBe(4);\nexpect(e).toBe(5);\nexpect(f).toStrictEqual({ other: 6 });\n\nlet g, h, i;\n\n[g, {h, ...i}] = [7, { h: 8, other: 9 }];\nexpect(g).toBe(7);\nexpect(h).toBe(8);\nexpect(i).toStrictEqual({ other: 9 });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[97],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[98],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[99],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[99],
      },
    ],
  },
  {
    title: 'object rest — nested array (input)',
    source: 'const [a, {b, ...c}] = x;\n\nlet [d, {e, ...f}] = x;\n\n[g, {h, ...i}] = x;\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[100],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[101],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[102],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[102],
      },
    ],
  },
  {
    title: 'object rest — nested computed key (input)',
    source:
      'const {\n  [({ ...rest }) => {\n    let { ...b } = {};\n  }]: a,\n  [({ ...d } = {})]: c,\n} = {};',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[103],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[104],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[105],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'object rest — nested default value (input)',
    source:
      'const {\n  a = ({ ...rest }) => {\n    let { ...b } = {};\n  },\n  c = ({ ...d } = {}),\n} = {};',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[106],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[107],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[108],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[108],
      },
    ],
  },
  {
    title: 'object rest — nested literal property (input)',
    source:
      "let useState = [{ some: 42 }, () => null];\n\nlet {\n  0: { numeric,...rest1 },\n  '2': { str,...rest2 },\n  1: setState,\n} = useState;\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[109],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[110],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[111],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[111],
      },
    ],
  },
  {
    title: 'object rest — nested order (exec)',
    source:
      'var result = "";\n\nvar obj = {\n  get foo() {\n    result += "foo"\n  },\n  a: {\n    get bar() {\n      result += "bar";\n    }\n  },\n  b: {\n    get baz() {\n      result += "baz";\n    }\n  }\n};\n\nvar { a: { ...bar }, b: { ...baz }, ...foo } = obj;\n\nexpect(result).toBe("barbazfoo");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[112],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[113],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[114],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[114],
      },
    ],
  },
  {
    title: 'object rest — nested order (input)',
    source: 'const { a: { ...bar }, b: { ...baz }, ...foo } = obj;',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[115],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[116],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[117],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[117],
      },
    ],
  },
  {
    title: 'object rest — nested (input)',
    source:
      "const defunct = {\n  outer: {\n    inner: {\n      three: 'three',\n      four: 'four'\n    }\n  }\n}\n\nconst { outer: { inner: { three, ...other } } } = defunct\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[118],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[119],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[120],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[120],
      },
    ],
  },
  {
    title: 'object rest — non string computed exec (exec)',
    source:
      'const a = {\n  "3": "three",\n  "foo": "bar"\n}\n\nconst {\n  [3]: omit,\n  ...rest\n} = a;\n\nexpect(rest).toEqual({"foo": "bar"});\nexpect(omit).toBe("three");\n\nconst [k1, k2, k3, k4, k5] = [null, undefined, true, false, {toString() { return "warrior"; }}];\nconst c = {\n  [k1]: "1",\n  [k2]: "2",\n  [k3]: "3",\n  [k4]: "4",\n  [k5]: "5"\n};\n\nconst {\n  [k1]: v1,\n  [k2]: v2,\n  [k3]: v3,\n  [k4]: v4,\n  [k5]: v5,\n  ...vrest\n} = c;\n\nexpect(v1).toBe("1");\nexpect(v2).toBe("2");\nexpect(v3).toBe("3");\nexpect(v4).toBe("4");\nexpect(v5).toBe("5");\nexpect(vrest).toEqual({});\n\n// shouldn\'t convert symbols to strings\nconst sx = Symbol();\nconst sy = Symbol();\n\nconst d = {\n  [sx]: "sx",\n  [sy]: "sy"\n}\n\nconst {\n  [sx]: dx,\n  [sy]: dy\n} = d;\n\nexpect(dx).toBe("sx");\nexpect(dy).toBe("sy");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[121],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[122],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[123],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'object rest — non string computed (input)',
    source:
      'const a = {\n  "3": "three",\n  "foo": "bar"\n}\n\nconst {\n  [3]: omit,\n  ...rest\n} = a;\n\nexpect(rest).toEqual({"foo": "bar"});\nexpect(omit).toBe("three");\n\nconst [k1, k2, k3, k4, k5] = [null, undefined, true, false, {toString() { return "warrior"; }}];\nconst c = {\n  [k1]: "1",\n  [k2]: "2",\n  [k3]: "3",\n  [k4]: "4",\n  [k5]: "5"\n};\n\nconst {\n  [k1]: v1,\n  [k2]: v2,\n  [k3]: v3,\n  [k4]: v4,\n  [k5]: v5,\n  ...vrest\n} = c;\n\nexpect(v1).toBe("1");\nexpect(v2).toBe("2");\nexpect(v3).toBe("3");\nexpect(v4).toBe("4");\nexpect(v5).toBe("5");\nexpect(vrest).toEqual({});\n\n// shouldn\'t convert symbols to strings\nconst sx = Symbol();\nconst sy = Symbol();\n\nconst d = {\n  [sx]: "sx",\n  [sy]: "sy"\n}\n\nconst {\n  [sx]: dx,\n  [sy]: dy\n} = d;\n\nexpect(dx).toBe("sx");\nexpect(dy).toBe("sy");\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[121],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[122],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[123],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'object rest — null destructuring transform destructuring (exec)',
    source:
      'expect(() => {\n  var { ...x } = null;\n}).toThrow(/null/);\n\nexpect(() => {\n  var { x, ...y } = null;\n}).toThrow(/null/);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[124],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[125],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[126],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'object rest — null destructuring transform destructuring (input)',
    source:
      'expect(() => {\n  var { ...x } = null;\n}).toThrow(/null/);\n\nexpect(() => {\n  var { x, ...y } = null;\n}).toThrow(/null/);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[124],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[125],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[126],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'object rest — object ref computed (exec)',
    source:
      'var key, x, y, z;\n// impure\nkey = 1;\nvar { [key++]: { y, ...x } } = { 1: { a: 1, y: 1 } };\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n\n// takes care of the order\n\nkey = 1;\nvar {\n  [++key]: { y, ...rest_y },\n  [++key]: { z, ...rest_z }\n} = {2: { y: 2, z: 3 }, 3: { y: 4, z: 6 } };\nexpect(y).toBe(2);\nexpect(rest_y).toEqual({z: 3});\nexpect(z).toBe(6);\nexpect(rest_z).toEqual({ y: 4 });\nexpect(key).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[127],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[128],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[129],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'object rest — object ref computed (input)',
    source:
      'var key, x, y, z;\n// impure\nkey = 1;\nvar { [key++]: { y, ...x } } = { 1: { a: 1, y: 1 } };\nexpect(x).toEqual({ a: 1 });\nexpect(key).toBe(2);\nexpect(y).toBe(1);\n\n// takes care of the order\n\nkey = 1;\nvar {\n  [++key]: { y, ...rest_y },\n  [++key]: { z, ...rest_z }\n} = {2: { y: 2, z: 3 }, 3: { y: 4, z: 6 } };\nexpect(y).toBe(2);\nexpect(rest_y).toEqual({z: 3});\nexpect(z).toBe(6);\nexpect(rest_z).toEqual({ y: 4 });\nexpect(key).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[127],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[128],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[129],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'object rest — parameters exec (exec)',
    source:
      'function sum(x, y, z) {\n  return x + y + z;\n}\nfunction test() {\n  var args = arguments;\n  return sum(...args);\n}\n\nexpect(test(1, 2, 3)).toBe(6);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[130],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[130],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[130],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[130],
      },
    ],
  },
  {
    title: 'object rest — parameters object rest used in default (input)',
    source:
      '({...R}, a = R) => {}\n({X: Y,...R}, {a = {Y}}) => {}\n(a = R, {...R}) => {}\n({...R}, e, c = 2, a = R, f = q) => { let q; }\n({...R}, a = f(R)) => {}\n({...R}, { [R.key]: a = 42 }) => {}\n\n({...R}, {a = {R: b}}) => {}\n({...R}, {a = R => R} = {b: R => R}) => {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[131],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[131],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[132],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[132],
      },
    ],
  },
  {
    title: 'object rest — parameters (input)',
    source:
      'function a({ ...a34 }) {}\nfunction a2({a1, ...b1}) {}\nfunction a3({a2, b2, ...c2}) {}\nfunction a4({a3, ...c3}, {a5, ...c5}) {}\nfunction a5({a3, b2: { ba1, ...ba2 }, ...c3}) {}\nfunction a6({a3, b2: { ba1, ...ba2 } }) {}\nfunction a7({a1 = 1, ...b1} = {}) {}\nfunction a8([{...a1}]) {}\nfunction a9([{a1, ...a2}]) {}\nfunction a10([a1, {...a2}]) {}\n// Unchanged\nfunction b(a) {}\nfunction b2(a, ...b) {}\nfunction b3({ b }) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[133],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[133],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[134],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[134],
      },
    ],
  },
  {
    title: 'object rest — remove unused excluded keys loose (input)',
    source:
      '// should not remove when destructuring into existing bindings\n({ a2, ...b2 } = c2);\n\nclass Comp extends React.Component {\n  render() {\n    const {\n      excluded,\n      excluded2: excludedRenamed,\n      used,\n      used2: usedRenamed,\n      ...props\n    } = this.props;\n\n    console.log(used, usedRenamed);\n\n    return React.createElement("input", props);\n  }\n}\n\nfunction smth({ unused, ...rest }) {\n  call(rest);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[135],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[136],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[137],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[137],
      },
    ],
  },
  {
    title: 'object rest — symbol exec (exec)',
    source:
      'const sym = Symbol("test");\nconst sym2 = Symbol("not enumerable");\n\nconst src = { a: "string" };\nObject.defineProperty(src, "b", { value: "not enumerable" })\nObject.defineProperty(src, sym, { enumerable: true, value: "symbol" });\nObject.defineProperty(src, sym2, { value: "not enumerable" });\n\nconst {...rest} = src;\n\nexpect(rest[sym]).toBe("symbol");\nexpect(rest.a).toBe("string");\nexpect(Object.getOwnPropertyNames(rest)).toEqual(["a"]);\nexpect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);\n\nconst { [sym]: dst, ...noSym } = src;\n\nexpect(dst).toBe("symbol");\nexpect(noSym.a).toBe("string");\nexpect(Object.getOwnPropertySymbols(noSym)).toEqual([]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[138],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[139],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[140],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[140],
      },
    ],
  },
  {
    title: 'object rest — symbol (input)',
    source:
      'let {\n  [Symbol.for("foo")]: foo,\n  ...rest\n} = {};\n\n({ [Symbol.for("foo")]: foo, ...rest } = {});\n\nif ({ [Symbol.for("foo")]: foo, ...rest } = {}) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[141],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[142],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[143],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[143],
      },
    ],
  },
  {
    title: 'object rest — template literal allLiterals true no hoisting (input)',
    source:
      "const example = () => {\n  const input = {};\n  const foo = 'foo';\n\n  ({\n    [`${foo}_bar`]: country,\n    ...rest\n  } = input);\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[144],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[145],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[146],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[146],
      },
    ],
  },
  {
    title: 'object rest — template literal property allLiterals false (input)',
    source:
      "const input = {};\n\nconst {\n  given_name: givenName,\n  'last_name': lastName,\n  [`country`]: country,\n  [prefix + 'state']: state,\n  [`${prefix}consents`]: consents,\n  ...rest\n} = input;\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[147],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[148],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[149],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[149],
      },
    ],
  },
  {
    title: 'object rest — template literal property allLiterals true (input)',
    source:
      "const input = {};\n\nconst {\n  given_name: givenName,\n  'last_name': lastName,\n  [`country`]: country,\n  ...rest\n} = input;\n",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[150],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[151],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[152],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[152],
      },
    ],
  },
  {
    title: 'object rest — variable destructuring (input)',
    source:
      'const { x15: [...{ ...y15 }] } = z();\n\nlet {\n  x: { a: xa, [d]: f, ...asdf },\n  y: { ...d },\n  ...g\n} = complex;\n\nlet { x4: { ...y4 } } = z();\n\nlet { x5: { w5, ...y5 } } = z();\nlet { x6: { w6: { a6, ...y6 } } } = z();\nlet { x7: { e7, r7 }, q7: { w7: { a7, ...y7 } } } = z();\nlet { x8, ...y8 } = z();\nlet { x9: { w9: { a9, ...y9 } }, x10: { a10, ...y10 },  } = z();\nlet { x11: [{ w11, ...z11 }] } = z();\nlet { x12: [{ a12, b12 }, { c12, ...d12 }] } = z();\nlet { x13: [, { c13, ...d13 }] } = z();\nconst { x14: [...{ q14, ...y14 }] } = z();\nconst { x15: [...{ ...y16 }] } = z();\nconst { x16: [] } = z();\nconst [...[ ...y17 ]] = z();\nconst [...{ ...y18 }] = z();\nconst [...{ a19, ...y19 }] = z();\nconst { x20: { ...y20 } = { } } = z();\nconst { x22: { q22, ...y22  } = {} } = z();\nconst [[ ...y23 ] = []] = z();\nconst [{ ...y24 } = []] = z();\nconst { x25: [ ...y25 ] = []} = z();\nconst { x26: [ q26, ...y26 ] = []} = z();\nconst {} = {};\nconst [,,x27] = z();\nconst {x28: [,,{...y28}]} = z();\nconst {x29: [,,{q29, ...y29}]} = z();\nconst [,,{y30, ...x30}] = z();\nconst [,,{...x31}] = z();\nconst { x32: { }, w32: { ...y32 } } = z();\nconst [,,{}, {...q32}] = z();\nconst { ...y33 } = z();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[153],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[154],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[155],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[155],
      },
    ],
  },
  {
    title: 'object rest — variable exec (exec)',
    source:
      '// var { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };\n\n// expect(x).toBe(1);\n// expect(y).toBe(2);\n// expect(z).toEqual({ a: 3, b: 4 });\n\n// var complex = {\n//   x: { a: 1, b: 2, c: 3 },\n// };\n\n// var {\n//   x: { a: xa, ...xbc }\n// } = complex;\n\n// expect(xa).toBe(1);\n// expect(xbc).toEqual({ b: 2, c: 3});\n\n// // own properties\n// function ownX({ ...properties }) {\n//   return properties.x;\n// }\n// expect(ownX(Object.create({ x: 1 }))).toBeUndefined();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[156],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[156],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[156],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[156],
      },
    ],
  },
  {
    title: 'object rest — with array rest (input)',
    source:
      'let {\n  a: [b, ...arrayRest],\n  c = function(...functionRest){},\n  ...objectRest\n} = {\n  a: [1, 2, 3, 4],\n  d: "oyez"\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[157],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[158],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[159],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[159],
      },
    ],
  },
  {
    title: 'object spread loose builtins — side effect (exec)',
    source:
      'var k = { a: 1, b: 2 };\nvar o = { a: 3, ...k, b: k.a++ };\n// Loose will evaluate the static `b: k.a++` before spreading `...k`.\n// It should be {a: 1, b: 1}\nexpect(o).toEqual({a: 2, b: 1});\n\nvar k = { a: 1, get b() { l = { z: 9 }; return 2; } };\nvar l = { c: 3 };\nvar o = { ...k, ...l };\n// Loose will evaluate the `l` before spreading `...k`.\n// It should be {a: 1, b: 2, z: 9}\nexpect(o).toEqual({ a: 1, b: 2, c: 3 });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[160],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[160],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[162],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[161],
      },
    ],
  },
  {
    title: 'object spread loose builtins — side effect (input)',
    source:
      "var k = { a: 1, b: 2 };\nvar o = { a: 3, ...k, b: k.a++ };\n\nvar pureA = {};\nvar pureB = {};\nvar pureC = {};\nvar pureD = {};\nvar pureE = {};\n\nfunction impureFunc() {\n  console.log('hello')\n}\n\nvar output = { ...pureA, get foo() {}, get bar() {}, ...pureB, ...pureC, ...impureFunc(), ...pureD, pureD }\n\nvar simpleOutput = { ...pureA, test: '1', ...pureB,  }",
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[163],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[163],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[165],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[164],
      },
    ],
  },
  {
    title: 'object spread loose builtins — string exec (exec)',
    source:
      "expect([...'']).toHaveLength(0);\nexpect([...'abc']).toHaveLength(3);\nexpect([...'def']).toMatchObject(['d','e','f']);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[166],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[166],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[166],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[166],
      },
    ],
  },
  {
    title: 'object spread loose builtins — variable declaration (input)',
    source: 'var z = { ...x };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[167],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[167],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[169],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[168],
      },
    ],
  },
  {
    title: 'object spread — expression (exec)',
    source:
      'var log = [];\n\nvar a = {\n  ...{ get foo() { log.push(1); } },\n  get bar() { log.push(2); }\n};\n\nexpect(log).toEqual([1]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[170],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[170],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[172],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[171],
      },
    ],
  },
  {
    title: 'object spread — no object assign exec (exec)',
    source:
      "\"use strict\";\nObject.defineProperty(Object.prototype, 'NOSET', {\n  get(value) {\n    // noop\n  },\n});\n\nObject.defineProperty(Object.prototype, 'NOWRITE', {\n  writable: false,\n  value: 'abc',\n});\n\nconst obj = { NOSET: 123 };\n// this wouldn't work as expected if transformed as Object.assign (or equivalent)\n// because those trigger object setters (spread don't)\nconst objSpread = { ...obj };\nexpect(objSpread).toHaveProperty('NOSET', 123);\n\nconst obj2 = { NOWRITE: 456 };\n// this line would throw `TypeError: Cannot assign to read only property 'NOWRITE'`\n// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties\n// (spread defines them)\nconst obj2Spread = { ...obj2 };\nexpect(obj2Spread).toHaveProperty('NOWRITE', 456);\n\nconst KEY = Symbol('key');\nconst obj3Spread = { ...{ get foo () { return 'bar' } }, [KEY]: 'symbol' };\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');\nexpect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');\n\nconst obj4Spread = { ...Object.prototype };\nexpect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();\n\nexpect(() => ({ ...null, ...undefined })).not.toThrow();\n\nconst o = Object.create(null);\no.a = 'foo';\no.__proto__ = [];\nconst o2 = { ...o };\nexpect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[173],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[173],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[175],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[174],
      },
    ],
  },
  {
    title: 'object spread — side effect (exec)',
    source:
      'var k = { a: 1, b: 2 };\nvar o = { a: 3, ...k, b: k.a++ };\nexpect(o).toEqual({a: 1, b: 1});\n\nvar k = { a: 1, get b() { l = { z: 9 }; return 2; } };\nvar l = { c: 3 };\nvar o = { ...k, ...l };\nexpect(o).toEqual({ a: 1, b: 2, z: 9 });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[176],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[176],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[178],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[177],
      },
    ],
  },
  {
    title: 'regression — T7178 (input)',
    source:
      'import props from "props";\n\nconsole.log(props);\n\n(function(){\n  const { ...props } = this.props;\n\n  console.log(props);\n})();\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[179],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[180],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[181],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[181],
      },
    ],
  },
  {
    title: 'regression — gh 17274 (input)',
    source:
      '// Computed keys must be evaluated in source order (left-to-right)\n// even when nested object rest is involved. This test verifies\n// that log(0), log(1), log(2), log(3) execute in that order.\n\nfunction log(n) {\n  console.log(n);\n  return "x";\n}\n\nconst { [log(0)]: { [log(1)]: x, [log(2)]: y, ...rest }, [log(3)]: z } = { x: { x: {} } };\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[182],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[183],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[184],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[184],
      },
    ],
  },
  {
    title: 'regression — gh 4904 (input)',
    source:
      'const { s, ...t } = foo();\n\nconst { s: { q1, ...q2 }, ...q3 } = bar();\n\nconst { a } = foo(({ b, ...c }) => {\n  console.log(b, c);\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[185],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[186],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[187],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[187],
      },
    ],
  },
  {
    title: 'regression — gh 5151 (input)',
    source:
      'const { x, ...y } = a,\n  z = foo(y);\n\nconst { ...s } = r,\n  t = foo(s);\n\n// ordering is preserved\nvar l = foo(),\n    { m: { n, ...o }, ...p } = bar(),\n    q = baz();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[188],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[189],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[190],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[190],
      },
    ],
  },
  {
    title: 'regression — gh 7388 (input)',
    source:
      'function fn0(obj0) {\n  const {\n    fn1 = (obj1 = {}) => {\n      const {\n        fn2 = (obj2 = {}) => {\n          const {a, ...rest} = obj2;\n          console.log(rest);\n        }\n      } = obj1;\n    }\n  } = obj0;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[191],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[192],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[193],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[193],
      },
    ],
  },
  {
    title: 'regression — gh 8323 (input)',
    source:
      'const get = () => {\n  fireTheMissiles();\n  return 3;\n};\n\nconst f = ({ a = get(), b, c, ...z }) => {\n  const v = b + 3;\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[194],
      },
      {
        title: 'spec, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: false,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[194],
      },
      {
        title: 'loose, helpers',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[195],
      },
      {
        title: 'loose, built-ins',
        options: {
          transforms: {
            objectRestSpread: {
              loose: true,
              useBuiltIns: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[195],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
