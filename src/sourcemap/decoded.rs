use super::{Segment, vlq};

pub(crate) fn pack_decoded_layer(words: &[u32], names: &[String], line_count: u32) -> Vec<u8> {
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
            vlq::encode(segment.generated_column - prev_generated, &mut output);
            vlq::encode(segment.source - prev_source, &mut output);
            vlq::encode(segment.original_line - prev_line, &mut output);
            vlq::encode(segment.original_column - prev_column, &mut output);
            if let Some(name) = segment.name {
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
