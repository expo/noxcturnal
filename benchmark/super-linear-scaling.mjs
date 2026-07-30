import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { defineNativePipeline, transform } from '../dist/index.js';

const sizes = [128, 256, 512, 1_024];
const samples = Number.parseInt(process.env.NOX_SCALING_SAMPLES ?? '10', 10);
const warmups = Number.parseInt(process.env.NOX_SCALING_WARMUPS ?? '3', 10);

const cases = [
  {
    name: 'sibling-classes',
    options: {
      classes: true,
      classProperties: { loose: true },
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    },
    source: count =>
      Array.from(
        { length: count },
        (_, index) => `class C${index}{#x=${index};get(){return this.#x}has(v){return #x in v}}`,
      ).join('\n'),
  },
  {
    name: 'sibling-arrows',
    options: { parameters: true },
    source: count =>
      Array.from(
        { length: count },
        (_, index) => `const a${index}=(value=${index})=>this.x+value+arguments.length;`,
      ).join('\n'),
  },
  {
    name: 'nested-for-of',
    options: { forOf: true },
    source: count =>
      `${'for(const value of values){'.repeat(count)}sink(value);${'}'.repeat(count)}`,
  },
  {
    name: 'destructuring-reservations',
    options: { destructuring: { useBuiltIns: true } },
    source: count =>
      Array.from(
        { length: count },
        (_, index) => `const [a${index},b${index}]=values${index};`,
      ).join('\n'),
  },
  {
    name: 'captured-loops',
    options: { blockScoping: true },
    source: count =>
      Array.from(
        { length: count },
        (_, index) => `for(let i${index}=0;i${index}<1;i${index}++){queue(()=>i${index});}`,
      ).join('\n'),
  },
  {
    name: 'enabled-but-unused',
    options: {
      classes: true,
      classProperties: { loose: true },
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
      parameters: true,
      forOf: true,
      destructuring: { useBuiltIns: true },
      blockScoping: true,
    },
    source: count => Array.from({ length: count }, (_, index) => `sink(${index});`).join('\n'),
  },
  {
    name: 'unused-control',
    options: {},
    source: count => Array.from({ length: count }, (_, index) => `sink(${index});`).join('\n'),
  },
  {
    name: 'nested-destructuring-fixpoint',
    sizes: [8, 16, 32, 64],
    options: { destructuring: { useBuiltIns: true } },
    source: count => {
      let statement = 'sink(value);';
      for (let index = count - 1; index >= 0; index--)
        statement = `const [value${index}=(()=>{${statement}return value;})()]=source;`;
      return statement;
    },
  },
];

function pipeline(options) {
  return defineNativePipeline({
    phases: [
      {
        name: 'scaling',
        native: {
          transforms: options,
          helpers: { mode: 'inline' },
          comments: false,
        },
      },
    ],
  });
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

const results = [];
for (const benchmark of cases) {
  const prepared = pipeline(benchmark.options);
  for (const size of benchmark.sizes ?? sizes) {
    const source = benchmark.source(size);
    const run = () => {
      const started = performance.now();
      const result = transform(source, `${benchmark.name}.js`, prepared);
      assert.equal(result.status, 'complete', result.reason);
      return {
        elapsed: performance.now() - started,
        outputBytes: Buffer.byteLength(result.code),
      };
    };
    for (let index = 0; index < warmups; index++) run();
    const runs = Array.from({ length: samples }, run);
    const timings = runs.map(run => run.elapsed);
    results.push({
      workload: benchmark.name,
      size,
      sourceBytes: Buffer.byteLength(source),
      outputBytes: runs[0].outputBytes,
      medianMs: median(timings),
      meanMs: timings.reduce((sum, value) => sum + value, 0) / timings.length,
    });
  }
}

process.stdout.write(
  `${JSON.stringify(
    {
      profile: 'release',
      samples,
      warmups,
      sizes,
      results,
      regressionCoverage: [
        'Rust tests cover large sibling class and arrow fact sets.',
        'Rust tests cover deep for-of planning and large capture batches.',
        'Deferred-copy tests cover distinct ranges and transparent move holes.',
        'Visitor skip comparisons are bounded linearly across independent ranges.',
        'The enabled-but-unused workload measures aggregate fixed overhead without matching syntax.',
      ],
    },
    null,
    2,
  )}\n`,
);
