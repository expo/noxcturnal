use napi::{Error, Result, Status};
use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Statement};
use oxc_parser::Parser;
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;

pub(crate) fn validate_expression(code: &str, parser_mode: Option<&str>) -> Result<()> {
    // The newline lets trailing line comments terminate. Requiring the single
    // outer ParenthesizedExpression prevents source from escaping the wrapper.
    validate_fragment(&format!("({code}\n)"), parser_mode, "expression")
}

pub(crate) fn validate_statements(code: &str, parser_mode: Option<&str>) -> Result<()> {
    validate_fragment(code, parser_mode, "statement")
}

fn validate_fragment(code: &str, parser_mode: Option<&str>, kind: &str) -> Result<()> {
    let extension = match parser_mode.unwrap_or("js") {
        "jsx" => "jsx",
        "ts" => "ts",
        "tsx" => "tsx",
        "dts" => "d.ts",
        _ => "js",
    };
    let allocator = Allocator::default();
    let parsed = Parser::new(
        &allocator,
        code,
        SourceType::from_path(format!("fragment.{extension}")).unwrap(),
    )
    .parse();
    let fail = |message: &str| {
        Error::new(
            Status::InvalidArg,
            format!("invalid {kind} fragment: {message}"),
        )
    };
    if let Some(diagnostic) = parsed.diagnostics.first() {
        return Err(fail(&diagnostic.to_string()));
    }
    if kind == "expression"
        && !matches!(parsed.program.body.as_slice(), [Statement::ExpressionStatement(statement)]
        if matches!(&statement.expression, Expression::ParenthesizedExpression(expression)
            if expression.span.start == 0 && expression.span.end as usize == code.len()))
    {
        return Err(fail("expected exactly one expression"));
    }
    let checked = SemanticBuilder::new_compiler().build(&parsed.program);
    // Fragments are inserted into an enclosing program. Unresolved exports and
    // private references can be supplied there; duplicate declarations and other
    // self-contained early errors cannot. Oxc 0.141 has no diagnostic codes for
    // these contextual checks, so keep this exception narrow and version-pinned.
    if let Some(diagnostic) = checked.diagnostics.iter().find(|diagnostic| {
        let message = diagnostic.message.as_ref();
        !(message.starts_with("Export '") && message.ends_with("' is not defined")
            || message.starts_with("Private field '#")
                && message.ends_with("' must be declared in an enclosing class")
            || message.starts_with("Private identifier '#")
                && message.ends_with("' is not allowed outside class bodies"))
    }) {
        return Err(fail(&diagnostic.to_string()));
    }
    Ok(())
}
