use std::{borrow::Cow, cell::Cell};

use napi::{
    Result,
    bindgen_prelude::{Buffer, Either},
};
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
use crate::generated::event_schema::{ast_kind_protocol_id, field_key_name, node_type_name};
use crate::protocol::constants::FieldMask;
use crate::protocol::manifest::{
    CompiledManifest, CompiledPredicate, CompiledScalar, CompiledSelector, VisitSide,
};
use crate::protocol::routed::{
    PackedWords, encode_routed_envelope, routed_shape_flags, routed_type_tag,
};
use crate::syntax::classification::source_type;

use super::fields::{
    compiled_scalar_matches, fields, packed_fields_direct, predicate_scalar_type, utf16_index,
};

#[cfg(test)]
use super::decode_route_manifest;
use super::manifest::ResolvedManifest;
use super::member::{MemberPathInterner, MemberWriteStack, tracks_member_writes};
use super::{NativeCompiledManifest, RoutedCounts};

enum PredicateScalar<'a> {
    String(Cow<'a, str>),
    Number(f64),
    Boolean(bool),
}
pub fn materialize_routed_buffer(
    source: &str,
    filename: &str,
    manifest_data: Either<Buffer, &NativeCompiledManifest>,
    root_start: Option<u32>,
    root_end: Option<u32>,
) -> Result<Buffer> {
    let manifest = ResolvedManifest::new(manifest_data)?;
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
        manifest.compiled(),
        root_start.zip(root_end),
        None,
    )
}

pub(super) fn materialize_routed_program<'a>(
    source: &'a str,
    allocator: &'a Allocator,
    program: &oxc_ast::ast::Program<'a>,
    manifest: &CompiledManifest,
    root: Option<(u32, u32)>,
    semantic_stats: Option<Stats>,
) -> Result<Buffer> {
    let semantic_return = manifest.needs_semantics.then(|| {
        let mut builder = SemanticBuilder::new()
            .with_build_nodes(true)
            .with_check_syntax_error(true);
        if let Some(stats) = semantic_stats {
            builder = builder.with_stats(stats);
        }
        builder.build(program)
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
        open_bounds: Vec::new(),
        validation_stats: Stats::default(),
        declaration_kinds: Vec::new(),
        sequence: 0,
        words: PackedWords::with_capacity(source.len().saturating_mul(2)),
        string_ids: FxHashMap::default(),
        counts: RoutedCounts::default(),
        route_scratch: Vec::new(),
        parent_ids: FxHashSet::default(),
        selector_stack: manifest.has_selectors.then(Vec::new),
        parent_types: (manifest.has_parent_filters && semantic_return.is_none()).then(Vec::new),
        member_writes: MemberWriteStack::new(tracks_member_writes(
            Some(manifest),
            manifest.retention_capabilities,
        )),
        member_paths: MemberPathInterner::default(),
        comments: manifest
            .needs_comments
            .then_some(program.comments.as_slice()),
    };
    // Program-only routes need no descendant payloads or traversal. Validation
    // still visits the entire AST and supplies its exact node count; reuse that
    // count instead of walking the same tree again just to emit its root.
    if manifest.program_only && !manifest.needs_semantics {
        let validated = if let Some(stats) = semantic_stats {
            crate::syntax::validation::validate_program_with_stats(
                program,
                "routed-materialization",
                stats,
            )?
        } else {
            crate::syntax::validation::validate_program(
                program,
                "routed-materialization",
                allocator,
            )?
        };
        collector.node_count = validated.stats.nodes;
        collector.emit(AstKind::Program(program), VisitSide::Enter, false, false);
        collector.sequence = collector.node_count;
        collector.close_bounds(AstKind::Program(program));
        if manifest.include_exit {
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
        routed_shape_flags(manifest, manifest.include_traversal),
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

fn for_each_role_child<'a>(
    kind: AstKind<'a>,
    role_id: u32,
    callback: &mut impl FnMut(AstKind<'a>, Option<AstKind<'a>>),
) {
    use crate::generated::event_schema::{
        child_role_id_for_edge, child_role_projects_formal_parameters, for_each_ast_child,
    };
    for_each_ast_child(kind, &mut |child| {
        if child_role_id_for_edge(kind, child) != Some(role_id) {
            return;
        }
        if child_role_projects_formal_parameters(role_id)
            && matches!(child, AstKind::FormalParameters(_))
        {
            for_each_ast_child(child, &mut |parameter| callback(parameter, Some(child)));
        } else {
            callback(child, None);
        }
    });
}

struct RoutedEventCollector<'a> {
    source: &'a str,
    manifest: &'a CompiledManifest,
    nodes: Option<&'a AstNodes<'a>>,
    scoping: Option<&'a Scoping>,
    utf16: Option<&'a [u32]>,
    root: Option<(u32, u32)>,
    node_count: u32,
    // Only emitted ancestors need backpatches; memory is bounded by AST depth.
    open_bounds: Vec<(NodeId, usize)>,
    validation_stats: Stats,
    declaration_kinds: Vec<oxc_ast::ast::VariableDeclarationKind>,
    sequence: u32,
    words: PackedWords,
    string_ids: FxHashMap<String, u32>,
    counts: RoutedCounts,
    route_scratch: Vec<u32>,
    parent_ids: FxHashSet<u32>,
    parent_types: Option<Vec<u32>>,
    selector_stack: Option<Vec<SelectorFrame<'a>>>,
    member_writes: MemberWriteStack<'a>,
    member_paths: MemberPathInterner,
    comments: Option<&'a [Comment]>,
}

#[derive(Clone, Copy)]
struct SelectorFrame<'a> {
    kind: AstKind<'a>,
    write: bool,
    root_write: bool,
}

impl<'a> RoutedEventCollector<'a> {
    fn close_bounds(&mut self, kind: AstKind<'_>) {
        if self
            .open_bounds
            .last()
            .is_some_and(|&(id, _)| id == kind.node_id())
        {
            let (_, offset) = self.open_bounds.pop().expect("open traversal bounds");
            self.words.patch(offset, self.sequence);
        }
    }

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
            self.declaration_kinds.last().copied(),
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
        predicate
            .values
            .iter()
            .any(|expected| compiled_scalar_matches(expected, scalar_type, value))
    }

    fn selector_matches(
        &mut self,
        selector: &CompiledSelector,
        kind: AstKind<'a>,
        write: bool,
        root_write: bool,
    ) -> bool {
        let type_id = ast_kind_protocol_id(kind);
        selector.variants.iter().any(|variant| {
            if variant.node_type_id != type_id {
                return false;
            }
            let declaration_kind = if let AstKind::VariableDeclaration(declaration) = kind {
                Some(declaration.kind)
            } else {
                self.selector_stack.as_ref().and_then(|stack| {
                    stack.iter().rev().find_map(|frame| {
                        if let AstKind::VariableDeclaration(declaration) = frame.kind {
                            Some(declaration.kind)
                        } else {
                            None
                        }
                    })
                })
            };
            let fallback = variant
                .predicates
                .iter()
                .filter(|predicate| {
                    !has_direct_predicate_scalar(
                        type_id,
                        field_key_name(predicate.field_id).expect("validated field"),
                    )
                })
                .fold(FieldMask::none(), |mask, predicate| {
                    mask.with(predicate.field_id)
                });
            let mut values = if fallback.is_empty() {
                Vec::new()
            } else {
                fields(
                    kind,
                    declaration_kind,
                    self.source,
                    write,
                    root_write,
                    self.scoping,
                    fallback,
                )
            };
            normalize_routed_fields(&mut values, self.utf16);
            if !variant.predicates.iter().all(|predicate| {
                let name = field_key_name(predicate.field_id).expect("validated field");
                if name != "memberPath"
                    && let Some(actual) = direct_predicate_scalar(
                        kind,
                        declaration_kind,
                        self.scoping,
                        name,
                        write,
                        root_write,
                    )
                {
                    compiled_predicate_matches(predicate, actual)
                } else {
                    self.predicate_matches(predicate, &values, kind, write, root_write)
                }
            }) {
                return false;
            }
            if let Some(parent_selector) = &variant.parent {
                let Some(frame) = self.selector_stack.as_mut().and_then(Vec::pop) else {
                    return false;
                };
                let matched = self.selector_matches(
                    parent_selector,
                    frame.kind,
                    frame.write,
                    frame.root_write,
                );
                self.selector_stack
                    .as_mut()
                    .expect("selector stack")
                    .push(frame);
                if !matched {
                    return false;
                }
            }
            variant.children.iter().all(|child| {
                let mut position = 0;
                let mut matched = false;
                let mut inspect = |candidate, projected_parent: Option<AstKind<'a>>| {
                    let current = position;
                    position += 1;
                    if matched || child.index.is_some_and(|index| index != current) {
                        return;
                    }
                    self.selector_stack
                        .as_mut()
                        .expect("selector stack")
                        .push(SelectorFrame {
                            kind,
                            write,
                            root_write,
                        });
                    let (parent, parent_write, parent_root_write) =
                        if let Some(parent) = projected_parent {
                            let parent_write =
                                super::member::mutation_target_child(parent, kind, write);
                            let parent_root_write = super::member::member_write_root_child(
                                parent, kind, write, root_write,
                            );
                            self.selector_stack.as_mut().expect("selector stack").push(
                                SelectorFrame {
                                    kind: parent,
                                    write: parent_write,
                                    root_write: parent_root_write,
                                },
                            );
                            (parent, parent_write, parent_root_write)
                        } else {
                            (kind, write, root_write)
                        };
                    let child_write =
                        super::member::mutation_target_child(candidate, parent, parent_write);
                    let child_root_write = super::member::member_write_root_child(
                        candidate,
                        parent,
                        parent_write,
                        parent_root_write,
                    );
                    matched = self.selector_matches(
                        &child.selector,
                        candidate,
                        child_write,
                        child_root_write,
                    );
                    if projected_parent.is_some() {
                        self.selector_stack.as_mut().expect("selector stack").pop();
                    }
                    self.selector_stack.as_mut().expect("selector stack").pop();
                };
                for_each_role_child(kind, child.role_id, &mut inspect);
                matched
            })
        })
    }

    fn emit(
        &mut self,
        kind: AstKind<'a>,
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
                self.declaration_kinds.last().copied(),
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
            let parent_matches = route.parent_types.as_ref().is_none_or(|types| {
                let parent_type = if let Some(nodes) = self.nodes {
                    (kind.node_id().index() != 0)
                        .then(|| ast_kind_protocol_id(nodes.parent_kind(kind.node_id())))
                } else {
                    self.parent_types
                        .as_ref()
                        .and_then(|stack| stack.last().copied())
                };
                parent_type.is_some_and(|parent| types.contains(parent))
            });
            if parent_matches
                && route.selector.as_ref().is_none_or(|selector| {
                    self.selector_matches(selector, kind, member_write, member_root_write)
                })
                && route.predicates.iter().all(|predicate| {
                    self.predicate_matches(
                        predicate,
                        &predicate_fields,
                        kind,
                        member_write,
                        member_root_write,
                    )
                })
            {
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
            self.declaration_kinds.last().copied(),
            self.source,
            member_write,
            member_root_write,
            self.scoping,
            self.utf16,
            payload_mask,
            &mut self.string_ids,
            &mut self.member_paths,
        );
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
        self.words.extend([
            sequence,
            id.index() as u32,
            routed_type_tag(protocol_id, matched_exit_carrier),
            start,
            end,
        ]);
        if self.manifest.include_traversal {
            // Event sequence follows this walk, independently of node IDs and
            // source anchors. Its matching leave backpatches the exclusive end.
            self.open_bounds.push((id, self.words.len()));
            self.words.push(0);
        }
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
            self.words.push(0);
        }
        if self.manifest.needs_comments {
            if comments_inner {
                let comments = self.comments.expect("demanded parser comments");
                let first = comments.partition_point(|comment| comment.span.start < span.start);
                let contained = comments[first..]
                    .iter()
                    .take_while(|comment| comment.span.end <= span.end)
                    .cloned()
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
    declaration_kind: Option<oxc_ast::ast::VariableDeclarationKind>,
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
        AstKind::VariableDeclarator(_) if field == "kind" => {
            Some(PredicateScalar::String(Cow::Owned(
                declaration_kind
                    .expect("variable declarator has a declaration parent")
                    .to_string(),
            )))
        }
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
        if let AstKind::VariableDeclaration(declaration) = kind {
            self.declaration_kinds.push(declaration.kind);
        }
        let (member_write, member_root_write) = self.member_writes.enter(kind);
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
        if let Some(stack) = &mut self.selector_stack {
            stack.push(SelectorFrame {
                kind,
                write: member_write,
                root_write: member_root_write,
            });
        }
        if let Some(stack) = &mut self.parent_types {
            stack.push(ast_kind_protocol_id(kind));
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        if let Some(stack) = &mut self.selector_stack {
            stack.pop();
        }
        if let Some(stack) = &mut self.parent_types {
            stack.pop();
        }
        if self.manifest.include_traversal {
            self.close_bounds(kind);
        }
        let (member_write, member_root_write) = self.member_writes.leave();
        if self.manifest.include_exit
            && self.manifest.routes_by_type[ast_kind_protocol_id(kind) as usize]
                .iter()
                .any(|route| route.side == VisitSide::Exit)
        {
            self.emit(kind, VisitSide::Exit, member_write, member_root_write);
        }
        if matches!(kind, AstKind::VariableDeclaration(_)) {
            self.declaration_kinds.pop();
        }
    }

    fn visit_program(&mut self, program: &oxc_ast::ast::Program<'a>) {
        walk::walk_program(self, program);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::generated::event_schema::node_type_id;
    use crate::protocol::constants::ROUTE_MANIFEST_MAGIC;
    use crate::protocol::manifest::CompiledRoute;
    use oxc_ast_visit::VisitMut;
    use oxc_span::Span;

    #[test]
    fn skip_bounds_follow_walk_order_with_shared_or_reversed_anchors() {
        struct Anchors(bool);
        impl<'a> VisitMut<'a> for Anchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = if self.0 {
                    Span::default()
                } else {
                    Span::new(100 - span.end, 100 - span.start)
                };
            }
        }
        let source = "first(1);second(2);";
        for semantics in [false, true] {
            for anchors in ["parsed", "shared", "reversed"] {
                let allocator = Allocator::default();
                let mut parsed =
                    Parser::new(&allocator, source, source_type("input.js", source).unwrap())
                        .parse();
                // Preserve the source anchors while moving the actual statements.
                parsed.program.body.reverse();
                if anchors != "parsed" {
                    Anchors(anchors == "shared").visit_program(&mut parsed.program);
                }
                let bytes = [ROUTE_MANIFEST_MAGIC, 0, 0, 0, 32, 0, 0, 0]
                    .into_iter()
                    .flat_map(u32::to_le_bytes)
                    .collect::<Vec<_>>();
                let mut manifest = decode_route_manifest(&bytes).unwrap();
                manifest.program_only = false;
                manifest.include_traversal = true;
                manifest.needs_semantics = semantics;
                for (id, name) in ["ExpressionStatement", "NumericLiteral"]
                    .into_iter()
                    .enumerate()
                {
                    let type_id = node_type_id(name).unwrap();
                    manifest.routes_by_type[type_id as usize].push(CompiledRoute {
                        id: id as u32,
                        node_type_id: type_id,
                        side: VisitSide::Enter,
                        predicates: Vec::new(),
                        parent_types: None,
                        selector: None,
                        payload_field_ids: Vec::new(),
                        payload_mask: FieldMask::none(),
                        comments_inner: false,
                    });
                }
                let output = materialize_routed_program(
                    source,
                    &allocator,
                    &parsed.program,
                    &manifest,
                    None,
                    None,
                )
                .unwrap();
                let offset = u32::from_le_bytes(output[24..28].try_into().unwrap()) as usize;
                let bounds = output[offset..]
                    .chunks_exact(36)
                    .map(|record| {
                        let start = u32::from_le_bytes(record[0..4].try_into().unwrap());
                        let end = u32::from_le_bytes(record[20..24].try_into().unwrap());
                        (start, end)
                    })
                    .collect::<Vec<_>>();
                assert_eq!(bounds, [(1, 5), (4, 5), (5, 9), (8, 9)]);
            }
        }
    }
    #[test]
    fn parent_matching_uses_ast_structure_with_shared_and_reordered_anchors() {
        use crate::generated::event_schema::field_ids;
        use crate::protocol::constants::NodeTypeSet;
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source = "let outer = 1; function f(){ const inner = 2; }";
        for semantics in [false, true] {
            for shared in [false, true] {
                let allocator = Allocator::default();
                let mut parsed =
                    Parser::new(&allocator, source, source_type("input.js", source).unwrap())
                        .parse();
                parsed.program.body.reverse();
                if shared {
                    SharedAnchors.visit_program(&mut parsed.program);
                }
                let bytes = [ROUTE_MANIFEST_MAGIC, 0, 0, 0, 32, 0, 0, 0]
                    .into_iter()
                    .flat_map(u32::to_le_bytes)
                    .collect::<Vec<_>>();
                let mut manifest = decode_route_manifest(&bytes).unwrap();
                manifest.program_only = false;
                manifest.has_parent_filters = true;
                manifest.has_selectors = true;
                manifest.needs_semantics = semantics;
                let mut parents = NodeTypeSet::default();
                parents.insert(node_type_id("Program").unwrap());
                let type_id = node_type_id("VariableDeclaration").unwrap();
                manifest.merged_field_mask_by_type[type_id as usize] =
                    FieldMask::none().with(field_ids::KIND);
                manifest.routes_by_type[type_id as usize].push(CompiledRoute {
                    id: 0,
                    node_type_id: type_id,
                    side: VisitSide::Enter,
                    predicates: Vec::new(),
                    parent_types: Some(parents),
                    selector: Some(CompiledSelector {
                        variants: vec![crate::protocol::manifest::SelectorVariant {
                            node_type_id: type_id,
                            predicates: Vec::new(),
                            parent: None,
                            children: vec![crate::protocol::manifest::SelectorChild {
                                role_id: crate::generated::event_schema::child_role_id(
                                    type_id,
                                    "declarations",
                                )
                                .unwrap(),
                                index: Some(0),
                                selector: CompiledSelector {
                                    variants: vec![crate::protocol::manifest::SelectorVariant {
                                        node_type_id: node_type_id("VariableDeclarator").unwrap(),
                                        predicates: Vec::new(),
                                        parent: None,
                                        children: vec![crate::protocol::manifest::SelectorChild {
                                            role_id: crate::generated::event_schema::child_role_id(
                                                node_type_id("VariableDeclarator").unwrap(),
                                                "id",
                                            )
                                            .unwrap(),
                                            index: None,
                                            selector: CompiledSelector {
                                                variants: vec![
                                                    crate::protocol::manifest::SelectorVariant {
                                                        node_type_id: node_type_id("Identifier")
                                                            .unwrap(),
                                                        predicates: vec![CompiledPredicate {
                                                            field_id: field_ids::NAME,
                                                            operation: 0,
                                                            values: vec![CompiledScalar::String(
                                                                "outer".into(),
                                                            )],
                                                        }],
                                                        parent: None,
                                                        children: Vec::new(),
                                                    },
                                                ],
                                            },
                                        }],
                                    }],
                                },
                            }],
                        }],
                    }),
                    payload_field_ids: vec![field_ids::KIND],
                    payload_mask: FieldMask::none().with(field_ids::KIND),
                    comments_inner: false,
                });
                manifest.child_role_mask_by_parent_type[type_id as usize]
                    .role_ids
                    .push(
                        crate::generated::event_schema::child_role_id(type_id, "declarations")
                            .unwrap(),
                    );
                let declarator = node_type_id("VariableDeclarator").unwrap();
                manifest.child_role_mask_by_parent_type[declarator as usize]
                    .role_ids
                    .push(crate::generated::event_schema::child_role_id(declarator, "id").unwrap());
                manifest.merged_field_mask_by_type[node_type_id("Identifier").unwrap() as usize] =
                    FieldMask::none().with(field_ids::NAME);
                let routed = materialize_routed_program(
                    source,
                    &allocator,
                    &parsed.program,
                    &manifest,
                    None,
                    None,
                )
                .unwrap();
                let parts = crate::engine::collect::materialize_program(
                    source,
                    &allocator,
                    &parsed.program,
                    Some(&manifest),
                    None,
                    false,
                    None,
                )
                .unwrap();
                let retained = crate::engine::retained::routed_buffer_from_index(
                    &manifest,
                    &parts.retained_index,
                    &[],
                    None,
                )
                .unwrap();
                for output in [routed, retained] {
                    let word =
                        |offset| u32::from_le_bytes(output[offset..offset + 4].try_into().unwrap());
                    assert_eq!(word(12), 1);
                    assert_eq!(word(16), 1);
                    assert_eq!(word(20), 1);
                    assert_eq!(word(32), 3);
                    assert_eq!(&output[36..39], b"let");
                }
            }
        }
    }
}
