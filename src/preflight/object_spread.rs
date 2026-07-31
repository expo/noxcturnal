use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder,
    ast::{Argument, Expression, ObjectPropertyKind, Program, TSTypeParameterInstantiation},
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::{GetSpan, Span};

use crate::preflight::helpers::CustomHelperRequests;

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
        requests.request("extends");
        requests.reserve_scope_names([helper_name.clone()]);
        if options.inline_helpers {
            requests.push_fragment(
                format!("function {helper_name}(){{return {helper_name}=Object.assign?Object.assign.bind():function(target){{for(var i=1;i<arguments.length;i++){{var source=arguments[i];for(var key in source)if(Object.prototype.hasOwnProperty.call(source,key))target[key]=source[key]}}return target}},{helper_name}.apply(null,arguments)}}\n"),
                format!("function {helper_name}() {{\n  return ({helper_name} = Object.assign\n    ? Object.assign.bind()\n    : function (target) {{\n        for (var i = 1; i < arguments.length; i++) {{\n          var source = arguments[i];\n          for (var key in source)\n            if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];\n        }}\n        return target;\n      }}), {helper_name}.apply(null, arguments);\n}}\n"),
            );
        } else {
            let fragment =
                format!("var {helper_name}=require('@babel/runtime/helpers/extends');\n");
            let pretty =
                format!("var {helper_name} = require('@babel/runtime/helpers/extends');\n");
            requests.push_fragment(fragment, pretty);
        }
    }
    (pass.changed, requests)
}

fn reserve_helper_name(program: &Program<'_>, base: &str) -> String {
    let source = &program.source_text;
    if !source.contains(base) {
        return base.to_string();
    }
    for suffix in 2.. {
        let candidate = format!("{base}{suffix}");
        if !source.contains(&candidate) {
            return candidate;
        }
    }
    unreachable!()
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
        let callee = if let Some(helper_name) = self.helper_name {
            self.ast
                .expression_identifier(object_span, self.ast.allocator.alloc_str(helper_name))
        } else {
            self.ast
                .member_expression_static(
                    object_span,
                    self.ast.expression_identifier(object_span, "Object"),
                    self.ast.identifier_name(object_span, "assign"),
                    false,
                )
                .into()
        };
        #[expect(deprecated)]
        {
            *expression = self.ast.expression_call(
                object_span,
                callee,
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
            );
        }
        self.changed = true;
    }
}
