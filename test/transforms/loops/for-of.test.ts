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
          _iteratorError;
        try {
          for (
            var _iterator = items[Symbol.iterator](), _step;
            !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
            _iteratorNormalCompletion = true
          ) {
            const value = _step.value;
            values.push(value);
          }
        } catch (_iteratorError2) {
          _didIteratorError = true;
          _iteratorError = _iteratorError2;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) _iterator.return();
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
      }
      return values;
    }"
  `);
});
