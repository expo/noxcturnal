#![allow(clippy::format_push_string)]

use oxc_allocator::{Allocator, Box as ArenaBox, TakeIn, Vec as ArenaVec};
use oxc_ast::{
    AstBuilder,
    ast::{
        Argument, ArrayExpressionElement, Expression, Program, PropertyKind,
        TSTypeParameterInstantiation,
    },
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
use crate::generated::regexp_unicode_properties::{
    SCRIPT_EXTENSIONS_BERIA_ERFE, SCRIPT_UNKNOWN, UNICODE_STRING_PROPERTIES,
    unicode_ignore_case_astral_class_addition, unicode_ignore_case_atom,
    unicode_ignore_case_bmp_class_addition, unicode_ignore_case_bmp_class_body,
    unicode_string_property_pattern,
};
use crate::preflight::helpers::CustomHelperRequests;

pub(super) struct Options {
    pub(super) unicode: bool,
    pub(super) unicode_properties: bool,
    pub(super) dot_all: bool,
    pub(super) named_groups: bool,
    pub(super) unicode_sets: bool,
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
        unicode_sets: options.unicode_sets,
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
    unicode_sets: bool,
    named_helper: &'a str,
    changed: bool,
    needs_named_helper: bool,
    error: Option<&'static str>,
}

impl<'a> RegexpLowerer<'a> {
    fn lower(
        &mut self,
        expression: &mut Expression<'a>,
    ) -> Result<Option<FxHashMap<String, Vec<usize>>>, &'static str> {
        let Expression::RegExpLiteral(literal) = expression else {
            return Ok(None);
        };
        let mut pattern = literal.regex.pattern.text.as_str().to_owned();
        let mut flags = literal.regex.flags.to_string();
        let mut changed = false;
        if self.unicode_sets && flags.contains('v') {
            pattern = lower_unicode_sets(&pattern)?;
            flags.retain(|flag| flag != 'v');
            flags.push('u');
            changed = true;
        }
        if self.unicode_properties && (pattern.contains("\\p{") || pattern.contains("\\P{")) {
            let drops_unicode_flag = self.unicode && flags.contains('u');
            pattern = lower_unicode_properties(&pattern, drops_unicode_flag)?;
            changed = true;
        }
        if self.unicode && flags.contains('u') {
            if flags.contains('i') {
                pattern = expand_unicode_ignore_case_bmp(&pattern)?;
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

    fn wrap_named(&self, expression: &mut Expression<'a>, groups: FxHashMap<String, Vec<usize>>) {
        let span = expression.span();
        let regexp = expression.take_in(&self.ast);
        let mut properties = ArenaVec::new_in(&self.ast);
        for (name, indices) in groups {
            #[expect(deprecated)]
            let key = self
                .ast
                .expression_string_literal(span, self.ast.allocator.alloc_str(&name), None)
                .into();
            #[expect(deprecated)]
            let value = if indices.len() == 1 {
                self.ast.expression_numeric_literal(
                    span,
                    indices[0] as f64,
                    None,
                    oxc_ast::ast::NumberBase::Decimal,
                )
            } else {
                let mut elements = ArenaVec::new_in(&self.ast);
                elements.extend(indices.into_iter().map(|index| {
                    ArrayExpressionElement::from(self.ast.expression_numeric_literal(
                        span,
                        index as f64,
                        None,
                        oxc_ast::ast::NumberBase::Decimal,
                    ))
                }));
                self.ast.expression_array(span, elements)
            };
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

fn expand_unicode_ignore_case_bmp(pattern: &str) -> Result<String, &'static str> {
    let pattern = expand_unicode_ignore_case_classes(pattern)?;
    let pattern = pattern.as_str();
    let bytes = pattern.as_bytes();
    let mut output = String::with_capacity(pattern.len());
    let mut index = 0usize;
    let mut in_class = false;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            let start = index;
            let Some(escape) = bytes.get(index + 1).copied() else {
                output.push('\\');
                break;
            };
            let parsed = if escape == b'u' && bytes.get(index + 2) == Some(&b'{') {
                let end = pattern[index + 3..]
                    .find('}')
                    .map(|offset| index + 3 + offset)
                    .ok_or("regexp-unicode-ignore-case-complex-not-implemented")?;
                let code_point = u32::from_str_radix(&pattern[index + 3..end], 16)
                    .map_err(|_| "regexp-unicode-ignore-case-complex-not-implemented")?;
                index = end + 1;
                Some(code_point)
            } else if escape == b'u' && index + 6 <= bytes.len() {
                let code_point = u32::from_str_radix(&pattern[index + 2..index + 6], 16)
                    .map_err(|_| "regexp-unicode-ignore-case-complex-not-implemented")?;
                index += 6;
                Some(code_point)
            } else if escape == b'x' && index + 4 <= bytes.len() {
                let code_point = u32::from_str_radix(&pattern[index + 2..index + 4], 16)
                    .map_err(|_| "regexp-unicode-ignore-case-complex-not-implemented")?;
                index += 4;
                Some(code_point)
            } else {
                let escaped = pattern[index + 1..].chars().next().unwrap();
                index += 1 + escaped.len_utf8();
                None
            };
            let Some(code_point) = parsed else {
                output.push_str(&pattern[start..index]);
                continue;
            };
            if let Some(expansion) = if !in_class {
                unicode_ignore_case_atom(code_point)
            } else {
                None
            } {
                output.push_str(expansion);
            } else {
                output.push_str(&pattern[start..index]);
            }
            continue;
        }
        let character = pattern[index..].chars().next().unwrap();
        let end = index + character.len_utf8();
        match character {
            '[' => in_class = true,
            ']' => in_class = false,
            _ => {}
        }
        let code_point = character as u32;
        if let Some(expansion) = if !in_class {
            unicode_ignore_case_atom(code_point)
        } else {
            None
        } {
            output.push_str(expansion);
        } else {
            output.push(character);
        }
        index = end;
    }
    Ok(output)
}

fn expand_unicode_ignore_case_classes(pattern: &str) -> Result<String, &'static str> {
    let bytes = pattern.as_bytes();
    let mut output = String::with_capacity(pattern.len());
    let mut index = 0usize;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            let end = regexp_escape_end(pattern, index);
            output.push_str(&pattern[index..end]);
            index = end;
            continue;
        }
        if bytes[index] != b'[' {
            let character = pattern[index..].chars().next().unwrap();
            output.push(character);
            index += character.len_utf8();
            continue;
        }
        let end = unicode_set_class_end(pattern, index)
            .ok_or("regexp-unicode-ignore-case-complex-not-implemented")?;
        let original_body = &pattern[index + 1..end];
        let mut body = original_body;
        if let Some(positive) = body.strip_prefix('^') {
            body = positive;
        }
        let mut additions = String::new();
        let mut canonical_singleton = None;
        let mut cursor = 0usize;
        while cursor < body.len() {
            let (lower, next) = match class_atom(body, cursor) {
                Ok(atom) => atom,
                Err(_) => {
                    cursor = if body.as_bytes()[cursor] == b'\\' {
                        regexp_escape_end(body, cursor)
                    } else {
                        cursor + body[cursor..].chars().next().unwrap().len_utf8()
                    };
                    continue;
                }
            };
            if body.as_bytes().get(next) == Some(&b'-') && next + 1 < body.len() {
                let Ok((upper, after)) = class_atom(body, next + 1) else {
                    cursor = next + 1;
                    continue;
                };
                if let (ClassAtom::Single(lower), ClassAtom::Single(upper)) = (lower, upper)
                    && lower <= upper
                {
                    for code_point in lower..=upper {
                        if let Some(expansion) = unicode_ignore_case_bmp_class_addition(code_point)
                        {
                            additions.push_str(expansion);
                        }
                        if let Some(expansion) =
                            unicode_ignore_case_astral_class_addition(code_point)
                        {
                            additions.push_str(expansion);
                        }
                    }
                }
                cursor = after;
            } else {
                if let ClassAtom::Single(code_point) = lower {
                    if cursor == 0 && next == body.len() && code_point <= 0xFFFF {
                        canonical_singleton = unicode_ignore_case_bmp_class_body(code_point);
                    }
                    if let Some(expansion) = unicode_ignore_case_bmp_class_addition(code_point) {
                        additions.push_str(expansion);
                    }
                    if let Some(expansion) = unicode_ignore_case_astral_class_addition(code_point) {
                        additions.push_str(expansion);
                    }
                }
                cursor = next;
            }
        }
        if let Some(canonical) = canonical_singleton {
            output.push('[');
            if original_body.starts_with('^') {
                output.push('^');
            }
            output.push_str(canonical);
            output.push(']');
        } else {
            output.push('[');
            output.push_str(original_body);
            output.push_str(&sort_class_additions(&additions)?);
            output.push(']');
        }
        index = end + 1;
    }
    Ok(output)
}

fn sort_class_additions(additions: &str) -> Result<String, &'static str> {
    let mut atoms = Vec::new();
    let mut index = 0usize;
    while index < additions.len() {
        let (atom, next) = class_atom(additions, index)?;
        let ClassAtom::Single(code_point) = atom else {
            return Err("regexp-unicode-ignore-case-complex-not-implemented");
        };
        atoms.push((code_point, &additions[index..next]));
        index = next;
    }
    atoms.sort_unstable_by_key(|(code_point, _)| *code_point);
    atoms.dedup_by_key(|(code_point, _)| *code_point);
    Ok(atoms.into_iter().map(|(_, token)| token).collect())
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
    let (body, negative) = body
        .strip_prefix('^')
        .map_or((body, false), |body| (body, true));
    let mut ranges = parse_class_ranges(body)?;
    if negative {
        ranges = complement_ranges(&ranges);
    }
    Ok(render_ranges(&ranges, surrogate_pairs))
}

fn parse_class_ranges(body: &str) -> Result<Vec<(u32, u32)>, &'static str> {
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

    Ok(union(ranges))
}

fn lower_unicode_sets(pattern: &str) -> Result<String, &'static str> {
    let mut output = String::with_capacity(pattern.len());
    let bytes = pattern.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            if let Some((replacement, end)) = unicode_string_property_at(pattern, index) {
                output.push_str(replacement);
                index = end;
                continue;
            }
            let end = (index + 2).min(bytes.len());
            output.push_str(&pattern[index..end]);
            index = end;
            continue;
        }
        if bytes[index] != b'[' {
            let character = pattern[index..].chars().next().unwrap();
            output.push(character);
            index += character.len_utf8();
            continue;
        }
        let end = unicode_set_class_end(pattern, index)
            .ok_or("regexp-unicode-sets-class-shape-not-implemented")?;
        let body = &pattern[index + 1..end];
        output.push_str(&lower_unicode_set_class(body)?);
        index = end + 1;
    }
    Ok(output)
}

fn unicode_string_property_at(source: &str, index: usize) -> Option<(&'static str, usize)> {
    let bytes = source.as_bytes();
    if bytes.get(index..index + 3) != Some(b"\\p{") {
        return None;
    }
    let end = source[index + 3..]
        .find('}')
        .map(|offset| index + 3 + offset)?;
    let property = &source[index + 3..end];
    unicode_string_property_pattern(property).map(|pattern| (pattern, end + 1))
}

fn unicode_set_class_end(pattern: &str, start: usize) -> Option<usize> {
    let bytes = pattern.as_bytes();
    let mut depth = 1;
    let mut index = start + 1;
    while index < bytes.len() {
        match bytes[index] {
            b'\\' => index += 2,
            b'[' => {
                depth += 1;
                index += 1;
            }
            b']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(index);
                }
                index += 1;
            }
            _ => index += pattern[index..].chars().next()?.len_utf8(),
        }
    }
    None
}

fn lower_unicode_set_class(body: &str) -> Result<String, &'static str> {
    let Some((left, operator, right)) = split_unicode_set_operation(body) else {
        if UNICODE_STRING_PROPERTIES
            .iter()
            .any(|property| body.contains(&format!("\\p{{{property}}}")))
        {
            return lower_unicode_set_string_property_union(body);
        }
        if body.contains("\\q{") {
            return lower_unicode_set_strings(body);
        }
        return Ok(format!("[{body}]"));
    };
    let left = unicode_set_operand_ranges(left)?;
    let right = unicode_set_operand_ranges(right)?;
    let ranges = if operator == "&&" {
        intersect_ranges(&left, &right)
    } else {
        subtract_ranges(&left, &right)
    };
    Ok(render_ranges(&ranges, false))
}

fn lower_unicode_set_string_property_union(body: &str) -> Result<String, &'static str> {
    if body.starts_with('^') || body.contains("\\q{") {
        return Err("regexp-unicode-sets-operation-not-implemented");
    }
    let mut alternatives = Vec::new();
    let mut characters = String::new();
    let mut index = 0usize;
    while index < body.len() {
        if body.as_bytes()[index] == b'\\'
            && let Some((replacement, end)) = unicode_string_property_at(body, index)
        {
            alternatives.push(replacement.to_owned());
            index = end;
            continue;
        }
        let end = if body.as_bytes()[index] == b'\\' {
            regexp_escape_end(body, index)
        } else {
            index + body[index..].chars().next().unwrap().len_utf8()
        };
        characters.push_str(&body[index..end]);
        index = end;
    }
    if !characters.is_empty() {
        alternatives.push(format!("[{characters}]"));
    }
    match alternatives.as_slice() {
        [] => Err("regexp-unicode-sets-operation-not-implemented"),
        [only] => Ok(only.clone()),
        _ => Ok(format!("(?:{})", alternatives.join("|"))),
    }
}

fn lower_unicode_set_strings(body: &str) -> Result<String, &'static str> {
    if body.starts_with('^') {
        return Err("regexp-unicode-sets-operation-not-implemented");
    }
    let bytes = body.as_bytes();
    let mut character_body = String::new();
    let mut alternatives = Vec::<(usize, usize, String)>::new();
    let mut index = 0usize;
    let mut order = 0usize;
    while index < bytes.len() {
        if bytes[index] == b'\\'
            && bytes.get(index + 1) == Some(&b'q')
            && bytes.get(index + 2) == Some(&b'{')
        {
            let mut cursor = index + 3;
            let mut start = cursor;
            let mut closed = false;
            while cursor < bytes.len() {
                if bytes[cursor] == b'\\' {
                    cursor = regexp_escape_end(body, cursor);
                    continue;
                }
                let character = body[cursor..].chars().next().unwrap();
                if character == '|' || character == '}' {
                    let raw = &body[start..cursor];
                    alternatives.push((class_string_length(raw), order, render_class_string(raw)));
                    order += 1;
                    if character == '}' {
                        cursor += 1;
                        closed = true;
                        break;
                    }
                    start = cursor + 1;
                }
                cursor += character.len_utf8();
            }
            if !closed {
                return Err("regexp-unicode-sets-operation-not-implemented");
            }
            index = cursor;
            continue;
        }
        let character = body[index..].chars().next().unwrap();
        character_body.push(character);
        index += character.len_utf8();
        if character == '\\' && index < bytes.len() {
            let escaped = body[index..].chars().next().unwrap();
            character_body.push(escaped);
            index += escaped.len_utf8();
        }
    }
    alternatives.sort_by_key(|(length, order, _)| (std::cmp::Reverse(*length), *order));
    let mut rendered: Vec<String> = alternatives
        .into_iter()
        .map(|(_, _, alternative)| alternative)
        .collect();
    if !character_body.is_empty() {
        rendered.push(format!("[{character_body}]"));
    }
    match rendered.as_slice() {
        [] => Err("regexp-unicode-sets-operation-not-implemented"),
        [only] => Ok(only.clone()),
        _ => Ok(format!("(?:{})", rendered.join("|"))),
    }
}

fn class_string_length(source: &str) -> usize {
    let mut length = 0;
    let mut index = 0;
    while index < source.len() {
        if source.as_bytes()[index] == b'\\' {
            index = regexp_escape_end(source, index);
            length += 1;
            continue;
        }
        index += source[index..].chars().next().unwrap().len_utf8();
        length += 1;
    }
    length
}

fn render_class_string(source: &str) -> String {
    let mut output = String::with_capacity(source.len());
    let mut index = 0;
    while index < source.len() {
        if source.as_bytes()[index] == b'\\' {
            let end = regexp_escape_end(source, index);
            output.push_str(&source[index..end]);
            index = end;
            continue;
        }
        let character = source[index..].chars().next().unwrap();
        if matches!(
            character,
            '.' | '*' | '+' | '?' | '(' | ')' | '[' | ']' | '{' | '}' | '^' | '$' | '/' | '|'
        ) {
            output.push('\\');
        }
        output.push(character);
        index += character.len_utf8();
    }
    output
}

fn regexp_escape_end(source: &str, index: usize) -> usize {
    let bytes = source.as_bytes();
    let Some(escape) = bytes.get(index + 1).copied() else {
        return source.len();
    };
    if escape == b'u' && bytes.get(index + 2) == Some(&b'{') {
        return source[index + 3..]
            .find('}')
            .map_or(source.len(), |offset| index + 4 + offset);
    }
    let width = match escape {
        b'u' => 6,
        b'x' => 4,
        b'c' => 3,
        _ => {
            return source[index + 1..]
                .chars()
                .next()
                .map_or(source.len(), |character| index + 1 + character.len_utf8());
        }
    };
    (index + width).min(source.len())
}

fn split_unicode_set_operation(body: &str) -> Option<(&str, &str, &str)> {
    let bytes = body.as_bytes();
    let mut depth = 0;
    let mut index = 0;
    let mut operation = None;
    while index + 1 < bytes.len() {
        match bytes[index] {
            b'\\' => index += 2,
            b'[' => {
                depth += 1;
                index += 1;
            }
            b']' => {
                depth -= 1;
                index += 1;
            }
            b'&' if depth == 0 && bytes[index + 1] == b'&' => {
                operation = Some((&body[..index], "&&", &body[index + 2..]));
                index += 2;
            }
            b'-' if depth == 0 && bytes[index + 1] == b'-' => {
                operation = Some((&body[..index], "--", &body[index + 2..]));
                index += 2;
            }
            _ => index += 1,
        }
    }
    operation
}

fn unicode_set_operand_ranges(operand: &str) -> Result<Vec<(u32, u32)>, &'static str> {
    let body = if operand.starts_with('[') && operand.ends_with(']') {
        &operand[1..operand.len() - 1]
    } else {
        operand
    };
    if body.contains("\\q{")
        || UNICODE_STRING_PROPERTIES
            .iter()
            .any(|property| body.contains(&format!("\\p{{{property}}}")))
    {
        return Err("regexp-unicode-sets-operation-not-implemented");
    }
    if let Some((left, operator, right)) = split_unicode_set_operation(body) {
        let left = unicode_set_operand_ranges(left)?;
        let right = unicode_set_operand_ranges(right)?;
        return Ok(if operator == "&&" {
            intersect_ranges(&left, &right)
        } else {
            subtract_ranges(&left, &right)
        });
    }
    if let Some(positive) = body.strip_prefix('^') {
        Ok(complement_ranges(&parse_class_ranges(positive)?))
    } else {
        parse_class_ranges(body)
    }
}

fn intersect_ranges(left: &[(u32, u32)], right: &[(u32, u32)]) -> Vec<(u32, u32)> {
    let mut result = Vec::new();
    for &(left_start, left_end) in left {
        for &(right_start, right_end) in right {
            let start = left_start.max(right_start);
            let end = left_end.min(right_end);
            if start <= end {
                result.push((start, end));
            }
        }
    }
    union(result)
}

fn subtract_ranges(left: &[(u32, u32)], right: &[(u32, u32)]) -> Vec<(u32, u32)> {
    let mut result = Vec::new();
    for &(start, end) in left {
        let mut fragments = vec![(start, end)];
        for &(remove_start, remove_end) in right {
            let mut next = Vec::new();
            for (fragment_start, fragment_end) in fragments {
                if remove_end < fragment_start || remove_start > fragment_end {
                    next.push((fragment_start, fragment_end));
                    continue;
                }
                if fragment_start < remove_start {
                    next.push((fragment_start, remove_start - 1));
                }
                if remove_end < fragment_end {
                    next.push((remove_end + 1, fragment_end));
                }
            }
            fragments = next;
        }
        result.extend(fragments);
    }
    union(result)
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
        b'd' | b'D' | b'w' | b'W' | b's' | b'S' => {
            let ranges = match escape.to_ascii_lowercase() {
                b'd' => vec![(0x30, 0x39)],
                b'w' => vec![(0x30, 0x39), (0x41, 0x5A), (0x5F, 0x5F), (0x61, 0x7A)],
                b's' => vec![
                    (0x09, 0x0D),
                    (0x20, 0x20),
                    (0xA0, 0xA0),
                    (0x1680, 0x1680),
                    (0x2000, 0x200A),
                    (0x2028, 0x2029),
                    (0x202F, 0x202F),
                    (0x205F, 0x205F),
                    (0x3000, 0x3000),
                    (0xFEFF, 0xFEFF),
                ],
                _ => unreachable!(),
            };
            Ok((
                ClassAtom::Ranges(if escape.is_ascii_uppercase() {
                    complement_ranges(&ranges)
                } else {
                    ranges
                }),
                index + 2,
            ))
        }
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
    let mut lead_surrogates = Vec::new();
    let mut trail_surrogates = Vec::new();
    let mut astral = Vec::new();
    for &(start, end) in ranges {
        if start <= 0xFFFF {
            let bmp_end = end.min(0xFFFF);
            if start < 0xD800 {
                bmp.push((start, bmp_end.min(0xD7FF)));
            }
            if start <= 0xDBFF && bmp_end >= 0xD800 {
                lead_surrogates.push((start.max(0xD800), bmp_end.min(0xDBFF)));
            }
            if start <= 0xDFFF && bmp_end >= 0xDC00 {
                trail_surrogates.push((start.max(0xDC00), bmp_end.min(0xDFFF)));
            }
            if bmp_end > 0xDFFF {
                bmp.push((start.max(0xE000), bmp_end));
            }
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
    for (start, end) in lead_surrogates {
        let mut class = String::from("[");
        push_bmp_range(&mut class, start, end);
        class.push_str("](?![\\uDC00-\\uDFFF])");
        alternatives.push(class);
    }
    for (start, end) in trail_surrogates {
        let mut class = String::from("(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[");
        push_bmp_range(&mut class, start, end);
        class.push(']');
        alternatives.push(class);
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
    let generated = match property {
        "Script:Zzzz"
        | "Script:Unknown"
        | "Script_Extensions:Zzzz"
        | "Script_Extensions:Unknown" => Some(SCRIPT_UNKNOWN),
        "Script:Berf"
        | "Script:Beria_Erfe"
        | "Script_Extensions:Berf"
        | "Script_Extensions:Beria_Erfe" => Some(SCRIPT_EXTENSIONS_BERIA_ERFE),
        _ => None,
    };
    if let Some(ranges) = generated {
        return Ok(if negative {
            complement_ranges(ranges)
        } else {
            ranges.to_vec()
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

fn complement_ranges(ranges: &[(u32, u32)]) -> Vec<(u32, u32)> {
    let mut complement = Vec::new();
    let mut next = 0;
    for &(start, end) in ranges {
        if next < start {
            complement.push((next, start - 1));
        }
        next = end.saturating_add(1);
    }
    if next <= 0x10_FFFF {
        complement.push((next, 0x10_FFFF));
    }
    complement
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
        let negated = class_source.as_bytes().get(1) == Some(&b'^');
        if !negated && !class_source_has_astral(class_source) {
            output.push_str(class_source);
            continue;
        }
        let hir = regex_syntax::ParserBuilder::new()
            .unicode(true)
            .build()
            .parse(class_source);
        let hir = match hir {
            Ok(hir) => hir,
            Err(_) if negated => {
                let excluded = parse_class_ranges(&class_source[2..class_source.len() - 1])?;
                output.push_str(&render_ranges(&complement_ranges(&excluded), true));
                continue;
            }
            Err(_) => return Err("regexp-class-shape-not-implemented"),
        };
        let HirKind::Class(Class::Unicode(class)) = hir.kind() else {
            output.push_str(class_source);
            continue;
        };
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
            alternatives
                .push("(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]".to_string());
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
                    output.push_str("(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])");
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

fn lower_named_groups(
    pattern: &str,
) -> Result<(String, FxHashMap<String, Vec<usize>>), &'static str> {
    let bytes = pattern.as_bytes();
    let mut output = String::with_capacity(pattern.len());
    // Named backreferences may precede their capturing group. Discover every
    // capture number first, then perform the syntax rewrite in a second pass.
    let groups = collect_named_groups(pattern)?;
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
                    .ok_or("regexp-named-reference-shape-not-implemented")?;
                for capture in capture {
                    output.push('\\');
                    output.push_str(&capture.to_string());
                }
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
        } else if bytes[index] == b'('
            && !in_class
            && bytes.get(index + 1) == Some(&b'?')
            && bytes.get(index + 2) == Some(&b'<')
            && !matches!(bytes.get(index + 3), Some(b'=') | Some(b'!'))
        {
            let end = pattern[index + 3..]
                .find('>')
                .map(|offset| index + 3 + offset)
                .ok_or("regexp-named-group-shape-not-implemented")?;
            output.push('(');
            index = end + 1;
            continue;
        }
        let character = pattern[index..].chars().next().unwrap();
        output.push(character);
        index += character.len_utf8();
    }
    Ok((output, groups))
}

fn collect_named_groups(pattern: &str) -> Result<FxHashMap<String, Vec<usize>>, &'static str> {
    let bytes = pattern.as_bytes();
    let mut groups: FxHashMap<String, Vec<usize>> = FxHashMap::default();
    let mut capture_count = 0usize;
    let mut index = 0usize;
    let mut in_class = false;
    while index < bytes.len() {
        if bytes[index] == b'\\' {
            let escaped_len = pattern[index + 1..]
                .chars()
                .next()
                .map_or(0, char::len_utf8);
            index = (index + 1 + escaped_len).min(bytes.len());
            continue;
        }
        match bytes[index] {
            b'[' => in_class = true,
            b']' => in_class = false,
            b'(' if !in_class => {
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
                    groups
                        .entry(name.to_owned())
                        .or_default()
                        .push(capture_count);
                    index = end + 1;
                    continue;
                }
            }
            _ => {}
        }
        let character = pattern[index..].chars().next().unwrap();
        index += character.len_utf8();
    }
    Ok(groups)
}
