use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{
    AstKind,
    ast::{Expression, MethodDefinitionKind},
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, Span};
use rustc_hash::FxHashMap;
use std::borrow::Cow;
use std::rc::Rc;

use super::vlq;
use crate::syntax::classification::source_type;

#[derive(Clone)]
#[napi(object)]
pub struct FunctionMap {
    pub names: Vec<String>,
    pub mappings: String,
}

pub fn generate(source: &str, filename: &str) -> napi::Result<FunctionMap> {
    let allocator = Allocator::default();
    // A preserved script hashbang can appear below a generated Metro wrapper.
    // Oxc only accepts hashbang syntax at byte zero. Reinterpret those two bytes
    // as a comment for this structural parse; byte offsets and UTF-16 columns
    // remain identical to the returned source.
    let parse_source = if source.as_bytes().windows(3).any(|window| window == b"\n#!") {
        Cow::Owned(source.replace("\n#!", "\n//"))
    } else {
        Cow::Borrowed(source)
    };
    let parsed = Parser::new(
        &allocator,
        &parse_source,
        source_type(filename, &parse_source)?,
    )
    .parse();
    if !parsed.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "function-map",
        ));
    }
    let mut collector = FunctionMapCollector::new(source, filename);
    collector.visit_program(&parsed.program);
    Ok(collector.finish())
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Position {
    line: u32,
    column: u32,
}

pub(crate) struct FunctionMapCollector<'a> {
    source: &'a str,
    ancestors: Vec<AstKind<'a>>,
    encoder: MappingEncoder,
    stack: Vec<usize>,
    tail: Position,
    tail_name: Option<usize>,
    line_starts: Vec<usize>,
    /// Byte offset to UTF-16 offset for non-ASCII source. Function-map
    /// collection asks for two positions per function/class. Recounting from
    /// the start of the line at every boundary is quadratic for generated or
    /// minified files that put many functions on one line.
    utf16_offsets: Option<Vec<u32>>,
    filename_prefix: Option<String>,
}

impl<'a> FunctionMapCollector<'a> {
    pub(crate) fn new(source: &'a str, filename: &str) -> FunctionMapCollector<'a> {
        FunctionMapCollector {
            source,
            ancestors: Vec::new(),
            encoder: MappingEncoder::default(),
            stack: Vec::new(),
            tail: Position { line: 1, column: 0 },
            tail_name: None,
            line_starts: line_starts(source),
            utf16_offsets: (!source.is_ascii()).then(|| {
                let mut offsets = Vec::with_capacity(source.len() + 1);
                let mut utf16 = 0u32;
                for character in source.chars() {
                    offsets.extend(std::iter::repeat_n(utf16, character.len_utf8()));
                    utf16 += character.len_utf16() as u32;
                }
                offsets.push(utf16);
                offsets
            }),
            filename_prefix: filename
                .rsplit(['/', '\\'])
                .next()
                .and_then(|name| name.split('.').next())
                .filter(|name| !name.is_empty())
                .map(str::to_owned),
        }
    }

    pub(crate) fn enter(&mut self, kind: AstKind<'a>) {
        if matches!(
            kind,
            AstKind::Program(_)
                | AstKind::Function(_)
                | AstKind::ArrowFunctionExpression(_)
                | AstKind::Class(_)
        ) {
            self.advance(self.position(self.frame_span(kind).start));
            let name = self.remove_filename_prefix(self.frame_name(kind));
            let name = self.encoder.intern(name);
            self.stack.push(name);
        }
        self.ancestors.push(kind);
    }

    pub(crate) fn leave(&mut self, kind: AstKind<'a>) {
        self.ancestors.pop();
        if matches!(
            kind,
            AstKind::Program(_)
                | AstKind::Function(_)
                | AstKind::ArrowFunctionExpression(_)
                | AstKind::Class(_)
        ) {
            self.advance(self.position(self.frame_span(kind).end));
            self.stack.pop();
        }
    }

    pub(crate) fn finish(self) -> FunctionMap {
        FunctionMap {
            names: self
                .encoder
                .emitted_names
                .iter()
                .map(|&id| self.encoder.names[id].to_string())
                .collect(),
            mappings: self.encoder.mappings,
        }
    }

    fn frame_span(&self, kind: AstKind<'_>) -> Span {
        if matches!(kind, AstKind::Function(_)) {
            match self.ancestors.last() {
                Some(AstKind::MethodDefinition(method)) => return method.span,
                Some(AstKind::ObjectProperty(property)) if property.method => return property.span,
                _ => {}
            }
        }
        kind.span()
    }

    fn position(&self, offset: u32) -> Position {
        let offset = offset as usize;
        let line_index = self.line_starts.partition_point(|start| *start <= offset) - 1;
        let line_start = self.line_starts[line_index];
        Position {
            line: line_index as u32 + 1,
            column: self
                .utf16_offsets
                .as_ref()
                .map_or((offset - line_start) as u32, |offsets| {
                    offsets[offset] - offsets[line_start]
                }),
        }
    }

    fn advance(&mut self, position: Position) {
        if position_greater(position, self.tail)
            && let Some(name) = self.stack.last().copied()
            && self.tail_name.as_ref() != Some(&name)
        {
            self.encoder.push(name, self.tail);
            self.tail_name = Some(name);
        }
        self.tail = position;
    }

    fn frame_name(&self, kind: AstKind<'_>) -> String {
        match kind {
            AstKind::Program(_) => "<global>".into(),
            AstKind::Function(function) => function
                .id
                .as_ref()
                .map_or_else(|| self.inferred_name(kind), |id| id.name.to_string()),
            AstKind::Class(class) => class
                .id
                .as_ref()
                .map_or_else(|| self.inferred_name(kind), |id| id.name.to_string()),
            AstKind::ArrowFunctionExpression(_) => self.inferred_name(kind),
            _ => "<anonymous>".into(),
        }
    }

    fn inferred_name(&self, kind: AstKind<'_>) -> String {
        if let Some(parent) = self.ancestors.last().copied() {
            if matches!(parent, AstKind::JSXExpressionContainer(_))
                && let Some(name) = self.jsx_expression_name()
            {
                return name;
            }
            match parent {
                AstKind::VariableDeclarator(declarator) => {
                    return self
                        .name_from_id_span(declarator.id.span())
                        .unwrap_or_else(|| "<anonymous>".into());
                }
                AstKind::AssignmentExpression(assignment) => {
                    return self
                        .name_from_id_span(assignment.left.span())
                        .unwrap_or_else(|| "<anonymous>".into());
                }
                AstKind::MethodDefinition(method) => {
                    let class_name = self
                        .stack
                        .last()
                        .map(|&id| self.encoder.names[id].to_string());
                    let mut name = self.property_name(&method.key);
                    if name == "<anonymous>" {
                        return name;
                    }
                    match method.kind {
                        MethodDefinitionKind::Get => name = format!("get__{name}"),
                        MethodDefinitionKind::Set => name = format!("set__{name}"),
                        MethodDefinitionKind::Method | MethodDefinitionKind::Constructor => {}
                    }
                    return class_name.map_or(name.clone(), |class_name| {
                        format!(
                            "{class_name}{}{name}",
                            if method.r#static { "." } else { "#" }
                        )
                    });
                }
                AstKind::ObjectProperty(property) => {
                    let property_name = self.property_name(&property.key);
                    if property_name == "<anonymous>" {
                        return property_name;
                    }
                    if let Some(object_name) =
                        self.container_name(&self.ancestors[..self.ancestors.len() - 1])
                    {
                        return format!("{object_name}.{property_name}");
                    }
                    return property_name;
                }
                AstKind::PropertyDefinition(property) => {
                    let property_name = self.property_name(&property.key);
                    let class_name = self
                        .stack
                        .last()
                        .map(|&id| self.encoder.names[id].to_string());
                    return class_name.map_or(property_name.clone(), |class_name| {
                        format!(
                            "{class_name}{}{property_name}",
                            if property.r#static { "." } else { "#" }
                        )
                    });
                }
                AstKind::CallExpression(call) => {
                    if let Some(argument_index) = call
                        .arguments
                        .iter()
                        .position(|argument| argument.span() == kind.span())
                    {
                        let callee = self.callee_name(&call.callee);
                        if argument_index == 0
                            && (callee == "Object.freeze"
                                || callee == "useCallback"
                                || callee == "React.useCallback")
                        {
                            return self
                                .container_name(&self.ancestors[..self.ancestors.len() - 1])
                                .unwrap_or_else(|| "<anonymous>".into());
                        }
                        return format!("{callee}$argument_{argument_index}");
                    }
                }
                AstKind::NewExpression(call) => {
                    if let Some(argument_index) = call
                        .arguments
                        .iter()
                        .position(|argument| argument.span() == kind.span())
                    {
                        return format!(
                            "{}$argument_{argument_index}",
                            self.callee_name(&call.callee)
                        );
                    }
                }
                AstKind::ExportDefaultDeclaration(_) => return "default".into(),
                AstKind::ParenthesizedExpression(_) => {
                    return self
                        .container_name(&self.ancestors)
                        .unwrap_or_else(|| "<anonymous>".into());
                }
                _ => {}
            }
        }
        "<anonymous>".into()
    }

    fn jsx_expression_name(&self) -> Option<String> {
        let mut attribute = None;
        for ancestor in self.ancestors.iter().rev().skip(1) {
            match ancestor {
                AstKind::JSXAttribute(candidate) => attribute = Some(*candidate),
                AstKind::JSXOpeningElement(opening) => {
                    let element = self.name_from_span(opening.name.span());
                    return Some(attribute.map_or_else(
                        || format!("{element}.props.children"),
                        |attribute| {
                            format!(
                                "{element}.props.{}",
                                self.name_from_span(attribute.name.span())
                            )
                        },
                    ));
                }
                AstKind::JSXElement(element) => {
                    let name = self.name_from_span(element.opening_element.name.span());
                    return Some(format!("{name}.props.children"));
                }
                _ => {}
            }
        }
        None
    }

    fn name_from_span(&self, span: Span) -> String {
        let value = self.source[span.start as usize..span.end as usize].trim();
        if value.is_empty() {
            "<anonymous>".into()
        } else {
            value.to_owned()
        }
    }

    // Only identifier/member paths can name a call. Never copy arbitrary callee
    // source: an IIFE can contain the entire rest of the file.
    fn callee_name(&self, mut callee: &Expression<'_>) -> String {
        let mut parts = Vec::new();
        loop {
            match callee {
                Expression::Identifier(identifier) => {
                    parts.push(metro_identifier(&identifier.name));
                    break;
                }
                Expression::ThisExpression(_) => {
                    parts.push("this".into());
                    break;
                }
                Expression::StaticMemberExpression(member) => {
                    parts.push(metro_identifier(&member.property.name));
                    callee = &member.object;
                }
                Expression::ComputedMemberExpression(member) => {
                    let Expression::StringLiteral(property) = &member.expression else {
                        return "<anonymous>".into();
                    };
                    parts.push(metro_identifier(&property.value));
                    callee = &member.object;
                }
                Expression::ParenthesizedExpression(parenthesized) => {
                    callee = &parenthesized.expression;
                }
                _ => return "<anonymous>".into(),
            }
        }
        parts.reverse();
        metro_name_from_parts(&parts).unwrap_or_else(|| "<anonymous>".into())
    }

    fn property_name(&self, key: &oxc_ast::ast::PropertyKey<'_>) -> String {
        if matches!(key, oxc_ast::ast::PropertyKey::PrivateIdentifier(_)) {
            // TODO: Consider preserving private names (for example `Foo##method`)
            // if the added stack context outweighs strict Metro compatibility.
            return "<anonymous>".into();
        }
        if let Some(name) = key.static_name() {
            return name.strip_prefix("Symbol.").map_or_else(
                || metro_identifier(&name),
                |property| format!("@@{property}"),
            );
        }
        let source = self.name_from_span(key.span());
        if let Some(property) = source.strip_prefix("Symbol.") {
            format!("@@{property}")
        } else {
            metro_name_from_source(&source).unwrap_or_else(|| "<anonymous>".into())
        }
    }

    fn remove_filename_prefix(&self, name: String) -> String {
        let Some(prefix) = &self.filename_prefix else {
            return name;
        };
        let Some(suffix) = name.strip_prefix(prefix) else {
            return name;
        };
        let delimiter_bytes = suffix
            .bytes()
            .take_while(|byte| !byte.is_ascii_alphanumeric() && !matches!(byte, b'_' | b'$' | b'@'))
            .count();
        if delimiter_bytes == 0 || delimiter_bytes == suffix.len() {
            name
        } else {
            suffix[delimiter_bytes..].to_owned()
        }
    }

    fn container_name(&self, ancestors: &[AstKind<'_>]) -> Option<String> {
        let mut components = Vec::new();
        for ancestor in ancestors.iter().rev() {
            match ancestor {
                AstKind::VariableDeclarator(declarator) => {
                    if let Some(name) = self.name_from_id_span(declarator.id.span()) {
                        components.push(name);
                    }
                    break;
                }
                AstKind::AssignmentExpression(assignment) => {
                    if let Some(name) = self.name_from_id_span(assignment.left.span()) {
                        components.push(name);
                    }
                    break;
                }
                AstKind::ObjectProperty(property) => {
                    components.push(self.property_name(&property.key));
                }
                AstKind::CallExpression(call) => {
                    components.push(self.callee_name(&call.callee));
                    break;
                }
                _ => {}
            }
        }
        components.reverse();
        (!components.is_empty()).then(|| components.join("."))
    }

    fn name_from_id_span(&self, span: Span) -> Option<String> {
        metro_name_from_source(&self.source[span.start as usize..span.end as usize])
    }
}

fn metro_name_from_source(source: &str) -> Option<String> {
    let mut value = source.trim();
    while value.starts_with('(') && value.ends_with(')') {
        value = value[1..value.len() - 1].trim();
    }
    if value.is_empty() || value.starts_with(['{', '[', '#']) {
        return None;
    }
    let mut parts = Vec::new();
    for component in value.split('.') {
        let mut rest = component.trim();
        let bracket = rest.find('[');
        if let Some(index) = bracket {
            let head = &rest[..index];
            if !head.is_empty() {
                parts.push(metro_identifier(head));
            }
            rest = &rest[index..];
            while let Some(inner) = rest
                .strip_prefix('[')
                .and_then(|tail| tail.find(']').map(|end| &tail[..end]))
            {
                let quoted = inner
                    .trim()
                    .strip_prefix(['\'', '"'])
                    .and_then(|text| text.strip_suffix(['\'', '"']));
                let property = quoted?;
                parts.push(metro_identifier(property));
                rest = &rest[inner.len() + 2..];
            }
            if !rest.is_empty() {
                return None;
            }
        } else {
            if rest.contains(|character: char| {
                !character.is_alphanumeric() && !matches!(character, '_' | '$' | '@')
            }) {
                return None;
            }
            parts.push(metro_identifier(rest));
        }
    }
    metro_name_from_parts(&parts)
}

fn metro_name_from_parts(parts: &[String]) -> Option<String> {
    if parts.is_empty() {
        None
    } else if parts.len() > 5 {
        // TODO: Consider retaining complete member paths when metadata size is
        // less important than the intermediate context Metro intentionally drops.
        Some(format!(
            "{}.{}...{}.{}",
            parts[0],
            parts[1],
            parts[parts.len() - 2],
            parts[parts.len() - 1]
        ))
    } else {
        Some(parts.join("."))
    }
}

fn metro_identifier(value: &str) -> String {
    let mut result = String::new();
    let mut uppercase_next = false;
    for character in value.chars() {
        if character.is_ascii_alphanumeric() || matches!(character, '_' | '$' | '@') {
            if result.is_empty() && character.is_ascii_digit() {
                continue;
            }
            if uppercase_next {
                result.extend(character.to_uppercase());
                uppercase_next = false;
            } else {
                result.push(character);
            }
        } else {
            uppercase_next = !result.is_empty();
        }
    }
    // TODO: Consider retaining numeric keys instead of Metro's `_`; the latter
    // is compatible but can collapse distinct properties to the same name.
    if result.is_empty() {
        "_".into()
    } else {
        result
    }
}

impl<'a> Visit<'a> for FunctionMapCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.enter(kind);
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        self.leave(kind);
    }

    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

#[derive(Default)]
struct MappingEncoder {
    names: Vec<Rc<str>>,
    name_indexes: FxHashMap<Rc<str>, usize>,
    emitted_names: Vec<usize>,
    emitted_indexes: Vec<Option<i64>>,
    mappings: String,
    previous_line: i64,
    previous_column: i64,
    previous_name: i64,
    line_has_segment: bool,
}

impl MappingEncoder {
    fn intern(&mut self, name: String) -> usize {
        if let Some(&id) = self.name_indexes.get(name.as_str()) {
            return id;
        }
        let id = self.names.len();
        let name: Rc<str> = Rc::from(name);
        self.names.push(Rc::clone(&name));
        self.name_indexes.insert(name, id);
        self.emitted_indexes.push(None);
        id
    }

    fn push(&mut self, name: usize, position: Position) {
        // Assign output indexes at first emission, preserving name ordering and
        // omitting zero-width frames. Returning to a frame only touches IDs.
        let name_index = *self.emitted_indexes[name].get_or_insert_with(|| {
            let index = self.emitted_names.len() as i64;
            self.emitted_names.push(name);
            index
        });
        let line = i64::from(position.line);
        let column = i64::from(position.column);
        let line_delta = line - self.previous_line.max(1);
        let first_of_line = self.mappings.is_empty() || line_delta > 0;
        if line_delta > 0 {
            self.mappings.push(';');
            self.previous_column = 0;
            self.line_has_segment = false;
        } else if self.line_has_segment {
            self.mappings.push(',');
        }
        vlq::encode(column - self.previous_column, &mut self.mappings);
        vlq::encode(name_index - self.previous_name, &mut self.mappings);
        if first_of_line {
            vlq::encode(line_delta, &mut self.mappings);
        }
        self.previous_line = line;
        self.previous_column = column;
        self.previous_name = name_index;
        self.line_has_segment = true;
    }
}

fn line_starts(source: &str) -> Vec<usize> {
    let mut starts = vec![0];
    let mut characters = source.char_indices().peekable();
    while let Some((index, character)) = characters.next() {
        if character == '\r' && characters.peek().is_some_and(|(_, next)| *next == '\n') {
            characters.next();
            starts.push(index + 2);
        } else if matches!(character, '\n' | '\r' | '\u{2028}' | '\u{2029}') {
            starts.push(index + character.len_utf8());
        }
    }
    starts
}

fn position_greater(left: Position, right: Position) -> bool {
    left.line > right.line || (left.line == right.line && left.column > right.column)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn interning_preserves_first_emission_order_and_skips_unused_names() {
        let mut encoder = MappingEncoder::default();
        let unused = encoder.intern("unused".into());
        let outer = encoder.intern("outer".into());
        let inner = encoder.intern("inner".into());
        assert_eq!(encoder.intern("outer".into()), outer);
        encoder.push(inner, Position { line: 1, column: 0 });
        encoder.push(outer, Position { line: 1, column: 1 });
        encoder.push(inner, Position { line: 1, column: 2 });
        assert_eq!(encoder.emitted_names, vec![inner, outer]);
        assert_eq!(encoder.emitted_indexes[unused], None);
        assert_eq!(encoder.mappings, "AAA,CC,CD");
    }

    #[test]
    fn anonymous_iife_names_stay_bounded_as_sibling_count_grows() {
        for count in [250, 500, 1000] {
            let body = (0..count)
                .map(|index| format!("function sibling{index}(){{}}"))
                .collect::<String>();
            let map = generate(&format!("(function(){{{body}}})();"), "input.js").unwrap();
            assert_eq!(map.names.len(), count + 2);
            assert_eq!(&map.names[..2], &["<global>", "<anonymous>"]);
            assert!(map.names.iter().all(|name| name.len() < 32));
        }
    }

    #[test]
    fn positions_use_utf16_columns() {
        let ascii = FunctionMapCollector::new("one\ntwo", "fixture.js");
        assert_eq!(ascii.position(6), Position { line: 2, column: 2 });

        let unicode = FunctionMapCollector::new("😀x\né😀z", "fixture.js");
        assert_eq!(unicode.position(5), Position { line: 1, column: 3 });
        assert_eq!(unicode.position(12), Position { line: 2, column: 3 });
    }
}
