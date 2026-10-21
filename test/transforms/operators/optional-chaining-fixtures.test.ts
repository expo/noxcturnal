import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption noDocumentAll — assignment (exec)',
    source: `"use strict";

const obj = {
  a: {
    b: {
      c: {
        d: 2,
      },
    },
  },
};

const a = obj?.a;
expect(a).toBe(obj.a);

const b = obj?.a?.b;
expect(b).toBe(obj.a.b);

const bad = obj?.b?.b;
expect(bad).toBeUndefined();

let val;
val = obj?.a?.b;
expect(val).toBe(obj.a.b);

expect(() => {
  const bad = obj?.b.b;
}).toThrow();
`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$a2;
const obj = { a: { b: { c: { d: 2 } } } };
const a = obj === null || obj === void 0 ? void 0 : obj.a;
expect(a).toBe(obj.a);
const b =
  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
    ? void 0
    : _obj$a.b;
expect(b).toBe(obj.a.b);
const bad =
  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
    ? void 0
    : _obj$b.b;
expect(bad).toBeUndefined();
let val;
val =
  obj === null || obj === void 0 || (_obj$a2 = obj.a) === null || _obj$a2 === void 0
    ? void 0
    : _obj$a2.b;
expect(val).toBe(obj.a.b);
expect(() => {
  const bad = obj === null || obj === void 0 ? void 0 : obj.b.b;
}).toThrow();`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$a2;
const obj = { a: { b: { c: { d: 2 } } } };
const a = obj == null ? void 0 : obj.a;
expect(a).toBe(obj.a);
const b = obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b;
expect(b).toBe(obj.a.b);
const bad = obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b;
expect(bad).toBeUndefined();
let val;
val = obj == null || (_obj$a2 = obj.a) == null ? void 0 : _obj$a2.b;
expect(val).toBe(obj.a.b);
expect(() => {
  const bad = obj == null ? void 0 : obj.b.b;
}).toThrow();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — assignment (input)',
    source: `"use strict";

const obj = {
  a: {
    b: {
      c: {
        d: 2,
      },
    },
  },
};

const a = obj?.a;

const b = obj?.a?.b;

const bad = obj?.b?.b;

let val;
val = obj?.a?.b;
`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$a2;
const obj = { a: { b: { c: { d: 2 } } } };
const a = obj === null || obj === void 0 ? void 0 : obj.a;
const b =
  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
    ? void 0
    : _obj$a.b;
const bad =
  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
    ? void 0
    : _obj$b.b;
let val;
val =
  obj === null || obj === void 0 || (_obj$a2 = obj.a) === null || _obj$a2 === void 0
    ? void 0
    : _obj$a2.b;`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$a2;
const obj = { a: { b: { c: { d: 2 } } } };
const a = obj == null ? void 0 : obj.a;
const b = obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b;
const bad = obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b;
let val;
val = obj == null || (_obj$a2 = obj.a) == null ? void 0 : _obj$a2.b;`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — call (exec)',
    source: '',
    filename: 'exec.js',
    output: '',
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — cast to boolean (exec)',
    source: `class C {
  static testIf(o) {
    if (o?.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return o?.a.b?.c.d ? true : false;
  }
  static testLoop(o) {
    while (o?.a.b.c.d) {
      for (; o?.a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o?.a.b?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!o?.a.b?.c.d;
  }
  static testIfDeep(o) {
    if (o.obj?.a.b?.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    return o.obj?.a.b?.c.d ? true : false;
  }
  static testLoopDeep(o) {
    while (o.obj?.a.b.c.d) {
      for (; o.obj?.a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o.obj?.a.b?.c.d);
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    return !!o.obj?.a.b?.c.d;
  }

  static testLogicalInIf(o) {
    if (o?.a.b?.c.d && o?.a?.b.c.d) {
      return true;
    }
    return false;
  }

  static testLogicalInReturn(o) {
    return o?.a.b?.c.d && o?.a?.b.c.d;
  }

  static testNullishCoalescing(o) {
    if (o?.a.b?.c.non_existent ?? o?.a.b?.c.d) {
      return o?.a.b?.c.non_existent ?? o?.a.b?.c.d;
    }
    return o?.a.b?.c.non_existent ?? o;
  }

  static test() {
    const c = {
      a: {
        b: {
          c: {
            d: 2,
          },
        },
      },
    };
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);

    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);

    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);

    expect(C.testNullishCoalescing(c)).toBe(2);
  }

  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);

      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);

      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);

      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}

C.test();
C.testNullish();
`,
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
        output: `class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : o.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    var _o$a$b;
    return (
      o === null || o === void 0 || (_o$a$b = o.a.b) === null || _o$a$b === void 0
        ? void 0
        : _o$a$b.c.d
    )
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : o.a.b.c.d) {
      var _o$a$b$c;
      for (
        ;
        o === null || o === void 0 || (_o$a$b$c = o.a.b.c) === null || _o$a$b$c === void 0
          ? void 0
          : _o$a$b$c.d;
      ) {
        var _o$a$b2;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          o === null || o === void 0 || (_o$a$b2 = o.a.b) === null || _o$a$b2 === void 0
            ? void 0
            : _o$a$b2.c.d
        );
      }
    }
    return false;
  }
  static testNegate(o) {
    var _o$a$b3;
    return !!(o === null || o === void 0 || (_o$a$b3 = o.a.b) === null || _o$a$b3 === void 0
      ? void 0
      : _o$a$b3.c.d);
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      (_o$obj = o.obj) === null ||
      _o$obj === void 0 ||
      (_o$obj = _o$obj.a.b) === null ||
      _o$obj === void 0
        ? void 0
        : _o$obj.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return (
      (_o$obj2 = o.obj) === null ||
      _o$obj2 === void 0 ||
      (_o$obj2 = _o$obj2.a.b) === null ||
      _o$obj2 === void 0
        ? void 0
        : _o$obj2.c.d
    )
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while ((_o$obj3 = o.obj) === null || _o$obj3 === void 0 ? void 0 : _o$obj3.a.b.c.d) {
      var _o$obj4;
      for (
        ;
        (_o$obj4 = o.obj) === null ||
        _o$obj4 === void 0 ||
        (_o$obj4 = _o$obj4.a.b.c) === null ||
        _o$obj4 === void 0
          ? void 0
          : _o$obj4.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (_o$obj5 = o.obj) === null ||
          _o$obj5 === void 0 ||
          (_o$obj5 = _o$obj5.a.b) === null ||
          _o$obj5 === void 0
            ? void 0
            : _o$obj5.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!((_o$obj6 = o.obj) === null ||
    _o$obj6 === void 0 ||
    (_o$obj6 = _o$obj6.a.b) === null ||
    _o$obj6 === void 0
      ? void 0
      : _o$obj6.c.d);
  }
  static testLogicalInIf(o) {
    var _o$a$b4, _o$a;
    if (
      (o === null || o === void 0 || (_o$a$b4 = o.a.b) === null || _o$a$b4 === void 0
        ? void 0
        : _o$a$b4.c.d) &&
      (o === null || o === void 0 || (_o$a = o.a) === null || _o$a === void 0 ? void 0 : _o$a.b.c.d)
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    var _o$a$b5, _o$a2;
    return (
      (o === null || o === void 0 || (_o$a$b5 = o.a.b) === null || _o$a$b5 === void 0
        ? void 0
        : _o$a$b5.c.d) &&
      (o === null || o === void 0 || (_o$a2 = o.a) === null || _o$a2 === void 0
        ? void 0
        : _o$a2.b.c.d)
    );
  }
  static testNullishCoalescing(o) {
    var _o$a$b6, _o$a$b7, _o$a$b10;
    if (
      (o === null || o === void 0 || (_o$a$b6 = o.a.b) === null || _o$a$b6 === void 0
        ? void 0
        : _o$a$b6.c.non_existent) ??
      (o === null || o === void 0 || (_o$a$b7 = o.a.b) === null || _o$a$b7 === void 0
        ? void 0
        : _o$a$b7.c.d)
    ) {
      var _o$a$b8, _o$a$b9;
      return (
        (o === null || o === void 0 || (_o$a$b8 = o.a.b) === null || _o$a$b8 === void 0
          ? void 0
          : _o$a$b8.c.non_existent) ??
        (o === null || o === void 0 || (_o$a$b9 = o.a.b) === null || _o$a$b9 === void 0
          ? void 0
          : _o$a$b9.c.d)
      );
    }
    return (
      (o === null || o === void 0 || (_o$a$b10 = o.a.b) === null || _o$a$b10 === void 0
        ? void 0
        : _o$a$b10.c.non_existent) ?? o
    );
  }
  static test() {
    const c = { a: { b: { c: { d: 2 } } } };
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);
    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);
    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);
    expect(C.testNullishCoalescing(c)).toBe(2);
  }
  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);
      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);
      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);
      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}
C.test();
C.testNullish();`,
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
        output: `class C {
  static testIf(o) {
    if (o == null ? void 0 : o.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    var _o$a$b;
    return (o == null || (_o$a$b = o.a.b) == null ? void 0 : _o$a$b.c.d) ? true : false;
  }
  static testLoop(o) {
    while (o == null ? void 0 : o.a.b.c.d) {
      var _o$a$b$c;
      for (; o == null || (_o$a$b$c = o.a.b.c) == null ? void 0 : _o$a$b$c.d;) {
        var _o$a$b2;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o == null || (_o$a$b2 = o.a.b) == null ? void 0 : _o$a$b2.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    var _o$a$b3;
    return !!(o == null || (_o$a$b3 = o.a.b) == null ? void 0 : _o$a$b3.c.d);
  }
  static testIfDeep(o) {
    var _o$obj;
    if ((_o$obj = o.obj) == null || (_o$obj = _o$obj.a.b) == null ? void 0 : _o$obj.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) == null || (_o$obj2 = _o$obj2.a.b) == null ? void 0 : _o$obj2.c.d)
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while ((_o$obj3 = o.obj) == null ? void 0 : _o$obj3.a.b.c.d) {
      var _o$obj4;
      for (; (_o$obj4 = o.obj) == null || (_o$obj4 = _o$obj4.a.b.c) == null ? void 0 : _o$obj4.d;) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (_o$obj5 = o.obj) == null || (_o$obj5 = _o$obj5.a.b) == null ? void 0 : _o$obj5.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!((_o$obj6 = o.obj) == null || (_o$obj6 = _o$obj6.a.b) == null ? void 0 : _o$obj6.c.d);
  }
  static testLogicalInIf(o) {
    var _o$a$b4, _o$a;
    if (
      (o == null || (_o$a$b4 = o.a.b) == null ? void 0 : _o$a$b4.c.d) &&
      (o == null || (_o$a = o.a) == null ? void 0 : _o$a.b.c.d)
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    var _o$a$b5, _o$a2;
    return (
      (o == null || (_o$a$b5 = o.a.b) == null ? void 0 : _o$a$b5.c.d) &&
      (o == null || (_o$a2 = o.a) == null ? void 0 : _o$a2.b.c.d)
    );
  }
  static testNullishCoalescing(o) {
    var _o$a$b6, _o$a$b7, _o$a$b10;
    if (
      (o == null || (_o$a$b6 = o.a.b) == null ? void 0 : _o$a$b6.c.non_existent) ??
      (o == null || (_o$a$b7 = o.a.b) == null ? void 0 : _o$a$b7.c.d)
    ) {
      var _o$a$b8, _o$a$b9;
      return (
        (o == null || (_o$a$b8 = o.a.b) == null ? void 0 : _o$a$b8.c.non_existent) ??
        (o == null || (_o$a$b9 = o.a.b) == null ? void 0 : _o$a$b9.c.d)
      );
    }
    return (o == null || (_o$a$b10 = o.a.b) == null ? void 0 : _o$a$b10.c.non_existent) ?? o;
  }
  static test() {
    const c = { a: { b: { c: { d: 2 } } } };
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);
    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);
    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);
    expect(C.testNullishCoalescing(c)).toBe(2);
  }
  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);
      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);
      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);
      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}
C.test();
C.testNullish();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — cast to boolean (input)',
    source: `class C {
  static testIf(o) {
    if (o?.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return o?.a.b?.c.d ? true : false;
  }
  static testLoop(o) {
    while (o?.a.b.c.d) {
      for (; o?.a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o?.a.b?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!o?.a.b?.c.d;
  }
  static testIfDeep(o) {
    if (o.obj?.a.b?.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    return o.obj?.a.b?.c.d ? true : false;
  }
  static testLoopDeep(o) {
    while (o.obj?.a.b.c.d) {
      for (; o.obj?.a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o.obj?.a.b?.c.d);
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    return !!o.obj?.a.b?.c.d;
  }

  static testLogicalInIf(o) {
    if (o?.a.b?.c.d && o?.a?.b.c.d) {
      return true;
    }
    return false;
  }

  static testLogicalInReturn(o) {
    return o?.a.b?.c.d && o?.a?.b.c.d;
  }

  static testNullishCoalescing(o) {
    if (o?.a.b?.c.non_existent ?? o?.a.b?.c.d) {
      return o?.a.b?.c.non_existent ?? o?.a.b?.c.d;
    }
    return o?.a.b?.c.non_existent ?? o;
  }
}

C.test();
C.testNullish();
`,
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
        output: `class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : o.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    var _o$a$b;
    return (
      o === null || o === void 0 || (_o$a$b = o.a.b) === null || _o$a$b === void 0
        ? void 0
        : _o$a$b.c.d
    )
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : o.a.b.c.d) {
      var _o$a$b$c;
      for (
        ;
        o === null || o === void 0 || (_o$a$b$c = o.a.b.c) === null || _o$a$b$c === void 0
          ? void 0
          : _o$a$b$c.d;
      ) {
        var _o$a$b2;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          o === null || o === void 0 || (_o$a$b2 = o.a.b) === null || _o$a$b2 === void 0
            ? void 0
            : _o$a$b2.c.d
        );
      }
    }
    return false;
  }
  static testNegate(o) {
    var _o$a$b3;
    return !!(o === null || o === void 0 || (_o$a$b3 = o.a.b) === null || _o$a$b3 === void 0
      ? void 0
      : _o$a$b3.c.d);
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      (_o$obj = o.obj) === null ||
      _o$obj === void 0 ||
      (_o$obj = _o$obj.a.b) === null ||
      _o$obj === void 0
        ? void 0
        : _o$obj.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return (
      (_o$obj2 = o.obj) === null ||
      _o$obj2 === void 0 ||
      (_o$obj2 = _o$obj2.a.b) === null ||
      _o$obj2 === void 0
        ? void 0
        : _o$obj2.c.d
    )
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while ((_o$obj3 = o.obj) === null || _o$obj3 === void 0 ? void 0 : _o$obj3.a.b.c.d) {
      var _o$obj4;
      for (
        ;
        (_o$obj4 = o.obj) === null ||
        _o$obj4 === void 0 ||
        (_o$obj4 = _o$obj4.a.b.c) === null ||
        _o$obj4 === void 0
          ? void 0
          : _o$obj4.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (_o$obj5 = o.obj) === null ||
          _o$obj5 === void 0 ||
          (_o$obj5 = _o$obj5.a.b) === null ||
          _o$obj5 === void 0
            ? void 0
            : _o$obj5.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!((_o$obj6 = o.obj) === null ||
    _o$obj6 === void 0 ||
    (_o$obj6 = _o$obj6.a.b) === null ||
    _o$obj6 === void 0
      ? void 0
      : _o$obj6.c.d);
  }
  static testLogicalInIf(o) {
    var _o$a$b4, _o$a;
    if (
      (o === null || o === void 0 || (_o$a$b4 = o.a.b) === null || _o$a$b4 === void 0
        ? void 0
        : _o$a$b4.c.d) &&
      (o === null || o === void 0 || (_o$a = o.a) === null || _o$a === void 0 ? void 0 : _o$a.b.c.d)
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    var _o$a$b5, _o$a2;
    return (
      (o === null || o === void 0 || (_o$a$b5 = o.a.b) === null || _o$a$b5 === void 0
        ? void 0
        : _o$a$b5.c.d) &&
      (o === null || o === void 0 || (_o$a2 = o.a) === null || _o$a2 === void 0
        ? void 0
        : _o$a2.b.c.d)
    );
  }
  static testNullishCoalescing(o) {
    var _o$a$b6, _o$a$b7, _o$a$b10;
    if (
      (o === null || o === void 0 || (_o$a$b6 = o.a.b) === null || _o$a$b6 === void 0
        ? void 0
        : _o$a$b6.c.non_existent) ??
      (o === null || o === void 0 || (_o$a$b7 = o.a.b) === null || _o$a$b7 === void 0
        ? void 0
        : _o$a$b7.c.d)
    ) {
      var _o$a$b8, _o$a$b9;
      return (
        (o === null || o === void 0 || (_o$a$b8 = o.a.b) === null || _o$a$b8 === void 0
          ? void 0
          : _o$a$b8.c.non_existent) ??
        (o === null || o === void 0 || (_o$a$b9 = o.a.b) === null || _o$a$b9 === void 0
          ? void 0
          : _o$a$b9.c.d)
      );
    }
    return (
      (o === null || o === void 0 || (_o$a$b10 = o.a.b) === null || _o$a$b10 === void 0
        ? void 0
        : _o$a$b10.c.non_existent) ?? o
    );
  }
}
C.test();
C.testNullish();`,
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
        output: `class C {
  static testIf(o) {
    if (o == null ? void 0 : o.a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    var _o$a$b;
    return (o == null || (_o$a$b = o.a.b) == null ? void 0 : _o$a$b.c.d) ? true : false;
  }
  static testLoop(o) {
    while (o == null ? void 0 : o.a.b.c.d) {
      var _o$a$b$c;
      for (; o == null || (_o$a$b$c = o.a.b.c) == null ? void 0 : _o$a$b$c.d;) {
        var _o$a$b2;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o == null || (_o$a$b2 = o.a.b) == null ? void 0 : _o$a$b2.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    var _o$a$b3;
    return !!(o == null || (_o$a$b3 = o.a.b) == null ? void 0 : _o$a$b3.c.d);
  }
  static testIfDeep(o) {
    var _o$obj;
    if ((_o$obj = o.obj) == null || (_o$obj = _o$obj.a.b) == null ? void 0 : _o$obj.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) == null || (_o$obj2 = _o$obj2.a.b) == null ? void 0 : _o$obj2.c.d)
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while ((_o$obj3 = o.obj) == null ? void 0 : _o$obj3.a.b.c.d) {
      var _o$obj4;
      for (; (_o$obj4 = o.obj) == null || (_o$obj4 = _o$obj4.a.b.c) == null ? void 0 : _o$obj4.d;) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (_o$obj5 = o.obj) == null || (_o$obj5 = _o$obj5.a.b) == null ? void 0 : _o$obj5.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!((_o$obj6 = o.obj) == null || (_o$obj6 = _o$obj6.a.b) == null ? void 0 : _o$obj6.c.d);
  }
  static testLogicalInIf(o) {
    var _o$a$b4, _o$a;
    if (
      (o == null || (_o$a$b4 = o.a.b) == null ? void 0 : _o$a$b4.c.d) &&
      (o == null || (_o$a = o.a) == null ? void 0 : _o$a.b.c.d)
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    var _o$a$b5, _o$a2;
    return (
      (o == null || (_o$a$b5 = o.a.b) == null ? void 0 : _o$a$b5.c.d) &&
      (o == null || (_o$a2 = o.a) == null ? void 0 : _o$a2.b.c.d)
    );
  }
  static testNullishCoalescing(o) {
    var _o$a$b6, _o$a$b7, _o$a$b10;
    if (
      (o == null || (_o$a$b6 = o.a.b) == null ? void 0 : _o$a$b6.c.non_existent) ??
      (o == null || (_o$a$b7 = o.a.b) == null ? void 0 : _o$a$b7.c.d)
    ) {
      var _o$a$b8, _o$a$b9;
      return (
        (o == null || (_o$a$b8 = o.a.b) == null ? void 0 : _o$a$b8.c.non_existent) ??
        (o == null || (_o$a$b9 = o.a.b) == null ? void 0 : _o$a$b9.c.d)
      );
    }
    return (o == null || (_o$a$b10 = o.a.b) == null ? void 0 : _o$a$b10.c.non_existent) ?? o;
  }
}
C.test();
C.testNullish();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — in function params (input)',
    source: `function f(a = x?.y) {}

function g({ a, b = a?.c }) {}

function h(a, { b = a.b?.c?.d.e }) {}

function i(a, { b = (a.b?.c?.d).e }) {}

function j(a, { b = a?.b?.c().d.e }) {}
`,
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
        output: `function f(
  a = (() => {
    var _x;
    return (_x = x) === null || _x === void 0 ? void 0 : _x.y;
  })(),
) {}
function g({
  a,
  b = (() => {
    return a === null || a === void 0 ? void 0 : a.c;
  })(),
}) {}
function h(
  a,
  {
    b = (() => {
      var _a$b;
      return (_a$b = a.b) === null || _a$b === void 0 || (_a$b = _a$b.c) === null || _a$b === void 0
        ? void 0
        : _a$b.d.e;
    })(),
  },
) {}
function i(
  a,
  {
    b = (() => {
      var _a$b2;
      return (_a$b2 = a.b) === null ||
        _a$b2 === void 0 ||
        (_a$b2 = _a$b2.c) === null ||
        _a$b2 === void 0
        ? void 0
        : _a$b2.d;
    })().e,
  },
) {}
function j(
  a,
  {
    b = (() => {
      var _a$b3;
      return a === null || a === void 0 || (_a$b3 = a.b) === null || _a$b3 === void 0
        ? void 0
        : _a$b3.c().d.e;
    })(),
  },
) {}`,
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
        output: `function f(
  a = (() => {
    var _x;
    return (_x = x) == null ? void 0 : _x.y;
  })(),
) {}
function g({
  a,
  b = (() => {
    return a == null ? void 0 : a.c;
  })(),
}) {}
function h(
  a,
  {
    b = (() => {
      var _a$b;
      return (_a$b = a.b) == null || (_a$b = _a$b.c) == null ? void 0 : _a$b.d.e;
    })(),
  },
) {}
function i(
  a,
  {
    b = (() => {
      var _a$b2;
      return (_a$b2 = a.b) == null || (_a$b2 = _a$b2.c) == null ? void 0 : _a$b2.d;
    })().e,
  },
) {}
function j(
  a,
  {
    b = (() => {
      var _a$b3;
      return a == null || (_a$b3 = a.b) == null ? void 0 : _a$b3.c().d.e;
    })(),
  },
) {}`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — memoize (input)',
    source: `function test(foo) {
  foo?.bar;

  foo?.bar?.baz;

  foo?.(foo);

  foo?.bar()

  foo.get(bar)?.()

  foo.bar()?.()
  foo[bar]()?.()

  foo.bar().baz?.()
  foo[bar]().baz?.()

  foo.bar?.(foo.bar, false)

  foo?.bar?.(foo.bar, true)

  foo.bar?.baz(foo.bar, false)

  foo?.bar?.baz(foo.bar, true)

  foo.bar?.baz?.(foo.bar, false)

  foo?.bar?.baz?.(foo.bar, true)
}
`,
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
        output: `function test(foo) {
  var _foo$bar,
    _foo$get,
    _foo$bar2,
    _foo$bar3,
    _foo$bar$baz,
    _foo$bar4,
    _foo$bar$baz2,
    _foo$bar5,
    _foo$bar6,
    _foo$bar7,
    _foo$bar8,
    _foo$bar9,
    _foo$bar10,
    _foo$bar10$baz,
    _foo$bar11,
    _foo$bar11$baz;
  foo === null || foo === void 0 ? void 0 : foo.bar;
  foo === null || foo === void 0 || (_foo$bar = foo.bar) === null || _foo$bar === void 0
    ? void 0
    : _foo$bar.baz;
  foo === null || foo === void 0 ? void 0 : foo(foo);
  foo === null || foo === void 0 ? void 0 : foo.bar();
  (_foo$get = foo.get(bar)) === null || _foo$get === void 0 ? void 0 : _foo$get();
  (_foo$bar2 = foo.bar()) === null || _foo$bar2 === void 0 ? void 0 : _foo$bar2();
  (_foo$bar3 = foo[bar]()) === null || _foo$bar3 === void 0 ? void 0 : _foo$bar3();
  (_foo$bar$baz = (_foo$bar4 = foo.bar()).baz) === null || _foo$bar$baz === void 0
    ? void 0
    : _foo$bar$baz.call(_foo$bar4);
  (_foo$bar$baz2 = (_foo$bar5 = foo[bar]()).baz) === null || _foo$bar$baz2 === void 0
    ? void 0
    : _foo$bar$baz2.call(_foo$bar5);
  (_foo$bar6 = foo.bar) === null || _foo$bar6 === void 0
    ? void 0
    : _foo$bar6.call(foo, foo.bar, false);
  foo === null || foo === void 0 || (_foo$bar7 = foo.bar) === null || _foo$bar7 === void 0
    ? void 0
    : _foo$bar7.call(foo, foo.bar, true);
  (_foo$bar8 = foo.bar) === null || _foo$bar8 === void 0 ? void 0 : _foo$bar8.baz(foo.bar, false);
  foo === null || foo === void 0 || (_foo$bar9 = foo.bar) === null || _foo$bar9 === void 0
    ? void 0
    : _foo$bar9.baz(foo.bar, true);
  (_foo$bar10 = foo.bar) === null ||
  _foo$bar10 === void 0 ||
  (_foo$bar10$baz = _foo$bar10.baz) === null ||
  _foo$bar10$baz === void 0
    ? void 0
    : _foo$bar10$baz.call(_foo$bar10, foo.bar, false);
  foo === null ||
  foo === void 0 ||
  (_foo$bar11 = foo.bar) === null ||
  _foo$bar11 === void 0 ||
  (_foo$bar11$baz = _foo$bar11.baz) === null ||
  _foo$bar11$baz === void 0
    ? void 0
    : _foo$bar11$baz.call(_foo$bar11, foo.bar, true);
}`,
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
        output: `function test(foo) {
  var _foo$bar,
    _foo$get,
    _foo$bar2,
    _foo$bar3,
    _foo$bar$baz,
    _foo$bar4,
    _foo$bar$baz2,
    _foo$bar5,
    _foo$bar6,
    _foo$bar7,
    _foo$bar8,
    _foo$bar9,
    _foo$bar10,
    _foo$bar10$baz,
    _foo$bar11,
    _foo$bar11$baz;
  foo == null ? void 0 : foo.bar;
  foo == null || (_foo$bar = foo.bar) == null ? void 0 : _foo$bar.baz;
  foo == null ? void 0 : foo(foo);
  foo == null ? void 0 : foo.bar();
  (_foo$get = foo.get(bar)) == null ? void 0 : _foo$get();
  (_foo$bar2 = foo.bar()) == null ? void 0 : _foo$bar2();
  (_foo$bar3 = foo[bar]()) == null ? void 0 : _foo$bar3();
  (_foo$bar$baz = (_foo$bar4 = foo.bar()).baz) == null ? void 0 : _foo$bar$baz.call(_foo$bar4);
  (_foo$bar$baz2 = (_foo$bar5 = foo[bar]()).baz) == null ? void 0 : _foo$bar$baz2.call(_foo$bar5);
  (_foo$bar6 = foo.bar) == null ? void 0 : _foo$bar6.call(foo, foo.bar, false);
  foo == null || (_foo$bar7 = foo.bar) == null ? void 0 : _foo$bar7.call(foo, foo.bar, true);
  (_foo$bar8 = foo.bar) == null ? void 0 : _foo$bar8.baz(foo.bar, false);
  foo == null || (_foo$bar9 = foo.bar) == null ? void 0 : _foo$bar9.baz(foo.bar, true);
  (_foo$bar10 = foo.bar) == null || (_foo$bar10$baz = _foo$bar10.baz) == null
    ? void 0
    : _foo$bar10$baz.call(_foo$bar10, foo.bar, false);
  foo == null || (_foo$bar11 = foo.bar) == null || (_foo$bar11$baz = _foo$bar11.baz) == null
    ? void 0
    : _foo$bar11$baz.call(_foo$bar11, foo.bar, true);
}`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional eval call (input)',
    source: `var foo;

/* indirect eval calls */
eval?.(foo);

(eval)?.(foo);

eval?.()();

eval?.().foo;

/* direct eval calls */

eval()?.();

eval()?.foo;

/* plain function calls */

foo.eval?.(foo);

eval.foo?.(foo);
`,
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
        output: `var _eval, _eval2, _foo$eval, _eval$foo, _eval3;
var foo;
/* indirect eval calls */
eval === null || eval === void 0 ? void 0 : (0, eval)(foo);
eval === null || eval === void 0 ? void 0 : (0, eval)(foo);
eval === null || eval === void 0 ? void 0 : (0, eval)()();
eval === null || eval === void 0 ? void 0 : (0, eval)().foo;
/* direct eval calls */
(_eval = eval()) === null || _eval === void 0 ? void 0 : _eval();
(_eval2 = eval()) === null || _eval2 === void 0 ? void 0 : _eval2.foo;
/* plain function calls */
(_foo$eval = foo.eval) === null || _foo$eval === void 0 ? void 0 : _foo$eval.call(foo, foo);
(_eval$foo = (_eval3 = eval).foo) === null || _eval$foo === void 0
  ? void 0
  : _eval$foo.call(_eval3, foo);`,
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
        output: `var _eval, _eval2, _foo$eval, _eval$foo, _eval3;
var foo;
/* indirect eval calls */
eval == null ? void 0 : (0, eval)(foo);
eval == null ? void 0 : (0, eval)(foo);
eval == null ? void 0 : (0, eval)()();
eval == null ? void 0 : (0, eval)().foo;
/* direct eval calls */
(_eval = eval()) == null ? void 0 : _eval();
(_eval2 = eval()) == null ? void 0 : _eval2.foo;
/* plain function calls */
(_foo$eval = foo.eval) == null ? void 0 : _foo$eval.call(foo, foo);
(_eval$foo = (_eval3 = eval).foo) == null ? void 0 : _eval$foo.call(_eval3, foo);`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — parenthesized expression member call (exec)',
    source: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() { return this.x; };
  getSelf() { return this }

  test() {
    const Foo = this;
    const o = { Foo: Foo };
    const fn = function () {
      return o;
    };

    expect((Foo?.["m"])()).toEqual(1);
    expect((Foo?.["m"])().toString).toEqual(1..toString);
    expect((Foo?.["m"])().toString()).toEqual('1');

    expect(((Foo?.["m"]))()).toEqual(1);
    expect(((Foo?.["m"]))().toString).toEqual(1..toString);
    expect(((Foo?.["m"]))().toString()).toEqual('1');

    expect((o?.Foo.m)()).toEqual(1);
    expect((o?.Foo.m)().toString).toEqual(1..toString);
    expect((o?.Foo.m)().toString()).toEqual('1');

    expect((((o.Foo?.self.getSelf)())?.m)()).toEqual(1);
    expect((((o.Foo.self?.getSelf)())?.m)()).toEqual(1);

    expect((((fn()?.Foo?.self.getSelf)())?.m)()).toEqual(1);
    expect((((fn?.().Foo.self?.getSelf)())?.m)()).toEqual(1);
  }

  testNull() {
    const o = null;

    expect(() => { (o?.Foo.m)() }).toThrow();
    expect(() => { (o?.Foo.m)().toString }).toThrow();
    expect(() => { (o?.Foo.m)().toString() }).toThrow();

    expect(() => { (((o.Foo?.self.getSelf)())?.m)() }).toThrow();
    expect(() => { (((o.Foo.self?.getSelf)())?.m)() }).toThrow();

    expect(() => (((fn()?.Foo?.self.getSelf)())?.m)()).toThrow();
    expect(() => (((fn?.().Foo.self?.getSelf)())?.m)()).toThrow();
  }
}

(new Foo).test();
(new Foo).testNull();
`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(
      (1).toString,
    );
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(
      '1',
    );
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(
      (1).toString,
    );
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(
      '1',
    );
    expect((o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);
    expect(
      (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString,
    ).toEqual((1).toString);
    expect(
      (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString(),
    ).toEqual('1');
    expect(
      ((_ref = (
        (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0
          ? void 0
          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
      )()) === null || _ref === void 0
        ? void 0
        : (_ref2 = _ref).m.bind(_ref2))(),
    ).toEqual(1);
    expect(
      ((_ref3 = (
        (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0
          ? void 0
          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
      )()) === null || _ref3 === void 0
        ? void 0
        : (_ref4 = _ref3).m.bind(_ref4))(),
    ).toEqual(1);
    expect(
      ((_ref5 = (
        (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0
          ? void 0
          : (_fn$self = _fn.self).getSelf.bind(_fn$self)
      )()) === null || _ref5 === void 0
        ? void 0
        : (_ref6 = _ref5).m.bind(_ref6))(),
    ).toEqual(1);
    expect(
      ((_ref7 = (
        fn === null ||
          fn === void 0 ||
          (_fn$Foo$self = fn().Foo.self) === null ||
          _fn$Foo$self === void 0
          ? void 0
          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
      )()) === null || _ref7 === void 0
        ? void 0
        : (_ref8 = _ref7).m.bind(_ref8))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    expect(() => {
      var _o$Foo5;
      (o === null || o === void 0 ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o === null || o === void 0 ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo7;
      (o === null || o === void 0 ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;
      ((_ref9 = (
        (_o$Foo8 = o.Foo) === null || _o$Foo8 === void 0
          ? void 0
          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)
      )()) === null || _ref9 === void 0
        ? void 0
        : (_ref10 = _ref9).m.bind(_ref10))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;
      ((_ref11 = (
        (_o$Foo$self3 = o.Foo.self) === null || _o$Foo$self3 === void 0
          ? void 0
          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)
      )()) === null || _ref11 === void 0
        ? void 0
        : (_ref12 = _ref11).m.bind(_ref12))();
    }).toThrow();
    expect(() => {
      var _fn2, _fn2$self, _ref13, _ref14;
      return (
        (_ref13 = (
          (_fn2 = fn()) === null || _fn2 === void 0 || (_fn2 = _fn2.Foo) === null || _fn2 === void 0
            ? void 0
            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)
        )()) === null || _ref13 === void 0
          ? void 0
          : (_ref14 = _ref13).m.bind(_ref14)
      )();
    }).toThrow();
    expect(() => {
      var _fn3, _fn4, _ref15, _ref16;
      return (
        (_ref15 = (
          (_fn3 = fn) === null ||
            _fn3 === void 0 ||
            (_fn3 = _fn3().Foo.self) === null ||
            _fn3 === void 0
            ? void 0
            : (_fn4 = _fn3).getSelf.bind(_fn4)
        )()) === null || _ref15 === void 0
          ? void 0
          : (_ref16 = _ref15).m.bind(_ref16)
      )();
    }).toThrow();
  }
}
new Foo().test();
new Foo().testNull();`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');
    expect((o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);
    expect((o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString).toEqual(
      (1).toString,
    );
    expect((o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString()).toEqual('1');
    expect(
      ((_ref = (
        (_o$Foo4 = o.Foo) == null
          ? void 0
          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
      )()) == null
        ? void 0
        : (_ref2 = _ref).m.bind(_ref2))(),
    ).toEqual(1);
    expect(
      ((_ref3 = (
        (_o$Foo$self = o.Foo.self) == null
          ? void 0
          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
      )()) == null
        ? void 0
        : (_ref4 = _ref3).m.bind(_ref4))(),
    ).toEqual(1);
    expect(
      ((_ref5 = (
        (_fn = fn()) == null || (_fn = _fn.Foo) == null
          ? void 0
          : (_fn$self = _fn.self).getSelf.bind(_fn$self)
      )()) == null
        ? void 0
        : (_ref6 = _ref5).m.bind(_ref6))(),
    ).toEqual(1);
    expect(
      ((_ref7 = (
        fn == null || (_fn$Foo$self = fn().Foo.self) == null
          ? void 0
          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
      )()) == null
        ? void 0
        : (_ref8 = _ref7).m.bind(_ref8))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    expect(() => {
      var _o$Foo5;
      (o == null ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o == null ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo7;
      (o == null ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;
      ((_ref9 = (
        (_o$Foo8 = o.Foo) == null
          ? void 0
          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)
      )()) == null
        ? void 0
        : (_ref10 = _ref9).m.bind(_ref10))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;
      ((_ref11 = (
        (_o$Foo$self3 = o.Foo.self) == null
          ? void 0
          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)
      )()) == null
        ? void 0
        : (_ref12 = _ref11).m.bind(_ref12))();
    }).toThrow();
    expect(() => {
      var _fn2, _fn2$self, _ref13, _ref14;
      return (
        (_ref13 = (
          (_fn2 = fn()) == null || (_fn2 = _fn2.Foo) == null
            ? void 0
            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)
        )()) == null
          ? void 0
          : (_ref14 = _ref13).m.bind(_ref14)
      )();
    }).toThrow();
    expect(() => {
      var _fn3, _fn4, _ref15, _ref16;
      return (
        (_ref15 = (
          (_fn3 = fn) == null || (_fn3 = _fn3().Foo.self) == null
            ? void 0
            : (_fn4 = _fn3).getSelf.bind(_fn4)
        )()) == null
          ? void 0
          : (_ref16 = _ref15).m.bind(_ref16)
      )();
    }).toThrow();
  }
}
new Foo().test();
new Foo().testNull();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — super method call (input)',
    source: `"use strict";
class Base {
  method() {
    return 'Hello!';
  }
}

class Derived extends Base {
    method() {
        return super.method?.()
    }
}
`,
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
        output: `'use strict';
class Base {
  method() {
    return 'Hello!';
  }
}
class Derived extends Base {
  method() {
    var _super$method;
    return (_super$method = super.method) === null || _super$method === void 0
      ? void 0
      : _super$method.call(this);
  }
}`,
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
        output: `'use strict';
class Base {
  method() {
    return 'Hello!';
  }
}
class Derived extends Base {
  method() {
    var _super$method;
    return (_super$method = super.method) == null ? void 0 : _super$method.call(this);
  }
}`,
      },
    ],
  },
  {
    title: 'assumption pureGetters — function call (input)',
    source: `foo?.(foo);

foo?.bar()

foo.bar?.(foo.bar, false)

foo?.bar?.(foo.bar, true)

foo?.().bar

foo?.()?.bar

foo.bar?.().baz

foo.bar?.()?.baz

foo?.bar?.().baz

foo?.bar?.()?.baz
`,
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
        output: `var _foo,
  _foo2,
  _foo$bar,
  _foo3,
  _foo4,
  _foo4$bar,
  _foo5,
  _foo6,
  _foo$bar2,
  _foo7,
  _foo$bar3,
  _foo8,
  _foo9,
  _foo9$bar,
  _foo10,
  _foo10$bar;
(_foo = foo) === null || _foo === void 0 ? void 0 : _foo(foo);
(_foo2 = foo) === null || _foo2 === void 0 ? void 0 : _foo2.bar();
(_foo$bar = (_foo3 = foo).bar) === null || _foo$bar === void 0
  ? void 0
  : _foo$bar.call(_foo3, foo.bar, false);
(_foo4 = foo) === null ||
_foo4 === void 0 ||
(_foo4$bar = _foo4.bar) === null ||
_foo4$bar === void 0
  ? void 0
  : _foo4$bar.call(_foo4, foo.bar, true);
(_foo5 = foo) === null || _foo5 === void 0 ? void 0 : _foo5().bar;
(_foo6 = foo) === null || _foo6 === void 0 || (_foo6 = _foo6()) === null || _foo6 === void 0
  ? void 0
  : _foo6.bar;
(_foo$bar2 = (_foo7 = foo).bar) === null || _foo$bar2 === void 0
  ? void 0
  : _foo$bar2.call(_foo7).baz;
(_foo$bar3 = (_foo8 = foo).bar) === null ||
_foo$bar3 === void 0 ||
(_foo$bar3 = _foo$bar3.call(_foo8)) === null ||
_foo$bar3 === void 0
  ? void 0
  : _foo$bar3.baz;
(_foo9 = foo) === null ||
_foo9 === void 0 ||
(_foo9$bar = _foo9.bar) === null ||
_foo9$bar === void 0
  ? void 0
  : _foo9$bar.call(_foo9).baz;
(_foo10 = foo) === null ||
_foo10 === void 0 ||
(_foo10$bar = _foo10.bar) === null ||
_foo10$bar === void 0 ||
(_foo10$bar = _foo10$bar.call(_foo10)) === null ||
_foo10$bar === void 0
  ? void 0
  : _foo10$bar.baz;`,
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
        output: `var _foo,
  _foo2,
  _foo$bar,
  _foo3,
  _foo4,
  _foo4$bar,
  _foo5,
  _foo6,
  _foo$bar2,
  _foo7,
  _foo$bar3,
  _foo8,
  _foo9,
  _foo9$bar,
  _foo10,
  _foo10$bar;
(_foo = foo) == null ? void 0 : _foo(foo);
(_foo2 = foo) == null ? void 0 : _foo2.bar();
(_foo$bar = (_foo3 = foo).bar) == null ? void 0 : _foo$bar.call(_foo3, foo.bar, false);
(_foo4 = foo) == null || (_foo4$bar = _foo4.bar) == null
  ? void 0
  : _foo4$bar.call(_foo4, foo.bar, true);
(_foo5 = foo) == null ? void 0 : _foo5().bar;
(_foo6 = foo) == null || (_foo6 = _foo6()) == null ? void 0 : _foo6.bar;
(_foo$bar2 = (_foo7 = foo).bar) == null ? void 0 : _foo$bar2.call(_foo7).baz;
(_foo$bar3 = (_foo8 = foo).bar) == null || (_foo$bar3 = _foo$bar3.call(_foo8)) == null
  ? void 0
  : _foo$bar3.baz;
(_foo9 = foo) == null || (_foo9$bar = _foo9.bar) == null ? void 0 : _foo9$bar.call(_foo9).baz;
(_foo10 = foo) == null ||
(_foo10$bar = _foo10.bar) == null ||
(_foo10$bar = _foo10$bar.call(_foo10)) == null
  ? void 0
  : _foo10$bar.baz;`,
      },
    ],
  },
  {
    title: 'general — containers (input)',
    source: `var street = user.address?.street
street = user.address?.street

test(a?.b,  1);
test((a?.b), 1);

(1, a?.b, 2);
`,
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
        output: `var _user$address, _user$address2, _a, _a2, _a3;
var street =
  (_user$address = user.address) === null || _user$address === void 0
    ? void 0
    : _user$address.street;
street =
  (_user$address2 = user.address) === null || _user$address2 === void 0
    ? void 0
    : _user$address2.street;
test((_a = a) === null || _a === void 0 ? void 0 : _a.b, 1);
test((_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b, 1);
(1, (_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b, 2);`,
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
        output: `var _user$address, _user$address2, _a, _a2, _a3;
var street = (_user$address = user.address) == null ? void 0 : _user$address.street;
street = (_user$address2 = user.address) == null ? void 0 : _user$address2.street;
test((_a = a) == null ? void 0 : _a.b, 1);
test((_a2 = a) == null ? void 0 : _a2.b, 1);
(1, (_a3 = a) == null ? void 0 : _a3.b, 2);`,
      },
    ],
  },
  {
    title: 'general — delete in function params (input)',
    source: `function f(x = delete a()?.b) {}
`,
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
        output: `function f(
  x = (() => {
    var _a;
    return (_a = a()) === null || _a === void 0 ? true : delete _a.b;
  })(),
) {}`,
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
        output: `function f(
  x = (() => {
    var _a;
    return (_a = a()) == null ? true : delete _a.b;
  })(),
) {}`,
      },
    ],
  },
  {
    title: 'general — delete (exec)',
    source: `"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = delete obj?.a?.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);

test = delete obj?.a.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);

test = delete obj?.b?.b;
expect(obj.b).toBeUndefined();
expect(test).toBe(true);

delete obj?.a;
expect(obj.a).toBeUndefined();
`,
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
        output: `'use strict';
var _obj$a, _obj$b;
const obj = { a: { b: 0 } };
let test =
  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
    ? true
    : delete _obj$a.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);
test = obj === null || obj === void 0 ? true : delete obj.a.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);
test =
  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
    ? true
    : delete _obj$b.b;
expect(obj.b).toBeUndefined();
expect(test).toBe(true);
obj === null || obj === void 0 ? true : delete obj.a;
expect(obj.a).toBeUndefined();`,
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
        output: `'use strict';
var _obj$a, _obj$b;
const obj = { a: { b: 0 } };
let test = obj == null || (_obj$a = obj.a) == null ? true : delete _obj$a.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);
test = obj == null ? true : delete obj.a.b;
expect(obj.a.b).toBeUndefined();
expect(test).toBe(true);
test = obj == null || (_obj$b = obj.b) == null ? true : delete _obj$b.b;
expect(obj.b).toBeUndefined();
expect(test).toBe(true);
obj == null ? true : delete obj.a;
expect(obj.a).toBeUndefined();`,
      },
    ],
  },
  {
    title: 'general — delete (input)',
    source: `"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = delete obj?.a?.b;

test = delete obj?.a.b;

test = delete obj?.b?.b;

delete obj?.a;
`,
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
        output: `'use strict';
var _obj$a, _obj$b;
const obj = { a: { b: 0 } };
let test =
  obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
    ? true
    : delete _obj$a.b;
test = obj === null || obj === void 0 ? true : delete obj.a.b;
test =
  obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
    ? true
    : delete _obj$b.b;
obj === null || obj === void 0 ? true : delete obj.a;`,
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
        output: `'use strict';
var _obj$a, _obj$b;
const obj = { a: { b: 0 } };
let test = obj == null || (_obj$a = obj.a) == null ? true : delete _obj$a.b;
test = obj == null ? true : delete obj.a.b;
test = obj == null || (_obj$b = obj.b) == null ? true : delete _obj$b.b;
obj == null ? true : delete obj.a;`,
      },
    ],
  },
  {
    title: 'general — function call loose (input)',
    source: `foo?.(foo);

foo?.bar()

foo.bar?.(foo.bar, false)

foo?.bar?.(foo.bar, true)
`,
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
        output: `var _foo, _foo2, _foo$bar, _foo3, _foo4, _foo4$bar;
(_foo = foo) === null || _foo === void 0 ? void 0 : _foo(foo);
(_foo2 = foo) === null || _foo2 === void 0 ? void 0 : _foo2.bar();
(_foo$bar = (_foo3 = foo).bar) === null || _foo$bar === void 0
  ? void 0
  : _foo$bar.call(_foo3, foo.bar, false);
(_foo4 = foo) === null ||
_foo4 === void 0 ||
(_foo4$bar = _foo4.bar) === null ||
_foo4$bar === void 0
  ? void 0
  : _foo4$bar.call(_foo4, foo.bar, true);`,
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
        output: `var _foo, _foo2, _foo$bar, _foo3, _foo4, _foo4$bar;
(_foo = foo) == null ? void 0 : _foo(foo);
(_foo2 = foo) == null ? void 0 : _foo2.bar();
(_foo$bar = (_foo3 = foo).bar) == null ? void 0 : _foo$bar.call(_foo3, foo.bar, false);
(_foo4 = foo) == null || (_foo4$bar = _foo4.bar) == null
  ? void 0
  : _foo4$bar.call(_foo4, foo.bar, true);`,
      },
    ],
  },
  {
    title: 'general — function call spread (input)',
    source: `a?.(...args);

a?.b(...args);

a?.b(...args).c;

a?.b(...args).c(...args);
`,
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
        output: `var _a, _a2, _a3, _a4;
(_a = a) === null || _a === void 0 ? void 0 : _a(...args);
(_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b(...args);
(_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b(...args).c;
(_a4 = a) === null || _a4 === void 0 ? void 0 : _a4.b(...args).c(...args);`,
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
        output: `var _a, _a2, _a3, _a4;
(_a = a) == null ? void 0 : _a(...args);
(_a2 = a) == null ? void 0 : _a2.b(...args);
(_a3 = a) == null ? void 0 : _a3.b(...args).c;
(_a4 = a) == null ? void 0 : _a4.b(...args).c(...args);`,
      },
    ],
  },
  {
    title: 'general — in method key loose (input)',
    source: `let x;
const a = {
  [x.y?.z]() {}
};
`,
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
        output: `var _x$y;
let x;
const a = { [(_x$y = x.y) === null || _x$y === void 0 ? void 0 : _x$y.z]() {} };`,
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
        output: `var _x$y;
let x;
const a = { [(_x$y = x.y) == null ? void 0 : _x$y.z]() {} };`,
      },
    ],
  },
  {
    title: 'general — in var destructuring (input)',
    source: `var { a = x?.y } = {};
`,
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
        output: `var _x;
var { a = (_x = x) === null || _x === void 0 ? void 0 : _x.y } = {};`,
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
        output: `var _x;
var { a = (_x = x) == null ? void 0 : _x.y } = {};`,
      },
    ],
  },
  {
    title: 'general — member access (input)',
    source: `foo?.bar;

a?.b.c?.d.e;

a.b?.c.d?.e;

a.b.c?.d?.e;

orders?.[0].price;

orders?.[0]?.price;

orders[client?.key].price;

orders[client.key]?.price;

(0, a?.b).c;

(0, (0, a?.b).c?.d).e;
`,
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
        output: `var _foo, _a, _a$b, _a$b$c, _orders, _orders2, _client, _orders$client$key, _a2, _c, _a3;
(_foo = foo) === null || _foo === void 0 ? void 0 : _foo.bar;
(_a = a) === null || _a === void 0 || (_a = _a.b.c) === null || _a === void 0 ? void 0 : _a.d.e;
(_a$b = a.b) === null || _a$b === void 0 || (_a$b = _a$b.c.d) === null || _a$b === void 0
  ? void 0
  : _a$b.e;
(_a$b$c = a.b.c) === null || _a$b$c === void 0 || (_a$b$c = _a$b$c.d) === null || _a$b$c === void 0
  ? void 0
  : _a$b$c.e;
(_orders = orders) === null || _orders === void 0 ? void 0 : _orders[0].price;
(_orders2 = orders) === null ||
_orders2 === void 0 ||
(_orders2 = _orders2[0]) === null ||
_orders2 === void 0
  ? void 0
  : _orders2.price;
orders[(_client = client) === null || _client === void 0 ? void 0 : _client.key].price;
(_orders$client$key = orders[client.key]) === null || _orders$client$key === void 0
  ? void 0
  : _orders$client$key.price;
(0, (_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b).c;
(0,
(_c = (0, (_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b).c) === null || _c === void 0
  ? void 0
  : _c.d).e;`,
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
        output: `var _foo, _a, _a$b, _a$b$c, _orders, _orders2, _client, _orders$client$key, _a2, _c, _a3;
(_foo = foo) == null ? void 0 : _foo.bar;
(_a = a) == null || (_a = _a.b.c) == null ? void 0 : _a.d.e;
(_a$b = a.b) == null || (_a$b = _a$b.c.d) == null ? void 0 : _a$b.e;
(_a$b$c = a.b.c) == null || (_a$b$c = _a$b$c.d) == null ? void 0 : _a$b$c.e;
(_orders = orders) == null ? void 0 : _orders[0].price;
(_orders2 = orders) == null || (_orders2 = _orders2[0]) == null ? void 0 : _orders2.price;
orders[(_client = client) == null ? void 0 : _client.key].price;
(_orders$client$key = orders[client.key]) == null ? void 0 : _orders$client$key.price;
(0, (_a2 = a) == null ? void 0 : _a2.b).c;
(0, (_c = (0, (_a3 = a) == null ? void 0 : _a3.b).c) == null ? void 0 : _c.d).e;`,
      },
    ],
  },
  {
    title: 'general — memoize (input)',
    source: `function test(foo) {
  foo?.bar;

  foo?.bar?.baz;

  foo?.(foo);

  foo?.bar()

  foo.bar?.(foo.bar, false)

  foo?.bar?.(foo.bar, true)

  foo.bar?.baz(foo.bar, false)

  foo?.bar?.baz(foo.bar, true)

  foo.bar?.baz?.(foo.bar, false)

  foo?.bar?.baz?.(foo.bar, true)
}
`,
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
        output: `function test(foo) {
  var _foo$bar,
    _foo$bar2,
    _foo$bar3,
    _foo$bar4,
    _foo$bar5,
    _foo$bar6,
    _foo$bar6$baz,
    _foo$bar7,
    _foo$bar7$baz;
  foo === null || foo === void 0 ? void 0 : foo.bar;
  foo === null || foo === void 0 || (_foo$bar = foo.bar) === null || _foo$bar === void 0
    ? void 0
    : _foo$bar.baz;
  foo === null || foo === void 0 ? void 0 : foo(foo);
  foo === null || foo === void 0 ? void 0 : foo.bar();
  (_foo$bar2 = foo.bar) === null || _foo$bar2 === void 0
    ? void 0
    : _foo$bar2.call(foo, foo.bar, false);
  foo === null || foo === void 0 || (_foo$bar3 = foo.bar) === null || _foo$bar3 === void 0
    ? void 0
    : _foo$bar3.call(foo, foo.bar, true);
  (_foo$bar4 = foo.bar) === null || _foo$bar4 === void 0 ? void 0 : _foo$bar4.baz(foo.bar, false);
  foo === null || foo === void 0 || (_foo$bar5 = foo.bar) === null || _foo$bar5 === void 0
    ? void 0
    : _foo$bar5.baz(foo.bar, true);
  (_foo$bar6 = foo.bar) === null ||
  _foo$bar6 === void 0 ||
  (_foo$bar6$baz = _foo$bar6.baz) === null ||
  _foo$bar6$baz === void 0
    ? void 0
    : _foo$bar6$baz.call(_foo$bar6, foo.bar, false);
  foo === null ||
  foo === void 0 ||
  (_foo$bar7 = foo.bar) === null ||
  _foo$bar7 === void 0 ||
  (_foo$bar7$baz = _foo$bar7.baz) === null ||
  _foo$bar7$baz === void 0
    ? void 0
    : _foo$bar7$baz.call(_foo$bar7, foo.bar, true);
}`,
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
        output: `function test(foo) {
  var _foo$bar,
    _foo$bar2,
    _foo$bar3,
    _foo$bar4,
    _foo$bar5,
    _foo$bar6,
    _foo$bar6$baz,
    _foo$bar7,
    _foo$bar7$baz;
  foo == null ? void 0 : foo.bar;
  foo == null || (_foo$bar = foo.bar) == null ? void 0 : _foo$bar.baz;
  foo == null ? void 0 : foo(foo);
  foo == null ? void 0 : foo.bar();
  (_foo$bar2 = foo.bar) == null ? void 0 : _foo$bar2.call(foo, foo.bar, false);
  foo == null || (_foo$bar3 = foo.bar) == null ? void 0 : _foo$bar3.call(foo, foo.bar, true);
  (_foo$bar4 = foo.bar) == null ? void 0 : _foo$bar4.baz(foo.bar, false);
  foo == null || (_foo$bar5 = foo.bar) == null ? void 0 : _foo$bar5.baz(foo.bar, true);
  (_foo$bar6 = foo.bar) == null || (_foo$bar6$baz = _foo$bar6.baz) == null
    ? void 0
    : _foo$bar6$baz.call(_foo$bar6, foo.bar, false);
  foo == null || (_foo$bar7 = foo.bar) == null || (_foo$bar7$baz = _foo$bar7.baz) == null
    ? void 0
    : _foo$bar7$baz.call(_foo$bar7, foo.bar, true);
}`,
      },
    ],
  },
  {
    title: 'general — parenthesized member call loose (exec)',
    source: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() { return this.x; };
  getSelf() { return this }

  test() {
    const Foo = this;
    const o = { Foo: Foo };
    const fn = function () {
      return o;
    };

    expect((Foo?.["m"])()).toEqual(1);
    expect((Foo?.["m"])().toString).toEqual(1..toString);
    expect((Foo?.["m"])().toString()).toEqual('1');

    expect((o?.Foo.m)()).toEqual(1);
    expect((o?.Foo.m)().toString).toEqual(1..toString);
    expect((o?.Foo.m)().toString()).toEqual('1');

    expect((((o.Foo?.self.getSelf)())?.m)()).toEqual(1);
    expect((((o.Foo.self?.getSelf)())?.m)()).toEqual(1);

    expect((((fn()?.Foo?.self.getSelf)())?.m)()).toEqual(1);
    expect((((fn?.().Foo.self?.getSelf)())?.m)()).toEqual(1);
  }

  testNull() {
    const o = null;

    expect(() => { (o?.Foo.m)() }).toThrow();
    expect(() => { (o?.Foo.m)().toString }).toThrow();
    expect(() => { (o?.Foo.m)().toString() }).toThrow();

    expect(() => { (((o.Foo?.self.getSelf)())?.m)() }).toThrow();
    expect(() => { (((o.Foo.self?.getSelf)())?.m)() }).toThrow();

    expect(() => (((fn()?.Foo?.self.getSelf)())?.m)()).toThrow();
    expect(() => (((fn?.().Foo.self?.getSelf)())?.m)()).toThrow();
  }
}

(new Foo).test();
(new Foo).testNull();
`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString).toEqual(
      (1).toString,
    );
    expect((Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual(
      '1',
    );
    expect((o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);
    expect(
      (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString,
    ).toEqual((1).toString);
    expect(
      (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString(),
    ).toEqual('1');
    expect(
      ((_ref = (
        (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0
          ? void 0
          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
      )()) === null || _ref === void 0
        ? void 0
        : (_ref2 = _ref).m.bind(_ref2))(),
    ).toEqual(1);
    expect(
      ((_ref3 = (
        (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0
          ? void 0
          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
      )()) === null || _ref3 === void 0
        ? void 0
        : (_ref4 = _ref3).m.bind(_ref4))(),
    ).toEqual(1);
    expect(
      ((_ref5 = (
        (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0
          ? void 0
          : (_fn$self = _fn.self).getSelf.bind(_fn$self)
      )()) === null || _ref5 === void 0
        ? void 0
        : (_ref6 = _ref5).m.bind(_ref6))(),
    ).toEqual(1);
    expect(
      ((_ref7 = (
        fn === null ||
          fn === void 0 ||
          (_fn$Foo$self = fn().Foo.self) === null ||
          _fn$Foo$self === void 0
          ? void 0
          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
      )()) === null || _ref7 === void 0
        ? void 0
        : (_ref8 = _ref7).m.bind(_ref8))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    expect(() => {
      var _o$Foo5;
      (o === null || o === void 0 ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o === null || o === void 0 ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo7;
      (o === null || o === void 0 ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;
      ((_ref9 = (
        (_o$Foo8 = o.Foo) === null || _o$Foo8 === void 0
          ? void 0
          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)
      )()) === null || _ref9 === void 0
        ? void 0
        : (_ref10 = _ref9).m.bind(_ref10))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;
      ((_ref11 = (
        (_o$Foo$self3 = o.Foo.self) === null || _o$Foo$self3 === void 0
          ? void 0
          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)
      )()) === null || _ref11 === void 0
        ? void 0
        : (_ref12 = _ref11).m.bind(_ref12))();
    }).toThrow();
    expect(() => {
      var _fn2, _fn2$self, _ref13, _ref14;
      return (
        (_ref13 = (
          (_fn2 = fn()) === null || _fn2 === void 0 || (_fn2 = _fn2.Foo) === null || _fn2 === void 0
            ? void 0
            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)
        )()) === null || _ref13 === void 0
          ? void 0
          : (_ref14 = _ref13).m.bind(_ref14)
      )();
    }).toThrow();
    expect(() => {
      var _fn3, _fn4, _ref15, _ref16;
      return (
        (_ref15 = (
          (_fn3 = fn) === null ||
            _fn3 === void 0 ||
            (_fn3 = _fn3().Foo.self) === null ||
            _fn3 === void 0
            ? void 0
            : (_fn4 = _fn3).getSelf.bind(_fn4)
        )()) === null || _ref15 === void 0
          ? void 0
          : (_ref16 = _ref15).m.bind(_ref16)
      )();
    }).toThrow();
  }
}
new Foo().test();
new Foo().testNull();`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))()).toEqual(1);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString).toEqual((1).toString);
    expect((Foo == null ? void 0 : Foo['m'].bind(Foo))().toString()).toEqual('1');
    expect((o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))()).toEqual(1);
    expect((o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString).toEqual(
      (1).toString,
    );
    expect((o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString()).toEqual('1');
    expect(
      ((_ref = (
        (_o$Foo4 = o.Foo) == null
          ? void 0
          : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
      )()) == null
        ? void 0
        : (_ref2 = _ref).m.bind(_ref2))(),
    ).toEqual(1);
    expect(
      ((_ref3 = (
        (_o$Foo$self = o.Foo.self) == null
          ? void 0
          : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
      )()) == null
        ? void 0
        : (_ref4 = _ref3).m.bind(_ref4))(),
    ).toEqual(1);
    expect(
      ((_ref5 = (
        (_fn = fn()) == null || (_fn = _fn.Foo) == null
          ? void 0
          : (_fn$self = _fn.self).getSelf.bind(_fn$self)
      )()) == null
        ? void 0
        : (_ref6 = _ref5).m.bind(_ref6))(),
    ).toEqual(1);
    expect(
      ((_ref7 = (
        fn == null || (_fn$Foo$self = fn().Foo.self) == null
          ? void 0
          : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
      )()) == null
        ? void 0
        : (_ref8 = _ref7).m.bind(_ref8))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    expect(() => {
      var _o$Foo5;
      (o == null ? void 0 : (_o$Foo5 = o.Foo).m.bind(_o$Foo5))();
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o == null ? void 0 : (_o$Foo6 = o.Foo).m.bind(_o$Foo6))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo7;
      (o == null ? void 0 : (_o$Foo7 = o.Foo).m.bind(_o$Foo7))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo8, _o$Foo8$self, _ref9, _ref10;
      ((_ref9 = (
        (_o$Foo8 = o.Foo) == null
          ? void 0
          : (_o$Foo8$self = _o$Foo8.self).getSelf.bind(_o$Foo8$self)
      )()) == null
        ? void 0
        : (_ref10 = _ref9).m.bind(_ref10))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self3, _o$Foo$self4, _ref11, _ref12;
      ((_ref11 = (
        (_o$Foo$self3 = o.Foo.self) == null
          ? void 0
          : (_o$Foo$self4 = _o$Foo$self3).getSelf.bind(_o$Foo$self4)
      )()) == null
        ? void 0
        : (_ref12 = _ref11).m.bind(_ref12))();
    }).toThrow();
    expect(() => {
      var _fn2, _fn2$self, _ref13, _ref14;
      return (
        (_ref13 = (
          (_fn2 = fn()) == null || (_fn2 = _fn2.Foo) == null
            ? void 0
            : (_fn2$self = _fn2.self).getSelf.bind(_fn2$self)
        )()) == null
          ? void 0
          : (_ref14 = _ref13).m.bind(_ref14)
      )();
    }).toThrow();
    expect(() => {
      var _fn3, _fn4, _ref15, _ref16;
      return (
        (_ref15 = (
          (_fn3 = fn) == null || (_fn3 = _fn3().Foo.self) == null
            ? void 0
            : (_fn4 = _fn3).getSelf.bind(_fn4)
        )()) == null
          ? void 0
          : (_ref16 = _ref15).m.bind(_ref16)
      )();
    }).toThrow();
  }
}
new Foo().test();
new Foo().testNull();`,
      },
    ],
  },
  {
    title: 'general — parenthesized member call loose (input)',
    source: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() { return this.x; };
  getSelf() { return this }

  test() {
    const Foo = this;
    const o = { Foo: Foo };
    const fn = function () {
      return o;
    };

    (Foo?.["m"])();
    (Foo?.["m"])().toString;
    (Foo?.["m"])().toString();

    (o?.Foo.m)();
    (o?.Foo.m)().toString;
    (o?.Foo.m)().toString();

    (((o.Foo?.self.getSelf)())?.m)();
    (((o.Foo.self?.getSelf)())?.m)();

    (((fn()?.Foo?.self.getSelf)())?.m)();
    (((fn?.().Foo.self?.getSelf)())?.m)();
  }
}

(new Foo).test();
`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))();
    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString;
    (Foo === null || Foo === void 0 ? void 0 : Foo['m'].bind(Foo))().toString();
    (o === null || o === void 0 ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))();
    (o === null || o === void 0 ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString;
    (o === null || o === void 0 ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString();
    ((_ref = (
      (_o$Foo4 = o.Foo) === null || _o$Foo4 === void 0
        ? void 0
        : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
    )()) === null || _ref === void 0
      ? void 0
      : (_ref2 = _ref).m.bind(_ref2))();
    ((_ref3 = (
      (_o$Foo$self = o.Foo.self) === null || _o$Foo$self === void 0
        ? void 0
        : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
    )()) === null || _ref3 === void 0
      ? void 0
      : (_ref4 = _ref3).m.bind(_ref4))();
    ((_ref5 = (
      (_fn = fn()) === null || _fn === void 0 || (_fn = _fn.Foo) === null || _fn === void 0
        ? void 0
        : (_fn$self = _fn.self).getSelf.bind(_fn$self)
    )()) === null || _ref5 === void 0
      ? void 0
      : (_ref6 = _ref5).m.bind(_ref6))();
    ((_ref7 = (
      fn === null ||
        fn === void 0 ||
        (_fn$Foo$self = fn().Foo.self) === null ||
        _fn$Foo$self === void 0
        ? void 0
        : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
    )()) === null || _ref7 === void 0
      ? void 0
      : (_ref8 = _ref7).m.bind(_ref8))();
  }
}
new Foo().test();`,
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
        output: `class Foo {
  constructor() {
    this.x = 1;
    this.self = this;
  }
  m() {
    return this.x;
  }
  getSelf() {
    return this;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo4,
      _o$Foo4$self,
      _ref,
      _ref2,
      _o$Foo$self,
      _o$Foo$self2,
      _ref3,
      _ref4,
      _fn,
      _fn$self,
      _ref5,
      _ref6,
      _fn$Foo$self,
      _fn$Foo$self2,
      _ref7,
      _ref8;
    const Foo = this;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    (Foo == null ? void 0 : Foo['m'].bind(Foo))();
    (Foo == null ? void 0 : Foo['m'].bind(Foo))().toString;
    (Foo == null ? void 0 : Foo['m'].bind(Foo))().toString();
    (o == null ? void 0 : (_o$Foo = o.Foo).m.bind(_o$Foo))();
    (o == null ? void 0 : (_o$Foo2 = o.Foo).m.bind(_o$Foo2))().toString;
    (o == null ? void 0 : (_o$Foo3 = o.Foo).m.bind(_o$Foo3))().toString();
    ((_ref = (
      (_o$Foo4 = o.Foo) == null ? void 0 : (_o$Foo4$self = _o$Foo4.self).getSelf.bind(_o$Foo4$self)
    )()) == null
      ? void 0
      : (_ref2 = _ref).m.bind(_ref2))();
    ((_ref3 = (
      (_o$Foo$self = o.Foo.self) == null
        ? void 0
        : (_o$Foo$self2 = _o$Foo$self).getSelf.bind(_o$Foo$self2)
    )()) == null
      ? void 0
      : (_ref4 = _ref3).m.bind(_ref4))();
    ((_ref5 = (
      (_fn = fn()) == null || (_fn = _fn.Foo) == null
        ? void 0
        : (_fn$self = _fn.self).getSelf.bind(_fn$self)
    )()) == null
      ? void 0
      : (_ref6 = _ref5).m.bind(_ref6))();
    ((_ref7 = (
      fn == null || (_fn$Foo$self = fn().Foo.self) == null
        ? void 0
        : (_fn$Foo$self2 = _fn$Foo$self).getSelf.bind(_fn$Foo$self2)
    )()) == null
      ? void 0
      : (_ref8 = _ref7).m.bind(_ref8))();
  }
}
new Foo().test();`,
      },
    ],
  },
  {
    title: 'general — unary (exec)',
    source: `"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = +obj?.a?.b;
expect(test).toBe(0);

test = +obj?.a.b;
expect(test).toBe(0);

test = +obj?.b?.b;
expect(test).toBe(NaN);

test = +obj?.b?.b;
expect(test).toBe(NaN);
`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$b2;
const obj = { a: { b: 0 } };
let test = +(obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
  ? void 0
  : _obj$a.b);
expect(test).toBe(0);
test = +(obj === null || obj === void 0 ? void 0 : obj.a.b);
expect(test).toBe(0);
test = +(obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
  ? void 0
  : _obj$b.b);
expect(test).toBe(NaN);
test = +(obj === null || obj === void 0 || (_obj$b2 = obj.b) === null || _obj$b2 === void 0
  ? void 0
  : _obj$b2.b);
expect(test).toBe(NaN);`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$b2;
const obj = { a: { b: 0 } };
let test = +(obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b);
expect(test).toBe(0);
test = +(obj == null ? void 0 : obj.a.b);
expect(test).toBe(0);
test = +(obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b);
expect(test).toBe(NaN);
test = +(obj == null || (_obj$b2 = obj.b) == null ? void 0 : _obj$b2.b);
expect(test).toBe(NaN);`,
      },
    ],
  },
  {
    title: 'general — unary (input)',
    source: `"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = +obj?.a?.b;

test = +obj?.a.b;

test = +obj?.b?.b;

test = +obj?.b?.b;
`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$b2;
const obj = { a: { b: 0 } };
let test = +(obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
  ? void 0
  : _obj$a.b);
test = +(obj === null || obj === void 0 ? void 0 : obj.a.b);
test = +(obj === null || obj === void 0 || (_obj$b = obj.b) === null || _obj$b === void 0
  ? void 0
  : _obj$b.b);
test = +(obj === null || obj === void 0 || (_obj$b2 = obj.b) === null || _obj$b2 === void 0
  ? void 0
  : _obj$b2.b);`,
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
        output: `'use strict';
var _obj$a, _obj$b, _obj$b2;
const obj = { a: { b: 0 } };
let test = +(obj == null || (_obj$a = obj.a) == null ? void 0 : _obj$a.b);
test = +(obj == null ? void 0 : obj.a.b);
test = +(obj == null || (_obj$b = obj.b) == null ? void 0 : _obj$b.b);
test = +(obj == null || (_obj$b2 = obj.b) == null ? void 0 : _obj$b2.b);`,
      },
    ],
  },
  {
    title: 'regression — 10959 transform optional chaining (input)',
    source: `a?.b!.c;
a?.b!.c.d;
a?.b.c!.d;
a!.b?.c;
a?.b!?.c;
a?.b!.c?.c;
(a?.b!).c;
(a?.b)!.c;
`,
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
        output: `var _a, _a2, _a3, _b, _a4, _a5, _a6, _a7;
(_a = a) === null || _a === void 0 ? void 0 : _a.b.c;
(_a2 = a) === null || _a2 === void 0 ? void 0 : _a2.b.c.d;
(_a3 = a) === null || _a3 === void 0 ? void 0 : _a3.b.c.d;
(_b = a.b) === null || _b === void 0 ? void 0 : _b.c;
(_a4 = a) === null || _a4 === void 0 || (_a4 = _a4.b) === null || _a4 === void 0 ? void 0 : _a4.c;
(_a5 = a) === null || _a5 === void 0 || (_a5 = _a5.b.c) === null || _a5 === void 0 ? void 0 : _a5.c;
((_a6 = a) === null || _a6 === void 0 ? void 0 : _a6.b).c;
((_a7 = a) === null || _a7 === void 0 ? void 0 : _a7.b).c;`,
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
        output: `var _a, _a2, _a3, _b, _a4, _a5, _a6, _a7;
(_a = a) == null ? void 0 : _a.b.c;
(_a2 = a) == null ? void 0 : _a2.b.c.d;
(_a3 = a) == null ? void 0 : _a3.b.c.d;
(_b = a.b) == null ? void 0 : _b.c;
(_a4 = a) == null || (_a4 = _a4.b) == null ? void 0 : _a4.c;
(_a5 = a) == null || (_a5 = _a5.b.c) == null ? void 0 : _a5.c;
((_a6 = a) == null ? void 0 : _a6.b).c;
((_a7 = a) == null ? void 0 : _a7.b).c;`,
      },
    ],
  },
  {
    title: 'regression — 15887 (exec)',
    source: `let a = (0, null?.prop);

expect(a).toBe(undefined);
`,
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
        output: `var _ref;
let a = (0, (_ref = null) === null || _ref === void 0 ? void 0 : _ref.prop);
expect(a).toBe(undefined);`,
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
        output: `var _ref;
let a = (0, (_ref = null) == null ? void 0 : _ref.prop);
expect(a).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'regression — 15887 (input)',
    source: `let a = (null?.prop1, null?.prop2);

expect(a).toBe(undefined);
`,
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
        output: `var _ref, _ref2;
let a =
  ((_ref = null) === null || _ref === void 0 ? void 0 : _ref.prop1,
  (_ref2 = null) === null || _ref2 === void 0 ? void 0 : _ref2.prop2);
expect(a).toBe(undefined);`,
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
        output: `var _ref, _ref2;
let a =
  ((_ref = null) == null ? void 0 : _ref.prop1, (_ref2 = null) == null ? void 0 : _ref2.prop2);
expect(a).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'regression — 16767 super method undefined optional call (exec)',
    source: `class SS {
  constructor(name){
    this.name = 'ss'+name;
  }
}

class AA extends SS {
  constructor(name){
    super(name);
    this.name = 'aa' +name;
}

aaGreet(s){
  super.greet?.(s + 'hhh');
}
}

const a = new AA('jack');

expect(() => a.aaGreet('d')).not.toThrow();
`,
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
        output: `class SS {
  constructor(name) {
    this.name = 'ss' + name;
  }
}
class AA extends SS {
  constructor(name) {
    super(name);
    this.name = 'aa' + name;
  }
  aaGreet(s) {
    var _super$greet;
    (_super$greet = super.greet) === null || _super$greet === void 0
      ? void 0
      : _super$greet.call(this, s + 'hhh');
  }
}
const a = new AA('jack');
expect(() => a.aaGreet('d')).not.toThrow();`,
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
        output: `class SS {
  constructor(name) {
    this.name = 'ss' + name;
  }
}
class AA extends SS {
  constructor(name) {
    super(name);
    this.name = 'aa' + name;
  }
  aaGreet(s) {
    var _super$greet;
    (_super$greet = super.greet) == null ? void 0 : _super$greet.call(this, s + 'hhh');
  }
}
const a = new AA('jack');
expect(() => a.aaGreet('d')).not.toThrow();`,
      },
    ],
  },
  {
    title: 'regression — 7642 (input)',
    source: `{
  const foo = 1;
}

{
  const foo = ({})?.foo;
}
`,
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
        output: `{
  const foo = 1;
}
{
  var _ref;
  const foo = (_ref = {}) === null || _ref === void 0 ? void 0 : _ref.foo;
}`,
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
        output: `{
  const foo = 1;
}
{
  var _ref;
  const foo = (_ref = {}) == null ? void 0 : _ref.foo;
}`,
      },
    ],
  },
  {
    title: 'regression — 8354 (exec)',
    source: `const foo = undefined;
const bar = 'bar';
const foobar = foo?.replace(\`foo\${bar}\`, '');

expect(foobar).toBe(undefined);`,
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
        output: `const foo = undefined;
const bar = 'bar';
const foobar = foo === null || foo === void 0 ? void 0 : foo.replace(\`foo\${bar}\`, '');
expect(foobar).toBe(undefined);`,
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
        output: `const foo = undefined;
const bar = 'bar';
const foobar = foo == null ? void 0 : foo.replace(\`foo\${bar}\`, '');
expect(foobar).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as call context in if (input)',
    source: `(a) => {
  if ((a.b as any)?.()) {}
}
`,
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
        output: `a => {
  var _a$b;
  if ((_a$b = a.b) === null || _a$b === void 0 ? void 0 : _a$b.call(a)) {
  }
};`,
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
        output: `a => {
  var _a$b;
  if ((_a$b = a.b) == null ? void 0 : _a$b.call(a)) {
  }
};`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as call context (input)',
    source: `(a.b as any)?.()
`,
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
        output: `var _a$b, _a;
(_a$b = (_a = a).b) === null || _a$b === void 0 ? void 0 : _a$b.call(_a);`,
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
        output: `var _a$b, _a;
(_a$b = (_a = a).b) == null ? void 0 : _a$b.call(_a);`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as function call loose (input)',
    source: `(((foo as A).bar) as B)?.(foo.bar, false)
`,
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
        output: `var _bar, _ref;
(_bar = (_ref = foo).bar) === null || _bar === void 0 ? void 0 : _bar.call(_ref, foo.bar, false);`,
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
        output: `var _bar, _ref;
(_bar = (_ref = foo).bar) == null ? void 0 : _bar.call(_ref, foo.bar, false);`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as in conditional (input)',
    source: `(a) => {
  (((a?.b as any) && a.c?.d) as any) ? 0 : 1
}
`,
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
        output: `a => {
  var _a$c;
  (a === null || a === void 0 ? void 0 : a.b) &&
  ((_a$c = a.c) === null || _a$c === void 0 ? void 0 : _a$c.d)
    ? 0
    : 1;
};`,
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
        output: `a => {
  var _a$c;
  (a == null ? void 0 : a.b) && ((_a$c = a.c) == null ? void 0 : _a$c.d) ? 0 : 1;
};`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts as member expression (input)',
    source: `(a?.b as ExampleType)?.c as ExampleType2
`,
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
        output: `var _a;
(_a = a) === null || _a === void 0 || (_a = _a.b) === null || _a === void 0 ? void 0 : _a.c;`,
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
        output: `var _a;
(_a = a) == null || (_a = _a.b) == null ? void 0 : _a.c;`,
      },
    ],
  },
  {
    title: 'transparent expr wrappers — ts parenthesized expression member call (input)',
    source: `((o?.Foo.m) as ExampleType)()
`,
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
        output: `var _o, _o$Foo;
((_o = o) === null || _o === void 0 ? void 0 : (_o$Foo = _o.Foo).m.bind(_o$Foo))();`,
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
        output: `var _o, _o$Foo;
((_o = o) == null ? void 0 : (_o$Foo = _o.Foo).m.bind(_o$Foo))();`,
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
