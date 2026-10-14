// Compare host-only lifecycle changes with the audit baseline using the same addon.
// Run after pnpm build:native: node scripts/benchmark-plugin-lifecycle.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, symlinkSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { build } from 'esbuild';
import { currentTarget } from './native-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.BASELINE ?? '09f8377';
const directory = path.join(root, 'target', 'lifecycle-benchmark');
mkdirSync(directory, { recursive: true });
const { binary } = currentTarget();
const addon = path.join(root, binary);
const link = path.join(root, 'target', binary);
if (!existsSync(link)) symlinkSync(addon, link);
const changed = new Set(
  execFileSync('git', ['diff', '--name-only', baseline, '--', 'js'], {
    cwd: root,
    encoding: 'utf8',
  })
    .trim()
    .split('\n'),
);
for (const version of ['before', 'after']) {
  await build({
    entryPoints: [path.join(root, 'js/index.ts')],
    outfile: path.join(directory, `${version}.cjs`),
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    plugins:
      version === 'before'
        ? [
            {
              name: 'baseline',
              setup(builder) {
                builder.onLoad({ filter: /\.ts$/ }, ({ path: filename }) => {
                  const relative = path.relative(root, filename);
                  if (!changed.has(relative)) return;
                  return {
                    contents: execFileSync('git', ['show', `${baseline}:${relative}`], {
                      cwd: root,
                      encoding: 'utf8',
                    }),
                    loader: 'ts',
                  };
                });
              },
            },
          ]
        : [],
  });
}
const require = createRequire(import.meta.url);
const apis = ['before', 'after'].map(version => require(path.join(directory, `${version}.cjs`)));
const source = Array.from({ length: 100 }, (_, i) => `const x${i}=${i};`).join('\n');
const scenarios = [
  [
    'one cleanup',
    api =>
      api.defineNativePipeline({
        phases: [
          {
            name: 'visit',
            plugins: [api.defineNativePlugin({ name: 'noop', pre() {}, cleanup() {} })],
          },
        ],
      }),
    '1;',
  ],
  [
    'ten observers',
    api =>
      api.defineNativePipeline({
        phases: [
          {
            name: 'visit',
            plugins: Array.from({ length: 10 }, (_, i) =>
              api.defineNativePlugin({
                name: `p${i}`,
                visitors: [api.defineVisitor('NumericLiteral', {}, () => {})],
              }),
            ),
          },
        ],
      }),
    source,
  ],
  [
    'hundred edits',
    api =>
      api.defineNativePipeline({
        phases: [
          {
            name: 'visit',
            plugins: [
              api.defineNativePlugin({
                name: 'rewrite',
                visitors: [
                  api.defineVisitor('NumericLiteral', {}, path => path.replaceWith('123')),
                ],
              }),
            ],
          },
        ],
      }),
    source,
  ],
  [
    'ten fragment phases',
    api =>
      api.defineNativePipeline({
        phases: Array.from({ length: 10 }, (_, i) => ({
          name: `p${i}`,
          plugins: [
            api.defineNativePlugin({
              name: `p${i}`,
              pre(ctx) {
                ctx.ensureReplace('shared', 5, 8, ctx.sourceSlice(0, 3));
              },
            }),
          ],
        })),
      }),
    'aaa; bbb;',
  ],
];
for (const [name, configure, input] of scenarios) {
  const pipelines = apis.map(configure);
  const run = index => apis[index].transform(input, 'bench.js', pipelines[index]);
  assert.deepEqual(run(0), run(1));
  for (let i = 0; i < 500; i++) {
    run(0);
    run(1);
  }
  const samples = [[], []];
  for (let round = 0; round < 9; round++) {
    for (const index of round % 2 ? [1, 0] : [0, 1]) {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) run(index);
      samples[index].push((performance.now() - start) / 1000);
    }
  }
  const medians = samples.map(values => [...values].sort((a, b) => a - b)[4]);
  console.log(
    JSON.stringify({
      name,
      inputBytes: Buffer.byteLength(input),
      outputBytes: Buffer.byteLength(run(1).code),
      samplesMs: samples,
      medianMs: medians,
      percent: (medians[1] / medians[0] - 1) * 100,
    }),
  );
}
