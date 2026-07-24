/// Target families supported by the planned native preflight phase.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TargetProfile {
    EsNext,
    HermesV0,
    WebView,
}

/// Type-syntax handling requested from the planned native preflight phase.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TypeScriptProfile {
    Strip,
}

/// JSX handling requested from the planned native preflight phase.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JsxProfile {
    Preserve,
    Classic,
    Automatic,
    AutomaticDevelopment,
}

/// Runtime-helper ABI requested from the planned native preflight phase.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HelperStrategy {
    None,
    ExpoRuntime,
}

/// Declarative configuration reserved for native preflight phases.
///
/// `Default` is disabled. Native phase compilation will consume these fields in N1.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PreflightPlan {
    pub target: Option<TargetProfile>,
    pub typescript: Option<TypeScriptProfile>,
    pub jsx: Option<JsxProfile>,
    pub helpers: Option<HelperStrategy>,
}
