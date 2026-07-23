use crate::editor::{MappingPolicy, Piece};
use rustc_hash::FxHashMap;

#[derive(Debug, Clone, Copy)]
struct Segment {
    generated_column: i64,
    source: i64,
    original_line: i64,
    original_column: i64,
    name: Option<i64>,
}

pub(crate) fn vlq(mut value: i64, output: &mut String) {
    const CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let negative = value < 0;
    if negative {
        value = -value;
    }
    let mut encoded = (value << 1) | i64::from(negative);
    loop {
        let mut digit = (encoded & 31) as usize;
        encoded >>= 5;
        if encoded != 0 {
            digit |= 32;
        }
        output.push(CHARS[digit] as char);
        if encoded == 0 {
            break;
        }
    }
}

fn decode_char(value: u8) -> Option<i64> {
    match value {
        b'A'..=b'Z' => Some(i64::from(value - b'A')),
        b'a'..=b'z' => Some(i64::from(value - b'a') + 26),
        b'0'..=b'9' => Some(i64::from(value - b'0') + 52),
        b'+' => Some(62),
        b'/' => Some(63),
        _ => None,
    }
}

fn decode_vlq(bytes: &[u8], cursor: &mut usize) -> Option<i64> {
    let mut value = 0i64;
    let mut shift = 0;
    loop {
        let digit = decode_char(*bytes.get(*cursor)?)?;
        *cursor += 1;
        value |= (digit & 31) << shift;
        if digit & 32 == 0 {
            return Some(if value & 1 == 1 {
                -(value >> 1)
            } else {
                value >> 1
            });
        }
        shift += 5;
    }
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
                vlq(segment.generated_column - prev_generated, &mut output);
                vlq(segment.source - prev_source, &mut output);
                vlq(segment.original_line - prev_line, &mut output);
                vlq(segment.original_column - prev_column, &mut output);
                if let Some(name) = segment.name {
                    vlq(name - prev_name, &mut output);
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
        vlq(
            generated_column - self.previous_generated_column,
            &mut self.mappings,
        );
        vlq(0, &mut self.mappings);
        vlq(
            original_line - self.previous_original_line,
            &mut self.mappings,
        );
        vlq(
            original_column - self.previous_original_column,
            &mut self.mappings,
        );
        if let Some(name) = name {
            vlq(name - self.previous_name, &mut self.mappings);
            self.previous_name = name;
        }
        self.previous_original_line = original_line;
        self.previous_original_column = original_column;
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
    }
    fn newline(&mut self) {
        self.sink.newline();
        self.generated_line += 1;
        self.generated_column = 0;
    }
    fn copied(&mut self, text: &str, character: bool) {
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

fn intern(names: &mut Vec<String>, name_ids: &mut FxHashMap<String, i64>, name: &str) -> i64 {
    if let Some(index) = name_ids.get(name) {
        return *index;
    }
    let index = names.len() as i64;
    names.push(name.to_string());
    name_ids.insert(name.to_string(), index);
    index
}

/// Line/column (UTF-16 columns) of a byte offset, for repositioning inside copies.
fn position_at(source: &str, line_starts: &[usize], offset: usize) -> (i64, i64) {
    let line = line_starts.partition_point(|start| *start <= offset) - 1;
    let text = &source[line_starts[line]..offset];
    let column = if text.is_ascii() {
        text.len() as i64
    } else {
        text.chars().map(|ch| ch.len_utf16() as i64).sum()
    };
    (line as i64, column)
}

/// Move the streaming map's original position to `target`, building the line index
/// on first use. Repositioning is silent: it emits no segment, it only re-bases the
/// state the next mark or copied run reads.
fn reposition<S: SegmentSink>(
    map: &mut StreamingMap<S>,
    line_starts: &mut Option<Vec<usize>>,
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
    let (line, column) = position_at(source, starts, target);
    map.original_line = line;
    map.original_column = column;
}

struct Renderer<'a, S: SegmentSink> {
    source: &'a str,
    code: String,
    map: StreamingMap<S>,
    character: bool,
    line: bool,
    names: Vec<String>,
    name_ids: FxHashMap<String, i64>,
    /// Line index over the source, built lazily on the first repositioning:
    /// relocated pieces (copies) move the original cursor to arbitrary offsets.
    line_starts: Option<Vec<usize>>,
    /// Byte offset the map's (original_line, original_column) currently corresponds
    /// to. In-place pieces keep it advancing monotonically; a mismatch means the
    /// previous piece came from elsewhere and the position must be re-derived.
    cursor: usize,
}

impl<S: SegmentSink> Renderer<'_, S> {
    fn reposition(&mut self, target: usize) {
        reposition(&mut self.map, &mut self.line_starts, self.source, target);
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
        cursor: 0,
    };
    renderer.pieces(pieces);
    renderer
}

pub fn render(source: &str, pieces: &[Piece], mode: &str) -> (String, String, Vec<String>) {
    let sink = VlqSink {
        mappings: String::with_capacity(if mode == "character" {
            source.len() * 5
        } else {
            source.len() / 16
        }),
        ..VlqSink::default()
    };
    let renderer = render_into(source, pieces, mode, sink);
    (renderer.code, renderer.map.sink.mappings, renderer.names)
}

/// Render code plus the mapping in packed decoded layer form, for phase boundaries
/// that feed later composition instead of final output.
pub fn render_decoded(source: &str, pieces: &[Piece], mode: &str) -> (String, Vec<u8>) {
    let renderer = render_into(source, pieces, mode, DecodedSink::default());
    let layer = pack_decoded_layer(
        &renderer.map.sink.words,
        &renderer.names,
        renderer.map.generated_line as u32,
    );
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
            let Some(generated_delta) = decode_vlq(bytes, &mut cursor) else {
                continue;
            };
            generated_column += generated_delta;
            let Some(source_delta) = decode_vlq(bytes, &mut cursor) else {
                continue;
            };
            let Some(line_delta) = decode_vlq(bytes, &mut cursor) else {
                continue;
            };
            let Some(column_delta) = decode_vlq(bytes, &mut cursor) else {
                continue;
            };
            source += source_delta;
            original_line += line_delta;
            original_column += column_delta;
            let decoded_name = if cursor < bytes.len() {
                name += decode_vlq(bytes, &mut cursor).unwrap_or(0);
                Some(name)
            } else {
                None
            };
            line.push(Segment {
                generated_column,
                source,
                original_line,
                original_column,
                name: decoded_name,
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
                        name: segment
                            .name
                            .or_else(|| traced.name.map(|name| name + i64::from(outer_name_count))),
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
pub fn pack_decoded_layer(words: &[u32], names: &[String], line_count: u32) -> Vec<u8> {
    let slab_len: usize = names.iter().map(|name| name.len()).sum();
    let padded_slab = slab_len.div_ceil(4) * 4;
    let header_words = 3 + names.len();
    let segments_offset = header_words + padded_slab / 4;
    let mut buffer = Vec::with_capacity((segments_offset + words.len()) * 4);
    buffer.extend_from_slice(&(names.len() as u32).to_le_bytes());
    buffer.extend_from_slice(&(segments_offset as u32).to_le_bytes());
    buffer.extend_from_slice(&line_count.to_le_bytes());
    for name in names {
        buffer.extend_from_slice(&(name.len() as u32).to_le_bytes());
    }
    for name in names {
        buffer.extend_from_slice(name.as_bytes());
    }
    buffer.resize(segments_offset * 4, 0);
    for word in words {
        buffer.extend_from_slice(&word.to_le_bytes());
    }
    buffer
}

/// Decoded map in flat form: one segment array plus per-line offsets, so unpacking
/// and composing whole phase layers costs one allocation each instead of one per
/// output line.
struct DecodedMap {
    segments: Vec<Segment>,
    /// `line_offsets[line]..line_offsets[line + 1]` is the segment range of `line`.
    line_offsets: Vec<u32>,
}

impl DecodedMap {
    fn line_count(&self) -> usize {
        self.line_offsets.len() - 1
    }
    fn line(&self, line: usize) -> Option<&[Segment]> {
        let start = *self.line_offsets.get(line)? as usize;
        let end = *self.line_offsets.get(line + 1)? as usize;
        self.segments.get(start..end)
    }
}

fn unpack_decoded_layer(data: &[u8]) -> Option<(DecodedMap, Vec<String>)> {
    if !data.len().is_multiple_of(4) || data.len() < 12 {
        return None;
    }
    let word = |index: usize| {
        data.get(index * 4..index * 4 + 4)
            .map(|bytes| u32::from_le_bytes(bytes.try_into().unwrap()))
    };
    let name_count = word(0)? as usize;
    let segments_offset = word(1)? as usize;
    let line_count = word(2)? as usize;
    let word_count = data.len() / 4;
    if segments_offset > word_count || !(word_count - segments_offset).is_multiple_of(5) {
        return None;
    }
    let mut names = Vec::with_capacity(name_count);
    let mut slab_cursor = (3 + name_count) * 4;
    for index in 0..name_count {
        let length = word(3 + index)? as usize;
        let name = data.get(slab_cursor..slab_cursor + length)?;
        names.push(std::str::from_utf8(name).ok()?.to_owned());
        slab_cursor += length;
    }
    if slab_cursor > segments_offset * 4 {
        return None;
    }
    let segment_count = (word_count - segments_offset) / 5;
    let mut segments = Vec::with_capacity(segment_count);
    let mut line_offsets = Vec::with_capacity(line_count + 2);
    line_offsets.push(0);
    for base in (segments_offset..word_count).step_by(5) {
        let line = word(base)? as usize;
        // Segments arrive in (line, column) order; fill offsets for empty lines.
        if line > line_count || line + 1 < line_offsets.len() {
            return None;
        }
        while line_offsets.len() <= line {
            line_offsets.push(segments.len() as u32);
        }
        let name = word(base + 4)?;
        segments.push(Segment {
            generated_column: i64::from(word(base + 1)?),
            source: 0,
            original_line: i64::from(word(base + 2)?),
            original_column: i64::from(word(base + 3)?),
            name: if name == 0 {
                None
            } else {
                Some(i64::from(name) - 1)
            },
        });
    }
    while line_offsets.len() <= line_count + 1 {
        line_offsets.push(segments.len() as u32);
    }
    Some((
        DecodedMap {
            segments,
            line_offsets,
        },
        names,
    ))
}

fn compose_decoded(outer: &DecodedMap, inner: &DecodedMap, outer_name_count: u32) -> DecodedMap {
    let mut segments = Vec::with_capacity(outer.segments.len());
    let mut line_offsets = Vec::with_capacity(outer.line_offsets.len());
    line_offsets.push(0);
    for line in 0..outer.line_count() {
        for segment in outer.line(line).unwrap_or_default() {
            let Some(inner_line) = inner.line(segment.original_line as usize) else {
                continue;
            };
            let traced_index = inner_line
                .partition_point(|inner| inner.generated_column <= segment.original_column);
            let Some(traced) = traced_index
                .checked_sub(1)
                .and_then(|index| inner_line.get(index))
            else {
                continue;
            };
            segments.push(Segment {
                generated_column: segment.generated_column,
                source: traced.source,
                original_line: traced.original_line,
                original_column: traced.original_column + segment.original_column
                    - traced.generated_column,
                name: segment
                    .name
                    .or_else(|| traced.name.map(|name| name + i64::from(outer_name_count))),
            });
        }
        line_offsets.push(segments.len() as u32);
    }
    DecodedMap {
        segments,
        line_offsets,
    }
}

fn encode_decoded(map: &DecodedMap) -> String {
    let mut output = String::with_capacity(map.segments.len() * 6 + map.line_count());
    let (mut prev_source, mut prev_line, mut prev_column, mut prev_name) = (0, 0, 0, 0);
    for line in 0..map.line_count() {
        if line > 0 {
            output.push(';');
        }
        let mut prev_generated = 0;
        for (index, segment) in map.line(line).unwrap_or_default().iter().enumerate() {
            if index > 0 {
                output.push(',');
            }
            vlq(segment.generated_column - prev_generated, &mut output);
            vlq(segment.source - prev_source, &mut output);
            vlq(segment.original_line - prev_line, &mut output);
            vlq(segment.original_column - prev_column, &mut output);
            if let Some(name) = segment.name {
                vlq(name - prev_name, &mut output);
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

/// Compose a chain of packed decoded phase layers, ordered from the earliest phase
/// (closest to the original source) to the latest, and encode the final map once.
pub fn compose_layer_chain(layers: &[&[u8]]) -> Option<(String, Vec<String>)> {
    let mut layers = layers.iter();
    let (mut map, mut names) = unpack_decoded_layer(layers.next()?)?;
    for layer in layers {
        let (outer, outer_names) = unpack_decoded_layer(layer)?;
        map = compose_decoded(&outer, &map, outer_names.len() as u32);
        let mut combined = outer_names;
        combined.extend(names);
        names = combined;
    }
    Some((encode_decoded(&map), names))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::editor::{EditCommand, EditKind, build};
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
                name: None,
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
