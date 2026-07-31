import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('strips TypeScript from ESM-oriented .mts inputs', async () => {
  const source = `export const value: number = 1 satisfies number;`;
  expect(await transformSource(source, 'input.mts', { typescript: 'strip' })).toMatchInlineSnapshot(
    `"export const value = 1;"`,
  );
});

test('strips TypeScript from CommonJS-oriented .cts inputs', async () => {
  const source = `export = function read(value: number): number { return value; };`;
  expect(await transformSource(source, 'input.cts', { typescript: 'strip' }))
    .toMatchInlineSnapshot(`
    "module.exports = function read(value) {
      return value;
    };"
  `);
});
