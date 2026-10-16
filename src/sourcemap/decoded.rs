use std::rc::Rc;

use super::{ANCHOR_TAIL, IDENTITY_TAIL, NAME_MASK, vlq};

const MAX_ENCODED_MAPPINGS_BYTES: usize = 256 * 1024 * 1024;
const MAX_RESIDENT_MAPPING_BYTES: usize = 256 * 1024 * 1024;
/// Smallest and largest step a bounded vector grows by, in elements.
const MAPPING_GROWTH_MIN: usize = 64;
const MAPPING_GROWTH_CHUNK: usize = 4 * 1024;
const _: () = assert!(MAPPING_GROWTH_MIN <= MAPPING_GROWTH_CHUNK);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum DecodedMapError {
    /// The layer's structure is malformed: a valid producer cannot emit it.
    Invalid,
    /// Decoding or composing the mappings would exceed the resident mapping budget.
    ResidentLimit,
    /// The final encoded `mappings` string would exceed its output budget.
    EncodedLimit,
}

/// Resident mapping-storage budget for the maps live at one moment, charged against
/// allocated capacity rather than element count so vector growth cannot outrun the
/// policy. Decoding and composition share it, so a layer that arrives at the boundary
/// is bounded by the same rule as one composition produces, and a phase chain is
/// bounded by what it holds rather than by how many phases it folds.
struct MappingBudget {
    remaining: usize,
}

impl MappingBudget {
    fn new() -> Self {
        Self {
            remaining: resident_mapping_bytes(),
        }
    }

    /// Charge `additional` elements and reserve them in one exact allocation, for the
    /// counts that are known before decoding starts.
    fn reserve_exact<T>(
        &mut self,
        vector: &mut Vec<T>,
        additional: usize,
    ) -> Result<(), DecodedMapError> {
        let element = size_of::<T>().max(1);
        if additional.saturating_mul(element) > self.remaining {
            return Err(DecodedMapError::ResidentLimit);
        }
        self.charge(vector, |vector| vector.try_reserve_exact(additional))
    }

    /// Make room for one more element. Capacity doubles up to a ceiling, so a small
    /// map does not pay for a large chunk and a large one does not copy repeatedly.
    fn reserve<T>(&mut self, vector: &mut Vec<T>) -> Result<(), DecodedMapError> {
        if vector.len() < vector.capacity() {
            return Ok(());
        }
        let element = size_of::<T>().max(1);
        let wanted = vector
            .capacity()
            .clamp(MAPPING_GROWTH_MIN, MAPPING_GROWTH_CHUNK)
            .min(self.remaining / element);
        if wanted == 0 {
            return Err(DecodedMapError::ResidentLimit);
        }
        self.charge(vector, |vector| vector.try_reserve_exact(wanted))
    }

    fn charge<T>(
        &mut self,
        vector: &mut Vec<T>,
        reserve: impl FnOnce(&mut Vec<T>) -> Result<(), std::collections::TryReserveError>,
    ) -> Result<(), DecodedMapError> {
        let before = vector.capacity();
        reserve(vector).map_err(|_| DecodedMapError::ResidentLimit)?;
        self.remaining = self
            .remaining
            .checked_sub((vector.capacity() - before) * size_of::<T>().max(1))
            .ok_or(DecodedMapError::ResidentLimit)?;
        Ok(())
    }

    fn push<T>(&mut self, vector: &mut Vec<T>, value: T) -> Result<(), DecodedMapError> {
        self.reserve(vector)?;
        vector.push(value);
        Ok(())
    }

    /// Return the storage a map held once it is dropped, so folding a long chain is
    /// bounded by the maps alive at once rather than by their sum.
    fn refund(&mut self, map: &DecodedMap) {
        self.remaining = self.remaining.saturating_add(map.charged_bytes());
    }

    /// Reject a layer whose declared segment count cannot fit the budget before any
    /// of it is decoded, so an oversized input is not walked at all.
    fn admits_segments(&self, count: usize) -> bool {
        count.saturating_mul(size_of::<MappingPoint>() + size_of::<MappedLine>()) <= self.remaining
    }
}

#[cfg(test)]
thread_local! {
    static TEST_RESIDENT_BYTES: std::cell::Cell<Option<usize>> =
        const { std::cell::Cell::new(None) };
}

fn resident_mapping_bytes() -> usize {
    #[cfg(test)]
    if let Some(bytes) = TEST_RESIDENT_BYTES.with(std::cell::Cell::get) {
        return bytes;
    }
    MAX_RESIDENT_MAPPING_BYTES
}

/// Scope a smaller resident budget, so tests can reach the limit without allocating
/// hundreds of megabytes.
#[cfg(test)]
pub(crate) struct ResidentBudgetOverride;

#[cfg(test)]
impl ResidentBudgetOverride {
    pub(crate) fn bytes(bytes: usize) -> Self {
        TEST_RESIDENT_BYTES.with(|cell| cell.set(Some(bytes)));
        Self
    }
}

#[cfg(test)]
impl Drop for ResidentBudgetOverride {
    fn drop(&mut self) {
        TEST_RESIDENT_BYTES.with(|cell| cell.set(None));
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum MappingBehavior {
    Boundary,
    Identity,
    Anchor,
    Unmapped,
}

#[derive(Debug, Clone, Copy)]
struct MappingPoint {
    source: u32,
    generated_column: u32,
    original_line: u32,
    original_column: u32,
    name: u32,
    behavior: MappingBehavior,
}

impl MappingPoint {
    fn unmapped(generated_column: u32) -> Self {
        Self {
            source: 0,
            generated_column,
            original_line: u32::MAX,
            original_column: u32::MAX,
            name: 0,
            behavior: MappingBehavior::Unmapped,
        }
    }

    fn is_unmapped(&self) -> bool {
        self.behavior == MappingBehavior::Unmapped
    }
}

fn unpack_behavior(original_line: u32, packed_name: u32) -> MappingBehavior {
    if original_line == u32::MAX {
        MappingBehavior::Unmapped
    } else if packed_name & ANCHOR_TAIL != 0 {
        MappingBehavior::Anchor
    } else if packed_name & IDENTITY_TAIL != 0 {
        MappingBehavior::Identity
    } else {
        MappingBehavior::Boundary
    }
}

fn pack_name(point: &MappingPoint) -> u32 {
    debug_assert_eq!(point.is_unmapped(), point.original_line == u32::MAX);
    point.name
        | match point.behavior {
            MappingBehavior::Anchor => ANCHOR_TAIL,
            MappingBehavior::Identity => IDENTITY_TAIL,
            MappingBehavior::Boundary | MappingBehavior::Unmapped => 0,
        }
}

pub(crate) struct DecodedLayer {
    pub(crate) words: Vec<u32>,
    pub(crate) names: Vec<Rc<str>>,
    pub(crate) last_generated_line: u32,
}

impl DecodedLayer {
    pub(crate) fn pack(&self) -> Vec<u8> {
        pack_decoded_layer(&self.words, &self.names, self.last_generated_line)
    }
}

pub(crate) fn pack_decoded_layer<T: AsRef<str>>(
    words: &[u32],
    names: &[T],
    last_generated_line: u32,
) -> Vec<u8> {
    let slab_len: usize = names.iter().map(|name| name.as_ref().len()).sum();
    let padded_slab = slab_len.div_ceil(4) * 4;
    let header_words = 3 + names.len();
    let segments_offset = header_words + padded_slab / 4;
    let mut buffer = Vec::with_capacity((segments_offset + words.len()) * 4);
    buffer.extend_from_slice(&(names.len() as u32).to_le_bytes());
    buffer.extend_from_slice(&(segments_offset as u32).to_le_bytes());
    buffer.extend_from_slice(&last_generated_line.to_le_bytes());
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

fn decoded_map_from_words(
    words: &[u32],
    last_generated_line: u32,
    budget: &mut MappingBudget,
) -> Result<DecodedMap, DecodedMapError> {
    if !words.len().is_multiple_of(5) {
        return Err(DecodedMapError::Invalid);
    }
    let mut segments = Vec::new();
    let mut lines = Vec::new();
    budget.reserve_exact(&mut segments, words.len() / 5)?;
    let mut previous_position = None;
    for words in words.chunks_exact(5) {
        let line = words[0] as usize;
        if line > last_generated_line as usize
            || previous_position.is_some_and(|(previous_line, _)| line < previous_line)
        {
            return Err(DecodedMapError::Invalid);
        }
        let generated_column = words[1];
        if previous_position.is_some_and(|(previous_line, previous_column)| {
            line == previous_line && generated_column < previous_column
        }) {
            return Err(DecodedMapError::Invalid);
        }
        if previous_position.is_none_or(|(previous_line, _)| line != previous_line) {
            budget.push(
                &mut lines,
                MappedLine {
                    generated_line: line as u32,
                    segment_start: segments.len() as u32,
                },
            )?;
        }
        previous_position = Some((line, generated_column));
        let original_line = words[2];
        let packed_name = words[4];
        let behavior = unpack_behavior(original_line, packed_name);
        budget.push(
            &mut segments,
            MappingPoint {
                source: 0,
                generated_column,
                original_line,
                original_column: words[3],
                name: if behavior == MappingBehavior::Unmapped {
                    0
                } else {
                    packed_name & NAME_MASK
                },
                behavior,
            },
        )?;
    }
    Ok(DecodedMap {
        segments,
        lines,
        last_generated_line,
    })
}

/// Decoded map in flat form: one segment array plus a sparse index of mapped
/// lines, so empty generated lines do not consume resident memory.
#[cfg_attr(test, derive(Clone))]
struct DecodedMap {
    segments: Vec<MappingPoint>,
    /// Only generated lines containing segments are indexed. Empty lines are
    /// represented by gaps and `last_generated_line` retains the output extent.
    lines: Vec<MappedLine>,
    last_generated_line: u32,
}

#[derive(Debug, Clone, Copy)]
struct MappedLine {
    generated_line: u32,
    segment_start: u32,
}

fn offset_name_ids(map: &mut DecodedMap, offset: u32) {
    if offset == 0 {
        return;
    }
    for segment in &mut map.segments {
        if segment.name != 0 {
            segment.name += offset;
        }
    }
}

fn suffix_name_bases(counts: &[usize]) -> Option<Vec<u32>> {
    let mut bases = vec![0; counts.len()];
    let mut suffix = 0u32;
    for (index, count) in counts.iter().enumerate().rev() {
        bases[index] = suffix;
        suffix = suffix.checked_add(u32::try_from(*count).ok()?)?;
    }
    Some(bases)
}

fn packed_counts(data: &[u8]) -> Option<(usize, usize)> {
    if !data.len().is_multiple_of(4) || data.len() < 12 {
        return None;
    }
    let name_count = u32::from_le_bytes(data[0..4].try_into().ok()?) as usize;
    let segments_offset = u32::from_le_bytes(data[4..8].try_into().ok()?) as usize;
    let word_count = data.len() / 4;
    let segment_words = word_count.checked_sub(segments_offset)?;
    (3usize.checked_add(name_count)? <= segments_offset && segment_words.is_multiple_of(5))
        .then_some((name_count, segment_words / 5))
}

impl DecodedMap {
    /// Mapping storage this map holds, for returning it to the budget once dropped.
    fn charged_bytes(&self) -> usize {
        self.segments.capacity() * size_of::<MappingPoint>()
            + self.lines.capacity() * size_of::<MappedLine>()
    }

    #[cfg(test)]
    fn line(&self, line: u32) -> Option<&[MappingPoint]> {
        let index = self
            .lines
            .binary_search_by_key(&line, |entry| entry.generated_line)
            .ok()?;
        self.line_at(index)
    }

    fn line_at(&self, index: usize) -> Option<&[MappingPoint]> {
        let start = self.lines.get(index)?.segment_start as usize;
        let end = self
            .lines
            .get(index + 1)
            .map_or(self.segments.len(), |entry| entry.segment_start as usize);
        self.segments.get(start..end)
    }
}

#[derive(Default)]
struct LineLookup {
    index: usize,
    previous_line: Option<u32>,
}

impl LineLookup {
    fn line<'a>(&mut self, map: &'a DecodedMap, generated_line: u32) -> Option<&'a [MappingPoint]> {
        if self
            .previous_line
            .is_some_and(|previous| generated_line < previous)
        {
            self.index = map
                .lines
                .binary_search_by_key(&generated_line, |entry| entry.generated_line)
                .unwrap_or_else(|index| index);
        } else {
            while map
                .lines
                .get(self.index)
                .is_some_and(|entry| entry.generated_line < generated_line)
            {
                self.index += 1;
            }
        }
        self.previous_line = Some(generated_line);
        map.lines
            .get(self.index)
            .filter(|entry| entry.generated_line == generated_line)?;
        map.line_at(self.index)
    }
}

/// Validate the header and read the name table. Every allocation here is bounded by
/// the supplied buffer: the name count has to fit inside the declared header, and
/// each name's bytes come out of the buffer itself.
fn unpack_decoded_header(data: &[u8]) -> Option<(usize, u32, Vec<Rc<str>>)> {
    if !data.len().is_multiple_of(4) || data.len() < 12 {
        return None;
    }
    let word = |index: usize| {
        data.get(index * 4..index * 4 + 4)
            .map(|bytes| u32::from_le_bytes(bytes.try_into().unwrap()))
    };
    let name_count = word(0)? as usize;
    let segments_offset = word(1)? as usize;
    let last_generated_line = word(2)?;
    let word_count = data.len() / 4;
    let header_words = 3usize.checked_add(name_count)?;
    if header_words > segments_offset
        || segments_offset > word_count
        || !(word_count - segments_offset).is_multiple_of(5)
    {
        return None;
    }
    let mut names = Vec::with_capacity(name_count);
    let mut slab_cursor = header_words.checked_mul(4)?;
    for index in 0..name_count {
        let length = word(3 + index)? as usize;
        let name_end = slab_cursor.checked_add(length)?;
        let name = data.get(slab_cursor..name_end)?;
        names.push(Rc::from(std::str::from_utf8(name).ok()?));
        slab_cursor = name_end;
    }
    if slab_cursor > segments_offset * 4 {
        return None;
    }
    Some((segments_offset, last_generated_line, names))
}

fn unpack_decoded_layer(
    data: &[u8],
    budget: &mut MappingBudget,
) -> Result<(DecodedMap, Vec<Rc<str>>), DecodedMapError> {
    let (segments_offset, last_generated_line, names) =
        unpack_decoded_header(data).ok_or(DecodedMapError::Invalid)?;
    // The header proved this slice exists and divides into whole segments.
    let segment_bytes = &data[segments_offset * 4..];
    let mut segments = Vec::new();
    let mut lines = Vec::new();
    budget.reserve_exact(&mut segments, segment_bytes.len() / 20)?;
    let mut previous_position = None;
    for segment in segment_bytes.chunks_exact(20) {
        let word = |index: usize| {
            u32::from_le_bytes(segment[index * 4..index * 4 + 4].try_into().unwrap())
        };
        let line = word(0);
        // Segments arrive in (line, column) order; only mapped lines are indexed.
        if line > last_generated_line
            || previous_position.is_some_and(|(previous_line, _)| line < previous_line)
        {
            return Err(DecodedMapError::Invalid);
        }
        let generated_column = word(1);
        if previous_position.is_some_and(|(previous_line, previous_column)| {
            line == previous_line && generated_column < previous_column
        }) {
            return Err(DecodedMapError::Invalid);
        }
        if previous_position.is_none_or(|(previous_line, _)| line != previous_line) {
            budget.push(
                &mut lines,
                MappedLine {
                    generated_line: line,
                    segment_start: segments.len() as u32,
                },
            )?;
        }
        previous_position = Some((line, generated_column));
        let original_line = word(2);
        let packed_name = word(4);
        if packed_name & NAME_MASK > names.len() as u32 {
            return Err(DecodedMapError::Invalid);
        }
        let behavior = unpack_behavior(original_line, packed_name);
        budget.push(
            &mut segments,
            MappingPoint {
                source: 0,
                generated_column,
                original_line,
                original_column: word(3),
                name: if behavior == MappingBehavior::Unmapped {
                    0
                } else {
                    packed_name & NAME_MASK
                },
                behavior,
            },
        )?;
    }
    Ok((
        DecodedMap {
            segments,
            lines,
            last_generated_line,
        },
        names,
    ))
}

fn trace_segment(
    segment: &MappingPoint,
    inner: &DecodedMap,
    line_lookup: &mut LineLookup,
    serialized_input: bool,
) -> Option<MappingPoint> {
    if segment.is_unmapped() {
        return Some(*segment);
    }
    let inner_line = line_lookup.line(inner, segment.original_line)?;
    let traced_index =
        inner_line.partition_point(|inner| inner.generated_column <= segment.original_column);
    trace_segment_in_line(segment, inner_line, traced_index, serialized_input)
}

fn trace_segment_in_line(
    segment: &MappingPoint,
    inner_line: &[MappingPoint],
    traced_index: usize,
    serialized_input: bool,
) -> Option<MappingPoint> {
    // Serialized maps use greatest-lower-bound lookup: a leading gap is unmapped.
    if serialized_input && traced_index == 0 {
        return None;
    }
    // Code generators can omit a segment at column zero. Preserve mappings in
    // that leading gap by clamping to the line's first mapping without applying
    // the gap as an original-column delta.
    let (traced, clamped_forward) = match traced_index
        .checked_sub(1)
        .and_then(|index| inner_line.get(index))
    {
        Some(traced) => (traced, false),
        None => (inner_line.first()?, true),
    };
    if traced.is_unmapped() {
        return Some(MappingPoint::unmapped(segment.generated_column));
    }
    let delta = segment
        .original_column
        .saturating_sub(traced.generated_column);
    let bounded_by_next = inner_line.get(traced_index).is_some_and(|next| {
        next.source == traced.source
            && next.original_line == traced.original_line
            && next.original_column >= traced.original_column
            && delta <= next.original_column - traced.original_column
    });
    let anchor_tail = traced.behavior == MappingBehavior::Anchor;
    let identity_tail = !anchor_tail
        && (traced.behavior == MappingBehavior::Identity
            || (inner_line.get(traced_index).is_none()
                && traced.generated_column == traced.original_column));
    let interpolates = !clamped_forward && !anchor_tail && (bounded_by_next || identity_tail);
    let original_column = if interpolates {
        traced.original_column.saturating_add(delta)
    } else {
        traced.original_column
    };
    let behavior = if segment.behavior == MappingBehavior::Anchor || anchor_tail || !interpolates {
        MappingBehavior::Anchor
    } else if segment.behavior == MappingBehavior::Identity && identity_tail {
        MappingBehavior::Identity
    } else {
        MappingBehavior::Boundary
    };
    Some(MappingPoint {
        source: traced.source,
        generated_column: segment.generated_column,
        original_line: traced.original_line,
        original_column,
        name: if serialized_input && traced.name != 0 {
            traced.name
        } else if segment.name != 0 {
            segment.name
        } else if traced.name != 0 {
            traced.name
        } else {
            0
        },
        behavior,
    })
}

/// Record one traced outer segment. An outer segment whose input line carries no
/// mapping at all is unmapped, not absent: dropping it would leave the preceding
/// mapping on the same generated line interpolating across it.
fn push_traced_segment(
    budget: &mut MappingBudget,
    segments: &mut Vec<MappingPoint>,
    line_start: usize,
    generated_column: u32,
    traced: Option<MappingPoint>,
) -> Result<(), DecodedMapError> {
    match traced {
        Some(point) => budget.push(segments, point),
        None if segments.len() > line_start => {
            budget.push(segments, MappingPoint::unmapped(generated_column))
        }
        None => Ok(()),
    }
}

/// Project boundaries from `inner` through identity spans in `outer`. This is the
/// mapping-span composition step: copied ranges are affine mappings, so every change
/// in the inner mapping behavior remains observable without first splitting and
/// re-rendering the copied source in the later phase.
fn compose_decoded(
    outer: &DecodedMap,
    inner: &DecodedMap,
    budget: &mut MappingBudget,
) -> Result<DecodedMap, DecodedMapError> {
    compose_decoded_with_policy(outer, inner, budget, false)
}

fn compose_decoded_with_policy(
    outer: &DecodedMap,
    inner: &DecodedMap,
    budget: &mut MappingBudget,
    serialized_input: bool,
) -> Result<DecodedMap, DecodedMapError> {
    let mut segments = Vec::new();
    let mut lines = Vec::new();
    // Composition usually keeps at least the outer layer's segments, so start from
    // that and let the bounded growth take over.
    budget.reserve_exact(
        &mut segments,
        outer.segments.len().min(MAPPING_GROWTH_CHUNK),
    )?;
    budget.reserve_exact(&mut lines, outer.lines.len().min(MAPPING_GROWTH_CHUNK))?;
    let mut line_lookup = LineLookup::default();
    for (line_index, outer_entry) in outer.lines.iter().enumerate() {
        let outer_line = outer.line_at(line_index).unwrap_or_default();
        let line_start = segments.len();
        for (index, segment) in outer_line.iter().enumerate() {
            if segment.behavior != MappingBehavior::Identity {
                let traced = trace_segment(segment, inner, &mut line_lookup, serialized_input);
                push_traced_segment(
                    budget,
                    &mut segments,
                    line_start,
                    segment.generated_column,
                    traced,
                )?;
                continue;
            }
            let Some(inner_line) = line_lookup.line(inner, segment.original_line) else {
                push_traced_segment(
                    budget,
                    &mut segments,
                    line_start,
                    segment.generated_column,
                    None,
                )?;
                continue;
            };
            let first = inner_line
                .partition_point(|inner| inner.generated_column <= segment.original_column);
            push_traced_segment(
                budget,
                &mut segments,
                line_start,
                segment.generated_column,
                trace_segment_in_line(segment, inner_line, first, serialized_input),
            )?;
            let input_end = outer_line.get(index + 1).map(|next| {
                segment.original_column.saturating_add(
                    next.generated_column
                        .saturating_sub(segment.generated_column),
                )
            });
            for boundary in &inner_line[first..] {
                if input_end.is_some_and(|end| boundary.generated_column >= end) {
                    break;
                }
                let generated_column = segment.generated_column.saturating_add(
                    boundary
                        .generated_column
                        .saturating_sub(segment.original_column),
                );
                budget.push(
                    &mut segments,
                    MappingPoint {
                        source: boundary.source,
                        generated_column,
                        original_line: boundary.original_line,
                        original_column: boundary.original_column,
                        name: if boundary.is_unmapped() {
                            0
                        } else if boundary.name != 0 {
                            boundary.name
                        } else if serialized_input {
                            segment.name
                        } else {
                            0
                        },
                        behavior: boundary.behavior,
                    },
                )?;
            }
        }
        if segments.len() != line_start {
            budget.push(
                &mut lines,
                MappedLine {
                    generated_line: outer_entry.generated_line,
                    segment_start: line_start as u32,
                },
            )?;
        }
    }
    Ok(DecodedMap {
        segments,
        lines,
        last_generated_line: outer.last_generated_line,
    })
}

fn reserve_encoded(output: &mut String, additional: usize) -> Result<(), DecodedMapError> {
    let final_len = output
        .len()
        .checked_add(additional)
        .ok_or(DecodedMapError::EncodedLimit)?;
    if final_len > MAX_ENCODED_MAPPINGS_BYTES {
        return Err(DecodedMapError::EncodedLimit);
    }
    let available = output.capacity() - output.len();
    if available < additional {
        output
            .try_reserve_exact(additional - available)
            .map_err(|_| DecodedMapError::EncodedLimit)?;
    }
    Ok(())
}

fn encode_decoded(map: &DecodedMap) -> Result<String, DecodedMapError> {
    let mut output = String::new();
    let (mut prev_source, mut prev_line, mut prev_column, mut prev_name) = (0, 0, 0, 0);
    let mut current_generated_line = 0u32;
    for (line_index, entry) in map.lines.iter().enumerate() {
        let empty_lines = entry.generated_line.saturating_sub(current_generated_line) as usize;
        reserve_encoded(&mut output, empty_lines)?;
        output.extend(std::iter::repeat_n(';', empty_lines));
        let mut prev_generated = 0;
        for (index, segment) in map
            .line_at(line_index)
            .unwrap_or_default()
            .iter()
            .enumerate()
        {
            let generated_delta = i64::from(segment.generated_column) - i64::from(prev_generated);
            let mut segment_len = usize::from(index > 0) + vlq::encoded_len(generated_delta);
            let source_delta = i64::from(segment.source) - i64::from(prev_source);
            let original_line_delta = i64::from(segment.original_line) - i64::from(prev_line);
            let original_column_delta = i64::from(segment.original_column) - i64::from(prev_column);
            let name = (segment.name != 0).then(|| i64::from(segment.name - 1));
            if !segment.is_unmapped() {
                segment_len += if source_delta == 0 {
                    1
                } else {
                    vlq::encoded_len(source_delta)
                } + vlq::encoded_len(original_line_delta)
                    + vlq::encoded_len(original_column_delta)
                    + name.map_or(0, |name| vlq::encoded_len(name - prev_name));
            }
            reserve_encoded(&mut output, segment_len)?;
            if index > 0 {
                output.push(',');
            }
            vlq::encode(generated_delta, &mut output);
            if segment.is_unmapped() {
                prev_generated = segment.generated_column;
                continue;
            }
            if source_delta == 0 {
                output.push('A');
            } else {
                vlq::encode(source_delta, &mut output);
            }
            vlq::encode(original_line_delta, &mut output);
            vlq::encode(original_column_delta, &mut output);
            if let Some(name) = name {
                vlq::encode(name - prev_name, &mut output);
                prev_name = name;
            }
            prev_generated = segment.generated_column;
            prev_source = segment.source;
            prev_line = segment.original_line;
            prev_column = segment.original_column;
        }
        current_generated_line = entry.generated_line;
    }
    let trailing_lines = map
        .last_generated_line
        .saturating_sub(current_generated_line) as usize;
    reserve_encoded(&mut output, trailing_lines)?;
    output.extend(std::iter::repeat_n(';', trailing_lines));
    Ok(output)
}

/// Compose a chain of packed decoded phase layers, ordered from the earliest phase
/// (closest to the original source) to the latest, and encode the final map once.
pub(crate) fn compose_layer_chain(
    layers: &[&[u8]],
) -> Result<(String, Vec<String>), DecodedMapError> {
    compose_layer_chain_with_input(layers, None)
}

/// Fold serialized input while copied spans still retain their affine provenance.
/// Input maps can reference multiple sources; resident edit layers reference one.
/// Explicit edit labels win within the resident chain, whereas input symbol names
/// trace back to the original symbol when crossing the serialized boundary.
pub(crate) fn compose_layer_chain_with_input(
    layers: &[&[u8]],
    input: Option<(&str, &[String])>,
) -> Result<(String, Vec<String>), DecodedMapError> {
    let mut budget = MappingBudget::new();
    let mut name_counts = Vec::with_capacity(layers.len());
    for layer in layers {
        let (name_count, segment_count) = packed_counts(layer).ok_or(DecodedMapError::Invalid)?;
        // Reject an oversized layer from its header, before any of it is walked.
        if !budget.admits_segments(segment_count) {
            return Err(DecodedMapError::ResidentLimit);
        }
        name_counts.push(name_count);
    }
    let name_bases = suffix_name_bases(&name_counts).ok_or(DecodedMapError::Invalid)?;
    let mut name_layers = Vec::with_capacity(layers.len());
    let mut composed = None;
    for ((layer, expected_name_count), name_base) in layers.iter().zip(name_counts).zip(name_bases)
    {
        let (mut map, names) = unpack_decoded_layer(layer, &mut budget)?;
        if names.len() != expected_name_count {
            return Err(DecodedMapError::Invalid);
        }
        offset_name_ids(&mut map, name_base);
        name_layers.push(names);
        composed = Some(match composed {
            Some(inner) => {
                let next = compose_decoded(&map, &inner, &mut budget)?;
                // `inner` and `map` are both dropped here, so their storage returns.
                budget.refund(&inner);
                budget.refund(&map);
                next
            }
            None => map,
        });
    }
    let mut map = composed.ok_or(DecodedMapError::Invalid)?;
    // Charge both the returned string table and its owned text before cloning.
    let name_count = name_layers.iter().map(Vec::len).sum();
    let name_bytes = name_layers
        .iter()
        .flatten()
        .try_fold(0usize, |bytes, name| bytes.checked_add(name.len()))
        .ok_or(DecodedMapError::ResidentLimit)?;
    let mut names = Vec::new();
    budget.reserve_exact(&mut names, name_count)?;
    budget.remaining = budget
        .remaining
        .checked_sub(name_bytes)
        .ok_or(DecodedMapError::ResidentLimit)?;
    names.extend(
        name_layers
            .into_iter()
            .rev()
            .flatten()
            .map(|name| name.as_ref().to_owned()),
    );
    if let Some((mappings, input_names)) = input {
        let mut inner = DecodedMap {
            segments: Vec::new(),
            lines: Vec::new(),
            last_generated_line: 0,
        };
        super::visit_decoded(mappings, |generated_line, segment| {
            inner.last_generated_line = generated_line;
            if inner
                .lines
                .last()
                .is_none_or(|line| line.generated_line != generated_line)
            {
                budget.push(
                    &mut inner.lines,
                    MappedLine {
                        generated_line,
                        segment_start: inner.segments.len() as u32,
                    },
                )?;
            }
            budget.push(
                &mut inner.segments,
                MappingPoint {
                    source: segment.source,
                    generated_column: segment.generated_column,
                    original_line: segment.original_line,
                    original_column: segment.original_column,
                    name: if segment.name == 0 {
                        0
                    } else {
                        if segment.name as usize > input_names.len() {
                            return Err(DecodedMapError::Invalid);
                        }
                        segment
                            .name
                            .checked_add(
                                u32::try_from(names.len()).map_err(|_| DecodedMapError::Invalid)?,
                            )
                            .ok_or(DecodedMapError::Invalid)?
                    },
                    behavior: if segment.original_line == u32::MAX {
                        MappingBehavior::Unmapped
                    } else {
                        MappingBehavior::Boundary
                    },
                },
            )
        })?;
        let next = compose_decoded_with_policy(&map, &inner, &mut budget, true)?;
        budget.refund(&map);
        budget.refund(&inner);
        map = next;
        drop(inner);
        let name_bytes = input_names
            .iter()
            .try_fold(0usize, |bytes, name| bytes.checked_add(name.len()))
            .ok_or(DecodedMapError::ResidentLimit)?;
        budget.reserve_exact(&mut names, input_names.len())?;
        if name_bytes > budget.remaining {
            return Err(DecodedMapError::ResidentLimit);
        }
        names.extend_from_slice(input_names);
    }
    Ok((encode_decoded(&map)?, names))
}

/// Compose layers that have not crossed N-API, avoiding pack/unpack at every
/// rewrite boundary and assembling the cumulative name table only once.
pub(crate) fn compose_decoded_layers(layers: &[DecodedLayer]) -> Result<Vec<u8>, DecodedMapError> {
    let mut budget = MappingBudget::new();
    let name_counts: Vec<usize> = layers.iter().map(|layer| layer.names.len()).collect();
    if layers
        .iter()
        .any(|layer| !budget.admits_segments(layer.words.len() / 5))
    {
        return Err(DecodedMapError::ResidentLimit);
    }
    let name_bases = suffix_name_bases(&name_counts).ok_or(DecodedMapError::Invalid)?;
    let mut composed = None;
    for (layer, name_base) in layers.iter().zip(name_bases) {
        let mut map = decoded_map_from_words(&layer.words, layer.last_generated_line, &mut budget)?;
        offset_name_ids(&mut map, name_base);
        composed = Some(match composed {
            Some(inner) => {
                let next = compose_decoded(&map, &inner, &mut budget)?;
                budget.refund(&inner);
                budget.refund(&map);
                next
            }
            None => map,
        });
    }
    let map = composed.ok_or(DecodedMapError::Invalid)?;
    let names: Vec<&str> = layers
        .iter()
        .rev()
        .flat_map(|layer| layer.names.iter().map(AsRef::as_ref))
        .collect();
    let mut words = Vec::with_capacity(map.segments.len() * 5);
    for (line_index, entry) in map.lines.iter().enumerate() {
        for segment in map.line_at(line_index).unwrap_or_default() {
            words.extend_from_slice(&[
                entry.generated_line,
                segment.generated_column,
                segment.original_line,
                segment.original_column,
                pack_name(segment),
            ]);
        }
    }
    Ok(pack_decoded_layer(&words, &names, map.last_generated_line))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serialized_input_preserves_sources_names_and_unmapped_boundaries() {
        use super::super::{MapBuilder, Segment, decode};
        let input = MapBuilder {
            lines: vec![vec![
                Segment {
                    generated_column: 0,
                    source: 0,
                    original_line: 5,
                    original_column: 8,
                    name: 1,
                },
                Segment {
                    generated_column: 3,
                    source: 1,
                    original_line: 1,
                    original_column: 2,
                    name: 2,
                },
                Segment {
                    generated_column: 5,
                    source: 0,
                    original_line: u32::MAX,
                    original_column: u32::MAX,
                    name: 0,
                },
                Segment {
                    generated_column: 7,
                    source: 0,
                    original_line: 9,
                    original_column: 4,
                    name: 0,
                },
            ]],
        }
        .encode();
        let outer = pack_decoded_layer(
            &[0, 0, 0, 0, IDENTITY_TAIL | 1, 0, 9, 0, 9, 0],
            &["outer"],
            0,
        );
        let input_names = vec!["original".to_owned(), "other".to_owned()];
        let (mappings, names) =
            compose_layer_chain_with_input(&[&outer], Some((&input, &input_names))).unwrap();
        assert_eq!(names, ["outer", "original", "other"]);
        let lines = decode(&mappings);
        let points = &lines[0];
        assert_eq!(
            (
                points[0].generated_column,
                points[0].source,
                points[0].original_line,
                points[0].original_column,
                points[0].name
            ),
            (0, 0, 5, 8, 2)
        );
        assert_eq!(
            (
                points[1].generated_column,
                points[1].source,
                points[1].original_line,
                points[1].original_column,
                points[1].name
            ),
            (3, 1, 1, 2, 3)
        );
        assert_eq!(
            (
                points[2].generated_column,
                points[2].original_line,
                points[2].name
            ),
            (5, u32::MAX, 0)
        );
        assert_eq!(
            (points[3].generated_column, points[3].source, points[3].name),
            (7, 0, 1)
        );
    }

    #[test]
    fn serialized_input_leading_gaps_remain_unmapped() {
        let outer = pack_decoded_layer(
            &[0, 0, 0, 0, IDENTITY_TAIL, 0, 9, 0, 9, 0],
            &[] as &[String],
            0,
        );
        let (mappings, _) = compose_layer_chain_with_input(&[&outer], Some(("GAAA", &[]))).unwrap();
        let points = super::super::decode(&mappings);
        assert_eq!(points[0][0].generated_column, 3);
        assert_eq!(points[0][0].original_column, 0);
    }

    #[test]
    fn serialized_input_sparse_lines_and_allocation_limits() {
        let input = format!("{}AAAA{}", ";".repeat(20_000), ";".repeat(20_000));
        let outer = pack_decoded_layer(
            &[0, 0, 20_000, 0, IDENTITY_TAIL, 0, 1, 20_000, 1, 0],
            &[] as &[String],
            0,
        );
        let _limit = ResidentBudgetOverride::bytes(8 * 1024);
        let (mappings, _) = compose_layer_chain_with_input(&[&outer], Some((&input, &[]))).unwrap();
        assert_eq!(mappings, "AAAA,CAAC");
        let dense = "AAAA,".repeat(2_000);
        assert_eq!(
            compose_layer_chain_with_input(&[&outer], Some((&dense, &[]))),
            Err(DecodedMapError::ResidentLimit)
        );
        let names = vec!["x".repeat(8 * 1024)];
        assert_eq!(
            compose_layer_chain_with_input(&[&outer], Some((&input, &names))),
            Err(DecodedMapError::ResidentLimit)
        );
    }

    #[test]
    fn mapping_point_stays_word_packed() {
        assert_eq!(
            std::mem::size_of::<MappingPoint>(),
            6 * std::mem::size_of::<u32>()
        );
    }

    fn single_line(segments: Vec<MappingPoint>) -> DecodedMap {
        DecodedMap {
            lines: vec![MappedLine {
                generated_line: 0,
                segment_start: 0,
            }],
            segments,
            last_generated_line: 0,
        }
    }

    fn mapped(
        generated_column: u32,
        original_column: u32,
        behavior: MappingBehavior,
    ) -> MappingPoint {
        MappingPoint {
            source: 0,
            generated_column,
            original_line: 0,
            original_column,
            name: 0,
            behavior,
        }
    }

    fn unmapped(generated_column: u32) -> MappingPoint {
        MappingPoint::unmapped(generated_column)
    }

    fn decoded_layer(words: &[u32], last_generated_line: u32) -> DecodedLayer {
        DecodedLayer {
            words: words.to_vec(),
            names: Vec::new(),
            last_generated_line,
        }
    }

    #[test]
    fn named_identity_projects_inner_names_at_later_boundaries() {
        let inner = single_line(vec![
            MappingPoint {
                name: 1,
                ..mapped(0, 10, MappingBehavior::Boundary)
            },
            MappingPoint {
                name: 2,
                ..mapped(3, 20, MappingBehavior::Anchor)
            },
            unmapped(5),
            MappingPoint {
                name: 3,
                ..mapped(7, 30, MappingBehavior::Boundary)
            },
        ]);
        let outer = single_line(vec![MappingPoint {
            name: 4,
            ..mapped(0, 0, MappingBehavior::Identity)
        }]);
        let result = compose_decoded(&outer, &inner, &mut MappingBudget::new()).unwrap();
        let points = result.line(0).unwrap();
        assert_eq!(points.len(), 4);
        assert_eq!(
            (
                points[0].generated_column,
                points[0].original_column,
                points[0].name
            ),
            (0, 10, 4)
        );
        assert_eq!(
            (
                points[1].generated_column,
                points[1].original_column,
                points[1].name
            ),
            (3, 20, 2)
        );
        assert!(points[2].is_unmapped());
        assert_eq!((points[2].generated_column, points[2].name), (5, 0));
        assert_eq!(
            (
                points[3].generated_column,
                points[3].original_column,
                points[3].name
            ),
            (7, 30, 3)
        );
    }

    #[test]
    fn composition_order_is_observable_for_sparse_layers() {
        let layers = [
            single_line(vec![mapped(8, 8, MappingBehavior::Identity)]),
            single_line(vec![mapped(3, 2, MappingBehavior::Anchor), unmapped(5)]),
            single_line(vec![
                mapped(5, 4, MappingBehavior::Boundary),
                mapped(9, 5, MappingBehavior::Identity),
            ]),
            single_line(vec![mapped(6, 6, MappingBehavior::Identity)]),
        ];
        let mut chronological = layers[0].clone();
        for outer in &layers[1..] {
            chronological =
                compose_decoded(outer, &chronological, &mut MappingBudget::new()).unwrap();
        }
        let first_pair =
            compose_decoded(&layers[1], &layers[0], &mut MappingBudget::new()).unwrap();
        let second_pair =
            compose_decoded(&layers[3], &layers[2], &mut MappingBudget::new()).unwrap();
        let balanced =
            compose_decoded(&second_pair, &first_pair, &mut MappingBudget::new()).unwrap();

        assert_eq!(
            chronological.line(0).unwrap()[0].behavior,
            MappingBehavior::Anchor
        );
        assert_eq!(
            balanced.line(0).unwrap()[0].behavior,
            MappingBehavior::Unmapped
        );
    }

    #[test]
    fn rejects_descending_generated_columns() {
        let layer = pack_decoded_layer(
            &[0, 2, 0, 2, IDENTITY_TAIL, 0, 1, 0, 1, IDENTITY_TAIL],
            &[] as &[String],
            0,
        );
        assert_eq!(
            unpack_decoded_layer(&layer, &mut MappingBudget::new()).err(),
            Some(DecodedMapError::Invalid)
        );
    }

    #[test]
    fn composed_layers_preserve_the_last_generated_line() {
        for (words, last_generated_line, expected_mappings) in [
            (vec![0, 0, 0, 0, IDENTITY_TAIL], 0, "AAAA"),
            (vec![0, 0, 0, 0, IDENTITY_TAIL], 2, "AAAA;;"),
            (
                vec![0, 0, 0, 0, IDENTITY_TAIL, 2, 0, 2, 0, IDENTITY_TAIL],
                2,
                "AAAA;;AAEA",
            ),
        ] {
            let layers = [
                decoded_layer(&words, last_generated_line),
                decoded_layer(&words, last_generated_line),
            ];
            let packed = compose_decoded_layers(&layers).unwrap();
            let (map, _) = unpack_decoded_layer(&packed, &mut MappingBudget::new()).unwrap();
            assert_eq!(map.last_generated_line, last_generated_line);
            assert_eq!(encode_decoded(&map).as_deref(), Ok(expected_mappings));
        }
    }

    #[test]
    fn rejects_invalid_packed_name_count() {
        let mut excessive_names = Vec::new();
        excessive_names.extend_from_slice(&u32::MAX.to_le_bytes());
        excessive_names.extend_from_slice(&3u32.to_le_bytes());
        excessive_names.extend_from_slice(&0u32.to_le_bytes());
        assert_eq!(
            unpack_decoded_layer(&excessive_names, &mut MappingBudget::new()).err(),
            Some(DecodedMapError::Invalid)
        );
    }

    #[test]
    fn indexes_large_sparse_line_extents_without_dense_allocation() {
        let last_generated_line = 4 * 1024 * 1024;
        let layer = pack_decoded_layer(
            &[0, 0, 0, 0, IDENTITY_TAIL],
            &[] as &[String],
            last_generated_line,
        );
        let (map, _) = unpack_decoded_layer(&layer, &mut MappingBudget::new()).unwrap();
        assert_eq!(map.last_generated_line, last_generated_line);
        assert_eq!(map.lines.len(), 1);
        assert_eq!(map.segments.len(), 1);

        let (mappings, _) = compose_layer_chain(&[layer.as_slice()]).unwrap();
        assert!(mappings.starts_with("AAAA"));
        assert_eq!(mappings.len(), last_generated_line as usize + 4);
    }

    #[test]
    fn rejects_encoded_maps_over_the_explicit_resource_limit() {
        let layer = pack_decoded_layer(&[], &[] as &[String], u32::MAX);
        assert_eq!(
            compose_layer_chain(&[layer.as_slice()]),
            Err(DecodedMapError::EncodedLimit)
        );
    }

    /// A layer whose segments all share one generated line: only segment storage is
    /// charged.
    fn dense_line_words(segments: u32) -> Vec<u32> {
        (0..segments)
            .flat_map(|column| [0, column, 0, column, IDENTITY_TAIL])
            .collect()
    }

    /// A layer with one segment per generated line: segment and line-index storage are
    /// charged together.
    fn one_per_line_words(segments: u32) -> Vec<u32> {
        (0..segments)
            .flat_map(|line| [line, 0, line, 0, IDENTITY_TAIL])
            .collect()
    }

    #[test]
    fn decoding_a_first_layer_is_bounded_by_the_resident_budget() {
        let point = size_of::<MappingPoint>();
        let line = size_of::<MappedLine>();
        for (words, last_generated_line, affordable_bytes) in [
            (dense_line_words(64), 0, 64 * point + line),
            (one_per_line_words(64), 63, 64 * (point + line)),
        ] {
            let packed = pack_decoded_layer(&words, &[] as &[String], last_generated_line);
            let resident = DecodedLayer {
                words: words.clone(),
                names: Vec::new(),
                last_generated_line,
            };
            {
                // One layer alone is subject to the budget: no second layer is needed
                // to reach the bounded composition path.
                let _budget = ResidentBudgetOverride::bytes(affordable_bytes / 2);
                assert_eq!(
                    unpack_decoded_layer(&packed, &mut MappingBudget::new()).err(),
                    Some(DecodedMapError::ResidentLimit)
                );
                assert_eq!(
                    decoded_map_from_words(&words, last_generated_line, &mut MappingBudget::new())
                        .err(),
                    Some(DecodedMapError::ResidentLimit)
                );
                // Packed and resident entry points classify it the same way.
                assert_eq!(
                    compose_layer_chain(&[packed.as_slice()]),
                    Err(DecodedMapError::ResidentLimit)
                );
                assert_eq!(
                    compose_decoded_layers(std::slice::from_ref(&resident)),
                    Err(DecodedMapError::ResidentLimit)
                );
            }
            {
                // Growth is chunked, so the budget has to cover a whole chunk even
                // when the elements themselves would fit.
                let _budget = ResidentBudgetOverride::bytes(
                    MAPPING_GROWTH_CHUNK * (point + line) + affordable_bytes,
                );
                assert!(unpack_decoded_layer(&packed, &mut MappingBudget::new()).is_ok());
                assert!(
                    decoded_map_from_words(&words, last_generated_line, &mut MappingBudget::new())
                        .is_ok()
                );
            }
        }
    }

    #[test]
    fn a_malformed_layer_is_invalid_rather_than_over_budget() {
        let words = [0, 2, 0, 2, IDENTITY_TAIL, 0, 1, 0, 1, IDENTITY_TAIL];
        let layer = pack_decoded_layer(&words, &[] as &[String], 0);
        {
            // A layer the budget can hold reports its structural fault, whatever the
            // budget: a malformed map is not an oversized one.
            let _budget = ResidentBudgetOverride::bytes(
                MAPPING_GROWTH_CHUNK * (size_of::<MappingPoint>() + size_of::<MappedLine>()),
            );
            assert_eq!(
                unpack_decoded_layer(&layer, &mut MappingBudget::new()).err(),
                Some(DecodedMapError::Invalid)
            );
            assert_eq!(
                decoded_map_from_words(&words, 0, &mut MappingBudget::new()).err(),
                Some(DecodedMapError::Invalid)
            );
        }
        // Shape checks that need no allocation are made before the budget is consulted,
        // so they report `Invalid` even with nothing to spend.
        let _budget = ResidentBudgetOverride::bytes(0);
        assert_eq!(
            decoded_map_from_words(&[0, 0, 0, 0], 0, &mut MappingBudget::new()).err(),
            Some(DecodedMapError::Invalid)
        );
        assert_eq!(
            unpack_decoded_layer(&[0, 0, 0], &mut MappingBudget::new()).err(),
            Some(DecodedMapError::Invalid)
        );
        // A layer too large to hold is refused before it is walked, so an oversized
        // malformed layer reports the limit rather than the fault.
        assert_eq!(
            unpack_decoded_layer(&layer, &mut MappingBudget::new()).err(),
            Some(DecodedMapError::ResidentLimit)
        );
    }

    #[test]
    fn an_oversized_layer_is_refused_from_its_header() {
        let _budget = ResidentBudgetOverride::bytes(size_of::<MappingPoint>());
        let words = dense_line_words(1_024);
        let packed = pack_decoded_layer(&words, &[] as &[String], 0);
        assert!(!MappingBudget::new().admits_segments(words.len() / 5));
        assert_eq!(
            compose_layer_chain(&[packed.as_slice()]),
            Err(DecodedMapError::ResidentLimit)
        );
    }

    /// Storage the layer occupies once decoded, measured under the real budget.
    fn charged_bytes_of(layer: &[u8]) -> usize {
        unpack_decoded_layer(layer, &mut MappingBudget::new())
            .unwrap()
            .0
            .charged_bytes()
    }

    #[test]
    fn composition_output_is_bounded_by_the_same_budget() {
        // A copied span projects every inner boundary, so the composed map outgrows
        // either input and has to be refused while it is built, not after.
        let inner = pack_decoded_layer(&dense_line_words(4 * 1024), &[] as &[String], 0);
        let outer = pack_decoded_layer(&[0, 0, 0, 0, IDENTITY_TAIL], &[] as &[String], 0);
        let held = charged_bytes_of(&inner) + charged_bytes_of(&outer);
        // Both layers fit, and half of what projecting them needs on top.
        let _budget = ResidentBudgetOverride::bytes(held + charged_bytes_of(&inner) / 2);
        assert_eq!(
            compose_layer_chain(&[inner.as_slice(), outer.as_slice()]),
            Err(DecodedMapError::ResidentLimit)
        );
    }

    #[test]
    fn folding_a_long_chain_is_bounded_by_what_it_holds() {
        // Storage returns as layers are consumed, so a chain is bounded by the maps
        // alive at once. Charging without refunding would make phase count the limit.
        let layer = pack_decoded_layer(&dense_line_words(256), &[] as &[String], 0);
        let each = charged_bytes_of(&layer);
        let _budget = ResidentBudgetOverride::bytes(each * 6);
        let layers: Vec<&[u8]> = std::iter::repeat_n(layer.as_slice(), 32).collect();
        assert!(
            compose_layer_chain(&layers).is_ok(),
            "a 32-layer chain must not need 32 layers' worth of budget"
        );
    }

    #[test]
    fn an_unmapped_input_line_cannot_be_hidden_by_the_preceding_mapping() {
        // The inner layer maps generated line 0 only; line 1 exists but holds no
        // mapping, as a fully generated line does.
        let inner =
            decoded_map_from_words(&[0, 0, 0, 0, IDENTITY_TAIL], 1, &mut MappingBudget::new())
                .unwrap();
        // The outer layer relocates a copy of that unmapped line into the middle of
        // its own mapped line 0.
        let outer = decoded_map_from_words(
            &[0, 0, 0, 0, IDENTITY_TAIL, 0, 5, 1, 0, IDENTITY_TAIL],
            0,
            &mut MappingBudget::new(),
        )
        .unwrap();
        let composed = compose_decoded(&outer, &inner, &mut MappingBudget::new()).unwrap();
        let line = composed.line(0).unwrap();
        assert_eq!(line.len(), 2);
        assert!(
            line[1].is_unmapped(),
            "column 5 must close the mapping instead of inheriting it: {:?}",
            line[1]
        );

        // A line whose every segment traces to nothing still costs no line entry.
        let all_unmapped =
            decoded_map_from_words(&[0, 0, 1, 0, IDENTITY_TAIL], 0, &mut MappingBudget::new())
                .unwrap();
        assert!(
            compose_decoded(&all_unmapped, &inner, &mut MappingBudget::new())
                .unwrap()
                .lines
                .is_empty()
        );
    }

    #[test]
    fn sparse_line_lookup_falls_back_for_relocated_ranges() {
        let map = decoded_map_from_words(
            &[0, 0, 0, 0, IDENTITY_TAIL, 2, 0, 2, 0, IDENTITY_TAIL],
            2,
            &mut MappingBudget::new(),
        )
        .unwrap();
        let mut lookup = LineLookup::default();
        assert!(lookup.line(&map, 2).is_some());
        assert!(lookup.line(&map, 0).is_some());
        assert!(lookup.line(&map, 1).is_none());
        assert!(lookup.line(&map, 3).is_none());
        assert!(lookup.line(&map, 0).is_some());
    }
}
