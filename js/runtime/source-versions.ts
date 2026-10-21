import {
  ArtifactDemand,
  closeArtifactDemand,
  planArtifacts,
  type ArtifactPlan,
} from '../pipeline/artifacts';

export type SourceVersionId = number & { readonly __sourceVersionId: unique symbol };

export interface SourceVersion {
  readonly id: SourceVersionId;
  availableArtifacts: ArtifactDemand;
  renderedText?: string;
}

export class SourceVersionStore {
  #current: SourceVersion;

  constructor(source: string) {
    this.#current = {
      id: 0 as SourceVersionId,
      availableArtifacts: ArtifactDemand.RenderedText,
      renderedText: source,
    };
  }

  get original(): SourceVersionId {
    return 0 as SourceVersionId;
  }

  get(id: SourceVersionId): SourceVersion {
    if (id !== this.#current.id) throw new Error(`unknown source version ${id}`);
    return this.#current;
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
    effect: { codeChanged: boolean; mapChanged: boolean },
  ): SourceVersionId {
    const parent = this.get(parentId);
    if (!effect.codeChanged && !effect.mapChanged) return parentId;
    const id = (parent.id + 1) as SourceVersionId;
    // Map-only children share every text-derived product with their parent.
    // A byte-changing child starts with resident rendered text only.
    this.#current = {
      id,
      availableArtifacts: effect.codeChanged
        ? ArtifactDemand.RenderedText
        : parent.availableArtifacts | ArtifactDemand.RealizedMap,
      renderedText: effect.codeChanged ? undefined : parent.renderedText,
    };
    return id;
  }

  dropParsedArtifacts(id: SourceVersionId): void {
    const version = this.get(id);
    version.availableArtifacts &= ArtifactDemand.RenderedText | ArtifactDemand.RealizedMap;
  }
}
