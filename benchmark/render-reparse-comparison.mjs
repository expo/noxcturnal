import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../dist/index.js';

const samples = Number.parseInt(process.env.NOX_RENDER_REPARSE_SAMPLES ?? '80', 10);
const warmups = Number.parseInt(process.env.NOX_RENDER_REPARSE_WARMUPS ?? '15', 10);
const targets = Number.parseInt(process.env.NOX_RENDER_REPARSE_TARGETS ?? '500', 10);
assert(Number.isSafeInteger(samples) && samples > 1);
assert(Number.isSafeInteger(warmups) && warmups >= 0);
assert(Number.isSafeInteger(targets) && targets > 3);

const declarations = (count, prefix = 'value') =>
  Array.from({ length: count }, (_, index) => `const ${prefix}${index} = ${index};`).join('\n');

const renameRange = (name, start, end, replacement) =>
  defineNativePlugin({
    name,
    editEffect: 'whole-program',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        const text = path.sourceText();
        const match = /^value(\d+)$/.exec(text);
        if (match == null) return;
        const index = Number(match[1]);
        if (index >= start && index < end)
          path.replaceWith(
            typeof replacement === 'function' ? replacement(index) : `${replacement}${index}`,
          );
      }),
    ],
  });

const observeSyntax = defineNativePlugin({
  name: 'observe-syntax',
  editEffect: 'none',
  visitors: [defineVisitor('Identifier', { fields: ['name'] }, () => {})],
});
const observeParents = defineNativePlugin({
  name: 'observe-parents',
  editEffect: 'none',
  visitors: [
    defineVisitor('NumericLiteral', { ancestry: 'parent' }, path => {
      void path.parentPath;
    }),
    defineVisitor('Program', { children: { body: { route: 'Statement' } } }, path => {
      void path.get('body');
    }),
  ],
});
const observeSemantics = defineNativePlugin({
  name: 'observe-semantics',
  editEffect: 'none',
  visitors: [
    defineVisitor('Identifier', { scope: true }, path => {
      void path.scope?.parent;
    }),
  ],
});
const identity = defineNativePlugin({
  name: 'identity',
  editEffect: 'whole-program',
  visitors: [
    defineVisitor('Identifier', {}, path => {
      path.replaceWith({ code: path.sourceText(), mapping: 'identity' });
    }),
  ],
});
const convergentIdentity = defineNativePlugin({
  name: 'convergent-identity',
  editEffect: 'whole-program',
  visitors: [
    defineVisitor('Identifier', {}, path => {
      path.replaceWith({ code: path.sourceText(), mapping: 'identity' });
    }),
    defineVisitor('Identifier', {}, path => {
      path.replaceWith({ code: path.sourceText(), mapping: 'identity' });
    }),
  ],
});
const collectDependencies = defineNativePlugin({
  name: 'collect-dependencies',
  editEffect: 'none',
  visitors: [
    defineVisitor(
      'CallExpression',
      {
        fields: ['calleeName', 'calleeGlobal', 'staticArgument', 'argumentCount'],
      },
      path => {
        void path.node.calleeName;
        void path.node.calleeGlobal;
        void path.node.staticArgument;
      },
    ),
    defineVisitor('ImportDeclaration', { fields: ['source', 'importKind'] }, path => {
      void path.node.source;
    }),
  ],
});
const metroModuleWrapper = defineNativePlugin({
  name: 'metro-module-wrapper',
  editEffect: 'whole-program',
  pre(context) {
    context.editor.appendRight(0, '__d(function(){\n');
  },
  post(context) {
    context.editor.prependLeft(context.source.length, '\n});');
  },
});
const metroScriptWrapper = defineNativePlugin({
  name: 'metro-script-wrapper',
  editEffect: 'whole-program',
  pre(context) {
    context.editor.appendRight(0, '(function(global){\n');
  },
  post(context) {
    context.editor.prependLeft(context.source.length, '\n})(this);');
  },
});

function phased(name, source, plugins, observer, groupable = true) {
  const phases = plugins.map((plugin, index) => ({
    name: `${name}-mutate-${index}`,
    plugins: [plugin],
  }));
  phases.push({ name: `${name}-observe`, plugins: [observer] });
  return {
    name,
    source,
    baseline: defineNativePipeline({ phases }),
    optimized: defineNativePipeline({
      phases: groupable
        ? [
            {
              name: `${name}-shared-input`,
              plugins,
            },
            phases.at(-1),
          ]
        : phases,
    }),
  };
}

const repeatedSource = declarations(targets * 2);
const dependencySource = Array.from(
  { length: Math.max(20, Math.floor(targets / 5)) },
  (_, index) =>
    `import dependency${index} from "./dependency-${index}";\n` +
    `const loaded${index} = require("./loaded-${index}");\n` +
    `export const result${index} = dependency${index}(loaded${index});`,
).join('\n');
const commonjsDependencySource = Array.from(
  { length: Math.max(20, Math.floor(targets / 5)) },
  (_, index) =>
    `const loaded${index} = require("./loaded-${index}");\n` +
    `exports.result${index} = loaded${index}.value;`,
).join('\n');
const nestedFunctionSource = Array.from(
  { length: Math.max(20, Math.floor(targets / 8)) },
  (_, index) =>
    `class Container${index} {\n` +
    `  method(value) { return [value].map(item => function nested${index}(){ return item; }); }\n` +
    `}\n`,
).join('\n');
const workloads = [
  phased(
    'repeated-template-syntax',
    repeatedSource,
    [
      renameRange('repeat-a', 0, targets, 'renamed'),
      renameRange('repeat-b', targets, targets * 2, 'renamed'),
    ],
    observeSyntax,
  ),
  phased(
    'unique-replacements',
    repeatedSource,
    [
      renameRange('unique-a', 0, targets, index => `generated_${index}_a`),
      renameRange('unique-b', targets, targets * 2, index => `generated_${index}_b`),
    ],
    observeSyntax,
  ),
  phased(
    'sparse-mutation',
    declarations(targets * 4),
    [
      renameRange('sparse-a', 0, Math.max(1, Math.floor(targets * 0.02)), 'sparseA'),
      observeSyntax,
      observeSyntax,
      observeSyntax,
      renameRange(
        'sparse-b',
        targets * 3,
        targets * 3 + Math.max(1, Math.floor(targets * 0.02)),
        'sparseB',
      ),
      observeSyntax,
      observeSyntax,
      observeSyntax,
    ],
    observeSyntax,
  ),
  phased(
    'semantic-consumer',
    repeatedSource,
    [renameRange('semantic-edit', 0, targets, 'semantic')],
    observeSemantics,
    false,
  ),
  phased(
    'parent-structural-consumer',
    repeatedSource,
    [renameRange('parent-edit', 0, targets, 'parent')],
    observeParents,
    false,
  ),
  phased(
    'snapshot-independent-mutators',
    declarations(targets * 3),
    [
      renameRange('snapshot-a', 0, targets, 'snapshotA'),
      renameRange('snapshot-b', targets, targets * 2, 'snapshotB'),
      renameRange('snapshot-c', targets * 2, targets * 3, 'snapshotC'),
    ],
    observeSyntax,
  ),
  phased(
    'identity-convergent-edits',
    declarations(targets),
    [identity, convergentIdentity],
    observeSyntax,
    false,
  ),
  phased(
    'expo-dependency-transform',
    dependencySource,
    [renameRange('expo-source-edit', 0, 0, 'unused')],
    collectDependencies,
    false,
  ),
  phased(
    'metro-module-transform',
    commonjsDependencySource,
    [metroModuleWrapper],
    collectDependencies,
    false,
  ),
  phased(
    'metro-script-wrapping',
    `${declarations(targets)}\nglobal.result = value0;`,
    [metroScriptWrapper],
    observeSyntax,
    false,
  ),
  phased('react-compiler-prepass-shape', nestedFunctionSource, [identity], observeSemantics, false),
  phased('function-map-heavy-nested', nestedFunctionSource, [identity], observeParents, false),
];

const variants = [
  ['baseline', 'baseline', {}],
  ['coalesced', 'optimized', {}],
  ['final-function-map', 'optimized', { functionMap: true }],
];

function run(workload, variant, instrumented = false) {
  const [, pipelineName, options] = variant;
  const result = transform(
    workload.source,
    'render-reparse.mjs',
    workload[pipelineName],
    instrumented ? { ...options, debugPerformance: true } : options,
  );
  assert.equal(result.status, 'complete');
  return result;
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const at = fraction =>
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
  return { meanMs: mean, medianMs: at(0.5), p95Ms: at(0.95) };
}

for (const workload of workloads) {
  const baseline = run(workload, variants[0]);
  for (const variant of variants.slice(1)) {
    const candidate = run(workload, variant);
    assert.equal(candidate.code, baseline.code, `${workload.name}: output bytes differ`);
    assert.deepEqual(candidate.map, baseline.map, `${workload.name}: output maps differ`);
    if (variant[0] === 'final-function-map') {
      const repeated = run(workload, variant);
      assert.deepEqual(
        candidate.functionMap,
        repeated.functionMap,
        `${workload.name}: function map is not deterministic`,
      );
    }
  }
}

for (let index = 0; index < warmups; index++)
  for (const workload of index % 2 === 0 ? workloads : workloads.toReversed())
    for (const variant of index % 2 === 0 ? variants : variants.toReversed())
      run(workload, variant);

const timings = new Map();
for (const workload of workloads)
  for (const [name] of variants) timings.set(`${workload.name}:${name}`, []);
for (let sample = 0; sample < samples; sample++) {
  const workloadOrder = sample % 2 === 0 ? workloads : workloads.toReversed();
  const variantOrder = sample % 2 === 0 ? variants : variants.toReversed();
  for (const workload of workloadOrder)
    for (const variant of variantOrder) {
      const started = performance.now();
      run(workload, variant);
      timings.get(`${workload.name}:${variant[0]}`).push(performance.now() - started);
    }
}

const results = workloads.map(workload => ({
  workload: workload.name,
  sourceBytes: Buffer.byteLength(workload.source),
  variants: Object.fromEntries(
    variants.map(variant => {
      const instrumented = run(workload, variant, true);
      const counters = instrumented.metadata.performance;
      return [
        variant[0],
        {
          ...summarize(timings.get(`${workload.name}:${variant[0]}`)),
          outputBytes: Buffer.byteLength(instrumented.code),
          retainedBytes: counters.nativeRetainedBytesPeak,
          parses: counters.nativeParses,
          semanticBuilds: counters.nativeSemanticBuilds,
          traversals: counters.nativeAstTraversals,
          renderedBytes: counters.renderedBytes,
          nativeCrossings: counters.nativeWorkCrossings,
          reparses: counters.reparses,
          functionMapParses: counters.finalFunctionMapSyntaxParses,
          functionMapTraversals: counters.functionMapTraversals,
          functionMapMs: counters.functionMapMs,
          functionMapBytes: counters.functionMapBytes,
          committedBoundaryReasons: counters.committedBoundaryReasons,
          eliminatedBoundaryReasons: counters.eliminatedBoundaryReasons,
        },
      ];
    }),
  ),
}));

process.stdout.write(
  `${JSON.stringify(
    {
      command: 'node benchmark/render-reparse-comparison.mjs',
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      samples,
      warmups,
      targets,
      results,
    },
    null,
    2,
  )}\n`,
);
