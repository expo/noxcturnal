use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::{
    AstKind,
    ast::{
        AssignmentTarget, BindingPattern, ClassType, ExportDefaultDeclarationKind, Expression,
        FunctionType, ImportOrExportKind, PropertyKind, VariableDeclarationKind,
    },
};
use oxc_semantic::Scoping;
use rustc_hash::FxHashMap;

use crate::event_types::NodeField;
use crate::generated::event_schema::{field_ids, node_type_name};
use crate::protocol::constants::FieldMask;
use crate::semantic::constant_eval::constant_for_kind;

use super::member::{static_member_path, static_member_path_with, static_member_root};

/// Byte offset to UTF-16 offset, one entry per byte plus the end of source.
///
/// Every byte of a multi-byte character maps to that character's starting UTF-16
/// offset, so the table is filled in one forward pass: each character appends its
/// own start offset once per byte it occupies.
pub(crate) fn utf16_index<'a>(source: &str, allocator: &'a Allocator) -> ArenaVec<'a, u32> {
    let mut offsets = ArenaVec::with_capacity_in(source.len() + 1, &allocator);
    let mut utf16 = 0u32;
    for ch in source.chars() {
        for _ in 0..ch.len_utf8() {
            offsets.push(utf16);
        }
        utf16 += ch.len_utf16() as u32;
    }
    offsets.push(utf16);
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

fn property_kind(kind: PropertyKind) -> &'static str {
    match kind {
        PropertyKind::Init => "init",
        PropertyKind::Get => "get",
        PropertyKind::Set => "set",
    }
}

fn function_kind(kind: FunctionType) -> &'static str {
    match kind {
        FunctionType::FunctionDeclaration => "FunctionDeclaration",
        FunctionType::FunctionExpression => "FunctionExpression",
        FunctionType::TSDeclareFunction => "TSDeclareFunction",
        FunctionType::TSEmptyBodyFunctionExpression => "TSEmptyBodyFunctionExpression",
    }
}

fn class_kind(kind: ClassType) -> &'static str {
    match kind {
        ClassType::ClassDeclaration => "ClassDeclaration",
        ClassType::ClassExpression => "ClassExpression",
    }
}

fn import_export_kind(kind: ImportOrExportKind) -> &'static str {
    match kind {
        ImportOrExportKind::Value => "value",
        ImportOrExportKind::Type => "type",
    }
}

fn variable_kind(kind: VariableDeclarationKind) -> &'static str {
    match kind {
        VariableDeclarationKind::Var => "var",
        VariableDeclarationKind::Let => "let",
        VariableDeclarationKind::Const => "const",
        VariableDeclarationKind::Using => "using",
        VariableDeclarationKind::AwaitUsing => "await using",
    }
}

fn assignment_target_name(target: &AssignmentTarget<'_>) -> Option<String> {
    if let Some(name) = target.get_identifier_name() {
        return Some(name.to_owned());
    }
    fn expression_name(expression: &Expression<'_>) -> Option<String> {
        match expression {
            Expression::Identifier(identifier) => Some(identifier.name.to_string()),
            Expression::StaticMemberExpression(member) => Some(member.property.name.to_string()),
            Expression::ComputedMemberExpression(member) => {
                member.static_property_name().map(|name| name.to_string())
            }
            Expression::TSAsExpression(expression) => expression_name(&expression.expression),
            Expression::TSSatisfiesExpression(expression) => {
                expression_name(&expression.expression)
            }
            Expression::TSNonNullExpression(expression) => expression_name(&expression.expression),
            Expression::TSTypeAssertion(expression) => expression_name(&expression.expression),
            Expression::ParenthesizedExpression(expression) => {
                expression_name(&expression.expression)
            }
            _ => None,
        }
    }
    target.get_expression().and_then(expression_name)
}

pub(crate) struct DirectPackedFields {
    pub(crate) words: [u32; 32],
    pub(crate) len: usize,
}

#[expect(
    clippy::too_many_arguments,
    reason = "hot-path scalars stay separate to avoid a per-node context wrapper"
)]
pub(crate) fn packed_fields_direct(
    kind: AstKind<'_>,
    source: &str,
    member_write: bool,
    member_root_write: bool,
    scoping: Option<&Scoping>,
    utf16: Option<&[u32]>,
    requested: FieldMask,
    strings: &mut FxHashMap<String, u32>,
) -> Option<DirectPackedFields> {
    let wants = |key: u32| requested.wants(key);
    let mut result = DirectPackedFields {
        words: [0; 32],
        len: 0,
    };
    // An explicitly empty request can push nothing; skip the kind match and constant
    // evaluation entirely for the common "routed without payload fields" case.
    if requested.is_empty() {
        return Some(result);
    }
    let mut push = |key: u32, value: u32| {
        if wants(key) {
            result.words[result.len] = key;
            result.words[result.len + 1] = value;
            result.len += 2;
        }
    };
    if (wants(field_ids::DECLARATION_NAME_ANCHOR) || wants(field_ids::DECLARATION_NAME_PREFIX))
        && let Some(anchor) = declaration_name_anchor(kind, source)
    {
        let anchor = utf16.map_or(anchor, |index| index[anchor as usize]);
        push(field_ids::DECLARATION_NAME_ANCHOR, 0x4000_0000 | anchor);
        push(field_ids::DECLARATION_NAME_PREFIX, 0x8000_0001);
    }
    match kind {
        AstKind::IdentifierReference(identifier) => {
            if wants(field_ids::NAME) {
                let value = intern_packed(strings, &identifier.name);
                push(field_ids::NAME, value);
            }
            if let Some(scoping) = scoping {
                let reference = identifier
                    .reference_id
                    .get()
                    .map(|id| scoping.get_reference(id));
                push(
                    field_ids::GLOBAL,
                    0x8000_0000
                        | u32::from(
                            reference.is_some_and(|reference| reference.symbol_id().is_none()),
                        ),
                );
                if let Some(reference) = reference {
                    push(
                        field_ids::READ,
                        0x8000_0000 | u32::from(reference.is_read()),
                    );
                    push(
                        field_ids::WRITE,
                        0x8000_0000 | u32::from(reference.is_write()),
                    );
                    push(
                        field_ids::MEMBER_WRITE,
                        0x8000_0000 | u32::from(member_root_write),
                    );
                    if let Some(symbol_id) = reference.symbol_id() {
                        push(
                            field_ids::BINDING_SCOPE_ID,
                            0x4000_0000 | scoping.symbol_scope_id(symbol_id).index() as u32,
                        );
                    }
                }
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            if wants(field_ids::NAME) {
                let value = intern_packed(strings, &identifier.name);
                push(field_ids::NAME, value);
            }
            push(field_ids::BINDING, 0x8000_0001);
        }
        AstKind::IdentifierName(identifier) => {
            if wants(field_ids::NAME) {
                let value = intern_packed(strings, &identifier.name);
                push(field_ids::NAME, value);
            }
        }
        AstKind::StringLiteral(literal) => {
            if wants(field_ids::VALUE) {
                let value = intern_packed(strings, &literal.value);
                push(field_ids::VALUE, value);
            }
        }
        AstKind::RegExpLiteral(literal) => {
            if wants(field_ids::PATTERN) {
                let value = intern_packed(strings, &literal.regex.pattern.text);
                push(field_ids::PATTERN, value);
            }
            if wants(field_ids::FLAGS) {
                // Oxc's flag bitset is canonicalized, but consumers need the lexical
                // spelling (including its original order). The parser-owned raw literal
                // retains that spelling; use the parsed pattern boundary to isolate it.
                let raw = literal.raw.map_or_else(
                    || &source[literal.span.start as usize..literal.span.end as usize],
                    |raw| raw.as_str(),
                );
                let flags_start = literal.regex.pattern.text.len() + 2;
                let flags = raw.get(flags_start..).unwrap_or_default();
                let value = intern_packed(strings, flags);
                push(field_ids::FLAGS, value);
            }
        }
        AstKind::NumericLiteral(literal) => {
            if wants(field_ids::VALUE) {
                let value = intern_packed(strings, &literal.value.to_string());
                push(field_ids::VALUE, value);
            }
        }
        AstKind::BooleanLiteral(literal) => {
            push(field_ids::VALUE, 0x8000_0000 | u32::from(literal.value));
        }
        AstKind::ObjectProperty(property) => {
            if wants(field_ids::KIND) {
                let kind = property_kind(property.kind);
                let kind = intern_packed(strings, kind);
                push(field_ids::KIND, kind);
            }
            push(
                field_ids::COMPUTED,
                0x8000_0000 | u32::from(property.computed),
            );
            push(field_ids::METHOD, 0x8000_0000 | u32::from(property.method));
            push(
                field_ids::SHORTHAND,
                0x8000_0000 | u32::from(property.shorthand),
            );
            if wants(field_ids::KEY)
                && let Some(key) = property.key.static_name()
            {
                let key = intern_packed(strings, &key);
                push(field_ids::KEY, key);
            }
        }
        AstKind::BindingProperty(property) => {
            push(
                field_ids::COMPUTED,
                0x8000_0000 | u32::from(property.computed),
            );
            push(
                field_ids::SHORTHAND,
                0x8000_0000 | u32::from(property.shorthand),
            );
            if wants(field_ids::KEY)
                && let Some(key) = property.key.static_name()
            {
                let key = intern_packed(strings, &key);
                push(field_ids::KEY, key);
            }
        }
        AstKind::BinaryExpression(expression) => {
            if wants(field_ids::OPERATOR) {
                let operator = intern_packed(strings, expression.operator.as_str());
                push(field_ids::OPERATOR, operator);
            }
        }
        AstKind::LogicalExpression(expression) => {
            if wants(field_ids::OPERATOR) {
                let operator = intern_packed(strings, expression.operator.as_str());
                push(field_ids::OPERATOR, operator);
            }
        }
        AstKind::AssignmentExpression(expression) => {
            if wants(field_ids::OPERATOR) {
                let operator = intern_packed(strings, expression.operator.as_str());
                push(field_ids::OPERATOR, operator);
            }
            if wants(field_ids::TARGET_NAME)
                && expression.operator.as_str() == "="
                && let Some(name) = assignment_target_name(&expression.left)
            {
                let name = intern_packed(strings, &name);
                push(field_ids::TARGET_NAME, name);
            }
        }
        AstKind::UpdateExpression(expression) => {
            if wants(field_ids::OPERATOR) {
                let operator = intern_packed(strings, expression.operator.as_str());
                push(field_ids::OPERATOR, operator);
            }
            push(
                field_ids::PREFIX,
                0x8000_0000 | u32::from(expression.prefix),
            );
        }
        AstKind::UnaryExpression(expression) => {
            if wants(field_ids::OPERATOR) {
                let operator = intern_packed(strings, expression.operator.as_str());
                push(field_ids::OPERATOR, operator);
            }
            push(field_ids::PREFIX, 0x8000_0001);
        }
        AstKind::CallExpression(call) => {
            push(field_ids::OPTIONAL, 0x8000_0000 | u32::from(call.optional));
            push(
                field_ids::ARGUMENT_COUNT,
                0x4000_0000 | call.arguments.len() as u32,
            );
            if let Some(identifier) = static_member_root(&call.callee) {
                if wants(field_ids::CALLEE_NAME) && matches!(call.callee, Expression::Identifier(_))
                {
                    let value = intern_packed(strings, &identifier.name);
                    push(field_ids::CALLEE_NAME, value);
                }
                if wants(field_ids::CALLEE_PATH)
                    && let Some(path) = static_member_path(&call.callee)
                {
                    let value = intern_packed(strings, &path);
                    push(field_ids::CALLEE_PATH, value);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push(field_ids::CALLEE_GLOBAL, 0x8000_0000 | u32::from(global));
                }
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants(field_ids::STATIC_ARGUMENT)
            {
                let value = intern_packed(strings, &literal.value);
                push(field_ids::STATIC_ARGUMENT, value);
            }
        }
        AstKind::NewExpression(call) => {
            push(
                field_ids::ARGUMENT_COUNT,
                0x4000_0000 | call.arguments.len() as u32,
            );
            if let Expression::Identifier(identifier) = &call.callee
                && wants(field_ids::CALLEE_NAME)
            {
                let value = intern_packed(strings, &identifier.name);
                push(field_ids::CALLEE_NAME, value);
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first()
                && wants(field_ids::STATIC_ARGUMENT)
            {
                let value = intern_packed(strings, &literal.value);
                push(field_ids::STATIC_ARGUMENT, value);
            }
        }
        AstKind::ImportExpression(import) => {
            if let Expression::StringLiteral(literal) = &import.source
                && wants(field_ids::STATIC_ARGUMENT)
            {
                let value = intern_packed(strings, &literal.value);
                push(field_ids::STATIC_ARGUMENT, value);
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push(field_ids::COMPUTED, 0x8000_0000);
            push(field_ids::WRITE, 0x8000_0000 | u32::from(member_write));
            if wants(field_ids::PROPERTY) {
                let value = intern_packed(strings, &member.property.name);
                push(field_ids::PROPERTY, value);
            }
            if wants(field_ids::MEMBER_PATH)
                && let Some(path) =
                    static_member_path_with(&member.object, Some(&member.property.name))
            {
                let value = intern_packed(strings, &path);
                push(field_ids::MEMBER_PATH, value);
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                if wants(field_ids::ROOT_NAME) {
                    let value = intern_packed(strings, &identifier.name);
                    push(field_ids::ROOT_NAME, value);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push(field_ids::ROOT_GLOBAL, 0x8000_0000 | u32::from(global));
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push(field_ids::COMPUTED, 0x8000_0001);
            push(field_ids::WRITE, 0x8000_0000 | u32::from(member_write));
            if let Expression::StringLiteral(property) = &member.expression {
                if wants(field_ids::PROPERTY) {
                    let value = intern_packed(strings, &property.value);
                    push(field_ids::PROPERTY, value);
                }
                if wants(field_ids::MEMBER_PATH)
                    && let Some(path) =
                        static_member_path_with(&member.object, Some(&property.value))
                {
                    let value = intern_packed(strings, &path);
                    push(field_ids::MEMBER_PATH, value);
                }
            }
        }
        AstKind::PrivateFieldExpression(_) => {
            push(field_ids::WRITE, 0x8000_0000 | u32::from(member_write));
        }
        AstKind::Function(function) => {
            if wants(field_ids::NODE_KIND) {
                let node_kind = function_kind(function.r#type);
                let node_kind = intern_packed(strings, node_kind);
                push(field_ids::NODE_KIND, node_kind);
            }
            push(field_ids::ASYNC, 0x8000_0000 | u32::from(function.r#async));
            push(
                field_ids::GENERATOR,
                0x8000_0000 | u32::from(function.generator),
            );
            push(
                field_ids::PARAMETER_COUNT,
                0x4000_0000 | function.params.items.len() as u32,
            );
            if wants(field_ids::NAME)
                && let Some(identifier) = &function.id
            {
                let name = intern_packed(strings, &identifier.name);
                push(field_ids::NAME, name);
            }
            if let Some(body) = &function.body {
                let body_start = body.span.start + 1;
                let body_end = body.span.end.saturating_sub(1);
                push(
                    field_ids::BODY_START,
                    0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
                );
                push(
                    field_ids::BODY_END,
                    0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
                );
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push(field_ids::ASYNC, 0x8000_0000 | u32::from(function.r#async));
            push(
                field_ids::EXPRESSION,
                0x8000_0000 | u32::from(function.expression),
            );
            push(
                field_ids::PARAMETER_COUNT,
                0x4000_0000 | function.params.items.len() as u32,
            );
            let inset = u32::from(!function.expression);
            let body_start = function.body.span.start + inset;
            let body_end = function.body.span.end.saturating_sub(inset);
            push(
                field_ids::BODY_START,
                0x4000_0000 | utf16.map_or(body_start, |index| index[body_start as usize]),
            );
            push(
                field_ids::BODY_END,
                0x4000_0000 | utf16.map_or(body_end, |index| index[body_end as usize]),
            );
        }
        AstKind::Class(class) => {
            if wants(field_ids::NODE_KIND) {
                let node_kind = class_kind(class.r#type);
                let node_kind = intern_packed(strings, node_kind);
                push(field_ids::NODE_KIND, node_kind);
            }
            if wants(field_ids::NAME)
                && let Some(identifier) = &class.id
            {
                let name = intern_packed(strings, &identifier.name);
                push(field_ids::NAME, name);
            }
        }
        AstKind::ImportDeclaration(declaration) => {
            if wants(field_ids::SOURCE) {
                let source = intern_packed(strings, &declaration.source.value);
                push(field_ids::SOURCE, source);
            }
            if wants(field_ids::IMPORT_KIND) {
                let import_kind = import_export_kind(declaration.import_kind);
                let import_kind = intern_packed(strings, import_kind);
                push(field_ids::IMPORT_KIND, import_kind);
            }
            push(
                field_ids::SPECIFIER_COUNT,
                0x4000_0000
                    | declaration
                        .specifiers
                        .as_ref()
                        .map_or(0, |specifiers| specifiers.len()) as u32,
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            if wants(field_ids::IMPORTED) {
                let imported = intern_packed(strings, &specifier.imported.name());
                push(field_ids::IMPORTED, imported);
            }
            if wants(field_ids::LOCAL) {
                let local = intern_packed(strings, &specifier.local.name);
                push(field_ids::LOCAL, local);
            }
            if wants(field_ids::IMPORT_KIND) {
                let import_kind = import_export_kind(specifier.import_kind);
                let import_kind = intern_packed(strings, import_kind);
                push(field_ids::IMPORT_KIND, import_kind);
            }
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            let imported = intern_packed(strings, "default");
            push(field_ids::IMPORTED, imported);
            if wants(field_ids::LOCAL) {
                let local = intern_packed(strings, &specifier.local.name);
                push(field_ids::LOCAL, local);
            }
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            let imported = intern_packed(strings, "*");
            push(field_ids::IMPORTED, imported);
            if wants(field_ids::LOCAL) {
                let local = intern_packed(strings, &specifier.local.name);
                push(field_ids::LOCAL, local);
            }
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if wants(field_ids::SOURCE)
                && let Some(source) = &declaration.source
            {
                let source = intern_packed(strings, &source.value);
                push(field_ids::SOURCE, source);
            }
            if wants(field_ids::EXPORT_KIND) {
                let export_kind = import_export_kind(declaration.export_kind);
                let export_kind = intern_packed(strings, export_kind);
                push(field_ids::EXPORT_KIND, export_kind);
            }
            push(
                field_ids::SPECIFIER_COUNT,
                0x4000_0000 | declaration.specifiers.len() as u32,
            );
        }
        AstKind::ExportDefaultDeclaration(declaration) => {
            if wants(field_ids::DECLARED_NAME) {
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
                    push(field_ids::DECLARED_NAME, name);
                }
            }
        }
        AstKind::ExportAllDeclaration(declaration) => {
            if wants(field_ids::SOURCE) {
                let source = intern_packed(strings, &declaration.source.value);
                push(field_ids::SOURCE, source);
            }
            if wants(field_ids::EXPORTED)
                && let Some(exported) = &declaration.exported
            {
                let exported = intern_packed(strings, &exported.name());
                push(field_ids::EXPORTED, exported);
            }
            if wants(field_ids::EXPORT_KIND) {
                let export_kind = import_export_kind(declaration.export_kind);
                let export_kind = intern_packed(strings, export_kind);
                push(field_ids::EXPORT_KIND, export_kind);
            }
        }
        AstKind::ExportSpecifier(specifier) => {
            if wants(field_ids::LOCAL) {
                let local = intern_packed(strings, &specifier.local.name());
                push(field_ids::LOCAL, local);
            }
            if wants(field_ids::EXPORTED) {
                let exported = intern_packed(strings, &specifier.exported.name());
                push(field_ids::EXPORTED, exported);
            }
            if wants(field_ids::EXPORT_KIND) {
                let export_kind = import_export_kind(specifier.export_kind);
                let export_kind = intern_packed(strings, export_kind);
                push(field_ids::EXPORT_KIND, export_kind);
            }
        }
        AstKind::VariableDeclaration(declaration) => {
            if wants(field_ids::KIND) {
                let kind = variable_kind(declaration.kind);
                let kind = intern_packed(strings, kind);
                push(field_ids::KIND, kind);
            }
            push(
                field_ids::DECLARATION_COUNT,
                0x4000_0000 | declaration.declarations.len() as u32,
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            if wants(field_ids::KIND) {
                let kind = variable_kind(declarator.kind);
                let kind = intern_packed(strings, kind);
                push(field_ids::KIND, kind);
            }
            push(
                field_ids::HAS_INITIALIZER,
                0x8000_0000 | u32::from(declarator.init.is_some()),
            );
            if wants(field_ids::BINDING_NAME)
                && let BindingPattern::BindingIdentifier(identifier) = &declarator.id
            {
                let name = intern_packed(strings, &identifier.name);
                push(field_ids::BINDING_NAME, name);
            }
        }
        AstKind::Directive(directive) => {
            if wants(field_ids::VALUE) {
                let value = intern_packed(strings, &directive.directive);
                push(field_ids::VALUE, value);
            }
        }
        AstKind::YieldExpression(expression) => {
            push(
                field_ids::DELEGATE,
                0x8000_0000 | u32::from(expression.delegate),
            );
        }
        AstKind::ImportMeta(_) => {
            let meta = intern_packed(strings, "import");
            push(field_ids::META, meta);
            let property = intern_packed(strings, "meta");
            push(field_ids::PROPERTY, property);
        }
        AstKind::NewTarget(_) => {
            let meta = intern_packed(strings, "new");
            push(field_ids::META, meta);
            let property = intern_packed(strings, "target");
            push(field_ids::PROPERTY, property);
        }
        _ => return None,
    }
    if let Some(value) = constant_for_kind(kind) {
        if wants(field_ids::CONSTANT_KIND) {
            let kind = intern_packed(strings, value.kind());
            push(field_ids::CONSTANT_KIND, kind);
        }
        if wants(field_ids::CONSTANT_VALUE) {
            let encoded = value.encode();
            let value = intern_packed(strings, &encoded);
            push(field_ids::CONSTANT_VALUE, value);
        }
    }
    Some(result)
}

/// Locate the declaration-name token boundary in native code. The AST establishes
/// that this is a declaration and whether it is anonymous; this small lexer only
/// walks the declaration header and never asks JavaScript to infer syntax from text.
fn declaration_name_anchor(kind: AstKind<'_>, source: &str) -> Option<u32> {
    let (span, keyword, generator) = match kind {
        AstKind::Function(function)
            if function.r#type == FunctionType::FunctionDeclaration && function.id.is_none() =>
        {
            (function.span, b"function".as_slice(), function.generator)
        }
        AstKind::Class(class)
            if class.r#type == ClassType::ClassDeclaration && class.id.is_none() =>
        {
            (class.span, b"class".as_slice(), false)
        }
        _ => return None,
    };
    let bytes = source.as_bytes();
    let start = span.start as usize;
    let end = span.end as usize;
    let keyword_start = find_header_keyword(bytes, start, end, keyword)?;
    let keyword_end = keyword_start + keyword.len();
    if !generator {
        return Some(keyword_end as u32);
    }
    let mut cursor = keyword_end;
    while cursor < end {
        cursor = skip_header_trivia(bytes, cursor, end);
        if bytes.get(cursor) == Some(&b'*') {
            return Some((cursor + 1) as u32);
        }
        cursor += 1;
    }
    None
}

fn find_header_keyword(
    bytes: &[u8],
    mut cursor: usize,
    end: usize,
    keyword: &[u8],
) -> Option<usize> {
    while cursor + keyword.len() <= end {
        cursor = skip_header_trivia(bytes, cursor, end);
        if bytes.get(cursor..cursor + keyword.len()) == Some(keyword)
            && (cursor == 0 || !is_identifier_byte(bytes[cursor - 1]))
            && (cursor + keyword.len() == bytes.len()
                || !is_identifier_byte(bytes[cursor + keyword.len()]))
        {
            return Some(cursor);
        }
        cursor += 1;
    }
    None
}

fn skip_header_trivia(bytes: &[u8], mut cursor: usize, end: usize) -> usize {
    loop {
        while cursor < end && bytes[cursor].is_ascii_whitespace() {
            cursor += 1;
        }
        if bytes.get(cursor..cursor + 2) == Some(b"//") {
            cursor += 2;
            while cursor < end && !matches!(bytes[cursor], b'\n' | b'\r') {
                cursor += 1;
            }
        } else if bytes.get(cursor..cursor + 2) == Some(b"/*") {
            cursor += 2;
            while cursor + 1 < end && bytes.get(cursor..cursor + 2) != Some(b"*/") {
                cursor += 1;
            }
            cursor = (cursor + 2).min(end);
        } else {
            return cursor;
        }
    }
}

fn is_identifier_byte(byte: u8) -> bool {
    byte == b'$' || byte == b'_' || byte.is_ascii_alphanumeric() || byte >= 0x80
}

pub(crate) fn fields(
    kind: AstKind<'_>,
    source: &str,
    member_write: bool,
    member_root_write: bool,
    scoping: Option<&Scoping>,
    requested: FieldMask,
) -> Vec<NodeField> {
    let mut result = Vec::new();
    // Selection is by protocol id; the emitted key stays a name because byte-offset
    // fields are renamed to their UTF-16 counterparts after materialization.
    macro_rules! push {
        ($field:expr, $key:expr, $value:expr $(,)?) => {
            if requested.wants($field) {
                result.push(NodeField {
                    key: $key.into(),
                    value: $value,
                });
            }
        };
    }
    match kind {
        AstKind::IdentifierReference(identifier) => {
            push!(field_ids::NAME, "name", identifier.name.to_string());
            if let Some(scoping) = scoping {
                let reference = identifier
                    .reference_id
                    .get()
                    .map(|id| scoping.get_reference(id));
                let global = reference.is_some_and(|reference| reference.symbol_id().is_none());
                push!(field_ids::GLOBAL, "global", global.to_string());
                if let Some(reference) = reference {
                    push!(field_ids::READ, "read", reference.is_read().to_string());
                    push!(field_ids::WRITE, "write", reference.is_write().to_string());
                    push!(
                        field_ids::MEMBER_WRITE,
                        "memberWrite",
                        member_root_write.to_string(),
                    );
                }
                if let Some(reference_id) = identifier.reference_id.get()
                    && let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id()
                {
                    push!(
                        field_ids::BINDING_SCOPE_ID,
                        "bindingScopeId",
                        scoping.symbol_scope_id(symbol_id).index().to_string(),
                    );
                }
            }
        }
        AstKind::BindingIdentifier(identifier) => {
            push!(field_ids::NAME, "name", identifier.name.to_string());
            push!(field_ids::BINDING, "binding", "true".into());
        }
        AstKind::IdentifierName(identifier) => {
            push!(field_ids::NAME, "name", identifier.name.to_string())
        }
        AstKind::StringLiteral(literal) => {
            push!(field_ids::VALUE, "value", literal.value.to_string())
        }
        AstKind::RegExpLiteral(literal) => {
            push!(
                field_ids::PATTERN,
                "pattern",
                literal.regex.pattern.text.to_string()
            );
            let raw = literal.raw.map_or_else(
                || &source[literal.span.start as usize..literal.span.end as usize],
                |raw| raw.as_str(),
            );
            let flags = raw
                .get(literal.regex.pattern.text.len() + 2..)
                .unwrap_or_default();
            push!(field_ids::FLAGS, "flags", flags.to_owned());
        }
        AstKind::NumericLiteral(literal) => {
            push!(field_ids::VALUE, "value", literal.value.to_string())
        }
        AstKind::BooleanLiteral(literal) => {
            push!(field_ids::VALUE, "value", literal.value.to_string())
        }
        AstKind::ObjectProperty(property) => {
            push!(
                field_ids::KIND,
                "kind",
                property_kind(property.kind).to_owned()
            );
            push!(
                field_ids::COMPUTED,
                "computed",
                property.computed.to_string()
            );
            push!(field_ids::METHOD, "method", property.method.to_string());
            push!(
                field_ids::SHORTHAND,
                "shorthand",
                property.shorthand.to_string()
            );
            if let Some(key) = property.key.static_name() {
                push!(field_ids::KEY, "key", key.to_string());
            }
        }
        AstKind::BindingProperty(property) => {
            push!(
                field_ids::COMPUTED,
                "computed",
                property.computed.to_string()
            );
            push!(
                field_ids::SHORTHAND,
                "shorthand",
                property.shorthand.to_string()
            );
            if let Some(key) = property.key.static_name() {
                push!(field_ids::KEY, "key", key.to_string());
            }
        }
        AstKind::UpdateExpression(expression) => {
            push!(
                field_ids::OPERATOR,
                "operator",
                expression.operator.as_str().into()
            );
            push!(field_ids::PREFIX, "prefix", expression.prefix.to_string());
        }
        AstKind::UnaryExpression(expression) => {
            push!(
                field_ids::OPERATOR,
                "operator",
                expression.operator.as_str().into()
            );
            push!(field_ids::PREFIX, "prefix", "true".into());
        }
        AstKind::BinaryExpression(expression) => {
            push!(
                field_ids::OPERATOR,
                "operator",
                expression.operator.as_str().into()
            );
        }
        AstKind::LogicalExpression(expression) => {
            push!(
                field_ids::OPERATOR,
                "operator",
                expression.operator.as_str().into()
            );
        }
        AstKind::AssignmentExpression(expression) => {
            push!(
                field_ids::OPERATOR,
                "operator",
                expression.operator.as_str().into()
            );
            if expression.operator.as_str() == "="
                && let Some(name) = assignment_target_name(&expression.left)
            {
                push!(field_ids::TARGET_NAME, "targetName", name);
            }
        }
        AstKind::CallExpression(call) => {
            push!(field_ids::OPTIONAL, "optional", call.optional.to_string());
            push!(
                field_ids::ARGUMENT_COUNT,
                "argumentCount",
                call.arguments.len().to_string()
            );
            if let Some(identifier) = static_member_root(&call.callee) {
                if matches!(call.callee, Expression::Identifier(_)) {
                    push!(
                        field_ids::CALLEE_NAME,
                        "calleeName",
                        identifier.name.to_string()
                    );
                }
                if let Some(path) = static_member_path(&call.callee) {
                    push!(field_ids::CALLEE_PATH, "calleePath", path);
                }
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| !scoping.has_binding(id));
                    push!(field_ids::CALLEE_GLOBAL, "calleeGlobal", global.to_string());
                }
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!(
                    field_ids::STATIC_ARGUMENT,
                    "staticArgument",
                    literal.value.to_string()
                );
            }
        }
        AstKind::NewExpression(call) => {
            push!(
                field_ids::ARGUMENT_COUNT,
                "argumentCount",
                call.arguments.len().to_string()
            );
            if let Expression::Identifier(identifier) = &call.callee {
                push!(
                    field_ids::CALLEE_NAME,
                    "calleeName",
                    identifier.name.to_string()
                );
            }
            if let Some(oxc_ast::ast::Argument::StringLiteral(literal)) = call.arguments.first() {
                push!(
                    field_ids::STATIC_ARGUMENT,
                    "staticArgument",
                    literal.value.to_string()
                );
            }
        }
        AstKind::ImportExpression(import) => {
            if let Expression::StringLiteral(literal) = &import.source {
                push!(
                    field_ids::STATIC_ARGUMENT,
                    "staticArgument",
                    literal.value.to_string()
                );
            }
        }
        AstKind::StaticMemberExpression(member) => {
            push!(field_ids::COMPUTED, "computed", "false".into());
            push!(field_ids::WRITE, "write", member_write.to_string(),);
            push!(
                field_ids::PROPERTY,
                "property",
                member.property.name.to_string()
            );
            if let Some(path) = static_member_path(&member.object) {
                push!(
                    field_ids::MEMBER_PATH,
                    "memberPath",
                    format!("{path}.{}", member.property.name)
                );
            }
            let mut object = &member.object;
            while let Expression::StaticMemberExpression(parent) = object {
                object = &parent.object;
            }
            if let Expression::Identifier(identifier) = object {
                push!(
                    field_ids::ROOT_NAME,
                    "rootName",
                    identifier.name.to_string()
                );
                if let Some(scoping) = scoping {
                    let global = identifier
                        .reference_id
                        .get()
                        .is_some_and(|id| scoping.get_reference(id).symbol_id().is_none());
                    push!(field_ids::ROOT_GLOBAL, "rootGlobal", global.to_string());
                }
            }
        }
        AstKind::ComputedMemberExpression(member) => {
            push!(field_ids::COMPUTED, "computed", "true".into());
            push!(field_ids::WRITE, "write", member_write.to_string(),);
            if let Expression::StringLiteral(property) = &member.expression {
                push!(field_ids::PROPERTY, "property", property.value.to_string());
                if let Some(path) = static_member_path(&member.object) {
                    push!(
                        field_ids::MEMBER_PATH,
                        "memberPath",
                        format!("{path}.{}", property.value)
                    );
                }
            }
        }
        AstKind::PrivateFieldExpression(_) => {
            push!(field_ids::WRITE, "write", member_write.to_string(),);
        }
        AstKind::Function(function) => {
            push!(
                field_ids::NODE_KIND,
                "nodeKind",
                function_kind(function.r#type).to_owned()
            );
            push!(field_ids::ASYNC, "async", function.r#async.to_string());
            push!(
                field_ids::GENERATOR,
                "generator",
                function.generator.to_string()
            );
            push!(
                field_ids::PARAMETER_COUNT,
                "parameterCount",
                function.params.items.len().to_string()
            );
            if let Some(identifier) = &function.id {
                push!(field_ids::NAME, "name", identifier.name.to_string());
            }
            if let Some(body) = &function.body {
                push!(
                    field_ids::BODY_START,
                    "bodyStartByte",
                    (body.span.start + 1).to_string()
                );
                push!(
                    field_ids::BODY_END,
                    "bodyEndByte",
                    body.span.end.saturating_sub(1).to_string()
                );
            }
        }
        AstKind::ArrowFunctionExpression(function) => {
            push!(field_ids::ASYNC, "async", function.r#async.to_string());
            push!(
                field_ids::EXPRESSION,
                "expression",
                function.expression.to_string()
            );
            push!(
                field_ids::PARAMETER_COUNT,
                "parameterCount",
                function.params.items.len().to_string()
            );
            let inset = u32::from(!function.expression);
            push!(
                field_ids::BODY_START,
                "bodyStartByte",
                (function.body.span.start + inset).to_string(),
            );
            push!(
                field_ids::BODY_END,
                "bodyEndByte",
                function.body.span.end.saturating_sub(inset).to_string(),
            );
        }
        AstKind::Class(class) => {
            push!(
                field_ids::NODE_KIND,
                "nodeKind",
                class_kind(class.r#type).to_owned()
            );
            if let Some(identifier) = &class.id {
                push!(field_ids::NAME, "name", identifier.name.to_string());
            }
        }
        AstKind::ImportDeclaration(declaration) => {
            push!(
                field_ids::SOURCE,
                "source",
                declaration.source.value.to_string()
            );
            push!(
                field_ids::IMPORT_KIND,
                "importKind",
                import_export_kind(declaration.import_kind).to_owned(),
            );
            push!(
                field_ids::SPECIFIER_COUNT,
                "specifierCount",
                declaration
                    .specifiers
                    .as_ref()
                    .map_or(0, |specifiers| specifiers.len())
                    .to_string(),
            );
        }
        AstKind::ImportSpecifier(specifier) => {
            push!(
                field_ids::IMPORTED,
                "imported",
                specifier.imported.name().to_string()
            );
            push!(field_ids::LOCAL, "local", specifier.local.name.to_string());
            push!(
                field_ids::IMPORT_KIND,
                "importKind",
                import_export_kind(specifier.import_kind).to_owned(),
            );
        }
        AstKind::ImportDefaultSpecifier(specifier) => {
            push!(field_ids::IMPORTED, "imported", "default".into());
            push!(field_ids::LOCAL, "local", specifier.local.name.to_string());
        }
        AstKind::ImportNamespaceSpecifier(specifier) => {
            push!(field_ids::IMPORTED, "imported", "*".into());
            push!(field_ids::LOCAL, "local", specifier.local.name.to_string());
        }
        AstKind::ExportNamedDeclaration(declaration) => {
            if let Some(source) = &declaration.source {
                push!(field_ids::SOURCE, "source", source.value.to_string());
            }
            push!(
                field_ids::EXPORT_KIND,
                "exportKind",
                import_export_kind(declaration.export_kind).to_owned(),
            );
            push!(
                field_ids::SPECIFIER_COUNT,
                "specifierCount",
                declaration.specifiers.len().to_string()
            );
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
                push!(field_ids::DECLARED_NAME, "declaredName", name.to_string());
            }
        }
        AstKind::ExportAllDeclaration(declaration) => {
            push!(
                field_ids::SOURCE,
                "source",
                declaration.source.value.to_string()
            );
            if let Some(exported) = &declaration.exported {
                push!(field_ids::EXPORTED, "exported", exported.name().to_string());
            }
            push!(
                field_ids::EXPORT_KIND,
                "exportKind",
                import_export_kind(declaration.export_kind).to_owned(),
            );
        }
        AstKind::ExportSpecifier(specifier) => {
            push!(
                field_ids::LOCAL,
                "local",
                specifier.local.name().to_string()
            );
            push!(
                field_ids::EXPORTED,
                "exported",
                specifier.exported.name().to_string()
            );
            push!(
                field_ids::EXPORT_KIND,
                "exportKind",
                import_export_kind(specifier.export_kind).to_owned(),
            );
        }
        AstKind::VariableDeclaration(declaration) => {
            push!(
                field_ids::KIND,
                "kind",
                variable_kind(declaration.kind).to_owned()
            );
            push!(
                field_ids::DECLARATION_COUNT,
                "declarationCount",
                declaration.declarations.len().to_string(),
            );
        }
        AstKind::VariableDeclarator(declarator) => {
            push!(
                field_ids::KIND,
                "kind",
                variable_kind(declarator.kind).to_owned()
            );
            push!(
                field_ids::HAS_INITIALIZER,
                "hasInitializer",
                declarator.init.is_some().to_string()
            );
            if let BindingPattern::BindingIdentifier(identifier) = &declarator.id {
                push!(
                    field_ids::BINDING_NAME,
                    "bindingName",
                    identifier.name.to_string()
                );
            }
        }
        AstKind::Directive(directive) => {
            push!(field_ids::VALUE, "value", directive.directive.to_string());
        }
        AstKind::YieldExpression(expression) => {
            push!(
                field_ids::DELEGATE,
                "delegate",
                expression.delegate.to_string()
            );
        }
        AstKind::ImportMeta(_) => {
            push!(field_ids::META, "meta", "import".into());
            push!(field_ids::PROPERTY, "property", "meta".into());
        }
        AstKind::NewTarget(_) => {
            push!(field_ids::META, "meta", "new".into());
            push!(field_ids::PROPERTY, "property", "target".into());
        }
        _ => {}
    }
    if let Some(value) = constant_for_kind(kind) {
        push!(
            field_ids::CONSTANT_KIND,
            "constantKind",
            value.kind().into()
        );
        push!(field_ids::CONSTANT_VALUE, "constantValue", value.encode());
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
