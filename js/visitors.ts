import { createHash } from 'node:crypto';

import { native, type NativeIndexedSessionBinding } from './native.js';
import {
  FIELD_KEY_IDS,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
} from './generated-event-schema.js';
import {
  decodeEventBatch,
  decodePackedEnvelope,
  decodeRoutedEnvelope,
  dispatchRoutedEvents,
  coerceFieldValue,
  packEdits,
  packFieldRequests,
  packRouteManifest,
  type NativeRouteManifestEntry,
  type PackedEventBatch,
  type RoutedEventBatch,
} from './protocol.js';
import type {
  Diagnostic,
  EditCommand,
  EventBatch,
  InspectRequest,
  NativeBailoutResult,
  NativeEvent,
  NativeTransformResult,
  NodeSummary,
  NodeView,
  PluginPlan,
  QueryRequest,
  QueryResult,
  SourceLocation,
  TransformOptions,
  TransformResult,
  ParseClassification,
  NodeOfType,
  ParserAdapter,
  NativeFieldKey,
  NativeNodeType,
  NativeVisitorRoute,
  FunctionMap,
  ControlFlowCapability,
  ScalarPredicate,
  EditEffect,
  PhaseObservation,
} from './types.js';

export interface PrepareContext {
  readonly filename: string;
  readonly options: TransformOptions;
  readonly parser: ReturnType<typeof native.classify>;
  readonly sourceHints: ReadonlySet<string>;
  subscribe(...types: NativeVisitorRoute[]): void;
}

export interface NativeScope {
  readonly id: number;
  readonly parentId: number | null;
  readonly parent: NativeScope | null;
  readonly path: NativeNodePath | null;
  hasBinding(name: string): boolean;
  hasGlobal(name: string): boolean;
  getBinding(name: string): NativeBinding | null;
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
  readonly source: string;
  readonly metadata: MetadataWriter;
  query(request: QueryRequest): QueryResult;
  inspect(requests: readonly InspectRequest[]): NodeView[];
  diagnostic(diagnostic: Omit<Diagnostic, 'plugin' | 'phase'>): void;
  unsupported(reason: string): never;
  stopAll(): void;
  subscribeRemaining(...types: string[]): void;
  revisitProgram(visitor: Visitor<any>, state?: unknown): void;
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
  traverse<State>(visitor: Visitor<State>, state?: State): void;
  subscribeWithin(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  subscribeForScope(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  unsupported(reason: string): never;
}

export interface SnapshotOptions {
  fields?: readonly string[];
  ancestry?: 'none' | 'parent';
}

type NodeForRoute<Route extends NativeVisitorRoute> = Route extends 'ReferencedIdentifier'
  ? NodeOfType<'Identifier'>
  : Route extends 'FunctionDeclaration' | 'FunctionExpression' | 'TSDeclareFunction'
    ? NodeOfType<'Function'>
    : Route extends 'ClassDeclaration' | 'ClassExpression'
      ? NodeOfType<'Class'>
      : Route extends NativeNodeType
        ? NodeOfType<Route>
        : NodeView;
type Handler<State, Node extends NodeView = NodeView> = (
  path: NativeNodePath<Node>,
  state: State,
) => void;
export type VisitorHandler<State, Node extends NodeView = NodeView> =
  | Handler<State, Node>
  | { enter?: Handler<State, Node>; exit?: Handler<State, Node> };
export type Visitor<State> = {
  [Route in NativeVisitorRoute]?: VisitorHandler<State, NodeForRoute<Route>>;
} & {
  [compositeRoute: `${NativeVisitorRoute}|${string}`]: VisitorHandler<State> | undefined;
};

/**
 * A reusable transform unit.
 *
 * `prepare` declares the native data required for the current file. Lifecycle
 * hooks and visitors then operate on that prepared snapshot, while edits stay
 * buffered until the containing phase completes.
 */
export interface NativePlugin<State = unknown, Options = unknown, Analysis = unknown> {
  name: string;
  options?: Options;
  prepare?(context: PrepareContext, options: Options): PluginPlan | void;
  createState?(): State;
  pre?(context: PluginContext, state: State): void;
  analyze?(context: PluginContext, state: State): TransformDecision<Analysis> | void;
  apply?(context: PluginContext, analysis: Analysis, state: State): void;
  visitor?: Visitor<State>;
  post?(context: PluginContext, state: State): void;
  cleanup?(reason: 'complete' | 'bailout' | 'error', state: State): void;
  /** Static fallback used by phase planning when prepare() is source-dependent. */
  editEffect?: EditEffect;
}
export type NativePluginDefinition<
  State = unknown,
  Options = unknown,
  Analysis = unknown,
> = NativePlugin<State, Options, Analysis>;
export interface DefinedNativePlugin<
  State = unknown,
  Options = unknown,
  Analysis = unknown,
> extends NativePlugin<State, Options, Analysis> {
  withOptions(options: Options): DefinedNativePlugin<State, Options, Analysis>;
}

/**
 * A group of plugins that observe one immutable parse of the source.
 *
 * Edits from every plugin in the phase are committed together. A following
 * phase sees the committed source through a new native parse.
 */
export interface PipelinePhase {
  name: string;
  plugins: readonly NativePlugin<any, any>[];
  observes?: PhaseObservation;
  editEffect?: EditEffect;
  requiresPrintedInput?: boolean;
  requiresFreshSemantics?: boolean;
  requiresRealizedMap?: boolean;
}

export interface CompiledPhasePlan {
  name: string;
  observes: PhaseObservation;
  editEffect: EditEffect;
  requiresPrintedInput: boolean;
  requiresFreshSemantics: boolean;
  requiresRealizedMap: boolean;
  boundaryBefore: boolean;
  canReuseAst: boolean;
  canDeferRendering: boolean;
}

/** An immutable, reusable transform configuration. */
export interface NativePipeline {
  phases: readonly PipelinePhase[];
}
export type NativePipelineDefinition = NativePipeline;

class Bailout extends Error {}
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

/** Define and freeze a reusable plugin, including its visitor table. */
export function defineNativePlugin<State = undefined, Options = undefined, Analysis = unknown>(
  plugin: NativePluginDefinition<State, Options, Analysis>,
): DefinedNativePlugin<State, Options, Analysis> {
  const definition = {
    ...plugin,
    visitor: plugin.visitor == null ? undefined : Object.freeze({ ...plugin.visitor }),
  } as DefinedNativePlugin<State, Options, Analysis>;
  Object.defineProperty(definition, 'withOptions', {
    enumerable: false,
    value: (options: Options) => defineNativePlugin({ ...plugin, options }),
  });
  return Object.freeze(definition);
}

/**
 * Normalize plugins or explicit phases into an immutable pipeline.
 *
 * Use multiple phases only when later plugins must parse code generated by an
 * earlier phase. Plugins in one phase share parsing, semantic analysis, and a
 * transactional edit commit.
 */
export function defineNativePipeline(pipeline: NativePipelineDefinition): NativePipeline {
  return Object.freeze({
    phases: Object.freeze(
      pipeline.phases.map(phase =>
        Object.freeze({ ...phase, plugins: Object.freeze([...phase.plugins]) }),
      ),
    ),
  });
}

const EDIT_EFFECT_RANK: Readonly<Record<EditEffect, number>> = {
  none: 0,
  'text-only': 1,
  'expression-shape': 2,
  bindings: 3,
  'module-structure': 4,
  'whole-program': 5,
};
const EDIT_EFFECTS = new Set<EditEffect>(Object.keys(EDIT_EFFECT_RANK) as EditEffect[]);
const PHASE_OBSERVATIONS = new Set<PhaseObservation>([
  'original',
  'current-ast',
  'rendered-source',
]);

function maxEditEffect(effects: readonly EditEffect[]): EditEffect {
  let selected: EditEffect = 'none';
  for (const effect of effects)
    if (EDIT_EFFECT_RANK[effect] > EDIT_EFFECT_RANK[selected]) selected = effect;
  return selected;
}

/** Compile conservative phase boundaries without parsing a source file. */
export function compilePhasePlan(pipeline: NativePipeline): readonly CompiledPhasePlan[] {
  let previousEffect: EditEffect = 'none';
  return Object.freeze(
    pipeline.phases.map((phase, index) => {
      if (phase.observes != null && !PHASE_OBSERVATIONS.has(phase.observes))
        throw new Error(`${phase.name}: invalid phase observation ${String(phase.observes)}`);
      if (phase.editEffect != null && !EDIT_EFFECTS.has(phase.editEffect))
        throw new Error(`${phase.name}: invalid edit effect ${String(phase.editEffect)}`);
      for (const plugin of phase.plugins)
        if (plugin.editEffect != null && !EDIT_EFFECTS.has(plugin.editEffect))
          throw new Error(`${plugin.name}: invalid edit effect ${String(plugin.editEffect)}`);
      const observes =
        phase.observes ?? (phase.requiresPrintedInput ? 'rendered-source' : 'current-ast');
      const editEffect =
        phase.editEffect ??
        maxEditEffect(phase.plugins.map(plugin => plugin.editEffect ?? 'whole-program'));
      const boundaryBefore =
        index > 0 &&
        (observes === 'rendered-source' ||
          previousEffect === 'whole-program' ||
          (EDIT_EFFECT_RANK[previousEffect] >= EDIT_EFFECT_RANK.bindings &&
            phase.requiresFreshSemantics !== false));
      const requiresPrintedInput =
        phase.requiresPrintedInput === true || observes === 'rendered-source';
      const requiresFreshSemantics =
        phase.requiresFreshSemantics ??
        (index > 0 && EDIT_EFFECT_RANK[previousEffect] >= EDIT_EFFECT_RANK.bindings);
      const plan = Object.freeze({
        name: phase.name,
        observes,
        editEffect,
        requiresPrintedInput,
        requiresFreshSemantics,
        requiresRealizedMap: phase.requiresRealizedMap === true,
        boundaryBefore,
        canReuseAst:
          !boundaryBefore &&
          (previousEffect === 'none' ||
            (previousEffect === 'text-only' && observes !== 'rendered-source')),
        canDeferRendering:
          editEffect === 'none' ||
          (editEffect === 'text-only' &&
            !phase.requiresRealizedMap &&
            observes !== 'rendered-source'),
      });
      previousEffect = editEffect;
      return plan;
    }),
  );
}
const parserAdapters = new Map<string, ParserAdapter>();
export function registerParserAdapter(adapter: ParserAdapter): () => void {
  if (parserAdapters.has(adapter.name))
    throw new Error(`Parser adapter already registered: ${adapter.name}`);
  parserAdapters.set(adapter.name, adapter);
  return () => {
    if (parserAdapters.get(adapter.name) === adapter) parserAdapters.delete(adapter.name);
  };
}

export function pipelineCacheKey(
  pipeline: NativePipeline,
  filename: string,
  options: TransformOptions = {},
): string {
  const descriptor = {
    filename,
    options,
    phaseGraph: compilePhasePlan(pipeline),
    phases: pipeline.phases.map(phase => ({
      name: phase.name,
      observes: phase.observes,
      editEffect: phase.editEffect,
      requiresPrintedInput: phase.requiresPrintedInput,
      requiresFreshSemantics: phase.requiresFreshSemantics,
      requiresRealizedMap: phase.requiresRealizedMap,
      plugins: phase.plugins.map(plugin => ({
        name: plugin.name,
        editEffect: plugin.editEffect,
        options: plugin.options ?? null,
      })),
    })),
  };
  return createHash('sha256').update(stableJson(descriptor)).digest('hex');
}

/**
 * Cache key for schedulers that classify a source before selecting a worker
 * lane. It deliberately records classification and phase planning separately
 * from the source-content key normally supplied by Metro.
 */
export function transformClassificationCacheKey(
  pipeline: NativePipeline,
  filename: string,
  source: string,
  options: TransformOptions = {},
): string {
  const classification = classifyForTransform(parserFilename(filename, options.parser), source);
  return createHash('sha256')
    .update(
      stableJson({
        pipeline: pipelineCacheKey(pipeline, filename, options),
        classification: {
          syntax: classification.syntax,
          supported: classification.supported,
          codegenCandidate: classification.codegenCandidate,
          reason: classification.reason,
        },
      }),
    )
    .digest('hex');
}

/** A retained native index used by advanced query and traversal operations. */
export class NativeTransformSession {
  #closed = false;
  #batches = 0;
  #uids = new Set<string>();
  #eventCache: (NativeEvent | undefined)[] = [];
  #queryCache = new Map<string, QueryResult>();
  #childrenCache = new Map<number, number[]>();
  #prefetchedChildTypes = new Set<string>();
  #native: NativeIndexedSessionBinding | null = null;
  #nativeFilename: string;
  #lineStarts: number[] | null = null;
  #scopeParents: Uint32Array | null = null;
  #bindingIndex: { nameIds: Map<string, number>; keys: Set<number> } | null = null;
  #nativeParseCount = 0;
  constructor(
    readonly source: string,
    readonly filename: string,
    readonly options: TransformOptions = {},
    retentionManifest?: Buffer,
    initialManifest?: Buffer,
    buildInitialRoute = true,
  ) {
    this.#nativeFilename = parserFilename(filename, options.parser);
    // Without a retention plan or function map the native session holds no state, so its
    // construction (and the source copy it takes) is deferred until something needs it.
    if (options.functionMap === true || retentionManifest != null || initialManifest != null) {
      this.#native = new native.NativeIndexedSession(
        source,
        this.#nativeFilename,
        options.functionMap,
        retentionManifest,
        initialManifest,
        buildInitialRoute,
      );
      if (
        options.maxNativeMemoryBytes != null &&
        this.#native.memoryUsage() > options.maxNativeMemoryBytes
      ) {
        this.#native.close();
        throw new Error('native-memory-budget-exceeded');
      }
    }
  }
  get nativeMemoryBytes(): number {
    return this.#binding().memoryUsage();
  }
  get nativeParseCount(): number {
    return this.#nativeParseCount + (this.#native?.parseCount() ?? 0);
  }
  takeFunctionMap(): FunctionMap | null {
    return this.#native?.takeFunctionMap() ?? null;
  }
  recordStatelessParse(): void {
    this.#nativeParseCount++;
  }
  nextRoutedPacked(
    manifest: Buffer,
    root?: { start: number; end: number },
    followUp = true,
  ): RoutedEventBatch {
    this.#assertOpen();
    if (followUp && ++this.#batches > (this.options.maxFollowUpBatches ?? 64))
      throw new Error('follow-up-batch-budget-exceeded');
    const buffer = this.#binding().nextRoutedPacked(manifest, root?.start, root?.end);
    return decodeRoutedEnvelope(buffer);
  }
  cacheEvent(event: NativeEvent): void {
    if (event.side === 'enter') {
      this.#eventCache[event.id] = event;
    }
  }
  nodeView(event: NativeEvent): NodeView {
    return toNodeView(event);
  }
  query(request: QueryRequest): QueryResult {
    this.#assertOpen();
    const cacheKey = stableJson(request);
    const cached = this.#queryCache.get(cacheKey);
    if (cached) return cached;
    const types = querySubscriptions(request);
    const nodes = types.length
      ? decodeEventBatch(
          decodePackedEnvelope(this.#binding().queryNodesPackedBuffer(types)),
        ).events.map(toNodeView)
      : [];
    const globals: QueryResult['globals'] = {};
    if (request.globals?.length) {
      for (const fact of this.#binding().queryGlobals(request.globals.map(query => query.name))) {
        globals[fact.name] = {
          references: fact.references.map(reference => ({
            id: reference.id,
            type: 'Identifier',
            start: reference.start,
            end: reference.end,
          })),
        };
      }
    }
    const constants: QueryResult['constants'] = {};
    const constantNodes = request.constants?.length ? this.constantNodes(request.constants) : [];
    for (const id of request.constants ?? []) {
      const node = constantNodes.find(candidate => candidate.id === id);
      constants[id] =
        node?.constantKind === 'string'
          ? String(node.constantValue)
          : node?.constantKind === 'number'
            ? Number(node.constantValue)
            : node?.constantKind === 'boolean'
              ? node.constantValue === true || node.constantValue === 'true'
              : null;
    }
    const result = {
      globals,
      imports: request.imports ? nodes.filter(node => node.type === 'ImportDeclaration') : [],
      exports: request.exports ? nodes.filter(node => node.type.startsWith('Export')) : [],
      constants,
      calls: Object.fromEntries(
        (request.calls ?? []).map(call => [
          call.callee,
          this.#binding()
            .queryCalls(call.callee, call.globalOnly, call.staticArguments)
            .map(fact => ({
              id: fact.id,
              type: 'CallExpression',
              start: fact.start,
              end: fact.end,
              scopeId: fact.scopeId,
              calleeName: fact.calleeName,
              calleeGlobal: fact.calleeGlobal,
              staticArgument: fact.staticArgument,
            })),
        ]),
      ),
      captures: Object.fromEntries(
        (request.captures ?? []).map(capture => [
          capture.functionId,
          this.#binding()
            .queryCaptures(capture.functionId)
            .map(reference => ({
              id: reference.id,
              type: 'Identifier',
              start: reference.start,
              end: reference.end,
              scopeId: reference.scopeId,
              parentId: reference.parentId,
              parentType: reference.parentType,
              name: reference.name,
              bindingScopeId: reference.bindingScopeId,
              read: reference.read,
              write: reference.write,
            })),
        ]),
      ),
      bindings: (request.bindings ?? []).flatMap(binding =>
        this.#binding()
          .queryBindings(binding.name, binding.scopeId, binding.reads, binding.writes)
          .map(adaptBindingFact),
      ),
    };
    this.#queryCache.set(cacheKey, result);
    return result;
  }
  inspect(requests: readonly InspectRequest[]): NodeView[] {
    const resolved = new Map<number, NodeView>();
    const missing: InspectRequest[] = [];
    for (const request of requests) {
      const cached = this.#eventCache[request.nodeId];
      if (cached && request.fields.every(field => cached.fields.some(item => item.key === field))) {
        resolved.set(request.nodeId, toNodeView(cached));
      } else if (request.fields.length === 0) {
        const event = this.event(request.nodeId);
        if (event) resolved.set(request.nodeId, toNodeView(event));
      } else {
        missing.push(request);
      }
    }
    if (missing.length > 0)
      for (const node of decodeEventBatch(
        decodePackedEnvelope(
          this.#binding().inspectPackedBuffer(missing.map(request => request.nodeId)),
        ),
      ).events.map(toNodeView))
        resolved.set(node.id, node);
    return requests.flatMap(request => {
      const node = resolved.get(request.nodeId);
      if (!node) return [];
      return [
        Object.freeze(
          Object.fromEntries(
            ['id', 'type', 'start', 'end', 'scopeId', ...request.fields]
              .filter(key => key in node)
              .map(key => [key, node[key]]),
          ),
        ) as NodeView,
      ];
    });
  }
  children(parentId: number): NativeEvent[] {
    this.#assertOpen();
    const cached = this.#childrenCache.get(parentId);
    if (cached) return cached.flatMap(nodeId => this.event(nodeId) ?? []);
    const parent = this.event(parentId);
    if (
      parent &&
      [...this.#prefetchedChildTypes].some(type => type === parent.type || alias(type, parent.type))
    ) {
      const empty: number[] = [];
      this.#childrenCache.set(parentId, empty);
      return [];
    }
    this.prefetchChildren([parentId]);
    return this.#childrenCache.get(parentId)!.flatMap(nodeId => this.event(nodeId) ?? []);
  }
  constantNodes(nodeIds: readonly number[]): NodeView[] {
    this.#assertOpen();
    return this.#binding()
      .queryConstants([...nodeIds])
      .flatMap(fact => {
        const event = this.event(fact.id);
        return event
          ? [
              {
                ...toNodeView(event),
                constantKind: fact.kind,
                constantValue: fact.value,
              },
            ]
          : [];
      });
  }
  nodes(nodeTypes: readonly string[]): NodeView[] {
    this.#assertOpen();
    return decodeEventBatch(
      decodePackedEnvelope(this.#binding().queryNodesPackedBuffer([...nodeTypes])),
    ).events.map(toNodeView);
  }
  prefetchChildren(parentIds: readonly number[] = [], parentTypes: readonly string[] = []): void {
    this.#assertOpen();
    const missing = parentIds.filter(parentId => !this.#childrenCache.has(parentId));
    const missingTypes = parentTypes.filter(type => !this.#prefetchedChildTypes.has(type));
    if (missing.length === 0 && missingTypes.length === 0) return;
    if (++this.#batches > (this.options.maxFollowUpBatches ?? 64))
      throw new Error('follow-up-batch-budget-exceeded');
    const typeIds: number[] = [];
    const fallbackTypes: string[] = [];
    for (const type of missingTypes) {
      const id = NODE_TYPE_IDS.get(type);
      if (id == null) fallbackTypes.push(type);
      else typeIds.push(id);
    }
    const batch = decodeEventBatch(
      decodePackedEnvelope(this.#binding().childrenPackedBuffer(missing, fallbackTypes, typeIds)),
    );
    for (const parentId of missing) this.#childrenCache.set(parentId, []);
    for (const event of batch.events) {
      this.#eventCache[event.id] = event;
      let children = this.#childrenCache.get(event.parentId!);
      if (!children) {
        children = [];
        this.#childrenCache.set(event.parentId!, children);
      }
      children.push(event.id);
    }
    for (const type of missingTypes) this.#prefetchedChildTypes.add(type);
    if (
      this.options.maxNativeMemoryBytes != null &&
      this.#binding().memoryUsage() > this.options.maxNativeMemoryBytes
    )
      throw new Error('native-memory-budget-exceeded');
  }
  event(nodeId: number): NativeEvent | undefined {
    this.#assertOpen();
    const cached = this.#eventCache[nodeId];
    if (cached) return cached;
    const data = this.#binding().nodeSummaryBuffer(nodeId);
    if (data.byteLength !== 7 * 4) return undefined;
    const words = new Uint32Array(data.buffer, data.byteOffset, 7);
    return this.#cacheSummary(nodeId, words, 0);
  }
  /** Seed the event cache from a routed envelope's parent-summary sidecar. */
  seedSummaries(entries: Uint32Array): void {
    this.#assertOpen();
    for (let offset = 0; offset < entries.length; offset += 8) {
      const nodeId = entries[offset]!;
      if (this.#eventCache[nodeId] === undefined) this.#cacheSummary(nodeId, entries, offset + 1);
    }
  }
  #cacheSummary(nodeId: number, words: Uint32Array, offset: number): NativeEvent | undefined {
    const type = NODE_TYPES[words[offset]!] || 'Unknown';
    const parentId = words[offset + 3]!;
    const parentTypeId = words[offset + 4]!;
    const scopeParentId = words[offset + 6]!;
    const event: NativeEvent | undefined =
      type === 'Unknown'
        ? undefined
        : {
            sequence: nodeId,
            side: 'enter',
            id: nodeId,
            type,
            start: words[offset + 1]!,
            end: words[offset + 2]!,
            parentId: parentId === 0xffffffff ? undefined : parentId,
            parentType: parentTypeId === 0xffffffff ? undefined : NODE_TYPES[parentTypeId],
            scopeId: words[offset + 5]!,
            scopeParentId: scopeParentId === 0xffffffff ? undefined : scopeParentId,
            fields: [],
          };
    if (event) this.#eventCache[nodeId] = event;
    return event;
  }
  /** The scope owning the nearest binding visible from `scopeId`, or null.
   *
   * Resolution is local: the binding name table and key set transfer once per session,
   * so hasBinding-style lookups perform no per-call native request.
   */
  resolveBindingScope(name: string, scopeId: number): number | null {
    this.#assertOpen();
    const index = (this.#bindingIndex ??= this.#loadBindingIndex());
    const nameId = index.nameIds.get(name);
    if (nameId == null) return null;
    const parents = this.#scopeParentTable();
    let scope = scopeId;
    while (true) {
      if (index.keys.has(scope * 0x200000 + nameId)) return scope;
      const parent = parents[scope];
      if (parent === undefined || parent === 0xffffffff) return null;
      scope = parent;
    }
  }
  #loadBindingIndex(): { nameIds: Map<string, number>; keys: Set<number> } {
    const data = this.#binding().bindingIndexBuffer();
    const nameCount = data.readUInt32LE(0);
    const keyCount = data.readUInt32LE(4);
    if (nameCount >= 0x200000) throw new Error('binding name table exceeds packed key space');
    const nameIds = new Map<string, number>();
    let offset = 8;
    for (let id = 0; id < nameCount; id++) {
      const length = data.readUInt32LE(offset);
      offset += 4;
      nameIds.set(data.toString('utf8', offset, offset + length), id);
      offset += length + ((4 - (length % 4)) % 4);
    }
    const words = new Uint32Array(data.buffer, data.byteOffset + offset, keyCount * 2);
    const keys = new Set<number>();
    for (let index = 0; index < keyCount; index++)
      keys.add(words[index * 2] * 0x200000 + words[index * 2 + 1]);
    return { nameIds, keys };
  }
  resolveBinding(name: string, scopeId: number): QueryResult['bindings'][number] | undefined {
    const scope = this.resolveBindingScope(name, scopeId);
    const fact = scope == null ? undefined : this.#binding().queryBindings(name, scope)[0];
    return fact && adaptBindingFact(fact);
  }
  globalReferences(name: string): NodeSummary[] {
    return (
      this.#binding()
        .queryGlobals([name])[0]
        ?.references.map(reference => ({
          id: reference.id,
          type: 'Identifier',
          start: reference.start,
          end: reference.end,
        })) ?? []
    );
  }
  scopeParentId(scopeId: number): number | null {
    this.#assertOpen();
    const parent = this.#scopeParentTable()[scopeId];
    return parent === undefined || parent === 0xffffffff ? null : parent;
  }
  #scopeParentTable(): Uint32Array {
    if (this.#scopeParents == null) {
      const data = this.#binding().scopeParentsBuffer();
      this.#scopeParents = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    }
    return this.#scopeParents;
  }
  generateUid(name = 'temp'): string {
    const base = `_${name.replace(/[^A-Za-z0-9_$]/g, '') || 'temp'}`;
    let uid = base;
    let index = 2;
    // A textual match is deliberately conservative: occurrences in comments, strings, or
    // longer identifiers can only make the generated name more unique. This avoids widening the
    // native subscription and transferring every Identifier solely to test a handful of names.
    while (this.#uids.has(uid) || this.source.includes(uid)) uid = `${base}${index++}`;
    this.#uids.add(uid);
    return uid;
  }
  sourceLocation(start: number, end: number): SourceLocation {
    if (this.#lineStarts == null) {
      const starts = [0];
      for (
        let offset = this.source.indexOf('\n');
        offset !== -1;
        offset = this.source.indexOf('\n', offset + 1)
      ) {
        starts.push(offset + 1);
      }
      this.#lineStarts = starts;
    }
    const at = (offset: number) => {
      const starts = this.#lineStarts!;
      let low = 0;
      let high = starts.length;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (starts[middle]! <= offset) low = middle + 1;
        else high = middle;
      }
      const lineIndex = low - 1;
      return { line: low, column: offset - starts[lineIndex]! };
    };
    return { start: at(start), end: at(end) };
  }
  commit(edits: EditCommand[], mode?: string) {
    this.#assertOpen();
    return commitWithDedupe(edits, data =>
      native.commitPackedBuffer(this.source, this.#nativeFilename, data, mode),
    );
  }
  /** Commit whose map stays a packed decoded layer for later chain composition. */
  commitDecoded(edits: EditCommand[], mode?: string) {
    this.#assertOpen();
    return commitWithDedupe(edits, data =>
      native.commitDecodedBuffer(this.source, this.#nativeFilename, data, mode),
    );
  }
  close(): void {
    if (!this.#closed) this.#native?.close();
    this.#closed = true;
  }
  #assertOpen(): void {
    if (this.#closed) throw new Error('session-closed');
  }
  #binding(): NativeIndexedSessionBinding {
    this.#assertOpen();
    return (this.#native ??= new native.NativeIndexedSession(this.source, this.#nativeFilename));
  }
}

function commitWithDedupe<Committed extends object>(
  edits: EditCommand[],
  commit: (data: Buffer) => Committed,
): Committed & { edits: EditCommand[]; deduped: number } {
  try {
    return { ...commit(packEdits(edits)), edits, deduped: 0 };
  } catch (error) {
    // Convergent identical edits are collapsed only on the failure path, so the
    // common case pays nothing for the check.
    const { edits: deduped, dropped } = dedupeConvergentEdits(edits);
    if (dropped > 0) {
      try {
        return { ...commit(packEdits(deduped)), edits: deduped, deduped: dropped };
      } catch (retryError) {
        throw attributeEditConflict(retryError, deduped);
      }
    }
    throw attributeEditConflict(error, edits);
  }
}

type PreparedPluginPlan = PluginPlan & {
  subscriptions: readonly NativeVisitorRoute[];
};

interface PreparedPhase {
  activePlugins: NativePlugin<any, any>[];
  plans: Map<NativePlugin<any, any>, PreparedPluginPlan>;
  subscriptions: Set<string>;
  fieldRequests: Record<string, string[]>;
  includeParent: boolean;
  includeScope: boolean;
  retentionCapabilities: number;
  compiledRoutes: readonly CompiledRouteTemplate[];
  dispatchRoutes: readonly DispatchRoute[];
  manifest: Buffer;
}

interface CompiledRouteTemplate extends NativeRouteManifestEntry {
  plugin: NativePlugin<any, any>;
  callbacks: readonly Handler<any>[];
  fast: boolean;
}
/** One native route delivering to the callbacks of one or more coalesced plugins. */
interface DispatchRoute extends NativeRouteManifestEntry {
  fast: boolean;
  contract: string;
  members: { plugin: NativePlugin<any, any>; callbacks: readonly Handler<any>[] }[];
}
interface CompiledPhaseRoutes {
  routes: CompiledRouteTemplate[];
  dispatchRoutes: DispatchRoute[];
  manifest: Buffer;
}
const preparedPhaseCaches = new WeakMap<PipelinePhase, Map<string, Omit<PreparedPhase, 'plans'>>>();
const compiledPhaseCaches = new WeakMap<PipelinePhase, Map<string, CompiledPhaseRoutes>>();

const RETAIN_IDENTIFIERS = 1 << 0;
const RETAIN_CONSTANTS = 1 << 1;
const RETAIN_CALLS = 1 << 2;
const RETAIN_CHILDREN = 1 << 3;
const RETAIN_INSPECTION = 1 << 4;
const RETAIN_MODULE_FACTS = 1 << 5;

function phaseIsEnabled(plan: PreparedPluginPlan, phaseName: string): boolean {
  if (plan.enabled === false) return false;
  if (plan.phases == null || plan.phases.length === 0) return true;
  for (const enabledPhase of plan.phases) {
    if (enabledPhase === phaseName) return true;
  }
  return false;
}

function routeContains(subscription: string, first: string, second: string): boolean {
  for (const route of subscription.split('|')) {
    if (route === first || route === second) return true;
  }
  return false;
}

function mergeFieldRequests(
  target: Record<string, string[]>,
  source: Readonly<Record<string, readonly string[]>>,
): void {
  for (const [type, fields] of Object.entries(source)) {
    const merged = (target[type] ??= []);
    for (const field of fields) {
      let present = false;
      for (const existing of merged) {
        if (existing === field) {
          present = true;
          break;
        }
      }
      if (!present) merged.push(field);
    }
  }
}

function preparePhase(
  phase: PipelinePhase,
  phaseSource: string,
  filename: string,
  options: TransformOptions,
  parser: ParseClassification,
): PreparedPhase {
  const hints = sourceHints(phaseSource);
  const plans = new Map<NativePlugin<any, any>, PreparedPluginPlan>();
  for (const plugin of phase.plugins) {
    const prepareSubscriptions = new Set<NativeVisitorRoute>();
    const plan =
      plugin.prepare?.(
        {
          filename,
          options,
          parser,
          sourceHints: hints,
          subscribe: (...types) => {
            for (const type of types) prepareSubscriptions.add(type);
          },
        },
        plugin.options as any,
      ) ?? {};
    validatePredicates(plugin.name, plan);
    if (plan.editEffect != null && !EDIT_EFFECTS.has(plan.editEffect))
      throw new Error(`${plugin.name}: invalid edit effect ${String(plan.editEffect)}`);
    plans.set(plugin, {
      ...plan,
      subscriptions: [
        ...(plan.subscriptions ?? []),
        ...prepareSubscriptions,
        ...visitorSubscriptions(plugin.visitor),
      ],
    });
  }

  const preparedKey = phase.plugins
    .map(plugin => `${plugin.name}:${pluginPlanCacheKey(plans.get(plugin)!)}`)
    .join('\u001e');
  const cachedPrepared = preparedPhaseCaches.get(phase)?.get(preparedKey);
  if (cachedPrepared) return { ...cachedPrepared, plans };

  const activePlugins = phase.plugins.filter(plugin =>
    phaseIsEnabled(plans.get(plugin)!, phase.name),
  );
  const subscriptions = new Set<string>();
  const fieldRequests: Record<string, string[]> = {};
  let includeParent = false;
  let includeScope = false;

  for (const plugin of activePlugins) {
    const plan = plans.get(plugin)!;
    for (const type of plan.subscriptions) {
      subscriptions.add(type);
    }
    if (plan.semantics?.[0] === 'scope') {
      includeScope = true;
    }
    includeParent ||= plan.ancestry != null;
    mergeFieldRequests(fieldRequests, plan.fields ?? {});
    for (const [route, predicates] of Object.entries(plan.where ?? {})) {
      for (const concrete of concreteRouteTypes(route)) {
        mergeFieldRequests(fieldRequests, {
          [concrete]: Object.keys(predicates ?? {}),
        });
      }
    }
    mergeFieldRequests(fieldRequests, visitorRoutingFields(plugin.visitor));
  }

  let retentionCapabilities = 0;
  for (const plugin of activePlugins) {
    const plan = plans.get(plugin)!;
    if (
      plan.semantics?.includes('scope') ||
      plan.queries?.some(
        query =>
          (query.globals?.length ?? 0) > 0 ||
          (query.bindings?.length ?? 0) > 0 ||
          (query.captures?.length ?? 0) > 0,
      )
    )
      retentionCapabilities |= RETAIN_IDENTIFIERS;
    if (plan.queries?.some(query => (query.constants?.length ?? 0) > 0))
      retentionCapabilities |= RETAIN_CONSTANTS;
    if (plan.queries?.some(query => (query.calls?.length ?? 0) > 0))
      retentionCapabilities |= RETAIN_CALLS;
    if (plan.queries?.some(query => query.imports === true || query.exports === true))
      retentionCapabilities |= RETAIN_MODULE_FACTS;
    if (plan.children && Object.keys(plan.children).length > 0)
      retentionCapabilities |= RETAIN_CHILDREN;
    if (
      plan.controlFlow?.includes('nested-traverse') ||
      plan.controlFlow?.includes('dynamic-subscriptions')
    )
      retentionCapabilities |= RETAIN_INSPECTION;
  }
  const routed = compilePhaseRoutes(
    phase,
    activePlugins,
    plans,
    includeParent,
    includeScope,
    retentionCapabilities,
  );
  const prepared: PreparedPhase = {
    activePlugins,
    plans,
    subscriptions,
    fieldRequests,
    includeParent,
    includeScope,
    retentionCapabilities,
    compiledRoutes: routed.routes,
    dispatchRoutes: routed.dispatchRoutes,
    manifest: routed.manifest,
  };
  let preparedCache = preparedPhaseCaches.get(phase);
  if (!preparedCache) {
    preparedCache = new Map();
    preparedPhaseCaches.set(phase, preparedCache);
  }
  const { plans: _, ...cacheable } = prepared;
  if (preparedCache.size < 64) preparedCache.set(preparedKey, cacheable);
  return prepared;
}

function pluginPlanCacheKey(plan: PreparedPluginPlan): string {
  const fields = Object.entries(plan.fields ?? {})
    .map(([type, values]) => `${type}:${values?.join(',') ?? ''}`)
    .join(';');
  const where = Object.entries(plan.where ?? {})
    .map(
      ([route, predicates]) =>
        `${route}:${Object.entries(predicates ?? {})
          .map(([field, predicate]) => `${field}=${stableJson(predicate)}`)
          .join(',')}`,
    )
    .join(';');
  return [
    plan.enabled === false ? '0' : '1',
    plan.subscriptions.join(','),
    plan.identifierNames?.join(',') ?? '',
    plan.staticMemberPatterns?.join(',') ?? '',
    fields,
    where,
    plan.controlFlow?.join(',') ?? '*',
    plan.semantics?.join(',') ?? '',
    plan.metadataWrites?.join(',') ?? '',
    plan.phases?.join(',') ?? '',
    String(plan.ancestry ?? ''),
    stableJson(plan.children ?? null),
    stableJson(plan.queries ?? null),
    plan.editEffect ?? '',
  ].join('\u001f');
}

function compilePhaseRoutes(
  phase: PipelinePhase,
  plugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  includeParent: boolean,
  includeScope: boolean,
  retentionCapabilities: number,
): CompiledPhaseRoutes {
  const cacheKey = stableJson({
    includeParent,
    includeScope,
    retentionCapabilities,
    children: plugins.map(plugin => plans.get(plugin)?.children ?? null),
    plugins: plugins.map(plugin => {
      const plan = plans.get(plugin)!;
      return {
        name: plugin.name,
        fields: plan.fields ?? null,
        where: plan.where ?? null,
        identifierNames: plan.identifierNames ?? null,
        staticMemberPatterns: plan.staticMemberPatterns ?? null,
        controlFlow: plan.controlFlow,
      };
    }),
  });
  let cache = compiledPhaseCaches.get(phase);
  if (!cache) {
    cache = new Map();
    compiledPhaseCaches.set(phase, cache);
  }
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const hasGlobalStop = plugins.some(plugin =>
    plans.get(plugin)?.controlFlow?.includes('stop-all'),
  );
  const routes: CompiledRouteTemplate[] = [];
  for (let pluginId = 0; pluginId < plugins.length; pluginId++) {
    const plugin = plugins[pluginId];
    const plan = plans.get(plugin)!;
    const variants = visitorRouteVariants(plugin.visitor);
    for (const variant of variants) {
      const predicates: Record<string, ScalarPredicate> = { ...variant.predicates };
      const matchOnlyFields = new Set<string>();
      for (const [declaredRoute, fields] of Object.entries(plan.where ?? {})) {
        if (
          declaredRoute
            .split('|')
            .some(route =>
              route === 'ReferencedIdentifier' ||
              isCollapsedFunctionKey(route) ||
              isCollapsedClassKey(route)
                ? variant.visitorKeys.includes(route)
                : route === variant.nodeType || alias(route, variant.nodeType),
            )
        )
          for (const [field, predicate] of Object.entries(fields ?? {})) {
            matchOnlyFields.add(field);
            predicates[field] = predicates[field]
              ? intersectPredicates(predicates[field], predicate)
              : predicate;
          }
      }
      if (variant.nodeType === 'Identifier' && plan.identifierNames)
        predicates.name = predicates.name
          ? intersectPredicates(predicates.name, { oneOf: plan.identifierNames })
          : { oneOf: plan.identifierNames };
      if (variant.nodeType === 'StaticMemberExpression' && plan.staticMemberPatterns)
        predicates.memberPath = predicates.memberPath
          ? intersectPredicates(predicates.memberPath, { oneOf: plan.staticMemberPatterns })
          : { oneOf: plan.staticMemberPatterns };
      const explicitlyRequested = plan.fields?.[variant.nodeType as NativeNodeType];
      const payloadFields = (explicitlyRequested ?? []).slice();
      for (const field of visitorRoutingFields(plugin.visitor)[variant.nodeType] ?? [])
        if (!payloadFields.includes(field as NativeFieldKey))
          payloadFields.push(field as NativeFieldKey);
      routes.push({
        id: routes.length,
        pluginId,
        nodeType: variant.nodeType,
        side: variant.side,
        order: pluginId,
        predicates,
        payloadFields,
        plugin,
        callbacks: variant.callbacks,
        fast: !hasGlobalStop && (plan.controlFlow?.length ?? 0) === 0 && plugin.analyze == null,
      });
    }
  }
  // Coalesce runs of identical-contract fast routes into one dispatch route with member
  // callbacks. The native side then evaluates and records each matching node once instead
  // of once per plugin, and JS fans out from a single monomorphic delivery. Grouping only
  // merges a route into the newest group of its (type, side) bucket, preserving plugin
  // order for both enter and (reversed) exit dispatch.
  const dispatchRoutes: DispatchRoute[] = [];
  const openGroups = new Map<string, DispatchRoute>();
  for (const route of routes) {
    const bucket = `${route.nodeType}:${route.side}`;
    const contract = `${route.fast}:${stableJson(route.predicates)}:${route.payloadFields.join(',')}`;
    const open = openGroups.get(bucket);
    if (open != null && route.fast && open.contract === contract) {
      open.members.push({ plugin: route.plugin, callbacks: route.callbacks });
      continue;
    }
    const grouped: DispatchRoute = {
      id: dispatchRoutes.length,
      pluginId: route.pluginId,
      nodeType: route.nodeType,
      side: route.side,
      order: route.order,
      predicates: route.predicates,
      payloadFields: route.payloadFields,
      fast: route.fast,
      contract,
      members: [{ plugin: route.plugin, callbacks: route.callbacks }],
    };
    openGroups.set(bucket, grouped);
    dispatchRoutes.push(grouped);
  }
  const structuralParentTypes = [
    ...new Set(plugins.flatMap(plugin => Object.keys(plans.get(plugin)?.children ?? {}))),
  ];
  const retainedFields: Record<string, string[]> = {};
  for (const plugin of plugins) mergeFieldRequests(retainedFields, plans.get(plugin)?.fields ?? {});
  const manifest = packRouteManifest(
    dispatchRoutes,
    includeParent,
    includeScope,
    retentionCapabilities,
    structuralParentTypes,
    retainedFields,
  );
  const compiled = { routes, dispatchRoutes, manifest };
  if (cache.size < 64) cache.set(cacheKey, compiled);
  return compiled;
}

function intersectPredicates(left: ScalarPredicate, right: ScalarPredicate): ScalarPredicate {
  if ('present' in left) {
    if ('present' in right) return left.present === right.present ? left : { oneOf: [] };
    return left.present ? right : { oneOf: [] };
  }
  if ('present' in right) return right.present ? left : { oneOf: [] };
  const leftValues = 'equals' in left ? [left.equals] : left.oneOf;
  const rightValues = 'equals' in right ? [right.equals] : right.oneOf;
  const values = leftValues.filter(value => rightValues.some(candidate => candidate === value));
  return values.length === 1 ? { equals: values[0] } : { oneOf: values };
}

function visitorRouteVariants(visitor?: Visitor<any>): {
  nodeType: string;
  side: 'enter' | 'exit';
  predicates: Record<string, ScalarPredicate>;
  callbacks: Handler<any>[];
  visitorKeys: string[];
}[] {
  if (!visitor) return [];
  const grouped = new Map<
    string,
    {
      nodeType: string;
      side: 'enter' | 'exit';
      predicates: Record<string, ScalarPredicate>;
      callbacks: Handler<any>[];
      visitorKeys: string[];
      registrations: Set<number>;
    }
  >();
  const add = (
    nodeType: string,
    side: 'enter' | 'exit',
    predicates: Record<string, ScalarPredicate>,
    callback: Handler<any>,
    visitorKey: string,
    registration: number,
  ) => {
    const key = `${nodeType}:${side}:${stableJson(predicates)}`;
    const route = grouped.get(key) ?? {
      nodeType,
      side,
      predicates,
      callbacks: [],
      visitorKeys: [],
      registrations: new Set(),
    };
    if (!route.registrations.has(registration)) {
      if (side === 'exit') route.callbacks.unshift(callback);
      else route.callbacks.push(callback);
      route.registrations.add(registration);
    }
    if (!route.visitorKeys.includes(visitorKey)) route.visitorKeys.push(visitorKey);
    grouped.set(key, route);
  };
  let registration = 0;
  for (const [key, handler] of Object.entries(visitor)) {
    if (!handler) continue;
    for (const visitorKey of key.split('|')) {
      const nodeTypes = concreteRouteTypes(visitorKey);
      const predicates: Record<string, ScalarPredicate> = {};
      if (visitorKey === 'ReferencedIdentifier') predicates.global = { present: true };
      else if (isCollapsedFunctionKey(visitorKey) || isCollapsedClassKey(visitorKey))
        predicates.nodeKind = { equals: visitorKey };
      for (const nodeType of nodeTypes) {
        if (typeof handler === 'function')
          add(nodeType, 'enter', predicates, handler as Handler<any>, visitorKey, registration);
        else {
          if (handler.enter)
            add(
              nodeType,
              'enter',
              predicates,
              handler.enter as Handler<any>,
              visitorKey,
              registration,
            );
          if (handler.exit)
            add(
              nodeType,
              'exit',
              predicates,
              handler.exit as Handler<any>,
              visitorKey,
              registration,
            );
        }
      }
    }
    registration++;
  }
  return [...grouped.values()].map(({ registrations: _, ...route }) => route);
}

const nestedRouteCaches = new WeakMap<
  object,
  {
    manifest: Buffer;
    callbacks: readonly (readonly Handler<any>[])[];
    routes: readonly NativeRouteManifestEntry[];
  }
>();

function compileNestedVisitor(visitor: Visitor<any>): {
  manifest: Buffer;
  callbacks: readonly (readonly Handler<any>[])[];
  routes: readonly NativeRouteManifestEntry[];
} {
  const cached = nestedRouteCaches.get(visitor);
  if (cached) return cached;
  const variants = visitorRouteVariants(visitor);
  const routes: NativeRouteManifestEntry[] = variants.map((variant, id) => ({
    id,
    pluginId: 0,
    nodeType: variant.nodeType,
    side: variant.side,
    order: 0,
    predicates: variant.predicates,
    payloadFields: [],
  }));
  const compiled = {
    manifest: packRouteManifest(routes, true, true),
    callbacks: variants.map(variant => variant.callbacks),
    routes,
  };
  nestedRouteCaches.set(visitor, compiled);
  return compiled;
}

function assertNestedFieldsDeclared(
  plugin: NativePlugin<any, any>,
  plan: Pick<PluginPlan, 'fields'> | undefined,
  routes: readonly NativeRouteManifestEntry[],
): void {
  for (const route of routes) {
    const declared = plan?.fields?.[route.nodeType as NativeNodeType] ?? [];
    for (const field of Object.keys(route.predicates))
      if (!declared.includes(field as NativeFieldKey))
        throw new Error(
          `${plugin.name}: nested traversal requires declared field ${route.nodeType}.${field}`,
        );
  }
}

function nestedManifest(
  plugin: NativePlugin<any, any>,
  plan: Pick<PluginPlan, 'fields'> | undefined,
  compiled: ReturnType<typeof compileNestedVisitor>,
): Buffer {
  assertNestedFieldsDeclared(plugin, plan, compiled.routes);
  return packRouteManifest(
    compiled.routes.map(route => ({
      ...route,
      payloadFields: plan?.fields?.[route.nodeType as NativeNodeType] ?? [],
    })),
    true,
    true,
  );
}

function concreteRouteTypes(route: string): string[] {
  const concrete: string[] = [];
  for (const part of route.split('|')) {
    for (let index = 1; index < NODE_TYPES.length; index++)
      if (part === NODE_TYPES[index] || alias(part, NODE_TYPES[index])) {
        concrete.push(NODE_TYPES[index]);
      }
  }
  return [...new Set(concrete)];
}

function validatePredicates(plugin: string, plan: PluginPlan): void {
  const controlCapabilities = new Set<ControlFlowCapability>([
    'skip',
    'stop',
    'stop-all',
    'nested-traverse',
    'dynamic-subscriptions',
  ]);
  const declaredControls = new Set<string>();
  for (const capability of plan.controlFlow ?? []) {
    if (!controlCapabilities.has(capability) || !declaredControls.add(capability))
      throw new Error(`${plugin}: invalid control-flow capability ${capability}`);
  }
  for (const [route, predicates] of Object.entries(plan.where ?? {})) {
    const concreteTypes = concreteRouteTypes(route);
    if (concreteTypes.length === 0) throw new Error(`${plugin}: unknown predicate route ${route}`);
    for (const [field, predicate] of Object.entries(predicates ?? {})) {
      if (!FIELD_KEY_IDS.has(field))
        throw new Error(`${plugin}: unsupported predicate field ${field}`);
      const invalidType = concreteTypes.find(type => !PREDICATE_FIELDS[type]?.includes(field));
      if (invalidType)
        throw new Error(`${plugin}: predicate field ${field} is not valid for ${invalidType}`);
      if (predicate == null || typeof predicate !== 'object')
        throw new Error(`${plugin}: invalid predicate for ${route}.${field}`);
      const operations =
        Number('equals' in predicate) +
        Number('oneOf' in predicate) +
        Number('present' in predicate);
      if (
        operations !== 1 ||
        ('oneOf' in predicate && !Array.isArray(predicate.oneOf)) ||
        ('present' in predicate && typeof predicate.present !== 'boolean')
      )
        throw new Error(`${plugin}: invalid predicate for ${route}.${field}`);
      const values =
        'equals' in predicate ? [predicate.equals] : 'oneOf' in predicate ? predicate.oneOf : [];
      if (values.length > 1024 || values.some(value => !isScalarPredicateValue(value)))
        throw new Error(`${plugin}: invalid scalar value for ${route}.${field}`);
    }
  }
}

function isScalarPredicateValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

/** Execute a native pipeline synchronously. */
export function transform(
  source: string,
  filename: string,
  pipeline: NativePipeline,
  options: TransformOptions = {},
): TransformResult {
  const parser = classifyForTransform(parserFilename(filename, options.parser), source);
  if (!parser.supported) {
    const adapter = options.parserAdapter
      ? parserAdapters.get(options.parserAdapter)
      : [...parserAdapters.values()].find(candidate => candidate.supports(parser));
    if (adapter) return adapter.transform(source, filename, pipeline, options);
    const prepared: { plugin: NativePlugin<any, any>; state: any }[] = [];
    try {
      for (const phase of pipeline.phases)
        for (const plugin of phase.plugins) {
          const state = plugin.createState?.();
          prepared.push({ plugin, state });
          plugin.prepare?.(
            { filename, options, parser, sourceHints: sourceHints(source), subscribe() {} },
            plugin.options as any,
          );
        }
      for (const { plugin, state } of prepared) plugin.cleanup?.('bailout', state);
      return { status: 'bailout', reason: parser.reason, source, diagnostics: [] };
    } catch (error) {
      for (const { plugin, state } of prepared) plugin.cleanup?.('error', state);
      throw error;
    }
  }
  const originalSource = source;
  const transformStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlanStarted = options.debugPerformance ? performance.now() : 0;
  const phasePlan = compilePhasePlan(pipeline);
  const phasePlanMs = options.debugPerformance ? performance.now() - phasePlanStarted : 0;
  let phaseSource = source;
  const inputMap = options.inputSourceMap ?? null;
  let finalMap: NativeTransformResult['map'] | null = null;
  const metadata: Record<string, unknown> = {};
  const diagnostics: Diagnostic[] = [];
  const intents = new Map<string, IntentRegistration>();
  const provenance = { degradations: 0 };
  if (options.debugPerformance)
    metadata.performance = {
      phases: phasePlan,
      phaseExecutions: [],
      reparses: 0,
      nativeParses: 0,
      routeDeliveries: 0,
      nodeRecords: 0,
      payloadBytes: 0,
      recordWords: 0,
      utf8SlabBytes: 0,
      editCount: 0,
      convergentEditsDeduped: 0,
      renderedBytes: 0,
      mappingSegments: 0,
      mapEncodes: 0,
      pathFacades: 0,
      nodeFacades: 0,
      snapshots: 0,
      scopeFacades: 0,
      sourceBytes: Buffer.byteLength(source),
      phasePlanMs,
      phasePreparationMs: 0,
      sessionOpenMs: 0,
      nativeAndDecodeMs: 0,
      dispatcherSetupMs: 0,
      dispatchMs: 0,
      pathConstructionMs: 0,
      callbackMs: 0,
      renderAndMapMs: 0,
      functionMapMs: 0,
      totalMs: 0,
    };
  const allStates: { plugin: NativePlugin<any, any>; state: any }[] = [];
  // Committed phase mappings in packed decoded form, earliest phase first; the
  // chain composes and encodes once after the last phase.
  const mapLayers: Buffer[] = [];
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  const preparedAhead = new Map<number, { source: string; prepared: PreparedPhase }>();
  let pendingEdits: EditCommand[] = [];
  let nativeFunctionMap: FunctionMap | null = null;
  const recordedParseCounts = new WeakMap<NativeTransformSession, number>();
  try {
    for (let phaseIndex = 0; phaseIndex < pipeline.phases.length; phaseIndex++) {
      const phase = pipeline.phases[phaseIndex];
      const observationSource =
        phasePlan[phaseIndex].observes === 'original' ? originalSource : phaseSource;
      if (reusableSession && reusableSession.source !== observationSource) {
        reusableSession.close();
        reusableSession = null;
        reusableRoutedBatch = null;
      }
      const edits: EditCommand[] = [];
      const preparationStarted = options.debugPerformance ? performance.now() : 0;
      const ahead = preparedAhead.get(phaseIndex);
      preparedAhead.delete(phaseIndex);
      const prepared =
        ahead?.source === observationSource
          ? ahead.prepared
          : preparePhase(phase, observationSource, filename, options, parser);
      if (options.debugPerformance)
        performanceCounters(metadata).phasePreparationMs += performance.now() - preparationStarted;
      const {
        activePlugins,
        plans,
        subscriptions,
        fieldRequests,
        includeParent,
        includeScope,
        retentionCapabilities,
        compiledRoutes,
        dispatchRoutes,
        manifest,
      } = prepared;
      const runtimeEditEffect =
        phase.editEffect ??
        maxEditEffect(
          activePlugins.map(
            plugin => plans.get(plugin)?.editEffect ?? plugin.editEffect ?? 'whole-program',
          ),
        );
      const phaseExecution = options.debugPerformance
        ? {
            name: phase.name,
            observes: phasePlan[phaseIndex].observes,
            editEffect: runtimeEditEffect,
            source:
              observationSource === originalSource ? ('original' as const) : ('rendered' as const),
            reusedParse: false,
            render: 'pending' as 'pending' | 'unchanged' | 'deferred' | 'committed',
          }
        : undefined;
      if (phaseExecution) {
        const performance = metadata.performance as { phaseExecutions: unknown[] };
        performance.phaseExecutions.push(phaseExecution);
      }
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({
          code: 'broad-visitor',
          message: 'Catch-all visitor disables the optimized subscription path.',
          phase: phase.name,
        });
      }
      const futureSubscriptions = new Set<string>();
      const futureRetentionRoutes: CompiledRouteTemplate[] = [];
      const structuralParentTypes = new Set(
        activePlugins.flatMap(plugin => Object.keys(plans.get(plugin)?.children ?? {})),
      );
      const retainedFields: Record<string, string[]> = {};
      for (const plugin of activePlugins)
        mergeFieldRequests(retainedFields, plans.get(plugin)?.fields ?? {});
      let futureRetentionCapabilities = 0;
      for (let futureIndex = phaseIndex + 1; futureIndex < pipeline.phases.length; futureIndex++) {
        if (phasePlan[futureIndex].requiresPrintedInput) break;
        const futureObservationSource =
          phasePlan[futureIndex].observes === 'original' ? originalSource : observationSource;
        if (futureObservationSource !== observationSource) continue;
        const futurePhase = pipeline.phases[futureIndex];
        const existingFuture = preparedAhead.get(futureIndex);
        const futurePrepared =
          existingFuture?.source === futureObservationSource
            ? existingFuture.prepared
            : preparePhase(futurePhase, futureObservationSource, filename, options, parser);
        preparedAhead.set(futureIndex, {
          source: futureObservationSource,
          prepared: futurePrepared,
        });
        for (const subscription of futurePrepared.subscriptions)
          futureSubscriptions.add(subscription);
        futureRetentionRoutes.push(...(futurePrepared.compiledRoutes ?? []));
        futureRetentionCapabilities |= futurePrepared.retentionCapabilities;
        for (const plugin of futurePrepared.activePlugins)
          for (const type of Object.keys(futurePrepared.plans.get(plugin)?.children ?? {}))
            structuralParentTypes.add(type);
        for (const plugin of futurePrepared.activePlugins)
          mergeFieldRequests(retainedFields, futurePrepared.plans.get(plugin)?.fields ?? {});
      }
      const requiresNativeQueries = activePlugins.some(
        plugin => (plans.get(plugin)?.queries?.length ?? 0) > 0,
      );
      const requiresStructuralIndex = activePlugins.some(
        plugin => Object.keys(plans.get(plugin)?.children ?? {}).length > 0,
      );
      const requiresRetainedInspection = activePlugins.some(plugin =>
        plans
          .get(plugin)
          ?.controlFlow?.some(
            capability =>
              capability === 'nested-traverse' || capability === 'dynamic-subscriptions',
          ),
      );
      const requiresIndex =
        requiresNativeQueries ||
        requiresStructuralIndex ||
        requiresRetainedInspection ||
        includeParent ||
        includeScope ||
        options.functionMap === true ||
        futureSubscriptions.size > 0;
      const retainedRoutes = [...compiledRoutes, ...futureRetentionRoutes].map((route, id) => ({
        ...route,
        id,
      }));
      const retentionManifest = packRouteManifest(
        retainedRoutes,
        includeParent,
        includeScope,
        retentionCapabilities | futureRetentionCapabilities,
        [...structuralParentTypes],
        retainedFields,
      );
      const retainedSession = reusableSession;
      const sessionStarted = options.debugPerformance ? performance.now() : 0;
      const session: NativeTransformSession =
        retainedSession ??
        new NativeTransformSession(
          observationSource,
          filename,
          options,
          requiresIndex ? retentionManifest : undefined,
          requiresIndex ? manifest : undefined,
          true,
        );
      if (options.debugPerformance)
        performanceCounters(metadata).sessionOpenMs += performance.now() - sessionStarted;
      if (phaseExecution) phaseExecution.reusedParse = retainedSession != null;
      reusableSession = null;
      openSession = session;
      let batch: RoutedEventBatch;
      {
        const nativeStarted = options.debugPerformance ? performance.now() : 0;
        const cachedRouted = reusableRoutedBatch as {
          manifest: Buffer;
          batch: RoutedEventBatch;
        } | null;
        if (
          options.maxNativeMemoryBytes != null &&
          manifest.byteLength > options.maxNativeMemoryBytes
        )
          throw new Error('native-memory-budget-exceeded');
        if (cachedRouted?.manifest.equals(manifest)) {
          batch = cachedRouted.batch;
        } else {
          if (requiresIndex) {
            batch = session.nextRoutedPacked(manifest, undefined, false);
            if (
              options.maxNativeMemoryBytes != null &&
              session.nativeMemoryBytes + manifest.byteLength + batch.data.byteLength >
                options.maxNativeMemoryBytes
            )
              throw new Error('native-memory-budget-exceeded');
          } else {
            session.recordStatelessParse();
            const routedBuffer = native.materializeRoutedBuffer(
              observationSource,
              parserFilename(filename, options.parser),
              manifest,
            );
            if (
              options.maxNativeMemoryBytes != null &&
              manifest.byteLength + routedBuffer.byteLength > options.maxNativeMemoryBytes
            )
              throw new Error('native-memory-budget-exceeded');
            batch = decodeRoutedEnvelope(routedBuffer);
          }
        }
        reusableRoutedBatch = null;
        if (options.debugPerformance)
          performanceCounters(metadata).nativeAndDecodeMs += performance.now() - nativeStarted;
      }
      if (options.debugPerformance) {
        const performance = metadata.performance as {
          routeDeliveries: number;
          nodeRecords: number;
          payloadBytes: number;
          recordWords: number;
          utf8SlabBytes: number;
        };
        performance.routeDeliveries += batch.routeDeliveryCount;
        performance.nodeRecords += batch.nodeRecordCount;
        performance.payloadBytes += batch.data.byteLength;
        performance.recordWords += batch.recordBytes / 4;
        performance.utf8SlabBytes += batch.stringSlabBytes;
      }
      if (options.functionMap && nativeFunctionMap == null)
        nativeFunctionMap = session.takeFunctionMap();
      const childParentTypes = activePlugins.flatMap(plugin =>
        Object.keys(plans.get(plugin)?.children ?? {}),
      );
      if (childParentTypes.length > 0) session.prefetchChildren([], childParentTypes);
      if (batch.includeParent) session.seedSummaries(batch.parentSummaries);
      const dispatcherStarted = options.debugPerformance ? performance.now() : 0;
      const dispatch = createDispatcher(
        session,
        phase,
        activePlugins,
        plans,
        batch,
        edits,
        metadata,
        diagnostics,
        requiresIndex || includeParent || includeScope,
        compiledRoutes,
        dispatchRoutes,
        intents,
        provenance,
      );
      if (options.debugPerformance)
        performanceCounters(metadata).dispatcherSetupMs += performance.now() - dispatcherStarted;
      for (const plugin of activePlugins) {
        const state = plugin.createState?.();
        allStates.push({ plugin, state });
        dispatch.contexts.get(plugin)!.state = state;
        plugin.pre?.(dispatch.contexts.get(plugin)!.context, state);
      }
      const decisions = new Map<NativePlugin<any, any>, TransformDecision>();
      for (const plugin of activePlugins) {
        const entry = dispatch.contexts.get(plugin)!;
        const decision = plugin.analyze?.(entry.context, entry.state) ?? {
          status: 'supported',
          analysis: undefined,
        };
        decisions.set(plugin, decision);
        if (decision.status === 'unsupported') {
          if (decision.location)
            diagnostics.push({
              code: 'unsupported',
              message: decision.reason,
              plugin: plugin.name,
              phase: phase.name,
              start: locationOffset(observationSource, decision.location.start),
              end: locationOffset(observationSource, decision.location.end),
            });
          throw new Bailout(`${plugin.name}:${decision.reason}`);
        }
        if (decision.status === 'irrelevant') entry.stopped = true;
      }
      for (const plugin of activePlugins) {
        const decision = decisions.get(plugin)!;
        if (decision.status === 'supported') {
          const entry = dispatch.contexts.get(plugin)!;
          plugin.apply?.(entry.context, decision.analysis, entry.state);
        }
      }
      const dispatchStarted = options.debugPerformance ? performance.now() : 0;
      dispatch.run();
      if (options.debugPerformance)
        performanceCounters(metadata).dispatchMs += performance.now() - dispatchStarted;
      for (const plugin of activePlugins)
        plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      for (const plugin of activePlugins) {
        const pluginEffect = plans.get(plugin)?.editEffect ?? plugin.editEffect;
        if (pluginEffect === 'none' && edits.some(edit => edit.owner === plugin.name))
          throw new Error(`${plugin.name}: plugin declared edit effect none but emitted edits`);
      }
      if (runtimeEditEffect === 'none' && edits.length > 0)
        throw new Error(`${phase.name}: phase declared edit effect none but emitted edits`);
      if (options.debugPerformance) {
        const previous = recordedParseCounts.get(session) ?? 0;
        const performance = metadata.performance as { nativeParses: number };
        performance.nativeParses += session.nativeParseCount - previous;
        recordedParseCounts.set(session, session.nativeParseCount);
      }
      const isFinalPhase = phaseIndex === pipeline.phases.length - 1;
      if (edits.length > 0 && observationSource !== phaseSource)
        throw new Error(
          `${phase.name}: edits against original source are ambiguous after a rendered boundary`,
        );
      const effectiveEdits = pendingEdits.length === 0 ? edits : [...pendingEdits, ...edits];
      if (effectiveEdits.length === 0) {
        if (phaseExecution) phaseExecution.render = 'unchanged';
        if (observationSource === phaseSource) {
          reusableSession = session;
          reusableRoutedBatch = { manifest, batch };
        } else {
          session.close();
          openSession = null;
        }
        continue;
      }
      const nextPlan = phasePlan[phaseIndex + 1];
      const canDefer =
        !isFinalPhase &&
        runtimeEditEffect === 'text-only' &&
        nextPlan != null &&
        !nextPlan.requiresPrintedInput &&
        pipeline.phases[phaseIndex + 1].requiresFreshSemantics !== true &&
        !phasePlan[phaseIndex].requiresRealizedMap;
      if (canDefer) {
        if (phaseExecution) phaseExecution.render = 'deferred';
        pendingEdits = effectiveEdits;
        reusableSession = session;
        reusableRoutedBatch = { manifest, batch };
        continue;
      }
      // The sole final layer encodes VLQ directly; any earlier committed layer keeps
      // its mapping in packed decoded form so the chain encodes once at the end.
      const decodedLayer = !(isFinalPhase && mapLayers.length === 0);
      const renderStarted = options.debugPerformance ? performance.now() : 0;
      const recordCommit = (
        committed: { edits: EditCommand[]; deduped: number; code: string },
        segments: number,
        encoded: boolean,
      ) => {
        performanceCounters(metadata).renderAndMapMs += performance.now() - renderStarted;
        const performanceMetadata = metadata.performance as {
          editCount: number;
          convergentEditsDeduped: number;
          renderedBytes: number;
          mappingSegments: number;
          mapEncodes: number;
        };
        performanceMetadata.editCount += committed.edits.length;
        performanceMetadata.convergentEditsDeduped += committed.deduped;
        performanceMetadata.renderedBytes += Buffer.byteLength(committed.code);
        performanceMetadata.mappingSegments += segments;
        if (encoded) performanceMetadata.mapEncodes++;
      };
      if (decodedLayer) {
        const committed = session.commitDecoded(effectiveEdits, options.sourceMapMode);
        phaseSource = committed.code;
        mapLayers.push(committed.map);
        if (options.debugPerformance)
          recordCommit(committed, decodedSegmentCount(committed.map), false);
      } else {
        const committed = session.commit(effectiveEdits, options.sourceMapMode);
        phaseSource = committed.code;
        // The sole final layer: the pipeline's own map is exactly this commit's map,
        // pending only input-map composition at the boundary below.
        finalMap = committed.map;
        if (options.debugPerformance)
          recordCommit(committed, countMappingSegments(committed.map.mappings), true);
      }
      if (phaseExecution) phaseExecution.render = 'committed';
      pendingEdits = [];
      session.close();
      if (options.debugPerformance && phaseIndex + 1 < pipeline.phases.length) {
        const performance = metadata.performance as { reparses: number };
        performance.reparses++;
      }
      reusableRoutedBatch = null;
      openSession = null;
      // Opening the next phase creates the explicit render/reparse boundary.
    }
    reusableSession?.close();
    openSession = null;
    if (mapLayers.length > 0) {
      const composeStarted = options.debugPerformance ? performance.now() : 0;
      finalMap = native.composeDecodedChain(mapLayers);
      if (options.debugPerformance) {
        performanceCounters(metadata).renderAndMapMs += performance.now() - composeStarted;
        (metadata.performance as { mapEncodes: number }).mapEncodes++;
      }
    }
    // Input source maps compose once at the boundary where they enter.
    if (inputMap != null) {
      finalMap =
        finalMap == null
          ? inputMap
          : {
              mappings: native.composeMappings(
                finalMap.mappings,
                inputMap.mappings,
                finalMap.names.length,
              ),
              names: [...finalMap.names, ...inputMap.names],
            };
    }
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    const functionMapStarted = options.debugPerformance ? performance.now() : 0;
    const functionMap = options.functionMap
      ? (nativeFunctionMap ??
        native.generateFunctionMap(originalSource, parserFilename(filename, options.parser)))
      : null;
    if (options.debugPerformance)
      performanceCounters(metadata).functionMapMs = performance.now() - functionMapStarted;
    if (options.debugPerformance)
      performanceCounters(metadata).totalMs = performance.now() - transformStarted;
    // Always-on observability: a count only, so production consumers can notice
    // weakened maps or stale cross-phase text without debug tracing enabled.
    if (provenance.degradations > 0) metadata.provenanceDegradations = provenance.degradations;
    return {
      status: 'complete',
      code: phaseSource,
      map: finalMap ?? { mappings: '', names: [] },
      functionMap,
      metadata,
      diagnostics,
    };
  } catch (error) {
    openSession?.close();
    const bailout = error instanceof Bailout;
    for (const { plugin, state } of allStates)
      plugin.cleanup?.(bailout ? 'bailout' : 'error', state);
    if (bailout) {
      return {
        status: 'bailout',
        reason: error.message,
        source: originalSource,
        diagnostics,
      } satisfies NativeBailoutResult;
    }
    if (error instanceof NativeTransformError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new NativeTransformError(
      message,
      [...diagnostics, { code: 'native-transform-error', message }],
      (error as Error & { owners?: readonly string[] }).owners,
    );
  }
}

/** Segment count of a packed decoded layer buffer (see the native layer layout). */
function decodedSegmentCount(layer: Buffer): number {
  if (layer.length < 12) return 0;
  const segmentsOffset = layer.readUInt32LE(4);
  return (layer.length / 4 - segmentsOffset) / 5;
}

function countMappingSegments(mappings: string): number {
  if (mappings.length === 0) return 0;
  let count = 0;
  let inSegment = false;
  for (const character of mappings) {
    if (character === ',' || character === ';') {
      inSegment = false;
    } else if (!inSegment) {
      count++;
      inSegment = true;
    }
  }
  return count;
}

interface DispatcherEntry extends PathState {
  context: PluginContext;
  state: any;
  delivered?: Set<number>;
  pathRuntime?: PathRuntime;
}

interface Dispatcher {
  contexts: Map<NativePlugin<any, any>, DispatcherEntry>;
  run(): void;
}

function createDispatcher(
  session: NativeTransformSession,
  phase: PipelinePhase,
  activePlugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PluginPlan>,
  batch: RoutedEventBatch,
  edits: EditCommand[],
  metadata: Record<string, unknown>,
  diagnostics: Diagnostic[],
  cacheEvents: boolean,
  compiledRoutes: readonly CompiledRouteTemplate[],
  dispatchRoutes: readonly DispatchRoute[],
  intents: Map<string, IntentRegistration>,
  provenance: { degradations: number },
): Dispatcher {
  let order = 0;
  let stopAll = false;
  let currentSequence = -1;
  let visitorId = 0;
  let visitorIds: WeakMap<object, number> | undefined;
  let activeTraversals: Set<string> | undefined;
  let prologueOffset = -1;
  const contexts = new Map<NativePlugin<any, any>, DispatcherEntry>();
  const metadataOwners = new Map<string, string>();
  for (const plugin of activePlugins)
    for (const key of plans.get(plugin)?.metadataWrites ?? []) {
      const owner = metadataOwners.get(key);
      if (owner && owner !== plugin.name)
        throw new Error(`metadata key ${key} is owned by both ${owner} and ${plugin.name}`);
      metadataOwners.set(key, plugin.name);
    }
  for (const plugin of activePlugins) {
    const allowedMetadata = new Set(plans.get(plugin)?.metadataWrites ?? []);
    const entry: DispatcherEntry = {
      state: undefined,
      stopped: false,
      skipped: undefined,
      context: undefined as unknown as PluginContext,
    };
    const realizeIntentContent = (code: Code): RealizedContent =>
      realizeContent(session, code, (message, fragment) => {
        provenance.degradations++;
        if (optionsPerformance(metadata))
          diagnostics.push({
            code: 'provenance-degraded',
            message,
            plugin: plugin.name,
            phase: phase.name,
            start: fragment.start,
            end: fragment.end,
          });
      });
    /** Register `(kind, key)` for this plugin, or return the existing registration
     * when the intent is already claimed with identical realized content. */
    const ensureIntent = (
      kind: string,
      key: string,
      describe: string,
      realized: RealizedContent,
      range?: { start: number; end: number },
    ): IntentRegistration | null => {
      const composite = `${kind}\u0000${key}`;
      const existing = intents.get(composite);
      if (existing) {
        if (!identicalRealizedContent(existing.realized, realized))
          throw Object.assign(
            new Error(
              `${describe} realized different content for ${plugin.name} than for its first registrant ${existing.owner}`,
            ),
            { owners: [plugin.name, existing.owner] },
          );
        return existing;
      }
      intents.set(composite, { owner: plugin.name, realized, phase: phase.name, ...range });
      return null;
    };
    const context: PluginContext = {
      filename: session.filename,
      phase: phase.name,
      source: session.source,
      metadata: {
        set(key, value) {
          if (!allowedMetadata.has(key))
            throw new Error(`${plugin.name}: undeclared metadata key ${key}`);
          metadata[key] = value;
        },
        get: key => metadata[key],
      },
      query: request => session.query(request),
      inspect: requests => session.inspect(requests),
      diagnostic: diagnostic =>
        diagnostics.push({ ...diagnostic, plugin: plugin.name, phase: phase.name }),
      unsupported: reason => {
        throw new Bailout(`${plugin.name}:${reason}`);
      },
      stopAll: () => {
        assertDeclaredControl(plugin, plans.get(plugin), 'stop-all');
        stopAll = true;
      },
      subscribeRemaining: (...types) => {
        assertDeclaredControl(plugin, plans.get(plugin), 'dynamic-subscriptions');
        entry.delivered ??= new Set();
        replayRoutedFollowup(
          plugin,
          entry,
          context,
          expandSubscriptions(types),
          undefined,
          event => event.sequence > currentSequence,
        );
      },
      revisitProgram: (visitor, state) => {
        assertDeclaredControl(plugin, plans.get(plugin), 'dynamic-subscriptions');
        const compiled = compileNestedVisitor(visitor);
        replayCustomRouted(
          session.nextRoutedPacked(nestedManifest(plugin, plans.get(plugin), compiled)),
          visitor,
          state,
          context,
        );
      },
      ensureHelper: (key, code) => {
        const realized = realizeIntentContent(code);
        if (ensureIntent('helper', key, `helper ${key}`, realized)) return;
        if (prologueOffset < 0) prologueOffset = directivePrologueEnd(session.source);
        const prefix =
          prologueOffset > 0 && session.source[prologueOffset - 1] !== '\n' ? '\n' : '';
        edits.push({
          kind: 'Prologue',
          start: prologueOffset,
          end: prologueOffset,
          ...(realized.contentParts
            ? { contentParts: [...(prefix ? [prefix] : []), ...realized.contentParts, '\n'] }
            : { content: `${prefix}${realized.content}\n` }),
          owner: plugin.name,
          order: order++,
        });
      },
      ensureReplace: (key, start, end, code) => {
        if (!(start >= 0 && end >= start && end <= session.source.length))
          throw new Error(`invalid replacement intent range ${start}..${end}`);
        const realized = realizeIntentContent(code);
        const existing = ensureIntent('replace', key, `replacement intent ${key}`, realized, {
          start,
          end,
        });
        if (existing) {
          // Ranges are phase coordinates: within the registering phase the intent
          // binds one exact range; later phases re-ensure content only.
          if (existing.phase === phase.name && (existing.start !== start || existing.end !== end))
            throw Object.assign(
              new Error(
                `replacement intent ${key} targets ${start}..${end} for ${plugin.name} but ${existing.start}..${existing.end} for its first registrant ${existing.owner}`,
              ),
              { owners: [plugin.name, existing.owner] },
            );
          return;
        }
        edits.push({
          kind: 'Replace',
          start,
          end,
          ...(realized.contentParts
            ? { contentParts: realized.contentParts }
            : { content: realized.content }),
          owner: plugin.name,
          order: order++,
        });
      },
      sourceSlice: (start, end) => {
        if (!(start >= 0 && end >= start && end <= session.source.length))
          throw new Error(`invalid source slice ${start}..${end}`);
        return makeSourceFragment(session, start, end);
      },
      code: codeFactory,
      editor: makeEditor(session, edits, plugin.name, () => order++),
    };
    entry.context = context;
    contexts.set(plugin, entry);
  }
  const createPathRuntime = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
  ): PathRuntime => {
    let runtime: PathRuntime;
    runtime = {
      session,
      context,
      edits,
      owner: plugin.name,
      nextOrder: () => order++,
      state: entry,
      nested(target, nested, state) {
        visitorIds ??= new WeakMap();
        activeTraversals ??= new Set();
        let id = visitorIds.get(nested);
        if (id == null) {
          id = visitorId++;
          visitorIds.set(nested, id);
        }
        const key = `${target.id}:${id}`;
        if (activeTraversals.has(key)) throw new Error(`recursive traversal of node ${target.id}`);
        activeTraversals.add(key);
        try {
          const compiled = compileNestedVisitor(nested);
          replayCustomRouted(
            session.nextRoutedPacked(nestedManifest(plugin, plans.get(plugin), compiled), {
              start: target.start,
              end: target.end,
            }),
            nested,
            state,
            context,
          );
        } finally {
          activeTraversals.delete(key);
        }
      },
      widen(target, types, scopeOnly) {
        entry.delivered ??= new Set();
        const expanded = expandSubscriptions(types);
        const root = scopeOnly ? undefined : { start: target.start, end: target.end };
        const filter = (candidate: NativeEvent) =>
          candidate.sequence > target.sequence &&
          (!scopeOnly || candidate.scopeId === target.scopeId);
        replayRoutedFollowup(plugin, entry, context, expanded, root, filter);
      },
      parent(_target, parentId) {
        const parent = session.event(parentId);
        return parent ? makePath(runtime, parent) : null;
      },
      children(target) {
        return session.children(target.id).map(child => makePath(runtime, child));
      },
      allowsChild(type, role) {
        const declared = plans.get(plugin)?.children;
        if (declared == null) return plugin.name === 'nested';
        for (const [parent, roles] of Object.entries(declared)) {
          if ((parent === type || alias(parent, type)) && childRoleIsDeclared(roles, role))
            return true;
        }
        return false;
      },
      allowsAncestry() {
        return plugin.name === 'nested' || plans.get(plugin)?.ancestry != null;
      },
      allowsScope() {
        return plugin.name === 'nested' || plans.get(plugin)?.semantics?.[0] === 'scope';
      },
      scopeCache: new Map(),
      assertControl(capability) {
        assertDeclaredControl(plugin, plans.get(plugin), capability);
      },
      performance: optionsPerformance(metadata),
      provenance,
    };
    return runtime;
  };
  const dispatchOne = (
    event: NativeEvent,
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    override?: Visitor<any>,
    overrideState?: any,
    routedCallbacks: readonly Handler<any>[] = [],
  ) => {
    const delivered = override ? undefined : entry.delivered;
    const deliveryKey = delivered ? event.id * 2 + Number(event.side === 'exit') : 0;
    if (delivered?.has(deliveryKey)) return;
    if (entry.stopped || stopAll || eventIsSkipped(event, entry.skipped)) return;
    if (routedCallbacks.length === 0) return;
    const runtime = override
      ? createPathRuntime(plugin, entry, context)
      : (entry.pathRuntime ??= createPathRuntime(plugin, entry, context));
    const path = makePath(runtime, event);
    currentSequence = event.sequence;
    if (routedCallbacks.length === 1) {
      invokeCallback(runtime, routedCallbacks[0], path, override ? overrideState : entry.state);
      delivered?.add(deliveryKey);
      return;
    }
    for (const callback of routedCallbacks) {
      invokeCallback(runtime, callback, path, override ? overrideState : entry.state);
      delivered?.add(deliveryKey);
    }
  };
  const replayCustomRouted = (
    routedBatch: RoutedEventBatch,
    visitor: Visitor<any>,
    state: any,
    context: PluginContext,
  ) => {
    const compiled = compileNestedVisitor(visitor);
    const synthetic = { name: 'nested', visitor };
    const entry = {
      context,
      state,
      stopped: false,
      skipped: undefined,
    };
    dispatchRoutedEvents(
      routedBatch,
      compiled.callbacks.map(
        callbacks => (event: NativeEvent) =>
          dispatchOne(event, synthetic, entry, context, visitor, state, callbacks),
      ),
    );
  };
  const followupRouteCache = new Map<
    string,
    { manifest: Buffer; routes: readonly CompiledRouteTemplate[] }
  >();
  const replayRoutedFollowup = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    types: readonly string[],
    root: { start: number; end: number } | undefined,
    filter: (event: NativeEvent) => boolean,
  ): void => {
    const pluginIndex = activePlugins.indexOf(plugin);
    const key = `${pluginIndex}:${types.join('|')}`;
    let followup = followupRouteCache.get(key);
    if (!followup) {
      const selected = compiledRoutes.filter(
        route =>
          route.plugin === plugin &&
          types.some(type => type === route.nodeType || alias(type, route.nodeType)),
      );
      const routes = selected.map((route, id) => ({ ...route, id }));
      followup = {
        routes,
        manifest: packRouteManifest(routes, true, true),
      };
      followupRouteCache.set(key, followup);
    }
    if (followup.routes.length === 0) return;
    const routed = session.nextRoutedPacked(followup.manifest, root);
    const accepted = new WeakSet<NativeEvent>();
    dispatchRoutedEvents(
      routed,
      followup.routes.map(route => (event: NativeEvent) => {
        if (accepted.has(event))
          dispatchOne(
            event,
            plugin,
            entry,
            context,
            undefined,
            undefined,
            route.callbacks as Handler<any>[],
          );
      }),
      event => {
        if (filter(event)) accepted.add(event);
      },
    );
  };
  const counters = optionsPerformance(metadata);
  const routedThunks = dispatchRoutes.map(route => {
    if (!route.fast) {
      const { plugin, callbacks } = route.members[0];
      const entry = contexts.get(plugin)!;
      return (event: NativeEvent) =>
        dispatchOne(
          event,
          plugin,
          entry,
          entry.context,
          undefined,
          undefined,
          callbacks as Handler<any>[],
        );
    }
    // Fast routes bind their runtimes once at dispatcher creation. Exit groups run
    // members in reverse order to preserve the reverse-exit contract across plugins.
    const members = route.members.map(({ plugin, callbacks }) => {
      const entry = contexts.get(plugin)!;
      const runtime = (entry.pathRuntime ??= createPathRuntime(plugin, entry, entry.context));
      return { entry, runtime, callbacks };
    });
    if (route.side === 'exit') members.reverse();
    if (members.length === 1 && members[0].callbacks.length === 1) {
      const { entry, runtime, callbacks } = members[0];
      const callback = callbacks[0];
      if (counters == null)
        return (event: NativeEvent) => {
          currentSequence = event.sequence;
          callback(new NodePathImpl(runtime, event), entry.state);
        };
      return (event: NativeEvent) => {
        currentSequence = event.sequence;
        invokeCallback(runtime, callback, makePath(runtime, event), entry.state);
      };
    }
    return (event: NativeEvent) => {
      currentSequence = event.sequence;
      for (const member of members) {
        const path = makePath(member.runtime, event);
        for (const callback of member.callbacks)
          invokeCallback(member.runtime, callback, path, member.entry.state);
      }
    };
  });
  return {
    contexts,
    run() {
      dispatchRoutedEvents(
        batch,
        routedThunks!,
        cacheEvents ? event => session.cacheEvent(event) : undefined,
      );
    },
  };
}

function invokeCallback(
  runtime: PathRuntime,
  callback: Handler<any>,
  path: NativeNodePath,
  state: any,
): void {
  const counters = runtime.performance;
  if (!counters) {
    callback(path, state);
    return;
  }
  const started = performance.now();
  callback(path, state);
  counters.callbackMs += performance.now() - started;
}

function assertDeclaredControl(
  plugin: Pick<NativePlugin<any, any>, 'name'>,
  plan: PluginPlan | undefined,
  capability: ControlFlowCapability,
): void {
  if (plan?.controlFlow?.includes(capability)) return;
  throw new Error(`${plugin.name}: undeclared control-flow capability ${capability}`);
}

function childRoleIsDeclared(roles: readonly string[], requestedRole: string): boolean {
  for (const role of roles) {
    if (role === requestedRole || role === '*') return true;
  }
  return false;
}

function eventIsSkipped(
  event: NativeEvent,
  ranges: readonly { start: number; end: number }[] | undefined,
): boolean {
  if (!ranges) return false;
  for (const range of ranges) {
    if (event.start > range.start && event.end <= range.end) return true;
  }
  return false;
}

type PathState = { stopped: boolean; skipped?: { start: number; end: number }[] };
type PathRuntime = {
  session: NativeTransformSession;
  context: PluginContext;
  edits: EditCommand[];
  owner: string;
  nextOrder: () => number;
  state: PathState;
  nested: (target: NativeEvent, visitor: Visitor<any>, value: any) => void;
  widen: (target: NativeEvent, types: string[], scopeOnly: boolean) => void;
  parent: (target: NativeEvent, id: number) => NativeNodePath | null;
  children: (target: NativeEvent) => NativeNodePath[];
  allowsChild: (type: string, role: string) => boolean;
  allowsAncestry: () => boolean;
  allowsScope: () => boolean;
  scopeCache: Map<number, NativeScope>;
  assertControl: (capability: ControlFlowCapability) => void;
  performance?: PerformanceAllocationCounters;
  provenance: { degradations: number };
};
type PerformanceAllocationCounters = {
  pathFacades: number;
  nodeFacades: number;
  snapshots: number;
  scopeFacades: number;
  phasePreparationMs: number;
  sessionOpenMs: number;
  nativeAndDecodeMs: number;
  dispatcherSetupMs: number;
  dispatchMs: number;
  pathConstructionMs: number;
  callbackMs: number;
  renderAndMapMs: number;
  functionMapMs: number;
  totalMs: number;
};
function performanceCounters(metadata: Record<string, unknown>): PerformanceAllocationCounters {
  return metadata.performance as PerformanceAllocationCounters;
}
function optionsPerformance(
  metadata: Record<string, unknown>,
): PerformanceAllocationCounters | undefined {
  return metadata.performance as PerformanceAllocationCounters | undefined;
}
function makePath(runtime: PathRuntime, event: NativeEvent): NativeNodePath {
  const counters = runtime.performance;
  if (!counters) return new NodePathImpl(runtime, event);
  const started = performance.now();
  counters.pathFacades++;
  const path = new NodePathImpl(runtime, event);
  counters.pathConstructionMs += performance.now() - started;
  return path;
}

class NodePathImpl implements NativeNodePath {
  // Plain properties instead of #private fields: this class is allocated once per
  // route delivery, and private-field initialization is measurably slower in V8.
  private lazyNode: NodeView | undefined = undefined;
  private lazyParent: NodeSummary | null | undefined = undefined;
  private lazyScope: NativeScope | undefined = undefined;
  constructor(
    readonly runtime: PathRuntime,
    readonly event: NativeEvent,
  ) {}
  get id(): number {
    return this.event.id;
  }
  get type(): string {
    return this.event.type;
  }
  get start(): number {
    return this.event.start;
  }
  get end(): number {
    return this.event.end;
  }
  get node(): NodeView {
    if (!this.lazyNode) {
      if (this.runtime.performance) this.runtime.performance.nodeFacades++;
      this.lazyNode = this.runtime.session.nodeView(this.event);
    }
    return this.lazyNode;
  }
  get context(): PluginContext {
    return this.runtime.context;
  }
  get parent(): NodeSummary | null {
    this.#assertAncestry();
    return (this.lazyParent ??=
      this.event.parentId == null
        ? null
        : { id: this.event.parentId, type: this.event.parentType! });
  }
  get parentPath(): NativeNodePath | null {
    this.#assertAncestry();
    return this.event.parentId == null
      ? null
      : this.runtime.parent(this.event, this.event.parentId);
  }
  get scope(): NativeScope {
    if (!this.runtime.allowsScope())
      throw new Error(`${this.runtime.owner}: undeclared scope semantics`);
    return (this.lazyScope ??= makeScope(
      this.runtime,
      this.event.scopeId,
      this.event.scopeParentId ?? null,
    ));
  }
  getSource(): SourceFragment {
    return makeSourceFragment(this.runtime.session, this.event.start, this.event.end);
  }
  sourceText(): string {
    return this.runtime.session.source.slice(this.event.start, this.event.end);
  }
  snapshot(options: SnapshotOptions = {}): Readonly<NodeView> {
    if (this.runtime.performance) this.runtime.performance.snapshots++;
    const fields = options.fields;
    let source = this.node as NodeView & Record<string, unknown>;
    if (fields) {
      for (const field of fields)
        if (!FIELD_KEY_IDS.has(field)) throw new Error(`unknown snapshot field ${field}`);
      const missing = fields.filter(field => !(field in source));
      if (missing.length > 0) {
        const inspected = this.runtime.session.inspect([
          { nodeId: this.event.id, fields: fields as NativeFieldKey[] },
        ])[0];
        if (inspected) Object.assign(source, inspected);
      }
    }
    const snapshot: Record<string, unknown> = {
      id: source.id,
      type: source.type,
      start: source.start,
      end: source.end,
      scopeId: source.scopeId,
    };
    if (source.scopeParentId != null) snapshot.scopeParentId = source.scopeParentId;
    for (const field of fields ?? Object.keys(source)) {
      if (!(field in snapshot) && field in source) snapshot[field] = source[field];
    }
    if (options.ancestry === 'parent' && this.event.parentId != null) {
      snapshot.parentId = this.event.parentId;
      snapshot.parentType = this.event.parentType;
    }
    return Object.freeze(snapshot) as Readonly<NodeView>;
  }
  getLocation(): SourceLocation {
    return this.runtime.session.sourceLocation(this.event.start, this.event.end);
  }
  is<TType extends string>(type: TType): this is NativeNodePath<NodeOfType<TType>> {
    return type === this.event.type;
  }
  childrenUnchecked(): readonly NativeNodePath[] {
    return this.runtime.children(this.event);
  }
  getChildren(): readonly NativeNodePath[] {
    this.#assertChildRole('*');
    return this.childrenUnchecked();
  }
  get(key: string): NativeNodePath | readonly NativeNodePath[] | null {
    this.#assertChildRole(key);
    return selectChildRole(this, key, this.childrenUnchecked());
  }
  getChild(key: string): NativeNodePath | null {
    const value = this.get(key);
    if (Array.isArray(value)) throw new Error(`${this.node.type}.${key} is a child list`);
    return value as NativeNodePath | null;
  }
  getChildList(key: string): readonly NativeNodePath[] {
    const value = this.get(key);
    if (!Array.isArray(value)) throw new Error(`${this.node.type}.${key} is not a child list`);
    return value;
  }
  matchesPattern(pattern: string, allowPartial = false): boolean {
    const memberPath = this.node.memberPath;
    return (
      typeof memberPath === 'string' &&
      (memberPath === pattern || (allowPartial && memberPath.startsWith(`${pattern}.`)))
    );
  }
  #assertChildRole(role: string): void {
    if (!this.runtime.allowsChild(this.node.type, role))
      throw new Error(`${this.runtime.owner}: undeclared child role ${this.node.type}.${role}`);
  }
  #assertAncestry(): void {
    if (!this.runtime.allowsAncestry())
      throw new Error(`${this.runtime.owner}: undeclared ancestry access`);
  }
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null {
    let parent = this.parentPath;
    while (parent) {
      if (predicate(parent)) return parent;
      parent = parent.parentPath;
    }
    return null;
  }
  find(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null {
    let current: NativeNodePath | null = this;
    while (current) {
      if (predicate(current)) return current;
      current = current.parentPath;
    }
    return null;
  }
  getFunctionParent(): NativeNodePath | null {
    return this.findParent(parent => alias('Function', parent.node.type));
  }
  getProgramParent(): NativeNodePath | null {
    return this.findParent(parent => parent.node.type === 'Program');
  }
  #edit(kind: EditKind, content?: string | CodeFragment): void {
    this.runtime.edits.push({
      kind,
      start: this.event.start,
      end: this.event.end,
      content: typeof content === 'string' ? content : content?.code,
      mapping: typeof content === 'string' ? 'Sourceless' : mappingPolicy(content?.mapping),
      names:
        typeof content === 'string' ? undefined : content?.names ? [...content.names] : undefined,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  /** Lower a provenance-carrying replacement into gap edits around kept source ranges.
   *
   * Source fragments that lie inside the replaced range, in order, survive in place:
   * no edit covers them, so other plugins' edits within those ranges compose instead
   * of conflicting, and their source mappings stay exact. Fragments that cannot be
   * kept (other session, out of range or order) degrade to plain-text copies.
   */
  #replaceStructured(fragment: SourceFragment | CompositeFragment): void {
    const parts = fragment.kind === 'source' ? [fragment] : fragment.parts;
    const session = this.runtime.session;
    const end = this.event.end;
    let cursor = this.event.start;
    let glue: (string | { start: number; end: number })[] = [];
    let glueHasCopy = false;
    let glueMapping: EditCommand['mapping'] = 'Sourceless';
    let glueNames: string[] = [];
    const degraded = this.#degraded;
    const flush = (gapEnd: number) => {
      if (glue.length > 0 || gapEnd > cursor) {
        const shared = {
          kind: 'Replace' as const,
          start: cursor,
          end: gapEnd,
          mapping: glue.length === 0 ? ('Sourceless' as const) : glueMapping,
          names: glueNames.length > 0 ? glueNames : undefined,
          owner: this.runtime.owner,
          order: this.runtime.nextOrder(),
        };
        if (glueHasCopy) this.runtime.edits.push({ ...shared, contentParts: glue });
        else this.runtime.edits.push({ ...shared, content: glue.join('') });
      }
      cursor = gapEnd;
      glue = [];
      glueHasCopy = false;
      glueMapping = 'Sourceless';
      glueNames = [];
    };
    for (const part of parts) {
      if (typeof part === 'string') {
        if (part) glue.push(part);
        continue;
      }
      if ('kind' in part) {
        const sameSession = SOURCE_FRAGMENT_SESSIONS.get(part) === session;
        if (sameSession && part.start >= cursor && part.end <= end && part.start <= part.end) {
          flush(part.start);
          cursor = part.end;
        } else if (sameSession) {
          degraded(
            `source fragment ${part.start}..${part.end} cannot be kept in place ` +
              '(out of order or outside the replaced range); deferred to a commit-time copy',
            part,
          );
          glue.push({ start: part.start, end: part.end });
          glueHasCopy = true;
          if (glueMapping === 'Sourceless') glueMapping = 'AnchorBoundaries';
        } else {
          degraded(
            `source fragment ${part.start}..${part.end} comes from another phase; copied as text`,
            part,
          );
          if (part.text()) glue.push(part.text());
          if (glueMapping === 'Sourceless') glueMapping = 'AnchorBoundaries';
        }
        continue;
      }
      if (part.code) glue.push(part.code);
      const policy = mappingPolicy(part.mapping);
      if (policy !== 'Sourceless') glueMapping = policy;
      if (part.names) glueNames.push(...part.names);
    }
    flush(end);
  }

  replaceWith(code: Code): void {
    if (typeof code !== 'string' && isProvenanceCode(code)) this.#replaceStructured(code);
    else this.#edit('Replace', code);
  }
  replaceWithMultiple(code: readonly Code[]): void {
    if (code.some(value => typeof value !== 'string' && isProvenanceCode(value))) {
      const parts: (string | CodeFragment | SourceFragment)[] = [];
      code.forEach((value, index) => {
        if (index > 0) parts.push('\n');
        if (typeof value === 'string' || !isProvenanceCode(value)) parts.push(value);
        else if (value.kind === 'source') parts.push(value);
        else parts.push(...value.parts);
      });
      this.#replaceStructured({ kind: 'composite', parts });
      return;
    }
    this.#edit('Replace', joinFragments(code as readonly (string | CodeFragment)[]));
  }
  update(code: Code): void {
    this.replaceWith(code);
  }
  overwrite(code: Code): void {
    this.replaceWith(code);
  }
  remove(): void {
    this.#edit('Remove');
  }
  #insert(
    kind: EditKind,
    offset: number,
    content: Code | readonly Code[],
    prefix = '',
    suffix = '',
  ): void {
    this.runtime.edits.push({
      kind,
      start: offset,
      end: offset,
      ...realizeContent(this.runtime.session, content, this.#degraded, prefix, suffix),
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  #degraded = (message: string, target: SourceFragment): void => {
    this.runtime.provenance.degradations++;
    if (this.runtime.performance)
      this.runtime.context.diagnostic({
        code: 'provenance-degraded',
        message,
        start: target.start,
        end: target.end,
      });
  };
  insertBefore(content: Code): void {
    this.#insert('PrependRight', this.event.start, content);
  }
  insertAfter(content: Code): void {
    this.#insert('AppendLeft', this.event.end, content);
  }
  moveTo(destination: number): void {
    if (destination > this.event.start && destination < this.event.end)
      throw new Error('move destination cannot be inside the moved node');
    this.runtime.edits.push({
      kind: 'Move',
      start: this.event.start,
      end: this.event.end,
      destination,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  unshiftContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert('AppendRight', Number(this.node.bodyStart ?? this.event.start), code);
  }
  pushContainer(key: 'body', code: Code | readonly Code[]): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.#insert('PrependLeft', Number(this.node.bodyEnd ?? this.event.end), code);
  }
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line = false): void {
    const comment = line ? `//${content}\n` : `/*${content}*/`;
    if (position === 'leading') this.insertBefore(comment);
    else if (position === 'trailing') this.insertAfter(comment);
    else this.prependToBody(comment);
  }
  buildCodeFrameError(message: string): NativeTransformError {
    return new NativeTransformError(message, [
      { code: 'plugin-error', message, start: this.event.start, end: this.event.end },
    ]);
  }
  prependToBody(content: Code): void {
    this.#insert('AppendRight', Number(this.node.bodyStart ?? this.event.start), content);
  }
  appendToBody(content: Code): void {
    this.#insert('PrependLeft', Number(this.node.bodyEnd ?? this.event.end), content);
  }
  skip(): void {
    this.runtime.assertControl('skip');
    (this.runtime.state.skipped ??= []).push({ start: this.event.start, end: this.event.end });
  }
  stop(): void {
    this.runtime.assertControl('stop');
    this.runtime.state.stopped = true;
  }
  traverse<State>(visitor: Visitor<State>, state?: State): void {
    this.runtime.assertControl('nested-traverse');
    this.runtime.nested(this.event, visitor, state);
  }
  subscribeWithin(types: string | readonly string[]): void {
    this.runtime.assertControl('dynamic-subscriptions');
    this.runtime.widen(this.event, array(types), false);
  }
  subscribeForScope(types: string | readonly string[]): void {
    this.runtime.assertControl('dynamic-subscriptions');
    this.runtime.widen(this.event, array(types), true);
  }
  unsupported(reason: string): never {
    return this.runtime.context.unsupported(reason);
  }
}

type EditKind = EditCommand['kind'];
const visitorSubscriptionsCache = new WeakMap<object, NativeVisitorRoute[]>();
const visitorRoutingFieldsCache = new WeakMap<object, Record<string, string[]>>();
function alias(key: string, type: string): boolean {
  if (key === '*') return true;
  if (key === 'Function') {
    return (
      type === 'Function' ||
      type === 'ArrowFunctionExpression' ||
      type.endsWith('FunctionDeclaration') ||
      type.endsWith('FunctionExpression')
    );
  }
  if (key === 'Statement') return type.endsWith('Statement') || isDeclarationType(type);
  if (key === 'Declaration') return isDeclarationType(type);
  if (key === 'Expression') return type.endsWith('Expression') || isLiteralExpressionType(type);
  if (key === 'MemberExpression') return isMemberExpressionType(type);
  if (key === 'MetaProperty') return type === 'ImportMeta' || type === 'NewTarget';
  if (key === 'ReferencedIdentifier') return type === 'Identifier';
  if (isCollapsedFunctionKey(key)) return type === 'Function';
  if (isCollapsedClassKey(key)) return type === 'Class';
  return false;
}
function isLiteralExpressionType(type: string): boolean {
  return (
    type === 'Identifier' ||
    type === 'StringLiteral' ||
    type === 'NumericLiteral' ||
    type === 'BooleanLiteral' ||
    type === 'BigIntLiteral' ||
    type === 'RegExpLiteral' ||
    type === 'NullLiteral' ||
    type === 'TemplateLiteral'
  );
}
function isMemberExpressionType(type: string): boolean {
  return (
    type === 'StaticMemberExpression' ||
    type === 'ComputedMemberExpression' ||
    type === 'PrivateFieldExpression'
  );
}
function isCollapsedFunctionKey(key: string): boolean {
  return (
    key === 'FunctionDeclaration' || key === 'FunctionExpression' || key === 'TSDeclareFunction'
  );
}
function isCollapsedClassKey(key: string): boolean {
  return key === 'ClassDeclaration' || key === 'ClassExpression';
}
function isDeclarationType(type: string): boolean {
  return (
    type.endsWith('Declaration') ||
    type === 'Function' ||
    type === 'Class' ||
    type === 'TSEnumDeclaration' ||
    type === 'TSInterfaceDeclaration' ||
    type === 'TSTypeAliasDeclaration' ||
    type === 'TSModuleDeclaration' ||
    type === 'TSImportEqualsDeclaration'
  );
}
function toNodeView(event: NativeEvent): NodeView {
  if (event.fields.length === 0) return event as unknown as NodeView;
  const node = event as NativeEvent & Record<string, unknown>;
  for (const field of event.fields) {
    node[field.key] =
      typeof field.value === 'string'
        ? coerceFieldValue(field.key, event.type, field.value)
        : field.value;
  }
  return node as NodeView;
}
function array(value: string | readonly string[]): string[] {
  return typeof value === 'string' ? [value] : [...value];
}
function expandSubscriptions(values: readonly string[]): string[] {
  return [...new Set(values.flatMap(value => value.split('|')))];
}
const encodedSubscriptionsCache = new Map<string, { ids: number[]; fallback: string[] }>();
function encodeSubscriptions(subscriptions: readonly string[]): {
  ids: number[];
  fallback: string[];
} {
  const key = subscriptions.join('|');
  const cached = encodedSubscriptionsCache.get(key);
  if (cached) return cached;
  const ids = new Set<number>();
  const fallback: string[] = [];
  for (const subscription of subscriptions) {
    const id = NODE_TYPE_IDS.get(subscription);
    if (id != null) {
      ids.add(id);
      continue;
    }
    let expanded = false;
    for (let typeId = 1; typeId < NODE_TYPES.length; typeId++) {
      if (alias(subscription, NODE_TYPES[typeId])) {
        ids.add(typeId);
        expanded = true;
      }
    }
    if (!expanded) fallback.push(subscription);
  }
  const encoded = { ids: [...ids], fallback };
  encodedSubscriptionsCache.set(key, encoded);
  return encoded;
}
function visitorSubscriptions(visitor?: Visitor<any>): NativeVisitorRoute[] {
  if (!visitor) return [];
  const cached = visitorSubscriptionsCache.get(visitor);
  if (cached) return cached;
  const subscriptions = expandSubscriptions(Object.keys(visitor)) as NativeVisitorRoute[];
  visitorSubscriptionsCache.set(visitor, subscriptions);
  return subscriptions;
}
function visitorRoutingFields(visitor?: Visitor<any>): Record<string, string[]> {
  if (!visitor) return {};
  const cached = visitorRoutingFieldsCache.get(visitor);
  if (cached) return cached;
  let functionFields = false;
  let classFields = false;
  let identifierFields = false;
  for (const route of Object.keys(visitor)) {
    for (const key of route.split('|')) {
      functionFields ||=
        key === 'FunctionDeclaration' ||
        key === 'FunctionExpression' ||
        key === 'TSDeclareFunction';
      classFields ||= key === 'ClassDeclaration' || key === 'ClassExpression';
      identifierFields ||= key === 'ReferencedIdentifier';
    }
  }
  const fields: Record<string, string[]> = {};
  if (functionFields)
    fields.Function = [
      'nodeKind',
      'name',
      'async',
      'generator',
      'parameterCount',
      'bodyStart',
      'bodyEnd',
    ];
  if (classFields) fields.Class = ['nodeKind', 'name'];
  if (identifierFields) fields.Identifier = ['name', 'global', 'read', 'write', 'bindingScopeId'];
  visitorRoutingFieldsCache.set(visitor, fields);
  return fields;
}
function querySubscriptions(request: QueryRequest): string[] {
  const types: string[] = [];
  if (request.imports) {
    types.push(
      'ImportDeclaration',
      'ImportSpecifier',
      'ImportDefaultSpecifier',
      'ImportNamespaceSpecifier',
    );
  }
  if (request.exports) {
    types.push(
      'ExportNamedDeclaration',
      'ExportDefaultDeclaration',
      'ExportAllDeclaration',
      'ExportSpecifier',
    );
  }
  return types;
}
function mappingPolicy(value?: CodeFragment['mapping']): EditCommand['mapping'] {
  return (
    {
      sourceless: 'Sourceless',
      'anchor-start': 'AnchorStart',
      'anchor-boundaries': 'AnchorBoundaries',
      identity: 'Identity',
    } as const
  )[value ?? 'sourceless'];
}

const SOURCE_FRAGMENT_SESSIONS = new WeakMap<SourceFragment, NativeTransformSession>();

const DIRECTIVE_PROLOGUE =
  /(?:\s|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*(['"])(?:(?!\1)[^\\\r\n]|\\.)*\1[ \t]*(?:;|(?=\r?\n|$))/y;

/** Offset just past the shebang and leading directive statements, detected textually. */
function directivePrologueEnd(source: string): number {
  let offset = 0;
  if (source.startsWith('#!')) {
    const newline = source.indexOf('\n');
    offset = newline === -1 ? source.length : newline + 1;
  }
  DIRECTIVE_PROLOGUE.lastIndex = offset;
  while (DIRECTIVE_PROLOGUE.exec(source) != null) {
    offset = DIRECTIVE_PROLOGUE.lastIndex;
  }
  // Land after the final directive's line break so helpers get their own lines.
  if (source.charCodeAt(offset) === 13 && source.charCodeAt(offset + 1) === 10) offset += 2;
  else if (source.charCodeAt(offset) === 10) offset += 1;
  return offset;
}

/** A transform-level keyed intent: identical realized content dedupes to the first
 * owner, divergent content fails loudly naming both owners. Helpers were the first
 * intent kind; range intents (`ensureReplace`) bind a range within their phase. */
interface IntentRegistration {
  owner: string;
  realized: RealizedContent;
  phase: string;
  start?: number;
  end?: number;
}

function identicalRealizedContent(a: RealizedContent, b: RealizedContent): boolean {
  if (a.content != null || b.content != null) return a.content === b.content;
  return identicalContentParts(a.contentParts, b.contentParts);
}

function makeSourceFragment(
  session: NativeTransformSession,
  start: number,
  end: number,
): SourceFragment {
  const reject = (): never => {
    throw new Error(
      `source fragment ${start}..${end} carries provenance and cannot be used as text; ` +
        'interpolate it with code.template`...` (or pass it to replaceWith) to keep provenance, ' +
        'or call .text() to copy it as plain text',
    );
  };
  const fragment: SourceFragment = Object.freeze({
    kind: 'source' as const,
    start,
    end,
    text: () => session.source.slice(start, end),
    toString: reject,
    [Symbol.toPrimitive]: reject,
  });
  SOURCE_FRAGMENT_SESSIONS.set(fragment, session);
  return fragment;
}

type RealizedContent =
  | { content: string; contentParts?: undefined }
  | { content?: undefined; contentParts: (string | { start: number; end: number })[] };

/** Flatten replacement content into commit-ready form.
 *
 * Same-session source fragments become deferred copy parts realized at commit with the
 * phase's contained edits applied; fragments from other sessions degrade to eager text.
 */
function realizeContent(
  session: NativeTransformSession,
  value: Code | readonly Code[],
  onDegrade?: (message: string, fragment: SourceFragment) => void,
  prefix = '',
  suffix = '',
): RealizedContent {
  const parts: (string | { start: number; end: number })[] = [];
  let hasCopy = false;
  const push = (part: Code): void => {
    if (typeof part === 'string') {
      if (part) parts.push(part);
      return;
    }
    if ('kind' in part) {
      if (part.kind === 'composite') {
        for (const inner of part.parts) push(inner);
        return;
      }
      if (SOURCE_FRAGMENT_SESSIONS.get(part) === session) {
        parts.push({ start: part.start, end: part.end });
        hasCopy = true;
      } else {
        onDegrade?.(
          `source fragment ${part.start}..${part.end} comes from another phase; copied as text`,
          part,
        );
        if (part.text()) parts.push(part.text());
      }
      return;
    }
    if (part.code) parts.push(part.code);
  };
  if (prefix) parts.push(prefix);
  if (isFragmentList(value)) {
    value.forEach((part, index) => {
      if (index > 0) parts.push('\n');
      push(part);
    });
  } else {
    push(value);
  }
  if (suffix) parts.push(suffix);
  if (!hasCopy) return { content: parts.join('') };
  const merged: (string | { start: number; end: number })[] = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (typeof part === 'string' && typeof last === 'string')
      merged[merged.length - 1] = last + part;
    else merged.push(part);
  }
  return { contentParts: merged };
}

function attributeEditConflict(error: unknown, edits: readonly EditCommand[]): unknown {
  if (!(error instanceof Error)) return error;
  const match =
    /overlapping edits at (\d+)\.\.(\d+) and (\d+)\.\.(\d+)/.exec(error.message) ??
    /(?:copied|moved) range in edit (\d+)\.\.(\d+) partially overlaps edit (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /circular source copy in edit (\d+)\.\.(\d+) through edit (\d+)\.\.(\d+)/.exec(error.message) ??
    /overlapping moved ranges at (\d+)\.\.(\d+) and (\d+)\.\.(\d+)/.exec(error.message) ??
    /move of (\d+)\.\.(\d+) lands inside moved range (\d+)\.\.(\d+)/.exec(error.message) ??
    /moved range at (\d+)\.\.(\d+) is partially overlapped by edit at (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /moved range at (\d+)\.\.(\d+) conflicts with covering edit at (\d+)\.\.(\d+)/.exec(
      error.message,
    ) ??
    /edit at (\d+)\.\.(\d+) copies removed range (\d+)\.\.(\d+)/.exec(error.message);
  if (!match) return error;
  const findEdit = (start: number, end: number, exclude?: EditCommand) =>
    edits.find(
      edit =>
        edit !== exclude &&
        Math.min(edit.start, edit.end) === start &&
        Math.max(edit.start, edit.end) === end,
    );
  const sameRange = match[1] === match[3] && match[2] === match[4];
  const firstEdit = findEdit(Number(match[1]), Number(match[2]));
  const secondEdit = findEdit(
    Number(match[3]),
    Number(match[4]),
    sameRange ? firstEdit : undefined,
  );
  const first = firstEdit?.owner ?? 'unknown';
  const owners =
    sameRange && secondEdit == null ? [first] : [first, secondEdit?.owner ?? 'unknown'];
  error.message +=
    owners.length === 1 ? ` (owner: ${first})` : ` (owners: ${owners[0]}, ${owners[1]})`;
  // Structured owners ride along so consumers can aggregate recurring conflict
  // pairs from fallback telemetry without parsing messages.
  (error as Error & { owners?: readonly string[] }).owners = owners;
  return error;
}

function identicalContentParts(
  a: readonly (string | { start: number; end: number })[],
  b: readonly (string | { start: number; end: number })[],
): boolean {
  return (
    a.length === b.length &&
    a.every((part, index) => {
      const other = b[index];
      if (typeof part === 'string' || typeof other === 'string') return part === other;
      return part.start === other.start && part.end === other.end;
    })
  );
}

function identicalConvergentEdit(a: EditCommand, b: EditCommand): boolean {
  if (a.kind !== b.kind || a.content !== b.content || a.destination !== b.destination) return false;
  if ((a.mapping ?? 'Sourceless') !== (b.mapping ?? 'Sourceless')) return false;
  const aNames = a.names ?? [];
  const bNames = b.names ?? [];
  if (aNames.length !== bNames.length || aNames.some((name, index) => name !== bNames[index]))
    return false;
  if (a.contentParts == null || b.contentParts == null)
    return a.contentParts == null && b.contentParts == null;
  return identicalContentParts(a.contentParts, b.contentParts);
}

/** Collapse byte-identical range edits from different plugins to the first owner.
 *
 * Convergent identical edits would otherwise fail overlap validation although either
 * alone yields the same output. Insertions are left untouched: stacking them is
 * intentional, and idempotent-intent inserts are `ensureHelper`'s job.
 */
function dedupeConvergentEdits(edits: readonly EditCommand[]): {
  edits: EditCommand[];
  dropped: number;
} {
  const byRange = new Map<string, EditCommand>();
  const kept: EditCommand[] = [];
  let dropped = 0;
  for (const edit of edits) {
    if (edit.end === edit.start) {
      kept.push(edit);
      continue;
    }
    const key = `${Math.min(edit.start, edit.end)}:${Math.max(edit.start, edit.end)}`;
    const first = byRange.get(key);
    if (first && identicalConvergentEdit(first, edit)) {
      dropped++;
      continue;
    }
    if (!first) byRange.set(key, edit);
    kept.push(edit);
  }
  return { edits: kept, dropped };
}

function isProvenanceCode(value: Code): value is SourceFragment | CompositeFragment {
  return typeof value !== 'string' && 'kind' in value;
}

function containsProvenance(value: Code | NativeNodePath): boolean {
  if (typeof value === 'string') return false;
  if ('getSource' in value) return true;
  if (!('kind' in value)) return false;
  return value.kind === 'source' || value.parts.some(part => containsProvenance(part));
}

function adaptBindingFact(
  fact: ReturnType<NativeIndexedSessionBinding['queryBindings']>[number],
): QueryResult['bindings'][number] {
  return {
    name: fact.name,
    scopeId: fact.scopeId,
    declaration:
      fact.declarationId == null
        ? null
        : {
            id: fact.declarationId,
            type: 'Identifier',
            start: fact.declarationStart!,
            end: fact.declarationEnd!,
            parentId: fact.declarationParentId,
          },
    references: fact.references.map(reference => ({
      id: reference.id,
      type: 'Identifier',
      start: reference.start,
      end: reference.end,
      scopeId: reference.scopeId,
      parentId: reference.parentId,
      parentType: reference.parentType,
      name: fact.name,
      bindingScopeId: fact.scopeId,
      read: reference.read,
      write: reference.write,
    })),
  };
}

function makeScope(runtime: PathRuntime, id: number, parentId: number | null): NativeScope {
  const cached = runtime.scopeCache.get(id);
  if (cached) return cached;
  if (runtime.performance) runtime.performance.scopeFacades++;
  const session = runtime.session;
  const resolve = (name: string): QueryResult['bindings'][number] | undefined => {
    return session.resolveBinding(name, id);
  };
  let parentScope: NativeScope | undefined;
  let ownerPath: NativeNodePath | null | undefined;
  const scope: NativeScope = {
    id,
    parentId,
    get parent() {
      return parentId == null
        ? null
        : (parentScope ??= makeScope(runtime, parentId, session.scopeParentId(parentId)));
    },
    get path() {
      return ownerPath === undefined ? (ownerPath = scopeOwnerPath(runtime, id)) : ownerPath;
    },
    hasBinding: name => session.resolveBindingScope(name, id) != null,
    hasGlobal: name => session.globalReferences(name).length > 0,
    getBinding(name) {
      const binding = resolve(name);
      if (binding) return makeBinding(runtime, binding);
      const references = session.globalReferences(name);
      if (references.length > 0)
        return { name, global: true, declaration: null, references, path: null, scope: null };
      return null;
    },
    getProgramParent() {
      let current: NativeScope = this;
      while (current.parent) current = current.parent;
      return current;
    },
    push(content) {
      const owner = this.path;
      if (!owner) throw new Error(`Cannot find owner path for scope ${id}`);
      const directives = session
        .nodes(['Directive'])
        .filter(
          event =>
            event.scopeId === id && event.start >= owner.node.start && event.end <= owner.node.end,
        );
      const offset = directives.reduce(
        (end, directive) => Math.max(end, directive.end),
        Number(owner.node.bodyStart ?? owner.node.start),
      );
      runtime.edits.push({
        kind: 'AppendLeft',
        start: offset,
        end: offset,
        ...realizeContent(
          runtime.session,
          content,
          undefined,
          directives.length === 0 ? '' : '\n',
          '\n',
        ),
        owner: runtime.owner,
        order: runtime.nextOrder(),
      });
    },
    generateUid: name => session.generateUid(name),
    rename(name, replacement = session.generateUid(name)) {
      const binding = resolve(name);
      if (!binding) throw new Error(`Cannot rename unbound identifier ${name}`);
      if (!/^[$A-Z_a-z][$\w]*$/.test(replacement))
        throw new Error(`Invalid identifier: ${replacement}`);
      const nodes = [binding.declaration, ...binding.references].filter(
        (node): node is NodeSummary | NodeView => node != null,
      );
      const shorthandParentIds = [
        ...new Set(
          nodes.flatMap(node => {
            const view = node as NodeView;
            return view.parentId != null && isShorthandPropertyType(view.parentType)
              ? [view.parentId]
              : [];
          }),
        ),
      ];
      const parentStarts = new Map(
        session
          .inspect(shorthandParentIds.map(nodeId => ({ nodeId, fields: [] })))
          .map(parent => [parent.id, parent.start]),
      );
      for (const node of nodes) {
        const view = node as NodeView;
        const preservesShorthandKey =
          view.parentId != null && parentStarts.get(view.parentId) === view.start;
        runtime.edits.push({
          kind: 'Replace',
          start: node.start!,
          end: node.end!,
          content: preservesShorthandKey ? `${name}: ${replacement}` : replacement,
          mapping: 'AnchorBoundaries',
          names: [name],
          owner: runtime.owner,
          order: runtime.nextOrder(),
        });
      }
      return replacement;
    },
  };
  runtime.scopeCache.set(id, scope);
  return scope;
}

function scopeOwnerPath(runtime: PathRuntime, scopeId: number): NativeNodePath | null {
  const owner = runtime.session
    .nodes(['Program', 'Function', 'ArrowFunctionExpression'])
    .find(
      event =>
        event.scopeId === scopeId &&
        (event.type === 'Program' ||
          event.type === 'Function' ||
          event.type === 'ArrowFunctionExpression'),
    );
  return owner ? pathForId(runtime, owner.id) : null;
}

function makeBinding(
  runtime: PathRuntime,
  binding: QueryResult['bindings'][number],
): NativeBinding {
  let path: NativeNodePath | null | undefined;
  let scope: NativeScope | null | undefined;
  return {
    ...binding,
    global: false,
    get path() {
      return path === undefined ? (path = bindingOwnerPath(runtime, binding.declaration)) : path;
    },
    get scope() {
      if (scope !== undefined) return scope;
      const event =
        binding.declaration == null ? undefined : runtime.session.event(binding.declaration.id);
      return (scope = makeScope(runtime, binding.scopeId, event?.scopeParentId ?? null));
    },
  };
}

function bindingOwnerPath(
  runtime: PathRuntime,
  declaration: NodeSummary | null,
): NativeNodePath | null {
  let parentId = declaration?.parentId;
  let fallback: NativeNodePath | null =
    declaration == null ? null : pathForId(runtime, declaration.id);
  while (parentId != null) {
    const event = runtime.session.event(parentId);
    if (!event) break;
    const path = makePath(runtime, event);
    fallback = path;
    if (isBindingOwnerType(event.type)) return path;
    parentId = event.parentId;
  }
  return fallback;
}
function pathForId(runtime: PathRuntime, nodeId: number): NativeNodePath | null {
  const event = runtime.session.event(nodeId);
  return event ? makePath(runtime, event) : null;
}
function isBindingOwnerType(type: string): boolean {
  return (
    type === 'VariableDeclarator' ||
    type === 'Function' ||
    type === 'Class' ||
    type === 'ImportSpecifier' ||
    type === 'ImportDefaultSpecifier' ||
    type === 'ImportNamespaceSpecifier' ||
    type === 'FormalParameter' ||
    type === 'FormalParameterRest' ||
    type === 'CatchParameter'
  );
}

function joinFragments(values: readonly (string | CodeFragment)[]): CodeFragment {
  return {
    code: values.map(value => (typeof value === 'string' ? value : value.code)).join('\n'),
    mapping: values.some(value => typeof value !== 'string' && value.mapping === 'identity')
      ? 'identity'
      : 'anchor-boundaries',
    names: values.flatMap(value => (typeof value === 'string' ? [] : [...(value.names ?? [])])),
  };
}
function isFragmentList(value: Code | readonly Code[]): value is readonly Code[] {
  return Array.isArray(value);
}

const LIST_CHILD_ROLES = new Set([
  'arguments',
  'body',
  'declarations',
  'decorators',
  'directives',
  'elements',
  'params',
  'properties',
  'specifiers',
]);
function selectChildRole(
  path: NodePathImpl,
  key: string,
  children: readonly NativeNodePath[],
): NativeNodePath | readonly NativeNodePath[] | null {
  const type = path.node.type;
  const at = (index: number) => children[index] ?? null;
  const last = () => children.at(-1) ?? null;
  if (key === 'body') {
    if (
      type === 'Program' ||
      type === 'BlockStatement' ||
      type === 'FunctionBody' ||
      type === 'ClassBody' ||
      type === 'TSModuleBlock'
    )
      return children;
    return last();
  }
  if (key === 'arguments' && (type === 'CallExpression' || type === 'NewExpression'))
    return children.slice(1);
  if (key === 'callee' && (type === 'CallExpression' || type === 'NewExpression')) return at(0);
  if (key === 'declarations' && type === 'VariableDeclaration')
    return children.filter(child => child.node.type === 'VariableDeclarator');
  if (key === 'specifiers' && (type === 'ImportDeclaration' || type === 'ExportNamedDeclaration'))
    return children.filter(child => child.node.type.endsWith('Specifier'));
  if (key === 'directives' && (type === 'Program' || type === 'FunctionBody'))
    return children.filter(child => child.node.type === 'Directive');
  if (
    key === 'decorators' &&
    (type === 'Class' ||
      type === 'MethodDefinition' ||
      type === 'PropertyDefinition' ||
      type === 'FormalParameter')
  )
    return children.filter(child => child.node.type === 'Decorator');
  if (
    key === 'properties' &&
    (type === 'ObjectExpression' || type === 'ObjectPattern' || type === 'ObjectAssignmentTarget')
  )
    return children;
  if (
    key === 'elements' &&
    (type === 'ArrayExpression' || type === 'ArrayPattern' || type === 'ArrayAssignmentTarget')
  )
    return children;
  if (key === 'params' && alias('Function', type)) {
    const parameters = children.find(child => child.node.type === 'FormalParameters');
    return parameters instanceof NodePathImpl ? parameters.childrenUnchecked() : [];
  }
  if (
    key === 'id' &&
    (type === 'VariableDeclarator' ||
      type === 'Function' ||
      type === 'Class' ||
      type === 'TSEnumDeclaration' ||
      type === 'TSInterfaceDeclaration' ||
      type === 'TSTypeAliasDeclaration')
  )
    return at(0);
  if (key === 'init' && type === 'VariableDeclarator') return children.length > 1 ? last() : null;
  if (key === 'expression' && type === 'ExpressionStatement') return at(0);
  if (
    (key === 'key' || key === 'value') &&
    (type === 'ObjectProperty' ||
      type === 'BindingProperty' ||
      type === 'AssignmentTargetPropertyProperty')
  )
    return key === 'key' ? at(0) : last();
  if ((key === 'object' || key === 'property') && isMemberExpressionType(type))
    return key === 'object' ? at(0) : last();
  if (
    (key === 'left' || key === 'right') &&
    (type === 'BinaryExpression' ||
      type === 'LogicalExpression' ||
      type === 'AssignmentExpression' ||
      type === 'PrivateInExpression')
  )
    return key === 'left' ? at(0) : last();
  if (
    key === 'argument' &&
    (type === 'UnaryExpression' ||
      type === 'UpdateExpression' ||
      type === 'AwaitExpression' ||
      type === 'YieldExpression' ||
      type === 'ReturnStatement' ||
      type === 'ThrowStatement' ||
      type === 'SpreadElement')
  )
    return at(0);
  if (
    key === 'test' &&
    (type === 'IfStatement' ||
      type === 'ConditionalExpression' ||
      type === 'WhileStatement' ||
      type === 'DoWhileStatement' ||
      type === 'ForStatement' ||
      type === 'SwitchStatement')
  )
    return at(0);
  if (key === 'consequent' && (type === 'IfStatement' || type === 'ConditionalExpression'))
    return at(1);
  if (key === 'alternate' && (type === 'IfStatement' || type === 'ConditionalExpression'))
    return at(2);
  if (key === 'block' && type === 'TryStatement')
    return children.find(child => child.node.type === 'BlockStatement') ?? null;
  if (key === 'handler' && type === 'TryStatement')
    return children.find(child => child.node.type === 'CatchClause') ?? null;
  if (key === 'finalizer' && type === 'TryStatement') {
    const blocks = children.filter(child => child.node.type === 'BlockStatement');
    return blocks.length > 1 ? blocks[1] : null;
  }
  if (key === 'superClass' && type === 'Class') {
    const candidates = children.filter(
      child =>
        child.node.type !== 'Decorator' &&
        child.node.type !== 'ClassBody' &&
        !child.node.type.startsWith('TS'),
    );
    return typeof path.node.name === 'string' ? (candidates[1] ?? null) : (candidates[0] ?? null);
  }
  if (
    (key === 'key' || key === 'value') &&
    (type === 'MethodDefinition' || type === 'PropertyDefinition' || type === 'AccessorProperty')
  )
    return key === 'key'
      ? (children.find(child => child.node.type !== 'Decorator') ?? null)
      : last();
  if (key === 'source' && (type.startsWith('Import') || type.startsWith('Export')))
    return children.find(child => child.node.type === 'StringLiteral') ?? null;
  if (
    key === 'declaration' &&
    (type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration')
  )
    return (
      children.find(
        child => !child.node.type.endsWith('Specifier') && child.node.type !== 'StringLiteral',
      ) ?? null
    );
  if (LIST_CHILD_ROLES.has(key)) return [];
  throw new Error(`${type} does not expose child role ${JSON.stringify(key)}`);
}
function isShorthandPropertyType(type: string | undefined): boolean {
  return (
    type === 'ObjectProperty' ||
    type === 'BindingProperty' ||
    type === 'AssignmentTargetPropertyIdentifier'
  );
}
function locationOffset(source: string, position: SourceLocation['start']): number {
  const lines = source.split('\n');
  let offset = 0;
  for (let line = 1; line < position.line; line++) offset += (lines[line - 1]?.length ?? 0) + 1;
  return offset + position.column;
}
const SOURCE_HINTS = [
  'process.env',
  'require',
  'import',
  'export',
  'codegenNativeComponent',
] as const;
class LazySourceHints implements ReadonlySet<string> {
  #set?: Set<string>;
  constructor(readonly source: string) {}
  get size(): number {
    return this.#all().size;
  }
  has(value: string): boolean {
    return this.#set?.has(value) ?? this.source.includes(value);
  }
  entries(): SetIterator<[string, string]> {
    return this.#all().entries();
  }
  keys(): SetIterator<string> {
    return this.#all().keys();
  }
  values(): SetIterator<string> {
    return this.#all().values();
  }
  forEach(
    callback: (value: string, value2: string, set: ReadonlySet<string>) => void,
    thisArg?: unknown,
  ): void {
    for (const value of this.#all()) callback.call(thisArg, value, value, this);
  }
  [Symbol.iterator](): SetIterator<string> {
    return this.values();
  }
  #all(): Set<string> {
    return (this.#set ??= new Set(SOURCE_HINTS.filter(hint => this.source.includes(hint))));
  }
}
function sourceHints(source: string): ReadonlySet<string> {
  return new LazySourceHints(source);
}
function parserFilename(filename: string, parser: TransformOptions['parser']): string {
  if (!parser || parser === 'auto') return filename;
  const extension = parser === 'dts' ? 'd.ts' : parser;
  return `${filename.replace(/(?:\.d)?\.[^.]+$/, '')}.${extension}`;
}
function classifyForTransform(filename: string, source: string): ParseClassification {
  const lower = filename.toLowerCase();
  const syntax = lower.endsWith('.d.ts')
    ? 'dts'
    : lower.endsWith('.tsx')
      ? 'tsx'
      : lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')
        ? 'ts'
        : lower.endsWith('.jsx')
          ? 'jsx'
          : lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')
            ? source.includes('@flow')
              ? 'flow'
              : 'js'
            : 'unknown';
  const supported = syntax !== 'flow' && syntax !== 'unknown';
  return {
    syntax,
    supported,
    get codegenCandidate() {
      return source.includes('codegenNativeComponent') || source.includes('codegenNativeCommands');
    },
    reason: supported
      ? 'oxc-supported'
      : syntax === 'flow'
        ? 'flow-requires-parser-adapter'
        : 'unknown-extension',
  };
}
const codeFactory: CodeFactory = {
  identifier(name) {
    if (!/^[$A-Z_a-z][$\w]*$/.test(name)) throw new Error(`Invalid identifier: ${name}`);
    return { code: name, mapping: 'sourceless' };
  },
  stringLiteral: value => ({ code: JSON.stringify(value), mapping: 'sourceless' }),
  literal(value) {
    return {
      code:
        typeof value === 'bigint'
          ? `${value}n`
          : value === null
            ? 'null'
            : typeof value === 'string'
              ? JSON.stringify(value)
              : String(value),
      mapping: 'sourceless',
    };
  },
  template(parts, ...values) {
    if (values.some(containsProvenance)) {
      const composite: (string | CodeFragment | SourceFragment)[] = [];
      parts.forEach((part, index) => {
        if (part) composite.push(part);
        if (index >= values.length) return;
        const value = values[index]!;
        const resolved: Code =
          typeof value !== 'string' && 'getSource' in value ? value.getSource() : value;
        if (typeof resolved === 'string' || !('kind' in resolved)) composite.push(resolved);
        else if (resolved.kind === 'source') composite.push(resolved);
        else composite.push(...resolved.parts);
      });
      return { kind: 'composite', parts: composite };
    }
    return {
      code: parts.reduce(
        (code, part, index) =>
          code +
          part +
          (index < values.length
            ? typeof values[index] === 'string'
              ? (values[index] as string)
              : (values[index] as CodeFragment).code
            : ''),
        '',
      ),
      mapping: 'sourceless',
    };
  },
  parseExpression(code, parserMode) {
    native.validateExpression(code, parserMode === 'auto' ? undefined : parserMode);
    return { code, mapping: 'anchor-boundaries' };
  },
  parseStatements(code, parserMode) {
    native.validateStatements(code, parserMode === 'auto' ? undefined : parserMode);
    return { code, mapping: 'anchor-boundaries' };
  },
};
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}

function makeEditor(
  session: NativeTransformSession,
  edits: EditCommand[],
  owner: string,
  nextOrder: () => number,
): NativeEditor {
  const source = session.source;
  const push = (kind: EditKind, start: number, end: number, content?: string) =>
    edits.push({ kind, start, end, content, owner, order: nextOrder() });
  const leading = () => source.length - source.trimStart().length;
  const trailing = () => source.length - source.trimEnd().length;
  return {
    append: content => push('Suffix', source.length, source.length, content),
    prepend: content => push('Prefix', 0, 0, content),
    appendLeft: (offset, content) => push('AppendLeft', offset, offset, content),
    prependLeft: (offset, content) => push('PrependLeft', offset, offset, content),
    appendRight: (offset, content) => push('AppendRight', offset, offset, content),
    prependRight: (offset, content) => push('PrependRight', offset, offset, content),
    update: (start, end, content) => push('Replace', start, end, content),
    overwrite: (start, end, content) => push('Replace', start, end, content),
    remove: (start, end) => push('Remove', start, end),
    move(start, end, destination) {
      if (destination > start && destination < end)
        throw new Error('move destination cannot be inside moved range');
      edits.push({ kind: 'Move', start, end, destination, owner, order: nextOrder() });
    },
    reset(start, end) {
      for (let index = edits.length - 1; index >= 0; index--)
        if (edits[index].owner === owner && edits[index].start >= start && edits[index].end <= end)
          edits.splice(index, 1);
    },
    indent(prefix = '  ') {
      push(
        'Replace',
        0,
        source.length,
        source
          .split(/(?<=\n)/)
          .map(line => (line.trim() ? prefix + line : line))
          .join(''),
      );
    },
    trim() {
      this.trimStart();
      this.trimEnd();
    },
    trimStart() {
      const count = leading();
      if (count) push('Remove', 0, count);
    },
    trimEnd() {
      const count = trailing();
      if (count) push('Remove', source.length - count, source.length);
    },
    addSourceMapLocation(offset) {
      push('AddSourceMapLocation', offset, offset);
    },
    hasChanged: () => edits.some(edit => edit.owner === owner),
    replace(search, replacement) {
      lowerReplacements(source, search, replacement, false, (start, end, content) =>
        push('Replace', start, end, content),
      );
    },
    replaceAll(search, replacement) {
      lowerReplacements(source, search, replacement, true, (start, end, content) =>
        push('Replace', start, end, content),
      );
    },
    slice: (start, end) => source.slice(start, end),
    toString: () => session.commit(edits).code,
    isEmpty: () => source.trim().length === 0,
  };
}

function lowerReplacements(
  source: string,
  search: string | RegExp,
  replacement: string | ((match: string, ...groups: string[]) => string),
  all: boolean,
  emit: (start: number, end: number, content: string) => void,
): void {
  const expression =
    typeof search === 'string'
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), all ? 'g' : '')
      : new RegExp(search.source, all && !search.global ? `${search.flags}g` : search.flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(source))) {
    const content =
      typeof replacement === 'function'
        ? replacement(match[0], ...match.slice(1).map(value => value ?? ''))
        : match[0].replace(expression, replacement);
    emit(match.index, match.index + match[0].length, content);
    if (!all || !expression.global) break;
    if (match[0] === '') expression.lastIndex++;
  }
}
