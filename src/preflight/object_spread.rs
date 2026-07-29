use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder,
    ast::{Argument, Expression, ObjectPropertyKind, Program, TSTypeParameterInstantiation},
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::{GetSpan, Span};

/// Lower object-expression spreads directly on the shared preflight AST.
///
/// Moved expressions and property groups retain their source spans. Synthetic
/// `Object.assign` syntax is anchored to the enclosing object expression,
/// matching the nearest-origin policy of the former boundary-mapped text edit.
pub(super) fn run<'a>(allocator: &'a Allocator, program: &mut Program<'a>) -> bool {
    let mut pass = ObjectSpreadLowerer {
        ast: AstBuilder::new(allocator),
        changed: false,
    };
    pass.visit_program(program);
    pass.changed
}

struct ObjectSpreadLowerer<'a> {
    ast: AstBuilder<'a>,
    changed: bool,
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
        #[expect(deprecated)]
        let group = self
            .ast
            .expression_object(span, properties.take_in(&self.ast));
        arguments.push(group.into());
    }
}

impl<'a> VisitMut<'a> for ObjectSpreadLowerer<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        // Descendants first reaches the old outermost-only pass's fixpoint in
        // one traversal, without intermediate renders or reparses.
        walk_mut::walk_expression(self, expression);

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
            #[expect(deprecated)]
            let empty = self
                .ast
                .expression_object(object_span, ArenaVec::new_in(&self.ast));
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

        #[expect(deprecated)]
        let callee = self.ast.member_expression_static(
            object_span,
            self.ast.expression_identifier(object_span, "Object"),
            self.ast.identifier_name(object_span, "assign"),
            false,
        );
        #[expect(deprecated)]
        {
            *expression = self.ast.expression_call(
                object_span,
                callee.into(),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
            );
        }
        self.changed = true;
    }
}
