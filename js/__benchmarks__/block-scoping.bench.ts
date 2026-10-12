import { bench } from 'vitest';
import { defineNativePipeline, transform } from '../index';

const pipeline = defineNativePipeline({
  phases: [{ name: 'block-scoping', native: { transforms: { blockScoping: true } } }],
});

function measure(name: string, source: string) {
  const run = () => {
    const result = transform(source, 'block-scoping-benchmark.js', pipeline);
    if (result.status !== 'complete') throw new Error(result.reason);
    return result.code.length;
  };
  run();
  bench(name, run);
}

for (const count of [10, 100]) {
  measure(
    `captured generator siblings: ${count}`,
    `function* run() { ${'for (let i = 0; i < 3; i++) { yield () => i; consume(arguments); }'.repeat(count)} }`,
  );
  measure(
    `hoisted bindings: ${count}`,
    `function run() { for (let i = 0; i < 3; i++) { consume(() => i); ${Array.from({ length: count }, (_, i) => `var v${i} = i;`).join('')} } }`,
  );
}

measure('uncaptured loops: 100', 'for (let i = 0; i < 3; i++) consume(i);'.repeat(100));

measure(
  'initializer-only captures: 100 loops',
  'for (let read = () => i, i = 0; i < 3; i++) consume(read());'.repeat(100),
);

for (const count of [1, 32]) {
  const bindings = Array.from({ length: count }, (_, i) => `v${i}`);
  const result = transform(
    `function run() {
      let read;
      for (let i = 0, ${bindings.map(name => `${name} = 0`).join(',')}; i < 1000; i++) {
        read = () => [${bindings.join(',')}];
        try { continue; } finally { ${bindings.map(name => `${name}++;`).join('')} }
      }
      return read();
    }`,
    'finally-benchmark.js',
    pipeline,
  );
  if (result.status !== 'complete') throw new Error(result.reason);
  const run = new Function(`${result.code}; return run;`)() as () => number[];
  if (run().some(value => value !== 1000)) throw new Error('incorrect binding copy-back');
  bench(`finally execution: ${count} bindings, 1,000 iterations`, run);
}
