import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bench, describe } from 'vitest';

const fixed = fileURLToPath(new URL('../../', import.meta.url));
const baseline = process.env.NOXCTURNAL_BASELINE_ROOT;

function script(mode: 'import' | 'require'): string {
  const load =
    mode === 'import'
      ? `await import('noxcturnal')`
      : `createRequire(import.meta.url)('noxcturnal')`;
  return `
    import { createRequire } from 'node:module';
    const api = ${load};
    const pipeline = api.defineNativePipeline({ phases: [{
      name: 'parameters',
      native: { transforms: { parameters: true }, helpers: { mode: 'inline' } },
    }] });
    const result = api.transform('function read(value = 3) { return value; }', 'fixture.js', pipeline);
    if (result.status !== 'complete') throw new Error(String(result.status));
  `;
}

function timePackage(cwd: string, mode: 'import' | 'require'): void {
  execFileSync(process.execPath, ['--input-type=module', '--eval', script(mode)], {
    cwd,
    stdio: 'pipe',
  });
}

const cases: [string, string, 'import' | 'require'][] = [
  ['fixed', fixed, 'require'],
  ['fixed', fixed, 'import'],
];
if (baseline && existsSync(join(baseline, 'dist/noxcturnal.js')))
  cases.unshift(['baseline', baseline, 'require']);
if (process.env.NOXCTURNAL_BENCH_REVERSE) cases.reverse();

describe.skipIf(!existsSync(join(fixed, 'dist/noxcturnal.mjs')))('packaged entry', () => {
  for (const [label, cwd, mode] of cases)
    bench(`${label} ${mode} load and transform`, () => timePackage(cwd, mode), {
      time: 500,
      warmupTime: 200,
    });
});
