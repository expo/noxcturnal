use napi::{Error, Result, Status};
use oxc_span::SourceType;

use crate::event_types::ParseClassification;

pub(crate) fn classify_source(filename: &str, source: &str) -> ParseClassification {
    let lower = filename.to_ascii_lowercase();
    let syntax = if lower.ends_with(".d.ts") {
        "dts"
    } else if lower.ends_with(".tsx") {
        "tsx"
    } else if lower.ends_with(".ts") || lower.ends_with(".mts") || lower.ends_with(".cts") {
        "ts"
    } else if lower.ends_with(".jsx") {
        "jsx"
    } else if lower.ends_with(".js") || lower.ends_with(".mjs") || lower.ends_with(".cjs") {
        if source.contains("@flow") {
            "flow"
        } else {
            "js"
        }
    } else {
        "unknown"
    };
    let supported = !matches!(syntax, "flow" | "unknown");
    ParseClassification {
        syntax: syntax.into(),
        supported,
        codegen_candidate: source.contains("codegenNativeComponent")
            || source.contains("codegenNativeCommands"),
        reason: if supported {
            "oxc-supported".into()
        } else if syntax == "flow" {
            "flow-requires-parser-adapter".into()
        } else {
            "unknown-extension".into()
        },
    }
}

pub(crate) fn source_type(filename: &str, source: &str) -> Result<SourceType> {
    let classification = classify_source(filename, source);
    if !classification.supported {
        return Err(Error::new(Status::GenericFailure, classification.reason));
    }
    SourceType::from_path(filename).map_err(|_| {
        Error::new(
            Status::InvalidArg,
            format!("unsupported filename extension: {filename}"),
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_supported_extensions() {
        for (filename, expected) in [
            ("fixture.d.ts", "dts"),
            ("fixture.tsx", "tsx"),
            ("fixture.ts", "ts"),
            ("fixture.mts", "ts"),
            ("fixture.cts", "ts"),
            ("fixture.jsx", "jsx"),
            ("fixture.js", "js"),
            ("fixture.mjs", "js"),
            ("fixture.cjs", "js"),
        ] {
            let result = classify_source(filename, "const value = 1;");
            assert_eq!(result.syntax, expected, "{filename}");
            assert!(result.supported, "{filename}");
            assert_eq!(result.reason, "oxc-supported", "{filename}");
        }
    }

    #[test]
    fn classifies_unsupported_sources() {
        for (filename, source, syntax, reason) in [
            (
                "fixture.js",
                "// @flow\nconst value: number = 1;",
                "flow",
                "flow-requires-parser-adapter",
            ),
            (
                "fixture.txt",
                "const value = 1;",
                "unknown",
                "unknown-extension",
            ),
        ] {
            let result = classify_source(filename, source);
            assert_eq!(result.syntax, syntax);
            assert!(!result.supported);
            assert_eq!(result.reason, reason);
            assert!(source_type(filename, source).is_err());
        }
    }

    #[test]
    fn detects_codegen_candidates_case_insensitively_by_extension() {
        let result = classify_source(
            "Component.TSX",
            "export default codegenNativeComponent('Component');",
        );
        assert_eq!(result.syntax, "tsx");
        assert!(result.supported);
        assert!(result.codegen_candidate);
    }
}
