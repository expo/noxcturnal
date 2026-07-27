import { performance } from 'node:perf_hooks';

import { alias, expandSubscriptions } from '../pipeline/route-utils.js';
import { createEditor } from './editor.js';
import {
  codeFactory,
  directivePrologueEnd,
  identicalRealizedContent,
  makeSourceFragment,
  realizeContent,
  type IntentRegistration,
  type RealizedContent,
} from './fragments.js';
import { optionsPerformance } from './metadata.js';
import {
  childRoleIsDeclared,
  eventIsSkipped,
  makePath,
  NodePathImpl,
  type ContractVerification,
  type PathRuntime,
  type PathState,
} from './path.js';
import { dispatchRoutedEvents, type RoutedEventBatch } from '../protocol/events.js';
import { packRouteManifest } from '../protocol/manifest.js';
import type {
  CompiledNestedRoutes,
  CompiledRouteTemplate,
  DispatchRoute,
  PreparedPluginPlan,
  RouteCapabilities,
} from '../pipeline/types.js';
import type {
  Code,
  DefinedVisitor,
  Handler,
  NativeNodePath,
  NativePlugin,
  PipelinePhase,
  PluginContext,
} from '../contracts/visitor.js';
import type { ControlFlowCapability, Diagnostic, EditCommand, NativeEvent } from '../types.js';
import type { NativeTransformSession } from './session.js';

export class Bailout extends Error {}

export interface DispatchVerifier extends ContractVerification {
  register(capabilities: RouteCapabilities, plugin: string, nodeType: string): void;
  capabilityUsed(capabilities: RouteCapabilities, capability: string): void;
}

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
  delivered?: Set<number>;
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
  verifier: DispatchVerifier | undefined,
  services: DispatchServices,
  pluginData: unknown,
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
      revisitProgram: (visitors: readonly DefinedVisitor<any>[], state?: unknown) => {
        assertDeclaredControl(plugin, plans.get(plugin), 'dynamic-subscriptions');
        const compiled = services.compileNestedVisitor(visitors);
        replayCustomRouted(
          session.nextRoutedPacked(services.nestedManifest(plugin, plans.get(plugin), compiled)),
          visitors,
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
          replayCustomRouted(
            session.nextRoutedPacked(services.nestedManifest(plugin, plans.get(plugin), compiled), {
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
        // childRules is normalized to concrete parent types when the visitor is
        // compiled, and path node types are concrete. Avoid rescanning every rule
        // (and redoing alias matching) on each structural access.
        const roles = capabilities.childRules?.[type];
        if (roles == null || !childRoleIsDeclared(roles, role)) return false;
        verifier?.capabilityUsed(capabilities, 'children');
        return true;
      },
      allowsAncestry() {
        if (capabilities.ancestry) verifier?.capabilityUsed(capabilities, 'ancestry');
        return capabilities.ancestry;
      },
      allowsScope() {
        if (capabilities.scope) verifier?.capabilityUsed(capabilities, 'scope');
        return capabilities.scope;
      },
      scopeCache: new Map(),
      assertControl(capability) {
        if (capabilities.controlFlow.includes(capability)) {
          verifier?.capabilityUsed(capabilities, capability);
          return;
        }
        throw new Error(
          `${plugin.name}: undeclared control-flow capability ${capability} ` +
            `(declare it on the visitor contract: controlFlow: ['${capability}'])`,
        );
      },
      capabilities,
      verify: verifier,
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
    boundRuntime: PathRuntime | null,
    capabilities: RouteCapabilities,
    override?: readonly DefinedVisitor<any>[],
    overrideState?: any,
    routedCallbacks: readonly Handler<any>[] = [],
  ) => {
    const delivered = override ? undefined : entry.delivered;
    const deliveryKey = delivered ? event.id * 2 + Number(event.side === 'exit') : 0;
    if (delivered?.has(deliveryKey)) return;
    if (entry.stopped || stopAll || eventIsSkipped(event, entry.skipped)) return;
    if (routedCallbacks.length === 0) return;
    const runtime = boundRuntime ?? createPathRuntime(plugin, entry, context, capabilities);
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
    visitor: NestedVisitor,
    state: any,
    context: PluginContext,
  ) => {
    const compiled = services.compileNestedVisitor(visitor);
    const synthetic = { name: 'nested' };
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
            synthetic,
            entry,
            context,
            null,
            compiled.capabilities[index],
            visitor,
            state,
            callbacks,
          ),
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
  if (verifier)
    for (const route of compiledRoutes)
      verifier.register(route.capabilities, route.plugin.name, route.nodeType);
  const counters = optionsPerformance(metadata);
  const routedThunks = dispatchRoutes.map(route => {
    if (!route.fast) {
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
    }
    // Fast routes bind their runtimes once at dispatcher creation. Exit groups run
    // members in reverse order to preserve the reverse-exit contract across plugins.
    const members = route.members.map(({ plugin, callbacks, capabilities }) => {
      const entry = contexts.get(plugin)!;
      const runtime = runtimeFor(plugin, entry, entry.context, capabilities);
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
  plan: PreparedPluginPlan | undefined,
  capability: ControlFlowCapability,
): void {
  if (plan?.controlFlow?.includes(capability)) return;
  throw new Error(`${plugin.name}: undeclared control-flow capability ${capability}`);
}
