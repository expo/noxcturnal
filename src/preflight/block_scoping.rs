use oxc_allocator::GetAllocator;
use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::builder::GetAstBuilder;
use oxc_ast::{
    AstKind,
    ast::{
        Argument, ArrayExpressionElement, AssignmentTarget, AssignmentTargetMaybeDefault,
        AssignmentTargetProperty, BindingIdentifier, ClassElement, Expression, FormalParameterKind,
        FormalParameterRest, IdentifierReference, MethodDefinitionKind, Program, PropertyKey,
        PropertyKind, SimpleAssignmentTarget, Statement, TSThisParameter, TSTypeAnnotation,
        TSTypeParameterDeclaration, TSTypeParameterInstantiation, VariableDeclaration,
        VariableDeclarationKind,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{NodeId, ScopeId, Semantic, SymbolId};
use oxc_span::{GetSpan, Span};
use oxc_syntax::{
    operator::AssignmentOperator, reference::ReferenceId, scope::ScopeFlags, symbol::SymbolFlags,
};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::inline_helpers::INLINE_READ_ONLY_ERROR_HELPER_DESCRIPTOR;
use crate::preflight::helpers::CustomHelperRequests;

mod body;
mod header;

struct HeaderBinding {
    name: String,
    is_const: bool,
    // Extraction must retain const write errors instead of making this a writable parameter.
    protect_writes: bool,
    parameter_alias: Option<String>,
}

struct CapturedLoop {
    node_id: NodeId,
    body_node_id: NodeId,
    span: Span,
    body_span: Span,
    header_bindings: Vec<HeaderBinding>,
    body_capture: bool,
    header_capture: bool,
    init_capture: bool,
}

struct PendingCapturedLoop {
    captured: CapturedLoop,
    statement_root: NodeId,
    exit_labels: FxHashMap<NodeId, String>,
    content_start: u32,
    content_end: u32,
    returns: FxHashSet<NodeId>,
    breaks: FxHashSet<NodeId>,
    continues: FxHashSet<NodeId>,
    has_await: bool,
    has_yield: bool,
    has_finally: bool,
    has_yielding_finally: bool,
    arguments_references: FxHashSet<NodeId>,
    local_var_declarations: Vec<NodeId>,
}

pub(super) struct CapturedLoopAstPlan {
    roots: FxHashMap<NodeId, Vec<CapturedLoopMutation>>,
}

struct CapturedLoopMutation {
    extract_body: bool,
    loop_id: NodeId,
    insertion_anchor: Span,
    anchor: Span,
    dispatch_anchor: Span,
    bindings: Vec<HeaderBinding>,
    helper: String,
    result: String,
    record: Option<String>,
    exit_labels: FxHashMap<NodeId, String>,
    returns: FxHashSet<NodeId>,
    breaks: FxHashSet<NodeId>,
    continues: FxHashSet<NodeId>,
    has_await: bool,
    has_yield: bool,
    defer_bindings: bool,
    arguments_alias: Option<String>,
    arguments_references: FxHashSet<NodeId>,
    local_var_declarations: Vec<NodeId>,
    header: Option<header::Plan>,
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
    roots: FxHashMap<NodeId, Vec<CapturedLoopMutation>>,
    changed: bool,
    error: Option<&'static str>,
}

impl<'a> CapturedLoopAstLowerer<'a> {
    fn lower_root(&mut self, root: &mut Statement<'a>) -> Option<ArenaVec<'a, Statement<'a>>> {
        let mut mutations = self.roots.remove(&root.node_id())?;
        mutations.sort_unstable_by_key(|mutation| std::cmp::Reverse(mutation.loop_id.index()));
        let mut helpers = ArenaVec::new_in(&self.allocator);
        for mutation in mutations {
            match mutate_captured_loop(self.allocator, root, mutation) {
                Ok(mut generated) => helpers.append(&mut generated),
                Err(error) => {
                    self.error = Some(error);
                    return None;
                }
            }
        }
        self.changed = true;
        Some(helpers)
    }
}

impl<'a> VisitMut<'a> for CapturedLoopAstLowerer<'a> {
    fn visit_statements(&mut self, statements: &mut ArenaVec<'a, Statement<'a>>) {
        let mut index = 0;
        while index < statements.len() {
            if let Some(helpers) = self.lower_root(&mut statements[index]) {
                let count = helpers.len();
                statements.splice(index..index, helpers);
                index += count + 1;
            } else {
                self.visit_statement(&mut statements[index]);
                index += 1;
            }
            if self.error.is_some() {
                return;
            }
        }
    }

    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        if let Some(mut helpers) = self.lower_root(statement) {
            if !helpers.is_empty() {
                let ast = AstBuilder::new(self.allocator);
                let span = statement.span();
                helpers.push(statement.take_in(&ast));
                *statement = Statement::new_block_statement(span, helpers, &ast);
            }
        } else if self.error.is_none() {
            walk_mut::walk_statement(self, statement);
        }
    }
}

fn mutate_captured_loop<'a>(
    allocator: &'a Allocator,
    root: &mut Statement<'a>,
    mutation: CapturedLoopMutation,
) -> Result<ArenaVec<'a, Statement<'a>>, &'static str> {
    let ast = AstBuilder::new(allocator);
    let insertion_anchor = mutation.insertion_anchor;
    let header_expressions = mutation.header.as_ref().map(|plan| {
        header::prepare(
            AstBuilder::new(allocator),
            root,
            mutation.loop_id,
            &mutation.bindings,
            plan,
        )
    });
    if !mutation.extract_body {
        return Ok(oxc_allocator::Vec::new_in(ast.builder()));
    }
    let dispatch = captured_loop_dispatch(&ast, &mutation);
    let mut mover = CapturedLoopBodyMover {
        ast: AstBuilder::new(allocator),
        mutation: &mutation,
        replacement: Some(dispatch),
        moved: None,
    };
    mover.visit_statement(root);
    let Some(body) = mover.moved else {
        return Err("captured-loop-ast-target-missing");
    };
    let mut helper_body = match body {
        Statement::BlockStatement(block)
            if mutation.header.is_none()
                && !mutation
                    .bindings
                    .iter()
                    .any(|binding| binding.protect_writes) =>
        {
            block.unbox().body
        }
        statement => {
            let mut statements = ArenaVec::new_in(&allocator);
            statements.push(statement);
            statements
        }
    };
    if let Some((test, update)) = header_expressions {
        let plan = mutation.header.as_ref().unwrap();
        if let Some(test) = test {
            helper_body.insert(
                0,
                oxc_ast::ast::Statement::new_if_statement(
                    mutation.anchor,
                    oxc_ast::ast::Expression::new_unary_expression(
                        mutation.anchor,
                        oxc_syntax::operator::UnaryOperator::LogicalNot,
                        test,
                        ast.builder(),
                    ),
                    oxc_ast::ast::Statement::new_return_statement(
                        mutation.anchor,
                        Some(captured_loop_result(
                            &ast,
                            &mutation,
                            mutation.anchor,
                            "break",
                            None,
                        )),
                        ast.builder(),
                    ),
                    None,
                    ast.builder(),
                ),
            );
        }
        if let Some(update) = update {
            helper_body.insert(
                0,
                oxc_ast::ast::Statement::new_if_statement(
                    mutation.anchor,
                    oxc_ast::ast::Expression::new_unary_expression(
                        mutation.anchor,
                        oxc_syntax::operator::UnaryOperator::LogicalNot,
                        oxc_ast::ast::Expression::new_identifier(
                            mutation.anchor,
                            allocator.alloc_str(plan.first.as_ref().expect("relocated update")),
                            ast.builder(),
                        ),
                        ast.builder(),
                    ),
                    oxc_ast::ast::Statement::new_expression_statement(
                        mutation.anchor,
                        update,
                        ast.builder(),
                    ),
                    None,
                    ast.builder(),
                ),
            );
        }
    }
    let hoisted = body::rewrite(AstBuilder::new(allocator), &mut helper_body, &mutation);
    for binding in mutation.bindings.iter().rev() {
        if let Some(parameter) = &binding.parameter_alias {
            helper_body.insert(
                0,
                binding_declaration(
                    AstBuilder::new(ast.allocator()),
                    mutation.anchor,
                    VariableDeclarationKind::Const,
                    &binding.name,
                    Some(oxc_ast::ast::Expression::new_identifier(
                        mutation.anchor,
                        allocator.alloc_str(parameter),
                        ast.builder(),
                    )),
                ),
            );
        }
    }
    helper_body.push(oxc_ast::ast::Statement::new_return_statement(
        mutation.anchor,
        Some(captured_loop_result(
            &ast,
            &mutation,
            mutation.anchor,
            "normal",
            None,
        )),
        ast.builder(),
    ));
    let function_body = oxc_ast::ast::FunctionBody::boxed(
        mutation.anchor,
        ArenaVec::new_in(&allocator),
        helper_body,
        ast.builder(),
    );
    let mut parameters = ArenaVec::new_in(&allocator);
    for alias in mutation
        .bindings
        .iter()
        .map(|binding| binding.parameter_alias.as_ref().unwrap_or(&binding.name))
        .chain(mutation.arguments_alias.iter())
        .chain(
            mutation
                .header
                .iter()
                .filter_map(|plan| plan.first.as_ref()),
        )
    {
        parameters.push(oxc_ast::ast::FormalParameter::new(
            mutation.anchor,
            oxc_allocator::Vec::new_in(ast.builder()),
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                mutation.anchor,
                allocator.alloc_str(alias),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
            ast.builder(),
        ));
    }
    let parameters = oxc_ast::ast::FormalParameters::boxed(
        mutation.anchor,
        FormalParameterKind::FormalParameter,
        parameters,
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ast.builder(),
    );
    let helper_expression = if mutation.has_yield {
        oxc_ast::ast::Expression::new_function_expression(
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
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_arrow_function_expression(
            mutation.anchor,
            mutation.has_await,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            parameters,
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            oxc_ast::ast::ArrowFunctionBody::FunctionBody(function_body),
            ast.builder(),
        )
    };
    let mut generated = ArenaVec::new_in(&allocator);
    for name in hoisted {
        generated.push(binding_declaration(
            AstBuilder::new(ast.allocator()),
            insertion_anchor,
            VariableDeclarationKind::Var,
            &name,
            None,
        ));
    }
    if let Some(record) = &mutation.record {
        generated.push(binding_declaration(
            AstBuilder::new(ast.allocator()),
            insertion_anchor,
            VariableDeclarationKind::Var,
            record,
            None,
        ));
    }
    generated.push(binding_declaration(
        AstBuilder::new(ast.allocator()),
        insertion_anchor,
        VariableDeclarationKind::Var,
        &mutation.result,
        None,
    ));
    generated.push(binding_declaration(
        AstBuilder::new(ast.allocator()),
        insertion_anchor,
        VariableDeclarationKind::Var,
        &mutation.helper,
        Some(helper_expression),
    ));
    Ok(generated)
}

fn binding_declaration<'a>(
    ast: AstBuilder<'a>,
    span: Span,
    kind: VariableDeclarationKind,
    name: &str,
    init: Option<Expression<'a>>,
) -> Statement<'a> {
    Statement::VariableDeclaration(oxc_ast::ast::VariableDeclaration::boxed(
        span,
        kind,
        oxc_allocator::Vec::from_array_in(
            [oxc_ast::ast::VariableDeclarator::new(
                span,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    span,
                    ast.allocator().alloc_str(name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                init,
                false,
                ast.builder(),
            )],
            ast.builder(),
        ),
        false,
        ast.builder(),
    ))
}

struct ArgumentsRewriter<'a, 'p> {
    alias: &'p str,
    references: &'p FxHashSet<NodeId>,
    ast: AstBuilder<'a>,
}

impl<'a> VisitMut<'a> for ArgumentsRewriter<'a, '_> {
    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if self.references.contains(&identifier.node_id.get()) {
            identifier.name = self.ast.allocator().alloc_str(self.alias).into();
        }
    }
}

struct CapturedLoopBodyMover<'a, 'p> {
    ast: AstBuilder<'a>,
    mutation: &'p CapturedLoopMutation,
    replacement: Option<Statement<'a>>,
    moved: Option<Statement<'a>>,
}

impl<'a> VisitMut<'a> for CapturedLoopBodyMover<'a, '_> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        if statement.node_id() == self.mutation.loop_id {
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

fn captured_loop_result<'a>(
    ast: &AstBuilder<'a>,
    mutation: &CapturedLoopMutation,
    span: Span,
    kind: &str,
    value: Option<Expression<'a>>,
) -> Expression<'a> {
    let mut properties = ArenaVec::new_in(ast);
    properties.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        span,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(span, "type", ast.builder()),
        oxc_ast::ast::Expression::new_string_literal(
            span,
            ast.allocator().alloc_str(kind),
            None,
            ast.builder(),
        ),
        false,
        false,
        false,
        ast.builder(),
    ));
    if let Some(value) = value {
        properties.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            span,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(span, "value", ast.builder()),
            value,
            false,
            false,
            false,
            ast.builder(),
        ));
    }
    let mut elements = ArenaVec::new_in(ast);
    for binding in &mutation.bindings {
        elements.push(ArrayExpressionElement::from(
            oxc_ast::ast::Expression::new_identifier(
                span,
                ast.allocator().alloc_str(&binding.name),
                ast.builder(),
            ),
        ));
    }
    let mut vars = oxc_ast::ast::Expression::new_array_expression(span, elements, ast.builder());
    if mutation.defer_bindings {
        vars = oxc_ast::ast::Expression::new_arrow_function_expression(
            span,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                span,
                FormalParameterKind::ArrowFormalParameters,
                oxc_allocator::Vec::new_in(ast.builder()),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            {
                let mut body = oxc_ast::ast::FunctionBody::boxed(
                    span,
                    oxc_allocator::Vec::new_in(ast.builder()),
                    oxc_allocator::Vec::from_array_in(
                        [oxc_ast::ast::Statement::new_expression_statement(
                            span,
                            vars,
                            ast.builder(),
                        )],
                        ast.builder(),
                    ),
                    ast.builder(),
                )
                .unbox();
                let Statement::ExpressionStatement(statement) = body.statements.remove(0) else {
                    unreachable!("generated concise arrow has one expression")
                };
                oxc_ast::ast::ArrowFunctionBody::from(statement.unbox().expression)
            },
            ast.builder(),
        );
    }
    properties.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        span,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(span, "vars", ast.builder()),
        vars,
        false,
        false,
        false,
        ast.builder(),
    ));
    let record = oxc_ast::ast::Expression::new_object_expression(span, properties, ast.builder());
    if let Some(name) = &mutation.record {
        oxc_ast::ast::Expression::new_assignment_expression(
            span,
            AssignmentOperator::Assign,
            oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                span,
                ast.allocator().alloc_str(name),
                ast.builder(),
            )
            .into(),
            record,
            ast.builder(),
        )
    } else {
        record
    }
}

fn captured_loop_dispatch<'a>(
    ast: &AstBuilder<'a>,
    mutation: &CapturedLoopMutation,
) -> Statement<'a> {
    let anchor = mutation.dispatch_anchor;
    let mut call_arguments = ArenaVec::new_in(ast);
    for binding in &mutation.bindings {
        call_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(&binding.name),
            ast.builder(),
        )));
    }
    if mutation.arguments_alias.is_some() {
        call_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
            anchor,
            "arguments",
            ast.builder(),
        )));
    }
    if let Some(first) = mutation
        .header
        .as_ref()
        .and_then(|plan| plan.first.as_ref())
    {
        call_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(first),
            ast.builder(),
        )));
    }
    let mut call = if mutation.has_yield {
        call_arguments.insert(
            0,
            Argument::from(oxc_ast::ast::Expression::new_this_expression(
                anchor,
                ast.builder(),
            )),
        );
        oxc_ast::ast::Expression::new_call_expression(
            anchor,
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    anchor,
                    oxc_ast::ast::Expression::new_identifier(
                        anchor,
                        ast.allocator().alloc_str(&mutation.helper),
                        ast.builder(),
                    ),
                    oxc_ast::ast::IdentifierName::new(anchor, "call", ast.builder()),
                    false,
                    ast.builder(),
                ),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            call_arguments,
            false,
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_call_expression(
            anchor,
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(&mutation.helper),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            call_arguments,
            false,
            ast.builder(),
        )
    };
    call = if mutation.has_yield {
        oxc_ast::ast::Expression::new_yield_expression(anchor, true, Some(call), ast.builder())
    } else if mutation.has_await {
        oxc_ast::ast::Expression::new_await_expression(anchor, call, ast.builder())
    } else {
        call
    };
    let assignment = oxc_ast::ast::Expression::new_assignment_expression(
        anchor,
        oxc_syntax::operator::AssignmentOperator::Assign,
        oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            anchor,
            ast.allocator().alloc_str(&mutation.result),
            ast.builder(),
        )
        .into(),
        call,
        ast.builder(),
    );
    let mut body = ArenaVec::new_in(ast);
    if let Some(record) = &mutation.record {
        // A delegated external return can complete after yielding in finally.
        // Only records created by this helper may be decoded; caller values can
        // be null, primitives, or proxies with arbitrary property traps.
        body.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            oxc_ast::ast::Expression::new_assignment_expression(
                anchor,
                AssignmentOperator::Assign,
                oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                    anchor,
                    ast.allocator().alloc_str(record),
                    ast.builder(),
                )
                .into(),
                oxc_ast::ast::Expression::new_null_literal(anchor, ast.builder()),
                ast.builder(),
            ),
            ast.builder(),
        ));
    }
    body.push(oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        assignment,
        ast.builder(),
    ));
    if let Some(record) = &mutation.record {
        let record_ref = || {
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(record),
                ast.builder(),
            )
        };
        let result_ref = || {
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(&mutation.result),
                ast.builder(),
            )
        };
        let test = oxc_ast::ast::Expression::new_logical_expression(
            anchor,
            oxc_ast::ast::Expression::new_unary_expression(
                anchor,
                oxc_syntax::operator::UnaryOperator::LogicalNot,
                record_ref(),
                ast.builder(),
            ),
            oxc_syntax::operator::LogicalOperator::Or,
            oxc_ast::ast::Expression::new_binary_expression(
                anchor,
                result_ref(),
                oxc_syntax::operator::BinaryOperator::StrictInequality,
                record_ref(),
                ast.builder(),
            ),
            ast.builder(),
        );
        body.push(oxc_ast::ast::Statement::new_if_statement(
            anchor,
            test,
            oxc_ast::ast::Statement::new_return_statement(
                anchor,
                Some(result_ref()),
                ast.builder(),
            ),
            None,
            ast.builder(),
        ));
    }
    let result_vars = || {
        oxc_ast::ast::MemberExpression::new_static_member_expression(
            anchor,
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(&mutation.result),
                ast.builder(),
            ),
            oxc_ast::ast::IdentifierName::new(anchor, "vars", ast.builder()),
            false,
            ast.builder(),
        )
    };
    if mutation.defer_bindings {
        body.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            oxc_ast::ast::Expression::new_assignment_expression(
                anchor,
                AssignmentOperator::Assign,
                AssignmentTarget::from(result_vars()),
                oxc_ast::ast::Expression::new_call_expression(
                    anchor,
                    Expression::from(result_vars()),
                    None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                    oxc_allocator::Vec::new_in(ast.builder()),
                    false,
                    ast.builder(),
                ),
                ast.builder(),
            ),
            ast.builder(),
        ));
    }
    for (index, binding) in mutation.bindings.iter().enumerate() {
        // Immutable loop bindings never need copy-back. These generated writes
        // must not rely on source spans to escape const-write protection.
        if binding.is_const {
            continue;
        }
        let target = oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            anchor,
            ast.allocator().alloc_str(&binding.name),
            ast.builder(),
        );
        let value = Expression::from(
            oxc_ast::ast::MemberExpression::new_computed_member_expression(
                anchor,
                Expression::from(result_vars()),
                oxc_ast::ast::Expression::new_numeric_literal(
                    anchor,
                    index as f64,
                    None,
                    oxc_ast::ast::NumberBase::Decimal,
                    ast.builder(),
                ),
                false,
                ast.builder(),
            ),
        );
        body.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            oxc_ast::ast::Expression::new_assignment_expression(
                anchor,
                oxc_syntax::operator::AssignmentOperator::Assign,
                target.into(),
                value,
                ast.builder(),
            ),
            ast.builder(),
        ));
    }
    let mut exits = Vec::new();
    if !mutation.returns.is_empty() {
        exits.push(("return", None));
    }
    if mutation
        .header
        .as_ref()
        .is_some_and(|plan| plan.first.is_some())
    {
        // Relocated tests emit their completion directly; no AST node to match.
        exits.push(("break", None));
    }
    for (kind, spans) in [
        ("break", &mutation.breaks),
        ("continue", &mutation.continues),
    ] {
        let mut labels = spans
            .iter()
            .map(|span| mutation.exit_labels.get(span).map(String::as_str))
            .collect::<Vec<_>>();
        labels.sort_unstable();
        labels.dedup();
        exits.extend(labels.into_iter().map(|label| (kind, label)));
    }
    let mut seen_exits = FxHashSet::default();
    for (kind, label) in exits {
        if !seen_exits.insert((kind, label)) {
            continue;
        }
        let tag = label.map_or_else(|| kind.to_owned(), |label| format!("{kind}:{label}"));
        let result_type = Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                oxc_ast::ast::Expression::new_identifier(
                    anchor,
                    ast.allocator().alloc_str(&mutation.result),
                    ast.builder(),
                ),
                oxc_ast::ast::IdentifierName::new(anchor, "type", ast.builder()),
                false,
                ast.builder(),
            ),
        );
        let test = oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            result_type,
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            oxc_ast::ast::Expression::new_string_literal(
                anchor,
                ast.allocator().alloc_str(&tag),
                None,
                ast.builder(),
            ),
            ast.builder(),
        );
        let consequent = match kind {
            "return" => oxc_ast::ast::Statement::new_return_statement(
                anchor,
                Some(Expression::from(
                    oxc_ast::ast::MemberExpression::new_static_member_expression(
                        anchor,
                        oxc_ast::ast::Expression::new_identifier(
                            anchor,
                            ast.allocator().alloc_str(&mutation.result),
                            ast.builder(),
                        ),
                        oxc_ast::ast::IdentifierName::new(anchor, "value", ast.builder()),
                        false,
                        ast.builder(),
                    ),
                )),
                ast.builder(),
            ),
            "break" => oxc_ast::ast::Statement::new_break_statement(
                anchor,
                label.map(|label| {
                    oxc_ast::ast::LabelIdentifier::new(
                        anchor,
                        ast.allocator().alloc_str(label),
                        ast.builder(),
                    )
                }),
                ast.builder(),
            ),
            _ => oxc_ast::ast::Statement::new_continue_statement(
                anchor,
                label.map(|label| {
                    oxc_ast::ast::LabelIdentifier::new(
                        anchor,
                        ast.allocator().alloc_str(label),
                        ast.builder(),
                    )
                }),
                ast.builder(),
            ),
        };
        body.push(oxc_ast::ast::Statement::new_if_statement(
            anchor,
            test,
            consequent,
            None,
            ast.builder(),
        ));
    }
    oxc_ast::ast::Statement::new_block_statement(anchor, body, ast.builder())
}

fn captured_loop_mutations(
    _source: &str,
    semantic: &Semantic<'_>,
) -> Option<FxHashMap<NodeId, Vec<CapturedLoopMutation>>> {
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
            // Prefix the complete label chain at this exact statement slot.
            // Crossing an enclosing single-statement body loses its environment.
            for ancestor in nodes.ancestor_ids(captured.node_id) {
                if !matches!(nodes.kind(ancestor), AstKind::LabeledStatement(label)
                    if label.body.node_id() == statement_root)
                {
                    break;
                }
                statement_root = ancestor;
            }
            let body_is_block = matches!(
                nodes.kind(captured.body_node_id),
                AstKind::BlockStatement(_)
            );
            let content_start = captured
                .body_span
                .start
                .saturating_add(u32::from(body_is_block))
                .min(captured.body_span.end);
            let content_end = captured
                .body_span
                .end
                .saturating_sub(u32::from(body_is_block))
                .max(content_start);
            let local_var_declarations = if captured.body_capture || captured.header_capture {
                body::local_declarations(semantic, captured.body_node_id)
            } else {
                Vec::new()
            };
            PendingCapturedLoop {
                captured,
                statement_root,
                exit_labels: FxHashMap::default(),
                content_start,
                content_end,
                returns: FxHashSet::default(),
                breaks: FxHashSet::default(),
                continues: FxHashSet::default(),
                has_await: false,
                has_yield: false,
                has_finally: false,
                has_yielding_finally: false,
                arguments_references: FxHashSet::default(),
                local_var_declarations,
            }
        })
        .collect::<Vec<_>>();
    pending.sort_unstable_by_key(|plan| plan.captured.node_id.index());
    // Regions are the subtrees moved into helpers, including relocated headers.
    // Semantic preorder follows the live AST, whose spans may overlap or run
    // backwards after an earlier transform.
    let mut regions = FxHashMap::default();
    for (index, plan) in pending.iter().enumerate() {
        if !(plan.captured.body_capture || plan.captured.header_capture) {
            continue;
        }
        regions.insert(plan.captured.body_node_id, index);
        if plan.captured.header_capture
            && let AstKind::ForStatement(statement) = nodes.kind(plan.captured.node_id)
        {
            for expression in statement.test.iter().chain(statement.update.iter()) {
                regions.insert(expression.node_id(), index);
            }
        }
    }
    // Carry body context down parent links, including exit targets, so deeply
    // nested unlabelled exits do not walk their ancestors again for each node.
    #[derive(Clone, Copy, Default)]
    struct BodyContext {
        owner: Option<usize>,
        functions: usize,
        nested_iteration: bool,
        nested_breakable: bool,
    }
    let mut ancestry = Vec::<(NodeId, BodyContext)>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let parent = nodes.parent_id(node_id);
        while ancestry.last().is_some_and(|(id, _)| *id != parent) {
            ancestry.pop();
        }
        let mut context = ancestry
            .last()
            .map_or_else(BodyContext::default, |(_, context)| *context);
        if let Some(index) = regions.get(&node_id) {
            context = BodyContext {
                owner: Some(*index),
                ..BodyContext::default()
            };
        }
        context.functions += usize::from(node.kind().is_function_like());
        context.nested_iteration |= node.kind().is_iteration_statement();
        context.nested_breakable |= node.kind().is_iteration_statement()
            || matches!(node.kind(), AstKind::SwitchStatement(_));
        ancestry.push((node_id, context));
        let Some(index) = context.owner else {
            continue;
        };
        let loop_plan = &mut pending[index];
        let belongs_to_body = context.functions == 0;
        let ancestors = || {
            nodes
                .ancestor_ids(node_id)
                .take_while(|id| *id != loop_plan.captured.node_id)
        };
        let label_leaves_body = |name: &str| {
            ancestors().all(|id| !matches!(nodes.kind(id), AstKind::LabeledStatement(target) if target.label.name == name))
        };
        match node.kind() {
            AstKind::IdentifierReference(identifier) if identifier.name == "arguments" => {
                let inherited = ancestors().all(|id| {
                    !matches!(
                        nodes.kind(id),
                        AstKind::Function(_) | AstKind::StaticBlock(_)
                    )
                });
                let local = identifier
                    .reference_id
                    .get()
                    .and_then(|id| scoping.get_reference(id).symbol_id())
                    .is_some_and(|id| {
                        let declaration = scoping.symbol_declaration(id);
                        declaration == loop_plan.captured.body_node_id
                            || nodes
                                .ancestor_ids(declaration)
                                .any(|id| id == loop_plan.captured.body_node_id)
                    });
                if inherited && !local {
                    loop_plan.arguments_references.insert(node_id);
                }
            }
            AstKind::TryStatement(statement)
                if belongs_to_body && statement.finalizer.is_some() =>
            {
                loop_plan.has_finally = true;
            }
            AstKind::AwaitExpression(_) if belongs_to_body => {
                loop_plan.has_await = true;
            }
            AstKind::YieldExpression(_) if belongs_to_body => {
                loop_plan.has_yield = true;
                // A finalizer is a real ancestor block, not a containing range.
                loop_plan.has_yielding_finally |= ancestors().any(|id| {
                    let AstKind::BlockStatement(_) = nodes.kind(id) else { return false; };
                    matches!(nodes.parent_kind(id), AstKind::TryStatement(statement)
                        if statement.finalizer.as_ref().is_some_and(|block| block.node_id.get() == id))
                });
            }
            AstKind::ReturnStatement(_) if belongs_to_body => {
                loop_plan.returns.insert(node_id);
            }
            AstKind::BreakStatement(statement)
                if belongs_to_body
                    && statement.label.as_ref().map_or_else(
                        || !context.nested_breakable,
                        |label| label_leaves_body(label.name.as_str()),
                    ) =>
            {
                loop_plan.breaks.insert(node_id);
                if let Some(label) = &statement.label {
                    loop_plan
                        .exit_labels
                        .insert(node_id, label.name.to_string());
                }
            }
            AstKind::ContinueStatement(statement)
                if belongs_to_body
                    && statement.label.as_ref().map_or_else(
                        || !context.nested_iteration,
                        |label| label_leaves_body(label.name.as_str()),
                    ) =>
            {
                loop_plan.continues.insert(node_id);
                if let Some(label) = &statement.label {
                    loop_plan
                        .exit_labels
                        .insert(node_id, label.name.to_string());
                }
            }
            _ => {}
        }
    }
    let mut reserved: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    reserved.extend(
        scoping
            .root_unresolved_references()
            .keys()
            .map(ToString::to_string),
    );
    let mut roots: FxHashMap<NodeId, Vec<CapturedLoopMutation>> = FxHashMap::default();
    for loop_plan in pending {
        let PendingCapturedLoop {
            mut captured,
            statement_root,
            exit_labels,
            content_start,
            content_end,
            returns,
            breaks,
            continues,
            has_await,
            has_yield,
            has_finally,
            has_yielding_finally,
            arguments_references,
            local_var_declarations,
        } = loop_plan;
        let arguments_alias = (has_yield && !arguments_references.is_empty())
            .then(|| reserve_name("_arguments", &mut reserved));
        for binding in &mut captured.header_bindings {
            if binding.protect_writes {
                binding.parameter_alias =
                    Some(reserve_name(&format!("_{}", binding.name), &mut reserved));
            }
        }
        let defer_bindings = has_finally
            && !(returns.is_empty() && breaks.is_empty() && continues.is_empty())
            && captured
                .header_bindings
                .iter()
                .any(|binding| !binding.protect_writes);
        let extract_body = captured.body_capture || captured.header_capture;
        let header = (captured.header_capture || captured.init_capture).then(|| header::Plan {
            first: captured
                .header_capture
                .then(|| reserve_name("_first", &mut reserved)),
            initial: captured
                .init_capture
                .then(|| reserve_name("_initial", &mut reserved)),
        });
        roots
            .entry(statement_root)
            .or_default()
            .push(CapturedLoopMutation {
                extract_body,
                loop_id: captured.node_id,
                insertion_anchor: Span::new(captured.span.start, captured.span.start),
                anchor: Span::new(content_start, content_start),
                dispatch_anchor: Span::new(content_end, content_end),
                defer_bindings,
                bindings: captured.header_bindings,
                helper: if extract_body {
                    reserve_name("_loop", &mut reserved)
                } else {
                    String::new()
                },
                result: if extract_body {
                    reserve_name("_loopResult", &mut reserved)
                } else {
                    String::new()
                },
                record: has_yielding_finally.then(|| reserve_name("_loopRecord", &mut reserved)),
                exit_labels,
                returns,
                breaks,
                continues,
                has_await,
                has_yield,
                arguments_alias,
                arguments_references,
                local_var_declarations,
                header,
            });
    }
    (!roots.is_empty()).then_some(roots)
}

/// Classify loop declarations and references by their semantic AST ancestry.
fn classify_captured_loops(semantic: &Semantic<'_>) -> FxHashMap<NodeId, CapturedLoop> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let mut loop_facts = FxHashMap::<NodeId, CapturedLoop>::default();

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
                    body_capture: false,
                    header_capture: false,
                    init_capture: false,
                },
            );
        }

        if let AstKind::BindingIdentifier(identifier) = node.kind() {
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
                crossed_function |=
                    kind.is_function_like() || matches!(kind, AstKind::StaticBlock(_));
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
            if !in_body
                && !loop_fact
                    .header_bindings
                    .iter()
                    .any(|binding| binding.name == identifier.name.as_str())
            {
                let is_const = scoping
                    .symbol_flags(symbol_id)
                    .contains(SymbolFlags::ConstVariable);
                let protect_writes = is_const
                    && scoping
                        .get_resolved_reference_ids(symbol_id)
                        .iter()
                        .any(|id| scoping.get_reference(*id).is_write());
                loop_fact.header_bindings.push(HeaderBinding {
                    name: identifier.name.to_string(),
                    is_const,
                    protect_writes,
                    parameter_alias: None,
                });
            }
            // Semantic lists include forward references, so each candidate can
            // be resolved here without scanning every AST node a second time.
            for reference_id in scoping.get_resolved_reference_ids(symbol_id) {
                let node_id = scoping.get_reference(*reference_id).node_id();
                let mut crossed_boundary = false;
                let mut child_id = node_id;
                for ancestor in nodes.ancestor_ids(node_id) {
                    if ancestor == loop_id {
                        // Header captures need the update/test moved into the
                        // per-iteration helper as well as the body.
                        if crossed_boundary {
                            let fact = loop_facts.get_mut(&loop_id).unwrap();
                            if child_id == fact.body_node_id {
                                fact.body_capture = true;
                            } else if fact
                                .header_bindings
                                .iter()
                                .any(|binding| binding.name == scoping.symbol_name(symbol_id))
                                && let AstKind::ForStatement(statement) = nodes.kind(loop_id)
                                && matches!(&statement.init, Some(oxc_ast::ast::ForStatementInit::VariableDeclaration(declaration)) if declaration.kind == VariableDeclarationKind::Let)
                            {
                                if statement
                                    .init
                                    .as_ref()
                                    .is_some_and(|init| init.node_id() == child_id)
                                {
                                    fact.init_capture = true;
                                } else {
                                    fact.header_capture = true;
                                }
                            }
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
        }
    }
    loop_facts.retain(|_, fact| fact.body_capture || fact.header_capture || fact.init_capture);
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
    super::reserve_generated_name(base, used)
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
    used_names.extend(unresolved_names.iter().cloned());
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
        // One name has at most one symbol per scope. Scope order alone is
        // sufficient for the ancestry sweep, even when anchors coincide.
        symbols.sort_unstable_by_key(|symbol_id| scope_index[&scoping.symbol_scope_id(*symbol_id)]);
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
        // Equal-depth scopes follow the live semantic traversal, not source
        // locations: rewrites can move declarations or give them shared anchors.
        symbols.sort_unstable_by_key(|symbol_id| {
            (
                !scoping
                    .symbol_flags(*symbol_id)
                    .contains(SymbolFlags::FunctionScopedVariable),
                scope_depth[&scoping.symbol_scope_id(*symbol_id)],
                scope_index[&scoping.symbol_scope_id(*symbol_id)],
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

    let reference_renames = renames
        .iter()
        .flat_map(|(symbol_id, replacement)| {
            scoping
                .get_resolved_reference_ids(*symbol_id)
                .iter()
                .map(|reference_id| (*reference_id, replacement.clone()))
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
            let write_node = semantic
                .nodes()
                .ancestor_ids(reference.node_id())
                .find(|ancestor| {
                    matches!(
                        semantic.nodes().kind(*ancestor),
                        AstKind::AssignmentExpression(_) | AstKind::UpdateExpression(_)
                    )
                });
            if let Some(write_node) = write_node {
                const_write_expressions
                    .insert(write_node, scoping.symbol_name(symbol_id).to_owned());
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
        binding_renames: renames,
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
fn collect_read_only_private_writes(semantic: &Semantic<'_>) -> FxHashMap<NodeId, String> {
    struct PrivateClass {
        node_id: NodeId,
        names: FxHashMap<String, bool>,
    }

    let nodes = semantic.nodes();
    let mut writes = FxHashMap::default();
    if !nodes
        .iter_enumerated()
        .any(|(_, node)| matches!(node.kind(), AstKind::PrivateFieldExpression(_)))
    {
        return writes;
    }
    let mut classes = Vec::<PrivateClass>::new();
    let mut ancestry = Vec::<NodeId>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let parent = nodes.parent_id(node_id);
        while ancestry.last().is_some_and(|id| *id != parent) {
            let exited = ancestry.pop().unwrap();
            if classes.last().is_some_and(|class| class.node_id == exited) {
                classes.pop();
            }
        }
        ancestry.push(node_id);
        // Heritage runs in the enclosing private environment. Activate the new
        // declarations only at the body, retaining writable names for shadowing.
        if let AstKind::ClassBody(class) = node.kind() {
            let setters = class
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
            let names = class
                .body
                .iter()
                .filter_map(|element| {
                    let Some(PropertyKey::PrivateIdentifier(key)) = element.property_key() else {
                        return None;
                    };
                    let read_only = match element {
                        ClassElement::MethodDefinition(method) => {
                            method.kind != MethodDefinitionKind::Set
                                && (method.kind != MethodDefinitionKind::Get
                                    || !setters.contains(key.name.as_str()))
                        }
                        _ => false,
                    };
                    Some((key.name.to_string(), read_only))
                })
                .collect();
            classes.push(PrivateClass { node_id, names });
            continue;
        }
        let AstKind::PrivateFieldExpression(field) = node.kind() else {
            continue;
        };
        if !classes
            .iter()
            .rev()
            .find_map(|class| class.names.get(field.field.name.as_str()))
            .copied()
            .unwrap_or(false)
        {
            continue;
        }
        let parent_id = nodes.parent_id(node_id);
        match nodes.kind(parent_id) {
            AstKind::AssignmentExpression(expression)
                if matches!(
                    &expression.left,
                    AssignmentTarget::PrivateFieldExpression(target)
                        if target.node_id.get() == node_id
                ) =>
            {
                writes.insert(parent_id, field.field.name.to_string());
            }
            AstKind::UpdateExpression(expression)
                if matches!(
                    &expression.argument,
                    SimpleAssignmentTarget::PrivateFieldExpression(target)
                        if target.node_id.get() == node_id
                ) =>
            {
                writes.insert(parent_id, field.field.name.to_string());
            }
            _ => {}
        }
    }
    writes
}

/// Find declarations that need a fresh undefined value on every loop entry.
/// Track AST ancestry in linear time; generated/moved nodes need not have
/// distinct or source-ordered mapping anchors.
fn collect_loop_reset_declarations(semantic: &Semantic<'_>) -> FxHashSet<NodeId> {
    let nodes = semantic.nodes();
    if !nodes
        .iter_enumerated()
        .any(|(_, node)| node.kind().is_iteration_statement())
    {
        return FxHashSet::default();
    }
    let mut ancestors = Vec::<(NodeId, bool)>::new();
    let mut resets = FxHashSet::default();
    for (node_id, node) in nodes.iter_enumerated() {
        let parent = nodes.parent_id(node_id);
        while ancestors.last().is_some_and(|(id, _)| *id != parent) {
            ancestors.pop();
        }
        let in_loop = !node.kind().is_function_like()
            && (loop_body(nodes.kind(parent)).is_some_and(|body| body.node_id() == node_id)
                || ancestors.last().is_some_and(|(_, in_loop)| *in_loop));
        ancestors.push((node_id, in_loop));
        let AstKind::VariableDeclarator(declarator) = node.kind() else {
            continue;
        };
        let declaration_id = nodes.parent_id(node_id);
        if in_loop
            && declarator.init.is_none()
            && matches!(nodes.parent_kind(node_id), AstKind::VariableDeclaration(declaration)
                if matches!(declaration.kind, VariableDeclarationKind::Let | VariableDeclarationKind::Const))
            && !matches!(
                nodes.parent_kind(declaration_id),
                AstKind::ForInStatement(_) | AstKind::ForOfStatement(_)
            )
        {
            resets.insert(node_id);
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
    binding_renames: FxHashMap<SymbolId, String>,
    reference_renames: FxHashMap<ReferenceId, String>,
    loop_reset_declarations: FxHashSet<NodeId>,
    const_write_expressions: FxHashMap<NodeId, String>,
    read_only_helper: Option<String>,
    read_only_temp: Option<String>,
}

struct BlockScopingLowerer<'a> {
    allocator: &'a Allocator,
    plan: BlockScopingPlan,
}

impl<'a> BlockScopingLowerer<'a> {
    fn read_only_error(&self, span: Span, name: &str) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let helper = self
            .plan
            .read_only_helper
            .as_deref()
            .expect("const writes reserve a read-only helper");
        oxc_ast::ast::Expression::new_call_expression(
            span,
            oxc_ast::ast::Expression::new_identifier(
                span,
                self.allocator.alloc_str(helper),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            oxc_allocator::Vec::from_array_in(
                [oxc_ast::ast::Expression::new_string_literal(
                    span,
                    self.allocator.alloc_str(name),
                    None,
                    ast.builder(),
                )
                .into()],
                ast.builder(),
            ),
            false,
            ast.builder(),
        )
    }

    fn temp_assignment(&self, span: Span, value: Expression<'a>) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let temp = self
            .plan
            .read_only_temp
            .as_deref()
            .expect("const writes reserve a temporary");
        oxc_ast::ast::Expression::new_assignment_expression(
            span,
            AssignmentOperator::Assign,
            oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                span,
                self.allocator.alloc_str(temp),
                ast.builder(),
            )
            .into(),
            value,
            ast.builder(),
        )
    }

    fn temp_target(&self, span: Span) -> AssignmentTarget<'a> {
        oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            span,
            self.allocator.alloc_str(
                self.plan
                    .read_only_temp
                    .as_deref()
                    .expect("const writes reserve a temporary"),
            ),
            &AstBuilder::new(self.allocator),
        )
        .into()
    }

    fn target_read(&self, target: &AssignmentTarget<'a>) -> Option<Expression<'a>> {
        let ast = AstBuilder::new(self.allocator);
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                Some(oxc_ast::ast::Expression::new_identifier(
                    identifier.span,
                    identifier.name,
                    ast.builder(),
                ))
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

    fn sequence(&self, span: Span, expressions: ArenaVec<'a, Expression<'a>>) -> Expression<'a> {
        oxc_ast::ast::Expression::new_sequence_expression(
            span,
            expressions,
            &AstBuilder::new(self.allocator),
        )
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
    fn visit_assignment_target_property(&mut self, property: &mut AssignmentTargetProperty<'a>) {
        let AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(shorthand) = property
        else {
            walk_mut::walk_assignment_target_property(self, property);
            return;
        };
        let Some(replacement) = shorthand
            .binding
            .reference_id
            .get()
            .and_then(|id| self.plan.reference_renames.get(&id))
        else {
            walk_mut::walk_assignment_target_property(self, property);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let span = shorthand.span;
        let original_name = shorthand.binding.name;
        let target = oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            shorthand.binding.span,
            self.allocator.alloc_str(replacement),
            ast.builder(),
        );
        let binding = if let Some(mut init) = shorthand.init.take() {
            self.visit_expression(&mut init);
            oxc_ast::ast::AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                span,
                AssignmentTarget::from(target),
                init,
                &ast,
            )
        } else {
            AssignmentTargetMaybeDefault::from(target)
        };
        *property = oxc_ast::ast::AssignmentTargetProperty::new_assignment_target_property_property(
            span,
            oxc_ast::ast::PropertyKey::new_static_identifier(span, original_name, ast.builder()),
            binding,
            false,
            ast.builder(),
        );
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let span = expression.span();
        let Some(name) = self
            .plan
            .const_write_expressions
            .get(&expression.node_id())
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
                        oxc_ast::ast::Expression::new_identifier(
                            identifier.span,
                            identifier.name,
                            ast.builder(),
                        )
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
                        .contains(&declarator.node_id.get())
                {
                    let span = declarator.span;
                    declarator.init =
                        Some(super::void_zero(&AstBuilder::new(self.allocator), span));
                }
            }
            declaration.kind = VariableDeclarationKind::Var;
        }
        walk_mut::walk_variable_declaration(self, declaration);
    }

    fn visit_binding_identifier(&mut self, identifier: &mut BindingIdentifier<'a>) {
        if let Some(replacement) = identifier
            .symbol_id
            .get()
            .and_then(|id| self.plan.binding_renames.get(&id))
        {
            identifier.name = self.allocator.alloc_str(replacement).into();
        }
    }

    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if let Some(replacement) = identifier
            .reference_id
            .get()
            .and_then(|id| self.plan.reference_renames.get(&id))
        {
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
    fn renames_distinguish_bindings_and_references_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_binding_identifier(&mut self, identifier: &mut BindingIdentifier<'a>) {
                identifier.span = Span::default();
            }

            fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
                identifier.span = Span::default();
            }
        }

        let source = "let value = 1; { let value = 2; use(value); } use(value);";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        assert!(parsed.diagnostics.is_empty());
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        assert!(semantic.diagnostics.is_empty());
        let plan = prepare(&semantic.semantic).unwrap();
        drop(semantic);
        run(&allocator, &mut parsed.program, plan, true);
        let code = oxc_codegen::Codegen::new().build(&parsed.program).code;
        assert_eq!(
            code,
            "var value = 1;\n{\n\tvar _value = 2;\n\tuse(_value);\n}\nuse(value);\n"
        );
    }

    #[test]
    fn rename_priority_follows_scope_order_with_shared_or_moved_anchors() {
        struct Anchors(bool);
        impl<'a> VisitMut<'a> for Anchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = if self.0 {
                    Span::default()
                } else {
                    Span::new(1_000 - span.end, 1_000 - span.start)
                };
            }
        }
        for (name, source, move_blocks, expected) in [
            (
                "sibling scopes",
                "{let value=function(){return 1};observe(value)}{let value=function(){return 2};observe(value)}",
                false,
                "{var value=function(){return 1};observe(value)}{var _value=function(){return 2};observe(_value)}",
            ),
            (
                "moved sibling scopes",
                "{let value=function(){return 1};observe(value)}{let value=function(){return 2};observe(value)}",
                true,
                "{var value=function(){return 2};observe(value)}{var _value=function(){return 1};observe(_value)}",
            ),
            (
                "function-scoped binding keeps priority",
                "{let value=1;observe(value)}var value=2;observe(value)",
                false,
                "{var _value=1;observe(_value)}var value=2;observe(value)",
            ),
            (
                "shallowest lexical binding keeps priority",
                "{{let value=1;observe(value)}}{let value=2;observe(value)}",
                false,
                "{{var _value=1;observe(_value)}}{var value=2;observe(value)}",
            ),
        ] {
            for anchors in ["parsed", "shared", "reversed"] {
                let allocator = Allocator::default();
                let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
                assert!(parsed.diagnostics.is_empty());
                if move_blocks {
                    parsed.program.body.reverse();
                }
                if anchors != "parsed" {
                    Anchors(anchors == "shared").visit_program(&mut parsed.program);
                }
                let semantic = SemanticBuilder::new()
                    .with_build_nodes(true)
                    .build(&parsed.program);
                assert!(semantic.diagnostics.is_empty(), "{name}: {anchors}");
                let plan = prepare(&semantic.semantic).unwrap();
                drop(semantic);
                run(&allocator, &mut parsed.program, plan, true);
                let output = oxc_codegen::Codegen::new().build(&parsed.program).code;
                let expected = Parser::new(&allocator, expected, SourceType::default()).parse();
                assert!(expected.diagnostics.is_empty());
                let expected = oxc_codegen::Codegen::new().build(&expected.program).code;
                assert_eq!(output, expected, "{name}: {anchors}");
            }
        }
    }

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
    fn captured_loop_distinguishes_header_locals_from_loop_bindings() {
        for (source, header_capture) in [
            (
                "for (const t of (u => { const r = u; return r; })(o)) void 0;",
                false,
            ),
            (
                "for (const t in (() => { const r = o; return r; })()) void 0;",
                false,
            ),
            (
                "for (let i = (() => { const r = 0; return r; })(); i < 3; i++) void 0;",
                false,
            ),
            ("for (let i = 0; (() => i)() < 3; i++) void 0;", true),
            ("for (let i = 0; i < 3; (() => i++)()) void 0;", true),
            (
                "while ((() => { const r = false; return r; })()) void 0;",
                false,
            ),
            (
                "do {} while ((() => { const r = false; return r; })());",
                false,
            ),
            (
                "for (let read = () => i, i = 0; i < 2; i++) use(read);",
                true,
            ),
        ] {
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
            let semantic = SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let loops = classify_captured_loops(&semantic.semantic);
            assert_eq!(loops.len(), usize::from(header_capture), "{source}");
            if header_capture {
                let captured = loops.values().next().unwrap();
                assert!(captured.header_capture || captured.init_capture, "{source}");
            }
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
        assert_eq!(
            loops
                .values()
                .next()
                .unwrap()
                .header_bindings
                .iter()
                .map(|binding| binding.name.as_str())
                .collect::<Vec<_>>(),
            ["t"]
        );
    }

    #[test]
    fn private_write_scopes_follow_ancestry_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source = "class A { #m() {} f(){ this.#m=1; return class B { #m=0; f(){this.#m=2;} }; } } class C { #m=0; f(){this.#m=3;} }";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        assert!(semantic.diagnostics.is_empty());
        let writes = collect_read_only_private_writes(&semantic.semantic);
        assert_eq!(writes.len(), 1);
        let id = *writes.keys().next().unwrap();
        let AstKind::AssignmentExpression(assignment) = semantic.semantic.nodes().kind(id) else {
            panic!("expected write");
        };
        assert!(
            matches!(&assignment.right, Expression::NumericLiteral(literal) if literal.value == 1.0)
        );
    }

    #[test]
    fn captured_completions_follow_ancestry_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source = "function f() { for(let i=0;i<2;i++){ use(()=>i); if(i) return i; function g(){ return 9; } while(test()) { break; } continue; } }";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        assert!(semantic.diagnostics.is_empty());
        let plan = prepare_captured_loop_ast(source, &semantic.semantic).unwrap();
        let mutation = &plan.roots.values().next().unwrap()[0];
        assert_eq!(mutation.returns.len(), 1);
        assert_eq!(mutation.continues.len(), 1);
        assert!(mutation.breaks.is_empty());
        drop(semantic);
        assert!(run_captured_loop_ast(&allocator, &mut parsed.program, plan).unwrap());
        let code = oxc_codegen::Codegen::new().build(&parsed.program).code;
        assert!(code.contains("return 9;"), "{code}");
        assert!(code.contains("break;"), "{code}");
        assert!(code.contains("type: \"return\""), "{code}");
        assert!(code.contains("type: \"continue\""), "{code}");
    }

    #[test]
    fn loop_resets_follow_ancestry_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source =
            "let outside; for (let header; test();) { let body; function nested() { let local; } }";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        assert!(semantic.diagnostics.is_empty());
        let plan = prepare(&semantic.semantic).unwrap();
        drop(semantic);
        run(&allocator, &mut parsed.program, plan, true);
        let code = oxc_codegen::Codegen::new().build(&parsed.program).code;
        assert!(code.contains("var body = void 0"), "{code}");
        assert!(code.contains("var outside;"), "{code}");
        assert!(code.contains("for (var header;"), "{code}");
        assert!(code.contains("var local;"), "{code}");
        assert_eq!(code.matches("void 0").count(), 1, "{code}");
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
        let &id = plan.loop_reset_declarations.iter().next().unwrap();
        let span = semantic.semantic.nodes().kind(id).span();
        assert_eq!(&source[span.start as usize..span.end as usize], "bodyValue");
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
