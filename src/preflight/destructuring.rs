use oxc_allocator::{
    Address, Allocator, Box as ArenaBox, CloneIn, GetAddress, TakeIn, Vec as ArenaVec,
};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, ArrayExpressionElement, AssignmentTarget, AssignmentTargetMaybeDefault,
        AssignmentTargetProperty, BindingPattern, Expression, ForStatementLeft, FunctionBody,
        NumberBase, Program, PropertyKey, Statement, TSTypeAnnotation,
        TSTypeParameterInstantiation, VariableDeclaration, VariableDeclarationKind,
        VariableDeclarator,
    },
};
use oxc_ast_visit::{VisitMut, walk_mut};
#[cfg(test)]
use oxc_parser::Parser;
use oxc_semantic::Semantic;
#[cfg(test)]
use oxc_span::SourceType;
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::inline_helpers::{
    INLINE_DESTRUCTURING_ITER_HELPER_DESCRIPTOR, INLINE_DESTRUCTURING_LOOSE_REST_HELPER_DESCRIPTOR,
    INLINE_DESTRUCTURING_OBJECT_HELPER_DESCRIPTOR, INLINE_DESTRUCTURING_REST_HELPER_DESCRIPTOR,
    INLINE_EXTENDS_HELPER_DESCRIPTOR, INLINE_TO_PROPERTY_KEY_HELPER_DESCRIPTOR,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct AstPlan {
    declarations: FxHashMap<Address, AstDeclaratorPlan>,
    catches: FxHashMap<u32, AstCatchPlan>,
    assignments: FxHashMap<u32, AstAssignmentPlan>,
    loop_assignments: FxHashMap<u32, AstAssignmentPlan>,
    temporary_declarations: FxHashMap<u32, Vec<String>>,
    helper_requests: CustomHelperRequests,
    helper_names: HelperNames,
    base_reserved: FxHashSet<String>,
    planned_allocations: FxHashMap<String, usize>,
}

impl AstPlan {
    pub(super) fn is_empty(&self) -> bool {
        self.declarations.is_empty()
            && self.catches.is_empty()
            && self.assignments.is_empty()
            && self.loop_assignments.is_empty()
            && self.temporary_declarations.is_empty()
    }
}

struct AstDeclaratorPlan {
    root: String,
    anchor: Span,
    reservation_checkpoint: usize,
}

struct AstCatchPlan {
    caught: String,
    anchor: Span,
    reservation_checkpoint: usize,
}

struct AstAssignmentPlan {
    root: String,
    anchor: Span,
    reservation_checkpoint: usize,
}

trait NameReservations {
    fn contains(&self, name: &str) -> bool;
    fn insert(&mut self, name: String) -> bool;
    fn len(&self) -> usize;
}

struct PlanningReservations {
    names: FxHashSet<String>,
    base: FxHashSet<String>,
    allocations: Vec<String>,
}

impl PlanningReservations {
    fn new(base: FxHashSet<String>) -> Self {
        Self {
            names: base.clone(),
            base,
            allocations: Vec::new(),
        }
    }

    fn checkpoint(&self) -> usize {
        self.allocations.len()
    }
}

impl NameReservations for PlanningReservations {
    fn contains(&self, name: &str) -> bool {
        self.names.contains(name)
    }

    fn insert(&mut self, name: String) -> bool {
        if !self.names.insert(name.clone()) {
            return false;
        }
        self.allocations.push(name);
        true
    }

    fn len(&self) -> usize {
        self.names.len()
    }
}

struct SnapshotReservations<'a> {
    base: &'a FxHashSet<String>,
    planned: &'a FxHashMap<String, usize>,
    checkpoint: usize,
    local: FxHashSet<String>,
}

impl NameReservations for SnapshotReservations<'_> {
    fn contains(&self, name: &str) -> bool {
        self.base.contains(name)
            || self
                .planned
                .get(name)
                .is_some_and(|index| *index < self.checkpoint)
            || self.local.contains(name)
    }

    fn insert(&mut self, name: String) -> bool {
        if self.contains(&name) {
            false
        } else {
            self.local.insert(name)
        }
    }

    fn len(&self) -> usize {
        self.base.len() + self.checkpoint + self.local.len()
    }
}

pub(super) fn prepare_ast(
    semantic: &Semantic<'_>,
    inline_helpers: bool,
    only_object_rest: bool,
    object_rest_loose: bool,
) -> Result<AstPlan, &'static str> {
    let has_candidate = semantic.nodes().iter().any(|node| match node.kind() {
        AstKind::VariableDeclarator(declarator) => {
            !declarator.id.is_binding_identifier()
                && (!only_object_rest || binding_has_object_rest(&declarator.id))
        }
        AstKind::CatchClause(clause) => clause.param.as_ref().is_some_and(|param| {
            !param.pattern.is_binding_identifier()
                && (!only_object_rest || binding_has_object_rest(&param.pattern))
        }),
        AstKind::AssignmentExpression(assignment) => {
            assignment.left.is_assignment_target_pattern()
                && (!only_object_rest || assignment_has_object_rest(&assignment.left))
        }
        AstKind::ForOfStatement(statement) => {
            statement.left.as_assignment_target().is_some_and(|target| {
                target.is_assignment_target_pattern()
                    && (!only_object_rest || assignment_has_object_rest(target))
            })
        }
        AstKind::ForInStatement(statement) => {
            statement.left.as_assignment_target().is_some_and(|target| {
                target.is_assignment_target_pattern()
                    && (!only_object_rest || assignment_has_object_rest(target))
            })
        }
        _ => false,
    });
    if !has_candidate {
        return Ok(AstPlan {
            declarations: FxHashMap::default(),
            catches: FxHashMap::default(),
            assignments: FxHashMap::default(),
            loop_assignments: FxHashMap::default(),
            temporary_declarations: FxHashMap::default(),
            helper_requests: CustomHelperRequests::default(),
            helper_names: HelperNames::default(),
            base_reserved: FxHashSet::default(),
            planned_allocations: FxHashMap::default(),
        });
    }
    let base_reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .chain(
            semantic
                .scoping()
                .root_unresolved_references()
                .keys()
                .map(|name| name.as_str()),
        )
        .map(str::to_owned)
        .collect();
    let mut reserved = PlanningReservations::new(base_reserved);
    let mut helper_names = HelperNames {
        iter: reserve("_toArray", &mut reserved),
        iter_runtime: reserve("_toArray2", &mut reserved),
        object: reserve("_objectDestructuringEmpty", &mut reserved),
        object_runtime: reserve("_objectDestructuringEmpty2", &mut reserved),
        rest: reserve("_objectWithoutProperties", &mut reserved),
        rest_runtime: reserve("_objectWithoutProperties2", &mut reserved),
        copy: String::new(),
        property_key: String::new(),
        property_key_runtime: String::new(),
    };
    let mut declarations: FxHashMap<Address, AstDeclaratorPlan> = FxHashMap::default();
    let mut catches = FxHashMap::default();
    let mut assignments = FxHashMap::default();
    let mut loop_assignments = FxHashMap::default();
    let mut temporary_declarations: FxHashMap<u32, Vec<String>> = FxHashMap::default();
    let mut helper_usage = HelperUsage::default();
    let mut active_pattern_ends = Vec::<u32>::new();
    // One semantic-node walk plans every destructuring shape against a shared
    // temporary-name set.
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        let node_span = node.kind().span();
        while active_pattern_ends
            .last()
            .is_some_and(|end| node_span.start >= *end)
        {
            active_pattern_ends.pop();
        }
        match node.kind() {
            AstKind::VariableDeclarator(declarator) => {
                let selected_pattern = !declarator.id.is_binding_identifier()
                    && (!only_object_rest || binding_has_object_rest(&declarator.id));
                if selected_pattern {
                    active_pattern_ends.push(declarator.id.span().end);
                }
                if !ast_eligible_declarator(semantic.nodes(), node_id, declarator)
                    || (only_object_rest && !binding_has_object_rest(&declarator.id))
                // Parameters relocates default expressions into a generated body.
                // Keep declarations nested in those expressions on the temporary
                // compatibility path until destructuring planning moves after the
                // parameter mutation.
                {
                    continue;
                }
                // Preserve the live initializer expression rather than recovering it
                // from its span. Earlier structural passes may have moved or generated
                // it, in which case its source coordinates intentionally no longer
                // describe text in the original input.
                let root = reserve("_ref", &mut reserved);
                let reservation_checkpoint = reserved.checkpoint();
                plan_binding_names(&declarator.id, &mut reserved, &mut helper_usage);
                // Binding patterns live in the arena: their address survives
                // declaration moves and distinguishes generated patterns whose
                // source spans coincide, without serializing their structure.
                declarations.insert(
                    declarator.id.address(),
                    AstDeclaratorPlan {
                        root,
                        anchor: declarator.span,
                        reservation_checkpoint,
                    },
                );
            }
            AstKind::CatchClause(clause) => {
                let Some(param) = &clause.param else {
                    continue;
                };
                let selected_pattern = !param.pattern.is_binding_identifier()
                    && (!only_object_rest || binding_has_object_rest(&param.pattern));
                if selected_pattern {
                    active_pattern_ends.push(param.pattern.span().end);
                }
                if param.pattern.is_binding_identifier()
                    || (only_object_rest && !binding_has_object_rest(&param.pattern))
                {
                    continue;
                }
                let caught = reserve("_caught", &mut reserved);
                let reservation_checkpoint = reserved.checkpoint();
                plan_binding_names(&param.pattern, &mut reserved, &mut helper_usage);
                catches.insert(
                    clause.span.start,
                    AstCatchPlan {
                        caught,
                        anchor: param.span,
                        reservation_checkpoint,
                    },
                );
            }
            AstKind::AssignmentExpression(assignment) => {
                let selected_pattern = assignment.left.is_assignment_target_pattern()
                    && (!only_object_rest || assignment_has_object_rest(&assignment.left));
                if selected_pattern {
                    active_pattern_ends.push(assignment.left.span().end);
                }
                if !assignment.left.is_assignment_target_pattern()
                    || (only_object_rest && !assignment_has_object_rest(&assignment.left))
                {
                    continue;
                }
                let before = reserved.checkpoint();
                let root = reserve("_ref", &mut reserved);
                let reservation_checkpoint = reserved.checkpoint();
                plan_assignment_names(&assignment.left, &mut reserved, &mut helper_usage);
                assignments.insert(
                    assignment.span.start,
                    AstAssignmentPlan {
                        root,
                        anchor: assignment.span,
                        reservation_checkpoint,
                    },
                );
                let scope_start = semantic
                    .nodes()
                    .ancestor_ids(node_id)
                    .find_map(|ancestor| match semantic.nodes().kind(ancestor) {
                        AstKind::FunctionBody(body) => Some(body.span.start),
                        AstKind::StaticBlock(block) => Some(block.span.start),
                        AstKind::Program(program) => Some(program.span.start),
                        _ => None,
                    })
                    .unwrap_or(0);
                temporary_declarations
                    .entry(scope_start)
                    .or_default()
                    .extend(reserved.allocations[before..].iter().cloned());
            }
            kind @ (AstKind::ForOfStatement(_) | AstKind::ForInStatement(_)) => {
                let (span, left) = match kind {
                    AstKind::ForOfStatement(statement) => (statement.span, &statement.left),
                    AstKind::ForInStatement(statement) => (statement.span, &statement.left),
                    _ => unreachable!(),
                };
                let Some(target) = left.as_assignment_target() else {
                    continue;
                };
                if !target.is_assignment_target_pattern()
                    || (only_object_rest && !assignment_has_object_rest(target))
                {
                    continue;
                }
                let before = reserved.checkpoint();
                let root = reserve("_ref", &mut reserved);
                let reservation_checkpoint = reserved.checkpoint();
                plan_assignment_names(target, &mut reserved, &mut helper_usage);
                loop_assignments.insert(
                    span.start,
                    AstAssignmentPlan {
                        root,
                        anchor: left.span(),
                        reservation_checkpoint,
                    },
                );
                let scope_start = semantic
                    .nodes()
                    .ancestor_ids(node_id)
                    .find_map(|ancestor| match semantic.nodes().kind(ancestor) {
                        AstKind::FunctionBody(body) => Some(body.span.start),
                        AstKind::StaticBlock(block) => Some(block.span.start),
                        AstKind::Program(program) => Some(program.span.start),
                        _ => None,
                    })
                    .unwrap_or(0);
                temporary_declarations
                    .entry(scope_start)
                    .or_default()
                    .extend(reserved.allocations[before..].iter().cloned());
            }
            _ => {}
        }
    }
    if helper_usage.property_key {
        helper_names.property_key = reserve("_toPropertyKey", &mut reserved);
        helper_names.property_key_runtime = reserve("_toPropertyKey2", &mut reserved);
    }
    let mut helper_requests = CustomHelperRequests::default();
    if helper_usage.iter {
        helper_requests.materialize_generated(
            &INLINE_DESTRUCTURING_ITER_HELPER_DESCRIPTOR,
            inline_helpers,
            &[
                ("_toArray", &helper_names.iter),
                ("_toArray2", &helper_names.iter_runtime),
            ],
        );
    }
    if helper_usage.object {
        helper_requests.materialize_generated(
            &INLINE_DESTRUCTURING_OBJECT_HELPER_DESCRIPTOR,
            inline_helpers,
            &[
                ("_objectDestructuringEmpty", &helper_names.object),
                ("_objectDestructuringEmpty2", &helper_names.object_runtime),
            ],
        );
    }
    if helper_usage.copy {
        helper_names.copy = reserve("_extends", &mut reserved);
        helper_requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            inline_helpers,
            &[("_extends", &helper_names.copy)],
        );
    }
    if helper_usage.rest {
        let descriptor = if object_rest_loose {
            &INLINE_DESTRUCTURING_LOOSE_REST_HELPER_DESCRIPTOR
        } else {
            &INLINE_DESTRUCTURING_REST_HELPER_DESCRIPTOR
        };
        helper_requests.materialize_generated(
            descriptor,
            inline_helpers,
            &[
                ("_objectWithoutProperties", &helper_names.rest),
                ("_objectWithoutProperties2", &helper_names.rest_runtime),
            ],
        );
        if helper_usage.property_key {
            helper_requests.materialize_generated(
                &INLINE_TO_PROPERTY_KEY_HELPER_DESCRIPTOR,
                inline_helpers,
                &[
                    ("_toPropertyKey", &helper_names.property_key),
                    ("_toPropertyKey2", &helper_names.property_key_runtime),
                ],
            );
        }
    }
    let planned_allocations = reserved
        .allocations
        .iter()
        .enumerate()
        .map(|(index, name)| (name.clone(), index))
        .collect();
    Ok(AstPlan {
        declarations,
        catches,
        assignments,
        loop_assignments,
        temporary_declarations,
        helper_requests,
        helper_names,
        base_reserved: reserved.base,
        planned_allocations,
    })
}

pub(super) fn run_ast<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: AstPlan,
) -> Result<(bool, CustomHelperRequests), &'static str> {
    let mut pass = DestructuringDeclaratorLowerer {
        allocator,
        declarations: plan.declarations,
        catches: plan.catches,
        assignments: plan.assignments,
        loop_assignments: plan.loop_assignments,
        temporary_declarations: plan.temporary_declarations,
        helper_names: plan.helper_names,
        base_reserved: plan.base_reserved,
        planned_allocations: plan.planned_allocations,
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    if let Some(error) = pass.error {
        return Err(error);
    }
    Ok((pass.changed, plan.helper_requests))
}

struct DestructuringDeclaratorLowerer<'a> {
    allocator: &'a Allocator,
    declarations: FxHashMap<Address, AstDeclaratorPlan>,
    catches: FxHashMap<u32, AstCatchPlan>,
    assignments: FxHashMap<u32, AstAssignmentPlan>,
    loop_assignments: FxHashMap<u32, AstAssignmentPlan>,
    temporary_declarations: FxHashMap<u32, Vec<String>>,
    helper_names: HelperNames,
    base_reserved: FxHashSet<String>,
    planned_allocations: FxHashMap<String, usize>,
    changed: bool,
    error: Option<&'static str>,
}

#[expect(deprecated)]
impl<'a> DestructuringDeclaratorLowerer<'a> {
    fn ast(&self) -> AstBuilder<'a> {
        AstBuilder::new(self.allocator)
    }

    fn id(&self, span: Span, name: &str) -> Expression<'a> {
        self.ast()
            .expression_identifier(span, self.allocator.alloc_str(name))
    }

    fn declarator(
        &self,
        span: Span,
        kind: VariableDeclarationKind,
        name: &str,
        init: Option<Expression<'a>>,
    ) -> VariableDeclarator<'a> {
        let ast = self.ast();
        ast.variable_declarator(
            span,
            kind,
            ast.binding_pattern_binding_identifier(span, self.allocator.alloc_str(name)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            init,
            false,
        )
    }

    fn call(
        &self,
        span: Span,
        callee: &str,
        values: impl IntoIterator<Item = Expression<'a>>,
    ) -> Expression<'a> {
        let ast = self.ast();
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.extend(values.into_iter().map(Argument::from));
        ast.expression_call(
            span,
            self.id(span, callee),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        )
    }

    fn computed(&self, span: Span, object: Expression<'a>, key: Expression<'a>) -> Expression<'a> {
        Expression::from(
            self.ast()
                .member_expression_computed(span, object, key, false),
        )
    }

    fn member(&self, span: Span, object: Expression<'a>, property: &str) -> Expression<'a> {
        let ast = self.ast();
        Expression::from(ast.member_expression_static(
            span,
            object,
            ast.identifier_name(span, self.allocator.alloc_str(property)),
            false,
        ))
    }

    fn number(&self, span: Span, value: usize) -> Expression<'a> {
        self.ast()
            .expression_numeric_literal(span, value as f64, None, NumberBase::Decimal)
    }

    fn undefined(&self, span: Span) -> Expression<'a> {
        self.ast()
            .expression_unary(span, UnaryOperator::Void, self.number(span, 0))
    }

    fn default_value(&self, span: Span, temp: &str, fallback: Expression<'a>) -> Expression<'a> {
        let ast = self.ast();
        let test = ast.expression_binary(
            span,
            self.id(span, temp),
            BinaryOperator::StrictEquality,
            self.undefined(span),
        );
        ast.expression_conditional(span, test, fallback, self.id(span, temp))
    }

    fn assign(
        &self,
        span: Span,
        target: AssignmentTarget<'a>,
        value: Expression<'a>,
    ) -> Expression<'a> {
        self.ast()
            .expression_assignment(span, AssignmentOperator::Assign, target, value)
    }

    fn assign_name(&self, span: Span, name: &str, value: Expression<'a>) -> Expression<'a> {
        let target = self
            .ast()
            .simple_assignment_target_assignment_target_identifier(
                span,
                self.allocator.alloc_str(name),
            );
        self.assign(span, target.into(), value)
    }

    fn call_method(
        &self,
        span: Span,
        object: Expression<'a>,
        method: &str,
        values: impl IntoIterator<Item = Expression<'a>>,
    ) -> Expression<'a> {
        let ast = self.ast();
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.extend(values.into_iter().map(Argument::from));
        ast.expression_call(
            span,
            self.member(span, object, method),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        )
    }

    fn lower_assignment_maybe(
        &self,
        target: AssignmentTargetMaybeDefault<'a>,
        value: Expression<'a>,
        anchor: Span,
        output: &mut ArenaVec<'a, Expression<'a>>,
        reserved: &mut impl NameReservations,
    ) -> Result<(), &'static str> {
        match target {
            AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
                let default = default.unbox();
                let temp = reserve("_value", reserved);
                output.push(self.assign_name(anchor, &temp, value));
                let value = self.default_value(anchor, &temp, default.init);
                self.lower_assignment(default.binding, value, anchor, output, reserved)
            }
            target => self.lower_assignment(
                AssignmentTarget::try_from(target)
                    .map_err(|_| "destructuring-assignment-target-conversion")?,
                value,
                anchor,
                output,
                reserved,
            ),
        }
    }

    fn lower_assignment(
        &self,
        target: AssignmentTarget<'a>,
        value: Expression<'a>,
        anchor: Span,
        output: &mut ArenaVec<'a, Expression<'a>>,
        reserved: &mut impl NameReservations,
    ) -> Result<(), &'static str> {
        match target {
            AssignmentTarget::ArrayAssignmentTarget(pattern) => {
                let pattern = pattern.unbox();
                let array = reserve("_arr", reserved);
                let element_count = pattern.elements.len();
                let converted = self.call(
                    anchor,
                    &self.helper_names.iter,
                    [
                        value,
                        self.number(anchor, element_count),
                        self.ast()
                            .expression_boolean_literal(anchor, pattern.rest.is_some()),
                    ],
                );
                output.push(self.assign_name(anchor, &array, converted));
                for (index, element) in pattern.elements.into_iter().enumerate() {
                    if let Some(element) = element {
                        let value = self.computed(
                            anchor,
                            self.id(anchor, &array),
                            self.number(anchor, index),
                        );
                        self.lower_assignment_maybe(element, value, anchor, output, reserved)?;
                    }
                }
                if let Some(rest) = pattern.rest {
                    let value = if element_count == 0 {
                        // The rest conversion already returns a fresh plain array.
                        self.id(anchor, &array)
                    } else {
                        self.call_method(
                            anchor,
                            self.id(anchor, &array),
                            "slice",
                            [self.number(anchor, element_count)],
                        )
                    };
                    self.lower_assignment(rest.unbox().target, value, anchor, output, reserved)?;
                }
            }
            AssignmentTarget::ObjectAssignmentTarget(pattern) => {
                let pattern = pattern.unbox();
                let has_rest = pattern.rest.is_some();
                let object = reserve("_obj", reserved);
                let converted = self.call(anchor, &self.helper_names.object, [value]);
                output.push(self.assign_name(anchor, &object, converted));
                let ast = self.ast();
                let mut excluded = ArenaVec::<ArrayExpressionElement<'a>>::new_in(&ast);
                for property in pattern.properties {
                    match property {
                        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(property) => {
                            let property = property.unbox();
                            let name = property.binding.name;
                            let access =
                                self.member(anchor, self.id(anchor, &object), name.as_str());
                            excluded.push(ArrayExpressionElement::from(
                                ast.expression_string_literal(anchor, name, None),
                            ));
                            let target = AssignmentTarget::from(
                                ast.simple_assignment_target_assignment_target_identifier(
                                    anchor, name,
                                ),
                            );
                            if let Some(init) = property.init {
                                let temp = reserve("_value", reserved);
                                output.push(self.assign_name(anchor, &temp, access));
                                output.push(self.assign(
                                    anchor,
                                    target,
                                    self.default_value(anchor, &temp, init),
                                ));
                            } else {
                                output.push(self.assign(anchor, target, access));
                            }
                        }
                        AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
                            let property = property.unbox();
                            let (access, exclusion) = if property.computed {
                                let key = reserve("_key", reserved);
                                let mut key_expression = Expression::try_from(property.name)
                                    .map_err(|_| "destructuring-computed-key-not-expression")?;
                                if has_rest {
                                    key_expression = self.call(
                                        anchor,
                                        &self.helper_names.property_key,
                                        [key_expression],
                                    );
                                }
                                output.push(self.assign_name(anchor, &key, key_expression));
                                (
                                    self.computed(
                                        anchor,
                                        self.id(anchor, &object),
                                        self.id(anchor, &key),
                                    ),
                                    self.id(anchor, &key),
                                )
                            } else {
                                self.static_access_ast(anchor, &object, property.name)?
                            };
                            excluded.push(ArrayExpressionElement::from(exclusion));
                            self.lower_assignment_maybe(
                                property.binding,
                                access,
                                anchor,
                                output,
                                reserved,
                            )?;
                        }
                    }
                }
                if let Some(rest) = pattern.rest {
                    let value = self.object_rest(anchor, &object, excluded);
                    self.lower_assignment(rest.unbox().target, value, anchor, output, reserved)?;
                }
            }
            target => output.push(self.assign(anchor, target, value)),
        }
        Ok(())
    }

    fn lower_binding(
        &self,
        pattern: BindingPattern<'a>,
        value: Expression<'a>,
        kind: VariableDeclarationKind,
        anchor: Span,
        output: &mut ArenaVec<'a, VariableDeclarator<'a>>,
        reserved: &mut impl NameReservations,
    ) -> Result<(), &'static str> {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                let ast = self.ast();
                output.push(ast.variable_declarator(
                    anchor,
                    kind,
                    BindingPattern::BindingIdentifier(identifier),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(value),
                    false,
                ));
            }
            BindingPattern::AssignmentPattern(pattern) => {
                let pattern = pattern.unbox();
                let temp = reserve("_value", reserved);
                output.push(self.declarator(anchor, kind, &temp, Some(value)));
                let value = self.default_value(anchor, &temp, pattern.right);
                self.lower_binding(pattern.left, value, kind, anchor, output, reserved)?;
            }
            BindingPattern::ArrayPattern(pattern) => {
                let pattern = pattern.unbox();
                let array = reserve("_arr", reserved);
                let element_count = pattern.elements.len();
                let converted = self.call(
                    anchor,
                    &self.helper_names.iter,
                    [
                        value,
                        self.number(anchor, element_count),
                        self.ast()
                            .expression_boolean_literal(anchor, pattern.rest.is_some()),
                    ],
                );
                output.push(self.declarator(anchor, kind, &array, Some(converted)));
                for (index, element) in pattern.elements.into_iter().enumerate() {
                    if let Some(element) = element {
                        let value = self.computed(
                            anchor,
                            self.id(anchor, &array),
                            self.number(anchor, index),
                        );
                        self.lower_binding(element, value, kind, anchor, output, reserved)?;
                    }
                }
                if let Some(rest) = pattern.rest {
                    let value = if element_count == 0 {
                        // The rest conversion already returns a fresh plain array.
                        self.id(anchor, &array)
                    } else {
                        self.call_method(
                            anchor,
                            self.id(anchor, &array),
                            "slice",
                            [self.number(anchor, element_count)],
                        )
                    };
                    self.lower_binding(
                        rest.unbox().argument,
                        value,
                        kind,
                        anchor,
                        output,
                        reserved,
                    )?;
                }
            }
            BindingPattern::ObjectPattern(pattern) => {
                let pattern = pattern.unbox();
                let has_rest = pattern.rest.is_some();
                let object = reserve("_obj", reserved);
                let converted = self.call(anchor, &self.helper_names.object, [value]);
                output.push(self.declarator(anchor, kind, &object, Some(converted)));
                let ast = self.ast();
                let mut excluded = ArenaVec::<ArrayExpressionElement<'a>>::new_in(&ast);
                for property in pattern.properties {
                    let (access, exclusion) = if property.computed {
                        let key = reserve("_key", reserved);
                        let mut key_expression = Expression::try_from(property.key)
                            .map_err(|_| "destructuring-computed-key-not-expression")?;
                        if has_rest {
                            key_expression = self.call(
                                anchor,
                                &self.helper_names.property_key,
                                [key_expression],
                            );
                        }
                        output.push(self.declarator(anchor, kind, &key, Some(key_expression)));
                        (
                            self.computed(anchor, self.id(anchor, &object), self.id(anchor, &key)),
                            self.id(anchor, &key),
                        )
                    } else {
                        self.static_access_ast(anchor, &object, property.key)?
                    };
                    excluded.push(ArrayExpressionElement::from(exclusion));
                    self.lower_binding(property.value, access, kind, anchor, output, reserved)?;
                }
                if let Some(rest) = pattern.rest {
                    let value = self.object_rest(anchor, &object, excluded);
                    self.lower_binding(
                        rest.unbox().argument,
                        value,
                        kind,
                        anchor,
                        output,
                        reserved,
                    )?;
                }
            }
        }
        Ok(())
    }

    fn object_rest(
        &self,
        anchor: Span,
        object: &str,
        excluded: ArenaVec<'a, ArrayExpressionElement<'a>>,
    ) -> Expression<'a> {
        let ast = self.ast();
        if excluded.is_empty() {
            // Empty exclusions are a copy operation. Babel's general rest helper
            // enumerates strings and symbols separately; extends uses the native
            // assign path and therefore takes one key snapshot before getters run.
            self.call(
                anchor,
                &self.helper_names.copy,
                [
                    ast.expression_object(anchor, ArenaVec::new_in(&ast)),
                    self.id(anchor, object),
                ],
            )
        } else {
            self.call(
                anchor,
                &self.helper_names.rest,
                [
                    self.id(anchor, object),
                    ast.expression_array(anchor, excluded),
                ],
            )
        }
    }

    fn static_access_ast(
        &self,
        span: Span,
        object: &str,
        key: PropertyKey<'a>,
    ) -> Result<(Expression<'a>, Expression<'a>), &'static str> {
        match key {
            PropertyKey::StaticIdentifier(identifier) => {
                let name = identifier.name;
                Ok((
                    self.member(span, self.id(span, object), name.as_str()),
                    self.ast().expression_string_literal(span, name, None),
                ))
            }
            key => {
                let expression = Expression::try_from(key)
                    .map_err(|_| "destructuring-property-key-not-expression")?;
                let exclusion = match &expression {
                    Expression::NumericLiteral(_) | Expression::BigIntLiteral(_) => {
                        self.ast().expression_binary(
                            span,
                            self.ast().expression_string_literal(span, "", None),
                            BinaryOperator::Addition,
                            expression.clone_in(self.allocator),
                        )
                    }
                    _ => expression.clone_in(self.allocator),
                };
                Ok((
                    self.computed(span, self.id(span, object), expression),
                    exclusion,
                ))
            }
        }
    }
}

impl<'a> DestructuringDeclaratorLowerer<'a> {
    #[expect(deprecated)]
    fn lower_loop_head(
        &mut self,
        span: Span,
        left: &mut ForStatementLeft<'a>,
        body: &mut Statement<'a>,
    ) {
        if let Some(plan) = self.loop_assignments.remove(&span.start) {
            let ast = self.ast();
            let old_left = (*left).take_in(&ast);
            let target = match AssignmentTarget::try_from(old_left) {
                Ok(target) => target,
                Err(_) => {
                    self.error = Some("destructuring-loop-target-missing");
                    return;
                }
            };
            (*left) = ast
                .simple_assignment_target_assignment_target_identifier(
                    plan.anchor,
                    self.allocator.alloc_str(&plan.root),
                )
                .into();
            let mut expressions = ArenaVec::new_in(&ast);
            let mut reserved = SnapshotReservations {
                base: &self.base_reserved,
                planned: &self.planned_allocations,
                checkpoint: plan.reservation_checkpoint,
                local: FxHashSet::default(),
            };
            if let Err(error) = self.lower_assignment(
                target,
                self.id(plan.anchor, &plan.root),
                plan.anchor,
                &mut expressions,
                &mut reserved,
            ) {
                self.error = Some(error);
                return;
            }
            #[expect(deprecated)]
            let binding = ast.statement_expression(
                plan.anchor,
                ast.expression_sequence(plan.anchor, expressions),
            );
            let old_body = body.take_in(&ast);
            #[expect(deprecated)]
            {
                *body = ast.statement_block(plan.anchor, ast.vec_from_array([binding, old_body]));
            }
            self.changed = true;
            return;
        }

        let ForStatementLeft::VariableDeclaration(declaration) = &mut (*left) else {
            return;
        };
        let Some(declarator) = declaration.declarations.first_mut() else {
            return;
        };
        if declarator.id.is_binding_identifier() {
            return;
        }

        let Some(plan) = self.declarations.remove(&declarator.id.address()) else {
            return;
        };

        let ast = self.ast();
        let old = declarator.take_in(&ast);
        debug_assert!(
            old.init.is_none(),
            "loop-head declarators have no initializer"
        );
        *declarator = self.declarator(plan.anchor, old.kind, &plan.root, None);

        let mut lowered = ArenaVec::new_in(&ast);
        let mut reserved = SnapshotReservations {
            base: &self.base_reserved,
            planned: &self.planned_allocations,
            checkpoint: plan.reservation_checkpoint,
            local: FxHashSet::default(),
        };
        if let Err(error) = self.lower_binding(
            old.id,
            self.id(plan.anchor, &plan.root),
            old.kind,
            plan.anchor,
            &mut lowered,
            &mut reserved,
        ) {
            self.error = Some(error);
            return;
        }
        #[expect(deprecated)]
        let binding = Statement::VariableDeclaration(ast.alloc_variable_declaration(
            plan.anchor,
            old.kind,
            lowered,
            false,
        ));
        let old_body = body.take_in(&ast);
        #[expect(deprecated)]
        {
            // Keep an existing block nested. Its lexical environment is the
            // original loop-body environment; destructuring computed keys are
            // evaluated before entering it and therefore must not observe the
            // TDZ of same-named `let`/`const` declarations in that body.
            *body = ast.statement_block(plan.anchor, ast.vec_from_array([binding, old_body]));
        }
        self.changed = true;
    }
}

impl<'a> VisitMut<'a> for DestructuringDeclaratorLowerer<'a> {
    fn visit_program(&mut self, program: &mut Program<'a>) {
        if let Some(names) = self.temporary_declarations.remove(&program.span.start) {
            match parse_var_declaration(self.allocator, &names, program.span) {
                Ok(declaration) => program.body.insert(0, declaration),
                Err(error) => {
                    self.error = Some(error);
                    return;
                }
            }
        }
        walk_mut::walk_program(self, program);
    }

    fn visit_static_block(&mut self, block: &mut oxc_ast::ast::StaticBlock<'a>) {
        if let Some(names) = self.temporary_declarations.remove(&block.span.start) {
            match parse_var_declaration(self.allocator, &names, block.span) {
                Ok(declaration) => block.body.insert(0, declaration),
                Err(error) => {
                    self.error = Some(error);
                    return;
                }
            }
        }
        walk_mut::walk_static_block(self, block);
    }

    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        let mut index = 0;
        while index < declaration.declarations.len() {
            if declaration.declarations[index].id.is_binding_identifier() {
                index += 1;
                continue;
            }
            let Some(plan) = self
                .declarations
                .remove(&declaration.declarations[index].id.address())
            else {
                index += 1;
                continue;
            };
            let ast = self.ast();
            let old = declaration.declarations[index].take_in(&ast);
            let Some(mut init) = old.init else {
                self.error = Some("destructuring-generated-initializer-missing");
                return;
            };
            clear_leading_pure_annotation(&mut init);
            let mut replacements = ArenaVec::new_in(&ast);
            let mut reserved = SnapshotReservations {
                base: &self.base_reserved,
                planned: &self.planned_allocations,
                checkpoint: plan.reservation_checkpoint,
                local: FxHashSet::default(),
            };
            // Pattern lowering consumes its source once and creates its own
            // object/array temporary; an extra root alias is unnecessary here.
            if let Err(error) = self.lower_binding(
                old.id,
                init,
                old.kind,
                plan.anchor,
                &mut replacements,
                &mut reserved,
            ) {
                self.error = Some(error);
                return;
            }
            let count = replacements.len();
            declaration.declarations.splice(index..=index, replacements);
            index += count;
            self.changed = true;
        }
        walk_mut::walk_variable_declaration(self, declaration);
    }

    fn visit_for_of_statement(&mut self, statement: &mut oxc_ast::ast::ForOfStatement<'a>) {
        self.lower_loop_head(statement.span, &mut statement.left, &mut statement.body);
        walk_mut::walk_for_of_statement(self, statement);
    }

    fn visit_for_in_statement(&mut self, statement: &mut oxc_ast::ast::ForInStatement<'a>) {
        self.lower_loop_head(statement.span, &mut statement.left, &mut statement.body);
        walk_mut::walk_for_in_statement(self, statement);
    }

    fn visit_catch_clause(&mut self, clause: &mut oxc_ast::ast::CatchClause<'a>) {
        if let Some(plan) = self.catches.remove(&clause.span.start) {
            let Some(old_param) = clause.param.take() else {
                self.error = Some("destructuring-catch-parameter-missing");
                return;
            };
            let ast = self.ast();
            #[expect(deprecated)]
            let param = ast.catch_parameter(
                plan.anchor,
                ast.binding_pattern_binding_identifier(
                    plan.anchor,
                    self.allocator.alloc_str(&plan.caught),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            );
            let mut declarators = ArenaVec::new_in(&ast);
            let mut reserved = SnapshotReservations {
                base: &self.base_reserved,
                planned: &self.planned_allocations,
                checkpoint: plan.reservation_checkpoint,
                local: FxHashSet::default(),
            };
            if let Err(error) = self.lower_binding(
                old_param.pattern,
                self.id(plan.anchor, &plan.caught),
                VariableDeclarationKind::Let,
                plan.anchor,
                &mut declarators,
                &mut reserved,
            ) {
                self.error = Some(error);
                return;
            }
            #[expect(deprecated)]
            let declaration = Statement::VariableDeclaration(ast.alloc_variable_declaration(
                plan.anchor,
                VariableDeclarationKind::Let,
                declarators,
                false,
            ));
            clause.param = Some(param);
            clause.body.body.insert(0, declaration);
            self.changed = true;
        }
        walk_mut::walk_catch_clause(self, clause);
    }

    fn visit_function_body(&mut self, body: &mut FunctionBody<'a>) {
        if let Some(names) = self.temporary_declarations.remove(&body.span.start) {
            match parse_var_declaration(self.allocator, &names, body.span) {
                Ok(declaration) => body.statements.insert(0, declaration),
                Err(error) => {
                    self.error = Some(error);
                    return;
                }
            }
        }
        walk_mut::walk_function_body(self, body);
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        walk_mut::walk_expression(self, expression);
        let Expression::AssignmentExpression(assignment) = expression else {
            return;
        };
        let Some(plan) = self.assignments.remove(&assignment.span.start) else {
            return;
        };
        let ast = self.ast();
        let old = expression.take_in(&ast);
        let Expression::AssignmentExpression(assignment) = old else {
            unreachable!();
        };
        let assignment = assignment.unbox();
        let mut expressions = ArenaVec::new_in(&ast);
        expressions.push(self.assign_name(plan.anchor, &plan.root, assignment.right));
        let mut reserved = SnapshotReservations {
            base: &self.base_reserved,
            planned: &self.planned_allocations,
            checkpoint: plan.reservation_checkpoint,
            local: FxHashSet::default(),
        };
        if let Err(error) = self.lower_assignment(
            assignment.left,
            self.id(plan.anchor, &plan.root),
            plan.anchor,
            &mut expressions,
            &mut reserved,
        ) {
            self.error = Some(error);
            return;
        }
        expressions.push(self.id(plan.anchor, &plan.root));
        #[expect(deprecated)]
        {
            *expression = ast.expression_sequence(plan.anchor, expressions);
        }
        self.changed = true;
    }
}

fn clear_leading_pure_annotation(expression: &mut Expression<'_>) {
    match expression {
        Expression::CallExpression(call) => call.pure = false,
        Expression::NewExpression(new) => new.pure = false,
        Expression::ParenthesizedExpression(parenthesized) => {
            clear_leading_pure_annotation(&mut parenthesized.expression);
        }
        _ => {}
    }
}

fn parse_var_declaration<'a>(
    allocator: &'a Allocator,
    names: &[String],
    anchor: Span,
) -> Result<Statement<'a>, &'static str> {
    if names.is_empty() {
        return Err("destructuring-temporary-declaration-empty");
    }
    let ast = AstBuilder::new(allocator);
    let mut declarations = ArenaVec::with_capacity_in(names.len(), &allocator);
    for name in names {
        #[expect(deprecated)]
        declarations.push(ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(anchor, allocator.alloc_str(name)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None,
            false,
        ));
    }
    #[expect(deprecated)]
    Ok(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(anchor, VariableDeclarationKind::Var, declarations, false),
    ))
}

fn ast_eligible_declarator(
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: oxc_semantic::NodeId,
    declarator: &VariableDeclarator<'_>,
) -> bool {
    !declarator.id.is_binding_identifier()
        && (declarator.init.is_some()
            || nodes.ancestor_ids(node_id).any(|ancestor| {
                matches!(
                    nodes.kind(ancestor),
                    AstKind::ForOfStatement(_) | AstKind::ForInStatement(_)
                )
            }))
}

#[derive(Default)]
struct HelperNames {
    iter: String,
    iter_runtime: String,
    object: String,
    object_runtime: String,
    rest: String,
    rest_runtime: String,
    copy: String,
    property_key: String,
    property_key_runtime: String,
}

#[derive(Default)]
struct HelperUsage {
    iter: bool,
    object: bool,
    rest: bool,
    copy: bool,
    property_key: bool,
}

fn plan_binding_names(
    pattern: &BindingPattern<'_>,
    reserved: &mut impl NameReservations,
    helpers: &mut HelperUsage,
) {
    match pattern {
        BindingPattern::BindingIdentifier(_) => {}
        BindingPattern::AssignmentPattern(pattern) => {
            reserve("_value", reserved);
            plan_binding_names(&pattern.left, reserved, helpers);
        }
        BindingPattern::ArrayPattern(pattern) => {
            helpers.iter = true;
            reserve("_arr", reserved);
            for element in pattern.elements.iter().flatten() {
                plan_binding_names(element, reserved, helpers);
            }
            if let Some(rest) = &pattern.rest {
                plan_binding_names(&rest.argument, reserved, helpers);
            }
        }
        BindingPattern::ObjectPattern(pattern) => {
            helpers.object = true;
            if pattern.rest.is_some() && pattern.properties.iter().any(|property| property.computed)
            {
                helpers.property_key = true;
            }
            reserve("_obj", reserved);
            for property in &pattern.properties {
                if property.computed {
                    reserve("_key", reserved);
                }
                plan_binding_names(&property.value, reserved, helpers);
            }
            if let Some(rest) = &pattern.rest {
                if pattern.properties.is_empty() {
                    helpers.copy = true;
                } else {
                    helpers.rest = true;
                }
                plan_binding_names(&rest.argument, reserved, helpers);
            }
        }
    }
}

fn plan_assignment_names(
    target: &AssignmentTarget<'_>,
    reserved: &mut impl NameReservations,
    helpers: &mut HelperUsage,
) {
    match target {
        AssignmentTarget::ArrayAssignmentTarget(pattern) => {
            helpers.iter = true;
            reserve("_arr", reserved);
            for element in pattern.elements.iter().flatten() {
                plan_assignment_maybe_names(element, reserved, helpers);
            }
            if let Some(rest) = &pattern.rest {
                plan_assignment_names(&rest.target, reserved, helpers);
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(pattern) => {
            helpers.object = true;
            if pattern.rest.is_some()
                && pattern.properties.iter().any(|property| {
                    matches!(property, AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) if property.computed)
                })
            {
                helpers.property_key = true;
            }
            reserve("_obj", reserved);
            for property in &pattern.properties {
                match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(property) => {
                        if property.init.is_some() {
                            reserve("_value", reserved);
                        }
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
                        if property.computed {
                            reserve("_key", reserved);
                        }
                        plan_assignment_maybe_names(&property.binding, reserved, helpers);
                    }
                }
            }
            if let Some(rest) = &pattern.rest {
                if pattern.properties.is_empty() {
                    helpers.copy = true;
                } else {
                    helpers.rest = true;
                }
                plan_assignment_names(&rest.target, reserved, helpers);
            }
        }
        _ => {}
    }
}

fn plan_assignment_maybe_names(
    target: &AssignmentTargetMaybeDefault<'_>,
    reserved: &mut impl NameReservations,
    helpers: &mut HelperUsage,
) {
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
            reserve("_value", reserved);
            plan_assignment_names(&default.binding, reserved, helpers);
        }
        target => plan_assignment_names(target.to_assignment_target(), reserved, helpers),
    }
}

fn binding_has_object_rest(pattern: &BindingPattern<'_>) -> bool {
    match pattern {
        BindingPattern::ObjectPattern(pattern) => {
            pattern.rest.is_some()
                || pattern
                    .properties
                    .iter()
                    .any(|property| binding_has_object_rest(&property.value))
        }
        BindingPattern::ArrayPattern(pattern) => {
            pattern
                .elements
                .iter()
                .flatten()
                .any(binding_has_object_rest)
                || pattern
                    .rest
                    .as_ref()
                    .is_some_and(|rest| binding_has_object_rest(&rest.argument))
        }
        BindingPattern::AssignmentPattern(pattern) => binding_has_object_rest(&pattern.left),
        BindingPattern::BindingIdentifier(_) => false,
    }
}

fn assignment_has_object_rest(target: &oxc_ast::ast::AssignmentTarget<'_>) -> bool {
    use oxc_ast::ast::{AssignmentTarget, AssignmentTargetProperty};
    match target {
        AssignmentTarget::ObjectAssignmentTarget(pattern) => {
            pattern.rest.is_some()
                || pattern.properties.iter().any(|property| match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(_) => false,
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(property) => {
                        assignment_maybe_has_object_rest(&property.binding)
                    }
                })
        }
        AssignmentTarget::ArrayAssignmentTarget(pattern) => {
            pattern
                .elements
                .iter()
                .flatten()
                .any(assignment_maybe_has_object_rest)
                || pattern
                    .rest
                    .as_ref()
                    .is_some_and(|rest| assignment_has_object_rest(&rest.target))
        }
        _ => false,
    }
}

fn assignment_maybe_has_object_rest(
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault<'_>,
) -> bool {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
            assignment_has_object_rest(&default.binding)
        }
        _ => assignment_has_object_rest(target.to_assignment_target()),
    }
}

fn reserve(base: &str, reserved: &mut impl NameReservations) -> String {
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
    use oxc_codegen::Codegen;
    use oxc_semantic::SemanticBuilder;

    #[test]
    fn flat_array_declarator_mutates_in_place() {
        let source = "let [first, second] = input;";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, false, false, false).unwrap();
        assert_eq!(plan.declarations.len(), 1);
        let (changed, requests) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let mut names = Vec::new();
        let mut fragments = Vec::new();
        let runtime_policy =
            crate::preflight::helpers::RuntimeHelperPolicy::parse(Some("7.29.7")).unwrap();
        requests.extend_into(&mut names, &mut fragments, false, Some(&runtime_policy));
        assert!(names.contains(&"slicedToArray"));
        assert!(
            fragments
                .concat()
                .contains("require(\"@babel/runtime/helpers/slicedToArray\")")
        );
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("let _arr = _toArray(input"));
        assert!(code.contains("first = _arr[0]"));
        assert!(code.contains("second = _arr[1]"));
        assert!(!code.contains("[first, second]"));
    }

    #[test]
    fn flat_object_declarator_mutates_in_place() {
        let source = "const { value } = input;";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, false, false, false).unwrap();
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("objectDestructuringEmpty"));
        assert!(code.contains("value = _obj.value"));
        assert!(!code.contains("{ value } = input"));
    }

    #[test]
    fn focused_object_rest_requests_the_loose_helper() {
        let source = "var { value, ...rest } = input;";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, false, true, true).unwrap();
        let (changed, requests) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let mut names = Vec::new();
        let mut fragments = Vec::new();
        let runtime_policy =
            crate::preflight::helpers::RuntimeHelperPolicy::parse(Some("7.29.7")).unwrap();
        requests.extend_into(&mut names, &mut fragments, false, Some(&runtime_policy));
        assert!(names.contains(&"objectWithoutPropertiesLoose"));
        assert!(!names.contains(&"objectWithoutProperties"));
        assert!(
            fragments
                .concat()
                .contains("require(\"@babel/runtime/helpers/objectWithoutPropertiesLoose\")")
        );
    }

    #[test]
    fn catch_binding_mutates_in_place() {
        let source = "try { work() } catch ({ message }) { use(message) }";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, false, false, false).unwrap();
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("catch (_caught)"));
        assert!(code.contains("message = _obj.message"));
        assert!(!code.contains("catch ({"));
    }

    #[test]
    fn assignment_pattern_mutates_in_place() {
        let source = "var first, rest; var result = ([first, ...rest] = input);";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, false, false, false).unwrap();
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("first = _arr[0]"));
        assert!(code.contains("rest = _arr.slice(1)"));
        assert!(!code.contains("[first, ...rest] ="));
    }

    #[test]
    fn reservation_planning_allocates_only_generated_names() {
        let source = (0..128)
            .map(|index| format!("const [a{index}, b{index}] = values{index};"))
            .collect::<String>();
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare_ast(&semantic.semantic, true, false, false).unwrap();
        assert_eq!(plan.declarations.len(), 128);
    }
}
