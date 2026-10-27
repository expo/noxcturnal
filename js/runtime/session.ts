import { nativeManifest } from '../native/manifest';
import type { ChildPrefetchPlan } from '../pipeline/types';
import { nativeChildPrefetch } from '../native/child-prefetch';
import { decodeConstant, decodeString } from '../protocol/value-transport';
import { parserFilename } from '../adapters/classification';
import { SCALAR_FIELDS, NODE_TYPES } from '../generated/event-schema';
import {
  native,
  type NativeIndexedSessionBinding,
  type NativeParsedSourceBinding,
} from '../native/binding';
import {
  decodeEventBatch,
  decodePackedEnvelope,
  decodeRoutedEnvelope,
  type RoutedEventBatch,
} from '../protocol/events';
import type {
  EditCommand,
  InspectRequest,
  NativeEvent,
  NodeView,
  QueryRequest,
  QueryResult,
  SemanticReferenceView,
  SourceLocation,
  TransformOptions,
} from '../types';
import { commitWithDedupe } from './editor';
import { adaptBindingFact, toNodeView } from './node-utils';
import { NodeCache } from './node-cache';
import { alias, querySubscriptions } from '../pipeline/route-utils';

// Summaries carry no scalar payload to merge when a routed event replaces them.
const SUMMARY_FIELDS: NativeEvent['fields'] = [];
const NO_STOPPED_PLUGINS = new Uint8Array(0);

interface ChildState {
  // Interleaved child id / role id words, kept in native traversal order.
  edges: Uint32Array | number[];
  offset: number;
  count: number;
  recursive?: boolean;
  singular?: Map<number, number>;
  // Used only by the explicit routed-child seeding path, which can replay nodes.
  members?: Set<number>;
}

export class NativeTransformSession {
  #closed = false;
  #sourceText: InstanceType<typeof native.NativeSourceText> | null = null;
  #eventCache = new NodeCache<NativeEvent>();
  #queryCache = new WeakMap<QueryRequest, { request: QueryRequest; result: QueryResult }>();
  #globalReferencesCache = new Map<string, SemanticReferenceView[] | boolean>();
  #globalBindingReferencesCache = new Map<string, SemanticReferenceView[]>();
  #childrenCache = new Map<number, ChildState>();
  #prefetchedChildTypes: Set<string> | null = null;
  #native: NativeIndexedSessionBinding | null = null;
  #nativeFilename: string;
  #scopeParents: Uint32Array | null = null;
  #traversalIntervals: Uint32Array | null = null;
  #scopeMetadata: Uint32Array | null = null;
  #linePrefixPage = -1;
  #linePrefixIntervals: Uint32Array | undefined;
  #programBodyOffsets: readonly [number, number, boolean, boolean, boolean] | null = null;
  #bindingIndex: { scopes: Uint32Array; names: Map<string, number | Uint32Array> } | null = null;
  #bindingFacts = new Map<number, QueryResult['bindings'][number]>();
  constructor(
    readonly source: string,
    readonly filename: string,
    options: TransformOptions = {},
    retentionManifest?: Buffer,
    initialManifest?: Buffer,
    buildInitialRoute = true,
    parsedSource?: NativeParsedSourceBinding,
  ) {
    this.#nativeFilename = parserFilename(filename, options.parser);
    // Without a retention plan the native session holds no state, so its
    // construction (and the source copy it takes) is deferred until something needs it.
    if (retentionManifest != null || initialManifest != null) {
      this.#native =
        parsedSource != null && retentionManifest != null && initialManifest != null
          ? parsedSource.materialize(
              nativeManifest(retentionManifest),
              nativeManifest(initialManifest),
            )
          : new native.NativeIndexedSession(
              source,
              this.#nativeFilename,
              retentionManifest == null ? undefined : nativeManifest(retentionManifest),
              initialManifest == null ? undefined : nativeManifest(initialManifest),
              buildInitialRoute,
            );
    }
  }
  get nativeMemoryBytes(): number {
    return this.#native?.memoryUsage() ?? 0;
  }
  retentionDebugSummary(): ReturnType<NativeIndexedSessionBinding['retentionDebugSummary']> {
    return this.#binding('retention.debug').retentionDebugSummary();
  }
  nextRoutedPacked(
    manifest: Buffer,
    root?: { start: number; end: number } | { id: number },
  ): RoutedEventBatch {
    this.#assertOpen();
    const coordinates = root != null && 'start' in root ? root : undefined;
    const rootId = root != null && 'id' in root ? root.id : undefined;
    const buffer = this.#binding('route.next').nextRoutedPacked(
      nativeManifest(manifest),
      coordinates?.start,
      coordinates?.end,
      rootId,
    );
    return decodeRoutedEnvelope(buffer);
  }
  traversalIntervals(): Uint32Array {
    this.#assertOpen();
    if (this.#traversalIntervals == null) {
      const data = this.#binding('traversal-intervals').traversalIntervalsBuffer();
      this.#traversalIntervals = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    }
    return this.#traversalIntervals;
  }
  cacheEvent(event: NativeEvent): void {
    if (event.side === 'enter') {
      const existing = this.#eventCache.get(event.id) as
        | (NativeEvent & Record<string, unknown>)
        | undefined;
      if (existing != null && existing.fields !== SUMMARY_FIELDS) {
        const target = event as NativeEvent & Record<string, unknown>;
        // Replays preserve scalar payloads, without enumerating structural
        // metadata or allocating an object-key array for every cached node.
        const fields = SCALAR_FIELDS[event.type];
        if (fields)
          for (const field of fields)
            if (Object.hasOwn(existing, field) && !(field in target))
              target[field] = existing[field];
      }
      this.#eventCache.set(event.id, event);
      if (this.#prefetchedChildTypes != null && event.parentId != null) {
        const parent = this.#eventCache.get(event.parentId);
        if (parent && this.#isPrefetchedChildType(parent.type)) {
          let children = this.#childrenCache.get(event.parentId);
          if (children == null) {
            children = { edges: [], offset: 0, count: 0 };
            this.#childrenCache.set(event.parentId, children);
          }
          let members = children.members;
          if (!members) {
            children.members = members = new Set();
            for (
              let offset = children.offset;
              offset < children.offset + children.count * 2;
              offset += 2
            )
              members.add(children.edges[offset]);
          }
          if (!members.has(event.id)) {
            members.add(event.id);
            if (children.edges instanceof Uint32Array) {
              children.edges = Array.from(
                children.edges.subarray(children.offset, children.offset + children.count * 2),
              );
              children.offset = 0;
            }
            children.edges.push(event.id, 0);
            children.count++;
            children.singular?.clear();
          }
        }
      }
    }
  }
  /** Mark child-complete ancestor types whose edges are carried by the routed
   * envelope, avoiding a synchronous native prefetch on structural access. */
  seedRetainedChildTypes(types: readonly string[]): void {
    for (const type of types) (this.#prefetchedChildTypes ??= new Set()).add(type);
  }
  #isPrefetchedChildType(parentType: string): boolean {
    if (!this.#prefetchedChildTypes) return false;
    for (const type of this.#prefetchedChildTypes)
      if (type === parentType || alias(type, parentType)) return true;
    return false;
  }
  nodeView(event: NativeEvent): NodeView {
    return toNodeView(event);
  }
  query(request: QueryRequest): QueryResult {
    this.#assertOpen();
    const cached = this.#queryCache.get(request);
    if (cached && sameQuery(request, cached.request)) return cached.result;
    const types = querySubscriptions(request);
    const nodes = types.length
      ? decodeEventBatch(
          decodePackedEnvelope(this.#binding('query.nodes').queryNodesPackedBuffer(types)),
        ).events.map(toNodeView)
      : [];
    const globals: QueryResult['globals'] = {};
    if (request.globals?.length) {
      const names = [...new Set(request.globals.map(query => query.name))];
      const references = this.#queryGlobalReferences(names);
      for (let index = 0; index < names.length; index++) {
        const name = names[index]!;
        const value = { references: references[index] };
        if (name === '__proto__')
          Object.defineProperty(globals, name, {
            value,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        else globals[name] = value;
      }
    }
    const constants: QueryResult['constants'] = {};
    if (request.constants?.length) {
      for (const id of request.constants) constants[id] = null;
      // Constant facts already carry the value; no node hydration is needed.
      for (const fact of this.#binding('query.constants').queryConstants([...request.constants]))
        constants[fact.id] = decodeConstant(fact.value);
    }
    const captureRequests = new Map<number, boolean | undefined>();
    for (const capture of request.captures ?? []) {
      if (
        captureRequests.has(capture.functionId) &&
        captureRequests.get(capture.functionId) !== capture.programBindings
      ) {
        throw new Error(
          `Conflicting programBindings filters for capture function ${capture.functionId}`,
        );
      }
      captureRequests.set(capture.functionId, capture.programBindings);
    }
    const captureIds = [...captureRequests.keys()];
    const captures: QueryResult['captures'] = Object.fromEntries(
      captureIds.map(functionId => [functionId, []]),
    );
    if (captureIds.length > 0)
      for (const capture of this.#binding('query.captures').queryCapturesBatch(
        captureIds,
        captureIds.map(functionId => {
          const filter = captureRequests.get(functionId);
          return filter === undefined ? -1 : Number(filter);
        }),
      )) {
        captures[capture.functionId] = capture.references.map(reference => ({
          id: reference.id,
          type: 'Identifier' as const,
          start: reference.start,
          end: reference.end,
          scopeId: reference.scopeId,
          parentId: reference.parentId,
          parentType: reference.parentType,
          name: reference.name,
          bindingScopeId: reference.bindingScopeId,
          read: reference.read,
          write: reference.write,
        }));
      }
    const callBatches = request.calls?.length
      ? this.#binding('query.calls').queryCallsBatch([...request.calls])
      : [];
    const result = {
      globals,
      imports: request.imports ? nodes.filter(node => node.type === 'ImportDeclaration') : [],
      exports: request.exports ? nodes.filter(node => node.type.startsWith('Export')) : [],
      constants,
      calls: Object.fromEntries(
        (request.calls ?? []).map((call, index) => [
          call.callee,
          callBatches[index]!.map(fact => ({
            id: fact.id,
            type: 'CallExpression',
            start: fact.start,
            end: fact.end,
            scopeId: fact.scopeId,
            calleeName: fact.calleeName,
            calleeGlobal: fact.calleeGlobal,
            staticArgument:
              fact.staticArgument == null ? undefined : decodeString(fact.staticArgument),
          })),
        ]),
      ),
      captures,
      bindings: (request.bindings ?? []).flatMap(binding =>
        this.#binding('query.bindings')
          .queryBindings(binding.name, binding.scopeId, binding.reads, binding.writes)
          .map(adaptBindingFact),
      ),
    };
    this.#queryCache.set(request, { request: snapshotQuery(request), result });
    return result;
  }
  inspect(requests: readonly InspectRequest[]): NodeView[] {
    const resolved = new Map<number, NodeView>();
    const missing: InspectRequest[] = [];
    for (const request of requests) {
      const cached = this.#eventCache.get(request.nodeId);
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
          this.#binding('inspect.nodes').inspectPackedBuffer(
            missing.map(request => request.nodeId),
          ),
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
  #childState(parentId: number): ChildState {
    this.#assertOpen();
    let children = this.#childrenCache.get(parentId);
    if (!children) {
      const parent = this.event(parentId);
      if (parent && this.#isPrefetchedChildType(parent.type)) {
        children = { edges: [], offset: 0, count: 0 };
        this.#childrenCache.set(parentId, children);
      } else {
        this.prefetchChildren([parentId]);
        children = this.#childrenCache.get(parentId)!;
      }
    }
    return children;
  }
  child(parentId: number, roleId: number): NativeEvent | undefined {
    const children = this.#childState(parentId);
    const { edges, offset: start, count } = children;
    // Most parents have only a handful of children. Wide parents can also have
    // singular roles beside long lists (e.g. a function body after parameters).
    // Index only requested singular roles there, avoiding repeated linear scans.
    const singular = count > 32 ? (children.singular ??= new Map()) : undefined;
    const cached = singular?.get(roleId);
    if (cached != null) return cached < 0 ? undefined : this.event(cached);
    for (let offset = start; offset < start + count * 2; offset += 2) {
      if (edges[offset + 1] !== roleId) continue;
      const nodeId = edges[offset];
      singular?.set(roleId, nodeId);
      return this.event(nodeId);
    }
    singular?.set(roleId, -1);
    return undefined;
  }
  children(parentId: number, roleId?: number): NativeEvent[] {
    const { edges, offset: start, count } = this.#childState(parentId);
    const events: NativeEvent[] = [];
    for (let offset = start; offset < start + count * 2; offset += 2) {
      if (roleId != null && edges[offset + 1] !== roleId) continue;
      const event = this.event(edges[offset]);
      if (event) events.push(event);
    }
    return events;
  }
  nodes(nodeTypes: readonly string[]): NodeView[] {
    this.#assertOpen();
    return decodeEventBatch(
      decodePackedEnvelope(this.#binding('query.nodes').queryNodesPackedBuffer([...nodeTypes])),
    ).events.map(toNodeView);
  }
  /** Hydrate the retained child graph reached from actual route deliveries in
   * one native batch, including empty parents. */
  prefetchRoutedChildren(
    batch: RoutedEventBatch,
    routes: ChildPrefetchPlan | undefined,
    states?: readonly { stopped: boolean }[],
  ): void {
    if (
      !routes ||
      (states && !routes.some(members => members.some(member => !states[member.pluginId].stopped)))
    )
      return;
    this.seedSummaries(batch.parentSummaries);
    if (batch.routeDeliveryCount === 0) return;
    // One direct-only delivery can request at most its own child graph. A
    // complete cached graph needs neither tape replay nor another native query.
    if (
      batch.nodeRecordCount === 1 &&
      routes.length === 1 &&
      routes[0].length === 1 &&
      !routes[0][0].capabilities.ancestorChildRules &&
      this.#childrenCache.get(batch.data.readUInt32LE(4))?.recursive
    )
      return;
    let stopped = NO_STOPPED_PLUGINS;
    if (states)
      for (let id = 0; id < states.length; id++)
        if (states[id].stopped) {
          if (stopped === NO_STOPPED_PLUGINS) stopped = new Uint8Array(states.length);
          stopped[id] = 1;
        }
    const flags =
      Number(batch.includeParent) |
      (Number(batch.includeScope) << 1) |
      (Number(batch.includeExit) << 2) |
      (Number(batch.includeComments) << 3) |
      (Number(batch.includeTraversal) << 4);
    const data = new Uint32Array(
      batch.data.buffer,
      batch.data.byteOffset,
      batch.data.byteLength / 4,
    );
    const plan = nativeChildPrefetch(routes);
    // The first hydration has no cached parents to filter. Keep selection and
    // packing together instead of transferring root IDs through JS and back.
    if (this.#childrenCache.size === 0) {
      const children = this.#binding('children.prefetch').childrenRoutedPackedBuffer(
        data,
        flags,
        plan,
        stopped,
      );
      if (children) this.#cacheChildBatch(children, true);
      return;
    }
    const parents = this.#binding('children.roots').routedChildRoots(data, flags, plan, stopped);
    // Keep cache filtering and recursive hydration shared with explicit requests.
    if (parents.length > 0) this.prefetchChildren(parents, true);
  }

  prefetchChildren(parentIds: readonly number[] = [], recursive = false): void {
    this.#assertOpen();
    const missing = parentIds.filter(parentId => {
      const cached = this.#childrenCache.get(parentId);
      return !cached || (recursive && !cached.recursive);
    });
    if (missing.length === 0) return;
    const nativeBatch = this.#binding('children.prefetch').childrenPackedBuffer(
      missing,
      [],
      [],
      recursive,
    );
    this.#cacheChildBatch(nativeBatch, recursive);
  }
  #cacheChildBatch(
    nativeBatch: ReturnType<NativeIndexedSessionBinding['childrenPackedBuffer']>,
    recursive: boolean,
  ): void {
    if (nativeBatch.events == null)
      throw new Error(`invalid native child batch: ${Object.keys(nativeBatch).join(',')}`);
    const batch = decodeEventBatch(decodePackedEnvelope(nativeBatch.events));
    for (const event of batch.events) this.#eventCache.set(event.id, event);
    const data = nativeBatch.edges;
    const words = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    for (let offset = 0; offset < words.length;) {
      const parentId = words[offset++];
      const count = words[offset++];
      const children: ChildState = {
        edges: words,
        offset,
        count,
        recursive,
      };
      offset += count * 2;
      this.#childrenCache.set(parentId, children);
    }
  }
  event(nodeId: number): NativeEvent | undefined {
    this.#assertOpen();
    const cached = this.#eventCache.get(nodeId);
    if (cached) return cached;
    const data = this.#binding('node.summary').nodeSummaryBuffer(nodeId);
    if (data.byteLength !== 7 * 4) return undefined;
    const words = new Uint32Array(data.buffer, data.byteOffset, 7);
    return this.#cacheSummary(nodeId, words, 0);
  }
  /** Seed the event cache from a routed envelope's parent-summary sidecar. */
  seedSummaries(entries: Uint32Array): void {
    this.#assertOpen();
    for (let offset = 0; offset < entries.length; offset += 8) {
      const nodeId = entries[offset]!;
      if (this.#eventCache.get(nodeId) === undefined)
        this.#cacheSummary(nodeId, entries, offset + 1);
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
            fields: SUMMARY_FIELDS,
          };
    if (event) this.#eventCache.set(nodeId, event);
    return event;
  }
  /** The nearest binding is selected by scope-tree position, without walking
   * parents or rebuilding a JavaScript membership set for all declarations. */
  resolveBindingScope(name: string, scopeId: number): number | null {
    const key = this.#resolveBindingKey(name, scopeId);
    return key == null ? null : Math.floor(key / 0x200000);
  }
  #resolveBindingKey(name: string, scopeId: number): number | undefined {
    this.#assertOpen();
    const index = (this.#bindingIndex ??= this.#loadBindingIndex());
    const binding = index.names.get(name);
    if (binding == null) return undefined;
    const position = index.scopes[scopeId * 2];
    if (position == null) return undefined;
    if (typeof binding === 'number') {
      const owner = Math.floor(binding / 0x200000);
      return index.scopes[owner * 2] <= position && position < index.scopes[owner * 2 + 1]
        ? binding
        : undefined;
    }
    // The transport count is redundant with the view length. Reuse its word as
    // a cursor into the last visibility interval, without another cache/index.
    // Validate both bounds so nested traversals and out-of-order lookups work.
    const count = (binding.length - 2) / 2;
    const cursor = binding[1];
    if (cursor === count) {
      if (position < binding[2]) return undefined;
    } else if (
      binding[2 + cursor * 2] <= position &&
      (cursor + 1 === count || position < binding[4 + cursor * 2])
    ) {
      const owner = binding[3 + cursor * 2];
      return owner === 0xffffffff ? undefined : owner * 0x200000 + binding[0];
    }
    let low = 0;
    let high = count;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (binding[2 + middle * 2] <= position) low = middle + 1;
      else high = middle;
    }
    binding[1] = low === 0 ? count : low - 1;
    if (low === 0) return undefined;
    const owner = binding[3 + (low - 1) * 2];
    return owner === 0xffffffff ? undefined : owner * 0x200000 + binding[0];
  }
  #loadBindingIndex(): { scopes: Uint32Array; names: Map<string, number | Uint32Array> } {
    const data = this.#binding('binding-index').bindingIndexBuffer();
    const nameCount = data.readUInt32LE(0);
    const scopeCount = data.readUInt32LE(4);
    const scopes = new Uint32Array(data.buffer, data.byteOffset + 8, scopeCount * 2);
    const names = new Map<string, number | Uint32Array>();
    let offset = 8 + scopeCount * 8;
    for (let index = 0; index < nameCount; index++) {
      const length = data.readUInt32LE(offset);
      offset += 4;
      const name = data.toString('utf8', offset, offset + length);
      offset += length + ((4 - (length % 4)) % 4);
      const nameId = data.readUInt32LE(offset);
      const count = data.readUInt32LE(offset + 4);
      if (nameId >= 0x200000) throw new Error('binding name table exceeds packed key space');
      if (count === 0) {
        names.set(name, data.readUInt32LE(offset + 8) * 0x200000 + nameId);
        offset += 12;
      } else {
        names.set(name, new Uint32Array(data.buffer, data.byteOffset + offset, 2 + count * 2));
        offset += 8 + count * 8;
      }
    }
    return { scopes, names };
  }
  bindingRenamePlan(name: string, scopeId: number) {
    return this.#binding('binding.rename').bindingRenamePlan(name, scopeId);
  }
  bindingRenameExportNames(start: number): string[] {
    return this.#binding('binding.rename.exports').bindingRenameExportNames(start);
  }
  resolveBinding(name: string, scopeId: number): QueryResult['bindings'][number] | undefined {
    const key = this.#resolveBindingKey(name, scopeId);
    if (key == null) return undefined;
    const cached = this.#bindingFacts.get(key);
    if (cached) return cached;
    const raw = this.#binding('query.bindings').queryBindings(name, Math.floor(key / 0x200000))[0];
    if (!raw) return undefined;
    const fact = adaptBindingFact(raw);
    this.#bindingFacts.set(key, fact);
    return fact;
  }
  resolveBindings(names: readonly string[], scopeId: number): QueryResult['bindings'][number][] {
    const resolved: (QueryResult['bindings'][number] | number)[] = [];
    let missing: Map<number, { name: string; scopeId: number }> | undefined;
    for (const name of names) {
      const key = this.#resolveBindingKey(name, scopeId);
      if (key == null) continue;
      const fact = this.#bindingFacts.get(key);
      resolved.push(fact ?? key);
      if (!fact) (missing ??= new Map()).set(key, { name, scopeId: Math.floor(key / 0x200000) });
    }
    if (missing) {
      const facts = this.#binding('query.bindings.batch').queryBindingsBatch([...missing.values()]);
      for (const raw of facts) {
        const fact = adaptBindingFact(raw);
        const binding = this.#bindingIndex!.names.get(fact.name)!;
        const nameId = typeof binding === 'number' ? binding % 0x200000 : binding[0];
        this.#bindingFacts.set(fact.scopeId * 0x200000 + nameId, fact);
      }
      let count = 0;
      for (const entry of resolved) {
        const fact = typeof entry === 'number' ? this.#bindingFacts.get(entry) : entry;
        if (fact) resolved[count++] = fact;
      }
      resolved.length = count;
    }
    // Keys occur only for cache misses and have now been replaced or removed.
    return resolved as QueryResult['bindings'];
  }
  globalBindingReferences(name: string): SemanticReferenceView[] {
    this.#assertOpen();
    const cached = this.#globalBindingReferencesCache.get(name);
    if (cached) return cached;
    // Semantic facts describe immutable session input, including across plugins.
    // Keep them separate from the coarse globals-query cache.
    const buffer = this.#binding('binding.globals').globalBindingReferencesBuffer(name);
    const references: SemanticReferenceView[] = [];
    // Match the native eight-word record without allocating intermediate views.
    for (let offset = 0; offset < buffer.length; offset += 32) {
      const parentId = buffer.readUInt32LE(offset + 16);
      const parentType = buffer.readUInt32LE(offset + 20);
      const parentStart = buffer.readUInt32LE(offset + 24);
      const flags = buffer.readUInt32LE(offset + 28);
      references.push({
        id: buffer.readUInt32LE(offset),
        type: 'Identifier',
        start: buffer.readUInt32LE(offset + 4),
        end: buffer.readUInt32LE(offset + 8),
        scopeId: buffer.readUInt32LE(offset + 12),
        parentId: parentId === 0xffffffff ? undefined : parentId,
        parentType: NODE_TYPES[parentType] || undefined,
        parentStart: parentStart === 0xffffffff ? undefined : parentStart,
        read: (flags & 1) !== 0,
        write: (flags & 2) !== 0,
        memberWrite: (flags & 4) !== 0,
      });
    }
    this.#globalBindingReferencesCache.set(name, references);
    return references;
  }
  hasGlobal(name: string): boolean {
    this.#assertOpen();
    const cached = this.#globalReferencesCache.get(name);
    if (cached !== undefined) return typeof cached === 'boolean' ? cached : cached.length > 0;
    const present = this.#binding('query.globals.presence').hasGlobal(name);
    this.#globalReferencesCache.set(name, present);
    return present;
  }
  globalReferences(name: string): SemanticReferenceView[] {
    const cached = this.#globalReferencesCache.get(name);
    if (Array.isArray(cached)) return cached;
    if (cached === false) {
      const references: SemanticReferenceView[] = [];
      this.#globalReferencesCache.set(name, references);
      return references;
    }
    return this.#queryGlobalReferences([name])[0];
  }
  #queryGlobalReferences(names: string[]): SemanticReferenceView[][] {
    const buffer = this.#binding('query.globals').queryGlobalsBuffer(names);
    let offset = 0;
    return names.map(name => {
      const count = buffer.readUInt32LE(offset);
      offset += 4;
      const references: SemanticReferenceView[] = [];
      for (let index = 0; index < count; index++) {
        // Coarse global queries expose identity and spans. Preserve the existing
        // view shape; richer semantic facts are supplied by binding queries.
        references.push({
          id: buffer.readUInt32LE(offset),
          type: 'Identifier',
          start: buffer.readUInt32LE(offset + 4),
          end: buffer.readUInt32LE(offset + 8),
          scopeId: undefined,
          parentId: undefined,
          parentType: undefined,
          parentStart: undefined,
          read: undefined,
          write: undefined,
          memberWrite: undefined,
        } as unknown as SemanticReferenceView);
        offset += 12;
      }
      this.#globalReferencesCache.set(name, references);
      return references;
    });
  }
  scopeParentId(scopeId: number): number | null {
    this.#assertOpen();
    const parent = this.#scopeParentTable()[scopeId];
    return parent === undefined || parent === 0xffffffff ? null : parent;
  }
  #loadScopeMetadata(): Uint32Array {
    if (this.#scopeMetadata == null) {
      const data = this.#binding('scope-metadata').scopeMetadataBuffer();
      const words = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
      const count = words[0];
      const mask = words[1];
      if (
        mask < 1 ||
        ((mask + 1) & mask) !== 0 ||
        mask < count ||
        words.length !== 3 + count * 4 + (mask + 1) * 2
      )
        throw new Error('invalid scope metadata');
      this.#scopeMetadata = words;
    }
    return this.#scopeMetadata;
  }
  ownedScopeId(nodeId: number): number | undefined {
    const words = this.#loadScopeMetadata();
    const mask = words[1];
    const base = 3 + words[0] * 4;
    // High product bits avoid clustering owners whose node IDs have regular strides.
    const first = Math.imul(nodeId, words[2]) >>> Math.clz32(mask);
    let slot = first;
    do {
      const offset = base + slot * 2;
      const owner = words[offset];
      if (owner === 0xffffffff) return undefined;
      if (owner === nodeId) return words[offset + 1];
      slot = (slot + 1) & mask;
    } while (slot !== first);
    throw new Error('invalid scope ownership index');
  }
  scopeMetadata(scopeId: number): {
    ownerId: number;
    start: number;
    end: number;
    kind: number;
  } | null {
    const words = this.#loadScopeMetadata();
    if (scopeId >= words[0]) return null;
    const offset = 3 + scopeId * 4;
    return {
      ownerId: words[offset],
      start: words[offset + 1],
      end: words[offset + 2],
      kind: words[offset + 3],
    };
  }
  programBodyOffsets(): readonly [
    prepend: number,
    append: number,
    needsEofLineBoundary: boolean,
    prependSeparator: boolean,
    appendSeparator: boolean,
  ] {
    if (this.#programBodyOffsets == null) {
      const offsets = this.#binding('program-body-offsets').programBodyOffsets();
      this.#programBodyOffsets = [
        offsets[0],
        offsets[1],
        offsets[2] === 1,
        offsets[3] === 1,
        offsets[4] === 1,
      ];
    }
    return this.#programBodyOffsets;
  }
  #scopeParentTable(): Uint32Array {
    if (this.#scopeParents == null) {
      const data = this.#binding('scope-parents').scopeParentsBuffer();
      this.#scopeParents = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    }
    return this.#scopeParents;
  }
  get sourceTextOperations(): InstanceType<typeof native.NativeSourceText> {
    this.#assertOpen();
    return (this.#sourceText ??= new native.NativeSourceText(this.source));
  }
  startsLine(offset: number): boolean {
    // Keep one 8 KiB source window. A single sparse query uses the adjacent
    // whitespace check; only a second query on the page requests interval facts.
    const page = Math.floor(offset / 4096);
    if (page !== this.#linePrefixPage) {
      const result = this.sourceTextOperations.startsLine(offset);
      this.#linePrefixPage = page;
      this.#linePrefixIntervals = undefined;
      return result;
    }
    let intervals = this.#linePrefixIntervals;
    if (!intervals) {
      const start = page * 4096;
      const data = this.sourceTextOperations.linePrefixIntervals(
        start,
        Math.min(start + 4096, this.source.length),
      );
      intervals = this.#linePrefixIntervals = new Uint32Array(
        data.buffer,
        data.byteOffset,
        data.byteLength / 4,
      );
    }
    let low = 0;
    let high = intervals.length / 2;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (intervals[middle * 2 + 1] < offset) low = middle + 1;
      else high = middle;
    }
    return low * 2 < intervals.length && intervals[low * 2] <= offset;
  }
  generateUid(name = 'temp'): string {
    this.#assertOpen();
    return (
      this.#native?.generateUid(name) ??
      this.sourceTextOperations.generateUid(name, this.#nativeFilename)
    );
  }
  sourceLocation(start: number, end: number): SourceLocation {
    const [startLine, startColumn, endLine, endColumn] = this.sourceTextOperations.locations(
      start,
      end,
    );
    return {
      start: { line: startLine!, column: startColumn! },
      end: { line: endLine!, column: endColumn! },
    };
  }
  locationOffset(position: SourceLocation['start']): number {
    return this.sourceTextOperations.locationOffset(position.line, position.column);
  }
  commit(edits: EditCommand[], mode?: string) {
    this.#assertOpen();
    // A live native session already holds this exact source; commit against it
    // rather than re-copying the whole source across the boundary. Only the
    // stateless path (no retained index) has no session to reach.
    const session = this.#native;
    return commitWithDedupe(edits, data =>
      session != null
        ? session.commitPacked(data, mode)
        : native.commitPackedBuffer(this.source, this.#nativeFilename, data, mode),
    );
  }
  close(): void {
    this.#globalBindingReferencesCache.clear();
    this.#sourceText = null;
    this.#traversalIntervals = null;
    if (!this.#closed && this.#native) {
      this.#native.close();
    }
    this.#closed = true;
  }
  #assertOpen(): void {
    if (this.#closed) throw new Error('session-closed');
  }
  #binding(_operation: string, _instrumentation = false): NativeIndexedSessionBinding {
    this.#assertOpen();
    if (this.#native == null) {
      this.#native = new native.NativeIndexedSession(this.source, this.#nativeFilename);
    }
    return this.#native;
  }
}

// Requests are mutable: compare only the small descriptor, never the source or facts.
// Copies are made on misses, so warm queries allocate nothing for cache validation.
function sameList<T>(
  left: readonly T[] | undefined,
  right: readonly T[] | undefined,
  same: (left: T, right: T) => boolean,
): boolean {
  if (left === right) return true;
  if (left === undefined || right === undefined) return false;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index++)
    if (!same(left[index], right[index])) return false;
  return true;
}
const sameGlobal: (
  a: NonNullable<QueryRequest['globals']>[number],
  b: NonNullable<QueryRequest['globals']>[number],
) => boolean = (a, b) => a?.name === b?.name && a?.references === b?.references;
const sameCall: (
  a: NonNullable<QueryRequest['calls']>[number],
  b: NonNullable<QueryRequest['calls']>[number],
) => boolean = (a, b) =>
  a?.callee === b?.callee &&
  a?.globalOnly === b?.globalOnly &&
  a?.staticArguments === b?.staticArguments;
const sameCapture: (
  a: NonNullable<QueryRequest['captures']>[number],
  b: NonNullable<QueryRequest['captures']>[number],
) => boolean = (a, b) =>
  a?.functionId === b?.functionId && a?.programBindings === b?.programBindings;
const sameBinding: (
  a: NonNullable<QueryRequest['bindings']>[number],
  b: NonNullable<QueryRequest['bindings']>[number],
) => boolean = (a, b) =>
  a?.name === b?.name &&
  a?.scopeId === b?.scopeId &&
  a?.reads === b?.reads &&
  a?.writes === b?.writes;
function sameQuery(left: QueryRequest, right: QueryRequest): boolean {
  return (
    left.imports === right.imports &&
    left.exports === right.exports &&
    sameList(left.constants, right.constants, Object.is) &&
    sameList(left.globals, right.globals, sameGlobal) &&
    sameList(left.calls, right.calls, sameCall) &&
    sameList(left.captures, right.captures, sameCapture) &&
    sameList(left.bindings, right.bindings, sameBinding)
  );
}
function snapshotQuery(request: QueryRequest): QueryRequest {
  return {
    ...request,
    constants: request.constants?.slice(),
    globals: request.globals?.map(entry => ({ ...entry })),
    calls: request.calls?.map(entry => ({ ...entry })),
    captures: request.captures?.map(entry => ({ ...entry })),
    bindings: request.bindings?.map(entry => ({ ...entry })),
  };
}
