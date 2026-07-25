#![allow(clippy::format_push_string)]

use oxc_ast::AstKind;
use oxc_semantic::Semantic;
use oxc_span::Span;
use regex_syntax::hir::{Class, HirKind};
use rustc_hash::FxHashMap;

use crate::edit::{EditCommand, EditKind, MappingPolicy};

const NAMED_HELPER: &str = r#"function _noxWrapRegExp(expression,groups){var exec=expression.exec;expression.exec=function(input){var match=exec.call(this,input);if(match){match.groups={};for(var name in groups)match.groups[name]=match[groups[name]]}return match};if(typeof Symbol!="undefined"&&Symbol.replace){expression[Symbol.replace]=function(input,replacement){if(typeof replacement==="string")replacement=replacement.replace(/\$<([^>]+)>/g,function(_,name){return "$"+groups[name]});return RegExp.prototype[Symbol.replace].call(this,input,replacement)}}return expression}"#;

pub(super) fn edits(
    source: &str,
    semantic: &Semantic<'_>,
    unicode: bool,
    unicode_properties: bool,
    dot_all: bool,
    named_groups: bool,
) -> Result<Option<Vec<EditCommand>>, &'static str> {
    let mut edits = Vec::new();
    let mut needs_named_helper = false;
    for node in semantic.nodes().iter() {
        let AstKind::RegExpLiteral(literal) = node.kind() else {
            continue;
        };
        let literal_source = slice(source, literal.span);
        let Some(separator) = literal_source.rfind('/') else {
            continue;
        };
        let mut pattern = literal_source[1..separator].to_owned();
        let mut flags = literal_source[separator + 1..].to_owned();
        let mut changed = false;
        if unicode_properties && (pattern.contains("\\p{") || pattern.contains("\\P{")) {
            pattern = lower_unicode_properties(&pattern)?;
            changed = true;
        }
        if unicode && flags.contains('u') {
            if flags.contains('i') && !pattern.is_ascii() {
                return Err("regexp-unicode-ignore-case-complex-not-implemented");
            }
            pattern = lower_unicode(&pattern, flags.contains('s'))?;
            flags.retain(|flag| flag != 'u');
            changed = true;
        }
        if dot_all && flags.contains('s') {
            pattern = lower_dot_all(&pattern);
            flags.retain(|flag| flag != 's');
            changed = true;
        }
        let mut groups = None;
        if named_groups && pattern.contains("(?<") {
            let (lowered, names) = lower_named_groups(&pattern)?;
            pattern = lowered;
            groups = Some(names);
            needs_named_helper = true;
            changed = true;
        }
        if !changed {
            continue;
        }
        let expression = format!("/{pattern}/{flags}");
        let content = if let Some(groups) = groups {
            let entries = groups
                .iter()
                .map(|(name, index)| format!("{name:?}:{index}"))
                .collect::<Vec<_>>()
                .join(",");
            format!("_noxWrapRegExp({expression},{{{entries}}})")
        } else {
            expression
        };
        edits.push(replace(literal.span, content));
    }
    if edits.is_empty() {
        return Ok(None);
    }
    if needs_named_helper {
        let insertion = semantic
            .nodes()
            .iter()
            .find_map(|node| match node.kind() {
                AstKind::Program(program) => Some(
                    program
                        .directives
                        .last()
                        .map_or(program.span.start, |directive| directive.span.end),
                ),
                _ => None,
            })
            .unwrap_or(0);
        edits.push(insert(insertion, NAMED_HELPER.to_owned()));
    }
    Ok(Some(edits))
}

fn lower_unicode_properties(pattern: &str) -> Result<String, &'static str> {
    let mut output = String::with_capacity(pattern.len());
    let bytes = pattern.as_bytes();
    let mut index = 0usize;
    let mut in_class = false;
    while index < bytes.len() {
        if bytes[index] == b'[' {
            in_class = true;
        } else if bytes[index] == b']' {
            in_class = false;
        }
        if bytes[index] == b'\\'
            && matches!(bytes.get(index + 1), Some(b'p') | Some(b'P'))
            && bytes.get(index + 2) == Some(&b'{')
        {
            if in_class {
                return Err("regexp-unicode-property-in-class-not-implemented");
            }
            let end = pattern[index + 3..]
                .find('}')
                .map(|offset| index + 3 + offset)
                .ok_or("regexp-unicode-property-shape-not-implemented")?;
            let negative = bytes[index + 1] == b'P';
            let property = pattern[index + 3..end].replace('=', ":");
            output.push_str(&compile_unicode_property(&property, negative)?);
            index = end + 1;
            continue;
        }
        let character = pattern[index..].chars().next().unwrap();
        output.push(character);
        index += character.len_utf8();
    }
    Ok(output)
}

fn compile_unicode_property(property: &str, negative: bool) -> Result<String, &'static str> {
    let expression = format!("\\{}{{{property}}}", if negative { 'P' } else { 'p' });
    let hir = regex_syntax::ParserBuilder::new()
        .unicode(true)
        .build()
        .parse(&expression)
        .map_err(|_| "regexp-unicode-property-unsupported")?;
    let HirKind::Class(Class::Unicode(class)) = hir.kind() else {
        return Err("regexp-unicode-property-unsupported");
    };
    let mut bmp = Vec::new();
    let mut astral = Vec::new();
    for range in class.ranges() {
        let start = range.start() as u32;
        let end = range.end() as u32;
        if start <= 0xFFFF {
            bmp.push((start, end.min(0xFFFF)));
        }
        if end > 0xFFFF {
            astral.push((start.max(0x1_0000), end));
        }
    }
    if negative {
        bmp.push((0xD800, 0xDFFF));
        bmp.sort_unstable_by_key(|range| range.0);
    }
    let mut alternatives = Vec::new();
    if !bmp.is_empty() {
        let mut class = String::from("[");
        for (start, end) in bmp {
            push_bmp_range(&mut class, start, end);
        }
        class.push(']');
        alternatives.push(class);
    }
    for (start, end) in astral {
        push_astral_range(&mut alternatives, start, end);
    }
    Ok(match alternatives.as_slice() {
        [] => "(?!)".to_owned(),
        [only] => only.clone(),
        _ => format!("(?:{})", alternatives.join("|")),
    })
}

fn push_bmp_range(output: &mut String, start: u32, end: u32) {
    output.push_str(&format!("\\u{start:04X}"));
    if start != end {
        output.push('-');
        output.push_str(&format!("\\u{end:04X}"));
    }
}

fn push_astral_range(alternatives: &mut Vec<String>, start: u32, end: u32) {
    let lead = |code_point: u32| 0xD800 + ((code_point - 0x1_0000) >> 10);
    let trail = |code_point: u32| 0xDC00 + ((code_point - 0x1_0000) & 0x3FF);
    let first_lead = lead(start);
    let last_lead = lead(end);
    if first_lead == last_lead {
        alternatives.push(format!(
            "\\u{first_lead:04X}[\\u{:04X}-\\u{:04X}]",
            trail(start),
            trail(end)
        ));
        return;
    }
    alternatives.push(format!(
        "\\u{first_lead:04X}[\\u{:04X}-\\uDFFF]",
        trail(start)
    ));
    if first_lead < last_lead.saturating_sub(1) {
        alternatives.push(format!(
            "[\\u{:04X}-\\u{:04X}][\\uDC00-\\uDFFF]",
            first_lead + 1,
            last_lead - 1
        ));
    }
    alternatives.push(format!("\\u{last_lead:04X}[\\uDC00-\\u{:04X}]", trail(end)));
}

fn lower_unicode(pattern: &str, dot_all: bool) -> Result<String, &'static str> {
    if pattern.contains("\\p{") || pattern.contains("\\P{") {
        return Err("regexp-unicode-property-escapes-require-property-transform");
    }
    let mut output = String::with_capacity(pattern.len());
    let mut characters = pattern.char_indices().peekable();
    let mut in_class = false;
    while let Some((_, character)) = characters.next() {
        match character {
            '\\' => {
                let Some((_, escaped)) = characters.next() else {
                    output.push('\\');
                    break;
                };
                if escaped == 'u' && characters.peek().is_some_and(|(_, next)| *next == '{') {
                    characters.next();
                    let mut value = String::new();
                    let mut closed = false;
                    for (_, digit) in characters.by_ref() {
                        if digit == '}' {
                            closed = true;
                            break;
                        }
                        value.push(digit);
                    }
                    if !closed {
                        return Err("regexp-unicode-code-point-escape-shape-not-implemented");
                    }
                    let code_point = u32::from_str_radix(&value, 16)
                        .map_err(|_| "regexp-unicode-code-point-escape-shape-not-implemented")?;
                    if code_point > 0x10_FFFF {
                        return Err("regexp-unicode-code-point-out-of-range");
                    }
                    if in_class && code_point > 0xFFFF {
                        return Err("regexp-unicode-astral-class-not-implemented");
                    }
                    push_code_point(&mut output, code_point, !in_class);
                } else {
                    output.push('\\');
                    output.push(escaped);
                }
            }
            '[' => {
                in_class = true;
                output.push(character);
            }
            ']' => {
                in_class = false;
                output.push(character);
            }
            '.' if !in_class => {
                if dot_all {
                    output.push_str("(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])");
                } else {
                    output.push_str("(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF])");
                }
            }
            character if character as u32 > 0xFFFF => {
                if in_class {
                    return Err("regexp-unicode-astral-class-not-implemented");
                }
                push_code_point(&mut output, character as u32, true);
            }
            _ => output.push(character),
        }
    }
    Ok(output)
}

fn push_code_point(output: &mut String, code_point: u32, group_astral: bool) {
    if code_point <= 0xFFFF {
        output.push_str(&format!("\\u{code_point:04X}"));
    } else {
        let adjusted = code_point - 0x1_0000;
        let lead = 0xD800 + (adjusted >> 10);
        let trail = 0xDC00 + (adjusted & 0x3FF);
        if group_astral {
            output.push_str("(?:");
        }
        output.push_str(&format!("\\u{lead:04X}\\u{trail:04X}"));
        if group_astral {
            output.push(')');
        }
    }
}

fn lower_dot_all(pattern: &str) -> String {
    let mut output = String::with_capacity(pattern.len());
    let mut escaped = false;
    let mut in_class = false;
    for character in pattern.chars() {
        if escaped {
            output.push(character);
            escaped = false;
        } else {
            match character {
                '\\' => {
                    output.push(character);
                    escaped = true;
                }
                '[' => {
                    output.push(character);
                    in_class = true;
                }
                ']' => {
                    output.push(character);
                    in_class = false;
                }
                '.' if !in_class => output.push_str("[^]"),
                _ => output.push(character),
            }
        }
    }
    output
}

fn lower_named_groups(pattern: &str) -> Result<(String, FxHashMap<String, usize>), &'static str> {
    let bytes = pattern.as_bytes();
    let mut output = String::with_capacity(pattern.len());
    let mut groups: FxHashMap<String, usize> = FxHashMap::default();
    let mut capture_count = 0usize;
    let mut index = 0usize;
    let mut in_class = false;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            if bytes.get(index + 1) == Some(&b'k') && bytes.get(index + 2) == Some(&b'<') {
                let end = pattern[index + 3..]
                    .find('>')
                    .map(|offset| index + 3 + offset)
                    .ok_or("regexp-named-reference-shape-not-implemented")?;
                let name = &pattern[index + 3..end];
                let capture = groups
                    .get(name)
                    .ok_or("regexp-forward-named-reference-not-implemented")?;
                output.push('\\');
                output.push_str(&capture.to_string());
                index = end + 1;
                continue;
            }
            let escaped_len = pattern[index + 1..]
                .chars()
                .next()
                .map_or(0, char::len_utf8);
            let end = (index + 1 + escaped_len).min(bytes.len());
            output.push_str(&pattern[index..end]);
            index = end;
            continue;
        }
        if bytes[index] == b'[' {
            in_class = true;
        } else if bytes[index] == b']' {
            in_class = false;
        } else if bytes[index] == b'(' && !in_class {
            if bytes.get(index + 1) != Some(&b'?') {
                capture_count += 1;
            } else if bytes.get(index + 2) == Some(&b'<')
                && !matches!(bytes.get(index + 3), Some(b'=') | Some(b'!'))
            {
                let end = pattern[index + 3..]
                    .find('>')
                    .map(|offset| index + 3 + offset)
                    .ok_or("regexp-named-group-shape-not-implemented")?;
                let name = &pattern[index + 3..end];
                capture_count += 1;
                if groups.insert(name.to_owned(), capture_count).is_some() {
                    return Err("regexp-duplicate-named-groups-not-implemented");
                }
                output.push('(');
                index = end + 1;
                continue;
            }
        }
        let character = pattern[index..].chars().next().unwrap();
        output.push(character);
        index += character.len_utf8();
    }
    Ok((output, groups))
}

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
}

fn replace(span: Span, content: String) -> EditCommand {
    EditCommand {
        kind: EditKind::Replace,
        start: span.start,
        end: span.end,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
}

fn insert(position: u32, content: String) -> EditCommand {
    EditCommand {
        kind: EditKind::AppendRight,
        start: position,
        end: position,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
}
