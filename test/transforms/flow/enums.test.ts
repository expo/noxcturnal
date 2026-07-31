import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow enums', async () => {
  const source = `/** @flow */
enum Status { Active, Off }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    const Status = require('flow-enums-runtime').Mirrored(['Active', 'Off']);"
  `);
});

flowTest('lowers explicit string enums', async () => {
  expect(
    await transformSource(
      `// @flow\nenum Suit of string { Hearts = "h", Spades = "s" }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Suit = require('flow-enums-runtime')({ Hearts: 'h', Spades: 's' });"
  `);
});

flowTest('lowers number enums', async () => {
  expect(
    await transformSource(
      `// @flow\nenum Code of number { Ok = 200, Missing = 404 }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Code = require('flow-enums-runtime')({ Ok: 200, Missing: 404 });"
  `);
});

flowTest('lowers symbol enums', async () => {
  expect(await transformSource(`// @flow\nenum Token of symbol { Start, End }`, 'input.js', {}))
    .toMatchInlineSnapshot(`
    "// @flow
    const Token = require('flow-enums-runtime')({ Start: Symbol('Start'), End: Symbol('End') });"
  `);
});

flowTest('preserves enum member references in surrounding code', async () => {
  expect(
    await transformSource(
      `// @flow\nenum Status { Active, Off }\nexport const active = Status.Active;`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Status = require('flow-enums-runtime').Mirrored(['Active', 'Off']);
    export const active = Status.Active;"
  `);
});
