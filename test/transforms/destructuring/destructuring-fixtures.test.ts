import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'allowArrayLike — holes (exec)',
    source: `var o = { 0: "a", 2: "c", length: 3 };

var [...rest] = o;

expect(rest).toEqual(["a", undefined, "c"]);
expect(1 in rest).toBe(true); // Not holey
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var o = {
  0: 'a',
  2: 'c',
  length: 3,
};
var _arr = _toArray(o, 0, true),
  rest = _arr;
expect(rest).toEqual(['a', undefined, 'c']);
expect(1 in rest).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'allowArrayLike — length cropped (exec)',
    source: `var o = { 0: "a", 1: "b", 2: "c", length: 2 };

var [first, ...rest] = o;

expect(first).toBe("a");
expect(rest).toEqual(["b"]);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var o = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 2,
};
var _arr = _toArray(o, 1, true),
  first = _arr[0],
  rest = _arr.slice(1);
expect(first).toBe('a');
expect(rest).toEqual(['b']);`,
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
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (exec)',
    source: `var o = { 0: "a", 1: "b", 2: "c", length: 3 };

var [first, ...rest] = o;

expect(first).toBe("a");
expect(rest).toEqual(["b", "c"]);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var o = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
};
var _arr = _toArray(o, 1, true),
  first = _arr[0],
  rest = _arr.slice(1);
expect(first).toBe('a');
expect(rest).toEqual(['b', 'c']);`,
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
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (input)',
    source: `var [first, ...rest] = o;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _arr = _toArray(o, 1, true),
  first = _arr[0],
  rest = _arr.slice(1);`,
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
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — basic (input)',
    source: `let [foo, bar] = baz;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
let _arr = _toArray(baz, 2, false),
  foo = _arr[0],
  bar = _arr[1];`,
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
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for in (input)',
    source: `for (var [name, value] in obj) {
  print("Name: " + name + ", Value: " + value);
}

for ([name, value] in obj) {
  print("Name: " + name + ", Value: " + value);
}
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref12, _arr13;
for (var _ref in obj) {
  var _arr = _toArray(_ref, 2, false),
    name = _arr[0],
    value = _arr[1];
  {
    print('Name: ' + name + ', Value: ' + value);
  }
}
for (_ref12 in obj) {
  ((_arr13 = _toArray(_ref12, 2, false)), (name = _arr13[0]), (value = _arr13[1]));
  {
    print('Name: ' + name + ', Value: ' + value);
  }
}`,
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest assignment expression (input)',
    source: `({ a, b, ...c } = obj);
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _ref, _obj;
((_ref = obj),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a = _obj.a),
  (b = _obj.b),
  (c = _objectWithoutProperties(_obj, ['a', 'b'])),
  _ref);`,
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest computed (input)',
    source: `let { [a]: b, ...c } = obj;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
let _obj = _objectDestructuringEmpty(obj),
  _key = _toPropertyKey(a),
  b = _obj[_key],
  c = _objectWithoutProperties(_obj, [_key]);`,
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest ignore symbols (exec)',
    source: `let sym = Symbol();

let { a, ...r } = { a: 1, b: 2, [sym]: 3 };

expect(a).toBe(1);
expect(r.b).toBe(2);
expect(sym in r).toBe(false);
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
let sym = Symbol();
let _obj = _objectDestructuringEmpty({
    a: 1,
    b: 2,
    [sym]: 3,
  }),
  a = _obj.a,
  r = _objectWithoutProperties(_obj, ['a']);
expect(a).toBe(1);
expect(r.b).toBe(2);
expect(sym in r).toBe(false);`,
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest nested (input)',
    source: `let { a, nested: { b, c, ...d }, e } = obj;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
let _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  _obj14 = _objectDestructuringEmpty(_obj.nested),
  b = _obj14.b,
  c = _obj14.c,
  d = _objectWithoutProperties(_obj14, ['b', 'c']),
  e = _obj.e;`,
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest var declaration (input)',
    source: `var { a, b, ...c } = obj;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['a', 'b']);`,
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
      },
    ],
  },
  {
    title: 'destructuring — array symbol unsupported (exec)',
    source: `var a = (() => [1, 2, 3])();

// Simulate old environment
global.Symbol = void 0;

var [first, ...rest] = a;

expect(first).toBe(1);
expect(rest).toEqual([2, 3]);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var a = (() => [1, 2, 3])();
// Simulate old environment
global.Symbol = void 0;
var _arr = _toArray(a, 1, true),
  first = _arr[0],
  rest = _arr.slice(1);
expect(first).toBe(1);
expect(rest).toEqual([2, 3]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — array symbol unsupported (input)',
    source: `var a = (() => [1, 2, 3])();

// !!! In order to run this test, this shouldn't be optimized using type inference
// If it's optimized and doesn't call toArray, please modify this test
// and exec.js
var [first, ...rest] = a;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var a = (() => [1, 2, 3])();
// !!! In order to run this test, this shouldn't be optimized using type inference
// If it's optimized and doesn't call toArray, please modify this test
// and exec.js
var _arr = _toArray(a, 1, true),
  first = _arr[0],
  rest = _arr.slice(1);`,
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
      },
    ],
  },
  {
    title: 'destructuring — array unpack optimisation (input)',
    source: `var [a, b] = [1, 2];
var [[a, b]] = [[1, 2]];
var [a, b, ...c] = [1, 2, 3, 4];
var [[a, b, ...c]] = [[1, 2, 3, 4]];

var [a, b] = [1, 2, 3];
var [[a, b]] = [[1, 2, 3]];
var [a, b] = [a, b];
[a[0], a[1]] = [a[1], a[0]];
var [a, b] = [...foo, bar];
var [a, b] = [foo(), bar];
var [a, b] = [clazz.foo(), bar];
var [a, b] = [clazz.foo, bar];
var [a, b] = [, 2];
[a, b] = [1, 2];
[a, b] = [, 2];
; // Avoid completion record special case
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref29, _arr30, _ref41, _arr42, _ref43, _arr44;
var _arr = _toArray([1, 2], 2, false),
  a = _arr[0],
  b = _arr[1];
var _arr15 = _toArray([[1, 2]], 1, false),
  _arr16 = _toArray(_arr15[0], 2, false),
  a = _arr16[0],
  b = _arr16[1];
var _arr18 = _toArray([1, 2, 3, 4], 2, true),
  a = _arr18[0],
  b = _arr18[1],
  c = _arr18.slice(2);
var _arr20 = _toArray([[1, 2, 3, 4]], 1, false),
  _arr21 = _toArray(_arr20[0], 2, true),
  a = _arr21[0],
  b = _arr21[1],
  c = _arr21.slice(2);
var _arr23 = _toArray([1, 2, 3], 2, false),
  a = _arr23[0],
  b = _arr23[1];
var _arr25 = _toArray([[1, 2, 3]], 1, false),
  _arr26 = _toArray(_arr25[0], 2, false),
  a = _arr26[0],
  b = _arr26[1];
var _arr28 = _toArray([a, b], 2, false),
  a = _arr28[0],
  b = _arr28[1];
((_ref29 = [a[1], a[0]]),
  (_arr30 = _toArray(_ref29, 2, false)),
  (a[0] = _arr30[0]),
  (a[1] = _arr30[1]),
  _ref29);
var _arr32 = _toArray([...foo, bar], 2, false),
  a = _arr32[0],
  b = _arr32[1];
var _arr34 = _toArray([foo(), bar], 2, false),
  a = _arr34[0],
  b = _arr34[1];
var _arr36 = _toArray([clazz.foo(), bar], 2, false),
  a = _arr36[0],
  b = _arr36[1];
var _arr38 = _toArray([clazz.foo, bar], 2, false),
  a = _arr38[0],
  b = _arr38[1];
var _arr40 = _toArray([, 2], 2, false),
  a = _arr40[0],
  b = _arr40[1];
((_ref41 = [1, 2]),
  (_arr42 = _toArray(_ref41, 2, false)),
  (a = _arr42[0]),
  (b = _arr42[1]),
  _ref41);
((_ref43 = [, 2]), (_arr44 = _toArray(_ref43, 2, false)), (a = _arr44[0]), (b = _arr44[1]), _ref43);`,
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
      },
    ],
  },
  {
    title: 'destructuring — array (input)',
    source: `var [a, [b], [c]] = ["hello", [", ", "junk"], ["world"]];
[a, [b], [c]] = ["hello", [", ", "junk"], ["world"]];
;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref13, _arr14, _arr15, _arr16;
var _arr = _toArray(['hello', [', ', 'junk'], ['world']], 3, false),
  a = _arr[0],
  _arr11 = _toArray(_arr[1], 1, false),
  b = _arr11[0],
  _arr12 = _toArray(_arr[2], 1, false),
  c = _arr12[0];
((_ref13 = ['hello', [', ', 'junk'], ['world']]),
  (_arr14 = _toArray(_ref13, 3, false)),
  (a = _arr14[0]),
  (_arr15 = _toArray(_arr14[1], 1, false)),
  (b = _arr15[0]),
  (_arr16 = _toArray(_arr14[2], 1, false)),
  (c = _arr16[0]),
  _ref13);`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment arrow function block (input)',
    source: `() => { [a, b] = [1, 2] }
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
};`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment arrow function no block (input)',
    source: `() => [a, b] = [1, 2]
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  return ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
};`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment expression completion record (input)',
    source: `var x, y;
[x, y] = [1, 2];
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
var x, y;
((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment expression pattern (input)',
    source: `var z = {};
var { x: { y } = {} } = z;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var z = {};
var _obj = _objectDestructuringEmpty(z),
  _value = _obj.x,
  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  y = _obj11.y;`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment expression (input)',
    source: `console.log([x] = [123]);
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
console.log(((_ref = [123]), (_arr = _toArray(_ref, 1, false)), (x = _arr[0]), _ref));`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment sequence expression completion record (input)',
    source: `var x, y;
([x, y] = [1, 2], y);
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
var x, y;
((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref, y);`,
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
      },
    ],
  },
  {
    title: 'destructuring — assignment statement (input)',
    source: `[a, b] = f();
;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
((_ref = f()), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);`,
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
      },
    ],
  },
  {
    title: 'destructuring — chained (exec)',
    source: `var a, b, c, d;
({ a, b } = ({ c, d } = { a: 1, b: 2, c: 3, d: 4}));
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toBe(3);
expect(d).toBe(4);
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref, _obj, _ref13, _obj14;
var a, b, c, d;
((_ref =
  ((_ref13 = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  }),
  (_obj14 = _objectDestructuringEmpty(_ref13)),
  (c = _obj14.c),
  (d = _obj14.d),
  _ref13)),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a = _obj.a),
  (b = _obj.b),
  _ref);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toBe(3);
expect(d).toBe(4);`,
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
      },
    ],
  },
  {
    title: 'destructuring — check iterator return (exec)',
    source: `expect(() => {
  var [] = {
    [Symbol.iterator]: () => {
      return {
        return: () => {},
      };
    },
  };
}).toThrow(TypeError);

expect(() => {
  var [] = {
    [Symbol.iterator]: () => {
      return {
        return: () => ({}),
      };
    },
  };
}).not.toThrow();

expect(() => {
  var [x] = {
    [Symbol.iterator]: () => {
      return {
        next: () => ({ done: false, value: 1 }),
        return: () => {},
      };
    },
  };
}).toThrow(TypeError);

expect(() => {
  var [x] = {
    [Symbol.iterator]: () => {
      return {
        next: () => ({ done: false, value: 1 }),
        return: () => ({}),
      };
    },
  };
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
expect(() => {
  var _arr = _toArray(
    {
      [Symbol.iterator]: () => {
        return { return: () => {} };
      },
    },
    0,
    false,
  );
}).toThrow(TypeError);
expect(() => {
  var _arr13 = _toArray(
    {
      [Symbol.iterator]: () => {
        return { return: () => ({}) };
      },
    },
    0,
    false,
  );
}).not.toThrow();
expect(() => {
  var _arr15 = _toArray(
      {
        [Symbol.iterator]: () => {
          return {
            next: () => ({
              done: false,
              value: 1,
            }),
            return: () => {},
          };
        },
      },
      1,
      false,
    ),
    x = _arr15[0];
}).toThrow(TypeError);
expect(() => {
  var _arr17 = _toArray(
      {
        [Symbol.iterator]: () => {
          return {
            next: () => ({
              done: false,
              value: 1,
            }),
            return: () => ({}),
          };
        },
      },
      1,
      false,
    ),
    x = _arr17[0];
}).not.toThrow();`,
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
      },
    ],
  },
  {
    title: 'destructuring — check iterator return (input)',
    source: `var [] = {
  [Symbol.iterator]: () => {
    return {
      return: () => {},
    };
  },
};

var [] = {
  [Symbol.iterator]: () => {
    return {
      return: () => ({}),
    };
  },
};

var [x] = {
  [Symbol.iterator]: () => {
    return {
      next: () => ({ done: false, value: 1 }),
      return: () => {},
    };
  },
};

var [x] = {
  [Symbol.iterator]: () => {
    return {
      next: () => ({ done: false, value: 1 }),
      return: () => ({}),
    };
  },
};
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _arr = _toArray(
  {
    [Symbol.iterator]: () => {
      return { return: () => {} };
    },
  },
  0,
  false,
);
var _arr11 = _toArray(
  {
    [Symbol.iterator]: () => {
      return { return: () => ({}) };
    },
  },
  0,
  false,
);
var _arr13 = _toArray(
    {
      [Symbol.iterator]: () => {
        return {
          next: () => ({
            done: false,
            value: 1,
          }),
          return: () => {},
        };
      },
    },
    1,
    false,
  ),
  x = _arr13[0];
var _arr15 = _toArray(
    {
      [Symbol.iterator]: () => {
        return {
          next: () => ({
            done: false,
            value: 1,
          }),
          return: () => ({}),
        };
      },
    },
    1,
    false,
  ),
  x = _arr15[0];`,
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
      },
    ],
  },
  {
    title: 'destructuring — check no hoisting when using template strings (input)',
    source: `const example = (obj) => {
  const foo = 'foo';
  const { [\`prefix_\${foo}\`]: _, ...rest } = obj;
};
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const example = obj => {
  const foo = 'foo';
  const _obj = _objectDestructuringEmpty(obj),
    _key = _toPropertyKey(\`prefix_\${foo}\`),
    _ = _obj[_key],
    rest = _objectWithoutProperties(_obj, [_key]);
};`,
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
      },
    ],
  },
  {
    title: 'destructuring — const (exec)',
    source: `const getState = () => ({});

const { data: { courses: oldCourses = [] } = {} } = getState();

expect(oldCourses).toEqual([]);
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
const getState = () => ({});
const _obj = _objectDestructuringEmpty(getState()),
  _value = _obj.data,
  _obj12 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  _value13 = _obj12.courses,
  oldCourses = _value13 === void 0 ? [] : _value13;
expect(oldCourses).toEqual([]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — const (input)',
    source: `const { data: { courses: oldCourses = [] } = {} } = getState();
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
const _obj = _objectDestructuringEmpty(getState()),
  _value = _obj.data,
  _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  _value12 = _obj11.courses,
  oldCourses = _value12 === void 0 ? [] : _value12;`,
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
      },
    ],
  },
  {
    title: 'destructuring — default precedence (exec)',
    source: `var f0 = function (a, b = a, c = b) {
  return [a, b, c];
};

expect(f0(1)).toEqual([1, 1, 1]);

var f1 = function ({a}, b = a, c = b) {
  return [a, b, c];
};

expect(f1({a: 1})).toEqual([1, 1, 1]);

var f2 = function ({a}, b = a, c = a) {
  return [a, b, c];
};

expect(f2({a: 1})).toEqual([1, 1, 1]);
`,
    filename: 'exec.js',
    output: `var f0 = function (a, b = a, c = b) {
  return [a, b, c];
};

expect(f0(1)).toEqual([1, 1, 1]);

var f1 = function ({ a }, b = a, c = b) {
  return [a, b, c];
};

expect(f1({ a: 1 })).toEqual([1, 1, 1]);

var f2 = function ({ a }, b = a, c = a) {
  return [a, b, c];
};

expect(f2({ a: 1 })).toEqual([1, 1, 1]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — default precedence (input)',
    source: `var f0 = function (a, b = a, c = b) {
  return [a, b, c];
};

expect(f0(1)).toEqual([1, 1, 1]);

var f1 = function ({a}, b = a, c = b) {
  return [a, b, c];
};

expect(f1({a: 1})).toEqual([1, 1, 1]);

var f2 = function ({a}, b = a, c = a) {
  return [a, b, c];
};

expect(f2({a: 1})).toEqual([1, 1, 1]);
`,
    filename: 'input.js',
    output: `var f0 = function (a, b = a, c = b) {
  return [a, b, c];
};

expect(f0(1)).toEqual([1, 1, 1]);

var f1 = function ({ a }, b = a, c = b) {
  return [a, b, c];
};

expect(f1({ a: 1 })).toEqual([1, 1, 1]);

var f2 = function ({ a }, b = a, c = a) {
  return [a, b, c];
};

expect(f2({ a: 1 })).toEqual([1, 1, 1]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — destructuring empty in for (input)',
    source: `for ( let x in y ) for ( ; ; ) var { } = x ;

for ( let x in y ) for ( var { } = x ; ; ) ;

for ( let x in y ) for ( ; { } = x ; {} = x ) var { } = x ;

for ( let { } = 0 ; 0 ; ) ;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref12, _obj13, _ref14, _obj15;
for (let x in y) for (;;) var _obj = _objectDestructuringEmpty(x);
for (let x in y) for (var _obj11 = _objectDestructuringEmpty(x); ;);
for (let x in y)
  for (
    ;
    (_ref12 = x), (_obj13 = _objectDestructuringEmpty(_ref12)), _ref12;
    _ref14 = x, _obj15 = _objectDestructuringEmpty(_ref14), _ref14
  )
    var _obj17 = _objectDestructuringEmpty(x);
for (let _obj19 = _objectDestructuringEmpty(0); 0;);`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty array pattern (exec)',
    source: `expect(() => {
  var [] = null;
}).toThrow(TypeError);

expect(() => {
  var [] = 42;
}).toThrow(TypeError);

expect(() => {
  var [] = {};
}).toThrow(TypeError);

expect(() => {
  var [] = { [Symbol.iterator]: () => {} };
}).toThrow(TypeError);

expect(() => {
  var [] = [];
  var [] = [0, 1, 2];
  var [] = "foo";
  var [] = (function*() { throw new Error("Should not throw"); })();
  var [] = { [Symbol.iterator]: () => ({}) };
  var [] = { [Symbol.iterator]: () => () => {} };
  var [] = { [Symbol.iterator]: async function*() {} };
}).not.toThrow();

// iterator.return should be called
var returnCalled = false;
var [] = {
  [Symbol.iterator]: () => {
    return {
      return: () => {
        returnCalled = true;
        return {};
      },
    };
  },
};
expect(returnCalled).toStrictEqual(true);

// #15154
expect(() => {
  var [] = { [Symbol.iterator]: () => [] };
}).not.toThrow();

// #15168
expect(() => {
  var [] = { [Symbol.iterator]: () => async function* () {} };
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
expect(() => {
  var _arr = _toArray(null, 0, false);
}).toThrow(TypeError);
expect(() => {
  var _arr14 = _toArray(42, 0, false);
}).toThrow(TypeError);
expect(() => {
  var _arr16 = _toArray({}, 0, false);
}).toThrow(TypeError);
expect(() => {
  var _arr18 = _toArray({ [Symbol.iterator]: () => {} }, 0, false);
}).toThrow(TypeError);
expect(() => {
  var _arr20 = _toArray([], 0, false);
  var _arr22 = _toArray([0, 1, 2], 0, false);
  var _arr24 = _toArray('foo', 0, false);
  var _arr26 = _toArray(
    (function* () {
      throw new Error('Should not throw');
    })(),
    0,
    false,
  );
  var _arr28 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);
  var _arr30 = _toArray({ [Symbol.iterator]: () => () => {} }, 0, false);
  var _arr32 = _toArray({ [Symbol.iterator]: async function* () {} }, 0, false);
}).not.toThrow();
// iterator.return should be called
var returnCalled = false;
var _arr34 = _toArray(
  {
    [Symbol.iterator]: () => {
      return {
        return: () => {
          returnCalled = true;
          return {};
        },
      };
    },
  },
  0,
  false,
);
expect(returnCalled).toStrictEqual(true);
// #15154
expect(() => {
  var _arr36 = _toArray({ [Symbol.iterator]: () => [] }, 0, false);
}).not.toThrow();
// #15168
expect(() => {
  var _arr38 = _toArray({ [Symbol.iterator]: () => async function* () {} }, 0, false);
}).not.toThrow();`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty array pattern (input)',
    source: `var [] = null;
var [] = 42;
var [] = {};
var [] = { [Symbol.iterator]: () => {} };

var [] = [];
var [] = [0, 1, 2];
var [] = "foo";
var [] = (function*() { throw new Error("Should not throw"); })();
var [] = { [Symbol.iterator]: () => ({}) };
var [] = { [Symbol.iterator]: () => () => {} };
var [] = { [Symbol.iterator]: async function*() {} };

// iterator.return should be called
var returnCalled = false;
var [] = {
  [Symbol.iterator]: () => {
    return {
      return: () => {
        returnCalled = true;
        return {};
      },
    };
  },
};

// #15154
var [] = { [Symbol.iterator]: () => [] };

// #15168
var [] = { [Symbol.iterator]: () => async function* () {} };
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _arr = _toArray(null, 0, false);
var _arr12 = _toArray(42, 0, false);
var _arr14 = _toArray({}, 0, false);
var _arr16 = _toArray({ [Symbol.iterator]: () => {} }, 0, false);
var _arr18 = _toArray([], 0, false);
var _arr20 = _toArray([0, 1, 2], 0, false);
var _arr22 = _toArray('foo', 0, false);
var _arr24 = _toArray(
  (function* () {
    throw new Error('Should not throw');
  })(),
  0,
  false,
);
var _arr26 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);
var _arr28 = _toArray({ [Symbol.iterator]: () => () => {} }, 0, false);
var _arr30 = _toArray({ [Symbol.iterator]: async function* () {} }, 0, false);
// iterator.return should be called
var returnCalled = false;
var _arr32 = _toArray(
  {
    [Symbol.iterator]: () => {
      return {
        return: () => {
          returnCalled = true;
          return {};
        },
      };
    },
  },
  0,
  false,
);
// #15154
var _arr34 = _toArray({ [Symbol.iterator]: () => [] }, 0, false);
// #15168
var _arr36 = _toArray({ [Symbol.iterator]: () => async function* () {} }, 0, false);`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty object pattern (exec)',
    source: `expect(function () {
  var {} = null;
}).toThrow("Cannot destructure null");
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
expect(function () {
  var _obj = _objectDestructuringEmpty(null);
}).toThrow('Cannot destructure null');`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty object pattern (input)',
    source: `var {} = null;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _obj = _objectDestructuringEmpty(null);`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty string (exec)',
    source: `let [a] = '';

expect(a).toBe(undefined)
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
let _arr = _toArray('', 1, false),
  a = _arr[0];
expect(a).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty string (input)',
    source: `let [a] = '';
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
let _arr = _toArray('', 1, false),
  a = _arr[0];`,
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
      },
    ],
  },
  {
    title: 'destructuring — empty (input)',
    source: `var [, a, [b], [c], d] = ["foo", "hello", [", ", "junk"], ["world"]];
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _arr = _toArray(['foo', 'hello', [', ', 'junk'], ['world']], 5, false),
  a = _arr[1],
  _arr12 = _toArray(_arr[2], 1, false),
  b = _arr12[0],
  _arr13 = _toArray(_arr[3], 1, false),
  c = _arr13[0],
  d = _arr[4];`,
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
      },
    ],
  },
  {
    title: 'destructuring — es7 object rest builtins (input)',
    source: `var z = {};
var { ...x } = z;
var { x, ...y } = z;
var { [x]: x, ...y } = z;
(function({ x, ...y }) { });

({ x, y, ...z } = o);
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref17, _obj18;
var z = {};
var _obj = _objectDestructuringEmpty(z),
  x = _extends({}, _obj);
var _obj13 = _objectDestructuringEmpty(z),
  x = _obj13.x,
  y = _objectWithoutProperties(_obj13, ['x']);
var _obj15 = _objectDestructuringEmpty(z),
  _key = _toPropertyKey(x),
  x = _obj15[_key],
  y = _objectWithoutProperties(_obj15, [_key]);
(function ({ x, ...y }) {});
((_ref17 = o),
  (_obj18 = _objectDestructuringEmpty(_ref17)),
  (x = _obj18.x),
  (y = _obj18.y),
  (z = _objectWithoutProperties(_obj18, ['x', 'y'])),
  _ref17);`,
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
      },
    ],
  },
  {
    title: 'destructuring — export variable (input)',
    source: `
export let {a, b, c: {d, e: {f = 4}}} = {};
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
export let _obj = _objectDestructuringEmpty({}),
  a = _obj.a,
  b = _obj.b,
  _obj12 = _objectDestructuringEmpty(_obj.c),
  d = _obj12.d,
  _obj13 = _objectDestructuringEmpty(_obj12.e),
  _value = _obj13.f,
  f = _value === void 0 ? 4 : _value;`,
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
      },
    ],
  },
  {
    title: 'destructuring — for let nest (input)',
    source: `for (let [[x] = [1]] = [];  ;  ) {
}`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
for (
  let _arr = _toArray([], 1, false),
    _value = _arr[0],
    _arr10 = _toArray(_value === void 0 ? [1] : _value, 1, false),
    x = _arr10[0];
  ;
) {}`,
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
      },
    ],
  },
  {
    title: 'destructuring — for let (input)',
    source: `for (let [ i, n ] = range; ; ) {
}
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
for (let _arr = _toArray(range, 2, false), i = _arr[0], n = _arr[1]; ;) {}`,
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
      },
    ],
  },
  {
    title: 'destructuring — for of shadowed block scoped (exec)',
    source: `var O = {
  a: "a"
}
const a = "a";
for (const { [a]: _ } of [O]) { const a = "A"; }

var _;
for ({ [a]: _ } of [O]) { const a = "A"; }
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref12, _obj13, _key14;
var O = { a: 'a' };
const a = 'a';
for (const _ref of [O]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = a,
    _ = _obj[_key];
  {
    const a = 'A';
  }
}
var _;
for (_ref12 of [O]) {
  ((_obj13 = _objectDestructuringEmpty(_ref12)), (_key14 = a), (_ = _obj13[_key14]));
  {
    const a = 'A';
  }
}`,
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
      },
    ],
  },
  {
    title: 'destructuring — for of shadowed block scoped (input)',
    source: `var O = {
  a: "a"
}
const a = "a";
for (const { [a]: _ } of [O]) { const a = "A"; }

var _;
for ({ [a]: _ } of [O]) { const a = "A"; }
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref12, _obj13, _key14;
var O = { a: 'a' };
const a = 'a';
for (const _ref of [O]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = a,
    _ = _obj[_key];
  {
    const a = 'A';
  }
}
var _;
for (_ref12 of [O]) {
  ((_obj13 = _objectDestructuringEmpty(_ref12)), (_key14 = a), (_ = _obj13[_key14]));
  {
    const a = 'A';
  }
}`,
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
      },
    ],
  },
  {
    title: 'destructuring — for of (input)',
    source: `for (var [ name, before, after ] of test.expectation.registers) {

}

for ([ name, before, after ] of test.expectation.registers) {

}
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref12, _arr13;
for (var _ref of test.expectation.registers) {
  var _arr = _toArray(_ref, 3, false),
    name = _arr[0],
    before = _arr[1],
    after = _arr[2];
  {
  }
}
for (_ref12 of test.expectation.registers) {
  ((_arr13 = _toArray(_ref12, 3, false)),
    (name = _arr13[0]),
    (before = _arr13[1]),
    (after = _arr13[2]));
  {
  }
}`,
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
      },
    ],
  },
  {
    title: 'destructuring — function key with object rest spread (exec)',
    source: `const { [(() => 1)()]: a, ...rest } = { 1: "a" };

expect(a).toBe("a");
expect(rest).toEqual({});
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const _obj = _objectDestructuringEmpty({ 1: 'a' }),
  _key = _toPropertyKey((() => 1)()),
  a = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(a).toBe('a');
expect(rest).toEqual({});`,
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
      },
    ],
  },
  {
    title: 'destructuring — inherited array (exec)',
    source: `class ExtendedArray extends Array {
  constructor(...args) {
    super(...args);
  }
}

let extArr = new ExtendedArray(1,2,3,4,5);
let [first, second , ...rest] = extArr;

expect(Object.getPrototypeOf(rest).constructor.name).toBe("Array");
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
class ExtendedArray extends Array {
  constructor(...args) {
    super(...args);
  }
}
let extArr = new ExtendedArray(1, 2, 3, 4, 5);
let _arr = _toArray(extArr, 2, true),
  first = _arr[0],
  second = _arr[1],
  rest = _arr.slice(2);
expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');`,
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
      },
    ],
  },
  {
    title: 'destructuring — init hole (exec)',
    source: `let [x = 23] = [,];
expect(x).toEqual(23);

const [y = 24, z] = [, 42];
expect(y).toEqual(24);
expect(z).toEqual(42);

function* foo() {
    yield 1;
    yield 2;
}

let bar = foo();

const [a = bar.next().value, b] = [, bar.next().value];

expect(a).toEqual(2);
expect(b).toEqual(1);

const arr = [c = 42] = [,];
expect(c).toEqual(42);
expect(arr).toStrictEqual([,]);

var iterCount = 0;

for (const [x = 23] = [,]; iterCount < 1; ) {
    expect(x).toEqual(23);
    // another statement

    iterCount += 1;
}

expect(iterCount).toEqual(1);

const [...d] = [,];
const [...{ 0: e }] = [,];

expect(d).toStrictEqual([undefined,]);
expect(e).toEqual(undefined);

const [f] = [,];
expect(f).toEqual(undefined);

let [g] = [,];
expect(g).toEqual(undefined);

let thrown;
try {
  thrown = false;
  [{}] = [,];
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);

try {
  thrown = false;
  [[]] = [,];
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref32, _arr33, _value34, _ref47, _arr48, _obj49, _ref50, _arr51, _arr52;
let _arr = _toArray([,], 1, false),
  _value = _arr[0],
  x = _value === void 0 ? 23 : _value;
expect(x).toEqual(23);
const _arr27 = _toArray([, 42], 2, false),
  _value28 = _arr27[0],
  y = _value28 === void 0 ? 24 : _value28,
  z = _arr27[1];
expect(y).toEqual(24);
expect(z).toEqual(42);
function* foo() {
  yield 1;
  yield 2;
}
let bar = foo();
const _arr30 = _toArray([, bar.next().value], 2, false),
  _value31 = _arr30[0],
  a = _value31 === void 0 ? bar.next().value : _value31,
  b = _arr30[1];
expect(a).toEqual(2);
expect(b).toEqual(1);
const arr =
  ((_ref32 = [,]),
  (_arr33 = _toArray(_ref32, 1, false)),
  (_value34 = _arr33[0]),
  (c = _value34 === void 0 ? 42 : _value34),
  _ref32);
expect(c).toEqual(42);
expect(arr).toStrictEqual([,]);
var iterCount = 0;
for (
  const _arr36 = _toArray([,], 1, false),
    _value37 = _arr36[0],
    x = _value37 === void 0 ? 23 : _value37;
  iterCount < 1;
) {
  expect(x).toEqual(23);
  // another statement
  iterCount += 1;
}
expect(iterCount).toEqual(1);
const _arr39 = _toArray([,], 0, true),
  d = _arr39;
const _arr41 = _toArray([,], 0, true),
  _obj = _objectDestructuringEmpty(_arr41),
  e = _obj[0];
expect(d).toStrictEqual([undefined]);
expect(e).toEqual(undefined);
const _arr44 = _toArray([,], 1, false),
  f = _arr44[0];
expect(f).toEqual(undefined);
let _arr46 = _toArray([,], 1, false),
  g = _arr46[0];
expect(g).toEqual(undefined);
let thrown;
try {
  thrown = false;
  ((_ref47 = [,]),
    (_arr48 = _toArray(_ref47, 1, false)),
    (_obj49 = _objectDestructuringEmpty(_arr48[0])),
    _ref47);
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);
try {
  thrown = false;
  ((_ref50 = [,]),
    (_arr51 = _toArray(_ref50, 1, false)),
    (_arr52 = _toArray(_arr51[0], 0, false)),
    _ref50);
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);`,
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
      },
    ],
  },
  {
    title: 'destructuring — init hole (input)',
    source: `let [x = 23] = [,];
expect(x).toEqual(23);

const [y = 24, z] = [, 42];
expect(y).toEqual(24);
expect(z).toEqual(42);

function* foo() {
    yield 1;
    yield 2;
}

let bar = foo();

const [a = bar.next().value, b] = [, bar.next().value];

expect(a).toEqual(2);
expect(b).toEqual(1);

const arr = [c = 42] = [,];
expect(c).toEqual(42);
expect(arr).toStrictEqual([,]);

var iterCount = 0;

for (const [x = 23] = [,]; iterCount < 1; ) {
    expect(x).toEqual(23);
    // another statement

    iterCount += 1;
}

expect(iterCount).toEqual(1);

const [...d] = [,];
const [...{ 0: e }] = [,];

expect(d).toStrictEqual([,]);
expect(e).toEqual(undefined);

const [f] = [,];
expect(f).toEqual(undefined);

let [g] = [,];
expect(g).toEqual(undefined);

let thrown;
try {
  thrown = false;
  [{}] = [,];
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);

try {
  thrown = false;
  [[]] = [,];
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _ref32, _arr33, _value34, _ref47, _arr48, _obj49, _ref50, _arr51, _arr52;
let _arr = _toArray([,], 1, false),
  _value = _arr[0],
  x = _value === void 0 ? 23 : _value;
expect(x).toEqual(23);
const _arr27 = _toArray([, 42], 2, false),
  _value28 = _arr27[0],
  y = _value28 === void 0 ? 24 : _value28,
  z = _arr27[1];
expect(y).toEqual(24);
expect(z).toEqual(42);
function* foo() {
  yield 1;
  yield 2;
}
let bar = foo();
const _arr30 = _toArray([, bar.next().value], 2, false),
  _value31 = _arr30[0],
  a = _value31 === void 0 ? bar.next().value : _value31,
  b = _arr30[1];
expect(a).toEqual(2);
expect(b).toEqual(1);
const arr =
  ((_ref32 = [,]),
  (_arr33 = _toArray(_ref32, 1, false)),
  (_value34 = _arr33[0]),
  (c = _value34 === void 0 ? 42 : _value34),
  _ref32);
expect(c).toEqual(42);
expect(arr).toStrictEqual([,]);
var iterCount = 0;
for (
  const _arr36 = _toArray([,], 1, false),
    _value37 = _arr36[0],
    x = _value37 === void 0 ? 23 : _value37;
  iterCount < 1;
) {
  expect(x).toEqual(23);
  // another statement
  iterCount += 1;
}
expect(iterCount).toEqual(1);
const _arr39 = _toArray([,], 0, true),
  d = _arr39;
const _arr41 = _toArray([,], 0, true),
  _obj = _objectDestructuringEmpty(_arr41),
  e = _obj[0];
expect(d).toStrictEqual([,]);
expect(e).toEqual(undefined);
const _arr44 = _toArray([,], 1, false),
  f = _arr44[0];
expect(f).toEqual(undefined);
let _arr46 = _toArray([,], 1, false),
  g = _arr46[0];
expect(g).toEqual(undefined);
let thrown;
try {
  thrown = false;
  ((_ref47 = [,]),
    (_arr48 = _toArray(_ref47, 1, false)),
    (_obj49 = _objectDestructuringEmpty(_arr48[0])),
    _ref47);
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);
try {
  thrown = false;
  ((_ref50 = [,]),
    (_arr51 = _toArray(_ref50, 1, false)),
    (_arr52 = _toArray(_arr51[0], 0, false)),
    _ref50);
} catch (e) {
  thrown = true;
}
expect(thrown).toEqual(true);`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 3081 (input)',
    source: `let list = [1, 2, 3, 4];
for (let i = 0, { length } = list; i < length; i++) {
  list[i];
}
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
let list = [1, 2, 3, 4];
for (let i = 0, _obj = _objectDestructuringEmpty(list), length = _obj.length; i < length; i++) {
  list[i];
}`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 5090 (exec)',
    source: `const assign = function([...arr], index, value) {
  arr[index] = value;
  return arr;
}

const arr = [1, 2, 3];
assign(arr, 1, 42);

expect(arr).toEqual([1, 2, 3]);
`,
    filename: 'exec.js',
    output: `const assign = function ([...arr], index, value) {
  arr[index] = value;
  return arr;
};

const arr = [1, 2, 3];
assign(arr, 1, 42);

expect(arr).toEqual([1, 2, 3]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 5628 (input)',
    source: `(function () {
  let q;
  let w;
  let e;
  if (true) [q, w, e] = [1, 2, 3].map(()=>123);
})();
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
(function () {
  var _ref, _arr;
  let q;
  let w;
  let e;
  if (true)
    ((_ref = [1, 2, 3].map(() => 123)),
      (_arr = _toArray(_ref, 3, false)),
      (q = _arr[0]),
      (w = _arr[1]),
      (e = _arr[2]),
      _ref);
})();`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 5744 (input)',
    source: `if (true) [a, b] = [b, a];
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
if (true) ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 6373 (input)',
    source: `import { NestedObjects } from "./some-module"

const { Foo, Bar } = NestedObjects
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
import { NestedObjects } from './some-module';
const _obj = _objectDestructuringEmpty(NestedObjects),
  Foo = _obj.Foo,
  Bar = _obj.Bar;`,
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
      },
    ],
  },
  {
    title: 'destructuring — issue 9834 (input)',
    source: `const input = {};

const {
  given_name: givenName,
  'last_name': lastName,
  [\`country\`]: country,
  [prefix + 'state']: state,
  [\`\${prefix}consents\`]: consents,
  ...rest
} = input;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const input = {};
const _obj = _objectDestructuringEmpty(input),
  givenName = _obj.given_name,
  lastName = _obj['last_name'],
  _key = _toPropertyKey(\`country\`),
  country = _obj[_key],
  _key17 = _toPropertyKey(prefix + 'state'),
  state = _obj[_key17],
  _key18 = _toPropertyKey(\`\${prefix}consents\`),
  consents = _obj[_key18],
  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key, _key17, _key18]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — known array (input)',
    source: `var z = [];
var [x, ...y] = z;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var z = [];
var _arr = _toArray(z, 1, true),
  x = _arr[0],
  y = _arr.slice(1);`,
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
      },
    ],
  },
  {
    title: 'destructuring — member expression (input)',
    source: `[foo.foo, foo.bar] = [1, 2];
;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _ref, _arr;
((_ref = [1, 2]),
  (_arr = _toArray(_ref, 2, false)),
  (foo.foo = _arr[0]),
  (foo.bar = _arr[1]),
  _ref);`,
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
      },
    ],
  },
  {
    title: 'destructuring — mixed (input)',
    source: `var rect = {};
var {topLeft: [x1, y1], bottomRight: [x2, y2] } = rect;
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var rect = {};
var _obj = _objectDestructuringEmpty(rect),
  _arr = _toArray(_obj.topLeft, 2, false),
  x1 = _arr[0],
  y1 = _arr[1],
  _arr14 = _toArray(_obj.bottomRight, 2, false),
  x2 = _arr14[0],
  y2 = _arr14[1];`,
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
      },
    ],
  },
  {
    title: 'destructuring — multiple (input)',
    source: `var coords = [1, 2];
var { x, y } = coords,
    foo = "bar";
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var coords = [1, 2];
var _obj = _objectDestructuringEmpty(coords),
  x = _obj.x,
  y = _obj.y,
  foo = 'bar';`,
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
      },
    ],
  },
  {
    title: 'destructuring — next eval once (exec)',
    source: `let gets = 0;
let it = {
  [Symbol.iterator]: () => ({
    get next() {
      gets++;
      let i = 0;
      return () => ({ done: false, value: i++ });
    },
  }),
};

let [] = it;
expect(gets).toBe(1);

let [a] = it;
expect(gets).toBe(2);
expect(a).toBe(0);

let [b, c] = it;
expect(gets).toBe(3);
expect(b).toBe(0);
expect(c).toBe(1);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
let gets = 0;
let it = {
  [Symbol.iterator]: () => ({
    get next() {
      gets++;
      let i = 0;
      return () => ({
        done: false,
        value: i++,
      });
    },
  }),
};
let _arr = _toArray(it, 0, false);
expect(gets).toBe(1);
let _arr17 = _toArray(it, 1, false),
  a = _arr17[0];
expect(gets).toBe(2);
expect(a).toBe(0);
let _arr19 = _toArray(it, 2, false),
  b = _arr19[0],
  c = _arr19[1];
expect(gets).toBe(3);
expect(b).toBe(0);
expect(c).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'destructuring — non iterable (exec)',
    source: `var foo, bar;

expect(
  () => [foo, bar] = undefined
).toThrow(/destructure non-iterable/);

expect(
  () => [foo, bar] = {}
).toThrow(/destructure non-iterable/);

global.Symbol = void 0;

expect(
  () => [foo, bar] = {}
).toThrow(/destructure non-iterable/);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
var foo, bar;
expect(() => {
  var _ref, _arr;
  return (
    (_ref = undefined), (_arr = _toArray(_ref, 2, false)), (foo = _arr[0]), (bar = _arr[1]), _ref
  );
}).toThrow(/destructure non-iterable/);
expect(() => {
  var _ref13, _arr14;
  return (
    (_ref13 = {}),
    (_arr14 = _toArray(_ref13, 2, false)),
    (foo = _arr14[0]),
    (bar = _arr14[1]),
    _ref13
  );
}).toThrow(/destructure non-iterable/);
global.Symbol = void 0;
expect(() => {
  var _ref15, _arr16;
  return (
    (_ref15 = {}),
    (_arr16 = _toArray(_ref15, 2, false)),
    (foo = _arr16[0]),
    (bar = _arr16[1]),
    _ref15
  );
}).toThrow(/destructure non-iterable/);`,
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
      },
    ],
  },
  {
    title: 'destructuring — number key with object rest spread (exec)',
    source: `const foo = {
  1: "a",
  2: "b",
  3: "c",
};

const { [1]: bar, ...rest } = foo;

expect(bar).toBe("a");
expect(rest).toEqual({ 2: "b", 3: "c" });
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const foo = {
  1: 'a',
  2: 'b',
  3: 'c',
};
const _obj = _objectDestructuringEmpty(foo),
  _key = _toPropertyKey(1),
  bar = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(bar).toBe('a');
expect(rest).toEqual({
  2: 'b',
  3: 'c',
});`,
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
      },
    ],
  },
  {
    title: 'destructuring — object advanced (input)',
    source: `var rect = {};
var {topLeft: {x: x1, y: y1}, bottomRight: {x: x2, y: y2}} = rect;
var { 3: foo, 5: bar } = [0, 1, 2, 3, 4, 5, 6];
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var rect = {};
var _obj = _objectDestructuringEmpty(rect),
  _obj15 = _objectDestructuringEmpty(_obj.topLeft),
  x1 = _obj15.x,
  y1 = _obj15.y,
  _obj16 = _objectDestructuringEmpty(_obj.bottomRight),
  x2 = _obj16.x,
  y2 = _obj16.y;
var _obj18 = _objectDestructuringEmpty([0, 1, 2, 3, 4, 5, 6]),
  foo = _obj18[3],
  bar = _obj18[5];`,
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
      },
    ],
  },
  {
    title: 'destructuring — object basic (input)',
    source: `var coords = [1, 2];
var { x, y } = coords;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var coords = [1, 2];
var _obj = _objectDestructuringEmpty(coords),
  x = _obj.x,
  y = _obj.y;`,
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
      },
    ],
  },
  {
    title: 'destructuring — object rest impure computed keys (exec)',
    source: `var key, x, y, z;
// impure
key = 1;
var { [key++]: y, ...x } = { 1: 1, a: 1 };
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(1).toBe(y);

// takes care of the order

key = 1;
var { [++key]: y, [++key]: z, ...rest} = {2: 2, 3: 3};
expect(y).toBe(2);
expect(z).toBe(3);

// pure, computed property should remain as-is
key = 2;
({ [key]: y, z, ...x } = {2: "two", z: "zee"});
expect(y).toBe("two");
expect(x).toEqual({});
expect(z).toBe("zee");

// rhs evaluated before lhs
var order = [];
function left() {
  order.push("left");
  return 0;
}
function right() {
  order.push("right");
  return {};
}
var { [left()]: y, ...x} = right();
expect(order).toEqual(["right", "left"]);
`,
    filename: 'exec.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref22, _obj23, _key24;
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: 1,
    a: 1,
  }),
  _key = _toPropertyKey(key++),
  y = _obj[_key],
  x = _objectWithoutProperties(_obj, [_key]);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(1).toBe(y);
// takes care of the order
key = 1;
var _obj19 = _objectDestructuringEmpty({
    2: 2,
    3: 3,
  }),
  _key20 = _toPropertyKey(++key),
  y = _obj19[_key20],
  _key21 = _toPropertyKey(++key),
  z = _obj19[_key21],
  rest = _objectWithoutProperties(_obj19, [_key20, _key21]);
expect(y).toBe(2);
expect(z).toBe(3);
// pure, computed property should remain as-is
key = 2;
((_ref22 = {
  2: 'two',
  z: 'zee',
}),
  (_obj23 = _objectDestructuringEmpty(_ref22)),
  (_key24 = _toPropertyKey(key)),
  (y = _obj23[_key24]),
  (z = _obj23.z),
  (x = _objectWithoutProperties(_obj23, [_key24, 'z'])),
  _ref22);
expect(y).toBe('two');
expect(x).toEqual({});
expect(z).toBe('zee');
// rhs evaluated before lhs
var order = [];
function left() {
  order.push('left');
  return 0;
}
function right() {
  order.push('right');
  return {};
}
var _obj26 = _objectDestructuringEmpty(right()),
  _key27 = _toPropertyKey(left()),
  y = _obj26[_key27],
  x = _objectWithoutProperties(_obj26, [_key27]);
expect(order).toEqual(['right', 'left']);`,
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
      },
    ],
  },
  {
    title: 'destructuring — object rest impure computed keys (input)',
    source: `var { [fn()]: x, ...y } = z;
`,
    filename: 'input.js',
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutProperties: require('@babel/runtime/helpers/objectWithoutProperties'),
};
function _objectWithoutProperties(t, e) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(t),
    _objectWithoutProperties2.objectWithoutProperties(t, e)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _obj = _objectDestructuringEmpty(z),
  _key = _toPropertyKey(fn()),
  x = _obj[_key],
  y = _objectWithoutProperties(_obj, [_key]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — parameters (input)',
    source: `function somethingAdvanced({topLeft: {x: x1, y: y1} = {}, bottomRight: {x: x2, y: y2} = {}}, p2, p3){

}

function unpackObject({title: title, author: author}) {
  return title + " " + author;
}

console.log(unpackObject({title: "title", author: "author"}));

var unpackArray = function ([a, b, c], [x, y, z]) {
  return a+b+c;
};

console.log(unpackArray(["hello", ", ", "world"], [1, 2, 3]));
`,
    filename: 'input.js',
    output: `function somethingAdvanced(
  { topLeft: { x: x1, y: y1 } = {}, bottomRight: { x: x2, y: y2 } = {} },
  p2,
  p3,
) {}

function unpackObject({ title: title, author: author }) {
  return title + ' ' + author;
}

console.log(unpackObject({ title: 'title', author: 'author' }));

var unpackArray = function ([a, b, c], [x, y, z]) {
  return a + b + c;
};

console.log(unpackArray(['hello', ', ', 'world'], [1, 2, 3]));`,
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
      },
    ],
  },
  {
    title: 'destructuring — spread generator (exec)',
    source: `function* f() {
  for (var i = 0; i < 3; i++) {
    yield i;
  }
}
var [...xs] = f();
expect(xs).toEqual([0, 1, 2]);
`,
    filename: 'exec.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
function* f() {
  for (var i = 0; i < 3; i++) {
    yield i;
  }
}
var _arr = _toArray(f(), 0, true),
  xs = _arr;
expect(xs).toEqual([0, 1, 2]);`,
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
      },
    ],
  },
  {
    title: 'destructuring — spread (input)',
    source: `function isSorted([x, y, ...wow]) {
  if (!zs.length) return true
  if (y > x) return isSorted(zs)
  return false
}
`,
    filename: 'input.js',
    output: `function isSorted([x, y, ...wow]) {
  if (!zs.length) return true;
  if (y > x) return isSorted(zs);
  return false;
}`,
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
      },
    ],
  },
  {
    title: 'regression — 11210 (input)',
    source: `export default class A {
  handle = value => {
    ({ value } = {});
  }
}
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
export default class A {
  handle = value => {
    var _ref, _obj;
    ((_ref = {}), (_obj = _objectDestructuringEmpty(_ref)), (value = _obj.value), _ref);
  };
}`,
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
      },
    ],
  },
  {
    title: 'regression — 8528 (input)',
    source: `function isBetween(x, a, b) {
  if (a > b) [a, b] = [b, a];
  return x > a && x < b;
}
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
function isBetween(x, a, b) {
  var _ref, _arr;
  if (a > b)
    ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
  return x > a && x < b;
}`,
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
      },
    ],
  },
  {
    title: 'sourcemap — declaration loc (input)',
    source: `const fn = (arg) => {
  var [x, y] = arg;
}
`,
    filename: 'input.js',
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
const fn = arg => {
  var _arr = _toArray(arg, 2, false),
    x = _arr[0],
    y = _arr[1];
};`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
