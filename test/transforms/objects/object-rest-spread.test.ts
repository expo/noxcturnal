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
    "const _excluded = ['id'];
    import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutPropertiesLoose';
    export function rename(_ref, extra) {
      let { id } = _ref,
        attributes = _objectWithoutProperties(_ref, _excluded);
      return Object.assign({}, attributes, { identifier: id }, extra);
    }"
  `);
});
