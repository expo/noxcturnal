import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _ref, _undefined, _false, _, _ref2, _obj$exists, _obj$doesNotExist, _sideEffect, _obj2$foo;\nexpect((_ref = null) !== null && _ref !== void 0 ? _ref : undefined).toBeUndefined(undefined);\nexpect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBeNull();\nexpect((_false = false) !== null && _false !== void 0 ? _false : true).toBe(false);\nexpect((_ = 0) !== null && _ !== void 0 ? _ : 1).toBe(0);\nexpect((_ref2 = '') !== null && _ref2 !== void 0 ? _ref2 : 'foo').toBe('');\nvar obj = { exists: true };\nexpect((_obj$exists = obj.exists) !== null && _obj$exists !== void 0 ? _obj$exists : false).toBe(\n  true,\n);\nexpect(\n  (_obj$doesNotExist = obj.doesNotExist) !== null && _obj$doesNotExist !== void 0\n    ? _obj$doesNotExist\n    : 'foo',\n).toBe('foo');\nvar counter = 0;\nfunction sideEffect() {\n  return counter++;\n}\nexpect((_sideEffect = sideEffect()) !== null && _sideEffect !== void 0 ? _sideEffect : -1).toBe(0);\nvar counter2 = 0;\nvar obj2 = {\n  get foo() {\n    return counter2++;\n  },\n};\nexpect((_obj2$foo = obj2.foo) !== null && _obj2$foo !== void 0 ? _obj2$foo : -1).toBe(0);",
  "var _foo$bar;\nvar { qux = (_foo$bar = foo.bar) !== null && _foo$bar !== void 0 ? _foo$bar : 'qux' } = {};",
  "function foo(\n  foo,\n  qux = (_foo$bar => ((_foo$bar = foo.bar) !== null && _foo$bar !== void 0 ? _foo$bar : 'qux'))(),\n) {}\nfunction bar(bar, qux = bar !== null && bar !== void 0 ? bar : 'qux') {}",
  "function foo(opts) {\n  var _opts$foo;\n  var foo = (_opts$foo = opts.foo) !== null && _opts$foo !== void 0 ? _opts$foo : 'default';\n}",
  "function foo(foo, bar = foo !== null && foo !== void 0 ? foo : 'bar') {}",
  'function foo() {\n  var foo = this !== null && this !== void 0 ? this : {};\n}',
  "globalThis ??= {};\nglobalThis.a ??= 1;\nglobalThis['b'] ??= 2;",
  "let o;\no ??= {};\no.a ??= 1;\no['b'] ??= 2;",
  "var _ref, _undefined, _false, _, _ref2, _obj$exists, _obj$doesNotExist, _sideEffect, _obj2$foo;\nexpect((_ref = null) !== null && _ref !== void 0 ? _ref : undefined).toBeUndefined(undefined);\nexpect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBeNull();\nexpect((_false = false) !== null && _false !== void 0 ? _false : true).toBe(false);\nexpect((_ = 0) !== null && _ !== void 0 ? _ : 1).toBe(0);\nexpect((_ref2 = '') !== null && _ref2 !== void 0 ? _ref2 : 'foo').toBe('');\nvar obj = { exists: true };\nexpect((_obj$exists = obj.exists) !== null && _obj$exists !== void 0 ? _obj$exists : false).toBe(\n  true,\n);\nexpect(\n  (_obj$doesNotExist = obj.doesNotExist) !== null && _obj$doesNotExist !== void 0\n    ? _obj$doesNotExist\n    : 'foo',\n).toBe('foo');\nvar counter = 0;\nfunction sideEffect() {\n  return counter++;\n}\nexpect((_sideEffect = sideEffect()) !== null && _sideEffect !== void 0 ? _sideEffect : -1).toBe(0);\nvar counter2 = 0;\nvar obj2 = {\n  get foo() {\n    return counter2++;\n  },\n};\nexpect((_obj2$foo = obj2.foo) !== null && _obj2$foo !== void 0 ? _obj2$foo : -1).toBe(0);\ntry {\n  var _a;\n  var access_a = 0;\n  Object.assign(globalThis, {\n    get a() {\n      access_a++;\n    },\n  });\n  (_a = a) !== null && _a !== void 0 ? _a : {};\n  expect(access_a).toBe(1);\n} finally {\n  delete globalThis.a;\n}",
  'var _ref, _ref2, _ref3, _ref4;\nvar a, b, c, d, e;\n(_ref =\n  (_ref2 =\n    (_ref3 =\n      (_ref4 = a !== null && a !== void 0 ? a : b) !== null && _ref4 !== void 0 ? _ref4 : c) !==\n      null && _ref3 !== void 0\n      ? _ref3\n      : d) !== null && _ref2 !== void 0\n    ? _ref2\n    : e) !== null && _ref !== void 0\n  ? _ref\n  : 1;',
  'var _globalThis, _a;\n(_globalThis = globalThis) !== null && _globalThis !== void 0 ? _globalThis : window;\n(_a = a) !== null && _a !== void 0 ? _a : b;',
] as const;

export const fixtureCases = [
  {
    title: 'assumption noDocumentAll — runtime semantics (exec)',
    source:
      'expect(null ?? undefined).toBeUndefined(undefined);\nexpect(undefined ?? null).toBeNull();\nexpect(false ?? true).toBe(false);\nexpect(0 ?? 1).toBe(0);\nexpect("" ?? "foo").toBe("");\n\nvar obj = { exists: true };\nexpect(obj.exists ?? false).toBe(true);\nexpect(obj.doesNotExist ?? "foo").toBe("foo");\n\nvar counter = 0;\nfunction sideEffect() { return counter++; }\nexpect(sideEffect() ?? -1).toBe(0);\n\nvar counter2 = 0;\nvar obj2 = {\n    get foo() { return counter2++; }\n};\nexpect(obj2.foo ?? -1).toBe(0);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in default destructuring (input)',
    source: 'var { qux = foo.bar ?? "qux" } = {};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[1],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in default param (input)',
    source:
      'function foo(foo, qux = foo.bar ?? "qux") {}\n\nfunction bar(bar, qux = bar ?? "qux") {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in function (input)',
    source: 'function foo(opts) {\n  var foo = opts.foo ?? "default";\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[3],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform static refs in default (input)',
    source: 'function foo(foo, bar = foo ?? "bar") {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform static refs in function (input)',
    source: 'function foo() {\n  var foo = this ?? {};\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption pureGetters — logical assignment undeclared (input)',
    source: 'globalThis ??= {};\nglobalThis.a ??= 1;\nglobalThis["b"] ??= 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[6],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption pureGetters — logical assignment (input)',
    source: 'let o;\no ??= {};\no.a ??= 1;\no["b"] ??= 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'nullish coalescing — runtime semantics (exec)',
    source:
      'expect(null ?? undefined).toBeUndefined(undefined);\nexpect(undefined ?? null).toBeNull();\nexpect(false ?? true).toBe(false);\nexpect(0 ?? 1).toBe(0);\nexpect("" ?? "foo").toBe("");\n\nvar obj = { exists: true };\nexpect(obj.exists ?? false).toBe(true);\nexpect(obj.doesNotExist ?? "foo").toBe("foo");\n\nvar counter = 0;\nfunction sideEffect() { return counter++; }\nexpect(sideEffect() ?? -1).toBe(0);\n\nvar counter2 = 0;\nvar obj2 = {\n    get foo() { return counter2++; }\n};\nexpect(obj2.foo ?? -1).toBe(0);\n\ntry {\n  var access_a = 0;\n  Object.assign(globalThis, { get a() { access_a++ } });\n  a ?? {};\n  expect(access_a).toBe(1);\n} finally {\n  delete globalThis.a;\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[8],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'nullish coalescing — transform many (input)',
    source: 'var a, b, c, d, e;\na ?? b ?? c ?? d ?? e ?? 1;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
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
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'nullish coalescing — undeclared (input)',
    source: 'globalThis ?? window;\na ?? b;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: false,
            },
          },
        },
        output: expectedOutputs[10],
      },
      {
        title: 'loose',
        options: {
          transforms: {
            nullishCoalescingOperator: {
              loose: true,
            },
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
