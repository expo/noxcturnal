use oxc_allocator::{Allocator, Box as ArenaBox, CloneIn, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder, AstKind,
    ast::{
        Argument, ArrayExpressionElement, AssignmentTarget, Class, ClassElement, Declaration,
        ExportDefaultDeclaration, ExportDefaultDeclarationKind, ExportNamedDeclaration, Expression,
        FormalParameterKind, FormalParameterRest, Function, FunctionType, MethodDefinitionKind,
        Program, PropertyKey, PropertyKind, SimpleAssignmentTarget, Statement, TSThisParameter,
        TSTypeAnnotation, TSTypeParameterDeclaration, TSTypeParameterInstantiation,
        VariableDeclaration, VariableDeclarationKind,
    },
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
#[cfg(test)]
use oxc_parser::Parser;
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, SourceType, Span};
use oxc_syntax::scope::ScopeFlags;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::generated::inline_helpers::{
    INLINE_CLASS_CONSTRUCT_HELPER, INLINE_CLASS_CONSTRUCT_HELPER_BINDINGS,
    INLINE_CLASS_CONSTRUCT_HELPER_PRETTY, INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME,
    INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME_BINDINGS, INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME_PRETTY,
    INLINE_CLASS_PRIVATE_HELPERS, INLINE_CLASS_PRIVATE_HELPERS_BINDINGS,
    INLINE_CLASS_PRIVATE_HELPERS_PRETTY, INLINE_CLASS_PRIVATE_HELPERS_RUNTIME,
    INLINE_CLASS_PRIVATE_HELPERS_RUNTIME_BINDINGS, INLINE_CLASS_PRIVATE_HELPERS_RUNTIME_PRETTY,
    INLINE_CLASS_SUPER_GET_HELPER, INLINE_CLASS_SUPER_GET_HELPER_BINDINGS,
    INLINE_CLASS_SUPER_GET_HELPER_PRETTY, INLINE_CLASS_SUPER_GET_HELPER_RUNTIME,
    INLINE_CLASS_SUPER_GET_HELPER_RUNTIME_BINDINGS, INLINE_CLASS_SUPER_GET_HELPER_RUNTIME_PRETTY,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct AstPlan {
    direct: FxHashMap<(u32, u32), DirectClassPlan>,
    helper_requests: CustomHelperRequests,
}

struct DirectClassPlan {
    name: String,
    super_name: Option<String>,
    receiver_name: Option<String>,
    result_name: Option<String>,
    new_target_name: Option<String>,
    super_call_name: Option<String>,
    private_keys: FxHashMap<String, (String, String)>,
    computed_keys: FxHashMap<(u32, u32), String>,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    helper_names: ClassHelperNames,
    uses_super_get: bool,
    uses_private_helper: bool,
}

#[derive(Default)]
struct ClassFacts {
    super_reference_ids: Vec<NodeId>,
    has_private_in: bool,
    uses_private_helper: bool,
}

fn collect_class_facts(semantic: &Semantic<'_>) -> FxHashMap<NodeId, ClassFacts> {
    let mut facts = FxHashMap::default();
    let mut active = Vec::<(NodeId, u32)>::new();
    for (node_id, node) in semantic.nodes().iter_enumerated() {
        let start = node.kind().span().start;
        while active.last().is_some_and(|(_, end)| start >= *end) {
            active.pop();
        }
        if let AstKind::Class(class) = node.kind() {
            facts.insert(node_id, ClassFacts::default());
            active.push((node_id, class.span.end));
            continue;
        }
        let Some((class_id, _)) = active.last() else {
            continue;
        };
        let class_facts = facts.get_mut(class_id).unwrap();
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
    private_base: String,
    private_call: String,
    private_runtime: String,
}

impl AstPlan {
    pub(super) fn is_empty(&self) -> bool {
        self.direct.is_empty()
    }
}

fn class_helper_requests(
    names: &ClassHelperNames,
    construct: bool,
    super_get: bool,
    private: bool,
    inline: bool,
) -> CustomHelperRequests {
    let mut requests = CustomHelperRequests::default();
    if private {
        requests.request("classPrivateFieldLooseBase");
        let (compact, pretty, bindings) = if inline {
            (
                INLINE_CLASS_PRIVATE_HELPERS,
                INLINE_CLASS_PRIVATE_HELPERS_PRETTY,
                INLINE_CLASS_PRIVATE_HELPERS_BINDINGS,
            )
        } else {
            (
                INLINE_CLASS_PRIVATE_HELPERS_RUNTIME,
                INLINE_CLASS_PRIVATE_HELPERS_RUNTIME_PRETTY,
                INLINE_CLASS_PRIVATE_HELPERS_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace(
                    "_classPrivateFieldLooseBase2",
                    "__BABEL_PRIVATE_FIELD_LOOSE_BASE_RUNTIME__",
                )
                .replace("_classPrivateFieldLooseBase", &names.private_base)
                .replace("_classPrivateMethodCall", &names.private_call)
                .replace(
                    "__BABEL_PRIVATE_FIELD_LOOSE_BASE_RUNTIME__",
                    &names.private_runtime,
                )
        };
        requests.push_fragment(rewrite(compact), rewrite(pretty));
        requests.reserve_scope_names(bindings.iter().map(|binding| rewrite(binding)));
    }
    if construct {
        requests.request("construct");
        let (compact, pretty, bindings) = if inline {
            (
                INLINE_CLASS_CONSTRUCT_HELPER,
                INLINE_CLASS_CONSTRUCT_HELPER_PRETTY,
                INLINE_CLASS_CONSTRUCT_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME,
                INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME_PRETTY,
                INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace("_construct2", "__BABEL_CONSTRUCT_RUNTIME__")
                .replace("_construct", &names.construct)
                .replace("__BABEL_CONSTRUCT_RUNTIME__", &names.construct_runtime)
        };
        requests.push_fragment(rewrite(compact), rewrite(pretty));
        requests.reserve_scope_names(bindings.iter().map(|binding| rewrite(binding)));
    }
    if super_get {
        requests.request("get");
        let (compact, pretty, bindings) = if inline {
            (
                INLINE_CLASS_SUPER_GET_HELPER,
                INLINE_CLASS_SUPER_GET_HELPER_PRETTY,
                INLINE_CLASS_SUPER_GET_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_CLASS_SUPER_GET_HELPER_RUNTIME,
                INLINE_CLASS_SUPER_GET_HELPER_RUNTIME_PRETTY,
                INLINE_CLASS_SUPER_GET_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace("_get2", "__BABEL_GET_RUNTIME__")
                .replace("_get", &names.super_get)
                .replace("__BABEL_GET_RUNTIME__", &names.super_get_runtime)
        };
        requests.push_fragment(rewrite(compact), rewrite(pretty));
        requests.reserve_scope_names(bindings.iter().map(|binding| rewrite(binding)));
    }
    requests
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
) -> FxHashMap<(u32, u32), DirectClassPlan> {
    let nodes = semantic.nodes();
    let mut direct = FxHashMap::default();
    for (node_id, node) in nodes.iter_enumerated() {
        let AstKind::Class(class) = node.kind() else {
            continue;
        };
        let derived = class.super_class.is_some();
        let class_facts = &facts[&node_id];
        let own_super_reference_ids = &class_facts.super_reference_ids;
        let unsupported_super_reference = own_super_reference_ids.iter().any(|super_id| {
            let parent_id = nodes.parent_id(*super_id);
            match nodes.kind(parent_id) {
                AstKind::CallExpression(_) => false,
                AstKind::StaticMemberExpression(_) | AstKind::ComputedMemberExpression(_) => {
                    match nodes.parent_kind(parent_id) {
                        AstKind::AssignmentExpression(assignment) => {
                            !assignment.operator.is_assign()
                                && assignment.operator.to_binary_operator().is_none()
                                && !assignment.operator.is_logical()
                        }
                        AstKind::UpdateExpression(_) => false,
                        _ => false,
                    }
                }
                _ => true,
            }
        });
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
        let has_private_fields = class.body.body.iter().any(|element| {
            matches!(
                element,
                ClassElement::PropertyDefinition(property)
                    if matches!(property.key, PropertyKey::PrivateIdentifier(_))
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
        if !lower_all_classes && !owned_by_focused_private {
            continue;
        }
        if !class.decorators.is_empty()
            || (derived
                && ((constructor.is_some() && !supported_derived_constructor)
                    || unsupported_super_reference))
            || class.body.body.iter().any(|element| match element {
                ClassElement::MethodDefinition(method) => {
                    !method.decorators.is_empty()
                        || (matches!(method.key, PropertyKey::PrivateIdentifier(_))
                            && private_methods_loose != Some(true))
                }
                ClassElement::PropertyDefinition(_) => class_properties_loose.is_none(),
                ClassElement::StaticBlock(_) => !class_static_blocks,
                ClassElement::TSIndexSignature(_) => false,
                _ => true,
            })
        {
            continue;
        }
        if (has_private_fields && class_properties_loose != Some(true))
            || (has_private_methods && private_methods_loose != Some(true))
            || (has_private_in && private_in_loose != Some(true))
        {
            continue;
        }
        let name = class.id.as_ref().map_or_else(
            || reserve("_Class", reserved),
            |identifier| identifier.name.to_string(),
        );
        // This is an internal placeholder that is replaced with the original
        // heritage expression after lowering. It must not consume `_super`:
        // the legacy general-derived template reserves that spelling for its
        // local constructor thunk.
        let super_name =
            derived.then(|| format!("__nox_super_{}_{}", class.span.start, class.span.end));
        let receiver_name = derived.then(|| local_name("_this", reserved));
        let result_name =
            (derived && constructor.is_some()).then(|| local_name("_result", reserved));
        let generic_derived = constructor
            .and_then(|constructor| constructor.value.body.as_ref())
            .is_some_and(|body| !has_single_leading_super(body));
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
                    computed_keys.insert(
                        (property.span.start, property.span.end),
                        reserve("_key", reserved),
                    );
                }
                ClassElement::MethodDefinition(method) if method.computed => {
                    computed_keys.insert(
                        (method.span.start, method.span.end),
                        reserve("_key", reserved),
                    );
                }
                _ => {}
            }
        }
        direct.insert(
            (class.span.start, class.span.end),
            DirectClassPlan {
                name,
                super_name,
                receiver_name,
                result_name,
                new_target_name,
                super_call_name,
                private_keys,
                computed_keys,
                class_properties_loose,
                class_static_blocks,
                helper_names: helper_names.clone(),
                uses_super_get,
                uses_private_helper,
            },
        );
    }
    direct
}

#[expect(clippy::too_many_arguments)]
pub(super) fn prepare_ast(
    _source: &str,
    _source_type: SourceType,
    semantic: &Semantic<'_>,
    lower_all_classes: bool,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    private_methods_loose: Option<bool>,
    private_in_loose: Option<bool>,
    inline_helpers: bool,
    _lower_captured_loops: bool,
) -> Result<AstPlan, &'static str> {
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
        private_base: reserve("_classPrivateFieldLooseBase", &mut reserved),
        private_call: reserve("_classPrivateMethodCall", &mut reserved),
        private_runtime: reserve("_classPrivateFieldLooseBase2", &mut reserved),
    };
    let class_facts = collect_class_facts(semantic);
    let direct = direct_class_candidates(
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
    let direct_spans = direct.keys().copied().collect::<FxHashSet<_>>();
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
            || direct_spans.contains(&(class.span.start, class.span.end))
        {
            continue;
        }
        if private_methods_loose == Some(false) || private_in_loose == Some(false) {
            return Err("classes-spec-private-features-not-implemented");
        }
        if !class.decorators.is_empty()
            || class.body.body.iter().any(|element| match element {
                ClassElement::MethodDefinition(method) => !method.decorators.is_empty(),
                _ => false,
            })
        {
            return Err("classes-decorators-not-implemented");
        }
        return Err("classes-direct-shape-not-implemented");
    }
    let uses_construct = direct.values().any(|plan| plan.super_name.is_some());
    let uses_super_get = direct.values().any(|plan| plan.uses_super_get);
    let uses_private = direct.values().any(|plan| plan.uses_private_helper);
    let helper_requests = class_helper_requests(
        &helper_names,
        uses_construct,
        uses_super_get,
        uses_private,
        inline_helpers,
    );
    Ok(AstPlan {
        direct,
        helper_requests,
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
        changed: false,
        error: None,
    };
    pass.visit_program(program);
    if let Some(error) = pass.error {
        return Err(error);
    }
    if !pass.direct.is_empty() {
        return Err("classes-direct-ast-target-missing");
    }
    Ok((pass.changed, plan.helper_requests))
}

struct ClassAstLowerer<'a> {
    allocator: &'a Allocator,
    direct: FxHashMap<(u32, u32), DirectClassPlan>,
    changed: bool,
    error: Option<&'static str>,
}

impl<'a> VisitMut<'a> for ClassAstLowerer<'a> {
    #[expect(deprecated)]
    fn visit_statements(&mut self, statements: &mut ArenaVec<'a, Statement<'a>>) {
        let mut index = 0;
        while index < statements.len() {
            let span = statements[index].span();
            let default_class_span = match &statements[index] {
                Statement::ExportDefaultDeclaration(declaration) => {
                    match &declaration.declaration {
                        ExportDefaultDeclarationKind::ClassDeclaration(class) => Some(class.span),
                        _ => None,
                    }
                }
                _ => None,
            };
            if let Some(class_span) = default_class_span
                && let Some(plan) = self.direct.remove(&(class_span.start, class_span.end))
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
                self.visit_class(&mut class);
                if self.error.is_some() {
                    return;
                }
                match lower_simple_class(self.allocator, class, &plan) {
                    Ok(expression) => {
                        declaration.declaration =
                            ExportDefaultDeclarationKind::from(ast.expression_identifier(
                                class_span,
                                self.allocator.alloc_str(&plan.name),
                            ));
                        statements[index] = Statement::VariableDeclaration(direct_class_variable(
                            // Preserve the export statement's start so comments
                            // attached to `export default class` stay with the
                            // lowered class rather than the trailing export.
                            &ast, span, &plan.name, expression,
                        ));
                        statements.insert(
                            index + 1,
                            Statement::ExportDefaultDeclaration(ast.alloc(declaration)),
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
                && let Some(plan) = self.direct.remove(&(span.start, span.end))
            {
                let ast = AstBuilder::new(self.allocator);
                let Statement::ClassDeclaration(class) = statements[index].take_in(&ast) else {
                    unreachable!();
                };
                let mut class = class.unbox();
                self.visit_class(&mut class);
                if self.error.is_some() {
                    return;
                }
                match lower_simple_class(self.allocator, class, &plan) {
                    Ok(expression) => {
                        statements[index] = Statement::VariableDeclaration(direct_class_variable(
                            &ast, span, &plan.name, expression,
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
        let span = expression.span();
        if matches!(expression, Expression::ClassExpression(_))
            && let Some(plan) = self.direct.remove(&(span.start, span.end))
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
            match lower_simple_class(self.allocator, class, &plan) {
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
        let span = class.span;
        let Some(plan) = self.direct.remove(&(span.start, span.end)) else {
            walk_mut::walk_export_default_declaration(self, declaration);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let mut class = class.take_in(&ast);
        self.visit_class(&mut class);
        if self.error.is_some() {
            return;
        }
        match lower_simple_class(self.allocator, class, &plan) {
            Ok(expression) => {
                declaration.declaration = ExportDefaultDeclarationKind::from(expression);
                self.changed = true;
            }
            Err(error) => self.error = Some(error),
        }
    }

    fn visit_export_named_declaration(&mut self, declaration: &mut ExportNamedDeclaration<'a>) {
        let Some(Declaration::ClassDeclaration(class)) = &mut declaration.declaration else {
            walk_mut::walk_export_named_declaration(self, declaration);
            return;
        };
        let span = class.span;
        let Some(plan) = self.direct.remove(&(span.start, span.end)) else {
            walk_mut::walk_export_named_declaration(self, declaration);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let mut class = class.take_in(&ast);
        self.visit_class(&mut class);
        if self.error.is_some() {
            return;
        }
        match lower_simple_class(self.allocator, class, &plan) {
            Ok(expression) => {
                declaration.declaration = Some(Declaration::VariableDeclaration(
                    direct_class_variable(&ast, span, &plan.name, expression),
                ));
                self.changed = true;
            }
            Err(error) => self.error = Some(error),
        }
    }
}

#[expect(deprecated)]
fn direct_class_variable<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    name: &str,
    expression: Expression<'a>,
) -> ArenaBox<'a, VariableDeclaration<'a>> {
    let mut declarations = ArenaVec::new_in(ast);
    declarations.push(ast.variable_declarator(
        span,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(span, ast.allocator.alloc_str(name)),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(expression),
        false,
    ));
    ast.alloc_variable_declaration(span, VariableDeclarationKind::Var, declarations, false)
}

#[expect(deprecated)]
#[expect(clippy::too_many_arguments)]
fn lower_derived_constructor_body<'a>(
    ast: &AstBuilder<'a>,
    function: &mut Function<'a>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    super_get_name: &str,
    receiver_name: &str,
    result_name: &str,
    new_target_name: Option<&str>,
    super_call_name: Option<&str>,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
) -> Result<bool, &'static str> {
    let body = function
        .body
        .as_mut()
        .ok_or("classes-direct-derived-constructor-body-missing")?;
    let mut super_access_rewriter = SuperAccessRewriter {
        allocator: ast.allocator,
        class_name: ast.allocator.alloc_str(class_name),
        get_name: ast.allocator.alloc_str(super_get_name),
        is_static: false,
    };
    for statement in &mut body.statements {
        super_access_rewriter.visit_statement(statement);
    }
    if lower_leading_super_constructor_body(
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
    )? {
        return Ok(false);
    }
    let mut declarations = ArenaVec::new_in(ast);
    declarations.push(ast.variable_declarator(
        anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(receiver_name)),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        None::<Expression<'a>>,
        false,
    ));
    let receiver_declaration = Statement::VariableDeclaration(ast.alloc_variable_declaration(
        anchor,
        VariableDeclarationKind::Var,
        declarations,
        false,
    ));
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
        receiver_declaration,
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

fn has_single_leading_super(body: &oxc_ast::ast::FunctionBody<'_>) -> bool {
    let mut detector = ConstructorShapeDetector {
        super_calls: 0,
        new_target: false,
    };
    detector.visit_function_body(body);
    detector.super_calls == 1
        && body.statements.iter().any(|statement| {
            let expression = match statement {
                Statement::ExpressionStatement(statement) => Some(&statement.expression),
                Statement::ReturnStatement(statement) => statement.argument.as_ref(),
                _ => None,
            };
            match expression {
                Some(Expression::CallExpression(call)) => {
                    matches!(call.callee, Expression::Super(_))
                }
                Some(Expression::SequenceExpression(sequence)) => {
                    sequence.expressions.first().is_some_and(|expression| {
                        matches!(
                            expression,
                            Expression::CallExpression(call)
                                if matches!(call.callee, Expression::Super(_))
                        )
                    })
                }
                _ => false,
            }
        })
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

#[expect(deprecated, clippy::too_many_arguments)]
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
) -> Result<bool, &'static str> {
    let mut counter = SuperCallCounter { count: 0 };
    for statement in &mut body.statements {
        counter.visit_statement(statement);
    }
    if counter.count != 1 {
        return Ok(false);
    }
    let Some(index) = body.statements.iter().position(|statement| {
        let expression = match statement {
            Statement::ExpressionStatement(statement) => Some(&statement.expression),
            Statement::ReturnStatement(statement) => statement.argument.as_ref(),
            _ => None,
        };
        match expression {
            Some(Expression::CallExpression(call)) => {
                matches!(call.callee, Expression::Super(_))
            }
            Some(Expression::SequenceExpression(sequence)) => {
                sequence.expressions.first().is_some_and(|expression| {
                    matches!(
                        expression,
                        Expression::CallExpression(call)
                            if matches!(call.callee, Expression::Super(_))
                    )
                })
            }
            _ => false,
        }
    }) else {
        return Ok(false);
    };
    if let Some(new_target_name) = new_target_name {
        let mut rewriter = NewTargetRewriter {
            allocator: ast.allocator,
            name: ast.allocator.alloc_str(new_target_name),
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
    rewritten.append(&mut body.statements);
    if let Some(new_target_name) = new_target_name {
        rewritten.push(Statement::VariableDeclaration(direct_class_variable(
            ast,
            anchor,
            new_target_name,
            ast.expression_new_target(anchor),
        )));
    }
    rewritten.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            ArenaVec::from_iter_in(
                [ast.variable_declarator(
                    anchor,
                    VariableDeclarationKind::Var,
                    ast.binding_pattern_binding_identifier(
                        anchor,
                        ast.allocator.alloc_str(receiver_name),
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
                )],
                ast,
            ),
            false,
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
            continuation.push(ast.statement_return(anchor, Some(ast.expression_this(anchor))));
        } else {
            continuation.push(ast.statement_return(
                anchor,
                Some(if tail.len() == 1 {
                    tail.pop().unwrap()
                } else {
                    ast.expression_sequence(anchor, tail)
                }),
            ));
        }
    } else if !tail.is_empty() {
        continuation.push(ast.statement_expression(
            anchor,
            if tail.len() == 1 {
                tail.pop().unwrap()
            } else {
                ast.expression_sequence(anchor, tail)
            },
        ));
    }
    continuation.append(&mut after);
    let result_name = ast.allocator.alloc_str(result_name);
    rewritten.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            ArenaVec::from_iter_in(
                [ast.variable_declarator(
                    anchor,
                    VariableDeclarationKind::Var,
                    ast.binding_pattern_binding_identifier(anchor, result_name),
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
                )],
                ast,
            ),
            false,
        ),
    ));
    rewritten.push(possible_constructor_return_statement(
        ast,
        anchor,
        result_name,
    ));
    rewritten.push(ast.statement_return(
        anchor,
        Some(ast.expression_identifier(anchor, ast.allocator.alloc_str(receiver_name))),
    ));
    body.statements = rewritten;
    Ok(true)
}

#[expect(deprecated, clippy::too_many_arguments)]
fn lower_general_derived_constructor_body<'a>(
    ast: &AstBuilder<'a>,
    body: &mut oxc_ast::ast::FunctionBody<'a>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    receiver_name: &str,
    result_name: &str,
    new_target_name: &str,
    super_call_name: &str,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
    _receiver_declaration: Statement<'a>,
) -> Result<(), &'static str> {
    let mut contents = std::mem::replace(&mut body.statements, ArenaVec::new_in(ast));
    let mut super_rewriter = SuperThunkCallRewriter {
        allocator: ast.allocator,
        name: ast.allocator.alloc_str(super_call_name),
    };
    let mut this_rewriter = DerivedThisRewriter {
        allocator: ast.allocator,
        receiver_name: ast.allocator.alloc_str(receiver_name),
    };
    let mut new_target_rewriter = NewTargetRewriter {
        allocator: ast.allocator,
        name: ast.allocator.alloc_str(new_target_name),
    };
    for statement in &mut contents {
        super_rewriter.visit_statement(statement);
        this_rewriter.visit_statement(statement);
        new_target_rewriter.visit_statement(statement);
    }

    let mut declarations = ArenaVec::new_in(ast);
    declarations.push(ast.variable_declarator(
        anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(receiver_name)),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        None::<Expression<'a>>,
        false,
    ));
    declarations.push(ast.variable_declarator(
        anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(new_target_name)),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(ast.expression_new_target(anchor)),
        false,
    ));
    body.statements.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(anchor, VariableDeclarationKind::Var, declarations, false),
    ));

    let mut construct_arguments = ArenaVec::new_in(ast);
    construct_arguments.push(Argument::from(
        ast.expression_identifier(anchor, ast.allocator.alloc_str(super_name)),
    ));
    construct_arguments.push(Argument::from(
        ast.expression_identifier(anchor, "arguments"),
    ));
    construct_arguments.push(Argument::from(ast.expression_logical(
        anchor,
        ast.expression_identifier(anchor, ast.allocator.alloc_str(new_target_name)),
        oxc_syntax::operator::LogicalOperator::Or,
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name)),
    )));
    let construct = ast.expression_call(
        anchor,
        ast.expression_identifier(anchor, ast.allocator.alloc_str(construct_name)),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        construct_arguments,
        false,
    );
    let assignment = ast.statement_expression(
        anchor,
        ast.expression_assignment(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            ast.simple_assignment_target_assignment_target_identifier(
                anchor,
                ast.allocator.alloc_str(receiver_name),
            )
            .into(),
            construct,
        ),
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
    thunk_statements.push(ast.statement_return(
        anchor,
        Some(ast.expression_identifier(anchor, ast.allocator.alloc_str(receiver_name))),
    ));
    body.statements
        .push(Statement::FunctionDeclaration(ast.alloc_function(
            anchor,
            FunctionType::FunctionDeclaration,
            Some(ast.binding_identifier(anchor, ast.allocator.alloc_str(super_call_name))),
            false,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            ast.alloc_formal_parameters(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(ast.alloc_function_body(anchor, ArenaVec::new_in(ast), thunk_statements)),
        )));

    let mut wrapper = ast.expression_function(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        ast.alloc_formal_parameters(
            anchor,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(ast.alloc_function_body(anchor, ArenaVec::new_in(ast), contents)),
    );
    if let Expression::FunctionExpression(function) = &mut wrapper {
        function.pife = true;
    }
    let apply = Expression::from(ast.member_expression_static(
        anchor,
        ast.expression_parenthesized(anchor, wrapper),
        ast.identifier_name(anchor, "apply"),
        false,
    ));
    let mut apply_arguments = ArenaVec::new_in(ast);
    apply_arguments.push(Argument::from(ast.expression_unary(
        anchor,
        oxc_syntax::operator::UnaryOperator::Void,
        ast.expression_numeric_literal(anchor, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
    )));
    apply_arguments.push(Argument::from(
        ast.expression_identifier(anchor, "arguments"),
    ));
    let result = ast.expression_call(
        anchor,
        apply,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        apply_arguments,
        false,
    );
    body.statements
        .push(Statement::VariableDeclaration(direct_class_variable(
            ast,
            anchor,
            result_name,
            result,
        )));
    body.statements.push(possible_constructor_return_statement(
        ast,
        anchor,
        result_name,
    ));

    let undefined = ast.expression_unary(
        anchor,
        oxc_syntax::operator::UnaryOperator::Void,
        ast.expression_numeric_literal(anchor, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
    );
    let mut error_arguments = ArenaVec::new_in(ast);
    error_arguments.push(Argument::from(ast.expression_string_literal(
        anchor,
        "this hasn't been initialised - super() hasn't been called",
        None,
    )));
    body.statements.push(ast.statement_if(
        anchor,
        ast.expression_binary(
            anchor,
            ast.expression_identifier(anchor, ast.allocator.alloc_str(receiver_name)),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            undefined,
        ),
        ast.statement_throw(
            anchor,
            ast.expression_new(
                anchor,
                ast.expression_identifier(anchor, "ReferenceError"),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                error_arguments,
            ),
        ),
        None,
    ));
    body.statements.push(ast.statement_return(
        anchor,
        Some(ast.expression_identifier(anchor, ast.allocator.alloc_str(receiver_name))),
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

#[expect(deprecated)]
fn super_construct_expression<'a>(
    ast: &AstBuilder<'a>,
    mut call: ArenaBox<'a, oxc_ast::ast::CallExpression<'a>>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    new_target_name: Option<&str>,
) -> Expression<'a> {
    let span = call.span;
    let mut elements = ArenaVec::with_capacity_in(call.arguments.len(), ast);
    for argument in call.arguments.drain(..) {
        elements.push(ArrayExpressionElement::from(argument));
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(
        ast.expression_identifier(span, ast.allocator.alloc_str(super_name)),
    ));
    arguments.push(Argument::from(ast.expression_array(span, elements)));
    arguments.push(Argument::from(ast.expression_logical(
        span,
        new_target_name.map_or_else(
            || ast.expression_new_target(span),
            |name| ast.expression_identifier(span, ast.allocator.alloc_str(name)),
        ),
        oxc_syntax::operator::LogicalOperator::Or,
        ast.expression_identifier(span, ast.allocator.alloc_str(class_name)),
    )));
    ast.expression_call(
        span,
        ast.expression_identifier(span, ast.allocator.alloc_str(construct_name)),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
    )
}

#[expect(deprecated)]
fn function_receiver_call_expression<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    statements: ArenaVec<'a, Statement<'a>>,
    receiver_name: &str,
    method: &str,
    pass_arguments: bool,
) -> Expression<'a> {
    let mut function = ast.expression_function(
        span,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        ast.alloc_formal_parameters(
            span,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(ast.alloc_function_body(span, ArenaVec::new_in(ast), statements)),
    );
    if let Expression::FunctionExpression(function) = &mut function {
        function.pife = true;
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(
        ast.expression_identifier(span, ast.allocator.alloc_str(receiver_name)),
    ));
    if pass_arguments {
        arguments.push(Argument::from(ast.expression_identifier(span, "arguments")));
    }
    ast.expression_call(
        span,
        Expression::from(ast.member_expression_static(
            span,
            ast.expression_parenthesized(span, function),
            ast.identifier_name(span, ast.allocator.alloc_str(method)),
            false,
        )),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
    )
}

#[expect(deprecated)]
fn function_receiver_call_statement<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    statements: ArenaVec<'a, Statement<'a>>,
    receiver_name: &str,
    method: &str,
) -> Statement<'a> {
    ast.statement_expression(
        span,
        function_receiver_call_expression(ast, span, statements, receiver_name, method, false),
    )
}

#[expect(deprecated)]
fn possible_constructor_return_statement<'a>(
    ast: &AstBuilder<'a>,
    span: Span,
    result_name: &str,
) -> Statement<'a> {
    let result = || ast.expression_identifier(span, ast.allocator.alloc_str(result_name));
    let undefined = ast.expression_unary(
        span,
        oxc_syntax::operator::UnaryOperator::Void,
        ast.expression_numeric_literal(span, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
    );
    let test = ast.expression_binary(
        span,
        result(),
        oxc_syntax::operator::BinaryOperator::StrictInequality,
        undefined,
    );
    let object = ast.expression_logical(
        span,
        ast.expression_logical(
            span,
            ast.expression_binary(
                span,
                ast.expression_unary(span, oxc_syntax::operator::UnaryOperator::Typeof, result()),
                oxc_syntax::operator::BinaryOperator::StrictEquality,
                ast.expression_string_literal(span, "object", None),
            ),
            oxc_syntax::operator::LogicalOperator::And,
            ast.expression_binary(
                span,
                result(),
                oxc_syntax::operator::BinaryOperator::StrictInequality,
                ast.expression_null_literal(span),
            ),
        ),
        oxc_syntax::operator::LogicalOperator::Or,
        ast.expression_binary(
            span,
            ast.expression_unary(span, oxc_syntax::operator::UnaryOperator::Typeof, result()),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            ast.expression_string_literal(span, "function", None),
        ),
    );
    let valid = ast.statement_if(
        span,
        object,
        ast.statement_return(span, Some(result())),
        None,
    );
    let mut error_arguments = ArenaVec::new_in(ast);
    error_arguments.push(Argument::from(ast.expression_string_literal(
        span,
        "Derived constructors may only return object or undefined",
        None,
    )));
    let invalid = ast.statement_throw(
        span,
        ast.expression_new(
            span,
            ast.expression_identifier(span, "TypeError"),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            error_arguments,
        ),
    );
    ast.statement_if(
        span,
        test,
        ast.statement_block(span, ast.vec_from_array([valid, invalid])),
        None,
    )
}

struct NewTargetRewriter<'a> {
    allocator: &'a Allocator,
    name: &'a str,
}

impl<'a> VisitMut<'a> for NewTargetRewriter<'a> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::NewTarget(_)) {
            *expression =
                AstBuilder::new(self.allocator).expression_identifier(expression.span(), self.name);
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
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if let Expression::CallExpression(call) = expression
            && matches!(call.callee, Expression::Super(_))
        {
            call.callee =
                AstBuilder::new(self.allocator).expression_identifier(call.span, self.name);
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
}

impl<'a> VisitMut<'a> for DerivedThisRewriter<'a> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(expression, Expression::ThisExpression(_)) {
            *expression = AstBuilder::new(self.allocator)
                .expression_identifier(expression.span(), self.receiver_name);
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

struct PrivateLooseRewriter<'a, 'p> {
    allocator: &'a Allocator,
    keys: &'p FxHashMap<String, (String, String)>,
    read_only: &'p FxHashSet<String>,
    base_name: &'a str,
    call_name: &'a str,
}

impl<'a> PrivateLooseRewriter<'a, '_> {
    fn key(&self, name: &str) -> Option<&str> {
        self.keys.get(name).map(|key| key.0.as_str())
    }

    #[expect(deprecated)]
    fn read_only_error(&self, span: Span) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(ast.expression_string_literal(
            span,
            "Attempted to set read only private field",
            None,
        )));
        let mut statements = ArenaVec::new_in(&ast);
        statements.push(ast.statement_throw(
            span,
            ast.expression_new(
                span,
                ast.expression_identifier(span, "TypeError"),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
            ),
        ));
        ast.expression_call(
            span,
            ast.expression_arrow_function(
                span,
                false,
                false,
                None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
                ast.alloc_formal_parameters(
                    span,
                    FormalParameterKind::FormalParameter,
                    ArenaVec::new_in(&ast),
                    None::<ArenaBox<'a, FormalParameterRest<'a>>>,
                ),
                None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
                ast.alloc_function_body(span, ArenaVec::new_in(&ast), statements),
            ),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ArenaVec::new_in(&ast),
            false,
        )
    }

    #[expect(deprecated)]
    fn checked_object(&self, span: Span, object: Expression<'a>, key_name: &str) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(object));
        arguments.push(Argument::from(
            ast.expression_identifier(span, self.allocator.alloc_str(key_name)),
        ));
        ast.expression_call(
            span,
            ast.expression_identifier(span, self.base_name),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        )
    }
}

impl<'a> VisitMut<'a> for PrivateLooseRewriter<'a, '_> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let ast = AstBuilder::new(self.allocator);
        let read_only_write = match expression {
            Expression::AssignmentExpression(assignment) => {
                if let AssignmentTarget::PrivateFieldExpression(field) = &assignment.left {
                    self.read_only.contains(field.field.name.as_str())
                } else {
                    false
                }
            }
            Expression::UpdateExpression(update) => {
                if let SimpleAssignmentTarget::PrivateFieldExpression(field) = &update.argument {
                    self.read_only.contains(field.field.name.as_str())
                } else {
                    false
                }
            }
            _ => false,
        };
        if read_only_write {
            *expression = self.read_only_error(expression.span());
            return;
        }
        if let Expression::CallExpression(call) = expression {
            let span = call.span;
            let optional = call.optional;
            let private_call = if let Expression::PrivateFieldExpression(field) = &mut call.callee {
                self.visit_expression(&mut field.object);
                self.key(field.field.name.as_str())
                    .map(|key| (field.object.take_in(&ast), field.field.span, key.to_owned()))
            } else {
                None
            };
            let Some((receiver, key_span, key)) = private_call else {
                walk_mut::walk_expression(self, expression);
                return;
            };
            for argument in &mut call.arguments {
                self.visit_argument(argument);
            }
            let mut elements = ArenaVec::with_capacity_in(call.arguments.len(), &ast);
            for argument in call.arguments.drain(..) {
                elements.push(ArrayExpressionElement::from(argument));
            }
            let mut arguments = ArenaVec::new_in(&ast);
            arguments.push(Argument::from(receiver));
            arguments.push(Argument::from(
                ast.expression_identifier(key_span, self.allocator.alloc_str(&key)),
            ));
            arguments.push(Argument::from(ast.expression_array(span, elements)));
            *expression = ast.expression_call(
                span,
                ast.expression_identifier(span, self.call_name),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                optional,
            );
            return;
        }
        match expression {
            Expression::PrivateFieldExpression(field) => {
                self.visit_expression(&mut field.object);
                let Some(key) = self.key(field.field.name.as_str()) else {
                    return;
                };
                let object = field.object.take_in(&ast);
                *expression = Expression::from(ast.member_expression_computed(
                    field.span,
                    self.checked_object(field.span, object, key),
                    ast.expression_identifier(field.field.span, self.allocator.alloc_str(key)),
                    false,
                ));
            }
            Expression::PrivateInExpression(private_in) => {
                self.visit_expression(&mut private_in.right);
                let Some(key) = self.key(private_in.left.name.as_str()) else {
                    return;
                };
                let mut arguments = ArenaVec::new_in(&ast);
                arguments.push(Argument::from(private_in.right.take_in(&ast)));
                arguments.push(Argument::from(ast.expression_identifier(
                    private_in.left.span,
                    self.allocator.alloc_str(key),
                )));
                *expression = ast.expression_call(
                    private_in.span,
                    Expression::from(ast.member_expression_static(
                        private_in.span,
                        Expression::from(ast.member_expression_static(
                            private_in.span,
                            Expression::from(ast.member_expression_static(
                                private_in.span,
                                ast.expression_identifier(private_in.span, "Object"),
                                ast.identifier_name(private_in.span, "prototype"),
                                false,
                            )),
                            ast.identifier_name(private_in.span, "hasOwnProperty"),
                            false,
                        )),
                        ast.identifier_name(private_in.span, "call"),
                        false,
                    )),
                    None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                    arguments,
                    false,
                );
            }
            _ => walk_mut::walk_expression(self, expression),
        }
    }

    #[expect(deprecated)]
    fn visit_assignment_target(&mut self, target: &mut AssignmentTarget<'a>) {
        if let AssignmentTarget::PrivateFieldExpression(field) = target {
            self.visit_expression(&mut field.object);
            let Some(key) = self.key(field.field.name.as_str()) else {
                return;
            };
            let ast = AstBuilder::new(self.allocator);
            let object = field.object.take_in(&ast);
            *target =
                AssignmentTarget::ComputedMemberExpression(ast.alloc_computed_member_expression(
                    field.span,
                    self.checked_object(field.span, object, key),
                    ast.expression_identifier(field.field.span, self.allocator.alloc_str(key)),
                    false,
                ));
        } else {
            walk_mut::walk_assignment_target(self, target);
        }
    }

    #[expect(deprecated)]
    fn visit_simple_assignment_target(&mut self, target: &mut SimpleAssignmentTarget<'a>) {
        if let SimpleAssignmentTarget::PrivateFieldExpression(field) = target {
            self.visit_expression(&mut field.object);
            let Some(key) = self.key(field.field.name.as_str()) else {
                return;
            };
            let ast = AstBuilder::new(self.allocator);
            let object = field.object.take_in(&ast);
            *target = SimpleAssignmentTarget::ComputedMemberExpression(
                ast.alloc_computed_member_expression(
                    field.span,
                    self.checked_object(field.span, object, key),
                    ast.expression_identifier(field.field.span, self.allocator.alloc_str(key)),
                    false,
                ),
            );
        } else {
            walk_mut::walk_simple_assignment_target(self, target);
        }
    }
}

struct SuperAccessRewriter<'a> {
    allocator: &'a Allocator,
    class_name: &'a str,
    get_name: &'a str,
    is_static: bool,
}

impl<'a> SuperAccessRewriter<'a> {
    #[expect(deprecated)]
    fn take_key(&self, expression: &mut Expression<'a>) -> Option<(Span, Expression<'a>)> {
        let ast = AstBuilder::new(self.allocator);
        match expression {
            Expression::StaticMemberExpression(member)
                if matches!(member.object, Expression::Super(_)) =>
            {
                Some((
                    member.span,
                    ast.expression_string_literal(member.property.span, member.property.name, None),
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

    #[expect(deprecated)]
    fn get(&self, span: Span, key: Expression<'a>) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let target = if self.is_static {
            ast.expression_identifier(span, self.class_name)
        } else {
            Expression::from(ast.member_expression_static(
                span,
                ast.expression_identifier(span, self.class_name),
                ast.identifier_name(span, "prototype"),
                false,
            ))
        };
        let mut prototype_arguments = ArenaVec::new_in(&ast);
        prototype_arguments.push(Argument::from(target));
        let prototype = ast.expression_call(
            span,
            Expression::from(ast.member_expression_static(
                span,
                ast.expression_identifier(span, "Object"),
                ast.identifier_name(span, "getPrototypeOf"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            prototype_arguments,
            false,
        );
        let mut get_arguments = ArenaVec::new_in(&ast);
        get_arguments.push(Argument::from(prototype));
        get_arguments.push(Argument::from(key));
        get_arguments.push(Argument::from(ast.expression_this(span)));
        ast.expression_call(
            span,
            ast.expression_identifier(span, self.get_name),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            get_arguments,
            false,
        )
    }

    #[expect(deprecated)]
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
                    ast.expression_string_literal(member.property.span, member.property.name, None),
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

    #[expect(deprecated)]
    fn set(&self, span: Span, key: Expression<'a>, value: Expression<'a>) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let target = if self.is_static {
            ast.expression_identifier(span, self.class_name)
        } else {
            Expression::from(ast.member_expression_static(
                span,
                ast.expression_identifier(span, self.class_name),
                ast.identifier_name(span, "prototype"),
                false,
            ))
        };
        let mut prototype_arguments = ArenaVec::new_in(&ast);
        prototype_arguments.push(Argument::from(target));
        let prototype = ast.expression_call(
            span,
            Expression::from(ast.member_expression_static(
                span,
                ast.expression_identifier(span, "Object"),
                ast.identifier_name(span, "getPrototypeOf"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            prototype_arguments,
            false,
        );
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(prototype));
        arguments.push(Argument::from(key));
        arguments.push(Argument::from(value));
        arguments.push(Argument::from(ast.expression_this(span)));
        ast.expression_call(
            span,
            Expression::from(ast.member_expression_static(
                span,
                ast.expression_identifier(span, "Reflect"),
                ast.identifier_name(span, "set"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        )
    }

    #[expect(deprecated)]
    fn set_value(
        &self,
        span: Span,
        key: Expression<'a>,
        value: Expression<'a>,
        operator: oxc_syntax::operator::AssignmentOperator,
    ) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let key_name = ast.allocator.alloc_str("_key");
        let value_name = ast.allocator.alloc_str("_value");
        let mut pending_value = Some(value);
        let mut key_declarations = ArenaVec::new_in(&ast);
        key_declarations.push(ast.variable_declarator(
            span,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(span, key_name),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(key),
            false,
        ));
        let computed_value = if operator.is_logical() {
            self.get(span, ast.expression_identifier(span, key_name))
        } else if let Some(binary_operator) = operator.to_binary_operator() {
            ast.expression_binary(
                span,
                self.get(span, ast.expression_identifier(span, key_name)),
                binary_operator,
                pending_value.take().unwrap(),
            )
        } else {
            pending_value.take().unwrap()
        };
        let mut value_declarations = ArenaVec::new_in(&ast);
        value_declarations.push(ast.variable_declarator(
            span,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(span, value_name),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(computed_value),
            false,
        ));
        let set = self.set(
            span,
            ast.expression_identifier(span, key_name),
            ast.expression_identifier(span, value_name),
        );
        let mut body_statements = ArenaVec::new_in(&ast);
        body_statements.push(Statement::VariableDeclaration(
            ast.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Var,
                key_declarations,
                false,
            ),
        ));
        body_statements.push(Statement::VariableDeclaration(
            ast.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Var,
                value_declarations,
                false,
            ),
        ));
        if operator.is_logical() {
            let current = || ast.expression_identifier(span, value_name);
            let short_circuit = match operator {
                oxc_syntax::operator::AssignmentOperator::LogicalOr => current(),
                oxc_syntax::operator::AssignmentOperator::LogicalAnd => ast.expression_unary(
                    span,
                    oxc_syntax::operator::UnaryOperator::LogicalNot,
                    current(),
                ),
                oxc_syntax::operator::AssignmentOperator::LogicalNullish => ast.expression_binary(
                    span,
                    current(),
                    oxc_syntax::operator::BinaryOperator::Inequality,
                    ast.expression_null_literal(span),
                ),
                _ => unreachable!(),
            };
            body_statements.push(ast.statement_if(
                span,
                short_circuit,
                ast.statement_return(span, Some(current())),
                None,
            ));
            body_statements.push(
                ast.statement_expression(
                    span,
                    ast.expression_assignment(
                        span,
                        oxc_syntax::operator::AssignmentOperator::Assign,
                        ast.simple_assignment_target_assignment_target_identifier(span, value_name)
                            .into(),
                        pending_value.take().unwrap(),
                    ),
                ),
            );
        }
        body_statements.push(ast.statement_expression(span, set));
        body_statements
            .push(ast.statement_return(span, Some(ast.expression_identifier(span, value_name))));
        let arrow = ast.expression_arrow_function(
            span,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            ast.alloc_formal_parameters(
                span,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(&ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            ast.alloc_function_body(span, ArenaVec::new_in(&ast), body_statements),
        );
        ast.expression_call(
            span,
            arrow,
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ArenaVec::new_in(&ast),
            false,
        )
    }

    #[expect(deprecated)]
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
                    ast.expression_string_literal(member.property.span, member.property.name, None),
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

    #[expect(deprecated)]
    fn update_value(
        &self,
        span: Span,
        key: Expression<'a>,
        operator: oxc_syntax::operator::UpdateOperator,
        prefix: bool,
    ) -> Expression<'a> {
        let ast = AstBuilder::new(self.allocator);
        let key_name = ast.allocator.alloc_str("_key");
        let value_name = ast.allocator.alloc_str("_value");
        let result_name = ast.allocator.alloc_str("_result");
        let mut key_declarations = ArenaVec::new_in(&ast);
        key_declarations.push(ast.variable_declarator(
            span,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(span, key_name),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(key),
            false,
        ));
        let mut value_declarations = ArenaVec::new_in(&ast);
        value_declarations.push(ast.variable_declarator(
            span,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(span, value_name),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(self.get(span, ast.expression_identifier(span, key_name))),
            false,
        ));
        let update = ast.expression_update(
            span,
            operator,
            prefix,
            ast.simple_assignment_target_assignment_target_identifier(span, value_name),
        );
        let mut result_declarations = ArenaVec::new_in(&ast);
        result_declarations.push(ast.variable_declarator(
            span,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(span, result_name),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(update),
            false,
        ));
        let set = self.set(
            span,
            ast.expression_identifier(span, key_name),
            ast.expression_identifier(span, value_name),
        );
        let mut statements = ArenaVec::new_in(&ast);
        for declarations in [key_declarations, value_declarations, result_declarations] {
            statements.push(Statement::VariableDeclaration(
                ast.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Var,
                    declarations,
                    false,
                ),
            ));
        }
        statements.push(ast.statement_expression(span, set));
        statements
            .push(ast.statement_return(span, Some(ast.expression_identifier(span, result_name))));
        let arrow = ast.expression_arrow_function(
            span,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            ast.alloc_formal_parameters(
                span,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(&ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            ast.alloc_function_body(span, ArenaVec::new_in(&ast), statements),
        );
        ast.expression_call(
            span,
            arrow,
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            ArenaVec::new_in(&ast),
            false,
        )
    }
}

impl<'a> VisitMut<'a> for SuperAccessRewriter<'a> {
    #[expect(deprecated)]
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if let Expression::UpdateExpression(update) = expression
            && let Some((span, key)) = self.take_update_key(&mut update.argument)
        {
            *expression = self.update_value(span, key, update.operator, update.prefix);
            walk_mut::walk_expression(self, expression);
            return;
        }
        if let Expression::AssignmentExpression(assignment) = expression
            && (assignment.operator.is_assign()
                || assignment.operator.to_binary_operator().is_some()
                || assignment.operator.is_logical())
            && let Some((span, key)) = self.take_assignment_key(&mut assignment.left)
        {
            let ast = AstBuilder::new(self.allocator);
            let value = assignment.right.take_in(&ast);
            *expression = self.set_value(span, key, value, assignment.operator);
            walk_mut::walk_expression(self, expression);
            return;
        }
        if let Expression::CallExpression(call) = expression
            && let Some((span, key)) = self.take_key(&mut call.callee)
        {
            let ast = AstBuilder::new(self.allocator);
            let get = self.get(span, key);
            let mut arguments = std::mem::replace(&mut call.arguments, ArenaVec::new_in(&ast));
            arguments.insert(0, Argument::from(ast.expression_this(span)));
            *expression = ast.expression_call(
                call.span,
                Expression::from(ast.member_expression_static(
                    span,
                    get,
                    ast.identifier_name(span, "call"),
                    false,
                )),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                call.optional,
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

    fn visit_function(&mut self, _function: &mut Function<'a>, _flags: ScopeFlags) {}
}

#[expect(deprecated)]
fn derived_default_constructor<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    super_name: &str,
    construct_name: &str,
    receiver_name: &str,
    anchor: Span,
    instance_initializers: &mut ArenaVec<'a, Statement<'a>>,
) -> ArenaBox<'a, Function<'a>> {
    let parameters = ast.alloc_formal_parameters(
        anchor,
        FormalParameterKind::FormalParameter,
        ArenaVec::new_in(ast),
        None::<ArenaBox<'a, FormalParameterRest<'a>>>,
    );
    let mut construct_arguments = ArenaVec::new_in(ast);
    construct_arguments.push(Argument::from(
        ast.expression_identifier(anchor, ast.allocator.alloc_str(super_name)),
    ));
    construct_arguments.push(Argument::from(
        ast.expression_identifier(anchor, "arguments"),
    ));
    construct_arguments.push(Argument::from(ast.expression_logical(
        anchor,
        ast.expression_new_target(anchor),
        oxc_syntax::operator::LogicalOperator::Or,
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name)),
    )));
    let construct = ast.expression_call(
        anchor,
        ast.expression_identifier(anchor, ast.allocator.alloc_str(construct_name)),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        construct_arguments,
        false,
    );
    let mut receiver_declarations = ArenaVec::new_in(ast);
    receiver_declarations.push(ast.variable_declarator(
        anchor,
        VariableDeclarationKind::Var,
        ast.binding_pattern_binding_identifier(anchor, ast.allocator.alloc_str(receiver_name)),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(construct),
        false,
    ));
    let mut statements = ArenaVec::new_in(ast);
    statements.push(Statement::VariableDeclaration(
        ast.alloc_variable_declaration(
            anchor,
            VariableDeclarationKind::Var,
            receiver_declarations,
            false,
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
    statements.push(ast.statement_return(
        anchor,
        Some(ast.expression_identifier(anchor, ast.allocator.alloc_str(receiver_name))),
    ));
    ast.alloc_function(
        anchor,
        FunctionType::FunctionDeclaration,
        Some(ast.binding_identifier(anchor, ast.allocator.alloc_str(class_name))),
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        parameters,
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(ast.alloc_function_body(anchor, ArenaVec::new_in(ast), statements)),
    )
}

#[expect(deprecated)]
fn derived_inheritance_statements<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    super_name: &str,
    anchor: Span,
) -> ArenaVec<'a, Statement<'a>> {
    let class_reference = || ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name));
    let super_reference = || ast.expression_identifier(anchor, ast.allocator.alloc_str(super_name));
    let set_prototype_of = || {
        Expression::from(ast.member_expression_static(
            anchor,
            ast.expression_identifier(anchor, "Object"),
            ast.identifier_name(anchor, "setPrototypeOf"),
            false,
        ))
    };
    let mut set_arguments = ArenaVec::new_in(ast);
    set_arguments.push(Argument::from(class_reference()));
    set_arguments.push(Argument::from(super_reference()));
    let set_statement = ast.statement_expression(
        anchor,
        ast.expression_call(
            anchor,
            set_prototype_of(),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            set_arguments,
            false,
        ),
    );
    let fallback = ast.statement_expression(
        anchor,
        ast.expression_assignment(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            ast.member_expression_static(
                anchor,
                class_reference(),
                ast.identifier_name(anchor, "__proto__"),
                false,
            )
            .into(),
            super_reference(),
        ),
    );
    let mut statements = ArenaVec::new_in(ast);
    statements.push(ast.statement_if(anchor, set_prototype_of(), set_statement, Some(fallback)));

    let super_prototype = Expression::from(ast.member_expression_static(
        anchor,
        super_reference(),
        ast.identifier_name(anchor, "prototype"),
        false,
    ));
    let inherited_prototype = ast.expression_logical(
        anchor,
        super_reference(),
        oxc_syntax::operator::LogicalOperator::And,
        super_prototype,
    );
    let mut constructor_descriptor = ArenaVec::new_in(ast);
    for (name, value) in [
        ("value", class_reference()),
        ("writable", ast.expression_boolean_literal(anchor, true)),
        ("configurable", ast.expression_boolean_literal(anchor, true)),
    ] {
        constructor_descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, name),
            value,
            false,
            false,
            false,
        ));
    }
    let mut descriptors = ArenaVec::new_in(ast);
    descriptors.push(ast.object_property_kind_object_property(
        anchor,
        PropertyKind::Init,
        ast.property_key_static_identifier(anchor, "constructor"),
        ast.expression_object(anchor, constructor_descriptor),
        false,
        false,
        false,
    ));
    let mut create_arguments = ArenaVec::new_in(ast);
    create_arguments.push(Argument::from(inherited_prototype));
    create_arguments.push(Argument::from(ast.expression_object(anchor, descriptors)));
    let created = ast.expression_call(
        anchor,
        Expression::from(ast.member_expression_static(
            anchor,
            ast.expression_identifier(anchor, "Object"),
            ast.identifier_name(anchor, "create"),
            false,
        )),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        create_arguments,
        false,
    );
    statements.push(
        ast.statement_expression(
            anchor,
            ast.expression_assignment(
                anchor,
                oxc_syntax::operator::AssignmentOperator::Assign,
                ast.member_expression_static(
                    anchor,
                    class_reference(),
                    ast.identifier_name(anchor, "prototype"),
                    false,
                )
                .into(),
                created,
            ),
        ),
    );
    statements
}

struct PrivateAccessorPlan<'a> {
    key: String,
    is_static: bool,
    get: Option<ArenaBox<'a, Function<'a>>>,
    set: Option<ArenaBox<'a, Function<'a>>>,
    span: Span,
}

struct ExpressionIdentifierInliner<'a, 'p> {
    allocator: &'a Allocator,
    name: &'p str,
    replacement: &'p Expression<'a>,
    preserved_call_name: Option<&'p str>,
}

impl<'a> VisitMut<'a> for ExpressionIdentifierInliner<'a, '_> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if matches!(
            expression,
            Expression::Identifier(identifier) if identifier.name == self.name
        ) {
            *expression = self.replacement.clone_in(self.allocator);
        } else {
            walk_mut::walk_expression(self, expression);
        }
    }

    fn visit_call_expression(&mut self, call: &mut oxc_ast::ast::CallExpression<'a>) {
        if self.preserved_call_name.is_some_and(|name| {
            matches!(
                &call.callee,
                Expression::Identifier(identifier) if identifier.name == name
            )
        }) {
            for argument in &mut call.arguments {
                self.visit_argument(argument);
            }
        } else {
            walk_mut::walk_call_expression(self, call);
        }
    }
}

#[expect(deprecated)]
fn lower_simple_class<'a>(
    allocator: &'a Allocator,
    mut class: Class<'a>,
    plan: &DirectClassPlan,
) -> Result<Expression<'a>, &'static str> {
    let ast = AstBuilder::new(allocator);
    let anchor = class.span;
    let name = &plan.name;
    let super_class = class.super_class.take();
    let super_name = plan.super_name.as_deref();
    let private_setters = class
        .body
        .body
        .iter()
        .filter_map(|element| match element {
            ClassElement::MethodDefinition(method)
                if method.kind == MethodDefinitionKind::Set
                    && matches!(method.key, PropertyKey::PrivateIdentifier(_)) =>
            {
                let PropertyKey::PrivateIdentifier(key) = &method.key else {
                    unreachable!()
                };
                Some(key.name.to_string())
            }
            _ => None,
        })
        .collect::<FxHashSet<_>>();
    let read_only_private = class
        .body
        .body
        .iter()
        .filter_map(|element| match element {
            ClassElement::MethodDefinition(method)
                if matches!(method.key, PropertyKey::PrivateIdentifier(_))
                    && method.kind != MethodDefinitionKind::Set =>
            {
                let PropertyKey::PrivateIdentifier(key) = &method.key else {
                    unreachable!()
                };
                (method.kind != MethodDefinitionKind::Get
                    || !private_setters.contains(key.name.as_str()))
                .then(|| key.name.to_string())
            }
            _ => None,
        })
        .collect::<FxHashSet<_>>();
    if !plan.private_keys.is_empty() {
        PrivateLooseRewriter {
            allocator,
            keys: &plan.private_keys,
            read_only: &read_only_private,
            base_name: allocator.alloc_str(&plan.helper_names.private_base),
            call_name: allocator.alloc_str(&plan.helper_names.private_call),
        }
        .visit_class(&mut class);
    }
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
                if let Some(binding) = plan
                    .computed_keys
                    .get(&(method.span.start, method.span.end))
                {
                    let key = method.key.take_in(&ast).into_expression();
                    computed_key_initializers.push((binding.clone(), key, method.span));
                    method.key = PropertyKey::from(
                        ast.expression_identifier(method.span, allocator.alloc_str(binding)),
                    );
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
                    if super_name.is_some()
                        && let Some(body) = value.body.as_mut()
                    {
                        let mut rewriter = SuperAccessRewriter {
                            allocator,
                            class_name: allocator.alloc_str(name),
                            get_name: allocator.alloc_str(&plan.helper_names.super_get),
                            is_static: method.r#static,
                        };
                        for statement in &mut body.statements {
                            rewriter.visit_statement(statement);
                        }
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
                        let statement = private_element_initializer(
                            &ast,
                            name,
                            &private_key,
                            Some(Expression::FunctionExpression(value)),
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
                    clear_leading_pure_annotation(value);
                }
                let computed_binding = plan
                    .computed_keys
                    .get(&(property.span.start, property.span.end))
                    .cloned();
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
                            .ok_or("classes-direct-field-options-missing")?,
                        anchor,
                    )?
                };
                if statement.0 {
                    static_initializers.push(statement.1);
                } else {
                    instance_initializers.push(statement.1);
                }
            }
            ClassElement::StaticBlock(block) => {
                if !plan.class_static_blocks {
                    return Err("classes-direct-static-block-options-missing");
                }
                static_initializers.push(static_block_initializer(&ast, name, block.unbox()));
            }
            ClassElement::TSIndexSignature(_) => {}
            _ => return Err("classes-direct-shape-mismatch"),
        }
    }
    instance_initializers.append(&mut private_instance_method_initializers);
    static_initializers.append(&mut private_static_method_initializers);
    for accessor in private_accessors {
        let statement = private_accessor_initializer(&ast, name, &accessor);
        if accessor.is_static {
            static_initializers.push(statement);
        } else {
            instance_initializers.push(statement);
        }
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
                receiver_name,
                plan.result_name
                    .as_deref()
                    .ok_or("classes-direct-derived-result-name-missing")?,
                plan.new_target_name.as_deref(),
                plan.super_call_name.as_deref(),
                anchor,
                &mut instance_initializers,
            )?;
        }
        function.r#type = FunctionType::FunctionDeclaration;
        function.id = Some(ast.binding_identifier(anchor, allocator.alloc_str(name)));
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
        ast.alloc_function(
            anchor,
            FunctionType::FunctionDeclaration,
            Some(ast.binding_identifier(anchor, allocator.alloc_str(name))),
            false,
            false,
            false,
            None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
            None::<ArenaBox<'a, TSThisParameter<'a>>>,
            ast.alloc_formal_parameters(
                anchor,
                FormalParameterKind::FormalParameter,
                ArenaVec::new_in(&ast),
                None::<ArenaBox<'a, FormalParameterRest<'a>>>,
            ),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(ast.alloc_function_body(anchor, ArenaVec::new_in(&ast), ArenaVec::new_in(&ast))),
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
        };
        for statement in &mut instance_initializers {
            rewriter.visit_statement(statement);
        }
        body.statements.append(&mut instance_initializers);
        body.statements.append(&mut original_body);
    } else {
        body.statements.append(&mut instance_initializers);
        body.statements.append(&mut original_body);
    }
    let mut wrapper_statements = ArenaVec::new_in(&ast);
    for (binding, key) in plan.private_keys.values() {
        let mut declarations = ArenaVec::new_in(&ast);
        declarations.push(ast.variable_declarator(
            anchor,
            VariableDeclarationKind::Var,
            ast.binding_pattern_binding_identifier(anchor, allocator.alloc_str(binding)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            Some(ast.expression_string_literal(anchor, allocator.alloc_str(key), None)),
            false,
        ));
        wrapper_statements.push(Statement::VariableDeclaration(
            ast.alloc_variable_declaration(
                anchor,
                VariableDeclarationKind::Var,
                declarations,
                false,
            ),
        ));
    }
    let mut wrapper_parameters = ArenaVec::new_in(&ast);
    let mut wrapper_arguments = ArenaVec::new_in(&ast);
    for (binding, key, span) in computed_key_initializers {
        wrapper_parameters.push(ast.formal_parameter(
            span,
            ArenaVec::new_in(&ast),
            ast.binding_pattern_binding_identifier(span, allocator.alloc_str(&binding)),
            None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
            None::<ArenaBox<'a, Expression<'a>>>,
            false,
            None,
            false,
            false,
        ));
        // Computed keys are evaluated in the class's surrounding context. In
        // particular, `yield` and `await` are valid here but become syntax
        // errors if moved into the non-generator class wrapper body.
        wrapper_arguments.push(Argument::from(key));
    }
    debug_assert!(!needs_assertion);
    wrapper_statements.push(Statement::FunctionDeclaration(constructor));
    let after_constructor = wrapper_statements.len();
    for method in methods {
        let method_name =
            match &method.key {
                PropertyKey::StaticIdentifier(key) if !method.computed => {
                    let prefix = match method.kind {
                        MethodDefinitionKind::Get => "get ",
                        MethodDefinitionKind::Set => "set ",
                        _ => "",
                    };
                    Some(ast.expression_string_literal(
                        anchor,
                        allocator.alloc_str(&format!("{prefix}{}", key.name)),
                        None,
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
                ast.expression_string_literal(anchor, key.name, None)
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
        if super_name.is_some() {
            let mut rewriter = SuperAccessRewriter {
                allocator,
                class_name: allocator.alloc_str(name),
                get_name: allocator.alloc_str(&plan.helper_names.super_get),
                is_static: method.r#static,
            };
            for statement in &mut body.statements {
                rewriter.visit_statement(statement);
            }
        }
        let target = if method.r#static {
            ast.expression_identifier(anchor, allocator.alloc_str(name))
        } else {
            Expression::from(ast.member_expression_static(
                anchor,
                ast.expression_identifier(anchor, allocator.alloc_str(name)),
                ast.identifier_name(anchor, "prototype"),
                false,
            ))
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
        descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, property),
            function_expression,
            false,
            false,
            false,
        ));
        if kind == PropertyKind::Init {
            descriptor.push(ast.object_property_kind_object_property(
                anchor,
                PropertyKind::Init,
                ast.property_key_static_identifier(anchor, "writable"),
                ast.expression_boolean_literal(anchor, true),
                false,
                false,
                false,
            ));
        }
        descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, "configurable"),
            ast.expression_boolean_literal(anchor, true),
            false,
            false,
            false,
        ));
        let mut arguments = ArenaVec::new_in(&ast);
        arguments.push(Argument::from(target));
        arguments.push(Argument::from(key));
        arguments.push(Argument::from(ast.expression_object(anchor, descriptor)));
        wrapper_statements.push(ast.statement_expression(
            anchor,
            ast.expression_call(
                anchor,
                Expression::from(ast.member_expression_static(
                    anchor,
                    ast.expression_identifier(anchor, "Object"),
                    ast.identifier_name(anchor, "defineProperty"),
                    false,
                )),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
            ),
        ));
    }
    if let Some(super_name) = super_name {
        let mut inheritance = derived_inheritance_statements(&ast, name, super_name, anchor);
        wrapper_statements.splice(after_constructor..after_constructor, inheritance.drain(..));
    }
    wrapper_statements.append(&mut static_initializers);
    wrapper_statements.push(ast.statement_return(
        anchor,
        Some(ast.expression_identifier(anchor, allocator.alloc_str(name))),
    ));
    if let (Some(super_name), Some(super_class)) = (super_name, super_class.as_ref()) {
        let mut inliner = ExpressionIdentifierInliner {
            allocator,
            name: super_name,
            replacement: super_class,
            preserved_call_name: plan.super_call_name.as_deref(),
        };
        for statement in &mut wrapper_statements {
            inliner.visit_statement(statement);
        }
    }
    let mut wrapper_directives = ArenaVec::new_in(&ast);
    wrapper_directives.push(ast.directive(
        anchor,
        ast.string_literal(anchor, "use strict", None),
        "use strict",
    ));
    let wrapper_body = ast.alloc_function_body(anchor, wrapper_directives, wrapper_statements);
    let wrapper = ast.expression_arrow_function(
        anchor,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        ast.alloc_formal_parameters(
            anchor,
            FormalParameterKind::FormalParameter,
            wrapper_parameters,
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        wrapper_body,
    );
    Ok(ast.expression_call(
        anchor,
        wrapper,
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        wrapper_arguments,
        false,
    ))
}

#[expect(deprecated)]
fn static_block_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    block: oxc_ast::ast::StaticBlock<'a>,
) -> Statement<'a> {
    let anchor = block.span;
    let function = ast.expression_function(
        anchor,
        FunctionType::FunctionExpression,
        None,
        false,
        false,
        false,
        None::<ArenaBox<'a, TSTypeParameterDeclaration<'a>>>,
        None::<ArenaBox<'a, TSThisParameter<'a>>>,
        ast.alloc_formal_parameters(
            anchor,
            FormalParameterKind::FormalParameter,
            ArenaVec::new_in(ast),
            None::<ArenaBox<'a, FormalParameterRest<'a>>>,
        ),
        None::<ArenaBox<'a, TSTypeAnnotation<'a>>>,
        Some(ast.alloc_function_body(anchor, ArenaVec::new_in(ast), block.body)),
    );
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name)),
    ));
    ast.statement_expression(
        anchor,
        ast.expression_call(
            anchor,
            Expression::from(ast.member_expression_static(
                anchor,
                function,
                ast.identifier_name(anchor, "call"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        ),
    )
}

#[expect(deprecated)]
fn private_accessor_initializer<'a>(
    ast: &AstBuilder<'a>,
    class_name: &str,
    accessor: &PrivateAccessorPlan<'a>,
) -> Statement<'a> {
    let anchor = accessor.span;
    let target = if accessor.is_static {
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name))
    } else {
        ast.expression_this(anchor)
    };
    let mut descriptor = ArenaVec::new_in(ast);
    if let Some(get) = accessor.get.as_ref() {
        descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, "get"),
            Expression::FunctionExpression(get.clone_in(ast.allocator)),
            false,
            false,
            false,
        ));
    }
    if let Some(set) = accessor.set.as_ref() {
        descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, "set"),
            Expression::FunctionExpression(set.clone_in(ast.allocator)),
            false,
            false,
            false,
        ));
    }
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(target));
    arguments.push(Argument::from(
        ast.expression_identifier(anchor, ast.allocator.alloc_str(&accessor.key)),
    ));
    arguments.push(Argument::from(ast.expression_object(anchor, descriptor)));
    ast.statement_expression(
        anchor,
        ast.expression_call(
            anchor,
            Expression::from(ast.member_expression_static(
                anchor,
                ast.expression_identifier(anchor, "Object"),
                ast.identifier_name(anchor, "defineProperty"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        ),
    )
}

#[expect(deprecated)]
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
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name))
    } else {
        ast.expression_this(anchor)
    };
    let value = value.unwrap_or_else(|| {
        ast.expression_unary(
            anchor,
            oxc_syntax::operator::UnaryOperator::Void,
            ast.expression_numeric_literal(anchor, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
        )
    });
    let mut descriptor = ArenaVec::new_in(ast);
    if writable {
        descriptor.push(ast.object_property_kind_object_property(
            anchor,
            PropertyKind::Init,
            ast.property_key_static_identifier(anchor, "writable"),
            ast.expression_boolean_literal(anchor, true),
            false,
            false,
            false,
        ));
    }
    descriptor.push(ast.object_property_kind_object_property(
        anchor,
        PropertyKind::Init,
        ast.property_key_static_identifier(anchor, "value"),
        value,
        false,
        false,
        false,
    ));
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(target));
    arguments.push(Argument::from(
        ast.expression_identifier(anchor, ast.allocator.alloc_str(key_name)),
    ));
    arguments.push(Argument::from(ast.expression_object(anchor, descriptor)));
    ast.statement_expression(
        anchor,
        ast.expression_call(
            anchor,
            Expression::from(ast.member_expression_static(
                anchor,
                ast.expression_identifier(anchor, "Object"),
                ast.identifier_name(anchor, "defineProperty"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        ),
    )
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

#[expect(deprecated)]
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
            Some(ast.expression_identifier(anchor, ast.allocator.alloc_str(binding))),
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
        ast.expression_identifier(anchor, ast.allocator.alloc_str(class_name))
    } else {
        ast.expression_this(anchor)
    };
    let mut value = property.value.unwrap_or_else(|| {
        ast.expression_unary(
            anchor,
            oxc_syntax::operator::UnaryOperator::Void,
            ast.expression_numeric_literal(anchor, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
        )
    });
    clear_leading_pure_annotation(&mut value);
    let expression = if loose {
        let member = if let Some(key) = computed_key {
            ast.member_expression_computed(anchor, target, key, false)
                .into()
        } else {
            ast.member_expression_static(
                anchor,
                target,
                ast.identifier_name(key_span, key_name.unwrap()),
                false,
            )
            .into()
        };
        ast.expression_assignment(
            anchor,
            oxc_syntax::operator::AssignmentOperator::Assign,
            member,
            value,
        )
    } else {
        let mut descriptor = ArenaVec::new_in(ast);
        for (name, value) in [
            ("value", value),
            ("enumerable", ast.expression_boolean_literal(anchor, true)),
            ("configurable", ast.expression_boolean_literal(anchor, true)),
            ("writable", ast.expression_boolean_literal(anchor, true)),
        ] {
            descriptor.push(ast.object_property_kind_object_property(
                anchor,
                PropertyKind::Init,
                ast.property_key_static_identifier(anchor, name),
                value,
                false,
                false,
                false,
            ));
        }
        let mut arguments = ArenaVec::new_in(ast);
        arguments.push(Argument::from(target));
        arguments.push(Argument::from(if let Some(key) = computed_key {
            key
        } else {
            ast.expression_string_literal(key_span, key_name.unwrap(), None)
        }));
        arguments.push(Argument::from(ast.expression_object(anchor, descriptor)));
        ast.expression_call(
            anchor,
            Expression::from(ast.member_expression_static(
                anchor,
                ast.expression_identifier(anchor, "Object"),
                ast.identifier_name(anchor, "defineProperty"),
                false,
            )),
            None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
            arguments,
            false,
        )
    };
    Ok((
        property.r#static,
        ast.statement_expression(anchor, expression),
    ))
}

#[expect(deprecated)]
fn class_call_guard<'a>(ast: &AstBuilder<'a>, _name: &str, anchor: Span) -> Statement<'a> {
    let test = ast.expression_unary(
        anchor,
        oxc_syntax::operator::UnaryOperator::LogicalNot,
        ast.expression_new_target(anchor),
    );
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(ast.expression_string_literal(
        anchor,
        "Cannot call a class as a function",
        None,
    )));
    let error = ast.expression_new(
        anchor,
        ast.expression_identifier(anchor, "TypeError"),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
    );
    ast.statement_if(anchor, test, ast.statement_throw(anchor, error), None)
}

#[expect(deprecated)]
fn method_construct_guard<'a>(ast: &AstBuilder<'a>, anchor: Span) -> Statement<'a> {
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(ast.expression_string_literal(
        anchor,
        "Class methods cannot be invoked with 'new'",
        None,
    )));
    let error = ast.expression_new(
        anchor,
        ast.expression_identifier(anchor, "TypeError"),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
    );
    ast.statement_if(
        anchor,
        ast.expression_new_target(anchor),
        ast.statement_throw(anchor, error),
        None,
    )
}

#[expect(deprecated)]
fn set_function_name<'a>(
    ast: &AstBuilder<'a>,
    function: Expression<'a>,
    name: Expression<'a>,
    anchor: Span,
) -> Expression<'a> {
    let mut descriptor = ArenaVec::new_in(ast);
    descriptor.push(ast.object_property_kind_object_property(
        anchor,
        PropertyKind::Init,
        ast.property_key_static_identifier(anchor, "value"),
        name,
        false,
        false,
        false,
    ));
    descriptor.push(ast.object_property_kind_object_property(
        anchor,
        PropertyKind::Init,
        ast.property_key_static_identifier(anchor, "configurable"),
        ast.expression_boolean_literal(anchor, true),
        false,
        false,
        false,
    ));
    let mut arguments = ArenaVec::new_in(ast);
    arguments.push(Argument::from(function));
    arguments.push(Argument::from(
        ast.expression_string_literal(anchor, "name", None),
    ));
    arguments.push(Argument::from(ast.expression_object(anchor, descriptor)));
    ast.expression_call(
        anchor,
        Expression::from(ast.member_expression_static(
            anchor,
            ast.expression_identifier(anchor, "Object"),
            ast.identifier_name(anchor, "defineProperty"),
            false,
        )),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        arguments,
        false,
    )
}

#[expect(deprecated)]
fn computed_function_name<'a>(
    ast: &AstBuilder<'a>,
    key_name: &str,
    kind: MethodDefinitionKind,
    anchor: Span,
) -> Expression<'a> {
    let key = || ast.expression_identifier(anchor, ast.allocator.alloc_str(key_name));
    let description = || {
        Expression::from(ast.member_expression_static(
            anchor,
            key(),
            ast.identifier_name(anchor, "description"),
            false,
        ))
    };
    let undefined = || {
        ast.expression_unary(
            anchor,
            oxc_syntax::operator::UnaryOperator::Void,
            ast.expression_numeric_literal(anchor, 0.0, None, oxc_ast::ast::NumberBase::Decimal),
        )
    };
    let symbol_name = ast.expression_conditional(
        anchor,
        ast.expression_binary(
            anchor,
            description(),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            undefined(),
        ),
        ast.expression_string_literal(anchor, "", None),
        ast.expression_binary(
            anchor,
            ast.expression_binary(
                anchor,
                ast.expression_string_literal(anchor, "[", None),
                oxc_syntax::operator::BinaryOperator::Addition,
                description(),
            ),
            oxc_syntax::operator::BinaryOperator::Addition,
            ast.expression_string_literal(anchor, "]", None),
        ),
    );
    let mut string_arguments = ArenaVec::new_in(ast);
    string_arguments.push(Argument::from(key()));
    let ordinary_name = ast.expression_call(
        anchor,
        ast.expression_identifier(anchor, "String"),
        None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
        string_arguments,
        false,
    );
    let base = ast.expression_conditional(
        anchor,
        ast.expression_binary(
            anchor,
            ast.expression_unary(anchor, oxc_syntax::operator::UnaryOperator::Typeof, key()),
            oxc_syntax::operator::BinaryOperator::StrictEquality,
            ast.expression_string_literal(anchor, "symbol", None),
        ),
        symbol_name,
        ordinary_name,
    );
    match kind {
        MethodDefinitionKind::Get => ast.expression_binary(
            anchor,
            ast.expression_string_literal(anchor, "get ", None),
            oxc_syntax::operator::BinaryOperator::Addition,
            base,
        ),
        MethodDefinitionKind::Set => ast.expression_binary(
            anchor,
            ast.expression_string_literal(anchor, "set ", None),
            oxc_syntax::operator::BinaryOperator::Addition,
            base,
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
    use std::path::Path;

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
        let plan = prepare_ast(
            source,
            SourceType::default(),
            &semantic.semantic,
            true,
            None,
            false,
            None,
            None,
            false,
            false,
        )
        .unwrap();
        assert_eq!(plan.direct.len(), 1);
        let (changed, _) = run_ast(&allocator, &mut program, plan).unwrap();
        assert!(changed);
        let code = Codegen::new().build(&program).code;
        assert!(!code.contains("class Value"));
        assert!(code.contains("var Value"));
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
        let allocator = Allocator::default();
        let parsed = Parser::new(
            &allocator,
            source,
            SourceType::from_path(Path::new("x.js")).unwrap(),
        )
        .parse();
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
            &source,
            SourceType::default(),
            &semantic.semantic,
            true,
            None,
            false,
            Some(true),
            None,
            false,
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
            source,
            SourceType::default(),
            &semantic.semantic,
            true,
            None,
            false,
            Some(true),
            None,
            false,
            false,
        )
        .unwrap();
        assert!(run_ast(&allocator, &mut program, plan).unwrap().0);
    }
}
