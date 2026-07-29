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

test('rejects malformed routed manifests at the native boundary', () => {
  assert.throws(
    () => native.materializeRoutedBuffer('const value = 1;', 'fixture.js', Buffer.alloc(32)),
    /invalid routed manifest magic/,
  );
  const manifest = packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        nodeType: 'Identifier',
        side: 'enter',
        order: 0,
        predicates: {},
        payloadFields: [],
      },
    ],
    false,
    false,
  );
  manifest.writeUInt32LE(1 << 15, 4);
  assert.throws(
    () => native.materializeRoutedBuffer('const value = 1;', 'fixture.js', manifest),
    /unknown routed manifest flags/,
  );

  const duplicate = packRouteManifest(
    [0, 1].map(id => ({
      id,
      pluginId: 0,
      nodeType: 'Identifier',
      side: 'enter' as const,
      // The plugin ordinal, not a route ordinal: both routes belong to plugin 0.
      order: 0,
      predicates: {},
      payloadFields: [],
    })),
    false,
    false,
  );
  duplicate.writeUInt32LE(0, 15 * 4);
  assert.throws(
    () => native.materializeRoutedBuffer('const value = 1;', 'fixture.js', duplicate),
    /duplicate compiled route id/,
  );
});

test('constructs the retained index and initial routed tape in one native parse', () => {
  const source = 'const value = source + 1; use(value);';
  const manifest = packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        nodeType: 'Identifier',
        side: 'enter',
        order: 0,
        predicates: {},
        payloadFields: ['name', 'global'],
      },
    ],
    true,
    true,
  );
  const expected = native.materializeRoutedBuffer(source, 'fixture.js', manifest);
  const session = new native.NativeIndexedSession(source, 'fixture.js', false, manifest, manifest);
  const first = session.nextRoutedPacked(manifest);
  const second = session.nextRoutedPacked(manifest);
  assert.deepEqual(first, expected);
  assert.deepEqual(second, expected);
  assert.equal(session.parseCount(), 1);
  session.close();
});

test('uses syntax-only retained materialization for structural ancestry', () => {
  const source = 'function outer(value) { return value + 1; }';
  const route = {
    id: 0,
    pluginId: 0,
    nodeType: 'Identifier',
    side: 'enter' as const,
    order: 0,
    predicates: {},
    payloadFields: ['name'],
  };
  const syntaxManifest = packRouteManifest([route], true, false);
  const semanticManifest = packRouteManifest([route], true, true);
  const syntax = new native.NativeIndexedSession(
    source,
    'fixture.js',
    false,
    syntaxManifest,
    syntaxManifest,
    true,
  );
  const semantic = new native.NativeIndexedSession(
    source,
    'fixture.js',
    false,
    semanticManifest,
    semanticManifest,
    true,
  );
  const syntaxBatch = decodeRoutedEnvelope(syntax.nextRoutedPacked(syntaxManifest));
  const semanticBatch = decodeRoutedEnvelope(semantic.nextRoutedPacked(semanticManifest));
  assert.equal(syntax.performanceCounters().semanticBuildCount, 0);
  assert.equal(syntax.performanceCounters().astTraversalCount, 1);
  assert.equal(syntax.uidPrefix(), '__');
  assert.equal(semantic.performanceCounters().semanticBuildCount, 1);
  assert.equal(semantic.performanceCounters().astTraversalCount, 2);
  assert.equal(syntaxBatch.nodeCount, semanticBatch.nodeCount);
  assert.equal(syntaxBatch.nodeRecordCount, semanticBatch.nodeRecordCount);
  const structural = (batch: ReturnType<typeof decodeRoutedEnvelope>) =>
    [...batch.parentSummaries].filter((_, index) => index % 8 < 6);
  assert.deepEqual(structural(syntaxBatch), structural(semanticBatch));
  syntax.close();
  semantic.close();
});

test('retains structural records across syntax families and UTF-16 offsets', () => {
  const fixtures = [
    ['fixture.js', "'use strict'; class Box { method(value) { return '😀' + value; } }"],
    ['fixture.jsx', 'const view = <Panel title="😀"><Child /></Panel>;'],
    [
      'fixture.ts',
      'interface Shape { value: number } class Box { constructor(readonly shape: Shape) {} }',
    ],
    ['fixture.tsx', 'const view: JSX.Element = <Panel value={1} />;'],
  ];
  for (const [filename, source] of fixtures) {
    const records: (string | number | null)[][] = [];
    const plugin = defineNativePlugin({
      name: `structure-${filename}`,
      editEffect: 'none',
      visitors: [
        defineVisitor('Identifier', { ancestry: 'parent' }, path => {
          records.push([
            path.node.id,
            path.node.type,
            path.node.start,
            path.node.end,
            path.parentPath?.node.id ?? null,
            path.sourceText(),
          ]);
        }),
      ],
    });
    const result = transform(
      source,
      filename,
      defineNativePipeline({ phases: [{ name: 'structure', plugins: [plugin] }] }),
    );
    assert.equal(result.status, 'complete');
    assert.ok(records.length > 0, filename);
    assert.equal(result.code, source, filename);
  }
});

test('retains only semantic and query sidecars declared by the compiled manifest', () => {
  const source = "const outer = 1; load('x'); function fn() { return outer + 2 }";
  const open = (capabilities: number) =>
    new native.NativeIndexedSession(
      source,
      'fixture.js',
      false,
      packRouteManifest([], false, false, capabilities),
    );
  const none = open(0);
  assert.deepEqual(none.queryBindings('outer'), []);
  assert.deepEqual(none.queryCalls('load', true, true), []);
  assert.deepEqual(none.queryConstants([3]), []);
  none.close();

  const planned = open((1 << 0) | (1 << 1) | (1 << 2));
  assert.equal(planned.queryBindings('outer').length, 1);
  assert.equal(planned.queryCalls('load', true, true).length, 1);
  assert.ok(planned.queryConstants([...Array(32).keys()]).length > 0);
  planned.close();

  const constants = new native.NativeIndexedSession(
    source,
    'fixture.js',
    false,
    packRouteManifest([], false, false, 1 << 1),
    undefined,
    true,
  );
  assert.equal(constants.performanceCounters().semanticBuildCount, 0);
  assert.ok(constants.queryConstants([...Array(32).keys()]).length > 0);
  constants.close();

  const calls = new native.NativeIndexedSession(
    source,
    'fixture.js',
    false,
    packRouteManifest([], false, false, 1 << 2),
    undefined,
    true,
  );
  assert.equal(calls.performanceCounters().semanticBuildCount, 1);
  calls.close();
});

test('validates predicate fields across every concrete alias route', () => {
  const plugin = defineNativePlugin({
    name: 'invalid-alias-predicate',
    visitors: [defineVisitor('Expression', { where: { kind: { equals: 'const' } } }, () => {})],
  });
  assert.throws(
    () =>
      transform(
        'value;',
        'fixture.js',
        defineNativePipeline({
          phases: [{ name: 'main', plugins: [plugin] }],
        }),
      ),
    /predicate field kind is not valid for/,
  );
});

test('deduplicates overlapping parts of a compiled composite visitor key', () => {
  let calls = 0;
  const plugin = defineNativePlugin({
    name: 'compiled-composite',
    visitors: [
      defineVisitor('Identifier|Expression', {}, () => {
        calls++;
      }),
    ],
  });
  transform(
    'value;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'main', plugins: [plugin] }],
    }),
  );
  assert.equal(calls, 1);
});

test('reverses overlapping compiled exit callbacks within one plugin', () => {
  const calls: string[] = [];
  const plugin = defineNativePlugin({
    name: 'compiled-exit-order',
    visitors: [
      defineVisitor(
        'Identifier',
        {},
        {
          exit() {
            calls.push('identifier');
          },
        },
      ),
      defineVisitor(
        'Expression',
        {},
        {
          exit() {
            calls.push('expression');
          },
        },
      ),
    ],
  });
  transform(
    'value;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'main', plugins: [plugin] }],
    }),
  );
  assert.deepEqual(calls, ['expression', 'identifier']);
});

test('keeps declared skip semantics on the compiled slow lane', () => {
  const calls: string[] = [];
  const plugin = defineNativePlugin({
    name: 'compiled-skip',
    visitors: [
      defineVisitor('Function', { controlFlow: ['skip'] }, path => {
        calls.push('function');
        path.skip();
      }),
      defineVisitor('Identifier', { controlFlow: ['skip'] }, () => {
        calls.push('identifier');
      }),
    ],
  });
  const result = transform(
    'function example(parameter) { return parameter; }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(calls, ['function']);
});

test('uses cached routed tapes for declared nested traversal', () => {
  const names: string[] = [];
  const nestedVisitor = [
    defineVisitor('Identifier', { fields: ['name'] }, path => {
      names.push(String(path.node.name));
    }),
  ];
  const plugin = defineNativePlugin({
    name: 'routed-nested',
    visitors: [
      defineVisitor(
        'Function',
        { controlFlow: ['nested-traverse'], nested: nestedVisitor },
        path => {
          path.traverse(nestedVisitor);
        },
      ),
    ],
  });
  const result = transform(
    'function example(parameter) { return parameter; }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(names, ['example', 'parameter', 'parameter']);
});

test('expands Function aliases to arrow functions in nested routed traversal', () => {
  const functions: string[] = [];
  const plugin = defineNativePlugin({
    name: 'nested-function-alias',
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { ancestry: 'parent', controlFlow: ['nested-traverse'] },
        path => {
          path.parentPath?.traverse([
            defineVisitor('Function', {}, fn => {
              functions.push(fn.node.type);
            }),
          ]);
        },
      ),
    ],
  });
  const result = transform(
    'for (const value of values) callbacks.push(() => value);',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(functions, ['ArrowFunctionExpression']);
});

test('exposes common scalar discriminants without child-tree transfer', () => {
  const session = openRetained('const value = { platform: 1 }; value.total += -2;', 'fixture.js');
  const events = session.nodes(['ObjectProperty', 'AssignmentExpression', 'UnaryExpression']);
  const property = events.find(event => event.type === 'ObjectProperty')!;
  assert.deepEqual(
    {
      kind: property.kind,
      computed: String(property.computed),
      method: String(property.method),
      shorthand: String(property.shorthand),
      key: property.key,
    },
    {
      kind: 'init',
      computed: 'false',
      method: 'false',
      shorthand: 'false',
      key: 'platform',
    },
  );
  assert.equal(events.find(event => event.type === 'AssignmentExpression')!.operator, '+=');
  assert.equal(events.find(event => event.type === 'UnaryExpression')!.operator, '-');
  session.close();
});

test('retains materially less native memory for narrow plans', () => {
  const source = Array.from(
    { length: 200 },
    (_, index) => `export const value${index} = source${index} + ${index};`,
  ).join('\n');
  const narrowManifest = packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        nodeType: 'Identifier',
        side: 'enter',
        order: 0,
        predicates: {},
        payloadFields: ['name'],
      },
    ],
    false,
    false,
  );
  const narrow = new NativeTransformSession(source, 'fixture.js', {}, narrowManifest);
  const broad = openRetained(source, 'fixture.js');
  assert.ok(narrow.nativeMemoryBytes < broad.nativeMemoryBytes * 0.6);
  narrow.close();
  broad.close();
});
