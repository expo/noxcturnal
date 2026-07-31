// Generated from apps/test-suite/tests/JSNullishCoalescing.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

test('001 JS Nullish Coalescing > basic semantics > returns left side when not null or undefined', async () => {
  const source =
    "() => {\n        expect('hello' ?? 'default').toBe('hello');\n        expect(42 ?? 0).toBe(42);\n        expect(true ?? false).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _hello, _, _true;
      expect((_hello = 'hello') !== null && _hello !== void 0 ? _hello : 'default').toBe('hello');
      expect((_ = 42) !== null && _ !== void 0 ? _ : 0).toBe(42);
      expect((_true = true) !== null && _true !== void 0 ? _true : false).toBe(true);
    };"
  `);
});

test('002 JS Nullish Coalescing > basic semantics > returns right side when left is null', async () => {
  const source = "() => {\n        expect(null ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'default').toBe('default');
    };"
  `);
});

test('003 JS Nullish Coalescing > basic semantics > returns right side when left is undefined', async () => {
  const source = "() => {\n        expect(undefined ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'default').toBe(
        'default',
      );
    };"
  `);
});

test('004 JS Nullish Coalescing > basic semantics > returns right side when left is void 0', async () => {
  const source = "() => {\n        expect(void 0 ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _;
      expect((_ = void 0) !== null && _ !== void 0 ? _ : 'default').toBe('default');
    };"
  `);
});

test('005 JS Nullish Coalescing > basic semantics > preserves falsy non-nullish values', async () => {
  const source =
    "() => {\n        expect(0 ?? 'default').toBe(0);\n        expect('' ?? 'default').toBe('');\n        expect(false ?? 'default').toBe(false);\n        expect(NaN ?? 'default').not.toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _, _ref, _false, _NaN;
      expect((_ = 0) !== null && _ !== void 0 ? _ : 'default').toBe(0);
      expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'default').toBe('');
      expect((_false = false) !== null && _false !== void 0 ? _false : 'default').toBe(false);
      expect((_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'default').not.toBe('default');
    };"
  `);
});

test('006 JS Nullish Coalescing > basic semantics > returns -0 without falling through', async () => {
  const source =
    "() => {\n        const result = -0 ?? 'default';\n        expect(result).toBe(-0);\n        expect(1 / result).toBe(-Infinity);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _;
      const result = (_ = -0) !== null && _ !== void 0 ? _ : 'default';
      expect(result).toBe(-0);
      expect(1 / result).toBe(-Infinity);
    };"
  `);
});

test('007 JS Nullish Coalescing > difference from || operator > ?? keeps 0, || does not', async () => {
  const source =
    "() => {\n        expect(0 ?? 'fallback').toBe(0);\n        expect(0 || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _;
      expect((_ = 0) !== null && _ !== void 0 ? _ : 'fallback').toBe(0);
      expect(0 || 'fallback').toBe('fallback');
    };"
  `);
});

test('008 JS Nullish Coalescing > difference from || operator > ?? keeps empty string, || does not', async () => {
  const source =
    "() => {\n        expect('' ?? 'fallback').toBe('');\n        expect('' || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'fallback').toBe('');
      expect('' || 'fallback').toBe('fallback');
    };"
  `);
});

test('009 JS Nullish Coalescing > difference from || operator > ?? keeps false, || does not', async () => {
  const source =
    "() => {\n        expect(false ?? 'fallback').toBe(false);\n        expect(false || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _false;
      expect((_false = false) !== null && _false !== void 0 ? _false : 'fallback').toBe(false);
      expect(false || 'fallback').toBe('fallback');
    };"
  `);
});

test('010 JS Nullish Coalescing > difference from || operator > ?? keeps NaN, || does not', async () => {
  const source =
    "() => {\n        const qqResult = NaN ?? 'fallback';\n        const orResult = NaN || 'fallback';\n        expect(typeof qqResult).toBe('number');\n        expect(orResult).toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _NaN;
      const qqResult = (_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'fallback';
      const orResult = NaN || 'fallback';
      expect(typeof qqResult).toBe('number');
      expect(orResult).toBe('fallback');
    };"
  `);
});

test('011 JS Nullish Coalescing > difference from || operator > both fall through on null', async () => {
  const source =
    "() => {\n        expect(null ?? 'fallback').toBe('fallback');\n        expect(null || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'fallback').toBe('fallback');
      expect(null || 'fallback').toBe('fallback');
    };"
  `);
});

test('012 JS Nullish Coalescing > difference from || operator > both fall through on undefined', async () => {
  const source =
    "() => {\n        expect(undefined ?? 'fallback').toBe('fallback');\n        expect(undefined || 'fallback').toBe('fallback');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'fallback').toBe(
        'fallback',
      );
      expect(undefined || 'fallback').toBe('fallback');
    };"
  `);
});

test('013 JS Nullish Coalescing > chaining > multiple ?? operators', async () => {
  const source = "() => {\n        expect(null ?? undefined ?? 'found').toBe('found');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2;
      expect(
        (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : undefined) !== null &&
          _ref !== void 0
          ? _ref
          : 'found',
      ).toBe('found');
    };"
  `);
});

test('014 JS Nullish Coalescing > chaining > first non-nullish wins in chain', async () => {
  const source = "() => {\n        expect(null ?? 0 ?? 'fallback').toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2;
      expect(
        (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : 0) !== null && _ref !== void 0
          ? _ref
          : 'fallback',
      ).toBe(0);
    };"
  `);
});

test('015 JS Nullish Coalescing > chaining > all null/undefined falls through to last', async () => {
  const source =
    "() => {\n        expect(null ?? undefined ?? null ?? 'end').toBe('end');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2, _ref3;
      expect(
        (_ref =
          (_ref2 = (_ref3 = null) !== null && _ref3 !== void 0 ? _ref3 : undefined) !== null &&
          _ref2 !== void 0
            ? _ref2
            : null) !== null && _ref !== void 0
          ? _ref
          : 'end',
      ).toBe('end');
    };"
  `);
});

test('016 JS Nullish Coalescing > chaining > first value returned if not nullish', async () => {
  const source = "() => {\n        expect('first' ?? 'second' ?? 'third').toBe('first');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _first;
      expect(
        (_ref = (_first = 'first') !== null && _first !== void 0 ? _first : 'second') !== null &&
          _ref !== void 0
          ? _ref
          : 'third',
      ).toBe('first');
    };"
  `);
});

test('017 JS Nullish Coalescing > chaining > chain with false', async () => {
  const source = "() => {\n        expect(null ?? false ?? 'fallback').toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2;
      expect(
        (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : false) !== null && _ref !== void 0
          ? _ref
          : 'fallback',
      ).toBe(false);
    };"
  `);
});

test('018 JS Nullish Coalescing > with member expressions > property access on object', async () => {
  const source =
    "() => {\n        const obj = { foo: 'bar' };\n        expect(obj.foo ?? 'default').toBe('bar');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo;
      const obj = { foo: 'bar' };
      expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe('bar');
    };"
  `);
});

test('019 JS Nullish Coalescing > with member expressions > missing property returns default', async () => {
  const source =
    "() => {\n        const obj = {};\n        expect(obj.foo ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo;
      const obj = {};
      expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(
        'default',
      );
    };"
  `);
});

test('020 JS Nullish Coalescing > with member expressions > null property value returns default', async () => {
  const source =
    "() => {\n        const obj = { foo: null };\n        expect(obj.foo ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo;
      const obj = { foo: null };
      expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(
        'default',
      );
    };"
  `);
});

test('021 JS Nullish Coalescing > with member expressions > falsy property value is preserved', async () => {
  const source =
    "() => {\n        const obj = { count: 0, name: '', active: false };\n        expect(obj.count ?? 99).toBe(0);\n        expect(obj.name ?? 'anonymous').toBe('');\n        expect(obj.active ?? true).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$count, _obj$name, _obj$active;
      const obj = {
        count: 0,
        name: '',
        active: false,
      };
      expect((_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : 99).toBe(0);
      expect((_obj$name = obj.name) !== null && _obj$name !== void 0 ? _obj$name : 'anonymous').toBe(
        '',
      );
      expect((_obj$active = obj.active) !== null && _obj$active !== void 0 ? _obj$active : true).toBe(
        false,
      );
    };"
  `);
});

test('022 JS Nullish Coalescing > with member expressions > nested property access', async () => {
  const source =
    "() => {\n        const obj = { a: { b: { c: null } } };\n        expect(obj.a.b.c ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a$b$c;
      const obj = { a: { b: { c: null } } };
      expect((_obj$a$b$c = obj.a.b.c) !== null && _obj$a$b$c !== void 0 ? _obj$a$b$c : 'default').toBe(
        'default',
      );
    };"
  `);
});

test('023 JS Nullish Coalescing > with member expressions > computed property access', async () => {
  const source =
    "() => {\n        const obj = { key: 'value' };\n        const key = 'key';\n        expect(obj[key] ?? 'default').toBe('value');\n        expect(obj['missing'] ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$key, _obj$missing;
      const obj = { key: 'value' };
      const key = 'key';
      expect((_obj$key = obj[key]) !== null && _obj$key !== void 0 ? _obj$key : 'default').toBe(
        'value',
      );
      expect(
        (_obj$missing = obj['missing']) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',
      ).toBe('default');
    };"
  `);
});

test('024 JS Nullish Coalescing > with member expressions > array element access', async () => {
  const source =
    "() => {\n        const arr = [1, null, undefined, 0];\n        expect(arr[0] ?? 'default').toBe(1);\n        expect(arr[1] ?? 'default').toBe('default');\n        expect(arr[2] ?? 'default').toBe('default');\n        expect(arr[3] ?? 'default').toBe(0);\n        expect(arr[99] ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _arr$, _arr$2, _arr$3, _arr$4, _arr$5;
      const arr = [1, null, undefined, 0];
      expect((_arr$ = arr[0]) !== null && _arr$ !== void 0 ? _arr$ : 'default').toBe(1);
      expect((_arr$2 = arr[1]) !== null && _arr$2 !== void 0 ? _arr$2 : 'default').toBe('default');
      expect((_arr$3 = arr[2]) !== null && _arr$3 !== void 0 ? _arr$3 : 'default').toBe('default');
      expect((_arr$4 = arr[3]) !== null && _arr$4 !== void 0 ? _arr$4 : 'default').toBe(0);
      expect((_arr$5 = arr[99]) !== null && _arr$5 !== void 0 ? _arr$5 : 'default').toBe('default');
    };"
  `);
});

test('025 JS Nullish Coalescing > with function calls > function returning null', async () => {
  const source =
    "() => {\n        const fn = () => null;\n        expect(fn() ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn;
      const fn = () => null;
      expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');
    };"
  `);
});

test('026 JS Nullish Coalescing > with function calls > function returning undefined', async () => {
  const source =
    "() => {\n        const fn = () => undefined;\n        expect(fn() ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn;
      const fn = () => undefined;
      expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');
    };"
  `);
});

test('027 JS Nullish Coalescing > with function calls > function returning value', async () => {
  const source =
    "() => {\n        const fn = () => 42;\n        expect(fn() ?? 'default').toBe(42);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn;
      const fn = () => 42;
      expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe(42);
    };"
  `);
});

test('028 JS Nullish Coalescing > with function calls > function returning falsy non-nullish', async () => {
  const source =
    "() => {\n        expect((() => 0)() ?? 'default').toBe(0);\n        expect((() => '')() ?? 'default').toBe('');\n        expect((() => false)() ?? 'default').toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2, _ref3;
      expect((_ref = (() => 0)()) !== null && _ref !== void 0 ? _ref : 'default').toBe(0);
      expect((_ref2 = (() => '')()) !== null && _ref2 !== void 0 ? _ref2 : 'default').toBe('');
      expect((_ref3 = (() => false)()) !== null && _ref3 !== void 0 ? _ref3 : 'default').toBe(false);
    };"
  `);
});

test('029 JS Nullish Coalescing > with function calls > left side evaluated only once', async () => {
  const source =
    "() => {\n        let count = 0;\n        const fn = () => {\n          count++;\n          return null;\n        };\n        fn() ?? 'default';\n        expect(count).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _fn;
      let count = 0;
      const fn = () => {
        count++;
        return null;
      };
      (_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default';
      expect(count).toBe(1);
    };"
  `);
});

test('030 JS Nullish Coalescing > with function calls > right side not evaluated when left is non-nullish', async () => {
  const source =
    "() => {\n        let evaluated = false;\n        const right = () => {\n          evaluated = true;\n          return 'right';\n        };\n        'left' ?? right();\n        expect(evaluated).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _left;
      let evaluated = false;
      const right = () => {
        evaluated = true;
        return 'right';
      };
      (_left = 'left') !== null && _left !== void 0 ? _left : right();
      expect(evaluated).toBe(false);
    };"
  `);
});

test('031 JS Nullish Coalescing > with function calls > right side evaluated when left is nullish', async () => {
  const source =
    "() => {\n        let evaluated = false;\n        const right = () => {\n          evaluated = true;\n          return 'right';\n        };\n        const result = null ?? right();\n        expect(evaluated).toBe(true);\n        expect(result).toBe('right');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      let evaluated = false;
      const right = () => {
        evaluated = true;
        return 'right';
      };
      const result = (_ref = null) !== null && _ref !== void 0 ? _ref : right();
      expect(evaluated).toBe(true);
      expect(result).toBe('right');
    };"
  `);
});

test('032 JS Nullish Coalescing > short-circuit evaluation > does not evaluate right side when left is 0', async () => {
  const source =
    "() => {\n        let sideEffect = false;\n        const result = 0 ?? ((sideEffect = true), 'fallback');\n        expect(result).toBe(0);\n        expect(sideEffect).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _;
      let sideEffect = false;
      const result = (_ = 0) !== null && _ !== void 0 ? _ : ((sideEffect = true), 'fallback');
      expect(result).toBe(0);
      expect(sideEffect).toBe(false);
    };"
  `);
});

test('033 JS Nullish Coalescing > short-circuit evaluation > does not evaluate right side when left is empty string', async () => {
  const source =
    "() => {\n        let sideEffect = false;\n        const result = '' ?? ((sideEffect = true), 'fallback');\n        expect(result).toBe('');\n        expect(sideEffect).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      let sideEffect = false;
      const result = (_ref = '') !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');
      expect(result).toBe('');
      expect(sideEffect).toBe(false);
    };"
  `);
});

test('034 JS Nullish Coalescing > short-circuit evaluation > does not evaluate right side when left is false', async () => {
  const source =
    "() => {\n        let sideEffect = false;\n        const result = false ?? ((sideEffect = true), 'fallback');\n        expect(result).toBe(false);\n        expect(sideEffect).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _false;
      let sideEffect = false;
      const result =
        (_false = false) !== null && _false !== void 0 ? _false : ((sideEffect = true), 'fallback');
      expect(result).toBe(false);
      expect(sideEffect).toBe(false);
    };"
  `);
});

test('035 JS Nullish Coalescing > short-circuit evaluation > evaluates right side when left is null', async () => {
  const source =
    "() => {\n        let sideEffect = false;\n        const result = null ?? ((sideEffect = true), 'fallback');\n        expect(result).toBe('fallback');\n        expect(sideEffect).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      let sideEffect = false;
      const result =
        (_ref = null) !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');
      expect(result).toBe('fallback');
      expect(sideEffect).toBe(true);
    };"
  `);
});

test('036 JS Nullish Coalescing > short-circuit evaluation > evaluates right side when left is undefined', async () => {
  const source =
    "() => {\n        let sideEffect = false;\n        const result = undefined ?? ((sideEffect = true), 'fallback');\n        expect(result).toBe('fallback');\n        expect(sideEffect).toBe(true);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      let sideEffect = false;
      const result =
        (_undefined = undefined) !== null && _undefined !== void 0
          ? _undefined
          : ((sideEffect = true), 'fallback');
      expect(result).toBe('fallback');
      expect(sideEffect).toBe(true);
    };"
  `);
});

test('037 JS Nullish Coalescing > short-circuit evaluation > complex left side evaluated once with side effects', async () => {
  const source =
    "() => {\n        const calls = [];\n        const obj = {\n          get prop() {\n            calls.push('get');\n            return null;\n          },\n        };\n        obj.prop ?? 'default';\n        expect(calls.length).toBe(1);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$prop;
      const calls = [];
      const obj = {
        get prop() {
          calls.push('get');
          return null;
        },
      };
      (_obj$prop = obj.prop) !== null && _obj$prop !== void 0 ? _obj$prop : 'default';
      expect(calls.length).toBe(1);
    };"
  `);
});

test('038 JS Nullish Coalescing > with assignment > assign result to variable', async () => {
  const source = '() => {\n        const x = null ?? 42;\n        expect(x).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 42;
      expect(x).toBe(42);
    };"
  `);
});

test('039 JS Nullish Coalescing > with assignment > assign with non-nullish left', async () => {
  const source = '() => {\n        const x = 0 ?? 42;\n        expect(x).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _;
      const x = (_ = 0) !== null && _ !== void 0 ? _ : 42;
      expect(x).toBe(0);
    };"
  `);
});

test('040 JS Nullish Coalescing > with assignment > nullish coalescing assignment (??=)', async () => {
  const source =
    "() => {\n        let a = null;\n        a ??= 'default';\n        expect(a).toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let a = null;
      a ??= 'default';
      expect(a).toBe('default');
    };"
  `);
});

test('041 JS Nullish Coalescing > with assignment > ??= does not assign when non-nullish', async () => {
  const source =
    '() => {\n        let a = 0;\n        a ??= 99;\n        expect(a).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let a = 0;
      a ??= 99;
      expect(a).toBe(0);
    };"
  `);
});

test('042 JS Nullish Coalescing > with assignment > ??= with undefined', async () => {
  const source =
    "() => {\n        let a = undefined;\n        a ??= 'filled';\n        expect(a).toBe('filled');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let a = undefined;
      a ??= 'filled';
      expect(a).toBe('filled');
    };"
  `);
});

test('043 JS Nullish Coalescing > with assignment > ??= with false', async () => {
  const source =
    '() => {\n        let a = false;\n        a ??= true;\n        expect(a).toBe(false);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let a = false;
      a ??= true;
      expect(a).toBe(false);
    };"
  `);
});

test('044 JS Nullish Coalescing > with assignment > ??= with empty string', async () => {
  const source =
    "() => {\n        let a = '';\n        a ??= 'nonempty';\n        expect(a).toBe('');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let a = '';
      a ??= 'nonempty';
      expect(a).toBe('');
    };"
  `);
});

test('045 JS Nullish Coalescing > with assignment > ??= on object property', async () => {
  const source =
    "() => {\n        const obj = { a: null, b: 0 };\n        obj.a ??= 'filled';\n        obj.b ??= 99;\n        expect(obj.a).toBe('filled');\n        expect(obj.b).toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = {
        a: null,
        b: 0,
      };
      obj.a ??= 'filled';
      obj.b ??= 99;
      expect(obj.a).toBe('filled');
      expect(obj.b).toBe(0);
    };"
  `);
});

test('046 JS Nullish Coalescing > with various types > object value preserved', async () => {
  const source =
    "() => {\n        const obj = { key: 'value' };\n        expect((obj ?? {}).key).toBe('value');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = { key: 'value' };
      expect((obj !== null && obj !== void 0 ? obj : {}).key).toBe('value');
    };"
  `);
});

test('047 JS Nullish Coalescing > with various types > null falls through to object default', async () => {
  const source =
    "() => {\n        const result = null ?? { key: 'default' };\n        expect(result.key).toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const result = (_ref = null) !== null && _ref !== void 0 ? _ref : { key: 'default' };
      expect(result.key).toBe('default');
    };"
  `);
});

test('048 JS Nullish Coalescing > with various types > array value preserved', async () => {
  const source =
    '() => {\n        const arr = [1, 2, 3];\n        const result = arr ?? [];\n        expect(result.length).toBe(3);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const arr = [1, 2, 3];
      const result = arr !== null && arr !== void 0 ? arr : [];
      expect(result.length).toBe(3);
    };"
  `);
});

test('049 JS Nullish Coalescing > with various types > function value preserved', async () => {
  const source =
    '() => {\n        const fn = () => 42;\n        const result = fn ?? (() => 0);\n        expect(result()).toBe(42);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const fn = () => 42;
      const result = fn !== null && fn !== void 0 ? fn : () => 0;
      expect(result()).toBe(42);
    };"
  `);
});

test('050 JS Nullish Coalescing > with various types > symbol value preserved', async () => {
  const source =
    "() => {\n        const sym = Symbol('test');\n        expect(sym ?? 'fallback').toBe(sym);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const sym = Symbol('test');
      expect(sym !== null && sym !== void 0 ? sym : 'fallback').toBe(sym);
    };"
  `);
});

test('051 JS Nullish Coalescing > with various types > bigint value preserved', async () => {
  const source =
    "() => {\n        const big = BigInt(0);\n        expect(big ?? 'fallback').toBe(big);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const big = BigInt(0);
      expect(big !== null && big !== void 0 ? big : 'fallback').toBe(big);
    };"
  `);
});

test('052 JS Nullish Coalescing > with various types > regex value preserved', async () => {
  const source =
    "() => {\n        const re = /test/;\n        expect(re ?? 'fallback').toBe(re);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const re = /test/;
      expect(re !== null && re !== void 0 ? re : 'fallback').toBe(re);
    };"
  `);
});

test('053 JS Nullish Coalescing > with various types > Date value preserved', async () => {
  const source =
    "() => {\n        const date = new Date(0);\n        expect(date ?? 'fallback').toBe(date);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const date = new Date(0);
      expect(date !== null && date !== void 0 ? date : 'fallback').toBe(date);
    };"
  `);
});

test('054 JS Nullish Coalescing > with optional chaining > ?. producing undefined triggers ??', async () => {
  const source =
    "() => {\n        const obj = {};\n        expect(obj.foo?.bar ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo$bar;
      const obj = {};
      expect(
        (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
      ).toBe('default');
    };"
  `);
});

test('055 JS Nullish Coalescing > with optional chaining > ?. on null triggers ??', async () => {
  const source =
    "() => {\n        const obj = { foo: null };\n        expect(obj.foo?.bar ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo$bar;
      const obj = { foo: null };
      expect(
        (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
      ).toBe('default');
    };"
  `);
});

test('056 JS Nullish Coalescing > with optional chaining > ?. producing value does not trigger ??', async () => {
  const source =
    "() => {\n        const obj = { foo: { bar: 'value' } };\n        expect(obj.foo?.bar ?? 'default').toBe('value');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo$bar;
      const obj = { foo: { bar: 'value' } };
      expect(
        (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
      ).toBe('value');
    };"
  `);
});

test('057 JS Nullish Coalescing > with optional chaining > ?. producing 0 does not trigger ??', async () => {
  const source =
    '() => {\n        const obj = { foo: { bar: 0 } };\n        expect(obj.foo?.bar ?? 99).toBe(0);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$foo$bar;
      const obj = { foo: { bar: 0 } };
      expect(
        (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 99,
      ).toBe(0);
    };"
  `);
});

test('058 JS Nullish Coalescing > with optional chaining > deep optional chain with ??', async () => {
  const source =
    "() => {\n        const obj = { a: { b: { c: { d: null } } } };\n        expect(obj.a?.b?.c?.d ?? 'default').toBe('default');\n        expect(obj.a?.b?.c?.e ?? 'default').toBe('default');\n        expect(obj.x?.y?.z ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$a$b$c$d, _obj$a$b$c$e, _obj$x$y$z;
      const obj = { a: { b: { c: { d: null } } } };
      expect(
        (_obj$a$b$c$d = obj.a?.b?.c?.d) !== null && _obj$a$b$c$d !== void 0 ? _obj$a$b$c$d : 'default',
      ).toBe('default');
      expect(
        (_obj$a$b$c$e = obj.a?.b?.c?.e) !== null && _obj$a$b$c$e !== void 0 ? _obj$a$b$c$e : 'default',
      ).toBe('default');
      expect(
        (_obj$x$y$z = obj.x?.y?.z) !== null && _obj$x$y$z !== void 0 ? _obj$x$y$z : 'default',
      ).toBe('default');
    };"
  `);
});

test('059 JS Nullish Coalescing > with optional chaining > optional method call with ??', async () => {
  const source =
    "() => {\n        const obj = { fn: () => null };\n        expect(obj.fn?.() ?? 'default').toBe('default');\n        expect(obj.missing?.() ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _obj$fn, _obj$missing;
      const obj = { fn: () => null };
      expect((_obj$fn = obj.fn?.()) !== null && _obj$fn !== void 0 ? _obj$fn : 'default').toBe(
        'default',
      );
      expect(
        (_obj$missing = obj.missing?.()) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',
      ).toBe('default');
    };"
  `);
});

test('060 JS Nullish Coalescing > in function parameters > default parameter with ??', async () => {
  const source =
    "() => {\n        function greet(name) {\n          const displayName = name ?? 'stranger';\n          return 'Hello, ' + displayName;\n        }\n        expect(greet('Alice')).toBe('Hello, Alice');\n        expect(greet(null)).toBe('Hello, stranger');\n        expect(greet(undefined)).toBe('Hello, stranger');\n        expect(greet('')).toBe('Hello, ');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function greet(name) {
        const displayName = name !== null && name !== void 0 ? name : 'stranger';
        return 'Hello, ' + displayName;
      }
      expect(greet('Alice')).toBe('Hello, Alice');
      expect(greet(null)).toBe('Hello, stranger');
      expect(greet(undefined)).toBe('Hello, stranger');
      expect(greet('')).toBe('Hello, ');
    };"
  `);
});

test('061 JS Nullish Coalescing > in function parameters > multiple parameters with ??', async () => {
  const source =
    "() => {\n        function config(host, port, secure) {\n          return {\n            host: host ?? 'localhost',\n            port: port ?? 3000,\n            secure: secure ?? false,\n          };\n        }\n        const c = config(null, 0, undefined);\n        expect(c.host).toBe('localhost');\n        expect(c.port).toBe(0);\n        expect(c.secure).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function config(host, port, secure) {
        return {
          host: host !== null && host !== void 0 ? host : 'localhost',
          port: port !== null && port !== void 0 ? port : 3e3,
          secure: secure !== null && secure !== void 0 ? secure : false,
        };
      }
      const c = config(null, 0, undefined);
      expect(c.host).toBe('localhost');
      expect(c.port).toBe(0);
      expect(c.secure).toBe(false);
    };"
  `);
});

test('062 JS Nullish Coalescing > in function parameters > arrow function with ??', async () => {
  const source =
    "() => {\n        const getVal = (x) => x ?? 'default';\n        expect(getVal(null)).toBe('default');\n        expect(getVal(0)).toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const getVal = x => (x !== null && x !== void 0 ? x : 'default');
      expect(getVal(null)).toBe('default');
      expect(getVal(0)).toBe(0);
    };"
  `);
});

test('063 JS Nullish Coalescing > in expressions > ternary on left side', async () => {
  const source =
    "() => {\n        const x = true ? null : 'value';\n        expect(x ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const x = true ? null : 'value';
      expect(x !== null && x !== void 0 ? x : 'default').toBe('default');
    };"
  `);
});

test('064 JS Nullish Coalescing > in expressions > arithmetic on right side', async () => {
  const source = '() => {\n        const x = null ?? 2 + 3;\n        expect(x).toBe(5);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 2 + 3;
      expect(x).toBe(5);
    };"
  `);
});

test('065 JS Nullish Coalescing > in expressions > template literal on right side', async () => {
  const source =
    "() => {\n        const name = null ?? `world`;\n        expect(name).toBe('world');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const name = (_ref = null) !== null && _ref !== void 0 ? _ref : \`world\`;
      expect(name).toBe('world');
    };"
  `);
});

test('066 JS Nullish Coalescing > in expressions > nested ?? in right side', async () => {
  const source =
    "() => {\n        const a = null;\n        const b = undefined;\n        const c = 'found';\n        expect(a ?? b ?? c).toBe('found');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const a = null;
      const b = undefined;
      const c = 'found';
      expect((_ref = a !== null && a !== void 0 ? a : b) !== null && _ref !== void 0 ? _ref : c).toBe(
        'found',
      );
    };"
  `);
});

test('067 JS Nullish Coalescing > in expressions > in return statement', async () => {
  const source =
    "() => {\n        function getValue(obj) {\n          return obj.value ?? 'empty';\n        }\n        expect(getValue({ value: null })).toBe('empty');\n        expect(getValue({ value: 0 })).toBe(0);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function getValue(obj) {
        var _obj$value;
        return (_obj$value = obj.value) !== null && _obj$value !== void 0 ? _obj$value : 'empty';
      }
      expect(getValue({ value: null })).toBe('empty');
      expect(getValue({ value: 0 })).toBe(0);
    };"
  `);
});

test('068 JS Nullish Coalescing > in expressions > in throw expression right side', async () => {
  const source =
    "() => {\n        const val = null;\n        try {\n          const result =\n            val ??\n            (() => {\n              throw new Error('nullish');\n            })();\n          // Should have thrown\n          expect(true).toBe(false);\n        } catch (e) {\n          expect(e.message).toBe('nullish');\n        }\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const val = null;
      try {
        const result =
          val !== null && val !== void 0
            ? val
            : (() => {
                throw new Error('nullish');
              })();
        // Should have thrown
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('nullish');
      }
    };"
  `);
});

test('069 JS Nullish Coalescing > in destructuring > with destructured property', async () => {
  const source =
    "() => {\n        const { a } = { a: null };\n        expect(a ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const { a } = { a: null };
      expect(a !== null && a !== void 0 ? a : 'default').toBe('default');
    };"
  `);
});

test('070 JS Nullish Coalescing > in destructuring > with default destructuring vs ??', async () => {
  const source =
    "() => {\n        // Default destructuring only triggers on undefined, not null\n        const { a = 'destructure-default' } = { a: null };\n        // a is null because destructuring default only applies on undefined\n        expect(a).toBe(null);\n        expect(a ?? 'nullish-default').toBe('nullish-default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      // Default destructuring only triggers on undefined, not null
      const { a = 'destructure-default' } = { a: null };
      // a is null because destructuring default only applies on undefined
      expect(a).toBe(null);
      expect(a !== null && a !== void 0 ? a : 'nullish-default').toBe('nullish-default');
    };"
  `);
});

test('071 JS Nullish Coalescing > in destructuring > with array destructuring', async () => {
  const source =
    "() => {\n        const [a, b] = [null, undefined];\n        expect(a ?? 'first').toBe('first');\n        expect(b ?? 'second').toBe('second');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const [a, b] = [null, undefined];
      expect(a !== null && a !== void 0 ? a : 'first').toBe('first');
      expect(b !== null && b !== void 0 ? b : 'second').toBe('second');
    };"
  `);
});

test('072 JS Nullish Coalescing > in loops and conditionals > in if condition', async () => {
  const source =
    '() => {\n        const x = null;\n        const val = x ?? 0;\n        if (val === 0) {\n          expect(true).toBe(true);\n        } else {\n          expect(true).toBe(false);\n        }\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const x = null;
      const val = x !== null && x !== void 0 ? x : 0;
      if (val === 0) {
        expect(true).toBe(true);
      } else {
        expect(true).toBe(false);
      }
    };"
  `);
});

test('073 JS Nullish Coalescing > in loops and conditionals > in for loop initializer', async () => {
  const source =
    '() => {\n        const values = [];\n        for (let i = null ?? 0; i < 3; i++) {\n          values.push(i);\n        }\n        expect(values).toEqual([0, 1, 2]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      const values = [];
      for (let i = (_ref = null) !== null && _ref !== void 0 ? _ref : 0; i < 3; i++) {
        values.push(i);
      }
      expect(values).toEqual([0, 1, 2]);
    };"
  `);
});

test('074 JS Nullish Coalescing > in loops and conditionals > in while condition', async () => {
  const source =
    "() => {\n        let arr = [1, 2, null, 3];\n        let results = [];\n        let idx = 0;\n        while (idx < arr.length) {\n          results.push(arr[idx] ?? 'nil');\n          idx++;\n        }\n        expect(results).toEqual([1, 2, 'nil', 3]);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      let arr = [1, 2, null, 3];
      let results = [];
      let idx = 0;
      while (idx < arr.length) {
        var _arr$idx;
        results.push((_arr$idx = arr[idx]) !== null && _arr$idx !== void 0 ? _arr$idx : 'nil');
        idx++;
      }
      expect(results).toEqual([1, 2, 'nil', 3]);
    };"
  `);
});

test('075 JS Nullish Coalescing > class contexts > in class method', async () => {
  const source =
    "() => {\n        class Config {\n          constructor(value) {\n            this.value = value ?? 'default';\n          }\n          getValue() {\n            return this.value ?? 'none';\n          }\n        }\n        expect(new Config(null).value).toBe('default');\n        expect(new Config(0).value).toBe(0);\n        expect(new Config(null).getValue()).toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Config {
        constructor(value) {
          this.value = value !== null && value !== void 0 ? value : 'default';
        }
        getValue() {
          var _this$value;
          return (_this$value = this.value) !== null && _this$value !== void 0 ? _this$value : 'none';
        }
      }
      expect(new Config(null).value).toBe('default');
      expect(new Config(0).value).toBe(0);
      expect(new Config(null).getValue()).toBe('default');
    };"
  `);
});

test('076 JS Nullish Coalescing > class contexts > in static method', async () => {
  const source =
    "() => {\n        class Utils {\n          static getDefault(val) {\n            return val ?? 'default';\n          }\n        }\n        expect(Utils.getDefault(null)).toBe('default');\n        expect(Utils.getDefault('')).toBe('');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Utils {
        static getDefault(val) {
          return val !== null && val !== void 0 ? val : 'default';
        }
      }
      expect(Utils.getDefault(null)).toBe('default');
      expect(Utils.getDefault('')).toBe('');
    };"
  `);
});

test('077 JS Nullish Coalescing > class contexts > in getter', async () => {
  const source =
    "() => {\n        class Box {\n          #value;\n          constructor(v) {\n            this.#value = v;\n          }\n          get content() {\n            return this.#value ?? 'empty';\n          }\n        }\n        expect(new Box(null).content).toBe('empty');\n        expect(new Box(0).content).toBe(0);\n        expect(new Box(false).content).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      class Box {
        #value;
        constructor(v) {
          this.#value = v;
        }
        get content() {
          var _this$value;
          return (_this$value = this.#value) !== null && _this$value !== void 0 ? _this$value : 'empty';
        }
      }
      expect(new Box(null).content).toBe('empty');
      expect(new Box(0).content).toBe(0);
      expect(new Box(false).content).toBe(false);
    };"
  `);
});

test('078 JS Nullish Coalescing > edge cases > both sides are null', async () => {
  const source = '() => {\n        expect(null ?? null).toBe(null);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      expect((_ref = null) !== null && _ref !== void 0 ? _ref : null).toBe(null);
    };"
  `);
});

test('079 JS Nullish Coalescing > edge cases > both sides are undefined', async () => {
  const source = '() => {\n        expect(undefined ?? undefined).toBe(undefined);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : undefined).toBe(
        undefined,
      );
    };"
  `);
});

test('080 JS Nullish Coalescing > edge cases > right side is null', async () => {
  const source = '() => {\n        expect(undefined ?? null).toBe(null);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _undefined;
      expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBe(null);
    };"
  `);
});

test('081 JS Nullish Coalescing > edge cases > left side is an expression returning null', async () => {
  const source =
    "() => {\n        expect((1 > 2 ? 'yes' : null) ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      expect((_ref = 1 > 2 ? 'yes' : null) !== null && _ref !== void 0 ? _ref : 'default').toBe(
        'default',
      );
    };"
  `);
});

test('082 JS Nullish Coalescing > edge cases > works with comma operator', async () => {
  const source =
    "() => {\n        let x;\n        const result = ((x = null), x) ?? 'default';\n        expect(result).toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref;
      let x;
      const result = (_ref = ((x = null), x)) !== null && _ref !== void 0 ? _ref : 'default';
      expect(result).toBe('default');
    };"
  `);
});

test('083 JS Nullish Coalescing > edge cases > typeof does not throw for undeclared variable in right side', async () => {
  const source =
    "() => {\n        const result = 'value' ?? undeclaredVar;\n        expect(result).toBe('value');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _value;
      const result = (_value = 'value') !== null && _value !== void 0 ? _value : undeclaredVar;
      expect(result).toBe('value');
    };"
  `);
});

test('084 JS Nullish Coalescing > edge cases > deeply nested nullish coalescing', async () => {
  const source =
    "() => {\n        const a = null ?? null ?? null ?? null ?? 'deep';\n        expect(a).toBe('deep');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref, _ref2, _ref3, _ref4;
      const a =
        (_ref =
          (_ref2 =
            (_ref3 = (_ref4 = null) !== null && _ref4 !== void 0 ? _ref4 : null) !== null &&
            _ref3 !== void 0
              ? _ref3
              : null) !== null && _ref2 !== void 0
            ? _ref2
            : null) !== null && _ref !== void 0
          ? _ref
          : 'deep';
      expect(a).toBe('deep');
    };"
  `);
});

test('085 JS Nullish Coalescing > edge cases > with Map.get()', async () => {
  const source =
    "() => {\n        const map = new Map();\n        map.set('key', 0);\n        expect(map.get('key') ?? 'default').toBe(0);\n        expect(map.get('missing') ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _map$get, _map$get2;
      const map = new Map();
      map.set('key', 0);
      expect((_map$get = map.get('key')) !== null && _map$get !== void 0 ? _map$get : 'default').toBe(
        0,
      );
      expect(
        (_map$get2 = map.get('missing')) !== null && _map$get2 !== void 0 ? _map$get2 : 'default',
      ).toBe('default');
    };"
  `);
});

test('086 JS Nullish Coalescing > edge cases > with WeakRef deref', async () => {
  const source =
    "() => {\n        let obj = { name: 'test' };\n        const ref = new WeakRef(obj);\n        expect(ref.deref() ?? 'collected').toBe(obj);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _ref$deref;
      let obj = { name: 'test' };
      const ref = new WeakRef(obj);
      expect(
        (_ref$deref = ref.deref()) !== null && _ref$deref !== void 0 ? _ref$deref : 'collected',
      ).toBe(obj);
    };"
  `);
});

test('087 JS Nullish Coalescing > edge cases > preserves object identity', async () => {
  const source =
    '() => {\n        const obj = {};\n        const result = obj ?? {};\n        expect(result).toBe(obj);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      const obj = {};
      const result = obj !== null && obj !== void 0 ? obj : {};
      expect(result).toBe(obj);
    };"
  `);
});

test('088 JS Nullish Coalescing > practical patterns > config merging with ??', async () => {
  const source =
    "() => {\n        const defaults = { host: 'localhost', port: 3000, debug: false };\n        const userConfig = { host: null, port: 8080, debug: undefined };\n        const config = {\n          host: userConfig.host ?? defaults.host,\n          port: userConfig.port ?? defaults.port,\n          debug: userConfig.debug ?? defaults.debug,\n        };\n        expect(config.host).toBe('localhost');\n        expect(config.port).toBe(8080);\n        expect(config.debug).toBe(false);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _userConfig$host, _userConfig$port, _userConfig$debug;
      const defaults = {
        host: 'localhost',
        port: 3e3,
        debug: false,
      };
      const userConfig = {
        host: null,
        port: 8080,
        debug: undefined,
      };
      const config = {
        host:
          (_userConfig$host = userConfig.host) !== null && _userConfig$host !== void 0
            ? _userConfig$host
            : defaults.host,
        port:
          (_userConfig$port = userConfig.port) !== null && _userConfig$port !== void 0
            ? _userConfig$port
            : defaults.port,
        debug:
          (_userConfig$debug = userConfig.debug) !== null && _userConfig$debug !== void 0
            ? _userConfig$debug
            : defaults.debug,
      };
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(8080);
      expect(config.debug).toBe(false);
    };"
  `);
});

test('089 JS Nullish Coalescing > practical patterns > safe access with fallback', async () => {
  const source =
    '() => {\n        const response = { data: { users: null } };\n        const users = response.data?.users ?? [];\n        expect(users).toEqual([]);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _response$data$users;
      const response = { data: { users: null } };
      const users =
        (_response$data$users = response.data?.users) !== null && _response$data$users !== void 0
          ? _response$data$users
          : [];
      expect(users).toEqual([]);
    };"
  `);
});

test('090 JS Nullish Coalescing > practical patterns > counting with zero preservation', async () => {
  const source =
    '() => {\n        function getCount(obj) {\n          return obj.count ?? -1;\n        }\n        expect(getCount({ count: 0 })).toBe(0);\n        expect(getCount({ count: 10 })).toBe(10);\n        expect(getCount({})).toBe(-1);\n      }';
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function getCount(obj) {
        var _obj$count;
        return (_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : -1;
      }
      expect(getCount({ count: 0 })).toBe(0);
      expect(getCount({ count: 10 })).toBe(10);
      expect(getCount({})).toBe(-1);
    };"
  `);
});

test('091 JS Nullish Coalescing > practical patterns > DOM-style attribute defaults', async () => {
  const source =
    "() => {\n        const attrs = { tabIndex: 0, disabled: false, id: '' };\n        expect(attrs.tabIndex ?? -1).toBe(0);\n        expect(attrs.disabled ?? false).toBe(false);\n        expect(attrs.id ?? 'auto').toBe('');\n        expect(attrs.className ?? 'default').toBe('default');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      var _attrs$tabIndex, _attrs$disabled, _attrs$id, _attrs$className;
      const attrs = {
        tabIndex: 0,
        disabled: false,
        id: '',
      };
      expect(
        (_attrs$tabIndex = attrs.tabIndex) !== null && _attrs$tabIndex !== void 0
          ? _attrs$tabIndex
          : -1,
      ).toBe(0);
      expect(
        (_attrs$disabled = attrs.disabled) !== null && _attrs$disabled !== void 0
          ? _attrs$disabled
          : false,
      ).toBe(false);
      expect((_attrs$id = attrs.id) !== null && _attrs$id !== void 0 ? _attrs$id : 'auto').toBe('');
      expect(
        (_attrs$className = attrs.className) !== null && _attrs$className !== void 0
          ? _attrs$className
          : 'default',
      ).toBe('default');
    };"
  `);
});

test('092 JS Nullish Coalescing > practical patterns > nested defaults', async () => {
  const source =
    "() => {\n        function getTheme(prefs) {\n          return {\n            color: prefs?.theme?.color ?? prefs?.color ?? 'blue',\n            size: prefs?.theme?.size ?? 16,\n          };\n        }\n        expect(getTheme(null).color).toBe('blue');\n        expect(getTheme({ color: 'red' }).color).toBe('red');\n        expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');\n        expect(getTheme({}).size).toBe(16);\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function getTheme(prefs) {
        var _ref, _prefs$theme$color, _prefs$theme$size;
        return {
          color:
            (_ref =
              (_prefs$theme$color = prefs?.theme?.color) !== null && _prefs$theme$color !== void 0
                ? _prefs$theme$color
                : prefs?.color) !== null && _ref !== void 0
              ? _ref
              : 'blue',
          size:
            (_prefs$theme$size = prefs?.theme?.size) !== null && _prefs$theme$size !== void 0
              ? _prefs$theme$size
              : 16,
        };
      }
      expect(getTheme(null).color).toBe('blue');
      expect(getTheme({ color: 'red' }).color).toBe('red');
      expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');
      expect(getTheme({}).size).toBe(16);
    };"
  `);
});

test('093 JS Nullish Coalescing > practical patterns > error message fallback', async () => {
  const source =
    "() => {\n        function getErrorMessage(error) {\n          return error?.message ?? error?.code ?? 'Unknown error';\n        }\n        expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');\n        expect(getErrorMessage({ code: 404 })).toBe(404);\n        expect(getErrorMessage({})).toBe('Unknown error');\n        expect(getErrorMessage(null)).toBe('Unknown error');\n      }";
  expect(
    await transformOutcome(source, 'input.js', {
      transforms: { nullishCoalescingOperator: { loose: false } },
    }),
  ).toMatchInlineSnapshot(`
    "() => {
      function getErrorMessage(error) {
        var _ref, _error$message;
        return (_ref =
          (_error$message = error?.message) !== null && _error$message !== void 0
            ? _error$message
            : error?.code) !== null && _ref !== void 0
          ? _ref
          : 'Unknown error';
      }
      expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');
      expect(getErrorMessage({ code: 404 })).toBe(404);
      expect(getErrorMessage({})).toBe('Unknown error');
      expect(getErrorMessage(null)).toBe('Unknown error');
    };"
  `);
});
