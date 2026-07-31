import {
  ArtifactDemand,
  closeArtifactDemand,
  planArtifacts,
  type ArtifactPlan,
} from '../pipeline/artifacts';
import type { EditCommand, FunctionMap } from '../types';

export type SourceVersionId = number & { readonly __sourceVersionId: unique symbol };

export interface SourceVersion {
  readonly id: SourceVersionId;
  readonly parentId: SourceVersionId | null;
  readonly normalizedEditCount: number;
  readonly normalizedEdits?: readonly EditCommand[];
  readonly codeChanged: boolean;
  readonly mapChanged: boolean;
  availableArtifacts: ArtifactDemand;
  renderedText?: string;
  functionMap?: FunctionMap;
}

/**
 * Transform-local immutable version graph. It is intentionally linear today,
 * but callers address opaque IDs and never infer identity from source strings.
 */
export class SourceVersionStore {
  readonly #versions: SourceVersion[];

  constructor(source: string) {
    this.#versions = [
      {
        id: 0 as SourceVersionId,
        parentId: null,
        normalizedEditCount: 0,
        normalizedEdits: undefined,
        codeChanged: false,
        mapChanged: false,
        availableArtifacts: ArtifactDemand.RenderedText,
        renderedText: source,
      },
    ];
  }

  get original(): SourceVersionId {
    return this.#versions[0].id;
  }

  get(id: SourceVersionId): SourceVersion {
    const version = this.#versions[id as number];
    if (version == null) throw new Error(`unknown source version ${id}`);
    return version;
  }

  ensure(
    id: SourceVersionId,
    demand: ArtifactDemand,
    retain = false,
  ): { version: SourceVersion; plan: ArtifactPlan } {
    const version = this.get(id);
    const plan = planArtifacts(demand, version.availableArtifacts, retain);
    version.availableArtifacts = closeArtifactDemand(version.availableArtifacts | demand);
    return { version, plan };
  }

  renderedText(id: SourceVersionId): string | undefined {
    return this.get(id).renderedText;
  }

  cacheRenderedText(id: SourceVersionId, text: string): void {
    const version = this.get(id);
    version.renderedText = text;
    version.availableArtifacts |= ArtifactDemand.RenderedText;
  }

  commit(
    parentId: SourceVersionId,
    effect: {
      normalizedEditCount: number;
      normalizedEdits?: readonly EditCommand[];
      codeChanged: boolean;
      mapChanged: boolean;
    },
  ): SourceVersionId {
    const parent = this.get(parentId);
    if (!effect.codeChanged && !effect.mapChanged) return parentId;
    const id = this.#versions.length as SourceVersionId;
    this.#versions.push({
      id,
      parentId,
      normalizedEditCount: effect.normalizedEditCount,
      normalizedEdits: effect.normalizedEdits,
      codeChanged: effect.codeChanged,
      mapChanged: effect.mapChanged,
      // Map-only children share every text-derived product with their parent.
      // A byte-changing child starts with resident rendered text only.
      availableArtifacts: effect.codeChanged
        ? ArtifactDemand.RenderedText
        : parent.availableArtifacts | ArtifactDemand.RealizedMap,
      renderedText: effect.codeChanged ? undefined : parent.renderedText,
      functionMap: effect.codeChanged ? undefined : parent.functionMap,
    });
    return id;
  }

  dropParsedArtifacts(id: SourceVersionId): void {
    const version = this.get(id);
    version.availableArtifacts &= ArtifactDemand.RenderedText | ArtifactDemand.RealizedMap;
  }

  functionMap(id: SourceVersionId): FunctionMap | undefined {
    return this.get(id).functionMap;
  }

  cacheFunctionMap(id: SourceVersionId, functionMap: FunctionMap): void {
    const version = this.get(id);
    version.functionMap = functionMap;
    version.availableArtifacts |= ArtifactDemand.FunctionMap;
  }

  snapshot(): readonly {
    id: SourceVersionId;
    parentId: SourceVersionId | null;
    normalizedEditCount: number;
    codeChanged: boolean;
    mapChanged: boolean;
    availableArtifacts: ArtifactDemand;
    hasRenderedText: boolean;
  }[] {
    return this.#versions.map(version => ({
      id: version.id,
      parentId: version.parentId,
      normalizedEditCount: version.normalizedEditCount,
      codeChanged: version.codeChanged,
      mapChanged: version.mapChanged,
      availableArtifacts: version.availableArtifacts,
      hasRenderedText: version.renderedText != null,
    }));
  }
}
