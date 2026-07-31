import blockScoping from '@babel/plugin-transform-block-scoping';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns captured loop bindings with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const callbacks = [];
for (let index = 0; index < 3; index++) callbacks.push(() => index);
globalThis.__result = callbacks.map(callback => callback());`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/\b(?:let|const)\b/] },
    }),
  ).resolves.toEqual([0, 1, 2]);
});

test('aligns const assignment errors after evaluating the right-hand side', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
const value = 1;
let typeError = false;
try { value = (calls.push('rhs'), 2); }
catch (error) { typeError = error instanceof TypeError; calls.push('throw'); }
globalThis.__result = [value, calls, typeError];`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/(?:let|const)\b/] },
    }),
  ).resolves.toEqual([1, ['rhs', 'throw'], true]);
});

test('aligns logical, compound, update, and destructuring const writes with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
const truthy = 1;
truthy ||= calls.push('short-circuit');
const falsy = 0;
try { falsy ||= (calls.push('logical-rhs'), 2); } catch (error) { calls.push(error instanceof TypeError); }
const coercible = { valueOf() { calls.push('coerce'); return 1; } };
try { coercible += (calls.push('compound-rhs'), 2); } catch (error) { calls.push(error instanceof TypeError); }
const updated = { valueOf() { calls.push('update-coerce'); return 1; } };
try { updated++; } catch (error) { calls.push(error instanceof TypeError); }
const fixed = 1;
try { [fixed] = (calls.push('destructure-rhs'), [2]); } catch (error) { calls.push(error instanceof TypeError); }
globalThis.__result = calls;`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/(?:let|const)\b/] },
    }),
  ).resolves.toEqual([
    'logical-rhs',
    true,
    'compound-rhs',
    'coerce',
    true,
    'update-coerce',
    true,
    'destructure-rhs',
    true,
  ]);
});

test('preserves getter-only private assignment evaluation order', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
class Value {
  get #readOnly() { calls.push('get'); return 1; }
  receiver() { calls.push('receiver'); return this; }
  write() {
    try { this.receiver().#readOnly = (calls.push('rhs'), 2); }
    catch (error) { calls.push(error instanceof TypeError); }
  }
}
new Value().write();
globalThis.__result = calls;`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/(?:let|const)\b/] },
    }),
  ).resolves.toEqual(['receiver', 'rhs', true]);
});

test('aligns Babel non-TDZ const-write behavior before declaration', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
let errorName;
try {
  value = (calls.push('rhs'), 2);
  const value = 1;
} catch (error) {
  errorName = error.name;
}
globalThis.__result = [calls, errorName];`,
      filename: 'input.js',
      plugins: [blockScoping],
      noxcturnal: { transforms: { blockScoping: true } },
      output: { mustNotMatch: [/(?:let|const)\b/] },
    }),
  ).resolves.toEqual([['rhs'], 'TypeError']);
});
