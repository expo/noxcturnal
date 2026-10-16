// Build each checkout with pnpm build:release. Bundle this runner with esbuild
// (platform=node, format=esm), then run: node RUNNER.mjs CHECKOUT_ROOT LABEL.
// Alternate independent baseline/fixed processes; compare decoded digests too.
// Run timing processes serially, with no builds or test suites in parallel.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { packRouteManifest } from '../protocol/manifest.ts';
import { decodeEventBatch, decodePackedEnvelope } from '../protocol/events.ts';

const root = resolve(process.argv[2] ?? '.');
const label = process.argv[3] ?? 'current';
const { currentTarget } = await import(pathToFileURL(join(root, 'scripts/native-lib.mjs')).href);
const addon = join(root, currentTarget().binary);
const native = createRequire(import.meta.url)(addon);
const api = await import(pathToFileURL(join(root, 'dist/noxcturnal.mjs')).href);
let sink;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
function measure(run, sampleMs = 10, rounds = 9) {
  let iterations = 1;
  for (;;) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink = run();
    if (performance.now() - start >= sampleMs || iterations >= 32768) break;
    iterations *= 2;
  }
  const samples = [];
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) sink = run();
    samples.push(((performance.now() - start) * 1000) / iterations);
  }
  return { median_us: median(samples), samples_us: samples, iterations };
}
const decode = buffer => decodeEventBatch(decodePackedEnvelope(buffer)).events;
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const cases = [];
for (const count of process.env.NOXCTURNAL_BENCH_TRANSFORMS_ONLY ? [] : [1000, 2000, 4000]) {
  for (const unique of [false, true]) {
    const source = Array.from(
      { length: count },
      (_, i) => `const value${i} = ${JSON.stringify(unique ? `text-${i}-雪😀` : 'shared-雪😀')};`,
    ).join('\n');
    const manifest = packRouteManifest(
      [],
      true,
      true,
      1 << 3,
      { VariableDeclarator: ['init'] },
      { StringLiteral: ['value', 'constantKind', 'constantValue'] },
    );
    const session = new native.NativeIndexedSession(source, 'bench.js', manifest);
    try {
      const literals = decode(session.queryNodesPackedBuffer(['StringLiteral']));
      const ids = literals.map(event => event.id);
      const parents = decode(session.queryNodesPackedBuffer(['VariableDeclarator'])).map(
        event => event.id,
      );
      const operations = {
        empty: () => session.inspectPackedBuffer([]),
        one: () => session.inspectPackedBuffer([ids[count - 1]]),
        sparse32: () => session.inspectPackedBuffer(ids.slice(-32)),
        dense: () => session.inspectPackedBuffer(ids),
        queryDense: () => session.queryNodesPackedBuffer(['StringLiteral']),
        children32: () => session.childrenPackedBuffer(parents.slice(-32), [], []).events,
        childrenDense: () => session.childrenPackedBuffer(parents, [], []).events,
      };
      for (const [operation, run] of Object.entries(operations)) {
        const buffer = run();
        const events = decode(buffer);
        for (const mode of ['native', 'decode']) {
          cases.push({
            name: `${unique ? 'unique' : 'repeated'}/${count}/${operation}/${mode}`,
            bytes: buffer.length,
            strings: buffer.readUInt32LE(8),
            records: events.length,
            digest: digest(events),
            ...measure(mode === 'native' ? run : () => decode(run())),
          });
        }
      }
    } finally {
      session.close();
    }
  }
}
for (const count of [1000, 4000]) {
  const source = Array.from({ length: count }, (_, i) => `const value${i} = "text-${i}";`).join(
    '\n',
  );
  for (const selection of ['none', 'sparse', 'dense']) {
    let checksum = 0;
    const visitor =
      selection === 'none'
        ? api.defineVisitor('StringLiteral', { fields: ['value'], scope: true }, path => {
            checksum += path.node.value.length;
          })
        : api.defineVisitor(
            'VariableDeclarator',
            {
              ...(selection === 'sparse' ? { where: { bindingName: { equals: 'value0' } } } : {}),
              children: { init: { route: 'StringLiteral', fields: ['value'] } },
            },
            path => {
              checksum += path.getChild('init').node.value.length;
            },
          );
    const pipeline = api.defineNativePipeline({
      phases: [
        {
          name: 'inspect',
          plugins: [api.defineNativePlugin({ name: 'bench', visitors: [visitor] })],
        },
      ],
    });
    const run = () => {
      checksum = 0;
      const result = api.transform(source, 'bench.js', pipeline);
      assert.equal(result.status, 'complete');
      return {
        code: result.code,
        checksum,
        metadata: result.metadata,
        diagnostics: result.diagnostics,
      };
    };
    const result = run();
    cases.push({
      name: `transform/${count}/${selection}`,
      digest: digest(result),
      ...measure(run, 50, 15),
    });
  }
}
process.stdout.write(
  JSON.stringify({
    label,
    root,
    node: process.version,
    cpu: cpus()[0].model,
    native_sha256: createHash('sha256').update(readFileSync(addon)).digest('hex'),
    max_rss_kib: process.resourceUsage().maxRSS,
    cases,
  }) + '\n',
);
