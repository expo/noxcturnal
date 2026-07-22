import { createHash } from 'node:crypto';

import { native, type NativeIndexedSessionBinding } from './native.js';
import { NODE_TYPE_IDS, NODE_TYPES } from './generated-event-schema.js';
import {
  decodeEventBatch,
  decodePackedEnvelope,
  forEachDispatchEvent,
  packEdits,
  packFieldRequests,
  parseScalar,
  type PackedEventBatch,
} from './protocol.js';
import type {
  Diagnostic, EditCommand, EventBatch, InspectRequest, NativeBailoutResult, NativeEvent,
  NativeTransformResult, NodeSummary, NodeView, PluginPlan, QueryRequest, QueryResult,
  SourceLocation, TransformOptions, TransformResult, ParseClassification,
  NodeOfType,
  ParserAdapter,
  NativeFieldKey,
  NativeNodeType,
  NativeVisitorRoute,
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
  replace(search: string | RegExp, replacement: string | ((match: string, ...groups: string[]) => string)): void;
  replaceAll(search: string | RegExp, replacement: string | ((match: string, ...groups: string[]) => string)): void;
  slice(start?: number, end?: number): string;
  toString(): string;
  isEmpty(): boolean;
}
export type EditorCapability = 'append' | 'prepend' | 'update' | 'overwrite' | 'remove' | 'move' | 'reset' | 'indent' | 'trim' | 'addSourceMapLocation' | 'replace' | 'replaceAll';

export interface CodeFragment { code: string; mapping: 'sourceless' | 'anchor-start' | 'anchor-boundaries' | 'identity'; names?: readonly string[] }
export interface CodeFactory {
  identifier(name: string): CodeFragment;
  stringLiteral(value: string): CodeFragment;
  literal(value: string | number | boolean | bigint | null): CodeFragment;
  template(parts: TemplateStringsArray, ...values: readonly (CodeFragment | string)[]): CodeFragment;
  parseExpression(code: string, parserMode?: TransformOptions['parser']): CodeFragment;
  parseStatements(code: string, parserMode?: TransformOptions['parser']): CodeFragment;
}
export interface MetadataWriter { set(key: string, value: unknown): void; get(key: string): unknown }
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
  unshiftContainer(key: 'body', code: CodeFragment | string | readonly (CodeFragment | string)[]): void;
  pushContainer(key: 'body', code: CodeFragment | string | readonly (CodeFragment | string)[]): void;
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

type NodeForRoute<Route extends NativeVisitorRoute> =
  Route extends 'ReferencedIdentifier' ? NodeOfType<'Identifier'> :
  Route extends 'FunctionDeclaration' | 'FunctionExpression' | 'TSDeclareFunction' ? NodeOfType<'Function'> :
  Route extends 'ClassDeclaration' | 'ClassExpression' ? NodeOfType<'Class'> :
  Route extends NativeNodeType ? NodeOfType<Route> : NodeView;
type Handler<State, Node extends NodeView = NodeView> = (path: NativeNodePath<Node>, state: State) => void;
export type VisitorHandler<State, Node extends NodeView = NodeView> = Handler<State, Node> | { enter?: Handler<State, Node>; exit?: Handler<State, Node> };
export type Visitor<State> = { [Route in NativeVisitorRoute]?: VisitorHandler<State, NodeForRoute<Route>> } & {
  [compositeRoute: `${NativeVisitorRoute}|${string}`]: VisitorHandler<State> | undefined;
};
export interface NativePlugin<State = unknown, Options = unknown, Analysis = unknown> {
  name: string;
  version?: string;
  apiVersion: 1;
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
export type NativePluginDefinition<State = unknown, Options = unknown, Analysis = unknown> = Omit<NativePlugin<State, Options, Analysis>, 'apiVersion'> & { apiVersion?: 1 };
export interface DefinedNativePlugin<State = unknown, Options = unknown, Analysis = unknown> extends NativePlugin<State, Options, Analysis> {
  withOptions(options: Options): DefinedNativePlugin<State, Options, Analysis>;
}
export interface PipelinePhase { name: string; plugins: readonly NativePlugin<any, any>[]; reparseAfterEdits?: boolean }
export interface NativePipeline { apiVersion: 1; phases: readonly PipelinePhase[] }
export type NativePipelineDefinition = Omit<NativePipeline, 'apiVersion'> & { apiVersion?: 1 };
export interface NativePluginPipelineDefinition { apiVersion?: 1; plugins: readonly NativePlugin<any, any>[]; phaseName?: string }

class Bailout extends Error {}
export class NativeTransformError extends Error {
  constructor(message: string, readonly diagnostics: Diagnostic[]) { super(message); this.name = 'NativeTransformError'; }
}
export function defineNativePlugin<State = undefined, Options = undefined, Analysis = unknown>(plugin: NativePluginDefinition<State, Options, Analysis>): DefinedNativePlugin<State, Options, Analysis> {
  const definition = { ...plugin, apiVersion: 1 as const, visitor: plugin.visitor == null ? undefined : Object.freeze({ ...plugin.visitor }) } as DefinedNativePlugin<State, Options, Analysis>;
  Object.defineProperty(definition, 'withOptions', { enumerable: false, value: (options: Options) => defineNativePlugin({ ...plugin, options }) });
  return Object.freeze(definition);
}
export function defineNativePipeline(pipeline: NativePipelineDefinition | NativePluginPipelineDefinition | readonly NativePlugin<any, any>[]): NativePipeline {
  const normalized: NativePipelineDefinition = isPluginList(pipeline)
    ? { phases: [{ name: 'transform', plugins: pipeline }] }
    : 'plugins' in pipeline
      ? { phases: [{ name: pipeline.phaseName ?? 'transform', plugins: pipeline.plugins }] }
      : pipeline;
  return Object.freeze({ apiVersion: 1, phases: Object.freeze(normalized.phases.map(phase => Object.freeze({ ...phase, plugins: Object.freeze([...phase.plugins]) }))) });
}
function isPluginList(value: NativePipelineDefinition | NativePluginPipelineDefinition | readonly NativePlugin<any, any>[]): value is readonly NativePlugin<any, any>[] { return Array.isArray(value); }
const parserAdapters = new Map<string, ParserAdapter>();
export function registerParserAdapter(adapter: ParserAdapter): () => void {
  if (parserAdapters.has(adapter.name)) throw new Error(`Parser adapter already registered: ${adapter.name}`);
  parserAdapters.set(adapter.name, adapter);
  return () => { if (parserAdapters.get(adapter.name) === adapter) parserAdapters.delete(adapter.name); };
}

export function pipelineCacheKey(pipeline: NativePipeline, filename: string, options: TransformOptions = {}): string {
  const descriptor = {
    apiVersion: pipeline.apiVersion,
    nativeVersion: native.nativeVersion(),
    oxcVersion: native.oxcVersion(),
    filename,
    options,
    phases: pipeline.phases.map(phase => ({
      name: phase.name,
      reparseAfterEdits: !!phase.reparseAfterEdits,
      plugins: phase.plugins.map(plugin => ({ name: plugin.name, version: plugin.version ?? '0', apiVersion: plugin.apiVersion, options: plugin.options ?? null })),
    })),
  };
  return createHash('sha256').update(stableJson(descriptor)).digest('hex');
}

export class NativeTransformSession {
  #closed = false;
  #batches = 0;
  #uids = new Set<string>();
  #uidsInitialized = false;
  #eventCache: (NativeEvent | undefined)[] = [];
  #nodeViewCache: (NodeView | undefined)[] = [];
  #queryCache = new Map<string, QueryResult>();
  #identifiersCache: NativeEvent[] | null = null;
  #identifierViewsCache: NodeView[] | null = null;
  #bindingIndexCache: Map<string, QueryResult['bindings'][number]> | null = null;
  #globalIndexCache: Map<string, NodeSummary[]> | null = null;
  #scopeParentsCache: Map<number, number | null> | null = null;
  #childrenCache = new Map<number, NativeEvent[]>();
  #prefetchedChildTypes = new Set<string>();
  readonly openMs: number;
  #native: NativeIndexedSessionBinding | null = null;
  #useStatelessInitialBatch: boolean;
  #nativeFilename: string;
  #includeParent: boolean;
  #includeScope: boolean;
  #identifierNames: readonly string[];
  #staticMemberPatterns: readonly string[];
  constructor(readonly source: string, readonly filename: string, readonly options: TransformOptions = {}, initialSubscriptions: readonly string[] = [], retainInitialIndex = false, includeParent = true, includeScope = true, identifierNames: readonly string[] = [], staticMemberPatterns: readonly string[] = []) {
    const started = performance.now();
    this.#nativeFilename = parserFilename(filename, options.parser);
    this.#includeParent = includeParent;
    this.#includeScope = includeScope;
    this.#identifierNames = identifierNames;
    this.#staticMemberPatterns = staticMemberPatterns;
    this.#useStatelessInitialBatch = initialSubscriptions.length > 0 && !retainInitialIndex;
    if (!this.#useStatelessInitialBatch) this.#native = new native.NativeIndexedSession(source, this.#nativeFilename, [...initialSubscriptions]);
    this.openMs = performance.now() - started;
    if (this.#native && options.maxNativeMemoryBytes != null && this.#native.memoryUsage() > options.maxNativeMemoryBytes) {
      this.#native.close();
      throw new Error('native-memory-budget-exceeded');
    }
  }
  get nativeMemoryBytes(): number { return this.#binding().memoryUsage(); }
  static open(source: string, filename: string, options: TransformOptions = {}): NativeTransformSession { return new NativeTransformSession(source, filename, options); }
  next(subscriptions: readonly string[], root?: { start: number; end: number }, fields?: Readonly<Record<string, readonly string[]>>, includeExit = true): EventBatch {
    const batch = decodeEventBatch(this.nextPacked(subscriptions, root, fields, includeExit));
    for (const event of batch.events) if (event.side === 'enter') this.#eventCache[event.id] = event;
    return batch;
  }
  nextPacked(subscriptions: readonly string[], root?: { start: number; end: number }, fields?: Readonly<Record<string, readonly string[]>>, includeExit = true): PackedEventBatch {
    this.#assertOpen();
    if (++this.#batches > (this.options.maxFollowUpBatches ?? 64)) throw new Error('follow-up-batch-budget-exceeded');
    const started = performance.now();
    const fieldRequests = fields && Object.entries(fields).map(([nodeType, requested]) => ({ nodeType, fields: [...requested] }));
    const packed = this.#useStatelessInitialBatch
      ? (() => { const { ids, fallback } = encodeSubscriptions(subscriptions); return decodePackedEnvelope(native.materializePackedBuffer(this.source, this.#nativeFilename, fallback, ids, root?.start, root?.end, packFieldRequests(fields), includeExit, this.#includeParent, this.#includeScope, [...this.#identifierNames], [...this.#staticMemberPatterns])); })()
      : this.#binding().nextPacked([...subscriptions], root?.start, root?.end, fieldRequests, includeExit);
    packed.includeExit = includeExit;
    this.#useStatelessInitialBatch = false;
    const elapsed = performance.now() - started;
    const nativeWork = packed.timings.parseMs + packed.timings.semanticMs + packed.timings.traversalMs + packed.timings.renderAndMapMs;
    packed.timings.napiTransferMs = (packed.timings.napiTransferMs ?? 0) + Math.max(0, elapsed - nativeWork);
    return packed;
  }
  cacheEvent(event: NativeEvent): void { if (event.side === 'enter') this.#eventCache[event.id] = event; }
  nodeView(event: NativeEvent): NodeView {
    return this.#nodeViewCache[event.id] ??= toNodeView(event);
  }
  query(request: QueryRequest): QueryResult {
    this.#assertOpen();
    const cacheKey = stableJson(request);
    const cached = this.#queryCache.get(cacheKey);
    if (cached) return cached;
    const directGlobals = request.globals?.length && request.bindings == null && request.captures == null;
    const types = querySubscriptions({ ...request, constants: undefined }).filter(type => !(directGlobals && type === 'Identifier'));
    const needsIdentifiers = types.some(type => type === 'Identifier');
    const remainingTypes = needsIdentifiers ? types.filter(type => type !== 'Identifier') : types;
    const nodes = remainingTypes.length ? this.next(remainingTypes, undefined, undefined, false).events.map(toNodeView) : [];
    if (needsIdentifiers) nodes.push(...this.identifierViews());
    const globals: QueryResult['globals'] = {};
    if (request.globals?.length) {
      if (directGlobals) {
        for (const fact of this.#binding().queryGlobals(request.globals.map(query => query.name))) {
          globals[fact.name] = { references: fact.references.map(reference => ({ id: reference.id, type: 'Identifier', start: reference.start, end: reference.end })) };
        }
      } else {
        const index = this.identifierIndexes().globals;
        for (const query of request.globals) globals[query.name] = { references: index.get(query.name) ?? [] };
      }
    }
    const constants: QueryResult['constants'] = {};
    const constantNodes = request.constants?.length ? this.constantNodes(request.constants) : [];
    for (const id of request.constants ?? []) {
      const node = constantNodes.find(candidate => candidate.id === id);
      constants[id] = node?.constantKind === 'string' ? String(node.constantValue)
        : node?.constantKind === 'number' ? Number(node.constantValue)
          : node?.constantKind === 'boolean' ? node.constantValue === true || node.constantValue === 'true'
            : null;
    }
    const result = {
      globals,
      imports: request.imports ? nodes.filter(node => node.type === 'ImportDeclaration') : [],
      exports: request.exports ? nodes.filter(node => node.type.startsWith('Export')) : [],
      constants,
      calls: Object.fromEntries((request.calls ?? []).map(call => [call.callee, nodes.filter(node => node.type === 'CallExpression' && node.calleeName === call.callee && (!call.globalOnly || node.calleeGlobal === true) && (!call.staticArguments || typeof node.staticArgument === 'string'))])),
      captures: Object.fromEntries((request.captures ?? []).map(capture => {
        const fn = nodes.find(node => node.id === capture.functionId);
        const scopeContains = (ancestor: number, child: number) => { let scope: number | null = child; while (scope != null) { if (scope === ancestor) return true; scope = this.scopeParentId(scope); } return false; };
        const references = fn ? nodes.filter(node => node.type === 'Identifier' && node.start >= fn.start && node.end <= fn.end && node.binding !== true && node.global !== true && typeof node.bindingScopeId === 'number' && scopeContains(fn.scopeId, node.scopeId) && node.bindingScopeId !== fn.scopeId && !scopeContains(fn.scopeId, node.bindingScopeId)) : [];
        return [capture.functionId, references];
      })),
      bindings: (request.bindings ?? []).flatMap(binding => {
        const index = this.identifierIndexes().bindings;
        const candidates = binding.name != null && binding.scopeId != null
          ? [index.get(`${binding.scopeId}:${binding.name}`)].filter((candidate): candidate is QueryResult['bindings'][number] => candidate != null)
          : [...index.values()].filter(candidate => (binding.name == null || candidate.name === binding.name) && (binding.scopeId == null || candidate.scopeId === binding.scopeId));
        if (!binding.reads && !binding.writes) return candidates;
        return candidates.map(candidate => ({ ...candidate, references: candidate.references.filter(reference => (!binding.reads || reference.read === true) && (!binding.writes || reference.write === true)) }));
      }),
    };
    this.#queryCache.set(cacheKey, result);
    return result;
  }
  inspect(requests: readonly InspectRequest[]): NodeView[] {
    return this.#binding().inspect(requests.map(request => request.nodeId)).map(toNodeView).map(node => {
      const request = requests.find(item => item.nodeId === node.id)!;
      return Object.freeze(Object.fromEntries(['id', 'type', 'start', 'end', 'scopeId', ...request.fields].filter(key => key in node).map(key => [key, node[key]]))) as NodeView;
    });
  }
  children(parentId: number): NativeEvent[] {
    this.#assertOpen();
    const cached = this.#childrenCache.get(parentId);
    if (cached) return cached;
    const parent = this.event(parentId);
    if (parent && [...this.#prefetchedChildTypes].some(type => type === parent.type || alias(type, parent.type))) {
      const empty: NativeEvent[] = [];
      this.#childrenCache.set(parentId, empty);
      return empty;
    }
    this.prefetchChildren([parentId]);
    return this.#childrenCache.get(parentId)!;
  }
  constantNodes(nodeIds: readonly number[]): NodeView[] {
    this.#assertOpen();
    const batch = decodeEventBatch(decodePackedEnvelope(this.#binding().constantsPackedBuffer([...nodeIds])));
    for (const event of batch.events) this.cacheEvent(event);
    return batch.events.map(toNodeView);
  }
  prefetchChildren(parentIds: readonly number[] = [], parentTypes: readonly string[] = []): number {
    this.#assertOpen();
    const missing = parentIds.filter(parentId => !this.#childrenCache.has(parentId));
    const missingTypes = parentTypes.filter(type => !this.#prefetchedChildTypes.has(type));
    if (missing.length === 0 && missingTypes.length === 0) return 0;
    if (++this.#batches > (this.options.maxFollowUpBatches ?? 64)) throw new Error('follow-up-batch-budget-exceeded');
    const started = performance.now();
    const typeIds: number[] = [];
    const fallbackTypes: string[] = [];
    for (const type of missingTypes) { const id = NODE_TYPE_IDS.get(type); if (id == null) fallbackTypes.push(type); else typeIds.push(id); }
    const batch = decodeEventBatch(decodePackedEnvelope(this.#binding().childrenPackedBuffer(missing, fallbackTypes, typeIds)));
    for (const parentId of missing) this.#childrenCache.set(parentId, []);
    for (const event of batch.events) {
      this.#eventCache[event.id] = event;
      let children = this.#childrenCache.get(event.parentId!);
      if (!children) { children = []; this.#childrenCache.set(event.parentId!, children); }
      children.push(event);
    }
    for (const type of missingTypes) this.#prefetchedChildTypes.add(type);
    if (this.options.maxNativeMemoryBytes != null && this.#binding().memoryUsage() > this.options.maxNativeMemoryBytes) throw new Error('native-memory-budget-exceeded');
    return performance.now() - started;
  }
  event(nodeId: number): NativeEvent | undefined { this.#assertOpen(); const cached = this.#eventCache[nodeId]; if (cached) return cached; const event = this.#binding().inspect([nodeId])[0]; if (event) this.#eventCache[nodeId] = event; return event; }
  identifierEvents(): NativeEvent[] { this.#assertOpen(); return this.#identifiersCache ??= this.next(['Identifier'], undefined, undefined, false).events; }
  identifierViews(): NodeView[] { return this.#identifierViewsCache ??= this.identifierEvents().map(toNodeView); }
  identifierIndexes(): { bindings: Map<string, QueryResult['bindings'][number]>; globals: Map<string, NodeSummary[]> } {
    if (this.#bindingIndexCache && this.#globalIndexCache) return { bindings: this.#bindingIndexCache, globals: this.#globalIndexCache };
    const bindings = new Map<string, QueryResult['bindings'][number]>();
    const globals = new Map<string, NodeSummary[]>();
    for (const node of this.identifierViews()) {
      const name = String(node.name);
      if (node.binding === true) {
        bindings.set(`${node.scopeId}:${name}`, { name, scopeId: node.scopeId, declaration: summary(node), references: [] });
      } else if (node.global === true) {
        let references = globals.get(name);
        if (!references) { references = []; globals.set(name, references); }
        references.push(summary(node));
      }
    }
    for (const node of this.identifierViews()) {
      if (node.binding === true || node.global === true || typeof node.bindingScopeId !== 'number') continue;
      bindings.get(`${node.bindingScopeId}:${String(node.name)}`)?.references.push(node);
    }
    this.#bindingIndexCache = bindings;
    this.#globalIndexCache = globals;
    return { bindings, globals };
  }
  bindingForScopes(name: string, scopeIds: readonly number[]): QueryResult['bindings'][number] | undefined {
    const bindings = this.identifierIndexes().bindings;
    for (const scopeId of scopeIds) {
      const binding = bindings.get(`${scopeId}:${name}`);
      if (binding) return binding;
    }
    return undefined;
  }
  globalReferences(name: string): NodeSummary[] { return this.identifierIndexes().globals.get(name) ?? []; }
  scopeParentId(scopeId: number): number | null {
    this.#assertOpen();
    if (!this.#scopeParentsCache) {
      const data = this.#binding().scopeParentsBuffer();
      const words = new Uint32Array(data.buffer, data.byteOffset, data.byteLength >>> 2);
      this.#scopeParentsCache = new Map(Array.from(words, (parent, id) => [id, parent === 0xffffffff ? null : parent]));
    }
    return this.#scopeParentsCache.get(scopeId) ?? null;
  }
  generateUid(name = 'temp'): string {
    if (!this.#uidsInitialized) {
      for (const event of this.#binding().next(['Identifier']).events) {
        const nameField = event.fields.find(field => field.key === 'name');
        if (nameField) this.#uids.add(String(nameField.value));
      }
      this.#uidsInitialized = true;
    }
    const base = `_${name.replace(/[^A-Za-z0-9_$]/g, '') || 'temp'}`;
    let uid = base; let index = 2;
    while (this.#uids.has(uid)) uid = `${base}${index++}`;
    this.#uids.add(uid); return uid;
  }
  commit(edits: EditCommand[], mode?: string) {
    this.#assertOpen();
    return native.commitPackedBuffer(this.source, this.#nativeFilename, packEdits(edits), mode);
  }
  close(): void { if (!this.#closed) this.#native?.close(); this.#closed = true; }
  #assertOpen(): void { if (this.#closed) throw new Error('session-closed'); }
  #binding(): NativeIndexedSessionBinding {
    this.#assertOpen();
    if (!this.#native) {
      this.#native = new native.NativeIndexedSession(this.source, this.#nativeFilename, []);
      if (this.options.maxNativeMemoryBytes != null && this.#native.memoryUsage() > this.options.maxNativeMemoryBytes) { this.#native.close(); throw new Error('native-memory-budget-exceeded'); }
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
  fieldRequests: Record<string, string[]>;
  identifierNames: string[];
  staticMemberPatterns: string[];
  includeParent: boolean;
  includeScope: boolean;
}

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

function mergeFieldRequests(target: Record<string, string[]>, source: Readonly<Record<string, readonly string[]>>): void {
  for (const [type, fields] of Object.entries(source)) {
    const merged = new Set(target[type]);
    for (const field of fields) merged.add(field);
    target[type] = [...merged];
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
    if (plugin.apiVersion !== 1) throw new Error(`${plugin.name}: unsupported API version`);
    const prepareSubscriptions = new Set<NativeVisitorRoute>();
    const plan = plugin.prepare?.({
      filename,
      options,
      parser,
      sourceHints: hints,
      subscribe: (...types) => {
        for (const type of types) prepareSubscriptions.add(type);
      },
    }, plugin.options as any) ?? {};
    plans.set(plugin, {
      ...plan,
      subscriptions: [
        ...(plan.subscriptions ?? []),
        ...prepareSubscriptions,
        ...visitorSubscriptions(plugin.visitor),
      ],
    });
  }

  const activePlugins = phase.plugins.filter(plugin => phaseIsEnabled(plans.get(plugin)!, phase.name));
  const subscriptions = new Set<string>();
  const materializationSubscriptions = new Set<string>();
  const fieldRequests: Record<string, string[]> = {};
  let includeParent = false;
  let includeScope = false;

  for (const plugin of activePlugins) {
    const plan = plans.get(plugin)!;
    for (const type of plan.subscriptions) {
      subscriptions.add(type);
      materializationSubscriptions.add(type);
    }
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
    if (plan.children && Object.keys(plan.children).length > 0) materializationSubscriptions.add('*');
    includeParent ||= plan.ancestry != null;
    mergeFieldRequests(fieldRequests, plan.fields ?? {});
    mergeFieldRequests(fieldRequests, visitorRoutingFields(plugin.visitor));
  }

  return {
    activePlugins,
    plans,
    subscriptions,
    materializationSubscriptions,
    fieldRequests,
    includeParent,
    includeScope,
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
}

export function transform(source: string, filename: string, pipeline: NativePipeline, options: TransformOptions = {}): TransformResult {
  if (pipeline.apiVersion !== 1) throw new Error(`Unsupported pipeline API version: ${pipeline.apiVersion}`);
  const parser = classifyForTransform(parserFilename(filename, options.parser), source);
  if (!parser.supported) {
    const adapter = options.parserAdapter ? parserAdapters.get(options.parserAdapter) : [...parserAdapters.values()].find(candidate => candidate.supports(parser));
    if (adapter) return adapter.transform(source, filename, pipeline, options);
    const prepared: { plugin: NativePlugin<any, any>; state: any }[] = [];
    try {
      for (const phase of pipeline.phases) for (const plugin of phase.plugins) {
        const state = plugin.createState?.(); prepared.push({ plugin, state });
        plugin.prepare?.({ filename, options, parser, sourceHints: sourceHints(source), subscribe() {} }, plugin.options as any);
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
  const transformStarted = performance.now();
  const totals = { parseMs: 0, semanticMs: 0, traversalMs: 0, renderAndMapMs: 0, sessionOpenMs: 0, napiTransferMs: 0, jsDispatchMs: 0, mapCompositionMs: 0, totalMs: 0 };
  const allStates: { plugin: NativePlugin<any, any>; state: any }[] = [];
  let openSession: NativeTransformSession | null = null;
  try {
    for (const phase of pipeline.phases) {
      const edits: EditCommand[] = [];
      const prepared = preparePhase(phase, phaseSource, filename, options, parser);
      const {
        activePlugins,
        plans,
        subscriptions,
        materializationSubscriptions,
        fieldRequests,
        identifierNames,
        staticMemberPatterns,
        includeParent,
        includeScope,
      } = prepared;
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({ code: 'broad-visitor', message: 'Catch-all visitor disables the optimized subscription path.', phase: phase.name });
      }
      const retainsAdditionalIndex = [...materializationSubscriptions].some(type => !subscriptions.has(type));
      const session = new NativeTransformSession(phaseSource, filename, options, [...materializationSubscriptions], retainsAdditionalIndex, includeParent, includeScope, identifierNames, staticMemberPatterns);
      totals.sessionOpenMs += session.openMs;
      openSession = session;
      const batch = session.nextPacked([...subscriptions], undefined, fieldRequests, activePlugins.some(plugin => visitorHasExit(plugin.visitor)));
      addTimings(totals, batch.timings);
      const childParentTypes = activePlugins.flatMap(plugin => Object.keys(plans.get(plugin)?.children ?? {}));
      if (childParentTypes.length > 0) totals.napiTransferMs += session.prefetchChildren([], childParentTypes);
      const activePhase = { ...phase, plugins: activePlugins };
      const dispatch = createDispatcher(session, activePhase, plans, batch, edits, metadata, diagnostics);
      for (const plugin of activePlugins) {
        const state = plugin.createState?.(); allStates.push({ plugin, state });
        dispatch.contexts.get(plugin)!.state = state;
        plugin.pre?.(dispatch.contexts.get(plugin)!.context, state);
      }
      const decisions = new Map<NativePlugin<any, any>, TransformDecision>();
      for (const plugin of activePlugins) {
        const entry = dispatch.contexts.get(plugin)!;
        const decision = plugin.analyze?.(entry.context, entry.state) ?? { status: 'supported', analysis: undefined };
        decisions.set(plugin, decision);
        if (decision.status === 'unsupported') {
          if (decision.location) diagnostics.push({ code: 'unsupported', message: decision.reason, plugin: plugin.name, phase: phase.name, start: locationOffset(phaseSource, decision.location.start), end: locationOffset(phaseSource, decision.location.end) });
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
      const dispatchStarted = performance.now();
      dispatch.run();
      totals.jsDispatchMs += performance.now() - dispatchStarted;
      for (const plugin of activePlugins) plugin.post?.(dispatch.contexts.get(plugin)!.context, dispatch.contexts.get(plugin)!.state);
      const committed = session.commit(edits, options.sourceMapMode);
      addTimings(totals, committed.timings);
      phaseSource = committed.code;
      if (finalMap == null) {
        finalMap = committed.map;
      } else {
        const compositionStarted = performance.now();
        finalMap = { mappings: native.composeMappings(committed.map.mappings, finalMap.mappings, committed.map.names.length), names: [...committed.map.names, ...finalMap.names] };
        totals.mapCompositionMs += performance.now() - compositionStarted;
      }
      session.close();
      openSession = null;
      // Opening the next phase creates the explicit render/reparse boundary.
    }
    for (const { plugin, state } of allStates) plugin.cleanup?.('complete', state);
    totals.totalMs = performance.now() - transformStarted;
    return { status: 'complete', code: phaseSource, map: finalMap ?? { mappings: '', names: [] }, metadata, diagnostics, timings: totals };
  } catch (error) {
    openSession?.close();
    const bailout = error instanceof Bailout;
    for (const { plugin, state } of allStates) plugin.cleanup?.(bailout ? 'bailout' : 'error', state);
    if (bailout) return { status: 'bailout', reason: error.message, source: originalSource, diagnostics } satisfies NativeBailoutResult;
    if (error instanceof NativeTransformError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new NativeTransformError(message, [...diagnostics, { code: 'native-transform-error', message }]);
  }
}

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

interface PhaseRoute {
  plugin: NativePlugin<any, any>;
  entry: DispatcherEntry;
  handlers: VisitorHandler<any>[];
}

interface Dispatcher {
  contexts: Map<NativePlugin<any, any>, DispatcherEntry>;
  run(): void;
}

function createDispatcher(
  session: NativeTransformSession,
  phase: PipelinePhase,
  plans: ReadonlyMap<NativePlugin<any, any>, PluginPlan>,
  batch: PackedEventBatch,
  edits: EditCommand[],
  metadata: Record<string, unknown>,
  diagnostics: Diagnostic[],
): Dispatcher {
  let order = 0;
  let stopAll = false;
  let currentSequence = -1;
  let visitorId = 0;
  const visitorIds = new WeakMap<object, number>();
  const activeTraversals = new Set<string>();
  const contexts = new Map<NativePlugin<any, any>, DispatcherEntry>();
  const phaseRoutes = new Map<string, PhaseRoute[]>();
  const routesByIdentifierName = phase.plugins.some(plugin => plans.get(plugin)?.identifierNames != null);
  const routesByStaticMemberPath = phase.plugins.some(plugin => plans.get(plugin)?.staticMemberPatterns != null);
  const metadataOwners = new Map<string, string>();
  for (const plugin of phase.plugins) for (const key of plans.get(plugin)?.metadataWrites ?? []) {
    const owner = metadataOwners.get(key);
    if (owner && owner !== plugin.name) throw new Error(`metadata key ${key} is owned by both ${owner} and ${plugin.name}`);
    metadataOwners.set(key, plugin.name);
  }
  for (const plugin of phase.plugins) {
    const allowedMetadata = new Set(plans.get(plugin)?.metadataWrites ?? []);
    const entry: DispatcherEntry = {
      state: undefined,
      stopped: false,
      skipped: [],
      context: undefined as unknown as PluginContext,
    };
    const context: PluginContext = {
      filename: session.filename, phase: phase.name, source: session.source,
      metadata: { set(key, value) { if (!allowedMetadata.has(key)) throw new Error(`${plugin.name}: undeclared metadata key ${key}`); metadata[key] = value; }, get: key => metadata[key] },
      query: request => session.query(request), inspect: requests => session.inspect(requests),
      diagnostic: diagnostic => diagnostics.push({ ...diagnostic, plugin: plugin.name, phase: phase.name }),
      unsupported: reason => { throw new Bailout(`${plugin.name}:${reason}`); },
      stopAll: () => { stopAll = true; },
      subscribeRemaining: (...types) => {
        entry.delivered ??= new Set();
        replay(session.next(expandSubscriptions(types), undefined, undefined, visitorHasExit(plugin.visitor)).events.filter(event => event.sequence > currentSequence), plugin, entry, context);
      },
      revisitProgram: (visitor, state) => replayCustom(session.next(visitorSubscriptions(visitor), undefined, undefined, visitorHasExit(visitor)).events, visitor, state, context),
      code: codeFactory,
      editor: makeEditor(session, edits, plugin.name, () => order++),
    };
    entry.context = context;
    contexts.set(plugin, entry);
  }
  const replay = (events: NativeEvent[], plugin: NativePlugin<any, any>, entry: DispatcherEntry, context: PluginContext) => {
    for (const event of events) dispatchOne(event, plugin, entry, context);
  };
  const createPathRuntime = (plugin: NativePlugin<any, any>, entry: DispatcherEntry, context: PluginContext): PathRuntime => {
    let runtime: PathRuntime;
    runtime = {
      session, context, edits, owner: plugin.name, nextOrder: () => order++, state: entry,
      nested(target, nested, state) {
        let id = visitorIds.get(nested); if (id == null) { id = visitorId++; visitorIds.set(nested, id); }
        const key = `${target.id}:${id}`; if (activeTraversals.has(key)) throw new Error(`recursive traversal of node ${target.id}`);
        activeTraversals.add(key);
        try { replayCustom(session.next(visitorSubscriptions(nested), { start: target.start, end: target.end }, undefined, visitorHasExit(nested)).events, nested, state, context); }
        finally { activeTraversals.delete(key); }
      },
      widen(target, types, scopeOnly) {
        entry.delivered ??= new Set();
        replay(session.next(expandSubscriptions(types), scopeOnly ? undefined : { start: target.start, end: target.end }, undefined, visitorHasExit(plugin.visitor)).events.filter(candidate => candidate.sequence > target.sequence && (!scopeOnly || candidate.scopeId === target.scopeId)), plugin, entry, context);
      },
      parent(_target, parentId) { const parent = session.event(parentId); return parent ? makePath(runtime, parent) : null; },
      children(target) { return session.children(target.id).map(child => makePath(runtime, child)); },
      allowsChild(type, role) {
        const declared = plans.get(plugin)?.children;
        if (declared == null) return plugin.name === 'nested';
        for (const [parent, roles] of Object.entries(declared)) {
          if ((parent === type || alias(parent, type)) && childRoleIsDeclared(roles, role)) return true;
        }
        return false;
      },
      allowsAncestry() { return plugin.name === 'nested' || plans.get(plugin)?.ancestry != null; },
      allowsScope() { return plugin.name === 'nested' || plans.get(plugin)?.semantics?.[0] === 'scope'; },
      scopeCache: new Map(),
    };
    return runtime;
  };
  const dispatchOne = (event: NativeEvent, plugin: NativePlugin<any, any>, entry: DispatcherEntry, context: PluginContext, override?: Visitor<any>, overrideState?: any, routedHandlers?: VisitorHandler<any>[]) => {
    const deliveryKey = event.id * 2 + Number(event.side === 'exit');
    if (!override && entry.delivered?.has(deliveryKey)) return;
    if (entry.stopped || stopAll || eventIsSkipped(event, entry.skipped)) return;
    const visitor = override ?? plugin.visitor ?? {};
    const handlers = routedHandlers ?? matchingHandlers(visitor, event);
    for (const handler of event.side === 'exit' ? [...handlers].reverse() : handlers) {
      const callback = typeof handler === 'function' ? (event.side === 'enter' ? handler : undefined) : handler[event.side];
      if (!callback) continue;
      const runtime = override
        ? createPathRuntime(plugin, entry, context)
        : (entry.pathRuntime ??= createPathRuntime(plugin, entry, context));
      const path = makePath(runtime, event);
      currentSequence = event.sequence;
      callback(path, override ? overrideState : entry.state);
      if (!override) entry.delivered?.add(deliveryKey);
    }
  };
  const replayCustom = (events: NativeEvent[], visitor: Visitor<any>, state: any, context: PluginContext) => {
    const synthetic = { name: 'nested', apiVersion: 1 as const, visitor };
    const entry = { context, state, stopped: false, skipped: [] as { start: number; end: number }[] };
    for (const event of events) dispatchOne(event, synthetic, entry, context, visitor, state);
  };
  const routesFor = (event: NativeEvent): PhaseRoute[] => {
    const key = routesByIdentifierName && event.type === 'Identifier'
      ? `${eventRouteKey(event)}:${eventField(event, 'name') ?? ''}`
      : routesByStaticMemberPath && event.type === 'StaticMemberExpression'
        ? `${event.type}:${eventField(event, 'memberPath') ?? ''}`
        : eventRouteKey(event);
    let routes = phaseRoutes.get(key);
    if (routes) return routes;
    routes = [];
    for (const plugin of phase.plugins) {
      const plan = plans.get(plugin);
      if (event.type === 'Identifier' && plan?.identifierNames && !hasExactValue(plan.identifierNames, eventField(event, 'name'))) continue;
      if (event.type === 'StaticMemberExpression' && plan?.staticMemberPatterns && !hasExactValue(plan.staticMemberPatterns, eventField(event, 'memberPath'))) continue;
      const handlers = matchingHandlers(plugin.visitor ?? {}, event);
      if (handlers.length > 0) routes.push({ plugin, entry: contexts.get(plugin)!, handlers });
    }
    phaseRoutes.set(key, routes);
    return routes;
  };
  const onlyPlugin = phase.plugins.length === 1 ? phase.plugins[0] : undefined;
  const onlyEntry = onlyPlugin == null ? undefined : contexts.get(onlyPlugin)!;
  return { contexts, run() { forEachDispatchEvent(batch, event => {
    session.cacheEvent(event);
    if (onlyPlugin && onlyEntry) {
      dispatchOne(event, onlyPlugin, onlyEntry, onlyEntry.context);
      return;
    }
    const routes = routesFor(event);
    if (event.side === 'enter') {
      for (const route of routes) dispatchOne(event, route.plugin, route.entry, route.entry.context, undefined, undefined, route.handlers);
    } else {
      for (let index = routes.length - 1; index >= 0; index--) {
        const route = routes[index];
        dispatchOne(event, route.plugin, route.entry, route.entry.context, undefined, undefined, route.handlers);
      }
    }
  }); } };
}

function childRoleIsDeclared(roles: readonly string[], requestedRole: string): boolean {
  for (const role of roles) {
    if (role === requestedRole || role === '*') return true;
  }
  return false;
}

function eventIsSkipped(event: NativeEvent, ranges: readonly { start: number; end: number }[]): boolean {
  for (const range of ranges) {
    if (event.start > range.start && event.end <= range.end) return true;
  }
  return false;
}

function hasExactValue(values: readonly string[], candidate: unknown): boolean {
  for (const value of values) {
    if (value === candidate) return true;
  }
  return false;
}

type PathState = { stopped: boolean; skipped: { start: number; end: number }[] };
type PathRuntime = { session: NativeTransformSession; context: PluginContext; edits: EditCommand[]; owner: string; nextOrder: () => number; state: PathState; nested: (target: NativeEvent, visitor: Visitor<any>, value: any) => void; widen: (target: NativeEvent, types: string[], scopeOnly: boolean) => void; parent: (target: NativeEvent, id: number) => NativeNodePath | null; children: (target: NativeEvent) => NativeNodePath[]; allowsChild: (type: string, role: string) => boolean; allowsAncestry: () => boolean; allowsScope: () => boolean; scopeCache: Map<number, NativeScope> };
function makePath(runtime: PathRuntime, event: NativeEvent): NativeNodePath { return new NodePathImpl(runtime, event); }

class NodePathImpl implements NativeNodePath {
  readonly node: NodeView;
  readonly #parent: NodeSummary | null;
  #scope?: NativeScope;
  constructor(readonly runtime: PathRuntime, readonly event: NativeEvent) {
    this.node = runtime.session.nodeView(event);
    this.#parent = event.parentId == null ? null : { id: event.parentId, type: event.parentType! };
  }
  get context(): PluginContext { return this.runtime.context; }
  get parent(): NodeSummary | null { this.#assertAncestry(); return this.#parent; }
  get parentPath(): NativeNodePath | null { this.#assertAncestry(); return this.event.parentId == null ? null : this.runtime.parent(this.event, this.event.parentId); }
  get scope(): NativeScope { if (!this.runtime.allowsScope()) throw new Error(`${this.runtime.owner}: undeclared scope semantics`); return this.#scope ??= makeScope(this.runtime, this.event.scopeId, this.event.scopeParentId ?? null); }
  getSource(): string { return this.runtime.session.source.slice(this.event.start, this.event.end); }
  getLocation(): SourceLocation { return location(this.runtime.session.source, this.event.start, this.event.end); }
  is<TType extends string>(type: TType): this is NativeNodePath<NodeOfType<TType>> { return type === this.event.type; }
  childrenUnchecked(): readonly NativeNodePath[] { return this.runtime.children(this.event); }
  getChildren(): readonly NativeNodePath[] { this.#assertChildRole('*'); return this.childrenUnchecked(); }
  get(key: string): NativeNodePath | readonly NativeNodePath[] | null { this.#assertChildRole(key); return selectChildRole(this, key, this.childrenUnchecked()); }
  getChild(key: string): NativeNodePath | null { const value = this.get(key); if (Array.isArray(value)) throw new Error(`${this.node.type}.${key} is a child list`); return value as NativeNodePath | null; }
  getChildList(key: string): readonly NativeNodePath[] { const value = this.get(key); if (!Array.isArray(value)) throw new Error(`${this.node.type}.${key} is not a child list`); return value; }
  matchesPattern(pattern: string, allowPartial = false): boolean { const memberPath = this.node.memberPath; return typeof memberPath === 'string' && (memberPath === pattern || (allowPartial && memberPath.startsWith(`${pattern}.`))); }
  #assertChildRole(role: string): void { if (!this.runtime.allowsChild(this.node.type, role)) throw new Error(`${this.runtime.owner}: undeclared child role ${this.node.type}.${role}`); }
  #assertAncestry(): void { if (!this.runtime.allowsAncestry()) throw new Error(`${this.runtime.owner}: undeclared ancestry access`); }
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null { let parent = this.parentPath; while (parent) { if (predicate(parent)) return parent; parent = parent.parentPath; } return null; }
  find(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null { let current: NativeNodePath | null = this; while (current) { if (predicate(current)) return current; current = current.parentPath; } return null; }
  getFunctionParent(): NativeNodePath | null { return this.findParent(parent => alias('Function', parent.node.type)); }
  getProgramParent(): NativeNodePath | null { return this.findParent(parent => parent.node.type === 'Program'); }
  #edit(kind: EditKind, content?: string | CodeFragment): void { this.runtime.edits.push({ kind, start: this.event.start, end: this.event.end, content: typeof content === 'string' ? content : content?.code, mapping: typeof content === 'string' ? 'Sourceless' : mappingPolicy(content?.mapping), names: typeof content === 'string' ? undefined : content?.names ? [...content.names] : undefined, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  replaceWith(code: string | CodeFragment): void { this.#edit('Replace', code); }
  replaceWithMultiple(code: readonly (string | CodeFragment)[]): void { this.#edit('Replace', joinFragments(code)); }
  update(code: string | CodeFragment): void { this.#edit('Replace', code); }
  overwrite(code: string | CodeFragment): void { this.#edit('Replace', code); }
  remove(): void { this.#edit('Remove'); }
  insertBefore(content: string): void { this.runtime.edits.push({ kind: 'PrependRight', start: this.event.start, end: this.event.start, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  insertAfter(content: string): void { this.runtime.edits.push({ kind: 'AppendLeft', start: this.event.end, end: this.event.end, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  unshiftContainer(key: 'body', code: string | CodeFragment | readonly (string | CodeFragment)[]): void { if (key !== 'body') throw new Error(`Unsupported container: ${key}`); this.prependToBody(fragmentText(code)); }
  pushContainer(key: 'body', code: string | CodeFragment | readonly (string | CodeFragment)[]): void { if (key !== 'body') throw new Error(`Unsupported container: ${key}`); this.appendToBody(fragmentText(code)); }
  addComment(position: 'leading' | 'trailing' | 'inner', content: string, line = false): void { const comment = line ? `//${content}\n` : `/*${content}*/`; if (position === 'leading') this.insertBefore(comment); else if (position === 'trailing') this.insertAfter(comment); else this.prependToBody(comment); }
  buildCodeFrameError(message: string): NativeTransformError { return new NativeTransformError(message, [{ code: 'plugin-error', message, start: this.event.start, end: this.event.end }]); }
  prependToBody(content: string): void { const offset = Number(this.node.bodyStart ?? this.event.start); this.runtime.edits.push({ kind: 'AppendRight', start: offset, end: offset, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  appendToBody(content: string): void { const offset = Number(this.node.bodyEnd ?? this.event.end); this.runtime.edits.push({ kind: 'PrependLeft', start: offset, end: offset, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  skip(): void { this.runtime.state.skipped.push({ start: this.event.start, end: this.event.end }); }
  stop(): void { this.runtime.state.stopped = true; }
  traverse<State>(visitor: Visitor<State>, state?: State): void { this.runtime.nested(this.event, visitor, state); }
  subscribeWithin(types: string | readonly string[]): void { this.runtime.widen(this.event, array(types), false); }
  subscribeForScope(types: string | readonly string[]): void { this.runtime.widen(this.event, array(types), true); }
  unsupported(reason: string): never { return this.runtime.context.unsupported(reason); }
}

type EditKind = EditCommand['kind'];
const matchingHandlerCache = new WeakMap<object, { routes: Map<string, VisitorHandler<any>[]>; fieldAware: boolean }>();
const visitorSubscriptionsCache = new WeakMap<object, NativeVisitorRoute[]>();
const visitorExitCache = new WeakMap<object, boolean>();
function eventRouteKey(event: NativeEvent): string {
  if (event.type === 'Identifier') return `${event.type}:${eventField(event, 'global') == null ? '' : 'reference'}`;
  if (event.type === 'Function' || event.type === 'Class') return `${event.type}:${eventField(event, 'nodeKind') ?? ''}`;
  return event.type;
}
function matchingHandlers(visitor: Visitor<any>, event: NativeEvent): VisitorHandler<any>[] {
  let cache = matchingHandlerCache.get(visitor);
  if (!cache) {
    cache = { routes: new Map(), fieldAware: visitorNeedsFieldRouting(visitor) };
    matchingHandlerCache.set(visitor, cache);
  }
  const route = cache.fieldAware ? eventRouteKey(event) : event.type;
  const cached = cache.routes.get(route);
  if (cached) return cached;
  const handlers: VisitorHandler<any>[] = [];
  for (const [key, handler] of Object.entries(visitor)) {
    if (handler == null) continue;
    for (const part of key.split('|')) {
      if (visitorKeyMatches(part, event)) {
        handlers.push(handler as VisitorHandler<any>);
        break;
      }
    }
  }
  cache.routes.set(route, handlers);
  return handlers;
}
function visitorNeedsFieldRouting(visitor: Visitor<any>): boolean {
  for (const route of Object.keys(visitor)) {
    for (const key of route.split('|')) {
      if (key === 'ReferencedIdentifier' || isCollapsedFunctionKey(key) || isCollapsedClassKey(key)) return true;
    }
  }
  return false;
}
function alias(key: string, type: string): boolean {
  if (key === '*') return true;
  if (key === 'Function') {
    return type === 'Function'
      || type === 'ArrowFunctionExpression'
      || type.endsWith('FunctionDeclaration')
      || type.endsWith('FunctionExpression');
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
function visitorKeyMatches(key: string, event: NativeEvent): boolean {
  if (key === 'ReferencedIdentifier') return event.type === 'Identifier' && eventField(event, 'global') != null;
  if (key === 'MetaProperty') return event.type === 'ImportMeta' || event.type === 'NewTarget';
  if (isCollapsedFunctionKey(key) || isCollapsedClassKey(key)) return event.type === (isCollapsedClassKey(key) ? 'Class' : 'Function') && eventField(event, 'nodeKind') === key;
  return key === event.type || alias(key, event.type);
}
function isLiteralExpressionType(type: string): boolean {
  return type === 'Identifier'
    || type === 'StringLiteral'
    || type === 'NumericLiteral'
    || type === 'BooleanLiteral'
    || type === 'BigIntLiteral'
    || type === 'RegExpLiteral'
    || type === 'NullLiteral'
    || type === 'TemplateLiteral';
}
function isMemberExpressionType(type: string): boolean {
  return type === 'StaticMemberExpression'
    || type === 'ComputedMemberExpression'
    || type === 'PrivateFieldExpression';
}
function isCollapsedFunctionKey(key: string): boolean {
  return key === 'FunctionDeclaration' || key === 'FunctionExpression' || key === 'TSDeclareFunction';
}
function isCollapsedClassKey(key: string): boolean {
  return key === 'ClassDeclaration' || key === 'ClassExpression';
}
function isDeclarationType(type: string): boolean {
  return type.endsWith('Declaration')
    || type === 'Function'
    || type === 'Class'
    || type === 'TSEnumDeclaration'
    || type === 'TSInterfaceDeclaration'
    || type === 'TSTypeAliasDeclaration'
    || type === 'TSModuleDeclaration'
    || type === 'TSImportEqualsDeclaration';
}
function eventField(event: NativeEvent, key: string): unknown {
  const direct = (event as NativeEvent & Record<string, unknown>)[key];
  return direct ?? event.fields.find(field => field.key === key)?.value;
}
function toNodeView(event: NativeEvent): NodeView {
  if (event.fields.length === 0) return event as unknown as NodeView;
  const node: Record<string, unknown> = {
    id: event.id,
    type: event.type,
    start: event.start,
    end: event.end,
    parentId: event.parentId,
    parentType: event.parentType,
    scopeId: event.scopeId,
    scopeParentId: event.scopeParentId,
  };
  for (const field of event.fields) {
    node[field.key] = typeof field.value === 'string' && (field.key !== 'value' || event.type !== 'StringLiteral')
      ? parseScalar(field.value)
      : field.value;
  }
  return node as NodeView;
}
function summary(node: NodeView): NodeSummary { return { id: node.id, type: node.type, start: node.start, end: node.end, parentId: node.parentId, parentType: node.parentType }; }
function array(value: string | readonly string[]): string[] { return typeof value === 'string' ? [value] : [...value]; }
function expandSubscriptions(values: readonly string[]): string[] { return [...new Set(values.flatMap(value => value.split('|')))]; }
const encodedSubscriptionsCache = new Map<string, { ids: number[]; fallback: string[] }>();
function encodeSubscriptions(subscriptions: readonly string[]): { ids: number[]; fallback: string[] } {
  const key = subscriptions.join('|');
  const cached = encodedSubscriptionsCache.get(key);
  if (cached) return cached;
  const ids = new Set<number>();
  const fallback: string[] = [];
  for (const subscription of subscriptions) {
    const id = NODE_TYPE_IDS.get(subscription);
    if (id != null) { ids.add(id); continue; }
    let expanded = false;
    for (let typeId = 1; typeId < NODE_TYPES.length; typeId++) {
      if (alias(subscription, NODE_TYPES[typeId])) { ids.add(typeId); expanded = true; }
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
function visitorHasExit(visitor?: Visitor<any>): boolean {
  if (!visitor) return false;
  const cached = visitorExitCache.get(visitor);
  if (cached != null) return cached;
  const hasExit = Object.values(visitor).some(handler => typeof handler === 'object' && handler?.exit != null);
  visitorExitCache.set(visitor, hasExit);
  return hasExit;
}
function visitorRoutingFields(visitor?: Visitor<any>): Record<string, string[]> {
  const keys = new Set(visitor ? Object.keys(visitor).flatMap(key => key.split('|')) : []);
  const fields: Record<string, string[]> = {};
  if (keys.has('FunctionDeclaration') || keys.has('FunctionExpression') || keys.has('TSDeclareFunction')) fields.Function = ['nodeKind', 'name', 'async', 'generator', 'parameterCount', 'bodyStart', 'bodyEnd'];
  if (keys.has('ClassDeclaration') || keys.has('ClassExpression')) fields.Class = ['nodeKind', 'name'];
  if (keys.has('ReferencedIdentifier')) fields.Identifier = ['name', 'global', 'read', 'write', 'bindingScopeId'];
  return fields;
}
function querySubscriptions(request: QueryRequest): string[] {
  const types: string[] = [];
  if (request.globals?.length || request.bindings?.length) types.push('Identifier');
  if (request.imports) {
    types.push('ImportDeclaration', 'ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier');
  }
  if (request.exports) {
    types.push('ExportNamedDeclaration', 'ExportDefaultDeclaration', 'ExportAllDeclaration', 'ExportSpecifier');
  }
  if (request.constants?.length) types.push('Expression');
  if (request.calls?.length) types.push('CallExpression');
  if (request.captures?.length) types.push('Function', 'Identifier');
  return types;
}
function mappingPolicy(value?: CodeFragment['mapping']): EditCommand['mapping'] { return ({ 'sourceless': 'Sourceless', 'anchor-start': 'AnchorStart', 'anchor-boundaries': 'AnchorBoundaries', identity: 'Identity' } as const)[value ?? 'sourceless']; }
function makeScope(runtime: PathRuntime, id: number, parentId: number | null): NativeScope {
  const cached = runtime.scopeCache.get(id);
  if (cached) return cached;
  const session = runtime.session;
  const scopeChain = () => { const ids = []; let scope: number | null = id; while (scope != null) { ids.push(scope); scope = session.scopeParentId(scope); } return ids; };
  const resolve = (name: string): QueryResult['bindings'][number] | undefined => {
    return session.bindingForScopes(name, scopeChain());
  };
  let parentScope: NativeScope | undefined;
  let ownerPath: NativeNodePath | null | undefined;
  const scope: NativeScope = {
    id, parentId,
    get parent() { return parentId == null ? null : parentScope ??= makeScope(runtime, parentId, session.scopeParentId(parentId)); },
    get path() { return ownerPath === undefined ? ownerPath = scopeOwnerPath(runtime, id) : ownerPath; },
    hasBinding: name => resolve(name) != null,
    hasGlobal: name => session.globalReferences(name).length > 0,
    getBinding(name) { const binding = resolve(name); if (binding) return makeBinding(runtime, binding); const references = session.globalReferences(name); if (references.length > 0) return { name, global: true, declaration: null, references, path: null, scope: null }; return null; },
    getProgramParent() { let current: NativeScope = this; while (current.parent) current = current.parent; return current; },
    push(content) {
      const owner = this.path;
      if (!owner) throw new Error(`Cannot find owner path for scope ${id}`);
      const directives = session.next(['Directive'], { start: owner.node.start, end: owner.node.end }, undefined, false).events.filter(event => event.scopeId === id);
      const offset = directives.reduce((end, directive) => Math.max(end, directive.end), Number(owner.node.bodyStart ?? owner.node.start));
      runtime.context.editor.appendLeft(offset, `${directives.length === 0 ? '' : '\n'}${fragmentText(content)}\n`);
    },
    generateUid: name => session.generateUid(name),
    rename(name, replacement = session.generateUid(name)) {
      const binding = resolve(name);
      if (!binding) throw new Error(`Cannot rename unbound identifier ${name}`);
      if (!/^[$A-Z_a-z][$\w]*$/.test(replacement)) throw new Error(`Invalid identifier: ${replacement}`);
      const nodes = [binding.declaration, ...binding.references].filter((node): node is NodeSummary | NodeView => node != null);
      const shorthandParentIds = [...new Set(nodes.flatMap(node => {
        const view = node as NodeView;
        return view.parentId != null && isShorthandPropertyType(view.parentType) ? [view.parentId] : [];
      }))];
      const parentStarts = new Map(session.inspect(shorthandParentIds.map(nodeId => ({ nodeId, fields: [] }))).map(parent => [parent.id, parent.start]));
      for (const node of nodes) {
        const view = node as NodeView;
        const preservesShorthandKey = view.parentId != null && parentStarts.get(view.parentId) === view.start;
        runtime.edits.push({ kind: 'Replace', start: node.start!, end: node.end!, content: preservesShorthandKey ? `${name}: ${replacement}` : replacement, mapping: 'AnchorBoundaries', names: [name], owner: runtime.owner, order: runtime.nextOrder() });
      }
      return replacement;
    },
  };
  runtime.scopeCache.set(id, scope);
  return scope;
}

function scopeOwnerPath(runtime: PathRuntime, scopeId: number): NativeNodePath | null {
  const events = runtime.session.next(['Program', 'Function', 'ArrowFunctionExpression'], undefined, undefined, false).events;
  const owner = events.find(event => event.scopeId === scopeId && (event.type === 'Program' || event.type === 'Function' || event.type === 'ArrowFunctionExpression'));
  return owner ? makePath(runtime, owner) : null;
}

function makeBinding(runtime: PathRuntime, binding: QueryResult['bindings'][number]): NativeBinding {
  let path: NativeNodePath | null | undefined;
  let scope: NativeScope | null | undefined;
  return {
    ...binding,
    global: false,
    get path() { return path === undefined ? path = bindingOwnerPath(runtime, binding.declaration) : path; },
    get scope() { if (scope !== undefined) return scope; const event = binding.declaration == null ? undefined : runtime.session.event(binding.declaration.id); return scope = makeScope(runtime, binding.scopeId, event?.scopeParentId ?? null); },
  };
}

function bindingOwnerPath(runtime: PathRuntime, declaration: NodeSummary | null): NativeNodePath | null {
  let parentId = declaration?.parentId;
  let fallback: NativeNodePath | null = declaration == null ? null : pathForId(runtime, declaration.id);
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
function pathForId(runtime: PathRuntime, nodeId: number): NativeNodePath | null { const event = runtime.session.event(nodeId); return event ? makePath(runtime, event) : null; }
function isBindingOwnerType(type: string): boolean { return type === 'VariableDeclarator' || type === 'Function' || type === 'Class' || type === 'ImportSpecifier' || type === 'ImportDefaultSpecifier' || type === 'ImportNamespaceSpecifier' || type === 'FormalParameter' || type === 'FormalParameterRest' || type === 'CatchParameter'; }

function joinFragments(values: readonly (string | CodeFragment)[]): CodeFragment {
  return { code: values.map(value => typeof value === 'string' ? value : value.code).join('\n'), mapping: values.some(value => typeof value !== 'string' && value.mapping === 'identity') ? 'identity' : 'anchor-boundaries', names: values.flatMap(value => typeof value === 'string' ? [] : [...(value.names ?? [])]) };
}
function fragmentText(value: string | CodeFragment | readonly (string | CodeFragment)[]): string { return isFragmentList(value) ? joinFragments(value).code : typeof value === 'string' ? value : value.code; }
function isFragmentList(value: string | CodeFragment | readonly (string | CodeFragment)[]): value is readonly (string | CodeFragment)[] { return Array.isArray(value); }

const LIST_CHILD_ROLES = new Set(['arguments', 'body', 'declarations', 'decorators', 'directives', 'elements', 'params', 'properties', 'specifiers']);
function selectChildRole(path: NodePathImpl, key: string, children: readonly NativeNodePath[]): NativeNodePath | readonly NativeNodePath[] | null {
  const type = path.node.type;
  const at = (index: number) => children[index] ?? null;
  const last = () => children.at(-1) ?? null;
  if (key === 'body') {
    if (type === 'Program' || type === 'BlockStatement' || type === 'FunctionBody' || type === 'ClassBody' || type === 'TSModuleBlock') return children;
    return last();
  }
  if (key === 'arguments' && (type === 'CallExpression' || type === 'NewExpression')) return children.slice(1);
  if (key === 'callee' && (type === 'CallExpression' || type === 'NewExpression')) return at(0);
  if (key === 'declarations' && type === 'VariableDeclaration') return children.filter(child => child.node.type === 'VariableDeclarator');
  if (key === 'specifiers' && (type === 'ImportDeclaration' || type === 'ExportNamedDeclaration')) return children.filter(child => child.node.type.endsWith('Specifier'));
  if (key === 'directives' && (type === 'Program' || type === 'FunctionBody')) return children.filter(child => child.node.type === 'Directive');
  if (key === 'decorators' && (type === 'Class' || type === 'MethodDefinition' || type === 'PropertyDefinition' || type === 'FormalParameter')) return children.filter(child => child.node.type === 'Decorator');
  if (key === 'properties' && (type === 'ObjectExpression' || type === 'ObjectPattern' || type === 'ObjectAssignmentTarget')) return children;
  if (key === 'elements' && (type === 'ArrayExpression' || type === 'ArrayPattern' || type === 'ArrayAssignmentTarget')) return children;
  if (key === 'params' && alias('Function', type)) {
    const parameters = children.find(child => child.node.type === 'FormalParameters');
    return parameters instanceof NodePathImpl ? parameters.childrenUnchecked() : [];
  }
  if (key === 'id' && (type === 'VariableDeclarator' || type === 'Function' || type === 'Class' || type === 'TSEnumDeclaration' || type === 'TSInterfaceDeclaration' || type === 'TSTypeAliasDeclaration')) return at(0);
  if (key === 'init' && type === 'VariableDeclarator') return children.length > 1 ? last() : null;
  if (key === 'expression' && type === 'ExpressionStatement') return at(0);
  if ((key === 'key' || key === 'value') && (type === 'ObjectProperty' || type === 'BindingProperty' || type === 'AssignmentTargetPropertyProperty')) return key === 'key' ? at(0) : last();
  if ((key === 'object' || key === 'property') && isMemberExpressionType(type)) return key === 'object' ? at(0) : last();
  if ((key === 'left' || key === 'right') && (type === 'BinaryExpression' || type === 'LogicalExpression' || type === 'AssignmentExpression' || type === 'PrivateInExpression')) return key === 'left' ? at(0) : last();
  if (key === 'argument' && (type === 'UnaryExpression' || type === 'UpdateExpression' || type === 'AwaitExpression' || type === 'YieldExpression' || type === 'ReturnStatement' || type === 'ThrowStatement' || type === 'SpreadElement')) return at(0);
  if (key === 'test' && (type === 'IfStatement' || type === 'ConditionalExpression' || type === 'WhileStatement' || type === 'DoWhileStatement' || type === 'ForStatement' || type === 'SwitchStatement')) return at(0);
  if (key === 'consequent' && (type === 'IfStatement' || type === 'ConditionalExpression')) return at(1);
  if (key === 'alternate' && (type === 'IfStatement' || type === 'ConditionalExpression')) return at(2);
  if (key === 'block' && type === 'TryStatement') return children.find(child => child.node.type === 'BlockStatement') ?? null;
  if (key === 'handler' && type === 'TryStatement') return children.find(child => child.node.type === 'CatchClause') ?? null;
  if (key === 'finalizer' && type === 'TryStatement') { const blocks = children.filter(child => child.node.type === 'BlockStatement'); return blocks.length > 1 ? blocks[1] : null; }
  if (key === 'superClass' && type === 'Class') { const candidates = children.filter(child => child.node.type !== 'Decorator' && child.node.type !== 'ClassBody' && !child.node.type.startsWith('TS')); return typeof path.node.name === 'string' ? candidates[1] ?? null : candidates[0] ?? null; }
  if ((key === 'key' || key === 'value') && (type === 'MethodDefinition' || type === 'PropertyDefinition' || type === 'AccessorProperty')) return key === 'key' ? children.find(child => child.node.type !== 'Decorator') ?? null : last();
  if (key === 'source' && (type.startsWith('Import') || type.startsWith('Export'))) return children.find(child => child.node.type === 'StringLiteral') ?? null;
  if (key === 'declaration' && (type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration')) return children.find(child => !child.node.type.endsWith('Specifier') && child.node.type !== 'StringLiteral') ?? null;
  if (LIST_CHILD_ROLES.has(key)) return [];
  throw new Error(`${type} does not expose child role ${JSON.stringify(key)}`);
}
function isShorthandPropertyType(type: string | undefined): boolean { return type === 'ObjectProperty' || type === 'BindingProperty' || type === 'AssignmentTargetPropertyIdentifier'; }
function location(source: string, start: number, end: number): SourceLocation { const at = (offset: number) => { const before = source.slice(0, offset); const lines = before.split('\n'); return { line: lines.length, column: lines.at(-1)!.length }; }; return { start: at(start), end: at(end) }; }
function locationOffset(source: string, position: SourceLocation['start']): number { const lines = source.split('\n'); let offset = 0; for (let line = 1; line < position.line; line++) offset += (lines[line - 1]?.length ?? 0) + 1; return offset + position.column; }
const SOURCE_HINTS = ['process.env', 'require', 'import', 'export', 'codegenNativeComponent'] as const;
class LazySourceHints implements ReadonlySet<string> {
  #set?: Set<string>;
  constructor(readonly source: string) {}
  get size(): number { return this.#all().size; }
  has(value: string): boolean { return this.#set?.has(value) ?? this.source.includes(value); }
  entries(): SetIterator<[string, string]> { return this.#all().entries(); }
  keys(): SetIterator<string> { return this.#all().keys(); }
  values(): SetIterator<string> { return this.#all().values(); }
  forEach(callback: (value: string, value2: string, set: ReadonlySet<string>) => void, thisArg?: unknown): void { for (const value of this.#all()) callback.call(thisArg, value, value, this); }
  [Symbol.iterator](): SetIterator<string> { return this.values(); }
  #all(): Set<string> { return this.#set ??= new Set(SOURCE_HINTS.filter(hint => this.source.includes(hint))); }
}
function sourceHints(source: string): ReadonlySet<string> { return new LazySourceHints(source); }
function parserFilename(filename: string, parser: TransformOptions['parser']): string { if (!parser || parser === 'auto') return filename; const extension = parser === 'dts' ? 'd.ts' : parser; return `${filename.replace(/(?:\.d)?\.[^.]+$/, '')}.${extension}`; }
function classifyForTransform(filename: string, source: string): ParseClassification {
  const lower = filename.toLowerCase();
  const syntax = lower.endsWith('.d.ts') ? 'dts' : lower.endsWith('.tsx') ? 'tsx' : lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts') ? 'ts' : lower.endsWith('.jsx') ? 'jsx' : lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs') ? source.includes('@flow') ? 'flow' : 'js' : 'unknown';
  const supported = syntax !== 'flow' && syntax !== 'unknown';
  return { syntax, supported, get codegenCandidate() { return source.includes('codegenNativeComponent') || source.includes('codegenNativeCommands'); }, reason: supported ? 'oxc-supported' : syntax === 'flow' ? 'flow-requires-parser-adapter' : 'unknown-extension' };
}
function addTimings(target: NativeTransformResult['timings'], value: NativeTransformResult['timings']): void { target.parseMs += value.parseMs; target.semanticMs += value.semanticMs; target.traversalMs += value.traversalMs; target.renderAndMapMs += value.renderAndMapMs; target.napiTransferMs = (target.napiTransferMs ?? 0) + (value.napiTransferMs ?? 0); }
const EDITOR_CAPABILITIES = new Set(['append', 'prepend', 'update', 'overwrite', 'remove', 'move', 'reset', 'indent', 'trim', 'addSourceMapLocation', 'replace', 'replaceAll']);
const codeFactory: CodeFactory = {
  identifier(name) { if (!/^[$A-Z_a-z][$\w]*$/.test(name)) throw new Error(`Invalid identifier: ${name}`); return { code: name, mapping: 'sourceless' }; },
  stringLiteral: value => ({ code: JSON.stringify(value), mapping: 'sourceless' }),
  literal(value) { return { code: typeof value === 'bigint' ? `${value}n` : value === null ? 'null' : typeof value === 'string' ? JSON.stringify(value) : String(value), mapping: 'sourceless' }; },
  template(parts, ...values) { return { code: parts.reduce((code, part, index) => code + part + (index < values.length ? typeof values[index] === 'string' ? values[index] : values[index].code : ''), ''), mapping: 'sourceless' }; },
  parseExpression(code, parserMode) { native.validateExpression(code, parserMode === 'auto' ? undefined : parserMode); return { code, mapping: 'anchor-boundaries' }; },
  parseStatements(code, parserMode) { native.validateStatements(code, parserMode === 'auto' ? undefined : parserMode); return { code, mapping: 'anchor-boundaries' }; },
};
function stableJson(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`; if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(',')}}`; return JSON.stringify(value); }

function makeEditor(session: NativeTransformSession, edits: EditCommand[], owner: string, nextOrder: () => number): NativeEditor {
  const source = session.source;
  const push = (kind: EditKind, start: number, end: number, content?: string) => edits.push({ kind, start, end, content, owner, order: nextOrder() });
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
    move(start, end, destination) { if (destination > start && destination < end) throw new Error('move destination cannot be inside moved range'); push('Remove', start, end); push('PrependRight', destination, destination, source.slice(start, end)); },
    reset(start, end) { for (let index = edits.length - 1; index >= 0; index--) if (edits[index].owner === owner && edits[index].start >= start && edits[index].end <= end) edits.splice(index, 1); },
    indent(prefix = '  ') { push('Replace', 0, source.length, source.split(/(?<=\n)/).map(line => line.trim() ? prefix + line : line).join('')); },
    trim() { this.trimStart(); this.trimEnd(); },
    trimStart() { const count = leading(); if (count) push('Remove', 0, count); },
    trimEnd() { const count = trailing(); if (count) push('Remove', source.length - count, source.length); },
    addSourceMapLocation(offset) { push('AddSourceMapLocation', offset, offset); },
    hasChanged: () => edits.some(edit => edit.owner === owner),
    replace(search, replacement) { lowerReplacements(source, search, replacement, false, (start, end, content) => push('Replace', start, end, content)); },
    replaceAll(search, replacement) { lowerReplacements(source, search, replacement, true, (start, end, content) => push('Replace', start, end, content)); },
    slice: (start, end) => source.slice(start, end),
    toString: () => session.commit(edits).code,
    isEmpty: () => source.trim().length === 0,
  };
}

function lowerReplacements(source: string, search: string | RegExp, replacement: string | ((match: string, ...groups: string[]) => string), all: boolean, emit: (start: number, end: number, content: string) => void): void {
  const expression = typeof search === 'string' ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), all ? 'g' : '') : new RegExp(search.source, all && !search.global ? `${search.flags}g` : search.flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(source))) {
    const content = typeof replacement === 'function' ? replacement(match[0], ...match.slice(1).map(value => value ?? '')) : match[0].replace(expression, replacement);
    emit(match.index, match.index + match[0].length, content);
    if (!all || !expression.global) break;
    if (match[0] === '') expression.lastIndex++;
  }
}
