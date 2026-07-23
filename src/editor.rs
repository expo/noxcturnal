use napi::{Error, Result, Status};
use napi_derive::napi;
use rustc_hash::FxHashMap;

#[napi(string_enum)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EditKind {
    Replace,
    Remove,
    AppendLeft,
    PrependLeft,
    AppendRight,
    PrependRight,
    AddSourceMapLocation,
}

#[napi(string_enum)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MappingPolicy {
    Sourceless,
    AnchorStart,
    AnchorBoundaries,
    Identity,
}

/// Content part in public UTF-16 coordinates, before normalization.
#[derive(Debug, Clone)]
pub enum RawContentPart {
    Text(String),
    Copy { start: u32, end: u32 },
}

#[derive(Debug, Clone)]
pub struct EditCommand {
    pub kind: EditKind,
    /// Public offsets are JavaScript UTF-16 code units.
    pub start: u32,
    pub end: u32,
    pub content: Option<String>,
    /// Deferred content parts; realized at commit against the same phase's edits.
    pub parts: Vec<RawContentPart>,
    pub mapping: Option<MappingPolicy>,
    pub order: Option<u32>,
    pub names: Option<Vec<String>>,
}

/// One piece of an edit's content: literal text, or a deferred copy of a source
/// range that is realized at commit time with the same phase's contained edits applied.
#[derive(Debug, Clone)]
pub enum ContentPart {
    Text(String),
    Copy { start: usize, end: usize },
}

/// Mapping structure of realized copy content: which byte ranges of an edit's
/// `content` are verbatim source slices, and where contained edits' own mapping
/// anchors landed. Only `resolve_copies` populates this; plain edits keep an empty
/// list and render exactly as before.
#[derive(Debug, Clone)]
pub enum ContentSpan {
    /// `content[offset..offset + len]` is `source[origin..origin + len]`, verbatim.
    Copy {
        offset: usize,
        origin: usize,
        len: usize,
    },
    /// A mapping anchor at `content[offset]` pointing at `source[origin]`, carrying
    /// the contained edit's first mapped name.
    Anchor {
        offset: usize,
        origin: usize,
        name: Option<String>,
    },
}

impl ContentSpan {
    fn rebased(&self, base: usize) -> ContentSpan {
        match self {
            ContentSpan::Copy {
                offset,
                origin,
                len,
            } => ContentSpan::Copy {
                offset: offset + base,
                origin: *origin,
                len: *len,
            },
            ContentSpan::Anchor {
                offset,
                origin,
                name,
            } => ContentSpan::Anchor {
                offset: offset + base,
                origin: *origin,
                name: name.clone(),
            },
        }
    }
}

#[derive(Debug, Clone)]
pub struct ByteEdit {
    pub start: usize,
    pub end: usize,
    pub content: String,
    /// Deferred content; when non-empty, `resolve_copies` realizes it into `content`.
    pub parts: Vec<ContentPart>,
    /// Source structure of realized copy content, for mapping fidelity inside copies.
    pub content_map: Vec<ContentSpan>,
    pub mapping: MappingPolicy,
    pub order: u32,
    pub affinity: u8,
    pub reverse_order: bool,
    pub mark_only: bool,
    pub names: Vec<String>,
    /// Public UTF-16 offsets retained for diagnostics.
    pub public_start: u32,
    pub public_end: u32,
}

#[cfg(test)]
pub fn utf16_to_byte(source: &str, offset: u32) -> Result<usize> {
    let target = offset as usize;
    let mut utf16 = 0;
    for (byte, ch) in source.char_indices() {
        if utf16 == target {
            return Ok(byte);
        }
        utf16 += ch.len_utf16();
        if utf16 > target {
            return Err(Error::new(
                Status::InvalidArg,
                format!("UTF-16 offset {offset} splits a surrogate pair"),
            ));
        }
    }
    if utf16 == target {
        Ok(source.len())
    } else {
        Err(Error::new(
            Status::InvalidArg,
            format!("UTF-16 offset {offset} is outside the source"),
        ))
    }
}

pub fn normalize(source: &str, commands: Vec<EditCommand>) -> Result<Vec<ByteEdit>> {
    let mut edits = Vec::with_capacity(commands.len());
    let byte_offsets = if source.is_ascii() {
        None
    } else {
        let mut offsets = vec![None; source.encode_utf16().count() + 1];
        let mut utf16 = 0usize;
        for (byte, character) in source.char_indices() {
            offsets[utf16] = Some(byte);
            utf16 += character.len_utf16();
        }
        offsets[utf16] = Some(source.len());
        Some(offsets)
    };
    let resolve = |offset: u32| -> Result<usize> {
        if byte_offsets.is_none() && (offset as usize) <= source.len() {
            Ok(offset as usize)
        } else {
            byte_offsets
                .as_ref()
                .and_then(|offsets| offsets.get(offset as usize))
                .and_then(|offset| *offset)
                .ok_or_else(|| {
                    Error::new(
                        Status::InvalidArg,
                        format!("invalid UTF-16 offset {offset}"),
                    )
                })
        }
    };
    for (index, command) in commands.into_iter().enumerate() {
        let mut start = resolve(command.start)?;
        let mut end = resolve(command.end)?;
        let (affinity, reverse_order) = match command.kind {
            EditKind::AppendLeft => {
                end = start;
                (1, false)
            }
            EditKind::PrependLeft => {
                end = start;
                (0, true)
            }
            EditKind::AppendRight => {
                end = start;
                (3, false)
            }
            EditKind::PrependRight => {
                end = start;
                (2, true)
            }
            EditKind::AddSourceMapLocation => {
                end = start;
                (4, false)
            }
            EditKind::Remove | EditKind::Replace => (4, false),
        };
        if start > end {
            std::mem::swap(&mut start, &mut end);
        }
        let (public_start, public_end) = if command.start <= command.end {
            (command.start, command.end)
        } else {
            (command.end, command.start)
        };
        let mut parts = Vec::with_capacity(command.parts.len());
        for part in command.parts {
            parts.push(match part {
                RawContentPart::Text(text) => ContentPart::Text(text),
                RawContentPart::Copy { start, end } => ContentPart::Copy {
                    start: resolve(start)?,
                    end: resolve(end)?,
                },
            });
        }
        edits.push(ByteEdit {
            start,
            end,
            content: if command.kind == EditKind::Remove {
                String::new()
            } else {
                command.content.unwrap_or_default()
            },
            parts,
            content_map: Vec::new(),
            mapping: command.mapping.unwrap_or(MappingPolicy::Sourceless),
            order: command.order.unwrap_or(index as u32),
            affinity,
            reverse_order,
            mark_only: command.kind == EditKind::AddSourceMapLocation,
            names: command.names.unwrap_or_default(),
            public_start,
            public_end,
        });
    }
    validate_and_sort(edits)
}

pub fn validate_and_sort(mut edits: Vec<ByteEdit>) -> Result<Vec<ByteEdit>> {
    edits.sort_by_key(|edit| {
        (
            edit.start,
            edit.end != edit.start,
            edit.affinity,
            if edit.reverse_order {
                u32::MAX - edit.order
            } else {
                edit.order
            },
        )
    });
    let mut previous_range: Option<(usize, usize, u32, u32)> = None;
    for edit in &edits {
        if let Some((start, end, public_start, public_end)) = previous_range
            && (edit.start < end || (edit.start == start && edit.end > edit.start))
        {
            return Err(Error::new(
                Status::InvalidArg,
                format!(
                    "overlapping edits at {public_start}..{public_end} and {}..{}",
                    edit.public_start, edit.public_end
                ),
            ));
        }
        if edit.end > edit.start {
            previous_range = Some((edit.start, edit.end, edit.public_start, edit.public_end));
        }
    }
    Ok(edits)
}

/// Realize deferred `Copy` content parts against the sorted edit list.
///
/// A copied range renders as its original source with every fully-contained edit
/// applied (zero-width insertions count only strictly inside), so inserted copies
/// reflect the same phase's edits instead of snapshotting pre-edit text. Edits that
/// partially overlap a copied range make the copy ambiguous and fail; circular
/// copies fail. Errors report both edits in public UTF-16 offsets so callers can
/// attribute owners. Alongside the rendered text, each realized edit records a
/// `content_map` describing which content ranges are verbatim source and where
/// contained edits' anchors landed, so copies keep interior source mappings.
pub fn resolve_copies(source: &str, mut edits: Vec<ByteEdit>) -> Result<Vec<ByteEdit>> {
    if edits.iter().all(|edit| edit.parts.is_empty()) {
        return Ok(edits);
    }
    // Index of the nearest ranged edit at or before each position: after the binary
    // search skips everything left of a copied range, this is the only edit that can
    // still straddle the range's start boundary.
    let mut previous_ranged = vec![usize::MAX; edits.len()];
    let mut last_ranged = usize::MAX;
    for (index, edit) in edits.iter().enumerate() {
        if edit.end > edit.start {
            last_ranged = index;
        }
        previous_ranged[index] = last_ranged;
    }
    let mut resolver = Resolver {
        source,
        states: vec![State::Unresolved; edits.len()],
        previous_ranged,
        cache: FxHashMap::default(),
    };
    for index in 0..edits.len() {
        resolver.resolve(&mut edits, index, None)?;
    }
    Ok(edits)
}

#[derive(Clone, Copy, PartialEq)]
enum State {
    Unresolved,
    Visiting,
    Done,
}

struct Resolver<'a> {
    source: &'a str,
    states: Vec<State>,
    previous_ranged: Vec<usize>,
    /// Rendered content per copied range, shared across identical copies.
    cache: FxHashMap<(usize, usize), (String, Vec<ContentSpan>)>,
}

fn straddle_error(copier: (u32, u32), edit: &ByteEdit) -> Error {
    Error::new(
        Status::InvalidArg,
        format!(
            "copied range in edit {}..{} partially overlaps edit {}..{}",
            copier.0, copier.1, edit.public_start, edit.public_end
        ),
    )
}

impl Resolver<'_> {
    fn resolve(
        &mut self,
        edits: &mut [ByteEdit],
        index: usize,
        copier: Option<(u32, u32)>,
    ) -> Result<()> {
        match self.states[index] {
            State::Done => return Ok(()),
            State::Visiting => {
                let (start, end) =
                    copier.unwrap_or((edits[index].public_start, edits[index].public_end));
                return Err(Error::new(
                    Status::InvalidArg,
                    format!(
                        "circular source copy in edit {start}..{end} through edit {}..{}",
                        edits[index].public_start, edits[index].public_end
                    ),
                ));
            }
            State::Unresolved => {}
        }
        self.states[index] = State::Visiting;
        if !edits[index].parts.is_empty() {
            let parts = std::mem::take(&mut edits[index].parts);
            let copier = (edits[index].public_start, edits[index].public_end);
            let mut content = String::new();
            let mut map = Vec::new();
            for part in &parts {
                match part {
                    ContentPart::Text(text) => content.push_str(text),
                    ContentPart::Copy { start, end } => {
                        if let Some((text, spans)) = self.cache.get(&(*start, *end)) {
                            let base = content.len();
                            map.extend(spans.iter().map(|span| span.rebased(base)));
                            content.push_str(text);
                        } else {
                            let mut sub = String::new();
                            let mut sub_map = Vec::new();
                            self.render_range(edits, *start, *end, copier, &mut sub, &mut sub_map)?;
                            let base = content.len();
                            map.extend(sub_map.iter().map(|span| span.rebased(base)));
                            content.push_str(&sub);
                            self.cache.insert((*start, *end), (sub, sub_map));
                        }
                    }
                }
            }
            edits[index].content = content;
            edits[index].content_map = map;
        }
        self.states[index] = State::Done;
        Ok(())
    }

    fn render_range(
        &mut self,
        edits: &mut [ByteEdit],
        start: usize,
        end: usize,
        copier: (u32, u32),
        content: &mut String,
        map: &mut Vec<ContentSpan>,
    ) -> Result<()> {
        // Edits are sorted by start, so the first candidate is a binary search away.
        let first = edits.partition_point(|edit| edit.start < start);
        if let Some(index) = first
            .checked_sub(1)
            .map(|index| self.previous_ranged[index])
            .filter(|index| *index != usize::MAX)
            && edits[index].end > start
        {
            return Err(straddle_error(copier, &edits[index]));
        }
        let mut cursor = start;
        for index in first..edits.len() {
            let (edit_start, edit_end, mark_only) =
                (edits[index].start, edits[index].end, edits[index].mark_only);
            if edit_start >= end {
                if edit_start > end || edit_end > edit_start {
                    break;
                }
                continue;
            }
            if mark_only {
                continue;
            }
            let contained = if edit_end > edit_start {
                edit_end <= end
            } else {
                edit_start > start && edit_start < end
            };
            if !contained {
                if edit_end > edit_start {
                    return Err(straddle_error(copier, &edits[index]));
                }
                continue;
            }
            self.resolve(edits, index, Some(copier))?;
            if edit_start > cursor {
                map.push(ContentSpan::Copy {
                    offset: content.len(),
                    origin: cursor,
                    len: edit_start - cursor,
                });
                content.push_str(&self.source[cursor..edit_start]);
            }
            let inner = &edits[index];
            let base = content.len();
            match inner.mapping {
                MappingPolicy::Identity
                    if inner.content_map.is_empty()
                        && inner.content == self.source[edit_start..edit_end] =>
                {
                    map.push(ContentSpan::Copy {
                        offset: base,
                        origin: edit_start,
                        len: inner.content.len(),
                    });
                }
                MappingPolicy::AnchorStart
                | MappingPolicy::AnchorBoundaries
                | MappingPolicy::Identity => {
                    map.push(ContentSpan::Anchor {
                        offset: base,
                        origin: edit_start,
                        name: inner.names.first().cloned(),
                    });
                    map.extend(inner.content_map.iter().map(|span| span.rebased(base)));
                    if inner.mapping == MappingPolicy::AnchorBoundaries {
                        map.push(ContentSpan::Anchor {
                            offset: base + inner.content.len(),
                            origin: edit_end,
                            name: None,
                        });
                    }
                }
                MappingPolicy::Sourceless => {
                    map.extend(inner.content_map.iter().map(|span| span.rebased(base)));
                }
            }
            content.push_str(&inner.content);
            cursor = edit_end.max(cursor);
        }
        if end > cursor {
            map.push(ContentSpan::Copy {
                offset: content.len(),
                origin: cursor,
                len: end - cursor,
            });
            content.push_str(&self.source[cursor..end]);
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn command(kind: EditKind, start: u32, end: u32, content: &str, order: u32) -> EditCommand {
        EditCommand {
            kind,
            start,
            end,
            content: Some(content.into()),
            parts: Vec::new(),
            mapping: None,
            order: Some(order),
            names: None,
        }
    }

    #[test]
    fn rejects_overlaps() {
        let result = normalize(
            "abcdef",
            vec![
                command(EditKind::Replace, 1, 4, "x", 0),
                command(EditKind::Remove, 3, 5, "", 1),
            ],
        );
        assert!(result.is_err());
    }

    #[test]
    fn orders_all_insert_affinities() {
        let edits = normalize(
            "x",
            vec![
                command(EditKind::AppendRight, 0, 0, "AR", 3),
                command(EditKind::PrependRight, 0, 0, "PR", 2),
                command(EditKind::AppendLeft, 0, 0, "AL", 1),
                command(EditKind::PrependLeft, 0, 0, "PL", 0),
            ],
        )
        .unwrap();
        assert_eq!(
            edits
                .iter()
                .map(|edit| edit.content.as_str())
                .collect::<Vec<_>>(),
            ["PL", "AL", "PR", "AR"]
        );
    }

    #[test]
    fn rejects_offsets_inside_surrogate_pairs() {
        assert!(utf16_to_byte("😀", 1).is_err());
        assert_eq!(utf16_to_byte("😀", 2).unwrap(), 4);
    }
}
