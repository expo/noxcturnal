use napi::{Error, Status};
use oxc_diagnostics::OxcDiagnostic;

const PREFIX: &str = "__NOXCTURNAL_PARSE_FAILURE__:";

pub(crate) fn error(source: &str, diagnostics: &[OxcDiagnostic], operation: &'static str) -> Error {
    let diagnostic = diagnostics.first();
    let offset = diagnostic
        .and_then(|diagnostic| {
            diagnostic
                .labels
                .iter()
                .find(|label| label.primary())
                .or_else(|| diagnostic.labels.first())
                .map(|label| label.offset() as usize)
        })
        .unwrap_or(0)
        .min(source.len());
    let prefix = &source[..offset];
    let mut line = 1;
    let mut line_start = 0;
    let mut characters = prefix.char_indices().peekable();
    while let Some((at, character)) = characters.next() {
        if character == '\r' {
            if characters.peek().is_some_and(|(_, next)| *next == '\n') {
                characters.next();
            }
            line += 1;
            line_start = characters.peek().map_or(prefix.len(), |(next, _)| *next);
        } else if matches!(character, '\n' | '\u{2028}' | '\u{2029}') {
            line += 1;
            line_start = at + character.len_utf8();
        }
    }
    let column = source[line_start..offset].encode_utf16().count();
    let message = diagnostic.map_or("Parse failed", |diagnostic| diagnostic.message.as_ref());
    let payload = serde_json::json!({
        "message": message,
        "line": line,
        "column": column,
        "operation": operation,
        // A failed resident phase may already have consumed its source. Carry it
        // only on the cold error path for accurate frames and adapter attribution.
        "source": source,
    });
    Error::new(Status::InvalidArg, format!("{PREFIX}{payload}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_diagnostics::OxcDiagnostic;
    use oxc_span::Span;

    #[test]
    fn missing_label_is_safe() {
        let error = error("source", &[OxcDiagnostic::error("bad")], "function-map");
        assert!(error.reason.contains("\"line\":1"));
        assert!(error.reason.contains("\"column\":0"));
    }

    #[test]
    fn reports_utf16_columns_and_crlf_lines() {
        let source = "first\r\n\t😀e\u{301} bad";
        let offset = source.find("bad").unwrap();
        let diagnostic = OxcDiagnostic::error("bad token")
            .with_label(Span::new(offset as u32, offset as u32 + 3));
        let error = error(source, &[diagnostic], "indexed-session");
        let value: serde_json::Value =
            serde_json::from_str(error.reason.strip_prefix(PREFIX).expect("tagged payload"))
                .unwrap();
        assert_eq!(value["line"], 2);
        assert_eq!(value["column"], 6);
        assert_eq!(value["message"], "bad token");
        assert_eq!(value["operation"], "indexed-session");
    }
}
