use oxc_allocator::GetAllocator;
use oxc_allocator::{Address, Allocator, GetAddress, TakeIn};
use oxc_ast::builder::GetAstBuilder;
use oxc_ast::{
    ast::{
        BindingIdentifier, BindingPattern, Class, Declaration, ExportDeclaration,
        ExportDefaultDeclaration, ExportDefaultDeclarationKind, Expression, ForStatementInit,
        Function, FunctionType, IdentifierReference, NumberBase, Program, Statement,
        VariableDeclaration, VariableDeclarationKind, VariableDeclarator, WithStatement,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_semantic::{Scoping, SemanticBuilder, SymbolId};
use oxc_span::GetSpan;
use oxc_syntax::scope::{ScopeFlags, ScopeId};
use rustc_hash::{FxHashMap, FxHashSet};
use std::cell::Cell;

use crate::semantic::constant_eval::{EvaluatedConstant, evaluate_expression};

/// Run the deliberately small optimization surface used by Metro after its
/// source transforms. This is not a general compressor: retaining Metro's
/// conservative behavior is more important than finding additional folds.
pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    constant_folding: bool,
    dead_code_elimination: bool,
    module_context: bool,
    checked_scoping: Option<Scoping>,
) {
    debug_assert!(
        !constant_folding || checked_scoping.is_none(),
        "folding invalidates checked scoping"
    );
    let mut checked_scoping = checked_scoping;
    if constant_folding {
        if dead_code_elimination {
            let mut folder = ConstantFolder::<true, true>::new(allocator);
            folder.visit_program(program);
            if folder.changed {
                checked_scoping = None;
            }
        } else {
            ConstantFolder::<true, false>::new(allocator).visit_program(program);
        }
    }
    if dead_code_elimination {
        eliminate_dead_bindings(
            allocator,
            program,
            module_context,
            checked_scoping,
            !constant_folding,
        );
    }
}

struct ConstantFolder<'a, const FOLDING: bool, const DEAD_CODE: bool> {
    ast: AstBuilder<'a>,
    // Parser-only and newly built expressions have no unique semantic IDs.
    // Boxed expression addresses remain stable during this arena traversal.
    failed: FxHashSet<Address>,
    addition_depth: usize,
    // Scopes nested inside the outermost strict scope are strict too.
    strict_depth: usize,
    changed: bool,
}

impl<'a, const FOLDING: bool, const DEAD_CODE: bool> ConstantFolder<'a, FOLDING, DEAD_CODE> {
    fn new(allocator: &'a Allocator) -> Self {
        Self {
            ast: AstBuilder::new(allocator),
            failed: FxHashSet::default(),
            addition_depth: 0,
            strict_depth: 0,
            changed: false,
        }
    }

    fn bindings(
        &self,
        statement: &Statement<'a>,
    ) -> Option<oxc_allocator::Vec<'a, VariableDeclarator<'a>>> {
        let mut bindings = HoistedBindingCollector {
            ast: &self.ast,
            declarations: oxc_allocator::Vec::new_in(&self.ast),
            block_function: false,
            strict: self.strict_depth > 0,
            var_pattern: false,
        };
        bindings.visit_statement(statement);
        (!bindings.block_function).then_some(bindings.declarations)
    }

    fn declaration(
        &self,
        span: oxc_span::Span,
        kind: VariableDeclarationKind,
        declarations: oxc_allocator::Vec<'a, VariableDeclarator<'a>>,
    ) -> Statement<'a> {
        if declarations.is_empty() {
            Statement::new_empty_statement(span, &self.ast)
        } else {
            Statement::new_variable_declaration(span, kind, declarations, false, &self.ast)
        }
    }

    fn remove_false_loop(&mut self, statement: &mut Statement<'a>) {
        let (test, body) = match statement {
            Statement::WhileStatement(loop_) => (Some(&loop_.test), &loop_.body),
            Statement::ForStatement(loop_) => (loop_.test.as_ref(), &loop_.body),
            _ => return,
        };
        // Only literal/constant tests with no effects or throwing reads qualify.
        if !test
            .and_then(evaluate_expression)
            .is_some_and(|test| !test.truthy())
        {
            return;
        }
        let Some(bindings) = self.bindings(body) else {
            return;
        };
        let span = statement.span();
        let mut replacement = oxc_allocator::Vec::new_in(&self.ast);
        if let Statement::ForStatement(loop_) = statement
            && let Some(init) = loop_.init.take()
        {
            replacement.push(match init {
                ForStatementInit::VariableDeclaration(declaration) => {
                    Statement::VariableDeclaration(declaration)
                }
                expression => Statement::new_expression_statement(
                    span,
                    expression.into_expression(),
                    &self.ast,
                ),
            });
        }
        if !bindings.is_empty() {
            replacement.push(self.declaration(span, VariableDeclarationKind::Var, bindings));
        }
        *statement = if replacement.is_empty() {
            Statement::new_empty_statement(span, &self.ast)
        } else {
            // The for initializer retains its lexical scope and executes once.
            Statement::new_block_statement(span, replacement, &self.ast)
        };
        self.changed = true;
    }

    // Conditional/logical evaluation performs GetValue and does not trigger
    // anonymous-function named evaluation. Preserve that context when selecting
    // an operand; plain references would change calls, delete, typeof, and names.
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
            oxc_ast::ast::Expression::new_sequence_expression(
                span,
                oxc_allocator::Vec::from_array_in(
                    [
                        oxc_ast::ast::Expression::new_numeric_literal(
                            span,
                            0.0,
                            None,
                            NumberBase::Decimal,
                            self.ast.builder(),
                        ),
                        expression,
                    ],
                    self.ast.builder(),
                ),
                self.ast.builder(),
            )
        } else {
            expression
        }
    }

    fn literal(&self, span: oxc_span::Span, value: EvaluatedConstant) -> Option<Expression<'a>> {
        Some(match value {
            EvaluatedConstant::Null => {
                oxc_ast::ast::Expression::new_null_literal(span, self.ast.builder())
            }
            EvaluatedConstant::Boolean(value) => {
                oxc_ast::ast::Expression::new_boolean_literal(span, value, self.ast.builder())
            }
            EvaluatedConstant::Number(value) => {
                if !value.is_finite() {
                    return None;
                }
                oxc_ast::ast::Expression::new_numeric_literal(
                    span,
                    value,
                    None,
                    NumberBase::Decimal,
                    self.ast.builder(),
                )
            }
            EvaluatedConstant::String(value) => {
                let value = self.ast.allocator().alloc_str(&value);
                oxc_ast::ast::Expression::new_string_literal(span, value, None, self.ast.builder())
            }
        })
    }
}

impl<'a, const FOLDING: bool, const DEAD_CODE: bool> VisitMut<'a>
    for ConstantFolder<'a, FOLDING, DEAD_CODE>
{
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if !FOLDING {
            walk_mut::walk_expression(self, expression);
            return;
        }
        let addition = matches!(expression, Expression::BinaryExpression(binary) if binary.operator == oxc_syntax::operator::BinaryOperator::Addition);
        self.addition_depth += usize::from(addition);
        walk_mut::walk_expression(self, expression);
        self.addition_depth -= usize::from(addition);
        if addition && self.addition_depth > 0 {
            return;
        }
        let span = expression.span();
        let address = expression.address();
        match expression {
            Expression::UnaryExpression(_) | Expression::BinaryExpression(_) => {
                if expression_has_failed_operand(expression, &self.failed) {
                    self.failed.insert(address);
                } else if let Some(value) = evaluate_expression(expression) {
                    if let Some(literal) = self.literal(span, value) {
                        *expression = literal;
                    }
                } else {
                    self.failed.insert(address);
                }
            }
            Expression::LogicalExpression(logical) => {
                if self.failed.contains(&logical.left.address()) {
                    self.failed.insert(address);
                    return;
                }
                let Some(left) = evaluate_expression(&logical.left) else {
                    self.failed.insert(address);
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
                if self.failed.contains(&conditional.test.address()) {
                    self.failed.insert(address);
                    return;
                }
                let Some(test) = evaluate_expression(&conditional.test) else {
                    self.failed.insert(address);
                    return;
                };
                let selected = if test.truthy() {
                    conditional.consequent.take_in(&self.ast)
                } else {
                    conditional.alternate.take_in(&self.ast)
                };
                *expression = self.value(selected);
            }
            Expression::ParenthesizedExpression(_)
            | Expression::TSAsExpression(_)
            | Expression::TSSatisfiesExpression(_)
            | Expression::TSTypeAssertion(_)
            | Expression::TSNonNullExpression(_)
            | Expression::SequenceExpression(_)
                if expression_has_failed_operand(expression, &self.failed)
                    || evaluate_expression(expression).is_none() =>
            {
                self.failed.insert(address);
            }
            // Only recursive evaluations need failure memoization. Literals
            // and unsupported expressions are constant-time leaves for the
            // evaluator; evaluating them here copies unused string values and
            // fills the failure set with identifiers and calls.
            _ => {}
        }
    }

    fn enter_scope(&mut self, flags: ScopeFlags, _scope_id: &Cell<Option<ScopeId>>) {
        if self.strict_depth > 0 || flags.is_strict_mode() {
            self.strict_depth += 1;
        }
    }

    fn leave_scope(&mut self) {
        self.strict_depth = self.strict_depth.saturating_sub(1);
    }

    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        walk_mut::walk_statements(self, statements);
        if !DEAD_CODE {
            return;
        }
        let Some(end) = statements.iter().position(|statement| {
            matches!(
                statement,
                Statement::ReturnStatement(_)
                    | Statement::ThrowStatement(_)
                    | Statement::BreakStatement(_)
                    | Statement::ContinueStatement(_)
            )
        }) else {
            return;
        };
        if end + 1 == statements.len() {
            return;
        }
        // Keep declaration instantiation even when execution cannot reach it.
        // Direct functions are initialized on entry; lexical declarations must
        // retain their TDZ, but their unreachable initializers can disappear.
        let trailing = statements.split_off(end + 1);
        for statement in trailing {
            if statement.is_module_declaration()
                || matches!(statement, Statement::FunctionDeclaration(_))
            {
                statements.push(statement);
                continue;
            }
            let span = statement.span();
            let mut lexical = HoistedBindingCollector {
                ast: &self.ast,
                declarations: oxc_allocator::Vec::new_in(&self.ast),
                block_function: false,
                strict: self.strict_depth > 0,
                var_pattern: true,
            };
            match &statement {
                Statement::VariableDeclaration(declaration)
                    if matches!(
                        declaration.kind,
                        VariableDeclarationKind::Let | VariableDeclarationKind::Const
                    ) =>
                {
                    for declarator in &declaration.declarations {
                        lexical.visit_binding_pattern(&declarator.id);
                    }
                    statements.push(self.declaration(
                        span,
                        VariableDeclarationKind::Let,
                        lexical.declarations,
                    ));
                }
                Statement::ClassDeclaration(class) => {
                    if let Some(id) = &class.id {
                        lexical.visit_binding_identifier(id);
                    }
                    statements.push(self.declaration(
                        span,
                        VariableDeclarationKind::Let,
                        lexical.declarations,
                    ));
                }
                Statement::VariableDeclaration(declaration) if !declaration.kind.is_var() => {
                    statements.push(statement);
                    continue;
                }
                _ => {
                    let Some(bindings) = self.bindings(&statement) else {
                        statements.push(statement);
                        continue;
                    };
                    if !bindings.is_empty() {
                        statements.push(self.declaration(
                            span,
                            VariableDeclarationKind::Var,
                            bindings,
                        ));
                    }
                }
            }
            self.changed = true;
        }
    }

    fn visit_statement(&mut self, statement: &mut Statement<'a>) {
        walk_mut::walk_statement(self, statement);
        if DEAD_CODE {
            self.remove_false_loop(statement);
        }
        if !FOLDING {
            return;
        }
        let Statement::IfStatement(if_statement) = statement else {
            return;
        };
        // Direct if functions are Annex B syntax; keep their selected-branch
        // assignment behavior as well as their outer declaration instantiation.
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
        let mut bindings = HoistedBindingCollector {
            ast: &self.ast,
            declarations: oxc_allocator::Vec::new_in(&self.ast),
            block_function: false,
            strict: self.strict_depth > 0,
            var_pattern: false,
        };
        if let Some(discarded) = discarded {
            bindings.visit_statement(discarded);
            if bindings.block_function {
                return;
            }
        }
        let span = if_statement.span;
        let selected = if test.truthy() {
            if_statement.consequent.take_in(&self.ast)
        } else if let Some(alternate) = &mut if_statement.alternate {
            alternate.take_in(&self.ast)
        } else {
            oxc_ast::ast::Statement::new_empty_statement(if_statement.span, self.ast.builder())
        };
        *statement = if bindings.declarations.is_empty() {
            selected
        } else {
            let hoisted = Statement::new_variable_declaration(
                span,
                VariableDeclarationKind::Var,
                bindings.declarations,
                false,
                &self.ast,
            );
            Statement::new_block_statement(
                span,
                oxc_allocator::Vec::from_array_in([hoisted, selected], &self.ast),
                &self.ast,
            )
        };
    }
}

// Discarding a branch must not discard declaration instantiation. Keeping
// the branch is cheaper and less error-prone than synthesizing Annex B vars.
// Ordinary vars only need their bound names, never patterns or initializers.
struct HoistedBindingCollector<'s, 'a> {
    ast: &'s AstBuilder<'a>,
    declarations: oxc_allocator::Vec<'a, VariableDeclarator<'a>>,
    block_function: bool,
    strict: bool,
    var_pattern: bool,
}

impl<'a> Visit<'a> for HoistedBindingCollector<'_, 'a> {
    fn visit_statement(&mut self, statement: &Statement<'a>) {
        if !self.block_function {
            walk::walk_statement(self, statement);
        }
    }

    // Expressions cannot declare a var in the surrounding branch's scope.
    fn visit_expression(&mut self, _expression: &Expression<'a>) {}

    fn visit_variable_declaration(&mut self, declaration: &VariableDeclaration<'a>) {
        if declaration.kind.is_var() {
            self.var_pattern = true;
            for declarator in &declaration.declarations {
                self.visit_binding_pattern(&declarator.id);
            }
            self.var_pattern = false;
        }
    }

    fn visit_function(&mut self, function: &Function<'a>, _flags: ScopeFlags) {
        // The containing scope controls Annex B, not the function's own directive.
        self.block_function |= !self.strict && function.r#type == FunctionType::FunctionDeclaration;
    }

    fn visit_binding_identifier(&mut self, identifier: &BindingIdentifier<'a>) {
        if !self.var_pattern {
            return;
        }
        let id = BindingPattern::new_binding_identifier(identifier.span, identifier.name, self.ast);
        self.declarations.push(VariableDeclarator::new(
            identifier.span,
            id,
            None,
            None,
            false,
            self.ast,
        ));
    }

    fn visit_class(&mut self, _class: &Class<'a>) {}
}

fn expression_has_failed_operand(expression: &Expression<'_>, failed: &FxHashSet<Address>) -> bool {
    let failed = |expression: &Expression<'_>| failed.contains(&expression.address());
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

fn eliminate_dead_bindings<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    module_context: bool,
    checked_scoping: Option<Scoping>,
    control_flow: bool,
) {
    // Follow candidate dependencies from observable roots. Reference-count
    // peeling alone cannot reclaim an unreachable recursive group.
    // Validation's graph is reusable only when no AST pass has run since it.
    let scoping = if let Some(scoping) = checked_scoping {
        scoping
    } else {
        let semantic = SemanticBuilder::new().build(program);
        if !semantic.diagnostics.is_empty() {
            return;
        }
        semantic.semantic.into_scoping()
    };
    // Use the checked graph only for an unchanged program. Otherwise the rebuild
    // refreshes symbol cells after preceding transforms; older IDs can refer to
    // a different binding.
    let mut collector = DeadBindingCandidateCollector {
        scoping: &scoping,
        // Bundlers may wrap this script after optimization. Its bindings are
        // then private even though the parser correctly uses script semantics.
        script: program.source_type.is_script() && !module_context,
        candidates: FxHashSet::default(),
        roots: FxHashSet::default(),
        with_depth: 0,
        control_flow,
        needs_control_flow: false,
    };
    collector.visit_program(program);
    if collector.needs_control_flow {
        // Collection stops at the first potential edit; collecting a plan that
        // would immediately be discarded wastes a walk of the remaining tree.
        drop(collector);
        let mut folder = ConstantFolder::<false, true>::new(allocator);
        folder.visit_program(program);
        let checked = if folder.changed { None } else { Some(scoping) };
        eliminate_dead_bindings(allocator, program, module_context, checked, false);
        return;
    }
    if collector.candidates.is_empty() {
        return;
    }
    let mut analysis =
        DeadBindingDependencyAnalysis::new(&collector.candidates, &collector.roots, &scoping);
    analysis.visit_program(program);
    let unused = analysis.unreachable();
    DeadBindingRemover {
        unused,
        ast: AstBuilder::new(allocator),
    }
    .visit_program(program);
}

fn function_initializer(expression: &Expression<'_>) -> bool {
    matches!(
        expression.get_inner_expression(),
        Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_)
    )
}

fn primitive_initializer(expression: &Expression<'_>) -> bool {
    matches!(
        expression.get_inner_expression(),
        Expression::NumericLiteral(_)
            | Expression::StringLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_)
            | Expression::BigIntLiteral(_)
    )
}

struct DeadBindingCandidateCollector<'s> {
    scoping: &'s Scoping,
    script: bool,
    candidates: FxHashSet<SymbolId>,
    roots: FxHashSet<SymbolId>,
    with_depth: usize,
    control_flow: bool,
    needs_control_flow: bool,
}

impl DeadBindingCandidateCollector<'_> {
    fn observable(&self, symbol_id: SymbolId, function_declaration: bool) -> bool {
        if self.roots.contains(&symbol_id) {
            return true;
        }
        let scope = self.scoping.symbol_scope_id(symbol_id);
        let flags = self.scoping.scope_flags(scope);
        // Script globals, eval-visible bindings, and sloppy Annex B assignments
        // can be observed without an ordinary local read.
        flags.contains_direct_eval()
            || (self.script && scope == self.scoping.root_scope_id())
            || self.with_depth > 0
            || (function_declaration
                && !flags.is_strict_mode()
                && !flags.intersects(ScopeFlags::Var))
    }

    fn candidate(&mut self, symbol_id: SymbolId, function_declaration: bool) {
        if self.observable(symbol_id, function_declaration) {
            self.roots.insert(symbol_id);
        }
        self.candidates.insert(symbol_id);
    }
}

impl<'a> Visit<'a> for DeadBindingCandidateCollector<'_> {
    fn visit_statement(&mut self, statement: &Statement<'a>) {
        if !self.needs_control_flow {
            walk::walk_statement(self, statement);
        }
    }

    fn visit_statements(&mut self, statements: &oxc_allocator::Vec<'a, Statement<'a>>) {
        // Detect potential edits in the existing walk. Most functions end with
        // their return and need neither a cleanup pass nor a semantic rebuild.
        if self.control_flow && !self.needs_control_flow {
            self.needs_control_flow = statements
                .iter()
                .take(statements.len().saturating_sub(1))
                .any(|statement| {
                    matches!(
                        statement,
                        Statement::ReturnStatement(_)
                            | Statement::ThrowStatement(_)
                            | Statement::BreakStatement(_)
                            | Statement::ContinueStatement(_)
                    )
                });
        }
        if !self.needs_control_flow {
            walk::walk_statements(self, statements);
        }
    }

    fn visit_while_statement(&mut self, statement: &oxc_ast::ast::WhileStatement<'a>) {
        if self.control_flow && !self.needs_control_flow {
            self.needs_control_flow =
                evaluate_expression(&statement.test).is_some_and(|test| !test.truthy());
        }
        if !self.needs_control_flow {
            walk::walk_while_statement(self, statement);
        }
    }

    fn visit_for_statement(&mut self, statement: &oxc_ast::ast::ForStatement<'a>) {
        if self.control_flow && !self.needs_control_flow {
            self.needs_control_flow = statement
                .test
                .as_ref()
                .and_then(evaluate_expression)
                .is_some_and(|test| !test.truthy());
        }
        if !self.needs_control_flow {
            walk::walk_for_statement(self, statement);
        }
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

    fn visit_export_declaration(&mut self, export: &ExportDeclaration<'a>) {
        match &export.declaration {
            Declaration::FunctionDeclaration(function) => {
                if let Some(symbol_id) = function.id.as_ref().and_then(|id| id.symbol_id.get()) {
                    self.roots.insert(symbol_id);
                }
            }
            Declaration::VariableDeclaration(declaration) => {
                for declarator in &declaration.declarations {
                    if let Some(symbol_id) = declarator
                        .id
                        .get_binding_identifier()
                        .and_then(|id| id.symbol_id.get())
                    {
                        self.roots.insert(symbol_id);
                    }
                }
                if declaration.declarations.iter().all(|declarator| {
                    declarator.id.get_binding_identifier().is_some()
                        && declarator.init.as_ref().is_none_or(primitive_initializer)
                }) {
                    return;
                }
            }
            _ => {}
        }
        walk::walk_export_declaration(self, export);
    }

    fn visit_function(&mut self, function: &Function<'a>, flags: ScopeFlags) {
        if function.r#type == FunctionType::FunctionDeclaration
            && let Some(symbol_id) = function.id.as_ref().and_then(|id| id.symbol_id.get())
        {
            self.candidate(symbol_id, true);
        }
        walk::walk_function(self, function, flags);
    }

    fn visit_variable_declaration(&mut self, declaration: &VariableDeclaration<'a>) {
        if matches!(
            declaration.kind,
            VariableDeclarationKind::Var
                | VariableDeclarationKind::Let
                | VariableDeclarationKind::Const
        ) {
            for declarator in &declaration.declarations {
                let function = declarator.init.as_ref().is_some_and(function_initializer);
                if !function && !declarator.init.as_ref().is_none_or(primitive_initializer) {
                    continue;
                }
                let Some(symbol_id) = declarator
                    .id
                    .get_binding_identifier()
                    .and_then(|id| id.symbol_id.get())
                else {
                    continue;
                };
                if function {
                    self.candidate(symbol_id, false);
                } else if self
                    .scoping
                    .get_resolved_reference_ids(symbol_id)
                    .is_empty()
                    && !self.observable(symbol_id, false)
                {
                    // Primitive values have no dependencies. Referenced or
                    // observable values need no graph entry at all.
                    self.candidates.insert(symbol_id);
                }
            }
        }
        walk::walk_variable_declaration(self, declaration);
    }
}

struct DeadBindingDependencyAnalysis<'s> {
    candidates: &'s FxHashSet<SymbolId>,
    scoping: &'s Scoping,
    owner: Option<SymbolId>,
    roots: FxHashSet<SymbolId>,
    outgoing: FxHashMap<SymbolId, Vec<SymbolId>>,
}

impl<'s> DeadBindingDependencyAnalysis<'s> {
    fn new(
        candidates: &'s FxHashSet<SymbolId>,
        roots: &FxHashSet<SymbolId>,
        scoping: &'s Scoping,
    ) -> Self {
        Self {
            candidates,
            scoping,
            owner: None,
            roots: roots.intersection(candidates).copied().collect(),
            outgoing: FxHashMap::default(),
        }
    }

    fn unreachable(mut self) -> FxHashSet<SymbolId> {
        let mut pending: Vec<SymbolId> = self.roots.drain().collect();
        let mut live = FxHashSet::default();
        while let Some(owner) = pending.pop() {
            if live.insert(owner)
                && let Some(dependencies) = self.outgoing.remove(&owner)
            {
                pending.extend(dependencies);
            }
        }
        self.candidates.difference(&live).copied().collect()
    }

    fn with_owner(&mut self, owner: SymbolId, visit: impl FnOnce(&mut Self)) {
        let previous = self.owner.replace(owner);
        visit(self);
        self.owner = previous;
    }
}

impl<'a> Visit<'a> for DeadBindingDependencyAnalysis<'_> {
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
        let owner = declaration
            .init
            .as_ref()
            .is_some_and(function_initializer)
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
        if let Some(owner) = self.owner {
            self.outgoing.entry(owner).or_default().push(target);
        } else {
            self.roots.insert(target);
        }
    }
}

struct DeadBindingRemover<'a> {
    unused: FxHashSet<SymbolId>,
    ast: AstBuilder<'a>,
}

impl DeadBindingRemover<'_> {
    fn unused_binding<'a>(
        &self,
        declaration: &oxc_ast::ast::VariableDeclarator<'a>,
        ordinary: bool,
    ) -> bool {
        declaration
            .id
            .get_binding_identifier()
            .and_then(|identifier| identifier.symbol_id.get())
            .is_some_and(|symbol_id| self.unused.contains(&symbol_id))
            && ((ordinary && declaration.init.is_none())
                || declaration
                    .init
                    .as_ref()
                    .is_some_and(|init| function_initializer(init) || primitive_initializer(init)))
    }

    fn remove_declarators(&mut self, declaration: &mut VariableDeclaration<'_>) {
        let ordinary = matches!(
            declaration.kind,
            VariableDeclarationKind::Var
                | VariableDeclarationKind::Let
                | VariableDeclarationKind::Const
        );
        declaration
            .declarations
            .retain(|declarator| !self.unused_binding(declarator, ordinary));
    }
}

impl<'a> VisitMut<'a> for DeadBindingRemover<'a> {
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
        if let Some(Statement::ExpressionStatement(expression)) = statements.first()
            && matches!(expression.expression, Expression::StringLiteral(_))
        {
            let barrier = Statement::new_empty_statement(expression.span, &self.ast);
            statements.insert(0, barrier);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_span::{SourceType, Span};

    #[test]
    fn failure_memoization_distinguishes_shared_source_anchors_without_semantic_ids() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let allocator = Allocator::default();
        let mut parsed = oxc_parser::Parser::new(
            &allocator,
            "var a=unknown+1; var b=(1+2)*3; var c=true?4:5;",
            SourceType::default(),
        )
        .parse();
        SharedAnchors.visit_program(&mut parsed.program);
        // This pass also accepts parser-only ASTs: semantic IDs are unassigned.
        run(&allocator, &mut parsed.program, true, false, false, None);
        let code = oxc_codegen::Codegen::new().build(&parsed.program).code;
        assert!(code.contains("a = unknown + 1"), "{code}");
        assert!(code.contains("b = 9"), "{code}");
        assert!(code.contains("c = 4"), "{code}");
    }
}
