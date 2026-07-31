import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

const supported = [
  ['intersection', String.raw`/[\p{ASCII}&&\p{Letter}]/v`],
  ['subtraction', String.raw`/[\p{Script=Greek}--\p{Lowercase_Letter}]/v`],
  ['nested character classes', String.raw`/[a-z&&[^aeiou]]/v`],
  ['Unicode set with the global flag', String.raw`/[a&&b]/gv`],
  ['string alternatives', String.raw`/[x\q{a|long|mid}]/v`],
  ['chained intersection', String.raw`/[a-z&&[^aeiou]&&[^x-z]]/v`],
  ['chained subtraction', String.raw`/[a-z--[aeiou]--[x-z]]/v`],
] as const;

for (const [name, regexp] of supported) {
  test(name, async () => {
    expect(
      await transformOutcome(`export const matcher = ${regexp};`, 'input.js', {
        helpers: { mode: 'inline' },
        transforms: { regexpUnicodeSets: true },
      }),
    ).not.toContain('[bailout]');
  });
}

test('lowers every Unicode property of strings', async () => {
  const output = await transformOutcome(
    String.raw`export const basic = /\p{Basic_Emoji}/v;
export const modifier = /\p{RGI_Emoji_Modifier_Sequence}/v;
export const flag = /\p{RGI_Emoji_Flag_Sequence}/v;
export const tag = /\p{RGI_Emoji_Tag_Sequence}/v;
export const zwj = /\p{RGI_Emoji_ZWJ_Sequence}/v;
export const rgi = /\p{RGI_Emoji}/v;
export const bracketed = /[\p{RGI_Emoji}]/v;
export const mixed = /[x\p{RGI_Emoji}]/v;`,
    'input.js',
    { helpers: { mode: 'inline' }, transforms: { regexpUnicodeSets: true } },
  );
  expect(output).not.toContain('[bailout]');
  expect(output).not.toMatch(/\\p\{|\/v/u);
});
