use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, ArrayExpressionElement, BindingIdentifier, Expression, FormalParameterKind,
        FormalParameterRest, IdentifierReference, Program, PropertyKind, Statement,
        TSThisParameter, TSTypeAnnotation, TSTypeParameterDeclaration,
        TSTypeParameterInstantiation, VariableDeclaration, VariableDeclarationKind,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{NodeId, ScopeId, Semantic, SymbolId};
use oxc_span::{GetSpan, SourceType, Span};
use oxc_syntax::{scope::ScopeFlags, symbol::SymbolFlags};
use rustc_hash::{FxHashMap, FxHashSet};

struct CapturedLoop {
    node_id: NodeId,
    span: Span,
    body_span: Span,
    header_bindings: Vec<String>,
}

pub(super) struct CapturedLoopAstPlan {
    roots: FxHashMap<(u32, u32), Vec<CapturedLoopMutation>>,
}

struct CapturedLoopMutation {
    loop_span: Span,
    insertion_anchor: Span,
    anchor: Span,
    dispatch_anchor: Span,
    bindings: Vec<String>,
    helper: String,
    result: String,
    label: Option<String>,
    returns: FxHashSet<(u32, u32)>,
    breaks: FxHashSet<(u32, u32)>,
    continues: FxHashSet<(u32, u32)>,
    has_await: bool,
    has_yield: bool,
}

impl CapturedLoopAstPlan {
    pub(super) fn is_empty(&self) -> bool {
        self.roots.is_empty()
    }
}

pub(super) fn prepare_captured_loop_ast(
    source: &str,
    _source_type: SourceType,
    semantic: &Semantic<'_>,
) -> Result<CapturedLoopAstPlan, &'static str> {
    Ok(CapturedLoopAstPlan {
        roots: captured_loop_mutations(source, semantic).unwrap_or_default(),
    })
}

pub(super) fn run_captured_loop_ast<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: CapturedLoopAstPlan,
) -> Result<bool, &'static str> {
    if plan.roots.is_empty() {
        return Ok(false);
    }
    let mut pass = CapturedLoopAstLowerer {
        allocator,
        roots: plan.roots,
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    if let Some(error) = pass.error {
        return Err(error);
    }
    if !pass.roots.is_empty() {
        return Err("captured-loop-ast-target-missing");
    }
    Ok(pass.changed)
}

struct CapturedLoopAstLowerer<'a> {
    allocator: &'a Allocator,
    roots: FxHashMap<(u32, u32), Vec<CapturedLoopMutation>>,
    changed: bool,
    error: Option<&'static str>,
}

impl<'a> VisitMut<'a> for CapturedLoopAstLowerer<'a> {
    fn visit_statements(&mut self, statements: &mut ArenaVec<'a, Statement<'a>>) {
        let mut index = 0;
        while index < statements.len() {
            let span = statements[index].span();
            if let Some(mut mutations) = self.roots.remove(&(span.start, span.end)) {
                mutations
                    .sort_unstable_by_key(|mutation| std::cmp::Reverse(mutation.loop_span.start));
                let mut helpers = ArenaVec::new_in(&self.allocator);
                for mutation in mutations {
                    match mutate_captured_loop(self.allocator, &mut statements[index], mutation) {
                        Ok(mut generated) => helpers.append(&mut generated),
                        Err(error) => {
                            self.error = Some(error);
                            return;
                        }
                    }
                }
                let count = helpers.len();
                statements.splice(index..index, helpers);
                index += count + 1;
                self.changed = true;
                continue;
            }
            self.visit_statement(&mut statements[index]);
            index += 1;
        }
    }
}

#[expect(deprecated)]
fn mutate_captured_loop<'a>(
    allocator: &'a Allocator,
    root: &mut Statement<'a>,
    mutation: CapturedLoopMutation,
) -> Result<ArenaVec<'a, Statement<'a>>, &'static str> {
    let ast = AstBuilder::new(allocator);
    let insertion_anchor = mutation.insertion_anchor;
    let dispatch = captured_loop_dispatch(&ast, &mutation);
    let mut mover = CapturedLoopBodyMover {
        ast,
        mutation: &mutation,
        replacement: Some(dispatch),
        moved: None,
    };
    mover.visit_statement(root);
    let Some(mut body) = mover.moved else {
        return Err("captured-loop-ast-target-missing");
    };
    CapturedControlRewriter {
        ast,
        mutation: &mutation,
    }
    .visit_statement(&mut body);
    let mut helper_body = match body {
        Statement::BlockStatement(block) => block.unbox().body,
        statement => {
            let mut statements = ArenaVec::new_in(&allocator);
            statements.push(statement);
            statements
        }
    };
    helper_body.push(ast.statement_return(
        mutation.anchor,
        Some(captured_loop_result(
            &ast,
            &mutation,
            mutation.anchor,
            "normal",
            None,
        )),
    ));
    let function_body =
        ast.alloc_function_body(mutation.anchor, ArenaVec::new_in(&allocator), helper_body);
    let mut parameters = ArenaVec::new_in(&allocator);
    for binding in &mutation.bindings {
        parameters.push(ast.formal_parameter(
            mutation.anchor,
            ArenaVec::new_in(&allocator),
            ast.binding_pattern_binding_identifier(mutation.anchor, allocator.alloc_str(binding)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
        ));
    }
    let parameters = ast.alloc_formal_parameters(
        mutation.anchor,
        FormalParameterKind::FormalParameter,
        parameters,
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
    );
    let helper_expression = if mutation.has_yield {
        ast.expression_function(
            mutation.anchor,
            oxc_ast::ast::FunctionType::FunctionExpression,
            None,
            true,
            mutation.has_await,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            parameters,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(function_body),
        )
    } else {
        ast.expression_arrow_function(
            mutation.anchor,
            false,
            mutation.has_await,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            parameters,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            function_body,
        )
    };
    let result_declaration = ast.variable_declarator(
        insertion_anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(
            insertion_anchor,
            allocator.alloc_str(&mutation.result),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        None::<Expression<'a>>,
        false,
    );
    let helper_declaration = ast.variable_declarator(
        insertion_anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(
            insertion_anchor,
            allocator.alloc_str(&mutation.helper),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(helper_expression),
        false,
    );
    let mut generated = ArenaVec::new_in(&allocator);
    generated.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(
            insertion_anchor,
            VariableDeclarationKind::Var,
            ast.vec1(result_declaration),
            false,
        ),
    ));
    generated.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(
            insertion_anchor,
            VariableDeclarationKind::Var,
            ast.vec1(helper_declaration),
            false,
        ),
    ));
    Ok(generated)
}

struct CapturedLoopBodyMover<'a, 'p> {
    ast: AstBuilder<'a>,
    mutation: &'p CapturedLoopMutation,
    replacement: Option<Statement<'a>>,
    moved: Option<Statement<'a>>,
}

impl<'a> VisitMut<'a> for CapturedLoopBodyMover<'a, '_> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        let span = statement.span();
        if span == self.mutation.loop_span {
            let body = match statement {
                Statement::ForStatement(statement) => &mut statement.body,
                Statement::ForInStatement(statement) => &mut statement.body,
                Statement::ForOfStatement(statement) => &mut statement.body,
                Statement::WhileStatement(statement) => &mut statement.body,
                Statement::DoWhileStatement(statement) => &mut statement.body,
                _ => return,
            };
            self.moved = Some(body.take_in(&self.ast));
            *body = self
                .replacement
                .take()
                .expect("captured loop body is replaced exactly once");
            return;
        }
        walk_mut::walk_statement(self, statement);
    }
}

struct CapturedControlRewriter<'a, 'p> {
    ast: AstBuilder<'a>,
    mutation: &'p CapturedLoopMutation,
}

impl<'a> VisitMut<'a> for CapturedControlRewriter<'a, '_> {
    #[expect(deprecated)]
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        let span = statement.span();
        let key = (span.start, span.end);
        let replacement = if self.mutation.returns.contains(&key) {
            let Statement::ReturnStatement(return_statement) = statement else {
                return;
            };
            let value = return_statement.argument.take().unwrap_or_else(|| {
                self.ast.expression_unary(
                    self.mutation.anchor,
                    oxc_syntax::operator::UnaryOperator::Void,
                    self.ast.expression_numeric_literal(
                        self.mutation.anchor,
                        0.0,
                        None,
                        oxc_ast::ast::NumberBase::Decimal,
                    ),
                )
            });
            Some(self.ast.statement_return(
                span,
                Some(captured_loop_result(
                    &self.ast,
                    self.mutation,
                    span,
                    "return",
                    Some(value),
                )),
            ))
        } else if self.mutation.breaks.contains(&key) {
            Some(self.ast.statement_return(
                span,
                Some(captured_loop_result(
                    &self.ast,
                    self.mutation,
                    span,
                    "break",
                    None,
                )),
            ))
        } else if self.mutation.continues.contains(&key) {
            Some(self.ast.statement_return(
                span,
                Some(captured_loop_result(
                    &self.ast,
                    self.mutation,
                    span,
                    "continue",
                    None,
                )),
            ))
        } else {
            None
        };
        if let Some(replacement) = replacement {
            *statement = replacement;
        } else {
            walk_mut::walk_statement(self, statement);
        }
    }

    fn visit_function(&mut self, _function: &mut oxc_ast::ast::Function<'a>, _flags: ScopeFlags) {}

    fn visit_arrow_function_expression(
        &mut self,
        _expression: &mut oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
    }
}

#[expect(deprecated)]
fn captured_loop_result<'a>(
    ast: &AstBuilder<'a>,
    mutation: &CapturedLoopMutation,
    span: Span,
    kind: &str,
    value: Option<Expression<'a>>,
) -> Expression<'a> {
    let mut properties = ArenaVec::new_in(ast);
    properties.push(ast.object_property_kind_object_property(
        span,
        PropertyKind::Init,
        ast.property_key_static_identifier(span, "type"),
        ast.expression_string_literal(span, ast.allocator.alloc_str(kind), None),
        false,
        false,
        false,
    ));
    if let Some(value) = value {
        properties.push(ast.object_property_kind_object_property(
            span,
            PropertyKind::Init,
            ast.property_key_static_identifier(span, "value"),
            value,
            false,
            false,
            false,
        ));
    }
    let mut elements = ArenaVec::new_in(ast);
    for binding in &mutation.bindings {
        elements.push(ArrayExpressionElement::from(
            ast.expression_identifier(span, ast.allocator.alloc_str(binding)),
        ));
    }
    properties.push(ast.object_property_kind_object_property(
        span,
        PropertyKind::Init,
        ast.property_key_static_identifier(span, "vars"),
        ast.expression_array(span, elements),
        false,
        false,
        false,
    ));
    ast.expression_object(span, properties)
}

#[expect(deprecated)]
fn captured_loop_dispatch<'a>(
    ast: &AstBuilder<'a>,
    mutation: &CapturedLoopMutation,
) -> Statement<'a> {
    let anchor = mutation.dispatch_anchor;
    let mut call_arguments = ArenaVec::new_in(ast);
    for binding in &mutation.bindings {
        call_arguments.push(Argument::from(
            ast.expression_identifier(anchor, ast.allocator.alloc_str(binding)),
        ));
    }
    let mut call = if mutation.has_yield {
        if !mutation.bindings.is_empty() {
            call_arguments.insert(0, Argument::from(ast.expression_this(anchor)));
        } else {
            call_arguments.push(Argument::from(ast.expression_this(anchor)));
        }
        ast.expression_call(
            anchor,
            Expression::from(ast.member_expression_static(
                anchor,
                ast.expression_identifier(anchor, ast.allocator.alloc_str(&mutation.helper)),
                ast.identifier_name(anchor, "call"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            call_arguments,
            false,
        )
    } else {
        ast.expression_call(
            anchor,
            ast.expression_identifier(anchor, ast.allocator.alloc_str(&mutation.helper)),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            call_arguments,
            false,
        )
    };
    call = if mutation.has_yield {
        ast.expression_yield(anchor, true, Some(call))
    } else if mutation.has_await {
        ast.expression_await(anchor, call)
    } else {
        call
    };
    let assignment = ast.expression_assignment(
        anchor,
        oxc_syntax::operator::AssignmentOperator::Assign,
        ast.simple_assignment_target_assignment_target_identifier(
            anchor,
            ast.allocator.alloc_str(&mutation.result),
        )
        .into(),
        call,
    );
    let mut body = ArenaVec::new_in(ast);
    body.push(ast.statement_expression(anchor, assignment));
    for (index, binding) in mutation.bindings.iter().enumerate() {
        let target = ast.simple_assignment_target_assignment_target_identifier(
            anchor,
            ast.allocator.alloc_str(binding),
        );
        let vars = Expression::from(ast.member_expression_static(
            anchor,
            ast.expression_identifier(anchor, ast.allocator.alloc_str(&mutation.result)),
            ast.identifier_name(anchor, "vars"),
            false,
        ));
        let value = Expression::from(ast.member_expression_computed(
            anchor,
            vars,
            ast.expression_numeric_literal(
                anchor,
                index as f64,
                None,
                oxc_ast::ast::NumberBase::Decimal,
            ),
            false,
        ));
        body.push(ast.statement_expression(
            anchor,
            ast.expression_assignment(
                anchor,
                oxc_syntax::operator::AssignmentOperator::Assign,
                target.into(),
                value,
            ),
        ));
    }
    for (kind, enabled) in [
        ("return", !mutation.returns.is_empty()),
        ("break", !mutation.breaks.is_empty()),
        ("continue", !mutation.continues.is_empty()),
    ] {
        if !enabled {
            continue;
        }
        let result_type = Expression::from(ast.member_expression_static(
            anchor,
            ast.expression_identifier(anchor, ast.allocator.alloc_str(&mutation.result)),
            ast.identifier_name(anchor, "type"),
            false,
        ));
        let test = ast.expression_binary(
            anchor,
            result_type,
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            ast.expression_string_literal(anchor, ast.allocator.alloc_str(kind), None),
        );
        let consequent = match kind {
            "return" => ast.statement_return(
                anchor,
                Some(Expression::from(ast.member_expression_static(
                    anchor,
                    ast.expression_identifier(anchor, ast.allocator.alloc_str(&mutation.result)),
                    ast.identifier_name(anchor, "value"),
                    false,
                ))),
            ),
            "break" => ast.statement_break(
                anchor,
                mutation
                    .label
                    .as_ref()
                    .map(|label| ast.label_identifier(anchor, ast.allocator.alloc_str(label))),
            ),
            _ => ast.statement_continue(
                anchor,
                mutation
                    .label
                    .as_ref()
                    .map(|label| ast.label_identifier(anchor, ast.allocator.alloc_str(label))),
            ),
        };
        body.push(ast.statement_if(anchor, test, consequent, None));
    }
    ast.statement_block(anchor, body)
}

fn captured_loop_mutations(
    source: &str,
    semantic: &Semantic<'_>,
) -> Option<FxHashMap<(u32, u32), Vec<CapturedLoopMutation>>> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let mut loops: FxHashMap<NodeId, CapturedLoop> = FxHashMap::default();
    for symbol_id in scoping.symbol_ids() {
        let Some(loop_id) = captured_loop_of(nodes, scoping, symbol_id) else {
            continue;
        };
        let declaration_id = scoping.symbol_declaration(symbol_id);
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
    for captured in loops.values_mut() {
        for symbol_id in scoping.symbol_ids() {
            if !scoping
                .symbol_flags(symbol_id)
                .contains(SymbolFlags::BlockScopedVariable)
            {
                continue;
            }
            let declaration_id = scoping.symbol_declaration(symbol_id);
            let belongs_to_loop = nodes
                .ancestor_ids(declaration_id)
                .find(|node_id| nodes.kind(*node_id).is_iteration_statement())
                == Some(captured.node_id);
            if belongs_to_loop && nodes.kind(declaration_id).span().start < captured.body_span.start
            {
                let name = scoping.symbol_name(symbol_id);
                if !captured
                    .header_bindings
                    .iter()
                    .any(|binding| binding == name)
                {
                    captured.header_bindings.push(name.to_owned());
                }
            }
        }
    }
    if loops.is_empty() {
        return None;
    }
    let loop_ids: FxHashSet<NodeId> = loops.keys().copied().collect();
    let outermost = loops.into_values().filter(|candidate| {
        !nodes
            .ancestor_ids(candidate.node_id)
            .any(|ancestor| loop_ids.contains(&ancestor))
    });
    let mut reserved: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    let mut roots: FxHashMap<(u32, u32), Vec<CapturedLoopMutation>> = FxHashMap::default();
    for captured in outermost {
        let mut statement_root = captured.node_id;
        for ancestor in nodes.ancestor_ids(captured.node_id) {
            if matches!(
                nodes.kind(ancestor),
                AstKind::Program(_)
                    | AstKind::BlockStatement(_)
                    | AstKind::FunctionBody(_)
                    | AstKind::SwitchCase(_)
            ) {
                break;
            }
            statement_root = ancestor;
        }
        let label = nodes
            .ancestor_ids(captured.node_id)
            .next()
            .and_then(|parent_id| match nodes.kind(parent_id) {
                AstKind::LabeledStatement(statement) => Some(statement.label.name.to_string()),
                _ => None,
            });
        let body_is_block = source.as_bytes().get(captured.body_span.start as usize) == Some(&b'{');
        let content_start = captured.body_span.start + u32::from(body_is_block);
        let content_end = captured.body_span.end - u32::from(body_is_block);
        let mut returns = FxHashSet::default();
        let mut breaks = FxHashSet::default();
        let mut continues = FxHashSet::default();
        let mut has_await = false;
        let mut has_yield = false;
        for (node_id, node) in nodes.iter_enumerated() {
            let span = node.kind().span();
            if span.start < content_start || span.end > content_end {
                continue;
            }
            match node.kind() {
                AstKind::AwaitExpression(_)
                    if belongs_to_body(nodes, node_id, captured.node_id) =>
                {
                    has_await = true;
                }
                AstKind::YieldExpression(_)
                    if belongs_to_body(nodes, node_id, captured.node_id) =>
                {
                    has_yield = true;
                }
                AstKind::ReturnStatement(statement)
                    if belongs_to_body(nodes, node_id, captured.node_id) =>
                {
                    returns.insert((statement.span.start, statement.span.end));
                }
                AstKind::BreakStatement(statement)
                    if control_targets_loop(
                        nodes,
                        node_id,
                        captured.node_id,
                        true,
                        label.as_deref(),
                    ) =>
                {
                    breaks.insert((statement.span.start, statement.span.end));
                }
                AstKind::ContinueStatement(statement)
                    if control_targets_loop(
                        nodes,
                        node_id,
                        captured.node_id,
                        false,
                        label.as_deref(),
                    ) =>
                {
                    continues.insert((statement.span.start, statement.span.end));
                }
                _ => {}
            }
        }
        let root_span = nodes.kind(statement_root).span();
        roots
            .entry((root_span.start, root_span.end))
            .or_default()
            .push(CapturedLoopMutation {
                loop_span: captured.span,
                insertion_anchor: Span::new(captured.span.start, captured.span.start),
                anchor: Span::new(content_start, content_start),
                dispatch_anchor: Span::new(content_end, content_end),
                bindings: captured.header_bindings,
                helper: reserve_name("_loop", &mut reserved),
                result: reserve_name("_loopResult", &mut reserved),
                label,
                returns,
                breaks,
                continues,
                has_await,
                has_yield,
            });
    }
    (!roots.is_empty()).then_some(roots)
}

/// The iteration statement that has to give `symbol_id` a per-iteration
/// environment, if any.
///
/// A lexical binding declared inside a loop needs one only when a closure built
/// during the iteration outlives it. That means a reference reached through a
/// function boundary — but only a boundary that sits *between* the binding and
/// the loop. A binding declared inside a function that the loop body creates,
/// such as the `let` the parameter and destructuring rewrites hoist into a
/// lowered callback, gets a fresh environment from that call already, and its
/// own function must not be mistaken for the closure that captures it.
fn captured_loop_of(
    nodes: &oxc_semantic::AstNodes<'_>,
    scoping: &oxc_semantic::Scoping,
    symbol_id: SymbolId,
) -> Option<NodeId> {
    if !scoping
        .symbol_flags(symbol_id)
        .contains(SymbolFlags::BlockScopedVariable)
    {
        return None;
    }
    let declaration_id = scoping.symbol_declaration(symbol_id);
    let loop_id = nodes
        .ancestor_ids(declaration_id)
        .find(|node_id| nodes.kind(*node_id).is_iteration_statement())?;
    let barrier = nodes
        .ancestor_ids(declaration_id)
        .find(|node_id| nodes.kind(*node_id).is_function_like());
    scoping
        .get_resolved_reference_ids(symbol_id)
        .iter()
        .any(|reference_id| {
            crosses_function_before(
                nodes,
                scoping.get_reference(*reference_id).node_id(),
                loop_id,
                barrier,
            )
        })
        .then_some(loop_id)
}

fn crosses_function_before(
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: NodeId,
    loop_id: NodeId,
    barrier: Option<NodeId>,
) -> bool {
    let mut crossed = false;
    let reference_span = nodes.kind(node_id).span();
    for ancestor in nodes.ancestor_ids(node_id) {
        if ancestor == loop_id || Some(ancestor) == barrier {
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
    prepare_with_reserved(semantic, std::iter::empty::<&str>())
}

pub(super) fn prepare_with_reserved<'a>(
    semantic: &Semantic<'_>,
    reserved_names: impl IntoIterator<Item = &'a str>,
) -> Result<BlockScopingPlan, &'static str> {
    let scoping = semantic.scoping();
    if has_captured_loop_binding(semantic) {
        return Err("captured-loop-block-scoping-postcondition-failed");
    }
    let mut groups: FxHashMap<(ScopeId, &str), Vec<SymbolId>> = FxHashMap::default();
    let mut used_names: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    used_names.extend(reserved_names.into_iter().map(str::to_owned));
    let mut ancestor_collisions = FxHashSet::default();
    for symbol_id in scoping.symbol_ids() {
        let scope_id = scoping.symbol_scope_id(symbol_id);
        let target_scope = scoping
            .scope_ancestors(scope_id)
            .find(|scope_id| scoping.scope_flags(*scope_id).intersects(ScopeFlags::Var))
            .unwrap_or(scope_id);
        let name = scoping.symbol_name(symbol_id);
        if scoping
            .symbol_flags(symbol_id)
            .contains(SymbolFlags::BlockScopedVariable)
            && scope_id != target_scope
            && scoping
                .scope_parent_id(scope_id)
                .and_then(|parent_scope| scoping.find_binding(parent_scope, name.into()))
                .is_some_and(|visible_symbol| visible_symbol != symbol_id)
        {
            // Lowering a block binding to `var` makes it shadow bindings that
            // were previously visible elsewhere in the containing function.
            ancestor_collisions.insert(symbol_id);
        }
        groups
            .entry((target_scope, name))
            .or_default()
            .push(symbol_id);
    }

    let mut renames = FxHashMap::default();
    for ((_scope_id, name), mut symbols) in groups {
        if symbols.len() < 2 && !symbols.iter().any(|id| ancestor_collisions.contains(id)) {
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
        for (index, symbol_id) in symbols
            .into_iter()
            .enumerate()
            .filter(|(index, symbol_id)| {
                scoping
                    .symbol_flags(*symbol_id)
                    .contains(SymbolFlags::BlockScopedVariable)
                    && (*index > 0 || ancestor_collisions.contains(symbol_id))
            })
        {
            let _ = index;
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

    let binding_renames = renames
        .iter()
        .map(|(symbol_id, replacement)| {
            let span = scoping.symbol_span(*symbol_id);
            (
                (
                    span.start,
                    span.end,
                    scoping.symbol_name(*symbol_id).to_owned(),
                ),
                replacement.clone(),
            )
        })
        .collect();
    let reference_renames = renames
        .iter()
        .flat_map(|(symbol_id, replacement)| {
            scoping
                .get_resolved_reference_ids(*symbol_id)
                .iter()
                .filter_map(|reference_id| {
                    let reference = scoping.get_reference(*reference_id);
                    let AstKind::IdentifierReference(identifier) =
                        semantic.nodes().kind(reference.node_id())
                    else {
                        return None;
                    };
                    Some((
                        (
                            identifier.span.start,
                            identifier.span.end,
                            identifier.name.to_string(),
                        ),
                        replacement.clone(),
                    ))
                })
        })
        .collect();
    Ok(BlockScopingPlan {
        binding_renames,
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

/// Whether any lexical binding still needs the per-iteration environment the
/// structural half of this pass builds. Shares [`captured_loop_of`] with that
/// half so the two halves cannot disagree about what counts as captured; a
/// disagreement would reject the file after the rewrite declined to touch it.
fn has_captured_loop_binding(semantic: &Semantic<'_>) -> bool {
    let scoping = semantic.scoping();
    let nodes = semantic.nodes();
    scoping
        .symbol_ids()
        .any(|symbol_id| captured_loop_of(nodes, scoping, symbol_id).is_some())
}

pub(super) struct BlockScopingPlan {
    binding_renames: FxHashMap<(u32, u32, String), String>,
    reference_renames: FxHashMap<(u32, u32, String), String>,
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
        if let Some(replacement) = self.plan.binding_renames.get(&(
            identifier.span.start,
            identifier.span.end,
            identifier.name.to_string(),
        )) {
            identifier.name = self.allocator.alloc_str(replacement).into();
        }
    }

    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if let Some(replacement) = self.plan.reference_renames.get(&(
            identifier.span.start,
            identifier.span.end,
            identifier.name.to_string(),
        )) {
            identifier.name = self.allocator.alloc_str(replacement).into();
        }
    }
}
