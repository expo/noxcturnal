#![allow(clippy::format_push_string)]

use oxc_ast::{
    AstKind,
    ast::{
        Class, ClassElement, ClassType, Expression, MethodDefinition, MethodDefinitionKind,
        PropertyKey, Statement,
    },
};
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::edit::{EditCommand, EditKind, MappingPolicy};
use crate::generated::inline_helpers::{
    INLINE_CLASS_CONSTRUCT_HELPER, INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME,
    INLINE_CLASS_PRIVATE_HELPERS, INLINE_CLASS_PRIVATE_HELPERS_RUNTIME,
    INLINE_CLASS_SUPER_GET_HELPER, INLINE_CLASS_SUPER_GET_HELPER_RUNTIME,
};

const CONSTRUCT_PLACEHOLDER: &str = "__BABEL_GENERATED_CONSTRUCT_HELPER__";
const SUPER_GET_PLACEHOLDER: &str = "__BABEL_GENERATED_SUPER_GET_HELPER__";
const PRIVATE_BASE_PLACEHOLDER: &str = "__BABEL_GENERATED_PRIVATE_BASE_HELPER__";
const PRIVATE_CALL_PLACEHOLDER: &str = "__BABEL_GENERATED_PRIVATE_CALL_HELPER__";

#[expect(clippy::too_many_arguments)]
pub(super) fn edits(
    source: &str,
    semantic: &Semantic<'_>,
    lower_all_classes: bool,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    private_methods_loose: Option<bool>,
    private_in_loose: Option<bool>,
    inline_helpers: bool,
) -> Result<Option<Vec<EditCommand>>, &'static str> {
    let nodes = semantic.nodes();
    let mut private_in_spans: Vec<Span> = nodes
        .iter()
        .filter_map(|node| match node.kind() {
            AstKind::PrivateInExpression(expression) => Some(expression.span),
            _ => None,
        })
        .collect();
    private_in_spans.sort_unstable_by_key(|span| span.start);
    let classes: FxHashSet<NodeId> = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| {
            let AstKind::Class(class) = node.kind() else {
                return None;
            };
            let owns_private_method = private_methods_loose.is_some()
                && class.body.body.iter().any(|element| {
                    matches!(element, ClassElement::MethodDefinition(method)
                        if matches!(method.key, PropertyKey::PrivateIdentifier(_)))
                });
            let owns_private_in =
                private_in_loose.is_some() && contains_span(&private_in_spans, class.span);
            (lower_all_classes || owns_private_method || owns_private_in).then_some(id)
        })
        .collect();
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    let helper_names = ClassHelperNames {
        construct: reserve("_construct", &mut reserved),
        construct_runtime: reserve("_construct2", &mut reserved),
        super_get: reserve("_get", &mut reserved),
        super_get_runtime: reserve("_get2", &mut reserved),
        private_base: reserve("_classPrivateFieldLooseBase", &mut reserved),
        private_call: reserve("_classPrivateMethodCall", &mut reserved),
        private_runtime: reserve("_classPrivateFieldLooseBase2", &mut reserved),
    };
    let mut helper_usage = ClassHelperUsage::default();
    let mut edits = Vec::new();
    for (id, node) in nodes.iter_enumerated() {
        let AstKind::Class(class) = node.kind() else {
            continue;
        };
        if !classes.contains(&id) {
            continue;
        }
        if nodes
            .ancestor_ids(id)
            .any(|ancestor| classes.contains(&ancestor))
        {
            continue;
        }
        edits.push(lower(
            source,
            semantic,
            class,
            class_properties_loose,
            class_static_blocks,
            private_methods_loose,
            private_in_loose,
            &private_in_spans,
            &mut reserved,
            &helper_names,
            &mut helper_usage,
        )?);
    }
    if !edits.is_empty() {
        let helper_prefix = class_helper_prefix(&helper_names, helper_usage, inline_helpers);
        if !helper_prefix.is_empty() {
            let prologue_offset = nodes
                .iter()
                .find_map(|node| match node.kind() {
                    AstKind::Program(program) => program
                        .directives
                        .last()
                        .map_or(Some(0), |directive| Some(directive.span.end)),
                    _ => None,
                })
                .unwrap_or(0);
            edits.push(EditCommand {
                kind: EditKind::Prologue,
                start: prologue_offset,
                end: prologue_offset,
                content: Some(format!("\n{helper_prefix}")),
                parts: Vec::new(),
                destination: None,
                mapping: Some(MappingPolicy::Sourceless),
                order: None,
                names: None,
            });
        }
    }
    Ok((!edits.is_empty()).then_some(edits))
}

#[expect(clippy::too_many_arguments)]
fn lower(
    source: &str,
    semantic: &Semantic<'_>,
    class: &Class<'_>,
    class_properties_loose: Option<bool>,
    class_static_blocks: bool,
    private_methods_loose: Option<bool>,
    private_in_loose: Option<bool>,
    private_in_spans: &[Span],
    reserved: &mut FxHashSet<String>,
    helper_names: &ClassHelperNames,
    helper_usage: &mut ClassHelperUsage,
) -> Result<EditCommand, &'static str> {
    let name = class
        .id
        .as_ref()
        .map_or_else(|| reserve("_Class", reserved), |id| id.name.to_string());
    let constructor = class.body.body.iter().find_map(|element| match element {
        ClassElement::MethodDefinition(method)
            if method.kind == MethodDefinitionKind::Constructor =>
        {
            Some(method.as_ref())
        }
        _ => None,
    });
    if private_methods_loose == Some(false) || private_in_loose == Some(false) {
        return Err("classes-spec-private-features-not-implemented");
    }
    let mut private_keys = FxHashMap::default();
    for element in &class.body.body {
        let key = match element {
            ClassElement::MethodDefinition(method) => match &method.key {
                PropertyKey::PrivateIdentifier(identifier) => Some(identifier.name.as_str()),
                _ => None,
            },
            ClassElement::PropertyDefinition(property) => match &property.key {
                PropertyKey::PrivateIdentifier(identifier) => Some(identifier.name.as_str()),
                _ => None,
            },
            _ => None,
        };
        if let Some(key) = key {
            private_keys
                .entry(key.to_owned())
                .or_insert_with(|| reserve(&format!("_{key}"), reserved));
        }
    }
    for element in &class.body.body {
        match element {
            ClassElement::MethodDefinition(method) => {
                if matches!(method.key, PropertyKey::PrivateIdentifier(_))
                    && private_methods_loose != Some(true)
                {
                    return Err("classes-private-elements-require-private-transform");
                }
            }
            ClassElement::PropertyDefinition(property) => {
                if matches!(property.key, PropertyKey::PrivateIdentifier(_))
                    && class_properties_loose != Some(true)
                {
                    return Err("classes-private-elements-require-private-transform");
                }
                if class_properties_loose.is_none() {
                    return Err("classes-fields-require-class-properties-transform");
                }
            }
            ClassElement::AccessorProperty(_) => {
                return Err("classes-accessor-properties-not-implemented");
            }
            ClassElement::StaticBlock(_) => {
                if !class_static_blocks {
                    return Err("classes-static-block-requires-static-block-transform");
                }
            }
            ClassElement::TSIndexSignature(_) => {}
        }
    }
    let has_private_in = contains_span(private_in_spans, class.span);
    if has_private_in && private_in_loose != Some(true) {
        return Err("classes-private-in-requires-private-property-in-object-transform");
    }
    if class.super_class.is_some()
        && constructor.is_some_and(|constructor| {
            let body = constructor.value.body.as_ref().unwrap();
            private_keys
                .keys()
                .any(|private| slice(source, body.span).contains(&format!("#{private}")))
        })
    {
        return Err("classes-private-constructor-access-not-implemented");
    }
    let super_name = class
        .super_class
        .as_ref()
        .map(|super_class| slice(source, super_class.span()).to_owned());
    let has_super_methods = class.body.body.iter().any(|element| {
        matches!(element, ClassElement::MethodDefinition(method)
            if method.kind != MethodDefinitionKind::Constructor && contains_super(source, method))
    });
    let has_private_keys = !private_keys.is_empty();
    helper_usage.construct |= super_name.is_some();
    helper_usage.super_get |= has_super_methods;
    helper_usage.private |= has_private_keys;
    let mut body = String::from("(()=>{\"use strict\";");
    if has_private_keys {
        for (private_name, binding) in &private_keys {
            body.push_str(&format!(
                "var {binding}=\"__private_{}_{}\";",
                name, private_name
            ));
        }
    }
    let mut instance_initializers = String::new();
    let mut static_initializers: Vec<(u32, String)> = Vec::new();
    if let Some(loose) = class_properties_loose {
        for element in &class.body.body {
            let ClassElement::PropertyDefinition(property) = element else {
                continue;
            };
            let is_private = matches!(property.key, PropertyKey::PrivateIdentifier(_));
            let key = if let PropertyKey::PrivateIdentifier(identifier) = &property.key {
                private_keys[identifier.name.as_str()].clone()
            } else if property.computed {
                let temporary = reserve("_key", reserved);
                body.push_str(&format!(
                    "var {temporary}={};",
                    slice(source, property.key.span())
                ));
                temporary
            } else if loose {
                match &property.key {
                    PropertyKey::StaticIdentifier(identifier) => identifier.name.to_string(),
                    _ => property_key(source, &property.key, false),
                }
            } else {
                property_key(source, &property.key, false)
            };
            let value = match &property.value {
                Some(value) => {
                    private_contents(source, semantic, value.span(), value.span(), &private_keys)?
                }
                None => "void 0".to_owned(),
            };
            let target = if property.r#static { &name } else { "this" };
            let initializer = if is_private {
                format!("Object.defineProperty({target},{key},{{writable:true,value:{value}}});")
            } else if loose {
                if is_identifier_key(&property.key, property.computed) {
                    format!("{target}.{key}={value};")
                } else {
                    format!("{target}[{key}]={value};")
                }
            } else {
                format!(
                    "Object.defineProperty({target},{key},{{value:{value},enumerable:true,configurable:true,writable:true}});"
                )
            };
            if property.r#static {
                static_initializers.push((property.span.start, initializer));
            } else {
                instance_initializers.push_str(&initializer);
            }
        }
    }
    if class_static_blocks {
        for element in &class.body.body {
            if let ClassElement::StaticBlock(block) = element {
                let block_source = slice(source, block.span);
                let open = block_source.find('{').unwrap();
                let contents_span = Span::new(
                    block.span.start + open as u32 + 1,
                    block.span.end.saturating_sub(1),
                );
                let contents =
                    private_contents(source, semantic, block.span, contents_span, &private_keys)?;
                static_initializers.push((
                    block.span.start,
                    format!("(function(){{{contents}}}).call({name});"),
                ));
            }
        }
    }
    let mut private_accessors: FxHashMap<String, (bool, Option<String>, Option<String>, u32)> =
        FxHashMap::default();
    for element in &class.body.body {
        let ClassElement::MethodDefinition(method) = element else {
            continue;
        };
        let PropertyKey::PrivateIdentifier(identifier) = &method.key else {
            continue;
        };
        let key = &private_keys[identifier.name.as_str()];
        let function = private_method_function(source, semantic, method, &private_keys)?;
        let target = if method.r#static { &name } else { "this" };
        if method.kind != MethodDefinitionKind::Method {
            let accessor = private_accessors.entry(key.clone()).or_insert((
                method.r#static,
                None,
                None,
                method.span.start,
            ));
            if method.kind == MethodDefinitionKind::Get {
                accessor.1 = Some(function);
            } else {
                accessor.2 = Some(function);
            }
            accessor.3 = accessor.3.min(method.span.start);
            continue;
        }
        let initializer = format!("Object.defineProperty({target},{key},{{value:{function}}});");
        if method.r#static {
            static_initializers.push((method.span.start, initializer));
        } else {
            instance_initializers.push_str(&initializer);
        }
    }
    for (key, (is_static, getter, setter, start)) in private_accessors {
        let target = if is_static { &name } else { "this" };
        let mut descriptor = String::new();
        if let Some(getter) = getter {
            descriptor.push_str(&format!("get:{getter},"));
        }
        if let Some(setter) = setter {
            descriptor.push_str(&format!("set:{setter},"));
        }
        let initializer = format!("Object.defineProperty({target},{key},{{{descriptor}}});");
        if is_static {
            static_initializers.push((start, initializer));
        } else {
            instance_initializers.push_str(&initializer);
        }
    }
    if let Some(constructor) = constructor {
        if let Some(super_name) = &super_name {
            body.push_str(&derived_constructor(
                source,
                &name,
                super_name,
                constructor,
                &instance_initializers,
            )?);
        } else {
            body.push_str(&constructor_function(
                source,
                semantic,
                &name,
                constructor,
                &instance_initializers,
                &private_keys,
            )?);
        }
    } else if let Some(super_name) = &super_name {
        body.push_str(&format!(
            "function {name}(){{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");var _this={CONSTRUCT_PLACEHOLDER}({super_name},arguments,new.target||{name});(function(){{{instance_initializers}}}).call(_this);return _this}}"
        ));
    } else {
        body.push_str(&format!(
            "function {name}(){{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{instance_initializers}}}"
        ));
    }
    if let Some(super_name) = &super_name {
        body.push_str(&format!(
            "if(Object.setPrototypeOf)Object.setPrototypeOf({name},{super_name});else {name}.__proto__={super_name};{name}.prototype=Object.create({super_name}&&{super_name}.prototype,{{constructor:{{value:{name},writable:true,configurable:true}}}});"
        ));
    }
    for element in &class.body.body {
        let ClassElement::MethodDefinition(method) = element else {
            continue;
        };
        if method.kind == MethodDefinitionKind::Constructor {
            continue;
        }
        if matches!(method.key, PropertyKey::PrivateIdentifier(_)) {
            continue;
        }
        let target = if method.r#static {
            name.clone()
        } else {
            format!("{name}.prototype")
        };
        let key = property_key(source, &method.key, method.computed);
        let has_private_syntax = private_keys.keys().any(|name| {
            let body = method.value.body.as_ref().unwrap();
            let body = slice(source, body.span);
            body.contains(&format!("#{name}"))
        });
        let function = if contains_super(source, method) && has_private_syntax {
            return Err("classes-combined-super-private-method-not-implemented");
        } else if contains_super(source, method) {
            let Some(_) = &super_name else {
                return Err("classes-super-without-heritage");
            };
            method_function_with_super(source, semantic, &name, method)?
        } else if has_private_syntax {
            private_method_function(source, semantic, method, &private_keys)?
        } else {
            method_function(source, "", method, false, "")
        };
        let descriptor = match method.kind {
            MethodDefinitionKind::Get => {
                format!("{{get:{function},configurable:true}}")
            }
            MethodDefinitionKind::Set => {
                format!("{{set:{function},configurable:true}}")
            }
            MethodDefinitionKind::Method => {
                format!("{{value:{function},writable:true,configurable:true}}")
            }
            MethodDefinitionKind::Constructor => unreachable!(),
        };
        body.push_str(&format!(
            "Object.defineProperty({target},{key},{descriptor});"
        ));
    }
    static_initializers.sort_unstable_by_key(|(start, _)| *start);
    for (_, initializer) in static_initializers {
        body.push_str(&initializer);
    }
    body.push_str(&format!("return {name}}})()"));
    let mut start = class.span.start;
    let mut default_export = false;
    if class.r#type == ClassType::ClassDeclaration {
        let prefix = &source[..class.span.start as usize];
        let trimmed = prefix.trim_end();
        if trimmed.ends_with("export default") {
            start = (trimmed.len() - "export default".len()) as u32;
            default_export = true;
        }
    }
    let content = if default_export {
        format!("var {name}={body};export default {name};")
    } else if class.r#type == ClassType::ClassDeclaration {
        format!("var {name}={body};")
    } else {
        body
    }
    .replace(CONSTRUCT_PLACEHOLDER, &helper_names.construct)
    .replace(SUPER_GET_PLACEHOLDER, &helper_names.super_get)
    .replace(PRIVATE_BASE_PLACEHOLDER, &helper_names.private_base)
    .replace(PRIVATE_CALL_PLACEHOLDER, &helper_names.private_call);
    Ok(EditCommand {
        kind: EditKind::Replace,
        start,
        end: class.span.end,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    })
}

fn contains_span(sorted_spans: &[Span], container: Span) -> bool {
    let first = sorted_spans.partition_point(|span| span.start < container.start);
    sorted_spans[first..]
        .iter()
        .take_while(|span| span.start <= container.end)
        .any(|span| span.end <= container.end)
}

struct ClassHelperNames {
    construct: String,
    construct_runtime: String,
    super_get: String,
    super_get_runtime: String,
    private_base: String,
    private_call: String,
    private_runtime: String,
}

#[derive(Clone, Copy, Default)]
struct ClassHelperUsage {
    construct: bool,
    super_get: bool,
    private: bool,
}

fn class_helper_prefix(
    names: &ClassHelperNames,
    usage: ClassHelperUsage,
    inline_helpers: bool,
) -> String {
    let mut prefix = String::new();
    if usage.private {
        let helper = if inline_helpers {
            INLINE_CLASS_PRIVATE_HELPERS
        } else {
            INLINE_CLASS_PRIVATE_HELPERS_RUNTIME
        };
        prefix.push_str(
            &helper
                .replace(
                    "_classPrivateFieldLooseBase2",
                    "__BABEL_PRIVATE_FIELD_LOOSE_BASE_RUNTIME__",
                )
                .replace("_classPrivateFieldLooseBase", &names.private_base)
                .replace("_classPrivateMethodCall", &names.private_call)
                .replace(
                    "__BABEL_PRIVATE_FIELD_LOOSE_BASE_RUNTIME__",
                    &names.private_runtime,
                ),
        );
    }
    if usage.construct {
        let helper = if inline_helpers {
            INLINE_CLASS_CONSTRUCT_HELPER
        } else {
            INLINE_CLASS_CONSTRUCT_HELPER_RUNTIME
        };
        prefix.push_str(
            &helper
                .replace("_construct2", "__BABEL_CONSTRUCT_RUNTIME__")
                .replace("_construct", &names.construct)
                .replace("__BABEL_CONSTRUCT_RUNTIME__", &names.construct_runtime),
        );
    }
    if usage.super_get {
        let helper = if inline_helpers {
            INLINE_CLASS_SUPER_GET_HELPER
        } else {
            INLINE_CLASS_SUPER_GET_HELPER_RUNTIME
        };
        prefix.push_str(
            &helper
                .replace("_get2", "__BABEL_GET_RUNTIME__")
                .replace("_get", &names.super_get)
                .replace("__BABEL_GET_RUNTIME__", &names.super_get_runtime),
        );
    }
    prefix
}

fn is_identifier_key(key: &PropertyKey<'_>, computed: bool) -> bool {
    !computed && matches!(key, PropertyKey::StaticIdentifier(_))
}

fn private_body_contents(
    source: &str,
    semantic: &Semantic<'_>,
    body: &oxc_ast::ast::FunctionBody<'_>,
    private_keys: &FxHashMap<String, String>,
) -> Result<String, &'static str> {
    private_contents(
        source,
        semantic,
        body.span,
        Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
        private_keys,
    )
}

fn private_contents(
    source: &str,
    semantic: &Semantic<'_>,
    container: Span,
    contents: Span,
    private_keys: &FxHashMap<String, String>,
) -> Result<String, &'static str> {
    // Walking the semantic node table is intentionally reserved for containers
    // that can contain a private reference. Field initializers make this helper
    // run once per field, so scanning every node for ordinary public fields
    // would make class lowering quadratic in otherwise unrelated syntax.
    if private_keys.is_empty() || !slice(source, container).contains('#') {
        return Ok(slice(source, contents).to_owned());
    }
    let mut replacements: Vec<(Span, String)> = Vec::new();
    let mut occupied = Vec::new();
    for node in semantic.nodes().iter() {
        let span = node.kind().span();
        if span.start < container.start || span.end > container.end {
            continue;
        }
        match node.kind() {
            AstKind::CallExpression(call) => {
                let Expression::PrivateFieldExpression(field) = &call.callee else {
                    continue;
                };
                let Some(key) = private_keys.get(field.field.name.as_str()) else {
                    return Err("classes-private-name-resolution-failed");
                };
                let call_source = slice(source, call.span);
                let open = call_source[field.span.size() as usize..]
                    .find('(')
                    .map(|offset| offset + field.span.size() as usize)
                    .ok_or("classes-private-call-shape-not-implemented")?;
                let arguments = &call_source[open + 1..call_source.len() - 1];
                replacements.push((
                    call.span,
                    format!(
                        "{PRIVATE_CALL_PLACEHOLDER}({}, {key}, [{arguments}])",
                        slice(source, field.object.span())
                    ),
                ));
                occupied.push(call.span);
            }
            AstKind::PrivateInExpression(expression) => {
                let Some(key) = private_keys.get(expression.left.name.as_str()) else {
                    return Err("classes-private-name-resolution-failed");
                };
                replacements.push((
                    expression.span,
                    format!(
                        "Object.prototype.hasOwnProperty.call({}, {key})",
                        slice(source, expression.right.span())
                    ),
                ));
                occupied.push(expression.span);
            }
            _ => {}
        }
    }
    for node in semantic.nodes().iter() {
        let AstKind::PrivateFieldExpression(field) = node.kind() else {
            continue;
        };
        if field.span.start < container.start
            || field.span.end > container.end
            || occupied
                .iter()
                .any(|span| field.span.start >= span.start && field.span.end <= span.end)
        {
            continue;
        }
        let Some(key) = private_keys.get(field.field.name.as_str()) else {
            return Err("classes-private-name-resolution-failed");
        };
        replacements.push((
            field.span,
            format!(
                "{PRIVATE_BASE_PLACEHOLDER}({}, {key})[{key}]",
                slice(source, field.object.span())
            ),
        ));
    }
    replacements.sort_unstable_by_key(|(span, _)| span.start);
    for pair in replacements.windows(2) {
        if pair[0].0.end > pair[1].0.start {
            return Err("classes-private-edit-conflict");
        }
    }
    let mut output = String::new();
    let mut cursor = contents.start;
    for (span, replacement) in replacements {
        if span.start < contents.start || span.end > contents.end {
            continue;
        }
        output.push_str(slice(source, Span::new(cursor, span.start)));
        output.push_str(&replacement);
        cursor = span.end;
    }
    output.push_str(slice(source, Span::new(cursor, contents.end)));
    Ok(output)
}

fn private_method_function(
    source: &str,
    semantic: &Semantic<'_>,
    method: &MethodDefinition<'_>,
    private_keys: &FxHashMap<String, String>,
) -> Result<String, &'static str> {
    let function = &method.value;
    let body = function.body.as_ref().unwrap();
    let contents = private_body_contents(source, semantic, body, private_keys)?;
    let prefix = match (function.r#async, function.generator) {
        (true, true) => "async function*",
        (true, false) => "async function",
        (false, true) => "function*",
        (false, false) => "function",
    };
    Ok(format!(
        "{prefix}{}{{{contents}}}",
        slice(source, function.params.span)
    ))
}

fn method_function_with_super(
    source: &str,
    semantic: &Semantic<'_>,
    class_name: &str,
    method: &MethodDefinition<'_>,
) -> Result<String, &'static str> {
    let function = &method.value;
    let body = function.body.as_ref().unwrap();
    let base = if method.r#static {
        format!("Object.getPrototypeOf({class_name})")
    } else {
        format!("Object.getPrototypeOf({class_name}.prototype)")
    };
    let mut replacements: Vec<(Span, String)> = Vec::new();
    let mut call_spans = Vec::new();
    for node in semantic.nodes().iter() {
        let span = node.kind().span();
        if span.start < body.span.start || span.end > body.span.end {
            continue;
        }
        if matches!(
            node.kind(),
            AstKind::AssignmentExpression(_) | AstKind::UpdateExpression(_)
        ) && slice(source, span).contains("super")
        {
            return Err("classes-super-write-not-implemented");
        }
        let AstKind::CallExpression(call) = node.kind() else {
            continue;
        };
        let Some((member_span, key)) = super_member(source, &call.callee) else {
            continue;
        };
        let call_source = slice(source, call.span);
        let open = call_source[member_span.size() as usize..]
            .find('(')
            .map(|offset| offset + member_span.size() as usize)
            .ok_or("classes-super-call-shape-not-implemented")?;
        let arguments = &call_source[open + 1..call_source.len() - 1];
        let separator = if !arguments.trim().is_empty() {
            ","
        } else {
            ""
        };
        replacements.push((
            call.span,
            format!("{SUPER_GET_PLACEHOLDER}({base},{key},this).call(this{separator}{arguments})"),
        ));
        call_spans.push(call.span);
    }
    for node in semantic.nodes().iter() {
        let span = node.kind().span();
        if span.start < body.span.start
            || span.end > body.span.end
            || call_spans
                .iter()
                .any(|call| span.start >= call.start && span.end <= call.end)
        {
            continue;
        }
        let key = match node.kind() {
            AstKind::StaticMemberExpression(member) if member.object.is_super() => {
                format!("{:?}", member.property.name.as_str())
            }
            AstKind::ComputedMemberExpression(member) if member.object.is_super() => {
                slice(source, member.expression.span()).to_owned()
            }
            _ => continue,
        };
        replacements.push((span, format!("{SUPER_GET_PLACEHOLDER}({base},{key},this)")));
    }
    replacements.sort_unstable_by_key(|(span, _)| span.start);
    for pair in replacements.windows(2) {
        if pair[0].0.end > pair[1].0.start {
            return Err("classes-super-edit-conflict");
        }
    }
    let mut contents = String::new();
    let mut cursor = body.span.start + 1;
    for (span, replacement) in replacements {
        contents.push_str(slice(source, Span::new(cursor, span.start)));
        contents.push_str(&replacement);
        cursor = span.end;
    }
    contents.push_str(slice(
        source,
        Span::new(cursor, body.span.end.saturating_sub(1)),
    ));
    let prefix = match (function.r#async, function.generator) {
        (true, true) => "async function*",
        (true, false) => "async function",
        (false, true) => "function*",
        (false, false) => "function",
    };
    Ok(format!(
        "{prefix}{}{{{contents}}}",
        slice(source, function.params.span)
    ))
}

fn super_member(source: &str, expression: &Expression<'_>) -> Option<(Span, String)> {
    match expression {
        Expression::StaticMemberExpression(member) if member.object.is_super() => {
            Some((member.span, format!("{:?}", member.property.name.as_str())))
        }
        Expression::ComputedMemberExpression(member) if member.object.is_super() => Some((
            member.span,
            slice(source, member.expression.span()).to_owned(),
        )),
        _ => None,
    }
}

fn derived_constructor(
    source: &str,
    name: &str,
    super_name: &str,
    constructor: &MethodDefinition<'_>,
    instance_initializers: &str,
) -> Result<String, &'static str> {
    let function = &constructor.value;
    let body = function.body.as_ref().unwrap();
    if slice(source, body.span).contains("new.target") {
        return Err("classes-derived-new-target-not-implemented");
    }
    let Some((statement_span, call_span)) =
        body.statements
            .iter()
            .find_map(|statement| match statement {
                Statement::ExpressionStatement(statement)
                    if statement.expression.is_super_call_expression() =>
                {
                    let oxc_ast::ast::Expression::CallExpression(call) = &statement.expression
                    else {
                        unreachable!()
                    };
                    Some((statement.span, call.span))
                }
                _ => None,
            })
    else {
        return Err("classes-derived-constructor-super-flow-not-implemented");
    };
    let params = slice(source, function.params.span);
    let call = slice(source, call_span);
    let open = call.find('(').unwrap();
    let arguments = &call[open + 1..call.len() - 1];
    let before = slice(source, Span::new(body.span.start + 1, statement_span.start));
    let after = slice(
        source,
        Span::new(statement_span.end, body.span.end.saturating_sub(1)),
    );
    Ok(format!(
        "function {name}{params}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{before}var _this={CONSTRUCT_PLACEHOLDER}({super_name},[{arguments}],new.target||{name});(function(){{{instance_initializers}}}).call(_this);var _result=(function(){{{after}}}).apply(_this,arguments);if(_result!==void 0){{if((typeof _result===\"object\"&&_result!==null)||typeof _result===\"function\")return _result;throw new TypeError(\"Derived constructors may only return object or undefined\")}}return _this}}"
    ))
}

fn method_function(
    source: &str,
    name: &str,
    method: &MethodDefinition<'_>,
    constructor: bool,
    instance_initializers: &str,
) -> String {
    let function = &method.value;
    let prefix = match (function.r#async, function.generator) {
        (true, true) => "async function*",
        (true, false) => "async function",
        (false, true) => "function*",
        (false, false) => "function",
    };
    let params = slice(source, function.params.span);
    let body = function.body.as_ref().unwrap();
    let contents = slice(
        source,
        Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
    );
    if constructor {
        format!(
            "{prefix} {name}{params}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{instance_initializers}{contents}}}"
        )
    } else {
        format!("{prefix}{params}{{{contents}}}")
    }
}

fn constructor_function(
    source: &str,
    semantic: &Semantic<'_>,
    name: &str,
    constructor: &MethodDefinition<'_>,
    instance_initializers: &str,
    private_keys: &FxHashMap<String, String>,
) -> Result<String, &'static str> {
    let function = &constructor.value;
    let body = function.body.as_ref().unwrap();
    let contents = if private_keys.is_empty() {
        slice(
            source,
            Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
        )
        .to_owned()
    } else {
        private_body_contents(source, semantic, body, private_keys)?
    };
    Ok(format!(
        "function {name}{}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{instance_initializers}{contents}}}",
        slice(source, function.params.span)
    ))
}

fn property_key(source: &str, key: &PropertyKey<'_>, computed: bool) -> String {
    if computed {
        return slice(source, key.span()).to_owned();
    }
    match key {
        PropertyKey::StaticIdentifier(identifier) => format!("{:?}", identifier.name.as_str()),
        _ => slice(source, key.span()).to_owned(),
    }
}

fn contains_super(source: &str, method: &MethodDefinition<'_>) -> bool {
    let body = method.value.body.as_ref().unwrap();
    slice(source, body.span).contains("super")
}

fn reserve(base: &str, reserved: &mut FxHashSet<String>) -> String {
    if reserved.insert(base.to_owned()) {
        return base.to_owned();
    }
    for suffix in reserved.len().max(2).. {
        let candidate = format!("{base}{suffix}");
        if reserved.insert(candidate.clone()) {
            return candidate;
        }
    }
    unreachable!()
}

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
}
