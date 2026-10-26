use oxc_allocator::GetAllocator;
use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::builder::GetAstBuilder;
use oxc_ast::{
    AstKind,
    ast::{
        AccessorProperty, Argument, ArrayExpressionElement, AssignmentTarget, BindingPattern,
        ChainElement, Class, ClassElement, Declaration, ExportDeclaration,
        ExportDefaultDeclaration, ExportDefaultDeclarationKind, Expression, FormalParameterKind,
        FormalParameterRest, FormalParameters, Function, FunctionType, MethodDefinitionKind,
        MethodDefinitionType, Program, PropertyKey, PropertyKind, SimpleAssignmentTarget,
        Statement, TSThisParameter, TSTypeAnnotation, TSTypeParameterDeclaration,
        TSTypeParameterInstantiation, VariableDeclaration, VariableDeclarationKind,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
#[cfg(test)]
use oxc_parser::Parser;
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::AssignmentOperator;
use oxc_syntax::scope::ScopeFlags;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::inline_helpers::{
    INLINE_CLASS_CONSTRUCT_ASSERT_HELPER_DESCRIPTOR, INLINE_CLASS_CONSTRUCT_HELPER_DESCRIPTOR,
    INLINE_CLASS_KEY_HELPER_DESCRIPTOR, INLINE_CLASS_PRIVATE_HELPERS_DESCRIPTOR,
    INLINE_CLASS_PRIVATE_IN_HELPER_DESCRIPTOR, INLINE_CLASS_SUPER_GET_HELPER_DESCRIPTOR,
    INLINE_CLASS_SUPER_GET_SET_HELPER_DESCRIPTOR, INLINE_CLASS_SUPER_REFERENCE_HELPER_DESCRIPTOR,
    INLINE_CLASS_SUPER_SET_HELPER_DESCRIPTOR,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct AstPlan {
    direct: FxHashMap<NodeId, DirectClassPlan>,
    helper_requests: Option<ClassHelperPlan>,
}

struct DirectClassPlan {
    name: String,
    inferred_name: Option<String>,
    super_name: Option<String>,
    receiver_name: Option<String>,
    result_name: Option<String>,
    new_target_name: Option<String>,
    super_call_name: Option<String>,
    private_keys: FxHashMap<String, (String, String)>,
    computed_keys: FxHashMap<NodeId, String>,
    private_methods: FxHashMap<String, String>,
    initializer_name: String,
    constructor_parameters: Vec<String>,
    initializer_new_target_name: String,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    helper_names: ClassHelperNames,
    uses_super_get: bool,
    uses_super_reference: bool,
    uses_super_accessor: bool,
    uses_private_helper: bool,
    uses_check_in_rhs: bool,
}

#[derive(Default)]
struct ClassFacts {
    super_reference_ids: Vec<NodeId>,
    has_private_in: bool,
    uses_private_helper: bool,
}

fn collect_class_facts(semantic: &Semantic<'_>) -> FxHashMap<NodeId, ClassFacts> {
    let mut facts = FxHashMap::default();
    let nodes = semantic.nodes();
    let mut ancestry = Vec::<(NodeId, Option<NodeId>)>::new();
    for (node_id, node) in nodes.iter_enumerated() {
        let parent = nodes.parent_id(node_id);
        while ancestry.last().is_some_and(|(id, _)| *id != parent) {
            ancestry.pop();
        }
        let owner = if matches!(node.kind(), AstKind::Class(_)) {
            facts.insert(node_id, ClassFacts::default());
            Some(node_id)
        } else {
            ancestry.last().and_then(|(_, owner)| *owner)
        };
        ancestry.push((node_id, owner));
        let Some(class_id) = owner else {
            continue;
        };
        let class_facts = facts.get_mut(&class_id).unwrap();
        match node.kind() {
            AstKind::Super(_) => class_facts.super_reference_ids.push(node_id),
            AstKind::PrivateInExpression(_) => class_facts.has_private_in = true,
            AstKind::PrivateFieldExpression(_) => class_facts.uses_private_helper = true,
            _ => {}
        }
    }
    facts
}

#[derive(Clone)]
struct ClassHelperNames {
    construct: String,
    construct_runtime: String,
    super_get: String,
    super_get_runtime: String,
    super_reference: String,
    super_reference_runtime: String,
    property_key: String,
    property_key_runtime: String,
    private_base: String,
    check_in_rhs: String,
    check_in_rhs_runtime: String,
    private_runtime: String,
}

impl AstPlan {
    pub(super) fn is_empty(&self) -> bool {
        self.direct.is_empty()
    }
}

struct ClassHelperPlan {
    names: ClassHelperNames,
    construct: bool,
    super_get: bool,
    super_reference: bool,
    super_accessor: bool,
    property_key: bool,
    private: bool,
    check_in_rhs: bool,
    inline: bool,
}

impl ClassHelperPlan {
    fn materialize(self, construct_assert: bool) -> CustomHelperRequests {
        let names = &self.names;
        let mut requests = CustomHelperRequests::default();
        if self.private {
            requests.materialize_generated(
                &INLINE_CLASS_PRIVATE_HELPERS_DESCRIPTOR,
                self.inline,
                &[
                    ("_classPrivateFieldLooseBase", &names.private_base),
                    ("_classPrivateFieldLooseBase2", &names.private_runtime),
                ],
            );
        }
        if self.check_in_rhs {
            requests.materialize_generated(
                &INLINE_CLASS_PRIVATE_IN_HELPER_DESCRIPTOR,
                self.inline,
                &[
                    ("_checkInRHS", &names.check_in_rhs),
                    ("_checkInRHS2", &names.check_in_rhs_runtime),
                ],
            );
        }
        if self.construct {
            let descriptor = if construct_assert {
                &INLINE_CLASS_CONSTRUCT_ASSERT_HELPER_DESCRIPTOR
            } else {
                &INLINE_CLASS_CONSTRUCT_HELPER_DESCRIPTOR
            };
            requests.materialize_generated(
                descriptor,
                self.inline,
                &[
                    ("_construct", &names.construct),
                    ("_construct2", &names.construct_runtime),
                ],
            );
        }
        if self.super_reference {
            let descriptor = if self.super_accessor {
                &INLINE_CLASS_SUPER_REFERENCE_HELPER_DESCRIPTOR
            } else if self.super_get {
                &INLINE_CLASS_SUPER_GET_SET_HELPER_DESCRIPTOR
            } else {
                &INLINE_CLASS_SUPER_SET_HELPER_DESCRIPTOR
            };
            let mut renames = vec![
                ("_superReference", names.super_reference.as_str()),
                ("_superReference2", names.super_reference_runtime.as_str()),
            ];
            if self.super_get {
                renames.push(("_get", names.super_get.as_str()));
            }
            requests.materialize_generated(descriptor, self.inline, &renames);
        } else if self.super_get {
            requests.materialize_generated(
                &INLINE_CLASS_SUPER_GET_HELPER_DESCRIPTOR,
                self.inline,
                &[
                    ("_get", &names.super_get),
                    ("_get2", &names.super_get_runtime),
                ],
            );
        }
        if self.property_key {
            requests.materialize_generated(
                &INLINE_CLASS_KEY_HELPER_DESCRIPTOR,
                self.inline,
                &[
                    ("_classKey", &names.property_key),
                    ("_classKey2", &names.property_key_runtime),
                ],
            );
        }
        requests
    }
}

#[expect(clippy::too_many_arguments)]
fn direct_class_candidates(
    semantic: &Semantic<'_>,
    facts: &FxHashMap<NodeId, ClassFacts>,
    lower_all_classes: bool,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    private_methods_loose: Option<bool>,
    private_in_loose: Option<bool>,
    helper_names: &ClassHelperNames,
    reserved: &mut FxHashSet<String>,
) -> FxHashMap<NodeId, DirectClassPlan> {
    let nodes = semantic.nodes();
    let mut direct: FxHashMap<NodeId, DirectClassPlan> = FxHashMap::default();
    for (node_id, node) in nodes.iter_enumerated() {
        let AstKind::Class(class) = node.kind() else {
            continue;
        };
        let derived = class.heritage.is_some();
        let class_facts = &facts[&node_id];
        let own_super_reference_ids = &class_facts.super_reference_ids;
        let constructor = class.body.body.iter().find_map(|element| match element {
            ClassElement::MethodDefinition(method)
                if method.kind == MethodDefinitionKind::Constructor =>
            {
                method.value.body.as_ref().map(|_| method.as_ref())
            }
            _ => None,
        });
        let supported_derived_constructor =
            constructor.is_some_and(|constructor| constructor.value.body.is_some());
        let has_private_methods = class.body.body.iter().any(|element| {
            matches!(
                element,
                ClassElement::MethodDefinition(method)
                    if matches!(method.key, PropertyKey::PrivateIdentifier(_))
            )
        });
        let has_private_in = class_facts.has_private_in;
        let uses_private_helper = class_facts.uses_private_helper;
        let uses_super_get = own_super_reference_ids.iter().any(|super_id| {
            matches!(
                nodes.kind(nodes.parent_id(*super_id)),
                AstKind::StaticMemberExpression(_) | AstKind::ComputedMemberExpression(_)
            )
        });
        let owned_by_focused_private = (has_private_methods && private_methods_loose.is_some())
            || (has_private_in && private_in_loose.is_some());
        // Focused private lowering also owns a suspended nested class when its
        // closures capture the enclosing lowered private environment. Lower it
        // first so its suspended keys stay in the caller, just as with `classes`.
        let suspended_private_dependency = if !lower_all_classes && !owned_by_focused_private {
            let mut suspension = KeySuspension(false);
            suspension.visit_class(class);
            let mut enclosing = FxHashSet::default();
            if suspension.0 {
                for ancestor in nodes.ancestor_ids(node_id) {
                    if let AstKind::Class(parent) = nodes.kind(ancestor)
                        && let Some(plan) = direct.get(&ancestor)
                        && parent.body.body.iter().any(|element| {
                            element.computed()
                                && element.property_key().is_some_and(|key| {
                                    // The class can be the computed key itself.
                                    let key_id = key.node_id();
                                    key_id == node_id
                                        || nodes.ancestor_ids(node_id).any(|id| id == key_id)
                                })
                        })
                    {
                        enclosing.extend(plan.private_keys.keys().cloned());
                    }
                }
            }
            let mut capture = EnclosingPrivateUse {
                names: enclosing,
                found: false,
            };
            capture.visit_class(class);
            capture.found
        } else {
            false
        };
        if !lower_all_classes && !owned_by_focused_private && !suspended_private_dependency {
            continue;
        }
        if !class.decorators.is_empty()
            || (derived && constructor.is_some() && !supported_derived_constructor)
            || class.body.body.iter().any(|element| match element {
                ClassElement::MethodDefinition(method) => {
                    !method.decorators.is_empty()
                        || (matches!(method.key, PropertyKey::PrivateIdentifier(_))
                            && private_methods_loose != Some(true))
                }
                ClassElement::PropertyDefinition(_) => class_properties_loose.is_none(),
                ClassElement::AccessorProperty(accessor) => {
                    !accessor.decorators.is_empty() || class_properties_loose.is_none()
                }
                ClassElement::StaticBlock(_) => !class_static_blocks,
                ClassElement::TSIndexSignature(_) => false,
            })
        {
            continue;
        }
        if (has_private_methods && private_methods_loose != Some(true))
            || (has_private_in && private_in_loose != Some(true))
        {
            continue;
        }
        let inferred_name = class
            .id
            .is_none()
            .then(|| inferred_class_name(nodes, node_id))
            .flatten();
        let name = class.id.as_ref().map_or_else(
            || reserve("_Class", reserved),
            |identifier| identifier.name.to_string(),
        );
        // This spelling is only a seed. prepare_ast reserves the actual
        // parameter after member name planning. Keep `_super` available for
        // the legacy general-derived template's local constructor thunk.
        let super_name =
            derived.then(|| format!("__nox_super_{}_{}", class.span.start, class.span.end));
        let receiver_name = derived.then(|| local_name("_this", reserved));
        let result_name =
            (derived && constructor.is_some()).then(|| local_name("_result", reserved));
        let generic_derived = constructor.is_some_and(|constructor| {
            constructor.value.params.has_parameter()
                || constructor
                    .value
                    .body
                    .as_ref()
                    .is_some_and(|body| !has_single_leading_super(body))
        });
        let captures_new_target = constructor
            .and_then(|constructor| constructor.value.body.as_ref())
            .is_some_and(|body| contains_new_target(body));
        let new_target_name =
            (derived && constructor.is_some() && (generic_derived || captures_new_target))
                .then(|| local_name("_newtarget", reserved));
        let super_call_name = (derived && generic_derived).then(|| local_name("_super", reserved));
        let mut private_keys = FxHashMap::default();
        let mut computed_keys = FxHashMap::default();
        for element in &class.body.body {
            let key = match element {
                ClassElement::MethodDefinition(method) => &method.key,
                ClassElement::PropertyDefinition(property) => &property.key,
                ClassElement::AccessorProperty(accessor) => {
                    let synthetic = format!("\0accessor:{}", accessor.node_id.get().index());
                    private_keys.entry(synthetic).or_insert_with(|| {
                        (
                            reserve("_accessor", reserved),
                            reserve(
                                &format!("__accessor_{}_{}", name, accessor.span.start),
                                reserved,
                            ),
                        )
                    });
                    &accessor.key
                }
                _ => continue,
            };
            let PropertyKey::PrivateIdentifier(identifier) = key else {
                continue;
            };
            private_keys
                .entry(identifier.name.to_string())
                .or_insert_with(|| {
                    (
                        reserve(&format!("_{}", identifier.name), reserved),
                        format!("__private_{}_{}", name, identifier.name),
                    )
                });
        }
        for element in &class.body.body {
            match element {
                ClassElement::PropertyDefinition(property) if property.computed => {
                    computed_keys.insert(property.node_id.get(), reserve("_key", reserved));
                }
                ClassElement::MethodDefinition(method) if method.computed => {
                    computed_keys.insert(method.node_id.get(), reserve("_key", reserved));
                }
                ClassElement::AccessorProperty(accessor) if accessor.computed => {
                    computed_keys.insert(accessor.node_id.get(), reserve("_key", reserved));
                }
                _ => {}
            }
        }
        let private_methods = private_keys
            .keys()
            .map(|key| (key.clone(), reserve("_privateMethod", reserved)))
            .collect();
        let mut usage = SuperHelperUsage::default();
        if uses_super_get {
            usage.visit_class_body(&class.body);
        }
        direct.insert(
            node_id,
            DirectClassPlan {
                name,
                inferred_name,
                super_name,
                receiver_name,
                result_name,
                new_target_name,
                super_call_name,
                private_keys,
                computed_keys,
                private_methods,
                constructor_parameters: constructor
                    .map(|method| {
                        method
                            .value
                            .params
                            .items
                            .iter()
                            .take_while(|parameter| parameter.initializer.is_none())
                            .map(|_| reserve("_argument", reserved))
                            .collect()
                    })
                    .unwrap_or_default(),
                initializer_name: reserve("_initialize", reserved),
                initializer_new_target_name: reserve("_fieldNewTarget", reserved),
                class_properties_loose,
                class_static_blocks,
                helper_names: helper_names.clone(),
                uses_super_get: usage.read,
                uses_super_reference: usage.write,
                uses_super_accessor: usage.accessor,
                uses_private_helper,
                uses_check_in_rhs: has_private_in,
            },
        );
    }
    direct
}

fn inferred_class_name(nodes: &oxc_semantic::AstNodes<'_>, node_id: NodeId) -> Option<String> {
    match nodes.parent_kind(node_id) {
        AstKind::VariableDeclarator(declarator) => match &declarator.id {
            BindingPattern::BindingIdentifier(identifier) => Some(identifier.name.to_string()),
            _ => None,
        },
        AstKind::AssignmentExpression(assignment) if assignment.operator.is_assign() => {
            match &assignment.left {
                AssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                    Some(identifier.name.to_string())
                }
                _ => None,
            }
        }
        AstKind::AssignmentPattern(pattern) => pattern
            .left
            .get_binding_identifier()
            .map(|id| id.name.to_string()),
        AstKind::FormalParameter(parameter) => parameter
            .pattern
            .get_binding_identifier()
            .map(|id| id.name.to_string()),
        AstKind::AssignmentTargetWithDefault(default) => match &default.binding {
            AssignmentTarget::AssignmentTargetIdentifier(id) => Some(id.name.to_string()),
            _ => None,
        },
        AstKind::ObjectProperty(property) if !property.computed => {
            property.key.static_name().map(|name| name.into_owned())
        }
        _ => None,
    }
}

pub(super) fn prepare_ast(
    semantic: &Semantic<'_>,
    lower_all_classes: bool,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    private_methods_loose: Option<bool>,
    private_in_loose: Option<bool>,
    inline_helpers: bool,
) -> Result<AstPlan, &'static str> {
    let class_facts = collect_class_facts(semantic);
    if class_facts.is_empty() {
        return Ok(AstPlan {
            direct: FxHashMap::default(),
            helper_requests: None,
        });
    }
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    let helper_names = ClassHelperNames {
        construct: reserve("_construct", &mut reserved),
        construct_runtime: reserve("_construct2", &mut reserved),
        super_get: reserve("_get", &mut reserved),
        super_get_runtime: reserve("_get2", &mut reserved),
        super_reference: reserve("_superReference", &mut reserved),
        super_reference_runtime: reserve("_superReference2", &mut reserved),
        property_key: reserve("_classKey", &mut reserved),
        property_key_runtime: reserve("_classKey2", &mut reserved),
        private_base: reserve("_classPrivateFieldLooseBase", &mut reserved),
        check_in_rhs: reserve("_checkInRHS", &mut reserved),
        check_in_rhs_runtime: reserve("_checkInRHS2", &mut reserved),
        private_runtime: reserve("_classPrivateFieldLooseBase2", &mut reserved),
    };
    let mut direct = direct_class_candidates(
        semantic,
        &class_facts,
        lower_all_classes,
        class_properties_loose,
        class_static_blocks,
        private_methods_loose,
        private_in_loose,
        &helper_names,
        &mut reserved,
    );
    // Superclass parameters are used only during lowering. Allocate them after
    // member names, against both bindings and unresolved globals, so their
    // source-based spelling never supplies identity or captures a user name.
    reserved.extend(
        semantic
            .scoping()
            .root_unresolved_references()
            .keys()
            .map(|name| name.to_string()),
    );
    let mut class_ids = direct.keys().copied().collect::<Vec<_>>();
    class_ids.sort_unstable_by_key(|id| id.index());
    for id in class_ids {
        if let Some(name) = &mut direct.get_mut(&id).unwrap().super_name {
            *name = reserve(name, &mut reserved);
        }
    }
    let direct_ids = direct.keys().copied().collect::<FxHashSet<_>>();
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        let AstKind::Class(class) = node.kind() else {
            continue;
        };
        let owns_private_method = class.body.body.iter().any(|element| {
            matches!(
                element,
                ClassElement::MethodDefinition(method)
                    if matches!(method.key, PropertyKey::PrivateIdentifier(_))
            )
        }) && private_methods_loose.is_some();
        let owns_private_in = private_in_loose.is_some() && class_facts[&node_id].has_private_in;
        if !(lower_all_classes || owns_private_method || owns_private_in)
            || direct_ids.contains(&node_id)
        {
            continue;
        }
        if !class.decorators.is_empty()
            || class.body.body.iter().any(|element| match element {
                ClassElement::MethodDefinition(method) => !method.decorators.is_empty(),
                _ => false,
            })
        {
            return Err("classes-decorator-precondition-failed");
        }
        return Err("classes-direct-plan-missing");
    }
    let uses_construct = direct.values().any(|plan| plan.super_name.is_some());
    let uses_super_get = direct.values().any(|plan| plan.uses_super_get);
    let uses_private = direct
        .values()
        .any(|plan| plan.uses_private_helper || !plan.private_keys.is_empty());
    let uses_check_in_rhs = direct.values().any(|plan| plan.uses_check_in_rhs);
    let uses_super_reference = direct.values().any(|plan| plan.uses_super_reference);
    let uses_super_accessor = direct.values().any(|plan| plan.uses_super_accessor);
    let uses_property_key = direct.values().any(|plan| !plan.computed_keys.is_empty());
    Ok(AstPlan {
        direct,
        helper_requests: Some(ClassHelperPlan {
            names: helper_names,
            construct: uses_construct,
            super_get: uses_super_get,
            super_reference: uses_super_reference,
            super_accessor: uses_super_accessor,
            property_key: uses_property_key,
            private: uses_private,
            check_in_rhs: uses_check_in_rhs,
            inline: inline_helpers,
        }),
    })
}

pub(super) fn run_ast<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: AstPlan,
) -> Result<(bool, CustomHelperRequests), &'static str> {
    let mut pass = ClassAstLowerer {
        allocator,
        direct: plan.direct,
        construct_assert: false,
        changed: false,
        error: None,
        private_temporaries: Vec::new(),
    };
    pass.visit_program(program);
    if let Some(error) = pass.error {
        return Err(error);
    }
    if !pass.direct.is_empty() {
        return Err("classes-direct-ast-target-missing");
    }
    let requests = plan
        .helper_requests
        .map(|helpers| helpers.materialize(pass.construct_assert))
        .unwrap_or_default();
    Ok((pass.changed, requests))
}

struct ClassAstLowerer<'a> {
    allocator: &'a Allocator,
    direct: FxHashMap<NodeId, DirectClassPlan>,
    construct_assert: bool,
    changed: bool,
    error: Option<&'static str>,
    private_temporaries: Vec<String>,
}

impl<'a> ClassAstLowerer<'a> {
    fn prepend_private_temporaries(
        &self,
        statements: &mut ArenaVec<'a, Statement<'a>>,
        names: Vec<String>,
    ) {
        if names.is_empty() {
            return;
        }
        let ast = AstBuilder::new(self.allocator);
        let declarations = names.into_iter().map(|name| {
            oxc_ast::ast::VariableDeclarator::new(
                Span::default(),
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    Span::default(),
                    self.allocator.alloc_str(&name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None,
                false,
                ast.builder(),
            )
        });
        statements.insert(
            0,
            Statement::VariableDeclaration(oxc_ast::ast::VariableDeclaration::boxed(
                Span::default(),
                VariableDeclarationKind::Var,
                ArenaVec::from_iter_in(declarations, &ast),
                false,
                ast.builder(),
            )),
        );
    }
}

impl<'a> VisitMut<'a> for ClassAstLowerer<'a> {
    fn visit_program(&mut self, program: &mut Program<'a>) {
        walk_mut::walk_program(self, program);
        let names = std::mem::take(&mut self.private_temporaries);
        self.prepend_private_temporaries(&mut program.body, names);
    }

    fn visit_function_body(&mut self, body: &mut oxc_ast::ast::FunctionBody<'a>) {
        let outer = std::mem::take(&mut self.private_temporaries);
        walk_mut::walk_function_body(self, body);
        let names = std::mem::replace(&mut self.private_temporaries, outer);
        self.prepend_private_temporaries(&mut body.statements, names);
    }

    fn visit_arrow_function_expression(
        &mut self,
        arrow: &mut oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
        if !arrow.is_expression() {
            walk_mut::walk_arrow_function_expression(self, arrow);
            return;
        }
        let outer = std::mem::take(&mut self.private_temporaries);
        walk_mut::walk_arrow_function_expression(self, arrow);
        let names = std::mem::replace(&mut self.private_temporaries, outer);
        if !names.is_empty() {
            let ast = AstBuilder::new(self.allocator);
            let expression = arrow.body.take_in(&ast).into_expression();
            let mut statements = oxc_allocator::Vec::from_array_in(
                [oxc_ast::ast::Statement::new_return_statement(
                    expression.span(),
                    Some(expression),
                    &ast,
                )],
                &ast,
            );
            self.prepend_private_temporaries(&mut statements, names);
            arrow.body = oxc_ast::ast::ArrowFunctionBody::FunctionBody(
                oxc_ast::ast::FunctionBody::boxed(arrow.span, [], statements, &ast),
            );
        }
    }

    fn visit_statements(&mut self, statements: &mut ArenaVec<'a, Statement<'a>>) {
        let mut index = 0;
        while index < statements.len() {
            let span = statements[index].span();
            let default_class = match &statements[index] {
                Statement::ExportDefaultDeclaration(declaration) => {
                    match &declaration.declaration {
                        ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                            Some((class.node_id.get(), class.span))
                        }
                        _ => None,
                    }
                }
                _ => None,
            };
            if let Some((class_id, class_span)) = default_class
                && let Some(plan) = self.direct.remove(&class_id)
            {
                let ast = AstBuilder::new(self.allocator);
                let Statement::ExportDefaultDeclaration(declaration) =
                    statements[index].take_in(&ast)
                else {
                    unreachable!();
                };
                let mut declaration = declaration.unbox();
                let ExportDefaultDeclarationKind::ClassDeclaration(class) = declaration.declaration
                else {
                    unreachable!();
                };
                let mut class = class.unbox();
                let binding = class.id.take();
                let exported_name = binding
                    .as_ref()
                    .map_or(plan.name.as_str(), |identifier| identifier.name.as_str());
                self.visit_class(&mut class);
                if self.error.is_some() {
                    return;
                }
                match lower_simple_class(
                    self.allocator,
                    class,
                    &plan,
                    &mut self.construct_assert,
                    &mut self.private_temporaries,
                ) {
                    Ok(expression) => {
                        declaration.declaration = ExportDefaultDeclarationKind::from(
                            oxc_ast::ast::Expression::new_identifier(
                                class_span,
                                self.allocator.alloc_str(exported_name),
                                ast.builder(),
                            ),
                        );
                        statements[index] = Statement::VariableDeclaration(direct_class_variable(
                            // Preserve the export statement's start so comments
                            // attached to `export default class` stay with the
                            // lowered class rather than the trailing export.
                            &ast,
                            span,
                            &plan.name,
                            VariableDeclarationKind::Let,
                            binding,
                            expression,
                        ));
                        statements.insert(
                            index + 1,
                            Statement::ExportDefaultDeclaration(oxc_allocator::Box::new_in(
                                declaration,
                                &ast,
                            )),
                        );
                        self.changed = true;
                        index += 2;
                        continue;
                    }
                    Err(error) => {
                        self.error = Some(error);
                        return;
                    }
                }
            }
            if matches!(statements[index], Statement::ClassDeclaration(_))
                && let Some(plan) = self.direct.remove(&statements[index].node_id())
            {
                let ast = AstBuilder::new(self.allocator);
                let Statement::ClassDeclaration(class) = statements[index].take_in(&ast) else {
                    unreachable!();
                };
                let mut class = class.unbox();
                let binding = class.id.take();
                self.visit_class(&mut class);
                if self.error.is_some() {
                    return;
                }
                match lower_simple_class(
                    self.allocator,
                    class,
                    &plan,
                    &mut self.construct_assert,
                    &mut self.private_temporaries,
                ) {
                    Ok(expression) => {
                        statements[index] = Statement::VariableDeclaration(direct_class_variable(
                            &ast,
                            span,
                            &plan.name,
                            VariableDeclarationKind::Let,
                            binding,
                            expression,
                        ));
                        self.changed = true;
                        index += 1;
                        continue;
                    }
                    Err(error) => {
                        self.error = Some(error);
                        return;
                    }
                }
            }
            self.visit_statement(&mut statements[index]);
            index += 1;
        }
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::ClassExpression(_))
            && let Some(plan) = self.direct.remove(&expression.node_id())
        {
            let ast = AstBuilder::new(self.allocator);
            let Expression::ClassExpression(class) = expression.take_in(&ast) else {
                unreachable!();
            };
            let mut class = class.unbox();
            self.visit_class(&mut class);
            if self.error.is_some() {
                return;
            }
            match lower_simple_class(
                self.allocator,
                class,
                &plan,
                &mut self.construct_assert,
                &mut self.private_temporaries,
            ) {
                Ok(lowered) => {
                    *expression = lowered;
                    self.changed = true;
                }
                Err(error) => self.error = Some(error),
            }
            return;
        }
        walk_mut::walk_expression(self, expression);
    }

    fn visit_export_default_declaration(&mut self, declaration: &mut ExportDefaultDeclaration<'a>) {
        let ExportDefaultDeclarationKind::ClassDeclaration(class) = &mut declaration.declaration
        else {
            walk_mut::walk_export_default_declaration(self, declaration);
            return;
        };
        let Some(plan) = self.direct.remove(&class.node_id.get()) else {
            walk_mut::walk_export_default_declaration(self, declaration);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let mut class = class.take_in(&ast);
        let binding = class.id.take();
        self.visit_class(&mut class);
        if self.error.is_some() {
            return;
        }
        match lower_simple_class(
            self.allocator,
            class,
            &plan,
            &mut self.construct_assert,
            &mut self.private_temporaries,
        ) {
            Ok(expression) => {
                let _ = binding;
                declaration.declaration = ExportDefaultDeclarationKind::from(expression);
                self.changed = true;
            }
            Err(error) => self.error = Some(error),
        }
    }

    fn visit_export_declaration(&mut self, declaration: &mut ExportDeclaration<'a>) {
        let Declaration::ClassDeclaration(class) = &mut declaration.declaration else {
            walk_mut::walk_export_declaration(self, declaration);
            return;
        };
        let span = class.span;
        let Some(plan) = self.direct.remove(&class.node_id.get()) else {
            walk_mut::walk_export_declaration(self, declaration);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let mut class = class.take_in(&ast);
        let binding = class.id.take();
        self.visit_class(&mut class);
        if self.error.is_some() {
            return;
        }
        match lower_simple_class(
            self.allocator,
            class,
            &plan,
            &mut self.construct_assert,
            &mut self.private_temporaries,
        ) {
            Ok(expression) => {
                declaration.declaration = Declaration::VariableDeclaration(direct_class_variable(
                    &ast,
                    span,
                    &plan.name,
                    VariableDeclarationKind::Let,
                    binding,
                    expression,
                ));
                self.changed = true;
            }
            Err(error) => self.error = Some(error),
        }
    }
}

fn direct_class_variable<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    name: &str,
    kind: VariableDeclarationKind,
    binding: Option<oxc_ast::ast::BindingIdentifier<'a>>,
    expression: Expression<'a>,
) -> ArenaBox<'a, VariableDeclaration<'a>> {
    let mut declarations = ArenaVec::new_in(ast);
    declarations.push(oxc_ast::ast::VariableDeclarator::new(
        span,
        binding.map_or_else(
            || {
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    span,
                    ast.allocator().alloc_str(name),
                    ast.builder(),
                )
            },
            |binding| BindingPattern::BindingIdentifier(oxc_allocator::Box::new_in(binding, ast)),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(expression),
        false,
        ast.builder(),
    ));
    oxc_ast::ast::VariableDeclaration::boxed(span, kind, declarations, false, ast.builder())
}

#[expect(clippy::too_many_arguments)]
fn lower_derived_constructor_body<'a>(
    ast: &AstBuilder<'a>,
    function: &mut Function<'a>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    super_get_name: &str,
    super_reference_name: &str,
    receiver_name: &str,
    result_name: &str,
    new_target_name: Option<&str>,
    super_call_name: Option<&str>,
    parameter_names: &[String],
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
    construct_assert: &mut bool,
) -> Result<bool, &'static str> {
    let parameters = function.params.has_parameter().then(|| {
        std::mem::replace(
            &mut function.params,
            oxc_ast::ast::FormalParameters::boxed(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::from_iter_in(
                    parameter_names.iter().map(|name| {
                        oxc_ast::ast::FormalParameter::new(
                            anchor,
                            ArenaVec::new_in(ast),
                            oxc_ast::ast::BindingPattern::new_binding_identifier(
                                anchor,
                                ast.allocator().alloc_str(name),
                                ast.builder(),
                            ),
                            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                            None::<ArenaBox<'a, Expression<'a>>>,
                            false,
                            None,
                            false,
                            false,
                            ast.builder(),
                        )
                    }),
                    ast,
                ),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
        )
    });
    let body = function
        .body
        .as_mut()
        .ok_or("classes-direct-derived-constructor-body-missing")?;
    let mut super_access_rewriter = SuperAccessRewriter {
        allocator: ast.allocator(),
        class_name: ast.allocator().alloc_str(class_name),
        get_name: ast.allocator().alloc_str(super_get_name),
        reference_name: ast.allocator().alloc_str(super_reference_name),
        is_static: false,
        receiver_name: None,
    };
    for statement in &mut body.statements {
        super_access_rewriter.visit_statement(statement);
    }
    if parameters.is_none()
        && lower_leading_super_constructor_body(
            ast,
            body,
            class_name,
            super_name,
            construct_name,
            receiver_name,
            result_name,
            new_target_name,
            anchor,
            instance_initializers,
            construct_assert,
        )?
    {
        return Ok(false);
    }
    lower_general_derived_constructor_body(
        ast,
        body,
        class_name,
        super_name,
        construct_name,
        receiver_name,
        result_name,
        new_target_name.ok_or("classes-direct-derived-new-target-name-missing")?,
        super_call_name.ok_or("classes-direct-derived-super-call-name-missing")?,
        anchor,
        instance_initializers,
        parameters,
        construct_assert,
    )?;
    Ok(false)
}

struct SuperCallCounter {
    count: usize,
}

struct ConstructorShapeDetector {
    super_calls: usize,
    new_target: bool,
}

impl<'a> Visit<'a> for ConstructorShapeDetector {
    fn visit_call_expression(&mut self, call: &oxc_ast::ast::CallExpression<'a>) {
        if matches!(call.callee, Expression::Super(_)) {
            self.super_calls += 1;
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_expression(&mut self, expression: &Expression<'a>) {
        if matches!(expression, Expression::NewTarget(_)) {
            self.new_target = true;
        } else {
            walk::walk_expression(self, expression);
        }
    }

    fn visit_function(&mut self, _function: &Function<'a>, _flags: ScopeFlags) {}

    fn visit_class(&mut self, _class: &Class<'a>) {}
}

fn contains_new_target(body: &oxc_ast::ast::FunctionBody<'_>) -> bool {
    let mut detector = ConstructorShapeDetector {
        super_calls: 0,
        new_target: false,
    };
    detector.visit_function_body(body);
    detector.new_target
}

fn rewrite_chain_element<'a>(
    allocator: &'a Allocator,
    element: &mut ChainElement<'a>,
    visit: impl FnOnce(&mut Expression<'a>),
) {
    let ast = AstBuilder::new(allocator);
    let mut expression = match element.take_in(&ast) {
        ChainElement::CallExpression(call) => Expression::CallExpression(call),
        ChainElement::TSNonNullExpression(expr) => Expression::TSNonNullExpression(expr),
        other => Expression::from(other.into_member_expression()),
    };
    visit(&mut expression);
    *element = match expression {
        Expression::CallExpression(call) => ChainElement::CallExpression(call),
        Expression::TSNonNullExpression(expr) => ChainElement::TSNonNullExpression(expr),
        other => ChainElement::from(other.into_member_expression()),
    };
}

fn statement_is_leading_super(statement: &Statement<'_>) -> bool {
    let expression = match statement {
        Statement::ExpressionStatement(statement) => Some(&statement.expression),
        Statement::ReturnStatement(statement) => statement.argument.as_ref(),
        _ => None,
    };
    match expression {
        Some(Expression::CallExpression(call)) => matches!(call.callee, Expression::Super(_)),
        Some(Expression::SequenceExpression(sequence)) => {
            sequence.expressions.first().is_some_and(|expression| {
                matches!(
                    expression,
                    Expression::CallExpression(call) if matches!(call.callee, Expression::Super(_))
                )
            })
        }
        _ => false,
    }
}

fn has_single_leading_super(body: &oxc_ast::ast::FunctionBody<'_>) -> bool {
    let mut detector = ConstructorShapeDetector {
        super_calls: 0,
        new_target: false,
    };
    detector.visit_function_body(body);
    detector.super_calls == 1 && body.statements.iter().any(statement_is_leading_super)
}

impl<'a> VisitMut<'a> for SuperCallCounter {
    fn visit_call_expression(&mut self, call: &mut oxc_ast::ast::CallExpression<'a>) {
        if matches!(call.callee, Expression::Super(_)) {
            self.count += 1;
        }
        walk_mut::walk_call_expression(self, call);
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}

    fn visit_class(&mut self, _class: &mut Class<'a>) {}
}

#[expect(clippy::too_many_arguments)]
fn lower_leading_super_constructor_body<'a>(
    ast: &AstBuilder<'a>,
    body: &mut oxc_ast::ast::FunctionBody<'a>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    receiver_name: &str,
    result_name: &str,
    new_target_name: Option<&str>,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
    construct_assert: &mut bool,
) -> Result<bool, &'static str> {
    let mut counter = SuperCallCounter { count: 0 };
    for statement in &mut body.statements {
        counter.visit_statement(statement);
    }
    if counter.count != 1 {
        return Ok(false);
    }
    let Some(index) = body.statements.iter().position(statement_is_leading_super) else {
        return Ok(false);
    };
    if let Some(new_target_name) = new_target_name {
        let mut rewriter = NewTargetRewriter {
            allocator: ast.allocator(),
            name: ast.allocator().alloc_str(new_target_name),
        };
        for statement in &mut body.statements {
            rewriter.visit_statement(statement);
        }
    }
    let leading = body.statements.remove(index);
    let (call, mut tail, returns) = match leading {
        Statement::ExpressionStatement(statement) => {
            split_leading_super_expression(ast, statement.unbox().expression, false)?
        }
        Statement::ReturnStatement(statement) => {
            let statement = statement.unbox();
            split_leading_super_expression(
                ast,
                statement
                    .argument
                    .ok_or("classes-direct-leading-super-return-missing")?,
                true,
            )?
        }
        _ => unreachable!(),
    };
    let mut after = body.statements.split_off(index);
    let mut rewritten = ArenaVec::new_in(ast);
    let mut leading_this_rewriter = DerivedThisRewriter {
        allocator: ast.allocator(),
        receiver_name: ast.allocator().alloc_str(receiver_name),
        construct_name: ast.allocator().alloc_str(construct_name),
        used: false,
    };
    for statement in &mut body.statements {
        leading_this_rewriter.visit_statement(statement);
    }
    *construct_assert |= leading_this_rewriter.used;
    rewritten.append(&mut body.statements);
    if let Some(new_target_name) = new_target_name {
        rewritten.push(Statement::VariableDeclaration(direct_class_variable(
            ast,
            anchor,
            new_target_name,
            VariableDeclarationKind::Var,
            None,
            oxc_ast::ast::Expression::new_new_target(anchor, ast.builder()),
        )));
    }
    rewritten.push(Statement::VariableDeclaration(
        oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Var,
            ArenaVec::from_iter_in(
                [oxc_ast::ast::VariableDeclarator::new(
                    anchor,
                    oxc_ast::ast::BindingPattern::new_binding_identifier(
                        anchor,
                        ast.allocator().alloc_str(receiver_name),
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(super_construct_expression(
                        ast,
                        call,
                        class_name,
                        super_name,
                        construct_name,
                        new_target_name,
                    )),
                    false,
                    ast.builder(),
                )],
                ast,
            ),
            false,
            ast.builder(),
        ),
    ));
    if !instance_initializers.is_empty() {
        rewritten.push(function_receiver_call_statement(
            ast,
            anchor,
            std::mem::replace(instance_initializers, ArenaVec::new_in(ast)),
            receiver_name,
            "call",
        ));
    }
    let mut continuation = ArenaVec::new_in(ast);
    if returns {
        if tail.is_empty() {
            continuation.push(oxc_ast::ast::Statement::new_return_statement(
                anchor,
                Some(oxc_ast::ast::Expression::new_this_expression(
                    anchor,
                    ast.builder(),
                )),
                ast.builder(),
            ));
        } else {
            continuation.push(oxc_ast::ast::Statement::new_return_statement(
                anchor,
                Some(if tail.len() == 1 {
                    tail.pop().unwrap()
                } else {
                    oxc_ast::ast::Expression::new_sequence_expression(anchor, tail, ast.builder())
                }),
                ast.builder(),
            ));
        }
    } else if !tail.is_empty() {
        continuation.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            if tail.len() == 1 {
                tail.pop().unwrap()
            } else {
                oxc_ast::ast::Expression::new_sequence_expression(anchor, tail, ast.builder())
            },
            ast.builder(),
        ));
    }
    continuation.append(&mut after);
    let result_name = ast.allocator().alloc_str(result_name);
    rewritten.push(Statement::VariableDeclaration(
        oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Var,
            ArenaVec::from_iter_in(
                [oxc_ast::ast::VariableDeclarator::new(
                    anchor,
                    oxc_ast::ast::BindingPattern::new_binding_identifier(
                        anchor,
                        result_name,
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    Some(function_receiver_call_expression(
                        ast,
                        anchor,
                        continuation,
                        receiver_name,
                        "apply",
                        true,
                    )),
                    false,
                    ast.builder(),
                )],
                ast,
            ),
            false,
            ast.builder(),
        ),
    ));
    rewritten.push(possible_constructor_return_statement(
        ast,
        anchor,
        result_name,
    ));
    rewritten.push(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(receiver_name),
            ast.builder(),
        )),
        ast.builder(),
    ));
    body.statements = rewritten;
    Ok(true)
}

#[expect(clippy::too_many_arguments)]
fn lower_general_derived_constructor_body<'a>(
    ast: &AstBuilder<'a>,
    body: &mut oxc_ast::ast::FunctionBody<'a>,
    class_name: &str,
    _super_name: &str,
    construct_name: &str,
    receiver_name: &str,
    result_name: &str,
    new_target_name: &str,
    super_call_name: &str,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
    mut parameters: Option<ArenaBox<'a, FormalParameters<'a>>>,
    construct_assert: &mut bool,
) -> Result<(), &'static str> {
    let mut contents = std::mem::replace(&mut body.statements, ArenaVec::new_in(ast));
    let mut super_rewriter = SuperThunkCallRewriter {
        allocator: ast.allocator(),
        name: ast.allocator().alloc_str(super_call_name),
    };
    let mut this_rewriter = DerivedThisRewriter {
        allocator: ast.allocator(),
        receiver_name: ast.allocator().alloc_str(receiver_name),
        construct_name: ast.allocator().alloc_str(construct_name),
        used: false,
    };
    let mut new_target_rewriter = NewTargetRewriter {
        allocator: ast.allocator(),
        name: ast.allocator().alloc_str(new_target_name),
    };
    if let Some(parameters) = parameters.as_mut() {
        super_rewriter.visit_formal_parameters(parameters);
        this_rewriter.visit_formal_parameters(parameters);
        new_target_rewriter.visit_formal_parameters(parameters);
    }
    for statement in &mut contents {
        super_rewriter.visit_statement(statement);
        this_rewriter.visit_statement(statement);
        new_target_rewriter.visit_statement(statement);
    }
    *construct_assert |= this_rewriter.used;

    let mut declarations = ArenaVec::new_in(ast);
    declarations.push(oxc_ast::ast::VariableDeclarator::new(
        anchor,
        oxc_ast::ast::BindingPattern::new_binding_identifier(
            anchor,
            ast.allocator().alloc_str(receiver_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        None::<Expression<'a>>,
        false,
        ast.builder(),
    ));
    declarations.push(oxc_ast::ast::VariableDeclarator::new(
        anchor,
        oxc_ast::ast::BindingPattern::new_binding_identifier(
            anchor,
            ast.allocator().alloc_str(new_target_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::Expression::new_new_target(
            anchor,
            ast.builder(),
        )),
        false,
        ast.builder(),
    ));
    body.statements.push(Statement::VariableDeclaration(
        oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Var,
            declarations,
            false,
            ast.builder(),
        ),
    ));

    let mut construct_arguments = ArenaVec::new_in(ast);
    construct_arguments.push(Argument::from(super_constructor(ast, class_name, anchor)));
    construct_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        "arguments",
        ast.builder(),
    )));
    construct_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_logical_expression(
            anchor,
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(new_target_name),
                ast.builder(),
            ),
            oxc_syntax::operator::LogicalOperator::Or,
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(class_name),
                ast.builder(),
            ),
            ast.builder(),
        ),
    ));
    let construct = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(construct_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        construct_arguments,
        false,
        ast.builder(),
    );
    let assignment = oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                anchor,
                ast.allocator().alloc_str(receiver_name),
                ast.builder(),
            )
            .into(),
            construct,
            ast.builder(),
        ),
        ast.builder(),
    );
    let mut thunk_statements = ArenaVec::new_in(ast);
    thunk_statements.push(assignment);
    if !instance_initializers.is_empty() {
        thunk_statements.push(function_receiver_call_statement(
            ast,
            anchor,
            std::mem::replace(instance_initializers, ArenaVec::new_in(ast)),
            receiver_name,
            "call",
        ));
    }
    thunk_statements.push(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(receiver_name),
            ast.builder(),
        )),
        ast.builder(),
    ));
    body.statements.push(Statement::FunctionDeclaration(
        oxc_ast::ast::Function::boxed(
            anchor,
            FunctionType::FunctionDeclaration,
            Some(oxc_ast::ast::BindingIdentifier::new(
                anchor,
                ast.allocator().alloc_str(super_call_name),
                ast.builder(),
            )),
            false,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(oxc_ast::ast::FunctionBody::boxed(
                anchor,
                ArenaVec::new_in(ast),
                thunk_statements,
                ast.builder(),
            )),
            ast.builder(),
        ),
    ));

    let mut wrapper = oxc_ast::ast::Expression::new_function_expression(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        parameters.unwrap_or_else(|| {
            oxc_ast::ast::FormalParameters::boxed(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            )
        }),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            contents,
            ast.builder(),
        )),
        ast.builder(),
    );
    if let Expression::FunctionExpression(function) = &mut wrapper {
        function.pife = true;
    }
    let apply = Expression::from(
        oxc_ast::ast::MemberExpression::new_static_member_expression(
            anchor,
            oxc_ast::ast::Expression::new_parenthesized_expression(anchor, wrapper, ast.builder()),
            oxc_ast::ast::IdentifierName::new(anchor, "apply", ast.builder()),
            false,
            ast.builder(),
        ),
    );
    let mut apply_arguments = ArenaVec::new_in(ast);
    apply_arguments.push(Argument::from(super::void_zero(ast, anchor)));
    apply_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        "arguments",
        ast.builder(),
    )));
    let result = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        apply,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        apply_arguments,
        false,
        ast.builder(),
    );
    body.statements
        .push(Statement::VariableDeclaration(direct_class_variable(
            ast,
            anchor,
            result_name,
            VariableDeclarationKind::Var,
            None,
            result,
        )));
    body.statements.push(possible_constructor_return_statement(
        ast,
        anchor,
        result_name,
    ));

    let undefined = super::void_zero(ast, anchor);
    let mut error_arguments = ArenaVec::new_in(ast);
    error_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(
            anchor,
            "this hasn't been initialised - super() hasn't been called",
            None,
            ast.builder(),
        ),
    ));
    body.statements
        .push(oxc_ast::ast::Statement::new_if_statement(
            anchor,
            oxc_ast::ast::Expression::new_binary_expression(
                anchor,
                oxc_ast::ast::Expression::new_identifier(
                    anchor,
                    ast.allocator().alloc_str(receiver_name),
                    ast.builder(),
                ),
                oxc_syntax::operator::BinaryOperator::StrictEquality,
                undefined,
                ast.builder(),
            ),
            oxc_ast::ast::Statement::new_throw_statement(
                anchor,
                oxc_ast::ast::Expression::new_new_expression(
                    anchor,
                    oxc_ast::ast::Expression::new_identifier(
                        anchor,
                        "ReferenceError",
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                    error_arguments,
                    ast.builder(),
                ),
                ast.builder(),
            ),
            None,
            ast.builder(),
        ));
    body.statements
        .push(oxc_ast::ast::Statement::new_return_statement(
            anchor,
            Some(oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(receiver_name),
                ast.builder(),
            )),
            ast.builder(),
        ));
    Ok(())
}

fn split_leading_super_expression<'a>(
    ast: &AstBuilder<'a>,
    expression: Expression<'a>,
    returns: bool,
) -> Result<
    (
        ArenaBox<'a, oxc_ast::ast::CallExpression<'a>>,
        ArenaVec<'a, Expression<'a>>,
        bool,
    ),
    &'static str,
> {
    match expression {
        Expression::CallExpression(call) if matches!(call.callee, Expression::Super(_)) => {
            Ok((call, ArenaVec::new_in(ast), returns))
        }
        Expression::SequenceExpression(sequence) => {
            let mut sequence = sequence.unbox();
            if sequence.expressions.is_empty() {
                return Err("classes-direct-leading-super-sequence-empty");
            }
            let head = sequence.expressions.remove(0);
            let Expression::CallExpression(call) = head else {
                return Err("classes-direct-leading-super-sequence-head-mismatch");
            };
            if !matches!(call.callee, Expression::Super(_)) {
                return Err("classes-direct-leading-super-sequence-head-mismatch");
            }
            Ok((call, sequence.expressions, returns))
        }
        _ => Err("classes-direct-leading-super-expression-mismatch"),
    }
}

fn super_constructor<'a>(ast: &AstBuilder<'a>, class_name: &str, span: Span) -> Expression<'a> {
    oxc_ast::ast::Expression::new_call_expression(
        span,
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                span,
                oxc_ast::ast::Expression::new_identifier(span, "Object", ast.builder()),
                oxc_ast::ast::IdentifierName::new(span, "getPrototypeOf", ast.builder()),
                false,
                ast.builder(),
            ),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        oxc_allocator::Vec::from_array_in(
            [Argument::from(oxc_ast::ast::Expression::new_identifier(
                span,
                ast.allocator().alloc_str(class_name),
                ast.builder(),
            ))],
            ast.builder(),
        ),
        false,
        ast.builder(),
    )
}

fn super_construct_expression<'a>(
    ast: &AstBuilder<'a>,
    mut call: ArenaBox<'a, oxc_ast::ast::CallExpression<'a>>,
    class_name: &str,
    _super_name: &str,
    construct_name: &str,
    new_target_name: Option<&str>,
) -> Expression<'a> {
    let span = call.span;
    let mut elements = ArenaVec::with_capacity_in(call.arguments.len(), ast);
    for argument in call.arguments.drain(..) {
        elements.push(ArrayExpressionElement::from(argument));
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(super_constructor(ast, class_name, span)));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_array_expression(span, elements, ast.builder()),
    ));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_logical_expression(
            span,
            new_target_name.map_or_else(
                || oxc_ast::ast::Expression::new_new_target(span, ast.builder()),
                |name| {
                    oxc_ast::ast::Expression::new_identifier(
                        span,
                        ast.allocator().alloc_str(name),
                        ast.builder(),
                    )
                },
            ),
            oxc_syntax::operator::LogicalOperator::Or,
            oxc_ast::ast::Expression::new_identifier(
                span,
                ast.allocator().alloc_str(class_name),
                ast.builder(),
            ),
            ast.builder(),
        ),
    ));
    oxc_ast::ast::Expression::new_call_expression(
        span,
        oxc_ast::ast::Expression::new_identifier(
            span,
            ast.allocator().alloc_str(construct_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
        ast.builder(),
    )
}

fn function_receiver_call_expression<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    statements: ArenaVec<'a, Statement<'a>>,
    receiver_name: &str,
    method: &str,
    pass_arguments: bool,
) -> Expression<'a> {
    let mut function = oxc_ast::ast::Expression::new_function_expression(
        span,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            span,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            span,
            ArenaVec::new_in(ast),
            statements,
            ast.builder(),
        )),
        ast.builder(),
    );
    if let Expression::FunctionExpression(function) = &mut function {
        function.pife = true;
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        span,
        ast.allocator().alloc_str(receiver_name),
        ast.builder(),
    )));
    if pass_arguments {
        arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
            span,
            "arguments",
            ast.builder(),
        )));
    }
    oxc_ast::ast::Expression::new_call_expression(
        span,
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                span,
                oxc_ast::ast::Expression::new_parenthesized_expression(
                    span,
                    function,
                    ast.builder(),
                ),
                oxc_ast::ast::IdentifierName::new(
                    span,
                    ast.allocator().alloc_str(method),
                    ast.builder(),
                ),
                false,
                ast.builder(),
            ),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
        ast.builder(),
    )
}

fn function_receiver_call_statement<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    statements: ArenaVec<'a, Statement<'a>>,
    receiver_name: &str,
    method: &str,
) -> Statement<'a> {
    oxc_ast::ast::Statement::new_expression_statement(
        span,
        function_receiver_call_expression(ast, span, statements, receiver_name, method, false),
        ast.builder(),
    )
}

fn possible_constructor_return_statement<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    result_name: &str,
) -> Statement<'a> {
    let result = || {
        oxc_ast::ast::Expression::new_identifier(
            span,
            ast.allocator().alloc_str(result_name),
            ast.builder(),
        )
    };
    let undefined = super::void_zero(ast, span);
    let test = oxc_ast::ast::Expression::new_binary_expression(
        span,
        result(),
        oxc_syntax::operator::BinaryOperator::StrictInequality,
        undefined,
        ast.builder(),
    );
    let object = oxc_ast::ast::Expression::new_logical_expression(
        span,
        oxc_ast::ast::Expression::new_logical_expression(
            span,
            oxc_ast::ast::Expression::new_binary_expression(
                span,
                oxc_ast::ast::Expression::new_unary_expression(
                    span,
                    oxc_syntax::operator::UnaryOperator::Typeof,
                    result(),
                    ast.builder(),
                ),
                oxc_syntax::operator::BinaryOperator::StrictEquality,
                oxc_ast::ast::Expression::new_string_literal(span, "object", None, ast.builder()),
                ast.builder(),
            ),
            oxc_syntax::operator::LogicalOperator::And,
            oxc_ast::ast::Expression::new_binary_expression(
                span,
                result(),
                oxc_syntax::operator::BinaryOperator::StrictInequality,
                oxc_ast::ast::Expression::new_null_literal(span, ast.builder()),
                ast.builder(),
            ),
            ast.builder(),
        ),
        oxc_syntax::operator::LogicalOperator::Or,
        oxc_ast::ast::Expression::new_binary_expression(
            span,
            oxc_ast::ast::Expression::new_unary_expression(
                span,
                oxc_syntax::operator::UnaryOperator::Typeof,
                result(),
                ast.builder(),
            ),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            oxc_ast::ast::Expression::new_string_literal(span, "function", None, ast.builder()),
            ast.builder(),
        ),
        ast.builder(),
    );
    let valid = oxc_ast::ast::Statement::new_if_statement(
        span,
        object,
        oxc_ast::ast::Statement::new_return_statement(span, Some(result()), ast.builder()),
        None,
        ast.builder(),
    );
    let mut error_arguments = ArenaVec::new_in(ast);
    error_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(
            span,
            "Derived constructors may only return object or undefined",
            None,
            ast.builder(),
        ),
    ));
    let invalid = oxc_ast::ast::Statement::new_throw_statement(
        span,
        oxc_ast::ast::Expression::new_new_expression(
            span,
            oxc_ast::ast::Expression::new_identifier(span, "TypeError", ast.builder()),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            error_arguments,
            ast.builder(),
        ),
        ast.builder(),
    );
    oxc_ast::ast::Statement::new_if_statement(
        span,
        test,
        oxc_ast::ast::Statement::new_block_statement(
            span,
            oxc_allocator::Vec::from_array_in([valid, invalid], ast.builder()),
            ast.builder(),
        ),
        None,
        ast.builder(),
    )
}

struct NewTargetRewriter<'a> {
    allocator: &'a Allocator,
    name: &'a str,
}

impl<'a> VisitMut<'a> for NewTargetRewriter<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::NewTarget(_)) {
            *expression = oxc_ast::ast::Expression::new_identifier(
                expression.span(),
                self.name,
                &AstBuilder::new(self.allocator),
            );
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct SuperThunkCallRewriter<'a> {
    allocator: &'a Allocator,
    name: &'a str,
}

impl<'a> VisitMut<'a> for SuperThunkCallRewriter<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if let Expression::CallExpression(call) = expression
            && matches!(call.callee, Expression::Super(_))
        {
            call.callee = oxc_ast::ast::Expression::new_identifier(
                call.span,
                self.name,
                &AstBuilder::new(self.allocator),
            );
            for argument in &mut call.arguments {
                self.visit_argument(argument);
            }
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct DerivedThisRewriter<'a> {
    allocator: &'a Allocator,
    receiver_name: &'a str,
    construct_name: &'a str,
    used: bool,
}

impl<'a> VisitMut<'a> for DerivedThisRewriter<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::ThisExpression(_)) {
            self.used = true;
            let ast = AstBuilder::new(self.allocator);
            let span = expression.span();
            *expression = oxc_ast::ast::Expression::new_call_expression(
                span,
                Expression::from(
                    oxc_ast::ast::MemberExpression::new_static_member_expression(
                        span,
                        oxc_ast::ast::Expression::new_identifier(
                            span,
                            self.construct_name,
                            ast.builder(),
                        ),
                        oxc_ast::ast::IdentifierName::new(span, "assert", ast.builder()),
                        false,
                        ast.builder(),
                    ),
                ),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                oxc_allocator::Vec::from_array_in(
                    [Argument::from(oxc_ast::ast::Expression::new_identifier(
                        span,
                        self.receiver_name,
                        ast.builder(),
                    ))],
                    ast.builder(),
                ),
                false,
                ast.builder(),
            );
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_class(&mut self, class: &mut Class<'a>) {
        if let Some(super_class) = class
            .heritage
            .as_mut()
            .map(|heritage| &mut heritage.expression)
        {
            self.visit_expression(super_class);
        }
        for element in &mut class.body.body {
            match element {
                ClassElement::MethodDefinition(method) if method.computed => {
                    self.visit_property_key(&mut method.key)
                }
                ClassElement::PropertyDefinition(property) if property.computed => {
                    self.visit_property_key(&mut property.key)
                }
                ClassElement::AccessorProperty(accessor) if accessor.computed => {
                    self.visit_property_key(&mut accessor.key)
                }
                _ => {}
            }
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct StaticInitializerThisRewriter<'a> {
    allocator: &'a Allocator,
    class_name: &'a str,
}

impl<'a> VisitMut<'a> for StaticInitializerThisRewriter<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::ThisExpression(_)) {
            *expression = oxc_ast::ast::Expression::new_identifier(
                expression.span(),
                self.class_name,
                &AstBuilder::new(self.allocator),
            );
        } else if matches!(expression, Expression::NewTarget(_)) {
            let span = expression.span();
            *expression = super::void_zero(&AstBuilder::new(self.allocator), span);
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct PrivateLooseRewriter<'a, 'p> {
    allocator: &'a Allocator,
    keys: &'p FxHashMap<String, (String, String)>,
    base_name: &'a str,
    check_in_rhs_name: &'a str,
}

impl<'a> PrivateLooseRewriter<'a, '_> {
    fn key(&self, name: &str) -> Option<&str> {
        self.keys.get(name).map(|key| key.0.as_str())
    }

    fn checked_object(
        &self,
        span: Span,
        object: Expression<'a>,
        key_name: &str,
        optional: bool,
    ) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(object));
        arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
            span,
            self.allocator.alloc_str(key_name),
            ast.builder(),
        )));
        if optional {
            arguments.push(Argument::from(
                oxc_ast::ast::Expression::new_boolean_literal(span, true, ast.builder()),
            ));
        }
        oxc_ast::ast::Expression::new_call_expression(
            span,
            oxc_ast::ast::Expression::new_identifier(span, self.base_name, ast.builder()),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
            ast.builder(),
        )
    }
}

impl<'a> VisitMut<'a> for PrivateLooseRewriter<'a, '_> {
    fn visit_class(&mut self, class: &mut Class<'a>) {
        if let Some(heritage) = class
            .heritage
            .as_mut()
            .map(|heritage| &mut heritage.expression)
        {
            self.visit_expression(heritage);
        }
        let mut keys = self.keys.clone();
        for element in &class.body.body {
            if let Some(PropertyKey::PrivateIdentifier(identifier)) = element.property_key() {
                keys.remove(identifier.name.as_str());
            }
        }
        PrivateLooseRewriter {
            allocator: self.allocator,
            keys: &keys,
            base_name: self.base_name,
            check_in_rhs_name: self.check_in_rhs_name,
        }
        .visit_class_body(&mut class.body);
    }

    fn visit_chain_element(&mut self, element: &mut ChainElement<'a>) {
        rewrite_chain_element(self.allocator, element, |expression| {
            self.visit_expression(expression);
        });
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let ast = AstBuilder::new(self.allocator);
        match expression {
            Expression::PrivateFieldExpression(field) => {
                self.visit_expression(&mut field.object);
                let Some(key) = self.key(field.field.name.as_str()) else {
                    return;
                };
                let object = field.object.take_in(&ast);
                *expression = Expression::from(
                    oxc_ast::ast::MemberExpression::new_computed_member_expression(
                        field.span,
                        self.checked_object(field.span, object, key, field.optional),
                        oxc_ast::ast::Expression::new_identifier(
                            field.field.span,
                            self.allocator.alloc_str(key),
                            ast.builder(),
                        ),
                        field.optional,
                        ast.builder(),
                    ),
                );
            }
            Expression::PrivateInExpression(private_in) => {
                self.visit_expression(&mut private_in.right);
                let Some(key) = self.key(private_in.left.name.as_str()) else {
                    return;
                };
                let mut arguments = ArenaVec::new_in(&ast);
                let mut check_arguments = ArenaVec::new_in(&ast);
                check_arguments.push(Argument::from(private_in.right.take_in(&ast)));
                arguments.push(Argument::from(
                    oxc_ast::ast::Expression::new_call_expression(
                        private_in.span,
                        oxc_ast::ast::Expression::new_identifier(
                            private_in.span,
                            self.check_in_rhs_name,
                            ast.builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                        check_arguments,
                        false,
                        ast.builder(),
                    ),
                ));
                arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
                    private_in.left.span,
                    self.allocator.alloc_str(key),
                    ast.builder(),
                )));
                *expression = oxc_ast::ast::Expression::new_call_expression(
                    private_in.span,
                    Expression::from(oxc_ast::ast::MemberExpression::new_static_member_expression(
                        private_in.span,
                        Expression::from(oxc_ast::ast::MemberExpression::new_static_member_expression(
                            private_in.span,
                            Expression::from(oxc_ast::ast::MemberExpression::new_static_member_expression(
                                private_in.span,
                                oxc_ast::ast::Expression::new_identifier(private_in.span, "Object", ast.builder()),
                                oxc_ast::ast::IdentifierName::new(private_in.span, "prototype", ast.builder()),
                                false, ast.builder())),
                            oxc_ast::ast::IdentifierName::new(private_in.span, "hasOwnProperty", ast.builder()),
                            false, ast.builder())),
                        oxc_ast::ast::IdentifierName::new(private_in.span, "call", ast.builder()),
                        false, ast.builder())),
                    None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                    arguments,
                    false, ast.builder());
            }
            _ => walk_mut::walk_expression(self, expression),
        }
    }

    fn visit_assignment_target(&mut self, target: &mut AssignmentTarget<'a>) {
        if let AssignmentTarget::PrivateFieldExpression(field) = target {
            self.visit_expression(&mut field.object);
            let Some(key) = self.key(field.field.name.as_str()) else {
                return;
            };
            let ast = AstBuilder::new(self.allocator);
            let object = field.object.take_in(&ast);
            *target = AssignmentTarget::ComputedMemberExpression(
                oxc_ast::ast::ComputedMemberExpression::boxed(
                    field.span,
                    self.checked_object(field.span, object, key, field.optional),
                    oxc_ast::ast::Expression::new_identifier(
                        field.field.span,
                        self.allocator.alloc_str(key),
                        ast.builder(),
                    ),
                    false,
                    ast.builder(),
                ),
            );
        } else {
            walk_mut::walk_assignment_target(self, target);
        }
    }

    fn visit_simple_assignment_target(&mut self, target: &mut SimpleAssignmentTarget<'a>) {
        if let SimpleAssignmentTarget::PrivateFieldExpression(field) = target {
            self.visit_expression(&mut field.object);
            let Some(key) = self.key(field.field.name.as_str()) else {
                return;
            };
            let ast = AstBuilder::new(self.allocator);
            let object = field.object.take_in(&ast);
            *target = SimpleAssignmentTarget::ComputedMemberExpression(
                oxc_ast::ast::ComputedMemberExpression::boxed(
                    field.span,
                    self.checked_object(field.span, object, key, field.optional),
                    oxc_ast::ast::Expression::new_identifier(
                        field.field.span,
                        self.allocator.alloc_str(key),
                        ast.builder(),
                    ),
                    false,
                    ast.builder(),
                ),
            );
        } else {
            walk_mut::walk_simple_assignment_target(self, target);
        }
    }
}

// Match the rewriter's distinction between ordinary writes, reads, and
// assignable references. Compound/update/pattern targets use the accessor
// adapter, while a direct `=` only needs Babel's set helper.
#[derive(Default)]
struct SuperHelperUsage {
    read: bool,
    write: bool,
    accessor: bool,
}
impl<'a> Visit<'a> for SuperHelperUsage {
    fn visit_method_definition(&mut self, method: &oxc_ast::ast::MethodDefinition<'a>) {
        if method.computed {
            self.visit_property_key(&method.key);
        }
        self.visit_formal_parameters(&method.value.params);
        if let Some(body) = &method.value.body {
            self.visit_function_body(body);
        }
    }
    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}

    fn visit_expression(&mut self, expression: &Expression<'a>) {
        if let Expression::AssignmentExpression(assignment) = expression
            && assignment.operator.is_assign()
        {
            match &assignment.left {
                AssignmentTarget::StaticMemberExpression(member)
                    if matches!(member.object, Expression::Super(_)) =>
                {
                    self.write = true;
                    self.visit_expression(&assignment.right);
                    return;
                }
                AssignmentTarget::ComputedMemberExpression(member)
                    if matches!(member.object, Expression::Super(_)) =>
                {
                    self.write = true;
                    self.visit_expression(&member.expression);
                    self.visit_expression(&assignment.right);
                    return;
                }
                _ => {}
            }
        }
        self.read |= match expression {
            Expression::StaticMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            Expression::ComputedMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            _ => false,
        };
        walk::walk_expression(self, expression);
    }
    fn visit_assignment_target(&mut self, target: &AssignmentTarget<'a>) {
        let reference = match target {
            AssignmentTarget::StaticMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            AssignmentTarget::ComputedMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            _ => false,
        };
        self.read |= reference;
        self.write |= reference;
        self.accessor |= reference;
        walk::walk_assignment_target(self, target);
    }
    fn visit_simple_assignment_target(&mut self, target: &SimpleAssignmentTarget<'a>) {
        let reference = match target {
            SimpleAssignmentTarget::StaticMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            SimpleAssignmentTarget::ComputedMemberExpression(member) => {
                matches!(member.object, Expression::Super(_))
            }
            _ => false,
        };
        self.read |= reference;
        self.write |= reference;
        self.accessor |= reference;
        walk::walk_simple_assignment_target(self, target);
    }
    fn visit_class(&mut self, class: &Class<'a>) {
        // Heritage and computed keys use the surrounding super environment;
        // the nested class body owns its own methods and initializers.
        if let Some(super_class) = class.heritage.as_ref().map(|heritage| &heritage.expression) {
            self.visit_expression(super_class);
        }
        for element in &class.body.body {
            if element.computed()
                && let Some(key) = element.property_key()
            {
                self.visit_property_key(key);
            }
        }
    }
}

struct SuperAccessRewriter<'a> {
    allocator: &'a Allocator,
    class_name: &'a str,
    get_name: &'a str,
    reference_name: &'a str,
    is_static: bool,
    receiver_name: Option<&'a str>,
}

impl<'a> SuperAccessRewriter<'a> {
    fn receiver(&self, span: Span) -> Expression<'a> {
        self.receiver_name.map_or_else(
            || {
                oxc_ast::ast::Expression::new_this_expression(
                    span,
                    &AstBuilder::new(self.allocator),
                )
            },
            |name| {
                oxc_ast::ast::Expression::new_identifier(
                    span,
                    name,
                    &AstBuilder::new(self.allocator),
                )
            },
        )
    }

    fn take_key(&self, expression: &mut Expression<'a>) -> Option<(Span, Expression<'a>)> {
        let ast = AstBuilder::new(self.allocator);
        match expression {
            Expression::ParenthesizedExpression(parenthesized) => {
                self.take_key(&mut parenthesized.expression)
            }
            Expression::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((
                    member.span,
                    oxc_ast::ast::Expression::new_string_literal(
                        member.property.span,
                        member.property.name,
                        None,
                        ast.builder(),
                    ),
                ))
            }
            Expression::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((member.span, member.expression.take_in(&ast)))
            }
            _ => None,
        }
    }

    fn get(&self, span: Span, key: Expression<'a>) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let target = if self.is_static {
            oxc_ast::ast::Expression::new_identifier(span, self.class_name, ast.builder())
        } else {
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    oxc_ast::ast::Expression::new_identifier(span, self.class_name, ast.builder()),
                    oxc_ast::ast::IdentifierName::new(span, "prototype", ast.builder()),
                    false,
                    ast.builder(),
                ),
            )
        };
        let mut prototype_arguments = ArenaVec::new_in(&ast);
        prototype_arguments.push(Argument::from(target));
        let prototype = oxc_ast::ast::Expression::new_call_expression(
            span,
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    oxc_ast::ast::Expression::new_identifier(span, "Object", ast.builder()),
                    oxc_ast::ast::IdentifierName::new(span, "getPrototypeOf", ast.builder()),
                    false,
                    ast.builder(),
                ),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            prototype_arguments,
            false,
            ast.builder(),
        );
        let mut get_arguments = ArenaVec::new_in(&ast);
        get_arguments.push(Argument::from(prototype));
        get_arguments.push(Argument::from(key));
        get_arguments.push(Argument::from(self.receiver(span)));
        oxc_ast::ast::Expression::new_call_expression(
            span,
            oxc_ast::ast::Expression::new_identifier(span, self.get_name, ast.builder()),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            get_arguments,
            false,
            ast.builder(),
        )
    }

    fn take_assignment_key(
        &self,
        target: &mut AssignmentTarget<'a>,
    ) -> Option<(Span, Expression<'a>)> {
        let ast = AstBuilder::new(self.allocator);
        match target {
            AssignmentTarget::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((
                    member.span,
                    oxc_ast::ast::Expression::new_string_literal(
                        member.property.span,
                        member.property.name,
                        None,
                        ast.builder(),
                    ),
                ))
            }
            AssignmentTarget::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((member.span, member.expression.take_in(&ast)))
            }
            _ => None,
        }
    }

    fn take_update_key(
        &self,
        target: &mut SimpleAssignmentTarget<'a>,
    ) -> Option<(Span, Expression<'a>)> {
        let ast = AstBuilder::new(self.allocator);
        match target {
            SimpleAssignmentTarget::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((
                    member.span,
                    oxc_ast::ast::Expression::new_string_literal(
                        member.property.span,
                        member.property.name,
                        None,
                        ast.builder(),
                    ),
                ))
            }
            SimpleAssignmentTarget::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((member.span, member.expression.take_in(&ast)))
            }
            _ => None,
        }
    }

    fn reference(&self, span: Span, key: Expression<'a>) -> oxc_ast::ast::MemberExpression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let Expression::CallExpression(mut reference) = self.get(span, key) else {
            unreachable!()
        };
        reference.callee =
            oxc_ast::ast::Expression::new_identifier(span, self.reference_name, ast.builder());
        oxc_ast::ast::MemberExpression::new_static_member_expression(
            span,
            Expression::CallExpression(reference),
            oxc_ast::ast::IdentifierName::new(span, "value", ast.builder()),
            false,
            ast.builder(),
        )
    }
}

impl<'a> VisitMut<'a> for SuperAccessRewriter<'a> {
    fn visit_chain_element(&mut self, element: &mut ChainElement<'a>) {
        rewrite_chain_element(self.allocator, element, |expression| {
            self.visit_expression(expression);
        });
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if let Expression::AssignmentExpression(assignment) = expression
            && assignment.operator.is_assign()
            && let Some((span, key)) = self.take_assignment_key(&mut assignment.left)
        {
            let ast = AstBuilder::new(self.allocator);
            let Expression::CallExpression(mut call) = self.get(span, key) else {
                unreachable!()
            };
            // Capture the receiver before the RHS, including an uninitialized
            // derived receiver. Ordinary writes need no accessor allocation.
            call.callee = Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    oxc_ast::ast::Expression::new_identifier(
                        span,
                        self.reference_name,
                        ast.builder(),
                    ),
                    oxc_ast::ast::IdentifierName::new(span, "set", ast.builder()),
                    false,
                    ast.builder(),
                ),
            );
            call.arguments
                .push(Argument::from(assignment.right.take_in(&ast)));
            *expression = Expression::CallExpression(call);
            walk_mut::walk_expression(self, expression);
            return;
        }
        if let Expression::CallExpression(call) = expression
            && let Some((span, key)) = self.take_key(&mut call.callee)
        {
            let ast = AstBuilder::new(self.allocator);
            let get = self.get(span, key);
            let mut arguments = std::mem::replace(&mut call.arguments, ArenaVec::new_in(&ast));
            arguments.insert(0, Argument::from(self.receiver(span)));
            *expression = oxc_ast::ast::Expression::new_call_expression(
                call.span,
                Expression::from(
                    oxc_ast::ast::MemberExpression::new_static_member_expression(
                        span,
                        get,
                        oxc_ast::ast::IdentifierName::new(span, "call", ast.builder()),
                        call.optional,
                        ast.builder(),
                    ),
                ),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
                ast.builder(),
            );
            walk_mut::walk_expression(self, expression);
            return;
        }
        if let Some((span, key)) = self.take_key(expression) {
            *expression = self.get(span, key);
            walk_mut::walk_expression(self, expression);
            return;
        }
        walk_mut::walk_expression(self, expression);
    }

    fn visit_assignment_target(&mut self, target: &mut AssignmentTarget<'a>) {
        if let Some((span, mut key)) = self.take_assignment_key(target) {
            self.visit_expression(&mut key);
            *target = self.reference(span, key).into();
        } else {
            walk_mut::walk_assignment_target(self, target);
        }
    }

    fn visit_simple_assignment_target(&mut self, target: &mut SimpleAssignmentTarget<'a>) {
        if let Some((span, mut key)) = self.take_update_key(target) {
            self.visit_expression(&mut key);
            *target = self.reference(span, key).into();
        } else {
            walk_mut::walk_simple_assignment_target(self, target);
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct LooseFieldSuperRewriter<'a> {
    allocator: &'a Allocator,
    class_name: Option<&'a str>,
    super_name: Option<&'a str>,
    is_static: bool,
}

impl<'a> LooseFieldSuperRewriter<'a> {
    fn read_base(&self, span: Span) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let super_class = self.super_name.map_or_else(
            || {
                oxc_ast::ast::Expression::new_call_expression(
                    span,
                    Expression::from(
                        oxc_ast::ast::MemberExpression::new_static_member_expression(
                            span,
                            oxc_ast::ast::Expression::new_identifier(span, "Object", ast.builder()),
                            oxc_ast::ast::IdentifierName::new(
                                span,
                                "getPrototypeOf",
                                ast.builder(),
                            ),
                            false,
                            ast.builder(),
                        ),
                    ),
                    None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                    oxc_allocator::Vec::from_array_in(
                        [Argument::from(
                            oxc_ast::ast::Expression::new_this_expression(span, ast.builder()),
                        )],
                        ast.builder(),
                    ),
                    false,
                    ast.builder(),
                )
            },
            |super_name| oxc_ast::ast::Expression::new_identifier(span, super_name, ast.builder()),
        );
        if self.is_static {
            super_class
        } else {
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    super_class,
                    oxc_ast::ast::IdentifierName::new(span, "prototype", ast.builder()),
                    false,
                    ast.builder(),
                ),
            )
        }
    }

    fn receiver(&self, span: Span) -> Expression<'a> {
        if self.is_static {
            self.class_name.map_or_else(
                || {
                    oxc_ast::ast::Expression::new_this_expression(
                        span,
                        &AstBuilder::new(self.allocator),
                    )
                },
                |class_name| {
                    oxc_ast::ast::Expression::new_identifier(
                        span,
                        class_name,
                        &AstBuilder::new(self.allocator),
                    )
                },
            )
        } else {
            oxc_ast::ast::Expression::new_this_expression(span, &AstBuilder::new(self.allocator))
        }
    }

    fn replace_read_object(&self, expression: &mut Expression<'a>) -> bool {
        match expression {
            Expression::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.read_base(member.object.span());
                true
            }
            Expression::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.read_base(member.object.span());
                true
            }
            _ => false,
        }
    }

    fn replace_assignment_object(&self, target: &mut AssignmentTarget<'a>) {
        match target {
            AssignmentTarget::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.receiver(member.object.span());
            }
            AssignmentTarget::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.receiver(member.object.span());
            }
            _ => {}
        }
    }

    fn replace_update_object(&self, target: &mut SimpleAssignmentTarget<'a>) {
        match target {
            SimpleAssignmentTarget::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.receiver(member.object.span());
            }
            SimpleAssignmentTarget::ComputedMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                member.object = self.receiver(member.object.span());
            }
            _ => {}
        }
    }
}

impl<'a> VisitMut<'a> for LooseFieldSuperRewriter<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let ast = AstBuilder::new(self.allocator);
        if let Expression::CallExpression(call) = expression
            && self.replace_read_object(&mut call.callee)
        {
            let span = call.span;
            let callee = call.callee.take_in(&ast);
            call.callee = Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    span,
                    callee,
                    oxc_ast::ast::IdentifierName::new(span, "call", ast.builder()),
                    false,
                    ast.builder(),
                ),
            );
            call.arguments
                .insert(0, Argument::from(self.receiver(span)));
            walk_mut::walk_expression(self, expression);
            return;
        }
        if let Expression::AssignmentExpression(assignment) = expression {
            self.replace_assignment_object(&mut assignment.left);
        } else if let Expression::UpdateExpression(update) = expression {
            self.replace_update_object(&mut update.argument);
        } else {
            self.replace_read_object(expression);
        }
        walk_mut::walk_expression(self, expression);
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}

    fn visit_class(&mut self, _class: &mut Class<'a>) {}
}

struct LooseStaticFieldSuperPass<'a> {
    allocator: &'a Allocator,
}

impl<'a> VisitMut<'a> for LooseStaticFieldSuperPass<'a> {
    fn visit_class(&mut self, class: &mut Class<'a>) {
        for element in &mut class.body.body {
            if let ClassElement::PropertyDefinition(property) = element
                && property.r#static
                && let Some(value) = &mut property.value
            {
                LooseFieldSuperRewriter {
                    allocator: self.allocator,
                    class_name: None,
                    super_name: None,
                    is_static: true,
                }
                .visit_expression(value);
            }
        }
        walk_mut::walk_class(self, class);
    }
}

pub(super) fn rewrite_loose_static_field_super<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
) {
    LooseStaticFieldSuperPass { allocator }.visit_program(program);
}

fn derived_default_constructor<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    _super_name: &str,
    construct_name: &str,
    receiver_name: &str,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
) -> ArenaBox<'a, Function<'a>> {
    let parameters = oxc_ast::ast::FormalParameters::boxed(
        anchor,
        FormalParameterKind::FormalParameter,
        ArenaVec::new_in(ast),
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ast.builder(),
    );
    let mut construct_arguments = ArenaVec::new_in(ast);
    construct_arguments.push(Argument::from(super_constructor(ast, class_name, anchor)));
    construct_arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        "arguments",
        ast.builder(),
    )));
    construct_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_logical_expression(
            anchor,
            oxc_ast::ast::Expression::new_new_target(anchor, ast.builder()),
            oxc_syntax::operator::LogicalOperator::Or,
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(class_name),
                ast.builder(),
            ),
            ast.builder(),
        ),
    ));
    let construct = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(construct_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        construct_arguments,
        false,
        ast.builder(),
    );
    let mut receiver_declarations = ArenaVec::new_in(ast);
    receiver_declarations.push(oxc_ast::ast::VariableDeclarator::new(
        anchor,
        oxc_ast::ast::BindingPattern::new_binding_identifier(
            anchor,
            ast.allocator().alloc_str(receiver_name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(construct),
        false,
        ast.builder(),
    ));
    let mut statements = ArenaVec::new_in(ast);
    statements.push(Statement::VariableDeclaration(
        oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Var,
            receiver_declarations,
            false,
            ast.builder(),
        ),
    ));
    if !instance_initializers.is_empty() {
        statements.push(function_receiver_call_statement(
            ast,
            anchor,
            std::mem::replace(instance_initializers, ArenaVec::new_in(ast)),
            receiver_name,
            "call",
        ));
    }
    statements.push(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(receiver_name),
            ast.builder(),
        )),
        ast.builder(),
    ));
    oxc_ast::ast::Function::boxed(
        anchor,
        FunctionType::FunctionDeclaration,
        Some(oxc_ast::ast::BindingIdentifier::new(
            anchor,
            ast.allocator().alloc_str(class_name),
            ast.builder(),
        )),
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        parameters,
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            statements,
            ast.builder(),
        )),
        ast.builder(),
    )
}

fn derived_inheritance_statements<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    super_name: &str,
    anchor: Span,
) -> ArenaVec<'a, Statement<'a>> {
    let class_reference = || {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(class_name),
            ast.builder(),
        )
    };
    let super_reference = || {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(super_name),
            ast.builder(),
        )
    };
    let set_prototype_of = || {
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                oxc_ast::ast::Expression::new_identifier(anchor, "Object", ast.builder()),
                oxc_ast::ast::IdentifierName::new(anchor, "setPrototypeOf", ast.builder()),
                false,
                ast.builder(),
            ),
        )
    };
    let mut set_arguments = ArenaVec::new_in(ast);
    set_arguments.push(Argument::from(class_reference()));
    set_arguments.push(Argument::from(super_reference()));
    let set_statement = oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_call_expression(
            anchor,
            set_prototype_of(),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            set_arguments,
            false,
            ast.builder(),
        ),
        ast.builder(),
    );
    let fallback = oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                class_reference(),
                oxc_ast::ast::IdentifierName::new(anchor, "__proto__", ast.builder()),
                false,
                ast.builder(),
            )
            .into(),
            super_reference(),
            ast.builder(),
        ),
        ast.builder(),
    );
    let mut statements = ArenaVec::new_in(ast);
    let invalid_super = oxc_ast::ast::Expression::new_logical_expression(
        anchor,
        oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            super_reference(),
            oxc_syntax::operator::BinaryOperator::StrictInequality,
            oxc_ast::ast::Expression::new_null_literal(anchor, ast.builder()),
            ast.builder(),
        ),
        oxc_syntax::operator::LogicalOperator::And,
        oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            oxc_ast::ast::Expression::new_unary_expression(
                anchor,
                oxc_syntax::operator::UnaryOperator::Typeof,
                super_reference(),
                ast.builder(),
            ),
            oxc_syntax::operator::BinaryOperator::StrictInequality,
            oxc_ast::ast::Expression::new_string_literal(anchor, "function", None, ast.builder()),
            ast.builder(),
        ),
        ast.builder(),
    );
    let mut error_arguments = ArenaVec::new_in(ast);
    error_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(
            anchor,
            "Super expression must either be null or a function",
            None,
            ast.builder(),
        ),
    ));
    let invalid_super_error = oxc_ast::ast::Expression::new_new_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(anchor, "TypeError", ast.builder()),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        error_arguments,
        ast.builder(),
    );
    statements.push(oxc_ast::ast::Statement::new_if_statement(
        anchor,
        invalid_super,
        oxc_ast::ast::Statement::new_throw_statement(anchor, invalid_super_error, ast.builder()),
        None,
        ast.builder(),
    ));
    let super_prototype = Expression::from(
        oxc_ast::ast::MemberExpression::new_static_member_expression(
            anchor,
            super_reference(),
            oxc_ast::ast::IdentifierName::new(anchor, "prototype", ast.builder()),
            false,
            ast.builder(),
        ),
    );
    let inherited_prototype = oxc_ast::ast::Expression::new_logical_expression(
        anchor,
        super_reference(),
        oxc_syntax::operator::LogicalOperator::And,
        super_prototype,
        ast.builder(),
    );
    let mut constructor_descriptor = ArenaVec::new_in(ast);
    for (name, value) in [
        ("value", class_reference()),
        (
            "writable",
            oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
        ),
        (
            "configurable",
            oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
        ),
    ] {
        constructor_descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, name, ast.builder()),
            value,
            false,
            false,
            false,
            ast.builder(),
        ));
    }
    let mut descriptors = ArenaVec::new_in(ast);
    descriptors.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        anchor,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "constructor", ast.builder()),
        oxc_ast::ast::Expression::new_object_expression(
            anchor,
            constructor_descriptor,
            ast.builder(),
        ),
        false,
        false,
        false,
        ast.builder(),
    ));
    let mut create_arguments = ArenaVec::new_in(ast);
    create_arguments.push(Argument::from(inherited_prototype));
    create_arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_object_expression(anchor, descriptors, ast.builder()),
    ));
    let created = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                oxc_ast::ast::Expression::new_identifier(anchor, "Object", ast.builder()),
                oxc_ast::ast::IdentifierName::new(anchor, "create", ast.builder()),
                false,
                ast.builder(),
            ),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        create_arguments,
        false,
        ast.builder(),
    );
    statements.push(oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                class_reference(),
                oxc_ast::ast::IdentifierName::new(anchor, "prototype", ast.builder()),
                false,
                ast.builder(),
            )
            .into(),
            created,
            ast.builder(),
        ),
        ast.builder(),
    ));
    statements.push(oxc_ast::ast::Statement::new_if_statement(
        anchor,
        set_prototype_of(),
        set_statement,
        Some(fallback),
        ast.builder(),
    ));
    statements
}

// A suspending key remains in the caller. Closures created along the way must
// retain this evaluation's private tokens rather than the next loop iteration's.
struct PrivateKeyClosureCapture<'a, 'p> {
    allocator: &'a Allocator,
    plan: &'p DirectClassPlan,
}
impl<'a> VisitMut<'a> for PrivateKeyClosureCapture<'a, '_> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let captures = matches!(
            expression,
            Expression::ArrowFunctionExpression(_)
                | Expression::FunctionExpression(_)
                | Expression::ClassExpression(_)
                | Expression::ObjectExpression(_)
        );
        if captures {
            let mut names = KeyCaptureNames(FxHashSet::default());
            names.visit_expression(expression);
            if !self
                .plan
                .private_keys
                .values()
                .any(|(binding, _)| names.0.contains(binding))
            {
                return;
            }
        }
        let mut suspension = KeySuspension(false);
        if captures {
            suspension.visit_expression(expression);
        }
        if !captures {
            walk_mut::walk_expression(self, expression);
            return;
        }
        let ast = AstBuilder::new(self.allocator);
        let span = expression.span();
        let parameters = self.plan.private_keys.values().map(|(name, _)| {
            oxc_ast::ast::FormalParameter::new(
                span,
                ArenaVec::new_in(&ast),
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    span,
                    self.allocator.alloc_str(name),
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None::<ArenaBox<'a, Expression<'a>>>,
                false,
                None,
                false,
                false,
                ast.builder(),
            )
        });
        let mut parameters = ArenaVec::from_iter_in(parameters, &ast);
        let arguments = self.plan.private_keys.values().map(|(name, _)| {
            Argument::from(oxc_ast::ast::Expression::new_identifier(
                span,
                self.allocator.alloc_str(name),
                ast.builder(),
            ))
        });
        let mut arguments = ArenaVec::from_iter_in(arguments, &ast);
        if suspension.0 {
            let mut names = KeyCaptureNames(FxHashSet::default());
            names.visit_expression(expression);
            let Expression::ObjectExpression(object) = expression else {
                unreachable!()
            };
            let mut lift = |value: &mut Expression<'a>, normalize: bool, spread: bool| {
                self.visit_expression(value);
                let value_span = value.span();
                let name = self
                    .allocator
                    .alloc_str(&reserve("_keyValue", &mut names.0));
                let mut argument = value.take_in(&ast);
                if normalize {
                    argument = oxc_ast::ast::Expression::new_call_expression(
                        value_span,
                        oxc_ast::ast::Expression::new_identifier(
                            value_span,
                            self.allocator
                                .alloc_str(&self.plan.helper_names.property_key),
                            ast.builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                        oxc_allocator::Vec::from_array_in(
                            [Argument::from(argument)],
                            ast.builder(),
                        ),
                        false,
                        ast.builder(),
                    );
                }
                if spread {
                    argument = oxc_ast::ast::Expression::new_object_expression(
                        value_span,
                        oxc_allocator::Vec::from_array_in(
                            [oxc_ast::ast::ObjectPropertyKind::new_spread_property(
                                value_span,
                                argument,
                                ast.builder(),
                            )],
                            ast.builder(),
                        ),
                        ast.builder(),
                    );
                }
                parameters.push(oxc_ast::ast::FormalParameter::new(
                    value_span,
                    ArenaVec::new_in(&ast),
                    oxc_ast::ast::BindingPattern::new_binding_identifier(
                        value_span,
                        name,
                        ast.builder(),
                    ),
                    None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                    None::<ArenaBox<'a, Expression<'a>>>,
                    false,
                    None,
                    false,
                    false,
                    ast.builder(),
                ));
                arguments.push(Argument::from(argument));
                *value = oxc_ast::ast::Expression::new_identifier(value_span, name, ast.builder());
            };
            for property in &mut object.properties {
                match property {
                    oxc_ast::ast::ObjectPropertyKind::ObjectProperty(property) => {
                        if property.computed {
                            let mut key = property.key.take_in(&ast).into_expression();
                            lift(&mut key, true, false);
                            property.key = PropertyKey::from(key);
                        }
                        // Keep methods on their original home object. Pure function
                        // creation also stays here to retain property-name inference.
                        if !matches!(
                            property.value,
                            Expression::FunctionExpression(_)
                                | Expression::ArrowFunctionExpression(_)
                        ) {
                            lift(&mut property.value, false, false);
                            property.shorthand = false;
                        }
                    }
                    oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                        lift(&mut spread.argument, false, true);
                    }
                }
            }
        }
        let value = expression.take_in(&ast);
        let factory = oxc_ast::ast::Expression::new_arrow_function_expression(
            span,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                span,
                FormalParameterKind::FormalParameter,
                parameters,
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            {
                let mut body = oxc_ast::ast::FunctionBody::boxed(
                    span,
                    ArenaVec::new_in(&ast),
                    oxc_allocator::Vec::from_array_in(
                        [oxc_ast::ast::Statement::new_expression_statement(
                            span,
                            value,
                            ast.builder(),
                        )],
                        ast.builder(),
                    ),
                    ast.builder(),
                )
                .unbox();
                let Statement::ExpressionStatement(statement) = body.statements.remove(0) else {
                    unreachable!("generated concise arrow has one expression")
                };
                oxc_ast::ast::ArrowFunctionBody::from(statement.unbox().expression)
            },
            ast.builder(),
        );
        *expression = oxc_ast::ast::Expression::new_call_expression(
            span,
            factory,
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
            ast.builder(),
        );
    }
}

struct EnclosingPrivateUse {
    names: FxHashSet<String>,
    found: bool,
}
impl<'a> Visit<'a> for EnclosingPrivateUse {
    fn visit_class(&mut self, class: &Class<'a>) {
        if let Some(heritage) = class.heritage.as_ref().map(|heritage| &heritage.expression) {
            self.visit_expression(heritage);
        }
        let outer = self.names.clone();
        for element in &class.body.body {
            if let Some(PropertyKey::PrivateIdentifier(identifier)) = element.property_key() {
                self.names.remove(identifier.name.as_str());
            }
        }
        self.visit_class_body(&class.body);
        self.names = outer;
    }

    fn visit_private_field_expression(&mut self, field: &oxc_ast::ast::PrivateFieldExpression<'a>) {
        self.found |= self.names.contains(field.field.name.as_str());
        walk::walk_private_field_expression(self, field);
    }
    fn visit_private_in_expression(&mut self, expression: &oxc_ast::ast::PrivateInExpression<'a>) {
        self.found |= self.names.contains(expression.left.name.as_str());
        walk::walk_private_in_expression(self, expression);
    }
}

struct KeyCaptureNames(FxHashSet<String>);
impl<'a> Visit<'a> for KeyCaptureNames {
    fn visit_identifier_reference(&mut self, identifier: &oxc_ast::ast::IdentifierReference<'a>) {
        self.0.insert(identifier.name.to_string());
    }
    fn visit_binding_identifier(&mut self, identifier: &oxc_ast::ast::BindingIdentifier<'a>) {
        self.0.insert(identifier.name.to_string());
    }
}

struct KeySuspension(bool);
impl<'a> Visit<'a> for KeySuspension {
    fn visit_expression(&mut self, expression: &Expression<'a>) {
        if matches!(
            expression,
            Expression::AwaitExpression(_) | Expression::YieldExpression(_)
        ) {
            self.0 = true;
        } else {
            walk::walk_expression(self, expression);
        }
    }
    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}
    fn visit_arrow_function_expression(&mut self, _: &oxc_ast::ast::ArrowFunctionExpression<'a>) {}
}

struct PrivateAccessorPlan<'a> {
    key: String,
    is_static: bool,
    get: Option<ArenaBox<'a, Function<'a>>>,
    set: Option<ArenaBox<'a, Function<'a>>>,
    span: Span,
}

fn lower_simple_class<'a>(
    allocator: &'a Allocator,
    mut class: Class<'a>,
    plan: &DirectClassPlan,
    construct_assert: &mut bool,
    private_temporaries: &mut Vec<String>,
) -> Result<Expression<'a>, &'static str> {
    let ast = AstBuilder::new(allocator);
    let anchor = class.span;
    let name = &plan.name;
    let super_class = class.heritage.take().map(|heritage| heritage.expression);
    let super_name = plan.super_name.as_deref();
    if !plan.private_keys.is_empty() {
        PrivateLooseRewriter {
            allocator,
            keys: &plan.private_keys,
            base_name: allocator.alloc_str(&plan.helper_names.private_base),
            check_in_rhs_name: allocator.alloc_str(&plan.helper_names.check_in_rhs),
        }
        .visit_class_body(&mut class.body);
    }
    let mut private_method_definitions = ArenaVec::new_in(&ast);
    let mut constructor = None;
    let mut methods = Vec::new();
    let mut instance_initializers = ArenaVec::new_in(&ast);
    let mut static_initializers = ArenaVec::new_in(&ast);
    let mut private_instance_method_initializers = ArenaVec::new_in(&ast);
    let mut private_static_method_initializers = ArenaVec::new_in(&ast);
    let mut private_accessors: Vec<PrivateAccessorPlan<'a>> = Vec::new();
    // Preserve first-occurrence emission order and promote only larger classes to
    // keyed lookup. Staticness is part of the accessor identity: validation is a
    // separate compiler phase and callers may supply a parser-built AST directly.
    let mut private_accessor_indices: Option<FxHashMap<(String, bool), usize>> = None;
    let mut computed_key_initializers: Vec<(String, Expression<'a>, Span)> = Vec::new();
    for element in class.body.body.drain(..) {
        match element {
            ClassElement::MethodDefinition(method) => {
                let mut method = method.unbox();
                if method.value.body.is_none() {
                    continue;
                }
                if let Some(binding) = plan.computed_keys.get(&method.node_id.get()) {
                    let key = method.key.take_in(&ast).into_expression();
                    computed_key_initializers.push((binding.clone(), key, method.span));
                    method.key = PropertyKey::from(oxc_ast::ast::Expression::new_identifier(
                        method.span,
                        allocator.alloc_str(binding),
                        ast.builder(),
                    ));
                }
                if method.kind == MethodDefinitionKind::Constructor {
                    constructor = Some(method.value);
                } else if let PropertyKey::PrivateIdentifier(key) = &method.key {
                    let private_key = plan
                        .private_keys
                        .get(key.name.as_str())
                        .ok_or("classes-direct-private-key-missing")?
                        .0
                        .clone();
                    let mut value = method.value;
                    value.r#type = FunctionType::FunctionExpression;
                    value.id = None;
                    if !value.generator
                        && !value.r#async
                        && let Some(body) = value.body.as_mut()
                    {
                        body.statements
                            .insert(0, method_construct_guard(&ast, method.span));
                    }
                    if let Some(body) = value.body.as_mut() {
                        let mut rewriter = SuperAccessRewriter {
                            allocator,
                            class_name: allocator.alloc_str(name),
                            get_name: allocator.alloc_str(&plan.helper_names.super_get),
                            reference_name: allocator.alloc_str(&plan.helper_names.super_reference),
                            is_static: method.r#static,
                            receiver_name: None,
                        };
                        for statement in &mut body.statements {
                            rewriter.visit_statement(statement);
                        }
                        rewriter.visit_formal_parameters(&mut value.params);
                    }
                    if matches!(
                        method.kind,
                        MethodDefinitionKind::Get | MethodDefinitionKind::Set
                    ) {
                        const INDEX_THRESHOLD: usize = 8;
                        if private_accessor_indices.is_none()
                            && private_accessors.len() == INDEX_THRESHOLD
                        {
                            private_accessor_indices = Some(
                                private_accessors
                                    .iter()
                                    .enumerate()
                                    .map(|(index, accessor)| {
                                        ((accessor.key.clone(), accessor.is_static), index)
                                    })
                                    .collect(),
                            );
                        }
                        let existing = if let Some(indices) = &private_accessor_indices {
                            indices
                                .get(&(private_key.clone(), method.r#static))
                                .copied()
                        } else {
                            private_accessors.iter().position(|accessor| {
                                accessor.key == private_key && accessor.is_static == method.r#static
                            })
                        };
                        let index = existing.unwrap_or_else(|| {
                            let index = private_accessors.len();
                            private_accessors.push(PrivateAccessorPlan {
                                key: private_key.clone(),
                                is_static: method.r#static,
                                get: None,
                                set: None,
                                span: method.span,
                            });
                            if let Some(indices) = &mut private_accessor_indices {
                                indices.insert((private_key.clone(), method.r#static), index);
                            }
                            index
                        });
                        if method.kind == MethodDefinitionKind::Get {
                            private_accessors[index].get = Some(value);
                        } else {
                            private_accessors[index].set = Some(value);
                        }
                    } else {
                        let method_binding = &plan.private_methods[key.name.as_str()];
                        private_method_definitions.push(Statement::VariableDeclaration(
                            oxc_ast::ast::VariableDeclaration::boxed(
                                method.span,
                                VariableDeclarationKind::Var,
                                oxc_allocator::Vec::from_array_in(
                                    [oxc_ast::ast::VariableDeclarator::new(
                                        method.span,
                                        oxc_ast::ast::BindingPattern::new_binding_identifier(
                                            method.span,
                                            allocator.alloc_str(method_binding),
                                            ast.builder(),
                                        ),
                                        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                                        Some(Expression::FunctionExpression(value)),
                                        false,
                                        ast.builder(),
                                    )],
                                    ast.builder(),
                                ),
                                false,
                                ast.builder(),
                            ),
                        ));
                        let statement = private_element_initializer(
                            &ast,
                            name,
                            &private_key,
                            Some(oxc_ast::ast::Expression::new_identifier(
                                method.span,
                                allocator.alloc_str(method_binding),
                                ast.builder(),
                            )),
                            method.r#static,
                            false,
                            method.span,
                        );
                        if method.r#static {
                            private_static_method_initializers.push(statement);
                        } else {
                            private_instance_method_initializers.push(statement);
                        }
                    }
                } else {
                    methods.push(method);
                }
            }
            ClassElement::PropertyDefinition(property) => {
                let mut property = property.unbox();
                if let Some(value) = &mut property.value {
                    super::clear_leading_pure_annotation(value);
                    if let Some(super_name) = super_name {
                        if plan.class_properties_loose == Some(true) {
                            LooseFieldSuperRewriter {
                                allocator,
                                class_name: Some(allocator.alloc_str(name)),
                                super_name: Some(allocator.alloc_str(super_name)),
                                is_static: property.r#static,
                            }
                            .visit_expression(value);
                        } else {
                            SuperAccessRewriter {
                                allocator,
                                class_name: allocator.alloc_str(name),
                                get_name: allocator.alloc_str(&plan.helper_names.super_get),
                                reference_name: allocator
                                    .alloc_str(&plan.helper_names.super_reference),
                                is_static: property.r#static,
                                receiver_name: property.r#static.then(|| allocator.alloc_str(name)),
                            }
                            .visit_expression(value);
                        }
                    }
                    if property.r#static {
                        StaticInitializerThisRewriter {
                            allocator,
                            class_name: allocator.alloc_str(name),
                        }
                        .visit_expression(value);
                    }
                }
                let requires_definition = property.r#static
                    && property
                        .key
                        .static_name()
                        .is_some_and(|key| matches!(key.as_ref(), "name" | "length"));
                let computed_binding = plan.computed_keys.get(&property.node_id.get()).cloned();
                if let Some(binding) = computed_binding.as_ref() {
                    let key = property.key.take_in(&ast).into_expression();
                    computed_key_initializers.push((binding.clone(), key, property.span));
                }
                let statement = if let PropertyKey::PrivateIdentifier(key) = &property.key {
                    (
                        property.r#static,
                        private_element_initializer(
                            &ast,
                            name,
                            plan.private_keys
                                .get(key.name.as_str())
                                .ok_or("classes-direct-private-key-missing")?
                                .0
                                .as_str(),
                            property.value,
                            property.r#static,
                            true,
                            property.span,
                        ),
                    )
                } else {
                    public_field_initializer(
                        &ast,
                        name,
                        property,
                        computed_binding.as_deref(),
                        plan.class_properties_loose
                            .ok_or("classes-direct-field-options-missing")?
                            && !requires_definition,
                        anchor,
                    )?
                };
                if statement.0 {
                    static_initializers.push(statement.1);
                } else {
                    instance_initializers.push(statement.1);
                }
            }
            ClassElement::AccessorProperty(accessor) => {
                let mut accessor = accessor.unbox();
                let synthetic = format!("\0accessor:{}", accessor.node_id.get().index());
                let backing = plan
                    .private_keys
                    .get(&synthetic)
                    .ok_or("classes-direct-private-key-missing")?
                    .0
                    .clone();
                if let Some(value) = &mut accessor.value {
                    super::clear_leading_pure_annotation(value);
                    SuperAccessRewriter {
                        allocator,
                        class_name: allocator.alloc_str(name),
                        get_name: allocator.alloc_str(&plan.helper_names.super_get),
                        reference_name: allocator.alloc_str(&plan.helper_names.super_reference),
                        is_static: accessor.r#static,
                        receiver_name: None,
                    }
                    .visit_expression(value);
                    if accessor.r#static {
                        StaticInitializerThisRewriter {
                            allocator,
                            class_name: allocator.alloc_str(name),
                        }
                        .visit_expression(value);
                    }
                }
                let computed_binding = plan.computed_keys.get(&accessor.node_id.get()).cloned();
                if let Some(binding) = computed_binding.as_ref() {
                    let key = accessor.key.take_in(&ast).into_expression();
                    computed_key_initializers.push((binding.clone(), key, accessor.span));
                    accessor.key = PropertyKey::from(oxc_ast::ast::Expression::new_identifier(
                        accessor.span,
                        allocator.alloc_str(binding),
                        ast.builder(),
                    ));
                }
                let initializer = private_element_initializer(
                    &ast,
                    name,
                    &backing,
                    accessor.value.take(),
                    accessor.r#static,
                    true,
                    accessor.span,
                );
                if accessor.r#static {
                    static_initializers.push(initializer);
                } else {
                    instance_initializers.push(initializer);
                }
                let (get, set) = auto_accessor_methods(&ast, name, accessor, &backing);
                methods.push(get);
                methods.push(set);
            }
            ClassElement::StaticBlock(block) => {
                if !plan.class_static_blocks {
                    return Err("classes-direct-static-block-options-missing");
                }
                let mut block = block.unbox();
                let mut rewriter = SuperAccessRewriter {
                    allocator,
                    class_name: allocator.alloc_str(name),
                    get_name: allocator.alloc_str(&plan.helper_names.super_get),
                    reference_name: allocator.alloc_str(&plan.helper_names.super_reference),
                    is_static: true,
                    receiver_name: None,
                };
                for statement in &mut block.body {
                    rewriter.visit_statement(statement);
                }
                static_initializers.push(static_block_initializer(&ast, name, block));
            }
            ClassElement::TSIndexSignature(_) => {}
        }
    }
    for accessor in private_accessors {
        let statement = private_accessor_initializer(&ast, name, &accessor);
        if accessor.is_static {
            private_static_method_initializers.push(statement);
        } else {
            private_instance_method_initializers.push(statement);
        }
    }
    private_instance_method_initializers.append(&mut instance_initializers);
    instance_initializers = private_instance_method_initializers;
    private_static_method_initializers.append(&mut static_initializers);
    static_initializers = private_static_method_initializers;
    if !instance_initializers.is_empty() {
        let mut detector = ConstructorShapeDetector {
            super_calls: 0,
            new_target: false,
        };
        for statement in &instance_initializers {
            detector.visit_statement(statement);
        }
        let mut parameters = ArenaVec::new_in(&ast);
        let mut arguments = oxc_allocator::Vec::from_array_in(
            [Argument::from(
                oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder()),
            )],
            ast.builder(),
        );
        if detector.new_target {
            let binding = allocator.alloc_str(&plan.initializer_new_target_name);
            let mut rewriter = NewTargetRewriter {
                allocator,
                name: binding,
            };
            for statement in &mut instance_initializers {
                rewriter.visit_statement(statement);
            }
            parameters.push(oxc_ast::ast::FormalParameter::new(
                anchor,
                ArenaVec::new_in(&ast),
                oxc_ast::ast::BindingPattern::new_binding_identifier(
                    anchor,
                    binding,
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None::<ArenaBox<'a, Expression<'a>>>,
                false,
                None,
                false,
                false,
                ast.builder(),
            ));
            arguments.push(Argument::from(oxc_ast::ast::Expression::new_new_target(
                anchor,
                ast.builder(),
            )));
        }
        let initializer = oxc_ast::ast::Function::boxed(
            anchor,
            FunctionType::FunctionDeclaration,
            Some(oxc_ast::ast::BindingIdentifier::new(
                anchor,
                allocator.alloc_str(&plan.initializer_name),
                ast.builder(),
            )),
            false,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                anchor,
                FormalParameterKind::FormalParameter,
                parameters,
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(oxc_ast::ast::FunctionBody::boxed(
                anchor,
                ArenaVec::new_in(&ast),
                std::mem::replace(&mut instance_initializers, ArenaVec::new_in(&ast)),
                ast.builder(),
            )),
            ast.builder(),
        );
        private_method_definitions.push(Statement::FunctionDeclaration(initializer));
        instance_initializers.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            oxc_ast::ast::Expression::new_call_expression(
                anchor,
                Expression::from(
                    oxc_ast::ast::MemberExpression::new_static_member_expression(
                        anchor,
                        oxc_ast::ast::Expression::new_identifier(
                            anchor,
                            allocator.alloc_str(&plan.initializer_name),
                            ast.builder(),
                        ),
                        oxc_ast::ast::IdentifierName::new(anchor, "call", ast.builder()),
                        false,
                        ast.builder(),
                    ),
                ),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
                ast.builder(),
            ),
            ast.builder(),
        ));
    }
    let mut needs_assertion = false;
    let mut constructor = if let Some(mut function) = constructor {
        if let (Some(super_name), Some(receiver_name)) = (super_name, plan.receiver_name.as_deref())
        {
            needs_assertion = lower_derived_constructor_body(
                &ast,
                &mut function,
                name,
                super_name,
                &plan.helper_names.construct,
                &plan.helper_names.super_get,
                &plan.helper_names.super_reference,
                receiver_name,
                plan.result_name
                    .as_deref()
                    .ok_or("classes-direct-derived-result-name-missing")?,
                plan.new_target_name.as_deref(),
                plan.super_call_name.as_deref(),
                &plan.constructor_parameters,
                anchor,
                &mut instance_initializers,
                construct_assert,
            )?;
        }
        function.r#type = FunctionType::FunctionDeclaration;
        function.id = Some(oxc_ast::ast::BindingIdentifier::new(
            anchor,
            allocator.alloc_str(name),
            ast.builder(),
        ));
        function
    } else if let (Some(super_name), Some(receiver_name)) =
        (super_name, plan.receiver_name.as_deref())
    {
        derived_default_constructor(
            &ast,
            name,
            super_name,
            &plan.helper_names.construct,
            receiver_name,
            anchor,
            &mut instance_initializers,
        )
    } else {
        oxc_ast::ast::Function::boxed(
            anchor,
            FunctionType::FunctionDeclaration,
            Some(oxc_ast::ast::BindingIdentifier::new(
                anchor,
                allocator.alloc_str(name),
                ast.builder(),
            )),
            false,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            oxc_ast::ast::FormalParameters::boxed(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(&ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(oxc_ast::ast::FunctionBody::boxed(
                anchor,
                ArenaVec::new_in(&ast),
                ArenaVec::new_in(&ast),
                ast.builder(),
            )),
            ast.builder(),
        )
    };
    let Some(body) = constructor.body.as_mut() else {
        return Err("classes-direct-constructor-body-missing");
    };
    let mut original_body = std::mem::replace(&mut body.statements, ArenaVec::new_in(&ast));
    body.statements.push(class_call_guard(&ast, name, anchor));
    if let Some(receiver_name) = plan.receiver_name.as_deref() {
        let mut rewriter = DerivedThisRewriter {
            allocator,
            receiver_name: allocator.alloc_str(receiver_name),
            construct_name: allocator.alloc_str(&plan.helper_names.construct),
            used: false,
        };
        for statement in &mut instance_initializers {
            rewriter.visit_statement(statement);
        }
        *construct_assert |= rewriter.used;
        body.statements.append(&mut instance_initializers);
        body.statements.append(&mut original_body);
    } else {
        body.statements.append(&mut instance_initializers);
        body.statements.append(&mut original_body);
    }
    let suspended_private_keys = !plan.private_keys.is_empty()
        && computed_key_initializers.iter().any(|(_, key, _)| {
            let mut detector = KeySuspension(false);
            detector.visit_expression(key);
            detector.0
        });
    let mut wrapper_statements = ArenaVec::new_in(&ast);
    for (binding, key) in plan.private_keys.values() {
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(oxc_ast::ast::VariableDeclarator::new(
            anchor,
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                allocator.alloc_str(binding),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(oxc_ast::ast::Expression::new_call_expression(
                anchor,
                Expression::from(
                    oxc_ast::ast::MemberExpression::new_static_member_expression(
                        anchor,
                        oxc_ast::ast::Expression::new_identifier(
                            anchor,
                            allocator.alloc_str(&plan.helper_names.private_runtime),
                            ast.builder(),
                        ),
                        oxc_ast::ast::IdentifierName::new(
                            anchor,
                            "classPrivateFieldLooseKey",
                            ast.builder(),
                        ),
                        false,
                        ast.builder(),
                    ),
                ),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                oxc_allocator::Vec::from_array_in(
                    [Argument::from(
                        oxc_ast::ast::Expression::new_string_literal(
                            anchor,
                            allocator.alloc_str(key),
                            None,
                            ast.builder(),
                        ),
                    )],
                    ast.builder(),
                ),
                false,
                ast.builder(),
            )),
            false,
            ast.builder(),
        ));
        wrapper_statements.push(Statement::VariableDeclaration(
            oxc_ast::ast::VariableDeclaration::boxed(
                anchor,
                VariableDeclarationKind::Var,
                declarations,
                false,
                ast.builder(),
            ),
        ));
    }
    let mut wrapper_parameters = ArenaVec::new_in(&ast);
    let mut wrapper_arguments = ArenaVec::new_in(&ast);
    if let (Some(super_name), Some(super_class)) = (super_name, super_class) {
        wrapper_parameters.push(oxc_ast::ast::FormalParameter::new(
            anchor,
            ArenaVec::new_in(&ast),
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                anchor,
                allocator.alloc_str(super_name),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
            ast.builder(),
        ));
        wrapper_arguments.push(Argument::from(super_class));
    }
    if suspended_private_keys {
        // The caller evaluates suspending keys. Its activation owns temporary
        // tokens; the wrapper and every escaping key closure capture their values.
        for statement in std::mem::replace(&mut wrapper_statements, ArenaVec::new_in(&ast)) {
            let Statement::VariableDeclaration(mut declaration) = statement else {
                unreachable!()
            };
            let declarator = declaration.declarations.pop().unwrap();
            let BindingPattern::BindingIdentifier(binding) = declarator.id else {
                unreachable!()
            };
            let name = binding.name;
            private_temporaries.push(name.to_string());
            wrapper_parameters.push(oxc_ast::ast::FormalParameter::new(
                anchor,
                ArenaVec::new_in(&ast),
                oxc_ast::ast::BindingPattern::new_binding_identifier(anchor, name, ast.builder()),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                None::<ArenaBox<'a, Expression<'a>>>,
                false,
                None,
                false,
                false,
                ast.builder(),
            ));
            wrapper_arguments.push(Argument::from(
                oxc_ast::ast::Expression::new_assignment_expression(
                    anchor,
                    AssignmentOperator::Assign,
                    oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                        anchor,
                        name,
                        ast.builder(),
                    )
                    .into(),
                    declarator.init.unwrap(),
                    ast.builder(),
                ),
            ));
        }
    }
    wrapper_statements.append(&mut private_method_definitions);
    let private_key_thunks = !plan.private_keys.is_empty() && !suspended_private_keys;
    for (binding, mut key, span) in computed_key_initializers {
        if suspended_private_keys {
            PrivateKeyClosureCapture { allocator, plan }.visit_expression(&mut key);
        }
        wrapper_parameters.push(oxc_ast::ast::FormalParameter::new(
            span,
            ArenaVec::new_in(&ast),
            oxc_ast::ast::BindingPattern::new_binding_identifier(
                span,
                allocator.alloc_str(&binding),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
            ast.builder(),
        ));
        // Computed keys are evaluated in the class's surrounding context. In
        // particular, `yield` and `await` are valid here but become syntax
        // errors if moved into the non-generator class wrapper body.
        if private_key_thunks {
            let parameters = plan
                .private_keys
                .values()
                .map(|(binding, _)| {
                    oxc_ast::ast::FormalParameter::new(
                        span,
                        ArenaVec::new_in(&ast),
                        oxc_ast::ast::BindingPattern::new_binding_identifier(
                            span,
                            allocator.alloc_str(binding),
                            ast.builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                        None::<ArenaBox<'a, Expression<'a>>>,
                        false,
                        None,
                        false,
                        false,
                        ast.builder(),
                    )
                })
                .collect::<Vec<_>>();
            let thunk = oxc_ast::ast::Expression::new_arrow_function_expression(
                span,
                false,
                None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
                oxc_ast::ast::FormalParameters::boxed(
                    span,
                    FormalParameterKind::FormalParameter,
                    ArenaVec::from_iter_in(parameters, &ast),
                    None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                    ast.builder(),
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                {
                    let mut body = oxc_ast::ast::FunctionBody::boxed(
                        span,
                        ArenaVec::new_in(&ast),
                        oxc_allocator::Vec::from_array_in(
                            [oxc_ast::ast::Statement::new_expression_statement(
                                span,
                                key,
                                ast.builder(),
                            )],
                            ast.builder(),
                        ),
                        ast.builder(),
                    )
                    .unbox();
                    let Statement::ExpressionStatement(statement) = body.statements.remove(0)
                    else {
                        unreachable!("generated concise arrow has one expression")
                    };
                    oxc_ast::ast::ArrowFunctionBody::from(statement.unbox().expression)
                },
                ast.builder(),
            );
            wrapper_arguments.push(Argument::from(thunk));
            let arguments = plan.private_keys.values().map(|(binding, _)| {
                Argument::from(oxc_ast::ast::Expression::new_identifier(
                    span,
                    allocator.alloc_str(binding),
                    ast.builder(),
                ))
            });
            wrapper_statements.push(oxc_ast::ast::Statement::new_expression_statement(
                span,
                oxc_ast::ast::Expression::new_assignment_expression(
                    span,
                    AssignmentOperator::Assign,
                    oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                        span,
                        allocator.alloc_str(&binding),
                        ast.builder(),
                    )
                    .into(),
                    oxc_ast::ast::Expression::new_call_expression(
                        span,
                        oxc_ast::ast::Expression::new_identifier(
                            span,
                            allocator.alloc_str(&binding),
                            ast.builder(),
                        ),
                        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                        ArenaVec::from_iter_in(arguments, &ast),
                        false,
                        ast.builder(),
                    ),
                    ast.builder(),
                ),
                ast.builder(),
            ));
        } else {
            wrapper_arguments.push(Argument::from(key));
        }
        let value = oxc_ast::ast::Expression::new_call_expression(
            span,
            oxc_ast::ast::Expression::new_identifier(
                span,
                allocator.alloc_str(&plan.helper_names.property_key),
                ast.builder(),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            oxc_allocator::Vec::from_array_in(
                [Argument::from(oxc_ast::ast::Expression::new_identifier(
                    span,
                    allocator.alloc_str(&binding),
                    ast.builder(),
                ))],
                ast.builder(),
            ),
            false,
            ast.builder(),
        );
        wrapper_statements.push(oxc_ast::ast::Statement::new_expression_statement(
            span,
            oxc_ast::ast::Expression::new_assignment_expression(
                span,
                AssignmentOperator::Assign,
                oxc_ast::ast::SimpleAssignmentTarget::new_assignment_target_identifier(
                    span,
                    allocator.alloc_str(&binding),
                    ast.builder(),
                )
                .into(),
                value,
                ast.builder(),
            ),
            ast.builder(),
        ));
    }
    debug_assert!(!needs_assertion);
    constructor.r#type = FunctionType::FunctionExpression;
    let mut constructor_declarations = ArenaVec::new_in(&ast);
    constructor_declarations.push(oxc_ast::ast::VariableDeclarator::new(
        anchor,
        oxc_ast::ast::BindingPattern::new_binding_identifier(
            anchor,
            allocator.alloc_str(name),
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(Expression::FunctionExpression(constructor)),
        false,
        ast.builder(),
    ));
    wrapper_statements.push(Statement::VariableDeclaration(
        oxc_ast::ast::VariableDeclaration::boxed(
            anchor,
            VariableDeclarationKind::Const,
            constructor_declarations,
            false,
            ast.builder(),
        ),
    ));
    if let Some(inferred_name) = plan.inferred_name.as_deref() {
        wrapper_statements.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            set_function_name(
                &ast,
                oxc_ast::ast::Expression::new_identifier(
                    anchor,
                    allocator.alloc_str(name),
                    ast.builder(),
                ),
                oxc_ast::ast::Expression::new_string_literal(
                    anchor,
                    allocator.alloc_str(inferred_name),
                    None,
                    ast.builder(),
                ),
                anchor,
            ),
            ast.builder(),
        ));
    }
    let after_constructor = wrapper_statements.len();
    for method in methods {
        let method_name =
            match &method.key {
                PropertyKey::StringLiteral(key) if !method.computed => {
                    let prefix = match method.kind {
                        MethodDefinitionKind::Get => "get ",
                        MethodDefinitionKind::Set => "set ",
                        _ => "",
                    };
                    Some(oxc_ast::ast::Expression::new_string_literal(
                        anchor,
                        allocator.alloc_str(&format!("{prefix}{}", key.value)),
                        None,
                        ast.builder(),
                    ))
                }
                PropertyKey::StaticIdentifier(key) if !method.computed => {
                    let prefix = match method.kind {
                        MethodDefinitionKind::Get => "get ",
                        MethodDefinitionKind::Set => "set ",
                        _ => "",
                    };
                    Some(oxc_ast::ast::Expression::new_string_literal(
                        anchor,
                        allocator.alloc_str(&format!("{prefix}{}", key.name)),
                        None,
                        ast.builder(),
                    ))
                }
                PropertyKey::StaticIdentifier(key) if method.computed => Some(
                    computed_function_name(&ast, key.name.as_str(), method.kind, anchor),
                ),
                PropertyKey::Identifier(key) if method.computed => Some(computed_function_name(
                    &ast,
                    key.name.as_str(),
                    method.kind,
                    anchor,
                )),
                _ => None,
            };
        let key = match method.key {
            PropertyKey::StaticIdentifier(key) if !method.computed => {
                oxc_ast::ast::Expression::new_string_literal(anchor, key.name, None, ast.builder())
            }
            PropertyKey::PrivateIdentifier(_) => {
                return Err("classes-direct-method-key-mismatch");
            }
            key => key.into_expression(),
        };
        let mut function = method.value;
        function.r#type = FunctionType::FunctionExpression;
        function.id = None;
        let needs_construct_guard = !function.generator && !function.r#async;
        let Some(body) = function.body.as_mut() else {
            return Err("classes-direct-method-body-missing");
        };
        if needs_construct_guard {
            body.statements
                .insert(0, method_construct_guard(&ast, method.span));
        }
        {
            let mut rewriter = SuperAccessRewriter {
                allocator,
                class_name: allocator.alloc_str(name),
                get_name: allocator.alloc_str(&plan.helper_names.super_get),
                reference_name: allocator.alloc_str(&plan.helper_names.super_reference),
                is_static: method.r#static,
                receiver_name: None,
            };
            for statement in &mut body.statements {
                rewriter.visit_statement(statement);
            }
            rewriter.visit_formal_parameters(&mut function.params);
        }
        let target = if method.r#static {
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                allocator.alloc_str(name),
                ast.builder(),
            )
        } else {
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    anchor,
                    oxc_ast::ast::Expression::new_identifier(
                        anchor,
                        allocator.alloc_str(name),
                        ast.builder(),
                    ),
                    oxc_ast::ast::IdentifierName::new(anchor, "prototype", ast.builder()),
                    false,
                    ast.builder(),
                ),
            )
        };
        let mut descriptor = ArenaVec::new_in(&ast);
        let (kind, property) = match method.kind {
            MethodDefinitionKind::Method => (PropertyKind::Init, "value"),
            MethodDefinitionKind::Get => (PropertyKind::Get, "get"),
            MethodDefinitionKind::Set => (PropertyKind::Set, "set"),
            MethodDefinitionKind::Constructor => unreachable!(),
        };
        let function_expression = Expression::FunctionExpression(function);
        let function_expression = if let Some(function_name) = method_name {
            set_function_name(&ast, function_expression, function_name, anchor)
        } else {
            function_expression
        };
        descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, property, ast.builder()),
            function_expression,
            false,
            false,
            false,
            ast.builder(),
        ));
        if kind == PropertyKind::Init {
            descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
                anchor,
                PropertyKind::Init,
                oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "writable", ast.builder()),
                oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
                false,
                false,
                false,
                ast.builder(),
            ));
        }
        descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "configurable", ast.builder()),
            oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
            false,
            false,
            false,
            ast.builder(),
        ));
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(target));
        arguments.push(Argument::from(key));
        arguments.push(Argument::from(
            oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
        ));
        wrapper_statements.push(oxc_ast::ast::Statement::new_expression_statement(
            anchor,
            object_define_property_call(&ast, anchor, arguments),
            ast.builder(),
        ));
    }
    if let Some(super_name) = super_name {
        let mut inheritance = derived_inheritance_statements(&ast, name, super_name, anchor);
        wrapper_statements.splice(after_constructor..after_constructor, inheritance.drain(..));
    }
    wrapper_statements.push(lock_class_prototype(&ast, name, anchor));
    wrapper_statements.append(&mut static_initializers);
    wrapper_statements.push(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(oxc_ast::ast::Expression::new_identifier(
            anchor,
            allocator.alloc_str(name),
            ast.builder(),
        )),
        ast.builder(),
    ));
    let mut wrapper_directives = ArenaVec::new_in(&ast);
    wrapper_directives.push(oxc_ast::ast::Directive::new(
        anchor,
        oxc_ast::ast::StringLiteral::new(anchor, "use strict", None, ast.builder()),
        "use strict",
        ast.builder(),
    ));
    let wrapper_body = oxc_ast::ast::FunctionBody::boxed(
        anchor,
        wrapper_directives,
        wrapper_statements,
        ast.builder(),
    );
    let wrapper = oxc_ast::ast::Expression::new_arrow_function_expression(
        anchor,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            anchor,
            FormalParameterKind::FormalParameter,
            wrapper_parameters,
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        oxc_ast::ast::ArrowFunctionBody::FunctionBody(wrapper_body),
        ast.builder(),
    );
    Ok(oxc_ast::ast::Expression::new_call_expression(
        anchor,
        wrapper,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        wrapper_arguments,
        false,
        ast.builder(),
    ))
}

fn static_block_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    block: oxc_ast::ast::StaticBlock<'a>,
) -> Statement<'a> {
    let anchor = block.span;
    let function = oxc_ast::ast::Expression::new_function_expression(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            anchor,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            block.body,
            ast.builder(),
        )),
        ast.builder(),
    );
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        ast.allocator().alloc_str(class_name),
        ast.builder(),
    )));
    oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_call_expression(
            anchor,
            Expression::from(
                oxc_ast::ast::MemberExpression::new_static_member_expression(
                    anchor,
                    function,
                    oxc_ast::ast::IdentifierName::new(anchor, "call", ast.builder()),
                    false,
                    ast.builder(),
                ),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
            ast.builder(),
        ),
        ast.builder(),
    )
}

fn object_define_property_call<'a>(
    ast: &AstBuilder<'a>,
    anchor: Span,
    arguments: ArenaVec<'a, Argument<'a>>,
) -> Expression<'a> {
    oxc_ast::ast::Expression::new_call_expression(
        anchor,
        Expression::from(
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                oxc_ast::ast::Expression::new_identifier(anchor, "Object", ast.builder()),
                oxc_ast::ast::IdentifierName::new(anchor, "defineProperty", ast.builder()),
                false,
                ast.builder(),
            ),
        ),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
        ast.builder(),
    )
}

fn lock_class_prototype<'a>(ast: &AstBuilder<'a>, class_name: &str, anchor: Span) -> Statement<'a> {
    let mut descriptor = ArenaVec::new_in(ast);
    descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        anchor,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "writable", ast.builder()),
        oxc_ast::ast::Expression::new_boolean_literal(anchor, false, ast.builder()),
        false,
        false,
        false,
        ast.builder(),
    ));
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        ast.allocator().alloc_str(class_name),
        ast.builder(),
    )));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(anchor, "prototype", None, ast.builder()),
    ));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
    ));
    oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        object_define_property_call(ast, anchor, arguments),
        ast.builder(),
    )
}

fn private_accessor_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    accessor: &PrivateAccessorPlan<'a>,
) -> Statement<'a> {
    let anchor = accessor.span;
    let target = if accessor.is_static {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(class_name),
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder())
    };
    let mut descriptor = ArenaVec::new_in(ast);
    if let Some(get) = accessor.get.as_ref() {
        descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "get", ast.builder()),
            Expression::FunctionExpression(get.clone_in(ast.allocator())),
            false,
            false,
            false,
            ast.builder(),
        ));
    }
    if let Some(set) = accessor.set.as_ref() {
        descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "set", ast.builder()),
            Expression::FunctionExpression(set.clone_in(ast.allocator())),
            false,
            false,
            false,
            ast.builder(),
        ));
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(target));
    arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        ast.allocator().alloc_str(&accessor.key),
        ast.builder(),
    )));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
    ));
    oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        object_define_property_call(ast, anchor, arguments),
        ast.builder(),
    )
}

fn auto_accessor_methods<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    accessor: AccessorProperty<'a>,
    backing: &str,
) -> (
    oxc_ast::ast::MethodDefinition<'a>,
    oxc_ast::ast::MethodDefinition<'a>,
) {
    let anchor = accessor.span;
    let target = || {
        if accessor.r#static {
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(class_name),
                ast.builder(),
            )
        } else {
            oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder())
        }
    };
    let backing_member = || {
        oxc_ast::ast::MemberExpression::new_computed_member_expression(
            anchor,
            target(),
            oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(backing),
                ast.builder(),
            ),
            false,
            ast.builder(),
        )
    };
    let mut getter_statements = ArenaVec::new_in(ast);
    getter_statements.push(oxc_ast::ast::Statement::new_return_statement(
        anchor,
        Some(Expression::from(backing_member())),
        ast.builder(),
    ));
    let getter = oxc_ast::ast::Function::boxed(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            anchor,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            getter_statements,
            ast.builder(),
        )),
        ast.builder(),
    );
    let value_name = ast.allocator().alloc_str("value");
    let mut setter_params = ArenaVec::new_in(ast);
    setter_params.push(oxc_ast::ast::FormalParameter::new(
        anchor,
        ArenaVec::new_in(ast),
        oxc_ast::ast::BindingPattern::new_binding_identifier(anchor, value_name, ast.builder()),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        None::<ArenaBox<'a, Expression<'a>>>,
        false,
        None,
        false,
        false,
        ast.builder(),
    ));
    let mut setter_statements = ArenaVec::new_in(ast);
    setter_statements.push(oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            AssignmentOperator::Assign,
            AssignmentTarget::from(backing_member()),
            oxc_ast::ast::Expression::new_identifier(anchor, value_name, ast.builder()),
            ast.builder(),
        ),
        ast.builder(),
    ));
    let setter = oxc_ast::ast::Function::boxed(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            anchor,
            FormalParameterKind::FormalParameter,
            setter_params,
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            setter_statements,
            ast.builder(),
        )),
        ast.builder(),
    );
    let get = oxc_ast::ast::MethodDefinition::new(
        anchor,
        MethodDefinitionType::MethodDefinition,
        ArenaVec::new_in(ast),
        accessor.key.clone_in(ast.allocator()),
        getter,
        MethodDefinitionKind::Get,
        accessor.computed,
        accessor.r#static,
        false,
        false,
        None,
        ast.builder(),
    );
    let set = oxc_ast::ast::MethodDefinition::new(
        anchor,
        MethodDefinitionType::MethodDefinition,
        ArenaVec::new_in(ast),
        accessor.key,
        setter,
        MethodDefinitionKind::Set,
        accessor.computed,
        accessor.r#static,
        false,
        false,
        None,
        ast.builder(),
    );
    (get, set)
}

fn private_element_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    key_name: &str,
    value: Option<Expression<'a>>,
    is_static: bool,
    writable: bool,
    anchor: Span,
) -> Statement<'a> {
    let target = if is_static {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(class_name),
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder())
    };
    let value = value.unwrap_or_else(|| super::void_zero(ast, anchor));
    let mut descriptor = ArenaVec::new_in(ast);
    if writable {
        descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
            anchor,
            PropertyKind::Init,
            oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "writable", ast.builder()),
            oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
            false,
            false,
            false,
            ast.builder(),
        ));
    }
    descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        anchor,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "value", ast.builder()),
        value,
        false,
        false,
        false,
        ast.builder(),
    ));
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(target));
    arguments.push(Argument::from(oxc_ast::ast::Expression::new_identifier(
        anchor,
        ast.allocator().alloc_str(key_name),
        ast.builder(),
    )));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
    ));
    oxc_ast::ast::Statement::new_expression_statement(
        anchor,
        object_define_property_call(ast, anchor, arguments),
        ast.builder(),
    )
}

fn public_field_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    mut property: oxc_ast::ast::PropertyDefinition<'a>,
    computed_binding: Option<&str>,
    loose: bool,
    generated_span: Span,
) -> Result<(bool, Statement<'a>), &'static str> {
    let anchor = generated_span;
    let (key_span, key_name, computed_key) = if let Some(binding) = computed_binding {
        (
            anchor,
            None,
            Some(oxc_ast::ast::Expression::new_identifier(
                anchor,
                ast.allocator().alloc_str(binding),
                ast.builder(),
            )),
        )
    } else if let PropertyKey::StaticIdentifier(key) = property.key {
        (anchor, Some(key.name), None)
    } else {
        let key_span = property.key.span();
        if matches!(property.key, PropertyKey::PrivateIdentifier(_)) {
            return Err("classes-direct-field-key-mismatch");
        }
        (
            key_span,
            None,
            Some(property.key.take_in(ast).into_expression()),
        )
    };
    let target = if property.r#static {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(class_name),
            ast.builder(),
        )
    } else {
        oxc_ast::ast::Expression::new_this_expression(anchor, ast.builder())
    };
    let mut value = property
        .value
        .unwrap_or_else(|| super::void_zero(ast, anchor));
    super::clear_leading_pure_annotation(&mut value);
    let expression = if loose
        && !(property.r#static
            && key_name.is_some_and(|key| matches!(key.as_str(), "name" | "length")))
    {
        let member = if let Some(key) = computed_key {
            oxc_ast::ast::MemberExpression::new_computed_member_expression(
                anchor,
                target,
                key,
                false,
                ast.builder(),
            )
            .into()
        } else {
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                anchor,
                target,
                oxc_ast::ast::IdentifierName::new(key_span, key_name.unwrap(), ast.builder()),
                false,
                ast.builder(),
            )
            .into()
        };
        oxc_ast::ast::Expression::new_assignment_expression(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            member,
            value,
            ast.builder(),
        )
    } else {
        let mut descriptor = ArenaVec::new_in(ast);
        for (name, value) in [
            ("value", value),
            (
                "enumerable",
                oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
            ),
            (
                "configurable",
                oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
            ),
            (
                "writable",
                oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
            ),
        ] {
            descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
                anchor,
                PropertyKind::Init,
                oxc_ast::ast::PropertyKey::new_static_identifier(anchor, name, ast.builder()),
                value,
                false,
                false,
                false,
                ast.builder(),
            ));
        }
        let mut arguments = ArenaVec::new_in(ast);
        arguments.push(Argument::from(target));
        arguments.push(Argument::from(if let Some(key) = computed_key {
            key
        } else {
            oxc_ast::ast::Expression::new_string_literal(
                key_span,
                key_name.unwrap(),
                None,
                ast.builder(),
            )
        }));
        arguments.push(Argument::from(
            oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
        ));
        object_define_property_call(ast, anchor, arguments)
    };
    Ok((
        property.r#static,
        oxc_ast::ast::Statement::new_expression_statement(anchor, expression, ast.builder()),
    ))
}

fn class_call_guard<'a>(ast: &AstBuilder<'a>, _name: &str, anchor: Span) -> Statement<'a> {
    let test = oxc_ast::ast::Expression::new_unary_expression(
        anchor,
        oxc_syntax::operator::UnaryOperator::LogicalNot,
        oxc_ast::ast::Expression::new_new_target(anchor, ast.builder()),
        ast.builder(),
    );
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(
            anchor,
            "Cannot call a class as a function",
            None,
            ast.builder(),
        ),
    ));
    let error = oxc_ast::ast::Expression::new_new_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(anchor, "TypeError", ast.builder()),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        ast.builder(),
    );
    oxc_ast::ast::Statement::new_if_statement(
        anchor,
        test,
        oxc_ast::ast::Statement::new_throw_statement(anchor, error, ast.builder()),
        None,
        ast.builder(),
    )
}

fn method_construct_guard<'a>(ast: &AstBuilder<'a>, anchor: Span) -> Statement<'a> {
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(
            anchor,
            "Class methods cannot be invoked with 'new'",
            None,
            ast.builder(),
        ),
    ));
    let error = oxc_ast::ast::Expression::new_new_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(anchor, "TypeError", ast.builder()),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        ast.builder(),
    );
    oxc_ast::ast::Statement::new_if_statement(
        anchor,
        oxc_ast::ast::Expression::new_new_target(anchor, ast.builder()),
        oxc_ast::ast::Statement::new_throw_statement(anchor, error, ast.builder()),
        None,
        ast.builder(),
    )
}

fn set_function_name<'a>(
    ast: &AstBuilder<'a>,
    function: Expression<'a>,
    name: Expression<'a>,
    anchor: Span,
) -> Expression<'a> {
    let mut descriptor = ArenaVec::new_in(ast);
    descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        anchor,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "value", ast.builder()),
        name,
        false,
        false,
        false,
        ast.builder(),
    ));
    descriptor.push(oxc_ast::ast::ObjectPropertyKind::new_object_property(
        anchor,
        PropertyKind::Init,
        oxc_ast::ast::PropertyKey::new_static_identifier(anchor, "configurable", ast.builder()),
        oxc_ast::ast::Expression::new_boolean_literal(anchor, true, ast.builder()),
        false,
        false,
        false,
        ast.builder(),
    ));
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(function));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_string_literal(anchor, "name", None, ast.builder()),
    ));
    arguments.push(Argument::from(
        oxc_ast::ast::Expression::new_object_expression(anchor, descriptor, ast.builder()),
    ));
    object_define_property_call(ast, anchor, arguments)
}

fn computed_function_name<'a>(
    ast: &AstBuilder<'a>,
    key_name: &str,
    kind: MethodDefinitionKind,
    anchor: Span,
) -> Expression<'a> {
    let key = || {
        oxc_ast::ast::Expression::new_identifier(
            anchor,
            ast.allocator().alloc_str(key_name),
            ast.builder(),
        )
    };
    // Native computed-property naming reads the symbol's internal description,
    // rather than invoking a replaceable Symbol.prototype.description getter.
    let function = oxc_ast::ast::Expression::new_function_expression(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        oxc_ast::ast::FormalParameters::boxed(
            anchor,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ast.builder(),
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(oxc_ast::ast::FunctionBody::boxed(
            anchor,
            ArenaVec::new_in(ast),
            ArenaVec::new_in(ast),
            ast.builder(),
        )),
        ast.builder(),
    );
    let named = oxc_ast::ast::Expression::new_object_expression(
        anchor,
        oxc_allocator::Vec::from_array_in(
            [oxc_ast::ast::ObjectPropertyKind::new_object_property(
                anchor,
                PropertyKind::Init,
                PropertyKey::from(key()),
                function,
                false,
                false,
                true,
                ast.builder(),
            )],
            ast.builder(),
        ),
        ast.builder(),
    );
    let symbol_name = Expression::from(
        oxc_ast::ast::MemberExpression::new_static_member_expression(
            anchor,
            Expression::from(
                oxc_ast::ast::MemberExpression::new_computed_member_expression(
                    anchor,
                    named,
                    key(),
                    false,
                    ast.builder(),
                ),
            ),
            oxc_ast::ast::IdentifierName::new(anchor, "name", ast.builder()),
            false,
            ast.builder(),
        ),
    );
    let mut string_arguments = ArenaVec::new_in(ast);
    string_arguments.push(Argument::from(key()));
    let ordinary_name = oxc_ast::ast::Expression::new_call_expression(
        anchor,
        oxc_ast::ast::Expression::new_identifier(anchor, "String", ast.builder()),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        string_arguments,
        false,
        ast.builder(),
    );
    let base = oxc_ast::ast::Expression::new_conditional_expression(
        anchor,
        oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            oxc_ast::ast::Expression::new_unary_expression(
                anchor,
                oxc_syntax::operator::UnaryOperator::Typeof,
                key(),
                ast.builder(),
            ),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            oxc_ast::ast::Expression::new_string_literal(anchor, "symbol", None, ast.builder()),
            ast.builder(),
        ),
        symbol_name,
        ordinary_name,
        ast.builder(),
    );
    match kind {
        MethodDefinitionKind::Get => oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            oxc_ast::ast::Expression::new_string_literal(anchor, "get ", None, ast.builder()),
            oxc_syntax::operator::BinaryOperator::Addition,
            base,
            ast.builder(),
        ),
        MethodDefinitionKind::Set => oxc_ast::ast::Expression::new_binary_expression(
            anchor,
            oxc_ast::ast::Expression::new_string_literal(anchor, "set ", None, ast.builder()),
            oxc_syntax::operator::BinaryOperator::Addition,
            base,
            ast.builder(),
        ),
        _ => base,
    }
}

fn local_name(base: &str, reserved: &FxHashSet<String>) -> String {
    if !reserved.contains(base) {
        return base.to_string();
    }
    for suffix in 2.. {
        let candidate = format!("{base}{suffix}");
        if !reserved.contains(&candidate) {
            return candidate;
        }
    }
    unreachable!()
}

fn reserve(base: &str, reserved: &mut FxHashSet<String>) -> String {
    super::reserve_generated_name(base, reserved)
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_codegen::Codegen;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;
    use std::path::Path;

    #[test]
    fn classes_and_computed_keys_distinguish_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let source =
            "class A { [first()]() {} [second()]() {} accessor a=1; accessor b=2; } class B {}";
        let allocator = Allocator::default();
        let mut parsed = Parser::new(&allocator, source, SourceType::default()).parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare_ast(
            &semantic.semantic,
            true,
            Some(true),
            false,
            Some(true),
            Some(true),
            true,
        )
        .unwrap();
        assert_eq!(plan.direct.len(), 2);
        let keys = plan
            .direct
            .values()
            .flat_map(|class| class.computed_keys.values().cloned())
            .collect::<Vec<_>>();
        assert_eq!(keys.len(), 2);
        assert_ne!(keys[0], keys[1]);
        let backing = plan
            .direct
            .values()
            .flat_map(|class| {
                class
                    .private_keys
                    .values()
                    .map(|(binding, _)| binding.clone())
            })
            .collect::<Vec<_>>();
        assert_eq!(backing.len(), 2);
        assert_ne!(backing[0], backing[1]);
        drop(semantic);
        assert!(run_ast(&allocator, &mut parsed.program, plan).unwrap().0);
        let code = Codegen::new().build(&parsed.program).code;
        assert!(!code.contains("class A"), "{code}");
        assert!(!code.contains("class B"), "{code}");
        assert_eq!(code.matches("first()").count(), 1, "{code}");
        assert_eq!(code.matches("second()").count(), 1, "{code}");
        for key in keys {
            assert!(code.contains(&format!("A.prototype, {key},")), "{code}");
        }
        for binding in backing {
            assert!(code.contains(&format!("this[{binding}]")), "{code}");
        }
    }

    #[test]
    fn superclass_parameters_are_unique_with_shared_source_anchors() {
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        let allocator = Allocator::default();
        let mut parsed = Parser::new(
            &allocator,
            "class A extends Base { read(){return __nox_super_0_0;} } class B extends A {}",
            SourceType::default(),
        )
        .parse();
        SharedAnchors.visit_program(&mut parsed.program);
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let plan = prepare_ast(&semantic.semantic, true, None, false, None, None, true).unwrap();
        let parameters = plan
            .direct
            .values()
            .filter_map(|plan| plan.super_name.as_deref())
            .collect::<Vec<_>>();
        assert_eq!(parameters.len(), 2);
        assert_ne!(parameters[0], parameters[1]);
        assert!(parameters.iter().all(|name| *name != "__nox_super_0_0"));
        drop(semantic);
        assert!(run_ast(&allocator, &mut parsed.program, plan).unwrap().0);
        let code = Codegen::new().build(&parsed.program).code;
        assert!(code.contains("return __nox_super_0_0;"), "{code}");
    }

    #[test]
    fn class_declaration_mutates_in_place() {
        let source = "class Value {}";
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(&semantic.semantic, true, None, false, None, None, false).unwrap();
        assert_eq!(plan.direct.len(), 1);
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(!code.contains("class Value"));
        assert!(code.contains("let Value"), "{code}");
    }

    #[test]
    fn default_class_exports_the_preserved_outer_binding() {
        let source = "export default class DOMException extends Error { #name; }";
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let mut plan = prepare_ast(
            &semantic.semantic,
            true,
            Some(true),
            false,
            Some(true),
            Some(true),
            false,
        )
        .unwrap();
        let class = plan.direct.values_mut().next().unwrap();
        class.name = "_DOMException".to_owned();
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(code.contains("let DOMException"), "{code}");
        assert!(code.contains("export default DOMException"), "{code}");
        assert!(!code.contains("export default _DOMException"), "{code}");
    }

    #[test]
    fn sibling_class_facts_preserve_all_classes() {
        let source = (0..128)
            .map(|index| format!("class C{index} {{ method() {{ return super.value; }} }}"))
            .collect::<String>();
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            &source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&parsed.program);
        let facts = collect_class_facts(&semantic.semantic);
        assert_eq!(facts.len(), 128);
        assert!(
            facts
                .values()
                .all(|facts| facts.super_reference_ids.len() == 1)
        );
    }

    #[test]
    fn nested_class_facts_belong_to_the_nearest_class() {
        let source = "class Outer extends Base { method(){ super.x; return class Inner extends Base { method(){ super.y; return #value in this; } #value; }; } }";
        struct SharedAnchors;
        impl<'a> VisitMut<'a> for SharedAnchors {
            fn visit_span(&mut self, span: &mut Span) {
                *span = Span::default();
            }
        }
        for shared_anchors in [false, true] {
            let allocator = Allocator::default();
            let mut parsed = Parser::new(
                &allocator,
                source,
                SourceType::from_path(Path::new("x.js")).unwrap(),
            )
            .parse();
            if shared_anchors {
                SharedAnchors.visit_program(&mut parsed.program);
            }
            let semantic = SemanticBuilder::new()
                .with_build_nodes(true)
                .build(&parsed.program);
            let mut facts = collect_class_facts(&semantic.semantic)
                .into_values()
                .map(|facts| {
                    (
                        facts.super_reference_ids.len(),
                        facts.has_private_in,
                        facts.uses_private_helper,
                    )
                })
                .collect::<Vec<_>>();
            facts.sort_unstable();
            assert_eq!(facts, [(1, false, false), (1, true, false)]);
        }
    }

    #[test]
    fn private_accessor_pairing_handles_large_classes() {
        let accessors = (0..128)
            .map(|index| {
                format!(
                    "get #value{index}(){{return {index}}} set #value{index}(value){{sink(value)}}"
                )
            })
            .collect::<String>();
        let source = format!("class Values {{ {accessors} }}");
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            &source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(
            &semantic.semantic,
            true,
            None,
            false,
            Some(true),
            None,
            false,
        )
        .unwrap();
        assert!(run_ast(&allocator, &mut program, plan).unwrap().0);
    }

    #[test]
    fn static_and_instance_private_accessors_remain_distinct() {
        let source = "class Values { static get #value(){ return 1 } get #value(){ return 2 } }";
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
        let mut program = parsed.program;
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&program);
        let plan = prepare_ast(
            &semantic.semantic,
            true,
            None,
            false,
            Some(true),
            None,
            false,
        )
        .unwrap();
        assert!(run_ast(&allocator, &mut program, plan).unwrap().0);
    }
}
