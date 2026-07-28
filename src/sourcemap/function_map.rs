use napi::{Error, Status};
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{AstKind, ast::MethodDefinitionKind};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, SemanticBuilder};
use oxc_span::{GetSpan, Span};
use oxc_syntax::node::NodeId;
use rustc_hash::FxHashMap;

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
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_check_syntax_error(true)
        .build(&parsed.program);
    if !semantic_return.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Oxc semantic analysis failed: {:?}",
                semantic_return.diagnostics
            ),
        ));
    }
    let mut collector =
        FunctionMapCollector::new(source, semantic_return.semantic.nodes(), filename);
    collector.visit_program(&parsed.program);
    Ok(collector.finish())
}

#[derive(Clone, Copy, PartialEq, Eq)]
struct Position {
    line: u32,
    column: u32,
}

pub(crate) struct FunctionMapCollector<'a> {
    source: &'a str,
    nodes: &'a AstNodes<'a>,
    encoder: MappingEncoder,
    stack: Vec<Rc<str>>,
    tail: Position,
    tail_name: Option<Rc<str>>,
    line_starts: Vec<usize>,
    filename_prefix: Option<String>,
}

impl FunctionMapCollector<'_> {
    pub(crate) fn new<'a>(
        source: &'a str,
        nodes: &'a AstNodes<'a>,
        filename: &str,
    ) -> FunctionMapCollector<'a> {
        FunctionMapCollector {
            source,
            nodes,
            encoder: MappingEncoder::default(),
            stack: Vec::new(),
            tail: Position { line: 1, column: 0 },
            tail_name: None,
            line_starts: line_starts(source),
            filename_prefix: filename
                .rsplit(['/', '\\'])
                .next()
                .and_then(|name| name.split('.').next())
                .filter(|name| !name.is_empty())
                .map(str::to_owned),
        }
    }

    pub(crate) fn enter(&mut self, kind: AstKind<'_>) {
        if matches!(
            kind,
            AstKind::Program(_)
                | AstKind::Function(_)
                | AstKind::ArrowFunctionExpression(_)
                | AstKind::Class(_)
        ) {
            self.advance(self.position(self.frame_span(kind).start));
            let name = self.remove_filename_prefix(self.frame_name(kind));
            self.stack.push(Rc::from(name));
        }
    }

    pub(crate) fn leave(&mut self, kind: AstKind<'_>) {
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
                .names
                .into_iter()
                .map(|name| name.as_ref().to_owned())
                .collect(),
            mappings: self.encoder.mappings,
        }
    }

    fn frame_span(&self, kind: AstKind<'_>) -> Span {
        let id = kind.node_id();
        if matches!(kind, AstKind::Function(_)) && id.index() != 0 {
            match self.nodes.parent_kind(id) {
                AstKind::MethodDefinition(method) => return method.span,
                AstKind::ObjectProperty(property) if property.method => return property.span,
                _ => {}
            }
        }
        kind.span()
    }

    fn position(&self, offset: u32) -> Position {
        let offset = offset as usize;
        let line_index = self.line_starts.partition_point(|start| *start <= offset) - 1;
        Position {
            line: line_index as u32 + 1,
            column: self.source[self.line_starts[line_index]..offset]
                .encode_utf16()
                .count() as u32,
        }
    }

    fn advance(&mut self, position: Position) {
        if position_greater(position, self.tail)
            && let Some(name) = self.stack.last().cloned()
            && self.tail_name.as_ref() != Some(&name)
        {
            self.encoder.push(Rc::clone(&name), self.tail);
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
        let id = kind.node_id();
        if id.index() != 0 {
            match self.nodes.parent_kind(id) {
                AstKind::VariableDeclarator(declarator) => {
                    return self.name_from_span(declarator.id.span());
                }
                AstKind::AssignmentExpression(assignment) => {
                    return self.name_from_span(assignment.left.span());
                }
                AstKind::MethodDefinition(method) => {
                    let class_name = self.nodes.ancestors(id).find_map(|node| match node.kind() {
                        AstKind::Class(class) => class
                            .id
                            .as_ref()
                            .map(|identifier| identifier.name.to_string()),
                        _ => None,
                    });
                    let mut name = self.property_name(&method.key);
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
                    if let Some(object_name) = self.container_name(self.nodes.parent_id(id)) {
                        return format!("{object_name}.{property_name}");
                    }
                    return property_name;
                }
                AstKind::PropertyDefinition(property) => {
                    let property_name = self.property_name(&property.key);
                    let class_name = self.nodes.ancestors(id).find_map(|node| match node.kind() {
                        AstKind::Class(class) => class
                            .id
                            .as_ref()
                            .map(|identifier| identifier.name.to_string()),
                        _ => None,
                    });
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
                        let callee = self.name_from_span(call.callee.span());
                        if argument_index == 0
                            && (callee == "Object.freeze"
                                || callee == "useCallback"
                                || callee == "React.useCallback")
                        {
                            return self
                                .container_name(self.nodes.parent_id(id))
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
                            self.name_from_span(call.callee.span())
                        );
                    }
                }
                AstKind::ExportDefaultDeclaration(_) => return "default".into(),
                _ => {}
            }
        }
        "<anonymous>".into()
    }

    fn name_from_span(&self, span: Span) -> String {
        let value = self.source[span.start as usize..span.end as usize].trim();
        if value.is_empty() {
            "<anonymous>".into()
        } else {
            value.to_owned()
        }
    }

    fn property_name(&self, key: &oxc_ast::ast::PropertyKey<'_>) -> String {
        if let Some(name) = key.static_name() {
            return name.strip_prefix("Symbol.").map_or_else(
                || name.clone().into_owned(),
                |property| format!("@@{property}"),
            );
        }
        let source = self.name_from_span(key.span());
        if let Some(property) = source.strip_prefix("Symbol.") {
            format!("@@{property}")
        } else {
            source
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

    fn container_name(&self, id: NodeId) -> Option<String> {
        for (ancestor_id, ancestor) in self.nodes.ancestors_enumerated(id) {
            match ancestor.kind() {
                AstKind::VariableDeclarator(declarator) => {
                    return Some(self.name_from_span(declarator.id.span()));
                }
                AstKind::AssignmentExpression(assignment) => {
                    return Some(self.name_from_span(assignment.left.span()));
                }
                AstKind::ObjectProperty(property) => {
                    let property_name = self.property_name(&property.key);
                    if let Some(owner) = self.container_name(ancestor_id) {
                        return Some(format!("{owner}.{property_name}"));
                    }
                    return Some(property_name);
                }
                AstKind::CallExpression(call) => {
                    return Some(self.name_from_span(call.callee.span()));
                }
                _ => {}
            }
        }
        None
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
    name_indexes: FxHashMap<Rc<str>, i64>,
    mappings: String,
    previous_line: i64,
    previous_column: i64,
    previous_name: i64,
    line_has_segment: bool,
}

impl MappingEncoder {
    fn push(&mut self, name: Rc<str>, position: Position) {
        let name_index = if let Some(index) = self.name_indexes.get(name.as_ref()) {
            *index
        } else {
            let index = self.names.len() as i64;
            self.names.push(Rc::clone(&name));
            self.name_indexes.insert(name, index);
            index
        };
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
    starts.extend(
        source
            .bytes()
            .enumerate()
            .filter_map(|(index, byte)| (byte == b'\n').then_some(index + 1)),
    );
    starts
}

fn position_greater(left: Position, right: Position) -> bool {
    left.line > right.line || (left.line == right.line && left.column > right.column)
}
use std::rc::Rc;
