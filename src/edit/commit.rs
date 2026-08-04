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
    commit_decoded_buffer_preserving(source, _filename, data, mode, None)
}

pub fn commit_decoded_buffer_preserving(
    source: &str,
    _filename: &str,
    data: &[u8],
    mode: Option<&str>,
    previous_layer: Option<&[u8]>,
) -> Result<NativeDecodedCommit> {
    let commands = decode_packed_commands(data)?;
    let mut pieces = super::build(source, commands)?;
    if let Some(previous_layer) = previous_layer {
        let locations = sourcemap::generated_offsets(previous_layer, source)
            .ok_or_else(|| napi::Error::from_reason("invalid previous source-map layer"))?;
        pieces = preserve_mapping_locations(pieces, &locations);
    }
    let (code, layer) = sourcemap::render_decoded(source, &pieces, mode.unwrap_or("boundary"));
    let code_changed = code != source;
    // Mapping effects are independent from byte effects. Compare with the
    // renderer's canonical empty transaction so identity replacements and
    // empty insertions can preserve the current source version, while explicit
    // marks or non-identity mapping policies still create a map-only child.
    let identity_pieces = super::build(source, Vec::new())?;
    let (_, identity_layer) =
        sourcemap::render_decoded(source, &identity_pieces, mode.unwrap_or("boundary"));
    let map_changed = layer != identity_layer;
    Ok(NativeDecodedCommit {
        code,
        map: layer.into(),
        code_changed,
        map_changed,
    })
}

fn preserve_mapping_locations(pieces: Vec<super::Piece>, locations: &[usize]) -> Vec<super::Piece> {
    let mut search = MappingLocationSearch::default();
    preserve_mapping_locations_with_search(pieces, locations, &mut search)
}

#[derive(Default)]
struct MappingLocationSearch {
    index: usize,
    previous_end: usize,
}

fn preserve_mapping_locations_with_search(
    pieces: Vec<super::Piece>,
    locations: &[usize],
    search: &mut MappingLocationSearch,
) -> Vec<super::Piece> {
    let mut preserved = Vec::with_capacity(pieces.len() + locations.len());
    for piece in pieces {
        match piece {
            super::Piece::Original { start, end } => {
                let mut cursor = start;
                // Ordinary ranges form a linear merge walk; moves and copies may jump
                // backward, so only those ranges fall back to binary search.
                let (first, last) = if start >= search.previous_end {
                    let mut first = search.index;
                    while locations.get(first).is_some_and(|origin| *origin < start) {
                        first += 1;
                    }
                    let mut last = first;
                    while locations.get(last).is_some_and(|origin| *origin < end) {
                        last += 1;
                    }
                    (first, last)
                } else {
                    (
                        locations.partition_point(|origin| *origin < start),
                        locations.partition_point(|origin| *origin < end),
                    )
                };
                for &origin in &locations[first..last] {
                    if cursor < origin {
                        preserved.push(super::Piece::Original {
                            start: cursor,
                            end: origin,
                        });
                    }
                    preserved.push(super::Piece::Mark { origin });
                    cursor = origin;
                }
                if cursor < end {
                    preserved.push(super::Piece::Original { start: cursor, end });
                }
                search.index = last;
                search.previous_end = end;
            }
            super::Piece::Splice(parts) => preserved.push(super::Piece::Splice(
                preserve_mapping_locations_with_search(parts.as_ref().to_vec(), locations, search)
                    .into(),
            )),
            piece => preserved.push(piece),
        }
    }
    preserved
}
