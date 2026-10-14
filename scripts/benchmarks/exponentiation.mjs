// Usage: node scripts/benchmarks/exponentiation.mjs <baseline.node> <candidate.node>
// Build each revision with pnpm build:native and preserve the baseline addon first.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const addons = process.argv.slice(2).map(file => require(resolve(file)));
if (addons.length !== 2) throw new Error('Provide baseline and candidate native addons');
const options = { exponentiationOperator: true, compact: true, helpersMode: 'inline' };
function compile(addon, source) {
  const result = addon.nativePreflightTransform(source, 'benchmark.js', options);
  assert.equal(result.status, 'complete');
  return result.code;
}
const cases = {
  binary: 'function f(obj,key){return obj.x ** 2}',
  static: 'function f(obj,key){return obj.x **= 2}',
  computed: 'function f(obj,key){return obj[key] **= 2}',
  effectful: 'function f(obj,key){return (()=>obj)()[key] **= 2}',
  default: 'function f(obj,key,value=obj[key] **= 2){return value}',
};
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const results = {};
for (const [name, source] of Object.entries(cases)) {
  const large = Array.from({ length: 100 }, (_, i) =>
    source.replace('function f(', `function f${i}(`),
  ).join('\n');
  const outputs = addons.map(addon => compile(addon, large));
  const functions = addons.map(addon => new Function(`${compile(addon, source)};return f`)());
  for (const fn of functions) assert.equal(fn({ x: 3 }, 'x'), 9);
  const compileSamples = [[], []],
    runtimeSamples = [[], []];
  for (let sample = -3; sample < 11; sample++) {
    // Alternate order to reduce thermal / background-load bias.
    for (const index of sample % 2 ? [1, 0] : [0, 1]) {
      let start = performance.now();
      for (let i = 0; i < 60; i++) compile(addons[index], large);
      const compileMs = (performance.now() - start) / 60;
      const fn = functions[index],
        obj = { x: 3 };
      let sum = 0;
      start = performance.now();
      for (let i = 0; i < 1_000_000; i++) {
        obj.x = 3;
        sum += fn(obj, 'x');
      }
      const runtimeNs = ((performance.now() - start) * 1e6) / 1_000_000;
      assert.equal(sum, 9_000_000);
      if (sample >= 0) {
        compileSamples[index].push(compileMs);
        runtimeSamples[index].push(runtimeNs);
      }
    }
  }
  results[name] = {
    bytes: outputs.map(code => Buffer.byteLength(code)),
    identicalOutput: outputs[0] === outputs[1],
    compileMs: compileSamples.map(median),
    runtimeNs: runtimeSamples.map(median),
    compileSamples,
    runtimeSamples,
  };
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      profile: 'debug compiler addon; JIT-warmed emitted functions',
      results,
    },
    null,
    2,
  ),
);
