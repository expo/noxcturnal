#![allow(clippy::format_push_string)]

use oxc_ast::{
    AstKind,
    ast::{
        Class, ClassElement, ClassType, Expression, Function, FunctionBody, MethodDefinition,
        MethodDefinitionKind, PropertyKey, Statement,
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
    // Not `find_map` over every method: an overload signature precedes the
    // implementation it belongs to, so the first `constructor` in the body is
    // often the one with no code in it.
    let constructor =
        emitted_methods(class).find(|method| method.kind == MethodDefinitionKind::Constructor);
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
    let super_name = class
        .super_class
        .as_ref()
        .map(|super_class| slice(source, super_class.span()).to_owned());
    let has_private_keys = !private_keys.is_empty();
    helper_usage.construct |= super_name.is_some();
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
                Some(value) => rewritten(
                    source,
                    semantic,
                    value.span(),
                    value.span(),
                    &BodyRewrite {
                        private_keys: Some(&private_keys),
                        ..BodyRewrite::default()
                    },
                )?,
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
                let contents = rewritten(
                    source,
                    semantic,
                    block.span,
                    contents_span,
                    &BodyRewrite {
                        private_keys: Some(&private_keys),
                        ..BodyRewrite::default()
                    },
                )?;
                static_initializers.push((
                    block.span.start,
                    format!("(function(){{{contents}}}).call({name});"),
                ));
            }
        }
    }
    let mut private_accessors: FxHashMap<String, (bool, Option<String>, Option<String>, u32)> =
        FxHashMap::default();
    for method in emitted_methods(class) {
        let PropertyKey::PrivateIdentifier(identifier) = &method.key else {
            continue;
        };
        let key = &private_keys[identifier.name.as_str()];
        let base = (super_name.is_some() && contains_super(source, method))
            .then(|| super_base(&name, method.r#static));
        let function = rewritten_method(
            source,
            semantic,
            method,
            &BodyRewrite {
                private_keys: Some(&private_keys),
                super_base: base.as_deref(),
                ..BodyRewrite::default()
            },
        )?;
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
                semantic,
                &name,
                super_name,
                constructor,
                &instance_initializers,
                &private_keys,
                reserved,
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
        let this_alias = local_name("_this", reserved);
        body.push_str(&format!(
            "function {name}(){{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");var {this_alias}={CONSTRUCT_PLACEHOLDER}({super_name},arguments,new.target||{name});{}return {this_alias}}}",
            initialize_instance(&instance_initializers, &this_alias)
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
    for method in emitted_methods(class) {
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
        let uses_super = contains_super(source, method);
        if uses_super && super_name.is_none() {
            return Err("classes-super-without-heritage");
        }
        let base = uses_super.then(|| super_base(&name, method.r#static));
        let function = rewritten_method(
            source,
            semantic,
            method,
            &BodyRewrite {
                private_keys: Some(&private_keys),
                super_base: base.as_deref(),
                ..BodyRewrite::default()
            },
        )?;
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
    // Read the requirement off the generated text rather than predicting it
    // from the class shape: the constructor, an ordinary method, a private
    // method and a field initializer can each reach for these, and only the
    // placeholders know which of them actually did. The class-shape test still
    // gates the scan, because a class with no heritage and no private names
    // cannot have emitted either placeholder.
    helper_usage.super_get |= super_name.is_some() && body.contains(SUPER_GET_PLACEHOLDER);
    helper_usage.private |= has_private_keys
        && (body.contains(PRIVATE_BASE_PLACEHOLDER) || body.contains(PRIVATE_CALL_PLACEHOLDER));
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

/// One source range replaced by generated text.
///
/// `parts` keeps the ranges of the original that survive inside the
/// replacement, so a rewrite nested in one of them is rendered rather than
/// copied verbatim. `super.draw(this.#paint)` needs exactly that: it is one
/// `super` call whose argument is a private read.
struct Rewrite {
    span: Span,
    parts: Vec<Part>,
}

enum Part {
    Text(String),
    Source(Span),
}

impl Rewrite {
    fn text(span: Span, content: String) -> Self {
        Self {
            span,
            parts: vec![Part::Text(content)],
        }
    }
}

/// What the text of a class element has to become once it is lifted out of the
/// class into a plain function.
///
/// Every field is independently optional because the callers need different
/// subsets: a private method needs only the private keys, a `super`-using
/// method only the base, and a derived constructor needs all of them at once.
#[derive(Default)]
struct BodyRewrite<'a> {
    /// Loose-mode string keys for `#private` names, keyed by name.
    private_keys: Option<&'a FxHashMap<String, String>>,
    /// The object `super.x` reads through. `None` leaves `super` alone.
    super_base: Option<&'a str>,
    /// The callee that stands in for `super(...)`.
    super_call: Option<&'a str>,
    /// What `this` becomes. `None` leaves it alone.
    this_alias: Option<&'a str>,
    /// What `new.target` becomes. `None` leaves it alone.
    new_target_alias: Option<&'a str>,
}

impl BodyRewrite<'_> {
    fn receiver(&self) -> &str {
        self.this_alias.unwrap_or("this")
    }

    /// Whether the container can hold anything this rewrite would change.
    ///
    /// Walking the semantic node table is intentionally reserved for containers
    /// that pass this test. Field initializers make the rewriter run once per
    /// field, and a derived constructor body always mentions `super`, so
    /// scanning every node unconditionally would make class lowering quadratic
    /// in otherwise unrelated syntax.
    fn applies(&self, source: &str, container: Span) -> bool {
        let text = slice(source, container);
        (self.private_keys.is_some_and(|keys| !keys.is_empty()) && text.contains('#'))
            || (self.super_base.is_some() && mentions_super(text, SuperUse::Property))
            || (self.super_call.is_some() && mentions_super(text, SuperUse::Call))
            || (self.this_alias.is_some() && text.contains("this"))
            || (self.new_target_alias.is_some() && text.contains("new.target"))
    }
}

#[derive(Clone, Copy, PartialEq)]
enum SuperUse {
    Call,
    Property,
}

/// Whether the text plausibly holds `super(…)`, or `super.x` / `super[x]`.
///
/// Deliberately textual and deliberately over-eager: it only decides whether
/// the node table is worth walking, and the walk is what actually decides.
fn mentions_super(text: &str, use_: SuperUse) -> bool {
    let mut rest = text;
    while let Some(index) = rest.find("super") {
        rest = &rest[index + "super".len()..];
        let following = rest.trim_start().as_bytes().first().copied();
        let matched = match following {
            Some(b'(') => use_ == SuperUse::Call,
            Some(b'.' | b'[') => use_ == SuperUse::Property,
            _ => false,
        };
        if matched {
            return true;
        }
    }
    false
}

/// Every rewrite `container` calls for, ordered outermost-first so the renderer
/// can nest them, and checked for the partial overlaps it cannot render.
///
/// Empty when nothing applies, which is also what makes [`render`] a copy.
fn body_rewrites(
    source: &str,
    semantic: &Semantic<'_>,
    container: Span,
    rewrite: &BodyRewrite<'_>,
) -> Result<Vec<Rewrite>, &'static str> {
    if !rewrite.applies(source, container) {
        return Ok(Vec::new());
    }
    let mut rewrites = collect_rewrites(source, semantic, container, rewrite)?;
    // Outermost first at a shared start, so a call renders before the member
    // expression that is its own callee.
    rewrites.sort_unstable_by_key(|item| (item.span.start, std::cmp::Reverse(item.span.end)));
    for pair in rewrites.windows(2) {
        let (outer, inner) = (pair[0].span, pair[1].span);
        if outer.end > inner.start && inner.end > outer.end {
            return Err("classes-body-edit-conflict");
        }
    }
    Ok(rewrites)
}

/// The text of `contents` with every rewrite `container` calls for applied.
///
/// `container` is the range the node table is searched over and `contents` the
/// range that is emitted; they differ when the caller wants the inside of a
/// block without its braces. A caller that emits several ranges out of one
/// container should collect [`body_rewrites`] once and [`render`] each range.
fn rewritten(
    source: &str,
    semantic: &Semantic<'_>,
    container: Span,
    contents: Span,
    rewrite: &BodyRewrite<'_>,
) -> Result<String, &'static str> {
    if !rewrite.applies(source, container) {
        return Ok(slice(source, contents).to_owned());
    }
    let rewrites = body_rewrites(source, semantic, container, rewrite)?;
    let mut output = String::new();
    render(source, contents, &rewrites, &mut output);
    Ok(output)
}

fn render(source: &str, span: Span, rewrites: &[Rewrite], output: &mut String) {
    let mut cursor = span.start;
    for rewrite in rewrites {
        if rewrite.span.start < cursor || rewrite.span.end > span.end {
            continue;
        }
        output.push_str(slice(source, Span::new(cursor, rewrite.span.start)));
        for part in &rewrite.parts {
            match part {
                Part::Text(text) => output.push_str(text),
                Part::Source(inner) => render(source, *inner, rewrites, output),
            }
        }
        cursor = rewrite.span.end;
    }
    output.push_str(slice(source, Span::new(cursor, span.end)));
}

fn collect_rewrites(
    source: &str,
    semantic: &Semantic<'_>,
    container: Span,
    rewrite: &BodyRewrite<'_>,
) -> Result<Vec<Rewrite>, &'static str> {
    let nodes = semantic.nodes();
    let mut rewrites = Vec::new();
    let private_key = |name: &str| {
        rewrite
            .private_keys
            .and_then(|keys| keys.get(name))
            .ok_or("classes-private-name-resolution-failed")
    };
    for (node_id, node) in nodes.iter_enumerated() {
        let span = node.kind().span();
        if span.start < container.start || span.end > container.end {
            continue;
        }
        match node.kind() {
            // A write through `super` needs `Reflect.set` semantics that the
            // `_get` helper cannot express, so it stays on the Babel path.
            AstKind::AssignmentExpression(assignment)
                if rewrite.super_base.is_some()
                    && slice(source, assignment.left.span()).contains("super") =>
            {
                return Err("classes-super-write-not-implemented");
            }
            AstKind::UpdateExpression(update)
                if rewrite.super_base.is_some()
                    && slice(source, update.argument.span()).contains("super") =>
            {
                return Err("classes-super-write-not-implemented");
            }
            AstKind::CallExpression(call) => {
                let arguments = call_arguments(call);
                if call.callee.is_super() {
                    let Some(callee) = rewrite.super_call else {
                        continue;
                    };
                    if !shares_this(nodes, node_id, container) {
                        continue;
                    }
                    rewrites.push(Rewrite {
                        span: call.span,
                        parts: argument_list(format!("{callee}("), arguments, String::from(")")),
                    });
                } else if let Some((_, key)) = super_member(source, &call.callee) {
                    let Some(base) = rewrite.super_base else {
                        continue;
                    };
                    let receiver = rewrite.receiver();
                    rewrites.push(Rewrite {
                        span: call.span,
                        parts: argument_list(
                            format!(
                                "{SUPER_GET_PLACEHOLDER}({base},{key},{receiver}).call({receiver}{}",
                                if arguments.is_some() { "," } else { "" }
                            ),
                            arguments,
                            String::from(")"),
                        ),
                    });
                } else if let Expression::PrivateFieldExpression(field) = &call.callee {
                    let key = private_key(field.field.name.as_str())?;
                    let mut parts = vec![
                        Part::Text(format!("{PRIVATE_CALL_PLACEHOLDER}(")),
                        Part::Source(field.object.span()),
                        Part::Text(format!(", {key}, [")),
                    ];
                    parts.extend(arguments.map(Part::Source));
                    parts.push(Part::Text(String::from("])")));
                    rewrites.push(Rewrite {
                        span: call.span,
                        parts,
                    });
                }
            }
            AstKind::PrivateInExpression(expression) => {
                let key = private_key(expression.left.name.as_str())?;
                rewrites.push(Rewrite {
                    span: expression.span,
                    parts: vec![
                        Part::Text(String::from("Object.prototype.hasOwnProperty.call(")),
                        Part::Source(expression.right.span()),
                        Part::Text(format!(", {key})")),
                    ],
                });
            }
            AstKind::PrivateFieldExpression(field) => {
                let key = private_key(field.field.name.as_str())?;
                rewrites.push(Rewrite {
                    span: field.span,
                    parts: vec![
                        Part::Text(format!("{PRIVATE_BASE_PLACEHOLDER}(")),
                        Part::Source(field.object.span()),
                        Part::Text(format!(", {key})[{key}]")),
                    ],
                });
            }
            AstKind::StaticMemberExpression(_) | AstKind::ComputedMemberExpression(_) => {
                let Some(base) = rewrite.super_base else {
                    continue;
                };
                let key = match node.kind() {
                    AstKind::StaticMemberExpression(member) if member.object.is_super() => {
                        format!("{:?}", member.property.name.as_str())
                    }
                    AstKind::ComputedMemberExpression(member) if member.object.is_super() => {
                        slice(source, member.expression.span()).to_owned()
                    }
                    _ => continue,
                };
                rewrites.push(Rewrite::text(
                    span,
                    format!(
                        "{SUPER_GET_PLACEHOLDER}({base},{key},{})",
                        rewrite.receiver()
                    ),
                ));
            }
            AstKind::ThisExpression(_) => {
                if let Some(alias) = rewrite.this_alias
                    && shares_this(nodes, node_id, container)
                {
                    rewrites.push(Rewrite::text(span, alias.to_owned()));
                }
            }
            AstKind::NewTarget(_) => {
                if let Some(alias) = rewrite.new_target_alias
                    && shares_this(nodes, node_id, container)
                {
                    rewrites.push(Rewrite::text(span, alias.to_owned()));
                }
            }
            _ => {}
        }
    }
    Ok(rewrites)
}

fn argument_list(prefix: String, arguments: Option<Span>, suffix: String) -> Vec<Part> {
    let mut parts = vec![Part::Text(prefix)];
    parts.extend(arguments.map(Part::Source));
    parts.push(Part::Text(suffix));
    parts
}

/// The range covering a call's arguments, commas and all, or `None` when it has
/// none. Taken from the argument nodes rather than by searching for a bracket,
/// so a callee that itself contains brackets cannot mislead it.
fn call_arguments(call: &oxc_ast::ast::CallExpression<'_>) -> Option<Span> {
    let first = call.arguments.first()?;
    let last = call.arguments.last()?;
    Some(Span::new(first.span().start, last.span().end))
}

/// Whether a node observes the `this` of `container` rather than one of its own.
///
/// Arrow functions and blocks are transparent; anything that installs a
/// receiver — an ordinary function, a field initializer, a static block — is
/// not, and a `this` inside one must be left alone when the container's `this`
/// is being renamed.
fn shares_this(nodes: &oxc_semantic::AstNodes<'_>, node_id: NodeId, container: Span) -> bool {
    for ancestor in nodes.ancestor_ids(node_id) {
        let kind = nodes.kind(ancestor);
        let span = kind.span();
        if span.start < container.start || span.end > container.end {
            return true;
        }
        if matches!(
            kind,
            AstKind::Function(_)
                | AstKind::PropertyDefinition(_)
                | AstKind::AccessorProperty(_)
                | AstKind::StaticBlock(_)
        ) {
            return false;
        }
    }
    true
}

fn function_prefix(function: &Function<'_>) -> &'static str {
    match (function.r#async, function.generator) {
        (true, true) => "async function*",
        (true, false) => "async function",
        (false, true) => "function*",
        (false, false) => "function",
    }
}

/// A method rewritten into the standalone function that replaces it.
fn rewritten_method(
    source: &str,
    semantic: &Semantic<'_>,
    method: &MethodDefinition<'_>,
    rewrite: &BodyRewrite<'_>,
) -> Result<String, &'static str> {
    let function = &method.value;
    let body = function.body.as_ref().unwrap();
    let contents = rewritten(
        source,
        semantic,
        body.span,
        Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
        rewrite,
    )?;
    Ok(format!(
        "{}{}{{{contents}}}",
        function_prefix(function),
        slice(source, function.params.span)
    ))
}

fn super_base(class_name: &str, is_static: bool) -> String {
    if is_static {
        format!("Object.getPrototypeOf({class_name})")
    } else {
        format!("Object.getPrototypeOf({class_name}.prototype)")
    }
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

/// The `super()` call a derived constructor evaluates first, when the split
/// lowering can be used at all.
///
/// That lowering runs everything before the call with the raw `this` and
/// everything after it against the constructed instance, so it needs the call
/// to be reached unconditionally, exactly once, and at the top level of the
/// body. Two statement shapes qualify — an expression statement and a `return`
/// — and either may be a sequence whose head is the call, which is how
/// TypeScript writes parameter properties: `super(message), this.url = url;`.
struct LeadingSuper {
    /// The statement the template replaces wholesale.
    statement: Span,
    /// The call itself.
    call: Span,
    /// The call's arguments, if it has any.
    arguments: Option<Span>,
    /// What remains of the sequence the call headed, if it headed one.
    tail: Option<Span>,
    /// Whether the statement was a `return`, whose value the caller must keep.
    returns: bool,
}

fn leading_super(body: &FunctionBody<'_>) -> Option<LeadingSuper> {
    body.statements.iter().find_map(|statement| {
        let (expression, returns) = match statement {
            Statement::ExpressionStatement(statement) => (&statement.expression, false),
            Statement::ReturnStatement(statement) => (statement.argument.as_ref()?, true),
            _ => return None,
        };
        let (call, tail) = match expression {
            Expression::SequenceExpression(sequence) => {
                let (head, rest) = sequence.expressions.split_first()?;
                let tail = rest
                    .first()
                    .map(|first| Span::new(first.span().start, sequence.span.end));
                (head, tail)
            }
            expression => (expression, None),
        };
        let Expression::CallExpression(call) = call else {
            return None;
        };
        call.callee.is_super().then(|| LeadingSuper {
            statement: statement.span(),
            call: call.span,
            arguments: call_arguments(call),
            tail,
            returns,
        })
    })
}

/// Whether `leading` is the constructor's only `super(...)`, which is what the
/// split lowering needs before it may treat the rest of the body as code that
/// runs against a constructed instance.
///
/// One textual `super(` settles it without touching the node table, because
/// `leading` is already known to be a real call: the single occurrence has to
/// be that one. Only a body with several — including any in a comment or a
/// string — is worth the walk.
fn is_only_super_call(source: &str, semantic: &Semantic<'_>, body: Span, leading: Span) -> bool {
    let text = slice(source, body);
    let mut textual = 0;
    let mut rest = text;
    while let Some(index) = rest.find("super") {
        rest = &rest[index + "super".len()..];
        if rest.trim_start().starts_with('(') {
            textual += 1;
        }
    }
    if textual <= 1 {
        return true;
    }
    let nodes = semantic.nodes();
    !nodes.iter_enumerated().any(|(node_id, node)| {
        let AstKind::CallExpression(call) = node.kind() else {
            return false;
        };
        // A call inside a nested class belongs to that class, but one inside an
        // arrow is the constructor's own.
        call.callee.is_super()
            && call.span != leading
            && call.span.start >= body.start
            && call.span.end <= body.end
            && shares_this(nodes, node_id, body)
    })
}

#[expect(clippy::too_many_arguments)]
fn derived_constructor(
    source: &str,
    semantic: &Semantic<'_>,
    name: &str,
    super_name: &str,
    constructor: &MethodDefinition<'_>,
    instance_initializers: &str,
    private_keys: &FxHashMap<String, String>,
    reserved: &FxHashSet<String>,
) -> Result<String, &'static str> {
    let function = &constructor.value;
    let body = function.body.as_ref().unwrap();
    let base = super_base(name, false);
    let leading = leading_super(body)
        .filter(|leading| is_only_super_call(source, semantic, body.span, leading.call));
    let Some(leading) = leading else {
        return general_derived_constructor(
            source,
            semantic,
            name,
            super_name,
            constructor,
            instance_initializers,
            private_keys,
            &base,
            reserved,
        );
    };
    let this_alias = local_name("_this", reserved);
    let result_alias = local_name("_result", reserved);
    let new_target_alias = local_name("_newtarget", reserved);
    // `{before}` runs in the lowered constructor itself, so its `new.target` is
    // still the real one, but `{after}` runs inside a wrapper that has none.
    // One captured alias keeps both halves reading the same value.
    let captures_new_target = slice(source, body.span).contains("new.target");
    let rewrite = BodyRewrite {
        private_keys: Some(private_keys),
        super_base: Some(&base),
        new_target_alias: captures_new_target.then_some(new_target_alias.as_str()),
        ..BodyRewrite::default()
    };
    let params = slice(source, function.params.span);
    // Four ranges of one body, so the node table is walked once for all of them.
    let rewrites = body_rewrites(source, semantic, body.span, &rewrite)?;
    let emit = |span: Span| {
        let mut output = String::new();
        render(source, span, &rewrites, &mut output);
        output
    };
    let arguments = leading.arguments.map(emit).unwrap_or_default();
    let before = emit(Span::new(body.span.start + 1, leading.statement.start));
    let tail = match leading.tail.map(emit) {
        Some(tail) if leading.returns => format!("return ({tail});"),
        Some(tail) => format!("({tail});"),
        // A bare `return super(x)` returns the instance the call produced,
        // which is what the wrapper's receiver already is.
        None if leading.returns => String::from("return this;"),
        None => String::new(),
    };
    let after = emit(Span::new(
        leading.statement.end,
        body.span.end.saturating_sub(1),
    ));
    let new_target_capture = if captures_new_target {
        format!("var {new_target_alias}=new.target;")
    } else {
        String::new()
    };
    let new_target_argument = if captures_new_target {
        new_target_alias.clone()
    } else {
        String::from("new.target")
    };
    Ok(format!(
        "function {name}{params}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{new_target_capture}{before}var {this_alias}={CONSTRUCT_PLACEHOLDER}({super_name},[{arguments}],{new_target_argument}||{name});{}var {result_alias}=(function(){{{tail}{after}}}).apply({this_alias},arguments);{}return {this_alias}}}",
        initialize_instance(instance_initializers, &this_alias),
        possible_constructor_return(&result_alias)
    ))
}

/// Lowering for a derived constructor whose `super()` the split template cannot
/// place: conditional, repeated, nested in a block, or absent.
///
/// Instead of splitting the body around the call, the whole body moves into a
/// wrapper and `super(...)` becomes a call to a local that constructs the
/// instance and records it. That means the body no longer has a receiver of its
/// own, so `this` is renamed to the recorded instance throughout — the same
/// shape Babel emits, and the reason `this` before `super()` fails with a
/// `TypeError` rather than the spec's `ReferenceError`.
#[expect(clippy::too_many_arguments)]
fn general_derived_constructor(
    source: &str,
    semantic: &Semantic<'_>,
    name: &str,
    super_name: &str,
    constructor: &MethodDefinition<'_>,
    instance_initializers: &str,
    private_keys: &FxHashMap<String, String>,
    base: &str,
    reserved: &FxHashSet<String>,
) -> Result<String, &'static str> {
    let function = &constructor.value;
    let body = function.body.as_ref().unwrap();
    let this_alias = local_name("_this", reserved);
    let result_alias = local_name("_result", reserved);
    let new_target_alias = local_name("_newtarget", reserved);
    let super_alias = local_name("_super", reserved);
    let params = slice(source, function.params.span);
    let contents = rewritten(
        source,
        semantic,
        body.span,
        Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
        &BodyRewrite {
            private_keys: Some(private_keys),
            super_base: Some(base),
            super_call: Some(&super_alias),
            this_alias: Some(&this_alias),
            new_target_alias: Some(&new_target_alias),
        },
    )?;
    Ok(format!(
        "function {name}{params}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");var {this_alias},{new_target_alias}=new.target;function {super_alias}(){{{this_alias}={CONSTRUCT_PLACEHOLDER}({super_name},arguments,{new_target_alias}||{name});{}return {this_alias}}}var {result_alias}=(function(){{{contents}}}).apply(void 0,arguments);{}if({this_alias}===void 0)throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");return {this_alias}}}",
        initialize_instance(instance_initializers, &this_alias),
        possible_constructor_return(&result_alias)
    ))
}

/// The call that runs a derived class's instance field initializers against the
/// instance `super()` produced. A class with no fields has nothing to run.
fn initialize_instance(instance_initializers: &str, target: &str) -> String {
    if instance_initializers.is_empty() {
        return String::new();
    }
    format!("(function(){{{instance_initializers}}}).call({target});")
}

/// The guard a derived constructor applies to whatever its body returned. This
/// is `@babel/runtime`'s `possibleConstructorReturn` minus the branch that
/// returns the instance, which the callers emit themselves.
fn possible_constructor_return(result: &str) -> String {
    format!(
        "if({result}!==void 0){{if((typeof {result}===\"object\"&&{result}!==null)||typeof {result}===\"function\")return {result};throw new TypeError(\"Derived constructors may only return object or undefined\")}}"
    )
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
    let contents = rewritten(
        source,
        semantic,
        body.span,
        Span::new(body.span.start + 1, body.span.end.saturating_sub(1)),
        &BodyRewrite {
            private_keys: Some(private_keys),
            ..BodyRewrite::default()
        },
    )?;
    let params = slice(source, function.params.span);
    Ok(format!(
        "function {name}{params}{{if(!(this instanceof {name}))throw new TypeError(\"Cannot call a class as a function\");{instance_initializers}{contents}}}"
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

/// The methods that produce runtime code.
///
/// Only TypeScript declaration syntax — an overload signature, an `abstract`
/// member — gives a method no body, and the language prepass has erased both
/// before this runs. The filter stays because everything below dereferences the
/// body, and a panic is a worse way to learn that something slipped through.
fn emitted_methods<'a, 'c>(class: &'c Class<'a>) -> impl Iterator<Item = &'c MethodDefinition<'a>> {
    class.body.body.iter().filter_map(|element| match element {
        ClassElement::MethodDefinition(method) if method.value.body.is_some() => {
            Some(method.as_ref())
        }
        _ => None,
    })
}

fn contains_super(source: &str, method: &MethodDefinition<'_>) -> bool {
    let body = method.value.body.as_ref().unwrap();
    slice(source, body.span).contains("super")
}

/// A name for a binding local to one generated function, free of every name the
/// module itself binds.
///
/// Unlike [`reserve`] this does not consume the name. Constructor locals live
/// in their own function scope, so sibling classes can each call theirs `_this`
/// without the second one having to be `_this2`.
fn local_name(base: &str, reserved: &FxHashSet<String>) -> String {
    if !reserved.contains(base) {
        return base.to_owned();
    }
    for suffix in 2.. {
        let candidate = format!("{base}{suffix}");
        if !reserved.contains(&candidate) {
            return candidate;
        }
    }
    unreachable!()
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
