import { shareManifest } from '../native/manifest';
import {
  CHILD_ROLES,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
} from '../generated/event-schema';
import { maxEditEffect } from './compile';
import { stableJson } from './cache-key';
import {
  concreteRouteTypes,
  isCollapsedClassKey,
  isCollapsedFunctionKey,
  validatePredicates,
  validateRouteSpec,
  type PredicateRequirements,
} from './validate';
import type {
  CompiledNestedRoutes,
  CompiledPhaseRoutes,
  CompiledRouteTemplate,
  DispatchRoute,
  PreparedPhase,
  PreparedPluginPlan,
  ResolvedVisitor,
  RouteCapabilities,
} from './types';
import { packRouteManifest, type NativeRouteManifestEntry } from '../protocol/manifest';
import type {
  ChildContract,
  DefinedVisitor,
  Handler,
  NativePlugin,
  PipelinePhase,
  StoredVisitorContract,
  VisitorRouteSpec,
} from '../contracts/visitor';
import type {
  ControlFlowCapability,
  NativeFieldKey,
  NativeNodeType,
  QueryRequest,
  ScalarPredicate,
  ScalarValue,
} from '../types';

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
  for (const [route, requirement] of Object.entries(defined.contract.ancestry?.routes ?? {})) {
    validateRouteSpec(pluginName, 'ancestry route', route);
    validateChildren(route, requirement.children);
  }
  validatedVisitors.add(defined);
}

function resolveTypedVisitors(plugin: NativePlugin<any, any>): ResolvedVisitor[] {
  const resolved: ResolvedVisitor[] = [];
  for (const defined of plugin.visitors!) {
    validateDefinedVisitor(plugin.name, defined);
    const contract = defined.contract;
    const where: Record<string, ScalarPredicate> | undefined =
      contract.where == null
        ? undefined
        : (Object.fromEntries(
            Object.entries(contract.where).filter(([, predicate]) => predicate != null),
          ) as Record<string, ScalarPredicate>);
    resolved.push({ definition: defined, where });
  }
  return resolved;
}

/**
 * Aggregate the native phase requirements of a typed plugin's enabled visitors
 * into the plan shape the phase machinery consumes. Predicates deliberately stay
 * per-visitor (they compile per route); everything here is unioned native work.
 */
// Body editing is available on every delivered path. These two internal offsets
// are required for function containers even when scalar node fields are omitted.
function bodyEditFields(type: string, fields: readonly NativeFieldKey[]): NativeFieldKey[] {
  return type === 'Function' || type === 'ArrowFunctionExpression'
    ? [...new Set<NativeFieldKey>([...fields, 'bodyStart', 'bodyEnd'])]
    : [...fields];
}

function synthesizeVisitorPlan(
  plugin: NativePlugin<any, any>,
  resolved: readonly ResolvedVisitor[],
): PreparedPluginPlan & { metadataWrites?: readonly string[]; queries?: readonly QueryRequest[] } {
  const subscriptions: VisitorRouteSpec[] = [];
  const fields: Record<string, NativeFieldKey[]> = {};
  const children: Record<string, string[]> = {};
  const controlFlow = new Set<ControlFlowCapability>();
  let scope = false;
  let retainComments = false;
  let ancestry: PreparedPluginPlan['ancestry'];
  const ancestryFields: Record<string, NativeFieldKey[]> = {};
  const ancestryChildren: Record<string, string[]> = {};
  const ancestryTypes = new Set<NativeNodeType>();
  const pending = resolved.map(({ definition }) => definition);
  for (let index = 0; index < pending.length; index++) {
    const definition = pending[index];
    validateDefinedVisitor(plugin.name, definition);
    pending.push(...definition.contract.nested);
    const contract = definition.contract;
    if (index < resolved.length) subscriptions.push(definition.route);
    retainComments ||= contract.comments === 'inner';
    for (const { nodeType, predicates } of typedRouteExpansion(definition, contract.where))
      mergeFieldRequests(fields, { [nodeType]: Object.keys(predicates) as NativeFieldKey[] });
    for (const concrete of concreteRouteTypes(definition.route)) {
      const applicable = bodyEditFields(concrete, contract.fields).filter(field =>
        PREDICATE_FIELDS[concrete]?.includes(field),
      );
      if (applicable.length > 0) mergeFieldRequests(fields, { [concrete]: applicable });
    }
    attachDeclaredChildren(
      children,
      fields,
      concreteRouteTypes(definition.route),
      contract.children,
    );
    for (const capability of contract.controlFlow) controlFlow.add(capability);
    if (
      contract.controlFlow.some(
        capability => capability === 'nested-traverse' || capability === 'dynamic-subscriptions',
      )
    )
      for (const type of ['Function', 'ArrowFunctionExpression'])
        mergeFieldRequests(fields, { [type]: bodyEditFields(type, []) });
    scope ||= contract.scope;
    if (contract.ancestry != null) {
      ancestry = mergeAncestry(ancestry, contract.ancestry);
      for (const [route, requirement] of Object.entries(contract.ancestry.routes)) {
        const ancestorTypes = concreteRouteTypes(route);
        for (const type of ancestorTypes) ancestryTypes.add(type as NativeNodeType);
        for (const concrete of ancestorTypes) {
          const applicable = bodyEditFields(concrete, requirement.fields ?? []).filter(field =>
            PREDICATE_FIELDS[concrete]?.includes(field),
          );
          if (applicable.length > 0) mergeFieldRequests(ancestryFields, { [concrete]: applicable });
        }
        attachDeclaredChildren(
          ancestryChildren,
          ancestryFields,
          ancestorTypes,
          requirement.children,
        );
      }
    }
  }

  return {
    subscriptions,
    retainComments,
    fields: fields as PreparedPluginPlan['fields'],
    children: Object.keys(children).length > 0 ? children : undefined,
    controlFlow: controlFlow.size > 0 ? [...controlFlow] : undefined,
    scope: scope || undefined,
    ancestry,
    ancestryFields:
      Object.keys(ancestryFields).length > 0
        ? (ancestryFields as PreparedPluginPlan['ancestryFields'])
        : undefined,
    ancestryChildren: Object.keys(ancestryChildren).length > 0 ? ancestryChildren : undefined,
    ancestryTypes: ancestryTypes.size > 0 ? [...ancestryTypes] : undefined,
    resolvedVisitors: resolved,
  };
}

function attachChildProjectionDependencies(
  target: Record<string, string[]>,
  parentType: string,
  declared: Readonly<Record<string, ChildContract>>,
): void {
  const requested = Object.keys(declared);
  const needsFormalParameters = Object.entries(CHILD_ROLES[parentType] ?? {}).some(
    ([role, metadata]) =>
      metadata.native.projection === 'formalParameters' &&
      (requested.includes('*') || requested.includes(role)),
  );
  if (needsFormalParameters) {
    const dependencies = (target.FormalParameters ??= []);
    if (!dependencies.includes('*')) dependencies.push('*');
  }
}

function attachDeclaredChildren(
  roles: Record<string, string[]>,
  fields: Record<string, NativeFieldKey[]>,
  parentTypes: readonly string[],
  declared: Readonly<Record<string, ChildContract>> | undefined,
): void {
  if (declared == null) return;
  for (const parentType of parentTypes) {
    const collected = (roles[parentType] ??= []);
    for (const role of Object.keys(declared)) {
      if ((role === '*' || CHILD_ROLES[parentType]?.[role] != null) && !collected.includes(role))
        collected.push(role);
    }
    attachChildProjectionDependencies(roles, parentType, declared);
  }
  for (const child of Object.values(declared)) {
    const childTypes = concreteRouteTypes(child.route);
    for (const concrete of childTypes) {
      const applicable = bodyEditFields(concrete, child.fields ?? []).filter(field =>
        PREDICATE_FIELDS[concrete]?.includes(field),
      );
      if (applicable.length > 0) mergeFieldRequests(fields, { [concrete]: applicable });
    }
    attachDeclaredChildren(roles, fields, childTypes, child.children);
  }
}

function ancestryReach(mode: NonNullable<PreparedPluginPlan['ancestry']>['mode']): number {
  if (typeof mode === 'number') return mode;
  return mode === 'parent' ? 1 : Number.POSITIVE_INFINITY;
}

function mergeAncestry(
  left: PreparedPluginPlan['ancestry'],
  right: NonNullable<PreparedPluginPlan['ancestry']>,
): NonNullable<PreparedPluginPlan['ancestry']> {
  if (left == null) return right;
  const leftReach = ancestryReach(left.mode);
  const rightReach = ancestryReach(right.mode);
  const mode =
    rightReach > leftReach
      ? right.mode
      : leftReach > rightReach
        ? left.mode
        : left.mode === 'programParent' || right.mode === 'programParent'
          ? 'programParent'
          : left.mode === 'functionParent' || right.mode === 'functionParent'
            ? 'functionParent'
            : left.mode;
  const routes: Record<
    string,
    {
      readonly fields: readonly NativeFieldKey[];
      readonly children: Readonly<Record<string, ChildContract>> | undefined;
    }
  > = {};
  for (const route of new Set([...Object.keys(left.routes), ...Object.keys(right.routes)])) {
    const first = left.routes[route];
    const second = right.routes[route];
    const fields = [...new Set([...(first?.fields ?? []), ...(second?.fields ?? [])])];
    routes[route] = Object.freeze({
      fields,
      children: mergeChildContracts(first?.children, second?.children),
    });
  }
  return Object.freeze({
    mode,
    routes: Object.freeze(routes),
  });
}

function mergeChildContracts(
  left: Readonly<Record<string, ChildContract>> | undefined,
  right: Readonly<Record<string, ChildContract>> | undefined,
): Readonly<Record<string, ChildContract>> | undefined {
  if (left == null) return right;
  if (right == null) return left;
  const result: Record<string, ChildContract> = {};
  for (const role of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const first = left[role];
    const second = right[role];
    if (first == null || second == null) {
      result[role] = (first ?? second)!;
      continue;
    }
    result[role] = Object.freeze({
      route: (first.route === second.route
        ? first.route
        : [first.route, second.route].join('|')) as VisitorRouteSpec,
      fields: [...new Set([...(first.fields ?? []), ...(second.fields ?? [])])],
      children: mergeChildContracts(first.children, second.children),
    });
  }
  return Object.freeze(result);
}

const typedCapabilitiesCache = new WeakMap<DefinedVisitor<any>, RouteCapabilities>();
function typedCapabilities(defined: DefinedVisitor<any>): RouteCapabilities {
  let capabilities = typedCapabilitiesCache.get(defined);
  if (!capabilities) {
    const contract = defined.contract;
    let childRules: Record<string, string[]> | null = null;
    const childFields: Record<string, NativeFieldKey[]> = {};
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
        for (const child of Object.values(children)) {
          const types = concreteRouteTypes(child.route);
          for (const type of types)
            childFields[type] = [
              ...new Set([...(childFields[type] ?? []), ...(child.fields ?? [])]),
            ];
          if (child.children != null) attach(types, child.children);
        }
      };
      attach(concreteRouteTypes(defined.route), contract.children);
      childRules = rules;
    }
    capabilities = {
      scope: contract.scope,
      ancestry: contract.ancestry,
      ancestorFields: ancestryRules(
        contract.ancestry,
        'fields',
      ) as RouteCapabilities['ancestorFields'],
      ancestorChildRules: ancestryRules(contract.ancestry, 'children'),
      childRules,
      controlFlow: contract.controlFlow,
      declaredFields: contract.fields,
      childFields,
      comments: contract.comments,
    };
    typedCapabilitiesCache.set(defined, capabilities);
  }
  return capabilities!;
}

function ancestryRules(
  ancestry: StoredVisitorContract['ancestry'],
  kind: 'fields' | 'children',
): Record<string, string[]> | null {
  if (ancestry == null) return null;
  const rules: Record<string, string[]> = {};
  const attach = (
    route: string,
    fields: readonly NativeFieldKey[],
    children: Readonly<Record<string, ChildContract>> | undefined,
  ) => {
    for (const type of concreteRouteTypes(route)) {
      const values = kind === 'fields' ? fields : Object.keys(children ?? {});
      const target = (rules[type] ??= []);
      for (const value of values) if (!target.includes(value)) target.push(value);
    }
    for (const child of Object.values(children ?? {}))
      attach(child.route, child.fields ?? [], child.children);
  };
  for (const [route, requirement] of Object.entries(ancestry.routes)) {
    attach(route, requirement.fields, requirement.children);
  }
  return rules;
}

/** A plugin's plan is fixed by its definition, and a phase's preparation by the
 * frozen plugin list behind it, so both are stored on identity. There is no
 * per-file value to key on: predicate values are bound with
 * `plugin.withParameters` at configuration scope, and enablement is expressed by
 * whether a plugin is in the phase at all.
 *
 * `definePipelinePhase` and `defineNativePipeline` prepare plugin phases as soon as
 * they intern them, so these hold results rather than acting as caches. The
 * get-or-compute below only matters for a phase that reached a transform without
 * being defined through either. */
const pluginPlans = new WeakMap<NativePlugin<any, any>, PreparedPluginPlan>();
const preparedPhases = new WeakMap<PipelinePhase, PreparedPhase>();

const RETAIN_IDENTIFIERS = 1 << 0;
const RETAIN_CONSTANTS = 1 << 1;
const RETAIN_CALLS = 1 << 2;
const RETAIN_CHILDREN = 1 << 3;
const RETAIN_INSPECTION = 1 << 4;
const RETAIN_MODULE_FACTS = 1 << 5;
const RETAIN_COMMENTS = 1 << 6;

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

function mergeChildRoleRequests(
  target: Record<string, string[]>,
  source: Readonly<Partial<Record<string, readonly string[]>>> | undefined,
): void {
  for (const [type, roles] of Object.entries(source ?? {})) {
    if (roles == null) continue;
    const merged = (target[type] ??= []);
    for (const role of roles) if (!merged.includes(role)) merged.push(role);
  }
}

interface RetentionFacts {
  childRoles: Record<string, string[]>;
  fields: Record<string, string[]>;
  ancestorFields: Record<string, string[]>;
  ancestorTypes: Set<string>;
  ancestorChildParentTypes: Set<string>;
  ancestryDepth: number;
}

export function createRetentionFacts(): RetentionFacts {
  return {
    childRoles: {},
    fields: {},
    ancestorFields: {},
    ancestorTypes: new Set(),
    ancestorChildParentTypes: new Set(),
    ancestryDepth: 0,
  };
}

export function accumulateRetention(
  facts: RetentionFacts,
  plugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
): void {
  for (const plugin of plugins) {
    const plan = plans.get(plugin);
    mergeChildRoleRequests(facts.childRoles, plan?.children);
    mergeChildRoleRequests(facts.childRoles, plan?.ancestryChildren);
  }
  for (const plugin of plugins) {
    const fields = plans.get(plugin)?.fields;
    if (fields != null) mergeFieldRequests(facts.fields, fields);
  }
  for (const plugin of plugins) {
    const plan = plans.get(plugin);
    if (plan == null) continue;
    if (plan.ancestryFields != null) {
      mergeFieldRequests(facts.fields, plan.ancestryFields);
      mergeFieldRequests(facts.ancestorFields, plan.ancestryFields);
    }
    for (const type of plan.ancestryTypes ?? []) facts.ancestorTypes.add(type);
    for (const type of Object.keys(plan.ancestryChildren ?? {}))
      facts.ancestorChildParentTypes.add(type);
    if (plan.ancestry != null)
      facts.ancestryDepth = Math.max(facts.ancestryDepth, ancestryReach(plan.ancestry.mode));
  }
}

/** The plan a plugin's definition implies, synthesized once per plugin. */
function pluginPlan(plugin: NativePlugin<any, any>): PreparedPluginPlan {
  let plan = pluginPlans.get(plugin);
  if (plan != null) return plan;
  const syntax = plugin.contract?.syntax;
  if (
    syntax != null &&
    (!Array.isArray(syntax.anyOf) ||
      syntax.anyOf.length === 0 ||
      syntax.anyOf.some(
        feature =>
          feature !== 'AsyncFunction' &&
          feature !== 'GeneratorFunction' &&
          !NODE_TYPE_IDS.has(feature),
      ))
  )
    throw new Error(`${plugin.name}: syntax.anyOf requires a nonempty list of syntax features`);
  plan = synthesizeVisitorPlan(plugin, plugin.visitors == null ? [] : resolveTypedVisitors(plugin));
  // Plugin-contract requirements union with the visitor-derived plan.
  if (plugin.contract != null) {
    plan.metadataWrites = [
      ...new Set([...(plan.metadataWrites ?? []), ...(plugin.contract.metadata?.writes ?? [])]),
    ];
    plan.queries = [...(plan.queries ?? []), ...(plugin.contract.queries ?? [])];
  }
  pluginPlans.set(plugin, plan);
  return plan;
}

// Applicability changes only the plugin subset, not the plugins' contracts.
// Cap cached subsets so highly variable files cannot grow a phase cache forever.
const applicablePhases = new WeakMap<PipelinePhase, Map<string, PreparedPhase>>();

export function prepareApplicablePhase(
  phase: PipelinePhase,
  facts: ReadonlySet<string> | null,
): PreparedPhase {
  // Public callers may pass a pipeline directly to transform. Validate its
  // complete definition before applicability can hide an invalid contract.
  const complete = preparePhase(phase);
  if (facts == null) return complete;
  const plugins = complete.activePlugins;
  let key = '';
  const active = plugins.filter(plugin => {
    const applicable =
      plugin.contract?.syntax == null ||
      plugin.contract.syntax.anyOf.some(feature => facts.has(feature));
    key += applicable ? '1' : '0';
    return applicable;
  });
  if (active.length === plugins.length) return complete;
  let cache = applicablePhases.get(phase);
  const cached = cache?.get(key);
  if (cached != null) return cached;
  const prepared = preparePhase({ ...phase, plugins: active });
  if (cache == null) applicablePhases.set(phase, (cache = new Map()));
  if (cache.size < 32) cache.set(key, prepared);
  return prepared;
}

export function preparePhase(phase: PipelinePhase): PreparedPhase {
  const cached = preparedPhases.get(phase);
  if (cached != null) return cached;
  const activePlugins = [...(phase.plugins ?? [])];
  const plans = new Map<NativePlugin<any, any>, PreparedPluginPlan>();
  for (const plugin of activePlugins) plans.set(plugin, pluginPlan(plugin));
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
    mergeFieldRequests(fieldRequests, plan.ancestryFields ?? {});
    for (const { definition, where } of plan.resolvedVisitors) {
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
    if (plan.retainComments) retentionCapabilities |= RETAIN_COMMENTS;
    if (plan.children && Object.keys(plan.children).length > 0)
      retentionCapabilities |= RETAIN_CHILDREN;
    if (plan.ancestryChildren && Object.keys(plan.ancestryChildren).length > 0)
      retentionCapabilities |= RETAIN_CHILDREN;
    if (
      plan.controlFlow?.includes('nested-traverse') ||
      plan.controlFlow?.includes('dynamic-subscriptions')
    )
      retentionCapabilities |= RETAIN_INSPECTION;
  }
  const routed = compilePhaseRoutes(
    activePlugins,
    plans,
    includeParent,
    includeScope,
    retentionCapabilities,
  );
  const requiresNativeQueries = activePlugins.some(
    plugin => (plans.get(plugin)?.queries?.length ?? 0) > 0,
  );
  const structuralParentTypes = [
    ...new Set(activePlugins.flatMap(plugin => Object.keys(plans.get(plugin)?.children ?? {}))),
  ];
  const prepared: PreparedPhase = {
    activePlugins,
    plans,
    subscriptions,
    fieldRequests,
    includeParent,
    includeScope,
    retentionCapabilities,
    requiresIndexBase:
      requiresNativeQueries ||
      (retentionCapabilities & (RETAIN_CHILDREN | RETAIN_INSPECTION)) !== 0 ||
      activePlugins.some(plugin => Object.keys(plans.get(plugin)?.ancestryFields ?? {}).length > 0),
    structuralParentTypes,
    runtimeEditEffect:
      phase.editEffect ??
      maxEditEffect(activePlugins.map(plugin => plugin.editEffect ?? 'whole-program')),
    compiledRoutes: routed.routes,
    dispatchRoutes: routed.dispatchRoutes,
    manifest: routed.manifest,
  };
  preparedPhases.set(phase, prepared);
  return prepared;
}

/** Deterministic retention diagnostics for tests and development tooling. This
 * intentionally derives from the already-prepared plan and adds no native wire
 * or production serialization cost. */
export function inspectPreparedPhaseRetention(phase: PipelinePhase) {
  const prepared = preparePhase(phase);
  const childRoles: Record<string, string[]> = {};
  for (const plugin of prepared.activePlugins) {
    const plan = prepared.plans.get(plugin);
    mergeChildRoleRequests(childRoles, plan?.children);
    mergeChildRoleRequests(childRoles, plan?.ancestryChildren);
  }
  for (const roles of Object.values(childRoles)) roles.sort();
  const concreteTypes = NODE_TYPES.filter(type => type !== '');
  const structural = new Set(prepared.structuralParentTypes);
  const wildcardParents = Object.entries(childRoles)
    .filter(([, roles]) => roles.includes('*'))
    .map(([type]) => type)
    .sort();
  return Object.freeze({
    structuralParentTypeCount: structural.size,
    includesEveryConcreteType: concreteTypes.every(type => structural.has(type)),
    structuralParentTypes: Object.freeze([...structural].sort()),
    childRoles: Object.freeze(childRoles),
    wildcardParents: Object.freeze(wildcardParents),
    scalarFields: Object.freeze(
      Object.fromEntries(
        Object.entries(prepared.fieldRequests).map(([type, fields]) => [
          type,
          Object.freeze([...fields].sort()),
        ]),
      ),
    ),
  });
}

function compilePhaseRoutes(
  plugins: readonly NativePlugin<any, any>[],
  plans: ReadonlyMap<NativePlugin<any, any>, PreparedPluginPlan>,
  includeParent: boolean,
  includeScope: boolean,
  retentionCapabilities: number,
): CompiledPhaseRoutes {
  const hasGlobalStop = plugins.some(plugin =>
    plans.get(plugin)?.controlFlow?.includes('stop-all'),
  );
  const routes: CompiledRouteTemplate[] = [];
  // Fast routes may bypass the checked dispatcher only when no plugin-level
  // analysis or control-flow decision can change delivery for another route.
  // Global stop makes every route dynamic, including otherwise static peers.
  const fastRouteEligible = (plugin: NativePlugin<any, any>, definition: DefinedVisitor<any>) =>
    !hasGlobalStop &&
    (plans.get(plugin)?.controlFlow?.length ?? 0) === 0 &&
    definition.contract.controlFlow.length === 0 &&
    plugin.analyze == null;
  for (let pluginId = 0; pluginId < plugins.length; pluginId++) {
    const plugin = plugins[pluginId];
    // Typed visitors compile directly: one route per (visitor, concrete type,
    // side), with the visitor's own predicates and payload — never lowered into
    // a plugin-wide aggregate.
    for (const { definition, where } of plans.get(plugin)!.resolvedVisitors) {
      const fast = fastRouteEligible(plugin, definition);
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
            payloadFields: bodyEditFields(nodeType, definition.contract.fields),
            comments: definition.contract.comments,
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
    const contract = `${route.fast}:${stableJson(route.predicates)}:${route.payloadFields.join(',')}:${route.comments ?? ''}`;
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
      comments: route.comments,
      fast: route.fast,
      contract,
      members: [
        { plugin: route.plugin, callbacks: route.callbacks, capabilities: route.capabilities },
      ],
    };
    openGroups.set(bucket, grouped);
    dispatchRoutes.push(grouped);
  }
  const retained = createRetentionFacts();
  accumulateRetention(retained, plugins, plans);
  const manifest = shareManifest(
    packRouteManifest(
      dispatchRoutes,
      includeParent,
      includeScope,
      retentionCapabilities,
      retained.childRoles,
      retained.fields,
      retained.ancestorFields,
      [...retained.ancestorTypes],
      [...retained.ancestorChildParentTypes],
      retained.ancestryDepth,
      plugins.some(plugin => plans.get(plugin)?.controlFlow?.includes('skip')),
    ),
  );
  return { routes, dispatchRoutes, manifest };
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
      if (
        (nodeType === 'Function' || nodeType === 'Class') &&
        ['Expression', 'Declaration', 'Statement'].includes(part)
      )
        predicates.nodeKind = {
          equals: `${nodeType}${part === 'Expression' ? 'Expression' : 'Declaration'}`,
        };
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
  // Both sides are validated predicates by now, so neither carries a parameter.
  const leftValues = ('equals' in left ? [left.equals] : left.oneOf) as readonly ScalarValue[];
  const rightValues = ('equals' in right ? [right.equals] : right.oneOf) as readonly ScalarValue[];
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
    comments: 'inner' | undefined;
  }[] = [];
  const capabilities: RouteCapabilities[] = [];
  const payloads: (readonly NativeFieldKey[])[] = [];
  const ancestorFields: Record<string, string[]> = {};
  const ancestorTypes = new Set<string>();
  const ancestorChildParentTypes = new Set<string>();
  let ancestryDepth = 0;
  for (const defined of visitor) {
    validateDefinedVisitor('nested', defined);
    const caps = typedCapabilities(defined);
    if (defined.contract.ancestry != null) {
      ancestryDepth = Math.max(ancestryDepth, ancestryReach(defined.contract.ancestry.mode));
      const attach = (
        route: string,
        fields: readonly NativeFieldKey[],
        children: Readonly<Record<string, ChildContract>> | undefined,
      ) => {
        const concreteTypes = concreteRouteTypes(route);
        for (const type of concreteTypes) ancestorTypes.add(type);
        if (fields.length > 0)
          for (const type of concreteTypes) mergeFieldRequests(ancestorFields, { [type]: fields });
        if (children != null) {
          for (const type of concreteTypes) ancestorChildParentTypes.add(type);
          for (const child of Object.values(children))
            attach(child.route, child.fields ?? [], child.children);
        }
      };
      for (const [route, requirement] of Object.entries(defined.contract.ancestry.routes))
        attach(route, requirement.fields, requirement.children);
    }
    for (const { nodeType, predicates } of typedRouteExpansion(defined, defined.contract.where)) {
      for (const side of ['enter', 'exit'] as const) {
        const callback = defined[side];
        if (callback == null) continue;
        variants.push({
          nodeType,
          side,
          predicates,
          callbacks: [callback as Handler<any>],
          comments: defined.contract.comments,
        });
        capabilities.push(caps);
        payloads.push(bodyEditFields(nodeType, defined.contract.fields));
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
    comments: variant.comments,
  }));
  const requirements = synthesizeVisitorPlan(
    { name: 'nested' },
    visitor.map(definition => ({
      definition,
      where: definition.contract.where as ResolvedVisitor['where'],
    })),
  );
  const retainedFields: Record<string, string[]> = {};
  mergeFieldRequests(retainedFields, requirements.fields ?? {});
  mergeFieldRequests(retainedFields, ancestorFields);
  const childRetention: Record<string, string[]> = {};
  mergeChildRoleRequests(childRetention, requirements.children);
  mergeChildRoleRequests(childRetention, requirements.ancestryChildren);
  const compiled: CompiledNestedRoutes = {
    manifest: shareManifest(
      packRouteManifest(
        routes,
        true,
        true,
        0,
        childRetention,
        retainedFields,
        ancestorFields,
        [...ancestorTypes],
        [...ancestorChildParentTypes],
        ancestryDepth,
      ),
    ),
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
    const declared = bodyEditFields(
      route.nodeType,
      plan?.fields?.[route.nodeType as NativeNodeType] ?? [],
    );
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
  return compiled.manifest;
}
