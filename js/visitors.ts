import { native, type NativeIndexedSessionBinding } from './native.js';
import { FIELD_KEYS, NODE_TYPE_IDS, NODE_TYPES } from './generated-event-schema.js';
import { createHash } from 'node:crypto';
import type {
  Diagnostic, EditCommand, EventBatch, InspectRequest, NativeBailoutResult, NativeEvent,
  NativeTransformResult, NodeSummary, NodeView, PluginPlan, QueryRequest, QueryResult,
  SourceLocation, TransformOptions, TransformResult, ParseClassification,
  NodeOfType,
  ParserAdapter,
} from './types.js';

export interface PrepareContext {
  readonly filename: string;
  readonly options: TransformOptions;
  readonly parser: ReturnType<typeof native.classify>;
  readonly sourceHints: ReadonlySet<string>;
  subscribe(...types: string[]): void;
}

export interface NativeScope {
  readonly id: number;
  readonly parentId: number | null;
  hasBinding(name: string): boolean;
  hasGlobal(name: string): boolean;
  getBinding(name: string): { name: string; global: boolean } | null;
  generateUid(name?: string): string;
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
  supports(capability: string): boolean;
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

export interface CodeFragment { code: string; mapping: 'sourceless' | 'anchor-start' | 'anchor-boundaries' | 'identity'; names?: readonly string[] }
export interface CodeFactory {
  identifier(name: string): CodeFragment;
  stringLiteral(value: string): CodeFragment;
  template(parts: TemplateStringsArray, ...values: readonly (CodeFragment | string)[]): CodeFragment;
  parseExpression(code: string, parserMode?: TransformOptions['parser']): CodeFragment;
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
  is<TType extends string>(type: TType): this is NativeNodePath<NodeOfType<TType>>;
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null;
  getFunctionParent(): NativeNodePath | null;
  getProgramParent(): NativeNodePath | null;
  replaceWith(code: CodeFragment | string): void;
  update(code: CodeFragment | string): void;
  overwrite(code: CodeFragment | string): void;
  remove(): void;
  insertBefore(code: string): void;
  insertAfter(code: string): void;
  prependToBody(code: string): void;
  appendToBody(code: string): void;
  skip(): void;
  stop(): void;
  traverse<State>(visitor: Visitor<State>, state?: State): void;
  subscribeWithin(types: string | readonly string[]): void;
  subscribeForScope(types: string | readonly string[]): void;
  unsupported(reason: string): never;
}

type Handler<State> = (path: NativeNodePath, state: State) => void;
export type VisitorHandler<State> = Handler<State> | { enter?: Handler<State>; exit?: Handler<State> };
export type Visitor<State> = Record<string, VisitorHandler<State> | undefined>;
export interface NativePlugin<State = unknown, Options = unknown> {
  name: string;
  version?: string;
  apiVersion: 1;
  options?: Options;
  prepare?(context: PrepareContext, options: Options): PluginPlan | void;
  createState?(): State;
  pre?(context: PluginContext, state: State): void;
  analyze?(context: PluginContext, state: State): TransformDecision | void;
  apply?(context: PluginContext, analysis: unknown, state: State): void;
  visitor?: Visitor<State>;
  post?(context: PluginContext, state: State): void;
  cleanup?(reason: 'complete' | 'bailout' | 'error', state: State): void;
}
export interface PipelinePhase { name: string; plugins: readonly NativePlugin<any, any>[]; reparseAfterEdits?: boolean }
export interface NativePipeline { apiVersion: 1; phases: readonly PipelinePhase[] }

class Bailout extends Error {}
export class NativeTransformError extends Error {
  constructor(message: string, readonly diagnostics: Diagnostic[]) { super(message); this.name = 'NativeTransformError'; }
}
export function defineNativePlugin<State, Options = unknown>(plugin: NativePlugin<State, Options>): NativePlugin<State, Options> { return plugin; }
export function defineNativePipeline(pipeline: NativePipeline): NativePipeline { return pipeline; }
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

type PackedEventBatch = { data: Buffer; strings: string[]; nodeCount: number; emittedCount: number; timings: EventBatch['timings']; includeParent?: boolean; includeScope?: boolean };
const EDIT_KINDS: Record<EditKind, number> = { Replace: 0, Remove: 1, AppendLeft: 2, PrependLeft: 3, AppendRight: 4, PrependRight: 5, AddSourceMapLocation: 6 };
const EDIT_MAPPINGS: Record<NonNullable<EditCommand['mapping']>, number> = { Sourceless: 0, AnchorStart: 1, AnchorBoundaries: 2, Identity: 3 };

export class NativeTransformSession {
  #closed = false;
  #batches = 0;
  #uids = new Set<string>();
  #uidsInitialized = false;
  #eventCache: (NativeEvent | undefined)[] = [];
  #queryCache = new Map<string, QueryResult>();
  #identifiersCache: NativeEvent[] | null = null;
  readonly openMs: number;
  #native: NativeIndexedSessionBinding | null = null;
  #useStatelessInitialBatch: boolean;
  #nativeFilename: string;
  constructor(readonly source: string, readonly filename: string, readonly options: TransformOptions = {}, initialSubscriptions: readonly string[] = []) {
    const started = performance.now();
    this.#nativeFilename = parserFilename(filename, options.parser);
    this.#useStatelessInitialBatch = initialSubscriptions.length > 0;
    if (!this.#useStatelessInitialBatch) this.#native = new native.NativeIndexedSession(source, this.#nativeFilename, []);
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
      ? (() => { const ids: number[] = []; const fallback: string[] = []; for (const subscription of subscriptions) { const id = NODE_TYPE_IDS.get(subscription); if (id) ids.push(id); else fallback.push(subscription); } return decodePackedEnvelope(native.materializePackedBuffer(this.source, this.#nativeFilename, fallback, ids, root?.start, root?.end, packFieldRequests(fields), includeExit)); })()
      : this.#binding().nextPacked([...subscriptions], root?.start, root?.end, fieldRequests, includeExit);
    this.#useStatelessInitialBatch = false;
    packed.timings.napiTransferMs = (packed.timings.napiTransferMs ?? 0) + performance.now() - started;
    return packed;
  }
  cacheEvent(event: NativeEvent): void { if (event.side === 'enter') this.#eventCache[event.id] = event; }
  query(request: QueryRequest): QueryResult {
    this.#assertOpen();
    const cacheKey = stableJson(request);
    const cached = this.#queryCache.get(cacheKey);
    if (cached) return cached;
    const types = querySubscriptions(request);
    const nodes = types.length ? this.next(types, undefined, undefined, false).events.map(toNodeView) : [];
    const globals: QueryResult['globals'] = {};
    for (const fact of this.#binding().queryGlobals((request.globals ?? []).map(query => query.name))) {
      globals[fact.name] = { references: fact.references.map(reference => ({ id: reference.id, type: 'Identifier', start: reference.start, end: reference.end })) };
    }
    const constants: QueryResult['constants'] = {};
    for (const id of request.constants ?? []) {
      const node = nodes.find(candidate => candidate.id === id);
      constants[id] = node?.value == null ? null : parseScalar(String(node.value));
    }
    const result = {
      globals,
      imports: request.imports ? nodes.filter(node => node.type === 'ImportDeclaration') : [],
      exports: request.exports ? nodes.filter(node => node.type.startsWith('Export')) : [],
      constants,
      calls: Object.fromEntries((request.calls ?? []).map(call => [call.callee, nodes.filter(node => node.type === 'CallExpression' && node.calleeName === call.callee && (!call.globalOnly || node.calleeGlobal === true) && (!call.staticArguments || typeof node.staticArgument === 'string'))])),
      captures: Object.fromEntries((request.captures ?? []).map(capture => {
        const fn = nodes.find(node => node.id === capture.functionId);
        const scopeParents = new Map(nodes.map(node => [node.scopeId, node.scopeParentId == null ? null : Number(node.scopeParentId)]));
        const scopeContains = (ancestor: number, child: number) => { let scope: number | null | undefined = child; while (scope != null) { if (scope === ancestor) return true; scope = scopeParents.get(scope); } return false; };
        const references = fn ? nodes.filter(node => node.type === 'Identifier' && node.start >= fn.start && node.end <= fn.end && node.binding !== true && node.global !== true && typeof node.bindingScopeId === 'number' && scopeContains(fn.scopeId, node.scopeId) && node.bindingScopeId !== fn.scopeId && !scopeContains(fn.scopeId, node.bindingScopeId)).map(summary) : [];
        return [capture.functionId, references];
      })),
      bindings: (request.bindings ?? []).flatMap(binding => {
        const identifiers = nodes.filter(node => node.type === 'Identifier');
        const declarations = identifiers.filter(node => node.binding === true && (binding.name == null || node.name === binding.name) && (binding.scopeId == null || node.scopeId === binding.scopeId));
        return declarations.map(declaration => ({
          name: String(declaration.name),
          scopeId: declaration.scopeId,
          declaration: summary(declaration),
          references: identifiers.filter(node => node.binding !== true && node.bindingScopeId === declaration.scopeId && node.name === declaration.name && (!binding.reads || node.read === true) && (!binding.writes || node.write === true)),
        }));
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
  event(nodeId: number): NativeEvent | undefined { this.#assertOpen(); const cached = this.#eventCache[nodeId]; if (cached) return cached; const event = this.#binding().inspect([nodeId])[0]; if (event) this.#eventCache[nodeId] = event; return event; }
  identifierEvents(): NativeEvent[] { this.#assertOpen(); return this.#identifiersCache ??= this.next(['Identifier'], undefined, undefined, false).events; }
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
      const subscriptions = new Set<string>();
      const materializationSubscriptions = new Set<string>();
      const plans = new Map<NativePlugin<any, any>, PluginPlan>();
      for (const plugin of phase.plugins) {
        if (plugin.apiVersion !== 1) throw new Error(`${plugin.name}: unsupported API version`);
        const prepareSubscriptions = new Set<string>();
        const plan = plugin.prepare?.({ filename, options, parser, sourceHints: sourceHints(phaseSource), subscribe: (...types) => types.forEach(type => prepareSubscriptions.add(type)) }, plugin.options as any) ?? {};
        const merged = { ...plan, subscriptions: [...(plan.subscriptions ?? []), ...prepareSubscriptions, ...visitorSubscriptions(plugin.visitor)] };
        plans.set(plugin, merged);
      }
      const activePlugins = phase.plugins.filter(plugin => !plans.get(plugin)?.phases?.length || plans.get(plugin)!.phases!.includes(phase.name));
      for (const plugin of activePlugins) {
        plans.get(plugin)!.subscriptions!.forEach(type => { subscriptions.add(type); materializationSubscriptions.add(type); });
        for (const query of plans.get(plugin)!.queries ?? []) querySubscriptions(query).forEach(type => materializationSubscriptions.add(type));
      }
      if (subscriptions.has('*')) {
        if (!options.allowBroadVisitors) throw new Bailout('broad-catch-all-visitor');
        diagnostics.push({ code: 'broad-visitor', message: 'Catch-all visitor disables the optimized subscription path.', phase: phase.name });
      }
      const fieldRequests: Record<string, string[]> = {};
      for (const plugin of activePlugins) for (const [type, fields] of Object.entries(plans.get(plugin)?.fields ?? {})) fieldRequests[type] = [...new Set([...(fieldRequests[type] ?? []), ...fields])];
      const session = new NativeTransformSession(phaseSource, filename, options, [...materializationSubscriptions]);
      totals.sessionOpenMs += session.openMs;
      openSession = session;
      const batch = session.nextPacked([...subscriptions], undefined, fieldRequests, activePlugins.some(plugin => visitorHasExit(plugin.visitor)));
      addTimings(totals, batch.timings);
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

function createDispatcher(session: NativeTransformSession, phase: PipelinePhase, plans: Map<NativePlugin<any, any>, PluginPlan>, batch: PackedEventBatch, edits: EditCommand[], metadata: Record<string, unknown>, diagnostics: Diagnostic[]) {
  let order = 0; let stopAll = false; let currentSequence = -1;
  let visitorId = 0;
  const visitorIds = new WeakMap<object, number>();
  const activeTraversals = new Set<string>();
  const contexts = new Map<NativePlugin<any, any>, { context: PluginContext; state: any; stopped: boolean; skipped: { start: number; end: number }[]; delivered: Set<number> }>();
  const metadataOwners = new Map<string, string>();
  for (const plugin of phase.plugins) for (const key of plans.get(plugin)?.metadataWrites ?? []) {
    const owner = metadataOwners.get(key);
    if (owner && owner !== plugin.name) throw new Error(`metadata key ${key} is owned by both ${owner} and ${plugin.name}`);
    metadataOwners.set(key, plugin.name);
  }
  for (const plugin of phase.plugins) {
    const allowedMetadata = new Set(plans.get(plugin)?.metadataWrites ?? []);
    const entry = { state: undefined, stopped: false, skipped: [] as { start: number; end: number }[], delivered: new Set<number>(), context: undefined as unknown as PluginContext };
    const context: PluginContext = {
      filename: session.filename, phase: phase.name, source: session.source,
      metadata: { set(key, value) { if (!allowedMetadata.has(key)) throw new Error(`${plugin.name}: undeclared metadata key ${key}`); metadata[key] = value; }, get: key => metadata[key] },
      query: request => session.query(request), inspect: requests => session.inspect(requests),
      diagnostic: diagnostic => diagnostics.push({ ...diagnostic, plugin: plugin.name, phase: phase.name }),
      unsupported: reason => { throw new Bailout(`${plugin.name}:${reason}`); },
      stopAll: () => { stopAll = true; },
      subscribeRemaining: (...types) => replay(session.next(expandSubscriptions(types), undefined, undefined, visitorHasExit(plugin.visitor)).events.filter(event => event.sequence > currentSequence), plugin, entry, context),
      revisitProgram: (visitor, state) => replayCustom(session.next(visitorSubscriptions(visitor), undefined, undefined, visitorHasExit(visitor)).events, visitor, state, context),
      code: codeFactory,
      editor: makeEditor(session, edits, plugin.name, () => order++),
    };
    entry.context = context; contexts.set(plugin, entry);
  }
  const replay = (events: NativeEvent[], plugin: NativePlugin<any, any>, entry: ReturnType<typeof contexts.get> & {}, context: PluginContext) => {
    for (const event of events) dispatchOne(event, plugin, entry, context);
  };
  const createPathRuntime = (plugin: NativePlugin<any, any>, entry: NonNullable<ReturnType<typeof contexts.get>>, context: PluginContext): PathRuntime => {
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
      widen(target, types, scopeOnly) { replay(session.next(expandSubscriptions(types), scopeOnly ? undefined : { start: target.start, end: target.end }, undefined, visitorHasExit(plugin.visitor)).events.filter(candidate => candidate.sequence > target.sequence && (!scopeOnly || candidate.scopeId === target.scopeId)), plugin, entry, context); },
      parent(_target, parentId) { const parent = session.event(parentId); return parent ? makePath(runtime, parent) : null; },
    };
    return runtime;
  };
  const dispatchOne = (event: NativeEvent, plugin: NativePlugin<any, any>, entry: NonNullable<ReturnType<typeof contexts.get>>, context: PluginContext, override?: Visitor<any>, overrideState?: any) => {
    const deliveryKey = event.id * 2 + Number(event.side === 'exit');
    if (!override && entry.delivered.has(deliveryKey)) return;
    if (entry.stopped || stopAll || entry.skipped.some(range => event.start > range.start && event.end <= range.end)) return;
    const visitor = override ?? plugin.visitor ?? {};
    const handlers = matchingHandlers(visitor, event.type);
    for (const handler of event.side === 'exit' ? [...handlers].reverse() : handlers) {
      const callback = typeof handler === 'function' ? (event.side === 'enter' ? handler : undefined) : handler[event.side];
      if (!callback) continue;
      const runtime = override ? createPathRuntime(plugin, entry, context) : ((entry as typeof entry & { pathRuntime?: PathRuntime }).pathRuntime ??= createPathRuntime(plugin, entry, context));
      const path = makePath(runtime, event);
      currentSequence = event.sequence;
      callback(path, override ? overrideState : entry.state);
      if (!override) entry.delivered.add(deliveryKey);
    }
  };
  const replayCustom = (events: NativeEvent[], visitor: Visitor<any>, state: any, context: PluginContext) => {
    const synthetic = { name: 'nested', apiVersion: 1 as const, visitor };
    const entry = { context, state, stopped: false, skipped: [] as { start: number; end: number }[], delivered: new Set<number>() };
    for (const event of events) dispatchOne(event, synthetic, entry, context, visitor, state);
  };
  return { contexts, run() { forEachDispatchEvent(batch, event => { session.cacheEvent(event); const ordered = event.side === 'exit' ? [...phase.plugins].reverse() : phase.plugins; for (const plugin of ordered) dispatchOne(event, plugin, contexts.get(plugin)!, contexts.get(plugin)!.context); }); } };
}

type PathState = { stopped: boolean; skipped: { start: number; end: number }[] };
type PathRuntime = { session: NativeTransformSession; context: PluginContext; edits: EditCommand[]; owner: string; nextOrder: () => number; state: PathState; nested: (target: NativeEvent, visitor: Visitor<any>, value: any) => void; widen: (target: NativeEvent, types: string[], scopeOnly: boolean) => void; parent: (target: NativeEvent, id: number) => NativeNodePath | null };
function makePath(runtime: PathRuntime, event: NativeEvent): NativeNodePath { return new NodePathImpl(runtime, event); }

class NodePathImpl implements NativeNodePath {
  readonly node: NodeView;
  readonly parent: NodeSummary | null;
  #scope?: NativeScope;
  constructor(readonly runtime: PathRuntime, readonly event: NativeEvent) {
    this.node = toNodeView(event);
    this.parent = event.parentId == null ? null : { id: event.parentId, type: event.parentType! };
  }
  get context(): PluginContext { return this.runtime.context; }
  get parentPath(): NativeNodePath | null { return this.event.parentId == null ? null : this.runtime.parent(this.event, this.event.parentId); }
  get scope(): NativeScope { return this.#scope ??= makeScope(this.runtime.session, this.event.scopeId, this.event.scopeParentId ?? null); }
  getSource(): string { return this.runtime.session.source.slice(this.event.start, this.event.end); }
  getLocation(): SourceLocation { return location(this.runtime.session.source, this.event.start, this.event.end); }
  is<TType extends string>(type: TType): this is NativeNodePath<NodeOfType<TType>> { return type === this.event.type; }
  findParent(predicate: (path: NativeNodePath) => boolean): NativeNodePath | null { let parent = this.parentPath; while (parent) { if (predicate(parent)) return parent; parent = parent.parentPath; } return null; }
  getFunctionParent(): NativeNodePath | null { return this.findParent(parent => alias('Function', parent.node.type)); }
  getProgramParent(): NativeNodePath | null { return this.findParent(parent => parent.node.type === 'Program'); }
  #edit(kind: EditKind, content?: string | CodeFragment): void { this.runtime.edits.push({ kind, start: this.event.start, end: this.event.end, content: typeof content === 'string' ? content : content?.code, mapping: typeof content === 'string' ? 'Sourceless' : mappingPolicy(content?.mapping), names: typeof content === 'string' ? undefined : content?.names ? [...content.names] : undefined, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  replaceWith(code: string | CodeFragment): void { this.#edit('Replace', code); }
  update(code: string | CodeFragment): void { this.#edit('Replace', code); }
  overwrite(code: string | CodeFragment): void { this.#edit('Replace', code); }
  remove(): void { this.#edit('Remove'); }
  insertBefore(content: string): void { this.runtime.edits.push({ kind: 'PrependRight', start: this.event.start, end: this.event.start, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
  insertAfter(content: string): void { this.runtime.edits.push({ kind: 'AppendLeft', start: this.event.end, end: this.event.end, content, owner: this.runtime.owner, order: this.runtime.nextOrder() }); }
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
const matchingHandlerCache = new WeakMap<object, Map<string, VisitorHandler<any>[]>>();
const visitorSubscriptionsCache = new WeakMap<object, string[]>();
const visitorExitCache = new WeakMap<object, boolean>();
function matchingHandlers(visitor: Visitor<any>, type: string): VisitorHandler<any>[] {
  let cache = matchingHandlerCache.get(visitor);
  if (!cache) { cache = new Map(); matchingHandlerCache.set(visitor, cache); }
  const cached = cache.get(type);
  if (cached) return cached;
  const handlers = Object.entries(visitor).filter(([key, value]) => value && key.split('|').some(part => part === type || alias(part, type))).map(([, value]) => value!);
  cache.set(type, handlers);
  return handlers;
}
function forEachDispatchEvent(batch: PackedEventBatch, callback: (event: NativeEvent) => void): void {
  const words = new Uint32Array(batch.data.buffer, batch.data.byteOffset, batch.data.byteLength / 4);
  let offset = 0;
  for (let index = 0; index < batch.emittedCount; index++) {
    const sequence = words[offset++];
    const side = words[offset++] === 0 ? 'enter' : 'exit';
    const id = words[offset++];
    const type = decodeTag(words[offset++], NODE_TYPES, batch.strings);
    const start = words[offset++];
    const end = words[offset++];
    const rawParentId = batch.includeParent === false ? 0xffffffff : words[offset++];
    const rawParentType = batch.includeParent === false ? 0xffffffff : words[offset++];
    const scopeId = batch.includeScope === false ? 0 : words[offset++];
    const rawScopeParentId = batch.includeScope === false ? 0xffffffff : words[offset++];
    const fieldCount = words[offset++];
    const event: NativeEvent = { sequence, side, id, type, start, end, parentId: rawParentId === 0xffffffff ? undefined : rawParentId, parentType: rawParentType === 0xffffffff ? undefined : decodeTag(rawParentType, NODE_TYPES, batch.strings), scopeId, scopeParentId: rawScopeParentId === 0xffffffff ? undefined : rawScopeParentId, fields: [] };
    const node = event as NativeEvent & Record<string, unknown>;
    for (let field = 0; field < fieldCount; field++) {
      const key = decodeTag(words[offset++], FIELD_KEYS, batch.strings);
      const value = decodeValue(words[offset++], batch.strings);
      node[key] = typeof value === 'string' && !(key === 'value' && type === 'StringLiteral') ? parseScalar(value) : value;
    }
    callback(event);
  }
}
function decodePackedEnvelope(buffer: Buffer): PackedEventBatch {
  const shapeNodeCount = buffer.readUInt32LE(0);
  const nodeCount = shapeNodeCount & 0x3fffffff;
  const emittedCount = buffer.readUInt32LE(4);
  const stringCount = buffer.readUInt32LE(8);
  const wordsOffset = buffer.readUInt32LE(12);
  const timings = { parseMs: buffer.readDoubleLE(16), semanticMs: buffer.readDoubleLE(24), traversalMs: buffer.readDoubleLE(32), renderAndMapMs: buffer.readDoubleLE(40) };
  const strings = new Array<string>(stringCount);
  let offset = 48;
  for (let index = 0; index < stringCount; index++) {
    const length = buffer.readUInt32LE(offset); offset += 4;
    strings[index] = buffer.toString('utf8', offset, offset + length);
    offset = (offset + length + 3) & ~3;
  }
  return { data: buffer.subarray(wordsOffset), strings, nodeCount, emittedCount, timings, includeParent: (shapeNodeCount & 0x80000000) !== 0, includeScope: (shapeNodeCount & 0x40000000) !== 0 };
}
function decodeEventBatch(batch: { data: Buffer; strings: string[]; nodeCount: number; emittedCount: number; timings: EventBatch['timings'] }): EventBatch {
  const events: NativeEvent[] = new Array(batch.emittedCount);
  let offset = 0;
  for (let index = 0; index < events.length; index++) {
    const sequence = batch.data.readUInt32LE(offset); offset += 4;
    const side = batch.data.readUInt32LE(offset) === 0 ? 'enter' : 'exit'; offset += 4;
    const id = batch.data.readUInt32LE(offset); offset += 4;
    const type = decodeTag(batch.data.readUInt32LE(offset), NODE_TYPES, batch.strings); offset += 4;
    const start = batch.data.readUInt32LE(offset); offset += 4;
    const end = batch.data.readUInt32LE(offset); offset += 4;
    const rawParentId = batch.data.readUInt32LE(offset); offset += 4;
    const rawParentType = batch.data.readUInt32LE(offset); offset += 4;
    const scopeId = batch.data.readUInt32LE(offset); offset += 4;
    const rawScopeParentId = batch.data.readUInt32LE(offset); offset += 4;
    const fieldCount = batch.data.readUInt32LE(offset); offset += 4;
    const fields = new Array<{ key: string; value: string | number | boolean }>(fieldCount);
    for (let field = 0; field < fieldCount; field++) {
      fields[field] = { key: decodeTag(batch.data.readUInt32LE(offset), FIELD_KEYS, batch.strings), value: decodeValue(batch.data.readUInt32LE(offset + 4), batch.strings) };
      offset += 8;
    }
    events[index] = { sequence, side, id, type, start, end, parentId: rawParentId === 0xffffffff ? undefined : rawParentId, parentType: rawParentType === 0xffffffff ? undefined : decodeTag(rawParentType, NODE_TYPES, batch.strings), scopeId, scopeParentId: rawScopeParentId === 0xffffffff ? undefined : rawScopeParentId, fields };
  }
  return { events, nodeCount: batch.nodeCount, emittedCount: batch.emittedCount, timings: batch.timings };
}
function packEdits(edits: readonly EditCommand[]): Buffer {
  const strings: string[] = []; const words: number[] = [];
  const stringId = (value: string): number => { const id = strings.length; strings.push(value); return id; };
  for (let index = 0; index < edits.length; index++) { const edit = edits[index]; const names = edit.names ?? []; words.push(EDIT_KINDS[edit.kind], edit.start, edit.end, edit.content == null ? 0xffffffff : stringId(edit.content), EDIT_MAPPINGS[edit.mapping ?? 'Sourceless'], edit.order ?? index, names.length); for (const name of names) words.push(stringId(name)); }
  const encoded = strings.map(value => Buffer.from(value));
  const stringsSize = encoded.reduce((size, value) => size + 4 + value.length + ((4 - value.length % 4) % 4), 0);
  const wordsOffset = 8 + stringsSize;
  const data = Buffer.allocUnsafe(wordsOffset + words.length * 4);
  data.writeUInt32LE(strings.length, 0); data.writeUInt32LE(wordsOffset, 4);
  let offset = 8;
  for (const value of encoded) { data.writeUInt32LE(value.length, offset); offset += 4; value.copy(data, offset); offset = (offset + value.length + 3) & ~3; }
  for (let index = 0; index < words.length; index++) data.writeUInt32LE(words[index] >>> 0, wordsOffset + index * 4);
  return data;
}
function packFieldRequests(fields?: Readonly<Record<string, readonly string[]>>): Buffer | undefined {
  if (!fields) return undefined;
  const words: number[] = [];
  for (const [nodeType, requested] of Object.entries(fields)) {
    const typeId = NODE_TYPE_IDS.get(nodeType);
    if (typeId == null) continue;
    const fieldIds = requested.map(field => FIELD_KEYS.indexOf(field as typeof FIELD_KEYS[number])).filter(id => id > 0);
    words.push(typeId, fieldIds.length, ...fieldIds);
  }
  const data = Buffer.allocUnsafe(words.length * 4);
  for (let index = 0; index < words.length; index++) data.writeUInt32LE(words[index], index * 4);
  return data;
}
function decodeTag(tag: number, known: readonly string[], strings: string[]): string { return tag & 0x80000000 ? strings[tag & 0x7fffffff] : known[tag]; }
function decodeValue(word: number, strings: string[]): string | number | boolean { if (word & 0x80000000) return (word & 1) === 1; if (word & 0x40000000) return word & 0x3fffffff; return strings[word]; }
function alias(key: string, type: string): boolean { return (key === 'Function' && (type === 'Function' || type === 'ArrowFunctionExpression' || type.endsWith('FunctionDeclaration') || type.endsWith('FunctionExpression'))) || (key === 'Statement' && type.endsWith('Statement')) || (key === 'Expression' && (type.endsWith('Expression') || ['Identifier', 'StringLiteral', 'NumericLiteral', 'BooleanLiteral', 'BigIntLiteral', 'RegExpLiteral', 'NullLiteral', 'TemplateLiteral'].includes(type))) || (key === 'MemberExpression' && ['StaticMemberExpression', 'ComputedMemberExpression', 'PrivateFieldExpression'].includes(type)) || key === '*'; }
function toNodeView(event: NativeEvent): NodeView { if (event.fields.length === 0) return event as unknown as NodeView; const node: Record<string, unknown> = { id: event.id, type: event.type, start: event.start, end: event.end, scopeId: event.scopeId, scopeParentId: event.scopeParentId }; for (const field of event.fields) node[field.key] = typeof field.value === 'string' && !(field.key === 'value' && event.type === 'StringLiteral') ? parseScalar(field.value) : field.value; return node as NodeView; }
function parseScalar(value: string): string | number | boolean { if (value === 'true') return true; if (value === 'false') return false; const number = Number(value); return value !== '' && Number.isFinite(number) ? number : value; }
function summary(node: NodeView): NodeSummary { return { id: node.id, type: node.type }; }
function array(value: string | readonly string[]): string[] { return typeof value === 'string' ? [value] : [...value]; }
function expandSubscriptions(values: readonly string[]): string[] { return [...new Set(values.flatMap(value => value.split('|')))]; }
function visitorSubscriptions(visitor?: Visitor<any>): string[] {
  if (!visitor) return [];
  const cached = visitorSubscriptionsCache.get(visitor); if (cached) return cached;
  const subscriptions = expandSubscriptions(Object.keys(visitor)); visitorSubscriptionsCache.set(visitor, subscriptions); return subscriptions;
}
function visitorHasExit(visitor?: Visitor<any>): boolean {
  if (!visitor) return false;
  const cached = visitorExitCache.get(visitor); if (cached != null) return cached;
  const hasExit = Object.values(visitor).some(handler => typeof handler === 'object' && handler?.exit != null); visitorExitCache.set(visitor, hasExit); return hasExit;
}
function querySubscriptions(request: QueryRequest): string[] { const types: string[] = []; if (request.globals?.length || request.bindings?.length) types.push('Identifier'); if (request.imports) types.push('ImportDeclaration', 'ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier'); if (request.exports) types.push('ExportNamedDeclaration', 'ExportDefaultDeclaration', 'ExportAllDeclaration', 'ExportSpecifier'); if (request.constants?.length) types.push('StringLiteral', 'NumericLiteral', 'BooleanLiteral'); if (request.calls?.length) types.push('CallExpression'); if (request.captures?.length) types.push('Function', 'Identifier'); return types; }
function mappingPolicy(value?: CodeFragment['mapping']): EditCommand['mapping'] { return ({ 'sourceless': 'Sourceless', 'anchor-start': 'AnchorStart', 'anchor-boundaries': 'AnchorBoundaries', identity: 'Identity' } as const)[value ?? 'sourceless']; }
function makeScope(session: NativeTransformSession, id: number, parentId: number | null): NativeScope {
  const identifierEvents = () => session.identifierEvents();
  const scopeChain = () => { const events = identifierEvents(); const parents = new Map(events.map(event => [event.scopeId, event.scopeParentId ?? null])); const ids = []; let scope: number | null = id; while (scope != null) { ids.push(scope); scope = parents.get(scope) ?? null; } return { events, ids }; };
  return {
    id, parentId,
    hasBinding: name => { const { events, ids } = scopeChain(); return events.some(event => ids.includes(event.scopeId) && toNodeView(event).name === name && toNodeView(event).binding === true); },
    hasGlobal: name => session.query({ globals: [{ name }] }).globals[name].references.length > 0,
    getBinding(name) { if (this.hasBinding(name)) return { name, global: false }; if (this.hasGlobal(name)) return { name, global: true }; return null; },
    generateUid: name => session.generateUid(name),
  };
}
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
const codeFactory: CodeFactory = { identifier(name) { if (!/^[$A-Z_a-z][$\w]*$/.test(name)) throw new Error(`Invalid identifier: ${name}`); return { code: name, mapping: 'sourceless' }; }, stringLiteral: value => ({ code: JSON.stringify(value), mapping: 'sourceless' }), template(parts, ...values) { return { code: parts.reduce((code, part, index) => code + part + (index < values.length ? typeof values[index] === 'string' ? values[index] : values[index].code : ''), ''), mapping: 'sourceless' }; }, parseExpression(code, parserMode) { native.validateExpression(code, parserMode === 'auto' ? undefined : parserMode); return { code, mapping: 'anchor-boundaries' }; } };
function stableJson(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`; if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(',')}}`; return JSON.stringify(value); }

function makeEditor(session: NativeTransformSession, edits: EditCommand[], owner: string, nextOrder: () => number): NativeEditor {
  const source = session.source;
  const push = (kind: EditKind, start: number, end: number, content?: string) => edits.push({ kind, start, end, content, owner, order: nextOrder() });
  const leading = () => source.length - source.trimStart().length;
  const trailing = () => source.length - source.trimEnd().length;
  return {
    supports: capability => ['append', 'prepend', 'update', 'overwrite', 'remove', 'move', 'reset', 'indent', 'trim', 'addSourceMapLocation', 'replace', 'replaceAll'].includes(capability),
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
