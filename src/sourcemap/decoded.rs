use std::rc::Rc;

use super::{Segment, vlq};

pub(crate) struct DecodedLayer {
    pub(crate) words: Vec<u32>,
    pub(crate) names: Vec<Rc<str>>,
    pub(crate) line_count: u32,
}

impl DecodedLayer {
    pub(crate) fn pack(&self) -> Vec<u8> {
        pack_decoded_layer(&self.words, &self.names, self.line_count)
    }
}

pub(crate) fn pack_decoded_layer<T: AsRef<str>>(
    words: &[u32],
    names: &[T],
    line_count: u32,
) -> Vec<u8> {
    let slab_len: usize = names.iter().map(|name| name.as_ref().len()).sum();
    let padded_slab = slab_len.div_ceil(4) * 4;
    let header_words = 3 + names.len();
    let segments_offset = header_words + padded_slab / 4;
    let mut buffer = Vec::with_capacity((segments_offset + words.len()) * 4);
    buffer.extend_from_slice(&(names.len() as u32).to_le_bytes());
    buffer.extend_from_slice(&(segments_offset as u32).to_le_bytes());
    buffer.extend_from_slice(&line_count.to_le_bytes());
    for name in names {
        buffer.extend_from_slice(&(name.as_ref().len() as u32).to_le_bytes());
    }
    for name in names {
        buffer.extend_from_slice(name.as_ref().as_bytes());
    }
    buffer.resize(segments_offset * 4, 0);
    for word in words {
        buffer.extend_from_slice(&word.to_le_bytes());
    }
    buffer
}

fn decoded_map_from_words(words: &[u32], line_count: u32) -> Option<DecodedMap> {
    if !words.len().is_multiple_of(5) {
        return None;
    }
    let mut segments = Vec::with_capacity(words.len() / 5);
    let mut line_offsets = Vec::with_capacity(line_count as usize + 2);
    line_offsets.push(0);
    for words in words.chunks_exact(5) {
        let line = words[0] as usize;
        if line > line_count as usize || line + 1 < line_offsets.len() {
            return None;
        }
        while line_offsets.len() <= line {
            line_offsets.push(segments.len() as u32);
        }
        segments.push(Segment {
            generated_column: words[1],
            source: 0,
            original_line: words[2],
            original_column: words[3],
            name: words[4],
        });
    }
    while line_offsets.len() <= line_count as usize + 1 {
        line_offsets.push(segments.len() as u32);
    }
    Some(DecodedMap {
        segments,
        line_offsets,
    })
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

fn unpack_decoded_layer(data: &[u8]) -> Option<(DecodedMap, Vec<Rc<str>>)> {
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
        names.push(Rc::from(std::str::from_utf8(name).ok()?));
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
            generated_column: word(base + 1)?,
            source: 0,
            original_line: word(base + 2)?,
            original_column: word(base + 3)?,
            name,
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

/// Return the generated byte offsets addressed by a packed layer. A later sparse
/// edit layer must retain these locations while copying its input, otherwise map
/// composition can only see that later layer's line boundaries and loses the
/// earlier layer's token-level precision.
pub(crate) fn generated_offsets(data: &[u8], source: &str) -> Option<Vec<usize>> {
    let (map, _) = unpack_decoded_layer(data)?;
    let mut line_starts = vec![0usize];
    line_starts.extend(
        source
            .bytes()
            .enumerate()
            .filter(|(_, byte)| *byte == b'\n')
            .map(|(index, _)| index + 1),
    );
    let mut offsets = Vec::with_capacity(map.segments.len());
    for line in 0..map.line_count() {
        let segments = map.line(line).unwrap_or_default();
        // A decoded layer can retain trailing empty generated lines after its
        // output is erased; only mapped lines need a corresponding source line.
        if segments.is_empty() {
            continue;
        }
        let line_start = *line_starts.get(line)?;
        let line_end = line_starts.get(line + 1).copied().unwrap_or(source.len());
        if source[line_start..line_end].is_ascii() {
            for segment in segments {
                let offset = line_start.checked_add(segment.generated_column as usize)?;
                (offset <= line_end).then_some(())?;
                offsets.push(offset);
            }
            continue;
        }
        let mut characters = source[line_start..line_end].char_indices().peekable();
        let mut column = 0usize;
        let mut relative = 0usize;
        for segment in segments {
            let target = segment.generated_column as usize;
            while column < target {
                let (index, character) = characters.next()?;
                relative = index + character.len_utf8();
                column += character.len_utf16();
            }
            (column == target).then_some(())?;
            offsets.push(line_start + relative);
        }
    }
    offsets.sort_unstable();
    offsets.dedup();
    Some(offsets)
}

fn compose_decoded(outer: &DecodedMap, inner: &DecodedMap, outer_name_count: u32) -> DecodedMap {
    let mut segments = Vec::with_capacity(outer.segments.len());
    let mut line_offsets = Vec::with_capacity(outer.line_offsets.len());
    line_offsets.push(0);
    for line in 0..outer.line_count() {
        for segment in outer.line(line).unwrap_or_default() {
            if segment.original_line == u32::MAX {
                segments.push(*segment);
                continue;
            }
            let Some(inner_line) = inner.line(segment.original_line as usize) else {
                continue;
            };
            let traced_index = inner_line
                .partition_point(|inner| inner.generated_column <= segment.original_column);
            // Ordinarily the segment at or before the column carries the answer,
            // and the distance to it carries over. A layer printed by codegen
            // has no segment at the start of a line, though — its first is the
            // first token, past the indentation — so a segment addressing that
            // gap has nothing before it. Clamping forward to the line's first
            // segment costs the column offset; dropping it, which is what used
            // to happen, costs the line every mapping it had.
            let (traced, clamped_forward) = match traced_index
                .checked_sub(1)
                .and_then(|index| inner_line.get(index))
            {
                Some(traced) => (traced, false),
                None => match inner_line.first() {
                    Some(traced) => (traced, true),
                    None => continue,
                },
            };
            if traced.original_line == u32::MAX {
                segments.push(Segment {
                    generated_column: segment.generated_column,
                    source: 0,
                    original_line: u32::MAX,
                    original_column: u32::MAX,
                    name: 0,
                });
                continue;
            }
            let original_column = if clamped_forward {
                traced.original_column
            } else {
                traced.original_column + segment.original_column - traced.generated_column
            };
            segments.push(Segment {
                generated_column: segment.generated_column,
                source: traced.source,
                original_line: traced.original_line,
                original_column,
                name: if segment.name != 0 {
                    segment.name
                } else if traced.name != 0 {
                    traced.name + outer_name_count
                } else {
                    0
                },
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
            vlq::encode(
                i64::from(segment.generated_column) - i64::from(prev_generated),
                &mut output,
            );
            if segment.original_line == u32::MAX {
                prev_generated = segment.generated_column;
                continue;
            }
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

/// Compose a chain of packed decoded phase layers, ordered from the earliest phase
/// (closest to the original source) to the latest, and encode the final map once.
pub(crate) fn compose_layer_chain(layers: &[&[u8]]) -> Option<(String, Vec<String>)> {
    let mut layers = layers.iter();
    let (mut map, names) = unpack_decoded_layer(layers.next()?)?;
    let mut name_layers = vec![names];
    for layer in layers {
        let (outer, outer_names) = unpack_decoded_layer(layer)?;
        map = compose_decoded(&outer, &map, outer_names.len() as u32);
        name_layers.push(outer_names);
    }
    Some((
        encode_decoded(&map),
        name_layers
            .into_iter()
            .rev()
            .flatten()
            .map(|name| name.as_ref().to_owned())
            .collect(),
    ))
}

/// Compose layers that have not crossed N-API, avoiding pack/unpack at every
/// rewrite boundary and assembling the cumulative name table only once.
pub(crate) fn compose_decoded_layers(layers: &[DecodedLayer]) -> Option<Vec<u8>> {
    let first = layers.first()?;
    let mut map = decoded_map_from_words(&first.words, first.line_count)?;
    for layer in &layers[1..] {
        let outer = decoded_map_from_words(&layer.words, layer.line_count)?;
        map = compose_decoded(&outer, &map, layer.names.len() as u32);
    }
    let names: Vec<&str> = layers
        .iter()
        .rev()
        .flat_map(|layer| layer.names.iter().map(AsRef::as_ref))
        .collect();
    let mut words = Vec::with_capacity(map.segments.len() * 5);
    for line in 0..map.line_count() {
        for segment in map.line(line).unwrap_or_default() {
            words.extend_from_slice(&[
                line as u32,
                segment.generated_column,
                segment.original_line,
                segment.original_column,
                segment.name,
            ]);
        }
    }
    Some(pack_decoded_layer(&words, &names, map.line_count() as u32))
}
