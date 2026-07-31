use std::collections::VecDeque;

use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, AssignmentTarget, CatchClause, Expression, ForOfStatement, ForStatementLeft,
        Program, Statement, TSTypeAnnotation, TSTypeParameterInstantiation,
        VariableDeclarationKind, VariableDeclarator,
    },
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::Semantic;
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

pub(super) struct Plan {
    names: FxHashMap<(u32, u32), VecDeque<ForOfNames>>,
}

struct ForOfNames {
    iterator: String,
    next_method: String,
    step: String,
    return_method: String,
    return_result: String,
    normal: String,
    failed: String,
    error: String,
    caught: String,
}

pub(super) fn prepare(semantic: &Semantic<'_>) -> Plan {
    let nodes = semantic.nodes();
    let mut reserved = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect::<FxHashSet<_>>();
    let mut names = FxHashMap::<(u32, u32), VecDeque<ForOfNames>>::default();
    let mut depth_buckets = Vec::<Vec<&ForOfStatement<'_>>>::new();
    let mut active_loop_ends = Vec::<u32>::new();
    for (_, node) in nodes.iter_enumerated() {
        let AstKind::ForOfStatement(statement) = node.kind() else {
            continue;
        };
        while active_loop_ends
            .last()
            .is_some_and(|end| statement.span.start >= *end)
        {
            active_loop_ends.pop();
        }
        if statement.r#await {
            continue;
        }
        let depth = active_loop_ends.len();
        if depth_buckets.len() == depth {
            depth_buckets.push(Vec::new());
        }
        depth_buckets[depth].push(statement);
        active_loop_ends.push(statement.span.end);
    }
    // The text implementation transformed only outermost loops, reparsed, and
    // repeated. Within each round it allocated names in Semantic NodeId order.
    // Preserve that ABI while the mutator reaches every retained loop in one
    // walk by planning depth rounds up front.
    for bucket in depth_buckets {
        for statement in bucket {
            names
                .entry((statement.span.start, statement.span.end))
                .or_default()
                .push_back(ForOfNames {
                    iterator: reserve("_iterator", &mut reserved),
                    next_method: reserve("_iteratorNext", &mut reserved),
                    step: reserve("_step", &mut reserved),
                    return_method: reserve("_iteratorReturnMethod", &mut reserved),
                    return_result: reserve("_iteratorReturn", &mut reserved),
                    normal: reserve("_iteratorNormalCompletion", &mut reserved),
                    failed: reserve("_didIteratorError", &mut reserved),
                    error: reserve("_iteratorError", &mut reserved),
                    caught: reserve("_iteratorError2", &mut reserved),
                });
        }
    }
    Plan { names }
}

impl Plan {
    pub(super) fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
}

pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: Plan,
) -> Result<bool, &'static str> {
    let mut pass = ForOfLowerer {
        ast: AstBuilder::new(allocator),
        names: plan.names,
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    match pass.error {
        Some(error) => Err(error),
        None => Ok(pass.changed),
    }
}

struct ForOfLowerer<'a> {
    ast: AstBuilder<'a>,
    names: FxHashMap<(u32, u32), VecDeque<ForOfNames>>,
    changed: bool,
    error: Option<&'static str>,
}

#[expect(deprecated)]
impl<'a> ForOfLowerer<'a> {
    fn lower(
        &mut self,
        statement: ForOfStatement<'a>,
        label: Option<&str>,
        enclosing_span: Span,
    ) -> Result<Statement<'a>, &'static str> {
        let key = (statement.span.start, statement.span.end);
        let Some(plans) = self.names.get_mut(&key) else {
            return Err("for-of-ast-target-missing");
        };
        let names = plans.pop_front().expect("nonempty for-of plan bucket");
        if plans.is_empty() {
            self.names.remove(&key);
        }
        let ForOfNames {
            iterator,
            next_method,
            step,
            return_method,
            return_result,
            normal,
            failed,
            error,
            caught,
        } = names;
        let anchor = Span::new(
            enclosing_span.start,
            enclosing_span
                .start
                .saturating_add(1)
                .min(enclosing_span.end),
        );

        let right = statement.right;
        let step_value = self.member(anchor, self.id(anchor, &step), "value");
        let binding = match statement.left {
            ForStatementLeft::VariableDeclaration(mut declaration) => {
                let Some(declarator) = declaration.declarations.first_mut() else {
                    return Err("for-of-empty-declaration");
                };
                declarator.init = Some(step_value);
                Statement::VariableDeclaration(declaration)
            }
            target => {
                let target = AssignmentTarget::try_from(target)
                    .map_err(|_| "for-of-assignment-target-invalid")?;
                #[expect(deprecated)]
                let assignment = self.ast.expression_assignment(
                    target.span(),
                    AssignmentOperator::Assign,
                    target,
                    step_value,
                );
                #[expect(deprecated)]
                self.ast.statement_expression(assignment.span(), assignment)
            }
        };
        let symbol_iterator = self.member(anchor, self.id(anchor, "Symbol"), "iterator");
        let iterator_method = {
            #[expect(deprecated)]
            {
                Expression::from(self.ast.member_expression_computed(
                    anchor,
                    right,
                    symbol_iterator,
                    false,
                ))
            }
        };
        let iterator_init = self.call0(anchor, iterator_method);
        let iterator_declaration = self.declarator(anchor, &iterator, Some(iterator_init));
        let next_method_declaration = self.declarator(
            anchor,
            &next_method,
            Some(self.member(anchor, self.id(anchor, &iterator), "next")),
        );
        let step_declaration = self.declarator(anchor, &step, None);
        #[expect(deprecated)]
        let init = self.ast.for_statement_init_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            self.vec([
                iterator_declaration,
                next_method_declaration,
                step_declaration,
            ]),
            false,
        );

        let mut next_arguments = ArenaVec::new_in(&self.ast);
        next_arguments.push(Argument::from(self.id(anchor, &iterator)));
        #[expect(deprecated)]
        let next = self.ast.expression_call(
            anchor,
            self.member(anchor, self.id(anchor, &next_method), "call"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            next_arguments,
            false,
        );
        let assign_step = self.assign_name(anchor, &step, next);
        let done = self.member(anchor, self.id(anchor, &step), "done");
        #[expect(deprecated)]
        let not_done = self
            .ast
            .expression_unary(anchor, UnaryOperator::LogicalNot, done);
        #[expect(deprecated)]
        let test = self
            .ast
            .expression_sequence(anchor, self.vec([assign_step, not_done]));
        let update = self.assign_name(
            anchor,
            &normal,
            self.ast.expression_boolean_literal(anchor, true),
        );
        // IteratorNext and IteratorComplete both happen before the loop is in
        // an abruptly-closeable state. Validate the result before flipping
        // `normal`; otherwise this TypeError would incorrectly call return().
        let validate_step = self.validate_iterator_result(anchor, &step);
        let mark_abrupt = self.expression_statement(
            anchor,
            self.assign_name(
                anchor,
                &normal,
                self.ast.expression_boolean_literal(anchor, false),
            ),
        );
        // The loop-head binding and the source body have distinct lexical
        // environments. Keep an existing body block nested so declarations in
        // it may legally shadow the per-iteration binding.
        let body = self.vec([validate_step, mark_abrupt, binding, statement.body]);
        #[expect(deprecated)]
        let loop_body = self.ast.statement_block(anchor, body);
        #[expect(deprecated)]
        let mut loop_statement =
            self.ast
                .statement_for(anchor, Some(init), Some(test), Some(update), loop_body);
        if let Some(label) = label {
            #[expect(deprecated)]
            {
                loop_statement = self.ast.statement_labeled(
                    anchor,
                    self.ast
                        .label_identifier(anchor, self.ast.allocator.alloc_str(label)),
                    loop_statement,
                );
            }
        }

        let try_block = self
            .ast
            .alloc_block_statement(anchor, self.vec([loop_statement]));
        let catch_body = self.ast.alloc_block_statement(
            anchor,
            self.vec([
                self.expression_statement(
                    anchor,
                    self.assign_name(
                        anchor,
                        &failed,
                        self.ast.expression_boolean_literal(anchor, true),
                    ),
                ),
                self.expression_statement(
                    anchor,
                    self.assign_name(anchor, &error, self.id(anchor, &caught)),
                ),
            ]),
        );
        #[expect(deprecated)]
        let catch = self.ast.alloc_catch_clause(
            anchor,
            Some(self.ast.catch_parameter(
                anchor,
                self.ast.binding_pattern_binding_identifier(
                    anchor,
                    self.ast.allocator.alloc_str(&caught),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            )),
            catch_body,
        );

        #[expect(deprecated)]
        let not_normal =
            self.ast
                .expression_unary(anchor, UnaryOperator::LogicalNot, self.id(anchor, &normal));
        #[expect(deprecated)]
        let has_return = self.ast.expression_binary(
            anchor,
            self.assign_name(
                anchor,
                &return_method,
                self.member(anchor, self.id(anchor, &iterator), "return"),
            ),
            BinaryOperator::Inequality,
            self.ast.expression_null_literal(anchor),
        );
        #[expect(deprecated)]
        let should_return =
            self.ast
                .expression_logical(anchor, not_normal, LogicalOperator::And, has_return);
        let mut return_arguments = ArenaVec::new_in(&self.ast);
        return_arguments.push(Argument::from(self.id(anchor, &iterator)));
        #[expect(deprecated)]
        let call_return = self.ast.expression_call(
            anchor,
            self.member(anchor, self.id(anchor, &return_method), "call"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            return_arguments,
            false,
        );
        let assign_return = self.assign_name(anchor, &return_result, call_return);
        let validate_return = self.validate_iterator_result(anchor, &return_result);
        #[expect(deprecated)]
        let return_body = self.ast.statement_block(
            anchor,
            self.vec([
                self.expression_statement(anchor, assign_return),
                validate_return,
            ]),
        );
        #[expect(deprecated)]
        let return_if = self
            .ast
            .statement_if(anchor, should_return, return_body, None);
        let inner_try_block = self
            .ast
            .alloc_block_statement(anchor, self.vec([return_if]));
        #[expect(deprecated)]
        let throw_if = self.ast.statement_if(
            anchor,
            self.id(anchor, &failed),
            self.ast.statement_throw(anchor, self.id(anchor, &error)),
            None,
        );
        let inner_finally = self.ast.alloc_block_statement(anchor, self.vec([throw_if]));
        #[expect(deprecated)]
        let inner_try = self.ast.statement_try(
            anchor,
            inner_try_block,
            None::<ArenaBox<'a, CatchClause<'a>>>,
            Some(inner_finally),
        );
        let outer_finally = self
            .ast
            .alloc_block_statement(anchor, self.vec([inner_try]));
        #[expect(deprecated)]
        let try_statement =
            self.ast
                .statement_try(anchor, try_block, Some(catch), Some(outer_finally));

        let declarations = self.vec([
            self.declarator(
                anchor,
                &normal,
                Some(self.ast.expression_boolean_literal(anchor, true)),
            ),
            self.declarator(
                anchor,
                &failed,
                Some(self.ast.expression_boolean_literal(anchor, false)),
            ),
            self.declarator(anchor, &error, None),
            self.declarator(anchor, &return_method, None),
            self.declarator(anchor, &return_result, None),
        ]);
        let variables = Statement::VariableDeclaration(self.ast.alloc_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            declarations,
            false,
        ));
        #[expect(deprecated)]
        Ok(self
            .ast
            .statement_block(enclosing_span, self.vec([variables, try_statement])))
    }

    fn id(&self, span: Span, name: &str) -> Expression<'a> {
        self.ast
            .expression_identifier(span, self.ast.allocator.alloc_str(name))
    }

    fn member(&self, span: Span, object: Expression<'a>, property: &str) -> Expression<'a> {
        #[expect(deprecated)]
        {
            Expression::from(
                self.ast.member_expression_static(
                    span,
                    object,
                    self.ast
                        .identifier_name(span, self.ast.allocator.alloc_str(property)),
                    false,
                ),
            )
        }
    }

    fn call0(&self, span: Span, callee: Expression<'a>) -> Expression<'a> {
        #[expect(deprecated)]
        {
            self.ast.expression_call(
                span,
                callee,
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                ArenaVec::<Argument<'a>>::new_in(&self.ast),
                false,
            )
        }
    }

    fn assign_name(&self, span: Span, name: &str, right: Expression<'a>) -> Expression<'a> {
        #[expect(deprecated)]
        let left = self
            .ast
            .simple_assignment_target_assignment_target_identifier(
                span,
                self.ast.allocator.alloc_str(name),
            );
        #[expect(deprecated)]
        {
            self.ast
                .expression_assignment(span, AssignmentOperator::Assign, left.into(), right)
        }
    }

    fn expression_statement(&self, span: Span, expression: Expression<'a>) -> Statement<'a> {
        #[expect(deprecated)]
        {
            self.ast.statement_expression(span, expression)
        }
    }

    fn validate_iterator_result(&self, span: Span, name: &str) -> Statement<'a> {
        let mut object_arguments = ArenaVec::new_in(&self.ast);
        object_arguments.push(Argument::from(self.id(span, name)));
        #[expect(deprecated)]
        let object_result = self.ast.expression_call(
            span,
            self.id(span, "Object"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            object_arguments,
            false,
        );
        #[expect(deprecated)]
        let invalid = self.ast.expression_binary(
            span,
            object_result,
            BinaryOperator::StrictInequality,
            self.id(span, name),
        );
        let mut error_arguments = ArenaVec::new_in(&self.ast);
        error_arguments.push(Argument::from(self.ast.expression_string_literal(
            span,
            "Iterator result is not an object",
            None,
        )));
        let error = self.ast.expression_new(
            span,
            self.id(span, "TypeError"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            error_arguments,
        );
        #[expect(deprecated)]
        self.ast
            .statement_if(span, invalid, self.ast.statement_throw(span, error), None)
    }

    fn declarator(
        &self,
        span: Span,
        name: &str,
        init: Option<Expression<'a>>,
    ) -> VariableDeclarator<'a> {
        #[expect(deprecated)]
        {
            self.ast.variable_declarator(
                span,
                VariableDeclarationKind::Var,
                self.ast
                    .binding_pattern_binding_identifier(span, self.ast.allocator.alloc_str(name)),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                init,
                false,
            )
        }
    }

    fn vec<T, const N: usize>(&self, values: [T; N]) -> ArenaVec<'a, T> {
        let mut result = ArenaVec::with_capacity_in(N, &self.ast);
        result.extend(values);
        result
    }

    fn lower_statement(&mut self, statement: &mut Statement<'a>) -> Result<bool, &'static str> {
        if let Statement::LabeledStatement(labeled) = statement
            && matches!(
                labeled.body,
                Statement::ForOfStatement(ref for_of) if !for_of.r#await
            )
        {
            let enclosing_span = labeled.span;
            let label = labeled.label.name.to_string();
            let old = statement.take_in(&self.ast);
            let Statement::LabeledStatement(labeled) = old else {
                unreachable!();
            };
            let Statement::ForOfStatement(for_of) = labeled.unbox().body else {
                unreachable!();
            };
            *statement = self.lower(for_of.unbox(), Some(&label), enclosing_span)?;
            return Ok(true);
        }
        if matches!(
            statement,
            Statement::ForOfStatement(for_of) if !for_of.r#await
        ) {
            let old = statement.take_in(&self.ast);
            let Statement::ForOfStatement(for_of) = old else {
                unreachable!();
            };
            let span = for_of.span;
            *statement = self.lower(for_of.unbox(), None, span)?;
            return Ok(true);
        }
        Ok(false)
    }
}

impl<'a> VisitMut<'a> for ForOfLowerer<'a> {
    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        if self.error.is_some() {
            return;
        }
        match self.lower_statement(statement) {
            Ok(true) => {
                self.changed = true;
                // The old text pass revisited its output to reach nested loops.
                // Walking the replacement now reaches the retained original body
                // while ignoring the generated ordinary `for` statement.
                walk_mut::walk_statement(self, statement);
            }
            Ok(false) => walk_mut::walk_statement(self, statement),
            Err(error) => self.error = Some(error),
        }
    }
}

fn reserve(base: &str, reserved: &mut FxHashSet<String>) -> String {
    if reserved.insert(base.to_owned()) {
        return base.to_owned();
    }
    for suffix in reserved.len().max(2).. {
        let candidate = format!("{base}{suffix}");
        if reserved.insert(candidate.clone()) {
            return candidate;
        }
    }
    unreachable!()
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    #[test]
    fn nested_loop_depth_plans_all_loops() {
        let source = format!(
            "{}value;{}",
            "for (const value of values) {".repeat(64),
            "}".repeat(64)
        );
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare(&semantic.semantic);
        assert_eq!(plan.names.len(), 64);
    }
}
