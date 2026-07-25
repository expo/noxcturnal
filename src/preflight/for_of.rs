#![allow(clippy::format_push_string)]

use oxc_ast::{
    AstKind,
    ast::{ForOfStatement, ForStatementLeft, Statement},
};
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use rustc_hash::FxHashSet;

use crate::edit::{EditCommand, EditKind, MappingPolicy};

pub(super) fn edits(
    source: &str,
    semantic: &Semantic<'_>,
) -> Result<Option<Vec<EditCommand>>, &'static str> {
    let nodes = semantic.nodes();
    let loops: FxHashSet<NodeId> = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| match node.kind() {
            AstKind::ForOfStatement(statement) if !statement.r#await => Some(id),
            _ => None,
        })
        .collect();
    let mut reserved: FxHashSet<String> = semantic
        .scoping()
        .symbol_names()
        .map(str::to_owned)
        .collect();
    let mut edits = Vec::new();
    for (id, node) in nodes.iter_enumerated() {
        let AstKind::ForOfStatement(statement) = node.kind() else {
            continue;
        };
        if statement.r#await
            || nodes
                .ancestor_ids(id)
                .any(|ancestor| loops.contains(&ancestor))
        {
            continue;
        }
        let labeled = match nodes.parent_kind(id) {
            AstKind::LabeledStatement(labeled) => Some(labeled),
            _ => None,
        };
        edits.push(lower(source, statement, labeled, &mut reserved));
    }
    Ok((!edits.is_empty()).then_some(edits))
}

fn lower(
    source: &str,
    statement: &ForOfStatement<'_>,
    labeled: Option<&oxc_ast::ast::LabeledStatement<'_>>,
    reserved: &mut FxHashSet<String>,
) -> EditCommand {
    let iterator = reserve("_iterator", reserved);
    let step = reserve("_step", reserved);
    let normal = reserve("_iteratorNormalCompletion", reserved);
    let failed = reserve("_didIteratorError", reserved);
    let error = reserve("_iteratorError", reserved);
    let caught = reserve("_iteratorError2", reserved);
    let right = slice(source, statement.right.span());
    let binding = match &statement.left {
        ForStatementLeft::VariableDeclaration(declaration) => {
            format!("{}={step}.value;", slice(source, declaration.span))
        }
        target => format!("{}={step}.value;", slice(source, target.span())),
    };
    let body = match &statement.body {
        Statement::BlockStatement(block) => {
            slice(source, Span::new(block.span.start + 1, block.span.end - 1))
        }
        body => slice(source, body.span()),
    };
    let mut content = format!("{{var {normal}=true,{failed}=false,{error};try{{");
    if let Some(labeled) = labeled {
        content.push_str(&format!("{}:", labeled.label.name));
    }
    content.push_str(&format!("for(var {iterator}=({right})[Symbol.iterator](),{step};!({normal}=({step}={iterator}.next()).done);{normal}=true){{{binding}{body}}}"));
    content.push_str(&format!(
        "}}catch({caught}){{{failed}=true;{error}={caught}}}finally{{"
    ));
    content.push_str(&format!(
        "try{{if(!{normal}&&{iterator}.return!=null){iterator}.return()}}"
    ));
    content.push_str(&format!("finally{{if({failed})throw {error}}}}}}}"));
    EditCommand {
        kind: EditKind::Replace,
        start: labeled.map_or(statement.span.start, |label| label.span.start),
        end: labeled.map_or(statement.span.end, |label| label.span.end),
        content: Some(content),
        parts: Vec::new(),
        destination: None,
        mapping: Some(MappingPolicy::AnchorBoundaries),
        order: None,
        names: None,
    }
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
