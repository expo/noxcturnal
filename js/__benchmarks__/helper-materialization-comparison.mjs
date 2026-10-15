// node js/__benchmarks__/helper-materialization-comparison.mjs BASE_ADDON BRANCH_ADDON
// Use independently built release addons. JSON output retains every timing sample.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const paths = process.argv.slice(2);
assert.equal(paths.length, 2, 'Provide base and branch release addon paths');
const addons = paths.map(path => require(resolve(path)));
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const cases = [];
for (const size of [1, 100]) {
  const ordinary = Array.from({ length: size }, (_, i) => `const value${i}=input.value+${i};`).join(
    '',
  );
  const spread = Array.from(
    { length: size },
    (_, i) => `const value${i}={...input,value:${i}};`,
  ).join('');
  const async = Array.from(
    { length: size },
    (_, i) => `async function read${i}(){return await input;}`,
  ).join('');
  for (const mode of ['inline', 'runtime']) {
    const options = { helpersMode: mode, helpersVersion: '7.29.7' };
    const object = {
      ...options,
      objectRestSpread: true,
      objectRestSpreadLoose: false,
      objectRestSpreadUseBuiltIns: false,
    };
    for (const [name, source, config, filename] of [
      ['no helpers', ordinary, options],
      ['spread selected without spread syntax', ordinary, object],
      ['spread', spread, object],
      ['spread unrelated global', 'const Promise=null;' + spread, object],
      ['spread colliding global', 'const Object=null;' + spread, object],
      ['spread escaped name', String.raw`const _ext\u0065nds=1;` + spread, object],
      ['spread directive', '"use strict";' + spread, object],
      ['spread compact directive', '"use strict";' + spread, { ...object, compact: true }],
      ['async', async, { ...options, asyncFunctions: true }],
      [
        'async colliding global',
        'const Promise=null;' + async,
        { ...options, asyncFunctions: true },
      ],
      [
        'ESM adapter',
        Array.from({ length: size }, (_, i) => `const [value${i}]=input;`).join(''),
        { ...options, destructuring: true },
        'bench.mjs',
      ],
    ]) {
      cases.push({
        name: `${name}, ${mode}, ${size}`,
        source,
        options: config,
        filename: filename ?? 'bench.js',
      });
    }
  }
}

console.log(
  JSON.stringify({
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    addons: paths,
    samples: 15,
    units: 'milliseconds per transform',
  }),
);
for (const entry of cases) {
  const functions = addons.map(
    addon => () => addon.nativePreflightTransform(entry.source, entry.filename, entry.options),
  );
  const outputs = functions.map(fn => fn());
  for (const output of outputs) {
    assert.equal(output.status, 'complete', JSON.stringify(output));
    assert.equal(typeof output.code, 'string');
    if (entry.options.objectRestSpread) assert(!output.code.includes('...'));
    if (entry.options.asyncFunctions) assert(!/async\s+function/.test(output.code));
    if (entry.options.destructuring) assert(!/const\s*\[/.test(output.code));
  }
  for (const fn of functions) for (let i = 0; i < 100; i++) fn();
  const start = performance.now();
  for (let i = 0; i < 100; i++) functions[1]();
  const iterations = Math.min(
    10000,
    Math.max(10, Math.ceil(20 / ((performance.now() - start) / 100))),
  );
  const samples = [[], []];
  for (let round = 0; round < 15; round++) {
    for (const index of round % 2 ? [1, 0] : [0, 1]) {
      const before = performance.now();
      for (let i = 0; i < iterations; i++) functions[index]();
      samples[index].push((performance.now() - before) / iterations);
    }
  }
  const medians = samples.map(median);
  console.log(
    JSON.stringify({
      name: entry.name,
      sourceBytes: Buffer.byteLength(entry.source),
      outputBytes: outputs.map(output => Buffer.byteLength(output.code)),
      iterations,
      medians,
      changePercent: (medians[1] / medians[0] - 1) * 100,
      samples,
    }),
  );
}
