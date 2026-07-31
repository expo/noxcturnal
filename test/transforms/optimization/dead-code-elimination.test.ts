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

test('retains a default-exported function declaration', async () => {
  const source = `export default function entry() { return 1; }`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "export default function entry() {
      return 1;
    }"
  `);
});

test('retains function-valued bindings exported through specifiers', async () => {
  const source = `
const named = () => 1;
const defaultValue = function () { return 2; };
export { named, defaultValue as default };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "const named = () => 1;
    const defaultValue = function () {
      return 2;
    };
    export { named, defaultValue as default };"
  `);
});

test('retains functions referenced from top-level expressions', async () => {
  const source = `
function invoked() { return 1; }
consume(invoked);
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "function invoked() {
      return 1;
    }
    consume(invoked);"
  `);
});

test('removes only function-valued bindings from mixed declarator lists', async () => {
  const source = `
const unused = () => 1, retained = sideEffect(), value = 2;
export { value };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "const retained = sideEffect(),
      value = 2;
    export { value };"
  `);
});

test('removes unreferenced nested function declarations with their dead owner', async () => {
  const source = `
function outer() {
  function inner() { return 1; }
  return inner();
}
export const value = 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(
    `"export const value = 1;"`,
  );
});

test('retains function bindings when direct eval can observe them', async () => {
  const source = `
function inspect() {
  const hidden = () => 42;
  return eval('hidden()');
}
export { inspect };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "function inspect() {
      const hidden = () => 42;
      return eval('hidden()');
    }
    export { inspect };"
  `);
});

test('does not treat eval text or property calls as direct eval', async () => {
  const source = `
// eval('comment only')
const marker = "eval('string only')";
const unused = () => 42;
globalThis.eval('external()');
export { marker };
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "// eval('comment only')
    const marker = \"eval('string only')\";
    globalThis.eval('external()');
    export { marker };"
  `);
});

test('does not treat an indirect eval call as direct eval', async () => {
  const source = `
const unused = () => 42;
(0, eval)('external()');
export const value = 1;
`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(`
    "(0, eval)('external()');
    export const value = 1;"
  `);
});

test('conservatively retains bindings around syntactically direct shadowed eval', async () => {
  const source = `
function inspect(eval) {
  const hidden = () => 42;
  return eval('hidden()');
}
export { inspect };
`;
  expect(await transformSource(source, 'input.js', options)).toContain('const hidden = () => 42');
});

test('does not empty variable declarations used as for initializers', async () => {
  const source = `for (let unused = () => 1; condition(); update()) work();`;
  expect(await transformSource(source, 'input.js', options)).toMatchInlineSnapshot(
    `"for (let unused = () => 1; condition(); update()) work();"`,
  );
});
