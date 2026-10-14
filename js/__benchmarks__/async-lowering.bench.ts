import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native } from '../native/binding';

const require = createRequire(import.meta.url);
const bindings: [string, typeof native][] = [['patched', native]];
// Optional immutable baseline addon, compiled with the same Rust profile and target.
if (process.env.NOXCTURNAL_BENCH_BASELINE) {
  bindings.unshift(['baseline', require(process.env.NOXCTURNAL_BENCH_BASELINE)]);
}
const options = {
  asyncFunctions: true,
  asyncGeneratorFunctions: true,
  helpersMode: 'runtime',
  helpersVersion: '7.29.7',
  comments: false,
};
const sources = {
  functions: Array.from(
    { length: 75 },
    (_, i) => `async function read${i}(value) { return await value; }`,
  ).join('\n'),
  methods: Array.from(
    { length: 75 },
    (_, i) => `const owner${i} = { async read(value = 1) { return await value; } };`,
  ).join('\n'),
  iteration: Array.from(
    { length: 75 },
    (_, i) =>
      `async function collect${i}(items) { const out = []; for await (const value of items) out.push(value); return out; }`,
  ).join('\n'),
};
for (const [scenario, source] of Object.entries(sources)) {
  describe(`async lowering: ${scenario} (75 functions)`, () => {
    for (const [label, binding] of bindings) {
      const compile = () => {
        const result = binding.nativePreflightTransform(source, 'input.js', options);
        if (result.status !== 'complete') throw new Error(JSON.stringify(result));
        return result.code!;
      };
      console.info(`${label} ${scenario}: ${Buffer.byteLength(compile())} output bytes`);
      bench(label, compile);
    }
  });
}
for (const [scenario, parameter] of [
  ['simple', 'value'],
  ['default', 'value = 1'],
] as const) {
  describe(`async method runtime: ${scenario}`, () => {
    for (const [label, binding] of bindings) {
      const result = binding.nativePreflightTransform(
        `globalThis.read = ({async read(${parameter}) { return value + 1; }}).read;`,
        'input.js',
        options,
      );
      if (result.status !== 'complete') throw new Error(JSON.stringify(result));
      const context: { read?: (value: number) => Promise<number> } = {};
      new Function('globalThis', 'require', result.code!)(context, require);
      bench(label, async () => {
        if ((await context.read!(3)) !== 4) throw new Error('wrong value');
      });
    }
  });
}
