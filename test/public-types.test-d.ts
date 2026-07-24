import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor as defineVisitorTop,
  type NativeNodePath,
  type NodeOfType,
  type PluginPlan,
  type EditEffect,
} from '../js/index.js';

const typedVisitor = defineNativePlugin({
  name: 'typed-visitor',
  visitors: [
    defineVisitorTop('Identifier', { fields: ['name'] }, path => {
      path.node.name.toUpperCase();
      // @ts-expect-error Identifier contracts do not expose literal values.
      path.node.value;
    }),
    defineVisitorTop(
      'StringLiteral',
      { fields: ['value'] },
      {
        exit(path) {
          path.node.value.toUpperCase();
          // @ts-expect-error String literal values are not numbers.
          path.node.value.toFixed();
        },
      },
    ),
    defineVisitorTop('FunctionDeclaration', { fields: ['bodyStart'] }, path => {
      path.node.bodyStart.toFixed();
    }),
    defineVisitorTop('Identifier|StringLiteral', {}, path => {
      path.node.type.toUpperCase();
    }),
  ],
  prepare() {
    return { enabled: true };
  },
});

// Lifecycle-only plans reject route declarations.
const invalidPlan: PluginPlan = {
  // @ts-expect-error Route requirements live on visitor contracts, not plans.
  fields: { UnknownNode: ['name'] },
};
void invalidPlan;

defineVisitorTop(
  'VariableDeclaration',
  {
    where: {
      // @ts-expect-error Scalar predicates must use a supported declarative operation.
      kind: { matches: /const/ },
    },
  },
  () => {},
);
defineVisitorTop(
  'Identifier',
  {
    // @ts-expect-error Unknown control-flow capabilities should be rejected.
    controlFlow: ['pause'],
  },
  () => {},
);

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

// ---------------------------------------------------------------------------
// Typed per-visitor contracts
// ---------------------------------------------------------------------------
import { defineVisitor, type DefinedVisitor } from '../js/index.js';

interface BlockState {
  renamed: number;
}

// Declared fields are visible and typed; undeclared fields are TypeScript errors.
defineVisitor('Identifier', { fields: ['name'] }, path => {
  path.node.name.toUpperCase();
  path.node.start.toFixed();
  // @ts-expect-error `binding` was not declared in the contract.
  path.node.binding;
  // @ts-expect-error capability methods require declarations.
  path.skip();
  // @ts-expect-error scope requires `scope: true`.
  path.scope;
  // @ts-expect-error ancestry requires a declaration.
  path.parentPath;
  // @ts-expect-error children require a declaration.
  path.getChildList('declarations');
  path.replaceWith('renamed');
  path.getSource();
});

// Match-only predicate fields are not callback-visible.
defineVisitor('VariableDeclaration', { where: { kind: { equals: 'const' } } }, path => {
  // @ts-expect-error `kind` was used for native matching but not transferred.
  path.node.kind;
});

// Wrong fields for a known route are rejected.
defineVisitor(
  'Identifier',
  {
    // @ts-expect-error `value` is not an Identifier field.
    fields: ['value'],
  },
  () => {},
);

// Capabilities unlock their exact methods.
defineVisitor(
  'VariableDeclaration',
  {
    fields: ['kind'],
    scope: true,
    ancestry: 'findParent',
    children: { declarations: { route: 'VariableDeclarator', fields: ['name'] } },
    controlFlow: ['skip', 'nested-traverse'],
  },
  (path, state: BlockState) => {
    path.node.kind;
    path.scope.getBinding('value');
    path.parentPath;
    path.findParent(() => true);
    // @ts-expect-error `functionParent` mode was not declared.
    path.getFunctionParent();
    path.skip();
    // @ts-expect-error `stop` was not declared.
    path.stop();
    path.traverse([defineVisitor('Function', {}, () => {})]);
    const declarator = path.getChildList('declarations')[0];
    declarator?.node;
    // @ts-expect-error undeclared child role.
    path.getChildList('id');
    state.renamed++;
  },
);

// State flows from the annotated handler parameter into the plugin definition.
const stateful: DefinedVisitor<BlockState> = defineVisitor(
  'Identifier',
  { fields: ['name'] },
  (_path, state: BlockState) => {
    state.renamed++;
  },
);
defineNativePlugin({
  name: 'stateful',
  visitors: [stateful],
  createState: (): BlockState => ({ renamed: 0 }),
});
// Stateless visitors compose into stateful plugins.
defineNativePlugin({
  name: 'compose',
  visitors: [stateful, defineVisitor('StringLiteral', {}, () => {})],
  createState: (): BlockState => ({ renamed: 0 }),
});
defineNativePlugin({
  name: 'state-mismatch',
  visitors: [stateful],
  // @ts-expect-error visitor state must match the plugin state.
  createState: () => ({ other: true }),
});

// `configure` returns values, never capability shape.
defineVisitor(
  'Identifier',
  {
    fields: ['name'],
    configure: () => ({ enabled: true, where: { name: { oneOf: ['__DEV__'] } } }),
  },
  () => {},
);
defineVisitor(
  'Identifier',
  {
    // @ts-expect-error configure may not return capability shape.
    configure: () => ({ scope: true }),
  },
  () => {},
);

// Unknown routes are rejected.
defineVisitor(
  // @ts-expect-error unknown route name.
  'Identifer',
  {},
  () => {},
);

// Plugin contracts narrow metadata keys for lifecycle hooks.
defineNativePlugin({
  name: 'contracted',
  contract: {
    metadata: { writes: ['dependencies'], reads: ['module-kind'] },
  },
  post(context) {
    context.metadata.set('dependencies', []);
    context.metadata.get('module-kind');
    context.metadata.get('dependencies');
    // @ts-expect-error undeclared metadata write key.
    context.metadata.set('other', 1);
    // @ts-expect-error undeclared metadata read key.
    context.metadata.get('other');
  },
});
// Without a contract, metadata keys stay open.
defineNativePlugin({
  name: 'uncontracted',
  post(context) {
    context.metadata.set('anything', 1);
  },
});
