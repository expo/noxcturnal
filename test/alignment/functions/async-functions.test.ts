import asyncToGenerator from '@babel/plugin-transform-async-to-generator';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns async functions with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `async function read() { return (await Promise.resolve(40)) + 2; }
globalThis.__result = read();`,
      filename: 'input.js',
      plugins: [asyncToGenerator],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { asyncFunctions: true } },
      output: { mustNotMatch: [/async\s+function/, /\bawait\b/] },
    }),
  ).resolves.toBe(42);
});

test('aligns thenable assimilation and promise adoption with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const log = [];
const thenable = {
  get then() {
    log.push('get:then');
    return resolve => { log.push('call:then'); resolve(42); };
  },
};
const original = Promise.resolve(7);
async function read() {
  log.push('start');
  const value = await thenable;
  log.push('after:await');
  return [value, await original];
}
const promise = read();
log.push('after:call');
globalThis.__result = promise.then(values => [values, promise !== original, log]);`,
      filename: 'input.js',
      plugins: [asyncToGenerator],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { asyncFunctions: true } },
      output: { mustNotMatch: [/async\s+function/] },
    }),
  ).resolves.toEqual([
    [42, 7],
    true,
    ['start', 'get:then', 'after:call', 'call:then', 'after:await'],
  ]);
});

test('aligns async function names, lengths, and wrapper constructability with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `async function declared(a, b = 1, c) {}
const inferred = async function (a, b) {};
const object = { async read(a) {} };
const arrow = async (a, b = 1) => a;
const functions = [declared, inferred, object.read, arrow];
const construct = functions.map(value => {
  try { Reflect.construct(value, []); return 'ok'; }
  catch (error) { return error.name; }
});
globalThis.__result = [functions.map(value => [value.name, value.length]), construct];`,
      filename: 'input.js',
      plugins: [asyncToGenerator],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { asyncFunctions: true } },
      output: { mustNotMatch: [/async\s+(?:function|\()/, /\bawait\b/] },
    }),
  ).resolves.toEqual([
    [
      ['declared', 1],
      ['inferred', 2],
      ['read', 1],
      ['arrow', 1],
    ],
    ['ok', 'ok', 'TypeError', 'ok'],
  ]);
});
