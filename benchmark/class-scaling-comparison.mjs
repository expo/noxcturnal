import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { defineNativePipeline, transform } from '../dist/index.js';

const samples = Number.parseInt(process.env.NOX_CLASS_SAMPLES ?? '100', 10);
const warmups = Number.parseInt(process.env.NOX_CLASS_WARMUPS ?? '20', 10);
assert(Number.isSafeInteger(samples) && samples > 1, 'NOX_CLASS_SAMPLES must exceed one');
assert(Number.isSafeInteger(warmups) && warmups >= 0, 'NOX_CLASS_WARMUPS must be non-negative');

const pipeline = defineNativePipeline({
  phases: [
    {
      name: 'focused-private-features',
      native: {
        transforms: {
          privateMethods: { loose: true },
          privatePropertyInObject: { loose: true },
        },
        helpers: { mode: 'inline' },
        comments: false,
      },
    },
  ],
});

function sourceFor(selected, total = 400) {
  assert(selected <= total);
  return Array.from({ length: total }, (_, index) =>
    index < selected
      ? `class Value${index}{#read(value){return value+${index}}read(value){return this.#read(value)}owns(value){return #read in value}}sink(new Value${index}().read(1));`
      : `class Value${index}{readInner(value){return value+${index}}read(value){return this.readInner(value)}owns(value){return "readInner" in value}}sink(new Value${index}().read(1));`,
  ).join('\n');
}

const workloads = [0, 25, 100, 400].map(selected => ({
  name: `${selected}-of-400-selected`,
  selected,
  source: sourceFor(selected),
}));

function quantile(sorted, percentile) {
  return sorted[Math.ceil(percentile * sorted.length) - 1];
}

function summarize(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return {
    samples: values.length,
    meanMs: mean,
    medianMs: quantile(sorted, 0.5),
    p75Ms: quantile(sorted, 0.75),
    p95Ms: quantile(sorted, 0.95),
    p99Ms: quantile(sorted, 0.99),
    confidence95Ms: 1.96 * Math.sqrt(variance / values.length),
  };
}

function run(workload) {
  const started = performance.now();
  const result = transform(workload.source, 'classes.js', pipeline);
  assert.equal(result.status, 'complete');
  return { elapsed: performance.now() - started, outputBytes: Buffer.byteLength(result.code) };
}

for (let index = 0; index < warmups; index++) {
  for (const workload of index % 2 === 0 ? workloads : [...workloads].reverse()) run(workload);
}

const timings = new Map(workloads.map(workload => [workload.name, []]));
const outputBytes = new Map();
for (let sample = 0; sample < samples; sample++) {
  const order = sample % 2 === 0 ? workloads : [...workloads].reverse();
  for (const workload of order) {
    const result = run(workload);
    timings.get(workload.name).push(result.elapsed);
    outputBytes.set(workload.name, result.outputBytes);
  }
}

const results = workloads.map(workload => ({
  name: workload.name,
  selectedClasses: workload.selected,
  totalClasses: 400,
  sourceBytes: Buffer.byteLength(workload.source),
  outputBytes: outputBytes.get(workload.name),
  ...summarize(timings.get(workload.name)),
}));
const noOp = results[0].meanMs;
for (const result of results) {
  result.incrementalMeanMs = result.meanMs - noOp;
  result.incrementalUsPerSelectedClass =
    result.selectedClasses === 0 ? 0 : ((result.meanMs - noOp) * 1_000) / result.selectedClasses;
}

process.stdout.write(`${JSON.stringify({ samples, warmups, results }, null, 2)}\n`);
