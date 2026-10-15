// Compare an independently built baseline addon with this branch's addon:
// node scripts/benchmarks/logical-assignment.mjs /absolute/path/baseline.node
// Run both debug (development) builds on the same host; timings are medians.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
const require = createRequire(import.meta.url);
const addons = [require(process.argv[2]), require('../../noxcturnal.darwin-arm64.node')];
const repeat = body => body.repeat(100);
const workloads = [
  [
    'ordinary members',
    `function run() { const obj = { value: 0 }; ${repeat('obj.value ||= 3;')} return obj.value; }`,
    {},
  ],
  [
    'private this',
    `class C { #value = 0; run() { ${repeat('this.#value ||= 3;')} return this.#value; } } function run() { return new C().run(); }`,
    {},
  ],
  [
    'private effectful',
    `class C { #value = 0; self() { return this; } run() { ${repeat('this.self().#value ||= 3;')} return this.#value; } } function run() { return new C().run(); }`,
    {},
  ],
  [
    'private mutable identifier',
    `class C { #value = 0; run() { let obj = this; obj = this; ${repeat('obj.#value ||= 3;')} return this.#value; } } function run() { return new C().run(); }`,
    {},
  ],
  [
    'private selected nullish',
    `class C { #value; run() { ${repeat('this.#value ??= 3;')} return this.#value; } } function run() { return new C().run(); }`,
    { nullishCoalescingOperator: true },
  ],
  ['regexp receiver', `function run() { ${repeat('/x/.value ||= 3;')} return 3; }`, {}],
];
const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const report = [];
for (const [name, source, extra] of workloads) {
  const options = { logicalAssignmentOperators: true, helpersMode: 'inline', ...extra };
  const compile = addon => {
    const result = addon.nativePreflightTransform(source, 'benchmark.js', options);
    assert.equal(result.status, 'complete');
    return result.code;
  };
  const outputs = addons.map(compile);
  const runs = outputs.map(code => new Function(`${code}; return run;`)());
  for (const run of runs) assert.equal(run(), 3);
  const compileSamples = [[], []],
    runtimeSamples = [[], []];
  for (let i = 0; i < 2; i++) {
    for (let warm = 0; warm < 30; warm++) compile(addons[i]);
    for (let warm = 0; warm < 10000; warm++) runs[i]();
  }
  for (let round = 0; round < 9; round++) {
    for (const i of round % 2 ? [1, 0] : [0, 1]) {
      let start = performance.now();
      for (let n = 0; n < 100; n++) compile(addons[i]);
      compileSamples[i].push((performance.now() - start) / 100);
      start = performance.now();
      let sum = 0;
      for (let n = 0; n < 100000; n++) sum += runs[i]();
      assert.equal(sum, 300000);
      runtimeSamples[i].push(((performance.now() - start) * 1e6) / 100000);
    }
  }
  report.push({
    name,
    bytes: outputs.map(x => Buffer.byteLength(x)),
    compileMs: compileSamples.map(median),
    runtimeNs: runtimeSamples.map(median),
    compileSamples,
    runtimeSamples,
  });
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      iterations: { compile: 100, runtime: 100000, rounds: 9 },
      report,
    },
    null,
    2,
  ),
);
