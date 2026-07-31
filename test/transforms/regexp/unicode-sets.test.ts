import { test } from 'vitest';
import { expectBailout } from '../transform';

const cases = [
  ['intersection', String.raw`/[\p{ASCII}&&\p{Letter}]/v`],
  ['subtraction', String.raw`/[\p{Script=Greek}--\p{Lowercase_Letter}]/v`],
  ['nested character classes', String.raw`/[a-z&&[^aeiou]]/v`],
  ['properties of strings', String.raw`/\p{RGI_Emoji}/v`],
  ['string alternatives', String.raw`/[\q{abc|def}]/v`],
  ['Unicode set with the global flag', String.raw`/[a&&b]/gv`],
] as const;

for (const [name, regexp] of cases) {
  test(name, async () => {
    expectBailout(
      `export const matcher = ${regexp};`,
      'input.js',
      {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicodeSets: true },
      },
      'preflight:regexp-unicode-sets-semantic-mismatch',
    );
  });
}
