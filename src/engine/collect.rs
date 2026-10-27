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
use super::member::{MemberPathInterner, MemberWriteStack, tracks_member_writes};
use super::retained::routed_buffer_from_index;
use super::{
    MaterializedSessionParts, RETAIN_CALLS, RETAIN_CHILDREN, RETAIN_CONSTANTS, RETAIN_IDENTIFIERS,
    RETAIN_INSPECTION, RETAIN_MODULE_FACTS,
};

struct EventCollector<'a> {
    source: &'a str,
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    utf16: Option<&'a [u32]>,
    retained_index: RetainedIndex,
    member_writes: MemberWriteStack<'a>,
    retention_routes: Option<&'a CompiledManifest>,
    retention_capabilities: u32,
    retain_scopes: bool,
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
    member_writes: MemberWriteStack<'a>,
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
        let (member_write, member_root_write) = self.member_writes.enter(kind);
        let id = self.node_count;
        self.node_count += 1;
        kind.set_node_id(NodeId::new(id as usize));
        let protocol_id = ast_kind_protocol_id(kind);
        let parent_id = self.parent_stack.last().map(|(id, _, _)| *id);
        let span = kind.span();
        self.retained_index.collect_enter(id);
        self.retained_index.collect_node(
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
            self.retained_index.record_child_edge(id, parent_id, || {
                self.parent_stack
                    .last()
                    .and_then(|(_, _, parent)| child_role_id_for_edge(*parent, kind))
            });
        }
        if self.retention_capabilities & RETAIN_CONSTANTS != 0 {
            self.retained_index.record_constant(kind, id);
        }
        let retain_all_fields = self.retention_capabilities & RETAIN_MODULE_FACTS != 0;
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || !requested.is_empty() {
            let declaration_kind =
                self.parent_stack
                    .last()
                    .and_then(|(_, _, parent)| match parent {
                        AstKind::VariableDeclaration(declaration) => Some(declaration.kind),
                        _ => None,
                    });
            let retained_fields = packed_fields_direct(
                kind,
                declaration_kind,
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
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let (id, _, _) = self
            .parent_stack
            .pop()
            .expect("syntax traversal enter/leave balance");
        self.member_writes.leave();
        if self.retains_traversal_kind(kind) {
            self.retained_index.collect_exit(id);
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
        self.retained_index.collect_node(
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
            self.retained_index.record_child_edge(
                id.index() as u32,
                (!is_root).then(|| self.nodes.parent_id(id).index() as u32),
                || child_role_id_for_edge(self.nodes.parent_kind(id), kind),
            );
        }
        if self.retain_scopes && self.retention_capabilities & RETAIN_IDENTIFIERS != 0 {
            self.retained_index.record_rename_roles(kind, self.nodes);
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
                    Some(crate::semantic::value_transport::literal_string(literal))
                }
                _ => None,
            };
            self.retained_index.record_call(
                id.index() as u32,
                identifier.name.as_str(),
                callee_global,
                static_argument.as_deref(),
            );
        }
        let retain_all_fields = self.retention_capabilities & RETAIN_MODULE_FACTS != 0;
        // A node without requested fields records nothing: an absent range and an empty
        // range read back identically.
        let requested = self.retention_routes.map_or(FieldMask::none(), |manifest| {
            manifest.merged_field_mask_by_type[protocol_id as usize]
        });
        if retain_all_fields || !requested.is_empty() {
            let declaration_kind =
                (!is_root)
                    .then(|| self.nodes.parent_kind(id))
                    .and_then(|parent| match parent {
                        AstKind::VariableDeclaration(declaration) => Some(declaration.kind),
                        _ => None,
                    });
            let retained_fields = packed_fields_direct(
                kind,
                declaration_kind,
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
        let (member_write, member_root_write) = self.member_writes.enter(kind);
        self.retained_index
            .collect_enter(kind.node_id().index() as u32);
        self.record_summary(kind, member_write, member_root_write);
    }
    fn leave_node(&mut self, kind: AstKind<'a>) {
        self.member_writes.leave();
        if self.retains_traversal_kind(kind) {
            self.retained_index
                .collect_exit(kind.node_id().index() as u32);
        }
    }
    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

pub(crate) fn materialize_with_scope_parents(
    source: &str,
    filename: &str,
    retention_manifest: Option<&CompiledManifest>,
    initial_route_manifest: Option<&CompiledManifest>,
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
    materialize_program(
        source,
        &allocator,
        &parsed.program,
        retention_manifest,
        initial_route_manifest,
        build_initial_route,
        None,
    )
}

pub(crate) fn materialize_program<'a>(
    source: &'a str,
    allocator: &'a Allocator,
    program: &oxc_ast::ast::Program<'a>,
    retention_manifest: Option<&CompiledManifest>,
    initial_route_manifest: Option<&CompiledManifest>,
    build_initial_route: bool,
    semantic_stats: Option<Stats>,
) -> Result<MaterializedSessionParts> {
    let utf16 = (!source.is_ascii()).then(|| utf16_index(source, allocator));
    let program_body_offsets =
        program_body_offsets(program, source, utf16.as_deref().map(|offsets| &**offsets));
    let compiled_manifest = initial_route_manifest;
    let retention_capabilities = retention_manifest
        .or(compiled_manifest)
        .map_or(u32::MAX, |manifest| manifest.retention_capabilities);
    let child_role_masks = retention_manifest
        .or(compiled_manifest)
        .map(|manifest| manifest.child_role_mask_by_parent_type.as_slice());
    // Matching may need selected edges when an index is already being built.
    // This internal retention does not grant JavaScript child access.
    let retention_capabilities = retention_capabilities
        | if child_role_masks.is_some_and(|masks| masks.iter().any(|mask| mask.requests_children()))
        {
            RETAIN_CHILDREN
        } else {
            0
        };
    let needs_semantics = retention_manifest.is_some_and(|manifest| manifest.needs_semantics)
        || compiled_manifest.is_some_and(|manifest| manifest.needs_semantics)
        || (retention_manifest.is_some() || compiled_manifest.is_some())
            && retention_capabilities & (RETAIN_IDENTIFIERS | RETAIN_CALLS) != 0;
    let needs_comments = retention_manifest.is_some_and(|manifest| manifest.needs_comments)
        || compiled_manifest.is_some_and(|manifest| manifest.needs_comments);
    let retain_scopes = retention_manifest.is_some_and(|manifest| manifest.include_scope)
        || compiled_manifest.is_some_and(|manifest| manifest.include_scope);
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
            retention_routes: retention_manifest,
            retention_capabilities,
            retained_string_ids: FxHashMap::default(),
            member_paths: MemberPathInterner::default(),
            parent_stack: Vec::new(),
            member_writes: MemberWriteStack::new(tracks_member_writes(
                retention_manifest,
                retention_capabilities,
            )),
            node_count: 0,
            validation_stats: Stats::default(),
        };
        collector.visit_program(program);
        collector.validation_stats.nodes = collector.node_count;
        crate::syntax::validation::validate_program_with_stats(
            program,
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
                &program.comments,
                utf16.as_deref().map(|offsets| &**offsets),
            );
        }
        let initial_routed_buffer = if build_initial_route {
            compiled_manifest
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
    let mut semantic_builder = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_check_syntax_error(true);
    if let Some(stats) = semantic_stats {
        semantic_builder = semantic_builder.with_stats(stats);
    }
    let semantic_return = semantic_builder.build(program);
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
        retention_routes: retention_manifest,
        retention_capabilities,
        retain_scopes,
        retained_string_ids: FxHashMap::default(),
        member_paths: MemberPathInterner::default(),
        member_writes: MemberWriteStack::new(tracks_member_writes(
            retention_manifest,
            retention_capabilities,
        )),
    };
    if retention_capabilities & RETAIN_IDENTIFIERS != 0 {
        collector
            .retained_index
            .reserve_reference_count(collector.scoping.references_len());
    }
    collector.visit_program(program);
    if retain_scopes && retention_capabilities & RETAIN_IDENTIFIERS != 0 {
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
            &program.comments,
            utf16.as_deref().map(|offsets| &**offsets),
        );
    }
    let initial_routed_buffer = if build_initial_route {
        compiled_manifest
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

pub(crate) fn parse_program_body_offsets(source: &str, filename: &str) -> Result<[u32; 5]> {
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
) -> [u32; 5] {
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
    let unterminated =
        |end: u32| source.as_bytes().get(end.saturating_sub(1) as usize) != Some(&b';');
    let prepend_separator = program
        .directives
        .last()
        .is_some_and(|directive| unterminated(directive.span.end));
    let append_separator = program.body.last().map_or(prepend_separator, |statement| {
        unterminated(statement.span().end)
    });
    [
        coordinate(prepend),
        coordinate(append),
        u32::from(needs_eof_line_boundary),
        u32::from(prepend_separator),
        u32::from(append_separator),
    ]
}

#[cfg(test)]
mod uid_tests {
    use super::super::decode_route_manifest;
    use super::*;
    use crate::protocol::constants::ROUTE_MANIFEST_MAGIC;
    use crate::syntax::source_text::identifier_names;

    #[test]
    fn retained_uid_inventory_matches_standalone_ast_walk() {
        let manifest = [
            ROUTE_MANIFEST_MAGIC,
            (RETAIN_IDENTIFIERS | RETAIN_CALLS) << 2,
            0,
            0,
            32,
            0,
            0,
            0,
        ]
        .into_iter()
        .flat_map(u32::to_le_bytes)
        .collect::<Vec<_>>();
        let manifest = decode_route_manifest(&manifest).unwrap();
        for (filename, source) in [
            ("empty.js", ""),
            (
                "names.js",
                r#"var _temp; var _temp;
                   function _fn(_arg) { const _temp = _arg; return _temp + _unknown; }
                   const _obj = { _property: 1, _esc\u0061ped: 2 };
                   _label: while (false) { _obj._member; break _label; }
                   import { _imported as _local } from 'module';
                   export { _local as _exported };
                   _call('_notAnIdentifier');"#,
            ),
            (
                "names.jsx",
                "const _view = <_Component _attribute={_unknown}><_Namespace._Member /></_Component>;",
            ),
            (
                "names.ts",
                "interface _Merged { _property: _Unknown }
                 namespace _Merged { export const _value = 1; }
                 enum _Enum { _Member = 1 }
                 type _Alias<_Type> = _Type & { _key: typeof _Merged._value };
                 import _Import = _Merged._value;",
            ),
            (
                "names.tsx",
                "const _view = <_Component<_Type> _prop={_unknown} />;",
            ),
        ] {
            let allocator = Allocator::default();
            let parsed =
                Parser::new(&allocator, source, source_type(filename, source).unwrap()).parse();
            assert!(parsed.diagnostics.is_empty(), "{filename}");
            let expected = identifier_names(&parsed.program);
            let parts = materialize_program(
                source,
                &allocator,
                &parsed.program,
                Some(&manifest),
                None,
                false,
                None,
            )
            .unwrap();
            assert!(parts.retained_index.has_uid_identifiers());
            let inventory = parts.retained_index.uid_identifier_names();
            assert_eq!(inventory, expected, "{filename}");
            assert!(!inventory.contains("_notAnIdentifier"));
        }
    }
}
