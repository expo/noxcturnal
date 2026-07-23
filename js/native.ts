import { join } from 'node:path';

import type { EditCommand, EventBatch, NativeVlqMap, ParseClassification } from './types.js';

interface NativeBinding {
  available: boolean;
  NativeIndexedSession: new (
    source: string,
    filename: string,
    subscriptions?: string[],
    exitSubscriptions?: string[],
  ) => {
    next(
      subscriptions: string[],
      rootStart?: number,
      rootEnd?: number,
      fieldRequests?: { nodeType: string; fields: string[] }[],
    ): EventBatch;
    nextPacked(
      subscriptions: string[],
      rootStart?: number,
      rootEnd?: number,
      fieldRequests?: { nodeType: string; fields: string[] }[],
      exitSubscriptions?: string[],
    ): {
      data: Buffer;
      strings: string[];
      nodeCount: number;
      emittedCount: number;
      includeExit?: boolean;
    };
    nextRoutedPacked(manifest: Buffer, rootStart?: number, rootEnd?: number): Buffer;
    queryGlobals(
      names: string[],
    ): { name: string; references: { id: number; start: number; end: number }[] }[];
    inspect(nodeIds: number[]): import('./types.js').NativeEvent[];
    nodeSummary(nodeId: number): import('./types.js').NativeEvent | null;
    nodeSummariesBuffer(): Buffer;
    childrenPackedBuffer(
      parentIds: number[],
      parentTypes: string[],
      parentTypeIds: number[],
    ): Buffer;
    constantsPackedBuffer(nodeIds: number[]): Buffer;
    scopeParentsBuffer(): Buffer;
    commit(edits: EditCommand[], sourceMapMode?: string): { code: string; map: NativeVlqMap };
    close(): void;
    memoryUsage(): number;
    parseCount(): number;
  };
  classify(filename: string, source: string): ParseClassification;
  commitEdits(
    source: string,
    filename: string,
    edits: EditCommand[],
    sourceMapMode?: string,
  ): { code: string; map: NativeVlqMap };
  commitPackedEdits(
    source: string,
    filename: string,
    data: Buffer,
    strings: string[],
    sourceMapMode?: string,
  ): { code: string; map: NativeVlqMap };
  commitPackedBuffer(
    source: string,
    filename: string,
    data: Buffer,
    sourceMapMode?: string,
  ): { code: string; map: NativeVlqMap };
  materializeEvents(
    source: string,
    filename: string,
    subscriptions: string[],
    rootStart?: number,
    rootEnd?: number,
  ): EventBatch;
  materializePackedEvents(
    source: string,
    filename: string,
    subscriptions: string[],
    subscriptionIds: number[],
    exitSubscriptions: string[],
    exitSubscriptionIds: number[],
    rootStart?: number,
    rootEnd?: number,
    fieldRequests?: Buffer,
  ): { data: Buffer; strings: string[]; nodeCount: number; emittedCount: number };
  materializePackedBuffer(
    source: string,
    filename: string,
    subscriptions: string[],
    subscriptionIds: number[],
    exitSubscriptions: string[],
    exitSubscriptionIds: number[],
    rootStart?: number,
    rootEnd?: number,
    fieldRequests?: Buffer,
    includeParent?: boolean,
    includeScope?: boolean,
    identifierNames?: string[],
    staticMemberPatterns?: string[],
  ): Buffer;
  materializeRoutedBuffer(
    source: string,
    filename: string,
    manifest: Buffer,
    rootStart?: number,
    rootEnd?: number,
  ): Buffer;
  queryGlobals(
    source: string,
    filename: string,
    names: string[],
  ): { name: string; references: { id: number; start: number; end: number }[] }[];
  inspectNodes(
    source: string,
    filename: string,
    nodeIds: number[],
  ): import('./types.js').NativeEvent[];
  composeMappings(outer: string, inner: string, outerNameCount: number): string;
  validateExpression(code: string, parserMode?: string): void;
  validateStatements(code: string, parserMode?: string): void;
}

function loadBinding(): NativeBinding {
  const root = join(__dirname, '..');
  const suffix = platformSuffix();
  const local = join(root, `noxcturnal.${suffix}.node`);
  try {
    return Object.assign(require(local), { available: true }) as NativeBinding;
  } catch (localError) {
    try {
      return Object.assign(require(`noxcturnal-${suffix}`), { available: true }) as NativeBinding;
    } catch (packageError) {
      const error = new AggregateError(
        [localError, packageError],
        `Could not load ${local} or noxcturnal-${suffix}.`,
      );
      const unavailable = () => {
        throw new Error(`Noxcturnal native binding is unavailable. ${error.message}`, {
          cause: error,
        });
      };
      return {
        available: false,
        NativeIndexedSession: class {
          constructor() {
            unavailable();
          }
        } as never,
        classify: () => ({
          syntax: 'unknown',
          supported: false,
          codegenCandidate: false,
          reason: 'native-load-failed',
        }),
        commitEdits: unavailable as never,
        commitPackedEdits: unavailable as never,
        commitPackedBuffer: unavailable as never,
        materializeEvents: unavailable as never,
        materializePackedEvents: unavailable as never,
        materializePackedBuffer: unavailable as never,
        materializeRoutedBuffer: unavailable as never,
        queryGlobals: unavailable as never,
        inspectNodes: unavailable as never,
        composeMappings: unavailable as never,
        validateExpression: unavailable as never,
        validateStatements: unavailable as never,
      };
    }
  }
}
function platformSuffix(): string {
  if (process.platform === 'darwin') return `darwin-${process.arch}`;
  if (process.platform === 'win32') return `win32-${process.arch}-msvc`;
  if (process.platform === 'linux') {
    const glibc = (
      process.report?.getReport?.() as { header?: { glibcVersionRuntime?: string } } | undefined
    )?.header?.glibcVersionRuntime;
    return `linux-${process.arch}-${glibc ? 'gnu' : 'musl'}`;
  }
  return `${process.platform}-${process.arch}`;
}
export const native = loadBinding();
export type NativeIndexedSessionBinding = InstanceType<NativeBinding['NativeIndexedSession']>;
