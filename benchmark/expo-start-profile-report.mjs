import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('usage: node benchmark/expo-start-profile-report.mjs <run.jsonl> [...]');
  process.exitCode = 1;
} else {
  const runs = inputs.map(summarize);
  const numeric = [
    'bundleWallMs',
    'transformCpuMs',
    'noxcturnalMs',
    'functionMapMs',
    'nativeParses',
    'finalFunctionMapSyntaxParses',
    'nativeSemanticBuilds',
    'nativeAstTraversals',
    'nativeRenders',
    'nativeWorkCrossings',
  ];
  const medians = Object.fromEntries(
    numeric.map(key => [key, median(runs.map(run => run[key]).filter(Number.isFinite))]),
  );
  console.log(JSON.stringify({ runs, medians }, null, 2));
}

function summarize(logPath) {
  const events = readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
  const profiles = events.filter(event => event._e === 'transform:noxcturnal:performance');
  const transforms = events.filter(event => event._e === 'transform:file');
  const phaseTotals = {};
  const phaseShapes = {};
  const fileCategories = {};
  const sizeBuckets = {};
  for (const profile of profiles) {
    add(fileCategories, profile.fileCategory, profile.totalMs);
    add(sizeBuckets, profile.sizeBucket, profile.totalMs);
    const phases = parseJson(profile.phaseExecutions, []);
    const shape = phases
      .map(phase => `${phase.name}:${phase.render ?? 'unknown'}:${phase.artifactPlan ?? 'unknown'}`)
      .join(' > ');
    phaseShapes[shape || '(no visitor phases)'] =
      (phaseShapes[shape || '(no visitor phases)'] ?? 0) + 1;
    for (const phase of phases) {
      const totals = (phaseTotals[phase.name] ??= {
        executions: 0,
        noops: 0,
        nativeTransformMs: 0,
        nativeParses: 0,
        nativeSemanticBuilds: 0,
        nativeAstTraversals: 0,
        nativeRenders: 0,
      });
      totals.executions++;
      if (phase.render === 'unchanged') totals.noops++;
      for (const key of Object.keys(totals)) {
        if (key !== 'executions' && key !== 'noops') totals[key] += phase[key] ?? 0;
      }
    }
  }
  const stem = basename(logPath, extname(logPath));
  const runNumber = stem.match(/(\d+)$/)?.[1];
  const directory = dirname(logPath);
  const bundlePath = runNumber ? join(directory, `bundle-${runNumber}.js`) : undefined;
  const serverPath = runNumber ? join(directory, `server-${runNumber}.log`) : undefined;
  const bundle = bundlePath && readable(bundlePath) ? readFileSync(bundlePath) : undefined;
  const server = serverPath && readable(serverPath) ? readFileSync(serverPath, 'utf8') : '';
  return {
    log: logPath,
    bundleWallMs: Number(server.match(/iOS Bundled ([0-9]+)ms/)?.[1]),
    transformFiles: transforms.length,
    transformCpuMs: sum(transforms, '_d'),
    profiles: profiles.length,
    noxcturnalMs: sum(profiles, 'totalMs'),
    functionMapMs: sum(profiles, 'functionMapMs'),
    nativeParses: sum(profiles, 'nativeParses'),
    finalFunctionMapSyntaxParses: sum(profiles, 'finalFunctionMapSyntaxParses'),
    nativeSemanticBuilds: sum(profiles, 'nativeSemanticBuilds'),
    nativeAstTraversals: sum(profiles, 'nativeAstTraversals'),
    nativeRenders: sum(profiles, 'nativeRenders'),
    nativeWorkCrossings: sum(profiles, 'nativeWorkCrossings'),
    bundleBytes: bundle?.byteLength,
    bundleSha256: bundle && createHash('sha256').update(bundle).digest('hex'),
    phaseTotals,
    phaseShapes,
    fileCategories,
    sizeBuckets,
    topAbsoluteOutliers: outliers(profiles, profile => profile.totalMs),
    topPerKiBOutliers: outliers(
      profiles,
      profile => profile.totalMs / Math.max(1, sourceBytes(profile) / 1024),
    ),
    timerNotes: {
      callbackMs: 'subset of dispatchMs',
      nativeDependencyCollectionMs: 'overlaps dispatchMs and callbackMs',
      nativeAndDecodeMs: 'does not overlap dispatchMs',
      functionMapMs: 'terminal structural collection; does not overlap dispatchMs',
    },
  };
}

function outliers(profiles, score) {
  return profiles
    .map(profile => ({
      file: profile.filePath ?? profile.filename ?? profile.file ?? '(unknown)',
      fileCategory: profile.fileCategory,
      sourceBytes: sourceBytes(profile),
      totalMs: profile.totalMs ?? 0,
      score: score(profile),
    }))
    .filter(outlier => Number.isFinite(outlier.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function sourceBytes(profile) {
  return profile.sourceBytes ?? profile.inputBytes ?? profile.codeBytes ?? 0;
}

function add(target, key, totalMs) {
  const value = (target[key] ??= { files: 0, totalMs: 0 });
  value.files++;
  value.totalMs += totalMs ?? 0;
}

function sum(values, key) {
  return values.reduce((total, value) => total + (value[key] ?? 0), 0);
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function parseJson(value, fallback) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback);
  } catch {
    return fallback;
  }
}

function readable(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}
