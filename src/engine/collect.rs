use std::cell::Cell;

use napi::Result;
use oxc_allocator::Allocator;
use oxc_ast::{
    AstKind,
    ast::{Comment, Expression, TSEnumMemberName},
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{AstNodes, Scoping, SemanticBuilder, Stats};
use oxc_span::GetSpan;
use oxc_syntax::node::NodeId;
use oxc_syntax::scope::{ScopeFlags, ScopeId};
use rustc_hash::FxHashMap;

use crate::generated::event_schema::{ast_kind_protocol_id, child_role_id_for_edge};
use crate::protocol::constants::FieldMask;
use crate::protocol::manifest::CompiledManifest;
use crate::semantic::retained_index::{RetainedComment, RetainedIndex};
use crate::syntax::classification::source_type;

use super::fields::{packed_fields_direct, utf16_index};
use super::member::MemberPathInterner;
use super::member::{member_write_root_child, mutation_target_child, tracks_member_writes};
use super::retained::routed_buffer_from_index;
use super::{
    MaterializedSessionParts, RETAIN_CALLS, RETAIN_CHILDREN, RETAIN_CONSTANTS, RETAIN_IDENTIFIERS,
    RETAIN_INSPECTION, RETAIN_MODULE_FACTS, decode_route_manifest,
};

struct EventCollector<'a> {
    source: &'a str,
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    target_stack: Vec<(AstKind<'a>, bool, bool)>,
    tracks_member_writes: bool,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retained_string_ids: FxHashMap<String, u32>,
    member_paths: MemberPathInterner,
}

struct SyntaxIndexCollector<'a> {
    source: &'a str,
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retained_string_ids: FxHashMap<String, u32>,
    member_paths: MemberPathInterner,
    parent_stack: Vec<(u32, u32, AstKind<'a>)>,
    target_stack: Vec<(AstKind<'a>, bool, bool)>,
    tracks_member_writes: bool,
    node_count: u32,
    validation_stats: Stats,
}

impl SyntaxIndexCollector<'_> {
    fn retains_traversal_kind(&self, kind: AstKind<'_>) -> bool {
        self.retention_capabilities & RETAIN_INSPECTION != 0
            || self.retention_routes.is_some_and(|manifest| {
                !manifest.routes_by_type[ast_kind_protocol_id(kind) as usize].is_empty()
            })
    }
}

impl<'a> Visit<'a> for SyntaxIndexCollector<'a> {
    fn enter_scope(&mut self, _: ScopeFlags, _: &Cell<Option<ScopeId>>) {
        self.validation_stats.scopes += 1;
    }

    fn visit_ts_enum_member_name(&mut self, name: &TSEnumMemberName<'a>) {
        self.validation_stats.symbols += 1;
        walk::walk_ts_enum_member_name(self, name);
    }

    fn enter_node(&mut self, kind: AstKind<'a>) {
        match kind {
            AstKind::BindingIdentifier(_) => self.validation_stats.symbols += 1,
            AstKind::IdentifierReference(_) => self.validation_stats.references += 1,
            _ => {}
        }
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
        let id = self.node_count;
        self.node_count += 1;
        kind.set_node_id(NodeId::new(id as usize));
        let protocol_id = ast_kind_protocol_id(kind);
        let parent_id = self.parent_stack.last().map(|(id, _, _)| *id);
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
        if self.retention_capabilities & RETAIN_CHILDREN != 0 {
            let child_role_id = self
                .parent_stack
                .last()
                .and_then(|(_, _, parent)| child_role_id_for_edge(*parent, kind));
            self.retained_index
                .record_child_edge(id, parent_id, child_role_id);
        }
        if self.retention_capabilities & RETAIN_CONSTANTS != 0 {
            self.retained_index.record_constant(kind, id);
        }
        let retain_all_fields = self.retention_capabilities & RETAIN_MODULE_FACTS != 0;
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || !requested.is_empty() {
            let retained_fields = packed_fields_direct(
                kind,
                self.source,
                member_write,
                member_root_write,
                None,
                self.utf16,
                if retain_all_fields {
                    FieldMask::all()
                } else {
                    requested
                },
                &mut self.retained_string_ids,
                &mut self.member_paths,
            );
            if let Some(retained_fields) = retained_fields {
                self.retained_index
                    .record_packed_fields(id, &retained_fields.words[..retained_fields.len]);
            }
        }
        self.parent_stack.push((id, protocol_id, kind));
        if self.tracks_member_writes {
            self.target_stack
                .push((kind, member_write, member_root_write));
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let (id, _, _) = self
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

    fn record_summary(&mut self, kind: AstKind<'a>, member_write: bool, member_root_write: bool) {
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
        if self.retention_capabilities & RETAIN_CHILDREN != 0 {
            let parent_kind = (!is_root).then(|| self.nodes.parent_kind(id));
            self.retained_index.record_child_edge(
                id.index() as u32,
                (!is_root).then(|| self.nodes.parent_id(id).index() as u32),
                parent_kind.and_then(|parent| child_role_id_for_edge(parent, kind)),
            );
        }
        if self.retention_capabilities & RETAIN_IDENTIFIERS != 0 {
            self.retained_index
                .record_rename_roles(kind, self.nodes, scope_id.index() as u32);
        }
        self.retained_index.record_semantics(
            kind,
            self.scoping,
            id.index() as u32,
            scope_id.index() as u32,
            self.retention_capabilities & RETAIN_IDENTIFIERS != 0,
            member_root_write,
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
        // A node without requested fields records nothing: an absent range and an empty
        // range read back identically.
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || !requested.is_empty() {
            let retained_fields = packed_fields_direct(
                kind,
                self.source,
                member_write,
                member_root_write,
                Some(self.scoping),
                self.utf16,
                if retain_all_fields {
                    FieldMask::all()
                } else {
                    requested
                },
                &mut self.retained_string_ids,
                &mut self.member_paths,
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
        self.retained_index
            .record_enter(kind.node_id().index() as u32);
        self.record_summary(kind, member_write, member_root_write);
        if self.tracks_member_writes {
            self.target_stack
                .push((kind, member_write, member_root_write));
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
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

pub(crate) fn materialize_with_scope_parents(
    source: &str,
    filename: &str,
    retention_manifest: Option<&[u8]>,
    initial_route_manifest: Option<&[u8]>,
    build_initial_route: bool,
) -> Result<MaterializedSessionParts> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "indexed-session",
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
    let child_role_masks = retention_manifest
        .as_ref()
        .or(compiled_manifest.as_ref())
        .map(|manifest| manifest.child_role_mask_by_parent_type.as_slice());
    let needs_semantics = retention_manifest
        .as_ref()
        .is_some_and(|manifest| manifest.needs_semantics)
        || compiled_manifest
            .as_ref()
            .is_some_and(|manifest| manifest.needs_semantics)
        || (retention_manifest.is_some() || compiled_manifest.is_some())
            && retention_capabilities & (RETAIN_IDENTIFIERS | RETAIN_CALLS) != 0;
    let needs_comments = retention_manifest
        .as_ref()
        .is_some_and(|manifest| manifest.needs_comments)
        || compiled_manifest
            .as_ref()
            .is_some_and(|manifest| manifest.needs_comments);
    if !needs_semantics {
        let mut collector = SyntaxIndexCollector {
            source,
            utf16: utf16.as_deref().map(|offsets| &**offsets),
            retained_index: RetainedIndex::with_node_count(
                0,
                (retention_capabilities & RETAIN_CHILDREN != 0)
                    .then_some(())
                    .and(child_role_masks),
                retention_capabilities & RETAIN_CONSTANTS != 0,
                retention_capabilities & (RETAIN_INSPECTION | RETAIN_MODULE_FACTS) != 0
                    || retention_manifest.is_some(),
            ),
            retention_routes: retention_manifest.as_ref(),
            retention_capabilities,
            retained_string_ids: FxHashMap::default(),
            member_paths: MemberPathInterner::default(),
            parent_stack: Vec::new(),
            target_stack: Vec::new(),
            tracks_member_writes: tracks_member_writes(
                retention_manifest.as_ref(),
                retention_capabilities,
            ),
            node_count: 0,
            validation_stats: Stats::default(),
        };
        collector.visit_program(&parsed.program);
        collector.validation_stats.nodes = collector.node_count;
        crate::syntax::validation::validate_program_with_stats(
            &parsed.program,
            "indexed-session",
            collector.validation_stats,
        )?;
        collector.retained_index.finalize_child_edges();
        collector
            .retained_index
            .set_scalar_strings(std::mem::take(&mut collector.retained_string_ids));
        if needs_comments {
            retain_comments(
                &mut collector.retained_index,
                source,
                &parsed.program.comments,
                utf16.as_deref().map(|offsets| &**offsets),
            );
        }
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
        return Ok(MaterializedSessionParts {
            program_body_offsets,
            scope_parents: Vec::new(),
            retained_index: collector.retained_index,
            initial_routed_buffer,
        });
    }
    let semantic_return = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_check_syntax_error(true)
        .build(&parsed.program);
    if !semantic_return.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &semantic_return.diagnostics,
            "indexed-session",
        ));
    }
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
        source,
        nodes: semantic_return.semantic.nodes(),
        scoping: semantic_return.semantic.scoping(),
        utf16: utf16.as_deref().map(|offsets| &**offsets),
        retained_index: RetainedIndex::with_node_count(
            semantic_return.semantic.nodes().len(),
            (retention_capabilities & RETAIN_CHILDREN != 0)
                .then_some(())
                .and(child_role_masks),
            retention_capabilities & RETAIN_CONSTANTS != 0,
            retention_capabilities & (RETAIN_INSPECTION | RETAIN_MODULE_FACTS) != 0
                || retention_manifest.is_some(),
        ),
        retention_routes: retention_manifest.as_ref(),
        retention_capabilities,
        retained_string_ids: FxHashMap::default(),
        member_paths: MemberPathInterner::default(),
        target_stack: Vec::new(),
        tracks_member_writes: tracks_member_writes(
            retention_manifest.as_ref(),
            retention_capabilities,
        ),
    };
    collector.visit_program(&parsed.program);
    if retention_capabilities & RETAIN_IDENTIFIERS != 0 {
        collector
            .retained_index
            .record_scopes(collector.scoping, collector.nodes, collector.utf16);
    }
    collector.retained_index.finalize_child_edges();
    collector
        .retained_index
        .set_scalar_strings(std::mem::take(&mut collector.retained_string_ids));
    if needs_comments {
        retain_comments(
            &mut collector.retained_index,
            source,
            &parsed.program.comments,
            utf16.as_deref().map(|offsets| &**offsets),
        );
    }
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
        initial_routed_buffer,
    })
}

fn retain_comments(
    index: &mut RetainedIndex,
    source: &str,
    comments: &[Comment],
    utf16: Option<&[u32]>,
) {
    index.set_comments(
        comments
            .iter()
            .map(|comment| {
                let content = comment.content_span();
                RetainedComment {
                    block: comment.is_block(),
                    value: source[content.start as usize..content.end as usize].to_owned(),
                    start: utf16.map_or(comment.span.start, |offsets| {
                        offsets[comment.span.start as usize]
                    }),
                    end: utf16.map_or(comment.span.end, |offsets| {
                        offsets[comment.span.end as usize]
                    }),
                }
            })
            .collect(),
    );
}

pub(crate) fn parse_program_body_offsets(source: &str, filename: &str) -> Result<[u32; 3]> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, source_type(filename, source)?).parse();
    if !parsed.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "indexed-session",
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
