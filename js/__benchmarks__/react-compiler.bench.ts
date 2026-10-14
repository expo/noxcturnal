import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native, nativePreflightOptions } from '../native/binding';
import type { PreflightPlan } from '../preflight/types';

const require = createRequire(import.meta.url);
const baselinePath = process.env.NOXCTURNAL_BENCH_BASELINE_ADDON;
const addons = [
  ...(baselinePath ? [['baseline', require(baselinePath)] as const] : []),
  [
    'candidate',
    process.env.NOXCTURNAL_BENCH_CANDIDATE_ADDON
      ? require(process.env.NOXCTURNAL_BENCH_CANDIDATE_ADDON)
      : native,
  ] as const,
];
const compiler = {
  compilationMode: 'infer',
  panicThreshold: 'none',
  target: '19',
  enableResetCacheOnSourceFileChanges: false,
} as const;
const components = Array.from(
  { length: 40 },
  (_, i) => `export function App${i}({value}) {return <div>{value+${i}}</div>}`,
).join('\n');
const cases: { name: string; source: string; plan: PreflightPlan }[] = [
  {
    name: 'compiler 40 components reset off',
    source: components,
    plan: { reactCompiler: compiler, jsx: 'classic' },
  },
  {
    name: 'compiler 40 components reset on',
    source: components,
    plan: {
      reactCompiler: { ...compiler, enableResetCacheOnSourceFileChanges: true },
      jsx: 'classic',
    },
  },
  {
    name: 'recover 40 unsupported components with Refresh',
    source: Array.from(
      { length: 40 },
      (_, i) => `export function App${i}(){class Box{} return <div/>}`,
    ).join('\n'),
    plan: { reactCompiler: compiler, reactRefresh: true, jsx: 'classic' },
  },
  {
    name: 'Refresh 100 hook components',
    source: Array.from(
      { length: 100 },
      (_, i) => `function App${i}(){const [v]=useState(${i});return v}`,
    ).join('\n'),
    plan: { reactRefresh: true },
  },
];
for (const entry of cases) {
  const options = nativePreflightOptions(entry.plan);
  describe(entry.name, () => {
    for (const [name, addon] of addons) {
      const run = () => addon.runNativePipeline('input.jsx', entry.source, [options]);
      console.log(`${entry.name} ${name}: ${Buffer.byteLength(run().code)} output bytes`);
      bench(name, run);
    }
  });
}
