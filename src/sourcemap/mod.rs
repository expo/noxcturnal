use std::rc::Rc;

use crate::edit::{MappingPolicy, Piece};
use rustc_hash::FxHashMap;

pub(crate) mod function_map;
pub(crate) mod vlq;

const ANCHOR_TAIL: u32 = 1 << 31;
const IDENTITY_TAIL: u32 = 1 << 30;
const NAME_MASK: u32 = !(ANCHOR_TAIL | IDENTITY_TAIL);

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
                prev_generated = segment.generated_column;
                if segment.original_line == u32::MAX {
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
        anchor_tail: bool,
        identity_tail: bool,
    );
    /// Fold a mark into the segment that already claims this generated column. The
    /// segment may only take an identity span for the position it stores: a mark
    /// arriving from somewhere else describes different text, and a span it opened
    /// would interpolate over text that segment never covered.
    fn update_last(
        &mut self,
        _name: Option<i64>,
        _anchor_tail: bool,
        _identity_tail: bool,
        _original_line: i64,
        _original_column: i64,
    ) {
    }
    /// End the span the last segment opened, for a transition that lands on a generated
    /// column that segment already claimed. Only the decoded layer carries span
    /// behaviour, so this never changes encoded output.
    fn close_last_span(&mut self) {}
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
        _anchor_tail: bool,
        _identity_tail: bool,
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
/// (generated line, generated column, original line, original column, name id + 1).
/// The two high bits of the name word distinguish open-ended anchored and identity
/// spans; they stay internal to decoded composition and are stripped from final VLQ.
/// The envelope around names is added when the buffer crosses N-API.
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
        anchor_tail: bool,
        identity_tail: bool,
    ) {
        self.words.extend_from_slice(&[
            self.generated_line,
            generated_column as u32,
            original_line as u32,
            original_column as u32,
            name.map_or(0, |name| name as u32 + 1)
                | if anchor_tail { ANCHOR_TAIL } else { 0 }
                | if identity_tail { IDENTITY_TAIL } else { 0 },
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
    fn update_last(
        &mut self,
        name: Option<i64>,
        anchor_tail: bool,
        identity_tail: bool,
        original_line: i64,
        original_column: i64,
    ) {
        let Some(segment) = self.words.rchunks_exact_mut(5).next() else {
            return;
        };
        if let Some(name_id) = name {
            segment[4] = (segment[4] & !NAME_MASK) | (name_id as u32 + 1);
        }
        if anchor_tail {
            segment[4] |= ANCHOR_TAIL;
        }
        if identity_tail
            && segment[2] == original_line as u32
            && segment[3] == original_column as u32
        {
            segment[4] |= IDENTITY_TAIL;
        }
    }
    fn close_last_span(&mut self) {
        if let Some(last_word) = self.words.last_mut() {
            *last_word &= !IDENTITY_TAIL;
        }
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
    /// The last segment emitted opened an identity span. Only such a span keeps
    /// interpolating, and only it makes composition project the input beyond it.
    open_identity: bool,
}

impl<S: SegmentSink> StreamingMap<S> {
    fn mark(&mut self) {
        self.mark_name(None);
    }
    fn mark_name(&mut self, name: Option<i64>) {
        self.mark_with_tail(name, false, false);
    }
    fn mark_anchor(&mut self, name: Option<i64>) {
        self.mark_with_tail(name, true, false);
    }
    fn mark_identity(&mut self, name: Option<i64>) {
        self.mark_with_tail(name, false, true);
    }
    /// Resume mapping for the text that follows a generated or removed range. A mark
    /// already at this generated column described the text before it, so that mark
    /// cannot also describe what comes next: end its span rather than extending it
    /// over text it never covered.
    fn mark_resume(&mut self) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            self.sink.close_last_span();
            self.open_identity = false;
            return;
        }
        self.mark_identity(None);
    }
    /// End the span the output leaves open where it stops short of its input.
    fn close_span(&mut self) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            self.sink.close_last_span();
            self.open_identity = false;
            return;
        }
        self.mark();
    }
    fn mark_with_tail(&mut self, name: Option<i64>, anchor_tail: bool, identity_tail: bool) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            self.sink.update_last(
                name,
                anchor_tail,
                identity_tail,
                self.original_line,
                self.original_column,
            );
            self.open_identity |= identity_tail;
            return;
        }
        self.sink.segment(
            self.generated_column,
            self.original_line,
            self.original_column,
            name,
            anchor_tail,
            identity_tail,
        );
        self.last_mark = Some((self.generated_line, self.generated_column));
        self.unmapped = false;
        self.open_identity = identity_tail;
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
        self.open_identity = false;
    }
    /// Mark a copied position. Line mode wants one point per generated line, so its
    /// marks stay plain boundaries: an identity span would let composition project
    /// every boundary an inner layer holds for that line into the output.
    fn mark_copy(&mut self, spans: bool) {
        if spans {
            self.mark_identity(None);
        } else {
            self.mark();
        }
    }
    /// `spans` is set for every mode but `line`: those modes describe copied text as
    /// identity spans and close a span at the last column of each generated line.
    fn copied(&mut self, text: &str, character: bool, spans: bool) {
        if self.unmapped {
            self.mark_copy(spans);
        }
        if text.is_ascii() {
            let bytes = text.as_bytes();
            for (index, byte) in bytes.iter().copied().enumerate() {
                if character
                    || self.generated_column == 0
                    || (spans
                        && byte != b'\n'
                        && bytes.get(index + 1).is_none_or(|next| *next == b'\n'))
                {
                    self.mark_copy(spans);
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
        let mut characters = text.chars().peekable();
        while let Some(character_value) = characters.next() {
            if character
                || self.generated_column == 0
                || (spans
                    && character_value != '\n'
                    && characters.peek().is_none_or(|next| *next == '\n'))
            {
                self.mark_copy(spans);
            }
            if character_value == '\n' {
                self.newline();
                self.original_line += 1;
                self.original_column = 0;
            } else {
                let width = character_value.len_utf16() as i64;
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
    fn generated_anchored(
        &mut self,
        text: &str,
        anchor_line: i64,
        anchor_column: i64,
        name: Option<i64>,
    ) {
        let resume = (self.original_line, self.original_column);
        if text.is_ascii() {
            let bytes = text.as_bytes();
            for (index, byte) in bytes.iter().copied().enumerate() {
                if byte == b'\n' {
                    self.newline();
                    if bytes.get(index + 1).is_some_and(|next| *next != b'\n') {
                        self.original_line = anchor_line;
                        self.original_column = anchor_column;
                        self.mark_anchor(name);
                        self.original_line = resume.0;
                        self.original_column = resume.1;
                    }
                } else {
                    if bytes.get(index + 1).is_none_or(|next| *next == b'\n') {
                        self.original_line = anchor_line;
                        self.original_column = anchor_column;
                        self.mark_anchor(name);
                        self.original_line = resume.0;
                        self.original_column = resume.1;
                    }
                    self.generated_column += 1;
                }
            }
            return;
        }
        let mut characters = text.chars().peekable();
        while let Some(character) = characters.next() {
            if character == '\n' {
                self.newline();
                if characters.peek().is_some_and(|next| *next != '\n') {
                    self.original_line = anchor_line;
                    self.original_column = anchor_column;
                    self.mark_anchor(name);
                    self.original_line = resume.0;
                    self.original_column = resume.1;
                }
            } else {
                if characters.peek().is_none_or(|next| *next == '\n') {
                    self.original_line = anchor_line;
                    self.original_column = anchor_column;
                    self.mark_anchor(name);
                    self.original_line = resume.0;
                    self.original_column = resume.1;
                }
                self.generated_column += character.len_utf16() as i64;
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
    /// A generated range or a removed range was the last piece, so the next
    /// original range must explicitly resume identity mapping even in boundary
    /// mode. A removal emits no text but still ends the preceding identity span:
    /// without the resumption the span would interpolate across the removed
    /// range, and composition would project the removed range's boundaries into
    /// generated columns the line no longer has.
    generated_tail: bool,
    /// The current generated position follows verbatim original text, so bare
    /// marks inserted within that run inherit its identity-tail semantics.
    identity_tail: bool,
    /// Input offset the last copied range stopped at. A span left open where the
    /// output ends only overshoots if its input line continues past this point;
    /// a copy that reached a line break or the end of the source leaves nothing
    /// for composition to project.
    span_end: usize,
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
                    // A relocated range maps from somewhere else, so the span the
                    // previous range opened has to end here. Without the boundary the
                    // span keeps interpolating, and composition projects the skipped
                    // input's boundaries into this range's generated columns.
                    let relocated = *start != self.cursor;
                    if relocated {
                        self.reposition(*start);
                    }
                    let text = &self.source[*start..*end];
                    if (self.generated_tail || relocated) && !self.line && !text.is_empty() {
                        self.map.mark_resume();
                    }
                    self.generated_tail = false;
                    self.code.push_str(text);
                    self.map.copied(text, self.character, !self.line);
                    self.identity_tail |= !text.is_empty();
                    if !text.is_empty() {
                        self.span_end = *end;
                    }
                    self.cursor = *end;
                }
                Piece::Mark { origin } => {
                    // A mark inside a verbatim run shares that run's identity span. A
                    // relocated mark does not: it points somewhere else, and no text
                    // follows it from there, so it stays a plain boundary point.
                    let relocated = *origin != self.cursor;
                    if relocated {
                        self.reposition(*origin);
                        self.cursor = *origin;
                    }
                    if self.identity_tail && !relocated && !self.line {
                        self.map.mark_identity(None);
                    } else {
                        self.map.mark();
                    }
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
                        self.identity_tail = false;
                    }
                }
                Piece::Generated {
                    text,
                    start,
                    end,
                    mapping,
                    names: piece_names,
                } => {
                    let relocated = *start != self.cursor;
                    if relocated {
                        self.reposition(*start);
                    }
                    let anchor = (self.map.original_line, self.map.original_column);
                    let name = (!self.line)
                        .then(|| {
                            piece_names
                                .first()
                                .map(|name| intern(&mut self.names, &mut self.name_ids, name))
                        })
                        .flatten();
                    // These policies describe the piece's own text. With no text there
                    // is nothing to anchor: opening a span at the replaced range's
                    // start would pin the source that follows the removal to a position
                    // the output dropped. A removal is mapped by the resumption that
                    // follows it instead, whichever policy asked for it.
                    if !self.line
                        && !text.is_empty()
                        && matches!(
                            mapping,
                            MappingPolicy::AnchorStart
                                | MappingPolicy::AnchorBoundaries
                                | MappingPolicy::Identity
                        )
                    {
                        if *mapping == MappingPolicy::AnchorStart {
                            self.map.mark_anchor(name);
                        } else if *mapping == MappingPolicy::Identity {
                            self.map.mark_identity(name);
                        } else {
                            self.map.mark_name(name);
                        }
                    }
                    self.map.removed(&self.source[*start..*end]);
                    self.code.push_str(text);
                    // An empty generated piece occupies no generated range. Emitting an
                    // unmapped segment for it can suppress the mapped source piece that
                    // resumes at the same generated column.
                    if !self.line && !text.is_empty() && *mapping == MappingPolicy::Sourceless {
                        self.map.unmapped();
                    }
                    if !self.line && *mapping == MappingPolicy::AnchorStart {
                        self.map.generated_anchored(text, anchor.0, anchor.1, name);
                    } else {
                        self.map.generated(text);
                    }
                    // Text of its own, a removed range, or a bare reposition: each
                    // leaves the mapping somewhere other than where the previous range
                    // ended, so the next original range has to resume explicitly.
                    self.generated_tail |= !text.is_empty() || *end > *start || relocated;
                    if !text.is_empty() {
                        self.identity_tail = false;
                    }
                    // The closing boundary belongs to this piece's text. With no text
                    // there is none to close, and emitting one here would leave the
                    // removal describing a boundary where every other policy leaves an
                    // identity span for composition to project through.
                    // The closing boundary belongs to this piece's text. With no text
                    // there is none to close, and emitting one here would leave the
                    // removal describing a boundary where every other policy leaves an
                    // identity span for composition to project through.
                    if !self.line && !text.is_empty() && *mapping == MappingPolicy::AnchorBoundaries
                    {
                        self.map.mark();
                    }
                    if *mapping == MappingPolicy::Identity && !text.is_empty() {
                        // The identity span this piece opens describes its own text, so
                        // it ends where that text ends rather than where the input does.
                        // An empty piece opens no span, and must not move the position
                        // that bounds the one already open.
                        self.span_end = *start;
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
        generated_tail: false,
        identity_tail: false,
        span_end: 0,
    };
    renderer.pieces(pieces);
    // An identity span left open where the output stops keeps interpolating, and
    // composition projects the rest of its input line into generated columns the
    // output never reaches. Nothing follows that could carry the boundary, so close
    // it here. A span that ended at a line break needs nothing: mappings do not
    // interpolate across generated lines.
    let input_continues = renderer.source[renderer.span_end..]
        .chars()
        .next()
        .is_some_and(|next| next != '\n');
    if renderer.map.open_identity
        && input_continues
        && !renderer.line
        && renderer.map.generated_column > 0
    {
        renderer.map.close_span();
    }
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
        last_generated_line: renderer.map.generated_line as u32,
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
    let _: Result<(), std::convert::Infallible> = visit_decoded(mappings, |line, segment| {
        lines.resize_with(line as usize + 1, Vec::new);
        lines[line as usize].push(segment);
        Ok(())
    });
    lines
}

fn visit_decoded<E>(
    mappings: &str,
    mut visit: impl FnMut(u32, Segment) -> Result<(), E>,
) -> Result<(), E> {
    let (mut source, mut original_line, mut original_column, mut name) = (0, 0, 0, 0);
    for (generated_line, encoded_line) in mappings.split(';').enumerate() {
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
            if cursor == bytes.len() {
                if let Ok(generated_column) = u32::try_from(generated_column) {
                    visit(
                        generated_line as u32,
                        Segment {
                            generated_column,
                            source: 0,
                            original_line: u32::MAX,
                            original_column: u32::MAX,
                            name: 0,
                        },
                    )?;
                }
                continue;
            }
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
            visit(
                generated_line as u32,
                Segment {
                    generated_column,
                    source,
                    original_line,
                    original_column,
                    name,
                },
            )?;
        }
    }
    Ok(())
}

#[cfg(test)]
pub(crate) fn decoded_generated_columns(mappings: &str) -> Vec<Vec<u32>> {
    decode(mappings)
        .into_iter()
        .map(|line| {
            line.into_iter()
                .map(|segment| segment.generated_column)
                .collect()
        })
        .collect()
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
                .map(|segment| {
                    let unmapped = || Segment {
                        generated_column: segment.generated_column,
                        source: 0,
                        original_line: u32::MAX,
                        original_column: u32::MAX,
                        name: 0,
                    };
                    if segment.original_line == u32::MAX {
                        return unmapped();
                    }
                    let Some(inner_line) = inner_lines.get(segment.original_line as usize) else {
                        return unmapped();
                    };
                    // Segments are emitted in generated-column order. Looking up the closest
                    // preceding inner segment used to scan backwards from the end for every
                    // outer segment, making composition quadratic for dense, single-line maps
                    // (a common shape for prebundled dependencies). `partition_point` keeps the
                    // same greatest-lower-bound behavior in logarithmic time.
                    let traced_index = inner_line
                        .partition_point(|inner| inner.generated_column <= segment.original_column);
                    let Some(traced) = traced_index
                        .checked_sub(1)
                        .and_then(|index| inner_line.get(index))
                    else {
                        return unmapped();
                    };
                    if traced.original_line == u32::MAX {
                        return unmapped();
                    }
                    let delta = segment.original_column - traced.generated_column;
                    let bounded_by_next = inner_line.get(traced_index).is_some_and(|next| {
                        next.source == traced.source
                            && next.original_line == traced.original_line
                            && next.original_column >= traced.original_column
                            && delta <= next.original_column - traced.original_column
                    });
                    let identity_tail = inner_line.get(traced_index).is_none()
                        && traced.generated_column == traced.original_column;
                    Segment {
                        generated_column: segment.generated_column,
                        source: traced.source,
                        original_line: traced.original_line,
                        original_column: traced.original_column
                            + if bounded_by_next || identity_tail {
                                delta
                            } else {
                                0
                            },
                        name: if traced.name != 0 {
                            traced.name + outer_name_count
                        } else if segment.name != 0 {
                            segment.name
                        } else {
                            0
                        },
                    }
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
/// Layout (little-endian u32 words): `[name_count, segments_word_offset, last_generated_line,
/// name byte lengths...]`, then the concatenated UTF-8 name slab padded to a word
/// boundary, then five words per segment (generated line, generated column,
/// original line, original column, name id + 1).
mod decoded;

pub(crate) use decoded::{
    DecodedLayer, DecodedMapError, compose_decoded_layers, compose_layer_chain,
    compose_layer_chain_with_input, pack_decoded_layer,
};

#[cfg(test)]
pub(crate) use decoded::ResidentBudgetOverride;

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
    fn decoded_chain_composition_preserves_boundaries_lost_by_vlq_composition() {
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
        let legacy = compose(&second_mappings, &first_mappings, second_names.len() as u32);
        assert_ne!(chained_mappings, legacy);
        let decoded = decode(&chained_mappings);
        let preserved_first_name = decoded
            .iter()
            .flatten()
            .find(|segment| segment.name == 2)
            .expect("the first layer's named boundary should survive");
        assert_eq!(preserved_first_name.generated_column, 6);
        assert!(decoded.iter().flatten().any(|segment| segment.name == 1));
        let mut expected_names = second_names;
        expected_names.extend(first_names);
        assert_eq!(chained_names, expected_names);
    }

    #[test]
    fn decoded_composition_preserves_anchor_start_tails() {
        let source = "value;";
        let first_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 0,
                end: 5,
                content: Some("value.default".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let second_pieces = build(
            &intermediate,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 6,
                end: 13,
                content: Some("default".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, second_layer) = render_decoded(&intermediate, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        let segment = lines[0]
            .iter()
            .find(|segment| segment.generated_column == 6)
            .unwrap();
        assert_eq!(segment.original_column, 0);
    }

    #[test]
    fn decoded_composition_anchors_every_generated_replacement_column() {
        let source = "xxabcdefgh;";
        for replacement_len in 1usize..=12 {
            let replacement = "z".repeat(replacement_len);
            let first_pieces = build(
                source,
                vec![EditCommand {
                    kind: EditKind::Replace,
                    start: 2,
                    end: 10,
                    content: Some(replacement.clone()),
                    parts: Vec::new(),
                    destination: None,
                    mapping: Some(MappingPolicy::AnchorStart),
                    order: Some(0),
                    names: Some(vec!["binding".into()]),
                }],
            )
            .unwrap();
            let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
            for interior in 0..replacement_len {
                let offset = 2 + interior;
                let second_pieces = build(
                    &intermediate,
                    vec![EditCommand {
                        kind: EditKind::AddSourceMapLocation,
                        start: offset as u32,
                        end: offset as u32,
                        content: None,
                        parts: Vec::new(),
                        destination: None,
                        mapping: None,
                        order: Some(0),
                        names: None,
                    }],
                )
                .unwrap();
                let (_, second_layer) = render_decoded(&intermediate, &second_pieces, "boundary");
                let (mappings, names) =
                    compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()])
                        .unwrap();
                let lines = decode(&mappings);
                let segment = lines[0]
                    .iter()
                    .find(|segment| segment.generated_column == offset as u32)
                    .unwrap();
                assert_eq!(
                    segment.original_column, 2,
                    "replacement length {replacement_len}, interior {interior}"
                );
                assert_eq!(segment.name, 1);
                assert_eq!(names, ["binding"]);
            }
        }
    }

    #[test]
    fn decoded_composition_preserves_anchors_derived_from_sparse_tails() {
        let inner = pack_decoded_layer(&[0, 2, 0, 0, 0], &[] as &[String], 0);
        let middle = pack_decoded_layer(&[0, 0, 0, 5, 0], &[] as &[String], 0);
        let outer = pack_decoded_layer(&[0, 0, 0, 4, 0], &[] as &[String], 0);
        let (mappings, _) =
            compose_layer_chain(&[inner.as_slice(), middle.as_slice(), outer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        assert_eq!(lines[0][0].original_column, 0);
    }

    #[test]
    fn decoded_anchor_start_maps_each_generated_line() {
        let source = "value;";
        let pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 0,
                end: 5,
                content: Some("first\nsecond".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, layer) = render_decoded(source, &pieces, "boundary");
        let (mappings, _) = compose_layer_chain(&[layer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        assert_eq!(lines[1][0].generated_column, 0);
        assert_eq!(lines[1][0].original_line, 0);
        assert_eq!(lines[1][0].original_column, 0);

        let intermediate = "first\nsecond;";
        let second_pieces = build(
            intermediate,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 6,
                end: 12,
                content: Some("second".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, second_layer) = render_decoded(intermediate, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[layer.as_slice(), second_layer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        assert_eq!(lines[1][0].original_line, 0);
        assert_eq!(lines[1][0].original_column, 0);
    }

    #[test]
    fn decoded_composition_interpolates_shifted_identity_tails() {
        let source = "value;";
        let first_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Prefix,
                start: 0,
                end: 0,
                content: Some("prefix".into()),
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let second_pieces = build(
            &intermediate,
            vec![
                EditCommand {
                    kind: EditKind::AddSourceMapLocation,
                    start: 0,
                    end: 0,
                    content: None,
                    parts: Vec::new(),
                    destination: None,
                    mapping: None,
                    order: Some(0),
                    names: None,
                },
                EditCommand {
                    kind: EditKind::AddSourceMapLocation,
                    start: 6,
                    end: 6,
                    content: None,
                    parts: Vec::new(),
                    destination: None,
                    mapping: None,
                    order: Some(1),
                    names: None,
                },
                EditCommand {
                    kind: EditKind::Replace,
                    start: 8,
                    end: 9,
                    content: Some("l".into()),
                    parts: Vec::new(),
                    destination: None,
                    mapping: Some(MappingPolicy::AnchorStart),
                    order: Some(2),
                    names: None,
                },
            ],
        )
        .unwrap();
        let (_, second_layer) = render_decoded(&intermediate, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        let segment = lines[0]
            .iter()
            .find(|segment| segment.generated_column == 8)
            .unwrap();
        assert_eq!(segment.original_column, 2);
    }

    #[test]
    fn decoded_composition_resumes_identity_after_anchor_start() {
        let source = "value + keep;";
        let first_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Replace,
                start: 0,
                end: 5,
                content: Some("_ui.value".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::AnchorStart),
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let second_pieces = build(
            &intermediate,
            vec![EditCommand {
                kind: EditKind::AddSourceMapLocation,
                start: 12,
                end: 12,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, second_layer) = render_decoded(&intermediate, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        let lines = decode(&mappings);
        let segment = lines[0]
            .iter()
            .find(|segment| segment.generated_column == 12)
            .unwrap();
        assert_eq!(segment.original_column, 8);
    }

    #[test]
    fn decoded_composition_keeps_identity_across_interior_marks() {
        let source = "value;";
        let first_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Prefix,
                start: 0,
                end: 0,
                content: Some("prefix".into()),
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let marked = build(
            &intermediate,
            vec![EditCommand {
                kind: EditKind::AddSourceMapLocation,
                start: 8,
                end: 8,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, middle_layer) = render_decoded(&intermediate, &marked, "boundary");
        let outer = build(
            &intermediate,
            vec![EditCommand {
                kind: EditKind::AddSourceMapLocation,
                start: 9,
                end: 9,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (_, outer_layer) = render_decoded(&intermediate, &outer, "boundary");
        let (mappings, _) = compose_layer_chain(&[
            first_layer.as_slice(),
            middle_layer.as_slice(),
            outer_layer.as_slice(),
        ])
        .unwrap();
        let lines = decode(&mappings);
        let segment = lines[0]
            .iter()
            .find(|segment| segment.generated_column == 9)
            .unwrap();
        assert_eq!(segment.original_column, 3);
    }

    fn mark_command(offset: u32, order: u32) -> EditCommand {
        EditCommand {
            kind: EditKind::AddSourceMapLocation,
            start: offset,
            end: offset,
            content: None,
            parts: Vec::new(),
            destination: None,
            mapping: None,
            order: Some(order),
            names: None,
        }
    }

    /// Deterministic xorshift, so the sweep below is reproducible.
    fn sweep_random(seed: &mut u64, bound: usize) -> usize {
        *seed ^= *seed << 13;
        *seed ^= *seed >> 7;
        *seed ^= *seed << 17;
        (*seed % bound.max(1) as u64) as usize
    }

    fn sweep_edit(seed: &mut u64, source: &str, order: u32) -> EditCommand {
        let start = sweep_random(seed, source.len() + 1);
        let end = start + sweep_random(seed, source.len() - start + 1);
        let (start, end) = (
            (0..=start)
                .rev()
                .find(|at| source.is_char_boundary(*at))
                .unwrap_or(0) as u32,
            (end..=source.len())
                .find(|at| source.is_char_boundary(*at))
                .unwrap_or(source.len()) as u32,
        );
        let (kind, content, mapping, destination) = match sweep_random(seed, 10) {
            // A removal, the shape that leaves an identity span open.
            0 | 1 => (EditKind::Replace, Some(String::new()), None, None),
            2 => (
                EditKind::Replace,
                Some("rewritten".into()),
                Some(MappingPolicy::AnchorStart),
                None,
            ),
            3 => (
                EditKind::AppendLeft,
                Some("/* added */".into()),
                Some(MappingPolicy::Sourceless),
                None,
            ),
            4 => (
                EditKind::PrependRight,
                Some("inserted\n".into()),
                Some(MappingPolicy::Sourceless),
                None,
            ),
            5 => (EditKind::AddSourceMapLocation, None, None, None),
            6 => (
                EditKind::Replace,
                Some("kept".into()),
                Some(MappingPolicy::Identity),
                None,
            ),
            7 => (
                EditKind::Replace,
                Some("bounded".into()),
                Some(MappingPolicy::AnchorBoundaries),
                None,
            ),
            8 => (EditKind::Remove, None, None, None),
            _ => (
                EditKind::Move,
                None,
                None,
                Some(sweep_random(seed, source.len() + 1) as u32),
            ),
        };
        EditCommand {
            kind,
            start,
            end: if kind == EditKind::AddSourceMapLocation {
                start
            } else {
                end
            },
            content,
            parts: Vec::new(),
            destination: destination.map(|at| {
                (0..=at as usize)
                    .rev()
                    .find(|to| source.is_char_boundary(*to))
                    .unwrap_or(0) as u32
            }),
            mapping,
            order: Some(order),
            names: None,
        }
    }

    /// Every mapping a composed map holds must address a generated column its own
    /// output reaches. Composition projects an inner layer's boundaries through the
    /// outer layer's identity spans, so any span the outer layer leaves open past the
    /// end of its line resurfaces here as a column the line does not have.
    #[test]
    fn composed_columns_stay_inside_their_generated_line() {
        for source in [
            "const alpha = 1; const beta = 2;\nconst gamma = 3; const delta = 4;\nlet epsilon = alpha + beta + gamma + delta;\n",
            // A dense single line, the shape a prebundled dependency produces.
            "const values=[alpha,beta,gamma,delta,epsilon,zeta,eta,theta];",
            // No trailing newline, and one line that holds nothing.
            "let first = 1;\n\nlet second = first;",
        ] {
            for seed in [
                0x2545_f491_4f6c_dd1du64,
                0x9e37_79b9_7f4a_7c15,
                0xdead_beef_1234_5678,
            ] {
                for mode in ["boundary", "character", "line"] {
                    composed_columns_sweep(source, seed, mode);
                }
            }
        }
    }

    fn composed_columns_sweep(source: &str, args_seed: u64, mode: &str) {
        let marks = source
            .char_indices()
            .filter(|(offset, character)| {
                character.is_alphabetic() && !source[..*offset].ends_with(char::is_alphabetic)
            })
            .enumerate()
            .map(|(order, (offset, _))| mark_command(offset as u32, order as u32))
            .collect();
        let first_pieces = build(source, marks).unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, mode);

        let mut seed = args_seed;
        let mut checked = 0;
        for case in 0..600 {
            // Two edited phases on top of the marking phase, so the invariant is
            // checked against an accumulated map rather than a single composition.
            let mut layers = vec![first_layer.clone()];
            let mut current = intermediate.clone();
            for phase in 0..3 {
                let edits = (0..1 + sweep_random(&mut seed, 3) as u32)
                    .map(|order| sweep_edit(&mut seed, &current, order))
                    .collect();
                // Overlapping or conflicting edits are rejected by construction; the
                // sweep is only interested in the ones that render.
                let Ok(pieces) = build(&current, edits) else {
                    continue;
                };
                checked += 1;
                let (code, layer) = render_decoded(&current, &pieces, mode);
                // The two sinks must describe one layer identically: only the decoded
                // one can revisit a segment it already emitted, so a rule that rewrites
                // one has to leave the encoded form alone.
                let (_, direct, _) = render(&current, &pieces, mode);
                let (own, _) = compose_layer_chain(&[layer.as_slice()]).unwrap();
                assert_eq!(own, direct, "case {case} phase {phase}: {mode} sink parity");
                current = code;
                layers.push(layer);
                let slices: Vec<&[u8]> = layers.iter().map(Vec::as_slice).collect();
                let (mappings, _) = compose_layer_chain(&slices).unwrap();
                // Every original position must at least name a line the source has.
                // The column can still overshoot that line: an identity span
                // interpolates until an explicit boundary, and the packed layer format
                // carries no input line extent to stop it at. Bounding that needs the
                // explicit mapping runs the rearchitecture plan describes.
                let source_lines = source.split('\n').count() as u32;
                for segment in decode(&mappings)
                    .iter()
                    .flatten()
                    .filter(|segment| segment.original_line != u32::MAX)
                {
                    assert!(
                        segment.original_line < source_lines,
                        "case {case} phase {phase} ({mode}): original line {} of {source_lines}\nmappings {mappings}",
                        segment.original_line,
                    );
                }
                let lines: Vec<&str> = current.split('\n').collect();
                for (index, columns) in decoded_generated_columns(&mappings).iter().enumerate() {
                    let length = lines.get(index).map_or(0, |line| {
                        line.chars().map(char::len_utf16).sum::<usize>() as u32
                    });
                    for column in columns {
                        assert!(
                            *column <= length,
                            "case {case} phase {phase} ({mode}): column {column} on line {index} of length {length}\ncode {current:?}\npieces {pieces:?}\nmappings {mappings}"
                        );
                    }
                }
            }
        }
        assert!(checked > 600, "only {checked} phases rendered");
    }

    /// Mark every identifier start, then remove `range`, and report the composed
    /// mapping alongside the code it describes.
    fn removal_case(source: &str, range: std::ops::Range<usize>) -> (String, Vec<Vec<u32>>) {
        let marks = source
            .char_indices()
            .filter(|(offset, character)| {
                character.is_alphabetic() && !source[..*offset].ends_with(char::is_alphabetic)
            })
            .enumerate()
            .map(|(order, (offset, _))| mark_command(offset as u32, order as u32))
            .collect();
        let first_pieces = build(source, marks).unwrap();
        let (intermediate, first_layer) = render_decoded(source, &first_pieces, "boundary");
        assert_eq!(intermediate, source, "the marking phase must not edit code");
        let second_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Remove,
                start: range.start as u32,
                end: range.end as u32,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (code, second_layer) = render_decoded(source, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        (code, decoded_generated_columns(&mappings))
    }

    #[test]
    fn a_removal_closes_the_identity_span_it_interrupts() {
        // An earlier phase leaves explicit boundaries across a line; a later phase
        // removes a range covering some of them. Composition projects earlier
        // boundaries through identity spans, so the removal has to end the span it
        // interrupts. Otherwise the removed range's boundaries land on generated
        // columns the output no longer has, and a reverse lookup resolves to a source
        // position that was deleted.
        //
        // Every shape of removal has to close it, including the ones with no later
        // piece to carry the boundary.
        let source = "const kept = 1; const dropped = 2;\nconst second = 3;\nconst third = 4;\n";
        let line_end = source.find('\n').unwrap();
        let last_line = source.rfind("const third").unwrap();
        for (description, range) in [
            ("a line tail, with the newline retained", 15..line_end),
            ("a line tail through its newline", 15..line_end + 1),
            ("the middle of a line", 6..15),
            ("a whole final line", last_line..source.len()),
            ("the middle of a line through EOF", 15..source.len()),
            ("a retained prefix through EOF", 5..source.len()),
            ("everything after the first character", 1..source.len()),
        ] {
            let (code, columns) = removal_case(source, range.clone());
            for (index, line) in code.split('\n').enumerate() {
                let length = line.chars().map(char::len_utf16).sum::<usize>() as u32;
                let mapped = columns.get(index).map_or(&[][..], Vec::as_slice);
                assert!(
                    mapped.iter().all(|column| *column <= length),
                    "removing {description} ({range:?}) mapped {mapped:?} on line {index} of length {length}\ncode {code:?}"
                );
            }
            // The retained prefix still traces to where it came from.
            if range.start > 6 {
                assert!(
                    columns[0].contains(&6),
                    "removing {description} lost the boundary at column 6: {:?}",
                    columns[0]
                );
            }
        }
    }

    /// Mapped `(generated column, original column)` pairs on the first generated line.
    fn removal_points(source: &str, range: std::ops::Range<usize>) -> (String, Vec<(u32, u32)>) {
        let marks = source
            .char_indices()
            .filter(|(offset, character)| {
                character.is_alphabetic() && !source[..*offset].ends_with(char::is_alphabetic)
            })
            .enumerate()
            .map(|(order, (offset, _))| mark_command(offset as u32, order as u32))
            .collect();
        let first_pieces = build(source, marks).unwrap();
        let (_, first_layer) = render_decoded(source, &first_pieces, "boundary");
        let second_pieces = build(
            source,
            vec![EditCommand {
                kind: EditKind::Remove,
                start: range.start as u32,
                end: range.end as u32,
                content: None,
                parts: Vec::new(),
                destination: None,
                mapping: None,
                order: Some(0),
                names: None,
            }],
        )
        .unwrap();
        let (code, second_layer) = render_decoded(source, &second_pieces, "boundary");
        let (mappings, _) =
            compose_layer_chain(&[first_layer.as_slice(), second_layer.as_slice()]).unwrap();
        let points = decode(&mappings)
            .first()
            .map(|line| {
                line.iter()
                    .map(|segment| (segment.generated_column, segment.original_column))
                    .collect()
            })
            .unwrap_or_default();
        (code, points)
    }

    #[test]
    fn an_empty_replacement_maps_like_a_removal_whatever_its_policy() {
        // A replacement whose text is empty removes source and generates nothing, so
        // every policy has to describe it the same way. Anchoring it would pin the
        // source that follows to the start of the range that was deleted.
        let source = "const kept = 1; const gone = 2; const after = 3;\n";
        let start = source.find(" const gone").unwrap() as u32;
        let end = source.find(" const after").unwrap() as u32;
        let removal = |mapping: Option<MappingPolicy>, kind: EditKind| {
            let pieces = build(
                source,
                vec![EditCommand {
                    kind,
                    start,
                    end,
                    content: Some(String::new()),
                    parts: Vec::new(),
                    destination: None,
                    mapping,
                    order: Some(0),
                    names: None,
                }],
            )
            .unwrap();
            // Compare the packed layer rather than the encoded mappings: the final VLQ
            // strips span behaviour, so an identity span degraded to a plain boundary
            // would look identical there and only diverge once composed through.
            render_decoded(source, &pieces, "boundary").1
        };
        let expected = removal(None, EditKind::Remove);
        for policy in [
            MappingPolicy::Sourceless,
            MappingPolicy::AnchorStart,
            MappingPolicy::AnchorBoundaries,
            MappingPolicy::Identity,
        ] {
            assert_eq!(
                removal(Some(policy), EditKind::Replace),
                expected,
                "{policy:?} described an empty replacement differently from a removal"
            );
        }
    }

    #[test]
    fn a_removal_at_end_of_output_closes_the_same_span_as_one_followed_by_source() {
        // Both removals drop the same range. One keeps the following newline, so a later
        // original piece carries the resumption; the other reaches EOF with nothing
        // after it. Closing the span cannot depend on that: neither may leave a mapping
        // that traces into the range it deleted.
        let source = "const kept = 1; const dropped = 2;\n";
        let removed = source.find(" const dropped").unwrap() as u32;
        let (followed_code, followed) = removal_points(source, removed as usize..source.len() - 1);
        let (eof_code, eof) = removal_points(source, removed as usize..source.len());
        assert_eq!(followed_code, "const kept = 1;\n");
        assert_eq!(eof_code, "const kept = 1;");
        // The retained prefix traces identically either way.
        let retained = |points: &[(u32, u32)]| -> Vec<(u32, u32)> {
            points
                .iter()
                .copied()
                .filter(|(generated, _)| *generated < removed)
                .collect()
        };
        assert_eq!(retained(&followed), retained(&eof));
        assert!(retained(&eof).contains(&(6, 6)));
        // Nothing maps into the interior of the deleted range. The resumption may name
        // the position just past it: that is where the retained text resumes.
        for (case, points, end) in [
            ("followed", &followed, source.len() as u32 - 1),
            ("eof", &eof, source.len() as u32),
        ] {
            assert!(
                points
                    .iter()
                    .all(|(_, original)| *original <= removed || *original >= end),
                "{case}: {points:?} traces into the removed range {removed}..{end}"
            );
        }
    }

    #[test]
    fn line_mode_stays_line_granular_over_a_token_detailed_layer() {
        // Native codegen layers carry one segment per printed token whatever mode the
        // caller asked for, so `line` mode must not describe its copies as identity
        // spans: composition would project every codegen token into the output.
        let source = "const alpha = 1; const beta = 2;";
        let codegen = pack_decoded_layer(
            &[
                0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 14, 0, 14, 0, 0, 17, 0, 17, 0, 0, 23, 0, 23, 0, 0,
                30, 0, 30, 0,
            ],
            &[] as &[String],
            0,
        );
        let pieces = build(source, vec![mark_command(6, 0)]).unwrap();
        for (mode, expected) in [
            // The line start, plus the explicit location the phase asked for.
            ("line", vec![0, 6]),
            ("boundary", vec![0, 5, 6, 14, 17, 23, 30, 31]),
        ] {
            let (_, layer) = render_decoded(source, &pieces, mode);
            let (mappings, _) =
                compose_layer_chain(&[codegen.as_slice(), layer.as_slice()]).unwrap();
            assert_eq!(
                decoded_generated_columns(&mappings)[0],
                expected,
                "mode {mode}"
            );
        }
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
    fn named_identity_survives_both_edit_build_paths() {
        for deferred_copy in [false, true] {
            let source = "1; 2;";
            let mut edits = vec![EditCommand {
                kind: EditKind::Replace,
                start: 0,
                end: 1,
                content: Some("1".into()),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Identity),
                order: Some(0),
                names: Some(vec!["label".into()]),
            }];
            if deferred_copy {
                edits.push(EditCommand {
                    kind: EditKind::Replace,
                    start: 3,
                    end: 4,
                    content: None,
                    parts: vec![crate::edit::RawContentPart::Copy { start: 0, end: 1 }],
                    destination: None,
                    mapping: Some(MappingPolicy::Sourceless),
                    order: Some(1),
                    names: None,
                });
            }
            let pieces = build(source, edits).unwrap();
            let (code, mappings, names) = render(source, &pieces, "boundary");
            assert_eq!(code, if deferred_copy { "1; 1;" } else { source });
            assert_eq!(names, ["label"]);
            let point = decode(&mappings)[0][0];
            assert_eq!(
                (point.original_line, point.original_column, point.name),
                (0, 0, 1)
            );
        }
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
