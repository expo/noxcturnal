import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers named capture groups', async () => {
  expect(
    await transformSource(`export const matcher = /(?<word>a+)/;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _babelHelper from '@babel/runtime/helpers/wrapRegExp';
    var _wrapRegExp2 = { wrapRegExp: _babelHelper },
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
    "import _babelHelper from '@babel/runtime/helpers/wrapRegExp';
    var _wrapRegExp2 = { wrapRegExp: _babelHelper },
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
    "import _babelHelper from '@babel/runtime/helpers/wrapRegExp';
    var _wrapRegExp2 = { wrapRegExp: _babelHelper },
      _wrapRegExp = _wrapRegExp2.wrapRegExp;
    export const matcher = _wrapRegExp(/(?:(a)|(b))\\1\\2/, { word: [1, 2] });"
  `);
});

test('uses structural spans for escaped syntax, lookbehind, nesting, and Unicode names', async () => {
  const output = await transformSource(
    String.raw`export const matcher = /(?<=\[)(?:(?<\u0061>a)|(?<deep>(?:b\.|c\\)+))\k<\u0061>\k<deep>\]/;`,
    'input.js',
    {
      helpers: runtimeHelpers,
      transforms: { regexpNamedCaptureGroups: true },
    },
  );
  expect(output).toContain(String.raw`/(?<=\[)(?:(a)|((?:b\.|c\\)+))\1\2\]/`);
  expect(output).toMatch(/\{\s+a: 1,\s+deep: 2,?\s+\}/u);
});
