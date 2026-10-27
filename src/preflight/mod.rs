//! Facade for the planned native preflight phase.

mod arguments;
mod block_scoping;
mod classes;
mod destructuring;
#[cfg(test)]
mod failure_inventory;
mod for_of;
pub mod helpers;
mod object_spread;
mod optimize;
pub mod options;
mod parameters;
mod regexp;
pub mod transform;

pub use options::NativePreflightOptions;
pub use transform::NativePreflightResult;

use oxc_ast::ast::{Expression, NumberBase};
use oxc_ast::builder::{AstBuilder, GetAstBuilder};
use oxc_span::Span;
use oxc_syntax::operator::UnaryOperator;
use rustc_hash::FxHashSet;

pub(super) fn reserve_generated_name(base: &str, used: &mut FxHashSet<String>) -> String {
    if used.insert(base.to_owned()) {
        return base.to_owned();
    }
    for suffix in used.len().max(2).. {
        let candidate = format!("{base}{suffix}");
        if used.insert(candidate.clone()) {
            return candidate;
        }
    }
    unreachable!()
}

pub(super) fn void_zero<'a>(ast: &AstBuilder<'a>, span: Span) -> Expression<'a> {
    Expression::new_unary_expression(
        span,
        UnaryOperator::Void,
        Expression::new_numeric_literal(span, 0.0, None, NumberBase::Decimal, ast.builder()),
        ast.builder(),
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
