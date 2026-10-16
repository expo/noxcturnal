use std::{borrow::Cow, cell::Cell};

use napi::{Result, bindgen_prelude::Buffer};
use oxc_allocator::Allocator;
use oxc_ast::{
    AstKind,
    ast::{Comment, TSEnumMemberName},
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder, Stats};
use oxc_span::GetSpan;
use oxc_syntax::node::NodeId;
use oxc_syntax::scope::{ScopeFlags, ScopeId};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::event_types::NodeField;
use crate::generated::event_schema::{
    ast_kind_protocol_id, field_key_id, field_key_name, node_type_name,
};
use crate::protocol::constants::FieldMask;
use crate::protocol::manifest::{CompiledManifest, CompiledPredicate, CompiledScalar, VisitSide};
use crate::protocol::routed::{PackedWords, encode_routed_envelope};
use crate::syntax::classification::source_type;

use super::fields::{
    fields, packed_fields_direct, packed_scalar, predicate_scalar_type, utf16_index,
};

use super::member::{
    MemberPathInterner, member_write_root_child, mutation_target_child, tracks_member_writes,
};
use super::{RoutedCounts, decode_route_manifest};

enum PredicateScalar<'a> {
    String(Cow<'a, str>),
    Number(f64),
    Boolean(bool),
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
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "routed-materialization",
        ));
    }
    materialize_routed_program(
        source,
        &allocator,
        &parsed.program,
        &manifest,
        root_start.zip(root_end),
    )
}

pub(super) fn materialize_routed_program<'a>(
    source: &'a str,
    allocator: &'a Allocator,
    program: &oxc_ast::ast::Program<'a>,
    manifest: &CompiledManifest,
    root: Option<(u32, u32)>,
) -> Result<Buffer> {
    let semantic_return = manifest.needs_semantics.then(|| {
        SemanticBuilder::new()
            .with_build_nodes(true)
            .with_check_syntax_error(true)
            .build(program)
    });
    if let Some(semantic_return) = &semantic_return
        && !semantic_return.diagnostics.is_empty()
    {
        return Err(crate::parse_failure::error(
            source,
            &semantic_return.diagnostics,
            "routed-materialization",
        ));
    }
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, allocator));
    let mut collector = RoutedEventCollector {
        source,
        manifest,
        nodes: semantic_return
            .as_ref()
            .map(|semantic_return| semantic_return.semantic.nodes()),
        scoping: semantic_return
            .as_ref()
            .map(|semantic_return| semantic_return.semantic.scoping()),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        root,
        node_count: 0,
        validation_stats: Stats::default(),
        sequence: 0,
        words: PackedWords::with_capacity(source.len().saturating_mul(2)),
        string_ids: FxHashMap::default(),
        counts: RoutedCounts::default(),
        route_scratch: Vec::new(),
        parent_ids: FxHashSet::default(),
        target_stack: Vec::new(),
        tracks_member_writes: tracks_member_writes(Some(manifest), manifest.retention_capabilities),
        member_paths: MemberPathInterner::default(),
        comments: manifest
            .needs_comments
            .then_some(program.comments.as_slice()),
    };
    // Program-only routes need no descendant payloads or traversal. Validation
    // still visits the entire AST and supplies its exact node count; reuse that
    // count instead of walking the same tree again just to emit its root.
    if manifest.program_only && !manifest.needs_semantics {
        let validated = crate::syntax::validation::validate_program(
            program,
            "routed-materialization",
            allocator,
        )?;
        collector.node_count = validated.stats.nodes;
        collector.emit(AstKind::Program(program), VisitSide::Enter, false, false);
        if manifest.include_exit {
            collector.sequence = collector.node_count;
            collector.emit(AstKind::Program(program), VisitSide::Exit, false, false);
        }
    } else {
        collector.visit_program(program);
    }
    if !manifest.needs_semantics && !manifest.program_only {
        collector.validation_stats.nodes = collector.node_count;
        crate::syntax::validation::validate_program_with_stats(
            program,
            "routed-materialization",
            collector.validation_stats,
        )?;
    }
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
        manifest,
        node_count,
        strings,
        data,
        collector.counts.node_records,
        collector.counts.route_deliveries,
        parents,
    )
}

/// Eight-word `[id, type, start, end, parentId, parentTypeId, scopeId, scopeParentId]`
/// summaries for every unique routed ancestor, delivered with the envelope so
/// JavaScript never issues a separate summary request while walking ancestry.
fn stateless_parent_summaries(
    parent_ids: &FxHashSet<u32>,
    nodes: Option<&AstNodes<'_>>,
    scoping: Option<&Scoping>,
    utf16: Option<&[u32]>,
) -> Vec<u32> {
    let (Some(nodes), Some(scoping)) = (nodes, scoping) else {
        return Vec::new();
    };
    let mut ancestor_ids = parent_ids.clone();
    let seeds = ancestor_ids.iter().copied().collect::<Vec<_>>();
    for seed in seeds {
        let mut current = NodeId::new(seed as usize);
        while current.index() != 0 {
            let parent = nodes.parent_id(current);
            if !ancestor_ids.insert(parent.index() as u32) {
                break;
            }
            current = parent;
        }
    }
    let mut ordered = ancestor_ids.into_iter().collect::<Vec<_>>();
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

struct RoutedEventCollector<'a> {
    source: &'a str,
    manifest: &'a CompiledManifest,
    nodes: Option<&'a AstNodes<'a>>,
    scoping: Option<&'a Scoping>,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    node_count: u32,
    validation_stats: Stats,
    sequence: u32,
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
    target_stack: Vec<(AstKind<'a>, bool, bool)>,
    tracks_member_writes: bool,
    member_paths: MemberPathInterner,
    comments: Option<&'a [Comment]>,
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
        member_write: bool,
        member_root_write: bool,
    ) -> bool {
        let field_name = field_key_name(predicate.field_id).expect("validated predicate field");
        if field_name == "memberPath" {
            let actual = self.member_paths.kind(kind);
            if predicate.operation == 2 {
                let expected = matches!(
                    predicate.values.first(),
                    Some(CompiledScalar::Boolean(true))
                );
                return actual.is_some() == expected;
            }
            let Some(actual) = actual else { return false };
            return predicate.values.iter().any(|expected| {
                let CompiledScalar::String(expected) = expected else {
                    return false;
                };
                actual == self.member_paths.expected(expected)
            });
        }
        if let Some(actual) = direct_predicate_scalar(
            kind,
            self.scoping,
            field_name,
            member_write,
            member_root_write,
        ) {
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
        let (scalar_type, value) = if field_name == "constantValue" {
            crate::semantic::value_transport::scalar(&actual.value)
        } else {
            (
                predicate_scalar_type(field_name, node_type_id, &actual.value),
                actual.value.as_str(),
            )
        };
        predicate.values.iter().any(|expected| match expected {
            CompiledScalar::String(expected) => scalar_type == 0 && value == expected,
            CompiledScalar::Number(expected) => {
                scalar_type == 1 && value.parse::<f64>().is_ok_and(|actual| actual == *expected)
            }
            CompiledScalar::Boolean(expected) => {
                scalar_type == 2
                    && value
                        .parse::<bool>()
                        .is_ok_and(|actual| actual == *expected)
            }
            CompiledScalar::Null => scalar_type == 3,
        })
    }

    fn emit(
        &mut self,
        kind: AstKind<'_>,
        side: VisitSide,
        member_write: bool,
        member_root_write: bool,
    ) {
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
        let fallback_predicates =
            self.manifest.fallback_predicate_mask_by_type[protocol_id as usize];
        let mut predicate_fields = if fallback_predicates.is_empty() {
            Vec::new()
        } else {
            fields(
                kind,
                self.source,
                member_write,
                member_root_write,
                self.scoping,
                fallback_predicates,
            )
        };
        normalize_routed_fields(&mut predicate_fields, self.utf16);
        let mut matched_route_ids = std::mem::take(&mut self.route_scratch);
        matched_route_ids.clear();
        // Several matched routes may carry different payload contracts; the union of
        // their selections is a bitwise or, so coalescing costs nothing.
        let mut payload_mask = FieldMask::none();
        let mut matched_exit_carrier = false;
        let mut comments_inner = false;
        for route in candidates
            .iter()
            .filter(|route| side == VisitSide::Enter || route.side == side)
        {
            debug_assert_eq!(route.node_type_id, protocol_id);
            if route.predicates.iter().all(|predicate| {
                self.predicate_matches(
                    predicate,
                    &predicate_fields,
                    kind,
                    member_write,
                    member_root_write,
                )
            }) {
                if route.side == side {
                    matched_route_ids.push(route.id);
                } else {
                    matched_exit_carrier = true;
                }
                payload_mask = payload_mask.union(route.payload_mask);
                comments_inner |= route.comments_inner;
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
        let direct_payload = packed_fields_direct(
            kind,
            self.source,
            member_write,
            member_root_write,
            self.scoping,
            self.utf16,
            payload_mask,
            &mut self.string_ids,
            &mut self.member_paths,
        );
        let mut fallback_payload = if direct_payload.is_none() && !payload_mask.is_empty() {
            fields(
                kind,
                self.source,
                member_write,
                member_root_write,
                self.scoping,
                payload_mask,
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
        if self.manifest.needs_comments {
            if comments_inner {
                let comments = self.comments.expect("demanded parser comments");
                let first = comments.partition_point(|comment| comment.span.start < span.start);
                let contained = comments[first..]
                    .iter()
                    .take_while(|comment| comment.span.end <= span.end)
                    .copied()
                    .collect::<Vec<_>>();
                self.words.push(contained.len() as u32);
                for comment in contained {
                    let content = comment.content_span();
                    let value =
                        self.intern(&self.source[content.start as usize..content.end as usize]);
                    self.words.extend([
                        u32::from(comment.is_block()),
                        value,
                        self.utf16.map_or(comment.span.start, |index| {
                            index[comment.span.start as usize]
                        }),
                        self.utf16
                            .map_or(comment.span.end, |index| index[comment.span.end as usize]),
                    ]);
                }
            } else {
                self.words.push(0);
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

pub(crate) fn has_direct_predicate_scalar(node_type_id: u32, field: &str) -> bool {
    match node_type_name(node_type_id) {
        Some("Identifier") => matches!(
            field,
            "name" | "global" | "read" | "write" | "memberWrite" | "bindingScopeId" | "binding"
        ),
        Some("VariableDeclaration") | Some("VariableDeclarator") => field == "kind",
        Some("StaticMemberExpression") => matches!(field, "memberPath" | "write"),
        Some("ComputedMemberExpression") => matches!(field, "memberPath" | "write"),
        Some("PrivateFieldExpression") => field == "write",
        Some("Function") | Some("Class") => field == "nodeKind",
        _ => false,
    }
}

fn direct_predicate_scalar<'a>(
    kind: AstKind<'a>,
    scoping: Option<&Scoping>,
    field: &str,
    member_write: bool,
    member_root_write: bool,
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
                "memberWrite" => Some(PredicateScalar::Boolean(member_root_write)),
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
        AstKind::StaticMemberExpression(_)
        | AstKind::ComputedMemberExpression(_)
        | AstKind::PrivateFieldExpression(_)
            if field == "write" =>
        {
            Some(PredicateScalar::Boolean(member_write))
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

impl<'a> Visit<'a> for RoutedEventCollector<'a> {
    fn enter_scope(&mut self, _: ScopeFlags, _: &Cell<Option<ScopeId>>) {
        if self.scoping.is_none() {
            self.validation_stats.scopes += 1;
        }
    }

    fn visit_ts_enum_member_name(&mut self, name: &TSEnumMemberName<'a>) {
        if self.scoping.is_none() {
            self.validation_stats.symbols += 1;
        }
        walk::walk_ts_enum_member_name(self, name);
    }

    fn enter_node(&mut self, kind: AstKind<'a>) {
        let member_write = self.tracks_member_writes
            && self
                .target_stack
                .last()
                .is_some_and(|(parent, parent_is_target, _)| {
                    mutation_target_child(kind, *parent, *parent_is_target)
                });
        let member_root_write = self.tracks_member_writes
            && self.target_stack.last().is_some_and(
                |(parent, parent_member_write, parent_is_member_root)| {
                    member_write_root_child(
                        kind,
                        *parent,
                        *parent_member_write,
                        *parent_is_member_root,
                    )
                },
            );
        if self.scoping.is_none() {
            match kind {
                AstKind::BindingIdentifier(_) => self.validation_stats.symbols += 1,
                AstKind::IdentifierReference(_) => self.validation_stats.references += 1,
                _ => {}
            }
            kind.set_node_id(NodeId::new(self.node_count as usize));
        }
        self.node_count += 1;
        self.emit(kind, VisitSide::Enter, member_write, member_root_write);
        if self.tracks_member_writes {
            self.target_stack
                .push((kind, member_write, member_root_write));
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let (member_write, member_root_write) = if self.tracks_member_writes {
            let (_, member_write, member_root_write) = self
                .target_stack
                .pop()
                .expect("routed target traversal enter/leave balance");
            (member_write, member_root_write)
        } else {
            (false, false)
        };
        if self.manifest.include_exit
            && self.manifest.routes_by_type[ast_kind_protocol_id(kind) as usize]
                .iter()
                .any(|route| route.side == VisitSide::Exit)
        {
            self.emit(kind, VisitSide::Exit, member_write, member_root_write);
        }
    }

    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}
