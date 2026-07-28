use oxc_ast::{
    AstKind,
    ast::{
        ArrowFunctionExpression, BindingPattern, FormalParameter, FormalParameters, Function,
        FunctionBody,
    },
};
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use oxc_syntax::symbol::SymbolFlags;
use rustc_hash::FxHashSet;

use crate::edit::{EditCommand, EditKind, MappingPolicy};
use crate::preflight::directive_prologue_insertion;

struct SymbolFact<'a> {
    span: Span,
    name: &'a str,
    flags: SymbolFlags,
}

/// Lower non-simple parameters on ordinary functions. Arrow functions require a
/// separate conversion because `arguments`, `this`, constructibility, and length
/// all interact; leave those on a typed boundary until that half of the pass runs.
pub(super) fn edits(
    source: &str,
    semantic: &Semantic<'_>,
) -> Result<Option<Vec<EditCommand>>, &'static str> {
    let nodes = semantic.nodes();
    let mut edits = Vec::new();
    let scoping = semantic.scoping();
    let mut symbols = scoping
        .symbol_ids()
        .map(|symbol_id| SymbolFact {
            span: scoping.symbol_span(symbol_id),
            name: scoping.symbol_name(symbol_id),
            flags: scoping.symbol_flags(symbol_id),
        })
        .collect::<Vec<_>>();
    symbols.sort_unstable_by_key(|symbol| symbol.span.start);
    let non_simple_arrows: FxHashSet<NodeId> = nodes
        .iter_enumerated()
        .filter_map(|(node_id, node)| match node.kind() {
            AstKind::ArrowFunctionExpression(arrow) if non_simple(&arrow.params).is_some() => {
                Some(node_id)
            }
            _ => None,
        })
        .collect();
    let lowered = |node_id: NodeId| match nodes.kind(node_id) {
        AstKind::Function(function) => function
            .body
            .is_some()
            .then(|| non_simple(&function.params).map(|_| function.params.span))
            .flatten(),
        AstKind::ArrowFunctionExpression(arrow) => (non_simple_arrows.contains(&node_id)
            && !nodes
                .ancestor_ids(node_id)
                .any(|ancestor| non_simple_arrows.contains(&ancestor)))
        .then_some(arrow.params.span),
        _ => None,
    };
    // Whether an enclosing function will have its parameter list rewritten
    // wholesale this round, with this node inside it.
    //
    // A function written inside a default value is in exactly that position, so
    // lowering it now would place edits inside a range that is about to be
    // replaced — an edit conflict, and the reason `useLinking.native.js` and its
    // two forks were rejected. Deferring costs nothing: `lower_parameter` copies
    // the initializer into the body prologue verbatim, and the next round finds
    // it there, outside any replaced range.
    let deferred = |node_id: NodeId, span: Span| {
        nodes.ancestor_ids(node_id).any(|ancestor| {
            lowered(ancestor).is_some_and(|parameters| {
                parameters.start <= span.start && span.end <= parameters.end
            })
        })
    };
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    for (node_id, node) in nodes.iter_enumerated() {
        if !matches!(
            node.kind(),
            AstKind::Function(_) | AstKind::ArrowFunctionExpression(_)
        ) {
            continue;
        }
        if deferred(node_id, node.kind().span()) {
            continue;
        }
        match node.kind() {
            AstKind::Function(function) => {
                if let Some(body) = &function.body {
                    lower_function(source, function, body, &symbols, &mut reserved, &mut edits)?;
                }
            }
            AstKind::ArrowFunctionExpression(arrow)
                if non_simple_arrows.contains(&node_id)
                    && !nodes
                        .ancestor_ids(node_id)
                        .any(|ancestor| non_simple_arrows.contains(&ancestor)) =>
            {
                lower_arrow(
                    source,
                    semantic,
                    node_id,
                    arrow,
                    &symbols,
                    &mut reserved,
                    &mut edits,
                )?;
            }
            _ => {}
        }
    }
    Ok((!edits.is_empty()).then_some(edits))
}

fn lower_arrow(
    source: &str,
    semantic: &Semantic<'_>,
    node_id: NodeId,
    arrow: &ArrowFunctionExpression<'_>,
    symbols: &[SymbolFact<'_>],
    reserved: &mut FxHashSet<String>,
    edits: &mut Vec<EditCommand>,
) -> Result<(), &'static str> {
    let boundary = non_simple(&arrow.params).unwrap();
    let param_bindings = parameter_binding_names(symbols, &arrow.params);
    let needs_wrapper =
        body_scope_requires_wrapper(source, symbols, &arrow.params, &arrow.body, &param_bindings);
    let nodes = semantic.nodes();
    let mut aliases = Vec::new();
    let mut this_alias = None;
    let mut arguments_alias = None;
    let mut new_target_alias = None;
    let shadows_arguments = param_bindings.contains("arguments");
    // Semantic node ids are allocated in preorder, so an arrow's descendants
    // form one contiguous range immediately after the arrow node. Stop at the
    // first node beyond its body instead of walking the whole file once for
    // `super` and again for lexical aliases. `belongs_to_arrow` still excludes
    // nodes inside nested ordinary functions, which introduce their own lexical
    // `this`, `arguments`, and `new.target`.
    for (candidate_id, node) in nodes
        .iter_enumerated()
        .skip(node_id.index() + 1)
        .take_while(|(_, node)| node.kind().span().start < arrow.body.span.end)
    {
        let span = node.kind().span();
        if span.start < arrow.body.span.start
            || span.end > arrow.body.span.end
            || !belongs_to_arrow(nodes, candidate_id, node_id)
        {
            continue;
        }
        match node.kind() {
            AstKind::Super(_) => {
                return Err("arrow-parameters-lexical-super-not-implemented");
            }
            AstKind::ThisExpression(_) => {
                let alias = this_alias.get_or_insert_with(|| reserve_name("_this", reserved));
                aliases.push(replace(
                    span,
                    alias.clone(),
                    MappingPolicy::AnchorBoundaries,
                ));
            }
            AstKind::IdentifierReference(identifier)
                if identifier.name == "arguments" && !shadows_arguments =>
            {
                let alias =
                    arguments_alias.get_or_insert_with(|| reserve_name("_arguments", reserved));
                aliases.push(replace(
                    span,
                    alias.clone(),
                    MappingPolicy::AnchorBoundaries,
                ));
            }
            AstKind::NewTarget(_) => {
                let alias =
                    new_target_alias.get_or_insert_with(|| reserve_name("_newtarget", reserved));
                aliases.push(replace(
                    span,
                    alias.clone(),
                    MappingPolicy::AnchorBoundaries,
                ));
            }
            _ => {}
        }
    }

    let kept = arrow.params.items[..boundary]
        .iter()
        .map(|parameter| slice(source, parameter.pattern.span()))
        .collect::<Vec<_>>()
        .join(",");
    let prefix = if arrow.r#async {
        "async function"
    } else {
        "function"
    };
    edits.push(replace(
        Span::new(arrow.span.start, arrow.params.span.start),
        prefix.to_owned(),
        MappingPolicy::AnchorStart,
    ));
    edits.push(replace(
        arrow.params.span,
        format!("({kept})"),
        MappingPolicy::AnchorBoundaries,
    ));
    edits.push(replace(
        Span::new(arrow.params.span.end, arrow.body.span.start),
        String::new(),
        MappingPolicy::Sourceless,
    ));

    let mut prologue = String::new();
    for (index, parameter) in arrow.params.items.iter().enumerate().skip(boundary) {
        prologue.push_str(&lower_parameter(source, parameter, index));
    }
    if let Some(rest) = &arrow.params.rest {
        let index = arrow.params.items.len();
        let pattern = slice(source, rest.rest.argument.span());
        prologue.push_str(&lower_rest(pattern, index, reserved));
    }

    // Set when the capture has to travel with the expression rather than being
    // hoisted to a statement; see below.
    let mut captured_in_place = None;
    if this_alias.is_some() || arguments_alias.is_some() || new_target_alias.is_some() {
        let declarations = format!(
            "var {};",
            [
                this_alias.as_ref().map(|name| format!("{name}=this")),
                arguments_alias.as_ref().map(|name| format!(
                    "{name}=typeof arguments===\"undefined\"?void 0:arguments"
                )),
                new_target_alias
                    .as_ref()
                    .map(|name| format!("{name}=new.target")),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>()
            .join(",")
        );
        match statement_insertion(source, nodes, node_id) {
            Some(insertion) => edits.push(insert(insertion, declarations)),
            None => captured_in_place = Some(declarations),
        }
    }
    edits.append(&mut aliases);

    if needs_wrapper {
        let content_start = arrow.body.span.start + 1;
        let content_end = arrow.body.span.end - 1;
        edits.push(insert_kind(
            EditKind::AppendLeft,
            content_start,
            format!(
                "{prologue}return {}function(){{",
                if arrow.r#async { "async " } else { "" }
            ),
        ));
        edits.push(EditCommand {
            kind: EditKind::Move,
            start: content_start,
            end: content_end,
            content: None,
            parts: Vec::new(),
            destination: Some(content_start),
            mapping: None,
            order: None,
            names: None,
        });
        edits.push(insert_kind(
            EditKind::AppendRight,
            content_start,
            "}.apply(this,arguments);".to_owned(),
        ));
    } else if arrow.expression {
        edits.push(insert(
            arrow.body.span.start,
            format!("{{{prologue}return "),
        ));
        edits.push(insert(arrow.body.span.end, ";}".to_owned()));
    } else {
        let (insertion, separator) =
            directive_prologue_insertion(source, &arrow.body.directives, arrow.body.span.start + 1);
        edits.push(insert(insertion, format!("{separator}{prologue}")));
    }
    if let Some(declarations) = captured_in_place {
        // Nothing enclosing this arrow is both a statement and part of the same
        // `this` scope — a class field initializer, or another arrow's concise
        // body. An arrow IIFE is transparent to `this`, `arguments`, and
        // `new.target` and is itself an expression, so it holds the capture
        // wherever the original arrow stood. This mirrors what Babel emits for
        // a class field whose initializer needs `arguments`.
        //
        // Pushed last so the closer renders outside every edit the branches
        // above placed at the arrow's end.
        edits.push(insert_kind(
            EditKind::AppendLeft,
            arrow.span.start,
            format!("(()=>{{{declarations}return "),
        ));
        edits.push(insert(arrow.span.end, ";})()".to_owned()));
    }
    Ok(())
}

fn belongs_to_arrow(nodes: &oxc_semantic::AstNodes<'_>, node_id: NodeId, arrow_id: NodeId) -> bool {
    for ancestor in nodes.ancestor_ids(node_id) {
        if ancestor == arrow_id {
            return true;
        }
        if matches!(nodes.kind(ancestor), AstKind::Function(_)) {
            return false;
        }
    }
    false
}

/// Offset of the statement enclosing `node_id`, when a `var` declaration hoisted
/// there would still see the same `this`, `arguments`, and `new.target` as the
/// arrow being lowered.
///
/// Arrows are transparent to all three, so the walk may cross them, but two
/// containers stop it:
///
/// * A class field initializer or accessor property binds its own `this` — the
///   instance under construction — so a declaration hoisted out of the class
///   would capture the enclosing module's `this` instead.
/// * An arrow written with a concise body parses to a `FunctionBody` like any
///   other, but the source has no braces to hold a statement.
///
/// `None` means the caller has to keep the capture inside the expression.
fn statement_insertion(
    source: &str,
    nodes: &oxc_semantic::AstNodes<'_>,
    node_id: NodeId,
) -> Option<u32> {
    let mut root = node_id;
    for ancestor in nodes.ancestor_ids(node_id) {
        match nodes.kind(ancestor) {
            AstKind::FunctionBody(body) => {
                if source.as_bytes().get(body.span.start as usize) != Some(&b'{') {
                    return None;
                }
                return Some(nodes.kind(root).span().start);
            }
            AstKind::Program(_)
            | AstKind::BlockStatement(_)
            | AstKind::StaticBlock(_)
            | AstKind::SwitchCase(_) => return Some(nodes.kind(root).span().start),
            AstKind::PropertyDefinition(_) | AstKind::AccessorProperty(_) => return None,
            _ => {}
        }
        root = ancestor;
    }
    None
}

fn reserve_name(base: &str, used: &mut FxHashSet<String>) -> String {
    if used.insert(base.to_owned()) {
        return base.to_owned();
    }
    let mut suffix = used.len().max(2);
    loop {
        let name = format!("{base}{suffix}");
        if used.insert(name.clone()) {
            return name;
        }
        suffix += 1;
    }
}

fn lower_function(
    source: &str,
    function: &Function<'_>,
    body: &FunctionBody<'_>,
    symbols: &[SymbolFact<'_>],
    reserved: &mut FxHashSet<String>,
    edits: &mut Vec<EditCommand>,
) -> Result<(), &'static str> {
    let Some(boundary) = non_simple(&function.params) else {
        return Ok(());
    };
    let param_bindings = parameter_binding_names(symbols, &function.params);
    let needs_wrapper =
        body_scope_requires_wrapper(source, symbols, &function.params, body, &param_bindings);

    let kept = function.params.items[..boundary]
        .iter()
        .map(|parameter| slice(source, parameter.pattern.span()))
        .collect::<Vec<_>>()
        .join(",");
    edits.push(replace(
        function.params.span,
        format!("({kept})"),
        MappingPolicy::AnchorBoundaries,
    ));

    let mut prologue = String::new();
    for (index, parameter) in function.params.items.iter().enumerate().skip(boundary) {
        prologue.push_str(&lower_parameter(source, parameter, index));
    }
    if let Some(rest) = &function.params.rest {
        let index = function.params.items.len();
        let pattern = slice(source, rest.rest.argument.span());
        prologue.push_str(&lower_rest(pattern, index, reserved));
    }
    if needs_wrapper {
        let content_start = body.span.start + 1;
        let content_end = body.span.end - 1;
        let helper = match (function.r#async, function.generator) {
            (false, false) => "return function(){",
            (true, false) => "return async function(){",
            (false, true) => "return yield* function*(){",
            (true, true) => "return yield* async function*(){",
        };
        edits.push(insert_kind(
            EditKind::AppendLeft,
            content_start,
            format!("{prologue}{helper}"),
        ));
        edits.push(EditCommand {
            kind: EditKind::Move,
            start: content_start,
            end: content_end,
            content: None,
            parts: Vec::new(),
            destination: Some(content_start),
            mapping: None,
            order: None,
            names: None,
        });
        edits.push(insert_kind(
            EditKind::AppendRight,
            content_start,
            "}.apply(this,arguments);".to_owned(),
        ));
        return Ok(());
    }
    let (insertion, separator) =
        directive_prologue_insertion(source, &body.directives, body.span.start + 1);
    edits.push(insert(insertion, format!("{separator}{prologue}")));
    Ok(())
}

fn lower_rest(pattern: &str, index: usize, reserved: &mut FxHashSet<String>) -> String {
    let length = reserve_name("_len", reserved);
    let key = reserve_name("_key", reserved);
    format!(
        "for(var {length}=arguments.length,{pattern}=new Array({length}>{index}?{length}-{index}:0),{key}={index};{key}<{length};{key}++){{{pattern}[{key}-{index}]=arguments[{key}];}}"
    )
}

fn non_simple(params: &FormalParameters<'_>) -> Option<usize> {
    params
        .items
        .iter()
        .position(|parameter| {
            parameter.initializer.is_some()
                || !matches!(parameter.pattern, BindingPattern::BindingIdentifier(_))
        })
        .or_else(|| params.rest.as_ref().map(|_| params.items.len()))
}

fn lower_parameter(source: &str, parameter: &FormalParameter<'_>, index: usize) -> String {
    let pattern = slice(source, parameter.pattern.span());
    match &parameter.initializer {
        Some(initializer) => {
            let value = slice(source, initializer.span());
            format!(
                "let {pattern}=arguments.length>{index}&&arguments[{index}]!==void 0?arguments[{index}]:{value};"
            )
        }
        None => {
            format!("let {pattern}=arguments.length>{index}?arguments[{index}]:void 0;")
        }
    }
}

fn parameter_binding_names(
    symbols: &[SymbolFact<'_>],
    params: &FormalParameters<'_>,
) -> FxHashSet<String> {
    symbols_in(symbols, params.span)
        .filter(|symbol| {
            symbol.span.end <= params.span.end && symbol.flags.intersects(SymbolFlags::Variable)
        })
        .map(|symbol| symbol.name.to_owned())
        .collect()
}

fn body_scope_requires_wrapper(
    source: &str,
    symbols: &[SymbolFact<'_>],
    params: &FormalParameters<'_>,
    body: &FunctionBody<'_>,
    param_bindings: &FxHashSet<String>,
) -> bool {
    let body_names: FxHashSet<&str> = symbols_in(symbols, body.span)
        .filter(|symbol| symbol.span.start > body.span.start && symbol.span.end < body.span.end)
        .map(|symbol| symbol.name)
        .collect();
    if param_bindings
        .iter()
        .any(|name| body_names.contains(name.as_str()))
    {
        return true;
    }
    params.items.iter().any(|parameter| {
        parameter.initializer.as_ref().is_some_and(|initializer| {
            let initializer = slice(source, initializer.span());
            body_names.iter().any(|name| {
                initializer
                    .split(|character: char| !character.is_alphanumeric() && character != '_')
                    .any(|token| token == *name)
            })
        })
    })
}

fn symbols_in<'a>(
    symbols: &'a [SymbolFact<'a>],
    span: Span,
) -> impl Iterator<Item = &'a SymbolFact<'a>> {
    let start = symbols.partition_point(|symbol| symbol.span.start < span.start);
    symbols[start..]
        .iter()
        .take_while(move |symbol| symbol.span.start <= span.end)
}

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
}

fn replace(span: Span, content: String, mapping: MappingPolicy) -> EditCommand {
    EditCommand {
        kind: EditKind::Replace,
        start: span.start,
        end: span.end,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(mapping),
        order: None,
        names: None,
    }
}

fn insert(position: u32, content: String) -> EditCommand {
    insert_kind(EditKind::AppendRight, position, content)
}

fn insert_kind(kind: EditKind, position: u32, content: String) -> EditCommand {
    EditCommand {
        kind,
        start: position,
        end: position,
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        // The trailing boundary resets generated-column deltas before the
        // original function body resumes on the same line.
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
}
