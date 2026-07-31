#![allow(clippy::format_push_string)]

use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder,
    ast::{Argument, Expression, Program, PropertyKind, TSTypeParameterInstantiation},
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::GetSpan;
use regex_syntax::hir::{Class, HirKind};
use rustc_hash::FxHashMap;

use crate::generated::inline_helpers::{
    INLINE_REGEXP_NAMED_CAPTURE_HELPER, INLINE_REGEXP_NAMED_CAPTURE_HELPER_BINDINGS,
    INLINE_REGEXP_NAMED_CAPTURE_HELPER_PRETTY, INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME,
    INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME_BINDINGS,
    INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME_PRETTY,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct Options {
    pub(super) unicode: bool,
    pub(super) unicode_properties: bool,
    pub(super) dot_all: bool,
    pub(super) named_groups: bool,
    pub(super) inline_helpers: bool,
}

pub(super) fn run<'a>(
    allocator: &'a Allocator,
    program: &mut Program<'a>,
    source: &str,
    options: Options,
) -> Result<(bool, CustomHelperRequests), &'static str> {
    let named_helper = reserve_source_name("_wrapRegExp", source);
    let named_runtime = reserve_source_name("_wrapRegExp2", source);
    let mut pass = RegexpLowerer {
        ast: AstBuilder::new(allocator),
        unicode: options.unicode,
        unicode_properties: options.unicode_properties,
        dot_all: options.dot_all,
        named_groups: options.named_groups,
        named_helper: allocator.alloc_str(&named_helper),
        changed: false,
        needs_named_helper: false,
        error: None,
    };
    pass.visit_program(program);
    if let Some(error) = pass.error {
        return Err(error);
    }
    let mut requests = CustomHelperRequests::default();
    if pass.needs_named_helper {
        requests.request("wrapRegExp");
        let (helper, pretty_helper, bindings) = if options.inline_helpers {
            (
                INLINE_REGEXP_NAMED_CAPTURE_HELPER,
                INLINE_REGEXP_NAMED_CAPTURE_HELPER_PRETTY,
                INLINE_REGEXP_NAMED_CAPTURE_HELPER_BINDINGS,
            )
        } else {
            (
                INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME,
                INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME_PRETTY,
                INLINE_REGEXP_NAMED_CAPTURE_HELPER_RUNTIME_BINDINGS,
            )
        };
        let rewrite = |source: &str| {
            source
                .replace("_wrapRegExp2", "__BABEL_WRAP_REGEXP_RUNTIME__")
                .replace("_wrapRegExp", &named_helper)
                .replace("__BABEL_WRAP_REGEXP_RUNTIME__", &named_runtime)
        };
        requests.push_fragment(rewrite(helper), rewrite(pretty_helper));
        requests.reserve_scope_names(bindings.iter().map(|binding| rewrite(binding)));
    }
    Ok((pass.changed, requests))
}

struct RegexpLowerer<'a> {
    ast: AstBuilder<'a>,
    unicode: bool,
    unicode_properties: bool,
    dot_all: bool,
    named_groups: bool,
    named_helper: &'a str,
    changed: bool,
    needs_named_helper: bool,
    error: Option<&'static str>,
}

impl<'a> RegexpLowerer<'a> {
    fn lower(
        &mut self,
        expression: &mut Expression<'a>,
    ) -> Result<Option<FxHashMap<String, usize>>, &'static str> {
        let Expression::RegExpLiteral(literal) = expression else {
            return Ok(None);
        };
        let mut pattern = literal.regex.pattern.text.as_str().to_owned();
        let mut flags = literal.regex.flags.to_string();
        let mut changed = false;
        if self.unicode_properties && (pattern.contains("\\p{") || pattern.contains("\\P{")) {
            let drops_unicode_flag = self.unicode && flags.contains('u');
            pattern = lower_unicode_properties(&pattern, drops_unicode_flag)?;
            changed = true;
        }
        if self.unicode && flags.contains('u') {
            if flags.contains('i') && unicode_ignore_case_requires_expansion(&pattern) {
                return Err("regexp-unicode-ignore-case-complex-not-implemented");
            }
            pattern = lower_unicode(&pattern, flags.contains('s'))?;
            flags.retain(|flag| flag != 'u');
            changed = true;
        }
        if self.dot_all && flags.contains('s') {
            pattern = lower_dot_all(&pattern);
            flags.retain(|flag| flag != 's');
            changed = true;
        }
        let groups = if self.named_groups && contains_named_group(&pattern) {
            let (lowered, names) = lower_named_groups(&pattern)?;
            if names.is_empty() {
                None
            } else {
                pattern = lowered;
                self.needs_named_helper = true;
                changed = true;
                Some(names)
            }
        } else {
            None
        };
        if !changed {
            return Ok(None);
        }
        literal.regex.pattern.text = self.ast.allocator.alloc_str(&pattern).into();
        literal.regex.pattern.pattern = None;
        literal.regex.flags = flags
            .bytes()
            .try_fold(oxc_ast::ast::RegExpFlags::empty(), |flags, flag| {
                oxc_ast::ast::RegExpFlags::try_from(flag).map(|parsed| flags | parsed)
            })
            .map_err(|_| "regexp-flags-not-implemented")?;
        literal.raw = None;
        self.changed = true;
        Ok(groups)
    }

    fn wrap_named(&self, expression: &mut Expression<'a>, groups: FxHashMap<String, usize>) {
        let span = expression.span();
        let regexp = expression.take_in(&self.ast);
        let mut properties = ArenaVec::new_in(&self.ast);
        for (name, index) in groups {
            #[expect(deprecated)]
            let key = self
                .ast
                .expression_string_literal(span, self.ast.allocator.alloc_str(&name), None)
                .into();
            #[expect(deprecated)]
            let value = self.ast.expression_numeric_literal(
                span,
                index as f64,
                None,
                oxc_ast::ast::NumberBase::Decimal,
            );
            #[expect(deprecated)]
            properties.push(self.ast.object_property_kind_object_property(
                span,
                PropertyKind::Init,
                key,
                value,
                false,
                false,
                false,
            ));
        }
        #[expect(deprecated)]
        let group_map = self.ast.expression_object(span, properties);
        let mut arguments = ArenaVec::new_in(&self.ast);
        arguments.push(Argument::from(regexp));
        arguments.push(Argument::from(group_map));
        #[expect(deprecated)]
        {
            *expression = self.ast.expression_call(
                span,
                self.ast.expression_identifier(span, self.named_helper),
                None::<ArenaBox<'a, TSTypeParameterInstantiation<'a>>>,
                arguments,
                false,
            );
        }
    }
}

fn unicode_ignore_case_requires_expansion(pattern: &str) -> bool {
    pattern
        .chars()
        .any(|character| character as u32 > 0xFFFF || matches!(character, '\u{017F}' | '\u{212A}'))
        || ["\\u017F", "\\u{17F}", "\\u{017F}", "\\u212A", "\\u{212A}"]
            .iter()
            .any(|escape| pattern.contains(escape))
}

pub(super) fn contains_named_group(pattern: &str) -> bool {
    let bytes = pattern.as_bytes();
    let mut index = 0;
    let mut in_class = false;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            index = (index + 2).min(bytes.len());
            continue;
        }
        match bytes[index] {
            b'[' => in_class = true,
            b']' => in_class = false,
            b'(' if !in_class
                && bytes.get(index + 1) == Some(&b'?')
                && bytes.get(index + 2) == Some(&b'<')
                && !matches!(bytes.get(index + 3), Some(b'=') | Some(b'!')) =>
            {
                return true;
            }
            _ => {}
        }
        index += 1;
    }
    false
}

impl<'a> VisitMut<'a> for RegexpLowerer<'a> {
    fn visit_expression(&mut self, expression: &mut Expression<'a>) {
        if self.error.is_some() {
            return;
        }
        walk_mut::walk_expression(self, expression);
        match self.lower(expression) {
            Ok(Some(groups)) => self.wrap_named(expression, groups),
            Ok(None) => {}
            Err(error) => self.error = Some(error),
        }
    }
}

fn reserve_source_name(base: &str, source: &str) -> String {
    if !source.contains(base) {
        return base.to_owned();
    }
    for suffix in 2.. {
        let candidate = format!("{base}{suffix}");
        if !source.contains(&candidate) {
            return candidate;
        }
    }
    unreachable!()
}

fn lower_unicode_properties(pattern: &str, surrogate_pairs: bool) -> Result<String, &'static str> {
    let mut output = String::with_capacity(pattern.len());
    let bytes = pattern.as_bytes();
    let mut index = 0usize;
    while index < bytes.len() {
        // A property inside a character class cannot be substituted in place:
        // its expansion is itself a class, and its astral half is a sequence of
        // surrogate pairs, which no class can hold. The whole class is rewritten
        // instead — see `lower_property_class`.
        if bytes[index] == b'[' {
            let end = class_end(pattern, index).ok_or("regexp-class-shape-not-implemented")?;
            let body_start = index + 1;
            let body = &pattern[body_start..end];
            if body.contains("\\p{") || body.contains("\\P{") {
                output.push_str(&lower_property_class(body, surrogate_pairs)?);
            } else {
                output.push_str(&pattern[index..=end]);
            }
            index = end + 1;
            continue;
        }
        if bytes[index] == b'\\'
            && matches!(bytes.get(index + 1), Some(b'p') | Some(b'P'))
            && bytes.get(index + 2) == Some(&b'{')
        {
            let end = pattern[index + 3..]
                .find('}')
                .map(|offset| index + 3 + offset)
                .ok_or("regexp-unicode-property-shape-not-implemented")?;
            let negative = bytes[index + 1] == b'P';
            let property = pattern[index + 3..end].replace('=', ":");
            output.push_str(&render_ranges(
                &unicode_property_ranges(&property, negative)?,
                surrogate_pairs,
            ));
            index = end + 1;
            continue;
        }
        // An escape consumes the character after it, so a `\[` never opens a
        // class and a `\p` outside the shape above stays as written.
        if bytes[index] == b'\\' && index + 1 < bytes.len() {
            let escaped = pattern[index + 1..].chars().next().unwrap();
            output.push('\\');
            output.push(escaped);
            index += 1 + escaped.len_utf8();
            continue;
        }
        let character = pattern[index..].chars().next().unwrap();
        output.push(character);
        index += character.len_utf8();
    }
    Ok(output)
}

/// Index of the `]` closing the class that opens at `start`.
///
/// `[` is an ordinary character inside a class, and an empty class cannot be
/// written in JavaScript, so only `\]` and the opening position need care.
fn class_end(pattern: &str, start: usize) -> Option<usize> {
    let bytes = pattern.as_bytes();
    let mut index = start + 1;
    if bytes.get(index) == Some(&b'^') {
        index += 1;
    }
    if bytes.get(index) == Some(&b']') {
        index += 1;
    }
    while index < bytes.len() {
        match bytes[index] {
            b'\\' => index += 1 + pattern[index + 1..].chars().next()?.len_utf8(),
            b']' => return Some(index),
            _ => index += pattern[index..].chars().next()?.len_utf8(),
        }
    }
    None
}

/// Rewrites a character class containing at least one `\p{...}`.
///
/// Every item is resolved to code-point ranges and unioned, then split: the
/// ranges up to U+FFFF stay a class, and anything above becomes surrogate-pair
/// alternatives beside it. `[\p{Cn}\p{Co}]` therefore becomes
/// `(?:[…bmp…]|…pairs…)`, which is the shape `regexpu-core` produces for Babel.
///
/// Only the items observed alongside property escapes are handled; anything
/// else bails rather than guessing, because a mis-parsed class is a silently
/// wrong regular expression.
fn lower_property_class(body: &str, surrogate_pairs: bool) -> Result<String, &'static str> {
    if body.starts_with('^') {
        // Complementing needs a decision about lone surrogates that no observed
        // input requires.
        return Err("regexp-unicode-property-negated-class-not-implemented");
    }
    let mut ranges: Vec<(u32, u32)> = Vec::new();
    let mut pending: Option<u32> = None;
    let bytes = body.as_bytes();
    let mut index = 0usize;

    // `-` is a literal at either edge of a class and a range otherwise.
    while index < bytes.len() {
        if bytes[index] == b'-' && pending.is_some() && index + 1 < bytes.len() {
            index += 1;
            let (upper, next) = class_atom(body, index)?;
            let ClassAtom::Single(upper) = upper else {
                return Err("regexp-unicode-property-class-range-not-implemented");
            };
            let lower = pending
                .take()
                .ok_or("regexp-unicode-property-class-shape")?;
            if upper < lower {
                return Err("regexp-unicode-property-class-range-not-implemented");
            }
            ranges.push((lower, upper));
            index = next;
            continue;
        }
        if let Some(single) = pending.take() {
            ranges.push((single, single));
        }
        let (atom, next) = class_atom(body, index)?;
        match atom {
            ClassAtom::Single(code_point) => pending = Some(code_point),
            ClassAtom::Ranges(mut property) => ranges.append(&mut property),
        }
        index = next;
    }
    if let Some(single) = pending {
        ranges.push((single, single));
    }

    Ok(render_ranges(&union(ranges), surrogate_pairs))
}

enum ClassAtom {
    Single(u32),
    Ranges(Vec<(u32, u32)>),
}

/// Reads one item of a character class, returning it and the index after it.
fn class_atom(body: &str, index: usize) -> Result<(ClassAtom, usize), &'static str> {
    let bytes = body.as_bytes();
    if bytes[index] != b'\\' {
        let character = body[index..]
            .chars()
            .next()
            .ok_or("regexp-unicode-property-class-shape")?;
        return Ok((
            ClassAtom::Single(character as u32),
            index + character.len_utf8(),
        ));
    }
    let escape = *bytes
        .get(index + 1)
        .ok_or("regexp-unicode-property-class-shape")?;
    match escape {
        b'p' | b'P' => {
            if bytes.get(index + 2) != Some(&b'{') {
                return Err("regexp-unicode-property-shape-not-implemented");
            }
            let end = body[index + 3..]
                .find('}')
                .map(|offset| index + 3 + offset)
                .ok_or("regexp-unicode-property-shape-not-implemented")?;
            let property = body[index + 3..end].replace('=', ":");
            let ranges = unicode_property_ranges(&property, escape == b'P')?;
            Ok((ClassAtom::Ranges(ranges), end + 1))
        }
        b'u' => {
            if bytes.get(index + 2) == Some(&b'{') {
                let end = body[index + 3..]
                    .find('}')
                    .map(|offset| index + 3 + offset)
                    .ok_or("regexp-unicode-property-class-shape")?;
                let value = u32::from_str_radix(&body[index + 3..end], 16)
                    .map_err(|_| "regexp-unicode-property-class-shape")?;
                return Ok((ClassAtom::Single(value), end + 1));
            }
            let digits = body
                .get(index + 2..index + 6)
                .ok_or("regexp-unicode-property-class-shape")?;
            let value = u32::from_str_radix(digits, 16)
                .map_err(|_| "regexp-unicode-property-class-shape")?;
            Ok((ClassAtom::Single(value), index + 6))
        }
        b'x' => {
            let digits = body
                .get(index + 2..index + 4)
                .ok_or("regexp-unicode-property-class-shape")?;
            let value = u32::from_str_radix(digits, 16)
                .map_err(|_| "regexp-unicode-property-class-shape")?;
            Ok((ClassAtom::Single(value), index + 4))
        }
        b'n' => Ok((ClassAtom::Single(0x0A), index + 2)),
        b'r' => Ok((ClassAtom::Single(0x0D), index + 2)),
        b't' => Ok((ClassAtom::Single(0x09), index + 2)),
        b'f' => Ok((ClassAtom::Single(0x0C), index + 2)),
        b'v' => Ok((ClassAtom::Single(0x0B), index + 2)),
        b'0' => Ok((ClassAtom::Single(0x00), index + 2)),
        b'\\' | b']' | b'[' | b'-' | b'^' | b'/' | b'.' | b'$' | b'*' | b'+' | b'?' | b'('
        | b')' | b'{' | b'}' | b'|' => Ok((ClassAtom::Single(escape as u32), index + 2)),
        // `\d`, `\w`, `\s` and friends are sets rather than code points. They
        // are easy to add and have simply never appeared beside a property.
        _ => Err("regexp-unicode-property-class-escape-not-implemented"),
    }
}

/// Sorts and merges overlapping or adjacent ranges.
fn union(mut ranges: Vec<(u32, u32)>) -> Vec<(u32, u32)> {
    ranges.sort_unstable();
    let mut merged: Vec<(u32, u32)> = Vec::with_capacity(ranges.len());
    for (start, end) in ranges {
        match merged.last_mut() {
            Some(last) if start <= last.1.saturating_add(1) => last.1 = last.1.max(end),
            _ => merged.push((start, end)),
        }
    }
    merged
}

/// Renders code-point ranges.
///
/// With the `u` flag on its way out, anything above U+FFFF has to become
/// explicit surrogate-pair alternatives beside a basic-plane class. With the
/// flag staying, the engine already matches by code point and one class of
/// `\u{...}` ranges says the same thing far more compactly.
fn render_ranges(ranges: &[(u32, u32)], surrogate_pairs: bool) -> String {
    if !surrogate_pairs {
        if ranges.is_empty() {
            return "(?!)".to_owned();
        }
        let mut class = String::from("[");
        for &(start, end) in ranges {
            push_unicode_code_point(&mut class, start);
            if start != end {
                class.push('-');
                push_unicode_code_point(&mut class, end);
            }
        }
        class.push(']');
        return class;
    }
    let mut bmp = Vec::new();
    let mut astral = Vec::new();
    for &(start, end) in ranges {
        if start <= 0xFFFF {
            bmp.push((start, end.min(0xFFFF)));
        }
        if end > 0xFFFF {
            astral.push((start.max(0x1_0000), end));
        }
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
    match alternatives.as_slice() {
        [] => "(?!)".to_owned(),
        [only] => only.clone(),
        _ => format!("(?:{})", alternatives.join("|")),
    }
}

/// Whether a property escape names General_Category=Surrogate. `=` has already
/// been rewritten to `:` by the caller.
fn is_surrogate_category(property: &str) -> bool {
    matches!(
        property,
        "Cs" | "Surrogate"
            | "gc:Cs"
            | "gc:Surrogate"
            | "General_Category:Cs"
            | "General_Category:Surrogate"
    )
}

/// Code-point ranges of one `\p{...}` / `\P{...}` escape.
fn unicode_property_ranges(
    property: &str,
    negative: bool,
) -> Result<Vec<(u32, u32)>, &'static str> {
    // `regex_syntax` rejects the surrogate category outright, because a Rust
    // `char` cannot hold one. JavaScript can, and the category is a fixed range
    // by definition rather than a table that moves with the Unicode version.
    if is_surrogate_category(property) {
        return Ok(if negative {
            union(vec![(0x0000, 0xD7FF), (0xE000, 0x10_FFFF)])
        } else {
            vec![(0xD800, 0xDFFF)]
        });
    }
    let expression = format!("\\{}{{{property}}}", if negative { 'P' } else { 'p' });
    let hir = regex_syntax::ParserBuilder::new()
        .unicode(true)
        .build()
        .parse(&expression)
        .map_err(|_| "regexp-unicode-property-unsupported")?;
    let HirKind::Class(Class::Unicode(class)) = hir.kind() else {
        return Err("regexp-unicode-property-unsupported");
    };
    let mut ranges: Vec<(u32, u32)> = class
        .ranges()
        .iter()
        .map(|range| (range.start() as u32, range.end() as u32))
        .collect();
    if negative {
        // `regex_syntax` excludes the surrogate range from a complement because
        // Rust strings cannot hold one; a JavaScript `\P{…}` matches them.
        ranges.push((0xD800, 0xDFFF));
    }
    Ok(union(ranges))
}

/// Writes a code point for a pattern that keeps its `u` flag: `\uXXXX` while it
/// fits, `\u{...}` above. The first form is what a basic-plane range has always
/// rendered as, so this path does not rewrite output that was already correct.
fn push_unicode_code_point(output: &mut String, code_point: u32) {
    if code_point <= 0xFFFF {
        output.push_str(&format!("\\u{code_point:04X}"));
    } else {
        output.push_str(&format!("\\u{{{code_point:X}}}"));
    }
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

fn lower_astral_classes(pattern: &str) -> Result<String, &'static str> {
    let bytes = pattern.as_bytes();
    let mut output = String::with_capacity(pattern.len());
    let mut cursor = 0;
    while cursor < bytes.len() {
        if bytes[cursor] == b'\\' {
            output.push('\\');
            cursor += 1;
            if cursor < bytes.len() {
                let escaped = pattern[cursor..].chars().next().unwrap();
                output.push(escaped);
                cursor += escaped.len_utf8();
            }
            continue;
        }
        if bytes[cursor] != b'[' {
            let character = pattern[cursor..].chars().next().unwrap();
            output.push(character);
            cursor += character.len_utf8();
            continue;
        }
        let start = cursor;
        cursor += 1;
        let mut escaped = false;
        while cursor < bytes.len() {
            let character = pattern[cursor..].chars().next().unwrap();
            cursor += character.len_utf8();
            if escaped {
                escaped = false;
            } else if character == '\\' {
                escaped = true;
            } else if character == ']' {
                break;
            }
        }
        if !matches!(bytes.get(cursor.saturating_sub(1)), Some(b']')) {
            return Err("regexp-class-shape-not-implemented");
        }
        let class_source = &pattern[start..cursor];
        if !class_source_has_astral(class_source) {
            output.push_str(class_source);
            continue;
        }
        let hir = regex_syntax::ParserBuilder::new()
            .unicode(true)
            .build()
            .parse(class_source)
            .map_err(|_| "regexp-class-shape-not-implemented")?;
        let HirKind::Class(Class::Unicode(class)) = hir.kind() else {
            output.push_str(class_source);
            continue;
        };
        let negated = class_source.as_bytes().get(1) == Some(&b'^');
        let mut bmp_ranges = Vec::new();
        let mut astral = Vec::new();
        for range in class.ranges() {
            let start = range.start() as u32;
            let end = range.end() as u32;
            if start <= 0xFFFF {
                let bmp_end = end.min(0xFFFF);
                if negated && start <= 0xDFFF && bmp_end >= 0xD800 {
                    if start < 0xD800 {
                        bmp_ranges.push((start, 0xD7FF));
                    }
                    if bmp_end > 0xDFFF {
                        bmp_ranges.push((0xE000, bmp_end));
                    }
                } else {
                    bmp_ranges.push((start, bmp_end));
                }
            }
            if end > 0xFFFF {
                push_astral_range(&mut astral, start.max(0x1_0000), end);
            }
        }
        if negated {
            bmp_ranges = union(bmp_ranges);
        }
        let mut alternatives = Vec::new();
        if !bmp_ranges.is_empty() {
            let mut class = String::from("[");
            for (start, end) in bmp_ranges {
                push_bmp_range(&mut class, start, end);
            }
            class.push(']');
            alternatives.push(class);
        }
        alternatives.extend(astral);
        if negated {
            // A complemented Unicode class matches lone surrogate code units,
            // but not either half of an excluded astral code point. Keeping
            // them outside the BMP class prevents a valid pair from being
            // consumed one code unit at a time by a surrounding quantifier.
            alternatives.push("[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])".to_string());
            alternatives.push("(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]".to_string());
        }
        if alternatives.len() == 1 {
            output.push_str(&alternatives[0]);
        } else {
            output.push_str("(?:");
            output.push_str(&alternatives.join("|"));
            output.push(')');
        }
    }
    Ok(output)
}

fn class_source_has_astral(class_source: &str) -> bool {
    if class_source
        .chars()
        .any(|character| character as u32 > 0xFFFF)
    {
        return true;
    }
    let mut remainder = class_source;
    while let Some(index) = remainder.find("\\u{") {
        let digits = &remainder[index + 3..];
        let Some(end) = digits.find('}') else {
            return false;
        };
        if u32::from_str_radix(&digits[..end], 16).is_ok_and(|value| value > 0xFFFF) {
            return true;
        }
        remainder = &digits[end + 1..];
    }
    false
}

fn lower_unicode(pattern: &str, dot_all: bool) -> Result<String, &'static str> {
    if pattern.contains("\\p{") || pattern.contains("\\P{") {
        return Err("regexp-unicode-property-escapes-require-property-transform");
    }
    let pattern = lower_astral_classes(pattern)?;
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
