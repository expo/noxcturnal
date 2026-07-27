import { parserFilename } from '../adapters/classification.js';
import { NODE_TYPE_IDS, NODE_TYPES } from '../generated/event-schema.js';
import { native, type NativeIndexedSessionBinding } from '../native/binding.js';
import { stableJson } from '../pipeline/cache-key.js';
import {
  decodeEventBatch,
  decodePackedEnvelope,
  decodeRoutedEnvelope,
  type RoutedEventBatch,
} from '../protocol/events.js';
import type {
  EditCommand,
  FunctionMap,
  InspectRequest,
  NativeEvent,
  NodeSummary,
  NodeView,
  QueryRequest,
  QueryResult,
  SourceLocation,
  TransformOptions,
} from '../types.js';
import { commitWithDedupe } from './editor.js';
import { adaptBindingFact, toNodeView } from './node-utils.js';
import { alias, querySubscriptions } from '../pipeline/route-utils.js';

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
  #nativeCrossings = 0;
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
      if (options.debugPerformance) this.#nativeCrossings++;
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
  get nativeCrossingCount(): number {
    return this.#nativeCrossings;
  }
  takeFunctionMap(): FunctionMap | null {
    if (this.options.debugPerformance && this.#native) this.#nativeCrossings++;
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
  /** Pre-size the event cache to the parse's node count: scattered id stores into a
   * short array degrade to dictionary elements in V8; a packed array stays fast. */
  reserveEventCache(nodeCount: number): void {
    if (this.#eventCache.length < nodeCount) {
      const previous = this.#eventCache;
      this.#eventCache = new Array<NativeEvent | undefined>(nodeCount).fill(undefined);
      for (let id = 0; id < previous.length; id++)
        if (previous[id] !== undefined) this.#eventCache[id] = previous[id];
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
    if (this.options.debugPerformance) this.#nativeCrossings++;
    this.#assertOpen();
    return (this.#native ??= new native.NativeIndexedSession(this.source, this.#nativeFilename));
  }
}
