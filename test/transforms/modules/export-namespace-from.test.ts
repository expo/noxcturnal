import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers namespace exports', async () => {
  const source = `export * as utilities from './utilities';`;
  expect(await transformSource(source, 'input.js', { transforms: { exportNamespaceFrom: true } }))
    .toMatchInlineSnapshot(`
    "import * as _utilities from './utilities';
    export { _utilities as utilities };"
  `);
});
