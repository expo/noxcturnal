import { join } from 'node:path';

import type { FunctionMap, NativeVlqMap, ParseClassification } from '../types.js';
import type { PreflightPlan } from '../preflight/types.js';

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
    astTraversalCount(): number;
    performanceCounters(): {
      memoryBytes: number;
      parseCount: number;
      astTraversalCount: number;
    };
    takeFunctionMap(): FunctionMap | null;
  };
  classify(filename: string, source: string): ParseClassification;
  nativePreflightTransform(
    source: string,
    filename: string,
    options: {
      debugPerformance?: boolean;
      reactCompiler?: boolean;
      reactCompilerCompilationMode?: string;
      reactCompilerPanicThreshold?: string;
      reactCompilerTarget?: string;
      reactCompilerEnableResetCacheOnSourceFileChanges?: boolean;
      reactCompilerCustomOptOutDirectives?: string[];
      reactRefresh?: boolean;
      reactRefreshReg?: string;
      reactRefreshSig?: string;
      reactRefreshEmitFullSignatures?: boolean;
      typescript?: string;
      jsx?: string;
      jsxImportSource?: string;
      jsxPragma?: string;
      jsxPragmaFrag?: string;
      helpersMode?: string;
      helpersModuleName?: string;
      helpersVersion?: string;
      compact?: boolean;
      comments?: boolean;
      blockScoping?: boolean;
      classes?: boolean;
      destructuring?: boolean;
      destructuringUseBuiltIns?: boolean;
      parameters?: boolean;
      forOf?: boolean;
      explicitResourceManagement?: boolean;
      classStaticBlock?: boolean;
      classProperties?: boolean;
      classPropertiesLoose?: boolean;
      logicalAssignmentOperators?: boolean;
      optionalChaining?: boolean;
      optionalChainingLoose?: boolean;
      nullishCoalescingOperator?: boolean;
      nullishCoalescingOperatorLoose?: boolean;
      exportNamespaceFrom?: boolean;
      optionalCatchBinding?: boolean;
      objectRestSpread?: boolean;
      objectRestSpreadLoose?: boolean;
      objectRestSpreadUseBuiltIns?: boolean;
      asyncGeneratorFunctions?: boolean;
      asyncFunctions?: boolean;
      exponentiationOperator?: boolean;
      privateMethods?: boolean;
      privateMethodsLoose?: boolean;
      privatePropertyInObject?: boolean;
      privatePropertyInObjectLoose?: boolean;
      regexpSticky?: boolean;
      regexpUnicode?: boolean;
      regexpUnicodePropertyEscapes?: boolean;
      regexpDotAll?: boolean;
      regexpNamedCaptureGroups?: boolean;
      regexpLookBehind?: boolean;
      regexpMatchIndices?: boolean;
      regexpUnicodeSets?: boolean;
    },
  ): {
    status: 'complete' | 'unsupported';
    reason?: string;
    code?: string;
    map?: Buffer;
    diagnostics: string[];
    helpersUsed: string[];
    parseCount?: number;
    semanticBuildCount?: number;
    astTraversalCount?: number;
    renderCount?: number;
    parseMs?: number;
    semanticBuildMs?: number;
    customRewriteMs?: number;
    oxcTransformMs?: number;
    optimizationMs?: number;
    codegenAndMapMs?: number;
    helperDiscoveryMs?: number;
    helperMaterializationMs?: number;
  };
  commitPackedBuffer(
    source: string,
    filename: string,
    data: Buffer,
    sourceMapMode?: string,
  ): { code: string; map: NativeVlqMap };
  commitDecodedBuffer(
    source: string,
    filename: string,
    data: Buffer,
    sourceMapMode?: string,
  ): { code: string; map: Buffer };
  composeDecodedChain(layers: Buffer[]): NativeVlqMap;
  composeMappings(outer: string, inner: string, outerNameCount: number): string;
  materializeRoutedBuffer(
    source: string,
    filename: string,
    manifest: Buffer,
    rootStart?: number,
    rootEnd?: number,
  ): Buffer;
  nativeFlowErase(
    source: string,
    filename: string,
    sourceMapMode?: string,
  ): {
    /** `unsupported` when the binary was built without the `flow_parser` feature. */
    status: 'erased' | 'bailed' | 'unsupported';
    code?: string;
    map?: NativeVlqMap;
    reason?: string;
    detail?: string;
    erasedBytes: number;
    spanCount: number;
  };
  generateFunctionMap(source: string, filename: string): FunctionMap;
  validateExpression(code: string, parserMode?: string): void;
  validateStatements(code: string, parserMode?: string): void;
}

function loadBinding(): NativeBinding {
  const root = join(__dirname, '../..');
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

let flowErasureBuilt: boolean | undefined;

/**
 * Whether this binary was built with the `flow_parser` feature.
 *
 * Two builds of the same package version produce different output for a Flow
 * file depending on this, so it belongs in the transform cache key rather than
 * only in the code path that uses it. Probed once against an empty source.
 */
export function nativeFlowErasureBuilt(): boolean {
  return (flowErasureBuilt ??=
    native.nativeFlowErase('', 'probe.js', 'none').status !== 'unsupported');
}

export function nativePreflightOptions(plan: PreflightPlan, debugPerformance = false) {
  return {
    debugPerformance,
    reactCompiler: plan.reactCompiler != null,
    reactCompilerCompilationMode: plan.reactCompiler?.compilationMode,
    reactCompilerPanicThreshold: plan.reactCompiler?.panicThreshold,
    reactCompilerTarget: plan.reactCompiler?.target,
    reactCompilerEnableResetCacheOnSourceFileChanges:
      plan.reactCompiler?.enableResetCacheOnSourceFileChanges,
    reactCompilerCustomOptOutDirectives:
      plan.reactCompiler?.customOptOutDirectives == null
        ? undefined
        : [...plan.reactCompiler.customOptOutDirectives],
    reactRefresh: plan.reactRefresh != null,
    reactRefreshReg: plan.reactRefresh?.refreshReg,
    reactRefreshSig: plan.reactRefresh?.refreshSig,
    reactRefreshEmitFullSignatures: plan.reactRefresh?.emitFullSignatures,
    typescript: plan.typescript,
    jsx: plan.jsx,
    jsxImportSource: plan.jsxImportSource,
    jsxPragma: plan.jsxPragma,
    jsxPragmaFrag: plan.jsxPragmaFrag,
    helpersMode: plan.helpers?.mode,
    helpersModuleName: plan.helpers?.moduleName,
    helpersVersion: plan.helpers?.version,
    compact: plan.compact,
    comments: plan.comments,
    constantFolding: plan.optimize?.constantFolding,
    deadCodeElimination: plan.optimize?.deadCodeElimination,
    blockScoping: plan.transforms?.blockScoping,
    classes: plan.transforms?.classes,
    destructuring: plan.transforms?.destructuring != null,
    destructuringUseBuiltIns: plan.transforms?.destructuring?.useBuiltIns,
    parameters: plan.transforms?.parameters,
    forOf: plan.transforms?.forOf,
    explicitResourceManagement: plan.transforms?.explicitResourceManagement,
    classStaticBlock: plan.transforms?.classStaticBlock,
    classProperties: plan.transforms?.classProperties != null,
    classPropertiesLoose: plan.transforms?.classProperties?.loose,
    logicalAssignmentOperators: plan.transforms?.logicalAssignmentOperators,
    optionalChaining: plan.transforms?.optionalChaining != null,
    optionalChainingLoose: plan.transforms?.optionalChaining?.loose,
    nullishCoalescingOperator: plan.transforms?.nullishCoalescingOperator != null,
    nullishCoalescingOperatorLoose: plan.transforms?.nullishCoalescingOperator?.loose,
    exportNamespaceFrom: plan.transforms?.exportNamespaceFrom,
    optionalCatchBinding: plan.transforms?.optionalCatchBinding,
    objectRestSpread: plan.transforms?.objectRestSpread != null,
    objectRestSpreadLoose: plan.transforms?.objectRestSpread?.loose,
    objectRestSpreadUseBuiltIns: plan.transforms?.objectRestSpread?.useBuiltIns,
    asyncGeneratorFunctions: plan.transforms?.asyncGeneratorFunctions,
    asyncFunctions: plan.transforms?.asyncFunctions,
    exponentiationOperator: plan.transforms?.exponentiationOperator,
    privateMethods: plan.transforms?.privateMethods != null,
    privateMethodsLoose: plan.transforms?.privateMethods?.loose,
    privatePropertyInObject: plan.transforms?.privatePropertyInObject != null,
    privatePropertyInObjectLoose: plan.transforms?.privatePropertyInObject?.loose,
    regexpSticky: plan.transforms?.regexpSticky,
    regexpUnicode: plan.transforms?.regexpUnicode,
    regexpUnicodePropertyEscapes: plan.transforms?.regexpUnicodePropertyEscapes,
    regexpDotAll: plan.transforms?.regexpDotAll,
    regexpNamedCaptureGroups: plan.transforms?.regexpNamedCaptureGroups,
    regexpLookBehind: plan.transforms?.regexpLookBehind,
    regexpMatchIndices: plan.transforms?.regexpMatchIndices,
    regexpUnicodeSets: plan.transforms?.regexpUnicodeSets,
  };
}
