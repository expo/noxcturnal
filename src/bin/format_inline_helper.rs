use std::io::{self, Read};

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions};
use oxc_parser::Parser;
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;

#[expect(clippy::print_stdout)]
fn main() {
    let mut source = String::new();
    io::stdin()
        .read_to_string(&mut source)
        .expect("read helper source");
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &source, SourceType::default()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "generated helper source must parse: {:?}",
        parsed.diagnostics
    );
    let arguments = std::env::args().collect::<Vec<_>>();
    if arguments.iter().any(|argument| argument == "--bindings") {
        let semantic = SemanticBuilder::new().build(&parsed.program);
        assert!(
            semantic.diagnostics.is_empty(),
            "generated helper source must build semantic: {:?}",
            semantic.diagnostics
        );
        let scoping = semantic.semantic.scoping();
        let root = scoping.root_scope_id();
        let mut names = scoping
            .symbol_ids()
            .filter(|symbol_id| scoping.symbol_scope_id(*symbol_id) == root)
            .map(|symbol_id| scoping.symbol_name(symbol_id))
            .collect::<Vec<_>>();
        names.sort_unstable();
        names.dedup();
        print!("{}", names.join("\n"));
        return;
    }
    let generated = Codegen::new()
        .with_options(CodegenOptions {
            comments: CommentOptions::default(),
            ..CodegenOptions::default()
        })
        .build(&parsed.program);
    print!("{}", generated.code);
}
