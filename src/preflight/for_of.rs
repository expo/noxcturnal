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
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

pub(super) struct Plan {
    names: FxHashMap<(u32, u32), Vec<ForOfNames>>,
}

struct ForOfNames {
    iterator: String,
    step: String,
    normal: String,
    failed: String,
    error: String,
    caught: String,
}

pub(super) fn prepare(semantic: &Semantic<'_>) -> Plan {
    let nodes = semantic.nodes();
    let loops = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| {
            matches!(node.kind(), AstKind::ForOfStatement(statement) if !statement.r#await)
                .then_some(id)
        })
        .collect::<FxHashSet<_>>();
    let mut reserved = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect::<FxHashSet<_>>();
    let mut names = FxHashMap::<(u32, u32), Vec<ForOfNames>>::default();
    let maximum_depth = loops
        .iter()
        .map(|id| for_of_depth(nodes, *id, &loops))
        .max()
        .unwrap_or(0);
    // The text implementation transformed only outermost loops, reparsed, and
    // repeated. Within each round it allocated names in Semantic NodeId order.
    // Preserve that ABI while the mutator reaches every retained loop in one
    // walk by planning depth rounds up front.
    for depth in 0..=maximum_depth {
        for (id, node) in nodes.iter_enumerated() {
            let AstKind::ForOfStatement(statement) = node.kind() else {
                continue;
            };
            if statement.r#await || for_of_depth(nodes, id, &loops) != depth {
                continue;
            }
            names
                .entry((statement.span.start, statement.span.end))
                .or_default()
                .push(ForOfNames {
                    iterator: reserve("_iterator", &mut reserved),
                    step: reserve("_step", &mut reserved),
                    normal: reserve("_iteratorNormalCompletion", &mut reserved),
                    failed: reserve("_didIteratorError", &mut reserved),
                    error: reserve("_iteratorError", &mut reserved),
                    caught: reserve("_iteratorError2", &mut reserved),
                });
        }
    }
    Plan { names }
}

fn for_of_depth(
    nodes: &oxc_semantic::AstNodes<'_>,
    id: NodeId,
    loops: &FxHashSet<NodeId>,
) -> usize {
    nodes
        .ancestor_ids(id)
        .filter(|ancestor| loops.contains(ancestor))
        .count()
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
    names: FxHashMap<(u32, u32), Vec<ForOfNames>>,
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
        let names = plans.remove(0);
        if plans.is_empty() {
            self.names.remove(&key);
        }
        let ForOfNames {
            iterator,
            step,
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
                    .map_err(|_| "for-of-assignment-target-not-implemented")?;
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
        let mut body = match statement.body {
            Statement::BlockStatement(block) => block.unbox().body,
            statement => {
                let mut statements = ArenaVec::new_in(&self.ast);
                statements.push(statement);
                statements
            }
        };
        body.insert(0, binding);

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
        let step_declaration = self.declarator(anchor, &step, None);
        #[expect(deprecated)]
        let init = self.ast.for_statement_init_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            self.vec([iterator_declaration, step_declaration]),
            false,
        );

        let next = self.call0(
            anchor,
            self.member(anchor, self.id(anchor, &iterator), "next"),
        );
        let assign_step = self.assign_name(anchor, &step, next);
        let done = self.member(anchor, assign_step, "done");
        let assign_normal = self.assign_name(anchor, &normal, done);
        #[expect(deprecated)]
        let test = self
            .ast
            .expression_unary(anchor, UnaryOperator::LogicalNot, assign_normal);
        let update = self.assign_name(
            anchor,
            &normal,
            self.ast.expression_boolean_literal(anchor, true),
        );
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
            self.member(anchor, self.id(anchor, &iterator), "return"),
            BinaryOperator::Inequality,
            self.ast.expression_null_literal(anchor),
        );
        #[expect(deprecated)]
        let should_return =
            self.ast
                .expression_logical(anchor, not_normal, LogicalOperator::And, has_return);
        let call_return = self.call0(
            anchor,
            self.member(anchor, self.id(anchor, &iterator), "return"),
        );
        #[expect(deprecated)]
        let return_if = self.ast.statement_if(
            anchor,
            should_return,
            self.expression_statement(anchor, call_return),
            None,
        );
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
