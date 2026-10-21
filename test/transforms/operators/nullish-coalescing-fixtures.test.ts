import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption noDocumentAll — runtime semantics (exec)',
    source: `expect(null ?? undefined).toBeUndefined(undefined);
expect(undefined ?? null).toBeNull();
expect(false ?? true).toBe(false);
expect(0 ?? 1).toBe(0);
expect("" ?? "foo").toBe("");

var obj = { exists: true };
expect(obj.exists ?? false).toBe(true);
expect(obj.doesNotExist ?? "foo").toBe("foo");

var counter = 0;
function sideEffect() { return counter++; }
expect(sideEffect() ?? -1).toBe(0);

var counter2 = 0;
var obj2 = {
    get foo() { return counter2++; }
};
expect(obj2.foo ?? -1).toBe(0);
`,
    filename: 'exec.js',
    output: `var _ref, _undefined, _false, _, _ref2, _obj$exists, _obj$doesNotExist, _sideEffect, _obj2$foo;
expect((_ref = null) !== null && _ref !== void 0 ? _ref : undefined).toBeUndefined(undefined);
expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBeNull();
expect((_false = false) !== null && _false !== void 0 ? _false : true).toBe(false);
expect((_ = 0) !== null && _ !== void 0 ? _ : 1).toBe(0);
expect((_ref2 = '') !== null && _ref2 !== void 0 ? _ref2 : 'foo').toBe('');
var obj = { exists: true };
expect((_obj$exists = obj.exists) !== null && _obj$exists !== void 0 ? _obj$exists : false).toBe(
  true,
);
expect(
  (_obj$doesNotExist = obj.doesNotExist) !== null && _obj$doesNotExist !== void 0
    ? _obj$doesNotExist
    : 'foo',
).toBe('foo');
var counter = 0;
function sideEffect() {
  return counter++;
}
expect((_sideEffect = sideEffect()) !== null && _sideEffect !== void 0 ? _sideEffect : -1).toBe(0);
var counter2 = 0;
var obj2 = {
  get foo() {
    return counter2++;
  },
};
expect((_obj2$foo = obj2.foo) !== null && _obj2$foo !== void 0 ? _obj2$foo : -1).toBe(0);`,
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in default destructuring (input)',
    source: `var { qux = foo.bar ?? "qux" } = {};
`,
    filename: 'input.js',
    output: `var _foo$bar;
var { qux = (_foo$bar = foo.bar) !== null && _foo$bar !== void 0 ? _foo$bar : 'qux' } = {};`,
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in default param (input)',
    source: `function foo(foo, qux = foo.bar ?? "qux") {}

function bar(bar, qux = bar ?? "qux") {}
`,
    filename: 'input.js',
    output: `function foo(
  foo,
  qux = (_foo$bar => ((_foo$bar = foo.bar) !== null && _foo$bar !== void 0 ? _foo$bar : 'qux'))(),
) {}
function bar(bar, qux = bar !== null && bar !== void 0 ? bar : 'qux') {}`,
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform in function (input)',
    source: `function foo(opts) {
  var foo = opts.foo ?? "default";
}
`,
    filename: 'input.js',
    output: `function foo(opts) {
  var _opts$foo;
  var foo = (_opts$foo = opts.foo) !== null && _opts$foo !== void 0 ? _opts$foo : 'default';
}`,
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform static refs in default (input)',
    source: `function foo(foo, bar = foo ?? "bar") {}
`,
    filename: 'input.js',
    output: "function foo(foo, bar = foo !== null && foo !== void 0 ? foo : 'bar') {}",
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
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — transform static refs in function (input)',
    source: `function foo() {
  var foo = this ?? {};
}
`,
    filename: 'input.js',
    output: `function foo() {
  var foo = this !== null && this !== void 0 ? this : {};
}`,
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
      },
    ],
  },
  {
    title: 'assumption pureGetters — logical assignment undeclared (input)',
    source: `globalThis ??= {};
globalThis.a ??= 1;
globalThis["b"] ??= 2;
`,
    filename: 'input.js',
    output: `globalThis ??= {};
globalThis.a ??= 1;
globalThis['b'] ??= 2;`,
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
      },
    ],
  },
  {
    title: 'assumption pureGetters — logical assignment (input)',
    source: `let o;
o ??= {};
o.a ??= 1;
o["b"] ??= 2;
`,
    filename: 'input.js',
    output: `let o;
o ??= {};
o.a ??= 1;
o['b'] ??= 2;`,
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
      },
    ],
  },
  {
    title: 'nullish coalescing — runtime semantics (exec)',
    source: `expect(null ?? undefined).toBeUndefined(undefined);
expect(undefined ?? null).toBeNull();
expect(false ?? true).toBe(false);
expect(0 ?? 1).toBe(0);
expect("" ?? "foo").toBe("");

var obj = { exists: true };
expect(obj.exists ?? false).toBe(true);
expect(obj.doesNotExist ?? "foo").toBe("foo");

var counter = 0;
function sideEffect() { return counter++; }
expect(sideEffect() ?? -1).toBe(0);

var counter2 = 0;
var obj2 = {
    get foo() { return counter2++; }
};
expect(obj2.foo ?? -1).toBe(0);

try {
  var access_a = 0;
  Object.assign(globalThis, { get a() { access_a++ } });
  a ?? {};
  expect(access_a).toBe(1);
} finally {
  delete globalThis.a;
}
`,
    filename: 'exec.js',
    output: `var _ref, _undefined, _false, _, _ref2, _obj$exists, _obj$doesNotExist, _sideEffect, _obj2$foo;
expect((_ref = null) !== null && _ref !== void 0 ? _ref : undefined).toBeUndefined(undefined);
expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBeNull();
expect((_false = false) !== null && _false !== void 0 ? _false : true).toBe(false);
expect((_ = 0) !== null && _ !== void 0 ? _ : 1).toBe(0);
expect((_ref2 = '') !== null && _ref2 !== void 0 ? _ref2 : 'foo').toBe('');
var obj = { exists: true };
expect((_obj$exists = obj.exists) !== null && _obj$exists !== void 0 ? _obj$exists : false).toBe(
  true,
);
expect(
  (_obj$doesNotExist = obj.doesNotExist) !== null && _obj$doesNotExist !== void 0
    ? _obj$doesNotExist
    : 'foo',
).toBe('foo');
var counter = 0;
function sideEffect() {
  return counter++;
}
expect((_sideEffect = sideEffect()) !== null && _sideEffect !== void 0 ? _sideEffect : -1).toBe(0);
var counter2 = 0;
var obj2 = {
  get foo() {
    return counter2++;
  },
};
expect((_obj2$foo = obj2.foo) !== null && _obj2$foo !== void 0 ? _obj2$foo : -1).toBe(0);
try {
  var _a;
  var access_a = 0;
  Object.assign(globalThis, {
    get a() {
      access_a++;
    },
  });
  (_a = a) !== null && _a !== void 0 ? _a : {};
  expect(access_a).toBe(1);
} finally {
  delete globalThis.a;
}`,
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
      },
    ],
  },
  {
    title: 'nullish coalescing — transform many (input)',
    source: `var a, b, c, d, e;
a ?? b ?? c ?? d ?? e ?? 1;
`,
    filename: 'input.js',
    output: `var _ref, _ref2, _ref3, _ref4;
var a, b, c, d, e;
(_ref =
  (_ref2 =
    (_ref3 =
      (_ref4 = a !== null && a !== void 0 ? a : b) !== null && _ref4 !== void 0 ? _ref4 : c) !==
      null && _ref3 !== void 0
      ? _ref3
      : d) !== null && _ref2 !== void 0
    ? _ref2
    : e) !== null && _ref !== void 0
  ? _ref
  : 1;`,
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
      },
    ],
  },
  {
    title: 'nullish coalescing — undeclared (input)',
    source: `globalThis ?? window;
a ?? b;
`,
    filename: 'input.js',
    output: `var _globalThis, _a;
(_globalThis = globalThis) !== null && _globalThis !== void 0 ? _globalThis : window;
(_a = a) !== null && _a !== void 0 ? _a : b;`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
