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

test('lowers forward named backreferences after discovering all capture numbers', async () => {
  expect(
    await transformSource(String.raw`export const matcher = /\k<word>(?<word>a)/;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    export const matcher = _wrapRegExp(/\\1(a)/, { word: 1 });"
  `);
});

test('lowers duplicate named groups in parser-approved alternatives', async () => {
  expect(
    await transformSource(
      String.raw`export const matcher = /(?:(?<word>a)|(?<word>b))\k<word>/;`,
      'input.js',
      {
        helpers: runtimeHelpers,
        transforms: { regexpNamedCaptureGroups: true },
      },
    ),
  ).toMatchInlineSnapshot(`
    "var _wrapRegExp2 = { wrapRegExp: require('@babel/runtime/helpers/wrapRegExp') },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    export const matcher = _wrapRegExp(/(?:(a)|(b))\\1\\2/, { word: [1, 2] });"
  `);
});
