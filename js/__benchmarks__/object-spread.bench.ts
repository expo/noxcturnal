import { bench } from 'vitest';
import { defineNativePipeline, transform, type PreflightPlan } from '../index';

for (const [name, source, options] of [
  [
    'classic JSX: 100 spread props',
    'const nodes=[' + '<div {...input} value={1}/>,'.repeat(100) + '];',
    { jsx: 'classic' },
  ],
  [
    'classic JSX: 100 ordinary elements',
    'const nodes=[' + '<div value={1}/>,'.repeat(100) + '];',
    { jsx: 'classic' },
  ],
  [
    'classic JSX option: 100 ordinary objects',
    'const nodes=[' + '{...input,value:1},'.repeat(100) + '];',
    { jsx: 'classic' },
  ],
  [
    'strict built-ins: 100 spread objects',
    'const nodes=[' + '{...input,value:1},'.repeat(100) + '];',
    { transforms: { objectRestSpread: { loose: false, useBuiltIns: true } } },
  ],
  [
    'strict default: 100 spread objects',
    'const nodes=[' + '{...input,value:1},'.repeat(100) + '];',
    { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } } },
  ],
] as [string, string, PreflightPlan][]) {
  const pipeline = defineNativePipeline({
    phases: [{ name: 'spread', native: { ...options, helpers: { mode: 'inline' } } }],
  });
  const result = transform(source, 'bench.jsx', pipeline);
  if (result.status !== 'complete') throw new Error(JSON.stringify(result));
  console.log(`${name}: ${result.code.length} output bytes`);
  bench(name, () => {
    transform(source, 'bench.jsx', pipeline);
  });
}
