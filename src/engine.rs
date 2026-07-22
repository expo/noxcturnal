use std::time::Instant;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::{AstKind, ast::Expression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};

use crate::generated_event_schema::{
    ast_kind_protocol_id, field_key_id, field_key_name, node_type_id, node_type_name,
};
use crate::{editor, sourcemap};

#[napi(object)]
#[derive(Clone)]
pub struct NodeField {
    pub key: String,
    pub value: String,
}

#[napi(object)]
#[derive(Clone)]
pub struct NativeEvent {
    pub sequence: u32,
    pub side: String,
    pub id: u32,
    pub r#type: String,
    pub start: u32,
    pub end: u32,
    pub parent_id: Option<u32>,
    pub parent_type: Option<String>,
    pub scope_id: u32,
    pub scope_parent_id: Option<u32>,
    pub fields: Vec<NodeField>,
}

#[napi(object)]
pub struct FieldRequest {
    pub node_type: String,
    pub fields: Vec<String>,
}

#[napi(object)]
#[derive(Clone)]
pub struct Timings {
    pub parse_ms: f64,
    pub semantic_ms: f64,
    pub traversal_ms: f64,
    pub render_and_map_ms: f64,
}

#[napi(object)]
pub struct EventBatch {
    pub events: Vec<NativeEvent>,
    pub node_count: u32,
    pub emitted_count: u32,
    pub timings: Timings,
}

#[napi(object)]
pub struct PackedEventBatch {
    pub data: Buffer,
    pub strings: Vec<String>,
    pub node_count: u32,
    pub emitted_count: u32,
    pub timings: Timings,
}

struct PackedEventParts {
    data: Vec<u8>,
    strings: Vec<String>,
    node_count: u32,
    emitted_count: u32,
    timings: Timings,
}

#[napi(object)]
pub struct ParseClassification {
    pub syntax: String,
    pub supported: bool,
    pub codegen_candidate: bool,
    pub reason: String,
}

#[napi(object)]
pub struct NativeVlqMap {
    pub mappings: String,
    pub names: Vec<String>,
}

#[napi(object)]
pub struct NativeCommitResult {
    pub code: String,
    pub map: NativeVlqMap,
    pub timings: Timings,
}

#[napi]
pub struct NativeIndexedSession {
    source: String,
    filename: String,
    events: Vec<NativeEvent>,
    node_count: u32,
    timings: Timings,
    materialized_subscriptions: Vec<String>,
    closed: bool,
}

#[napi]
impl NativeIndexedSession {
    #[napi(constructor)]
    pub fn new(
        source: String,
        filename: String,
        subscriptions: Option<Vec<String>>,
    ) -> Result<Self> {
        let subscriptions = subscriptions.unwrap_or_default();
        let batch = if subscriptions.is_empty() {
            EventBatch {
                events: Vec::new(),
                node_count: 0,
                emitted_count: 0,
                timings: Timings {
                    parse_ms: 0.0,
                    semantic_ms: 0.0,
                    traversal_ms: 0.0,
                    render_and_map_ms: 0.0,
                },
            }
        } else {
            materialize(&source, &filename, &subscriptions, None, None, true)?
        };
        Ok(Self {
            source,
            filename,
            events: batch.events,
            node_count: batch.node_count,
            timings: batch.timings,
            materialized_subscriptions: subscriptions,
            closed: false,
        })
    }

    #[napi]
    pub fn next(
        &mut self,
        subscriptions: Vec<String>,
        root_start: Option<u32>,
        root_end: Option<u32>,
        field_requests: Option<Vec<FieldRequest>>,
    ) -> Result<EventBatch> {
        self.ensure_open()?;
        self.ensure_materialized(&subscriptions)?;
        let root = root_start.zip(root_end);
        let mut events: Vec<_> = self
            .events
            .iter()
            .filter(|event| {
                subscriptions
                    .iter()
                    .flat_map(|subscription| subscription.split('|'))
                    .any(|subscription| alias_matches(subscription, &event.r#type))
                    && root.is_none_or(|(start, end)| event.start >= start && event.end <= end)
            })
            .cloned()
            .collect();
        if let Some(requests) = field_requests {
            for event in &mut events {
                if let Some(request) = requests
                    .iter()
                    .find(|request| request.node_type == event.r#type)
                {
                    event
                        .fields
                        .retain(|field| request.fields.contains(&field.key));
                }
            }
        }
        Ok(EventBatch {
            emitted_count: events.len() as u32,
            events,
            node_count: self.node_count,
            timings: self.timings.clone(),
        })
    }

    #[napi]
    pub fn next_packed(
        &mut self,
        subscriptions: Vec<String>,
        root_start: Option<u32>,
        root_end: Option<u32>,
        field_requests: Option<Vec<FieldRequest>>,
        include_exit: Option<bool>,
    ) -> Result<PackedEventBatch> {
        self.ensure_open()?;
        self.ensure_materialized(&subscriptions)?;
        let root = root_start.zip(root_end);
        let mut strings = Vec::<String>::new();
        let mut string_ids = std::collections::HashMap::<String, u32>::new();
        let mut words = Vec::<u32>::new();
        let mut emitted_count = 0;
        let mut intern = |value: &str| {
            if let Some(id) = string_ids.get(value) {
                *id
            } else {
                let id = strings.len() as u32;
                strings.push(value.to_owned());
                string_ids.insert(value.to_owned(), id);
                id
            }
        };
        for event in self.events.iter().filter(|event| {
            subscriptions
                .iter()
                .flat_map(|subscription| subscription.split('|'))
                .any(|subscription| alias_matches(subscription, &event.r#type))
                && root.is_none_or(|(start, end)| event.start >= start && event.end <= end)
                && (include_exit.unwrap_or(true) || event.side == "enter")
        }) {
            let requested_fields = field_requests.as_ref().and_then(|requests| {
                requests
                    .iter()
                    .find(|request| request.node_type == event.r#type)
                    .map(|request| &request.fields)
            });
            let fields: Vec<_> = event
                .fields
                .iter()
                .filter(|field| {
                    requested_fields.is_none_or(|requested| requested.contains(&field.key))
                })
                .collect();
            let type_tag =
                node_type_id(&event.r#type).unwrap_or_else(|| 0x8000_0000 | intern(&event.r#type));
            let parent_type_tag = event.parent_type.as_ref().map_or(u32::MAX, |value| {
                node_type_id(value).unwrap_or_else(|| 0x8000_0000 | intern(value))
            });
            words.extend([
                event.sequence,
                u32::from(event.side == "exit"),
                event.id,
                type_tag,
                event.start,
                event.end,
                event.parent_id.unwrap_or(u32::MAX),
                parent_type_tag,
                event.scope_id,
                event.scope_parent_id.unwrap_or(u32::MAX),
                fields.len() as u32,
            ]);
            for field in fields {
                words.push(
                    field_key_id(&field.key).unwrap_or_else(|| 0x8000_0000 | intern(&field.key)),
                );
                words.push(
                    packed_scalar(&field.key, &field.value).unwrap_or_else(|| intern(&field.value)),
                );
            }
            emitted_count += 1;
        }
        let mut data = Vec::with_capacity(words.len() * 4);
        for word in words {
            data.extend_from_slice(&word.to_le_bytes());
        }
        Ok(PackedEventBatch {
            data: data.into(),
            strings,
            node_count: self.node_count,
            emitted_count,
            timings: self.timings.clone(),
        })
    }

    #[napi]
    pub fn inspect(&mut self, node_ids: Vec<u32>) -> Result<Vec<NativeEvent>> {
        self.ensure_open()?;
        self.ensure_materialized(&["*".into()])?;
        Ok(self
            .events
            .iter()
            .filter(|event| event.side == "enter" && node_ids.contains(&event.id))
            .cloned()
            .collect())
    }

    #[napi]
    pub fn query_globals(&mut self, names: Vec<String>) -> Result<Vec<GlobalFact>> {
        self.ensure_open()?;
        self.ensure_materialized(&["Identifier".into()])?;
        Ok(globals_from_events(&self.events, &names))
    }

    #[napi]
    pub fn commit(
        &self,
        edits: Vec<editor::EditCommand>,
        mode: Option<String>,
    ) -> Result<NativeCommitResult> {
        self.ensure_open()?;
        commit(&self.source, &self.filename, edits, mode.as_deref())
    }

    #[napi]
    pub fn close(&mut self) {
        self.closed = true;
        self.events.clear();
    }

    #[napi]
    pub fn memory_usage(&self) -> u32 {
        let event_bytes: usize = self
            .events
            .iter()
            .map(|event| {
                std::mem::size_of::<NativeEvent>()
                    + event.r#type.len()
                    + event.parent_type.as_ref().map_or(0, String::len)
                    + event
                        .fields
                        .iter()
                        .map(|field| field.key.len() + field.value.len())
                        .sum::<usize>()
            })
            .sum();
        (self.source.len() + self.filename.len() + event_bytes).min(u32::MAX as usize) as u32
    }

    fn ensure_open(&self) -> Result<()> {
        if self.closed {
            Err(Error::new(Status::GenericFailure, "session-closed"))
        } else {
            Ok(())
        }
    }

    fn ensure_materialized(&mut self, subscriptions: &[String]) -> Result<()> {
        let missing: Vec<String> = subscriptions
            .iter()
            .filter(|subscription| {
                !self.materialized_subscriptions.iter().any(|existing| {
                    existing == "*"
                        || existing == *subscription
                        || (existing == "Expression" && expression_subscription(subscription))
                })
            })
            .cloned()
            .collect();
        if missing.is_empty() {
            return Ok(());
        }
        let batch = materialize(&self.source, &self.filename, &missing, None, None, true)?;
        self.node_count = batch.node_count;
        self.timings.parse_ms += batch.timings.parse_ms;
        self.timings.semantic_ms += batch.timings.semantic_ms;
        self.timings.traversal_ms += batch.timings.traversal_ms;
        let mut existing = std::collections::HashSet::new();
        for event in &self.events {
            existing.insert((event.id, event.side.clone()));
        }
        self.events.extend(
            batch
                .events
                .into_iter()
                .filter(|event| existing.insert((event.id, event.side.clone()))),
        );
        self.events.sort_by_key(|event| event.sequence);
        self.materialized_subscriptions.extend(missing);
        Ok(())
    }
}

fn expression_subscription(subscription: &str) -> bool {
    subscription.ends_with("Expression")
        || matches!(
            subscription,
            "Identifier"
                | "StringLiteral"
                | "NumericLiteral"
                | "BooleanLiteral"
                | "BigIntLiteral"
                | "RegExpLiteral"
                | "NullLiteral"
                | "TemplateLiteral"
        )
}

#[napi(object)]
pub struct GlobalReference {
    pub id: u32,
    pub start: u32,
    pub end: u32,
}

#[napi(object)]
pub struct GlobalFact {
    pub name: String,
    pub references: Vec<GlobalReference>,
}

fn elapsed(start: Instant) -> f64 {
    start.elapsed().as_secs_f64() * 1000.0
}

pub fn classify_source(filename: &str, source: &str) -> ParseClassification {
    let lower = filename.to_ascii_lowercase();
    let syntax = if lower.ends_with(".d.ts") {
        "dts"
    } else if lower.ends_with(".tsx") {
        "tsx"
    } else if lower.ends_with(".ts") || lower.ends_with(".mts") || lower.ends_with(".cts") {
        "ts"
    } else if lower.ends_with(".jsx") {
        "jsx"
    } else if lower.ends_with(".js") || lower.ends_with(".mjs") || lower.ends_with(".cjs") {
        if source.contains("@flow") {
            "flow"
        } else {
            "js"
        }
    } else {
        "unknown"
    };
    let supported = !matches!(syntax, "flow" | "unknown");
    ParseClassification {
        syntax: syntax.into(),
        supported,
        codegen_candidate: source.contains("codegenNativeComponent")
            || source.contains("codegenNativeCommands"),
        reason: if supported {
            "oxc-supported".into()
        } else if syntax == "flow" {
            "flow-requires-parser-adapter".into()
        } else {
            "unknown-extension".into()
        },
    }
}

fn source_type(filename: &str, source: &str) -> Result<SourceType> {
    let classification = classify_source(filename, source);
    if !classification.supported {
        return Err(Error::new(Status::GenericFailure, classification.reason));
    }
    SourceType::from_path(filename).map_err(|_| {
        Error::new(
            Status::InvalidArg,
            format!("unsupported filename extension: {filename}"),
        )
    })
}

fn utf16_index<'a>(source: &str, allocator: &'a Allocator) -> ArenaVec<'a, u32> {
    let mut offsets = ArenaVec::with_capacity_in(source.len() + 1, &allocator);
    for _ in 0..=source.len() {
        offsets.push(0);
    }
    let mut utf16 = 0u32;
    for (byte, ch) in source.char_indices() {
        for slot in offsets.iter_mut().take(byte + ch.len_utf8()).skip(byte) {
            *slot = utf16;
        }
        utf16 += ch.len_utf16() as u32;
    }
    offsets[source.len()] = utf16;
    offsets
}

fn kind_name(kind: AstKind<'_>) -> String {
    match kind {
        AstKind::Directive(_) => "Directive".into(),
        AstKind::IdentifierReference(_) => "Identifier".into(),
        AstKind::BindingIdentifier(_) => "Identifier".into(),
        AstKind::IdentifierName(_) => "Identifier".into(),
        _ => kind
            .debug_name()
            .split('(')
            .next()
            .unwrap_or("Unknown")
            .into(),
    }
}

fn alias_matches(subscription: &str, node_type: &str) -> bool {
    subscription == "*"
        || subscription == node_type
        || (subscription == "Function"
            && matches!(
                node_type,
                "Function"
                    | "ArrowFunctionExpression"
                    | "FunctionDeclaration"
                    | "FunctionExpression"
            ))
        || (subscription == "Statement" && node_type.ends_with("Statement"))
        || (subscription == "Declaration" && node_type.ends_with("Declaration"))
        || (subscription == "MemberExpression"
            && matches!(
                node_type,
                "StaticMemberExpression" | "ComputedMemberExpression" | "PrivateFieldExpression"
            ))
        || (subscription == "Expression" && expression_subscription(node_type))
}

fn packed_scalar(key: &str, value: &str) -> Option<u32> {
    if matches!(
        key,
        "global"
            | "read"
            | "write"
            | "binding"
            | "optional"
            | "calleeGlobal"
            | "computed"
            | "rootGlobal"
            | "async"
            | "generator"
            | "expression"
            | "hasInitializer"
    ) {
        return Some(0x8000_0000 | u32::from(value == "true"));
    }
    if matches!(
        key,
        "bindingScopeId"
            | "argumentCount"
            | "bodyStart"
            | "bodyEnd"
            | "specifierCount"
            | "declarationCount"
    ) {
        return value
            .parse::<u32>()
            .ok()
            .filter(|value| *value < 0x4000_0000)
            .map(|value| 0x4000_0000 | value);
    }
    None
}

fn intern_packed(strings: &mut std::collections::HashMap<String, u32>, value: &str) -> u32 {
    if let Some(id) = strings.get(value) {
        return *id;
    }
    let id = strings.len() as u32;
    strings.insert(value.to_owned(), id);
    id
}

struct DirectPackedFields {
    words: [u32; 8],
    len: usize,
}

fn packed_fields_direct(
    kind: AstKind<'_>,
    scoping: &Scoping,
    requested: Option<&[String]>,
    strings: &mut std::collections::HashMap<String, u32>,
) -> Option<DirectPackedFields> {
    let wants = |key: &str| requested.is_none_or(|fields| fields.iter().any(|field| field == key));
    let mut result = DirectPackedFields {
        words: [0; 8],
        len: 0,
    };
    let mut push = |key: &str, value: u32| {
        if wants(key) {
            result.words[result.len] = field_key_id(key).expect("field protocol id");
            result.words[result.len + 1] = value;
            result.len += 2;
        }
    };
    match kind {
        AstKind::CallExpression(call) => {
            push("optional", 0x8000_0000 | u32::from(call.optional));
            push("argumentCount", 0x4000_0000 | call.arguments.len() as u32);
            if let Expression::Identifier(identifier) = &call.callee {
                if wants("calleeName") {
                    let value = intern_packed(strings, &identifier.name);
                    push("calleeName", value);
                }
                let global = identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| !scoping.has_binding(id));
                push("calleeGlobal", 0x8000_0000 | u32::from(global));
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants("staticArgument")
            {
                let value = intern_packed(strings, &literal.value);
                push("staticArgument", value);
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push("computed", 0x8000_0000);
            if wants("property") {
                let value = intern_packed(strings, &member.property.name);
                push("property", value);
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                if wants("rootName") {
                    let value = intern_packed(strings, &identifier.name);
                    push("rootName", value);
                }
                let global = identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                push("rootGlobal", 0x8000_0000 | u32::from(global));
            }
        }
        _ => return None,
    }
    Some(result)
}

fn fields(kind: AstKind<'_>, scoping: &Scoping, requested: Option<&[String]>) -> Vec<NodeField> {
    let mut result = Vec::new();
    macro_rules! push {
        ($key:expr, $value:expr $(,)?) => {
            if requested.is_none_or(|fields| {
                fields.iter().any(|field| {
                    field == $key || $key.strip_suffix("Byte").is_some_and(|name| field == name)
                })
            }) {
                result.push(NodeField {
                    key: $key.into(),
                    value: $value,
                });
            }
        };
    }
    match kind {
        AstKind::IdentifierReference(identifier) => {
            push!("name", identifier.name.to_string());
            let reference = identifier
                .reference_id
                .get()
                .map(|id| scoping.get_reference(id));
            let global = reference.is_some_and(|reference| reference.symbol_id().is_none());
            push!("global", global.to_string());
            if let Some(reference) = reference {
                push!("read", reference.is_read().to_string());
                push!("write", reference.is_write().to_string());
            }
            if let Some(reference_id) = identifier.reference_id.get()
                && let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id()
            {
                push!(
                    "bindingScopeId",
                    scoping.symbol_scope_id(symbol_id).index().to_string(),
                );
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            push!("name", identifier.name.to_string());
            push!("binding", "true".into());
        }
        AstKind::IdentifierName(identifier) => push!("name", identifier.name.to_string()),
        AstKind::StringLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::NumericLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::BooleanLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::CallExpression(call) => {
            push!("optional", call.optional.to_string());
            push!("argumentCount", call.arguments.len().to_string());
            if let Expression::Identifier(identifier) = &call.callee {
                push!("calleeName", identifier.name.to_string());
                let global = identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| !scoping.has_binding(id));
                push!("calleeGlobal", global.to_string());
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!("staticArgument", literal.value.to_string());
            }
        }
        AstKind::NewExpression(call) => {
            push!("argumentCount", call.arguments.len().to_string());
            if let Expression::Identifier(identifier) = &call.callee {
                push!("calleeName", identifier.name.to_string());
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!("staticArgument", literal.value.to_string());
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push!("computed", "false".into());
            push!("property", member.property.name.to_string());
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                push!("rootName", identifier.name.to_string());
                let global = identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                push!("rootGlobal", global.to_string());
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push!("computed", "true".into());
            if let Expression::StringLiteral(property) = &member.expression {
                push!("property", property.value.to_string());
            }
        }
        AstKind::Function(function) => {
            push!("async", function.r#async.to_string());
            push!("generator", function.generator.to_string());
            if let Some(identifier) = &function.id {
                push!("name", identifier.name.to_string());
            }
            if let Some(body) = &function.body {
                push!("bodyStartByte", (body.span.start + 1).to_string());
                push!("bodyEndByte", body.span.end.saturating_sub(1).to_string());
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push!("async", function.r#async.to_string());
            push!("expression", function.expression.to_string());
            let inset = u32::from(!function.expression);
            push!(
                "bodyStartByte",
                (function.body.span.start + inset).to_string(),
            );
            push!(
                "bodyEndByte",
                function.body.span.end.saturating_sub(inset).to_string(),
            );
        }
        AstKind::ImportDeclaration(declaration) => {
            push!("source", declaration.source.value.to_string());
            push!(
                "importKind",
                format!("{:?}", declaration.import_kind).to_ascii_lowercase(),
            );
            push!(
                "specifierCount",
                declaration
                    .specifiers
                    .as_ref()
                    .map_or(0, |specifiers| specifiers.len())
                    .to_string(),
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            push!("imported", specifier.imported.name().to_string());
            push!("local", specifier.local.name.to_string());
            push!(
                "importKind",
                format!("{:?}", specifier.import_kind).to_ascii_lowercase(),
            );
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            push!("imported", "default".into());
            push!("local", specifier.local.name.to_string());
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            push!("imported", "*".into());
            push!("local", specifier.local.name.to_string());
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if let Some(source) = &declaration.source {
                push!("source", source.value.to_string());
            }
            push!(
                "exportKind",
                format!("{:?}", declaration.export_kind).to_ascii_lowercase(),
            );
            push!("specifierCount", declaration.specifiers.len().to_string());
        }
        AstKind::ExportSpecifier(specifier) => {
            push!("local", specifier.local.name().to_string());
            push!("exported", specifier.exported.name().to_string());
            push!(
                "exportKind",
                format!("{:?}", specifier.export_kind).to_ascii_lowercase(),
            );
        }
        AstKind::VariableDeclaration(declaration) => {
            push!("kind", declaration.kind.to_string());
            push!(
                "declarationCount",
                declaration.declarations.len().to_string(),
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            push!("kind", declarator.kind.to_string());
            push!("hasInitializer", declarator.init.is_some().to_string());
        }
        AstKind::Directive(directive) => {
            push!("value", directive.directive.to_string());
        }
        AstKind::ImportMeta(_) => {
            push!("meta", "import".into());
            push!("property", "meta".into());
        }
        AstKind::NewTarget(_) => {
            push!("meta", "new".into());
            push!("property", "target".into());
        }
        _ => {}
    }
    result
}

struct EventCollector<'a> {
    subscriptions: &'a [String],
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    events: Vec<NativeEvent>,
    sequence: u32,
    include_exit: bool,
}

impl<'a> EventCollector<'a> {
    fn emit(&mut self, kind: AstKind<'a>, side: &str) {
        let sequence = self.sequence;
        self.sequence += 1;
        let span = kind.span();
        let start = self
            .utf16
            .map_or(span.start, |index| index[span.start as usize]);
        let end = self
            .utf16
            .map_or(span.end, |index| index[span.end as usize]);
        if self
            .root
            .is_some_and(|(root_start, root_end)| start < root_start || end > root_end)
        {
            return;
        }
        let node_type = kind_name(kind);
        if !self
            .subscriptions
            .iter()
            .any(|subscription| alias_matches(subscription, &node_type))
        {
            return;
        }
        let id = kind.node_id();
        let node = self.nodes.get_node(id);
        let scope_id = match kind {
            AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
            AstKind::ArrowFunctionExpression(function) => {
                function.scope_id.get().unwrap_or(node.scope_id())
            }
            _ => node.scope_id(),
        };
        let is_root = id.index() == 0;
        let parent_id = (!is_root).then(|| self.nodes.parent_id(id).index() as u32);
        let parent_type = (!is_root).then(|| kind_name(self.nodes.parent_kind(id)));
        let mut node_fields = fields(kind, self.scoping, None);
        for field in &mut node_fields {
            if let Some(name) = field.key.strip_suffix("Byte")
                && let Ok(offset) = field.value.parse::<usize>()
            {
                field.key = name.into();
                field.value = self
                    .utf16
                    .map_or(offset as u32, |index| index[offset])
                    .to_string();
            }
        }
        self.events.push(NativeEvent {
            sequence,
            side: side.into(),
            id: id.index() as u32,
            r#type: node_type,
            start,
            end,
            parent_id,
            parent_type,
            scope_id: scope_id.index() as u32,
            scope_parent_id: self
                .scoping
                .scope_parent_id(scope_id)
                .map(|id| id.index() as u32),
            fields: node_fields,
        });
    }
}

impl<'a> Visit<'a> for EventCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.emit(kind, "enter");
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.include_exit {
            self.emit(kind, "exit");
        }
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

pub fn materialize(
    source: &str,
    filename: &str,
    subscriptions: &[String],
    root_start: Option<u32>,
    root_end: Option<u32>,
    include_exit: bool,
) -> Result<EventBatch> {
    let parse_started = Instant::now();
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    let parse_ms = elapsed(parse_started);
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    let semantic_started = Instant::now();
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_check_syntax_error(true)
        .build(&parsed.program);
    let semantic_ms = elapsed(semantic_started);
    if !semantic_return.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Oxc semantic analysis failed: {:?}",
                semantic_return.diagnostics
            ),
        ));
    }
    let traversal_started = Instant::now();
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let mut collector = EventCollector {
        subscriptions,
        nodes: semantic_return.semantic.nodes(),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        events: Vec::new(),
        sequence: 0,
        include_exit,
    };
    collector.visit_program(&parsed.program);
    let traversal_ms = elapsed(traversal_started);
    let emitted_count = collector.events.len() as u32;
    Ok(EventBatch {
        events: collector.events,
        node_count: semantic_return.semantic.nodes().len() as u32,
        emitted_count,
        timings: Timings {
            parse_ms,
            semantic_ms,
            traversal_ms,
            render_and_map_ms: 0.0,
        },
    })
}

#[allow(clippy::too_many_arguments)] // Primitive FFI inputs deliberately avoid object conversion.
pub fn materialize_packed(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
    include_exit: Option<bool>,
) -> Result<PackedEventBatch> {
    let parts = materialize_packed_internal(
        source,
        filename,
        subscriptions,
        subscription_ids,
        root_start,
        root_end,
        packed_field_requests,
        include_exit,
        true,
        true,
    )?;
    Ok(PackedEventBatch {
        data: parts.data.into(),
        strings: parts.strings,
        node_count: parts.node_count,
        emitted_count: parts.emitted_count,
        timings: parts.timings,
    })
}

#[allow(clippy::too_many_arguments)]
fn materialize_packed_internal(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
    include_exit: Option<bool>,
    include_parent: bool,
    include_scope: bool,
) -> Result<PackedEventParts> {
    let parse_started = Instant::now();
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    let parse_ms = elapsed(parse_started);
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    let semantic_started = Instant::now();
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_check_syntax_error(true)
        .build(&parsed.program);
    let semantic_ms = elapsed(semantic_started);
    if !semantic_return.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Oxc semantic analysis failed: {:?}",
                semantic_return.diagnostics
            ),
        ));
    }
    let field_requests = decode_field_requests(packed_field_requests)?;
    let traversal_started = Instant::now();
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let mut collector = PackedEventCollector {
        subscriptions: &subscriptions,
        subscription_ids: &subscription_ids,
        field_requests: field_requests.as_deref(),
        nodes: semantic_return.semantic.nodes(),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        include_exit: include_exit.unwrap_or(true),
        include_parent,
        include_scope,
        sequence: 0,
        emitted_count: 0,
        words: ArenaVec::new_in(&&allocator),
        string_ids: std::collections::HashMap::new(),
    };
    collector.visit_program(&parsed.program);
    let traversal_ms = elapsed(traversal_started);
    let mut data = Vec::with_capacity(collector.words.len() * 4);
    for &word in &collector.words {
        data.extend_from_slice(&word.to_le_bytes());
    }
    let mut strings = (0..collector.string_ids.len())
        .map(|_| String::new())
        .collect::<Vec<_>>();
    for (value, id) in collector.string_ids {
        strings[id as usize] = value;
    }
    Ok(PackedEventParts {
        data,
        strings,
        node_count: semantic_return.semantic.nodes().len() as u32,
        emitted_count: collector.emitted_count,
        timings: Timings {
            parse_ms,
            semantic_ms,
            traversal_ms,
            render_and_map_ms: 0.0,
        },
    })
}

#[allow(clippy::too_many_arguments)] // Primitive FFI inputs deliberately avoid object conversion.
pub fn materialize_packed_buffer(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
    include_exit: Option<bool>,
) -> Result<Buffer> {
    let parts = materialize_packed_internal(
        source,
        filename,
        subscriptions,
        subscription_ids,
        root_start,
        root_end,
        packed_field_requests,
        include_exit,
        true,
        true,
    )?;
    let strings_size: usize = parts
        .strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let words_offset = 48 + strings_size;
    let mut output = Vec::with_capacity(words_offset + parts.data.len());
    let shape_node_count = parts.node_count | 0xc000_0000;
    for word in [
        shape_node_count,
        parts.emitted_count,
        parts.strings.len() as u32,
        words_offset as u32,
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in [
        parts.timings.parse_ms,
        parts.timings.semantic_ms,
        parts.timings.traversal_ms,
        parts.timings.render_and_map_ms,
    ] {
        output.extend_from_slice(&value.to_le_bytes());
    }
    for value in parts.strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
    }
    output.extend_from_slice(&parts.data);
    Ok(output.into())
}

fn decode_field_requests(data: Option<&[u8]>) -> Result<Option<Vec<FieldRequest>>> {
    let Some(data) = data else {
        return Ok(None);
    };
    if data.len() % 4 != 0 {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid packed field request buffer",
        ));
    }
    let word_count = data.len() / 4;
    let word =
        |index: usize| u32::from_le_bytes(data[index * 4..index * 4 + 4].try_into().unwrap());
    let mut cursor = 0;
    let mut requests = Vec::new();
    while cursor < word_count {
        if cursor + 2 > word_count {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed field request",
            ));
        }
        let count = word(cursor + 1) as usize;
        if cursor + 2 + count > word_count {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed field keys",
            ));
        }
        let node_type = node_type_name(word(cursor))
            .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed node type id"))?
            .to_owned();
        let fields = (cursor + 2..cursor + 2 + count)
            .map(|index| {
                field_key_name(word(index))
                    .map(str::to_owned)
                    .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed field key id"))
            })
            .collect::<Result<Vec<_>>>()?;
        requests.push(FieldRequest { node_type, fields });
        cursor += 2 + count;
    }
    Ok(Some(requests))
}

struct PackedEventCollector<'a> {
    subscriptions: &'a [String],
    subscription_ids: &'a [u32],
    field_requests: Option<&'a [FieldRequest]>,
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    include_exit: bool,
    include_parent: bool,
    include_scope: bool,
    sequence: u32,
    emitted_count: u32,
    words: ArenaVec<'a, u32>,
    string_ids: std::collections::HashMap<String, u32>,
}

impl PackedEventCollector<'_> {
    fn intern(&mut self, value: &str) -> u32 {
        if let Some(id) = self.string_ids.get(value) {
            return *id;
        }
        let id = self.string_ids.len() as u32;
        self.string_ids.insert(value.to_owned(), id);
        id
    }
    fn emit(&mut self, kind: AstKind<'_>, side: u32) {
        let sequence = self.sequence;
        self.sequence += 1;
        let span = kind.span();
        let start = self
            .utf16
            .map_or(span.start, |index| index[span.start as usize]);
        let end = self
            .utf16
            .map_or(span.end, |index| index[span.end as usize]);
        if self
            .root
            .is_some_and(|(root_start, root_end)| start < root_start || end > root_end)
        {
            return;
        }
        let protocol_id = ast_kind_protocol_id(kind);
        let fast_match = self.subscription_ids.contains(&protocol_id);
        if !fast_match && self.subscriptions.is_empty() {
            return;
        }
        let node_type =
            node_type_name(protocol_id).expect("generated protocol covers every Oxc AstKind");
        if !fast_match
            && !self
                .subscriptions
                .iter()
                .any(|subscription| alias_matches(subscription, node_type))
        {
            return;
        }
        let id = kind.node_id();
        let scope_id = self.include_scope.then(|| {
            let node = self.nodes.get_node(id);
            match kind {
                AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
                AstKind::ArrowFunctionExpression(function) => {
                    function.scope_id.get().unwrap_or(node.scope_id())
                }
                _ => node.scope_id(),
            }
        });
        let is_root = id.index() == 0;
        let parent_id =
            (self.include_parent && !is_root).then(|| self.nodes.parent_id(id).index() as u32);
        let requested = self.field_requests.and_then(|requests| {
            requests
                .iter()
                .find(|request| request.node_type == node_type)
        });
        let requested_fields = requested.map(|request| request.fields.as_slice());
        if let Some(node_fields) =
            packed_fields_direct(kind, self.scoping, requested_fields, &mut self.string_ids)
        {
            let parent_type_id = if self.include_parent && !is_root {
                ast_kind_protocol_id(self.nodes.parent_kind(id))
            } else {
                u32::MAX
            };
            let event_scope_id = scope_id.map_or(0, |id| id.index() as u32);
            let scope_parent_id = scope_id
                .and_then(|id| self.scoping.scope_parent_id(id))
                .map_or(u32::MAX, |id| id.index() as u32);
            self.words
                .extend([sequence, side, id.index() as u32, protocol_id, start, end]);
            if self.include_parent {
                self.words
                    .extend([parent_id.unwrap_or(u32::MAX), parent_type_id]);
            }
            if self.include_scope {
                self.words.extend([event_scope_id, scope_parent_id]);
            }
            self.words.push((node_fields.len / 2) as u32);
            self.words
                .extend_from_slice(&node_fields.words[..node_fields.len]);
            self.emitted_count += 1;
            return;
        }
        let mut node_fields = fields(kind, self.scoping, requested_fields);
        for field in &mut node_fields {
            if let Some(name) = field.key.strip_suffix("Byte")
                && let Ok(offset) = field.value.parse::<usize>()
            {
                field.key = name.into();
                field.value = self
                    .utf16
                    .map_or(offset as u32, |index| index[offset])
                    .to_string();
            }
        }
        let parent_type_id = if self.include_parent && !is_root {
            ast_kind_protocol_id(self.nodes.parent_kind(id))
        } else {
            u32::MAX
        };
        let event_scope_id = scope_id.map_or(0, |id| id.index() as u32);
        let scope_parent_id = scope_id
            .and_then(|id| self.scoping.scope_parent_id(id))
            .map_or(u32::MAX, |id| id.index() as u32);
        self.words
            .extend([sequence, side, id.index() as u32, protocol_id, start, end]);
        if self.include_parent {
            self.words
                .extend([parent_id.unwrap_or(u32::MAX), parent_type_id]);
        }
        if self.include_scope {
            self.words.extend([event_scope_id, scope_parent_id]);
        }
        self.words.push(node_fields.len() as u32);
        for field in node_fields {
            let key =
                field_key_id(&field.key).unwrap_or_else(|| 0x8000_0000 | self.intern(&field.key));
            let value = packed_scalar(&field.key, &field.value)
                .unwrap_or_else(|| self.intern(&field.value));
            self.words.extend([key, value]);
        }
        self.emitted_count += 1;
    }
}

impl<'a> Visit<'a> for PackedEventCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.emit(kind, 0);
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.include_exit {
            self.emit(kind, 1);
        }
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

pub fn commit(
    source: &str,
    _filename: &str,
    commands: Vec<editor::EditCommand>,
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    let started = Instant::now();
    let edits = editor::normalize(source, commands)?;
    let (code, mappings, names) = sourcemap::render(source, &edits, mode.unwrap_or("boundary"));
    Ok(NativeCommitResult {
        code,
        map: NativeVlqMap { mappings, names },
        timings: Timings {
            parse_ms: 0.0,
            semantic_ms: 0.0,
            traversal_ms: 0.0,
            render_and_map_ms: elapsed(started),
        },
    })
}

pub fn commit_packed(
    source: &str,
    filename: &str,
    data: &[u8],
    strings: Vec<String>,
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    if !data.len().is_multiple_of(4) {
        return Err(Error::new(Status::InvalidArg, "invalid packed edit buffer"));
    }
    let word_count = data.len() / 4;
    let word =
        |index: usize| u32::from_le_bytes(data[index * 4..index * 4 + 4].try_into().unwrap());
    let mut cursor = 0;
    let mut edits = Vec::new();
    while cursor < word_count {
        if cursor + 7 > word_count {
            return Err(Error::new(Status::InvalidArg, "truncated packed edit"));
        }
        let kind = match word(cursor) {
            0 => editor::EditKind::Replace,
            1 => editor::EditKind::Remove,
            2 => editor::EditKind::AppendLeft,
            3 => editor::EditKind::PrependLeft,
            4 => editor::EditKind::AppendRight,
            5 => editor::EditKind::PrependRight,
            6 => editor::EditKind::AddSourceMapLocation,
            _ => return Err(Error::new(Status::InvalidArg, "invalid packed edit kind")),
        };
        let content_id = word(cursor + 3);
        let mapping = match word(cursor + 4) {
            0 => editor::MappingPolicy::Sourceless,
            1 => editor::MappingPolicy::AnchorStart,
            2 => editor::MappingPolicy::AnchorBoundaries,
            3 => editor::MappingPolicy::Identity,
            _ => {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid packed mapping policy",
                ));
            }
        };
        let name_count = word(cursor + 6) as usize;
        if cursor + 7 + name_count > word_count {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed edit names",
            ));
        }
        let names = (cursor + 7..cursor + 7 + name_count)
            .map(|index| {
                strings
                    .get(word(index) as usize)
                    .cloned()
                    .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed string id"))
            })
            .collect::<Result<Vec<_>>>()?;
        edits.push(editor::EditCommand {
            kind,
            start: word(cursor + 1),
            end: word(cursor + 2),
            content: if content_id == u32::MAX {
                None
            } else {
                Some(
                    strings.get(content_id as usize).cloned().ok_or_else(|| {
                        Error::new(Status::InvalidArg, "invalid packed string id")
                    })?,
                )
            },
            mapping: Some(mapping),
            owner: None,
            order: Some(word(cursor + 5)),
            names: Some(names),
        });
        cursor += 7 + name_count;
    }
    commit(source, filename, edits, mode)
}

pub fn commit_packed_buffer(
    source: &str,
    filename: &str,
    data: &[u8],
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    if data.len() < 8 {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated packed edit envelope",
        ));
    }
    let string_count = u32::from_le_bytes(data[0..4].try_into().unwrap()) as usize;
    let words_offset = u32::from_le_bytes(data[4..8].try_into().unwrap()) as usize;
    if words_offset > data.len() || !words_offset.is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid packed edit word offset",
        ));
    }
    let mut strings = Vec::with_capacity(string_count);
    let mut cursor = 8;
    for _ in 0..string_count {
        if cursor + 4 > words_offset {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed edit string",
            ));
        }
        let length = u32::from_le_bytes(data[cursor..cursor + 4].try_into().unwrap()) as usize;
        cursor += 4;
        if cursor + length > words_offset {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated packed edit string value",
            ));
        }
        strings.push(
            std::str::from_utf8(&data[cursor..cursor + length])
                .map_err(|_| Error::new(Status::InvalidArg, "invalid packed edit UTF-8"))?
                .to_owned(),
        );
        cursor = (cursor + length + 3) & !3;
    }
    commit_packed(source, filename, &data[words_offset..], strings, mode)
}

pub fn query_globals(source: &str, filename: &str, names: &[String]) -> Result<Vec<GlobalFact>> {
    let batch = materialize(source, filename, &["Identifier".into()], None, None, false)?;
    Ok(globals_from_events(&batch.events, names))
}

fn globals_from_events(events: &[NativeEvent], names: &[String]) -> Vec<GlobalFact> {
    names
        .iter()
        .map(|name| GlobalFact {
            name: name.clone(),
            references: events
                .iter()
                .filter(|event| event.side == "enter")
                .filter(|event| {
                    let field = |key: &str| event.fields.iter().find(|field| field.key == key);
                    field("name").is_some_and(|field| field.value == *name)
                        && field("global").is_some_and(|field| field.value == "true")
                })
                .map(|event| GlobalReference {
                    id: event.id,
                    start: event.start,
                    end: event.end,
                })
                .collect(),
        })
        .collect()
}

pub fn inspect_nodes(source: &str, filename: &str, node_ids: &[u32]) -> Result<Vec<NativeEvent>> {
    let batch = materialize(source, filename, &["*".into()], None, None, false)?;
    Ok(batch
        .events
        .into_iter()
        .filter(|event| event.side == "enter" && node_ids.contains(&event.id))
        .collect())
}

pub fn validate_expression(code: &str, parser_mode: Option<&str>) -> Result<()> {
    let extension = match parser_mode.unwrap_or("js") {
        "jsx" => "jsx",
        "ts" => "ts",
        "tsx" => "tsx",
        _ => "js",
    };
    let source = format!("({code})");
    let allocator = Allocator::default();
    let parsed = Parser::new(
        &allocator,
        &source,
        SourceType::from_path(format!("fragment.{extension}")).unwrap(),
    )
    .parse();
    if parsed.diagnostics.is_empty() {
        Ok(())
    } else {
        Err(Error::new(
            Status::InvalidArg,
            format!("invalid expression fragment: {:?}", parsed.diagnostics),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn emits_only_subscribed_nodes_with_semantic_fields() {
        let result = materialize(
            "const x = 1; function f(require) { require('x') } foo('y')",
            "fixture.js",
            &["CallExpression".into()],
            None,
            None,
            true,
        )
        .unwrap();
        assert_eq!(result.events.len(), 4);
        assert!(
            result
                .events
                .iter()
                .all(|event| event.r#type == "CallExpression")
        );
    }

    #[test]
    fn classifies_flow_as_unsupported() {
        let result = classify_source("fixture.js", "// @flow\nconst x: number = 1");
        assert!(!result.supported);
        assert_eq!(result.syntax, "flow");
    }
}
