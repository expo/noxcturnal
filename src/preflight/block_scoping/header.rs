//! Move a captured for-loop's update/test into the next iteration's environment.
use super::*;
use oxc_allocator::GetAllocator;
use oxc_ast::ast::{ForStatement, ForStatementInit};
use oxc_ast::builder::GetAstBuilder;

pub(super) struct Plan {
    pub(super) first: Option<String>,
    pub(super) initial: Option<String>,
}

pub(super) fn prepare<'a>(
    ast: AstBuilder<'a>,
    root: &mut Statement<'a>,
    span: Span,
    bindings: &[HeaderBinding],
    plan: &Plan,
) -> (Option<Expression<'a>>, Option<Expression<'a>>) {
    let mut pass = HeaderLowerer {
        ast,
        span,
        bindings,
        plan,
        expressions: None,
    };
    pass.visit_statement(root);
    pass.expressions.expect("captured for header exists")
}

struct HeaderLowerer<'a, 'p> {
    ast: AstBuilder<'a>,
    span: Span,
    bindings: &'p [HeaderBinding],
    plan: &'p Plan,
    expressions: Option<(Option<Expression<'a>>, Option<Expression<'a>>)>,
}

fn labeled_loop<'s, 'a>(
    statement: &'s mut Statement<'a>,
    span: Span,
) -> Option<&'s mut ForStatement<'a>> {
    match statement {
        Statement::ForStatement(statement) if statement.span == span => Some(statement),
        Statement::LabeledStatement(statement) => labeled_loop(&mut statement.body, span),
        _ => None,
    }
}

impl<'a> VisitMut<'a> for HeaderLowerer<'a, '_> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        let Some(loop_) = labeled_loop(statement, self.span) else {
            walk_mut::walk_statement(self, statement);
            return;
        };
        let ast = AstBuilder::new(self.ast.allocator());
        let anchor = Span::new(self.span.start, self.span.start);
        self.expressions = Some((None, None));
        if let Some(first) = &self.plan.first {
            self.expressions = Some((loop_.test.take(), loop_.update.take()));
            loop_.update = Some(oxc_ast::ast::Expression::new_assignment_expression(
                anchor,
                AssignmentOperator::Assign,
                oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                    anchor,
                    ast.allocator().alloc_str(first),
                    ast.builder(),
                )
                .into(),
                oxc_ast::ast::Expression::new_boolean_literal(anchor, false, ast.builder()),
                ast.builder(),
            ));
        }
        let Some(ForStatementInit::VariableDeclaration(mut declaration)) = loop_.init.take() else {
            unreachable!("captured let header")
        };
        let mut prefix = oxc_allocator::Vec::new_in(ast.builder());
        if let Some(initial) = &self.plan.initial {
            // Initialization has its own environment. Closures created there must
            // not observe the later copies written back by the iteration helper.
            prefix.push(Statement::VariableDeclaration(declaration));
            let mut values = oxc_allocator::Vec::new_in(ast.builder());
            let mut declarations = oxc_allocator::Vec::new_in(ast.builder());
            for (index, binding) in self.bindings.iter().enumerate() {
                let name = &binding.name;
                values.push(ArrayExpressionElement::from(
                    oxc_ast::ast::Expression::new_identifier(
                        anchor,
                        ast.allocator().alloc_str(name),
                        ast.builder(),
                    ),
                ));
                let value = Expression::from(
                    oxc_ast::ast::MemberExpression::new_computed_member_expression(
                        anchor,
                        oxc_ast::ast::Expression::new_identifier(
                            anchor,
                            ast.allocator().alloc_str(initial),
                            ast.builder(),
                        ),
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
                declarations.push(oxc_ast::ast::VariableDeclarator::new(
                    anchor,
                    oxc_ast::ast::BindingPattern::new_binding_identifier(
                        anchor,
                        ast.allocator().alloc_str(name),
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(value),
                    false,
                    ast.builder(),
                ));
            }
            prefix.push(binding_declaration(
                AstBuilder::new(ast.allocator()),
                anchor,
                VariableDeclarationKind::Var,
                initial,
                Some(oxc_ast::ast::Expression::new_array_expression(
                    anchor,
                    values,
                    ast.builder(),
                )),
            ));
            declaration = oxc_ast::ast::VariableDeclaration::boxed(
                anchor,
                VariableDeclarationKind::Let,
                declarations,
                false,
                ast.builder(),
            );
        }
        if let Some(first) = &self.plan.first {
            declaration
                .declarations
                .push(oxc_ast::ast::VariableDeclarator::new(
                    anchor,
                    oxc_ast::ast::BindingPattern::new_binding_identifier(
                        anchor,
                        ast.allocator().alloc_str(first),
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(oxc_ast::ast::Expression::new_boolean_literal(
                        anchor,
                        true,
                        ast.builder(),
                    )),
                    false,
                    ast.builder(),
                ));
        }
        loop_.init = Some(ForStatementInit::VariableDeclaration(declaration));
        if !prefix.is_empty() {
            prefix.push(statement.take_in(&ast));
            *statement =
                oxc_ast::ast::Statement::new_block_statement(anchor, prefix, ast.builder());
        }
    }
}
