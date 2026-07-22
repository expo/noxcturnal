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

test('executes coarse global queries and targeted inspection', () => {
  const session = NativeTransformSession.open('globalValue + (() => { const globalValue = 1; return globalValue })()', 'fixture.js');
  const query = session.query({ globals: [{ name: 'globalValue', references: true }] });
  assert.equal(query.globals.globalValue.references.length, 1);
  const [reference] = query.globals.globalValue.references;
  const [inspected] = session.inspect([{ nodeId: reference.id, fields: ['name', 'global'] }]);
  assert.equal(inspected.name, 'globalValue');
  assert.equal(inspected.global, true);
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

test('provides parent paths backed by native indexed records', () => {
  let parentType: string | undefined;
  const plugin = defineNativePlugin({ name: 'parent', apiVersion: 1, visitor: { NumericLiteral(path) { parentType = path.parentPath?.node.type; } } });
  transform('const value = 1', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.equal(parentType, 'VariableDeclarator');
});

test('provides lazy ancestor helpers without recursive node materialization', () => {
  let ancestors: unknown;
  const plugin = defineNativePlugin({ name: 'ancestors', apiVersion: 1, visitor: { NumericLiteral(path) {
    ancestors = [path.findParent(parent => parent.node.type === 'ReturnStatement')?.node.type, path.getFunctionParent()?.node.type, path.getProgramParent()?.node.type];
  } } });
  transform('function fixture() { return 1 }', 'fixture.js', defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [plugin] }] }));
  assert.deepEqual(ancestors, ['ReturnStatement', 'Function', 'Program']);
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
