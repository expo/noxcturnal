import { bench } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformSession,
  transform,
} from '../dist/index.js';
import { generateLargeFileSource } from './large-file-corpus.js';

const source = Array.from(
  { length: 2_000 },
  (_, index) => `export const value${index} = source${index} + ${index};`,
).join('\n');
bench('subscribed Identifier event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['Identifier']);
  session.close();
});

bench('broad native event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['*']);
  session.close();
});

const visitorPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'identifier-count',
          prepare: () => ({ controlFlow: [] }),
          visitor: { Identifier() {} },
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
          prepare: () => ({
            controlFlow: [],
            where: { Identifier: { name: { equals: '__never__' } } },
          }),
          visitor: { Identifier() {} },
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
          prepare: () => ({
            controlFlow: [],
            where: { VariableDeclaration: { kind: { equals: 'let' } } },
          }),
          visitor: { VariableDeclaration() {} },
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
          prepare: () => ({
            controlFlow: [],
            fields: { VariableDeclaration: [] },
            where: { VariableDeclaration: { kind: { equals: 'let' } } },
          }),
          visitor: { VariableDeclaration() {} },
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
          prepare: () => ({ controlFlow: [] }),
          visitor: { Identifier: { enter() {}, exit() {} } },
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
          prepare: () => ({ controlFlow: [] }),
          visitor: { Identifier() {} },
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
          prepare: () => ({ controlFlow: ['skip'] }),
          visitor: {
            Function(path) {
              path.skip();
            },
          },
        }),
        ...Array.from({ length: 11 }, (_, index) =>
          defineNativePlugin({
            name: `static-peer-${index}`,
            prepare: () => ({ controlFlow: [] }),
            visitor: { Identifier() {} },
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
          prepare: () => ({ controlFlow: ['stop-all'] }),
          visitor: { Function() {} },
        }),
        ...Array.from({ length: 11 }, (_, index) =>
          defineNativePlugin({
            name: `globally-slow-peer-${index}`,
            prepare: () => ({ controlFlow: [] }),
            visitor: { Identifier() {} },
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
      plugins: [
        'Program',
        'ExportNamedDeclaration',
        'VariableDeclaration',
        'VariableDeclarator',
        'Identifier',
        'BinaryExpression',
        'NumericLiteral',
      ].map((type, index) =>
        defineNativePlugin({
          name: `disjoint-plugin-${index}`,
          prepare: () => ({ controlFlow: [] }),
          visitor: { [type]() {} },
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
          prepare() {
            return { fields: { Identifier: ['name'] } };
          },
          visitor: {
            Identifier(path) {
              path.replaceWith(`${path.node.name}_renamed`);
            },
          },
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
          prepare: () => ({ fields: { Identifier: ['name'] } }),
          visitor: {
            Identifier(path) {
              const name = path.node.name;
              path.replaceWith({
                code: `${name}_renamed`,
                mapping: 'anchor-boundaries',
                names: [name],
              });
            },
          },
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
          visitor: { '*'() {} },
        }),
      ],
    },
  ],
});
bench('broad catch-all streaming transform', () => {
  transform(source, 'benchmark.js', broadVisitorPipeline, { allowBroadVisitors: true });
});

const scopeAncestryPipeline = defineNativePipeline({
  phases: [
    {
      name: 'visit',
      plugins: [
        defineNativePlugin({
          name: 'scope-and-ancestry',
          prepare() {
            return { semantics: ['scope'], ancestry: 'parent' };
          },
          visitor: {
            Identifier(path) {
              path.scope.hasBinding(String(path.node.name));
              void path.parent;
            },
          },
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
        visitor: { Identifier() {} },
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
          prepare: () => ({
            identifierNames: [`source${index}`],
            fields: { Identifier: ['name'] },
          }),
          visitor: {
            Identifier(path) {
              path.replaceWith(`renamed${index}`);
            },
          },
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
          prepare() {
            return { children: { Program: ['body'] } };
          },
          visitor: {
            Program(path) {
              path.getChildList('body');
            },
          },
        }),
      ],
    },
  ],
});
bench('declared structural child transform', () => {
  transform(source, 'benchmark.js', structuralPipeline);
});

function allocationVisitor(name: string) {
  const plan =
    name === 'scalar' || name === 'snapshot'
      ? { fields: { Identifier: ['name'] as const } }
      : name === 'parent'
        ? { ancestry: 'parent' as const }
        : {};
  return defineNativePipeline({
    phases: [
      {
        name: 'transform',
        plugins: [
          defineNativePlugin({
            name,
            prepare: () => plan,
            visitor: {
              Identifier(path) {
                if (name === 'ranges') void (path.type + path.start + path.end);
                else if (name === 'scalar') void path.node.name;
                else if (name === 'parent') void path.parent;
                else if (name === 'snapshot') path.snapshot({ fields: ['name'] });
              },
            },
          }),
        ],
      },
    ],
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
          prepare: () => ({ fields: { Identifier: ['name'] } }),
          visitor: {
            Identifier(path) {
              if (String(path.node.name).startsWith('EDIT_'))
                path.replaceWith(String(path.node.name).slice(5));
            },
          },
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
