/** Type-syntax handling requested from the planned native preflight phase. */
export type PreflightTypeScriptMode = 'strip';

/** JSX handling requested from the planned native preflight phase. */
export type PreflightJsxMode =
  | 'preserve'
  | 'classic'
  | 'classic-development'
  | 'automatic'
  | 'automatic-if-present'
  | 'automatic-development';

/** Runtime-helper ABI requested from the planned native preflight phase. */
export interface PreflightHelpers {
  mode: 'runtime' | 'inline';
  moduleName?: string;
  version?: string;
}

/** Version-coupled React Compiler options exposed through Noxcturnal's conformance layer. */
export interface PreflightReactCompiler {
  compilationMode: 'infer' | 'syntax' | 'annotation' | 'all';
  panicThreshold: 'none' | 'critical_errors' | 'all_errors';
  target: '17' | '18' | '19';
  enableResetCacheOnSourceFileChanges: boolean;
  customOptOutDirectives?: readonly string[];
}

/** React Fast Refresh instrumentation emitted by Oxc's native JSX pass. */
export interface PreflightReactRefresh {
  refreshReg?: string;
  refreshSig?: string;
  emitFullSignatures?: boolean;
}

/** Focused Metro-compatible post-processing. Each operation is independently selectable. */
export interface PreflightOptimize {
  constantFolding?: boolean | undefined;
  deadCodeElimination?: boolean | undefined;
}

/**
 * Native syntax transforms. Most toggles compose independently, but focused
 * class-feature transforms share one native class-lowering representation and
 * can lower sibling class syntax present in the same source. TypeScript is
 * normalized before these transforms. RegExp Unicode lowering also expands
 * Unicode property escapes.
 */
export interface PreflightTransforms {
  blockScoping?: boolean | undefined;
  classes?: boolean | undefined;
  /** Apply TypeScript-style legacy decorator semantics. */
  legacyDecorators?: boolean | undefined;
  destructuring?: boolean | undefined;
  parameters?: boolean | undefined;
  forOf?: boolean | undefined;
  explicitResourceManagement?: boolean | undefined;
  classStaticBlock?: boolean | undefined;
  classProperties?: { loose: boolean } | false | undefined;
  logicalAssignmentOperators?: boolean | undefined;
  optionalChaining?: { loose: boolean } | false | undefined;
  nullishCoalescingOperator?: { loose: boolean } | false | undefined;
  exportNamespaceFrom?: boolean | undefined;
  optionalCatchBinding?: boolean | undefined;
  objectRestSpread?: { loose: boolean; useBuiltIns: boolean } | false | undefined;
  asyncGeneratorFunctions?: boolean | undefined;
  asyncFunctions?: boolean | undefined;
  exponentiationOperator?: boolean | undefined;
  /** Native private state uses one stable loose representation. */
  privateMethods?: boolean | undefined;
  /** Native private state uses one stable loose representation. */
  privatePropertyInObject?: boolean | undefined;
  regexpSticky?: boolean | undefined;
  regexpUnicode?: boolean | undefined;
  regexpUnicodePropertyEscapes?: boolean | undefined;
  regexpDotAll?: boolean | undefined;
  regexpNamedCaptureGroups?: boolean | undefined;
  regexpLookBehind?: boolean | undefined;
  regexpMatchIndices?: boolean | undefined;
  regexpUnicodeSets?: boolean | undefined;
}

/**
 * Declarative configuration reserved for native preflight phases.
 *
 * An absent or empty plan is disabled. The restructuring phase deliberately gives
 * this data no runtime behavior; native phase compilation will consume it in N1.
 */
export interface PreflightPlan {
  transforms?: PreflightTransforms;
  optimize?: PreflightOptimize;
  reactCompiler?: PreflightReactCompiler;
  reactRefresh?: PreflightReactRefresh;
  typescript?: PreflightTypeScriptMode;
  jsx?: PreflightJsxMode;
  /** Emit pure annotations for generated JSX calls. Defaults to false for development modes. */
  jsxPure?: boolean;
  /** Reject JSX namespace tags and attributes. Matches Babel's default of true. */
  jsxThrowIfNamespace?: boolean;
  jsxImportSource?: string;
  jsxPragma?: string;
  jsxPragmaFrag?: string;
  helpers?: PreflightHelpers;
  compact?: boolean;
  comments?: boolean;
}
