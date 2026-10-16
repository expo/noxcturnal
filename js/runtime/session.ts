import type { RouteCapabilities } from '../pipeline/types';
import { decodeConstant, decodeString } from '../protocol/value-transport';
import { parserFilename } from '../adapters/classification';
import { CHILD_ROLES, FIELD_KEY_IDS, NODE_TYPE_IDS, NODE_TYPES } from '../generated/event-schema';
import {
  native,
  type NativeIndexedSessionBinding,
  type NativeParsedSourceBinding,
} from '../native/binding';
import {
  dispatchRoutedEvents,
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
import { alias, querySubscriptions } from '../pipeline/route-utils';

export class NativeTransformSession {
  #closed = false;
  #sourceText: InstanceType<typeof native.NativeSourceText> | null = null;
  #eventCache: (NativeEvent | undefined)[] = [];
  #queryCache = new WeakMap<QueryRequest, { request: QueryRequest; result: QueryResult }>();
  #globalReferencesCache = new Map<string, SemanticReferenceView[]>();
  #globalBindingReferencesCache = new Map<string, SemanticReferenceView[]>();
  #childrenCache = new Map<number, number[]>();
  #childIdsCache = new Map<number, Set<number>>();
  #childRoleCache = new Map<number, Map<number, number[]>>();
  #prefetchedChildTypes = new Set<string>();
  #native: NativeIndexedSessionBinding | null = null;
  #nativeFilename: string;
  #scopeParents: Uint32Array | null = null;
  #scopeMetadata: Uint32Array | null = null;
  #ownedScopes = new Map<number, number>();
  #linePrefixPage = -1;
  #linePrefixIntervals: Uint32Array | undefined;
  #programBodyOffsets: readonly [number, number, boolean, boolean, boolean] | null = null;
  #bindingIndex: { nameIds: Map<string, number>; keys: Set<number> } | null = null;
  #bindingsByScope = new Map<number, Map<string, QueryResult['bindings'][number]>>();
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
          ? parsedSource.materialize(retentionManifest, initialManifest)
          : new native.NativeIndexedSession(
              source,
              this.#nativeFilename,
              retentionManifest,
              initialManifest,
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
  nextRoutedPacked(manifest: Buffer, root?: { start: number; end: number }): RoutedEventBatch {
    this.#assertOpen();
    const buffer = this.#binding('route.next').nextRoutedPacked(manifest, root?.start, root?.end);
    return decodeRoutedEnvelope(buffer);
  }
  cacheEvent(event: NativeEvent): void {
    if (event.side === 'enter') {
      const existing = this.#eventCache[event.id] as
        | (NativeEvent & Record<string, unknown>)
        | undefined;
      if (existing != null) {
        const target = event as NativeEvent & Record<string, unknown>;
        for (const field of Object.keys(existing))
          if (FIELD_KEY_IDS.has(field) && !(field in target)) target[field] = existing[field];
      }
      this.#eventCache[event.id] = event;
      if (event.parentId != null) {
        const parent = this.#eventCache[event.parentId];
        if (parent && this.#isPrefetchedChildType(parent.type)) {
          let children = this.#childrenCache.get(event.parentId);
          if (children == null) {
            children = [];
            this.#childrenCache.set(event.parentId, children);
            this.#childIdsCache.set(event.parentId, new Set());
          }
          const childIds = this.#childIdsCache.get(event.parentId)!;
          if (!childIds.has(event.id)) {
            childIds.add(event.id);
            children.push(event.id);
          }
        }
      }
    }
  }
  /** Mark child-complete ancestor types whose edges are carried by the routed
   * envelope, avoiding a synchronous native prefetch on structural access. */
  seedRetainedChildTypes(types: readonly string[]): void {
    for (const type of types) this.#prefetchedChildTypes.add(type);
  }
  #isPrefetchedChildType(parentType: string): boolean {
    for (const type of this.#prefetchedChildTypes)
      if (type === parentType || alias(type, parentType)) return true;
    return false;
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
  get nodeCapacity(): number {
    return this.#eventCache.length;
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
  children(parentId: number, roleId?: number): NativeEvent[] {
    this.#assertOpen();
    const cached = this.#childrenCache.get(parentId);
    if (cached) {
      const selected =
        roleId == null ? cached : (this.#childRoleCache.get(parentId)?.get(roleId) ?? []);
      return selected.flatMap(nodeId => this.event(nodeId) ?? []);
    }
    const parent = this.event(parentId);
    if (parent && this.#isPrefetchedChildType(parent.type)) {
      const empty: number[] = [];
      this.#childrenCache.set(parentId, empty);
      this.#childIdsCache.set(parentId, new Set());
      this.#childRoleCache.set(parentId, new Map());
      return [];
    }
    this.prefetchChildren([parentId]);
    const selected =
      roleId == null
        ? this.#childrenCache.get(parentId)!
        : (this.#childRoleCache.get(parentId)?.get(roleId) ?? []);
    return selected.flatMap(nodeId => this.event(nodeId) ?? []);
  }
  constantNodes(nodeIds: readonly number[]): NodeView[] {
    this.#assertOpen();
    return this.#binding('query.constants')
      .queryConstants([...nodeIds])
      .flatMap(fact => {
        const event = this.event(fact.id);
        return event
          ? [
              {
                ...toNodeView(event),
                constantKind: fact.kind,
                constantValue: decodeConstant(fact.value),
              },
            ]
          : [];
      });
  }
  nodes(nodeTypes: readonly string[]): NodeView[] {
    this.#assertOpen();
    return decodeEventBatch(
      decodePackedEnvelope(this.#binding('query.nodes').queryNodesPackedBuffer([...nodeTypes])),
    ).events.map(toNodeView);
  }
  /** Hydrate only structural parents reached from actual route deliveries.
   * Each frontier crosses the native boundary once, including empty parents. */
  prefetchRoutedChildren(
    batch: RoutedEventBatch,
    routes: readonly (readonly RouteCapabilities[])[],
  ): void {
    if (!routes.some(members => members.some(caps => caps.childRules || caps.ancestorChildRules)))
      return;
    this.seedSummaries(batch.parentSummaries);
    type Rules = NonNullable<RouteCapabilities['childRules']>;
    let pending: { event: NativeEvent; rules: Rules }[] = [];
    const seen = new Map<Rules, Set<number>>();
    const enqueue = (event: NativeEvent, rules: Rules | null) => {
      if (!rules?.[event.type]) return;
      let ids = seen.get(rules);
      if (!ids) seen.set(rules, (ids = new Set()));
      if (ids.has(event.id)) return;
      ids.add(event.id);
      pending.push({ event, rules });
    };
    dispatchRoutedEvents(
      batch,
      routes.map(members => event => {
        for (const caps of members) {
          enqueue(event, caps.childRules);
          if (!caps.ancestorChildRules || !caps.ancestry) continue;
          const mode = caps.ancestry.mode;
          const depth = typeof mode === 'number' ? mode : mode === 'parent' ? 1 : Infinity;
          let parentId = event.parentId;
          for (let level = 0; parentId != null && level < depth; level++) {
            const parent = this.event(parentId);
            if (!parent) break;
            enqueue(parent, caps.ancestorChildRules);
            parentId = parent.parentId;
          }
        }
      }),
    );
    while (pending.length > 0) {
      const frontier = pending;
      pending = [];
      this.prefetchChildren([...new Set(frontier.map(item => item.event.id))]);
      for (const { event, rules } of frontier) {
        for (const role of rules[event.type] ?? []) {
          const roleId = role === '*' ? undefined : CHILD_ROLES[event.type]?.[role]?.id;
          if (role !== '*' && roleId == null) continue;
          for (const child of this.children(event.id, roleId)) enqueue(child, rules);
        }
      }
    }
  }
  prefetchChildren(parentIds: readonly number[] = [], parentTypes: readonly string[] = []): void {
    this.#assertOpen();
    const missing = parentIds.filter(parentId => !this.#childrenCache.has(parentId));
    const missingTypes = parentTypes.filter(type => !this.#prefetchedChildTypes.has(type));
    if (missing.length === 0 && missingTypes.length === 0) return;
    const typeIds: number[] = [];
    const fallbackTypes: string[] = [];
    for (const type of missingTypes) {
      const id = NODE_TYPE_IDS.get(type);
      if (id == null) fallbackTypes.push(type);
      else typeIds.push(id);
    }
    const nativeBatch = this.#binding('children.prefetch').childrenPackedBuffer(
      missing,
      fallbackTypes,
      typeIds,
    );
    if (nativeBatch.events == null)
      throw new Error(`invalid native child batch: ${Object.keys(nativeBatch).join(',')}`);
    const batch = decodeEventBatch(decodePackedEnvelope(nativeBatch.events));
    for (const parentId of missing) {
      this.#childrenCache.set(parentId, []);
      this.#childIdsCache.set(parentId, new Set());
      this.#childRoleCache.set(parentId, new Map());
    }
    for (const event of batch.events) {
      this.#eventCache[event.id] = event;
    }
    for (const edge of nativeBatch.edges) {
      let children = this.#childrenCache.get(edge.parentId);
      if (!children) {
        children = [];
        this.#childrenCache.set(edge.parentId, children);
        this.#childIdsCache.set(edge.parentId, new Set());
        this.#childRoleCache.set(edge.parentId, new Map());
      }
      const childIds = this.#childIdsCache.get(edge.parentId)!;
      if (!childIds.has(edge.childId)) {
        childIds.add(edge.childId);
        children.push(edge.childId);
      }
      if (edge.roleId !== 0) {
        const roles = this.#childRoleCache.get(edge.parentId)!;
        const roleChildren = roles.get(edge.roleId) ?? [];
        // Native CSR edges are unique per `(parent, child, role)`; preserving
        // that invariant avoids an input-sized linear scan for every sibling.
        roleChildren.push(edge.childId);
        roles.set(edge.roleId, roleChildren);
      }
    }
    for (const type of missingTypes) this.#prefetchedChildTypes.add(type);
  }
  event(nodeId: number): NativeEvent | undefined {
    this.#assertOpen();
    const cached = this.#eventCache[nodeId];
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
    const data = this.#binding('binding-index').bindingIndexBuffer();
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
  bindingRenamePlan(name: string, scopeId: number) {
    return this.#binding('binding.rename').bindingRenamePlan(name, scopeId);
  }
  bindingRenameExportNames(start: number): string[] {
    return this.#binding('binding.rename.exports').bindingRenameExportNames(start);
  }
  resolveBinding(name: string, scopeId: number): QueryResult['bindings'][number] | undefined {
    const scope = this.resolveBindingScope(name, scopeId);
    const fact =
      scope == null ? undefined : this.#binding('query.bindings').queryBindings(name, scope)[0];
    return fact && adaptBindingFact(fact);
  }
  resolveBindings(names: readonly string[], scopeId: number): QueryResult['bindings'][number][] {
    const resolved = names.flatMap(name => {
      const bindingScope = this.resolveBindingScope(name, scopeId);
      return bindingScope == null ? [] : [{ name, scopeId: bindingScope }];
    });
    for (const bindingScope of new Set(resolved.map(binding => binding.scopeId))) {
      if (this.#bindingsByScope.has(bindingScope)) continue;
      this.#bindingsByScope.set(
        bindingScope,
        new Map(
          this.#binding('query.bindings.scope')
            .queryBindings(undefined, bindingScope)
            .map(adaptBindingFact)
            .map(binding => [binding.name, binding]),
        ),
      );
    }
    return resolved.flatMap(binding => {
      const fact = this.#bindingsByScope.get(binding.scopeId)?.get(binding.name);
      return fact == null ? [] : [fact];
    });
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
  globalReferences(name: string): SemanticReferenceView[] {
    const cached = this.#globalReferencesCache.get(name);
    if (cached) return cached;
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
      this.#scopeMetadata = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
      for (let offset = 0; offset < this.#scopeMetadata.length; offset += 5)
        this.#ownedScopes.set(this.#scopeMetadata[offset], this.#scopeMetadata[offset + 4]);
    }
    return this.#scopeMetadata;
  }
  ownedScopeId(nodeId: number): number | undefined {
    this.#loadScopeMetadata();
    return this.#ownedScopes.get(nodeId);
  }
  scopeMetadata(scopeId: number): {
    ownerId: number;
    start: number;
    end: number;
    kind: number;
  } | null {
    const words = this.#loadScopeMetadata();
    const offset = scopeId * 5;
    if (offset >= words.length) return null;
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
  /** Commit whose map stays a packed decoded layer for later chain composition. */
  commitDecoded(edits: EditCommand[], mode?: string) {
    this.#assertOpen();
    const session = this.#native;
    return commitWithDedupe(edits, data =>
      session != null
        ? session.commitDecoded(data, mode)
        : native.commitDecodedBuffer(this.source, this.#nativeFilename, data, mode),
    );
  }
  close(): void {
    this.#globalBindingReferencesCache.clear();
    this.#sourceText = null;
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
