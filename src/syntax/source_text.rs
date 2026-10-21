//! Source-dependent operations live beside native parsing, never in JS heuristics.
use std::cell::OnceCell;

use napi::{
    Error, Result, Status,
    bindgen_prelude::{Buffer, Either, Utf16String},
};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{AstKind, ast::Program};
use oxc_ast_visit::Visit;
use oxc_parser::Parser;
use rustc_hash::{FxHashMap, FxHashSet};

#[napi(object)]
pub struct SourceMatch {
    pub start: u32,
    pub end: u32,
    pub captures: Vec<Utf16String>,
    pub content: Option<Utf16String>,
}

#[napi(object)]
pub struct SourceTextRange {
    pub start: u32,
    pub end: u32,
}

#[napi]
pub struct NativeSourceText {
    source: Utf16String,
    lines: Option<Vec<u32>>,
    identifiers: Option<FxHashSet<String>>,
    uids: UidAllocator,
    utf8: OnceCell<String>,
}

/// Reservations and normalized-hint cursors are independent of how the immutable
/// source answers membership queries. Retained sessions use their existing index;
/// standalone source operations lazily parse and cache identifier names.
#[derive(Default)]
pub(crate) struct UidAllocator {
    reserved: FxHashSet<String>,
    next_suffix: FxHashMap<String, u64>,
}

impl UidAllocator {
    pub(crate) fn generate(
        &mut self,
        name: &str,
        mut contains_identifier: impl FnMut(&str) -> bool,
    ) -> String {
        let hint: String = name
            .chars()
            .filter(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '$'))
            .collect();
        let base = format!("_{}", if hint.is_empty() { "temp" } else { &hint });
        let mut index = self.next_suffix.get(&base).copied().unwrap_or(1);
        let mut uid = if index == 1 {
            base.clone()
        } else {
            format!("{base}{index}")
        };
        index = if index == 1 { 2 } else { index + 1 };
        while contains_identifier(&uid) || self.reserved.contains(&uid) {
            uid = format!("{base}{index}");
            index += 1;
        }
        self.next_suffix.insert(base, index);
        self.reserved.insert(uid.clone());
        uid
    }

    pub(crate) fn memory_usage(&self) -> usize {
        self.reserved.capacity() * size_of::<String>()
            + self.reserved.iter().map(String::capacity).sum::<usize>()
            + self.next_suffix.capacity() * size_of::<(String, u64)>()
            + self.next_suffix.keys().map(String::capacity).sum::<usize>()
    }
}

#[napi]
impl NativeSourceText {
    #[napi(constructor)]
    pub fn new(source: Utf16String) -> Self {
        Self {
            source,
            lines: None,
            identifiers: None,
            uids: UidAllocator::default(),
            utf8: OnceCell::new(),
        }
    }

    #[napi]
    pub fn generate_uid(&mut self, name: String, filename: String) -> Result<String> {
        if self.identifiers.is_none() {
            let source = self.utf8.get_or_init(|| self.source.to_string());
            let allocator = Allocator::default();
            let parsed = Parser::new(
                &allocator,
                source,
                super::classification::source_type(&filename, source)?,
            )
            .parse();
            if !parsed.diagnostics.is_empty() {
                return Err(crate::parse_failure::error(
                    source,
                    &parsed.diagnostics,
                    "generate-uid",
                ));
            }
            self.identifiers = Some(identifier_names(&parsed.program));
        }
        Ok(self.uids.generate(&name, |uid| {
            self.identifiers.as_ref().unwrap().contains(uid)
        }))
    }

    #[napi]
    pub fn whitespace(&self) -> Vec<u32> {
        vec![
            self.source
                .iter()
                .take_while(|&&unit| is_whitespace(unit))
                .count() as u32,
            self.source
                .iter()
                .rev()
                .take_while(|&&unit| is_whitespace(unit))
                .count() as u32,
        ]
    }

    #[napi]
    pub fn indent(&self, prefix: Utf16String) -> Utf16String {
        let mut output = Vec::with_capacity(self.source.len());
        for line in self.source.split_inclusive(|&unit| unit == 10) {
            if line.iter().any(|&unit| !is_whitespace(unit)) {
                output.extend_from_slice(&prefix);
            }
            output.extend_from_slice(line);
        }
        output.into()
    }

    /// The first program insertion at an offset gets a leading newline unless it
    /// starts the file or follows a line break, so it stays on its own line.
    #[napi]
    pub fn needs_line_boundary(&self, offset: u32) -> bool {
        offset > 0 && self.source.get(offset as usize - 1) != Some(&10)
    }

    /// Text and composite payloads use separate typed batches. Results are in
    /// text-first order, followed by composite order, without an outer union.
    ///
    /// A program insertion always ends with a newline. It also gets a semicolon
    /// when it is not a terminated statement, or when it contains a slash, so it
    /// cannot glue onto the next statement or open a comment or a regex. A
    /// composite counts as terminated only when its last part is text that ends
    /// a statement; a slash in any part then still forces the semicolon.
    #[napi]
    pub fn insertion_suffixes(
        &self,
        texts: Vec<Utf16String>,
        composites: Vec<Vec<Either<Utf16String, SourceTextRange>>>,
    ) -> Result<Buffer> {
        let mut separators = Vec::with_capacity(texts.len() + composites.len());
        for text in texts {
            separators.push(u8::from(!terminated_insertion(&text) || text.contains(&47)));
        }
        for parts in composites {
            let terminated =
                matches!(parts.last(), Some(Either::A(text)) if terminated_insertion(text));
            let mut comment_free = true;
            if terminated {
                for part in &parts {
                    let text: &[u16] = match part {
                        Either::A(text) => text,
                        Either::B(range) => self
                            .source
                            .get(range.start as usize..range.end as usize)
                            .ok_or_else(|| {
                                Error::new(Status::InvalidArg, "invalid source range")
                            })?,
                    };
                    if text.contains(&47) {
                        comment_free = false;
                        break;
                    }
                }
            }
            separators.push(u8::from(!terminated || !comment_free));
        }
        Ok(separators.into())
    }

    #[napi]
    pub fn starts_line(&self, offset: u32) -> bool {
        self.source[..(offset as usize).min(self.source.len())]
            .iter()
            .rev()
            .find(|&&unit| !is_whitespace(unit) || matches!(unit, 10 | 13 | 0x2028 | 0x2029))
            .is_none_or(|&unit| matches!(unit, 10 | 13 | 0x2028 | 0x2029))
    }

    /// Inclusive intervals of boundary offsets with only whitespace before them
    /// on their line. A bounded window amortizes nearby comment queries without
    /// scanning an entire source for one sparse query.
    #[napi]
    pub fn line_prefix_intervals(&self, start: u32, end: u32) -> Result<Buffer> {
        let text = self
            .source
            .get(start as usize..end as usize)
            .ok_or_else(|| Error::new(Status::InvalidArg, "invalid source range"))?;
        let mut intervals = Vec::new();
        let mut leading = self.starts_line(start);
        if leading {
            intervals.extend_from_slice(&start.to_le_bytes());
        }
        for (index, &unit) in text.iter().enumerate() {
            let offset = start + index as u32;
            if matches!(unit, 10 | 13 | 0x2028 | 0x2029) {
                if !leading {
                    intervals.extend_from_slice(&(offset + 1).to_le_bytes());
                }
                leading = true;
            } else if leading && !is_whitespace(unit) {
                intervals.extend_from_slice(&offset.to_le_bytes());
                leading = false;
            }
        }
        if leading {
            intervals.extend_from_slice(&end.to_le_bytes());
        }
        Ok(intervals.into())
    }

    #[napi]
    pub fn locations(&mut self, start: u32, end: u32) -> Vec<u32> {
        let lines = self.line_starts();
        let at = |offset| {
            let line = lines.partition_point(|&start| start <= offset);
            [line as u32, offset - lines[line - 1]]
        };
        [at(start), at(end)].concat()
    }

    #[napi]
    pub fn location_offset(&mut self, line: u32, column: u32) -> Result<u32> {
        self.line_starts()
            .get(line.wrapping_sub(1) as usize)
            .map(|start| start + column)
            .ok_or_else(|| Error::new(Status::InvalidArg, "invalid source line"))
    }

    /// Regex execution uses an ECMAScript engine with UTF-16 offsets. JS only
    /// receives match facts and invokes user callbacks; it never searches source.
    #[napi]
    pub fn matches(
        &self,
        search: Utf16String,
        flags: Option<String>,
        all: bool,
        replacement: Option<Utf16String>,
        start: Option<f64>,
    ) -> Result<Vec<SourceMatch>> {
        let text: &[u16] = &self.source;
        let mut output = Vec::new();
        let unicode = flags
            .as_ref()
            .is_some_and(|flags| flags.contains('u') || flags.contains('v'));
        let pattern: Vec<u32> = if flags.is_some() {
            if unicode {
                char::decode_utf16(search.iter().copied())
                    .map(|value| match value {
                        Ok(ch) => u32::from(ch),
                        Err(error) => u32::from(error.unpaired_surrogate()),
                    })
                    .collect()
            } else {
                search.iter().copied().map(u32::from).collect()
            }
        } else {
            search
                .iter()
                .flat_map(|&unit| {
                    let escape = matches!(
                        unit,
                        36 | 40 | 41 | 42 | 43 | 46 | 63 | 91 | 92 | 93 | 94 | 123 | 124 | 125
                    );
                    escape
                        .then_some(92)
                        .into_iter()
                        .chain(std::iter::once(u32::from(unit)))
                })
                .collect()
        };
        // A plain string search is escaped above. Unicode flags decode the pattern
        // and leave an unpaired surrogate as a lone code unit.
        let flags = flags.unwrap_or_default();
        let expression = regress::Regex::from_unicode(pattern.into_iter(), flags.as_str())
            .map_err(|error| Error::new(Status::InvalidArg, error.to_string()))?;
        // ToLength: NaN and negative cursors become zero; positive cursors are
        // truncated. Compare before narrowing so large values cannot wrap.
        let cursor = start.unwrap_or(0.0);
        let cursor = if cursor.is_nan() || cursor < 0.0 {
            0.0
        } else {
            cursor.trunc()
        };
        if cursor > text.len() as f64 {
            return Ok(output);
        }
        let mut offset = cursor as usize;
        while offset <= text.len() {
            let found = if unicode {
                expression.find_from_utf16(text, offset).next()
            } else {
                expression.find_from_ucs2(text, offset).next()
            };
            let Some(found) = found else { break };
            // Sticky matching stops at the first match that does not begin on the
            // cursor, so a later unanchored match is left alone.
            if flags.contains('y') && found.start() != offset {
                break;
            }
            let captures: Vec<Utf16String> = (0..=found.captures.len())
                .map(|i| {
                    found
                        .group(i)
                        .map(|r| text[r].to_vec())
                        .unwrap_or_default()
                        .into()
                })
                .collect();
            let content = replacement
                .as_ref()
                .map(|value| substitute(value, text, &found));
            output.push(SourceMatch {
                start: found.start() as u32,
                end: found.end() as u32,
                captures,
                content,
            });
            if !all {
                break;
            }
            offset = found.end();
            if found.start() == offset {
                offset += if unicode
                    && (0xd800..=0xdbff).contains(text.get(offset).unwrap_or(&0))
                    && (0xdc00..=0xdfff).contains(text.get(offset + 1).unwrap_or(&0))
                {
                    2
                } else {
                    1
                };
            }
        }
        Ok(output)
    }
}

impl NativeSourceText {
    #[cfg(test)]
    pub(crate) fn with_identifiers(
        source: Utf16String,
        identifiers: Option<FxHashSet<String>>,
    ) -> Self {
        Self {
            identifiers,
            ..Self::new(source)
        }
    }

    fn line_starts(&mut self) -> &[u32] {
        self.lines.get_or_insert_with(|| {
            // ECMAScript line terminators, including a single CRLF. Offsets are
            // UTF-16 code units, matching JavaScript source coordinates.
            let mut lines = vec![0];
            let mut index = 0;
            while index < self.source.len() {
                let unit = self.source[index];
                let width = if unit == 13 && self.source.get(index + 1) == Some(&10) {
                    2
                } else if matches!(unit, 10 | 13 | 0x2028 | 0x2029) {
                    1
                } else {
                    0
                };
                if width == 0 {
                    index += 1;
                    continue;
                }
                index += width;
                lines.push(index as u32);
            }
            lines
        })
    }
}

fn terminated_insertion(text: &[u16]) -> bool {
    text.iter().rev().find(|&&unit| !is_whitespace(unit)) == Some(&59)
}

fn is_whitespace(unit: u16) -> bool {
    char::from_u32(u32::from(unit)).is_some_and(|ch| {
        oxc_syntax::identifier::is_white_space(ch)
            || matches!(ch, '\r' | '\n' | '\u{2028}' | '\u{2029}')
    })
}

pub(crate) fn identifier_names(program: &Program<'_>) -> FxHashSet<String> {
    #[derive(Default)]
    struct Names(FxHashSet<String>);
    impl<'a> Visit<'a> for Names {
        fn enter_node(&mut self, node: AstKind<'a>) {
            let name = match node {
                AstKind::BindingIdentifier(node) => &node.name,
                AstKind::IdentifierReference(node) => &node.name,
                AstKind::IdentifierName(node) => &node.name,
                AstKind::LabelIdentifier(node) => &node.name,
                _ => return,
            };
            self.0.insert(name.to_string());
        }
    }
    let mut names = Names::default();
    names.visit_program(program);
    names.0
}

fn substitute(value: &[u16], text: &[u16], found: &regress::Match) -> Utf16String {
    let count = found.captures.len();
    let has_named = found.named_groups().next().is_some();
    let mut result = Vec::new();
    let mut offset = 0;
    while offset < value.len() {
        let unit = value[offset];
        let next = value.get(offset + 1).copied();
        if unit != 36 || next.is_none() {
            result.push(unit);
            offset += 1;
            continue;
        }
        let mut consumed = 2;
        let range = match next.unwrap() {
            36 => {
                result.push(36);
                offset += 2;
                continue;
            } // $$
            38 => Some(found.range()),           // $&
            96 => Some(0..found.start()),        // $`
            39 => Some(found.end()..text.len()), // $'
            60 if has_named => {
                // $<name>
                let Some(end) = value[offset + 2..].iter().position(|&unit| unit == 62) else {
                    result.push(36);
                    offset += 1;
                    continue;
                };
                let name = String::from_utf16_lossy(&value[offset + 2..offset + 2 + end]);
                consumed = end + 3;
                found.named_group(&name)
            }
            digit @ 48..=57 => {
                let first = usize::from(digit - 48);
                let two = value
                    .get(offset + 2)
                    .filter(|&&unit| (48..=57).contains(&unit))
                    .map(|&unit| first * 10 + usize::from(unit - 48));
                let index = if let Some(two) = two.filter(|&index| index > 0 && index <= count) {
                    consumed = 3;
                    two
                } else if first > 0 && first <= count {
                    first
                } else {
                    result.push(36);
                    offset += 1;
                    continue;
                };
                found.group(index)
            }
            _ => {
                result.push(36);
                offset += 1;
                continue;
            }
        };
        if let Some(range) = range {
            result.extend_from_slice(&text[range]);
        }
        offset += consumed;
    }
    result.into()
}

#[cfg(test)]
mod uid_tests {
    use super::*;

    #[test]
    fn seeded_inventory_skips_parsing_and_preserves_reservations() {
        let mut source = NativeSourceText::with_identifiers(
            "invalid !!!".encode_utf16().collect::<Vec<_>>().into(),
            Some(
                ["_temp".to_string(), "_temp3".to_string()]
                    .into_iter()
                    .collect(),
            ),
        );
        assert_eq!(
            source
                .generate_uid("temp".into(), "input.js".into())
                .unwrap(),
            "_temp2"
        );
        assert_eq!(
            source
                .generate_uid("temp".into(), "input.js".into())
                .unwrap(),
            "_temp4"
        );
        assert!(source.utf8.get().is_none());
    }

    #[test]
    fn repeated_hints_advance_the_suffix_cursor() {
        let mut source = NativeSourceText::with_identifiers(
            Vec::<u16>::new().into(),
            Some(FxHashSet::default()),
        );
        for index in 1..=10_000 {
            let expected = if index == 1 {
                "_temp".to_string()
            } else {
                format!("_temp{index}")
            };
            assert_eq!(
                source
                    .generate_uid("t-e-m-p".into(), "input.js".into())
                    .unwrap(),
                expected
            );
            assert_eq!(source.uids.next_suffix["_temp"], index.max(1) + 1);
        }
    }
}
