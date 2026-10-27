import { basename, join } from 'node:path';

import type { FunctionMap, NativeVlqMap, ParseClassification } from '../types';
import type { PreflightPlan } from '../preflight/types';

interface NativePreflightOptionsInput {
  functionMap?: boolean;
  sourceFilename?: string;
  optimizationModuleContext?: boolean;
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
  jsxPure?: boolean;
  jsxThrowIfNamespace?: boolean;
  jsxImportSource?: string;
  jsxPragma?: string;
  jsxPragmaFrag?: string;
  helpersMode?: string;
  helpersModuleName?: string;
  helpersVersion?: string;
  compact?: boolean;
  comments?: boolean;
  constantFolding?: boolean;
  deadCodeElimination?: boolean;
  blockScoping?: boolean;
  classes?: boolean;
  legacyDecorators?: boolean;
  destructuring?: boolean;
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
  privatePropertyInObject?: boolean;
  regexpSticky?: boolean;
  regexpUnicode?: boolean;
  regexpUnicodePropertyEscapes?: boolean;
  regexpDotAll?: boolean;
  regexpNamedCaptureGroups?: boolean;
  regexpLookBehind?: boolean;
  regexpMatchIndices?: boolean;
  regexpUnicodeSets?: boolean;
}

export interface NativePreflightResultOutput {
  status: 'complete' | 'unsupported' | 'error';
  functionMap?: FunctionMap;
  changed: boolean;
  normalizedJavascript: boolean;
  jsx: boolean;
  reason?: string;
  /** Present only on the free-function path; the pipeline session keeps it resident. */
  code?: string;
  /** Present only on the free-function path; the pipeline session keeps it resident. */
  map?: Buffer;
  diagnostics: string[];
  errorLocation?: { line: number; column: number };
  helpersUsed: string[];
}

declare const COMPILED_MANIFEST: unique symbol;
export interface NativeCompiledManifestBinding {
  readonly [COMPILED_MANIFEST]: true;
}
export type NativeManifest = Buffer | NativeCompiledManifestBinding;

interface NativeBinding {
  NativeCompiledManifest: new (manifest: Buffer) => NativeCompiledManifestBinding;
  originalSourcePosition(
    mappings: string,
    line: number,
    column: number,
  ): { line: number; column: number } | null;
  NativeParsedSource: new (
    source: string,
    filename: string,
  ) => {
    syntaxFacts(): string[];
    functionMap(): FunctionMap;
    materializeRouted(manifest: NativeManifest): Buffer;
    materialize(
      retentionManifest: NativeManifest,
      initialRouteManifest: NativeManifest,
    ): NativeIndexedSessionBinding;
    validate(): void;
    close(): void;
  };
  NativeSourceText: new (source: string) => {
    generateUid(name: string, filename: string): string;
    whitespace(): number[];
    indent(prefix: string): string;
    needsLineBoundary(offset: number): boolean;
    startsLine(offset: number): boolean;
    linePrefixIntervals(start: number, end: number): Buffer;
    insertionSuffixes(
      texts: readonly string[],
      composites: readonly (readonly (string | { start: number; end: number })[])[],
    ): Buffer;
    locations(start: number, end: number): number[];
    locationOffset(line: number, column: number): number;
    matches(
      search: string,
      flags: string | undefined,
      all: boolean,
      replacement?: string,
      start?: number,
    ): {
      start: number;
      end: number;
      captures: string[];
      content?: string;
    }[];
  };
  sourceHints(source: string): string[];
  validateIdentifier(name: string): void;
  validateProgram(source: string, filename: string): void;
  NativeIndexedSession: new (
    source: string,
    filename: string,
    retentionManifest?: NativeManifest,
    initialRouteManifest?: NativeManifest,
    buildInitialRoute?: boolean,
  ) => {
    generateUid(name: string): string | null;
    nextRoutedPacked(
      manifest: NativeManifest,
      rootStart?: number,
      rootEnd?: number,
      rootId?: number,
    ): Buffer;
    traversalIntervalsBuffer(): Buffer;
    queryGlobalsBuffer(names: string[]): Buffer;
    hasGlobal(name: string): boolean;
    globalBindingReferencesBuffer(name: string): Buffer;
    queryBindingsBatch(
      requests: { name: string; scopeId: number }[],
    ): ReturnType<NativeIndexedSessionBinding['queryBindings']>;
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
        parentStart?: number;
        read: boolean;
        write: boolean;
        memberWrite: boolean;
      }[];
    }[];
    bindingRenamePlan(
      name: string,
      scopeId: number,
    ): {
      targets: { start: number; end: number; kind: number }[];
      exports: { start: number; end: number }[];
    };
    bindingRenameExportNames(start: number): string[];
    bindingIndexBuffer(): Buffer;
    scopeParentsBuffer(): Buffer;
    scopeMetadataBuffer(): Buffer;
    programBodyOffsets(): [
      prepend: number,
      append: number,
      needsEofLineBoundary: number,
      prependSeparator: number,
      appendSeparator: number,
    ];
    queryCapturesBatch(
      functionIds: number[],
      programBindings?: number[],
    ): {
      functionId: number;
      references: {
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
    }[];
    inspectPackedBuffer(nodeIds: number[]): Buffer;
    nodeSummaryBuffer(nodeId: number): Buffer;
    routedChildRoots(
      data: Uint32Array,
      flags: number,
      plan: Uint32Array,
      stopped: Uint8Array,
    ): number[];
    childrenRoutedPackedBuffer(
      data: Uint32Array,
      flags: number,
      plan: Uint32Array,
      stopped: Uint8Array,
    ): { edges: Buffer; events: Buffer } | null;
    childrenPackedBuffer(
      parentIds: number[],
      parentTypes: string[],
      parentTypeIds: number[],
      recursive?: boolean,
    ): {
      /** Groups of [parentId, count, ...[childId, roleId]], including empty parents. */
      edges: Buffer;
      events: Buffer;
    };
    retentionDebugSummary(): {
      retainedEdgeCount: number;
      scalarFieldWordCount: number;
      scalarStringCount: number;
      retainedIndexBytes: number;
    };
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
    queryCallsBatch(
      requests: {
        callee: string;
        globalOnly?: boolean;
        staticArguments?: boolean;
      }[],
    ): ReturnType<NativeIndexedSessionBinding['queryCalls']>[];
    queryNodesPackedBuffer(nodeTypes: string[]): Buffer;
    scopeParentId(scopeId: number): number | null;
    close(): void;
    memoryUsage(): number;
    commitPacked(data: Buffer, sourceMapMode?: string): { code: string; map: NativeVlqMap };
    commitDecoded(
      data: Buffer,
      sourceMapMode?: string,
    ): { code: string; map: Buffer; codeChanged: boolean; mapChanged: boolean };
  };
  /**
   * A transform pipeline's resident source. Native phases and visitor commits
   * mutate the held source and accumulate map layers natively; only the final
   * composed map, and the source text a visitor phase asks for, ever cross out.
   */
  NativePipelineSession: new (
    filename: string,
    source: string,
  ) => {
    runNativePhases(optionsList: NativePreflightOptionsInput[]): NativePreflightResultOutput[];
    commitDecoded(
      data: Buffer,
      sourceMapMode?: string,
    ): {
      codeChanged: boolean;
      mapChanged: boolean;
    };
    originalPosition(line: number, column: number): { line: number; column: number } | null;
    sourceText(): string;
    finish(
      inputMappings?: string,
      inputNames?: string[],
    ): {
      code: string;
      map: NativeVlqMap | null;
    };
  };
  classify(filename: string, source: string): ParseClassification;
  nativePreflightTransform(
    source: string,
    filename: string,
    options: NativePreflightOptionsInput,
  ): NativePreflightResultOutput;
  /**
   * Run an all-native pipeline (no visitor phases) in a single crossing. The
   * per-phase results plus the one final `{ code, map }` — `code`/`map` absent
   * when a phase bailed, so the caller bails on the offending result.
   */
  runNativePipeline(
    filename: string,
    source: string,
    optionsList: NativePreflightOptionsInput[],
    inputMappings?: string,
    inputNames?: string[],
  ): {
    results: NativePreflightResultOutput[];
    code?: string;
    map?: NativeVlqMap | null;
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
  ): { code: string; map: Buffer; codeChanged: boolean; mapChanged: boolean };
  composeDecodedChain(layers: Buffer[]): NativeVlqMap;
  composeMappings(outer: string, inner: string, outerNameCount: number): string;
  materializeRoutedBuffer(
    source: string,
    filename: string,
    manifest: NativeManifest,
    rootStart?: number,
    rootEnd?: number,
  ): Buffer;
  /**
   * Throws for internal failures and invalid constructs — a `var` binding in a
   * match pattern, say. `bailed` is for everything the erasure merely does not
   * cover, where the parser adapter is expected to take over; a throw means it
   * would fail too, so the message is the answer.
   */
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
  // Source tests load this file from js/native; Rollup places the bundle in dist/.
  // Published ESM has no CommonJS scope, so the ESM bundle defines require and
  // __dirname from import.meta.url before this runs. Both are required: fixing
  // only __dirname still leaves the addon require call unresolved.
  const root = join(__dirname, basename(__dirname) === 'native' ? '../..' : '..');
  const suffix = platformSuffix();
  // Probe by requiring rather than fs-checking: test environments routinely mock `fs`,
  // and module resolution is the authority on loadability anyway.
  try {
    return require(join(root, `noxcturnal.${suffix}.node`)) as NativeBinding;
  } catch (error) {
    if ((error as { code?: string }).code !== 'MODULE_NOT_FOUND') throw error;
    return require(`@noxcturnal/noxcturnal-${suffix}`) as NativeBinding;
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
export type NativeParsedSourceBinding = InstanceType<NativeBinding['NativeParsedSource']>;
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

const nativePreflightOptionsCache = new WeakMap<PreflightPlan, NativePreflightOptionsInput>();

export function nativePreflightOptions(plan: PreflightPlan): NativePreflightOptionsInput {
  const cached = nativePreflightOptionsCache.get(plan);
  if (cached != null) return cached;
  const classProperties = plan.transforms?.classProperties || undefined;
  const optionalChaining = plan.transforms?.optionalChaining || undefined;
  const nullishCoalescingOperator = plan.transforms?.nullishCoalescingOperator || undefined;
  const objectRestSpread = plan.transforms?.objectRestSpread || undefined;
  const options: NativePreflightOptionsInput = {
    optimizationModuleContext: plan.optimize?.moduleContext,
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
    jsxPure: plan.jsxPure,
    jsxThrowIfNamespace: plan.jsxThrowIfNamespace,
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
    legacyDecorators: plan.transforms?.legacyDecorators,
    destructuring: plan.transforms?.destructuring,
    parameters: plan.transforms?.parameters,
    forOf: plan.transforms?.forOf,
    explicitResourceManagement: plan.transforms?.explicitResourceManagement,
    classStaticBlock: plan.transforms?.classStaticBlock,
    classProperties: classProperties != null,
    classPropertiesLoose: classProperties?.loose,
    logicalAssignmentOperators: plan.transforms?.logicalAssignmentOperators,
    optionalChaining: optionalChaining != null,
    optionalChainingLoose: optionalChaining?.loose,
    nullishCoalescingOperator: nullishCoalescingOperator != null,
    nullishCoalescingOperatorLoose: nullishCoalescingOperator?.loose,
    exportNamespaceFrom: plan.transforms?.exportNamespaceFrom,
    optionalCatchBinding: plan.transforms?.optionalCatchBinding,
    objectRestSpread: objectRestSpread != null,
    objectRestSpreadLoose: objectRestSpread?.loose,
    objectRestSpreadUseBuiltIns: objectRestSpread?.useBuiltIns,
    asyncGeneratorFunctions: plan.transforms?.asyncGeneratorFunctions,
    asyncFunctions: plan.transforms?.asyncFunctions,
    exponentiationOperator: plan.transforms?.exponentiationOperator,
    privateMethods: plan.transforms?.privateMethods,
    privatePropertyInObject: plan.transforms?.privatePropertyInObject,
    regexpSticky: plan.transforms?.regexpSticky,
    regexpUnicode: plan.transforms?.regexpUnicode,
    regexpUnicodePropertyEscapes: plan.transforms?.regexpUnicodePropertyEscapes,
    regexpDotAll: plan.transforms?.regexpDotAll,
    regexpNamedCaptureGroups: plan.transforms?.regexpNamedCaptureGroups,
    regexpLookBehind: plan.transforms?.regexpLookBehind,
    regexpMatchIndices: plan.transforms?.regexpMatchIndices,
    regexpUnicodeSets: plan.transforms?.regexpUnicodeSets,
  };
  nativePreflightOptionsCache.set(plan, options);
  return options;
}
