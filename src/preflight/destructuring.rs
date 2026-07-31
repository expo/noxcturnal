use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
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
    INLINE_DESTRUCTURING_ITER_HELPER, INLINE_DESTRUCTURING_ITER_HELPER_BINDINGS,
    INLINE_DESTRUCTURING_ITER_HELPER_PRETTY, INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME,
    INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME_BINDINGS,
    INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME_PRETTY, INLINE_DESTRUCTURING_LOOSE_REST_HELPER,
    INLINE_DESTRUCTURING_LOOSE_REST_HELPER_BINDINGS, INLINE_DESTRUCTURING_LOOSE_REST_HELPER_PRETTY,
    INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME,
    INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME_BINDINGS,
    INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME_PRETTY, INLINE_DESTRUCTURING_OBJECT_HELPER,
    INLINE_DESTRUCTURING_OBJECT_HELPER_BINDINGS, INLINE_DESTRUCTURING_OBJECT_HELPER_PRETTY,
    INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME,
    INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME_BINDINGS,
    INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME_PRETTY, INLINE_DESTRUCTURING_REST_HELPER,
    INLINE_DESTRUCTURING_REST_HELPER_BINDINGS, INLINE_DESTRUCTURING_REST_HELPER_PRETTY,
    INLINE_DESTRUCTURING_REST_HELPER_RUNTIME, INLINE_DESTRUCTURING_REST_HELPER_RUNTIME_BINDINGS,
    INLINE_DESTRUCTURING_REST_HELPER_RUNTIME_PRETTY,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct AstPlan {
    declarations: FxHashMap<u32, Vec<AstDeclaratorPlan>>,
    catches: FxHashMap<u32, AstCatchPlan>,
    assignments: FxHashMap<u32, AstAssignmentPlan>,
    for_of_assignments: FxHashMap<u32, AstAssignmentPlan>,
    temporary_declarations: FxHashMap<u32, Vec<String>>,
    helper_requests: CustomHelperRequests,
    helper_names: HelperNames,
    emitted_helper_names: Vec<String>,
    nested_remaining: bool,
    base_reserved: FxHashSet<String>,
    planned_allocations: FxHashMap<String, usize>,
}

struct AstDeclaratorPlan {
    root: String,
    pattern: String,
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
    _source: &str,
    semantic: &Semantic<'_>,
    inline_helpers: bool,
    only_object_rest: bool,
    object_rest_loose: bool,
    parameters_selected: bool,
    previous_helper_names: &[String],
) -> Result<AstPlan, &'static str> {
    let mut base_reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    base_reserved.extend(previous_helper_names.iter().cloned());
    let mut reserved = PlanningReservations::new(base_reserved);
    let helper_names = HelperNames {
        iter: reserve("_toArray", &mut reserved),
        iter_runtime: reserve("_toArray2", &mut reserved),
        object: reserve("_objectDestructuringEmpty", &mut reserved),
        object_runtime: reserve("_objectDestructuringEmpty2", &mut reserved),
        rest: reserve("_objectWithoutProperties", &mut reserved),
        rest_runtime: reserve("_objectWithoutProperties2", &mut reserved),
        property_key: reserve("_toPropertyKey", &mut reserved),
        property_key_runtime: reserve("_toPropertyKey2", &mut reserved),
    };
    let mut declarations: FxHashMap<u32, Vec<AstDeclaratorPlan>> = FxHashMap::default();
    let mut catches = FxHashMap::default();
    let mut assignments = FxHashMap::default();
    let mut for_of_assignments = FxHashMap::default();
    let mut temporary_declarations: FxHashMap<u32, Vec<String>> = FxHashMap::default();
    let mut helper_usage = HelperUsage::default();
    let mut nested_remaining = false;
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
        let nested = active_pattern_ends
            .last()
            .is_some_and(|end| node_span.end <= *end);
        match node.kind() {
            AstKind::VariableDeclarator(declarator) => {
                let selected_pattern = !declarator.id.is_binding_identifier()
                    && (!only_object_rest || binding_has_object_rest(&declarator.id));
                if selected_pattern {
                    active_pattern_ends.push(declarator.id.span().end);
                }
                if nested {
                    nested_remaining = true;
                    continue;
                }
                if !ast_eligible_declarator(semantic.nodes(), node_id, declarator)
                    || (only_object_rest && !binding_has_object_rest(&declarator.id))
                    // Parameters relocates default expressions into a generated body.
                    // Keep declarations nested in those expressions on the temporary
                    // compatibility path until destructuring planning moves after the
                    // parameter mutation.
                    || (parameters_selected
                        && semantic
                            .nodes()
                            .ancestor_ids(node_id)
                            .any(|ancestor| matches!(
                                semantic.nodes().kind(ancestor),
                                AstKind::FormalParameters(_)
                            )))
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
                declarations
                    .entry(declarator.span.start)
                    .or_default()
                    .push(AstDeclaratorPlan {
                        root,
                        pattern: binding_pattern_fingerprint(&declarator.id),
                        anchor: declarator.span,
                        reservation_checkpoint,
                    });
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
                if nested {
                    nested_remaining = true;
                    continue;
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
                if nested {
                    nested_remaining = true;
                    continue;
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
                        AstKind::Program(program) => Some(program.span.start),
                        _ => None,
                    })
                    .unwrap_or(0);
                temporary_declarations
                    .entry(scope_start)
                    .or_default()
                    .extend(reserved.allocations[before..].iter().cloned());
            }
            AstKind::ForOfStatement(statement)
                if !matches!(statement.left, ForStatementLeft::VariableDeclaration(_)) =>
            {
                let Some(target) = statement.left.as_assignment_target() else {
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
                for_of_assignments.insert(
                    statement.span.start,
                    AstAssignmentPlan {
                        root,
                        anchor: statement.left.span(),
                        reservation_checkpoint,
                    },
                );
                let scope_start = semantic
                    .nodes()
                    .ancestor_ids(node_id)
                    .find_map(|ancestor| match semantic.nodes().kind(ancestor) {
                        AstKind::FunctionBody(body) => Some(body.span.start),
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
    let mut helper_fragment = String::new();
    let mut pretty_helper_fragment = String::new();
    let mut helper_requests = CustomHelperRequests::default();
    let mut emitted_helper_names = Vec::new();
    if helper_usage.iter {
        helper_requests.request("slicedToArray");
        helper_requests.request("toArray");
        let (helper, pretty_helper, bindings) = if inline_helpers {
            (
                INLINE_DESTRUCTURING_ITER_HELPER,
                INLINE_DESTRUCTURING_ITER_HELPER_PRETTY,
                INLINE_DESTRUCTURING_ITER_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME,
                INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME_PRETTY,
                INLINE_DESTRUCTURING_ITER_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace("_toArray2", "__BABEL_TO_ARRAY_RUNTIME__")
                .replace("_toArray", &helper_names.iter)
                .replace("__BABEL_TO_ARRAY_RUNTIME__", &helper_names.iter_runtime)
        };
        helper_fragment.push_str(&rewrite(helper));
        pretty_helper_fragment.push_str(&rewrite(pretty_helper));
        emitted_helper_names.extend(bindings.iter().map(|binding| rewrite(binding)));
    }
    if helper_usage.object {
        helper_requests.request("objectDestructuringEmpty");
        let (helper, pretty_helper, bindings) = if inline_helpers {
            (
                INLINE_DESTRUCTURING_OBJECT_HELPER,
                INLINE_DESTRUCTURING_OBJECT_HELPER_PRETTY,
                INLINE_DESTRUCTURING_OBJECT_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME,
                INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME_PRETTY,
                INLINE_DESTRUCTURING_OBJECT_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace(
                    "_objectDestructuringEmpty2",
                    "__BABEL_OBJECT_DESTRUCTURING_EMPTY_RUNTIME__",
                )
                .replace("_objectDestructuringEmpty", &helper_names.object)
                .replace(
                    "__BABEL_OBJECT_DESTRUCTURING_EMPTY_RUNTIME__",
                    &helper_names.object_runtime,
                )
        };
        helper_fragment.push_str(&rewrite(helper));
        pretty_helper_fragment.push_str(&rewrite(pretty_helper));
        emitted_helper_names.extend(bindings.iter().map(|binding| rewrite(binding)));
    }
    if helper_usage.rest {
        helper_requests.request("objectDestructuringEmpty");
        helper_requests.request(if object_rest_loose {
            "objectWithoutPropertiesLoose"
        } else {
            "objectWithoutProperties"
        });
        let (helper, pretty_helper, bindings) = if object_rest_loose && inline_helpers {
            (
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER,
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER_PRETTY,
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER_BINDINGS,
            )
        } else if object_rest_loose {
            (
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME,
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME_PRETTY,
                INLINE_DESTRUCTURING_LOOSE_REST_HELPER_RUNTIME_BINDINGS,
            )
        } else if inline_helpers {
            (
                INLINE_DESTRUCTURING_REST_HELPER,
                INLINE_DESTRUCTURING_REST_HELPER_PRETTY,
                INLINE_DESTRUCTURING_REST_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_DESTRUCTURING_REST_HELPER_RUNTIME,
                INLINE_DESTRUCTURING_REST_HELPER_RUNTIME_PRETTY,
                INLINE_DESTRUCTURING_REST_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace(
                    "_objectWithoutProperties2",
                    "__BABEL_OBJECT_WITHOUT_PROPERTIES_RUNTIME__",
                )
                .replace("_objectWithoutProperties", &helper_names.rest)
                .replace(
                    "__BABEL_OBJECT_WITHOUT_PROPERTIES_RUNTIME__",
                    &helper_names.rest_runtime,
                )
        };
        helper_fragment.push_str(&rewrite(helper));
        pretty_helper_fragment.push_str(&rewrite(pretty_helper));
        emitted_helper_names.extend(bindings.iter().map(|binding| rewrite(binding)));
        if helper_usage.property_key {
            helper_requests.request("toPropertyKey");
            let (property_key, property_key_pretty) = if inline_helpers {
                (
                    format!(
                        "function {}(t){{var e=typeof t;return(e===\"object\"&&t!==null||e===\"function\")&&(e=t[Symbol.toPrimitive])!==void 0?(t=e.call(t,\"string\"),typeof t===\"object\"?(()=>{{throw new TypeError(\"@@toPrimitive must return a primitive value.\")}})():typeof t===\"symbol\"?t:t+\"\"):typeof t===\"symbol\"?t:String(t)}}",
                        helper_names.property_key,
                    ),
                    format!(
                        "function {}(value) {{\n  const type = typeof value;\n  if ((type === 'object' && value !== null) || type === 'function') {{\n    const exotic = value[Symbol.toPrimitive];\n    if (exotic !== void 0) {{\n      value = exotic.call(value, 'string');\n      if (typeof value === 'object') throw new TypeError('@@toPrimitive must return a primitive value.');\n      return typeof value === 'symbol' ? value : value + '';\n    }}\n  }}\n  return typeof value === 'symbol' ? value : String(value);\n}}\n",
                        helper_names.property_key,
                    ),
                )
            } else {
                (
                    format!(
                        "var {}=require(\"@babel/runtime/helpers/toPropertyKey\");function {}(t){{return {}(t)}}",
                        helper_names.property_key_runtime,
                        helper_names.property_key,
                        helper_names.property_key_runtime,
                    ),
                    format!(
                        "var {} = require('@babel/runtime/helpers/toPropertyKey');\nfunction {}(value) {{\n  return {}(value);\n}}\n",
                        helper_names.property_key_runtime,
                        helper_names.property_key,
                        helper_names.property_key_runtime,
                    ),
                )
            };
            helper_fragment.push_str(&property_key);
            pretty_helper_fragment.push_str(&property_key_pretty);
            emitted_helper_names.push(helper_names.property_key.clone());
            if !inline_helpers {
                emitted_helper_names.push(helper_names.property_key_runtime.clone());
            }
        }
    }
    if !helper_fragment.is_empty() {
        helper_requests.push_fragment(helper_fragment, pretty_helper_fragment);
    }
    emitted_helper_names.sort_unstable();
    emitted_helper_names.dedup();
    helper_requests.reserve_scope_names(emitted_helper_names.iter().cloned());
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
        for_of_assignments,
        temporary_declarations,
        helper_requests,
        helper_names,
        emitted_helper_names,
        nested_remaining,
        base_reserved: reserved.base,
        planned_allocations,
    })
}

impl AstPlan {
    pub(super) fn nested_remaining(&self) -> bool {
        self.nested_remaining
    }

    pub(super) fn emitted_helper_names(&self) -> &[String] {
        &self.emitted_helper_names
    }
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
        for_of_assignments: plan.for_of_assignments,
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
    declarations: FxHashMap<u32, Vec<AstDeclaratorPlan>>,
    catches: FxHashMap<u32, AstCatchPlan>,
    assignments: FxHashMap<u32, AstAssignmentPlan>,
    for_of_assignments: FxHashMap<u32, AstAssignmentPlan>,
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
                    let value = self.call_method(
                        anchor,
                        self.id(anchor, &array),
                        "slice",
                        [self.number(anchor, element_count)],
                    );
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
                    let excluded = ast.expression_array(anchor, excluded);
                    let value = self.call(
                        anchor,
                        &self.helper_names.rest,
                        [self.id(anchor, &object), excluded],
                    );
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
                    let slice = self.member(anchor, self.id(anchor, &array), "slice");
                    let ast = self.ast();
                    let mut arguments = ArenaVec::new_in(&ast);
                    arguments.push(Argument::from(self.number(anchor, element_count)));
                    let value = ast.expression_call(
                        anchor,
                        slice,
                        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                        arguments,
                        false,
                    );
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
                    let excluded = ast.expression_array(anchor, excluded);
                    let value = self.call(
                        anchor,
                        &self.helper_names.rest,
                        [self.id(anchor, &object), excluded],
                    );
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
                let exclusion = expression.clone_in(self.allocator);
                Ok((
                    self.computed(span, self.id(span, object), expression),
                    exclusion,
                ))
            }
        }
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

    fn visit_variable_declaration(&mut self, declaration: &mut VariableDeclaration<'a>) {
        let mut index = 0;
        while index < declaration.declarations.len() {
            if declaration.declarations[index].id.is_binding_identifier() {
                index += 1;
                continue;
            }
            let start = declaration.declarations[index].span.start;
            let Some(plans) = self.declarations.get_mut(&start) else {
                index += 1;
                continue;
            };
            let pattern = binding_pattern_fingerprint(&declaration.declarations[index].id);
            let Some(position) = plans.iter().position(|plan| plan.pattern == pattern) else {
                self.error = Some("destructuring-declarator-plan-mismatch");
                return;
            };
            let plan = plans.remove(position);
            if plans.is_empty() {
                self.declarations.remove(&start);
            }
            let ast = self.ast();
            let old = declaration.declarations[index].take_in(&ast);
            let Some(mut init) = old.init else {
                self.error = Some("destructuring-generated-initializer-missing");
                return;
            };
            clear_leading_pure_annotation(&mut init);
            let mut replacements = ArenaVec::new_in(&ast);
            replacements.push(self.declarator(plan.anchor, old.kind, &plan.root, Some(init)));
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

    #[expect(deprecated)]
    fn visit_for_of_statement(&mut self, statement: &mut oxc_ast::ast::ForOfStatement<'a>) {
        if let Some(plan) = self.for_of_assignments.remove(&statement.span.start) {
            let ast = self.ast();
            let old_left = statement.left.take_in(&ast);
            let target = match AssignmentTarget::try_from(old_left) {
                Ok(target) => target,
                Err(_) => {
                    self.error = Some("destructuring-for-of-target-missing");
                    return;
                }
            };
            statement.left = ast
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
            let body = &mut statement.body;
            let old_body = body.take_in(&ast);
            #[expect(deprecated)]
            {
                *body = ast.statement_block(plan.anchor, ast.vec_from_array([binding, old_body]));
            }
            self.changed = true;
            walk_mut::walk_for_of_statement(self, statement);
            return;
        }

        let ForStatementLeft::VariableDeclaration(declaration) = &mut statement.left else {
            walk_mut::walk_for_of_statement(self, statement);
            return;
        };
        let Some(declarator) = declaration.declarations.first_mut() else {
            walk_mut::walk_for_of_statement(self, statement);
            return;
        };
        if declarator.id.is_binding_identifier() {
            walk_mut::walk_for_of_statement(self, statement);
            return;
        }

        let start = declarator.span.start;
        let pattern = binding_pattern_fingerprint(&declarator.id);
        let Some(plans) = self.declarations.get_mut(&start) else {
            walk_mut::walk_for_of_statement(self, statement);
            return;
        };
        let Some(position) = plans.iter().position(|plan| plan.pattern == pattern) else {
            self.error = Some("destructuring-declarator-plan-mismatch");
            return;
        };
        let plan = plans.remove(position);
        if plans.is_empty() {
            self.declarations.remove(&start);
        }

        let ast = self.ast();
        let old = declarator.take_in(&ast);
        debug_assert!(old.init.is_none(), "for-of declarators have no initializer");
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
        let body = &mut statement.body;
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
        walk_mut::walk_for_of_statement(self, statement);
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
            || nodes
                .ancestor_ids(node_id)
                .any(|ancestor| matches!(nodes.kind(ancestor), AstKind::ForOfStatement(_))))
}

fn binding_pattern_fingerprint(pattern: &BindingPattern<'_>) -> String {
    fn write(pattern: &BindingPattern<'_>, output: &mut String) {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                output.push_str("id:");
                output.push_str(identifier.name.as_str());
            }
            BindingPattern::AssignmentPattern(pattern) => {
                output.push_str("default(");
                write(&pattern.left, output);
                output.push(')');
            }
            BindingPattern::ArrayPattern(pattern) => {
                output.push('[');
                for element in &pattern.elements {
                    if let Some(element) = element {
                        write(element, output);
                    } else {
                        output.push('_');
                    }
                    output.push(',');
                }
                if let Some(rest) = &pattern.rest {
                    output.push_str("...");
                    write(&rest.argument, output);
                }
                output.push(']');
            }
            BindingPattern::ObjectPattern(pattern) => {
                output.push('{');
                for property in &pattern.properties {
                    if property.computed {
                        output.push_str("computed");
                    } else {
                        match &property.key {
                            PropertyKey::StaticIdentifier(identifier) => {
                                output.push_str(identifier.name.as_str());
                            }
                            key => {
                                output.push_str("key@");
                                output.push_str(&key.span().start.to_string());
                                output.push(':');
                                output.push_str(&key.span().end.to_string());
                            }
                        }
                    }
                    output.push(':');
                    write(&property.value, output);
                    output.push(',');
                }
                if let Some(rest) = &pattern.rest {
                    output.push_str("...");
                    write(&rest.argument, output);
                }
                output.push('}');
            }
        }
    }

    let mut output = String::new();
    write(pattern, &mut output);
    output
}

struct HelperNames {
    iter: String,
    iter_runtime: String,
    object: String,
    object_runtime: String,
    rest: String,
    rest_runtime: String,
    property_key: String,
    property_key_runtime: String,
}

#[derive(Default)]
struct HelperUsage {
    iter: bool,
    object: bool,
    rest: bool,
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
                helpers.rest = true;
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
                helpers.rest = true;
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
        let plan =
            prepare_ast(source, &semantic.semantic, false, false, false, false, &[]).unwrap();
        assert_eq!(plan.declarations.len(), 1);
        let (changed, requests) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let mut names = Vec::new();
        let mut fragments = Vec::new();
        requests.extend_into(&mut names, &mut fragments, false);
        assert!(names.contains(&"slicedToArray"));
        assert!(
            fragments
                .concat()
                .contains("require(\"@babel/runtime/helpers/slicedToArray\")")
        );
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("let _ref = input"));
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
        let plan =
            prepare_ast(source, &semantic.semantic, false, false, false, false, &[]).unwrap();
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
        let plan = prepare_ast(source, &semantic.semantic, false, true, true, false, &[]).unwrap();
        let (changed, requests) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let mut names = Vec::new();
        let mut fragments = Vec::new();
        requests.extend_into(&mut names, &mut fragments, false);
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
        let plan =
            prepare_ast(source, &semantic.semantic, false, false, false, false, &[]).unwrap();
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
        let plan =
            prepare_ast(source, &semantic.semantic, false, false, false, false, &[]).unwrap();
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
        let plan =
            prepare_ast(&source, &semantic.semantic, true, false, false, false, &[]).unwrap();
        assert_eq!(plan.declarations.len(), 128);
    }
}
