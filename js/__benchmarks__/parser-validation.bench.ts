import { bench, describe } from 'vitest';
import * as current from '../index';

const baselineRoot = process.env.NOXCTURNAL_BASELINE_ROOT;
const implementations: [string, typeof current][] = [['fixed', current]];
if (baselineRoot)
  implementations.unshift(['baseline', await import(`${baselineRoot}/js/index.ts`)]);
if (process.env.NOXCTURNAL_BENCH_REVERSE) implementations.reverse();

const sources: [string, string][] = [1, 100, 1000].map(count => [
  `${count} functions`,
  Array.from(
    { length: count },
    (_, i) => `function f${i}(value) { const local = value + ${i}; return local; }`,
  ).join('\n'),
]);
sources.push(
  ['dense bindings', Array.from({ length: 1000 }, (_, i) => `let v${i}=${i};`).join('')],
  ['nested scopes', '{let value=1;'.repeat(100) + 'consume(value);' + '}'.repeat(100)],
  ['large comment', '/*' + 'comment '.repeat(8000) + '*/ function f(value){ return value; }'],
);

for (const [label, api] of implementations) {
  if (process.env.NOXCTURNAL_BENCH_ONLY && process.env.NOXCTURNAL_BENCH_ONLY !== label) continue;
  const pipelines = {
    identity: api.defineNativePipeline({ phases: [] }),
    visitor: api.defineNativePipeline({
      phases: [
        {
          name: 'visit',
          plugins: [
            api.defineNativePlugin({
              name: 'visit',
              visitors: [api.defineVisitor('Program', {}, () => {})],
            }),
          ],
        },
      ],
    }),
    scope: api.defineNativePipeline({
      phases: [
        {
          name: 'scope',
          plugins: [
            api.defineNativePlugin({
              name: 'scope',
              visitors: [api.defineVisitor('Program', { scope: true }, () => {})],
            }),
          ],
        },
      ],
    }),
    optimize: api.defineNativePipeline({
      phases: [{ name: 'optimize', native: { optimize: { constantFolding: true } } }],
    }),
    dce: api.defineNativePipeline({
      phases: [{ name: 'dce', native: { optimize: { deadCodeElimination: true } } }],
    }),
    parameters: api.defineNativePipeline({
      phases: [{ name: 'parameters', native: { transforms: { parameters: true } } }],
    }),
  };
  describe(label, () => {
    for (const [shape, source] of sources) {
      // Rotate prebuilt inputs: avoid timing source construction and prevent a
      // last-source validation cache from disguising cold validation costs.
      const inputs = Array.from({ length: 64 }, (_, i) => `${source}\n// input ${i}`);
      for (const [name, pipeline] of Object.entries(pipelines)) {
        let index = 0;
        const run = () => {
          const result = api.transform(inputs[index++ % inputs.length], 'bench.js', pipeline);
          if (result.status !== 'complete') throw new Error(result.reason);
        };
        run();
        bench(`${name} / ${shape}`, run, { time: 500, warmupTime: 200 });
      }
    }
    for (const [name, pipeline] of Object.entries(pipelines))
      bench(`cache key / ${name}`, () => api.pipelineCacheKey(pipeline, 'bench.js'), {
        time: 500,
        warmupTime: 200,
      });
  });
}
