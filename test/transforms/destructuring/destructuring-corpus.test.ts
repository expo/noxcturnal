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
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'object patterns > extracts basic properties',
    source: `() => {
        const { a, b } = { a: 1, b: 2, c: 3 };
        expect(a).toBe(1);
        expect(b).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({
      a: 1,
      b: 2,
      c: 3,
    }),
    a = _obj.a,
    b = _obj.b;
  expect(a).toBe(1);
  expect(b).toBe(2);
};`,
  },
  {
    title: 'object patterns > renames properties',
    source: `() => {
        const { a: x, b: y } = { a: 1, b: 2 };
        expect(x).toBe(1);
        expect(y).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({
      a: 1,
      b: 2,
    }),
    x = _obj.a,
    y = _obj.b;
  expect(x).toBe(1);
  expect(y).toBe(2);
};`,
  },
  {
    title: 'object patterns > applies default values for missing properties',
    source: `() => {
        const { a = 10, b = 20 } = { a: 1 };
        expect(a).toBe(1);
        expect(b).toBe(20);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({ a: 1 }),
    _value = _obj.a,
    a = _value === void 0 ? 10 : _value,
    _value12 = _obj.b,
    b = _value12 === void 0 ? 20 : _value12;
  expect(a).toBe(1);
  expect(b).toBe(20);
};`,
  },
  {
    title: 'object patterns > applies default values only for undefined, not null',
    source: `() => {
        const { a = 10, b = 20 } = { a: null, b: undefined };
        expect(a).toBe(null);
        expect(b).toBe(20);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({
      a: null,
      b: undefined,
    }),
    _value = _obj.a,
    a = _value === void 0 ? 10 : _value,
    _value13 = _obj.b,
    b = _value13 === void 0 ? 20 : _value13;
  expect(a).toBe(null);
  expect(b).toBe(20);
};`,
  },
  {
    title: 'object patterns > renames with default values',
    source: `() => {
        const { a: x = 10, b: y = 20 } = { a: 1 };
        expect(x).toBe(1);
        expect(y).toBe(20);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({ a: 1 }),
    _value = _obj.a,
    x = _value === void 0 ? 10 : _value,
    _value12 = _obj.b,
    y = _value12 === void 0 ? 20 : _value12;
  expect(x).toBe(1);
  expect(y).toBe(20);
};`,
  },
  {
    title: 'object patterns > extracts computed property keys',
    source: `() => {
        const key = 'hello';
        const { [key]: val } = { hello: 42 };
        expect(val).toBe(42);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const key = 'hello';
  const _obj = _objectDestructuringEmpty({ hello: 42 }),
    _key = key,
    val = _obj[_key];
  expect(val).toBe(42);
};`,
  },
  {
    title: 'object patterns > extracts computed property keys with side effects',
    source: `() => {
        let counter = 0;
        const keyFn = () => 'k' + counter++;
        const obj = { k0: 'a', k1: 'b' };
        const { [keyFn()]: first, [keyFn()]: second } = obj;
        expect(first).toBe('a');
        expect(second).toBe('b');
        expect(counter).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  let counter = 0;
  const keyFn = () => 'k' + counter++;
  const obj = {
    k0: 'a',
    k1: 'b',
  };
  const _obj = _objectDestructuringEmpty(obj),
    _key = keyFn(),
    first = _obj[_key],
    _key15 = keyFn(),
    second = _obj[_key15];
  expect(first).toBe('a');
  expect(second).toBe('b');
  expect(counter).toBe(2);
};`,
  },
  {
    title: 'object patterns > collects rest properties',
    source: `() => {
        const { a, ...rest } = { a: 1, b: 2, c: 3 };
        expect(a).toBe(1);
        expect(rest).toEqual({ b: 2, c: 3 });
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({
      a: 1,
      b: 2,
      c: 3,
    }),
    a = _obj.a,
    rest = _objectWithoutProperties(_obj, ['a']);
  expect(a).toBe(1);
  expect(rest).toEqual({
    b: 2,
    c: 3,
  });
};`,
  },
  {
    title: 'object patterns > rest does not include extracted keys',
    source: `() => {
        const { x, y, ...rest } = { x: 1, y: 2, z: 3, w: 4 };
        expect(x).toBe(1);
        expect(y).toBe(2);
        expect(rest).toEqual({ z: 3, w: 4 });
        expect(rest.x).toBeUndefined();
        expect(rest.y).toBeUndefined();
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({
      x: 1,
      y: 2,
      z: 3,
      w: 4,
    }),
    x = _obj.x,
    y = _obj.y,
    rest = _objectWithoutProperties(_obj, ['x', 'y']);
  expect(x).toBe(1);
  expect(y).toBe(2);
  expect(rest).toEqual({
    z: 3,
    w: 4,
  });
  expect(rest.x).toBeUndefined();
  expect(rest.y).toBeUndefined();
};`,
  },
  {
    title: 'object patterns > rest produces an empty object when all keys extracted',
    source: `() => {
        const { a, b, ...rest } = { a: 1, b: 2 };
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(rest).toEqual({});
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({
      a: 1,
      b: 2,
    }),
    a = _obj.a,
    b = _obj.b,
    rest = _objectWithoutProperties(_obj, ['a', 'b']);
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(rest).toEqual({});
};`,
  },
  {
    title: 'object patterns > handles nested object patterns',
    source: `() => {
        const {
          a: { b },
        } = { a: { b: 42 } };
        expect(b).toBe(42);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({ a: { b: 42 } }),
    _obj10 = _objectDestructuringEmpty(_obj.a),
    b = _obj10.b;
  expect(b).toBe(42);
};`,
  },
  {
    title: 'object patterns > handles nested objects with defaults',
    source: `() => {
        const {
          a: { b = 99 },
        } = { a: {} };
        expect(b).toBe(99);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({ a: {} }),
    _obj10 = _objectDestructuringEmpty(_obj.a),
    _value = _obj10.b,
    b = _value === void 0 ? 99 : _value;
  expect(b).toBe(99);
};`,
  },
  {
    title: 'object patterns > handles shorthand for prototype properties',
    source: `() => {
        const { toString } = {};
        expect(typeof toString).toBe('function');
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({}),
    toString = _obj.toString;
  expect(typeof toString).toBe('function');
};`,
  },
  {
    title: 'object patterns > handles string keys with special characters',
    source: `() => {
        const { 'foo-bar': val } = { 'foo-bar': 42 };
        expect(val).toBe(42);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({ 'foo-bar': 42 }),
    val = _obj['foo-bar'];
  expect(val).toBe(42);
};`,
  },
  {
    title: 'object patterns > handles numeric keys',
    source: `() => {
        const { 0: first, 1: second } = { 0: 'a', 1: 'b' };
        expect(first).toBe('a');
        expect(second).toBe('b');
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({
      0: 'a',
      1: 'b',
    }),
    first = _obj[0],
    second = _obj[1];
  expect(first).toBe('a');
  expect(second).toBe('b');
};`,
  },
  {
    title: 'object patterns > extracts from nested defaults at multiple levels',
    source: `() => {
        const { a: { b: { c = 3 } = {} } = {} } = {};
        expect(c).toBe(3);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({}),
    _value = _obj.a,
    _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
    _value12 = _obj11.b,
    _obj13 = _objectDestructuringEmpty(_value12 === void 0 ? {} : _value12),
    _value14 = _obj13.c,
    c = _value14 === void 0 ? 3 : _value14;
  expect(c).toBe(3);
};`,
  },
  {
    title: 'object patterns > does not copy prototype properties into rest',
    source: `() => {
        function Parent() {}
        Parent.prototype.inherited = true;
        const obj = Object.create(Parent.prototype);
        obj.own = 1;
        const { own, ...rest } = obj;
        expect(own).toBe(1);
        expect(rest.inherited).toBeUndefined();
      }`,
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
() => {
  function Parent() {}
  Parent.prototype.inherited = true;
  const obj = Object.create(Parent.prototype);
  obj.own = 1;
  const _obj = _objectDestructuringEmpty(obj),
    own = _obj.own,
    rest = _objectWithoutProperties(_obj, ['own']);
  expect(own).toBe(1);
  expect(rest.inherited).toBeUndefined();
};`,
  },
  {
    title: 'object patterns > number key with object rest spread',
    source: `() => {
        const foo = {
          1: 'a',
          2: 'b',
          3: 'c',
        };
        const { [1]: bar, ...rest } = foo;
        expect(bar).toBe('a');
        expect(rest).toEqual({ 2: 'b', 3: 'c' });
      }`,
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
() => {
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
  });
};`,
  },
  {
    title: 'object patterns > function key with object rest spread',
    source: `() => {
        const { [(() => 1)()]: a, ...rest } = { 1: 'a' };
        expect(a).toBe('a');
        expect(rest).toEqual({});
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({ 1: 'a' }),
    _key = _toPropertyKey((() => 1)()),
    a = _obj[_key],
    rest = _objectWithoutProperties(_obj, [_key]);
  expect(a).toBe('a');
  expect(rest).toEqual({});
};`,
  },
  {
    title: 'object patterns > object rest with impure computed keys',
    source: `() => {
        var key, x, y, z;
     \x20
        // impure key
        key = 1;
        ({ [key++]: y, ...x } = { 1: 1, a: 1 });
        expect(x).toEqual({ a: 1 });
        expect(key).toBe(2);
        expect(y).toBe(1);
     \x20
        // takes care of the order
        key = 1;
        ({ [++key]: y, [++key]: z, ...x } = { 2: 2, 3: 3 });
        expect(y).toBe(2);
        expect(z).toBe(3);
     \x20
        // pure computed property should remain as-is
        key = 2;
        ({ [key]: y, z, ...x } = { 2: 'two', z: 'zee' });
        expect(y).toBe('two');
        expect(x).toEqual({});
        expect(z).toBe('zee');
     \x20
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
        ({ [left()]: y, ...x } = right());
        expect(order).toEqual(['right', 'left']);
      }`,
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
() => {
  var _ref,
    _obj,
    _key,
    _ref17,
    _obj18,
    _key19,
    _key20,
    _ref21,
    _obj22,
    _key23,
    _ref24,
    _obj25,
    _key26;
  var key, x, y, z;
  // impure key
  key = 1;
  ((_ref = {
    1: 1,
    a: 1,
  }),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(key++)),
    (y = _obj[_key]),
    (x = _objectWithoutProperties(_obj, [_key])),
    _ref);
  expect(x).toEqual({ a: 1 });
  expect(key).toBe(2);
  expect(y).toBe(1);
  // takes care of the order
  key = 1;
  ((_ref17 = {
    2: 2,
    3: 3,
  }),
    (_obj18 = _objectDestructuringEmpty(_ref17)),
    (_key19 = _toPropertyKey(++key)),
    (y = _obj18[_key19]),
    (_key20 = _toPropertyKey(++key)),
    (z = _obj18[_key20]),
    (x = _objectWithoutProperties(_obj18, [_key19, _key20])),
    _ref17);
  expect(y).toBe(2);
  expect(z).toBe(3);
  // pure computed property should remain as-is
  key = 2;
  ((_ref21 = {
    2: 'two',
    z: 'zee',
  }),
    (_obj22 = _objectDestructuringEmpty(_ref21)),
    (_key23 = _toPropertyKey(key)),
    (y = _obj22[_key23]),
    (z = _obj22.z),
    (x = _objectWithoutProperties(_obj22, [_key23, 'z'])),
    _ref21);
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
  ((_ref24 = right()),
    (_obj25 = _objectDestructuringEmpty(_ref24)),
    (_key26 = _toPropertyKey(left())),
    (y = _obj25[_key26]),
    (x = _objectWithoutProperties(_obj25, [_key26])),
    _ref24);
  expect(order).toEqual(['right', 'left']);
};`,
  },
  {
    title: 'object patterns > empty object pattern throws on null',
    source: `() => {
        expect(function () {
          var {} = null;
        }).toThrow();
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  expect(function () {
    var _obj = _objectDestructuringEmpty(null);
  }).toThrow();
};`,
  },
  {
    title: 'array patterns > extracts basic elements',
    source: `() => {
        const [a, b, c] = [1, 2, 3];
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1, 2, 3], 3, false),
    a = _arr[0],
    b = _arr[1],
    c = _arr[2];
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
};`,
  },
  {
    title: 'array patterns > skips elements with elision',
    source: `() => {
        const [, second, , fourth] = [1, 2, 3, 4];
        expect(second).toBe(2);
        expect(fourth).toBe(4);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1, 2, 3, 4], 4, false),
    second = _arr[1],
    fourth = _arr[3];
  expect(second).toBe(2);
  expect(fourth).toBe(4);
};`,
  },
  {
    title: 'array patterns > applies default values for missing elements',
    source: `() => {
        const [a = 10, b = 20, c = 30] = [1];
        expect(a).toBe(1);
        expect(b).toBe(20);
        expect(c).toBe(30);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1], 3, false),
    _value = _arr[0],
    a = _value === void 0 ? 10 : _value,
    _value13 = _arr[1],
    b = _value13 === void 0 ? 20 : _value13,
    _value14 = _arr[2],
    c = _value14 === void 0 ? 30 : _value14;
  expect(a).toBe(1);
  expect(b).toBe(20);
  expect(c).toBe(30);
};`,
  },
  {
    title: 'array patterns > applies default values only for undefined, not null or 0',
    source: `() => {
        const [a = 10, b = 20, c = 30] = [null, 0, undefined];
        expect(a).toBe(null);
        expect(b).toBe(0);
        expect(c).toBe(30);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([null, 0, undefined], 3, false),
    _value = _arr[0],
    a = _value === void 0 ? 10 : _value,
    _value14 = _arr[1],
    b = _value14 === void 0 ? 20 : _value14,
    _value15 = _arr[2],
    c = _value15 === void 0 ? 30 : _value15;
  expect(a).toBe(null);
  expect(b).toBe(0);
  expect(c).toBe(30);
};`,
  },
  {
    title: 'array patterns > collects rest elements',
    source: `() => {
        const [head, ...tail] = [1, 2, 3, 4];
        expect(head).toBe(1);
        expect(tail).toEqual([2, 3, 4]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1, 2, 3, 4], 1, true),
    head = _arr[0],
    tail = _arr.slice(1);
  expect(head).toBe(1);
  expect(tail).toEqual([2, 3, 4]);
};`,
  },
  {
    title: 'array patterns > rest produces empty array when no remaining elements',
    source: `() => {
        const [a, ...rest] = [1];
        expect(a).toBe(1);
        expect(rest).toEqual([]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1], 1, true),
    a = _arr[0],
    rest = _arr.slice(1);
  expect(a).toBe(1);
  expect(rest).toEqual([]);
};`,
  },
  {
    title: 'array patterns > handles nested array patterns',
    source: `() => {
        const [a, [b, c]] = [1, [2, 3]];
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray([1, [2, 3]], 2, false),
    a = _arr[0],
    _arr12 = _toArray(_arr[1], 2, false),
    b = _arr12[0],
    c = _arr12[1];
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
};`,
  },
  {
    title: 'array patterns > destructures string as iterable',
    source: `() => {
        const [a, b, c] = 'xyz';
        expect(a).toBe('x');
        expect(b).toBe('y');
        expect(c).toBe('z');
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray('xyz', 3, false),
    a = _arr[0],
    b = _arr[1],
    c = _arr[2];
  expect(a).toBe('x');
  expect(b).toBe('y');
  expect(c).toBe('z');
};`,
  },
  {
    title: 'array patterns > destructures string with rest',
    source: `() => {
        const [first, ...rest] = 'hello';
        expect(first).toBe('h');
        expect(rest).toEqual(['e', 'l', 'l', 'o']);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray('hello', 1, true),
    first = _arr[0],
    rest = _arr.slice(1);
  expect(first).toBe('h');
  expect(rest).toEqual(['e', 'l', 'l', 'o']);
};`,
  },
  {
    title: 'array patterns > handles holes in source array',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [a, b, c] = [1, , 3];
        expect(a).toBe(1);
        expect(b).toBeUndefined();
        expect(c).toBe(3);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([1, , 3], 3, false),
    a = _arr[0],
    b = _arr[1],
    c = _arr[2];
  expect(a).toBe(1);
  expect(b).toBeUndefined();
  expect(c).toBe(3);
};`,
  },
  {
    title: 'array patterns > handles holes with defaults',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [a = 10, b = 20, c = 30] = [, , 3];
        expect(a).toBe(10);
        expect(b).toBe(20);
        expect(c).toBe(3);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([, , 3], 3, false),
    _value = _arr[0],
    a = _value === void 0 ? 10 : _value,
    _value13 = _arr[1],
    b = _value13 === void 0 ? 20 : _value13,
    _value14 = _arr[2],
    c = _value14 === void 0 ? 30 : _value14;
  expect(a).toBe(10);
  expect(b).toBe(20);
  expect(c).toBe(3);
};`,
  },
  {
    title: 'array patterns > destructures Set iterable',
    source: `() => {
        const [a, b, c] = new Set([1, 2, 3]);
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const _arr = _toArray(new Set([1, 2, 3]), 3, false),
    a = _arr[0],
    b = _arr[1],
    c = _arr[2];
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
};`,
  },
  {
    title: 'array patterns > destructures Map iterable',
    source: `() => {
        const map = new Map();
        map.set('x', 1);
        map.set('y', 2);
        const [[k1, v1], [k2, v2]] = map;
        expect(k1).toBe('x');
        expect(v1).toBe(1);
        expect(k2).toBe('y');
        expect(v2).toBe(2);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const map = new Map();
  map.set('x', 1);
  map.set('y', 2);
  const _arr = _toArray(map, 2, false),
    _arr15 = _toArray(_arr[0], 2, false),
    k1 = _arr15[0],
    v1 = _arr15[1],
    _arr16 = _toArray(_arr[1], 2, false),
    k2 = _arr16[0],
    v2 = _arr16[1];
  expect(k1).toBe('x');
  expect(v1).toBe(1);
  expect(k2).toBe('y');
  expect(v2).toBe(2);
};`,
  },
  {
    title: 'array patterns > destructures generator iterable',
    source: `() => {
        function* gen() {
          yield 10;
          yield 20;
          yield 30;
        }
        const [a, b] = gen();
        expect(a).toBe(10);
        expect(b).toBe(20);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  function* gen() {
    yield 10;
    yield 20;
    yield 30;
  }
  const _arr = _toArray(gen(), 2, false),
    a = _arr[0],
    b = _arr[1];
  expect(a).toBe(10);
  expect(b).toBe(20);
};`,
  },
  {
    title: 'array patterns > rest with generator consumes remaining yields',
    source: `() => {
        function* gen() {
          yield 1;
          yield 2;
          yield 3;
        }
        const [first, ...rest] = gen();
        expect(first).toBe(1);
        expect(rest).toEqual([2, 3]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  function* gen() {
    yield 1;
    yield 2;
    yield 3;
  }
  const _arr = _toArray(gen(), 1, true),
    first = _arr[0],
    rest = _arr.slice(1);
  expect(first).toBe(1);
  expect(rest).toEqual([2, 3]);
};`,
  },
  {
    title: 'array patterns > destructures custom iterable',
    source: `() => {
        const iterable = {
          [Symbol.iterator]() {
            let i = 0;
            return {
              next() {
                return i < 3 ? { value: i++, done: false } : { done: true };
              },
            };
          },
        };
        const [a, b, c] = iterable;
        expect(a).toBe(0);
        expect(b).toBe(1);
        expect(c).toBe(2);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          return i < 3
            ? {
                value: i++,
                done: false,
              }
            : { done: true };
        },
      };
    },
  };
  const _arr = _toArray(iterable, 3, false),
    a = _arr[0],
    b = _arr[1],
    c = _arr[2];
  expect(a).toBe(0);
  expect(b).toBe(1);
  expect(c).toBe(2);
};`,
  },
  {
    title: 'array patterns > destructures empty string',
    source: `() => {
        let [a] = '';
        expect(a).toBe(undefined);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  let _arr = _toArray('', 1, false),
    a = _arr[0];
  expect(a).toBe(undefined);
};`,
  },
  {
    title: 'array patterns > spread from generator into rest',
    source: `() => {
        function* f() {
          for (var i = 0; i < 3; i++) {
            yield i;
          }
        }
        var [...xs] = f();
        expect(xs).toEqual([0, 1, 2]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  function* f() {
    for (var i = 0; i < 3; i++) {
      yield i;
    }
  }
  var _arr = _toArray(f(), 0, true),
    xs = _arr;
  expect(xs).toEqual([0, 1, 2]);
};`,
  },
  {
    title: 'array patterns > rest from extended array produces plain Array',
    source: `() => {
        class ExtendedArray extends Array {
          constructor(...args) {
            super(...args);
          }
        }
        let extArr = new ExtendedArray(1, 2, 3, 4, 5);
        let [first, second, ...rest] = extArr;
        expect(first).toBe(1);
        expect(second).toBe(2);
        expect(rest).toEqual([3, 4, 5]);
        expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
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
  expect(first).toBe(1);
  expect(second).toBe(2);
  expect(rest).toEqual([3, 4, 5]);
  expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');
};`,
  },
  {
    title: 'array patterns > array rest in params does not mutate original (issue-5090)',
    source: `() => {
        const assign = function ([...arr], index, value) {
          arr[index] = value;
          return arr;
        };
        const arr = [1, 2, 3];
        const result = assign(arr, 1, 42);
        expect(arr).toEqual([1, 2, 3]);
        expect(result).toEqual([1, 42, 3]);
      }`,
    output: `() => {
  const assign = function ([...arr], index, value) {
    arr[index] = value;
    return arr;
  };
  const arr = [1, 2, 3];
  const result = assign(arr, 1, 42);
  expect(arr).toEqual([1, 2, 3]);
  expect(result).toEqual([1, 42, 3]);
};`,
  },
  {
    title: 'array patterns > iterator .next getter is evaluated only once per destructuring',
    source: `() => {
        let gets = 0;
        let it = {
          [Symbol.iterator]: () => ({
            get next() {
              gets++;
              let i = 0;
              return () => ({ done: false, value: i++ });
            },
          }),
        };
     \x20
        // eslint-disable-next-line no-empty-pattern
        let [] = it;
        expect(gets).toBe(1);
     \x20
        let [a] = it;
        expect(gets).toBe(2);
        expect(a).toBe(0);
     \x20
        let [b, c] = it;
        expect(gets).toBe(3);
        expect(b).toBe(0);
        expect(c).toBe(1);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
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
  // eslint-disable-next-line no-empty-pattern
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
  expect(c).toBe(1);
};`,
  },
  {
    title: 'mixed patterns > array pattern inside object',
    source: `() => {
        const {
          items: [x, y],
        } = { items: [1, 2] };
        expect(x).toBe(1);
        expect(y).toBe(2);
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({ items: [1, 2] }),
    _arr = _toArray(_obj.items, 2, false),
    x = _arr[0],
    y = _arr[1];
  expect(x).toBe(1);
  expect(y).toBe(2);
};`,
  },
  {
    title: 'mixed patterns > object pattern inside array',
    source: `() => {
        const [{ a, b }] = [{ a: 1, b: 2 }];
        expect(a).toBe(1);
        expect(b).toBe(2);
      }`,
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
() => {
  const _arr = _toArray(
      [
        {
          a: 1,
          b: 2,
        },
      ],
      1,
      false,
    ),
    _obj = _objectDestructuringEmpty(_arr[0]),
    a = _obj.a,
    b = _obj.b;
  expect(a).toBe(1);
  expect(b).toBe(2);
};`,
  },
  {
    title: 'mixed patterns > deeply nested mixed patterns',
    source: `() => {
        const data = {
          users: [{ name: 'Alice', scores: [10, 20, 30] }],
        };
        const {
          users: [
            {
              name,
              scores: [first, , third],
            },
          ],
        } = data;
        expect(name).toBe('Alice');
        expect(first).toBe(10);
        expect(third).toBe(30);
      }`,
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
() => {
  const data = {
    users: [
      {
        name: 'Alice',
        scores: [10, 20, 30],
      },
    ],
  };
  const _obj = _objectDestructuringEmpty(data),
    _arr = _toArray(_obj.users, 1, false),
    _obj14 = _objectDestructuringEmpty(_arr[0]),
    name = _obj14.name,
    _arr15 = _toArray(_obj14.scores, 3, false),
    first = _arr15[0],
    third = _arr15[2];
  expect(name).toBe('Alice');
  expect(first).toBe(10);
  expect(third).toBe(30);
};`,
  },
  {
    title: 'mixed patterns > object rest with nested array',
    source: `() => {
        const {
          data: [head, ...tail],
          ...meta
        } = {
          data: [1, 2, 3],
          type: 'test',
          version: 2,
        };
        expect(head).toBe(1);
        expect(tail).toEqual([2, 3]);
        expect(meta).toEqual({ type: 'test', version: 2 });
      }`,
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
() => {
  const _obj = _objectDestructuringEmpty({
      data: [1, 2, 3],
      type: 'test',
      version: 2,
    }),
    _arr = _toArray(_obj.data, 1, true),
    head = _arr[0],
    tail = _arr.slice(1),
    meta = _objectWithoutProperties(_obj, ['data']);
  expect(head).toBe(1);
  expect(tail).toEqual([2, 3]);
  expect(meta).toEqual({
    type: 'test',
    version: 2,
  });
};`,
  },
  {
    title: 'function parameters > object destructuring in function params',
    source: `() => {
        function greet({ name, greeting }) {
          return greeting + ' ' + name;
        }
        expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');
      }`,
    output: `() => {
  function greet({ name, greeting }) {
    return greeting + ' ' + name;
  }
  expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');
};`,
  },
  {
    title: 'function parameters > object destructuring with defaults in params',
    source: `() => {
        function point({ x = 0, y = 0 }) {
          return [x, y];
        }
        expect(point({})).toEqual([0, 0]);
        expect(point({ x: 5 })).toEqual([5, 0]);
        expect(point({ x: 3, y: 4 })).toEqual([3, 4]);
      }`,
    output: `() => {
  function point({ x = 0, y = 0 }) {
    return [x, y];
  }
  expect(point({})).toEqual([0, 0]);
  expect(point({ x: 5 })).toEqual([5, 0]);
  expect(point({ x: 3, y: 4 })).toEqual([3, 4]);
};`,
  },
  {
    title: 'function parameters > array destructuring in function params',
    source: `() => {
        function first([a]) {
          return a;
        }
        expect(first([42, 99])).toBe(42);
      }`,
    output: `() => {
  function first([a]) {
    return a;
  }
  expect(first([42, 99])).toBe(42);
};`,
  },
  {
    title: 'function parameters > arrow function with object destructuring',
    source: `() => {
        const sum = ({ a, b }) => a + b;
        expect(sum({ a: 3, b: 4 })).toBe(7);
      }`,
    output: `() => {
  const sum = ({ a, b }) => a + b;
  expect(sum({ a: 3, b: 4 })).toBe(7);
};`,
  },
  {
    title: 'function parameters > arrow function with array destructuring',
    source: `() => {
        const head = ([first]) => first;
        expect(head([10, 20, 30])).toBe(10);
      }`,
    output: `() => {
  const head = ([first]) => first;
  expect(head([10, 20, 30])).toBe(10);
};`,
  },
  {
    title: 'function parameters > nested destructuring in arrow params',
    source: `() => {
        const fn = ({ data: { id, value = 0 } }) => id + value;
        expect(fn({ data: { id: 10 } })).toBe(10);
        expect(fn({ data: { id: 10, value: 5 } })).toBe(15);
      }`,
    output: `() => {
  const fn = ({ data: { id, value = 0 } }) => id + value;
  expect(fn({ data: { id: 10 } })).toBe(10);
  expect(fn({ data: { id: 10, value: 5 } })).toBe(15);
};`,
  },
  {
    title: 'function parameters > rest in function params',
    source: `() => {
        function f({ required, ...options }) {
          return { required, keys: Object.keys(options) };
        }
        const result = f({ required: true, a: 1, b: 2 });
        expect(result.required).toBe(true);
        expect(result.keys.sort()).toEqual(['a', 'b']);
      }`,
    output: `() => {
  function f({ required, ...options }) {
    return { required, keys: Object.keys(options) };
  }
  const result = f({ required: true, a: 1, b: 2 });
  expect(result.required).toBe(true);
  expect(result.keys.sort()).toEqual(['a', 'b']);
};`,
  },
  {
    title: 'function parameters > default parameter value for entire destructured param',
    source: `() => {
        function f({ x, y } = { x: 0, y: 0 }) {
          return x + y;
        }
        expect(f()).toBe(0);
        expect(f({ x: 1, y: 2 })).toBe(3);
      }`,
    output: `() => {
  function f({ x, y } = { x: 0, y: 0 }) {
    return x + y;
  }
  expect(f()).toBe(0);
  expect(f({ x: 1, y: 2 })).toBe(3);
};`,
  },
  {
    title: 'function parameters > mixed defaults: param-level and property-level',
    source: `() => {
        function f({ x = 1, y = 2 } = {}) {
          return x + y;
        }
        expect(f()).toBe(3);
        expect(f({})).toBe(3);
        expect(f({ x: 10 })).toBe(12);
      }`,
    output: `() => {
  function f({ x = 1, y = 2 } = {}) {
    return x + y;
  }
  expect(f()).toBe(3);
  expect(f({})).toBe(3);
  expect(f({ x: 10 })).toBe(12);
};`,
  },
  {
    title: 'function parameters > default value references previous params',
    source: `() => {
        var f0 = function (a, b = a, c = b) {
          return [a, b, c];
        };
        expect(f0(1)).toEqual([1, 1, 1]);
     \x20
        var f1 = function ({ a }, b = a, c = b) {
          return [a, b, c];
        };
        expect(f1({ a: 1 })).toEqual([1, 1, 1]);
     \x20
        var f2 = function ({ a }, b = a, c = a) {
          return [a, b, c];
        };
        expect(f2({ a: 1 })).toEqual([1, 1, 1]);
      }`,
    output: `() => {
  var f0 = function (a, b = a, c = b) {
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
  expect(f2({ a: 1 })).toEqual([1, 1, 1]);
};`,
  },
  {
    title: 'loops > for-of with object destructuring',
    source: `() => {
        const items = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ];
        const ids = [];
        for (const { id } of items) {
          ids.push(id);
        }
        expect(ids).toEqual([1, 2]);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const items = [
    {
      id: 1,
      value: 'a',
    },
    {
      id: 2,
      value: 'b',
    },
  ];
  const ids = [];
  for (const _ref of items) {
    const _obj = _objectDestructuringEmpty(_ref),
      id = _obj.id;
    {
      ids.push(id);
    }
  }
  expect(ids).toEqual([1, 2]);
};`,
  },
  {
    title: 'loops > for-of with array destructuring',
    source: `() => {
        const pairs = [
          [1, 'a'],
          [2, 'b'],
        ];
        const keys = [];
        const values = [];
        for (const [k, v] of pairs) {
          keys.push(k);
          values.push(v);
        }
        expect(keys).toEqual([1, 2]);
        expect(values).toEqual(['a', 'b']);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const pairs = [
    [1, 'a'],
    [2, 'b'],
  ];
  const keys = [];
  const values = [];
  for (const _ref of pairs) {
    const _arr = _toArray(_ref, 2, false),
      k = _arr[0],
      v = _arr[1];
    {
      keys.push(k);
      values.push(v);
    }
  }
  expect(keys).toEqual([1, 2]);
  expect(values).toEqual(['a', 'b']);
};`,
  },
  {
    title: 'loops > for-of with nested destructuring',
    source: `() => {
        const data = [
          { user: { name: 'Alice' }, scores: [10] },
          { user: { name: 'Bob' }, scores: [20] },
        ];
        const results = [];
        for (const {
          user: { name },
          scores: [score],
        } of data) {
          results.push({ name, score });
        }
        expect(results).toEqual([
          { name: 'Alice', score: 10 },
          { name: 'Bob', score: 20 },
        ]);
      }`,
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
() => {
  const data = [
    {
      user: { name: 'Alice' },
      scores: [10],
    },
    {
      user: { name: 'Bob' },
      scores: [20],
    },
  ];
  const results = [];
  for (const _ref of data) {
    const _obj = _objectDestructuringEmpty(_ref),
      _obj13 = _objectDestructuringEmpty(_obj.user),
      name = _obj13.name,
      _arr = _toArray(_obj.scores, 1, false),
      score = _arr[0];
    {
      results.push({
        name,
        score,
      });
    }
  }
  expect(results).toEqual([
    {
      name: 'Alice',
      score: 10,
    },
    {
      name: 'Bob',
      score: 20,
    },
  ]);
};`,
  },
  {
    title: 'loops > for-of with Map entries',
    source: `() => {
        const map = new Map([
          ['x', 1],
          ['y', 2],
        ]);
        const result = {};
        for (const [key, val] of map) {
          result[key] = val;
        }
        expect(result).toEqual({ x: 1, y: 2 });
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  const map = new Map([
    ['x', 1],
    ['y', 2],
  ]);
  const result = {};
  for (const _ref of map) {
    const _arr = _toArray(_ref, 2, false),
      key = _arr[0],
      val = _arr[1];
    {
      result[key] = val;
    }
  }
  expect(result).toEqual({
    x: 1,
    y: 2,
  });
};`,
  },
  {
    title: 'loops > for-of with computed key referencing outer scope despite inner shadow',
    source: `() => {
        var O = { a: 'a' };
        const a = 'a';
        var ran = false;
        for (const { [a]: _ } of [O]) {
          const a = 'A'; // shadows outer \`a\`, but computed key already evaluated
          expect(_).toBe('a');
          ran = true;
        }
        expect(ran).toBe(true);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  var O = { a: 'a' };
  const a = 'a';
  var ran = false;
  for (const _ref of [O]) {
    const _obj = _objectDestructuringEmpty(_ref),
      _key = a,
      _ = _obj[_key];
    {
      const a = 'A';
      expect(_).toBe('a');
      ran = true;
    }
  }
  expect(ran).toBe(true);
};`,
  },
  {
    title: 'assignment expressions > object destructuring assignment',
    source: `() => {
        let a, b;
        ({ a, b } = { a: 1, b: 2 });
        expect(a).toBe(1);
        expect(b).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  var _ref, _obj;
  let a, b;
  ((_ref = {
    a: 1,
    b: 2,
  }),
    (_obj = _objectDestructuringEmpty(_ref)),
    (a = _obj.a),
    (b = _obj.b),
    _ref);
  expect(a).toBe(1);
  expect(b).toBe(2);
};`,
  },
  {
    title: 'assignment expressions > array destructuring assignment',
    source: `() => {
        let x, y;
        [x, y] = [1, 2];
        expect(x).toBe(1);
        expect(y).toBe(2);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  let x, y;
  ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);
  expect(x).toBe(1);
  expect(y).toBe(2);
};`,
  },
  {
    title: 'assignment expressions > swap via array destructuring',
    source: `() => {
        let a = 1,
          b = 2;
        [a, b] = [b, a];
        expect(a).toBe(2);
        expect(b).toBe(1);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  let a = 1,
    b = 2;
  ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
  expect(a).toBe(2);
  expect(b).toBe(1);
};`,
  },
  {
    title: 'assignment expressions > nested assignment',
    source: `() => {
        let name, score;
        ({
          user: { name },
          scores: [score],
        } = { user: { name: 'test' }, scores: [100] });
        expect(name).toBe('test');
        expect(score).toBe(100);
      }`,
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
() => {
  var _ref, _obj, _obj11, _arr;
  let name, score;
  ((_ref = {
    user: { name: 'test' },
    scores: [100],
  }),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_obj11 = _objectDestructuringEmpty(_obj.user)),
    (name = _obj11.name),
    (_arr = _toArray(_obj.scores, 1, false)),
    (score = _arr[0]),
    _ref);
  expect(name).toBe('test');
  expect(score).toBe(100);
};`,
  },
  {
    title: 'assignment expressions > assignment with rest',
    source: `() => {
        let first, rest;
        [first, ...rest] = [1, 2, 3, 4];
        expect(first).toBe(1);
        expect(rest).toEqual([2, 3, 4]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  let first, rest;
  ((_ref = [1, 2, 3, 4]),
    (_arr = _toArray(_ref, 1, true)),
    (first = _arr[0]),
    (rest = _arr.slice(1)),
    _ref);
  expect(first).toBe(1);
  expect(rest).toEqual([2, 3, 4]);
};`,
  },
  {
    title: 'assignment expressions > chained destructuring assignment',
    source: `() => {
        var a, b, c, d;
        ({ a, b } = { c, d } = { a: 1, b: 2, c: 3, d: 4 });
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
        expect(d).toBe(4);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
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
  expect(d).toBe(4);
};`,
  },
  {
    title: 'catch clause > destructures error object in catch',
    source: `() => {
        let msg, code;
        try {
          throw { message: 'fail', code: 42 };
        } catch ({ message, code: c }) {
          msg = message;
          code = c;
        }
        expect(msg).toBe('fail');
        expect(code).toBe(42);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  let msg, code;
  try {
    throw {
      message: 'fail',
      code: 42,
    };
  } catch (_caught) {
    let _obj = _objectDestructuringEmpty(_caught),
      message = _obj.message,
      c = _obj.code;
    msg = message;
    code = c;
  }
  expect(msg).toBe('fail');
  expect(code).toBe(42);
};`,
  },
  {
    title: 'catch clause > destructures Error instance properties',
    source: `() => {
        let msg;
        try {
          throw new TypeError('bad type');
        } catch ({ message }) {
          msg = message;
        }
        expect(msg).toBe('bad type');
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  let msg;
  try {
    throw new TypeError('bad type');
  } catch (_caught) {
    let _obj = _objectDestructuringEmpty(_caught),
      message = _obj.message;
    msg = message;
  }
  expect(msg).toBe('bad type');
};`,
  },
  {
    title: 'declaration variants > const with object destructuring',
    source: `() => {
        const { x, y } = { x: 1, y: 2 };
        expect(x).toBe(1);
        expect(y).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const _obj = _objectDestructuringEmpty({
      x: 1,
      y: 2,
    }),
    x = _obj.x,
    y = _obj.y;
  expect(x).toBe(1);
  expect(y).toBe(2);
};`,
  },
  {
    title: 'declaration variants > let with array destructuring',
    source: `() => {
        let [a, b] = [1, 2];
        expect(a).toBe(1);
        expect(b).toBe(2);
        // let allows reassignment
        [a, b] = [3, 4];
        expect(a).toBe(3);
        expect(b).toBe(4);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref11, _arr12;
  let _arr = _toArray([1, 2], 2, false),
    a = _arr[0],
    b = _arr[1];
  expect(a).toBe(1);
  expect(b).toBe(2);
  // let allows reassignment
  ((_ref11 = [3, 4]),
    (_arr12 = _toArray(_ref11, 2, false)),
    (a = _arr12[0]),
    (b = _arr12[1]),
    _ref11);
  expect(a).toBe(3);
  expect(b).toBe(4);
};`,
  },
  {
    title: 'declaration variants > var with multiple destructuring patterns',
    source: `() => {
        var { a } = { a: 1 },
          [b] = [2];
        expect(a).toBe(1);
        expect(b).toBe(2);
      }`,
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
() => {
  var _obj = _objectDestructuringEmpty({ a: 1 }),
    a = _obj.a,
    _arr = _toArray([2], 1, false),
    b = _arr[0];
  expect(a).toBe(1);
  expect(b).toBe(2);
};`,
  },
  {
    title: 'declaration variants > const with nested defaults from function return',
    source: `() => {
        const getState = () => ({});
        const { data: { courses: oldCourses = [] } = {} } = getState();
        expect(oldCourses).toEqual([]);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const getState = () => ({});
  const _obj = _objectDestructuringEmpty(getState()),
    _value = _obj.data,
    _obj12 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
    _value13 = _obj12.courses,
    oldCourses = _value13 === void 0 ? [] : _value13;
  expect(oldCourses).toEqual([]);
};`,
  },
  {
    title: 'iterator protocol > empty pattern calls iterator.return when return() returns object',
    source: `() => {
        var returnCalled = false;
        // eslint-disable-next-line no-empty-pattern
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
        expect(returnCalled).toBe(true);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var returnCalled = false;
  // eslint-disable-next-line no-empty-pattern
  var _arr = _toArray(
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
  expect(returnCalled).toBe(true);
};`,
  },
  {
    title: 'iterator protocol > empty pattern throws if iterator.return() returns non-object',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = {
            [Symbol.iterator]: () => {
              return {
                return: () => {},
              };
            },
          };
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray(
      {
        [Symbol.iterator]: () => {
          return { return: () => {} };
        },
      },
      0,
      false,
    );
  }).toThrow();
};`,
  },
  {
    title:
      'iterator protocol > single-element pattern throws if iterator.return() returns non-object',
    source: `() => {
        expect(() => {
          var [x] = {
            [Symbol.iterator]: () => {
              return {
                next: () => ({ done: false, value: 1 }),
                return: () => {},
              };
            },
          };
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    var _arr = _toArray(
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
      x = _arr[0];
  }).toThrow();
};`,
  },
  {
    title:
      'iterator protocol > single-element pattern does not throw if iterator.return() returns object',
    source: `() => {
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
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    var _arr = _toArray(
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
      x = _arr[0];
  }).not.toThrow();
};`,
  },
  {
    title: 'holes and sparse arrays > default with explicit hole (let)',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        let [x = 23] = [,];
        expect(x).toBe(23);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  let _arr = _toArray([,], 1, false),
    _value = _arr[0],
    x = _value === void 0 ? 23 : _value;
  expect(x).toBe(23);
};`,
  },
  {
    title: 'holes and sparse arrays > default with hole and trailing value (const)',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [y = 24, z] = [, 42];
        expect(y).toBe(24);
        expect(z).toBe(42);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([, 42], 2, false),
    _value = _arr[0],
    y = _value === void 0 ? 24 : _value,
    z = _arr[1];
  expect(y).toBe(24);
  expect(z).toBe(42);
};`,
  },
  {
    title: 'holes and sparse arrays > default interleaves with generator evaluation order',
    source: `() => {
        function* foo() {
          yield 1;
          yield 2;
        }
        let bar = foo();
        // The default for \`a\` is bar.next().value, but it only runs because
        // position 0 is a hole. By the time it runs, bar has already yielded 1
        // (for position 1), so the default produces 2.
        // eslint-disable-next-line no-sparse-arrays
        const [a = bar.next().value, b] = [, bar.next().value];
        expect(a).toBe(2);
        expect(b).toBe(1);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  function* foo() {
    yield 1;
    yield 2;
  }
  let bar = foo();
  // The default for \`a\` is bar.next().value, but it only runs because
  // position 0 is a hole. By the time it runs, bar has already yielded 1
  // (for position 1), so the default produces 2.
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([, bar.next().value], 2, false),
    _value = _arr[0],
    a = _value === void 0 ? bar.next().value : _value,
    b = _arr[1];
  expect(a).toBe(2);
  expect(b).toBe(1);
};`,
  },
  {
    title: 'holes and sparse arrays > assignment pattern with hole',
    source: `() => {
        var c;
        // eslint-disable-next-line no-sparse-arrays
        const arr = ([c = 42] = [,]);
        expect(c).toBe(42);
        // eslint-disable-next-line no-sparse-arrays
        expect(arr).toEqual([,]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr, _value;
  var c;
  // eslint-disable-next-line no-sparse-arrays
  const arr =
    ((_ref = [,]),
    (_arr = _toArray(_ref, 1, false)),
    (_value = _arr[0]),
    (c = _value === void 0 ? 42 : _value),
    _ref);
  expect(c).toBe(42);
  // eslint-disable-next-line no-sparse-arrays
  expect(arr).toEqual([,]);
};`,
  },
  {
    title: 'holes and sparse arrays > rest from sparse array fills holes with undefined',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [...d] = [,];
        expect(d).toEqual([undefined]);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([,], 0, true),
    d = _arr;
  expect(d).toEqual([undefined]);
};`,
  },
  {
    title: 'holes and sparse arrays > rest with object pattern from sparse array',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [...{ 0: e }] = [,];
        expect(e).toEqual(undefined);
      }`,
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
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([,], 0, true),
    _obj = _objectDestructuringEmpty(_arr),
    e = _obj[0];
  expect(e).toEqual(undefined);
};`,
  },
  {
    title: 'holes and sparse arrays > single element from sparse array is undefined',
    source: `() => {
        // eslint-disable-next-line no-sparse-arrays
        const [f] = [,];
        expect(f).toEqual(undefined);
        // eslint-disable-next-line no-sparse-arrays
        let [g] = [,];
        expect(g).toEqual(undefined);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  // eslint-disable-next-line no-sparse-arrays
  const _arr = _toArray([,], 1, false),
    f = _arr[0];
  expect(f).toEqual(undefined);
  // eslint-disable-next-line no-sparse-arrays
  let _arr13 = _toArray([,], 1, false),
    g = _arr13[0];
  expect(g).toEqual(undefined);
};`,
  },
  {
    title: 'holes and sparse arrays > object pattern from hole throws',
    source: `() => {
        var thrown;
        try {
          thrown = false;
          // eslint-disable-next-line no-sparse-arrays
          [{}] = [,];
        } catch (e) {
          thrown = true;
        }
        expect(thrown).toBe(true);
      }`,
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
() => {
  var _ref, _arr, _obj;
  var thrown;
  try {
    thrown = false;
    // eslint-disable-next-line no-sparse-arrays
    ((_ref = [,]),
      (_arr = _toArray(_ref, 1, false)),
      (_obj = _objectDestructuringEmpty(_arr[0])),
      _ref);
  } catch (e) {
    thrown = true;
  }
  expect(thrown).toBe(true);
};`,
  },
  {
    title: 'holes and sparse arrays > array pattern from hole throws',
    source: `() => {
        var thrown;
        try {
          thrown = false;
          // eslint-disable-next-line no-sparse-arrays
          [[]] = [,];
        } catch (e) {
          thrown = true;
        }
        expect(thrown).toBe(true);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr, _arr11;
  var thrown;
  try {
    thrown = false;
    // eslint-disable-next-line no-sparse-arrays
    ((_ref = [,]), (_arr = _toArray(_ref, 1, false)), (_arr11 = _toArray(_arr[0], 0, false)), _ref);
  } catch (e) {
    thrown = true;
  }
  expect(thrown).toBe(true);
};`,
  },
  {
    title: 'empty array pattern > throws on null',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = null;
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray(null, 0, false);
  }).toThrow();
};`,
  },
  {
    title: 'empty array pattern > throws on number',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = 42;
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray(42, 0, false);
  }).toThrow();
};`,
  },
  {
    title: 'empty array pattern > throws on plain object',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = {};
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray({}, 0, false);
  }).toThrow();
};`,
  },
  {
    title: 'empty array pattern > throws if Symbol.iterator returns non-object',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = { [Symbol.iterator]: () => {} };
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray({ [Symbol.iterator]: () => {} }, 0, false);
  }).toThrow();
};`,
  },
  {
    title: 'empty array pattern > does not throw on valid iterables',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          var [] = [];
          // eslint-disable-next-line no-empty-pattern
          var [] = [0, 1, 2];
          // eslint-disable-next-line no-empty-pattern
          var [] = 'foo';
          // eslint-disable-next-line no-empty-pattern
          var [] = (function* () {
            throw new Error('Should not throw');
          })();
          // eslint-disable-next-line no-empty-pattern
          var [] = { [Symbol.iterator]: () => ({}) };
        }).not.toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    var _arr = _toArray([], 0, false);
    // eslint-disable-next-line no-empty-pattern
    var _arr12 = _toArray([0, 1, 2], 0, false);
    // eslint-disable-next-line no-empty-pattern
    var _arr14 = _toArray('foo', 0, false);
    // eslint-disable-next-line no-empty-pattern
    var _arr16 = _toArray(
      (function* () {
        throw new Error('Should not throw');
      })(),
      0,
      false,
    );
    // eslint-disable-next-line no-empty-pattern
    var _arr18 = _toArray({ [Symbol.iterator]: () => ({}) }, 0, false);
  }).not.toThrow();
};`,
  },
  {
    title: 'non-iterable errors > throws on undefined',
    source: `() => {
        var foo;
        expect(() => {
          [foo] = undefined;
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var foo;
  expect(() => {
    var _ref, _arr;
    ((_ref = undefined), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);
  }).toThrow();
};`,
  },
  {
    title: 'non-iterable errors > throws on plain object',
    source: `() => {
        var foo;
        expect(() => {
          [foo] = {};
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var foo;
  expect(() => {
    var _ref, _arr;
    ((_ref = {}), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);
  }).toThrow();
};`,
  },
  {
    title: 'edge cases > empty object pattern does not throw on object',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          const {} = { a: 1 };
        }).not.toThrow();
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    const _obj = _objectDestructuringEmpty({ a: 1 });
  }).not.toThrow();
};`,
  },
  {
    title: 'edge cases > empty array pattern does not throw on array',
    source: `() => {
        expect(() => {
          // eslint-disable-next-line no-empty-pattern
          const [] = [1, 2];
        }).not.toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    // eslint-disable-next-line no-empty-pattern
    const _arr = _toArray([1, 2], 0, false);
  }).not.toThrow();
};`,
  },
  {
    title: 'edge cases > destructuring null throws TypeError',
    source: `() => {
        expect(() => {
          const { a } = null;
        }).toThrow();
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  expect(() => {
    const _obj = _objectDestructuringEmpty(null),
      a = _obj.a;
  }).toThrow();
};`,
  },
  {
    title: 'edge cases > destructuring undefined throws TypeError',
    source: `() => {
        expect(() => {
          const { a } = undefined;
        }).toThrow();
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  expect(() => {
    const _obj = _objectDestructuringEmpty(undefined),
      a = _obj.a;
  }).toThrow();
};`,
  },
  {
    title: 'edge cases > array destructuring from non-iterable throws',
    source: `() => {
        expect(() => {
          const [a] = 42;
        }).toThrow();
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  expect(() => {
    const _arr = _toArray(42, 1, false),
      a = _arr[0];
  }).toThrow();
};`,
  },
  {
    title: 'edge cases > default value expression is lazily evaluated',
    source: `() => {
        let evaluated = false;
        const { a = (evaluated = true) } = { a: 1 };
        expect(a).toBe(1);
        expect(evaluated).toBe(false);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  let evaluated = false;
  const _obj = _objectDestructuringEmpty({ a: 1 }),
    _value = _obj.a,
    a = _value === void 0 ? (evaluated = true) : _value;
  expect(a).toBe(1);
  expect(evaluated).toBe(false);
};`,
  },
  {
    title: 'edge cases > default value expression evaluated when value is undefined',
    source: `() => {
        let count = 0;
        const { a = ++count, b = ++count } = { a: undefined };
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(count).toBe(2);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  let count = 0;
  const _obj = _objectDestructuringEmpty({ a: undefined }),
    _value = _obj.a,
    a = _value === void 0 ? ++count : _value,
    _value14 = _obj.b,
    b = _value14 === void 0 ? ++count : _value14;
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(count).toBe(2);
};`,
  },
  {
    title: 'edge cases > array default value expression is lazily evaluated',
    source: `() => {
        let evaluated = false;
        const [a = (evaluated = true)] = [42];
        expect(a).toBe(42);
        expect(evaluated).toBe(false);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  let evaluated = false;
  const _arr = _toArray([42], 1, false),
    _value = _arr[0],
    a = _value === void 0 ? (evaluated = true) : _value;
  expect(a).toBe(42);
  expect(evaluated).toBe(false);
};`,
  },
  {
    title: 'edge cases > evaluation order matches spec for object destructuring',
    source: `() => {
        const order = [];
        const obj = {
          get a() {
            order.push('get a');
            return 1;
          },
          get b() {
            order.push('get b');
            return 2;
          },
        };
        const { a, b } = obj;
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(order).toEqual(['get a', 'get b']);
      }`,
    output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
() => {
  const order = [];
  const obj = {
    get a() {
      order.push('get a');
      return 1;
    },
    get b() {
      order.push('get b');
      return 2;
    },
  };
  const _obj = _objectDestructuringEmpty(obj),
    a = _obj.a,
    b = _obj.b;
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(order).toEqual(['get a', 'get b']);
};`,
  },
  {
    title: 'edge cases > rest creates a shallow copy',
    source: `() => {
        const inner = { value: 1 };
        const { a, ...rest } = { a: 1, b: inner };
        expect(rest.b).toBe(inner);
        inner.value = 2;
        expect(rest.b.value).toBe(2);
      }`,
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
() => {
  const inner = { value: 1 };
  const _obj = _objectDestructuringEmpty({
      a: 1,
      b: inner,
    }),
    a = _obj.a,
    rest = _objectWithoutProperties(_obj, ['a']);
  expect(rest.b).toBe(inner);
  inner.value = 2;
  expect(rest.b.value).toBe(2);
};`,
  },
  {
    title: 'edge cases > rest with symbol keys are included',
    source: `() => {
        const sym = Symbol('test');
        const obj = { a: 1, [sym]: 2 };
        const { a, ...rest } = obj;
        expect(a).toBe(1);
        expect(rest[sym]).toBe(2);
      }`,
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
() => {
  const sym = Symbol('test');
  const obj = {
    a: 1,
    [sym]: 2,
  };
  const _obj = _objectDestructuringEmpty(obj),
    a = _obj.a,
    rest = _objectWithoutProperties(_obj, ['a']);
  expect(a).toBe(1);
  expect(rest[sym]).toBe(2);
};`,
  },
  {
    title: 'edge cases > destructuring assignment returns the right-hand value',
    source: `() => {
        let a, b;
        const result = ([a, b] = [1, 2]);
        expect(result).toEqual([1, 2]);
        expect(a).toBe(1);
        expect(b).toBe(2);
      }`,
    output: `var _toArray2 = {
  slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
  toConsumableArray: require('@babel/runtime/helpers/toConsumableArray'),
};
function _toArray(r, e, a) {
  return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
}
() => {
  var _ref, _arr;
  let a, b;
  const result =
    ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
  expect(result).toEqual([1, 2]);
  expect(a).toBe(1);
  expect(b).toBe(2);
};`,
  },
  {
    title: 'edge cases > array rest with object pattern',
    source: `() => {
        const [first, ...{ length }] = [1, 2, 3];
        expect(first).toBe(1);
        expect(length).toBe(2);
      }`,
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
() => {
  const _arr = _toArray([1, 2, 3], 1, true),
    first = _arr[0],
    _obj = _objectDestructuringEmpty(_arr.slice(1)),
    length = _obj.length;
  expect(first).toBe(1);
  expect(length).toBe(2);
};`,
  },
  {
    title: 'edge cases > handles large number of properties',
    source: `() => {
        const obj = {};
        for (let i = 0; i < 100; i++) {
          obj['k' + i] = i;
        }
        const { k0, k50, k99, ...rest } = obj;
        expect(k0).toBe(0);
        expect(k50).toBe(50);
        expect(k99).toBe(99);
        expect(Object.keys(rest).length).toBe(97);
      }`,
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
() => {
  const obj = {};
  for (let i = 0; i < 100; i++) {
    obj['k' + i] = i;
  }
  const _obj = _objectDestructuringEmpty(obj),
    k0 = _obj.k0,
    k50 = _obj.k50,
    k99 = _obj.k99,
    rest = _objectWithoutProperties(_obj, ['k0', 'k50', 'k99']);
  expect(k0).toBe(0);
  expect(k50).toBe(50);
  expect(k99).toBe(99);
  expect(Object.keys(rest).length).toBe(97);
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
