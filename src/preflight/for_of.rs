use oxc_allocator::GetAllocator;
use oxc_ast::builder::GetAstBuilder;

use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstKind,
    ast::{
        Argument, AssignmentTarget, Expression, ForOfStatement, ForStatementInit, ForStatementLeft,
        Program, Statement, TSTypeAnnotation, TSTypeParameterInstantiation,
        VariableDeclarationKind, VariableDeclarator,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

use super::helpers::CustomHelperRequests;
use crate::generated::inline_helpers::INLINE_FOR_OF_HELPER_DESCRIPTOR;

pub(super) struct Plan {
    names: FxHashMap<NodeId, ForOfNames>,
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
    let mut names = FxHashMap::<NodeId, ForOfNames>::default();
    let mut depth_buckets = Vec::<Vec<NodeId>>::new();
    let mut ancestry = Vec::<(NodeId, usize)>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let parent = nodes.parent_id(node_id);
        while ancestry.last().is_some_and(|(id, _)| *id != parent) {
            ancestry.pop();
        }
        let depth = ancestry.last().map_or(0, |(_, depth)| *depth);
        let selected =
            matches!(node.kind(), AstKind::ForOfStatement(statement) if !statement.r#await);
        ancestry.push((node_id, depth + usize::from(selected)));
        if !selected {
            continue;
        }
        if depth_buckets.len() == depth {
            depth_buckets.push(Vec::new());
        }
        depth_buckets[depth].push(node_id);
    }
    // The text implementation transformed only outermost loops, reparsed, and
    // repeated. Within each round it allocated names in Semantic NodeId order.
    // Retain that allocation order while the mutator reaches every retained
    // loop in one walk by planning depth rounds up front.
    for bucket in depth_buckets {
        for node_id in bucket {
            names.insert(
                node_id,
                ForOfNames {
                    iterator: reserve("_iterator", &mut reserved),
                    step: reserve("_step", &mut reserved),
                    caught: reserve("_iteratorError2", &mut reserved),
                },
            );
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
    names: FxHashMap<NodeId, ForOfNames>,
    helper: String,
    changed: bool,
    error: Option<&'static str>,
}

impl<'a> ForOfLowerer<'a> {
    fn lower(
        &mut self,
        statement: ForOfStatement<'a>,
        labels: Vec<String>,
        enclosing_span: Span,
    ) -> Result<Statement<'a>, &'static str> {
        let Some(names) = self.names.remove(&statement.node_id.get()) else {
            return Err("for-of-ast-target-missing");
        };
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
                let assignment = oxc_ast::ast::Expression::new_assignment_expression(
                    target.span(),
                    AssignmentOperator::Assign,
                    target,
                    step_value,
                    self.ast.builder(),
                );
                oxc_ast::ast::Statement::new_expression_statement(
                    assignment.span(),
                    assignment,
                    self.ast.builder(),
                )
            }
        };
        let helper_call = oxc_ast::ast::Expression::new_call_expression(
            anchor,
            self.id(anchor, &self.helper),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            self.vec([Argument::from(right)]),
            false,
            self.ast.builder(),
        );
        let iterator_declaration = self.declarator(anchor, &iterator, Some(helper_call));
        let step_declaration = self.declarator(anchor, &step, None);
        let init = ForStatementInit::from(
            self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "s")),
        );
        let next = self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "n"));
        let assign_step = self.assign_name(anchor, &step, next);
        let done = self.member(anchor, self.id(anchor, &step), "done");
        let not_done = oxc_ast::ast::Expression::new_unary_expression(
            anchor,
            UnaryOperator::LogicalNot,
            done,
            self.ast.builder(),
        );
        let test = oxc_ast::ast::Expression::new_sequence_expression(
            anchor,
            self.vec([assign_step, not_done]),
            self.ast.builder(),
        );
        // The loop-head binding and the source body have distinct lexical
        // environments. Keep an existing body block nested so declarations in
        // it may legally shadow the per-iteration binding.
        let body = self.vec([binding, statement.body]);
        let loop_body =
            oxc_ast::ast::Statement::new_block_statement(anchor, body, self.ast.builder());
        let mut loop_statement = oxc_ast::ast::Statement::new_for_statement(
            anchor,
            Some(init),
            Some(test),
            None,
            loop_body,
            self.ast.builder(),
        );
        for label in labels.into_iter().rev() {
            {
                loop_statement = oxc_ast::ast::Statement::new_labeled_statement(
                    anchor,
                    oxc_ast::ast::LabelIdentifier::new(
                        anchor,
                        self.ast.allocator().alloc_str(&label),
                        self.ast.builder(),
                    ),
                    loop_statement,
                    self.ast.builder(),
                );
            }
        }

        let try_block = oxc_ast::ast::BlockStatement::boxed(
            anchor,
            self.vec([loop_statement]),
            self.ast.builder(),
        );
        let report_error = oxc_ast::ast::Expression::new_call_expression(
            anchor,
            self.member(anchor, self.id(anchor, &iterator), "e"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            self.vec([Argument::from(self.id(anchor, &caught))]),
            false,
            self.ast.builder(),
        );
        let catch_body = oxc_ast::ast::BlockStatement::boxed(
            anchor,
            self.vec([self.expression_statement(anchor, report_error)]),
            self.ast.builder(),
        );
        let catch = oxc_ast::ast::CatchClause::boxed(
            anchor,
            Some(oxc_ast::ast::CatchParameter::new(
                anchor,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    anchor,
                    self.ast.allocator().alloc_str(&caught),
                    self.ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                self.ast.builder(),
            )),
            catch_body,
            self.ast.builder(),
        );

        let close = self.call0(anchor, self.member(anchor, self.id(anchor, &iterator), "f"));
        let outer_finally = oxc_ast::ast::BlockStatement::boxed(
            anchor,
            self.vec([self.expression_statement(anchor, close)]),
            self.ast.builder(),
        );
        let try_statement = oxc_ast::ast::Statement::new_try_statement(
            anchor,
            try_block,
            Some(catch),
            Some(outer_finally),
            self.ast.builder(),
        );
        let declarations = self.vec([iterator_declaration, step_declaration]);
        let variables = Statement::VariableDeclaration(oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Var,
            declarations,
            false,
            self.ast.builder(),
        ));
        Ok(oxc_ast::ast::Statement::new_block_statement(
            enclosing_span,
            self.vec([variables, try_statement]),
            self.ast.builder(),
        ))
    }

    fn id(&self, span: Span, name: &str) -> Expression<'a> {
        oxc_ast::ast::Expression::new_identifier(
            span,
            self.ast.allocator().alloc_str(name),
            self.ast.builder(),
        )
    }

    fn member(&self, span: Span, object: Expression<'a>, property: &str) -> Expression<'a> {
        {
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    object,
                    oxc_ast::ast::IdentifierName::new(
                        span,
                        self.ast.allocator().alloc_str(property),
                        self.ast.builder(),
                    ),
                    false,
                    self.ast.builder(),
                ),
            )
        }
    }

    fn call0(&self, span: Span, callee: Expression<'a>) -> Expression<'a> {
        {
            oxc_ast::ast::Expression::new_call_expression(
                span,
                callee,
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                ArenaVec::<Argument<'a>>::new_in(&self.ast),
                false,
                self.ast.builder(),
            )
        }
    }

    fn assign_name(&self, span: Span, name: &str, right: Expression<'a>) -> Expression<'a> {
        let left = oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
            span,
            self.ast.allocator().alloc_str(name),
            self.ast.builder(),
        );
        {
            oxc_ast::ast::Expression::new_assignment_expression(
                span,
                AssignmentOperator::Assign,
                left.into(),
                right,
                self.ast.builder(),
            )
        }
    }

    fn expression_statement(&self, span: Span, expression: Expression<'a>) -> Statement<'a> {
        oxc_ast::ast::Statement::new_expression_statement(span, expression, self.ast.builder())
    }

    fn declarator(
        &self,
        span: Span,
        name: &str,
        init: Option<Expression<'a>>,
    ) -> VariableDeclarator<'a> {
        {
            oxc_ast::ast::VariableDeclarator::new(
                span,
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    span,
                    self.ast.allocator().alloc_str(name),
                    self.ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                init,
                false,
                self.ast.builder(),
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
    super::reserve_generated_name(base, reserved)
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    #[test]
    fn loop_plans_distinguish_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source = "for(const a of first) { for(const b of second) use(a,b); } for(const c of third) use(c);";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare(&semantic.semantic);
        assert_eq!(plan.names.len(), 3);
        let loops = semantic
            .semantic
            .nodes()
            .iter_enumerated()
            .filter_map(|(id, node)| {
                matches!(node.kind(), AstKind::ForOfStatement(_)).then_some(id)
            })
            .collect::<Vec<_>>();
        let expected = loops
            .iter()
            .map(|id| plan.names[id].iterator.clone())
            .collect::<Vec<_>>();
        // Preserve depth-round name allocation when source anchors coincide.
        assert!(expected[0] < expected[2] && expected[2] < expected[1]);
        drop(semantic);
        assert!(run(&allocator, &mut parsed.program, plan, true).unwrap().0);
        let code = oxc_codegen::Codegen::new().build(&parsed.program).code;
        for (iterator, input) in expected.iter().zip(["first", "second", "third"]) {
            assert!(
                code.contains(&format!("{iterator} = _createForOfIteratorHelper({input})")),
                "{code}"
            );
        }
        assert!(!code.contains(" of "), "{code}");
    }

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
