import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers optional catch bindings', async () => {
  const source = `try { work(); } catch { recover(); }`;
  expect(await transformSource(source, 'input.js', { transforms: { optionalCatchBinding: true } }))
    .toMatchInlineSnapshot(`
    "try {
      work();
    } catch (_unused) {
      recover();
    }"
  `);
});
