import type { ArtifactDemand } from './artifacts';
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
  childFields?: Readonly<Partial<Record<string, readonly NativeFieldKey[]>>>;
  comments: 'inner' | undefined;
  cacheAncestorPaths: boolean;
  ancestryDepthLimit: number;
}

export type PreparedPluginPlan = {
  subscriptions: readonly string[];
  fields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  controlFlow?: readonly ControlFlowCapability[];
  scope?: boolean;
  queries?: readonly QueryRequest[];
  retainComments?: boolean;
  metadataWrites?: ReadonlySet<string>;
  queryCapabilities?: ReadonlySet<string>;
  ancestry?: StoredVisitorContract['ancestry'];
  ancestryFields?: Readonly<Partial<Record<NativeNodeType, readonly NativeFieldKey[]>>>;
  ancestryChildren?: Readonly<Partial<Record<string, readonly string[]>>>;
  ancestryTypes?: readonly NativeNodeType[];
  children?: Readonly<Partial<Record<string, readonly string[]>>>;
  selectorChildren?: Readonly<Partial<Record<string, readonly string[]>>>;
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
    pluginId: number;
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
  childPrefetch: ChildPrefetchPlan | undefined;
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
  childPrefetch: ChildPrefetchPlan | undefined;
  artifactDemand: ArtifactDemand;
  activePlugins: NativePlugin<any, any>[];
  plans: Map<NativePlugin<any, any>, PreparedPluginPlan>;
  metadataConflict?: string;
  subscriptions: Set<string>;
  fieldRequests: Record<string, string[]>;
  includeParent: boolean;
  includeScope: boolean;
  retentionCapabilities: number;
  requiresIndexBase: boolean;
  structuralParentTypes: readonly string[];
  runtimeEditEffect: EditEffect;
  compiledRoutes: readonly CompiledRouteTemplate[];
  dispatchRoutes: readonly DispatchRoute[];
  manifest: Buffer;
}

/** Indexed by delivery route; members retain their compiled plugin identity. */
export type ChildPrefetchPlan = readonly (readonly {
  pluginId: number;
  capabilities: RouteCapabilities;
}[])[];
