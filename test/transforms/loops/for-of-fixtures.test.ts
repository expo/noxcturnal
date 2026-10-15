import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nvar p2 = {\n  0: 'a',\n  2: 'c',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iterator = _createForOfIteratorHelper(p2),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\nexpect(arr).toEqual(['a', undefined, 'c']);\nexpect(1 in arr).toBe(true);",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nvar p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 2,\n};\nvar arr = [];\n{\n  var _iterator = _createForOfIteratorHelper(p2),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\nexpect(arr).toEqual(['b', 'c']);",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nvar p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iterator = _createForOfIteratorHelper(p2),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\nexpect(arr).toEqual(['b', 'c', 'd']);",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(p2),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  'async () => {\n  for await (let foo of []);\n};',
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nlet elm;\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(items),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nlet i;\n{\n  var _iterator = _createForOfIteratorHelper(items),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nimport { array } from 'foo';\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let o = _step.value;\n      {\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const [type, ...rest] = _step.value;\n      {\n        const type = 1;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        let tail;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const { type, ...rest } = _step.value;\n      {\n        const type = 1;\n        let rest;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let o = _step.value;\n      {\n        const arr = o;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nconst array = [];\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nconst array = [];\nlet elm;\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nlet elm;\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(foo),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var i = _step.value;\n      {\n        switch (i) {\n          case 1:\n            break;\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      obj.prop = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\n{\n  var _iterator7 = _createForOfIteratorHelper(numbers),\n    _step8;\n  try {\n    for (_iterator7.s(); (_step8 = _iterator7.n()), !_step8.done;) {\n      var i = _step8.value;\n      {\n      }\n    }\n  } catch (_iteratorError29) {\n    _iterator7.e(_iteratorError29);\n  } finally {\n    _iterator7.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(d()),\n    _step;\n  try {\n    b: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let c = _step.value;\n      {\n        {\n          var _iterator8 = _createForOfIteratorHelper(f()),\n            _step9;\n          try {\n            for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {\n              let e = _step9.value;\n              {\n                continue b;\n              }\n            }\n          } catch (_iteratorError210) {\n            _iterator8.e(_iteratorError210);\n          } finally {\n            _iterator8.f();\n          }\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(array),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\n{\n  var _iterator7 = _createForOfIteratorHelper([]),\n    _step8;\n  try {\n    for (_iterator7.s(); (_step8 = _iterator7.n()), !_step8.done;) {\n      let x = _step8.value;\n      {\n        let x = 1;\n      }\n    }\n  } catch (_iteratorError29) {\n    _iterator7.e(_iteratorError29);\n  } finally {\n    _iterator7.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(y),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let x = _step.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\n{\n  var _iterator6 = _createForOfIteratorHelper([]),\n    _step7;\n  try {\n    for (_iterator6.s(); (_step7 = _iterator6.n()), !_step7.done;) {\n      let x = _step7.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError28) {\n    _iterator6.e(_iteratorError28);\n  } finally {\n    _iterator6.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nconst x = [];\n{\n  var _iterator = _createForOfIteratorHelper(x),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\nconst arr = Object.entries(x);\n{\n  var _iterator8 = _createForOfIteratorHelper(arr),\n    _step9;\n  try {\n    for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {\n      const y = _step9.value;\n      {\n      }\n    }\n  } catch (_iteratorError210) {\n    _iterator8.e(_iteratorError210);\n  } finally {\n    _iterator8.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper([]),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\n{\n  var _iterator8 = _createForOfIteratorHelper(Array.from(x)),\n    _step9;\n  try {\n    for (_iterator8.s(); (_step9 = _iterator8.n()), !_step9.done;) {\n      const y = _step9.value;\n      {\n      }\n    }\n  } catch (_iteratorError210) {\n    _iterator8.e(_iteratorError210);\n  } finally {\n    _iterator8.f();\n  }\n}\n{\n  var _iterator11 = _createForOfIteratorHelper(Object.keys(x)),\n    _step12;\n  try {\n    for (_iterator11.s(); (_step12 = _iterator11.n()), !_step12.done;) {\n      const y = _step12.value;\n      {\n      }\n    }\n  } catch (_iteratorError213) {\n    _iterator11.e(_iteratorError213);\n  } finally {\n    _iterator11.f();\n  }\n}\n{\n  var _iterator14 = _createForOfIteratorHelper(Object.values(x)),\n    _step15;\n  try {\n    for (_iterator14.s(); (_step15 = _iterator14.n()), !_step15.done;) {\n      const y = _step15.value;\n      {\n      }\n    }\n  } catch (_iteratorError216) {\n    _iterator14.e(_iteratorError216);\n  } finally {\n    _iterator14.f();\n  }\n}\n{\n  var _iterator17 = _createForOfIteratorHelper(Object.entries(x)),\n    _step18;\n  try {\n    for (_iterator17.s(); (_step18 = _iterator17.n()), !_step18.done;) {\n      const y = _step18.value;\n      {\n      }\n    }\n  } catch (_iteratorError219) {\n    _iterator17.e(_iteratorError219);\n  } finally {\n    _iterator17.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n// @flow\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the Flow plugin\nfunction a(b) {\n  {\n    var _iterator = _createForOfIteratorHelper(b),\n      _step;\n    try {\n      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _iterator.e(_iteratorError2);\n    } finally {\n      _iterator.f();\n    }\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n// @flow\n{\n  var _iterator = _createForOfIteratorHelper(b),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the TS plugin\nfunction a(b) {\n  {\n    var _iterator = _createForOfIteratorHelper(b),\n      _step;\n    try {\n      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _iterator.e(_iteratorError2);\n    } finally {\n      _iterator.f();\n    }\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(b),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nif (true) {\n  {\n    var _iterator = _createForOfIteratorHelper([]),\n      _step;\n    try {\n      loop: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n        let ch = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _iterator.e(_iteratorError2);\n    } finally {\n      _iterator.f();\n    }\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nif (true) {\n  var _iterator = _createForOfIteratorHelper(y),\n    _step;\n  try {\n    actions: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let x = _step.value;\n      {\n        continue actions;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nif (true) {\n  var _iterator = _createForOfIteratorHelper([]),\n    _step;\n  try {\n    loop: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let ch = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\n{\n  var _iterator = _createForOfIteratorHelper(b),\n    _step;\n  try {\n    myLabel: for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let a = _step.value;\n      {\n        continue myLabel;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nfunction f(...t) {\n  {\n    var _iterator = _createForOfIteratorHelper(t),\n      _step;\n    try {\n      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n        let o = _step.value;\n        {\n          const t = o;\n        }\n      }\n    } catch (_iteratorError2) {\n      _iterator.e(_iteratorError2);\n    } finally {\n      _iterator.f();\n    }\n  }\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nfunction foo() {\n  let input = ['a', 'b', 'c'];\n  let output = {};\n  {\n    var _iterator = _createForOfIteratorHelper(input),\n      _step;\n    try {\n      for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n        let c = _step.value;\n        {\n          let name = c;\n          output[name] = name;\n        }\n      }\n    } catch (_iteratorError2) {\n      _iterator.e(_iteratorError2);\n    } finally {\n      _iterator.f();\n    }\n  }\n  return output;\n}",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nvar arr = [1, 2, 3];\nvar results = [];\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let v = _step.value;\n      {\n        results.push(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}\nexpect(results).toEqual([1, 2, 3]);",
  "var _createForOfIteratorHelper = (function () {\n  var arrayLikeToArray = function (r, a) {\n      (a == null || a > r.length) && (a = r.length);\n      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];\n      return n;\n    },\n    unsupportedIterableToArray = function (r, a) {\n      if (r) {\n        if (typeof r == 'string') return arrayLikeToArray(r, a);\n        var t = {}.toString.call(r).slice(8, -1);\n        return (\n          t === 'Object' && r.constructor && (t = r.constructor.name),\n          t === 'Map' || t === 'Set'\n            ? Array.from(r)\n            : t === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)\n              ? arrayLikeToArray(r, a)\n              : void 0\n        );\n      }\n    };\n  return function (r, e) {\n    var t = (typeof Symbol != 'undefined' && r[Symbol.iterator]) || r['@@iterator'];\n    if (!t) {\n      if (\n        Array.isArray(r) ||\n        (t = unsupportedIterableToArray(r)) ||\n        (e && r && typeof r.length == 'number')\n      ) {\n        t && (r = t);\n        var _n = 0,\n          F = function () {};\n        return {\n          s: F,\n          n: function () {\n            return _n >= r.length\n              ? { done: !0 }\n              : {\n                  done: !1,\n                  value: r[_n++],\n                };\n          },\n          e: function (r2) {\n            throw r2;\n          },\n          f: F,\n        };\n      }\n      throw new TypeError(`Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);\n    }\n    var o,\n      a = !0,\n      u = !1;\n    return {\n      s: function () {\n        t = t.call(r);\n      },\n      n: function () {\n        var r2 = t.next();\n        return ((a = r2.done), r2);\n      },\n      e: function (r2) {\n        ((u = !0), (o = r2));\n      },\n      f: function () {\n        try {\n          a || t.return == null || t.return();\n        } finally {\n          if (u) throw o;\n        }\n      },\n    };\n  };\n})();\nvar arr = [1, 2, 3];\n{\n  var _iterator = _createForOfIteratorHelper(arr),\n    _step;\n  try {\n    for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {\n      let v = _step.value;\n      {\n        console.log(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _iterator.e(_iteratorError2);\n  } finally {\n    _iterator.f();\n  }\n}",
];

export const fixtureCases = [
  {
    title: 'allowArrayLike — holes (exec)',
    source:
      'var p2 = { 0: "a", 2: "c", length: 3 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["a", undefined, "c"]);\nexpect(1 in arr).toBe(true); // Not holey\n',
    filename: 'exec.js',
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
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'allowArrayLike — length cropped (exec)',
    source:
      'var p2 = { 0: "b", 1: "c", 2: "d", length: 2 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["b", "c"]);\n',
    filename: 'exec.js',
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
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (exec)',
    source:
      'var p2 = { 0: "b", 1: "c", 2: "d", length: 3 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["b", "c", "d"]);\n',
    filename: 'exec.js',
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
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (input)',
    source: 'for (var x of p2) arr.push(x);\n',
    filename: 'input.js',
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
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for await of (input)',
    source: 'async () => { for await (let foo of []); };\n',
    filename: 'input.js',
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
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of array pattern (input)',
    source: 'let elm;\nfor ([elm] of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration array pattern (input)',
    source: 'for (const [elm] of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration (input)',
    source: 'for (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression declaration (input)',
    source: 'for (const i of items) i;\n',
    filename: 'input.js',
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
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression (input)',
    source: 'let i;\nfor (i of items) i;\n',
    filename: 'input.js',
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
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of import amd (input)',
    source: 'import { array } from "foo";\n\nfor (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.mjs',
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
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of modify iterable (input)',
    source: 'for (let o of arr) {\n  arr = null;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body array pattern (input)',
    source:
      'for (const [head, ...tail] of array) {\n  const head = 1;\n  console.log(tail);\n  console.log(head);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body object pattern (input)',
    source:
      'for (const [type, ...rest] of array) {\n  const type = 1;\n  console.log(rest);\n  console.log(type);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body array pattern (input)',
    source:
      'for (const [head, ...tail] of array) {\n  const head = 1;\n  let tail;\n  console.log(tail);\n  console.log(head);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body object pattern (input)',
    source:
      'for (const {type, ...rest} of array) {\n  const type = 1;\n  let rest;\n  console.log(rest);\n  console.log(type);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body (input)',
    source: 'for (const elm of array) {\n  const elm = 2;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclare iterable (input)',
    source: 'for (let o of arr) {\n  const arr = o;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static declaration (input)',
    source: 'const array = [];\n\nfor (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static (input)',
    source: 'const array = [];\nlet elm;\n\nfor (elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of (input)',
    source: 'let elm;\n\nfor (elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — identifier (input)',
    source: 'for (i of arr) {\n\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — ignore cases (input)',
    source: 'for (var i of foo) {\n  switch (i) {\n    case 1:\n      break;\n  }\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — let (input)',
    source: 'for (let i of arr) {\n\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — member expression (input)',
    source: 'for (obj.prop of arr) {\n\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — multiple (input)',
    source: 'for (var i of arr) {\n\n}\n\nfor (var i of numbers) {\n\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — nested label for of (input)',
    source: 'b: for (let c of d()) {\n  for (let e of f()) {\n    continue b;\n  }\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — var (input)',
    source: 'for (var i of arr) {\n\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'for of as array — for of redeclaration in body (input)',
    source:
      'for (const elm of array) {\n  const elm = 2;\n}\n\nfor (let x of []) {\n  let x = 1;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'loose — for of redeclaration in body (input)',
    source:
      'for (let x of y) {\n  let x = 1;\n  let y = 2;\n}\n\nfor (let x of []) {\n  let x = 1;\n  let y = 2;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'opt — array binding (input)',
    source:
      'const x = [];\nfor (const y of x) {}\nconst arr = Object.entries(x);\nfor (const y of arr) {}\n\n',
    filename: 'input.js',
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
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'opt — built ins (input)',
    source:
      'for (const y of []) {}\nfor (const y of Array.from(x)) {}\nfor (const y of Object.keys(x)) {}\nfor (const y of Object.values(x)) {}\nfor (const y of Object.entries(x)) {}\n',
    filename: 'input.js',
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
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'opt — type annotation array flow deopt (input)',
    source:
      "// @flow\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the Flow plugin\nfunction a(b: Array<any>) {\n  for (const y of b) {}\n}\n",
    filename: 'input.js',
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
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'opt — type annotation array flow (input)',
    source: '// @flow\nfor (const y of (b: Array<any>)) {}\n',
    filename: 'input.js',
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
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'opt — type annotation array ts deopt (input)',
    source:
      "// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the TS plugin\nfunction a(b: Array<any>) {\n  for (const y of b) {}\n}\n",
    filename: 'input.ts',
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
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'opt — type annotation array ts (input)',
    source: 'for (const y of (b as Array<any>)) {}\n',
    filename: 'input.ts',
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
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'regression — if block label 3858 (input)',
    source: 'if ( true ) {\n  loop: for (let ch of []) {\n  }\n}\n\n',
    filename: 'input.js',
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
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'regression — if block label generic iterable 12610 (input)',
    source: 'if (true)\n  actions: for (let x of y) {\n    continue actions\n  }\n',
    filename: 'input.js',
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
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'regression — if label 3858 (input)',
    source: 'if ( true )\n  loop: for (let ch of []) {\n  }\n\n',
    filename: 'input.js',
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
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'regression — label object with comment 4995 (input)',
    source: 'myLabel: //woops\nfor (let a of b) {\n  continue myLabel;\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'regression — redeclare array 8913 (input)',
    source: 'function f(...t) {\n  for (let o of t) {\n    const t = o;\n  }\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'regression — regression 1169 (input)',
    source:
      "function foo() {\n  let input = ['a', 'b', 'c']\n  let output = {}\n\n  for (let c of input) {\n    let name = c\n    output[name] = name\n  }\n\n  return output\n}\n",
    filename: 'input.js',
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
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'regression — scope 9696 (exec)',
    source:
      'var arr = [1, 2, 3];\nvar results = [];\n\nfor (let v of arr) {\n  results.push(v);\n  arr = null;\n}\n\nexpect(results).toEqual([1, 2, 3]);\n',
    filename: 'exec.js',
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
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'regression — scope 9696 (input)',
    source: 'var arr = [1,2,3]\n\nfor (let v of arr) {\n  console.log(v)\n  arr = null\n}\n',
    filename: 'input.js',
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
        output: expectedOutputs[43],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
