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
