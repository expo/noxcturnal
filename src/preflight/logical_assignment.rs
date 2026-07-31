use oxc_allocator::{ArenaVec, Box as ArenaBox, CloneIn, TakeIn};
use oxc_ast::{
    AstBuilder,
    ast::{
        AssignmentTarget, Expression, Program, Statement, TSTypeAnnotation, VariableDeclarationKind,
    },
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::SPAN;
use oxc_syntax::operator::{AssignmentOperator, LogicalOperator};

/// Complete the private-field cases omitted by Oxc's logical-assignment pass.
#[expect(deprecated)]
pub(super) fn run<'a>(
    allocator: &'a oxc_allocator::Allocator,
    program: &mut Program<'a>,
    temp_name: &str,
) -> bool {
    let mut pass = PrivateLogicalAssignmentLowerer {
        ast: AstBuilder::new(allocator),
        temp_name: allocator.alloc_str(temp_name),
        used_temp: false,
        changed: false,
    };
    pass.visit_program(program);
    if pass.used_temp {
        let mut declarations = ArenaVec::new_in(&pass.ast);
        declarations.push(
            pass.ast.variable_declarator(
                SPAN,
                VariableDeclarationKind::Var,
                pass.ast
                    .binding_pattern_binding_identifier(SPAN, pass.temp_name),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None,
                false,
            ),
        );
        program.body.insert(
            0,
            Statement::VariableDeclaration(pass.ast.alloc_variable_declaration(
                SPAN,
                VariableDeclarationKind::Var,
                declarations,
                false,
            )),
        );
    }
    pass.changed
}

struct PrivateLogicalAssignmentLowerer<'a> {
    ast: AstBuilder<'a>,
    temp_name: &'a str,
    used_temp: bool,
    changed: bool,
}

#[expect(deprecated)]
impl<'a> VisitMut<'a> for PrivateLogicalAssignmentLowerer<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        walk_mut::walk_expression(self, expression);

        let Expression::AssignmentExpression(assignment) = expression else {
            return;
        };
        let logical = match assignment.operator {
            AssignmentOperator::LogicalOr => LogicalOperator::Or,
            AssignmentOperator::LogicalAnd => LogicalOperator::And,
            AssignmentOperator::LogicalNullish => LogicalOperator::Coalesce,
            _ => return,
        };
        let AssignmentTarget::PrivateFieldExpression(_) = &assignment.left else {
            return;
        };

        let span = assignment.span;
        let old = expression.take_in(&self.ast);
        let Expression::AssignmentExpression(assignment) = old else {
            unreachable!();
        };
        let mut assignment = assignment.unbox();
        let AssignmentTarget::PrivateFieldExpression(mut private) = assignment.left else {
            unreachable!();
        };
        let simple_base = matches!(
            private.object,
            Expression::ThisExpression(_) | Expression::Identifier(_)
        );
        let read = if simple_base {
            let read = Expression::PrivateFieldExpression(private.clone_in(self.ast.allocator));
            assignment.left = AssignmentTarget::PrivateFieldExpression(private);
            read
        } else {
            let object = private.object.take_in(&self.ast);
            let temp_target = self
                .ast
                .simple_assignment_target_assignment_target_identifier(SPAN, self.temp_name);
            let assigned_object = self.ast.expression_assignment(
                SPAN,
                AssignmentOperator::Assign,
                temp_target.into(),
                object,
            );
            let field = private.field.clone_in(self.ast.allocator);
            let read = Expression::from(self.ast.member_expression_private_field_expression(
                private.span,
                assigned_object,
                field.clone_in(self.ast.allocator),
                false,
            ));
            assignment.left =
                AssignmentTarget::from(self.ast.member_expression_private_field_expression(
                    private.span,
                    self.ast.expression_identifier(SPAN, self.temp_name),
                    field,
                    false,
                ));
            self.used_temp = true;
            read
        };
        assignment.operator = AssignmentOperator::Assign;
        #[expect(deprecated)]
        {
            *expression = self.ast.expression_logical(
                span,
                read,
                logical,
                Expression::AssignmentExpression(ArenaBox::new_in(assignment, &self.ast)),
            );
        }
        self.changed = true;
    }
}
