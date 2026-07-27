import type {
  AncestryCapability,
  DefinedVisitor,
  Handler,
  NativePlugin,
} from '../contracts/visitor.js';
import type { NativeRouteManifestEntry } from '../protocol/manifest.js';
import type {
  ControlFlowCapability,
  EditEffect,
  NativeFieldKey,
  NativeNodeType,
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

export type PreparedPluginPlan = {
  editEffect?: EditEffect;
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

/** A phase prepared from its definitions.
 *
 * Memoised on the phase's identity: every plugin plan is fixed by its definition,
 * so there is nothing per-file to key on and this object is shared across files. */
export interface PreparedPhase {
  activePlugins: NativePlugin<any, any>[];
  plans: Map<NativePlugin<any, any>, PreparedPluginPlan>;
  subscriptions: Set<string>;
  fieldRequests: Record<string, string[]>;
  includeParent: boolean;
  includeScope: boolean;
  retentionCapabilities: number;
  compiledRoutes: readonly CompiledRouteTemplate[];
  dispatchRoutes: readonly DispatchRoute[];
  manifest: Buffer;
}
