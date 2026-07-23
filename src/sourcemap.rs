use crate::editor::{ByteEdit, MappingPolicy};
use rustc_hash::FxHashMap;

enum Piece<'a> {
    Original {
        text: &'a str,
    },
    Generated {
        text: &'a str,
        removed: &'a str,
        mapping: MappingPolicy,
        names: &'a [String],
        mark_only: bool,
    },
}

fn for_each_piece<'a>(source: &'a str, edits: &'a [ByteEdit], mut visit: impl FnMut(Piece<'a>)) {
    let mut cursor = 0;
    for edit in edits {
        visit(Piece::Original {
            text: &source[cursor..edit.start],
        });
        visit(Piece::Generated {
            text: &edit.content,
            removed: &source[edit.start..edit.end],
            mapping: edit.mapping,
            names: &edit.names,
            mark_only: edit.mark_only,
        });
        cursor = edit.end;
    }
    visit(Piece::Original {
        text: &source[cursor..],
    });
}

#[derive(Debug, Clone, Copy)]
struct Segment {
    generated_column: i64,
    source: i64,
    original_line: i64,
    original_column: i64,
    name: Option<i64>,
}

fn vlq(mut value: i64, output: &mut String) {
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

#[derive(Default)]
struct StreamingMap {
    mappings: String,
    generated_line: usize,
    generated_column: i64,
    original_line: i64,
    original_column: i64,
    previous_source: i64,
    previous_original_line: i64,
    previous_original_column: i64,
    previous_name: i64,
    previous_generated_column: i64,
    line_has_segment: bool,
    last_mark: Option<(usize, i64)>,
}

impl StreamingMap {
    fn mark(&mut self) {
        self.mark_name(None);
    }
    fn mark_name(&mut self, name: Option<i64>) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            return;
        }
        if self.line_has_segment {
            self.mappings.push(',');
        }
        vlq(
            self.generated_column - self.previous_generated_column,
            &mut self.mappings,
        );
        vlq(-self.previous_source, &mut self.mappings);
        vlq(
            self.original_line - self.previous_original_line,
            &mut self.mappings,
        );
        vlq(
            self.original_column - self.previous_original_column,
            &mut self.mappings,
        );
        if let Some(name) = name {
            vlq(name - self.previous_name, &mut self.mappings);
            self.previous_name = name;
        }
        self.previous_source = 0;
        self.previous_original_line = self.original_line;
        self.previous_original_column = self.original_column;
        self.previous_generated_column = self.generated_column;
        self.line_has_segment = true;
        self.last_mark = Some((self.generated_line, self.generated_column));
    }
    fn mark_ascii_identity(&mut self) {
        if self.last_mark == Some((self.generated_line, self.generated_column)) {
            return;
        }
        if self.line_has_segment
            && self.previous_source == 0
            && self.original_line == self.previous_original_line
            && self.generated_column - self.previous_generated_column == 1
            && self.original_column - self.previous_original_column == 1
        {
            self.mappings.push_str(",CAAC");
            self.previous_generated_column = self.generated_column;
            self.previous_original_column = self.original_column;
            self.last_mark = Some((self.generated_line, self.generated_column));
        } else {
            self.mark();
        }
    }
    fn newline(&mut self) {
        self.mappings.push(';');
        self.generated_line += 1;
        self.generated_column = 0;
        self.previous_generated_column = 0;
        self.line_has_segment = false;
    }
    fn copied(&mut self, text: &str, character: bool) {
        if text.is_ascii() {
            for byte in text.bytes() {
                if character {
                    self.mark_ascii_identity();
                } else if self.generated_column == 0 {
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

pub fn render(source: &str, edits: &[ByteEdit], mode: &str) -> (String, String, Vec<String>) {
    let mut code = String::with_capacity(source.len());
    let mut map = StreamingMap {
        mappings: String::with_capacity(if mode == "character" {
            source.len() * 5
        } else {
            source.len() / 16
        }),
        ..StreamingMap::default()
    };
    let character = mode == "character";
    let mut names = Vec::<String>::new();
    let mut name_ids = FxHashMap::<String, i64>::default();
    for_each_piece(source, edits, |piece| match piece {
        Piece::Original { text } => {
            code.push_str(text);
            map.copied(text, character);
        }
        Piece::Generated {
            text,
            removed,
            mapping,
            names: piece_names,
            mark_only,
        } => {
            if mark_only {
                map.mark();
            } else if mapping == MappingPolicy::Identity && removed == text {
                code.push_str(text);
                map.copied(text, character);
            } else {
                if mode != "line"
                    && matches!(
                        mapping,
                        MappingPolicy::AnchorStart
                            | MappingPolicy::AnchorBoundaries
                            | MappingPolicy::Identity
                    )
                {
                    let name = piece_names.first().map(|name| {
                        if let Some(index) = name_ids.get(name) {
                            return *index;
                        }
                        let index = names.len() as i64;
                        names.push(name.clone());
                        name_ids.insert(name.clone(), index);
                        index
                    });
                    map.mark_name(name);
                }
                map.removed(removed);
                code.push_str(text);
                map.generated(text);
                if mode != "line" && mapping == MappingPolicy::AnchorBoundaries {
                    map.mark();
                }
            }
        }
    });
    (code, map.mappings, names)
}

pub fn render_code(source: &str, edits: &[ByteEdit]) -> String {
    let added: usize = edits.iter().map(|edit| edit.content.len()).sum();
    let removed: usize = edits.iter().map(|edit| edit.end - edit.start).sum();
    let mut code =
        String::with_capacity(source.len().saturating_add(added).saturating_sub(removed));
    for_each_piece(source, edits, |piece| match piece {
        Piece::Original { text } => code.push_str(text),
        Piece::Generated {
            text, mark_only, ..
        } => {
            if !mark_only {
                code.push_str(text);
            }
        }
    });
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

pub fn compose(outer: &str, inner: &str, outer_name_count: u32) -> String {
    let outer_lines = decode(outer);
    let inner_lines = decode(inner);
    let lines = outer_lines
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
        .collect();
    let composed = MapBuilder { lines };
    composed.encode()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::editor::{EditCommand, EditKind, normalize};
    #[test]
    fn encodes_identity_lines() {
        let (_, map, _) = render("a\nb", &[], "boundary");
        assert_eq!(map, "AAAA;AACA");
    }

    #[test]
    fn composes_two_maps() {
        assert_eq!(compose("AAAA;AACA", "AAAA;AACA", 0), "AAAA;AACA");
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
        let edits = normalize(
            source,
            vec![
                EditCommand {
                    kind: EditKind::PrependRight,
                    start: 0,
                    end: 0,
                    content: Some("/* generated */\n".into()),
                    mapping: Some(MappingPolicy::Sourceless),
                    owner: None,
                    order: Some(0),
                    names: None,
                },
                EditCommand {
                    kind: EditKind::Replace,
                    start: 6,
                    end: 11,
                    content: Some("renamed".into()),
                    mapping: Some(MappingPolicy::AnchorBoundaries),
                    owner: None,
                    order: Some(1),
                    names: Some(vec!["value".into()]),
                },
            ],
        )
        .unwrap();
        let code = render_code(source, &edits);
        let (mapped_code, mappings, names) = render(source, &edits, "boundary");
        assert_eq!(code, mapped_code);
        assert!(!mappings.is_empty());
        assert_eq!(names, ["value"]);
    }

    #[test]
    fn interns_dense_mapping_names_in_first_seen_order() {
        let source = "x ".repeat(1_000);
        let edits = normalize(
            &source,
            (0..1_000)
                .map(|index| EditCommand {
                    kind: EditKind::Replace,
                    start: index * 2,
                    end: index * 2 + 1,
                    content: Some("y".into()),
                    mapping: Some(MappingPolicy::AnchorStart),
                    owner: None,
                    order: Some(index),
                    names: Some(vec![format!("name{index}")]),
                })
                .collect(),
        )
        .unwrap();
        let (_, mappings, names) = render(&source, &edits, "boundary");
        assert!(!mappings.is_empty());
        assert_eq!(names.len(), 1_000);
        assert_eq!(names.first().map(String::as_str), Some("name0"));
        assert_eq!(names.last().map(String::as_str), Some("name999"));
    }
}
