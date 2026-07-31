import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'vitest';

import { defineNativePipeline, registerParserAdapter, transform } from '../../js/index';
import { native, nativeFlowErasureBuilt } from '../../js/native/binding';
import type { ParserAdapter } from '../../js/types';

const corpus = process.env.FLOW_CORPUS;
const minimumCoverage = Number(process.env.FLOW_MIN_COVERAGE ?? '0');
const adapterSpecifier = process.env.FLOW_ADAPTER;
const integration = corpus != null && nativeFlowErasureBuilt() ? describe : describe.skip;

integration('Flow corpus equivalence', () => {
  test('produces valid JavaScript with sufficient corpus coverage', async () => {
    assert.ok(corpus);
    assert.ok(Number.isFinite(minimumCoverage), 'FLOW_MIN_COVERAGE must be numeric');

    let adapterName: string | undefined;
    let unregister: (() => void) | undefined;
    if (adapterSpecifier != null) {
      const specifier = adapterSpecifier.startsWith('.')
        ? pathToFileURL(path.resolve(adapterSpecifier)).href
        : adapterSpecifier;
      const module = await import(specifier);
      const adapter = (module.default ?? module.adapter) as ParserAdapter | undefined;
      assert.ok(adapter, `${adapterSpecifier} exports no default parser adapter`);
      unregister = registerParserAdapter(adapter);
      adapterName = adapter.name;
    }

    try {
      const pipeline = defineNativePipeline({ phases: [] });
      const files = flowFiles(corpus);
      const bailouts = new Map<string, number>();
      const divergences: Divergence[] = [];
      let erased = 0;
      let erasedBytes = 0;

      for (const { filename, source } of files) {
        const result = native.nativeFlowErase(source, filename, 'none');
        if (result.status !== 'erased') {
          const reason = result.reason ?? result.status;
          bailouts.set(reason, (bailouts.get(reason) ?? 0) + 1);
          continue;
        }

        erased += 1;
        erasedBytes += result.erasedBytes;
        const ours = canonical(result.code!, filename);
        if (ours.error != null) {
          divergences.push({
            filename,
            kind: 'erased output does not parse',
            detail: ours.error,
          });
          continue;
        }
        if (adapterName == null) continue;

        const reference = transform(source, filename, pipeline, { parserAdapter: adapterName });
        if (reference.status !== 'complete') {
          divergences.push({
            filename,
            kind: 'adapter declined',
            detail: reference.reason,
          });
          continue;
        }
        const theirs = canonical(reference.code, filename);
        if (theirs.error != null) {
          divergences.push({
            filename,
            kind: 'adapter output does not parse',
            detail: theirs.error,
          });
        } else if (ours.code !== theirs.code) {
          divergences.push({
            filename,
            kind: 'canonical forms differ',
            detail: firstDifference(ours.code!, theirs.code!),
          });
        }
      }

      const coverage = files.length === 0 ? 0 : (erased / files.length) * 100;
      console.log(
        [
          `Flow corpus: ${corpus}`,
          `Flow files: ${files.length}`,
          `Erased: ${erased} (${coverage.toFixed(1)}%)`,
          `Bytes removed: ${erasedBytes}`,
          `Reference: ${adapterName ?? 'none — parse check only'}`,
          ...[...bailouts]
            .sort((left, right) => right[1] - left[1])
            .map(([reason, count]) => `Bailed ${reason}: ${count}`),
        ].join('\n'),
      );

      assert.equal(
        divergences.length,
        0,
        divergences
          .slice(0, 10)
          .map(
            divergence =>
              `${path.relative(corpus, divergence.filename)}: ${divergence.kind}\n${divergence.detail}`,
          )
          .join('\n\n'),
      );
      assert.ok(
        coverage >= minimumCoverage,
        `coverage ${coverage.toFixed(1)}% is below the ${minimumCoverage}% floor`,
      );
    } finally {
      unregister?.();
    }
  }, 120_000);
});

type Divergence = {
  filename: string;
  kind: string;
  detail: string;
};

function flowFiles(directory: string) {
  const found: { filename: string; source: string }[] = [];
  const walk = (current: string) => {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      const filename = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) walk(filename);
      } else if (/\.(?:js|jsx)$/.test(entry.name)) {
        const source = fs.readFileSync(filename, 'utf8');
        if (source.includes('@flow')) found.push({ filename, source });
      }
    }
  };
  walk(directory);
  return found;
}

function canonical(code: string, filename: string): { code?: string; error?: string } {
  const jsxFilename = `${filename.replace(/\.[^.]+$/, '')}.jsx`;
  try {
    const result = native.nativePreflightTransform(code, jsxFilename, {
      compact: true,
      comments: false,
    });
    return result.status === 'complete' ? { code: result.code } : { error: result.reason };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function firstDifference(left: string, right: string) {
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
  const start = Math.max(0, index - 40);
  return [
    `at ${index}`,
    `erased:  …${left.slice(start, index + 60)}`,
    `adapter: …${right.slice(start, index + 60)}`,
  ].join('\n');
}
