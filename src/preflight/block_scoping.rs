use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, ArrayExpressionElement, AssignmentTarget, AssignmentTargetMaybeDefault,
        AssignmentTargetProperty, BindingIdentifier, ClassElement, Expression, FormalParameterKind,
        FormalParameterRest, IdentifierReference, MethodDefinitionKind, Program, PropertyKey,
        PropertyKind, SimpleAssignmentTarget, Statement, TSThisParameter, TSTypeAnnotation,
        TSTypeParameterDeclaration, TSTypeParameterInstantiation, VariableDeclaration,
        VariableDeclarationKind,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{NodeId, ScopeId, Semantic, SymbolId};
use oxc_span::{GetSpan, Span};
use oxc_syntax::{operator::AssignmentOperator, scope::ScopeFlags, symbol::SymbolFlags};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::inline_helpers::INLINE_READ_ONLY_ERROR_HELPER_DESCRIPTOR;
use crate::preflight::helpers::CustomHelperRequests;

struct CapturedLoop {
    node_id: NodeId,
    body_node_id: NodeId,
    span: Span,
    body_span: Span,
    header_bindings: Vec<String>,
}

struct PendingCapturedLoop {
    captured: CapturedLoop,
    statement_root: NodeId,
    label: Option<String>,
    content_start: u32,
    content_end: u32,
    returns: FxHashSet<(u32, u32)>,
    breaks: FxHashSet<(u32, u32)>,
    continues: FxHashSet<(u32, u32)>,
    has_await: bool,
    has_yield: bool,
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
    let loops = classify_captured_loops(semantic);
    if loops.is_empty() {
        return None;
    }
    let loop_ids: FxHashSet<NodeId> = loops.keys().copied().collect();
    let mut pending = loops
        .into_values()
        .filter(|candidate| {
            !nodes
                .ancestor_ids(candidate.node_id)
                .any(|ancestor| loop_ids.contains(&ancestor))
        })
        .map(|captured| {
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
            let label =
                nodes
                    .ancestor_ids(captured.node_id)
                    .next()
                    .and_then(|parent_id| match nodes.kind(parent_id) {
                        AstKind::LabeledStatement(statement) => {
                            Some(statement.label.name.to_string())
                        }
                        _ => None,
                    });
            let body_is_block =
                source.as_bytes().get(captured.body_span.start as usize) == Some(&b'{');
            let content_start = captured.body_span.start + u32::from(body_is_block);
            let content_end = captured.body_span.end - u32::from(body_is_block);
            PendingCapturedLoop {
                captured,
                statement_root,
                label,
                content_start,
                content_end,
                returns: FxHashSet::default(),
                breaks: FxHashSet::default(),
                continues: FxHashSet::default(),
                has_await: false,
                has_yield: false,
            }
        })
        .collect::<Vec<_>>();
    pending.sort_unstable_by_key(|loop_plan| loop_plan.content_start);
    let mut current = 0;
    let mut active_functions = Vec::<u32>::new();
    let mut active_iterations = Vec::<(NodeId, u32)>::new();
    let mut active_breakables = Vec::<(NodeId, u32)>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let span = node.kind().span();
        while current < pending.len() && span.start >= pending[current].content_end {
            current += 1;
            active_functions.clear();
            active_iterations.clear();
            active_breakables.clear();
        }
        let Some(loop_plan) = pending.get_mut(current) else {
            break;
        };
        if span.start < loop_plan.content_start || span.end > loop_plan.content_end {
            continue;
        }
        while active_functions
            .last()
            .is_some_and(|end| span.start >= *end)
        {
            active_functions.pop();
        }
        while active_iterations
            .last()
            .is_some_and(|(_, end)| span.start >= *end)
        {
            active_iterations.pop();
        }
        while active_breakables
            .last()
            .is_some_and(|(_, end)| span.start >= *end)
        {
            active_breakables.pop();
        }
        if node.kind().is_function_like() {
            active_functions.push(span.end);
            continue;
        }
        if node.kind().is_iteration_statement() {
            active_iterations.push((node_id, span.end));
            active_breakables.push((node_id, span.end));
            continue;
        }
        if matches!(node.kind(), AstKind::SwitchStatement(_)) {
            active_breakables.push((node_id, span.end));
            continue;
        }
        let belongs_to_body = active_functions.is_empty();
        match node.kind() {
            AstKind::AwaitExpression(_) if belongs_to_body => {
                loop_plan.has_await = true;
            }
            AstKind::YieldExpression(_) if belongs_to_body => {
                loop_plan.has_yield = true;
            }
            AstKind::ReturnStatement(statement) if belongs_to_body => {
                loop_plan
                    .returns
                    .insert((statement.span.start, statement.span.end));
            }
            AstKind::BreakStatement(statement)
                if belongs_to_body
                    && statement.label.as_ref().map_or_else(
                        || {
                            active_breakables
                                .last()
                                .is_none_or(|(target, _)| *target == loop_plan.captured.node_id)
                        },
                        |label| loop_plan.label.as_deref() == Some(label.name.as_str()),
                    ) =>
            {
                loop_plan
                    .breaks
                    .insert((statement.span.start, statement.span.end));
            }
            AstKind::ContinueStatement(statement)
                if belongs_to_body
                    && statement.label.as_ref().map_or_else(
                        || {
                            active_iterations
                                .last()
                                .is_none_or(|(target, _)| *target == loop_plan.captured.node_id)
                        },
                        |label| loop_plan.label.as_deref() == Some(label.name.as_str()),
                    ) =>
            {
                loop_plan
                    .continues
                    .insert((statement.span.start, statement.span.end));
            }
            _ => {}
        }
    }
    let mut reserved: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    let mut roots: FxHashMap<(u32, u32), Vec<CapturedLoopMutation>> = FxHashMap::default();
    for loop_plan in pending {
        let PendingCapturedLoop {
            captured,
            statement_root,
            label,
            content_start,
            content_end,
            returns,
            breaks,
            continues,
            has_await,
            has_yield,
        } = loop_plan;
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

/// Classify loop declarations and references by their semantic AST ancestry.
fn classify_captured_loops(semantic: &Semantic<'_>) -> FxHashMap<NodeId, CapturedLoop> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let mut declarations = vec![None::<NodeId>; scoping.symbols_len()];
    let mut loop_facts = FxHashMap::<NodeId, CapturedLoop>::default();
    let mut captured = FxHashSet::<NodeId>::default();

    for (node_id, node) in nodes.iter_enumerated() {
        if node.kind().is_iteration_statement()
            && let Some(body) = loop_body(node.kind())
        {
            loop_facts.insert(
                node_id,
                CapturedLoop {
                    node_id,
                    body_node_id: body.node_id(),
                    span: node.kind().span(),
                    body_span: body.span(),
                    header_bindings: Vec::new(),
                },
            );
        }

        match node.kind() {
            AstKind::BindingIdentifier(identifier) => {
                let Some(symbol_id) = identifier.symbol_id.get() else {
                    continue;
                };
                if !scoping
                    .symbol_flags(symbol_id)
                    .contains(SymbolFlags::BlockScopedVariable)
                {
                    continue;
                }
                // Generated parameter-rest loops reuse source anchors whose spans can overlap
                // later sibling declarations, so AST ancestry must remain authoritative after
                // mutation. Keep associating declarations in nested functions with an enclosing
                // loop: Babel conservatively wraps that loop when a deeper closure captures one.
                let mut child_id = node_id;
                let mut crossed_function = false;
                let Some(loop_id) = nodes.ancestor_ids(node_id).find(|ancestor| {
                    let kind = nodes.kind(*ancestor);
                    if kind.is_iteration_statement() {
                        return true;
                    }
                    crossed_function |= kind.is_function_like();
                    child_id = *ancestor;
                    false
                }) else {
                    continue;
                };
                let loop_fact = loop_facts.get_mut(&loop_id).unwrap();
                let in_body = child_id == loop_fact.body_node_id;
                // A function in the header owns its locals. Moving the loop body
                // cannot move those declarations or turn them into loop parameters.
                if !in_body && crossed_function {
                    continue;
                }
                declarations[symbol_id.index()] = Some(loop_id);
                if !in_body
                    && !loop_fact
                        .header_bindings
                        .iter()
                        .any(|name| name == identifier.name.as_str())
                {
                    loop_fact.header_bindings.push(identifier.name.to_string());
                }
            }
            AstKind::IdentifierReference(identifier) => {
                let Some(reference_id) = identifier.reference_id.get() else {
                    continue;
                };
                let reference = scoping.get_reference(reference_id);
                let Some(symbol_id) = reference.symbol_id() else {
                    continue;
                };
                let Some(loop_id) = declarations[symbol_id.index()] else {
                    continue;
                };
                let mut crossed_boundary = false;
                let mut child_id = node_id;
                for ancestor in nodes.ancestor_ids(node_id) {
                    if ancestor == loop_id {
                        // Only body captures can be repaired by wrapping the body.
                        // Header references survive that rewrite unchanged and would
                        // otherwise cause the captured-loop pass to repeat forever.
                        if crossed_boundary && child_id == loop_facts[&loop_id].body_node_id {
                            captured.insert(loop_id);
                        }
                        break;
                    }
                    let kind = nodes.kind(ancestor);
                    if kind.is_function_like()
                        || matches!(kind, AstKind::PropertyDefinition(property) if !property.r#static)
                    {
                        crossed_boundary = true;
                    }
                    child_id = ancestor;
                }
            }
            _ => {}
        }
    }
    loop_facts.retain(|loop_id, _| captured.contains(loop_id));
    loop_facts
}

fn loop_body(kind: AstKind<'_>) -> Option<&Statement<'_>> {
    match kind {
        AstKind::ForStatement(loop_) => Some(&loop_.body),
        AstKind::ForInStatement(loop_) => Some(&loop_.body),
        AstKind::ForOfStatement(loop_) => Some(&loop_.body),
        AstKind::WhileStatement(loop_) => Some(&loop_.body),
        AstKind::DoWhileStatement(loop_) => Some(&loop_.body),
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
    let unresolved_names = scoping
        .root_unresolved_references()
        .keys()
        .map(|name| name.to_string())
        .collect::<FxHashSet<_>>();
    let scope_preorder = scoping.scope_descendants_from_root().collect::<Vec<_>>();
    let mut scope_index = FxHashMap::default();
    let mut scope_end = FxHashMap::default();
    let mut scope_depth = FxHashMap::default();
    let mut target_scopes = FxHashMap::default();
    for (index, scope_id) in scope_preorder.iter().copied().enumerate() {
        scope_index.insert(scope_id, index);
        scope_end.insert(scope_id, index);
        let depth = scoping
            .scope_parent_id(scope_id)
            .and_then(|parent| scope_depth.get(&parent).copied())
            .map_or(0, |depth| depth + 1);
        scope_depth.insert(scope_id, depth);
        let target_scope = if scoping.scope_flags(scope_id).intersects(ScopeFlags::Var) {
            scope_id
        } else {
            scoping
                .scope_parent_id(scope_id)
                .and_then(|parent| target_scopes.get(&parent).copied())
                .unwrap_or(scope_id)
        };
        target_scopes.insert(scope_id, target_scope);
    }
    for scope_id in scope_preorder.iter().copied().rev() {
        if let Some(parent) = scoping.scope_parent_id(scope_id) {
            let child_end = scope_end[&scope_id];
            scope_end
                .entry(parent)
                .and_modify(|parent_end| *parent_end = (*parent_end).max(child_end));
        }
    }
    let mut ancestor_collisions = FxHashSet::default();
    let mut symbols_by_name = FxHashMap::<&str, Vec<SymbolId>>::default();
    for symbol_id in scoping.symbol_ids() {
        symbols_by_name
            .entry(scoping.symbol_name(symbol_id))
            .or_default()
            .push(symbol_id);
    }
    for symbols in symbols_by_name.values_mut() {
        symbols.sort_unstable_by_key(|symbol_id| {
            (
                scope_index[&scoping.symbol_scope_id(*symbol_id)],
                scoping.symbol_span(*symbol_id).start,
            )
        });
        let mut active = Vec::<(usize, ScopeId)>::new();
        let mut active_targets = FxHashMap::<ScopeId, usize>::default();
        for symbol_id in symbols.iter().copied() {
            let scope_id = scoping.symbol_scope_id(symbol_id);
            let index = scope_index[&scope_id];
            while active.last().is_some_and(|(end, _)| *end < index) {
                let (_, target) = active.pop().unwrap();
                let count = active_targets.get_mut(&target).unwrap();
                *count -= 1;
                if *count == 0 {
                    active_targets.remove(&target);
                }
            }
            let target_scope = target_scopes[&scope_id];
            if scoping
                .symbol_flags(symbol_id)
                .contains(SymbolFlags::BlockScopedVariable)
                && active.len() > active_targets.get(&target_scope).copied().unwrap_or(0)
            {
                ancestor_collisions.insert(symbol_id);
            }
            active.push((scope_end[&scope_id], target_scope));
            *active_targets.entry(target_scope).or_default() += 1;
        }
    }
    for symbol_id in scoping.symbol_ids() {
        let scope_id = scoping.symbol_scope_id(symbol_id);
        let target_scope = target_scopes[&scope_id];
        let name = scoping.symbol_name(symbol_id);
        groups
            .entry((target_scope, name))
            .or_default()
            .push(symbol_id);
    }

    let mut renames = FxHashMap::default();
    let mut next_rename_suffix = FxHashMap::<String, u32>::default();
    for ((_scope_id, name), mut symbols) in groups {
        if symbols.len() < 2
            && !symbols.iter().any(|symbol_id| {
                ancestor_collisions.contains(symbol_id)
                    || unresolved_names.contains(scoping.symbol_name(*symbol_id))
            })
        {
            continue;
        }
        // A function-scoped binding already occupies the name after lowering, so
        // preserve it even when its declaration appears after the lexical one.
        // Otherwise preserve the shallowest lexical binding, matching Babel's
        // choice of the binding that already belongs closest to the var scope.
        symbols.sort_unstable_by_key(|symbol_id| {
            (
                !scoping
                    .symbol_flags(*symbol_id)
                    .contains(SymbolFlags::FunctionScopedVariable),
                scope_depth[&scoping.symbol_scope_id(*symbol_id)],
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
                    && (*index > 0
                        || ancestor_collisions.contains(symbol_id)
                        || unresolved_names.contains(scoping.symbol_name(*symbol_id)))
            })
        {
            let _ = index;
            let base = name.trim_end_matches(|character: char| character.is_ascii_digit());
            let base = if base.is_empty() { name } else { base };
            let suffix = next_rename_suffix.entry(base.to_owned()).or_default();
            let replacement = loop {
                let candidate = if *suffix == 0 {
                    format!("_{base}")
                } else {
                    format!("_{base}{}", *suffix + 1)
                };
                *suffix += 1;
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
    let loop_reset_declarations = collect_loop_reset_declarations(semantic);
    let mut const_write_expressions = FxHashMap::default();
    for symbol_id in scoping.symbol_ids().filter(|symbol_id| {
        scoping
            .symbol_flags(*symbol_id)
            .contains(SymbolFlags::ConstVariable)
    }) {
        for reference_id in scoping.get_resolved_reference_ids(symbol_id) {
            let reference = scoping.get_reference(*reference_id);
            if !reference.is_write() {
                continue;
            }
            let write_expression =
                semantic
                    .nodes()
                    .ancestor_ids(reference.node_id())
                    .find_map(|ancestor| match semantic.nodes().kind(ancestor) {
                        AstKind::AssignmentExpression(expression) => Some((expression.span, false)),
                        AstKind::UpdateExpression(expression) => Some((expression.span, true)),
                        _ => None,
                    });
            match write_expression {
                Some((expression_span, false)) => {
                    let reference_span = semantic.nodes().kind(reference.node_id()).span();
                    if expression_span != reference_span {
                        const_write_expressions.insert(
                            (expression_span.start, expression_span.end),
                            scoping.symbol_name(symbol_id).to_owned(),
                        );
                    }
                }
                Some((expression_span, true)) => {
                    let reference_span = semantic.nodes().kind(reference.node_id()).span();
                    if expression_span != reference_span {
                        const_write_expressions.insert(
                            (expression_span.start, expression_span.end),
                            scoping.symbol_name(symbol_id).to_owned(),
                        );
                    }
                }
                _ => {}
            }
        }
    }
    const_write_expressions.extend(collect_read_only_private_writes(semantic));
    let (read_only_helper, read_only_temp) = if const_write_expressions.is_empty() {
        (None, None)
    } else {
        (
            Some(reserve_name("_readOnlyError", &mut used_names)),
            Some(reserve_name("_readOnlyValue", &mut used_names)),
        )
    };
    Ok(BlockScopingPlan {
        binding_renames,
        reference_renames,
        loop_reset_declarations,
        const_write_expressions,
        read_only_helper,
        read_only_temp,
    })
}

/// Preserve the ECMAScript runtime error for stores to private methods and
/// getter-only private accessors. Hermes V1 keeps private syntax, so this
/// belongs in the active block-scoping pass rather than requiring the disabled
/// private-method transform.
fn collect_read_only_private_writes(semantic: &Semantic<'_>) -> FxHashMap<(u32, u32), String> {
    struct PrivateClass {
        end: u32,
        read_only: FxHashSet<String>,
    }

    let nodes = semantic.nodes();
    let mut writes = FxHashMap::default();
    let mut classes = Vec::<PrivateClass>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let span = node.kind().span();
        while classes.last().is_some_and(|class| span.start >= class.end) {
            classes.pop();
        }
        if let AstKind::Class(class) = node.kind() {
            let setters = class
                .body
                .body
                .iter()
                .filter_map(|element| match element {
                    ClassElement::MethodDefinition(method)
                        if method.kind == MethodDefinitionKind::Set =>
                    {
                        let PropertyKey::PrivateIdentifier(key) = &method.key else {
                            return None;
                        };
                        Some(key.name.to_string())
                    }
                    _ => None,
                })
                .collect::<FxHashSet<_>>();
            let read_only = class
                .body
                .body
                .iter()
                .filter_map(|element| match element {
                    ClassElement::MethodDefinition(method)
                        if method.kind != MethodDefinitionKind::Set =>
                    {
                        let PropertyKey::PrivateIdentifier(key) = &method.key else {
                            return None;
                        };
                        (method.kind != MethodDefinitionKind::Get
                            || !setters.contains(key.name.as_str()))
                        .then(|| key.name.to_string())
                    }
                    _ => None,
                })
                .collect();
            classes.push(PrivateClass {
                end: class.span.end,
                read_only,
            });
            continue;
        }
        let AstKind::PrivateFieldExpression(field) = node.kind() else {
            continue;
        };
        if !classes
            .last()
            .is_some_and(|class| class.read_only.contains(field.field.name.as_str()))
        {
            continue;
        }
        let parent_id = nodes.parent_id(node_id);
        match nodes.kind(parent_id) {
            AstKind::AssignmentExpression(expression)
                if matches!(
                    &expression.left,
                    AssignmentTarget::PrivateFieldExpression(target)
                        if target.span == field.span
                ) =>
            {
                writes.insert(
                    (expression.span.start, expression.span.end),
                    field.field.name.to_string(),
                );
            }
            AstKind::UpdateExpression(expression)
                if matches!(
                    &expression.argument,
                    SimpleAssignmentTarget::PrivateFieldExpression(target)
                        if target.span == field.span
                ) =>
            {
                writes.insert(
                    (expression.span.start, expression.span.end),
                    field.field.name.to_string(),
                );
            }
            _ => {}
        }
    }
    writes
}

/// Find uninitialized lexical declarations that execute repeatedly in loop
/// bodies. Semantic nodes are in source preorder, so each loop/function enters
/// and leaves these stacks once instead of walking ancestors per declaration.
fn collect_loop_reset_declarations(semantic: &Semantic<'_>) -> FxHashSet<(u32, u32)> {
    #[derive(Clone, Copy)]
    struct ActiveLoop {
        end: u32,
        boundary_depth: usize,
    }

    let nodes = semantic.nodes();
    let mut resets = FxHashSet::default();
    let mut pending_loops = Vec::<(u32, ActiveLoop)>::new();
    let mut active_loops = Vec::<ActiveLoop>::new();
    let mut active_boundaries = Vec::<u32>::new();

    for (node_id, node) in nodes.iter_enumerated() {
        let span = node.kind().span();
        while active_loops
            .last()
            .is_some_and(|loop_| span.start >= loop_.end)
        {
            active_loops.pop();
        }
        while active_boundaries
            .last()
            .is_some_and(|end| span.start >= *end)
        {
            active_boundaries.pop();
        }
        while pending_loops
            .last()
            .is_some_and(|(start, _)| span.start >= *start)
        {
            let (_, loop_) = pending_loops.pop().unwrap();
            active_loops.push(loop_);
        }

        if node.kind().is_function_like() {
            active_boundaries.push(span.end);
        }
        if let Some(body) = loop_body(node.kind()) {
            let body_span = body.span();
            pending_loops.push((
                body_span.start,
                ActiveLoop {
                    end: body_span.end,
                    boundary_depth: active_boundaries.len(),
                },
            ));
        }

        let AstKind::VariableDeclarator(declarator) = node.kind() else {
            continue;
        };
        let declaration_id = nodes.parent_id(node_id);
        if declarator.init.is_none()
            && matches!(
                nodes.parent_kind(node_id),
                AstKind::VariableDeclaration(declaration)
                    if matches!(
                        declaration.kind,
                        VariableDeclarationKind::Let | VariableDeclarationKind::Const
                    )
            )
            && !matches!(
                nodes.parent_kind(declaration_id),
                AstKind::ForInStatement(_) | AstKind::ForOfStatement(_)
            )
            && !pending_loops.last().is_some_and(|(body_start, loop_)| {
                span.start < *body_start && loop_.boundary_depth == active_boundaries.len()
            })
            && active_loops
                .last()
                .is_some_and(|loop_| loop_.boundary_depth == active_boundaries.len())
        {
            resets.insert((declarator.span.start, declarator.span.end));
        }
    }
    resets
}

pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: BlockScopingPlan,
    inline_helpers: bool,
) -> CustomHelperRequests {
    let helper_name = plan.read_only_helper.clone();
    let temp_name = plan.read_only_temp.clone();
    BlockScopingLowerer { allocator, plan }.visit_program(program);
    let mut requests = CustomHelperRequests::default();
    if let Some(helper_name) = helper_name {
        let temp_name = temp_name.expect("const writes reserve a temporary");
        requests.reserve_scope_names([temp_name.clone()]);
        requests.push_declaration(format!("var {temp_name};"), format!("var {temp_name};\n"));
        requests.materialize_generated(
            &INLINE_READ_ONLY_ERROR_HELPER_DESCRIPTOR,
            inline_helpers,
            &[("_readOnlyError", &helper_name)],
        );
    }
    requests
}

pub(super) fn has_remaining_syntax(program: &Program<'_>) -> bool {
    let mut detector = RemainingBlockScopingDetector(false);
    detector.visit_program(program);
    detector.0
}

/// Whether any lexical binding still needs the per-iteration environment the
/// structural half of this pass builds. Shares [`classify_captured_loops`] with
/// that half so the two halves cannot disagree about what counts as captured; a
/// disagreement would reject the file after the rewrite declined to touch it.
fn has_captured_loop_binding(semantic: &Semantic<'_>) -> bool {
    !classify_captured_loops(semantic).is_empty()
}

pub(super) struct BlockScopingPlan {
    binding_renames: FxHashMap<(u32, u32, String), String>,
    reference_renames: FxHashMap<(u32, u32, String), String>,
    loop_reset_declarations: FxHashSet<(u32, u32)>,
    const_write_expressions: FxHashMap<(u32, u32), String>,
    read_only_helper: Option<String>,
    read_only_temp: Option<String>,
}

struct BlockScopingLowerer<'a> {
    allocator: &'a Allocator,
    plan: BlockScopingPlan,
}

impl<'a> BlockScopingLowerer<'a> {
    #[expect(deprecated)]
    fn read_only_error(&self, span: Span, name: &str) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let helper = self
            .plan
            .read_only_helper
            .as_deref()
            .expect("const writes reserve a read-only helper");
        ast.expression_call(
            span,
            ast.expression_identifier(span, self.allocator.alloc_str(helper)),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ast.vec1(
                ast.expression_string_literal(span, self.allocator.alloc_str(name), None)
                    .into(),
            ),
            false,
        )
    }

    #[expect(deprecated)]
    fn temp_assignment(&self, span: Span, value: Expression<'a>) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let temp = self
            .plan
            .read_only_temp
            .as_deref()
            .expect("const writes reserve a temporary");
        ast.expression_assignment(
            span,
            AssignmentOperator::Assign,
            ast.simple_assignment_target_assignment_target_identifier(
                span,
                self.allocator.alloc_str(temp),
            )
            .into(),
            value,
        )
    }

    #[expect(deprecated)]
    fn temp_target(&self, span: Span) -> AssignmentTarget<'a> {
        AstBuilder::new(self.allocator)
            .simple_assignment_target_assignment_target_identifier(
                span,
                self.allocator.alloc_str(
                    self.plan
                        .read_only_temp
                        .as_deref()
                        .expect("const writes reserve a temporary"),
                ),
            )
            .into()
    }

    #[expect(deprecated)]
    fn target_read(&self, target: &AssignmentTarget<'a>) -> Option<Expression<'a>> {
        let ast = AstBuilder::new(self.allocator);
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                Some(ast.expression_identifier(identifier.span, identifier.name))
            }
            AssignmentTarget::PrivateFieldExpression(field) => Some(
                Expression::PrivateFieldExpression(field.clone_in(self.allocator)),
            ),
            _ => None,
        }
    }

    fn private_target_base(&self, target: &AssignmentTarget<'a>) -> Option<Expression<'a>> {
        match target {
            AssignmentTarget::PrivateFieldExpression(field) => {
                Some(field.object.clone_in(self.allocator))
            }
            _ => None,
        }
    }

    #[expect(deprecated)]
    fn sequence(&self, span: Span, expressions: ArenaVec<'a, Expression<'a>>) -> Expression<'a> {
        AstBuilder::new(self.allocator).expression_sequence(span, expressions)
    }
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
    #[expect(deprecated)]
    fn visit_assignment_target_property(&mut self, property: &mut AssignmentTargetProperty<'a>) {
        let AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(shorthand) = property
        else {
            walk_mut::walk_assignment_target_property(self, property);
            return;
        };
        let key = (
            shorthand.binding.span.start,
            shorthand.binding.span.end,
            shorthand.binding.name.to_string(),
        );
        let Some(replacement) = self.plan.reference_renames.get(&key) else {
            walk_mut::walk_assignment_target_property(self, property);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let span = shorthand.span;
        let original_name = shorthand.binding.name;
        let target = ast.simple_assignment_target_assignment_target_identifier(
            shorthand.binding.span,
            self.allocator.alloc_str(replacement),
        );
        let binding = if let Some(mut init) = shorthand.init.take() {
            self.visit_expression(&mut init);
            ast.assignment_target_maybe_default_assignment_target_with_default(
                span,
                AssignmentTarget::from(target),
                init,
            )
        } else {
            AssignmentTargetMaybeDefault::from(target)
        };
        *property = ast.assignment_target_property_assignment_target_property_property(
            span,
            ast.property_key_static_identifier(span, original_name),
            binding,
            false,
        );
    }

    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let span = expression.span();
        let Some(name) = self
            .plan
            .const_write_expressions
            .get(&(span.start, span.end))
            .cloned()
        else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        walk_mut::walk_expression(self, expression);
        let ast = AstBuilder::new(self.allocator);
        let old = expression.take_in(&ast);
        match old {
            Expression::AssignmentExpression(assignment) => {
                let mut assignment = assignment.unbox();
                let read = self.target_read(&assignment.left);
                let error = self.read_only_error(span, &name);
                if assignment.operator == AssignmentOperator::Assign {
                    let mut expressions = ArenaVec::new_in(&ast);
                    if let Some(base) = self.private_target_base(&assignment.left) {
                        expressions.push(base);
                    }
                    expressions.push(assignment.right);
                    expressions.push(error);
                    *expression = self.sequence(span, expressions);
                    return;
                }
                let Some(read) = read else {
                    *expression =
                        Expression::AssignmentExpression(ArenaBox::new_in(assignment, &ast));
                    return;
                };
                let init = self.temp_assignment(span, read);
                assignment.left = self.temp_target(span);
                if matches!(
                    assignment.operator,
                    AssignmentOperator::LogicalOr
                        | AssignmentOperator::LogicalAnd
                        | AssignmentOperator::LogicalNullish
                ) {
                    let mut right = ArenaVec::new_in(&ast);
                    right.push(assignment.right);
                    right.push(error);
                    assignment.right = self.sequence(span, right);
                    let mut expressions = ArenaVec::new_in(&ast);
                    expressions.push(init);
                    expressions.push(Expression::AssignmentExpression(ArenaBox::new_in(
                        assignment, &ast,
                    )));
                    *expression = self.sequence(span, expressions);
                } else {
                    let mut expressions = ArenaVec::new_in(&ast);
                    expressions.push(init);
                    expressions.push(Expression::AssignmentExpression(ArenaBox::new_in(
                        assignment, &ast,
                    )));
                    expressions.push(error);
                    *expression = self.sequence(span, expressions);
                }
            }
            Expression::UpdateExpression(update) => {
                let mut update = update.unbox();
                let read = match &update.argument {
                    SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                        ast.expression_identifier(identifier.span, identifier.name)
                    }
                    SimpleAssignmentTarget::PrivateFieldExpression(field) => {
                        Expression::PrivateFieldExpression(field.clone_in(self.allocator))
                    }
                    _ => {
                        *expression = Expression::UpdateExpression(ArenaBox::new_in(update, &ast));
                        return;
                    }
                };
                let init = self.temp_assignment(span, read);
                update.argument = SimpleAssignmentTarget::try_from(self.temp_target(span))
                    .expect("generated temporary is a simple assignment target");
                let mut expressions = ArenaVec::new_in(&ast);
                expressions.push(init);
                expressions.push(Expression::UpdateExpression(ArenaBox::new_in(update, &ast)));
                expressions.push(self.read_only_error(span, &name));
                *expression = self.sequence(span, expressions);
            }
            other => *expression = other,
        }
    }

    #[expect(deprecated)]
    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        if matches!(
            declaration.kind,
            VariableDeclarationKind::Let | VariableDeclarationKind::Const
        ) {
            for declarator in &mut declaration.declarations {
                if declarator.init.is_none()
                    && self
                        .plan
                        .loop_reset_declarations
                        .contains(&(declarator.span.start, declarator.span.end))
                {
                    let span = declarator.span;
                    let ast = AstBuilder::new(self.allocator);
                    declarator.init = Some(ast.expression_unary(
                        span,
                        oxc_syntax::operator::UnaryOperator::Void,
                        ast.expression_numeric_literal(
                            span,
                            0.0,
                            None,
                            oxc_ast::ast::NumberBase::Decimal,
                        ),
                    ));
                }
            }
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

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    #[test]
    fn captured_loop_classifies_all_siblings() {
        let source = (0..128)
            .map(|index| {
                format!("for(let i{index}=0;i{index}<1;i{index}++){{queue(()=>i{index});}}")
            })
            .collect::<String>();
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let loops = classify_captured_loops(&semantic.semantic);
        assert_eq!(loops.len(), 128);
    }

    #[test]
    fn captured_loop_ignores_header_function_locals_and_references() {
        for source in [
            "for (const t of (u => { const r = u; return r; })(o)) void 0;",
            "for (const t in (() => { const r = o; return r; })()) void 0;",
            "for (let i = (() => { const r = 0; return r; })(); i < 3; i++) void 0;",
            "for (let i = 0; (() => i)() < 3; i++) void 0;",
            "for (let i = 0; i < 3; (() => i++)()) void 0;",
            "while ((() => { const r = false; return r; })()) void 0;",
            "do {} while ((() => { const r = false; return r; })());",
        ] {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            assert!(
                classify_captured_loops(&semantic.semantic).is_empty(),
                "{source}"
            );
        }
    }

    #[test]
    fn captured_loop_header_parameters_exclude_iterable_function_locals() {
        let source = "for (const t of (u => { const r = u; return r; })(o)) queue(() => t);";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let loops = classify_captured_loops(&semantic.semantic);
        assert_eq!(loops.len(), 1);
        assert_eq!(loops.values().next().unwrap().header_bindings, ["t"]);
    }

    #[test]
    fn resets_uninitialized_lexical_declarations_in_loop_bodies_only() {
        let source = "for (;;) { let bodyValue; for (let headerValue of values) use(headerValue); const nested = () => { let functionValue; }; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare(&semantic.semantic).unwrap();
        assert_eq!(plan.loop_reset_declarations.len(), 1);
        let &(start, end) = plan.loop_reset_declarations.iter().next().unwrap();
        assert_eq!(&source[start as usize..end as usize], "bodyValue");
    }

    #[test]
    fn loop_reset_scan_handles_many_declarations_below_deep_blocks() {
        let depth = 128;
        let declarations = 1_024;
        let source = format!(
            "for (;;) {{{}{}{}}}",
            "{".repeat(depth),
            (0..declarations)
                .map(|index| format!("let value{index};"))
                .collect::<String>(),
            "}".repeat(depth),
        );
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        assert_eq!(
            collect_loop_reset_declarations(&semantic.semantic).len(),
            declarations
        );
    }

    #[test]
    fn renames_bindings_that_would_capture_outer_or_unresolved_references() {
        let source = "{ const leaked = 1; } typeof leaked; function outer(value) { return () => { if (true) { const value = 2; } return value; }; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare(&semantic.semantic).unwrap();
        let renames = plan
            .binding_renames
            .values()
            .map(String::as_str)
            .collect::<FxHashSet<_>>();
        assert!(renames.contains("_leaked"));
        assert!(renames.contains("_value"));
    }
}
