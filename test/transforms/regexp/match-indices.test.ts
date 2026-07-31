import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

const cases = [
  ['plain match indices', String.raw`/value/d`],
  ['match indices with a capturing group', String.raw`/(value)/d`],
  ['match indices with a named capturing group', String.raw`/(?<value>value)/d`],
  ['match indices with global matching', String.raw`/value/dg`],
  ['match indices with Unicode matching', String.raw`/value/du`],
] as const;

for (const [name, regexp] of cases) {
  test(name, async () => {
    expect(
      await transformOutcome(`export const matcher = ${regexp};`, 'input.js', {
        transforms: { regexpMatchIndices: true },
      }),
    ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-match-indices-semantic-mismatch"`);
  });
}
