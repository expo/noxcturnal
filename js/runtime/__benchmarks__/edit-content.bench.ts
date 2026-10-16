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
      for (const count of [1, 100, 1000]) {
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
    for (const mode of [
      'text',
      'unique text',
      'mutated fragment',
      'composite',
      'unique composite',
      'large unique text',
      'Unicode',
    ] as const) {
      const source = 'globalThis.result=1;';
      const pipeline = surface.api.defineNativePipeline({
        phases: [
          {
            name: 'bulk-insertion',
            plugins: [
              surface.api.defineNativePlugin({
                name: 'bulk-insertion',
                pre(context) {
                  const fragment = { code: 'void 1;', mapping: 'sourceless' as const };
                  const copied = context.sourceSlice(18, 19);
                  for (let index = 0; index < 1000; index++) {
                    fragment.code = `void ${index};`;
                    context.appendToProgram(
                      mode === 'text'
                        ? 'void 1;'
                        : mode === 'unique text'
                          ? `void ${index};`
                          : mode === 'mutated fragment'
                            ? fragment
                            : mode === 'composite'
                              ? context.code.template`void ${copied};`
                              : mode === 'unique composite'
                                ? context.code.template`void [${copied},${String(index)}];`
                                : mode === 'large unique text'
                                  ? `void "${'x'.repeat(1000)}${index}";`
                                  : `void "é😀${index}";`,
                    );
                  }
                },
              }),
            ],
          },
        ],
      });
      bench(
        `1000 program insertions / ${mode}`,
        () => {
          const result = surface.api.transform(source, 'bench.js', pipeline);
          if (result.status !== 'complete') throw new Error(result.reason);
        },
        sample,
      );
    }
    for (const live of [0, 100, 1000]) {
      const source = 'globalThis.result=1;';
      const pipeline = surface.api.defineNativePipeline({
        phases: [
          {
            name: 'reset',
            plugins: [
              surface.api.defineNativePlugin({
                name: 'reset',
                pre(context) {
                  for (let index = 0; index < live; index++) context.appendToProgram('void 0;');
                  for (let index = 0; index < 100; index++) {
                    context.editor.appendLeft(0, '/*temporary*/');
                    context.editor.reset(0, 0);
                  }
                },
              }),
            ],
          },
        ],
      });
      bench(
        `100 partial resets / ${live} live program insertions`,
        () => {
          const result = surface.api.transform(source, 'bench.js', pipeline);
          if (result.status !== 'complete') throw new Error(result.reason);
        },
        sample,
      );
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
