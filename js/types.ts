import type { NativeFieldKey, NativeNodeType } from './generated-event-schema.js';

export type { NativeFieldKey, NativeNodeType } from './generated-event-schema.js';
export type NativeVisitorAlias =
  | 'Function'
  | 'Statement'
  | 'Declaration'
  | 'Expression'
  | 'MemberExpression'
  | 'MetaProperty'
  | 'ReferencedIdentifier'
  | 'FunctionDeclaration'
  | 'FunctionExpression'
  | 'TSDeclareFunction'
  | 'ClassDeclaration'
  | 'ClassExpression'
  | '*';
export type NativeVisitorRoute = NativeNodeType | NativeVisitorAlias;
export type ScalarValue = string | number | boolean | null;
export type ScalarPredicate =
  | { equals: ScalarValue }
  | { oneOf: readonly ScalarValue[] }
  | { present: boolean };
export type ControlFlowCapability =
  | 'skip'
  | 'stop'
  | 'stop-all'
  | 'nested-traverse'
  | 'dynamic-subscriptions';
export type NodeId = number;
export type ScopeId = number;
export type SourceMapMode = 'line' | 'boundary' | 'character';
export type MappingPolicy = 'Sourceless' | 'AnchorStart' | 'AnchorBoundaries' | 'Identity';
export type EditEffect =
  | 'none'
  | 'text-only'
  | 'expression-shape'
  | 'bindings'
  | 'module-structure'
  | 'whole-program';
export type PhaseObservation = 'original' | 'current-ast' | 'rendered-source';
export type CoordinateSpace = 'original' | 'current' | 'generated';
export type EditKind =
  | 'Replace'
  | 'Remove'
  | 'AppendLeft'
  | 'PrependLeft'
  | 'AppendRight'
  | 'PrependRight'
  | 'AddSourceMapLocation'
  // Output sections: prefix and suffix content assembles around the body instead of
  // competing with body edits in insertion-affinity order; prologue content joins the
  // body stream at the directive-prologue boundary in first-ensure order.
  | 'Prefix'
  | 'Prologue'
  | 'Suffix'
  // Relocation: the range leaves its place and its original-backed pieces render at
  // `destination` with every contained edit applied.
  | 'Move';

export interface EditCommand {
  kind: EditKind;
  start: number;
  end: number;
  content?: string;
  /** Deferred content: literal text and source-range copies realized at commit
   * against the same phase's edits. Mutually exclusive with `content`. */
  contentParts?: readonly (string | { start: number; end: number })[];
  /** Relocation target for `Move` edits. */
  destination?: number;
  mapping?: MappingPolicy;
  owner?: string;
  order?: number;
  names?: string[];
  /** Coordinate system used by the edit. Existing callers default to `original`. */
  coordinateSpace?: CoordinateSpace;
}

export interface NativeEvent {
  sequence: number;
  side: 'enter' | 'exit';
  id: NodeId;
  type: string;
  start: number;
  end: number;
  parentId?: NodeId;
  parentType?: string;
  scopeId: ScopeId;
  scopeParentId?: ScopeId;
  fields: { key: string; value: string | number | boolean }[];
}

export interface EventBatch {
  events: NativeEvent[];
  nodeCount: number;
  emittedCount: number;
}

export interface NodeView {
  readonly id: NodeId;
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly scopeId: ScopeId;
  readonly scopeParentId?: ScopeId;
  readonly parentId?: NodeId;
  readonly parentType?: string;
  /** Scalar fields requested dynamically through a plugin plan are present as `unknown`. */
  readonly [field: string]: unknown;
}

export interface IdentifierView extends NodeView {
  readonly type: 'Identifier';
  readonly name: string;
  readonly global?: boolean;
  readonly binding?: boolean;
  readonly bindingScopeId?: ScopeId;
  readonly read?: boolean;
  readonly write?: boolean;
}
export interface StringLiteralView extends NodeView {
  readonly type: 'StringLiteral';
  readonly value: string;
}
export interface NumericLiteralView extends NodeView {
  readonly type: 'NumericLiteral';
  readonly value: number;
}
export interface BooleanLiteralView extends NodeView {
  readonly type: 'BooleanLiteral';
  readonly value: boolean;
}
export interface CallExpressionView extends NodeView {
  readonly type: 'CallExpression';
  readonly optional: boolean;
  readonly argumentCount: number;
  readonly calleeName?: string;
  readonly calleeGlobal?: boolean;
  readonly staticArgument?: string;
}
export interface FunctionView extends NodeView {
  readonly type: 'Function' | 'ArrowFunctionExpression';
  readonly name?: string;
  readonly async: boolean;
  readonly generator?: boolean;
  readonly bodyStart: number;
  readonly bodyEnd: number;
}
export interface ImportDeclarationView extends NodeView {
  readonly type: 'ImportDeclaration';
  readonly source: string;
}
export interface ExportNamedDeclarationView extends NodeView {
  readonly type: 'ExportNamedDeclaration';
  readonly source?: string;
}
export interface NativeNodeMap {
  Identifier: IdentifierView;
  StringLiteral: StringLiteralView;
  NumericLiteral: NumericLiteralView;
  BooleanLiteral: BooleanLiteralView;
  CallExpression: CallExpressionView;
  Function: FunctionView;
  ArrowFunctionExpression: FunctionView;
  ImportDeclaration: ImportDeclarationView;
  ExportNamedDeclaration: ExportNamedDeclarationView;
}
export type KnownNodeType = keyof NativeNodeMap;
export type NodeOfType<T extends string> = T extends KnownNodeType
  ? NativeNodeMap[T]
  : NodeView & { readonly type: T };

export interface NodeSummary {
  id: NodeId;
  type: string;
  start?: number;
  end?: number;
  parentId?: NodeId;
  parentType?: string;
}
export interface SourceLocation {
  start: Position;
  end: Position;
}
export interface Position {
  line: number;
  column: number;
}
export interface NativeVlqMap {
  mappings: string;
  names: string[];
}
export interface FunctionMap {
  names: string[];
  mappings: string;
}
export interface Diagnostic {
  code: string;
  message: string;
  plugin?: string;
  phase?: string;
  start?: number;
  end?: number;
}
export interface ParseClassification {
  syntax: 'js' | 'jsx' | 'ts' | 'tsx' | 'dts' | 'flow' | 'unknown';
  supported: boolean;
  codegenCandidate: boolean;
  reason: string;
}

export interface NativeTransformResult {
  status: 'complete';
  code: string;
  map: NativeVlqMap;
  functionMap: FunctionMap | null;
  metadata: Record<string, unknown>;
  diagnostics: Diagnostic[];
}
export interface NativeBailoutResult {
  status: 'bailout';
  reason: string;
  source: string;
  diagnostics: Diagnostic[];
}
export type TransformResult = NativeTransformResult | NativeBailoutResult;

export interface QueryRequest {
  globals?: { name: string; references?: boolean }[];
  imports?: boolean;
  exports?: boolean;
  constants?: NodeId[];
  calls?: { callee: string; globalOnly?: boolean; staticArguments?: boolean }[];
  captures?: { functionId: NodeId }[];
  bindings?: { name?: string; scopeId?: ScopeId; reads?: boolean; writes?: boolean }[];
}
export interface QueryResult {
  globals: Record<string, { references: NodeSummary[] }>;
  imports: NodeView[];
  exports: NodeView[];
  constants: Record<number, string | number | boolean | null>;
  calls: Record<string, NodeView[]>;
  captures: Record<number, NodeView[]>;
  bindings: {
    name: string;
    scopeId: ScopeId;
    declaration: NodeSummary | null;
    references: NodeView[];
  }[];
}
export interface InspectRequest {
  nodeId: NodeId;
  fields: readonly NativeFieldKey[];
}

export interface PluginPlan {
  /** Disable this plugin, including its lifecycle and subscriptions, for the current file. */
  enabled?: boolean;
  subscriptions?: readonly NativeVisitorRoute[];
  /** Restrict Identifier/ReferencedIdentifier delivery to these semantic names. The filter is used only when every Identifier subscriber in the phase declares one. */
  identifierNames?: readonly string[];
  /** Restrict StaticMemberExpression/MemberExpression delivery to exact non-computed member paths when every matching subscriber opts in. */
  staticMemberPatterns?: readonly string[];
  fields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  /** Exact, type-sensitive scalar filters evaluated before a route callback is delivered. */
  where?: Readonly<
    Partial<Record<NativeVisitorRoute, Readonly<Partial<Record<NativeFieldKey, ScalarPredicate>>>>>
  >;
  /** Dynamic path operations used by this plugin. Omitted capabilities are rejected at runtime. */
  controlFlow?: readonly ControlFlowCapability[];
  semantics?: readonly 'scope'[];
  queries?: readonly QueryRequest[];
  metadataWrites?: readonly string[];
  phases?: readonly string[];
  ancestry?: 'parent' | 'findParent' | 'functionParent' | 'programParent' | number;
  children?: Readonly<Partial<Record<NativeVisitorRoute, readonly string[]>>>;
  /** Conservative effect of editor/native actions performed by this plugin. */
  editEffect?: EditEffect;
}

export interface TransformOptions {
  sourceMapMode?: SourceMapMode;
  parser?: 'auto' | 'js' | 'jsx' | 'ts' | 'tsx' | 'dts';
  maxFollowUpBatches?: number;
  maxNativeMemoryBytes?: number;
  allowBroadVisitors?: boolean;
  inputSourceMap?: NativeVlqMap & { sources?: string[]; sourcesContent?: (string | null)[] };
  parserAdapter?: string;
  /** Generate a Metro-compatible function map for the final transformed code. */
  functionMap?: boolean;
  /** Include phase decisions and counters in metadata. Intended for benchmarks/debugging only. */
  debugPerformance?: boolean;
}

export interface ParserAdapter {
  name: string;
  supports(route: ParseClassification): boolean;
  transform(
    source: string,
    filename: string,
    pipeline: unknown,
    options: TransformOptions,
  ): TransformResult;
}
