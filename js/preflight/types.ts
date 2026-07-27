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
  constantFolding?: true;
  deadCodeElimination?: true;
}

/** Orthogonal native syntax transforms. Consumers compose runtime presets from these toggles. */
export interface PreflightTransforms {
  blockScoping?: true;
  classes?: true;
  destructuring?: { useBuiltIns: boolean };
  parameters?: true;
  forOf?: true;
  explicitResourceManagement?: true;
  classStaticBlock?: true;
  classProperties?: { loose: boolean };
  logicalAssignmentOperators?: true;
  optionalChaining?: { loose: boolean };
  nullishCoalescingOperator?: { loose: boolean };
  exportNamespaceFrom?: true;
  optionalCatchBinding?: true;
  objectRestSpread?: { loose: boolean; useBuiltIns: boolean };
  asyncGeneratorFunctions?: true;
  asyncFunctions?: true;
  exponentiationOperator?: true;
  privateMethods?: { loose: boolean };
  privatePropertyInObject?: { loose: boolean };
  regexpSticky?: true;
  regexpUnicode?: true;
  regexpUnicodePropertyEscapes?: true;
  regexpDotAll?: true;
  regexpNamedCaptureGroups?: true;
  regexpLookBehind?: true;
  regexpMatchIndices?: true;
  regexpUnicodeSets?: true;
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
  jsxImportSource?: string;
  jsxPragma?: string;
  jsxPragmaFrag?: string;
  helpers?: PreflightHelpers;
  compact?: boolean;
  comments?: boolean;
}
