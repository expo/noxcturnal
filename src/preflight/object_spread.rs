use oxc_allocator::GetAllocator;
use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::builder::GetAstBuilder;
use oxc_ast::{
    ast::{
        Argument, Expression, JSXAttributeItem, JSXElement, ObjectPropertyKind, Program,
        TSTypeParameterInstantiation,
    },
    builder::AstBuilder,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_span::{GetSpan, Span};
use rustc_hash::FxHashSet;

use crate::generated::inline_helpers::INLINE_EXTENDS_HELPER_DESCRIPTOR;
use crate::preflight::helpers::{CustomHelperRequests, SourceNameReservations};

pub(super) struct Options {
    pub(super) use_built_ins: bool,
    pub(super) inline_helpers: bool,
}

/// Lower object-expression spreads directly on the shared preflight AST.
///
/// Moved expressions and property groups retain their source spans. Synthetic
/// `Object.assign` syntax is anchored to the enclosing object expression,
/// matching the nearest-origin policy of the former boundary-mapped text edit.
pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    options: Options,
) -> (bool, CustomHelperRequests) {
    let helper_name = if options.use_built_ins {
        None
    } else {
        Some(reserve_helper_name(program, "_extends"))
    };
    let helper_binding = helper_name
        .as_ref()
        .map(|name| allocator.alloc_str(name.as_str()));
    let mut pass = ObjectSpreadLowerer {
        ast: AstBuilder::new(allocator),
        changed: false,
        helper_name: helper_binding,
    };
    pass.visit_program(program);
    let mut requests = CustomHelperRequests::default();
    if pass.changed
        && let Some(helper_name) = helper_name
    {
        requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            options.inline_helpers,
            &[("_extends", &helper_name)],
        );
    }
    (pass.changed, requests)
}

/// Exact AST origins, rather than a source-text prefix: other transforms can
/// generate calls whose larger spans start at the same JSX element.
// Source-origin classification, deliberately not a unique live-node index:
// Oxc replaces JSX nodes with calls, so their NodeIds cannot link the two trees.
// Several generated nodes may inherit the same origin; only eligible props calls
// are selected below. Keep this distinct from transform mutation bookkeeping.
#[derive(Default)]
pub(super) struct JsxOrigins(FxHashSet<Span>);

impl JsxOrigins {
    pub(super) fn collect(program: &Program<'_>) -> Self {
        let mut origins = Self::default();
        origins.visit_program(program);
        origins
    }
}

impl<'a> Visit<'a> for JsxOrigins {
    fn visit_jsx_element(&mut self, element: &JSXElement<'a>) {
        if element
            .opening_element
            .attributes
            .iter()
            .any(|attribute| matches!(attribute, JSXAttributeItem::SpreadAttribute(_)))
        {
            self.0.insert(element.span);
        }
        walk::walk_jsx_element(self, element);
    }
}

/// Lower only object-spread expressions generated as the props argument of a
/// JSX `createElement` call. Oxc intentionally ignores Babel's deprecated
/// `useSpread` option and otherwise leaves these object literals intact, while
/// Babel 7's classic runtime still uses its assignment-based `extends` helper.
pub(super) fn run_jsx_props<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    inline_helpers: bool,
    origins: &JsxOrigins,
) -> (bool, CustomHelperRequests) {
    if origins.0.is_empty() {
        return (false, CustomHelperRequests::default());
    }
    let helper_name = reserve_helper_name(program, "_extends");
    let helper_binding = allocator.alloc_str(&helper_name);
    let mut pass = JsxPropsSpreadLowerer {
        origins,
        lowerer: ObjectSpreadLowerer {
            ast: AstBuilder::new(allocator),
            changed: false,
            helper_name: Some(helper_binding),
        },
    };
    pass.visit_program(program);
    let mut requests = CustomHelperRequests::default();
    if pass.lowerer.changed {
        requests.materialize_generated(
            &INLINE_EXTENDS_HELPER_DESCRIPTOR,
            inline_helpers,
            &[("_extends", &helper_name)],
        );
    }
    (pass.lowerer.changed, requests)
}

fn reserve_helper_name(program: &Program<'_>, base: &str) -> String {
    SourceNameReservations::new(program.source_text).reserve(base)
}

struct ObjectSpreadLowerer<'a> {
    ast: AstBuilder<'a>,
    changed: bool,
    helper_name: Option<&'a str>,
}

impl<'a> ObjectSpreadLowerer<'a> {
    fn flush_properties(
        &self,
        properties: &mut ArenaVec<'a, ObjectPropertyKind<'a>>,
        arguments: &mut ArenaVec<'a, Argument<'a>>,
        fallback_span: Span,
    ) {
        if properties.is_empty() {
            return;
        }
        let span = properties
            .first()
            .map_or(fallback_span, GetSpan::span)
            .merge(properties.last().map_or(fallback_span, GetSpan::span));
        let group = oxc_ast::ast::Expression::new_object_expression(
            span,
            properties.take_in(&self.ast),
            self.ast.builder(),
        );
        arguments.push(group.into());
    }

    fn lower_expression(&mut self, expression: &mut Expression<'a>) {
        let Expression::ObjectExpression(object) = expression else {
            return;
        };
        if !object
            .properties
            .iter()
            .any(|property| matches!(property, ObjectPropertyKind::SpreadProperty(_)))
        {
            return;
        }

        let object_span = object.span;
        let starts_with_spread = matches!(
            object.properties.first(),
            Some(ObjectPropertyKind::SpreadProperty(_))
        );
        let old_properties = object.properties.take_in(&self.ast);
        let mut grouped = ArenaVec::new_in(&self.ast);
        let mut arguments = ArenaVec::new_in(&self.ast);

        if starts_with_spread {
            let empty = oxc_ast::ast::Expression::new_object_expression(
                object_span,
                ArenaVec::new_in(&self.ast),
                self.ast.builder(),
            );
            arguments.push(empty.into());
        }

        for property in old_properties {
            match property {
                ObjectPropertyKind::ObjectProperty(property) => {
                    grouped.push(ObjectPropertyKind::ObjectProperty(property));
                }
                ObjectPropertyKind::SpreadProperty(spread) => {
                    self.flush_properties(&mut grouped, &mut arguments, object_span);
                    arguments.push(spread.unbox().argument.into());
                }
            }
        }
        self.flush_properties(&mut grouped, &mut arguments, object_span);

        let callee = if let Some(helper_name) = self.helper_name {
            oxc_ast::ast::Expression::new_identifier(
                object_span,
                self.ast.allocator().alloc_str(helper_name),
                self.ast.builder(),
            )
        } else {
            oxc_ast::ast::MemberExpression::new_static_member_expression(
                object_span,
                oxc_ast::ast::Expression::new_identifier(object_span, "Object", self.ast.builder()),
                oxc_ast::ast::IdentifierName::new(object_span, "assign", self.ast.builder()),
                false,
                self.ast.builder(),
            )
            .into()
        };
        {
            *expression = oxc_ast::ast::Expression::new_call_expression(
                object_span,
                callee,
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
                self.ast.builder(),
            );
        }
        self.changed = true;
    }
}

impl<'a> VisitMut<'a> for ObjectSpreadLowerer<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        // Descendants first reaches the old outermost-only pass's fixpoint in
        // one traversal, without intermediate renders or reparses.
        walk_mut::walk_expression(self, expression);

        self.lower_expression(expression);
    }
}

struct JsxPropsSpreadLowerer<'a, 'o> {
    origins: &'o JsxOrigins,
    lowerer: ObjectSpreadLowerer<'a>,
}

impl<'a> VisitMut<'a> for JsxPropsSpreadLowerer<'a, '_> {
    fn visit_call_expression(&mut self, call: &mut oxc_ast::ast::CallExpression<'a>) {
        walk_mut::walk_call_expression(self, call);
        if !self.origins.0.contains(&call.span) {
            return;
        }
        let Some(props) = call
            .arguments
            .get_mut(1)
            .and_then(Argument::as_expression_mut)
        else {
            return;
        };
        self.lowerer.lower_expression(props);
    }
}
