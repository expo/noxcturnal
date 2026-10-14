import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { bench, describe, expect } from 'vitest';
import { native } from '../native/binding';

// Compare immutable debug addons without rebuilding either checkout. The baseline
// must be the audited revision, not a worktree containing other fixes.
const require = createRequire(import.meta.url);
interface Addon {
  nativePreflightTransform(
    source: string,
    filename: string,
    options: { optionalChaining: boolean; helpersMode: string },
  ): { status: string; code: string };
}
const addons: [string, Addon][] = [['fixed', native as Addon]];
if (process.env.NOXCTURNAL_OPTIONAL_BASELINE) {
  addons.unshift(['baseline', require(resolve(process.env.NOXCTURNAL_OPTIONAL_BASELINE))]);
}
const workloads = [
  ['reads', 'function run(o){return o?.a?.b}'],
  ['stable receiver', 'function run(o){return o.m?.()}'],
  [
    'mutable receiver',
    'function run(o){let receiver=o;const value=receiver.m?.();receiver=null;return value}',
  ],
  ['nested parameter', 'function run(o, unused=(()=>0)(), value=o?.m?.()){return value}'],
  ['grouped access', 'function run(o){return (o?.a).b?.c}'],
] as const;
for (const [name, source] of workloads) {
  describe(name, () => {
    for (const [label, addon] of addons) {
      const compile = (input: string) => {
        const result = addon.nativePreflightTransform(input, 'benchmark.js', {
          optionalChaining: true,
          helpersMode: 'inline',
        });
        if (result.status !== 'complete') throw new Error(result.status);
        return result.code;
      };
      const large = Array.from({ length: 100 }, (_, i) => source.replace('run(', `run${i}(`)).join(
        '\n',
      );
      const code = compile(source);
      console.log(`${label} ${name}: ${code.length} output bytes`);
      bench(`${label}: compile 100 functions`, () => compile(large));
      const run = new Function(`${code}; return run`)() as (value: object) => unknown;
      const object = {
        a: { b: { c: 1 } },
        m() {
          return 1;
        },
      };
      expect(run(object)).toEqual(name === 'reads' ? object.a.b : 1);
      bench(`${label}: execute`, () => run(object));
    }
  });
}
