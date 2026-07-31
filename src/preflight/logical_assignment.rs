use oxc_allocator::{ArenaVec, Box as ArenaBox, CloneIn, TakeIn};
use oxc_ast::{
    AstBuilder,
    ast::{
        ArrowFunctionExpression, AssignmentTarget, Expression, FunctionBody, Program, Statement,
        StaticBlock, TSTypeAnnotation, VariableDeclarationKind,
    },
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::SPAN;
use oxc_syntax::operator::{AssignmentOperator, LogicalOperator};
use rustc_hash::FxHashSet;

/// Complete the private-field cases omitted by Oxc's logical-assignment pass.
pub(super) fn run<'a>(
    allocator: &'a oxc_allocator::Allocator,
    program: &mut Program<'a>,
    reserved_names: FxHashSet<String>,
) -> bool {
    let mut pass = PrivateLogicalAssignmentLowerer {
        ast: AstBuilder::new(allocator),
        reserved_names,
        temp_scopes: Vec::new(),
        bodies_with_temps: FxHashSet::default(),
        changed: false,
    };
    pass.visit_program(program);
    pass.changed
}

struct PrivateLogicalAssignmentLowerer<'a> {
    ast: AstBuilder<'a>,
    reserved_names: FxHashSet<String>,
    temp_scopes: Vec<Vec<&'a str>>,
    bodies_with_temps: FxHashSet<u32>,
    changed: bool,
}

impl<'a> PrivateLogicalAssignmentLowerer<'a> {
    fn reserve_temp(&mut self) -> &'a str {
        for suffix in 0.. {
            let candidate = if suffix == 0 {
                "_private".to_owned()
            } else {
                format!("_private{suffix}")
            };
            if self.reserved_names.insert(candidate.clone()) {
                let name = self.ast.allocator.alloc_str(&candidate);
                self.temp_scopes
                    .last_mut()
                    .expect("logical assignment must have an active var scope")
                    .push(name);
                return name;
            }
        }
        unreachable!()
    }

    #[expect(deprecated)]
    fn declaration(&self, names: Vec<&'a str>) -> Statement<'a> {
        let mut declarations = ArenaVec::new_in(&self.ast);
        for name in names {
            declarations.push(self.ast.variable_declarator(
                SPAN,
                VariableDeclarationKind::Var,
                self.ast.binding_pattern_binding_identifier(SPAN, name),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None,
                false,
            ));
        }
        Statement::VariableDeclaration(self.ast.alloc_variable_declaration(
            SPAN,
            VariableDeclarationKind::Var,
            declarations,
            false,
        ))
    }
}

#[expect(deprecated)]
impl<'a> VisitMut<'a> for PrivateLogicalAssignmentLowerer<'a> {
    fn visit_program(&mut self, program: &mut Program<'a>) {
        self.temp_scopes.push(Vec::new());
        walk_mut::walk_program(self, program);
        let names = self.temp_scopes.pop().unwrap();
        if !names.is_empty() {
            program.body.insert(0, self.declaration(names));
        }
    }

    fn visit_function_body(&mut self, body: &mut FunctionBody<'a>) {
        self.temp_scopes.push(Vec::new());
        walk_mut::walk_function_body(self, body);
        let names = self.temp_scopes.pop().unwrap();
        if !names.is_empty() {
            self.bodies_with_temps.insert(body.span.start);
            body.statements.insert(0, self.declaration(names));
        }
    }

    fn visit_arrow_function_expression(&mut self, arrow: &mut ArrowFunctionExpression<'a>) {
        walk_mut::walk_arrow_function_expression(self, arrow);
        if !arrow.expression || !self.bodies_with_temps.remove(&arrow.body.span.start) {
            return;
        }
        let Some(Statement::ExpressionStatement(statement)) = arrow.body.statements.last_mut()
        else {
            return;
        };
        let expression = statement.expression.take_in(&self.ast);
        *arrow.body.statements.last_mut().unwrap() =
            self.ast.statement_return(SPAN, Some(expression));
        arrow.expression = false;
    }

    fn visit_static_block(&mut self, block: &mut StaticBlock<'a>) {
        self.temp_scopes.push(Vec::new());
        walk_mut::walk_static_block(self, block);
        let names = self.temp_scopes.pop().unwrap();
        if !names.is_empty() {
            block.body.insert(0, self.declaration(names));
        }
    }

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
            let temp_name = self.reserve_temp();
            let object = private.object.take_in(&self.ast);
            let temp_target = self
                .ast
                .simple_assignment_target_assignment_target_identifier(SPAN, temp_name);
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
                    self.ast.expression_identifier(SPAN, temp_name),
                    field,
                    false,
                ));
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
