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
    "import _createForOfIteratorHelper from '@babel/runtime/helpers/createForOfIteratorHelper';
    export function collect(items) {
      const values = [];
      {
        var _iterator = _createForOfIteratorHelper(items),
          _step;
        try {
          for (_iterator.s(); (_step = _iterator.n()), !_step.done;) {
            const value = _step.value;
            values.push(value);
          }
        } catch (_iteratorError2) {
          _iterator.e(_iteratorError2);
        } finally {
          _iterator.f();
        }
      }
      return values;
    }"
  `);
});
