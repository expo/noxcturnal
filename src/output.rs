//! Automatic module output preparation, shared by AST emission and text-edit output.
use oxc_allocator::Allocator;
use oxc_ast::{
    ast::{
        Declaration, ForOfStatement, Program, Statement, StringLiteral, TSModuleReference,
        TSNamespaceDeclarationBody,
    },
    builder::{AstBuilder, GetAstBuilder},
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::{GetSpan, Span};
use oxc_syntax::{module_record::ModuleRecord, scope::ScopeFlags};

pub(crate) const STRICT_DIRECTIVE: &str = "\n\"use strict\";\n";

pub(crate) struct OutputPreparation {
    pub offset: u32,
    pub content: String,
}

pub(crate) fn is_module(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    filename: &str,
) -> bool {
    if filename.ends_with(".mjs") {
        return true;
    }
    // Oxc already classifies unambiguous JavaScript, including import.meta and
    // top-level await. Explicit module parse goals and TypeScript need the
    // compatibility checks below rather than trusting this flag alone.
    if !program.source_type.is_typescript()
        && (module_record.has_module_syntax || !program.source_type.is_module())
    {
        return module_record.has_module_syntax;
    }
    !module_record.import_metas.is_empty()
        || has_static_module_syntax(&program.body)
        || (program.source_type.is_module() && {
            let mut detector = TopLevelAwait(false);
            detector.visit_program(program);
            detector.0
        })
}

/// Strictness is an input obligation even if an edit removes its directive.
pub(crate) fn needs_strict_output(
    program: &Program<'_>,
    module_record: &ModuleRecord<'_>,
    filename: &str,
) -> bool {
    is_module(program, module_record, filename)
        || program
            .directives
            .iter()
            .any(|directive| directive.directive == "use strict")
}

pub(crate) struct BodyBoundary {
    pub offset: u32,
    pub prefix: String,
}

pub(crate) struct BodyLayout {
    pub preamble: BodyBoundary,
    pub epilogue: BodyBoundary,
    pub eof_line_boundary: bool,
    pub strict: Option<OutputPreparation>,
}

pub(crate) fn body_layout(source: &str, filename: &str, strict: bool) -> napi::Result<BodyLayout> {
    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(
        &allocator,
        source,
        crate::syntax::classification::source_type(filename, source)?,
    )
    .parse();
    if !parsed.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "output-assembly",
        ));
    }
    let utf16 = crate::engine::utf16_index(source, &allocator);
    let first_statement = parsed
        .program
        .body
        .first()
        .map_or(source.len(), |statement| statement.span().start as usize);
    let mut preamble = parsed
        .program
        .directives
        .last()
        .map(|directive| directive.span.end as usize)
        .or_else(|| {
            parsed
                .program
                .hashbang
                .as_ref()
                .map(|hashbang| hashbang.span.end as usize)
        })
        .unwrap_or(0);
    for comment in &parsed.program.comments {
        if comment.span.start as usize >= preamble && comment.span.end as usize <= first_statement {
            preamble = comment.span.end as usize;
        }
    }
    // Leave whitespace from removed body statements after the preamble. Only
    // consume the first line boundary following a directive, hashbang or comment.
    if preamble > 0 {
        for (offset, character) in source[preamble..first_statement].char_indices() {
            if matches!(character, '\n' | '\r' | '\u{2028}' | '\u{2029}') {
                preamble += offset + character.len_utf8();
                if character == '\r' && source.as_bytes().get(preamble) == Some(&b'\n') {
                    preamble += 1;
                }
                break;
            }
        }
    }
    let offsets = crate::engine::program_body_offsets(&parsed.program, source, Some(&utf16));
    let preamble = utf16[preamble];
    // A directive-only program can have leading comments after its last directive.
    // Its epilogue must still follow the preamble that initializes its helpers.
    let epilogue = offsets[1].max(preamble);
    let boundary = |offset, needs_semicolon| -> napi::Result<BodyBoundary> {
        let byte = crate::edit::utf16_to_byte(source, offset)?;
        Ok(BodyBoundary {
            offset,
            prefix: format!(
                "{}{}",
                if byte > 0 && source.as_bytes()[byte - 1] != b'\n' {
                    "\n"
                } else {
                    ""
                },
                if needs_semicolon { ";\n" } else { "" }
            ),
        })
    };
    Ok(BodyLayout {
        preamble: boundary(preamble, offsets[3] != 0)?,
        epilogue: boundary(epilogue, offsets[4] != 0)?,
        eof_line_boundary: offsets[2] != 0 && epilogue < utf16[source.len()],
        strict: if strict {
            prepare(source, &parsed.program)
        } else {
            None
        },
    })
}

/// Locate the directive in the edited body, before wrapper sections are assembled.
fn prepare(source: &str, program: &Program<'_>) -> Option<OutputPreparation> {
    if program
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
    Some(OutputPreparation {
        offset: source[..byte as usize].encode_utf16().count() as u32,
        content: if byte == 0 {
            STRICT_DIRECTIVE.trim_start_matches('\n')
        } else {
            STRICT_DIRECTIVE
        }
        .into(),
    })
}

fn has_static_module_syntax(statements: &[Statement<'_>]) -> bool {
    statements.iter().any(|statement| {
        if let Statement::ExportDeclaration(export) = statement
            && let Declaration::TSImportEqualsDeclaration(import) = &export.declaration
        {
            return matches!(import.module_reference, TSModuleReference::ExternalModuleReference(_));
        }
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
        ) || match statement {
            // Babel's unambiguous parser also records exports in TypeScript
            // containers. Oxc's module record intentionally only covers the root.
            Statement::TSNamespaceDeclaration(declaration) => namespace_has_module_syntax(&declaration.body),
            Statement::TSExternalModuleDeclaration(declaration) => declaration.body.as_ref()
                .is_some_and(|body| has_static_module_syntax(&body.body)),
            Statement::TSGlobalDeclaration(declaration) => has_static_module_syntax(&declaration.body.body),
            _ => false,
        }
    })
}

fn namespace_has_module_syntax(body: &TSNamespaceDeclarationBody<'_>) -> bool {
    match body {
        TSNamespaceDeclarationBody::TSNamespaceDeclaration(declaration) => {
            namespace_has_module_syntax(&declaration.body)
        }
        TSNamespaceDeclarationBody::TSModuleBlock(block) => has_static_module_syntax(&block.body),
    }
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
    if !(input_is_module || has_static_module_syntax(&program.body))
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
