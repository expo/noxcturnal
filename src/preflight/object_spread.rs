use oxc_ast::{
    AstKind,
    ast::{ObjectExpression, ObjectPropertyKind},
};
use oxc_semantic::{NodeId, Semantic};
use oxc_span::{GetSpan, Span};
use rustc_hash::FxHashSet;

use crate::edit::{EditCommand, EditKind, MappingPolicy};

pub(super) fn edits(source: &str, semantic: &Semantic<'_>) -> Option<Vec<EditCommand>> {
    let nodes = semantic.nodes();
    let candidates: FxHashSet<NodeId> = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| match node.kind() {
            AstKind::ObjectExpression(object)
                if object
                    .properties
                    .iter()
                    .any(|property| matches!(property, ObjectPropertyKind::SpreadProperty(_))) =>
            {
                Some(id)
            }
            _ => None,
        })
        .collect();
    let edits = nodes
        .iter_enumerated()
        .filter_map(|(id, node)| {
            let AstKind::ObjectExpression(object) = node.kind() else {
                return None;
            };
            if !candidates.contains(&id)
                || nodes
                    .ancestor_ids(id)
                    .any(|ancestor| candidates.contains(&ancestor))
            {
                return None;
            }
            Some(replace(object.span, lower(source, object)))
        })
        .collect::<Vec<_>>();
    (!edits.is_empty()).then_some(edits)
}

fn lower(source: &str, object: &ObjectExpression<'_>) -> String {
    let mut arguments = Vec::new();
    let mut properties = Vec::new();
    let flush = |properties: &mut Vec<&str>, arguments: &mut Vec<String>| {
        if !properties.is_empty() {
            arguments.push(format!("{{{}}}", properties.join(",")));
            properties.clear();
        }
    };
    for property in &object.properties {
        match property {
            ObjectPropertyKind::ObjectProperty(property) => {
                properties.push(slice(source, property.span));
            }
            ObjectPropertyKind::SpreadProperty(spread) => {
                flush(&mut properties, &mut arguments);
                arguments.push(slice(source, spread.argument.span()).to_owned());
            }
        }
    }
    flush(&mut properties, &mut arguments);
    if matches!(
        object.properties.first(),
        Some(ObjectPropertyKind::SpreadProperty(_))
    ) {
        arguments.insert(0, "{}".to_owned());
    }
    format!("Object.assign({})", arguments.join(","))
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

fn slice(source: &str, span: Span) -> &str {
    &source[span.start as usize..span.end as usize]
}
