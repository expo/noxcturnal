import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'async generators — await in finally (exec)',
    source: `(function () {


async function* createAsyncGenerator() {
  try {
    yield 1;
  } finally {
    await Promise.resolve(2);
    await Promise.resolve(3);
    yield 4;
  }
  return 5;
}

async function test() {
  const withReturnCall = createAsyncGenerator();

  expect(await withReturnCall.next()).toEqual({ value: 1, done: false });
  expect(await withReturnCall.return(10)).toEqual({ value: 4, done: false });
  expect(await withReturnCall.next()).toEqual({ value: 10, done: true });
}

return test();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  function createAsyncGenerator() {
    return _createAsyncGenerator.apply(this, arguments);
  }
  function _createAsyncGenerator() {
    _createAsyncGenerator = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        yield 1;
      } finally {
        yield babelHelpers.awaitAsyncGenerator(Promise.resolve(2));
        yield babelHelpers.awaitAsyncGenerator(Promise.resolve(3));
        yield 4;
      }
      return 5;
    });
    return _createAsyncGenerator.apply(this, arguments);
  }
  async function test() {
    const withReturnCall = createAsyncGenerator();
    expect(await withReturnCall.next()).toEqual({
      value: 1,
      done: false,
    });
    expect(await withReturnCall.return(10)).toEqual({
      value: 4,
      done: false,
    });
    expect(await withReturnCall.next()).toEqual({
      value: 10,
      done: true,
    });
  }
  return test();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — class method (input)',
    source: `class C {
  async *g() {
    this;
    await 1;
    yield 2;
    return 3;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
class C {
  g() {
    var _this = this;
    return babelHelpers.wrapAsyncGenerator(function* () {
      _this;
      yield babelHelpers.awaitAsyncGenerator(1);
      yield 2;
      return 3;
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — class private method (input)',
    source: `class C {
  async * #g() {
    this;
    await 1;
    yield 2;
    return 3;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
class C {
  #g() {
    var _this = this;
    return babelHelpers.wrapAsyncGenerator(function* () {
      _this;
      yield babelHelpers.awaitAsyncGenerator(1);
      yield 2;
      return 3;
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — declaration exec (exec)',
    source: `(function () {
"use strict";

const actual = [];
const expected = ["foo_0", "bar_1", "baz_2"];

async function* test() {
  actual.push(yield await Promise.resolve("foo"));
  actual.push(yield await Promise.resolve("bar"));
  actual.push(yield await Promise.resolve("baz"));
}

async function main() {
  const g = test();
  let i = 0;
  await g
    .next()
    .then(({ value }) => g.next(\`\${value}_\${i++}\`))
    .then(({ value }) => g.next(\`\${value}_\${i++}\`))
    .then(({ value }) => g.next(\`\${value}_\${i++}\`));
}

return main().then(() => {
  expect(actual).toEqual(expected);
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  'use strict';
  const actual = [];
  const expected = ['foo_0', 'bar_1', 'baz_2'];
  function test() {
    return _test.apply(this, arguments);
  }
  function _test() {
    _test = babelHelpers.wrapAsyncGenerator(function* () {
      actual.push(yield yield babelHelpers.awaitAsyncGenerator(Promise.resolve('foo')));
      actual.push(yield yield babelHelpers.awaitAsyncGenerator(Promise.resolve('bar')));
      actual.push(yield yield babelHelpers.awaitAsyncGenerator(Promise.resolve('baz')));
    });
    return _test.apply(this, arguments);
  }
  async function main() {
    const g = test();
    let i = 0;
    await g
      .next()
      .then(({ value }) => g.next(\`\${value}_\${i++}\`))
      .then(({ value }) => g.next(\`\${value}_\${i++}\`))
      .then(({ value }) => g.next(\`\${value}_\${i++}\`));
  }
  return main().then(() => {
    expect(actual).toEqual(expected);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — declaration (input)',
    source: `async function* agf() {
  this;
  await 1;
  yield 2;
  return 3;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function agf() {
  return _agf.apply(this, arguments);
}
function _agf() {
  _agf = babelHelpers.wrapAsyncGenerator(function* () {
    this;
    yield babelHelpers.awaitAsyncGenerator(1);
    yield 2;
    return 3;
  });
  return _agf.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — expression (input)',
    source: `(async function* agf() {
  this;
  await 1;
  yield 2;
  return 3;
});
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
/* @__PURE__ */ (function () {
  var _agf = babelHelpers.wrapAsyncGenerator(function* () {
    this;
    yield babelHelpers.awaitAsyncGenerator(1);
    yield 2;
    return 3;
  });
  function agf() {
    return _agf.apply(this, arguments);
  }
  return agf;
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — object method (input)',
    source: `({
  async *g() {
    this;
    await 1;
    yield 2;
    return 3;
  }
});
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
({
  g() {
    var _this = this;
    return babelHelpers.wrapAsyncGenerator(function* () {
      _this;
      yield babelHelpers.awaitAsyncGenerator(1);
      yield 2;
      return 3;
    })();
  },
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — static method (input)',
    source: `class C {
  static async *g() {
    this;
    await 1;
    yield 2;
    return 3;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
class C {
  static g() {
    var _this = this;
    return babelHelpers.wrapAsyncGenerator(function* () {
      _this;
      yield babelHelpers.awaitAsyncGenerator(1);
      yield 2;
      return 3;
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — transform class keys (input)',
    source: `async function* fn() {
    class A {
      [yield 1]() {}
    }
\x20\x20
    class B extends A {
      [await 1]() {}
    }
}`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function fn() {
  return _fn.apply(this, arguments);
}
function _fn() {
  _fn = babelHelpers.wrapAsyncGenerator(function* () {
    class A {
      [yield 1]() {}
    }
    class B extends A {
      [yield babelHelpers.awaitAsyncGenerator(1)]() {}
    }
  });
  return _fn.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — yield exec (exec)',
    source: `(function () {
"use strict";

const actual = [];
const expected = ["foo", "bar", "baz", "xyz"];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function* test() {
  yield await delay(0).then(() => actual.push("foo"));
  await delay(0).then(() => actual.push("bar"));
  yield delay(0).then(() => actual.push("baz"));
  actual.push("xyz");
}

async function main() {
  const g = test();
  g.next();
  g.next();
  await g.next();
}

return main().then(() => {
  expect(actual).toEqual(expected);
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  'use strict';
  const actual = [];
  const expected = ['foo', 'bar', 'baz', 'xyz'];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  function test() {
    return _test.apply(this, arguments);
  }
  function _test() {
    _test = babelHelpers.wrapAsyncGenerator(function* () {
      yield yield babelHelpers.awaitAsyncGenerator(delay(0).then(() => actual.push('foo')));
      yield babelHelpers.awaitAsyncGenerator(delay(0).then(() => actual.push('bar')));
      yield delay(0).then(() => actual.push('baz'));
      actual.push('xyz');
    });
    return _test.apply(this, arguments);
  }
  async function main() {
    const g = test();
    g.next();
    g.next();
    await g.next();
  }
  return main().then(() => {
    expect(actual).toEqual(expected);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async generators — yield star (input)',
    source: `async function* g() {
  yield* [1, 2, 3];
  yield* iterable;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function g() {
  return _g.apply(this, arguments);
}
function _g() {
  _g = babelHelpers.wrapAsyncGenerator(function* () {
    yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator([1, 2, 3]));
    yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(iterable));
  });
  return _g.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — async arrow (input)',
    source: `async () => {
  for await (let x of y) {
    f(x);
  }
};
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(y), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let x = _step.value;
      {
        f(x);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — async function no transform (input)',
    source: `async function foo() {
\tfor await (const x of y) {}
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async function foo() {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(y), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const x = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — async function (input)',
    source: `async function f() {
  for await (let x of y) {
    g(x);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async function f() {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(y), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let x = _step.value;
      {
        g(x);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — async generator exec (exec)',
    source: `(function () {
"use strict";

async function* genAnswers() {
  var stream = [ Promise.resolve(4), Promise.resolve(9), Promise.resolve(12) ];
  var total = 0;
  for await (let val of stream) {
    total += await val;
    yield total;
  }
}

function forEach(ai, fn) {
  return ai.next().then(function (r) {
    if (!r.done) {
      fn(r);
      return forEach(ai, fn);
    }
  });
}

var output = 0;
return forEach(genAnswers(), function(val) { output += val.value })
.then(function () {
  expect(output).toBe(42);
});


});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  'use strict';
  function genAnswers() {
    return _genAnswers.apply(this, arguments);
  }
  function _genAnswers() {
    _genAnswers = babelHelpers.wrapAsyncGenerator(function* () {
      var stream = [Promise.resolve(4), Promise.resolve(9), Promise.resolve(12)];
      var total = 0;
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = babelHelpers.asyncIterator(stream), _step;
          (_iteratorAbruptCompletion = !(_step = yield babelHelpers.awaitAsyncGenerator(
            _iterator.next(),
          )).done);
          _iteratorAbruptCompletion = false
        ) {
          let val = _step.value;
          {
            total += yield babelHelpers.awaitAsyncGenerator(val);
            yield total;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            yield babelHelpers.awaitAsyncGenerator(_iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
    return _genAnswers.apply(this, arguments);
  }
  function forEach(ai, fn) {
    return ai.next().then(function (r) {
      if (!r.done) {
        fn(r);
        return forEach(ai, fn);
      }
    });
  }
  var output = 0;
  return forEach(genAnswers(), function (val) {
    output += val.value;
  }).then(function () {
    expect(output).toBe(42);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — async generator (input)',
    source: `async function* g() {
  for await (let x of y) {
    f(x);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function g() {
  return _g.apply(this, arguments);
}
function _g() {
  _g = babelHelpers.wrapAsyncGenerator(function* () {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator(y), _step;
        (_iteratorAbruptCompletion = !(_step = yield babelHelpers.awaitAsyncGenerator(
          _iterator.next(),
        )).done);
        _iteratorAbruptCompletion = false
      ) {
        let x = _step.value;
        {
          f(x);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          yield babelHelpers.awaitAsyncGenerator(_iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
  return _g.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — create async from sync iterator (exec)',
    source: `(function () {
async function* fn() {
  for await (const result of [Promise.resolve("ok")]) {
    return { result };
  }
}

return fn().next().then(result => {
  expect(result).toEqual({
    done: true,
    value: { result: "ok" }
  });
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  function fn() {
    return _fn.apply(this, arguments);
  }
  function _fn() {
    _fn = babelHelpers.wrapAsyncGenerator(function* () {
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = babelHelpers.asyncIterator([Promise.resolve('ok')]), _step;
          (_iteratorAbruptCompletion = !(_step = yield babelHelpers.awaitAsyncGenerator(
            _iterator.next(),
          )).done);
          _iteratorAbruptCompletion = false
        ) {
          const result = _step.value;
          {
            return { result };
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            yield babelHelpers.awaitAsyncGenerator(_iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
    return _fn.apply(this, arguments);
  }
  return fn()
    .next()
    .then(result => {
      expect(result).toEqual({
        done: true,
        value: { result: 'ok' },
      });
    });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — create async from sync iterator (input)',
    source: `async function* fn() {
  for await (const result of [Promise.resolve("ok")]) {
    return { result };
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function fn() {
  return _fn.apply(this, arguments);
}
function _fn() {
  _fn = babelHelpers.wrapAsyncGenerator(function* () {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator([Promise.resolve('ok')]), _step;
        (_iteratorAbruptCompletion = !(_step = yield babelHelpers.awaitAsyncGenerator(
          _iterator.next(),
        )).done);
        _iteratorAbruptCompletion = false
      ) {
        const result = _step.value;
        {
          return { result };
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          yield babelHelpers.awaitAsyncGenerator(_iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
  return _fn.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — destructuring (input)',
    source: `async function f() {
  for await (let { x, y: [z] } of a) {
    g(x, z);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async function f() {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(a), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let {
        x,
        y: [z],
      } = _step.value;
      {
        g(x, z);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — lhs member expression (exec)',
    source: `(function () {
return async function () {
  let obj = {};
  for await (obj.x of [1, 2]);

  expect(obj.x).toBe(2);
}();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(function () {
  return (async function () {
    let obj = {};
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator([1, 2]), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        obj.x = _step.value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
    expect(obj.x).toBe(2);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — lhs member expression (input)',
    source: `(async function () {
  for await (obj.x of y) {}
})();
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(async function () {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(y), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      obj.x = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — re declare var in init body (exec)',
    source: `( async () => {
  for await ( let x of [ ] ) { let x; }
} ) ;
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator([]), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let x = _step.value;
      {
        let x;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — re declare var in init body (input)',
    source: `( async () => {
  for await ( let x of [ ] ) { let x; }
} ) ;
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async () => {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator([]), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      let x = _step.value;
      {
        let x;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — step single tick (exec)',
    source: `(function () {
let resolve;
let promise = new Promise((r) => (resolve = r));
let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => promise,
    };
  },
};

let values = [];

return Promise.all([
  async function () {
    for await (let value of iterable) {
      values.push(value);
    }
  }(),
  async function () {
    resolve({ value: 0, done: false });
    promise = new Promise((r) => (resolve = r));

    await null;
    resolve({ value: 1, done: false });
    promise = new Promise((r) => (resolve = r));

    resolve({ value: undefined, done: true });
  }(),
]).then(() => {
  expect(values).toEqual([0, 1]);
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(function () {
  let resolve;
  let promise = new Promise(r => (resolve = r));
  let iterable = {
    [Symbol.asyncIterator || '@@asyncIterator']() {
      return { next: () => promise };
    },
  };
  let values = [];
  return Promise.all([
    (async function () {
      var _iteratorAbruptCompletion = false;
      var _didIteratorError = false;
      var _iteratorError;
      try {
        for (
          var _iterator = babelHelpers.asyncIterator(iterable), _step;
          (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
          _iteratorAbruptCompletion = false
        ) {
          let value = _step.value;
          {
            values.push(value);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (_iteratorAbruptCompletion && _iterator.return != null) {
            _iteratorResult(await _iterator.return());
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    })(),
    (async function () {
      resolve({
        value: 0,
        done: false,
      });
      promise = new Promise(r => (resolve = r));
      await null;
      resolve({
        value: 1,
        done: false,
      });
      promise = new Promise(r => (resolve = r));
      resolve({
        value: undefined,
        done: true,
      });
    })(),
  ]).then(() => {
    expect(values).toEqual([0, 1]);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — step value is promise (exec)',
    source: `(function () {
let steps = [
  { done: false, value: Promise.resolve(1) },
  { done: true, value: undefined }
];

let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => steps.shift(),
    };
  },
};

let values = [];

return async function () {
  let value;
  for await (value of iterable);

  expect(value).toBeInstanceOf(Promise);
  await expect(value).resolves.toBe(1);
}();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(function () {
  let steps = [
    {
      done: false,
      value: Promise.resolve(1),
    },
    {
      done: true,
      value: undefined,
    },
  ];
  let iterable = {
    [Symbol.asyncIterator || '@@asyncIterator']() {
      return { next: () => steps.shift() };
    },
  };
  let values = [];
  return (async function () {
    let value;
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator(iterable), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        value = _step.value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
    expect(value).toBeInstanceOf(Promise);
    await expect(value).resolves.toBe(1);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for await — step value not accessed when done (exec)',
    source: `(function () {
let gotValue = false;

let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => Promise.resolve({
        get value() { gotValue = true },
        done: true
      })
    };
  },
};

return async function () {
  for await (let value of iterable) {}

  expect(gotValue).toBe(false);
}();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(function () {
  let gotValue = false;
  let iterable = {
    [Symbol.asyncIterator || '@@asyncIterator']() {
      return {
        next: () =>
          Promise.resolve({
            get value() {
              gotValue = true;
            },
            done: true,
          }),
      };
    },
  };
  return (async function () {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator(iterable), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        let value = _step.value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
    expect(gotValue).toBe(false);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'nested — arrows in declaration (input)',
    source: `async function* g() {
  () => this;
  function f() {
    () => this;
  }
  async () => {
    this;
    await 1;
  }
  await 1;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function g() {
  return _g.apply(this, arguments);
}
function _g() {
  _g = babelHelpers.wrapAsyncGenerator(function* () {
    () => this;
    function f() {
      () => this;
    }
    async () => {
      this;
      await 1;
    };
    yield babelHelpers.awaitAsyncGenerator(1);
  });
  return _g.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'nested — async in params (input)',
    source: `async function* g(x = async function() { await 1 }) {
  await 2;
  yield 3;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function g() {
  return _g.apply(this, arguments);
}
function _g() {
  _g = babelHelpers.wrapAsyncGenerator(function* (
    x = async function () {
      await 1;
    },
  ) {
    yield babelHelpers.awaitAsyncGenerator(2);
    yield 3;
  });
  return _g.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'nested — generator in async (input)',
    source: `async function f() {
  await 1;
  async function* g() {
    await 2;
    yield 3;
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
async function f() {
  await 1;
  function g() {
    return _g.apply(this, arguments);
  }
  function _g() {
    _g = babelHelpers.wrapAsyncGenerator(function* () {
      yield babelHelpers.awaitAsyncGenerator(2);
      yield 3;
    });
    return _g.apply(this, arguments);
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 13801 (input)',
    source: `async function main() {
  async () => {
    // IIFE: required for babel to crash
    for await (const string of async_iterable) {
      // for await: required for babel to crash
      console.log(string);
    }
  };

  const [one] = [1]; // array destructuring: required for babel to crash
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
async function main() {
  async () => {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    // IIFE: required for babel to crash
    try {
      for (
        var _iterator = babelHelpers.asyncIterator(async_iterable), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        const string = _step.value;
        {
          // for await: required for babel to crash
          console.log(string);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };
  const [one] = [1];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 5880 (input)',
    source: `(async () => {
  for await (const [value] of iterable) {}
})()
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(async () => {
  var _iteratorAbruptCompletion = false;
  var _didIteratorError = false;
  var _iteratorError;
  try {
    for (
      var _iterator = babelHelpers.asyncIterator(iterable), _step;
      (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
      _iteratorAbruptCompletion = false
    ) {
      const [value] = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (_iteratorAbruptCompletion && _iterator.return != null) {
        _iteratorResult(await _iterator.return());
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — test262 fn length (exec)',
    source: `var ref = async function*(a,) {};

expect(ref.length).toBe(1);
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
var ref = /* @__PURE__ */ (function () {
  var _ref = babelHelpers.wrapAsyncGenerator(function* (a) {});
  return function ref(_x) {
    return _ref.apply(this, arguments);
  };
})();
expect(ref.length).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — issue 9905 (exec)',
    source: `(function () {
const log = [];

async function* func1() {
  log.push(1);
  yield "a";
  log.push(2);
}

async function* func2() {
  yield* func1();
  log.push(3);
}

return (async () => {
  const iterator = func2();
  await iterator.next();
  await iterator.return();

  expect(log).toEqual([1]);
})();
});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function func1() {
    return _func.apply(this, arguments);
  }
  function _func() {
    _func = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(1);
      yield 'a';
      log.push(2);
    });
    return _func.apply(this, arguments);
  }
  function func2() {
    return _func2.apply(this, arguments);
  }
  function _func2() {
    _func2 = babelHelpers.wrapAsyncGenerator(function* () {
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(func1()));
      log.push(3);
    });
    return _func2.apply(this, arguments);
  }
  return (async () => {
    const iterator = func2();
    await iterator.next();
    await iterator.return();
    expect(log).toEqual([1]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — return method with finally multiple parallel (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  try {
    log.push(1);
    yield "a";
    log.push(2);
    yield "b";
    log.push(3);
  } finally {
    log.push(4);
    yield "c";
    log.push(5);
  }
}

async function* outer() {
  log.push(6);
  yield* inner();
  log.push(7);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([6, 1]);

  const [res1, res2] = await Promise.all([ iterator.return("x"), iterator.return("y") ]);
  expect(res1).toEqual({ value: "c", done: false });
  expect(res2).toEqual({ value: "y", done: true });
  expect(log).toEqual([6, 1, 4]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
        yield 'b';
        log.push(3);
      } finally {
        log.push(4);
        yield 'c';
        log.push(5);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(6);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(7);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([6, 1]);
    const [res1, res2] = await Promise.all([iterator.return('x'), iterator.return('y')]);
    expect(res1).toEqual({
      value: 'c',
      done: false,
    });
    expect(res2).toEqual({
      value: 'y',
      done: true,
    });
    expect(log).toEqual([6, 1, 4]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — return method with finally multiple serial (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  try {
    log.push(1);
    yield "a";
    log.push(2);
    yield "b";
    log.push(3);
  } finally {
    log.push(4);
    yield "c";
    log.push(5);
  }
}

async function* outer() {
  log.push(6);
  yield* inner();
  log.push(7);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([6, 1]);

  res = await iterator.return("x");
  expect(res).toEqual({ value: "c", done: false });
  expect(log).toEqual([6, 1, 4]);

  res = await iterator.return("y");
  expect(res).toEqual({ value: "y", done: true });
  expect(log).toEqual([6, 1, 4]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
        yield 'b';
        log.push(3);
      } finally {
        log.push(4);
        yield 'c';
        log.push(5);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(6);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(7);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([6, 1]);
    res = await iterator.return('x');
    expect(res).toEqual({
      value: 'c',
      done: false,
    });
    expect(log).toEqual([6, 1, 4]);
    res = await iterator.return('y');
    expect(res).toEqual({
      value: 'y',
      done: true,
    });
    expect(log).toEqual([6, 1, 4]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — return method with finally (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  try {
    log.push(1);
    yield "a";
    log.push(2);
    yield "b";
    log.push(3);
  } finally {
    log.push(4);
    yield "c";
    log.push(5);
  }
}

async function* outer() {
  log.push(6);
  yield* inner();
  log.push(7);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([6, 1]);

  res = await iterator.return();
  expect(res).toEqual({ value: "c", done: false });
  expect(log).toEqual([6, 1, 4]);

  res = await iterator.next();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([6, 1, 4, 5, 7]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
        yield 'b';
        log.push(3);
      } finally {
        log.push(4);
        yield 'c';
        log.push(5);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(6);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(7);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([6, 1]);
    res = await iterator.return();
    expect(res).toEqual({
      value: 'c',
      done: false,
    });
    expect(log).toEqual([6, 1, 4]);
    res = await iterator.next();
    expect(res).toEqual({
      value: undefined,
      done: true,
    });
    expect(log).toEqual([6, 1, 4, 5, 7]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — return method (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  log.push(1);
  yield "a";
  log.push(2);
  yield "b";
  log.push(3);
}

async function* outer() {
  log.push(4);
  yield* inner();
  log.push(5);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([4, 1]);

  res = await iterator.return();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([4, 1]);

  res = await iterator.next();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([4, 1]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(1);
      yield 'a';
      log.push(2);
      yield 'b';
      log.push(3);
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(4);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(5);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([4, 1]);
    res = await iterator.return();
    expect(res).toEqual({
      value: undefined,
      done: true,
    });
    expect(log).toEqual([4, 1]);
    res = await iterator.next();
    expect(res).toEqual({
      value: undefined,
      done: true,
    });
    expect(log).toEqual([4, 1]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — throw method with catch (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  try {
    log.push(1);
    yield "a";
    log.push(2);
    yield "b";
    log.push(3);
  } catch (e) {
    log.push(4);
    yield "c";
    log.push(5);
  }
}

async function* outer() {
  log.push(6);
  yield* inner();
  log.push(7);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([6, 1]);

  res = await iterator.throw(new Error("TEST"));
  expect(res).toEqual({ value: "c", done: false });
  expect(log).toEqual([6, 1, 4]);

  res = await iterator.next();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([6, 1, 4, 5, 7]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
        yield 'b';
        log.push(3);
      } catch (e) {
        log.push(4);
        yield 'c';
        log.push(5);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(6);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(7);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([6, 1]);
    res = await iterator.throw(new Error('TEST'));
    expect(res).toEqual({
      value: 'c',
      done: false,
    });
    expect(log).toEqual([6, 1, 4]);
    res = await iterator.next();
    expect(res).toEqual({
      value: undefined,
      done: true,
    });
    expect(log).toEqual([6, 1, 4, 5, 7]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star polyfill corejs3 — throw method with finally (exec)',
    source: `(function () {
const log = [];

async function* inner() {
  try {
    log.push(1);
    yield "a";
    log.push(2);
    yield "b";
    log.push(3);
  } finally {
    log.push(4);
    yield "c";
    log.push(5);
  }
}

async function* outer() {
  log.push(6);
  yield* inner();
  log.push(7);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([6, 1]);

  res = await iterator.throw(new Error("TEST"));
  expect(res).toEqual({ value: "c", done: false });
  expect(log).toEqual([6, 1, 4]);

  // "yield" in finally suspended the exception for one turn
  await expect(iterator.next()).rejects.toThrow(/TEST/);
  expect(log).toEqual([6, 1, 4, 5]);
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  const log = [];
  function inner() {
    return _inner.apply(this, arguments);
  }
  function _inner() {
    _inner = babelHelpers.wrapAsyncGenerator(function* () {
      try {
        log.push(1);
        yield 'a';
        log.push(2);
        yield 'b';
        log.push(3);
      } finally {
        log.push(4);
        yield 'c';
        log.push(5);
      }
    });
    return _inner.apply(this, arguments);
  }
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      log.push(6);
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner()));
      log.push(7);
    });
    return _outer.apply(this, arguments);
  }
  return (async () => {
    const iterator = outer();
    let res = await iterator.next();
    expect(res).toEqual({
      value: 'a',
      done: false,
    });
    expect(log).toEqual([6, 1]);
    res = await iterator.throw(new Error('TEST'));
    expect(res).toEqual({
      value: 'c',
      done: false,
    });
    expect(log).toEqual([6, 1, 4]);
    // "yield" in finally suspended the exception for one turn
    await expect(iterator.next()).rejects.toThrow(/TEST/);
    expect(log).toEqual([6, 1, 4, 5]);
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star — create async from sync iterator (exec)',
    source: `(function () {
async function* fn() {
  yield* [Promise.resolve("ok")] // CreateAsyncFromSyncIterator
}

return fn().next().then(result => {
  expect(result).toEqual({ value: "ok", done: false });
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
(function () {
  function fn() {
    return _fn.apply(this, arguments);
  }
  function _fn() {
    _fn = babelHelpers.wrapAsyncGenerator(function* () {
      yield* babelHelpers.asyncGeneratorDelegate(
        babelHelpers.asyncIterator([Promise.resolve('ok')]),
      );
    });
    return _fn.apply(this, arguments);
  }
  return fn()
    .next()
    .then(result => {
      expect(result).toEqual({
        value: 'ok',
        done: false,
      });
    });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star — create async from sync iterator (input)',
    source: `async function* fn() {
  yield* [Promise.resolve("ok")] // CreateAsyncFromSyncIterator
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function fn() {
  return _fn.apply(this, arguments);
}
function _fn() {
  _fn = babelHelpers.wrapAsyncGenerator(function* () {
    yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator([Promise.resolve('ok')]));
  });
  return _fn.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'yield star — ecma262 pr 2819 (exec)',
    source: `(function () {
// https://github.com/tc39/ecma262/pull/2819

let done = false;
let inner = {
  [Symbol.asyncIterator]: () => ({
    next() {
      if (done) {
        return Promise.resolve({ done: true });
      }
      done = true;
      return Promise.resolve({ done: false, value: Promise.resolve(0) });
    },
  }),
};

async function* outer() {
  yield* inner;
}

return (async function () {
  for await (let x of outer()) {
    expect(x).toBeInstanceOf(Promise);
    expect(await x).toBe(0);
  }
})();

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var _ = {
      OverloadYield: function (t, f) {
        function c(s, a) {
          ((this.v = s), (this.k = a));
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      awaitAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          return new c(a, 0);
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncGeneratorDelegate: function (t, f) {
        var c = f('OverloadYield');
        function s(a) {
          var r = {},
            e = !1;
          function o(n, l) {
            return (
              (e = !0),
              (l = new Promise(function (i) {
                i(a[n](l));
              })),
              { done: !1, value: new c(l, 1) }
            );
          }
          return (
            (r[(typeof Symbol != 'undefined' && Symbol.iterator) || '@@iterator'] = function () {
              return this;
            }),
            (r.next = function (n) {
              return e ? ((e = !1), n) : o('next', n);
            }),
            typeof a.throw == 'function' &&
              (r.throw = function (n) {
                if (e) throw ((e = !1), n);
                return o('throw', n);
              }),
            typeof a.return == 'function' &&
              (r.return = function (n) {
                return e ? ((e = !1), n) : o('return', n);
              }),
            r
          );
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      asyncIterator: function (t, f) {
        function c(a) {
          var r,
            e,
            o,
            n = 2;
          for (
            typeof Symbol != 'undefined' && ((e = Symbol.asyncIterator), (o = Symbol.iterator));
            n--;
          ) {
            if (e && (r = a[e]) != null) return r.call(a);
            if (o && (r = a[o]) != null) return new s(r.call(a));
            ((e = '@@asyncIterator'), (o = '@@iterator'));
          }
          throw new TypeError('Object is not async iterable');
        }
        function s(a) {
          function r(e) {
            if (Object(e) !== e) return Promise.reject(new TypeError(e + ' is not an object.'));
            var o = e.done;
            return Promise.resolve(e.value).then(function (n) {
              return { value: n, done: o };
            });
          }
          return (
            (s = function (o) {
              ((this.s = o), (this.n = o.next));
            }),
            (s.prototype = {
              s: null,
              n: null,
              next: function () {
                return r(this.n.apply(this.s, arguments));
              },
              return: function (o) {
                var n = this.s.return;
                return n === void 0
                  ? Promise.resolve({ value: o, done: !0 })
                  : r(n.apply(this.s, arguments));
              },
              throw: function (o) {
                var n = this.s.return;
                return n === void 0 ? Promise.reject(o) : r(n.apply(this.s, arguments));
              },
            }),
            new s(a)
          );
        }
        ((t.exports = c), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
      wrapAsyncGenerator: function (t, f) {
        var c = f('OverloadYield');
        function s(r) {
          return function () {
            return new a(r.apply(this, arguments));
          };
        }
        function a(r) {
          var e, o;
          function n(i, u) {
            try {
              var p = r[i](u),
                y = p.value,
                h = y instanceof c;
              Promise.resolve(h ? y.v : y).then(
                function (v) {
                  if (h) {
                    var w = i === 'return' && y.k ? i : 'next';
                    if (!y.k || v.done) return n(w, v);
                    v = r[w](v).value;
                  }
                  l(!!p.done, v);
                },
                function (v) {
                  n('throw', v);
                },
              );
            } catch (v) {
              l(2, v);
            }
          }
          function l(i, u) {
            (i === 2 ? e.reject(u) : e.resolve({ value: u, done: i }),
              (e = e.next) ? n(e.key, e.arg) : (o = null));
          }
          ((this._invoke = function (i, u) {
            return new Promise(function (p, y) {
              var h = { key: i, arg: u, resolve: p, reject: y, next: null };
              o ? (o = o.next = h) : ((e = o = h), n(i, u));
            });
          }),
            typeof r.return != 'function' && (this.return = void 0));
        }
        ((a.prototype[(typeof Symbol == 'function' && Symbol.asyncIterator) || '@@asyncIterator'] =
          function () {
            return this;
          }),
          (a.prototype.next = function (r) {
            return this._invoke('next', r);
          }),
          (a.prototype.throw = function (r) {
            return this._invoke('throw', r);
          }),
          (a.prototype.return = function (r) {
            return this._invoke('return', r);
          }),
          (t.exports = s),
          (t.exports.__esModule = !0),
          (t.exports.default = t.exports));
      },
      asyncToGenerator: function (t, f) {
        function c(a, r, e, o, n, l, i) {
          try {
            var u = a[l](i),
              p = u.value;
          } catch (y) {
            return void e(y);
          }
          u.done ? r(p) : Promise.resolve(p).then(o, n);
        }
        function s(a) {
          return function () {
            var r = this,
              e = arguments;
            return new Promise(function (o, n) {
              var l = a.apply(r, e);
              function i(p) {
                c(l, o, n, i, u, 'next', p);
              }
              function u(p) {
                c(l, o, n, i, u, 'throw', p);
              }
              i(void 0);
            });
          };
        }
        ((t.exports = s), (t.exports.__esModule = !0), (t.exports.default = t.exports));
      },
    },
    d = {};
  function x(t) {
    if (d[t]) return d[t].exports;
    var f = (d[t] = { exports: {} });
    return (_[t](f, x), f.exports);
  }
  return {
    awaitAsyncGenerator: x('awaitAsyncGenerator'),
    asyncGeneratorDelegate: x('asyncGeneratorDelegate'),
    asyncIterator: x('asyncIterator'),
    wrapAsyncGenerator: x('wrapAsyncGenerator'),
    asyncToGenerator: x('asyncToGenerator'),
  };
})();
function _iteratorResult(value) {
  if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
  return value;
}
(function () {
  // https://github.com/tc39/ecma262/pull/2819
  let done = false;
  let inner = {
    [Symbol.asyncIterator]: () => ({
      next() {
        if (done) {
          return Promise.resolve({ done: true });
        }
        done = true;
        return Promise.resolve({
          done: false,
          value: Promise.resolve(0),
        });
      },
    }),
  };
  function outer() {
    return _outer.apply(this, arguments);
  }
  function _outer() {
    _outer = babelHelpers.wrapAsyncGenerator(function* () {
      yield* babelHelpers.asyncGeneratorDelegate(babelHelpers.asyncIterator(inner));
    });
    return _outer.apply(this, arguments);
  }
  return (async function () {
    var _iteratorAbruptCompletion = false;
    var _didIteratorError = false;
    var _iteratorError;
    try {
      for (
        var _iterator = babelHelpers.asyncIterator(outer()), _step;
        (_iteratorAbruptCompletion = !(_step = _iteratorResult(await _iterator.next())).done);
        _iteratorAbruptCompletion = false
      ) {
        let x = _step.value;
        {
          expect(x).toBeInstanceOf(Promise);
          expect(await x).toBe(0);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (_iteratorAbruptCompletion && _iterator.return != null) {
          _iteratorResult(await _iterator.return());
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncGeneratorFunctions: true,
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
