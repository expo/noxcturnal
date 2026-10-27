import type { PreparedPhase } from './types';
import type { NativeSelector } from '../protocol/manifest';

/**
 * Derived products that a phase may demand from an immutable source version.
 *
 * Keep implication rules here rather than scattering them through the phase
 * scheduler. The representation is a bit set so plans remain cheap to cache.
 */
export enum ArtifactDemand {
  None = 0,
  RenderedText = 1 << 0,
  SyntaxRoute = 1 << 1,
  StructuralParents = 1 << 2,
  StructuralChildren = 1 << 3,
  DirectScalarFields = 1 << 4,
  LexicalScopes = 1 << 5,
  BindingsReferences = 1 << 6,
  ModuleFacts = 1 << 7,
  RealizedMap = 1 << 8,
}

const SYNTAX =
  ArtifactDemand.SyntaxRoute |
  ArtifactDemand.StructuralParents |
  ArtifactDemand.StructuralChildren |
  ArtifactDemand.DirectScalarFields |
  ArtifactDemand.ModuleFacts;
const SEMANTICS = ArtifactDemand.LexicalScopes | ArtifactDemand.BindingsReferences;

export type ArtifactPlan =
  | 'cached'
  | 'render-only'
  | 'render-and-map'
  | 'stateless-syntax'
  | 'retained-syntax'
  | 'retained-semantic';

/** Close the generic demand implications for one source version. */
export function closeArtifactDemand(demand: ArtifactDemand): ArtifactDemand {
  let closed = demand;
  if (closed & SEMANTICS) closed |= ArtifactDemand.SyntaxRoute;
  if (closed & (SYNTAX | SEMANTICS)) closed |= ArtifactDemand.RenderedText;
  if (closed & ArtifactDemand.RealizedMap) closed |= ArtifactDemand.RenderedText;
  return closed;
}

/** Select the smallest construction path satisfying uncached demand. */
export function planArtifacts(
  demand: ArtifactDemand,
  available: ArtifactDemand = ArtifactDemand.None,
  retain = false,
): ArtifactPlan {
  const missing = closeArtifactDemand(demand) & ~closeArtifactDemand(available);
  if (missing === ArtifactDemand.None) return 'cached';
  if (missing & SEMANTICS) return 'retained-semantic';
  if (missing & SYNTAX) return retain ? 'retained-syntax' : 'stateless-syntax';
  if (missing & ArtifactDemand.RealizedMap) return 'render-and-map';
  return 'render-only';
}

export function hasSemanticDemand(demand: ArtifactDemand): boolean {
  return (closeArtifactDemand(demand) & SEMANTICS) !== 0;
}

const SEMANTIC_ROUTE_FIELDS = new Set([
  'global',
  'read',
  'write',
  'bindingScopeId',
  'calleeGlobal',
  'rootGlobal',
]);

function routeFieldNeedsSemantics(nodeType: string, field: string): boolean {
  return SEMANTIC_ROUTE_FIELDS.has(field) && (field !== 'write' || nodeType === 'Identifier');
}

function selectorNeedsSemantics(selector: NativeSelector | undefined): boolean {
  return (
    selector?.variants.some(
      variant =>
        Object.keys(variant.predicates).some(field =>
          routeFieldNeedsSemantics(variant.nodeType, field),
        ) ||
        selectorNeedsSemantics(variant.parent) ||
        variant.children.some(child => selectorNeedsSemantics(child.selector)),
    ) === true
  );
}

/** Compile definition-derived requirements once, independently of a file's
 * source version and the execution boundary's base demand. */
export function phaseArtifactDemand(
  prepared: Pick<
    PreparedPhase,
    | 'includeParent'
    | 'structuralParentTypes'
    | 'includeScope'
    | 'retentionCapabilities'
    | 'compiledRoutes'
  >,
): ArtifactDemand {
  let demand = ArtifactDemand.None;
  if (prepared.includeParent) demand |= ArtifactDemand.StructuralParents;
  if (prepared.structuralParentTypes.length > 0) demand |= ArtifactDemand.StructuralChildren;
  if (prepared.includeScope) demand |= ArtifactDemand.LexicalScopes;
  if (prepared.retentionCapabilities & (1 << 1)) demand |= ArtifactDemand.DirectScalarFields;
  if (prepared.retentionCapabilities & (1 << 5)) demand |= ArtifactDemand.ModuleFacts;
  if (
    prepared.retentionCapabilities & ((1 << 0) | (1 << 2)) ||
    prepared.compiledRoutes.some(
      route =>
        selectorNeedsSemantics(route.selector) ||
        route.payloadFields.some(field => routeFieldNeedsSemantics(route.nodeType, field)) ||
        Object.keys(route.predicates).some(field =>
          routeFieldNeedsSemantics(route.nodeType, field),
        ),
    )
  )
    demand |= ArtifactDemand.BindingsReferences;
  return demand;
}
