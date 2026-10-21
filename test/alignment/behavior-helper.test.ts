import nullishCoalescing from '@babel/plugin-transform-nullish-coalescing-operator';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from './transform';

const nullishPlan = {
  filename: 'input.js',
  plugins: [nullishCoalescing],
  noxcturnal: { transforms: { nullishCoalescingOperator: { loose: false } } },
} as const;

test.each([
  { name: 'empty assertions', output: { mustNotMatch: [] } },
  { name: 'forbidden syntax absent from the input', output: { mustNotMatch: [/=>/] } },
  {
    name: 'required syntax already present in the input',
    output: { mustNotMatch: [], mustMatch: [/globalThis/] },
  },
])('rejects $name because an identity transform would pass', async ({ output }) => {
  await expect(
    alignBabelBehavior({
      ...nullishPlan,
      plugins: [...nullishPlan.plugins],
      source: 'globalThis.__result = null ?? 42;',
      output,
    }),
  ).rejects.toThrow(
    'Behavioral alignment must assert output syntax that rejects the original source',
  );
});

test('rejects an omitted observation rather than comparing two implicit undefined results', async () => {
  await expect(
    alignBabelBehavior({
      ...nullishPlan,
      plugins: [...nullishPlan.plugins],
      source: 'const unused = null ?? 42;',
      output: { mustNotMatch: [/\?\?/] },
    }),
  ).rejects.toThrow('Behavioral alignment must assign globalThis.__result');
});

test('accepts an explicit undefined observation', async () => {
  await expect(
    alignBabelBehavior({
      ...nullishPlan,
      plugins: [...nullishPlan.plugins],
      source: 'globalThis.__result = null ?? undefined;',
      output: { mustNotMatch: [/\?\?/] },
    }),
  ).resolves.toBeUndefined();
});

test('accepts required output syntax that is absent from the input', async () => {
  await expect(
    alignBabelBehavior({
      ...nullishPlan,
      plugins: [...nullishPlan.plugins],
      source: 'function read(value) { return value ?? 42; } globalThis.__result = read(null);',
      output: { mustNotMatch: [], mustMatch: [/!==\s*null/] },
    }),
  ).resolves.toBe(42);
});

test('checks global regexes without consuming or depending on their lastIndex', async () => {
  const nullishSyntax = /\?\?/g;
  nullishSyntax.lastIndex = 100;
  await expect(
    alignBabelBehavior({
      ...nullishPlan,
      plugins: [...nullishPlan.plugins],
      source: 'globalThis.__result = null ?? 42;',
      output: { mustNotMatch: [nullishSyntax] },
    }),
  ).resolves.toBe(42);
  expect(nullishSyntax.lastIndex).toBe(100);
});
