use napi::{Error, Result, Status};

pub(crate) mod commit;
use napi_derive::napi;
use rustc_hash::FxHashMap;
use std::rc::Rc;

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
    /// Output-section content before every body piece (wrapper openers). Later
    /// prefixes render before earlier ones, mirroring repeated `prepend` semantics.
    Prefix,
    /// Directive-prologue helper content: participates in the body stream at its
    /// offset with append-left placement, in first-ensure order.
    Prologue,
    /// Output-section content after every body piece (wrapper closers), in call
    /// order.
    Suffix,
    /// Relocate the `start..end` source range to `destination`: the range leaves its
    /// place as a hole and its original-backed pieces render at the destination with
    /// every contained edit applied, so relocation is piece reordering rather than
    /// delete-plus-snapshot.
    Move,
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
    /// Relocation target for `Move` edits, in UTF-16 code units.
    pub destination: Option<u32>,
    pub mapping: Option<MappingPolicy>,
    pub order: Option<u32>,
    pub names: Option<Vec<String>>,
}

/// One piece of an edit's content: literal text, or a deferred copy of a source
/// range that is realized at commit time with the same phase's contained edits applied.
#[derive(Debug, Clone)]
enum ContentPart {
    Text(String),
    Copy { start: usize, end: usize },
}

/// One piece of the output document. The piece sequence is the single internal
/// representation between commit and rendering: concatenating piece text yields the
/// output code, and every piece records where its bytes came from so mapping derives
/// from structure instead of a separate edit walk. Copies realize as sub-sequences of
/// pieces sharing the same original ranges, so their interior mappings fall out of the
/// representation.
#[derive(Debug, Clone)]
pub enum Piece {
    /// Verbatim byte range of the original source; maps as identity.
    Original { start: usize, end: usize },
    /// A bare source-map mark at `origin`, emitted in every mapping mode
    /// (`AddSourceMapLocation`).
    Mark { origin: usize },
    /// A positional mapping anchor at `origin`, optionally named: edit-level anchor
    /// policies and the anchors copies place around relocated content. Skipped in
    /// line mode, like every anchor today.
    Anchor { origin: usize, name: Option<String> },
    /// Generated text replacing the `start..end` byte range of the original source
    /// (empty for pure insertions and for glue text inside copies).
    Generated {
        text: String,
        start: usize,
        end: usize,
        mapping: MappingPolicy,
        names: Vec<String>,
    },
    /// A shared sub-sequence: one copied range's expansion, reference-counted so
    /// every copy of the same range shares one realization.
    Splice(Rc<[Piece]>),
}

/// Normalized edit in byte coordinates, already sorted: the short-lived intermediate
/// needed only while expanding deferred copies, which resolve against the whole
/// sorted edit list before pieces exist.
#[derive(Debug, Clone)]
struct Edit {
    start: usize,
    end: usize,
    content: String,
    /// Deferred content; when non-empty, copy expansion lowers it to pieces.
    parts: Vec<ContentPart>,
    mapping: MappingPolicy,
    mark_only: bool,
    /// The hole a `Move` leaves: renders nothing in place, consumes contained edits,
    /// and is transparent to range expansion (the moved text still exists in
    /// original coordinates).
    hole: bool,
    /// A `Move` destination: its single copy part is a relocation, which changes
    /// conflict wording and exempts it from the removed-and-copied rejection.
    moved: bool,
    /// The edit came from a `Remove` command; an exact-cover removal of a copied
    /// range is the old relocation spelling and is rejected toward `move`.
    removed: bool,
    names: Vec<String>,
    /// Public UTF-16 offsets retained for diagnostics.
    public_start: u32,
    public_end: u32,
}

/// Sortable position of one command: everything ordering and overlap validation
/// need, without moving the command's content around during the sort.
struct Key {
    start: usize,
    end: usize,
    affinity: u8,
    order: u32,
    index: u32,
    public_start: u32,
    public_end: u32,
    role: KeyRole,
}

/// A `Move` command contributes two keys: the ranged hole it leaves behind and the
/// zero-width destination its content renders at.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum KeyRole {
    Body,
    MoveHole,
    MoveDestination,
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

/// Lower public edit commands into the piece sequence for `source`: resolve UTF-16
/// offsets, order by position and insertion affinity, reject overlaps, realize
/// deferred copies, and emit pieces. Identity replacements whose content equals the
/// replaced source lower directly into `Original` pieces, and adjacent original
/// ranges merge.
pub fn build(source: &str, commands: Vec<EditCommand>) -> Result<Vec<Piece>> {
    let byte_offsets = if source.is_ascii() {
        None
    } else {
        let mut offsets = Vec::with_capacity(source.len() + 1);
        for (byte, character) in source.char_indices() {
            offsets.push(byte as u32);
            if character.len_utf16() == 2 {
                offsets.push(u32::MAX);
            }
        }
        offsets.push(source.len() as u32);
        Some(offsets)
    };
    let resolve = |offset: u32| -> Result<usize> {
        if byte_offsets.is_none() && (offset as usize) <= source.len() {
            Ok(offset as usize)
        } else {
            byte_offsets
                .as_ref()
                .and_then(|offsets| offsets.get(offset as usize))
                .filter(|offset| **offset != u32::MAX)
                .map(|offset| *offset as usize)
                .ok_or_else(|| {
                    Error::new(
                        Status::InvalidArg,
                        format!("invalid UTF-16 offset {offset}"),
                    )
                })
        }
    };
    let mut keys = Vec::with_capacity(commands.len());
    // Output sections: prefix and suffix content never competes with body edits in
    // affinity order — it is assembled around the body by construction.
    let mut prefix = Vec::new();
    let mut suffix = Vec::new();
    let mut has_parts = false;
    for (index, command) in commands.iter().enumerate() {
        let order = command.order.unwrap_or(index as u32);
        match command.kind {
            EditKind::Prefix => {
                prefix.push((order, index as u32));
                continue;
            }
            EditKind::Suffix => {
                suffix.push((order, index as u32));
                continue;
            }
            _ => {}
        }
        let mut start = resolve(command.start)?;
        let mut end = resolve(command.end)?;
        let (public_start, public_end) = if command.start <= command.end {
            (command.start, command.end)
        } else {
            (command.end, command.start)
        };
        if command.kind == EditKind::Move {
            let destination = command.destination.ok_or_else(|| {
                Error::new(Status::InvalidArg, "move edit is missing a destination")
            })?;
            if start > end {
                std::mem::swap(&mut start, &mut end);
            }
            let destination = resolve(destination)?;
            if destination > start && destination < end {
                return Err(Error::new(
                    Status::InvalidArg,
                    format!(
                        "move destination cannot be inside the moved range {public_start}..{public_end}"
                    ),
                ));
            }
            has_parts = true;
            keys.push(Key {
                start,
                end,
                affinity: 4,
                order,
                index: index as u32,
                public_start,
                public_end,
                role: KeyRole::MoveHole,
            });
            keys.push(Key {
                start: destination,
                end: destination,
                affinity: 2,
                order: u32::MAX - order,
                index: index as u32,
                public_start,
                public_end,
                role: KeyRole::MoveDestination,
            });
            continue;
        }
        let (affinity, reverse_order) = match command.kind {
            EditKind::AppendLeft | EditKind::Prologue => {
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
            EditKind::Prefix | EditKind::Suffix | EditKind::Move => {
                unreachable!("sections and moves are split off above")
            }
        };
        if start > end {
            std::mem::swap(&mut start, &mut end);
        }
        has_parts |= !command.parts.is_empty();
        keys.push(Key {
            start,
            end,
            affinity,
            order: if reverse_order {
                u32::MAX - order
            } else {
                order
            },
            index: index as u32,
            public_start,
            public_end,
            role: KeyRole::Body,
        });
    }
    keys.sort_unstable_by_key(|key| {
        (
            key.start,
            key.end != key.start,
            key.affinity,
            key.order,
            key.index,
        )
    });
    let mut previous_range: Option<(usize, usize, u32, u32)> = None;
    // The moved range a `Move` hole spans is not exclusive like a replacement:
    // contained edits are legal (they apply inside the relocated content), while
    // straddlers, covering replacements, other relocations, and relocation targets
    // stay loud conflicts with both owners attributable.
    let mut current_hole: Option<&Key> = None;
    for key in &keys {
        if let Some(hole) = current_hole {
            if key.start < hole.end {
                if key.role == KeyRole::MoveHole {
                    return Err(Error::new(
                        Status::InvalidArg,
                        format!(
                            "overlapping moved ranges at {}..{} and {}..{}",
                            hole.public_start, hole.public_end, key.public_start, key.public_end
                        ),
                    ));
                }
                if key.role == KeyRole::MoveDestination {
                    return Err(Error::new(
                        Status::InvalidArg,
                        format!(
                            "move of {}..{} lands inside moved range {}..{}",
                            key.public_start, key.public_end, hole.public_start, hole.public_end
                        ),
                    ));
                }
                if key.end > hole.end {
                    return Err(Error::new(
                        Status::InvalidArg,
                        format!(
                            "moved range at {}..{} is partially overlapped by edit at {}..{}",
                            hole.public_start, hole.public_end, key.public_start, key.public_end
                        ),
                    ));
                }
                if key.start == hole.start && key.end == hole.end {
                    return Err(Error::new(
                        Status::InvalidArg,
                        format!(
                            "moved range at {}..{} conflicts with covering edit at {}..{}",
                            hole.public_start, hole.public_end, key.public_start, key.public_end
                        ),
                    ));
                }
                // Contained: the edit relocates with the moved range.
                continue;
            }
            current_hole = None;
        }
        if let Some((start, end, public_start, public_end)) = previous_range
            && (key.start < end || (key.start == start && key.end > key.start))
        {
            return Err(Error::new(
                Status::InvalidArg,
                format!(
                    "overlapping edits at {public_start}..{public_end} and {}..{}",
                    key.public_start, key.public_end
                ),
            ));
        }
        if key.end > key.start {
            previous_range = Some((key.start, key.end, key.public_start, key.public_end));
        }
        if key.role == KeyRole::MoveHole {
            current_hole = Some(key);
        }
    }
    let mut slots: Vec<Option<EditCommand>> = commands.into_iter().map(Some).collect();
    // Later prefixes render before earlier ones (repeated `prepend` wraps outward);
    // suffixes accumulate in call order.
    prefix.sort_unstable_by(|a, b| b.0.cmp(&a.0).then(a.1.cmp(&b.1)));
    suffix.sort_unstable();
    if has_parts {
        // Deferred copies expand against the whole sorted edit list, so this path
        // materializes it before lowering to pieces.
        let mut edits = Vec::with_capacity(keys.len());
        for key in &keys {
            if key.role == KeyRole::MoveHole {
                // The hole a move leaves: renders nothing, consumes nothing from the
                // command (the destination key carries its content and names).
                edits.push(Edit {
                    start: key.start,
                    end: key.end,
                    content: String::new(),
                    parts: Vec::new(),
                    mapping: MappingPolicy::Sourceless,
                    mark_only: false,
                    hole: true,
                    moved: false,
                    removed: false,
                    names: Vec::new(),
                    public_start: key.public_start,
                    public_end: key.public_end,
                });
                continue;
            }
            let slot = &mut slots[key.index as usize];
            if key.role == KeyRole::MoveDestination {
                let command = slot.as_ref().expect("unlowered command");
                let mut moved_start = resolve(command.start)?;
                let mut moved_end = resolve(command.end)?;
                if moved_start > moved_end {
                    std::mem::swap(&mut moved_start, &mut moved_end);
                }
                let (_, mapping, names, _, _) = take_command(slot);
                edits.push(Edit {
                    start: key.start,
                    end: key.end,
                    content: String::new(),
                    parts: vec![ContentPart::Copy {
                        start: moved_start,
                        end: moved_end,
                    }],
                    mapping,
                    mark_only: false,
                    hole: false,
                    moved: true,
                    removed: false,
                    names,
                    public_start: key.public_start,
                    public_end: key.public_end,
                });
                continue;
            }
            let parts_raw = std::mem::take(&mut slot.as_mut().expect("unlowered command").parts);
            let mut parts = Vec::with_capacity(parts_raw.len());
            for part in parts_raw {
                parts.push(match part {
                    RawContentPart::Text(text) => ContentPart::Text(text),
                    RawContentPart::Copy { start, end } => ContentPart::Copy {
                        start: resolve(start)?,
                        end: resolve(end)?,
                    },
                });
            }
            let (content, mapping, names, mark_only, removed) = take_command(slot);
            edits.push(Edit {
                start: key.start,
                end: key.end,
                content,
                parts,
                mapping,
                mark_only,
                hole: false,
                moved: false,
                removed,
                names,
                public_start: key.public_start,
                public_end: key.public_end,
            });
        }
        let mut expansions = expand_copies(source, &mut edits)?;
        let mut pieces = Vec::with_capacity(edits.len() * 2 + 1 + prefix.len() + suffix.len());
        push_section(&mut pieces, &mut slots, &prefix, 0);
        let mut cursor = 0usize;
        let mut hole_end = 0usize;
        for (index, edit) in edits.iter_mut().enumerate() {
            // Edits inside a moved-away range render inside the relocated content,
            // not in place; bare marks keep their (collapsed) in-place position.
            if edit.start < hole_end && !edit.mark_only {
                continue;
            }
            push_original(&mut pieces, cursor, edit.start);
            cursor = cursor.max(edit.end);
            if edit.hole {
                hole_end = edit.end;
                continue;
            }
            if edit.mark_only {
                pieces.push(Piece::Mark { origin: edit.start });
            } else if let Some(content_pieces) = expansions[index].take() {
                if matches!(
                    edit.mapping,
                    MappingPolicy::AnchorStart
                        | MappingPolicy::AnchorBoundaries
                        | MappingPolicy::Identity
                ) {
                    pieces.push(Piece::Anchor {
                        origin: edit.start,
                        name: edit.names.first().cloned(),
                    });
                }
                pieces.extend(content_pieces);
                if edit.mapping == MappingPolicy::AnchorBoundaries {
                    pieces.push(Piece::Anchor {
                        origin: edit.end,
                        name: None,
                    });
                }
            } else if edit.mapping == MappingPolicy::Identity
                && edit.content == source[edit.start..edit.end]
            {
                push_original(&mut pieces, edit.start, edit.end);
            } else {
                pieces.push(Piece::Generated {
                    text: std::mem::take(&mut edit.content),
                    start: edit.start,
                    end: edit.end,
                    mapping: edit.mapping,
                    names: std::mem::take(&mut edit.names),
                });
            }
        }
        push_original(&mut pieces, cursor, source.len());
        push_section(&mut pieces, &mut slots, &suffix, source.len());
        return Ok(pieces);
    }
    let mut pieces = Vec::with_capacity(keys.len() * 2 + 1 + prefix.len() + suffix.len());
    push_section(&mut pieces, &mut slots, &prefix, 0);
    let mut cursor = 0usize;
    for key in &keys {
        push_original(&mut pieces, cursor, key.start);
        cursor = key.end;
        let (content, mapping, names, mark_only, _) = take_command(&mut slots[key.index as usize]);
        if mark_only {
            pieces.push(Piece::Mark { origin: key.start });
        } else if mapping == MappingPolicy::Identity && content == source[key.start..key.end] {
            push_original(&mut pieces, key.start, key.end);
        } else {
            pieces.push(Piece::Generated {
                text: content,
                start: key.start,
                end: key.end,
                mapping,
                names,
            });
        }
    }
    push_original(&mut pieces, cursor, source.len());
    push_section(&mut pieces, &mut slots, &suffix, source.len());
    Ok(pieces)
}

fn take_command(
    slot: &mut Option<EditCommand>,
) -> (String, MappingPolicy, Vec<String>, bool, bool) {
    let command = slot.take().expect("each command is lowered exactly once");
    let content = if command.kind == EditKind::Remove {
        String::new()
    } else {
        command.content.unwrap_or_default()
    };
    (
        content,
        command.mapping.unwrap_or(MappingPolicy::Sourceless),
        command.names.unwrap_or_default(),
        command.kind == EditKind::AddSourceMapLocation,
        command.kind == EditKind::Remove,
    )
}

/// Emit one output section (prefix or suffix) as zero-width generated pieces
/// anchored at `at`.
fn push_section(
    pieces: &mut Vec<Piece>,
    slots: &mut [Option<EditCommand>],
    entries: &[(u32, u32)],
    at: usize,
) {
    for &(_, index) in entries {
        let (content, mapping, names, _, _) = take_command(&mut slots[index as usize]);
        pieces.push(Piece::Generated {
            text: content,
            start: at,
            end: at,
            mapping,
            names,
        });
    }
}

fn push_original(pieces: &mut Vec<Piece>, start: usize, end: usize) {
    if end <= start {
        return;
    }
    if let Some(Piece::Original { end: last_end, .. }) = pieces.last_mut()
        && *last_end == start
    {
        *last_end = end;
        return;
    }
    pieces.push(Piece::Original { start, end });
}

/// Expand deferred `Copy` content parts against the sorted edit list into piece
/// sub-sequences.
///
/// A copied range expands to its original source slices with every fully-contained
/// edit applied (zero-width insertions count only strictly inside), so inserted
/// copies reflect the same phase's edits instead of snapshotting pre-edit text.
/// Verbatim slices become `Original` pieces sharing the source range, so interior
/// mappings fall out of the representation; contained edits keep their own anchors
/// and names as `Anchor` pieces. Edits that partially overlap a copied range make
/// the copy ambiguous and fail; circular copies fail. Errors report both edits in
/// public UTF-16 offsets so callers can attribute owners.
///
/// Returns the content pieces per edit; only parts-carrying edits get `Some`.
fn expand_copies(source: &str, edits: &mut [Edit]) -> Result<Vec<Option<Vec<Piece>>>> {
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
    let mut expansions = vec![None; edits.len()];
    let mut expander = Expander {
        source,
        states: vec![State::Unresolved; edits.len()],
        previous_ranged,
        cache: FxHashMap::default(),
    };
    for index in 0..edits.len() {
        expander.resolve(edits, &mut expansions, index, None)?;
    }
    Ok(expansions)
}

#[derive(Clone, Copy, PartialEq)]
enum State {
    Unresolved,
    Visiting,
    Done,
}

struct Expander<'a> {
    source: &'a str,
    states: Vec<State>,
    previous_ranged: Vec<usize>,
    /// Expanded pieces per copied range, shared across identical copies.
    cache: FxHashMap<(usize, usize), Rc<[Piece]>>,
}

/// The edit whose content parts are being expanded: its public range and whether
/// the expansion is a relocation (for conflict wording).
type Copier = (u32, u32, bool);

fn straddle_error(copier: Copier, edit: &Edit) -> Error {
    let what = if copier.2 { "moved" } else { "copied" };
    Error::new(
        Status::InvalidArg,
        format!(
            "{what} range in edit {}..{} partially overlaps edit {}..{}",
            copier.0, copier.1, edit.public_start, edit.public_end
        ),
    )
}

/// Glue text carries no position of its own: it renders as generated bytes without
/// marks, and the zero-width `origin` range only seeds the renderer's cursor.
fn glue(text: String, origin: usize) -> Piece {
    Piece::Generated {
        text,
        start: origin,
        end: origin,
        mapping: MappingPolicy::Sourceless,
        names: Vec::new(),
    }
}

impl Expander<'_> {
    fn resolve(
        &mut self,
        edits: &mut [Edit],
        expansions: &mut [Option<Vec<Piece>>],
        index: usize,
        copier: Option<Copier>,
    ) -> Result<()> {
        match self.states[index] {
            State::Done => return Ok(()),
            State::Visiting => {
                let (start, end) = copier
                    .map(|copier| (copier.0, copier.1))
                    .unwrap_or((edits[index].public_start, edits[index].public_end));
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
            let copier = (
                edits[index].public_start,
                edits[index].public_end,
                edits[index].moved,
            );
            let origin = edits[index].start;
            let mut out = Vec::new();
            for part in parts {
                match part {
                    ContentPart::Text(text) => out.push(glue(text, origin)),
                    ContentPart::Copy { start, end } => {
                        if let Some(cached) = self.cache.get(&(start, end)) {
                            out.push(Piece::Splice(Rc::clone(cached)));
                        } else {
                            let mut sub = Vec::new();
                            self.expand_range(edits, expansions, start, end, copier, &mut sub)?;
                            let shared: Rc<[Piece]> = Rc::from(sub);
                            out.push(Piece::Splice(Rc::clone(&shared)));
                            self.cache.insert((start, end), shared);
                        }
                    }
                }
            }
            expansions[index] = Some(out);
        }
        self.states[index] = State::Done;
        Ok(())
    }

    fn expand_range(
        &mut self,
        edits: &mut [Edit],
        expansions: &mut [Option<Vec<Piece>>],
        start: usize,
        end: usize,
        copier: Copier,
        out: &mut Vec<Piece>,
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
            if edits[index].hole {
                // A moved-away range is transparent to expansion: the text still
                // exists in original coordinates, and a move destination renders its
                // own range through exactly this transparency.
                continue;
            }
            if edits[index].removed && edit_start == start && edit_end == end {
                return Err(Error::new(
                    Status::InvalidArg,
                    format!(
                        "edit at {}..{} copies removed range {}..{}; use editor.move to relocate",
                        copier.0, copier.1, edits[index].public_start, edits[index].public_end
                    ),
                ));
            }
            self.resolve(edits, expansions, index, Some(copier))?;
            if edit_start > cursor {
                out.push(Piece::Anchor {
                    origin: cursor,
                    name: None,
                });
                out.push(Piece::Original {
                    start: cursor,
                    end: edit_start,
                });
            }
            let inner = &edits[index];
            match inner.mapping {
                MappingPolicy::Identity
                    if expansions[index].is_none()
                        && inner.content == self.source[edit_start..edit_end] =>
                {
                    out.push(Piece::Anchor {
                        origin: edit_start,
                        name: None,
                    });
                    out.push(Piece::Original {
                        start: edit_start,
                        end: edit_end,
                    });
                }
                MappingPolicy::AnchorStart
                | MappingPolicy::AnchorBoundaries
                | MappingPolicy::Identity => {
                    out.push(Piece::Anchor {
                        origin: edit_start,
                        name: inner.names.first().cloned(),
                    });
                    match &expansions[index] {
                        Some(content_pieces) => out.extend(content_pieces.iter().cloned()),
                        None => out.push(glue(inner.content.clone(), edit_start)),
                    }
                    if inner.mapping == MappingPolicy::AnchorBoundaries {
                        out.push(Piece::Anchor {
                            origin: edit_end,
                            name: None,
                        });
                    }
                }
                MappingPolicy::Sourceless => match &expansions[index] {
                    Some(content_pieces) => out.extend(content_pieces.iter().cloned()),
                    None => out.push(glue(inner.content.clone(), edit_start)),
                },
            }
            cursor = edit_end.max(cursor);
        }
        if end > cursor {
            out.push(Piece::Anchor {
                origin: cursor,
                name: None,
            });
            out.push(Piece::Original { start: cursor, end });
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
            destination: None,
            mapping: None,
            order: Some(order),
            names: None,
        }
    }

    fn generated_texts(pieces: &[Piece]) -> Vec<&str> {
        pieces
            .iter()
            .filter_map(|piece| match piece {
                Piece::Generated { text, .. } => Some(text.as_str()),
                _ => None,
            })
            .collect()
    }

    #[test]
    fn rejects_overlaps() {
        let result = build(
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
        let pieces = build(
            "x",
            vec![
                command(EditKind::AppendRight, 0, 0, "AR", 3),
                command(EditKind::PrependRight, 0, 0, "PR", 2),
                command(EditKind::AppendLeft, 0, 0, "AL", 1),
                command(EditKind::PrependLeft, 0, 0, "PL", 0),
            ],
        )
        .unwrap();
        assert_eq!(generated_texts(&pieces), ["PL", "AL", "PR", "AR"]);
    }

    #[test]
    fn lowers_identity_replacements_and_merges_original_ranges() {
        let source = "const value = 1;";
        let pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 6,
                end: 11,
                content: Some("value".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Identity),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        assert!(matches!(
            pieces.as_slice(),
            [Piece::Original { start: 0, end }] if *end == source.len()
        ));
    }

    #[test]
    fn rejects_offsets_inside_surrogate_pairs() {
        assert!(utf16_to_byte("😀", 1).is_err());
        assert_eq!(utf16_to_byte("😀", 2).unwrap(), 4);
    }

    fn move_command(start: u32, end: u32, destination: u32) -> EditCommand {
        EditCommand {
            kind: EditKind::Move,
            start,
            end,
            content: None,
            parts: Vec::new(),
            destination: Some(destination),
            mapping: None,
            order: Some(0),
            names: None,
        }
    }

    #[test]
    fn relocates_a_range_with_contained_edits() {
        let source = "const a = 1;\nconst b = 2;\n";
        let pieces = build(
            source,
            vec![
                move_command(0, 13, 26),
                command(EditKind::Replace, 6, 7, "renamed", 1),
            ],
        )
        .unwrap();
        assert_eq!(
            crate::sourcemap::render_code(source, &pieces),
            "const b = 2;\nconst renamed = 1;\n"
        );
    }

    #[test]
    fn rejects_overlapping_moved_ranges() {
        let error = build(
            "const a = 1;\nconst b = 2;\n",
            vec![move_command(0, 13, 26), move_command(6, 20, 26)],
        )
        .unwrap_err();
        assert!(
            error.reason.contains("overlapping moved ranges"),
            "{}",
            error.reason
        );
    }

    #[test]
    fn rejects_moves_into_moved_ranges() {
        let error = build(
            "const a = 1;\nconst b = 2;\n",
            vec![move_command(0, 12, 26), move_command(13, 26, 6)],
        )
        .unwrap_err();
        assert!(
            error.reason.contains("lands inside moved range"),
            "{}",
            error.reason
        );
    }
}
