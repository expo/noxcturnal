import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers Unicode regular expressions', async () => {
  expect(
    await transformSource(`export const matcher = /😀/u;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = /(?:\\uD83D\\uDE00)/;"`);
});

test('lowers mixed, ranged, and negated astral ignore-case classes', async () => {
  const output = await transformSource(
    String.raw`export const mixed = /[A\u{10400}]/iu; export const ranged = /[\u{10400}-\u{10401}]/iu; export const negated = /[^\u{10400}]/iu;`,
    'input.js',
    { transforms: { regexpUnicode: true } },
  );
  expect(output).not.toContain('/iu');
  expect(output).toContain('\\uD801');
  expect(output).toContain('\\uDC28');
  expect(output).toContain('\\uDC29');
});

test('lowers negated lone-surrogate classes without excluding astral code points', async () => {
  const output = await transformSource(
    String.raw`export const one = /^[^\uD800]$/u; export const leads = /^[^\uD800-\uDBFF]$/u;`,
    'input.js',
    { transforms: { regexpUnicode: true } },
  );
  expect(output).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*/u);
  expect(output).toContain('(?![\\uDC00-\\uDFFF])');
});

test('lowers astral Unicode ignore-case atoms with and without case variants', async () => {
  expect(
    await transformSource(
      String.raw`export const emoji = /\u{1F600}/iu; export const deseret = /\u{10400}/iu; export const deseretClass = /[\u{10400}]/iu;`,
      'input.js',
      {
        helpers: runtimeHelpers,
        transforms: { regexpUnicode: true },
      },
    ),
  ).toMatchInlineSnapshot(
    `
    "export const emoji = /(?:\\uD83D\\uDE00)/i;
    export const deseret = /(?:\\uD801[\\uDC00\\uDC28])/i;
    export const deseretClass = /(?:\\uD801[\\uDC00-\\uDC00]|\\uD801[\\uDC28-\\uDC28])/i;"
  `,
  );
});
