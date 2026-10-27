//! Reviewed native failure inventory. Runtime disposition is encoded by typed
//! constructors at each call site; this table is only a review and regression gate.

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum Disposition {
    Unsupported,
    Fatal,
}

#[derive(Clone, Copy)]
struct Entry {
    reason: &'static str,
    disposition: Disposition,
    stage: &'static str,
    mutated: bool,
}

macro_rules! unsupported {
    ($reason:literal, $stage:literal) => {
        Entry {
            reason: $reason,
            disposition: Disposition::Unsupported,
            stage: $stage,
            mutated: false,
        }
    };
}
macro_rules! fatal {
    ($reason:literal, $stage:literal, $mutated:literal) => {
        Entry {
            reason: $reason,
            disposition: Disposition::Fatal,
            stage: $stage,
            mutated: $mutated,
        }
    };
}

const REVIEWED: &[Entry] = &[
    unsupported!("lowered-arrow-direct-eval", "arguments-capture"),
    unsupported!("decorated-class-expression", "decorator-compatibility"),
    fatal!(
        "arguments-capture-semantic-error",
        "arguments-capture",
        true
    ),
    unsupported!("react-compiler-not-built", "feature-selection"),
    unsupported!("parse-error", "escaped-regexp-name-parser-boundary"),
    unsupported!("mutable-namespace-export", "typescript-compatibility"),
    unsupported!("for-of-inline-helper-shadowed-global", "helper-selection"),
    unsupported!("helper-not-compatible:{helper}", "helper-selection"),
    unsupported!("helper-not-compatible:{}", "helper-selection"),
    unsupported!(
        "helper-runtime-module-unsupported:custom-runtime",
        "helper-selection"
    ),
    unsupported!(
        "helper-runtime-module-unsupported:{helper_module}",
        "helper-selection"
    ),
    unsupported!(
        "helper-runtime-module-unsupported:{module_name}",
        "helper-selection"
    ),
    unsupported!("helper-runtime-version-invalid:empty", "helper-selection"),
    unsupported!(
        "helper-runtime-version-invalid:{version}",
        "helper-selection"
    ),
    unsupported!("inline-helper-not-compatible:{}", "helper-selection"),
    unsupported!("regexp-pattern-invalid", "regexp-source-parse"),
    unsupported!("regexp-class-invalid-shape", "regexp-source-shape"),
    unsupported!(
        "regexp-unicode-code-point-out-of-range",
        "regexp-source-shape"
    ),
    unsupported!(
        "regexp-unicode-ignore-case-invalid-shape",
        "regexp-source-shape"
    ),
    unsupported!(
        "regexp-unicode-property-class-escape-invalid",
        "regexp-source-shape"
    ),
    unsupported!(
        "regexp-unicode-property-class-range-invalid",
        "regexp-source-shape"
    ),
    unsupported!("regexp-unicode-property-class-shape", "regexp-source-shape"),
    unsupported!("regexp-unicode-property-invalid", "regexp-source-shape"),
    unsupported!(
        "regexp-unicode-property-invalid-shape",
        "regexp-source-shape"
    ),
    unsupported!(
        "regexp-unicode-sets-operation-invalid",
        "regexp-source-shape"
    ),
    fatal!("transform-error", "oxc-transform", true),
    fatal!("block-scoping-postcondition-failed", "block-scoping", true),
    fatal!(
        "block-scoping-postcondition-semantic-error",
        "block-scoping",
        true
    ),
    fatal!("captured-loop-ast-target-missing", "captured-loop", false),
    fatal!(
        "captured-loop-block-scoping-postcondition-failed",
        "captured-loop",
        true
    ),
    fatal!(
        "captured-loop-post-rewrite-semantic-error",
        "captured-loop",
        true
    ),
    fatal!(
        "class-features-postcondition-failed",
        "class-features",
        true
    ),
    fatal!("classes-ast-target-missing", "classes", false),
    fatal!("classes-decorator-precondition-failed", "classes", false),
    fatal!("classes-direct-ast-target-missing", "classes", false),
    fatal!("classes-direct-constructor-body-missing", "classes", true),
    fatal!(
        "classes-direct-derived-constructor-body-missing",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-derived-new-target-name-missing",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-derived-result-name-missing",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-derived-super-call-name-missing",
        "classes",
        true
    ),
    fatal!("classes-direct-field-key-mismatch", "classes", true),
    fatal!("classes-direct-field-options-missing", "classes", true),
    fatal!(
        "classes-direct-leading-super-expression-mismatch",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-leading-super-return-missing",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-leading-super-sequence-empty",
        "classes",
        true
    ),
    fatal!(
        "classes-direct-leading-super-sequence-head-mismatch",
        "classes",
        true
    ),
    fatal!("classes-direct-method-body-missing", "classes", true),
    fatal!("classes-direct-method-key-mismatch", "classes", true),
    fatal!("classes-direct-plan-missing", "classes", false),
    fatal!("classes-direct-private-key-missing", "classes", true),
    fatal!(
        "classes-direct-static-block-options-missing",
        "classes",
        true
    ),
    fatal!("classes-post-rewrite-semantic-error", "classes", true),
    fatal!("classes-postcondition-failed", "classes", true),
    fatal!(
        "destructuring-assignment-target-conversion",
        "destructuring",
        true
    ),
    fatal!(
        "destructuring-catch-parameter-missing",
        "destructuring",
        true
    ),
    fatal!(
        "destructuring-computed-key-not-expression",
        "destructuring",
        true
    ),
    fatal!("destructuring-loop-target-missing", "destructuring", true),
    fatal!(
        "destructuring-generated-initializer-missing",
        "destructuring",
        true
    ),
    fatal!("destructuring-postcondition-failed", "destructuring", true),
    fatal!(
        "destructuring-property-key-not-expression",
        "destructuring",
        true
    ),
    fatal!(
        "destructuring-temporary-declaration-empty",
        "destructuring",
        true
    ),
    fatal!("for-of-assignment-target-invalid", "for-of", true),
    fatal!("for-of-ast-target-missing", "for-of", false),
    fatal!("for-of-empty-declaration", "for-of", true),
    fatal!("for-of-postcondition-failed", "for-of", true),
    fatal!("helper-bridge-parse-error", "generated-helper-bridge", true),
    fatal!("parameters-body-missing", "parameters", true),
    fatal!("parameters-empty-capture-declaration", "parameters", true),
    fatal!("parameters-postcondition-failed", "parameters", true),
    fatal!("parameters-rest-names-missing", "parameters", true),
    fatal!(
        "post-rewrite-semantic-error",
        "post-rewrite-semantics",
        true
    ),
    fatal!(
        "pre-block-scoping-semantic-error",
        "post-rewrite-semantics",
        true
    ),
    fatal!(
        "pre-destructuring-semantic-error",
        "post-rewrite-semantics",
        true
    ),
    fatal!("pre-for-of-semantic-error", "post-rewrite-semantics", true),
    fatal!(
        "regexp-dot-all-postcondition-failed",
        "regexp-postcondition",
        true
    ),
    fatal!("regexp-flags-invalid", "regexp-render", true),
    fatal!(
        "regexp-named-capture-groups-postcondition-failed",
        "regexp-postcondition",
        true
    ),
    fatal!(
        "regexp-named-group-invalid-shape",
        "regexp-ast-application",
        true
    ),
    fatal!(
        "regexp-named-reference-invalid-shape",
        "regexp-ast-application",
        true
    ),
    fatal!("regexp-pattern-edits-overlap", "regexp-edit-commit", true),
    fatal!(
        "regexp-pattern-span-invalid",
        "regexp-ast-application",
        true
    ),
    fatal!(
        "regexp-unicode-postcondition-failed",
        "regexp-postcondition",
        true
    ),
    fatal!(
        "regexp-unicode-property-escapes-postcondition-failed",
        "regexp-postcondition",
        true
    ),
    fatal!(
        "regexp-unicode-property-prerequisite-postcondition-failed",
        "regexp-postcondition",
        true
    ),
    fatal!(
        "regexp-unicode-sets-postcondition-failed",
        "regexp-postcondition",
        true
    ),
];

fn looks_like_failure_reason(value: &str) -> bool {
    const PREFIXES: &[&str] = &[
        "arguments-capture-",
        "decorated-class-",
        "lowered-arrow-",
        "block-scoping-",
        "captured-",
        "class-features-",
        "classes-",
        "destructuring-",
        "for-of-",
        "helper-",
        "inline-helper-",
        "parameters-",
        "parse-error",
        "post-",
        "pre-",
        "react-compiler-",
        "regexp-",
        "mutable-namespace-export",
        "transform-error",
    ];
    PREFIXES.iter().any(|prefix| value.starts_with(prefix))
        && value.bytes().all(|byte| {
            byte.is_ascii_lowercase()
                || byte.is_ascii_digit()
                || matches!(byte, b'-' | b'_' | b':' | b'@' | b'.' | b'{' | b'}')
        })
}

fn string_literals(source: &str) -> impl Iterator<Item = &str> {
    source.split('"').skip(1).step_by(2)
}

#[test]
fn every_static_preflight_failure_reason_has_a_reviewed_disposition() {
    let mut discovered = std::collections::BTreeSet::new();
    for source in [
        include_str!("block_scoping.rs"),
        include_str!("classes.rs"),
        include_str!("destructuring.rs"),
        include_str!("for_of.rs"),
        include_str!("helpers.rs"),
        include_str!("parameters.rs"),
        include_str!("regexp.rs"),
        include_str!("transform.rs"),
    ] {
        discovered.extend(string_literals(source).filter(|value| looks_like_failure_reason(value)));
    }
    let reviewed = REVIEWED
        .iter()
        .map(|entry| entry.reason)
        .collect::<std::collections::BTreeSet<_>>();
    assert_eq!(discovered, reviewed);
    assert_eq!(
        reviewed.len(),
        REVIEWED.len(),
        "duplicate failure inventory entry"
    );
    assert!(REVIEWED.iter().all(|entry| !entry.stage.is_empty()));
    assert!(
        REVIEWED
            .iter()
            .filter(|entry| entry.mutated)
            .all(|entry| entry.disposition == Disposition::Fatal)
    );
}
