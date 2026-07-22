import { bench } from 'vitest';
import { defineNativePipeline, defineNativePlugin, NativeTransformSession, transform } from '../dist/index.js';

const source = Array.from({ length: 2_000 }, (_, index) => `export const value${index} = source${index} + ${index};`).join('\n');
bench('subscribed Identifier event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['Identifier']);
  session.close();
});

bench('broad native event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['*']);
  session.close();
});

const visitorPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [defineNativePlugin({ name: 'identifier-count', apiVersion: 1, visitor: { Identifier() {} } })] }] });
bench('static JavaScript visitor transform', () => {
  transform(source, 'benchmark.js', visitorPipeline);
});

const pluginFanoutPipeline = defineNativePipeline({
  apiVersion: 1,
  phases: [{
    name: 'visit',
    plugins: Array.from({ length: 12 }, (_, index) => defineNativePlugin({
      name: `identifier-plugin-${index}`,
      apiVersion: 1,
      visitor: { Identifier() {} },
    })),
  }],
});
bench('12-plugin JavaScript visitor fan-out', () => {
  transform(source, 'benchmark.js', pluginFanoutPipeline);
});

const disjointPluginPipeline = defineNativePipeline({
  apiVersion: 1,
  phases: [{
    name: 'visit',
    plugins: ['Program', 'ExportNamedDeclaration', 'VariableDeclaration', 'VariableDeclarator', 'Identifier', 'BinaryExpression', 'NumericLiteral'].map((type, index) => defineNativePlugin({
      name: `disjoint-plugin-${index}`,
      apiVersion: 1,
      visitor: { [type]() {} },
    })),
  }],
});
bench('7-plugin disjoint visitor dispatch', () => {
  transform(source, 'benchmark.js', disjointPluginPipeline);
});

const denseEditPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'edit', plugins: [defineNativePlugin({
  name: 'rename-identifiers', apiVersion: 1,
  prepare() { return { fields: { Identifier: ['name'] } }; },
  visitor: { Identifier(path) { path.replaceWith(`${path.node.name}_renamed`); } },
})] }] });
bench('dense identifier edit transform', () => {
  transform(source, 'benchmark.js', denseEditPipeline);
});

const broadVisitorPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [defineNativePlugin({
  name: 'broad-visitor', apiVersion: 1, visitor: { '*'() {} },
})] }] });
bench('broad catch-all streaming transform', () => {
  transform(source, 'benchmark.js', broadVisitorPipeline, { allowBroadVisitors: true });
});

const scopeAncestryPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [defineNativePlugin({
  name: 'scope-and-ancestry', apiVersion: 1,
  prepare() { return { semantics: ['scope'], ancestry: 'parent' }; },
  visitor: { Identifier(path) { path.scope.hasBinding(String(path.node.name)); void path.parent; } },
})] }] });
bench('identifier scope and ancestry transform', () => {
  transform(source, 'benchmark.js', scopeAncestryPipeline);
});

const threePhasePipeline = defineNativePipeline({
  apiVersion: 1,
  phases: Array.from({ length: 3 }, (_, index) => ({
    name: `phase-${index}`,
    reparseAfterEdits: index < 2,
    plugins: [defineNativePlugin({ name: `phase-plugin-${index}`, apiVersion: 1, visitor: { Identifier() {} } })],
  })),
});
bench('three-phase reparse transform', () => {
  transform(source, 'benchmark.js', threePhasePipeline);
});

const structuralPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [defineNativePlugin({
  name: 'program-children', apiVersion: 1,
  prepare() { return { children: { Program: ['body'] } }; },
  visitor: { Program(path) { path.getChildList('body'); } },
})] }] });
bench('declared structural child transform', () => {
  transform(source, 'benchmark.js', structuralPipeline);
});
