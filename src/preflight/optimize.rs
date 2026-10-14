use oxc_allocator::{Allocator, TakeIn};
use oxc_ast::{
    AstBuilder,
    ast::{
        CallExpression, Class, Declaration, ExportDefaultDeclaration, ExportDefaultDeclarationKind,
        ExportNamedDeclaration, Expression, Function, FunctionType, IdentifierReference,
        NumberBase, Program, Statement, VariableDeclaration, VariableDeclarator, WithStatement,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{Scoping, SemanticBuilder, SymbolId};
use oxc_span::GetSpan;
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
            failed: FxHashSet::default(),
            addition_depth: 0,
        }
        .visit_program(program);
    }
    if dead_code_elimination {
        eliminate_dead_functions(program);
    }
}

struct ConstantFolder<'a> {
    ast: AstBuilder<'a>,
    failed: FxHashSet<(u32, u32)>,
    addition_depth: usize,
}

impl<'a> ConstantFolder<'a> {
    // Conditional/logical evaluation performs GetValue and does not trigger
    // anonymous-function named evaluation. Preserve that context when selecting
    // an operand; plain references would change calls, delete, typeof, and names.
    #[expect(deprecated)]
    fn value(&self, expression: Expression<'a>) -> Expression<'a> {
        if matches!(
            expression.get_inner_expression(),
            Expression::Identifier(_)
                | Expression::StaticMemberExpression(_)
                | Expression::ComputedMemberExpression(_)
                | Expression::PrivateFieldExpression(_)
                | Expression::FunctionExpression(_)
                | Expression::ArrowFunctionExpression(_)
                | Expression::ClassExpression(_)
                | Expression::ChainExpression(_)
        ) {
            let span = expression.span();
            self.ast.expression_sequence(
                span,
                self.ast.vec_from_array([
                    self.ast
                        .expression_numeric_literal(span, 0.0, None, NumberBase::Decimal),
                    expression,
                ]),
            )
        } else {
            expression
        }
    }

    #[expect(deprecated)]
    fn literal(&self, span: oxc_span::Span, value: EvaluatedConstant) -> Option<Expression<'a>> {
        Some(match value {
            EvaluatedConstant::Null => self.ast.expression_null_literal(span),
            EvaluatedConstant::Boolean(value) => self.ast.expression_boolean_literal(span, value),
            EvaluatedConstant::Number(value) => {
                if !value.is_finite() {
                    return None;
                }
                self.ast
                    .expression_numeric_literal(span, value, None, NumberBase::Decimal)
            }
            EvaluatedConstant::String(value) => {
                let value = self.ast.allocator.alloc_str(&value);
                self.ast.expression_string_literal(span, value, None)
            }
        })
    }
}

impl<'a> VisitMut<'a> for ConstantFolder<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let addition = matches!(expression, Expression::BinaryExpression(binary) if binary.operator == oxc_syntax::operator::BinaryOperator::Addition);
        self.addition_depth += usize::from(addition);
        walk_mut::walk_expression(self, expression);
        self.addition_depth -= usize::from(addition);
        if addition && self.addition_depth > 0 {
            return;
        }
        let span = expression.span();
        match expression {
            Expression::UnaryExpression(_) | Expression::BinaryExpression(_) => {
                if expression_has_failed_operand(expression, &self.failed) {
                    self.failed.insert((span.start, span.end));
                } else if let Some(value) = evaluate_expression(expression) {
                    if let Some(literal) = self.literal(span, value) {
                        *expression = literal;
                    }
                } else {
                    self.failed.insert((span.start, span.end));
                }
            }
            Expression::LogicalExpression(logical) => {
                let left_span = logical.left.span();
                if self.failed.contains(&(left_span.start, left_span.end)) {
                    self.failed.insert((span.start, span.end));
                    return;
                }
                let Some(left) = evaluate_expression(&logical.left) else {
                    self.failed.insert((span.start, span.end));
                    return;
                };
                let use_right = match logical.operator {
                    oxc_syntax::operator::LogicalOperator::Or => !left.truthy(),
                    oxc_syntax::operator::LogicalOperator::And => left.truthy(),
                    oxc_syntax::operator::LogicalOperator::Coalesce => {
                        matches!(left, EvaluatedConstant::Null)
                    }
                };
                let selected = if use_right {
                    logical.right.take_in(&self.ast)
                } else {
                    logical.left.take_in(&self.ast)
                };
                *expression = self.value(selected);
            }
            Expression::ConditionalExpression(conditional) => {
                let test_span = conditional.test.span();
                if self.failed.contains(&(test_span.start, test_span.end)) {
                    self.failed.insert((span.start, span.end));
                    return;
                }
                let Some(test) = evaluate_expression(&conditional.test) else {
                    self.failed.insert((span.start, span.end));
                    return;
                };
                let selected = if test.truthy() {
                    conditional.consequent.take_in(&self.ast)
                } else {
                    conditional.alternate.take_in(&self.ast)
                };
                *expression = self.value(selected);
            }
            _ => {
                if expression_has_failed_operand(expression, &self.failed)
                    || evaluate_expression(expression).is_none()
                {
                    self.failed.insert((span.start, span.end));
                }
            }
        }
    }

    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        walk_mut::walk_statement(self, statement);
        let Statement::IfStatement(if_statement) = statement else {
            return;
        };
        if matches!(if_statement.consequent, Statement::FunctionDeclaration(_))
            || matches!(
                if_statement.alternate,
                Some(Statement::FunctionDeclaration(_))
            )
        {
            return;
        }
        let Some(test) = evaluate_expression(&if_statement.test) else {
            return;
        };
        let discarded = if test.truthy() {
            if_statement.alternate.as_ref()
        } else {
            Some(&if_statement.consequent)
        };
        if let Some(discarded) = discarded {
            let mut bindings = HoistedBindingDetector(false);
            bindings.visit_statement(discarded);
            if bindings.0 {
                return;
            }
        }
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

// Discarding a branch must not discard declaration instantiation. Keeping
// the branch is cheaper and less error-prone than synthesizing Annex B vars.
struct HoistedBindingDetector(bool);

impl<'a> Visit<'a> for HoistedBindingDetector {
    fn visit_statement(&mut self, statement: &Statement<'a>) {
        if !self.0 {
            walk::walk_statement(self, statement);
        }
    }

    // Expressions cannot declare a var in the surrounding branch's scope.
    fn visit_expression(&mut self, _expression: &Expression<'a>) {}

    fn visit_variable_declaration(&mut self, declaration: &VariableDeclaration<'a>) {
        self.0 |= declaration.kind.is_var();
    }

    fn visit_function(&mut self, function: &Function<'a>, _flags: ScopeFlags) {
        self.0 |= function.r#type == FunctionType::FunctionDeclaration;
    }

    fn visit_class(&mut self, _class: &Class<'a>) {}
}

fn expression_has_failed_operand(
    expression: &Expression<'_>,
    failed: &FxHashSet<(u32, u32)>,
) -> bool {
    let failed = |expression: &Expression<'_>| {
        let span = expression.span();
        failed.contains(&(span.start, span.end))
    };
    match expression {
        Expression::UnaryExpression(unary) => failed(&unary.argument),
        Expression::BinaryExpression(binary) => failed(&binary.left) || failed(&binary.right),
        Expression::ParenthesizedExpression(parenthesized) => failed(&parenthesized.expression),
        Expression::TSAsExpression(value) => failed(&value.expression),
        Expression::TSSatisfiesExpression(value) => failed(&value.expression),
        Expression::TSTypeAssertion(value) => failed(&value.expression),
        Expression::TSNonNullExpression(value) => failed(&value.expression),
        Expression::SequenceExpression(sequence) => sequence.expressions.iter().any(failed),
        _ => false,
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
    let mut collector = DeadFunctionCandidateCollector {
        scoping: &scoping,
        script: program.source_type.is_script(),
        candidates: FxHashSet::default(),
        roots: FxHashSet::default(),
        with_depth: 0,
        direct_eval: false,
    };
    collector.visit_program(program);
    if collector.direct_eval || collector.candidates.is_empty() {
        return;
    }
    let mut analysis =
        DeadFunctionDependencyAnalysis::new(&collector.candidates, &collector.roots, &scoping);
    analysis.visit_program(program);
    let unused = analysis.peel();
    DeadFunctionRemover { unused }.visit_program(program);
}

struct DeadFunctionCandidateCollector<'s> {
    scoping: &'s Scoping,
    script: bool,
    candidates: FxHashSet<SymbolId>,
    roots: FxHashSet<SymbolId>,
    with_depth: usize,
    direct_eval: bool,
}

impl DeadFunctionCandidateCollector<'_> {
    fn candidate(&mut self, symbol_id: SymbolId, function_declaration: bool) {
        self.candidates.insert(symbol_id);
        let scope = self.scoping.symbol_scope_id(symbol_id);
        let flags = self.scoping.scope_flags(scope);
        // Script globals are externally observable, including lexical bindings
        // read by indirect eval. Sloppy block functions can implicitly write an
        // outer Annex B binding, and with makes initialization targets dynamic.
        if (self.script && scope == self.scoping.root_scope_id())
            || self.with_depth > 0
            || (function_declaration
                && !flags.is_strict_mode()
                && !flags.intersects(ScopeFlags::Var))
        {
            self.roots.insert(symbol_id);
        }
    }
}

impl<'a> Visit<'a> for DeadFunctionCandidateCollector<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        if !call.optional
            && matches!(call.callee.get_inner_expression(), Expression::Identifier(identifier) if identifier.name == "eval")
        {
            // Inspect parsed identifiers, including escaped and parenthesized
            // spellings. Runtime strings can reference any lexical binding.
            self.direct_eval = true;
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_with_statement(&mut self, statement: &WithStatement<'a>) {
        self.with_depth += 1;
        walk::walk_with_statement(self, statement);
        self.with_depth -= 1;
    }

    fn visit_export_default_declaration(&mut self, export: &ExportDefaultDeclaration<'a>) {
        if let ExportDefaultDeclarationKind::FunctionDeclaration(function) = &export.declaration
            && let Some(symbol_id) = function.id.as_ref().and_then(|id| id.symbol_id.get())
        {
            self.roots.insert(symbol_id);
        }
        walk::walk_export_default_declaration(self, export);
    }

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
            self.candidate(symbol_id, true);
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
            self.candidate(symbol_id, false);
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
    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        walk_mut::walk_statements(self, statements);
        for statement in &mut *statements {
            if let Statement::VariableDeclaration(declaration) = statement {
                self.remove_declarators(declaration);
            }
        }
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
