import { expect, test } from 'vitest';
import type { PreflightPlan } from '../../../js';
import { runtimeHelpers, transformSource } from '../transform';

const hermesV0: PreflightPlan = {
  compact: true,
  comments: false,
  helpers: runtimeHelpers,
  transforms: {
    blockScoping: true,
    classes: true,
    classProperties: { loose: true },
    classStaticBlock: true,
    privateMethods: true,
    privatePropertyInObject: true,
    destructuring: true,
    parameters: true,
    asyncFunctions: true,
    asyncGeneratorFunctions: true,
    regexpUnicode: true,
    regexpNamedCaptureGroups: true,
  },
};

const hermesV1: PreflightPlan = {
  compact: true,
  comments: false,
  helpers: runtimeHelpers,
  transforms: {
    blockScoping: true,
    classStaticBlock: true,
    asyncGeneratorFunctions: true,
  },
};

const web: PreflightPlan = {
  helpers: runtimeHelpers,
  transforms: { objectRestSpread: { loose: true, useBuiltIns: true } },
};

test('composes the native portion of the legacy Hermes language profile in one phase', async () => {
  const source = `
    export class Reader {
      static { this.pattern = /(?<word>\\w+)/u; }
      #value = 1;
      has(input) { return #value in input; }
      async read({ value = this.#value } = {}) { return await value; }
      async *values(items) { for await (const item of items) yield item; }
    }
  `;
  expect(await transformSource(source, 'input.js', hermesV0)).toMatchInlineSnapshot(`
    "import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    import _asyncIterator from '@babel/runtime/helpers/asyncIterator';
    import _awaitAsyncGenerator from '@babel/runtime/helpers/awaitAsyncGenerator';
    import _wrapAsyncGenerator from '@babel/runtime/helpers/wrapAsyncGenerator';
    import _babelHelper from '@babel/runtime/helpers/wrapRegExp';
    import _babelHelper2 from '@babel/runtime/helpers/objectDestructuringEmpty';
    import _babelHelper3 from '@babel/runtime/helpers/classPrivateFieldLooseBase';
    import _babelHelper4 from '@babel/runtime/helpers/classPrivateFieldLooseKey';
    import _babelHelper5 from '@babel/runtime/helpers/checkInRHS';
    var _wrapRegExp2 = { wrapRegExp: _babelHelper },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper2 };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    var _classPrivateFieldLooseBase2 = {
      classPrivateFieldLooseBase: _babelHelper3,
      classPrivateFieldLooseKey: _babelHelper4,
    };
    function _classPrivateFieldLooseBase(e, s, a) {
      return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
    }
    var _checkInRHS2 = { checkInRHS: _babelHelper5 },
      _checkInRHS = _checkInRHS2.checkInRHS;
    export var Reader = (() => {
      'use strict';
      var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(\`__private_Reader_value\`);
      function _initialize() {
        Object.defineProperty(this, _value, { writable: true, value: 1 });
      }
      var _Reader = function _Reader() {
        if (!new.target) throw new TypeError(\`Cannot call a class as a function\`);
        _initialize.call(this);
      };
      Object.defineProperty(_Reader.prototype, 'has', {
        value: Object.defineProperty(
          function (input) {
            if (new.target) throw new TypeError(\`Class methods cannot be invoked with 'new'\`);
            return Object.prototype.hasOwnProperty.call(_checkInRHS(input), _value);
          },
          'name',
          { value: \`has\`, configurable: true },
        ),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(_Reader.prototype, 'read', {
        value: Object.defineProperty(
          _asyncToGenerator(function* () {
            var _obj = _objectDestructuringEmpty(
                arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
              ),
              _value23 = _obj.value,
              value =
                _value23 === void 0 ? _classPrivateFieldLooseBase(this, _value)[_value] : _value23;
            return yield value;
          }),
          'name',
          { value: \`read\`, configurable: true },
        ),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(_Reader.prototype, 'values', {
        value: Object.defineProperty(
          (function () {
            var _ref = _wrapAsyncGenerator(function* (items) {
              var _iteratorAbruptCompletion = false;
              var _didIteratorError = false;
              var _iteratorError;
              try {
                for (
                  var _iterator = _asyncIterator(items), _step;
                  (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
                    .done);
                  _iteratorAbruptCompletion = false
                ) {
                  var item = _step.value;
                  yield item;
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (_iteratorAbruptCompletion && _iterator.return != null) {
                    yield _awaitAsyncGenerator(_iterator.return());
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }
            });
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          })(),
          'name',
          { value: \`values\`, configurable: true },
        ),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(_Reader, 'prototype', { writable: false });
      (function () {
        this.pattern = _wrapRegExp(/(\\w+)/, { word: 1 });
      }).call(_Reader);
      return _Reader;
    })();"
  `);
});

test('composes the native portion of the modern Hermes language profile', async () => {
  const source = `
    export class Reader {
      static { this.kind = 'reader'; }
      async read(value) { return await value; }
      async *values(items) { for await (const item of items) yield item; }
    }
    for (let index = 0; index < 2; index++) queue(() => index);
  `;
  expect(await transformSource(source, 'input.js', hermesV1)).toMatchInlineSnapshot(`
    "import _asyncIterator from '@babel/runtime/helpers/asyncIterator';
    import _awaitAsyncGenerator from '@babel/runtime/helpers/awaitAsyncGenerator';
    import _wrapAsyncGenerator from '@babel/runtime/helpers/wrapAsyncGenerator';
    export class Reader {
      static #_ = (this.kind = \`reader\`);
      async read(value) {
        return await value;
      }
      values(items) {
        return _wrapAsyncGenerator(function* () {
          var _iteratorAbruptCompletion = false;
          var _didIteratorError = false;
          var _iteratorError;
          try {
            for (
              var _iterator = _asyncIterator(items), _step;
              (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
                .done);
              _iteratorAbruptCompletion = false
            ) {
              var item = _step.value;
              yield item;
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (_iteratorAbruptCompletion && _iterator.return != null) {
                yield _awaitAsyncGenerator(_iterator.return());
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        })();
      }
    }
    var _loopResult;
    var _loop = index => {
      queue(() => index);
      return { type: \`normal\`, vars: [index] };
    };
    for (var index = 0; index < 2; index++) {
      _loopResult = _loop(index);
      index = _loopResult.vars[0];
    }"
  `);
});

test('composes the non-Hermes object rest and spread profile', async () => {
  const source = `export const merge = ({ ignored, ...rest }, extra) => ({ ...rest, ...extra });`;
  expect(await transformSource(source, 'input.js', web)).toMatchInlineSnapshot(`
    "import _babelHelper from '@babel/runtime/helpers/objectDestructuringEmpty';
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
    export const merge = function () {
      let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
        ignored = _obj.ignored,
        rest = _objectWithoutProperties(_obj, ['ignored']);
      let extra = arguments.length > 1 ? arguments[1] : void 0;
      return Object.assign({}, rest, extra);
    };"
  `);
});

test('composes TypeScript with the automatic JSX runtime', async () => {
  const source = `
    type Props = { value: number };
    export function App({ value }: Props) { return <View value={value} />; }
  `;
  expect(
    await transformSource(source, 'App.tsx', {
      typescript: 'strip',
      jsx: 'automatic',
      jsxImportSource: 'react',
    }),
  ).toMatchInlineSnapshot(`
    "import { jsx as _jsx } from 'react/jsx-runtime';
    export function App({ value }) {
      return /* @__PURE__ */ _jsx(View, { value });
    }"
  `);
});

test('composes Flow erasure with the classic React runtime', async () => {
  const source = `
    // @flow
    type Props = { value: number };
    export function App({ value }: Props): React.Node { return <View value={value} />; }
  `;
  expect(await transformSource(source, 'App.js', { jsx: 'classic' })).toMatchInlineSnapshot(`
    "// @flow
    export function App({ value }) {
      return /* @__PURE__ */ React.createElement(View, { value });
    }"
  `);
});

test('composes React Compiler with TypeScript and automatic JSX', async () => {
  const source = `
    type Props = { value: number };
    export function App({ value }: Props) { return <View value={value} />; }
  `;
  expect(
    await transformSource(source, 'App.tsx', {
      typescript: 'strip',
      jsx: 'automatic',
      reactCompiler: {
        compilationMode: 'infer',
        panicThreshold: 'none',
        target: '19',
        enableResetCacheOnSourceFileChanges: true,
      },
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    import { jsx as _jsx } from 'react/jsx-runtime';
    export function App(t0) {
      const $ = _c(3);
      if ($[0] !== 'a2fb8f568295d5c5dd8850fe5855257b2bc8db73') {
        for (let i = 1; i < 3; i++) $[i] = Symbol.for('react.memo_cache_sentinel');
        $[0] = 'a2fb8f568295d5c5dd8850fe5855257b2bc8db73';
      }
      const { value } = t0;
      let t1;
      if ($[1] !== value) {
        t1 = /* @__PURE__ */ _jsx(View, { value });
        $[1] = value;
        $[2] = t1;
      } else {
        t1 = $[2];
      }
      return t1;
    }"
  `);
});

test('composes React Refresh, automatic JSX, and async lowering', async () => {
  const source = `
    import { useState } from 'react';
    export default async function App({ load }) {
      const [value] = useState(0);
      return <View value={await load(value)} />;
    }
  `;
  expect(
    await transformSource(source, 'App.jsx', {
      helpers: runtimeHelpers,
      jsx: 'automatic-development',
      reactRefresh: {},
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "import { useState } from 'react';
    import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    var _jsxFileName = 'App.jsx';
    import { jsxDEV as _jsxDEV } from 'react/jsx-dev-runtime';
    var _s = $RefreshSig$();
    export default function App(_x) {
      return _App.apply(this, arguments);
    }
    function _App() {
      _App = _asyncToGenerator(function* ({ load }) {
        _s();
        const [value] = useState(0);
        return _jsxDEV(
          View,
          { value: yield load(value) },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 5,
            columnNumber: 14,
          },
          this,
        );
      });
      return _App.apply(this, arguments);
    }
    _s(App, 'hMeGOYDHwTuZt8ICyZR2ANpWEfs=');
    _c = App;
    var _c;
    $RefreshReg$(_c, 'App');"
  `);
});

test('supports inline and runtime helper profiles', async () => {
  const source = 'export async function read(value) { return await value; }';
  expect({
    inline: await transformSource(source, 'input.js', {
      helpers: { mode: 'inline' },
      transforms: { asyncFunctions: true },
    }),
    runtime: await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  }).toMatchInlineSnapshot(`
    {
      "inline": "var babelHelpers = (() => {
      var y = {
          asyncToGenerator: function (r, u) {
            function x(i, f, p, o, a, s, e) {
              try {
                var n = i[s](e),
                  t = n.value;
              } catch (d) {
                return void p(d);
              }
              n.done ? f(t) : Promise.resolve(t).then(o, a);
            }
            function h(i) {
              return function () {
                var f = this,
                  p = arguments;
                return new Promise(function (o, a) {
                  var s = i.apply(f, p);
                  function e(t) {
                    x(s, o, a, e, n, 'next', t);
                  }
                  function n(t) {
                    x(s, o, a, e, n, 'throw', t);
                  }
                  e(void 0);
                });
              };
            }
            ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
          },
        },
        c = {};
      function v(r) {
        if (c[r]) return c[r].exports;
        var u = (c[r] = { exports: {} });
        return (y[r](u, v), u.exports);
      }
      return { asyncToGenerator: v('asyncToGenerator') };
    })();
    export function read(_x) {
      return _read.apply(this, arguments);
    }
    function _read() {
      _read = babelHelpers.asyncToGenerator(function* (value) {
        return yield value;
      });
      return _read.apply(this, arguments);
    }",
      "runtime": "import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    export function read(_x) {
      return _read.apply(this, arguments);
    }
    function _read() {
      _read = _asyncToGenerator(function* (value) {
        return yield value;
      });
      return _read.apply(this, arguments);
    }",
    }
  `);
});
