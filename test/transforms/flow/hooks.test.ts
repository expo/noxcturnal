import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow hook syntax', async () => {
  const source = `/** @flow */
hook useGreeting(name: string): string { return name; }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    function useGreeting(name) {
      return name;
    }"
  `);
});

flowTest('lowers hooks with default and rest parameters', async () => {
  expect(
    await transformSource(
      `// @flow\nhook useValues(first: number = 1, ...rest: Array<number>): number { return first + rest.length; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function useValues(first = 1, ...rest) {
      return first + rest.length;
    }"
  `);
});
