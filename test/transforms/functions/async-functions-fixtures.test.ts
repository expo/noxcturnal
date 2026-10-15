import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfoo(\n  (function () {\n    var _ref = babelHelpers.asyncToGenerator(function* (x) {});\n    return function (_x) {\n      return _ref.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  (function () {\n    var _ref2 = babelHelpers.asyncToGenerator(function* ([x]) {});\n    return function (_x2) {\n      return _ref2.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  (function () {\n    var _ref3 = babelHelpers.asyncToGenerator(function* ({ x }) {});\n    return function (_x3) {\n      return _ref3.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  /* @__PURE__ */ (function () {\n    var _ref4 = babelHelpers.asyncToGenerator(function* (x) {});\n    return function (_x4) {\n      return _ref4.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  /* @__PURE__ */ (function () {\n    var _ref5 = babelHelpers.asyncToGenerator(function* ([x]) {});\n    return function (_x5) {\n      return _ref5.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  /* @__PURE__ */ (function () {\n    var _ref6 = babelHelpers.asyncToGenerator(function* ({ x }) {});\n    return function (_x6) {\n      return _ref6.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  (function () {\n    var _ref7 = babelHelpers.asyncToGenerator(function* ([]) {});\n    return function (_x7) {\n      return _ref7.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  (function () {\n    var _ref8 = babelHelpers.asyncToGenerator(function* ({}) {});\n    return function (_x8) {\n      return _ref8.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  /* @__PURE__ */ (function () {\n    var _ref9 = babelHelpers.asyncToGenerator(function* ([]) {});\n    return function (_x9) {\n      return _ref9.apply(this, arguments);\n    };\n  })(),\n);\nfoo(\n  /* @__PURE__ */ (function () {\n    var _ref10 = babelHelpers.asyncToGenerator(function* ({}) {});\n    return function (_x10) {\n      return _ref10.apply(this, arguments);\n    };\n  })(),\n);\nexport default (function () {\n  var _ref11 = babelHelpers.asyncToGenerator(function* ([...x]) {});\n  return function (_x11) {\n    return _ref11.apply(this, arguments);\n  };\n})();",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nexport default function (_x) {\n  return _ref.apply(this, arguments);\n}\nfunction _ref() {\n  _ref = babelHelpers.asyncToGenerator(function* (x) {});\n  return _ref.apply(this, arguments);\n}",
  '',
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  return 2;\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nlet TestClass = {\n  name: 'John Doe',\n  testMethodFailure() {\n    var _this = this;\n    return new Promise(\n      (function () {\n        var _ref = babelHelpers.asyncToGenerator(function* (resolve) {\n          console.log(_this);\n          setTimeout(resolve, 1e3);\n        });\n        return function (_x) {\n          return _ref.apply(this, arguments);\n        };\n      })(),\n    );\n  },\n};",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n(function () {\n  let r1 = false;\n  const p1 = new (class {\n    foo(_x, _x2) {\n      return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);\n    }\n  })()\n    .foo()\n    .catch(e => {\n      r1 = true;\n    });\n  const r2 = [];\n  const p2 = new (class {\n    foo(_x3, _x4) {\n      return babelHelpers\n        .asyncToGenerator(function* (a, { b }) {\n          r2.push(a, b);\n        })\n        .apply(this, arguments);\n    }\n  })().foo(1, { b: 2 });\n  const r3 = [];\n  const p3 = new (class {\n    foo(_x5) {\n      return babelHelpers\n        .asyncToGenerator(function* (\n          a,\n          b = (() => {\n            throw new Error('required');\n          })(),\n        ) {\n          r3.push(a, b);\n        })\n        .apply(this, arguments);\n    }\n  })().foo(1, 2);\n  const r4 = [];\n  const p4 = new (class {\n    foo(_x6) {\n      return babelHelpers\n        .asyncToGenerator(function* (a, ...b) {\n          r4.push(a, b);\n        })\n        .apply(this, arguments);\n    }\n  })().foo(1, 2);\n  const r5 = [];\n  const p5 = new (class {\n    foo(_x7, _x8) {\n      var _arguments = arguments,\n        _this = this;\n      return babelHelpers\n        .asyncToGenerator(function* (a, { b }) {\n          noop(_this, _arguments);\n          r5.push(a, b);\n        })\n        .apply(this, arguments);\n    }\n  })().foo(1, { b: 2 });\n  const r6 = [];\n  const p6 = new (class extends class {\n    get c() {\n      return 'c';\n    }\n  } {\n    foo(_x9, _x10) {\n      var _superprop_getC = () => super.c;\n      return babelHelpers\n        .asyncToGenerator(function* (a, { b }) {\n          r6.push(a, b, _superprop_getC());\n        })\n        .apply(this, arguments);\n    }\n  })().foo(1, { b: 2 });\n  return Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {\n    expect(r1).toBe(true);\n    expect(r2).toEqual([1, 2]);\n    expect(r3).toEqual([1, 2]);\n    expect(r4).toEqual([1, [2]]);\n    expect(r5).toEqual([1, 2]);\n    expect(r6).toEqual([1, 2, 'c']);\n  });\n  function noop() {}\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nnew (class {\n  foo(_x, _x2) {\n    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);\n  }\n})()\n  .foo()\n  .catch(e => {\n    console.log('caught');\n  });\nnew (class {\n  foo(_x3, _x4) {\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });\nnew (class {\n  foo(_x5) {\n    return babelHelpers\n      .asyncToGenerator(function* (\n        a,\n        b = (() => {\n          throw new Error('required');\n        })(),\n      ) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });\nnew (class {\n  foo(_x6) {\n    return babelHelpers\n      .asyncToGenerator(function* (a, ...b) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, 2);\nnew (class {\n  foo(_x7, _x8) {\n    var _arguments = arguments,\n      _this = this;\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(_this, _arguments);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });\nnew (class extends class {\n  get c() {\n    return 'c';\n  }\n} {\n  foo(_x9, _x10) {\n    var _superprop_getC = () => super.c;\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(_superprop_getC());\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nnew (class {\n  foo(_x, _x2) {\n    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);\n  }\n})()\n  .foo()\n  .catch(e => {\n    console.log('caught');\n  });\nnew (class {\n  foo(_x3, _x4) {\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });\nnew (class {\n  foo(_x5) {\n    return babelHelpers\n      .asyncToGenerator(function* (\n        a,\n        b = (() => {\n          throw new Error('required');\n        })(),\n      ) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, 2);\nnew (class {\n  foo(_x6) {\n    return babelHelpers\n      .asyncToGenerator(function* (a, ...b) {\n        console.log(a, b);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, 2);\nnew (class {\n  foo(_x7, _x8) {\n    var _arguments = arguments,\n      _this = this;\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(_this, _arguments);\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });\nnew (class extends class {\n  get c() {\n    return 'c';\n  }\n} {\n  foo(_x9, _x10) {\n    var _superprop_getC = () => super.c;\n    return babelHelpers\n      .asyncToGenerator(function* (a, { b }) {\n        console.log(_superprop_getC());\n      })\n      .apply(this, arguments);\n  }\n})().foo(1, { b: 2 });",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction mandatory(paramName) {\n  throw new Error(`Missing parameter: ${paramName}`);\n}\nfunction foo(_x) {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') }) {\n    return Promise.resolve(b);\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {})();\nbabelHelpers.asyncToGenerator(function* () {}).bind(this)();\nbabelHelpers.asyncToGenerator(function* () {}).call();\nbabelHelpers.asyncToGenerator(function* () {}).apply();\nbabelHelpers.asyncToGenerator(function* () {}).test();",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  yield 'ok';\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  yield 'ok';\n})();\n/* @__PURE__ */ (function () {\n  var _notIIFE = babelHelpers.asyncToGenerator(function* () {\n    yield 'ok';\n  });\n  function notIIFE() {\n    return _notIIFE.apply(this, arguments);\n  }\n  return notIIFE;\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  yield 'not iife';\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nclass Foo {\n  foo() {\n    return babelHelpers.asyncToGenerator(function* () {\n      var wat = yield bar();\n    })();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nclass Foo {\n  one(_x) {\n    return babelHelpers.asyncToGenerator(function* (a, b = 1) {}).apply(this, arguments);\n  }\n  two(_x2, _x3) {\n    return babelHelpers.asyncToGenerator(function* (a, b, ...c) {}).apply(this, arguments);\n  }\n  three(_x4) {\n    return babelHelpers.asyncToGenerator(function* (a, b = 1, c, d = 3) {}).apply(this, arguments);\n  }\n  four(_x5) {\n    return babelHelpers.asyncToGenerator(function* (a, b = 1, c, ...d) {}).apply(this, arguments);\n  }\n  five(_x6, _x7) {\n    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);\n  }\n  six(_x8) {\n    return babelHelpers.asyncToGenerator(function* (a, { b } = {}) {}).apply(this, arguments);\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction s(_x5) {\n  return _s.apply(this, arguments);\n}\nfunction _s() {\n  _s = babelHelpers.asyncToGenerator(function* (x, ...args) {\n    var _arguments = arguments,\n      _this = this;\n    let t = (function () {\n      var _ref2 = babelHelpers.asyncToGenerator(function* (y, a) {\n        let r = (function () {\n          var _ref = babelHelpers.asyncToGenerator(function* (z, b, ...innerArgs) {\n            yield z;\n            console.log(_this, innerArgs, _arguments);\n            return _this.x;\n          });\n          return function r(_x, _x2) {\n            return _ref.apply(this, arguments);\n          };\n        })();\n        yield r();\n        console.log(_this, args, _arguments);\n        return _this.g(r);\n      });\n      return function t(_x3, _x4) {\n        return _ref2.apply(this, arguments);\n      };\n    })();\n    yield t();\n    return this.h(t);\n  });\n  return _s.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n(function () {\n  const log = [];\n  const p1 = babelHelpers.asyncToGenerator(function* () {\n    log.push(1);\n    yield yield null;\n    log.push(2);\n  })();\n  const p2 = babelHelpers.asyncToGenerator(function* () {\n    log.push(3);\n    yield null;\n    log.push(4);\n  })();\n  log.push(5);\n  const p3 = Promise.resolve()\n    .then(() => log.push(6))\n    .then(() => log.push(7));\n  return Promise.all([p1, p2, p3]).then(() => {\n    expect(log).toEqual([1, 3, 5, 4, 6, 2, 7]);\n  });\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction fn() {\n  return _fn.apply(this, arguments);\n}\nfunction _fn() {\n  _fn = babelHelpers.asyncToGenerator(function* () {\n    yield yield 1;\n  });\n  return _fn.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nvar foo = babelHelpers.asyncToGenerator(function* () {\n  var wat = yield bar();\n});\nvar foo2 = babelHelpers.asyncToGenerator(function* () {\n    var wat = yield bar();\n  }),\n  bar = babelHelpers.asyncToGenerator(function* () {\n    var wat = yield foo();\n  });",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction one(_x) {\n  return _one.apply(this, arguments);\n}\nfunction _one() {\n  _one = babelHelpers.asyncToGenerator(function* (a, b = 1) {});\n  return _one.apply(this, arguments);\n}\nfunction two(_x2, _x3) {\n  return _two.apply(this, arguments);\n}\nfunction _two() {\n  _two = babelHelpers.asyncToGenerator(function* (a, b, ...c) {});\n  return _two.apply(this, arguments);\n}\nfunction three(_x4) {\n  return _three.apply(this, arguments);\n}\nfunction _three() {\n  _three = babelHelpers.asyncToGenerator(function* (a, b = 1, c, d = 3) {});\n  return _three.apply(this, arguments);\n}\nfunction four(_x5) {\n  return _four.apply(this, arguments);\n}\nfunction _four() {\n  _four = babelHelpers.asyncToGenerator(function* (a, b = 1, c, ...d) {});\n  return _four.apply(this, arguments);\n}\nfunction five(_x6, _x7) {\n  return _five.apply(this, arguments);\n}\nfunction _five() {\n  _five = babelHelpers.asyncToGenerator(function* (a, { b }) {});\n  return _five.apply(this, arguments);\n}\nfunction six(_x8) {\n  return _six.apply(this, arguments);\n}\nfunction _six() {\n  _six = babelHelpers.asyncToGenerator(function* (a, { b } = {}) {});\n  return _six.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nvar foo = /* @__PURE__ */ (function () {\n  var _bar = babelHelpers.asyncToGenerator(function* () {\n    console.log(bar);\n  });\n  function bar() {\n    return _bar.apply(this, arguments);\n  }\n  return bar;\n})();",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfoo(babelHelpers.asyncToGenerator(function* () {}));\nbar(babelHelpers.asyncToGenerator(function* (x = 1) {}));\nbaz(babelHelpers.asyncToGenerator(function* (...y) {}));",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nclass Class {\n  method() {\n    var _this = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      _this;\n      () => _this;\n      () => {\n        _this;\n        () => _this;\n        function x() {\n          var _this2 = this;\n          this;\n          () => {\n            this;\n          };\n          babelHelpers.asyncToGenerator(function* () {\n            _this2;\n          });\n        }\n      };\n      function x() {\n        var _this3 = this;\n        this;\n        () => {\n          this;\n        };\n        babelHelpers.asyncToGenerator(function* () {\n          _this3;\n        });\n      }\n    })();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nclass Foo extends class {} {\n  method() {\n    var _superprop_getMethod = () => super.method,\n      _this = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      _superprop_getMethod().call(_this);\n      var arrow = () => _superprop_getMethod().call(_this);\n    })();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nlet obj = {\n  a: 123,\n  foo(bar) {\n    return babelHelpers.asyncToGenerator(function* () {\n      return yield baz(bar);\n    })();\n  },\n};",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction foo(_x) {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* (bar) {});\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nimport _Promise from 'somewhere';\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {\n    yield _Promise.resolve();\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nlet _Promise;\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {\n    let Promise;\n    yield bar();\n    function bar() {\n      return _bar.apply(this, arguments);\n    }\n    function _bar() {\n      _bar = babelHelpers.asyncToGenerator(function* () {\n        return Promise.resolve();\n      });\n      return _bar.apply(this, arguments);\n    }\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nlet _Promise;\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {\n    yield new _Promise(resolve => {\n      resolve();\n    });\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {\n    var wat = yield bar();\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  yield foo();\n})();",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nvar foo = babelHelpers.asyncToGenerator(function* () {\n  var wat = yield bar();\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nexport default babelHelpers.asyncToGenerator(function* () {\n  return yield foo();\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nexport default function myFunc() {\n  return _myFunc.apply(this, arguments);\n}\nfunction _myFunc() {\n  _myFunc = babelHelpers.asyncToGenerator(function* () {});\n  return _myFunc.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nimport bar from 'bar';\nexport function foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {});\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nexport function foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {});\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n(function () {\n  return babelHelpers.asyncToGenerator(function* () {\n    let items = [1, 2, 3, 4];\n    let output = [];\n    for (const item of items) {\n      yield f(\n        (function () {\n          var _ref = babelHelpers.asyncToGenerator(function* (x) {\n            output.push(item);\n          });\n          return function (_x) {\n            return _ref.apply(this, arguments);\n          };\n        })(),\n      );\n    }\n    expect(output).toStrictEqual([1, 2, 3, 4]);\n  })();\n  function f(_x2) {\n    return _f.apply(this, arguments);\n  }\n  function _f() {\n    _f = babelHelpers.asyncToGenerator(function* (lambda) {\n      yield lambda();\n    });\n    return _f.apply(this, arguments);\n  }\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  let items = [1, 2, 3, 4];\n  for (const item of items) {\n    yield f(\n      (function () {\n        var _ref = babelHelpers.asyncToGenerator(function* (x) {\n          console.log(item);\n        });\n        return function (_x) {\n          return _ref.apply(this, arguments);\n        };\n      })(),\n    );\n  }\n})();\nfunction f(_x2) {\n  return _f.apply(this, arguments);\n}\nfunction _f() {\n  _f = babelHelpers.asyncToGenerator(function* (lambda) {\n    yield lambda();\n  });\n  return _f.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nbabelHelpers.asyncToGenerator(function* () {\n  return yield promise;\n});\nbabelHelpers.asyncToGenerator(function* () {\n  yield promise;\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n(function () {\n  'use strict';\n  function mandatory(paramName) {\n    throw new Error(`Missing parameter: ${paramName}`);\n  }\n  function foo() {\n    return _foo.apply(this, arguments);\n  }\n  function _foo() {\n    _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') } = {}) {\n      return Promise.resolve(b);\n    });\n    return _foo.apply(this, arguments);\n  }\n  return foo().then(\n    () => {\n      throw new Error('should not occur');\n    },\n    () => true,\n  );\n});",
  "'use strict';\nvar babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction mandatory(paramName) {\n  throw new Error(`Missing parameter: ${paramName}`);\n}\nfunction foo(_x) {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') }) {\n    return Promise.resolve(b);\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nconst title = 'Neem contact op';\nfunction action() {\n  return _action.apply(this, arguments);\n}\nfunction _action() {\n  _action = babelHelpers.asyncToGenerator(function* () {\n    return <Contact title={title} />;\n  });\n  return _action.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n(function () {\n  let log = [];\n  let resolve;\n  const main = new Promise(r => {\n    resolve = r;\n  });\n  /* @__PURE__ */ (function () {\n    var _poll = babelHelpers.asyncToGenerator(function* (count) {\n      log.push(yield Promise.resolve(count));\n      if (count < 3) setTimeout(poll, 10, count + 1);\n      else resolve();\n    });\n    function poll(_x) {\n      return _poll.apply(this, arguments);\n    }\n    return poll;\n  })()(0);\n  return main.then(() => {\n    expect(log).toEqual([0, 1, 2, 3]);\n  });\n});",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n/* @__PURE__ */ (function () {\n  var _poll = babelHelpers.asyncToGenerator(function* () {\n    console.log(yield Promise.resolve('Hello'));\n    setTimeout(poll, 1e3);\n  });\n  function poll() {\n    return _poll.apply(this, arguments);\n  }\n  return poll;\n})()();",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfoo();\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {});\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nclass Test {\n  static method1() {\n    var _this = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      console.log(_this);\n      setTimeout(\n        babelHelpers.asyncToGenerator(function* () {\n          console.log(_this);\n        }),\n      );\n    })();\n  }\n  static method2() {\n    var _this2 = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      console.log(_this2);\n      setTimeout(\n        (function () {\n          var _ref = babelHelpers.asyncToGenerator(function* (arg) {\n            console.log(_this2);\n          });\n          return function (_x) {\n            return _ref.apply(this, arguments);\n          };\n        })(),\n      );\n    })();\n  }\n  method1() {\n    var _this3 = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      console.log(_this3);\n      setTimeout(\n        babelHelpers.asyncToGenerator(function* () {\n          console.log(_this3);\n        }),\n      );\n    })();\n  }\n  method2() {\n    var _this4 = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      console.log(_this4);\n      setTimeout(\n        (function () {\n          var _ref2 = babelHelpers.asyncToGenerator(function* (arg) {\n            console.log(_this4);\n          });\n          return function (_x2) {\n            return _ref2.apply(this, arguments);\n          };\n        })(),\n      );\n    })();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction f() {\n  g(\n    babelHelpers.asyncToGenerator(function* () {\n      c(() => this);\n    }),\n  );\n}\nbabelHelpers\n  .asyncToGenerator(function* () {\n    console.log('async wrapper:', this === 'foo');\n    (() => {\n      console.log('nested arrow:', this === 'foo');\n    })();\n  })\n  .call('foo');",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nvar concat = (function () {\n  var _ref = babelHelpers.asyncToGenerator(function* (...args) {\n    var x = args[0];\n    var y = args[1];\n  });\n  return function concat() {\n    return _ref.apply(this, arguments);\n  };\n})();\nexpect(concat.name).toBe('concat');",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction foo() {\n  return _foo.apply(this, arguments);\n}\nfunction _foo() {\n  _foo = babelHelpers.asyncToGenerator(function* () {\n    /* @__PURE__ */ (function () {\n      var _ref = babelHelpers.asyncToGenerator(function* (number) {\n        const tmp = number;\n      });\n      return function (_x) {\n        return _ref.apply(this, arguments);\n      };\n    })();\n  });\n  return _foo.apply(this, arguments);\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\n// Angular needs to always compile async functions, even if\n// the targets support class fields.\n// https://github.com/babel/babel/issues/14749\nclass A {\n  a = (() => {\n    var _this = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      return _this;\n    });\n  })();\n  b = (() => {\n    var _this2 = this;\n    return (function () {\n      var _ref = babelHelpers.asyncToGenerator(function* (x, y, z) {\n        return _this2;\n      });\n      return function (_x, _x2, _x3) {\n        return _ref.apply(this, arguments);\n      };\n    })();\n  })();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nfunction f() {\n  var _this = this;\n  let g = (function () {\n    var _ref = babelHelpers.asyncToGenerator(function* () {\n      _this;\n    });\n    return function g() {\n      return _ref.apply(this, arguments);\n    };\n  })();\n}\nclass Class {\n  m() {\n    var _this2 = this;\n    return babelHelpers.asyncToGenerator(function* () {\n      var c = (function () {\n        var _ref2 = babelHelpers.asyncToGenerator(function* (b) {\n          _this2;\n        });\n        return function c(_x) {\n          return _ref2.apply(this, arguments);\n        };\n      })();\n    })();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      asyncToGenerator: function (r, u) {\n        function x(i, f, p, o, a, s, e) {\n          try {\n            var n = i[s](e),\n              t = n.value;\n          } catch (d) {\n            return void p(d);\n          }\n          n.done ? f(t) : Promise.resolve(t).then(o, a);\n        }\n        function h(i) {\n          return function () {\n            var f = this,\n              p = arguments;\n            return new Promise(function (o, a) {\n              var s = i.apply(f, p);\n              function e(t) {\n                x(s, o, a, e, n, 'next', t);\n              }\n              function n(t) {\n                x(s, o, a, e, n, 'throw', t);\n              }\n              e(void 0);\n            });\n          };\n        }\n        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));\n      },\n    },\n    c = {};\n  function v(r) {\n    if (c[r]) return c[r].exports;\n    var u = (c[r] = { exports: {} });\n    return (y[r](u, v), u.exports);\n  }\n  return { asyncToGenerator: v('asyncToGenerator') };\n})();\nvar a = (function () {\n  var _ref = babelHelpers.asyncToGenerator(function* (b) {});\n  return function a(_x) {\n    return _ref.apply(this, arguments);\n  };\n})();\nexpect(a.length).toBe(1);",
] as const;

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength true — basic (input)',
    source:
      'foo(async (x) => {});\nfoo(async ([x]) => {});\nfoo(async ({ x }) => {});\n\nfoo(async function (x) {});\nfoo(async function ([x]) {});\nfoo(async function ({ x }) {});\n\nfoo(async ([]) => {});\nfoo(async ({}) => {});\n\nfoo(async function ([]) {});\nfoo(async function ({}) {});\n\nexport default async ([...x]) => {};\n\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength true — export default function (input)',
    source: 'export default async function (x) {}',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — basic (exec)',
    source: '',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — basic (input)',
    source: 'async () => 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — bluebird (input)',
    source: '',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'async to generator — async arrow in method (input)',
    source:
      'let TestClass = {\n  name: "John Doe",\n\n  testMethodFailure() {\n    return new Promise(async (resolve) => {\n      console.log(this);\n      setTimeout(resolve, 1000);\n    });\n  }\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'async to generator — async complex params destructuring (exec)',
    source:
      '(function () {\nlet r1 = false;\nconst p1 = (new class {\n  async foo(a, { b }) { }\n})\n  .foo()\n  .catch(e => {\n    r1 = true;\n  });\n\nconst r2 = [];\nconst p2 = (new class {\n  async foo(a, { b }) {\n    r2.push(a, b);\n  }\n})\n  .foo(1, { b: 2 });\n\nconst r3 = [];\nconst p3 = (new class {\n  async foo(a, b = (() => { throw new Error("required") })()) {\n    r3.push(a, b);\n  }\n})\n  .foo(1, 2);\n\nconst r4 = [];\nconst p4 = (new class {\n  async foo(a, ...b) {\n    r4.push(a, b);\n  }\n})\n  .foo(1, 2);\n\nconst r5 = [];\nconst p5 = (new class {\n  async foo(a, { b }) {\n    noop(this, arguments);\n    r5.push(a, b);\n  }\n})\n  .foo(1, { b: 2 });\n\nconst r6 = [];\nconst p6 = (new class extends class { get c() { return "c"; } } {\n  async foo(a, { b }) {\n    r6.push(a, b, super.c);\n  }\n})\n  .foo(1, { b: 2 });\n\n\nreturn Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {\n  expect(r1).toBe(true);\n  expect(r2).toEqual([1, 2]);\n  expect(r3).toEqual([1, 2]);\n  expect(r4).toEqual([1, [2]]);\n  expect(r5).toEqual([1, 2]);\n  expect(r6).toEqual([1, 2, "c"]);\n});\n\nfunction noop() { }\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'async to generator — async complex params destructuring (input)',
    source:
      '(new class {\n  async foo(a, { b }) { }\n})\n  .foo()\n  .catch(e => {\n    console.log("caught");\n  });\n\n(new class {\n  async foo(a, { b }) {\n    console.log(a, b);\n  }\n})\n  .foo(1, { b: 2 });\n\n(new class {\n  async foo(a, b = (() => { throw new Error("required") })()) {\n    console.log(a, b);\n  }\n})\n  .foo(1, { b: 2 });\n\n(new class {\n  async foo(a, ...b) {\n    console.log(a, b);\n  }\n})\n  .foo(1, 2);\n\n(new class {\n  async foo(a, { b }) {\n    console.log(this, arguments);\n  }\n})\n  .foo(1, { b: 2 });\n\n\n(new class extends class { get c() { return "c"; } } {\n  async foo(a, { b }) {\n    console.log(super.c);\n  }\n})\n  .foo(1, { b: 2 });\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'async to generator — async complex params (input)',
    source:
      '(new class {\n  async foo(a, { b }) { }\n})\n  .foo()\n  .catch(e => {\n    console.log("caught");\n  });\n\n(new class {\n  async foo(a, { b }) {\n    console.log(a, b);\n  }\n})\n  .foo(1, { b: 2 });\n\n(new class {\n  async foo(a, b = (() => { throw new Error("required") })()) {\n    console.log(a, b);\n  }\n})\n  .foo(1, 2);\n\n(new class {\n  async foo(a, ...b) {\n    console.log(a, b);\n  }\n})\n  .foo(1, 2);\n\n(new class {\n  async foo(a, { b }) {\n    console.log(this, arguments);\n  }\n})\n  .foo(1, { b: 2 });\n\n\n(new class extends class { get c() { return "c"; } } {\n  async foo(a, { b }) {\n    console.log(super.c);\n  }\n})\n  .foo(1, { b: 2 });\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'async to generator — async default arguments (input)',
    source:
      'function mandatory(paramName) {\n  throw new Error(`Missing parameter: ${paramName}`);\n}\n\nasync function foo({ a, b = mandatory("b") }) {\n  return Promise.resolve(b);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'async to generator — async iife apply call no pure (input)',
    source:
      '(async function() {\n})();\n\n(async function() {\n}).bind(this)();\n\n(async function() {\n}).call();\n\n(async function() {\n}).apply();\n\n(async function() {\n}).test();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'async to generator — async iife with regenerator spec (input)',
    source:
      "(async function() { await 'ok' })();\n(async () => { await 'ok' })();\n(async function notIIFE() { await 'ok' });\n(async () => { await 'not iife' });\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'async to generator — async (input)',
    source: 'class Foo {\n  async foo() {\n    var wat = await bar();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'async to generator — class method arity ignore length (input)',
    source:
      'class Foo {\n  async one(a, b = 1) {}\n  async two(a, b, ...c) {}\n  async three(a, b = 1, c, d = 3) {}\n  async four(a, b = 1, c, ...d) {}\n  async five(a, { b }) {}\n  async six(a, { b } = {}) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'async to generator — deeply nested asyncs (input)',
    source:
      'async function s(x, ...args) {\n  let t = async (y, a) => {\n    let r = async (z, b, ...innerArgs) =>  {\n      await z;\n      console.log(this, innerArgs, arguments);\n      return this.x;\n    }\n    await r();\n\n    console.log(this, args, arguments);\n    return this.g(r);\n  }\n\n  await t();\n  return this.h(t);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'async to generator — double await (exec)',
    source:
      '(function () {\nconst log = [];\n\nconst p1 = (async function () {\n  log.push(1);\n  await await null;\n  log.push(2);\n})();\n\nconst p2 = (async function () {\n  log.push(3);\n  await null;\n  log.push(4);\n})();\n\nlog.push(5);\nconst p3 = Promise.resolve().then(() => log.push(6)).then(() => log.push(7));\n\nreturn Promise.all([p1, p2, p3]).then(() => {\n  expect(log).toEqual([1, 3, 5, 4, 6, 2, 7]);\n});\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'async to generator — double await (input)',
    source: 'async function fn() {\n  await await 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'async to generator — expression (input)',
    source:
      'var foo = async function () {\n  var wat = await bar();\n};\n\nvar foo2 = async function () {\n  var wat = await bar();\n},\nbar = async function () {\n  var wat = await foo();\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'async to generator — function arity (input)',
    source:
      'async function one(a, b = 1) {}\nasync function two(a, b, ...c) {}\nasync function three(a, b = 1, c, d = 3) {}\nasync function four(a, b = 1, c, ...d) {}\nasync function five(a, {b}){}\nasync function six(a, {b} = {}){}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'async to generator — named expression (input)',
    source: 'var foo = async function bar() {\n  console.log(bar);\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'async to generator — no parameters and no id (input)',
    source:
      'foo(async function () {\n  \n});\n\nbar(async function (x = 1) {\n  \n});\n\nbaz(async function (...y) {\n  \n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'async to generator — object method with arrows (input)',
    source:
      'class Class {\n  async method() {\n    this;\n    () => this;\n    () => {\n      this;\n      () => this;\n      function x() {\n        this;\n        () => {this}\n        async () => {this}\n      }\n    }\n    function x() {\n      this;\n      () => {this}\n      async () => {this}\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'async to generator — object method with super (input)',
    source:
      'class Foo extends class {} {\n  async method() {\n    super.method();\n\n    var arrow = () => super.method();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'async to generator — object method (input)',
    source: 'let obj = {\n  a: 123,\n  async foo(bar) {\n    return await baz(bar);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'async to generator — parameters (input)',
    source: 'async function foo(bar) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise import (input)',
    source:
      "import Promise from 'somewhere';\n\nasync function foo() {\n  await Promise.resolve();\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise nested (input)',
    source:
      'let Promise;\n\nasync function foo() {\n  let Promise;\n\n  await bar();\n\n  async function bar() {\n    return Promise.resolve();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise (input)',
    source:
      'let Promise;\nasync function foo() {\n  await new Promise(resolve => { resolve() });\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'async to generator — statement (input)',
    source: 'async function foo() {\n  var wat = await bar();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'bluebird coroutines — arrow function (input)',
    source: '(async () => { await foo(); })()\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'bluebird coroutines — expression (input)',
    source: 'var foo = async function () {\n  var wat = await bar();\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'export async — default arrow export (input)',
    source: 'export default async () => { return await foo(); }\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'export async — default export (input)',
    source: 'export default async function myFunc() {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'export async — import and export (input)',
    source: "import bar from 'bar';\n\nexport async function foo () { }\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'export async — lone export (input)',
    source: 'export async function foo () { }\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'regression — 15978 (exec)',
    source:
      '(function () {\nreturn (async function () {\n  let items = [1, 2, 3, 4];\n  let output = [];\n  for (const item of items) {\n    await f(async (x) => {\n      output.push(item);\n    });\n  }\n  expect(output).toStrictEqual([1, 2, 3, 4]);\n})();\n\nasync function f(lambda) {\n  await lambda();\n}\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'regression — 15978 (input)',
    source:
      '(async function () {\n  let items = [1, 2, 3, 4];\n  for (const item of items) {\n    await f(async (x) => {\n      console.log(item);\n    });\n  }\n})();\n\nasync function f(lambda) {\n  await lambda();\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'regression — 4599 (input)',
    source: 'async () => await promise\n\nasync () => { await promise }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'regression — 4943 (exec)',
    source:
      '(function () {\n"use strict";\n\nfunction mandatory(paramName) {\n  throw new Error(`Missing parameter: ${paramName}`);\n}\n\nasync function foo({ a, b = mandatory("b") } = {}) {\n  return Promise.resolve(b);\n}\n\nreturn foo().then(() => {\n  throw new Error(\'should not occur\');\n}, () => true);\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'regression — 4943 (input)',
    source:
      '"use strict";\n\nfunction mandatory(paramName) {\n  throw new Error(`Missing parameter: ${paramName}`);\n}\n\nasync function foo({ a, b = mandatory("b") }) {\n  return Promise.resolve(b);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'regression — 7178 (input)',
    source:
      'const title = "Neem contact op";\n\nasync function action() {\n  return <Contact title={title} />;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
          jsx: 'preserve',
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'regression — 8783 (exec)',
    source:
      '(function () {\nlet log = [];\n\nlet resolve;\nconst main = new Promise(r => { resolve = r });\n\n(async function poll(count) {\n  log.push(await Promise.resolve(count))\n  if (count < 3) setTimeout(poll, 10, count + 1);\n  else resolve();\n})(0)\n\nreturn main.then(() => {\n  expect(log).toEqual([0, 1, 2, 3]);\n});\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'regression — 8783 (input)',
    source:
      "(async function poll() {\n  console.log(await Promise.resolve('Hello'))\n  setTimeout(poll, 1000);\n})();",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'regression — T6882 (exec)',
    source: 'foo();\n\nasync function foo() {}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'regression — T7108 (input)',
    source:
      'class Test{\n  static async method1() {\n    console.log(this);\n\n    setTimeout(async () => {\n      console.log(this);\n    });\n  }\n\n  static async method2() {\n    console.log(this);\n\n    setTimeout(async (arg) => {\n      console.log(this);\n    });\n  }\n\n  async method1() {\n    console.log(this);\n\n    setTimeout(async () => {\n      console.log(this);\n    });\n  }\n\n  async method2() {\n    console.log(this);\n\n    setTimeout(async (arg) => {\n      console.log(this);\n    });\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'regression — T7194 (input)',
    source:
      "function f() {\n  g(async function() {\n    c(() => this);\n  });\n}\n\n(async function () {\n  console.log('async wrapper:', this === 'foo')\n\n  ;(() => {\n    console.log('nested arrow:', this === 'foo')\n  })()\n}).call('foo')\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'regression — fn name (exec)',
    source:
      'var concat = async (...args) => {\n  var x = args[0];\n  var y = args[1];\n};\nexpect(concat.name).toBe("concat");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'regression — gh 6923 (input)',
    source: 'async function foo() {\n\t(async function (number) {\n\t\tconst tmp = number\n\t})\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'regression — in uncompiled class fields (input)',
    source:
      '// Angular needs to always compile async functions, even if\n// the targets support class fields.\n// https://github.com/babel/babel/issues/14749\n\nclass A {\n  a = async () => this;\n  b = async (x, y, z) => this;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'regression — regression 2765 (input)',
    source:
      'function f() {\n  let g = async () => {\n    this;\n  };\n}\n\nclass Class {\n  async m() {\n    var c = async (b) => {\n      this\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'regression — test262 fn length (exec)',
    source: 'var a = async (b) => {}\nexpect(a.length).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[49],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
