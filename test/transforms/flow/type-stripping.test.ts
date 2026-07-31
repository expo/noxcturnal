import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('strips Flow type syntax', async () => {
  const source = `/** @flow */
type User = { name: string };
export function greeting(user: User): string { return user.name; }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */

    export function greeting(user) {
      return user.name;
    }"
  `);
});
