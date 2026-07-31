import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow component syntax', async () => {
  const source = `/** @flow */
component Greeting(name: string) { return name; }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    function Greeting({ name }) {
      return name;
    }"
  `);
});
