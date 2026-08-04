use std::rc::Rc;

use crate::edit::{MappingPolicy, Piece};
use rustc_hash::FxHashMap;

pub(crate) mod function_map;
pub(crate) mod vlq;

#[derive(Debug, Clone, Copy)]
struct Segment {
    generated_column: u32,
    source: u32,
    original_line: u32,
    original_column: u32,
    name: u32,
}

#[derive(Default)]
struct MapBuilder {
    lines: Vec<Vec<Segment>>,
}

impl MapBuilder {
    fn encode(self) -> String {
        let mut output = String::new();
        let (mut prev_source, mut prev_line, mut prev_column, mut prev_name) = (0, 0, 0, 0);
        for (line_index, line) in self.lines.iter().enumerate() {
            if line_index > 0 {
                output.push(';');
            }
            let mut prev_generated = 0;
            for (index, segment) in line.iter().enumerate() {
                if index > 0 {
                    output.push(',');
                }
                vlq::encode(
                    i64::from(segment.generated_column) - i64::from(prev_generated),
                    &mut output,
                );
                vlq::encode(
                    i64::from(segment.source) - i64::from(prev_source),
                    &mut output,
                );
                vlq::encode(
                    i64::from(segment.original_line) - i64::from(prev_line),
                    &mut output,
                );
                vlq::encode(
                    i64::from(segment.original_column) - i64::from(prev_column),
                    &mut output,
                );
                if segment.name != 0 {
                    let name = i64::from(segment.name - 1);
                    vlq::encode(name - prev_name, &mut output);
                    prev_name = name;
                }
                prev_generated = segment.generated_column;
                prev_source = segment.source;
                prev_line = segment.original_line;
                prev_column = segment.original_column;
            }
        }
        output
    }
}

/// Receives the mapping segments the streaming walk emits. The VLQ sink writes the
/// final encoded `mappings` string; the decoded sink collects segments in packed
/// integer form, so intermediate phase boundaries never encode VLQ.
trait SegmentSink: Default {
    fn segment(
        &mut self,
        generated_column: i64,
        original_line: i64,
        original_column: i64,
        name: Option<i64>,
    );
    fn unmapped(&mut self, generated_column: i64);
    fn newline(&mut self);
}

#[derive(Default)]
struct VlqSink {
    mappings: String,
    previous_original_line: i64,
    previous_original_column: i64,
    previous_name: i64,
    previous_generated_column: i64,
    line_has_segment: bool,
}

impl SegmentSink for VlqSink {
    fn segment(
        &mut self,
        generated_column: i64,
        original_line: i64,
        original_column: i64,
        name: Option<i64>,
    ) {
        // Dense identity runs (character mode) repeat the delta (1, 0, 0, 1), which
        // always encodes as ",CAAC"; skipping the arithmetic is worth it there.
        if self.line_has_segment
            && name.is_none()
            && original_line == self.previous_original_line
            && generated_column - self.previous_generated_column == 1
            && original_column - self.previous_original_column == 1
        {
            self.mappings.push_str(",CAAC");
            self.previous_generated_column = generated_column;
            self.previous_original_column = original_column;
            return;
        }
        if self.line_has_segment {
            self.mappings.push(',');
        }
        vlq::encode(
            generated_column - self.previous_generated_column,
            &mut self.mappings,
        );
        vlq::encode(0, &mut self.mappings);
        vlq::encode(
            original_line - self.previous_original_line,
            &mut self.mappings,
        );
        vlq::encode(
            original_column - self.previous_original_column,
            &mut self.mappings,
        );
        if let Some(name) = name {
            vlq::encode(name - self.previous_name, &mut self.mappings);
            self.previous_name = name;
        }
        self.previous_original_line = original_line;
        self.previous_original_column = original_column;
        self.previous_generated_column = generated_column;
        self.line_has_segment = true;
    }
    fn unmapped(&mut self, generated_column: i64) {
        if self.line_has_segment {
            self.mappings.push(',');
        }
        vlq::encode(
            generated_column - self.previous_generated_column,
            &mut self.mappings,
        );
        self.previous_generated_column = generated_column;
        self.line_has_segment = true;
    }
    fn newline(&mut self) {
        self.mappings.push(';');
        self.previous_generated_column = 0;
        self.line_has_segment = false;
    }
}

/// Packed decoded segments: five little-endian u32 words per segment
/// (generated line, generated column, original line, original column, name id + 1),
/// preceded by nothing — the envelope around names is added when the buffer crosses
/// N-API.
#[derive(Default)]
struct DecodedSink {
    words: Vec<u32>,
    generated_line: u32,
}

impl SegmentSink for DecodedSink {
    fn segment(
        &mut self,
        generated_column: i64,
        original_line: i64,
        original_column: i64,
        name: Option<i64>,
    ) {
        self.words.extend_from_slice(&[
            self.generated_line,
            generated_column as u32,
            original_line as u32,
            original_column as u32,
            name.map_or(0, |name| name as u32 + 1),
        ]);
    }
    fn unmapped(&mut self, generated_column: i64) {
        self.words.extend_from_slice(&[
            self.generated_line,
            generated_column as u32,
            u32::MAX,
            u32::MAX,
            0,
        ]);
    }
    fn newline(&mut self) {
        self.generated_line += 1;
    }
}

#[derive(Default)]
struct StreamingMap<S: SegmentSink> {
    sink: S,
    generated_line: usize,
    generated_column: i64,
    original_line: i64,
    original_column: i64,
    last_mark: Option<(usize, i64)>,
    unmapped: bool,
}

impl<S: SegmentSink> StreamingMap<S> {
    fn mark(&mut self) {
        self.mark_name(None);
    }
    fn mark_name(&mut self, name: Option<i64>) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            return;
        }
        self.sink.segment(
            self.generated_column,
            self.original_line,
            self.original_column,
            name,
        );
        self.last_mark = Some((self.generated_line, self.generated_column));
        self.unmapped = false;
    }
    fn newline(&mut self) {
        self.sink.newline();
        self.generated_line += 1;
        self.generated_column = 0;
    }
    fn unmapped(&mut self) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            return;
        }
        self.sink.unmapped(self.generated_column);
        self.last_mark = Some((self.generated_line, self.generated_column));
        self.unmapped = true;
    }
    fn copied(&mut self, text: &str, character: bool) {
        if self.unmapped {
            self.mark();
        }
        if text.is_ascii() {
            for byte in text.bytes() {
                if character || self.generated_column == 0 {
                    self.mark();
                }
                if byte == b'\n' {
                    self.newline();
                    self.original_line += 1;
                    self.original_column = 0;
                } else {
                    self.generated_column += 1;
                    self.original_column += 1;
                }
            }
            return;
        }
        for ch in text.chars() {
            if character || self.generated_column == 0 {
                self.mark();
            }
            if ch == '\n' {
                self.newline();
                self.original_line += 1;
                self.original_column = 0;
            } else {
                let width = ch.len_utf16() as i64;
                self.generated_column += width;
                self.original_column += width;
            }
        }
    }
    fn removed(&mut self, text: &str) {
        if text.is_ascii() {
            for byte in text.bytes() {
                if byte == b'\n' {
                    self.original_line += 1;
                    self.original_column = 0;
                } else {
                    self.original_column += 1;
                }
            }
            return;
        }
        for ch in text.chars() {
            if ch == '\n' {
                self.original_line += 1;
                self.original_column = 0;
            } else {
                self.original_column += ch.len_utf16() as i64;
            }
        }
    }
    fn generated(&mut self, text: &str) {
        if text.is_ascii() {
            for byte in text.bytes() {
                if byte == b'\n' {
                    self.newline();
                } else {
                    self.generated_column += 1;
                }
            }
            return;
        }
        for ch in text.chars() {
            if ch == '\n' {
                self.newline();
            } else {
                self.generated_column += ch.len_utf16() as i64;
            }
        }
    }
}

fn intern(names: &mut Vec<Rc<str>>, name_ids: &mut FxHashMap<Rc<str>, i64>, name: &str) -> i64 {
    if let Some(index) = name_ids.get(name) {
        return *index;
    }
    let index = names.len() as i64;
    let name: Rc<str> = Rc::from(name);
    names.push(Rc::clone(&name));
    name_ids.insert(name, index);
    index
}

/// Line/column (UTF-16 columns) of a byte offset, for repositioning inside copies.
fn position_at(
    source: &str,
    line_starts: &[usize],
    utf16_offsets: &mut Option<Vec<usize>>,
    offset: usize,
) -> (i64, i64) {
    let line = line_starts.partition_point(|start| *start <= offset) - 1;
    let line_start = line_starts[line];
    let column = if source.is_ascii() {
        (offset - line_start) as i64
    } else {
        let offsets = utf16_offsets.get_or_insert_with(|| {
            let mut offsets = Vec::with_capacity(source.len() + 1);
            let mut utf16 = 0;
            for character in source.chars() {
                offsets.extend(std::iter::repeat_n(utf16, character.len_utf8()));
                utf16 += character.len_utf16();
            }
            offsets.push(utf16);
            offsets
        });
        (offsets[offset] - offsets[line_start]) as i64
    };
    (line as i64, column)
}

/// Move the streaming map's original position to `target`, building the line index
/// on first use. Repositioning is silent: it emits no segment, it only re-bases the
/// state the next mark or copied run reads.
fn reposition<S: SegmentSink>(
    map: &mut StreamingMap<S>,
    line_starts: &mut Option<Vec<usize>>,
    utf16_offsets: &mut Option<Vec<usize>>,
    source: &str,
    target: usize,
) {
    let starts = line_starts.get_or_insert_with(|| {
        let mut starts = vec![0];
        starts.extend(
            source
                .bytes()
                .enumerate()
                .filter(|(_, byte)| *byte == b'\n')
                .map(|(index, _)| index + 1),
        );
        starts
    });
    let (line, column) = position_at(source, starts, utf16_offsets, target);
    map.original_line = line;
    map.original_column = column;
}

struct Renderer<'a, S: SegmentSink> {
    source: &'a str,
    code: String,
    map: StreamingMap<S>,
    character: bool,
    line: bool,
    names: Vec<Rc<str>>,
    name_ids: FxHashMap<Rc<str>, i64>,
    /// Line index over the source, built lazily on the first repositioning:
    /// relocated pieces (copies) move the original cursor to arbitrary offsets.
    line_starts: Option<Vec<usize>>,
    /// UTF-16 position at every byte boundary, built lazily for non-ASCII input.
    utf16_offsets: Option<Vec<usize>>,
    /// Byte offset the map's (original_line, original_column) currently corresponds
    /// to. In-place pieces keep it advancing monotonically; a mismatch means the
    /// previous piece came from elsewhere and the position must be re-derived.
    cursor: usize,
}

impl<S: SegmentSink> Renderer<'_, S> {
    fn reposition(&mut self, target: usize) {
        reposition(
            &mut self.map,
            &mut self.line_starts,
            &mut self.utf16_offsets,
            self.source,
            target,
        );
    }

    fn pieces(&mut self, pieces: &[Piece]) {
        for piece in pieces {
            match piece {
                Piece::Original { start, end } => {
                    if *start != self.cursor {
                        self.reposition(*start);
                    }
                    let text = &self.source[*start..*end];
                    self.code.push_str(text);
                    self.map.copied(text, self.character);
                    self.cursor = *end;
                }
                Piece::Mark { origin } => {
                    if *origin != self.cursor {
                        self.reposition(*origin);
                        self.cursor = *origin;
                    }
                    self.map.mark();
                }
                Piece::Anchor { origin, name } => {
                    if !self.line {
                        if *origin != self.cursor {
                            self.reposition(*origin);
                            self.cursor = *origin;
                        }
                        let name = name
                            .as_ref()
                            .map(|name| intern(&mut self.names, &mut self.name_ids, name));
                        self.map.mark_name(name);
                    }
                }
                Piece::Generated {
                    text,
                    start,
                    end,
                    mapping,
                    names: piece_names,
                } => {
                    if *start != self.cursor {
                        self.reposition(*start);
                    }
                    if !self.line
                        && matches!(
                            mapping,
                            MappingPolicy::AnchorStart
                                | MappingPolicy::AnchorBoundaries
                                | MappingPolicy::Identity
                        )
                    {
                        let name = piece_names
                            .first()
                            .map(|name| intern(&mut self.names, &mut self.name_ids, name));
                        self.map.mark_name(name);
                    }
                    self.map.removed(&self.source[*start..*end]);
                    self.code.push_str(text);
                    // An empty generated piece occupies no generated range. Emitting an
                    // unmapped segment for it can suppress the mapped source piece that
                    // resumes at the same generated column.
                    if !self.line && !text.is_empty() && *mapping == MappingPolicy::Sourceless {
                        self.map.unmapped();
                    }
                    self.map.generated(text);
                    if !self.line && *mapping == MappingPolicy::AnchorBoundaries {
                        self.map.mark();
                    }
                    self.cursor = *end;
                }
                Piece::Splice(sub) => self.pieces(sub),
            }
        }
    }
}

fn render_into<'a, S: SegmentSink>(
    source: &'a str,
    pieces: &[Piece],
    mode: &str,
    sink: S,
) -> Renderer<'a, S> {
    let mut renderer = Renderer {
        source,
        code: String::with_capacity(source.len()),
        map: StreamingMap {
            sink,
            ..StreamingMap::default()
        },
        character: mode == "character",
        line: mode == "line",
        names: Vec::new(),
        name_ids: FxHashMap::default(),
        line_starts: None,
        utf16_offsets: None,
        cursor: 0,
    };
    renderer.pieces(pieces);
    renderer
}

pub fn render(source: &str, pieces: &[Piece], mode: &str) -> (String, String, Vec<String>) {
    let sink = VlqSink {
        mappings: String::with_capacity(if mode == "character" {
            source.len()
        } else {
            source.len() / 16
        }),
        ..VlqSink::default()
    };
    let renderer = render_into(source, pieces, mode, sink);
    (
        renderer.code,
        renderer.map.sink.mappings,
        renderer
            .names
            .into_iter()
            .map(|name| name.as_ref().to_owned())
            .collect(),
    )
}

/// Render code plus the mapping in packed decoded layer form, for phase boundaries
/// that feed later composition instead of final output.
pub fn render_decoded(source: &str, pieces: &[Piece], mode: &str) -> (String, Vec<u8>) {
    let (code, layer) = render_decoded_layer(source, pieces, mode);
    (code, layer.pack())
}

pub(crate) fn render_decoded_layer(
    source: &str,
    pieces: &[Piece],
    mode: &str,
) -> (String, DecodedLayer) {
    let renderer = render_into(source, pieces, mode, DecodedSink::default());
    let layer = DecodedLayer {
        words: renderer.map.sink.words,
        names: renderer.names,
        line_count: renderer.map.generated_line as u32,
    };
    (renderer.code, layer)
}

fn piece_text_len(pieces: &[Piece]) -> usize {
    pieces
        .iter()
        .map(|piece| match piece {
            Piece::Original { start, end } => end - start,
            Piece::Mark { .. } | Piece::Anchor { .. } => 0,
            Piece::Generated { text, .. } => text.len(),
            Piece::Splice(sub) => piece_text_len(sub),
        })
        .sum()
}

fn push_code(code: &mut String, source: &str, pieces: &[Piece]) {
    for piece in pieces {
        match piece {
            Piece::Original { start, end } => code.push_str(&source[*start..*end]),
            Piece::Mark { .. } | Piece::Anchor { .. } => {}
            Piece::Generated { text, .. } => code.push_str(text),
            Piece::Splice(sub) => push_code(code, source, sub),
        }
    }
}

pub fn render_code(source: &str, pieces: &[Piece]) -> String {
    let mut code = String::with_capacity(piece_text_len(pieces));
    push_code(&mut code, source, pieces);
    code
}

fn decode(mappings: &str) -> Vec<Vec<Segment>> {
    let mut lines = Vec::new();
    let (mut source, mut original_line, mut original_column, mut name) = (0, 0, 0, 0);
    for encoded_line in mappings.split(';') {
        let mut line = Vec::new();
        let mut generated_column = 0;
        for encoded in encoded_line
            .split(',')
            .filter(|segment| !segment.is_empty())
        {
            let bytes = encoded.as_bytes();
            let mut cursor = 0;
            let Some(generated_delta) = vlq::decode(bytes, &mut cursor) else {
                continue;
            };
            generated_column += generated_delta;
            let Some(source_delta) = vlq::decode(bytes, &mut cursor) else {
                continue;
            };
            let Some(line_delta) = vlq::decode(bytes, &mut cursor) else {
                continue;
            };
            let Some(column_delta) = vlq::decode(bytes, &mut cursor) else {
                continue;
            };
            source += source_delta;
            original_line += line_delta;
            original_column += column_delta;
            let decoded_name = if cursor < bytes.len() {
                name += vlq::decode(bytes, &mut cursor).unwrap_or(0);
                Some(name)
            } else {
                None
            };
            let Ok(generated_column) = u32::try_from(generated_column) else {
                continue;
            };
            let Ok(source) = u32::try_from(source) else {
                continue;
            };
            let Ok(original_line) = u32::try_from(original_line) else {
                continue;
            };
            let Ok(original_column) = u32::try_from(original_column) else {
                continue;
            };
            let name = decoded_name
                .and_then(|name| u32::try_from(name).ok())
                .map_or(0, |name| name + 1);
            line.push(Segment {
                generated_column,
                source,
                original_line,
                original_column,
                name,
            });
        }
        lines.push(line);
    }
    lines
}

fn compose_lines(
    outer_lines: Vec<Vec<Segment>>,
    inner_lines: &[Vec<Segment>],
    outer_name_count: u32,
) -> Vec<Vec<Segment>> {
    outer_lines
        .into_iter()
        .map(|line| {
            line.into_iter()
                .filter_map(|segment| {
                    let inner_line = inner_lines.get(segment.original_line as usize)?;
                    // Segments are emitted in generated-column order. Looking up the closest
                    // preceding inner segment used to scan backwards from the end for every
                    // outer segment, making composition quadratic for dense, single-line maps
                    // (a common shape for prebundled dependencies). `partition_point` keeps the
                    // same greatest-lower-bound behavior in logarithmic time.
                    let traced_index = inner_line
                        .partition_point(|inner| inner.generated_column <= segment.original_column);
                    let traced = inner_line.get(traced_index.checked_sub(1)?)?;
                    Some(Segment {
                        generated_column: segment.generated_column,
                        source: traced.source,
                        original_line: traced.original_line,
                        original_column: traced.original_column + segment.original_column
                            - traced.generated_column,
                        name: if segment.name != 0 {
                            segment.name
                        } else if traced.name != 0 {
                            traced.name + outer_name_count
                        } else {
                            0
                        },
                    })
                })
                .collect()
        })
        .collect()
}

pub fn compose(outer: &str, inner: &str, outer_name_count: u32) -> String {
    let outer_lines = decode(outer);
    let inner_lines = decode(inner);
    let composed = MapBuilder {
        lines: compose_lines(outer_lines, &inner_lines, outer_name_count),
    };
    composed.encode()
}

/// Pack one phase's decoded mapping (segment words from `render_decoded`, its names,
/// and the rendered line count) into a single buffer that crosses N-API opaquely.
///
/// Layout (little-endian u32 words): `[name_count, segments_word_offset, line_count,
/// name byte lengths...]`, then the concatenated UTF-8 name slab padded to a word
/// boundary, then five words per segment (generated line, generated column,
/// original line, original column, name id + 1).
mod decoded;

pub(crate) use decoded::{
    DecodedLayer, compose_decoded_layers, compose_layer_chain, generated_offsets,
    pack_decoded_layer,
};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::edit::{EditCommand, EditKind, build};

    #[test]
    fn segment_stays_word_packed() {
        assert_eq!(
            std::mem::size_of::<Segment>(),
            5 * std::mem::size_of::<u32>()
        );
    }

    #[test]
    fn encodes_identity_lines() {
        let pieces = build("a\nb", Vec::new()).unwrap();
        let (_, map, _) = render("a\nb", &pieces, "boundary");
        assert_eq!(map, "AAAA;AACA");
    }

    #[test]
    fn composes_two_maps() {
        assert_eq!(compose("AAAA;AACA", "AAAA;AACA", 0), "AAAA;AACA");
    }

    #[test]
    fn composition_preserves_nonzero_source_ids() {
        assert_eq!(compose("AAAA", "ACAA", 0), "ACAA");
    }

    fn named_replace(start: u32, end: u32, content: &str, name: &str) -> EditCommand {
        EditCommand {
            kind: EditKind::Replace,
            start,
            end,
            content: Some(content.into()),
            parts: Vec::new(),
            destination: None,
            mapping: Some(MappingPolicy::AnchorBoundaries),
            order: Some(0),
            names: Some(vec![name.into()]),
        }
    }

    #[test]
    fn decoded_layer_chain_matches_streaming_encode() {
        let source = "const value = 1;\nconst other = value + 2;\n";
        for mode in ["boundary", "character", "line"] {
            let pieces = build(source, vec![named_replace(6, 11, "renamed", "value")]).unwrap();
            let (code, mappings, names) = render(source, &pieces, mode);
            let (decoded_code, layer) = render_decoded(source, &pieces, mode);
            let (chained_mappings, chained_names) =
                compose_layer_chain(&[layer.as_slice()]).unwrap();
            assert_eq!(code, decoded_code);
            assert_eq!(mappings, chained_mappings, "mode {mode}");
            assert_eq!(names, chained_names, "mode {mode}");
        }
    }

    #[test]
    fn sourceless_insertions_emit_unmapped_segments_in_decoded_layers() {
        let source = "function() {}";
        let pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::AppendLeft,
                start: 8,
                end: 8,
                content: Some(" _ref".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Sourceless),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, direct, _) = render(source, &pieces, "character");
        let (_, layer) = render_decoded(source, &pieces, "character");
        let (decoded, _) = compose_layer_chain(&[layer.as_slice()]).unwrap();
        assert_eq!(decoded, direct);
        assert!(direct.split(',').any(|segment| segment == "C"));

        let generated = render_code(source, &pieces);
        let identity = build(&generated, Vec::new()).unwrap();
        let (_, identity_layer) = render_decoded(&generated, &identity, "character");
        let (composed, _) =
            compose_layer_chain(&[layer.as_slice(), identity_layer.as_slice()]).unwrap();
        assert!(composed.split(',').any(|segment| segment.len() == 1));
    }

    #[test]
    fn empty_sourceless_replacements_do_not_mask_resuming_source() {
        let source = "remove;const retained = 1;";
        let pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 0,
                end: 7,
                content: Some(String::new()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Sourceless),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, mappings, _) = render(source, &pieces, "character");
        assert!(mappings.starts_with("A"));
        assert!(mappings.len() > 1, "retained source should remain mapped");
    }

    #[test]
    fn decoded_chain_composition_matches_vlq_composition() {
        let source = "const value = 1;\nconst other = value + 2;\n";
        let first_pieces = build(source, vec![named_replace(6, 11, "renamed", "value")]).unwrap();
        let (first_code, first_mappings, first_names) = render(source, &first_pieces, "boundary");
        let (_, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let second_pieces =
            build(&first_code, vec![named_replace(24, 29, "swapped", "other")]).unwrap();
        let (_, second_mappings, second_names) = render(&first_code, &second_pieces, "boundary");
        let (_, second_layer) = render_decoded(&first_code, &second_pieces, "boundary");
        let (chained_mappings, chained_names) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        assert_eq!(
            chained_mappings,
            compose(&second_mappings, &first_mappings, second_names.len() as u32)
        );
        let mut expected_names = second_names;
        expected_names.extend(first_names);
        assert_eq!(chained_names, expected_names);
    }

    #[test]
    fn composes_dense_single_line_maps() {
        let segments = (0..10_000)
            .map(|column| Segment {
                generated_column: column * 2,
                source: 0,
                original_line: 0,
                original_column: column * 2,
                name: 0,
            })
            .collect();
        let mappings = MapBuilder {
            lines: vec![segments],
        }
        .encode();

        assert_eq!(compose(&mappings, &mappings, 0), mappings);
    }

    #[test]
    fn code_and_mapped_piece_rendering_match() {
        let source = "const value = 1;\n";
        let pieces = build(
            source,
            vec![
                EditCommand {
                    kind: EditKind::PrependRight,
                    start: 0,
                    end: 0,
                    content: Some("/* generated */\n".into()),
                    parts: Vec::new(),
                    destination: None,
                    mapping: Some(MappingPolicy::Sourceless),
                    order: Some(0),
                    names: None,
                },
                EditCommand {
                    kind: EditKind::Replace,
                    start: 6,
                    end: 11,
                    content: Some("renamed".into()),
                    parts: Vec::new(),
                    destination: None,
                    mapping: Some(MappingPolicy::AnchorBoundaries),
                    order: Some(1),
                    names: Some(vec!["value".into()]),
                },
            ],
        )
        .unwrap();
        let code = render_code(source, &pieces);
        let (mapped_code, mappings, names) = render(source, &pieces, "boundary");
        assert_eq!(code, mapped_code);
        assert!(!mappings.is_empty());
        assert_eq!(names, ["value"]);
    }

    #[test]
    fn interns_dense_mapping_names_in_first_seen_order() {
        let source = "x ".repeat(1_000);
        let pieces = build(
            &source,
            (0..1_000)
                .map(|index| EditCommand {
                    kind: EditKind::Replace,
                    start: index * 2,
                    end: index * 2 + 1,
                    content: Some("y".into()),
                    parts: Vec::new(),
                    destination: None,
                    mapping: Some(MappingPolicy::AnchorStart),
                    order: Some(index),
                    names: Some(vec![format!("name{index}")]),
                })
                .collect(),
        )
        .unwrap();
        let (_, mappings, names) = render(&source, &pieces, "boundary");
        assert!(!mappings.is_empty());
        assert_eq!(names.len(), 1_000);
        assert_eq!(names.first().map(String::as_str), Some("name0"));
        assert_eq!(names.last().map(String::as_str), Some("name999"));
    }
}
