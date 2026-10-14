import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nasync function fn() {\n  await 0;\n  try {\n    var _usingCtx = babelHelpers.usingCtx();\n    const x = _usingCtx.a(y);\n    await 1;\n  } catch (_) {\n    _usingCtx.e = _;\n  } finally {\n    await _usingCtx.d();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nimport { doSomething } from 'somewhere';\nexport * from 'somewhere else';\nexport * as ns from 'somewhere else';\nfunction f() {\n  a;\n  B;\n}\nfunction h() {\n  b;\n  A;\n}\nexport function g() {\n  c;\n}\nexport { f };\nexport { b };\nexport { B };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  doSomething();\n  var { b } = {};\n  var c = 2;\n  var A = class A {};\n  var B = class B {};\n  var x = _usingCtx.u(null);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const x = _usingCtx.u(fn());\n  doSomethingWith(x);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nfor (const _x of it)\n  try {\n    var _usingCtx = babelHelpers.usingCtx();\n    const x = _usingCtx.u(_x);\n    doSomethingWith(x);\n  } catch (_) {\n    _usingCtx.e = _;\n  } finally {\n    _usingCtx.d();\n  }",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nfunction f() {\n  switch (v) {\n    case 0:\n      try {\n        var _usingCtx = babelHelpers.usingCtx();\n        const x = _usingCtx.u(0);\n      } catch (_) {\n        _usingCtx.e = _;\n      } finally {\n        _usingCtx.d();\n      }\n      break;\n    default:\n      try {\n        var _usingCtx2 = babelHelpers.usingCtx();\n        const y = _usingCtx2.u(1);\n      } catch (_) {\n        _usingCtx2.e = _;\n      } finally {\n        _usingCtx2.d();\n      }\n      break;\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  before;\n  var x = _usingCtx.u(fn());\n  doSomethingWith(x);\n  after;\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const a = _usingCtx.u(1);\n  const b = _usingCtx.a(2);\n  const c = _usingCtx.u(3);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  await _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const x = _usingCtx.a(obj);\n  stmt;\n  const y = _usingCtx.a(obj),\n    z = _usingCtx.a(obj);\n  doSomethingWith(x, y);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  await _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nasync function f() {\n  switch (v) {\n    case 0:\n      try {\n        var _usingCtx = babelHelpers.usingCtx();\n        const x = _usingCtx.a(0);\n      } catch (_) {\n        _usingCtx.e = _;\n      } finally {\n        await _usingCtx.d();\n      }\n      break;\n    default:\n      try {\n        var _usingCtx2 = babelHelpers.usingCtx();\n        const y = _usingCtx2.a(1);\n      } catch (_) {\n        _usingCtx2.e = _;\n      } finally {\n        await _usingCtx2.d();\n      }\n      break;\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const x = _usingCtx.u(obj);\n  doSomethingWith(x);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  '[syntax-error] invalid-input',
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nlet log = [];\n{\n  for (const _x of [null])\n    try {\n      var _usingCtx = babelHelpers.usingCtx();\n      const x = _usingCtx.u(_x);\n      {\n        const x = undefined;\n        log.push(x);\n      }\n    } catch (_) {\n      _usingCtx.e = _;\n    } finally {\n      _usingCtx.d();\n    }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nfor (const _x of y)\n  try {\n    var _usingCtx = babelHelpers.usingCtx();\n    const x = _usingCtx.u(_x);\n    doSomethingWith(x);\n  } catch (_) {\n    _usingCtx.e = _;\n  } finally {\n    _usingCtx.d();\n  }",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nfunction fn() {\n  try {\n    var _usingCtx = babelHelpers.usingCtx();\n    const x = _usingCtx.u(obj);\n    return doSomethingWith(x);\n  } catch (_) {\n    _usingCtx.e = _;\n  } finally {\n    _usingCtx.d();\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nif (test)\n  try {\n    var _usingCtx = babelHelpers.usingCtx();\n    const x = _usingCtx.u(obj);\n    doSomethingWith(x);\n  } catch (_) {\n    _usingCtx.e = _;\n  } finally {\n    _usingCtx.d();\n  }",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const x = _usingCtx.u(obj);\n  try {\n    var _usingCtx2 = babelHelpers.usingCtx();\n    const y = _usingCtx2.u(\n      call(() => {\n        try {\n          var _usingCtx3 = babelHelpers.usingCtx();\n          const z = _usingCtx3.u(obj);\n          return z;\n        } catch (_) {\n          _usingCtx3.e = _;\n        } finally {\n          _usingCtx3.d();\n        }\n      }),\n    );\n    stmt;\n  } catch (_) {\n    _usingCtx2.e = _;\n  } finally {\n    _usingCtx2.d();\n  }\n  stmt;\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  stmt;\n  const x = _usingCtx.u(obj);\n  stmt;\n  const y = _usingCtx.u(obj),\n    z = _usingCtx.u(obj);\n  stmt;\n  const w = _usingCtx.u(obj);\n  doSomethingWith(x, z);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nlet log = [];\nlet Symbol$dispose = Symbol.dispose || Symbol.for('Symbol.dispose');\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  const foo = _usingCtx.u(\n    class {\n      static [Symbol$dispose]() {\n        log.push(`${foo.name} is disposed`);\n      }\n    },\n  );\n  log.push(foo.name);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nclass A {\n  static {\n    try {\n      var _usingCtx = babelHelpers.usingCtx();\n      const x = _usingCtx.u(y);\n      doSomethingWith(x);\n    } catch (_) {\n      _usingCtx.e = _;\n    } finally {\n      _usingCtx.d();\n    }\n  }\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { x, y };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var x = _usingCtx.u(A);\n  var y = _usingCtx.a(B);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  await _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { _default as default };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var x = _usingCtx.u(null);\n  var _default = class {};\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { C as default };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var x = _usingCtx.u(null);\n  var C = class C {};\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { _default as default };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var x = _usingCtx.u(null);\n  var _default = doSomething();\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport default function fn() {}\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var x = _usingCtx.u(null);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { A };\nexport { B };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var A = class A {\n    static get self() {\n      return A;\n    }\n  };\n  var x = _usingCtx.u(null);\n  var B = class B {\n    static get self() {\n      return B;\n    }\n  };\n  var AO = A,\n    BO = B;\n  A = B = null;\n  expect(AO.self).toBe(AO);\n  expect(BO.self).toBe(BO);\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
  "var babelHelpers = (() => {\n  var y = {\n      usingCtx: function (n, l) {\n        function v() {\n          var b =\n              typeof SuppressedError == 'function'\n                ? SuppressedError\n                : function (t, r) {\n                    var e = Error();\n                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);\n                  },\n            i = {},\n            u = [];\n          function d(t, r) {\n            if (r != null) {\n              if (Object(r) !== r)\n                throw new TypeError(\n                  'using declarations can only be used with objects, functions, null, or undefined.',\n                );\n              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];\n              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))\n                var o = e;\n              if (typeof e != 'function') throw new TypeError('Object is not disposable.');\n              (o &&\n                (e = function () {\n                  try {\n                    o.call(r);\n                  } catch (f) {\n                    return Promise.reject(f);\n                  }\n                }),\n                u.push({ v: r, d: e, a: t }));\n            } else t && u.push({ d: r, a: t });\n            return r;\n          }\n          return {\n            e: i,\n            u: d.bind(null, !1),\n            a: d.bind(null, !0),\n            d: function () {\n              var r,\n                e = this.e,\n                o = 0;\n              function s() {\n                for (; (r = u.pop());)\n                  try {\n                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));\n                    if (r.d) {\n                      var c = r.d.call(r.v);\n                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));\n                    } else o |= 1;\n                  } catch (h) {\n                    return f(h);\n                  }\n                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();\n                if (e !== i) throw e;\n              }\n              function f(c) {\n                return ((e = e !== i ? new b(c, e) : c), s());\n              }\n              return s();\n            },\n          };\n        }\n        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));\n      },\n    },\n    p = {};\n  function a(n) {\n    if (p[n]) return p[n].exports;\n    var l = (p[n] = { exports: {} });\n    return (y[n](l, a), l.exports);\n  }\n  return { usingCtx: a('usingCtx') };\n})();\nexport { A };\nexport { B };\ntry {\n  var _usingCtx = babelHelpers.usingCtx();\n  var A = class A {\n    static get self() {\n      return A;\n    }\n  };\n  var x = _usingCtx.u(null);\n  var B = class B {\n    static get self() {\n      return B;\n    }\n  };\n  A = B = null;\n} catch (_) {\n  _usingCtx.e = _;\n} finally {\n  _usingCtx.d();\n}",
] as const;

export const fixtureCases = [
  {
    title: 'integration — async to generator (input)',
    source:
      'async function fn() {\n  await 0;\n  {\n    await using x = y;\n    await 1;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'integration — commonjs transform (input)',
    source:
      'import { doSomething } from "somewhere";\nexport * from "somewhere else";\nexport * as ns from "somewhere else";\n\nfunction f() { a; B; }\nfunction h() { b; A; }\nexport function g() { c; }\n\ndoSomething();\n\nexport { f };\nexport let { b } = {};\n\nlet c = 2;\nclass A {}\nexport class B {}\n\nusing x = null;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'source maps — block (input)',
    source: '{\n  using x = fn();\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'source maps — for of (input)',
    source: 'for (using x of it) {\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'source maps — switch (input)',
    source:
      'function f() {\n  switch (v) {\n    case 0:\n      {\n        using x = 0;\n      }\n      break;\n    default:\n      {\n        using y = 1;\n      }\n      break;\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'source maps — top level (input)',
    source: 'before;\nusing x = fn();\ndoSomethingWith(x);\nafter;\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform await — mixed (input)',
    source: '{\n  using a = 1;\n  await using b = 2;\n  using c = 3;\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform await — only using await (input)',
    source:
      '{\n  await using x = obj;\n  stmt;\n  await using y = obj, z = obj;\n  doSomethingWith(x, y);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform await — switch (input)',
    source:
      'async function f() {\n  switch (v) {\n    case 0:\n      {\n        await using x = 0;\n      }\n      break;\n    default:\n      {\n        await using y = 1;\n      }\n      break;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — bare block (input)',
    source: '{\n  using x = obj;\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — for await head (input)',
    source: 'for await (using x of y) {\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — for head shadow (input)',
    source:
      'let log = [];\n{\n  for (using x of [null]) {\n    const x = undefined;\n    log.push(x);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — for head (input)',
    source: 'for (using x of y) {\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — function body (input)',
    source: 'function fn() {\n  using x = obj;\n  return doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — if body (input)',
    source: 'if (test) {\n  using x = obj;\n  doSomethingWith(x);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — invalid switch bare case (input)',
    source:
      'function f() {\n  switch (v) {\n    case 0:\n      using x = 0;\n      break;\n    default:\n      using y = 1;\n      break;\n  };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — multiple nested (input)',
    source:
      '{\n  using x = obj;\n  {\n    using y = call(() => {\n      using z = obj;\n      return z;\n    });\n    stmt;\n  }\n  stmt;\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — multiple same level (input)',
    source:
      '{\n  stmt;\n  using x = obj;\n  stmt;\n  using y = obj, z = obj;\n  stmt;\n  using w = obj;\n  doSomethingWith(x, z);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — named evaluation (input)',
    source:
      'let log = [];\nlet Symbol$dispose = Symbol.dispose || Symbol.for("Symbol.dispose");\n{\n  using foo = class { static [Symbol$dispose]() { log.push(`${foo.name} is disposed`) } }\n  log.push(foo.name);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform sync — static block (input)',
    source: 'class A {\n  static {\n    using x = y;\n    doSomethingWith(x);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — await or not preserved (input)',
    source: 'using x = A;\nawait using y = B;\n\nexport { x, y };\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting default clas anon (input)',
    source: 'using x = null;\nexport default class {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting default class (input)',
    source: 'using x = null;\nexport default class C {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting default expr (input)',
    source: 'using x = null;\nexport default doSomething();\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting default fn anon (input)',
    source: 'using x = null;\nexport default function fn() {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting mutate outer class binding (exec)',
    source:
      'export class A { static get self() { return A } }\n\nusing x = null;\n\nexport class B { static get self() { return B } }\n\nconst AO = A, BO = B;\nA = B = null;\n\nexpect(AO.self).toBe(AO);\nexpect(BO.self).toBe(BO);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting mutate outer class binding (input)',
    source:
      'export class A { static get self() { return A } }\n\nusing x = null;\n\nexport class B { static get self() { return B } }\n\nA = B = null;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
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
    title: 'transform top level — hoisting (input)',
    source:
      'import { doSomething } from "somewhere";\nexport * from "somewhere else";\nexport * as ns from "somewhere else";\n\nfunction f() { a; B; }\nfunction h() { b; A; }\nexport function g() { c; }\n\ndoSomething();\n\nexport { f };\nexport let { b } = {};\n\nlet c = 2;\nclass A {}\nexport class B {}\n\nusing x = null;\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            explicitResourceManagement: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
