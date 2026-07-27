use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::{
    AstKind,
    ast::{ExportDefaultDeclarationKind, Expression, IdentifierReference},
};
use oxc_semantic::Scoping;
use rustc_hash::FxHashMap;

use crate::event_types::NodeField;
use crate::generated::event_schema::{field_key_id, node_type_name};
use crate::semantic::constant_eval::constant_for_kind;

pub(crate) fn utf16_index<'a>(source: &str, allocator: &'a Allocator) -> ArenaVec<'a, u32> {
    let mut offsets = ArenaVec::with_capacity_in(source.len() + 1, &allocator);
    for _ in 0..=source.len() {
        offsets.push(0);
    }
    let mut utf16 = 0u32;
    for (byte, ch) in source.char_indices() {
        for slot in offsets.iter_mut().take(byte + ch.len_utf8()).skip(byte) {
            *slot = utf16;
        }
        utf16 += ch.len_utf16() as u32;
    }
    offsets[source.len()] = utf16;
    offsets
}

pub(crate) fn packed_scalar(key: &str, value: &str) -> Option<u32> {
    if matches!(
        key,
        "global"
            | "read"
            | "write"
            | "binding"
            | "optional"
            | "calleeGlobal"
            | "computed"
            | "rootGlobal"
            | "async"
            | "generator"
            | "expression"
            | "hasInitializer"
            | "method"
            | "shorthand"
            | "prefix"
            | "delegate"
    ) {
        return Some(0x8000_0000 | u32::from(value == "true"));
    }
    if matches!(
        key,
        "bindingScopeId"
            | "argumentCount"
            | "bodyStart"
            | "bodyEnd"
            | "specifierCount"
            | "declarationCount"
            | "parameterCount"
    ) {
        return value
            .parse::<u32>()
            .ok()
            .filter(|value| *value < 0x4000_0000)
            .map(|value| 0x4000_0000 | value);
    }
    None
}

pub(crate) fn intern_packed(strings: &mut FxHashMap<String, u32>, value: &str) -> u32 {
    if let Some(id) = strings.get(value) {
        return *id;
    }
    let id = strings.len() as u32;
    strings.insert(value.to_owned(), id);
    id
}

pub(crate) fn static_member_path(expression: &Expression<'_>) -> Option<String> {
    match expression {
        Expression::Identifier(identifier) => Some(identifier.name.to_string()),
        Expression::StaticMemberExpression(member) => Some(format!(
            "{}.{}",
            static_member_path(&member.object)?,
            member.property.name
        )),
        Expression::ComputedMemberExpression(member) => match &member.expression {
            Expression::StringLiteral(property) => Some(format!(
                "{}.{}",
                static_member_path(&member.object)?,
                property.value
            )),
            _ => None,
        },
        _ => None,
    }
}

fn static_member_root<'a, 'b>(
    expression: &'b Expression<'a>,
) -> Option<&'b IdentifierReference<'a>> {
    match expression {
        Expression::Identifier(identifier) => Some(identifier),
        Expression::StaticMemberExpression(member) => static_member_root(&member.object),
        Expression::ComputedMemberExpression(member)
            if matches!(member.expression, Expression::StringLiteral(_)) =>
        {
            static_member_root(&member.object)
        }
        _ => None,
    }
}

pub(crate) struct DirectPackedFields {
    pub(crate) words: [u32; 32],
    pub(crate) len: usize,
}

pub(crate) fn packed_fields_direct<T: AsRef<str>>(
    kind: AstKind<'_>,
    scoping: Option<&Scoping>,
    utf16: Option<&[u32]>,
    requested: Option<&[T]>,
    precomputed_member_path: Option<&str>,
    strings: &mut FxHashMap<String, u32>,
) -> Option<DirectPackedFields> {
    let wants =
        |key: &str| requested.is_none_or(|fields| fields.iter().any(|field| field.as_ref() == key));
    let mut result = DirectPackedFields {
        words: [0; 32],
        len: 0,
    };
    // An explicitly empty request can push nothing; skip the kind match and constant
    // evaluation entirely for the common "routed without payload fields" case.
    if requested.is_some_and(<[T]>::is_empty) {
        return Some(result);
    }
    let mut push = |key: &str, value: u32| {
        if wants(key) {
            result.words[result.len] = field_key_id(key).expect("field protocol id");
            result.words[result.len + 1] = value;
            result.len += 2;
        }
    };
    match kind {
        AstKind::IdentifierReference(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
            if let Some(scoping) = scoping {
                let reference = identifier
                    .reference_id
                    .get()
                    .map(|id| scoping.get_reference(id));
                push(
                    "global",
                    0x8000_0000
                        | u32::from(
                            reference.is_some_and(|reference| reference.symbol_id().is_none()),
                        ),
                );
                if let Some(reference) = reference {
                    push("read", 0x8000_0000 | u32::from(reference.is_read()));
                    push("write", 0x8000_0000 | u32::from(reference.is_write()));
                    if let Some(symbol_id) = reference.symbol_id() {
                        push(
                            "bindingScopeId",
                            0x4000_0000 | scoping.symbol_scope_id(symbol_id).index() as u32,
                        );
                    }
                }
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
            push("binding", 0x8000_0001);
        }
        AstKind::IdentifierName(identifier) => {
            if wants("name") {
                let value = intern_packed(strings, &identifier.name);
                push("name", value);
            }
        }
        AstKind::StringLiteral(literal) => {
            if wants("value") {
                let value = intern_packed(strings, &literal.value);
                push("value", value);
            }
        }
        AstKind::NumericLiteral(literal) => {
            if wants("value") {
                let value = intern_packed(strings, &literal.value.to_string());
                push("value", value);
            }
        }
        AstKind::BooleanLiteral(literal) => {
            push("value", 0x8000_0000 | u32::from(literal.value));
        }
        AstKind::ObjectProperty(property) => {
            if wants("kind") {
                let kind = format!("{:?}", property.kind).to_ascii_lowercase();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push("computed", 0x8000_0000 | u32::from(property.computed));
            push("method", 0x8000_0000 | u32::from(property.method));
            push("shorthand", 0x8000_0000 | u32::from(property.shorthand));
            if wants("key")
                && let Some(key) = property.key.static_name()
            {
                let key = intern_packed(strings, &key);
                push("key", key);
            }
        }
        AstKind::BinaryExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::LogicalExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::AssignmentExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
        }
        AstKind::UpdateExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
            push("prefix", 0x8000_0000 | u32::from(expression.prefix));
        }
        AstKind::UnaryExpression(expression) => {
            if wants("operator") {
                let operator = intern_packed(strings, expression.operator.as_str());
                push("operator", operator);
            }
            push("prefix", 0x8000_0001);
        }
        AstKind::CallExpression(call) => {
            push("optional", 0x8000_0000 | u32::from(call.optional));
            push("argumentCount", 0x4000_0000 | call.arguments.len() as u32);
            if let Some(identifier) = static_member_root(&call.callee) {
                if wants("calleeName") && matches!(call.callee, Expression::Identifier(_)) {
                    let value = intern_packed(strings, &identifier.name);
                    push("calleeName", value);
                }
                if wants("calleePath")
                    && let Some(path) = static_member_path(&call.callee)
                {
                    let value = intern_packed(strings, &path);
                    push("calleePath", value);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push("calleeGlobal", 0x8000_0000 | u32::from(global));
                }
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants("staticArgument")
            {
                let value = intern_packed(strings, &literal.value);
                push("staticArgument", value);
            }
        }
        AstKind::NewExpression(call) => {
            push("argumentCount", 0x4000_0000 | call.arguments.len() as u32);
            if let Expression::Identifier(identifier) = &call.callee
                && wants("calleeName")
            {
                let value = intern_packed(strings, &identifier.name);
                push("calleeName", value);
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants("staticArgument")
            {
                let value = intern_packed(strings, &literal.value);
                push("staticArgument", value);
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push("computed", 0x8000_0000);
            if wants("property") {
                let value = intern_packed(strings, &member.property.name);
                push("property", value);
            }
            if wants("memberPath") {
                if let Some(path) = precomputed_member_path {
                    let value = intern_packed(strings, path);
                    push("memberPath", value);
                } else if let Some(path) = static_member_path(&member.object) {
                    let path = format!("{path}.{}", member.property.name);
                    let value = intern_packed(strings, &path);
                    push("memberPath", value);
                }
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                if wants("rootName") {
                    let value = intern_packed(strings, &identifier.name);
                    push("rootName", value);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push("rootGlobal", 0x8000_0000 | u32::from(global));
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push("computed", 0x8000_0001);
            if let Expression::StringLiteral(property) = &member.expression {
                if wants("property") {
                    let value = intern_packed(strings, &property.value);
                    push("property", value);
                }
                if wants("memberPath")
                    && let Some(path) = static_member_path(&member.object)
                {
                    let path = format!("{path}.{}", property.value);
                    let value = intern_packed(strings, &path);
                    push("memberPath", value);
                }
            }
        }
        AstKind::Function(function) => {
            if wants("nodeKind") {
                let node_kind = format!("{:?}", function.r#type);
                let node_kind = intern_packed(strings, &node_kind);
                push("nodeKind", node_kind);
            }
            push("async", 0x8000_0000 | u32::from(function.r#async));
            push("generator", 0x8000_0000 | u32::from(function.generator));
            push(
                "parameterCount",
                0x4000_0000 | function.params.items.len() as u32,
            );
            if wants("name")
                && let Some(identifier) = &function.id
            {
                let name = intern_packed(strings, &identifier.name);
                push("name", name);
            }
            if let Some(body) = &function.body {
                let body_start = body.span.start + 1;
                let body_end = body.span.end.saturating_sub(1);
                push(
                    "bodyStart",
                    0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
                );
                push(
                    "bodyEnd",
                    0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
                );
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push("async", 0x8000_0000 | u32::from(function.r#async));
            push("expression", 0x8000_0000 | u32::from(function.expression));
            push(
                "parameterCount",
                0x4000_0000 | function.params.items.len() as u32,
            );
            let inset = u32::from(!function.expression);
            let body_start = function.body.span.start + inset;
            let body_end = function.body.span.end.saturating_sub(inset);
            push(
                "bodyStart",
                0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
            );
            push(
                "bodyEnd",
                0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
            );
        }
        AstKind::Class(class) => {
            if wants("nodeKind") {
                let node_kind = format!("{:?}", class.r#type);
                let node_kind = intern_packed(strings, &node_kind);
                push("nodeKind", node_kind);
            }
            if wants("name")
                && let Some(identifier) = &class.id
            {
                let name = intern_packed(strings, &identifier.name);
                push("name", name);
            }
        }
        AstKind::ImportDeclaration(declaration) => {
            if wants("source") {
                let source = intern_packed(strings, &declaration.source.value);
                push("source", source);
            }
            if wants("importKind") {
                let import_kind = format!("{:?}", declaration.import_kind).to_ascii_lowercase();
                let import_kind = intern_packed(strings, &import_kind);
                push("importKind", import_kind);
            }
            push(
                "specifierCount",
                0x4000_0000
                    | declaration
                        .specifiers
                        .as_ref()
                        .map_or(0, |specifiers| specifiers.len()) as u32,
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            if wants("imported") {
                let imported = intern_packed(strings, &specifier.imported.name());
                push("imported", imported);
            }
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
            if wants("importKind") {
                let import_kind = format!("{:?}", specifier.import_kind).to_ascii_lowercase();
                let import_kind = intern_packed(strings, &import_kind);
                push("importKind", import_kind);
            }
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            let imported = intern_packed(strings, "default");
            push("imported", imported);
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            let imported = intern_packed(strings, "*");
            push("imported", imported);
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name);
                push("local", local);
            }
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if wants("source")
                && let Some(source) = &declaration.source
            {
                let source = intern_packed(strings, &source.value);
                push("source", source);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", declaration.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
            push(
                "specifierCount",
                0x4000_0000 | declaration.specifiers.len() as u32,
            );
        }
        AstKind::ExportDefaultDeclaration(declaration) => {
            if wants("declaredName") {
                let name = match &declaration.declaration {
                    ExportDefaultDeclarationKind::FunctionDeclaration(function) => function
                        .id
                        .as_ref()
                        .map(|identifier| identifier.name.as_str()),
                    ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                        class.id.as_ref().map(|identifier| identifier.name.as_str())
                    }
                    _ => None,
                };
                if let Some(name) = name {
                    let name = intern_packed(strings, name);
                    push("declaredName", name);
                }
            }
        }
        AstKind::ExportAllDeclaration(declaration) => {
            if wants("source") {
                let source = intern_packed(strings, &declaration.source.value);
                push("source", source);
            }
            if wants("exported")
                && let Some(exported) = &declaration.exported
            {
                let exported = intern_packed(strings, &exported.name());
                push("exported", exported);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", declaration.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
        }
        AstKind::ExportSpecifier(specifier) => {
            if wants("local") {
                let local = intern_packed(strings, &specifier.local.name());
                push("local", local);
            }
            if wants("exported") {
                let exported = intern_packed(strings, &specifier.exported.name());
                push("exported", exported);
            }
            if wants("exportKind") {
                let export_kind = format!("{:?}", specifier.export_kind).to_ascii_lowercase();
                let export_kind = intern_packed(strings, &export_kind);
                push("exportKind", export_kind);
            }
        }
        AstKind::VariableDeclaration(declaration) => {
            if wants("kind") {
                let kind = declaration.kind.to_string();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push(
                "declarationCount",
                0x4000_0000 | declaration.declarations.len() as u32,
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            if wants("kind") {
                let kind = declarator.kind.to_string();
                let kind = intern_packed(strings, &kind);
                push("kind", kind);
            }
            push(
                "hasInitializer",
                0x8000_0000 | u32::from(declarator.init.is_some()),
            );
        }
        AstKind::Directive(directive) => {
            if wants("value") {
                let value = intern_packed(strings, &directive.directive);
                push("value", value);
            }
        }
        AstKind::YieldExpression(expression) => {
            push("delegate", 0x8000_0000 | u32::from(expression.delegate));
        }
        AstKind::ImportMeta(_) => {
            let meta = intern_packed(strings, "import");
            push("meta", meta);
            let property = intern_packed(strings, "meta");
            push("property", property);
        }
        AstKind::NewTarget(_) => {
            let meta = intern_packed(strings, "new");
            push("meta", meta);
            let property = intern_packed(strings, "target");
            push("property", property);
        }
        _ => return None,
    }
    if let Some(value) = constant_for_kind(kind) {
        if wants("constantKind") {
            let kind = intern_packed(strings, value.kind());
            push("constantKind", kind);
        }
        if wants("constantValue") {
            let encoded = value.encode();
            let value = intern_packed(strings, &encoded);
            push("constantValue", value);
        }
    }
    Some(result)
}

pub(crate) fn fields(
    kind: AstKind<'_>,
    scoping: Option<&Scoping>,
    requested: Option<&[String]>,
) -> Vec<NodeField> {
    let mut result = Vec::new();
    macro_rules! push {
        ($key:expr, $value:expr $(,)?) => {
            if requested.is_none_or(|fields| {
                fields.iter().any(|field| {
                    field == $key || $key.strip_suffix("Byte").is_some_and(|name| field == name)
                })
            }) {
                result.push(NodeField {
                    key: $key.into(),
                    value: $value,
                });
            }
        };
    }
    match kind {
        AstKind::IdentifierReference(identifier) => {
            push!("name", identifier.name.to_string());
            if let Some(scoping) = scoping {
                let reference = identifier
                    .reference_id
                    .get()
                    .map(|id| scoping.get_reference(id));
                let global = reference.is_some_and(|reference| reference.symbol_id().is_none());
                push!("global", global.to_string());
                if let Some(reference) = reference {
                    push!("read", reference.is_read().to_string());
                    push!("write", reference.is_write().to_string());
                }
                if let Some(reference_id) = identifier.reference_id.get()
                    && let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id()
                {
                    push!(
                        "bindingScopeId",
                        scoping.symbol_scope_id(symbol_id).index().to_string(),
                    );
                }
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            push!("name", identifier.name.to_string());
            push!("binding", "true".into());
        }
        AstKind::IdentifierName(identifier) => push!("name", identifier.name.to_string()),
        AstKind::StringLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::NumericLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::BooleanLiteral(literal) => push!("value", literal.value.to_string()),
        AstKind::ObjectProperty(property) => {
            push!("kind", format!("{:?}", property.kind).to_ascii_lowercase());
            push!("computed", property.computed.to_string());
            push!("method", property.method.to_string());
            push!("shorthand", property.shorthand.to_string());
            if let Some(key) = property.key.static_name() {
                push!("key", key.to_string());
            }
        }
        AstKind::UpdateExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
            push!("prefix", expression.prefix.to_string());
        }
        AstKind::UnaryExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
            push!("prefix", "true".into());
        }
        AstKind::BinaryExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::LogicalExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::AssignmentExpression(expression) => {
            push!("operator", expression.operator.as_str().into());
        }
        AstKind::CallExpression(call) => {
            push!("optional", call.optional.to_string());
            push!("argumentCount", call.arguments.len().to_string());
            if let Some(identifier) = static_member_root(&call.callee) {
                if matches!(call.callee, Expression::Identifier(_)) {
                    push!("calleeName", identifier.name.to_string());
                }
                if let Some(path) = static_member_path(&call.callee) {
                    push!("calleePath", path);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push!("calleeGlobal", global.to_string());
                }
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!("staticArgument", literal.value.to_string());
            }
        }
        AstKind::NewExpression(call) => {
            push!("argumentCount", call.arguments.len().to_string());
            if let Expression::Identifier(identifier) = &call.callee {
                push!("calleeName", identifier.name.to_string());
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!("staticArgument", literal.value.to_string());
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push!("computed", "false".into());
            push!("property", member.property.name.to_string());
            if let Some(path) = static_member_path(&member.object) {
                push!("memberPath", format!("{path}.{}", member.property.name));
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                push!("rootName", identifier.name.to_string());
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push!("rootGlobal", global.to_string());
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push!("computed", "true".into());
            if let Expression::StringLiteral(property) = &member.expression {
                push!("property", property.value.to_string());
                if let Some(path) = static_member_path(&member.object) {
                    push!("memberPath", format!("{path}.{}", property.value));
                }
            }
        }
        AstKind::Function(function) => {
            push!("nodeKind", format!("{:?}", function.r#type));
            push!("async", function.r#async.to_string());
            push!("generator", function.generator.to_string());
            push!("parameterCount", function.params.items.len().to_string());
            if let Some(identifier) = &function.id {
                push!("name", identifier.name.to_string());
            }
            if let Some(body) = &function.body {
                push!("bodyStartByte", (body.span.start + 1).to_string());
                push!("bodyEndByte", body.span.end.saturating_sub(1).to_string());
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push!("async", function.r#async.to_string());
            push!("expression", function.expression.to_string());
            push!("parameterCount", function.params.items.len().to_string());
            let inset = u32::from(!function.expression);
            push!(
                "bodyStartByte",
                (function.body.span.start + inset).to_string(),
            );
            push!(
                "bodyEndByte",
                function.body.span.end.saturating_sub(inset).to_string(),
            );
        }
        AstKind::Class(class) => {
            push!("nodeKind", format!("{:?}", class.r#type));
            if let Some(identifier) = &class.id {
                push!("name", identifier.name.to_string());
            }
        }
        AstKind::ImportDeclaration(declaration) => {
            push!("source", declaration.source.value.to_string());
            push!(
                "importKind",
                format!("{:?}", declaration.import_kind).to_ascii_lowercase(),
            );
            push!(
                "specifierCount",
                declaration
                    .specifiers
                    .as_ref()
                    .map_or(0, |specifiers| specifiers.len())
                    .to_string(),
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            push!("imported", specifier.imported.name().to_string());
            push!("local", specifier.local.name.to_string());
            push!(
                "importKind",
                format!("{:?}", specifier.import_kind).to_ascii_lowercase(),
            );
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            push!("imported", "default".into());
            push!("local", specifier.local.name.to_string());
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            push!("imported", "*".into());
            push!("local", specifier.local.name.to_string());
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if let Some(source) = &declaration.source {
                push!("source", source.value.to_string());
            }
            push!(
                "exportKind",
                format!("{:?}", declaration.export_kind).to_ascii_lowercase(),
            );
            push!("specifierCount", declaration.specifiers.len().to_string());
        }
        AstKind::ExportDefaultDeclaration(declaration) => {
            let name = match &declaration.declaration {
                ExportDefaultDeclarationKind::FunctionDeclaration(function) => function
                    .id
                    .as_ref()
                    .map(|identifier| identifier.name.as_str()),
                ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                    class.id.as_ref().map(|identifier| identifier.name.as_str())
                }
                _ => None,
            };
            if let Some(name) = name {
                push!("declaredName", name.to_string());
            }
        }
        AstKind::ExportAllDeclaration(declaration) => {
            push!("source", declaration.source.value.to_string());
            if let Some(exported) = &declaration.exported {
                push!("exported", exported.name().to_string());
            }
            push!(
                "exportKind",
                format!("{:?}", declaration.export_kind).to_ascii_lowercase(),
            );
        }
        AstKind::ExportSpecifier(specifier) => {
            push!("local", specifier.local.name().to_string());
            push!("exported", specifier.exported.name().to_string());
            push!(
                "exportKind",
                format!("{:?}", specifier.export_kind).to_ascii_lowercase(),
            );
        }
        AstKind::VariableDeclaration(declaration) => {
            push!("kind", declaration.kind.to_string());
            push!(
                "declarationCount",
                declaration.declarations.len().to_string(),
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            push!("kind", declarator.kind.to_string());
            push!("hasInitializer", declarator.init.is_some().to_string());
        }
        AstKind::Directive(directive) => {
            push!("value", directive.directive.to_string());
        }
        AstKind::YieldExpression(expression) => {
            push!("delegate", expression.delegate.to_string());
        }
        AstKind::ImportMeta(_) => {
            push!("meta", "import".into());
            push!("property", "meta".into());
        }
        AstKind::NewTarget(_) => {
            push!("meta", "new".into());
            push!("property", "target".into());
        }
        _ => {}
    }
    if let Some(value) = constant_for_kind(kind) {
        push!("constantKind", value.kind().into());
        push!("constantValue", value.encode());
    }
    result
}

pub(crate) fn predicate_scalar_type(field: &str, node_type_id: u32, value: &str) -> u8 {
    if matches!(
        field,
        "bindingScopeId"
            | "argumentCount"
            | "bodyStart"
            | "bodyEnd"
            | "specifierCount"
            | "declarationCount"
            | "parameterCount"
    ) || (field == "value" && node_type_name(node_type_id) == Some("NumericLiteral"))
    {
        1
    } else if matches!(
        field,
        "global"
            | "read"
            | "write"
            | "binding"
            | "optional"
            | "calleeGlobal"
            | "computed"
            | "rootGlobal"
            | "async"
            | "generator"
            | "expression"
            | "hasInitializer"
            | "method"
            | "shorthand"
            | "prefix"
            | "delegate"
    ) || (field == "value" && node_type_name(node_type_id) == Some("BooleanLiteral"))
    {
        2
    } else if field == "constantValue" {
        if value == "true" || value == "false" {
            2
        } else if value.parse::<f64>().is_ok() {
            1
        } else {
            0
        }
    } else {
        0
    }
}
