import { bench, describe } from 'vitest';
import * as candidate from '../index';
import { NativeTransformSession } from '../runtime/session';
import { native } from '../native/binding';
import { packRouteManifest } from '../protocol/manifest';
import { createRequire } from 'node:module';

// Baseline directory contains `git archive BASE js package.json`, shared readonly
// node_modules and its separately preserved debug native addon.
const baselineRoot = process.env.NOXCTURNAL_BENCH_BASELINE_ROOT;
const reverse = process.env.NOXCTURNAL_BENCH_REVERSE === '1';
const baseline = baselineRoot ? await import(`${baselineRoot}/js/index.ts`) : undefined;
const implementations = [
  ...(baseline ? [['baseline', baseline] as const] : []),
  ['candidate', candidate] as const,
];
if (reverse) implementations.reverse();
const source = Array.from(
  { length: 200 },
  (_, i) => `function f${i}(value){let local=value+${i};return local+external}`,
).join('\n');
for (const operation of ['route', 'scope', 'rename', 'push'] as const)
  describe(`${operation}: 200 functions`, () => {
    for (const [label, api] of implementations) {
      const visitor = api.defineVisitor(
        'Function',
        operation === 'route' ? {} : { scope: true },
        (path: any) => {
          if (operation === 'scope') path.scope.hasBinding('value');
          if (operation === 'rename') path.scope.rename('value', 'renamed');
          if (operation === 'push') path.scope.push('var injected=1;');
        },
      );
      const pipeline = api.defineNativePipeline({
        phases: [
          {
            name: 'bench',
            plugins: [api.defineNativePlugin({ name: 'bench', visitors: [visitor] })],
          },
        ],
      });
      const run = () => {
        const result = api.transform(source, 'input.js', pipeline);
        if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
        return result;
      };
      const result = run();
      console.log(`${operation} ${label}: ${result.code.length} output chars`);
      bench(label, run);
    }
  });
const manifest = packRouteManifest([], true, true, 1);
for (const count of [10, 100, 1000, 5000])
  describe(`push ${count} declarations into one scope`, () => {
    for (const [label, api] of implementations) {
      const plan = api.defineNativePipeline({
        phases: [
          {
            name: 'push',
            plugins: [
              api.defineNativePlugin({
                name: 'push-many',
                visitors: [
                  api.defineVisitor('Program', { scope: true }, (path: any) => {
                    for (let i = 0; i < count; i++) path.scope.push(`var injected${i}=${i};`);
                  }),
                ],
              }),
            ],
          },
        ],
      });
      bench(label, () => {
        const result = api.transform('globalThis.result=1;', 'input.js', plan);
        if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
        return result;
      });
    }
  });
for (const [label, addon] of [
  ...(baselineRoot
    ? [['baseline', createRequire(import.meta.url)(`${baselineRoot}/noxcturnal.darwin-arm64.node`)]]
    : []),
  ['candidate', native],
] as const) {
  const session = new addon.NativeIndexedSession(source, 'input.js', manifest);
  console.log(
    `${label}: ${session.retentionDebugSummary().retainedIndexBytes} retained bytes, ${session.scopeMetadataBuffer().length} scope transfer bytes`,
  );
  session.close();
}
for (const count of [100, 1000])
  for (const grouped of [false, true])
    describe(`rename ${count} exports, grouped=${grouped}`, () => {
      const source = grouped
        ? `export let ${Array.from({ length: count }, (_, i) => `value${i}=${i}`).join(',')};`
        : Array.from({ length: count }, (_, i) => `export let value${i}=${i};`).join('\n');
      for (const [label, api] of implementations) {
        const plan = api.defineNativePipeline({
          phases: [
            {
              name: 'rename',
              plugins: [
                api.defineNativePlugin({
                  name: 'rename-exports',
                  visitors: [
                    api.defineVisitor('Program', { scope: true }, (path: any) => {
                      for (let i = 0; i < count; i++) path.scope.rename(`value${i}`, `renamed${i}`);
                    }),
                  ],
                }),
              ],
            },
          ],
        });
        bench(label, () => {
          const result = api.transform(source, 'input.mjs', plan);
          if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
          return result;
        });
      }
    });
for (const count of [1000, 10000])
  describe(`read a path's scope ${count} times`, () => {
    for (const [label, api] of implementations) {
      let scopeId: number | undefined;
      const plan = api.defineNativePipeline({
        phases: [
          {
            name: 'scope',
            plugins: [
              api.defineNativePlugin({
                name: 'scope-reads',
                visitors: [
                  api.defineVisitor('Function', { scope: true }, (path: any) => {
                    for (let i = 0; i < count; i++) scopeId = path.scope.id;
                  }),
                ],
              }),
            ],
          },
        ],
      });
      bench(label, () => {
        const result = api.transform('function f(value){return value}', 'input.js', plan);
        if (result.status !== 'complete' || scopeId == null)
          throw new Error('Unexpected scope benchmark result');
        return result;
      });
    }
  });
for (const count of [100, 1000, 10000])
  describe(`rename a binding with ${count} references`, () => {
    const source = `function f(value){return [${Array(count).fill('value').join(',')}]}`;
    for (const [label, api] of implementations) {
      const plan = api.defineNativePipeline({
        phases: [
          {
            name: 'rename',
            plugins: [
              api.defineNativePlugin({
                name: 'rename-references',
                visitors: [
                  api.defineVisitor('Function', { scope: true }, (path: any) =>
                    path.scope.rename('value', 'renamed'),
                  ),
                ],
              }),
            ],
          },
        ],
      });
      bench(label, () => {
        const result = api.transform(source, 'input.js', plan);
        if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
        return result;
      });
    }
  });
for (const count of [100, 1000])
  describe(`rename one binding with ${count} redeclarations`, () => {
    const source = `var value=3;${'var value;'.repeat(count)}consume(value);`;
    for (const [label, api] of implementations) {
      const plan = api.defineNativePipeline({
        phases: [
          {
            name: 'rename',
            plugins: [
              api.defineNativePlugin({
                name: 'rename-redeclarations',
                visitors: [
                  api.defineVisitor('Program', { scope: true }, (path: any) =>
                    path.scope.rename('value', 'renamed'),
                  ),
                ],
              }),
            ],
          },
        ],
      });
      bench(label, () => {
        const result = api.transform(source, 'input.js', plan);
        if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
        return result;
      });
    }
  });
for (const scope of [false, true])
  describe(`global query with scope capability=${scope}`, () => {
    const request = { globals: [{ name: 'external', references: true }] };
    for (const [label, api] of implementations) {
      const plan = api.defineNativePipeline({
        phases: [
          {
            name: 'query',
            plugins: [
              api.defineNativePlugin({
                name: 'query-globals',
                contract: { queries: [request] },
                pre(context: any) {
                  context.query(request);
                },
                visitors: [api.defineVisitor('Program', { scope }, () => {})],
              }),
            ],
          },
        ],
      });
      bench(label, () => {
        const result = api.transform(source, 'input.js', plan);
        if (result.status !== 'complete') throw new Error('Unexpected benchmark bailout');
        return result;
      });
    }
  });
const constructors = [
  ...(baselineRoot
    ? [
        [
          'baseline',
          (await import(`${baselineRoot}/js/runtime/session.ts`)).NativeTransformSession,
        ] as const,
      ]
    : []),
  ['candidate', NativeTransformSession] as const,
];
if (reverse) constructors.reverse();
for (const escaped of [false, true])
  describe(`UID source escaped=${escaped}`, () => {
    const text = source + (escaped ? String.raw`/* _t\u0065mp */` : '');
    for (const [label, Session] of constructors)
      bench(label, () => {
        const session = new Session(text, 'input.js');
        try {
          for (let i = 0; i < 20; i++) session.generateUid(`temp${i}`);
        } finally {
          session.close();
        }
      });
  });
