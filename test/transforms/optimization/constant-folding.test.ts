import { expect, test } from 'vitest';
import { transformSource } from '../transform';

const options = { optimize: { constantFolding: true } } as const;

test('folds arithmetic, comparison, equality, and bitwise expressions', async () => {
  const source = `
export const arithmetic = 2 * 3 + 8 / 4 - 1;
export const comparison = 3 < 4;
export const equality = 'x' === 'x';
export const bitwise = (5 & 3) | 8;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const arithmetic = 7;
    export const comparison = true;
    export const equality = true;
    export const bitwise = 9;"
  `);
});

test('folds supported unary expressions and canonicalizes void literals', async () => {
  const source = `
export const negative = -2;
export const positive = +'2';
export const inverted = !0;
export const complement = ~1;
export const absent = void 0;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const negative = -2;
    export const positive = 2;
    export const inverted = true;
    export const complement = -2;
    export const absent = undefined;"
  `);
});

test('folds logical expressions according to short-circuit semantics', async () => {
  const source = `
export const orRight = 0 || call();
export const orLeft = 'value' || call();
export const andRight = 1 && call();
export const andLeft = '' && call();
export const nullishRight = null ?? call();
export const nullishLeft = 0 ?? call();
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const orRight = call();
    export const orLeft = 'value';
    export const andRight = call();
    export const andLeft = '';
    export const nullishRight = call();
    export const nullishLeft = 0;"
  `);
});

test('folds conditional expressions and constant if statements', async () => {
  const source = `
export const yes = 1 ? consequent() : alternate();
export const no = 0 ? consequent() : alternate();
if ('value') keep(); else discard();
if (null) discard(); else keep();
if (false) discard();
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const yes = consequent();
    export const no = alternate();
    keep();
    keep();"
  `);
});

test('does not fold expressions with observable or unknown values', async () => {
  const source = `
export const binary = value + 1;
export const logical = value && call();
export const conditional = value ? left() : right();
if (value) branch();
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const binary = value + 1;
    export const logical = value && call();
    export const conditional = value ? left() : right();
    if (value) branch();"
  `);
});
