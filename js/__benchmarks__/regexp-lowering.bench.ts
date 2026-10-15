import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native } from '../native/binding';

const require = createRequire(import.meta.url);
const bindings: [string, typeof native][] = [['patched', native]];
if (process.env.NOXCTURNAL_BENCH_BASELINE) {
  bindings.unshift(['baseline', require(process.env.NOXCTURNAL_BENCH_BASELINE)]);
}
const scenarios = [
  {
    name: 'ASCII Unicode class',
    pattern: '/^[a-z0-9]+$/u',
    count: 100,
    options: { regexpUnicode: true },
  },
  {
    name: 'dot-all backtracking',
    pattern: '/^(.*)(.)$/su',
    count: 100,
    options: { regexpUnicode: true },
  },
  {
    name: 'named reference',
    pattern: String.raw`/(?<word>[a-z]+)-\k<word>/`,
    count: 100,
    options: { regexpNamedCaptureGroups: true },
  },
  {
    name: 'case-folded set intersection',
    pattern: '/^[[a-z]&&[A-Z]]$/iv',
    count: 100,
    options: { regexpUnicodeSets: true },
  },
  {
    name: 'Unicode letter property',
    pattern: String.raw`/^[\p{Letter}]+$/u`,
    count: 5,
    options: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
  },
];
for (const scenario of scenarios) {
  describe(`regexp lowering: ${scenario.name} (${scenario.count} literals)`, () => {
    const source = Array.from(
      { length: scenario.count },
      (_, index) => `const re${index}=${scenario.pattern};`,
    ).join('\n');
    for (const [label, binding] of bindings) {
      const compile = () => {
        const result = binding.nativePreflightTransform(source, 'input.js', {
          ...scenario.options,
          helpersMode: 'runtime',
          helpersVersion: '7.29.7',
        });
        if (result.status !== 'complete') throw new Error(JSON.stringify(result));
        return result.code!;
      };
      console.info(`${label} ${scenario.name}: ${Buffer.byteLength(compile())} output bytes`);
      bench(label, compile);
    }
  });
}
describe('lowered dot-all runtime (valid astral pairs and line terminators)', () => {
  for (const [label, binding] of bindings) {
    const result = binding.nativePreflightTransform(
      'function run(value){return /^.*$/su.test(value)}',
      'input.js',
      { regexpUnicode: true },
    );
    if (result.status !== 'complete') throw new Error(JSON.stringify(result));
    const run = new Function(result.code! + ';return run;')() as (value: string) => boolean;
    const input = 'Hello 😀 world\n'.repeat(10);
    bench(label, () => {
      if (!run(input)) throw new Error('unexpected mismatch');
    });
  }
});
