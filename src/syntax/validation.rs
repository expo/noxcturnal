use napi::Result;
use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_parser::Parser;
use oxc_semantic::{Scoping, SemanticBuilder, Stats};

pub(crate) struct ValidatedProgram {
    pub(crate) scoping: Scoping,
    pub(crate) stats: Stats,
}

/// Validate early errors without retaining an AST-node index. Routes that already
/// build semantic data perform these checks in their existing build instead.
pub(crate) fn validate_program(
    program: &Program<'_>,
    operation: &'static str,
    allocator: &Allocator,
) -> Result<ValidatedProgram> {
    // Allocation hints avoid a separate AST counting traversal. The semantic
    // tables grow normally when needed; these hints never limit validation.
    // Arena usage reflects syntax rather than source length (e.g. comments).
    // Large arenas can contain decoded literals as well as large syntax trees.
    // Use exact counts there: bounded hints would make semantic tables repeatedly
    // grow, increasing first-call time and peak memory for large programs.
    let bytes = allocator.used_bytes();
    if bytes > 1024 * 1024 {
        return validate_program_with_stats(program, operation, Stats::count(program));
    }
    let stats = Stats::new(
        0,
        (bytes / 512 + 1) as u32,
        (bytes / 128) as u32,
        (bytes / 64) as u32,
    );
    check_program(program, operation, stats, false)
}

/// Collection can count allocations in its existing traversal, avoiding Oxc's
/// separate counting pass without omitting any semantic or early-error checks.
pub(crate) fn validate_program_with_stats(
    program: &Program<'_>,
    operation: &'static str,
    stats: Stats,
) -> Result<ValidatedProgram> {
    check_program(program, operation, stats, true)
}

fn check_program(
    program: &Program<'_>,
    operation: &'static str,
    stats: Stats,
    exact: bool,
) -> Result<ValidatedProgram> {
    let checked = SemanticBuilder::new_compiler()
        .with_stats(stats)
        .build(program);
    #[cfg(debug_assertions)]
    if exact {
        stats.assert_accurate(checked.semantic.stats());
    }
    #[cfg(not(debug_assertions))]
    let _ = exact;
    if checked.diagnostics.is_empty() {
        Ok(ValidatedProgram {
            stats: checked.semantic.stats(),
            scoping: checked.semantic.into_scoping(),
        })
    } else {
        Err(crate::parse_failure::error(
            program.source_text,
            &checked.diagnostics,
            operation,
        ))
    }
}

pub(crate) fn validate_source(source: &str, filename: &str) -> Result<()> {
    let allocator = Allocator::default();
    let parsed = Parser::new(
        &allocator,
        source,
        super::classification::source_type(filename, source)?,
    )
    .parse();
    if !parsed.diagnostics.is_empty() {
        return Err(crate::parse_failure::error(
            source,
            &parsed.diagnostics,
            "native-phase",
        ));
    }
    validate_program(&parsed.program, "native-phase", &allocator).map(|_| ())
}

/// Oxc 0.141 compares an escaped surrogate-pair group name differently from the
/// equivalent literal backreference. Confirm that *only* this normalization
/// removes the structural parser diagnostic before preserving the known boundary.
/// This cold path never changes emitted source and is not a general regexp fallback.
pub(crate) fn escaped_regexp_name_boundary(
    program: &Program<'_>,
    diagnostics: &[oxc_diagnostics::OxcDiagnostic],
) -> bool {
    use oxc_ast::ast::RegExpLiteral;
    use oxc_ast_visit::Visit;
    use oxc_parser::ParseOptions;
    if diagnostics.is_empty()
        || diagnostics.iter().any(|diagnostic| {
            diagnostic.message != "Invalid regular expression: Invalid named reference"
        })
    {
        return false;
    }
    struct Names(Vec<(usize, usize, char)>);
    impl<'a> Visit<'a> for Names {
        fn visit_reg_exp_literal(&mut self, literal: &RegExpLiteral<'a>) {
            let pattern = literal.regex.pattern.text.as_str();
            let bytes = pattern.as_bytes();
            let mut at = 0;
            let mut in_class = false;
            while at < bytes.len() {
                match bytes[at] {
                    b'\\' => {
                        at += 2;
                        continue;
                    }
                    b'[' => in_class = true,
                    b']' => in_class = false,
                    b'(' if !in_class && pattern[at..].starts_with("(?<") => {
                        let Some(end) = pattern[at + 3..].find('>') else {
                            break;
                        };
                        let end = at + 3 + end;
                        let mut name_at = at + 3;
                        while name_at + 12 <= end {
                            let pair = &bytes[name_at..name_at + 12];
                            if pair.starts_with(b"\\u") && &pair[6..8] == b"\\u" {
                                let high = std::str::from_utf8(&pair[2..6])
                                    .ok()
                                    .and_then(|s| u32::from_str_radix(s, 16).ok());
                                let low = std::str::from_utf8(&pair[8..12])
                                    .ok()
                                    .and_then(|s| u32::from_str_radix(s, 16).ok());
                                if let (Some(high @ 0xd800..=0xdbff), Some(low @ 0xdc00..=0xdfff)) =
                                    (high, low)
                                {
                                    let scalar = char::from_u32(
                                        0x10000 + ((high - 0xd800) << 10) + low - 0xdc00,
                                    )
                                    .unwrap();
                                    let start = literal.span.start as usize + 1 + name_at;
                                    self.0.push((start, start + 12, scalar));
                                    name_at += 12;
                                    continue;
                                }
                            }
                            name_at += 1;
                        }
                        at = end;
                    }
                    _ => {}
                }
                at += 1;
            }
        }
    }
    let mut names = Names(Vec::new());
    names.visit_program(program);
    if names.0.is_empty() {
        return false;
    }
    let mut normalized = program.source_text.to_owned();
    for (start, end, scalar) in names.0.into_iter().rev() {
        normalized.replace_range(start..end, scalar.encode_utf8(&mut [0; 4]));
    }
    let allocator = Allocator::default();
    Parser::new(&allocator, &normalized, program.source_type)
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse()
        .diagnostics
        .is_empty()
}
