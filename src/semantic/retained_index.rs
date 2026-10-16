use napi::bindgen_prelude::Buffer;
use napi_derive::napi;
use oxc_ast::AstKind;
use oxc_semantic::{AstNodes, Scoping};
use oxc_span::GetSpan;
use rustc_hash::FxHashMap;
use std::cell::OnceCell;
#[cfg(test)]
use std::sync::atomic::{AtomicUsize, Ordering};

use super::value_transport::{TransportConstant, constant};
use crate::generated::event_schema::{
    child_role_parent_has_roles, child_role_projects_formal_parameters, node_type_id,
    node_type_name,
};
use crate::protocol::manifest::ChildRoleMask;

pub const ABSENT_ID: u32 = u32::MAX;

#[cfg(test)]
static CAPTURE_RECORDS_MATERIALIZED: AtomicUsize = AtomicUsize::new(0);

/// Compact, session-owned structural facts keyed by Oxc node ID.
///
/// Scope ancestry is stored once per scope by the owning session. Parent type is
/// derived through `type_ids[parent_id]`; neither fact is duplicated per node.
#[derive(Default)]
pub struct RetainedIndex {
    type_ids: Vec<u32>,
    starts: Vec<u32>,
    ends: Vec<u32>,
    parent_ids: Vec<u32>,
    scope_ids: Vec<u32>,
    traversal_records: Vec<u32>,
    traversal_ranges: OnceCell<TraversalRanges>,
    traversal_sequences: OnceCell<TraversalSequences>,
    pending_child_edges: Option<Vec<ChildEdge>>,
    child_offsets: Option<Vec<u32>>,
    child_edges: Vec<ChildEdge>,
    child_role_mask_by_parent_type: Vec<ChildRoleMask>,
    names: Vec<Rc<str>>,
    name_ids: FxHashMap<Rc<str>, u32>,
    bindings: FxHashMap<(u32, u32), BindingRecord>,
    redeclarations: Vec<Vec<u32>>,
    globals: FxHashMap<u32, Vec<SemanticReference>>,
    constants: Option<Vec<Option<TransportConstant>>>,
    calls: Vec<CallRecord>,
    scalar_field_ranges: Option<Vec<(u32, u32)>>,
    scalar_fields: Vec<RetainedField>,
    scalar_strings: Vec<String>,
    comments: Option<Vec<RetainedComment>>,
    scope_metadata: Vec<[u32; 5]>,
    rename_kinds: FxHashMap<u32, u32>,
    exported_declarations: Vec<(u32, u32)>,
    rename_exports: OnceCell<Box<FxHashMap<u32, Vec<u32>>>>,
}

#[derive(Default)]
struct TraversalSequences {
    blocks: Vec<TraversalSequenceBlock>,
    exits_by_type: FxHashMap<u32, Vec<u32>>,
}

struct TraversalSequenceBlock {
    before: u32,
    enters: u32,
}

const TRAVERSAL_BLOCK_SIZE: usize = u32::BITS as usize;

/// A tape block cannot contain a matching span if every start is too early or
/// every end is too late. Aggregate those bounds in a tree so source order and
/// unique spans are not required. Leaves summarize small, contiguous blocks;
/// their exact records are inspected only when the aggregate cannot rule them out.
struct TraversalRanges {
    bounds: Vec<(u32, u32)>,
    leaves: usize,
}

impl TraversalRanges {
    fn new(index: &RetainedIndex) -> Self {
        let leaves = index
            .traversal_records
            .len()
            .div_ceil(TRAVERSAL_BLOCK_SIZE)
            .next_power_of_two();
        let mut bounds = vec![(0, u32::MAX); leaves * 2];
        for (block, records) in index
            .traversal_records
            .chunks(TRAVERSAL_BLOCK_SIZE)
            .enumerate()
        {
            let bound = &mut bounds[leaves + block];
            for &record in records {
                let id = record & 0x7fff_ffff;
                bound.0 = bound.0.max(index.start(id));
                bound.1 = bound.1.min(index.end(id));
            }
        }
        for node in (1..leaves).rev() {
            bounds[node] = (
                bounds[node * 2].0.max(bounds[node * 2 + 1].0),
                bounds[node * 2].1.min(bounds[node * 2 + 1].1),
            );
        }
        Self { bounds, leaves }
    }

    fn find<const REVERSE: bool>(
        &self,
        index: &RetainedIndex,
        node: usize,
        start: u32,
        end: u32,
    ) -> Option<usize> {
        let (max_start, min_end) = self.bounds[node];
        if max_start < start || min_end > end {
            return None;
        }
        if node < self.leaves {
            let first = node * 2 + usize::from(REVERSE);
            let second = node * 2 + usize::from(!REVERSE);
            return self
                .find::<REVERSE>(index, first, start, end)
                .or_else(|| self.find::<REVERSE>(index, second, start, end));
        }
        let first = (node - self.leaves) * TRAVERSAL_BLOCK_SIZE;
        let last = (first + TRAVERSAL_BLOCK_SIZE).min(index.traversal_records.len());
        let matches = |&offset: &usize| {
            let id = index.traversal_records[offset] & 0x7fff_ffff;
            index.start(id) >= start && index.end(id) <= end
        };
        if REVERSE {
            (first..last).rev().find(matches)
        } else {
            (first..last).find(matches)
        }
    }
}

#[derive(Clone, Copy)]
struct ChildEdge {
    parent_id: u32,
    child_id: u32,
    role_id: u32,
}

pub(crate) struct RetainedComment {
    pub(crate) block: bool,
    pub(crate) value: String,
    pub(crate) start: u32,
    pub(crate) end: u32,
}

#[derive(Clone)]
struct SemanticReference {
    node_id_and_flags: u32,
    scope_id: u32,
}

const REFERENCE_READ: u32 = 1 << 31;
const REFERENCE_WRITE: u32 = 1 << 30;
const REFERENCE_MEMBER_WRITE: u32 = 1 << 29;
const REFERENCE_NODE_MASK: u32 = REFERENCE_MEMBER_WRITE - 1;

impl SemanticReference {
    fn new(node_id: u32, scope_id: u32, read: bool, write: bool, member_write: bool) -> Self {
        debug_assert_eq!(node_id & !REFERENCE_NODE_MASK, 0);
        Self {
            node_id_and_flags: node_id
                | if read { REFERENCE_READ } else { 0 }
                | if write { REFERENCE_WRITE } else { 0 }
                | if member_write {
                    REFERENCE_MEMBER_WRITE
                } else {
                    0
                },
            scope_id,
        }
    }

    fn node_id(&self) -> u32 {
        self.node_id_and_flags & REFERENCE_NODE_MASK
    }

    fn read(&self) -> bool {
        self.node_id_and_flags & REFERENCE_READ != 0
    }

    fn write(&self) -> bool {
        self.node_id_and_flags & REFERENCE_WRITE != 0
    }

    fn member_write(&self) -> bool {
        self.node_id_and_flags & REFERENCE_MEMBER_WRITE != 0
    }
}

struct BindingRecord {
    // Latest declaration and optional side-table index, both using ABSENT_ID.
    declaration_id: u32,
    redeclarations_id: u32,
    references: Vec<SemanticReference>,
}

struct CallRecord {
    node_id: u32,
    callee_name_id_and_global: u32,
    static_argument_id: u32,
}

const CALL_GLOBAL: u32 = 1 << 31;
const CALL_NAME_MASK: u32 = CALL_GLOBAL - 1;

impl CallRecord {
    fn callee_name_id(&self) -> u32 {
        self.callee_name_id_and_global & CALL_NAME_MASK
    }

    fn callee_global(&self) -> bool {
        self.callee_name_id_and_global & CALL_GLOBAL != 0
    }
}

pub(crate) struct RetainedField {
    pub(crate) key_id: u32,
    pub(crate) value: u32,
}

#[derive(Clone, Copy)]
pub(crate) enum RetainedFieldValue {
    Packed(u32),
    String(u32),
}

#[napi(object)]
pub struct NativeSemanticReference {
    pub id: u32,
    pub start: u32,
    pub end: u32,
    pub scope_id: u32,
    pub parent_id: Option<u32>,
    pub parent_type: Option<String>,
    pub parent_start: Option<u32>,
    pub read: bool,
    pub write: bool,
    pub member_write: bool,
}

#[napi(object)]
pub struct NativeBindingFact {
    pub name: String,
    pub scope_id: u32,
    pub declaration_id: Option<u32>,
    pub declaration_start: Option<u32>,
    pub declaration_end: Option<u32>,
    pub declaration_parent_id: Option<u32>,
    pub references: Vec<NativeSemanticReference>,
}

#[napi(object)]
pub struct NativeRenameTarget {
    pub start: u32,
    pub end: u32,
    pub kind: u32,
}
#[napi(object)]
pub struct NativeRenameExport {
    pub start: u32,
    pub end: u32,
}
#[napi(object)]
pub struct NativeRenamePlan {
    pub targets: Vec<NativeRenameTarget>,
    pub exports: Vec<NativeRenameExport>,
}

#[napi(object)]
pub struct NativeCaptureReference {
    pub id: u32,
    pub start: u32,
    pub end: u32,
    pub scope_id: u32,
    pub binding_scope_id: u32,
    pub parent_id: Option<u32>,
    pub parent_type: Option<String>,
    pub name: String,
    pub read: bool,
    pub write: bool,
}

#[napi(object)]
pub struct NativeCaptureGroup {
    pub function_id: u32,
    pub references: Vec<NativeCaptureReference>,
}

#[napi(object)]
pub struct NativeConstantFact {
    pub id: u32,
    pub kind: String,
    pub value: String,
}

#[napi(object)]
pub struct NativeCallFact {
    pub id: u32,
    pub start: u32,
    pub end: u32,
    pub scope_id: u32,
    pub callee_name: String,
    pub callee_global: bool,
    pub static_argument: Option<String>,
}

impl RetainedIndex {
    pub(crate) fn set_comments(&mut self, comments: Vec<RetainedComment>) {
        self.comments = Some(comments);
    }

    pub(crate) fn inner_comments(
        &self,
        start: u32,
        end: u32,
    ) -> impl Iterator<Item = &RetainedComment> {
        self.comments
            .as_deref()
            .unwrap_or_default()
            .iter()
            .skip_while(move |comment| comment.start < start)
            .take_while(move |comment| comment.end <= end)
    }
    pub fn has_scalar_fields(&self) -> bool {
        self.scalar_field_ranges.is_some()
    }

    pub fn with_node_count(
        node_count: usize,
        child_role_mask_by_parent_type: Option<&[ChildRoleMask]>,
        retain_constants: bool,
        retain_scalar_fields: bool,
    ) -> Self {
        Self {
            type_ids: vec![ABSENT_ID; node_count],
            starts: vec![0; node_count],
            ends: vec![0; node_count],
            parent_ids: vec![ABSENT_ID; node_count],
            scope_ids: vec![0; node_count],
            traversal_records: Vec::new(),
            traversal_ranges: OnceCell::new(),
            traversal_sequences: OnceCell::new(),
            pending_child_edges: child_role_mask_by_parent_type.map(|_| Vec::new()),
            child_offsets: None,
            child_edges: Vec::new(),
            child_role_mask_by_parent_type: child_role_mask_by_parent_type
                .map(<[ChildRoleMask]>::to_vec)
                .unwrap_or_default(),
            names: Vec::new(),
            name_ids: FxHashMap::default(),
            bindings: FxHashMap::default(),
            redeclarations: Vec::new(),
            globals: FxHashMap::default(),
            constants: retain_constants.then(|| vec![None; node_count]),
            calls: Vec::new(),
            scalar_field_ranges: retain_scalar_fields.then(|| vec![(0, 0); node_count]),
            scalar_fields: Vec::new(),
            scalar_strings: Vec::new(),
            comments: None,
            scope_metadata: Vec::new(),
            rename_kinds: FxHashMap::default(),
            exported_declarations: Vec::new(),
            rename_exports: OnceCell::new(),
        }
    }

    pub fn record_semantics(
        &mut self,
        kind: AstKind<'_>,
        scoping: &Scoping,
        node_id: u32,
        node_scope_id: u32,
        retain_identifiers: bool,
        member_write: bool,
    ) {
        self.record_constant(kind, node_id);
        if !retain_identifiers {
            return;
        }
        match kind {
            AstKind::BindingIdentifier(identifier) => {
                let name_id = self.intern_name(identifier.name.as_str());
                let scope_id = identifier
                    .symbol_id
                    .get()
                    .map_or(node_scope_id, |symbol_id| {
                        scoping.symbol_scope_id(symbol_id).index() as u32
                    });
                let binding =
                    self.bindings
                        .entry((scope_id, name_id))
                        .or_insert_with(|| BindingRecord {
                            declaration_id: ABSENT_ID,
                            redeclarations_id: ABSENT_ID,
                            references: Vec::new(),
                        });
                if binding.declaration_id != ABSENT_ID {
                    if binding.redeclarations_id == ABSENT_ID {
                        binding.redeclarations_id = self.redeclarations.len() as u32;
                        self.redeclarations.push(Vec::new());
                    }
                    self.redeclarations[binding.redeclarations_id as usize]
                        .push(binding.declaration_id);
                }
                binding.declaration_id = node_id;
            }
            AstKind::IdentifierReference(identifier) => {
                let Some(reference_id) = identifier.reference_id.get() else {
                    return;
                };
                let reference = scoping.get_reference(reference_id);
                let semantic_reference = SemanticReference::new(
                    node_id,
                    node_scope_id,
                    reference.is_read(),
                    reference.is_write(),
                    member_write,
                );
                let name_id = self.intern_name(identifier.name.as_str());
                if let Some(symbol_id) = reference.symbol_id() {
                    let binding_scope_id = scoping.symbol_scope_id(symbol_id).index() as u32;
                    self.bindings
                        .entry((binding_scope_id, name_id))
                        .or_insert_with(|| BindingRecord {
                            declaration_id: ABSENT_ID,
                            redeclarations_id: ABSENT_ID,
                            references: Vec::new(),
                        })
                        .references
                        .push(semantic_reference);
                } else {
                    self.globals
                        .entry(name_id)
                        .or_default()
                        .push(semantic_reference);
                }
            }
            _ => {}
        }
    }

    pub fn record_rename_roles(&mut self, kind: AstKind<'_>, nodes: &AstNodes<'_>, scope_id: u32) {
        if let AstKind::ExportNamedDeclaration(export) = kind {
            if export.declaration.is_some() {
                self.exported_declarations
                    .push((kind.node_id().index() as u32, scope_id));
            }
            return;
        }
        if !matches!(
            kind,
            AstKind::BindingIdentifier(_) | AstKind::IdentifierReference(_)
        ) {
            return;
        }
        let mut parent = nodes.parent_kind(kind.node_id());
        if matches!(parent, AstKind::AssignmentPattern(_)) {
            parent = nodes.parent_kind(parent.node_id());
        }
        let role = match parent {
            AstKind::BindingProperty(property)
                if property.shorthand && property.key.span().start == kind.span().start =>
            {
                1
            }
            AstKind::ObjectProperty(property) if property.shorthand => 1,
            AstKind::AssignmentTargetPropertyIdentifier(property)
                if property.binding.span.start == kind.span().start =>
            {
                1
            }
            AstKind::ImportSpecifier(specifier)
                if specifier.imported.span() == specifier.local.span =>
            {
                2
            }
            AstKind::ExportSpecifier(specifier)
                if specifier.local.span() == specifier.exported.span() =>
            {
                3
            }
            _ => 0,
        };
        if role != 0 {
            self.rename_kinds
                .insert(kind.node_id().index() as u32, role);
        }
    }

    fn binding_declarations<'a>(
        &'a self,
        binding: &'a BindingRecord,
    ) -> impl Iterator<Item = u32> + 'a {
        // The representative stays inline. Allocate extra storage only for
        // actual redeclarations, preserving source order and the latest public
        // declaration without a vector allocation for every binding.
        self.redeclarations
            .get(binding.redeclarations_id as usize)
            .map_or(&[][..], Vec::as_slice)
            .iter()
            .copied()
            .chain((binding.declaration_id != ABSENT_ID).then_some(binding.declaration_id))
    }

    pub fn rename_plan(&self, name: &str, scope_id: u32) -> NativeRenamePlan {
        let Some(binding) = self
            .name_ids
            .get(name)
            .and_then(|id| self.bindings.get(&(scope_id, *id)))
        else {
            return NativeRenamePlan {
                targets: Vec::new(),
                exports: Vec::new(),
            };
        };
        let targets = self
            .binding_declarations(binding)
            .chain(binding.references.iter().map(SemanticReference::node_id))
            .map(|id| NativeRenameTarget {
                start: self.starts[id as usize],
                end: self.ends[id as usize],
                kind: self.rename_kinds.get(&id).copied().unwrap_or(0),
            })
            .collect();
        let mut exports = self
            .binding_declarations(binding)
            .filter_map(|id| self.export_for_declaration(scope_id, id))
            .map(|id| NativeRenameExport {
                start: self.starts[id as usize],
                end: self.ends[id as usize],
            })
            .collect::<Vec<_>>();
        exports.dedup_by_key(|declaration| declaration.start);
        NativeRenamePlan { targets, exports }
    }

    /// Exports are recorded in source order. A binding declared by an export
    /// precedes any exports nested in a namespace body, so its preceding export
    /// must contain the declaration and belong to the same semantic scope.
    fn export_for_declaration(&self, scope: u32, declaration: u32) -> Option<u32> {
        let start = self.starts[declaration as usize];
        let position = self
            .exported_declarations
            .partition_point(|(id, _)| self.starts[*id as usize] <= start);
        let &(id, owner_scope) = self.exported_declarations.get(position.checked_sub(1)?)?;
        (owner_scope == scope && self.ends[declaration as usize] <= self.ends[id as usize])
            .then_some(id)
    }

    pub fn rename_export_names(&self, start: u32) -> Vec<String> {
        // Build names only when a declaration is actually rewritten. Ordinary
        // binding renames in an export-heavy module do not need this index.
        self.rename_exports
            .get_or_init(|| {
                let mut exports: FxHashMap<u32, Vec<u32>> = FxHashMap::default();
                for (&(scope, name), binding) in &self.bindings {
                    let mut previous = None;
                    for declaration in self.binding_declarations(binding) {
                        let Some(id) = self.export_for_declaration(scope, declaration) else {
                            continue;
                        };
                        if previous == Some(id) {
                            continue;
                        }
                        previous = Some(id);
                        exports
                            .entry(self.starts[id as usize])
                            .or_default()
                            .push(name);
                    }
                }
                for names in exports.values_mut() {
                    names.sort_unstable_by(|a, b| {
                        self.names[*a as usize].cmp(&self.names[*b as usize])
                    });
                }
                Box::new(exports)
            })
            .get(&start)
            .into_iter()
            .flatten()
            .map(|name| self.names[*name as usize].to_string())
            .collect()
    }

    pub fn record_constant(&mut self, kind: AstKind<'_>, node_id: u32) {
        if let Some(constants) = &mut self.constants {
            constants[node_id as usize] = constant(kind);
        }
    }

    pub fn binding_facts(
        &self,
        name: Option<&str>,
        scope_id: Option<u32>,
        reads: bool,
        writes: bool,
    ) -> Vec<NativeBindingFact> {
        let requested_name_id = name.and_then(|name| self.name_ids.get(name).copied());
        if name.is_some() && requested_name_id.is_none() {
            return Vec::new();
        }
        if let (Some(scope_id), Some(name_id)) = (scope_id, requested_name_id) {
            return self
                .bindings
                .get(&(scope_id, name_id))
                .map(|binding| self.binding_fact(scope_id, name_id, binding, reads, writes))
                .into_iter()
                .collect();
        }
        self.bindings
            .iter()
            .filter(|((candidate_scope_id, candidate_name_id), _)| {
                scope_id.is_none_or(|scope_id| scope_id == *candidate_scope_id)
                    && requested_name_id.is_none_or(|name_id| name_id == *candidate_name_id)
            })
            .map(|(&(scope_id, name_id), binding)| {
                self.binding_fact(scope_id, name_id, binding, reads, writes)
            })
            .collect()
    }

    /// The interned name table plus every `(scopeId, nameId)` binding key as one packed
    /// buffer, so JavaScript answers hasBinding-style lookups without per-call N-API
    /// round trips. Layout: `[nameCount, keyCount]`, then each name as length-prefixed
    /// padded UTF-8 in id order, then the key pairs as u32 words.
    pub fn binding_index_buffer(&self) -> Buffer {
        let names_size: usize = self
            .names
            .iter()
            .map(|name| 4 + name.len().next_multiple_of(4))
            .sum();
        let mut output = Vec::with_capacity(8 + names_size + self.bindings.len() * 8);
        output.extend_from_slice(&(self.names.len() as u32).to_le_bytes());
        output.extend_from_slice(&(self.bindings.len() as u32).to_le_bytes());
        for name in &self.names {
            output.extend_from_slice(&(name.len() as u32).to_le_bytes());
            output.extend_from_slice(name.as_bytes());
            output.resize(output.len().next_multiple_of(4), 0);
        }
        for &(scope_id, name_id) in self.bindings.keys() {
            output.extend_from_slice(&scope_id.to_le_bytes());
            output.extend_from_slice(&name_id.to_le_bytes());
        }
        output.into()
    }

    fn binding_fact(
        &self,
        scope_id: u32,
        name_id: u32,
        binding: &BindingRecord,
        reads: bool,
        writes: bool,
    ) -> NativeBindingFact {
        let declaration = (binding.declaration_id != ABSENT_ID).then(|| {
            let node_id = binding.declaration_id;
            (
                node_id,
                self.starts[node_id as usize],
                self.ends[node_id as usize],
            )
        });
        NativeBindingFact {
            name: self.names[name_id as usize].as_ref().to_owned(),
            scope_id,
            declaration_id: declaration.map(|value| value.0),
            declaration_start: declaration.map(|value| value.1),
            declaration_end: declaration.map(|value| value.2),
            declaration_parent_id: declaration.and_then(|value| {
                let parent_id = self.parent_ids[value.0 as usize];
                (parent_id != ABSENT_ID).then_some(parent_id)
            }),
            references: binding
                .references
                .iter()
                .filter(|reference| (!reads || reference.read()) && (!writes || reference.write()))
                .map(|reference| self.native_reference(reference))
                .collect(),
        }
    }

    /// Global queries expose only node ids and spans. Avoid constructing binding
    /// metadata (including allocated parent names) that the caller discards.
    pub fn global_references(&self, name: &str) -> impl ExactSizeIterator<Item = (u32, u32, u32)> {
        self.name_ids
            .get(name)
            .and_then(|name_id| self.globals.get(name_id))
            .map_or(&[][..], Vec::as_slice)
            .iter()
            .map(|reference| {
                let id = reference.node_id();
                (id, self.starts[id as usize], self.ends[id as usize])
            })
    }

    pub fn global_binding_references_buffer(&self, name: &str) -> Buffer {
        let references = self
            .name_ids
            .get(name)
            .and_then(|name_id| self.globals.get(name_id))
            .map_or(&[][..], Vec::as_slice);
        // Eight little-endian u32 words per reference. Parent type uses the
        // generated node type id; absent parent fields use ABSENT_ID.
        let mut words = crate::protocol::routed::PackedWords::with_capacity(references.len() * 32);
        for reference in references {
            let id = reference.node_id();
            let parent = self.parent_id(id);
            let flags = u32::from(reference.read())
                | (u32::from(reference.write()) << 1)
                | (u32::from(reference.member_write()) << 2);
            words.extend([
                id,
                self.starts[id as usize],
                self.ends[id as usize],
                reference.scope_id,
                parent.unwrap_or(ABSENT_ID),
                parent.map_or(ABSENT_ID, |id| self.type_ids[id as usize]),
                parent.map_or(ABSENT_ID, |id| self.starts[id as usize]),
                flags,
            ]);
        }
        words.into_bytes().into()
    }

    pub fn captures_batch(
        &self,
        function_ids: &[u32],
        program_bindings: &[Option<bool>],
        scope_parents: &[u32],
    ) -> Vec<NativeCaptureGroup> {
        if function_ids.is_empty() {
            return Vec::new();
        }
        struct RequestedFunction {
            id: u32,
            start: u32,
            end: u32,
            scope_id: u32,
            program_scope_id: u32,
            program_bindings: Option<bool>,
            parent: Option<usize>,
            references: Vec<NativeCaptureReference>,
        }

        let mut functions = function_ids
            .iter()
            .copied()
            .zip(program_bindings.iter().copied())
            .filter_map(|(id, program_bindings)| {
                let index = id as usize;
                let scope_id = *self.scope_ids.get(index)?;
                let mut program_scope_id = scope_id;
                while let Some(&parent) = scope_parents.get(program_scope_id as usize) {
                    if parent == ABSENT_ID {
                        break;
                    }
                    program_scope_id = parent;
                }
                Some(RequestedFunction {
                    id,
                    start: *self.starts.get(index)?,
                    end: *self.ends.get(index)?,
                    scope_id,
                    program_scope_id,
                    program_bindings,
                    parent: None,
                    references: Vec::new(),
                })
            })
            .collect::<Vec<_>>();
        functions.sort_unstable_by_key(|function| (function.start, u32::MAX - function.end));
        let mut stack = Vec::<usize>::new();
        for index in 0..functions.len() {
            while stack
                .last()
                .is_some_and(|parent| functions[*parent].end < functions[index].end)
            {
                stack.pop();
            }
            functions[index].parent = stack.last().copied();
            stack.push(index);
        }

        let (scope_entries, scope_exits) = scope_intervals(scope_parents);
        let contains_scope = |ancestor: u32, child: u32| {
            let ancestor = ancestor as usize;
            let child_entry = scope_entries[child as usize];
            scope_entries[ancestor] <= child_entry && child_entry < scope_exits[ancestor]
        };

        for (&(binding_scope_id, name_id), binding) in &self.bindings {
            for reference in &binding.references {
                let node_id = reference.node_id();
                let start = self.starts[node_id as usize];
                let end = self.ends[node_id as usize];
                let insertion = functions.partition_point(|function| function.start <= start);
                let mut candidate = insertion.checked_sub(1);
                while let Some(index) = candidate {
                    let function_end = functions[index].end;
                    let function_scope_id = functions[index].scope_id;
                    candidate = functions[index].parent;
                    if end <= function_end
                        && function_scope_id != binding_scope_id
                        && contains_scope(function_scope_id, reference.scope_id)
                        && !contains_scope(function_scope_id, binding_scope_id)
                        && functions[index]
                            .program_bindings
                            .is_none_or(|program_bindings| {
                                program_bindings
                                    == (binding_scope_id == functions[index].program_scope_id)
                            })
                    {
                        #[cfg(test)]
                        CAPTURE_RECORDS_MATERIALIZED.fetch_add(1, Ordering::Relaxed);
                        functions[index].references.push(NativeCaptureReference {
                            id: node_id,
                            start,
                            end,
                            scope_id: reference.scope_id,
                            binding_scope_id,
                            parent_id: self.parent_id(node_id),
                            parent_type: self.parent_type(node_id),
                            name: self.names[name_id as usize].as_ref().to_owned(),
                            read: reference.read(),
                            write: reference.write(),
                        });
                    }
                }
            }
        }

        functions
            .into_iter()
            .map(|function| NativeCaptureGroup {
                function_id: function.id,
                references: function.references,
            })
            .collect()
    }

    pub fn constant_facts(&self, node_ids: &[u32]) -> Vec<NativeConstantFact> {
        node_ids
            .iter()
            .filter_map(|&node_id| {
                self.constants
                    .as_ref()?
                    .get(node_id as usize)?
                    .as_ref()
                    .map(|constant| NativeConstantFact {
                        id: node_id,
                        kind: constant.kind.to_owned(),
                        value: constant.encoded.clone(),
                    })
            })
            .collect()
    }

    pub fn record_call(
        &mut self,
        node_id: u32,
        callee_name: &str,
        callee_global: bool,
        static_argument: Option<&str>,
    ) {
        let callee_name_id = self.intern_name(callee_name);
        debug_assert_eq!(callee_name_id & !CALL_NAME_MASK, 0);
        let static_argument_id = static_argument
            .map(|value| self.intern_name(value))
            .unwrap_or(ABSENT_ID);
        self.calls.push(CallRecord {
            node_id,
            callee_name_id_and_global: callee_name_id | if callee_global { CALL_GLOBAL } else { 0 },
            static_argument_id,
        });
    }

    pub fn record_packed_fields(&mut self, node_id: u32, words: &[u32]) {
        let Some(ranges) = &mut self.scalar_field_ranges else {
            return;
        };
        let start = self.scalar_fields.len() as u32;
        for pair in words.chunks_exact(2) {
            self.scalar_fields.push(RetainedField {
                key_id: pair[0],
                value: pair[1],
            });
        }
        ranges[node_id as usize] = (start, (words.len() / 2) as u32);
    }

    pub fn set_scalar_strings(&mut self, ids: FxHashMap<String, u32>) {
        let mut strings = vec![String::new(); ids.len()];
        for (value, id) in ids {
            strings[id as usize] = value;
        }
        self.scalar_strings = strings;
    }

    pub fn packed_events_buffer(&self, node_ids: &[u32], scope_parents: &[u32]) -> Buffer {
        let mut words = Vec::<u32>::new();
        // Response-local IDs keep sparse and empty queries independent of the
        // session dictionary size. Borrow strings instead of cloning dictionary entries.
        let mut string_ids = FxHashMap::<u32, u32>::default();
        // Dense responses can use direct lookup without hashing every field.
        // Bound initialization by the selection size so sparse queries never
        // regain work proportional to an unrelated session dictionary.
        let mut dense_string_ids = (self.scalar_strings.len() <= node_ids.len().saturating_mul(4)
            && !node_ids.is_empty())
        .then(|| vec![ABSENT_ID; self.scalar_strings.len()]);
        let mut strings = Vec::new();
        for &node_id in node_ids {
            let index = node_id as usize;
            let parent_id = self.parent_ids[index];
            let parent_type_id = if parent_id == ABSENT_ID {
                ABSENT_ID
            } else {
                self.type_ids[parent_id as usize]
            };
            let scope_id = self.scope_ids[index];
            let fields = self.scalar_fields_for(node_id);
            words.extend([
                node_id,
                node_id,
                self.type_ids[index],
                self.starts[index],
                self.ends[index],
                parent_id,
                parent_type_id,
                scope_id,
                scope_parents
                    .get(scope_id as usize)
                    .copied()
                    .unwrap_or(ABSENT_ID),
                fields.len() as u32,
            ]);
            for field in fields {
                words.push(field.key_id);
                let value = if field.value & 0xc000_0000 == 0 {
                    let next = strings.len() as u32;
                    if let Some(ids) = &mut dense_string_ids {
                        let id = &mut ids[field.value as usize];
                        if *id == ABSENT_ID {
                            strings.push(&self.scalar_strings[field.value as usize]);
                            *id = next;
                        }
                        *id
                    } else {
                        *string_ids.entry(field.value).or_insert_with(|| {
                            strings.push(&self.scalar_strings[field.value as usize]);
                            next
                        })
                    }
                } else {
                    field.value
                };
                words.push(value);
            }
        }
        let strings_size: usize = strings
            .iter()
            .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
            .sum();
        let words_offset = 16 + strings_size;
        let mut output = Vec::with_capacity(words_offset + words.len() * 4);
        for word in [
            self.len() as u32 | 0xc000_0000,
            node_ids.len() as u32,
            strings.len() as u32,
            words_offset as u32,
        ] {
            output.extend_from_slice(&word.to_le_bytes());
        }
        for value in strings {
            output.extend_from_slice(&(value.len() as u32).to_le_bytes());
            output.extend_from_slice(value.as_bytes());
            output.resize(output.len().next_multiple_of(4), 0);
        }
        for word in words {
            output.extend_from_slice(&word.to_le_bytes());
        }
        output.into()
    }

    pub fn call_facts(
        &self,
        callee_name: &str,
        global_only: bool,
        static_arguments: bool,
    ) -> Vec<NativeCallFact> {
        let Some(&callee_name_id) = self.name_ids.get(callee_name) else {
            return Vec::new();
        };
        self.calls
            .iter()
            .filter(|call| {
                call.callee_name_id() == callee_name_id
                    && (!global_only || call.callee_global())
                    && (!static_arguments || call.static_argument_id != ABSENT_ID)
            })
            .map(|call| NativeCallFact {
                id: call.node_id,
                start: self.starts[call.node_id as usize],
                end: self.ends[call.node_id as usize],
                scope_id: self.scope_ids[call.node_id as usize],
                callee_name: self.names[call.callee_name_id() as usize]
                    .as_ref()
                    .to_owned(),
                callee_global: call.callee_global(),
                static_argument: (call.static_argument_id != ABSENT_ID).then(|| {
                    self.names[call.static_argument_id as usize]
                        .as_ref()
                        .to_owned()
                }),
            })
            .collect()
    }

    fn native_reference(&self, reference: &SemanticReference) -> NativeSemanticReference {
        let node_id = reference.node_id();
        NativeSemanticReference {
            id: node_id,
            start: self.starts[node_id as usize],
            end: self.ends[node_id as usize],
            scope_id: reference.scope_id,
            parent_id: self.parent_id(node_id),
            parent_type: self.parent_type(node_id),
            parent_start: self
                .parent_id(node_id)
                .map(|parent_id| self.starts[parent_id as usize]),
            read: reference.read(),
            write: reference.write(),
            member_write: reference.member_write(),
        }
    }

    pub fn parent_id(&self, node_id: u32) -> Option<u32> {
        let parent_id = self.parent_ids[node_id as usize];
        (parent_id != ABSENT_ID).then_some(parent_id)
    }

    fn parent_type(&self, node_id: u32) -> Option<String> {
        self.parent_id(node_id)
            .and_then(|parent_id| node_type_name(self.type_ids[parent_id as usize]))
            .map(str::to_owned)
    }

    fn intern_name(&mut self, name: &str) -> u32 {
        if let Some(name_id) = self.name_ids.get(name) {
            return *name_id;
        }
        let name_id = self.names.len() as u32;
        let name: Rc<str> = Rc::from(name);
        self.names.push(Rc::clone(&name));
        self.name_ids.insert(name, name_id);
        name_id
    }

    pub fn record(
        &mut self,
        node_id: u32,
        type_id: u32,
        start: u32,
        end: u32,
        parent_id: Option<u32>,
        scope_id: u32,
    ) {
        self.traversal_ranges.take();
        self.traversal_sequences.take();
        let index = node_id as usize;
        if index >= self.type_ids.len() {
            let new_len = index + 1;
            self.type_ids.resize(new_len, ABSENT_ID);
            self.starts.resize(new_len, 0);
            self.ends.resize(new_len, 0);
            self.parent_ids.resize(new_len, ABSENT_ID);
            self.scope_ids.resize(new_len, 0);
            if let Some(values) = &mut self.constants {
                values.resize(new_len, None);
            }
            if let Some(values) = &mut self.scalar_field_ranges {
                values.resize(new_len, (0, 0));
            }
        }
        self.type_ids[index] = type_id;
        self.starts[index] = start;
        self.ends[index] = end;
        self.parent_ids[index] = parent_id.unwrap_or(ABSENT_ID);
        self.scope_ids[index] = scope_id;
    }

    pub(crate) fn record_child_edge(
        &mut self,
        node_id: u32,
        parent_id: Option<u32>,
        child_role_id: Option<u32>,
    ) {
        let (Some(parent_id), Some(pending)) = (parent_id, &mut self.pending_child_edges) else {
            return;
        };
        let parent = parent_id as usize;
        let parent_type_id = self.type_ids[parent];
        let Some(mask) = self
            .child_role_mask_by_parent_type
            .get(parent_type_id as usize)
        else {
            return;
        };
        let retained_role_id = match child_role_id {
            Some(role_id) if mask.wildcard || mask.role_ids.contains(&role_id) => role_id,
            None if mask.wildcard && !child_role_parent_has_roles(parent_type_id) => 0,
            _ => return,
        };
        pending.push(ChildEdge {
            parent_id,
            child_id: node_id,
            role_id: retained_role_id,
        });
    }

    pub(crate) fn finalize_child_edges(&mut self) {
        let Some(mut pending) = self.pending_child_edges.take() else {
            return;
        };
        let formal_parameters_type = node_type_id("FormalParameters").expect("generated node type");
        let parameter_projections = pending
            .iter()
            .filter(|edge| {
                child_role_projects_formal_parameters(edge.role_id)
                    && self.type_ids[edge.child_id as usize] == formal_parameters_type
            })
            .map(|edge| (edge.child_id, (edge.parent_id, edge.role_id)))
            .collect::<FxHashMap<_, _>>();
        let mut projected = Vec::new();
        if !parameter_projections.is_empty() {
            for child in &pending {
                if let Some(&(parent_id, role_id)) = parameter_projections.get(&child.parent_id) {
                    projected.push(ChildEdge {
                        parent_id,
                        child_id: child.child_id,
                        role_id,
                    });
                }
            }
        }
        pending.retain(|edge| {
            !child_role_projects_formal_parameters(edge.role_id)
                || self.type_ids[edge.child_id as usize] != formal_parameters_type
        });
        pending.extend(projected);
        let mut offsets = vec![0_u32; self.type_ids.len() + 1];
        for edge in &pending {
            offsets[edge.parent_id as usize + 1] += 1;
        }
        for index in 1..offsets.len() {
            offsets[index] += offsets[index - 1];
        }
        let mut cursors = offsets[..self.type_ids.len()].to_vec();
        let mut edges = vec![
            ChildEdge {
                parent_id: 0,
                child_id: 0,
                role_id: 0,
            };
            pending.len()
        ];
        for edge in pending {
            let cursor = &mut cursors[edge.parent_id as usize];
            edges[*cursor as usize] = edge;
            *cursor += 1;
        }
        self.child_offsets = Some(offsets);
        self.child_edges = edges;
    }

    pub fn record_enter(&mut self, node_id: u32) {
        self.traversal_ranges.take();
        self.traversal_sequences.take();
        self.traversal_records.push(node_id);
    }

    pub fn record_exit(&mut self, node_id: u32) {
        self.traversal_ranges.take();
        self.traversal_sequences.take();
        self.traversal_records.push(node_id | 0x8000_0000);
    }

    pub fn len(&self) -> usize {
        self.type_ids.len()
    }

    pub fn type_id(&self, node_id: u32) -> Option<u32> {
        self.type_ids
            .get(node_id as usize)
            .copied()
            .filter(|type_id| *type_id != ABSENT_ID)
    }

    pub fn start(&self, node_id: u32) -> u32 {
        self.starts[node_id as usize]
    }

    pub fn end(&self, node_id: u32) -> u32 {
        self.ends[node_id as usize]
    }

    pub fn scope_id(&self, node_id: u32) -> u32 {
        self.scope_ids[node_id as usize]
    }

    pub fn traversal_records(&self) -> &[u32] {
        &self.traversal_records
    }

    /// Locate the smallest tape interval containing every matching span. The
    /// lazy block hierarchy takes O(N) time to build and less than one byte per
    /// tape record (apart from rounding small indexes). Searches skip blocks
    /// whose bounds exclude the query, without sorting or scanning its interior.
    /// Adversarially interleaved spans can still require O(N) search work when
    /// block bounds are inconclusive. The route writer applies the exact span
    /// predicate within the resulting interval.
    pub fn traversal_range(&self, start: u32, end: u32) -> std::ops::Range<usize> {
        if start > end || self.traversal_records.is_empty() {
            return 0..0;
        }
        let ranges = self
            .traversal_ranges
            .get_or_init(|| TraversalRanges::new(self));
        let Some(first) = ranges.find::<false>(self, 1, start, end) else {
            return 0..0;
        };
        let last = ranges
            .find::<true>(self, 1, start, end)
            .expect("forward search found a matching record");
        first..last + 1
    }

    /// Match the full-tape sequence numbering for the active manifest, whose
    /// exit routes determine which exit carriers advance the sequence. A prefix
    /// and enter bitset per block give O(1) enter counts without a per-record
    /// prefix array; each enabled exit type adds one binary search.
    pub fn traversal_sequence_before(
        &self,
        offset: usize,
        exit_types: impl Iterator<Item = u32>,
    ) -> u32 {
        let sequences = self.traversal_sequences.get_or_init(|| {
            let mut sequences = TraversalSequences::default();
            let mut enters = 0;
            for (block_id, records) in self
                .traversal_records
                .chunks(TRAVERSAL_BLOCK_SIZE)
                .enumerate()
            {
                let mut block = TraversalSequenceBlock {
                    before: enters,
                    enters: 0,
                };
                for (bit, &record) in records.iter().enumerate() {
                    if let Some(type_id) = self.type_id(record & 0x7fff_ffff) {
                        if record & 0x8000_0000 == 0 {
                            block.enters |= 1 << bit;
                        } else {
                            sequences
                                .exits_by_type
                                .entry(type_id)
                                .or_default()
                                .push((block_id * TRAVERSAL_BLOCK_SIZE + bit) as u32);
                        }
                    }
                }
                enters += block.enters.count_ones();
                sequences.blocks.push(block);
            }
            if self
                .traversal_records
                .len()
                .is_multiple_of(TRAVERSAL_BLOCK_SIZE)
            {
                sequences.blocks.push(TraversalSequenceBlock {
                    before: enters,
                    enters: 0,
                });
            }
            sequences
        });
        let block = &sequences.blocks[offset / TRAVERSAL_BLOCK_SIZE];
        let preceding_bits = (1u32 << (offset % TRAVERSAL_BLOCK_SIZE)) - 1;
        block.before
            + (block.enters & preceding_bits).count_ones()
            + exit_types
                .map(|type_id| {
                    sequences.exits_by_type.get(&type_id).map_or(0, |offsets| {
                        offsets.partition_point(|&exit| (exit as usize) < offset) as u32
                    })
                })
                .sum::<u32>()
    }

    pub(crate) fn scalar_field(&self, node_id: u32, key_id: u32) -> Option<RetainedFieldValue> {
        self.scalar_fields_for(node_id)
            .iter()
            .find(|field| field.key_id == key_id)
            .map(|field| {
                if field.value & 0xc000_0000 == 0 {
                    RetainedFieldValue::String(field.value)
                } else {
                    RetainedFieldValue::Packed(field.value)
                }
            })
    }

    pub(crate) fn scalar_string(&self, id: u32) -> Option<&str> {
        self.scalar_strings.get(id as usize).map(String::as_str)
    }

    fn scalar_fields_for(&self, node_id: u32) -> &[RetainedField] {
        let Some(&(start, length)) = self
            .scalar_field_ranges
            .as_ref()
            .and_then(|ranges| ranges.get(node_id as usize))
        else {
            return &[];
        };
        &self.scalar_fields[start as usize..(start + length) as usize]
    }

    pub(crate) fn scalar_fields(
        &self,
        node_id: u32,
    ) -> impl Iterator<Item = (u32, RetainedFieldValue)> + '_ {
        self.scalar_fields_for(node_id).iter().map(|field| {
            let value = if field.value & 0xc000_0000 == 0 {
                RetainedFieldValue::String(field.value)
            } else {
                RetainedFieldValue::Packed(field.value)
            };
            (field.key_id, value)
        })
    }

    fn write_summary(&self, node_id: u32, scope_parents: &[u32], output: &mut Vec<u8>) {
        let index = node_id as usize;
        let Some(&type_id) = self.type_ids.get(index) else {
            return;
        };
        let parent_id = self.parent_ids[index];
        let parent_type_id = if parent_id == ABSENT_ID {
            ABSENT_ID
        } else {
            self.type_ids[parent_id as usize]
        };
        let scope_id = self.scope_ids[index];
        let scope_parent_id = scope_parents
            .get(scope_id as usize)
            .copied()
            .unwrap_or(ABSENT_ID);
        for word in [
            type_id,
            self.starts[index],
            self.ends[index],
            parent_id,
            parent_type_id,
            scope_id,
            scope_parent_id,
        ] {
            output.extend_from_slice(&word.to_le_bytes());
        }
    }

    pub fn summary_buffer(&self, node_id: u32, scope_parents: &[u32]) -> Buffer {
        let mut output = Vec::with_capacity(7 * 4);
        self.write_summary(node_id, scope_parents, &mut output);
        output.into()
    }

    /// Eight-word `[id, type, start, end, parentId, parentTypeId, scopeId, scopeParentId]`
    /// entries for the given nodes, used as the routed envelope's ancestor sidecar.
    pub fn parent_summary_words(&self, node_ids: &[u32], scope_parents: &[u32]) -> Vec<u32> {
        let mut words = Vec::with_capacity(node_ids.len() * 8);
        for &node_id in node_ids {
            let index = node_id as usize;
            let Some(&type_id) = self.type_ids.get(index) else {
                continue;
            };
            let parent_id = self.parent_ids[index];
            let scope_id = self.scope_ids[index];
            words.extend([
                node_id,
                type_id,
                self.starts[index],
                self.ends[index],
                parent_id,
                if parent_id == ABSENT_ID {
                    ABSENT_ID
                } else {
                    self.type_ids[parent_id as usize]
                },
                scope_id,
                scope_parents
                    .get(scope_id as usize)
                    .copied()
                    .unwrap_or(ABSENT_ID),
            ]);
        }
        words
    }

    pub fn children(&self, parent_id: u32) -> Children<'_> {
        let edges = self.child_offsets.as_ref().map_or(&[][..], |offsets| {
            let Some((&start, &end)) = offsets
                .get(parent_id as usize)
                .zip(offsets.get(parent_id as usize + 1))
            else {
                return &[];
            };
            &self.child_edges[start as usize..end as usize]
        });
        Children {
            edges: edges.iter(),
            role_id: None,
        }
    }

    pub(crate) fn child_edges(&self, parent_id: u32) -> impl Iterator<Item = (u32, u32)> + '_ {
        let edges = self.child_offsets.as_ref().map_or(&[][..], |offsets| {
            let Some((&start, &end)) = offsets
                .get(parent_id as usize)
                .zip(offsets.get(parent_id as usize + 1))
            else {
                return &[];
            };
            &self.child_edges[start as usize..end as usize]
        });
        edges.iter().map(|edge| (edge.child_id, edge.role_id))
    }

    pub fn node_ids_of_types<'a>(
        &'a self,
        type_ids: &'a rustc_hash::FxHashSet<u32>,
    ) -> impl Iterator<Item = u32> + 'a {
        self.type_ids
            .iter()
            .enumerate()
            .filter(|(_, type_id)| type_ids.contains(type_id))
            .map(|(node_id, _)| node_id as u32)
    }

    /// Owned scopes and insertion coordinates are semantic facts, independent of
    /// optional scalar fields on routed events.
    ///
    /// Modes: statement list `0`, concise-arrow expression `1`, unbraced loop
    /// statement `2`, no statement body `3`, class delegate `4`, switch delegate
    /// `5`, function-like list `6`. Delegate records store the host scope id in
    /// the start word. Class insertion stops at the nearest statement list;
    /// switch insertion stops at the enclosing function, static block, or
    /// program, matching Babel's block and function parents. A statement before
    /// the first `case`, or inside a class body, is not a statement list.
    pub fn record_scopes(
        &mut self,
        scoping: &Scoping,
        nodes: &AstNodes<'_>,
        utf16: Option<&[u32]>,
    ) {
        use oxc_ast::ast::Statement;
        let offset = |byte: u32| utf16.map_or(byte, |index| index[byte as usize]);
        let mut records = vec![[0, 0, 0, 3, 0]; scoping.scopes_len()];
        let mut parents = vec![u32::MAX; scoping.scopes_len()];
        for scope in scoping.scope_descendants_from_root() {
            let index = scope.index();
            parents[index] = scoping
                .scope_parent_id(scope)
                .map_or(u32::MAX, |parent| parent.index() as u32);
            let owner = scoping.get_node_id(scope);
            let kind = nodes.get_node(owner).kind();
            let mut insertion = None;
            let mut mode = 0;
            let mut public_scope = scope;
            let mut statement = None;
            match kind {
                AstKind::Program(program) => {
                    let start = program
                        .directives
                        .last()
                        .map(|directive| directive.span.end)
                        .or_else(|| program.hashbang.as_ref().map(|hashbang| hashbang.span.end))
                        .unwrap_or(program.span.start);
                    insertion = Some((start, program.span.end));
                    mode = 6;
                }
                AstKind::Function(function) => {
                    if let Some(body) = &function.body {
                        insertion = Some((
                            body.directives
                                .last()
                                .map_or(body.span.start + 1, |directive| directive.span.end),
                            body.span.end - 1,
                        ));
                        mode = 6;
                    }
                }
                AstKind::ArrowFunctionExpression(function) => {
                    let body = &function.body;
                    let inset = u32::from(!function.expression);
                    insertion = Some((
                        body.directives
                            .last()
                            .map_or(body.span.start + inset, |directive| directive.span.end),
                        body.span.end - inset,
                    ));
                    mode = if function.expression { 1 } else { 6 };
                }
                AstKind::BlockStatement(block) => {
                    insertion = Some((block.span.start + 1, block.span.end - 1));
                }
                AstKind::StaticBlock(block) => {
                    insertion = Some((
                        block
                            .body
                            .first()
                            .map_or(block.span.end - 1, |statement| statement.span().start),
                        block.span.end - 1,
                    ));
                    mode = 6;
                }
                AstKind::CatchClause(catch) => {
                    // Oxc associates simple catch symbols with the body scope.
                    public_scope = catch.body.scope_id.get().unwrap_or(scope);
                    insertion = Some((catch.body.span.start + 1, catch.body.span.end - 1));
                }
                AstKind::ForStatement(node) => statement = Some(&node.body),
                AstKind::ForInStatement(node) => statement = Some(&node.body),
                AstKind::ForOfStatement(node) => statement = Some(&node.body),
                AstKind::Class(_) => mode = 4,
                AstKind::SwitchStatement(_) => mode = 5,
                _ => {}
            }
            if let Some(body) = statement {
                let span = body.span();
                if matches!(body, Statement::BlockStatement(_)) {
                    insertion = Some((span.start + 1, span.end - 1));
                } else {
                    insertion = Some((span.start, span.end));
                    mode = 2;
                }
            }
            let (start, end) = if let Some(span) = insertion {
                span
            } else if mode == 4 || mode == 5 {
                (0, 0)
            } else {
                mode = 3;
                (0, 0)
            };
            records[index] = [
                owner.index() as u32,
                offset(start),
                offset(end),
                mode,
                public_scope.index() as u32,
            ];
        }
        for index in 0..records.len() {
            let mode = records[index][3];
            if mode != 4 && mode != 5 {
                continue;
            }
            if let Some(host) = statement_host(&records, &parents, parents[index], mode == 5) {
                records[index][1] = host as u32;
            } else {
                records[index][3] = 3;
            }
        }
        self.scope_metadata = records;
    }

    pub fn scope_metadata_buffer(&self, _scope_count: usize) -> Buffer {
        self.scope_metadata
            .iter()
            .flatten()
            .flat_map(|word| word.to_le_bytes())
            .collect::<Vec<_>>()
            .into()
    }

    pub fn memory_usage(&self) -> usize {
        self.rename_exports.get().map_or(0, |exports| {
            size_of::<FxHashMap<u32, Vec<u32>>>()
                + exports.capacity() * size_of::<(u32, Vec<u32>)>()
                + exports
                    .values()
                    .map(|ids| ids.capacity() * size_of::<u32>())
                    .sum::<usize>()
        }) + self.rename_kinds.capacity() * size_of::<(u32, u32)>()
            + self.exported_declarations.capacity() * size_of::<(u32, u32)>()
            + self.scope_metadata.capacity() * size_of::<[u32; 5]>()
            + self.type_ids.capacity() * size_of::<u32>()
            + self.starts.capacity() * size_of::<u32>()
            + self.ends.capacity() * size_of::<u32>()
            + self.parent_ids.capacity() * size_of::<u32>()
            + self.scope_ids.capacity() * size_of::<u32>()
            + self.traversal_records.capacity() * size_of::<u32>()
            + self.traversal_ranges.get().map_or(0, |ranges| {
                ranges.bounds.capacity() * size_of::<(u32, u32)>()
            })
            + self.traversal_sequences.get().map_or(0, |sequences| {
                sequences.blocks.capacity() * size_of::<TraversalSequenceBlock>()
                    + sequences.exits_by_type.capacity() * size_of::<(u32, Vec<u32>)>()
                    + sequences
                        .exits_by_type
                        .values()
                        .map(|offsets| offsets.capacity() * size_of::<u32>())
                        .sum::<usize>()
            })
            + self
                .pending_child_edges
                .as_ref()
                .map_or(0, |edges| edges.capacity() * size_of::<ChildEdge>())
            + self
                .child_offsets
                .as_ref()
                .map_or(0, |offsets| offsets.capacity() * size_of::<u32>())
            + self.child_edges.capacity() * size_of::<ChildEdge>()
            + self.child_role_mask_by_parent_type.capacity() * size_of::<ChildRoleMask>()
            + self
                .child_role_mask_by_parent_type
                .iter()
                .map(|mask| mask.role_ids.capacity() * size_of::<u32>())
                .sum::<usize>()
            + self.names.capacity() * size_of::<Rc<str>>()
            + self.names.iter().map(|name| name.len()).sum::<usize>()
            + self.name_ids.capacity() * size_of::<(Rc<str>, u32)>()
            + self
                .bindings
                .values()
                .map(|binding| {
                    size_of::<((u32, u32), BindingRecord)>()
                        + binding.references.capacity() * size_of::<SemanticReference>()
                })
                .sum::<usize>()
            + self.redeclarations.capacity() * size_of::<Vec<u32>>()
            + self
                .redeclarations
                .iter()
                .map(|ids| ids.capacity() * size_of::<u32>())
                .sum::<usize>()
            + self
                .globals
                .values()
                .map(|references| {
                    size_of::<(u32, Vec<SemanticReference>)>()
                        + references.capacity() * size_of::<SemanticReference>()
                })
                .sum::<usize>()
            + self.constants.as_ref().map_or(0, |constants| {
                constants.capacity() * size_of::<Option<TransportConstant>>()
                    + constants
                        .iter()
                        .flatten()
                        .map(|constant| constant.encoded.capacity())
                        .sum::<usize>()
            })
            + self.calls.capacity() * size_of::<CallRecord>()
            + self.scalar_strings.capacity() * size_of::<String>()
            + self
                .scalar_strings
                .iter()
                .map(String::capacity)
                .sum::<usize>()
            + self
                .scalar_field_ranges
                .as_ref()
                .map_or(0, |ranges| ranges.capacity() * size_of::<(u32, u32)>())
            + self.scalar_fields.capacity() * size_of::<RetainedField>()
    }

    pub(crate) fn child_edge_count(&self) -> u32 {
        self.child_edges.len() as u32
    }

    pub(crate) fn scalar_field_count(&self) -> u32 {
        self.scalar_fields.len() as u32
    }

    pub(crate) fn scalar_string_count(&self) -> u32 {
        self.scalar_strings.len() as u32
    }

    pub fn clear(&mut self) {
        *self = Self::default();
    }
}

/// Class and switch scopes have no statement list of their own. `switch` walks
/// to the nearest function-like list or concise arrow; other delegates stop at
/// the nearest scope that can host statements, and a switch on that walk uses
/// the switch rule.
fn statement_host(
    records: &[[u32; 5]],
    parents: &[u32],
    mut current: u32,
    switch: bool,
) -> Option<usize> {
    let mut guard = 0;
    while current != u32::MAX {
        guard += 1;
        if guard > records.len() {
            return None;
        }
        let index = current as usize;
        let mode = records.get(index).map_or(3, |record| record[3]);
        // A switch walk skips blocks and nested switches until a function-like
        // list or concise arrow. Other walks stop at the first real statement host.
        if switch && (mode == 6 || mode == 1) {
            return Some(index);
        }
        if !switch && mode == 5 {
            let parent = parents.get(index).copied().unwrap_or(u32::MAX);
            return statement_host(records, parents, parent, true);
        }
        if !switch && mode != 4 && mode != 3 {
            return Some(index);
        }
        current = parents.get(index).copied().unwrap_or(u32::MAX);
    }
    None
}

fn scope_intervals(scope_parents: &[u32]) -> (Vec<u32>, Vec<u32>) {
    let mut children = vec![Vec::new(); scope_parents.len()];
    let mut roots = Vec::new();
    for (scope, &parent) in scope_parents.iter().enumerate() {
        if parent == ABSENT_ID {
            roots.push(scope);
        } else {
            children[parent as usize].push(scope);
        }
    }
    let mut entries = vec![0; scope_parents.len()];
    let mut exits = vec![0; scope_parents.len()];
    let mut clock = 0;
    let mut stack = roots
        .into_iter()
        .rev()
        .map(|scope| (scope, false))
        .collect::<Vec<_>>();
    while let Some((scope, exiting)) = stack.pop() {
        if exiting {
            exits[scope] = clock;
            continue;
        }
        entries[scope] = clock;
        clock += 1;
        stack.push((scope, true));
        stack.extend(children[scope].iter().rev().map(|&child| (child, false)));
    }
    (entries, exits)
}

pub struct Children<'a> {
    edges: std::slice::Iter<'a, ChildEdge>,
    role_id: Option<u32>,
}

impl Iterator for Children<'_> {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        self.edges
            .find(|edge| self.role_id.is_none_or(|role_id| edge.role_id == role_id))
            .map(|edge| edge.child_id)
    }
}
use std::rc::Rc;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn packed_response_strings_scale_with_selected_fields() {
        let word = |bytes: &[u8], offset: usize| {
            u32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
        };
        let mut previous = None;
        for size in [32, 64, 128] {
            let mut index = RetainedIndex {
                type_ids: vec![1, 1],
                starts: vec![0, 1],
                ends: vec![1, 2],
                parent_ids: vec![ABSENT_ID, 0],
                scope_ids: vec![0, 0],
                scalar_strings: (0..size).map(|id| format!("unrelated-{id}")).collect(),
                scalar_field_ranges: Some(vec![(0, 1), (1, 6)]),
                ..RetainedIndex::default()
            };
            index.scalar_strings.extend(["雪😀".into(), "".into()]);
            index.scalar_fields = [0, size, size, size + 1, 0x8000_0001, 0x4000_0007, ABSENT_ID]
                .into_iter()
                .map(|value| RetainedField { key_id: 1, value })
                .collect();
            // Exercise the dense lookup path with the same fields, including
            // repeated requests, without changing the response-local ID order.
            let dense = index.packed_events_buffer(&vec![1; size as usize], &[ABSENT_ID]);
            assert_eq!(word(&dense, 8), 2);
            let dense_offset = word(&dense, 12) as usize;
            for record in 0..size as usize {
                let values = (0..6)
                    .map(|field| word(&dense, dense_offset + record * 88 + 44 + field * 8))
                    .collect::<Vec<_>>();
                assert_eq!(values, [0, 0, 1, 0x8000_0001, 0x4000_0007, ABSENT_ID]);
            }
            let empty = index.packed_events_buffer(&[], &[ABSENT_ID]);
            assert_eq!(empty.len(), 16);
            assert_eq!(word(&empty, 8), 0);
            assert_eq!(word(&empty, 12), 16);
            let response = index.packed_events_buffer(&[1], &[ABSENT_ID]);
            assert_eq!(word(&response, 8), 2);
            assert_eq!(word(&response, 16), "雪😀".len() as u32);
            assert_eq!(&response[20..27], "雪😀".as_bytes());
            assert_eq!(word(&response, 28), 0); // Empty string, after UTF-8 padding.
            let offset = word(&response, 12) as usize;
            let values = (0..6)
                .map(|field| word(&response, offset + 44 + field * 8))
                .collect::<Vec<_>>();
            assert_eq!(values, [0, 0, 1, 0x8000_0001, 0x4000_0007, ABSENT_ID]);
            assert_eq!(index.scalar_fields_for(1)[0].value, size);
            assert_eq!(
                index.packed_events_buffer(&[1], &[ABSENT_ID]).as_ref(),
                response.as_ref()
            );
            if let Some(previous) = previous {
                assert_eq!(response.as_ref(), previous);
            }
            previous = Some(response.to_vec());
        }
    }

    #[test]
    fn bounded_traversal_preserves_span_filtering_and_tape_order() {
        // Include shared spans, a zero-width sibling, non-source-order children,
        // and a node without an exit carrier.
        let mut index = RetainedIndex {
            starts: vec![0, 2, 2, 8, 4, 8],
            ends: vec![20, 8, 8, 8, 6, 10],
            ..RetainedIndex::default()
        };
        for record in [
            0,
            1,
            2,
            3,
            3 | 0x8000_0000,
            4,
            2 | 0x8000_0000,
            1 | 0x8000_0000,
            5,
            5 | 0x8000_0000,
            0x8000_0000,
        ] {
            index.traversal_records.push(record);
        }
        for start in 0..=21 {
            for end in start..=21 {
                let filter = |records: &[u32]| {
                    records
                        .iter()
                        .copied()
                        .filter(|record| {
                            let id = record & 0x7fff_ffff;
                            index.start(id) >= start && index.end(id) <= end
                        })
                        .collect::<Vec<_>>()
                };
                assert_eq!(
                    filter(&index.traversal_records()[index.traversal_range(start, end)]),
                    filter(index.traversal_records()),
                    "range {start}..{end}"
                );
            }
        }
        assert!(index.traversal_range(10, 2).is_empty());
    }

    #[test]
    fn bounded_sequences_match_full_tape_for_each_exit_manifest() {
        for count in [0, 4, 16, 17, 64, 65] {
            let mut index = RetainedIndex {
                type_ids: (0..count).map(|id| [0, 1, ABSENT_ID, 0][id % 4]).collect(),
                ..RetainedIndex::default()
            };
            for id in 0..count as u32 {
                index.record_enter(id);
                index.record_exit(id);
            }
            for exit_types in [vec![], vec![0], vec![1], vec![0, 1]] {
                for offset in 0..=index.traversal_records.len() {
                    let expected = index.traversal_records[..offset]
                        .iter()
                        .filter(|&&record| {
                            index.type_id(record & 0x7fff_ffff).is_some_and(|type_id| {
                                record & 0x8000_0000 == 0 || exit_types.contains(&type_id)
                            })
                        })
                        .count() as u32;
                    assert_eq!(
                        index.traversal_sequence_before(offset, exit_types.iter().copied()),
                        expected
                    );
                }
            }
        }
    }

    #[test]
    fn bounded_traversal_handles_reordered_blocks_and_extreme_ranges() {
        let mut index = RetainedIndex::default();
        for id in 0..129 {
            // Deliberately scatter adjacent spans across multiple tape blocks.
            let start = (id * 67) % 129;
            index.record(id, 0, start, start + id % 7, None, 0);
            index.record_enter(id);
            if id % 3 != 0 {
                index.record_exit(id);
            }
        }
        for start in (0..140).chain([u32::MAX]) {
            for end in (start..140).chain([u32::MAX]) {
                let matching = index
                    .traversal_records
                    .iter()
                    .enumerate()
                    .filter_map(|(offset, &record)| {
                        let id = record & 0x7fff_ffff;
                        (index.start(id) >= start && index.end(id) <= end).then_some(offset)
                    })
                    .collect::<Vec<_>>();
                let expected = matching
                    .first()
                    .zip(matching.last())
                    .map_or(0..0, |(&first, &last)| first..last + 1);
                assert_eq!(
                    index.traversal_range(start, end),
                    expected,
                    "range {start}..{end}"
                );
            }
        }
    }

    #[test]
    fn bounded_traversal_caches_are_compact_and_follow_index_mutations() {
        let mut index = RetainedIndex::default();
        for id in 0..8192 {
            index.record(id, 0, id * 2, id * 2 + 1, None, 0);
            index.record_enter(id);
            index.record_exit(id);
        }
        let before = index.memory_usage();
        assert_eq!(index.traversal_range(20, 21), 20..22);
        assert_eq!(index.traversal_sequence_before(20, [0].into_iter()), 20);
        assert!(index.memory_usage() - before < index.traversal_records.len() * size_of::<u32>());

        // Changing both a span and its protocol type must invalidate both caches.
        index.record(0, ABSENT_ID, 20, 21, None, 0);
        assert_eq!(index.traversal_range(20, 21), 0..22);
        assert_eq!(index.traversal_sequence_before(20, [0].into_iter()), 18);
        index.record_enter(10);
        index.record_exit(10);
        assert_eq!(index.traversal_range(20, 21), 0..16386);
        assert_eq!(
            index.traversal_sequence_before(16386, [0].into_iter()),
            16384
        );
        index.clear();
        assert!(index.traversal_range(0, u32::MAX).is_empty());
        assert_eq!(index.traversal_sequence_before(0, [0].into_iter()), 0);
        index.record(0, 0, 5, 6, None, 0);
        index.record_enter(0);
        assert_eq!(index.traversal_range(5, 6), 0..1);
        assert_eq!(index.traversal_sequence_before(1, [0].into_iter()), 1);
    }

    #[test]
    fn disjoint_subtree_scans_stay_bounded_as_file_grows() {
        for count in [128, 256, 512] {
            let mut index = RetainedIndex {
                starts: (0..count).map(|id| id * 10).collect(),
                ends: (0..count).map(|id| id * 10 + 5).collect(),
                ..RetainedIndex::default()
            };
            for id in 0..count {
                index.record_enter(id);
                index.record_exit(id);
            }
            let scanned = (0..count)
                .map(|id| {
                    let records =
                        &index.traversal_records()[index.traversal_range(id * 10, id * 10 + 5)];
                    assert_eq!(records, &[id, id | 0x8000_0000]);
                    records.len()
                })
                .sum::<usize>();
            assert_eq!(scanned, count as usize * 2);
            // Appending records invalidates the lazy range lookup.
            index.record_enter(0);
            assert_eq!(
                index.traversal_records()[index.traversal_range(0, 5)].last(),
                Some(&0)
            );
        }
    }

    #[test]
    fn capture_batch_groups_many_functions() {
        const COUNT: usize = 128;
        let mut index = RetainedIndex {
            type_ids: vec![0; COUNT * 2],
            starts: vec![0; COUNT * 2],
            ends: vec![0; COUNT * 2],
            parent_ids: vec![ABSENT_ID; COUNT * 2],
            scope_ids: vec![0; COUNT * 2],
            names: vec![Rc::from("outer")],
            ..RetainedIndex::default()
        };
        let mut references = Vec::with_capacity(COUNT);
        let mut scope_parents = vec![ABSENT_ID];
        for function in 0..COUNT {
            let function_id = function as u32;
            let reference_id = (COUNT + function) as u32;
            let scope_id = function_id + 1;
            let start = function_id * 10;
            index.starts[function] = start;
            index.ends[function] = start + 5;
            index.scope_ids[function] = scope_id;
            index.starts[reference_id as usize] = start + 1;
            index.ends[reference_id as usize] = start + 2;
            index.scope_ids[reference_id as usize] = scope_id;
            scope_parents.push(0);
            references.push(SemanticReference::new(
                reference_id,
                scope_id,
                true,
                false,
                false,
            ));
        }
        index.bindings.insert(
            (0, 0),
            BindingRecord {
                declaration_id: ABSENT_ID,
                redeclarations_id: ABSENT_ID,
                references,
            },
        );
        let groups = index.captures_batch(
            &(0..COUNT as u32).collect::<Vec<_>>(),
            &[None; COUNT],
            &scope_parents,
        );
        assert_eq!(groups.len(), COUNT);
        assert!(groups.iter().all(|group| group.references.len() == 1));

        CAPTURE_RECORDS_MATERIALIZED.store(0, Ordering::Relaxed);
        let filtered = index.captures_batch(&[0], &[Some(false)], &scope_parents);
        assert!(filtered[0].references.is_empty());
        assert_eq!(CAPTURE_RECORDS_MATERIALIZED.load(Ordering::Relaxed), 0);

        let retained = index.captures_batch(&[0], &[Some(true)], &scope_parents);
        assert_eq!(retained[0].references.len(), 1);
        assert_eq!(CAPTURE_RECORDS_MATERIALIZED.load(Ordering::Relaxed), 1);
    }

    #[test]
    fn scope_metadata_encodes_all_scopes() {
        const COUNT: usize = 128;
        let index = RetainedIndex {
            scope_metadata: (0..COUNT as u32)
                .map(|scope| [scope * 2, scope + 10, scope + 20, 0, scope])
                .collect(),
            ..RetainedIndex::default()
        };
        let buffer = index.scope_metadata_buffer(COUNT);
        assert_eq!(buffer.len(), COUNT * 5 * size_of::<u32>());
        let words = buffer
            .chunks_exact(4)
            .map(|word| u32::from_le_bytes(word.try_into().unwrap()))
            .collect::<Vec<_>>();
        assert_eq!(&words[(COUNT - 1) * 5..], &[254, 137, 147, 0, 127]);
    }
}
