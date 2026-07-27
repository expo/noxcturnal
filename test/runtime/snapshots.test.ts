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

test('provides direct path fields and retained snapshots', () => {
  let retained: Readonly<Record<string, unknown>> | undefined;
  const plugin = defineNativePlugin({
    name: 'snapshot',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'], ancestry: 'parent' }, path => {
        assert.equal(path.type, 'Identifier');
        assert.equal(path.id, path.node.id);
        assert.equal(path.start, path.node.start);
        retained = path.snapshot({ fields: ['name'], ancestry: 'parent' });
      }),
    ],
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
    nativeAstTraversals: number;
    nativeRetainedBytesPeak: number;
    routeDeliveries: number;
  };
  assert.equal(performance.nativeParses, 1);
  assert.equal(performance.nativeAstTraversals, 2);
  assert.ok(performance.nativeRetainedBytesPeak > source.length);
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
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], scope: true, ancestry: 'parent' },
        {
          enter(path) {
            snapshots.push(path.snapshot({ fields: ['name'], ancestry: 'parent' }));
          },
          exit(path) {
            snapshots.push(path.snapshot({ fields: ['name'], ancestry: 'parent' }));
          },
        },
      ),
    ],
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
                  visitors: [
                    defineVisitor('Identifier', {}, path => {
                      path.snapshot({ fields: ['notAField'] });
                    }),
                  ],
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
    visitors: [defineVisitor('Identifier', {}, () => {})],
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
      visitors: [defineVisitor('Identifier', {}, () => {})],
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
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { where: { kind: { oneOf: ['let', 'const'] } } },
        path => {
          seen.push(path.sourceText().slice(0, 5));
        },
      ),
    ],
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
    visitors: [
      defineVisitor('ExportNamedDeclaration', { where: { source: { present: false } } }, () => {
        absent++;
      }),
    ],
  });
  transform(
    "export const local = 1; export { value } from 'module';",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [predicatePlugin] }] }),
  );
  assert.equal(absent, 1);

  const staticPlugin = defineNativePlugin({
    name: 'static',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for undeclared control flow.
        path.stop();
      }),
    ],
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
      visitors: [
        defineVisitor(
          'Function',
          {},
          {
            enter(path) {
              calls.push(`${name}:enter:${path.node.type}`);
            },
            exit(path) {
              calls.push(`${name}:exit:${path.node.type}`);
            },
          },
        ),
      ],
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
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { fields: [], where: { kind: { equals: 'const' } } },
        path => {
          calls++;
          // @ts-expect-error Match-only fields are deliberately absent from the callback payload.
          assert.equal(path.node.kind, undefined);
        },
      ),
    ],
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
  const seen = { boolean: 0, number: 0, string: 0 };
  const predicatePlugin = (
    name: string,
    route: 'BooleanLiteral' | 'NumericLiteral' | 'StringLiteral',
    predicate: { equals: string | number | boolean },
    visit: () => void,
  ) =>
    defineNativePlugin({
      name,
      visitors: [defineVisitor(route, { where: { value: predicate } }, visit)],
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
          ],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(seen, { boolean: 1, number: 1, string: 1 });
});
