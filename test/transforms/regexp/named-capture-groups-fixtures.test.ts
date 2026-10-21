import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'runtime (exec)',
    source: `var re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;

var result = re.exec("2017-12-23");

expect(result.groups).toEqual({
  year: "2017",
  month: "12",
  day: "23",
});

expect(result.groups).toEqual({
  year: result[1],
  month: result[2],
  day: result[3],
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
var re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/, {
  month: 2,
  day: 3,
  year: 1,
});
var result = re.exec('2017-12-23');
expect(result.groups).toEqual({
  year: '2017',
  month: '12',
  day: '23',
});
expect(result.groups).toEqual({
  year: result[1],
  month: result[2],
  day: result[3],
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'runtime — has indices (exec)',
    source: `var re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/d;

var result = re.exec("2017-12-23");

expect(result.indices.groups).toEqual({
  year: [0, 4],
  month: [5, 7],
  day: [8, 10],
});

expect(result.indices.groups).toEqual({
  year: result.indices[1],
  month: result.indices[2],
  day: result.indices[3],
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
var re = _wrapRegExp(/(\\d{4})-(\\d{2})-(\\d{2})/d, {
  month: 2,
  day: 3,
  year: 1,
});
var result = re.exec('2017-12-23');
expect(result.indices.groups).toEqual({
  year: [0, 4],
  month: [5, 7],
  day: [8, 10],
});
expect(result.indices.groups).toEqual({
  year: result.indices[1],
  month: result.indices[2],
  day: result.indices[3],
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'runtime — issue 10393 (exec)',
    source: `const regex = /(?<=a)(?<a>[a])/

const result = regex.exec("aa");

expect(result.groups).toEqual({
  a: "a"
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
const regex = _wrapRegExp(/(?<=a)([a])/, { a: 1 });
const result = regex.exec('aa');
expect(result.groups).toEqual({ a: 'a' });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'runtime — issue 10601 (exec)',
    source: `const regex = /<(?<tag>\\d)+>.*?<\\/\\k<tag>>/su;

const result = regex.exec('<0>xxx\\nyyy</0>');

expect(result.groups).toEqual({
  tag: "0"
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
const regex = _wrapRegExp(/<(\\d)+>.*?<\\/\\1>/su, { tag: 1 });
const result = regex.exec('<0>xxx\\nyyy</0>');
expect(result.groups).toEqual({ tag: '0' });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'runtime — match all corejs (exec)',
    source: `require('core-js/features/string/match-all.js');

const string = "Favorite GitHub repos: tc39/ecma262 v8/v8.dev";
const regex = /\\b(?<owner>[a-z0-9]+)\\/(?<repo>[a-z0-9\\.]+)\\b/g;

const matches = string.matchAll(regex);

expect(matches.next().value.groups).toEqual({
  owner: "tc39",
  repo: "ecma262",
});

expect(matches.next().value.groups).toEqual({
  owner: "v8",
  repo: "v8.dev",
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
require('core-js/features/string/match-all.js');
const string = 'Favorite GitHub repos: tc39/ecma262 v8/v8.dev';
const regex = _wrapRegExp(/\\b([a-z0-9]+)\\/([a-z0-9\\.]+)\\b/g, {
  owner: 1,
  repo: 2,
});
const matches = string.matchAll(regex);
expect(matches.next().value.groups).toEqual({
  owner: 'tc39',
  repo: 'ecma262',
});
expect(matches.next().value.groups).toEqual({
  owner: 'v8',
  repo: 'v8.dev',
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'runtime — match all (exec)',
    source: `const string = "Favorite GitHub repos: tc39/ecma262 v8/v8.dev";
const regex = /\\b(?<owner>[a-z0-9]+)\\/(?<repo>[a-z0-9\\.]+)\\b/g;

const matches = string.matchAll(regex);

expect(matches.next().value.groups).toEqual({
  owner: "tc39",
  repo: "ecma262",
});

expect(matches.next().value.groups).toEqual({
  owner: "v8",
  repo: "v8.dev",
});
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
const string = 'Favorite GitHub repos: tc39/ecma262 v8/v8.dev';
const regex = _wrapRegExp(/\\b([a-z0-9]+)\\/([a-z0-9\\.]+)\\b/g, {
  owner: 1,
  repo: 2,
});
const matches = string.matchAll(regex);
expect(matches.next().value.groups).toEqual({
  owner: 'tc39',
  repo: 'ecma262',
});
expect(matches.next().value.groups).toEqual({
  owner: 'v8',
  repo: 'v8.dev',
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'syntax — basic (input)',
    source: '/(?<name>)\\k<name>/;',
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
_wrapRegExp(/()\\1/, { name: 1 });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'syntax — escape no unicode flag (input)',
    source: `/(?<\\u{41}>)\\k<\\u{41}>/;
`,
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
_wrapRegExp(/()\\1/, { A: 1 });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'syntax — escape unicode flag (input)',
    source: '/(?<\\u{41}>)\\k<\\u{41}>/u;',
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
_wrapRegExp(/()\\1/u, { A: 1 });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — basic (input)',
    source: '"foo".match(/(?<double>.)\\k<double>/);',
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
'foo'.match(_wrapRegExp(/(.)\\1/, { double: 1 }));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — looks like a group unicode (input)',
    source: `/no-groups-\\(?<looks-like-a-group>looks\\)\\u{10000}/u;
`,
    filename: 'input.js',
    output: '/no-groups-\\(?<looks-like-a-group>looks\\)\\u{10000}/u;',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — looks like a group (input)',
    source: `/no-groups-\\(?<looks-like-a-group>looks\\)/;
`,
    filename: 'input.js',
    output: '/no-groups-\\(?<looks-like-a-group>looks\\)/;',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — name hasOwnProperty (exec)',
    source: `expect("hasOwnPropertyhasOwnProperty".match(/(?<hasOwnProperty>hasOwnProperty)\\k<hasOwnProperty>/)[1]).toBe("hasOwnProperty");
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
expect(
  'hasOwnPropertyhasOwnProperty'.match(_wrapRegExp(/(hasOwnProperty)\\1/, { hasOwnProperty: 1 }))[1],
).toBe('hasOwnProperty');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — name hasOwnProperty (input)',
    source: `"hasOwnPropertyhasOwnProperty".match(/(?<hasOwnProperty>hasOwnProperty)\\k<hasOwnProperty>/);
`,
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
'hasOwnPropertyhasOwnProperty'.match(_wrapRegExp(/(hasOwnProperty)\\1/, { hasOwnProperty: 1 }));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — name proto (exec)',
    source: `expect("__proto____proto__".match(/(?<__proto__>__proto__)\\k<__proto__>/)[1]).toBe("__proto__");
`,
    filename: 'exec.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
expect('__proto____proto__'.match(_wrapRegExp(/(__proto__)\\1/, { ['__proto__']: 1 }))[1]).toBe(
  '__proto__',
);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — name proto (input)',
    source: `"__proto____proto__".match(/(?<__proto__>__proto__)\\k<__proto__>/);
`,
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
'__proto____proto__'.match(_wrapRegExp(/(__proto__)\\1/, { ['__proto__']: 1 }));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — only when named groups (input)',
    source: '"foo".match(/(.)\\1/);',
    filename: 'input.js',
    output: "'foo'.match(/(.)\\1/);",
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — skips anonymous capturing groups (input)',
    source: '"abba".match(/(.)(?<n>.)\\k<n>\\1/);',
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
'abba'.match(_wrapRegExp(/(.)(.)\\2\\1/, { n: 2 }));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'wrapper — test method (input)',
    source: '/^(?<x>.)\\k<x>$/.test("aa");',
    filename: 'input.js',
    output: `var _wrapRegExp2 = (() => {
    var h = {
        typeof: function (e, s) {
          function u(a) {
            '@babel/helpers - typeof';
            return (
              (e.exports = u =
                typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
                  ? function (t) {
                      return typeof t;
                    }
                  : function (t) {
                      return t &&
                        typeof Symbol == 'function' &&
                        t.constructor === Symbol &&
                        t !== Symbol.prototype
                        ? 'symbol'
                        : typeof t;
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        setPrototypeOf: function (e, s) {
          function u(a, t) {
            return (
              (e.exports = u =
                Object.setPrototypeOf
                  ? Object.setPrototypeOf.bind()
                  : function (p, c) {
                      return ((p.__proto__ = c), p);
                    }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports),
              u(a, t)
            );
          }
          ((e.exports = u), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        inherits: function (e, s) {
          var u = s('setPrototypeOf');
          function a(t, p) {
            if (typeof p != 'function' && p !== null)
              throw new TypeError('Super expression must either be null or a function');
            ((t.prototype = Object.create(p && p.prototype, {
              constructor: {
                value: t,
                writable: !0,
                configurable: !0,
              },
            })),
              Object.defineProperty(t, 'prototype', { writable: !1 }),
              p && u(t, p));
          }
          ((e.exports = a), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
        wrapRegExp: function (e, s) {
          var u = s('typeof').default,
            a = s('setPrototypeOf'),
            t = s('inherits');
          function p() {
            ((e.exports = p =
              function (o, r) {
                return new x(o, void 0, r);
              }),
              (e.exports.__esModule = !0),
              (e.exports.default = e.exports));
            var c = RegExp.prototype,
              b = new WeakMap();
            function x(o, r, f) {
              var i = RegExp(o, r);
              return (b.set(i, f || b.get(o)), a(i, x.prototype));
            }
            function v(o, r) {
              var f = b.get(r);
              return Object.keys(f).reduce(function (i, n) {
                var l = f[n];
                if (typeof l == 'number') i[n] = o[l];
                else {
                  for (var y = 0; o[l[y]] === void 0 && y + 1 < l.length;) y++;
                  i[n] = o[l[y]];
                }
                return i;
              }, Object.create(null));
            }
            return (
              t(x, RegExp),
              (x.prototype.exec = function (o) {
                var r = c.exec.call(this, o);
                if (r) {
                  r.groups = v(r, this);
                  var f = r.indices;
                  f && (f.groups = v(f, this));
                }
                return r;
              }),
              (x.prototype[Symbol.replace] = function (o, r) {
                if (typeof r == 'string') {
                  var f = b.get(this);
                  return c[Symbol.replace].call(
                    this,
                    o,
                    r.replace(/\\$<([^>]+)(>|$)/g, function (n, l, y) {
                      if (y === '') return n;
                      var g = f[l];
                      return Array.isArray(g)
                        ? '$' + g.join('$')
                        : typeof g == 'number'
                          ? '$' + g
                          : '';
                    }),
                  );
                }
                if (typeof r == 'function') {
                  var i = this;
                  return c[Symbol.replace].call(this, o, function () {
                    var n = arguments;
                    return (
                      u(n[n.length - 1]) != 'object' && (n = [].slice.call(n)).push(v(n, i)),
                      r.apply(this, n)
                    );
                  });
                }
                return c[Symbol.replace].call(this, o, r);
              }),
              p.apply(this, arguments)
            );
          }
          ((e.exports = p), (e.exports.__esModule = !0), (e.exports.default = e.exports));
        },
      },
      d = {};
    function _(e) {
      if (d[e]) return d[e].exports;
      var s = (d[e] = { exports: {} });
      return (h[e](s, _), s.exports);
    }
    return { wrapRegExp: _('wrapRegExp') };
  })(),
  _wrapRegExp = _wrapRegExp2.wrapRegExp;
_wrapRegExp(/^(.)\\1$/, { x: 1 }).test('aa');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpNamedCaptureGroups: true,
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
