import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { expect, test } from 'vitest';
import { alignBabelBehavior } from './transform';

// Boxed and converted BigInts reach Math.pow through distinct coercion paths.
const cases = [
  {
    name: 'boxed BigInt exponentiation follows Babel Math.pow behavior',
    source: `
      try { globalThis.__result = String(Object(2n) ** Object(3n)); }
      catch (error) { globalThis.__result = error.name; }
    `,
  },
  {
    name: 'BigInt-producing object exponentiation follows Babel Math.pow behavior',
    source: `
      const left = { valueOf() { return 2n; } };
      const right = { valueOf() { return 3n; } };
      try { globalThis.__result = String(left ** right); }
      catch (error) { globalThis.__result = error.name; }
    `,
  },
];
for (const entry of cases) {
  test(entry.name, async () => {
    await expect(
      alignBabelBehavior({
        source: entry.source,
        filename: 'input.js',
        plugins: [exponentiation],
        noxcturnal: {
          transforms: { exponentiationOperator: true },
          helpers: { mode: 'inline' },
        },
        output: { mustNotMatch: [/\*\*/] },
      }),
    ).resolves.toEqual('TypeError');
  });
}
