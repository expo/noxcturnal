use napi::Result;

use crate::event_types::{NativeCommitResult, NativeDecodedCommit, NativeVlqMap};
use crate::protocol::edits::decode_packed_commands;
use crate::sourcemap;

pub fn commit(
    source: &str,
    _filename: &str,
    commands: Vec<super::EditCommand>,
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    let pieces = super::build(source, commands)?;
    let (code, mappings, names) = if mode == Some("none") {
        (
            sourcemap::render_code(source, &pieces),
            String::new(),
            Vec::new(),
        )
    } else {
        sourcemap::render(source, &pieces, mode.unwrap_or("boundary"))
    };
    Ok(NativeCommitResult {
        code,
        map: NativeVlqMap { mappings, names },
    })
}

pub fn commit_packed_buffer(
    source: &str,
    filename: &str,
    data: &[u8],
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    commit(source, filename, decode_packed_commands(data)?, mode)
}

/// Commit that keeps the phase's mapping in packed decoded form instead of encoding
/// VLQ: the rendered code feeds the next phase's parse while the layer buffer feeds
/// `compose_decoded_chain` once the pipeline finishes.
pub fn commit_decoded_buffer(
    source: &str,
    _filename: &str,
    data: &[u8],
    mode: Option<&str>,
) -> Result<NativeDecodedCommit> {
    let commands = decode_packed_commands(data)?;
    let pieces = super::build(source, commands)?;
    let mode = mode.unwrap_or("boundary");
    let (code, layer) = sourcemap::render_decoded_layer(source, &pieces, mode);
    let code_changed = code != source;
    let map_changed = mapping_changed(source, &layer, mode)?;
    Ok(NativeDecodedCommit {
        code,
        map: layer.pack().into(),
        code_changed,
        map_changed,
    })
}

fn mapping_changed(source: &str, layer: &sourcemap::DecodedLayer, mode: &str) -> Result<bool> {
    // Canonical identity has no names, unmapped segments, or coordinates that
    // differ between input and output. Ordinary insertions, removals, and
    // relocations can therefore prove a change without rendering the complete
    // source again just to construct a comparison map.
    if !layer.names.is_empty()
        || layer.words.chunks_exact(5).any(|segment| {
            segment[0] != segment[2] || segment[1] != segment[3] || segment[2] == u32::MAX
        })
    {
        return Ok(true);
    }
    // Equal coordinates alone do not prove identity: extra marks or a different
    // span policy are observable mapping changes even when bytes are unchanged.
    // Keep the exact canonical comparison for those cases. Comparing the decoded
    // fields is equivalent to comparing their packed envelopes, without packing
    // an identity layer that will immediately be discarded.
    let identity_pieces = super::build(source, Vec::new())?;
    let (_, identity) = sourcemap::render_decoded_layer(source, &identity_pieces, mode);
    Ok(layer.words != identity.words
        || layer.names != identity.names
        || layer.last_generated_line != identity.last_generated_line)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::edit::{EditCommand, EditKind, MappingPolicy};

    fn command(kind: EditKind, start: u32, end: u32, content: Option<&str>) -> EditCommand {
        EditCommand {
            kind,
            start,
            end,
            content: content.map(str::to_owned),
            parts: Vec::new(),
            destination: None,
            mapping: Some(MappingPolicy::Identity),
            order: Some(0),
            names: None,
        }
    }

    fn observe(command: EditCommand) -> (String, bool) {
        let source = "abc";
        let pieces = crate::edit::build(source, vec![command]).unwrap();
        let (code, layer) = sourcemap::render_decoded_layer(source, &pieces, "boundary");
        let changed = mapping_changed(source, &layer, "boundary").unwrap();
        (code, changed)
    }

    #[test]
    fn decoded_commit_preserves_identity_replacements_and_empty_insertions() {
        assert_eq!(
            observe(command(EditKind::Replace, 0, 3, Some("abc"))),
            ("abc".into(), false),
        );
        let mut insertion = command(EditKind::PrependRight, 1, 1, Some(""));
        insertion.mapping = Some(MappingPolicy::Sourceless);
        assert_eq!(observe(insertion), ("abc".into(), false));
    }

    #[test]
    fn decoded_commit_preserves_map_only_marks_names_and_span_policies() {
        assert_eq!(
            observe(command(EditKind::AddSourceMapLocation, 1, 1, None)),
            ("abc".into(), true),
        );
        let mut named = command(EditKind::Replace, 0, 3, Some("abc"));
        named.names = Some(vec!["original".into()]);
        assert_eq!(observe(named), ("abc".into(), true));
        let mut anchored = command(EditKind::Replace, 0, 3, Some("abc"));
        anchored.mapping = Some(MappingPolicy::AnchorStart);
        assert_eq!(observe(anchored), ("abc".into(), true));
        let mut unmapped = command(EditKind::Replace, 0, 3, Some("abc"));
        unmapped.mapping = Some(MappingPolicy::Sourceless);
        assert_eq!(observe(unmapped), ("abc".into(), true));
    }

    #[test]
    fn decoded_commit_reports_mapping_changes_for_insertions_and_shifted_source() {
        let mut prefix = command(EditKind::PrependRight, 0, 0, Some("generated\n"));
        prefix.mapping = Some(MappingPolicy::Sourceless);
        assert_eq!(observe(prefix), ("generated\nabc".into(), true));
        assert_eq!(
            observe(command(EditKind::Remove, 0, 1, None)),
            ("bc".into(), true),
        );
    }
}
