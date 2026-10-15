//! Host value encoding, separate from JavaScript coercion and optimizer evaluation.
//! The optimizer keeps its own string-coercion and lone-surrogate refusal.
use std::borrow::Cow;
use std::fmt::Write;

use oxc_ast::{
    AstKind,
    ast::{ModuleExportName, StringLiteral},
};
use oxc_syntax::number::ToJsString;

use super::constant_eval::{EvaluatedConstant, constant_for_kind};

/// Most strings cross unchanged. NUL introduces a JSON string only for values
/// that Rust UTF-8 cannot hold, or that start with the marker.
pub(crate) fn literal_string<'a>(literal: &'a StringLiteral<'_>) -> Cow<'a, str> {
    encode_host_string(&literal.value, literal.lone_surrogates)
}

pub(crate) fn module_export_name<'a>(name: &'a ModuleExportName<'a>) -> Cow<'a, str> {
    match name {
        ModuleExportName::StringLiteral(literal) => literal_string(literal),
        ModuleExportName::IdentifierName(identifier) => Cow::Borrowed(identifier.name.as_str()),
        ModuleExportName::IdentifierReference(identifier) => {
            Cow::Borrowed(identifier.name.as_str())
        }
    }
}

pub(crate) fn plain_string(value: &str) -> Cow<'_, str> {
    encode_host_string(value, false)
}

/// Oxc stores an isolated surrogate as U+FFFD plus four hex digits, and escapes
/// a real U+FFFD as U+FFFD plus `fffd` while that flag is set.
fn encode_host_string(value: &str, lone_surrogates: bool) -> Cow<'_, str> {
    if !lone_surrogates && !value.starts_with('\0') {
        return Cow::Borrowed(value);
    }
    let mut json = String::from("\0\"");
    if lone_surrogates {
        push_marked_json(&mut json, value);
    } else {
        for ch in value.chars() {
            push_json_escaped(&mut json, ch);
        }
    }
    json.push('"');
    Cow::Owned(json)
}

fn push_marked_json(json: &mut String, value: &str) {
    let mut rest = value;
    while let Some(start) = rest.find('\u{fffd}') {
        for ch in rest[..start].chars() {
            push_json_escaped(json, ch);
        }
        let after = &rest[start + '\u{fffd}'.len_utf8()..];
        if let Some(unit) = marked_unit(after) {
            if (0xd800..=0xdfff).contains(&unit) {
                write!(json, "\\u{unit:04x}").unwrap();
            } else {
                json.push_str("\\ufffd");
            }
            rest = &after[4..];
            continue;
        }
        json.push_str("\\ufffd");
        rest = after;
    }
    for ch in rest.chars() {
        push_json_escaped(json, ch);
    }
}

fn marked_unit(after: &str) -> Option<u16> {
    let hex = after.get(..4)?;
    if !hex.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return None;
    }
    let unit = u16::from_str_radix(hex, 16).ok()?;
    ((0xd800..=0xdfff).contains(&unit) || unit == 0xfffd).then_some(unit)
}

fn push_json_escaped(output: &mut String, ch: char) {
    match ch {
        '"' => output.push_str("\\\""),
        '\\' => output.push_str("\\\\"),
        '\u{0008}' => output.push_str("\\b"),
        '\u{000c}' => output.push_str("\\f"),
        '\n' => output.push_str("\\n"),
        '\r' => output.push_str("\\r"),
        '\t' => output.push_str("\\t"),
        '\u{2028}' => output.push_str("\\u2028"),
        '\u{2029}' => output.push_str("\\u2029"),
        ch if (ch as u32) < 0x20 => {
            write!(output, "\\u{:04x}", ch as u32).unwrap();
        }
        ch => output.push(ch),
    }
}

/// JavaScript numeric spelling, except negative zero keeps the sign that
/// `ToString` would erase. Infinity is never Rust's `inf`.
pub(crate) fn number_literal(value: f64) -> String {
    if value.is_nan() {
        "NaN".into()
    } else if value.is_infinite() {
        if value.is_sign_negative() {
            "-Infinity".into()
        } else {
            "Infinity".into()
        }
    } else if value == 0.0 {
        if value.is_sign_negative() {
            "-0".into()
        } else {
            "0".into()
        }
    } else {
        value.to_js_string()
    }
}

#[derive(Clone, Debug)]
pub(crate) struct TransportConstant {
    pub kind: &'static str,
    pub encoded: String,
}

pub(crate) fn constant(kind: AstKind<'_>) -> Option<TransportConstant> {
    // A literal can be transported faithfully even when the optimizer deliberately
    // refuses to evaluate expressions involving Oxc's isolated-surrogate encoding.
    if let AstKind::StringLiteral(literal) = kind {
        return Some(TransportConstant {
            kind: "string",
            encoded: format!("s{}", literal_string(literal)),
        });
    }
    let value = constant_for_kind(kind)?;
    let encoded = match &value {
        EvaluatedConstant::Null => "z".into(),
        EvaluatedConstant::Boolean(value) => format!("b{value}"),
        EvaluatedConstant::Number(value) => format!("n{}", number_literal(*value)),
        EvaluatedConstant::String(value) => format!("s{}", plain_string(value)),
    };
    Some(TransportConstant {
        kind: value.kind(),
        encoded,
    })
}

/// The first byte carries the constant's actual kind, never inferred from text.
pub(crate) fn scalar(value: &str) -> (u8, &str) {
    let (tag, value) = value.split_at(1);
    (
        match tag {
            "s" => 0,
            "n" => 1,
            "b" => 2,
            "z" => 3,
            _ => unreachable!("constant tag"),
        },
        value,
    )
}

#[cfg(test)]
mod tests {
    use super::{encode_host_string, number_literal};

    #[test]
    fn negative_zero_and_nonfinite_numbers_keep_javascript_spelling() {
        assert_eq!(number_literal(-0.0), "-0");
        assert_eq!(number_literal(0.0), "0");
        assert_eq!(number_literal(f64::INFINITY), "Infinity");
        assert_eq!(number_literal(f64::NEG_INFINITY), "-Infinity");
        assert_eq!(number_literal(f64::NAN), "NaN");
    }

    #[test]
    fn host_strings_escape_only_exceptional_utf16() {
        assert_eq!(encode_host_string("plain", false).as_ref(), "plain");
        assert_eq!(
            encode_host_string("\u{FFFD}d800", false).as_ref(),
            "\u{FFFD}d800"
        );
        assert_eq!(
            encode_host_string("\u{FFFD}d800", true).as_ref(),
            "\0\"\\ud800\""
        );
        assert_eq!(
            encode_host_string("\u{FFFD}fffd\u{FFFD}dc00x", true).as_ref(),
            "\0\"\\ufffd\\udc00x\""
        );
        assert_eq!(encode_host_string("\0a", false).as_ref(), "\0\"\\u0000a\"");
        assert_eq!(encode_host_string("a\"b", true).as_ref(), "\0\"a\\\"b\"");
    }
}
