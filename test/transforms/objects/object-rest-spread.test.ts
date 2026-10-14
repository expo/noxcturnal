import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers object rest and spread', async () => {
  const source = `export function rename({ id, ...attributes }, extra) { return { ...attributes, identifier: id, ...extra }; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: {
        destructuring: true,
        objectRestSpread: { loose: true, useBuiltIns: true },
      },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    var _objectWithoutProperties2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
      objectWithoutPropertiesLoose: require('@babel/runtime/helpers/objectWithoutPropertiesLoose'),
      extends: require('@babel/runtime/helpers/extends'),
    };
    function _objectWithoutProperties(e, t) {
      return (
        _objectWithoutProperties2.objectDestructuringEmpty(e),
        t.length
          ? _objectWithoutProperties2.objectWithoutPropertiesLoose(e, t)
          : _objectWithoutProperties2.extends({}, e)
      );
    }
    export function rename() {
      let _obj = _objectDestructuringEmpty(arguments.length > 0 ? arguments[0] : void 0),
        id = _obj.id,
        attributes = _objectWithoutProperties(_obj, ['id']);
      let extra = arguments.length > 1 ? arguments[1] : void 0;
      return Object.assign({}, attributes, { identifier: id }, extra);
    }"
  `);
});
