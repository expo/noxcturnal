import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import type { SourceFragment } from '../dist/index.js';
import {
  classify,
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformError,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../dist/index.js';
import { NativeTransformSession } from '../dist/visitors.js';
import { native } from '../dist/native.js';
import { decodeRoutedEnvelope, packEdits, packRouteManifest } from '../dist/protocol.js';

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

test('loads the Noxcturnal binding and classifies parser routes', () => {
  assert.deepEqual(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');
  assert.equal(classify('fixture.js', '// @flow\nconst x: number = 1').supported, false);
});

test('rejects malformed routed string tables before decoding records', () => {
  const invalidCount = Buffer.alloc(32);
  invalidCount.writeUInt32LE(0x4e525446, 0);
  invalidCount.writeUInt32LE(1, 20);
  invalidCount.writeUInt32LE(32, 24);
  assert.throws(() => decodeRoutedEnvelope(invalidCount), /string count/);

  const invalidLength = Buffer.alloc(36);
  invalidLength.writeUInt32LE(0x4e525446, 0);
  invalidLength.writeUInt32LE(1, 20);
  invalidLength.writeUInt32LE(36, 24);
  invalidLength.writeUInt32LE(100, 32);
  assert.throws(() => decodeRoutedEnvelope(invalidLength), /string length/);

  const invalidParents = Buffer.alloc(32);
  invalidParents.writeUInt32LE(0x4e525446, 0);
  invalidParents.writeUInt32LE(32, 24);
  invalidParents.writeUInt32LE(4, 28);
  assert.throws(() => decodeRoutedEnvelope(invalidParents), /string count/);

  const empty = Buffer.alloc(32);
  empty.writeUInt32LE(0x4e525446, 0);
  empty.writeUInt32LE(32, 24);
  assert.throws(() => decodeRoutedEnvelope(empty).stringAt(0), /string id/);
});

test('keys scheduler classification and phase planning', () => {
  const pipeline = defineNativePipeline({ phases: [{ name: 'transform', plugins: [] }] });
  const js = transformClassificationCacheKey(pipeline, 'fixture.js', 'const value = 1');
  const flow = transformClassificationCacheKey(
    pipeline,
    'fixture.js',
    '// @flow\nconst value: number = 1',
  );
  assert.notEqual(js, flow);
  assert.equal(js, transformClassificationCacheKey(pipeline, 'fixture.js', 'const other = 2'));
});

test('compiles conservative phase boundaries and edit effects', () => {
  const text = defineNativePlugin({ name: 'text', editEffect: 'text-only' });
  const unknown = defineNativePlugin({ name: 'unknown' });
  const plans = compilePhasePlan(
    defineNativePipeline({
      phases: [
        { name: 'text', plugins: [text], observes: 'current-ast' },
        { name: 'original-observer', plugins: [text], observes: 'original' },
        { name: 'compiler', plugins: [unknown], observes: 'rendered-source' },
      ],
    }),
  );
  assert.equal(plans[0].editEffect, 'text-only');
  assert.equal(plans[1].canReuseAst, true);
  assert.equal(plans[2].boundaryBefore, true);
  assert.equal(plans[2].editEffect, 'whole-program');
  assert.ok(Object.isFrozen(plans));
  assert.throws(
    () =>
      compilePhasePlan(
        defineNativePipeline({
          phases: [
            {
              name: 'invalid',
              plugins: [],
              editEffect: 'sometimes' as never,
            },
          ],
        }),
      ),
    /invalid edit effect/,
  );
});

test('rejects edits that violate a none effect contract', () => {
  const plugin = defineNativePlugin({
    name: 'false-none-contract',
    editEffect: 'none',
    visitor: {
      Identifier(path) {
        path.replaceWith('changed');
      },
    },
  });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
      ),
    /declared edit effect none but emitted edits/,
  );
});

test('defers text-only rendering across phases that observe the retained AST', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'edit-text',
    prepare: () => ({ editEffect: 'text-only' }),
    visitor: {
      Identifier(path) {
        path.replaceWith('renamed');
      },
    },
  });
  const observe = defineNativePlugin({
    name: 'observe-original-ast',
    visitor: {
      Identifier(path) {
        observed = path.sourceText();
      },
    },
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [edit], observes: 'current-ast' },
        { name: 'observe', plugins: [observe], observes: 'current-ast' },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'value');
  assert.equal(result.code, 'const renamed = 1');
  const performance = result.metadata.performance as {
    reparses: number;
    nativeParses: number;
    phaseExecutions: { editEffect: string; render: string; reusedParse: boolean }[];
  };
  assert.equal(performance.reparses, 0);
  assert.equal(performance.nativeParses, 1);
  assert.deepEqual(
    performance.phaseExecutions.map(phase => [phase.editEffect, phase.render, phase.reusedParse]),
    [
      ['text-only', 'deferred', false],
      ['whole-program', 'committed', true],
    ],
  );
});

test('runs original observers against pristine source after a rendered boundary', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'rendered-edit',
    editEffect: 'whole-program',
    visitor: {
      Identifier(path) {
        path.replaceWith('renamed');
      },
    },
  });
  const observe = defineNativePlugin({
    name: 'original-observer',
    editEffect: 'none',
    visitor: {
      Identifier(path) {
        observed = path.sourceText();
      },
    },
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'render', plugins: [edit], observes: 'current-ast' },
        { name: 'original', plugins: [observe], observes: 'original' },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'value');
  assert.equal(result.code, 'const renamed = 1');
  const performance = result.metadata.performance as {
    nativeParses: number;
    phaseExecutions: { source: string; render: string; reusedParse: boolean }[];
  };
  assert.equal(performance.nativeParses, 2);
  assert.deepEqual(performance.phaseExecutions[1], {
    name: 'original',
    observes: 'original',
    editEffect: 'none',
    source: 'original',
    reusedParse: false,
    render: 'unchanged',
  });
});

test('rejects ambiguous original-source edits after rendering', () => {
  const edit = (name: string) =>
    defineNativePlugin({
      name,
      editEffect: 'whole-program',
      visitor: {
        Identifier(path) {
          path.replaceWith('renamed');
        },
      },
    });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({
          phases: [
            { name: 'render', plugins: [edit('first')] },
            { name: 'original-edit', plugins: [edit('second')], observes: 'original' },
          ],
        }),
      ),
    /edits against original source are ambiguous/,
  );
});

test('realizes an explicitly required map once and reuses it at final composition', () => {
  const edit = defineNativePlugin({
    name: 'mapped-edit',
    editEffect: 'text-only',
    visitor: {
      Identifier(path) {
        path.replaceWith({
          code: 'renamed',
          mapping: 'anchor-boundaries',
          names: ['value'],
        });
      },
    },
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'mapped',
          plugins: [edit],
          requiresRealizedMap: true,
        },
        {
          name: 'observe-rendered',
          plugins: [],
          observes: 'rendered-source',
        },
      ],
    }),
    { debugPerformance: true, sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamed = 1');
  assert.deepEqual(result.map.names, ['value']);
  const performance = result.metadata.performance as {
    mapEncodes: number;
    mappingSegments: number;
  };
  assert.equal(performance.mapEncodes, 1);
  assert.ok(performance.mappingSegments > 0);
});

test('provides direct path fields and retained snapshots', () => {
  let retained: Readonly<Record<string, unknown>> | undefined;
  const plugin = defineNativePlugin({
    name: 'snapshot',
    prepare: () => ({
      fields: { Identifier: ['name'] },
      ancestry: 'parent',
    }),
    visitor: {
      Identifier(path) {
        assert.equal(path.type, 'Identifier');
        assert.equal(path.id, path.node.id);
        assert.equal(path.start, path.node.start);
        retained = path.snapshot({ fields: ['name'], ancestry: 'parent' });
      },
    },
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
    {
      debugPerformance: true,
    },
  );
  assert.equal(result.status, 'complete');
  assert.equal(retained?.name, 'value');
  assert.ok(Object.isFrozen(retained));
  assert.ok(result.metadata.performance);
  const performance = result.metadata.performance as {
    pathFacades: number;
    nodeFacades: number;
    snapshots: number;
    scopeFacades: number;
    recordWords: number;
    utf8SlabBytes: number;
  };
  assert.equal(performance.pathFacades, 1);
  assert.equal(performance.nodeFacades, 1);
  assert.equal(performance.snapshots, 1);
  assert.equal(performance.scopeFacades, 0);
  assert.ok(performance.recordWords > 0);
  assert.ok(performance.utf8SlabBytes > 0);
});

test('generates Metro-compatible function maps natively', () => {
  const pipeline = defineNativePipeline({
    phases: [{ name: 'function-map', plugins: [] }],
  });
  const source = 'var x=1; function named(a){ return a } var inferred = function(){ return x };';
  const result = transform(source, 'fixture.js', pipeline, {
    functionMap: true,
    debugPerformance: true,
  });
  assert.equal(result.status, 'complete');
  if (result.status !== 'complete') return;
  assert.deepEqual(result.functionMap, {
    names: ['<global>', 'named', 'inferred'],
    mappings: 'AAA,SC,6BD,gBE,sBF',
  });
  const performance = result.metadata.performance as {
    nativeParses: number;
    routeDeliveries: number;
  };
  assert.equal(performance.nativeParses, 1);
  assert.equal(performance.routeDeliveries, 0);
});

test('matches Metro function naming and frame positions', () => {
  const pipeline = defineNativePipeline({
    phases: [{ name: 'function-map', plugins: [] }],
  });
  const fixtures = [
    [
      'class Foo { method(){} static make(){} get value(){return 1} }',
      {
        names: ['Foo', 'Foo#method', 'Foo.make', 'Foo#get__value'],
        mappings: 'AAA,YC,UD,CE,eF,CG,qBH',
      },
    ],
    [
      'const obj={method(){}, arrow:()=>1};',
      {
        names: ['<global>', 'obj.method', 'obj.arrow'],
        mappings: 'AAA,WC,UD,QE,KF',
      },
    ],
    [
      'useCallback(()=>1); foo(function(){}, ()=>2); export default function(){}',
      {
        names: ['<global>', '<anonymous>', 'foo$argument_0', 'foo$argument_1', 'default'],
        mappings: 'AAA,YC,KD,OE,YF,EG,KH,kBI',
      },
    ],
    [
      'const obj={ ["x"](){}, [Symbol.iterator]: function(){} }; class C { ["y"](){} }',
      {
        names: ['<global>', 'obj.x', 'obj.@@iterator', 'C', 'C#y'],
        mappings: 'AAA,YC,SD,qBE,YF,IG,UC,SD',
      },
    ],
    [
      'target.member = ()=>1; const frozen=Object.freeze(()=>2);',
      {
        names: ['<global>', 'target.member', 'frozen'],
        mappings: 'AAA,gBC,KD,6BE,KF',
      },
    ],
    [
      'fixture.run=()=>1;',
      {
        names: ['<global>', 'run'],
        mappings: 'AAA,YC,KD',
      },
    ],
    [
      'class C { field=()=>1; static make=()=>2 } const x = new Foo(()=>1);',
      {
        names: ['C', 'C#field', 'C.make', '<global>', 'Foo$argument_0'],
        mappings: 'AAA,gBC,KD,cE,KF,EG,mBC,KD',
      },
    ],
    [
      '"use strict";\r\nfunction value(){\r\n return 1;\r\n}\r\n',
      {
        names: ['<global>', 'value'],
        mappings: 'AAA;ACC;CDE',
      },
    ],
  ] as const;
  for (const [source, expected] of fixtures) {
    const result = transform(source, 'fixture.js', pipeline, { functionMap: true });
    assert.equal(result.status, 'complete');
    if (result.status === 'complete') assert.deepEqual(result.functionMap, expected);
  }
});

test('hydrates targeted snapshots once and retains exit ancestry and scope', () => {
  const snapshots: Readonly<Record<string, unknown>>[] = [];
  const plugin = defineNativePlugin({
    name: 'targeted-snapshot',
    prepare: () => ({
      ancestry: 'parent',
      semantics: ['scope'],
      fields: { Identifier: ['name'] },
    }),
    visitor: {
      Identifier: {
        enter(path) {
          snapshots.push(path.snapshot({ fields: ['name'], ancestry: 'parent' }));
        },
        exit(path) {
          snapshots.push(path.snapshot({ fields: ['name'], ancestry: 'parent' }));
        },
      },
    },
  });
  const result = transform(
    'const value = other',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
    {
      debugPerformance: true,
    },
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(
    snapshots.map(snapshot => snapshot.name),
    ['value', 'value', 'other', 'other'],
  );
  assert.ok(snapshots.every(snapshot => typeof snapshot.scopeId === 'number'));
  assert.ok(snapshots.every(Object.isFrozen));
  assert.equal((result.metadata.performance as { nativeParses: number }).nativeParses, 1);
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'transform',
              plugins: [
                defineNativePlugin({
                  name: 'invalid-snapshot',
                  visitor: {
                    Identifier(path) {
                      path.snapshot({ fields: ['notAField'] });
                    },
                  },
                }),
              ],
            },
          ],
        }),
      ),
    /unknown snapshot field/,
  );
});

test('skips native rendering when a phase produces no edits', () => {
  const plugin = defineNativePlugin({
    name: 'analysis-only',
    visitor: { Identifier() {} },
  });
  const source = 'const answer = value;';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, source);
});

test('reuses identical packed events across unchanged phases', () => {
  const plugin = (name: string) =>
    defineNativePlugin({
      name,
      visitor: { Identifier() {} },
    });
  const result = transform(
    'const answer = value;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [plugin('first')] },
        { name: 'second', plugins: [plugin('second')] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
});

test('applies exact scalar route predicates without exposing a new visitor shape', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'predicates',
    prepare() {
      return {
        where: { VariableDeclaration: { kind: { oneOf: ['let', 'const'] } } },
        controlFlow: [],
      };
    },
    visitor: {
      VariableDeclaration(path) {
        seen.push(path.sourceText().slice(0, 5));
      },
    },
  });
  const result = transform(
    'var first = 1; let second = 2; const third = 3;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(seen, ['let s', 'const']);
});

test('supports absent predicates and rejects undeclared dynamic control flow', () => {
  let absent = 0;
  const predicatePlugin = defineNativePlugin({
    name: 'absent',
    prepare: () => ({ where: { ExportNamedDeclaration: { source: { present: false } } } }),
    visitor: {
      ExportNamedDeclaration() {
        absent++;
      },
    },
  });
  transform(
    "export const local = 1; export { value } from 'module';",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [predicatePlugin] }] }),
  );
  assert.equal(absent, 1);

  const staticPlugin = defineNativePlugin({
    name: 'static',
    prepare: () => ({ controlFlow: [] }),
    visitor: {
      Identifier(path) {
        path.stop();
      },
    },
  });
  assert.throws(
    () =>
      transform(
        'const value = 1;',
        'fixture.js',
        defineNativePipeline({
          phases: [{ name: 'main', plugins: [staticPlugin] }],
        }),
      ),
    /static: undeclared control-flow capability stop/,
  );
});

test('routes static enter and exit callbacks by integer id in native order', () => {
  const calls: string[] = [];
  const plugin = (name: string) =>
    defineNativePlugin({
      name,
      prepare: () => ({ controlFlow: [] }),
      visitor: {
        Function: {
          enter(path) {
            calls.push(`${name}:enter:${path.node.type}`);
          },
          exit(path) {
            calls.push(`${name}:exit:${path.node.type}`);
          },
        },
      },
    });
  const result = transform(
    'function example() {}',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'main', plugins: [plugin('first'), plugin('second')] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(calls, [
    'first:enter:Function',
    'second:enter:Function',
    'second:exit:Function',
    'first:exit:Function',
  ]);
});

test('keeps predicate-only fields native', () => {
  let calls = 0;
  const plugin = defineNativePlugin({
    name: 'selective',
    prepare: () => ({
      controlFlow: [],
      fields: { VariableDeclaration: [] },
      where: { VariableDeclaration: { kind: { equals: 'const' } } },
    }),
    visitor: {
      VariableDeclaration(path) {
        calls++;
        assert.equal(path.node.kind, undefined);
      },
    },
  });
  const result = transform(
    'var first = 1; let second = 2; const third = 3;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(calls, 1);
});

test('keeps scalar predicates type-sensitive for false, zero, and empty strings', () => {
  const seen = { boolean: 0, number: 0, string: 0, wrongType: 0 };
  const predicatePlugin = (
    name: string,
    route: 'BooleanLiteral' | 'NumericLiteral' | 'StringLiteral',
    predicate: { equals: string | number | boolean },
    visit: () => void,
  ) =>
    defineNativePlugin({
      name,
      prepare: () => ({
        controlFlow: [],
        fields: { [route]: [] },
        where: { [route]: { value: predicate } },
      }),
      visitor: { [route]: visit },
    });
  const result = transform(
    'false; true; 0; 1; ""; "x";',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'transform',
          plugins: [
            predicatePlugin('false', 'BooleanLiteral', { equals: false }, () => seen.boolean++),
            predicatePlugin('zero', 'NumericLiteral', { equals: 0 }, () => seen.number++),
            predicatePlugin('empty', 'StringLiteral', { equals: '' }, () => seen.string++),
            predicatePlugin('typed', 'NumericLiteral', { equals: '0' }, () => seen.wrongType++),
          ],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(seen, { boolean: 1, number: 1, string: 1, wrongType: 0 });
});

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
});

test('validates predicate fields across every concrete alias route', () => {
  const plugin = defineNativePlugin({
    name: 'invalid-alias-predicate',
    prepare: () => ({
      controlFlow: [],
      where: { Expression: { kind: { equals: 'const' } } },
    }),
    visitor: { Expression() {} },
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
    prepare: () => ({ controlFlow: [] }),
    visitor: {
      'Identifier|Expression'() {
        calls++;
      },
    },
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
    prepare: () => ({ controlFlow: [] }),
    visitor: {
      Identifier: {
        exit() {
          calls.push('identifier');
        },
      },
      Expression: {
        exit() {
          calls.push('expression');
        },
      },
    },
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
    prepare: () => ({ controlFlow: ['skip'] }),
    visitor: {
      Function(path) {
        calls.push('function');
        path.skip();
      },
      Identifier() {
        calls.push('identifier');
      },
    },
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
  const nestedVisitor = {
    Identifier(path: any) {
      names.push(String(path.node.name));
    },
  };
  const plugin = defineNativePlugin({
    name: 'routed-nested',
    prepare: () => ({
      controlFlow: ['nested-traverse'],
      fields: { Identifier: ['name'] },
    }),
    visitor: {
      Function(path) {
        path.traverse(nestedVisitor);
      },
    },
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
    prepare: () => ({ ancestry: 'parent', controlFlow: ['nested-traverse'] }),
    visitor: {
      VariableDeclaration(path) {
        path.parentPath?.traverse({
          Function(fn) {
            functions.push(fn.node.type);
          },
        });
      },
    },
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

test('runs ordered phases and reparses edited code', () => {
  const observations = [];
  const replace = defineNativePlugin({
    name: 'replace-number',
    prepare: () => ({ fields: { NumericLiteral: ['value'] } }),
    visitor: {
      NumericLiteral(path) {
        if (path.node.value === 1) path.replaceWith('2');
      },
    },
  });
  const observe = defineNativePlugin({
    name: 'observe-number',
    prepare() {
      return { fields: { NumericLiteral: ['value'] }, metadataWrites: ['observed'] };
    },
    visitor: {
      NumericLiteral(path) {
        observations.push(path.node.value);
        path.context.metadata.set('observed', path.node.value);
      },
    },
  });
  const result = transform(
    'export const value = 1;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'rewrite', plugins: [replace], requiresPrintedInput: true },
        { name: 'analyze', plugins: [observe] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'export const value = 2;');
  assert.deepEqual(observations, [2]);
  assert.equal(result.metadata.observed, 2);
  assert.ok(result.map.mappings.length > 0);
});

test('supports aliases, enter/exit order, state, skip, and stop', () => {
  const order = [];
  const plugin = defineNativePlugin({
    name: 'lifecycle',
    createState: () => ({ count: 0 }),
    pre(_context, state) {
      order.push('pre');
      state.count++;
    },
    visitor: {
      Function: {
        enter(_path, state) {
          order.push(`enter:${state.count}`);
        },
        exit() {
          order.push('exit');
        },
      },
    },
    post() {
      order.push('post');
    },
    cleanup(reason) {
      order.push(`cleanup:${reason}`);
    },
  });
  const result = transform(
    'function example() { return 1 }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(order, ['pre', 'enter:1', 'exit', 'post', 'cleanup:complete']);
});

test('routes Babel-compatible semantic and collapsed Oxc visitor keys', () => {
  const seen = {
    references: [] as string[],
    meta: [] as string[],
    functionDeclarations: [] as string[],
    functionExpressions: 0,
    classDeclarations: [] as string[],
    classExpressions: 0,
  };
  const plugin = defineNativePlugin({
    name: 'babel-routes',
    visitor: {
      ReferencedIdentifier(path) {
        seen.references.push(String(path.node.name));
      },
      MetaProperty(path) {
        seen.meta.push(path.node.type);
      },
      FunctionDeclaration(path) {
        seen.functionDeclarations.push(String(path.node.name));
      },
      FunctionExpression() {
        seen.functionExpressions++;
      },
      ClassDeclaration(path) {
        seen.classDeclarations.push(String(path.node.name));
      },
      ClassExpression() {
        seen.classExpressions++;
      },
    },
  });
  transform(
    'const local = globalValue; use(local); function declared() {} const expression = function () {}; class Declared {} const ClassExpressionValue = class {}; import.meta; function target() { return new.target }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'routes', plugins: [plugin] }] }),
  );
  assert.deepEqual(seen.references, ['globalValue', 'use', 'local']);
  assert.deepEqual(seen.meta, ['ImportMeta', 'NewTarget']);
  assert.deepEqual(seen.functionDeclarations, ['declared', 'target']);
  assert.equal(seen.functionExpressions, 1);
  assert.deepEqual(seen.classDeclarations, ['Declared']);
  assert.equal(seen.classExpressions, 1);
});

test('matches static member chains without traversing child objects', () => {
  const matches: string[] = [];
  const plugin = defineNativePlugin({
    name: 'member-patterns',
    prepare: () => ({
      fields: {
        StaticMemberExpression: ['memberPath'],
        ComputedMemberExpression: ['memberPath'],
      },
    }),
    visitor: {
      MemberExpression(path) {
        if (path.matchesPattern('process.env.NODE_ENV')) matches.push(path.sourceText());
        if (path.matchesPattern('process.env', true)) matches.push(`partial:${path.sourceText()}`);
      },
    },
  });
  transform(
    "process.env.NODE_ENV; process['env'].EXPO_PUBLIC_VALUE; process[key].dynamic",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'match', plugins: [plugin] }] }),
  );
  assert.deepEqual(matches, [
    'process.env.NODE_ENV',
    'partial:process.env.NODE_ENV',
    'partial:process.env',
    "partial:process['env'].EXPO_PUBLIC_VALUE",
    "partial:process['env']",
  ]);
});

test('orders multiple plugins forward on enter and in reverse on exit', () => {
  const order: string[] = [];
  const plugin = (name: string) =>
    defineNativePlugin({
      name,
      visitor: {
        Function: {
          enter() {
            order.push(`${name}:enter`);
          },
          exit() {
            order.push(`${name}:exit`);
          },
        },
      },
    });
  transform(
    'function fixture() {}',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'visit', plugins: [plugin('a'), plugin('b')] }],
    }),
  );
  assert.deepEqual(order, ['a:enter', 'b:enter', 'b:exit', 'a:exit']);
});

test('supports targeted nested traversal and semantic global queries', () => {
  const names = [];
  const plugin = defineNativePlugin({
    name: 'targeted',
    prepare: () => ({
      controlFlow: ['nested-traverse'],
      fields: { Identifier: ['name', 'global'] },
    }),
    visitor: {
      Function(path) {
        path.traverse({
          Identifier(identifier) {
            names.push([identifier.node.name, identifier.node.global]);
          },
        });
      },
    },
  });
  const result = transform(
    'const outside = 1; function f(local) { return local + external }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.ok(names.some(([name, global]) => name === 'external' && global === true));
  assert.ok(!names.some(([name]) => name === 'outside'));
});

test('resolves bindings through identifier-free intermediate scopes', () => {
  const observations: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'complete-scope-tree',
    prepare() {
      return { semantics: ['scope'] };
    },
    visitor: {
      ArrowFunctionExpression(path) {
        const binding = path.scope.getBinding('outer');
        const program = path.scope.getProgramParent();
        let depth = 0;
        for (let scope = path.scope.parent; scope; scope = scope.parent) depth++;
        observations.push([binding?.name, binding?.scope === program, depth]);
      },
    },
  });
  transform(
    'const outer = 1; { { (() => outer); } }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'scope', plugins: [plugin] }] }),
  );
  assert.deepEqual(observations, [['outer', true, 3]]);
});

test('executes coarse global queries and targeted inspection', () => {
  const session = openRetained(
    'globalValue + (() => { const globalValue = 1; return globalValue })()',
    'fixture.js',
  );
  const query = session.query({ globals: [{ name: 'globalValue', references: true }] });
  assert.equal(query.globals.globalValue.references.length, 1);
  const [reference] = query.globals.globalValue.references;
  const [inspected] = session.inspect([{ nodeId: reference.id, fields: ['name', 'global'] }]);
  assert.equal(inspected.name, 'globalValue');
  assert.equal(inspected.global, true);
});

test('conservatively evaluates side-effect-free constant expressions', () => {
  const source = `const a = 1 + 2 * 3; const b = !0 && "yes"; const c = true ? "123" : "x"; const d = sideEffect();`;
  const session = openRetained(source, 'fixture.js');
  const expressions = session.nodes([
    'BinaryExpression',
    'LogicalExpression',
    'ConditionalExpression',
    'CallExpression',
  ]);
  const bySource = new Map(
    expressions.map(event => [source.slice(event.start, event.end), event.id]),
  );
  const ids = ['1 + 2 * 3', '!0 && "yes"', 'true ? "123" : "x"', 'sideEffect()'].map(expression =>
    bySource.get(expression)!,
  );
  const constants = session.query({ constants: ids }).constants;
  assert.equal(constants[ids[0]], 7);
  assert.equal(constants[ids[1]], 'yes');
  assert.equal(constants[ids[2]], '123');
  assert.equal(constants[ids[3]], null);
  session.close();
});

test('provides module specifier and declaration facts for source transforms', () => {
  const session = openRetained(
    "import base, { value as local } from 'pkg'; export { local as renamed }; const answer = 1;",
    'fixture.js',
  );
  const nodes = session.nodes([
    'ImportDeclaration',
    'ImportSpecifier',
    'ImportDefaultSpecifier',
    'ExportSpecifier',
    'VariableDeclaration',
  ]);
  assert.ok(nodes.some(node => node.source === 'pkg' && node.specifierCount === 2));
  assert.ok(nodes.some(node => node.imported === 'value' && node.local === 'local'));
  assert.ok(nodes.some(node => node.imported === 'default' && node.local === 'base'));
  assert.ok(nodes.some(node => node.local === 'local' && node.exported === 'renamed'));
  assert.ok(nodes.some(node => node.kind === 'const'));
  session.close();
});

test('provides general editor operations and structured diagnostics', () => {
  const plugin = defineNativePlugin({
    name: 'editor',
    pre(context) {
      context.editor.trim();
      context.editor.prepend('/* before */');
      context.editor.append('/* after */');
      context.diagnostic({ code: 'fixture', message: 'diagnostic' });
    },
  });
  const result = transform(
    '  value  ',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '/* before */value/* after */');
  assert.deepEqual(result.diagnostics, [
    { code: 'fixture', message: 'diagnostic', plugin: 'editor', phase: 'edit' },
  ]);
});

test('returns pristine source on explicit bailout and calls cleanup', () => {
  let cleanup;
  const plugin = defineNativePlugin({
    name: 'bail',
    visitor: {
      Identifier(path) {
        path.replaceWith('changed');
        path.unsupported('fixture');
      },
    },
    cleanup(reason) {
      cleanup = reason;
    },
  });
  const source = 'const original = 1';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'source', plugins: [plugin] }] }),
  );
  assert.deepEqual(result, { status: 'bailout', reason: 'bail:fixture', source, diagnostics: [] });
  assert.equal(cleanup, 'bailout');
});

test('analyzes every plugin before applying edits and bails out pristine', () => {
  const lifecycle: string[] = [];
  const supported = defineNativePlugin({
    name: 'supported',
    analyze() {
      lifecycle.push('analyze:supported');
      return { status: 'supported', analysis: 'replacement' };
    },
    apply(context, analysis) {
      lifecycle.push(`apply:${analysis}`);
      context.editor.overwrite(0, 5, 'changed');
    },
  });
  const unsupported = defineNativePlugin({
    name: 'unsupported-analysis',
    analyze() {
      lifecycle.push('analyze:unsupported');
      return { status: 'unsupported', reason: 'needs-compiler' };
    },
  });
  const source = 'value';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'source', plugins: [supported, unsupported] }],
    }),
  );
  assert.equal(result.status, 'bailout');
  assert.equal(result.source, source);
  assert.deepEqual(lifecycle, ['analyze:supported', 'analyze:unsupported']);
});

test('builds deterministic cache keys and returns pristine bailout source', () => {
  const plugin = defineNativePlugin({
    name: 'unsupported',
    visitor: { Program: path => path.unsupported('test') },
  });
  const pipeline = defineNativePipeline({
    phases: [{ name: 'source', plugins: [plugin] }],
  });
  assert.equal(pipelineCacheKey(pipeline, 'fixture.js'), pipelineCacheKey(pipeline, 'fixture.js'));
  const result = transform('const pristine = true', 'fixture.js', pipeline);
  assert.equal(result.status, 'bailout');
  assert.equal(result.source, 'const pristine = true');
});

test('creates immutable pipelines and reusable option-bound plugin definitions', () => {
  const definition = defineNativePlugin<undefined, { value: string }>({
    name: 'configured',
    prepare(_context, options) {
      assert.equal(options.value, 'configured');
    },
  });
  const configured = definition.withOptions({ value: 'configured' });
  const pipeline = defineNativePipeline({
    phases: [{ name: 'visit', plugins: [configured] }],
  });
  assert.ok(Object.isFrozen(definition));
  assert.ok(Object.isFrozen(pipeline));
  assert.ok(Object.isFrozen(pipeline.phases));
  assert.ok(Object.isFrozen(pipeline.phases[0].plugins));
  assert.notEqual(
    pipelineCacheKey(definitionPipeline(definition), 'fixture.js'),
    pipelineCacheKey(definitionPipeline(configured), 'fixture.js'),
  );
  transform('value', 'fixture.js', pipeline);
});

test('requires explicit pipeline phases', () => {
  const plugin = defineNativePlugin({
    name: 'concise',
    visitor: {
      NumericLiteral(path) {
        path.replaceWith('2');
      },
    },
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] });
  assert.equal(pipeline.phases[0].name, 'transform');
  const result = transform('const value = 1;', 'fixture.js', pipeline);
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 2;');
});

function definitionPipeline(
  plugin: ReturnType<typeof defineNativePlugin>,
): ReturnType<typeof defineNativePipeline> {
  return defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] });
}

test('rejects conflicting edits transactionally', () => {
  const plugin = name =>
    defineNativePlugin({
      name,
      visitor: { Identifier: path => path.replaceWith(name) },
    });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({
          phases: [{ name: 'source', plugins: [plugin('a'), plugin('b')] }],
        }),
      ),
    /overlapping edits/,
  );
});

test('expands union visitor keys before native subscription planning', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'union',
    visitor: { 'ImportDeclaration|ExportNamedDeclaration': path => seen.push(path.node.type) },
  });
  transform(
    "import value from 'source'; export { value }",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(seen, ['ImportDeclaration', 'ExportNamedDeclaration']);
});

test('expands the Expression alias consistently for literal expressions', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'expressions',
    visitor: { Expression: path => seen.push(path.node.type) },
  });
  transform(
    'true; 1; "value"; null; /value/;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.ok(seen.includes('BooleanLiteral'));
  assert.ok(seen.includes('NumericLiteral'));
  assert.ok(seen.includes('StringLiteral'));
  assert.ok(seen.includes('NullLiteral'));
  assert.ok(seen.includes('RegExpLiteral'));
});

test('treats declarations as Babel statements despite collapsed Oxc node kinds', () => {
  const declarations: string[] = [];
  const statements: string[] = [];
  const plugin = defineNativePlugin({
    name: 'declaration-alias',
    visitor: {
      Declaration(path) {
        declarations.push(path.node.type);
      },
      Statement(path) {
        statements.push(path.node.type);
      },
    },
  });
  transform(
    "import value from 'pkg'; const item = value; function fn() {} class Example {} export { item };",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(declarations, [
    'ImportDeclaration',
    'VariableDeclaration',
    'Function',
    'Class',
    'ExportNamedDeclaration',
  ]);
  assert.deepEqual(statements, declarations);
});

test('provides parent paths backed by native indexed records', () => {
  let parentType: string | undefined;
  const plugin = defineNativePlugin({
    name: 'parent',
    prepare() {
      return { ancestry: 'parent' };
    },
    visitor: {
      NumericLiteral(path) {
        parentType = path.parentPath?.node.type;
      },
    },
  });
  transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(parentType, 'VariableDeclarator');
});

test('provides lazy ancestor helpers without recursive node materialization', () => {
  let ancestors: unknown;
  const plugin = defineNativePlugin({
    name: 'ancestors',
    prepare() {
      return { ancestry: 'findParent' };
    },
    visitor: {
      NumericLiteral(path) {
        ancestors = [
          path.findParent(parent => parent.node.type === 'ReturnStatement')?.node.type,
          path.getFunctionParent()?.node.type,
          path.getProgramParent()?.node.type,
        ];
      },
    },
  });
  transform(
    'function fixture() { return 1 }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(ancestors, ['ReturnStatement', 'Function', 'Program']);
});

test('requires ancestry and scope payloads to be declared', () => {
  const ancestry = defineNativePlugin({
    name: 'undeclared-ancestry',
    visitor: {
      Identifier(path) {
        void path.parentPath;
      },
    },
  });
  const scope = defineNativePlugin({
    name: 'undeclared-scope',
    visitor: {
      Identifier(path) {
        void path.scope;
      },
    },
  });
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [ancestry] }] }),
      ),
    /undeclared ancestry access/,
  );
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [scope] }] }),
      ),
    /undeclared scope semantics/,
  );
});

test('honors plan phase filters and validates expression fragments natively', () => {
  const visited: string[] = [];
  const plugin = defineNativePlugin({
    name: 'phased',
    prepare() {
      return { phases: ['second'] };
    },
    visitor: {
      Program(path) {
        visited.push(path.context.phase);
        assert.throws(
          () => path.context.code.parseExpression('value +'),
          /invalid expression fragment/,
        );
      },
    },
  });
  transform(
    'value',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [plugin] },
        { name: 'second', plugins: [plugin] },
      ],
    }),
  );
  assert.deepEqual(visited, ['second']);
});

test('builds escaped primitive literals and validates statement fragments', () => {
  const plugin = defineNativePlugin({
    name: 'code-factory',
    visitor: {
      Program(path) {
        assert.equal(path.context.code.literal('quoted\nvalue').code, '"quoted\\nvalue"');
        assert.equal(path.context.code.literal(12n).code, '12n');
        path.appendToBody(
          path.context.code.parseStatements('\nexport const generated = null;').code,
        );
        assert.throws(
          () => path.context.code.parseStatements('export const ='),
          /invalid statement fragment/,
        );
      },
    },
  });
  const result = transform(
    'const original = true;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'generate', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const original = true;\nexport const generated = null;');
});

test('composes source maps across phases', () => {
  const first = defineNativePlugin({
    name: 'first',
    visitor: {
      NumericLiteral: path => path.replaceWith({ code: '20', mapping: 'anchor-boundaries' }),
    },
  });
  const second = defineNativePlugin({
    name: 'second',
    visitor: {
      NumericLiteral: path => path.replaceWith({ code: '300', mapping: 'anchor-boundaries' }),
    },
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [first] },
        { name: 'second', plugins: [second] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 300');
  assert.ok(result.map.mappings.length > 0);
});

test('supports all four insertion affinities deterministically', () => {
  const plugin = defineNativePlugin({
    name: 'affinity',
    pre(context) {
      context.editor.appendLeft(0, 'AL');
      context.editor.prependLeft(0, 'PL');
      context.editor.appendRight(0, 'AR');
      context.editor.prependRight(0, 'PR');
    },
  });
  const result = transform(
    'x',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'PLALPRARx');
});

test('lowers static and functional replacements against pristine source', () => {
  const plugin = defineNativePlugin({
    name: 'replace',
    pre(context) {
      context.editor.replace('one', 'ONE');
      context.editor.replaceAll(/two/g, match => match.toUpperCase());
    },
  });
  const result = transform(
    'one; two; two;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'ONE; TWO; TWO;');
});

test('allows an explicit parser mode independent of filename extension', () => {
  const result = transform(
    'const value: number = 1',
    'fixture.js',
    defineNativePipeline({ phases: [] }),
    { parser: 'ts' },
  );
  assert.equal(result.status, 'complete');
});

test('widens over only the remaining traversal and suppresses duplicates', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'widen',
    prepare: () => ({
      controlFlow: ['dynamic-subscriptions'],
      fields: { CallExpression: ['calleeName'], Identifier: ['name'] },
    }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName === 'mark') path.context.subscribeRemaining('Identifier');
      },
      Identifier(path) {
        seen.push(String(path.node.name));
      },
    },
  });
  transform(
    'before; mark(); after;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(seen, ['before', 'mark', 'after']);
});

test('implements per-plugin skip and stop', () => {
  const skipped: string[] = [];
  const stopped: string[] = [];
  const skipPlugin = defineNativePlugin({
    name: 'skip',
    prepare: () => ({ controlFlow: ['skip'], fields: { Identifier: ['name'] } }),
    visitor: {
      Function(path) {
        path.skip();
      },
      Identifier(path) {
        skipped.push(String(path.node.name));
      },
    },
  });
  const stopPlugin = defineNativePlugin({
    name: 'stop',
    prepare: () => ({ controlFlow: ['stop'] }),
    visitor: {
      Identifier(path) {
        stopped.push(String(path.node.name));
        path.stop();
      },
    },
  });
  transform(
    'outside; function fn(inside) { return inside } trailing;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'visit', plugins: [skipPlugin, stopPlugin] }],
    }),
  );
  assert.ok(skipped.includes('outside'));
  assert.ok(!skipped.includes('inside'));
  assert.equal(stopped.length, 1);
});

test('requires an explicit global stop capability', () => {
  let peerCalls = 0;
  const localStopOnly = defineNativePlugin({
    name: 'local-stop-only',
    prepare: () => ({ controlFlow: ['stop'] }),
    visitor: {
      Identifier(path) {
        path.context.stopAll();
      },
    },
  });
  assert.throws(
    () =>
      transform(
        'value;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [localStopOnly] }] }),
      ),
    /local-stop-only: undeclared control-flow capability stop-all/,
  );

  const globalStop = defineNativePlugin({
    name: 'global-stop',
    prepare: () => ({ controlFlow: ['stop-all'] }),
    visitor: {
      Identifier(path) {
        path.context.stopAll();
      },
    },
  });
  const peer = defineNativePlugin({
    name: 'global-stop-peer',
    visitor: {
      Identifier() {
        peerCalls++;
      },
    },
  });
  transform(
    'value;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [globalStop, peer] }] }),
  );
  assert.equal(peerCalls, 0);
});

test('keeps static routes independent from another plugin dynamic skip state', () => {
  let dynamicIdentifiers = 0;
  let staticIdentifiers = 0;
  const dynamic = defineNativePlugin({
    name: 'dynamic-skip',
    prepare: () => ({ controlFlow: ['skip'] }),
    visitor: {
      Function(path) {
        path.skip();
      },
      Identifier() {
        dynamicIdentifiers++;
      },
    },
  });
  const fixed = defineNativePlugin({
    name: 'fixed-route',
    prepare: () => ({ controlFlow: [] }),
    visitor: {
      Identifier() {
        staticIdentifiers++;
      },
    },
  });
  const result = transform(
    'const outside = 1; function example(argument) { return argument }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [dynamic, fixed] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(dynamicIdentifiers, 1);
  assert.equal(staticIdentifiers, 4);
});

test('provides call and capture query declarations', () => {
  let calls = 0;
  let captures: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'queries',
    prepare: () => ({
      queries: [
        { calls: [{ callee: 'load', globalOnly: true, staticArguments: true }] },
        { captures: [{ functionId: 0 }] },
      ],
    }),
    visitor: {
      Function(path) {
        calls = path.context.query({
          calls: [{ callee: 'load', globalOnly: true, staticArguments: true }],
        }).calls.load.length;
        captures = path.context.query({ captures: [{ functionId: path.node.id }] }).captures[
          path.node.id
        ];
      },
    },
  });
  transform(
    "const outer = 1; load('x'); function fn() { return outer }",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(calls, 1);
  assert.equal(captures.length, 1);
});

test('exposes binding reads, writes, and lexical captures', () => {
  const session = openRetained(
    'let outer = 0; function update() { outer++; return outer }',
    'fixture.js',
  );
  const [fn] = session.nodes(['Function']);
  const facts = session.query({ bindings: [{ name: 'outer' }], captures: [{ functionId: fn.id }] });
  assert.equal(facts.bindings.length, 1);
  assert.ok(facts.bindings[0].references.some(reference => reference.write === true));
  assert.ok(facts.bindings[0].references.some(reference => reference.read === true));
  assert.ok(
    facts.captures[fn.id].some(reference => reference.id === facts.bindings[0].references[0].id),
  );
  session.close();
});

test('indexes repeated scope lookups without consuming follow-up batches', () => {
  const source = Array.from(
    { length: 100 },
    (_, index) => `const value${index} = global${index};`,
  ).join('\n');
  let bindings = 0;
  let globals = 0;
  const plugin = defineNativePlugin({
    name: 'many-scope-lookups',
    prepare() {
      return { semantics: ['scope'], fields: { Identifier: ['name'] } };
    },
    visitor: {
      Identifier(path) {
        const name = String(path.node.name);
        if (path.scope.hasBinding(name)) bindings++;
        if (path.scope.hasGlobal(name)) globals++;
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(bindings, 100);
  assert.equal(globals, 100);
});

test('filters hot event families only when every subscriber opts in', () => {
  const firstSeen = new Set();
  const secondSeen = new Set();
  const first = defineNativePlugin({
    name: 'first-filter',
    prepare() {
      return {
        identifierNames: ['first'],
        staticMemberPatterns: ['process.env.FIRST'],
        fields: { Identifier: ['name'], StaticMemberExpression: ['memberPath'] },
      };
    },
    visitor: {
      ReferencedIdentifier(path) {
        firstSeen.add(String(path.node.name));
      },
      StaticMemberExpression(path) {
        firstSeen.add(String(path.node.memberPath));
      },
    },
  });
  const second = defineNativePlugin({
    name: 'second-filter',
    prepare() {
      return {
        identifierNames: ['second'],
        staticMemberPatterns: ['process.env.SECOND'],
        fields: { Identifier: ['name'], StaticMemberExpression: ['memberPath'] },
      };
    },
    visitor: {
      ReferencedIdentifier(path) {
        secondSeen.add(String(path.node.name));
      },
      StaticMemberExpression(path) {
        secondSeen.add(String(path.node.memberPath));
      },
    },
  });
  transform(
    'first; second; third; process.env.FIRST; process.env.SECOND; process.env.THIRD;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [first, second] }] }),
  );
  assert.deepEqual([...firstSeen].sort(), ['first', 'process.env.FIRST']);
  assert.deepEqual([...secondSeen].sort(), ['process.env.SECOND', 'second']);

  const unfiltered = new Set();
  const broad = defineNativePlugin({
    name: 'unfiltered',
    prepare: () => ({ fields: { Identifier: ['name'] } }),
    visitor: {
      ReferencedIdentifier(path) {
        unfiltered.add(String(path.node.name));
      },
    },
  });
  transform(
    'first; second; third;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [first, broad] }] }),
  );
  assert.ok(unfiltered.has('third'));
});

test('can disable a plugin and its lifecycle for the current file', () => {
  let lifecycleCalls = 0;
  const plugin = defineNativePlugin({
    name: 'disabled',
    prepare() {
      return { enabled: false };
    },
    createState() {
      lifecycleCalls++;
    },
    pre() {
      lifecycleCalls++;
    },
    visitor: {
      Identifier() {
        lifecycleCalls++;
      },
    },
    post() {
      lifecycleCalls++;
    },
  });
  transform(
    'const value = source;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(lifecycleCalls, 0);
});

test('resolves the nearest binding and renames only its semantic references', () => {
  const plugin = defineNativePlugin({
    name: 'rename-binding',
    prepare() {
      return { semantics: ['scope'], fields: { Function: ['name'] } };
    },
    visitor: {
      Program(path) {
        const binding = path.scope.getBinding('value');
        assert.equal(binding?.global, false);
        assert.equal(binding?.references.length, 3);
        assert.equal(binding?.path?.node.type, 'VariableDeclarator');
        assert.equal(binding?.scope?.id, path.scope.id);
        assert.equal(binding?.scope?.getProgramParent().id, path.scope.id);
        assert.equal(path.scope.rename('value', 'renamed'), 'renamed');
      },
    },
  });
  const source =
    'let value = 1; use(value); const object = { value }; ({ value } = object); function nested(value) { return value }';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    'let renamed = 1; use(renamed); const object = { value: renamed }; ({ value: renamed } = object); function nested(value) { return value }',
  );
});

test('exposes lazy Babel-shaped binding paths and scope parent chains', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'binding-path',
    prepare() {
      return { semantics: ['scope'], fields: { Function: ['name', 'bodyStart'] } };
    },
    visitor: {
      Function(path) {
        if (path.node.name !== 'nested') return;
        const binding = path.scope.getBinding('parameter');
        observed = [
          binding?.path?.node.type,
          binding?.scope?.id,
          binding?.scope === path.scope,
          binding?.scope?.parent?.id,
          binding?.scope?.getProgramParent().id,
        ];
      },
    },
  });
  transform(
    'function nested(parameter) { return parameter }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'scope', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, ['FormalParameter', 1, true, 0, 0]);
});

test('pushes generated declarations into a scope after its directive prologue', () => {
  const plugin = defineNativePlugin({
    name: 'scope-push',
    prepare() {
      return { semantics: ['scope'], fields: { Function: ['name', 'bodyStart'] } };
    },
    visitor: {
      Function(path) {
        if (path.node.name === 'action')
          path.scope.push(path.context.code.parseStatements('var injected = 1;'));
      },
    },
  });
  const result = transform(
    'function action() { "use action"; return injected }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'push', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    'function action() { "use action";\nvar injected = 1;\n return injected }',
  );
});

test('provides Babel-shaped multi-replacement, container, comment, and code-frame helpers', () => {
  const plugin = defineNativePlugin({
    name: 'path-conveniences',
    visitor: {
      Program(path) {
        path.unshiftContainer('body', '/* first */\n');
        path.pushContainer('body', '\n/* last */');
      },
      NumericLiteral(path) {
        path.replaceWithMultiple(['2', '3']);
        assert.match(path.buildCodeFrameError('fixture').message, /fixture/);
      },
    },
  });
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '/* first */\nconst value = 2\n3;\n/* last */');
});

test('provides lazy compact structural child roles without recursive ESTree transfer', () => {
  const observed: Record<string, string[]> = {};
  const sources = (value: ReturnType<any>) =>
    (Array.isArray(value) ? value : value ? [value] : []).map(path => path.sourceText());
  const plugin = defineNativePlugin({
    name: 'child-roles',
    prepare() {
      return {
        children: {
          Program: ['body'],
          ImportDeclaration: ['specifiers', 'source'],
          VariableDeclarator: ['id', 'init'],
          CallExpression: ['callee', 'arguments'],
          ObjectProperty: ['key', 'value'],
          Function: ['params'],
          FormalParameters: ['*'],
          ExportDefaultDeclaration: ['declaration'],
        },
      };
    },
    visitor: {
      Program(path) {
        observed.body = sources(path.get('body'));
      },
      ImportDeclaration(path) {
        observed.specifiers = sources(path.get('specifiers'));
        observed.source = sources(path.get('source'));
      },
      VariableDeclarator(path) {
        if (path.sourceText().includes('result')) {
          observed.id = sources(path.get('id'));
          observed.init = sources(path.get('init'));
        }
      },
      CallExpression(path) {
        observed.callee = sources(path.get('callee'));
        observed.arguments = sources(path.get('arguments'));
      },
      ObjectProperty(path) {
        observed.key = sources(path.get('key'));
        observed.value = sources(path.get('value'));
      },
      Function(path) {
        observed.params = sources(path.get('params'));
      },
      ExportDefaultDeclaration(path) {
        observed.declaration = sources(path.get('declaration'));
      },
    },
  });
  transform(
    "import item, { x as y } from 'pkg'; function f(a, { b }) {} const result = fn({ platform: 1 }, y); export default result;",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
    { maxFollowUpBatches: 2 },
  );
  assert.deepEqual(observed.callee, ['fn']);
  assert.deepEqual(observed.arguments, ['{ platform: 1 }', 'y']);
  assert.deepEqual(observed.key, ['platform']);
  assert.deepEqual(observed.value, ['1']);
  assert.deepEqual(observed.id, ['result']);
  assert.deepEqual(observed.init, ['fn({ platform: 1 }, y)']);
  assert.deepEqual(observed.source, ["'pkg'"]);
  assert.deepEqual(observed.specifiers, ['item', 'x as y']);
  assert.deepEqual(observed.params, ['a', '{ b }']);
  assert.deepEqual(observed.declaration, ['result']);
  assert.equal(observed.body.length, 4);
});

test('requires structural child roles to be declared before parsing', () => {
  const plugin = defineNativePlugin({
    name: 'undeclared-child',
    visitor: {
      CallExpression(path) {
        path.get('arguments');
      },
    },
  });
  assert.throws(
    () =>
      transform(
        'run(1)',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /undeclared child role CallExpression\.arguments/,
  );
});

test('distinguishes control-flow and class child roles needed by structural fixes', () => {
  const observed: Record<string, string | null> = {};
  const one = (value: unknown) =>
    value && !Array.isArray(value) ? (value as { sourceText(): string }) : null;
  const plugin = defineNativePlugin({
    name: 'structural-roles',
    prepare() {
      return {
        fields: { Class: ['name'] },
        children: {
          TryStatement: ['block', 'handler', 'finalizer'],
          Class: ['superClass', 'body'],
        },
      };
    },
    visitor: {
      TryStatement(path) {
        observed.block = one(path.get('block'))?.sourceText() ?? null;
        observed.handler = one(path.get('handler'))?.sourceText() ?? null;
        observed.finalizer = one(path.get('finalizer'))?.sourceText() ?? null;
      },
      Class(path) {
        observed.superClass = one(path.get('superClass'))?.sourceText() ?? null;
        observed.classBody = one(path.get('body'))?.sourceText() ?? null;
      },
    },
  });
  transform(
    'try { work() } catch (error) { recover(error) } finally { cleanup() } class Child extends Parent { method() {} }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    block: '{ work() }',
    handler: 'catch (error) { recover(error) }',
    finalizer: '{ cleanup() }',
    superClass: 'Parent',
    classBody: '{ method() {} }',
  });
});

test('implements a Platform.select-style transform through declared compact roles', () => {
  const plugin = defineNativePlugin({
    name: 'platform-select',
    prepare() {
      return {
        children: {
          CallExpression: ['callee', 'arguments'],
          ObjectExpression: ['properties'],
          ObjectProperty: ['value'],
        },
      };
    },
    visitor: {
      CallExpression(path) {
        const callee = path.getChild('callee');
        if (!callee?.matchesPattern('Platform.select')) return;
        const argument = path.getChildList('arguments')[0];
        if (!argument?.is('ObjectExpression')) return;
        const properties = argument.getChildList('properties');
        if (
          properties.some(
            property => property.node.type !== 'ObjectProperty' || property.node.computed === true,
          )
        )
          return;
        const selected =
          properties.find(property => property.node.key === 'ios') ??
          properties.find(property => property.node.key === 'native') ??
          properties.find(property => property.node.key === 'default');
        const value = selected?.getChild('value');
        if (value) path.replaceWith(value.getSource());
      },
    },
  });
  const result = transform(
    "const selected = Platform.select({ web: 'web', native: makeNative(), ios: 'ios' });",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'platform', plugins: [plugin] }] }),
    { maxFollowUpBatches: 2 },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const selected = 'ios';");
});

test('validates metadata ownership', () => {
  const plugin = defineNativePlugin({
    name: 'metadata',
    pre(context) {
      context.metadata.set('undeclared', true);
    },
  });
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /undeclared metadata key/,
  );
});

test('supports caller-provided parser adapters for unsupported syntax', () => {
  const unregister = registerParserAdapter({
    name: 'flow-fixture',
    supports: route => route.syntax === 'flow',
    transform: source => ({
      status: 'complete',
      code: source,
      map: { mappings: '', names: [] },
      metadata: { adapter: true },
      diagnostics: [],
    }),
  });
  try {
    const result = transform(
      '// @flow\nconst value: number = 1',
      'fixture.js',
      defineNativePipeline({ phases: [] }),
    );
    assert.equal(result.status, 'complete');
    assert.equal(result.metadata.adapter, true);
  } finally {
    unregister();
  }
});

test('produces traceable Unicode-aware VLQ mappings', () => {
  const plugin = defineNativePlugin({
    name: 'map',
    visitor: {
      NumericLiteral: path =>
        path.replaceWith({ code: '200', mapping: 'anchor-start', names: ['generatedValue'] }),
    },
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

test('enforces native memory and follow-up batch budgets', () => {
  assert.throws(
    () => openRetained('const value = 1', 'fixture.js', { maxNativeMemoryBytes: 1 }),
    /native-memory-budget-exceeded/,
  );
  const session = openRetained('const value = 1', 'fixture.js', {
    maxFollowUpBatches: 1,
  });
  session.nextRoutedPacked(packRouteManifest([], false, false));
  assert.throws(
    () => session.nextRoutedPacked(packRouteManifest([], false, false)),
    /follow-up-batch-budget-exceeded/,
  );
  session.close();
});

test('keeps native sessions worker-thread isolated', async () => {
  const moduleUrl = new URL('../dist/native.js', import.meta.url).href;
  const manifest = packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES).toString(
    'base64',
  );
  const value = await new Promise((resolve, reject) => {
    const worker = new Worker(
      `import { parentPort } from 'node:worker_threads'; import(${JSON.stringify(moduleUrl)}).then(({ native }) => { const session = new native.NativeIndexedSession('const value = 1', 'worker.js', false, Buffer.from(${JSON.stringify(manifest)}, 'base64')); parentPort.postMessage(session.parseCount()); session.close(); }, error => { throw error; });`,
      { eval: true },
    );
    worker.once('message', resolve);
    worker.once('error', reject);
  });
  assert.equal(value, 1);
});

test('handles deterministic randomized non-overlapping edit batches', () => {
  let seed = 0x12345678;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let iteration = 0; iteration < 100; iteration++) {
    const source = 'abcdefghijklmnopqrstuvwxyz';
    const session = openRetained(source, 'fuzz.js');
    const edits = Array.from({ length: 5 }, (_, index) => ({
      kind: 'Replace' as const,
      start: index * 5,
      end: index * 5 + 1,
      content: String.fromCharCode(65 + Math.floor(random() * 26)),
    }));
    assert.equal(session.commit(edits).code.length, source.length);
    session.close();
  }
});

test('rejects untranslatable mixed edit coordinate spaces', () => {
  assert.throws(
    () =>
      packEdits([
        {
          kind: 'Replace',
          start: 0,
          end: 1,
          content: 'x',
          coordinateSpace: 'generated',
        },
      ]),
    /requires explicit translation/,
  );
});

test('composes an unwrap replacement with inner edits from another plugin', () => {
  // The log-box failure shape: one plugin strips an export wrapper by replacing the
  // declaration with its own source, another rewrites a call inside the body. The
  // provenance-carrying replacement keeps the body range live, so both apply.
  const source = `export function setup() {\n    const toast = require('./toast');\n}\n`;
  const unwrapExports = defineNativePlugin({
    name: 'unwrap-exports',
    prepare: () => ({ children: { ExportNamedDeclaration: ['declaration'] } }),
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.getChild('declaration');
        assert.ok(declaration);
        path.replaceWith(declaration.getSource());
      },
    },
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    prepare: () => ({ fields: { CallExpression: ['calleeName', 'staticArgument'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName !== 'require') return;
        path.replaceWith(`_REQ(${JSON.stringify(path.node.staticArgument)})`);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [unwrapExports, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, `function setup() {\n    const toast = _REQ("./toast");\n}\n`);
});

test('composes template slots with glue text and inner edits', () => {
  const source = `export default function main() { return require('./impl'); }\n`;
  const lowerDefault = defineNativePlugin({
    name: 'lower-default-export',
    prepare: () => ({ children: { ExportDefaultDeclaration: ['declaration'] } }),
    visitor: {
      ExportDefaultDeclaration(path) {
        const declaration = path.getChild('declaration');
        assert.ok(declaration);
        path.replaceWith(path.context.code.template`var _default = ${declaration};`);
      },
    },
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    prepare: () => ({ fields: { CallExpression: ['calleeName', 'staticArgument'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName !== 'require') return;
        path.replaceWith(`_REQ(${JSON.stringify(path.node.staticArgument)})`);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [lowerDefault, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, `var _default = function main() { return _REQ("./impl"); };\n`);
});

test('rejects string coercion of source fragments with guidance', () => {
  assert.throws(
    () =>
      transform(
        'const value = 1;',
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'transform',
              plugins: [
                defineNativePlugin({
                  name: 'coerce-fragment',
                  visitor: {
                    VariableDeclaration(path) {
                      path.replaceWith(`copied: ${path.getSource()}`);
                    },
                  },
                }),
              ],
            },
          ],
        }),
      ),
    /carries provenance/,
  );
});

test('degrades out-of-place source fragments to plain text copies', () => {
  // A fragment interpolated outside its own range (duplication) cannot keep
  // provenance for both copies; the replacement still renders correctly.
  const source = 'const value = compute();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-initializer',
    prepare: () => ({ children: { VariableDeclarator: ['init'] } }),
    visitor: {
      VariableDeclarator(path) {
        const init = path.getChild('init');
        assert.ok(init);
        const fragment = init.getSource();
        path.replaceWith(path.context.code.template`checked = ${fragment} ?? ${fragment}`);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [duplicate] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const checked = compute() ?? compute();\n');
});

test('attributes overlapping edit conflicts to their owning plugins', () => {
  const source = 'const value = 1;\n';
  const wide = defineNativePlugin({
    name: 'wide-owner',
    visitor: {
      VariableDeclaration(path) {
        path.replaceWith('var value = 2;');
      },
    },
  });
  const inner = defineNativePlugin({
    name: 'inner-owner',
    prepare: () => ({ fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        if (path.node.name === 'value') path.replaceWith('renamed');
      },
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [wide, inner] }] }),
      ),
    /owners: wide-owner, inner-owner/,
  );
});

test('inserted copies reflect same-phase edits at commit time', () => {
  const source = `function helper() { return require('./impl'); }\n`;
  const duplicateHelper = defineNativePlugin({
    name: 'duplicate-helper',
    visitor: {
      Function(path) {
        path.insertAfter(path.getSource());
      },
    },
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    prepare: () => ({ fields: { CallExpression: ['calleeName', 'staticArgument'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName === 'require') path.replaceWith(`_REQ("./impl")`);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [duplicateHelper, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code.match(/_REQ\("\.\/impl"\)/g)?.length, 2);
  assert.ok(!result.code.includes('require('));
});

test('duplicated template slots reflect same-phase edits', () => {
  const source = 'const value = compute();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-initializer',
    prepare: () => ({ children: { VariableDeclarator: ['init'] } }),
    visitor: {
      VariableDeclarator(path) {
        const init = path.getChild('init');
        assert.ok(init);
        const fragment = init.getSource();
        path.replaceWith(path.context.code.template`checked = ${fragment} ?? ${fragment}`);
      },
    },
  });
  const upgradeCalls = defineNativePlugin({
    name: 'upgrade-calls',
    prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [duplicate, upgradeCalls] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const checked = compute2() ?? compute2();\n');
});

test('rejects circular source copies', () => {
  const source = 'function loop() { seed(); }\n';
  const selfCopy = defineNativePlugin({
    name: 'self-copy',
    prepare: () => ({ fields: { Function: ['bodyStart', 'bodyEnd'] } }),
    visitor: {
      Function(path) {
        path.prependToBody(path.getSource());
      },
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [selfCopy] }] }),
      ),
    /circular source copy .*\(owner: self-copy\)/,
  );
});

test('rejects copies whose range is partially overlapped by another edit', () => {
  const source = 'const a = 1; const b = 2;\n';
  const secondDeclaration = source.indexOf('const b');
  const copySecond = defineNativePlugin({
    name: 'copy-second',
    visitor: {
      VariableDeclaration(path) {
        if (path.start === secondDeclaration) path.insertAfter(path.getSource());
      },
    },
  });
  const straddle = defineNativePlugin({
    name: 'straddler',
    visitor: {
      Program(path) {
        // Replace across the copied declaration's start boundary.
        path.context.editor.update(secondDeclaration - 2, secondDeclaration + 5, 'X');
      },
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [copySecond, straddle] }] }),
      ),
    /partially overlaps .*\(owners: copy-second, straddler\)/,
  );
});

test('degrades cross-phase fragments to text with a debug diagnostic', () => {
  const source = 'const first = 1;\nconst second = target();\n';
  const capture = defineNativePlugin({
    name: 'capture-fragment',
    prepare: () => ({ metadataWrites: ['captured'], fields: { CallExpression: ['calleeName'] } }),
    visitor: {
      CallExpression(path, _state) {
        if (path.node.calleeName === 'target') {
          path.context.metadata.set('captured', path.getSource());
          path.replaceWith('renamed()');
        }
      },
    },
  });
  const reuse = defineNativePlugin({
    name: 'reuse-fragment',
    prepare: () => ({ identifierNames: ['first'], fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        const captured = path.context.metadata.get('captured') as SourceFragment | undefined;
        if (captured) path.replaceWith(captured);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [capture] },
        { name: 'two', requiresPrintedInput: true, plugins: [reuse] },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  // The stale copy carries phase-one text; the live phase-one range was edited.
  assert.ok(result.code.includes('const target() = 1;'));
  assert.ok(result.code.includes('renamed()'));
  assert.ok(result.diagnostics.some(diagnostic => diagnostic.code === 'provenance-degraded'));
});

test('counts provenance degradations in metadata without debug tracing', () => {
  const source = 'const first = 1;\nconst second = target();\n';
  const capture = defineNativePlugin({
    name: 'capture-fragment',
    prepare: () => ({ metadataWrites: ['captured'], fields: { CallExpression: ['calleeName'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName === 'target') {
          path.context.metadata.set('captured', path.getSource());
          path.replaceWith('renamed()');
        }
      },
    },
  });
  const reuse = defineNativePlugin({
    name: 'reuse-fragment',
    prepare: () => ({ identifierNames: ['first'], fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        const captured = path.context.metadata.get('captured') as SourceFragment | undefined;
        if (captured) path.replaceWith(captured);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [capture] },
        { name: 'two', requiresPrintedInput: true, plugins: [reuse] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.metadata.provenanceDegradations, 1);
  assert.ok(!result.diagnostics.some(diagnostic => diagnostic.code === 'provenance-degraded'));
});

test('ensureHelper inserts each key once at the end of the directive prologue', () => {
  const source = "#!/usr/bin/env node\n'use strict';\nconst value = compute();\n";
  const first = defineNativePlugin({
    name: 'first-ensurer',
    pre(context) {
      context.ensureHelper('shared/flag', 'var __flag = true;');
      context.ensureHelper('first/own', 'var __first = 1;');
    },
  });
  const second = defineNativePlugin({
    name: 'second-ensurer',
    pre(context) {
      context.ensureHelper('shared/flag', 'var __flag = true;');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'one', plugins: [first, second] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    "#!/usr/bin/env node\n'use strict';\nvar __flag = true;\nvar __first = 1;\nconst value = compute();\n",
  );
});

test('ensureHelper re-ensures are no-ops in later phases', () => {
  const source = 'const value = 1;\n';
  const ensurer = (name: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureHelper('shared/flag', 'var __flag = true;');
      },
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [ensurer('one-ensurer')] },
        { name: 'two', requiresPrintedInput: true, plugins: [ensurer('two-ensurer')] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'var __flag = true;\nconst value = 1;\n');
});

test('ensureHelper conflicts loudly when one key realizes different content', () => {
  const source = 'const value = 1;\n';
  const ensurer = (name: string, content: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureHelper('shared/flag', content);
      },
    });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'one',
              plugins: [
                ensurer('owner-a', 'var __flag = 1;'),
                ensurer('owner-b', 'var __flag = 2;'),
              ],
            },
          ],
        }),
      ),
    /helper shared\/flag .*owner-b.*owner-a/,
  );
});

test('collapses byte-identical convergent edits to the first owner', () => {
  const source = 'const value = compute();\n';
  const upgrade = (name: string) =>
    defineNativePlugin({
      name,
      prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
      visitor: {
        CallExpression(path) {
          if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
        },
      },
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'transform', plugins: [upgrade('first-upgrade'), upgrade('second-upgrade')] },
      ],
    }),
    { debugPerformance: true },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = compute2();\n');
  const performance = result.metadata.performance as { convergentEditsDeduped: number };
  assert.equal(performance.convergentEditsDeduped, 1);
});

test('still rejects convergent edits whose content differs', () => {
  const source = 'const value = compute();\n';
  const upgrade = (name: string, replacement: string) =>
    defineNativePlugin({
      name,
      prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
      visitor: {
        CallExpression(path) {
          if (path.node.calleeName === 'compute') path.replaceWith(replacement);
        },
      },
    });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'transform',
              plugins: [
                upgrade('first-upgrade', 'compute2()'),
                upgrade('second-upgrade', 'compute3()'),
              ],
            },
          ],
        }),
      ),
    /owners: first-upgrade, second-upgrade/,
  );
});

test('sourceSlice returns a provenance-carrying fragment', () => {
  const source = 'const value = compute();\n';
  const guard = defineNativePlugin({
    name: 'guard-calls',
    prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
    visitor: {
      CallExpression(path) {
        const slice = path.context.sourceSlice(path.start, path.end);
        assert.throws(() => `${slice}`, /carries provenance/);
        assert.throws(() => path.context.sourceSlice(path.start, source.length + 1));
        path.replaceWith(path.context.code.template`guard(${slice})`);
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [guard] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = guard(compute());\n');
});

test('repeated copies of one range share a render and reflect inner edits', () => {
  const source = 'function seed() { return compute(); }\nalpha();\nbeta();\n';
  const mirror = defineNativePlugin({
    name: 'mirror',
    prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
    createState: () => ({ fragment: undefined as SourceFragment | undefined }),
    visitor: {
      Function(path, state) {
        state.fragment = path.getSource();
      },
      CallExpression(path, state) {
        if (path.node.calleeName !== 'compute' && state.fragment) {
          path.insertAfter(state.fragment);
        }
      },
    },
  });
  const rewrite = defineNativePlugin({
    name: 'rewrite',
    prepare: () => ({ fields: { CallExpression: ['calleeName'] } }),
    visitor: {
      CallExpression(path) {
        if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mirror, rewrite] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code.match(/compute2\(\)/g)?.length, 3);
  assert.ok(!result.code.includes('compute()'));
});

test('maps copied content back to its original tokens', () => {
  const source = 'function helper() { return VALUE; }\nlater();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-helper',
    visitor: {
      Function(path) {
        path.insertAfter(path.getSource());
      },
    },
  });
  const rename = defineNativePlugin({
    name: 'rename-value',
    prepare: () => ({ identifierNames: ['VALUE'], fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        if (path.node.name === 'VALUE')
          path.replaceWith({ code: 'WRAPPED', mapping: 'anchor-start', names: ['VALUE'] });
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [duplicate, rename] }] }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  const copyStart = result.code.indexOf('function helper', 1);
  const innerIdentifier = result.code.indexOf('WRAPPED', copyStart);
  assert.ok(copyStart > 0 && innerIdentifier > copyStart);
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  // The copy's interior maps to the same source tokens as the original.
  assert.deepEqual(originalPositionFor(map, { line: 1, column: copyStart }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: innerIdentifier }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('VALUE'),
    name: 'VALUE',
  });
});

test('output sections wrap the body: prefix outermost, prologue and body inserts inside', () => {
  const source = "'use strict';\nconst value = compute();\n";
  const wrapper = defineNativePlugin({
    name: 'wrapper',
    pre(context) {
      context.editor.prepend('(function () {\n');
      context.editor.append('})();\n');
    },
  });
  const helper = defineNativePlugin({
    name: 'helper',
    pre(context) {
      context.ensureHelper('helper/flag', 'var __flag = true;');
      context.editor.appendLeft(0, '/* head */');
      context.editor.appendRight(source.length, '/* tail */');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'wrap', plugins: [wrapper, helper] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    "(function () {\n/* head */'use strict';\nvar __flag = true;\nconst value = compute();\n/* tail */})();\n",
  );
});

test('relocates a range as piece reordering with contained edits composing', () => {
  const source = 'function util() { return value; }\nconst keep = 1;\n';
  const rangeEnd = source.indexOf('\n') + 1;
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, rangeEnd, source.length);
    },
  });
  const rename = defineNativePlugin({
    name: 'rename-value',
    prepare: () => ({ identifierNames: ['value'], fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        if (path.node.name === 'value') path.replaceWith('value_');
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, rename] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const keep = 1;\nfunction util() { return value_; }\n');
});

test('path.moveTo relocates a node and endpoint insertions stay behind', () => {
  const source = 'const hoisted = 1;\nconst rest = 2;\n';
  const mover = defineNativePlugin({
    name: 'hoister',
    prepare: () => ({ controlFlow: ['skip'] }),
    visitor: {
      VariableDeclaration(path) {
        if (path.start === 0) {
          path.moveTo(source.length);
          path.skip();
        }
      },
    },
  });
  const inserter = defineNativePlugin({
    name: 'inserter',
    pre(context) {
      // Strictly inside the moved range: moves with it.
      context.editor.appendLeft(source.indexOf('= 1'), '/* in */ ');
      // Exactly at the moved range's start boundary: stays behind.
      context.editor.appendLeft(0, '/* behind */');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, inserter] }] }),
  );
  assert.equal(result.status, 'complete');
  // The node range excludes its trailing newline, which stays behind with the
  // boundary insertion.
  assert.equal(result.code, '/* behind */\nconst rest = 2;\nconst hoisted /* in */ = 1;');
});

test('overlapping relocations fail loudly with both owners', () => {
  const source = 'const a = 1;\nconst b = 2;\nconst c = 3;\n';
  const makeMover = (name: string, start: number, end: number) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.editor.move(start, end, source.length);
      },
    });
  const result = () =>
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'transform',
            plugins: [makeMover('first-mover', 0, 26), makeMover('second-mover', 13, 39)],
          },
        ],
      }),
    );
  assert.throws(result, /overlapping moved ranges .*\(owners: first-mover, second-mover\)/);
});

test('relocation into a moved-away range fails loudly', () => {
  const source = 'const a = 1;\nconst b = 2;\nconst c = 3;\n';
  const away = defineNativePlugin({
    name: 'away',
    pre(context) {
      context.editor.move(0, 13, source.length);
    },
  });
  const into = defineNativePlugin({
    name: 'into',
    pre(context) {
      context.editor.move(13, 26, 6);
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [away, into] }] }),
      ),
    /lands inside moved range .*\(owners: into, away\)/,
  );
});

test('replacement covering the moved range and straddling edits fail loudly', () => {
  const source = 'const a = 1;\nconst b = 2;\n';
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, 13, source.length);
    },
  });
  const coverer = defineNativePlugin({
    name: 'coverer',
    pre(context) {
      context.editor.update(0, 13, 'replaced\n');
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, coverer] }] }),
      ),
    /(conflicts with covering edit|overlapping edits) .*\(owners: mover, coverer\)/,
  );
  const straddler = defineNativePlugin({
    name: 'straddler',
    pre(context) {
      context.editor.update(6, 20, 'straddle');
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, straddler] }] }),
      ),
    /moved range at 0\.\.13 is partially overlapped by edit at 6\.\.20 \(owners: mover, straddler\)/,
  );
});

test('removing and copying the same range is rejected toward move', () => {
  const source = 'function util() { return 1; }\nlater();\n';
  const oldSpelling = defineNativePlugin({
    name: 'old-spelling',
    visitor: {
      Function(path) {
        path.insertAfter(path.getSource());
        path.remove();
      },
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [oldSpelling] }] }),
      ),
    /copies removed range .*use editor\.move to relocate.*\(owners: old-spelling, old-spelling\)/,
  );
});

test('moved content keeps identity mappings and names to original tokens', () => {
  const source = 'function helper() { return VALUE; }\nlater();\n';
  const rangeEnd = source.indexOf('\n') + 1;
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, rangeEnd, source.length);
    },
  });
  const rename = defineNativePlugin({
    name: 'rename-value',
    prepare: () => ({ identifierNames: ['VALUE'], fields: { Identifier: ['name'] } }),
    visitor: {
      Identifier(path) {
        if (path.node.name === 'VALUE')
          path.replaceWith({ code: 'WRAPPED', mapping: 'anchor-start', names: ['VALUE'] });
      },
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, rename] }] }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'later();\nfunction helper() { return WRAPPED; }\n');
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
  assert.deepEqual(
    originalPositionFor(map, { line: 2, column: result.code.split('\n')[1]!.indexOf('WRAPPED') }),
    {
      source: 'fixture.js',
      line: 1,
      column: source.indexOf('VALUE'),
      name: 'VALUE',
    },
  );
});

test('conflict errors carry structured owners for telemetry', () => {
  const first = defineNativePlugin({
    name: 'first-writer',
    pre(context) {
      context.editor.update(0, 5, 'one');
    },
  });
  const second = defineNativePlugin({
    name: 'second-writer',
    pre(context) {
      context.editor.update(3, 8, 'two');
    },
  });
  try {
    transform(
      'const value = 1;',
      'fixture.js',
      defineNativePipeline({ phases: [{ name: 'edit', plugins: [first, second] }] }),
    );
    assert.fail('expected a conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.deepEqual(error.owners, ['first-writer', 'second-writer']);
  }
});

test('ensureReplace claims a range once under a shared intent key', () => {
  const source = "import { polyfill } from 'module';\nuse(polyfill);\n";
  const statementEnd = source.indexOf('\n');
  const makeClaimer = (name: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace(
          'shared/module-import',
          0,
          statementEnd,
          "const { polyfill } = require('module');",
        );
      },
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'edit', plugins: [makeClaimer('claimer-a'), makeClaimer('claimer-b')] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const { polyfill } = require('module');\nuse(polyfill);\n");
});

test('ensureReplace re-ensures are no-ops in later phases', () => {
  const source = 'const value = compute();\n';
  const makePhase = (name: string) => ({
    name,
    ...(name === 'two' ? { observes: 'rendered-source' as const } : {}),
    plugins: [
      defineNativePlugin({
        name: `${name}-claimer`,
        pre(context) {
          context.ensureReplace('shared/value', 6, 11, 'renamed');
        },
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [makePhase('one'), makePhase('two')] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamed = compute();\n');
});

test('ensureReplace rejects divergent content and divergent ranges loudly', () => {
  const source = 'const value = compute();\n';
  const claim = (name: string, start: number, end: number, code: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace('shared/value', start, end, code);
      },
    });
  try {
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'edit',
            plugins: [claim('int-a', 6, 11, 'renamed'), claim('int-b', 6, 11, 'other')],
          },
        ],
      }),
    );
    assert.fail('expected divergent content to conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.match(error.message, /replacement intent shared\/value realized different content/);
    assert.deepEqual(error.owners, ['int-b', 'int-a']);
  }
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'edit',
              plugins: [claim('int-a', 6, 11, 'renamed'), claim('int-b', 6, 12, 'renamed')],
            },
          ],
        }),
      ),
    /replacement intent shared\/value targets 6\.\.12 for int-b but 6\.\.11 for its first registrant int-a/,
  );
});

test('distinct ensureReplace keys on overlapping ranges stay ordinary conflicts', () => {
  const source = 'const value = compute();\n';
  const claim = (name: string, key: string, start: number, end: number) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace(key, start, end, 'x');
      },
    });
  try {
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          { name: 'edit', plugins: [claim('key-a', 'a', 0, 11), claim('key-b', 'b', 6, 16)] },
        ],
      }),
    );
    assert.fail('expected an overlap conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.match(error.message, /overlapping edits/);
    assert.deepEqual(error.owners, ['key-a', 'key-b']);
  }
});
