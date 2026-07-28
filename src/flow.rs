//! Native Flow erasure at the napi boundary.
//!
//! Hermes parses the file, `hermes-flow` collects the byte ranges Flow syntax
//! occupies, and those ranges become `Remove` edits committed through the same
//! piece table every other phase uses. The map that falls out is a pure
//! deletion map, which is why an erased file needs no adapter-shaped input-map
//! composition: there is nothing in the output that was not in the input.
//!
//! Behind the `flow_parser` feature. With it off this reports `unsupported`,
//! the same shape `react-compiler-not-built` uses, and the caller falls back to
//! its registered parser adapter.

use napi_derive::napi;

use crate::event_types::NativeVlqMap;

/// The outcome of trying to erase a Flow file.
#[napi(object)]
pub struct NativeFlowErasure {
    /// `erased`, `bailed`, or `unsupported`.
    pub status: String,
    /// Present when `status` is `erased`.
    pub code: Option<String>,
    /// Present when `status` is `erased`. Deletion-only, so composing it is
    /// cheap and it never invents a position.
    pub map: Option<NativeVlqMap>,
    /// Why the file was not erased, for the coverage counter: `proposal-syntax`,
    /// `parse-failed`, `unhandled-flow`, and so on.
    pub reason: Option<String>,
    /// The construct behind `reason` — a node name, a `Node.field`, or a parser
    /// message. A coverage regression is only actionable if it says what to go
    /// and look at.
    pub detail: Option<String>,
    /// Bytes removed. Zero when the file bailed.
    pub erased_bytes: u32,
    /// Number of ranges removed, so a bundle can report how much work the
    /// erasure actually did rather than only whether it ran.
    pub span_count: u32,
}

impl NativeFlowErasure {
    #[cfg(feature = "flow_parser")]
    fn bailed(bail: &hermes_flow::Bail) -> Self {
        Self {
            status: "bailed".into(),
            code: None,
            map: None,
            reason: Some(bail.kind.as_str().into()),
            detail: Some(bail.detail.clone()),
            erased_bytes: 0,
            span_count: 0,
        }
    }
}

/// Erases the Flow syntax in `source`.
///
/// `mode` matches the modes `commit_*_buffer` accepts; `none` skips mapping
/// entirely, which is what a caller that only wants the code should pass.
#[cfg(not(feature = "flow_parser"))]
pub(crate) fn erase(
    _source: &str,
    _filename: &str,
    _mode: Option<&str>,
) -> napi::Result<NativeFlowErasure> {
    Ok(NativeFlowErasure {
        status: "unsupported".into(),
        code: None,
        map: None,
        reason: Some("flow-parser-not-built".into()),
        detail: None,
        erased_bytes: 0,
        span_count: 0,
    })
}

/// Erases the Flow syntax in `source`. See the `cfg`-off twin above.
#[cfg(feature = "flow_parser")]
pub(crate) fn erase(
    source: &str,
    filename: &str,
    mode: Option<&str>,
) -> napi::Result<NativeFlowErasure> {
    use crate::edit::{EditCommand, EditKind, MappingPolicy};

    let erasure = match hermes_flow::erase_source(source) {
        Ok(erasure) => erasure,
        Err(bail) => return Ok(NativeFlowErasure::bailed(&bail)),
    };

    let erased_bytes = erasure.erased_bytes();
    let span_count = erasure.spans.len() as u32;
    let commands = removals(source, &erasure.spans);
    let committed = crate::edit::commit::commit(source, filename, commands, mode)?;

    return Ok(NativeFlowErasure {
        status: "erased".into(),
        code: Some(committed.code),
        map: Some(committed.map),
        reason: None,
        detail: None,
        erased_bytes,
        span_count,
    });

    /// Turns byte ranges into `Remove` edits.
    ///
    /// Edit offsets are JavaScript UTF-16 code units and the erasure works in
    /// UTF-8 bytes, so the boundaries have to be translated. The spans are
    /// sorted, so one pass over the source covers all of them — and an ASCII
    /// source, which most are, skips the pass entirely.
    fn removals(source: &str, spans: &[std::ops::Range<u32>]) -> Vec<EditCommand> {
        let mut commands = Vec::with_capacity(spans.len());
        let mut push = |start: u32, end: u32| {
            commands.push(EditCommand {
                kind: EditKind::Remove,
                start,
                end,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Sourceless),
                order: None,
                names: None,
            });
        };

        if source.is_ascii() {
            for span in spans {
                push(span.start, span.end);
            }
            return commands;
        }

        let mut boundaries: Vec<u32> = Vec::with_capacity(spans.len() * 2);
        for span in spans {
            boundaries.push(span.start);
            boundaries.push(span.end);
        }
        let mut translated = Vec::with_capacity(boundaries.len());
        let mut next = 0usize;
        let mut utf16 = 0u32;
        for (byte, character) in source.char_indices() {
            while next < boundaries.len() && boundaries[next] as usize == byte {
                translated.push(utf16);
                next += 1;
            }
            utf16 += character.len_utf16() as u32;
        }
        while translated.len() < boundaries.len() {
            translated.push(utf16);
        }

        for pair in translated.chunks_exact(2) {
            push(pair[0], pair[1]);
        }
        commands
    }
}

#[cfg(all(test, feature = "flow_parser"))]
mod tests {
    use super::*;

    #[test]
    fn erases_and_reports_coverage() {
        let result = erase("// @flow\nconst x: number = 1;\n", "a.js", Some("none")).unwrap();
        assert_eq!(result.status, "erased");
        assert_eq!(result.code.as_deref(), Some("// @flow\nconst x = 1;\n"));
        assert_eq!(result.erased_bytes, 8, "`: number`");
        assert_eq!(result.span_count, 1);
    }

    #[test]
    fn reports_a_bail_reason() {
        let result = erase("component Foo() { return null; }\n", "a.js", Some("none")).unwrap();
        assert_eq!(result.status, "bailed");
        assert_eq!(result.reason.as_deref(), Some("proposal-syntax"));
    }

    /// Edits are in UTF-16 code units; the erasure works in UTF-8 bytes. An
    /// astral character ahead of the annotation is where the two diverge most:
    /// four bytes against two code units.
    #[test]
    fn translates_offsets_on_a_non_ascii_source() {
        let source = "const s = '🙂 héllo'; const x: number = 2;\n";
        let result = erase(source, "a.js", Some("none")).unwrap();
        assert_eq!(
            result.code.as_deref(),
            Some("const s = '🙂 héllo'; const x = 2;\n"),
            "bailed with {:?}",
            result.reason
        );
    }

    #[test]
    fn produces_a_deletion_map() {
        let result = erase("const x: number = 1;\n", "a.js", None).unwrap();
        let map = result.map.expect("map");
        assert!(!map.mappings.is_empty(), "erased files still carry a map");
    }
}
