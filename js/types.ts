import type {
  NativeFieldKey,
  NativeNodeFields,
  NativeNodeType,
  NativeRouteFields,
  NativeRouteTypes,
} from './generated/event-schema.js';
import type { PreflightPlan } from './preflight/types.js';

export type { NativeFieldKey, NativeNodeType } from './generated/event-schema.js';
/** Alias route names, derived from the generated expansion table. */
export type NativeVisitorAlias = Extract<keyof NativeRouteTypes, string>;
export type NativeVisitorRoute = NativeNodeType | NativeVisitorAlias;
export type ScalarValue = string | number | boolean | null;
/** A declarative native match operation, typed by the field's wire value. */
/** A predicate value supplied when a plugin is bound, not when it is defined.
 *
 * Declared with `parameter(name)` inside a visitor contract and resolved by
 * `plugin.withParameters(values)`. Binding happens once per configuration, so the
 * bound plugin's plan is fixed by its identity and never depends on the file being
 * transformed. An unresolved parameter is a contract error, not a wildcard. */
export interface PredicateParameter {
  readonly parameter: string;
}

export type ScalarPredicate<V extends ScalarValue = ScalarValue> =
  | { equals: V | PredicateParameter }
  | { oneOf: readonly V[] | PredicateParameter }
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

/** Typed node views for every concrete node type with generated field data. */
export type NativeNodeMap = {
  [K in Extract<keyof NativeNodeFields, string>]: NodeView & {
    readonly type: K;
  } & NativeNodeFields[K];
};
export type KnownNodeType = keyof NativeNodeMap;
export type NodeOfType<T extends string> = T extends KnownNodeType
  ? NativeNodeMap[T]
  : NodeView & { readonly type: T };

export type IdentifierView = NativeNodeMap['Identifier'];
export type StringLiteralView = NativeNodeMap['StringLiteral'];
export type NumericLiteralView = NativeNodeMap['NumericLiteral'];
export type BooleanLiteralView = NativeNodeMap['BooleanLiteral'];
export type CallExpressionView = NativeNodeMap['CallExpression'];
/** Function and arrow-function events, as the `Function` alias route sees them. */
export type FunctionView = NodeView & {
  readonly type: NativeRouteTypes['Function'];
} & NativeRouteFields['Function'];
export type ImportDeclarationView = NativeNodeMap['ImportDeclaration'];
export type ExportNamedDeclarationView = NativeNodeMap['ExportNamedDeclaration'];

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

/**
 * Per-file lifecycle settings returned by `prepare()`. Route requirements live on
 * typed visitor contracts; context requirements live on the plugin contract.
 */

export interface TransformOptions {
  /** Reserved declarative configuration for native preflight phases. */
  preflight?: PreflightPlan;
  sourceMapMode?: SourceMapMode;
  parser?: 'auto' | 'js' | 'jsx' | 'ts' | 'tsx' | 'dts';
  /** Optional caller-imposed cap. By default finite follow-up work is bounded
   * by the retained session and native memory limit, not an arbitrary count. */
  maxFollowUpBatches?: number;
  maxNativeMemoryBytes?: number;
  allowBroadVisitors?: boolean;
  inputSourceMap?: NativeVlqMap & { sources?: string[]; sourcesContent?: (string | null)[] };
  parserAdapter?: string;
  /** Generate a Metro-compatible function map for the final transformed code. */
  functionMap?: boolean;
  /** Include phase decisions and counters in metadata. Intended for benchmarks/debugging only. */
  debugPerformance?: boolean;
  /** Development/test-only: report undeclared contract access with suggested
   * fragments and declared-but-unused contract entries as diagnostics. */
  verifyVisitorContracts?: boolean;
  /**
   * Consumer-owned, per-transform data exposed to plugin preparation,
   * lifecycle hooks, and visitor contexts. This is deliberately excluded from
   * Noxcturnal's serializable cache keys; plugins own any configuration keys
   * derived from it.
   */
  pluginData?: unknown;
}

export interface ParserAdapter {
  /** Stable implementation identity used in transform cache keys. */
  name: string;
  version: string;
  /** Serializable configuration that affects emitted code or mappings. */
  options?: unknown;
  supports(route: ParseClassification): boolean;
  compile(source: string, filename: string, options: TransformOptions): ParserAdapterResult;
}

export type ParserAdapterResult =
  | {
      status: 'complete';
      code: string;
      map: NativeVlqMap;
      /** Plain syntax emitted for the normal native pipeline. */
      syntax: 'js' | 'jsx';
      metadata?: Record<string, unknown>;
    }
  | { status: 'unsupported'; reason: string; diagnostics?: Diagnostic[] };
