import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers async generators stored in class fields and static blocks', async () => {
  const source = `
    export class Streams {
      values = async function* (items) { for await (const item of items) yield item; };
      static { this.values = async function* () { yield await Promise.resolve(1); }; }
    }
  `;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: {
        classProperties: { loose: true },
        classStaticBlock: true,
        asyncGeneratorFunctions: true,
      },
    }),
  ).toMatchInlineSnapshot(`
    "import _asyncIterator from '@babel/runtime/helpers/asyncIterator';
    import _awaitAsyncGenerator from '@babel/runtime/helpers/awaitAsyncGenerator';
    import _wrapAsyncGenerator from '@babel/runtime/helpers/wrapAsyncGenerator';
    var _Streams;
    export class Streams {
      constructor() {
        this.values = /* @__PURE__ */ (function () {
          var _ref = _wrapAsyncGenerator(function* (items) {
            var _iteratorAbruptCompletion = false;
            var _didIteratorError = false;
            var _iteratorError;
            try {
              for (
                var _iterator = _asyncIterator(items), _step;
                (_iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next()))
                  .done);
                _iteratorAbruptCompletion = false
              ) {
                const item = _step.value;
                yield item;
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (_iteratorAbruptCompletion && _iterator.return != null) {
                  yield _awaitAsyncGenerator(_iterator.return());
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          });
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })();
      }
    }
    _Streams = Streams;
    _Streams.values = _wrapAsyncGenerator(function* () {
      yield yield _awaitAsyncGenerator(Promise.resolve(1));
    });"
  `);
});

test('preserves captured per-iteration bindings in for-await loops', async () => {
  const source = `
    export async function collect(items) {
      const callbacks = [];
      for await (let item of items) callbacks.push(() => item);
      return callbacks.map(read => read());
    }
  `;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: {
        blockScoping: true,
        asyncGeneratorFunctions: true,
        asyncFunctions: true,
      },
    }),
  ).toMatchInlineSnapshot(`
    "import _asyncIterator from '@babel/runtime/helpers/asyncIterator';
    import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    function _iteratorResult(value) {
      if (Object(value) !== value) throw new TypeError('Iterator result is not an object');
      return value;
    }
    export function collect(_x) {
      return _collect.apply(this, arguments);
    }
    function _collect() {
      _collect = _asyncToGenerator(function* (items) {
        var callbacks = [];
        var _loopResult;
        var _loop = item => {
          callbacks.push(() => item);
          return {
            type: 'normal',
            vars: [item],
          };
        };
        var _iteratorAbruptCompletion = false;
        var _didIteratorError = false;
        var _iteratorError;
        try {
          for (
            var _iterator = _asyncIterator(items), _step;
            (_iteratorAbruptCompletion = !(_step = _iteratorResult(yield _iterator.next())).done);
            _iteratorAbruptCompletion = false
          ) {
            var item = _step.value;
            {
              _loopResult = _loop(item);
              item = _loopResult.vars[0];
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (_iteratorAbruptCompletion && _iterator.return != null) {
              _iteratorResult(yield _iterator.return());
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
        return callbacks.map(read => read());
      });
      return _collect.apply(this, arguments);
    }"
  `);
});

test('lowers await-using while preserving surrounding completion paths', async () => {
  const source = `
    export async function read(acquire) {
      try {
        await using resource = await acquire();
        return await resource.read();
      } catch (error) {
        return error;
      } finally {
        finished();
      }
    }
  `;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { explicitResourceManagement: true, asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _usingCtx2 from '@babel/runtime/helpers/usingCtx';
    import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    export function read(_x) {
      return _read.apply(this, arguments);
    }
    function _read() {
      _read = _asyncToGenerator(function* (acquire) {
        try {
          try {
            var _usingCtx = _usingCtx2();
            const resource = _usingCtx.a(yield acquire());
            return yield resource.read();
          } catch (_) {
            _usingCtx.e = _;
          } finally {
            yield _usingCtx.d();
          }
        } catch (error) {
          return error;
        } finally {
          finished();
        }
      });
      return _read.apply(this, arguments);
    }"
  `);
});
