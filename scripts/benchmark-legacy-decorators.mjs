import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const fixed = require('../dist/noxcturnal.js');
const baseline = require(process.env.NOXCTURNAL_BENCH_BASELINE);
const samples = 9;
const iterations = 40;
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
for (const [name, source] of Object.entries(sources)) {
  const results = {};
  for (const [label, api] of [
    ['baseline', baseline],
    ['fixed', fixed],
  ]) {
    const pipeline = api.defineNativePipeline({
      phases: [
        { name: 'bench', native: { typescript: 'strip', transforms: { legacyDecorators: true } } },
      ],
    });
    for (let i = 0; i < 20; i++) api.transform(source, 'bench.ts', pipeline);
    const times = [];
    for (let sample = 0; sample < samples; sample++) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) api.transform(source, 'bench.ts', pipeline);
      times.push((performance.now() - start) / iterations);
    }
    const result = api.transform(source, 'bench.ts', pipeline);
    if (result.status !== 'complete') throw new Error(result.reason);
    results[label] = { medianMs: median(times), bytes: result.code.length };
  }
  report.transform[name] = results;
}
for (const [label, api] of [
  ['baseline', baseline],
  ['fixed', fixed],
]) {
  const pipeline = api.defineNativePipeline({
    phases: [
      { name: 'bench', native: { typescript: 'strip', transforms: { legacyDecorators: true } } },
    ],
  });
  const source = `function mark(){} class C{@mark static accessor value=0} function run(){C.value++;return C.value}`;
  const result = api.transform(source, 'bench.ts', pipeline);
  if (result.status !== 'complete') throw new Error(result.reason);
  const run = new Function(result.code + ';return run;')();
  for (let i = 0; i < 10000; i++) run();
  const times = [];
  let checksum = 0;
  for (let sample = 0; sample < samples; sample++) {
    const start = performance.now();
    for (let i = 0; i < 1000000; i++) checksum += run();
    times.push((performance.now() - start) / 1000000);
  }
  report.runtime[label] = { medianMicroseconds: median(times) * 1000, checksum };
}
console.log(JSON.stringify(report, null, 2));
