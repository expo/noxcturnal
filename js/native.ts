import { join } from 'node:path';

import type { EditCommand, FunctionMap, NativeVlqMap, ParseClassification } from './types.js';

interface NativeBinding {
  NativeIndexedSession: new (
    source: string,
    filename: string,
    functionMap?: boolean,
    retentionManifest?: Buffer,
    initialRouteManifest?: Buffer,
    buildInitialRoute?: boolean,
  ) => {
    nextRoutedPacked(manifest: Buffer, rootStart?: number, rootEnd?: number): Buffer;
    queryGlobals(
      names: string[],
    ): { name: string; references: { id: number; start: number; end: number }[] }[];
    queryBindings(
      name?: string,
      scopeId?: number,
      reads?: boolean,
      writes?: boolean,
    ): {
      name: string;
      scopeId: number;
      declarationId?: number;
      declarationStart?: number;
      declarationEnd?: number;
      declarationParentId?: number;
      references: {
        id: number;
        start: number;
        end: number;
        scopeId: number;
        parentId?: number;
        parentType?: string;
        read: boolean;
        write: boolean;
      }[];
    }[];
    bindingIndexBuffer(): Buffer;
    scopeParentsBuffer(): Buffer;
    queryCaptures(functionId: number): {
      id: number;
      start: number;
      end: number;
      scopeId: number;
      bindingScopeId: number;
      parentId?: number;
      parentType?: string;
      name: string;
      read: boolean;
      write: boolean;
    }[];
    inspectPackedBuffer(nodeIds: number[]): Buffer;
    nodeSummaryBuffer(nodeId: number): Buffer;
    childrenPackedBuffer(
      parentIds: number[],
      parentTypes: string[],
      parentTypeIds: number[],
    ): Buffer;
    queryConstants(nodeIds: number[]): { id: number; kind: string; value: string }[];
    queryCalls(
      calleeName: string,
      globalOnly?: boolean,
      staticArguments?: boolean,
    ): {
      id: number;
      start: number;
      end: number;
      scopeId: number;
      calleeName: string;
      calleeGlobal: boolean;
      staticArgument?: string;
    }[];
    queryNodesPackedBuffer(nodeTypes: string[]): Buffer;
    scopeParentId(scopeId: number): number | null;
    close(): void;
    memoryUsage(): number;
    parseCount(): number;
    takeFunctionMap(): FunctionMap | null;
  };
  classify(filename: string, source: string): ParseClassification;
  commitPackedBuffer(
    source: string,
    filename: string,
    data: Buffer,
    sourceMapMode?: string,
  ): { code: string; map: NativeVlqMap };
  materializeRoutedBuffer(
    source: string,
    filename: string,
    manifest: Buffer,
    rootStart?: number,
    rootEnd?: number,
  ): Buffer;
  composeMappings(outer: string, inner: string, outerNameCount: number): string;
  generateFunctionMap(source: string, filename: string): FunctionMap;
  validateExpression(code: string, parserMode?: string): void;
  validateStatements(code: string, parserMode?: string): void;
}

function loadBinding(): NativeBinding {
  const root = join(__dirname, '..');
  const suffix = platformSuffix();
  // Probe by requiring rather than fs-checking: test environments routinely mock `fs`,
  // and module resolution is the authority on loadability anyway.
  try {
    return require(join(root, `noxcturnal.${suffix}.node`)) as NativeBinding;
  } catch (error) {
    if ((error as { code?: string }).code !== 'MODULE_NOT_FOUND') throw error;
    return require(`noxcturnal-${suffix}`) as NativeBinding;
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
