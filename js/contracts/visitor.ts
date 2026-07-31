import type {
  NativeChildRoles,
  NativeNodeFields,
  NativeRouteFields,
  NativeRoutePredicates,
  NativeRouteTypes,
} from '../generated/event-schema';
import { native } from '../native/binding';
import type {
  ControlFlowCapability,
  Diagnostic,
  EditEffect,
  InspectRequest,
  NativeFieldKey,
  NativeNodeType,
  NativeVisitorRoute,
  NodeOfType,
  NodeSummary,
  NodeView,
  QueryRequest,
  QueryResult,
  ScalarPredicate,
  ScalarValue,
  SourceLocation,
  TransformOptions,
} from '../types';

export class NativeTransformError extends Error {
  constructor(
    message: string,
    readonly diagnostics: Diagnostic[],
    /** Owning plugin names of a conflict, structured for fallback telemetry. */
    readonly owners?: readonly string[],
  ) {
    super(message);
    this.name = 'NativeTransformError';
  }
}

export interface PrepareContext {
  readonly filename: string;
  readonly options: TransformOptions;
  readonly parser: ReturnType<typeof native.classify>;
  readonly sourceHints: ReadonlySet<string>;
  readonly pluginData: unknown;
}

export interface NativeScope {
  readonly id: number;
  readonly parentId: number | null;
  readonly parent: NativeScope | null;
  readonly path: NativeNodePath | null;
  hasBinding(name: string): boolean;
  hasGlobal(name: string): boolean;
  getBinding(name: string): NativeBinding | null;
  getBindings(names: readonly string[]): NativeBinding[];
  getProgramParent(): NativeScope;
  push(content: Code): void;
  generateUid(name?: string): string;
  rename(name: string, replacement?: string): string;
}

export interface NativeBinding {
  readonly name: string;
  readonly global: boolean;
  readonly scopeId?: number;
  readonly declaration: NodeSummary | null;
  readonly references: readonly (NodeView | NodeSummary)[];
  readonly path: NativeNodePath | null;
  readonly scope: NativeScope | null;
}

export interface PluginContext {
  readonly filename: string;
  readonly phase: string;
  readonly pluginData: unknown;
  readonly source: string;
  readonly metadata: MetadataWriter;
  query(request: QueryRequest): QueryResult;
  inspect(requests: readonly InspectRequest[]): NodeView[];
  diagnostic(diagnostic: Omit<Diagnostic, 'plugin' | 'phase'>): void;
  unsupported(reason: string): never;
  stopAll(): void;
  subscribeRemaining(...types: string[]): void;
  /** Revisit the program with visitors whose handlers require no state. */
  revisitProgram(visitors: readonly DefinedVisitor<unknown>[]): void;
  /** Revisit the program with stateful visitors; their state is mandatory. */
  revisitProgram<State>(visitors: readonly DefinedVisitor<State>[], state: State): void;
  /**
   * Insert a helper at the end of the directive prologue, once per transform.
   *
   * The registry lives on the transform, so re-ensuring a key in a later phase is a
   * no-op — including across plugins when they deliberately share a key. Ensuring the
   * same key with different realized content is a loud error naming both owners.
   * Helpers land one per line in first-ensure order. Keys are namespaced by
   * convention (`pluginName/helper`) unless deliberately shared.
   */
  ensureHelper(key: string, code: Code): void;
  /**
   * Replace a range under a keyed, idempotent intent, once per transform.
   *
   * The registry lives on the transform: re-ensuring a key with identical realized
   * content — from any plugin, or from a later phase — is a no-op, so plugins that
   * deliberately share a key claim the same tokens through one edit owned by the
   * first registrant. The same key with divergent realized content (or a different
   * range in the same phase) is a loud error naming both owners. Distinct keys on
   * overlapping ranges stay ordinary overlap conflicts.
   */
  ensureReplace(key: string, start: number, end: number, code: Code): void;
  /** A provenance-carrying fragment of the current phase's source. */
  sourceSlice(start: number, end: number): SourceFragment;
  readonly code: CodeFactory;
  readonly editor: NativeEditor;
}

export interface NativeEditor {
  append(content: string): void;
  prepend(content: string): void;
  appendLeft(offset: number, content: string): void;
  prependLeft(offset: number, content: string): void;
  appendRight(offset: number, content: string): void;
  prependRight(offset: number, content: string): void;
  update(start: number, end: number, content: string): void;
  overwrite(start: number, end: number, content: string): void;
  remove(start: number, end: number): void;
  move(start: number, end: number, destination: number): void;
  reset(start: number, end: number): void;
  indent(prefix?: string): void;
  trim(): void;
  trimStart(): void;
  trimEnd(): void;
  addSourceMapLocation(offset: number): void;
  hasChanged(): boolean;
  replace(
    search: string | RegExp,
    replacement: string | ((match: string, ...groups: string[]) => string),
  ): void;
  replaceAll(
    search: string | RegExp,
    replacement: string | ((match: string, ...groups: string[]) => string),
  ): void;
  slice(start?: number, end?: number): string;
  toString(): string;
  isEmpty(): boolean;
}
export interface CodeFragment {
  code: string;
  mapping: 'sourceless' | 'anchor-start' | 'anchor-boundaries' | 'identity';
  names?: readonly string[];
}
/**
 * A provenance-carrying slice of the current phase's source.
 *
 * Returned by `path.getSource()`. Replacements built from source fragments keep the
 * referenced ranges original-source-backed, so edits from other plugins inside those
 * ranges compose instead of conflicting, and source maps stay exact. Coercing a
 * fragment to a string throws: copying source text without provenance is the explicit
 * escape hatch `path.sourceText()` / `fragment.text()`.
 */
export interface SourceFragment {
  readonly kind: 'source';
  readonly start: number;
  readonly end: number;
  /** Copy the slice as plain text, deliberately discarding provenance. */
  text(): string;
}
/** Template output mixing literal text, code fragments, and source fragments. */
export interface CompositeFragment {
  readonly kind: 'composite';
  readonly parts: readonly (string | CodeFragment | SourceFragment)[];
}
/** Any value accepted where replacement content is expected. */
export type Code = string | CodeFragment | SourceFragment | CompositeFragment;
export interface CodeFactory {
  identifier(name: string): CodeFragment;
  stringLiteral(value: string): CodeFragment;
  literal(value: string | number | boolean | bigint | null): CodeFragment;
  template(parts: TemplateStringsArray, ...values: readonly (Code | NativeNodePath)[]): Code;
  parseExpression(code: string, parserMode?: TransformOptions['parser']): CodeFragment;
  parseStatements(code: string, parserMode?: TransformOptions['parser']): CodeFragment;
}
export interface MetadataWriter {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
}
export type TransformDecision<Analysis = unknown> =
  | { status: 'irrelevant' }
  | { status: 'supported'; analysis: Analysis }
  | { status: 'unsupported'; reason: string; location?: SourceLocation };

export interface NativeNodePath<T extends NodeView = NodeView> {
  readonly id: number;
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly node: T;
  readonly parent: NodeSummary | null;
  readonly parentPath: NativeNodePath | null;
  readonly scope: NativeScope;
  readonly context: PluginContext;
  getSource(): SourceFragment;
  /** The node's source as plain text, without provenance. */
  sourceText(): string;
  snapshot(options?: SnapshotOptions): Readonly<T>;
  getLocation(): SourceLocation;
  is<TType extends NativeNodeType>(type: TType): this is NativeNodePath<NodeOfType<TType>>;
  get(key: string): NativeNodePath | readonly NativeNodePath[] | null;
  getChild(key: string): NativeNodePath | null;
  getChildList(key: string): readonly NativeNodePath[];
  getChildren(): readonly NativeNodePath[];
  matchesPattern(pattern: string, allowPartial?: boolean): boolean;
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null;
  find(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null;
  getFunctionParent(): NativeNodePath | null;
  getProgramParent(): NativeNodePath | null;
  replaceWith(code: Code): void;
  replaceWithMultiple(code: readonly Code[]): void;
  update(code: Code): void;
  overwrite(code: Code): void;
  remove(): void;
  insertBefore(code: Code): void;
  insertAfter(code: Code): void;
  /** Relocate this node's source range: contained edits from any plugin apply
   * inside the moved content wherever it lands. */
  moveTo(destination: number): void;
  unshiftContainer(key: 'body', code: Code | readonly Code[]): void;
  pushContainer(key: 'body', code: Code | readonly Code[]): void;
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line?: boolean): void;
  buildCodeFrameError(message: string): NativeTransformError;
  prependToBody(code: Code): void;
  appendToBody(code: Code): void;
  skip(): void;
  stop(): void;
  /** Traverse with visitors whose handlers require no state. */
  traverse(visitors: readonly DefinedVisitor<unknown>[]): void;
  /** Traverse with stateful visitors; the state they require is mandatory. */
  traverse<State>(visitors: readonly DefinedVisitor<State>[], state: State): void;
  subscribeWithin(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  subscribeForScope(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  unsupported(reason: string): never;
}

export interface SnapshotOptions {
  fields?: readonly string[];
  ancestry?: 'none' | 'parent';
}

/** Internal callback shape after normalization; typing happens at `defineVisitor`. */
export type Handler<State, Node extends NodeView = NodeView> = (
  path: NativeNodePath<Node>,
  state: State,
) => void;

// ---------------------------------------------------------------------------
// Typed per-visitor contracts: the contract lives beside the callback that uses
// it, the callback's path type is derived from the contract, and the compiled
// native route manifest is generated from the same normalized object.
// ---------------------------------------------------------------------------

export type AncestryCapability =
  | 'parent'
  | 'findParent'
  | 'functionParent'
  | 'programParent'
  | number;

export type AncestryMode = AncestryCapability;

/** A visitor route: one route name or a `|`-joined composite. */
export type VisitorRouteSpec = NativeVisitorRoute | `${NativeVisitorRoute}|${string}`;

/** The segments of a composite route, as a union. */
type RouteSegments<Route extends string> = Route extends `${infer Head}|${infer Rest}`
  ? Head | RouteSegments<Rest>
  : Route;

/** Compile-time mirror of `concreteRouteTypes`: every composite segment must be a
 * route name. Valid specs resolve to `unknown` (an identity intersection); invalid
 * segments resolve to an explanatory literal the compiler surfaces. */
type ValidRouteSpec<Route extends string> = Route extends `${infer Head}|${infer Rest}`
  ? Head extends NativeVisitorRoute
    ? ValidRouteSpec<Rest>
    : `Unknown route segment '${Head}'`
  : Route extends NativeVisitorRoute
    ? unknown
    : `Unknown route segment '${Route}'`;

/** The concrete node types one route segment can deliver. */
type SegmentNodeTypes<Segment extends string> = Segment extends keyof NativeRouteTypes
  ? NativeRouteTypes[Segment]
  : Extract<Segment, NativeNodeType>;

/** The concrete node types a route (or composite) can deliver. */
type RouteNodeTypes<Route extends string> = SegmentNodeTypes<RouteSegments<Route>>;

/** A segment's field row: explicit route rows cover aliases and specializations;
 * concrete carriers resolve straight to their generated node row. */
type SegmentFieldsRow<Segment extends string> = Segment extends keyof NativeRouteFields
  ? NativeRouteFields[Segment]
  : Segment extends keyof NativeNodeFields
    ? NativeNodeFields[Segment]
    : {};

/** Payload fields declarable for a route: any field some concrete type in the
 * expansion emits (union semantics, matching how the native side realizes them). */
type DeclaredFieldKey<Route extends string> =
  RouteSegments<Route> extends infer Segment
    ? Segment extends string
      ? Extract<keyof SegmentFieldsRow<Segment>, NativeFieldKey>
      : never
    : never;

/** A segment's predicate row. Concrete carriers derive it from their node row:
 * the schema validates that predicate fields and typed fields coincide, and
 * predicates ignore emission optionality (a missing field simply never matches). */
type SegmentPredicateRow<Segment extends string> = Segment extends keyof NativeRoutePredicates
  ? NativeRoutePredicates[Segment]
  : Segment extends keyof NativeNodeFields
    ? { [K in keyof NativeNodeFields[Segment]]-?: Exclude<NativeNodeFields[Segment][K], undefined> }
    : {};
/** Union of the segments' predicate rows; `keyof` over it intersects the keys,
 * mirroring the runtime rule that a predicate must hold for every concrete type. */
type RoutePredicateRows<Route extends string> = SegmentPredicateRow<RouteSegments<Route>>;
type RoutePredicateKeys<Route extends string> = keyof RoutePredicateRows<Route> & string;

/** Native match predicates declarable for a route, typed by the field's wire
 * value. Routes whose expansion shares no predicate fields accept none. */
export type RouteWhere<Route extends string> = {
  readonly [K in RoutePredicateKeys<Route>]?: ScalarPredicate<
    Extract<RoutePredicateRows<Route>[K], ScalarValue>
  >;
};

type SegmentChildRow<Segment extends string> = Segment extends keyof NativeChildRoles
  ? NativeChildRoles[Segment]
  : {};
type RouteChildRows<Route extends string> = SegmentChildRow<RouteSegments<Route>>;
/** Child roles declarable for a route: the role must exist on every segment. */
type RouteChildRoleNames<Route extends string> = keyof RouteChildRows<Route> & string;
/** The concrete node types a role may deliver across the route's segments. */
type RouteChildTypes<Route extends string, Role extends string> =
  RouteChildRows<Route> extends infer Row
    ? Row extends object
      ? Role extends keyof Row
        ? Row[Role] extends { readonly child: infer Child }
          ? Child
          : never
        : never
      : never
    : never;
type RouteChildIsList<Route extends string, Role extends string> =
  RouteChildRows<Route> extends infer Row
    ? Row extends object
      ? Role extends keyof Row
        ? Row[Role] extends { readonly list: infer IsList }
          ? IsList
          : never
        : never
      : never
    : never;

/** One declared child role: the expected route and the fields its paths carry. */
export interface ChildContract {
  route: VisitorRouteSpec;
  fields?: readonly NativeFieldKey[];
  /** Grandchild declarations for deep structural reads. Only the first level is
   * statically typed; deeper paths are base-typed and runtime-validated. */
  children?: Readonly<Record<string, ChildContract>>;
}

/** Ancestor routes reuse the ordinary field/child contract language. Runtime
 * predicates are deliberately absent: hydration must be determined statically. */
export type AncestorRouteContract<Route extends VisitorRouteSpec = VisitorRouteSpec> = {
  fields?: readonly DeclaredFieldKey<Route>[];
  children?: Readonly<Partial<Record<RouteChildRoleNames<Route> | '*', ChildContract>>>;
};

export type AncestorRouteMap = Readonly<
  Partial<Record<VisitorRouteSpec, AncestorRouteContract<any>>>
>;

export interface AncestryContract<Routes extends AncestorRouteMap = {}> {
  mode: AncestryMode;
  routes?: Routes;
}

export interface VisitorContract<
  Route extends VisitorRouteSpec = VisitorRouteSpec,
  Routes extends AncestorRouteMap = {},
> {
  /** Scalar payload fields transferred to the callback's `path.node`. */
  fields?: readonly DeclaredFieldKey<Route>[];
  /** Native match predicates. Match-only fields are not callback-visible. */
  where?: RouteWhere<Route>;
  scope?: boolean;
  ancestry?: AncestryContract<Routes>;
  children?: Readonly<Partial<Record<RouteChildRoleNames<Route> | '*', ChildContract>>>;
  controlFlow?: readonly ControlFlowCapability[];
  /** Typed visitors this handler may run via `path.traverse`; their payload and
   * predicate fields join the phase plan so the retained index can serve them. */
  nested?: readonly DefinedVisitor<any>[];
}

/** Deep contract validation applied in `defineVisitor`'s signature: child roles
 * must exist on the route, a role's declared route must stay within what the role
 * delivers, and child fields must be declarable for the child's route. Valid
 * contracts resolve to identity; violations surface an explanatory literal. */
type ValidateContract<Route extends string, Contract> = Contract extends {
  children: infer Children;
}
  ? { readonly children: ValidateChildren<Route, Children> } & ValidateAncestry<Contract>
  : ValidateAncestry<Contract>;
type ValidateAncestry<Contract> = Contract extends {
  ancestry: { routes: infer Routes };
}
  ? { readonly ancestry: { readonly routes: ValidateAncestorRoutes<Routes> } }
  : unknown;
type ValidateAncestorRoutes<Routes> = {
  readonly [Route in keyof Routes]: Route extends string
    ? ValidRouteSpec<Route> extends string
      ? ValidRouteSpec<Route>
      : Routes[Route] extends { where: unknown }
        ? 'Ancestry routes cannot declare where predicates'
        : ValidateAncestorRouteShape<Route, Routes[Route]>
    : 'Ancestry route keys must be strings';
};
type ValidateAncestorRouteShape<Route extends string, Entry> = {
  readonly fields?: readonly DeclaredFieldKey<Route>[];
} & (Entry extends { children: infer Children }
  ? { readonly children: ValidateChildren<Route, Children> }
  : unknown);
type ValidateChildren<Route extends string, Children> = {
  readonly [Role in keyof Children]: ValidateChildEntry<Route, Role & string, Children[Role]>;
};
type ValidateChildEntry<Route extends string, Role extends string, Entry> = Role extends '*'
  ? Entry extends { route: infer ChildRoute extends string }
    ? ValidRouteSpec<ChildRoute> extends string
      ? ValidRouteSpec<ChildRoute>
      : ValidateChildShape<ChildRoute, Entry>
    : never
  : Role extends RouteChildRoleNames<Route>
    ? Entry extends { route: infer ChildRoute extends string }
      ? ValidRouteSpec<ChildRoute> extends string
        ? ValidRouteSpec<ChildRoute>
        : [RouteNodeTypes<ChildRoute>] extends [RouteChildTypes<Route, Role>]
          ? ValidateChildShape<ChildRoute, Entry>
          : `Child role '${Role}' of route '${Route}' cannot deliver route '${ChildRoute}'`
      : never
    : `Unknown child role '${Role}' for route '${Route}'`;
type ValidateChildShape<ChildRoute extends string, Entry> = {
  readonly fields?: readonly DeclaredFieldKey<ChildRoute>[];
} & (Entry extends { children: infer Grandchildren }
  ? { readonly children: ValidateChildren<ChildRoute, Grandchildren> }
  : unknown);

/** Base identity always present in routed records. */
export interface ContractNodeBase {
  readonly id: number;
  readonly type: string;
  readonly start: number;
  readonly end: number;
}

/** The callback-visible node: base identity, the segment's concrete `type`
 * literal(s), and the declared payload fields with generated value types.
 * Composite routes produce a union discriminated by `type`. */
export type ContractNode<Route extends VisitorRouteSpec, Fields extends string> =
  RouteSegments<Route> extends infer Segment
    ? Segment extends string
      ? ContractNodeBase & { readonly type: SegmentNodeTypes<Segment> } & Pick<
            SegmentFieldsRow<Segment>,
            Extract<Fields, keyof SegmentFieldsRow<Segment>>
          >
      : never
    : never;

/** The `type` literal(s) a path's node can carry, `string` when unknown. */
type PathNodeTypeOf<Node> = Node extends { readonly type: infer T extends string } ? T : string;
type PathIsTypes<Node> =
  string extends PathNodeTypeOf<Node> ? NativeNodeType : PathNodeTypeOf<Node>;
/** Narrow a (possibly union) node to the members whose `type` covers `T`. */
type NarrowNodeByType<Node, T extends string> = Node extends {
  readonly type: infer U extends string;
}
  ? string extends U
    ? NodeOfType<T>
    : T extends U
      ? Node & { readonly type: T }
      : never
  : never;

/** The always-available path surface: identity, source access, edits, diagnostics. */
export interface ContractPathBase<Node> {
  readonly id: number;
  readonly type: PathNodeTypeOf<Node>;
  readonly start: number;
  readonly end: number;
  readonly node: Node;
  readonly context: PluginContext;
  getSource(): SourceFragment;
  sourceText(): string;
  snapshot(options?: SnapshotOptions): Readonly<Node>;
  getLocation(): SourceLocation;
  is<TType extends PathIsTypes<Node>>(
    type: TType,
  ): this is this & { readonly type: TType; readonly node: NarrowNodeByType<Node, TType> };
  matchesPattern(pattern: string, allowPartial?: boolean): boolean;
  replaceWith(code: Code): void;
  replaceWithMultiple(code: readonly Code[]): void;
  update(code: Code): void;
  overwrite(code: Code): void;
  remove(): void;
  insertBefore(code: Code): void;
  insertAfter(code: Code): void;
  moveTo(destination: number): void;
  unshiftContainer(key: 'body', code: Code | readonly Code[]): void;
  pushContainer(key: 'body', code: Code | readonly Code[]): void;
  prependToBody(code: Code): void;
  appendToBody(code: Code): void;
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line?: boolean): void;
  buildCodeFrameError(message: string): NativeTransformError;
  unsupported(reason: string): never;
}

/**
 * A path derived from a typed visitor's path — ancestors reached through
 * `parentPath`/`findParent`/`getFunctionParent`/`getProgramParent` and `'*'`-role
 * children. Derived paths share the owning route's runtime, so they carry exactly
 * the owner's declared capabilities and a generic node view rather than the
 * contract's declared payload.
 */
type AncestryRoutesOf<Owner> = Owner extends {
  ancestry: { routes: infer Routes };
}
  ? Routes extends object
    ? Routes
    : {}
  : {};
type DeclaredAncestorNodeTypes<Owner> = {
  [Route in keyof AncestryRoutesOf<Owner> & string]: RouteNodeTypes<Route>;
}[keyof AncestryRoutesOf<Owner> & string];
type DeclaredAncestorFields<Owner, Type extends NativeNodeType> = {
  [Route in keyof AncestryRoutesOf<Owner> & string]: Type extends RouteNodeTypes<Route>
    ? AncestryRoutesOf<Owner>[Route] extends {
        fields: readonly (infer Field extends string)[];
      }
      ? Field
      : never
    : never;
}[keyof AncestryRoutesOf<Owner> & string];
/** Build one variant per concrete node type. This unions payloads from overlapping
 * aliases and concrete routes before adding the discriminant, so narrowing an
 * ancestor never leaves two incompatible variants with the same `type`. */
type DeclaredAncestorNode<Owner> = {
  [Type in DeclaredAncestorNodeTypes<Owner>]: ContractNode<
    Type,
    DeclaredAncestorFields<Owner, Type>
  >;
}[DeclaredAncestorNodeTypes<Owner>];
type AncestorNode<Owner> = [DeclaredAncestorNode<Owner>] extends [never]
  ? ContractNodeBase & { readonly type: NativeNodeType }
  :
      | DeclaredAncestorNode<Owner>
      | (ContractNodeBase & {
          readonly type: Exclude<NativeNodeType, PathNodeTypeOf<DeclaredAncestorNode<Owner>>>;
        });

export type DerivedNodePath<Owner> = ContractPathBase<AncestorNode<Owner>> &
  ScopePart<Owner> &
  DerivedAncestryPart<Owner> &
  AncestorChildrenPart<Owner> &
  ControlPart<Owner>;

interface ParentAccess<Owner> {
  readonly parent: NodeSummary | null;
  readonly parentPath: DerivedNodePath<Owner> | null;
}
interface FindParentAccess<Owner> {
  findParent(predicate: (path: DerivedNodePath<Owner>) => boolean): DerivedNodePath<Owner> | null;
  find(predicate: (path: DerivedNodePath<Owner>) => boolean): DerivedNodePath<Owner> | null;
}
interface FunctionParentAccess<Owner> {
  getFunctionParent(): DerivedNodePath<Owner> | null;
}
interface ProgramParentAccess<Owner> {
  getProgramParent(): DerivedNodePath<Owner> | null;
}
interface NestedTraverseAccess {
  /** Traverse with visitors whose handlers require no state. */
  traverse(visitors: readonly DefinedVisitor<unknown>[]): void;
  /** Traverse with stateful visitors; the state they require is mandatory. */
  traverse<State>(visitors: readonly DefinedVisitor<State>[], state: State): void;
}
interface SubscribeAccess {
  subscribeWithin(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  subscribeForScope(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
}

type ScopePart<Contract> = Contract extends { scope: true } ? { readonly scope: NativeScope } : {};
type AncestryPart<Contract> = Contract extends { ancestry: { mode: infer Mode } }
  ? Mode extends 'parent'
    ? ParentAccess<Contract>
    : Mode extends 'findParent'
      ? ParentAccess<Contract> & FindParentAccess<Contract>
      : Mode extends 'functionParent'
        ? ParentAccess<Contract> & FindParentAccess<Contract> & FunctionParentAccess<Contract>
        : Mode extends 'programParent' | number
          ? ParentAccess<Contract> &
              FindParentAccess<Contract> &
              FunctionParentAccess<Contract> &
              ProgramParentAccess<Contract>
          : {}
  : {};
type DerivedAncestryPart<Contract> = Contract extends { ancestry: { mode: infer Mode } }
  ? Mode extends 'parent'
    ? { readonly parent: NodeSummary | null }
    : AncestryPart<Contract>
  : {};
type DeclaredAncestorChildren<Owner> = {
  [Route in keyof AncestryRoutesOf<Owner> & string]: AncestryRoutesOf<Owner>[Route] extends {
    children: infer Children;
  }
    ? Children
    : never;
}[keyof AncestryRoutesOf<Owner> & string];
type AncestorChildRoles<Owner> =
  DeclaredAncestorChildren<Owner> extends infer Children
    ? Children extends object
      ? keyof Children & string
      : never
    : never;
type AncestorChildEntry<Owner, Role extends string> =
  DeclaredAncestorChildren<Owner> extends infer Children
    ? Children extends object
      ? Role extends keyof Children
        ? NonNullable<Children[Role]> extends ChildContract
          ? NonNullable<Children[Role]>
          : never
        : never
      : never
    : never;
type AncestorChildrenPart<Owner> = [DeclaredAncestorChildren<Owner>] extends [never]
  ? {}
  : {
      getChild<Role extends AncestorChildRoles<Owner>>(
        role: Role,
      ): ChildPathOf<AncestorChildEntry<Owner, Role>, Owner> | null;
      getChildList<Role extends AncestorChildRoles<Owner>>(
        role: Role,
      ): readonly ChildPathOf<AncestorChildEntry<Owner, Role>, Owner>[];
      get<Role extends AncestorChildRoles<Owner>>(
        role: Role,
      ):
        | ChildPathOf<AncestorChildEntry<Owner, Role>, Owner>
        | readonly ChildPathOf<AncestorChildEntry<Owner, Role>, Owner>[]
        | null;
    };
type ControlPart<Contract> = Contract extends { controlFlow: readonly (infer C extends string)[] }
  ? ('skip' extends C ? { skip(): void } : {}) &
      ('stop' extends C ? { stop(): void } : {}) &
      ('nested-traverse' extends C ? NestedTraverseAccess : {}) &
      ('dynamic-subscriptions' extends C ? SubscribeAccess : {})
  : {};
type ChildFieldsOf<C> = C extends { fields: readonly (infer F extends string)[] } ? F : never;
/** Child paths share the visitor's runtime, so they inherit its scope, ancestry,
 * and control-flow capabilities, and expose their own declared child chains. */
type ChildPathOf<C extends ChildContract, Owner> = ContractPathBase<
  ContractNode<C['route'], ChildFieldsOf<C>>
> &
  ScopePart<Owner> &
  AncestryPart<Owner> &
  ControlPart<Owner> &
  ChildrenPart<C['route'], C, Owner>;
type DeclaredRoleNames<Children> = Exclude<Extract<keyof Children, string>, '*'>;
/** Declared roles steered to `getChild`/`getChildList` by generated cardinality;
 * roles with mixed cardinality across a composite keep only `get`. */
type SingleChildRoles<Route extends string, Children> = {
  [Role in DeclaredRoleNames<Children>]: [RouteChildIsList<Route, Role>] extends [false]
    ? Role
    : never;
}[DeclaredRoleNames<Children>];
type ListChildRoles<Route extends string, Children> = {
  [Role in DeclaredRoleNames<Children>]: [RouteChildIsList<Route, Role>] extends [true]
    ? Role
    : never;
}[DeclaredRoleNames<Children>];
type ChildrenPart<Route extends string, Contract, Owner> = Contract extends {
  children: infer Children extends Readonly<Record<string, ChildContract | undefined>>;
}
  ? {
      getChild<Role extends SingleChildRoles<Route, Children>>(
        role: Role,
      ): ChildPathOf<NonNullable<Children[Role]>, Owner> | null;
      getChildList<Role extends ListChildRoles<Route, Children>>(
        role: Role,
      ): readonly ChildPathOf<NonNullable<Children[Role]>, Owner>[];
      get<Role extends DeclaredRoleNames<Children>>(
        role: Role,
      ):
        | ChildPathOf<NonNullable<Children[Role]>, Owner>
        | readonly ChildPathOf<NonNullable<Children[Role]>, Owner>[]
        | null;
    } & ('*' extends keyof Children ? { getChildren(): readonly DerivedNodePath<Owner>[] } : {})
  : {};

type ContractFieldsOf<Contract> = Contract extends { fields: readonly (infer F extends string)[] }
  ? F
  : never;

/** The capability-narrowed path a typed visitor callback receives. */
export type ContractPath<
  Route extends VisitorRouteSpec,
  Contract extends VisitorContract<Route>,
> = ContractPathBase<ContractNode<Route, ContractFieldsOf<Contract>>> &
  ScopePart<Contract> &
  AncestryPart<Contract> &
  ChildrenPart<Route, Contract, Contract> &
  ControlPart<Contract>;

export type TypedVisitorHandler<
  Route extends VisitorRouteSpec,
  Contract extends VisitorContract<Route>,
  State,
> =
  | ((path: ContractPath<Route, Contract>, state: State) => void)
  | {
      enter?(path: ContractPath<Route, Contract>, state: State): void;
      exit?(path: ContractPath<Route, Contract>, state: State): void;
    };

/** Normalized, route-erased runtime shape of one typed visitor. */
export interface DefinedVisitor<in State = unknown> {
  readonly route: VisitorRouteSpec;
  readonly contract: StoredVisitorContract;
  readonly enter: ((path: never, state: State) => void) | undefined;
  readonly exit: ((path: never, state: State) => void) | undefined;
}

/** The contract as stored: normalized, frozen, identity-stable per visitor. */
export interface StoredVisitorContract {
  readonly fields: readonly NativeFieldKey[];
  readonly where: Readonly<Partial<Record<string, ScalarPredicate>>> | undefined;
  readonly scope: boolean;
  readonly ancestry:
    | Readonly<{
        mode: AncestryMode;
        routes: Readonly<
          Record<
            string,
            {
              readonly fields: readonly NativeFieldKey[];
              readonly children: Readonly<Record<string, ChildContract>> | undefined;
            }
          >
        >;
      }>
    | undefined;
  readonly children: Readonly<Record<string, ChildContract>> | undefined;
  readonly controlFlow: readonly ControlFlowCapability[];
  readonly nested: readonly DefinedVisitor<any>[];
}

const MAX_CHILD_CONTRACT_DEPTH = 8;

function freezeChildContracts(
  children: Readonly<Partial<Record<string, ChildContract>>> | undefined,
  depth = 0,
): Readonly<Record<string, ChildContract>> | undefined {
  if (children == null) return undefined;
  if (depth >= MAX_CHILD_CONTRACT_DEPTH)
    throw new Error('child contracts exceed the supported depth');
  return Object.freeze(
    Object.fromEntries(
      Object.entries(children).flatMap(([role, child]) =>
        child == null
          ? []
          : [
              [
                role,
                Object.freeze({
                  route: child.route,
                  fields: Object.freeze([...(child.fields ?? [])]),
                  children: freezeChildContracts(child.children, depth + 1),
                }),
              ],
            ],
      ),
    ),
  );
}

function freezeAncestry(
  ancestry: AncestryContract<AncestorRouteMap> | undefined,
): StoredVisitorContract['ancestry'] {
  if (ancestry == null) return undefined;
  const mode = ancestry.mode;
  if (typeof mode === 'number' && (!Number.isSafeInteger(mode) || mode <= 0))
    throw new Error('ancestry mode must be a positive integer');
  if (
    typeof mode !== 'number' &&
    mode !== 'parent' &&
    mode !== 'findParent' &&
    mode !== 'functionParent' &&
    mode !== 'programParent'
  )
    throw new Error(`unknown ancestry mode ${String(mode)}`);
  return Object.freeze({
    mode,
    routes: Object.freeze(
      Object.fromEntries(
        Object.entries(ancestry.routes ?? {}).flatMap(([route, contract]) =>
          contract == null
            ? []
            : 'where' in contract
              ? (() => {
                  throw new Error('ancestry routes cannot declare where predicates');
                })()
              : [
                  [
                    route,
                    Object.freeze({
                      fields: Object.freeze([...(contract.fields ?? [])]),
                      children: freezeChildContracts(contract.children),
                    }),
                  ],
                ],
        ),
      ),
    ),
  });
}

/**
 * Define a typed visitor: the contract beside the callback that uses it.
 *
 * The route is an explicit generic anchor; the contract narrows the callback's
 * path (declared payload fields on `node`, capability-gated scope/ancestry/
 * children/control-flow methods); state is typed by annotating the handler's
 * second parameter. Definitions are frozen data consumed at plugin compile time —
 * no wrapper runs per event.
 */
export function defineVisitor<
  Route extends VisitorRouteSpec,
  const Contract extends VisitorContract<Route>,
  State = unknown,
>(
  route: Route & ValidRouteSpec<Route>,
  contract: Contract & ValidateContract<Route, Contract>,
  handler: TypedVisitorHandler<Route, Contract, State>,
): DefinedVisitor<State> {
  if (typeof route !== 'string' || route.length === 0)
    throw new Error('defineVisitor requires a route name');
  const callable = typeof handler === 'function' ? { enter: handler } : handler;
  if (callable.enter == null && callable.exit == null)
    throw new Error(`defineVisitor(${route}) requires an enter or exit handler`);
  const stored: StoredVisitorContract = Object.freeze({
    fields: Object.freeze([...((contract.fields as readonly NativeFieldKey[] | undefined) ?? [])]),
    where: contract.where == null ? undefined : Object.freeze({ ...contract.where }),
    scope: contract.scope === true,
    ancestry: freezeAncestry(contract.ancestry as AncestryContract<AncestorRouteMap> | undefined),
    children: freezeChildContracts(contract.children),
    controlFlow: Object.freeze([...(contract.controlFlow ?? [])]),
    nested: Object.freeze([...(contract.nested ?? [])]),
  });
  return Object.freeze({
    route,
    contract: stored,
    enter: callable.enter as DefinedVisitor<State>['enter'],
    exit: callable.exit as DefinedVisitor<State>['exit'],
  });
}

/**
 * Plugin-level requirements and typings for `context`: metadata ownership and
 * semantic queries. The visitor contract types the path; the plugin contract
 * types the context.
 */
export interface PluginContract {
  metadata?: { writes?: readonly string[]; reads?: readonly string[] };
  queries?: readonly QueryRequest[];
}

type ContractMetadataWrites<Contract> = Contract extends {
  metadata: { writes: readonly (infer Writes extends string)[] };
}
  ? Writes
  : string;
type ContractMetadataReads<Contract> = Contract extends {
  metadata: { reads: readonly (infer Reads extends string)[] };
}
  ? Reads
  : string;

export interface ContractMetadataWriter<Writes extends string, Reads extends string> {
  set(key: Writes, value: unknown): void;
  get(key: Reads): unknown;
}

/** `PluginContext` with metadata keys narrowed by the plugin contract. */
export type PluginContextFor<Contract extends PluginContract> = Omit<PluginContext, 'metadata'> & {
  readonly metadata: ContractMetadataWriter<
    ContractMetadataWrites<Contract>,
    ContractMetadataReads<Contract> | ContractMetadataWrites<Contract>
  >;
};

/**
 * A reusable transform unit.
 *
 * `prepare` declares the native data required for the current file. Lifecycle
 * hooks and visitors then operate on that prepared snapshot, while edits stay
 * buffered until the containing phase completes.
 */
export interface NativePlugin<
  State = unknown,
  Options = unknown,
  Analysis = unknown,
  Contract extends PluginContract = PluginContract,
> {
  name: string;
  options?: Options;
  /** Plugin-level context requirements: metadata ownership and queries. */
  contract?: Contract;
  createState?(context: PrepareContext): State;
  pre?(context: PluginContextFor<Contract>, state: State): void;
  analyze?(context: PluginContextFor<Contract>, state: State): TransformDecision<Analysis> | void;
  apply?(context: PluginContextFor<Contract>, analysis: Analysis, state: State): void;
  /** Typed per-visitor contracts created with `defineVisitor`. */
  visitors?: readonly DefinedVisitor<State>[];
  post?(context: PluginContextFor<Contract>, state: State): void;
  cleanup?(reason: 'complete' | 'bailout' | 'error', state: State): void;
  /** Conservative effect of this plugin's editor and native actions. */
  editEffect?: EditEffect;
}
export type NativePluginDefinition<
  State = unknown,
  Options = unknown,
  Analysis = unknown,
  Contract extends PluginContract = PluginContract,
> = NativePlugin<State, Options, Analysis, Contract>;
export interface DefinedNativePlugin<
  State = unknown,
  Options = unknown,
  Analysis = unknown,
  Contract extends PluginContract = PluginContract,
> extends NativePlugin<State, Options, Analysis, Contract> {
  withOptions(options: Options): DefinedNativePlugin<State, Options, Analysis, Contract>;
  /** Resolve the predicate parameters declared by this plugin's visitor contracts.
   *
   * Interned on the values, so binding the same configuration twice returns the
   * same plugin and its compiled routes stay keyed by identity. */
  withParameters(
    values: Readonly<Record<string, ScalarValue | readonly ScalarValue[]>>,
  ): DefinedNativePlugin<State, Options, Analysis, Contract>;
}

/**
 * A group of plugins that observe one immutable parse of the source.
 *
 * Edits from every plugin in the phase are committed together. A following
 * phase sees the committed source through a new native parse.
 */
export interface PipelinePhase {
  name: string;
  /** JavaScript visitor plugins. Mutually exclusive with `native`. */
  plugins?: readonly NativePlugin<any, any>[];
  /** Fused parse/transform/codegen phase executed entirely in Rust. */
  native?: import('../preflight/types').PreflightPlan;
  editEffect?: EditEffect;
  requiresPrintedInput?: boolean;
  requiresFreshSemantics?: boolean;
  requiresRealizedMap?: boolean;
}

export interface CompiledPhasePlan {
  name: string;
  editEffect: EditEffect;
  requiresPrintedInput: boolean;
  requiresFreshSemantics: boolean;
  requiresRealizedMap: boolean;
  /** Closed bit set of derived artifacts declared before per-file routing. */
  artifactDemand: import('../pipeline/artifacts').ArtifactDemand;
}

/** An immutable, reusable transform configuration. */
export interface NativePipeline {
  phases: readonly PipelinePhase[];
}
export type NativePipelineDefinition = NativePipeline;
