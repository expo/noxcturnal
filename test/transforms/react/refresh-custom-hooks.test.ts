import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { nativePreflightOptions } from '../../../js/native/binding';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'function callback',
    definition: 'const App = wrap(function () { return useValue(); });',
    signatures: 2,
  },
  {
    name: 'arrow callback',
    definition: 'const App = wrap(() => useValue());',
    signatures: 2,
  },
  {
    name: 'nested wrappers and member hooks',
    definition:
      'const App = wrap(wrap(function () { return hooks.nested.useValue() + hooks.useValue(); }));',
    signatures: 3,
    value: 14,
    hooks: 2,
  },
  {
    name: 'lowered parameters',
    definition: 'function App({ value = 1 } = {}) { return useValue() + value; }',
    signatures: 1,
    value: 8,
  },
  {
    name: 'async callback',
    definition: 'const App = wrap(async function () { await 0; return useValue(); });',
    signatures: 2,
  },
];

test.each(['asyncFunctions', 'asyncGeneratorFunctions'] as const)(
  'Refresh custom-hook callbacks survive %s traversal',
  asyncTransform => {
    const binding = Object.keys(require.cache).find(filename =>
      /noxcturnal\.[^/]+\.node$/.test(filename),
    );
    expect(binding).toBeTypeOf('string');
    const options = nativePreflightOptions({
      reactRefresh: {},
      transforms: { [asyncTransform]: true, parameters: true, destructuring: true },
      helpers: { mode: 'inline' },
    });
    // Keep a native abort outside the Vitest worker and batch the related cases.
    const child = spawnSync(process.execPath, [], {
      encoding: 'utf8',
      timeout: 10000,
      input: `
        const native = require(${JSON.stringify(binding)});
        (async () => {
          const results = {};
          for (const entry of ${JSON.stringify(cases)}) {
            const source =
              'function useValue() { return 7; }' +
              'const hooks = { useValue, nested: { useValue } };' +
              'function wrap(fn) { return fn; }' +
              entry.definition + 'globalThis.result = App();';
            const output = native.runNativePipeline('input.jsx', source, [${JSON.stringify(options)}]);
            if (!output.code) throw new Error(JSON.stringify(output));
            const context = {};
            const callbacks = [];
            const signatureHooks = [];
            new Function('globalThis', '$RefreshReg$', '$RefreshSig$', output.code)(
              context, () => {}, () => (value, key, reset, getHooks) => {
                if (getHooks) {
                  callbacks.push(getHooks);
                  signatureHooks.push(getHooks().map(hook => hook.name));
                }
                return value;
              }
            );
            results[entry.name] = {
              value: await context.result,
              signatureHooks,
              distinctCallbacks: new Set(callbacks).size,
            };
          }
          process.stdout.write(JSON.stringify(results));
        })().catch(error => { console.error(error); process.exitCode = 1; });
      `,
    });
    expect(child.error).toBeUndefined();
    expect(child.status, child.stderr).toBe(0);
    const results = JSON.parse(child.stdout);
    for (const entry of cases) {
      expect(results[entry.name], entry.name).toEqual({
        value: entry.value ?? 7,
        signatureHooks: Array.from({ length: entry.signatures }, () =>
          Array.from({ length: entry.hooks ?? 1 }, () => 'useValue'),
        ),
        distinctCallbacks: entry.signatures,
      });
    }
  },
);
