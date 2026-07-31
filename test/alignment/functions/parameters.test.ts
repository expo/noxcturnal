import parameters from '@babel/plugin-transform-parameters';
import { expect, test } from 'vitest';

import { alignBabelBehavior, expectBabelSupportedNoxcturnalBailout } from '../transform';

test('aligns default, destructured, and rest parameters with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `function read({ value } = { value: 20 }, ...rest) { return value + rest[0]; }
globalThis.__result = read(undefined, 22);`,
      filename: 'input.js',
      plugins: [parameters],
      noxcturnal: { transforms: { parameters: true } },
      output: { mustNotMatch: [/function read\(\{/, /\.\.\.rest/] },
    }),
  ).resolves.toBe(42);
});

test('aligns same-named parameter and body bindings with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `function absent(a = 2) { var a; return a; }
function initialized({ a } = { a: 2 }) { var a = 3; return a; }
function declared(a = 2) { function a() {} return typeof a; }
globalThis.__result = [absent(), initialized(), declared()];`,
      filename: 'input.js',
      plugins: [parameters],
      noxcturnal: { transforms: { parameters: true } },
      output: { mustNotMatch: [/function absent\(a/, /function initialized\(\{/] },
    }),
  ).resolves.toEqual([2, 3, 'function']);
});

test('aligns wrapper visibility of arguments and new.target with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `function Read(value = 2) {
  var value;
  return [value, arguments.length, arguments[0], new.target === Read];
}
globalThis.__result = [Read(), new Read()];`,
      filename: 'input.js',
      plugins: [parameters],
      noxcturnal: { transforms: { parameters: true } },
      output: { mustNotMatch: [/value = 2/] },
    }),
  ).resolves.toEqual([
    [2, 0, undefined, false],
    [2, 0, undefined, true],
  ]);
});

test('records the non-simple setter boundary against Babel', () => {
  expectBabelSupportedNoxcturnalBailout(
    {
      source: `const value = { set field(next = 1) {} };`,
      filename: 'input.js',
      plugins: [parameters],
      noxcturnal: { transforms: { parameters: true } },
    },
    'alignment:parameters-setter-semantics-not-implemented',
  );
});
