import { expect, test } from 'vitest';
import { transformSource } from '../transform';

const options = { optimize: { deadCodeElimination: true } } as const;

test('removes unreferenced function declarations and function-valued bindings', async () => {
  const source = `
function unusedDeclaration() {}
const unusedArrow = () => 1;
let unusedExpression = function named() {};
const retainedValue = 1;
export { retainedValue };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "const retainedValue = 1;
    export { retainedValue };"
  `);
});

test('retains referenced and exported functions', async () => {
  const source = `
function referenced() { return 1; }
const arrow = () => referenced();
export function declaration() { return arrow(); }
export const expression = function () { return declaration(); };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "function referenced() {
      return 1;
    }
    const arrow = () => referenced();
    export function declaration() {
      return arrow();
    }
    export const expression = function () {
      return declaration();
    };"
  `);
});

test('peels a dead dependency chain to a fixed point', async () => {
  const source = `
function leaf() { return 1; }
function middle() { return leaf(); }
const root = () => middle();
export const value = 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(
    `"export const value = 1;"`,
  );
});

test('retains mutually-referencing cycles', async () => {
  const source = `
function left() { return right(); }
function right() { return left(); }
export const value = 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "function left() {
      return right();
    }
    function right() {
      return left();
    }
    export const value = 1;"
  `);
});

test('retains non-function bindings and side-effecting initializers', async () => {
  const source = `
const value = compute();
const object = { method() {} };
class Example {}
export const retained = 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "const value = compute();
    const object = { method() {} };
    class Example {}
    export const retained = 1;"
  `);
});
