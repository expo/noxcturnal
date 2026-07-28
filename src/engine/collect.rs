use std::borrow::Cow;

use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use oxc_allocator::Allocator;
use oxc_ast::{AstKind, ast::Expression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder};
use oxc_span::GetSpan;
use oxc_syntax::node::NodeId;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::event_types::NodeField;
use crate::generated::event_schema::{
    ast_kind_protocol_id, field_key_id, field_key_name, node_type_name,
};
use crate::protocol::constants::FieldMask;
use crate::protocol::manifest::{CompiledManifest, CompiledPredicate, CompiledScalar, VisitSide};
use crate::protocol::routed::{PackedWords, encode_routed_envelope};
use crate::semantic::retained_index::RetainedIndex;
use crate::sourcemap::function_map::FunctionMapCollector;
use crate::syntax::classification::source_type;

use super::fields::{
    fields, packed_fields_direct, packed_scalar, predicate_scalar_type, static_member_path_with,
    utf16_index,
};
use super::retained::routed_buffer_from_index;
use super::{
    MaterializedSessionParts, PredicateScalar, RETAIN_CALLS, RETAIN_CHILDREN, RETAIN_CONSTANTS,
    RETAIN_IDENTIFIERS, RETAIN_INSPECTION, RETAIN_MODULE_FACTS, RoutedCounts,
    decode_route_manifest,
};

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
        let protocol_id = ast_kind_protocol_id(kind);
        self.retained_index.record(
            id.index() as u32,
            protocol_id,
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
                    Some(literal.value.as_str())
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
                && !manifest.structural_parent_types.is_empty()
                && manifest
                    .structural_parent_types
                    .contains(ast_kind_protocol_id(self.nodes.parent_kind(id)))
        });
        // A node without requested fields records nothing: an absent range and an empty
        // range read back identically.
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || retain_structural_fields || !requested.is_empty() {
            let retained_fields = packed_fields_direct(
                kind,
                Some(self.scoping),
                self.utf16,
                if retain_all_fields || retain_structural_fields {
                    FieldMask::all()
                } else {
                    requested
                },
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

pub(crate) fn materialize_with_scope_parents(
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
    let uid_prefix = Some(shortest_uid_prefix(semantic_return.semantic.scoping()));
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
        uid_prefix,
    })
}

/// Find the shortest `_`/`$` prefix absent from every bound or unresolved name.
///
/// The complete binary prefix tree through depth 12 is an 8191-bit stack bitset.
/// Marking it is allocation-free and one pass over semantic names; almost every
/// file resolves at depth one or two. The fallback remains exact for a
/// deliberately adversarial file that occupies all 4096 depth-12 prefixes.
fn shortest_uid_prefix(scoping: &Scoping) -> String {
    const DEPTH: usize = 12;
    let mut occupied = [0u64; 128];
    // Single-character `_` and `$` namespaces are common conventions and are
    // disproportionately likely to be introduced by a later transform.
    occupied[0] = (1 << 1) | (1 << 2);
    for name in scoping.symbol_names().chain(
        scoping
            .root_unresolved_references()
            .keys()
            .map(|name| name.as_str()),
    ) {
        let mut node = 0usize;
        for byte in name.bytes().take(DEPTH) {
            node = match byte {
                b'_' => node * 2 + 1,
                b'$' => node * 2 + 2,
                _ => break,
            };
            occupied[node / 64] |= 1 << (node % 64);
        }
    }
    let node = (1..((1usize << (DEPTH + 1)) - 1))
        .find(|node| occupied[node / 64] & (1 << (node % 64)) == 0);
    if let Some(mut node) = node {
        let depth = usize::BITS as usize - (node + 1).leading_zeros() as usize - 1;
        let mut bytes = [0u8; DEPTH];
        for index in (0..depth).rev() {
            bytes[index] = if node % 2 == 1 { b'_' } else { b'$' };
            node = (node - 1) / 2;
        }
        return String::from_utf8(bytes[..depth].to_vec()).expect("ASCII UID prefix");
    }
    let mut candidate = "_".repeat(DEPTH + 1);
    loop {
        let occupied = scoping.symbol_names().chain(
            scoping
                .root_unresolved_references()
                .keys()
                .map(|name| name.as_str()),
        );
        if !occupied
            .into_iter()
            .any(|name| name.starts_with(&candidate))
        {
            return candidate;
        }
        candidate.push('_');
    }
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
        let fallback_predicates =
            self.manifest.fallback_predicate_mask_by_type[protocol_id as usize];
        let mut predicate_fields = if fallback_predicates.is_empty() {
            Vec::new()
        } else {
            fields(kind, self.scoping, fallback_predicates)
        };
        normalize_routed_fields(&mut predicate_fields, self.utf16);
        let mut matched_route_ids = std::mem::take(&mut self.route_scratch);
        matched_route_ids.clear();
        // Several matched routes may carry different payload contracts; the union of
        // their selections is a bitwise or, so coalescing costs nothing.
        let mut payload_mask = FieldMask::none();
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
                payload_mask = payload_mask.union(route.payload_mask);
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
            self.scoping,
            self.utf16,
            payload_mask,
            &mut self.string_ids,
        );
        let mut fallback_payload = if direct_payload.is_none() && !payload_mask.is_empty() {
            fields(kind, self.scoping, payload_mask)
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

pub(crate) fn has_direct_predicate_scalar(node_type_id: u32, field: &str) -> bool {
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
            static_member_path_with(&member.object, Some(&member.property.name))
                .map(|path| PredicateScalar::String(Cow::Owned(path)))
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
