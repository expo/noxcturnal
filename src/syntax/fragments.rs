use napi::{Error, Result, Status};
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

pub(crate) fn validate_expression(code: &str, parser_mode: Option<&str>) -> Result<()> {
    validate_fragment(&format!("({code})"), parser_mode, "expression")
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
    if parsed.diagnostics.is_empty() {
        Ok(())
    } else {
        Err(Error::new(
            Status::InvalidArg,
            format!("invalid {kind} fragment: {}", parsed.diagnostics[0]),
        ))
    }
}
