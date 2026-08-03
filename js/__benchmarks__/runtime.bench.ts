import { bench as vitestBench } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../index';
import type { Pipeline, PreflightTransforms } from '../index';
import {
  NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES,
  NATIVE_TRANSFORM_OWNERSHIP_FIXTURES,
  type NativeTransformName,
} from '../preflight/__tests__/native-transform-fixtures';
import { generateLargeFileSource } from './large-file-corpus';
import { createEditor } from '../runtime/editor';
import { codeFactory, makeSourceFragment, realizeContent } from '../runtime/fragments';
import { NativeTransformSession } from '../runtime/session';
import type { EditCommand, NativeEvent } from '../types';

function benchmarkTransform(...args: Parameters<typeof transform>) {
  const result = transform(...args);
  if (result.status !== 'complete') {
    throw new Error(`benchmark transform bailed out: ${result.reason}`);
  }
  return result;
}

function verifiedBench(name: string, run: () => unknown) {
  // Vitest's benchmark runner may report a callback exception as a NaN row
  // without failing the process. Execute every workload once during module
  // registration so a bailout or setup error fails the benchmark gate.
  run();
  vitestBench(name, run);
}

const source = Array.from(
  { length: 2_000 },
  (_, index) => `export const value${index} = source${index} + ${index};`,
).join('\n');

const metroOptimizationSource = Array.from(
  { length: 500 },
  (_, index) =>
    `function dead${index}(){return ${index}+2*3} const live${index}=(${index}+2*3)>4?"yes":"no"; sink(live${index});`,
).join('\n');
const metroOptimizationPipeline = defineNativePipeline({
  phases: [
    {
      name: 'metro-optimization',
      native: {
        optimize: {
          constantFolding: true,
          deadCodeElimination: true,
        },
      },
    },
  ],
});
verifiedBench('fused native Metro constant folding and DCE', () => {
  benchmarkTransform(metroOptimizationSource, 'benchmark.js', metroOptimizationPipeline);
});

const deadFunctionChainSource = [
  'function dead0(){return 0}',
  ...Array.from(
    { length: 499 },
    (_, index) => `function dead${index + 1}(){return dead${index}()}`,
  ),
].join('\n');
verifiedBench('500-function adversarial DCE chain', () => {
  benchmarkTransform(deadFunctionChainSource, 'benchmark.js', metroOptimizationPipeline);
});

const legacySyntaxPipeline = defineNativePipeline({
  phases: [
    {
      name: 'legacy-syntax',
      native: {
        transforms: {
          blockScoping: true,
          parameters: true,
          destructuring: true,
          forOf: true,
          classes: true,
          classProperties: { loose: true },
          classStaticBlock: true,
        },
        helpers: { mode: 'inline' },
        comments: false,
      },
    },
  ],
});
const nativeClassesSource = Array.from(
  { length: 500 },
  (_, index) =>
    `class Value${index}{field=${index};constructor(value){this.value=value}read(){return this.value+this.field}static create(value){return new this(value)}}sink(Value${index}.create(${index}).read());`,
).join('\n');
verifiedBench('500 native legacy classes', () => {
  benchmarkTransform(nativeClassesSource, 'benchmark.js', legacySyntaxPipeline);
});
const focusedPrivatePipeline = defineNativePipeline({
  phases: [
    {
      name: 'modern-private-features',
      native: {
        transforms: {
          privateMethods: true,
          privatePropertyInObject: true,
        },
        helpers: { mode: 'inline' },
        comments: false,
      },
    },
  ],
});
const focusedPrivateSource = Array.from(
  { length: 200 },
  (_, index) =>
    `class Unrelated${index}{field=${index}}class Secret${index}{#value=${index};#read(input){return this.#value+input}read(input){return[this.#read(1),#value in input]}}sink(new Secret${index}().read(new Secret${index}()),new Unrelated${index}().field);`,
).join('\n');
verifiedBench('200 focused modern private-feature classes', () => {
  benchmarkTransform(focusedPrivateSource, 'benchmark.js', focusedPrivatePipeline);
});
const legacySyntaxNoopSource = Array.from(
  { length: 500 },
  (_, index) => `var value${index}=${index};sink(value${index});`,
).join('\n');
verifiedBench('legacy syntax no-op discovery', () => {
  benchmarkTransform(legacySyntaxNoopSource, 'benchmark.js', legacySyntaxPipeline);
});

const nonHermesLegacyPipeline = defineNativePipeline({
  phases: [
    {
      name: 'non-hermes-language',
      native: {
        transforms: {
          blockScoping: true,
          parameters: true,
          destructuring: true,
          classes: true,
          classProperties: { loose: true },
          classStaticBlock: true,
          asyncFunctions: true,
          objectRestSpread: { loose: true, useBuiltIns: true },
        },
        helpers: {
          mode: 'runtime',
          moduleName: '@babel/runtime',
          version: '7.29.7',
        },
        comments: false,
      },
    },
  ],
});
const nonHermesLegacySources = Array.from(
  { length: 200 },
  (_, index) =>
    `const input${index}={kept:${index},extra:${index + 1}};const {kept,...rest${index}}=input${index};async function read${index}(value=${index}){class Box{field=value;read(){return {...rest${index},kept,value:this.field}}}return new Box().read()}sink(read${index}());`,
);
verifiedBench('200 non-Hermes legacy modules fused language pass', () => {
  for (const [index, moduleSource] of nonHermesLegacySources.entries()) {
    benchmarkTransform(moduleSource, `benchmark-${index}.js`, nonHermesLegacyPipeline);
  }
});

const productionAppLanguagePipeline = defineNativePipeline({
  phases: [
    {
      name: 'production-app-language',
      native: {
        typescript: 'strip',
        jsx: 'automatic',
        jsxImportSource: 'react',
        comments: false,
      },
    },
  ],
});
const productionAppSource = Array.from(
  { length: 200 },
  (_, index) =>
    `type Props${index}={value:number};export function Component${index}({value}:Props${index}){return <View testID="value-${index}">{value}</View>}`,
).join('\n');
verifiedBench('200 production app TypeScript JSX components', () => {
  benchmarkTransform(productionAppSource, 'App.tsx', productionAppLanguagePipeline);
});

const developmentRefreshPipeline = defineNativePipeline({
  phases: [
    {
      name: 'development-react',
      native: {
        typescript: 'strip',
        jsx: 'automatic',
        jsxImportSource: 'react',
        reactRefresh: {},
      },
    },
  ],
});
verifiedBench('200 development React Refresh components', () => {
  benchmarkTransform(productionAppSource, 'App.tsx', developmentRefreshPipeline);
});

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
verifiedBench('static JavaScript visitor transform', () => {
  benchmarkTransform(source, 'benchmark.js', visitorPipeline);
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
verifiedBench('native Identifier predicate with 0% selectivity', () => {
  benchmarkTransform(source, 'benchmark.js', rejectedIdentifierPipeline);
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
verifiedBench('native predicate with 0% selectivity', () => {
  benchmarkTransform(source, 'benchmark.js', rejectedDeclarationPipeline);
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
  verifiedBench(`native predicate with ${label} selectivity`, () => {
    benchmarkTransform(selectiveSource, 'benchmark.js', selectiveDeclarationPipeline);
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
verifiedBench('enter/exit JavaScript visitor transform', () => {
  benchmarkTransform(source, 'benchmark.js', exitVisitorPipeline);
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
verifiedBench('12-plugin JavaScript visitor fan-out', () => {
  benchmarkTransform(source, 'benchmark.js', pluginFanoutPipeline);
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
verifiedBench('11 static executors beside one dynamic plugin', () => {
  benchmarkTransform(source, 'benchmark.js', mixedExecutorPipeline);
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
verifiedBench('11 globally deoptimized peers beside stop capability', () => {
  benchmarkTransform(source, 'benchmark.js', globallySlowExecutorPipeline);
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
verifiedBench('7-plugin disjoint visitor dispatch', () => {
  benchmarkTransform(source, 'benchmark.js', disjointPluginPipeline);
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
verifiedBench('dense identifier edit transform', () => {
  benchmarkTransform(source, 'benchmark.js', denseEditPipeline);
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
verifiedBench('dense named edit and map transform', () => {
  benchmarkTransform(source, 'benchmark.js', denseNamedEditPipeline, {
    sourceMapMode: 'boundary',
  });
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
verifiedBench('broad catch-all streaming transform', () => {
  benchmarkTransform(source, 'benchmark.js', broadVisitorPipeline, {
    allowBroadVisitors: true,
  });
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
              { fields: ['name'], scope: true, ancestry: { mode: 'parent' } },
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
verifiedBench('identifier scope and ancestry transform', () => {
  benchmarkTransform(source, 'benchmark.js', scopeAncestryPipeline);
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

const nativeTypeScriptPreflight = defineNativePipeline({
  phases: [
    {
      name: 'preflight',
      native: { typescript: 'strip' },
    },
  ],
});
const nativeJsxPreflight = defineNativePipeline({
  phases: [
    {
      name: 'preflight',
      native: { jsx: 'automatic' },
    },
  ],
});
const nativeAsyncGeneratorPreflight = defineNativePipeline({
  phases: [
    {
      name: 'preflight',
      native: {
        transforms: { asyncGeneratorFunctions: true },
        helpers: {
          mode: 'runtime',
          moduleName: '@babel/runtime',
          version: '7.29.2',
        },
      },
    },
  ],
});
const nativeReactCompilerPreflight = defineNativePipeline({
  phases: [
    {
      name: 'preflight',
      native: {
        reactCompiler: {
          compilationMode: 'infer',
          panicThreshold: 'none',
          target: '19',
          enableResetCacheOnSourceFileChanges: true,
          customOptOutDirectives: ['widget'],
        },
        jsx: 'preserve',
      },
    },
  ],
});

verifiedBench('native TypeScript preflight', () => {
  benchmarkTransform(
    'enum Kind { A, B } class Value { constructor(public kind: Kind) {} }',
    'fixture.ts',
    nativeTypeScriptPreflight,
  );
});

verifiedBench('native automatic JSX preflight', () => {
  benchmarkTransform(
    'export const view = <Widget value={1} />;',
    'fixture.jsx',
    nativeJsxPreflight,
  );
});

verifiedBench('native async-generator preflight', () => {
  benchmarkTransform(
    'var iterable = { async *values() { yield await 1; } };',
    'fixture.js',
    nativeAsyncGeneratorPreflight,
  );
});
verifiedBench('native React Compiler preflight', () => {
  benchmarkTransform(
    'function Component(props) { return <View onPress={() => props.onPress()}>{props.text}</View>; }',
    'fixture.jsx',
    nativeReactCompilerPreflight,
  );
});

const nativeTransformFamilyPipelines = Object.fromEntries(
  Object.entries(NATIVE_TRANSFORM_OWNERSHIP_FIXTURES).map(([name, [, option]]) => [
    name,
    defineNativePipeline({
      phases: [
        {
          name: `family-${name}`,
          native: {
            transforms: { [name]: option } as PreflightTransforms,
            helpers: {
              mode: 'runtime',
              moduleName: '@babel/runtime',
              version: '7.29.7',
            },
          },
        },
      ],
    }),
  ]),
) as Record<NativeTransformName, Pipeline>;

const transformFamilyPadding = Array.from(
  { length: 5_000 },
  (_, index) => `var familyPadding${index}=${index};`,
).join('\n');
const transformFamilyAdversarialPrefix = String.raw`
// class async for of static using value ||= value ?? value?.field
/* let const ... #private /(?<name>.)/su sticky unicode JSX <Widget /> */
var misleadingTransformText =
  "class async for of static using ||= ?? ?. ... #private /regexp/suydv";
`;

function runNativeTransformFamilyCohort(prefix: string): void {
  for (const [name, [ownedSource]] of Object.entries(NATIVE_TRANSFORM_OWNERSHIP_FIXTURES) as [
    NativeTransformName,
    (typeof NATIVE_TRANSFORM_OWNERSHIP_FIXTURES)[NativeTransformName],
  ][]) {
    const result = transform(
      `${prefix}\n${ownedSource}`,
      `family-${name}.js`,
      nativeTransformFamilyPipelines[name],
    );
    const expected = NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES.has(name) ? 'bailout' : 'complete';
    if (result.status !== expected) {
      throw new Error(
        `${name} ${expected === 'complete' ? 'bailed out' : 'unexpectedly completed'}${
          result.status === 'bailout' ? `: ${result.reason}` : ''
        }`,
      );
    }
  }
}

verifiedBench('all native transform families: small cohort', () => {
  runNativeTransformFamilyCohort('');
});
verifiedBench('all native transform families: medium cohort', () => {
  runNativeTransformFamilyCohort(transformFamilyPadding.slice(0, 8 * 1024));
});
verifiedBench('all native transform families: large cohort', () => {
  runNativeTransformFamilyCohort(transformFamilyPadding.slice(0, 100 * 1024));
});
verifiedBench('all native transform families: adversarial cohort', () => {
  runNativeTransformFamilyCohort(transformFamilyAdversarialPrefix);
});

verifiedBench('three-phase reparse transform', () => {
  benchmarkTransform(source, 'benchmark.js', threePhasePipeline);
});

function changedPhasePipeline(count: number, printed: boolean) {
  return defineNativePipeline({
    phases: Array.from({ length: count }, (_, index) => ({
      name: `changed-${index}`,
      requiresPrintedInput: printed,
      plugins: [
        defineNativePlugin({
          name: `changed-plugin-${index}`,
          editEffect: 'text-only',
          visitors: [
            defineVisitor(
              'Identifier',
              {
                fields: ['name'],
                where: { name: { oneOf: [`source${index}`] } },
              },
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
  verifiedBench(`${phaseCount} changed text phases: fused`, () => {
    benchmarkTransform(source, 'benchmark.js', fused);
  });
  verifiedBench(`${phaseCount} changed text phases: rendered`, () => {
    benchmarkTransform(source, 'benchmark.js', rendered);
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
verifiedBench('declared structural child transform', () => {
  benchmarkTransform(source, 'benchmark.js', structuralPipeline);
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
          ? defineVisitor('Identifier', { ancestry: { mode: 'parent' } }, path => void path.parent)
          : name === 'ranges'
            ? defineVisitor('Identifier', {}, path => void (path.type + path.start + path.end))
            : defineVisitor('Identifier', {}, () => {});
  return defineNativePipeline({
    phases: [
      {
        name: 'transform',
        plugins: [defineNativePlugin({ name, visitors: [visitor] })],
      },
    ],
  });
}

function generatedSource(minimumBytes: number): string {
  return generateLargeFileSource(minimumBytes, 'shallow');
}

function ancestorScalingSource(count: number): string {
  return Array.from(
    { length: count },
    (_, index) => `const Component${index}=createReactClass({render(){return null}});`,
  ).join('\n');
}

function ancestorScalingPipeline(hydrated: boolean) {
  return defineNativePipeline({
    phases: [
      {
        name: hydrated ? 'hydrated-ancestry' : 'summary-ancestry',
        plugins: [
          defineNativePlugin({
            name: hydrated ? 'hydrated-display-name-owner' : 'summary-owner',
            visitors: [
              defineVisitor(
                'CallExpression',
                hydrated
                  ? {
                      ancestry: {
                        mode: 'findParent',
                        routes: {
                          VariableDeclarator: { fields: ['bindingName'] },
                        },
                      },
                    }
                  : { ancestry: { mode: 'findParent' } },
                path => {
                  const owner = path.findParent(
                    parent => parent.node.type === 'VariableDeclarator',
                  );
                  if (hydrated && owner?.node.type === 'VariableDeclarator')
                    void owner.node.bindingName;
                },
              ),
            ],
          }),
        ],
      },
    ],
  });
}

for (const count of [250, 1_000, 4_000]) {
  const generated = ancestorScalingSource(count);
  for (const hydrated of [false, true]) {
    const pipeline = ancestorScalingPipeline(hydrated);
    verifiedBench(
      `${count} createReactClass calls with ${hydrated ? 'hydrated' : 'summary-only'} ancestry`,
      () => benchmarkTransform(generated, 'display-name-scaling.js', pipeline),
    );
  }
}

for (const shape of ['nested', 'functions', 'dependencies'] as const) {
  const generated = generateLargeFileSource(650 * 1024, shape);
  const pipeline = allocationVisitor('ranges');
  verifiedBench(`650 KiB ${shape} range visitor`, () => {
    benchmarkTransform(generated, 'generated.js', pipeline);
  });
}

const functionMapSource = generateLargeFileSource(650 * 1024, 'functions');
verifiedBench('650 KiB native function map', () => {
  benchmarkTransform(functionMapSource, 'generated.js', visitorPipeline, {
    functionMap: true,
  });
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
verifiedBench('650 KiB sparse edits', () => {
  benchmarkTransform(sparseEditSource, 'generated.js', sparseEditPipeline, {
    sourceMapMode: 'boundary',
  });
});

const denseEditSource = generateLargeFileSource(650 * 1024, 'dense-edits');
verifiedBench('650 KiB dense edits', () => {
  benchmarkTransform(denseEditSource, 'generated.js', denseEditPipeline, {
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
verifiedBench('650 KiB per-node duplication with contained edits', () => {
  benchmarkTransform(copyHeavySource, 'generated.js', copyHeavyPipeline, {
    sourceMapMode: 'boundary',
  });
});

interface MirrorState {
  fragment: import('../index').SourceFragment | undefined;
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
verifiedBench('650 KiB repeated single-range copies', () => {
  benchmarkTransform(copyHeavySource, 'generated.js', repeatedCopyPipeline, {
    sourceMapMode: 'boundary',
  });
});

for (const name of ['no-properties', 'ranges', 'scalar', 'parent', 'snapshot']) {
  const pipeline = allocationVisitor(name);
  verifiedBench(`allocation profile: ${name}`, () =>
    benchmarkTransform(source, 'benchmark.js', pipeline),
  );
}

for (const [label, generated] of [
  ['256 KiB', generatedSource(256 * 1024)],
  ['650 KiB', generatedSource(650 * 1024)],
  ['1 MiB', generatedSource(1024 * 1024)],
  ['2 MiB', generatedSource(2 * 1024 * 1024)],
  ['5 MiB', generatedSource(5 * 1024 * 1024)],
] as const) {
  const pipeline = allocationVisitor('ranges');
  verifiedBench(`${label} range visitor`, () => {
    benchmarkTransform(generated, 'generated.js', pipeline);
  });
}

for (const [label, generated] of [
  ['empty', ''],
  ['100 B', generatedSource(100)],
  ['1 KiB', generatedSource(1024)],
  ['10 KiB', generatedSource(10 * 1024)],
  ['100 KiB', generatedSource(100 * 1024)],
] as const) {
  verifiedBench(`fixed-cost profile: ${label}`, () => {
    benchmarkTransform(generated, 'generated.js', visitorPipeline);
  });
}

const largeChangedSource = generatedSource(650 * 1024);
const largeFusedPhases = changedPhasePipeline(3, false);
const largeRenderedPhases = changedPhasePipeline(3, true);
verifiedBench('650 KiB, 3 changed text phases: fused', () => {
  benchmarkTransform(largeChangedSource, 'generated.js', largeFusedPhases);
});
verifiedBench('650 KiB, 3 changed text phases: rendered', () => {
  benchmarkTransform(largeChangedSource, 'generated.js', largeRenderedPhases);
});

for (const count of [64, 512, 2_048]) {
  const exports = Array.from(
    { length: count },
    (_, index) => `export * as ns${index} from "module-${index}" with { type: "json" };`,
  ).join('\n');
  verifiedBench(`export namespace attribute restoration scaling: ${count}`, () => {
    benchmarkTransform(exports, 'exports.js', legacySyntaxPipeline);
  });

  const shadowed = `${'{let value;'.repeat(count)}sink(value);${'}'.repeat(count)}`;
  verifiedBench(`block-scope depth scaling: ${count}`, () => {
    benchmarkTransform(shadowed, 'blocks.js', legacySyntaxPipeline);
  });

  const arrows = `${Array.from({ length: count }, () => '(value=0)=>').join('')}this.value`;
  verifiedBench(`parameter lexical-capture depth scaling: ${count}`, () => {
    benchmarkTransform(`const value=${arrows};`, 'parameters.js', legacySyntaxPipeline);
  });

  const deepestReferences = Array.from({ length: count }, () => 'this.value').join('+');
  const referenceArrows = `${Array.from({ length: 64 }, () => '(value=0)=>').join('')}${deepestReferences}`;
  verifiedBench(`parameter deepest lexical-reference scaling: ${count}`, () => {
    benchmarkTransform(`const value=${referenceArrows};`, 'parameters.js', legacySyntaxPipeline);
  });
}

for (const depth of [16, 64, 256]) {
  const pattern = `${'{a:'.repeat(depth)}value=0${'}'.repeat(depth)}`;
  const fallback = `${'{a:'.repeat(depth)}0${'}'.repeat(depth)}`;
  const nestedDestructuring = `const read=(${pattern}=${fallback})=>value;sink(read);`;
  verifiedBench(`destructuring nesting-depth scaling: ${depth}`, () => {
    benchmarkTransform(nestedDestructuring, 'destructuring.js', legacySyntaxPipeline);
  });
}

for (const count of [64, 512, 2_048]) {
  const syntheticBindings = Array.from(
    { length: count },
    (_, index) => `p${index}:value${index}=${index}`,
  ).join(',');
  const syntheticInteractions =
    `function read({${syntheticBindings}}={}){return value0}` + 'sink(read);';
  verifiedBench(`synthetic-span plan-bucket interaction scaling: ${count}`, () => {
    benchmarkTransform(syntheticInteractions, 'synthetic-plans.js', legacySyntaxPipeline);
  });
}

for (const count of [1_000, 10_000]) {
  verifiedBench(`editor reset compaction scaling: ${count}`, () => {
    const edits: EditCommand[] = [];
    let order = 0;
    const editorSession = {
      source: 'x'.repeat(count),
      commit: () => ({ code: '' }),
    };
    const resetEditor = createEditor(editorSession, edits, 'reset', () => order++);
    const retainedEditor = createEditor(editorSession, edits, 'retained', () => order++);
    for (let index = 0; index < count; index++) {
      resetEditor.appendLeft(index, 'x');
      retainedEditor.appendLeft(index, 'y');
    }
    resetEditor.reset(0, count);
    return edits.length;
  });

  const parts = Object.assign(
    Array.from({ length: count + 1 }, () => 'x'),
    { raw: [] },
  ) as unknown as TemplateStringsArray;
  const values = Array.from({ length: count }, () => 'y');
  verifiedBench(
    `code template assembly scaling: ${count}`,
    () => codeFactory.template(parts, ...values).code.length,
  );

  const fragmentSession = new NativeTransformSession('x', 'fragment.js');
  const sourceFragment = makeSourceFragment(fragmentSession, 0, 1);
  const composite = {
    kind: 'composite' as const,
    parts: Array.from({ length: count }, () => ['left', sourceFragment, 'right']).flat(),
  };
  verifiedBench(`provenance composite assembly scaling: ${count}`, () => {
    const realized = realizeContent(fragmentSession, composite);
    return realized.contentParts?.length;
  });
}

const inlineRequiresReferencePipeline = defineNativePipeline({
  phases: [
    {
      name: 'inline-requires-reference-classification',
      plugins: [
        defineNativePlugin({
          name: 'inline-requires-reference-classification',
          visitors: [
            defineVisitor('Program', { scope: true }, path => {
              for (const reference of path.scope.getBinding('binding')?.references ?? []) {
                void (reference.write || reference.memberWrite);
              }
            }),
          ],
        }),
      ],
    },
  ],
});
for (const [count, depth] of [
  [256, 1],
  [2_048, 1],
  [256, 8],
  [2_048, 8],
] as const) {
  const chain = '.value'.repeat(depth);
  const safeReferences = `const binding=require('dependency');${Array.from(
    { length: count },
    () => `consume(binding${chain});`,
  ).join('')}`;
  verifiedBench(`inline-requires safe references: ${count} depth ${depth}`, () => {
    benchmarkTransform(safeReferences, 'inline-requires.js', inlineRequiresReferencePipeline);
  });
}

for (const count of [16, 128, 512]) {
  const phases = Array.from({ length: count }, (_, index) => ({
    name: `retained-${index}`,
    plugins: [
      defineNativePlugin({
        name: `retained-plugin-${index}`,
        visitors: [defineVisitor('Identifier', {}, () => {})],
      }),
    ],
  }));
  const retainedPipeline = defineNativePipeline({ phases });
  verifiedBench(`retained phase suffix scaling: ${count}`, () => {
    benchmarkTransform('const value = input;', 'retained.js', retainedPipeline);
  });
}

for (const count of [256, 2_048]) {
  const nonAsciiFunctions = `const prefix='${'é'.repeat(count)}';${Array.from(
    { length: count },
    (_, index) => `function f${index}(){return ${index}}`,
  ).join('')}`;
  verifiedBench(`non-ASCII source-map copy reposition scaling: ${count}`, () => {
    benchmarkTransform(nonAsciiFunctions, 'non-ascii.js', copyHeavyPipeline, {
      sourceMapMode: 'boundary',
    });
  });

  const properties = Array.from({ length: count }, (_, index) => `p${index}: const v${index}`).join(
    ',',
  );
  const flowMatch = `// @flow\nconst result = match (input) { {${properties}} => 1, _ => 0 };`;
  verifiedBench(`Flow match duplicate-set scaling: ${count}`, () => {
    benchmarkTransform(flowMatch, 'match.js', visitorPipeline);
  });
}

for (const depth of [32, 128, 256]) {
  const nestedObjectFunction = `const value=${'{a:'.repeat(depth)}function named(){}${'}'.repeat(depth)};`;
  verifiedBench(`function-map container depth scaling: ${depth}`, () => {
    benchmarkTransform(nestedObjectFunction, 'function-map.js', visitorPipeline, {
      functionMap: true,
    });
  });
}

for (const count of [256, 2_048]) {
  verifiedBench(`retained repeated high-fanout child cache scaling: ${count}`, () => {
    const session = new NativeTransformSession('', 'children.js');
    session.seedRetainedChildTypes(['Program']);
    const event = (id: number, parentId?: number): NativeEvent => ({
      sequence: id,
      side: 'enter',
      id,
      type: parentId == null ? 'Program' : 'ExpressionStatement',
      start: 0,
      end: 0,
      parentId,
      parentType: parentId == null ? undefined : 'Program',
      scopeId: 0,
      fields: [],
    });
    session.cacheEvent(event(0));
    for (let batch = 0; batch < 4; batch++)
      for (let id = 1; id <= count; id++) session.cacheEvent(event(id, 0));
    session.close();
  });
}

const uidPrefixes = Array.from({ length: 1 << 12 }, (_, value) => {
  const prefix = Array.from({ length: 12 }, (_, bit) => (value & (1 << bit) ? '$' : '_')).join('');
  return `let ${prefix}value;`;
}).join('');
const uidFallbackPipeline = defineNativePipeline({
  phases: [
    {
      name: 'uid-fallback',
      plugins: [
        defineNativePlugin({
          name: 'uid-fallback-plugin',
          visitors: [
            defineVisitor('Program', { scope: true }, path => void path.scope.generateUid('value')),
          ],
        }),
      ],
    },
  ],
});
for (const maximumPrefix of [16, 64, 256]) {
  const sourceWithLongPrefix = `${uidPrefixes}let ${'_'.repeat(maximumPrefix)}value;`;
  verifiedBench(`UID prefix saturated-table fallback depth: ${maximumPrefix}`, () => {
    benchmarkTransform(sourceWithLongPrefix, 'uids.js', uidFallbackPipeline);
  });
}

for (const phaseCount of [8, 32]) {
  const pipeline = changedPhasePipeline(phaseCount, false);
  verifiedBench(`packed source-map name-chain scaling: ${phaseCount}`, () => {
    benchmarkTransform(source, 'map-chain.js', pipeline, {
      sourceMapMode: 'boundary',
    });
  });
}

const cleanupCorpus = Array.from(
  { length: 2_000 },
  (_, index) => `export const value${index} = source${index}?.value ?? ${index};`,
).join('\n');

const cleanupProfiles = [
  ['identity lookbehind', { transforms: { regexpLookBehind: true } }],
  ['identity match indices', { transforms: { regexpMatchIndices: true } }],
  ['selected absent destructuring', { transforms: { destructuring: true } }],
  ['selected absent classes', { transforms: { classes: true }, helpers: { mode: 'inline' } }],
  ['syntax-free Oxc profile', { transforms: { logicalAssignmentOperators: true } }],
] as const;

for (const [name, native] of cleanupProfiles) {
  const pipeline = defineNativePipeline({ phases: [{ name, native }] });
  verifiedBench(`cleanup ${name}`, () => benchmarkTransform(cleanupCorpus, 'cleanup.js', pipeline));
}

for (const [name, extra] of [
  ['without eval text', ''],
  ['with eval comment prefilter hit', "// eval('text only')\n"],
] as const) {
  const pipeline = defineNativePipeline({
    phases: [{ name, native: { optimize: { deadCodeElimination: true } } }],
  });
  verifiedBench(`cleanup DCE ${name}`, () =>
    benchmarkTransform(`${extra}${cleanupCorpus}`, 'cleanup.js', pipeline),
  );
}

const postconditionCorpus = Array.from(
  { length: 500 },
  (_, index) =>
    `class Value${index}{read(input=${index}){for(const value of input){sink(value)}return input}}`,
).join('\n');
for (const [name, transforms] of [
  ['classes', { classes: true }],
  ['parameters', { parameters: true }],
  ['for-of', { forOf: true }],
  ['fused boundaries', { classes: true, parameters: true, forOf: true }],
] as const) {
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: `postcondition ${name}`,
        native: { transforms, helpers: { mode: 'inline' } },
      },
    ],
  });
  verifiedBench(`cleanup postcondition ${name}`, () =>
    benchmarkTransform(postconditionCorpus, 'metro-bundle.js', pipeline),
  );
}

const retainedIndexCorpus = generateLargeFileSource(256 * 1024, 'functions');
const retainedIndexContracts = [
  ['no child routing', defineVisitor('Function', {}, () => {})],
  [
    'shallow parameter wildcard',
    defineVisitor(
      'FormalParameters',
      { children: { '*': { route: 'FormalParameter|FormalParameterRest' } } },
      () => {},
    ),
  ],
  [
    'named function roles',
    defineVisitor(
      'Function',
      {
        children: {
          body: { route: 'FunctionBody' },
          params: {
            route: 'FormalParameter|FormalParameterRest|BindingRestElement',
            children: {
              pattern: { route: 'Identifier|ObjectPattern|ArrayPattern' },
              default: { route: 'Expression' },
              argument: { route: 'BindingRestElement' },
            },
          },
        },
      },
      () => {},
    ),
  ],
  [
    'nested all-node wildcard baseline',
    defineVisitor(
      'Function',
      { children: { '*': { route: '*', children: { '*': { route: '*' } } } } },
      () => {},
    ),
  ],
] as const;
for (const [name, visitor] of retainedIndexContracts) {
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: `retained index ${name}`,
        plugins: [defineNativePlugin({ name: `retained-index-${name}`, visitors: [visitor] })],
      },
    ],
  });
  verifiedBench(`retained-index construction: ${name}`, () =>
    benchmarkTransform(retainedIndexCorpus, 'retained-index.js', pipeline),
  );
}
