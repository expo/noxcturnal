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

test('preserves import attributes on the generated namespace import', async () => {
  const source = `export * as data from './data.json' with { type: 'json' };`;
  expect(await transformSource(source, 'input.mjs', { transforms: { exportNamespaceFrom: true } }))
    .toMatchInlineSnapshot(`
    "import * as _data from './data.json' with { type: 'json' };
    export { _data as data };"
  `);
});

test('restores attributes to the matching export when sources repeat', async () => {
  const source = `
export * as plain from './data.json';
export * as "data set" from './data.json' with { type: 'json' };
`;
  expect(await transformSource(source, 'input.mjs', { transforms: { exportNamespaceFrom: true } }))
    .toMatchInlineSnapshot(`
    "import * as _plain from './data.json';
    export { _plain as plain };
    import * as _dataSet from './data.json' with { type: 'json' };
    export { _dataSet as 'data set' };"
  `);
});
