import { alias, expandSubscriptions } from '../pipeline/route-utils';
import { CHILD_ROLES } from '../generated/event-schema';
import { createEditor } from './editor';
import {
  codeFactory,
  identicalRealizedContent,
  makeSourceFragment,
  realizeContent,
  type IntentRegistration,
  type RealizedContent,
} from './fragments';
import {
  childRoleIsDeclared,
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
  PipelinePhase,
  PluginContext,
} from '../contracts/visitor';
import type { ControlFlowCapability, Diagnostic, EditCommand, NativeEvent } from '../types';
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
  delivered?: Map<readonly Handler<any>[], Set<number>>;
  /** Path runtimes keyed by the exact route capabilities they enforce. */
  pathRuntimes?: Map<RouteCapabilities, PathRuntime>;
}

interface Dispatcher {
  contexts: Map<NativePlugin<any, any>, DispatcherEntry>;
  run(): void;
}

export function createDispatcher(
  session: NativeTransformSession,
  phase: PipelinePhase,
  activePlugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  batch: RoutedEventBatch,
  edits: EditCommand[],
  metadata: Record<string, unknown>,
  diagnostics: Diagnostic[],
  cacheEvents: boolean,
  compiledRoutes: readonly CompiledRouteTemplate[],
  dispatchRoutes: readonly DispatchRoute[],
  intents: Map<string, IntentRegistration>,
  provenance: { degradations: number },
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
  let programEndBoundaryAdded = false;
  const programInsertionPoints = new Set<number>();
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
    const declaredQueries = plans.get(plugin)?.queries;
    const allowedQueries = declaredQueries?.length ? new Set<string>() : undefined;
    for (const request of declaredQueries ?? []) {
      for (const capability in request) {
        if (!Object.hasOwn(request, capability)) continue;
        const value = request[capability as keyof typeof request];
        if (Array.isArray(value) ? value.length > 0 : value === true)
          allowedQueries!.add(capability);
      }
    }
    const entry: DispatcherEntry = {
      state: undefined,
      stopped: false,
      skipped: undefined,
      context: undefined as unknown as PluginContext,
    };
    const realizeIntentContent = (code: Code): RealizedContent =>
      realizeContent(session, code, () => {
        provenance.degradations++;
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
    const pushRealizedProgramInsertion = (
      kind: 'Prologue' | 'AppendLeft',
      offset: number,
      realized: RealizedContent,
    ): void => {
      const first = !programInsertionPoints.has(offset);
      const needsSeparator = first && programBodyOffsets?.[kind === 'Prologue' ? 3 : 4];
      const prefix =
        (first && session.sourceTextOperations.needsLineBoundary(offset) ? '\n' : '') +
        (needsSeparator ? ';\n' : '');
      const suffix = session.sourceTextOperations.insertionSuffix(
        realized.contentParts ?? [realized.content!],
      );
      programInsertionPoints.add(offset);
      edits.push({
        kind,
        start: offset,
        end: offset,
        ...(realized.contentParts
          ? { contentParts: [...(prefix ? [prefix] : []), ...realized.contentParts, suffix] }
          : { content: `${prefix}${realized.content}${suffix}` }),
        owner: plugin.name,
        order: order++,
      });
    };
    const pushProgramInsertion = (
      kind: 'Prologue' | 'AppendLeft',
      offset: number,
      code: Code,
    ): void => pushRealizedProgramInsertion(kind, offset, realizeIntentContent(code));
    const context: PluginContext = {
      filename: session.filename,
      phase: phase.name,
      pluginData,
      source: session.source,
      metadata: {
        set(key, value) {
          if (!allowedMetadata.has(key))
            throw new Error(`${plugin.name}: undeclared metadata key ${key}`);
          metadata[key] = value;
        },
        get: key => metadata[key],
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
        );
      },
      prependToProgram: code => {
        programBodyOffsets ??= session.programBodyOffsets();
        pushProgramInsertion('Prologue', programBodyOffsets[0], code);
      },
      appendToProgram: code => {
        programBodyOffsets ??= session.programBodyOffsets();
        pushProgramInsertion('AppendLeft', programBodyOffsets[1], code);
        if (programBodyOffsets[2] && !programEndBoundaryAdded) {
          edits.push({
            kind: 'AppendLeft',
            start: session.source.length,
            end: session.source.length,
            content: '\n',
            owner: plugin.name,
            order: order++,
          });
          programEndBoundaryAdded = true;
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
      editor: createEditor(session, edits, plugin.name, () => order++),
    };
    entry.context = context;
    contexts.set(plugin, entry);
  }
  const runtimeFor = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    capabilities: RouteCapabilities,
  ): PathRuntime => {
    const runtimes = (entry.pathRuntimes ??= new Map());
    let runtime = runtimes.get(capabilities);
    if (!runtime) {
      runtime = createPathRuntime(plugin, entry, context, capabilities);
      runtimes.set(capabilities, runtime);
    }
    return runtime;
  };
  const createPathRuntime = (
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    capabilities: RouteCapabilities,
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
          const compiled = services.compileNestedVisitor(nested);
          if (compiled.ancestorChildParentTypes.length > 0)
            session.seedRetainedChildTypes(compiled.ancestorChildParentTypes);
          replayCustomRouted(
            session.nextRoutedPacked(services.nestedManifest(plugin, plans.get(plugin), compiled), {
              start: target.start,
              end: target.end,
            }),
            nested,
            plugin,
            state,
            context,
          );
        } finally {
          activeTraversals.delete(key);
        }
      },
      widen(target, types, scopeOnly) {
        entry.delivered ??= new Map();
        const expanded = expandSubscriptions(types);
        const root = scopeOnly ? undefined : { start: target.start, end: target.end };
        const filter = (candidate: NativeEvent) =>
          candidate.sequence > target.sequence &&
          (!scopeOnly || candidate.scopeId === target.scopeId);
        replayRoutedFollowup(plugin, entry, context, expanded, root, filter);
      },
      parent(_target, parentId, ancestryDepth) {
        const cached = runtime.pathCache?.[parentId];
        if (cached) return cached;
        const parent = session.event(parentId);
        if (!parent) return null;
        const path = makePath(runtime, parent, ancestryDepth);
        if (runtime.pathCache) runtime.pathCache[parentId] = path;
        return path;
      },
      children(target, ancestryDepth, role) {
        const roleId = role == null ? undefined : CHILD_ROLES[target.type]?.[role]?.id;
        return session.children(target.id, roleId).map(child => {
          if (ancestryDepth > 0) {
            const cached = runtime.pathCache?.[child.id];
            if (cached) return cached;
            const path = makePath(runtime, child, ancestryDepth);
            if (runtime.pathCache) runtime.pathCache[child.id] = path;
            return path;
          }
          return makePath(runtime, child, 0);
        });
      },
      allowsChild(type, role) {
        // childRules is normalized to concrete parent types when the visitor is
        // compiled, and path node types are concrete. Avoid rescanning every rule
        // (and redoing alias matching) on each structural access.
        const roles = capabilities.childRules?.[type];
        if (roles == null || !childRoleIsDeclared(roles, role)) return false;
        return true;
      },
      allowsAncestry() {
        return capabilities.ancestry != null;
      },
      allowsScope() {
        return capabilities.scope;
      },
      scopeCache: new Map(),
      pathCache: undefined,
      cacheAncestorPaths:
        typeof capabilities.ancestry?.mode !== 'number' &&
        (Object.values(capabilities.ancestorFields ?? {}).some(
          fields => (fields?.length ?? 0) > 0,
        ) ||
          Object.values(capabilities.ancestorChildRules ?? {}).some(
            roles => (roles?.length ?? 0) > 0,
          )),
      ancestryDepthLimit:
        capabilities.ancestry?.mode === 'parent'
          ? 1
          : typeof capabilities.ancestry?.mode === 'number'
            ? capabilities.ancestry.mode
            : Number.POSITIVE_INFINITY,
      assertControl(capability) {
        if (capabilities.controlFlow.includes(capability)) {
          return;
        }
        throw new Error(
          `${plugin.name}: undeclared control-flow capability ${capability} ` +
            `(declare it on the visitor contract: controlFlow: ['${capability}'])`,
        );
      },
      capabilities,
      provenance,
    };
    if (runtime.cacheAncestorPaths) runtime.pathCache = new Array(session.nodeCapacity);
    return runtime;
  };
  const dispatchOne = (
    event: NativeEvent,
    plugin: NativePlugin<any, any>,
    entry: DispatcherEntry,
    context: PluginContext,
    boundRuntime: PathRuntime | null,
    capabilities: RouteCapabilities,
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
    const runtime = boundRuntime ?? createPathRuntime(plugin, entry, context, capabilities);
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
  ) => {
    const compiled = services.compileNestedVisitor(visitor);
    session.reserveEventCache(routedBatch.nodeCount);
    if (routedBatch.includeParent) session.seedSummaries(routedBatch.parentSummaries);

    const entry = {
      context,
      state,
      stopped: false,
      skipped: undefined,
    };
    dispatchRoutedEvents(
      routedBatch,
      compiled.callbacks.map(
        (callbacks, index) => (event: NativeEvent) =>
          dispatchOne(
            event,
            plugin,
            entry,
            context,
            null,
            compiled.capabilities[index],
            visitor,
            state,
            callbacks,
          ),
      ),
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
    resetSkippedTraversal(entry.skipped);
    const accepted = new WeakSet<NativeEvent>();
    dispatchRoutedEvents(
      routed,
      followup.routes.map(route => {
        const runtime = runtimeFor(plugin, entry, context, route.capabilities);
        return (event: NativeEvent) => {
          if (accepted.has(event))
            dispatchOne(
              event,
              plugin,
              entry,
              context,
              runtime,
              route.capabilities,
              undefined,
              undefined,
              route.callbacks as Handler<any>[],
            );
        };
      }),
      event => {
        if (filter(event)) accepted.add(event);
      },
    );
  };
  const compileCheckedRoute = (route: (typeof dispatchRoutes)[number]) => {
    const { plugin, callbacks, capabilities } = route.members[0];
    const entry = contexts.get(plugin)!;
    const runtime = runtimeFor(plugin, entry, entry.context, capabilities);
    return (event: NativeEvent) =>
      dispatchOne(
        event,
        plugin,
        entry,
        entry.context,
        runtime,
        capabilities,
        undefined,
        undefined,
        callbacks as Handler<any>[],
      );
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
    const members = route.members.map(({ plugin, callbacks, capabilities }) => {
      const entry = contexts.get(plugin)!;
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
  const routedThunks = dispatchRoutes.map(route =>
    route.fast ? compileStaticRoute(route) : compileCheckedRoute(route),
  );
  return {
    contexts,
    run() {
      for (const entry of contexts.values()) resetSkippedTraversal(entry.skipped);
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
