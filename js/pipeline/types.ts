import type {
  AncestryCapability,
  DefinedVisitor,
  Handler,
  NativePlugin,
} from '../contracts/visitor.js';
import type { NativeRouteManifestEntry } from '../protocol/manifest.js';
import type {
  ControlFlowCapability,
  NativeFieldKey,
  NativeNodeType,
  PluginPlan,
  QueryRequest,
  ScalarPredicate,
} from '../types.js';

export interface RouteCapabilities {
  scope: boolean;
  ancestry: boolean;
  childRules: Readonly<Partial<Record<string, readonly string[]>>> | null;
  controlFlow: readonly ControlFlowCapability[];
  declaredFields: readonly NativeFieldKey[];
}

export type PreparedPluginPlan = PluginPlan & {
  subscriptions: readonly string[];
  fields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  controlFlow?: readonly ControlFlowCapability[];
  scope?: boolean;
  queries?: readonly QueryRequest[];
  metadataWrites?: readonly string[];
  ancestry?: AncestryCapability;
  children?: Readonly<Partial<Record<string, readonly string[]>>>;
  resolvedVisitors: readonly ResolvedVisitor[];
};

export interface ResolvedVisitor {
  definition: DefinedVisitor<any>;
  enabled: boolean;
  where: Readonly<Record<string, ScalarPredicate>> | undefined;
}

export interface CompiledRouteTemplate extends NativeRouteManifestEntry {
  plugin: NativePlugin<any, any>;
  callbacks: readonly Handler<any>[];
  fast: boolean;
  capabilities: RouteCapabilities;
}

export interface DispatchRoute extends NativeRouteManifestEntry {
  fast: boolean;
  contract: string;
  members: {
    plugin: NativePlugin<any, any>;
    callbacks: readonly Handler<any>[];
    capabilities: RouteCapabilities;
  }[];
}

export interface CompiledPhaseRoutes {
  routes: CompiledRouteTemplate[];
  dispatchRoutes: DispatchRoute[];
  manifest: Buffer;
}

export interface CompiledNestedRoutes {
  manifest: Buffer;
  callbacks: readonly (readonly Handler<any>[])[];
  routes: readonly NativeRouteManifestEntry[];
  capabilities: readonly RouteCapabilities[];
}

/** Everything about a prepared phase that depends only on its plan shape.
 *
 * Interned per `(phase, plan shape)`, so its object identity is a cache key for
 * work derived from a sequence of prepared phases. */
export interface SharedPhasePlan {
  activePlugins: NativePlugin<any, any>[];
  subscriptions: Set<string>;
  fieldRequests: Record<string, string[]>;
  includeParent: boolean;
  includeScope: boolean;
  retentionCapabilities: number;
  compiledRoutes: readonly CompiledRouteTemplate[];
  dispatchRoutes: readonly DispatchRoute[];
  manifest: Buffer;
}

export interface PreparedPhase extends SharedPhasePlan {
  plans: Map<NativePlugin<any, any>, PreparedPluginPlan>;
  /** Identity of the interned plan shape behind this preparation. */
  shared: SharedPhasePlan;
}
