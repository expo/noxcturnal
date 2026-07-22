import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import {
  classify,
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformSession,
  nativeVersion,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformOrFallback,
} from '../dist/index.js';

test('loads the Noxcturnal binding and classifies parser routes', () => {
  assert.match(nativeVersion(), /^0\.1\.0/);
  assert.deepEqual(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');
  assert.equal(classify('fixture.js', '// @flow\nconst x: number = 1').supported, false);
});

test('materializes arbitrary subscriptions without a complete ESTree', () => {
  const session = NativeTransformSession.open(`const answer = foo('value')`, 'fixture.js');
  const identifiers = session.next(['Identifier']);
  assert.ok(identifiers.nodeCount > identifiers.emittedCount / 2);
  assert.ok(identifiers.events.every(event => event.type === 'Identifier'));
  assert.ok(identifiers.events.some(event => event.fields.some(field => field.key === 'name' && field.value === 'foo')));
  session.close();
  assert.throws(() => session.next(['Program']), /session-closed/);
});

test('materializes complete compact call payloads on the stateless packed path', () => {
  const session = new NativeTransformSession("require('value')", 'fixture.js', {}, ['CallExpression']);
  const [call, callExit] = session.next(['CallExpression']).events;
  assert.deepEqual(Object.fromEntries(call.fields.map(field => [field.key, field.value])), {
    optional: false, argumentCount: 1, calleeName: 'require', calleeGlobal: true, staticArgument: 'value',
  });
  assert.equal(callExit.side, 'exit');
  assert.deepEqual(callExit.fields, call.fields);
  session.close();
});

test('exposes common scalar discriminants without child-tree transfer', () => {
  const session = NativeTransformSession.open('const value = { platform: 1 }; value.total += -2;', 'fixture.js');
  const events = session.next(['ObjectProperty', 'AssignmentExpression', 'UnaryExpression'], undefined, undefined, false).events;
  const property = events.find(event => event.type === 'ObjectProperty')!;
  assert.deepEqual(Object.fromEntries(property.fields.map(field => [field.key, field.value])), { kind: 'init', computed: false, method: false, shorthand: false, key: 'platform' });
  assert.equal(events.find(event => event.type === 'AssignmentExpression')!.fields.find(field => field.key === 'operator')?.value, '+=');
  assert.equal(events.find(event => event.type === 'UnaryExpression')!.fields.find(field => field.key === 'operator')?.value, '-');
  session.close();
});

test('keeps direct packed fields equivalent to retained event fields', () => {
  const source = `"use strict";
    import base, { named as local } from 'pkg';
    export const value = local + 2;
    const emoji = '😀';
    let target = base.member;
    target += -1;
    target++;
    const object = { target };
    new Factory('value');
    import.meta;
    function *generate() { yield *target; }
    const arrow = () => object;
    class Example {}
    export { target };
  `;
  const subscriptions = [
    'Identifier', 'StringLiteral', 'NumericLiteral', 'BinaryExpression',
    'AssignmentExpression', 'UnaryExpression', 'UpdateExpression', 'NewExpression',
    'StaticMemberExpression', 'ImportDeclaration', 'ExportNamedDeclaration',
    'VariableDeclaration', 'VariableDeclarator', 'Directive', 'YieldExpression',
    'MetaProperty', 'ObjectProperty', 'Function', 'ArrowFunctionExpression', 'Class',
    'ImportSpecifier', 'ImportDefaultSpecifier', 'ExportSpecifier',
  ];
  const retained = NativeTransformSession.open(source, 'fixture.js');
  const direct = new NativeTransformSession(source, 'fixture.js', {}, subscriptions);
  const normalize = (session: NativeTransformSession) => session
    .next(subscriptions, undefined, undefined, false)
    .events
    .map(({ sequence: _sequence, ...event }) => ({
      ...event,
      fields: Object.fromEntries(event.fields.map(field => [field.key, field.value])),
    }));
  assert.deepEqual(normalize(direct), normalize(retained));
  direct.close();
  retained.close();
});

test('retains materially less native event memory for narrow plans', () => {
  const source = Array.from({ length: 200 }, (_, index) => `export const value${index} = source${index} + ${index};`).join('\n');
  const narrow = NativeTransformSession.open(source, 'fixture.js');
  narrow.next(['Identifier']);
  const broad = NativeTransformSession.open(source, 'fixture.js');
  broad.next(['*']);
  assert.ok(narrow.nativeMemoryBytes < broad.nativeMemoryBytes * 0.6);
  narrow.close();
  broad.close();
});

test('runs ordered phases and reparses edited code', () => {
  const observations = [];
  const replace = defineNativePlugin({
    name: 'replace-number', apiVersion: 1,
    visitor: { NumericLiteral(path) { if (path.node.value === 1) path.replaceWith('2'); } },
  });
  const observe = defineNativePlugin({
    name: 'observe-number', apiVersion: 1,
    prepare() { return { metadataWrites: ['observed'] }; },
    visitor: { NumericLiteral(path) { observations.push(path.node.value); path.context.metadata.set('observed', path.node.value); } },
  });
  const result = transform('export const value = 1;', 'fixture.js', defineNativePipeline({
    apiVersion: 1,
    phases: [
      { name: 'rewrite', plugins: [replace], reparseAfterEdits: true },
      { name: 'analyze', plugins: [observe] },
    ],
  }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'export const value = 2;');
  assert.deepEqual(observations, [2]);
  assert.equal(result.metadata.observed, 2);
  assert.ok(result.map.mappings.length > 0);
});

test('supports aliases, enter/exit order, state, skip, and stop', () => {
  const order = [];
  const plugin = defineNativePlugin({
    name: 'lifecycle', apiVersion: 1,
    createState: () => ({ count: 0 }),
    pre(_context, state) { order.push('pre'); state.count++; },
    visitor: {
      Function: { enter(_path, state) { order.push(`enter:${state.count}`); }, exit() { order.push('exit'); } },
    },
    post() { order.push('post'); },
    cleanup(reason) { order.push(`cleanup:${reason}`); },
  });
  const result = transform('function example() { return 1 }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.deepEqual(order, ['pre', 'enter:1', 'exit', 'post', 'cleanup:complete']);
});

test('routes Babel-compatible semantic and collapsed Oxc visitor keys', () => {
  const seen = { references: [] as string[], meta: [] as string[], functionDeclarations: [] as string[], functionExpressions: 0, classDeclarations: [] as string[], classExpressions: 0 };
  const plugin = defineNativePlugin({ name: 'babel-routes', apiVersion: 1, visitor: {
    ReferencedIdentifier(path) { seen.references.push(String(path.node.name)); },
    MetaProperty(path) { seen.meta.push(path.node.type); },
    FunctionDeclaration(path) { seen.functionDeclarations.push(String(path.node.name)); },
    FunctionExpression() { seen.functionExpressions++; },
    ClassDeclaration(path) { seen.classDeclarations.push(String(path.node.name)); },
    ClassExpression() { seen.classExpressions++; },
  } });
  transform('const local = globalValue; use(local); function declared() {} const expression = function () {}; class Declared {} const ClassExpressionValue = class {}; import.meta; function target() { return new.target }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'routes', plugins: [plugin] }] }));
  assert.deepEqual(seen.references, ['globalValue', 'use', 'local']);
  assert.deepEqual(seen.meta, ['ImportMeta', 'NewTarget']);
  assert.deepEqual(seen.functionDeclarations, ['declared', 'target']);
  assert.equal(seen.functionExpressions, 1);
  assert.deepEqual(seen.classDeclarations, ['Declared']);
  assert.equal(seen.classExpressions, 1);
});

test('matches static member chains without traversing child objects', () => {
  const matches: string[] = [];
  const plugin = defineNativePlugin({ name: 'member-patterns', apiVersion: 1, visitor: { MemberExpression(path) {
    if (path.matchesPattern('process.env.NODE_ENV')) matches.push(path.getSource());
    if (path.matchesPattern('process.env', true)) matches.push(`partial:${path.getSource()}`);
  } } });
  transform("process.env.NODE_ENV; process['env'].EXPO_PUBLIC_VALUE; process[key].dynamic", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'match', plugins: [plugin] }] }));
  assert.deepEqual(matches, ['process.env.NODE_ENV', 'partial:process.env.NODE_ENV', 'partial:process.env', "partial:process['env'].EXPO_PUBLIC_VALUE", "partial:process['env']"]);
});

test('orders multiple plugins forward on enter and in reverse on exit', () => {
  const order: string[] = [];
  const plugin = (name: string) => defineNativePlugin({
    name, apiVersion: 1 as const,
    visitor: { Function: { enter() { order.push(`${name}:enter`); }, exit() { order.push(`${name}:exit`); } } },
  });
  transform('function fixture() {}', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin('a'), plugin('b')] }] }));
  assert.deepEqual(order, ['a:enter', 'b:enter', 'b:exit', 'a:exit']);
});

test('supports targeted nested traversal and semantic global queries', () => {
  const names = [];
  const plugin = defineNativePlugin({
    name: 'targeted', apiVersion: 1,
    visitor: {
      Function(path) {
        path.traverse({ Identifier(identifier) { names.push([identifier.node.name, identifier.node.global]); } });
      },
    },
  });
  const result = transform('const outside = 1; function f(local) { return local + external }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.ok(names.some(([name, global]) => name === 'external' && global === true));
  assert.ok(!names.some(([name]) => name === 'outside'));
});

test('resolves bindings through identifier-free intermediate scopes', () => {
  const observations: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'complete-scope-tree', apiVersion: 1,
    prepare() { return { semantics: ['scope'] }; },
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
  transform('const outer = 1; { { (() => outer); } }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'scope', plugins: [plugin] }] }));
  assert.deepEqual(observations, [['outer', true, 3]]);
});

test('executes coarse global queries and targeted inspection', () => {
  const session = NativeTransformSession.open('globalValue + (() => { const globalValue = 1; return globalValue })()', 'fixture.js');
  const query = session.query({ globals: [{ name: 'globalValue', references: true }] });
  assert.equal(query.globals.globalValue.references.length, 1);
  const [reference] = query.globals.globalValue.references;
  const [inspected] = session.inspect([{ nodeId: reference.id, fields: ['name', 'global'] }]);
  assert.equal(inspected.name, 'globalValue');
  assert.equal(inspected.global, true);
});

test('conservatively evaluates side-effect-free constant expressions', () => {
  const source = `const a = 1 + 2 * 3; const b = !0 && "yes"; const c = true ? "123" : "x"; const d = sideEffect();`;
  const session = NativeTransformSession.open(source, 'fixture.js');
  const expressions = session.next(['BinaryExpression', 'LogicalExpression', 'ConditionalExpression', 'CallExpression'], undefined, undefined, false).events;
  const bySource = new Map(expressions.map(event => [source.slice(event.start, event.end), event.id]));
  const ids = ['1 + 2 * 3', '!0 && "yes"', 'true ? "123" : "x"', 'sideEffect()'].map(expression => bySource.get(expression)!);
  const constants = session.query({ constants: ids }).constants;
  assert.equal(constants[ids[0]], 7);
  assert.equal(constants[ids[1]], 'yes');
  assert.equal(constants[ids[2]], '123');
  assert.equal(constants[ids[3]], null);
  session.close();
});

test('provides module specifier and declaration facts for source transforms', () => {
  const session = NativeTransformSession.open("import base, { value as local } from 'pkg'; export { local as renamed }; const answer = 1;", 'fixture.js');
  const nodes = session.next(['ImportDeclaration', 'ImportSpecifier', 'ImportDefaultSpecifier', 'ExportSpecifier', 'VariableDeclaration']).events.filter(event => event.side === 'enter').map(event => Object.fromEntries(event.fields.map(field => [field.key, field.value])));
  assert.ok(nodes.some(node => node.source === 'pkg' && node.specifierCount === 2));
  assert.ok(nodes.some(node => node.imported === 'value' && node.local === 'local'));
  assert.ok(nodes.some(node => node.imported === 'default' && node.local === 'base'));
  assert.ok(nodes.some(node => node.local === 'local' && node.exported === 'renamed'));
  assert.ok(nodes.some(node => node.kind === 'const'));
  session.close();
});

test('provides general editor operations and structured diagnostics', () => {
  const plugin = defineNativePlugin({
    name: 'editor', apiVersion: 1,
    pre(context) {
      assert.equal(context.editor.supports('move'), true);
      context.editor.trim();
      context.editor.prepend('/* before */');
      context.editor.append('/* after */');
      context.diagnostic({ code: 'fixture', message: 'diagnostic' });
    },
  });
  const result = transform('  value  ', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '/* before */value/* after */');
  assert.deepEqual(result.diagnostics, [{ code: 'fixture', message: 'diagnostic', plugin: 'editor', phase: 'edit' }]);
});

test('returns pristine source on explicit bailout and calls cleanup', () => {
  let cleanup;
  const plugin = defineNativePlugin({
    name: 'bail', apiVersion: 1,
    visitor: { Identifier(path) { path.replaceWith('changed'); path.unsupported('fixture'); } },
    cleanup(reason) { cleanup = reason; },
  });
  const source = 'const original = 1';
  const result = transform(source, 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'source', plugins: [plugin] }] }));
  assert.deepEqual(result, { status: 'bailout', reason: 'bail:fixture', source, diagnostics: [] });
  assert.equal(cleanup, 'bailout');
});

test('analyzes every plugin before applying edits and bails out pristine', () => {
  const lifecycle: string[] = [];
  const supported = defineNativePlugin({
    name: 'supported', apiVersion: 1,
    analyze() { lifecycle.push('analyze:supported'); return { status: 'supported', analysis: 'replacement' }; },
    apply(context, analysis) { lifecycle.push(`apply:${analysis}`); context.editor.overwrite(0, 5, 'changed'); },
  });
  const unsupported = defineNativePlugin({
    name: 'unsupported-analysis', apiVersion: 1,
    analyze() { lifecycle.push('analyze:unsupported'); return { status: 'unsupported', reason: 'needs-compiler' }; },
  });
  const source = 'value';
  const result = transform(source, 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'source', plugins: [supported, unsupported] }] }));
  assert.equal(result.status, 'bailout');
  assert.equal(result.source, source);
  assert.deepEqual(lifecycle, ['analyze:supported', 'analyze:unsupported']);
});

test('builds deterministic cache keys and falls back with pristine source', () => {
  const plugin = defineNativePlugin({ name: 'unsupported', version: '1.0.0', apiVersion: 1, visitor: { Program: path => path.unsupported('test') } });
  const pipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'source', plugins: [plugin] }] });
  assert.equal(pipelineCacheKey(pipeline, 'fixture.js'), pipelineCacheKey(pipeline, 'fixture.js'));
  const result = transformOrFallback('const pristine = true', 'fixture.js', pipeline, source => ({ status: 'complete', code: source, map: { mappings: '', names: [] }, metadata: { fallback: true }, diagnostics: [], timings: { parseMs: 0, semanticMs: 0, traversalMs: 0, renderAndMapMs: 0 } }));
  assert.equal(result.code, 'const pristine = true');
  assert.equal(result.metadata.fallback, true);
});

test('creates immutable pipelines and reusable option-bound plugin definitions', () => {
  const definition = defineNativePlugin<undefined, { value: string }>({ name: 'configured', apiVersion: 1, prepare(_context, options) { assert.equal(options.value, 'configured'); } });
  const configured = definition.withOptions({ value: 'configured' });
  const pipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [configured] }] });
  assert.ok(Object.isFrozen(definition));
  assert.ok(Object.isFrozen(pipeline));
  assert.ok(Object.isFrozen(pipeline.phases));
  assert.ok(Object.isFrozen(pipeline.phases[0].plugins));
  assert.notEqual(pipelineCacheKey(definitionPipeline(definition), 'fixture.js'), pipelineCacheKey(definitionPipeline(configured), 'fixture.js'));
  transform('value', 'fixture.js', pipeline);
});

test('supplies API versions and supports the single-pass pipeline shorthand', () => {
  const plugin = defineNativePlugin({ name: 'concise', visitor: { NumericLiteral(path) { path.replaceWith('2'); } } });
  const pipeline = defineNativePipeline([plugin]);
  assert.equal(plugin.apiVersion, 1);
  assert.equal(pipeline.apiVersion, 1);
  assert.equal(pipeline.phases[0].name, 'transform');
  const result = transform('const value = 1;', 'fixture.js', pipeline);
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 2;');
});

function definitionPipeline(plugin: ReturnType<typeof defineNativePlugin>): ReturnType<typeof defineNativePipeline> {
  return defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] });
}

test('rejects conflicting edits transactionally', () => {
  const plugin = name => defineNativePlugin({ name, apiVersion: 1, visitor: { Identifier: path => path.replaceWith(name) } });
  assert.throws(() => transform('const value = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'source', plugins: [plugin('a'), plugin('b')] }] })), /overlapping edits/);
});

test('expands union visitor keys before native subscription planning', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'union', apiVersion: 1,
    visitor: { 'ImportDeclaration|ExportNamedDeclaration': path => seen.push(path.node.type) },
  });
  transform("import value from 'source'; export { value }", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.deepEqual(seen, ['ImportDeclaration', 'ExportNamedDeclaration']);
});

test('expands the Expression alias consistently for literal expressions', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'expressions', apiVersion: 1,
    visitor: { Expression: path => seen.push(path.node.type) },
  });
  transform('true; 1; "value"; null; /value/;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.ok(seen.includes('BooleanLiteral'));
  assert.ok(seen.includes('NumericLiteral'));
  assert.ok(seen.includes('StringLiteral'));
  assert.ok(seen.includes('NullLiteral'));
  assert.ok(seen.includes('RegExpLiteral'));
});

test('treats declarations as Babel statements despite collapsed Oxc node kinds', () => {
  const declarations: string[] = [];
  const statements: string[] = [];
  const plugin = defineNativePlugin({ name: 'declaration-alias', apiVersion: 1, visitor: {
    Declaration(path) { declarations.push(path.node.type); },
    Statement(path) { statements.push(path.node.type); },
  } });
  transform("import value from 'pkg'; const item = value; function fn() {} class Example {} export { item };", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.deepEqual(declarations, ['ImportDeclaration', 'VariableDeclaration', 'Function', 'Class', 'ExportNamedDeclaration']);
  assert.deepEqual(statements, declarations);
});

test('provides parent paths backed by native indexed records', () => {
  let parentType: string | undefined;
  const plugin = defineNativePlugin({ name: 'parent', apiVersion: 1, prepare() { return { ancestry: 'parent' }; }, visitor: { NumericLiteral(path) { parentType = path.parentPath?.node.type; } } });
  transform('const value = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.equal(parentType, 'VariableDeclarator');
});

test('provides lazy ancestor helpers without recursive node materialization', () => {
  let ancestors: unknown;
  const plugin = defineNativePlugin({ name: 'ancestors', apiVersion: 1, prepare() { return { ancestry: 'findParent' }; }, visitor: { NumericLiteral(path) {
    ancestors = [path.findParent(parent => parent.node.type === 'ReturnStatement')?.node.type, path.getFunctionParent()?.node.type, path.getProgramParent()?.node.type];
  } } });
  transform('function fixture() { return 1 }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.deepEqual(ancestors, ['ReturnStatement', 'Function', 'Program']);
});

test('requires ancestry and scope payloads to be declared', () => {
  const ancestry = defineNativePlugin({ name: 'undeclared-ancestry', apiVersion: 1, visitor: { Identifier(path) { void path.parentPath; } } });
  const scope = defineNativePlugin({ name: 'undeclared-scope', apiVersion: 1, visitor: { Identifier(path) { void path.scope; } } });
  assert.throws(() => transform('value', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [ancestry] }] })), /undeclared ancestry access/);
  assert.throws(() => transform('value', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [scope] }] })), /undeclared scope semantics/);
});

test('honors plan phase filters and validates expression fragments natively', () => {
  const visited: string[] = [];
  const plugin = defineNativePlugin({
    name: 'phased', apiVersion: 1,
    prepare() { return { phases: ['second'] }; },
    visitor: { Program(path) { visited.push(path.context.phase); assert.throws(() => path.context.code.parseExpression('value +'), /invalid expression fragment/); } },
  });
  transform('value', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'first', plugins: [plugin] }, { name: 'second', plugins: [plugin] }] }));
  assert.deepEqual(visited, ['second']);
});

test('builds escaped primitive literals and validates statement fragments', () => {
  const plugin = defineNativePlugin({ name: 'code-factory', apiVersion: 1, visitor: { Program(path) {
    assert.equal(path.context.code.literal('quoted\nvalue').code, '"quoted\\nvalue"');
    assert.equal(path.context.code.literal(12n).code, '12n');
    path.appendToBody(path.context.code.parseStatements('\nexport const generated = null;').code);
    assert.throws(() => path.context.code.parseStatements('export const ='), /invalid statement fragment/);
  } } });
  const result = transform('const original = true;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'generate', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const original = true;\nexport const generated = null;');
});

test('composes source maps across phases', () => {
  const first = defineNativePlugin({ name: 'first', apiVersion: 1, visitor: { NumericLiteral: path => path.replaceWith({ code: '20', mapping: 'anchor-boundaries' }) } });
  const second = defineNativePlugin({ name: 'second', apiVersion: 1, visitor: { NumericLiteral: path => path.replaceWith({ code: '300', mapping: 'anchor-boundaries' }) } });
  const result = transform('const value = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'first', plugins: [first] }, { name: 'second', plugins: [second] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 300');
  assert.ok(result.map.mappings.length > 0);
});

test('supports all four insertion affinities deterministically', () => {
  const plugin = defineNativePlugin({ name: 'affinity', apiVersion: 1, pre(context) {
    context.editor.appendLeft(0, 'AL');
    context.editor.prependLeft(0, 'PL');
    context.editor.appendRight(0, 'AR');
    context.editor.prependRight(0, 'PR');
  } });
  const result = transform('x', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'PLALPRARx');
});

test('lowers static and functional replacements against pristine source', () => {
  const plugin = defineNativePlugin({ name: 'replace', apiVersion: 1, pre(context) {
    context.editor.replace('one', 'ONE');
    context.editor.replaceAll(/two/g, match => match.toUpperCase());
  } });
  const result = transform('one; two; two;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'ONE; TWO; TWO;');
});

test('allows an explicit parser mode independent of filename extension', () => {
  const result = transform('const value: number = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [] }), { parser: 'ts' });
  assert.equal(result.status, 'complete');
});

test('widens over only the remaining traversal and suppresses duplicates', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'widen', apiVersion: 1,
    visitor: {
      CallExpression(path) { if (path.node.calleeName === 'mark') path.context.subscribeRemaining('Identifier'); },
      Identifier(path) { seen.push(String(path.node.name)); },
    },
  });
  transform('before; mark(); after;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.deepEqual(seen, ['before', 'mark', 'after']);
});

test('implements per-plugin skip and stop', () => {
  const skipped: string[] = [];
  const stopped: string[] = [];
  const skipPlugin = defineNativePlugin({ name: 'skip', apiVersion: 1, visitor: {
    Function(path) { path.skip(); },
    Identifier(path) { skipped.push(String(path.node.name)); },
  } });
  const stopPlugin = defineNativePlugin({ name: 'stop', apiVersion: 1, visitor: { Identifier(path) { stopped.push(String(path.node.name)); path.stop(); } } });
  transform('outside; function fn(inside) { return inside } trailing;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [skipPlugin, stopPlugin] }] }));
  assert.ok(skipped.includes('outside'));
  assert.ok(!skipped.includes('inside'));
  assert.equal(stopped.length, 1);
});

test('provides call and capture query declarations', () => {
  let calls = 0;
  let captures: unknown[] = [];
  const plugin = defineNativePlugin({ name: 'queries', apiVersion: 1, visitor: { Function(path) {
    calls = path.context.query({ calls: [{ callee: 'load', globalOnly: true, staticArguments: true }] }).calls.load.length;
    captures = path.context.query({ captures: [{ functionId: path.node.id }] }).captures[path.node.id];
  } } });
  transform("const outer = 1; load('x'); function fn() { return outer }", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.equal(calls, 1);
  assert.equal(captures.length, 1);
});

test('exposes binding reads, writes, and lexical captures', () => {
  const session = NativeTransformSession.open('let outer = 0; function update() { outer++; return outer }', 'fixture.js');
  const [fn] = session.next(['Function']).events.filter(event => event.side === 'enter');
  const facts = session.query({ bindings: [{ name: 'outer' }], captures: [{ functionId: fn.id }] });
  assert.equal(facts.bindings.length, 1);
  assert.ok(facts.bindings[0].references.some(reference => reference.write === true));
  assert.ok(facts.bindings[0].references.some(reference => reference.read === true));
  assert.ok(facts.captures[fn.id].some(reference => reference.id === facts.bindings[0].references[0].id));
  session.close();
});

test('indexes repeated scope lookups without consuming follow-up batches', () => {
  const source = Array.from({ length: 100 }, (_, index) => `const value${index} = global${index};`).join('\n');
  let bindings = 0;
  let globals = 0;
  const plugin = defineNativePlugin({
    name: 'many-scope-lookups', apiVersion: 1,
    prepare() { return { semantics: ['scope'] }; },
    visitor: { Identifier(path) {
      const name = String(path.node.name);
      if (path.scope.hasBinding(name)) bindings++;
      if (path.scope.hasGlobal(name)) globals++;
    } },
  });
  const result = transform(source, 'fixture.js', defineNativePipeline([plugin]));
  assert.equal(result.status, 'complete');
  assert.equal(bindings, 100);
  assert.equal(globals, 100);
});

test('filters hot event families only when every subscriber opts in', () => {
  const firstSeen = new Set();
  const secondSeen = new Set();
  const first = defineNativePlugin({
    name: 'first-filter', apiVersion: 1,
    prepare() { return { identifierNames: ['first'], staticMemberPatterns: ['process.env.FIRST'] }; },
    visitor: {
      ReferencedIdentifier(path) { firstSeen.add(String(path.node.name)); },
      StaticMemberExpression(path) { firstSeen.add(String(path.node.memberPath)); },
    },
  });
  const second = defineNativePlugin({
    name: 'second-filter', apiVersion: 1,
    prepare() { return { identifierNames: ['second'], staticMemberPatterns: ['process.env.SECOND'] }; },
    visitor: {
      ReferencedIdentifier(path) { secondSeen.add(String(path.node.name)); },
      StaticMemberExpression(path) { secondSeen.add(String(path.node.memberPath)); },
    },
  });
  transform('first; second; third; process.env.FIRST; process.env.SECOND; process.env.THIRD;', 'fixture.js', defineNativePipeline([first, second]));
  assert.deepEqual([...firstSeen].sort(), ['first', 'process.env.FIRST']);
  assert.deepEqual([...secondSeen].sort(), ['process.env.SECOND', 'second']);

  const unfiltered = new Set();
  const broad = defineNativePlugin({ name: 'unfiltered', apiVersion: 1, visitor: { ReferencedIdentifier(path) { unfiltered.add(String(path.node.name)); } } });
  transform('first; second; third;', 'fixture.js', defineNativePipeline([first, broad]));
  assert.ok(unfiltered.has('third'));
});

test('can disable a plugin and its lifecycle for the current file', () => {
  let lifecycleCalls = 0;
  const plugin = defineNativePlugin({
    name: 'disabled', apiVersion: 1,
    prepare() { return { enabled: false }; },
    createState() { lifecycleCalls++; },
    pre() { lifecycleCalls++; },
    visitor: { Identifier() { lifecycleCalls++; } },
    post() { lifecycleCalls++; },
  });
  transform('const value = source;', 'fixture.js', defineNativePipeline([plugin]));
  assert.equal(lifecycleCalls, 0);
});

test('resolves the nearest binding and renames only its semantic references', () => {
  const plugin = defineNativePlugin({
    name: 'rename-binding', apiVersion: 1,
    prepare() { return { semantics: ['scope'] }; },
    visitor: { Program(path) {
      const binding = path.scope.getBinding('value');
      assert.equal(binding?.global, false);
      assert.equal(binding?.references.length, 3);
      assert.equal(binding?.path?.node.type, 'VariableDeclarator');
      assert.equal(binding?.scope?.id, path.scope.id);
      assert.equal(binding?.scope?.getProgramParent().id, path.scope.id);
      assert.equal(path.scope.rename('value', 'renamed'), 'renamed');
    } },
  });
  const source = 'let value = 1; use(value); const object = { value }; ({ value } = object); function nested(value) { return value }';
  const result = transform(source, 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'rename', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'let renamed = 1; use(renamed); const object = { value: renamed }; ({ value: renamed } = object); function nested(value) { return value }');
});

test('exposes lazy Babel-shaped binding paths and scope parent chains', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({ name: 'binding-path', apiVersion: 1, prepare() { return { semantics: ['scope'] }; }, visitor: { Function(path) {
    if (path.node.name !== 'nested') return;
    const binding = path.scope.getBinding('parameter');
    observed = [binding?.path?.node.type, binding?.scope?.id, binding?.scope === path.scope, binding?.scope?.parent?.id, binding?.scope?.getProgramParent().id];
  } } });
  transform('function nested(parameter) { return parameter }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'scope', plugins: [plugin] }] }));
  assert.deepEqual(observed, ['FormalParameter', 1, true, 0, 0]);
});

test('pushes generated declarations into a scope after its directive prologue', () => {
  const plugin = defineNativePlugin({ name: 'scope-push', apiVersion: 1, prepare() { return { semantics: ['scope'] }; }, visitor: { Function(path) {
    if (path.node.name === 'action') path.scope.push(path.context.code.parseStatements('var injected = 1;'));
  } } });
  const result = transform('function action() { "use action"; return injected }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'push', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'function action() { "use action";\nvar injected = 1;\n return injected }');
});

test('provides Babel-shaped multi-replacement, container, comment, and code-frame helpers', () => {
  const plugin = defineNativePlugin({ name: 'path-conveniences', apiVersion: 1, visitor: {
    Program(path) { path.unshiftContainer('body', '/* first */\n'); path.pushContainer('body', '\n/* last */'); },
    NumericLiteral(path) { path.replaceWithMultiple(['2', '3']); assert.match(path.buildCodeFrameError('fixture').message, /fixture/); },
  } });
  const result = transform('const value = 1;', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '/* first */\nconst value = 2\n3;\n/* last */');
});

test('provides lazy compact structural child roles without recursive ESTree transfer', () => {
  const observed: Record<string, string[]> = {};
  const sources = (value: ReturnType<any>) => (Array.isArray(value) ? value : value ? [value] : []).map(path => path.getSource());
  const plugin = defineNativePlugin({ name: 'child-roles', apiVersion: 1,
    prepare() { return { children: { Program: ['body'], ImportDeclaration: ['specifiers', 'source'], VariableDeclarator: ['id', 'init'], CallExpression: ['callee', 'arguments'], ObjectProperty: ['key', 'value'], Function: ['params'], FormalParameters: ['*'], ExportDefaultDeclaration: ['declaration'] } }; },
    visitor: {
    Program(path) { observed.body = sources(path.get('body')); },
    ImportDeclaration(path) { observed.specifiers = sources(path.get('specifiers')); observed.source = sources(path.get('source')); },
    VariableDeclarator(path) { if (path.getSource().includes('result')) { observed.id = sources(path.get('id')); observed.init = sources(path.get('init')); } },
    CallExpression(path) { observed.callee = sources(path.get('callee')); observed.arguments = sources(path.get('arguments')); },
    ObjectProperty(path) { observed.key = sources(path.get('key')); observed.value = sources(path.get('value')); },
    Function(path) { observed.params = sources(path.get('params')); },
    ExportDefaultDeclaration(path) { observed.declaration = sources(path.get('declaration')); },
  } });
  transform("import item, { x as y } from 'pkg'; function f(a, { b }) {} const result = fn({ platform: 1 }, y); export default result;", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'inspect', plugins: [plugin] }] }), { maxFollowUpBatches: 2 });
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
  const plugin = defineNativePlugin({ name: 'undeclared-child', apiVersion: 1, visitor: { CallExpression(path) { path.get('arguments'); } } });
  assert.throws(() => transform('run(1)', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] })), /undeclared child role CallExpression\.arguments/);
});

test('distinguishes control-flow and class child roles needed by structural fixes', () => {
  const observed: Record<string, string | null> = {};
  const one = (value: unknown) => value && !Array.isArray(value) ? value as { getSource(): string } : null;
  const plugin = defineNativePlugin({ name: 'structural-roles', apiVersion: 1,
    prepare() { return { children: { TryStatement: ['block', 'handler', 'finalizer'], Class: ['superClass', 'body'] } }; },
    visitor: {
      TryStatement(path) { observed.block = one(path.get('block'))?.getSource() ?? null; observed.handler = one(path.get('handler'))?.getSource() ?? null; observed.finalizer = one(path.get('finalizer'))?.getSource() ?? null; },
      Class(path) { observed.superClass = one(path.get('superClass'))?.getSource() ?? null; observed.classBody = one(path.get('body'))?.getSource() ?? null; },
    },
  });
  transform('try { work() } catch (error) { recover(error) } finally { cleanup() } class Child extends Parent { method() {} }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'inspect', plugins: [plugin] }] }));
  assert.deepEqual(observed, { block: '{ work() }', handler: 'catch (error) { recover(error) }', finalizer: '{ cleanup() }', superClass: 'Parent', classBody: '{ method() {} }' });
});

test('implements a Platform.select-style transform through declared compact roles', () => {
  const plugin = defineNativePlugin({ name: 'platform-select', apiVersion: 1,
    prepare() { return { children: { CallExpression: ['callee', 'arguments'], ObjectExpression: ['properties'], ObjectProperty: ['value'] } }; },
    visitor: { CallExpression(path) {
      const callee = path.getChild('callee');
      if (!callee?.matchesPattern('Platform.select')) return;
      const argument = path.getChildList('arguments')[0];
      if (!argument?.is('ObjectExpression')) return;
      const properties = argument.getChildList('properties');
      if (properties.some(property => property.node.type !== 'ObjectProperty' || property.node.computed === true)) return;
      const selected = properties.find(property => property.node.key === 'ios') ?? properties.find(property => property.node.key === 'native') ?? properties.find(property => property.node.key === 'default');
      const value = selected?.getChild('value');
      if (value) path.replaceWith(value.getSource());
    } },
  });
  const result = transform("const selected = Platform.select({ web: 'web', native: makeNative(), ios: 'ios' });", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'platform', plugins: [plugin] }] }), { maxFollowUpBatches: 2 });
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const selected = 'ios';");
});

test('validates metadata ownership', () => {
  const plugin = defineNativePlugin({ name: 'metadata', apiVersion: 1, pre(context) { context.metadata.set('undeclared', true); } });
  assert.throws(() => transform('value', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] })), /undeclared metadata key/);
});

test('supports caller-provided parser adapters for unsupported syntax', () => {
  const unregister = registerParserAdapter({
    name: 'flow-fixture', supports: route => route.syntax === 'flow',
    transform: source => ({ status: 'complete', code: source, map: { mappings: '', names: [] }, metadata: { adapter: true }, diagnostics: [], timings: { parseMs: 0, semanticMs: 0, traversalMs: 0, renderAndMapMs: 0 } }),
  });
  try {
    const result = transform('// @flow\nconst value: number = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [] }));
    assert.equal(result.status, 'complete');
    assert.equal(result.metadata.adapter, true);
  } finally { unregister(); }
});

test('produces traceable Unicode-aware VLQ mappings', () => {
  const plugin = defineNativePlugin({ name: 'map', apiVersion: 1, visitor: { NumericLiteral: path => path.replaceWith({ code: '200', mapping: 'anchor-start', names: ['generatedValue'] }) } });
  const result = transform("const emoji = '😀';\nconst value = 1;", 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }));
  assert.equal(result.status, 'complete');
  const map = new TraceMap({ version: 3, sources: ['fixture.js'], names: result.map.names, mappings: result.map.mappings });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 14 }), { source: 'fixture.js', line: 2, column: 14, name: 'generatedValue' });
});

test('traces CRLF, directive, wrapper, and explicit-location mappings', () => {
  const plugin = defineNativePlugin({ name: 'map-boundaries', apiVersion: 1, pre(context) {
    context.editor.prepend('/* wrapper */\n');
    context.editor.append('\n/* end */');
    context.editor.addSourceMapLocation(14);
  } });
  const source = "'use strict';\r\nconst value = 1;\r\n";
  const result = transform(source, 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [plugin] }] }), { sourceMapMode: 'character' });
  assert.equal(result.status, 'complete');
  const map = new TraceMap({ version: 3, sources: ['fixture.js'], names: result.map.names, mappings: result.map.mappings });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 0 }), { source: 'fixture.js', line: 1, column: 0, name: null });
  assert.deepEqual(originalPositionFor(map, { line: 3, column: 0 }), { source: 'fixture.js', line: 2, column: 0, name: null });
});

test('enforces native memory and follow-up batch budgets', () => {
  assert.throws(() => NativeTransformSession.open('const value = 1', 'fixture.js', { maxNativeMemoryBytes: 1 }), /native-memory-budget-exceeded/);
  const session = NativeTransformSession.open('const value = 1', 'fixture.js', { maxFollowUpBatches: 1 });
  session.next(['Program']);
  assert.throws(() => session.next(['Identifier']), /follow-up-batch-budget-exceeded/);
  session.close();
});

test('keeps native sessions worker-thread isolated', async () => {
  const moduleUrl = new URL('../dist/index.js', import.meta.url).href;
  const value = await new Promise((resolve, reject) => {
    const worker = new Worker(`import { parentPort } from 'node:worker_threads'; import(${JSON.stringify(moduleUrl)}).then(({ NativeTransformSession }) => { const session = NativeTransformSession.open('const value = 1', 'worker.js'); parentPort.postMessage(session.next(['Identifier']).emittedCount); session.close(); }, error => { throw error; });`, { eval: true });
    worker.once('message', resolve); worker.once('error', reject);
  });
  assert.equal(value, 2);
});

test('handles deterministic randomized non-overlapping edit batches', () => {
  let seed = 0x12345678;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let iteration = 0; iteration < 100; iteration++) {
    const source = 'abcdefghijklmnopqrstuvwxyz';
    const session = NativeTransformSession.open(source, 'fuzz.js');
    const edits = Array.from({ length: 5 }, (_, index) => ({ kind: 'Replace' as const, start: index * 5, end: index * 5 + 1, content: String.fromCharCode(65 + Math.floor(random() * 26)) }));
    assert.equal(session.commit(edits).code.length, source.length);
    session.close();
  }
});
