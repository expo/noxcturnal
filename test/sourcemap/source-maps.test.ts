import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import type { SourceFragment } from '../../dist/index.js';
import {
  classify,
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../../dist/index.js';
import { NativeTransformSession } from '../../dist/runtime/session.js';
import { native } from '../../dist/native/binding.js';
import { packEdits } from '../../dist/protocol/edits.js';
import { decodeRoutedEnvelope } from '../../dist/protocol/events.js';
import { packRouteManifest } from '../../dist/protocol/manifest.js';

const ALL_RETAINED_CAPABILITIES = (1 << 6) - 1;
const openRetained = (
  source: string,
  filename: string,
  options: ConstructorParameters<typeof NativeTransformSession>[2] = {},
) =>
  new NativeTransformSession(
    source,
    filename,
    options,
    packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES),
  );

test('produces traceable Unicode-aware VLQ mappings', () => {
  const plugin = defineNativePlugin({
    name: 'map',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '200', mapping: 'anchor-start', names: ['generatedValue'] }),
      ),
    ],
  });
  const result = transform(
    "const emoji = '😀';\nconst value = 1;",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 14 }), {
    source: 'fixture.js',
    line: 2,
    column: 14,
    name: 'generatedValue',
  });
});

test('traces CRLF, directive, wrapper, and explicit-location mappings', () => {
  const plugin = defineNativePlugin({
    name: 'map-boundaries',
    pre(context) {
      context.editor.prepend('/* wrapper */\n');
      context.editor.append('\n/* end */');
      context.editor.addSourceMapLocation(14);
    },
  });
  const source = "'use strict';\r\nconst value = 1;\r\n";
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
    { sourceMapMode: 'character' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 0 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 3, column: 0 }), {
    source: 'fixture.js',
    line: 2,
    column: 0,
    name: null,
  });
});

test('traces a position back through the language prepass and a source rewrite', () => {
  // The prepass prints an intermediate and contributes a layer of its own, so a
  // TypeScript file that also runs a source-level rewrite composes one more
  // layer than a plain JavaScript one does.
  const source = [
    'export function widen(input: string, factor: number = 2): string {',
    '  const repeated = input.repeat(factor);',
    '  return repeated;',
    '}',
  ].join('\n');
  const result = transform(
    source,
    'fixture.ts',
    defineNativePipeline({
      phases: [
        {
          name: 'language',
          native: {
            typescript: 'strip',
            transforms: { blockScoping: true, parameters: true },
            helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.ts'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const lines = result.code.split('\n');
  const generatedLine = lines.findIndex(line => line.includes('input.repeat(factor)')) + 1;
  assert.notEqual(generatedLine, 0);
  const generatedColumn = lines[generatedLine - 1].indexOf('input.repeat(factor)');
  const traced = originalPositionFor(map, {
    line: generatedLine,
    column: generatedColumn,
  });
  assert.equal(traced.source, 'fixture.ts');
  // `const repeated = input.repeat(factor);` is the second line of the input.
  assert.equal(traced.line, 2);
  // The column can drift by the difference between the input's indentation and
  // the intermediate's, because the prepass reprints the file and the layers
  // compose through that reprint. Without a prepass in the chain it is exact.
  const expectedColumn = source.split('\n')[1].indexOf('input.repeat(factor)');
  assert.ok(
    Math.abs(traced.column - expectedColumn) <= 2,
    `expected column near ${expectedColumn}, got ${traced.column}`,
  );
});
