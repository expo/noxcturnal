use napi::{Error, Result, Status};
use oxc_span::SourceType;

use crate::event_types::ParseClassification;

pub(crate) fn classify_source(filename: &str, source: &str) -> ParseClassification {
    let lower = filename.to_ascii_lowercase();
    let syntax =
        if lower.ends_with(".d.ts") || lower.ends_with(".d.mts") || lower.ends_with(".d.cts") {
            "dts"
        } else if lower.ends_with(".tsx") {
            "tsx"
        } else if lower.ends_with(".ts") || lower.ends_with(".mts") || lower.ends_with(".cts") {
            "ts"
        } else if lower.ends_with(".jsx") {
            "jsx"
        } else if lower.ends_with(".js") || lower.ends_with(".mjs") || lower.ends_with(".cjs") {
            if has_flow_directive(source) {
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
        reason: if supported {
            "oxc-supported".into()
        } else if syntax == "flow" {
            "flow-requires-parser-adapter".into()
        } else {
            "unknown-extension".into()
        },
    }
}

// Classification selects the dialect at the public boundary. Once selected, native
// parsing must not reinterpret an adapter's preserved comment as its input syntax.
pub(crate) fn source_type(filename: &str, _source: &str) -> Result<SourceType> {
    SourceType::from_path(filename.to_ascii_lowercase()).map_err(|_| {
        Error::new(
            Status::InvalidArg,
            format!("unsupported filename extension: {filename}"),
        )
    })
}

fn has_flow_directive(source: &str) -> bool {
    let mut remaining = source;
    if remaining.starts_with("#!") {
        remaining =
            remaining.trim_start_matches(|c| !matches!(c, '\r' | '\n' | '\u{2028}' | '\u{2029}'));
    }
    loop {
        remaining = remaining.trim_start_matches(|c| {
            oxc_syntax::identifier::is_white_space(c)
                || matches!(c, '\r' | '\n' | '\u{2028}' | '\u{2029}')
        });
        let end = if remaining.starts_with("//") {
            remaining
                .find(['\r', '\n', '\u{2028}', '\u{2029}'])
                .unwrap_or(remaining.len())
        } else if let Some(comment) = remaining.strip_prefix("/*") {
            let Some(end) = comment.find("*/") else {
                return false;
            };
            end + 4
        } else {
            return false;
        };
        let comment = &remaining[2..end];
        if comment.match_indices("@flow").any(|(at, _)| {
            let word = |c: char| c.is_ascii_alphanumeric() || c == '_';
            !comment[..at].chars().next_back().is_some_and(word)
                && !comment[at + 5..].chars().next().is_some_and(word)
        }) {
            return true;
        }
        remaining = &remaining[end..];
    }
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
            assert_eq!(source_type(filename, source).is_err(), syntax == "unknown");
        }
    }
}
