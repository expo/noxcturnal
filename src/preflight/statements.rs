//! Statement expansion before semantic planning. Keep the original statement,
//! including any label chain, intact inside its new statement-list body.
use oxc_allocator::{Address, Allocator, GetAddress, TakeIn, Vec as ArenaVec};
use oxc_ast::{ast::*, builder::AstBuilder};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::GetSpan;
use rustc_hash::FxHashSet;

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
    struct Bodies<'a> {
        allocator: &'a Allocator,
        functions: usize,
        single_bodies: FxHashSet<Address>,
    }
    impl Bodies<'_> {
        fn remember(&mut self, body: &Statement<'_>) {
            if !matches!(body, Statement::BlockStatement(_)) {
                self.single_bodies.insert(body.address());
            }
        }
    }
    impl<'a> VisitMut<'a> for Bodies<'a> {
        fn visit_function(
            &mut self,
            function: &mut Function<'a>,
            flags: oxc_syntax::scope::ScopeFlags,
        ) {
            self.functions += 1;
            walk_mut::walk_function(self, function, flags);
        }
        fn visit_arrow_function_expression(&mut self, arrow: &mut ArrowFunctionExpression<'a>) {
            self.functions += 1;
            walk_mut::walk_arrow_function_expression(self, arrow);
        }
        fn visit_statement(&mut self, statement: &mut Statement<'a>) {
            // Semantics have not been built yet. Arena identities mark only
            // live single bodies and are consumed before replacing that body.
            let single = self.single_bodies.remove(&statement.address());
            match statement {
                Statement::IfStatement(if_) => {
                    self.remember(&if_.consequent);
                    if let Some(alternate) = &if_.alternate {
                        self.remember(alternate);
                    }
                }
                Statement::ForStatement(loop_) => self.remember(&loop_.body),
                Statement::ForInStatement(loop_) => self.remember(&loop_.body),
                Statement::ForOfStatement(loop_) => self.remember(&loop_.body),
                Statement::WhileStatement(loop_) => self.remember(&loop_.body),
                Statement::DoWhileStatement(loop_) => self.remember(&loop_.body),
                Statement::WithStatement(with) => self.remember(&with.body),
                _ => {}
            }
            let before = self.functions;
            walk_mut::walk_statement(self, statement);
            if single && self.functions != before {
                prepend(self.allocator, statement, ArenaVec::new_in(&self.allocator));
            }
        }
    }
    Bodies {
        allocator,
        functions: 0,
        single_bodies: FxHashSet::default(),
    }
    .visit_program(program);
}
