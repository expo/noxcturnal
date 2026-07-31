import { expect, test } from 'vitest';
import { transformOutcome, transformSource } from '../transform';

test('emits compact output', async () => {
  expect(
    await transformSource(`export function value() { return 1 + 2; }`, 'input.js', {
      compact: true,
    }),
  ).toMatchInlineSnapshot(`
    "export function value() {
      return 1 + 2;
    }"
  `);
});

test('preserves comments by default', async () => {
  expect(await transformSource(`// leading\nexport const value = 1; // trailing`, 'input.js', {}))
    .toMatchInlineSnapshot(`
    "// leading
    export const value = 1; // trailing"
  `);
});

test('removes comments when requested', async () => {
  expect(
    await transformSource(`// leading\nexport const value = 1; // trailing`, 'input.js', {
      comments: false,
    }),
  ).toMatchInlineSnapshot(`"export const value = 1;"`);
});

test('rejects a runtime module with an incompatible helper ABI', async () => {
  expect(
    await transformOutcome(`export async function value() { await work(); }`, 'input.js', {
      helpers: { mode: 'runtime', moduleName: 'custom-runtime', version: '7.29.7' },
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`"[bailout] preflight:helper-runtime-module-unsupported:custom-runtime"`);
});

test('materializes inline helpers', async () => {
  expect(
    await transformSource(`export async function value() { await work(); }`, 'input.js', {
      helpers: { mode: 'inline' },
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
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
    export function value() {
      return _value.apply(this, arguments);
    }
    function _value() {
      _value = babelHelpers.asyncToGenerator(function* () {
        yield work();
      });
      return _value.apply(this, arguments);
    }"
  `);
});
