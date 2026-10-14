use crate::{JsxOptions, JsxRuntime, TransformCtx, TypeScriptOptions};
use oxc_ast::Comment;
use oxc_diagnostics::OxcDiagnostic;
use std::borrow::Cow;

/// Babel recognizes the first complete directive of each kind in each comment,
/// regardless of where the parsed comment appears in the program.
pub fn update_options_with_comments(
    comments: &[Comment],
    typescript: &mut TypeScriptOptions,
    jsx: &mut JsxOptions,
    ctx: &mut TransformCtx,
) {
    let mut invalid_runtime = false;
    for comment in comments {
        let text = comment.content_span().source_text(ctx.source_text);
        for keyword in ["@jsxImportSource", "@jsxRuntime", "@jsx", "@jsxFrag"] {
            let Some(value) = directive(text, keyword) else { continue };
            match keyword {
                "@jsx" => {
                    if jsx.jsx_plugin || jsx.development {
                        jsx.pragma = Some(value.into());
                    }
                    typescript.jsx_pragma = Cow::Owned(value.into());
                }
                "@jsxFrag" => {
                    if jsx.jsx_plugin || jsx.development {
                        jsx.pragma_frag = Some(value.into());
                    }
                    typescript.jsx_pragma_frag = Cow::Owned(value.into());
                }
                "@jsxImportSource" => jsx.import_source = Some(value.into()),
                "@jsxRuntime" => {
                    invalid_runtime = false;
                    match value {
                        "classic" => jsx.runtime = JsxRuntime::Classic,
                        "automatic" => jsx.runtime = JsxRuntime::Automatic,
                        _ => invalid_runtime = true,
                    }
                }
                _ => unreachable!(),
            }
        }
    }
    if invalid_runtime && (jsx.jsx_plugin || jsx.development) {
        ctx.error(OxcDiagnostic::error("Invalid JSX runtime: expected classic or automatic"));
    }
}

// ECMAScript RegExp \s, including BOM but excluding Rust's NEL whitespace.
fn whitespace(c: char) -> bool {
    matches!(c, '\t'..='\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}')
}
fn newline(c: char) -> bool {
    matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}

fn directive<'a>(text: &'a str, keyword: &str) -> Option<&'a str> {
    if !text.contains(keyword) {
        return None;
    }
    // Equivalent to /^\s*(?:\*\s*)?@keyword\s+(\S+)\s*$/m.
    // Start positions are line boundaries; whitespace may itself cross lines.
    for start in std::iter::once(0)
        .chain(text.char_indices().filter_map(|(i, c)| newline(c).then_some(i + c.len_utf8())))
    {
        // Skip blank lines before trimming across them; otherwise a long blank
        // comment would repeatedly scan its entire remaining suffix.
        let line = text[start..].split(newline).next().unwrap();
        if !line.contains('@') {
            continue;
        }
        let mut rest = text[start..].trim_start_matches(whitespace);
        if let Some(after) = rest.strip_prefix('*') {
            rest = after.trim_start_matches(whitespace);
        }
        let Some(after) = rest.strip_prefix(keyword) else { continue };
        if !after.starts_with(whitespace) {
            continue;
        }
        let after = after.trim_start_matches(whitespace);
        let end = after.find(whitespace).unwrap_or(after.len());
        if end == 0 {
            continue;
        }
        let trailing = &after[end..];
        if trailing.chars().take_while(|c| !newline(*c)).all(whitespace) {
            return Some(&after[..end]);
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::directive;
    #[test]
    fn babel_line_grammar() {
        for text in [
            " @jsx h ",
            "* @jsx\u{a0}h\u{feff}",
            "@jsx\n h",
            "@jsx \n * @jsx h",
            "@other x\n * @jsx h",
        ] {
            assert_eq!(directive(text, "@jsx"), Some("h"));
        }
        for text in ["@jsx h @jsxFrag F", "text @jsx h", "`@jsx h`", "@jsx\u{85}h"] {
            assert_eq!(directive(text, "@jsx"), None);
        }
        assert_eq!(directive("@jsx first\n@jsx last", "@jsx"), Some("first"));
    }
}
