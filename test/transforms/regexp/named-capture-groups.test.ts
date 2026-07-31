import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers named capture groups', async () => {
  expect(
    await transformSource(`export const matcher = /(?<word>a+)/;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    export const matcher = _wrapRegExp(/(a+)/, { word: 1 });"
  `);
});
