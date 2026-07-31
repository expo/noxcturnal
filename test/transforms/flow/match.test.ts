import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow match expressions', async () => {
  const source = `/** @flow */
const label = match (value) { 0 => 'none', const count => String(count) };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    const label = ($$gen$m0 => {
      if ($$gen$m0 === 0) {
        return 'none';
      }
      {
        const count = $$gen$m0;
        return String(count);
      }
    })(value);"
  `);
});
