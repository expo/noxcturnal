use napi::{Error, Result, Status};
use oxc_allocator::Allocator;
use oxc_ast::{AstKind, ast::Expression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder};
use oxc_span::GetSpan;
use oxc_syntax::node::NodeId;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::event_schema::ast_kind_protocol_id;
use crate::protocol::constants::FieldMask;
use crate::protocol::manifest::CompiledManifest;
use crate::semantic::retained_index::RetainedIndex;
use crate::sourcemap::function_map::FunctionMapCollector;
use crate::syntax::classification::source_type;

use super::fields::{packed_fields_direct, utf16_index};
use super::member::{mutation_target_child, tracks_member_writes};
use super::retained::routed_buffer_from_index;
use super::{
    MaterializedSessionParts, RETAIN_CALLS, RETAIN_CHILDREN, RETAIN_CONSTANTS, RETAIN_IDENTIFIERS,
    RETAIN_INSPECTION, RETAIN_MODULE_FACTS, decode_route_manifest,
};

struct EventCollector<'a> {
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    function_map: Option<FunctionMapCollector<'a>>,
    target_stack: Vec<(AstKind<'a>, bool)>,
    tracks_member_writes: bool,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retained_string_ids: FxHashMap<String, u32>,
}

struct SyntaxIndexCollector<'a> {
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retained_string_ids: FxHashMap<String, u32>,
    parent_stack: Vec<(u32, u32)>,
    target_stack: Vec<(AstKind<'a>, bool)>,
    tracks_member_writes: bool,
    node_count: u32,
    uid_names: FxHashSet<String>,
    function_map: Option<FunctionMapCollector<'a>>,
}

impl SyntaxIndexCollector<'_> {
    fn retains_traversal_kind(&self, kind: AstKind<'_>) -> bool {
        self.retention_capabilities & RETAIN_INSPECTION != 0
            || self.retention_routes.is_some_and(|manifest| {
                !manifest.routes_by_type[ast_kind_protocol_id(kind) as usize].is_empty()
            })
    }

    fn record_uid_name(&mut self, kind: AstKind<'_>) {
        let name = match kind {
            AstKind::BindingIdentifier(identifier) => Some(identifier.name.as_str()),
            AstKind::IdentifierReference(identifier) => Some(identifier.name.as_str()),
            AstKind::IdentifierName(identifier) => Some(identifier.name.as_str()),
            AstKind::LabelIdentifier(identifier) => Some(identifier.name.as_str()),
            AstKind::PrivateIdentifier(identifier) => Some(identifier.name.as_str()),
            _ => None,
        };
        if let Some(name) = name {
            self.uid_names.insert(name.to_owned());
        }
    }
}

impl<'a> Visit<'a> for SyntaxIndexCollector<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let member_write = self.tracks_member_writes
            && self
                .target_stack
                .last()
                .is_some_and(|(parent, parent_is_target)| {
                    mutation_target_child(kind, *parent, *parent_is_target)
                });
        let id = self.node_count;
        self.node_count += 1;
        kind.set_node_id(NodeId::new(id as usize));
        let protocol_id = ast_kind_protocol_id(kind);
        let parent_id = self.parent_stack.last().map(|(id, _)| *id);
        let span = kind.span();
        self.retained_index.record_enter(id);
        self.retained_index.record(
            id,
            protocol_id,
            self.utf16
                .map_or(span.start, |index| index[span.start as usize]),
            self.utf16
                .map_or(span.end, |index| index[span.end as usize]),
            parent_id,
            0,
        );
        if self.retention_capabilities & RETAIN_CONSTANTS != 0 {
            self.retained_index.record_constant(kind, id);
        }
        self.record_uid_name(kind);
        if let Some(function_map) = &mut self.function_map {
            function_map.enter(kind);
        }
        let retain_all_fields = self.retention_capabilities & RETAIN_MODULE_FACTS != 0;
        let retain_structural_fields = self.parent_stack.last().is_some_and(|(_, parent_type)| {
            self.retention_routes.is_some_and(|manifest| {
                !manifest.structural_parent_types.is_empty()
                    && manifest.structural_parent_types.contains(*parent_type)
            })
        });
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || retain_structural_fields || !requested.is_empty() {
            let retained_fields = packed_fields_direct(
                kind,
                member_write,
                None,
                self.utf16,
                if retain_all_fields || retain_structural_fields {
                    FieldMask::all()
                } else {
                    requested
                },
                &mut self.retained_string_ids,
            );
            if let Some(retained_fields) = retained_fields {
                self.retained_index
                    .record_packed_fields(id, &retained_fields.words[..retained_fields.len]);
            }
        }
        self.parent_stack.push((id, protocol_id));
        if self.tracks_member_writes {
            self.target_stack.push((kind, member_write));
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let (id, _) = self
            .parent_stack
            .pop()
            .expect("syntax traversal enter/leave balance");
        if self.tracks_member_writes {
            self.target_stack
                .pop()
                .expect("syntax target traversal enter/leave balance");
        }
        if self.retains_traversal_kind(kind) {
            self.retained_index.record_exit(id);
        }
        if let Some(function_map) = &mut self.function_map {
            function_map.leave(kind);
        }
    }

    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

impl<'a> EventCollector<'a> {
    fn retains_traversal_kind(&self, kind: AstKind<'a>) -> bool {
        self.retention_capabilities & RETAIN_INSPECTION != 0
            || self.retention_routes.is_some_and(|manifest| {
                !manifest.routes_by_type[ast_kind_protocol_id(kind) as usize].is_empty()
            })
    }

    fn record_summary(&mut self, kind: AstKind<'a>, member_write: bool) {
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
                member_write,
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
        let member_write = self.tracks_member_writes
            && self
                .target_stack
                .last()
                .is_some_and(|(parent, parent_is_target)| {
                    mutation_target_child(kind, *parent, *parent_is_target)
                });
        self.retained_index
            .record_enter(kind.node_id().index() as u32);
        if let Some(function_map) = &mut self.function_map {
            function_map.enter(kind);
        }
        self.record_summary(kind, member_write);
        if self.tracks_member_writes {
            self.target_stack.push((kind, member_write));
        }
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        if self.tracks_member_writes {
            self.target_stack
                .pop()
                .expect("semantic target traversal enter/leave balance");
        }
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
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    let program_body_offsets = program_body_offsets(
        &parsed.program,
        source,
        utf16.as_deref().map(|offsets| &**offsets),
    );
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
    let needs_semantics = retention_manifest
        .as_ref()
        .is_some_and(|manifest| manifest.needs_semantics)
        || compiled_manifest
            .as_ref()
            .is_some_and(|manifest| manifest.needs_semantics)
        || (retention_manifest.is_some() || compiled_manifest.is_some())
            && retention_capabilities & (RETAIN_IDENTIFIERS | RETAIN_CALLS) != 0;
    if !needs_semantics {
        let mut collector = SyntaxIndexCollector {
            utf16: utf16.as_deref().map(|offsets| &**offsets),
            retained_index: RetainedIndex::with_node_count(
                0,
                (retention_capabilities & RETAIN_CHILDREN != 0)
                    .then_some(())
                    .and(structural_parent_types),
                retention_capabilities & RETAIN_CONSTANTS != 0,
                retention_capabilities & (RETAIN_INSPECTION | RETAIN_MODULE_FACTS) != 0
                    || retention_manifest.is_some(),
            ),
            retention_routes: retention_manifest.as_ref(),
            retention_capabilities,
            retained_string_ids: FxHashMap::default(),
            parent_stack: Vec::new(),
            target_stack: Vec::new(),
            tracks_member_writes: tracks_member_writes(retention_manifest.as_ref()),
            node_count: 0,
            uid_names: FxHashSet::default(),
            function_map: collect_function_map.then(|| FunctionMapCollector::new(source, filename)),
        };
        collector.visit_program(&parsed.program);
        collector
            .retained_index
            .set_scalar_strings(std::mem::take(&mut collector.retained_string_ids));
        let initial_routed_buffer = if build_initial_route {
            compiled_manifest
                .as_ref()
                .map(|manifest| {
                    routed_buffer_from_index(manifest, &collector.retained_index, &[], None)
                        .map(|buffer| buffer.to_vec())
                })
                .transpose()?
        } else {
            None
        };
        let function_map = collector
            .function_map
            .take()
            .map(FunctionMapCollector::finish);
        return Ok(MaterializedSessionParts {
            program_body_offsets,
            scope_parents: Vec::new(),
            retained_index: collector.retained_index,
            function_map,
            initial_routed_buffer,
            uid_prefix: Some(shortest_uid_prefix_from_names(&collector.uid_names)),
        });
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
        function_map: collect_function_map.then(|| FunctionMapCollector::new(source, filename)),
        retention_routes: retention_manifest.as_ref(),
        retention_capabilities,
        retained_string_ids: FxHashMap::default(),
        target_stack: Vec::new(),
        tracks_member_writes: tracks_member_writes(retention_manifest.as_ref()),
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
        program_body_offsets,
        scope_parents,
        retained_index: collector.retained_index,
        function_map,
        initial_routed_buffer,
        uid_prefix,
    })
}

pub(crate) fn parse_program_body_offsets(source: &str, filename: &str) -> Result<[u32; 3]> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Oxc parse failed: {:?}", parsed.diagnostics),
        ));
    }
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, &allocator));
    Ok(program_body_offsets(
        &parsed.program,
        source,
        utf16.as_deref().map(|offsets| &**offsets),
    ))
}

fn program_body_offsets(
    program: &oxc_ast::ast::Program<'_>,
    source: &str,
    utf16: Option<&[u32]>,
) -> [u32; 3] {
    let coordinate = |byte: u32| utf16.map_or(byte, |index| index[byte as usize]);
    let prepend = program
        .body
        .first()
        .map_or(source.len() as u32, |statement| statement.span().start);
    let append = program
        .body
        .last()
        .map(|statement| statement.span().end)
        .or_else(|| {
            program
                .directives
                .last()
                .map(|directive| directive.span.end)
        })
        .unwrap_or(source.len() as u32);
    let needs_eof_line_boundary = program.comments.last().is_some_and(|comment| {
        append < source.len() as u32
            && comment.kind == oxc_ast::ast::CommentKind::Line
            && comment.span.end == source.len() as u32
    });
    [
        coordinate(prepend),
        coordinate(append),
        u32::from(needs_eof_line_boundary),
    ]
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
    let mut longest_underscore_prefix = DEPTH;
    // Single-character `_` and `$` namespaces are common conventions and are
    // disproportionately likely to be introduced by a later transform.
    occupied[0] = (1 << 1) | (1 << 2);
    for name in scoping.symbol_names().chain(
        scoping
            .root_unresolved_references()
            .keys()
            .map(|name| name.as_str()),
    ) {
        longest_underscore_prefix =
            longest_underscore_prefix.max(name.bytes().take_while(|byte| *byte == b'_').count());
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
    "_".repeat(longest_underscore_prefix + 1)
}

/// Syntax-only sessions conservatively reserve against every identifier-like
/// spelling, including property and label names. Over-reserving is safe and
/// avoids constructing lexical symbols merely to allocate a collision-free UID.
fn shortest_uid_prefix_from_names(names: &FxHashSet<String>) -> String {
    const DEPTH: usize = 12;
    let mut occupied = [0u64; 128];
    let mut longest_underscore_prefix = DEPTH;
    occupied[0] = (1 << 1) | (1 << 2);
    for name in names {
        longest_underscore_prefix =
            longest_underscore_prefix.max(name.bytes().take_while(|byte| *byte == b'_').count());
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
    "_".repeat(longest_underscore_prefix + 1)
}
