use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::{
    AstBuilder,
    ast::{
        Declaration, ExportNamedDeclaration, Expression, Function, FunctionType,
        IdentifierReference, NumberBase, Program, Statement, VariableDeclaration,
        VariableDeclarator,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{Scoping, SemanticBuilder, SymbolId};
use oxc_span::{GetSpan, SPAN};
use oxc_syntax::scope::ScopeFlags;
use rustc_hash::{FxHashMap, FxHashSet};

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
    // Metro's Babel pass repeatedly removes unreferenced function bindings and
    // recrawls scope until reaching a fixed point. Rebuilding the complete
    // semantic graph on every layer makes a dead chain quadratic. Compute the
    // same peeling fixed point from one semantic graph instead: removing an
    // unreferenced candidate subtracts all references originating in its body,
    // which may make the functions it called removable next. Cycles retain an
    // incoming reference exactly as they do in Metro's binding-based pass.
    let semantic = SemanticBuilder::new().build(program);
    if !semantic.diagnostics.is_empty() {
        return;
    }
    let scoping = semantic.semantic.into_scoping();
    // SemanticBuilder refreshes the symbol cells after preceding transforms
    // have changed the program. Collect only after that rebuild; IDs retained
    // from an older transformed graph may now refer to a different binding.
    let mut collector = DeadFunctionCandidateCollector::default();
    collector.visit_program(program);
    if collector.candidates.is_empty() {
        return;
    }
    let mut analysis =
        DeadFunctionDependencyAnalysis::new(&collector.candidates, &collector.roots, &scoping);
    analysis.visit_program(program);
    let unused = analysis.peel();
    DeadFunctionRemover { unused }.visit_program(program);
}

#[derive(Default)]
struct DeadFunctionCandidateCollector {
    candidates: FxHashSet<SymbolId>,
    roots: FxHashSet<SymbolId>,
}

impl<'a> Visit<'a> for DeadFunctionCandidateCollector {
    fn visit_export_named_declaration(&mut self, export: &ExportNamedDeclaration<'a>) {
        match export.declaration.as_ref() {
            Some(Declaration::FunctionDeclaration(function)) => {
                if let Some(symbol_id) = function.id.as_ref().and_then(|id| id.symbol_id.get()) {
                    self.roots.insert(symbol_id);
                }
            }
            Some(Declaration::VariableDeclaration(declaration)) => {
                for declarator in &declaration.declarations {
                    if matches!(
                        declarator.init,
                        Some(
                            Expression::FunctionExpression(_)
                                | Expression::ArrowFunctionExpression(_)
                        )
                    ) && let Some(symbol_id) = declarator
                        .id
                        .get_binding_identifier()
                        .and_then(|id| id.symbol_id.get())
                    {
                        self.roots.insert(symbol_id);
                    }
                }
            }
            _ => {}
        }
        walk::walk_export_named_declaration(self, export);
    }

    fn visit_function(&mut self, function: &Function<'a>, flags: ScopeFlags) {
        if function.r#type == FunctionType::FunctionDeclaration
            && let Some(symbol_id) = function.id.as_ref().and_then(|id| id.symbol_id.get())
        {
            self.candidates.insert(symbol_id);
        }
        walk::walk_function(self, function, flags);
    }

    fn visit_variable_declarator(&mut self, declaration: &VariableDeclarator<'a>) {
        if matches!(
            declaration.init,
            Some(Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_))
        ) && let Some(symbol_id) = declaration
            .id
            .get_binding_identifier()
            .and_then(|id| id.symbol_id.get())
        {
            self.candidates.insert(symbol_id);
        }
        walk::walk_variable_declarator(self, declaration);
    }
}

struct DeadFunctionDependencyAnalysis<'s> {
    candidates: &'s FxHashSet<SymbolId>,
    scoping: &'s Scoping,
    owner: Option<SymbolId>,
    incoming: FxHashMap<SymbolId, usize>,
    outgoing: FxHashMap<SymbolId, Vec<SymbolId>>,
}

impl<'s> DeadFunctionDependencyAnalysis<'s> {
    fn new(
        candidates: &'s FxHashSet<SymbolId>,
        roots: &FxHashSet<SymbolId>,
        scoping: &'s Scoping,
    ) -> Self {
        Self {
            candidates,
            scoping,
            owner: None,
            incoming: candidates
                .iter()
                .map(|id| (*id, usize::from(roots.contains(id))))
                .collect(),
            outgoing: FxHashMap::default(),
        }
    }

    fn peel(mut self) -> FxHashSet<SymbolId> {
        let mut pending: Vec<SymbolId> = self
            .incoming
            .iter()
            .filter_map(|(id, count)| (*count == 0).then_some(*id))
            .collect();
        let mut unused = FxHashSet::default();
        while let Some(owner) = pending.pop() {
            if !unused.insert(owner) {
                continue;
            }
            for target in self.outgoing.remove(&owner).unwrap_or_default() {
                let count = self
                    .incoming
                    .get_mut(&target)
                    .expect("candidate reference must have an incoming count");
                *count -= 1;
                if *count == 0 {
                    pending.push(target);
                }
            }
        }
        unused
    }

    fn with_owner(&mut self, owner: SymbolId, visit: impl FnOnce(&mut Self)) {
        let previous = self.owner.replace(owner);
        visit(self);
        self.owner = previous;
    }
}

impl<'a> Visit<'a> for DeadFunctionDependencyAnalysis<'_> {
    fn visit_function(&mut self, function: &Function<'a>, flags: ScopeFlags) {
        let owner = (function.r#type == FunctionType::FunctionDeclaration)
            .then(|| function.id.as_ref().and_then(|id| id.symbol_id.get()))
            .flatten()
            .filter(|id| self.candidates.contains(id));
        if let Some(owner) = owner {
            self.with_owner(owner, |analysis| {
                walk::walk_function(analysis, function, flags);
            });
        } else {
            walk::walk_function(self, function, flags);
        }
    }

    fn visit_variable_declarator(&mut self, declaration: &VariableDeclarator<'a>) {
        let owner = matches!(
            declaration.init,
            Some(Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_))
        )
        .then(|| {
            declaration
                .id
                .get_binding_identifier()
                .and_then(|id| id.symbol_id.get())
        })
        .flatten()
        .filter(|id| self.candidates.contains(id));
        if let Some(owner) = owner {
            self.with_owner(owner, |analysis| {
                walk::walk_variable_declarator(analysis, declaration);
            });
        } else {
            walk::walk_variable_declarator(self, declaration);
        }
    }

    fn visit_identifier_reference(&mut self, identifier: &IdentifierReference<'a>) {
        let Some(target) = identifier
            .reference_id
            .get()
            .and_then(|id| self.scoping.get_reference(id).symbol_id())
            .filter(|id| self.candidates.contains(id))
        else {
            return;
        };
        *self
            .incoming
            .get_mut(&target)
            .expect("candidate reference must have an incoming count") += 1;
        if let Some(owner) = self.owner {
            self.outgoing.entry(owner).or_default().push(target);
        }
    }
}

struct DeadFunctionRemover {
    unused: FxHashSet<SymbolId>,
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
        declaration
            .declarations
            .retain(|declarator| !self.unused_binding(declarator));
    }
}

impl<'a> VisitMut<'a> for DeadFunctionRemover {
    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        walk_mut::walk_variable_declaration(self, declaration);
        self.remove_declarators(declaration);
    }

    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        walk_mut::walk_statements(self, statements);
        statements.retain(|statement| match statement {
            Statement::FunctionDeclaration(function) => function
                .id
                .as_ref()
                .and_then(|identifier| identifier.symbol_id.get())
                .is_none_or(|symbol_id| !self.unused.contains(&symbol_id)),
            Statement::VariableDeclaration(declaration) => !declaration.declarations.is_empty(),
            _ => true,
        });
    }
}
