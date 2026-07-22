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
  forEachRoutedEvent,
  packEdits,
  packFieldRequests,
  packRouteManifest,
  parseScalar,
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
  ControlFlowCapability,
  ScalarPredicate,
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
  push(content: CodeFragment | string): void;
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
  readonly code: CodeFactory;
  readonly editor: NativeEditor;
}

export interface NativeEditor {
  supports(capability: EditorCapability): boolean;
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
export type EditorCapability =
  | 'append'
  | 'prepend'
  | 'update'
  | 'overwrite'
  | 'remove'
  | 'move'
  | 'reset'
  | 'indent'
  | 'trim'
  | 'addSourceMapLocation'
  | 'replace'
  | 'replaceAll';

export interface CodeFragment {
  code: string;
  mapping: 'sourceless' | 'anchor-start' | 'anchor-boundaries' | 'identity';
  names?: readonly string[];
}
export interface CodeFactory {
  identifier(name: string): CodeFragment;
  stringLiteral(value: string): CodeFragment;
  literal(value: string | number | boolean | bigint | null): CodeFragment;
  template(
    parts: TemplateStringsArray,
    ...values: readonly (CodeFragment | string)[]
  ): CodeFragment;
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
  readonly node: T;
  readonly parent: NodeSummary | null;
  readonly parentPath: NativeNodePath | null;
  readonly scope: NativeScope;
  readonly context: PluginContext;
  getSource(): string;
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
  replaceWith(code: CodeFragment | string): void;
  replaceWithMultiple(code: readonly (CodeFragment | string)[]): void;
  update(code: CodeFragment | string): void;
  overwrite(code: CodeFragment | string): void;
  remove(): void;
  insertBefore(code: string): void;
  insertAfter(code: string): void;
  unshiftContainer(
    key: 'body',
    code: CodeFragment | string | readonly (CodeFragment | string)[],
  ): void;
  pushContainer(
    key: 'body',
    code: CodeFragment | string | readonly (CodeFragment | string)[],
  ): void;
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line?: boolean): void;
  buildCodeFrameError(message: string): NativeTransformError;
  prependToBody(code: string): void;
  appendToBody(code: string): void;
  skip(): void;
  stop(): void;
  traverse<State>(visitor: Visitor<State>, state?: State): void;
  subscribeWithin(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  subscribeForScope(types: NativeVisitorRoute | readonly NativeVisitorRoute[]): void;
  unsupported(reason: string): never;
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
  version?: string;
  apiVersion: 2;
  options?: Options;
  prepare?(context: PrepareContext, options: Options): PluginPlan | void;
  createState?(): State;
  pre?(context: PluginContext, state: State): void;
  analyze?(context: PluginContext, state: State): TransformDecision<Analysis> | void;
  apply?(context: PluginContext, analysis: Analysis, state: State): void;
  visitor?: Visitor<State>;
  post?(context: PluginContext, state: State): void;
  cleanup?(reason: 'complete' | 'bailout' | 'error', state: State): void;
}
export type NativePluginDefinition<State = unknown, Options = unknown, Analysis = unknown> = Omit<
  NativePlugin<State, Options, Analysis>,
  'apiVersion'
> & { apiVersion?: 2 };
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
  reparseAfterEdits?: boolean;
}

/** An immutable, reusable transform configuration. */
export interface NativePipeline {
  apiVersion: 2;
  phases: readonly PipelinePhase[];
}
export type NativePipelineDefinition = Omit<NativePipeline, 'apiVersion'> & { apiVersion?: 2 };
export interface NativePluginPipelineDefinition {
  apiVersion?: 2;
  plugins: readonly NativePlugin<any, any>[];
  phaseName?: string;
}

class Bailout extends Error {}
export class NativeTransformError extends Error {
  constructor(
    message: string,
    readonly diagnostics: Diagnostic[],
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
    apiVersion: 2 as const,
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
export function defineNativePipeline(
  pipeline:
    | NativePipelineDefinition
    | NativePluginPipelineDefinition
    | readonly NativePlugin<any, any>[],
): NativePipeline {
  const normalized: NativePipelineDefinition = isPluginList(pipeline)
    ? { phases: [{ name: 'transform', plugins: pipeline }] }
    : 'plugins' in pipeline
      ? { phases: [{ name: pipeline.phaseName ?? 'transform', plugins: pipeline.plugins }] }
      : pipeline;
  return Object.freeze({
    apiVersion: 2,
    phases: Object.freeze(
      normalized.phases.map(phase =>
        Object.freeze({ ...phase, plugins: Object.freeze([...phase.plugins]) }),
      ),
    ),
  });
}
function isPluginList(
  value:
    | NativePipelineDefinition
    | NativePluginPipelineDefinition
    | readonly NativePlugin<any, any>[],
): value is readonly NativePlugin<any, any>[] {
  return Array.isArray(value);
}
const parserAdapters = new Map<string, ParserAdapter>();
let routedProtocolAvailable: boolean | undefined;

function supportsRoutedProtocol(): boolean {
  return (routedProtocolAvailable ??=
    native.materializeRoutedBuffer != null && native.routedProtocolVersion?.() === 1);
}
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
    apiVersion: pipeline.apiVersion,
    nativeVersion: native.nativeVersion(),
    oxcVersion: native.oxcVersion(),
    filename,
    options,
    phases: pipeline.phases.map(phase => ({
      name: phase.name,
      reparseAfterEdits: !!phase.reparseAfterEdits,
      plugins: phase.plugins.map(plugin => ({
        name: plugin.name,
        version: plugin.version ?? '0',
        apiVersion: plugin.apiVersion,
        options: plugin.options ?? null,
      })),
    })),
  };
  return createHash('sha256').update(stableJson(descriptor)).digest('hex');
}

/** A retained native index used by advanced query and traversal operations. */
export class NativeTransformSession {
  #closed = false;
  #batches = 0;
  #uids = new Set<string>();
  #eventCache: (NativeEvent | undefined)[] = [];
  #nodeSummaryWords: Uint32Array | null = null;
  #nodeViewCache: (NodeView | undefined)[] = [];
  #queryCache = new Map<string, QueryResult>();
  #identifiersCache: NativeEvent[] | null = null;
  #identifierViewsCache: NodeView[] | null = null;
  #bindingIndexCache: Map<string, QueryResult['bindings'][number]> | null = null;
  #globalIndexCache: Map<string, NodeSummary[]> | null = null;
  #scopeParentsCache: Map<number, number | null> | null = null;
  #childrenCache = new Map<number, NativeEvent[]>();
  #prefetchedChildTypes = new Set<string>();
  #packedBatchCache = new Map<string, PackedEventBatch>();
  #native: NativeIndexedSessionBinding | null = null;
  #useStatelessInitialBatch: boolean;
  #nativeFilename: string;
  #includeParent: boolean;
  #includeScope: boolean;
  #identifierNames: readonly string[];
  #staticMemberPatterns: readonly string[];
  #lineStarts: number[] | null = null;
  constructor(
    readonly source: string,
    readonly filename: string,
    readonly options: TransformOptions = {},
    initialSubscriptions: readonly string[] = [],
    retainInitialIndex = false,
    includeParent = true,
    includeScope = true,
    identifierNames: readonly string[] = [],
    staticMemberPatterns: readonly string[] = [],
    initialExitSubscriptions: readonly string[] = [],
  ) {
    this.#nativeFilename = parserFilename(filename, options.parser);
    this.#includeParent = includeParent;
    this.#includeScope = includeScope;
    this.#identifierNames = identifierNames;
    this.#staticMemberPatterns = staticMemberPatterns;
    this.#useStatelessInitialBatch = initialSubscriptions.length > 0 && !retainInitialIndex;
    if (!this.#useStatelessInitialBatch)
      this.#native = new native.NativeIndexedSession(
        source,
        this.#nativeFilename,
        [...initialSubscriptions],
        [...initialExitSubscriptions],
      );
    if (
      this.#native &&
      options.maxNativeMemoryBytes != null &&
      this.#native.memoryUsage() > options.maxNativeMemoryBytes
    ) {
      this.#native.close();
      throw new Error('native-memory-budget-exceeded');
    }
  }
  get nativeMemoryBytes(): number {
    return this.#binding().memoryUsage();
  }
  static open(
    source: string,
    filename: string,
    options: TransformOptions = {},
  ): NativeTransformSession {
    return new NativeTransformSession(source, filename, options);
  }
  next(
    subscriptions: readonly string[],
    root?: { start: number; end: number },
    fields?: Readonly<Record<string, readonly string[]>>,
    includeExit = true,
  ): EventBatch {
    const batch = decodeEventBatch(this.nextPacked(subscriptions, root, fields, includeExit));
    for (const event of batch.events)
      if (event.side === 'enter') this.#eventCache[event.id] = event;
    return batch;
  }
  nextPacked(
    subscriptions: readonly string[],
    root?: { start: number; end: number },
    fields?: Readonly<Record<string, readonly string[]>>,
    includeExit = true,
    requestedExitSubscriptions?: readonly string[],
  ): PackedEventBatch {
    this.#assertOpen();
    const exitSubscriptions = requestedExitSubscriptions ?? (includeExit ? subscriptions : []);
    const cacheKey = stableJson({ subscriptions, root, fields, exitSubscriptions });
    const cached = this.#packedBatchCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    if (++this.#batches > (this.options.maxFollowUpBatches ?? 64))
      throw new Error('follow-up-batch-budget-exceeded');
    const fieldRequests =
      fields &&
      Object.entries(fields).map(([nodeType, requested]) => ({ nodeType, fields: [...requested] }));
    const packed = this.#useStatelessInitialBatch
      ? (() => {
          const encoded = encodeSubscriptions(subscriptions);
          const encodedExits = encodeSubscriptions(exitSubscriptions);
          return decodePackedEnvelope(
            native.materializePackedBuffer(
              this.source,
              this.#nativeFilename,
              encoded.fallback,
              encoded.ids,
              encodedExits.fallback,
              encodedExits.ids,
              root?.start,
              root?.end,
              packFieldRequests(fields),
              this.#includeParent,
              this.#includeScope,
              [...this.#identifierNames],
              [...this.#staticMemberPatterns],
            ),
          );
        })()
      : this.#binding().nextPacked([...subscriptions], root?.start, root?.end, fieldRequests, [
          ...exitSubscriptions,
        ]);
    packed.includeExit = exitSubscriptions.length > 0;
    this.#useStatelessInitialBatch = false;
    this.#packedBatchCache.set(cacheKey, packed);
    return packed;
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
    if (
      event.side === 'enter' &&
      (this.#includeParent || this.#includeScope || this.#native != null)
    ) {
      this.#eventCache[event.id] = event;
    }
  }
  nodeView(event: NativeEvent): NodeView {
    return (this.#nodeViewCache[event.id] ??= toNodeView(event));
  }
  query(request: QueryRequest): QueryResult {
    this.#assertOpen();
    const cacheKey = stableJson(request);
    const cached = this.#queryCache.get(cacheKey);
    if (cached) return cached;
    const directGlobals =
      request.globals?.length && request.bindings == null && request.captures == null;
    const types = querySubscriptions({ ...request, constants: undefined }).filter(
      type => !(directGlobals && type === 'Identifier'),
    );
    const needsIdentifiers = types.some(type => type === 'Identifier');
    const remainingTypes = needsIdentifiers ? types.filter(type => type !== 'Identifier') : types;
    const nodes = remainingTypes.length
      ? this.next(remainingTypes, undefined, undefined, false).events.map(toNodeView)
      : [];
    if (needsIdentifiers) nodes.push(...this.identifierViews());
    const globals: QueryResult['globals'] = {};
    if (request.globals?.length) {
      if (directGlobals) {
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
      } else {
        const index = this.identifierIndexes().globals;
        for (const query of request.globals)
          globals[query.name] = { references: index.get(query.name) ?? [] };
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
          nodes.filter(
            node =>
              node.type === 'CallExpression' &&
              node.calleeName === call.callee &&
              (!call.globalOnly || node.calleeGlobal === true) &&
              (!call.staticArguments || typeof node.staticArgument === 'string'),
          ),
        ]),
      ),
      captures: Object.fromEntries(
        (request.captures ?? []).map(capture => {
          const fn = nodes.find(node => node.id === capture.functionId);
          const scopeContains = (ancestor: number, child: number) => {
            let scope: number | null = child;
            while (scope != null) {
              if (scope === ancestor) return true;
              scope = this.scopeParentId(scope);
            }
            return false;
          };
          const references = fn
            ? nodes.filter(
                node =>
                  node.type === 'Identifier' &&
                  node.start >= fn.start &&
                  node.end <= fn.end &&
                  node.binding !== true &&
                  node.global !== true &&
                  typeof node.bindingScopeId === 'number' &&
                  scopeContains(fn.scopeId, node.scopeId) &&
                  node.bindingScopeId !== fn.scopeId &&
                  !scopeContains(fn.scopeId, node.bindingScopeId),
              )
            : [];
          return [capture.functionId, references];
        }),
      ),
      bindings: (request.bindings ?? []).flatMap(binding => {
        const index = this.identifierIndexes().bindings;
        const candidates =
          binding.name != null && binding.scopeId != null
            ? [index.get(`${binding.scopeId}:${binding.name}`)].filter(
                (candidate): candidate is QueryResult['bindings'][number] => candidate != null,
              )
            : [...index.values()].filter(
                candidate =>
                  (binding.name == null || candidate.name === binding.name) &&
                  (binding.scopeId == null || candidate.scopeId === binding.scopeId),
              );
        if (!binding.reads && !binding.writes) return candidates;
        return candidates.map(candidate => ({
          ...candidate,
          references: candidate.references.filter(
            reference =>
              (!binding.reads || reference.read === true) &&
              (!binding.writes || reference.write === true),
          ),
        }));
      }),
    };
    this.#queryCache.set(cacheKey, result);
    return result;
  }
  inspect(requests: readonly InspectRequest[]): NodeView[] {
    return this.#binding()
      .inspect(requests.map(request => request.nodeId))
      .map(toNodeView)
      .map(node => {
        const request = requests.find(item => item.nodeId === node.id)!;
        return Object.freeze(
          Object.fromEntries(
            ['id', 'type', 'start', 'end', 'scopeId', ...request.fields]
              .filter(key => key in node)
              .map(key => [key, node[key]]),
          ),
        ) as NodeView;
      });
  }
  children(parentId: number): NativeEvent[] {
    this.#assertOpen();
    const cached = this.#childrenCache.get(parentId);
    if (cached) return cached;
    const parent = this.event(parentId);
    if (
      parent &&
      [...this.#prefetchedChildTypes].some(type => type === parent.type || alias(type, parent.type))
    ) {
      const empty: NativeEvent[] = [];
      this.#childrenCache.set(parentId, empty);
      return empty;
    }
    this.prefetchChildren([parentId]);
    return this.#childrenCache.get(parentId)!;
  }
  constantNodes(nodeIds: readonly number[]): NodeView[] {
    this.#assertOpen();
    const batch = decodeEventBatch(
      decodePackedEnvelope(this.#binding().constantsPackedBuffer([...nodeIds])),
    );
    for (const event of batch.events) this.cacheEvent(event);
    return batch.events.map(toNodeView);
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
      children.push(event);
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
    if (this.#nodeSummaryWords == null) {
      const data = this.#binding().nodeSummariesBuffer();
      this.#nodeSummaryWords = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
    }
    const offset = nodeId * 7;
    const words = this.#nodeSummaryWords;
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
  identifierEvents(): NativeEvent[] {
    this.#assertOpen();
    return (this.#identifiersCache ??= this.next(
      ['Identifier'],
      undefined,
      undefined,
      false,
    ).events);
  }
  identifierViews(): NodeView[] {
    return (this.#identifierViewsCache ??= this.identifierEvents().map(toNodeView));
  }
  identifierIndexes(): {
    bindings: Map<string, QueryResult['bindings'][number]>;
    globals: Map<string, NodeSummary[]>;
  } {
    if (this.#bindingIndexCache && this.#globalIndexCache)
      return { bindings: this.#bindingIndexCache, globals: this.#globalIndexCache };
    const bindings = new Map<string, QueryResult['bindings'][number]>();
    const globals = new Map<string, NodeSummary[]>();
    for (const node of this.identifierViews()) {
      const name = String(node.name);
      if (node.binding === true) {
        bindings.set(`${node.scopeId}:${name}`, {
          name,
          scopeId: node.scopeId,
          declaration: summary(node),
          references: [],
        });
      } else if (node.global === true) {
        let references = globals.get(name);
        if (!references) {
          references = [];
          globals.set(name, references);
        }
        references.push(summary(node));
      }
    }
    for (const node of this.identifierViews()) {
      if (node.binding === true || node.global === true || typeof node.bindingScopeId !== 'number')
        continue;
      bindings.get(`${node.bindingScopeId}:${String(node.name)}`)?.references.push(node);
    }
    this.#bindingIndexCache = bindings;
    this.#globalIndexCache = globals;
    return { bindings, globals };
  }
  bindingForScopes(
    name: string,
    scopeIds: readonly number[],
  ): QueryResult['bindings'][number] | undefined {
    const bindings = this.identifierIndexes().bindings;
    for (const scopeId of scopeIds) {
      const binding = bindings.get(`${scopeId}:${name}`);
      if (binding) return binding;
    }
    return undefined;
  }
  globalReferences(name: string): NodeSummary[] {
    return this.identifierIndexes().globals.get(name) ?? [];
  }
  scopeParentId(scopeId: number): number | null {
    this.#assertOpen();
    if (!this.#scopeParentsCache) {
      const data = this.#binding().scopeParentsBuffer();
      const words = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
      this.#scopeParentsCache = new Map(
        Array.from(words, (parent, id) => [id, parent === 0xffffffff ? null : parent]),
      );
    }
    return this.#scopeParentsCache.get(scopeId) ?? null;
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
    return native.commitPackedBuffer(this.source, this.#nativeFilename, packEdits(edits), mode);
  }
  close(): void {
    if (!this.#closed) this.#native?.close();
    this.#packedBatchCache.clear();
    this.#closed = true;
  }
  #assertOpen(): void {
    if (this.#closed) throw new Error('session-closed');
  }
  #binding(): NativeIndexedSessionBinding {
    this.#assertOpen();
    if (!this.#native) {
      this.#native = new native.NativeIndexedSession(this.source, this.#nativeFilename, [], []);
      if (
        this.options.maxNativeMemoryBytes != null &&
        this.#native.memoryUsage() > this.options.maxNativeMemoryBytes
      ) {
        this.#native.close();
        throw new Error('native-memory-budget-exceeded');
      }
    }
    return this.#native;
  }
}

type PreparedPluginPlan = PluginPlan & {
  subscriptions: readonly NativeVisitorRoute[];
};

interface PreparedPhase {
  activePlugins: NativePlugin<any, any>[];
  plans: Map<NativePlugin<any, any>, PreparedPluginPlan>;
  subscriptions: Set<string>;
  materializationSubscriptions: Set<string>;
  exitSubscriptions: Set<string>;
  fieldRequests: Record<string, string[]>;
  identifierNames: string[];
  staticMemberPatterns: string[];
  includeParent: boolean;
  includeScope: boolean;
  compiledRoutes?: readonly CompiledRouteTemplate[];
  manifest?: Buffer;
}

interface CompiledRouteTemplate extends NativeRouteManifestEntry {
  plugin: NativePlugin<any, any>;
  callbacks: readonly Handler<any>[];
  fast: boolean;
}
const preparedPhaseCaches = new WeakMap<PipelinePhase, Map<string, Omit<PreparedPhase, 'plans'>>>();
const compiledPhaseCaches = new WeakMap<
  PipelinePhase,
  Map<string, { routes: CompiledRouteTemplate[]; manifest: Buffer }>
>();

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

function collectSharedFilter(
  plugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  subscribes: (subscription: string) => boolean,
  select: (plan: PreparedPluginPlan) => readonly string[] | undefined,
): string[] {
  const values = new Set<string>();
  let subscriberCount = 0;
  for (const plugin of plugins) {
    const plan = plans.get(plugin)!;
    let subscribed = false;
    for (const subscription of plan.subscriptions) {
      if (subscribes(subscription)) {
        subscribed = true;
        break;
      }
    }
    if (!subscribed) continue;
    subscriberCount++;
    const selected = select(plan);
    if (selected == null) return [];
    for (const value of selected) values.add(value);
  }
  return subscriberCount === 0 ? [] : [...values];
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
    if (plugin.apiVersion !== 2) throw new Error(`${plugin.name}: unsupported API version`);
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
  const materializationSubscriptions = new Set<string>();
  const exitSubscriptions = new Set<string>();
  const fieldRequests: Record<string, string[]> = {};
  let includeParent = false;
  let includeScope = false;

  for (const plugin of activePlugins) {
    const plan = plans.get(plugin)!;
    for (const type of plan.subscriptions) {
      subscriptions.add(type);
      materializationSubscriptions.add(type);
    }
    for (const type of visitorExitSubscriptions(plugin.visitor)) exitSubscriptions.add(type);
    for (const query of plan.queries ?? []) {
      for (const type of querySubscriptions(query)) materializationSubscriptions.add(type);
    }
    if (plan.semantics?.[0] === 'scope') {
      includeScope = true;
      materializationSubscriptions.add('Identifier');
      materializationSubscriptions.add('Program');
      materializationSubscriptions.add('Function');
      materializationSubscriptions.add('ArrowFunctionExpression');
      materializationSubscriptions.add('Directive');
    }
    if (plan.children && Object.keys(plan.children).length > 0)
      materializationSubscriptions.add('*');
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

  const routed = compilePhaseRoutes(phase, activePlugins, plans, includeParent, includeScope);
  const prepared: PreparedPhase = {
    activePlugins,
    plans,
    subscriptions,
    materializationSubscriptions,
    exitSubscriptions,
    fieldRequests,
    includeParent,
    includeScope,
    compiledRoutes: routed?.routes,
    manifest: routed?.manifest,
    identifierNames: collectSharedFilter(
      activePlugins,
      plans,
      subscription => routeContains(subscription, 'Identifier', 'ReferencedIdentifier'),
      plan => plan.identifierNames,
    ),
    staticMemberPatterns: collectSharedFilter(
      activePlugins,
      plans,
      subscription => routeContains(subscription, 'StaticMemberExpression', 'MemberExpression'),
      plan => plan.staticMemberPatterns,
    ),
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
  ].join('\u001f');
}

function compilePhaseRoutes(
  phase: PipelinePhase,
  plugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  includeParent: boolean,
  includeScope: boolean,
): { routes: CompiledRouteTemplate[]; manifest: Buffer } | undefined {
  const cacheKey = stableJson({
    includeParent,
    includeScope,
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
  const phaseIsStatic = plugins.every(
    plugin => (plans.get(plugin)?.controlFlow?.length ?? 0) === 0,
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
        fast: phaseIsStatic && plugin.analyze == null,
      });
    }
  }
  const manifest = packRouteManifest(routes, includeParent, includeScope);
  const compiled = { routes, manifest };
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
  { manifest: Buffer; callbacks: readonly (readonly Handler<any>[])[] }
>();

function compileNestedVisitor(visitor: Visitor<any>): {
  manifest: Buffer;
  callbacks: readonly (readonly Handler<any>[])[];
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
    payloadFields: PREDICATE_FIELDS[variant.nodeType] ?? [],
  }));
  const compiled = {
    manifest: packRouteManifest(routes, true, true),
    callbacks: variants.map(variant => variant.callbacks),
  };
  nestedRouteCaches.set(visitor, compiled);
  return compiled;
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
  if (pipeline.apiVersion !== 2)
    throw new Error(`Unsupported pipeline API version: ${pipeline.apiVersion}`);
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
  let phaseSource = source;
  let finalMap: NativeTransformResult['map'] | null = options.inputSourceMap ?? null;
  const metadata: Record<string, unknown> = {};
  const diagnostics: Diagnostic[] = [];
  const allStates: { plugin: NativePlugin<any, any>; state: any }[] = [];
  const deferredMapLayers: {
    source: string;
    edits: EditCommand[];
    map?: NativeTransformResult['map'];
  }[] = [];
  let openSession: NativeTransformSession | null = null;
  let reusableSession: NativeTransformSession | null = null;
  let reusableRoutedBatch: { manifest: Buffer; batch: RoutedEventBatch } | null = null;
  try {
    for (const phase of pipeline.phases) {
      const edits: EditCommand[] = [];
      const prepared = preparePhase(phase, phaseSource, filename, options, parser);
      const {
        activePlugins,
        plans,
        subscriptions,
        materializationSubscriptions,
        exitSubscriptions,
        fieldRequests,
        identifierNames,
        staticMemberPatterns,
        includeParent,
        includeScope,
        compiledRoutes,
        manifest,
      } = prepared;
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({
          code: 'broad-visitor',
          message: 'Catch-all visitor disables the optimized subscription path.',
          phase: phase.name,
        });
      }
      const retainsAdditionalIndex = [...materializationSubscriptions].some(
        type => !subscriptions.has(type),
      );
      const requiresIndex = retainsAdditionalIndex || includeParent || includeScope;
      if (manifest == null || compiledRoutes == null || !supportsRoutedProtocol())
        throw new Error('compiled visitor dispatch is unavailable');
      const session: NativeTransformSession =
        reusableSession ??
        new NativeTransformSession(
          phaseSource,
          filename,
          options,
          !requiresIndex ? [] : [...materializationSubscriptions],
          requiresIndex,
          includeParent,
          includeScope,
          identifierNames,
          staticMemberPatterns,
          [...exitSubscriptions],
        );
      reusableSession = null;
      openSession = session;
      let batch: RoutedEventBatch;
      {
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
            const routedBuffer = native.materializeRoutedBuffer!(
              phaseSource,
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
      }
      const childParentTypes = activePlugins.flatMap(plugin =>
        Object.keys(plans.get(plugin)?.children ?? {}),
      );
      if (childParentTypes.length > 0) session.prefetchChildren([], childParentTypes);
      const dispatch = createDispatcher(
        session,
        phase,
        activePlugins,
        plans,
        batch,
        edits,
        metadata,
        diagnostics,
        retainsAdditionalIndex || includeParent || includeScope,
        compiledRoutes,
      );
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
              start: locationOffset(phaseSource, decision.location.start),
              end: locationOffset(phaseSource, decision.location.end),
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
      dispatch.run();
      for (const plugin of activePlugins)
        plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      if (edits.length === 0) {
        reusableSession = session;
        reusableRoutedBatch = { manifest, batch };
        continue;
      }
      const layerSource = phaseSource;
      const isFinalPhase = phase === pipeline.phases[pipeline.phases.length - 1];
      const committed = session.commit(edits, isFinalPhase ? options.sourceMapMode : 'none');
      phaseSource = committed.code;
      deferredMapLayers.push({
        source: layerSource,
        edits: [...edits],
        map: isFinalPhase ? committed.map : undefined,
      });
      session.close();
      reusableRoutedBatch = null;
      openSession = null;
      // Opening the next phase creates the explicit render/reparse boundary.
    }
    reusableSession?.close();
    openSession = null;
    for (const layer of deferredMapLayers) {
      const committed = layer.map
        ? { map: layer.map }
        : native.commitPackedBuffer(
            layer.source,
            parserFilename(filename, options.parser),
            packEdits(layer.edits),
            options.sourceMapMode,
          );
      if (finalMap == null) {
        finalMap = committed.map;
      } else {
        finalMap = {
          mappings: native.composeMappings(
            committed.map.mappings,
            finalMap.mappings,
            committed.map.names.length,
          ),
          names: [...committed.map.names, ...finalMap.names],
        };
      }
    }
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    return {
      status: 'complete',
      code: phaseSource,
      map: finalMap ?? { mappings: '', names: [] },
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
    throw new NativeTransformError(message, [
      ...diagnostics,
      { code: 'native-transform-error', message },
    ]);
  }
}

/** Execute a native pipeline, delegating unsupported syntax to the caller. */
export function transformOrFallback(
  source: string,
  filename: string,
  pipeline: NativePipeline,
  fallback: (source: string, filename: string, reason: string) => NativeTransformResult,
  options: TransformOptions = {},
): NativeTransformResult {
  const result = transform(source, filename, pipeline, options);
  return result.status === 'bailout' ? fallback(result.source, filename, result.reason) : result;
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
): Dispatcher {
  let order = 0;
  let stopAll = false;
  let currentSequence = -1;
  let visitorId = 0;
  let visitorIds: WeakMap<object, number> | undefined;
  let activeTraversals: Set<string> | undefined;
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
        assertDeclaredControl(plugin, plans.get(plugin), 'stop');
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
      revisitProgram: (visitor, state) => (
        assertDeclaredControl(plugin, plans.get(plugin), 'dynamic-subscriptions'),
        replayCustomRouted(
          session.nextRoutedPacked(compileNestedVisitor(visitor).manifest),
          visitor,
          state,
          context,
        )
      ),
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
            session.nextRoutedPacked(compiled.manifest, {
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
    routedCallbacks: Handler<any>[] = [],
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
    for (const callback of routedCallbacks) {
      callback(path, override ? overrideState : entry.state);
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
    const synthetic = { name: 'nested', apiVersion: 2 as const, visitor };
    const entry = {
      context,
      state,
      stopped: false,
      skipped: undefined,
    };
    forEachRoutedEvent(routedBatch, (routeIds, event) => {
      if (event.side === 'enter') {
        for (let index = 0; index < routeIds.length; index++)
          dispatchOne(
            event,
            synthetic,
            entry,
            context,
            visitor,
            state,
            compiled.callbacks[routeIds[index]] as Handler<any>[],
          );
      } else {
        for (let index = routeIds.length - 1; index >= 0; index--)
          dispatchOne(
            event,
            synthetic,
            entry,
            context,
            visitor,
            state,
            compiled.callbacks[routeIds[index]] as Handler<any>[],
          );
      }
    });
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
    forEachRoutedEvent(routed, (routeIds, event) => {
      if (!filter(event)) return;
      if (event.side === 'enter') {
        for (let index = 0; index < routeIds.length; index++) {
          const route = followup!.routes[routeIds[index]];
          dispatchOne(
            event,
            plugin,
            entry,
            context,
            undefined,
            undefined,
            route.callbacks as Handler<any>[],
          );
        }
      } else {
        for (let index = routeIds.length - 1; index >= 0; index--) {
          const route = followup!.routes[routeIds[index]];
          dispatchOne(
            event,
            plugin,
            entry,
            context,
            undefined,
            undefined,
            route.callbacks as Handler<any>[],
          );
        }
      }
    });
  };
  const routedThunks = compiledRoutes.map(route => {
    const entry = contexts.get(route.plugin)!;
    if (!route.fast)
      return (event: NativeEvent) =>
        dispatchOne(
          event,
          route.plugin,
          entry,
          entry.context,
          undefined,
          undefined,
          route.callbacks as Handler<any>[],
        );
    return (event: NativeEvent) => {
      const runtime = (entry.pathRuntime ??= createPathRuntime(route.plugin, entry, entry.context));
      const path = makePath(runtime, event);
      currentSequence = event.sequence;
      for (const callback of route.callbacks) {
        callback(path, entry.state);
      }
    };
  });
  return {
    contexts,
    run() {
      forEachRoutedEvent(batch, (routeIds, event) => {
        if (cacheEvents) session.cacheEvent(event);
        if (event.side === 'enter') {
          for (let index = 0; index < routeIds.length; index++) {
            const routeId = routeIds[index];
            routedThunks![routeId](event);
          }
        } else {
          for (let index = routeIds.length - 1; index >= 0; index--) {
            routedThunks![routeIds[index]](event);
          }
        }
      });
    },
  };
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
};
function makePath(runtime: PathRuntime, event: NativeEvent): NativeNodePath {
  return new NodePathImpl(runtime, event);
}

class NodePathImpl implements NativeNodePath {
  #node?: NodeView;
  #parent?: NodeSummary | null;
  #scope?: NativeScope;
  constructor(
    readonly runtime: PathRuntime,
    readonly event: NativeEvent,
  ) {}
  get node(): NodeView {
    if (!this.#node) {
      this.#node = this.runtime.session.nodeView(this.event);
    }
    return this.#node;
  }
  get context(): PluginContext {
    return this.runtime.context;
  }
  get parent(): NodeSummary | null {
    this.#assertAncestry();
    return (this.#parent ??=
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
    return (this.#scope ??= makeScope(
      this.runtime,
      this.event.scopeId,
      this.event.scopeParentId ?? null,
    ));
  }
  getSource(): string {
    return this.runtime.session.source.slice(this.event.start, this.event.end);
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
  replaceWith(code: string | CodeFragment): void {
    this.#edit('Replace', code);
  }
  replaceWithMultiple(code: readonly (string | CodeFragment)[]): void {
    this.#edit('Replace', joinFragments(code));
  }
  update(code: string | CodeFragment): void {
    this.#edit('Replace', code);
  }
  overwrite(code: string | CodeFragment): void {
    this.#edit('Replace', code);
  }
  remove(): void {
    this.#edit('Remove');
  }
  insertBefore(content: string): void {
    this.runtime.edits.push({
      kind: 'PrependRight',
      start: this.event.start,
      end: this.event.start,
      content,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  insertAfter(content: string): void {
    this.runtime.edits.push({
      kind: 'AppendLeft',
      start: this.event.end,
      end: this.event.end,
      content,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  unshiftContainer(
    key: 'body',
    code: string | CodeFragment | readonly (string | CodeFragment)[],
  ): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.prependToBody(fragmentText(code));
  }
  pushContainer(
    key: 'body',
    code: string | CodeFragment | readonly (string | CodeFragment)[],
  ): void {
    if (key !== 'body') throw new Error(`Unsupported container: ${key}`);
    this.appendToBody(fragmentText(code));
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
  prependToBody(content: string): void {
    const offset = Number(this.node.bodyStart ?? this.event.start);
    this.runtime.edits.push({
      kind: 'AppendRight',
      start: offset,
      end: offset,
      content,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
  }
  appendToBody(content: string): void {
    const offset = Number(this.node.bodyEnd ?? this.event.end);
    this.runtime.edits.push({
      kind: 'PrependLeft',
      start: offset,
      end: offset,
      content,
      owner: this.runtime.owner,
      order: this.runtime.nextOrder(),
    });
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
const visitorExitSubscriptionsCache = new WeakMap<object, NativeVisitorRoute[]>();
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
function eventField(event: NativeEvent, key: string): unknown {
  const direct = (event as NativeEvent & Record<string, unknown>)[key];
  return direct ?? event.fields.find(field => field.key === key)?.value;
}
function toNodeView(event: NativeEvent): NodeView {
  if (event.fields.length === 0) return event as unknown as NodeView;
  const node = event as NativeEvent & Record<string, unknown>;
  for (const field of event.fields) {
    node[field.key] =
      typeof field.value === 'string' && (field.key !== 'value' || event.type !== 'StringLiteral')
        ? parseScalar(field.value)
        : field.value;
  }
  return node as NodeView;
}
function summary(node: NodeView): NodeSummary {
  return {
    id: node.id,
    type: node.type,
    start: node.start,
    end: node.end,
    parentId: node.parentId,
    parentType: node.parentType,
  };
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
function visitorExitSubscriptions(visitor?: Visitor<any>): NativeVisitorRoute[] {
  if (!visitor) return [];
  const cached = visitorExitSubscriptionsCache.get(visitor);
  if (cached) return cached;
  const keys: string[] = [];
  for (const [key, handler] of Object.entries(visitor)) {
    if (typeof handler === 'object' && handler?.exit != null) keys.push(key);
  }
  const subscriptions = expandSubscriptions(keys) as NativeVisitorRoute[];
  visitorExitSubscriptionsCache.set(visitor, subscriptions);
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
  if (request.globals?.length || request.bindings?.length) types.push('Identifier');
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
  if (request.constants?.length) types.push('Expression');
  if (request.calls?.length) types.push('CallExpression');
  if (request.captures?.length) types.push('Function', 'Identifier');
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
function makeScope(runtime: PathRuntime, id: number, parentId: number | null): NativeScope {
  const cached = runtime.scopeCache.get(id);
  if (cached) return cached;
  const session = runtime.session;
  const scopeChain = () => {
    const ids = [];
    let scope: number | null = id;
    while (scope != null) {
      ids.push(scope);
      scope = session.scopeParentId(scope);
    }
    return ids;
  };
  const resolve = (name: string): QueryResult['bindings'][number] | undefined => {
    return session.bindingForScopes(name, scopeChain());
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
    hasBinding: name => resolve(name) != null,
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
        .next(['Directive'], { start: owner.node.start, end: owner.node.end }, undefined, false)
        .events.filter(event => event.scopeId === id);
      const offset = directives.reduce(
        (end, directive) => Math.max(end, directive.end),
        Number(owner.node.bodyStart ?? owner.node.start),
      );
      runtime.context.editor.appendLeft(
        offset,
        `${directives.length === 0 ? '' : '\n'}${fragmentText(content)}\n`,
      );
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
  const events = runtime.session.next(
    ['Program', 'Function', 'ArrowFunctionExpression'],
    undefined,
    undefined,
    false,
  ).events;
  const owner = events.find(
    event =>
      event.scopeId === scopeId &&
      (event.type === 'Program' ||
        event.type === 'Function' ||
        event.type === 'ArrowFunctionExpression'),
  );
  return owner ? makePath(runtime, owner) : null;
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
function fragmentText(value: string | CodeFragment | readonly (string | CodeFragment)[]): string {
  return isFragmentList(value)
    ? joinFragments(value).code
    : typeof value === 'string'
      ? value
      : value.code;
}
function isFragmentList(
  value: string | CodeFragment | readonly (string | CodeFragment)[],
): value is readonly (string | CodeFragment)[] {
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
const EDITOR_CAPABILITIES = new Set([
  'append',
  'prepend',
  'update',
  'overwrite',
  'remove',
  'move',
  'reset',
  'indent',
  'trim',
  'addSourceMapLocation',
  'replace',
  'replaceAll',
]);
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
    return {
      code: parts.reduce(
        (code, part, index) =>
          code +
          part +
          (index < values.length
            ? typeof values[index] === 'string'
              ? values[index]
              : values[index].code
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
    supports: capability => EDITOR_CAPABILITIES.has(capability),
    append: content => push('AppendLeft', source.length, source.length, content),
    prepend: content => push('PrependRight', 0, 0, content),
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
      push('Remove', start, end);
      push('PrependRight', destination, destination, source.slice(start, end));
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
