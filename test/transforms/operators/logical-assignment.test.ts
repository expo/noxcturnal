import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers logical assignment', async () => {
  expect(
    await transformSource(`value ||= fallback;`, 'input.js', {
      transforms: { logicalAssignmentOperators: true },
    }),
  ).toMatchInlineSnapshot(`"value || (value = fallback);"`);
});
