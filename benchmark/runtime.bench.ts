import { bench } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../dist/index.js';
import { generateLargeFileSource } from './large-file-corpus.js';

const source = Array.from(
  { length: 2_000 },
  (_, index) => `export const value${index} = source${index} + ${index};`,
).join('\n');
const visitorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'identifier-count',
          visitors: [defineVisitor('Identifier', {}, () => {})],
        }),
      ],
    },
  ],
});
bench('static JavaScript visitor transform', () => {
  transform(source, 'benchmark.js', visitorPipeline);
});

const rejectedIdentifierPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'rejected-identifiers',
          visitors: [
            defineVisitor('Identifier', { where: { name: { equals: '__never__' } } }, () => {}),
          ],
        }),
      ],
    },
  ],
});
bench('native Identifier predicate with 0% selectivity', () => {
  transform(source, 'benchmark.js', rejectedIdentifierPipeline);
});

const rejectedDeclarationPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'rejected-declarations',
          visitors: [
            defineVisitor('VariableDeclaration', { where: { kind: { equals: 'let' } } }, () => {}),
          ],
        }),
      ],
    },
  ],
});
bench('native predicate with 0% selectivity', () => {
  transform(source, 'benchmark.js', rejectedDeclarationPipeline);
});

function selectiveDeclarations(matchEvery: number): string {
  return Array.from(
    { length: 2_000 },
    (_, index) => `${index % matchEvery === 0 ? 'let' : 'var'} value${index} = ${index};`,
  ).join('\n');
}
const selectiveDeclarationPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'selective-declarations',
          visitors: [
            defineVisitor('VariableDeclaration', { where: { kind: { equals: 'let' } } }, () => {}),
          ],
        }),
      ],
    },
  ],
});
for (const [label, selectiveSource] of [
  ['100%', selectiveDeclarations(1)],
  ['10%', selectiveDeclarations(10)],
  ['1%', selectiveDeclarations(100)],
] as const) {
  bench(`native predicate with ${label} selectivity`, () => {
    transform(selectiveSource, 'benchmark.js', selectiveDeclarationPipeline);
  });
}

const exitVisitorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'transform',
      plugins: [
        defineNativePlugin({
          name: 'identifier-enter-exit',
          visitors: [defineVisitor('Identifier', {}, { enter() {}, exit() {} })],
        }),
      ],
    },
  ],
});
bench('enter/exit JavaScript visitor transform', () => {
  transform(source, 'benchmark.js', exitVisitorPipeline);
});

const pluginFanoutPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: Array.from({ length: 12 }, (_, index) =>
        defineNativePlugin({
          name: `identifier-plugin-${index}`,
          visitors: [defineVisitor('Identifier', {}, () => {})],
        }),
      ),
    },
  ],
});
bench('12-plugin JavaScript visitor fan-out', () => {
  transform(source, 'benchmark.js', pluginFanoutPipeline);
});

const mixedExecutorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'transform',
      plugins: [
        defineNativePlugin({
          name: 'dynamic-owner',
          visitors: [
            defineVisitor('Function', { controlFlow: ['skip'] }, path => {
              path.skip();
            }),
          ],
        }),
        ...Array.from({ length: 11 }, (_, index) =>
          defineNativePlugin({
            name: `static-peer-${index}`,
            visitors: [defineVisitor('Identifier', {}, () => {})],
          }),
        ),
      ],
    },
  ],
});
bench('11 static executors beside one dynamic plugin', () => {
  transform(source, 'benchmark.js', mixedExecutorPipeline);
});

const globallySlowExecutorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'transform',
      plugins: [
        defineNativePlugin({
          name: 'global-stop-capable-owner',
          visitors: [defineVisitor('Function', { controlFlow: ['stop-all'] }, () => {})],
        }),
        ...Array.from({ length: 11 }, (_, index) =>
          defineNativePlugin({
            name: `globally-slow-peer-${index}`,
            visitors: [defineVisitor('Identifier', {}, () => {})],
          }),
        ),
      ],
    },
  ],
});
bench('11 globally deoptimized peers beside stop capability', () => {
  transform(source, 'benchmark.js', globallySlowExecutorPipeline);
});

const disjointPluginPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: (
        [
          'Program',
          'ExportNamedDeclaration',
          'VariableDeclaration',
          'VariableDeclarator',
          'Identifier',
          'BinaryExpression',
          'NumericLiteral',
        ] as const
      ).map((type, index) =>
        defineNativePlugin({
          name: `disjoint-plugin-${index}`,
          visitors: [defineVisitor(type, {}, () => {})],
        }),
      ),
    },
  ],
});
bench('7-plugin disjoint visitor dispatch', () => {
  transform(source, 'benchmark.js', disjointPluginPipeline);
});

const denseEditPipeline = defineNativePipeline({
  phases: [
    {
      name: 'edit',
      plugins: [
        defineNativePlugin({
          name: 'rename-identifiers',
          visitors: [
            defineVisitor('Identifier', { fields: ['name'] }, path => {
              path.replaceWith(`${path.node.name}_renamed`);
            }),
          ],
        }),
      ],
    },
  ],
});
bench('dense identifier edit transform', () => {
  transform(source, 'benchmark.js', denseEditPipeline);
});

const denseNamedEditPipeline = defineNativePipeline({
  phases: [
    {
      name: 'transform',
      plugins: [
        defineNativePlugin({
          name: 'rename-identifiers-with-names',
          visitors: [
            defineVisitor('Identifier', { fields: ['name'] }, path => {
              const name = path.node.name;
              path.replaceWith({
                code: `${name}_renamed`,
                mapping: 'anchor-boundaries',
                names: [name],
              });
            }),
          ],
        }),
      ],
    },
  ],
});
bench('dense named edit and map transform', () => {
  transform(source, 'benchmark.js', denseNamedEditPipeline, { sourceMapMode: 'boundary' });
});

const broadVisitorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'broad-visitor',
          visitors: [defineVisitor('*', {}, () => {})],
        }),
      ],
    },
  ],
});
bench('broad catch-all streaming transform', () => {
  transform(source, 'benchmark.js', broadVisitorPipeline, { allowBroadVisitors: true });
});

// Unlike the pre-typed-contract version of this bench, `name` is declared and
// transferred, so hasBinding receives real names and performs real lookups.
const scopeAncestryPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'scope-and-ancestry',
          visitors: [
            defineVisitor(
              'Identifier',
              { fields: ['name'], scope: true, ancestry: 'parent' },
              path => {
                path.scope.hasBinding(String(path.node.name));
                void path.parent;
              },
            ),
          ],
        }),
      ],
    },
  ],
});
bench('identifier scope and ancestry transform', () => {
  transform(source, 'benchmark.js', scopeAncestryPipeline);
});

const threePhasePipeline = defineNativePipeline({
  phases: Array.from({ length: 3 }, (_, index) => ({
    name: `phase-${index}`,
    requiresPrintedInput: index < 2,
    plugins: [
      defineNativePlugin({
        name: `phase-plugin-${index}`,
        visitors: [defineVisitor('Identifier', {}, () => {})],
      }),
    ],
  })),
});
bench('three-phase reparse transform', () => {
  transform(source, 'benchmark.js', threePhasePipeline);
});

function changedPhasePipeline(count: number, rendered: boolean) {
  return defineNativePipeline({
    phases: Array.from({ length: count }, (_, index) => ({
      name: `changed-${index}`,
      observes: rendered ? ('rendered-source' as const) : ('current-ast' as const),
      plugins: [
        defineNativePlugin({
          name: `changed-plugin-${index}`,
          editEffect: 'text-only',
          visitors: [
            defineVisitor(
              'Identifier',
              { fields: ['name'], where: { name: { oneOf: [`source${index}`] } } },
              path => {
                path.replaceWith(`renamed${index}`);
              },
            ),
          ],
        }),
      ],
    })),
  });
}

for (const phaseCount of [1, 3, 5]) {
  const fused = changedPhasePipeline(phaseCount, false);
  const rendered = changedPhasePipeline(phaseCount, true);
  bench(`${phaseCount} changed text phases: fused`, () => {
    transform(source, 'benchmark.js', fused);
  });
  bench(`${phaseCount} changed text phases: rendered`, () => {
    transform(source, 'benchmark.js', rendered);
  });
}

const structuralPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'program-children',
          visitors: [
            defineVisitor('Program', { children: { body: { route: 'Statement' } } }, path => {
              path.getChildList('body');
            }),
          ],
        }),
      ],
    },
  ],
});
bench('declared structural child transform', () => {
  transform(source, 'benchmark.js', structuralPipeline);
});

function allocationVisitor(name: string) {
  const visitor =
    name === 'scalar'
      ? defineVisitor('Identifier', { fields: ['name'] }, path => void path.node.name)
      : name === 'snapshot'
        ? defineVisitor('Identifier', { fields: ['name'] }, path =>
            path.snapshot({ fields: ['name'] }),
          )
        : name === 'parent'
          ? defineVisitor('Identifier', { ancestry: 'parent' }, path => void path.parent)
          : name === 'ranges'
            ? defineVisitor('Identifier', {}, path => void (path.type + path.start + path.end))
            : defineVisitor('Identifier', {}, () => {});
  return defineNativePipeline({
    phases: [{ name: 'transform', plugins: [defineNativePlugin({ name, visitors: [visitor] })] }],
  });
}

function generatedSource(minimumBytes: number): string {
  return generateLargeFileSource(minimumBytes, 'shallow');
}

for (const shape of ['nested', 'functions', 'dependencies'] as const) {
  const generated = generateLargeFileSource(650 * 1024, shape);
  const pipeline = allocationVisitor('ranges');
  bench(`650 KiB ${shape} range visitor`, () => {
    transform(generated, 'generated.js', pipeline);
  });
}

const functionMapSource = generateLargeFileSource(650 * 1024, 'functions');
bench('650 KiB native function map', () => {
  transform(functionMapSource, 'generated.js', visitorPipeline, { functionMap: true });
});

const sparseEditSource = generateLargeFileSource(650 * 1024, 'sparse-edits');
const sparseEditPipeline = defineNativePipeline({
  phases: [
    {
      name: 'sparse-edits',
      plugins: [
        defineNativePlugin({
          name: 'sparse-edit-plugin',
          visitors: [
            defineVisitor('Identifier', { fields: ['name'] }, path => {
              if (String(path.node.name).startsWith('EDIT_'))
                path.replaceWith(String(path.node.name).slice(5));
            }),
          ],
        }),
      ],
    },
  ],
});
bench('650 KiB sparse edits', () => {
  transform(sparseEditSource, 'generated.js', sparseEditPipeline, {
    sourceMapMode: 'boundary',
  });
});

const denseEditSource = generateLargeFileSource(650 * 1024, 'dense-edits');
bench('650 KiB dense edits', () => {
  transform(denseEditSource, 'generated.js', denseEditPipeline, {
    sourceMapMode: 'boundary',
  });
});

// Copy-scale gates: thousands of deferred copies against thousands of edits pin the
// commit-time copy resolution to its binary-search bound (distinct ranges) and its
// shared sub-render cache (one range copied per node).
const copyHeavySource = generateLargeFileSource(650 * 1024, 'functions');
const rewriteParameters = defineNativePlugin({
  name: 'rewrite-parameters',
  visitors: [
    defineVisitor(
      'Identifier',
      { fields: ['name'], where: { name: { oneOf: ['value'] } } },
      path => {
        if (path.node.name === 'value') path.replaceWith('value_');
      },
    ),
  ],
});
const copyHeavyPipeline = defineNativePipeline({
  phases: [
    {
      name: 'copy-heavy',
      plugins: [
        defineNativePlugin({
          name: 'duplicate-functions',
          visitors: [
            defineVisitor('Function', {}, path => {
              path.insertAfter(path.getSource());
            }),
          ],
        }),
        rewriteParameters,
      ],
    },
  ],
});
bench('650 KiB per-node duplication with contained edits', () => {
  transform(copyHeavySource, 'generated.js', copyHeavyPipeline, { sourceMapMode: 'boundary' });
});

interface MirrorState {
  fragment: import('../dist/index.js').SourceFragment | undefined;
}
const repeatedCopyPipeline = defineNativePipeline({
  phases: [
    {
      name: 'repeated-copy',
      plugins: [
        defineNativePlugin({
          name: 'mirror-first-function',
          createState: (): MirrorState => ({ fragment: undefined }),
          visitors: [
            defineVisitor('Function', {}, (path, state: MirrorState) => {
              if (state.fragment) path.insertAfter(state.fragment);
              else state.fragment = path.getSource();
            }),
          ],
        }),
        rewriteParameters,
      ],
    },
  ],
});
bench('650 KiB repeated single-range copies', () => {
  transform(copyHeavySource, 'generated.js', repeatedCopyPipeline, { sourceMapMode: 'boundary' });
});

for (const name of ['no-properties', 'ranges', 'scalar', 'parent', 'snapshot']) {
  const pipeline = allocationVisitor(name);
  bench(`allocation profile: ${name}`, () => transform(source, 'benchmark.js', pipeline));
}

for (const [label, generated] of [
  ['256 KiB', generatedSource(256 * 1024)],
  ['650 KiB', generatedSource(650 * 1024)],
  ['1 MiB', generatedSource(1024 * 1024)],
  ['2 MiB', generatedSource(2 * 1024 * 1024)],
  ['5 MiB', generatedSource(5 * 1024 * 1024)],
] as const) {
  const pipeline = allocationVisitor('ranges');
  bench(`${label} range visitor`, () => {
    transform(generated, 'generated.js', pipeline);
  });
}

for (const [label, generated] of [
  ['empty', ''],
  ['100 B', generatedSource(100)],
  ['1 KiB', generatedSource(1024)],
  ['10 KiB', generatedSource(10 * 1024)],
  ['100 KiB', generatedSource(100 * 1024)],
] as const) {
  bench(`fixed-cost profile: ${label}`, () => {
    transform(generated, 'generated.js', visitorPipeline, { debugPerformance: true });
  });
}

const largeChangedSource = generatedSource(650 * 1024);
const largeFusedPhases = changedPhasePipeline(3, false);
const largeRenderedPhases = changedPhasePipeline(3, true);
bench('650 KiB, 3 changed text phases: fused', () => {
  transform(largeChangedSource, 'generated.js', largeFusedPhases);
});
bench('650 KiB, 3 changed text phases: rendered', () => {
  transform(largeChangedSource, 'generated.js', largeRenderedPhases);
});
