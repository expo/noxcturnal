//! Automatic module output preparation, shared by AST emission and text-edit output.
use napi_derive::napi;
use oxc_allocator::Allocator;
use oxc_ast::{
    ast::{ForOfStatement, Program, Statement, StringLiteral, TSModuleReference},
    builder::{AstBuilder, GetAstBuilder},
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::Span;
use oxc_syntax::scope::ScopeFlags;

pub(crate) const STRICT_DIRECTIVE: &str = "\n\"use strict\";\n";

#[napi(object)]
pub struct NativeOutputPreparation {
    pub offset: u32,
    pub content: String,
}

pub(crate) fn is_module(program: &Program<'_>, has_import_meta: bool, filename: &str) -> bool {
    filename.ends_with(".mjs")
        || has_import_meta
        || has_static_module_syntax(program)
        || (program.source_type.is_module() && {
            let mut detector = TopLevelAwait(false);
            detector.visit_program(program);
            detector.0
        })
}

/// Source coordinates are emission anchors, not node identities. Reuse the input
/// parse, and keep the insertion inside output-section factory wrappers.
pub(crate) fn prepare(
    source: &str,
    program: &Program<'_>,
    has_import_meta: bool,
    filename: &str,
) -> Option<NativeOutputPreparation> {
    if !is_module(program, has_import_meta, filename)
        || program
            .directives
            .iter()
            .any(|directive| directive.directive == "use strict")
    {
        return None;
    }
    let byte = program
        .directives
        .last()
        .map(|directive| directive.span.end)
        .or_else(|| program.hashbang.as_ref().map(|hashbang| hashbang.span.end))
        .unwrap_or(0);
    Some(NativeOutputPreparation {
        offset: source[..byte as usize].encode_utf16().count() as u32,
        content: if byte == 0 {
            STRICT_DIRECTIVE.trim_start_matches('\n')
        } else {
            STRICT_DIRECTIVE
        }
        .into(),
    })
}

fn has_static_module_syntax(program: &Program<'_>) -> bool {
    program.body.iter().any(|statement| {
        matches!(statement, Statement::TSImportEqualsDeclaration(declaration)
            if matches!(declaration.module_reference, TSModuleReference::ExternalModuleReference(_)))
        || matches!(
            statement,
            Statement::ImportDeclaration(_)
                | Statement::ExportDeclaration(_)
                | Statement::ExportFromDeclaration(_)
                | Statement::ExportNamedDeclaration(_)
                | Statement::ExportDefaultDeclaration(_)
                | Statement::ExportAllDeclaration(_)
        )
    })
}

struct TopLevelAwait(bool);

impl<'a> Visit<'a> for TopLevelAwait {
    fn visit_function(&mut self, _function: &oxc_ast::ast::Function<'a>, _flags: ScopeFlags) {}
    fn visit_arrow_function_expression(
        &mut self,
        _arrow: &oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
    }
    fn visit_await_expression(&mut self, _expression: &oxc_ast::ast::AwaitExpression<'a>) {
        self.0 = true;
    }
    fn visit_variable_declaration(&mut self, declaration: &oxc_ast::ast::VariableDeclaration<'a>) {
        self.0 |= declaration.kind == oxc_ast::ast::VariableDeclarationKind::AwaitUsing;
        if !self.0 {
            walk::walk_variable_declaration(self, declaration);
        }
    }
    fn visit_for_of_statement(&mut self, statement: &ForOfStatement<'a>) {
        self.0 |= statement.r#await;
        if !self.0 {
            walk::walk_for_of_statement(self, statement);
        }
    }
}

/// Keep parser-classified ESM (including import.meta and top-level await), and
/// detect imports synthesized by language lowering before DCE removes markers.
pub(crate) fn materialize_module_strictness<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    input_is_module: bool,
) -> bool {
    if !(input_is_module || has_static_module_syntax(program))
        || program
            .directives
            .iter()
            .any(|directive| directive.directive == "use strict")
    {
        return false;
    }
    let ast = AstBuilder::new(allocator);
    program.directives.push(oxc_ast::ast::Directive::new(
        Span::default(),
        StringLiteral::new(Span::default(), "use strict", None, ast.builder()),
        "use strict",
        ast.builder(),
    ));
    true
}
