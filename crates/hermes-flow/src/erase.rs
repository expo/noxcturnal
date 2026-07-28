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
use crate::proposals::{
    Binding, Component, ComponentParam, Condition, Enum, EnumMember, Form, Key, Match, MatchCase,
    Names, Step, identifier_name,
};
use crate::reader::{Buffer, Cursor, Node, ReadError};
use crate::rules::{self, BailKind, FieldRule, NodeRule};

/// One change to the source.
///
/// Type erasure only ever deletes, but the proposal transforms beside it —
/// `component`, `enum`, `match` — have to write something in place of what they
/// remove, so an edit carries optional replacement text.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Edit {
    pub span: Range<u32>,
    /// `None` deletes the range. `Some` replaces it.
    pub content: Option<String>,
}

impl Edit {
    pub fn is_deletion(&self) -> bool {
        self.content.is_none()
    }
}

/// The edits to apply, sorted and non-overlapping.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Erasure {
    pub edits: Vec<Edit>,
}

impl Erasure {
    /// Applies the edits to `source`. Convenience for tests and for callers
    /// that do not need the edits themselves; the pipeline turns them into
    /// edit commands so the source map stays near-identity.
    pub fn apply(&self, source: &str) -> String {
        let mut out = String::with_capacity(source.len());
        let mut at = 0usize;
        for edit in &self.edits {
            out.push_str(&source[at..edit.span.start as usize]);
            if let Some(content) = &edit.content {
                out.push_str(content);
            }
            at = edit.span.end as usize;
        }
        out.push_str(&source[at..]);
        out
    }

    /// Source bytes removed, for the coverage counter. Replacement text is not
    /// counted; the number is about how much type syntax went away.
    pub fn erased_bytes(&self) -> u32 {
        self.edits
            .iter()
            .filter(|edit| edit.is_deletion())
            .map(|edit| edit.span.end - edit.span.start)
            .sum()
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
        edits: Vec::new(),
        seen_names: source.contains("component").then(Default::default),
        names: Names::after(source),
        function_depth: 0,
        suspension_floor: None,
        suspension: None,
    };
    walk.node(&mut buffer.cursor())?;

    Ok(Erasure {
        edits: merge(walk.edits)?,
    })
}

/// Sorts the edits and reconciles the few that touch.
///
/// Deletions that touch or overlap merge into one. Replacements never do: two
/// of them at the same place would be ambiguous, and a deletion swallowed by a
/// replacement would silently drop the text it was meant to write.
///
/// The sort is stable, because two zero-width insertions can share a position —
/// a binding and a `break` in an empty match case body — and the order they
/// were pushed in is the order they were meant to be written in.
fn merge(mut edits: Vec<Edit>) -> Result<Vec<Edit>, Bail> {
    edits.sort_by_key(|edit| edit.span.start);
    let mut merged: Vec<Edit> = Vec::with_capacity(edits.len());
    for edit in edits {
        match merged.last_mut() {
            Some(previous)
                if previous.is_deletion()
                    && edit.is_deletion()
                    && edit.span.start <= previous.span.end =>
            {
                previous.span.end = previous.span.end.max(edit.span.end);
            }
            Some(previous) if edit.span.start < previous.span.end => {
                return Err(Bail::new(
                    BailKind::Malformed,
                    format!(
                        "overlapping edits at {}..{} and {}..{}",
                        previous.span.start, previous.span.end, edit.span.start, edit.span.end
                    ),
                ));
            }
            _ => merged.push(edit),
        }
    }
    Ok(merged)
}

/// The most fields any node in `ESTree.def` declares.
const MAX_FIELDS: usize = 10;

struct Walk<'a> {
    source: &'a [u8],
    edits: Vec<Edit>,
    /// Names of identifiers already walked past.
    ///
    /// A `ref` component becomes a `const` binding, which unlike the
    /// declaration it replaces is not hoisted, so it may not be named earlier
    /// in the file. The walk visits identifiers in source order, so by the time
    /// it reaches the declaration this holds exactly the references above it —
    /// which a textual search could not tell apart from a mention in a comment.
    /// Only collected for files that could contain a component at all.
    seen_names: Option<std::collections::HashSet<&'a [u8]>>,
    /// The counter behind `$$gen$m0`, `$$gen$m1`, … Runs for the whole file, as
    /// `TransformMatchSyntax`'s does.
    names: Names,
    /// How many functions deep the walk is. Only the depth matters, and only
    /// for `await` and `yield`: one inside a nested function belongs to that
    /// function, not to the one a match expression would be wrapped in.
    function_depth: u32,
    /// The depth at which an `await` or `yield` would be caught by that
    /// wrapping. `None` outside a case body that is about to be wrapped.
    suspension_floor: Option<u32>,
    /// The first one found at that depth: whether it was a `yield`, and where.
    suspension: Option<(bool, u32)>,
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
            self.edits.push(Edit {
                span,
                content: None,
            });
        }
    }

    /// Writes `content` in place of `span`. Unlike a deletion this may be
    /// zero-width, which is how a transform appends beside what it rewrote.
    fn replace_span(&mut self, span: Range<u32>, content: String) {
        self.edits.push(Edit {
            span,
            content: Some(content),
        });
    }

    fn node(&mut self, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let Some(node) = cursor.node()? else {
            return Ok(());
        };
        if !is_function(node.kind) {
            return self.dispatch(node, cursor);
        }
        self.function_depth += 1;
        let walked = self.dispatch(node, cursor);
        self.function_depth -= 1;
        walked
    }

    /// One node whose header has been read.
    fn dispatch(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        // The proposal transforms come first: they own the whole construct and
        // decide for themselves which parts of it the walk still visits.
        match node.kind {
            kind::ENUM_DECLARATION => return self.enum_declaration(node, cursor),
            kind::COMPONENT_DECLARATION => return self.component_declaration(node, cursor),
            kind::MATCH_STATEMENT => return self.match_construct(node, cursor, true),
            kind::MATCH_EXPRESSION => return self.match_construct(node, cursor, false),
            kind::AWAIT_EXPRESSION | kind::YIELD_EXPRESSION => {
                // Only one belonging to the function a match expression would
                // be wrapped in, and only the first: it is what the wrapper is
                // decided from, and where the report points if there is one.
                if self.suspension_floor == Some(self.function_depth) && self.suspension.is_none() {
                    self.suspension = Some((node.kind == kind::YIELD_EXPRESSION, node.start));
                }
            }
            // A hook's parameters are ordinary ones, so the only thing that has
            // to change is the keyword; the rules below erase its type
            // parameters and return type like any other function's.
            kind::HOOK_DECLARATION => {
                self.replace_span(
                    node.start..node.start + b"hook".len() as u32,
                    "function".into(),
                );
            }
            _ => {}
        }
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

    /// Notes an identifier the output will reference. See [`Walk::seen_names`].
    fn remember(&mut self, name: &'a [u8]) {
        if let Some(seen) = self.seen_names.as_mut() {
            seen.insert(name);
        }
    }

    /// The source as text. Hermes accepts input this cannot slice, and a rule
    /// that has to write part of it back out needs to know.
    fn source_str(&self) -> Result<&'a str, Bail> {
        std::str::from_utf8(self.source)
            .map_err(|_| Bail::new(BailKind::Malformed, "source is not UTF-8"))
    }

    /// Refuses the file over a construct nothing can compile.
    ///
    /// The message is the one `TransformMatchSyntax` throws where it has one,
    /// so a search for it finds the same answers, and it carries a position in
    /// the same `(line:column)` shape Hermes' own parse errors do.
    fn reject(&self, at: u32, detail: &str) -> Bail {
        let (line, column) = self.position(at);
        Bail::new(BailKind::Rejected, format!("{detail} ({line}:{column})"))
    }

    /// A byte offset as a one-based line and column, counted in characters.
    fn position(&self, at: u32) -> (usize, usize) {
        let upto = std::str::from_utf8(&self.source[..at as usize]).unwrap_or_default();
        let line = upto.matches('\n').count() + 1;
        let column = upto
            .rsplit('\n')
            .next()
            .map_or(0, |line| line.chars().count())
            + 1;
        (line, column)
    }

    fn walk_fields(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        if node.kind == kind::IDENTIFIER
            && self.seen_names.is_some()
            && let Some(name) = peek_label(cursor)
        {
            self.remember(name);
        }
        let resolved = rules::resolved(node.kind);
        let fields = NODE_KINDS[node.kind as usize].fields;
        let mut seen = Seen::new(self.edits.len());

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

    // -- proposal transforms -------------------------------------------------

    /// `enum Status { Active, Off }` — replaced wholesale, because an enum body
    /// holds only literals and so contains nothing the erasure walk would need
    /// to reach.
    fn enum_declaration(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let bail = |detail: &str| Bail::new(BailKind::Proposal, format!("enum: {detail}"));

        let Some(id) = cursor.node()? else {
            return Err(bail("no name"));
        };
        cursor.skip_fields(id.kind)?;

        let Some(body) = cursor.node()? else {
            return Err(bail("no body"));
        };
        // A defaulted string enum is the `Mirrored` case; every other body
        // spells its values out.
        let string_body = body.kind == kind::ENUM_STRING_BODY;
        let count = cursor.list_len()?;
        let mut members = Vec::with_capacity(count as usize);
        let mut all_defaulted = true;
        for _ in 0..count {
            let Some(member) = cursor.node()? else {
                return Err(bail("empty member"));
            };
            let Some(name) = cursor.node()? else {
                return Err(bail("member without a name"));
            };
            cursor.skip_fields(name.kind)?;
            let init = if member.kind == kind::ENUM_DEFAULTED_MEMBER {
                None
            } else {
                all_defaulted = false;
                let Some(value) = cursor.node()? else {
                    return Err(bail("member without a value"));
                };
                cursor.skip_fields(value.kind)?;
                Some(value.start..value.end)
            };
            members.push(EnumMember {
                name: name.start..name.end,
                init,
            });
        }
        // The remaining body fields are flags with no bearing on the output.
        for field in &NODE_KINDS[body.kind as usize].fields[1..] {
            cursor.skip_field(field.ty)?;
        }

        let declaration = Enum {
            id: id.start..id.end,
            mirrored: string_body && all_defaulted,
            members,
        };
        let source = std::str::from_utf8(self.source)
            .map_err(|_| Bail::new(BailKind::Malformed, "source is not UTF-8"))?;
        self.replace_span(node.start..node.end, declaration.render(source));
        Ok(())
    }

    /// `component Foo(a: T, b as c: U = 1, ...rest: R) renders X { … }`
    ///
    /// Only the header is rewritten. The body keeps its own bytes so the walk
    /// erases the Flow inside it and the piece table composes the two.
    fn component_declaration(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let bail = |detail: &str| Bail::new(BailKind::Proposal, format!("component: {detail}"));

        let Some(id) = cursor.node()? else {
            return Err(bail("no name"));
        };
        cursor.skip_fields(id.kind)?;

        let count = cursor.list_len()?;
        let mut params = Vec::with_capacity(count as usize);
        let mut whole_props = None;
        let mut ref_binding = None;
        for _ in 0..count {
            let Some(param) = cursor.node()? else {
                return Err(bail("empty parameter"));
            };
            match param.kind {
                kind::REST_ELEMENT => {
                    let Some(argument) = cursor.peek_node()? else {
                        return Err(bail("rest without an argument"));
                    };
                    if argument.kind != kind::IDENTIFIER {
                        // A destructured rest spreads its properties into the
                        // props pattern, which nothing observed needs.
                        return Err(bail("destructured rest parameter"));
                    }
                    let Some(name) = identifier_name(cursor) else {
                        return Err(bail("rest argument has no name"));
                    };
                    let local = name_span(argument, name);
                    cursor.skip_node()?;
                    // `component Foo(...props: P)` is just `function Foo(props)`.
                    // The optimisation needs the rest to be the *only*
                    // parameter — a ref beside it still forces a pattern, which
                    // is what `TransformComponentSyntax` does.
                    if count == 1 {
                        whole_props = Some(local);
                    } else {
                        params.push(ComponentParam {
                            name: local.clone(),
                            local,
                            default: None,
                            shorthand: true,
                            rest: true,
                        });
                    }
                }
                kind::COMPONENT_PARAMETER => {
                    let Some(name) = cursor.peek_node()? else {
                        return Err(bail("parameter without a name"));
                    };
                    let is_ref =
                        name.kind == kind::IDENTIFIER && identifier_name(cursor) == Some(b"ref");
                    cursor.skip_node()?;
                    let param = self.component_parameter(name, cursor)?;
                    // React 18 lifts `ref` out of props into a second argument
                    // and wraps the component in `React.forwardRef`; React 19
                    // would keep it an ordinary prop. `TransformComponentSyntax`
                    // defaults to 18 and nothing here sets otherwise.
                    if is_ref {
                        if ref_binding.is_some() {
                            return Err(bail("more than one ref parameter"));
                        }
                        ref_binding = Some(param.local);
                    } else {
                        params.push(param);
                    }
                }
                _ => return Err(bail(NODE_KINDS[param.kind as usize].name)),
            }
        }

        let Some(body) = cursor.peek_node()? else {
            return Err(bail("no body"));
        };
        let source = std::str::from_utf8(self.source)
            .map_err(|_| Bail::new(BailKind::Malformed, "source is not UTF-8"))?;
        let component = Component {
            id: id.start..id.end,
            params,
            whole_props,
            ref_binding,
            // `async` is the last field, so it is read after the body below.
            is_async: false,
        };
        // The `forwardRef` binding is a `const`, which is not hoisted the way
        // the `component` declaration it replaces was. `TransformComponentSyntax`
        // handles that by moving the binding above the first reference; this
        // declines instead, on a textual search that errs towards declining.
        // The `forwardRef` binding is a `const`, which is not hoisted the way
        // the `component` declaration it replaces was.
        // `TransformComponentSyntax` handles a reference above the declaration
        // by moving the binding up to it; this declines instead, on a textual
        // search that errs towards declining.
        if component.ref_binding.is_some() {
            let name = &self.source[component.id.start as usize..component.id.end as usize];
            if self
                .seen_names
                .as_ref()
                .is_some_and(|seen| seen.contains(name))
            {
                return Err(bail("component referenced before its forwardRef binding"));
            }
        }
        // Everything from `component` to the body's `{` goes, which takes the
        // type parameters and the `renders` clause with it — both of them sit
        // in that range even though the buffer stores them after the body.
        self.replace_span(node.start..body.start, component.render(source));
        self.node(cursor)?;

        for field in &NODE_KINDS[node.kind as usize].fields[3..] {
            if field.name == "async" {
                if cursor.boolean()? {
                    return Err(bail("async component"));
                }
                continue;
            }
            cursor.skip_field(field.ty)?;
        }
        Ok(())
    }

    /// One `ComponentParameter`, with the cursor parked on its `local`.
    fn component_parameter(
        &mut self,
        name: Node,
        cursor: &mut Cursor<'a>,
    ) -> Result<ComponentParam, Bail> {
        let bail = |detail: &str| Bail::new(BailKind::Proposal, format!("component: {detail}"));

        let Some(local) = cursor.peek_node()? else {
            return Err(bail("parameter without a binding"));
        };
        let (binding, default) = if local.kind == kind::ASSIGNMENT_PATTERN {
            cursor.node()?;
            let Some(left) = cursor.peek_node()? else {
                return Err(bail("default without a binding"));
            };
            let binding = self.binding_span(left, cursor)?;
            cursor.skip_node()?;
            let Some(right) = cursor.peek_node()? else {
                return Err(bail("default without a value"));
            };
            cursor.skip_node()?;
            (binding, Some(right.start..right.end))
        } else {
            let binding = self.binding_span(local, cursor)?;
            cursor.skip_node()?;
            (binding, None)
        };
        let shorthand = cursor.boolean()?;
        Ok(ComponentParam {
            name: name.start..name.end,
            local: binding,
            default,
            shorthand,
            rest: false,
        })
    }

    /// The source range of a binding with its type annotation left out.
    ///
    /// An `Identifier`'s own range covers `a: T`, so its name is taken from the
    /// label rather than the span. A pattern's range covers `{a}: T`, and there
    /// the annotation's start is the cut.
    fn binding_span(&self, binding: Node, cursor: &Cursor<'a>) -> Result<Range<u32>, Bail> {
        let bail = |detail: &str| Bail::new(BailKind::Proposal, format!("component: {detail}"));
        match binding.kind {
            kind::IDENTIFIER => {
                let Some(name) = identifier_name(cursor) else {
                    return Err(bail("binding has no name"));
                };
                Ok(name_span(binding, name))
            }
            kind::OBJECT_PATTERN | kind::ARRAY_PATTERN => {
                let mut probe = *cursor;
                probe.node()?;
                probe.skip_field(FieldType::List)?;
                let end = match probe.peek_node()? {
                    Some(annotation) => annotation.start,
                    None => binding.end,
                };
                Ok(binding.start..end)
            }
            _ => Err(bail(NODE_KINDS[binding.kind as usize].name)),
        }
    }

    // -- match ---------------------------------------------------------------

    /// `match (x) { 1 => …, const y if (p) => …, _ => … }`, as a statement or
    /// an expression.
    ///
    /// Mirrors `TransformMatchSyntax.js`, laid over the source rather than
    /// printed: every case body keeps its own bytes, so the walk erases the
    /// Flow inside it, and only the patterns, the guards' punctuation, and the
    /// separators are written over.
    fn match_construct(
        &mut self,
        node: Node,
        cursor: &mut Cursor<'a>,
        statement: bool,
    ) -> Result<(), Bail> {
        let source = self.source_str()?;
        let Some(argument) = cursor.peek_node()? else {
            return Err(match_bail("no argument"));
        };
        let simple = self.argument_is_simple(cursor)?;

        // The cases are read twice: here for their patterns, with the cursor
        // left where it is, and again below for their bodies and guards. That
        // is what puts the generated names in the order the JavaScript
        // transform puts them in — it settles the shape of a construct before
        // descending into any body, so a nested match numbers after it.
        let mut probe = *cursor;
        probe.skip_node()?;
        let analysis = self.analyze_cases(&mut probe, statement)?;

        let label = statement.then(|| self.names.reserve());
        let root_binding = (analysis.has_bindings || !simple).then(|| self.names.reserve());
        let form = match (statement, root_binding.is_some()) {
            (true, _) => Form::Statement,
            (false, false) => Form::Conditional,
            (false, true) => Form::Iife,
        };

        // The argument keeps its bytes only where the shape has a place for
        // them: the statement form binds it to a name in front of the cases.
        // The conditional form repeats it inside every test and the iife form
        // moves it past them, and neither can be done in place — so its own
        // erasure is applied to a copy and the bytes go.
        let mark = self.edits.len();
        self.node(cursor)?;
        let argument_text = if form == Form::Statement && root_binding.is_some() {
            None
        } else {
            let inner = self.edits.drain(mark..).collect();
            Some(rendered(source, argument.start..argument.end, inner)?)
        };
        let root = match (&root_binding, &argument_text) {
            (Some(name), _) => name.clone(),
            (None, Some(text)) => text.clone(),
            (None, None) => return Err(match_bail("argument with nowhere to go")),
        };

        // Only the iife form puts the bodies inside a function of its own, so
        // only it has to know whether one of them suspends. The argument is
        // walked above, outside that function, and is deliberately left to
        // whatever region encloses this one.
        let enclosing = (form == Form::Iife).then(|| {
            (
                self.suspension_floor.replace(self.function_depth),
                self.suspension.take(),
            )
        });

        // A case below a wildcard never runs. The analysis stopped at one, and
        // the cases past it are skipped rather than walked; the last live
        // case's trailing edit covers their bytes.
        let count = cursor.list_len()?;
        for index in 0..count {
            if index as usize >= analysis.cases.len() {
                cursor.skip_node()?;
                continue;
            }
            if cursor.node()?.is_none() {
                return Err(match_bail("empty case"));
            }
            cursor.skip_node()?; // pattern, read by the analysis
            self.node(cursor)?; // body
            self.node(cursor)?; // guard
        }

        let suspension = self.suspension;
        if let Some((floor, found)) = enclosing {
            self.suspension_floor = floor;
            self.suspension = found;
        }
        // A case body that awaits has to keep awaiting once it is inside the
        // arrow, so the arrow becomes async and the call is awaited in turn.
        // The construct then resolves a tick later than it would have, which is
        // the price of compiling it at all: `TransformMatchSyntax` writes the
        // plain arrow and produces a file that does not parse.
        let asynchronous = match suspension {
            // `yield` has no such lowering. An inner generator would have to be
            // delegated to, and a generator is not an arrow: `this`, `super`,
            // `arguments`, and `new.target` would all stop meaning what they
            // were written to mean.
            Some((true, at)) => {
                return Err(self.reject(
                    at,
                    "'yield' is not supported in a match expression that binds, \
                     because the case body becomes a function.",
                ));
            }
            Some((false, _)) => true,
            None => false,
        };

        let construct = Match {
            asynchronous,
            form,
            span: node.start..node.end,
            argument: argument.start..argument.end,
            argument_text,
            root,
            label,
            has_wildcard: analysis.has_wildcard,
            cases: analysis.cases,
        };
        for (span, content) in construct.edits(source, &mut self.names) {
            self.replace_span(span, content);
        }
        Ok(())
    }

    /// `calculateSimpleArgument`: an argument cheap enough to evaluate once per
    /// test rather than bind to a name — an identifier, `super`, or a member
    /// chain over one whose computed properties are literals.
    ///
    /// It is a judgement about side effects that deliberately ignores getters,
    /// which is the JavaScript transform's judgement too.
    fn argument_is_simple(&self, cursor: &Cursor<'a>) -> Result<bool, Bail> {
        let mut probe = *cursor;
        let Some(node) = probe.node()? else {
            return Ok(false);
        };
        match node.kind {
            kind::IDENTIFIER | kind::SUPER => Ok(true),
            kind::MEMBER_EXPRESSION => {
                let object = probe;
                probe.skip_node()?;
                let property = probe.peek_node()?;
                probe.skip_node()?;
                if probe.boolean()? && !property.is_some_and(|node| is_literal(node.kind)) {
                    return Ok(false);
                }
                self.argument_is_simple(&object)
            }
            _ => Ok(false),
        }
    }

    /// Every case up to and including one that matches everything.
    fn analyze_cases(&mut self, cursor: &mut Cursor<'a>, statement: bool) -> Result<Cases, Bail> {
        let count = cursor.list_len()?;
        let mut cases = Vec::with_capacity(count as usize);
        let mut has_bindings = false;
        let mut has_wildcard = false;
        for _ in 0..count {
            let Some(node) = cursor.node()? else {
                return Err(match_bail("empty case"));
            };
            let mut analysis = Analysis::default();
            let mut key = Key::new();
            // Duplicate binding names are refused per case, as they are in
            // `analyzeCases`, which starts a fresh set for each one.
            let mut seen = Vec::new();
            let pattern = self.analyze_pattern(cursor, &mut key, &mut analysis, &mut seen)?;
            let Some(body) = cursor.peek_node()? else {
                return Err(match_bail("case without a body"));
            };
            cursor.skip_node()?;
            let guard = cursor.peek_node()?.map(|node| node.start..node.end);
            cursor.skip_node()?;
            if statement && body.kind != kind::BLOCK_STATEMENT {
                return Err(match_bail("case body is not a block"));
            }
            let from = guard.as_ref().map_or(pattern.end, |guard| guard.end);
            let arrow = self.arrow_after(from, body.start)?;
            let end = self.body_end(arrow, body)?;

            has_bindings |= !analysis.bindings.is_empty();
            let wildcard = analysis.conditions.is_empty() && guard.is_none();
            cases.push(MatchCase {
                conditions: analysis.conditions,
                bindings: analysis.bindings,
                span: node.start..end,
                body: body.start..body.end,
                guard,
                arrow,
            });
            if wildcard {
                has_wildcard = true;
                break;
            }
        }
        Ok(Cases {
            cases,
            has_bindings,
            has_wildcard,
        })
    }

    /// Just past the `=>` between a case's pattern and its body. A pattern's
    /// own parentheses are outside its range, so any closing ones are stepped
    /// over on the way.
    fn arrow_after(&self, from: u32, limit: u32) -> Result<u32, Bail> {
        let mut at = self.skip_trivia(from as usize);
        while (at as u32) < limit && self.source.get(at) == Some(&b')') {
            at = self.skip_trivia(at + 1);
        }
        if (at as u32) < limit && self.source.get(at..at + 2) == Some(&b"=>"[..]) {
            return Ok(at as u32 + 2);
        }
        Err(match_bail("no `=>` after a case pattern"))
    }

    /// The end of a case body, its own parentheses included.
    ///
    /// Hermes leaves a node's parentheses out of its range, and a case's range
    /// ends where its body's does, so `1 => (a, b)` reports an end before the
    /// `)`. The parentheses opened between the `=>` and the body are counted,
    /// and that many closing ones are stepped over.
    fn body_end(&self, arrow: u32, body: Node) -> Result<u32, Bail> {
        let mut at = self.skip_trivia(arrow as usize);
        let mut depth = 0usize;
        while at < body.start as usize {
            if self.source.get(at) != Some(&b'(') {
                return Err(match_bail("unexpected syntax before a case body"));
            }
            depth += 1;
            at = self.skip_trivia(at + 1);
        }
        let mut end = body.end as usize;
        for _ in 0..depth {
            let closing = self.skip_trivia(end);
            if self.source.get(closing) != Some(&b')') {
                return Err(match_bail("unbalanced parentheses around a case body"));
            }
            end = closing + 1;
        }
        Ok(end as u32)
    }

    /// One pattern, into the conditions it tests and the bindings it
    /// introduces. Mirrors `analyzePattern`, in the order it produces them,
    /// because that order is the order they are written out in.
    fn analyze_pattern(
        &mut self,
        cursor: &mut Cursor<'a>,
        key: &mut Key,
        out: &mut Analysis,
        seen: &mut Vec<String>,
    ) -> Result<Range<u32>, Bail> {
        let Some(node) = cursor.node()? else {
            return Err(match_bail("empty pattern"));
        };
        let span = node.start..node.end;
        match node.kind {
            // `_`: no test at all, which is what makes a case a wildcard.
            kind::MATCH_WILDCARD_PATTERN => {}
            kind::MATCH_LITERAL_PATTERN => {
                cursor.skip_node()?;
                out.conditions.push(Condition::Equals {
                    key: key.clone(),
                    value: span.clone(),
                });
            }
            kind::MATCH_UNARY_PATTERN => {
                // `+1`, `-1`. The pattern reads as the value it compares
                // against, so the operator needs nothing of its own.
                let Some(argument) = cursor.peek_node()? else {
                    return Err(match_bail("unary pattern without an argument"));
                };
                if argument.kind == kind::NUMERIC_LITERAL && self.numeric_value(cursor)? == 0.0 {
                    // Which of `===` and `Object.is` this means is still open,
                    // so choosing one here would be inventing the semantics.
                    return Err(self.reject(
                        node.start,
                        "'+0' and '-0' are not yet supported in match unary patterns.",
                    ));
                }
                cursor.skip_node()?;
                cursor.label()?;
                out.conditions.push(Condition::Equals {
                    key: key.clone(),
                    value: span.clone(),
                });
            }
            // A bare name is a comparison against that variable, not a binding.
            kind::MATCH_IDENTIFIER_PATTERN => {
                let Some(id) = cursor.peek_node()? else {
                    return Err(match_bail("identifier pattern without a name"));
                };
                let name = identifier_name(cursor)
                    .ok_or_else(|| match_bail("identifier without a name"))?;
                self.remember(name);
                cursor.skip_node()?;
                out.conditions.push(if name == b"NaN" {
                    Condition::NotANumber { key: key.clone() }
                } else {
                    Condition::Equals {
                        key: key.clone(),
                        value: id.start..id.end,
                    }
                });
            }
            // `foo.bar`, `foo[1].baz`: the pattern reads as the expression it
            // compares against.
            kind::MATCH_MEMBER_PATTERN => {
                self.skip_reference_fields(node, cursor)?;
                out.conditions.push(Condition::Equals {
                    key: key.clone(),
                    value: span.clone(),
                });
            }
            kind::MATCH_BINDING_PATTERN => {
                let (kind, name) = self.binding_fields(node.start, cursor)?;
                out.bindings.push(Binding::Value {
                    key: key.clone(),
                    kind,
                    name: self.declare(seen, node.start, name)?,
                });
            }
            kind::MATCH_AS_PATTERN => {
                let Some(inner) = cursor.peek_node()? else {
                    return Err(match_bail("`as` without a pattern"));
                };
                if inner.kind == kind::MATCH_BINDING_PATTERN {
                    return Err(self.reject(
                        node.start,
                        "Match 'as' patterns are not allowed directly on binding patterns.",
                    ));
                }
                self.analyze_pattern(cursor, key, out, seen)?;
                let Some(target) = cursor.peek_node()? else {
                    return Err(match_bail("`as` without a target"));
                };
                let (kind, name) = match target.kind {
                    kind::IDENTIFIER => {
                        let name = identifier_name(cursor)
                            .ok_or_else(|| match_bail("`as` target without a name"))?;
                        cursor.skip_node()?;
                        ("const", text(name)?)
                    }
                    kind::MATCH_BINDING_PATTERN => {
                        cursor.node()?;
                        self.binding_fields(node.start, cursor)?
                    }
                    _ => return Err(match_bail(target.name())),
                };
                out.bindings.push(Binding::Value {
                    key: key.clone(),
                    kind,
                    name: self.declare(seen, node.start, name)?,
                });
            }
            kind::MATCH_ARRAY_PATTERN => {
                // The length check comes first but depends on the rest, which
                // is read last, so the elements are analysed to one side.
                let length = cursor.list_len()? as usize;
                let mut elements = Analysis::default();
                for index in 0..length {
                    key.push(Step::Index(index.to_string()));
                    self.analyze_pattern(cursor, key, &mut elements, seen)?;
                    key.pop();
                }
                let (rest, binding) = self.rest_pattern(cursor, seen)?;
                out.conditions.push(Condition::Array {
                    key: key.clone(),
                    length,
                    exact: !rest,
                });
                out.conditions.append(&mut elements.conditions);
                out.bindings.append(&mut elements.bindings);
                if let Some((kind, name)) = binding {
                    out.bindings.push(Binding::ArrayRest {
                        key: key.clone(),
                        kind,
                        name,
                        after: length,
                    });
                }
            }
            kind::MATCH_OBJECT_PATTERN => {
                out.conditions.push(Condition::Object { key: key.clone() });
                self.analyze_properties(cursor, key, out, seen)?;
            }
            // `Foo {a: 1}`: an `instanceof` in place of the object check, and
            // the same properties underneath it.
            kind::MATCH_INSTANCE_PATTERN => {
                let Some(constructor) = cursor.peek_node()? else {
                    return Err(match_bail("instance pattern without a constructor"));
                };
                self.skip_reference_pattern(cursor)?;
                out.conditions.push(Condition::Instance {
                    key: key.clone(),
                    constructor: constructor.start..constructor.end,
                });
                let Some(properties) = cursor.node()? else {
                    return Err(match_bail("instance pattern without properties"));
                };
                if properties.kind != kind::MATCH_INSTANCE_OBJECT_PATTERN {
                    return Err(match_bail(properties.name()));
                }
                self.analyze_properties(cursor, key, out, seen)?;
            }
            kind::MATCH_OR_PATTERN => {
                let count = cursor.list_len()?;
                let mut branches = Vec::with_capacity(count as usize);
                let mut wildcard = false;
                for _ in 0..count {
                    let mut branch = Analysis::default();
                    self.analyze_pattern(cursor, key, &mut branch, seen)?;
                    if !branch.bindings.is_empty() {
                        // What an alternative that binds a name the others do
                        // not should mean is unspecified, so this is refused
                        // rather than guessed at.
                        return Err(self.reject(
                            node.start,
                            "Bindings in match 'or' patterns are not yet supported.",
                        ));
                    }
                    // An alternative that tests nothing matches everything, so
                    // the whole alternation does.
                    wildcard |= branch.conditions.is_empty();
                    branches.push(branch.conditions);
                }
                if !wildcard {
                    out.conditions.push(Condition::Or(branches));
                }
            }
            _ => return Err(match_bail(node.name())),
        }
        Ok(span)
    }

    /// The properties of an object or instance pattern, in
    /// `analyzeProperties`' order: each property's existence check, then what
    /// its own pattern tests, and the rest binding after all of them.
    fn analyze_properties(
        &mut self,
        cursor: &mut Cursor<'a>,
        key: &mut Key,
        out: &mut Analysis,
        seen: &mut Vec<String>,
    ) -> Result<(), Bail> {
        let count = cursor.list_len()?;
        let mut exclude = Vec::with_capacity(count as usize);
        let mut names: Vec<String> = Vec::with_capacity(count as usize);
        for _ in 0..count {
            let Some(property) = cursor.node()? else {
                return Err(match_bail("empty object pattern property"));
            };
            if property.kind != kind::MATCH_OBJECT_PATTERN_PROPERTY {
                return Err(match_bail(property.name()));
            }
            let (step, literal, name) = self.property_key(cursor)?;
            if names.contains(&name) {
                return Err(self.reject(
                    property.start,
                    &format!("Duplicate property name '{name}' in match object pattern."),
                ));
            }
            names.push(name);
            exclude.push(step.clone());
            if self.needs_property_exists(cursor)? {
                out.conditions.push(Condition::PropertyExists {
                    key: key.clone(),
                    literal,
                });
            }
            key.push(step);
            self.analyze_pattern(cursor, key, out, seen)?;
            key.pop();
            cursor.boolean()?; // shorthand
        }
        if let (_, Some((kind, name))) = self.rest_pattern(cursor, seen)? {
            out.bindings.push(Binding::ObjectRest {
                key: key.clone(),
                kind,
                name,
                exclude,
            });
        }
        Ok(())
    }

    /// A property key: how to reach the property, the literal that tests
    /// whether it is there, and the name duplicates are compared on.
    fn property_key(&mut self, cursor: &mut Cursor<'a>) -> Result<(Step, String, String), Bail> {
        let Some(node) = cursor.peek_node()? else {
            return Err(match_bail("property without a key"));
        };
        let source = self.source_str()?;
        let written = &source[node.start as usize..node.end as usize];
        let key = match node.kind {
            kind::IDENTIFIER => {
                // A shorthand property's key carries the range of the token
                // after it, so the name comes from the label instead.
                let name =
                    text(identifier_name(cursor).ok_or_else(|| match_bail("key without a name"))?)?;
                (Step::Field(name.clone()), format!("\"{name}\""), name)
            }
            // The literal as written is already the string the `in` test
            // needs, escapes and quote style included.
            kind::STRING_LITERAL => {
                let value = text(self.string_value(cursor)?)?;
                (Step::Index(written.to_owned()), written.to_owned(), value)
            }
            // A numeric key is a property name, and the name is the number as
            // JavaScript prints it: `{0x10: …}` is the property `"16"`. The
            // literal keeps its own text for the lookup, where the value is
            // what matters, and the printed form is what the `in` test and
            // duplicate detection compare.
            kind::NUMERIC_LITERAL => {
                let printed = number_text(self.numeric_value(cursor)?)
                    .ok_or_else(|| match_bail("numeric object pattern key"))?;
                (
                    Step::Index(written.to_owned()),
                    format!("\"{printed}\""),
                    printed,
                )
            }
            _ => return Err(match_bail(node.name())),
        };
        cursor.skip_node()?;
        Ok(key)
    }

    /// `needsPropExistsCond`: whether a property's pattern could match a
    /// property that is not there, so its presence has to be tested on its own.
    fn needs_property_exists(&self, cursor: &Cursor<'a>) -> Result<bool, Bail> {
        let mut probe = *cursor;
        let Some(node) = probe.node()? else {
            return Ok(false);
        };
        Ok(match node.kind {
            kind::MATCH_WILDCARD_PATTERN
            | kind::MATCH_BINDING_PATTERN
            | kind::MATCH_IDENTIFIER_PATTERN
            | kind::MATCH_MEMBER_PATTERN => true,
            kind::MATCH_AS_PATTERN => self.needs_property_exists(&probe)?,
            kind::MATCH_OR_PATTERN => {
                let count = probe.list_len()?;
                let mut any = false;
                for _ in 0..count {
                    any |= self.needs_property_exists(&probe)?;
                    probe.skip_node()?;
                }
                any
            }
            _ => false,
        })
    }

    /// The `...`, `...const rest`, or nothing an object or array pattern ends
    /// with. Reports whether one was written, which is what turns an array's
    /// length check from `===` into `>=`.
    fn rest_pattern(
        &mut self,
        cursor: &mut Cursor<'a>,
        seen: &mut Vec<String>,
    ) -> Result<(bool, Option<Binder>), Bail> {
        let Some(node) = cursor.node()? else {
            return Ok((false, None));
        };
        if node.kind != kind::MATCH_REST_PATTERN {
            return Err(match_bail(node.name()));
        }
        let Some(argument) = cursor.peek_node()? else {
            cursor.skip_node()?;
            return Ok((true, None));
        };
        if argument.kind != kind::MATCH_BINDING_PATTERN {
            return Err(match_bail(argument.name()));
        }
        cursor.node()?;
        let (kind, name) = self.binding_fields(argument.start, cursor)?;
        Ok((
            true,
            Some((kind, self.declare(seen, argument.start, name)?)),
        ))
    }

    /// Records a binding name for a case, refusing a repeat the way
    /// `checkDuplicateBindingName` does.
    fn declare(&self, seen: &mut Vec<String>, at: u32, name: String) -> Result<String, Bail> {
        if seen.contains(&name) {
            return Err(self.reject(
                at,
                &format!("Duplicate variable name '{name}' in match case pattern."),
            ));
        }
        seen.push(name.clone());
        Ok(name)
    }

    /// The `kind` and name of a `MatchBindingPattern` whose header was read.
    ///
    /// The name comes from the label rather than the range: Hermes reports the
    /// range of the token *after* a binding's identifier, so its span points at
    /// the wrong bytes and only the label is usable.
    fn binding_fields(&mut self, at: u32, cursor: &mut Cursor<'a>) -> Result<Binder, Bail> {
        let name = identifier_name(cursor).ok_or_else(|| match_bail("binding without a name"))?;
        cursor.skip_node()?;
        let kind = match cursor.label()? {
            Some(b"const") => "const",
            Some(b"let") => "let",
            // A `var` would hoist out of the case it was written in.
            _ => {
                return Err(
                    self.reject(at, "'var' bindings are not allowed. Use 'const' or 'let'.")
                );
            }
        };
        Ok((kind, text(name)?))
    }

    /// Steps over a pattern that names a value rather than testing one — a
    /// member pattern's base, an instance pattern's constructor — remembering
    /// the identifier it starts at, which the output references.
    fn skip_reference_pattern(&mut self, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        let Some(node) = cursor.node()? else {
            return Err(match_bail("empty pattern"));
        };
        self.skip_reference_fields(node, cursor)
    }

    /// The same, for a node whose header has already been read.
    fn skip_reference_fields(&mut self, node: Node, cursor: &mut Cursor<'a>) -> Result<(), Bail> {
        match node.kind {
            kind::MATCH_IDENTIFIER_PATTERN => {
                if let Some(name) = identifier_name(cursor) {
                    self.remember(name);
                }
                cursor.skip_node()?;
            }
            kind::MATCH_MEMBER_PATTERN => {
                self.skip_reference_pattern(cursor)?; // base
                cursor.skip_node()?; // property
            }
            _ => return Err(match_bail(node.name())),
        }
        Ok(())
    }

    /// The value of the numeric literal the cursor is parked on.
    fn numeric_value(&self, cursor: &Cursor<'a>) -> Result<f64, Bail> {
        let mut probe = *cursor;
        probe.node()?;
        Ok(probe.number()?)
    }

    /// The decoded value of the string literal the cursor is parked on.
    fn string_value(&self, cursor: &Cursor<'a>) -> Result<&'a [u8], Bail> {
        let mut probe = *cursor;
        probe.node()?;
        probe
            .label()?
            .ok_or_else(|| match_bail("string literal without a value"))
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
            let mark = self.edits.len();
            if !self.import_specifier_is_type_only(node, cursor)? {
                continue;
            }
            type_only += 1;
            self.edits.truncate(mark);
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
            self.edits.truncate(seen.mark);
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

/// What a pattern produced, before it is laid out over the source.
#[derive(Default)]
struct Analysis {
    conditions: Vec<Condition>,
    bindings: Vec<Binding>,
}

/// What a binding declares: `const` or `let`, and the name.
type Binder = (&'static str, String);

/// The cases of one construct, up to and including a wildcard.
struct Cases {
    cases: Vec<MatchCase>,
    has_bindings: bool,
    has_wildcard: bool,
}

fn match_bail(detail: &str) -> Bail {
    Bail::new(BailKind::Proposal, format!("match: {detail}"))
}

/// A label as text. Hermes' labels are its own "modified UTF-8", and a name
/// that does not read back as UTF-8 is not one this can write out again.
fn text(bytes: &[u8]) -> Result<String, Bail> {
    std::str::from_utf8(bytes)
        .map(str::to_owned)
        .map_err(|_| match_bail("name is not UTF-8"))
}

/// A number as `String(value)` would print it.
///
/// Both languages print the shortest decimal that reads back as the same
/// double, and that decimal is unique, so the two agree — except about when to
/// switch to exponential notation, which JavaScript does outside `[1e-6, 1e21)`
/// and Rust's `Display` never does. Outside the band where they agree the
/// caller is told so rather than given a name that would be subtly wrong.
fn number_text(value: f64) -> Option<String> {
    if value == 0.0 {
        return Some("0".to_owned());
    }
    // A property key is written as a literal, so it is never negative.
    (value.is_finite() && (1e-6..1e21).contains(&value)).then(|| format!("{value}"))
}

/// What bounds an `await` or a `yield`. A component or a hook is one too: both
/// are functions, and the transform beside this one only changes their keyword.
fn is_function(kind: u32) -> bool {
    matches!(
        kind,
        kind::FUNCTION_DECLARATION
            | kind::FUNCTION_EXPRESSION
            | kind::ARROW_FUNCTION_EXPRESSION
            | kind::COMPONENT_DECLARATION
            | kind::HOOK_DECLARATION
    )
}

/// The `Literal` node kinds, which are one node in ESTree and several here.
fn is_literal(kind: u32) -> bool {
    matches!(
        kind,
        kind::NULL_LITERAL
            | kind::BOOLEAN_LITERAL
            | kind::STRING_LITERAL
            | kind::NUMERIC_LITERAL
            | kind::REG_EXP_LITERAL
            | kind::BIG_INT_LITERAL
    )
}

/// The text of a span once the edits collected inside it are applied.
///
/// Only a transform that moves a piece of source needs this: everything else
/// leaves the bytes where they are and lets the piece table compose the two.
/// The text it returns carries no mapping back to the source, which is the
/// price of moving it.
fn rendered(source: &str, span: Range<u32>, edits: Vec<Edit>) -> Result<String, Bail> {
    let mut out = String::new();
    let mut at = span.start;
    for edit in merge(edits)? {
        out.push_str(&source[at as usize..edit.span.start as usize]);
        if let Some(content) = &edit.content {
            out.push_str(content);
        }
        at = edit.span.end;
    }
    out.push_str(&source[at as usize..span.end as usize]);
    Ok(out)
}

/// The `name` of the `Identifier` whose header the cursor has just read.
fn peek_label<'a>(cursor: &Cursor<'a>) -> Option<&'a [u8]> {
    let mut probe = *cursor;
    probe.label().ok().flatten()
}

/// The range an identifier's name occupies, which is the head of its own range
/// — the rest is the type annotation and any `?`.
fn name_span(identifier: Node, name: &[u8]) -> Range<u32> {
    identifier.start..identifier.start + name.len() as u32
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
