import assert from 'node:assert/strict';
import { bench, describe } from 'vitest';
import * as candidate from '../index';
import type { PreflightPlan } from '../index';

// Build both checkouts with pnpm build:release, then supply the baseline root.
// Compare matched profiles without other builds/tests running in parallel.
const baselineRoot = process.env.NOXCTURNAL_BENCH_BASELINE_ROOT;
const baseline: typeof candidate | undefined = baselineRoot
  ? await import(`${baselineRoot}/js/index.ts`)
  : undefined;
const implementations = [
  ...(baseline ? [['baseline', baseline] as const] : []),
  ['candidate', candidate] as const,
];
if (process.env.NOXCTURNAL_BENCH_REVERSE === '1') implementations.reverse();

const compiler = {
  compilationMode: 'infer',
  panicThreshold: 'none',
  target: '19',
  enableResetCacheOnSourceFileChanges: false,
} as const;
const helpers = { mode: 'runtime', version: '7.29.7' } as const;
const sections = Array.from(
  { length: 75 },
  (_, i) => `
  <section key="${i}" onClick={() => onSelect(${i}, data.items[${i}])}>
    <h2>{data.titles[${i}]} {count + ${i}}</h2>
    {flag && <p>{data.notes[${i}]}</p>}
    <ul>{data.items.map(item => <li key={item.id}>{item.label} {format(item.value * ${i})}</li>)}</ul>
    <Child data={{value: data.values[${i}], extra: count}}/>
  </section>`,
).join('\n');
const react = Array.from(
  { length: 40 },
  (_, i) => `export function Component${i}({value}) {return <div>{value + ${i}}</div>}`,
).join('\n');
const cases: { name: string; filename: string; source: string; plan: PreflightPlan }[] = [
  {
    name: 'mapped TypeScript and JSX (100 components)',
    filename: 'input.tsx',
    source:
      'type Props = {value: number};\n' +
      Array.from(
        { length: 100 },
        (_, i) =>
          `export function Component${i}(props: Props) {return <View value={props.value + ${i}}/>}`,
      ).join('\n'),
    plan: { typescript: 'strip', jsx: 'automatic', helpers },
  },
  {
    name: 'async lowering (75 functions)',
    filename: 'input.js',
    source: Array.from(
      { length: 75 },
      (_, i) => `async function read${i}(value = 1) {return await value;}`,
    ).join('\n'),
    plan: { transforms: { asyncFunctions: true }, helpers },
  },
  {
    name: 'private class lowering (50 classes)',
    filename: 'input.js',
    source: Array.from(
      { length: 50 },
      (_, i) =>
        `class Class${i} { #value = ${i}; #read() {return this.#value} read() {return this.#read()} }`,
    ).join('\n'),
    plan: { transforms: { classProperties: { loose: false }, privateMethods: true }, helpers },
  },
  ...[false, true].map(reset => ({
    name: `React Compiler (40 components, reset=${reset})`,
    filename: 'input.jsx',
    source: react,
    plan: {
      reactCompiler: { ...compiler, enableResetCacheOnSourceFileChanges: reset },
      jsx: 'classic' as const,
    },
  })),
  {
    name: 'React Compiler (large single component)',
    filename: 'input.jsx',
    source: `import {useState} from 'react'; export function Large({data,flag,onSelect}) {
      const [count,setCount] = useState(0);
      return <div onClick={() => setCount(count + 1)}>${sections}</div>;
    }`,
    plan: { reactCompiler: compiler, jsx: 'classic' },
  },
];
for (const entry of cases)
  describe(entry.name, () => {
    for (const [label, api] of implementations) {
      const pipeline = api.defineNativePipeline({
        phases: [{ name: 'native', native: entry.plan }],
      });
      const run = () => {
        const result = api.transform(entry.source, entry.filename, pipeline);
        assert.equal(result.status, 'complete');
        return result;
      };
      const result = run();
      assert.notEqual(result.code, entry.source);
      if (entry.plan.reactCompiler) assert.match(result.code, /_c\(/);
      console.info(
        `${label}: ${entry.source.length} input chars, ${result.code.length} output chars`,
      );
      bench(label, run);
    }
  });
const visitorSource = Array.from(
  { length: 200 },
  (_, i) => `function fn${i}(value){const local=value+${i};return local+external}`,
).join('\n');
for (const scope of [false, true])
  describe(`visitor pipeline (200 functions, scope=${scope})`, () => {
    for (const [label, api] of implementations) {
      let delivered = 0;
      const visitor = scope
        ? api.defineVisitor('Function', { scope: true }, path => {
            assert.equal(path.scope.hasBinding('value'), true);
            delivered++;
          })
        : api.defineVisitor('Identifier', { fields: ['name'] }, () => {
            delivered++;
          });
      const pipeline = api.defineNativePipeline({
        phases: [
          {
            name: 'visitors',
            plugins: [api.defineNativePlugin({ name: 'observe', visitors: [visitor] })],
          },
        ],
      });
      const run = () => {
        delivered = 0;
        const result = api.transform(visitorSource, 'input.js', pipeline);
        assert.equal(result.status, 'complete');
        assert.ok(delivered > 0);
        return result;
      };
      run();
      bench(label, run);
    }
  });
