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

flowTest('removes type-only class fields instead of creating runtime fields', async () => {
  const source = `// @flow
class StateSafe {
  state: State;
  initialized: number = 1;
  runtimeField;
}`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    class StateSafe {
      initialized = 1;
      runtimeField;
    }"
  `);
});
