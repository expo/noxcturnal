// Generated from apps/test-suite/tests/JSDestructuring.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { runtimeHelpers, transformOutcome } from '../transform';

test('001 JS Destructuring > object patterns > extracts basic properties', async () => {
  const source =
    '() => {\n        const { a, b } = { a: 1, b: 2, c: 3 };\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {
          a: 1,
          b: 2,
          c: 3,
        },
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        b = _obj.b;
      expect(a).toBe(1);
      expect(b).toBe(2);
    };"
  `);
});

test('002 JS Destructuring > object patterns > renames properties', async () => {
  const source =
    '() => {\n        const { a: x, b: y } = { a: 1, b: 2 };\n        expect(x).toBe(1);\n        expect(y).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {
          a: 1,
          b: 2,
        },
        _obj = _objectDestructuringEmpty(_ref),
        x = _obj.a,
        y = _obj.b;
      expect(x).toBe(1);
      expect(y).toBe(2);
    };"
  `);
});

test('003 JS Destructuring > object patterns > applies default values for missing properties', async () => {
  const source =
    '() => {\n        const { a = 10, b = 20 } = { a: 1 };\n        expect(a).toBe(1);\n        expect(b).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { a: 1 },
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        a = _value === void 0 ? 10 : _value,
        _value11 = _obj.b,
        b = _value11 === void 0 ? 20 : _value11;
      expect(a).toBe(1);
      expect(b).toBe(20);
    };"
  `);
});

test('004 JS Destructuring > object patterns > applies default values only for undefined, not null', async () => {
  const source =
    '() => {\n        const { a = 10, b = 20 } = { a: null, b: undefined };\n        expect(a).toBe(null);\n        expect(b).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {
          a: null,
          b: undefined,
        },
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        a = _value === void 0 ? 10 : _value,
        _value11 = _obj.b,
        b = _value11 === void 0 ? 20 : _value11;
      expect(a).toBe(null);
      expect(b).toBe(20);
    };"
  `);
});

test('005 JS Destructuring > object patterns > renames with default values', async () => {
  const source =
    '() => {\n        const { a: x = 10, b: y = 20 } = { a: 1 };\n        expect(x).toBe(1);\n        expect(y).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { a: 1 },
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        x = _value === void 0 ? 10 : _value,
        _value11 = _obj.b,
        y = _value11 === void 0 ? 20 : _value11;
      expect(x).toBe(1);
      expect(y).toBe(20);
    };"
  `);
});

test('006 JS Destructuring > object patterns > extracts computed property keys', async () => {
  const source =
    "() => {\n        const key = 'hello';\n        const { [key]: val } = { hello: 42 };\n        expect(val).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const key = 'hello';
      const _ref = { hello: 42 },
        _obj = _objectDestructuringEmpty(_ref),
        _key = key,
        val = _obj[_key];
      expect(val).toBe(42);
    };"
  `);
});

test('007 JS Destructuring > object patterns > extracts computed property keys with side effects', async () => {
  const source =
    "() => {\n        let counter = 0;\n        const keyFn = () => 'k' + counter++;\n        const obj = { k0: 'a', k1: 'b' };\n        const { [keyFn()]: first, [keyFn()]: second } = obj;\n        expect(first).toBe('a');\n        expect(second).toBe('b');\n        expect(counter).toBe(2);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = obj,
        _obj = _objectDestructuringEmpty(_ref),
        _key = keyFn(),
        first = _obj[_key],
        _key14 = keyFn(),
        second = _obj[_key14];
      expect(first).toBe('a');
      expect(second).toBe('b');
      expect(counter).toBe(2);
    };"
  `);
});

test('008 JS Destructuring > object patterns > collects rest properties', async () => {
  const source =
    '() => {\n        const { a, ...rest } = { a: 1, b: 2, c: 3 };\n        expect(a).toBe(1);\n        expect(rest).toEqual({ b: 2, c: 3 });\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = {
          a: 1,
          b: 2,
          c: 3,
        },
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        rest = _objectWithoutProperties(_obj, ['a']);
      expect(a).toBe(1);
      expect(rest).toEqual({
        b: 2,
        c: 3,
      });
    };"
  `);
});

test('009 JS Destructuring > object patterns > rest does not include extracted keys', async () => {
  const source =
    '() => {\n        const { x, y, ...rest } = { x: 1, y: 2, z: 3, w: 4 };\n        expect(x).toBe(1);\n        expect(y).toBe(2);\n        expect(rest).toEqual({ z: 3, w: 4 });\n        expect(rest.x).toBeUndefined();\n        expect(rest.y).toBeUndefined();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = {
          x: 1,
          y: 2,
          z: 3,
          w: 4,
        },
        _obj = _objectDestructuringEmpty(_ref),
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
    };"
  `);
});

test('010 JS Destructuring > object patterns > rest produces an empty object when all keys extracted', async () => {
  const source =
    '() => {\n        const { a, b, ...rest } = { a: 1, b: 2 };\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(rest).toEqual({});\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = {
          a: 1,
          b: 2,
        },
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        b = _obj.b,
        rest = _objectWithoutProperties(_obj, ['a', 'b']);
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(rest).toEqual({});
    };"
  `);
});

test('011 JS Destructuring > object patterns > handles nested object patterns', async () => {
  const source =
    '() => {\n        const {\n          a: { b },\n        } = { a: { b: 42 } };\n        expect(b).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { a: { b: 42 } },
        _obj = _objectDestructuringEmpty(_ref),
        _obj9 = _objectDestructuringEmpty(_obj.a),
        b = _obj9.b;
      expect(b).toBe(42);
    };"
  `);
});

test('012 JS Destructuring > object patterns > handles nested objects with defaults', async () => {
  const source =
    '() => {\n        const {\n          a: { b = 99 },\n        } = { a: {} };\n        expect(b).toBe(99);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { a: {} },
        _obj = _objectDestructuringEmpty(_ref),
        _obj9 = _objectDestructuringEmpty(_obj.a),
        _value = _obj9.b,
        b = _value === void 0 ? 99 : _value;
      expect(b).toBe(99);
    };"
  `);
});

test('013 JS Destructuring > object patterns > handles shorthand for prototype properties', async () => {
  const source =
    "() => {\n        const { toString } = {};\n        expect(typeof toString).toBe('function');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {},
        _obj = _objectDestructuringEmpty(_ref),
        toString = _obj.toString;
      expect(typeof toString).toBe('function');
    };"
  `);
});

test('014 JS Destructuring > object patterns > handles string keys with special characters', async () => {
  const source =
    "() => {\n        const { 'foo-bar': val } = { 'foo-bar': 42 };\n        expect(val).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { 'foo-bar': 42 },
        _obj = _objectDestructuringEmpty(_ref),
        val = _obj['foo-bar'];
      expect(val).toBe(42);
    };"
  `);
});

test('015 JS Destructuring > object patterns > handles numeric keys', async () => {
  const source =
    "() => {\n        const { 0: first, 1: second } = { 0: 'a', 1: 'b' };\n        expect(first).toBe('a');\n        expect(second).toBe('b');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {
          0: 'a',
          1: 'b',
        },
        _obj = _objectDestructuringEmpty(_ref),
        first = _obj[0],
        second = _obj[1];
      expect(first).toBe('a');
      expect(second).toBe('b');
    };"
  `);
});

test('016 JS Destructuring > object patterns > extracts from nested defaults at multiple levels', async () => {
  const source =
    '() => {\n        const { a: { b: { c = 3 } = {} } = {} } = {};\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {},
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        _obj10 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
        _value11 = _obj10.b,
        _obj12 = _objectDestructuringEmpty(_value11 === void 0 ? {} : _value11),
        _value13 = _obj12.c,
        c = _value13 === void 0 ? 3 : _value13;
      expect(c).toBe(3);
    };"
  `);
});

test('017 JS Destructuring > object patterns > does not copy prototype properties into rest', async () => {
  const source =
    '() => {\n        function Parent() {}\n        Parent.prototype.inherited = true;\n        const obj = Object.create(Parent.prototype);\n        obj.own = 1;\n        const { own, ...rest } = obj;\n        expect(own).toBe(1);\n        expect(rest.inherited).toBeUndefined();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = obj,
        _obj = _objectDestructuringEmpty(_ref),
        own = _obj.own,
        rest = _objectWithoutProperties(_obj, ['own']);
      expect(own).toBe(1);
      expect(rest.inherited).toBeUndefined();
    };"
  `);
});

test('018 JS Destructuring > object patterns > number key with object rest spread', async () => {
  const source =
    "() => {\n        const foo = {\n          1: 'a',\n          2: 'b',\n          3: 'c',\n        };\n        const { [1]: bar, ...rest } = foo;\n        expect(bar).toBe('a');\n        expect(rest).toEqual({ 2: 'b', 3: 'c' });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = foo,
        _obj = _objectDestructuringEmpty(_ref),
        _key = _toPropertyKey(1),
        bar = _obj[_key],
        rest = _objectWithoutProperties(_obj, [_key]);
      expect(bar).toBe('a');
      expect(rest).toEqual({
        2: 'b',
        3: 'c',
      });
    };"
  `);
});

test('019 JS Destructuring > object patterns > function key with object rest spread', async () => {
  const source =
    "() => {\n        const { [(() => 1)()]: a, ...rest } = { 1: 'a' };\n        expect(a).toBe('a');\n        expect(rest).toEqual({});\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = { 1: 'a' },
        _obj = _objectDestructuringEmpty(_ref),
        _key = _toPropertyKey((() => 1)()),
        a = _obj[_key],
        rest = _objectWithoutProperties(_obj, [_key]);
      expect(a).toBe('a');
      expect(rest).toEqual({});
    };"
  `);
});

test('020 JS Destructuring > object patterns > object rest with impure computed keys', async () => {
  const source =
    "() => {\n        var key, x, y, z;\n\n        // impure key\n        key = 1;\n        ({ [key++]: y, ...x } = { 1: 1, a: 1 });\n        expect(x).toEqual({ a: 1 });\n        expect(key).toBe(2);\n        expect(y).toBe(1);\n\n        // takes care of the order\n        key = 1;\n        ({ [++key]: y, [++key]: z, ...x } = { 2: 2, 3: 3 });\n        expect(y).toBe(2);\n        expect(z).toBe(3);\n\n        // pure computed property should remain as-is\n        key = 2;\n        ({ [key]: y, z, ...x } = { 2: 'two', z: 'zee' });\n        expect(y).toBe('two');\n        expect(x).toEqual({});\n        expect(z).toBe('zee');\n\n        // rhs evaluated before lhs\n        var order = [];\n        function left() {\n          order.push('left');\n          return 0;\n        }\n        function right() {\n          order.push('right');\n          return {};\n        }\n        ({ [left()]: y, ...x } = right());\n        expect(order).toEqual(['right', 'left']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
        _ref16,
        _obj17,
        _key18,
        _key19,
        _ref20,
        _obj21,
        _key22,
        _ref23,
        _obj24,
        _key25;
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
      ((_ref16 = {
        2: 2,
        3: 3,
      }),
        (_obj17 = _objectDestructuringEmpty(_ref16)),
        (_key18 = _toPropertyKey(++key)),
        (y = _obj17[_key18]),
        (_key19 = _toPropertyKey(++key)),
        (z = _obj17[_key19]),
        (x = _objectWithoutProperties(_obj17, [_key18, _key19])),
        _ref16);
      expect(y).toBe(2);
      expect(z).toBe(3);
      // pure computed property should remain as-is
      key = 2;
      ((_ref20 = {
        2: 'two',
        z: 'zee',
      }),
        (_obj21 = _objectDestructuringEmpty(_ref20)),
        (_key22 = _toPropertyKey(key)),
        (y = _obj21[_key22]),
        (z = _obj21.z),
        (x = _objectWithoutProperties(_obj21, [_key22, 'z'])),
        _ref20);
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
      ((_ref23 = right()),
        (_obj24 = _objectDestructuringEmpty(_ref23)),
        (_key25 = _toPropertyKey(left())),
        (y = _obj24[_key25]),
        (x = _objectWithoutProperties(_obj24, [_key25])),
        _ref23);
      expect(order).toEqual(['right', 'left']);
    };"
  `);
});

test('021 JS Destructuring > object patterns > empty object pattern throws on null', async () => {
  const source =
    '() => {\n        expect(function () {\n          var {} = null;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      expect(function () {
        var _ref = null,
          _obj = _objectDestructuringEmpty(_ref);
      }).toThrow();
    };"
  `);
});

test('022 JS Destructuring > array patterns > extracts basic elements', async () => {
  const source =
    '() => {\n        const [a, b, c] = [1, 2, 3];\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1, 2, 3],
        _arr = _toArray(_ref, 3, false),
        a = _arr[0],
        b = _arr[1],
        c = _arr[2];
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(c).toBe(3);
    };"
  `);
});

test('023 JS Destructuring > array patterns > skips elements with elision', async () => {
  const source =
    '() => {\n        const [, second, , fourth] = [1, 2, 3, 4];\n        expect(second).toBe(2);\n        expect(fourth).toBe(4);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1, 2, 3, 4],
        _arr = _toArray(_ref, 4, false),
        second = _arr[1],
        fourth = _arr[3];
      expect(second).toBe(2);
      expect(fourth).toBe(4);
    };"
  `);
});

test('024 JS Destructuring > array patterns > applies default values for missing elements', async () => {
  const source =
    '() => {\n        const [a = 10, b = 20, c = 30] = [1];\n        expect(a).toBe(1);\n        expect(b).toBe(20);\n        expect(c).toBe(30);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1],
        _arr = _toArray(_ref, 3, false),
        _value = _arr[0],
        a = _value === void 0 ? 10 : _value,
        _value12 = _arr[1],
        b = _value12 === void 0 ? 20 : _value12,
        _value13 = _arr[2],
        c = _value13 === void 0 ? 30 : _value13;
      expect(a).toBe(1);
      expect(b).toBe(20);
      expect(c).toBe(30);
    };"
  `);
});

test('025 JS Destructuring > array patterns > applies default values only for undefined, not null or 0', async () => {
  const source =
    '() => {\n        const [a = 10, b = 20, c = 30] = [null, 0, undefined];\n        expect(a).toBe(null);\n        expect(b).toBe(0);\n        expect(c).toBe(30);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [null, 0, undefined],
        _arr = _toArray(_ref, 3, false),
        _value = _arr[0],
        a = _value === void 0 ? 10 : _value,
        _value12 = _arr[1],
        b = _value12 === void 0 ? 20 : _value12,
        _value13 = _arr[2],
        c = _value13 === void 0 ? 30 : _value13;
      expect(a).toBe(null);
      expect(b).toBe(0);
      expect(c).toBe(30);
    };"
  `);
});

test('026 JS Destructuring > array patterns > collects rest elements', async () => {
  const source =
    '() => {\n        const [head, ...tail] = [1, 2, 3, 4];\n        expect(head).toBe(1);\n        expect(tail).toEqual([2, 3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1, 2, 3, 4],
        _arr = _toArray(_ref, 1, true),
        head = _arr[0],
        tail = _arr.slice(1);
      expect(head).toBe(1);
      expect(tail).toEqual([2, 3, 4]);
    };"
  `);
});

test('027 JS Destructuring > array patterns > rest produces empty array when no remaining elements', async () => {
  const source =
    '() => {\n        const [a, ...rest] = [1];\n        expect(a).toBe(1);\n        expect(rest).toEqual([]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1],
        _arr = _toArray(_ref, 1, true),
        a = _arr[0],
        rest = _arr.slice(1);
      expect(a).toBe(1);
      expect(rest).toEqual([]);
    };"
  `);
});

test('028 JS Destructuring > array patterns > handles nested array patterns', async () => {
  const source =
    '() => {\n        const [a, [b, c]] = [1, [2, 3]];\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = [1, [2, 3]],
        _arr = _toArray(_ref, 2, false),
        a = _arr[0],
        _arr11 = _toArray(_arr[1], 2, false),
        b = _arr11[0],
        c = _arr11[1];
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(c).toBe(3);
    };"
  `);
});

test('029 JS Destructuring > array patterns > destructures string as iterable', async () => {
  const source =
    "() => {\n        const [a, b, c] = 'xyz';\n        expect(a).toBe('x');\n        expect(b).toBe('y');\n        expect(c).toBe('z');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = 'xyz',
        _arr = _toArray(_ref, 3, false),
        a = _arr[0],
        b = _arr[1],
        c = _arr[2];
      expect(a).toBe('x');
      expect(b).toBe('y');
      expect(c).toBe('z');
    };"
  `);
});

test('030 JS Destructuring > array patterns > destructures string with rest', async () => {
  const source =
    "() => {\n        const [first, ...rest] = 'hello';\n        expect(first).toBe('h');\n        expect(rest).toEqual(['e', 'l', 'l', 'o']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = 'hello',
        _arr = _toArray(_ref, 1, true),
        first = _arr[0],
        rest = _arr.slice(1);
      expect(first).toBe('h');
      expect(rest).toEqual(['e', 'l', 'l', 'o']);
    };"
  `);
});

test('031 JS Destructuring > array patterns > handles holes in source array', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [a, b, c] = [1, , 3];\n        expect(a).toBe(1);\n        expect(b).toBeUndefined();\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [1, , 3],
        _arr = _toArray(_ref, 3, false),
        a = _arr[0],
        b = _arr[1],
        c = _arr[2];
      expect(a).toBe(1);
      expect(b).toBeUndefined();
      expect(c).toBe(3);
    };"
  `);
});

test('032 JS Destructuring > array patterns > handles holes with defaults', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [a = 10, b = 20, c = 30] = [, , 3];\n        expect(a).toBe(10);\n        expect(b).toBe(20);\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [, , 3],
        _arr = _toArray(_ref, 3, false),
        _value = _arr[0],
        a = _value === void 0 ? 10 : _value,
        _value12 = _arr[1],
        b = _value12 === void 0 ? 20 : _value12,
        _value13 = _arr[2],
        c = _value13 === void 0 ? 30 : _value13;
      expect(a).toBe(10);
      expect(b).toBe(20);
      expect(c).toBe(3);
    };"
  `);
});

test('033 JS Destructuring > array patterns > destructures Set iterable', async () => {
  const source =
    '() => {\n        const [a, b, c] = new Set([1, 2, 3]);\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(c).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const _ref = new Set([1, 2, 3]),
        _arr = _toArray(_ref, 3, false),
        a = _arr[0],
        b = _arr[1],
        c = _arr[2];
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(c).toBe(3);
    };"
  `);
});

test('034 JS Destructuring > array patterns > destructures Map iterable', async () => {
  const source =
    "() => {\n        const map = new Map();\n        map.set('x', 1);\n        map.set('y', 2);\n        const [[k1, v1], [k2, v2]] = map;\n        expect(k1).toBe('x');\n        expect(v1).toBe(1);\n        expect(k2).toBe('y');\n        expect(v2).toBe(2);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      const map = new Map();
      map.set('x', 1);
      map.set('y', 2);
      const _ref = map,
        _arr = _toArray(_ref, 2, false),
        _arr13 = _toArray(_arr[0], 2, false),
        k1 = _arr13[0],
        v1 = _arr13[1],
        _arr14 = _toArray(_arr[1], 2, false),
        k2 = _arr14[0],
        v2 = _arr14[1];
      expect(k1).toBe('x');
      expect(v1).toBe(1);
      expect(k2).toBe('y');
      expect(v2).toBe(2);
    };"
  `);
});

test('035 JS Destructuring > array patterns > destructures generator iterable', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield 10;\n          yield 20;\n          yield 30;\n        }\n        const [a, b] = gen();\n        expect(a).toBe(10);\n        expect(b).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      function* gen() {
        yield 10;
        yield 20;
        yield 30;
      }
      const _ref = gen(),
        _arr = _toArray(_ref, 2, false),
        a = _arr[0],
        b = _arr[1];
      expect(a).toBe(10);
      expect(b).toBe(20);
    };"
  `);
});

test('036 JS Destructuring > array patterns > rest with generator consumes remaining yields', async () => {
  const source =
    '() => {\n        function* gen() {\n          yield 1;\n          yield 2;\n          yield 3;\n        }\n        const [first, ...rest] = gen();\n        expect(first).toBe(1);\n        expect(rest).toEqual([2, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      const _ref = gen(),
        _arr = _toArray(_ref, 1, true),
        first = _arr[0],
        rest = _arr.slice(1);
      expect(first).toBe(1);
      expect(rest).toEqual([2, 3]);
    };"
  `);
});

test('037 JS Destructuring > array patterns > destructures custom iterable', async () => {
  const source =
    '() => {\n        const iterable = {\n          [Symbol.iterator]() {\n            let i = 0;\n            return {\n              next() {\n                return i < 3 ? { value: i++, done: false } : { done: true };\n              },\n            };\n          },\n        };\n        const [a, b, c] = iterable;\n        expect(a).toBe(0);\n        expect(b).toBe(1);\n        expect(c).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
      const _ref = iterable,
        _arr = _toArray(_ref, 3, false),
        a = _arr[0],
        b = _arr[1],
        c = _arr[2];
      expect(a).toBe(0);
      expect(b).toBe(1);
      expect(c).toBe(2);
    };"
  `);
});

test('038 JS Destructuring > array patterns > destructures empty string', async () => {
  const source = "() => {\n        let [a] = '';\n        expect(a).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      let _ref = '',
        _arr = _toArray(_ref, 1, false),
        a = _arr[0];
      expect(a).toBe(undefined);
    };"
  `);
});

test('039 JS Destructuring > array patterns > spread from generator into rest', async () => {
  const source =
    '() => {\n        function* f() {\n          for (var i = 0; i < 3; i++) {\n            yield i;\n          }\n        }\n        var [...xs] = f();\n        expect(xs).toEqual([0, 1, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      function* f() {
        for (var i = 0; i < 3; i++) {
          yield i;
        }
      }
      var _ref = f(),
        _arr = _toArray(_ref, 0, true),
        xs = _arr.slice(0);
      expect(xs).toEqual([0, 1, 2]);
    };"
  `);
});

test('040 JS Destructuring > array patterns > rest from extended array produces plain Array', async () => {
  const source =
    "() => {\n        class ExtendedArray extends Array {\n          constructor(...args) {\n            super(...args);\n          }\n        }\n        let extArr = new ExtendedArray(1, 2, 3, 4, 5);\n        let [first, second, ...rest] = extArr;\n        expect(first).toBe(1);\n        expect(second).toBe(2);\n        expect(rest).toEqual([3, 4, 5]);\n        expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      class ExtendedArray extends Array {
        constructor(...args) {
          super(...args);
        }
      }
      let extArr = new ExtendedArray(1, 2, 3, 4, 5);
      let _ref = extArr,
        _arr = _toArray(_ref, 2, true),
        first = _arr[0],
        second = _arr[1],
        rest = _arr.slice(2);
      expect(first).toBe(1);
      expect(second).toBe(2);
      expect(rest).toEqual([3, 4, 5]);
      expect(Object.getPrototypeOf(rest).constructor.name).toBe('Array');
    };"
  `);
});

test('041 JS Destructuring > array patterns > array rest in params does not mutate original (issue-5090)', async () => {
  const source =
    '() => {\n        const assign = function ([...arr], index, value) {\n          arr[index] = value;\n          return arr;\n        };\n        const arr = [1, 2, 3];\n        const result = assign(arr, 1, 42);\n        expect(arr).toEqual([1, 2, 3]);\n        expect(result).toEqual([1, 42, 3]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const assign = function ([...arr], index, value) {
        arr[index] = value;
        return arr;
      };
      const arr = [1, 2, 3];
      const result = assign(arr, 1, 42);
      expect(arr).toEqual([1, 2, 3]);
      expect(result).toEqual([1, 42, 3]);
    };"
  `);
});

test('042 JS Destructuring > array patterns > iterator .next getter is evaluated only once per destructuring', async () => {
  const source =
    '() => {\n        let gets = 0;\n        let it = {\n          [Symbol.iterator]: () => ({\n            get next() {\n              gets++;\n              let i = 0;\n              return () => ({ done: false, value: i++ });\n            },\n          }),\n        };\n\n        // eslint-disable-next-line no-empty-pattern\n        let [] = it;\n        expect(gets).toBe(1);\n\n        let [a] = it;\n        expect(gets).toBe(2);\n        expect(a).toBe(0);\n\n        let [b, c] = it;\n        expect(gets).toBe(3);\n        expect(b).toBe(0);\n        expect(c).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
      let _ref = it,
        _arr = _toArray(_ref, 0, false);
      expect(gets).toBe(1);
      let _ref14 = it,
        _arr15 = _toArray(_ref14, 1, false),
        a = _arr15[0];
      expect(gets).toBe(2);
      expect(a).toBe(0);
      let _ref16 = it,
        _arr17 = _toArray(_ref16, 2, false),
        b = _arr17[0],
        c = _arr17[1];
      expect(gets).toBe(3);
      expect(b).toBe(0);
      expect(c).toBe(1);
    };"
  `);
});

test('043 JS Destructuring > mixed patterns > array pattern inside object', async () => {
  const source =
    '() => {\n        const {\n          items: [x, y],\n        } = { items: [1, 2] };\n        expect(x).toBe(1);\n        expect(y).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = { items: [1, 2] },
        _obj = _objectDestructuringEmpty(_ref),
        _arr = _toArray(_obj.items, 2, false),
        x = _arr[0],
        y = _arr[1];
      expect(x).toBe(1);
      expect(y).toBe(2);
    };"
  `);
});

test('044 JS Destructuring > mixed patterns > object pattern inside array', async () => {
  const source =
    '() => {\n        const [{ a, b }] = [{ a: 1, b: 2 }];\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = [
          {
            a: 1,
            b: 2,
          },
        ],
        _arr = _toArray(_ref, 1, false),
        _obj = _objectDestructuringEmpty(_arr[0]),
        a = _obj.a,
        b = _obj.b;
      expect(a).toBe(1);
      expect(b).toBe(2);
    };"
  `);
});

test('045 JS Destructuring > mixed patterns > deeply nested mixed patterns', async () => {
  const source =
    "() => {\n        const data = {\n          users: [{ name: 'Alice', scores: [10, 20, 30] }],\n        };\n        const {\n          users: [\n            {\n              name,\n              scores: [first, , third],\n            },\n          ],\n        } = data;\n        expect(name).toBe('Alice');\n        expect(first).toBe(10);\n        expect(third).toBe(30);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
      const _ref = data,
        _obj = _objectDestructuringEmpty(_ref),
        _arr = _toArray(_obj.users, 1, false),
        _obj13 = _objectDestructuringEmpty(_arr[0]),
        name = _obj13.name,
        _arr14 = _toArray(_obj13.scores, 3, false),
        first = _arr14[0],
        third = _arr14[2];
      expect(name).toBe('Alice');
      expect(first).toBe(10);
      expect(third).toBe(30);
    };"
  `);
});

test('046 JS Destructuring > mixed patterns > object rest with nested array', async () => {
  const source =
    "() => {\n        const {\n          data: [head, ...tail],\n          ...meta\n        } = {\n          data: [1, 2, 3],\n          type: 'test',\n          version: 2,\n        };\n        expect(head).toBe(1);\n        expect(tail).toEqual([2, 3]);\n        expect(meta).toEqual({ type: 'test', version: 2 });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
      const _ref = {
          data: [1, 2, 3],
          type: 'test',
          version: 2,
        },
        _obj = _objectDestructuringEmpty(_ref),
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
    };"
  `);
});

test('047 JS Destructuring > function parameters > object destructuring in function params', async () => {
  const source =
    "() => {\n        function greet({ name, greeting }) {\n          return greeting + ' ' + name;\n        }\n        expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function greet({ name, greeting }) {
        return greeting + ' ' + name;
      }
      expect(greet({ name: 'world', greeting: 'Hello' })).toBe('Hello world');
    };"
  `);
});

test('048 JS Destructuring > function parameters > object destructuring with defaults in params', async () => {
  const source =
    '() => {\n        function point({ x = 0, y = 0 }) {\n          return [x, y];\n        }\n        expect(point({})).toEqual([0, 0]);\n        expect(point({ x: 5 })).toEqual([5, 0]);\n        expect(point({ x: 3, y: 4 })).toEqual([3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function point({ x = 0, y = 0 }) {
        return [x, y];
      }
      expect(point({})).toEqual([0, 0]);
      expect(point({ x: 5 })).toEqual([5, 0]);
      expect(point({ x: 3, y: 4 })).toEqual([3, 4]);
    };"
  `);
});

test('049 JS Destructuring > function parameters > array destructuring in function params', async () => {
  const source =
    '() => {\n        function first([a]) {\n          return a;\n        }\n        expect(first([42, 99])).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function first([a]) {
        return a;
      }
      expect(first([42, 99])).toBe(42);
    };"
  `);
});

test('050 JS Destructuring > function parameters > arrow function with object destructuring', async () => {
  const source =
    '() => {\n        const sum = ({ a, b }) => a + b;\n        expect(sum({ a: 3, b: 4 })).toBe(7);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const sum = ({ a, b }) => a + b;
      expect(sum({ a: 3, b: 4 })).toBe(7);
    };"
  `);
});

test('051 JS Destructuring > function parameters > arrow function with array destructuring', async () => {
  const source =
    '() => {\n        const head = ([first]) => first;\n        expect(head([10, 20, 30])).toBe(10);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const head = ([first]) => first;
      expect(head([10, 20, 30])).toBe(10);
    };"
  `);
});

test('052 JS Destructuring > function parameters > nested destructuring in arrow params', async () => {
  const source =
    '() => {\n        const fn = ({ data: { id, value = 0 } }) => id + value;\n        expect(fn({ data: { id: 10 } })).toBe(10);\n        expect(fn({ data: { id: 10, value: 5 } })).toBe(15);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = ({ data: { id, value = 0 } }) => id + value;
      expect(fn({ data: { id: 10 } })).toBe(10);
      expect(fn({ data: { id: 10, value: 5 } })).toBe(15);
    };"
  `);
});

test('053 JS Destructuring > function parameters > rest in function params', async () => {
  const source =
    "() => {\n        function f({ required, ...options }) {\n          return { required, keys: Object.keys(options) };\n        }\n        const result = f({ required: true, a: 1, b: 2 });\n        expect(result.required).toBe(true);\n        expect(result.keys.sort()).toEqual(['a', 'b']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function f({ required, ...options }) {
        return { required, keys: Object.keys(options) };
      }
      const result = f({ required: true, a: 1, b: 2 });
      expect(result.required).toBe(true);
      expect(result.keys.sort()).toEqual(['a', 'b']);
    };"
  `);
});

test('054 JS Destructuring > function parameters > default parameter value for entire destructured param', async () => {
  const source =
    '() => {\n        function f({ x, y } = { x: 0, y: 0 }) {\n          return x + y;\n        }\n        expect(f()).toBe(0);\n        expect(f({ x: 1, y: 2 })).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function f({ x, y } = { x: 0, y: 0 }) {
        return x + y;
      }
      expect(f()).toBe(0);
      expect(f({ x: 1, y: 2 })).toBe(3);
    };"
  `);
});

test('055 JS Destructuring > function parameters > mixed defaults: param-level and property-level', async () => {
  const source =
    '() => {\n        function f({ x = 1, y = 2 } = {}) {\n          return x + y;\n        }\n        expect(f()).toBe(3);\n        expect(f({})).toBe(3);\n        expect(f({ x: 10 })).toBe(12);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function f({ x = 1, y = 2 } = {}) {
        return x + y;
      }
      expect(f()).toBe(3);
      expect(f({})).toBe(3);
      expect(f({ x: 10 })).toBe(12);
    };"
  `);
});

test('056 JS Destructuring > function parameters > default value references previous params', async () => {
  const source =
    '() => {\n        var f0 = function (a, b = a, c = b) {\n          return [a, b, c];\n        };\n        expect(f0(1)).toEqual([1, 1, 1]);\n\n        var f1 = function ({ a }, b = a, c = b) {\n          return [a, b, c];\n        };\n        expect(f1({ a: 1 })).toEqual([1, 1, 1]);\n\n        var f2 = function ({ a }, b = a, c = a) {\n          return [a, b, c];\n        };\n        expect(f2({ a: 1 })).toEqual([1, 1, 1]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('057 JS Destructuring > loops > for-of with object destructuring', async () => {
  const source =
    "() => {\n        const items = [\n          { id: 1, value: 'a' },\n          { id: 2, value: 'b' },\n        ];\n        const ids = [];\n        for (const { id } of items) {\n          ids.push(id);\n        }\n        expect(ids).toEqual([1, 2]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
    };"
  `);
});

test('058 JS Destructuring > loops > for-of with array destructuring', async () => {
  const source =
    "() => {\n        const pairs = [\n          [1, 'a'],\n          [2, 'b'],\n        ];\n        const keys = [];\n        const values = [];\n        for (const [k, v] of pairs) {\n          keys.push(k);\n          values.push(v);\n        }\n        expect(keys).toEqual([1, 2]);\n        expect(values).toEqual(['a', 'b']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
    };"
  `);
});

test('059 JS Destructuring > loops > for-of with nested destructuring', async () => {
  const source =
    "() => {\n        const data = [\n          { user: { name: 'Alice' }, scores: [10] },\n          { user: { name: 'Bob' }, scores: [20] },\n        ];\n        const results = [];\n        for (const {\n          user: { name },\n          scores: [score],\n        } of data) {\n          results.push({ name, score });\n        }\n        expect(results).toEqual([\n          { name: 'Alice', score: 10 },\n          { name: 'Bob', score: 20 },\n        ]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
          _obj12 = _objectDestructuringEmpty(_obj.user),
          name = _obj12.name,
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
    };"
  `);
});

test('060 JS Destructuring > loops > for-of with Map entries', async () => {
  const source =
    "() => {\n        const map = new Map([\n          ['x', 1],\n          ['y', 2],\n        ]);\n        const result = {};\n        for (const [key, val] of map) {\n          result[key] = val;\n        }\n        expect(result).toEqual({ x: 1, y: 2 });\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
    };"
  `);
});

test('061 [upstream xit] JS Destructuring > loops > for-of with computed key referencing outer scope despite inner shadow', async () => {
  const source =
    "() => {\n        var O = { a: 'a' };\n        const a = 'a';\n        var ran = false;\n        for (const { [a]: _ } of [O]) {\n          const a = 'A'; // shadows outer `a`, but computed key already evaluated\n          expect(_).toBe('a');\n          ran = true;\n        }\n        expect(ran).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
    };"
  `);
});

test('062 JS Destructuring > assignment expressions > object destructuring assignment', async () => {
  const source =
    '() => {\n        let a, b;\n        ({ a, b } = { a: 1, b: 2 });\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
    };"
  `);
});

test('063 JS Destructuring > assignment expressions > array destructuring assignment', async () => {
  const source =
    '() => {\n        let x, y;\n        [x, y] = [1, 2];\n        expect(x).toBe(1);\n        expect(y).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var _ref, _arr;
      let x, y;
      ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (x = _arr[0]), (y = _arr[1]), _ref);
      expect(x).toBe(1);
      expect(y).toBe(2);
    };"
  `);
});

test('064 JS Destructuring > assignment expressions > swap via array destructuring', async () => {
  const source =
    '() => {\n        let a = 1,\n          b = 2;\n        [a, b] = [b, a];\n        expect(a).toBe(2);\n        expect(b).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var _ref, _arr;
      let a = 1,
        b = 2;
      ((_ref = [b, a]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
      expect(a).toBe(2);
      expect(b).toBe(1);
    };"
  `);
});

test('065 JS Destructuring > assignment expressions > nested assignment', async () => {
  const source =
    "() => {\n        let name, score;\n        ({\n          user: { name },\n          scores: [score],\n        } = { user: { name: 'test' }, scores: [100] });\n        expect(name).toBe('test');\n        expect(score).toBe(100);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      var _ref, _obj, _obj10, _arr;
      let name, score;
      ((_ref = {
        user: { name: 'test' },
        scores: [100],
      }),
        (_obj = _objectDestructuringEmpty(_ref)),
        (_obj10 = _objectDestructuringEmpty(_obj.user)),
        (name = _obj10.name),
        (_arr = _toArray(_obj.scores, 1, false)),
        (score = _arr[0]),
        _ref);
      expect(name).toBe('test');
      expect(score).toBe(100);
    };"
  `);
});

test('066 JS Destructuring > assignment expressions > assignment with rest', async () => {
  const source =
    '() => {\n        let first, rest;\n        [first, ...rest] = [1, 2, 3, 4];\n        expect(first).toBe(1);\n        expect(rest).toEqual([2, 3, 4]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
    };"
  `);
});

test('067 JS Destructuring > assignment expressions > chained destructuring assignment', async () => {
  const source =
    '() => {\n        var a, b, c, d;\n        ({ a, b } = { c, d } = { a: 1, b: 2, c: 3, d: 4 });\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(c).toBe(3);\n        expect(d).toBe(4);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      var _ref, _obj, _ref12, _obj13;
      var a, b, c, d;
      ((_ref =
        ((_ref12 = {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
        }),
        (_obj13 = _objectDestructuringEmpty(_ref12)),
        (c = _obj13.c),
        (d = _obj13.d),
        _ref12)),
        (_obj = _objectDestructuringEmpty(_ref)),
        (a = _obj.a),
        (b = _obj.b),
        _ref);
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(c).toBe(3);
      expect(d).toBe(4);
    };"
  `);
});

test('068 JS Destructuring > catch clause > destructures error object in catch', async () => {
  const source =
    "() => {\n        let msg, code;\n        try {\n          throw { message: 'fail', code: 42 };\n        } catch ({ message, code: c }) {\n          msg = message;\n          code = c;\n        }\n        expect(msg).toBe('fail');\n        expect(code).toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
    };"
  `);
});

test('069 JS Destructuring > catch clause > destructures Error instance properties', async () => {
  const source =
    "() => {\n        let msg;\n        try {\n          throw new TypeError('bad type');\n        } catch ({ message }) {\n          msg = message;\n        }\n        expect(msg).toBe('bad type');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
    };"
  `);
});

test('070 JS Destructuring > declaration variants > const with object destructuring', async () => {
  const source =
    '() => {\n        const { x, y } = { x: 1, y: 2 };\n        expect(x).toBe(1);\n        expect(y).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = {
          x: 1,
          y: 2,
        },
        _obj = _objectDestructuringEmpty(_ref),
        x = _obj.x,
        y = _obj.y;
      expect(x).toBe(1);
      expect(y).toBe(2);
    };"
  `);
});

test('071 JS Destructuring > declaration variants > let with array destructuring', async () => {
  const source =
    '() => {\n        let [a, b] = [1, 2];\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        // let allows reassignment\n        [a, b] = [3, 4];\n        expect(a).toBe(3);\n        expect(b).toBe(4);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var _ref10, _arr11;
      let _ref = [1, 2],
        _arr = _toArray(_ref, 2, false),
        a = _arr[0],
        b = _arr[1];
      expect(a).toBe(1);
      expect(b).toBe(2);
      // let allows reassignment
      ((_ref10 = [3, 4]),
        (_arr11 = _toArray(_ref10, 2, false)),
        (a = _arr11[0]),
        (b = _arr11[1]),
        _ref10);
      expect(a).toBe(3);
      expect(b).toBe(4);
    };"
  `);
});

test('072 JS Destructuring > declaration variants > var with multiple destructuring patterns', async () => {
  const source =
    '() => {\n        var { a } = { a: 1 },\n          [b] = [2];\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      var _ref = { a: 1 },
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        _ref10 = [2],
        _arr = _toArray(_ref10, 1, false),
        b = _arr[0];
      expect(a).toBe(1);
      expect(b).toBe(2);
    };"
  `);
});

test('073 JS Destructuring > declaration variants > const with nested defaults from function return', async () => {
  const source =
    '() => {\n        const getState = () => ({});\n        const { data: { courses: oldCourses = [] } = {} } = getState();\n        expect(oldCourses).toEqual([]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const getState = () => ({});
      const _ref = getState(),
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.data,
        _obj11 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
        _value12 = _obj11.courses,
        oldCourses = _value12 === void 0 ? [] : _value12;
      expect(oldCourses).toEqual([]);
    };"
  `);
});

test('074 JS Destructuring > iterator protocol > empty pattern calls iterator.return when return() returns object', async () => {
  const source =
    '() => {\n        var returnCalled = false;\n        // eslint-disable-next-line no-empty-pattern\n        var [] = {\n          [Symbol.iterator]: () => {\n            return {\n              return: () => {\n                returnCalled = true;\n                return {};\n              },\n            };\n          },\n        };\n        expect(returnCalled).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var returnCalled = false;
      // eslint-disable-next-line no-empty-pattern
      var _ref = {
          [Symbol.iterator]: () => {
            return {
              return: () => {
                returnCalled = true;
                return {};
              },
            };
          },
        },
        _arr = _toArray(_ref, 0, false);
      expect(returnCalled).toBe(true);
    };"
  `);
});

test('075 JS Destructuring > iterator protocol > empty pattern throws if iterator.return() returns non-object', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = {\n            [Symbol.iterator]: () => {\n              return {\n                return: () => {},\n              };\n            },\n          };\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = {
            [Symbol.iterator]: () => {
              return { return: () => {} };
            },
          },
          _arr = _toArray(_ref, 0, false);
      }).toThrow();
    };"
  `);
});

test('076 JS Destructuring > iterator protocol > single-element pattern throws if iterator.return() returns non-object', async () => {
  const source =
    '() => {\n        expect(() => {\n          var [x] = {\n            [Symbol.iterator]: () => {\n              return {\n                next: () => ({ done: false, value: 1 }),\n                return: () => {},\n              };\n            },\n          };\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        var _ref = {
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
          _arr = _toArray(_ref, 1, false),
          x = _arr[0];
      }).toThrow();
    };"
  `);
});

test('077 JS Destructuring > iterator protocol > single-element pattern does not throw if iterator.return() returns object', async () => {
  const source =
    '() => {\n        expect(() => {\n          var [x] = {\n            [Symbol.iterator]: () => {\n              return {\n                next: () => ({ done: false, value: 1 }),\n                return: () => ({}),\n              };\n            },\n          };\n        }).not.toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        var _ref = {
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
          _arr = _toArray(_ref, 1, false),
          x = _arr[0];
      }).not.toThrow();
    };"
  `);
});

test('078 JS Destructuring > holes and sparse arrays > default with explicit hole (let)', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        let [x = 23] = [,];\n        expect(x).toBe(23);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      let _ref = [,],
        _arr = _toArray(_ref, 1, false),
        _value = _arr[0],
        x = _value === void 0 ? 23 : _value;
      expect(x).toBe(23);
    };"
  `);
});

test('079 JS Destructuring > holes and sparse arrays > default with hole and trailing value (const)', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [y = 24, z] = [, 42];\n        expect(y).toBe(24);\n        expect(z).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [, 42],
        _arr = _toArray(_ref, 2, false),
        _value = _arr[0],
        y = _value === void 0 ? 24 : _value,
        z = _arr[1];
      expect(y).toBe(24);
      expect(z).toBe(42);
    };"
  `);
});

test('080 JS Destructuring > holes and sparse arrays > default interleaves with generator evaluation order', async () => {
  const source =
    '() => {\n        function* foo() {\n          yield 1;\n          yield 2;\n        }\n        let bar = foo();\n        // The default for `a` is bar.next().value, but it only runs because\n        // position 0 is a hole. By the time it runs, bar has already yielded 1\n        // (for position 1), so the default produces 2.\n        // eslint-disable-next-line no-sparse-arrays\n        const [a = bar.next().value, b] = [, bar.next().value];\n        expect(a).toBe(2);\n        expect(b).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
      const _ref = [, bar.next().value],
        _arr = _toArray(_ref, 2, false),
        _value = _arr[0],
        a = _value === void 0 ? bar.next().value : _value,
        b = _arr[1];
      expect(a).toBe(2);
      expect(b).toBe(1);
    };"
  `);
});

test('081 JS Destructuring > holes and sparse arrays > assignment pattern with hole', async () => {
  const source =
    '() => {\n        var c;\n        // eslint-disable-next-line no-sparse-arrays\n        const arr = ([c = 42] = [,]);\n        expect(c).toBe(42);\n        // eslint-disable-next-line no-sparse-arrays\n        expect(arr).toEqual([,]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
    };"
  `);
});

test('082 JS Destructuring > holes and sparse arrays > rest from sparse array fills holes with undefined', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [...d] = [,];\n        expect(d).toEqual([undefined]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [,],
        _arr = _toArray(_ref, 0, true),
        d = _arr.slice(0);
      expect(d).toEqual([undefined]);
    };"
  `);
});

test('083 JS Destructuring > holes and sparse arrays > rest with object pattern from sparse array', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [...{ 0: e }] = [,];\n        expect(e).toEqual(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [,],
        _arr = _toArray(_ref, 0, true),
        _obj = _objectDestructuringEmpty(_arr.slice(0)),
        e = _obj[0];
      expect(e).toEqual(undefined);
    };"
  `);
});

test('084 JS Destructuring > holes and sparse arrays > single element from sparse array is undefined', async () => {
  const source =
    '() => {\n        // eslint-disable-next-line no-sparse-arrays\n        const [f] = [,];\n        expect(f).toEqual(undefined);\n        // eslint-disable-next-line no-sparse-arrays\n        let [g] = [,];\n        expect(g).toEqual(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      // eslint-disable-next-line no-sparse-arrays
      const _ref = [,],
        _arr = _toArray(_ref, 1, false),
        f = _arr[0];
      expect(f).toEqual(undefined);
      // eslint-disable-next-line no-sparse-arrays
      let _ref10 = [,],
        _arr11 = _toArray(_ref10, 1, false),
        g = _arr11[0];
      expect(g).toEqual(undefined);
    };"
  `);
});

test('085 JS Destructuring > holes and sparse arrays > object pattern from hole throws', async () => {
  const source =
    '() => {\n        var thrown;\n        try {\n          thrown = false;\n          // eslint-disable-next-line no-sparse-arrays\n          [{}] = [,];\n        } catch (e) {\n          thrown = true;\n        }\n        expect(thrown).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
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
    };"
  `);
});

test('086 JS Destructuring > holes and sparse arrays > array pattern from hole throws', async () => {
  const source =
    '() => {\n        var thrown;\n        try {\n          thrown = false;\n          // eslint-disable-next-line no-sparse-arrays\n          [[]] = [,];\n        } catch (e) {\n          thrown = true;\n        }\n        expect(thrown).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var _ref, _arr, _arr10;
      var thrown;
      try {
        thrown = false;
        // eslint-disable-next-line no-sparse-arrays
        ((_ref = [,]), (_arr = _toArray(_ref, 1, false)), (_arr10 = _toArray(_arr[0], 0, false)), _ref);
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);
    };"
  `);
});

test('087 JS Destructuring > empty array pattern > throws on null', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = null;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = null,
          _arr = _toArray(_ref, 0, false);
      }).toThrow();
    };"
  `);
});

test('088 JS Destructuring > empty array pattern > throws on number', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = 42;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = 42,
          _arr = _toArray(_ref, 0, false);
      }).toThrow();
    };"
  `);
});

test('089 JS Destructuring > empty array pattern > throws on plain object', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = {};\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = {},
          _arr = _toArray(_ref, 0, false);
      }).toThrow();
    };"
  `);
});

test('090 JS Destructuring > empty array pattern > throws if Symbol.iterator returns non-object', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = { [Symbol.iterator]: () => {} };\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = { [Symbol.iterator]: () => {} },
          _arr = _toArray(_ref, 0, false);
      }).toThrow();
    };"
  `);
});

test('091 JS Destructuring > empty array pattern > does not throw on valid iterables', async () => {
  const source =
    "() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          var [] = [];\n          // eslint-disable-next-line no-empty-pattern\n          var [] = [0, 1, 2];\n          // eslint-disable-next-line no-empty-pattern\n          var [] = 'foo';\n          // eslint-disable-next-line no-empty-pattern\n          var [] = (function* () {\n            throw new Error('Should not throw');\n          })();\n          // eslint-disable-next-line no-empty-pattern\n          var [] = { [Symbol.iterator]: () => ({}) };\n        }).not.toThrow();\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        var _ref = [],
          _arr = _toArray(_ref, 0, false);
        // eslint-disable-next-line no-empty-pattern
        var _ref8 = [0, 1, 2],
          _arr9 = _toArray(_ref8, 0, false);
        // eslint-disable-next-line no-empty-pattern
        var _ref10 = 'foo',
          _arr11 = _toArray(_ref10, 0, false);
        // eslint-disable-next-line no-empty-pattern
        var _ref12 = (function* () {
            throw new Error('Should not throw');
          })(),
          _arr13 = _toArray(_ref12, 0, false);
        // eslint-disable-next-line no-empty-pattern
        var _ref14 = { [Symbol.iterator]: () => ({}) },
          _arr15 = _toArray(_ref14, 0, false);
      }).not.toThrow();
    };"
  `);
});

test('092 JS Destructuring > empty array pattern > calls iterator.return on empty pattern', async () => {
  const source =
    '() => {\n        var returnCalled = false;\n        // eslint-disable-next-line no-empty-pattern\n        var [] = {\n          [Symbol.iterator]: () => {\n            return {\n              return: () => {\n                returnCalled = true;\n                return {};\n              },\n            };\n          },\n        };\n        expect(returnCalled).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var returnCalled = false;
      // eslint-disable-next-line no-empty-pattern
      var _ref = {
          [Symbol.iterator]: () => {
            return {
              return: () => {
                returnCalled = true;
                return {};
              },
            };
          },
        },
        _arr = _toArray(_ref, 0, false);
      expect(returnCalled).toBe(true);
    };"
  `);
});

test('093 JS Destructuring > non-iterable errors > throws on undefined', async () => {
  const source =
    '() => {\n        var foo;\n        expect(() => {\n          [foo] = undefined;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var foo;
      expect(() => {
        var _ref, _arr;
        ((_ref = undefined), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);
      }).toThrow();
    };"
  `);
});

test('094 JS Destructuring > non-iterable errors > throws on plain object', async () => {
  const source =
    '() => {\n        var foo;\n        expect(() => {\n          [foo] = {};\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var foo;
      expect(() => {
        var _ref, _arr;
        ((_ref = {}), (_arr = _toArray(_ref, 1, false)), (foo = _arr[0]), _ref);
      }).toThrow();
    };"
  `);
});

test('095 JS Destructuring > edge cases > empty object pattern does not throw on object', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          const {} = { a: 1 };\n        }).not.toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        const _ref = { a: 1 },
          _obj = _objectDestructuringEmpty(_ref);
      }).not.toThrow();
    };"
  `);
});

test('096 JS Destructuring > edge cases > empty array pattern does not throw on array', async () => {
  const source =
    '() => {\n        expect(() => {\n          // eslint-disable-next-line no-empty-pattern\n          const [] = [1, 2];\n        }).not.toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        // eslint-disable-next-line no-empty-pattern
        const _ref = [1, 2],
          _arr = _toArray(_ref, 0, false);
      }).not.toThrow();
    };"
  `);
});

test('097 JS Destructuring > edge cases > destructuring null throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const { a } = null;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      expect(() => {
        const _ref = null,
          _obj = _objectDestructuringEmpty(_ref),
          a = _obj.a;
      }).toThrow();
    };"
  `);
});

test('098 JS Destructuring > edge cases > destructuring undefined throws TypeError', async () => {
  const source =
    '() => {\n        expect(() => {\n          const { a } = undefined;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      expect(() => {
        const _ref = undefined,
          _obj = _objectDestructuringEmpty(_ref),
          a = _obj.a;
      }).toThrow();
    };"
  `);
});

test('099 JS Destructuring > edge cases > array destructuring from non-iterable throws', async () => {
  const source =
    '() => {\n        expect(() => {\n          const [a] = 42;\n        }).toThrow();\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      expect(() => {
        const _ref = 42,
          _arr = _toArray(_ref, 1, false),
          a = _arr[0];
      }).toThrow();
    };"
  `);
});

test('100 JS Destructuring > edge cases > default value expression is lazily evaluated', async () => {
  const source =
    '() => {\n        let evaluated = false;\n        const { a = (evaluated = true) } = { a: 1 };\n        expect(a).toBe(1);\n        expect(evaluated).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      let evaluated = false;
      const _ref = { a: 1 },
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        a = _value === void 0 ? (evaluated = true) : _value;
      expect(a).toBe(1);
      expect(evaluated).toBe(false);
    };"
  `);
});

test('101 JS Destructuring > edge cases > default value expression evaluated when value is undefined', async () => {
  const source =
    '() => {\n        let count = 0;\n        const { a = ++count, b = ++count } = { a: undefined };\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(count).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      let count = 0;
      const _ref = { a: undefined },
        _obj = _objectDestructuringEmpty(_ref),
        _value = _obj.a,
        a = _value === void 0 ? ++count : _value,
        _value12 = _obj.b,
        b = _value12 === void 0 ? ++count : _value12;
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(count).toBe(2);
    };"
  `);
});

test('102 JS Destructuring > edge cases > array default value expression is lazily evaluated', async () => {
  const source =
    '() => {\n        let evaluated = false;\n        const [a = (evaluated = true)] = [42];\n        expect(a).toBe(42);\n        expect(evaluated).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      let evaluated = false;
      const _ref = [42],
        _arr = _toArray(_ref, 1, false),
        _value = _arr[0],
        a = _value === void 0 ? (evaluated = true) : _value;
      expect(a).toBe(42);
      expect(evaluated).toBe(false);
    };"
  `);
});

test('103 JS Destructuring > edge cases > evaluation order matches spec for object destructuring', async () => {
  const source =
    "() => {\n        const order = [];\n        const obj = {\n          get a() {\n            order.push('get a');\n            return 1;\n          },\n          get b() {\n            order.push('get b');\n            return 2;\n          },\n        };\n        const { a, b } = obj;\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n        expect(order).toEqual(['get a', 'get b']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = obj,
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        b = _obj.b;
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(order).toEqual(['get a', 'get b']);
    };"
  `);
});

test('104 JS Destructuring > edge cases > rest creates a shallow copy', async () => {
  const source =
    '() => {\n        const inner = { value: 1 };\n        const { a, ...rest } = { a: 1, b: inner };\n        expect(rest.b).toBe(inner);\n        inner.value = 2;\n        expect(rest.b.value).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = {
          a: 1,
          b: inner,
        },
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        rest = _objectWithoutProperties(_obj, ['a']);
      expect(rest.b).toBe(inner);
      inner.value = 2;
      expect(rest.b.value).toBe(2);
    };"
  `);
});

test('105 JS Destructuring > edge cases > rest with symbol keys are included', async () => {
  const source =
    "() => {\n        const sym = Symbol('test');\n        const obj = { a: 1, [sym]: 2 };\n        const { a, ...rest } = obj;\n        expect(a).toBe(1);\n        expect(rest[sym]).toBe(2);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = obj,
        _obj = _objectDestructuringEmpty(_ref),
        a = _obj.a,
        rest = _objectWithoutProperties(_obj, ['a']);
      expect(a).toBe(1);
      expect(rest[sym]).toBe(2);
    };"
  `);
});

test('106 JS Destructuring > edge cases > destructuring assignment returns the right-hand value', async () => {
  const source =
    '() => {\n        let a, b;\n        const result = ([a, b] = [1, 2]);\n        expect(result).toEqual([1, 2]);\n        expect(a).toBe(1);\n        expect(b).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    () => {
      var _ref, _arr;
      let a, b;
      const result =
        ((_ref = [1, 2]), (_arr = _toArray(_ref, 2, false)), (a = _arr[0]), (b = _arr[1]), _ref);
      expect(result).toEqual([1, 2]);
      expect(a).toBe(1);
      expect(b).toBe(2);
    };"
  `);
});

test('107 JS Destructuring > edge cases > array rest with object pattern', async () => {
  const source =
    '() => {\n        const [first, ...{ length }] = [1, 2, 3];\n        expect(first).toBe(1);\n        expect(length).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    () => {
      const _ref = [1, 2, 3],
        _arr = _toArray(_ref, 1, true),
        first = _arr[0],
        _obj = _objectDestructuringEmpty(_arr.slice(1)),
        length = _obj.length;
      expect(first).toBe(1);
      expect(length).toBe(2);
    };"
  `);
});

test('108 JS Destructuring > edge cases > handles large number of properties', async () => {
  const source =
    "() => {\n        const obj = {};\n        for (let i = 0; i < 100; i++) {\n          obj['k' + i] = i;\n        }\n        const { k0, k50, k99, ...rest } = obj;\n        expect(k0).toBe(0);\n        expect(k50).toBe(50);\n        expect(k99).toBe(99);\n        expect(Object.keys(rest).length).toBe(97);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
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
      const _ref = obj,
        _obj = _objectDestructuringEmpty(_ref),
        k0 = _obj.k0,
        k50 = _obj.k50,
        k99 = _obj.k99,
        rest = _objectWithoutProperties(_obj, ['k0', 'k50', 'k99']);
      expect(k0).toBe(0);
      expect(k50).toBe(50);
      expect(k99).toBe(99);
      expect(Object.keys(rest).length).toBe(97);
    };"
  `);
});
