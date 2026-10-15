// node js/__benchmarks__/object-spread-comparison.mjs BASELINE_ADDON FIXED_ADDON
// Compare independently built addons without swapping the workspace native artifact.
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const addons = process.argv.slice(2).map(path => require(resolve(path)));
if (addons.length !== 2) throw new Error('Provide baseline and fixed native addon paths');
const cases = [
  [
    'spread JSX',
    'const nodes=[' + '<div {...input} value={1}/>,'.repeat(100) + '];',
    { jsx: 'classic' },
  ],
  ['ordinary JSX', 'const nodes=[' + '<div value={1}/>,'.repeat(100) + '];', { jsx: 'classic' }],
  ['no JSX', 'const nodes=[' + '{...input,value:1},'.repeat(100) + '];', { jsx: 'classic' }],
  [
    'strict built-ins',
    'const nodes=[' + '{...input,value:1},'.repeat(100) + '];',
    { objectRestSpread: true, objectRestSpreadLoose: false, objectRestSpreadUseBuiltIns: true },
  ],
  [
    'strict default',
    'const nodes=[' + '{...input,value:1},'.repeat(100) + '];',
    { objectRestSpread: true, objectRestSpreadLoose: false },
  ],
];
function measure(functions, iterations) {
  const samples = [[], []];
  for (let sample = 0; sample < 12; sample++) {
    for (const index of sample % 2 ? [1, 0] : [0, 1]) {
      const fn = functions[index];
      for (let n = 0; n < iterations / 10; n++) fn();
      const start = performance.now();
      for (let n = 0; n < iterations; n++) fn();
      samples[index].push((performance.now() - start) / iterations);
    }
  }
  return samples;
}
for (const [name, source, config] of cases) {
  const options = { ...config, helpersMode: 'inline' };
  const functions = addons.map(
    addon => () => addon.nativePreflightTransform(source, 'bench.jsx', options),
  );
  const outputs = functions.map(fn => fn());
  if (outputs.some(output => output.status !== 'complete'))
    throw new Error(JSON.stringify(outputs));
  console.log(
    JSON.stringify({
      name,
      bytes: outputs.map(output => output.code.length),
      milliseconds: measure(functions, 100),
    }),
  );
}
let sink;
for (const useBuiltIns of [true, false]) {
  const options = {
    objectRestSpread: true,
    objectRestSpreadLoose: false,
    objectRestSpreadUseBuiltIns: useBuiltIns,
    helpersMode: 'inline',
  };
  const source = 'function run(input){ return {...input, value:1}; }';
  const input = { a: 1, b: 2, c: 3 };
  const functions = addons.map(addon => {
    const output = addon.nativePreflightTransform(source, 'bench.js', options);
    if (output.status !== 'complete') throw new Error(JSON.stringify(output));
    const run = new Function(output.code + ';return run')();
    return () => {
      sink = run(input);
    };
  });
  console.log(
    JSON.stringify({ runtime: true, useBuiltIns, milliseconds: measure(functions, 1000000), sink }),
  );
}
