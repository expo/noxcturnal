import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'integration — async to generator (input)',
    source: `async function fn() {
  await 0;
  {
    await using x = y;
    await 1;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
async function fn() {
  await 0;
  try {
    var _usingCtx = babelHelpers.usingCtx();
    const x = _usingCtx.a(y);
    await 1;
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    await _usingCtx.d();
  }
}`,
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
      },
    ],
  },
  {
    title: 'integration — commonjs transform (input)',
    source: `import { doSomething } from "somewhere";
export * from "somewhere else";
export * as ns from "somewhere else";

function f() { a; B; }
function h() { b; A; }
export function g() { c; }

doSomething();

export { f };
export let { b } = {};

let c = 2;
class A {}
export class B {}

using x = null;
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
import { doSomething } from 'somewhere';
export * from 'somewhere else';
export * as ns from 'somewhere else';
function f() {
  a;
  B;
}
function h() {
  b;
  A;
}
export function g() {
  c;
}
export { f };
export { b };
export { B };
try {
  var _usingCtx = babelHelpers.usingCtx();
  doSomething();
  var { b } = {};
  var c = 2;
  var A = class A {};
  var B = class B {};
  var x = _usingCtx.u(null);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'source maps — block (input)',
    source: `{
  using x = fn();
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  const x = _usingCtx.u(fn());
  doSomethingWith(x);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'source maps — for of (input)',
    source: `for (using x of it) {
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
for (const _x of it)
  try {
    var _usingCtx = babelHelpers.usingCtx();
    const x = _usingCtx.u(_x);
    doSomethingWith(x);
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    _usingCtx.d();
  }`,
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
      },
    ],
  },
  {
    title: 'source maps — switch (input)',
    source: `function f() {
  switch (v) {
    case 0:
      {
        using x = 0;
      }
      break;
    default:
      {
        using y = 1;
      }
      break;
  };
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
function f() {
  switch (v) {
    case 0:
      try {
        var _usingCtx = babelHelpers.usingCtx();
        const x = _usingCtx.u(0);
      } catch (_) {
        _usingCtx.e = _;
      } finally {
        _usingCtx.d();
      }
      break;
    default:
      try {
        var _usingCtx2 = babelHelpers.usingCtx();
        const y = _usingCtx2.u(1);
      } catch (_) {
        _usingCtx2.e = _;
      } finally {
        _usingCtx2.d();
      }
      break;
  }
}`,
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
      },
    ],
  },
  {
    title: 'source maps — top level (input)',
    source: `before;
using x = fn();
doSomethingWith(x);
after;
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  before;
  var x = _usingCtx.u(fn());
  doSomethingWith(x);
  after;
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform await — mixed (input)',
    source: `{
  using a = 1;
  await using b = 2;
  using c = 3;
}`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  const a = _usingCtx.u(1);
  const b = _usingCtx.a(2);
  const c = _usingCtx.u(3);
} catch (_) {
  _usingCtx.e = _;
} finally {
  await _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform await — only using await (input)',
    source: `{
  await using x = obj;
  stmt;
  await using y = obj, z = obj;
  doSomethingWith(x, y);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  const x = _usingCtx.a(obj);
  stmt;
  const y = _usingCtx.a(obj),
    z = _usingCtx.a(obj);
  doSomethingWith(x, y);
} catch (_) {
  _usingCtx.e = _;
} finally {
  await _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform await — switch (input)',
    source: `async function f() {
  switch (v) {
    case 0:
      {
        await using x = 0;
      }
      break;
    default:
      {
        await using y = 1;
      }
      break;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
async function f() {
  switch (v) {
    case 0:
      try {
        var _usingCtx = babelHelpers.usingCtx();
        const x = _usingCtx.a(0);
      } catch (_) {
        _usingCtx.e = _;
      } finally {
        await _usingCtx.d();
      }
      break;
    default:
      try {
        var _usingCtx2 = babelHelpers.usingCtx();
        const y = _usingCtx2.a(1);
      } catch (_) {
        _usingCtx2.e = _;
      } finally {
        await _usingCtx2.d();
      }
      break;
  }
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — bare block (input)',
    source: `{
  using x = obj;
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  const x = _usingCtx.u(obj);
  doSomethingWith(x);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — for await head (input)',
    source: `for await (using x of y) {
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'transform sync — for head shadow (input)',
    source: `let log = [];
{
  for (using x of [null]) {
    const x = undefined;
    log.push(x);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
let log = [];
{
  for (const _x of [null])
    try {
      var _usingCtx = babelHelpers.usingCtx();
      const x = _usingCtx.u(_x);
      {
        const x = undefined;
        log.push(x);
      }
    } catch (_) {
      _usingCtx.e = _;
    } finally {
      _usingCtx.d();
    }
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — for head (input)',
    source: `for (using x of y) {
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
for (const _x of y)
  try {
    var _usingCtx = babelHelpers.usingCtx();
    const x = _usingCtx.u(_x);
    doSomethingWith(x);
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    _usingCtx.d();
  }`,
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
      },
    ],
  },
  {
    title: 'transform sync — function body (input)',
    source: `function fn() {
  using x = obj;
  return doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
function fn() {
  try {
    var _usingCtx = babelHelpers.usingCtx();
    const x = _usingCtx.u(obj);
    return doSomethingWith(x);
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    _usingCtx.d();
  }
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — if body (input)',
    source: `if (test) {
  using x = obj;
  doSomethingWith(x);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
if (test)
  try {
    var _usingCtx = babelHelpers.usingCtx();
    const x = _usingCtx.u(obj);
    doSomethingWith(x);
  } catch (_) {
    _usingCtx.e = _;
  } finally {
    _usingCtx.d();
  }`,
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
      },
    ],
  },
  {
    title: 'transform sync — invalid switch bare case (input)',
    source: `function f() {
  switch (v) {
    case 0:
      using x = 0;
      break;
    default:
      using y = 1;
      break;
  };
}
`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'transform sync — multiple nested (input)',
    source: `{
  using x = obj;
  {
    using y = call(() => {
      using z = obj;
      return z;
    });
    stmt;
  }
  stmt;
}`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  const x = _usingCtx.u(obj);
  try {
    var _usingCtx2 = babelHelpers.usingCtx();
    const y = _usingCtx2.u(
      call(() => {
        try {
          var _usingCtx3 = babelHelpers.usingCtx();
          const z = _usingCtx3.u(obj);
          return z;
        } catch (_) {
          _usingCtx3.e = _;
        } finally {
          _usingCtx3.d();
        }
      }),
    );
    stmt;
  } catch (_) {
    _usingCtx2.e = _;
  } finally {
    _usingCtx2.d();
  }
  stmt;
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — multiple same level (input)',
    source: `{
  stmt;
  using x = obj;
  stmt;
  using y = obj, z = obj;
  stmt;
  using w = obj;
  doSomethingWith(x, z);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
try {
  var _usingCtx = babelHelpers.usingCtx();
  stmt;
  const x = _usingCtx.u(obj);
  stmt;
  const y = _usingCtx.u(obj),
    z = _usingCtx.u(obj);
  stmt;
  const w = _usingCtx.u(obj);
  doSomethingWith(x, z);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — named evaluation (input)',
    source: `let log = [];
let Symbol$dispose = Symbol.dispose || Symbol.for("Symbol.dispose");
{
  using foo = class { static [Symbol$dispose]() { log.push(\`\${foo.name} is disposed\`) } }
  log.push(foo.name);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
let log = [];
let Symbol$dispose = Symbol.dispose || Symbol.for('Symbol.dispose');
try {
  var _usingCtx = babelHelpers.usingCtx();
  const foo = _usingCtx.u(
    class {
      static [Symbol$dispose]() {
        log.push(\`\${foo.name} is disposed\`);
      }
    },
  );
  log.push(foo.name);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform sync — static block (input)',
    source: `class A {
  static {
    using x = y;
    doSomethingWith(x);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
class A {
  static {
    try {
      var _usingCtx = babelHelpers.usingCtx();
      const x = _usingCtx.u(y);
      doSomethingWith(x);
    } catch (_) {
      _usingCtx.e = _;
    } finally {
      _usingCtx.d();
    }
  }
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — await or not preserved (input)',
    source: `using x = A;
await using y = B;

export { x, y };
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { x, y };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var x = _usingCtx.u(A);
  var y = _usingCtx.a(B);
} catch (_) {
  _usingCtx.e = _;
} finally {
  await _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting default clas anon (input)',
    source: `using x = null;
export default class {}
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { _default as default };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var x = _usingCtx.u(null);
  var _default = class {};
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting default class (input)',
    source: `using x = null;
export default class C {}
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { C as default };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var x = _usingCtx.u(null);
  var C = class C {};
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting default expr (input)',
    source: `using x = null;
export default doSomething();
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { _default as default };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var x = _usingCtx.u(null);
  var _default = doSomething();
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting default fn anon (input)',
    source: `using x = null;
export default function fn() {}
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export default function fn() {}
try {
  var _usingCtx = babelHelpers.usingCtx();
  var x = _usingCtx.u(null);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting mutate outer class binding (exec)',
    source: `export class A { static get self() { return A } }

using x = null;

export class B { static get self() { return B } }

const AO = A, BO = B;
A = B = null;

expect(AO.self).toBe(AO);
expect(BO.self).toBe(BO);
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { A };
export { B };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var A = class A {
    static get self() {
      return A;
    }
  };
  var x = _usingCtx.u(null);
  var B = class B {
    static get self() {
      return B;
    }
  };
  var AO = A,
    BO = B;
  A = B = null;
  expect(AO.self).toBe(AO);
  expect(BO.self).toBe(BO);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting mutate outer class binding (input)',
    source: `export class A { static get self() { return A } }

using x = null;

export class B { static get self() { return B } }

A = B = null;
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
export { A };
export { B };
try {
  var _usingCtx = babelHelpers.usingCtx();
  var A = class A {
    static get self() {
      return A;
    }
  };
  var x = _usingCtx.u(null);
  var B = class B {
    static get self() {
      return B;
    }
  };
  A = B = null;
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
  {
    title: 'transform top level — hoisting (input)',
    source: `import { doSomething } from "somewhere";
export * from "somewhere else";
export * as ns from "somewhere else";

function f() { a; B; }
function h() { b; A; }
export function g() { c; }

doSomething();

export { f };
export let { b } = {};

let c = 2;
class A {}
export class B {}

using x = null;
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      usingCtx: function (n, l) {
        function v() {
          var b =
              typeof SuppressedError == 'function'
                ? SuppressedError
                : function (t, r) {
                    var e = Error();
                    return ((e.name = 'SuppressedError'), (e.error = t), (e.suppressed = r), e);
                  },
            i = {},
            u = [];
          function d(t, r) {
            if (r != null) {
              if (Object(r) !== r)
                throw new TypeError(
                  'using declarations can only be used with objects, functions, null, or undefined.',
                );
              if (t) var e = r[Symbol.asyncDispose || Symbol.for('Symbol.asyncDispose')];
              if (e === void 0 && ((e = r[Symbol.dispose || Symbol.for('Symbol.dispose')]), t))
                var o = e;
              if (typeof e != 'function') throw new TypeError('Object is not disposable.');
              (o &&
                (e = function () {
                  try {
                    o.call(r);
                  } catch (f) {
                    return Promise.reject(f);
                  }
                }),
                u.push({ v: r, d: e, a: t }));
            } else t && u.push({ d: r, a: t });
            return r;
          }
          return {
            e: i,
            u: d.bind(null, !1),
            a: d.bind(null, !0),
            d: function () {
              var r,
                e = this.e,
                o = 0;
              function s() {
                for (; (r = u.pop());)
                  try {
                    if (!r.a && o === 1) return ((o = 0), u.push(r), Promise.resolve().then(s));
                    if (r.d) {
                      var c = r.d.call(r.v);
                      if (r.a) return ((o |= 2), Promise.resolve(c).then(s, f));
                    } else o |= 1;
                  } catch (h) {
                    return f(h);
                  }
                if (o === 1) return e !== i ? Promise.reject(e) : Promise.resolve();
                if (e !== i) throw e;
              }
              function f(c) {
                return ((e = e !== i ? new b(c, e) : c), s());
              }
              return s();
            },
          };
        }
        ((n.exports = v), (n.exports.__esModule = !0), (n.exports.default = n.exports));
      },
    },
    p = {};
  function a(n) {
    if (p[n]) return p[n].exports;
    var l = (p[n] = { exports: {} });
    return (y[n](l, a), l.exports);
  }
  return { usingCtx: a('usingCtx') };
})();
import { doSomething } from 'somewhere';
export * from 'somewhere else';
export * as ns from 'somewhere else';
function f() {
  a;
  B;
}
function h() {
  b;
  A;
}
export function g() {
  c;
}
export { f };
export { b };
export { B };
try {
  var _usingCtx = babelHelpers.usingCtx();
  doSomething();
  var { b } = {};
  var c = 2;
  var A = class A {};
  var B = class B {};
  var x = _usingCtx.u(null);
} catch (_) {
  _usingCtx.e = _;
} finally {
  _usingCtx.d();
}`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
