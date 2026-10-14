import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers for-of loops', async () => {
  const source = `export function collect(items) { const values = []; for (const value of items) values.push(value); return values; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { forOf: true },
    }),
  ).toMatchInlineSnapshot(`
    "export function collect(items) {
      const values = [];
      {
        var _iteratorNormalCompletion = true,
          _didIteratorError = false,
          _iteratorError,
          _iteratorReturnMethod,
          _iteratorReturn;
        try {
          for (
            var _iterator = items[Symbol.iterator](),
              _iteratorNext = _iterator.next,
              _iteratorCall = function () {}.call,
              _step;
            (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;
            _iteratorNormalCompletion = true
          ) {
            if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');
            _iteratorNormalCompletion = false;
            const value = _step.value;
            values.push(value);
          }
        } catch (_iteratorError2) {
          _didIteratorError = true;
          _iteratorError = _iteratorError2;
        } finally {
          try {
            if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {
              _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);
              if (Object(_iteratorReturn) !== _iteratorReturn)
                throw new TypeError('Iterator result is not an object');
            }
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
      }
      return values;
    }"
  `);
});
