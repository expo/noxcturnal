import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "'use strict';\nvar _obj$a, _obj$b, _obj$a2;\nconst obj = { a: { b: { c: { d: 2 } } } };\nconst a = obj === null || obj === void 0 ? void 0 : obj.a;\nexpect(a).toBe(obj.a);\nconst b =\n  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n    ? void 0\n    : _obj$a.b;\nexpect(b).toBe(obj.a.b);\nconst bad =\n  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n    ? void 0\n    : _obj$b.b;\nexpect(bad).toBeUndefined();\nlet val;\nval =\n  obj === null || obj === void 0 || (_obj$a2 = obj.a) === null || _obj$a2 === void 0\n    ? void 0\n    : _obj$a2.b;\nexpect(val).toBe(obj.a.b);\nexpect(() => {\n  const bad = obj === null || obj === void 0 ? void 0 : obj.b.b;\n}).toThrow();",
  "'use strict';\nvar _obj$a, _obj$b, _obj$a2;\nconst obj = { a: { b: { c: { d: 2 } } } };\nconst a = obj == null ? void 0 : obj.a;\nexpect(a).toBe(obj.a);\nconst b = obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b;\nexpect(b).toBe(obj.a.b);\nconst bad = obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b;\nexpect(bad).toBeUndefined();\nlet val;\nval = obj == null || (_obj$a2 = obj.a) == null ? void 0 : _obj$a2.b;\nexpect(val).toBe(obj.a.b);\nexpect(() => {\n  const bad = obj == null ? void 0 : obj.b.b;\n}).toThrow();",
  "'use strict';\nvar _obj$a, _obj$b, _obj$a2;\nconst obj = { a: { b: { c: { d: 2 } } } };\nconst a = obj === null || obj === void 0 ? void 0 : obj.a;\nconst b =\n  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n    ? void 0\n    : _obj$a.b;\nconst bad =\n  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n    ? void 0\n    : _obj$b.b;\nlet val;\nval =\n  obj === null || obj === void 0 || (_obj$a2 = obj.a) === null || _obj$a2 === void 0\n    ? void 0\n    : _obj$a2.b;",
  "'use strict';\nvar _obj$a, _obj$b, _obj$a2;\nconst obj = { a: { b: { c: { d: 2 } } } };\nconst a = obj == null ? void 0 : obj.a;\nconst b = obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b;\nconst bad = obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b;\nlet val;\nval = obj == null || (_obj$a2 = obj.a) == null ? void 0 : _obj$a2.b;",
  '',
  'class C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : o.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    var _o$a$b;\n    return (\n      o === null || o === void 0 || (_o$a$b = o.a.b) === null || _o$a$b === void 0\n        ? void 0\n        : _o$a$b.c.d\n    )\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : o.a.b.c.d) {\n      var _o$a$b$c;\n      for (\n        ;\n        o === null || o === void 0 || (_o$a$b$c = o.a.b.c) === null || _o$a$b$c === void 0\n          ? void 0\n          : _o$a$b$c.d;\n      ) {\n        var _o$a$b2;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          o === null || o === void 0 || (_o$a$b2 = o.a.b) === null || _o$a$b2 === void 0\n            ? void 0\n            : _o$a$b2.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    var _o$a$b3;\n    return !!(o === null || o === void 0 || (_o$a$b3 = o.a.b) === null || _o$a$b3 === void 0\n      ? void 0\n      : _o$a$b3.c.d);\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      (_o$obj = o.obj) === null ||\n      _o$obj === void 0 ||\n      (_o$obj = _o$obj.a.b) === null ||\n      _o$obj === void 0\n        ? void 0\n        : _o$obj.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return (\n      (_o$obj2 = o.obj) === null ||\n      _o$obj2 === void 0 ||\n      (_o$obj2 = _o$obj2.a.b) === null ||\n      _o$obj2 === void 0\n        ? void 0\n        : _o$obj2.c.d\n    )\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while ((_o$obj3 = o.obj) === null || _o$obj3 === void 0 ? void 0 : _o$obj3.a.b.c.d) {\n      var _o$obj4;\n      for (\n        ;\n        (_o$obj4 = o.obj) === null ||\n        _o$obj4 === void 0 ||\n        (_o$obj4 = _o$obj4.a.b.c) === null ||\n        _o$obj4 === void 0\n          ? void 0\n          : _o$obj4.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (_o$obj5 = o.obj) === null ||\n          _o$obj5 === void 0 ||\n          (_o$obj5 = _o$obj5.a.b) === null ||\n          _o$obj5 === void 0\n            ? void 0\n            : _o$obj5.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!((_o$obj6 = o.obj) === null ||\n    _o$obj6 === void 0 ||\n    (_o$obj6 = _o$obj6.a.b) === null ||\n    _o$obj6 === void 0\n      ? void 0\n      : _o$obj6.c.d);\n  }\n  static testLogicalInIf(o) {\n    var _o$a$b4, _o$a;\n    if (\n      (o === null || o === void 0 || (_o$a$b4 = o.a.b) === null || _o$a$b4 === void 0\n        ? void 0\n        : _o$a$b4.c.d) &&\n      (o === null || o === void 0 || (_o$a = o.a) === null || _o$a === void 0 ? void 0 : _o$a.b.c.d)\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    var _o$a$b5, _o$a2;\n    return (\n      (o === null || o === void 0 || (_o$a$b5 = o.a.b) === null || _o$a$b5 === void 0\n        ? void 0\n        : _o$a$b5.c.d) &&\n      (o === null || o === void 0 || (_o$a2 = o.a) === null || _o$a2 === void 0\n        ? void 0\n        : _o$a2.b.c.d)\n    );\n  }\n  static testNullishCoalescing(o) {\n    var _o$a$b6, _o$a$b7, _o$a$b10;\n    if (\n      (o === null || o === void 0 || (_o$a$b6 = o.a.b) === null || _o$a$b6 === void 0\n        ? void 0\n        : _o$a$b6.c.non_existent) ??\n      (o === null || o === void 0 || (_o$a$b7 = o.a.b) === null || _o$a$b7 === void 0\n        ? void 0\n        : _o$a$b7.c.d)\n    ) {\n      var _o$a$b8, _o$a$b9;\n      return (\n        (o === null || o === void 0 || (_o$a$b8 = o.a.b) === null || _o$a$b8 === void 0\n          ? void 0\n          : _o$a$b8.c.non_existent) ??\n        (o === null || o === void 0 || (_o$a$b9 = o.a.b) === null || _o$a$b9 === void 0\n          ? void 0\n          : _o$a$b9.c.d)\n      );\n    }\n    return (\n      (o === null || o === void 0 || (_o$a$b10 = o.a.b) === null || _o$a$b10 === void 0\n        ? void 0\n        : _o$a$b10.c.non_existent) ?? o\n    );\n  }\n  static test() {\n    const c = { a: { b: { c: { d: 2 } } } };\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\nC.test();\nC.testNullish();',
  'class C {\n  static testIf(o) {\n    if (o == null ? void 0 : o.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    var _o$a$b;\n    return (o == null || (_o$a$b = o.a.b) == null ? void 0 : _o$a$b.c.d) ? true : false;\n  }\n  static testLoop(o) {\n    while (o == null ? void 0 : o.a.b.c.d) {\n      var _o$a$b$c;\n      for (; o == null || (_o$a$b$c = o.a.b.c) == null ? void 0 : _o$a$b$c.d;) {\n        var _o$a$b2;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o == null || (_o$a$b2 = o.a.b) == null ? void 0 : _o$a$b2.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    var _o$a$b3;\n    return !!(o == null || (_o$a$b3 = o.a.b) == null ? void 0 : _o$a$b3.c.d);\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if ((_o$obj = o.obj) == null || (_o$obj = _o$obj.a.b) == null ? void 0 : _o$obj.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) == null || (_o$obj2 = _o$obj2.a.b) == null ? void 0 : _o$obj2.c.d)\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while ((_o$obj3 = o.obj) == null ? void 0 : _o$obj3.a.b.c.d) {\n      var _o$obj4;\n      for (; (_o$obj4 = o.obj) == null || (_o$obj4 = _o$obj4.a.b.c) == null ? void 0 : _o$obj4.d;) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (_o$obj5 = o.obj) == null || (_o$obj5 = _o$obj5.a.b) == null ? void 0 : _o$obj5.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!((_o$obj6 = o.obj) == null || (_o$obj6 = _o$obj6.a.b) == null ? void 0 : _o$obj6.c.d);\n  }\n  static testLogicalInIf(o) {\n    var _o$a$b4, _o$a;\n    if (\n      (o == null || (_o$a$b4 = o.a.b) == null ? void 0 : _o$a$b4.c.d) &&\n      (o == null || (_o$a = o.a) == null ? void 0 : _o$a.b.c.d)\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    var _o$a$b5, _o$a2;\n    return (\n      (o == null || (_o$a$b5 = o.a.b) == null ? void 0 : _o$a$b5.c.d) &&\n      (o == null || (_o$a2 = o.a) == null ? void 0 : _o$a2.b.c.d)\n    );\n  }\n  static testNullishCoalescing(o) {\n    var _o$a$b6, _o$a$b7, _o$a$b10;\n    if (\n      (o == null || (_o$a$b6 = o.a.b) == null ? void 0 : _o$a$b6.c.non_existent) ??\n      (o == null || (_o$a$b7 = o.a.b) == null ? void 0 : _o$a$b7.c.d)\n    ) {\n      var _o$a$b8, _o$a$b9;\n      return (\n        (o == null || (_o$a$b8 = o.a.b) == null ? void 0 : _o$a$b8.c.non_existent) ??\n        (o == null || (_o$a$b9 = o.a.b) == null ? void 0 : _o$a$b9.c.d)\n      );\n    }\n    return (o == null || (_o$a$b10 = o.a.b) == null ? void 0 : _o$a$b10.c.non_existent) ?? o;\n  }\n  static test() {\n    const c = { a: { b: { c: { d: 2 } } } };\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\nC.test();\nC.testNullish();',
  'class C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : o.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    var _o$a$b;\n    return (\n      o === null || o === void 0 || (_o$a$b = o.a.b) === null || _o$a$b === void 0\n        ? void 0\n        : _o$a$b.c.d\n    )\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : o.a.b.c.d) {\n      var _o$a$b$c;\n      for (\n        ;\n        o === null || o === void 0 || (_o$a$b$c = o.a.b.c) === null || _o$a$b$c === void 0\n          ? void 0\n          : _o$a$b$c.d;\n      ) {\n        var _o$a$b2;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          o === null || o === void 0 || (_o$a$b2 = o.a.b) === null || _o$a$b2 === void 0\n            ? void 0\n            : _o$a$b2.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    var _o$a$b3;\n    return !!(o === null || o === void 0 || (_o$a$b3 = o.a.b) === null || _o$a$b3 === void 0\n      ? void 0\n      : _o$a$b3.c.d);\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      (_o$obj = o.obj) === null ||\n      _o$obj === void 0 ||\n      (_o$obj = _o$obj.a.b) === null ||\n      _o$obj === void 0\n        ? void 0\n        : _o$obj.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return (\n      (_o$obj2 = o.obj) === null ||\n      _o$obj2 === void 0 ||\n      (_o$obj2 = _o$obj2.a.b) === null ||\n      _o$obj2 === void 0\n        ? void 0\n        : _o$obj2.c.d\n    )\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while ((_o$obj3 = o.obj) === null || _o$obj3 === void 0 ? void 0 : _o$obj3.a.b.c.d) {\n      var _o$obj4;\n      for (\n        ;\n        (_o$obj4 = o.obj) === null ||\n        _o$obj4 === void 0 ||\n        (_o$obj4 = _o$obj4.a.b.c) === null ||\n        _o$obj4 === void 0\n          ? void 0\n          : _o$obj4.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (_o$obj5 = o.obj) === null ||\n          _o$obj5 === void 0 ||\n          (_o$obj5 = _o$obj5.a.b) === null ||\n          _o$obj5 === void 0\n            ? void 0\n            : _o$obj5.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!((_o$obj6 = o.obj) === null ||\n    _o$obj6 === void 0 ||\n    (_o$obj6 = _o$obj6.a.b) === null ||\n    _o$obj6 === void 0\n      ? void 0\n      : _o$obj6.c.d);\n  }\n  static testLogicalInIf(o) {\n    var _o$a$b4, _o$a;\n    if (\n      (o === null || o === void 0 || (_o$a$b4 = o.a.b) === null || _o$a$b4 === void 0\n        ? void 0\n        : _o$a$b4.c.d) &&\n      (o === null || o === void 0 || (_o$a = o.a) === null || _o$a === void 0 ? void 0 : _o$a.b.c.d)\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    var _o$a$b5, _o$a2;\n    return (\n      (o === null || o === void 0 || (_o$a$b5 = o.a.b) === null || _o$a$b5 === void 0\n        ? void 0\n        : _o$a$b5.c.d) &&\n      (o === null || o === void 0 || (_o$a2 = o.a) === null || _o$a2 === void 0\n        ? void 0\n        : _o$a2.b.c.d)\n    );\n  }\n  static testNullishCoalescing(o) {\n    var _o$a$b6, _o$a$b7, _o$a$b10;\n    if (\n      (o === null || o === void 0 || (_o$a$b6 = o.a.b) === null || _o$a$b6 === void 0\n        ? void 0\n        : _o$a$b6.c.non_existent) ??\n      (o === null || o === void 0 || (_o$a$b7 = o.a.b) === null || _o$a$b7 === void 0\n        ? void 0\n        : _o$a$b7.c.d)\n    ) {\n      var _o$a$b8, _o$a$b9;\n      return (\n        (o === null || o === void 0 || (_o$a$b8 = o.a.b) === null || _o$a$b8 === void 0\n          ? void 0\n          : _o$a$b8.c.non_existent) ??\n        (o === null || o === void 0 || (_o$a$b9 = o.a.b) === null || _o$a$b9 === void 0\n          ? void 0\n          : _o$a$b9.c.d)\n      );\n    }\n    return (\n      (o === null || o === void 0 || (_o$a$b10 = o.a.b) === null || _o$a$b10 === void 0\n        ? void 0\n        : _o$a$b10.c.non_existent) ?? o\n    );\n  }\n}\nC.test();\nC.testNullish();',
  'class C {\n  static testIf(o) {\n    if (o == null ? void 0 : o.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    var _o$a$b;\n    return (o == null || (_o$a$b = o.a.b) == null ? void 0 : _o$a$b.c.d) ? true : false;\n  }\n  static testLoop(o) {\n    while (o == null ? void 0 : o.a.b.c.d) {\n      var _o$a$b$c;\n      for (; o == null || (_o$a$b$c = o.a.b.c) == null ? void 0 : _o$a$b$c.d;) {\n        var _o$a$b2;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o == null || (_o$a$b2 = o.a.b) == null ? void 0 : _o$a$b2.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    var _o$a$b3;\n    return !!(o == null || (_o$a$b3 = o.a.b) == null ? void 0 : _o$a$b3.c.d);\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if ((_o$obj = o.obj) == null || (_o$obj = _o$obj.a.b) == null ? void 0 : _o$obj.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) == null || (_o$obj2 = _o$obj2.a.b) == null ? void 0 : _o$obj2.c.d)\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while ((_o$obj3 = o.obj) == null ? void 0 : _o$obj3.a.b.c.d) {\n      var _o$obj4;\n      for (; (_o$obj4 = o.obj) == null || (_o$obj4 = _o$obj4.a.b.c) == null ? void 0 : _o$obj4.d;) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (_o$obj5 = o.obj) == null || (_o$obj5 = _o$obj5.a.b) == null ? void 0 : _o$obj5.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!((_o$obj6 = o.obj) == null || (_o$obj6 = _o$obj6.a.b) == null ? void 0 : _o$obj6.c.d);\n  }\n  static testLogicalInIf(o) {\n    var _o$a$b4, _o$a;\n    if (\n      (o == null || (_o$a$b4 = o.a.b) == null ? void 0 : _o$a$b4.c.d) &&\n      (o == null || (_o$a = o.a) == null ? void 0 : _o$a.b.c.d)\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    var _o$a$b5, _o$a2;\n    return (\n      (o == null || (_o$a$b5 = o.a.b) == null ? void 0 : _o$a$b5.c.d) &&\n      (o == null || (_o$a2 = o.a) == null ? void 0 : _o$a2.b.c.d)\n    );\n  }\n  static testNullishCoalescing(o) {\n    var _o$a$b6, _o$a$b7, _o$a$b10;\n    if (\n      (o == null || (_o$a$b6 = o.a.b) == null ? void 0 : _o$a$b6.c.non_existent) ??\n      (o == null || (_o$a$b7 = o.a.b) == null ? void 0 : _o$a$b7.c.d)\n    ) {\n      var _o$a$b8, _o$a$b9;\n      return (\n        (o == null || (_o$a$b8 = o.a.b) == null ? void 0 : _o$a$b8.c.non_existent) ??\n        (o == null || (_o$a$b9 = o.a.b) == null ? void 0 : _o$a$b9.c.d)\n      );\n    }\n    return (o == null || (_o$a$b10 = o.a.b) == null ? void 0 : _o$a$b10.c.non_existent) ?? o;\n  }\n}\nC.test();\nC.testNullish();',
  'function f(\n  a = (() => {\n    var _x;\n    return (_x = x) === null || _x === void 0 ? void 0 : _x.y;\n  })(),\n) {}\nfunction g({\n  a,\n  b = (() => {\n    return a === null || a === void 0 ? void 0 : a.c;\n  })(),\n}) {}\nfunction h(\n  a,\n  {\n    b = (() => {\n      var _a$b;\n      return (_a$b = a.b) === null || _a$b === void 0 || (_a$b = _a$b.c) === null || _a$b === void 0\n        ? void 0\n        : _a$b.d.e;\n    })(),\n  },\n) {}\nfunction i(\n  a,\n  {\n    b = (() => {\n      var _a$b2;\n      return (_a$b2 = a.b) === null ||\n        _a$b2 === void 0 ||\n        (_a$b2 = _a$b2.c) === null ||\n        _a$b2 === void 0\n        ? void 0\n        : _a$b2.d;\n    })().e,\n  },\n) {}\nfunction j(\n  a,\n  {\n    b = (() => {\n      var _a$b3;\n      return a === null || a === void 0 || (_a$b3 = a.b) === null || _a$b3 === void 0\n        ? void 0\n        : _a$b3.c().d.e;\n    })(),\n  },\n) {}',
  'function f(\n  a = (() => {\n    var _x;\n    return (_x = x) == null ? void 0 : _x.y;\n  })(),\n) {}\nfunction g({\n  a,\n  b = (() => {\n    return a == null ? void 0 : a.c;\n  })(),\n}) {}\nfunction h(\n  a,\n  {\n    b = (() => {\n      var _a$b;\n      return (_a$b = a.b) == null || (_a$b = _a$b.c) == null ? void 0 : _a$b.d.e;\n    })(),\n  },\n) {}\nfunction i(\n  a,\n  {\n    b = (() => {\n      var _a$b2;\n      return (_a$b2 = a.b) == null || (_a$b2 = _a$b2.c) == null ? void 0 : _a$b2.d;\n    })().e,\n  },\n) {}\nfunction j(\n  a,\n  {\n    b = (() => {\n      var _a$b3;\n      return a == null || (_a$b3 = a.b) == null ? void 0 : _a$b3.c().d.e;\n    })(),\n  },\n) {}',
  'function test(foo) {\n  var _foo$bar,\n    _foo$get,\n    _foo$bar2,\n    _foo$bar3,\n    _foo$bar$baz,\n    _foo$bar4,\n    _foo$bar$baz2,\n    _foo$bar5,\n    _foo$bar6,\n    _foo$bar7,\n    _foo$bar8,\n    _foo$bar9,\n    _foo$bar10,\n    _foo$bar10$baz,\n    _foo$bar11,\n    _foo$bar11$baz;\n  foo === null || foo === void 0 ? void 0 : foo.bar;\n  foo === null || foo === void 0 || (_foo$bar = foo.bar) === null || _foo$bar === void 0\n    ? void 0\n    : _foo$bar.baz;\n  foo === null || foo === void 0 ? void 0 : foo(foo);\n  foo === null || foo === void 0 ? void 0 : foo.bar();\n  (_foo$get = foo.get(bar)) === null || _foo$get === void 0 ? void 0 : _foo$get();\n  (_foo$bar2 = foo.bar()) === null || _foo$bar2 === void 0 ? void 0 : _foo$bar2();\n  (_foo$bar3 = foo[bar]()) === null || _foo$bar3 === void 0 ? void 0 : _foo$bar3();\n  (_foo$bar$baz = (_foo$bar4 = foo.bar()).baz) === null || _foo$bar$baz === void 0\n    ? void 0\n    : _foo$bar$baz.call(_foo$bar4);\n  (_foo$bar$baz2 = (_foo$bar5 = foo[bar]()).baz) === null || _foo$bar$baz2 === void 0\n    ? void 0\n    : _foo$bar$baz2.call(_foo$bar5);\n  (_foo$bar6 = foo.bar) === null || _foo$bar6 === void 0\n    ? void 0\n    : _foo$bar6.call(foo, foo.bar, false);\n  foo === null || foo === void 0 || (_foo$bar7 = foo.bar) === null || _foo$bar7 === void 0\n    ? void 0\n    : _foo$bar7.call(foo, foo.bar, true);\n  (_foo$bar8 = foo.bar) === null || _foo$bar8 === void 0 ? void 0 : _foo$bar8.baz(foo.bar, false);\n  foo === null || foo === void 0 || (_foo$bar9 = foo.bar) === null || _foo$bar9 === void 0\n    ? void 0\n    : _foo$bar9.baz(foo.bar, true);\n  (_foo$bar10 = foo.bar) === null ||\n  _foo$bar10 === void 0 ||\n  (_foo$bar10$baz = _foo$bar10.baz) === null ||\n  _foo$bar10$baz === void 0\n    ? void 0\n    : _foo$bar10$baz.call(_foo$bar10, foo.bar, false);\n  foo === null ||\n  foo === void 0 ||\n  (_foo$bar11 = foo.bar) === null ||\n  _foo$bar11 === void 0 ||\n  (_foo$bar11$baz = _foo$bar11.baz) === null ||\n  _foo$bar11$baz === void 0\n    ? void 0\n    : _foo$bar11$baz.call(_foo$bar11, foo.bar, true);\n}',
  'function test(foo) {\n  var _foo$bar,\n    _foo$get,\n    _foo$bar2,\n    _foo$bar3,\n    _foo$bar$baz,\n    _foo$bar4,\n    _foo$bar$baz2,\n    _foo$bar5,\n    _foo$bar6,\n    _foo$bar7,\n    _foo$bar8,\n    _foo$bar9,\n    _foo$bar10,\n    _foo$bar10$baz,\n    _foo$bar11,\n    _foo$bar11$baz;\n  foo == null ? void 0 : foo.bar;\n  foo == null || (_foo$bar = foo.bar) == null ? void 0 : _foo$bar.baz;\n  foo == null ? void 0 : foo(foo);\n  foo == null ? void 0 : foo.bar();\n  (_foo$get = foo.get(bar)) == null ? void 0 : _foo$get();\n  (_foo$bar2 = foo.bar()) == null ? void 0 : _foo$bar2();\n  (_foo$bar3 = foo[bar]()) == null ? void 0 : _foo$bar3();\n  (_foo$bar$baz = (_foo$bar4 = foo.bar()).baz) == null ? void 0 : _foo$bar$baz.call(_foo$bar4);\n  (_foo$bar$baz2 = (_foo$bar5 = foo[bar]()).baz) == null ? void 0 : _foo$bar$baz2.call(_foo$bar5);\n  (_foo$bar6 = foo.bar) == null ? void 0 : _foo$bar6.call(foo, foo.bar, false);\n  foo == null || (_foo$bar7 = foo.bar) == null ? void 0 : _foo$bar7.call(foo, foo.bar, true);\n  (_foo$bar8 = foo.bar) == null ? void 0 : _foo$bar8.baz(foo.bar, false);\n  foo == null || (_foo$bar9 = foo.bar) == null ? void 0 : _foo$bar9.baz(foo.bar, true);\n  (_foo$bar10 = foo.bar) == null || (_foo$bar10$baz = _foo$bar10.baz) == null\n    ? void 0\n    : _foo$bar10$baz.call(_foo$bar10, foo.bar, false);\n  foo == null || (_foo$bar11 = foo.bar) == null || (_foo$bar11$baz = _foo$bar11.baz) == null\n    ? void 0\n    : _foo$bar11$baz.call(_foo$bar11, foo.bar, true);\n}',
  'var _eval, _eval2, _foo$eval, _eval$foo, _eval3;\nvar foo;\n/* indirect eval calls */\neval === null || eval === void 0 ? void 0 : (0, eval)(foo);\neval === null || eval === void 0 ? void 0 : (0, eval)(foo);\neval === null || eval === void 0 ? void 0 : (0, eval)()();\neval === null || eval === void 0 ? void 0 : (0, eval)().foo;\n/* direct eval calls */\n(_eval = eval()) === null || _eval === void 0 ? void 0 : _eval();\n(_eval2 = eval()) === null || _eval2 === void 0 ? void 0 : _eval2.foo;\n/* plain function calls */\n(_foo$eval = foo.eval) === null || _foo$eval === void 0 ? void 0 : _foo$eval.call(foo, foo);\n(_eval$foo = (_eval3 = eval).foo) === null || _eval$foo === void 0\n  ? void 0\n  : _eval$foo.call(_eval3, foo);',
  'var _eval, _eval2, _foo$eval, _eval$foo, _eval3;\nvar foo;\n/* indirect eval calls */\neval == null ? void 0 : (0, eval)(foo);\neval == null ? void 0 : (0, eval)(foo);\neval == null ? void 0 : (0, eval)()();\neval == null ? void 0 : (0, eval)().foo;\n/* direct eval calls */\n(_eval = eval()) == null ? void 0 : _eval();\n(_eval2 = eval()) == null ? void 0 : _eval2.foo;\n/* plain function calls */\n(_foo$eval = foo.eval) == null ? void 0 : _foo$eval.call(foo, foo);\n(_eval$foo = (_eval3 = eval).foo) == null ? void 0 : _eval$foo.call(_eval3, foo);',
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(\n      (1).toString,\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(\n      '1',\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(\n      (1).toString,\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(\n      '1',\n    );\n    expect((o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);\n    expect(\n      (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString,\n    ).toEqual((1).toString);\n    expect(\n      (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString(),\n    ).toEqual('1');\n    expect(\n      ((_ref = (\n        (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0\n          ? void 0\n          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n      )()) === null || _ref === void 0\n        ? void 0\n        : (_ref2 = _ref).m.bind(_ref2))(),\n    ).toEqual(1);\n    expect(\n      ((_ref3 = (\n        (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0\n          ? void 0\n          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n      )()) === null || _ref3 === void 0\n        ? void 0\n        : (_ref4 = _ref3).m.bind(_ref4))(),\n    ).toEqual(1);\n    expect(\n      ((_ref5 = (\n        (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0\n          ? void 0\n          : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n      )()) === null || _ref5 === void 0\n        ? void 0\n        : (_ref6 = _ref5).m.bind(_ref6))(),\n    ).toEqual(1);\n    expect(\n      ((_ref7 = (\n        fn === null ||\n          fn === void 0 ||\n          (_fn$Foo$self = fn().Foo.self) === null ||\n          _fn$Foo$self === void 0\n          ? void 0\n          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n      )()) === null || _ref7 === void 0\n        ? void 0\n        : (_ref8 = _ref7).m.bind(_ref8))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    expect(() => {\n      var _o$Foo5;\n      (o === null || o === void 0 ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o === null || o === void 0 ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo7;\n      (o === null || o === void 0 ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;\n      ((_ref9 = (\n        (_o$Foo8 = o.Foo) === null || _o$Foo8 === void 0\n          ? void 0\n          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)\n      )()) === null || _ref9 === void 0\n        ? void 0\n        : (_ref10 = _ref9).m.bind(_ref10))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;\n      ((_ref11 = (\n        (_o$Foo$self3 = o.Foo.self) === null || _o$Foo$self3 === void 0\n          ? void 0\n          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)\n      )()) === null || _ref11 === void 0\n        ? void 0\n        : (_ref12 = _ref11).m.bind(_ref12))();\n    }).toThrow();\n    expect(() => {\n      var _fn2, _fn2$self, _ref13, _ref14;\n      return (\n        (_ref13 = (\n          (_fn2 = fn()) === null || _fn2 === void 0 || (_fn2 = _fn2.Foo) === null || _fn2 === void 0\n            ? void 0\n            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)\n        )()) === null || _ref13 === void 0\n          ? void 0\n          : (_ref14 = _ref13).m.bind(_ref14)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn3, _fn4, _ref15, _ref16;\n      return (\n        (_ref15 = (\n          (_fn3 = fn) === null ||\n            _fn3 === void 0 ||\n            (_fn3 = _fn3().Foo.self) === null ||\n            _fn3 === void 0\n            ? void 0\n            : (_fn4 = _fn3).getSelf.bind(_fn4)\n        )()) === null || _ref15 === void 0\n          ? void 0\n          : (_ref16 = _ref15).m.bind(_ref16)\n      )();\n    }).toThrow();\n  }\n}\nnew Foo().test();\nnew Foo().testNull();",
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');\n    expect((o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);\n    expect((o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString).toEqual(\n      (1).toString,\n    );\n    expect((o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString()).toEqual('1');\n    expect(\n      ((_ref = (\n        (_o$Foo4 = o.Foo) == null\n          ? void 0\n          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n      )()) == null\n        ? void 0\n        : (_ref2 = _ref).m.bind(_ref2))(),\n    ).toEqual(1);\n    expect(\n      ((_ref3 = (\n        (_o$Foo$self = o.Foo.self) == null\n          ? void 0\n          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n      )()) == null\n        ? void 0\n        : (_ref4 = _ref3).m.bind(_ref4))(),\n    ).toEqual(1);\n    expect(\n      ((_ref5 = (\n        (_fn = fn()) == null || (_fn = _fn.Foo) == null\n          ? void 0\n          : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n      )()) == null\n        ? void 0\n        : (_ref6 = _ref5).m.bind(_ref6))(),\n    ).toEqual(1);\n    expect(\n      ((_ref7 = (\n        fn == null || (_fn$Foo$self = fn().Foo.self) == null\n          ? void 0\n          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n      )()) == null\n        ? void 0\n        : (_ref8 = _ref7).m.bind(_ref8))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    expect(() => {\n      var _o$Foo5;\n      (o == null ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o == null ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo7;\n      (o == null ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;\n      ((_ref9 = (\n        (_o$Foo8 = o.Foo) == null\n          ? void 0\n          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)\n      )()) == null\n        ? void 0\n        : (_ref10 = _ref9).m.bind(_ref10))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;\n      ((_ref11 = (\n        (_o$Foo$self3 = o.Foo.self) == null\n          ? void 0\n          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)\n      )()) == null\n        ? void 0\n        : (_ref12 = _ref11).m.bind(_ref12))();\n    }).toThrow();\n    expect(() => {\n      var _fn2, _fn2$self, _ref13, _ref14;\n      return (\n        (_ref13 = (\n          (_fn2 = fn()) == null || (_fn2 = _fn2.Foo) == null\n            ? void 0\n            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)\n        )()) == null\n          ? void 0\n          : (_ref14 = _ref13).m.bind(_ref14)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn3, _fn4, _ref15, _ref16;\n      return (\n        (_ref15 = (\n          (_fn3 = fn) == null || (_fn3 = _fn3().Foo.self) == null\n            ? void 0\n            : (_fn4 = _fn3).getSelf.bind(_fn4)\n        )()) == null\n          ? void 0\n          : (_ref16 = _ref15).m.bind(_ref16)\n      )();\n    }).toThrow();\n  }\n}\nnew Foo().test();\nnew Foo().testNull();",
  "'use strict';\nclass Base {\n  method() {\n    return 'Hello!';\n  }\n}\nclass Derived extends Base {\n  method() {\n    var _super$method;\n    return (_super$method = super.method) === null || _super$method === void 0\n      ? void 0\n      : _super$method.call(this);\n  }\n}",
  "'use strict';\nclass Base {\n  method() {\n    return 'Hello!';\n  }\n}\nclass Derived extends Base {\n  method() {\n    var _super$method;\n    return (_super$method = super.method) == null ? void 0 : _super$method.call(this);\n  }\n}",
  'var _foo,\n  _foo2,\n  _foo$bar,\n  _foo3,\n  _foo4,\n  _foo4$bar,\n  _foo5,\n  _foo6,\n  _foo$bar2,\n  _foo7,\n  _foo$bar3,\n  _foo8,\n  _foo9,\n  _foo9$bar,\n  _foo10,\n  _foo10$bar;\n(_foo = foo) === null || _foo === void 0 ? void 0 : _foo(foo);\n(_foo2 = foo) === null || _foo2 === void 0 ? void 0 : _foo2.bar();\n(_foo$bar = (_foo3 = foo).bar) === null || _foo$bar === void 0\n  ? void 0\n  : _foo$bar.call(_foo3, foo.bar, false);\n(_foo4 = foo) === null ||\n_foo4 === void 0 ||\n(_foo4$bar = _foo4.bar) === null ||\n_foo4$bar === void 0\n  ? void 0\n  : _foo4$bar.call(_foo4, foo.bar, true);\n(_foo5 = foo) === null || _foo5 === void 0 ? void 0 : _foo5().bar;\n(_foo6 = foo) === null || _foo6 === void 0 || (_foo6 = _foo6()) === null || _foo6 === void 0\n  ? void 0\n  : _foo6.bar;\n(_foo$bar2 = (_foo7 = foo).bar) === null || _foo$bar2 === void 0\n  ? void 0\n  : _foo$bar2.call(_foo7).baz;\n(_foo$bar3 = (_foo8 = foo).bar) === null ||\n_foo$bar3 === void 0 ||\n(_foo$bar3 = _foo$bar3.call(_foo8)) === null ||\n_foo$bar3 === void 0\n  ? void 0\n  : _foo$bar3.baz;\n(_foo9 = foo) === null ||\n_foo9 === void 0 ||\n(_foo9$bar = _foo9.bar) === null ||\n_foo9$bar === void 0\n  ? void 0\n  : _foo9$bar.call(_foo9).baz;\n(_foo10 = foo) === null ||\n_foo10 === void 0 ||\n(_foo10$bar = _foo10.bar) === null ||\n_foo10$bar === void 0 ||\n(_foo10$bar = _foo10$bar.call(_foo10)) === null ||\n_foo10$bar === void 0\n  ? void 0\n  : _foo10$bar.baz;',
  'var _foo,\n  _foo2,\n  _foo$bar,\n  _foo3,\n  _foo4,\n  _foo4$bar,\n  _foo5,\n  _foo6,\n  _foo$bar2,\n  _foo7,\n  _foo$bar3,\n  _foo8,\n  _foo9,\n  _foo9$bar,\n  _foo10,\n  _foo10$bar;\n(_foo = foo) == null ? void 0 : _foo(foo);\n(_foo2 = foo) == null ? void 0 : _foo2.bar();\n(_foo$bar = (_foo3 = foo).bar) == null ? void 0 : _foo$bar.call(_foo3, foo.bar, false);\n(_foo4 = foo) == null || (_foo4$bar = _foo4.bar) == null\n  ? void 0\n  : _foo4$bar.call(_foo4, foo.bar, true);\n(_foo5 = foo) == null ? void 0 : _foo5().bar;\n(_foo6 = foo) == null || (_foo6 = _foo6()) == null ? void 0 : _foo6.bar;\n(_foo$bar2 = (_foo7 = foo).bar) == null ? void 0 : _foo$bar2.call(_foo7).baz;\n(_foo$bar3 = (_foo8 = foo).bar) == null || (_foo$bar3 = _foo$bar3.call(_foo8)) == null\n  ? void 0\n  : _foo$bar3.baz;\n(_foo9 = foo) == null || (_foo9$bar = _foo9.bar) == null ? void 0 : _foo9$bar.call(_foo9).baz;\n(_foo10 = foo) == null ||\n(_foo10$bar = _foo10.bar) == null ||\n(_foo10$bar = _foo10$bar.call(_foo10)) == null\n  ? void 0\n  : _foo10$bar.baz;',
  'var _user$address, _user$address2, _a, _a2, _a3;\nvar street =\n  (_user$address = user.address) === null || _user$address === void 0\n    ? void 0\n    : _user$address.street;\nstreet =\n  (_user$address2 = user.address) === null || _user$address2 === void 0\n    ? void 0\n    : _user$address2.street;\ntest((_a = a) === null || _a === void 0 ? void 0 : _a.b, 1);\ntest((_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b, 1);\n(1, (_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b, 2);',
  'var _user$address, _user$address2, _a, _a2, _a3;\nvar street = (_user$address = user.address) == null ? void 0 : _user$address.street;\nstreet = (_user$address2 = user.address) == null ? void 0 : _user$address2.street;\ntest((_a = a) == null ? void 0 : _a.b, 1);\ntest((_a2 = a) == null ? void 0 : _a2.b, 1);\n(1, (_a3 = a) == null ? void 0 : _a3.b, 2);',
  'function f(\n  x = (() => {\n    var _a;\n    return (_a = a()) === null || _a === void 0 ? true : delete _a.b;\n  })(),\n) {}',
  'function f(\n  x = (() => {\n    var _a;\n    return (_a = a()) == null ? true : delete _a.b;\n  })(),\n) {}',
  "'use strict';\nvar _obj$a, _obj$b;\nconst obj = { a: { b: 0 } };\nlet test =\n  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n    ? true\n    : delete _obj$a.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\ntest = obj === null || obj === void 0 ? true : delete obj.a.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\ntest =\n  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n    ? true\n    : delete _obj$b.b;\nexpect(obj.b).toBeUndefined();\nexpect(test).toBe(true);\nobj === null || obj === void 0 ? true : delete obj.a;\nexpect(obj.a).toBeUndefined();",
  "'use strict';\nvar _obj$a, _obj$b;\nconst obj = { a: { b: 0 } };\nlet test = obj == null || (_obj$a = obj.a) == null ? true : delete _obj$a.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\ntest = obj == null ? true : delete obj.a.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\ntest = obj == null || (_obj$b = obj.b) == null ? true : delete _obj$b.b;\nexpect(obj.b).toBeUndefined();\nexpect(test).toBe(true);\nobj == null ? true : delete obj.a;\nexpect(obj.a).toBeUndefined();",
  "'use strict';\nvar _obj$a, _obj$b;\nconst obj = { a: { b: 0 } };\nlet test =\n  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n    ? true\n    : delete _obj$a.b;\ntest = obj === null || obj === void 0 ? true : delete obj.a.b;\ntest =\n  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n    ? true\n    : delete _obj$b.b;\nobj === null || obj === void 0 ? true : delete obj.a;",
  "'use strict';\nvar _obj$a, _obj$b;\nconst obj = { a: { b: 0 } };\nlet test = obj == null || (_obj$a = obj.a) == null ? true : delete _obj$a.b;\ntest = obj == null ? true : delete obj.a.b;\ntest = obj == null || (_obj$b = obj.b) == null ? true : delete _obj$b.b;\nobj == null ? true : delete obj.a;",
  'var _foo, _foo2, _foo$bar, _foo3, _foo4, _foo4$bar;\n(_foo = foo) === null || _foo === void 0 ? void 0 : _foo(foo);\n(_foo2 = foo) === null || _foo2 === void 0 ? void 0 : _foo2.bar();\n(_foo$bar = (_foo3 = foo).bar) === null || _foo$bar === void 0\n  ? void 0\n  : _foo$bar.call(_foo3, foo.bar, false);\n(_foo4 = foo) === null ||\n_foo4 === void 0 ||\n(_foo4$bar = _foo4.bar) === null ||\n_foo4$bar === void 0\n  ? void 0\n  : _foo4$bar.call(_foo4, foo.bar, true);',
  'var _foo, _foo2, _foo$bar, _foo3, _foo4, _foo4$bar;\n(_foo = foo) == null ? void 0 : _foo(foo);\n(_foo2 = foo) == null ? void 0 : _foo2.bar();\n(_foo$bar = (_foo3 = foo).bar) == null ? void 0 : _foo$bar.call(_foo3, foo.bar, false);\n(_foo4 = foo) == null || (_foo4$bar = _foo4.bar) == null\n  ? void 0\n  : _foo4$bar.call(_foo4, foo.bar, true);',
  'var _a, _a2, _a3, _a4;\n(_a = a) === null || _a === void 0 ? void 0 : _a(...args);\n(_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b(...args);\n(_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b(...args).c;\n(_a4 = a) === null || _a4 === void 0 ? void 0 : _a4.b(...args).c(...args);',
  'var _a, _a2, _a3, _a4;\n(_a = a) == null ? void 0 : _a(...args);\n(_a2 = a) == null ? void 0 : _a2.b(...args);\n(_a3 = a) == null ? void 0 : _a3.b(...args).c;\n(_a4 = a) == null ? void 0 : _a4.b(...args).c(...args);',
  'var _x$y;\nlet x;\nconst a = { [(_x$y = x.y) === null || _x$y === void 0 ? void 0 : _x$y.z]() {} };',
  'var _x$y;\nlet x;\nconst a = { [(_x$y = x.y) == null ? void 0 : _x$y.z]() {} };',
  'var _x;\nvar { a = (_x = x) === null || _x === void 0 ? void 0 : _x.y } = {};',
  'var _x;\nvar { a = (_x = x) == null ? void 0 : _x.y } = {};',
  'var _foo, _a, _a$b, _a$b$c, _orders, _orders2, _client, _orders$client$key, _a2, _c, _a3;\n(_foo = foo) === null || _foo === void 0 ? void 0 : _foo.bar;\n(_a = a) === null || _a === void 0 || (_a = _a.b.c) === null || _a === void 0 ? void 0 : _a.d.e;\n(_a$b = a.b) === null || _a$b === void 0 || (_a$b = _a$b.c.d) === null || _a$b === void 0\n  ? void 0\n  : _a$b.e;\n(_a$b$c = a.b.c) === null || _a$b$c === void 0 || (_a$b$c = _a$b$c.d) === null || _a$b$c === void 0\n  ? void 0\n  : _a$b$c.e;\n(_orders = orders) === null || _orders === void 0 ? void 0 : _orders[0].price;\n(_orders2 = orders) === null ||\n_orders2 === void 0 ||\n(_orders2 = _orders2[0]) === null ||\n_orders2 === void 0\n  ? void 0\n  : _orders2.price;\norders[(_client = client) === null || _client === void 0 ? void 0 : _client.key].price;\n(_orders$client$key = orders[client.key]) === null || _orders$client$key === void 0\n  ? void 0\n  : _orders$client$key.price;\n(0, (_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b).c;\n(0,\n(_c = (0, (_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b).c) === null || _c === void 0\n  ? void 0\n  : _c.d).e;',
  'var _foo, _a, _a$b, _a$b$c, _orders, _orders2, _client, _orders$client$key, _a2, _c, _a3;\n(_foo = foo) == null ? void 0 : _foo.bar;\n(_a = a) == null || (_a = _a.b.c) == null ? void 0 : _a.d.e;\n(_a$b = a.b) == null || (_a$b = _a$b.c.d) == null ? void 0 : _a$b.e;\n(_a$b$c = a.b.c) == null || (_a$b$c = _a$b$c.d) == null ? void 0 : _a$b$c.e;\n(_orders = orders) == null ? void 0 : _orders[0].price;\n(_orders2 = orders) == null || (_orders2 = _orders2[0]) == null ? void 0 : _orders2.price;\norders[(_client = client) == null ? void 0 : _client.key].price;\n(_orders$client$key = orders[client.key]) == null ? void 0 : _orders$client$key.price;\n(0, (_a2 = a) == null ? void 0 : _a2.b).c;\n(0, (_c = (0, (_a3 = a) == null ? void 0 : _a3.b).c) == null ? void 0 : _c.d).e;',
  'function test(foo) {\n  var _foo$bar,\n    _foo$bar2,\n    _foo$bar3,\n    _foo$bar4,\n    _foo$bar5,\n    _foo$bar6,\n    _foo$bar6$baz,\n    _foo$bar7,\n    _foo$bar7$baz;\n  foo === null || foo === void 0 ? void 0 : foo.bar;\n  foo === null || foo === void 0 || (_foo$bar = foo.bar) === null || _foo$bar === void 0\n    ? void 0\n    : _foo$bar.baz;\n  foo === null || foo === void 0 ? void 0 : foo(foo);\n  foo === null || foo === void 0 ? void 0 : foo.bar();\n  (_foo$bar2 = foo.bar) === null || _foo$bar2 === void 0\n    ? void 0\n    : _foo$bar2.call(foo, foo.bar, false);\n  foo === null || foo === void 0 || (_foo$bar3 = foo.bar) === null || _foo$bar3 === void 0\n    ? void 0\n    : _foo$bar3.call(foo, foo.bar, true);\n  (_foo$bar4 = foo.bar) === null || _foo$bar4 === void 0 ? void 0 : _foo$bar4.baz(foo.bar, false);\n  foo === null || foo === void 0 || (_foo$bar5 = foo.bar) === null || _foo$bar5 === void 0\n    ? void 0\n    : _foo$bar5.baz(foo.bar, true);\n  (_foo$bar6 = foo.bar) === null ||\n  _foo$bar6 === void 0 ||\n  (_foo$bar6$baz = _foo$bar6.baz) === null ||\n  _foo$bar6$baz === void 0\n    ? void 0\n    : _foo$bar6$baz.call(_foo$bar6, foo.bar, false);\n  foo === null ||\n  foo === void 0 ||\n  (_foo$bar7 = foo.bar) === null ||\n  _foo$bar7 === void 0 ||\n  (_foo$bar7$baz = _foo$bar7.baz) === null ||\n  _foo$bar7$baz === void 0\n    ? void 0\n    : _foo$bar7$baz.call(_foo$bar7, foo.bar, true);\n}',
  'function test(foo) {\n  var _foo$bar,\n    _foo$bar2,\n    _foo$bar3,\n    _foo$bar4,\n    _foo$bar5,\n    _foo$bar6,\n    _foo$bar6$baz,\n    _foo$bar7,\n    _foo$bar7$baz;\n  foo == null ? void 0 : foo.bar;\n  foo == null || (_foo$bar = foo.bar) == null ? void 0 : _foo$bar.baz;\n  foo == null ? void 0 : foo(foo);\n  foo == null ? void 0 : foo.bar();\n  (_foo$bar2 = foo.bar) == null ? void 0 : _foo$bar2.call(foo, foo.bar, false);\n  foo == null || (_foo$bar3 = foo.bar) == null ? void 0 : _foo$bar3.call(foo, foo.bar, true);\n  (_foo$bar4 = foo.bar) == null ? void 0 : _foo$bar4.baz(foo.bar, false);\n  foo == null || (_foo$bar5 = foo.bar) == null ? void 0 : _foo$bar5.baz(foo.bar, true);\n  (_foo$bar6 = foo.bar) == null || (_foo$bar6$baz = _foo$bar6.baz) == null\n    ? void 0\n    : _foo$bar6$baz.call(_foo$bar6, foo.bar, false);\n  foo == null || (_foo$bar7 = foo.bar) == null || (_foo$bar7$baz = _foo$bar7.baz) == null\n    ? void 0\n    : _foo$bar7$baz.call(_foo$bar7, foo.bar, true);\n}',
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(\n      (1).toString,\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(\n      '1',\n    );\n    expect((o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);\n    expect(\n      (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString,\n    ).toEqual((1).toString);\n    expect(\n      (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString(),\n    ).toEqual('1');\n    expect(\n      ((_ref = (\n        (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0\n          ? void 0\n          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n      )()) === null || _ref === void 0\n        ? void 0\n        : (_ref2 = _ref).m.bind(_ref2))(),\n    ).toEqual(1);\n    expect(\n      ((_ref3 = (\n        (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0\n          ? void 0\n          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n      )()) === null || _ref3 === void 0\n        ? void 0\n        : (_ref4 = _ref3).m.bind(_ref4))(),\n    ).toEqual(1);\n    expect(\n      ((_ref5 = (\n        (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0\n          ? void 0\n          : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n      )()) === null || _ref5 === void 0\n        ? void 0\n        : (_ref6 = _ref5).m.bind(_ref6))(),\n    ).toEqual(1);\n    expect(\n      ((_ref7 = (\n        fn === null ||\n          fn === void 0 ||\n          (_fn$Foo$self = fn().Foo.self) === null ||\n          _fn$Foo$self === void 0\n          ? void 0\n          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n      )()) === null || _ref7 === void 0\n        ? void 0\n        : (_ref8 = _ref7).m.bind(_ref8))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    expect(() => {\n      var _o$Foo5;\n      (o === null || o === void 0 ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o === null || o === void 0 ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo7;\n      (o === null || o === void 0 ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;\n      ((_ref9 = (\n        (_o$Foo8 = o.Foo) === null || _o$Foo8 === void 0\n          ? void 0\n          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)\n      )()) === null || _ref9 === void 0\n        ? void 0\n        : (_ref10 = _ref9).m.bind(_ref10))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;\n      ((_ref11 = (\n        (_o$Foo$self3 = o.Foo.self) === null || _o$Foo$self3 === void 0\n          ? void 0\n          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)\n      )()) === null || _ref11 === void 0\n        ? void 0\n        : (_ref12 = _ref11).m.bind(_ref12))();\n    }).toThrow();\n    expect(() => {\n      var _fn2, _fn2$self, _ref13, _ref14;\n      return (\n        (_ref13 = (\n          (_fn2 = fn()) === null || _fn2 === void 0 || (_fn2 = _fn2.Foo) === null || _fn2 === void 0\n            ? void 0\n            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)\n        )()) === null || _ref13 === void 0\n          ? void 0\n          : (_ref14 = _ref13).m.bind(_ref14)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn3, _fn4, _ref15, _ref16;\n      return (\n        (_ref15 = (\n          (_fn3 = fn) === null ||\n            _fn3 === void 0 ||\n            (_fn3 = _fn3().Foo.self) === null ||\n            _fn3 === void 0\n            ? void 0\n            : (_fn4 = _fn3).getSelf.bind(_fn4)\n        )()) === null || _ref15 === void 0\n          ? void 0\n          : (_ref16 = _ref15).m.bind(_ref16)\n      )();\n    }).toThrow();\n  }\n}\nnew Foo().test();\nnew Foo().testNull();",
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);\n    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');\n    expect((o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);\n    expect((o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString).toEqual(\n      (1).toString,\n    );\n    expect((o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString()).toEqual('1');\n    expect(\n      ((_ref = (\n        (_o$Foo4 = o.Foo) == null\n          ? void 0\n          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n      )()) == null\n        ? void 0\n        : (_ref2 = _ref).m.bind(_ref2))(),\n    ).toEqual(1);\n    expect(\n      ((_ref3 = (\n        (_o$Foo$self = o.Foo.self) == null\n          ? void 0\n          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n      )()) == null\n        ? void 0\n        : (_ref4 = _ref3).m.bind(_ref4))(),\n    ).toEqual(1);\n    expect(\n      ((_ref5 = (\n        (_fn = fn()) == null || (_fn = _fn.Foo) == null\n          ? void 0\n          : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n      )()) == null\n        ? void 0\n        : (_ref6 = _ref5).m.bind(_ref6))(),\n    ).toEqual(1);\n    expect(\n      ((_ref7 = (\n        fn == null || (_fn$Foo$self = fn().Foo.self) == null\n          ? void 0\n          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n      )()) == null\n        ? void 0\n        : (_ref8 = _ref7).m.bind(_ref8))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    expect(() => {\n      var _o$Foo5;\n      (o == null ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o == null ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo7;\n      (o == null ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;\n      ((_ref9 = (\n        (_o$Foo8 = o.Foo) == null\n          ? void 0\n          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)\n      )()) == null\n        ? void 0\n        : (_ref10 = _ref9).m.bind(_ref10))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;\n      ((_ref11 = (\n        (_o$Foo$self3 = o.Foo.self) == null\n          ? void 0\n          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)\n      )()) == null\n        ? void 0\n        : (_ref12 = _ref11).m.bind(_ref12))();\n    }).toThrow();\n    expect(() => {\n      var _fn2, _fn2$self, _ref13, _ref14;\n      return (\n        (_ref13 = (\n          (_fn2 = fn()) == null || (_fn2 = _fn2.Foo) == null\n            ? void 0\n            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)\n        )()) == null\n          ? void 0\n          : (_ref14 = _ref13).m.bind(_ref14)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn3, _fn4, _ref15, _ref16;\n      return (\n        (_ref15 = (\n          (_fn3 = fn) == null || (_fn3 = _fn3().Foo.self) == null\n            ? void 0\n            : (_fn4 = _fn3).getSelf.bind(_fn4)\n        )()) == null\n          ? void 0\n          : (_ref16 = _ref15).m.bind(_ref16)\n      )();\n    }).toThrow();\n  }\n}\nnew Foo().test();\nnew Foo().testNull();",
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))();\n    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString;\n    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString();\n    (o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))();\n    (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString;\n    (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString();\n    ((_ref = (\n      (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0\n        ? void 0\n        : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n    )()) === null || _ref === void 0\n      ? void 0\n      : (_ref2 = _ref).m.bind(_ref2))();\n    ((_ref3 = (\n      (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0\n        ? void 0\n        : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n    )()) === null || _ref3 === void 0\n      ? void 0\n      : (_ref4 = _ref3).m.bind(_ref4))();\n    ((_ref5 = (\n      (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0\n        ? void 0\n        : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n    )()) === null || _ref5 === void 0\n      ? void 0\n      : (_ref6 = _ref5).m.bind(_ref6))();\n    ((_ref7 = (\n      fn === null ||\n        fn === void 0 ||\n        (_fn$Foo$self = fn().Foo.self) === null ||\n        _fn$Foo$self === void 0\n        ? void 0\n        : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n    )()) === null || _ref7 === void 0\n      ? void 0\n      : (_ref8 = _ref7).m.bind(_ref8))();\n  }\n}\nnew Foo().test();",
  "class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() {\n    return this.x;\n  }\n  getSelf() {\n    return this;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo4,\n      _o$Foo4$self,\n      _ref,\n      _ref2,\n      _o$Foo$self,\n      _o$Foo$self2,\n      _ref3,\n      _ref4,\n      _fn,\n      _fn$self,\n      _ref5,\n      _ref6,\n      _fn$Foo$self,\n      _fn$Foo$self2,\n      _ref7,\n      _ref8;\n    const Foo = this;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    (Foo == null ? void 0 : Foo['m'].bind(Foo))();\n    (Foo == null ? void 0 : Foo['m'].bind(Foo))().toString;\n    (Foo == null ? void 0 : Foo['m'].bind(Foo))().toString();\n    (o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))();\n    (o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString;\n    (o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString();\n    ((_ref = (\n      (_o$Foo4 = o.Foo) == null ? void 0 : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)\n    )()) == null\n      ? void 0\n      : (_ref2 = _ref).m.bind(_ref2))();\n    ((_ref3 = (\n      (_o$Foo$self = o.Foo.self) == null\n        ? void 0\n        : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)\n    )()) == null\n      ? void 0\n      : (_ref4 = _ref3).m.bind(_ref4))();\n    ((_ref5 = (\n      (_fn = fn()) == null || (_fn = _fn.Foo) == null\n        ? void 0\n        : (_fn$self = _fn.self).getSelf.bind(_fn$self)\n    )()) == null\n      ? void 0\n      : (_ref6 = _ref5).m.bind(_ref6))();\n    ((_ref7 = (\n      fn == null || (_fn$Foo$self = fn().Foo.self) == null\n        ? void 0\n        : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)\n    )()) == null\n      ? void 0\n      : (_ref8 = _ref7).m.bind(_ref8))();\n  }\n}\nnew Foo().test();",
  "'use strict';\nvar _obj$a, _obj$b, _obj$b2;\nconst obj = { a: { b: 0 } };\nlet test = +(obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n  ? void 0\n  : _obj$a.b);\nexpect(test).toBe(0);\ntest = +(obj === null || obj === void 0 ? void 0 : obj.a.b);\nexpect(test).toBe(0);\ntest = +(obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n  ? void 0\n  : _obj$b.b);\nexpect(test).toBe(NaN);\ntest = +(obj === null || obj === void 0 || (_obj$b2 = obj.b) === null || _obj$b2 === void 0\n  ? void 0\n  : _obj$b2.b);\nexpect(test).toBe(NaN);",
  "'use strict';\nvar _obj$a, _obj$b, _obj$b2;\nconst obj = { a: { b: 0 } };\nlet test = +(obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b);\nexpect(test).toBe(0);\ntest = +(obj == null ? void 0 : obj.a.b);\nexpect(test).toBe(0);\ntest = +(obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b);\nexpect(test).toBe(NaN);\ntest = +(obj == null || (_obj$b2 = obj.b) == null ? void 0 : _obj$b2.b);\nexpect(test).toBe(NaN);",
  "'use strict';\nvar _obj$a, _obj$b, _obj$b2;\nconst obj = { a: { b: 0 } };\nlet test = +(obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0\n  ? void 0\n  : _obj$a.b);\ntest = +(obj === null || obj === void 0 ? void 0 : obj.a.b);\ntest = +(obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0\n  ? void 0\n  : _obj$b.b);\ntest = +(obj === null || obj === void 0 || (_obj$b2 = obj.b) === null || _obj$b2 === void 0\n  ? void 0\n  : _obj$b2.b);",
  "'use strict';\nvar _obj$a, _obj$b, _obj$b2;\nconst obj = { a: { b: 0 } };\nlet test = +(obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b);\ntest = +(obj == null ? void 0 : obj.a.b);\ntest = +(obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b);\ntest = +(obj == null || (_obj$b2 = obj.b) == null ? void 0 : _obj$b2.b);",
  'var _a, _a2, _a3, _b, _a4, _a5, _a6, _a7;\n(_a = a) === null || _a === void 0 ? void 0 : _a.b.c;\n(_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b.c.d;\n(_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b.c.d;\n(_b = a.b) === null || _b === void 0 ? void 0 : _b.c;\n(_a4 = a) === null || _a4 === void 0 || (_a4 = _a4.b) === null || _a4 === void 0 ? void 0 : _a4.c;\n(_a5 = a) === null || _a5 === void 0 || (_a5 = _a5.b.c) === null || _a5 === void 0 ? void 0 : _a5.c;\n((_a6 = a) === null || _a6 === void 0 ? void 0 : _a6.b).c;\n((_a7 = a) === null || _a7 === void 0 ? void 0 : _a7.b).c;',
  'var _a, _a2, _a3, _b, _a4, _a5, _a6, _a7;\n(_a = a) == null ? void 0 : _a.b.c;\n(_a2 = a) == null ? void 0 : _a2.b.c.d;\n(_a3 = a) == null ? void 0 : _a3.b.c.d;\n(_b = a.b) == null ? void 0 : _b.c;\n(_a4 = a) == null || (_a4 = _a4.b) == null ? void 0 : _a4.c;\n(_a5 = a) == null || (_a5 = _a5.b.c) == null ? void 0 : _a5.c;\n((_a6 = a) == null ? void 0 : _a6.b).c;\n((_a7 = a) == null ? void 0 : _a7.b).c;',
  'var _ref;\nlet a = (0, (_ref = null) === null || _ref === void 0 ? void 0 : _ref.prop);\nexpect(a).toBe(undefined);',
  'var _ref;\nlet a = (0, (_ref = null) == null ? void 0 : _ref.prop);\nexpect(a).toBe(undefined);',
  'var _ref, _ref2;\nlet a =\n  ((_ref = null) === null || _ref === void 0 ? void 0 : _ref.prop1,\n  (_ref2 = null) === null || _ref2 === void 0 ? void 0 : _ref2.prop2);\nexpect(a).toBe(undefined);',
  'var _ref, _ref2;\nlet a =\n  ((_ref = null) == null ? void 0 : _ref.prop1, (_ref2 = null) == null ? void 0 : _ref2.prop2);\nexpect(a).toBe(undefined);',
  "class SS {\n  constructor(name) {\n    this.name = 'ss' + name;\n  }\n}\nclass AA extends SS {\n  constructor(name) {\n    super(name);\n    this.name = 'aa' + name;\n  }\n  aaGreet(s) {\n    var _super$greet;\n    (_super$greet = super.greet) === null || _super$greet === void 0\n      ? void 0\n      : _super$greet.call(this, s + 'hhh');\n  }\n}\nconst a = new AA('jack');\nexpect(() => a.aaGreet('d')).not.toThrow();",
  "class SS {\n  constructor(name) {\n    this.name = 'ss' + name;\n  }\n}\nclass AA extends SS {\n  constructor(name) {\n    super(name);\n    this.name = 'aa' + name;\n  }\n  aaGreet(s) {\n    var _super$greet;\n    (_super$greet = super.greet) == null ? void 0 : _super$greet.call(this, s + 'hhh');\n  }\n}\nconst a = new AA('jack');\nexpect(() => a.aaGreet('d')).not.toThrow();",
  '{\n  const foo = 1;\n}\n{\n  var _ref;\n  const foo = (_ref = {}) === null || _ref === void 0 ? void 0 : _ref.foo;\n}',
  '{\n  const foo = 1;\n}\n{\n  var _ref;\n  const foo = (_ref = {}) == null ? void 0 : _ref.foo;\n}',
  "const foo = undefined;\nconst bar = 'bar';\nconst foobar = foo === null || foo === void 0 ? void 0 : foo.replace(`foo${bar}`, '');\nexpect(foobar).toBe(undefined);",
  "const foo = undefined;\nconst bar = 'bar';\nconst foobar = foo == null ? void 0 : foo.replace(`foo${bar}`, '');\nexpect(foobar).toBe(undefined);",
  'a => {\n  var _a$b;\n  if ((_a$b = a.b) === null || _a$b === void 0 ? void 0 : _a$b.call(a)) {\n  }\n};',
  'a => {\n  var _a$b;\n  if ((_a$b = a.b) == null ? void 0 : _a$b.call(a)) {\n  }\n};',
  'var _a$b, _a;\n(_a$b = (_a = a).b) === null || _a$b === void 0 ? void 0 : _a$b.call(_a);',
  'var _a$b, _a;\n(_a$b = (_a = a).b) == null ? void 0 : _a$b.call(_a);',
  'var _bar, _ref;\n(_bar = (_ref = foo).bar) === null || _bar === void 0 ? void 0 : _bar.call(_ref, foo.bar, false);',
  'var _bar, _ref;\n(_bar = (_ref = foo).bar) == null ? void 0 : _bar.call(_ref, foo.bar, false);',
  'a => {\n  var _a$c;\n  (a === null || a === void 0 ? void 0 : a.b) &&\n  ((_a$c = a.c) === null || _a$c === void 0 ? void 0 : _a$c.d)\n    ? 0\n    : 1;\n};',
  'a => {\n  var _a$c;\n  (a == null ? void 0 : a.b) && ((_a$c = a.c) == null ? void 0 : _a$c.d) ? 0 : 1;\n};',
  'var _a;\n(_a = a) === null || _a === void 0 || (_a = _a.b) === null || _a === void 0 ? void 0 : _a.c;',
  'var _a;\n(_a = a) == null || (_a = _a.b) == null ? void 0 : _a.c;',
  'var _o, _o$Foo;\n((_o = o) === null || _o === void 0 ? void 0 : (_o$Foo = _o.Foo).m.bind(_o$Foo))();',
  'var _o, _o$Foo;\n((_o = o) == null ? void 0 : (_o$Foo = _o.Foo).m.bind(_o$Foo))();',
] as const;

export const fixtureCases = [
  {
    title: 'assumption noDocumentAll — assignment (exec)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: {\n      c: {\n        d: 2,\n      },\n    },\n  },\n};\n\nconst a = obj?.a;\nexpect(a).toBe(obj.a);\n\nconst b = obj?.a?.b;\nexpect(b).toBe(obj.a.b);\n\nconst bad = obj?.b?.b;\nexpect(bad).toBeUndefined();\n\nlet val;\nval = obj?.a?.b;\nexpect(val).toBe(obj.a.b);\n\nexpect(() => {\n  const bad = obj?.b.b;\n}).toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[0],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — assignment (input)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: {\n      c: {\n        d: 2,\n      },\n    },\n  },\n};\n\nconst a = obj?.a;\n\nconst b = obj?.a?.b;\n\nconst bad = obj?.b?.b;\n\nlet val;\nval = obj?.a?.b;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[2],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — call (exec)',
    source: '',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[4],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — cast to boolean (exec)',
    source:
      'class C {\n  static testIf(o) {\n    if (o?.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return o?.a.b?.c.d ? true : false;\n  }\n  static testLoop(o) {\n    while (o?.a.b.c.d) {\n      for (; o?.a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o?.a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!o?.a.b?.c.d;\n  }\n  static testIfDeep(o) {\n    if (o.obj?.a.b?.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    return o.obj?.a.b?.c.d ? true : false;\n  }\n  static testLoopDeep(o) {\n    while (o.obj?.a.b.c.d) {\n      for (; o.obj?.a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o.obj?.a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    return !!o.obj?.a.b?.c.d;\n  }\n\n  static testLogicalInIf(o) {\n    if (o?.a.b?.c.d && o?.a?.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n\n  static testLogicalInReturn(o) {\n    return o?.a.b?.c.d && o?.a?.b.c.d;\n  }\n\n  static testNullishCoalescing(o) {\n    if (o?.a.b?.c.non_existent ?? o?.a.b?.c.d) {\n      return o?.a.b?.c.non_existent ?? o?.a.b?.c.d;\n    }\n    return o?.a.b?.c.non_existent ?? o;\n  }\n\n  static test() {\n    const c = {\n      a: {\n        b: {\n          c: {\n            d: 2,\n          },\n        },\n      },\n    };\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\n\nC.test();\nC.testNullish();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[5],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — cast to boolean (input)',
    source:
      'class C {\n  static testIf(o) {\n    if (o?.a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return o?.a.b?.c.d ? true : false;\n  }\n  static testLoop(o) {\n    while (o?.a.b.c.d) {\n      for (; o?.a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o?.a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!o?.a.b?.c.d;\n  }\n  static testIfDeep(o) {\n    if (o.obj?.a.b?.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    return o.obj?.a.b?.c.d ? true : false;\n  }\n  static testLoopDeep(o) {\n    while (o.obj?.a.b.c.d) {\n      for (; o.obj?.a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o.obj?.a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    return !!o.obj?.a.b?.c.d;\n  }\n\n  static testLogicalInIf(o) {\n    if (o?.a.b?.c.d && o?.a?.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n\n  static testLogicalInReturn(o) {\n    return o?.a.b?.c.d && o?.a?.b.c.d;\n  }\n\n  static testNullishCoalescing(o) {\n    if (o?.a.b?.c.non_existent ?? o?.a.b?.c.d) {\n      return o?.a.b?.c.non_existent ?? o?.a.b?.c.d;\n    }\n    return o?.a.b?.c.non_existent ?? o;\n  }\n}\n\nC.test();\nC.testNullish();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[7],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — in function params (input)',
    source:
      'function f(a = x?.y) {}\n\nfunction g({ a, b = a?.c }) {}\n\nfunction h(a, { b = a.b?.c?.d.e }) {}\n\nfunction i(a, { b = (a.b?.c?.d).e }) {}\n\nfunction j(a, { b = a?.b?.c().d.e }) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[9],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — memoize (input)',
    source:
      'function test(foo) {\n  foo?.bar;\n\n  foo?.bar?.baz;\n\n  foo?.(foo);\n\n  foo?.bar()\n\n  foo.get(bar)?.()\n\n  foo.bar()?.()\n  foo[bar]()?.()\n\n  foo.bar().baz?.()\n  foo[bar]().baz?.()\n\n  foo.bar?.(foo.bar, false)\n\n  foo?.bar?.(foo.bar, true)\n\n  foo.bar?.baz(foo.bar, false)\n\n  foo?.bar?.baz(foo.bar, true)\n\n  foo.bar?.baz?.(foo.bar, false)\n\n  foo?.bar?.baz?.(foo.bar, true)\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[11],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional eval call (input)',
    source:
      'var foo;\n\n/* indirect eval calls */\neval?.(foo);\n\n(eval)?.(foo);\n\neval?.()();\n\neval?.().foo;\n\n/* direct eval calls */\n\neval()?.();\n\neval()?.foo;\n\n/* plain function calls */\n\nfoo.eval?.(foo);\n\neval.foo?.(foo);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[13],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — parenthesized expression member call (exec)',
    source:
      'class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() { return this.x; };\n  getSelf() { return this }\n\n  test() {\n    const Foo = this;\n    const o = { Foo: Foo };\n    const fn = function () {\n      return o;\n    };\n\n    expect((Foo?.["m"])()).toEqual(1);\n    expect((Foo?.["m"])().toString).toEqual(1..toString);\n    expect((Foo?.["m"])().toString()).toEqual(\'1\');\n\n    expect(((Foo?.["m"]))()).toEqual(1);\n    expect(((Foo?.["m"]))().toString).toEqual(1..toString);\n    expect(((Foo?.["m"]))().toString()).toEqual(\'1\');\n\n    expect((o?.Foo.m)()).toEqual(1);\n    expect((o?.Foo.m)().toString).toEqual(1..toString);\n    expect((o?.Foo.m)().toString()).toEqual(\'1\');\n\n    expect((((o.Foo?.self.getSelf)())?.m)()).toEqual(1);\n    expect((((o.Foo.self?.getSelf)())?.m)()).toEqual(1);\n\n    expect((((fn()?.Foo?.self.getSelf)())?.m)()).toEqual(1);\n    expect((((fn?.().Foo.self?.getSelf)())?.m)()).toEqual(1);\n  }\n\n  testNull() {\n    const o = null;\n\n    expect(() => { (o?.Foo.m)() }).toThrow();\n    expect(() => { (o?.Foo.m)().toString }).toThrow();\n    expect(() => { (o?.Foo.m)().toString() }).toThrow();\n\n    expect(() => { (((o.Foo?.self.getSelf)())?.m)() }).toThrow();\n    expect(() => { (((o.Foo.self?.getSelf)())?.m)() }).toThrow();\n\n    expect(() => (((fn()?.Foo?.self.getSelf)())?.m)()).toThrow();\n    expect(() => (((fn?.().Foo.self?.getSelf)())?.m)()).toThrow();\n  }\n}\n\n(new Foo).test();\n(new Foo).testNull();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[15],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — super method call (input)',
    source:
      '"use strict";\nclass Base {\n  method() {\n    return \'Hello!\';\n  }\n}\n\nclass Derived extends Base {\n    method() {\n        return super.method?.()\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[17],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'assumption pureGetters — function call (input)',
    source:
      'foo?.(foo);\n\nfoo?.bar()\n\nfoo.bar?.(foo.bar, false)\n\nfoo?.bar?.(foo.bar, true)\n\nfoo?.().bar\n\nfoo?.()?.bar\n\nfoo.bar?.().baz\n\nfoo.bar?.()?.baz\n\nfoo?.bar?.().baz\n\nfoo?.bar?.()?.baz\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[19],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'general — containers (input)',
    source:
      'var street = user.address?.street\nstreet = user.address?.street\n\ntest(a?.b,  1);\ntest((a?.b), 1);\n\n(1, a?.b, 2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[21],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'general — delete in function params (input)',
    source: 'function f(x = delete a()?.b) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[23],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'general — delete (exec)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: 0,\n  },\n};\n\nlet test = delete obj?.a?.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\n\ntest = delete obj?.a.b;\nexpect(obj.a.b).toBeUndefined();\nexpect(test).toBe(true);\n\ntest = delete obj?.b?.b;\nexpect(obj.b).toBeUndefined();\nexpect(test).toBe(true);\n\ndelete obj?.a;\nexpect(obj.a).toBeUndefined();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[25],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'general — delete (input)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: 0,\n  },\n};\n\nlet test = delete obj?.a?.b;\n\ntest = delete obj?.a.b;\n\ntest = delete obj?.b?.b;\n\ndelete obj?.a;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[27],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'general — function call loose (input)',
    source: 'foo?.(foo);\n\nfoo?.bar()\n\nfoo.bar?.(foo.bar, false)\n\nfoo?.bar?.(foo.bar, true)\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[29],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'general — function call spread (input)',
    source: 'a?.(...args);\n\na?.b(...args);\n\na?.b(...args).c;\n\na?.b(...args).c(...args);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[31],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'general — in method key loose (input)',
    source: 'let x;\nconst a = {\n  [x.y?.z]() {}\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[33],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'general — in var destructuring (input)',
    source: 'var { a = x?.y } = {};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[35],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'general — member access (input)',
    source:
      'foo?.bar;\n\na?.b.c?.d.e;\n\na.b?.c.d?.e;\n\na.b.c?.d?.e;\n\norders?.[0].price;\n\norders?.[0]?.price;\n\norders[client?.key].price;\n\norders[client.key]?.price;\n\n(0, a?.b).c;\n\n(0, (0, a?.b).c?.d).e;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[37],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'general — memoize (input)',
    source:
      'function test(foo) {\n  foo?.bar;\n\n  foo?.bar?.baz;\n\n  foo?.(foo);\n\n  foo?.bar()\n\n  foo.bar?.(foo.bar, false)\n\n  foo?.bar?.(foo.bar, true)\n\n  foo.bar?.baz(foo.bar, false)\n\n  foo?.bar?.baz(foo.bar, true)\n\n  foo.bar?.baz?.(foo.bar, false)\n\n  foo?.bar?.baz?.(foo.bar, true)\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[39],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'general — parenthesized member call loose (exec)',
    source:
      'class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() { return this.x; };\n  getSelf() { return this }\n\n  test() {\n    const Foo = this;\n    const o = { Foo: Foo };\n    const fn = function () {\n      return o;\n    };\n\n    expect((Foo?.["m"])()).toEqual(1);\n    expect((Foo?.["m"])().toString).toEqual(1..toString);\n    expect((Foo?.["m"])().toString()).toEqual(\'1\');\n\n    expect((o?.Foo.m)()).toEqual(1);\n    expect((o?.Foo.m)().toString).toEqual(1..toString);\n    expect((o?.Foo.m)().toString()).toEqual(\'1\');\n\n    expect((((o.Foo?.self.getSelf)())?.m)()).toEqual(1);\n    expect((((o.Foo.self?.getSelf)())?.m)()).toEqual(1);\n\n    expect((((fn()?.Foo?.self.getSelf)())?.m)()).toEqual(1);\n    expect((((fn?.().Foo.self?.getSelf)())?.m)()).toEqual(1);\n  }\n\n  testNull() {\n    const o = null;\n\n    expect(() => { (o?.Foo.m)() }).toThrow();\n    expect(() => { (o?.Foo.m)().toString }).toThrow();\n    expect(() => { (o?.Foo.m)().toString() }).toThrow();\n\n    expect(() => { (((o.Foo?.self.getSelf)())?.m)() }).toThrow();\n    expect(() => { (((o.Foo.self?.getSelf)())?.m)() }).toThrow();\n\n    expect(() => (((fn()?.Foo?.self.getSelf)())?.m)()).toThrow();\n    expect(() => (((fn?.().Foo.self?.getSelf)())?.m)()).toThrow();\n  }\n}\n\n(new Foo).test();\n(new Foo).testNull();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[41],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'general — parenthesized member call loose (input)',
    source:
      'class Foo {\n  constructor() {\n    this.x = 1;\n    this.self = this;\n  }\n  m() { return this.x; };\n  getSelf() { return this }\n\n  test() {\n    const Foo = this;\n    const o = { Foo: Foo };\n    const fn = function () {\n      return o;\n    };\n\n    (Foo?.["m"])();\n    (Foo?.["m"])().toString;\n    (Foo?.["m"])().toString();\n\n    (o?.Foo.m)();\n    (o?.Foo.m)().toString;\n    (o?.Foo.m)().toString();\n\n    (((o.Foo?.self.getSelf)())?.m)();\n    (((o.Foo.self?.getSelf)())?.m)();\n\n    (((fn()?.Foo?.self.getSelf)())?.m)();\n    (((fn?.().Foo.self?.getSelf)())?.m)();\n  }\n}\n\n(new Foo).test();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[43],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'general — unary (exec)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: 0,\n  },\n};\n\nlet test = +obj?.a?.b;\nexpect(test).toBe(0);\n\ntest = +obj?.a.b;\nexpect(test).toBe(0);\n\ntest = +obj?.b?.b;\nexpect(test).toBe(NaN);\n\ntest = +obj?.b?.b;\nexpect(test).toBe(NaN);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[45],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'general — unary (input)',
    source:
      '"use strict";\n\nconst obj = {\n  a: {\n    b: 0,\n  },\n};\n\nlet test = +obj?.a?.b;\n\ntest = +obj?.a.b;\n\ntest = +obj?.b?.b;\n\ntest = +obj?.b?.b;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[47],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'regression — 10959 transform optional chaining (input)',
    source:
      'a?.b!.c;\na?.b!.c.d;\na?.b.c!.d;\na!.b?.c;\na?.b!?.c;\na?.b!.c?.c;\n(a?.b!).c;\n(a?.b)!.c;\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[49],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'regression — 15887 (exec)',
    source: 'let a = (0, null?.prop);\n\nexpect(a).toBe(undefined);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[51],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'regression — 15887 (input)',
    source: 'let a = (null?.prop1, null?.prop2);\n\nexpect(a).toBe(undefined);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[53],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'regression — 16767 super method undefined optional call (exec)',
    source:
      "class SS {\n  constructor(name){\n    this.name = 'ss'+name;\n  }\n}\n\nclass AA extends SS {\n  constructor(name){\n    super(name);\n    this.name = 'aa' +name;\n}\n\naaGreet(s){\n  super.greet?.(s + 'hhh');\n}\n}\n\nconst a = new AA('jack');\n\nexpect(() => a.aaGreet('d')).not.toThrow();\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[55],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'regression — 7642 (input)',
    source: '{\n  const foo = 1;\n}\n\n{\n  const foo = ({})?.foo;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[57],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'regression — 8354 (exec)',
    source:
      "const foo = undefined;\nconst bar = 'bar';\nconst foobar = foo?.replace(`foo${bar}`, '');\n\nexpect(foobar).toBe(undefined);",
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[59],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as call context in if (input)',
    source: '(a) => {\n  if ((a.b as any)?.()) {}\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[61],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as call context (input)',
    source: '(a.b as any)?.()\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[63],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as function call loose (input)',
    source: '(((foo as A).bar) as B)?.(foo.bar, false)\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[65],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as in conditional (input)',
    source: '(a) => {\n  (((a?.b as any) && a.c?.d) as any) ? 0 : 1\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[67],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as member expression (input)',
    source: '(a?.b as ExampleType)?.c as ExampleType2\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[69],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts parenthesized expression member call (input)',
    source: '((o?.Foo.m) as ExampleType)()\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            optionalChaining: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[71],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            optionalChaining: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
