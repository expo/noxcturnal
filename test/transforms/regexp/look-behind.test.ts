import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

const cases = [
  ['positive assertion', String.raw`/(?<=prefix)value/`],
  ['negative assertion', String.raw`/(?<!prefix)value/`],
  ['capturing group inside an assertion', String.raw`/(?<=(prefix))value/`],
  ['alternation inside an assertion', String.raw`/(?<=foo|bar)value/`],
  ['quantifier inside an assertion', String.raw`/(?<=a{2,4})value/`],
  ['look-behind followed by a backreference', String.raw`/(?<=(a))\1/`],
] as const;

for (const [name, regexp] of cases) {
  test(name, async () => {
    expect(
      await transformOutcome(`export const matcher = ${regexp};`, 'input.js', {
        transforms: { regexpLookBehind: true },
      }),
    ).toMatchInlineSnapshot(`"[bailout] preflight:regexp-look-behind-semantic-mismatch"`);
  });
}
