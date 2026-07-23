import {
  defineNativePipeline,
  defineNativePlugin,
  type NativeNodePath,
  type NodeOfType,
  type PluginPlan,
  type EditEffect,
} from '../js/index.js';

const typedVisitor = defineNativePlugin({
  name: 'typed-visitor',
  visitor: {
    Identifier(path) {
      path.node.name.toUpperCase();
      // @ts-expect-error Identifier views do not expose typed literal values.
      path.node.value.toUpperCase();
    },
    StringLiteral: {
      exit(path) {
        path.node.value.toUpperCase();
        // @ts-expect-error String literal values are not numbers.
        path.node.value.toFixed();
      },
    },
    FunctionDeclaration(path) {
      path.node.bodyStart.toFixed();
    },
    'Identifier|StringLiteral'(path) {
      path.node.type.toUpperCase();
    },
    // @ts-expect-error Unknown visitor route names should be rejected.
    Identifer() {},
  },
  prepare(context) {
    context.subscribe('Identifier', 'ReferencedIdentifier');
    // @ts-expect-error Unknown subscription names should be rejected.
    context.subscribe('Identifer');
    return {
      subscriptions: ['CallExpression'],
      fields: { CallExpression: ['calleeName', 'argumentCount'] },
      where: { CallExpression: { optional: { equals: false } } },
      controlFlow: ['nested-traverse', 'dynamic-subscriptions', 'stop-all'],
      semantics: ['scope'],
      children: { Identifier: ['name'] },
    };
  },
});

const invalidPlan: PluginPlan = {
  // @ts-expect-error Unknown node names should be rejected in plans.
  fields: { UnknownNode: ['name'] },
};
void invalidPlan;

const invalidPredicate: PluginPlan = {
  where: {
    VariableDeclaration: {
      // @ts-expect-error Scalar predicates must use a supported declarative operation.
      kind: { matches: /const/ },
    },
  },
  // @ts-expect-error Unknown control-flow capabilities should be rejected.
  controlFlow: ['pause'],
};
void invalidPredicate;

const analyzed = defineNativePlugin<undefined, undefined, { count: number }>({
  name: 'analyzed',
  analyze() {
    return { status: 'supported', analysis: { count: 1 } };
  },
  apply(_context, analysis) {
    analysis.count.toFixed();
    // @ts-expect-error The analysis type is preserved into apply.
    analysis.missing;
  },
});

const inferredAnalysis = defineNativePlugin({
  name: 'inferred-analysis',
  analyze() {
    return { status: 'supported', analysis: { enabled: true } } as const;
  },
  apply(_context, analysis) {
    analysis.enabled;
  },
});
void inferredAnalysis;

const configured = defineNativePlugin<undefined, { mode: 'development' | 'production' }>({
  name: 'configured',
  prepare(_context, options) {
    options.mode;
  },
});
configured.withOptions({ mode: 'production' });
// @ts-expect-error Invalid plugin options should be rejected.
configured.withOptions({ mode: 'preview' });

const pipeline = defineNativePipeline({
  phases: [
    {
      name: 'transform',
      plugins: [typedVisitor, analyzed, configured.withOptions({ mode: 'development' })],
    },
  ],
});
pipeline.phases[0].plugins;

declare const path: NativeNodePath;
if (path.is('Identifier')) {
  const identifier: NodeOfType<'Identifier'> = path.node;
  identifier.name;
}
const effect: EditEffect = 'text-only';
void effect;
path.id.toFixed();
path.start.toFixed();
path.snapshot({ fields: ['name'], ancestry: 'parent' });
// @ts-expect-error Snapshot ancestry must be bounded.
path.snapshot({ ancestry: 'all' });
// @ts-expect-error Unknown concrete node types should be rejected by path.is.
path.is('Identifer');
