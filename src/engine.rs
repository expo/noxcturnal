use std::borrow::Cow;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::{AstKind, ast::Expression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use oxc_syntax::node::NodeId;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::constant_eval::constant_for_kind;
pub use crate::event_types::{NativeCommitResult, NativeVlqMap, NodeField, ParseClassification};
use crate::function_map::{FunctionMap, FunctionMapCollector};
use crate::generated_event_schema::{
    NODE_TYPE_COUNT, ast_kind_protocol_id, field_key_id, field_key_name, node_type_id,
    node_type_name, predicate_field_supported,
};
use crate::retained_index::{
    NativeBindingFact, NativeCallFact, NativeCaptureReference, NativeConstantFact, RetainedIndex,
};
use crate::{editor, sourcemap};

struct MaterializedSessionParts {
    scope_parents: Vec<u32>,
    retained_index: RetainedIndex,
    function_map: Option<FunctionMap>,
    initial_routed_buffer: Option<Vec<u8>>,
}

const ROUTE_MANIFEST_MAGIC: u32 = 0x4e_52_4d_46; // NRMF
const ROUTED_TAPE_MAGIC: u32 = 0x4e_52_54_46; // NRTF
const MAX_COMPILED_ROUTES: usize = 4096;
const MAX_ROUTE_PREDICATES: usize = 64;
const MAX_PREDICATE_VALUES: usize = 1024;
const MAX_ROUTE_PAYLOAD_FIELDS: usize = 64;
const MAX_ROUTE_MANIFEST_BYTES: usize = 4 * 1024 * 1024;
const RETAIN_IDENTIFIERS: u32 = 1 << 0;
const RETAIN_CONSTANTS: u32 = 1 << 1;
const RETAIN_CALLS: u32 = 1 << 2;
const RETAIN_CHILDREN: u32 = 1 << 3;
const RETAIN_INSPECTION: u32 = 1 << 4;
const RETAIN_MODULE_FACTS: u32 = 1 << 5;

#[derive(Clone)]
struct CompiledPredicate {
    field_id: u32,
    operation: u32,
    values: Vec<CompiledScalar>,
}

#[derive(Clone)]
enum CompiledScalar {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
}

enum PredicateScalar<'a> {
    String(Cow<'a, str>),
    Number(f64),
    Boolean(bool),
}

#[derive(Clone)]
struct CompiledRoute {
    id: u32,
    node_type_id: u32,
    side: VisitSide,
    predicates: Vec<CompiledPredicate>,
    payload_field_ids: Vec<u32>,
    /// Field names for `payload_field_ids`, resolved once at manifest decode so the
    /// per-node collectors never rebuild name lists.
    payload_names: Vec<String>,
}

struct CompiledManifest {
    routes_by_type: Vec<Vec<CompiledRoute>>,
    include_parent: bool,
    include_scope: bool,
    include_exit: bool,
    retention_capabilities: u32,
    structural_parent_types: FxHashSet<u32>,
    /// Union of route payload/predicate and retained-plan field names per node type,
    /// precomputed so the retained collector performs no per-node field-name work.
    merged_field_names_by_type: Vec<Vec<String>>,
    /// Predicate field names without a direct scalar accessor per node type; these are
    /// the only fields the stateless collector must materialize before matching.
    fallback_predicate_names_by_type: Vec<Vec<String>>,
    needs_semantics: bool,
}

/// Field keys whose values come from Oxc's semantic analysis rather than the AST.
const SEMANTIC_FIELD_KEYS: [&str; 6] = [
    "global",
    "read",
    "write",
    "bindingScopeId",
    "calleeGlobal",
    "rootGlobal",
];

#[derive(Default)]
struct RoutedCounts {
    node_records: u32,
    route_deliveries: u32,
}

#[napi]
pub struct NativeIndexedSession {
    source: String,
    filename: String,
    retained_index: RetainedIndex,
    scope_parents: Vec<u32>,
    parse_count: u32,
    function_map: Option<FunctionMap>,
    initial_route_manifest: Option<Vec<u8>>,
    initial_routed_buffer: Option<Vec<u8>>,
    initial_routed_served: bool,
    closed: bool,
}

#[napi]
impl NativeIndexedSession {
    #[napi(constructor)]
    pub fn new(
        source: String,
        filename: String,
        function_map: Option<bool>,
        retention_manifest: Option<Buffer>,
        initial_route_manifest: Option<Buffer>,
        build_initial_route: Option<bool>,
    ) -> Result<Self> {
        let collect_function_map = function_map.unwrap_or(false);
        let has_retention = retention_manifest.is_some();
        let has_initial_route = initial_route_manifest.is_some();
        let parse_count = u32::from(collect_function_map || has_retention || has_initial_route);
        let parts = if !collect_function_map && !has_retention && !has_initial_route {
            MaterializedSessionParts {
                scope_parents: Vec::new(),
                retained_index: RetainedIndex::default(),
                function_map: None,
                initial_routed_buffer: None,
            }
        } else {
            materialize_with_scope_parents(
                &source,
                &filename,
                collect_function_map,
                retention_manifest.as_deref(),
                initial_route_manifest.as_deref(),
                build_initial_route.unwrap_or(true),
            )?
        };
        let MaterializedSessionParts {
            scope_parents,
            retained_index,
            function_map,
            initial_routed_buffer,
        } = parts;
        Ok(Self {
            source,
            filename,
            retained_index,
            scope_parents,
            parse_count,
            function_map,
            initial_route_manifest: initial_route_manifest.map(|manifest| manifest.to_vec()),
            initial_routed_buffer,
            initial_routed_served: false,
            closed: false,
        })
    }

    #[napi]
    pub fn next_routed_packed(
        &mut self,
        manifest: Buffer,
        root_start: Option<u32>,
        root_end: Option<u32>,
    ) -> Result<Buffer> {
        self.ensure_open()?;
        // The precompiled initial tape is moved out on its first request; afterwards every
        // request recomputes from the retained index, so no served flag is needed.
        if root_start.is_none() && root_end.is_none() && self.initial_routed_buffer.is_some() {
            if self.initial_route_manifest.as_deref() != Some(manifest.as_ref()) {
                return Err(Error::new(
                    Status::GenericFailure,
                    "route manifest does not match the compiled retention plan",
                ));
            }
            self.initial_route_manifest = None;
            return Ok(self
                .initial_routed_buffer
                .take()
                .map(Buffer::from)
                .expect("initial routed buffer is present"));
        }
        let manifest = decode_route_manifest(&manifest)?;
        routed_buffer_from_index(
            &manifest,
            &self.retained_index,
            &self.scope_parents,
            root_start.zip(root_end),
        )
    }

    #[napi]
    pub fn inspect_packed_buffer(&mut self, node_ids: Vec<u32>) -> Result<Buffer> {
        self.ensure_open()?;
        if !node_ids.is_empty() && !self.retained_index.has_scalar_fields() {
            return Err(Error::new(
                Status::GenericFailure,
                "undeclared-retention-capability: inspection",
            ));
        }
        Ok(self
            .retained_index
            .packed_events_buffer(&node_ids, &self.scope_parents))
    }

    #[napi]
    pub fn node_summary_buffer(&self, node_id: u32) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self
            .retained_index
            .summary_buffer(node_id, &self.scope_parents))
    }

    #[napi]
    pub fn children_packed_buffer(
        &mut self,
        parent_ids: Vec<u32>,
        parent_types: Vec<String>,
        parent_type_ids: Vec<u32>,
    ) -> Result<Buffer> {
        self.ensure_open()?;
        let mut parent_ids = parent_ids.into_iter().collect::<FxHashSet<_>>();
        let mut parent_type_ids = parent_type_ids.into_iter().collect::<FxHashSet<_>>();
        for type_id in 0..NODE_TYPE_COUNT as u32 {
            if let Some(node_type) = node_type_name(type_id)
                && parent_types
                    .iter()
                    .any(|parent_type| alias_matches(parent_type, node_type))
            {
                parent_type_ids.insert(type_id);
            }
        }
        parent_ids.extend(self.retained_index.node_ids_of_types(&parent_type_ids));
        let mut ordered_child_ids = parent_ids
            .iter()
            .flat_map(|parent_id| self.retained_index.children(*parent_id))
            .collect::<Vec<_>>();
        ordered_child_ids.sort_unstable();
        ordered_child_ids.dedup();
        Ok(self
            .retained_index
            .packed_events_buffer(&ordered_child_ids, &self.scope_parents))
    }

    #[napi]
    pub fn query_constants(&self, node_ids: Vec<u32>) -> Result<Vec<NativeConstantFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.constant_facts(&node_ids))
    }

    #[napi]
    pub fn query_calls(
        &self,
        callee_name: String,
        global_only: Option<bool>,
        static_arguments: Option<bool>,
    ) -> Result<Vec<NativeCallFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.call_facts(
            &callee_name,
            global_only.unwrap_or(false),
            static_arguments.unwrap_or(false),
        ))
    }

    #[napi]
    pub fn query_nodes_packed_buffer(&self, node_types: Vec<String>) -> Result<Buffer> {
        self.ensure_open()?;
        let type_ids = node_types
            .iter()
            .filter_map(|node_type| node_type_id(node_type))
            .collect::<FxHashSet<_>>();
        let node_ids = self
            .retained_index
            .node_ids_of_types(&type_ids)
            .collect::<Vec<_>>();
        Ok(self
            .retained_index
            .packed_events_buffer(&node_ids, &self.scope_parents))
    }

    #[napi]
    pub fn query_globals(&mut self, names: Vec<String>) -> Result<Vec<GlobalFact>> {
        self.ensure_open()?;
        Ok(names
            .into_iter()
            .map(|name| GlobalFact {
                references: self
                    .retained_index
                    .global_references(&name)
                    .into_iter()
                    .map(|reference| GlobalReference {
                        id: reference.id,
                        start: reference.start,
                        end: reference.end,
                    })
                    .collect(),
                name,
            })
            .collect())
    }

    #[napi]
    pub fn query_bindings(
        &mut self,
        name: Option<String>,
        scope_id: Option<u32>,
        reads: Option<bool>,
        writes: Option<bool>,
    ) -> Result<Vec<NativeBindingFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.binding_facts(
            name.as_deref(),
            scope_id,
            reads.unwrap_or(false),
            writes.unwrap_or(false),
        ))
    }

    #[napi]
    pub fn query_captures(&mut self, function_id: u32) -> Result<Vec<NativeCaptureReference>> {
        self.ensure_open()?;
        Ok(self
            .retained_index
            .captures(function_id, &self.scope_parents))
    }

    #[napi]
    pub fn scope_parent_id(&self, scope_id: u32) -> Result<Option<u32>> {
        self.ensure_open()?;
        Ok(self
            .scope_parents
            .get(scope_id as usize)
            .copied()
            .filter(|parent| *parent != u32::MAX))
    }

    /// The complete scope-parent table as little-endian u32 words, so JavaScript can
    /// perform scope-chain walks without one N-API call per level.
    #[napi]
    pub fn scope_parents_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        let mut output = Vec::with_capacity(self.scope_parents.len() * 4);
        for &parent in &self.scope_parents {
            output.extend_from_slice(&parent.to_le_bytes());
        }
        Ok(output.into())
    }

    /// The binding-name table and key set for local JavaScript binding resolution.
    #[napi]
    pub fn binding_index_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self.retained_index.binding_index_buffer())
    }

    #[napi]
    pub fn close(&mut self) {
        self.closed = true;
        self.retained_index.clear();
        self.scope_parents.clear();
        self.initial_route_manifest = None;
        self.initial_routed_buffer = None;
        self.initial_routed_served = true;
    }

    #[napi]
    pub fn memory_usage(&self) -> u32 {
        (self.source.len()
            + self.filename.len()
            + self.retained_index.memory_usage()
            + self
                .initial_route_manifest
                .as_ref()
                .map_or(0, Vec::capacity)
            + self.initial_routed_buffer.as_ref().map_or(0, Vec::capacity))
        .min(u32::MAX as usize) as u32
    }

    #[napi]
    pub fn parse_count(&self) -> u32 {
        self.parse_count
    }

    #[napi]
    pub fn take_function_map(&mut self) -> Option<FunctionMap> {
        self.function_map.take()
    }

    fn ensure_open(&self) -> Result<()> {
        if self.closed {
            Err(Error::new(Status::GenericFailure, "session-closed"))
        } else {
            Ok(())
        }
    }
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

pub(crate) fn source_type(filename: &str, source: &str) -> Result<SourceType> {
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
        || (subscription == "Statement"
            && (node_type.ends_with("Statement") || declaration_subscription(node_type)))
        || (subscription == "Declaration" && declaration_subscription(node_type))
        || (subscription == "MemberExpression"
            && matches!(
                node_type,
                "StaticMemberExpression" | "ComputedMemberExpression" | "PrivateFieldExpression"
            ))
        || (subscription == "Expression" && expression_subscription(node_type))
        || (subscription == "ReferencedIdentifier" && node_type == "Identifier")
        || (subscription == "MetaProperty" && matches!(node_type, "ImportMeta" | "NewTarget"))
        || (matches!(
            subscription,
            "FunctionDeclaration" | "FunctionExpression" | "TSDeclareFunction"
        ) && node_type == "Function")
        || (matches!(subscription, "ClassDeclaration" | "ClassExpression") && node_type == "Class")
}

fn expression_subscription(node_type: &str) -> bool {
    node_type.ends_with("Expression")
        || matches!(
            node_type,
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

fn declaration_subscription(node_type: &str) -> bool {
    node_type.ends_with("Declaration")
        || matches!(
            node_type,
            "Function"
                | "Class"
                | "TSEnumDeclaration"
                | "TSInterfaceDeclaration"
                | "TSTypeAliasDeclaration"
                | "TSModuleDeclaration"
                | "TSImportEqualsDeclaration"
        )
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
            | "method"
            | "shorthand"
            | "prefix"
            | "delegate"
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
            | "parameterCount"
    ) {
        return value
            .parse::<u32>()
            .ok()
            .filter(|value| *value < 0x4000_0000)
            .map(|value| 0x4000_0000 | value);
    }
    None
}

fn intern_packed(strings: &mut FxHashMap<String, u32>, value: &str) -> u32 {
    if let Some(id) = strings.get(value) {
        return *id;
    }
    let id = strings.len() as u32;
    strings.insert(value.to_owned(), id);
    id
}

fn static_member_path(expression: &Expression<'_>) -> Option<String> {
    match expression {
        Expression::Identifier(identifier) => Some(identifier.name.to_string()),
        Expression::StaticMemberExpression(member) => Some(format!(
            "{}.{}",
            static_member_path(&member.object)?,
            member.property.name
        )),
        Expression::ComputedMemberExpression(member) => match &member.expression {
            Expression::StringLiteral(property) => Some(format!(
                "{}.{}",
                static_member_path(&member.object)?,
                property.value
            )),
            _ => None,
        },
        _ => None,
    }
}

struct DirectPackedFields {
    words: [u32; 32],
    len: usize,
}

fn packed_fields_direct<T: AsRef<str>>(
    kind: AstKind<'_>,
    scoping: Option<&Scoping>,
    utf16: Option<&[u32]>,
    requested: Option<&[T]>,
    precomputed_member_path: Option<&str>,
    strings: &mut FxHashMap<String, u32>,
) -> Option<DirectPackedFields> {
    let wants =
        |key: &str| requested.is_none_or(|fields| fields.iter().any(|field| field.as_ref() == key));
    let mut result = DirectPackedFields {
        words: [0; 32],
        len: 0,
    };
    // An explicitly empty request can push nothing; skip the kind match and constant
    // evaluation entirely for the common "routed without payload fields" case.
    if requested.is_some_and(<[T]>::is_empty) {
        return Some(result);
    }
    let mut push = |key: &str, value: u32| {
        if wants(key) {
            result.words[result.len] = field_key_id(key).expect("field protocol id");
            result.words[result.len + 1] = value;
            result.len += 2;
        }
    };
    match kind {
        AstKind::IdentifierReference(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
            if let Some(scoping) = scoping {
                let reference = identifier
                    .reference_id
                    .get()
                    .map(|id| scoping.get_reference(id));
                push(
                    "global",
                    0x8000_0000
                        | u32::from(
                            reference.is_some_and(|reference| reference.symbol_id().is_none()),
                        ),
                );
                if let Some(reference) = reference {
                    push("read", 0x8000_0000 | u32::from(reference.is_read()));
                    push("write", 0x8000_0000 | u32::from(reference.is_write()));
                    if let Some(symbol_id) = reference.symbol_id() {
                        push(
                            "bindingScopeId",
                            0x4000_0000 | scoping.symbol_scope_id(symbol_id).index() as u32,
                        );
                    }
                }
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
            push("binding", 0x8000_0001);
        }
        AstKind::IdentifierName(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
        }
        AstKind::StringLiteral(literal) => {
            if wants("value") {
                let value = intern_packed(strings, &literal.value);
                push("value", value);
            }
        }
        AstKind::NumericLiteral(literal) => {
            if wants("value") {
                let value = intern_packed(strings, &literal.value.to_string());
                push("value", value);
            }
        }
        AstKind::BooleanLiteral(literal) => {
            push("value", 0x8000_0000 | u32::from(literal.value));
        }
        AstKind::ObjectProperty(property) => {
            if wants("kind") {
                let kind = format!("{:?}", property.kind).to_ascii_lowercase();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push("computed", 0x8000_0000 | u32::from(property.computed));
            push("method", 0x8000_0000 | u32::from(property.method));
            push("shorthand", 0x8000_0000 | u32::from(property.shorthand));
            if wants("key")
                && let Some(key) = property.key.static_name()
            {
                let key = intern_packed(strings, &key);
                push("key", key);
            }
        }
        AstKind::BinaryExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::LogicalExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::AssignmentExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::UpdateExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
            push("prefix", 0x8000_0000 | u32::from(expression.prefix));
        }
        AstKind::UnaryExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
            push("prefix", 0x8000_0001);
        }
        AstKind::CallExpression(call) => {
            push("optional", 0x8000_0000 | u32::from(call.optional));
            push("argumentCount", 0x4000_0000 | call.arguments.len() as u32);
            if let Expression::Identifier(identifier) = &call.callee {
                if wants("calleeName") {
                    let value = intern_packed(strings, &identifier.name);
                    push("calleeName", value);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push("calleeGlobal", 0x8000_0000 | u32::from(global));
                }
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants("staticArgument")
            {
                let value = intern_packed(strings, &literal.value);
                push("staticArgument", value);
            }
        }
        AstKind::NewExpression(call) => {
            push("argumentCount", 0x4000_0000 | call.arguments.len() as u32);
            if let Expression::Identifier(identifier) = &call.callee
                && wants("calleeName")
            {
                let value = intern_packed(strings, &identifier.name);
                push("calleeName", value);
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
            if wants("memberPath") {
                if let Some(path) = precomputed_member_path {
                    let value = intern_packed(strings, path);
                    push("memberPath", value);
                } else if let Some(path) = static_member_path(&member.object) {
                    let path = format!("{path}.{}", member.property.name);
                    let value = intern_packed(strings, &path);
                    push("memberPath", value);
                }
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
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push("rootGlobal", 0x8000_0000 | u32::from(global));
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push("computed", 0x8000_0001);
            if let Expression::StringLiteral(property) = &member.expression {
                if wants("property") {
                    let value = intern_packed(strings, &property.value);
                    push("property", value);
                }
                if wants("memberPath")
                    && let Some(path) = static_member_path(&member.object)
                {
                    let path = format!("{path}.{}", property.value);
                    let value = intern_packed(strings, &path);
                    push("memberPath", value);
                }
            }
        }
        AstKind::Function(function) => {
            if wants("nodeKind") {
                let node_kind = format!("{:?}", function.r#type);
                let node_kind = intern_packed(strings, &node_kind);
                push("nodeKind", node_kind);
            }
            push("async", 0x8000_0000 | u32::from(function.r#async));
            push("generator", 0x8000_0000 | u32::from(function.generator));
            push(
                "parameterCount",
                0x4000_0000 | function.params.items.len() as u32,
            );
            if wants("name")
                && let Some(identifier) = &function.id
            {
                let name = intern_packed(strings, &identifier.name);
                push("name", name);
            }
            if let Some(body) = &function.body {
                let body_start = body.span.start + 1;
                let body_end = body.span.end.saturating_sub(1);
                push(
                    "bodyStart",
                    0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
                );
                push(
                    "bodyEnd",
                    0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
                );
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push("async", 0x8000_0000 | u32::from(function.r#async));
            push("expression", 0x8000_0000 | u32::from(function.expression));
            push(
                "parameterCount",
                0x4000_0000 | function.params.items.len() as u32,
            );
            let inset = u32::from(!function.expression);
            let body_start = function.body.span.start + inset;
            let body_end = function.body.span.end.saturating_sub(inset);
            push(
                "bodyStart",
                0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
            );
            push(
                "bodyEnd",
                0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
            );
        }
        AstKind::Class(class) => {
            if wants("nodeKind") {
                let node_kind = format!("{:?}", class.r#type);
                let node_kind = intern_packed(strings, &node_kind);
                push("nodeKind", node_kind);
            }
            if wants("name")
                && let Some(identifier) = &class.id
            {
                let name = intern_packed(strings, &identifier.name);
                push("name", name);
            }
        }
        AstKind::ImportDeclaration(declaration) => {
            if wants("source") {
                let source = intern_packed(strings, &declaration.source.value);
                push("source", source);
            }
            if wants("importKind") {
                let import_kind = format!("{:?}", declaration.import_kind).to_ascii_lowercase();
                let import_kind = intern_packed(strings, &import_kind);
                push("importKind", import_kind);
            }
            push(
                "specifierCount",
                0x4000_0000
                    | declaration
                        .specifiers
                        .as_ref()
                        .map_or(0, |specifiers| specifiers.len()) as u32,
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            if wants("imported") {
                let imported = intern_packed(strings, &specifier.imported.name());
                push("imported", imported);
            }
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
            if wants("importKind") {
                let import_kind = format!("{:?}", specifier.import_kind).to_ascii_lowercase();
                let import_kind = intern_packed(strings, &import_kind);
                push("importKind", import_kind);
            }
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            let imported = intern_packed(strings, "default");
            push("imported", imported);
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            let imported = intern_packed(strings, "*");
            push("imported", imported);
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if wants("source")
                && let Some(source) = &declaration.source
            {
                let source = intern_packed(strings, &source.value);
                push("source", source);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", declaration.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
            push(
                "specifierCount",
                0x4000_0000 | declaration.specifiers.len() as u32,
            );
        }
        AstKind::ExportAllDeclaration(declaration) => {
            if wants("source") {
                let source = intern_packed(strings, &declaration.source.value);
                push("source", source);
            }
            if wants("exported")
                && let Some(exported) = &declaration.exported
            {
                let exported = intern_packed(strings, &exported.name());
                push("exported", exported);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", declaration.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
        }
        AstKind::ExportSpecifier(specifier) => {
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name());
                push("local", local);
            }
            if wants("exported") {
                let exported = intern_packed(strings, &specifier.exported.name());
                push("exported", exported);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", specifier.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
        }
        AstKind::VariableDeclaration(declaration) => {
            if wants("kind") {
                let kind = declaration.kind.to_string();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push(
                "declarationCount",
                0x4000_0000 | declaration.declarations.len() as u32,
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            if wants("kind") {
                let kind = declarator.kind.to_string();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push(
                "hasInitializer",
                0x8000_0000 | u32::from(declarator.init.is_some()),
            );
        }
        AstKind::Directive(directive) => {
            if wants("value") {
                let value = intern_packed(strings, &directive.directive);
                push("value", value);
            }
        }
        AstKind::YieldExpression(expression) => {
            push("delegate", 0x8000_0000 | u32::from(expression.delegate));
        }
        AstKind::ImportMeta(_) => {
            let meta = intern_packed(strings, "import");
            push("meta", meta);
            let property = intern_packed(strings, "meta");
            push("property", property);
        }
        AstKind::NewTarget(_) => {
            let meta = intern_packed(strings, "new");
            push("meta", meta);
            let property = intern_packed(strings, "target");
            push("property", property);
        }
        _ => return None,
    }
    if let Some(value) = constant_for_kind(kind) {
        if wants("constantKind") {
            let kind = intern_packed(strings, value.kind());
            push("constantKind", kind);
        }
        if wants("constantValue") {
            let encoded = value.encode();
            let value = intern_packed(strings, &encoded);
            push("constantValue", value);
        }
    }
    Some(result)
}

fn fields(
    kind: AstKind<'_>,
    scoping: Option<&Scoping>,
    requested: Option<&[String]>,
) -> Vec<NodeField> {
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
            if let Some(scoping) = scoping {
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
        }
        AstKind::BindingIdentifier(identifier) => {
            push!("name", identifier.name.to_string());
            push!("binding", "true".into());
        }
        AstKind::IdentifierName(identifier) => push!("name", identifier.name.to_string()),
        AstKind::StringLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::NumericLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::BooleanLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::ObjectProperty(property) => {
            push!("kind", format!("{:?}", property.kind).to_ascii_lowercase());
            push!("computed", property.computed.to_string());
            push!("method", property.method.to_string());
            push!("shorthand", property.shorthand.to_string());
            if let Some(key) = property.key.static_name() {
                push!("key", key.to_string());
            }
        }
        AstKind::UpdateExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
            push!("prefix", expression.prefix.to_string());
        }
        AstKind::UnaryExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
            push!("prefix", "true".into());
        }
        AstKind::BinaryExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::LogicalExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::AssignmentExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::CallExpression(call) => {
            push!("optional", call.optional.to_string());
            push!("argumentCount", call.arguments.len().to_string());
            if let Expression::Identifier(identifier) = &call.callee {
                push!("calleeName", identifier.name.to_string());
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push!("calleeGlobal", global.to_string());
                }
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
            if let Some(path) = static_member_path(&member.object) {
                push!("memberPath", format!("{path}.{}", member.property.name));
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                push!("rootName", identifier.name.to_string());
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push!("rootGlobal", global.to_string());
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push!("computed", "true".into());
            if let Expression::StringLiteral(property) = &member.expression {
                push!("property", property.value.to_string());
                if let Some(path) = static_member_path(&member.object) {
                    push!("memberPath", format!("{path}.{}", property.value));
                }
            }
        }
        AstKind::Function(function) => {
            push!("nodeKind", format!("{:?}", function.r#type));
            push!("async", function.r#async.to_string());
            push!("generator", function.generator.to_string());
            push!("parameterCount", function.params.items.len().to_string());
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
            push!("parameterCount", function.params.items.len().to_string());
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
        AstKind::Class(class) => {
            push!("nodeKind", format!("{:?}", class.r#type));
            if let Some(identifier) = &class.id {
                push!("name", identifier.name.to_string());
            }
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
        AstKind::ExportAllDeclaration(declaration) => {
            push!("source", declaration.source.value.to_string());
            if let Some(exported) = &declaration.exported {
                push!("exported", exported.name().to_string());
            }
            push!(
                "exportKind",
                format!("{:?}", declaration.export_kind).to_ascii_lowercase(),
            );
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
        AstKind::YieldExpression(expression) => {
            push!("delegate", expression.delegate.to_string());
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
    if let Some(value) = constant_for_kind(kind) {
        push!("constantKind", value.kind().into());
        push!("constantValue", value.encode());
    }
    result
}

struct EventCollector<'a> {
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    function_map: Option<FunctionMapCollector<'a>>,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retained_string_ids: FxHashMap<String, u32>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum VisitSide {
    Enter,
    Exit,
}

impl<'a> EventCollector<'a> {
    fn retains_traversal_kind(&self, kind: AstKind<'a>) -> bool {
        self.retention_capabilities & RETAIN_INSPECTION != 0
            || self.retention_routes.is_some_and(|manifest| {
                !manifest.routes_by_type[ast_kind_protocol_id(kind) as usize].is_empty()
            })
    }

    fn record_summary(&mut self, kind: AstKind<'a>) {
        let id = kind.node_id();
        let node = self.nodes.get_node(id);
        let span = kind.span();
        let scope_id = match kind {
            AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
            AstKind::ArrowFunctionExpression(function) => {
                function.scope_id.get().unwrap_or(node.scope_id())
            }
            _ => node.scope_id(),
        };
        let is_root = id.index() == 0;
        self.retained_index.record(
            id.index() as u32,
            ast_kind_protocol_id(kind),
            self.utf16
                .map_or(span.start, |index| index[span.start as usize]),
            self.utf16
                .map_or(span.end, |index| index[span.end as usize]),
            (!is_root).then(|| self.nodes.parent_id(id).index() as u32),
            scope_id.index() as u32,
        );
        self.retained_index.record_semantics(
            kind,
            self.scoping,
            id.index() as u32,
            scope_id.index() as u32,
            self.retention_capabilities & RETAIN_IDENTIFIERS != 0,
        );
        if self.retention_capabilities & RETAIN_CALLS != 0
            && let AstKind::CallExpression(call) = kind
            && let Expression::Identifier(identifier) = &call.callee
        {
            let callee_global = identifier
                .reference_id
                .get()
                .is_some_and(|reference_id| !self.scoping.has_binding(reference_id));
            let static_argument = match call.arguments.first() {
                Some(oxc_ast::ast::Argument::StringLiteral(literal)) => {
                    Some(literal.value.to_string())
                }
                _ => None,
            };
            self.retained_index.record_call(
                id.index() as u32,
                identifier.name.as_str(),
                callee_global,
                static_argument,
            );
        }
        let retain_all_fields = self.retention_capabilities & RETAIN_MODULE_FACTS != 0;
        let retain_structural_fields = self.retention_routes.is_some_and(|manifest| {
            id.index() != 0
                && manifest
                    .structural_parent_types
                    .contains(&ast_kind_protocol_id(self.nodes.parent_kind(id)))
        });
        let protocol_id = ast_kind_protocol_id(kind);
        // A node without requested fields records nothing: an absent range and an empty
        // range read back identically.
        let requested_fields: &[String] = self.retention_routes.map_or(&[], |manifest| {
            &manifest.merged_field_names_by_type[protocol_id as usize]
        });
        if retain_all_fields || retain_structural_fields || !requested_fields.is_empty() {
            let member_path = if let AstKind::StaticMemberExpression(member) = kind {
                static_member_path(&member.object)
                    .map(|object| format!("{object}.{}", member.property.name))
            } else {
                None
            };
            let retained_fields = packed_fields_direct(
                kind,
                Some(self.scoping),
                self.utf16,
                (!retain_all_fields && !retain_structural_fields).then_some(requested_fields),
                member_path.as_deref(),
                &mut self.retained_string_ids,
            );
            if let Some(retained_fields) = retained_fields {
                self.retained_index.record_packed_fields(
                    id.index() as u32,
                    &retained_fields.words[..retained_fields.len],
                );
            }
        }
    }
}

impl<'a> Visit<'a> for EventCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.retained_index
            .record_enter(kind.node_id().index() as u32);
        if let Some(function_map) = &mut self.function_map {
            function_map.enter(kind);
        }
        self.record_summary(kind);
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.retains_traversal_kind(kind) {
            self.retained_index
                .record_exit(kind.node_id().index() as u32);
        }
        if let Some(function_map) = &mut self.function_map {
            function_map.leave(kind);
        }
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

fn materialize_with_scope_parents(
    source: &str,
    filename: &str,
    collect_function_map: bool,
    retention_manifest: Option<&[u8]>,
    initial_route_manifest: Option<&[u8]>,
    build_initial_route: bool,
) -> Result<MaterializedSessionParts> {
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
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let compiled_manifest = initial_route_manifest
        .map(decode_route_manifest)
        .transpose()?;
    let retention_manifest = retention_manifest.map(decode_route_manifest).transpose()?;
    let retention_capabilities = retention_manifest
        .as_ref()
        .or(compiled_manifest.as_ref())
        .map_or(u32::MAX, |manifest| manifest.retention_capabilities);
    let structural_parent_types = retention_manifest
        .as_ref()
        .or(compiled_manifest.as_ref())
        .map(|manifest| &manifest.structural_parent_types);
    let scope_parents = semantic_return
        .semantic
        .scoping()
        .scope_descendants_from_root()
        .map(|scope_id| {
            semantic_return
                .semantic
                .scoping()
                .scope_parent_id(scope_id)
                .map_or(u32::MAX, |parent_id| parent_id.index() as u32)
        })
        .collect::<Vec<_>>();
    let mut collector = EventCollector {
        nodes: semantic_return.semantic.nodes(),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        retained_index: RetainedIndex::with_node_count(
            semantic_return.semantic.nodes().len(),
            (retention_capabilities & RETAIN_CHILDREN != 0)
                .then_some(())
                .and(structural_parent_types),
            retention_capabilities & RETAIN_CONSTANTS != 0,
            retention_capabilities & (RETAIN_INSPECTION | RETAIN_MODULE_FACTS) != 0
                || retention_manifest.is_some(),
        ),
        function_map: collect_function_map
            .then(|| FunctionMapCollector::new(source, semantic_return.semantic.nodes(), filename)),
        retention_routes: retention_manifest.as_ref(),
        retention_capabilities,
        retained_string_ids: FxHashMap::default(),
    };
    collector.visit_program(&parsed.program);
    collector
        .retained_index
        .set_scalar_strings(std::mem::take(&mut collector.retained_string_ids));
    let function_map = collector
        .function_map
        .take()
        .map(FunctionMapCollector::finish);
    let initial_routed_buffer = if build_initial_route {
        compiled_manifest
            .as_ref()
            .map(|manifest| {
                routed_buffer_from_index(manifest, &collector.retained_index, &scope_parents, None)
                    .map(|buffer| buffer.to_vec())
            })
            .transpose()?
    } else {
        None
    };
    Ok(MaterializedSessionParts {
        scope_parents,
        retained_index: collector.retained_index,
        function_map,
        initial_routed_buffer,
    })
}

pub fn materialize_routed_buffer(
    source: &str,
    filename: &str,
    manifest_data: &[u8],
    root_start: Option<u32>,
    root_end: Option<u32>,
) -> Result<Buffer> {
    let manifest = decode_route_manifest(manifest_data)?;
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    // Semantic analysis is skipped entirely when no compiled route consumes semantic data.
    // The collector then assigns preorder node IDs itself during its single traversal.
    let semantic_return = manifest.needs_semantics.then(|| {
        SemanticBuilder::new()
            .with_build_nodes(true)
            .with_check_syntax_error(true)
            .build(&parsed.program)
    });
    if let Some(semantic_return) = &semantic_return
        && !semantic_return.diagnostics.is_empty()
    {
        return Err(Error::new(
            Status::InvalidArg,
            format!(
                "Oxc semantic analysis failed: {:?}",
                semantic_return.diagnostics
            ),
        ));
    }
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let mut collector = RoutedEventCollector {
        manifest: &manifest,
        nodes: semantic_return
            .as_ref()
            .map(|semantic_return| semantic_return.semantic.nodes()),
        scoping: semantic_return
            .as_ref()
            .map(|semantic_return| semantic_return.semantic.scoping()),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        node_count: 0,
        sequence: 0,
        words: PackedWords::with_capacity(source.len().saturating_mul(2)),
        string_ids: FxHashMap::default(),
        counts: RoutedCounts::default(),
        route_scratch: Vec::new(),
        parent_ids: FxHashSet::default(),
    };
    collector.visit_program(&parsed.program);
    let node_count = collector.node_count;
    let parents = stateless_parent_summaries(
        &collector.parent_ids,
        collector.nodes,
        collector.scoping,
        collector.utf16,
    );
    let data = collector.words.into_bytes();
    let mut strings = (0..collector.string_ids.len())
        .map(|_| String::new())
        .collect::<Vec<_>>();
    for (value, id) in collector.string_ids {
        strings[id as usize] = value;
    }
    encode_routed_envelope(
        &manifest,
        node_count,
        strings,
        data,
        collector.counts,
        parents,
    )
}

/// Eight-word `[id, type, start, end, parentId, parentTypeId, scopeId, scopeParentId]`
/// summaries for every unique routed parent, delivered with the envelope so JavaScript
/// never issues a separate summary request for parent access.
fn stateless_parent_summaries(
    parent_ids: &FxHashSet<u32>,
    nodes: Option<&AstNodes<'_>>,
    scoping: Option<&Scoping>,
    utf16: Option<&[u32]>,
) -> Vec<u32> {
    let (Some(nodes), Some(scoping)) = (nodes, scoping) else {
        return Vec::new();
    };
    let mut ordered = parent_ids.iter().copied().collect::<Vec<_>>();
    ordered.sort_unstable();
    let mut words = Vec::with_capacity(ordered.len() * 8);
    for id in ordered {
        let node = nodes.get_node(NodeId::new(id as usize));
        let kind = node.kind();
        let span = kind.span();
        let is_root = id == 0;
        let scope_id = match kind {
            AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
            AstKind::ArrowFunctionExpression(function) => {
                function.scope_id.get().unwrap_or(node.scope_id())
            }
            _ => node.scope_id(),
        };
        words.extend([
            id,
            ast_kind_protocol_id(kind),
            utf16.map_or(span.start, |index| index[span.start as usize]),
            utf16.map_or(span.end, |index| index[span.end as usize]),
            if is_root {
                u32::MAX
            } else {
                nodes.parent_id(node.id()).index() as u32
            },
            if is_root {
                u32::MAX
            } else {
                ast_kind_protocol_id(nodes.parent_kind(node.id()))
            },
            scope_id.index() as u32,
            scoping
                .scope_parent_id(scope_id)
                .map_or(u32::MAX, |parent| parent.index() as u32),
        ]);
    }
    words
}

fn routed_buffer_from_index(
    manifest: &CompiledManifest,
    index: &RetainedIndex,
    scope_parents: &[u32],
    root: Option<(u32, u32)>,
) -> Result<Buffer> {
    let mut writer =
        RetainedRouteWriter::with_capacity(index.traversal_records().len().saturating_mul(8));
    for &record in index.traversal_records() {
        let side = if record & 0x8000_0000 != 0 {
            VisitSide::Exit
        } else {
            VisitSide::Enter
        };
        let node_id = record & 0x7fff_ffff;
        writer.record(manifest, index, node_id, side, scope_parents, root);
    }
    writer.finish(manifest, index.len() as u32, index, scope_parents)
}

struct RetainedRouteWriter {
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
    sequence: u32,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
}

impl RetainedRouteWriter {
    fn with_capacity(capacity: usize) -> Self {
        Self {
            words: PackedWords::with_capacity(capacity),
            string_ids: FxHashMap::default(),
            counts: RoutedCounts::default(),
            sequence: 0,
            route_scratch: Vec::new(),
            parent_ids: FxHashSet::default(),
        }
    }

    fn record(
        &mut self,
        manifest: &CompiledManifest,
        index: &RetainedIndex,
        node_id: u32,
        side: VisitSide,
        scope_parents: &[u32],
        root: Option<(u32, u32)>,
    ) {
        let Some(protocol_id) = index.type_id(node_id) else {
            return;
        };
        let candidates = &manifest.routes_by_type[protocol_id as usize];
        if side == VisitSide::Exit && !candidates.iter().any(|route| route.side == VisitSide::Exit)
        {
            return;
        }
        let event_sequence = self.sequence;
        self.sequence += 1;
        if candidates.is_empty() {
            return;
        }
        let start = index.start(node_id);
        let end = index.end(node_id);
        if root.is_some_and(|(root_start, root_end)| start < root_start || end > root_end) {
            return;
        }
        let mut matched_routes = std::mem::take(&mut self.route_scratch);
        matched_routes.clear();
        let mut payload_route: Option<&CompiledRoute> = None;
        let mut payload_union: Vec<u32> = Vec::new();
        let mut matched_exit_carrier = false;
        for route in candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
        {
            if route
                .predicates
                .iter()
                .all(|predicate| retained_predicate_matches(predicate, index, node_id, protocol_id))
            {
                if route.side == side {
                    matched_routes.push(route.id);
                } else {
                    matched_exit_carrier = true;
                }
                if !route.payload_field_ids.is_empty() {
                    if payload_route.is_none() && payload_union.is_empty() {
                        payload_route = Some(route);
                    } else {
                        if let Some(previous) = payload_route.take() {
                            payload_union.extend_from_slice(&previous.payload_field_ids);
                        }
                        for &field_id in &route.payload_field_ids {
                            if !payload_union.contains(&field_id) {
                                payload_union.push(field_id);
                            }
                        }
                    }
                }
            }
        }
        if matched_routes.is_empty() && !matched_exit_carrier {
            self.route_scratch = matched_routes;
            return;
        }
        if side == VisitSide::Exit {
            self.words.extend([
                event_sequence | 0x8000_0000,
                node_id,
                matched_routes.len() as u32,
            ]);
            self.words.extend_from_slice(&matched_routes);
            self.counts.node_records += 1;
            self.counts.route_deliveries += matched_routes.len() as u32;
            self.route_scratch = matched_routes;
            return;
        }
        self.words
            .extend([event_sequence, node_id, protocol_id, start, end]);
        if manifest.include_parent {
            let parent_id = index.parent_id(node_id);
            if let Some(parent_id) = parent_id {
                self.parent_ids.insert(parent_id);
            }
            self.words.extend([
                parent_id.unwrap_or(u32::MAX),
                parent_id
                    .and_then(|parent_id| index.type_id(parent_id))
                    .unwrap_or(u32::MAX),
            ]);
        }
        if manifest.include_scope {
            let scope_id = index.scope_id(node_id);
            self.words.extend([
                scope_id,
                scope_parents
                    .get(scope_id as usize)
                    .copied()
                    .unwrap_or(u32::MAX),
            ]);
        }
        let payload_ids: &[u32] =
            payload_route.map_or(&payload_union, |route| &route.payload_field_ids);
        let present = payload_ids
            .iter()
            .filter(|&&field_id| index.scalar_field(node_id, field_id).is_some())
            .count();
        self.words.push(present as u32);
        for &field_id in payload_ids {
            let Some(retained) = index.scalar_field(node_id, field_id) else {
                continue;
            };
            let value = match retained {
                crate::retained_index::RetainedFieldValue::Packed(value) => value,
                crate::retained_index::RetainedFieldValue::String(id) => {
                    let value = index
                        .scalar_string(id)
                        .expect("retained scalar string id is valid");
                    let next = self.string_ids.len() as u32;
                    *self.string_ids.entry(value.to_owned()).or_insert(next)
                }
            };
            self.words.extend([field_id, value]);
        }
        self.words.push(matched_routes.len() as u32);
        self.words.extend_from_slice(&matched_routes);
        self.counts.node_records += 1;
        self.counts.route_deliveries += matched_routes.len() as u32;
        self.route_scratch = matched_routes;
    }

    fn finish(
        self,
        manifest: &CompiledManifest,
        node_count: u32,
        index: &RetainedIndex,
        scope_parents: &[u32],
    ) -> Result<Buffer> {
        let data = self.words.into_bytes();
        let mut strings = (0..self.string_ids.len())
            .map(|_| String::new())
            .collect::<Vec<_>>();
        for (value, id) in self.string_ids {
            strings[id as usize] = value;
        }
        let mut parent_ids = self.parent_ids.into_iter().collect::<Vec<_>>();
        parent_ids.sort_unstable();
        let parents = index.parent_summary_words(&parent_ids, scope_parents);
        encode_routed_envelope(manifest, node_count, strings, data, self.counts, parents)
    }
}

fn retained_predicate_matches(
    predicate: &CompiledPredicate,
    index: &RetainedIndex,
    node_id: u32,
    node_type_id: u32,
) -> bool {
    let field_name = field_key_name(predicate.field_id).expect("validated predicate field");
    let actual = index.scalar_field(node_id, predicate.field_id);
    if predicate.operation == 2 {
        let expected = matches!(
            predicate.values.first(),
            Some(CompiledScalar::Boolean(true))
        );
        return actual.is_some() == expected;
    }
    let Some(actual) = actual else {
        return false;
    };
    match actual {
        crate::retained_index::RetainedFieldValue::Packed(value)
            if value & 0x8000_0000 != 0 =>
        {
            predicate
                .values
                .iter()
                .any(|expected| matches!(expected, CompiledScalar::Boolean(expected) if *expected == (value & 1 != 0)))
        }
        crate::retained_index::RetainedFieldValue::Packed(value)
            if value & 0x4000_0000 != 0 =>
        {
            let actual = (value & 0x3fff_ffff) as f64;
            predicate
                .values
                .iter()
                .any(|expected| matches!(expected, CompiledScalar::Number(expected) if *expected == actual))
        }
        crate::retained_index::RetainedFieldValue::Packed(_) => false,
        crate::retained_index::RetainedFieldValue::String(id) => {
            let actual = index
                .scalar_string(id)
                .expect("retained scalar string id is valid");
            let scalar_type = predicate_scalar_type(field_name, node_type_id, actual);
            predicate.values.iter().any(|expected| match expected {
                CompiledScalar::String(value) => scalar_type == 0 && actual == value,
                CompiledScalar::Number(value) => {
                    scalar_type == 1
                        && actual
                            .parse::<f64>()
                            .is_ok_and(|actual| actual == *value)
                }
                CompiledScalar::Boolean(value) => {
                    scalar_type == 2
                        && actual.parse::<bool>().is_ok_and(|actual| actual == *value)
                }
                CompiledScalar::Null => false,
            })
        }
    }
}

fn encode_routed_envelope(
    manifest: &CompiledManifest,
    node_count: u32,
    strings: Vec<String>,
    data: Vec<u8>,
    counts: RoutedCounts,
    parent_summaries: Vec<u32>,
) -> Result<Buffer> {
    let strings_size: usize = strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let records_offset = 32 + strings_size + parent_summaries.len() * 4;
    let shape_flags = u32::from(manifest.include_parent)
        | (u32::from(manifest.include_scope) << 1)
        | (u32::from(manifest.include_exit) << 2);
    let mut output = Vec::with_capacity(records_offset + data.len());
    for word in [
        ROUTED_TAPE_MAGIC,
        shape_flags,
        node_count,
        counts.node_records,
        counts.route_deliveries,
        strings.len() as u32,
        records_offset as u32,
        (parent_summaries.len() / 8) as u32,
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
    }
    for word in parent_summaries {
        output.extend_from_slice(&word.to_le_bytes());
    }
    output.extend_from_slice(&data);
    Ok(output.into())
}

fn decode_route_manifest(data: &[u8]) -> Result<CompiledManifest> {
    if data.len() < 28 || data.len() > MAX_ROUTE_MANIFEST_BYTES || !data.len().is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest buffer",
        ));
    }
    let word = |index: usize| {
        u32::from_le_bytes(
            data[index * 4..index * 4 + 4]
                .try_into()
                .expect("word bounds"),
        )
    };
    if word(0) != ROUTE_MANIFEST_MAGIC {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest magic",
        ));
    }
    let flags = word(1);
    if flags & !0x3ff != 0 {
        return Err(Error::new(
            Status::InvalidArg,
            "unknown routed manifest flags",
        ));
    }
    let route_count = word(2) as usize;
    if route_count > MAX_COMPILED_ROUTES {
        return Err(Error::new(
            Status::InvalidArg,
            "compiled route limit exceeded",
        ));
    }
    let string_count = word(3) as usize;
    let strings_offset = word(4) as usize;
    let plugin_count = word(5) as usize;
    let structural_parent_count = word(6) as usize;
    if plugin_count > MAX_COMPILED_ROUTES {
        return Err(Error::new(
            Status::InvalidArg,
            "compiled plugin limit exceeded",
        ));
    }
    if strings_offset < 28 || strings_offset > data.len() || !strings_offset.is_multiple_of(4) {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid routed manifest string offset",
        ));
    }
    let mut strings = Vec::with_capacity(string_count);
    let mut byte_cursor = strings_offset;
    for _ in 0..string_count {
        if byte_cursor + 4 > data.len() {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated routed manifest strings",
            ));
        }
        let length =
            u32::from_le_bytes(data[byte_cursor..byte_cursor + 4].try_into().unwrap()) as usize;
        byte_cursor += 4;
        if byte_cursor + length > data.len() {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated routed manifest string",
            ));
        }
        strings.push(
            std::str::from_utf8(&data[byte_cursor..byte_cursor + length])
                .map_err(|_| Error::new(Status::InvalidArg, "invalid routed manifest UTF-8"))?
                .to_owned(),
        );
        byte_cursor = (byte_cursor + length).next_multiple_of(4);
    }
    let word_limit = strings_offset / 4;
    let mut cursor = 7;
    let mut seen_ids = FxHashSet::default();
    let mut routes_by_type = vec![Vec::new(); NODE_TYPE_COUNT + 1];
    for _ in 0..route_count {
        if cursor + 8 > word_limit {
            return Err(Error::new(Status::InvalidArg, "truncated compiled route"));
        }
        let id = word(cursor);
        let node_type_id = word(cursor + 1);
        let side = match word(cursor + 2) {
            0 => VisitSide::Enter,
            1 => VisitSide::Exit,
            _ => {
                return Err(Error::new(
                    Status::InvalidArg,
                    "invalid compiled route side",
                ));
            }
        };
        let plugin_id = word(cursor + 3) as usize;
        let order = word(cursor + 4) as usize;
        let route_flags = word(cursor + 5);
        let predicate_count = word(cursor + 6) as usize;
        let payload_count = word(cursor + 7) as usize;
        cursor += 8;
        if node_type_id == 0 || node_type_id as usize > NODE_TYPE_COUNT {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled node type id",
            ));
        }
        if plugin_id >= plugin_count || order >= route_count.max(1) {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled plugin or order id",
            ));
        }
        if id as usize >= route_count || !seen_ids.insert(id) {
            return Err(Error::new(
                Status::InvalidArg,
                "duplicate compiled route id",
            ));
        }
        if route_flags != 0
            || predicate_count > MAX_ROUTE_PREDICATES
            || payload_count > MAX_ROUTE_PAYLOAD_FIELDS
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid compiled route limits",
            ));
        }
        let mut predicates = Vec::with_capacity(predicate_count);
        for _ in 0..predicate_count {
            if cursor + 3 > word_limit {
                return Err(Error::new(
                    Status::InvalidArg,
                    "truncated compiled predicate",
                ));
            }
            let field_id = word(cursor);
            let operation = word(cursor + 1);
            let value_count = word(cursor + 2) as usize;
            cursor += 3;
            if field_key_name(field_id).is_none()
                || !predicate_field_supported(node_type_id, field_id)
                || operation > 2
                || (operation == 0 && value_count != 1)
                || (operation == 2 && value_count != 1)
                || value_count > MAX_PREDICATE_VALUES
                || cursor + value_count * 2 > word_limit
            {
                return Err(Error::new(Status::InvalidArg, "invalid compiled predicate"));
            }
            let mut values = Vec::with_capacity(value_count);
            for _ in 0..value_count {
                let tag = word(cursor);
                let payload = word(cursor + 1);
                cursor += 2;
                values.push(match tag {
                    0 => CompiledScalar::String(
                        strings
                            .get(payload as usize)
                            .ok_or_else(|| {
                                Error::new(Status::InvalidArg, "invalid predicate string id")
                            })?
                            .clone(),
                    ),
                    1 => CompiledScalar::Number(
                        strings
                            .get(payload as usize)
                            .ok_or_else(|| {
                                Error::new(Status::InvalidArg, "invalid predicate number id")
                            })?
                            .parse::<f64>()
                            .map_err(|_| {
                                Error::new(Status::InvalidArg, "invalid predicate number")
                            })?,
                    ),
                    2 => CompiledScalar::Boolean(payload != 0),
                    3 if payload == 0 => CompiledScalar::Null,
                    _ => return Err(Error::new(Status::InvalidArg, "invalid predicate scalar")),
                });
            }
            predicates.push(CompiledPredicate {
                field_id,
                operation,
                values,
            });
        }
        if cursor + payload_count > word_limit {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated route payload fields",
            ));
        }
        let mut payload_field_ids = Vec::with_capacity(payload_count);
        for _ in 0..payload_count {
            let field_id = word(cursor);
            cursor += 1;
            if field_key_name(field_id).is_none() {
                return Err(Error::new(Status::InvalidArg, "invalid payload field id"));
            }
            payload_field_ids.push(field_id);
        }
        let payload_names = payload_field_ids
            .iter()
            .filter_map(|&field_id| field_key_name(field_id).map(str::to_owned))
            .collect();
        routes_by_type[node_type_id as usize].push(CompiledRoute {
            id,
            node_type_id,
            side,
            predicates,
            payload_field_ids,
            payload_names,
        });
    }
    if cursor + structural_parent_count > word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated structural parent types",
        ));
    }
    let mut structural_parent_types = FxHashSet::default();
    for _ in 0..structural_parent_count {
        let type_id = word(cursor);
        cursor += 1;
        if type_id == 0
            || type_id as usize > NODE_TYPE_COUNT
            || !structural_parent_types.insert(type_id)
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid structural parent type",
            ));
        }
    }
    if cursor >= word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "missing retained field plan",
        ));
    }
    let retained_type_count = word(cursor) as usize;
    cursor += 1;
    let mut retained_fields_by_type = vec![Vec::new(); NODE_TYPE_COUNT + 1];
    for _ in 0..retained_type_count {
        if cursor + 2 > word_limit {
            return Err(Error::new(
                Status::InvalidArg,
                "truncated retained field plan",
            ));
        }
        let type_id = word(cursor);
        let field_count = word(cursor + 1) as usize;
        cursor += 2;
        if type_id == 0
            || type_id as usize > NODE_TYPE_COUNT
            || !retained_fields_by_type[type_id as usize].is_empty()
            || cursor + field_count > word_limit
        {
            return Err(Error::new(
                Status::InvalidArg,
                "invalid retained field plan",
            ));
        }
        let fields = &mut retained_fields_by_type[type_id as usize];
        for _ in 0..field_count {
            let field_id = word(cursor);
            cursor += 1;
            if field_key_name(field_id).is_none() || fields.contains(&field_id) {
                return Err(Error::new(Status::InvalidArg, "invalid retained field id"));
            }
            fields.push(field_id);
        }
    }
    if cursor != word_limit {
        return Err(Error::new(
            Status::InvalidArg,
            "trailing routed manifest words",
        ));
    }
    let include_exit = routes_by_type
        .iter()
        .flatten()
        .any(|route| route.side == VisitSide::Exit);
    let include_parent = flags & 1 != 0;
    let include_scope = flags & 2 != 0;
    let merged_field_names_by_type = routes_by_type
        .iter()
        .zip(&retained_fields_by_type)
        .map(|(routes, retained_field_ids)| {
            let mut names = Vec::new();
            let field_ids = routes
                .iter()
                .flat_map(|route| {
                    route
                        .payload_field_ids
                        .iter()
                        .copied()
                        .chain(route.predicates.iter().map(|predicate| predicate.field_id))
                })
                .chain(retained_field_ids.iter().copied());
            for field_id in field_ids {
                let name = field_key_name(field_id)
                    .expect("validated manifest field")
                    .to_owned();
                if !names.contains(&name) {
                    names.push(name);
                }
            }
            names
        })
        .collect::<Vec<_>>();
    let needs_semantics = include_parent
        || include_scope
        || merged_field_names_by_type
            .iter()
            .flatten()
            .any(|name| SEMANTIC_FIELD_KEYS.contains(&name.as_str()));
    let fallback_predicate_names_by_type = routes_by_type
        .iter()
        .enumerate()
        .map(|(type_id, routes)| {
            let mut names: Vec<String> = Vec::new();
            for predicate in routes.iter().flat_map(|route| route.predicates.iter()) {
                if let Some(name) = field_key_name(predicate.field_id)
                    && !has_direct_predicate_scalar(type_id as u32, name)
                    && !names.iter().any(|existing| existing == name)
                {
                    names.push(name.to_owned());
                }
            }
            names
        })
        .collect::<Vec<_>>();
    Ok(CompiledManifest {
        routes_by_type,
        include_parent,
        include_scope,
        include_exit,
        retention_capabilities: flags >> 2,
        structural_parent_types,
        merged_field_names_by_type,
        fallback_predicate_names_by_type,
        needs_semantics,
    })
}

struct PackedWords(Vec<u8>);

impl PackedWords {
    fn with_capacity(capacity: usize) -> Self {
        Self(Vec::with_capacity(capacity))
    }

    fn push(&mut self, word: u32) {
        self.0.extend_from_slice(&word.to_le_bytes());
    }

    fn extend<const N: usize>(&mut self, words: [u32; N]) {
        for word in words {
            self.push(word);
        }
    }

    fn extend_from_slice(&mut self, words: &[u32]) {
        for &word in words {
            self.push(word);
        }
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0
    }
}

struct RoutedEventCollector<'a> {
    manifest: &'a CompiledManifest,
    nodes: Option<&'a AstNodes<'a>>,
    scoping: Option<&'a Scoping>,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    node_count: u32,
    sequence: u32,
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
}

impl RoutedEventCollector<'_> {
    fn intern(&mut self, value: &str) -> u32 {
        if let Some(id) = self.string_ids.get(value) {
            return *id;
        }
        let id = self.string_ids.len() as u32;
        self.string_ids.insert(value.to_owned(), id);
        id
    }

    fn predicate_matches(
        &mut self,
        predicate: &CompiledPredicate,
        node_fields: &[NodeField],
        kind: AstKind<'_>,
    ) -> bool {
        let field_name = field_key_name(predicate.field_id).expect("validated predicate field");
        if let Some(actual) = direct_predicate_scalar(kind, self.scoping, field_name) {
            return compiled_predicate_matches(predicate, actual);
        }
        let node_type_id = ast_kind_protocol_id(kind);
        let actual = node_fields.iter().find(|field| field.key == field_name);
        if predicate.operation == 2 {
            let expected = matches!(
                predicate.values.first(),
                Some(CompiledScalar::Boolean(true))
            );
            return actual.is_some() == expected;
        }
        let Some(actual) = actual else {
            return false;
        };
        let scalar_type = predicate_scalar_type(field_name, node_type_id, &actual.value);
        predicate.values.iter().any(|expected| match expected {
            CompiledScalar::String(value) => scalar_type == 0 && actual.value == *value,
            CompiledScalar::Number(value) => {
                scalar_type == 1
                    && actual
                        .value
                        .parse::<f64>()
                        .is_ok_and(|actual| actual == *value)
            }
            CompiledScalar::Boolean(value) => {
                scalar_type == 2
                    && actual
                        .value
                        .parse::<bool>()
                        .is_ok_and(|actual| actual == *value)
            }
            CompiledScalar::Null => false,
        })
    }

    fn emit(&mut self, kind: AstKind<'_>, side: VisitSide) {
        let sequence = self.sequence;
        self.sequence += 1;
        let protocol_id = ast_kind_protocol_id(kind);
        let candidates = &self.manifest.routes_by_type[protocol_id as usize];
        if candidates.is_empty() {
            return;
        }
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
        let fallback_names = &self.manifest.fallback_predicate_names_by_type[protocol_id as usize];
        let mut predicate_fields = if fallback_names.is_empty() {
            Vec::new()
        } else {
            fields(kind, self.scoping, Some(fallback_names))
        };
        normalize_routed_fields(&mut predicate_fields, self.utf16);
        let mut matched_route_ids = std::mem::take(&mut self.route_scratch);
        matched_route_ids.clear();
        // Coalesced manifests make a single payload-carrying matched route the common
        // case; a union list is built only when distinct payload contracts match at once.
        let mut payload_route: Option<&CompiledRoute> = None;
        let mut payload_union: Vec<String> = Vec::new();
        let mut matched_exit_carrier = false;
        for route in candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
        {
            debug_assert_eq!(route.node_type_id, protocol_id);
            if route
                .predicates
                .iter()
                .all(|predicate| self.predicate_matches(predicate, &predicate_fields, kind))
            {
                if route.side == side {
                    matched_route_ids.push(route.id);
                } else {
                    matched_exit_carrier = true;
                }
                if !route.payload_names.is_empty() {
                    if payload_route.is_none() && payload_union.is_empty() {
                        payload_route = Some(route);
                    } else {
                        if let Some(previous) = payload_route.take() {
                            payload_union.extend(previous.payload_names.iter().cloned());
                        }
                        for name in &route.payload_names {
                            if !payload_union.contains(name) {
                                payload_union.push(name.clone());
                            }
                        }
                    }
                }
            }
        }
        if matched_route_ids.is_empty() && !matched_exit_carrier {
            self.route_scratch = matched_route_ids;
            return;
        }
        let id = kind.node_id();
        if side == VisitSide::Exit {
            self.words.extend([
                sequence | 0x8000_0000,
                id.index() as u32,
                matched_route_ids.len() as u32,
            ]);
            self.words.extend_from_slice(&matched_route_ids);
            self.counts.node_records += 1;
            self.counts.route_deliveries += matched_route_ids.len() as u32;
            self.route_scratch = matched_route_ids;
            return;
        }
        let payload_names: &[String] =
            payload_route.map_or(&payload_union, |route| &route.payload_names);
        let direct_payload = packed_fields_direct(
            kind,
            self.scoping,
            self.utf16,
            Some(payload_names),
            None,
            &mut self.string_ids,
        );
        let mut fallback_payload = if direct_payload.is_none() && !payload_names.is_empty() {
            fields(kind, self.scoping, Some(payload_names))
        } else {
            Vec::new()
        };
        normalize_routed_fields(&mut fallback_payload, self.utf16);
        let is_root = id.index() == 0;
        let parent_id = (self.manifest.include_parent && !is_root).then(|| {
            self.nodes
                .expect("parent routes require nodes")
                .parent_id(id)
                .index() as u32
        });
        let parent_type_id = if self.manifest.include_parent && !is_root {
            ast_kind_protocol_id(
                self.nodes
                    .expect("parent routes require nodes")
                    .parent_kind(id),
            )
        } else {
            u32::MAX
        };
        let scope_id = self.manifest.include_scope.then(|| {
            let nodes = self.nodes.expect("scope routes require nodes");
            let node = nodes.get_node(id);
            match kind {
                AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
                AstKind::ArrowFunctionExpression(function) => {
                    function.scope_id.get().unwrap_or(node.scope_id())
                }
                _ => node.scope_id(),
            }
        });
        self.words
            .extend([sequence, id.index() as u32, protocol_id, start, end]);
        if self.manifest.include_parent {
            if let Some(parent_id) = parent_id {
                self.parent_ids.insert(parent_id);
            }
            self.words
                .extend([parent_id.unwrap_or(u32::MAX), parent_type_id]);
        }
        if self.manifest.include_scope {
            let scope_id = scope_id.expect("scope id");
            self.words.extend([
                scope_id.index() as u32,
                self.scoping
                    .expect("scope routes require semantics")
                    .scope_parent_id(scope_id)
                    .map_or(u32::MAX, |id| id.index() as u32),
            ]);
        }
        if let Some(payload) = direct_payload {
            self.words.push((payload.len / 2) as u32);
            self.words.extend_from_slice(&payload.words[..payload.len]);
        } else {
            self.words.push(fallback_payload.len() as u32);
            for field in fallback_payload {
                let key = field_key_id(&field.key).expect("requested generated field");
                let value = packed_scalar(&field.key, &field.value)
                    .unwrap_or_else(|| self.intern(&field.value));
                self.words.extend([key, value]);
            }
        }
        self.words.push(matched_route_ids.len() as u32);
        self.words.extend_from_slice(&matched_route_ids);
        self.counts.node_records += 1;
        self.counts.route_deliveries += matched_route_ids.len() as u32;
        self.route_scratch = matched_route_ids;
    }
}

fn normalize_routed_fields(fields: &mut [NodeField], utf16: Option<&[u32]>) {
    for field in fields {
        if let Some(name) = field.key.strip_suffix("Byte")
            && let Ok(offset) = field.value.parse::<usize>()
        {
            field.key = name.to_owned();
            field.value = utf16
                .map_or(offset as u32, |index| index[offset])
                .to_string();
        }
    }
}

fn has_direct_predicate_scalar(node_type_id: u32, field: &str) -> bool {
    match node_type_name(node_type_id) {
        Some("Identifier") => matches!(
            field,
            "name" | "global" | "read" | "write" | "bindingScopeId" | "binding"
        ),
        Some("VariableDeclaration") | Some("VariableDeclarator") => field == "kind",
        Some("StaticMemberExpression") => field == "memberPath",
        Some("Function") | Some("Class") => field == "nodeKind",
        _ => false,
    }
}

fn direct_predicate_scalar<'a>(
    kind: AstKind<'a>,
    scoping: Option<&Scoping>,
    field: &str,
) -> Option<PredicateScalar<'a>> {
    match kind {
        AstKind::IdentifierReference(identifier) => {
            if field == "name" {
                return Some(PredicateScalar::String(Cow::Borrowed(
                    identifier.name.as_str(),
                )));
            }
            // The remaining identifier predicates are semantic; manifests requesting them
            // always run semantic analysis.
            let scoping = scoping?;
            let reference = identifier.reference_id.get();
            match field {
                "global" => {
                    Some(PredicateScalar::Boolean(reference.is_some_and(|id| {
                        scoping.get_reference(id).symbol_id().is_none()
                    })))
                }
                "read" => reference
                    .map(|id| PredicateScalar::Boolean(scoping.get_reference(id).is_read())),
                "write" => reference
                    .map(|id| PredicateScalar::Boolean(scoping.get_reference(id).is_write())),
                "bindingScopeId" => reference.and_then(|id| {
                    scoping.get_reference(id).symbol_id().map(|symbol_id| {
                        PredicateScalar::Number(scoping.symbol_scope_id(symbol_id).index() as f64)
                    })
                }),
                _ => None,
            }
        }
        AstKind::BindingIdentifier(identifier) => match field {
            "name" => Some(PredicateScalar::String(Cow::Borrowed(
                identifier.name.as_str(),
            ))),
            "binding" => Some(PredicateScalar::Boolean(true)),
            _ => None,
        },
        AstKind::IdentifierName(identifier) if field == "name" => Some(PredicateScalar::String(
            Cow::Borrowed(identifier.name.as_str()),
        )),
        AstKind::VariableDeclaration(declaration) if field == "kind" => Some(
            PredicateScalar::String(Cow::Owned(declaration.kind.to_string())),
        ),
        AstKind::VariableDeclarator(declarator) if field == "kind" => Some(
            PredicateScalar::String(Cow::Owned(declarator.kind.to_string())),
        ),
        AstKind::StaticMemberExpression(member) if field == "memberPath" => {
            static_member_path(&member.object).map(|object| {
                PredicateScalar::String(Cow::Owned(format!("{object}.{}", member.property.name)))
            })
        }
        AstKind::Function(function) if field == "nodeKind" => Some(PredicateScalar::String(
            Cow::Owned(format!("{:?}", function.r#type)),
        )),
        AstKind::Class(class) if field == "nodeKind" => Some(PredicateScalar::String(Cow::Owned(
            format!("{:?}", class.r#type),
        ))),
        _ => None,
    }
}

fn compiled_predicate_matches(predicate: &CompiledPredicate, actual: PredicateScalar<'_>) -> bool {
    if predicate.operation == 2 {
        return matches!(
            predicate.values.first(),
            Some(CompiledScalar::Boolean(true))
        );
    }
    predicate
        .values
        .iter()
        .any(|expected| match (expected, &actual) {
            (CompiledScalar::String(expected), PredicateScalar::String(actual)) => {
                expected == actual
            }
            (CompiledScalar::Number(expected), PredicateScalar::Number(actual)) => {
                expected == actual
            }
            (CompiledScalar::Boolean(expected), PredicateScalar::Boolean(actual)) => {
                expected == actual
            }
            _ => false,
        })
}

fn predicate_scalar_type(field: &str, node_type_id: u32, value: &str) -> u8 {
    if matches!(
        field,
        "bindingScopeId"
            | "argumentCount"
            | "bodyStart"
            | "bodyEnd"
            | "specifierCount"
            | "declarationCount"
            | "parameterCount"
    ) || (field == "value" && node_type_name(node_type_id) == Some("NumericLiteral"))
    {
        1
    } else if matches!(
        field,
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
            | "method"
            | "shorthand"
            | "prefix"
            | "delegate"
    ) || (field == "value" && node_type_name(node_type_id) == Some("BooleanLiteral"))
    {
        2
    } else if field == "constantValue" {
        if value == "true" || value == "false" {
            2
        } else if value.parse::<f64>().is_ok() {
            1
        } else {
            0
        }
    } else {
        0
    }
}

impl<'a> Visit<'a> for RoutedEventCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        if self.scoping.is_none() {
            kind.set_node_id(NodeId::new(self.node_count as usize));
        }
        self.node_count += 1;
        self.emit(kind, VisitSide::Enter);
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.manifest.routes_by_type[ast_kind_protocol_id(kind) as usize]
            .iter()
            .any(|route| route.side == VisitSide::Exit)
        {
            self.emit(kind, VisitSide::Exit);
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
    let edits = editor::resolve_copies(source, editor::normalize(source, commands)?)?;
    let (code, mappings, names) = if mode == Some("none") {
        (
            sourcemap::render_code(source, &edits),
            String::new(),
            Vec::new(),
        )
    } else {
        sourcemap::render(source, &edits, mode.unwrap_or("boundary"))
    };
    Ok(NativeCommitResult {
        code,
        map: NativeVlqMap { mappings, names },
    })
}

pub fn commit_packed(
    source: &str,
    filename: &str,
    data: &[u8],
    strings: Vec<String>,
    mode: Option<&str>,
) -> Result<NativeCommitResult> {
    if !data.len().is_multiple_of(4) || data.len() < 4 {
        return Err(Error::new(Status::InvalidArg, "invalid packed edit buffer"));
    }
    let word_count = data.len() / 4;
    let word =
        |index: usize| u32::from_le_bytes(data[index * 4..index * 4 + 4].try_into().unwrap());
    // Words region: [partsOffset, edit words..., parts table...]. The parts table holds
    // deferred content entries: [partCount, then per part (tag, a, b)] where tag 0 is an
    // interned text id and tag 1 is a source copy range in UTF-16 offsets.
    let parts_offset = word(0) as usize;
    if parts_offset < 1 || parts_offset > word_count {
        return Err(Error::new(
            Status::InvalidArg,
            "invalid packed parts offset",
        ));
    }
    let mut parts_entries: Vec<Vec<editor::RawContentPart>> = Vec::new();
    let mut parts_cursor = parts_offset;
    while parts_cursor < word_count {
        let part_count = word(parts_cursor) as usize;
        parts_cursor += 1;
        if parts_cursor + part_count * 3 > word_count {
            return Err(Error::new(Status::InvalidArg, "truncated packed parts"));
        }
        let mut entry = Vec::with_capacity(part_count);
        for part in 0..part_count {
            let base = parts_cursor + part * 3;
            entry.push(match word(base) {
                0 => editor::RawContentPart::Text(
                    strings
                        .get(word(base + 1) as usize)
                        .cloned()
                        .ok_or_else(|| {
                            Error::new(Status::InvalidArg, "invalid packed string id")
                        })?,
                ),
                1 => editor::RawContentPart::Copy {
                    start: word(base + 1),
                    end: word(base + 2),
                },
                _ => return Err(Error::new(Status::InvalidArg, "invalid packed part tag")),
            });
        }
        parts_cursor += part_count * 3;
        parts_entries.push(entry);
    }
    let mut cursor = 1;
    let mut edits = Vec::new();
    while cursor < parts_offset {
        if cursor + 7 > parts_offset {
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
        if cursor + 7 + name_count > parts_offset {
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
        const PARTS_TAG: u32 = 0x8000_0000;
        let (content, parts) =
            if content_id == u32::MAX {
                (None, Vec::new())
            } else if content_id & PARTS_TAG != 0 {
                let entry = (content_id & !PARTS_TAG) as usize;
                (
                    None,
                    parts_entries
                        .get(entry)
                        .cloned()
                        .ok_or_else(|| Error::new(Status::InvalidArg, "invalid packed parts id"))?,
                )
            } else {
                (
                    Some(strings.get(content_id as usize).cloned().ok_or_else(|| {
                        Error::new(Status::InvalidArg, "invalid packed string id")
                    })?),
                    Vec::new(),
                )
            };
        edits.push(editor::EditCommand {
            kind,
            start: word(cursor + 1),
            end: word(cursor + 2),
            content,
            parts,
            mapping: Some(mapping),
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
    // Strings arrive as one lengths table followed by a single concatenated UTF-8 slab,
    // so JavaScript performs one encode instead of one write call per string.
    if 8 + string_count * 4 > words_offset {
        return Err(Error::new(
            Status::InvalidArg,
            "truncated packed edit string",
        ));
    }
    let mut strings = Vec::with_capacity(string_count);
    let mut cursor = 8 + string_count * 4;
    for index in 0..string_count {
        let length_at = 8 + index * 4;
        let length =
            u32::from_le_bytes(data[length_at..length_at + 4].try_into().unwrap()) as usize;
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
        cursor += length;
    }
    commit_packed(source, filename, &data[words_offset..], strings, mode)
}

pub fn validate_expression(code: &str, parser_mode: Option<&str>) -> Result<()> {
    let source = format!("({code})");
    validate_fragment(&source, parser_mode, "expression")
}

pub fn validate_statements(code: &str, parser_mode: Option<&str>) -> Result<()> {
    validate_fragment(code, parser_mode, "statement")
}

fn validate_fragment(code: &str, parser_mode: Option<&str>, kind: &str) -> Result<()> {
    let extension = match parser_mode.unwrap_or("js") {
        "jsx" => "jsx",
        "ts" => "ts",
        "tsx" => "tsx",
        "dts" => "d.ts",
        _ => "js",
    };
    let allocator = Allocator::default();
    let parsed = Parser::new(
        &allocator,
        code,
        SourceType::from_path(format!("fragment.{extension}")).unwrap(),
    )
    .parse();
    if parsed.diagnostics.is_empty() {
        Ok(())
    } else {
        Err(Error::new(
            Status::InvalidArg,
            format!("invalid {kind} fragment: {:?}", parsed.diagnostics),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_flow_as_unsupported() {
        let result = classify_source("fixture.js", "// @flow\nconst x: number = 1");
        assert!(!result.supported);
        assert_eq!(result.syntax, "flow");
    }
}
