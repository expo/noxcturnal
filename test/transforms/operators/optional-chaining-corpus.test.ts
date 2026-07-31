// Generated from apps/test-suite/tests/JSOptionalChaining.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

test('001 JS Optional Chaining > member access (?.) > accesses property on object', async () => {
  const source = '() => {\n        const obj = { a: 1 };\n        expect(obj?.a).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { a: 1 };
      expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(1);
    };"
  `);
});

test('002 JS Optional Chaining > member access (?.) > returns undefined for null base', async () => {
  const source =
    '() => {\n        const obj = null;\n        expect(obj?.a).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);
    };"
  `);
});

test('003 JS Optional Chaining > member access (?.) > returns undefined for undefined base', async () => {
  const source =
    '() => {\n        const obj = undefined;\n        expect(obj?.a).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = undefined;
      expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);
    };"
  `);
});

test('004 JS Optional Chaining > member access (?.) > accesses nested property', async () => {
  const source =
    '() => {\n        const obj = { a: { b: { c: 42 } } };\n        expect(obj?.a?.b?.c).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: { b: { c: 42 } } };
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$a = obj.a) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.b) === null ||
          _obj$a === void 0
          ? void 0
          : _obj$a.c,
      ).toBe(42);
    };"
  `);
});

test('005 JS Optional Chaining > member access (?.) > short-circuits at first null', async () => {
  const source =
    '() => {\n        const obj = { a: null };\n        expect(obj?.a?.b?.c).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: null };
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$a = obj.a) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.b) === null ||
          _obj$a === void 0
          ? void 0
          : _obj$a.c,
      ).toBe(undefined);
    };"
  `);
});

test('006 JS Optional Chaining > member access (?.) > short-circuits at first undefined property', async () => {
  const source =
    '() => {\n        const obj = { a: {} };\n        expect(obj?.a?.b?.c).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: {} };
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$a = obj.a) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.b) === null ||
          _obj$a === void 0
          ? void 0
          : _obj$a.c,
      ).toBe(undefined);
    };"
  `);
});

test('007 JS Optional Chaining > member access (?.) > property exists but is falsy', async () => {
  const source =
    '() => {\n        const obj = { val: 0 };\n        expect(obj?.val).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { val: 0 };
      expect(obj === null || obj === void 0 ? void 0 : obj.val).toBe(0);
    };"
  `);
});

test('008 JS Optional Chaining > member access (?.) > preserves all falsy non-nullish values', async () => {
  const source =
    "() => {\n        expect({ v: 0 }?.v).toBe(0);\n        expect({ v: '' }?.v).toBe('');\n        expect({ v: false }?.v).toBe(false);\n        expect({ v: NaN }?.v).not.toBe(NaN); // NaN !== NaN\n        expect(typeof { v: NaN }?.v).toBe('number');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _v, _v2, _v3, _v4, _v5;
      expect((_v = { v: 0 }) === null || _v === void 0 ? void 0 : _v.v).toBe(0);
      expect((_v2 = { v: '' }) === null || _v2 === void 0 ? void 0 : _v2.v).toBe('');
      expect((_v3 = { v: false }) === null || _v3 === void 0 ? void 0 : _v3.v).toBe(false);
      expect((_v4 = { v: NaN }) === null || _v4 === void 0 ? void 0 : _v4.v).not.toBe(NaN);
      expect(typeof ((_v5 = { v: NaN }) === null || _v5 === void 0 ? void 0 : _v5.v)).toBe('number');
    };"
  `);
});

test('009 JS Optional Chaining > member access (?.) > works on non-plain objects', async () => {
  const source =
    "() => {\n        expect('hello'?.length).toBe(5);\n        expect([1, 2, 3]?.length).toBe(3);\n        expect((42)?.toFixed(2)).toBe('42.00');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _hello, _ref, _;
      expect((_hello = 'hello') === null || _hello === void 0 ? void 0 : _hello.length).toBe(5);
      expect((_ref = [1, 2, 3]) === null || _ref === void 0 ? void 0 : _ref.length).toBe(3);
      expect((_ = 42) === null || _ === void 0 ? void 0 : _.toFixed(2)).toBe('42.00');
    };"
  `);
});

test('010 JS Optional Chaining > computed member access (?.[]) > accesses computed property', async () => {
  const source =
    "() => {\n        const obj = { foo: 'bar' };\n        const key = 'foo';\n        expect(obj?.[key]).toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { foo: 'bar' };
      const key = 'foo';
      expect(obj === null || obj === void 0 ? void 0 : obj[key]).toBe('bar');
    };"
  `);
});

test('011 JS Optional Chaining > computed member access (?.[]) > returns undefined for null base', async () => {
  const source =
    "() => {\n        const obj = null;\n        expect(obj?.['foo']).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);
    };"
  `);
});

test('012 JS Optional Chaining > computed member access (?.[]) > returns undefined for undefined base', async () => {
  const source =
    "() => {\n        const obj = undefined;\n        expect(obj?.['foo']).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = undefined;
      expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);
    };"
  `);
});

test('013 JS Optional Chaining > computed member access (?.[]) > accesses array element', async () => {
  const source =
    '() => {\n        const arr = [10, 20, 30];\n        expect(arr?.[1]).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const arr = [10, 20, 30];
      expect(arr === null || arr === void 0 ? void 0 : arr[1]).toBe(20);
    };"
  `);
});

test('014 JS Optional Chaining > computed member access (?.[]) > returns undefined for null array', async () => {
  const source =
    '() => {\n        const arr = null;\n        expect(arr?.[0]).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const arr = null;
      expect(arr === null || arr === void 0 ? void 0 : arr[0]).toBe(undefined);
    };"
  `);
});

test('015 JS Optional Chaining > computed member access (?.[]) > accesses with symbol key', async () => {
  const source =
    "() => {\n        const sym = Symbol('key');\n        const obj = { [sym]: 'value' };\n        expect(obj?.[sym]).toBe('value');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const sym = Symbol('key');
      const obj = { [sym]: 'value' };
      expect(obj === null || obj === void 0 ? void 0 : obj[sym]).toBe('value');
    };"
  `);
});

test('016 JS Optional Chaining > computed member access (?.[]) > computed key expression is not evaluated when base is nullish', async () => {
  const source =
    "() => {\n        let evaluated = false;\n        const key = () => {\n          evaluated = true;\n          return 'foo';\n        };\n        const obj = null;\n        obj?.[key()];\n        expect(evaluated).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let evaluated = false;
      const key = () => {
        evaluated = true;
        return 'foo';
      };
      const obj = null;
      obj === null || obj === void 0 ? void 0 : obj[key()];
      expect(evaluated).toBe(false);
    };"
  `);
});

test('017 JS Optional Chaining > computed member access (?.[]) > computed key expression evaluated once when base is non-nullish', async () => {
  const source =
    "() => {\n        let count = 0;\n        const key = () => {\n          count++;\n          return 'foo';\n        };\n        const obj = { foo: 'bar' };\n        expect(obj?.[key()]).toBe('bar');\n        expect(count).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let count = 0;
      const key = () => {
        count++;
        return 'foo';
      };
      const obj = { foo: 'bar' };
      expect(obj === null || obj === void 0 ? void 0 : obj[key()]).toBe('bar');
      expect(count).toBe(1);
    };"
  `);
});

test('018 JS Optional Chaining > optional call (?.()) > calls function', async () => {
  const source = '() => {\n        const fn = () => 42;\n        expect(fn?.()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = () => 42;
      expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(42);
    };"
  `);
});

test('019 JS Optional Chaining > optional call (?.()) > returns undefined for null function', async () => {
  const source =
    '() => {\n        const fn = null;\n        expect(fn?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = null;
      expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);
    };"
  `);
});

test('020 JS Optional Chaining > optional call (?.()) > returns undefined for undefined function', async () => {
  const source =
    '() => {\n        const fn = undefined;\n        expect(fn?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = undefined;
      expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);
    };"
  `);
});

test('021 JS Optional Chaining > optional call (?.()) > passes arguments', async () => {
  const source =
    '() => {\n        const fn = (a, b) => a + b;\n        expect(fn?.(2, 3)).toBe(5);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = (a, b) => a + b;
      expect(fn === null || fn === void 0 ? void 0 : fn(2, 3)).toBe(5);
    };"
  `);
});

test('022 JS Optional Chaining > optional call (?.()) > arguments not evaluated when function is nullish', async () => {
  const source =
    '() => {\n        let evaluated = false;\n        const fn = null;\n        fn?.((evaluated = true));\n        expect(evaluated).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let evaluated = false;
      const fn = null;
      fn === null || fn === void 0 ? void 0 : fn((evaluated = true));
      expect(evaluated).toBe(false);
    };"
  `);
});

test('023 JS Optional Chaining > optional call (?.()) > works with function stored in variable', async () => {
  const source =
    '() => {\n        const obj = { fn: (x) => x * 2 };\n        expect(obj.fn?.(5)).toBe(10);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$fn;
      const obj = { fn: x => x * 2 };
      expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj, 5)).toBe(
        10,
      );
    };"
  `);
});

test('024 JS Optional Chaining > optional call (?.()) > returns undefined for missing method', async () => {
  const source =
    '() => {\n        const obj = {};\n        expect(obj.fn?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$fn;
      const obj = {};
      expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj)).toBe(
        undefined,
      );
    };"
  `);
});

test('025 JS Optional Chaining > method calls (?.method()) > calls method on object', async () => {
  const source =
    "() => {\n        const obj = {\n          greet() {\n            return 'hello';\n          },\n        };\n        expect(obj?.greet()).toBe('hello');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = {
        greet() {
          return 'hello';
        },
      };
      expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe('hello');
    };"
  `);
});

test('026 JS Optional Chaining > method calls (?.method()) > preserves this context', async () => {
  const source =
    "() => {\n        const obj = {\n          name: 'test',\n          getName() {\n            return this.name;\n          },\n        };\n        expect(obj?.getName()).toBe('test');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = {
        name: 'test',
        getName() {
          return this.name;
        },
      };
      expect(obj === null || obj === void 0 ? void 0 : obj.getName()).toBe('test');
    };"
  `);
});

test('027 JS Optional Chaining > method calls (?.method()) > returns undefined when object is null', async () => {
  const source =
    '() => {\n        const obj = null;\n        expect(obj?.greet()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe(undefined);
    };"
  `);
});

test('028 JS Optional Chaining > method calls (?.method()) > returns undefined when method is undefined', async () => {
  const source =
    '() => {\n        const obj = {};\n        expect(obj?.greet?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$greet;
      const obj = {};
      expect(
        obj === null || obj === void 0 || (_obj$greet = obj.greet) === null || _obj$greet === void 0
          ? void 0
          : _obj$greet.call(obj),
      ).toBe(undefined);
    };"
  `);
});

test('029 JS Optional Chaining > method calls (?.method()) > chained method calls', async () => {
  const source =
    '() => {\n        const obj = {\n          inner: {\n            getValue() {\n              return 42;\n            },\n          },\n        };\n        expect(obj?.inner?.getValue()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$inner;
      const obj = {
        inner: {
          getValue() {
            return 42;
          },
        },
      };
      expect(
        obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0
          ? void 0
          : _obj$inner.getValue(),
      ).toBe(42);
    };"
  `);
});

test('030 JS Optional Chaining > method calls (?.method()) > method on prototype chain', async () => {
  const source =
    "() => {\n        class Base {\n          hello() {\n            return 'base';\n          }\n        }\n        class Child extends Base {}\n        const c = new Child();\n        expect(c?.hello()).toBe('base');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Base {
        hello() {
          return 'base';
        }
      }
      class Child extends Base {}
      const c = new Child();
      expect(c === null || c === void 0 ? void 0 : c.hello()).toBe('base');
    };"
  `);
});

test('031 JS Optional Chaining > method calls (?.method()) > this context preserved in nested access', async () => {
  const source =
    '() => {\n        const obj = {\n          x: 10,\n          inner: {\n            x: 20,\n            getX() {\n              return this.x;\n            },\n          },\n        };\n        expect(obj?.inner?.getX()).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$inner;
      const obj = {
        x: 10,
        inner: {
          x: 20,
          getX() {
            return this.x;
          },
        },
      };
      expect(
        obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0
          ? void 0
          : _obj$inner.getX(),
      ).toBe(20);
    };"
  `);
});

test('032 JS Optional Chaining > short-circuit evaluation > does not access further properties after null', async () => {
  const source =
    '() => {\n        let accessed = false;\n        const handler = {\n          get() {\n            accessed = true;\n            return {};\n          },\n        };\n        const obj = null;\n        obj?.foo;\n        expect(accessed).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let accessed = false;
      const handler = {
        get() {
          accessed = true;
          return {};
        },
      };
      const obj = null;
      obj === null || obj === void 0 ? void 0 : obj.foo;
      expect(accessed).toBe(false);
    };"
  `);
});

test('033 JS Optional Chaining > short-circuit evaluation > does not call methods after null', async () => {
  const source =
    '() => {\n        let called = false;\n        const obj = null;\n        obj?.method?.((called = true));\n        expect(called).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$method;
      let called = false;
      const obj = null;
      obj === null || obj === void 0 || (_obj$method = obj.method) === null || _obj$method === void 0
        ? void 0
        : _obj$method.call(obj, (called = true));
      expect(called).toBe(false);
    };"
  `);
});

test('034 JS Optional Chaining > short-circuit evaluation > entire chain short-circuits', async () => {
  const source =
    '() => {\n        let sideEffect = false;\n        const obj = null;\n        obj?.a.b.c.d.e?.f?.(() => {\n          sideEffect = true;\n        });\n        expect(sideEffect).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a$b$c$d$e, _obj$a$b$c$d$e$f;
      let sideEffect = false;
      const obj = null;
      obj === null ||
      obj === void 0 ||
      (_obj$a$b$c$d$e = obj.a.b.c.d.e) === null ||
      _obj$a$b$c$d$e === void 0 ||
      (_obj$a$b$c$d$e$f = _obj$a$b$c$d$e.f) === null ||
      _obj$a$b$c$d$e$f === void 0
        ? void 0
        : _obj$a$b$c$d$e$f.call(_obj$a$b$c$d$e, () => {
            sideEffect = true;
          });
      expect(sideEffect).toBe(false);
    };"
  `);
});

test('035 JS Optional Chaining > short-circuit evaluation > short-circuits computed access after null', async () => {
  const source =
    "() => {\n        let keyEvaluated = false;\n        const obj = null;\n        obj?.[\n          (() => {\n            keyEvaluated = true;\n            return 'key';\n          })()\n        ];\n        expect(keyEvaluated).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let keyEvaluated = false;
      const obj = null;
      obj === null || obj === void 0
        ? void 0
        : obj[
            (() => {
              keyEvaluated = true;
              return 'key';
            })()
          ];
      expect(keyEvaluated).toBe(false);
    };"
  `);
});

test('036 JS Optional Chaining > short-circuit evaluation > side effects in base are evaluated once', async () => {
  const source =
    '() => {\n        let count = 0;\n        const getObj = () => {\n          count++;\n          return { a: 1 };\n        };\n        expect(getObj()?.a).toBe(1);\n        expect(count).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _getObj;
      let count = 0;
      const getObj = () => {
        count++;
        return { a: 1 };
      };
      expect((_getObj = getObj()) === null || _getObj === void 0 ? void 0 : _getObj.a).toBe(1);
      expect(count).toBe(1);
    };"
  `);
});

test('037 JS Optional Chaining > short-circuit evaluation > non-optional part after ?. still evaluates if base is present', async () => {
  const source =
    '() => {\n        let count = 0;\n        const obj = {\n          get a() {\n            count++;\n            return { b: 42 };\n          },\n        };\n        expect(obj?.a.b).toBe(42);\n        expect(count).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let count = 0;
      const obj = {
        get a() {
          count++;
          return { b: 42 };
        },
      };
      expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);
      expect(count).toBe(1);
    };"
  `);
});

test('038 JS Optional Chaining > delete with optional chaining > deletes existing property', async () => {
  const source =
    '() => {\n        const obj = { a: 1 };\n        expect(delete obj?.a).toBe(true);\n        expect(obj.a).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { a: 1 };
      expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
      expect(obj.a).toBe(undefined);
    };"
  `);
});

test('039 [upstream xit] JS Optional Chaining > delete with optional chaining > returns true for null base', async () => {
  const source =
    '() => {\n        const obj = null;\n        expect(delete obj?.a).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
    };"
  `);
});

test('040 [upstream xit] JS Optional Chaining > delete with optional chaining > returns true for undefined base', async () => {
  const source =
    '() => {\n        const obj = undefined;\n        expect(delete obj?.a).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = undefined;
      expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
    };"
  `);
});

test('041 JS Optional Chaining > delete with optional chaining > deletes nested property', async () => {
  const source =
    '() => {\n        const obj = { a: { b: 1 } };\n        expect(delete obj?.a?.b).toBe(true);\n        expect(obj.a.b).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: { b: 1 } };
      expect(
        obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
          ? true
          : delete _obj$a.b,
      ).toBe(true);
      expect(obj.a.b).toBe(undefined);
    };"
  `);
});

test('042 [upstream xit] JS Optional Chaining > delete with optional chaining > returns true for null in nested delete', async () => {
  const source =
    '() => {\n        const obj = { a: null };\n        expect(delete obj?.a?.b).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: null };
      expect(
        obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
          ? true
          : delete _obj$a.b,
      ).toBe(true);
    };"
  `);
});

test('043 JS Optional Chaining > delete with optional chaining > deletes computed property', async () => {
  const source =
    "() => {\n        const obj = { foo: 'bar' };\n        const key = 'foo';\n        expect(delete obj?.[key]).toBe(true);\n        expect(obj.foo).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { foo: 'bar' };
      const key = 'foo';
      expect(obj === null || obj === void 0 ? true : delete obj[key]).toBe(true);
      expect(obj.foo).toBe(undefined);
    };"
  `);
});

test('044 JS Optional Chaining > in boolean context > if statement with optional chaining', async () => {
  const source =
    "() => {\n        const obj = null;\n        let branch = 'none';\n        if (obj?.truthy) {\n          branch = 'if';\n        } else {\n          branch = 'else';\n        }\n        expect(branch).toBe('else');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      let branch = 'none';
      if (obj === null || obj === void 0 ? void 0 : obj.truthy) {
        branch = 'if';
      } else {
        branch = 'else';
      }
      expect(branch).toBe('else');
    };"
  `);
});

test('045 JS Optional Chaining > in boolean context > if with non-null object and truthy value', async () => {
  const source =
    "() => {\n        const obj = { flag: true };\n        let branch = 'none';\n        if (obj?.flag) {\n          branch = 'if';\n        }\n        expect(branch).toBe('if');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { flag: true };
      let branch = 'none';
      if (obj === null || obj === void 0 ? void 0 : obj.flag) {
        branch = 'if';
      }
      expect(branch).toBe('if');
    };"
  `);
});

test('046 JS Optional Chaining > in boolean context > if with non-null object and falsy value', async () => {
  const source =
    "() => {\n        const obj = { flag: 0 };\n        let branch = 'none';\n        if (obj?.flag) {\n          branch = 'if';\n        } else {\n          branch = 'else';\n        }\n        expect(branch).toBe('else');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { flag: 0 };
      let branch = 'none';
      if (obj === null || obj === void 0 ? void 0 : obj.flag) {
        branch = 'if';
      } else {
        branch = 'else';
      }
      expect(branch).toBe('else');
    };"
  `);
});

test('047 JS Optional Chaining > in boolean context > logical NOT with optional chaining', async () => {
  const source =
    '() => {\n        const obj = null;\n        expect(!obj?.foo).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(true);
    };"
  `);
});

test('048 JS Optional Chaining > in boolean context > logical NOT with existing value', async () => {
  const source =
    "() => {\n        const obj = { foo: 'bar' };\n        expect(!obj?.foo).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { foo: 'bar' };
      expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(false);
    };"
  `);
});

test('049 JS Optional Chaining > in boolean context > double NOT coerces to boolean', async () => {
  const source =
    '() => {\n        expect(!!null?.foo).toBe(false);\n        expect(!!{ foo: 1 }?.foo).toBe(true);\n        expect(!!{ foo: 0 }?.foo).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _foo, _foo2;
      expect(!!((_ref = null) === null || _ref === void 0 ? void 0 : _ref.foo)).toBe(false);
      expect(!!((_foo = { foo: 1 }) === null || _foo === void 0 ? void 0 : _foo.foo)).toBe(true);
      expect(!!((_foo2 = { foo: 0 }) === null || _foo2 === void 0 ? void 0 : _foo2.foo)).toBe(false);
    };"
  `);
});

test('050 JS Optional Chaining > in boolean context > ternary with optional chaining', async () => {
  const source =
    "() => {\n        const obj = null;\n        expect(obj?.val ? 'yes' : 'no').toBe('no');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect((obj === null || obj === void 0 ? void 0 : obj.val) ? 'yes' : 'no').toBe('no');
    };"
  `);
});

test('051 JS Optional Chaining > in boolean context > while loop with optional chaining', async () => {
  const source =
    '() => {\n        const items = [{ next: { next: { next: null } } }];\n        let node = items[0];\n        let count = 0;\n        while (node?.next) {\n          node = node.next;\n          count++;\n        }\n        expect(count).toBe(2);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const items = [{ next: { next: { next: null } } }];
      let node = items[0];
      let count = 0;
      while (node === null || node === void 0 ? void 0 : node.next) {
        node = node.next;
        count++;
      }
      expect(count).toBe(2);
    };"
  `);
});

test('052 JS Optional Chaining > with logical operators > ?. with && operator', async () => {
  const source =
    "() => {\n        const obj = null;\n        expect(obj?.a && 'yes').toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect((obj === null || obj === void 0 ? void 0 : obj.a) && 'yes').toBe(undefined);
    };"
  `);
});

test('053 JS Optional Chaining > with logical operators > ?. with || operator', async () => {
  const source =
    "() => {\n        const obj = null;\n        expect(obj?.a || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');
    };"
  `);
});

test('054 JS Optional Chaining > with logical operators > ?. with ?? operator', async () => {
  const source =
    "() => {\n        const obj = null;\n        expect(obj?.a ?? 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe('fallback');
    };"
  `);
});

test('055 JS Optional Chaining > with logical operators > ?. returning falsy with ??', async () => {
  const source =
    "() => {\n        const obj = { a: 0 };\n        expect(obj?.a ?? 'fallback').toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { a: 0 };
      expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe(0);
    };"
  `);
});

test('056 JS Optional Chaining > with logical operators > ?. returning falsy with ||', async () => {
  const source =
    "() => {\n        const obj = { a: 0 };\n        expect(obj?.a || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { a: 0 };
      expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');
    };"
  `);
});

test('057 JS Optional Chaining > with logical operators > chained logical with multiple ?.', async () => {
  const source =
    '() => {\n        const a = { x: 1 };\n        const b = null;\n        expect(a?.x && b?.y).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const a = { x: 1 };
      const b = null;
      expect(
        (a === null || a === void 0 ? void 0 : a.x) && (b === null || b === void 0 ? void 0 : b.y),
      ).toBe(undefined);
    };"
  `);
});

test('058 JS Optional Chaining > mixed chains > optional then regular access', async () => {
  const source =
    '() => {\n        const obj = { a: { b: 42 } };\n        expect(obj?.a.b).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { a: { b: 42 } };
      expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);
    };"
  `);
});

test('059 JS Optional Chaining > mixed chains > optional then regular access on null short-circuits all', async () => {
  const source =
    '() => {\n        const obj = null;\n        // The entire chain short-circuits — .b is not attempted\n        expect(obj?.a.b).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      // The entire chain short-circuits — .b is not attempted
      expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(undefined);
    };"
  `);
});

test('060 JS Optional Chaining > mixed chains > regular then optional access', async () => {
  const source =
    '() => {\n        const obj = { a: null };\n        expect(obj.a?.b).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = { a: null };
      expect((_obj$a = obj.a) === null || _obj$a === void 0 ? void 0 : _obj$a.b).toBe(undefined);
    };"
  `);
});

test('061 JS Optional Chaining > mixed chains > mixed optional and regular deep chain', async () => {
  const source =
    "() => {\n        const obj = { a: { b: { c: { d: 'deep' } } } };\n        expect(obj?.a.b?.c.d).toBe('deep');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a$b;
      const obj = { a: { b: { c: { d: 'deep' } } } };
      expect(
        obj === null || obj === void 0 || (_obj$a$b = obj.a.b) === null || _obj$a$b === void 0
          ? void 0
          : _obj$a$b.c.d,
      ).toBe('deep');
    };"
  `);
});

test('062 JS Optional Chaining > mixed chains > optional member then optional call', async () => {
  const source =
    '() => {\n        const obj = { fn: () => 42 };\n        expect(obj?.fn?.()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$fn;
      const obj = { fn: () => 42 };
      expect(
        obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0
          ? void 0
          : _obj$fn.call(obj),
      ).toBe(42);
    };"
  `);
});

test('063 JS Optional Chaining > mixed chains > optional member with missing function', async () => {
  const source =
    '() => {\n        const obj = {};\n        expect(obj?.fn?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$fn;
      const obj = {};
      expect(
        obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0
          ? void 0
          : _obj$fn.call(obj),
      ).toBe(undefined);
    };"
  `);
});

test('064 JS Optional Chaining > mixed chains > optional computed then optional member', async () => {
  const source =
    "() => {\n        const obj = { items: [{ name: 'first' }] };\n        expect(obj?.items?.[0]?.name).toBe('first');\n        expect(obj?.items?.[99]?.name).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$items, _obj$items2;
      const obj = { items: [{ name: 'first' }] };
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$items = obj.items) === null ||
          _obj$items === void 0 ||
          (_obj$items = _obj$items[0]) === null ||
          _obj$items === void 0
          ? void 0
          : _obj$items.name,
      ).toBe('first');
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$items2 = obj.items) === null ||
          _obj$items2 === void 0 ||
          (_obj$items2 = _obj$items2[99]) === null ||
          _obj$items2 === void 0
          ? void 0
          : _obj$items2.name,
      ).toBe(undefined);
    };"
  `);
});

test('065 JS Optional Chaining > with classes > optional access on class instance', async () => {
  const source =
    "() => {\n        class User {\n          constructor(name) {\n            this.name = name;\n          }\n          greet() {\n            return 'Hi, ' + this.name;\n          }\n        }\n        const user = new User('Alice');\n        expect(user?.name).toBe('Alice');\n        expect(user?.greet()).toBe('Hi, Alice');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class User {
        constructor(name) {
          this.name = name;
        }
        greet() {
          return 'Hi, ' + this.name;
        }
      }
      const user = new User('Alice');
      expect(user === null || user === void 0 ? void 0 : user.name).toBe('Alice');
      expect(user === null || user === void 0 ? void 0 : user.greet()).toBe('Hi, Alice');
    };"
  `);
});

test('066 JS Optional Chaining > with classes > optional access on null instance', async () => {
  const source =
    '() => {\n        const user = null;\n        expect(user?.name).toBe(undefined);\n        expect(user?.greet?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _user$greet;
      const user = null;
      expect(user === null || user === void 0 ? void 0 : user.name).toBe(undefined);
      expect(
        user === null ||
          user === void 0 ||
          (_user$greet = user.greet) === null ||
          _user$greet === void 0
          ? void 0
          : _user$greet.call(user),
      ).toBe(undefined);
    };"
  `);
});

test('067 JS Optional Chaining > with classes > optional access on inherited method', async () => {
  const source =
    "() => {\n        class Animal {\n          speak() {\n            return 'generic';\n          }\n        }\n        class Dog extends Animal {\n          speak() {\n            return 'woof';\n          }\n        }\n        const d = new Dog();\n        expect(d?.speak()).toBe('woof');\n        const n = null;\n        expect(n?.speak?.()).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _n$speak;
      class Animal {
        speak() {
          return 'generic';
        }
      }
      class Dog extends Animal {
        speak() {
          return 'woof';
        }
      }
      const d = new Dog();
      expect(d === null || d === void 0 ? void 0 : d.speak()).toBe('woof');
      const n = null;
      expect(
        n === null || n === void 0 || (_n$speak = n.speak) === null || _n$speak === void 0
          ? void 0
          : _n$speak.call(n),
      ).toBe(undefined);
    };"
  `);
});

test('068 JS Optional Chaining > with classes > optional access on static method', async () => {
  const source =
    "() => {\n        class Utils {\n          static parse(s) {\n            return parseInt(s, 10);\n          }\n        }\n        expect(Utils?.parse('42')).toBe(42);\n        const Cls = null;\n        expect(Cls?.parse?.('42')).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _Cls$parse;
      class Utils {
        static parse(s) {
          return parseInt(s, 10);
        }
      }
      expect(Utils === null || Utils === void 0 ? void 0 : Utils.parse('42')).toBe(42);
      const Cls = null;
      expect(
        Cls === null || Cls === void 0 || (_Cls$parse = Cls.parse) === null || _Cls$parse === void 0
          ? void 0
          : _Cls$parse.call(Cls, '42'),
      ).toBe(undefined);
    };"
  `);
});

test('069 JS Optional Chaining > with classes > optional access on getter', async () => {
  const source =
    '() => {\n        class Box {\n          #val;\n          constructor(v) {\n            this.#val = v;\n          }\n          get value() {\n            return this.#val;\n          }\n        }\n        const box = new Box(42);\n        expect(box?.value).toBe(42);\n        const empty = null;\n        expect(empty?.value).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Box {
        #val;
        constructor(v) {
          this.#val = v;
        }
        get value() {
          return this.#val;
        }
      }
      const box = new Box(42);
      expect(box === null || box === void 0 ? void 0 : box.value).toBe(42);
      const empty = null;
      expect(empty === null || empty === void 0 ? void 0 : empty.value).toBe(undefined);
    };"
  `);
});

test('070 JS Optional Chaining > with various types as base > number base', async () => {
  const source =
    "() => {\n        const n = 42;\n        expect(n?.toFixed(2)).toBe('42.00');\n        expect(n?.toString()).toBe('42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const n = 42;
      expect(n === null || n === void 0 ? void 0 : n.toFixed(2)).toBe('42.00');
      expect(n === null || n === void 0 ? void 0 : n.toString()).toBe('42');
    };"
  `);
});

test('071 JS Optional Chaining > with various types as base > string base', async () => {
  const source =
    "() => {\n        const s = 'hello';\n        expect(s?.length).toBe(5);\n        expect(s?.toUpperCase()).toBe('HELLO');\n        expect(s?.[0]).toBe('h');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const s = 'hello';
      expect(s === null || s === void 0 ? void 0 : s.length).toBe(5);
      expect(s === null || s === void 0 ? void 0 : s.toUpperCase()).toBe('HELLO');
      expect(s === null || s === void 0 ? void 0 : s[0]).toBe('h');
    };"
  `);
});

test('072 JS Optional Chaining > with various types as base > boolean base', async () => {
  const source =
    "() => {\n        const b = true;\n        expect(b?.toString()).toBe('true');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const b = true;
      expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('true');
    };"
  `);
});

test('073 JS Optional Chaining > with various types as base > symbol base', async () => {
  const source =
    "() => {\n        const s = Symbol('test');\n        expect(s?.toString()).toBe('Symbol(test)');\n        expect(s?.description).toBe('test');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const s = Symbol('test');
      expect(s === null || s === void 0 ? void 0 : s.toString()).toBe('Symbol(test)');
      expect(s === null || s === void 0 ? void 0 : s.description).toBe('test');
    };"
  `);
});

test('074 JS Optional Chaining > with various types as base > bigint base', async () => {
  const source =
    "() => {\n        const b = BigInt(42);\n        expect(b?.toString()).toBe('42');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const b = BigInt(42);
      expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('42');
    };"
  `);
});

test('075 JS Optional Chaining > with various types as base > array base', async () => {
  const source =
    '() => {\n        const arr = [1, 2, 3];\n        expect(arr?.length).toBe(3);\n        expect(arr?.map((x) => x * 2)).toEqual([2, 4, 6]);\n        expect(arr?.[2]).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const arr = [1, 2, 3];
      expect(arr === null || arr === void 0 ? void 0 : arr.length).toBe(3);
      expect(arr === null || arr === void 0 ? void 0 : arr.map(x => x * 2)).toEqual([2, 4, 6]);
      expect(arr === null || arr === void 0 ? void 0 : arr[2]).toBe(3);
    };"
  `);
});

test('076 JS Optional Chaining > with various types as base > function base', async () => {
  const source =
    "() => {\n        const fn = (x) => x * 2;\n        expect(fn?.name).toBe('fn');\n        expect(fn?.length).toBe(1);\n        expect(fn?.(5)).toBe(10);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = x => x * 2;
      expect(fn === null || fn === void 0 ? void 0 : fn.name).toBe('fn');
      expect(fn === null || fn === void 0 ? void 0 : fn.length).toBe(1);
      expect(fn === null || fn === void 0 ? void 0 : fn(5)).toBe(10);
    };"
  `);
});

test('077 JS Optional Chaining > with various types as base > regex base', async () => {
  const source =
    "() => {\n        const re = /test/i;\n        expect(re?.test('TEST')).toBe(true);\n        expect(re?.flags).toBe('i');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /test/i;
      expect(re === null || re === void 0 ? void 0 : re.test('TEST')).toBe(true);
      expect(re === null || re === void 0 ? void 0 : re.flags).toBe('i');
    };"
  `);
});

test('078 JS Optional Chaining > with destructuring > result of optional chain in destructuring default', async () => {
  const source =
    "() => {\n        const obj = null;\n        const { a = obj?.b ?? 'default' } = {};\n        expect(a).toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      const { a = (obj === null || obj === void 0 ? void 0 : obj.b) ?? 'default' } = {};
      expect(a).toBe('default');
    };"
  `);
});

test('079 JS Optional Chaining > with destructuring > optional chain inside destructured value', async () => {
  const source =
    "() => {\n        const data = { user: { address: { city: 'NYC' } } };\n        const city = data?.user?.address?.city;\n        expect(city).toBe('NYC');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _data$user;
      const data = { user: { address: { city: 'NYC' } } };
      const city =
        data === null ||
        data === void 0 ||
        (_data$user = data.user) === null ||
        _data$user === void 0 ||
        (_data$user = _data$user.address) === null ||
        _data$user === void 0
          ? void 0
          : _data$user.city;
      expect(city).toBe('NYC');
    };"
  `);
});

test('080 JS Optional Chaining > with destructuring > optional chain result destructured', async () => {
  const source =
    '() => {\n        const obj = { coords: { x: 10, y: 20 } };\n        const { x, y } = obj?.coords ?? {};\n        expect(x).toBe(10);\n        expect(y).toBe(20);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = {
        coords: {
          x: 10,
          y: 20,
        },
      };
      const { x, y } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};
      expect(x).toBe(10);
      expect(y).toBe(20);
    };"
  `);
});

test('081 JS Optional Chaining > with destructuring > null base with destructure fallback', async () => {
  const source =
    '() => {\n        const obj = null;\n        const { x = 0, y = 0 } = obj?.coords ?? {};\n        expect(x).toBe(0);\n        expect(y).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      const { x = 0, y = 0 } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};
      expect(x).toBe(0);
      expect(y).toBe(0);
    };"
  `);
});

test('082 JS Optional Chaining > with async/await > optional chain on async function result', async () => {
  const source =
    'async () => {\n        const fetchData = async () => ({ value: 42 });\n        const result = await fetchData();\n        expect(result?.value).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "async () => {
      const fetchData = async () => ({ value: 42 });
      const result = await fetchData();
      expect(result === null || result === void 0 ? void 0 : result.value).toBe(42);
    };"
  `);
});

test('083 JS Optional Chaining > with async/await > optional chain on null async result', async () => {
  const source =
    'async () => {\n        const fetchData = async () => null;\n        const result = await fetchData();\n        expect(result?.value).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "async () => {
      const fetchData = async () => null;
      const result = await fetchData();
      expect(result === null || result === void 0 ? void 0 : result.value).toBe(undefined);
    };"
  `);
});

test('084 JS Optional Chaining > with async/await > optional call on async method', async () => {
  const source =
    "async () => {\n        const obj = {\n          async getData() {\n            return 'data';\n          },\n        };\n        const result = await obj?.getData();\n        expect(result).toBe('data');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "async () => {
      const obj = {
        async getData() {
          return 'data';
        },
      };
      const result = await (obj === null || obj === void 0 ? void 0 : obj.getData());
      expect(result).toBe('data');
    };"
  `);
});

test('085 JS Optional Chaining > with async/await > optional call on null async method', async () => {
  const source =
    'async () => {\n        const obj = {};\n        const result = await obj?.getData?.();\n        expect(result).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "async () => {
      var _obj$getData;
      const obj = {};
      const result = await (obj === null ||
      obj === void 0 ||
      (_obj$getData = obj.getData) === null ||
      _obj$getData === void 0
        ? void 0
        : _obj$getData.call(obj));
      expect(result).toBe(undefined);
    };"
  `);
});

test('086 JS Optional Chaining > with Map, Set, and WeakMap > optional method call on Map', async () => {
  const source =
    "() => {\n        const map = new Map([['key', 'value']]);\n        expect(map?.get('key')).toBe('value');\n        expect(map?.get('missing')).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const map = new Map([['key', 'value']]);
      expect(map === null || map === void 0 ? void 0 : map.get('key')).toBe('value');
      expect(map === null || map === void 0 ? void 0 : map.get('missing')).toBe(undefined);
    };"
  `);
});

test('087 JS Optional Chaining > with Map, Set, and WeakMap > optional on null Map', async () => {
  const source =
    "() => {\n        const map = null;\n        expect(map?.get?.('key')).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _map$get;
      const map = null;
      expect(
        map === null || map === void 0 || (_map$get = map.get) === null || _map$get === void 0
          ? void 0
          : _map$get.call(map, 'key'),
      ).toBe(undefined);
    };"
  `);
});

test('088 JS Optional Chaining > with Map, Set, and WeakMap > optional on Set', async () => {
  const source =
    '() => {\n        const set = new Set([1, 2, 3]);\n        expect(set?.has(2)).toBe(true);\n        expect(set?.has(4)).toBe(false);\n        expect(set?.size).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const set = new Set([1, 2, 3]);
      expect(set === null || set === void 0 ? void 0 : set.has(2)).toBe(true);
      expect(set === null || set === void 0 ? void 0 : set.has(4)).toBe(false);
      expect(set === null || set === void 0 ? void 0 : set.size).toBe(3);
    };"
  `);
});

test('089 JS Optional Chaining > with Map, Set, and WeakMap > optional on WeakMap', async () => {
  const source =
    "() => {\n        const wm = new WeakMap();\n        const key = {};\n        wm.set(key, 'val');\n        expect(wm?.get(key)).toBe('val');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const wm = new WeakMap();
      const key = {};
      wm.set(key, 'val');
      expect(wm === null || wm === void 0 ? void 0 : wm.get(key)).toBe('val');
    };"
  `);
});

test('090 JS Optional Chaining > edge cases > optional chaining on result of typeof', async () => {
  const source =
    '() => {\n        // typeof always returns a string\n        const result = (typeof undefined)?.length;\n        expect(result).toBe(9); // "undefined".length\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      // typeof always returns a string
      const result =
        (_undefined = typeof undefined) === null || _undefined === void 0 ? void 0 : _undefined.length;
      expect(result).toBe(9);
    };"
  `);
});

test('091 JS Optional Chaining > edge cases > deeply nested with all nullish', async () => {
  const source =
    '() => {\n        const obj = null;\n        expect(obj?.a?.b?.c?.d?.e?.f?.g?.h).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a;
      const obj = null;
      expect(
        obj === null ||
          obj === void 0 ||
          (_obj$a = obj.a) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.b) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.c) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.d) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.e) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.f) === null ||
          _obj$a === void 0 ||
          (_obj$a = _obj$a.g) === null ||
          _obj$a === void 0
          ? void 0
          : _obj$a.h,
      ).toBe(undefined);
    };"
  `);
});

test('092 JS Optional Chaining > edge cases > optional chaining in template literal', async () => {
  const source =
    "() => {\n        const obj = null;\n        const result = `value: ${obj?.foo ?? 'none'}`;\n        expect(result).toBe('value: none');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = null;
      const result = \`value: \${(obj === null || obj === void 0 ? void 0 : obj.foo) ?? 'none'}\`;
      expect(result).toBe('value: none');
    };"
  `);
});

test('093 JS Optional Chaining > edge cases > optional chaining with spread', async () => {
  const source =
    '() => {\n        const obj = { arr: [1, 2, 3] };\n        const result = [...(obj?.arr ?? [])];\n        expect(result).toEqual([1, 2, 3]);\n\n        const nul = null;\n        const result2 = [...(nul?.arr ?? [])];\n        expect(result2).toEqual([]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { arr: [1, 2, 3] };
      const result = [...((obj === null || obj === void 0 ? void 0 : obj.arr) ?? [])];
      expect(result).toEqual([1, 2, 3]);
      const nul = null;
      const result2 = [...((nul === null || nul === void 0 ? void 0 : nul.arr) ?? [])];
      expect(result2).toEqual([]);
    };"
  `);
});

test('094 JS Optional Chaining > edge cases > chained optional calls', async () => {
  const source =
    '() => {\n        const fn = () => () => () => 42;\n        expect(fn?.()?.()?.()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn, _fn$call;
      const fn = () => () => () => 42;
      expect(
        fn === null ||
          fn === void 0 ||
          (_fn = fn()) === null ||
          _fn === void 0 ||
          (_fn$call = _fn.call(fn)) === null ||
          _fn$call === void 0
          ? void 0
          : _fn$call.call(_fn),
      ).toBe(42);
    };"
  `);
});

test('095 JS Optional Chaining > edge cases > chained optional calls with null', async () => {
  const source =
    '() => {\n        const fn = () => () => null;\n        expect(fn?.()?.()?.()).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn, _fn$call;
      const fn = () => () => null;
      expect(
        fn === null ||
          fn === void 0 ||
          (_fn = fn()) === null ||
          _fn === void 0 ||
          (_fn$call = _fn.call(fn)) === null ||
          _fn$call === void 0
          ? void 0
          : _fn$call.call(_fn),
      ).toBe(undefined);
    };"
  `);
});

test('096 JS Optional Chaining > edge cases > optional on Map.prototype.get result', async () => {
  const source =
    "() => {\n        const map = new Map();\n        map.set('user', { name: 'Alice' });\n        expect(map.get('user')?.name).toBe('Alice');\n        expect(map.get('missing')?.name).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _map$get, _map$get2;
      const map = new Map();
      map.set('user', { name: 'Alice' });
      expect(
        (_map$get = map.get('user')) === null || _map$get === void 0 ? void 0 : _map$get.name,
      ).toBe('Alice');
      expect(
        (_map$get2 = map.get('missing')) === null || _map$get2 === void 0 ? void 0 : _map$get2.name,
      ).toBe(undefined);
    };"
  `);
});

test('097 JS Optional Chaining > edge cases > optional chaining preserves object identity', async () => {
  const source =
    '() => {\n        const inner = { value: 42 };\n        const obj = { inner };\n        expect(obj?.inner).toBe(inner);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const inner = { value: 42 };
      const obj = { inner };
      expect(obj === null || obj === void 0 ? void 0 : obj.inner).toBe(inner);
    };"
  `);
});

test('098 JS Optional Chaining > edge cases > parenthesized optional chain', async () => {
  const source =
    '() => {\n        const obj = { a: { b: 42 } };\n        expect(obj?.a?.b).toBe(42);\n        const nul = null;\n        expect(nul?.a?.b).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a, _nul$a;
      const obj = { a: { b: 42 } };
      expect(
        obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
          ? void 0
          : _obj$a.b,
      ).toBe(42);
      const nul = null;
      expect(
        nul === null || nul === void 0 || (_nul$a = nul.a) === null || _nul$a === void 0
          ? void 0
          : _nul$a.b,
      ).toBe(undefined);
    };"
  `);
});

test('099 JS Optional Chaining > edge cases > optional chaining with comma operator', async () => {
  const source =
    '() => {\n        const obj = { a: 1 };\n        const result = (0, obj)?.a;\n        expect(result).toBe(1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const obj = { a: 1 };
      const result = (_ref = (0, obj)) === null || _ref === void 0 ? void 0 : _ref.a;
      expect(result).toBe(1);
    };"
  `);
});

test('100 JS Optional Chaining > practical patterns > safe nested config access', async () => {
  const source =
    "() => {\n        const config = {\n          database: {\n            connection: {\n              host: 'localhost',\n              port: 5432,\n            },\n          },\n        };\n        expect(config?.database?.connection?.host).toBe('localhost');\n        expect(config?.database?.connection?.ssl).toBe(undefined);\n        expect(config?.cache?.redis?.host).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _config$database, _config$database2, _config$cache;
      const config = {
        database: {
          connection: {
            host: 'localhost',
            port: 5432,
          },
        },
      };
      expect(
        config === null ||
          config === void 0 ||
          (_config$database = config.database) === null ||
          _config$database === void 0 ||
          (_config$database = _config$database.connection) === null ||
          _config$database === void 0
          ? void 0
          : _config$database.host,
      ).toBe('localhost');
      expect(
        config === null ||
          config === void 0 ||
          (_config$database2 = config.database) === null ||
          _config$database2 === void 0 ||
          (_config$database2 = _config$database2.connection) === null ||
          _config$database2 === void 0
          ? void 0
          : _config$database2.ssl,
      ).toBe(undefined);
      expect(
        config === null ||
          config === void 0 ||
          (_config$cache = config.cache) === null ||
          _config$cache === void 0 ||
          (_config$cache = _config$cache.redis) === null ||
          _config$cache === void 0
          ? void 0
          : _config$cache.host,
      ).toBe(undefined);
    };"
  `);
});

test('101 JS Optional Chaining > practical patterns > safe event handler invocation', async () => {
  const source =
    '() => {\n        let called = false;\n        const props = {\n          onPress: () => {\n            called = true;\n          },\n        };\n        props?.onPress?.();\n        expect(called).toBe(true);\n\n        const emptyProps = {};\n        emptyProps?.onPress?.();\n        // No error thrown\n        expect(true).toBe(true);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _props$onPress, _emptyProps$onPress;
      let called = false;
      const props = {
        onPress: () => {
          called = true;
        },
      };
      props === null ||
      props === void 0 ||
      (_props$onPress = props.onPress) === null ||
      _props$onPress === void 0
        ? void 0
        : _props$onPress.call(props);
      expect(called).toBe(true);
      const emptyProps = {};
      emptyProps === null ||
      emptyProps === void 0 ||
      (_emptyProps$onPress = emptyProps.onPress) === null ||
      _emptyProps$onPress === void 0
        ? void 0
        : _emptyProps$onPress.call(emptyProps);
      // No error thrown
      expect(true).toBe(true);
    };"
  `);
});

test('102 JS Optional Chaining > practical patterns > safe array element access', async () => {
  const source =
    '() => {\n        const matrix = [\n          [1, 2],\n          [3, 4],\n        ];\n        expect(matrix?.[0]?.[1]).toBe(2);\n        expect(matrix?.[5]?.[0]).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _matrix$, _matrix$2;
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      expect(
        matrix === null || matrix === void 0 || (_matrix$ = matrix[0]) === null || _matrix$ === void 0
          ? void 0
          : _matrix$[1],
      ).toBe(2);
      expect(
        matrix === null || matrix === void 0 || (_matrix$2 = matrix[5]) === null || _matrix$2 === void 0
          ? void 0
          : _matrix$2[0],
      ).toBe(undefined);
    };"
  `);
});

test('103 JS Optional Chaining > practical patterns > optional chaining in reduce', async () => {
  const source =
    "() => {\n        const items = [\n          { category: { name: 'A' }, value: 1 },\n          { category: null, value: 2 },\n          { category: { name: 'B' }, value: 3 },\n        ];\n        const categories = items.map((item) => item.category?.name ?? 'Unknown');\n        expect(categories).toEqual(['A', 'Unknown', 'B']);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const items = [
        {
          category: { name: 'A' },
          value: 1,
        },
        {
          category: null,
          value: 2,
        },
        {
          category: { name: 'B' },
          value: 3,
        },
      ];
      const categories = items.map(item => {
        var _item$category;
        return (
          ((_item$category = item.category) === null || _item$category === void 0
            ? void 0
            : _item$category.name) ?? 'Unknown'
        );
      });
      expect(categories).toEqual(['A', 'Unknown', 'B']);
    };"
  `);
});

test('104 JS Optional Chaining > practical patterns > JSON response navigation', async () => {
  const source =
    "() => {\n        const response = {\n          data: {\n            users: [\n              { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },\n              { profile: { avatar: null } },\n              { profile: null },\n            ],\n          },\n        };\n        expect(response.data?.users?.[0]?.profile?.avatar?.url).toBe(\n          'https://example.com/photo.jpg'\n        );\n        expect(response.data?.users?.[1]?.profile?.avatar?.url).toBe(undefined);\n        expect(response.data?.users?.[2]?.profile?.avatar?.url).toBe(undefined);\n        expect(response.data?.users?.[99]?.profile?.avatar?.url).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _response$data, _response$data2, _response$data3, _response$data4;
      const response = {
        data: {
          users: [
            { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },
            { profile: { avatar: null } },
            { profile: null },
          ],
        },
      };
      expect(
        (_response$data = response.data) === null ||
          _response$data === void 0 ||
          (_response$data = _response$data.users) === null ||
          _response$data === void 0 ||
          (_response$data = _response$data[0]) === null ||
          _response$data === void 0 ||
          (_response$data = _response$data.profile) === null ||
          _response$data === void 0 ||
          (_response$data = _response$data.avatar) === null ||
          _response$data === void 0
          ? void 0
          : _response$data.url,
      ).toBe('https://example.com/photo.jpg');
      expect(
        (_response$data2 = response.data) === null ||
          _response$data2 === void 0 ||
          (_response$data2 = _response$data2.users) === null ||
          _response$data2 === void 0 ||
          (_response$data2 = _response$data2[1]) === null ||
          _response$data2 === void 0 ||
          (_response$data2 = _response$data2.profile) === null ||
          _response$data2 === void 0 ||
          (_response$data2 = _response$data2.avatar) === null ||
          _response$data2 === void 0
          ? void 0
          : _response$data2.url,
      ).toBe(undefined);
      expect(
        (_response$data3 = response.data) === null ||
          _response$data3 === void 0 ||
          (_response$data3 = _response$data3.users) === null ||
          _response$data3 === void 0 ||
          (_response$data3 = _response$data3[2]) === null ||
          _response$data3 === void 0 ||
          (_response$data3 = _response$data3.profile) === null ||
          _response$data3 === void 0 ||
          (_response$data3 = _response$data3.avatar) === null ||
          _response$data3 === void 0
          ? void 0
          : _response$data3.url,
      ).toBe(undefined);
      expect(
        (_response$data4 = response.data) === null ||
          _response$data4 === void 0 ||
          (_response$data4 = _response$data4.users) === null ||
          _response$data4 === void 0 ||
          (_response$data4 = _response$data4[99]) === null ||
          _response$data4 === void 0 ||
          (_response$data4 = _response$data4.profile) === null ||
          _response$data4 === void 0 ||
          (_response$data4 = _response$data4.avatar) === null ||
          _response$data4 === void 0
          ? void 0
          : _response$data4.url,
      ).toBe(undefined);
    };"
  `);
});

test('105 JS Optional Chaining > practical patterns > safe method chaining pattern', async () => {
  const source =
    "() => {\n        class Builder {\n          #parts = [];\n          add(part) {\n            this.#parts.push(part);\n            return this;\n          }\n          build() {\n            return this.#parts.join(' ');\n          }\n        }\n        const builder = new Builder();\n        const result = builder?.add('hello')?.add('world')?.build();\n        expect(result).toBe('hello world');\n\n        const nullBuilder = null;\n        const nullResult = nullBuilder?.add('hello')?.add('world')?.build();\n        expect(nullResult).toBe(undefined);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { optionalChaining: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _builder$add, _nullBuilder$add;
      class Builder {
        #parts = [];
        add(part) {
          this.#parts.push(part);
          return this;
        }
        build() {
          return this.#parts.join(' ');
        }
      }
      const builder = new Builder();
      const result =
        builder === null ||
        builder === void 0 ||
        (_builder$add = builder.add('hello')) === null ||
        _builder$add === void 0 ||
        (_builder$add = _builder$add.add('world')) === null ||
        _builder$add === void 0
          ? void 0
          : _builder$add.build();
      expect(result).toBe('hello world');
      const nullBuilder = null;
      const nullResult =
        nullBuilder === null ||
        nullBuilder === void 0 ||
        (_nullBuilder$add = nullBuilder.add('hello')) === null ||
        _nullBuilder$add === void 0 ||
        (_nullBuilder$add = _nullBuilder$add.add('world')) === null ||
        _nullBuilder$add === void 0
          ? void 0
          : _nullBuilder$add.build();
      expect(nullResult).toBe(undefined);
    };"
  `);
});
