import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength — parameters object rest used in default (input)',
    source: `({...R}, a = R) => {}
({...R}, e, c = 2, a = R, f = q) => { let q; }
({...R}, a = f(R)) => {}
`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _ref2 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _ref3 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _ref2 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _ref3 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
(function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _obj16 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj16);
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _obj18 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj18);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
(function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _obj16 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj16);
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _obj18 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj18);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});`,
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest assignment expression (input)',
    source: `({ a, b, ...c } = obj);
`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _obj;
((_obj = obj), ({ a, b } = _obj), (c = _objectWithoutProperties(_obj, ['a', 'b'])));`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _obj;
((_obj = obj), ({ a, b } = _obj), (c = _objectWithoutProperties(_obj, ['a', 'b'])));`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
((_ref = obj),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a = _obj.a),
  (b = _obj.b),
  (c = _objectWithoutProperties(_obj, ['a', 'b'])),
  _ref);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
((_ref = obj),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a = _obj.a),
  (b = _obj.b),
  (c = _objectWithoutProperties(_obj, ['a', 'b'])),
  _ref);`,
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest computed (input)',
    source: `let { [a]: b, ...c } = obj;
`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
let sym = Symbol();
let _a$b$sym = {
    a: 1,
    b: 2,
    [sym]: 3,
  },
  { a } = _a$b$sym,
  r = _objectWithoutProperties(_a$b$sym, ['a']);
expect(a).toBe(1);
expect(r.b).toBe(2);
expect(sym in r).toBe(false);`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
let sym = Symbol();
let _a$b$sym = {
    a: 1,
    b: 2,
    [sym]: 3,
  },
  { a } = _a$b$sym,
  r = _objectWithoutProperties(_a$b$sym, ['a']);
expect(a).toBe(1);
expect(r.b).toBe(2);
expect(sym in r).toBe(false);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest nested (input)',
    source: `let { a, nested: { b, c, ...d }, e } = obj;
`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  _obj14 = _objectDestructuringEmpty(_obj.nested),
  b = _obj14.b,
  c = _obj14.c,
  d = _objectWithoutProperties(_obj14, ['b', 'c']),
  e = _obj.e;`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  _obj14 = _objectDestructuringEmpty(_obj.nested),
  b = _obj14.b,
  c = _obj14.c,
  d = _objectWithoutProperties(_obj14, ['b', 'c']),
  e = _obj.e;`,
      },
    ],
  },
  {
    title: 'assumption objectRestNoSymbols — rest var declaration (input)',
    source: `var { a, b, ...c } = obj;
`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _ref = (0, obj),
  { a, b } = _ref,
  c = _objectWithoutProperties(_ref, ['a', 'b']);`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _ref = (0, obj),
  { a, b } = _ref,
  c = _objectWithoutProperties(_ref, ['a', 'b']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['a', 'b']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _obj = _objectDestructuringEmpty(obj),
  a = _obj.a,
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['a', 'b']);`,
      },
    ],
  },
  {
    title: 'assumption pureGetters — rest remove unused excluded keys (exec)',
    source: `let called = false;
let obj = {
  get foo() { called = true }
};

let { foo, ...rest } = obj;

expect("foo" in rest).toBe(false);

// Without assuming that getters are pure (in this case it isn't), this should be true
expect(called).toBe(false);
`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
let called = false;
let obj = {
  get foo() {
    called = true;
  },
};
let _ref = (0, obj),
  { foo } = _ref,
  rest = _objectWithoutProperties(_ref, ['foo']);
expect('foo' in rest).toBe(false);
// Without assuming that getters are pure (in this case it isn't), this should be true
expect(called).toBe(false);`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
let called = false;
let obj = {
  get foo() {
    called = true;
  },
};
let _ref = (0, obj),
  { foo } = _ref,
  rest = _objectWithoutProperties(_ref, ['foo']);
expect('foo' in rest).toBe(false);
// Without assuming that getters are pure (in this case it isn't), this should be true
expect(called).toBe(false);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let called = false;
let obj = {
  get foo() {
    called = true;
  },
};
let _obj = _objectDestructuringEmpty(obj),
  foo = _obj.foo,
  rest = _objectWithoutProperties(_obj, ['foo']);
expect('foo' in rest).toBe(false);
// Without assuming that getters are pure (in this case it isn't), this should be true
expect(called).toBe(false);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let called = false;
let obj = {
  get foo() {
    called = true;
  },
};
let _obj = _objectDestructuringEmpty(obj),
  foo = _obj.foo,
  rest = _objectWithoutProperties(_obj, ['foo']);
expect('foo' in rest).toBe(false);
// Without assuming that getters are pure (in this case it isn't), this should be true
expect(called).toBe(false);`,
      },
    ],
  },
  {
    title: 'assumption pureGetters — rest remove unused excluded keys (input)',
    source: `// should not remove when destructuring into existing bindings
({ a2, ...b2 } = c2);

function render() {
  const {
    excluded,
    excluded2: excludedRenamed,
    used,
    used2: usedRenamed,
    ...props
  } = this.props;

  console.log(used, usedRenamed);

  return React.createElement("input", props);
}

function smth({ unused, ...rest }) {
  call(rest);
}
`,
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
        output: `const _excluded = ['excluded', 'excluded2', 'used', 'used2'],
  _excluded2 = ['unused'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _c;
// should not remove when destructuring into existing bindings
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
function render() {
  const _this$props = this.props,
    { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,
    props = _objectWithoutProperties(_this$props, _excluded);
  console.log(used, usedRenamed);
  return React.createElement('input', props);
}
function smth(_ref) {
  let { unused } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded2);
  call(rest);
}`,
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
        output: `const _excluded = ['excluded', 'excluded2', 'used', 'used2'],
  _excluded2 = ['unused'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _c;
// should not remove when destructuring into existing bindings
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
function render() {
  const _this$props = this.props,
    { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,
    props = _objectWithoutProperties(_this$props, _excluded);
  console.log(used, usedRenamed);
  return React.createElement('input', props);
}
function smth(_ref) {
  let { unused } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded2);
  call(rest);
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
// should not remove when destructuring into existing bindings
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
function render() {
  const _obj25 = _objectDestructuringEmpty(this.props),
    excluded = _obj25.excluded,
    excludedRenamed = _obj25.excluded2,
    used = _obj25.used,
    usedRenamed = _obj25.used2,
    props = _objectWithoutProperties(_obj25, ['excluded', 'excluded2', 'used', 'used2']);
  console.log(used, usedRenamed);
  return React.createElement('input', props);
}
function smth() {
  let _obj27 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    unused = _obj27.unused,
    rest = _objectWithoutProperties(_obj27, ['unused']);
  call(rest);
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
// should not remove when destructuring into existing bindings
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
function render() {
  const _obj25 = _objectDestructuringEmpty(this.props),
    excluded = _obj25.excluded,
    excludedRenamed = _obj25.excluded2,
    used = _obj25.used,
    usedRenamed = _obj25.used2,
    props = _objectWithoutProperties(_obj25, ['excluded', 'excluded2', 'used', 'used2']);
  console.log(used, usedRenamed);
  return React.createElement('input', props);
}
function smth() {
  let _obj27 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    unused = _obj27.unused,
    rest = _objectWithoutProperties(_obj27, ['unused']);
  call(rest);
}`,
      },
    ],
  },
  {
    title: 'assumption pureGetters — spread single call (exec)',
    source: `let count = 0;

let withFoo = { get foo() { return count++; } };
let withBar = { get bar() { return count++; } };

let res = { ...withFoo, middle: count, ...withBar };

// Without assuming that getters are pure (in this case it isn't),
// the result should be { foo: 0, middle: 1, bar: 1 }
expect(res).toEqual({ foo: 0, middle: 0, bar: 1 });
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let count = 0;
let withFoo = {
  get foo() {
    return count++;
  },
};
let withBar = {
  get bar() {
    return count++;
  },
};
let res = _objectSpread(_objectSpread({}, withFoo), {}, { middle: count }, withBar);
// Without assuming that getters are pure (in this case it isn't),
// the result should be { foo: 0, middle: 1, bar: 1 }
expect(res).toEqual({
  foo: 0,
  middle: 0,
  bar: 1,
});`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let count = 0;
let withFoo = {
  get foo() {
    return count++;
  },
};
let withBar = {
  get bar() {
    return count++;
  },
};
let res = _objectSpread(_objectSpread({}, withFoo), {}, { middle: count }, withBar);
// Without assuming that getters are pure (in this case it isn't),
// the result should be { foo: 0, middle: 1, bar: 1 }
expect(res).toEqual({
  foo: 0,
  middle: 0,
  bar: 1,
});`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
let count = 0;
let withFoo = {
  get foo() {
    return count++;
  },
};
let withBar = {
  get bar() {
    return count++;
  },
};
let res = _extends({}, withFoo, { middle: count }, withBar);
// Without assuming that getters are pure (in this case it isn't),
// the result should be { foo: 0, middle: 1, bar: 1 }
expect(res).toEqual({
  foo: 0,
  middle: 0,
  bar: 1,
});`,
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
        output: `let count = 0;
let withFoo = {
  get foo() {
    return count++;
  },
};
let withBar = {
  get bar() {
    return count++;
  },
};
let res = Object.assign({}, withFoo, { middle: count }, withBar);
// Without assuming that getters are pure (in this case it isn't),
// the result should be { foo: 0, middle: 1, bar: 1 }
expect(res).toEqual({
  foo: 0,
  middle: 0,
  bar: 1,
});`,
      },
    ],
  },
  {
    title: 'assumption pureGetters — spread single call (input)',
    source: `let obj = { a, ...b, c, ...d, e };
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let obj = _objectSpread(_objectSpread(_objectSpread({ a }, b), {}, { c }, d), {}, { e });`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let obj = _objectSpread(_objectSpread(_objectSpread({ a }, b), {}, { c }, d), {}, { e });`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
let obj = _extends({ a }, b, { c }, d, { e });`,
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
        output: 'let obj = Object.assign({ a }, b, { c }, d, { e });',
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties with useBuiltIns — assignment (input)',
    source: `var x;
var y;
var z;

z = { x, ...y };

z = { x, w: { ...y } };
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var x;
var y;
var z;
z = _objectSpread({ x }, y);
z = {
  x,
  w: _objectSpread({}, y),
};`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var x;
var y;
var z;
z = _objectSpread({ x }, y);
z = {
  x,
  w: _objectSpread({}, y),
};`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var x;
var y;
var z;
z = _extends({ x }, y);
z = {
  x,
  w: _extends({}, y),
};`,
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
        output: `var x;
var y;
var z;
z = Object.assign({ x }, y);
z = {
  x,
  w: Object.assign({}, y),
};`,
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties with useBuiltIns — expression (exec)',
    source: `var log = [];

var a = {
  ...{ get foo() { log.push(1); } },
  get bar() { log.push(2); }
};

// Loose mode uses regular Get, not GetOwnProperty.
expect(log).toEqual([1, 2]);
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var log = [];
var a = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        log.push(1);
      },
    },
  ),
  {},
  {
    get bar() {
      log.push(2);
    },
  },
);
// Loose mode uses regular Get, not GetOwnProperty.
expect(log).toEqual([1, 2]);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var log = [];
var a = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        log.push(1);
      },
    },
  ),
  {},
  {
    get bar() {
      log.push(2);
    },
  },
);
// Loose mode uses regular Get, not GetOwnProperty.
expect(log).toEqual([1, 2]);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var log = [];
var a = _extends(
  {},
  {
    get foo() {
      log.push(1);
    },
  },
  {
    get bar() {
      log.push(2);
    },
  },
);
// Loose mode uses regular Get, not GetOwnProperty.
expect(log).toEqual([1, 2]);`,
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
        output: `var log = [];
var a = Object.assign(
  {},
  {
    get foo() {
      log.push(1);
    },
  },
  {
    get bar() {
      log.push(2);
    },
  },
);
// Loose mode uses regular Get, not GetOwnProperty.
expect(log).toEqual([1, 2]);`,
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties with useBuiltIns — expression (input)',
    source: `var a;
var b;
var c;
var d;
var x;
var y;

({ x, ...y, a, ...b, c });

({ ...Object.prototype });

({ ...{ foo: 'bar' } });

({ ...{ foo: 'bar' }, ...{ bar: 'baz' } });

({ ...{ get foo () { return 'foo' } } });
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var a;
var b;
var c;
var d;
var x;
var y;
_objectSpread(_objectSpread(_objectSpread({ x }, y), {}, { a }, b), {}, { c });
_objectSpread({}, Object.prototype);
_objectSpread({}, { foo: 'bar' });
_objectSpread(_objectSpread({}, { foo: 'bar' }), { bar: 'baz' });
_objectSpread(
  {},
  {
    get foo() {
      return 'foo';
    },
  },
);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var a;
var b;
var c;
var d;
var x;
var y;
_objectSpread(_objectSpread(_objectSpread({ x }, y), {}, { a }, b), {}, { c });
_objectSpread({}, Object.prototype);
_objectSpread({}, { foo: 'bar' });
_objectSpread(_objectSpread({}, { foo: 'bar' }), { bar: 'baz' });
_objectSpread(
  {},
  {
    get foo() {
      return 'foo';
    },
  },
);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var a;
var b;
var c;
var d;
var x;
var y;
_extends({ x }, y, { a }, b, { c });
_extends({}, Object.prototype);
_extends({}, { foo: 'bar' });
_extends({}, { foo: 'bar' }, { bar: 'baz' });
_extends(
  {},
  {
    get foo() {
      return 'foo';
    },
  },
);`,
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
        output: `var a;
var b;
var c;
var d;
var x;
var y;
Object.assign({ x }, y, { a }, b, { c });
Object.assign({}, Object.prototype);
Object.assign({}, { foo: 'bar' });
Object.assign({}, { foo: 'bar' }, { bar: 'baz' });
Object.assign(
  {},
  {
    get foo() {
      return 'foo';
    },
  },
);`,
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties with useBuiltIns — no getOwnPropertyDescriptors (exec)',
    source: `const oldGOPDs = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = null;

try {
  ({ ...{ a: 1 }, b: 1, ...{} });
} finally {
  Object.getOwnPropertyDescriptors = oldGOPDs;
}

`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
const oldGOPDs = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = null;
try {
  _objectSpread(_objectSpread({}, { a: 1 }), {}, { b: 1 }, {});
} finally {
  Object.getOwnPropertyDescriptors = oldGOPDs;
}`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
const oldGOPDs = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = null;
try {
  _objectSpread(_objectSpread({}, { a: 1 }), {}, { b: 1 }, {});
} finally {
  Object.getOwnPropertyDescriptors = oldGOPDs;
}`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
const oldGOPDs = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = null;
try {
  _extends({}, { a: 1 }, { b: 1 }, {});
} finally {
  Object.getOwnPropertyDescriptors = oldGOPDs;
}`,
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
        output: `const oldGOPDs = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = null;
try {
  Object.assign({}, { a: 1 }, { b: 1 }, {});
} finally {
  Object.getOwnPropertyDescriptors = oldGOPDs;
}`,
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties with useBuiltIns — no object assign exec (exec)',
    source: `"use strict";
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});

Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});

const obj = { 'NOSET': 123 };
// this won't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
expect(() => {
  const objSpread = { ...obj };
}).toThrow();

const obj2 = { 'NOWRITE': 456 };
// this throws \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
expect(() => {
  const obj2Spread = { ...obj2 };
}).toThrow();

const KEY = Symbol('key');
const obj3Spread = { ...{ get foo () { return 'bar' } }, [KEY]: 'symbol' };
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');

const obj4Spread = { ...Object.prototype };
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();

expect(() => ({ ...null, ...undefined })).not.toThrow();

const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = { ...o };
// Loose will do o2.__proto__ = []
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);
`,
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
        output: `'use strict';
var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this won't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
expect(() => {
  const objSpread = _objectSpread({}, obj);
}).toThrow();
const obj2 = { NOWRITE: 456 };
// this throws \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
expect(() => {
  const obj2Spread = _objectSpread({}, obj2);
}).toThrow();
const KEY = Symbol('key');
const obj3Spread = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        return 'bar';
      },
    },
  ),
  {},
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _objectSpread({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _objectSpread({}, o);
// Loose will do o2.__proto__ = []
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);`,
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
        output: `'use strict';
var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this won't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
expect(() => {
  const objSpread = _objectSpread({}, obj);
}).toThrow();
const obj2 = { NOWRITE: 456 };
// this throws \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
expect(() => {
  const obj2Spread = _objectSpread({}, obj2);
}).toThrow();
const KEY = Symbol('key');
const obj3Spread = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        return 'bar';
      },
    },
  ),
  {},
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _objectSpread({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _objectSpread({}, o);
// Loose will do o2.__proto__ = []
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);`,
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
        output: `'use strict';
var _extends = require('@babel/runtime/helpers/extends');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this won't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
expect(() => {
  const objSpread = _extends({}, obj);
}).toThrow();
const obj2 = { NOWRITE: 456 };
// this throws \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
expect(() => {
  const obj2Spread = _extends({}, obj2);
}).toThrow();
const KEY = Symbol('key');
const obj3Spread = _extends(
  {},
  {
    get foo() {
      return 'bar';
    },
  },
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _extends({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _extends({}, null, undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _extends({}, o);
// Loose will do o2.__proto__ = []
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);`,
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
        output: `'use strict';
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this won't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
expect(() => {
  const objSpread = Object.assign({}, obj);
}).toThrow();
const obj2 = { NOWRITE: 456 };
// this throws \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
expect(() => {
  const obj2Spread = Object.assign({}, obj2);
}).toThrow();
const KEY = Symbol('key');
const obj3Spread = Object.assign(
  {},
  {
    get foo() {
      return 'bar';
    },
  },
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = Object.assign({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => Object.assign({}, null, undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = Object.assign({}, o);
// Loose will do o2.__proto__ = []
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(true);`,
      },
    ],
  },
  {
    title: 'assumption setSpreadProperties — targets support object assign (input)',
    source: `let a = { x: 1, ...b };
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let a = _objectSpread({ x: 1 }, b);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
let a = _objectSpread({ x: 1 }, b);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
let a = _extends({ x: 1 }, b);`,
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
        output: 'let a = Object.assign({ x: 1 }, b);',
      },
    ],
  },
  {
    title: 'object rest — assignment expression (input)',
    source: `({ a1 } = c1);
({ a2, ...b2 } = c2);

console.log({ a3, ...b3 } = c3);
`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
({ a1 } = c1);
var _c;
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
var _c2;
console.log(((_c2 = c3), ({ a3 } = _c2), (b3 = _objectWithoutProperties(_c2, ['a3'])), _c2));`,
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
        output: `var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
({ a1 } = c1);
var _c;
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
var _c2;
console.log(((_c2 = c3), ({ a3 } = _c2), (b3 = _objectWithoutProperties(_c2, ['a3'])), _c2));`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj, _ref17, _obj18;
({ a1 } = c1);
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
console.log(
  ((_ref17 = c3),
  (_obj18 = _objectDestructuringEmpty(_ref17)),
  (a3 = _obj18.a3),
  (b3 = _objectWithoutProperties(_obj18, ['a3'])),
  _ref17),
);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj, _ref17, _obj18;
({ a1 } = c1);
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
console.log(
  ((_ref17 = c3),
  (_obj18 = _objectDestructuringEmpty(_ref17)),
  (a3 = _obj18.a3),
  (b3 = _objectWithoutProperties(_obj18, ['a3'])),
  _ref17),
);`,
      },
    ],
  },
  {
    title: 'object rest — catch clause (input)',
    source: `try {} catch({ ...a34 }) {}
try {} catch({a1, ...b1}) {}
try {} catch({a2, b2, ...c2}) {}
try {} catch({a2, b2, c2: { c3, ...c4 }}) {}

// Unchanged
try {} catch(a) {}
try {} catch({ b }) {}
`,
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
try {
} catch (_caught) {
  let _obj = _objectDestructuringEmpty(_caught),
    a34 = _extends({}, _obj);
}
try {
} catch (_caught18) {
  let _obj19 = _objectDestructuringEmpty(_caught18),
    a1 = _obj19.a1,
    b1 = _objectWithoutProperties(_obj19, ['a1']);
}
try {
} catch (_caught20) {
  let _obj21 = _objectDestructuringEmpty(_caught20),
    a2 = _obj21.a2,
    b2 = _obj21.b2,
    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);
}
try {
} catch (_caught22) {
  let _obj23 = _objectDestructuringEmpty(_caught22),
    a2 = _obj23.a2,
    b2 = _obj23.b2,
    _obj24 = _objectDestructuringEmpty(_obj23.c2),
    c3 = _obj24.c3,
    c4 = _objectWithoutProperties(_obj24, ['c3']);
}
// Unchanged
try {
} catch (a) {}
try {
} catch ({ b }) {}`,
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
try {
} catch (_caught) {
  let _obj = _objectDestructuringEmpty(_caught),
    a34 = _extends({}, _obj);
}
try {
} catch (_caught18) {
  let _obj19 = _objectDestructuringEmpty(_caught18),
    a1 = _obj19.a1,
    b1 = _objectWithoutProperties(_obj19, ['a1']);
}
try {
} catch (_caught20) {
  let _obj21 = _objectDestructuringEmpty(_caught20),
    a2 = _obj21.a2,
    b2 = _obj21.b2,
    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);
}
try {
} catch (_caught22) {
  let _obj23 = _objectDestructuringEmpty(_caught22),
    a2 = _obj23.a2,
    b2 = _obj23.b2,
    _obj24 = _objectDestructuringEmpty(_obj23.c2),
    c3 = _obj24.c3,
    c4 = _objectWithoutProperties(_obj24, ['c3']);
}
// Unchanged
try {
} catch (a) {}
try {
} catch ({ b }) {}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
try {
} catch (_caught) {
  let _obj = _objectDestructuringEmpty(_caught),
    a34 = _extends({}, _obj);
}
try {
} catch (_caught18) {
  let _obj19 = _objectDestructuringEmpty(_caught18),
    a1 = _obj19.a1,
    b1 = _objectWithoutProperties(_obj19, ['a1']);
}
try {
} catch (_caught20) {
  let _obj21 = _objectDestructuringEmpty(_caught20),
    a2 = _obj21.a2,
    b2 = _obj21.b2,
    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);
}
try {
} catch (_caught22) {
  let _obj23 = _objectDestructuringEmpty(_caught22),
    a2 = _obj23.a2,
    b2 = _obj23.b2,
    _obj24 = _objectDestructuringEmpty(_obj23.c2),
    c3 = _obj24.c3,
    c4 = _objectWithoutProperties(_obj24, ['c3']);
}
// Unchanged
try {
} catch (a) {}
try {
} catch ({ b }) {}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
try {
} catch (_caught) {
  let _obj = _objectDestructuringEmpty(_caught),
    a34 = _extends({}, _obj);
}
try {
} catch (_caught18) {
  let _obj19 = _objectDestructuringEmpty(_caught18),
    a1 = _obj19.a1,
    b1 = _objectWithoutProperties(_obj19, ['a1']);
}
try {
} catch (_caught20) {
  let _obj21 = _objectDestructuringEmpty(_caught20),
    a2 = _obj21.a2,
    b2 = _obj21.b2,
    c2 = _objectWithoutProperties(_obj21, ['a2', 'b2']);
}
try {
} catch (_caught22) {
  let _obj23 = _objectDestructuringEmpty(_caught22),
    a2 = _obj23.a2,
    b2 = _obj23.b2,
    _obj24 = _objectDestructuringEmpty(_obj23.c2),
    c3 = _obj24.c3,
    c4 = _objectWithoutProperties(_obj24, ['c3']);
}
// Unchanged
try {
} catch (a) {}
try {
} catch ({ b }) {}`,
      },
    ],
  },
  {
    title: 'object rest — duplicate decl bug (input)',
    source: `it("es7.objectRestSpread", () => {
  let original = { a: 1, b: 2 };
  let { ...copy } = original;
});
`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
it('es7.objectRestSpread', () => {
  let original = {
    a: 1,
    b: 2,
  };
  let _ref = (0, original),
    copy = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
});`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
it('es7.objectRestSpread', () => {
  let original = {
    a: 1,
    b: 2,
  };
  let _ref = (0, original),
    copy = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
it('es7.objectRestSpread', () => {
  let original = {
    a: 1,
    b: 2,
  };
  let _obj = _objectDestructuringEmpty(original),
    copy = _extends({}, _obj);
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
it('es7.objectRestSpread', () => {
  let original = {
    a: 1,
    b: 2,
  };
  let _obj = _objectDestructuringEmpty(original),
    copy = _extends({}, _obj);
});`,
      },
    ],
  },
  {
    title: 'object rest — export (input)',
    source: `// ExportNamedDeclaration
export var { b, ...c } = asdf2;
// Skip
export var { bb, cc } = ads;
export var [ dd, ee, ...ff ] = ads;
`,
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
        output: `import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
// ExportNamedDeclaration
export var _ref = (0, asdf2),
  { b } = _ref,
  c = _objectWithoutProperties(_ref, ['b']);
// Skip
export var { bb, cc } = ads;
export var [dd, ee, ...ff] = ads;`,
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
        output: `import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
// ExportNamedDeclaration
export var _ref = (0, asdf2),
  { b } = _ref,
  c = _objectWithoutProperties(_ref, ['b']);
// Skip
export var { bb, cc } = ads;
export var [dd, ee, ...ff] = ads;`,
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
        output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
import _babelHelper2 from '@babel/runtime/helpers/objectWithoutPropertiesLoose';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: _babelHelper,
  objectWithoutPropertiesLoose: _babelHelper2,
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
// ExportNamedDeclaration
export var _obj = _objectDestructuringEmpty(asdf2),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
// Skip
export var { bb, cc } = ads;
export var [dd, ee, ...ff] = ads;`,
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
        output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
import _babelHelper2 from '@babel/runtime/helpers/objectWithoutPropertiesLoose';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: _babelHelper,
  objectWithoutPropertiesLoose: _babelHelper2,
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
// ExportNamedDeclaration
export var _obj = _objectDestructuringEmpty(asdf2),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
// Skip
export var { bb, cc } = ads;
export var [dd, ee, ...ff] = ads;`,
      },
    ],
  },
  {
    title: 'object rest — for x array pattern rest only (exec)',
    source: `let a, result;
for (const [{...a}] of [[{ a: 0}]]) { result = a; }

expect(result).toEqual({ a: 0 });
`,
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
var _extends = require('@babel/runtime/helpers/extends');
let a, result;
for (const _ref of [[{ a: 0 }]]) {
  const _arr = _toArray(_ref, 1, false),
    _obj = _objectDestructuringEmpty(_arr[0]),
    a = _extends({}, _obj);
  {
    result = a;
  }
}
expect(result).toEqual({ a: 0 });`,
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
var _extends = require('@babel/runtime/helpers/extends');
let a, result;
for (const _ref of [[{ a: 0 }]]) {
  const _arr = _toArray(_ref, 1, false),
    _obj = _objectDestructuringEmpty(_arr[0]),
    a = _extends({}, _obj);
  {
    result = a;
  }
}
expect(result).toEqual({ a: 0 });`,
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
var _extends = require('@babel/runtime/helpers/extends');
let a, result;
for (const _ref of [[{ a: 0 }]]) {
  const _arr = _toArray(_ref, 1, false),
    _obj = _objectDestructuringEmpty(_arr[0]),
    a = _extends({}, _obj);
  {
    result = a;
  }
}
expect(result).toEqual({ a: 0 });`,
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
var _extends = require('@babel/runtime/helpers/extends');
let a, result;
for (const _ref of [[{ a: 0 }]]) {
  const _arr = _toArray(_ref, 1, false),
    _obj = _objectDestructuringEmpty(_arr[0]),
    a = _extends({}, _obj);
  {
    result = a;
  }
}
expect(result).toEqual({ a: 0 });`,
      },
    ],
  },
  {
    title: 'object rest — for x array pattern rest only (input)',
    source: `// ForXStatement
{
  let a;
  for (const [{...a}] of []) {}
  for ([{...a}] of []) {}
  async function f() {
    for await ([{...a}] of []) {}
  }
}

// skip
{
  for ([...a] in {}) {}
  for ([...a] of []) {}
  async function a() {
    for await ([...a] of []) {}
  }
}
`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _ref11, _arr12, _obj13;
// ForXStatement
{
  let a;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _extends({}, _obj);
    {
    }
  }
  for (_ref11 of []) {
    ((_arr12 = _toArray(_ref11, 1, false)),
      (_obj13 = _objectDestructuringEmpty(_arr12[0])),
      (a = _extends({}, _obj13)));
    {
    }
  }
  async function f() {
    var _ref14, _arr15, _obj16;
    for await (_ref14 of []) {
      ((_arr15 = _toArray(_ref14, 1, false)),
        (_obj16 = _objectDestructuringEmpty(_arr15[0])),
        (a = _extends({}, _obj16)));
      {
      }
    }
  }
}
// skip
{
  for ([...a] in {}) {
  }
  for ([...a] of []) {
  }
  async function a() {
    for await ([...a] of []) {
    }
  }
}`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _ref11, _arr12, _obj13;
// ForXStatement
{
  let a;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _extends({}, _obj);
    {
    }
  }
  for (_ref11 of []) {
    ((_arr12 = _toArray(_ref11, 1, false)),
      (_obj13 = _objectDestructuringEmpty(_arr12[0])),
      (a = _extends({}, _obj13)));
    {
    }
  }
  async function f() {
    var _ref14, _arr15, _obj16;
    for await (_ref14 of []) {
      ((_arr15 = _toArray(_ref14, 1, false)),
        (_obj16 = _objectDestructuringEmpty(_arr15[0])),
        (a = _extends({}, _obj16)));
      {
      }
    }
  }
}
// skip
{
  for ([...a] in {}) {
  }
  for ([...a] of []) {
  }
  async function a() {
    for await ([...a] of []) {
    }
  }
}`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _ref11, _arr12, _obj13;
// ForXStatement
{
  let a;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _extends({}, _obj);
    {
    }
  }
  for (_ref11 of []) {
    ((_arr12 = _toArray(_ref11, 1, false)),
      (_obj13 = _objectDestructuringEmpty(_arr12[0])),
      (a = _extends({}, _obj13)));
    {
    }
  }
  async function f() {
    var _ref14, _arr15, _obj16;
    for await (_ref14 of []) {
      ((_arr15 = _toArray(_ref14, 1, false)),
        (_obj16 = _objectDestructuringEmpty(_arr15[0])),
        (a = _extends({}, _obj16)));
      {
      }
    }
  }
}
// skip
{
  for ([...a] in {}) {
  }
  for ([...a] of []) {
  }
  async function a() {
    for await ([...a] of []) {
    }
  }
}`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _ref11, _arr12, _obj13;
// ForXStatement
{
  let a;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _extends({}, _obj);
    {
    }
  }
  for (_ref11 of []) {
    ((_arr12 = _toArray(_ref11, 1, false)),
      (_obj13 = _objectDestructuringEmpty(_arr12[0])),
      (a = _extends({}, _obj13)));
    {
    }
  }
  async function f() {
    var _ref14, _arr15, _obj16;
    for await (_ref14 of []) {
      ((_arr15 = _toArray(_ref14, 1, false)),
        (_obj16 = _objectDestructuringEmpty(_arr15[0])),
        (a = _extends({}, _obj16)));
      {
      }
    }
  }
}
// skip
{
  for ([...a] in {}) {
  }
  for ([...a] of []) {
  }
  async function a() {
    for await ([...a] of []) {
    }
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — for x array pattern (input)',
    source: `// ForXStatement
{
  let a, b;
  for (const [{a, ...b}] of []) {}
  for ([{a, ...b}] of []) {}
  async function f() {
    for await ([{a, ...b}] of []) {}
  }

  for (const { a: [{a, ...b}] } of []) {}
}

// skip
{
  for ([{a}] in {}) {}
  for ([{a}] of []) {}
  async function a() {
    for await ([{a}] of []) {}
  }
}
{
  for ([a, ...b] in {}) {}
  for ([a, ...b] of []) {}
  async function a() {
    for await ([a, ...b] of []) {}
  }
}
`,
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
var _ref12, _arr13, _obj14;
// ForXStatement
{
  let a, b;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _obj.a,
      b = _objectWithoutProperties(_obj, ['a']);
    {
    }
  }
  for (_ref12 of []) {
    ((_arr13 = _toArray(_ref12, 1, false)),
      (_obj14 = _objectDestructuringEmpty(_arr13[0])),
      (a = _obj14.a),
      (b = _objectWithoutProperties(_obj14, ['a'])));
    {
    }
  }
  async function f() {
    var _ref15, _arr16, _obj17;
    for await (_ref15 of []) {
      ((_arr16 = _toArray(_ref15, 1, false)),
        (_obj17 = _objectDestructuringEmpty(_arr16[0])),
        (a = _obj17.a),
        (b = _objectWithoutProperties(_obj17, ['a'])));
      {
      }
    }
  }
  for (const _ref18 of []) {
    const _obj19 = _objectDestructuringEmpty(_ref18),
      _arr20 = _toArray(_obj19.a, 1, false),
      _obj21 = _objectDestructuringEmpty(_arr20[0]),
      a = _obj21.a,
      b = _objectWithoutProperties(_obj21, ['a']);
    {
    }
  }
}
// skip
{
  for ([{ a }] in {}) {
  }
  for ([{ a }] of []) {
  }
  async function a() {
    for await ([{ a }] of []) {
    }
  }
}
{
  for ([a, ...b] in {}) {
  }
  for ([a, ...b] of []) {
  }
  async function a() {
    for await ([a, ...b] of []) {
    }
  }
}`,
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
var _ref12, _arr13, _obj14;
// ForXStatement
{
  let a, b;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _obj.a,
      b = _objectWithoutProperties(_obj, ['a']);
    {
    }
  }
  for (_ref12 of []) {
    ((_arr13 = _toArray(_ref12, 1, false)),
      (_obj14 = _objectDestructuringEmpty(_arr13[0])),
      (a = _obj14.a),
      (b = _objectWithoutProperties(_obj14, ['a'])));
    {
    }
  }
  async function f() {
    var _ref15, _arr16, _obj17;
    for await (_ref15 of []) {
      ((_arr16 = _toArray(_ref15, 1, false)),
        (_obj17 = _objectDestructuringEmpty(_arr16[0])),
        (a = _obj17.a),
        (b = _objectWithoutProperties(_obj17, ['a'])));
      {
      }
    }
  }
  for (const _ref18 of []) {
    const _obj19 = _objectDestructuringEmpty(_ref18),
      _arr20 = _toArray(_obj19.a, 1, false),
      _obj21 = _objectDestructuringEmpty(_arr20[0]),
      a = _obj21.a,
      b = _objectWithoutProperties(_obj21, ['a']);
    {
    }
  }
}
// skip
{
  for ([{ a }] in {}) {
  }
  for ([{ a }] of []) {
  }
  async function a() {
    for await ([{ a }] of []) {
    }
  }
}
{
  for ([a, ...b] in {}) {
  }
  for ([a, ...b] of []) {
  }
  async function a() {
    for await ([a, ...b] of []) {
    }
  }
}`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref12, _arr13, _obj14;
// ForXStatement
{
  let a, b;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _obj.a,
      b = _objectWithoutProperties(_obj, ['a']);
    {
    }
  }
  for (_ref12 of []) {
    ((_arr13 = _toArray(_ref12, 1, false)),
      (_obj14 = _objectDestructuringEmpty(_arr13[0])),
      (a = _obj14.a),
      (b = _objectWithoutProperties(_obj14, ['a'])));
    {
    }
  }
  async function f() {
    var _ref15, _arr16, _obj17;
    for await (_ref15 of []) {
      ((_arr16 = _toArray(_ref15, 1, false)),
        (_obj17 = _objectDestructuringEmpty(_arr16[0])),
        (a = _obj17.a),
        (b = _objectWithoutProperties(_obj17, ['a'])));
      {
      }
    }
  }
  for (const _ref18 of []) {
    const _obj19 = _objectDestructuringEmpty(_ref18),
      _arr20 = _toArray(_obj19.a, 1, false),
      _obj21 = _objectDestructuringEmpty(_arr20[0]),
      a = _obj21.a,
      b = _objectWithoutProperties(_obj21, ['a']);
    {
    }
  }
}
// skip
{
  for ([{ a }] in {}) {
  }
  for ([{ a }] of []) {
  }
  async function a() {
    for await ([{ a }] of []) {
    }
  }
}
{
  for ([a, ...b] in {}) {
  }
  for ([a, ...b] of []) {
  }
  async function a() {
    for await ([a, ...b] of []) {
    }
  }
}`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref12, _arr13, _obj14;
// ForXStatement
{
  let a, b;
  for (const _ref of []) {
    const _arr = _toArray(_ref, 1, false),
      _obj = _objectDestructuringEmpty(_arr[0]),
      a = _obj.a,
      b = _objectWithoutProperties(_obj, ['a']);
    {
    }
  }
  for (_ref12 of []) {
    ((_arr13 = _toArray(_ref12, 1, false)),
      (_obj14 = _objectDestructuringEmpty(_arr13[0])),
      (a = _obj14.a),
      (b = _objectWithoutProperties(_obj14, ['a'])));
    {
    }
  }
  async function f() {
    var _ref15, _arr16, _obj17;
    for await (_ref15 of []) {
      ((_arr16 = _toArray(_ref15, 1, false)),
        (_obj17 = _objectDestructuringEmpty(_arr16[0])),
        (a = _obj17.a),
        (b = _objectWithoutProperties(_obj17, ['a'])));
      {
      }
    }
  }
  for (const _ref18 of []) {
    const _obj19 = _objectDestructuringEmpty(_ref18),
      _arr20 = _toArray(_obj19.a, 1, false),
      _obj21 = _objectDestructuringEmpty(_arr20[0]),
      a = _obj21.a,
      b = _objectWithoutProperties(_obj21, ['a']);
    {
    }
  }
}
// skip
{
  for ([{ a }] in {}) {
  }
  for ([{ a }] of []) {
  }
  async function a() {
    for await ([{ a }] of []) {
    }
  }
}
{
  for ([a, ...b] in {}) {
  }
  for ([a, ...b] of []) {
  }
  async function a() {
    for await ([a, ...b] of []) {
    }
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — for x assignment shadowed block scoped bindings (exec)',
    source: `let a = 0, result, y;

for ({ [a++]: result, ...y} of [["0", "1"]]) {
  const a = 1;
}

expect(result).toBe("0");
`,
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
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}
expect(result).toBe('0');`,
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
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}
expect(result).toBe('0');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}
expect(result).toBe('0');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}
expect(result).toBe('0');`,
      },
    ],
  },
  {
    title: 'object rest — for x assignment shadowed block scoped bindings (input)',
    source: `let a = 0, result, y;

for ({ [a++]: result, ...y} of [["0", "1"]]) {
  const a = 1;
}
`,
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
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}`,
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
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref, _obj, _key;
let a = 0,
  result,
  y;
for (_ref of [['0', '1']]) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(a++)),
    (result = _obj[_key]),
    (y = _objectWithoutProperties(_obj, [_key])));
  {
    const a = 1;
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — for x completion record (input)',
    source: `for ({a, ...b} of []) {}
`,
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
for (_ref of []) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (a = _obj.a),
    (b = _objectWithoutProperties(_obj, ['a'])));
  {
  }
}`,
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
for (_ref of []) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (a = _obj.a),
    (b = _objectWithoutProperties(_obj, ['a'])));
  {
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
for (_ref of []) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (a = _obj.a),
    (b = _objectWithoutProperties(_obj, ['a'])));
  {
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
for (_ref of []) {
  ((_obj = _objectDestructuringEmpty(_ref)),
    (a = _obj.a),
    (b = _objectWithoutProperties(_obj, ['a'])));
  {
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — for x declaration shadowed block scoped bindings (exec)',
    source: `let a = 0, result;

for (const { [a++]: x, ...y} of [["0", "1"]]) {
  const a = 1;
  result = x;
}

expect(result).toBe("0");
`,
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
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}
expect(result).toBe('0');`,
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
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}
expect(result).toBe('0');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}
expect(result).toBe('0');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}
expect(result).toBe('0');`,
      },
    ],
  },
  {
    title: 'object rest — for x declaration shadowed block scoped bindings (input)',
    source: `let a = 0, result;

for (const { [a++]: x, ...y} of [["0", "1"]]) {
  const a = 1;
  result = x;
}
`,
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
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}`,
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
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
let a = 0,
  result;
for (const _ref of [['0', '1']]) {
  const _obj = _objectDestructuringEmpty(_ref),
    _key = _toPropertyKey(a++),
    x = _obj[_key],
    y = _objectWithoutProperties(_obj, [_key]);
  {
    const a = 1;
    result = x;
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — for x (input)',
    source: `// ForXStatement
for (var {a, ...b} of []) {}
for ({a, ...b} of []) {}
async function a() {
  for await ({a, ...b} of []) {}
}

// skip
for ({a} in {}) {}
for ({a} of []) {}
async function a() {
  for await ({a} of []) {}
}

for (a in {}) {}
for (a of []) {}
async function a() {
  for await (a of []) {}
}
`,
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
var _ref10, _obj11;
// ForXStatement
for (var _ref of []) {
  var _obj = _objectDestructuringEmpty(_ref),
    a = _obj.a,
    b = _objectWithoutProperties(_obj, ['a']);
  {
  }
}
for (_ref10 of []) {
  ((_obj11 = _objectDestructuringEmpty(_ref10)),
    (a = _obj11.a),
    (b = _objectWithoutProperties(_obj11, ['a'])));
  {
  }
}
async function a() {
  var _ref12, _obj13;
  for await (_ref12 of []) {
    ((_obj13 = _objectDestructuringEmpty(_ref12)),
      (a = _obj13.a),
      (b = _objectWithoutProperties(_obj13, ['a'])));
    {
    }
  }
}
// skip
for ({ a } in {}) {
}
for ({ a } of []) {
}
async function a() {
  for await ({ a } of []) {
  }
}
for (a in {}) {
}
for (a of []) {
}
async function a() {
  for await (a of []) {
  }
}`,
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
var _ref10, _obj11;
// ForXStatement
for (var _ref of []) {
  var _obj = _objectDestructuringEmpty(_ref),
    a = _obj.a,
    b = _objectWithoutProperties(_obj, ['a']);
  {
  }
}
for (_ref10 of []) {
  ((_obj11 = _objectDestructuringEmpty(_ref10)),
    (a = _obj11.a),
    (b = _objectWithoutProperties(_obj11, ['a'])));
  {
  }
}
async function a() {
  var _ref12, _obj13;
  for await (_ref12 of []) {
    ((_obj13 = _objectDestructuringEmpty(_ref12)),
      (a = _obj13.a),
      (b = _objectWithoutProperties(_obj13, ['a'])));
    {
    }
  }
}
// skip
for ({ a } in {}) {
}
for ({ a } of []) {
}
async function a() {
  for await ({ a } of []) {
  }
}
for (a in {}) {
}
for (a of []) {
}
async function a() {
  for await (a of []) {
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref10, _obj11;
// ForXStatement
for (var _ref of []) {
  var _obj = _objectDestructuringEmpty(_ref),
    a = _obj.a,
    b = _objectWithoutProperties(_obj, ['a']);
  {
  }
}
for (_ref10 of []) {
  ((_obj11 = _objectDestructuringEmpty(_ref10)),
    (a = _obj11.a),
    (b = _objectWithoutProperties(_obj11, ['a'])));
  {
  }
}
async function a() {
  var _ref12, _obj13;
  for await (_ref12 of []) {
    ((_obj13 = _objectDestructuringEmpty(_ref12)),
      (a = _obj13.a),
      (b = _objectWithoutProperties(_obj13, ['a'])));
    {
    }
  }
}
// skip
for ({ a } in {}) {
}
for ({ a } of []) {
}
async function a() {
  for await ({ a } of []) {
  }
}
for (a in {}) {
}
for (a of []) {
}
async function a() {
  for await (a of []) {
  }
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref10, _obj11;
// ForXStatement
for (var _ref of []) {
  var _obj = _objectDestructuringEmpty(_ref),
    a = _obj.a,
    b = _objectWithoutProperties(_obj, ['a']);
  {
  }
}
for (_ref10 of []) {
  ((_obj11 = _objectDestructuringEmpty(_ref10)),
    (a = _obj11.a),
    (b = _objectWithoutProperties(_obj11, ['a'])));
  {
  }
}
async function a() {
  var _ref12, _obj13;
  for await (_ref12 of []) {
    ((_obj13 = _objectDestructuringEmpty(_ref12)),
      (a = _obj13.a),
      (b = _objectWithoutProperties(_obj13, ['a'])));
    {
    }
  }
}
// skip
for ({ a } in {}) {
}
for ({ a } of []) {
}
async function a() {
  for await ({ a } of []) {
  }
}
for (a in {}) {
}
for (a of []) {
}
async function a() {
  for await (a of []) {
  }
}`,
      },
    ],
  },
  {
    title: 'object rest — impure computed exec (exec)',
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
      },
    ],
  },
  {
    title: 'object rest — impure computed (input)',
    source: `var key, x, y, z;
// impure
key = 1;
var { [key++]: y, ...x } = { 1: 1, a: 1 };
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);

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
`,
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
var _ref19, _obj20, _key21;
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
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj16 = _objectDestructuringEmpty({
    2: 2,
    3: 3,
  }),
  _key17 = _toPropertyKey(++key),
  y = _obj16[_key17],
  _key18 = _toPropertyKey(++key),
  z = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]);
expect(y).toBe(2);
expect(z).toBe(3);
// pure, computed property should remain as-is
key = 2;
((_ref19 = {
  2: 'two',
  z: 'zee',
}),
  (_obj20 = _objectDestructuringEmpty(_ref19)),
  (_key21 = _toPropertyKey(key)),
  (y = _obj20[_key21]),
  (z = _obj20.z),
  (x = _objectWithoutProperties(_obj20, [_key21, 'z'])),
  _ref19);
expect(y).toBe('two');
expect(x).toEqual({});
expect(z).toBe('zee');`,
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
var _ref19, _obj20, _key21;
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
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj16 = _objectDestructuringEmpty({
    2: 2,
    3: 3,
  }),
  _key17 = _toPropertyKey(++key),
  y = _obj16[_key17],
  _key18 = _toPropertyKey(++key),
  z = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]);
expect(y).toBe(2);
expect(z).toBe(3);
// pure, computed property should remain as-is
key = 2;
((_ref19 = {
  2: 'two',
  z: 'zee',
}),
  (_obj20 = _objectDestructuringEmpty(_ref19)),
  (_key21 = _toPropertyKey(key)),
  (y = _obj20[_key21]),
  (z = _obj20.z),
  (x = _objectWithoutProperties(_obj20, [_key21, 'z'])),
  _ref19);
expect(y).toBe('two');
expect(x).toEqual({});
expect(z).toBe('zee');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref19, _obj20, _key21;
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
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj16 = _objectDestructuringEmpty({
    2: 2,
    3: 3,
  }),
  _key17 = _toPropertyKey(++key),
  y = _obj16[_key17],
  _key18 = _toPropertyKey(++key),
  z = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]);
expect(y).toBe(2);
expect(z).toBe(3);
// pure, computed property should remain as-is
key = 2;
((_ref19 = {
  2: 'two',
  z: 'zee',
}),
  (_obj20 = _objectDestructuringEmpty(_ref19)),
  (_key21 = _toPropertyKey(key)),
  (y = _obj20[_key21]),
  (z = _obj20.z),
  (x = _objectWithoutProperties(_obj20, [_key21, 'z'])),
  _ref19);
expect(y).toBe('two');
expect(x).toEqual({});
expect(z).toBe('zee');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref19, _obj20, _key21;
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
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj16 = _objectDestructuringEmpty({
    2: 2,
    3: 3,
  }),
  _key17 = _toPropertyKey(++key),
  y = _obj16[_key17],
  _key18 = _toPropertyKey(++key),
  z = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]);
expect(y).toBe(2);
expect(z).toBe(3);
// pure, computed property should remain as-is
key = 2;
((_ref19 = {
  2: 'two',
  z: 'zee',
}),
  (_obj20 = _objectDestructuringEmpty(_ref19)),
  (_key21 = _toPropertyKey(key)),
  (y = _obj20[_key21]),
  (z = _obj20.z),
  (x = _objectWithoutProperties(_obj20, [_key21, 'z'])),
  _ref19);
expect(y).toBe('two');
expect(x).toEqual({});
expect(z).toBe('zee');`,
      },
    ],
  },
  {
    title: 'object rest — nested 2 (input)',
    source: `const test = {
  foo: {
    bar: {
      baz: {
        a: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    },
  },
};

const { foo: { bar: { baz: { a: { x, ...other } } } } } = test;
`,
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
const test = {
  foo: {
    bar: {
      baz: {
        a: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    },
  },
};
const _obj = _objectDestructuringEmpty(test),
  _obj11 = _objectDestructuringEmpty(_obj.foo),
  _obj12 = _objectDestructuringEmpty(_obj11.bar),
  _obj13 = _objectDestructuringEmpty(_obj12.baz),
  _obj14 = _objectDestructuringEmpty(_obj13.a),
  x = _obj14.x,
  other = _objectWithoutProperties(_obj14, ['x']);`,
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
const test = {
  foo: {
    bar: {
      baz: {
        a: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    },
  },
};
const _obj = _objectDestructuringEmpty(test),
  _obj11 = _objectDestructuringEmpty(_obj.foo),
  _obj12 = _objectDestructuringEmpty(_obj11.bar),
  _obj13 = _objectDestructuringEmpty(_obj12.baz),
  _obj14 = _objectDestructuringEmpty(_obj13.a),
  x = _obj14.x,
  other = _objectWithoutProperties(_obj14, ['x']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const test = {
  foo: {
    bar: {
      baz: {
        a: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    },
  },
};
const _obj = _objectDestructuringEmpty(test),
  _obj11 = _objectDestructuringEmpty(_obj.foo),
  _obj12 = _objectDestructuringEmpty(_obj11.bar),
  _obj13 = _objectDestructuringEmpty(_obj12.baz),
  _obj14 = _objectDestructuringEmpty(_obj13.a),
  x = _obj14.x,
  other = _objectWithoutProperties(_obj14, ['x']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const test = {
  foo: {
    bar: {
      baz: {
        a: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    },
  },
};
const _obj = _objectDestructuringEmpty(test),
  _obj11 = _objectDestructuringEmpty(_obj.foo),
  _obj12 = _objectDestructuringEmpty(_obj11.bar),
  _obj13 = _objectDestructuringEmpty(_obj12.baz),
  _obj14 = _objectDestructuringEmpty(_obj13.a),
  x = _obj14.x,
  other = _objectWithoutProperties(_obj14, ['x']);`,
      },
    ],
  },
  {
    title: 'object rest — nested array 2 (input)',
    source: `const [a, [{b, ...c}], {d, ...e}, [{ f, ...g}, {h: [i, {j, ...k}] }]] = x;
`,
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
const _arr = _toArray(x, 4, false),
  a = _arr[0],
  _arr19 = _toArray(_arr[1], 1, false),
  _obj = _objectDestructuringEmpty(_arr19[0]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']),
  _obj21 = _objectDestructuringEmpty(_arr[2]),
  d = _obj21.d,
  e = _objectWithoutProperties(_obj21, ['d']),
  _arr22 = _toArray(_arr[3], 2, false),
  _obj23 = _objectDestructuringEmpty(_arr22[0]),
  f = _obj23.f,
  g = _objectWithoutProperties(_obj23, ['f']),
  _obj24 = _objectDestructuringEmpty(_arr22[1]),
  _arr25 = _toArray(_obj24.h, 2, false),
  i = _arr25[0],
  _obj26 = _objectDestructuringEmpty(_arr25[1]),
  j = _obj26.j,
  k = _objectWithoutProperties(_obj26, ['j']);`,
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
const _arr = _toArray(x, 4, false),
  a = _arr[0],
  _arr19 = _toArray(_arr[1], 1, false),
  _obj = _objectDestructuringEmpty(_arr19[0]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']),
  _obj21 = _objectDestructuringEmpty(_arr[2]),
  d = _obj21.d,
  e = _objectWithoutProperties(_obj21, ['d']),
  _arr22 = _toArray(_arr[3], 2, false),
  _obj23 = _objectDestructuringEmpty(_arr22[0]),
  f = _obj23.f,
  g = _objectWithoutProperties(_obj23, ['f']),
  _obj24 = _objectDestructuringEmpty(_arr22[1]),
  _arr25 = _toArray(_obj24.h, 2, false),
  i = _arr25[0],
  _obj26 = _objectDestructuringEmpty(_arr25[1]),
  j = _obj26.j,
  k = _objectWithoutProperties(_obj26, ['j']);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _arr = _toArray(x, 4, false),
  a = _arr[0],
  _arr19 = _toArray(_arr[1], 1, false),
  _obj = _objectDestructuringEmpty(_arr19[0]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']),
  _obj21 = _objectDestructuringEmpty(_arr[2]),
  d = _obj21.d,
  e = _objectWithoutProperties(_obj21, ['d']),
  _arr22 = _toArray(_arr[3], 2, false),
  _obj23 = _objectDestructuringEmpty(_arr22[0]),
  f = _obj23.f,
  g = _objectWithoutProperties(_obj23, ['f']),
  _obj24 = _objectDestructuringEmpty(_arr22[1]),
  _arr25 = _toArray(_obj24.h, 2, false),
  i = _arr25[0],
  _obj26 = _objectDestructuringEmpty(_arr25[1]),
  j = _obj26.j,
  k = _objectWithoutProperties(_obj26, ['j']);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _arr = _toArray(x, 4, false),
  a = _arr[0],
  _arr19 = _toArray(_arr[1], 1, false),
  _obj = _objectDestructuringEmpty(_arr19[0]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']),
  _obj21 = _objectDestructuringEmpty(_arr[2]),
  d = _obj21.d,
  e = _objectWithoutProperties(_obj21, ['d']),
  _arr22 = _toArray(_arr[3], 2, false),
  _obj23 = _objectDestructuringEmpty(_arr22[0]),
  f = _obj23.f,
  g = _objectWithoutProperties(_obj23, ['f']),
  _obj24 = _objectDestructuringEmpty(_arr22[1]),
  _arr25 = _toArray(_obj24.h, 2, false),
  i = _arr25[0],
  _obj26 = _objectDestructuringEmpty(_arr25[1]),
  j = _obj26.j,
  k = _objectWithoutProperties(_obj26, ['j']);`,
      },
    ],
  },
  {
    title: 'object rest — nested array (exec)',
    source: `const [a, {b, ...c}] = [1, { b: 2, other: 3 }];
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toStrictEqual({ other: 3 });

let [d, {e, ...f}] = [4, { e: 5, other: 6 }];
expect(d).toBe(4);
expect(e).toBe(5);
expect(f).toStrictEqual({ other: 6 });

let g, h, i;

[g, {h, ...i}] = [7, { h: 8, other: 9 }];
expect(g).toBe(7);
expect(h).toBe(8);
expect(i).toStrictEqual({ other: 9 });
`,
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
var _ref22, _arr23, _obj24;
const _arr = _toArray(
    [
      1,
      {
        b: 2,
        other: 3,
      },
    ],
    2,
    false,
  ),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toStrictEqual({ other: 3 });
let _arr20 = _toArray(
    [
      4,
      {
        e: 5,
        other: 6,
      },
    ],
    2,
    false,
  ),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
expect(d).toBe(4);
expect(e).toBe(5);
expect(f).toStrictEqual({ other: 6 });
let g, h, i;
((_ref22 = [
  7,
  {
    h: 8,
    other: 9,
  },
]),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);
expect(g).toBe(7);
expect(h).toBe(8);
expect(i).toStrictEqual({ other: 9 });`,
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
var _ref22, _arr23, _obj24;
const _arr = _toArray(
    [
      1,
      {
        b: 2,
        other: 3,
      },
    ],
    2,
    false,
  ),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toStrictEqual({ other: 3 });
let _arr20 = _toArray(
    [
      4,
      {
        e: 5,
        other: 6,
      },
    ],
    2,
    false,
  ),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
expect(d).toBe(4);
expect(e).toBe(5);
expect(f).toStrictEqual({ other: 6 });
let g, h, i;
((_ref22 = [
  7,
  {
    h: 8,
    other: 9,
  },
]),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);
expect(g).toBe(7);
expect(h).toBe(8);
expect(i).toStrictEqual({ other: 9 });`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref22, _arr23, _obj24;
const _arr = _toArray(
    [
      1,
      {
        b: 2,
        other: 3,
      },
    ],
    2,
    false,
  ),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toStrictEqual({ other: 3 });
let _arr20 = _toArray(
    [
      4,
      {
        e: 5,
        other: 6,
      },
    ],
    2,
    false,
  ),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
expect(d).toBe(4);
expect(e).toBe(5);
expect(f).toStrictEqual({ other: 6 });
let g, h, i;
((_ref22 = [
  7,
  {
    h: 8,
    other: 9,
  },
]),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);
expect(g).toBe(7);
expect(h).toBe(8);
expect(i).toStrictEqual({ other: 9 });`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref22, _arr23, _obj24;
const _arr = _toArray(
    [
      1,
      {
        b: 2,
        other: 3,
      },
    ],
    2,
    false,
  ),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toStrictEqual({ other: 3 });
let _arr20 = _toArray(
    [
      4,
      {
        e: 5,
        other: 6,
      },
    ],
    2,
    false,
  ),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
expect(d).toBe(4);
expect(e).toBe(5);
expect(f).toStrictEqual({ other: 6 });
let g, h, i;
((_ref22 = [
  7,
  {
    h: 8,
    other: 9,
  },
]),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);
expect(g).toBe(7);
expect(h).toBe(8);
expect(i).toStrictEqual({ other: 9 });`,
      },
    ],
  },
  {
    title: 'object rest — nested array (input)',
    source: `const [a, {b, ...c}] = x;

let [d, {e, ...f}] = x;

[g, {h, ...i}] = x;

`,
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
var _ref22, _arr23, _obj24;
const _arr = _toArray(x, 2, false),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
let _arr20 = _toArray(x, 2, false),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
((_ref22 = x),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);`,
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
var _ref22, _arr23, _obj24;
const _arr = _toArray(x, 2, false),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
let _arr20 = _toArray(x, 2, false),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
((_ref22 = x),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref22, _arr23, _obj24;
const _arr = _toArray(x, 2, false),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
let _arr20 = _toArray(x, 2, false),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
((_ref22 = x),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref22, _arr23, _obj24;
const _arr = _toArray(x, 2, false),
  a = _arr[0],
  _obj = _objectDestructuringEmpty(_arr[1]),
  b = _obj.b,
  c = _objectWithoutProperties(_obj, ['b']);
let _arr20 = _toArray(x, 2, false),
  d = _arr20[0],
  _obj21 = _objectDestructuringEmpty(_arr20[1]),
  e = _obj21.e,
  f = _objectWithoutProperties(_obj21, ['e']);
((_ref22 = x),
  (_arr23 = _toArray(_ref22, 2, false)),
  (g = _arr23[0]),
  (_obj24 = _objectDestructuringEmpty(_arr23[1])),
  (h = _obj24.h),
  (i = _objectWithoutProperties(_obj24, ['h'])),
  _ref22);`,
      },
    ],
  },
  {
    title: 'object rest — nested computed key (input)',
    source: `const {
  [({ ...rest }) => {
    let { ...b } = {};
  }]: a,
  [({ ...d } = {})]: c,
} = {};`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _ref3;
const {
  [function () {
    let _ref = arguments.length > 0 ? arguments[0] : void 0,
      rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
    let _ref2 = {},
      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  }]: a,
  [((_ref3 = {}),
  ({} = _ref3),
  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),
  _ref3)]: c,
} = {};`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _ref3;
const {
  [function () {
    let _ref = arguments.length > 0 ? arguments[0] : void 0,
      rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
    let _ref2 = {},
      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  }]: a,
  [((_ref3 = {}),
  ({} = _ref3),
  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),
  _ref3)]: c,
} = {};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _ref16, _obj17;
const {
  [function () {
    let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
      rest = _extends({}, _obj);
    let _obj15 = _objectDestructuringEmpty({}),
      b = _extends({}, _obj15);
  }]: a,
  [((_ref16 = {}),
  (_obj17 = _objectDestructuringEmpty(_ref16)),
  (d = _extends({}, _obj17)),
  _ref16)]: c,
} = {};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _ref16, _obj17;
const {
  [function () {
    let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
      rest = _extends({}, _obj);
    let _obj15 = _objectDestructuringEmpty({}),
      b = _extends({}, _obj15);
  }]: a,
  [((_ref16 = {}),
  (_obj17 = _objectDestructuringEmpty(_ref16)),
  (d = _extends({}, _obj17)),
  _ref16)]: c,
} = {};`,
      },
    ],
  },
  {
    title: 'object rest — nested default value (input)',
    source: `const {
  a = ({ ...rest }) => {
    let { ...b } = {};
  },
  c = ({ ...d } = {}),
} = {};`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _ref3;
const {
  a = function () {
    let _ref = arguments.length > 0 ? arguments[0] : void 0,
      rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
    let _ref2 = {},
      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  },
  c = ((_ref3 = {}),
  ({} = _ref3),
  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),
  _ref3),
} = {};`,
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
        output: `var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _ref3;
const {
  a = function () {
    let _ref = arguments.length > 0 ? arguments[0] : void 0,
      rest = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
    let _ref2 = {},
      b = _extends({}, (_objectDestructuringEmpty(_ref2), _ref2));
  },
  c = ((_ref3 = {}),
  ({} = _ref3),
  (d = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3))),
  _ref3),
} = {};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _ref16, _obj17;
const {
  a = function () {
    let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
      rest = _extends({}, _obj);
    let _obj15 = _objectDestructuringEmpty({}),
      b = _extends({}, _obj15);
  },
  c = ((_ref16 = {}),
  (_obj17 = _objectDestructuringEmpty(_ref16)),
  (d = _extends({}, _obj17)),
  _ref16),
} = {};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _ref16, _obj17;
const {
  a = function () {
    let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
      rest = _extends({}, _obj);
    let _obj15 = _objectDestructuringEmpty({}),
      b = _extends({}, _obj15);
  },
  c = ((_ref16 = {}),
  (_obj17 = _objectDestructuringEmpty(_ref16)),
  (d = _extends({}, _obj17)),
  _ref16),
} = {};`,
      },
    ],
  },
  {
    title: 'object rest — nested literal property (input)',
    source: `let useState = [{ some: 42 }, () => null];

let {
  0: { numeric,...rest1 },
  '2': { str,...rest2 },
  1: setState,
} = useState;
`,
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
let useState = [{ some: 42 }, () => null];
let _obj = _objectDestructuringEmpty(useState),
  _obj14 = _objectDestructuringEmpty(_obj[0]),
  numeric = _obj14.numeric,
  rest1 = _objectWithoutProperties(_obj14, ['numeric']),
  _obj15 = _objectDestructuringEmpty(_obj['2']),
  str = _obj15.str,
  rest2 = _objectWithoutProperties(_obj15, ['str']),
  setState = _obj[1];`,
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
let useState = [{ some: 42 }, () => null];
let _obj = _objectDestructuringEmpty(useState),
  _obj14 = _objectDestructuringEmpty(_obj[0]),
  numeric = _obj14.numeric,
  rest1 = _objectWithoutProperties(_obj14, ['numeric']),
  _obj15 = _objectDestructuringEmpty(_obj['2']),
  str = _obj15.str,
  rest2 = _objectWithoutProperties(_obj15, ['str']),
  setState = _obj[1];`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let useState = [{ some: 42 }, () => null];
let _obj = _objectDestructuringEmpty(useState),
  _obj14 = _objectDestructuringEmpty(_obj[0]),
  numeric = _obj14.numeric,
  rest1 = _objectWithoutProperties(_obj14, ['numeric']),
  _obj15 = _objectDestructuringEmpty(_obj['2']),
  str = _obj15.str,
  rest2 = _objectWithoutProperties(_obj15, ['str']),
  setState = _obj[1];`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let useState = [{ some: 42 }, () => null];
let _obj = _objectDestructuringEmpty(useState),
  _obj14 = _objectDestructuringEmpty(_obj[0]),
  numeric = _obj14.numeric,
  rest1 = _objectWithoutProperties(_obj14, ['numeric']),
  _obj15 = _objectDestructuringEmpty(_obj['2']),
  str = _obj15.str,
  rest2 = _objectWithoutProperties(_obj15, ['str']),
  setState = _obj[1];`,
      },
    ],
  },
  {
    title: 'object rest — nested order (exec)',
    source: `var result = "";

var obj = {
  get foo() {
    result += "foo"
  },
  a: {
    get bar() {
      result += "bar";
    }
  },
  b: {
    get baz() {
      result += "baz";
    }
  }
};

var { a: { ...bar }, b: { ...baz }, ...foo } = obj;

expect(result).toBe("barbazfoo");
`,
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
var result = '';
var obj = {
  get foo() {
    result += 'foo';
  },
  a: {
    get bar() {
      result += 'bar';
    },
  },
  b: {
    get baz() {
      result += 'baz';
    },
  },
};
var _obj = _objectDestructuringEmpty(obj),
  _obj14 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj14),
  _obj15 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj15),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);
expect(result).toBe('barbazfoo');`,
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
var result = '';
var obj = {
  get foo() {
    result += 'foo';
  },
  a: {
    get bar() {
      result += 'bar';
    },
  },
  b: {
    get baz() {
      result += 'baz';
    },
  },
};
var _obj = _objectDestructuringEmpty(obj),
  _obj14 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj14),
  _obj15 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj15),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);
expect(result).toBe('barbazfoo');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var result = '';
var obj = {
  get foo() {
    result += 'foo';
  },
  a: {
    get bar() {
      result += 'bar';
    },
  },
  b: {
    get baz() {
      result += 'baz';
    },
  },
};
var _obj = _objectDestructuringEmpty(obj),
  _obj14 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj14),
  _obj15 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj15),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);
expect(result).toBe('barbazfoo');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var result = '';
var obj = {
  get foo() {
    result += 'foo';
  },
  a: {
    get bar() {
      result += 'bar';
    },
  },
  b: {
    get baz() {
      result += 'baz';
    },
  },
};
var _obj = _objectDestructuringEmpty(obj),
  _obj14 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj14),
  _obj15 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj15),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);
expect(result).toBe('barbazfoo');`,
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
const _obj = _objectDestructuringEmpty(obj),
  _obj12 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj12),
  _obj13 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj13),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);`,
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
const _obj = _objectDestructuringEmpty(obj),
  _obj12 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj12),
  _obj13 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj13),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(obj),
  _obj12 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj12),
  _obj13 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj13),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(obj),
  _obj12 = _objectDestructuringEmpty(_obj.a),
  bar = _extends({}, _obj12),
  _obj13 = _objectDestructuringEmpty(_obj.b),
  baz = _extends({}, _obj13),
  foo = _objectWithoutProperties(_obj, ['a', 'b']);`,
      },
    ],
  },
  {
    title: 'object rest — nested (input)',
    source: `const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four'
    }
  }
}

const { outer: { inner: { three, ...other } } } = defunct
`,
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
const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four',
    },
  },
};
const _obj = _objectDestructuringEmpty(defunct),
  _obj11 = _objectDestructuringEmpty(_obj.outer),
  _obj12 = _objectDestructuringEmpty(_obj11.inner),
  three = _obj12.three,
  other = _objectWithoutProperties(_obj12, ['three']);`,
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
const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four',
    },
  },
};
const _obj = _objectDestructuringEmpty(defunct),
  _obj11 = _objectDestructuringEmpty(_obj.outer),
  _obj12 = _objectDestructuringEmpty(_obj11.inner),
  three = _obj12.three,
  other = _objectWithoutProperties(_obj12, ['three']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four',
    },
  },
};
const _obj = _objectDestructuringEmpty(defunct),
  _obj11 = _objectDestructuringEmpty(_obj.outer),
  _obj12 = _objectDestructuringEmpty(_obj11.inner),
  three = _obj12.three,
  other = _objectWithoutProperties(_obj12, ['three']);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four',
    },
  },
};
const _obj = _objectDestructuringEmpty(defunct),
  _obj11 = _objectDestructuringEmpty(_obj.outer),
  _obj12 = _objectDestructuringEmpty(_obj11.inner),
  three = _obj12.three,
  other = _objectWithoutProperties(_obj12, ['three']);`,
      },
    ],
  },
  {
    title: 'object rest — non string computed exec (exec)',
    source: `const a = {
  "3": "three",
  "foo": "bar"
}

const {
  [3]: omit,
  ...rest
} = a;

expect(rest).toEqual({"foo": "bar"});
expect(omit).toBe("three");

const [k1, k2, k3, k4, k5] = [null, undefined, true, false, {toString() { return "warrior"; }}];
const c = {
  [k1]: "1",
  [k2]: "2",
  [k3]: "3",
  [k4]: "4",
  [k5]: "5"
};

const {
  [k1]: v1,
  [k2]: v2,
  [k3]: v3,
  [k4]: v4,
  [k5]: v5,
  ...vrest
} = c;

expect(v1).toBe("1");
expect(v2).toBe("2");
expect(v3).toBe("3");
expect(v4).toBe("4");
expect(v5).toBe("5");
expect(vrest).toEqual({});

// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();

const d = {
  [sx]: "sx",
  [sy]: "sy"
}

const {
  [sx]: dx,
  [sy]: dy
} = d;

expect(dx).toBe("sx");
expect(dy).toBe("sy");
`,
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
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
      },
    ],
  },
  {
    title: 'object rest — non string computed (input)',
    source: `const a = {
  "3": "three",
  "foo": "bar"
}

const {
  [3]: omit,
  ...rest
} = a;

expect(rest).toEqual({"foo": "bar"});
expect(omit).toBe("three");

const [k1, k2, k3, k4, k5] = [null, undefined, true, false, {toString() { return "warrior"; }}];
const c = {
  [k1]: "1",
  [k2]: "2",
  [k3]: "3",
  [k4]: "4",
  [k5]: "5"
};

const {
  [k1]: v1,
  [k2]: v2,
  [k3]: v3,
  [k4]: v4,
  [k5]: v5,
  ...vrest
} = c;

expect(v1).toBe("1");
expect(v2).toBe("2");
expect(v3).toBe("3");
expect(v4).toBe("4");
expect(v5).toBe("5");
expect(vrest).toEqual({});

// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();

const d = {
  [sx]: "sx",
  [sy]: "sy"
}

const {
  [sx]: dx,
  [sy]: dy
} = d;

expect(dx).toBe("sx");
expect(dy).toBe("sy");
`,
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
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const a = {
  3: 'three',
  foo: 'bar',
};
const _obj = _objectDestructuringEmpty(a),
  _key = _toPropertyKey(3),
  omit = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
expect(rest).toEqual({ foo: 'bar' });
expect(omit).toBe('three');
const [k1, k2, k3, k4, k5] = [
  null,
  undefined,
  true,
  false,
  {
    toString() {
      return 'warrior';
    },
  },
];
const c = {
  [k1]: '1',
  [k2]: '2',
  [k3]: '3',
  [k4]: '4',
  [k5]: '5',
};
const _obj33 = _objectDestructuringEmpty(c),
  _key34 = _toPropertyKey(k1),
  v1 = _obj33[_key34],
  _key35 = _toPropertyKey(k2),
  v2 = _obj33[_key35],
  _key36 = _toPropertyKey(k3),
  v3 = _obj33[_key36],
  _key37 = _toPropertyKey(k4),
  v4 = _obj33[_key37],
  _key38 = _toPropertyKey(k5),
  v5 = _obj33[_key38],
  vrest = _objectWithoutProperties(_obj33, [_key34, _key35, _key36, _key37, _key38]);
expect(v1).toBe('1');
expect(v2).toBe('2');
expect(v3).toBe('3');
expect(v4).toBe('4');
expect(v5).toBe('5');
expect(vrest).toEqual({});
// shouldn't convert symbols to strings
const sx = Symbol();
const sy = Symbol();
const d = {
  [sx]: 'sx',
  [sy]: 'sy',
};
const { [sx]: dx, [sy]: dy } = d;
expect(dx).toBe('sx');
expect(dy).toBe('sy');`,
      },
    ],
  },
  {
    title: 'object rest — null destructuring transform destructuring (exec)',
    source: `expect(() => {
  var { ...x } = null;
}).toThrow(/null/);

expect(() => {
  var { x, ...y } = null;
}).toThrow(/null/);
`,
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
        output: `const _excluded = ['x'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
expect(() => {
  var _ref = null,
    x = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
}).toThrow(/null/);
expect(() => {
  var _ref2 = null,
    { x } = _ref2,
    y = _objectWithoutProperties(_ref2, _excluded);
}).toThrow(/null/);`,
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
        output: `const _excluded = ['x'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
expect(() => {
  var _ref = null,
    x = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
}).toThrow(/null/);
expect(() => {
  var _ref2 = null,
    { x } = _ref2,
    y = _objectWithoutProperties(_ref2, _excluded);
}).toThrow(/null/);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
expect(() => {
  var _obj = _objectDestructuringEmpty(null),
    x = _extends({}, _obj);
}).toThrow(/null/);
expect(() => {
  var _obj12 = _objectDestructuringEmpty(null),
    x = _obj12.x,
    y = _objectWithoutProperties(_obj12, ['x']);
}).toThrow(/null/);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
expect(() => {
  var _obj = _objectDestructuringEmpty(null),
    x = _extends({}, _obj);
}).toThrow(/null/);
expect(() => {
  var _obj12 = _objectDestructuringEmpty(null),
    x = _obj12.x,
    y = _objectWithoutProperties(_obj12, ['x']);
}).toThrow(/null/);`,
      },
    ],
  },
  {
    title: 'object rest — null destructuring transform destructuring (input)',
    source: `expect(() => {
  var { ...x } = null;
}).toThrow(/null/);

expect(() => {
  var { x, ...y } = null;
}).toThrow(/null/);
`,
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
        output: `const _excluded = ['x'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
expect(() => {
  var _ref = null,
    x = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
}).toThrow(/null/);
expect(() => {
  var _ref2 = null,
    { x } = _ref2,
    y = _objectWithoutProperties(_ref2, _excluded);
}).toThrow(/null/);`,
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
        output: `const _excluded = ['x'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
expect(() => {
  var _ref = null,
    x = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
}).toThrow(/null/);
expect(() => {
  var _ref2 = null,
    { x } = _ref2,
    y = _objectWithoutProperties(_ref2, _excluded);
}).toThrow(/null/);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
expect(() => {
  var _obj = _objectDestructuringEmpty(null),
    x = _extends({}, _obj);
}).toThrow(/null/);
expect(() => {
  var _obj12 = _objectDestructuringEmpty(null),
    x = _obj12.x,
    y = _objectWithoutProperties(_obj12, ['x']);
}).toThrow(/null/);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
expect(() => {
  var _obj = _objectDestructuringEmpty(null),
    x = _extends({}, _obj);
}).toThrow(/null/);
expect(() => {
  var _obj12 = _objectDestructuringEmpty(null),
    x = _obj12.x,
    y = _objectWithoutProperties(_obj12, ['x']);
}).toThrow(/null/);`,
      },
    ],
  },
  {
    title: 'object rest — object ref computed (exec)',
    source: `var key, x, y, z;
// impure
key = 1;
var { [key++]: { y, ...x } } = { 1: { a: 1, y: 1 } };
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);

// takes care of the order

key = 1;
var {
  [++key]: { y, ...rest_y },
  [++key]: { z, ...rest_z }
} = {2: { y: 2, z: 3 }, 3: { y: 4, z: 6 } };
expect(y).toBe(2);
expect(rest_y).toEqual({z: 3});
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);
`,
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
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
      },
    ],
  },
  {
    title: 'object rest — object ref computed (input)',
    source: `var key, x, y, z;
// impure
key = 1;
var { [key++]: { y, ...x } } = { 1: { a: 1, y: 1 } };
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);

// takes care of the order

key = 1;
var {
  [++key]: { y, ...rest_y },
  [++key]: { z, ...rest_z }
} = {2: { y: 2, z: 3 }, 3: { y: 4, z: 6 } };
expect(y).toBe(2);
expect(rest_y).toEqual({z: 3});
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);
`,
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
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var key, x, y, z;
// impure
key = 1;
var _obj = _objectDestructuringEmpty({
    1: {
      a: 1,
      y: 1,
    },
  }),
  _key = key++,
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  y = _obj16.y,
  x = _objectWithoutProperties(_obj16, ['y']);
expect(x).toEqual({ a: 1 });
expect(key).toBe(2);
expect(y).toBe(1);
// takes care of the order
key = 1;
var _obj18 = _objectDestructuringEmpty({
    2: {
      y: 2,
      z: 3,
    },
    3: {
      y: 4,
      z: 6,
    },
  }),
  _key19 = ++key,
  _obj20 = _objectDestructuringEmpty(_obj18[_key19]),
  y = _obj20.y,
  rest_y = _objectWithoutProperties(_obj20, ['y']),
  _key21 = ++key,
  _obj22 = _objectDestructuringEmpty(_obj18[_key21]),
  z = _obj22.z,
  rest_z = _objectWithoutProperties(_obj22, ['z']);
expect(y).toBe(2);
expect(rest_y).toEqual({ z: 3 });
expect(z).toBe(6);
expect(rest_z).toEqual({ y: 4 });
expect(key).toBe(3);`,
      },
    ],
  },
  {
    title: 'object rest — parameters exec (exec)',
    source: `function sum(x, y, z) {
  return x + y + z;
}
function test() {
  var args = arguments;
  return sum(...args);
}

expect(test(1, 2, 3)).toBe(6);
`,
    filename: 'exec.js',
    output: `function sum(x, y, z) {
  return x + y + z;
}
function test() {
  var args = arguments;
  return sum(...args);
}
expect(test(1, 2, 3)).toBe(6);`,
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
      },
    ],
  },
  {
    title: 'object rest — parameters object rest used in default (input)',
    source: `({...R}, a = R) => {}
({X: Y,...R}, {a = {Y}}) => {}
(a = R, {...R}) => {}
({...R}, e, c = 2, a = R, f = q) => { let q; }
({...R}, a = f(R)) => {}
({...R}, { [R.key]: a = 42 }) => {}

({...R}, {a = {R: b}}) => {}
({...R}, {a = R => R} = {b: R => R}) => {}
`,
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
        output: `const _excluded = ['X'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _ref2 = arguments.length > 0 ? arguments[0] : void 0,
    { X: Y } = _ref2,
    R = _objectWithoutProperties(_ref2, _excluded);
  let { a = { Y } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : R;
  let _ref3 = arguments.length > 1 ? arguments[1] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));
});
(function () {
  let _ref4 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref4), _ref4));
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _ref5 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref5), _ref5));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});
(function () {
  let _ref6 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref6), _ref6));
  let { [R.key]: a = 42 } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _ref7 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7));
  let { a = { R: b } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _ref8 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref8), _ref8));
  let { a = R => R } =
    arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { b: R => R };
});`,
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
        output: `const _excluded = ['X'];
var _objectDestructuringEmpty = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _ref2 = arguments.length > 0 ? arguments[0] : void 0,
    { X: Y } = _ref2,
    R = _objectWithoutProperties(_ref2, _excluded);
  let { a = { Y } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : R;
  let _ref3 = arguments.length > 1 ? arguments[1] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref3), _ref3));
});
(function () {
  let _ref4 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref4), _ref4));
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _ref5 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref5), _ref5));
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});
(function () {
  let _ref6 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref6), _ref6));
  let { [R.key]: a = 42 } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _ref7 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref7), _ref7));
  let { a = { R: b } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _ref8 = arguments.length > 0 ? arguments[0] : void 0,
    R = _extends({}, (_objectDestructuringEmpty(_ref8), _ref8));
  let { a = R => R } =
    arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { b: R => R };
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
(function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _obj18 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    Y = _obj18.X,
    R = _objectWithoutProperties(_obj18, ['X']);
  let { a = { Y } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : R;
  let _obj20 = _objectDestructuringEmpty(arguments.length > 1 ? arguments[1] : void 0),
    R = _extends({}, _obj20);
});
(function () {
  let _obj22 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj22);
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _obj24 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj24);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});
(function () {
  let _obj26 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj26);
  let { [R.key]: a = 42 } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _obj28 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj28);
  let { a = { R: b } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _obj30 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj30);
  let { a = R => R } =
    arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { b: R => R };
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
(function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : R;
});
(function () {
  let _obj18 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    Y = _obj18.X,
    R = _objectWithoutProperties(_obj18, ['X']);
  let { a = { Y } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : R;
  let _obj20 = _objectDestructuringEmpty(arguments.length > 1 ? arguments[1] : void 0),
    R = _extends({}, _obj20);
});
(function () {
  let _obj22 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj22);
  let e = arguments.length > 1 ? arguments[1] : void 0;
  let c = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
  let a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : R;
  let f = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : q;
  return (() => {
    let q;
  })();
});
(function () {
  let _obj24 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj24);
  let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : f(R);
});
(function () {
  let _obj26 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj26);
  let { [R.key]: a = 42 } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _obj28 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj28);
  let { a = { R: b } } = arguments.length > 1 ? arguments[1] : void 0;
});
(function () {
  let _obj30 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    R = _extends({}, _obj30);
  let { a = R => R } =
    arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { b: R => R };
});`,
      },
    ],
  },
  {
    title: 'object rest — parameters (input)',
    source: `function a({ ...a34 }) {}
function a2({a1, ...b1}) {}
function a3({a2, b2, ...c2}) {}
function a4({a3, ...c3}, {a5, ...c5}) {}
function a5({a3, b2: { ba1, ...ba2 }, ...c3}) {}
function a6({a3, b2: { ba1, ...ba2 } }) {}
function a7({a1 = 1, ...b1} = {}) {}
function a8([{...a1}]) {}
function a9([{a1, ...a2}]) {}
function a10([a1, {...a2}]) {}
// Unchanged
function b(a) {}
function b2(a, ...b) {}
function b3({ b }) {}
`,
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
        output: `const _excluded = ['a1'],
  _excluded2 = ['a2', 'b2'],
  _excluded3 = ['a3'],
  _excluded4 = ['a5'];
var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends2 = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
var _toArray2 = {
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
function a(_ref) {
  let a34 = _extends2({}, (_objectDestructuringEmpty3(_ref), _ref));
}
function a2(_ref2) {
  let { a1 } = _ref2,
    b1 = _objectWithoutProperties3(_ref2, _excluded);
}
function a3(_ref3) {
  let { a2, b2 } = _ref3,
    c2 = _objectWithoutProperties3(_ref3, _excluded2);
}
function a4() {
  let _ref4 = arguments.length > 0 ? arguments[0] : void 0,
    { a3 } = _ref4,
    c3 = _objectWithoutProperties3(_ref4, _excluded3);
  let _ref5 = arguments.length > 1 ? arguments[1] : void 0,
    { a5 } = _ref5,
    c5 = _objectWithoutProperties3(_ref5, _excluded4);
}
function a5() {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj.a3,
    _obj30 = _objectDestructuringEmpty(_obj.b2),
    ba1 = _obj30.ba1,
    ba2 = _objectWithoutProperties(_obj30, ['ba1']),
    c3 = _objectWithoutProperties(_obj, ['a3', 'b2']);
}
function a6() {
  let _obj32 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj32.a3,
    _obj33 = _objectDestructuringEmpty(_obj32.b2),
    ba1 = _obj33.ba1,
    ba2 = _objectWithoutProperties(_obj33, ['ba1']);
}
function a7() {
  let _obj35 = _objectDestructuringEmpty(
      arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    ),
    _value = _obj35.a1,
    a1 = _value === void 0 ? 1 : _value,
    b1 = _objectWithoutProperties(_obj35, ['a1']);
}
function a8() {
  let _arr = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj39 = _objectDestructuringEmpty(_arr[0]),
    a1 = _extends({}, _obj39);
}
function a9() {
  let _arr41 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj42 = _objectDestructuringEmpty(_arr41[0]),
    a1 = _obj42.a1,
    a2 = _objectWithoutProperties(_obj42, ['a1']);
}
function a10() {
  let _arr44 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 2, false),
    a1 = _arr44[0],
    _obj45 = _objectDestructuringEmpty(_arr44[1]),
    a2 = _extends({}, _obj45);
}
// Unchanged
function b(a) {}
function b2(a, ...b) {}
function b3({ b }) {}`,
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
        output: `const _excluded = ['a1'],
  _excluded2 = ['a2', 'b2'],
  _excluded3 = ['a3'],
  _excluded4 = ['a5'];
var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends2 = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
var _toArray2 = {
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
function a(_ref) {
  let a34 = _extends2({}, (_objectDestructuringEmpty3(_ref), _ref));
}
function a2(_ref2) {
  let { a1 } = _ref2,
    b1 = _objectWithoutProperties3(_ref2, _excluded);
}
function a3(_ref3) {
  let { a2, b2 } = _ref3,
    c2 = _objectWithoutProperties3(_ref3, _excluded2);
}
function a4() {
  let _ref4 = arguments.length > 0 ? arguments[0] : void 0,
    { a3 } = _ref4,
    c3 = _objectWithoutProperties3(_ref4, _excluded3);
  let _ref5 = arguments.length > 1 ? arguments[1] : void 0,
    { a5 } = _ref5,
    c5 = _objectWithoutProperties3(_ref5, _excluded4);
}
function a5() {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj.a3,
    _obj30 = _objectDestructuringEmpty(_obj.b2),
    ba1 = _obj30.ba1,
    ba2 = _objectWithoutProperties(_obj30, ['ba1']),
    c3 = _objectWithoutProperties(_obj, ['a3', 'b2']);
}
function a6() {
  let _obj32 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj32.a3,
    _obj33 = _objectDestructuringEmpty(_obj32.b2),
    ba1 = _obj33.ba1,
    ba2 = _objectWithoutProperties(_obj33, ['ba1']);
}
function a7() {
  let _obj35 = _objectDestructuringEmpty(
      arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    ),
    _value = _obj35.a1,
    a1 = _value === void 0 ? 1 : _value,
    b1 = _objectWithoutProperties(_obj35, ['a1']);
}
function a8() {
  let _arr = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj39 = _objectDestructuringEmpty(_arr[0]),
    a1 = _extends({}, _obj39);
}
function a9() {
  let _arr41 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj42 = _objectDestructuringEmpty(_arr41[0]),
    a1 = _obj42.a1,
    a2 = _objectWithoutProperties(_obj42, ['a1']);
}
function a10() {
  let _arr44 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 2, false),
    a1 = _arr44[0],
    _obj45 = _objectDestructuringEmpty(_arr44[1]),
    a2 = _extends({}, _obj45);
}
// Unchanged
function b(a) {}
function b2(a, ...b) {}
function b3({ b }) {}`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
function a() {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a34 = _extends({}, _obj);
}
function a2() {
  let _obj31 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a1 = _obj31.a1,
    b1 = _objectWithoutProperties(_obj31, ['a1']);
}
function a3() {
  let _obj33 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a2 = _obj33.a2,
    b2 = _obj33.b2,
    c2 = _objectWithoutProperties(_obj33, ['a2', 'b2']);
}
function a4() {
  let _obj35 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj35.a3,
    c3 = _objectWithoutProperties(_obj35, ['a3']);
  let _obj37 = _objectDestructuringEmpty(arguments.length > 1 ? arguments[1] : void 0),
    a5 = _obj37.a5,
    c5 = _objectWithoutProperties(_obj37, ['a5']);
}
function a5() {
  let _obj39 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj39.a3,
    _obj40 = _objectDestructuringEmpty(_obj39.b2),
    ba1 = _obj40.ba1,
    ba2 = _objectWithoutProperties(_obj40, ['ba1']),
    c3 = _objectWithoutProperties(_obj39, ['a3', 'b2']);
}
function a6() {
  let _obj42 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj42.a3,
    _obj43 = _objectDestructuringEmpty(_obj42.b2),
    ba1 = _obj43.ba1,
    ba2 = _objectWithoutProperties(_obj43, ['ba1']);
}
function a7() {
  let _obj45 = _objectDestructuringEmpty(
      arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    ),
    _value = _obj45.a1,
    a1 = _value === void 0 ? 1 : _value,
    b1 = _objectWithoutProperties(_obj45, ['a1']);
}
function a8() {
  let _arr = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj49 = _objectDestructuringEmpty(_arr[0]),
    a1 = _extends({}, _obj49);
}
function a9() {
  let _arr51 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj52 = _objectDestructuringEmpty(_arr51[0]),
    a1 = _obj52.a1,
    a2 = _objectWithoutProperties(_obj52, ['a1']);
}
function a10() {
  let _arr54 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 2, false),
    a1 = _arr54[0],
    _obj55 = _objectDestructuringEmpty(_arr54[1]),
    a2 = _extends({}, _obj55);
}
// Unchanged
function b(a) {}
function b2(a, ...b) {}
function b3({ b }) {}`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
function a() {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a34 = _extends({}, _obj);
}
function a2() {
  let _obj31 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a1 = _obj31.a1,
    b1 = _objectWithoutProperties(_obj31, ['a1']);
}
function a3() {
  let _obj33 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a2 = _obj33.a2,
    b2 = _obj33.b2,
    c2 = _objectWithoutProperties(_obj33, ['a2', 'b2']);
}
function a4() {
  let _obj35 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj35.a3,
    c3 = _objectWithoutProperties(_obj35, ['a3']);
  let _obj37 = _objectDestructuringEmpty(arguments.length > 1 ? arguments[1] : void 0),
    a5 = _obj37.a5,
    c5 = _objectWithoutProperties(_obj37, ['a5']);
}
function a5() {
  let _obj39 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj39.a3,
    _obj40 = _objectDestructuringEmpty(_obj39.b2),
    ba1 = _obj40.ba1,
    ba2 = _objectWithoutProperties(_obj40, ['ba1']),
    c3 = _objectWithoutProperties(_obj39, ['a3', 'b2']);
}
function a6() {
  let _obj42 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    a3 = _obj42.a3,
    _obj43 = _objectDestructuringEmpty(_obj42.b2),
    ba1 = _obj43.ba1,
    ba2 = _objectWithoutProperties(_obj43, ['ba1']);
}
function a7() {
  let _obj45 = _objectDestructuringEmpty(
      arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    ),
    _value = _obj45.a1,
    a1 = _value === void 0 ? 1 : _value,
    b1 = _objectWithoutProperties(_obj45, ['a1']);
}
function a8() {
  let _arr = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj49 = _objectDestructuringEmpty(_arr[0]),
    a1 = _extends({}, _obj49);
}
function a9() {
  let _arr51 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 1, false),
    _obj52 = _objectDestructuringEmpty(_arr51[0]),
    a1 = _obj52.a1,
    a2 = _objectWithoutProperties(_obj52, ['a1']);
}
function a10() {
  let _arr54 = _toArray(arguments.length > 0 ? arguments[0] : void 0, 2, false),
    a1 = _arr54[0],
    _obj55 = _objectDestructuringEmpty(_arr54[1]),
    a2 = _extends({}, _obj55);
}
// Unchanged
function b(a) {}
function b2(a, ...b) {}
function b3({ b }) {}`,
      },
    ],
  },
  {
    title: 'object rest — remove unused excluded keys loose (input)',
    source: `// should not remove when destructuring into existing bindings
({ a2, ...b2 } = c2);

class Comp extends React.Component {
  render() {
    const {
      excluded,
      excluded2: excludedRenamed,
      used,
      used2: usedRenamed,
      ...props
    } = this.props;

    console.log(used, usedRenamed);

    return React.createElement("input", props);
  }
}

function smth({ unused, ...rest }) {
  call(rest);
}
`,
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
        output: `const _excluded = ['excluded', 'excluded2', 'used', 'used2'],
  _excluded2 = ['unused'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _c;
// should not remove when destructuring into existing bindings
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
class Comp extends React.Component {
  render() {
    const _this$props = this.props,
      { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,
      props = _objectWithoutProperties(_this$props, _excluded);
    console.log(used, usedRenamed);
    return React.createElement('input', props);
  }
}
function smth(_ref) {
  let { unused } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded2);
  call(rest);
}`,
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
        output: `const _excluded = ['excluded', 'excluded2', 'used', 'used2'],
  _excluded2 = ['unused'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _c;
// should not remove when destructuring into existing bindings
((_c = c2), ({ a2 } = _c), (b2 = _objectWithoutProperties(_c, ['a2'])));
class Comp extends React.Component {
  render() {
    const _this$props = this.props,
      { excluded, excluded2: excludedRenamed, used, used2: usedRenamed } = _this$props,
      props = _objectWithoutProperties(_this$props, _excluded);
    console.log(used, usedRenamed);
    return React.createElement('input', props);
  }
}
function smth(_ref) {
  let { unused } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded2);
  call(rest);
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
// should not remove when destructuring into existing bindings
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
class Comp extends React.Component {
  render() {
    const _obj25 = _objectDestructuringEmpty(this.props),
      excluded = _obj25.excluded,
      excludedRenamed = _obj25.excluded2,
      used = _obj25.used,
      usedRenamed = _obj25.used2,
      props = _objectWithoutProperties(_obj25, ['excluded', 'excluded2', 'used', 'used2']);
    console.log(used, usedRenamed);
    return React.createElement('input', props);
  }
}
function smth() {
  let _obj27 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    unused = _obj27.unused,
    rest = _objectWithoutProperties(_obj27, ['unused']);
  call(rest);
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _ref, _obj;
// should not remove when destructuring into existing bindings
((_ref = c2),
  (_obj = _objectDestructuringEmpty(_ref)),
  (a2 = _obj.a2),
  (b2 = _objectWithoutProperties(_obj, ['a2'])),
  _ref);
class Comp extends React.Component {
  render() {
    const _obj25 = _objectDestructuringEmpty(this.props),
      excluded = _obj25.excluded,
      excludedRenamed = _obj25.excluded2,
      used = _obj25.used,
      usedRenamed = _obj25.used2,
      props = _objectWithoutProperties(_obj25, ['excluded', 'excluded2', 'used', 'used2']);
    console.log(used, usedRenamed);
    return React.createElement('input', props);
  }
}
function smth() {
  let _obj27 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    unused = _obj27.unused,
    rest = _objectWithoutProperties(_obj27, ['unused']);
  call(rest);
}`,
      },
    ],
  },
  {
    title: 'object rest — symbol exec (exec)',
    source: `const sym = Symbol("test");
const sym2 = Symbol("not enumerable");

const src = { a: "string" };
Object.defineProperty(src, "b", { value: "not enumerable" })
Object.defineProperty(src, sym, { enumerable: true, value: "symbol" });
Object.defineProperty(src, sym2, { value: "not enumerable" });

const {...rest} = src;

expect(rest[sym]).toBe("symbol");
expect(rest.a).toBe("string");
expect(Object.getOwnPropertyNames(rest)).toEqual(["a"]);
expect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);

const { [sym]: dst, ...noSym } = src;

expect(dst).toBe("symbol");
expect(noSym.a).toBe("string");
expect(Object.getOwnPropertySymbols(noSym)).toEqual([]);
`,
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
        output: `var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
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
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const sym = Symbol('test');
const sym2 = Symbol('not enumerable');
const src = { a: 'string' };
Object.defineProperty(src, 'b', { value: 'not enumerable' });
Object.defineProperty(src, sym, {
  enumerable: true,
  value: 'symbol',
});
Object.defineProperty(src, sym2, { value: 'not enumerable' });
const _ref = (0, src),
  rest = _extends({}, (_objectDestructuringEmpty3(_ref), _ref));
expect(rest[sym]).toBe('symbol');
expect(rest.a).toBe('string');
expect(Object.getOwnPropertyNames(rest)).toEqual(['a']);
expect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);
const _obj = _objectDestructuringEmpty(src),
  _key = _toPropertyKey(sym),
  dst = _obj[_key],
  noSym = _objectWithoutProperties(_obj, [_key]);
expect(dst).toBe('symbol');
expect(noSym.a).toBe('string');
expect(Object.getOwnPropertySymbols(noSym)).toEqual([]);`,
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
        output: `var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends = require('@babel/runtime/helpers/extends');
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
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const sym = Symbol('test');
const sym2 = Symbol('not enumerable');
const src = { a: 'string' };
Object.defineProperty(src, 'b', { value: 'not enumerable' });
Object.defineProperty(src, sym, {
  enumerable: true,
  value: 'symbol',
});
Object.defineProperty(src, sym2, { value: 'not enumerable' });
const _ref = (0, src),
  rest = _extends({}, (_objectDestructuringEmpty3(_ref), _ref));
expect(rest[sym]).toBe('symbol');
expect(rest.a).toBe('string');
expect(Object.getOwnPropertyNames(rest)).toEqual(['a']);
expect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);
const _obj = _objectDestructuringEmpty(src),
  _key = _toPropertyKey(sym),
  dst = _obj[_key],
  noSym = _objectWithoutProperties(_obj, [_key]);
expect(dst).toBe('symbol');
expect(noSym.a).toBe('string');
expect(Object.getOwnPropertySymbols(noSym)).toEqual([]);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const sym = Symbol('test');
const sym2 = Symbol('not enumerable');
const src = { a: 'string' };
Object.defineProperty(src, 'b', { value: 'not enumerable' });
Object.defineProperty(src, sym, {
  enumerable: true,
  value: 'symbol',
});
Object.defineProperty(src, sym2, { value: 'not enumerable' });
const _obj = _objectDestructuringEmpty(src),
  rest = _extends({}, _obj);
expect(rest[sym]).toBe('symbol');
expect(rest.a).toBe('string');
expect(Object.getOwnPropertyNames(rest)).toEqual(['a']);
expect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);
const _obj18 = _objectDestructuringEmpty(src),
  _key = _toPropertyKey(sym),
  dst = _obj18[_key],
  noSym = _objectWithoutProperties(_obj18, [_key]);
expect(dst).toBe('symbol');
expect(noSym.a).toBe('string');
expect(Object.getOwnPropertySymbols(noSym)).toEqual([]);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const sym = Symbol('test');
const sym2 = Symbol('not enumerable');
const src = { a: 'string' };
Object.defineProperty(src, 'b', { value: 'not enumerable' });
Object.defineProperty(src, sym, {
  enumerable: true,
  value: 'symbol',
});
Object.defineProperty(src, sym2, { value: 'not enumerable' });
const _obj = _objectDestructuringEmpty(src),
  rest = _extends({}, _obj);
expect(rest[sym]).toBe('symbol');
expect(rest.a).toBe('string');
expect(Object.getOwnPropertyNames(rest)).toEqual(['a']);
expect(Object.getOwnPropertySymbols(rest)).toEqual([sym]);
const _obj18 = _objectDestructuringEmpty(src),
  _key = _toPropertyKey(sym),
  dst = _obj18[_key],
  noSym = _objectWithoutProperties(_obj18, [_key]);
expect(dst).toBe('symbol');
expect(noSym.a).toBe('string');
expect(Object.getOwnPropertySymbols(noSym)).toEqual([]);`,
      },
    ],
  },
  {
    title: 'object rest — symbol (input)',
    source: `let {
  [Symbol.for("foo")]: foo,
  ...rest
} = {};

({ [Symbol.for("foo")]: foo, ...rest } = {});

if ({ [Symbol.for("foo")]: foo, ...rest } = {}) {}
`,
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
var _ref12, _obj13, _key14, _ref15, _obj16, _key17;
let _obj = _objectDestructuringEmpty({}),
  _key = _toPropertyKey(Symbol.for('foo')),
  foo = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
((_ref12 = {}),
  (_obj13 = _objectDestructuringEmpty(_ref12)),
  (_key14 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj13[_key14]),
  (rest = _objectWithoutProperties(_obj13, [_key14])),
  _ref12);
if (
  ((_ref15 = {}),
  (_obj16 = _objectDestructuringEmpty(_ref15)),
  (_key17 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj16[_key17]),
  (rest = _objectWithoutProperties(_obj16, [_key17])),
  _ref15)
) {
}`,
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
var _ref12, _obj13, _key14, _ref15, _obj16, _key17;
let _obj = _objectDestructuringEmpty({}),
  _key = _toPropertyKey(Symbol.for('foo')),
  foo = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
((_ref12 = {}),
  (_obj13 = _objectDestructuringEmpty(_ref12)),
  (_key14 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj13[_key14]),
  (rest = _objectWithoutProperties(_obj13, [_key14])),
  _ref12);
if (
  ((_ref15 = {}),
  (_obj16 = _objectDestructuringEmpty(_ref15)),
  (_key17 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj16[_key17]),
  (rest = _objectWithoutProperties(_obj16, [_key17])),
  _ref15)
) {
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref12, _obj13, _key14, _ref15, _obj16, _key17;
let _obj = _objectDestructuringEmpty({}),
  _key = _toPropertyKey(Symbol.for('foo')),
  foo = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
((_ref12 = {}),
  (_obj13 = _objectDestructuringEmpty(_ref12)),
  (_key14 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj13[_key14]),
  (rest = _objectWithoutProperties(_obj13, [_key14])),
  _ref12);
if (
  ((_ref15 = {}),
  (_obj16 = _objectDestructuringEmpty(_ref15)),
  (_key17 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj16[_key17]),
  (rest = _objectWithoutProperties(_obj16, [_key17])),
  _ref15)
) {
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
var _ref12, _obj13, _key14, _ref15, _obj16, _key17;
let _obj = _objectDestructuringEmpty({}),
  _key = _toPropertyKey(Symbol.for('foo')),
  foo = _obj[_key],
  rest = _objectWithoutProperties(_obj, [_key]);
((_ref12 = {}),
  (_obj13 = _objectDestructuringEmpty(_ref12)),
  (_key14 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj13[_key14]),
  (rest = _objectWithoutProperties(_obj13, [_key14])),
  _ref12);
if (
  ((_ref15 = {}),
  (_obj16 = _objectDestructuringEmpty(_ref15)),
  (_key17 = _toPropertyKey(Symbol.for('foo'))),
  (foo = _obj16[_key17]),
  (rest = _objectWithoutProperties(_obj16, [_key17])),
  _ref15)
) {
}`,
      },
    ],
  },
  {
    title: 'object rest — template literal allLiterals true no hoisting (input)',
    source: `const example = () => {
  const input = {};
  const foo = 'foo';

  ({
    [\`\${foo}_bar\`]: country,
    ...rest
  } = input);
}
`,
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
const example = () => {
  var _ref, _obj, _key;
  const input = {};
  const foo = 'foo';
  ((_ref = input),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(\`\${foo}_bar\`)),
    (country = _obj[_key]),
    (rest = _objectWithoutProperties(_obj, [_key])),
    _ref);
};`,
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
const example = () => {
  var _ref, _obj, _key;
  const input = {};
  const foo = 'foo';
  ((_ref = input),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(\`\${foo}_bar\`)),
    (country = _obj[_key]),
    (rest = _objectWithoutProperties(_obj, [_key])),
    _ref);
};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const example = () => {
  var _ref, _obj, _key;
  const input = {};
  const foo = 'foo';
  ((_ref = input),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(\`\${foo}_bar\`)),
    (country = _obj[_key]),
    (rest = _objectWithoutProperties(_obj, [_key])),
    _ref);
};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const example = () => {
  var _ref, _obj, _key;
  const input = {};
  const foo = 'foo';
  ((_ref = input),
    (_obj = _objectDestructuringEmpty(_ref)),
    (_key = _toPropertyKey(\`\${foo}_bar\`)),
    (country = _obj[_key]),
    (rest = _objectWithoutProperties(_obj, [_key])),
    _ref);
};`,
      },
    ],
  },
  {
    title: 'object rest — template literal property allLiterals false (input)',
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
      },
    ],
  },
  {
    title: 'object rest — template literal property allLiterals true (input)',
    source: `const input = {};

const {
  given_name: givenName,
  'last_name': lastName,
  [\`country\`]: country,
  ...rest
} = input;
`,
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
  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);`,
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
  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
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
  rest = _objectWithoutProperties(_obj, ['given_name', 'last_name', _key]);`,
      },
    ],
  },
  {
    title: 'object rest — variable destructuring (input)',
    source: `const { x15: [...{ ...y15 }] } = z();

let {
  x: { a: xa, [d]: f, ...asdf },
  y: { ...d },
  ...g
} = complex;

let { x4: { ...y4 } } = z();

let { x5: { w5, ...y5 } } = z();
let { x6: { w6: { a6, ...y6 } } } = z();
let { x7: { e7, r7 }, q7: { w7: { a7, ...y7 } } } = z();
let { x8, ...y8 } = z();
let { x9: { w9: { a9, ...y9 } }, x10: { a10, ...y10 },  } = z();
let { x11: [{ w11, ...z11 }] } = z();
let { x12: [{ a12, b12 }, { c12, ...d12 }] } = z();
let { x13: [, { c13, ...d13 }] } = z();
const { x14: [...{ q14, ...y14 }] } = z();
const { x15: [...{ ...y16 }] } = z();
const { x16: [] } = z();
const [...[ ...y17 ]] = z();
const [...{ ...y18 }] = z();
const [...{ a19, ...y19 }] = z();
const { x20: { ...y20 } = { } } = z();
const { x22: { q22, ...y22  } = {} } = z();
const [[ ...y23 ] = []] = z();
const [{ ...y24 } = []] = z();
const { x25: [ ...y25 ] = []} = z();
const { x26: [ q26, ...y26 ] = []} = z();
const {} = {};
const [,,x27] = z();
const {x28: [,,{...y28}]} = z();
const {x29: [,,{q29, ...y29}]} = z();
const [,,{y30, ...x30}] = z();
const [,,{...x31}] = z();
const { x32: { }, w32: { ...y32 } } = z();
const [,,{}, {...q32}] = z();
const { ...y33 } = z();
`,
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
        output: `var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends2 = require('@babel/runtime/helpers/extends');
var _toArray2 = {
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
const _obj = _objectDestructuringEmpty(z()),
  _arr = _toArray(_obj.x15, 0, true),
  _obj65 = _objectDestructuringEmpty(_arr),
  y15 = _extends({}, _obj65);
let _obj67 = _objectDestructuringEmpty(complex),
  _obj68 = _objectDestructuringEmpty(_obj67.x),
  xa = _obj68.a,
  _key = _toPropertyKey(d),
  f = _obj68[_key],
  asdf = _objectWithoutProperties(_obj68, ['a', _key]),
  _obj70 = _objectDestructuringEmpty(_obj67.y),
  d = _extends({}, _obj70),
  g = _objectWithoutProperties(_obj67, ['x', 'y']);
let _obj72 = _objectDestructuringEmpty(z()),
  _obj73 = _objectDestructuringEmpty(_obj72.x4),
  y4 = _extends({}, _obj73);
let _obj75 = _objectDestructuringEmpty(z()),
  _obj76 = _objectDestructuringEmpty(_obj75.x5),
  w5 = _obj76.w5,
  y5 = _objectWithoutProperties(_obj76, ['w5']);
let _obj78 = _objectDestructuringEmpty(z()),
  _obj79 = _objectDestructuringEmpty(_obj78.x6),
  _obj80 = _objectDestructuringEmpty(_obj79.w6),
  a6 = _obj80.a6,
  y6 = _objectWithoutProperties(_obj80, ['a6']);
let _obj82 = _objectDestructuringEmpty(z()),
  _obj83 = _objectDestructuringEmpty(_obj82.x7),
  e7 = _obj83.e7,
  r7 = _obj83.r7,
  _obj84 = _objectDestructuringEmpty(_obj82.q7),
  _obj85 = _objectDestructuringEmpty(_obj84.w7),
  a7 = _obj85.a7,
  y7 = _objectWithoutProperties(_obj85, ['a7']);
let _z = z(),
  { x8 } = _z,
  y8 = _objectWithoutProperties3(_z, ['x8']);
let _obj87 = _objectDestructuringEmpty(z()),
  _obj88 = _objectDestructuringEmpty(_obj87.x9),
  _obj89 = _objectDestructuringEmpty(_obj88.w9),
  a9 = _obj89.a9,
  y9 = _objectWithoutProperties(_obj89, ['a9']),
  _obj90 = _objectDestructuringEmpty(_obj87.x10),
  a10 = _obj90.a10,
  y10 = _objectWithoutProperties(_obj90, ['a10']);
let _obj92 = _objectDestructuringEmpty(z()),
  _arr93 = _toArray(_obj92.x11, 1, false),
  _obj94 = _objectDestructuringEmpty(_arr93[0]),
  w11 = _obj94.w11,
  z11 = _objectWithoutProperties(_obj94, ['w11']);
let _obj96 = _objectDestructuringEmpty(z()),
  _arr97 = _toArray(_obj96.x12, 2, false),
  _obj98 = _objectDestructuringEmpty(_arr97[0]),
  a12 = _obj98.a12,
  b12 = _obj98.b12,
  _obj99 = _objectDestructuringEmpty(_arr97[1]),
  c12 = _obj99.c12,
  d12 = _objectWithoutProperties(_obj99, ['c12']);
let _obj101 = _objectDestructuringEmpty(z()),
  _arr102 = _toArray(_obj101.x13, 2, false),
  _obj103 = _objectDestructuringEmpty(_arr102[1]),
  c13 = _obj103.c13,
  d13 = _objectWithoutProperties(_obj103, ['c13']);
const _obj105 = _objectDestructuringEmpty(z()),
  _arr106 = _toArray(_obj105.x14, 0, true),
  _obj107 = _objectDestructuringEmpty(_arr106),
  q14 = _obj107.q14,
  y14 = _objectWithoutProperties(_obj107, ['q14']);
const _obj109 = _objectDestructuringEmpty(z()),
  _arr110 = _toArray(_obj109.x15, 0, true),
  _obj111 = _objectDestructuringEmpty(_arr110),
  y16 = _extends({}, _obj111);
const {
  x16: [],
} = z();
const [...[...y17]] = z();
const _arr113 = _toArray(z(), 0, true),
  _obj114 = _objectDestructuringEmpty(_arr113),
  y18 = _extends({}, _obj114);
const _arr116 = _toArray(z(), 0, true),
  _obj117 = _objectDestructuringEmpty(_arr116),
  a19 = _obj117.a19,
  y19 = _objectWithoutProperties(_obj117, ['a19']);
const _obj119 = _objectDestructuringEmpty(z()),
  _value = _obj119.x20,
  _obj121 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  y20 = _extends({}, _obj121);
const _obj123 = _objectDestructuringEmpty(z()),
  _value124 = _obj123.x22,
  _obj125 = _objectDestructuringEmpty(_value124 === void 0 ? {} : _value124),
  q22 = _obj125.q22,
  y22 = _objectWithoutProperties(_obj125, ['q22']);
const [[...y23] = []] = z();
const _arr127 = _toArray(z(), 1, false),
  _value128 = _arr127[0],
  _obj129 = _objectDestructuringEmpty(_value128 === void 0 ? [] : _value128),
  y24 = _extends({}, _obj129);
const { x25: [...y25] = [] } = z();
const { x26: [q26, ...y26] = [] } = z();
const {} = {};
const [, , x27] = z();
const _obj131 = _objectDestructuringEmpty(z()),
  _arr132 = _toArray(_obj131.x28, 3, false),
  _obj133 = _objectDestructuringEmpty(_arr132[2]),
  y28 = _extends({}, _obj133);
const _obj135 = _objectDestructuringEmpty(z()),
  _arr136 = _toArray(_obj135.x29, 3, false),
  _obj137 = _objectDestructuringEmpty(_arr136[2]),
  q29 = _obj137.q29,
  y29 = _objectWithoutProperties(_obj137, ['q29']);
const _arr139 = _toArray(z(), 3, false),
  _obj140 = _objectDestructuringEmpty(_arr139[2]),
  y30 = _obj140.y30,
  x30 = _objectWithoutProperties(_obj140, ['y30']);
const _arr142 = _toArray(z(), 3, false),
  _obj143 = _objectDestructuringEmpty(_arr142[2]),
  x31 = _extends({}, _obj143);
const _obj145 = _objectDestructuringEmpty(z()),
  _obj146 = _objectDestructuringEmpty(_obj145.x32),
  _obj147 = _objectDestructuringEmpty(_obj145.w32),
  y32 = _extends({}, _obj147);
const _arr149 = _toArray(z(), 4, false),
  _obj150 = _objectDestructuringEmpty(_arr149[2]),
  _obj151 = _objectDestructuringEmpty(_arr149[3]),
  q32 = _extends({}, _obj151);
const _z2 = z(),
  y33 = _extends2({}, (_objectDestructuringEmpty3(_z2), _z2));`,
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
        output: `var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
var _objectDestructuringEmpty3 = require('@babel/runtime/helpers/objectDestructuringEmpty');
var _extends2 = require('@babel/runtime/helpers/extends');
var _toArray2 = {
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
const _obj = _objectDestructuringEmpty(z()),
  _arr = _toArray(_obj.x15, 0, true),
  _obj65 = _objectDestructuringEmpty(_arr),
  y15 = _extends({}, _obj65);
let _obj67 = _objectDestructuringEmpty(complex),
  _obj68 = _objectDestructuringEmpty(_obj67.x),
  xa = _obj68.a,
  _key = _toPropertyKey(d),
  f = _obj68[_key],
  asdf = _objectWithoutProperties(_obj68, ['a', _key]),
  _obj70 = _objectDestructuringEmpty(_obj67.y),
  d = _extends({}, _obj70),
  g = _objectWithoutProperties(_obj67, ['x', 'y']);
let _obj72 = _objectDestructuringEmpty(z()),
  _obj73 = _objectDestructuringEmpty(_obj72.x4),
  y4 = _extends({}, _obj73);
let _obj75 = _objectDestructuringEmpty(z()),
  _obj76 = _objectDestructuringEmpty(_obj75.x5),
  w5 = _obj76.w5,
  y5 = _objectWithoutProperties(_obj76, ['w5']);
let _obj78 = _objectDestructuringEmpty(z()),
  _obj79 = _objectDestructuringEmpty(_obj78.x6),
  _obj80 = _objectDestructuringEmpty(_obj79.w6),
  a6 = _obj80.a6,
  y6 = _objectWithoutProperties(_obj80, ['a6']);
let _obj82 = _objectDestructuringEmpty(z()),
  _obj83 = _objectDestructuringEmpty(_obj82.x7),
  e7 = _obj83.e7,
  r7 = _obj83.r7,
  _obj84 = _objectDestructuringEmpty(_obj82.q7),
  _obj85 = _objectDestructuringEmpty(_obj84.w7),
  a7 = _obj85.a7,
  y7 = _objectWithoutProperties(_obj85, ['a7']);
let _z = z(),
  { x8 } = _z,
  y8 = _objectWithoutProperties3(_z, ['x8']);
let _obj87 = _objectDestructuringEmpty(z()),
  _obj88 = _objectDestructuringEmpty(_obj87.x9),
  _obj89 = _objectDestructuringEmpty(_obj88.w9),
  a9 = _obj89.a9,
  y9 = _objectWithoutProperties(_obj89, ['a9']),
  _obj90 = _objectDestructuringEmpty(_obj87.x10),
  a10 = _obj90.a10,
  y10 = _objectWithoutProperties(_obj90, ['a10']);
let _obj92 = _objectDestructuringEmpty(z()),
  _arr93 = _toArray(_obj92.x11, 1, false),
  _obj94 = _objectDestructuringEmpty(_arr93[0]),
  w11 = _obj94.w11,
  z11 = _objectWithoutProperties(_obj94, ['w11']);
let _obj96 = _objectDestructuringEmpty(z()),
  _arr97 = _toArray(_obj96.x12, 2, false),
  _obj98 = _objectDestructuringEmpty(_arr97[0]),
  a12 = _obj98.a12,
  b12 = _obj98.b12,
  _obj99 = _objectDestructuringEmpty(_arr97[1]),
  c12 = _obj99.c12,
  d12 = _objectWithoutProperties(_obj99, ['c12']);
let _obj101 = _objectDestructuringEmpty(z()),
  _arr102 = _toArray(_obj101.x13, 2, false),
  _obj103 = _objectDestructuringEmpty(_arr102[1]),
  c13 = _obj103.c13,
  d13 = _objectWithoutProperties(_obj103, ['c13']);
const _obj105 = _objectDestructuringEmpty(z()),
  _arr106 = _toArray(_obj105.x14, 0, true),
  _obj107 = _objectDestructuringEmpty(_arr106),
  q14 = _obj107.q14,
  y14 = _objectWithoutProperties(_obj107, ['q14']);
const _obj109 = _objectDestructuringEmpty(z()),
  _arr110 = _toArray(_obj109.x15, 0, true),
  _obj111 = _objectDestructuringEmpty(_arr110),
  y16 = _extends({}, _obj111);
const {
  x16: [],
} = z();
const [...[...y17]] = z();
const _arr113 = _toArray(z(), 0, true),
  _obj114 = _objectDestructuringEmpty(_arr113),
  y18 = _extends({}, _obj114);
const _arr116 = _toArray(z(), 0, true),
  _obj117 = _objectDestructuringEmpty(_arr116),
  a19 = _obj117.a19,
  y19 = _objectWithoutProperties(_obj117, ['a19']);
const _obj119 = _objectDestructuringEmpty(z()),
  _value = _obj119.x20,
  _obj121 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  y20 = _extends({}, _obj121);
const _obj123 = _objectDestructuringEmpty(z()),
  _value124 = _obj123.x22,
  _obj125 = _objectDestructuringEmpty(_value124 === void 0 ? {} : _value124),
  q22 = _obj125.q22,
  y22 = _objectWithoutProperties(_obj125, ['q22']);
const [[...y23] = []] = z();
const _arr127 = _toArray(z(), 1, false),
  _value128 = _arr127[0],
  _obj129 = _objectDestructuringEmpty(_value128 === void 0 ? [] : _value128),
  y24 = _extends({}, _obj129);
const { x25: [...y25] = [] } = z();
const { x26: [q26, ...y26] = [] } = z();
const {} = {};
const [, , x27] = z();
const _obj131 = _objectDestructuringEmpty(z()),
  _arr132 = _toArray(_obj131.x28, 3, false),
  _obj133 = _objectDestructuringEmpty(_arr132[2]),
  y28 = _extends({}, _obj133);
const _obj135 = _objectDestructuringEmpty(z()),
  _arr136 = _toArray(_obj135.x29, 3, false),
  _obj137 = _objectDestructuringEmpty(_arr136[2]),
  q29 = _obj137.q29,
  y29 = _objectWithoutProperties(_obj137, ['q29']);
const _arr139 = _toArray(z(), 3, false),
  _obj140 = _objectDestructuringEmpty(_arr139[2]),
  y30 = _obj140.y30,
  x30 = _objectWithoutProperties(_obj140, ['y30']);
const _arr142 = _toArray(z(), 3, false),
  _obj143 = _objectDestructuringEmpty(_arr142[2]),
  x31 = _extends({}, _obj143);
const _obj145 = _objectDestructuringEmpty(z()),
  _obj146 = _objectDestructuringEmpty(_obj145.x32),
  _obj147 = _objectDestructuringEmpty(_obj145.w32),
  y32 = _extends({}, _obj147);
const _arr149 = _toArray(z(), 4, false),
  _obj150 = _objectDestructuringEmpty(_arr149[2]),
  _obj151 = _objectDestructuringEmpty(_arr149[3]),
  q32 = _extends({}, _obj151);
const _z2 = z(),
  y33 = _extends2({}, (_objectDestructuringEmpty3(_z2), _z2));`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const _obj = _objectDestructuringEmpty(z()),
  _arr = _toArray(_obj.x15, 0, true),
  _obj65 = _objectDestructuringEmpty(_arr),
  y15 = _extends({}, _obj65);
let _obj67 = _objectDestructuringEmpty(complex),
  _obj68 = _objectDestructuringEmpty(_obj67.x),
  xa = _obj68.a,
  _key = _toPropertyKey(d),
  f = _obj68[_key],
  asdf = _objectWithoutProperties(_obj68, ['a', _key]),
  _obj70 = _objectDestructuringEmpty(_obj67.y),
  d = _extends({}, _obj70),
  g = _objectWithoutProperties(_obj67, ['x', 'y']);
let _obj72 = _objectDestructuringEmpty(z()),
  _obj73 = _objectDestructuringEmpty(_obj72.x4),
  y4 = _extends({}, _obj73);
let _obj75 = _objectDestructuringEmpty(z()),
  _obj76 = _objectDestructuringEmpty(_obj75.x5),
  w5 = _obj76.w5,
  y5 = _objectWithoutProperties(_obj76, ['w5']);
let _obj78 = _objectDestructuringEmpty(z()),
  _obj79 = _objectDestructuringEmpty(_obj78.x6),
  _obj80 = _objectDestructuringEmpty(_obj79.w6),
  a6 = _obj80.a6,
  y6 = _objectWithoutProperties(_obj80, ['a6']);
let _obj82 = _objectDestructuringEmpty(z()),
  _obj83 = _objectDestructuringEmpty(_obj82.x7),
  e7 = _obj83.e7,
  r7 = _obj83.r7,
  _obj84 = _objectDestructuringEmpty(_obj82.q7),
  _obj85 = _objectDestructuringEmpty(_obj84.w7),
  a7 = _obj85.a7,
  y7 = _objectWithoutProperties(_obj85, ['a7']);
let _obj87 = _objectDestructuringEmpty(z()),
  x8 = _obj87.x8,
  y8 = _objectWithoutProperties(_obj87, ['x8']);
let _obj89 = _objectDestructuringEmpty(z()),
  _obj90 = _objectDestructuringEmpty(_obj89.x9),
  _obj91 = _objectDestructuringEmpty(_obj90.w9),
  a9 = _obj91.a9,
  y9 = _objectWithoutProperties(_obj91, ['a9']),
  _obj92 = _objectDestructuringEmpty(_obj89.x10),
  a10 = _obj92.a10,
  y10 = _objectWithoutProperties(_obj92, ['a10']);
let _obj94 = _objectDestructuringEmpty(z()),
  _arr95 = _toArray(_obj94.x11, 1, false),
  _obj96 = _objectDestructuringEmpty(_arr95[0]),
  w11 = _obj96.w11,
  z11 = _objectWithoutProperties(_obj96, ['w11']);
let _obj98 = _objectDestructuringEmpty(z()),
  _arr99 = _toArray(_obj98.x12, 2, false),
  _obj100 = _objectDestructuringEmpty(_arr99[0]),
  a12 = _obj100.a12,
  b12 = _obj100.b12,
  _obj101 = _objectDestructuringEmpty(_arr99[1]),
  c12 = _obj101.c12,
  d12 = _objectWithoutProperties(_obj101, ['c12']);
let _obj103 = _objectDestructuringEmpty(z()),
  _arr104 = _toArray(_obj103.x13, 2, false),
  _obj105 = _objectDestructuringEmpty(_arr104[1]),
  c13 = _obj105.c13,
  d13 = _objectWithoutProperties(_obj105, ['c13']);
const _obj107 = _objectDestructuringEmpty(z()),
  _arr108 = _toArray(_obj107.x14, 0, true),
  _obj109 = _objectDestructuringEmpty(_arr108),
  q14 = _obj109.q14,
  y14 = _objectWithoutProperties(_obj109, ['q14']);
const _obj111 = _objectDestructuringEmpty(z()),
  _arr112 = _toArray(_obj111.x15, 0, true),
  _obj113 = _objectDestructuringEmpty(_arr112),
  y16 = _extends({}, _obj113);
const {
  x16: [],
} = z();
const [...[...y17]] = z();
const _arr115 = _toArray(z(), 0, true),
  _obj116 = _objectDestructuringEmpty(_arr115),
  y18 = _extends({}, _obj116);
const _arr118 = _toArray(z(), 0, true),
  _obj119 = _objectDestructuringEmpty(_arr118),
  a19 = _obj119.a19,
  y19 = _objectWithoutProperties(_obj119, ['a19']);
const _obj121 = _objectDestructuringEmpty(z()),
  _value = _obj121.x20,
  _obj123 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  y20 = _extends({}, _obj123);
const _obj125 = _objectDestructuringEmpty(z()),
  _value126 = _obj125.x22,
  _obj127 = _objectDestructuringEmpty(_value126 === void 0 ? {} : _value126),
  q22 = _obj127.q22,
  y22 = _objectWithoutProperties(_obj127, ['q22']);
const [[...y23] = []] = z();
const _arr129 = _toArray(z(), 1, false),
  _value130 = _arr129[0],
  _obj131 = _objectDestructuringEmpty(_value130 === void 0 ? [] : _value130),
  y24 = _extends({}, _obj131);
const { x25: [...y25] = [] } = z();
const { x26: [q26, ...y26] = [] } = z();
const {} = {};
const [, , x27] = z();
const _obj133 = _objectDestructuringEmpty(z()),
  _arr134 = _toArray(_obj133.x28, 3, false),
  _obj135 = _objectDestructuringEmpty(_arr134[2]),
  y28 = _extends({}, _obj135);
const _obj137 = _objectDestructuringEmpty(z()),
  _arr138 = _toArray(_obj137.x29, 3, false),
  _obj139 = _objectDestructuringEmpty(_arr138[2]),
  q29 = _obj139.q29,
  y29 = _objectWithoutProperties(_obj139, ['q29']);
const _arr141 = _toArray(z(), 3, false),
  _obj142 = _objectDestructuringEmpty(_arr141[2]),
  y30 = _obj142.y30,
  x30 = _objectWithoutProperties(_obj142, ['y30']);
const _arr144 = _toArray(z(), 3, false),
  _obj145 = _objectDestructuringEmpty(_arr144[2]),
  x31 = _extends({}, _obj145);
const _obj147 = _objectDestructuringEmpty(z()),
  _obj148 = _objectDestructuringEmpty(_obj147.x32),
  _obj149 = _objectDestructuringEmpty(_obj147.w32),
  y32 = _extends({}, _obj149);
const _arr151 = _toArray(z(), 4, false),
  _obj152 = _objectDestructuringEmpty(_arr151[2]),
  _obj153 = _objectDestructuringEmpty(_arr151[3]),
  q32 = _extends({}, _obj153);
const _obj155 = _objectDestructuringEmpty(z()),
  y33 = _extends({}, _obj155);`,
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
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
const _obj = _objectDestructuringEmpty(z()),
  _arr = _toArray(_obj.x15, 0, true),
  _obj65 = _objectDestructuringEmpty(_arr),
  y15 = _extends({}, _obj65);
let _obj67 = _objectDestructuringEmpty(complex),
  _obj68 = _objectDestructuringEmpty(_obj67.x),
  xa = _obj68.a,
  _key = _toPropertyKey(d),
  f = _obj68[_key],
  asdf = _objectWithoutProperties(_obj68, ['a', _key]),
  _obj70 = _objectDestructuringEmpty(_obj67.y),
  d = _extends({}, _obj70),
  g = _objectWithoutProperties(_obj67, ['x', 'y']);
let _obj72 = _objectDestructuringEmpty(z()),
  _obj73 = _objectDestructuringEmpty(_obj72.x4),
  y4 = _extends({}, _obj73);
let _obj75 = _objectDestructuringEmpty(z()),
  _obj76 = _objectDestructuringEmpty(_obj75.x5),
  w5 = _obj76.w5,
  y5 = _objectWithoutProperties(_obj76, ['w5']);
let _obj78 = _objectDestructuringEmpty(z()),
  _obj79 = _objectDestructuringEmpty(_obj78.x6),
  _obj80 = _objectDestructuringEmpty(_obj79.w6),
  a6 = _obj80.a6,
  y6 = _objectWithoutProperties(_obj80, ['a6']);
let _obj82 = _objectDestructuringEmpty(z()),
  _obj83 = _objectDestructuringEmpty(_obj82.x7),
  e7 = _obj83.e7,
  r7 = _obj83.r7,
  _obj84 = _objectDestructuringEmpty(_obj82.q7),
  _obj85 = _objectDestructuringEmpty(_obj84.w7),
  a7 = _obj85.a7,
  y7 = _objectWithoutProperties(_obj85, ['a7']);
let _obj87 = _objectDestructuringEmpty(z()),
  x8 = _obj87.x8,
  y8 = _objectWithoutProperties(_obj87, ['x8']);
let _obj89 = _objectDestructuringEmpty(z()),
  _obj90 = _objectDestructuringEmpty(_obj89.x9),
  _obj91 = _objectDestructuringEmpty(_obj90.w9),
  a9 = _obj91.a9,
  y9 = _objectWithoutProperties(_obj91, ['a9']),
  _obj92 = _objectDestructuringEmpty(_obj89.x10),
  a10 = _obj92.a10,
  y10 = _objectWithoutProperties(_obj92, ['a10']);
let _obj94 = _objectDestructuringEmpty(z()),
  _arr95 = _toArray(_obj94.x11, 1, false),
  _obj96 = _objectDestructuringEmpty(_arr95[0]),
  w11 = _obj96.w11,
  z11 = _objectWithoutProperties(_obj96, ['w11']);
let _obj98 = _objectDestructuringEmpty(z()),
  _arr99 = _toArray(_obj98.x12, 2, false),
  _obj100 = _objectDestructuringEmpty(_arr99[0]),
  a12 = _obj100.a12,
  b12 = _obj100.b12,
  _obj101 = _objectDestructuringEmpty(_arr99[1]),
  c12 = _obj101.c12,
  d12 = _objectWithoutProperties(_obj101, ['c12']);
let _obj103 = _objectDestructuringEmpty(z()),
  _arr104 = _toArray(_obj103.x13, 2, false),
  _obj105 = _objectDestructuringEmpty(_arr104[1]),
  c13 = _obj105.c13,
  d13 = _objectWithoutProperties(_obj105, ['c13']);
const _obj107 = _objectDestructuringEmpty(z()),
  _arr108 = _toArray(_obj107.x14, 0, true),
  _obj109 = _objectDestructuringEmpty(_arr108),
  q14 = _obj109.q14,
  y14 = _objectWithoutProperties(_obj109, ['q14']);
const _obj111 = _objectDestructuringEmpty(z()),
  _arr112 = _toArray(_obj111.x15, 0, true),
  _obj113 = _objectDestructuringEmpty(_arr112),
  y16 = _extends({}, _obj113);
const {
  x16: [],
} = z();
const [...[...y17]] = z();
const _arr115 = _toArray(z(), 0, true),
  _obj116 = _objectDestructuringEmpty(_arr115),
  y18 = _extends({}, _obj116);
const _arr118 = _toArray(z(), 0, true),
  _obj119 = _objectDestructuringEmpty(_arr118),
  a19 = _obj119.a19,
  y19 = _objectWithoutProperties(_obj119, ['a19']);
const _obj121 = _objectDestructuringEmpty(z()),
  _value = _obj121.x20,
  _obj123 = _objectDestructuringEmpty(_value === void 0 ? {} : _value),
  y20 = _extends({}, _obj123);
const _obj125 = _objectDestructuringEmpty(z()),
  _value126 = _obj125.x22,
  _obj127 = _objectDestructuringEmpty(_value126 === void 0 ? {} : _value126),
  q22 = _obj127.q22,
  y22 = _objectWithoutProperties(_obj127, ['q22']);
const [[...y23] = []] = z();
const _arr129 = _toArray(z(), 1, false),
  _value130 = _arr129[0],
  _obj131 = _objectDestructuringEmpty(_value130 === void 0 ? [] : _value130),
  y24 = _extends({}, _obj131);
const { x25: [...y25] = [] } = z();
const { x26: [q26, ...y26] = [] } = z();
const {} = {};
const [, , x27] = z();
const _obj133 = _objectDestructuringEmpty(z()),
  _arr134 = _toArray(_obj133.x28, 3, false),
  _obj135 = _objectDestructuringEmpty(_arr134[2]),
  y28 = _extends({}, _obj135);
const _obj137 = _objectDestructuringEmpty(z()),
  _arr138 = _toArray(_obj137.x29, 3, false),
  _obj139 = _objectDestructuringEmpty(_arr138[2]),
  q29 = _obj139.q29,
  y29 = _objectWithoutProperties(_obj139, ['q29']);
const _arr141 = _toArray(z(), 3, false),
  _obj142 = _objectDestructuringEmpty(_arr141[2]),
  y30 = _obj142.y30,
  x30 = _objectWithoutProperties(_obj142, ['y30']);
const _arr144 = _toArray(z(), 3, false),
  _obj145 = _objectDestructuringEmpty(_arr144[2]),
  x31 = _extends({}, _obj145);
const _obj147 = _objectDestructuringEmpty(z()),
  _obj148 = _objectDestructuringEmpty(_obj147.x32),
  _obj149 = _objectDestructuringEmpty(_obj147.w32),
  y32 = _extends({}, _obj149);
const _arr151 = _toArray(z(), 4, false),
  _obj152 = _objectDestructuringEmpty(_arr151[2]),
  _obj153 = _objectDestructuringEmpty(_arr151[3]),
  q32 = _extends({}, _obj153);
const _obj155 = _objectDestructuringEmpty(z()),
  y33 = _extends({}, _obj155);`,
      },
    ],
  },
  {
    title: 'object rest — variable exec (exec)',
    source: `// var { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };

// expect(x).toBe(1);
// expect(y).toBe(2);
// expect(z).toEqual({ a: 3, b: 4 });

// var complex = {
//   x: { a: 1, b: 2, c: 3 },
// };

// var {
//   x: { a: xa, ...xbc }
// } = complex;

// expect(xa).toBe(1);
// expect(xbc).toEqual({ b: 2, c: 3});

// // own properties
// function ownX({ ...properties }) {
//   return properties.x;
// }
// expect(ownX(Object.create({ x: 1 }))).toBeUndefined();
`,
    filename: 'exec.js',
    output: `// var { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
// expect(x).toBe(1);
// expect(y).toBe(2);
// expect(z).toEqual({ a: 3, b: 4 });
// var complex = {
//   x: { a: 1, b: 2, c: 3 },
// };
// var {
//   x: { a: xa, ...xbc }
// } = complex;
// expect(xa).toBe(1);
// expect(xbc).toEqual({ b: 2, c: 3});
// // own properties
// function ownX({ ...properties }) {
//   return properties.x;
// }
// expect(ownX(Object.create({ x: 1 }))).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'object rest — with array rest (input)',
    source: `let {
  a: [b, ...arrayRest],
  c = function(...functionRest){},
  ...objectRest
} = {
  a: [1, 2, 3, 4],
  d: "oyez"
};
`,
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
let _obj = _objectDestructuringEmpty({
    a: [1, 2, 3, 4],
    d: 'oyez',
  }),
  _arr = _toArray(_obj.a, 1, true),
  b = _arr[0],
  arrayRest = _arr.slice(1),
  _value = _obj.c,
  c = _value === void 0 ? function (...functionRest) {} : _value,
  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);`,
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
let _obj = _objectDestructuringEmpty({
    a: [1, 2, 3, 4],
    d: 'oyez',
  }),
  _arr = _toArray(_obj.a, 1, true),
  b = _arr[0],
  arrayRest = _arr.slice(1),
  _value = _obj.c,
  c = _value === void 0 ? function (...functionRest) {} : _value,
  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let _obj = _objectDestructuringEmpty({
    a: [1, 2, 3, 4],
    d: 'oyez',
  }),
  _arr = _toArray(_obj.a, 1, true),
  b = _arr[0],
  arrayRest = _arr.slice(1),
  _value = _obj.c,
  c = _value === void 0 ? function (...functionRest) {} : _value,
  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);`,
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
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
let _obj = _objectDestructuringEmpty({
    a: [1, 2, 3, 4],
    d: 'oyez',
  }),
  _arr = _toArray(_obj.a, 1, true),
  b = _arr[0],
  arrayRest = _arr.slice(1),
  _value = _obj.c,
  c = _value === void 0 ? function (...functionRest) {} : _value,
  objectRest = _objectWithoutProperties(_obj, ['a', 'c']);`,
      },
    ],
  },
  {
    title: 'object spread loose builtins — side effect (exec)',
    source: `var k = { a: 1, b: 2 };
var o = { a: 3, ...k, b: k.a++ };
// Loose will evaluate the static \`b: k.a++\` before spreading \`...k\`.
// It should be {a: 1, b: 1}
expect(o).toEqual({a: 2, b: 1});

var k = { a: 1, get b() { l = { z: 9 }; return 2; } };
var l = { c: 3 };
var o = { ...k, ...l };
// Loose will evaluate the \`l\` before spreading \`...k\`.
// It should be {a: 1, b: 2, z: 9}
expect(o).toEqual({ a: 1, b: 2, c: 3 });
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
// Loose will evaluate the static \`b: k.a++\` before spreading \`...k\`.
// It should be {a: 1, b: 1}
expect(o).toEqual({
  a: 2,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _objectSpread(_objectSpread({}, k), l);
// Loose will evaluate the \`l\` before spreading \`...k\`.
// It should be {a: 1, b: 2, z: 9}
expect(o).toEqual({
  a: 1,
  b: 2,
  c: 3,
});`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
// Loose will evaluate the static \`b: k.a++\` before spreading \`...k\`.
// It should be {a: 1, b: 1}
expect(o).toEqual({
  a: 2,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _objectSpread(_objectSpread({}, k), l);
// Loose will evaluate the \`l\` before spreading \`...k\`.
// It should be {a: 1, b: 2, z: 9}
expect(o).toEqual({
  a: 1,
  b: 2,
  c: 3,
});`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var k = {
  a: 1,
  b: 2,
};
var o = _extends({ a: 3 }, k, { b: k.a++ });
// Loose will evaluate the static \`b: k.a++\` before spreading \`...k\`.
// It should be {a: 1, b: 1}
expect(o).toEqual({
  a: 2,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _extends({}, k, l);
// Loose will evaluate the \`l\` before spreading \`...k\`.
// It should be {a: 1, b: 2, z: 9}
expect(o).toEqual({
  a: 1,
  b: 2,
  c: 3,
});`,
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
        output: `var k = {
  a: 1,
  b: 2,
};
var o = Object.assign({ a: 3 }, k, { b: k.a++ });
// Loose will evaluate the static \`b: k.a++\` before spreading \`...k\`.
// It should be {a: 1, b: 1}
expect(o).toEqual({
  a: 2,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = Object.assign({}, k, l);
// Loose will evaluate the \`l\` before spreading \`...k\`.
// It should be {a: 1, b: 2, z: 9}
expect(o).toEqual({
  a: 1,
  b: 2,
  c: 3,
});`,
      },
    ],
  },
  {
    title: 'object spread loose builtins — side effect (input)',
    source: `var k = { a: 1, b: 2 };
var o = { a: 3, ...k, b: k.a++ };

var pureA = {};
var pureB = {};
var pureC = {};
var pureD = {};
var pureE = {};

function impureFunc() {
  console.log('hello')
}

var output = { ...pureA, get foo() {}, get bar() {}, ...pureB, ...pureC, ...impureFunc(), ...pureD, pureD }

var simpleOutput = { ...pureA, test: '1', ...pureB,  }`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
var pureA = {};
var pureB = {};
var pureC = {};
var pureD = {};
var pureE = {};
function impureFunc() {
  console.log('hello');
}
var output = _objectSpread(
  _objectSpread(
    _objectSpread(
      _objectSpread(
        _objectSpread(
          _objectSpread({}, pureA),
          {},
          {
            get foo() {},
            get bar() {},
          },
          pureB,
        ),
        pureC,
      ),
      impureFunc(),
    ),
    pureD,
  ),
  {},
  { pureD },
);
var simpleOutput = _objectSpread(_objectSpread({}, pureA), {}, { test: '1' }, pureB);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
var pureA = {};
var pureB = {};
var pureC = {};
var pureD = {};
var pureE = {};
function impureFunc() {
  console.log('hello');
}
var output = _objectSpread(
  _objectSpread(
    _objectSpread(
      _objectSpread(
        _objectSpread(
          _objectSpread({}, pureA),
          {},
          {
            get foo() {},
            get bar() {},
          },
          pureB,
        ),
        pureC,
      ),
      impureFunc(),
    ),
    pureD,
  ),
  {},
  { pureD },
);
var simpleOutput = _objectSpread(_objectSpread({}, pureA), {}, { test: '1' }, pureB);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var k = {
  a: 1,
  b: 2,
};
var o = _extends({ a: 3 }, k, { b: k.a++ });
var pureA = {};
var pureB = {};
var pureC = {};
var pureD = {};
var pureE = {};
function impureFunc() {
  console.log('hello');
}
var output = _extends(
  {},
  pureA,
  {
    get foo() {},
    get bar() {},
  },
  pureB,
  pureC,
  impureFunc(),
  pureD,
  { pureD },
);
var simpleOutput = _extends({}, pureA, { test: '1' }, pureB);`,
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
        output: `var k = {
  a: 1,
  b: 2,
};
var o = Object.assign({ a: 3 }, k, { b: k.a++ });
var pureA = {};
var pureB = {};
var pureC = {};
var pureD = {};
var pureE = {};
function impureFunc() {
  console.log('hello');
}
var output = Object.assign(
  {},
  pureA,
  {
    get foo() {},
    get bar() {},
  },
  pureB,
  pureC,
  impureFunc(),
  pureD,
  { pureD },
);
var simpleOutput = Object.assign({}, pureA, { test: '1' }, pureB);`,
      },
    ],
  },
  {
    title: 'object spread loose builtins — string exec (exec)',
    source: `expect([...'']).toHaveLength(0);
expect([...'abc']).toHaveLength(3);
expect([...'def']).toMatchObject(['d','e','f']);
`,
    filename: 'exec.js',
    output: `expect([...'']).toHaveLength(0);
expect([...'abc']).toHaveLength(3);
expect([...'def']).toMatchObject(['d', 'e', 'f']);`,
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
      },
    ],
  },
  {
    title: 'object spread loose builtins — variable declaration (input)',
    source: `var z = { ...x };
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var z = _objectSpread({}, x);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var z = _objectSpread({}, x);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var z = _extends({}, x);`,
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
        output: 'var z = Object.assign({}, x);',
      },
    ],
  },
  {
    title: 'object spread — expression (exec)',
    source: `var log = [];

var a = {
  ...{ get foo() { log.push(1); } },
  get bar() { log.push(2); }
};

expect(log).toEqual([1]);
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var log = [];
var a = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        log.push(1);
      },
    },
  ),
  {},
  {
    get bar() {
      log.push(2);
    },
  },
);
expect(log).toEqual([1]);`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var log = [];
var a = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        log.push(1);
      },
    },
  ),
  {},
  {
    get bar() {
      log.push(2);
    },
  },
);
expect(log).toEqual([1]);`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var log = [];
var a = _extends(
  {},
  {
    get foo() {
      log.push(1);
    },
  },
  {
    get bar() {
      log.push(2);
    },
  },
);
expect(log).toEqual([1]);`,
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
        output: `var log = [];
var a = Object.assign(
  {},
  {
    get foo() {
      log.push(1);
    },
  },
  {
    get bar() {
      log.push(2);
    },
  },
);
expect(log).toEqual([1]);`,
      },
    ],
  },
  {
    title: 'object spread — no object assign exec (exec)',
    source: `"use strict";
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});

Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});

const obj = { NOSET: 123 };
// this wouldn't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
const objSpread = { ...obj };
expect(objSpread).toHaveProperty('NOSET', 123);

const obj2 = { NOWRITE: 456 };
// this line would throw \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
const obj2Spread = { ...obj2 };
expect(obj2Spread).toHaveProperty('NOWRITE', 456);

const KEY = Symbol('key');
const obj3Spread = { ...{ get foo () { return 'bar' } }, [KEY]: 'symbol' };
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');

const obj4Spread = { ...Object.prototype };
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();

expect(() => ({ ...null, ...undefined })).not.toThrow();

const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = { ...o };
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);
`,
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
        output: `'use strict';
var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this wouldn't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
const objSpread = _objectSpread({}, obj);
expect(objSpread).toHaveProperty('NOSET', 123);
const obj2 = { NOWRITE: 456 };
// this line would throw \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
const obj2Spread = _objectSpread({}, obj2);
expect(obj2Spread).toHaveProperty('NOWRITE', 456);
const KEY = Symbol('key');
const obj3Spread = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        return 'bar';
      },
    },
  ),
  {},
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _objectSpread({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _objectSpread({}, o);
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);`,
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
        output: `'use strict';
var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this wouldn't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
const objSpread = _objectSpread({}, obj);
expect(objSpread).toHaveProperty('NOSET', 123);
const obj2 = { NOWRITE: 456 };
// this line would throw \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
const obj2Spread = _objectSpread({}, obj2);
expect(obj2Spread).toHaveProperty('NOWRITE', 456);
const KEY = Symbol('key');
const obj3Spread = _objectSpread(
  _objectSpread(
    {},
    {
      get foo() {
        return 'bar';
      },
    },
  ),
  {},
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _objectSpread({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _objectSpread(_objectSpread({}, null), undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _objectSpread({}, o);
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);`,
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
        output: `'use strict';
var _extends = require('@babel/runtime/helpers/extends');
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this wouldn't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
const objSpread = _extends({}, obj);
expect(objSpread).toHaveProperty('NOSET', 123);
const obj2 = { NOWRITE: 456 };
// this line would throw \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
const obj2Spread = _extends({}, obj2);
expect(obj2Spread).toHaveProperty('NOWRITE', 456);
const KEY = Symbol('key');
const obj3Spread = _extends(
  {},
  {
    get foo() {
      return 'bar';
    },
  },
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = _extends({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => _extends({}, null, undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = _extends({}, o);
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);`,
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
        output: `'use strict';
Object.defineProperty(Object.prototype, 'NOSET', {
  get(value) {
    // noop
  },
});
Object.defineProperty(Object.prototype, 'NOWRITE', {
  writable: false,
  value: 'abc',
});
const obj = { NOSET: 123 };
// this wouldn't work as expected if transformed as Object.assign (or equivalent)
// because those trigger object setters (spread don't)
const objSpread = Object.assign({}, obj);
expect(objSpread).toHaveProperty('NOSET', 123);
const obj2 = { NOWRITE: 456 };
// this line would throw \`TypeError: Cannot assign to read only property 'NOWRITE'\`
// if transformed as Object.assign (or equivalent) because those use *assignment* for creating properties
// (spread defines them)
const obj2Spread = Object.assign({}, obj2);
expect(obj2Spread).toHaveProperty('NOWRITE', 456);
const KEY = Symbol('key');
const obj3Spread = Object.assign(
  {},
  {
    get foo() {
      return 'bar';
    },
  },
  { [KEY]: 'symbol' },
);
expect(Object.getOwnPropertyDescriptor(obj3Spread, 'foo').value).toBe('bar');
expect(Object.getOwnPropertyDescriptor(obj3Spread, KEY).value).toBe('symbol');
const obj4Spread = Object.assign({}, Object.prototype);
expect(Object.getOwnPropertyDescriptor(obj4Spread, 'hasOwnProperty')).toBeUndefined();
expect(() => Object.assign({}, null, undefined)).not.toThrow();
const o = Object.create(null);
o.a = 'foo';
o.__proto__ = [];
const o2 = Object.assign({}, o);
expect(Array.isArray(Object.getPrototypeOf(o2))).toBe(false);`,
      },
    ],
  },
  {
    title: 'object spread — side effect (exec)',
    source: `var k = { a: 1, b: 2 };
var o = { a: 3, ...k, b: k.a++ };
expect(o).toEqual({a: 1, b: 1});

var k = { a: 1, get b() { l = { z: 9 }; return 2; } };
var l = { c: 3 };
var o = { ...k, ...l };
expect(o).toEqual({ a: 1, b: 2, z: 9 });
`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
expect(o).toEqual({
  a: 1,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _objectSpread(_objectSpread({}, k), l);
expect(o).toEqual({
  a: 1,
  b: 2,
  z: 9,
});`,
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
        output: `var _objectSpread = require('@babel/runtime/helpers/objectSpread2');
var k = {
  a: 1,
  b: 2,
};
var o = _objectSpread(_objectSpread({ a: 3 }, k), {}, { b: k.a++ });
expect(o).toEqual({
  a: 1,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _objectSpread(_objectSpread({}, k), l);
expect(o).toEqual({
  a: 1,
  b: 2,
  z: 9,
});`,
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
        output: `var _extends = require('@babel/runtime/helpers/extends');
var k = {
  a: 1,
  b: 2,
};
var o = _extends({ a: 3 }, k, { b: k.a++ });
expect(o).toEqual({
  a: 1,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = _extends({}, k, l);
expect(o).toEqual({
  a: 1,
  b: 2,
  z: 9,
});`,
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
        output: `var k = {
  a: 1,
  b: 2,
};
var o = Object.assign({ a: 3 }, k, { b: k.a++ });
expect(o).toEqual({
  a: 1,
  b: 1,
});
var k = {
  a: 1,
  get b() {
    l = { z: 9 };
    return 2;
  },
};
var l = { c: 3 };
var o = Object.assign({}, k, l);
expect(o).toEqual({
  a: 1,
  b: 2,
  z: 9,
});`,
      },
    ],
  },
  {
    title: 'regression — T7178 (input)',
    source: `import props from "props";

console.log(props);

(function(){
  const { ...props } = this.props;

  console.log(props);
})();
`,
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
        output: `import props from 'props';
import _objectDestructuringEmpty from '@babel/runtime/helpers/objectDestructuringEmpty';
import _extends from '@babel/runtime/helpers/extends';
console.log(props);
(function () {
  const _this$props = this.props,
    props = _extends({}, (_objectDestructuringEmpty(_this$props), _this$props));
  console.log(props);
})();`,
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
        output: `import props from 'props';
import _objectDestructuringEmpty from '@babel/runtime/helpers/objectDestructuringEmpty';
import _extends from '@babel/runtime/helpers/extends';
console.log(props);
(function () {
  const _this$props = this.props,
    props = _extends({}, (_objectDestructuringEmpty(_this$props), _this$props));
  console.log(props);
})();`,
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
        output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
import _babelHelper2 from '@babel/runtime/helpers/extends';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = _babelHelper2;
import props from 'props';
console.log(props);
(function () {
  const _obj = _objectDestructuringEmpty(this.props),
    props = _extends({}, _obj);
  console.log(props);
})();`,
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
        output: `import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
import _babelHelper2 from '@babel/runtime/helpers/extends';
var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper };
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = _babelHelper2;
import props from 'props';
console.log(props);
(function () {
  const _obj = _objectDestructuringEmpty(this.props),
    props = _extends({}, _obj);
  console.log(props);
})();`,
      },
    ],
  },
  {
    title: 'regression — gh 17274 (input)',
    source: `// Computed keys must be evaluated in source order (left-to-right)
// even when nested object rest is involved. This test verifies
// that log(0), log(1), log(2), log(3) execute in that order.

function log(n) {
  console.log(n);
  return "x";
}

const { [log(0)]: { [log(1)]: x, [log(2)]: y, ...rest }, [log(3)]: z } = { x: { x: {} } };

`,
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
// Computed keys must be evaluated in source order (left-to-right)
// even when nested object rest is involved. This test verifies
// that log(0), log(1), log(2), log(3) execute in that order.
function log(n) {
  console.log(n);
  return 'x';
}
const _obj = _objectDestructuringEmpty({ x: { x: {} } }),
  _key = log(0),
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  _key17 = _toPropertyKey(log(1)),
  x = _obj16[_key17],
  _key18 = _toPropertyKey(log(2)),
  y = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]),
  _key19 = log(3),
  z = _obj[_key19];`,
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
// Computed keys must be evaluated in source order (left-to-right)
// even when nested object rest is involved. This test verifies
// that log(0), log(1), log(2), log(3) execute in that order.
function log(n) {
  console.log(n);
  return 'x';
}
const _obj = _objectDestructuringEmpty({ x: { x: {} } }),
  _key = log(0),
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  _key17 = _toPropertyKey(log(1)),
  x = _obj16[_key17],
  _key18 = _toPropertyKey(log(2)),
  y = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]),
  _key19 = log(3),
  z = _obj[_key19];`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
// Computed keys must be evaluated in source order (left-to-right)
// even when nested object rest is involved. This test verifies
// that log(0), log(1), log(2), log(3) execute in that order.
function log(n) {
  console.log(n);
  return 'x';
}
const _obj = _objectDestructuringEmpty({ x: { x: {} } }),
  _key = log(0),
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  _key17 = _toPropertyKey(log(1)),
  x = _obj16[_key17],
  _key18 = _toPropertyKey(log(2)),
  y = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]),
  _key19 = log(3),
  z = _obj[_key19];`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
var _toPropertyKey2 = require('@babel/runtime/helpers/toPropertyKey');
function _toPropertyKey(value) {
  return _toPropertyKey2(value);
}
// Computed keys must be evaluated in source order (left-to-right)
// even when nested object rest is involved. This test verifies
// that log(0), log(1), log(2), log(3) execute in that order.
function log(n) {
  console.log(n);
  return 'x';
}
const _obj = _objectDestructuringEmpty({ x: { x: {} } }),
  _key = log(0),
  _obj16 = _objectDestructuringEmpty(_obj[_key]),
  _key17 = _toPropertyKey(log(1)),
  x = _obj16[_key17],
  _key18 = _toPropertyKey(log(2)),
  y = _obj16[_key18],
  rest = _objectWithoutProperties(_obj16, [_key17, _key18]),
  _key19 = log(3),
  z = _obj[_key19];`,
      },
    ],
  },
  {
    title: 'regression — gh 4904 (input)',
    source: `const { s, ...t } = foo();

const { s: { q1, ...q2 }, ...q3 } = bar();

const { a } = foo(({ b, ...c }) => {
  console.log(b, c);
});
`,
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
        output: `const _excluded = ['b'];
var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
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
const _foo = foo(),
  { s } = _foo,
  t = _objectWithoutProperties3(_foo, ['s']);
const _obj = _objectDestructuringEmpty(bar()),
  _obj20 = _objectDestructuringEmpty(_obj.s),
  q1 = _obj20.q1,
  q2 = _objectWithoutProperties(_obj20, ['q1']),
  q3 = _objectWithoutProperties(_obj, ['s']);
const { a } = foo(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    { b } = _ref,
    c = _objectWithoutProperties3(_ref, _excluded);
  console.log(b, c);
});`,
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
        output: `const _excluded = ['b'];
var _objectWithoutProperties3 = require('@babel/runtime/helpers/objectWithoutProperties');
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
const _foo = foo(),
  { s } = _foo,
  t = _objectWithoutProperties3(_foo, ['s']);
const _obj = _objectDestructuringEmpty(bar()),
  _obj20 = _objectDestructuringEmpty(_obj.s),
  q1 = _obj20.q1,
  q2 = _objectWithoutProperties(_obj20, ['q1']),
  q3 = _objectWithoutProperties(_obj, ['s']);
const { a } = foo(function () {
  let _ref = arguments.length > 0 ? arguments[0] : void 0,
    { b } = _ref,
    c = _objectWithoutProperties3(_ref, _excluded);
  console.log(b, c);
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(foo()),
  s = _obj.s,
  t = _objectWithoutProperties(_obj, ['s']);
const _obj21 = _objectDestructuringEmpty(bar()),
  _obj22 = _objectDestructuringEmpty(_obj21.s),
  q1 = _obj22.q1,
  q2 = _objectWithoutProperties(_obj22, ['q1']),
  q3 = _objectWithoutProperties(_obj21, ['s']);
const { a } = foo(function () {
  let _obj24 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    b = _obj24.b,
    c = _objectWithoutProperties(_obj24, ['b']);
  console.log(b, c);
});`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(foo()),
  s = _obj.s,
  t = _objectWithoutProperties(_obj, ['s']);
const _obj21 = _objectDestructuringEmpty(bar()),
  _obj22 = _objectDestructuringEmpty(_obj21.s),
  q1 = _obj22.q1,
  q2 = _objectWithoutProperties(_obj22, ['q1']),
  q3 = _objectWithoutProperties(_obj21, ['s']);
const { a } = foo(function () {
  let _obj24 = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    b = _obj24.b,
    c = _objectWithoutProperties(_obj24, ['b']);
  console.log(b, c);
});`,
      },
    ],
  },
  {
    title: 'regression — gh 5151 (input)',
    source: `const { x, ...y } = a,
  z = foo(y);

const { ...s } = r,
  t = foo(s);

// ordering is preserved
var l = foo(),
    { m: { n, ...o }, ...p } = bar(),
    q = baz();
`,
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
const _obj = _objectDestructuringEmpty(a),
  x = _obj.x,
  y = _objectWithoutProperties(_obj, ['x']),
  z = foo(y);
const _obj24 = _objectDestructuringEmpty(r),
  s = _extends({}, _obj24),
  t = foo(s);
// ordering is preserved
var l = foo(),
  _obj26 = _objectDestructuringEmpty(bar()),
  _obj27 = _objectDestructuringEmpty(_obj26.m),
  n = _obj27.n,
  o = _objectWithoutProperties(_obj27, ['n']),
  p = _objectWithoutProperties(_obj26, ['m']),
  q = baz();`,
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
const _obj = _objectDestructuringEmpty(a),
  x = _obj.x,
  y = _objectWithoutProperties(_obj, ['x']),
  z = foo(y);
const _obj24 = _objectDestructuringEmpty(r),
  s = _extends({}, _obj24),
  t = foo(s);
// ordering is preserved
var l = foo(),
  _obj26 = _objectDestructuringEmpty(bar()),
  _obj27 = _objectDestructuringEmpty(_obj26.m),
  n = _obj27.n,
  o = _objectWithoutProperties(_obj27, ['n']),
  p = _objectWithoutProperties(_obj26, ['m']),
  q = baz();`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(a),
  x = _obj.x,
  y = _objectWithoutProperties(_obj, ['x']),
  z = foo(y);
const _obj24 = _objectDestructuringEmpty(r),
  s = _extends({}, _obj24),
  t = foo(s);
// ordering is preserved
var l = foo(),
  _obj26 = _objectDestructuringEmpty(bar()),
  _obj27 = _objectDestructuringEmpty(_obj26.m),
  n = _obj27.n,
  o = _objectWithoutProperties(_obj27, ['n']),
  p = _objectWithoutProperties(_obj26, ['m']),
  q = baz();`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _extends = require('@babel/runtime/helpers/extends');
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const _obj = _objectDestructuringEmpty(a),
  x = _obj.x,
  y = _objectWithoutProperties(_obj, ['x']),
  z = foo(y);
const _obj24 = _objectDestructuringEmpty(r),
  s = _extends({}, _obj24),
  t = foo(s);
// ordering is preserved
var l = foo(),
  _obj26 = _objectDestructuringEmpty(bar()),
  _obj27 = _objectDestructuringEmpty(_obj26.m),
  n = _obj27.n,
  o = _objectWithoutProperties(_obj27, ['n']),
  p = _objectWithoutProperties(_obj26, ['m']),
  q = baz();`,
      },
    ],
  },
  {
    title: 'regression — gh 7388 (input)',
    source: `function fn0(obj0) {
  const {
    fn1 = (obj1 = {}) => {
      const {
        fn2 = (obj2 = {}) => {
          const {a, ...rest} = obj2;
          console.log(rest);
        }
      } = obj1;
    }
  } = obj0;
}
`,
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
        output: `const _excluded = ['a'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
function fn0(obj0) {
  const {
    fn1 = (obj1 = {}) => {
      const {
        fn2 = (obj2 = {}) => {
          const _ref = (0, obj2),
            { a } = _ref,
            rest = _objectWithoutProperties(_ref, _excluded);
          console.log(rest);
        },
      } = obj1;
    },
  } = obj0;
}`,
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
        output: `const _excluded = ['a'];
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
function fn0(obj0) {
  const {
    fn1 = (obj1 = {}) => {
      const {
        fn2 = (obj2 = {}) => {
          const _ref = (0, obj2),
            { a } = _ref,
            rest = _objectWithoutProperties(_ref, _excluded);
          console.log(rest);
        },
      } = obj1;
    },
  } = obj0;
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
function fn0(obj0) {
  const {
    fn1 = (obj1 = {}) => {
      const {
        fn2 = (obj2 = {}) => {
          const _obj = _objectDestructuringEmpty(obj2),
            a = _obj.a,
            rest = _objectWithoutProperties(_obj, ['a']);
          console.log(rest);
        },
      } = obj1;
    },
  } = obj0;
}`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
function fn0(obj0) {
  const {
    fn1 = (obj1 = {}) => {
      const {
        fn2 = (obj2 = {}) => {
          const _obj = _objectDestructuringEmpty(obj2),
            a = _obj.a,
            rest = _objectWithoutProperties(_obj, ['a']);
          console.log(rest);
        },
      } = obj1;
    },
  } = obj0;
}`,
      },
    ],
  },
  {
    title: 'regression — gh 8323 (input)',
    source: `const get = () => {
  fireTheMissiles();
  return 3;
};

const f = ({ a = get(), b, c, ...z }) => {
  const v = b + 3;
};
`,
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
const get = () => {
  fireTheMissiles();
  return 3;
};
const f = function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    _value = _obj.a,
    a = _value === void 0 ? get() : _value,
    b = _obj.b,
    c = _obj.c,
    z = _objectWithoutProperties(_obj, ['a', 'b', 'c']);
  const v = b + 3;
};`,
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
const get = () => {
  fireTheMissiles();
  return 3;
};
const f = function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    _value = _obj.a,
    a = _value === void 0 ? get() : _value,
    b = _obj.b,
    c = _obj.c,
    z = _objectWithoutProperties(_obj, ['a', 'b', 'c']);
  const v = b + 3;
};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const get = () => {
  fireTheMissiles();
  return 3;
};
const f = function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    _value = _obj.a,
    a = _value === void 0 ? get() : _value,
    b = _obj.b,
    c = _obj.c,
    z = _objectWithoutProperties(_obj, ['a', 'b', 'c']);
  const v = b + 3;
};`,
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
        output: `var _objectDestructuringEmpty2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
};
function _objectDestructuringEmpty(t) {
  return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
}
var _objectWithoutProperties2 = {
  objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
  objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
};
function _objectWithoutProperties(e, t) {
  return (
    _objectWithoutProperties2.objectDestructuringEmpty(e),
    _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
  );
}
const get = () => {
  fireTheMissiles();
  return 3;
};
const f = function () {
  let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
    _value = _obj.a,
    a = _value === void 0 ? get() : _value,
    b = _obj.b,
    c = _obj.c,
    z = _objectWithoutProperties(_obj, ['a', 'b', 'c']);
  const v = b + 3;
};`,
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
