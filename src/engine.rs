use std::borrow::Cow;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::{AstKind, ast::Expression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::constant_eval::constant_for_kind;
pub use crate::event_types::{
    EventBatch, FieldRequest, NativeCommitResult, NativeEvent, NativeVlqMap, NodeField,
    PackedEventBatch, ParseClassification,
};
use crate::function_map::{FunctionMap, FunctionMapCollector};
use crate::generated_event_schema::{
    FIELD_KEY_COUNT, NODE_TYPE_COUNT, ast_kind_protocol_id, field_key_id, field_key_name,
    node_type_id, node_type_name, predicate_field_supported,
};
use crate::{editor, sourcemap};

struct PackedEventParts {
    data: Vec<u8>,
    strings: Vec<String>,
    node_count: u32,
    emitted_count: u32,
}

struct MaterializedSessionParts {
    batch: EventBatch,
    scope_parents: Vec<u32>,
    node_summaries: Vec<NodeSummary>,
    function_map: Option<FunctionMap>,
}

const ROUTE_MANIFEST_MAGIC: u32 = 0x4e_52_4d_46; // NRMF
const ROUTED_TAPE_MAGIC: u32 = 0x4e_52_54_46; // NRTF
const MAX_COMPILED_ROUTES: usize = 4096;
const MAX_ROUTE_PREDICATES: usize = 64;
const MAX_PREDICATE_VALUES: usize = 1024;
const MAX_ROUTE_PAYLOAD_FIELDS: usize = 64;
const MAX_ROUTE_MANIFEST_BYTES: usize = 4 * 1024 * 1024;

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
}

struct CompiledManifest {
    routes_by_type: Vec<Vec<CompiledRoute>>,
    include_parent: bool,
    include_scope: bool,
    include_exit: bool,
}

#[derive(Default)]
struct RoutedCounts {
    node_records: u32,
    route_deliveries: u32,
}

#[derive(Clone, Copy, Default)]
struct NodeSummary {
    type_id: u32,
    start: u32,
    end: u32,
    parent_id: Option<u32>,
    parent_type_id: Option<u32>,
    scope_id: u32,
    scope_parent_id: Option<u32>,
}

#[napi]
pub struct NativeIndexedSession {
    source: String,
    filename: String,
    events: Vec<NativeEvent>,
    enter_event_indexes: Vec<usize>,
    node_summaries: Vec<NodeSummary>,
    node_count: u32,
    materialized_subscriptions: Vec<String>,
    materialized_exit_subscriptions: Vec<String>,
    scope_parents: Vec<u32>,
    parse_count: u32,
    function_map: Option<FunctionMap>,
    closed: bool,
}

#[napi]
impl NativeIndexedSession {
    #[napi(constructor)]
    pub fn new(
        source: String,
        filename: String,
        subscriptions: Option<Vec<String>>,
        exit_subscriptions: Option<Vec<String>>,
        function_map: Option<bool>,
    ) -> Result<Self> {
        let subscriptions = subscriptions.unwrap_or_default();
        let exit_subscriptions = exit_subscriptions.unwrap_or_default();
        let collect_function_map = function_map.unwrap_or(false);
        let parse_count = u32::from(!subscriptions.is_empty() || collect_function_map);
        let parts = if subscriptions.is_empty() && !collect_function_map {
            MaterializedSessionParts {
                batch: EventBatch {
                    events: Vec::new(),
                    node_count: 0,
                    emitted_count: 0,
                },
                scope_parents: Vec::new(),
                node_summaries: Vec::new(),
                function_map: None,
            }
        } else {
            materialize_with_scope_parents(
                &source,
                &filename,
                &subscriptions,
                &exit_subscriptions,
                None,
                None,
                collect_function_map,
            )?
        };
        let MaterializedSessionParts {
            batch,
            scope_parents,
            node_summaries,
            function_map,
        } = parts;
        let events = batch.events;
        let enter_event_indexes = index_enter_events(&events, batch.node_count);
        Ok(Self {
            source,
            filename,
            events,
            enter_event_indexes,
            node_summaries,
            node_count: batch.node_count,
            materialized_subscriptions: subscriptions,
            materialized_exit_subscriptions: exit_subscriptions,
            scope_parents,
            parse_count,
            function_map,
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
        self.ensure_materialized(&subscriptions, &subscriptions)?;
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
        hydrate_exit_events(&mut events);
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
        })
    }

    #[napi]
    pub fn next_packed(
        &mut self,
        subscriptions: Vec<String>,
        root_start: Option<u32>,
        root_end: Option<u32>,
        field_requests: Option<Vec<FieldRequest>>,
        exit_subscriptions: Option<Vec<String>>,
    ) -> Result<PackedEventBatch> {
        self.ensure_open()?;
        let exit_subscriptions = exit_subscriptions.unwrap_or_default();
        self.ensure_materialized(&subscriptions, &exit_subscriptions)?;
        let root = root_start.zip(root_end);
        let mut strings = Vec::<String>::new();
        let mut string_ids = FxHashMap::<String, u32>::default();
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
            let selected = if event.side == "exit" {
                &exit_subscriptions
            } else {
                &subscriptions
            };
            selected
                .iter()
                .flat_map(|subscription| subscription.split('|'))
                .any(|subscription| alias_matches(subscription, &event.r#type))
                && root.is_none_or(|(start, end)| event.start >= start && event.end <= end)
        }) {
            if event.side == "exit" {
                words.extend([event.sequence | 0x8000_0000, event.id]);
                emitted_count += 1;
                continue;
            }
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
        let manifest = decode_route_manifest(&manifest)?;
        let mut subscriptions = Vec::new();
        let mut exit_subscriptions = Vec::new();
        for routes in &manifest.routes_by_type {
            for route in routes {
                let name = node_type_name(route.node_type_id)
                    .expect("validated route node type")
                    .to_owned();
                if !subscriptions.contains(&name) {
                    subscriptions.push(name.clone());
                }
                if route.side == VisitSide::Exit && !exit_subscriptions.contains(&name) {
                    exit_subscriptions.push(name);
                }
            }
        }
        self.ensure_materialized(&subscriptions, &exit_subscriptions)?;
        routed_buffer_from_index(
            &manifest,
            &self.events,
            &self.enter_event_indexes,
            self.node_count,
            root_start.zip(root_end),
        )
    }

    #[napi]
    pub fn inspect(&mut self, node_ids: Vec<u32>) -> Result<Vec<NativeEvent>> {
        self.ensure_open()?;
        self.ensure_materialized(&["*".into()], &[])?;
        Ok(node_ids
            .into_iter()
            .filter_map(|id| {
                let index = *self.enter_event_indexes.get(id as usize)?;
                self.events.get(index).cloned()
            })
            .collect())
    }

    #[napi]
    pub fn node_summary(&self, node_id: u32) -> Result<Option<NativeEvent>> {
        self.ensure_open()?;
        Ok(self
            .node_summaries
            .get(node_id as usize)
            .copied()
            .map(|summary| summary.event(node_id)))
    }

    #[napi]
    pub fn node_summaries_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        let mut output = Vec::with_capacity(self.node_summaries.len() * 7 * 4);
        for summary in &self.node_summaries {
            for word in [
                summary.type_id,
                summary.start,
                summary.end,
                summary.parent_id.unwrap_or(u32::MAX),
                summary.parent_type_id.unwrap_or(u32::MAX),
                summary.scope_id,
                summary.scope_parent_id.unwrap_or(u32::MAX),
            ] {
                output.extend_from_slice(&word.to_le_bytes());
            }
        }
        Ok(output.into())
    }

    #[napi]
    pub fn children_packed_buffer(
        &mut self,
        parent_ids: Vec<u32>,
        parent_types: Vec<String>,
        parent_type_ids: Vec<u32>,
    ) -> Result<Buffer> {
        self.ensure_open()?;
        self.ensure_materialized(&["*".into()], &[])?;
        let mut parent_ids = parent_ids.into_iter().collect::<FxHashSet<_>>();
        let parent_type_ids = parent_type_ids.into_iter().collect::<FxHashSet<_>>();
        parent_ids.extend(
            self.events
                .iter()
                .filter(|event| event.side == "enter")
                .filter(|event| {
                    node_type_id(&event.r#type).is_some_and(|id| parent_type_ids.contains(&id))
                        || parent_types
                            .iter()
                            .any(|parent_type| alias_matches(parent_type, &event.r#type))
                })
                .map(|event| event.id),
        );
        Ok(pack_event_refs(
            self.events.iter().filter(|event| {
                event.side == "enter"
                    && event
                        .parent_id
                        .is_some_and(|parent_id| parent_ids.contains(&parent_id))
            }),
            self.node_count,
        ))
    }

    #[napi]
    pub fn constants_packed_buffer(&mut self, node_ids: Vec<u32>) -> Result<Buffer> {
        self.ensure_open()?;
        self.ensure_materialized(&["Expression".into()], &[])?;
        let node_ids = node_ids.into_iter().collect::<FxHashSet<_>>();
        Ok(pack_event_refs(
            self.events
                .iter()
                .filter(|event| event.side == "enter" && node_ids.contains(&event.id)),
            self.node_count,
        ))
    }

    #[napi]
    pub fn query_globals(&mut self, names: Vec<String>) -> Result<Vec<GlobalFact>> {
        self.ensure_open()?;
        self.ensure_materialized(&["Identifier".into()], &[])?;
        Ok(globals_from_events(&self.events, &names))
    }

    #[napi]
    pub fn scope_parents_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        let mut data = Vec::with_capacity(self.scope_parents.len() * 4);
        for parent in &self.scope_parents {
            data.extend_from_slice(&parent.to_le_bytes());
        }
        Ok(data.into())
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
        self.enter_event_indexes.clear();
        self.node_summaries.clear();
        self.scope_parents.clear();
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
        (self.source.len()
            + self.filename.len()
            + event_bytes
            + self.node_summaries.len() * std::mem::size_of::<NodeSummary>()
            + self.enter_event_indexes.len() * std::mem::size_of::<usize>())
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

    fn ensure_materialized(
        &mut self,
        subscriptions: &[String],
        exit_subscriptions: &[String],
    ) -> Result<()> {
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
        let missing_exits: Vec<String> = exit_subscriptions
            .iter()
            .filter(|subscription| {
                !self
                    .materialized_exit_subscriptions
                    .iter()
                    .any(|existing| existing == "*" || existing == *subscription)
            })
            .cloned()
            .collect();
        if missing.is_empty() && missing_exits.is_empty() {
            return Ok(());
        }
        let mut materialized = missing.clone();
        for subscription in &missing_exits {
            if !materialized.iter().any(|existing| existing == subscription) {
                materialized.push(subscription.clone());
            }
        }
        let parts = materialize_with_scope_parents(
            &self.source,
            &self.filename,
            &materialized,
            &missing_exits,
            None,
            None,
            false,
        )?;
        let MaterializedSessionParts {
            batch,
            scope_parents,
            node_summaries,
            ..
        } = parts;
        self.parse_count += 1;
        self.node_count = batch.node_count;
        self.scope_parents = scope_parents;
        if self.node_summaries.is_empty() {
            self.node_summaries = node_summaries;
        }
        let mut existing = FxHashSet::default();
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
        self.enter_event_indexes = index_enter_events(&self.events, self.node_count);
        self.materialized_subscriptions.extend(missing);
        self.materialized_exit_subscriptions.extend(missing_exits);
        Ok(())
    }
}

impl NodeSummary {
    fn event(self, id: u32) -> NativeEvent {
        NativeEvent {
            sequence: id,
            side: "enter".into(),
            id,
            r#type: node_type_name(self.type_id).unwrap_or("Unknown").into(),
            start: self.start,
            end: self.end,
            parent_id: self.parent_id,
            parent_type: self
                .parent_type_id
                .and_then(node_type_name)
                .map(str::to_owned),
            scope_id: self.scope_id,
            scope_parent_id: self.scope_parent_id,
            fields: Vec::new(),
        }
    }
}

fn index_enter_events(events: &[NativeEvent], node_count: u32) -> Vec<usize> {
    let mut indexes = vec![usize::MAX; node_count as usize];
    for (index, event) in events.iter().enumerate() {
        if event.side == "enter"
            && let Some(slot) = indexes.get_mut(event.id as usize)
        {
            *slot = index;
        }
    }
    indexes
}

fn pack_event_refs<'a>(events: impl Iterator<Item = &'a NativeEvent>, node_count: u32) -> Buffer {
    let mut strings = Vec::<String>::new();
    let mut string_ids = FxHashMap::<String, u32>::default();
    let mut words = Vec::<u32>::new();
    let mut emitted_count = 0_u32;
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
    for event in events {
        let type_tag =
            node_type_id(&event.r#type).unwrap_or_else(|| 0x8000_0000 | intern(&event.r#type));
        let parent_type_tag = event.parent_type.as_ref().map_or(u32::MAX, |value| {
            node_type_id(value).unwrap_or_else(|| 0x8000_0000 | intern(value))
        });
        words.extend([
            event.sequence,
            event.id,
            type_tag,
            event.start,
            event.end,
            event.parent_id.unwrap_or(u32::MAX),
            parent_type_tag,
            event.scope_id,
            event.scope_parent_id.unwrap_or(u32::MAX),
            event.fields.len() as u32,
        ]);
        for field in &event.fields {
            words
                .push(field_key_id(&field.key).unwrap_or_else(|| 0x8000_0000 | intern(&field.key)));
            words.push(
                packed_scalar(&field.key, &field.value).unwrap_or_else(|| intern(&field.value)),
            );
        }
        emitted_count += 1;
    }
    let strings_size: usize = strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let words_offset = 16 + strings_size;
    let mut output = Vec::with_capacity(words_offset + words.len() * 4);
    for word in [
        node_count | 0xc000_0000,
        emitted_count,
        strings.len() as u32,
        words_offset as u32,
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
    }
    for word in words {
        output.extend_from_slice(&word.to_le_bytes());
    }
    output.into()
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
    scoping: &Scoping,
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
            let reference = identifier
                .reference_id
                .get()
                .map(|id| scoping.get_reference(id));
            push(
                "global",
                0x8000_0000
                    | u32::from(reference.is_some_and(|reference| reference.symbol_id().is_none())),
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
                let global = identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                push("rootGlobal", 0x8000_0000 | u32::from(global));
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
            if let Some(path) = static_member_path(&member.object) {
                push!("memberPath", format!("{path}.{}", member.property.name));
            }
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
    subscriptions: [bool; NODE_TYPE_COUNT + 1],
    exit_subscriptions: [bool; NODE_TYPE_COUNT + 1],
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    events: Vec<NativeEvent>,
    node_summaries: Vec<NodeSummary>,
    sequence: u32,
    function_map: Option<FunctionMapCollector<'a>>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum VisitSide {
    Enter,
    Exit,
}

impl VisitSide {
    const fn as_str(self) -> &'static str {
        match self {
            Self::Enter => "enter",
            Self::Exit => "exit",
        }
    }
}

impl<'a> EventCollector<'a> {
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
        self.node_summaries[id.index()] = NodeSummary {
            type_id: ast_kind_protocol_id(kind),
            start: self
                .utf16
                .map_or(span.start, |index| index[span.start as usize]),
            end: self
                .utf16
                .map_or(span.end, |index| index[span.end as usize]),
            parent_id: (!is_root).then(|| self.nodes.parent_id(id).index() as u32),
            parent_type_id: (!is_root).then(|| ast_kind_protocol_id(self.nodes.parent_kind(id))),
            scope_id: scope_id.index() as u32,
            scope_parent_id: self
                .scoping
                .scope_parent_id(scope_id)
                .map(|id| id.index() as u32),
        };
    }

    fn emit(&mut self, kind: AstKind<'a>, side: VisitSide) {
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
        if !self.subscriptions[protocol_id as usize] {
            return;
        }
        let node_type = node_type_name(protocol_id)
            .expect("generated protocol covers every Oxc AstKind")
            .to_owned();
        let id = kind.node_id();
        if side == VisitSide::Exit {
            self.events.push(NativeEvent {
                sequence,
                side: side.as_str().into(),
                id: id.index() as u32,
                r#type: node_type,
                start,
                end,
                parent_id: None,
                parent_type: None,
                scope_id: 0,
                scope_parent_id: None,
                fields: Vec::new(),
            });
            return;
        }
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
            side: side.as_str().into(),
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
        if let Some(function_map) = &mut self.function_map {
            function_map.enter(kind);
        }
        self.record_summary(kind);
        self.emit(kind, VisitSide::Enter);
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.exit_subscriptions[ast_kind_protocol_id(kind) as usize] {
            self.emit(kind, VisitSide::Exit);
        }
        if let Some(function_map) = &mut self.function_map {
            function_map.leave(kind);
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
    let exit_subscriptions = if include_exit { subscriptions } else { &[] };
    materialize_with_scope_parents(
        source,
        filename,
        subscriptions,
        exit_subscriptions,
        root_start,
        root_end,
        false,
    )
    .map(|mut parts| {
        hydrate_exit_events(&mut parts.batch.events);
        parts.batch
    })
}

fn hydrate_exit_events(events: &mut [NativeEvent]) {
    let mut enters = FxHashMap::default();
    for index in 0..events.len() {
        if events[index].side == "enter" {
            enters.insert(events[index].id, index);
            continue;
        }
        let Some(&enter_index) = enters.get(&events[index].id) else {
            continue;
        };
        let sequence = events[index].sequence;
        let mut exit = events[enter_index].clone();
        exit.sequence = sequence;
        exit.side = "exit".into();
        events[index] = exit;
    }
}

fn materialize_with_scope_parents(
    source: &str,
    filename: &str,
    subscriptions: &[String],
    exit_subscriptions: &[String],
    root_start: Option<u32>,
    root_end: Option<u32>,
    collect_function_map: bool,
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
    let mut collector = EventCollector {
        subscriptions: subscription_set_from_names(subscriptions),
        exit_subscriptions: subscription_set_from_names(exit_subscriptions),
        nodes: semantic_return.semantic.nodes(),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        events: Vec::new(),
        node_summaries: vec![NodeSummary::default(); semantic_return.semantic.nodes().len()],
        sequence: 0,
        function_map: collect_function_map
            .then(|| FunctionMapCollector::new(source, semantic_return.semantic.nodes(), filename)),
    };
    collector.visit_program(&parsed.program);
    let function_map = collector
        .function_map
        .take()
        .map(FunctionMapCollector::finish);
    let emitted_count = collector.events.len() as u32;
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
        .collect();
    Ok(MaterializedSessionParts {
        batch: EventBatch {
            events: collector.events,
            node_count: semantic_return.semantic.nodes().len() as u32,
            emitted_count,
        },
        scope_parents,
        node_summaries: collector.node_summaries,
        function_map,
    })
}

#[expect(
    clippy::too_many_arguments,
    reason = "primitive FFI inputs avoid object conversion"
)]
pub fn materialize_packed(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    exit_subscriptions: Vec<String>,
    exit_subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
) -> Result<PackedEventBatch> {
    let parts = materialize_packed_internal(
        source,
        filename,
        subscriptions,
        subscription_ids,
        exit_subscriptions,
        exit_subscription_ids,
        root_start,
        root_end,
        packed_field_requests,
        true,
        true,
        &[],
        &[],
    )?;
    Ok(PackedEventBatch {
        data: parts.data.into(),
        strings: parts.strings,
        node_count: parts.node_count,
        emitted_count: parts.emitted_count,
    })
}

#[expect(
    clippy::too_many_arguments,
    reason = "primitive FFI inputs avoid object conversion"
)]
fn materialize_packed_internal(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    exit_subscriptions: Vec<String>,
    exit_subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
    include_parent: bool,
    include_scope: bool,
    identifier_names: &[String],
    static_member_patterns: &[String],
) -> Result<PackedEventParts> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    let build_nodes = include_parent || include_scope;
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(build_nodes)
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
    let node_count = semantic_return.semantic.stats().nodes;
    let field_requests = decode_field_requests(packed_field_requests)?;
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let output_capacity =
        source
            .len()
            .saturating_mul(if subscriptions.iter().any(|value| value == "*") {
                6
            } else {
                2
            });
    let mut collector = PackedEventCollector {
        subscriptions: &subscriptions,
        subscription_ids: subscription_set(&subscription_ids),
        exit_subscription_ids: subscription_set_with_names(
            &exit_subscription_ids,
            &exit_subscriptions,
        ),
        field_requests: field_requests.as_deref(),
        nodes: build_nodes.then(|| semantic_return.semantic.nodes()),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        include_parent,
        include_scope,
        identifier_names,
        static_member_patterns,
        sequence: 0,
        emitted_count: 0,
        words: PackedWords::with_capacity(output_capacity),
        string_ids: FxHashMap::default(),
    };
    collector.visit_program(&parsed.program);
    let data = collector.words.into_bytes();
    let mut strings = (0..collector.string_ids.len())
        .map(|_| String::new())
        .collect::<Vec<_>>();
    for (value, id) in collector.string_ids {
        strings[id as usize] = value;
    }
    Ok(PackedEventParts {
        data,
        strings,
        node_count,
        emitted_count: collector.emitted_count,
    })
}

#[expect(
    clippy::too_many_arguments,
    reason = "primitive FFI inputs avoid object conversion"
)]
pub fn materialize_packed_buffer(
    source: &str,
    filename: &str,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    exit_subscriptions: Vec<String>,
    exit_subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    packed_field_requests: Option<&[u8]>,
    include_parent: Option<bool>,
    include_scope: Option<bool>,
    identifier_names: Vec<String>,
    static_member_patterns: Vec<String>,
) -> Result<Buffer> {
    let include_parent = include_parent.unwrap_or(true);
    let include_scope = include_scope.unwrap_or(true);
    let include_exit = !exit_subscription_ids.is_empty() || !exit_subscriptions.is_empty();
    let parts = materialize_packed_internal(
        source,
        filename,
        subscriptions,
        subscription_ids,
        exit_subscriptions,
        exit_subscription_ids,
        root_start,
        root_end,
        packed_field_requests,
        include_parent,
        include_scope,
        &identifier_names,
        &static_member_patterns,
    )?;
    let strings_size: usize = parts
        .strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let words_offset = 16 + strings_size;
    let mut output = Vec::with_capacity(words_offset + parts.data.len());
    let shape_node_count = parts.node_count
        | if include_parent { 0x8000_0000 } else { 0 }
        | if include_scope { 0x4000_0000 } else { 0 }
        | if include_exit { 0x2000_0000 } else { 0 };
    for word in [
        shape_node_count,
        parts.emitted_count,
        parts.strings.len() as u32,
        words_offset as u32,
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in parts.strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
    }
    output.extend_from_slice(&parts.data);
    Ok(output.into())
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
    let build_nodes = manifest.include_parent || manifest.include_scope;
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(build_nodes)
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
    let mut collector = RoutedEventCollector {
        manifest: &manifest,
        nodes: build_nodes.then(|| semantic_return.semantic.nodes()),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root: root_start.zip(root_end),
        sequence: 0,
        words: PackedWords::with_capacity(source.len().saturating_mul(2)),
        string_ids: FxHashMap::default(),
        counts: RoutedCounts::default(),
    };
    collector.visit_program(&parsed.program);
    let data = collector.words.into_bytes();
    let mut strings = (0..collector.string_ids.len())
        .map(|_| String::new())
        .collect::<Vec<_>>();
    for (value, id) in collector.string_ids {
        strings[id as usize] = value;
    }
    encode_routed_envelope(
        &manifest,
        semantic_return.semantic.stats().nodes,
        strings,
        data,
        collector.counts,
    )
}

fn routed_buffer_from_index(
    manifest: &CompiledManifest,
    events: &[NativeEvent],
    enter_indexes: &[usize],
    node_count: u32,
    root: Option<(u32, u32)>,
) -> Result<Buffer> {
    let mut words = PackedWords::with_capacity(events.len().saturating_mul(24));
    let mut string_ids = FxHashMap::<String, u32>::default();
    let mut counts = RoutedCounts::default();
    for event in events {
        if root.is_some_and(|(start, end)| event.start < start || event.end > end) {
            continue;
        }
        let Some(protocol_id) = node_type_id(&event.r#type) else {
            continue;
        };
        let candidates = &manifest.routes_by_type[protocol_id as usize];
        if candidates.is_empty() {
            continue;
        }
        let side = if event.side == "exit" {
            VisitSide::Exit
        } else {
            VisitSide::Enter
        };
        let source_event = if side == VisitSide::Exit {
            enter_indexes
                .get(event.id as usize)
                .and_then(|index| events.get(*index))
                .ok_or_else(|| Error::new(Status::GenericFailure, "indexed exit has no enter"))?
        } else {
            event
        };
        let mut matched_routes = Vec::new();
        let mut payload_field_ids = [false; FIELD_KEY_COUNT + 1];
        let mut matched_exit_carrier = false;
        for route in candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
        {
            if route
                .predicates
                .iter()
                .all(|predicate| indexed_predicate_matches(predicate, source_event, protocol_id))
            {
                if route.side == side {
                    matched_routes.push(route.id);
                } else {
                    matched_exit_carrier = true;
                }
                for &field_id in &route.payload_field_ids {
                    payload_field_ids[field_id as usize] = true;
                }
            }
        }
        if matched_routes.is_empty() && !matched_exit_carrier {
            continue;
        }
        if side == VisitSide::Exit {
            words.extend([
                event.sequence | 0x8000_0000,
                event.id,
                matched_routes.len() as u32,
            ]);
            words.extend_from_slice(&matched_routes);
            counts.node_records += 1;
            counts.route_deliveries += matched_routes.len() as u32;
            continue;
        }
        words.extend([
            event.sequence,
            event.id,
            protocol_id,
            event.start,
            event.end,
        ]);
        if manifest.include_parent {
            words.extend([
                event.parent_id.unwrap_or(u32::MAX),
                event
                    .parent_type
                    .as_deref()
                    .and_then(node_type_id)
                    .unwrap_or(u32::MAX),
            ]);
        }
        if manifest.include_scope {
            words.extend([event.scope_id, event.scope_parent_id.unwrap_or(u32::MAX)]);
        }
        let payload_fields = source_event
            .fields
            .iter()
            .filter(|field| {
                field_key_id(&field.key).is_some_and(|id| payload_field_ids[id as usize])
            })
            .collect::<Vec<_>>();
        words.push(payload_fields.len() as u32);
        for field in payload_fields {
            let field_id = field_key_id(&field.key).expect("filtered field id");
            let value = packed_scalar(&field.key, &field.value).unwrap_or_else(|| {
                let next = string_ids.len() as u32;
                *string_ids.entry(field.value.clone()).or_insert(next)
            });
            words.extend([field_id, value]);
        }
        words.push(matched_routes.len() as u32);
        words.extend_from_slice(&matched_routes);
        counts.node_records += 1;
        counts.route_deliveries += matched_routes.len() as u32;
    }
    let data = words.into_bytes();
    let mut strings = (0..string_ids.len())
        .map(|_| String::new())
        .collect::<Vec<_>>();
    for (value, id) in string_ids {
        strings[id as usize] = value;
    }
    encode_routed_envelope(manifest, node_count, strings, data, counts)
}

fn indexed_predicate_matches(
    predicate: &CompiledPredicate,
    event: &NativeEvent,
    node_type_id: u32,
) -> bool {
    let field_name = field_key_name(predicate.field_id).expect("validated predicate field");
    let actual = event.fields.iter().find(|field| field.key == field_name);
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

fn encode_routed_envelope(
    manifest: &CompiledManifest,
    node_count: u32,
    strings: Vec<String>,
    data: Vec<u8>,
    counts: RoutedCounts,
) -> Result<Buffer> {
    let strings_size: usize = strings
        .iter()
        .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
        .sum();
    let records_offset = 28 + strings_size;
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
    ] {
        output.extend_from_slice(&word.to_le_bytes());
    }
    for value in strings {
        output.extend_from_slice(&(value.len() as u32).to_le_bytes());
        output.extend_from_slice(value.as_bytes());
        output.resize(output.len().next_multiple_of(4), 0);
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
    if flags & !3 != 0 {
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
        routes_by_type[node_type_id as usize].push(CompiledRoute {
            id,
            node_type_id,
            side,
            predicates,
            payload_field_ids,
        });
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
    Ok(CompiledManifest {
        routes_by_type,
        include_parent: flags & 1 != 0,
        include_scope: flags & 2 != 0,
        include_exit,
    })
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

fn subscription_set(ids: &[u32]) -> [bool; NODE_TYPE_COUNT + 1] {
    let mut subscriptions = [false; NODE_TYPE_COUNT + 1];
    for &id in ids {
        if let Some(subscribed) = subscriptions.get_mut(id as usize) {
            *subscribed = true;
        }
    }
    subscriptions
}

fn subscription_set_from_names(names: &[String]) -> [bool; NODE_TYPE_COUNT + 1] {
    let mut subscriptions = [false; NODE_TYPE_COUNT + 1];
    for (id, subscribed) in subscriptions.iter_mut().enumerate().skip(1) {
        let node_type = node_type_name(id as u32).expect("generated node type id");
        *subscribed = names
            .iter()
            .any(|subscription| alias_matches(subscription, node_type));
    }
    subscriptions
}

fn subscription_set_with_names(ids: &[u32], names: &[String]) -> [bool; NODE_TYPE_COUNT + 1] {
    let mut subscriptions = subscription_set(ids);
    if !names.is_empty() {
        let named = subscription_set_from_names(names);
        for (subscribed, named) in subscriptions.iter_mut().zip(named) {
            *subscribed |= named;
        }
    }
    subscriptions
}

struct PackedEventCollector<'a> {
    subscriptions: &'a [String],
    subscription_ids: [bool; NODE_TYPE_COUNT + 1],
    exit_subscription_ids: [bool; NODE_TYPE_COUNT + 1],
    field_requests: Option<&'a [FieldRequest]>,
    nodes: Option<&'a AstNodes<'a>>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    include_parent: bool,
    include_scope: bool,
    identifier_names: &'a [String],
    static_member_patterns: &'a [String],
    sequence: u32,
    emitted_count: u32,
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
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

impl PackedEventCollector<'_> {
    fn intern(&mut self, value: &str) -> u32 {
        if let Some(id) = self.string_ids.get(value) {
            return *id;
        }
        let id = self.string_ids.len() as u32;
        self.string_ids.insert(value.to_owned(), id);
        id
    }
    fn emit(&mut self, kind: AstKind<'_>, side: VisitSide) {
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
        let fast_match = self.subscription_ids[protocol_id as usize];
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
        if !self.identifier_names.is_empty() {
            let identifier_name = match kind {
                AstKind::IdentifierReference(identifier) => Some(identifier.name.as_str()),
                AstKind::BindingIdentifier(identifier) => Some(identifier.name.as_str()),
                AstKind::IdentifierName(identifier) => Some(identifier.name.as_str()),
                _ => None,
            };
            if identifier_name.is_some_and(|identifier_name| {
                !self
                    .identifier_names
                    .iter()
                    .any(|name| name == identifier_name)
            }) {
                return;
            }
        }
        let mut filtered_static_member_path = None;
        if !self.static_member_patterns.is_empty()
            && let AstKind::StaticMemberExpression(member) = kind
        {
            let path = static_member_path(&member.object)
                .map(|object| format!("{object}.{}", member.property.name));
            if path.as_ref().is_none_or(|path| {
                !self
                    .static_member_patterns
                    .iter()
                    .any(|pattern| pattern == path)
            }) {
                return;
            }
            filtered_static_member_path = path;
        }
        let id = kind.node_id();
        if side == VisitSide::Exit {
            self.words
                .extend([sequence | 0x8000_0000, id.index() as u32]);
            self.emitted_count += 1;
            return;
        }
        let scope_id = self.include_scope.then(|| {
            let nodes = self
                .nodes
                .expect("scope collection requires the node store");
            let node = nodes.get_node(id);
            match kind {
                AstKind::Function(function) => function.scope_id.get().unwrap_or(node.scope_id()),
                AstKind::ArrowFunctionExpression(function) => {
                    function.scope_id.get().unwrap_or(node.scope_id())
                }
                _ => node.scope_id(),
            }
        });
        let is_root = id.index() == 0;
        let parent_id = (self.include_parent && !is_root).then(|| {
            self.nodes
                .expect("parent collection requires the node store")
                .parent_id(id)
                .index() as u32
        });
        let parent_type_id = if self.include_parent && !is_root {
            ast_kind_protocol_id(
                self.nodes
                    .expect("parent collection requires the node store")
                    .parent_kind(id),
            )
        } else {
            u32::MAX
        };
        let event_scope_id = scope_id.map_or(0, |id| id.index() as u32);
        let scope_parent_id = scope_id
            .and_then(|id| self.scoping.scope_parent_id(id))
            .map_or(u32::MAX, |id| id.index() as u32);
        let emit_header = |words: &mut PackedWords, field_count: u32| {
            words.extend([sequence, id.index() as u32, protocol_id, start, end]);
            if self.include_parent {
                words.extend([parent_id.unwrap_or(u32::MAX), parent_type_id]);
            }
            if self.include_scope {
                words.extend([event_scope_id, scope_parent_id]);
            }
            words.push(field_count);
        };
        let requested = self.field_requests.and_then(|requests| {
            requests
                .iter()
                .find(|request| request.node_type == node_type)
        });
        let requested_fields = requested.map(|request| request.fields.as_slice());
        if let Some(node_fields) = packed_fields_direct(
            kind,
            self.scoping,
            self.utf16,
            requested_fields,
            filtered_static_member_path.as_deref(),
            &mut self.string_ids,
        ) {
            emit_header(&mut self.words, (node_fields.len / 2) as u32);
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
        emit_header(&mut self.words, node_fields.len() as u32);
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
        self.emit(kind, VisitSide::Enter);
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.exit_subscription_ids[ast_kind_protocol_id(kind) as usize] {
            self.emit(kind, VisitSide::Exit);
        }
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

struct RoutedEventCollector<'a> {
    manifest: &'a CompiledManifest,
    nodes: Option<&'a AstNodes<'a>>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    sequence: u32,
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
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
        let predicate_field_names = candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
            .flat_map(|route| route.predicates.iter())
            .filter_map(|predicate| field_key_name(predicate.field_id))
            .filter(|field| !has_direct_predicate_scalar(protocol_id, field))
            .map(str::to_owned)
            .collect::<Vec<_>>();
        let mut predicate_fields = if predicate_field_names.is_empty() {
            Vec::new()
        } else {
            fields(kind, self.scoping, Some(&predicate_field_names))
        };
        normalize_routed_fields(&mut predicate_fields, self.utf16);
        let mut matched_route_ids = Vec::new();
        let mut payload_field_ids = [false; FIELD_KEY_COUNT + 1];
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
                for &field_id in &route.payload_field_ids {
                    payload_field_ids[field_id as usize] = true;
                }
            }
        }
        if matched_route_ids.is_empty() && !matched_exit_carrier {
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
            return;
        }
        let payload_names = payload_field_ids
            .iter()
            .enumerate()
            .filter(|(_, requested)| **requested)
            .filter_map(|(id, _)| field_key_name(id as u32))
            .collect::<Vec<_>>();
        let direct_payload = packed_fields_direct(
            kind,
            self.scoping,
            self.utf16,
            Some(&payload_names),
            None,
            &mut self.string_ids,
        );
        let mut fallback_payload = if direct_payload.is_none() && !payload_names.is_empty() {
            fields(
                kind,
                self.scoping,
                Some(
                    &payload_names
                        .iter()
                        .map(|field| (*field).to_owned())
                        .collect::<Vec<_>>(),
                ),
            )
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
            self.words
                .extend([parent_id.unwrap_or(u32::MAX), parent_type_id]);
        }
        if self.manifest.include_scope {
            let scope_id = scope_id.expect("scope id");
            self.words.extend([
                scope_id.index() as u32,
                self.scoping
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
    scoping: &Scoping,
    field: &str,
) -> Option<PredicateScalar<'a>> {
    match kind {
        AstKind::IdentifierReference(identifier) => match field {
            "name" => Some(PredicateScalar::String(Cow::Borrowed(
                identifier.name.as_str(),
            ))),
            "global" => Some(PredicateScalar::Boolean(
                identifier
                    .reference_id
                    .get()
                    .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none()),
            )),
            "read" => identifier
                .reference_id
                .get()
                .map(|id| PredicateScalar::Boolean(scoping.get_reference(id).is_read())),
            "write" => identifier
                .reference_id
                .get()
                .map(|id| PredicateScalar::Boolean(scoping.get_reference(id).is_write())),
            "bindingScopeId" => identifier.reference_id.get().and_then(|id| {
                scoping.get_reference(id).symbol_id().map(|symbol_id| {
                    PredicateScalar::Number(scoping.symbol_scope_id(symbol_id).index() as f64)
                })
            }),
            _ => None,
        },
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
    let edits = editor::normalize(source, commands)?;
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
