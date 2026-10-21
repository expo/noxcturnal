//! Rewrite an extracted body in one pass: hoisted vars, control flow, and arguments.
use super::*;
use oxc_allocator::GetAllocator;
use oxc_ast::ast::{BindingPattern, ForStatement, ForStatementInit, ForStatementLeft, StaticBlock};
use oxc_ast::builder::GetAstBuilder;

/// Keep declarations initialized before every use in the same body scope.
/// Restricting this to direct statements avoids data-flow analysis and walking
/// expression ancestry for each reference (which can be quadratic in deep sums).
pub(super) fn local_declarations(semantic: &Semantic<'_>, body_id: NodeId) -> Vec<NodeId> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let AstKind::BlockStatement(body) = nodes.kind(body_id) else {
        return Vec::new();
    };
    let scope_id = body.scope_id.get().expect("analyzed loop body");
    if scoping
        .scope_ancestors(scope_id)
        .any(|id| scoping.scope_flags(id).contains(ScopeFlags::With))
    {
        return Vec::new();
    }
    let mut local = Vec::new();
    for (index, statement) in body.body.iter().enumerate() {
        let Statement::VariableDeclaration(declaration) = statement else {
            continue;
        };
        if declaration.kind != VariableDeclarationKind::Var {
            continue;
        }
        let next_statement = body
            .body
            .get(index + 1)
            .map(|statement| statement.node_id());
        if declaration.declarations.iter().all(|declarator| {
            let BindingPattern::BindingIdentifier(identifier) = &declarator.id else {
                return false;
            };
            let Some(symbol_id) = identifier.symbol_id.get() else {
                return false;
            };
            let flags = scoping.scope_flags(scoping.symbol_scope_id(symbol_id));
            declarator.init.is_some()
                && flags.is_function()
                && !flags.contains_direct_eval()
                && scoping.symbol_redeclarations(symbol_id).is_empty()
                && scoping
                    .get_resolved_reference_ids(symbol_id)
                    .iter()
                    .all(|id| {
                        let reference = scoping.get_reference(*id);
                        // Scope equality excludes escaping closures, deferred class
                        // fields, and external uses. Preorder IDs exclude uses before
                        // or within this declaration, even with generated source spans.
                        reference.scope_id() == scope_id
                            && next_statement
                                .is_some_and(|next| reference.node_id().index() >= next.index())
                    })
        }) {
            local.push(declaration.node_id.get());
        }
    }
    local
}

pub(super) fn rewrite<'a>(
    ast: AstBuilder<'a>,
    body: &mut ArenaVec<'a, Statement<'a>>,
    mutation: &CapturedLoopMutation,
) -> Vec<String> {
    let mut pass = BodyRewriter {
        ast,
        mutation,
        names: Vec::new(),
        seen: FxHashSet::default(),
        local_declarations: mutation.local_var_declarations.iter(),
    };
    pass.visit_statements(body);
    pass.names
}

struct BodyRewriter<'a, 'p> {
    mutation: &'p CapturedLoopMutation,
    ast: AstBuilder<'a>,
    names: Vec<String>,
    seen: FxHashSet<&'a str>,
    local_declarations: std::slice::Iter<'p, NodeId>,
}

impl<'a> BodyRewriter<'a, '_> {
    fn record(&mut self, pattern: &BindingPattern<'a>) {
        pattern.all_binding_identifiers(&mut |identifier| {
            if self.seen.insert(identifier.name.as_str()) {
                self.names.push(identifier.name.to_string());
            }
            true
        });
    }

    fn initializers(&mut self, declaration: VariableDeclaration<'a>) -> Option<Expression<'a>> {
        let mut expressions = oxc_allocator::Vec::new_in(self.ast.builder());
        let span = declaration.span;
        for declarator in declaration.declarations {
            self.record(&declarator.id);
            if let Some(init) = declarator.init {
                expressions.push(oxc_ast::ast::Expression::new_assignment_expression(
                    declarator.span,
                    AssignmentOperator::Assign,
                    assignment_target(AstBuilder::new(self.ast.allocator()), declarator.id),
                    init,
                    self.ast.builder(),
                ));
            }
        }
        match expressions.len() {
            0 => None,
            1 => expressions.pop(),
            _ => Some(oxc_ast::ast::Expression::new_sequence_expression(
                span,
                expressions,
                self.ast.builder(),
            )),
        }
    }
}

impl<'a> VisitMut<'a> for BodyRewriter<'a, '_> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        if matches!(statement, Statement::VariableDeclaration(declaration) if declaration.kind == VariableDeclarationKind::Var)
        {
            let Statement::VariableDeclaration(declaration) = statement else {
                unreachable!()
            };
            // Direct body declarations are planned and visited in AST order.
            if self.local_declarations.as_slice().first() == Some(&declaration.node_id.get()) {
                self.local_declarations.next();
                walk_mut::walk_statement(self, statement);
                return;
            }
            let Statement::VariableDeclaration(declaration) = statement.take_in(&self.ast) else {
                unreachable!()
            };
            let span = declaration.span;
            *statement = match self.initializers(declaration.unbox()) {
                Some(expression) => oxc_ast::ast::Statement::new_expression_statement(
                    span,
                    expression,
                    self.ast.builder(),
                ),
                None => oxc_ast::ast::Statement::new_empty_statement(span, self.ast.builder()),
            };
        }
        let span = statement.span();
        let key = (span.start, span.end);
        let completion = match statement {
            Statement::ReturnStatement(return_) if self.mutation.returns.contains(&key) => {
                let value = return_
                    .argument
                    .take()
                    .unwrap_or_else(|| super::super::void_zero(&self.ast, span));
                Some(("return", Some(value)))
            }
            Statement::BreakStatement(_) if self.mutation.breaks.contains(&key) => {
                Some(("break", None))
            }
            Statement::ContinueStatement(_) if self.mutation.continues.contains(&key) => {
                Some(("continue", None))
            }
            _ => None,
        };
        if let Some((kind, value)) = completion {
            let tag = self
                .mutation
                .exit_labels
                .get(&key)
                .map_or_else(|| kind.to_owned(), |label| format!("{kind}:{label}"));
            *statement = oxc_ast::ast::Statement::new_return_statement(
                span,
                Some(captured_loop_result(
                    &self.ast,
                    self.mutation,
                    span,
                    &tag,
                    value,
                )),
                self.ast.builder(),
            );
        }
        walk_mut::walk_statement(self, statement);
    }

    fn visit_for_statement(&mut self, statement: &mut ForStatement<'a>) {
        if matches!(&statement.init, Some(ForStatementInit::VariableDeclaration(declaration)) if declaration.kind == VariableDeclarationKind::Var)
        {
            let Some(ForStatementInit::VariableDeclaration(declaration)) = statement.init.take()
            else {
                unreachable!()
            };
            statement.init = self
                .initializers(declaration.unbox())
                .map(ForStatementInit::from);
        }
        walk_mut::walk_for_statement(self, statement);
    }

    fn visit_for_statement_left(&mut self, left: &mut ForStatementLeft<'a>) {
        if matches!(left, ForStatementLeft::VariableDeclaration(declaration) if declaration.kind == VariableDeclarationKind::Var)
        {
            let ForStatementLeft::VariableDeclaration(mut declaration) = left.take_in(&self.ast)
            else {
                unreachable!()
            };
            let declarator = declaration
                .declarations
                .pop()
                .expect("iteration declaration");
            self.record(&declarator.id);
            *left = ForStatementLeft::from(assignment_target(
                AstBuilder::new(self.ast.allocator()),
                declarator.id,
            ));
        }
        walk_mut::walk_for_statement_left(self, left);
    }

    fn visit_function(&mut self, _: &mut oxc_ast::ast::Function<'a>, _: ScopeFlags) {}
    fn visit_arrow_function_expression(
        &mut self,
        expression: &mut oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
        if let Some(alias) = &self.mutation.arguments_alias {
            ArgumentsRewriter {
                alias,
                references: &self.mutation.arguments_references,
                ast: AstBuilder::new(self.ast.allocator()),
            }
            .visit_arrow_function_expression(expression);
        }
    }
    fn visit_identifier_reference(&mut self, identifier: &mut IdentifierReference<'a>) {
        if let Some(alias) = &self.mutation.arguments_alias {
            ArgumentsRewriter {
                alias,
                references: &self.mutation.arguments_references,
                ast: AstBuilder::new(self.ast.allocator()),
            }
            .visit_identifier_reference(identifier);
        }
    }
    fn visit_static_block(&mut self, _: &mut StaticBlock<'a>) {}
}

fn maybe_default<'a>(
    ast: AstBuilder<'a>,
    pattern: BindingPattern<'a>,
) -> AssignmentTargetMaybeDefault<'a> {
    match pattern {
        BindingPattern::AssignmentPattern(pattern) => {
            let pattern = pattern.unbox();
            AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                pattern.span,
                assignment_target(AstBuilder::new(ast.allocator()), pattern.left),
                pattern.right,
                &ast,
            )
        }
        pattern => assignment_target(AstBuilder::new(ast.allocator()), pattern).into(),
    }
}

fn assignment_target<'a>(ast: AstBuilder<'a>, pattern: BindingPattern<'a>) -> AssignmentTarget<'a> {
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => {
            AssignmentTarget::new_assignment_target_identifier(
                identifier.span,
                identifier.name,
                &ast,
            )
        }
        BindingPattern::ArrayPattern(pattern) => {
            let pattern = pattern.unbox();
            let mut elements = oxc_allocator::Vec::new_in(ast.builder());
            for element in pattern.elements {
                elements.push(
                    element.map(|pattern| maybe_default(AstBuilder::new(ast.allocator()), pattern)),
                );
            }
            let rest = pattern.rest.map(|rest| {
                let rest = rest.unbox();
                oxc_ast::ast::AssignmentTargetRest::boxed(
                    rest.span,
                    assignment_target(AstBuilder::new(ast.allocator()), rest.argument),
                    ast.builder(),
                )
            });
            AssignmentTarget::new_array_assignment_target(pattern.span, elements, rest, &ast)
        }
        BindingPattern::ObjectPattern(pattern) => {
            let pattern = pattern.unbox();
            let mut properties = oxc_allocator::Vec::new_in(ast.builder());
            for property in pattern.properties {
                properties.push(
                    AssignmentTargetProperty::new_assignment_target_property_property(
                        property.span,
                        property.key,
                        maybe_default(AstBuilder::new(ast.allocator()), property.value),
                        property.computed,
                        &ast,
                    ),
                );
            }
            let rest = pattern.rest.map(|rest| {
                let rest = rest.unbox();
                oxc_ast::ast::AssignmentTargetRest::boxed(
                    rest.span,
                    assignment_target(AstBuilder::new(ast.allocator()), rest.argument),
                    ast.builder(),
                )
            });
            AssignmentTarget::new_object_assignment_target(pattern.span, properties, rest, &ast)
        }
        BindingPattern::AssignmentPattern(_) => {
            unreachable!("defaults occur inside binding patterns")
        }
    }
}
