import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { bench } from 'vitest';
import { defineNativePipeline, transform } from '../index';

// Baseline mode records incorrect outputs but never times their execution.
const baseline = process.env.NOXCTURNAL_BENCH_BASELINE === '1';
const pipeline = defineNativePipeline({
  phases: [
    {
      name: 'block-scoping',
      native: { helpers: { mode: 'inline' }, transforms: { blockScoping: true } },
    },
  ],
});
const cases: { name: string; source: string; runtime?: boolean }[] = [];
const repeat = (body: string) => body.repeat(100);
const captures = (body: string) =>
  `function run() { const reads = []; ${repeat(body)} return reads.map(read => read()); }`;

cases.push(
  {
    name: 'no loops: 1000 declarations',
    source: `function run() { ${Array.from({ length: 1000 }, (_, i) => `let v${i} = ${i}; consume(v${i});`).join('')} }`,
  },
  {
    name: 'uncaptured: 100 loops',
    source: `function run() { let sum = 0; ${repeat('for (let i = 0; i < 3; i++) sum += i;')} return sum; }`,
    runtime: true,
  },
  {
    name: 'body captures: 100 loops',
    source: captures('for (let i = 0; i < 3; i++) reads.push(() => i);'),
    runtime: true,
  },
  {
    name: 'readonly const: 100 loops',
    source: captures('for (const i of [0, 1, 2]) reads.push(() => i);'),
    runtime: true,
  },
  {
    name: 'written const: 100 loops',
    source: captures('for (const i of [0, 1, 2]) { reads.push(() => i); try { i++; } catch {} }'),
    runtime: true,
  },
  {
    name: 'finally normal: 100 loops',
    source: captures(
      'for (let i = 0; i < 3; i++) { reads.push(() => i); try {} finally { i++; } }',
    ),
    runtime: true,
  },
  {
    name: 'finally continue: 100 loops',
    source: captures(
      'for (let i = 0, j = 0; i < 3; i++) { reads.push(() => [i, j]); try { continue; } finally { j++; } }',
    ),
    runtime: true,
  },
  {
    name: 'initializer-only: 100 loops',
    source: captures('for (let read = () => i, i = 0; i < 3; i++) reads.push(read);'),
    runtime: true,
  },
);

for (const argumentsRead of [false, true]) {
  cases.push({
    name: `generator ${argumentsRead ? 'arguments' : 'ordinary'}: 100 loops`,
    source: `function* collect(value) { ${repeat(`for (let i = 0; i < 3; i++) { yield () => i; ${argumentsRead ? 'yield () => arguments[0];' : ''} }`)} } function run() { return [...collect('outer')].map(read => read()); }`,
    runtime: true,
  });
}
for (const count of [10, 100, 1000]) {
  cases.push({
    name: `hoisted vars: ${count} bindings`,
    source: `function run() { const reads = []; for (let i = 0; i < 3; i++) { reads.push(() => i); ${Array.from({ length: count }, (_, n) => `var v${n} = i;`).join('')} } return [v${count - 1}, reads.map(read => read())]; }`,
    runtime: true,
  });
}
// Main is already correct when the var bindings are observed only inside the body.
// Keep this comparison separate from the out-of-loop hoisting regressions above.
for (const count of [100, 1000]) {
  cases.push({
    name: `var local uses: ${count} bindings`,
    source: `function run() { const reads = []; let sum = 0; for (let i = 0; i < 3; i++) { reads.push(() => i); ${Array.from({ length: count }, (_, n) => `var v${n} = i;`).join('')} sum += ${Array.from({ length: count }, (_, n) => `v${n}`).join('+')}; } return [sum, reads.map(read => read())]; }`,
    runtime: true,
  });
}
for (const depth of [4, 16]) {
  const names = Array.from({ length: depth }, (_, i) => `i${i}`);
  cases.push({
    name: `nested captures: depth ${depth}`,
    source: `function run() { const reads = []; ${names.map(name => `for (let ${name} = 0; ${name} < 1; ${name}++) {`).join('')} reads.push(() => [${names.join(',')}]); ${'}'.repeat(depth)} return reads.map(read => read()); }`,
    runtime: true,
  });
}

const observations: object[] = [];
for (const { name, source, runtime } of cases) {
  const compile = () => {
    const result = transform(source, 'block-scoping-comparison.js', pipeline);
    if (result.status !== 'complete') throw new Error(`${name}: ${result.reason}`);
    return result.code;
  };
  const code = compile();
  let correct: boolean | null = null;
  let error: string | undefined;
  if (runtime) {
    const expected = JSON.stringify(runInNewContext(`${source}; run()`, {}, { timeout: 1000 }));
    try {
      correct =
        JSON.stringify(runInNewContext(`${code}; run()`, {}, { timeout: 1000 })) === expected;
    } catch (caught) {
      correct = false;
      error = String(caught);
    }
    if (!correct && !baseline) throw new Error(`${name}: incorrect output ${error ?? ''}`);
  }
  observations.push({
    name,
    sourceBytes: Buffer.byteLength(source),
    outputBytes: Buffer.byteLength(code),
    outputHash: createHash('sha256').update(code).digest('hex'),
    correct,
    error,
  });
  bench(`transform / ${name}`, compile);
  if (runtime && correct) {
    const run = new Function(`${code}; return run;`)() as () => unknown;
    bench(`execute / ${name}`, run);
  }
}
if (process.env.NOXCTURNAL_BENCH_OBSERVATIONS) {
  writeFileSync(process.env.NOXCTURNAL_BENCH_OBSERVATIONS, JSON.stringify(observations, null, 2));
}
