import type {
  DefinedVisitor,
  Handler,
  NativePlugin,
  StoredVisitorContract,
} from '../contracts/visitor';
import type { NativeRouteManifestEntry } from '../protocol/manifest';
import type {
  ControlFlowCapability,
  EditEffect,
  NativeFieldKey,
  NativeNodeType,
  QueryRequest,
  ScalarPredicate,
} from '../types';

export interface RouteCapabilities {
  scope: boolean;
  ancestry: StoredVisitorContract['ancestry'];
  ancestorFields: Readonly<Partial<Record<string, readonly NativeFieldKey[]>>> | null;
  ancestorChildRules: Readonly<Partial<Record<string, readonly string[]>>> | null;
  childRules: Readonly<Partial<Record<string, readonly string[]>>> | null;
  controlFlow: readonly ControlFlowCapability[];
  declaredFields: readonly NativeFieldKey[];
  comments: 'inner' | undefined;
}

export type PreparedPluginPlan = {
  editEffect?: EditEffect;
  subscriptions: readonly string[];
  fields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  controlFlow?: readonly ControlFlowCapability[];
  scope?: boolean;
  queries?: readonly QueryRequest[];
  retainComments?: boolean;
  metadataWrites?: readonly string[];
  ancestry?: StoredVisitorContract['ancestry'];
  ancestryFields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  ancestryChildren?: Readonly<Partial<Record<string, readonly string[]>>>;
  ancestryTypes?: readonly NativeNodeType[];
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
  ancestorChildParentTypes: readonly string[];
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
  requiresIndexBase: boolean;
  structuralParentTypes: readonly string[];
  ancestorChildParentTypes: readonly string[];
  ancestryDepth: number;
  runtimeEditEffect: EditEffect;
  compiledRoutes: readonly CompiledRouteTemplate[];
  dispatchRoutes: readonly DispatchRoute[];
  manifest: Buffer;
}
