import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers destructuring', async () => {
  const source = `export function read({ value }, [first]) { return [value, first]; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: { useBuiltIns: true } },
    }),
  ).toMatchInlineSnapshot(`
    "export function read({ value }, [first]) {
      return [value, first];
    }"
  `);
});
