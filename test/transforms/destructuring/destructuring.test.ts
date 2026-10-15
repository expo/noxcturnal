import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers destructuring', async () => {
  const source = `const { value } = record; const [first] = values; export { value, first };`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _babelHelper from '@babel/runtime/helpers/slicedToArray';
    import _babelHelper2 from '@babel/runtime/helpers/toArray';
    import _babelHelper3 from '@babel/runtime/helpers/objectDestructuringEmpty';
    var _toArray2 = {
      slicedToArray: _babelHelper,
      toArray: _babelHelper2,
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper3 };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    const _ref = record,
      _obj = _objectDestructuringEmpty(_ref),
      value = _obj.value;
    const _ref10 = values,
      _arr = _toArray(_ref10, 1, false),
      first = _arr[0];
    export { value, first };"
  `);
});

test('accepts defaults nested in a for-of binding pattern', async () => {
  const source = `export function entries({ params = {} } = {}) {
  const result = [];
  for (const [key, value = ''] of Object.entries(params)) result.push([key, value]);
  return result;
}`;
  const output = await transformSource(source, 'input.js', {
    helpers: runtimeHelpers,
    transforms: { blockScoping: true, destructuring: true, parameters: true },
  });
  expect(output).toMatch(/value = (_value\d+) === void 0 \? '' : \1/);
  expect(output).not.toContain('= void 0 of');
});
