// node js/__benchmarks__/react-cache-comparison.mjs BASELINE_ADDON CANDIDATE_ADDON
// Emitted-cache microbenchmark only; React renderer semantics are tested separately.
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { transformSync } from 'esbuild';
const require = createRequire(import.meta.url);
const cases = [];
for (const [name, path] of [
  ['baseline', process.argv[2]],
  ['candidate', process.argv[3]],
]) {
  if (!path) throw new Error('Supply baseline and candidate addon paths');
  const addon = require(path);
  for (const reset of [false, true]) {
    const code = addon.runNativePipeline(
      'input.js',
      `export function useValue(value){'use memo';return {value,tag:'test'}}`,
      [
        {
          reactCompiler: true,
          reactCompilerCompilationMode: 'infer',
          reactCompilerPanicThreshold: 'none',
          reactCompilerTarget: '19',
          reactCompilerEnableResetCacheOnSourceFileChanges: reset,
        },
      ],
    ).code;
    const cache = [];
    const module = { exports: {} };
    new Function('module', 'exports', 'require', transformSync(code, { format: 'cjs' }).code)(
      module,
      module.exports,
      () => ({
        c(size) {
          if (!cache.length)
            for (let i = 0; i < size; i++) cache[i] = Symbol.for('react.memo_cache_sentinel');
          return cache;
        },
      }),
    );
    cases.push({
      name: `${name} reset=${reset}`,
      run: module.exports.useValue,
      code,
      times: [],
      bytes: Buffer.byteLength(code),
    });
  }
}
if (cases[0].code !== cases[2].code) throw new Error('Reset-disabled output unexpectedly changed');
const iterations = 2_000_000;
let sink = 0;
function run(entry) {
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < iterations; i++) sum += entry.run(1).value;
  sink += sum;
  return ((performance.now() - start) * 1e6) / iterations;
}
for (let warmup = 0; warmup < 5; warmup++) for (const entry of cases) run(entry);
for (let sample = 0; sample < 15; sample++) {
  const order = sample % 2 ? [...cases].reverse() : cases;
  for (const entry of order) entry.times.push(run(entry));
}
console.log(
  JSON.stringify(
    {
      sink,
      iterations,
      samples: 15,
      results: cases.map(({ name, times, bytes }) => ({
        name,
        bytes,
        medianNs: [...times].sort((a, b) => a - b)[7],
        times,
      })),
    },
    null,
    2,
  ),
);
