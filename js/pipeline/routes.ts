import { sourceHints } from '../adapters/classification.js';
import { CHILD_ROLES } from '../generated/event-schema.js';
import { stableJson } from './cache-key.js';
import { EDIT_EFFECTS } from './compile.js';
import {
  concreteRouteTypes,
  isCollapsedClassKey,
  isCollapsedFunctionKey,
  validatePredicates,
  validateRouteSpec,
  type PredicateRequirements,
} from './validate.js';
import type {
  CompiledNestedRoutes,
  CompiledPhaseRoutes,
  CompiledRouteTemplate,
  DispatchRoute,
  PreparedPhase,
  SharedPhasePlan,
  PreparedPluginPlan,
  ResolvedVisitor,
  RouteCapabilities,
} from './types.js';
import { packRouteManifest, type NativeRouteManifestEntry } from '../protocol/manifest.js';
import type {
  AncestryCapability,
  ChildContract,
  DefinedVisitor,
  Handler,
  NativePlugin,
  PipelinePhase,
  PrepareContext,
  VisitorRouteSpec,
} from '../contracts/visitor.js';
import type {
  ControlFlowCapability,
  Diagnostic,
  NativeFieldKey,
  NativeNodeType,
  ParseClassification,
  PluginPlan,
  QueryRequest,
  ScalarPredicate,
  TransformOptions,
} from '../types.js';

const REMOVED_PLAN_FIELDS = [
  'subscriptions',
  'identifierNames',
  'staticMemberPatterns',
  'fields',
  'where',
  'children',
  'controlFlow',
  'semantics',
  'ancestry',
  'queries',
  'metadataWrites',
] as const;

const visitorStaticKeys = new WeakMap<DefinedVisitor<any>, string>();
/** The per-file cache key contribution of a visitor's static contract. Contracts
 * are frozen at definition, so this is computed once per `DefinedVisitor`. */
function visitorStaticKey(defined: DefinedVisitor<any>): string {
  let key = visitorStaticKeys.get(defined);
  if (key == null) {
    key = `${defined.route}:${stableJson(defined.contract.where ?? null)}:${stableJson(
      defined.contract.children ?? null,
    )}:${defined.contract.fields.join(',')}:${defined.contract.nested
      .map(
        nested =>
          `${nested.route}/${stableJson(nested.contract.where ?? null)}/${nested.contract.fields.join(
            ',',
          )}/${nested.contract.controlFlow.join(',')}/${nested.contract.scope ? '1' : '0'}/${
            nested.contract.ancestry ?? ''
          }`,
      )
      .join(';')}:${defined.contract.controlFlow.join(',')}:${
      defined.contract.scope ? '1' : '0'
    }:${defined.contract.ancestry ?? ''}`;
    visitorStaticKeys.set(defined, key);
  }
  return key;
}

const validatedVisitors = new WeakSet<DefinedVisitor<any>>();

function validateDefinedVisitor(pluginName: string, defined: DefinedVisitor<any>): void {
  if (validatedVisitors.has(defined)) return;
  validateRouteSpec(pluginName, 'visitor route', defined.route);
  validatePredicates(pluginName, {
    where: defined.contract.where == null ? undefined : { [defined.route]: defined.contract.where },
    controlFlow: defined.contract.controlFlow,
  } as PredicateRequirements);
  const validateChildren = (
    route: string,
    children: Readonly<Record<string, ChildContract>> | undefined,
  ) => {
    for (const [role, child] of Object.entries(children ?? {})) {
      validateRouteSpec(pluginName, `child route for role ${role}`, child.route);
      const childTypes = concreteRouteTypes(child.route);
      if (role !== '*') {
        // Generated role data: the role must exist for at least one concrete type
        // of the route, and the declared route must be able to deliver it.
        const parents = concreteRouteTypes(route);
        const allowed = new Set<string>();
        let known = false;
        for (const parent of parents) {
          const declaration = CHILD_ROLES[parent]?.[role];
          if (declaration == null) continue;
          known = true;
          for (const type of declaration.types) allowed.add(type);
        }
        if (!known) {
          const roles = [
            ...new Set(parents.flatMap(parent => Object.keys(CHILD_ROLES[parent] ?? {}))),
          ];
          throw new Error(
            `${pluginName}: unknown child role ${role} for route ${route}` +
              (roles.length > 0 ? ` (valid roles: ${roles.join(', ')})` : ''),
          );
        }
        if (!childTypes.some(type => allowed.has(type)))
          throw new Error(
            `${pluginName}: child role ${route}.${role} cannot deliver route ${child.route}`,
          );
      }
      validateChildren(child.route, child.children);
    }
  };
  validateChildren(defined.route, defined.contract.children);
  validatedVisitors.add(defined);
}

function resolveTypedVisitors(
  plugin: NativePlugin<any, any>,
  context: PrepareContext,
): ResolvedVisitor[] {
  const resolved: ResolvedVisitor[] = [];
  for (const defined of plugin.visitors!) {
    validateDefinedVisitor(plugin.name, defined);
    const contract = defined.contract;
    let enabled = true;
    let where: Record<string, ScalarPredicate> | undefined =
      contract.where == null
        ? undefined
        : (Object.fromEntries(
            Object.entries(contract.where).filter(([, predicate]) => predicate != null),
          ) as Record<string, ScalarPredicate>);
    if (contract.configure) {
      const configuration = contract.configure(context, plugin.options) ?? {};
      if (configuration.enabled === false) enabled = false;
      if (configuration.where != null) {
        validatePredicates(plugin.name, {
          where: { [defined.route]: configuration.where },
        } as PredicateRequirements);
        where ??= {};
        for (const [field, predicate] of Object.entries(configuration.where)) {
          if (predicate == null) continue;
          where[field] = where[field] ? intersectPredicates(where[field], predicate) : predicate;
        }
      }
    }
    resolved.push({ definition: defined, enabled, where });
  }
  return resolved;
}

/**
 * Aggregate the native phase requirements of a typed plugin's enabled visitors
 * into the plan shape the phase machinery consumes. Predicates deliberately stay
 * per-visitor (they compile per route); everything here is unioned native work.
 */
function synthesizeVisitorPlan(
  plugin: NativePlugin<any, any>,
  plan: PluginPlan,
  resolved: readonly ResolvedVisitor[],
): PreparedPluginPlan & { metadataWrites?: readonly string[]; queries?: readonly QueryRequest[] } {
  for (const field of REMOVED_PLAN_FIELDS) {
    if ((plan as Record<string, unknown>)[field] != null)
      throw new Error(
        `${plugin.name}: prepare() may not declare ${field}; route requirements live on visitor contracts and context requirements on the plugin contract`,
      );
  }
  const subscriptions: VisitorRouteSpec[] = [];
  const fields: Record<string, NativeFieldKey[]> = {};
  const children: Record<string, string[]> = {};
  const controlFlow = new Set<ControlFlowCapability>();
  let scope = false;
  let ancestry: AncestryCapability | undefined;
  for (const { definition, enabled } of resolved) {
    if (!enabled) continue;
    const contract = definition.contract;
    subscriptions.push(definition.route);
    if (contract.fields.length > 0)
      for (const concrete of concreteRouteTypes(definition.route))
        mergeFieldRequests(fields, { [concrete]: contract.fields });
    const attachChildren = (
      parentTypes: readonly string[],
      declared: Readonly<Record<string, ChildContract>> | undefined,
    ) => {
      if (declared == null) return;
      for (const parentType of parentTypes) {
        const roles = (children[parentType] ??= []);
        for (const role of Object.keys(declared)) if (!roles.includes(role)) roles.push(role);
      }
      for (const child of Object.values(declared)) {
        const childTypes = concreteRouteTypes(child.route);
        if ((child.fields?.length ?? 0) > 0)
          for (const concrete of childTypes)
            mergeFieldRequests(fields, { [concrete]: child.fields! });
        attachChildren(childTypes, child.children);
      }
    };
    attachChildren(concreteRouteTypes(definition.route), contract.children);
    for (const capability of contract.controlFlow) controlFlow.add(capability);
    scope ||= contract.scope;
    if (contract.ancestry != null && ancestry == null) ancestry = contract.ancestry;
    for (const nested of contract.nested) {
      validateDefinedVisitor(plugin.name, nested);
      for (const concrete of concreteRouteTypes(nested.route)) {
        const nestedFields = [
          ...nested.contract.fields,
          ...Object.keys(nested.contract.where ?? {}),
        ];
        if (nestedFields.length > 0)
          mergeFieldRequests(fields, { [concrete]: nestedFields as NativeFieldKey[] });
      }
    }
  }
  return {
    ...plan,
    subscriptions,
    fields: fields as PreparedPluginPlan['fields'],
    children: Object.keys(children).length > 0 ? children : undefined,
    controlFlow: controlFlow.size > 0 ? [...controlFlow] : undefined,
    scope: scope || undefined,
    ancestry,
    resolvedVisitors: resolved,
  };
}

const typedCapabilitiesCache = new WeakMap<DefinedVisitor<any>, RouteCapabilities>();
function typedCapabilities(defined: DefinedVisitor<any>): RouteCapabilities {
  let capabilities = typedCapabilitiesCache.get(defined);
  if (!capabilities) {
    const contract = defined.contract;
    let childRules: Record<string, string[]> | null = null;
    if (contract.children != null) {
      const rules: Record<string, string[]> = {};
      const attach = (
        parentTypes: readonly string[],
        children: Readonly<Record<string, ChildContract>>,
      ) => {
        for (const parentType of parentTypes) {
          const roles = (rules[parentType] ??= []);
          for (const role of Object.keys(children)) if (!roles.includes(role)) roles.push(role);
        }
        for (const child of Object.values(children))
          if (child.children != null) attach(concreteRouteTypes(child.route), child.children);
      };
      attach(concreteRouteTypes(defined.route), contract.children);
      childRules = rules;
    }
    capabilities = {
      scope: contract.scope,
      ancestry: contract.ancestry != null,
      childRules,
      controlFlow: contract.controlFlow,
      declaredFields: contract.fields,
    };
    typedCapabilitiesCache.set(defined, capabilities);
  }
  return capabilities;
}

/**
 * Development-mode contract verification: reports undeclared field reads with a
 * paste-able contract fragment, and declared fields/capabilities that were never
 * used. Applies to typed visitor routes only; capability *violations* throw in
 * every mode.
 */
export class ContractVerifier {
  private readonly visitors = new Map<
    RouteCapabilities,
    { plugin: string; nodeType: string; usedFields: Set<string>; usedCapabilities: Set<string> }
  >();
  private readonly undeclared = new Map<string, Diagnostic>();
  register(capabilities: RouteCapabilities, plugin: string, nodeType: string): void {
    if (!this.visitors.has(capabilities))
      this.visitors.set(capabilities, {
        plugin,
        nodeType,
        usedFields: new Set(),
        usedCapabilities: new Set(),
      });
  }
  fieldRead(
    capabilities: RouteCapabilities,
    plugin: string,
    nodeType: string,
    field: string,
  ): void {
    const declared = capabilities.declaredFields;
    if (declared.includes(field as NativeFieldKey)) {
      this.visitors.get(capabilities)?.usedFields.add(field);
      return;
    }
    const id = `${plugin}:${nodeType}.${field}`;
    if (!this.undeclared.has(id))
      this.undeclared.set(id, {
        code: 'visitor-contract',
        plugin,
        message: `${nodeType} visitor read undeclared field ${field}; add it to the contract: fields: ['${field}']`,
      });
  }
  capabilityUsed(capabilities: RouteCapabilities, name: string): void {
    this.visitors.get(capabilities)?.usedCapabilities.add(name);
  }
  finish(diagnostics: Diagnostic[]): void {
    for (const report of this.undeclared.values()) diagnostics.push(report);
    for (const [capabilities, info] of this.visitors) {
      const unused = (message: string) =>
        diagnostics.push({ code: 'visitor-contract', plugin: info.plugin, message });
      for (const field of capabilities.declaredFields)
        if (!info.usedFields.has(field))
          unused(`${info.nodeType} visitor declared field ${field} but never read it`);
      if (capabilities.scope && !info.usedCapabilities.has('scope'))
        unused(`${info.nodeType} visitor declared scope but never used it`);
      if (capabilities.ancestry && !info.usedCapabilities.has('ancestry'))
        unused(`${info.nodeType} visitor declared ancestry but never used it`);
      if (capabilities.childRules != null && !info.usedCapabilities.has('children'))
        unused(`${info.nodeType} visitor declared children but never accessed them`);
      for (const capability of capabilities.controlFlow)
        if (!info.usedCapabilities.has(capability))
          unused(`${info.nodeType} visitor declared ${capability} but never used it`);
    }
  }
}

const staticPlanCache = new WeakMap<NativePlugin<any, any>, PreparedPluginPlan>();
const preparedPhaseCaches = new WeakMap<PipelinePhase, Map<string, SharedPhasePlan>>();
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

export function mergeFieldRequests(
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

export function preparePhase(
  phase: PipelinePhase,
  phaseSource: string,
  filename: string,
  options: TransformOptions,
  parser: ParseClassification,
): PreparedPhase {
  const hints = sourceHints(phaseSource);
  const plans = new Map<NativePlugin<any, any>, PreparedPluginPlan>();
  for (const plugin of phase.plugins ?? []) {
    // Plugins with no per-file hooks (`prepare`, `configure`) have a fully static
    // plan; synthesize it once per plugin definition.
    const staticPlan = staticPlanCache.get(plugin);
    if (staticPlan != null) {
      plans.set(plugin, staticPlan);
      continue;
    }
    const prepareContext: PrepareContext = {
      filename,
      options,
      parser,
      sourceHints: hints,
      pluginData: options.pluginData,
    };
    const prepared = plugin.prepare?.(prepareContext, plugin.options as any) ?? {};
    if (prepared.editEffect != null && !EDIT_EFFECTS.has(prepared.editEffect))
      throw new Error(`${plugin.name}: invalid edit effect ${String(prepared.editEffect)}`);
    const synthesized = synthesizeVisitorPlan(
      plugin,
      prepared,
      plugin.visitors == null ? [] : resolveTypedVisitors(plugin, prepareContext),
    );
    // Plugin-contract requirements union with the visitor-derived plan.
    if (plugin.contract != null) {
      synthesized.metadataWrites = [
        ...new Set([
          ...(synthesized.metadataWrites ?? []),
          ...(plugin.contract.metadata?.writes ?? []),
        ]),
      ];
      synthesized.queries = [...(synthesized.queries ?? []), ...(plugin.contract.queries ?? [])];
    }
    plans.set(plugin, synthesized);
    if (
      plugin.prepare == null &&
      (plugin.visitors ?? []).every(visitor => visitor.contract.configure == null)
    )
      staticPlanCache.set(plugin, synthesized);
  }

  const preparedKey = (phase.plugins ?? [])
    .map(plugin => `${plugin.name}:${pluginPlanCacheKey(plans.get(plugin)!)}`)
    .join('\u001e');
  const cachedPrepared = preparedPhaseCaches.get(phase)?.get(preparedKey);
  if (cachedPrepared) return { ...cachedPrepared, plans, shared: cachedPrepared };

  const activePlugins = (phase.plugins ?? []).filter(plugin =>
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
    includeScope ||= plan.scope === true;
    includeParent ||= plan.ancestry != null;
    mergeFieldRequests(fieldRequests, plan.fields ?? {});
    for (const { definition, enabled, where } of plan.resolvedVisitors) {
      if (!enabled) continue;
      const matchFields = Object.keys(where ?? {});
      for (const part of definition.route.split('|')) {
        if (part === 'ReferencedIdentifier') matchFields.push('global');
        else if (isCollapsedFunctionKey(part) || isCollapsedClassKey(part))
          matchFields.push('nodeKind');
      }
      if (matchFields.length > 0)
        for (const concrete of concreteRouteTypes(definition.route))
          mergeFieldRequests(fieldRequests, { [concrete]: matchFields });
    }
  }

  let retentionCapabilities = 0;
  for (const plugin of activePlugins) {
    const plan = plans.get(plugin)!;
    if (
      plan.scope === true ||
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
  const cacheable: SharedPhasePlan = {
    activePlugins,
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
  if (preparedCache.size < 64) preparedCache.set(preparedKey, cacheable);
  return { ...cacheable, plans, shared: cacheable };
}

const planCacheKeys = new WeakMap<PreparedPluginPlan, string>();
/** Prepared plans are immutable once built (and shared across files when fully
 * static), so their cache-key serialization is computed once per plan object. */
function pluginPlanCacheKey(plan: PreparedPluginPlan): string {
  let key = planCacheKeys.get(plan);
  if (key == null) {
    key = computePluginPlanCacheKey(plan);
    planCacheKeys.set(plan, key);
  }
  return key;
}

function computePluginPlanCacheKey(plan: PreparedPluginPlan): string {
  const fields = Object.entries(plan.fields ?? {})
    .map(([type, values]) => `${type}:${values?.join(',') ?? ''}`)
    .join(';');
  return [
    plan.enabled === false ? '0' : '1',
    plan.subscriptions.join(','),
    fields,
    plan.controlFlow?.join(',') ?? '*',
    plan.scope ? 'scope' : '',
    plan.metadataWrites?.join(',') ?? '',
    plan.phases?.join(',') ?? '',
    String(plan.ancestry ?? ''),
    stableJson(plan.children ?? null),
    stableJson(plan.queries ?? null),
    plan.editEffect ?? '',
    plan.resolvedVisitors
      .map(({ definition, enabled, where }) =>
        definition.contract.configure == null
          ? `${visitorStaticKey(definition)}:${enabled ? '1' : '0'}`
          : `${visitorStaticKey(definition)}:${enabled ? '1' : '0'}:${stableJson(where ?? null)}`,
      )
      .join('|'),
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
        controlFlow: plan.controlFlow,
        visitors: plan.resolvedVisitors.map(({ definition, enabled, where }) => ({
          route: definition.route,
          enabled,
          where: where ?? null,
          fields: definition.contract.fields,
          children: definition.contract.children ?? null,
          controlFlow: definition.contract.controlFlow,
          scope: definition.contract.scope,
          ancestry: definition.contract.ancestry ?? null,
          nested: definition.contract.nested.map(nested => ({
            route: nested.route,
            fields: nested.contract.fields,
          })),
        })),
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
    // Typed visitors compile directly: one route per (visitor, concrete type,
    // side), with the visitor's own predicates and payload — never lowered into
    // a plugin-wide aggregate.
    for (const { definition, enabled, where } of plans.get(plugin)!.resolvedVisitors) {
      if (!enabled) continue;
      const fast =
        !hasGlobalStop && definition.contract.controlFlow.length === 0 && plugin.analyze == null;
      const capabilities = typedCapabilities(definition);
      for (const { nodeType, predicates } of typedRouteExpansion(definition, where)) {
        for (const side of ['enter', 'exit'] as const) {
          const callback = definition[side];
          if (callback == null) continue;
          routes.push({
            id: routes.length,
            pluginId,
            nodeType,
            side,
            order: pluginId,
            predicates,
            payloadFields: definition.contract.fields,
            plugin,
            callbacks: [callback as Handler<any>],
            fast,
            capabilities,
          });
        }
      }
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
      open.members.push({
        plugin: route.plugin,
        callbacks: route.callbacks,
        capabilities: route.capabilities,
      });
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
      members: [
        { plugin: route.plugin, callbacks: route.callbacks, capabilities: route.capabilities },
      ],
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

/** Expand one typed visitor's route into concrete node types with merged predicates. */
function typedRouteExpansion(
  defined: DefinedVisitor<any>,
  where: Readonly<Partial<Record<string, ScalarPredicate>>> | undefined,
): { nodeType: string; predicates: Record<string, ScalarPredicate> }[] {
  const expansions: { nodeType: string; predicates: Record<string, ScalarPredicate> }[] = [];
  for (const part of defined.route.split('|')) {
    const aliasPredicates: Record<string, ScalarPredicate> = {};
    if (part === 'ReferencedIdentifier') aliasPredicates.global = { present: true };
    else if (isCollapsedFunctionKey(part) || isCollapsedClassKey(part))
      aliasPredicates.nodeKind = { equals: part };
    for (const nodeType of concreteRouteTypes(part)) {
      const predicates: Record<string, ScalarPredicate> = { ...aliasPredicates };
      for (const [field, predicate] of Object.entries(where ?? {})) {
        if (predicate == null) continue;
        predicates[field] = predicates[field]
          ? intersectPredicates(predicates[field], predicate)
          : predicate;
      }
      expansions.push({ nodeType, predicates });
    }
  }
  // Composite parts can expand to the same concrete route with identical
  // predicates (for example `Identifier|Expression`); one delivery, not two.
  const seen = new Set<string>();
  return expansions.filter(({ nodeType, predicates }) => {
    const key = `${nodeType}:${stableJson(predicates)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

type NestedVisitor = readonly DefinedVisitor<any>[];

const nestedRouteCaches = new WeakMap<object, CompiledNestedRoutes>();

export function compileNestedVisitor(visitor: NestedVisitor): CompiledNestedRoutes {
  const cached = nestedRouteCaches.get(visitor);
  if (cached) return cached;
  const variants: {
    nodeType: string;
    side: 'enter' | 'exit';
    predicates: Record<string, ScalarPredicate>;
    callbacks: readonly Handler<any>[];
  }[] = [];
  const capabilities: RouteCapabilities[] = [];
  const payloads: (readonly NativeFieldKey[])[] = [];
  for (const defined of visitor) {
    validateDefinedVisitor('nested', defined);
    if (defined.contract.configure != null)
      throw new Error(`nested visitor for ${defined.route} may not use configure`);
    const caps = typedCapabilities(defined);
    for (const { nodeType, predicates } of typedRouteExpansion(defined, defined.contract.where)) {
      for (const side of ['enter', 'exit'] as const) {
        const callback = defined[side];
        if (callback == null) continue;
        variants.push({ nodeType, side, predicates, callbacks: [callback as Handler<any>] });
        capabilities.push(caps);
        payloads.push([...defined.contract.fields]);
      }
    }
  }
  const routes: NativeRouteManifestEntry[] = variants.map((variant, id) => ({
    id,
    pluginId: 0,
    nodeType: variant.nodeType,
    side: variant.side,
    order: 0,
    predicates: variant.predicates,
    payloadFields: payloads[id],
  }));
  const compiled: CompiledNestedRoutes = {
    manifest: packRouteManifest(routes, true, true),
    callbacks: variants.map(variant => variant.callbacks),
    routes,
    capabilities,
  };
  nestedRouteCaches.set(visitor as object, compiled);
  return compiled;
}

function assertNestedFieldsDeclared(
  plugin: NativePlugin<any, any>,
  plan: Pick<PreparedPluginPlan, 'fields'> | undefined,
  routes: readonly NativeRouteManifestEntry[],
): void {
  for (const route of routes) {
    const declared = plan?.fields?.[route.nodeType as NativeNodeType] ?? [];
    for (const field of [...Object.keys(route.predicates), ...route.payloadFields])
      if (!declared.includes(field as NativeFieldKey))
        throw new Error(
          `${plugin.name}: nested traversal requires declared field ${route.nodeType}.${field}`,
        );
  }
}

export function nestedManifest(
  plugin: NativePlugin<any, any>,
  plan: Pick<PreparedPluginPlan, 'fields'> | undefined,
  compiled: CompiledNestedRoutes,
): Buffer {
  assertNestedFieldsDeclared(plugin, plan, compiled.routes);
  return packRouteManifest(
    compiled.routes.map(route => ({
      ...route,
      payloadFields: route.payloadFields,
    })),
    true,
    true,
  );
}
