// Compare the current debug addon with a pre-change addon copied before rebuilding.
// Usage: node scripts/benchmark-jsx.mjs /path/to/baseline.node
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
const require = createRequire(import.meta.url);
const baseline = require(resolve(process.argv[2]));
const current = require(resolve('noxcturnal.darwin-arm64.node'));
const cases = [
  [
    'production-200',
    Array.from({ length: 200 }, (_, i) => `const v${i}=<div title="hello">plain text</div>;`).join(
      '\n',
    ),
    'classic',
    20,
  ],
  [
    'normalized-200',
    Array.from(
      { length: 200 },
      (_, i) => `const v${i}=<div title="first\n second">first\n  second\t end</div>;`,
    ).join('\n'),
    'classic',
    20,
  ],
  ...[100, 500, 1000].map(n => [
    `development-one-line-${n}`,
    Array.from({ length: n }, (_, i) => `const v${i}=<div title="😀">hello</div>;`).join(''),
    'classic-development',
    5,
  ]),
  ...[8000, 16000].map(n => [
    `blank-comment-${n}`,
    `/**${' \n'.repeat(n)}*/ const v=<div/>;`,
    'classic',
    5,
  ]),
];
const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const result = [];
for (const [name, source, jsx, iterations] of cases) {
  const run = addon => {
    const out = addon.nativePreflightTransform(source, '/audit/view.jsx', {
      jsx,
      helpersMode: 'inline',
    });
    if (out.status !== 'complete') throw Error(JSON.stringify(out));
    return out.code;
  };
  const outputs = [run(baseline), run(current)];
  for (let i = 0; i < 8; i++) {
    run(baseline);
    run(current);
  }
  const samples = [[], []];
  for (let round = 0; round < 15; round++)
    for (const index of round % 2 ? [1, 0] : [0, 1]) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) run(index ? current : baseline);
      samples[index].push((performance.now() - start) / iterations);
    }
  result.push({
    name,
    sourceBytes: Buffer.byteLength(source),
    baselineMs: median(samples[0]),
    currentMs: median(samples[1]),
    baselineBytes: Buffer.byteLength(outputs[0]),
    currentBytes: Buffer.byteLength(outputs[1]),
    samples,
  });
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      build: 'debug',
      result,
    },
    null,
    2,
  ),
);
