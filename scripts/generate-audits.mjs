import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bailouts, bailoutFamilies, PINNED_OXC_VERSION, transforms } from './audit-registry.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const check = process.argv.includes('--check');
const read = path => readFile(join(root, path), 'utf8');
const json = value => `${JSON.stringify(value, null, 2)}\n`;

const transformTypes = await read('js/preflight/types.ts');
const transformBlock = transformTypes.match(
  /export interface PreflightTransforms \{([\s\S]*?)\n\}/,
)?.[1];
assert(transformBlock, 'PreflightTransforms was not found');
const publicNames = [...transformBlock.matchAll(/^\s{2}(\w+)\??:/gm)].map(match => match[1]);
assert.deepEqual(
  Object.keys(transforms),
  publicNames,
  'transform audit registry must match the public options',
);

const sourceFiles = [
  'src/preflight/transform.rs',
  'src/preflight/classes.rs',
  'src/preflight/block_scoping.rs',
  'src/preflight/destructuring.rs',
  'src/preflight/parameters.rs',
  'src/preflight/regexp.rs',
  'js/runtime/transform.ts',
];
const literalReasons = new Set();
const reasonLocations = new Map();
for (const path of sourceFiles) {
  const source = await read(path);
  const patterns = [
    /unsupported\(\s*["']([^"']+)["']/g,
    /(?:Err|ok_or)\(["']([^"']+)["']/g,
    /new Bailout\(["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const reason = match[1];
      literalReasons.add(reason);
      const line = source.slice(0, match.index).split('\n').length;
      const locations = reasonLocations.get(reason) ?? [];
      locations.push(`${path}:${line}`);
      reasonLocations.set(reason, locations);
    }
  }
}
const missing = [...literalReasons].filter(reason => !bailouts[reason]);
assert.deepEqual(missing, [], `unregistered bailout reasons: ${missing.join(', ')}`);

const representativeBailoutCorpus = {
  name: 'Expo router-e2e iOS Hermes-stable development',
  measurementDate: '2026-07-27',
  modules: 1284,
  completedNativeFiles: 1167,
  internalNoxcturnalBailouts: 0,
};
const consumerRoutingFrequency = {
  'flow-requires-parser-adapter': 3,
  'worklets-candidate': 1,
  'react-native-codegen': 79,
  'unsupported-source-extension': 5,
  'non-module-input': 4,
};

const transformOwnership = {
  schemaVersion: 1,
  generatedBy: 'pnpm audit:generate',
  pinnedOxcVersion: PINNED_OXC_VERSION,
  newestPublishedOxcVersionChecked: PINNED_OXC_VERSION,
  newestVersionCheckCommand: 'cargo search oxc_transformer --limit 3',
  transforms: Object.entries(transforms).map(([name, entry]) => ({
    name,
    expoProfile: 'consumer-selected',
    owner: entry.owner ?? 'oxc_transformer',
    ...entry,
  })),
};
const bailoutAudit = {
  schemaVersion: 1,
  generatedBy: 'pnpm audit:generate',
  counts: {
    staticReasons: Object.keys(bailouts).length,
    parameterizedFamilies: bailoutFamilies.length,
  },
  representativeCorpus: {
    ...representativeBailoutCorpus,
    consumerRoutingFiles: Object.values(consumerRoutingFrequency).reduce(
      (total, count) => total + count,
      0,
    ),
    consumerRoutingFrequency,
    note: 'Consumer routing is counted once at the full-metro boundary. The internal registry reasons below did not occur after native work began in this graph.',
  },
  reasons: Object.entries(bailouts).map(([id, entry]) => ({
    id,
    layer: 'noxcturnal',
    sourceLocations: reasonLocations.get(id) ?? [],
    nearbyNonTriggerTest: entry.triggerTest,
    frequency: {
      observedOccurrences: 0,
      corpus: representativeBailoutCorpus.name,
      measurementDate: representativeBailoutCorpus.measurementDate,
    },
    ...entry,
  })),
  families: bailoutFamilies.map(entry => ({
    ...entry,
    frequency: {
      observedOccurrences: 0,
      corpus: representativeBailoutCorpus.name,
      measurementDate: representativeBailoutCorpus.measurementDate,
    },
  })),
};

const runtimePackagePath = require.resolve('@babel/runtime/package.json');
const runtimePackage = JSON.parse(await readFile(runtimePackagePath, 'utf8'));
const runtimeRoot = dirname(runtimePackagePath);
const inlineBundles = JSON.parse(await read('audit/inline-helper-bundles.json'));
const helperNames = [
  'awaitAsyncGenerator',
  'asyncGeneratorDelegate',
  'asyncIterator',
  'asyncToGenerator',
  'objectSpread2',
  'wrapAsyncGenerator',
  'extends',
  'objectDestructuringEmpty',
  'objectWithoutProperties',
  'toPropertyKey',
  'defineProperty',
  'classPrivateFieldInitSpec',
  'classPrivateMethodInitSpec',
  'classPrivateFieldGet2',
  'classPrivateFieldSet2',
  'assertClassBrand',
  'toSetter',
  'classPrivateFieldLooseKey',
  'classPrivateFieldLooseBase',
  'superPropGet',
  'superPropSet',
  'readOnlyError',
  'writeOnlyError',
  'checkInRHS',
  'usingCtx',
  'taggedTemplateLiteral',
];
for (const bundle of Object.values(inlineBundles.bundles)) {
  for (const helper of bundle.helpers) {
    if (!helperNames.includes(helper)) helperNames.push(helper);
  }
}
const helperEntries = [];
for (const name of helperNames) {
  const source = await readFile(join(runtimeRoot, 'helpers', `${name}.js`), 'utf8');
  const dependencies = [...source.matchAll(/require\(["']\.\/([^"']+)["']\)/g)].map(
    match => match[1],
  );
  const matchingInlineBundles = Object.entries(inlineBundles.bundles).filter(([, bundle]) =>
    bundle.helpers.includes(name),
  );
  helperEntries.push({
    name,
    runtimeVersion: runtimePackage.version,
    runtimeImportPath: `@babel/runtime/helpers/${name}`,
    moduleFormat: 'commonjs',
    runtimeSourceHash: `sha256-${createHash('sha256').update(source).digest('hex')}`,
    inlineSources: matchingInlineBundles.map(([bundle, value]) => ({
      bundle,
      hash: value.hash,
    })),
    inlineGenerationStatus:
      matchingInlineBundles.length > 0 ? 'generated-from-runtime-module' : 'typed-unsupported',
    dependencies,
  });
}
const helperProvenance = {
  schemaVersion: 1,
  generatedBy: 'pnpm audit:generate',
  runtimePackage: '@babel/runtime',
  runtimeVersion: runtimePackage.version,
  helpers: helperEntries,
};

const performance = {
  schemaVersion: 1,
  generatedBy: 'pnpm audit:generate',
  machine: {
    cpu: 'Apple M5 Pro',
    architecture: 'aarch64-apple-darwin',
    operatingSystem: 'macOS 26.5.2',
    powerState: 'uncontrolled',
  },
  build: {
    profile: 'release',
    rust: '1.96.1 (31fca3adb 2026-06-26)',
    node: '22.23.1',
    pnpm: '10.12.1',
    oxc: PINNED_OXC_VERSION,
    noxcturnalCommit: '2df41eb354d701521332cab3e3f5867604eb2888',
    expoCommit: 'f68c8e4f8b6622b2a460578081f9df298ac6fd0b',
    workingTree: 'dirty-plan-implementation',
  },
  measurementRun: {
    command: 'pnpm benchmark',
    date: '2026-07-27',
    warmup: 'Vitest bench default warmup',
  },
  baseline: {
    source: 'PLAN_NATIVE_VERIFICATION_OXC_DEDUPLICATION_AND_PERFORMANCE.md',
    fullNativeWorkerMeanMsPerFile: 4.1,
    completeTransformMeanMsPerFile: 4.2,
  },
  routerE2eProfile: {
    command:
      'NOXCTURNAL_DEBUG_PERFORMANCE=1 LOG_EVENTS=<jsonl> expo start --clear --max-workers 6; iOS Hermes-stable router-e2e bundle request',
    date: '2026-07-27',
    modules: 1284,
    outputBytes: 4743827,
    completedNativeFiles: 1167,
    fullNativeMeanMsPerFile: 1.7312,
    fullNativeMedianMs: 0.9499,
    fullNativeP75Ms: 1.7228,
    fullNativeP95Ms: 4.7275,
    fullNativeP99Ms: 14.3369,
    completeTransformMeanMsPerFile: 1.845,
    completeTransformMedianMs: 1.0401,
    completeTransformP95Ms: 4.8593,
    internalMeanMsPerFile: 1.5367,
    internalMedianMs: 0.8244,
    upTo50KiBInternalP95Ms: 4.3291,
    earlyRejectedMedianMs: 0.0146,
    discardedFallbackWorkMs: 9.5494,
    discardedFallbackWorkPercent: 0.2766,
    earlyRoutingMeanMs: 0.0667,
    pipelineSetupMeanMs: 0.1025,
    phasePreparationMeanMs: 0.0632,
    nativeParsesMean: 3.0437,
    nativeSemanticBuildsMean: 1.4696,
    nativeAstTraversalsMean: 5.5638,
    nativeRendersMean: 0.9409,
    nativeCrossingsMean: 17.3385,
    nativeWorkCrossingsMean: 16.0488,
    nativeInstrumentationCrossingsMean: 1.2896,
    initializationAndHelpers: {
      measurementDate: '2026-07-27',
      completedNativeFiles: 1167,
      outputBytes: 4743799,
      nativeInitialization: {
        aggregateMs: 30.8483,
        meanMs: 0.026434,
        medianMs: 0.000458,
        p95Ms: 0.00075,
        maximumMs: 5.446708,
        note: 'Maximums are the first load in each worker; median and p95 represent cached loader calls.',
      },
      helperDiscovery: {
        aggregateMs: 1.7443,
        meanMs: 0.001495,
        medianMs: 0.000792,
        p95Ms: 0.003333,
        maximumMs: 0.214083,
      },
      helperMaterialization: {
        aggregateMs: 0.3397,
        meanMs: 0.000291,
        medianMs: 0.00025,
        p95Ms: 0.000709,
        maximumMs: 0.00775,
      },
      dependencyAndWrapping: {
        dependencyCollection: {
          aggregateMs: 252.064,
          meanMs: 0.215993,
          medianMs: 0.120958,
          p95Ms: 0.52225,
          beforeDependencyKeyCacheAggregateMs: 302.465,
          beforeDependencyKeyCacheMedianMs: 0.146291,
          beforeNativeCallFactsAggregateMs: 311.812,
          beforeNativeCallFactsMedianMs: 0.159417,
          note: 'The timer spans the combined CommonJS/ESM dependency plugin work in the fused module phase.',
        },
        moduleWrapping: {
          aggregateMs: 2.168,
          meanMs: 0.001858,
          medianMs: 0.001459,
          p95Ms: 0.002625,
          maximumMs: 0.05425,
        },
        dependencyKeyCache:
          'Immutable SHA-1 results are cached process-wide by exact Metro dependency key; the graph retained 1,284 modules and 4,743,799 output bytes.',
        nativeCallFacts:
          'Static call paths and root globality now arrive in the existing routed CallExpression record, eliminating dependency-plugin callee-child fetches and scope facades. Consecutive clean-cache bundles were byte-identical.',
      },
      correctedCounters: {
        nativeParsesMean: 3.0437,
        nativeSemanticBuildsMean: 1.4696,
        nativeAstTraversalsMean: 5.5638,
      },
    },
    nativeStageDecomposition: {
      measurementDate: '2026-07-27',
      completedNativeFiles: 1167,
      parsing: {
        aggregateMs: 44.93,
        meanMs: 0.0385,
        medianMs: 0.015834,
        p95Ms: 0.092708,
      },
      semanticConstruction: {
        aggregateMs: 24.489,
        meanMs: 0.020984,
        medianMs: 0.008541,
        p95Ms: 0.051375,
      },
      customRewrites: {
        aggregateMs: 34.34,
        meanMs: 0.029426,
        medianMs: 0.010167,
        p95Ms: 0.07425,
      },
      fusedOxcTransformer: {
        aggregateMs: 9.507,
        meanMs: 0.008146,
        medianMs: 0.006375,
        p95Ms: 0.019541,
      },
      metroOptimization: {
        aggregateMs: 0.063,
        meanMs: 0.000054,
        medianMs: 0.000042,
        p95Ms: 0.000167,
      },
      codegenAndMap: {
        aggregateMs: 28.947,
        meanMs: 0.024804,
        medianMs: 0.014167,
        p95Ms: 0.062959,
      },
      note: 'Fresh six-worker cold-cache graph after adding debug-only native stage clocks. Custom rewrite timing includes parser and semantic work performed inside rewrite layers, so these values are not disjoint and must not be summed. Residual native boundary time covers validation, detectors, helper/source handling, and N-API transfer.',
    },
    nativeCrossingOperations: {
      queryBindings: 2023,
      routedBatches: 1928,
      nodeSummaries: 1679,
      childPrefetches: 1528,
      sessionsCreated: 1505,
      instrumentationSessionCounters: 1505,
      sessionsClosed: 1505,
      preflightTransforms: 1409,
      functionMapsTaken: 1167,
      globalQueryBatches: 1167,
      bindingIndexes: 1130,
      decodedCommits: 1044,
      scopeParentTables: 1013,
      decodedMapCompositions: 994,
      inputMapCompositions: 464,
      encodedCommits: 173,
    },
    javascriptBatchesMean: 1.3213,
    allocationCounters: {
      pathFacades: 372733,
      nodeFacades: 189333,
      snapshots: 0,
      scopeFacades: 16432,
      routedPayloadBytes: 6045732,
      utf8SlabBytes: 774696,
      renderedBytes: 11368333,
      mappingSegments: 622211,
    },
    nativeRetainedBytes: {
      meanPeakPerFile: 67101.4,
      p95PeakPerFile: 171312,
      maximumPeakPerFile: 9825125,
    },
    processMemoryObserved: {
      maximumRssBytes: 998277120,
      maximumHeapUsedBytes: 97521456,
      sampling: 'transform start, native phase completion, retained-session open, transform end',
    },
    coldRuns: [
      { workers: 4, metroBundleMs: 1006, requestMs: 1337.858 },
      { workers: 9, metroBundleMs: 924, requestMs: 1205.374 },
      { workers: 6, metroBundleMs: 945, requestMs: 1239.889 },
      { workers: 6, metroBundleMs: 948, requestMs: 1225.874 },
      { workers: 9, metroBundleMs: 1034, requestMs: 1335.002 },
      { workers: 4, metroBundleMs: 984, requestMs: 1266.794 },
    ],
    forcedBabelExactFileSet: {
      command:
        'E2E_FORCE_BABEL=1 LOG_EVENTS=<jsonl> expo start --clear --max-workers 6; identical iOS Hermes-stable router-e2e request',
      nativeCompletedFilenameSet: 1167,
      forcedBabelMatchedFilenames: 1167,
      missingFilenames: 0,
      nativeAttempt: {
        aggregateMs: 2058.734,
        meanMs: 1.764125,
        medianMs: 0.923708,
        p75Ms: 1.714167,
        p95Ms: 5.234417,
        p99Ms: 12.304792,
        confidence95Ms: 0.246034,
      },
      forcedBabelTransform: {
        aggregateMs: 5030.664,
        meanMs: 4.310766,
        medianMs: 2.077792,
        p75Ms: 3.412042,
        p95Ms: 10.257541,
        p99Ms: 43.709625,
        confidence95Ms: 0.963975,
      },
      sizeNormalizedMsPerKiB: {
        nativeMean: 1.768283,
        nativeMedian: 0.849325,
        nativeP95: 4.913618,
        forcedBabelMean: 3.562064,
        forcedBabelMedian: 1.564361,
        forcedBabelP95: 8.485905,
      },
      nativeGraph: {
        modules: 1284,
        outputBytes: 4743799,
        metroBundleMs: 996,
        requestMs: 1011.018,
      },
      forcedBabelGraph: {
        modules: 1295,
        outputBytes: 5869024,
        metroBundleMs: 2043,
        requestMs: 2054.138,
      },
      note: 'Per-file comparison uses exactly the 1,167 filenames completed by Noxcturnal. The graph totals are reported separately because forced Babel discovers 11 additional modules and emits a larger development bundle.',
    },
    retainedBabelFallback: {
      files: 89,
      aggregateMs: 812.928,
      meanMs: 9.134017,
      medianMs: 2.563375,
      p75Ms: 5.415875,
      p95Ms: 74.823,
      p99Ms: 93.886417,
      confidence95Ms: 4.294824,
      primaryReason:
        '79 React Native Codegen files; remaining files cover Flow adapter, Worklets, and application/configuration boundaries',
    },
    note: 'Cold-cache debug decomposition plus alternating uninstrumented 4/9/6/6/9/4-worker runs. Every run produced the same 1,284 modules and output bytes. Instrumentation overhead remains excluded from the uninstrumented bundle-time samples.',
  },
  profileMatrix: {
    command:
      'NOXCTURNAL_DEBUG_PERFORMANCE=1 expo start --clear --max-workers 6; option-distinct router-e2e bundle requests',
    hermesStableIosDevelopment: {
      completedNativeFiles: 1167,
      internalMeanMsPerFile: 1.5472,
      internalMedianMs: 0.8037,
      internalP95Ms: 4.3786,
      nativeParsesMean: 3.0437,
      nativeSemanticBuildsMean: 1.4696,
      nativeAstTraversalsMean: 5.5638,
      nativeWorkCrossingsMean: 16.0488,
    },
    legacyIosDevelopment: {
      completedNativeFiles: 1190,
      internalMeanMsPerFile: 1.3848,
      internalMedianMs: 0.8937,
      internalP95Ms: 3.2683,
      nativeParsesMean: 6.621,
      nativeSemanticBuildsMean: 5.5807,
      nativeAstTraversalsMean: 13.205,
      nativeWorkCrossingsMean: 15.9874,
      beforeSyntaxPrerequisites: {
        nativeParsesMean: 8.2412,
        nativeSemanticBuildsMean: 7.2008,
        nativeAstTraversalsMean: 17.7294,
      },
    },
    webClientDevelopment: {
      completedNativeFiles: 844,
      internalMeanMsPerFile: 0.902,
      internalMedianMs: 0.65,
      internalP95Ms: 1.684,
    },
    webNodeProduction: {
      completedNativeFiles: 664,
      internalMeanMsPerFile: 1.009,
      internalMedianMs: 0.57,
      internalP95Ms: 1.654,
    },
    reactServerProduction: {
      completedNativeFilesBeforeDiagnostic: 513,
      status: 'expected restricted React API diagnostic in expo-log-box; not a throughput sample',
    },
    note: 'Profiles use distinct transform options in one clean Metro process. The React Server request intentionally preserves and reports the existing restricted-API diagnostic instead of weakening correctness to complete the graph.',
  },
  anonymousFileCohorts: [
    {
      category: 'application',
      sizeBucket: 'up-to-1-kib',
      files: 10,
      meanMs: 0.9111,
      medianMs: 0.6325,
      p95Ms: 2.0905,
    },
    {
      category: 'dependency',
      sizeBucket: 'up-to-1-kib',
      files: 76,
      meanMs: 0.4582,
      medianMs: 0.3742,
      p95Ms: 1.0134,
    },
    {
      category: 'dependency',
      sizeBucket: '1-to-10-kib',
      files: 84,
      meanMs: 0.9405,
      medianMs: 0.6953,
      p95Ms: 2.4676,
    },
    {
      category: 'dependency',
      sizeBucket: '10-to-50-kib',
      files: 16,
      meanMs: 3.8544,
      medianMs: 2.4581,
      p95Ms: 24.4847,
    },
    {
      category: 'react-native',
      sizeBucket: 'up-to-1-kib',
      files: 222,
      meanMs: 1.1623,
      medianMs: 0.9214,
      p95Ms: 1.9992,
    },
    {
      category: 'react-native',
      sizeBucket: '1-to-10-kib',
      files: 211,
      meanMs: 2.8947,
      medianMs: 2.2279,
      p95Ms: 7.5165,
    },
    {
      category: 'react-native',
      sizeBucket: '10-to-50-kib',
      files: 14,
      meanMs: 9.3167,
      medianMs: 9.066,
      p95Ms: 14.6196,
    },
    {
      category: 'workspace',
      sizeBucket: 'up-to-1-kib',
      files: 187,
      meanMs: 0.4836,
      medianMs: 0.3765,
      p95Ms: 0.8941,
    },
    {
      category: 'workspace',
      sizeBucket: '1-to-10-kib',
      files: 312,
      meanMs: 0.9247,
      medianMs: 0.698,
      p95Ms: 1.7253,
    },
    {
      category: 'workspace',
      sizeBucket: '10-to-50-kib',
      files: 32,
      meanMs: 2.0757,
      medianMs: 1.8602,
      p95Ms: 3.5612,
    },
  ],
  thresholds: {
    fullNativeWorkerMeanMsPerFile: 2.5,
    completeTransformMeanMsPerFile: 3,
    ordinaryMedianMs: 1.5,
    upTo50KiBP95Ms: 5,
    earlyRejectedMedianMs: 0.1,
    discardedFallbackWorkPercent: 1,
  },
  optimizerComparison: {
    command:
      'NOX_OPTIMIZER_SAMPLES=50 NOX_OPTIMIZER_WARMUPS=10 pnpm benchmark:optimizer-comparison',
    design:
      '50 alternating-order samples after 10 warmups; 95% confidence interval is 1.96 times the standard error',
    oxcCompressorDisposition:
      'not benchmarked because Oxc 0.141 Compressor is a general minifier, not a semantically equivalent implementation of Metro constant folding plus conservative function-only DCE',
    representative500: [
      {
        name: 'native fused',
        meanMs: 0.586,
        medianMs: 0.583,
        p95Ms: 0.626,
        confidence95Ms: 0.007,
        outputBytes: 18780,
      },
      {
        name: 'native constant folding only',
        meanMs: 0.572,
        confidence95Ms: 0.008,
      },
      {
        name: 'native DCE only',
        meanMs: 0.706,
        confidence95Ms: 0.007,
      },
      {
        name: 'native no-optimization control',
        meanMs: 0.432,
        confidence95Ms: 0.029,
        outputBytes: 42449,
      },
      {
        name: 'Babel Metro optimizer',
        meanMs: 29.418,
        confidence95Ms: 0.749,
      },
      {
        name: 'Babel Metro separate AST pass',
        meanMs: 33.751,
        medianMs: 33.255,
        p95Ms: 40.412,
        confidence95Ms: 0.752,
        outputBytes: 18779,
      },
      {
        name: 'Babel no-optimization control',
        meanMs: 14.509,
        confidence95Ms: 0.573,
        outputBytes: 53449,
      },
      {
        name: 'Babel Metro optimizer with source map',
        meanMs: 33.023,
        confidence95Ms: 0.771,
      },
    ],
    adversarialAndSafety: [
      {
        workload: '500-function dead chain',
        nativeFusedMeanMs: 0.19,
        babelMetroSeparateAstMeanMs: 701.863,
        babelNoOptimizationMeanMs: 4.079,
      },
      {
        workload: '500 unsafe side-effect expressions',
        nativeFusedMeanMs: 0.64,
        babelMetroSeparateAstMeanMs: 21.597,
        babelNoOptimizationMeanMs: 12.152,
      },
    ],
    assertions: [
      'constant-folding-only retains dead functions and folds arithmetic',
      'DCE-only removes dead functions and retains unfused arithmetic',
      'all native modes preserve unsafe side-effect calls',
      'output byte counts are recorded for every measured implementation',
    ],
  },
  classScalingComparison: {
    command: 'NOX_CLASS_SAMPLES=50 NOX_CLASS_WARMUPS=10 pnpm benchmark:class-scaling',
    design:
      '50 alternating-order samples after 10 warmups; every workload contains exactly 400 similarly shaped classes while only the selected private-feature count changes',
    pinnedOxcDisposition:
      'Oxc 0.141 has no public-to-ES5 class transform, and its broad class-properties path is not semantically valid for the focused mixed private-feature contract; transform-ownership.json records both decisions.',
    results: [
      {
        selectedClasses: 0,
        totalClasses: 400,
        sourceBytes: 64069,
        outputBytes: 76870,
        meanMs: 1.26298,
        medianMs: 1.228583,
        p95Ms: 1.557958,
        confidence95Ms: 0.039517,
      },
      {
        selectedClasses: 25,
        totalClasses: 400,
        sourceBytes: 63719,
        outputBytes: 91007,
        meanMs: 2.872859,
        medianMs: 2.80775,
        p95Ms: 3.188708,
        confidence95Ms: 0.058126,
        incrementalUsPerSelectedClass: 64.395168,
      },
      {
        selectedClasses: 100,
        totalClasses: 400,
        sourceBytes: 62669,
        outputBytes: 131282,
        meanMs: 6.110152,
        medianMs: 6.021375,
        p95Ms: 6.770333,
        confidence95Ms: 0.118907,
        incrementalUsPerSelectedClass: 48.471725,
      },
      {
        selectedClasses: 400,
        totalClasses: 400,
        sourceBytes: 58469,
        outputBytes: 294182,
        meanMs: 20.341827,
        medianMs: 20.232208,
        p95Ms: 21.55925,
        confidence95Ms: 0.229738,
        incrementalUsPerSelectedClass: 47.697117,
      },
    ],
  },
  coldStartComparison: {
    command: 'NOX_COLD_PROCESS_SAMPLES=20 NOX_COLD_HOT_ITERATIONS=30 pnpm benchmark:cold-start',
    design:
      '20 process-isolated native/Babel pairs in alternating order; each child reports module load, first transform, and the mean of 30 hot transforms',
    native: {
      processWall: {
        meanMs: 42.619,
        medianMs: 42.578,
        p75Ms: 43.545,
        p95Ms: 45.048,
        p99Ms: 45.048,
        confidence95Ms: 0.558,
      },
      moduleLoad: {
        meanMs: 7.933,
        medianMs: 7.853,
        p75Ms: 8.021,
        p95Ms: 9.084,
        p99Ms: 9.084,
        confidence95Ms: 0.15,
      },
      firstTransform: {
        meanMs: 0.934,
        medianMs: 0.916,
        p75Ms: 0.966,
        p95Ms: 1.063,
        p99Ms: 1.063,
        confidence95Ms: 0.02,
      },
      hotTransform: {
        meanMs: 0.264,
        medianMs: 0.264,
        p75Ms: 0.267,
        p95Ms: 0.278,
        p99Ms: 0.278,
        confidence95Ms: 0.002,
      },
      outputBytes: 7380,
    },
    babel: {
      processWall: {
        meanMs: 489.446,
        medianMs: 485.24,
        p75Ms: 497.549,
        p95Ms: 520.786,
        p99Ms: 520.786,
        confidence95Ms: 5.588,
      },
      moduleLoad: {
        meanMs: 28.377,
        medianMs: 28.509,
        p75Ms: 29.189,
        p95Ms: 30.08,
        p99Ms: 30.08,
        confidence95Ms: 0.367,
      },
      firstTransform: {
        meanMs: 75.062,
        medianMs: 74.577,
        p75Ms: 76.533,
        p95Ms: 77.8,
        p99Ms: 77.8,
        confidence95Ms: 0.657,
      },
      hotTransform: {
        meanMs: 11.876,
        medianMs: 11.761,
        p75Ms: 12.027,
        p95Ms: 12.867,
        p99Ms: 12.867,
        confidence95Ms: 0.177,
      },
      outputBytes: 7379,
    },
  },
  measurements: [
    {
      name: 'fused native Metro constant folding and DCE',
      meanMs: 0.5677,
      p75Ms: 0.5747,
      p99Ms: 0.6393,
      samples: 881,
      relativeMarginOfErrorPercent: 0.98,
    },
    {
      name: '500-function adversarial DCE chain',
      meanMs: 0.1791,
      p75Ms: 0.1823,
      p99Ms: 0.2184,
      samples: 2792,
      relativeMarginOfErrorPercent: 0.21,
      previousMeanMs: 8.4916,
      improvementFactor: 47.41,
    },
    {
      name: '500 native legacy classes',
      meanMs: 7.3412,
      p75Ms: 7.4115,
      p99Ms: 8.2666,
      samples: 69,
      relativeMarginOfErrorPercent: 0.68,
    },
    {
      name: '200 focused modern private-feature classes',
      meanMs: 7.3857,
      p75Ms: 7.5158,
      p99Ms: 8.2793,
      samples: 68,
      relativeMarginOfErrorPercent: 1,
      beforeSharedHelperMeanMs: 10.6749,
      improvementPercent: 30.8,
      note: 'Complete-path measurement with inline helpers shared by sibling classes in each rewrite layer. The pre-deduplication complete path was 10.6749 ms; the earlier 7.2482 ms figure measured a late helper-version bailout.',
    },
    {
      name: 'legacy syntax no-op discovery',
      meanMs: 0.4931,
      p75Ms: 0.5035,
      p99Ms: 0.5325,
      samples: 1015,
      relativeMarginOfErrorPercent: 0.22,
    },
    {
      name: '200 non-Hermes legacy modules fused language pass',
      meanMs: 13.3735,
      p75Ms: 13.6629,
      p99Ms: 14.7022,
      samples: 38,
      relativeMarginOfErrorPercent: 1.09,
      meanMsPerModule: 0.066868,
      note: 'Corrected corpus measurement transforms 200 independent modules and asserts every result completes; the previous concatenated workload measured a late follow-up-budget bailout.',
    },
    {
      name: '200 production app TypeScript JSX components',
      meanMs: 0.2473,
      p75Ms: 0.251,
      p99Ms: 0.3471,
      samples: 2023,
      relativeMarginOfErrorPercent: 0.46,
    },
    {
      name: '200 development React Refresh components',
      meanMs: 0.2752,
      p75Ms: 0.2796,
      p99Ms: 0.3711,
      samples: 1817,
      relativeMarginOfErrorPercent: 0.43,
    },
  ],
  transformFamilyCohorts: {
    command: 'pnpm benchmark',
    fixtureCount: 27,
    completedTransformFamilies: 24,
    expectedCompatibilityBoundaries: [
      'regexpLookBehind',
      'regexpMatchIndices',
      'regexpUnicodeSets',
    ],
    note: 'Each cohort executes the authoritative owned-syntax fixture for every public native transform. Retained compatibility boundaries must reject with their documented bailout; every other family must complete.',
    cohorts: {
      small: {
        aggregateMeanMs: 0.339,
        p75Ms: 0.3378,
        p99Ms: 0.4658,
        samples: 1476,
        relativeMarginOfErrorPercent: 0.64,
      },
      medium8KiB: {
        aggregateMeanMs: 2.7496,
        p75Ms: 2.7851,
        p99Ms: 3.2837,
        samples: 182,
        relativeMarginOfErrorPercent: 0.75,
      },
      large100KiB: {
        aggregateMeanMs: 31.2916,
        p75Ms: 31.4155,
        p99Ms: 32.0893,
        samples: 17,
        relativeMarginOfErrorPercent: 0.53,
      },
      adversarialLexicalTriggers: {
        aggregateMeanMs: 0.3665,
        p75Ms: 0.3634,
        p99Ms: 0.5117,
        samples: 1365,
        relativeMarginOfErrorPercent: 0.79,
      },
    },
  },
  counters: {
    nativeInitialization:
      'transform:noxcturnal:performance.nativeInitializationMs (loadNoxcturnal isolated from early routing and pipeline setup)',
    helperDiscovery:
      'metadata.performance.nativeHelperDiscoveryMs (Oxc and custom helper request discovery)',
    helperMaterialization:
      'metadata.performance.nativeHelperMaterializationMs (runtime validation or generated inline graph selection, renaming, and prefix materialization)',
    dependencyCollection:
      'transform:noxcturnal:performance.nativeDependencyCollectionMs (combined native CommonJS/ESM dependency phase)',
    moduleWrapping:
      'transform:noxcturnal:performance.nativeModuleWrappingMs (__d parameter and boundary edit construction)',
    customNativeRewrites:
      'metadata.performance.nativeCustomRewriteMs (focused custom source rewrites before the shared Oxc AST)',
    oxcTransform:
      'metadata.performance.nativeOxcTransformMs (the fused pinned-Oxc Transformer invocation)',
    nativeOptimization:
      'metadata.performance.nativeOptimizationMs (Metro-compatible constant folding and DCE)',
    nativeCodegenAndMap:
      'metadata.performance.nativeCodegenAndMapMs (final Oxc printing, decoded-map extraction, and rewrite-layer composition)',
    parseTime:
      'metadata.performance.nativeParseMs (all rewrite-layer and final Oxc parser invocations)',
    semanticBuildTime:
      'metadata.performance.nativeSemanticBuildMs (all rewrite-layer, final, and optimizer semantic graph construction)',
    parses: 'metadata.performance.nativeParses',
    semanticBuilds: 'metadata.performance.nativeSemanticBuilds',
    traversals: 'metadata.performance.nativeAstTraversals',
    allocations:
      'metadata.performance pathFacades/nodeFacades/snapshots/scopeFacades plus routed payload, UTF-8 slab, rendered bytes, and retained native bytes',
    peakRssBytes:
      'metadata.performance.processRssPeakObservedBytes (sampled observed peak; macro maximum recorded in routerE2eProfile)',
    renders: 'metadata.performance.nativeRenders',
    javascriptCrossings:
      'metadata.performance.nativeCrossings, split into nativeWorkCrossings and nativeInstrumentationCrossings with nativeCrossingOperations attribution',
    javascriptBatches: 'metadata.performance.javascriptBatches',
    note: 'Counters and memory sampling are enabled only by debugPerformance. RSS is a sampled process-wide observed peak, not an operating-system high-water mark.',
  },
};

const outputs = new Map([
  ['audit/transform-ownership.json', json(transformOwnership)],
  ['audit/bailouts.json', json(bailoutAudit)],
  ['audit/helper-provenance.json', json(helperProvenance)],
  ['audit/performance.json', json(performance)],
]);
await mkdir(join(root, 'audit'), { recursive: true });
for (const [path, content] of outputs) {
  if (check) {
    assert.equal(await read(path), content, `${path} is stale; run pnpm audit:generate`);
  } else {
    await writeFile(join(root, path), content);
  }
}
