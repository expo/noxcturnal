/** Target families supported by the planned native preflight phase. */
export type PreflightTargetProfile = 'esnext' | 'hermes-v0' | 'webview';

/** Type-syntax handling requested from the planned native preflight phase. */
export type PreflightTypeScriptProfile = 'strip';

/** JSX handling requested from the planned native preflight phase. */
export type PreflightJsxProfile = 'preserve' | 'classic' | 'automatic' | 'automatic-development';

/** Runtime-helper ABI requested from the planned native preflight phase. */
export type PreflightHelperStrategy = 'none' | 'expo-runtime';

/**
 * Declarative configuration reserved for native preflight phases.
 *
 * An absent or empty plan is disabled. The restructuring phase deliberately gives
 * this data no runtime behavior; native phase compilation will consume it in N1.
 */
export interface PreflightPlan {
  target?: PreflightTargetProfile;
  typescript?: PreflightTypeScriptProfile;
  jsx?: PreflightJsxProfile;
  helpers?: PreflightHelperStrategy;
}
