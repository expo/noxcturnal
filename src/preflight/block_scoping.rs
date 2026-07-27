use oxc_allocator::Allocator;
use oxc_ast::{
    AstKind,
    ast::{
        BindingIdentifier, IdentifierReference, Program, VariableDeclaration,
        VariableDeclarationKind,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{NodeId, ScopeId, Semantic, SymbolId};
use oxc_span::{GetSpan, Span};
use oxc_syntax::reference::ReferenceId;
use oxc_syntax::{scope::ScopeFlags, symbol::SymbolFlags};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::edit::{EditCommand, EditKind, MappingPolicy};

struct CapturedLoop {
    node_id: NodeId,
    span: Span,
    body_span: Span,
    header_bindings: Vec<String>,
}

/// Build a structural edit for the deepest captured loop. The body is relocated
/// as original-backed pieces into a per-iteration helper, so its mappings survive
/// and control-flow replacements travel with it.
pub(super) fn captured_loop_edits(
    source: &str,
    semantic: &Semantic<'_>,
) -> Option<Vec<EditCommand>> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let mut loops: FxHashMap<NodeId, CapturedLoop> = FxHashMap::default();
    for symbol_id in scoping.symbol_ids() {
        if !scoping
            .symbol_flags(symbol_id)
            .contains(SymbolFlags::BlockScopedVariable)
        {
            continue;
        }
        let declaration_id = scoping.symbol_declaration(symbol_id);
        let Some(loop_id) = nodes
            .ancestor_ids(declaration_id)
            .find(|node_id| nodes.kind(*node_id).is_iteration_statement())
        else {
            continue;
        };
        if !scoping
            .get_resolved_reference_ids(symbol_id)
            .iter()
            .any(|reference_id| {
                crosses_function_before(
                    nodes,
                    scoping.get_reference(*reference_id).node_id(),
                    loop_id,
                )
            })
        {
            continue;
        }
        let (span, body_span) = loop_spans(nodes.kind(loop_id))?;
        let captured = loops.entry(loop_id).or_insert_with(|| CapturedLoop {
            node_id: loop_id,
            span,
            body_span,
            header_bindings: Vec::new(),
        });
        if nodes.kind(declaration_id).span().start < body_span.start {
            captured
                .header_bindings
                .push(scoping.symbol_name(symbol_id).to_owned());
        }
    }
    let loop_ids: FxHashSet<NodeId> = loops.keys().copied().collect();
    // Lower every disjoint outermost loop in one edit batch. Inserting a helper
    // before a nested loop whose parent uses it as a single-statement body would
    // otherwise change ownership of that statement. Once its outer loop has been
    // relocated into a block-bodied helper, the next iteration can safely lower it.
    let outermost = loops.into_values().filter(|candidate| {
        !nodes
            .ancestor_ids(candidate.node_id)
            .any(|ancestor| loop_ids.contains(&ancestor))
    });
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    let mut edits = Vec::new();
    for captured in outermost {
        edits.extend(lower_captured_loop(
            source,
            semantic,
            captured,
            &mut reserved,
        )?);
    }
    (!edits.is_empty()).then_some(edits)
}

fn crosses_function_before(
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: NodeId,
    loop_id: NodeId,
) -> bool {
    let mut crossed = false;
    let reference_span = nodes.kind(node_id).span();
    for ancestor in nodes.ancestor_ids(node_id) {
        if ancestor == loop_id {
            return crossed;
        }
        crossed |= nodes.kind(ancestor).is_function_like()
            || matches!(
                nodes.kind(ancestor),
                AstKind::PropertyDefinition(property)
                    if !property.r#static
                        && property
                            .value
                            .as_ref()
                            .is_some_and(|value| value.span().contains_inclusive(reference_span))
            );
    }
    false
}

fn loop_spans(kind: AstKind<'_>) -> Option<(Span, Span)> {
    match kind {
        AstKind::ForStatement(loop_) => Some((loop_.span, loop_.body.span())),
        AstKind::ForInStatement(loop_) => Some((loop_.span, loop_.body.span())),
        AstKind::ForOfStatement(loop_) => Some((loop_.span, loop_.body.span())),
        AstKind::WhileStatement(loop_) => Some((loop_.span, loop_.body.span())),
        AstKind::DoWhileStatement(loop_) => Some((loop_.span, loop_.body.span())),
        _ => None,
    }
}

fn lower_captured_loop(
    source: &str,
    semantic: &Semantic<'_>,
    captured: CapturedLoop,
    reserved: &mut FxHashSet<String>,
) -> Option<Vec<EditCommand>> {
    let nodes = semantic.nodes();
    let mut insertion = captured.span.start;
    let mut statement_root = captured.node_id;
    for ancestor in nodes.ancestor_ids(captured.node_id) {
        if matches!(
            nodes.kind(ancestor),
            AstKind::Program(_)
                | AstKind::BlockStatement(_)
                | AstKind::FunctionBody(_)
                | AstKind::SwitchCase(_)
        ) {
            insertion = nodes.kind(statement_root).span().start;
            break;
        }
        statement_root = ancestor;
    }
    let mut label = None;
    if let Some(parent_id) = nodes.ancestor_ids(captured.node_id).next()
        && let AstKind::LabeledStatement(statement) = nodes.kind(parent_id)
    {
        label = Some(statement.label.name.as_str());
    }
    let body_is_block = source.as_bytes().get(captured.body_span.start as usize) == Some(&b'{');
    let content_start = captured.body_span.start + u32::from(body_is_block);
    let content_end = captured.body_span.end - u32::from(body_is_block);
    let helper = reserve_name("_loop", reserved);
    let result = reserve_name("_loopResult", reserved);
    let args = captured.header_bindings.join(",");
    let vars = args.clone();
    let mut controls = Vec::new();
    let mut has_await = false;
    let mut has_yield = false;
    for (node_id, node) in nodes.iter_enumerated() {
        let span = node.kind().span();
        if span.start < content_start || span.end > content_end {
            continue;
        }
        match node.kind() {
            AstKind::AwaitExpression(_) if belongs_to_body(nodes, node_id, captured.node_id) => {
                has_await = true;
            }
            AstKind::YieldExpression(_) if belongs_to_body(nodes, node_id, captured.node_id) => {
                has_yield = true;
            }
            AstKind::ReturnStatement(statement)
                if belongs_to_body(nodes, node_id, captured.node_id) =>
            {
                let raw = &source[statement.span.start as usize..statement.span.end as usize];
                let value = raw
                    .trim()
                    .strip_prefix("return")
                    .unwrap_or("")
                    .trim()
                    .trim_end_matches(';')
                    .trim();
                controls.push(replace(
                    statement.span,
                    format!(
                        "return {{type:\"return\",value:{},vars:[{vars}]}};",
                        if value.is_empty() { "void 0" } else { value }
                    ),
                ));
            }
            AstKind::BreakStatement(statement)
                if control_targets_loop(nodes, node_id, captured.node_id, true, label) =>
            {
                controls.push(replace(
                    statement.span,
                    format!("return {{type:\"break\",vars:[{vars}]}};"),
                ));
            }
            AstKind::ContinueStatement(statement)
                if control_targets_loop(nodes, node_id, captured.node_id, false, label) =>
            {
                controls.push(replace(
                    statement.span,
                    format!("return {{type:\"continue\",vars:[{vars}]}};"),
                ));
            }
            _ => {}
        }
    }
    let has_return = controls.iter().any(|edit| {
        edit.content
            .as_deref()
            .is_some_and(|text| text.contains("\"return\""))
    });
    let has_break = controls.iter().any(|edit| {
        edit.content
            .as_deref()
            .is_some_and(|text| text.contains("\"break\""))
    });
    let has_continue = controls.iter().any(|edit| {
        edit.content
            .as_deref()
            .is_some_and(|text| text.contains("\"continue\""))
    });
    let helper_head = if has_yield {
        format!(
            "{}function* {helper}({args}){{",
            if has_await { "async " } else { "" }
        )
    } else {
        format!(
            "var {helper}={}({args})=>{{",
            if has_await { "async " } else { "" }
        )
    };
    let helper_tail = format!(
        ";return {{type:\"normal\",vars:[{vars}]}};}}{}",
        if has_yield { "" } else { ";" }
    );
    let call = if has_yield {
        format!(
            "yield* {helper}.call(this{})",
            if args.is_empty() {
                String::new()
            } else {
                format!(",{args}")
            }
        )
    } else {
        format!("{}{helper}({args})", if has_await { "await " } else { "" })
    };
    let copy_back = captured
        .header_bindings
        .iter()
        .enumerate()
        .map(|(index, name)| format!("{name}={result}.vars[{index}];"))
        .collect::<String>();
    let label_suffix = label.map_or(String::new(), |label| format!(" {label}"));
    let dispatch = format!(
        "{}{}{}",
        if has_return {
            format!("if({result}.type===\"return\")return {result}.value;")
        } else {
            String::new()
        },
        if has_break {
            format!("if({result}.type===\"break\")break{label_suffix};")
        } else {
            String::new()
        },
        if has_continue {
            format!("if({result}.type===\"continue\")continue{label_suffix};")
        } else {
            String::new()
        }
    );
    let replacement_body = format!("{{{result}={call};{copy_back}{dispatch}}}");
    let mut edits = vec![
        insert(
            EditKind::AppendLeft,
            insertion,
            format!("var {result};{helper_head}"),
        ),
        EditCommand {
            kind: EditKind::Move,
            start: content_start,
            end: content_end,
            content: None,
            parts: Vec::new(),
            destination: Some(insertion),
            mapping: None,
            order: None,
            names: None,
        },
        insert(EditKind::AppendRight, insertion, helper_tail),
        insert(EditKind::AppendRight, content_end, replacement_body),
    ];
    edits.append(&mut controls);
    Some(edits)
}

fn reserve_name(base: &str, used: &mut FxHashSet<String>) -> String {
    if used.insert(base.to_owned()) {
        return base.to_owned();
    }
    let mut suffix = used.len().max(2);
    loop {
        let name = format!("{base}{suffix}");
        if used.insert(name.clone()) {
            return name;
        }
        suffix += 1;
    }
}

fn insert(kind: EditKind, position: u32, content: String) -> EditCommand {
    EditCommand {
        kind,
        start: position,
        end: position,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::Sourceless),
        order: None,
        names: None,
    }
}

fn replace(span: Span, content: String) -> EditCommand {
    EditCommand {
        kind: EditKind::Replace,
        start: span.start,
        end: span.end,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorStart),
        order: None,
        names: None,
    }
}

fn belongs_to_body(nodes: &oxc_semantic::AstNodes<'_>, node_id: NodeId, loop_id: NodeId) -> bool {
    for ancestor in nodes.ancestor_ids(node_id) {
        if ancestor == loop_id {
            return true;
        }
        if nodes.kind(ancestor).is_function_like() {
            return false;
        }
    }
    false
}

fn control_targets_loop(
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: NodeId,
    loop_id: NodeId,
    break_allows_switch: bool,
    label: Option<&str>,
) -> bool {
    let statement_label = match nodes.kind(node_id) {
        AstKind::BreakStatement(statement) => {
            statement.label.as_ref().map(|label| label.name.as_str())
        }
        AstKind::ContinueStatement(statement) => {
            statement.label.as_ref().map(|label| label.name.as_str())
        }
        _ => None,
    };
    if let Some(statement_label) = statement_label {
        return label == Some(statement_label);
    }
    for ancestor in nodes.ancestor_ids(node_id) {
        let kind = nodes.kind(ancestor);
        if kind.is_function_like() {
            return false;
        }
        if kind.is_iteration_statement()
            || (break_allows_switch && matches!(kind, AstKind::SwitchStatement(_)))
        {
            return ancestor == loop_id;
        }
    }
    false
}

/// Lower lexical declarations whose bindings do not require per-iteration loop
/// environments. Captured loops are handled by the structural half of this pass;
/// keeping name planning here symbol-based ensures block collisions never depend
/// on source-text heuristics.
pub(super) fn prepare(semantic: &Semantic<'_>) -> Result<BlockScopingPlan, &'static str> {
    let scoping = semantic.scoping();
    if has_captured_loop_binding(semantic) {
        return Err("captured-loop-block-scoping-postcondition-failed");
    }
    let mut groups: FxHashMap<(ScopeId, String), Vec<SymbolId>> = FxHashMap::default();
    let mut used_names: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();

    for symbol_id in scoping.symbol_ids() {
        let scope_id = scoping.symbol_scope_id(symbol_id);
        let target_scope = scoping
            .scope_ancestors(scope_id)
            .find(|scope_id| scoping.scope_flags(*scope_id).intersects(ScopeFlags::Var))
            .unwrap_or(scope_id);
        groups
            .entry((target_scope, scoping.symbol_name(symbol_id).to_owned()))
            .or_default()
            .push(symbol_id);
    }

    let mut renames = FxHashMap::default();
    for ((_scope_id, name), mut symbols) in groups {
        if symbols.len() < 2 {
            continue;
        }
        // A function-scoped binding already occupies the name after lowering, so
        // preserve it even when its declaration appears after the lexical one.
        // Otherwise preserve the earliest lexical binding and rename later ones.
        symbols.sort_unstable_by_key(|symbol_id| {
            (
                !scoping
                    .symbol_flags(*symbol_id)
                    .contains(SymbolFlags::FunctionScopedVariable),
                scoping.symbol_span(*symbol_id).start,
            )
        });
        for symbol_id in symbols.into_iter().skip(1).filter(|symbol_id| {
            scoping
                .symbol_flags(*symbol_id)
                .contains(SymbolFlags::BlockScopedVariable)
        }) {
            let mut suffix = 0_u32;
            let replacement = loop {
                let candidate = if suffix == 0 {
                    format!("_{name}")
                } else {
                    format!("_{name}{suffix}")
                };
                suffix += 1;
                if used_names.insert(candidate.clone()) {
                    break candidate;
                }
            };
            renames.insert(symbol_id, replacement);
        }
    }

    let reference_renames = renames
        .iter()
        .flat_map(|(symbol_id, replacement)| {
            scoping
                .get_resolved_reference_ids(*symbol_id)
                .iter()
                .map(move |reference_id| (*reference_id, replacement.clone()))
        })
        .collect();
    Ok(BlockScopingPlan {
        binding_renames: renames,
        reference_renames,
    })
}

pub(super) fn run<'a>(allocator: &'a Allocator, program: &mut Program<'a>, plan: BlockScopingPlan) {
    BlockScopingLowerer { allocator, plan }.visit_program(program);
}

pub(super) fn has_remaining_syntax(program: &Program<'_>) -> bool {
    let mut detector = RemainingBlockScopingDetector(false);
    detector.visit_program(program);
    detector.0
}

fn has_captured_loop_binding(semantic: &Semantic<'_>) -> bool {
    let scoping = semantic.scoping();
    let nodes = semantic.nodes();
    for symbol_id in scoping.symbol_ids() {
        if !scoping
            .symbol_flags(symbol_id)
            .contains(SymbolFlags::BlockScopedVariable)
        {
            continue;
        }
        let declaration_id = scoping.symbol_declaration(symbol_id);
        let Some(loop_id) = nodes
            .ancestor_ids(declaration_id)
            .find(|node_id| nodes.kind(*node_id).is_iteration_statement())
        else {
            continue;
        };
        for reference_id in scoping.get_resolved_reference_ids(symbol_id) {
            let reference_node_id = scoping.get_reference(*reference_id).node_id();
            let mut crossed_function = false;
            for ancestor_id in nodes.ancestor_ids(reference_node_id) {
                if ancestor_id == loop_id {
                    if crossed_function {
                        return true;
                    }
                    break;
                }
                crossed_function |= nodes.kind(ancestor_id).is_function_like();
            }
        }
    }
    false
}

pub(super) struct BlockScopingPlan {
    binding_renames: FxHashMap<SymbolId, String>,
    reference_renames: FxHashMap<ReferenceId, String>,
}

struct BlockScopingLowerer<'a> {
    allocator: &'a Allocator,
    plan: BlockScopingPlan,
}

struct RemainingBlockScopingDetector(bool);

impl<'a> Visit<'a> for RemainingBlockScopingDetector {
    fn visit_variable_declaration(&mut self, declaration: &VariableDeclaration<'a>) {
        self.0 |= matches!(
            declaration.kind,
            VariableDeclarationKind::Let | VariableDeclarationKind::Const
        );
        if !self.0 {
            walk::walk_variable_declaration(self, declaration);
        }
    }
}

impl<'a> VisitMut<'a> for BlockScopingLowerer<'a> {
    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        if matches!(
            declaration.kind,
            VariableDeclarationKind::Let | VariableDeclarationKind::Const
        ) {
            declaration.kind = VariableDeclarationKind::Var;
        }
        walk_mut::walk_variable_declaration(self, declaration);
    }

    fn visit_binding_identifier(&mut self, identifier: &mut BindingIdentifier<'a>) {
        if let Some(symbol_id) = identifier.symbol_id.get()
            && let Some(replacement) = self.plan.binding_renames.get(&symbol_id)
        {
            identifier.name = self.allocator.alloc_str(replacement).into();
        }
    }

    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if let Some(reference_id) = identifier.reference_id.get()
            && let Some(replacement) = self.plan.reference_renames.get(&reference_id)
        {
            identifier.name = self.allocator.alloc_str(replacement).into();
        }
    }
}
