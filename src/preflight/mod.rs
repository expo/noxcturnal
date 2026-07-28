//! Facade for the planned native preflight phase.

use oxc_ast::ast::Directive;

mod block_scoping;
mod classes;
mod destructuring;
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

/// Where generated statements may be inserted after a directive prologue, and
/// the separator that insertion has to carry.
///
/// A directive written without a trailing semicolon is terminated by automatic
/// semicolon insertion, and ASI only applies at a line break. Text placed at the
/// directive's end therefore lands *inside* the statement: `"use strict"` plus
/// `var _ref = x;` reads as `"use strict"var`, which is not a program. Emitting
/// the semicolon the source omitted keeps the prologue a prologue and leaves the
/// generated statements at the front of the body.
///
/// `fallback` is the offset to use when there is no prologue — the start of a
/// program, or the byte after a function body's `{`.
pub(crate) fn directive_prologue_insertion(
    source: &str,
    directives: &[Directive<'_>],
    fallback: u32,
) -> (u32, &'static str) {
    let Some(directive) = directives.last() else {
        return (fallback, "");
    };
    let end = directive.span.end;
    let terminated = end
        .checked_sub(1)
        .and_then(|index| source.as_bytes().get(index as usize))
        == Some(&b';');
    (end, if terminated { "" } else { ";" })
}
