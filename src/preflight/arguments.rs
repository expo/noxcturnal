//! Transport a lexical arguments binding when a value snapshot would be unsafe.
//!
//! The reference cell is created at the arrow expression, before parameter or
//! async lowering changes that arrow's implicit arguments environment. Its
//! accessors close over the original binding, including later writes and eval.
use super::helpers::CustomHelperRequests;
use crate::generated::inline_helpers::INLINE_TO_PROPERTY_KEY_HELPER_DESCRIPTOR;
use oxc_allocator::{Allocator, CloneIn, GetAllocator, TakeIn};
use oxc_ast::{AstKind, ast::*, builder::AstBuilder};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_parser::Parser;
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, SourceType, Span};
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator};
use rustc_hash::{FxHashMap, FxHashSet};

use super::options::NativePreflightOptions;

pub(super) struct Plan {
    groups: FxHashMap<NodeId, FxHashSet<NodeId>>,
    reserved: FxHashSet<String>,
    names: FxHashMap<NodeId, InferredName>,
    keys: FxHashMap<NodeId, String>,
    key_helper: String,
    inline_helpers: bool,
}

enum InferredName {
    Static(String),
    Key(String),
}

fn selected_arrow(arrow: &ArrowFunctionExpression<'_>, options: &NativePreflightOptions) -> bool {
    let parameters = options.parameters == Some(true)
        || (options.object_rest_spread == Some(true)
            && super::parameters::parameters_have_object_rest(&arrow.params));
    (parameters
        && (arrow.params.rest.is_some()
            || arrow.params.items.iter().any(|p| {
                p.initializer.is_some()
                    || !matches!(p.pattern, BindingPattern::BindingIdentifier(_))
            })))
        || (options.async_functions == Some(true) && arrow.r#async)
}

// A converted arrow cannot reproduce direct eval's lexical environment after
// acquiring an ordinary function's own arguments binding.
pub(super) fn has_direct_eval(semantic: &Semantic<'_>, options: &NativePreflightOptions) -> bool {
    semantic.nodes().iter_enumerated().any(|(id, node)| {
        let AstKind::CallExpression(call) = node.kind() else {
            return false;
        };
        if call.optional
            || !matches!(call.callee.get_inner_expression(), Expression::Identifier(id)
            if id.name == "eval" && id.reference_id.get().is_some_and(|id|
                semantic.scoping().get_reference(id).symbol_id().is_none()))
        {
            return false;
        }
        for ancestor in semantic.nodes().ancestor_ids(id) {
            match semantic.nodes().kind(ancestor) {
                AstKind::Function(_) => break,
                AstKind::ArrowFunctionExpression(arrow) if selected_arrow(arrow, options) => {
                    return true;
                }
                _ => {}
            }
        }
        false
    })
}

pub(super) fn prepare(semantic: &Semantic<'_>, options: &NativePreflightOptions) -> Option<Plan> {
    let nodes = semantic.nodes();
    let scoping = semantic.scoping();
    let selected: FxHashSet<_> = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| {
            let AstKind::ArrowFunctionExpression(arrow) = node.kind() else {
                return None;
            };
            selected_arrow(arrow, options).then_some(id)
        })
        .collect();
    if selected.is_empty() {
        return None;
    }
    // Writes and direct eval require live transport even when creation itself
    // occurs in a statement list. Conservatively include all lexical captures
    // in such a program; reference identities still select the exact uses.
    let live = nodes.iter_enumerated().any(|(_, node)| match node.kind() {
        AstKind::IdentifierReference(id) if id.name == "arguments" => id
            .reference_id
            .get()
            .is_some_and(|id| scoping.get_reference(id).is_write()),
        AstKind::BindingIdentifier(id) if id.name == "arguments" => true,
        AstKind::CallExpression(call) => {
            matches!(&call.callee, Expression::Identifier(id) if id.name == "eval")
        }
        _ => false,
    });
    let mut groups: FxHashMap<NodeId, FxHashSet<NodeId>> = FxHashMap::default();
    for (id, node) in nodes.iter_enumerated() {
        let AstKind::IdentifierReference(reference) = node.kind() else {
            continue;
        };
        if reference.name != "arguments" {
            continue;
        }
        let declaration = reference
            .reference_id
            .get()
            .and_then(|id| scoping.get_reference(id).symbol_id())
            .map(|symbol| scoping.symbol_declaration(symbol));
        let mut owner = None;
        let mut provider_is_program = true;
        for ancestor in nodes.ancestor_ids(id) {
            if matches!(nodes.kind(ancestor), AstKind::Function(_)) {
                provider_is_program = false;
                break;
            }
            if selected.contains(&ancestor) {
                if declaration.is_some_and(|decl| {
                    decl == ancestor || nodes.ancestor_ids(decl).any(|id| id == ancestor)
                }) {
                    break;
                }
                owner = Some(ancestor);
            }
        }
        let Some(owner) = owner else {
            continue;
        };
        let crosses_evaluation_boundary = nodes
            .ancestor_ids(owner)
            .take_while(|ancestor| {
                !matches!(
                    nodes.kind(*ancestor),
                    AstKind::Program(_)
                        | AstKind::FunctionBody(_)
                        | AstKind::BlockStatement(_)
                        | AstKind::StaticBlock(_)
                        | AstKind::SwitchCase(_)
                )
            })
            .any(|ancestor| {
                matches!(
                    nodes.kind(ancestor),
                    AstKind::WithStatement(_)
                        | AstKind::ForStatement(_)
                        | AstKind::ForOfStatement(_)
                        | AstKind::ForInStatement(_)
                        | AstKind::WhileStatement(_)
                        | AstKind::DoWhileStatement(_)
                        | AstKind::IfStatement(_)
                        | AstKind::ConditionalExpression(_)
                        | AstKind::LogicalExpression(_)
                        | AstKind::SequenceExpression(_)
                        | AstKind::FormalParameter(_)
                )
            });
        if live || provider_is_program || crosses_evaluation_boundary {
            groups.entry(owner).or_default().insert(id);
        }
    }
    if groups.is_empty() {
        return None;
    }
    let mut reserved: FxHashSet<String> = scoping.symbol_names().map(str::to_owned).collect();
    reserved.extend(
        scoping
            .root_unresolved_references()
            .keys()
            .map(ToString::to_string),
    );
    let mut keys = FxHashMap::default();
    let mut names: FxHashMap<_, _> = groups
        .keys()
        .filter_map(|id| {
            let parent = nodes
                .ancestor_ids(*id)
                .find(|id| !matches!(nodes.kind(*id), AstKind::ParenthesizedExpression(_)))?;
            let name = match nodes.kind(parent) {
                AstKind::VariableDeclarator(decl) => decl
                    .id
                    .get_binding_identifier()
                    .map(|id| id.name.to_string()),
                AstKind::AssignmentExpression(assign) => match &assign.left {
                    AssignmentTarget::AssignmentTargetIdentifier(id) => Some(id.name.to_string()),
                    _ => None,
                },
                AstKind::ObjectProperty(property) if !property.method => property
                    .key
                    .static_name()
                    .filter(|name| property.computed || name != "__proto__")
                    .map(|name| name.into_owned()),
                AstKind::FormalParameter(parameter) => parameter
                    .pattern
                    .get_binding_identifier()
                    .map(|id| id.name.to_string()),
                AstKind::AssignmentPattern(pattern) => pattern
                    .left
                    .get_binding_identifier()
                    .map(|id| id.name.to_string()),
                AstKind::AssignmentTargetWithDefault(pattern) => match &pattern.binding {
                    AssignmentTarget::AssignmentTargetIdentifier(id) => Some(id.name.to_string()),
                    _ => None,
                },
                AstKind::AssignmentTargetPropertyIdentifier(property) => {
                    Some(property.binding.name.to_string())
                }
                AstKind::PropertyDefinition(property) => {
                    property.key.static_name().map(|name| name.into_owned())
                }
                AstKind::ExportDefaultDeclaration(_) => Some("default".into()),

                _ => None,
            }?;
            Some((*id, InferredName::Static(name)))
        })
        .collect();
    // Computed names must use the same normalized key as the original property.
    // Save only the primitive key; coercing a raw object twice can run user code.
    for id in groups.keys() {
        let Some(parent) = nodes
            .ancestor_ids(*id)
            .find(|id| !matches!(nodes.kind(*id), AstKind::ParenthesizedExpression(_)))
        else {
            continue;
        };
        if let AstKind::ObjectProperty(property) = nodes.kind(parent)
            && property.computed
            && property.key.static_name().is_none()
        {
            let key = super::reserve_generated_name("_argumentsKey", &mut reserved);
            names.insert(*id, InferredName::Key(key.clone()));
            keys.insert(parent, key);
        }
    }
    let key_helper = if keys.is_empty() {
        String::new()
    } else {
        super::reserve_generated_name("_toPropertyKey", &mut reserved)
    };
    Some(Plan {
        groups,
        reserved,
        names,
        keys,
        key_helper,
        inline_helpers: options.helpers_mode.as_deref() == Some("inline"),
    })
}

pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    plan: Plan,
) -> CustomHelperRequests {
    let mut requests = CustomHelperRequests::default();
    if !plan.keys.is_empty() {
        let runtime = super::reserve_generated_name("_toPropertyKey2", &mut plan.reserved.clone());
        requests.materialize_generated(
            &INLINE_TO_PROPERTY_KEY_HELPER_DESCRIPTOR,
            plan.inline_helpers,
            &[
                ("_toPropertyKey", &plan.key_helper),
                ("_toPropertyKey2", &runtime),
            ],
        );
        let mut declarations: Vec<_> = plan.keys.values().cloned().collect();
        declarations.sort();
        let source = allocator.alloc_str(&format!("var {};", declarations.join(",")));
        let mut parsed = Parser::new(allocator, source, SourceType::cjs()).parse();
        assert!(parsed.diagnostics.is_empty());
        let mut declaration = parsed.program.body.remove(0);
        Anchors(Span::new(0, 0)).visit_statement(&mut declaration);
        program.body.insert(0, declaration);
    }
    Capture {
        allocator,
        groups: plan.groups,
        reserved: plan.reserved,
        names: plan.names,
        keys: plan.keys,
        key_helper: plan.key_helper,
    }
    .visit_program(program);
    requests
}

struct Anchors(Span);
impl VisitMut<'_> for Anchors {
    fn visit_span(&mut self, span: &mut Span) {
        *span = self.0;
    }
}

struct Capture<'a> {
    allocator: &'a Allocator,
    groups: FxHashMap<NodeId, FxHashSet<NodeId>>,
    reserved: FxHashSet<String>,
    names: FxHashMap<NodeId, InferredName>,
    keys: FxHashMap<NodeId, String>,
    key_helper: String,
}
impl<'a> VisitMut<'a> for Capture<'a> {
    fn visit_object_property(&mut self, property: &mut ObjectProperty<'a>) {
        if let Some(key) = self.keys.remove(&property.node_id.get()) {
            let ast = AstBuilder::new(self.allocator);
            let span = property.key.span();
            let original = property.key.take_in(&ast).into_expression();
            let normalized = Expression::new_call_expression(
                span,
                Expression::new_identifier(span, self.allocator.alloc_str(&self.key_helper), &ast),
                None::<oxc_allocator::Box<'a, TSTypeParameterInstantiation<'a>>>,
                [Argument::from(original)],
                false,
                &ast,
            );
            property.key = PropertyKey::from(Expression::new_assignment_expression(
                span,
                AssignmentOperator::Assign,
                AssignmentTarget::new_assignment_target_identifier(
                    span,
                    self.allocator.alloc_str(&key),
                    &ast,
                ),
                normalized,
                &ast,
            ));
        }
        walk_mut::walk_object_property(self, property);
    }

    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        let original_id = expression.node_id();
        let Some(references) = self.groups.remove(&original_id) else {
            walk_mut::walk_expression(self, expression);
            return;
        };
        let ast = AstBuilder::new(self.allocator);
        let name = super::reserve_generated_name("_argumentsRef", &mut self.reserved);
        let mut rewriter = References {
            ast: AstBuilder::new(self.allocator),
            name: self.allocator.alloc_str(&name),
            references: &references,
            writes: false,
            deletes: false,
        };
        rewriter.visit_expression(expression);
        // Only emit assignment/delete syntax that was legal in the original
        // context (strict code cannot assign to or delete implicit arguments).
        let set = if rewriter.writes {
            "v => arguments = v"
        } else {
            "v => v"
        };
        let delete = if rewriter.deletes {
            "() => delete arguments"
        } else {
            "() => false"
        };
        walk_mut::walk_expression(self, expression);
        let source = self.allocator.alloc_str(&format!(
            "(({name}) => null)(((get,set,type,del) => ({{get value(){{return get()}},set value(v){{set(v)}},type,del}}))(() => arguments,{set},() => typeof arguments,{delete}))"
        ));
        let parsed = Parser::new(self.allocator, source, SourceType::cjs()).parse();
        assert!(
            parsed.diagnostics.is_empty(),
            "generated arguments capture must parse"
        );
        let mut body = parsed.program.body;
        let Statement::ExpressionStatement(statement) = body.remove(0) else {
            unreachable!()
        };
        let mut wrapper = statement.unbox().expression;
        // New nodes have no semantic IDs yet. Give them mapping provenance only;
        // the caller rebuilds semantics before another identity-sensitive pass.
        Anchors(Span::new(expression.span().start, expression.span().start))
            .visit_expression(&mut wrapper);
        let Expression::CallExpression(call) = &mut wrapper else {
            unreachable!()
        };
        let Expression::ArrowFunctionExpression(factory) = call.callee.get_inner_expression_mut()
        else {
            unreachable!()
        };
        let mut value = expression.take_in(&ast);
        if let Some(name) = self.names.remove(&original_id) {
            let span = value.span();
            let key = match name {
                InferredName::Static(name) => Expression::new_string_literal(
                    span,
                    self.allocator.alloc_str(&name),
                    None,
                    &ast,
                ),
                InferredName::Key(name) => {
                    Expression::new_identifier(span, self.allocator.alloc_str(&name), &ast)
                }
            };
            let object = Expression::new_object_expression(
                span,
                [ObjectPropertyKind::new_object_property(
                    span,
                    PropertyKind::Init,
                    PropertyKey::from(key.clone_in(self.allocator)),
                    value,
                    false,
                    false,
                    true,
                    &ast,
                )],
                &ast,
            );
            value = Expression::new_computed_member_expression(span, object, key, false, &ast);
        }
        factory.body = ArrowFunctionBody::from(value);
        *expression = wrapper;
    }
}

struct References<'a, 'p> {
    ast: AstBuilder<'a>,
    name: &'a str,
    references: &'p FxHashSet<NodeId>,
    writes: bool,
    deletes: bool,
}
impl<'a> References<'a, '_> {
    fn member(&self, span: Span, property: &str) -> MemberExpression<'a> {
        MemberExpression::new_static_member_expression(
            span,
            Expression::new_identifier(span, self.name, &self.ast),
            IdentifierName::new(span, self.ast.allocator().alloc_str(property), &self.ast),
            false,
            &self.ast,
        )
    }
    fn call(&self, span: Span, property: &str) -> Expression<'a> {
        Expression::new_call_expression(
            span,
            Expression::from(self.member(span, property)),
            None::<oxc_allocator::Box<'a, TSTypeParameterInstantiation<'a>>>,
            [],
            false,
            &self.ast,
        )
    }
    fn selected(&self, expression: &Expression<'a>) -> bool {
        matches!(expression, Expression::Identifier(id) if self.references.contains(&id.node_id.get()))
    }
    fn value(&self, span: Span) -> Expression<'a> {
        Expression::from(self.member(span, "value"))
    }
}
impl<'a> VisitMut<'a> for References<'a, '_> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if self.selected(expression) {
            *expression = self.value(expression.span());
            return;
        }
        if let Expression::UnaryExpression(unary) = expression
            && self.selected(unary.argument.get_inner_expression())
        {
            match unary.operator {
                UnaryOperator::Typeof => {
                    *expression = self.call(unary.span, "type");
                    return;
                }
                UnaryOperator::Delete => {
                    self.deletes = true;
                    *expression = self.call(unary.span, "del");
                    return;
                }
                _ => {}
            }
        }
        walk_mut::walk_expression(self, expression);
    }
    fn visit_call_expression(&mut self, call: &mut CallExpression<'a>) {
        if self.selected(call.callee.get_inner_expression()) {
            call.callee = Expression::new_sequence_expression(
                call.callee.span(),
                [
                    Expression::new_numeric_literal(
                        call.span,
                        0.0,
                        None,
                        NumberBase::Decimal,
                        &self.ast,
                    ),
                    self.value(call.callee.span()),
                ],
                &self.ast,
            );
        }
        walk_mut::walk_call_expression(self, call);
    }
    fn visit_tagged_template_expression(&mut self, tag: &mut TaggedTemplateExpression<'a>) {
        if self.selected(tag.tag.get_inner_expression()) {
            tag.tag = Expression::new_sequence_expression(
                tag.tag.span(),
                [
                    Expression::new_numeric_literal(
                        tag.span,
                        0.0,
                        None,
                        NumberBase::Decimal,
                        &self.ast,
                    ),
                    self.value(tag.tag.span()),
                ],
                &self.ast,
            );
        }
        walk_mut::walk_tagged_template_expression(self, tag);
    }
    fn visit_assignment_target(&mut self, target: &mut AssignmentTarget<'a>) {
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = target
            && self.references.contains(&id.node_id.get())
        {
            self.writes = true;
            *target = AssignmentTarget::from(self.member(id.span, "value"));
            return;
        }
        walk_mut::walk_assignment_target(self, target);
    }
    fn visit_simple_assignment_target(&mut self, target: &mut SimpleAssignmentTarget<'a>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = target
            && self.references.contains(&id.node_id.get())
        {
            self.writes = true;
            *target = SimpleAssignmentTarget::from(self.member(id.span, "value"));
            return;
        }
        walk_mut::walk_simple_assignment_target(self, target);
    }
    fn visit_assignment_target_property(&mut self, property: &mut AssignmentTargetProperty<'a>) {
        if let AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(shorthand) = property
            && self.references.contains(&shorthand.binding.node_id.get())
        {
            self.writes = true;
            let span = shorthand.span;
            let target = AssignmentTarget::from(self.member(span, "value"));
            let binding = if let Some(mut init) = shorthand.init.take() {
                self.visit_expression(&mut init);
                AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    span, target, init, &self.ast,
                )
            } else {
                AssignmentTargetMaybeDefault::from(target)
            };
            *property = AssignmentTargetProperty::new_assignment_target_property_property(
                span,
                PropertyKey::new_static_identifier(span, "arguments", &self.ast),
                binding,
                false,
                &self.ast,
            );
            return;
        }
        walk_mut::walk_assignment_target_property(self, property);
    }
    fn visit_object_property(&mut self, property: &mut ObjectProperty<'a>) {
        walk_mut::walk_object_property(self, property);
        if property.shorthand && !matches!(property.value, Expression::Identifier(_)) {
            property.shorthand = false;
        }
    }
}
