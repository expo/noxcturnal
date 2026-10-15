import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const fixed = require('../dist/noxcturnal.js');
const baseline = require(process.env.NOXCTURNAL_BENCH_BASELINE);
const samples = 9;
const iterations = 20;
const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const sources = {
  members: Array.from(
    { length: 80 },
    (_, i) =>
      `class C${i}{@mark static first(){} @mark second(@parameter value:number){} @mark third=1}`,
  ).join('\n'),
  accessors: Array.from(
    { length: 80 },
    (_, i) => `class C${i}{@mark static accessor value=1;@mark accessor other=2}`,
  ).join('\n'),
  private: Array.from(
    { length: 80 },
    (_, i) => `class C${i}{#value=1;@capture(value=>#value in value) read(){return this.#value}}`,
  ).join('\n'),
};
const report = {
  environment: { node: process.version, samples, iterations, build: 'development' },
  transform: {},
  runtime: {},
};
const apis = [
  ['baseline', baseline],
  ['fixed', fixed],
];
function sampleBoth(entries, execute) {
  for (let sample = 0; sample < samples; sample++) {
    const ordered = sample % 2 ? [...entries].reverse() : entries;
    for (const entry of ordered) execute(entry);
  }
}
function pipeline(api) {
  return api.defineNativePipeline({
    phases: [
      {
        name: 'bench',
        native: {
          typescript: 'strip',
          transforms: { legacyDecorators: true },
        },
      },
    ],
  });
}
for (const [name, source] of Object.entries(sources)) {
  const entries = apis.map(([label, api]) => ({ label, api, pipeline: pipeline(api), times: [] }));
  for (const entry of entries) {
    for (let i = 0; i < 20; i++) entry.api.transform(source, 'bench.ts', entry.pipeline);
  }
  sampleBoth(entries, entry => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) entry.api.transform(source, 'bench.ts', entry.pipeline);
    entry.times.push((performance.now() - start) / iterations);
  });
  report.transform[name] = {};
  for (const entry of entries) {
    const result = entry.api.transform(source, 'bench.ts', entry.pipeline);
    if (result.status !== 'complete') throw new Error(result.reason);
    report.transform[name][entry.label] = {
      medianMs: median(entry.times),
      bytes: result.code.length,
    };
  }
}
const source = `function mark(){} class C{@mark static accessor value=0} function run(){C.value++;return C.value}`;
const runtime = apis.map(([label, api]) => {
  const result = api.transform(source, 'bench.ts', pipeline(api));
  if (result.status !== 'complete') throw new Error(result.reason);
  const run = new Function(result.code + ';return run;')();
  for (let i = 0; i < 10000; i++) run();
  return { label, run, times: [], checksum: 0 };
});
sampleBoth(runtime, entry => {
  const start = performance.now();
  for (let i = 0; i < 1000000; i++) entry.checksum += entry.run();
  entry.times.push((performance.now() - start) / 1000000);
});
for (const entry of runtime) {
  report.runtime[entry.label] = {
    medianMicroseconds: median(entry.times) * 1000,
    checksum: entry.checksum,
  };
}
console.log(JSON.stringify(report, null, 2));
