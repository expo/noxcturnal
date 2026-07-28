// Equivalence harness for native Flow erasure.
//
// Erasure preserves the formatting the Babel printer reformats, so the
// byte-identical corpus gate stops applying to Flow files. This replaces it.
//
// Both paths are canonicalised through the same Oxc printer — compact, comments
// off — before they are compared, so formatting, comment placement, and quote
// style are normalised away and any remaining difference is structural. That
// costs one native call per side and needs no AST library.
//
// Two checks, and the first is the one that matters even with no reference
// implementation to hand:
//
//   1. Every erased output parses and canonicalises. An erasure that produces
//      broken JavaScript fails here.
//   2. With `--adapter`, the canonical form matches what the current parser
//      adapter produces for the same file. Any divergence is a bug in the rules.
//
// It also reports the erase/bail split and the reasons behind it, which is the
// coverage counter the plan asks for, measured over a whole corpus rather than
// one bundle.
//
//   node scripts/flow-equivalence.mjs --corpus <dir>
//   node scripts/flow-equivalence.mjs --corpus <dir> --adapter ./my-adapter.mjs
//   node scripts/flow-equivalence.mjs --corpus <dir> --min-coverage 96

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { native } = await import(path.join(root, 'dist/native/binding.js'));
const { registerParserAdapter, transform, defineNativePipeline } = await import(
  path.join(root, 'dist/index.js')
);

function option(name, fallback = undefined) {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? fallback : process.argv[at + 1];
}

const corpus = option('corpus');
const adapterSpecifier = option('adapter');
const minCoverage = Number(option('min-coverage', '0'));
const showAtMost = Number(option('show', '10'));

if (corpus == null) {
  process.stderr.write(
    'usage: node scripts/flow-equivalence.mjs --corpus <dir> [--adapter <specifier>]\n' +
      '\n' +
      'The corpus is a directory of real Flow sources — a React Native checkout,\n' +
      'or an app tree. It is not vendored here because it is other projects\n' +
      'source and it is large; point this at whatever tree the numbers in\n' +
      'PLAN_NATIVE_FLOW_ERASURE.md were measured against.\n',
  );
  process.exit(2);
}

if (native.nativeFlowErase('', 'probe.js', 'none').status === 'unsupported') {
  process.stderr.write(
    'this binary was built without the `flow_parser` feature.\n' +
      'Build it with: pnpm exec napi build --platform --release --features flow_parser\n',
  );
  process.exit(2);
}

/** Every Flow file under `directory`, in a stable order. */
function flowFiles(directory) {
  const found = [];
  const walk = current => {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        walk(filename);
      } else if (/\.(?:js|jsx)$/.test(entry.name)) {
        const source = fs.readFileSync(filename, 'utf8');
        if (source.includes('@flow')) found.push({ filename, source });
      }
    }
  };
  walk(directory);
  return found;
}

/**
 * Reprints through the Oxc printer with formatting and comments normalised
 * away. Two sources that canonicalise to the same string differ only in ways
 * no runtime can observe.
 */
function canonical(code, filename) {
  // Erased output keeps its `@flow` comment, which classification reads as
  // Flow, so the parse has to be told the syntax the same way the pipeline
  // tells it: by the extension.
  const asJsx = `${filename.replace(/\.[^.]+$/, '')}.jsx`;
  try {
    const result = native.nativePreflightTransform(code, asJsx, {
      compact: true,
      comments: false,
    });
    return result.status === 'complete' ? { code: result.code } : { error: result.reason };
  } catch (error) {
    return { error: String(error.message ?? error) };
  }
}

let adapterName;
if (adapterSpecifier != null) {
  const module = await import(
    adapterSpecifier.startsWith('.') ? path.resolve(adapterSpecifier) : adapterSpecifier
  );
  const adapter = module.default ?? module.adapter;
  if (adapter == null) {
    process.stderr.write(`${adapterSpecifier} exports no default parser adapter\n`);
    process.exit(2);
  }
  registerParserAdapter(adapter);
  adapterName = adapter.name;
}

const pipeline = defineNativePipeline({ phases: [] });
const files = flowFiles(corpus);
const bails = new Map();
const divergences = [];
let erased = 0;
let erasedBytes = 0;

for (const { filename, source } of files) {
  const result = native.nativeFlowErase(source, filename, 'none');
  if (result.status !== 'erased') {
    bails.set(result.reason, (bails.get(result.reason) ?? 0) + 1);
    continue;
  }
  erased += 1;
  erasedBytes += result.erasedBytes;

  const ours = canonical(result.code, filename);
  if (ours.error != null) {
    divergences.push({ filename, kind: 'erased output does not parse', detail: ours.error });
    continue;
  }
  if (adapterName == null) continue;

  // The reference path, driven through the same entry point the pipeline uses
  // so the adapter sees exactly what it normally sees.
  const reference = transform(source, filename, pipeline, { parserAdapter: adapterName });
  if (reference.status !== 'complete') {
    divergences.push({ filename, kind: 'adapter declined', detail: reference.reason });
    continue;
  }
  const theirs = canonical(reference.code, filename);
  if (theirs.error != null) {
    divergences.push({ filename, kind: 'adapter output does not parse', detail: theirs.error });
    continue;
  }
  if (ours.code !== theirs.code) {
    divergences.push({
      filename,
      kind: 'canonical forms differ',
      detail: firstDifference(ours.code, theirs.code),
    });
  }
}

/** A short excerpt around the first differing character, for the report. */
function firstDifference(left, right) {
  let at = 0;
  while (at < left.length && at < right.length && left[at] === right[at]) at += 1;
  const from = Math.max(0, at - 40);
  return `at ${at}\n  erased:  …${left.slice(from, at + 60)}\n  adapter: …${right.slice(from, at + 60)}`;
}

const coverage = files.length === 0 ? 0 : (erased / files.length) * 100;
const lines = [
  `corpus            ${corpus}`,
  `flow files        ${files.length}`,
  `erased            ${erased} (${coverage.toFixed(1)}%)`,
  `bytes removed     ${erasedBytes}`,
  `reference         ${adapterName ?? 'none — parse check only'}`,
];
for (const [reason, count] of [...bails].sort((a, b) => b[1] - a[1])) {
  lines.push(`bailed ${String(reason).padEnd(18)} ${count}`);
}
lines.push(`divergences       ${divergences.length}`);
process.stdout.write(`${lines.join('\n')}\n`);

for (const divergence of divergences.slice(0, showAtMost)) {
  process.stdout.write(
    `\n${path.relative(corpus, divergence.filename)}\n  ${divergence.kind}\n  ${divergence.detail}\n`,
  );
}
if (divergences.length > showAtMost) {
  process.stdout.write(`\n… and ${divergences.length - showAtMost} more\n`);
}

if (divergences.length > 0) process.exit(1);
if (coverage < minCoverage) {
  process.stderr.write(`coverage ${coverage.toFixed(1)}% is below the ${minCoverage}% floor\n`);
  process.exit(1);
}
