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
    "var _toArray2 = {
      slicedToArray: require('@babel/runtime/helpers/slicedToArray'),
      toArray: require('@babel/runtime/helpers/toArray'),
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
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
