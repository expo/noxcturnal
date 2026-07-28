//! The walk that turns an AST buffer into a set of byte ranges to delete.
//!
//! One pass, no tree, nothing allocated per node. A field is walked, skipped,
//! or recorded as a span; recording a span skips the subtree under it, so the
//! ranges rarely overlap and the merge at the end only has to reconcile the few
//! rules that reach backwards.
//!
//! # Why the defaulted-parameter bug cannot recur
//!
//! `@expo/metro-config` carries `collectDefaultedParameters` and
//! `restoreDefaultedParameters` to repair Hermes' JavaScript stripper, which
//! unwraps `AssignmentPattern` to reach `optional` on the underlying pattern and
//! then pushes the pattern instead of rebuilding the wrapper — dropping the
//! default. Nothing here can do that, structurally rather than carefully.
//! `nodes: Array<number> = []` parses to an `AssignmentPattern` whose annotation
//! span lies strictly inside `left` and whose `right` lies outside it, so
//! erasing the annotation yields `nodes = []`. No code path removes `right`,
//! because nothing in this model reconstructs a parameter list: it only deletes
//! byte ranges.

use std::ops::Range;

use crate::generated::estree::{FieldType, NODE_KINDS, kind};
use crate::reader::{Buffer, Cursor, Node, ReadError};
use crate::rules::{self, BailKind, FieldRule, NodeRule};

/// The byte ranges to delete, sorted and non-overlapping.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Erasure {
    pub spans: Vec<Range<u32>>,
}

impl Erasure {
    /// Applies the erasure to `source`. Convenience for tests and for callers
    /// that do not need the spans themselves; the pipeline turns the spans into
    /// edit commands so the source map stays near-identity.
    pub fn apply(&self, source: &str) -> String {
        let mut out = String::with_capacity(source.len());
        let mut at = 0usize;
        for span in &self.spans {
            out.push_str(&source[at..span.start as usize]);
            at = span.end as usize;
        }
        out.push_str(&source[at..]);
        out
    }

    /// Total bytes removed, for the coverage counter.
    pub fn erased_bytes(&self) -> u32 {
        self.spans.iter().map(|span| span.end - span.start).sum()
    }
}

/// A file the rules decline to handle. The caller falls back to its own parser
/// adapter; none of these is an error a user should see.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Bail {
    pub kind: BailKind,
    pub detail: String,
}

impl Bail {
    fn new(kind: BailKind, detail: impl Into<String>) -> Self {
        Self {
            kind,
            detail: detail.into(),
        }
    }
}

impl std::fmt::Display for Bail {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.kind.as_str(), self.detail)
    }
}

impl From<ReadError> for Bail {
    fn from(error: ReadError) -> Self {
        Self::new(BailKind::Malformed, error.to_string())
    }
}

/// Collects the Flow syntax in `source`, given the buffer Hermes produced for it.
pub fn erase(source: &str, words: &[u32]) -> Result<Erasure, Bail> {
    let buffer = Buffer::new(words)?;
    if buffer.source_len() as usize != source.len() {
        return Err(Bail::new(
            BailKind::Malformed,
            "buffer was parsed from different source",
        ));
    }

    let mut walk = Walk {
        source: source.as_bytes(),
        spans: Vec::new(),
    };
    walk.node(&mut buffer.cursor())?;

    let mut spans = walk.spans;
    spans.sort_unstable_by_key(|span| span.start);
    // Merge anything touching or overlapping. `dedup_by` keeps the earlier
    // element, which is the one being widened.
    spans.dedup_by(|next, previous| {
        if next.start <= previous.end {
            previous.end = previous.end.max(next.end);
            true
        } else {
            false
        }
    });
    Ok(Erasure { spans })
}

/// The most fields any node in `ESTree.def` declares.
const MAX_FIELDS: usize = 10;

struct Walk<'a> {
    source: &'a [u8],
    spans: Vec<Range<u32>>,
}

/// What a node's finishing rules need to know about fields already read.
///
/// It exists because two rules read a flag before the field it depends on:
/// `ClassProperty.optional` is declared before `typeAnnotation`, and
/// `ImportDeclaration.importKind` after `specifiers`. A single forward pass
/// cannot resolve either in place.
struct Seen {
    /// Where this node's spans start, so a rule that erases the whole node can
    /// drop what its children contributed rather than rely on the merge.
    mark: usize,
    /// Span of each node-typed field, by position. `None` for a null field.
    fields: [Option<Range<u32>>; MAX_FIELDS],
    optional: bool,
    /// The node turned out to be entirely type syntax after all.
    erase_self: bool,
}

impl Seen {
    fn new(mark: usize) -> Self {
        Self {
            mark,
            fields: [const { None }; MAX_FIELDS],
            optional: false,
            erase_self: false,
        }
    }
}

impl<'a> Walk<'a> {
    fn erase_span(&mut self, span: Range<u32>) {
        if span.start < span.end {
            self.spans.push(span);
        }
    }

    fn node(&mut self, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let Some(node) = cursor.node()? else {
            return Ok(());
        };
        match rules::resolved(node.kind).node {
            NodeRule::Bail(_) => Err(Bail::new(
                rules::bail_kind_for(node.kind),
                NODE_KINDS[node.kind as usize].name,
            )),
            NodeRule::EraseWhole => {
                self.erase_span(node.start..node.end);
                cursor.skip_fields(node.kind)?;
                Ok(())
            }
            NodeRule::EraseTail => self.erase_tail(node, cursor),
            NodeRule::Walk => self.walk_fields(node, cursor),
        }
    }

    /// `(x: T)`, `x as T`, `x as const`: keep the first field, erase the type
    /// that follows it. One rule covers all three because in each the value is
    /// the first field and everything after it is type syntax.
    ///
    /// The erasure is bounded by the *annotation's* span rather than by the
    /// value's end and the node's end, and neither of those would work.
    /// Hermes excludes a node's own parentheses from its range but includes
    /// them in the enclosing node's, so for
    ///
    /// ```js
    /// export default (a ? b : c) as component(...Props);
    /// ```
    ///
    /// the value's range stops before the `)` and the node's runs past it.
    /// Erasing between them takes the `)` with it and the file stops parsing —
    /// which is exactly what the corpus harness caught.
    ///
    /// What is left over is the operator. `TypeCastExpression` needs no help:
    /// its annotation is a `TypeAnnotation` node whose span already starts at
    /// the `:`. `as` belongs to no node, so it is found in the source, and
    /// `x as const` has no annotation at all, so `const` is found the same way.
    fn erase_tail(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let fields = NODE_KINDS[node.kind as usize].fields;
        let Some(first) = fields.first() else {
            return Err(Bail::new(BailKind::Malformed, node.name()));
        };
        if first.ty != FieldType::Node {
            return Err(Bail::new(BailKind::Malformed, node.name()));
        }
        let Some(value) = self.walk_node_field(cursor)? else {
            return Err(Bail::new(BailKind::Malformed, node.name()));
        };

        let mut annotation = None;
        for field in &fields[1..] {
            if field.ty == FieldType::Node
                && let Some(node) = cursor.peek_node()?
            {
                annotation = Some(node.start..node.end);
            }
            cursor.skip_field(field.ty)?;
        }

        let span = match annotation {
            Some(span) => span,
            None => {
                let end = scan_forward_keyword_end(self.source, value.end, node.end, b"const")
                    .ok_or_else(|| Bail::new(BailKind::Malformed, node.name()))?;
                end - b"const".len() as u32..end
            }
        };
        let start = scan_back_keyword(self.source, span.start, b"as").unwrap_or(span.start);
        self.erase_span(start..span.end);
        Ok(())
    }

    /// Walks a node field and reports its span. The span is what the finishing
    /// rules reach for; the walk is what finds nested Flow.
    fn walk_node_field(&mut self, cursor: &mut Cursor<'a>) -> Result<Option<Range<u32>>, Bail> {
        let header = cursor.peek_node()?;
        self.node(cursor)?;
        Ok(header.map(|node| node.start..node.end))
    }

    fn walk_fields(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let resolved = rules::resolved(node.kind);
        let fields = NODE_KINDS[node.kind as usize].fields;
        let mut seen = Seen::new(self.spans.len());

        for (index, field) in fields.iter().enumerate() {
            match resolved.field(index) {
                FieldRule::Plain => {
                    if field.ty == FieldType::Node {
                        seen.fields[index] = self.walk_node_field(cursor)?;
                    } else {
                        self.walk_field(field.ty, cursor)?;
                    }
                }
                FieldRule::Erase => {
                    seen.fields[index] = self.erase_field(field.ty, cursor)?;
                }
                FieldRule::BailIfPresent => {
                    if self.field_is_present(field.ty, cursor)? {
                        return Err(Bail::new(
                            BailKind::UnhandledSyntax,
                            format!("{}.{}", node.name(), field.name),
                        ));
                    }
                }
                FieldRule::Hook => self.hook(node, field.name, cursor, &mut seen)?,
            }
        }

        self.finish(node, &seen)
    }

    fn walk_field(&mut self, ty: FieldType, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        match ty {
            FieldType::Node => self.node(cursor),
            FieldType::List => {
                let count = cursor.list_len()?;
                for _ in 0..count {
                    self.node(cursor)?;
                }
                Ok(())
            }
            _ => Ok(cursor.skip_field(ty)?),
        }
    }

    /// Records a field's span without descending: everything under a Flow
    /// annotation goes with it.
    fn erase_field(
        &mut self,
        ty: FieldType,
        cursor: &mut Cursor<'a>,
    ) -> Result<Option<Range<u32>>, Bail> {
        match ty {
            FieldType::Node => {
                let Some(node) = cursor.node()? else {
                    return Ok(None);
                };
                cursor.skip_fields(node.kind)?;
                self.erase_span(node.start..node.end);
                Ok(Some(node.start..node.end))
            }
            FieldType::List => {
                let span = self.skip_list(cursor)?;
                if let Some(range) = span.clone() {
                    self.erase_span(range);
                }
                Ok(span)
            }
            // Guarded by `rules::tests::a_scalar_is_never_erased_by_span`.
            _ => Err(Bail::new(BailKind::Malformed, "scalar field has no span")),
        }
    }

    /// Skips a whole list and reports the span from its first element to its
    /// last, or `None` when it is empty.
    fn skip_list(&mut self, cursor: &mut Cursor<'a>) -> Result<Option<Range<u32>>, Bail> {
        let count = cursor.list_len()?;
        let mut span: Option<Range<u32>> = None;
        for _ in 0..count {
            if let Some(node) = cursor.node()? {
                cursor.skip_fields(node.kind)?;
                span = Some(match span {
                    Some(range) => range.start..node.end,
                    None => node.start..node.end,
                });
            }
        }
        Ok(span)
    }

    fn field_is_present(&mut self, ty: FieldType, cursor: &mut Cursor<'a>) -> Result<bool, Bail> {
        Ok(match ty {
            FieldType::Node => {
                let node = cursor.node()?;
                if let Some(node) = node {
                    cursor.skip_fields(node.kind)?;
                }
                node.is_some()
            }
            FieldType::List => self.skip_list(cursor)?.is_some(),
            FieldType::Bool => cursor.boolean()?,
            _ => {
                cursor.skip_field(ty)?;
                false
            }
        })
    }

    // -- the rules that need more than a span --------------------------------

    fn hook(
        &mut self,
        node: Node,
        name: &str,
        cursor: &mut Cursor<'a>,
        seen: &mut Seen,
    ) -> Result<(), Bail> {
        match (node.kind, name) {
            // Booleans with no span of their own. `optional` is resolved in
            // `finish`, because on a class property it is read before the
            // annotation that bounds the search for its `?`.
            (_, "optional") => seen.optional = cursor.boolean()?,
            // `declare foo: T` is not a member at all once the types are gone.
            (_, "declare") => seen.erase_self |= cursor.boolean()?,
            (
                kind::IMPORT_DECLARATION
                | kind::EXPORT_NAMED_DECLARATION
                | kind::EXPORT_ALL_DECLARATION,
                "importKind" | "exportKind",
            ) => {
                seen.erase_self |= matches!(cursor.label()?, Some(b"type") | Some(b"typeof"));
            }
            (kind::CLASS_DECLARATION | kind::CLASS_EXPRESSION, "implements") => {
                self.class_implements(cursor)?;
            }
            (kind::IMPORT_DECLARATION, "specifiers") => {
                seen.erase_self |= self.import_specifiers(cursor)?;
            }
            (
                kind::FUNCTION_DECLARATION
                | kind::FUNCTION_EXPRESSION
                | kind::ARROW_FUNCTION_EXPRESSION,
                "params",
            ) => self.function_params(cursor)?,
            (kind::EXPORT_NAMED_DECLARATION, "declaration") => {
                // `export type Foo = ...` reaches here as an export wrapping a
                // `TypeAlias`. Erasing only the alias would leave `export`
                // dangling, so the whole statement goes.
                let erase_self = cursor
                    .peek_node()?
                    .is_some_and(|child| rules::resolved(child.kind).node == NodeRule::EraseWhole);
                seen.erase_self |= erase_self;
                if erase_self {
                    cursor.skip_node()?;
                } else {
                    self.node(cursor)?;
                }
            }
            _ => {
                return Err(Bail::new(
                    BailKind::Malformed,
                    format!("no hook for {}.{name}", node.name()),
                ));
            }
        }
        Ok(())
    }

    /// `class A implements B, C {}`. The `implements` keyword belongs to no
    /// node, so the erasure has to start at the keyword rather than at the
    /// first `ClassImplements`.
    fn class_implements(&mut self, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let Some(range) = self.skip_list(cursor)? else {
            return Ok(());
        };
        let Some(keyword) = scan_back_keyword(self.source, range.start, b"implements") else {
            return Err(Bail::new(
                BailKind::Malformed,
                "no `implements` keyword before the clause",
            ));
        };
        self.erase_span(keyword..range.end);
        Ok(())
    }

    /// `import { type A, B }`. A specifier marked `type` goes with the comma
    /// that separates it, which the generic list walk cannot see.
    ///
    /// Reports whether *every* specifier was type-only, which makes the whole
    /// declaration type-only and is the caller's cue to erase it. Leaving
    /// `import {} from './m'` behind instead would keep the module in the
    /// dependency graph: bundling `apps/native-component-list` for iOS put six
    /// type-only React Native modules — `CoreEventTypes`, `ViewPropTypes`,
    /// `ReactNativeTypes` and friends — into the bundle and added 426 KB that
    /// the Hermes stripper drops.
    ///
    /// An import that started with no specifiers is a side-effect import and
    /// stays. That distinction is exactly the one `@expo/metro-config` carries
    /// a workaround for, because Hermes' stripper removes every zero-specifier
    /// import including those; drawing it here means the erasure does not need
    /// the workaround.
    fn import_specifiers(&mut self, cursor: &mut Cursor<'a>) -> Result<bool, Bail> {
        let count = cursor.list_len()?;
        let mut type_only = 0u32;
        for _ in 0..count {
            let Some(node) = cursor.peek_node()? else {
                cursor.skip_node()?;
                continue;
            };
            if node.kind != kind::IMPORT_SPECIFIER {
                self.node(cursor)?;
                continue;
            }
            let mark = self.spans.len();
            if !self.import_specifier_is_type_only(node, cursor)? {
                continue;
            }
            type_only += 1;
            self.spans.truncate(mark);
            self.erase_span(self.list_element_span(node.start..node.end));
        }
        Ok(count > 0 && type_only == count)
    }

    /// Walks one `ImportSpecifier` and reports whether it is `type`/`typeof`.
    /// Field order comes from the generated schema rather than from here.
    fn import_specifier_is_type_only(
        &mut self,
        node: Node,
        cursor: &mut Cursor<'a>,
    ) -> Result<bool, Bail> {
        cursor.node()?;
        let mut type_only = false;
        for field in NODE_KINDS[node.kind as usize].fields {
            if field.name == "importKind" {
                type_only = matches!(cursor.label()?, Some(b"type") | Some(b"typeof"));
            } else {
                self.walk_field(field.ty, cursor)?;
            }
        }
        Ok(type_only)
    }

    /// A `this` parameter is `params[0]` as an `Identifier` named `this`; there
    /// is no `thisParam` field. Erasing only its annotation would leave a real
    /// parameter named `this` behind, so the whole parameter goes, comma
    /// included.
    fn function_params(&mut self, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let count = cursor.list_len()?;
        for index in 0..count {
            let header = cursor.peek_node()?;
            let is_this_param = index == 0
                && header.is_some_and(|node| node.kind == kind::IDENTIFIER)
                && self.parameter_is_this(cursor)?;
            if !is_this_param {
                self.node(cursor)?;
                continue;
            }
            let node = header.expect("checked above");
            cursor.skip_node()?;
            self.erase_span(self.list_element_span(node.start..node.end));
        }
        Ok(())
    }

    /// Reads the name of the `Identifier` the cursor is parked on, without
    /// consuming it.
    fn parameter_is_this(&self, cursor: &Cursor<'a>) -> Result<bool, Bail> {
        let mut probe = *cursor;
        probe.node()?;
        for field in NODE_KINDS[kind::IDENTIFIER as usize].fields {
            if field.name == "name" {
                return Ok(probe.label()? == Some(b"this"));
            }
            probe.skip_field(field.ty)?;
        }
        Ok(false)
    }

    /// Extends an element's span over the comma that separates it, so removing
    /// it leaves a well-formed list.
    ///
    /// Whether a comma exists is read from the source rather than from the
    /// element count, because the two disagree: in
    /// `import processColor, {type ProcessedColorValue} from './m'` the list
    /// has two specifiers, but the type one is alone inside its braces and the
    /// only comma belongs to the default import. Counting elements bailed on
    /// eleven React Native files for exactly that reason.
    ///
    /// With no comma on either side the element stands alone in its brackets,
    /// and removing it leaves them adjacent — `{}` — which is valid and is what
    /// Babel's stripper produces too.
    fn list_element_span(&self, span: Range<u32>) -> Range<u32> {
        let after = self.skip_trivia(span.end as usize);
        if self.source.get(after) == Some(&b',') {
            return span.start..(after + 1) as u32;
        }
        let mut before = span.start as usize;
        while before > 0 && self.source[before - 1].is_ascii_whitespace() {
            before -= 1;
        }
        if before > 0 && self.source[before - 1] == b',' {
            return (before - 1) as u32..span.end;
        }
        span
    }

    /// Advances past whitespace and comments. Comments matter here because a
    /// comment between an element and its comma would otherwise hide the comma
    /// and leave a dangling one behind.
    fn skip_trivia(&self, mut at: usize) -> usize {
        loop {
            while self.source.get(at).is_some_and(u8::is_ascii_whitespace) {
                at += 1;
            }
            match self.source.get(at..at + 2) {
                Some(b"//") => {
                    while self.source.get(at).is_some_and(|byte| *byte != b'\n') {
                        at += 1;
                    }
                }
                Some(b"/*") => {
                    let mut scan = at + 2;
                    while scan + 1 < self.source.len() && &self.source[scan..scan + 2] != b"*/" {
                        scan += 1;
                    }
                    at = (scan + 2).min(self.source.len());
                }
                _ => return at,
            }
        }
    }

    fn finish(&mut self, node: Node, seen: &Seen) -> Result<(), Bail> {
        if seen.erase_self {
            self.spans.truncate(seen.mark);
            self.erase_span(node.start..node.end);
            return Ok(());
        }

        if seen.optional {
            let (from, to) = self.optional_bounds(node, seen);
            let Some(marker) = scan_back_byte(self.source, from, to, b'?') else {
                return Err(Bail::new(
                    BailKind::Malformed,
                    format!("no `?` on optional {}", node.name()),
                ));
            };
            self.erase_span(marker..marker + 1);
        }

        Ok(())
    }

    /// Where the optional `?` can be. It sits between the end of the name (or
    /// key) and the start of the annotation, and nowhere else. Bounding the
    /// search by the annotation matters: `x?: ?string` has a second `?` inside
    /// the type.
    fn optional_bounds(&self, node: Node, seen: &Seen) -> (u32, u32) {
        let span_of = |name: &str| {
            NODE_KINDS[node.kind as usize]
                .fields
                .iter()
                .position(|field| field.name == name)
                .and_then(|index| seen.fields[index].clone())
        };

        let from = match node.kind {
            // An identifier's name is not a node; its own span starts at it.
            kind::IDENTIFIER => node.start,
            _ => span_of("key").map_or(node.start, |key| key.end),
        };
        let to = span_of("typeAnnotation")
            .map(|annotation| annotation.start)
            .or_else(|| span_of("value").map(|value| value.start))
            .unwrap_or(node.end);
        (from, to)
    }
}

/// Finds the last `byte` in `source[from..to]`.
fn scan_back_byte(source: &[u8], from: u32, to: u32, byte: u8) -> Option<u32> {
    let range = source.get(from as usize..to as usize)?;
    range
        .iter()
        .rposition(|candidate| *candidate == byte)
        .map(|offset| from + offset as u32)
}

/// Finds the end of the last occurrence of `keyword` in `source[from..to]`.
fn scan_forward_keyword_end(source: &[u8], from: u32, to: u32, keyword: &[u8]) -> Option<u32> {
    let range = source.get(from as usize..to as usize)?;
    range
        .windows(keyword.len())
        .rposition(|window| window == keyword)
        .map(|offset| from + (offset + keyword.len()) as u32)
}

/// Finds a keyword immediately before `before`, skipping whitespace.
///
/// Both boundaries are checked, because `as` is two letters and plenty of
/// identifiers end in them: without the check, `(bananas: T)` finds an `as`
/// inside the name and erases from the middle of it.
fn scan_back_keyword(source: &[u8], before: u32, keyword: &[u8]) -> Option<u32> {
    let mut at = before as usize;
    while at > 0 && source[at - 1].is_ascii_whitespace() {
        at -= 1;
    }
    let start = at.checked_sub(keyword.len())?;
    if &source[start..at] != keyword {
        return None;
    }
    if start > 0 && is_identifier_byte(source[start - 1]) {
        return None;
    }
    if source.get(at).is_some_and(|byte| is_identifier_byte(*byte)) {
        return None;
    }
    Some(start as u32)
}

/// Conservative: any byte that can continue an identifier, including the
/// continuation bytes of a multi-byte character.
fn is_identifier_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'$' || byte >= 0x80
}
