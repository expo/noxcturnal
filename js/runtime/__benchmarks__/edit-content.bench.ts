import { bench, describe } from 'vitest';
import * as current from '../../index';
import { packEdits as packFixed } from '../../protocol/edits';
import { codeFactory as factoryFixed } from '../fragments';

type Api = typeof current;
interface Surface {
  label: string;
  api: Api;
  pack: typeof packFixed;
  factory: typeof factoryFixed;
}
const surfaces: Surface[] = [
  { label: 'fixed', api: current, pack: packFixed, factory: factoryFixed },
];
if (process.env.NOXCTURNAL_BASELINE_ROOT) {
  const root = process.env.NOXCTURNAL_BASELINE_ROOT;
  const [api, edits, fragments] = await Promise.all([
    import(`${root}/js/index.ts`),
    import(`${root}/js/protocol/edits.ts`),
    import(`${root}/js/runtime/fragments.ts`),
  ]);
  surfaces.unshift({
    label: 'baseline',
    api,
    pack: edits.packEdits,
    factory: fragments.codeFactory,
  });
}
if (process.env.NOXCTURNAL_BENCH_REVERSE) surfaces.reverse();

const edits = Array.from({ length: 1000 }, (_, index) => ({
  kind: 'Replace' as const,
  start: index,
  end: index + 1,
  content: `item${index}`,
}));
const sample = { time: 500, warmupTime: 200 };

for (const surface of surfaces) {
  describe(surface.label, () => {
    bench(
      'pack 1000 independent short edit strings',
      () => {
        surface.pack(edits);
      },
      sample,
    );
    bench(
      'compose 1000 sourceless templates',
      () => {
        for (let index = 0; index < 1000; index++)
          surface.factory
            .template`[${{ kind: 'composite', parts: ['1', { code: '+2', mapping: 'sourceless' }] }}]`;
      },
      sample,
    );
    // Same comment count with a short and a long prefix: placement must not scan the prefix.
    for (const prefix of [0, 100_000]) {
      for (const count of [100, 1000]) {
        const source = `/*${'x'.repeat(prefix)}*/\n` + 'void 1;\n'.repeat(count);
        const pipeline = surface.api.defineNativePipeline({
          phases: [
            {
              name: 'comments',
              plugins: [
                surface.api.defineNativePlugin({
                  name: 'comments',
                  visitors: [
                    surface.api.defineVisitor('NumericLiteral', {}, path =>
                      path.addComment('leading', 'note', true),
                    ),
                  ],
                }),
              ],
            },
          ],
        });
        bench(
          `${count} comments / prefix ${prefix}`,
          () => {
            const result = surface.api.transform(source, 'bench.js', pipeline);
            if (result.status !== 'complete') throw new Error(result.reason);
          },
          sample,
        );
      }
    }
    const directiveSource = `"use strict"\n${'globalThis.seen=1\n'.repeat(20)}`;
    const insertion = surface.api.defineNativePipeline({
      phases: [
        {
          name: 'insert',
          plugins: [
            surface.api.defineNativePlugin({
              name: 'insert',
              pre(context) {
                context.prependToProgram('void 0;');
                context.appendToProgram('void 2;');
              },
            }),
          ],
        },
      ],
    });
    bench(
      'prepend and append after an unterminated directive',
      () => {
        const result = surface.api.transform(directiveSource, 'bench.js', insertion);
        if (result.status !== 'complete') throw new Error(result.reason);
      },
      sample,
    );
  });
}
