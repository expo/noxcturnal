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

test('runs ordered phases and reparses edited code', () => {
  const observations: unknown[] = [];
  const replace = defineNativePlugin({
    name: 'replace-number',
    visitors: [
      defineVisitor('NumericLiteral', { fields: ['value'] }, path => {
        if (path.node.value === 1) path.replaceWith('2');
      }),
    ],
  });
  const observe = defineNativePlugin({
    name: 'observe-number',
    contract: { metadata: { writes: ['observed'] } },
    visitors: [
      defineVisitor('NumericLiteral', { fields: ['value'] }, path => {
        observations.push(path.node.value);
        path.context.metadata.set('observed', path.node.value);
      }),
    ],
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
  const order: string[] = [];
  const plugin = defineNativePlugin<{ count: number }>({
    name: 'lifecycle',
    createState: () => ({ count: 0 }),
    pre(_context, state) {
      order.push('pre');
      state.count++;
    },
    visitors: [
      defineVisitor(
        'Function',
        {},
        {
          enter(_path, state) {
            order.push(`enter:${state.count}`);
          },
          exit() {
            order.push('exit');
          },
        },
      ),
    ],
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
    visitors: [
      defineVisitor('ReferencedIdentifier', { fields: ['name'] }, path => {
        seen.references.push(String(path.node.name));
      }),
      defineVisitor('MetaProperty', {}, path => {
        seen.meta.push(path.node.type);
      }),
      defineVisitor('FunctionDeclaration', { fields: ['name'] }, path => {
        seen.functionDeclarations.push(String(path.node.name));
      }),
      defineVisitor('FunctionExpression', {}, () => {
        seen.functionExpressions++;
      }),
      defineVisitor('ClassDeclaration', { fields: ['name'] }, path => {
        seen.classDeclarations.push(String(path.node.name));
      }),
      defineVisitor('ClassExpression', {}, () => {
        seen.classExpressions++;
      }),
    ],
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

test('projects declared names from named default declarations', () => {
  const names: Array<string | undefined> = [];
  const plugin = defineNativePlugin({
    name: 'default-declaration-names',
    visitors: [
      defineVisitor('ExportDefaultDeclaration', { fields: ['declaredName'] }, path => {
        names.push(path.node.declaredName);
      }),
    ],
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'names', plugins: [plugin] }] });
  for (const source of [
    'export default class Value {}',
    'export default function createValue() {}',
    'export default 1;',
  ]) {
    assert.equal(transform(source, 'fixture.js', pipeline).status, 'complete');
  }
  assert.deepEqual(names, ['Value', 'createValue', undefined]);
});

test('matches static member chains without traversing child objects', () => {
  const matches: string[] = [];
  const plugin = defineNativePlugin({
    name: 'member-patterns',
    visitors: [
      defineVisitor('MemberExpression', { fields: ['memberPath'] }, path => {
        if (path.matchesPattern('process.env.NODE_ENV')) matches.push(path.sourceText());
        if (path.matchesPattern('process.env', true)) matches.push(`partial:${path.sourceText()}`);
      }),
    ],
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
      visitors: [
        defineVisitor(
          'Function',
          {},
          {
            enter() {
              order.push(`${name}:enter`);
            },
            exit() {
              order.push(`${name}:exit`);
            },
          },
        ),
      ],
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
  const names: [string, boolean | undefined][] = [];
  const plugin = defineNativePlugin({
    name: 'targeted',
    visitors: [
      defineVisitor(
        'Function',
        {
          controlFlow: ['nested-traverse'],
          nested: [defineVisitor('Identifier', { fields: ['name', 'global'] }, () => {})],
        },
        path => {
          path.traverse([
            defineVisitor('Identifier', { fields: ['name', 'global'] }, identifier => {
              names.push([identifier.node.name, identifier.node.global]);
            }),
          ]);
        },
      ),
    ],
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
    visitors: [
      defineVisitor('ArrowFunctionExpression', { scope: true }, path => {
        const binding = path.scope.getBinding('outer');
        const program = path.scope.getProgramParent();
        let depth = 0;
        for (let scope = path.scope.parent; scope; scope = scope.parent) depth++;
        observations.push([binding?.name, binding?.scope === program, depth]);
      }),
    ],
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

test('caches queries by request identity without structural serialization', () => {
  const session = openRetained('globalValue', 'fixture.js');
  const request = { globals: [{ name: 'globalValue', references: true }] };
  const first = session.query(request);
  assert.equal(session.query(request), first);
  assert.notEqual(session.query({ globals: [{ name: 'globalValue', references: true }] }), first);
  session.close();
});

test('indexes source identifiers once for collision-free uid generation', () => {
  const session = new NativeTransformSession(
    'const _temp = 1; const _other2 = 2; /* _comment */',
    'fixture.js',
  );
  assert.equal(session.generateUid('temp'), '_temp2');
  assert.equal(session.generateUid('temp'), '_temp3');
  assert.equal(session.generateUid('other'), '_other');
  assert.equal(session.generateUid('comment'), '_comment2');
  session.close();

  const retained = openRetained('const _nox$existing = external;', 'fixture.js');
  assert.equal(retained.generateUid('temp'), '_temp');
  assert.equal(retained.generateUid('temp'), '_temp2');
  retained.close();
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
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('changed');
        path.unsupported('fixture');
      }),
    ],
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
    visitors: [defineVisitor('Program', {}, path => path.unsupported('test'))],
  });
  const pipeline = defineNativePipeline({
    phases: [{ name: 'source', plugins: [plugin] }],
  });
  assert.equal(pipelineCacheKey(pipeline, 'fixture.js'), pipelineCacheKey(pipeline, 'fixture.js'));
  const result = transform('const pristine = true', 'fixture.js', pipeline);
  assert.equal(result.status, 'bailout');
  assert.equal(result.source, 'const pristine = true');
});

test('keeps the absent preflight seam disabled and cache-visible only when declared', () => {
  const pipeline = defineNativePipeline({ phases: [{ name: 'source', plugins: [] }] });
  const source = 'const untouched = true;';
  const defaultKey = pipelineCacheKey(pipeline, 'fixture.js');

  assert.equal(defaultKey, pipelineCacheKey(pipeline, 'fixture.js', {}));
  assert.notEqual(defaultKey, pipelineCacheKey(pipeline, 'fixture.js', { preflight: {} }));
  assert.deepEqual(
    transform(source, 'fixture.js', pipeline),
    transform(source, 'fixture.js', pipeline, { preflight: {} }),
  );
});

test('creates immutable pipelines and reusable option-bound plugin definitions', () => {
  let observed: string | undefined;
  const definition = defineNativePlugin<undefined, { value: string }>({
    name: 'configured',
    visitors: [
      defineVisitor('Program', {}, () => {
        observed = 'visited';
      }),
    ],
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
  assert.equal(observed, 'visited');
  assert.equal(configured.options?.value, 'configured');
});

test('requires explicit pipeline phases', () => {
  const plugin = defineNativePlugin({
    name: 'concise',
    visitors: [
      defineVisitor('NumericLiteral', {}, path => {
        path.replaceWith('2');
      }),
    ],
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] });
  assert.equal(pipeline.phases[0].name, 'transform');
  const result = transform('const value = 1;', 'fixture.js', pipeline);
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 2;');
});

function definitionPipeline<State, Options, Analysis>(
  plugin: ReturnType<typeof defineNativePlugin<State, Options, Analysis>>,
): ReturnType<typeof defineNativePipeline> {
  return defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] });
}

test('rejects conflicting edits transactionally', () => {
  const plugin = (name: string) =>
    defineNativePlugin({
      name,
      visitors: [defineVisitor('Identifier', {}, path => path.replaceWith(name))],
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
    visitors: [
      defineVisitor('ImportDeclaration|ExportNamedDeclaration', {}, path =>
        seen.push(path.node.type),
      ),
    ],
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
    visitors: [defineVisitor('Expression', {}, path => seen.push(path.node.type))],
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
    visitors: [
      defineVisitor('Declaration', {}, path => {
        declarations.push(path.node.type);
      }),
      defineVisitor('Statement', {}, path => {
        statements.push(path.node.type);
      }),
    ],
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
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: 'parent' }, path => {
        parentType = path.parentPath?.node.type;
      }),
    ],
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
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: 'programParent' }, path => {
        ancestors = [
          path.findParent(parent => parent.node.type === 'ReturnStatement')?.node.type,
          path.getFunctionParent()?.node.type,
          path.getProgramParent()?.node.type,
        ];
      }),
    ],
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
    visitors: [
      defineVisitor('Identifier', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for undeclared ancestry.
        void path.parentPath;
      }),
    ],
  });
  const scope = defineNativePlugin({
    name: 'undeclared-scope',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for undeclared scope.
        void path.scope;
      }),
    ],
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

test('selects the phases a plugin runs in by inclusion and validates expression fragments natively', () => {
  const visited: string[] = [];
  const plugin = defineNativePlugin({
    name: 'phased',
    visitors: [
      defineVisitor('Program', {}, path => {
        visited.push(path.context.phase);
        assert.throws(
          () => path.context.code.parseExpression('value +'),
          /invalid expression fragment/,
        );
      }),
    ],
  });
  transform(
    'value',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [] },
        { name: 'second', plugins: [plugin] },
      ],
    }),
  );
  assert.deepEqual(visited, ['second']);
});

test('builds escaped primitive literals and validates statement fragments', () => {
  const plugin = defineNativePlugin({
    name: 'code-factory',
    visitors: [
      defineVisitor('Program', {}, path => {
        assert.equal(path.context.code.literal('quoted\nvalue').code, '"quoted\\nvalue"');
        assert.equal(path.context.code.literal(12n).code, '12n');
        path.appendToBody(
          path.context.code.parseStatements('\nexport const generated = null;').code,
        );
        assert.throws(
          () => path.context.code.parseStatements('export const ='),
          /invalid statement fragment/,
        );
      }),
    ],
  });
  const result = transform(
    'const original = true;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'generate', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const original = true;\nexport const generated = null;');
});

test('projects static call paths and their root globality without child or scope access', () => {
  const calls: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'static-call-facts',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['calleeName', 'calleePath', 'calleeGlobal'] },
        path => {
          calls.push({
            name: path.node.calleeName,
            path: path.node.calleePath,
            global: path.node.calleeGlobal,
          });
        },
      ),
    ],
  });
  transform(
    'require.resolveWeak("a"); function local(require){require.context("./b")} invoke();',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'calls', plugins: [plugin] }] }),
  );
  assert.deepEqual(calls, [
    { name: undefined, path: 'require.resolveWeak', global: true },
    { name: undefined, path: 'require.context', global: false },
    { name: 'invoke', path: 'invoke', global: true },
  ]);
});
