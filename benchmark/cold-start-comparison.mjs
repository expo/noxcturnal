import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const here = dirname(fileURLToPath(import.meta.url));
const script = fileURLToPath(import.meta.url);
const expoMetroConfigRoot = resolve(
  process.env.EXPO_METRO_CONFIG_ROOT ?? join(here, '../../expo/packages/@expo/metro-config'),
);
const childMode = process.argv[2] === '--child' ? process.argv[3] : null;
const hotIterations = Number.parseInt(process.env.NOX_COLD_HOT_ITERATIONS ?? '30', 10);

const source = Array.from(
  { length: 200 },
  (_, index) =>
    `function dead${index}(){return ${index}+2*3}const live${index}=(${index}+2*3)>4?"yes":"no";sink(live${index});`,
).join('\n');

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function summarize(values) {
  const sorted = values.toSorted((left, right) => left - right);
  const meanMs = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, value) => sum + (value - meanMs) ** 2, 0) / Math.max(1, sorted.length - 1);
  return {
    samples: sorted.length,
    meanMs,
    medianMs: percentile(sorted, 0.5),
    p75Ms: percentile(sorted, 0.75),
    p95Ms: percentile(sorted, 0.95),
    p99Ms: percentile(sorted, 0.99),
    confidence95Ms: 1.96 * Math.sqrt(variance / sorted.length),
  };
}

async function runChild(mode) {
  const loadStarted = performance.now();
  let operation;
  if (mode === 'native') {
    const nox = await import(pathToFileURL(join(here, '../dist/index.js')).href);
    const pipeline = nox.defineNativePipeline({
      phases: [
        {
          name: 'metro-optimization',
          native: { optimize: { constantFolding: true, deadCodeElimination: true } },
        },
      ],
    });
    operation = () => nox.transform(source, 'benchmark.js', pipeline);
  } else {
    const requireFromExpo = createRequire(join(expoMetroConfigRoot, 'package.json'));
    const babel = requireFromExpo('@babel/core');
    const { constantFoldingPlugin } = requireFromExpo('@expo/metro/metro-transform-plugins');
    operation = () =>
      babel.transformSync(source, {
        ast: false,
        babelrc: false,
        cloneInputAst: false,
        code: true,
        comments: true,
        configFile: false,
        filename: 'benchmark.js',
        plugins: [constantFoldingPlugin],
        sourceMaps: false,
      });
  }
  const loaded = performance.now();
  const firstStarted = performance.now();
  const first = operation();
  const firstFinished = performance.now();
  const hot = [];
  for (let index = 0; index < hotIterations; index++) {
    const started = performance.now();
    operation();
    hot.push(performance.now() - started);
  }
  assert.equal(typeof first.code, 'string');
  process.stdout.write(
    `${JSON.stringify({
      mode,
      loadMs: loaded - loadStarted,
      firstTransformMs: firstFinished - firstStarted,
      hot: summarize(hot),
      outputBytes: Buffer.byteLength(first.code),
    })}\n`,
  );
}

if (childMode != null) {
  assert(childMode === 'native' || childMode === 'babel', 'invalid child mode');
  await runChild(childMode);
} else {
  const processSamples = Number.parseInt(process.env.NOX_COLD_PROCESS_SAMPLES ?? '20', 10);
  assert(
    Number.isSafeInteger(processSamples) && processSamples > 1,
    'NOX_COLD_PROCESS_SAMPLES must exceed one',
  );
  const measurements = { native: [], babel: [] };
  for (let index = 0; index < processSamples; index++) {
    const order = index % 2 === 0 ? ['native', 'babel'] : ['babel', 'native'];
    for (const mode of order) {
      const started = performance.now();
      const stdout = execFileSync(process.execPath, [script, '--child', mode], {
        encoding: 'utf8',
        env: process.env,
      });
      measurements[mode].push({
        ...JSON.parse(stdout),
        processWallMs: performance.now() - started,
      });
    }
  }
  const report = {
    schemaVersion: 1,
    processSamples,
    hotIterationsPerProcess: hotIterations,
    ordering: 'native/Babel order alternates for each process-sample pair',
    expoMetroConfigRoot,
    results: Object.fromEntries(
      Object.entries(measurements).map(([mode, rows]) => [
        mode,
        {
          processWall: summarize(rows.map(row => row.processWallMs)),
          moduleLoad: summarize(rows.map(row => row.loadMs)),
          firstTransform: summarize(rows.map(row => row.firstTransformMs)),
          hotTransform: summarize(rows.flatMap(row => row.hot.meanMs)),
          outputBytes: rows[0].outputBytes,
        },
      ]),
    ),
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
