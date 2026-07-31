import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers Unicode property escapes', async () => {
  expect(
    await transformSource(String.raw`export const matcher = /\p{ASCII}+/u;`, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { regexpUnicodePropertyEscapes: true },
    }),
  ).toMatchInlineSnapshot(`"export const matcher = /[\\u0000-\\u007F]+/u;"`);
});

test('lowers negated and mixed Unicode property classes', async () => {
  const output = await transformSource(
    String.raw`export const outer = /[^\p{ASCII}]/u; export const mixed = /[\p{Lowercase_Letter}\d\s]/u; export const complements = /[\p{ASCII}\D]/u;`,
    'input.js',
    {
      helpers: runtimeHelpers,
      transforms: { regexpUnicodePropertyEscapes: true },
    },
  );
  expect(output).not.toMatch(/\\[pP]\{/u);
  expect(output).toContain('\\u2028');
  expect(output).toContain('\\uFEFF');
});

test('keeps complemented astral properties code-point atomic when removing Unicode mode', async () => {
  const output = await transformSource(
    String.raw`export const excluded = /^[^\p{Script=Deseret}]+$/u; export const nonAscii = /^[^\p{ASCII}]{1}$/u;`,
    'input.js',
    {
      helpers: runtimeHelpers,
      transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
    },
  );
  expect(output).not.toMatch(/\\[pP]\{|\/[dgimsuvy]*u[dgimsuvy]*/u);
  expect(output).toContain('(?![\\uDC00-\\uDFFF])');
});
