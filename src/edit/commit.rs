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
    let (code, layer) = sourcemap::render_decoded(source, &pieces, mode.unwrap_or("boundary"));
    Ok(NativeDecodedCommit {
        code,
        map: layer.into(),
    })
}
