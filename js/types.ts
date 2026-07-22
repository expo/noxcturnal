export type NodeId = number;
export type ScopeId = number;
export type SourceMapMode = 'line' | 'boundary' | 'character';
export type MappingPolicy = 'Sourceless' | 'AnchorStart' | 'AnchorBoundaries' | 'Identity';
export type EditKind = 'Replace' | 'Remove' | 'AppendLeft' | 'PrependLeft' | 'AppendRight' | 'PrependRight' | 'AddSourceMapLocation';

export interface EditCommand {
  kind: EditKind;
  start: number;
  end: number;
  content?: string;
  mapping?: MappingPolicy;
  owner?: string;
  order?: number;
  names?: string[];
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
  timings: Timings;
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
  readonly [field: string]: unknown;
}

export interface IdentifierView extends NodeView { readonly type: 'Identifier'; readonly name: string; readonly global?: boolean; readonly binding?: boolean; readonly bindingScopeId?: ScopeId; readonly read?: boolean; readonly write?: boolean }
export interface StringLiteralView extends NodeView { readonly type: 'StringLiteral'; readonly value: string }
export interface NumericLiteralView extends NodeView { readonly type: 'NumericLiteral'; readonly value: number }
export interface BooleanLiteralView extends NodeView { readonly type: 'BooleanLiteral'; readonly value: boolean }
export interface CallExpressionView extends NodeView { readonly type: 'CallExpression'; readonly optional: boolean; readonly argumentCount: number; readonly calleeName?: string; readonly calleeGlobal?: boolean; readonly staticArgument?: string }
export interface FunctionView extends NodeView { readonly type: 'Function' | 'ArrowFunctionExpression'; readonly name?: string; readonly async: boolean; readonly generator?: boolean; readonly bodyStart: number; readonly bodyEnd: number }
export interface ImportDeclarationView extends NodeView { readonly type: 'ImportDeclaration'; readonly source: string }
export interface ExportNamedDeclarationView extends NodeView { readonly type: 'ExportNamedDeclaration'; readonly source?: string }
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
export type NodeOfType<T extends string> = T extends KnownNodeType ? NativeNodeMap[T] : NodeView;

export interface NodeSummary { id: NodeId; type: string; start?: number; end?: number; parentId?: NodeId; parentType?: string }
export interface SourceLocation { start: Position; end: Position }
export interface Position { line: number; column: number }
export interface Timings {
  parseMs: number;
  semanticMs: number;
  traversalMs: number;
  renderAndMapMs: number;
  sessionOpenMs?: number;
  napiTransferMs?: number;
  jsDispatchMs?: number;
  mapCompositionMs?: number;
  totalMs?: number;
}
export interface NativeVlqMap { mappings: string; names: string[] }
export interface Diagnostic { code: string; message: string; plugin?: string; phase?: string; start?: number; end?: number }
export interface ParseClassification { syntax: 'js' | 'jsx' | 'ts' | 'tsx' | 'dts' | 'flow' | 'unknown'; supported: boolean; codegenCandidate: boolean; reason: string }

export interface NativeTransformResult {
  status: 'complete';
  code: string;
  map: NativeVlqMap;
  metadata: Record<string, unknown>;
  diagnostics: Diagnostic[];
  timings: Timings;
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
  bindings: { name: string; scopeId: ScopeId; declaration: NodeSummary | null; references: NodeView[] }[];
}
export interface InspectRequest { nodeId: NodeId; fields: string[] }

export interface PluginPlan {
  subscriptions?: readonly string[];
  fields?: Readonly<Record<string, readonly string[]>>;
  semantics?: readonly string[];
  queries?: readonly QueryRequest[];
  metadataWrites?: readonly string[];
  phases?: readonly string[];
  ancestry?: 'parent' | 'findParent' | 'functionParent' | 'programParent' | number;
  children?: Readonly<Record<string, readonly string[]>>;
}

export interface TransformOptions {
  sourceMapMode?: SourceMapMode;
  parser?: 'auto' | 'js' | 'jsx' | 'ts' | 'tsx' | 'dts';
  maxFollowUpBatches?: number;
  maxNativeMemoryBytes?: number;
  allowBroadVisitors?: boolean;
  inputSourceMap?: NativeVlqMap & { sources?: string[]; sourcesContent?: (string | null)[] };
  parserAdapter?: string;
}

export interface ParserAdapter {
  name: string;
  supports(route: ParseClassification): boolean;
  transform(source: string, filename: string, pipeline: unknown, options: TransformOptions): TransformResult;
}
