import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

// Compare independent, already-built checkouts; neither addon is rebuilt here.
const require = createRequire(import.meta.url);
const baseline = require(process.env.NOXCTURNAL_BENCH_BASELINE);
const fixed = require('../dist/noxcturnal.js');
const repeat = source => source.repeat(100);
const cases = {
  declarations: `function run(){${Array.from({ length: 500 }, (_, i) => `let v${i}=${i};use(v${i});`).join('')}}`,
  captures: `function run(){const reads=[];${repeat('for(let i=0;i<3;i++)reads.push(()=>i);')}return reads.map(read=>read());}`,
  nestedCaptures: `function run(){const reads=[];${repeat('for(let i=0;i<3;i++){reads.push(()=>i);for(let j=0;j<2;j++)reads.push(()=>[i,j]);}')}return reads.map(read=>read());}`,
  generatorFinally: `function* collect(){${repeat('for(let i=0;i<3;i++){yield ()=>i;try{}finally{i++;}}')}}function run(){return [...collect()].map(read=>read());}`,
  yieldingFinally: `function* collect(){${repeat('for(let i=0;i<3;i++){yield ()=>i;try{}finally{i++;yield ()=>i;}}')}}function run(){return [...collect()].map(read=>read());}`,
  privateClasses: Array.from(
    { length: 100 },
    (_, i) => `class C${i}{#value=1;#method(){}read(){let x=this.#value;return x;}}`,
  ).join(''),
};
const report = {
  node: process.version,
  build: 'development',
  samples: 7,
  transform: {},
  runtime: {},
};
function median(work, count) {
  for (let i = 0; i < count; i++) work();
  const samples = [];
  for (let batch = 0; batch < 7; batch++) {
    const start = performance.now();
    for (let i = 0; i < count; i++) work();
    samples.push((performance.now() - start) / count);
  }
  return samples.sort((a, b) => a - b)[3];
}
for (const [name, source] of Object.entries(cases)) {
  report.transform[name] = {};
  if (name === 'captures' || name === 'generatorFinally' || name === 'yieldingFinally')
    report.runtime[name] = {};
  for (const [label, api] of [
    ['baseline', baseline],
    ['fixed', fixed],
  ]) {
    const pipeline = api.defineNativePipeline({
      phases: [
        {
          name: 'block',
          native: { transforms: { blockScoping: true }, helpers: { mode: 'inline' } },
        },
      ],
    });
    const compile = () => api.transform(source, 'bench.js', pipeline);
    const output = compile();
    assert.equal(output.status, 'complete');
    report.transform[name][label] = {
      milliseconds: median(compile, 25),
      bytes: output.code.length,
    };
    if (report.runtime[name]) {
      const run = new Function(`${output.code};return run;`)();
      const native = new Function(`${source};return run;`)();
      assert.deepEqual(run(), native());
      report.runtime[name][label] = { microseconds: median(run, 5000) * 1000 };
    }
  }
}
console.log(JSON.stringify(report, null, 2));
