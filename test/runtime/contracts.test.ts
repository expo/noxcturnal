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

test('typed visitors compile contracts locally and narrow the payload', () => {
  const source = 'let a = 1; const b = 2; var c = 3;';
  const kinds: unknown[] = [];
  const declaration = defineVisitor(
    'VariableDeclaration',
    { fields: ['kind'], where: { kind: { oneOf: ['let', 'const'] } } },
    path => {
      kinds.push(path.node.kind);
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [declaration] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(kinds.sort(), ['const', 'let']);
});

test('typed visitor match-only predicate fields are not callback-visible', () => {
  const source = 'const value = 1;';
  let observedKind: unknown = 'unset';
  const declaration = defineVisitor(
    'VariableDeclaration',
    { where: { kind: { equals: 'const' } } },
    path => {
      observedKind = (path.node as unknown as Record<string, unknown>).kind;
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [declaration] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(observedKind, undefined);
});

test('typed visitor capabilities are contract-scoped, not plugin-wide', () => {
  const source = 'const value = compute();';
  let scopedOk = false;
  let unscopedError: Error | null = null;
  const scoped = defineVisitor('VariableDeclaration', { scope: true }, path => {
    scopedOk = (path as { scope: { getBinding(name: string): unknown } }).scope != null;
  });
  const unscoped = defineVisitor('CallExpression', {}, path => {
    try {
      void (path as unknown as { scope: unknown }).scope;
    } catch (error) {
      unscopedError = error as Error;
    }
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'typed', visitors: [scoped, unscoped] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.ok(scopedOk);
  assert.match(String(unscopedError), /undeclared scope access|scope/);
});

test('typed visitors reject undeclared control flow at the exact route', () => {
  const source = 'const value = 1;';
  const undeclared = defineVisitor('VariableDeclaration', {}, path => {
    (path as unknown as { skip(): void }).skip();
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'scan',
              plugins: [defineNativePlugin({ name: 'typed', visitors: [undeclared] })],
            },
          ],
        }),
      ),
    /typed: undeclared control-flow capability skip/,
  );
});

test('two typed visitors on one route keep independent predicates', () => {
  const source = "require('./a'); importAll('./b', './c'); other();";
  const requires: string[] = [];
  const contexts: number[] = [];
  const plainRequire = defineVisitor(
    'CallExpression',
    { fields: ['staticArgument'], where: { calleeName: { equals: 'require' } } },
    path => {
      requires.push(String(path.node.staticArgument));
    },
  );
  const contextRequire = defineVisitor(
    'CallExpression',
    { fields: ['argumentCount'], where: { calleeName: { equals: 'importAll' } } },
    path => {
      contexts.push(Number(path.node.argumentCount));
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [
            defineNativePlugin({ name: 'typed', visitors: [plainRequire, contextRequire] }),
          ],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(requires, ['./a']);
  assert.deepEqual(contexts, [2]);
});

test('configure resolves enablement and predicate values per file', () => {
  const seen: string[] = [];
  const defines = defineVisitor(
    'Identifier',
    {
      fields: ['name'],
      configure: () => ({ enabled: true, where: { name: { oneOf: ['__DEV__'] } } }),
    },
    path => {
      seen.push(String(path.node.name));
    },
  );
  const disabled = defineVisitor(
    'Identifier',
    { fields: ['name'], configure: () => ({ enabled: false }) },
    path => {
      seen.push(`disabled:${String(path.node.name)}`);
    },
  );
  const result = transform(
    'const flag = __DEV__ && other;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'typed', visitors: [defines, disabled] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(seen, ['__DEV__']);
});

test('typed enter and exit handlers share one contract and reverse exits', () => {
  const order: string[] = [];
  const fn = defineVisitor(
    'Function',
    {},
    {
      enter(path) {
        order.push(`enter:${path.start}`);
      },
      exit(path) {
        order.push(`exit:${path.start}`);
      },
    },
  );
  const result = transform(
    'function outer() { function inner() {} }',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [fn] })] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(order, ['enter:0', 'enter:19', 'exit:19', 'exit:0']);
});

test('typed plugins reject aggregate route plans and mixed visitor forms', () => {
  assert.throws(
    () =>
      defineNativePlugin({
        name: 'mixed',
        visitor: { Identifier() {} },
      } as never),
    /the visitor-object form was removed/,
  );
  const plugin = defineNativePlugin({
    name: 'typed',
    // @ts-expect-error This test verifies that legacy prepare-time field plans are rejected.
    prepare: () => ({ fields: { Identifier: ['name'] } }),
    visitors: [defineVisitor('Identifier', {}, () => {})],
  });
  assert.throws(
    () =>
      transform(
        'const value = 1;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      ),
    /typed: prepare\(\) may not declare fields; route requirements live on visitor contracts/,
  );
});

test('typed children access declared roles with prefetched fields', () => {
  const locals: string[] = [];
  const imports = defineVisitor(
    'ImportDeclaration',
    {
      fields: ['source'],
      children: { specifiers: { route: 'ImportSpecifier', fields: ['local', 'imported'] } },
    },
    path => {
      for (const specifier of path.getChildList('specifiers'))
        locals.push(String((specifier.node as unknown as Record<string, unknown>).local));
    },
  );
  const undeclaredRole = defineVisitor(
    'ImportDeclaration',
    { children: { specifiers: { route: 'ImportSpecifier' } } },
    path => {
      assert.throws(
        () =>
          (path as unknown as { getChildList(role: string): unknown }).getChildList('assertions'),
        /undeclared child access|child/,
      );
    },
  );
  const result = transform(
    "import { one, two } from 'module';",
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'typed', visitors: [imports, undeclaredRole] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(locals, ['one', 'two']);
});

test('typed nested traversal includes arrow functions through the Function alias', () => {
  const found: string[] = [];
  const outer = defineVisitor('Program', { controlFlow: ['nested-traverse'], fields: [] }, path => {
    path.traverse([
      defineVisitor('Function', {}, fn => {
        found.push(fn.type);
      }),
    ]);
  });
  const result = transform(
    'function named() {} const arrow = () => {};',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [outer] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(found.sort(), ['ArrowFunctionExpression', 'Function']);
});

test('plugin contracts type and union metadata and query requirements', () => {
  const plugin = defineNativePlugin({
    name: 'contracted',
    contract: {
      metadata: { writes: ['dependencies'] },
      queries: [{ calls: [{ callee: 'require', staticArguments: true }] }],
    },
    post(context) {
      const calls = context.query({ calls: [{ callee: 'require', staticArguments: true }] });
      context.metadata.set(
        'dependencies',
        calls.calls.require?.map(call => call.staticArgument) ?? [],
      );
    },
  });
  const result = transform(
    "require('./a'); require('./b');",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.metadata.dependencies, ['./a', './b']);
});

test('verifyVisitorContracts reports undeclared reads and unused declarations', () => {
  const visitor = defineVisitor(
    'VariableDeclaration',
    { fields: ['declarationCount'], scope: true },
    path => {
      // Reads an undeclared field (silently undefined) and never uses scope or
      // the declared declarationCount.
      void (path.node as unknown as Record<string, unknown>).kind;
    },
  );
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'verified', visitors: [visitor] })] },
      ],
    }),
    { verifyVisitorContracts: true },
  );
  assert.equal(result.status, 'complete');
  const messages = result.diagnostics
    .filter(diagnostic => diagnostic.code === 'visitor-contract')
    .map(diagnostic => diagnostic.message);
  assert.ok(
    messages.some(message => /read undeclared field kind.*fields: \['kind'\]/.test(message)),
    messages.join('\n'),
  );
  assert.ok(
    messages.some(message => /declared field declarationCount but never read it/.test(message)),
  );
  assert.ok(messages.some(message => /declared scope but never used it/.test(message)));
});

test('verification is silent for clean contracts and off by default', () => {
  const visitor = defineVisitor('VariableDeclaration', { fields: ['kind'] }, path => {
    void path.node.kind;
  });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'scan', plugins: [defineNativePlugin({ name: 'clean', visitors: [visitor] })] },
    ],
  });
  const verified = transform('const value = 1;', 'fixture.js', pipeline, {
    verifyVisitorContracts: true,
  });
  assert.equal(verified.status, 'complete');
  assert.deepEqual(
    verified.diagnostics.filter(diagnostic => diagnostic.code === 'visitor-contract'),
    [],
  );
  const production = transform('const value = 1;', 'fixture.js', pipeline);
  assert.equal(production.status, 'complete');
  assert.deepEqual(production.diagnostics, []);
});
