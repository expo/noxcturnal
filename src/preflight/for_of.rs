use std::collections::VecDeque;

use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, AssignmentTarget, Expression, ForOfStatement, ForStatementInit, ForStatementLeft,
        Program, Statement, TSTypeAnnotation, TSTypeParameterInstantiation,
        VariableDeclarationKind, VariableDeclarator,
    },
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::Semantic;
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

use super::helpers::CustomHelperRequests;
use crate::generated::inline_helpers::INLINE_FOR_OF_HELPER_DESCRIPTOR;

pub(super) struct Plan {
    names: FxHashMap<(u32, u32), VecDeque<ForOfNames>>,
    helper: String,
    shadowed_global: bool,
}

struct ForOfNames {
    iterator: String,
    step: String,
    caught: String,
}

pub(super) fn prepare(semantic: &Semantic<'_>) -> Plan {
    let nodes = semantic.nodes();
    let mut reserved = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect::<FxHashSet<_>>();
    reserved.extend(
        semantic
            .scoping()
            .root_unresolved_references()
            .keys()
            .map(|name| name.to_string()),
    );
    let shadowed_global = ["Symbol", "Array", "TypeError"].iter().any(|name| {
        semantic
            .scoping()
            .get_binding(semantic.scoping().root_scope_id(), (*name).into())
            .is_some()
    });
    let helper = reserve("_createForOfIteratorHelper", &mut reserved);
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
    // Retain that allocation order while the mutator reaches every retained
    // loop in one walk by planning depth rounds up front.
    for bucket in depth_buckets {
        for statement in bucket {
            names
                .entry((statement.span.start, statement.span.end))
                .or_default()
                .push_back(ForOfNames {
                    iterator: reserve("_iterator", &mut reserved),
                    step: reserve("_step", &mut reserved),
                    caught: reserve("_iteratorError2", &mut reserved),
                });
        }
    }
    Plan {
        names,
        helper,
        shadowed_global,
    }
}

impl Plan {
    pub(super) fn shadows_helper_globals(&self) -> bool {
        self.shadowed_global
    }

    pub(super) fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
}

pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: Plan,
    inline_helpers: bool,
) -> Result<(bool, CustomHelperRequests), &'static str> {
    let mut requests = CustomHelperRequests::default();
    if inline_helpers {
        requests.materialize_generated(
            &INLINE_FOR_OF_HELPER_DESCRIPTOR,
            true,
            &[("_createForOfIteratorHelper", &plan.helper)],
        );
    } else {
        let module = program.body.iter().any(|statement| {
            matches!(
                statement,
                Statement::ImportDeclaration(_)
                    | Statement::ExportNamedDeclaration(_)
                    | Statement::ExportDefaultDeclaration(_)
                    | Statement::ExportAllDeclaration(_)
            )
        });
        requests.materialize_runtime("createForOfIteratorHelper", &plan.helper, module);
    }
    let mut pass = ForOfLowerer {
        ast: AstBuilder::new(allocator),
        names: plan.names,
        helper: plan.helper,
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    match pass.error {
        Some(error) => Err(error),
        None => Ok((pass.changed, requests)),
    }
}

struct ForOfLowerer<'a> {
    ast: AstBuilder<'a>,
    names: FxHashMap<(u32, u32), VecDeque<ForOfNames>>,
    helper: String,
    changed: bool,
    error: Option<&'static str>,
}

#[expect(deprecated)]
impl<'a> ForOfLowerer<'a> {
    fn lower(
        &mut self,
        statement: ForOfStatement<'a>,
        labels: Vec<String>,
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
            step,
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
        let helper_call = self.ast.expression_call(
            anchor,
            self.id(anchor, &self.helper),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            self.vec([Argument::from(right)]),
            false,
        );
        let iterator_declaration = self.declarator(anchor, &iterator, Some(helper_call));
        let step_declaration = self.declarator(anchor, &step, None);
        let init = ForStatementInit::from(
            self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "s")),
        );
        let next = self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "n"));
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
        // The loop-head binding and the source body have distinct lexical
        // environments. Keep an existing body block nested so declarations in
        // it may legally shadow the per-iteration binding.
        let body = self.vec([binding, statement.body]);
        #[expect(deprecated)]
        let loop_body = self.ast.statement_block(anchor, body);
        #[expect(deprecated)]
        let mut loop_statement =
            self.ast
                .statement_for(anchor, Some(init), Some(test), None, loop_body);
        for label in labels.into_iter().rev() {
            #[expect(deprecated)]
            {
                loop_statement = self.ast.statement_labeled(
                    anchor,
                    self.ast
                        .label_identifier(anchor, self.ast.allocator.alloc_str(&label)),
                    loop_statement,
                );
            }
        }

        let try_block = self
            .ast
            .alloc_block_statement(anchor, self.vec([loop_statement]));
        let report_error = self.ast.expression_call(
            anchor,
            self.member(anchor, self.id(anchor, &iterator), "e"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            self.vec([Argument::from(self.id(anchor, &caught))]),
            false,
        );
        let catch_body = self.ast.alloc_block_statement(
            anchor,
            self.vec([self.expression_statement(anchor, report_error)]),
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

        let close = self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "f"));
        let outer_finally = self
            .ast
            .alloc_block_statement(anchor, self.vec([self.expression_statement(anchor, close)]));
        let try_statement =
            self.ast
                .statement_try(anchor, try_block, Some(catch), Some(outer_finally));
        let declarations = self.vec([iterator_declaration, step_declaration]);
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
        let mut target = &*statement;
        while let Statement::LabeledStatement(labeled) = target {
            target = &labeled.body;
        }
        if !matches!(target, Statement::ForOfStatement(for_of) if !for_of.r#await) {
            return Ok(false);
        }
        let enclosing_span = statement.span();
        let mut target = statement.take_in(&self.ast);
        let mut labels = Vec::new();
        while let Statement::LabeledStatement(labeled) = target {
            let labeled = labeled.unbox();
            labels.push(labeled.label.name.to_string());
            target = labeled.body;
        }
        let Statement::ForOfStatement(for_of) = target else {
            unreachable!()
        };
        *statement = self.lower(for_of.unbox(), labels, enclosing_span)?;
        Ok(true)
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
