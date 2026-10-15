// Build each checkout with pnpm build:release, then run one checkout per Node
// process: node js/__benchmarks__/visitor-planning-comparison.mjs CHECKOUT_ROOT.
// Repeat processes in alternating checkout order to avoid shared JIT feedback.
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { cpus } from 'node:os';

const root = resolve(process.argv[2] ?? '.');
const api = await import(pathToFileURL(join(root, 'dist/noxcturnal.mjs')).href);
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
let sink;
function measure(run) {
  // Adapt both warmup and batch length to each workload, including large files.
  let iterations = 1;
  let elapsed;
  do {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink = run();
    elapsed = performance.now() - start;
    if (elapsed < 20) iterations *= 2;
  } while (elapsed < 20 && iterations < 131072);
  const samples = [];
  for (let round = 0; round < 9; round++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink = run();
    samples.push(((performance.now() - start) * 1000) / iterations);
  }
  return {
    median_us: median(samples),
    min_us: Math.min(...samples),
    max_us: Math.max(...samples),
    iterations,
    samples_us: samples,
  };
}
const pipeline = plugin =>
  api.defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] });
const visitorPipeline = (scope, route = 'Program', controlFlow = []) =>
  pipeline(
    api.defineNativePlugin({
      name: 'scan',
      visitors: [
        api.defineVisitor(
          route,
          { scope, controlFlow, ...(route === 'Identifier' ? { fields: ['name'] } : {}) },
          () => {},
        ),
      ],
    }),
  );
if (process.argv[3] === 'memory') {
  const source = Array.from(
    { length: 10_000 },
    (_, i) => `function f${i}(value) { const local = value + ${i}; return local; }`,
  ).join('\n');
  let visits = 0;
  const plan = pipeline(
    api.defineNativePlugin({
      name: 'retained-fields',
      visitors: [
        api.defineVisitor('Identifier', { fields: ['name'] }, () => {
          visits++;
        }),
      ],
    }),
  );
  assert.equal(api.transform(source, 'bench.js', plan).status, 'complete');
  process.stdout.write(
    JSON.stringify({ root, visits, max_rss_kib: process.resourceUsage().maxRSS }) + '\n',
  );
  process.exit(0);
}
const cases = [];
const addTransform = (name, source, plan) => {
  const result = api.transform(source, 'bench.js', plan);
  assert.equal(result.status, 'complete', `${name} must complete`);
  cases.push([name, () => api.transform(source, 'bench.js', plan)]);
};
const empty = api.defineNativePipeline({ phases: [] });
const visit = visitorPipeline(false);
const scoped = visitorPipeline(true);
const native = optimize =>
  api.defineNativePipeline({ phases: [{ name: 'native', native: { optimize } }] });
const folding = native({ constantFolding: true });
const dce = native({ deadCodeElimination: true });
const parameters = api.defineNativePipeline({
  phases: [{ name: 'native', native: { transforms: { parameters: true } } }],
});
for (const size of [1, 100, 1000]) {
  const source = Array.from(
    { length: size },
    (_, i) => `function f${i}(value) { const local = value + ${i}; return local; }`,
  ).join('\n');
  // Distinct prebuilt inputs prevent a last-source cache hiding validation work.
  const inputs = Array.from({ length: 64 }, (_, i) => `${source}\n// input ${i}`);
  for (const [name, plan] of [
    ['identity', empty],
    ['visitor', visit],
    ['scope', scoped],
    ['folding', folding],
    ['parameters', parameters],
  ]) {
    if (size !== 100 && !['identity', 'visitor'].includes(name)) continue;
    let index = 0;
    assert.equal(api.transform(inputs[0], 'bench.js', plan).status, 'complete');
    cases.push([
      `${name} / ${size} functions`,
      () => api.transform(inputs[index++ % inputs.length], 'bench.js', plan),
    ]);
  }
}
const thousandFunctions = Array.from(
  { length: 1000 },
  (_, i) => `function f${i}(value) { return value + ${i}; }`,
).join('\n');
addTransform('folding / 1000 functions', thousandFunctions, folding);
addTransform('scope / 1000 functions', thousandFunctions, scoped);
addTransform('DCE / 1000 functions', thousandFunctions, dce);
const identifiers = Array.from({ length: 200 }, (_, i) => `consume(value${i});`).join('\n');
addTransform(
  'static dispatch / 400 identifiers',
  identifiers,
  visitorPipeline(false, 'Identifier'),
);
addTransform(
  'checked dispatch / 400 identifiers',
  identifiers,
  visitorPipeline(false, 'Identifier', ['skip']),
);
const leaf = [api.defineVisitor('Identifier', { fields: ['name'] }, () => {})];
addTransform(
  'nested replay / 400 identifiers',
  identifiers,
  pipeline(
    api.defineNativePlugin({
      name: 'nested',
      visitors: [
        api.defineVisitor('Program', { nested: leaf, controlFlow: ['nested-traverse'] }, path =>
          path.traverse(leaf),
        ),
      ],
    }),
  ),
);
for (const retained of [false, true]) {
  for (const comments of [false, true]) {
    const source = Array.from({ length: 200 }, () =>
      comments ? 'process /*comment*/ .env.NODE_ENV;' : 'process.env.NODE_ENV;',
    ).join('\n');
    addTransform(
      `${retained ? 'retained' : 'native predicate'} member / ${comments ? 'commented' : 'plain'} / 400 members`,
      source,
      pipeline(
        api.defineNativePlugin({
          name: 'member',
          visitors: [
            api.defineVisitor(
              retained ? 'MemberExpression' : 'StaticMemberExpression|ComputedMemberExpression',
              retained
                ? { fields: ['memberPath'] }
                : { where: { memberPath: { equals: 'process.env.NODE_ENV' } } },
              path => (retained ? path.matchesPattern('process.env.NODE_ENV') : undefined),
            ),
          ],
        }),
      ),
    );
  }
}
for (const side of ['enter', 'exit']) {
  for (const size of [32, 128, 512]) {
    for (const [shape, source, pattern, partial] of [
      ['computed prefixes', 'root' + '["a.b"]'.repeat(size), String.raw`root.a\.b`, false],
      ['dynamic root suffixes', 'root[key]' + '.tail'.repeat(size), 'root.tail', true],
      ['call root suffixes', 'factory()' + '.tail'.repeat(size), 'factory.tail', true],
      [
        'static prefix then dynamic suffixes',
        'root' + '["value"]'.repeat(size) + '[dynamic]' + '.tail'.repeat(size),
        'root.value',
        true,
      ],
      [
        'parenthesized dynamic prefixes',
        '('.repeat(size) + 'root[key]' + '.tail)'.repeat(size),
        'root.tail',
        true,
      ],
    ]) {
      if (side === 'enter')
        addTransform(
          `native predicate ${shape} / ${size}`,
          source + ';',
          pipeline(
            api.defineNativePlugin({
              name: 'native-prefixes',
              visitors: [
                api.defineVisitor(
                  'StaticMemberExpression|ComputedMemberExpression',
                  { where: { memberPath: { equals: pattern } } },
                  () => {},
                ),
              ],
            }),
          ),
        );
      const match = path => path.matchesPattern(pattern, partial);
      addTransform(
        `${side} ${shape} / ${size}`,
        source + ';',
        pipeline(
          api.defineNativePlugin({
            name: 'overlapping-prefixes',
            visitors: [
              api.defineVisitor(
                'MemberExpression',
                { fields: ['memberPath'] },
                side === 'enter' ? match : { exit: match },
              ),
            ],
          }),
        ),
      );
    }
  }
}
for (const count of [1, 100, 1000]) {
  const request = {
    globals: Array.from({ length: count }, () => ({ name: 'external', references: true })),
  };
  const calls = count === 1 ? 1000 : 100;
  addTransform(
    `${calls} warm query calls / ${count} descriptors`,
    'external;',
    pipeline(
      api.defineNativePlugin({
        name: 'queries',
        contract: { queries: [request] },
        pre(context) {
          for (let i = 0; i < calls; i++) sink = context.query(request);
        },
      }),
    ),
  );
}
for (const [name, plan] of [
  ['identity', empty],
  ['visitor', visit],
  ['scope', scoped],
  ['folding', folding],
  ['parameters', parameters],
])
  cases.push([`cache key / ${name}`, () => api.pipelineCacheKey(plan, 'bench.js')]);
for (const count of [100, 1000]) {
  const request = {
    globals: Array.from({ length: count }, (_, i) => ({ name: `external${i}`, references: true })),
  };
  addTransform(
    `100 warm query calls / ${count} unique descriptors`,
    request.globals.map(entry => entry.name + ';').join('\n'),
    pipeline(
      api.defineNativePlugin({
        name: 'unique-queries',
        contract: { queries: [request] },
        pre(context) {
          for (let i = 0; i < 100; i++) sink = context.query(request);
        },
      }),
    ),
  );
}
const results = {};
for (const [name, run] of cases) {
  if (process.env.NOXCTURNAL_BENCH_ONLY && !name.includes(process.env.NOXCTURNAL_BENCH_ONLY))
    continue;
  results[name] = measure(run);
  process.stderr.write(`${name}: ${results[name].median_us.toFixed(3)} us\n`);
}
process.stdout.write(
  JSON.stringify(
    { root, node: process.version, cpu: cpus()[0]?.model, units: 'microseconds', results },
    null,
    2,
  ) + '\n',
);
