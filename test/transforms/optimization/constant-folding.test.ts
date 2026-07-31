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

test('folds every supported numeric binary operator', async () => {
  const source = `
export const remainder = 7 % 4;
export const exponent = 2 ** 5;
export const lessEqual = 2 <= 2;
export const greater = 3 > 2;
export const greaterEqual = 3 >= 3;
export const shiftLeft = 3 << 2;
export const shiftRight = -8 >> 2;
export const shiftRightUnsigned = -1 >>> 30;
export const xor = 6 ^ 3;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const remainder = 3;
    export const exponent = 32;
    export const lessEqual = true;
    export const greater = true;
    export const greaterEqual = true;
    export const shiftLeft = 12;
    export const shiftRight = -2;
    export const shiftRightUnsigned = 0;
    export const xor = 5;"
  `);
});

test('folds string concatenation and ECMAScript constant coercions', async () => {
  const source = `
export const concatenated = 'value: ' + 2;
export const nullString = '' + null;
export const booleanString = true + ' value';
export const looseNumber = '2' == 2;
export const looseBoolean = false == 0;
export const looseNull = null == 0;
export const strictDifferentKinds = '2' === 2;
export const notEqual = 1 != '2';
export const strictlyNotEqual = 1 !== 2;
export const lexical = 'alpha' < 'beta';
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const concatenated = 'value: 2';
    export const nullString = 'null';
    export const booleanString = 'true value';
    export const looseNumber = true;
    export const looseBoolean = true;
    export const looseNull = false;
    export const strictDifferentKinds = false;
    export const notEqual = true;
    export const strictlyNotEqual = true;
    export const lexical = true;"
  `);
});

test('folds parenthesized and side-effect-free sequence expressions', async () => {
  const source = `
export const grouped = ((1 + 2) * (3 + 1));
export const sequence = (1, 2, 3 + 4);
export const nested = (false || (2 + 3)) ? 'yes' : 'no';
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const grouped = 12;
    export const sequence = (1, 2, 7);
    export const nested = 'yes';"
  `);
});

test('retains sequences when any preceding expression cannot be evaluated safely', async () => {
  const source = `export const value = (sideEffect(), 1 + 2);`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(
    `"export const value = (sideEffect(), 3);"`,
  );
});
