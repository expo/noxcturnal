import { alias, expandSubscriptions } from '../pipeline/route-utils';
import { NodeCache } from './node-cache';
import { CHILD_ROLES } from '../generated/event-schema';
import { createEditor, EDIT_OWNER, type OwnedEdit } from './editor';
import {
  codeFactory,
  identicalRealizedContent,
  makeSourceFragment,
  realizeContent,
  realizedContentText,
  type IntentRegistration,
  type RealizedContent,
} from './fragments';
import {
  eventIsSkipped,
  makePath,
  NodePathImpl,
  resetSkippedTraversal,
  type PathRuntime,
  type PathState,
} from './path';
import { dispatchRoutedEvents, type RoutedEventBatch } from '../protocol/events';
import { packRouteManifest } from '../protocol/manifest';
import type {
  CompiledNestedRoutes,
  CompiledRouteTemplate,
  DispatchRoute,
  PreparedPluginPlan,
  RouteCapabilities,
} from '../pipeline/types';
import type {
  Code,
  DefinedVisitor,
  Handler,
  NativePlugin,
  NativeNodePath,
  PipelinePhase,
  PluginContext,
} from '../contracts/visitor';
import type { ControlFlowCapability, Diagnostic, NativeEvent } from '../types';
import type { NativeTransformSession } from './session';

export class Bailout extends Error {}

export interface DispatchServices {
  compileNestedVisitor(visitor: readonly DefinedVisitor<any>[]): CompiledNestedRoutes;
  nestedManifest(
    plugin: NativePlugin<any, any>,
    plan: Pick<PreparedPluginPlan, 'fields'> | undefined,
    compiled: CompiledNestedRoutes,
  ): Buffer;
}

type NestedVisitor = readonly DefinedVisitor<any>[];

interface DispatcherEntry extends PathState {
  context: PluginContext;
  state: any;
  ownerIdentity: object;
  delivered?: Map<readonly Handler<any>[], Set<number>>;
  /** Most entries use one contract; allocate an index only for additional ones. */
  pathRuntime?: PathRuntime;
  /** Path runtimes keyed by the exact route capabilities they enforce. */
  pathRuntimes?: Map<RouteCapabilities, PathRuntime>;
}

// Helpers are shared by every runtime. Per-contract instances retain only their
// owner, permissions, and lazy public views. Those views must retain the runtime
// that enforces their capabilities and attributes their edits.
class RoutedPathRuntime implements PathRuntime {
  scopeCache: PathRuntime['scopeCache'] = undefined;
  programScope: PathRuntime['programScope'] = undefined;
  pathCache: PathRuntime['pathCache'] = undefined;
  readonly owner: string;
  readonly ownerIdentity: object;
  readonly cacheAncestorPaths: boolean;
  readonly ancestryDepthLimit: number;
  constructor(
    readonly session: NativeTransformSession,
    readonly plugin: NativePlugin<any, any>,
    readonly state: DispatcherEntry,
    readonly context: PluginContext,
    readonly edits: OwnedEdit[],
    readonly capabilities: RouteCapabilities,
    readonly nextOrder: () => number,
    readonly nested: (this: RoutedPathRuntime, ...args: Parameters<PathRuntime['nested']>) => void,
    readonly widen: (this: RoutedPathRuntime, ...args: Parameters<PathRuntime['widen']>) => void,
  ) {
    this.owner = plugin.name;
    this.ownerIdentity = state.ownerIdentity;
    this.cacheAncestorPaths = capabilities.cacheAncestorPaths;
    this.ancestryDepthLimit = capabilities.ancestryDepthLimit;
  }
  parent(_target: NativeEvent, parentId: number, ancestryDepth: number) {
    const cached = this.pathCache?.get(parentId);
    if (cached) return cached;
    const parent = this.session.event(parentId);
    if (!parent) return null;
    const path = makePath(this, parent, ancestryDepth);
    if (this.cacheAncestorPaths) (this.pathCache ??= new NodeCache()).set(parentId, path);
    return path;
  }
  child(target: NativeEvent, ancestryDepth: number, role: string) {
    const roleId = CHILD_ROLES[target.type]?.[role]?.id;
    if (roleId == null) return null;
    const child = this.session.child(target.id, roleId);
    if (!child) return null;
    const cached = ancestryDepth > 0 ? this.pathCache?.get(child.id) : undefined;
    if (cached) return cached;
    const path = makePath(this, child, ancestryDepth);
    if (ancestryDepth > 0 && this.cacheAncestorPaths)
      (this.pathCache ??= new NodeCache()).set(child.id, path);
    return path;
  }
  children(target: NativeEvent, ancestryDepth: number, role?: string) {
    const roleId = role == null ? undefined : CHILD_ROLES[target.type]?.[role]?.id;
    const children = this.session.children(target.id, roleId);
    const paths = new Array<NativeNodePath>(children.length);
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (ancestryDepth > 0) {
        const cached = this.pathCache?.get(child.id);
        if (cached) {
          paths[index] = cached;
          continue;
        }
        const path = makePath(this, child, ancestryDepth);
        if (this.cacheAncestorPaths) (this.pathCache ??= new NodeCache()).set(child.id, path);
        paths[index] = path;
      } else {
        paths[index] = makePath(this, child, 0);
      }
    }
    return paths;
  }
  allowsAncestry() {
    return this.capabilities.ancestry != null;
  }
  allowsScope() {
    return this.capabilities.scope;
  }
  assertControl(capability: ControlFlowCapability): void {
    if (this.capabilities.controlFlow.includes(capability)) return;
    throw new Error(
      `${this.owner}: undeclared control-flow capability ${capability} ` +
        `(declare it on the visitor contract: controlFlow: ['${capability}'])`,
    );
  }
}

interface Dispatcher {
  entries: DispatcherEntry[];
  run(): void;
  flushInsertions(): void;
}

export function createDispatcher(
  session: NativeTransformSession,
  filename: string,
  phase: PipelinePhase,
  activePlugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  metadataConflict: string | undefined,
  batch: RoutedEventBatch,
  edits: OwnedEdit[],
  metadata: Record<string, unknown>,
  diagnostics: Diagnostic[],
  cacheEvents: boolean,
  compiledRoutes: readonly CompiledRouteTemplate[],
  dispatchRoutes: readonly DispatchRoute[],
  intents: Map<string, IntentRegistration>,
  services: DispatchServices,
  pluginData: unknown,
): Dispatcher {
  let order = 0;
  let stopAll = false;
  let currentSequence = -1;
  let visitorId = 0;
  let visitorIds: WeakMap<object, number> | undefined;
  let activeTraversals: Set<string> | undefined;
  let programBodyOffsets: ReturnType<NativeTransformSession['programBodyOffsets']> | undefined;
  let programEndBoundary: OwnedEdit | undefined;
  const programInsertions = new WeakMap<
    OwnedEdit,
    { prefix: string; pending: RealizedContent | undefined }
  >();
  const programInsertionPoints = new Map<number, OwnedEdit>();
  let hasPendingInsertions = false;
  const flushInsertions = (): void => {
    if (!hasPendingInsertions) return;
    const texts: string[] = [];
    const composites: (string | { start: number; end: number })[][] = [];
    const targets: OwnedEdit[] = [];
    // Text indices are nonnegative; composites use -1-based indices so their
    // final position remains correct when later inserts add more text requests.
    const indices: number[] = [];
    let previous: RealizedContent | undefined;
    let requestIndex = 0;
    for (const edit of edits) {
      const realized = programInsertions.get(edit)?.pending;
      if (!realized) continue;
      if (!previous || !identicalRealizedContent(previous, realized)) {
        requestIndex = realized.contentParts
          ? -composites.push(realized.contentParts)
          : texts.push(realized.content!) - 1;
        previous = realized;
      }
      targets.push(edit);
      indices.push(requestIndex);
    }
    if (targets.length) {
      const separators = session.sourceTextOperations.insertionSuffixes(texts, composites);
      if (separators.length !== texts.length + composites.length)
        throw new Error('invalid insertion suffix batch');
      for (let index = 0; index < targets.length; index++) {
        const edit = targets[index];
        const request = indices[index];
        const separator = separators[request >= 0 ? request : texts.length - request - 1];
        const suffix = separator ? '\n;\n' : '\n';
        if (edit.contentParts) edit.contentParts = [...edit.contentParts, suffix];
        else edit.content += suffix;
        programInsertions.get(edit)!.pending = undefined;
      }
    }
    hasPendingInsertions = false;
  };
  const boundaryPrefixes: [string?, string?] = [];
  // Only the first insertion at an offset gets a prefix: a newline when it does
  // not start a line, and a semicolon when the directive above a prologue
  // insertion, or the statement above an append, is unterminated.
  const insertionPrefix = (kind: OwnedEdit['kind'], offset: number): string => {
    if (programInsertionPoints.has(offset)) return '';
    const index = kind === 'Prologue' ? 0 : 1;
    // Source is immutable in this phase; reset changes edits, not these facts.
    return (boundaryPrefixes[index] ??=
      (session.sourceTextOperations.needsLineBoundary(offset) ? '\n' : '') +
      (programBodyOffsets?.[index + 3] ? ';\n' : ''));
  };
  const resetProgramBoundaries = (): void => {
    programInsertionPoints.clear();
    let append: OwnedEdit | undefined;
    for (const edit of edits) {
      const record = programInsertions.get(edit);
      if (!record) continue;
      const prefix = insertionPrefix(edit.kind, edit.start);
      if (prefix !== record.prefix && edit.contentParts) {
        edit.contentParts = [
          ...(prefix ? [prefix] : []),
          ...edit.contentParts.slice(record.prefix ? 1 : 0),
        ];
      } else if (prefix !== record.prefix) {
        edit.content = prefix + edit.content!.slice(record.prefix.length);
      }
      record.prefix = prefix;
      if (!programInsertionPoints.has(edit.start)) programInsertionPoints.set(edit.start, edit);
      if (edit.kind === 'AppendLeft') append = edit;
    }
    if (programEndBoundary && !edits.includes(programEndBoundary)) programEndBoundary = undefined;
    // A file ending in a line comment gets a trailing newline so the comment
    // cannot swallow an appended statement.
    if (append && programBodyOffsets?.[2] && !programEndBoundary) {
      programEndBoundary = {
        kind: 'AppendLeft',
        start: session.source.length,
        end: session.source.length,
        content: '\n',
        owner: append.owner,
        order: order++,
        [EDIT_OWNER]: append[EDIT_OWNER],
      };
      edits.push(programEndBoundary);
    }
  };
  const phaseIdentity = {};
  const entries: DispatcherEntry[] = [];
  if (metadataConflict) throw new Error(metadataConflict);
  for (const plugin of activePlugins) {
    const plan = plans.get(plugin);
    const allowedMetadata = plan?.metadataWrites;
    const allowedQueries = plan?.queryCapabilities;
    const entry: DispatcherEntry = {
      state: undefined,
      ownerIdentity: {},
      stopped: false,
      skipped: undefined,
      context: undefined as unknown as PluginContext,
    };
    const realizeIntentContent = (code: Code): RealizedContent => realizeContent(session, code);
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
        if (
          !(existing.phase === phaseIdentity
            ? identicalRealizedContent(existing.realized, realized)
            : existing.text === realizedContentText(realized, session.source))
        )
          throw Object.assign(
            new Error(
              `${describe} realized different content for ${plugin.name} than for its first registrant ${existing.owner}`,
            ),
            { owners: [plugin.name, existing.owner] },
          );
        return existing;
      }
      intents.set(composite, {
        owner: plugin.name,
        realized,
        phase: phaseIdentity,
        text: realizedContentText(realized, session.source),
        ...range,
      });
      return null;
    };
    const pushRealizedProgramInsertion = (
      kind: 'Prologue' | 'AppendLeft',
      offset: number,
      realized: RealizedContent,
    ): void => {
      const prefix = insertionPrefix(kind, offset);
      const edit: OwnedEdit = {
        kind,
        start: offset,
        end: offset,
        ...(realized.contentParts
          ? { contentParts: [...(prefix ? [prefix] : []), ...realized.contentParts] }
          : { content: `${prefix}${realized.content}` }),
        owner: plugin.name,
        order: order++,
        [EDIT_OWNER]: entry.ownerIdentity,
      };
      if (!programInsertionPoints.has(offset)) programInsertionPoints.set(offset, edit);
      programInsertions.set(edit, { prefix, pending: realized });
      hasPendingInsertions = true;
      edits.push(edit);
    };
    const pushProgramInsertion = (
      kind: 'Prologue' | 'AppendLeft',
      offset: number,
      code: Code,
    ): void => pushRealizedProgramInsertion(kind, offset, realizeIntentContent(code));
    const context: PluginContext = {
      filename,
      phase: phase.name,
      pluginData,
      source: session.source,
      metadata: {
        set(key, value) {
          if (!allowedMetadata?.has(key))
            throw new Error(`${plugin.name}: undeclared metadata key ${key}`);
          // This key needs an own data property instead of the inherited setter.
          if (key === '__proto__')
            Object.defineProperty(metadata, key, {
              value,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          else metadata[key] = value;
        },
        get: key => (Object.hasOwn(metadata, key) ? metadata[key] : undefined),
      },
      query: request => {
        for (const capability in request) {
          if (!Object.hasOwn(request, capability) || allowedQueries?.has(capability)) continue;
          const value = request[capability as keyof typeof request];
          if (value === false || value == null || (Array.isArray(value) && value.length === 0))
            continue;
          throw new Error(`${plugin.name}: undeclared query capability ${capability}`);
        }
        return session.query(request);
      },
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
        entry.delivered ??= new Map();
        replayRoutedFollowup(
          plugin,
          entry,
          context,
          expandSubscriptions(types),
          undefined,
          event => event.sequence > currentSequence,
        );
      },
      revisitProgram: (visitors: readonly DefinedVisitor<any>[], state?: unknown) => {
        assertDeclaredControl(plugin, plans.get(plugin), 'dynamic-subscriptions');
        const compiled = services.compileNestedVisitor(visitors);
        replayCustomRouted(
          session.nextRoutedPacked(services.nestedManifest(plugin, plans.get(plugin), compiled)),
          visitors,
          plugin,
          state,
          context,
          entry.ownerIdentity,
        );
      },
      prependToProgram: code => {
        programBodyOffsets ??= session.programBodyOffsets();
        pushProgramInsertion('Prologue', programBodyOffsets[0], code);
      },
      appendToProgram: code => {
        programBodyOffsets ??= session.programBodyOffsets();
        pushProgramInsertion('AppendLeft', programBodyOffsets[1], code);
        if (programBodyOffsets[2] && !programEndBoundary) {
          programEndBoundary = {
            kind: 'AppendLeft',
            start: session.source.length,
            end: session.source.length,
            content: '\n',
            owner: plugin.name,
            order: order++,
            [EDIT_OWNER]: entry.ownerIdentity,
          };
          edits.push(programEndBoundary);
        }
      },
      ensureHelper: (key, code) => {
        const realized = realizeIntentContent(code);
        if (ensureIntent('helper', key, `helper ${key}`, realized)) return;
        programBodyOffsets ??= session.programBodyOffsets();
        pushRealizedProgramInsertion('Prologue', programBodyOffsets[0], realized);
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
          if (
            existing.phase === phaseIdentity &&
            (existing.start !== start || existing.end !== end)
          )
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
          [EDIT_OWNER]: entry.ownerIdentity,
        });
      },
      sourceSlice: (start, end) => {
        if (!(start >= 0 && end >= start && end <= session.source.length))
          throw new Error(`invalid source slice ${start}..${end}`);
        return makeSourceFragment(session, start, end);
      },
      code: codeFactory,
      editor: createEditor(
        session,
        edits,
        plugin.name,
        () => order++,
        {
          affects: edit =>
            edit === programEndBoundary || programInsertionPoints.get(edit.start) === edit,
          reconcile: resetProgramBoundaries,
          beforeCommit: flushInsertions,
        },
        entry.ownerIdentity,
      ),
    };
    entry.context = context;
    entries.push(entry);
  }
  const runtimeFor = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    capabilities: RouteCapabilities,
  ): PathRuntime => {
    const first = entry.pathRuntime;
    if (!first) {
      return (entry.pathRuntime = createPathRuntime(plugin, entry, context, capabilities));
    }
    if (first.capabilities === capabilities) return first;
    const runtimes = (entry.pathRuntimes ??= new Map());
    let runtime = runtimes.get(capabilities);
    if (!runtime) {
      runtime = createPathRuntime(plugin, entry, context, capabilities);
      runtimes.set(capabilities, runtime);
    }
    return runtime;
  };
  // Dispatcher operations close over traversal state once, then use the calling
  // runtime for plugin ownership and permissions.
  const nextPathOrder = () => order++;
  const nested: RoutedPathRuntime['nested'] = function (target, nested, state) {
    const { plugin, context, state: entry } = this;
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
      const compiled = services.compileNestedVisitor(nested);
      replayCustomRouted(
        session.nextRoutedPacked(services.nestedManifest(plugin, plans.get(plugin), compiled), {
          id: target.id,
        }),
        nested,
        plugin,
        state,
        context,
        entry.ownerIdentity,
      );
    } finally {
      activeTraversals.delete(key);
    }
  };
  const widen: RoutedPathRuntime['widen'] = function (target, types, scopeOnly) {
    const { plugin, context, state: entry } = this;
    entry.delivered ??= new Map();
    const expanded = expandSubscriptions(types);
    const root = scopeOnly ? undefined : { id: target.id };
    const filter = (candidate: NativeEvent) =>
      candidate.sequence > target.sequence && (!scopeOnly || candidate.scopeId === target.scopeId);
    replayRoutedFollowup(plugin, entry, context, expanded, root, filter);
  };
  const createPathRuntime = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    capabilities: RouteCapabilities,
  ): PathRuntime =>
    new RoutedPathRuntime(
      session,
      plugin,
      entry,
      context,
      edits,
      capabilities,
      nextPathOrder,
      nested,
      widen,
    );
  const dispatchOne = (
    event: NativeEvent,
    entry: DispatcherEntry,
    runtime: PathRuntime,
    override?: readonly DefinedVisitor<any>[],
    overrideState?: any,
    routedCallbacks: readonly Handler<any>[] = [],
  ) => {
    const deliveryRoutes = override ? undefined : entry.delivered;
    let delivered = deliveryRoutes?.get(routedCallbacks);
    if (deliveryRoutes && !delivered) {
      delivered = new Set();
      deliveryRoutes.set(routedCallbacks, delivered);
    }
    const deliveryKey = delivered ? event.id * 2 + Number(event.side === 'exit') : 0;
    if (delivered?.has(deliveryKey)) return;
    if (entry.stopped || stopAll || eventIsSkipped(event, entry.skipped)) return;
    if (routedCallbacks.length === 0) return;
    const path = makePath(runtime, event, 0, true);
    currentSequence = event.sequence;
    delivered?.add(deliveryKey);
    if (routedCallbacks.length === 1) {
      routedCallbacks[0](path, override ? overrideState : entry.state);
      return;
    }
    for (const callback of routedCallbacks) {
      callback(path, override ? overrideState : entry.state);
    }
  };
  const replayCustomRouted = (
    routedBatch: RoutedEventBatch,
    visitor: NestedVisitor,
    plugin: NativePlugin<any, any>,
    state: any,
    context: PluginContext,
    ownerIdentity: object,
  ) => {
    const compiled = services.compileNestedVisitor(visitor);
    if (routedBatch.includeParent) session.seedSummaries(routedBatch.parentSummaries);

    session.prefetchRoutedChildren(
      routedBatch,
      compiled.capabilities.map(caps => [caps]),
    );

    const entry: DispatcherEntry = {
      context,
      state,
      ownerIdentity,
      stopped: false,
      skipped: undefined,
    };
    dispatchRoutedEvents(
      routedBatch,
      compiled.callbacks.map((callbacks, index) => {
        const capabilities = compiled.capabilities[index];
        // A replay owns fresh control state, but every delivery of the same
        // contract can share its closures and lazy scope/ancestor caches.
        const runtime = runtimeFor(plugin, entry, context, capabilities);
        return (event: NativeEvent) =>
          dispatchOne(event, entry, runtime, visitor, state, callbacks);
      }),
      event => session.cacheEvent(event),
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
    root: { id: number } | undefined,
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
        // Scope IDs also serve subscribeForScope's filter. Parent summaries are
        // needed only when this plugin can observe ancestry.
        manifest: packRouteManifest(routes, plans.get(plugin)?.ancestry != null, true),
      };
      followupRouteCache.set(key, followup);
    }
    if (followup.routes.length === 0) return;
    const routed = session.nextRoutedPacked(followup.manifest, root);
    session.prefetchRoutedChildren(
      routed,
      followup.routes.map(route => [route.capabilities]),
    );
    resetSkippedTraversal(entry.skipped);
    dispatchRoutedEvents(
      routed,
      followup.routes.map(route => {
        const runtime = runtimeFor(plugin, entry, context, route.capabilities);
        return (event: NativeEvent) => {
          if (filter(event))
            dispatchOne(
              event,
              entry,
              runtime,
              undefined,
              undefined,
              route.callbacks as Handler<any>[],
            );
        };
      }),
    );
  };
  const compileCheckedRoute = (route: (typeof dispatchRoutes)[number]) => {
    const { pluginId, plugin, callbacks, capabilities } = route.members[0];
    const entry = entries[pluginId];
    const runtime = runtimeFor(plugin, entry, entry.context, capabilities);
    return (event: NativeEvent) =>
      dispatchOne(event, entry, runtime, undefined, undefined, callbacks as Handler<any>[]);
  };
  const compileStaticSingleCallbackRoute = (member: {
    entry: DispatcherEntry;
    runtime: PathRuntime;
    callbacks: readonly Handler<any>[];
  }) => {
    const { entry, runtime, callbacks } = member;
    const callback = callbacks[0];
    return (event: NativeEvent) => {
      currentSequence = event.sequence;
      callback(new NodePathImpl(runtime, event, 0, true), entry.state);
    };
  };
  const compileStaticRoute = (route: (typeof dispatchRoutes)[number]) => {
    if (
      !route.fast ||
      route.members.some(
        ({ plugin, capabilities }) => plugin.analyze != null || capabilities.controlFlow.length > 0,
      )
    ) {
      throw new Error('invalid static dispatch route');
    }
    // Fast routes bind their runtimes once at dispatcher creation. Exit groups run
    // members in reverse order to preserve the reverse-exit contract across plugins.
    const members = route.members.map(({ pluginId, plugin, callbacks, capabilities }) => {
      const entry = entries[pluginId];
      const runtime = runtimeFor(plugin, entry, entry.context, capabilities);
      return { entry, runtime, callbacks };
    });
    if (route.side === 'exit') members.reverse();
    if (members.length === 1 && members[0].callbacks.length === 1)
      return compileStaticSingleCallbackRoute(members[0]);
    return (event: NativeEvent) => {
      currentSequence = event.sequence;
      for (const member of members) {
        const path = makePath(member.runtime, event, 0, true);
        for (const callback of member.callbacks) callback(path, member.entry.state);
      }
    };
  };
  const routedThunks: ((event: NativeEvent) => void)[] =
    batch.routeDeliveryCount === 0
      ? []
      : dispatchRoutes.map((route, index) => {
          if (dispatchRoutes.length === 1)
            return route.fast ? compileStaticRoute(route) : compileCheckedRoute(route);
          return event => {
            const handler = route.fast ? compileStaticRoute(route) : compileCheckedRoute(route);
            routedThunks[index] = handler;
            handler(event);
          };
        });
  return {
    entries,
    flushInsertions,
    run() {
      for (const entry of entries) resetSkippedTraversal(entry.skipped);
      dispatchRoutedEvents(
        batch,
        routedThunks!,
        cacheEvents ? event => session.cacheEvent(event) : undefined,
      );
    },
  };
}

function assertDeclaredControl(
  plugin: Pick<NativePlugin<any, any>, 'name'>,
  plan: PreparedPluginPlan | undefined,
  capability: ControlFlowCapability,
): void {
  if (plan?.controlFlow?.includes(capability)) return;
  throw new Error(`${plugin.name}: undeclared control-flow capability ${capability}`);
}
