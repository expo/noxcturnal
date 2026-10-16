import { afterAll, bench, describe } from 'vitest';
import * as current from '../index';
import { NativeTransformSession } from '../runtime/session';
import { packRouteManifest } from '../protocol/manifest';

// Set NOXCTURNAL_BASELINE_ROOT to an unchanged checkout with its addon built.
const baselineRoot = process.env.NOXCTURNAL_BASELINE_ROOT;
const implementations: [string, typeof current][] = [['fixed', current]];
if (baselineRoot)
  implementations.unshift(['baseline', await import(`${baselineRoot}/js/index.ts`)]);

if (process.env.NOXCTURNAL_BENCH_REVERSE) implementations.reverse();

for (const [label, api] of implementations) {
  // Select one implementation per process when checking JIT/order sensitivity.
  if (process.env.NOXCTURNAL_BENCH_ONLY && process.env.NOXCTURNAL_BENCH_ONLY !== label) continue;
  const pipeline = (plugin: ReturnType<typeof api.defineNativePlugin>) =>
    api.defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] });
  const plainSource = Array.from({ length: 200 }, (_, i) => `consume(value${i});`).join('\n');
  const memberSource = Array.from({ length: 200 }, () => 'process /*comment*/ .env.NODE_ENV;').join(
    '\n',
  );
  const plainMemberSource = memberSource.replaceAll(' /*comment*/ ', '');
  const plain = pipeline(
    api.defineNativePlugin({
      name: 'plain',
      visitors: [api.defineVisitor('Identifier', { fields: ['name'] }, () => {})],
    }),
  );
  const checked = pipeline(
    api.defineNativePlugin({
      name: 'checked',
      visitors: [
        api.defineVisitor('Identifier', { fields: ['name'], controlFlow: ['skip'] }, () => {}),
      ],
    }),
  );
  const members = (retained: boolean) =>
    pipeline(
      api.defineNativePlugin({
        name: 'member',
        visitors: [
          api.defineVisitor(
            retained ? 'MemberExpression' : 'StaticMemberExpression|ComputedMemberExpression',
            retained
              ? { fields: ['memberPath'] }
              : { where: { memberPath: { equals: 'process.env.NODE_ENV' } } },
            path => {
              if (retained) path.matchesPattern('process.env.NODE_ENV');
            },
          ),
        ],
      }),
    );
  const predicate = members(false);
  const retained = members(true);
  // Verify semantics outside timing. The original baseline did not recognize
  // comments in native predicate matching, so require the corrected result here.
  if (label === 'fixed') {
    for (const fields of [true]) {
      for (const source of [memberSource, plainMemberSource]) {
        let matches = 0;
        const result = api.transform(
          source,
          'input.js',
          pipeline(
            api.defineNativePlugin({
              name: 'verify-member-matching',
              visitors: [
                api.defineVisitor('MemberExpression', { fields: ['memberPath'] }, path => {
                  if (path.matchesPattern('process.env.NODE_ENV')) matches++;
                }),
              ],
            }),
          ),
        );
        if (result.status !== 'complete' || matches !== 200)
          throw new Error('Member benchmark must match all 200 outer chains');
      }
    }
  }
  const leaf = [api.defineVisitor('Identifier', { fields: ['name'] }, () => {})];
  const nested = pipeline(
    api.defineNativePlugin({
      name: 'nested',
      visitors: [
        api.defineVisitor('Program', { nested: leaf, controlFlow: ['nested-traverse'] }, path =>
          path.traverse(leaf),
        ),
      ],
    }),
  );
  const request = { globals: [{ name: 'external', references: true }] };
  const queries = pipeline(
    api.defineNativePlugin({
      name: 'queries',
      contract: { queries: [request] },
      pre(context) {
        for (let i = 0; i < 1000; i++) context.query(request);
      },
    }),
  );
  const Session =
    label === 'fixed'
      ? NativeTransformSession
      : (await import(`${baselineRoot}/js/runtime/session.ts`)).NativeTransformSession;
  const session = new Session(
    'external;',
    'input.js',
    {},
    packRouteManifest([], false, false, (1 << 6) - 1),
  );
  session.query(request);
  afterAll(() => session.close());
  describe(label, () => {
    for (const count of [1, 100, 1000]) {
      const largeRequest = {
        globals: Array.from({ length: count }, () => ({ name: 'external', references: true })),
      };
      const initial = session.query(largeRequest);
      if (session.query(largeRequest) !== initial)
        throw new Error('Warm query benchmark must hit the cache');
      bench(`warm query / ${count} descriptors`, () => session.query(largeRequest), {
        time: 500,
        warmupTime: 200,
      });
    }
    bench(
      '1000 direct warm query calls',
      () => {
        for (let index = 0; index < 1000; index++) session.query(request);
      },
      { time: 500, warmupTime: 200 },
    );
    for (const [name, source, plan] of [
      ['static dispatch / 400 identifiers', plainSource, plain],
      ['checked dispatch / 400 identifiers', plainSource, checked],
      ['nested replay / 400 identifiers', plainSource, nested],
      ['source member matching / 400 members', memberSource, predicate],
      ['plain source member matching / 400 members', plainMemberSource, predicate],
      ['retained member matching / 400 members', memberSource, retained],
      ['1000 warm query calls', 'external;', queries],
    ] as const)
      bench(
        name,
        () => {
          api.transform(source, 'input.js', plan);
        },
        { time: 500, warmupTime: 200 },
      );
  });
}
