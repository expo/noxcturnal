import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { defineNativePipeline, transform } from '../dist/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const expoMetroConfigRoot = resolve(
  process.env.EXPO_METRO_CONFIG_ROOT ?? join(here, '../../expo/packages/@expo/metro-config'),
);
const requireFromExpo = createRequire(join(expoMetroConfigRoot, 'package.json'));
const babel = requireFromExpo('@babel/core');
const { constantFoldingPlugin } = requireFromExpo('@expo/metro/metro-transform-plugins');
const samples = Number.parseInt(process.env.NOX_OPTIMIZER_SAMPLES ?? '200', 10);
const warmups = Number.parseInt(process.env.NOX_OPTIMIZER_WARMUPS ?? '30', 10);

assert(Number.isSafeInteger(samples) && samples > 1, 'NOX_OPTIMIZER_SAMPLES must exceed one');
assert(Number.isSafeInteger(warmups) && warmups >= 0, 'NOX_OPTIMIZER_WARMUPS must be non-negative');

const nativeFused = defineNativePipeline({
  phases: [
    {
      name: 'metro-optimization',
      native: { optimize: { constantFolding: true, deadCodeElimination: true } },
    },
  ],
});
const nativeFoldingOnly = defineNativePipeline({
  phases: [
    {
      name: 'metro-constant-folding',
      native: { optimize: { constantFolding: true } },
    },
  ],
});
const nativeDceOnly = defineNativePipeline({
  phases: [
    {
      name: 'metro-dead-code-elimination',
      native: { optimize: { deadCodeElimination: true } },
    },
  ],
});
const nativeNoOptimization = defineNativePipeline({
  phases: [{ name: 'native-parse-render-control', native: { comments: false } }],
});

const clearProgramScopePlugin = {
  visitor: {
    Program: {
      enter(path) {
        path.scope.crawl();
      },
    },
  },
};

function babelTransform(source, optimize, sourceMaps) {
  return babel.transformSync(source, {
    ast: false,
    babelrc: false,
    cloneInputAst: false,
    code: true,
    comments: true,
    configFile: false,
    filename: 'benchmark.js',
    plugins: optimize ? [constantFoldingPlugin] : [],
    sourceMaps,
  });
}

// This mirrors Metro's real separate optimization boundary: an existing Babel
// AST is handed to a second transform pass that recrawls scope before running
// constant folding and fixed-point function removal.
function babelMetroSecondPass(source, sourceMaps) {
  const ast = babel.parseSync(source, {
    babelrc: false,
    configFile: false,
    filename: 'benchmark.js',
    sourceType: 'unambiguous',
  });
  return babel.transformFromAstSync(ast, source, {
    ast: false,
    babelrc: false,
    cloneInputAst: false,
    code: true,
    comments: true,
    configFile: false,
    filename: 'benchmark.js',
    plugins: [clearProgramScopePlugin, constantFoldingPlugin],
    sourceMaps,
  });
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function measureGroup(operations) {
  const states = operations.map(([name, operation]) => ({
    name,
    operation,
    timings: [],
    outputBytes: 0,
  }));
  for (let index = 0; index < warmups; index++) {
    for (const state of index % 2 === 0 ? states : states.toReversed()) state.operation();
  }
  // Alternate A/B order every sample so thermal drift and background work do
  // not consistently favor whichever implementation happens to run first.
  for (let index = 0; index < samples; index++) {
    for (const state of index % 2 === 0 ? states : states.toReversed()) {
      const start = performance.now();
      const result = state.operation();
      state.timings.push(performance.now() - start);
      state.outputBytes = Buffer.byteLength(result.code ?? '');
    }
  }
  return states.map(({ name, timings, outputBytes }) => {
    timings.sort((left, right) => left - right);
    const meanMs = timings.reduce((sum, value) => sum + value, 0) / timings.length;
    const variance =
      timings.reduce((sum, value) => sum + (value - meanMs) ** 2, 0) / (timings.length - 1);
    return {
      name,
      samples,
      meanMs,
      medianMs: percentile(timings, 0.5),
      p75Ms: percentile(timings, 0.75),
      p95Ms: percentile(timings, 0.95),
      p99Ms: percentile(timings, 0.99),
      confidence95Ms: 1.96 * Math.sqrt(variance / timings.length),
      outputBytes,
    };
  });
}

const workloads = {
  fixed: 'const live = 1 + 2 * 3; sink(live);',
  representative: Array.from(
    { length: 500 },
    (_, index) =>
      `function dead${index}(){return ${index}+2*3}const live${index}=(${index}+2*3)>4?"yes":"no";sink(live${index});`,
  ).join('\n'),
  deadFunctionChain: [
    'function dead0(){return 0}',
    ...Array.from(
      { length: 499 },
      (_, index) => `function dead${index + 1}(){return dead${index}()}`,
    ),
  ].join('\n'),
  unsafeSideEffects: Array.from(
    { length: 500 },
    (_, index) =>
      `const value${index}=(sideEffect(${index}),1+2*3);if(check(${index})){sink(value${index})}`,
  ).join('\n'),
};

const results = [];
for (const [workload, source] of Object.entries(workloads)) {
  const operations = [
    ['native fused', () => transform(source, 'benchmark.js', nativeFused)],
    ['native folding only', () => transform(source, 'benchmark.js', nativeFoldingOnly)],
    ['native DCE only', () => transform(source, 'benchmark.js', nativeDceOnly)],
    [
      'native no optimization control',
      () => transform(source, 'benchmark.js', nativeNoOptimization),
    ],
    ['Babel Metro optimizer', () => babelTransform(source, true, false)],
    ['Babel Metro separate AST pass', () => babelMetroSecondPass(source, false)],
    ['Babel no optimization control', () => babelTransform(source, false, false)],
    ['Babel Metro optimizer with source map', () => babelTransform(source, true, true)],
  ];
  results.push(...measureGroup(operations).map(result => ({ workload, ...result })));
}

// Independent toggles must remain independent, and unsafe calls must survive.
const toggleSource = 'function dead(){return 1+2*3}const live=1+2*3;sideEffect(live);';
const folded = transform(toggleSource, 'benchmark.js', nativeFoldingOnly);
const eliminated = transform(toggleSource, 'benchmark.js', nativeDceOnly);
assert.match(folded.code, /function dead/);
assert.doesNotMatch(folded.code, /1 \+ 2 \* 3/);
assert.doesNotMatch(eliminated.code, /function dead/);
assert.match(eliminated.code, /1 \+ 2 \* 3/);
for (const mode of [nativeFused, nativeFoldingOnly, nativeDceOnly]) {
  assert.match(transform(workloads.unsafeSideEffects, 'benchmark.js', mode).code, /sideEffect/);
}

process.stdout.write(
  `${JSON.stringify(
    {
      schemaVersion: 1,
      expoMetroConfigRoot,
      samples,
      warmups,
      oxcCompressorDisposition:
        'not benchmarked: Oxc 0.141 compressor is a general minifier and is not semantically equivalent to Metro constant folding plus conservative function-only DCE',
      results,
    },
    null,
    2,
  )}\n`,
);
