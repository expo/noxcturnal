import { expect, test } from 'vitest';
import type { PreflightPlan } from '../../../js';
import { runtimeHelpers, transformSource } from '../transform';

const asyncArrowPlan = {
  helpers: runtimeHelpers,
  transforms: { asyncFunctions: true as const, parameters: true as const },
};

const nonSimpleCases = [
  ['object destructuring', 'const read = async ({ value }) => await value;'],
  [
    'renamed and defaulted binding',
    'const read = async ({ value: result = fallback() }) => result;',
  ],
  ['array destructuring', 'const read = async ([first, second]) => first + second;'],
  ['array rest binding', 'const read = async ([first, ...rest]) => [first, rest];'],
  ['default with side effects', 'const read = async (value = compute()) => value;'],
  ['rest parameter', 'const read = async (...values) => values.length;'],
  [
    'mixed parameters',
    'const read = async (first, { second }, third = 3, ...rest) => [first, second, third, rest];',
  ],
  ['block body', 'const read = async ({ value }) => { const next = value + 1; return next; };'],
];

test('lowers every non-simple async-arrow parameter shape', async () => {
  const outputs = await Promise.all(
    nonSimpleCases.map(async ([name, source]) => ({
      name,
      output: await transformSource(source, 'input.js', asyncArrowPlan),
    })),
  );
  expect(outputs).toMatchInlineSnapshot(`
    [
      {
        "name": "object destructuring",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      return yield value;
    });",
      },
      {
        "name": "renamed and defaulted binding",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let { value: result = fallback() } = arguments.length > 0 ? arguments[0] : void 0;
      return result;
    });",
      },
      {
        "name": "array destructuring",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let [first, second] = arguments.length > 0 ? arguments[0] : void 0;
      return first + second;
    });",
      },
      {
        "name": "array rest binding",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let [first, ...rest] = arguments.length > 0 ? arguments[0] : void 0;
      return [first, rest];
    });",
      },
      {
        "name": "default with side effects",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let value = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : compute();
      return value;
    });",
      },
      {
        "name": "rest parameter",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      for (var _len = arguments.length, values = [], _key = 0; _key < _len; _key++) {
        values[_key - 0] = arguments[_key];
      }
      return values.length;
    });",
      },
      {
        "name": "mixed parameters",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = /* @__PURE__ */ (function () {
      var _ref = _asyncToGenerator(function* (first) {
        let { second } = arguments.length > 1 ? arguments[1] : void 0;
        let third = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 3;
        for (var _len = arguments.length, rest = [], _key = 3; _key < _len; _key++) {
          rest[_key - 3] = arguments[_key];
        }
        return [first, second, third, rest];
      });
      return function read(_x) {
        return _ref.apply(this, arguments);
      };
    })();",
      },
      {
        "name": "block body",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      const next = value + 1;
      return next;
    });",
      },
    ]
  `);
});

test('preserves async-arrow call semantics and function length', async () => {
  const output = await transformSource(
    `
      globalThis.read = async (first, second = sideEffect(), ...rest) => [first, second, rest];
      globalThis.length = globalThis.read.length;
    `,
    'input.js',
    { ...asyncArrowPlan, helpers: { mode: 'inline' } },
  );
  expect(output).toMatchInlineSnapshot(`
    "var babelHelpers = (() => {
      var y = {
          asyncToGenerator: function (r, u) {
            function x(i, f, p, o, a, s, e) {
              try {
                var n = i[s](e),
                  t = n.value;
              } catch (d) {
                return void p(d);
              }
              n.done ? f(t) : Promise.resolve(t).then(o, a);
            }
            function h(i) {
              return function () {
                var f = this,
                  p = arguments;
                return new Promise(function (o, a) {
                  var s = i.apply(f, p);
                  function e(t) {
                    x(s, o, a, e, n, 'next', t);
                  }
                  function n(t) {
                    x(s, o, a, e, n, 'throw', t);
                  }
                  e(void 0);
                });
              };
            }
            ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
          },
        },
        c = {};
      function v(r) {
        if (c[r]) return c[r].exports;
        var u = (c[r] = { exports: {} });
        return (y[r](u, v), u.exports);
      }
      return { asyncToGenerator: v('asyncToGenerator') };
    })();
    globalThis.read = /* @__PURE__ */ (function () {
      var _ref = babelHelpers.asyncToGenerator(function* (first) {
        let second = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : sideEffect();
        for (var _len = arguments.length, rest = [], _key = 2; _key < _len; _key++) {
          rest[_key - 2] = arguments[_key];
        }
        return [first, second, rest];
      });
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })();
    globalThis.length = globalThis.read.length;"
  `);

  let effects = 0;
  const context: Record<string, unknown> = {};
  new Function('globalThis', 'sideEffect', output)(context, () => ++effects);
  const read = context.read as (...values: unknown[]) => Promise<unknown>;
  await expect(read('first')).resolves.toEqual(['first', 1, []]);
  expect(context.length).toBe(1);
  expect(effects).toBe(1);
});

const controlCases = [
  ['simple async arrow', 'const read = async (first, second) => first + second;'],
  ['parameterless async arrow', 'const read = async () => 42;'],
  ['synchronous arrow', 'const read = ({ value }) => value;'],
  ['async declaration', 'async function read({ value }) { return value; }'],
  ['async expression', 'const read = async function ({ value }) { return value; };'],
  ['async class method', 'class Reader { async read({ value }) { return value; } }'],
  ['async object method', 'const reader = { async read({ value }) { return value; } };'],
];

test('handles controls outside non-simple async arrows', async () => {
  const outputs = await Promise.all(
    controlCases.map(async ([name, source]) => ({
      name,
      output: await transformSource(source, 'input.js', asyncArrowPlan),
    })),
  );
  expect(outputs).toMatchInlineSnapshot(`
    [
      {
        "name": "simple async arrow",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = (function () {
      var _ref = _asyncToGenerator(function* (first, second) {
        return first + second;
      });
      return function read(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })();",
      },
      {
        "name": "parameterless async arrow",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = (function () {
      var _ref = _asyncToGenerator(function* () {
        return 42;
      });
      return function read() {
        return _ref.apply(this, arguments);
      };
    })();",
      },
      {
        "name": "synchronous arrow",
        "output": "const read = function () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      return value;
    };",
      },
      {
        "name": "async declaration",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    function read() {
      return _read.apply(this, arguments);
    }
    function _read() {
      _read = _asyncToGenerator(function* () {
        let { value } = arguments.length > 0 ? arguments[0] : void 0;
        return value;
      });
      return _read.apply(this, arguments);
    }",
      },
      {
        "name": "async expression",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      return value;
    });",
      },
      {
        "name": "async class method",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    class Reader {
      read() {
        var _arguments = arguments;
        return _asyncToGenerator(function* () {
          let { value } = _arguments.length > 0 ? _arguments[0] : void 0;
          return value;
        })();
      }
    }",
      },
      {
        "name": "async object method",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const reader = {
      read() {
        var _arguments = arguments;
        return _asyncToGenerator(function* () {
          let { value } = _arguments.length > 0 ? _arguments[0] : void 0;
          return value;
        })();
      },
    };",
      },
    ]
  `);
});

const typedCases: ReadonlyArray<readonly [string, string, string, PreflightPlan]> = [
  [
    'TypeScript',
    'input.ts',
    'const read = async ({ value }: { value: Promise<number> }): Promise<number> => await value;',
    { ...asyncArrowPlan, typescript: 'strip' as const },
  ],
  [
    'Flow',
    'input.js',
    '// @flow\nconst read = async ({ value }: { value: Promise<number> }): Promise<number> => await value;',
    asyncArrowPlan,
  ],
];

test('lowers TypeScript and Flow annotations around async-arrow parameters', async () => {
  const outputs = await Promise.all(
    typedCases.map(async ([name, filename, source, plan]) => ({
      name,
      output: await transformSource(source, filename, plan),
    })),
  );
  expect(outputs).toMatchInlineSnapshot(`
    [
      {
        "name": "TypeScript",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    const read = _asyncToGenerator(function* () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      return yield value;
    });",
      },
      {
        "name": "Flow",
        "output": "var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
    // @flow
    const read = _asyncToGenerator(function* () {
      let { value } = arguments.length > 0 ? arguments[0] : void 0;
      return yield value;
    });",
      },
    ]
  `);
});
