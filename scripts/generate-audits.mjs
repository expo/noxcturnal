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
  reasons: Object.entries(bailouts).map(([id, entry]) => ({
    id,
    layer: 'noxcturnal',
    sourceLocations: reasonLocations.get(id) ?? [],
    nearbyNonTriggerTest: entry.triggerTest,
    frequency: { observedOccurrences: null, corpus: null },
    ...entry,
  })),
  families: bailoutFamilies,
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
      'NOXCTURNAL_DEBUG_PERFORMANCE=1 LOG_DEBUG=transform expo start --clear; iOS Hermes bundle request',
    date: '2026-07-27',
    modules: 1284,
    outputBytes: 4735118,
    completedNativeFiles: 1166,
    fullNativeMeanMsPerFile: 3.0309,
    fullNativeMedianMs: 1.8383,
    fullNativeP75Ms: 2.8553,
    fullNativeP95Ms: 8.946,
    fullNativeP99Ms: 19.0283,
    completeTransformMeanMsPerFile: 3.1994,
    internalMeanMsPerFile: 1.883,
    internalMedianMs: 1.2972,
    upTo50KiBInternalP95Ms: 3.7195,
    earlyRoutingMeanMs: 0.0908,
    pipelineSetupMeanMs: 0.1261,
    phasePreparationMeanMs: 0.3105,
    nativeParsesMean: 3.3,
    nativeCrossingsMean: 20.592,
    javascriptBatchesMean: 2.187,
    note: 'Cold-cache debug profile after defining Expo source and Metro module/dependency phases once at module scope, supplying per-file plugin data at transform time, and safely fusing block scoping into eligible native language phases. Instrumentation overhead means this is a decomposition run, not the final uninstrumented acceptance measurement.',
  },
  thresholds: {
    fullNativeWorkerMeanMsPerFile: 2.5,
    completeTransformMeanMsPerFile: 3,
    ordinaryMedianMs: 1.5,
    upTo50KiBP95Ms: 5,
    earlyRejectedMedianMs: 0.1,
    discardedFallbackWorkPercent: 1,
  },
  measurements: [
    {
      name: 'fused native Metro constant folding and DCE',
      meanMs: 0.6068,
      p75Ms: 0.6157,
      p99Ms: 0.8098,
      samples: 824,
      relativeMarginOfErrorPercent: 0.65,
    },
    {
      name: '500 native legacy classes',
      meanMs: 8.0014,
      p75Ms: 8.1798,
      p99Ms: 9.0571,
      samples: 63,
      relativeMarginOfErrorPercent: 1.03,
    },
    {
      name: '200 focused modern private-feature classes',
      meanMs: 7.3241,
      p75Ms: 7.4362,
      p99Ms: 7.9703,
      samples: 69,
      relativeMarginOfErrorPercent: 0.68,
    },
    {
      name: 'legacy syntax no-op discovery',
      meanMs: 0.5976,
      p75Ms: 0.6103,
      p99Ms: 0.6729,
      samples: 837,
      relativeMarginOfErrorPercent: 0.32,
    },
    {
      name: '200 non-Hermes legacy modules fused language pass',
      meanMs: 1.4879,
      p75Ms: 1.5214,
      p99Ms: 1.9718,
      samples: 337,
      relativeMarginOfErrorPercent: 1,
    },
    {
      name: '200 production app TypeScript JSX components',
      meanMs: 0.246,
      p75Ms: 0.2491,
      p99Ms: 0.3193,
      samples: 2033,
      relativeMarginOfErrorPercent: 0.4,
    },
    {
      name: '200 development React Refresh components',
      meanMs: 0.2712,
      p75Ms: 0.2749,
      p99Ms: 0.3122,
      samples: 1844,
      relativeMarginOfErrorPercent: 0.28,
    },
  ],
  counters: {
    parses: 'metadata.performance.nativeParses',
    semanticBuilds: 'metadata.performance.nativeSemanticBuilds',
    traversals: null,
    allocations: null,
    peakRssBytes: null,
    renders: 'metadata.performance.nativeRenders',
    javascriptCrossings: 'metadata.performance.nativeCrossings',
    javascriptBatches: 'metadata.performance.javascriptBatches',
    note: 'Allocation, RSS, native traversal, and native sub-stage timing instrumentation remain pending.',
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
