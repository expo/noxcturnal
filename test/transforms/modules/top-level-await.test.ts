import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('preserves top-level await as module syntax', async () => {
  const source = `export const value = await load();`;
  expect(await transformSource(source, 'input.mjs', {})).toMatchInlineSnapshot(
    `"export const value = await load();"`,
  );
});

test('preserves top-level await while lowering unrelated syntax', async () => {
  const source = `export const { value } = await load();`;
  expect(
    await transformSource(source, 'input.mjs', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "var _objectDestructuringEmpty2 = {
      objectDestructuringEmpty: require('@babel/runtime/helpers/objectDestructuringEmpty'),
    };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    export const _ref = await load(),
      _obj = _objectDestructuringEmpty(_ref),
      value = _obj.value;"
  `);
});
