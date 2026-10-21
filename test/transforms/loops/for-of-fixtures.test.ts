import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'allowArrayLike — holes (exec)',
    source: `var p2 = { 0: "a", 2: "c", length: 3 };

var arr = [];
for (var x of p2) arr.push(x);

expect(arr).toEqual(["a", undefined, "c"]);
expect(1 in arr).toBe(true); // Not holey
`,
    filename: 'exec.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
var p2 = {
  0: 'a',
  2: 'c',
  length: 3,
};
var arr = [];
{
  var _iterator = _createForOfIteratorHelper(p2),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var x = _step.value;
      arr.push(x);
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
expect(arr).toEqual(['a', undefined, 'c']);
expect(1 in arr).toBe(true);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'allowArrayLike — length cropped (exec)',
    source: `var p2 = { 0: "b", 1: "c", 2: "d", length: 2 };

var arr = [];
for (var x of p2) arr.push(x);

expect(arr).toEqual(["b", "c"]);
`,
    filename: 'exec.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
var p2 = {
  0: 'b',
  1: 'c',
  2: 'd',
  length: 2,
};
var arr = [];
{
  var _iterator = _createForOfIteratorHelper(p2),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var x = _step.value;
      arr.push(x);
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
expect(arr).toEqual(['b', 'c']);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (exec)',
    source: `var p2 = { 0: "b", 1: "c", 2: "d", length: 3 };

var arr = [];
for (var x of p2) arr.push(x);

expect(arr).toEqual(["b", "c", "d"]);
`,
    filename: 'exec.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
var p2 = {
  0: 'b',
  1: 'c',
  2: 'd',
  length: 3,
};
var arr = [];
{
  var _iterator = _createForOfIteratorHelper(p2),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var x = _step.value;
      arr.push(x);
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
expect(arr).toEqual(['b', 'c', 'd']);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (input)',
    source: `for (var x of p2) arr.push(x);
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(p2),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var x = _step.value;
      arr.push(x);
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for await of (input)',
    source: `async () => { for await (let foo of []); };
`,
    filename: 'input.js',
    output: `async () => {
  for await (let foo of []);
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of array pattern (input)',
    source: `let elm;
for ([elm] of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
let elm;
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      [elm] = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration array pattern (input)',
    source: `for (const [elm] of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const [elm] = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration (input)',
    source: `for (const elm of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const elm = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression declaration (input)',
    source: `for (const i of items) i;
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(items),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const i = _step.value;
      i;
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression (input)',
    source: `let i;
for (i of items) i;
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
let i;
{
  var _iterator = _createForOfIteratorHelper(items),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      i = _step.value;
      i;
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of import amd (input)',
    source: `import { array } from "foo";

for (const elm of array) {
  console.log(elm);
}
`,
    filename: 'input.mjs',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
import { array } from 'foo';
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const elm = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of modify iterable (input)',
    source: `for (let o of arr) {
  arr = null;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let o = _step.value;
      {
        arr = null;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body array pattern (input)',
    source: `for (const [head, ...tail] of array) {
  const head = 1;
  console.log(tail);
  console.log(head);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const [head, ...tail] = _step.value;
      {
        const head = 1;
        console.log(tail);
        console.log(head);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body object pattern (input)',
    source: `for (const [type, ...rest] of array) {
  const type = 1;
  console.log(rest);
  console.log(type);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const [type, ...rest] = _step.value;
      {
        const type = 1;
        console.log(rest);
        console.log(type);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body array pattern (input)',
    source: `for (const [head, ...tail] of array) {
  const head = 1;
  let tail;
  console.log(tail);
  console.log(head);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const [head, ...tail] = _step.value;
      {
        const head = 1;
        let tail;
        console.log(tail);
        console.log(head);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body object pattern (input)',
    source: `for (const {type, ...rest} of array) {
  const type = 1;
  let rest;
  console.log(rest);
  console.log(type);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const { type, ...rest } = _step.value;
      {
        const type = 1;
        let rest;
        console.log(rest);
        console.log(type);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body (input)',
    source: `for (const elm of array) {
  const elm = 2;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const elm = _step.value;
      {
        const elm = 2;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclare iterable (input)',
    source: `for (let o of arr) {
  const arr = o;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let o = _step.value;
      {
        const arr = o;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static declaration (input)',
    source: `const array = [];

for (const elm of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
const array = [];
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const elm = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static (input)',
    source: `const array = [];
let elm;

for (elm of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
const array = [];
let elm;
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      elm = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of (input)',
    source: `let elm;

for (elm of array) {
  console.log(elm);
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
let elm;
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      elm = _step.value;
      {
        console.log(elm);
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — identifier (input)',
    source: `for (i of arr) {

}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      i = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — ignore cases (input)',
    source: `for (var i of foo) {
  switch (i) {
    case 1:
      break;
  }
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(foo),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var i = _step.value;
      {
        switch (i) {
          case 1:
            break;
        }
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — let (input)',
    source: `for (let i of arr) {

}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let i = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — member expression (input)',
    source: `for (obj.prop of arr) {

}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      obj.prop = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — multiple (input)',
    source: `for (var i of arr) {

}

for (var i of numbers) {

}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var i = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
{
  var _iterator7 = _createForOfIteratorHelper(numbers),
    _step8;
  try {
    for (_iterator7.s(); (_step8 = _iterator7.n()), !_step8.done;) {
      var i = _step8.value;
      {
      }
    }
  } catch (_iteratorError29) {
    _iterator7.e(_iteratorError29);
  } finally {
    _iterator7.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — nested label for of (input)',
    source: `b: for (let c of d()) {
  for (let e of f()) {
    continue b;
  }
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(d()),
    _step;
  try {
    b: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let c = _step.value;
      {
        {
          var _iterator8 = _createForOfIteratorHelper(f()),
            _step9;
          try {
            for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {
              let e = _step9.value;
              {
                continue b;
              }
            }
          } catch (_iteratorError210) {
            _iterator8.e(_iteratorError210);
          } finally {
            _iterator8.f();
          }
        }
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — var (input)',
    source: `for (var i of arr) {

}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      var i = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'for of as array — for of redeclaration in body (input)',
    source: `for (const elm of array) {
  const elm = 2;
}

for (let x of []) {
  let x = 1;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const elm = _step.value;
      {
        const elm = 2;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
{
  var _iterator7 = _createForOfIteratorHelper([]),
    _step8;
  try {
    for (_iterator7.s(); (_step8 = _iterator7.n()), !_step8.done;) {
      let x = _step8.value;
      {
        let x = 1;
      }
    }
  } catch (_iteratorError29) {
    _iterator7.e(_iteratorError29);
  } finally {
    _iterator7.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'loose — for of redeclaration in body (input)',
    source: `for (let x of y) {
  let x = 1;
  let y = 2;
}

for (let x of []) {
  let x = 1;
  let y = 2;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(y),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let x = _step.value;
      {
        let x = 1;
        let y = 2;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
{
  var _iterator6 = _createForOfIteratorHelper([]),
    _step7;
  try {
    for (_iterator6.s(); (_step7 = _iterator6.n()), !_step7.done;) {
      let x = _step7.value;
      {
        let x = 1;
        let y = 2;
      }
    }
  } catch (_iteratorError28) {
    _iterator6.e(_iteratorError28);
  } finally {
    _iterator6.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — array binding (input)',
    source: `const x = [];
for (const y of x) {}
const arr = Object.entries(x);
for (const y of arr) {}

`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
const x = [];
{
  var _iterator = _createForOfIteratorHelper(x),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const y = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
const arr = Object.entries(x);
{
  var _iterator8 = _createForOfIteratorHelper(arr),
    _step9;
  try {
    for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {
      const y = _step9.value;
      {
      }
    }
  } catch (_iteratorError210) {
    _iterator8.e(_iteratorError210);
  } finally {
    _iterator8.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — built ins (input)',
    source: `for (const y of []) {}
for (const y of Array.from(x)) {}
for (const y of Object.keys(x)) {}
for (const y of Object.values(x)) {}
for (const y of Object.entries(x)) {}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper([]),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const y = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
{
  var _iterator8 = _createForOfIteratorHelper(Array.from(x)),
    _step9;
  try {
    for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {
      const y = _step9.value;
      {
      }
    }
  } catch (_iteratorError210) {
    _iterator8.e(_iteratorError210);
  } finally {
    _iterator8.f();
  }
}
{
  var _iterator11 = _createForOfIteratorHelper(Object.keys(x)),
    _step12;
  try {
    for (_iterator11.s(); (_step12 = _iterator11.n()), !_step12.done;) {
      const y = _step12.value;
      {
      }
    }
  } catch (_iteratorError213) {
    _iterator11.e(_iteratorError213);
  } finally {
    _iterator11.f();
  }
}
{
  var _iterator14 = _createForOfIteratorHelper(Object.values(x)),
    _step15;
  try {
    for (_iterator14.s(); (_step15 = _iterator14.n()), !_step15.done;) {
      const y = _step15.value;
      {
      }
    }
  } catch (_iteratorError216) {
    _iterator14.e(_iteratorError216);
  } finally {
    _iterator14.f();
  }
}
{
  var _iterator17 = _createForOfIteratorHelper(Object.entries(x)),
    _step18;
  try {
    for (_iterator17.s(); (_step18 = _iterator17.n()), !_step18.done;) {
      const y = _step18.value;
      {
      }
    }
  } catch (_iteratorError219) {
    _iterator17.e(_iteratorError219);
  } finally {
    _iterator17.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — type annotation array flow deopt (input)',
    source: `// @flow
// This won't be optimize because when \`for-of\` is handled, the b's type annotation has been removed by the Flow plugin
function a(b: Array<any>) {
  for (const y of b) {}
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
// @flow
// This won't be optimize because when \`for-of\` is handled, the b's type annotation has been removed by the Flow plugin
function a(b) {
  {
    var _iterator = _createForOfIteratorHelper(b),
      _step;
    try {
      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
        const y = _step.value;
        {
        }
      }
    } catch (_iteratorError2) {
      _iterator.e(_iteratorError2);
    } finally {
      _iterator.f();
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — type annotation array flow (input)',
    source: `// @flow
for (const y of (b: Array<any>)) {}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
// @flow
{
  var _iterator = _createForOfIteratorHelper(b),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const y = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — type annotation array ts deopt (input)',
    source: `// This won't be optimize because when \`for-of\` is handled, the b's type annotation has been removed by the TS plugin
function a(b: Array<any>) {
  for (const y of b) {}
}
`,
    filename: 'input.ts',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
// This won't be optimize because when \`for-of\` is handled, the b's type annotation has been removed by the TS plugin
function a(b) {
  {
    var _iterator = _createForOfIteratorHelper(b),
      _step;
    try {
      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
        const y = _step.value;
        {
        }
      }
    } catch (_iteratorError2) {
      _iterator.e(_iteratorError2);
    } finally {
      _iterator.f();
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'opt — type annotation array ts (input)',
    source: `for (const y of (b as Array<any>)) {}
`,
    filename: 'input.ts',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(b),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      const y = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — if block label 3858 (input)',
    source: `if ( true ) {
  loop: for (let ch of []) {
  }
}

`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
if (true) {
  {
    var _iterator = _createForOfIteratorHelper([]),
      _step;
    try {
      loop: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
        let ch = _step.value;
        {
        }
      }
    } catch (_iteratorError2) {
      _iterator.e(_iteratorError2);
    } finally {
      _iterator.f();
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — if block label generic iterable 12610 (input)',
    source: `if (true)
  actions: for (let x of y) {
    continue actions
  }
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
if (true) {
  var _iterator = _createForOfIteratorHelper(y),
    _step;
  try {
    actions: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let x = _step.value;
      {
        continue actions;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — if label 3858 (input)',
    source: `if ( true )
  loop: for (let ch of []) {
  }

`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
if (true) {
  var _iterator = _createForOfIteratorHelper([]),
    _step;
  try {
    loop: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let ch = _step.value;
      {
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — label object with comment 4995 (input)',
    source: `myLabel: //woops
for (let a of b) {
  continue myLabel;
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
{
  var _iterator = _createForOfIteratorHelper(b),
    _step;
  try {
    myLabel: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let a = _step.value;
      {
        continue myLabel;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — redeclare array 8913 (input)',
    source: `function f(...t) {
  for (let o of t) {
    const t = o;
  }
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
function f(...t) {
  {
    var _iterator = _createForOfIteratorHelper(t),
      _step;
    try {
      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
        let o = _step.value;
        {
          const t = o;
        }
      }
    } catch (_iteratorError2) {
      _iterator.e(_iteratorError2);
    } finally {
      _iterator.f();
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — regression 1169 (input)',
    source: `function foo() {
  let input = ['a', 'b', 'c']
  let output = {}

  for (let c of input) {
    let name = c
    output[name] = name
  }

  return output
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
function foo() {
  let input = ['a', 'b', 'c'];
  let output = {};
  {
    var _iterator = _createForOfIteratorHelper(input),
      _step;
    try {
      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
        let c = _step.value;
        {
          let name = c;
          output[name] = name;
        }
      }
    } catch (_iteratorError2) {
      _iterator.e(_iteratorError2);
    } finally {
      _iterator.f();
    }
  }
  return output;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — scope 9696 (exec)',
    source: `var arr = [1, 2, 3];
var results = [];

for (let v of arr) {
  results.push(v);
  arr = null;
}

expect(results).toEqual([1, 2, 3]);
`,
    filename: 'exec.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
var arr = [1, 2, 3];
var results = [];
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let v = _step.value;
      {
        results.push(v);
        arr = null;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}
expect(results).toEqual([1, 2, 3]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — scope 9696 (input)',
    source: `var arr = [1,2,3]

for (let v of arr) {
  console.log(v)
  arr = null
}
`,
    filename: 'input.js',
    output: `var _createForOfIteratorHelper = (function () {
  var arrayLikeToArray = function (r, a) {
      (a == null || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    },
    unsupportedIterableToArray = function (r, a) {
      if (r) {
        if (typeof r == 'string') return arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return (
          t === 'Object' && r.constructor && (t = r.constructor.name),
          t === 'Map' || t === 'Set'
            ? Array.from(r)
            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              ? arrayLikeToArray(r, a)
              : void 0
        );
      }
    };
  return function (r, e) {
    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];
    if (!t) {
      if (
        Array.isArray(r) ||
        (t = unsupportedIterableToArray(r)) ||
        (e && r && typeof r.length == 'number')
      ) {
        t && (r = t);
        var _n = 0,
          F = function () {};
        return {
          s: F,
          n: function () {
            return _n >= r.length
              ? { done: !0 }
              : {
                  done: !1,
                  value: r[_n++],
                };
          },
          e: function (r2) {
            throw r2;
          },
          f: F,
        };
      }
      throw new TypeError(\`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.\`);
    }
    var o,
      a = !0,
      u = !1;
    return {
      s: function () {
        t = t.call(r);
      },
      n: function () {
        var r2 = t.next();
        return ((a = r2.done), r2);
      },
      e: function (r2) {
        ((u = !0), (o = r2));
      },
      f: function () {
        try {
          a || t.return == null || t.return();
        } finally {
          if (u) throw o;
        }
      },
    };
  };
})();
var arr = [1, 2, 3];
{
  var _iterator = _createForOfIteratorHelper(arr),
    _step;
  try {
    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
      let v = _step.value;
      {
        console.log(v);
        arr = null;
      }
    }
  } catch (_iteratorError2) {
    _iterator.e(_iteratorError2);
  } finally {
    _iterator.f();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
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
