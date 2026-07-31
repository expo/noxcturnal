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

test('folds supported unary expressions without replacing safe void expressions', async () => {
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
    export const absent = void 0;"
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
    export const shiftRightUnsigned = 3;
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

test('uses ECMAScript ToInt32 and ToUint32 wrapping for bitwise folds', async () => {
  const source = `
export const wrapped = 4294967296 | 0;
export const signed = 4294967295 | 0;
export const unsigned = 4294967296 >>> 0;
export const shifted = 4294967297 << 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const wrapped = 0;
    export const signed = -1;
    export const unsigned = 0;
    export const shifted = 2;"
  `);
});

test('does not emit shadowable identifiers for void or non-finite results', async () => {
  const source = `
export function read(undefined, Infinity, NaN) {
  return [void 0, 1 / 0, 0 / 0, -1 / 0];
}
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export function read(undefined, Infinity, NaN) {
      return [void 0, 1 / 0, 0 / 0, -1 / 0];
    }"
  `);
});

test('retains constant if statements whose function declarations create Annex B bindings', async () => {
  const source = `
if (false) function hidden() {}
consume(hidden);
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "if (false) function hidden() {}
    consume(hidden);"
  `);
});

test('compares strings using ECMAScript UTF-16 code-unit ordering', async () => {
  const source = `
export const supplementaryFirst = '\\u{10000}' < '\\uE000';
export const bmpFirst = '\\uE000' < '\\u{10000}';
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const supplementaryFirst = true;
    export const bmpFirst = false;"
  `);
});

test('uses ECMAScript StringNumericLiteral parsing rather than Rust float spellings', async () => {
  const source = `
export const infIsFalsy = !+'inf';
export const negativeInfIsFalsy = !+'-inf';
export const infinityIsTruthy = !!+'Infinity';
export const hexadecimal = +'0x10';
export const binary = +'0b10';
export const octal = +'0o10';
export const invalidSeparator = !+'1_0';
export const relation = '-inf' < 0;
export const trailingWhitespace = +'1\u00a0';
export const byteOrderMarkOnly = !+'\ufeff';
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const infIsFalsy = true;
    export const negativeInfIsFalsy = true;
    export const infinityIsTruthy = true;
    export const hexadecimal = 16;
    export const binary = 2;
    export const octal = 8;
    export const invalidSeparator = true;
    export const relation = false;
    export const trailingWhitespace = 1;
    export const byteOrderMarkOnly = true;"
  `);
});

test('leaves wide radix string conversion to the JavaScript runtime', async () => {
  const source = `export const wide = +'0b100000000000000000000000000000000000000000000000000001';`;
  expect(await transformSource(source, 'input.js', options)).toBe(source);
});

test('preserves signed zero through unary, exponentiation, and string conversion folds', async () => {
  const source = `
export const literal = 1 / -0;
export const parsed = 1 / +'-0';
export const oddPower = 1 / ((0 * -1) ** 3);
export const evenPower = 1 / ((0 * -1) ** 2);
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export const literal = 1 / -0;
    export const parsed = 1 / -0;
    export const oddPower = 1 / -0;
    export const evenPower = 1 / 0;"
  `);
});
