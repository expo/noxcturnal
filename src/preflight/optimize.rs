use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::{
    AstBuilder,
    ast::{Expression, NumberBase, Program, Statement, VariableDeclaration},
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::{SemanticBuilder, SymbolId};
use oxc_span::{GetSpan, SPAN};
use rustc_hash::FxHashSet;

use crate::semantic::constant_eval::{EvaluatedConstant, evaluate_expression};

/// Run the deliberately small optimization surface used by Metro after its
/// source transforms. This is not a general compressor: retaining Metro's
/// conservative behavior is more important than finding additional folds.
pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    constant_folding: bool,
    dead_code_elimination: bool,
) {
    if constant_folding {
        ConstantFolder {
            ast: AstBuilder::new(allocator),
        }
        .visit_program(program);
    }
    if dead_code_elimination {
        eliminate_dead_functions(program);
    }
}

struct ConstantFolder<'a> {
    ast: AstBuilder<'a>,
}

impl<'a> ConstantFolder<'a> {
    #[expect(deprecated)]
    fn literal(&self, span: oxc_span::Span, value: EvaluatedConstant) -> Expression<'a> {
        match value {
            EvaluatedConstant::Null => self.ast.expression_null_literal(span),
            EvaluatedConstant::Boolean(value) => self.ast.expression_boolean_literal(span, value),
            EvaluatedConstant::Number(value) => {
                self.ast
                    .expression_numeric_literal(span, value, None, NumberBase::Decimal)
            }
            EvaluatedConstant::String(value) => {
                let value = self.ast.allocator.alloc_str(&value);
                self.ast.expression_string_literal(span, value, None)
            }
        }
    }
}

impl<'a> VisitMut<'a> for ConstantFolder<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        walk_mut::walk_expression(self, expression);
        let span = expression.span();
        match expression {
            Expression::UnaryExpression(unary)
                if unary.operator == oxc_syntax::operator::UnaryOperator::Void
                    && matches!(
                        unary.argument,
                        Expression::NullLiteral(_)
                            | Expression::BooleanLiteral(_)
                            | Expression::NumericLiteral(_)
                            | Expression::StringLiteral(_)
                    ) =>
            {
                #[expect(deprecated)]
                {
                    *expression = self.ast.expression_identifier(SPAN, "undefined");
                }
            }
            Expression::UnaryExpression(_) | Expression::BinaryExpression(_) => {
                if let Some(value) = evaluate_expression(expression) {
                    *expression = self.literal(span, value);
                }
            }
            Expression::LogicalExpression(logical) => {
                let Some(left) = evaluate_expression(&logical.left) else {
                    return;
                };
                let use_right = match logical.operator {
                    oxc_syntax::operator::LogicalOperator::Or => !left.truthy(),
                    oxc_syntax::operator::LogicalOperator::And => left.truthy(),
                    oxc_syntax::operator::LogicalOperator::Coalesce => {
                        matches!(left, EvaluatedConstant::Null)
                    }
                };
                *expression = if use_right {
                    logical.right.take_in(&self.ast)
                } else {
                    logical.left.take_in(&self.ast)
                };
            }
            Expression::ConditionalExpression(conditional) => {
                let Some(test) = evaluate_expression(&conditional.test) else {
                    return;
                };
                *expression = if test.truthy() {
                    conditional.consequent.take_in(&self.ast)
                } else {
                    conditional.alternate.take_in(&self.ast)
                };
            }
            _ => {}
        }
    }

    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        walk_mut::walk_statement(self, statement);
        let Statement::IfStatement(if_statement) = statement else {
            return;
        };
        let Some(test) = evaluate_expression(&if_statement.test) else {
            return;
        };
        *statement = if test.truthy() {
            if_statement.consequent.take_in(&self.ast)
        } else if let Some(alternate) = &mut if_statement.alternate {
            alternate.take_in(&self.ast)
        } else {
            #[expect(deprecated)]
            self.ast.statement_empty(if_statement.span)
        };
    }
}

fn eliminate_dead_functions(program: &mut Program<'_>) {
    loop {
        let semantic = SemanticBuilder::new().build(program);
        if !semantic.diagnostics.is_empty() {
            return;
        }
        let scoping = semantic.semantic.into_scoping();
        let unused = scoping
            .symbol_ids()
            .filter(|symbol_id| scoping.get_resolved_reference_ids(*symbol_id).is_empty())
            .collect();
        let mut remover = DeadFunctionRemover {
            unused,
            changed: false,
        };
        remover.visit_program(program);
        if !remover.changed {
            return;
        }
    }
}

struct DeadFunctionRemover {
    unused: FxHashSet<SymbolId>,
    changed: bool,
}

impl DeadFunctionRemover {
    fn unused_binding<'a>(&self, declaration: &oxc_ast::ast::VariableDeclarator<'a>) -> bool {
        declaration
            .id
            .get_binding_identifier()
            .and_then(|identifier| identifier.symbol_id.get())
            .is_some_and(|symbol_id| self.unused.contains(&symbol_id))
            && matches!(
                declaration.init,
                Some(Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_))
            )
    }

    fn remove_declarators(&mut self, declaration: &mut VariableDeclaration<'_>) {
        let before = declaration.declarations.len();
        declaration
            .declarations
            .retain(|declarator| !self.unused_binding(declarator));
        self.changed |= declaration.declarations.len() != before;
    }
}

impl<'a> VisitMut<'a> for DeadFunctionRemover {
    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        walk_mut::walk_variable_declaration(self, declaration);
        self.remove_declarators(declaration);
    }

    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        walk_mut::walk_statements(self, statements);
        let before = statements.len();
        statements.retain(|statement| match statement {
            Statement::FunctionDeclaration(function) => function
                .id
                .as_ref()
                .and_then(|identifier| identifier.symbol_id.get())
                .is_none_or(|symbol_id| !self.unused.contains(&symbol_id)),
            Statement::VariableDeclaration(declaration) => !declaration.declarations.is_empty(),
            _ => true,
        });
        self.changed |= statements.len() != before;
    }
}
