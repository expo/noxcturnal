import { bench, describe } from 'vitest';
import * as current from '../index';

// Set NOXCTURNAL_BASELINE_ROOT to an unchanged checkout with its addon built.
const baselineRoot = process.env.NOXCTURNAL_BASELINE_ROOT;
const implementations: [string, typeof current][] = [['fixed', current]];
if (baselineRoot)
  implementations.unshift(['baseline', await import(`${baselineRoot}/js/index.ts`)]);

if (process.env.NOXCTURNAL_BENCH_REVERSE) implementations.reverse();

for (const [label, api] of implementations) {
  const pipeline = (plugin: ReturnType<typeof api.defineNativePlugin>) =>
    api.defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] });
  const plainSource = Array.from({ length: 200 }, (_, i) => `consume(value${i});`).join('\n');
  const memberSource = Array.from({ length: 200 }, () => 'process /*comment*/ .env.NODE_ENV;').join(
    '\n',
  );
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
            'MemberExpression',
            retained ? { fields: ['memberPath'] } : {},
            path => {
              path.matchesPattern('process.env.NODE_ENV');
            },
          ),
        ],
      }),
    );
  const fallback = members(false);
  const retained = members(true);
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
  describe(label, () => {
    for (const [name, source, plan] of [
      ['static dispatch / 400 identifiers', plainSource, plain],
      ['checked dispatch / 400 identifiers', plainSource, checked],
      ['nested replay / 400 identifiers', plainSource, nested],
      ['source member matching / 400 members', memberSource, fallback],
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
