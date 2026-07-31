import explicitResourceManagement from '@babel/plugin-transform-explicit-resource-management';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns synchronous resource disposal with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const trace = []; { using resource = { [Symbol.dispose]() { trace.push('disposed'); } }; trace.push('body'); }
globalThis.__result = trace;`,
      filename: 'input.js',
      plugins: [explicitResourceManagement],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { explicitResourceManagement: true },
      },
      output: { mustNotMatch: [/\busing\s+resource\b/] },
    }),
  ).resolves.toEqual(['body', 'disposed']);
});

test('aligns async disposal, sync fallback, and for-using-of with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `globalThis.__result = (async () => {
        const calls = [];
        {
          await using asyncValue = {
            [Symbol.asyncDispose]() {
              calls.push('async:start');
              return Promise.resolve().then(() => calls.push('async:end'));
            },
          };
          await using syncFallback = { [Symbol.dispose]() { calls.push('sync'); } };
          calls.push('body');
        }
        const values = [1, 2].map(value => ({
          value,
          [Symbol.dispose]() { calls.push('dispose:' + value); },
        }));
        for (using resource of values) {
          calls.push('loop:' + resource.value);
          if (resource.value === 1) break;
        }
        return calls;
      })();`,
      filename: 'input.js',
      plugins: [explicitResourceManagement],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { explicitResourceManagement: true },
      },
      output: { mustNotMatch: [/\bawait\s+using\b/] },
    }),
  ).resolves.toEqual(['body', 'sync', 'async:start', 'async:end', 'loop:1', 'dispose:1']);
});

test('aligns async disposer lookup and nullish await-using suspension with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `globalThis.__result = (async () => {
  const calls = [];
  const fallback = {
    get [Symbol.asyncDispose]() { calls.push('get:async'); return undefined; },
    get [Symbol.dispose]() {
      calls.push('get:sync');
      return function () { calls.push(['dispose:sync', this === fallback]); };
    },
  };
  { await using value = fallback; calls.push(value === fallback); }
  const invalid = {
    get [Symbol.asyncDispose]() { calls.push('get:bad-async'); return 1; },
    get [Symbol.dispose]() { calls.push('get:bad-sync'); return () => {}; },
  };
  try { await using value = invalid; void value; }
  catch (error) { calls.push(error instanceof TypeError); }
  const nullish = (async () => { await using value = null; calls.push('nullish:body'); })();
  calls.push('after:nullish-call');
  await nullish;
  calls.push('after:nullish-await');
  return calls;
})();`,
      filename: 'input.js',
      plugins: [explicitResourceManagement],
      noxcturnal: {
        helpers: { mode: 'inline' },
        transforms: { explicitResourceManagement: true },
      },
      output: { mustNotMatch: [/\bawait\s+using\b/] },
    }),
  ).resolves.toEqual([
    'get:async',
    'get:sync',
    true,
    ['dispose:sync', true],
    'get:bad-async',
    true,
    'nullish:body',
    'after:nullish-call',
    'after:nullish-await',
  ]);
});
