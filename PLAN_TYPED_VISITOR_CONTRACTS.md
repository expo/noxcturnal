# Typed per-visitor contracts plan

Status: reviewed 2026-07-24 against the current architecture (piece-table editor,
compiled dispatch routes, native relocation, intent registry). The proposal holds:
the dual representation it describes is still exactly how plugins are authored
(`PluginPlan` aggregates route-keyed `fields`/`where`/`children` and plugin-wide
capabilities, while `visitorRouteVariants` derives routes from the visitor object
separately), and the compiled-route machinery (`CompiledRouteTemplate` →
coalesced `DispatchRoute` → `packRouteManifest`) is the right substrate to compile
`DefinedVisitor`s into directly. Fresh evidence for the single-source-of-truth
argument: a route-manifest `order` field was validated against the wrong bound
(route count instead of plugin ordinal) and only surfaced when a pre-only plugin
preceded a predicated visitor plugin — precisely the class of drift this plan
eliminates by generating the manifest from one normalized contract object.

Sequencing note: this is an authoring-API and compiler workstream, independent of
the native preflight transforms plan (`PLAN_NATIVE_PREFLIGHT_TRANSFORMS.md`).
Phases 1–2 here should land
before or alongside any large expansion of first-party visitors (display-name,
Refresh, RSC analysis from that plan's N-stages), so new visitors are written
against the typed surface once instead of migrated later.

## Objective

Make the optimized visitor contract local to each visitor instead of requiring plugin authors to
manually keep a distant aggregate `prepare()` plan synchronized with handler behavior.

The new API should:

- preserve the familiar visitor callback shape;
- make undeclared node fields, scope, ancestry, children, and dynamic operations TypeScript errors;
- generate the compiled native route manifest directly from per-visitor definitions;
- aggregate shared parse, semantic, index, and payload requirements automatically;
- support distinct predicates and capabilities for multiple callbacks on the same node type;
- retain runtime validation for JavaScript consumers and unsafe casts; and
- improve ergonomics without broadening native delivery or regressing dispatch performance.

This is primarily an API and compiler change. It should not introduce another runtime layer around
each callback. Wrappers are consumed when the plugin/pipeline is defined and compiled into the same
numeric routes used today.

## Problem statement

The current API represents a plugin twice:

```ts
defineNativePlugin({
  prepare() {
    return {
      fields: { VariableDeclaration: ['kind'], Identifier: ['name', 'binding'] },
      where: {
        VariableDeclaration: { kind: { oneOf: ['let', 'const'] } },
      },
      semantics: ['scope'],
      ancestry: 'parent',
      children: {
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id'],
      },
      controlFlow: ['nested-traverse'],
    };
  },
  visitor: {
    VariableDeclaration(path) {
      // The implementation must remain synchronized with prepare().
    },
  },
});
```

The visitor implementation expresses what the plugin does, while `prepare()` separately describes
what it is allowed to observe and invoke. TypeScript currently gives the callback a full
`NativeNodePath`, so it cannot prove that the declaration is complete.

The recent Expo integration exposed the failure modes:

- `path.traverse()` was used without declaring `nested-traverse`;
- a `Function` alias expansion bug caused nested traversal to miss arrow functions; and
- native predicates and callback guards can drift apart.

Runtime rejection is preferable to silent behavior, but these errors should normally be impossible
to author.

## Proposed authoring API

Add `defineVisitor` and accept typed visitor definitions through a new `visitors` property:

```ts
import { defineNativePlugin, defineVisitor } from 'noxcturnal';

const variableDeclaration = defineVisitor(
  'VariableDeclaration',
  {
    fields: ['kind'],
    where: { kind: { oneOf: ['let', 'const'] } },
    scope: true,
    ancestry: 'parent',
    children: {
      declarations: {
        route: 'VariableDeclarator',
        children: {
          id: {
            route: 'Identifier',
            fields: ['name', 'binding'],
          },
        },
      },
    },
    controlFlow: ['nested-traverse'],
  },
  (declaration, state) => {
    declaration.node.kind;
    declaration.scope.getBinding('value');
    declaration.parentPath;
    declaration.getChildList('declarations')[0]?.getChild('id');
    declaration.parentPath?.traverse({ Function() {} });
  },
);

const plugin = defineNativePlugin({
  name: 'simple-block-scoping',
  visitors: [variableDeclaration],
  createState: () => ({ renamed: 0 }),
});
```

The route is explicit because it gives TypeScript a stable generic parameter before it checks the
contract and callback. Depending on contextual inference from an object property would be fragile,
especially for aliases, composites, and reusable visitor definitions.

### Enter and exit handlers

Support the existing shape:

```ts
defineVisitor(
  'Function',
  { fields: ['name'], ancestry: 'parent' },
  {
    enter(path, state) {},
    exit(path, state) {},
  },
);
```

Enter and exit share one contract initially. A later overload may accept separate contracts only if
measurement shows meaningful payload savings.

### Reusable visitor factories

Provide a state-bound helper to reduce repeated generics:

```ts
const visit = createVisitorFactory<BlockState>();

const plugin = defineNativePlugin<BlockState>({
  name: 'simple-block-scoping',
  visitors: [
    visit('VariableDeclaration', contract, (path, state) => {
      state.renamed++;
    }),
  ],
});
```

`defineVisitor` remains convenient when state inference comes from `defineNativePlugin`; the factory
is the explicit option for exported/reused visitor definitions.

### Multiple visitors for one route

Arrays naturally allow separate contracts:

```ts
visitors: [
  visit(
    'CallExpression',
    {
      fields: ['staticArgument'],
      where: { calleeName: { equals: 'require' } },
    },
    collectRequire,
  ),
  visit(
    'CallExpression',
    {
      fields: ['argumentCount'],
      where: { calleeName: { equals: 'require.context' } },
    },
    collectContext,
  ),
];
```

These must compile to two native routes. They must not be collapsed into the current plugin-wide
`where.CallExpression` representation.

## Contract model

Conceptual public types:

```ts
export interface VisitorContract<Route extends NativeVisitorRoute> {
  fields?: readonly FieldsForRoute<Route>[];
  where?: Readonly<Partial<Record<PredicateFieldsForRoute<Route>, ScalarPredicate>>>;
  scope?: boolean;
  ancestry?: AncestryCapability;
  children?: ChildContractMap<Route>;
  controlFlow?: readonly ControlFlowCapability[];
  queries?: readonly QueryRequest[];
}

export interface DefinedVisitor<
  Route extends NativeVisitorRoute,
  State,
  Contract extends VisitorContract<Route>,
> {
  readonly route: Route;
  readonly contract: Contract;
  readonly handler: TypedVisitorHandler<Route, State, Contract>;
}
```

The actual types should be generated from the protocol schema wherever possible. Avoid manually
maintaining another mapping of routes, fields, predicates, aliases, or child roles.

### Callback-visible node type

`path.node` exposes only base identity/range properties plus declared payload fields:

```ts
type ContractNode<Route, Contract> = BaseNodeForRoute<Route> &
  Pick<FullNodeForRoute<Route>, Contract['fields'][number]>;
```

Predicate-only fields are not callback-visible unless they also appear in `fields`:

```ts
defineVisitor('VariableDeclaration', { where: { kind: { equals: 'const' } } }, path => {
  // @ts-expect-error `kind` was used for native matching but not transferred.
  path.node.kind;
});
```

This distinction ensures the type model reflects the wire payload rather than native match-time
access.

Base properties should include only values always present in routed records, such as `id`, `type`,
`start`, and `end`. Scope and parent identifiers should not appear unless required by the declared
capabilities.

### Capability-narrowed path

Build the handler path as an intersection of capabilities:

```ts
type ContractPath<Route, Contract> = BasePath<ContractNode<Route, Contract>> &
  ScopeCapability<Contract> &
  AncestryCapabilityPath<Contract> &
  ChildCapabilities<Route, Contract> &
  ControlFlowCapabilities<Contract>;
```

Examples:

- `path.scope` exists only when `scope: true`.
- `path.parent` and `path.parentPath` exist only when ancestry includes `parent` or a broader mode.
- `findParent` exists only for `findParent` or a broader ancestry declaration.
- `getFunctionParent` and `getProgramParent` require their corresponding ancestry capability.
- `getChild('id')` accepts only declared singular child roles.
- `getChildList('declarations')` accepts only declared list roles.
- `getChildren()` requires an explicit wildcard child contract.
- `skip`, `stop`, `traverse`, and subscription methods exist only when their corresponding
  `controlFlow` capability is declared.

Always-available APIs should remain small:

- `node`;
- `context` with a capability-narrowed metadata/query view;
- source and location access;
- type narrowing via `is()`;
- edit operations;
- diagnostics and `unsupported()`.

### Typed children

Child contracts should recursively type returned paths:

```ts
children: {
  declarations: {
    route: 'VariableDeclarator',
    children: {
      id: { route: 'Identifier', fields: ['name', 'binding'] },
    },
  },
}
```

This produces:

```ts
const declarator = path.getChildList('declarations')[0];
// Typed as VariableDeclarator.
const id = declarator?.getChild('id');
// Typed as Identifier with name and binding.
```

Use generated child-role cardinality where Oxc exposes it. If cardinality is not yet represented in
the schema, introduce a generated `child-schema.json` containing parent type, role, possible child
routes, and singular/list cardinality. Until that exists, require authors to specify `route` and
validate it at runtime.

Limit recursive child-contract depth to a practical compile-time and runtime maximum, initially 8.
Cycles must be rejected.

### Scope and binding types

`scope: true` enables `NativeScope`, but values returned from bindings should reflect the fields
actually retained by semantic queries. Initially, retain the existing `NodeSummary`/`NodeView`
binding result types. A subsequent improvement can allow:

```ts
scope: {
  bindings: { declaration: ['name'], references: ['name', 'read', 'write'] },
}
```

Do not block the first release on fully parameterizing every scope result.

### Queries and metadata

`context` is one object shared by every visitor of a plugin, so its static type cannot vary
per visitor. Per-visitor `queries` declarations are therefore _requirement declarations_ that
union into the phase plan (like `fields`), while the `query()`/metadata **types** come from the
plugin-level contract below. Plugin lifecycle hooks need plugin-wide queries and metadata anyway,
so introduce a separate typed plugin contract:

```ts
defineNativePlugin({
  name: 'dependencies',
  contract: {
    metadata: { writes: ['dependencies'], reads: ['module-kind'] },
    queries: [{ calls: [{ callee: 'require', staticArguments: true }] }],
  },
  visitors: [...],
  post(context, state) {
    context.metadata.set('dependencies', state.dependencies);
  },
});
```

Visitor-local requirements and plugin lifecycle requirements are unioned when preparing the phase.
Metadata key ownership remains plugin-wide rather than route-wide.

## Dynamic configuration

Contracts need both static type information and per-file values.

### Static shape, dynamic enablement

Allow a visitor to be enabled without changing its capability shape:

```ts
visit(
  'Identifier',
  {
    fields: ['name'],
    enabled(context, options) {
      return options.inlineDefines;
    },
  },
  handler,
);
```

### Dynamic predicate values

Allow predicate values to be resolved during preparation while their field/operator shape remains
static:

```ts
where: context => ({
  name: { oneOf: context.options.defineNames },
});
```

The return type must remain constrained to valid predicate fields and scalar operations. Cache keys
include the resolved contract values, as they do for prepared plans today.

Do not allow dynamic functions for `fields`, children, scope, ancestry, or control-flow shape. Those
determine the callback's TypeScript type. Authors can define two separately typed visitors and
enable one conditionally.

## Plugin definition and compatibility

### New preferred form

```ts
defineNativePlugin({
  name: 'plugin',
  visitors: [visit(...)],
});
```

### Existing form

Keep `visitor` plus `prepare()` temporarily for migration and unusual dynamic integrations:

```ts
defineNativePlugin({
  name: 'legacy-plugin',
  prepare() {
    return plan;
  },
  visitor: { Identifier(path) {} },
});
```

Rules:

- A plugin may not specify both `visitor` and `visitors`.
- Typed `visitors` may coexist with a reduced `prepare()` that only controls plugin enablement and
  other non-route lifecycle settings during migration.
- Route requirements in typed `visitors` are authoritative and cannot be weakened by `prepare()`.
- Plugin-level requirements are unioned with visitor requirements.
- The legacy form remains runtime-validated but does not receive the narrowed path types.
- **End state is one authoring surface.** Per the project's standing no-legacy-paths rule, and
  because all consumers are first-party (the Expo transformer, tests, and benchmarks), the
  aggregate-route form is a migration vehicle, not a permanent escape hatch: once phase 5
  completes, route-related `PluginPlan` fields (`subscriptions`, `fields`, `where`,
  `identifierNames`, `staticMemberPatterns`, `children`, route-level `controlFlow`) are deleted
  and `prepare()` keeps only its non-route role (enablement, `sourceHints`-driven decisions,
  lifecycle settings). Breaking the old shape is acceptable; keeping two visitor compilers is not.

## Compilation and aggregation

`defineVisitor` should return frozen data; it must not wrap the callback at execution time.

When defining/preparing a plugin:

1. Validate the route and contract against generated schema types at runtime.
2. Resolve dynamic enablement and predicate values.
3. Expand aliases and composite routes from the generated alias table.
4. Create one or more compiled route templates tied to the exact handler.
5. Distinguish predicate-only fields from callback payload fields.
6. Compile child contracts into index/materialization requirements.
7. Aggregate scope, ancestry, query, child, exit, and control-flow requirements across enabled
   visitors.
8. Build the existing native route manifest and JavaScript route-thunk table.

Aggregation rules:

- Fields and index requirements are unioned across routes.
- Predicates remain attached to their exact route; they are never unioned plugin-wide.
- Scope/ancestry/index requirements may be shared at phase level after route compilation.
- Enter and exit callback order follows visitor array order, with exits reversed exactly as today.
- Reusing one `DefinedVisitor` object in several plugins creates separate plugin route ownership and
  state bindings.
- Identical native match/payload contracts may share one node record while retaining separate route
  deliveries.

The current `compilePhaseRoutes` machinery should consume `DefinedVisitor` directly. Avoid lowering
typed visitors back into the lossy plugin-wide `PluginPlan.where` representation.

## Nested visitors

Nested traversal currently accepts an untyped `Visitor`. Extend it to accept typed definitions:

```ts
const nestedFunction = visit('Function', { fields: ['name'] }, fn => {});

path.traverse([nestedFunction]);
```

Requirements:

- The outer visitor must declare `nested-traverse`.
- Nested visitor contracts compile into their own routed manifest and are cached by definition
  identity.
- Nested aliases must use the same generated expansion table as top-level visitors.
- Retained-session materialization must support node families not present in the initial visitor
  set, reparsing lazily when necessary.
- Existing object visitors remain accepted on the legacy slow path during migration.

Add the recently discovered `Function` to `ArrowFunctionExpression` regression as a permanent
top-level and nested contract test.

## Runtime enforcement and development verification

Type safety does not cover JavaScript, `any`, unsafe casts, or dependencies built against mismatched
types. Preserve runtime enforcement.

### Contract-scoped paths

Every route thunk binds the exact compiled contract to its path runtime. Path methods verify the
route contract, not only the plugin-wide aggregate. This prevents one broad visitor from granting
undeclared access to every other visitor in the plugin.

For example, if one visitor declares scope and another does not, only the first callback can use
`path.scope`, even though the native phase built semantic information once.

### Verification mode

Add a development/test-only option:

```ts
transform(source, filename, pipeline, {
  verifyVisitorContracts: true,
});
```

It should:

- report the plugin, route, callback side, and missing capability;
- report undeclared field reads with a suggested contract fragment;
- validate child route/cardinality assumptions;
- compare native predicate delivery with an unfiltered diagnostic traversal for sampled files;
- detect handlers that redundantly repeat an exactly equivalent native predicate guard; and
- optionally report declared fields/capabilities that were never used.

Verification may be slower and must default off. Production retains cheap explicit capability
checks for dangerous operations.

## Type-generation work

Extend schema generation to produce:

- scalar payload fields by concrete route;
- predicate-capable fields and scalar value types;
- route aliases and their concrete expansions;
- child roles, possible child routes, and cardinality where available;
- base fields always present in routed records; and
- type-level mappings used by `ContractNode`, `ChildContractMap`, and predicate contracts.

Rust and TypeScript must consume the same generated alias and field data. Do not retain separate
handwritten `alias()` semantics after typed contracts land. The `Function` alias regression shows
why a single source of truth is required.

Add code-generation checks that fail CI when Oxc adds or changes node variants, scalar fields, or
child roles.

## Implementation phases

### Phase 1: Core typed visitor and shallow capabilities

- Add `defineVisitor` and `createVisitorFactory`.
- Add `visitors` to `NativePluginDefinition` and forbid mixing it with `visitor`.
- Narrow callback node fields, scope, ancestry, and control-flow methods.
- Compile typed visitors directly into existing route templates/manifests.
- Aggregate phase requirements automatically.
- Add type tests for valid and invalid access.

Exit criteria:

- No additional wrapper function appears in the hot callback stack.
- Static visitor benchmarks remain within 2% of the current implementation.
- Undeclared fields and control-flow methods fail TypeScript tests.

### Phase 2: Typed predicates and multiple same-route visitors

- Type predicate fields and scalar values by route.
- Keep match-only fields off the JS payload.
- Support independent predicates for multiple callbacks on the same concrete route.
- Add dynamic enablement and dynamic predicate values.
- Preserve exact enter/exit order.

Exit criteria:

- Block scoping can express `let|const` delivery without an aggregate `prepare()` plan.
- Two differently filtered `CallExpression` visitors receive the correct disjoint/overlapping sets.
- Predicate selectivity benchmarks remain unchanged or improve.

### Phase 3: Typed children and nested visitors

- Generate or introduce child-role schema information.
- Add recursively typed child contracts.
- Compile typed nested visitor arrays.
- Unify top-level and nested alias expansion.
- Validate lazy materialization of undeclared initial node families.

Exit criteria:

- Expo block scoping and ESM transforms migrate without casts for ordinary child access.
- Function aliases include arrow functions in both top-level and nested traversal tests.
- Child-heavy and nested benchmarks do not regress by more than 3%.

### Phase 4: Plugin lifecycle contracts and verification

- Add typed metadata and query declarations for lifecycle hooks.
- Bind exact route contracts to runtime path enforcement.
- Implement `verifyVisitorContracts` diagnostics and unused-contract reporting.
- Add actionable error suggestions.

Exit criteria:

- First-party plugins pass verification across the captured Expo corpus.
- Verification catches intentionally injected missing field, scope, child, and control-flow
  declarations.

### Phase 5: First-party migration and deprecation

- Migrate the Expo Metro Noxcturnal pipeline visitor by visitor.
- Migrate Noxcturnal benchmarks and examples.
- Snapshot compiled manifests for representative plugins.
- Mark route-related aggregate `prepare()` fields as deprecated for typed plugins.
- Document the legacy escape hatch and future API-version policy.

Exit criteria:

- Expo's Noxcturnal transformer contains no handwritten aggregate route plan for migrated visitors.
- All Noxcturnal and Expo correctness tests pass; route-related `PluginPlan` fields and the
  `visitor`-object compiler path are deleted.
- The controlled equivalent-pass plugin benchmarks hold their current margins (this gate is the
  isolated plugin-stack comparison, not the traced whole-file number: the 2026-07-24 trace
  measures the full route at 5.3x aggregate over Babel's matched stages, which includes parse and
  render work outside this plan's scope).

## Type-safety test matrix

Use `vitest --typecheck` and `@ts-expect-error` fixtures for:

| Area        | Required cases                                                              |
| ----------- | --------------------------------------------------------------------------- |
| Fields      | declared, undeclared, wrong route, predicate-only, incompatible scalar type |
| Routes      | concrete, alias, composite, misspelled, collapsed function/class            |
| Scope       | absent by default, enabled, binding results                                 |
| Ancestry    | parent only, findParent, function parent, program parent, insufficient mode |
| Children    | singular, list, undeclared role, wrong route, recursive depth               |
| Control     | skip, stop, nested traversal, dynamic subscriptions, undeclared method      |
| Handlers    | function, enter, exit, shared state, reusable exported visitor              |
| Composition | repeated routes, different predicates, plugin state mismatch                |
| Dynamic     | enabled callback, predicate factory, forbidden dynamic capability shape     |
| Lifecycle   | typed metadata keys, query declarations, analyze/apply state                |

Runtime tests must mirror the important type cases because JavaScript consumers bypass compile-time
checking.

## Performance and usability gates

Measurement discipline: record `pnpm benchmark` before starting (current record:
`bench-ws6-r1-c1-final.txt`, 2026-07-24 — `static JavaScript visitor transform` ~0.37 ms,
`12-plugin JavaScript visitor fan-out` ~0.55 ms, predicate-selectivity suite ~0.17–0.31 ms).
Full-suite runs drift ~5% on this machine; any suspected delta on the dispatch benches gets a
dedicated interleaved A/B (swap `.node` + `dist` between alternating rounds) before acceptance.

Benchmark before and after each phase:

- narrow static visitor;
- enter/exit visitor;
- twelve-plugin fan-out;
- seven disjoint visitors;
- 0%, 1%, 10%, and 100% predicate selectivity;
- scope and ancestry;
- structural children;
- nested traversal;
- Expo-like equivalent plugin stack; and
- captured Expo corpus.

Required gates:

- no hot callback wrapper allocation or additional per-event contract parsing;
- no more than 2% regression for narrow and fan-out static workloads (interleaved A/B, not
  single-suite deltas);
- no more than 3% regression for dynamic/nested workloads;
- routed tape byte counts remain unchanged for equivalent contracts;
- the controlled equivalent-pass margin over Babel holds through the Expo migration; and
- first-party plugin source should become shorter or materially more local, not merely move the same
  declarations into a differently shaped object.

Track usability with concrete metrics:

- lines of contract versus handler code;
- number of explicit casts in first-party plugins;
- number of separate node-type names repeated in one visitor definition;
- verification warnings across the corpus; and
- quality of TypeScript errors for common mistakes.

## Risks and mitigations

### Type complexity and compiler performance

Recursive conditional types can slow TypeScript or produce unreadable errors. Generate shallow
lookup types, cap child depth, and use named intermediate types. Add a typecheck benchmark for a
large plugin definition.

### Contracts become more verbose than `prepare()`

Keep simple visitors simple:

```ts
visit('ImportMeta', {}, path => path.replaceWith(...));
```

Provide factories and reusable child contracts, but avoid a large fluent DSL. Evaluate the API by
migrating block scoping, dependencies, ESM, and function maps before freezing names.

### Aggregate sharing leaks capabilities

Separate native phase requirements from callback-visible route capabilities. Native work can be
unioned; path permissions cannot.

### Static types promise more than runtime payloads

Generate manifest payload fields from the same normalized contract object used to derive callback
types. Freeze definitions, validate manifests, and test schema/version skew.

### Dynamic plugins cannot express a stable type

Require separate conditionally enabled visitors for different capability shapes. Retain the legacy
aggregate API as an explicit escape hatch rather than weakening every typed callback.

### Alias or child schema drift

Generate Rust and TypeScript lookup data from one schema and test each alias against representative
concrete nodes. Never maintain top-level and nested alias tables independently.

## Expected outcome

The optimized contract becomes local, typed, reusable, and mechanically compiled:

- authors see requirements beside the callback that uses them;
- TypeScript prevents most missing-field and missing-capability errors;
- multiple same-route visitors can have independently optimized predicates;
- native phase requirements remain automatically fused;
- runtime verification catches JavaScript and unsafe-cast violations; and
- the hot dispatcher receives the same or a more precise compiled manifest without extra callback
  wrappers.

This should recover much of Babel's visitor ergonomics while retaining Noxcturnal's compiled-route
performance model. It also creates the right foundation for future tooling that infers or generates
visitor contracts, without requiring source-code analysis to make the first version safe and useful.
