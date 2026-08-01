import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor as defineVisitorTop,
  isExpression,
  isNodeType,
  isStatement,
  isStatementType,
  type EditEffect,
  type NativeNodePath,
  type NodeOfType,
} from '../index';

const typedVisitor = defineNativePlugin({
  name: 'typed-visitor',
  visitors: [
    defineVisitorTop('Identifier', { fields: ['name'] }, path => {
      path.node.name.toUpperCase();
      path.context.prependToProgram(path.getSource());
      path.context.appendToProgram(path.context.code.template`consume(${path.getSource()});`);
      // @ts-expect-error Program insertions require provenance-aware Code.
      path.context.prependToProgram(1);
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
      // Declarations without bodies (overload signatures) carry no bodyStart.
      path.node.bodyStart?.toFixed();
      // @ts-expect-error bodyStart is number | undefined, never a string.
      path.node.bodyStart?.toUpperCase();
    }),
    defineVisitorTop('ArrowFunctionExpression', { fields: ['bodyStart'] }, path => {
      // Arrow functions always carry a body, so bodyStart is required.
      path.node.bodyStart.toFixed();
    }),
    defineVisitorTop('Identifier|StringLiteral', {}, path => {
      path.node.type.toUpperCase();
    }),
  ],
});

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

declare const nodeLike: { readonly type: string; readonly retained: boolean };
if (isStatement(nodeLike)) {
  const statementType: import('../generated/event-schema').NativeRouteTypes['Statement'] =
    nodeLike.type;
  nodeLike.retained;
  void statementType;
}
if (isExpression(nodeLike)) nodeLike.retained;
isStatementType(nodeLike.type);
if (isNodeType(nodeLike, 'Statement')) {
  const statementType: import('../generated/event-schema').NativeRouteTypes['Statement'] =
    nodeLike.type;
  void statementType;
}
isNodeType(nodeLike, 'Identifier');
// @ts-expect-error Predicate-specialized routes cannot be decided from node.type alone.
isNodeType(nodeLike, 'ReferencedIdentifier');

// ---------------------------------------------------------------------------
// Typed per-visitor contracts
// ---------------------------------------------------------------------------
import { defineVisitor, parameter, type DefinedVisitor } from '../index';

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
    ancestry: { mode: 'findParent' },
    children: { declarations: { route: 'VariableDeclarator', fields: ['kind'] } },
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

// Predicate values may be declared as bound parameters.
defineVisitor(
  'Identifier',
  { fields: ['name'], where: { name: { oneOf: parameter('names') } } },
  () => {},
);
defineVisitor(
  'Identifier',
  { fields: ['name'], where: { name: { equals: parameter('name') } } },
  () => {},
);
// A parameter stands for the value, never for the operator or the matched field.
defineVisitor(
  'Identifier',
  {
    // @ts-expect-error a predicate parameter is not itself a predicate.
    where: { name: parameter('name') },
  },
  () => {},
);
const parameterised = defineNativePlugin({
  name: 'parameterised',
  visitors: [
    defineVisitor(
      'Identifier',
      { fields: ['name'], where: { name: { oneOf: parameter('names') } } },
      () => {},
    ),
  ],
});
parameterised.withParameters({ names: ['__DEV__'] });
// @ts-expect-error parameter values are scalars or lists of scalars.
parameterised.withParameters({ names: { nested: true } });

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

// ---------------------------------------------------------------------------
// Tightened contract typings (PLAN_TYPED_CONTRACT_TIGHTENING.md)
// ---------------------------------------------------------------------------

// P1 — predicate keys are route-narrowed.
defineVisitor(
  'VariableDeclaration',
  {
    where: {
      // @ts-expect-error `name` is not a VariableDeclaration predicate field.
      name: { equals: 'x' },
    },
  },
  () => {},
);
// Alias predicates keep runtime intersection semantics: the `Function` alias
// admits only fields ArrowFunctionExpression also supports.
defineVisitor('Function', { where: { async: { equals: true } } }, () => {});
defineVisitor(
  'Function',
  {
    where: {
      // @ts-expect-error `name` is not valid across the Function alias expansion.
      name: { present: true },
    },
  },
  () => {},
);

// P2 — predicate values are typed by the field's wire value.
defineVisitor(
  'VariableDeclaration',
  {
    where: {
      // @ts-expect-error `kind` is a VariableDeclarationKind, not a number.
      kind: { equals: 42 },
    },
  },
  () => {},
);
defineVisitor(
  'VariableDeclaration',
  {
    where: {
      // @ts-expect-error `kind` only carries declaration kinds.
      kind: { equals: 'nonsense' },
    },
  },
  () => {},
);
defineVisitor('VariableDeclaration', { where: { kind: { oneOf: ['let', 'const'] } } }, () => {});
defineVisitor(
  'VariableDeclaration',
  {
    where: {
      // @ts-expect-error oneOf values are typed like equals values.
      kind: { oneOf: ['let', 'sideways'] },
    },
  },
  () => {},
);

// P3 — declared payload fields carry generated value types.
defineVisitor('VariableDeclaration', { fields: ['kind', 'declarationCount'] }, path => {
  const kind: 'var' | 'let' | 'const' | 'using' | 'await using' = path.node.kind;
  void kind;
  path.node.declarationCount.toFixed();
  // @ts-expect-error `kind` is not a number.
  path.node.kind.toFixed();
});
defineVisitor('ImportDeclaration', { fields: ['source', 'importKind'] }, path => {
  path.node.source.toUpperCase();
  const importKind: 'value' | 'type' = path.node.importKind;
  void importKind;
});
// ReferencedIdentifier narrows: the implicit global predicate makes it required.
defineVisitor('ReferencedIdentifier', { fields: ['global', 'name'] }, path => {
  const global: boolean = path.node.global;
  void global;
  // @ts-expect-error `binding` never appears on referenced identifiers.
  path.node.binding;
});
// Collapsed function keys narrow nodeKind to their own literal.
defineVisitor('FunctionDeclaration', { fields: ['nodeKind'] }, path => {
  const nodeKind: 'FunctionDeclaration' = path.node.nodeKind;
  void nodeKind;
});

// P4 — children are validated: role names, role↔route agreement, child fields.
defineVisitor(
  'VariableDeclaration',
  {
    children: {
      // @ts-expect-error `nonsenseRole` is not a VariableDeclaration child role.
      nonsenseRole: { route: 'VariableDeclarator' },
    },
  },
  () => {},
);
defineVisitor(
  'VariableDeclaration',
  {
    children: {
      // @ts-expect-error `declarations` delivers VariableDeclarator, not Identifier.
      declarations: { route: 'Identifier' },
    },
  },
  () => {},
);
defineVisitor(
  'VariableDeclaration',
  {
    children: {
      declarations: {
        route: 'VariableDeclarator',
        // @ts-expect-error `calleeName` is not a VariableDeclarator field.
        fields: ['calleeName'],
      },
    },
  },
  () => {},
);
// Child cardinality steers getChild/getChildList.
defineVisitor(
  'VariableDeclaration',
  { children: { declarations: { route: 'VariableDeclarator', fields: ['kind'] } } },
  path => {
    path.getChildList('declarations')[0]?.node.kind;
    // @ts-expect-error `declarations` is a list role.
    path.getChild('declarations');
  },
);
defineVisitor('VariableDeclarator', { children: { init: { route: 'Expression' } } }, path => {
  path.getChild('init');
  // @ts-expect-error `init` is a single-node role.
  path.getChildList('init');
});

// P5 — every composite segment is validated.
defineVisitor(
  // @ts-expect-error `Garbage` is not a route.
  'Identifier|Garbage',
  {},
  () => {},
);
defineVisitor(
  'VariableDeclarator',
  {
    children: {
      // @ts-expect-error every segment of a child route is validated recursively.
      init: { route: 'Identifier|Garbage' },
    },
  },
  () => {},
);
defineVisitor(
  'VariableDeclarator',
  {
    children: {
      // @ts-expect-error wildcard child contracts still validate every route segment.
      '*': { route: 'Identifier|Garbage' },
    },
  },
  () => {},
);
// Composite nodes discriminate on their `type` literal.
defineVisitor('Identifier|StringLiteral', { fields: ['name', 'value'] }, path => {
  if (path.node.type === 'Identifier') path.node.name.toUpperCase();
  if (path.is('StringLiteral')) path.node.value.toUpperCase();
  // @ts-expect-error `is` only accepts types in the composite expansion.
  path.is('NumericLiteral');
});

// P6 — alias routes only accept fields their expansion can deliver.
defineVisitor(
  'Expression',
  {
    // @ts-expect-error `declarationCount` never occurs on expression nodes.
    fields: ['declarationCount'],
  },
  () => {},
);
defineVisitor('Expression', { fields: ['calleeName'] }, path => {
  // Union semantics: only CallExpression/NewExpression events carry it.
  path.node.calleeName?.toUpperCase();
});

// P7 — derived paths keep the owner's declared capabilities.
defineVisitor('VariableDeclaration', { ancestry: { mode: 'findParent' } }, path => {
  const parent = path.parentPath;
  parent?.getSource();
  // @ts-expect-error scope was not declared, so ancestors cannot expose it.
  parent?.scope;
  // @ts-expect-error children were not declared on the owner.
  parent?.getChildList('body');
  path.findParent(ancestor => {
    // @ts-expect-error ancestors carry the owner's capabilities, not more.
    ancestor.scope;
    return ancestor.type === 'Program';
  });
});
defineVisitor('VariableDeclaration', { scope: true, ancestry: { mode: 'programParent' } }, path => {
  // Declared capabilities propagate to derived paths.
  path.parentPath?.scope.getBinding('x');
  path.getProgramParent()?.scope.getBinding('x');
});
defineVisitor(
  'CallExpression',
  {
    fields: ['argumentCount'],
    ancestry: {
      mode: 'findParent',
      routes: {
        VariableDeclarator: { fields: ['bindingName'] },
        AssignmentExpression: { fields: ['targetName'] },
        TryStatement: {
          children: { block: { route: 'BlockStatement' } },
        },
      },
    },
  },
  path => {
    path.findParent(ancestor => {
      if (ancestor.node.type === 'VariableDeclarator') ancestor.node.bindingName?.toUpperCase();
      if (ancestor.node.type === 'AssignmentExpression') ancestor.node.targetName?.toUpperCase();
      // @ts-expect-error Originating visitor fields do not leak onto ancestors.
      ancestor.node.argumentCount;
      if (ancestor.node.type === 'TryStatement') ancestor.getChild('block')?.getSource().text();
      return false;
    });
  },
);
defineVisitor(
  'Identifier',
  {
    // @ts-expect-error Ancestry routes cannot contain event-delivery predicates.
    ancestry: { mode: 'findParent', routes: { VariableDeclarator: { where: {} } } },
  },
  () => {},
);

// P8 — traverse requires the state its visitors require.
interface CounterState {
  count: number;
}
const statefulNested = defineVisitor('Identifier', {}, (_path, state: CounterState) => {
  state.count++;
});
const statelessNested = defineVisitor('Identifier', {}, () => {});
defineVisitor('Function', { controlFlow: ['nested-traverse'] }, path => {
  path.traverse([statelessNested]);
  path.traverse([statefulNested], { count: 0 });
  // @ts-expect-error stateful visitors require their state argument.
  path.traverse([statefulNested]);
  // @ts-expect-error the provided state must match the visitors' state.
  path.traverse([statefulNested], { other: true });
});
