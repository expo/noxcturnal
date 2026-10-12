//! Move a captured for-loop's update/test into the next iteration's environment.
use super::*;
use oxc_ast::ast::{ForStatement, ForStatementInit};

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

#[expect(deprecated)]
impl<'a> VisitMut<'a> for HeaderLowerer<'a, '_> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        let Some(loop_) = labeled_loop(statement, self.span) else {
            walk_mut::walk_statement(self, statement);
            return;
        };
        let ast = self.ast;
        let anchor = Span::new(self.span.start, self.span.start);
        self.expressions = Some((None, None));
        if let Some(first) = &self.plan.first {
            self.expressions = Some((loop_.test.take(), loop_.update.take()));
            loop_.update = Some(
                ast.expression_assignment(
                    anchor,
                    AssignmentOperator::Assign,
                    ast.simple_assignment_target_assignment_target_identifier(
                        anchor,
                        ast.allocator.alloc_str(first),
                    )
                    .into(),
                    ast.expression_boolean_literal(anchor, false),
                ),
            );
        }
        let Some(ForStatementInit::VariableDeclaration(mut declaration)) = loop_.init.take() else {
            unreachable!("captured let header")
        };
        let mut prefix = ast.vec();
        if let Some(initial) = &self.plan.initial {
            // Initialization has its own environment. Closures created there must
            // not observe the later copies written back by the iteration helper.
            prefix.push(Statement::VariableDeclaration(declaration));
            let mut values = ast.vec();
            let mut declarations = ast.vec();
            for (index, binding) in self.bindings.iter().enumerate() {
                let name = &binding.name;
                values.push(ArrayExpressionElement::from(
                    ast.expression_identifier(anchor, ast.allocator.alloc_str(name)),
                ));
                let value = Expression::from(ast.member_expression_computed(
                    anchor,
                    ast.expression_identifier(anchor, ast.allocator.alloc_str(initial)),
                    ast.expression_numeric_literal(
                        anchor,
                        index as f64,
                        None,
                        oxc_ast::ast::NumberBase::Decimal,
                    ),
                    false,
                ));
                declarations.push(ast.variable_declarator(
                    anchor,
                    VariableDeclarationKind::Let,
                    ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(name)),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(value),
                    false,
                ));
            }
            prefix.push(binding_declaration(
                ast,
                anchor,
                VariableDeclarationKind::Var,
                initial,
                Some(ast.expression_array(anchor, values)),
            ));
            declaration = ast.alloc_variable_declaration(
                anchor,
                VariableDeclarationKind::Let,
                declarations,
                false,
            );
        }
        if let Some(first) = &self.plan.first {
            declaration.declarations.push(ast.variable_declarator(
                anchor,
                VariableDeclarationKind::Let,
                ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(first)),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                Some(ast.expression_boolean_literal(anchor, true)),
                false,
            ));
        }
        loop_.init = Some(ForStatementInit::VariableDeclaration(declaration));
        if !prefix.is_empty() {
            prefix.push(statement.take_in(&ast));
            *statement = ast.statement_block(anchor, prefix);
        }
    }
}
