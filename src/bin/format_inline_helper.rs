use std::io::{self, Read};

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions};
use oxc_parser::Parser;
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;

#[expect(clippy::print_stdout)]
fn main() {
    let mut input = String::new();
    io::stdin()
        .read_to_string(&mut input)
        .expect("read helper sources");
    let sources: Vec<String> = serde_json::from_str(&input).expect("read JSON helper source array");
    let fragments: Vec<_> = sources.iter().map(|source| describe(source)).collect();
    print!(
        "{}",
        serde_json::to_string(&fragments).expect("serialize helper metadata")
    );
}

fn describe(source: &str) -> serde_json::Value {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, SourceType::default()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "generated helper source must parse: {:?}",
        parsed.diagnostics
    );
    let semantic = SemanticBuilder::new().build(&parsed.program);
    assert!(
        semantic.diagnostics.is_empty(),
        "generated helper source must build semantic: {:?}",
        semantic.diagnostics
    );
    let scoping = semantic.semantic.scoping();
    let root = scoping.root_scope_id();
    let mut globals = scoping
        .root_unresolved_references()
        .keys()
        .map(|name| name.as_str())
        // Script runtime loaders intentionally follow the source require binding.
        .filter(|name| *name != "require")
        .collect::<Vec<_>>();
    globals.sort_unstable();
    globals.dedup();
    let mut bindings = scoping
        .symbol_ids()
        .filter(|symbol_id| scoping.symbol_scope_id(*symbol_id) == root)
        .map(|symbol_id| scoping.symbol_name(symbol_id))
        .collect::<Vec<_>>();
    bindings.sort_unstable();
    bindings.dedup();
    let generated = Codegen::new()
        .with_options(CodegenOptions {
            comments: CommentOptions::default(),
            ..CodegenOptions::default()
        })
        .build(&parsed.program);
    serde_json::json!({ "prettyCode": generated.code, "bindings": bindings, "globals": globals })
}
