import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers block-scoped declarations', async () => {
  const source = `export function read(flag) { if (flag) { let value = 1; return value; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "export function read(flag) {
      if (flag) {
        var value = 1;
        return value;
      }
    }"
  `);
});

test('uses the Babel runtime readOnlyError helper when runtime helpers are selected', async () => {
  const output = await transformSource(`const value = 1; value = sideEffect();`, 'input.js', {
    helpers: runtimeHelpers,
    transforms: { blockScoping: true },
  });
  expect(output).toContain("require('@babel/runtime/helpers/readOnlyError')");
  expect(output).toContain("sideEffect(), _readOnlyError('value')");
});
