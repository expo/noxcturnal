import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { native } from '../../native/binding';
import { packFieldRequests } from '../../protocol/edits';
import {
  decodeEventBatch,
  decodePackedEnvelope,
  decodeRoutedEnvelope,
  dispatchRoutedEvents,
} from '../../protocol/events';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../../runtime/session';
import { toNodeView } from '../../runtime/node-utils';

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

test('Program-only routing agrees with descendant traversal for counts, exits, and comments', () => {
  const source = '/* 😀 */ function outer(value) { /* inner */ return () => value; }';
  for (const sides of [['enter'], ['exit'], ['enter', 'exit']] as const) {
    const routes = sides.map((side, id) => ({
      id,
      pluginId: 0,
      nodeType: 'Program',
      side,
      order: 0,
      predicates: {},
      payloadFields: [],
      comments: 'inner' as const,
    }));
    const read = (descendants: boolean) => {
      const manifest = packRouteManifest(
        descendants
          ? [...routes, { ...routes[0], id: routes.length, nodeType: 'Identifier', side: 'enter' }]
          : routes,
        false,
        false,
      );
      const batch = decodeRoutedEnvelope(
        native.materializeRoutedBuffer(source, 'fixture.js', manifest),
      );
      const events: unknown[] = [];
      dispatchRoutedEvents(batch, [
        ...routes.map(() => (event: unknown) => events.push(structuredClone(event))),
        () => {},
      ]);
      return { count: batch.nodeCount, events };
    };
    const root = read(false);
    assert.ok(root.count > 10);
    assert.equal(root.events.length, sides.length);
    assert.deepEqual(root, read(true));
  }
});

test('packs only known field requests into the native request format', () => {
  assert.equal(packFieldRequests(), undefined);
  const packed = packFieldRequests({
    Identifier: ['name', 'unknown-field'],
    UnknownNode: ['name'],
  });
  assert.ok(packed);
  assert.equal(packed.length, 12);
  assert.notEqual(packed.readUInt32LE(0), 0);
  assert.equal(packed.readUInt32LE(4), 1);
  assert.notEqual(packed.readUInt32LE(8), 0);
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

test('rejects malformed child-role retention entries', () => {
  const invalidRole = packRouteManifest([], false, false, 0, {
    VariableDeclarator: ['id'],
  });
  invalidRole.writeUInt32LE(0, 10 * 4);
  assert.throws(
    () => new native.NativeIndexedSession('let value;', 'fixture.js', invalidRole),
    /invalid child role id/,
  );

  const wildcardConflict = packRouteManifest([], false, false, 0, {
    VariableDeclarator: ['id'],
  });
  wildcardConflict.writeUInt32LE(1, 8 * 4);
  assert.throws(
    () => new native.NativeIndexedSession('let value;', 'fixture.js', wildcardConflict),
    /invalid child retention plan/,
  );
});

test('named roles retain fewer edges and no implicit scalar payload', () => {
  const source = 'let retained = initializer;';
  const open = (roles: readonly string[]) =>
    new NativeTransformSession(
      source,
      'fixture.js',
      {},
      packRouteManifest([], false, false, 1 << 3, { VariableDeclarator: roles }),
    );
  const named = open(['id']);
  const wildcard = open(['*']);
  const namedSummary = named.retentionDebugSummary();
  const wildcardSummary = wildcard.retentionDebugSummary();
  named.close();
  wildcard.close();
  assert.equal(namedSummary.retainedEdgeCount, 1);
  assert.equal(wildcardSummary.retainedEdgeCount, 2);
  assert.equal(namedSummary.scalarFieldWordCount, 0);
  assert.equal(namedSummary.scalarStringCount, 0);
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
  const session = new native.NativeIndexedSession(source, 'fixture.js', manifest, manifest);
  const first = session.nextRoutedPacked(manifest);
  const second = session.nextRoutedPacked(manifest);
  assert.deepEqual(first, expected);
  assert.deepEqual(second, expected);
  session.close();
});

test('emits declaration-name metadata only when explicitly requested', () => {
  const source = 'export default async function*/* anchor */() {}';
  const route = (payloadFields: readonly ('declarationNameAnchor' | 'declarationNamePrefix')[]) =>
    packRouteManifest(
      [
        {
          id: 0,
          pluginId: 0,
          nodeType: 'Function',
          side: 'enter' as const,
          order: 0,
          predicates: {},
          payloadFields,
        },
      ],
      false,
      false,
    );
  const read = (manifest: Buffer) => {
    const batch = decodeRoutedEnvelope(
      native.materializeRoutedBuffer(source, 'fixture.js', manifest),
    );
    let event: Record<string, unknown> | undefined;
    dispatchRoutedEvents(batch, [value => (event = value as unknown as Record<string, unknown>)]);
    return { batch, event: event! };
  };

  const absent = read(route([]));
  assert.equal(absent.event.declarationNameAnchor, undefined);
  assert.equal(absent.event.declarationNamePrefix, undefined);

  const requestedManifest = route(['declarationNameAnchor', 'declarationNamePrefix']);
  const requested = read(requestedManifest);
  assert.equal(requested.event.declarationNameAnchor, source.indexOf('*') + 1);
  assert.equal(requested.event.declarationNamePrefix, true);
  assert.ok(requested.batch.recordBytes > absent.batch.recordBytes);
  assert.notDeepEqual(requestedManifest, route([]));
});

test('joins and encodes parsed comments only for routes that demand them', () => {
  const source = `/* outside */ import(/* first */ 'pkg' // second\n); /* after */`;
  const route = (comments?: 'inner') =>
    packRouteManifest(
      [
        {
          id: 0,
          pluginId: 0,
          nodeType: 'ImportExpression',
          side: 'enter',
          order: 0,
          predicates: {},
          payloadFields: [],
          comments,
        },
      ],
      false,
      false,
    );
  const read = (manifest: Buffer) => {
    const batch = decodeRoutedEnvelope(
      native.materializeRoutedBuffer(source, 'fixture.js', manifest),
    );
    let event: Parameters<Parameters<typeof dispatchRoutedEvents>[1][number]>[0] | undefined;
    dispatchRoutedEvents(batch, [value => (event = value)]);
    return { batch, event: event! };
  };
  const absent = read(route());
  assert.equal(absent.batch.includeComments, false);
  assert.equal(absent.event.comments, undefined);

  const requested = read(route('inner'));
  assert.equal(requested.batch.includeComments, true);
  assert.deepEqual(
    requested.event.comments?.map(comment => [comment.kind, comment.value]),
    [
      ['block', ' first '],
      ['line', ' second'],
    ],
  );
  assert.ok(requested.batch.recordBytes > absent.batch.recordBytes);
  assert.ok(requested.batch.stringSlabBytes > absent.batch.stringSlabBytes);
});

test('serializes a shared hydrated ancestor once rather than once per routed descendant', () => {
  const callCount = 256;
  const source = `const owner = [${Array.from({ length: callCount }, () => 'create()').join(',')}];`;
  const manifest = packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        nodeType: 'CallExpression',
        side: 'enter',
        order: 0,
        predicates: {},
        payloadFields: [],
      },
    ],
    true,
    false,
    0,
    {},
    { VariableDeclarator: ['bindingName'] },
    { VariableDeclarator: ['bindingName'] },
    ['VariableDeclarator'],
    [],
    Number.POSITIVE_INFINITY,
  );
  const session = new native.NativeIndexedSession(source, 'fixture.js', manifest, manifest);
  const batch = decodeRoutedEnvelope(session.nextRoutedPacked(manifest));
  session.close();
  assert.equal(batch.routeDeliveryCount, callCount);
  assert.equal(batch.nodeRecordCount, callCount + 1);

  const summaryManifest = packRouteManifest(
    [
      {
        id: 0,
        pluginId: 0,
        nodeType: 'CallExpression',
        side: 'enter',
        order: 0,
        predicates: {},
        payloadFields: [],
      },
    ],
    true,
    false,
    0,
    {},
    {},
    {},
    [],
    [],
    Number.POSITIVE_INFINITY,
  );
  const summarySession = new native.NativeIndexedSession(
    source,
    'fixture.js',
    summaryManifest,
    summaryManifest,
  );
  const summaryBatch = decodeRoutedEnvelope(summarySession.nextRoutedPacked(summaryManifest));
  summarySession.close();
  assert.equal(summaryBatch.nodeRecordCount, callCount);
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
    syntaxManifest,
    syntaxManifest,
    true,
  );
  const semantic = new native.NativeIndexedSession(
    source,
    'fixture.js',
    semanticManifest,
    semanticManifest,
    true,
  );
  const syntaxBatch = decodeRoutedEnvelope(syntax.nextRoutedPacked(syntaxManifest));
  const semanticBatch = decodeRoutedEnvelope(semantic.nextRoutedPacked(semanticManifest));
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
        defineVisitor('Identifier', { ancestry: { mode: 'parent' } }, path => {
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
    packRouteManifest([], false, false, 1 << 1),
    undefined,
    true,
  );
  assert.ok(constants.queryConstants([...Array(32).keys()]).length > 0);
  constants.close();

  const calls = new native.NativeIndexedSession(
    source,
    'fixture.js',
    packRouteManifest([], false, false, 1 << 2),
    undefined,
    true,
  );
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
        { ancestry: { mode: 'parent' }, controlFlow: ['nested-traverse'] },
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

test('classifies exact member-expression mutation targets', () => {
  const visits: Array<[string, string | undefined, boolean]> = [];
  const plugin = defineNativePlugin({
    name: 'member-write-fields',
    visitors: [
      defineVisitor('MemberExpression', { fields: ['memberPath', 'write'] }, path => {
        visits.push([path.node.type, path.node.memberPath, path.node.write]);
      }),
    ],
  });
  const source = `
    process.env.READ;
    process.env.A = value;
    process.env.B += value;
    process.env.C ||= value;
    process.env.D++;
    ++process.env.E;
    delete (process.env.F);
    ({ value: process.env.G, [process.env.KEY]: target } = source);
    [process.env.H] = source;
    for (process.env.I in source) {}
    for (process.env.J of source) {}
    (process.env.K as any) = value;
    (process.env.L satisfies any) = value;
    process.env.M! = value;
    (<any>process.env.N) = value;
    [process.env.O = fallback, ...process.env.P] = source;
    process.env['COMPUTED'] = value;
    delete process?.env.OPTIONAL;
    delete process?.env['OPTIONAL_COMPUTED'];
    process?.env.OPTIONAL_READ;
    process.env.NESTED.value = value;
    class Example { #value = 0; update() { this.#value++; } }
  `;
  const result = transform(
    source,
    'fixture.ts',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');

  const byPath = new Map<string, boolean[]>();
  for (const [, memberPath, write] of visits) {
    if (!memberPath) continue;
    const writes = byPath.get(memberPath);
    if (writes) writes.push(write);
    else byPath.set(memberPath, [write]);
  }
  assert.deepEqual(byPath.get('process.env.READ'), [false]);
  for (const name of [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'COMPUTED',
    'OPTIONAL',
    'OPTIONAL_COMPUTED',
  ]) {
    assert.deepEqual(byPath.get(`process.env.${name}`), [true], name);
  }
  assert.deepEqual(byPath.get('process.env.KEY'), [false]);
  assert.deepEqual(byPath.get('process.env.OPTIONAL_READ'), [false]);
  assert.deepEqual(byPath.get('process.env.NESTED'), [false]);
  assert.deepEqual(byPath.get('process.env.NESTED.value'), [true]);
  assert.ok(
    visits.some(
      ([type, memberPath, write]) =>
        type === 'PrivateFieldExpression' && memberPath == null && write,
    ),
  );
});

test('retains correct member writes when broad field retention is enabled', () => {
  const session = openRetained('process.env.READ; process.env.WRITE = value;', 'fixture.js');
  const members = session.nodes(['StaticMemberExpression']);
  const writes = members
    .filter(
      member =>
        member.memberPath === 'process.env.READ' || member.memberPath === 'process.env.WRITE',
    )
    .map(member => [member.memberPath, member.write]);
  session.close();
  assert.deepEqual(writes, [
    ['process.env.READ', false],
    ['process.env.WRITE', true],
  ]);
});

test('does not retain scalar payload merely because a node is a structural child', () => {
  const route = {
    id: 0,
    pluginId: 0,
    nodeType: 'AssignmentExpression',
    side: 'enter' as const,
    order: 0,
    predicates: {},
    payloadFields: [],
  };
  const manifest = packRouteManifest([route], false, false, 0, {
    AssignmentExpression: ['*'],
  });
  const session = new NativeTransformSession(
    'process.env.WRITE = value;',
    'fixture.js',
    {},
    manifest,
  );
  const member = session
    .nodes(['StaticMemberExpression'])
    .find(node => node.type === 'StaticMemberExpression');
  session.close();
  assert.equal(member?.memberPath, undefined);
  assert.equal(member?.write, undefined);
});

test('matches member write predicates without delivering the field', () => {
  const reads: Array<[string, string | undefined]> = [];
  const plugin = defineNativePlugin({
    name: 'member-write-predicate',
    visitors: [
      defineVisitor(
        'MemberExpression',
        { fields: ['memberPath'], where: { write: { equals: false } } },
        path => reads.push([path.node.type, path.node.memberPath]),
      ),
    ],
  });
  const result = transform(
    `
      process.env.READ;
      process.env.WRITE = value;
      process.env['COMPUTED_READ'];
      process.env['COMPUTED_WRITE'] = value;
      class Example { #value; read() { return this.#value; } write() { this.#value++; } }
    `,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.ok(reads.some(([, path]) => path === 'process.env.READ'));
  assert.ok(!reads.some(([, path]) => path === 'process.env.WRITE'));
  assert.ok(reads.some(([, path]) => path === 'process.env.COMPUTED_READ'));
  assert.ok(!reads.some(([, path]) => path === 'process.env.COMPUTED_WRITE'));
  assert.equal(reads.filter(([type]) => type === 'PrivateFieldExpression').length, 1);
});

test('matches static member paths structurally without materializing predicate strings', () => {
  const matched: string[] = [];
  const plugin = defineNativePlugin({
    name: 'structural-member-path-predicate',
    visitors: [
      defineVisitor(
        'StaticMemberExpression|ComputedMemberExpression',
        {
          fields: ['property'],
          where: {
            memberPath: {
              oneOf: ['process.env.STATIC', 'process.env.COMPUTED', 'process.env.DOTTED'],
            },
            write: { equals: false },
          },
        },
        path => matched.push(path.node.property ?? ''),
      ),
    ],
  });
  const result = transform(
    `
      process.env.STATIC;
      process.env['COMPUTED'];
      process['env.DOTTED'];
      process.env.OTHER;
      process.env.STATIC = value;
    `,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'main', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(matched, ['STATIC', 'COMPUTED']);
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

test('retained child, inspection and node responses use independent local string tables', () => {
  const values = ['雪😀', '', '\ud800', '\0value'];
  const manifest = packRouteManifest(
    [],
    true,
    true,
    1 << 3,
    { VariableDeclarator: ['init'] },
    { VariableDeclarator: ['bindingName'], StringLiteral: ['value'] },
  );
  let expectedBytes: number | undefined;
  for (const size of [32, 64, 128]) {
    const source =
      Array.from({ length: size }, (_, i) => `const noise${i} = "unrelated${i}";`).join('') +
      values.map((value, i) => `const selected${i} = ${JSON.stringify(value)};`).join('');
    const session = new native.NativeIndexedSession(source, 'fixture.js', manifest);
    const decode = (buffer: Buffer) =>
      decodeEventBatch(decodePackedEnvelope(buffer)).events.map(toNodeView);
    try {
      const parents = decode(session.queryNodesPackedBuffer(['VariableDeclarator'])).filter(event =>
        String(event.bindingName).startsWith('selected'),
      );
      const children = session.childrenPackedBuffer(
        parents.map(event => event.id),
        [],
        [],
      );
      assert.equal(children.events.readUInt32LE(8), values.length);
      assert.deepEqual(
        decode(children.events).map(event => event.value),
        values,
      );
      if (expectedBytes != null) assert.equal(children.events.length, expectedBytes);
      expectedBytes = children.events.length;
      const events = decode(children.events);
      for (const expected of [...events].reverse()) {
        const id = expected.id;
        const response = session.inspectPackedBuffer([id]);
        assert.equal(response.readUInt32LE(8), 1);
        const event = decode(response)[0];
        assert.deepEqual(event, expected);
        assert.deepEqual(decode(session.inspectPackedBuffer([id])), [event]);
      }
      for (const empty of [
        session.inspectPackedBuffer([]),
        session.queryNodesPackedBuffer(['RegExpLiteral']),
        session.childrenPackedBuffer([], [], []).events,
      ]) {
        assert.equal(empty.length, 16);
        assert.equal(empty.readUInt32LE(8), 0);
      }
    } finally {
      session.close();
    }
    assert.throws(() => session.inspectPackedBuffer([]), /session-closed/);
  }
});
