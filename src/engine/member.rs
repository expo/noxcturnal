use oxc_ast::{
    AstKind,
    ast::{Expression, IdentifierReference},
};
use oxc_span::GetSpan;
use rustc_hash::FxHashMap;

use crate::generated::event_schema::{field_ids, node_type_name};
use crate::protocol::manifest::CompiledManifest;

use super::{RETAIN_IDENTIFIERS, RETAIN_MODULE_FACTS};

pub(super) fn tracks_member_writes(
    manifest: Option<&CompiledManifest>,
    retention_capabilities: u32,
) -> bool {
    retention_capabilities & RETAIN_IDENTIFIERS != 0
        || manifest.is_some_and(|manifest| {
            manifest.retention_capabilities & RETAIN_MODULE_FACTS != 0
                || manifest
                    .merged_field_mask_by_type
                    .iter()
                    .enumerate()
                    .any(|(type_id, mask)| {
                        matches!(
                            node_type_name(type_id as u32),
                            Some(
                                "StaticMemberExpression"
                                    | "ComputedMemberExpression"
                                    | "PrivateFieldExpression"
                            )
                        ) && mask.wants(field_ids::WRITE)
                            || node_type_name(type_id as u32) == Some("Identifier")
                                && mask.wants(field_ids::MEMBER_WRITE)
                    })
        })
}

pub(crate) fn static_member_path(expression: &Expression<'_>) -> Option<String> {
    static_member_path_with(expression, None)
}

/// The dotted path of a static member chain, optionally with one more property
/// appended. The chain is written into a single buffer, so a chain of depth `n`
/// costs one allocation rather than one per level.
pub(crate) fn static_member_path_with(
    expression: &Expression<'_>,
    property: Option<&str>,
) -> Option<String> {
    let mut path = String::new();
    if !write_static_member_path(expression, &mut path) {
        return None;
    }
    if let Some(property) = property {
        path.push('.');
        write_component(&mut path, property);
    }
    Some(path)
}

fn member_expression<'a, 'b>(mut expression: &'b Expression<'a>) -> &'b Expression<'a> {
    while let Expression::ParenthesizedExpression(parenthesized) = expression {
        expression = &parenthesized.expression;
    }
    expression
}

fn write_component(path: &mut String, component: &str) {
    if !component.contains('.') && !component.contains('\\') {
        path.push_str(component);
        return;
    }
    for ch in component.chars() {
        if ch == '.' || ch == '\\' {
            path.push('\\');
        }
        path.push(ch);
    }
}

fn write_static_member_path(mut expression: &Expression<'_>, path: &mut String) -> bool {
    let mut properties = [""; 8];
    let mut depth = 0;
    let mut overflow = Vec::new();
    loop {
        let property = match member_expression(expression) {
            Expression::Identifier(identifier) => {
                path.push_str(&identifier.name);
                break;
            }
            Expression::StaticMemberExpression(member) => {
                expression = &member.object;
                member.property.name.as_str()
            }
            Expression::ComputedMemberExpression(member) => {
                let Expression::StringLiteral(property) = &member.expression else {
                    return false;
                };
                expression = &member.object;
                property.value.as_str()
            }
            _ => return false,
        };
        if depth < properties.len() {
            properties[depth] = property;
        } else {
            overflow.push(property);
        }
        depth += 1;
    }
    for property in overflow.into_iter().rev().chain(
        properties[..depth.min(properties.len())]
            .iter()
            .rev()
            .copied(),
    ) {
        path.push('.');
        write_component(path, property);
    }
    true
}

pub(crate) fn static_member_root<'a, 'b>(
    mut expression: &'b Expression<'a>,
) -> Option<&'b IdentifierReference<'a>> {
    loop {
        match expression {
            Expression::Identifier(identifier) => return Some(identifier),
            Expression::StaticMemberExpression(member) => expression = &member.object,
            Expression::ComputedMemberExpression(member)
                if matches!(member.expression, Expression::StringLiteral(_)) =>
            {
                expression = &member.object
            }
            _ => return None,
        }
    }
}

pub(crate) fn mutation_target_child(
    child: AstKind<'_>,
    parent: AstKind<'_>,
    parent_is_target: bool,
) -> bool {
    let span = child.span();
    match parent {
        AstKind::AssignmentExpression(expression) => expression.left.span() == span,
        AstKind::UpdateExpression(expression) => expression.argument.span() == span,
        AstKind::UnaryExpression(expression) => {
            expression.operator.as_str() == "delete" && expression.argument.span() == span
        }
        AstKind::ForInStatement(statement) => statement.left.span() == span,
        AstKind::ForOfStatement(statement) => statement.left.span() == span,
        AstKind::ParenthesizedExpression(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::TSAsExpression(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::TSSatisfiesExpression(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::TSNonNullExpression(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::TSTypeAssertion(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::ChainExpression(expression) => {
            parent_is_target && expression.expression.span() == span
        }
        AstKind::AssignmentTargetRest(rest) => parent_is_target && rest.target.span() == span,
        AstKind::AssignmentTargetWithDefault(default) => {
            parent_is_target && default.binding.span() == span
        }
        AstKind::AssignmentTargetPropertyProperty(property) => {
            parent_is_target && property.binding.span() == span
        }
        AstKind::ArrayAssignmentTarget(_) | AstKind::ObjectAssignmentTarget(_) => parent_is_target,
        _ => false,
    }
}

/// Carry a writable member chain only through its object side and transparent
/// wrappers. Computed keys and unrelated descendants never inherit the flag.
pub(crate) fn member_write_root_child(
    child: AstKind<'_>,
    parent: AstKind<'_>,
    parent_member_write: bool,
    parent_is_member_root: bool,
) -> bool {
    if !parent_member_write && !parent_is_member_root {
        return false;
    }
    let span = child.span();
    match parent {
        AstKind::StaticMemberExpression(expression) => expression.object.span() == span,
        AstKind::ComputedMemberExpression(expression) => expression.object.span() == span,
        AstKind::PrivateFieldExpression(expression) => expression.object.span() == span,
        AstKind::ParenthesizedExpression(expression) => expression.expression.span() == span,
        AstKind::TSAsExpression(expression) => expression.expression.span() == span,
        AstKind::TSSatisfiesExpression(expression) => expression.expression.span() == span,
        AstKind::TSNonNullExpression(expression) => expression.expression.span() == span,
        AstKind::TSTypeAssertion(expression) => expression.expression.span() == span,
        AstKind::ChainExpression(expression) => expression.expression.span() == span,
        _ => false,
    }
}

pub(super) struct MemberWriteStack<'a> {
    frames: Option<Vec<(AstKind<'a>, bool, bool)>>,
}

impl<'a> MemberWriteStack<'a> {
    pub(super) fn new(enabled: bool) -> Self {
        Self {
            frames: enabled.then(Vec::new),
        }
    }

    pub(super) fn enter(&mut self, kind: AstKind<'a>) -> (bool, bool) {
        let Some(frames) = self.frames.as_mut() else {
            return (false, false);
        };
        let member_write = frames.last().is_some_and(|(parent, parent_is_target, _)| {
            mutation_target_child(kind, *parent, *parent_is_target)
        });
        let member_root_write =
            frames
                .last()
                .is_some_and(|(parent, parent_member_write, parent_is_member_root)| {
                    member_write_root_child(
                        kind,
                        *parent,
                        *parent_member_write,
                        *parent_is_member_root,
                    )
                });
        frames.push((kind, member_write, member_root_write));
        (member_write, member_root_write)
    }

    pub(super) fn leave(&mut self) -> (bool, bool) {
        let Some(frames) = self.frames.as_mut() else {
            return (false, false);
        };
        let (_, member_write, member_root_write) = frames
            .pop()
            .expect("member-write traversal enter/leave balance");
        (member_write, member_root_write)
    }
}

#[derive(Default)]
pub(crate) struct MemberPathInterner {
    transitions: FxHashMap<(u32, u8), u32>,
    expressions: FxHashMap<(u32, u32, u8), Option<u32>>,
    expected: FxHashMap<(usize, usize), u32>,
}

impl MemberPathInterner {
    const ROOT: u32 = u32::MAX;

    /// Short chains need no interning allocations. Bound this walk so long or
    /// overlapping invalid prefixes still use the shared, linear-size cache.
    pub(crate) fn is_static(&mut self, kind: AstKind<'_>) -> bool {
        let mut object = match kind {
            AstKind::StaticMemberExpression(member) => &member.object,
            AstKind::ComputedMemberExpression(member)
                if matches!(member.expression, Expression::StringLiteral(_)) =>
            {
                &member.object
            }
            _ => return false,
        };
        for _ in 0..4 {
            object = match member_expression(object) {
                Expression::Identifier(_) => return true,
                Expression::StaticMemberExpression(member) => &member.object,
                Expression::ComputedMemberExpression(member)
                    if matches!(member.expression, Expression::StringLiteral(_)) =>
                {
                    &member.object
                }
                _ => return false,
            };
        }
        self.kind(kind).is_some()
    }

    fn bytes(&mut self, mut state: u32, bytes: &[u8]) -> u32 {
        for &byte in bytes {
            let key = (state, byte);
            state = if let Some(id) = self.transitions.get(&key) {
                *id
            } else {
                let id = self.transitions.len() as u32;
                self.transitions.insert(key, id);
                id
            };
        }
        state
    }

    fn component(&mut self, parent: u32, component: &str) -> u32 {
        let state = if parent == Self::ROOT {
            parent
        } else {
            self.bytes(parent, b".")
        };
        if !component.contains('.') && !component.contains('\\') {
            return self.bytes(state, component.as_bytes());
        }
        let mut state = state;
        for byte in component.bytes() {
            if byte == b'.' || byte == b'\\' {
                state = self.bytes(state, b"\\");
            }
            state = self.bytes(state, &[byte]);
        }
        state
    }

    fn expression(&mut self, mut expression: &Expression<'_>) -> Option<u32> {
        let mut pending = Vec::new();
        let mut state = loop {
            expression = member_expression(expression);
            let span = expression.span();
            let tag = match expression {
                Expression::Identifier(_) => 0,
                Expression::StaticMemberExpression(_) => 1,
                Expression::ComputedMemberExpression(_) => 2,
                _ => break None,
            };
            let key = (span.start, span.end, tag);
            if let Some(state) = self.expressions.get(&key) {
                break *state;
            }
            match expression {
                Expression::Identifier(identifier) => {
                    let state = self.component(Self::ROOT, &identifier.name);
                    self.expressions.insert(key, Some(state));
                    break Some(state);
                }
                Expression::StaticMemberExpression(member) => {
                    pending.push((key, member.property.name.as_str()));
                    expression = &member.object;
                }
                Expression::ComputedMemberExpression(member) => {
                    let Expression::StringLiteral(property) = &member.expression else {
                        self.expressions.insert(key, None);
                        break None;
                    };
                    pending.push((key, property.value.as_str()));
                    expression = &member.object;
                }
                _ => unreachable!(),
            }
        };
        for (key, property) in pending.into_iter().rev() {
            state = state.map(|parent| self.component(parent, property));
            self.expressions.insert(key, state);
        }
        state
    }

    pub(crate) fn kind(&mut self, kind: AstKind<'_>) -> Option<u32> {
        let (span, tag) = match kind {
            AstKind::StaticMemberExpression(member) => (member.span, 1),
            AstKind::ComputedMemberExpression(member) => (member.span, 2),
            _ => return None,
        };
        let cache_key = (span.start, span.end, tag);
        if let Some(state) = self.expressions.get(&cache_key) {
            return *state;
        }
        let state = match kind {
            AstKind::StaticMemberExpression(member) => self
                .expression(&member.object)
                .map(|parent| self.component(parent, &member.property.name)),
            AstKind::ComputedMemberExpression(member) => {
                let Expression::StringLiteral(property) = &member.expression else {
                    return None;
                };
                self.expression(&member.object)
                    .map(|parent| self.component(parent, &property.value))
            }
            _ => unreachable!(),
        };
        self.expressions.insert(cache_key, state);
        state
    }

    pub(crate) fn expected(&mut self, path: &str) -> u32 {
        // Compiled predicate strings remain at stable addresses for the lifetime
        // of this collector, so allocation identity is a copy-free cache key.
        let key = (path.as_ptr() as usize, path.len());
        if let Some(id) = self.expected.get(&key) {
            return *id;
        }
        let state = self.bytes(Self::ROOT, path.as_bytes());
        self.expected.insert(key, state);
        state
    }
}
