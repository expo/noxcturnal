import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native } from '../native/binding';

const require = createRequire(import.meta.url);
const bindings: [string, typeof native][] = [['patched', native]];
if (process.env.NOXCTURNAL_BENCH_BASELINE) {
  bindings.unshift(['baseline', require(process.env.NOXCTURNAL_BENCH_BASELINE)]);
}
const options = { forOf: true, helpersMode: 'inline', comments: false };
const source = Array.from(
  { length: 100 },
  (_, i) =>
    `function sum${i}(values) { let sum = 0; for (const value of values) sum += value; return sum; }`,
).join('\n');

describe('for-of compilation: 100 loops', () => {
  for (const [label, binding] of bindings) {
    const compile = () => {
      const result = binding.nativePreflightTransform(source, 'input.js', options);
      if (result.status !== 'complete') throw new Error(JSON.stringify(result));
      return result.code!;
    };
    console.info(`${label}: ${Buffer.byteLength(compile())} output bytes`);
    bench(label, compile);
  }
});

for (const length of [0, 1, 100]) {
  for (const [scenario, values] of [
    ['array', Array.from({ length }, (_, i) => i)],
    [
      'generic',
      {
        *[Symbol.iterator]() {
          for (let i = 0; i < length; i++) yield i;
        },
      },
    ],
  ] as const) {
    describe(`for-of runtime: ${scenario}, ${length} elements`, () => {
      for (const [label, binding] of bindings) {
        const result = binding.nativePreflightTransform(
          'globalThis.sum = function(values) { let sum = 0; for (const value of values) sum += value; return sum; };',
          'input.js',
          options,
        );
        if (result.status !== 'complete') throw new Error(JSON.stringify(result));
        const context: { sum?: (values: Iterable<number>) => number } = {};
        new Function('globalThis', result.code!)(context);
        bench(label, () => {
          if (context.sum!(values) !== (length * (length - 1)) / 2) throw new Error('wrong sum');
        });
      }
    });
  }
}
