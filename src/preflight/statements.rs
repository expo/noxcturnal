//! Statement expansion before semantic planning. Keep the original statement,
//! including any label chain, intact inside its new statement-list body.
use oxc_allocator::{Allocator, TakeIn, Vec as ArenaVec};
use oxc_ast::{ast::*, builder::AstBuilder};
use oxc_ast_visit::{Visit, VisitMut, walk_mut};
use oxc_span::GetSpan;

pub(super) fn prepend<'a>(
    allocator: &'a Allocator,
    statement: &mut Statement<'a>,
    mut prefix: ArenaVec<'a, Statement<'a>>,
) {
    let ast = AstBuilder::new(allocator);
    let span = statement.span();
    prefix.push(statement.take_in(&ast));
    *statement = Statement::new_block_statement(span, prefix, &ast);
}

/// Refresh emits signature statements beside function definitions. Supply a
/// local statement list for single bodies that contain such definitions, before
/// building semantics or instrumenting them. Header expressions need a separate
/// expression-local path and are not moved into the body by this normalization.
pub(super) fn prepare_refresh<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    struct Functions(bool);
    impl<'a> Visit<'a> for Functions {
        fn visit_function(&mut self, _: &Function<'a>, _: oxc_syntax::scope::ScopeFlags) {
            self.0 = true;
        }
        fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {
            self.0 = true;
        }
    }
    struct Bodies<'a>(&'a Allocator);
    impl<'a> Bodies<'a> {
        fn prepare(&self, body: &mut Statement<'a>) {
            if matches!(body, Statement::BlockStatement(_)) {
                return;
            }
            let mut functions = Functions(false);
            functions.visit_statement(body);
            if functions.0 {
                prepend(self.0, body, ArenaVec::new_in(&self.0));
            }
        }
    }
    impl<'a> VisitMut<'a> for Bodies<'a> {
        fn visit_statement(&mut self, statement: &mut Statement<'a>) {
            walk_mut::walk_statement(self, statement);
            match statement {
                Statement::IfStatement(if_) => {
                    self.prepare(&mut if_.consequent);
                    if let Some(alternate) = &mut if_.alternate {
                        self.prepare(alternate);
                    }
                }
                Statement::ForStatement(loop_) => self.prepare(&mut loop_.body),
                Statement::ForInStatement(loop_) => self.prepare(&mut loop_.body),
                Statement::ForOfStatement(loop_) => self.prepare(&mut loop_.body),
                Statement::WhileStatement(loop_) => self.prepare(&mut loop_.body),
                Statement::DoWhileStatement(loop_) => self.prepare(&mut loop_.body),
                Statement::WithStatement(with) => self.prepare(&mut with.body),
                _ => {}
            }
        }
    }
    Bodies(allocator).visit_program(program);
}
