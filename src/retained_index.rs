use napi::bindgen_prelude::Buffer;
use napi_derive::napi;
use oxc_ast::AstKind;
use oxc_semantic::Scoping;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::constant_eval::{EvaluatedConstant, constant_for_kind};
use crate::generated_event_schema::node_type_name;

pub const ABSENT_ID: u32 = u32::MAX;

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
    first_children: Option<Vec<u32>>,
    next_siblings: Option<Vec<u32>>,
    last_children: Option<Vec<u32>>,
    structural_parent_types: FxHashSet<u32>,
    names: Vec<String>,
    name_ids: FxHashMap<String, u32>,
    bindings: FxHashMap<(u32, u32), BindingRecord>,
    globals: FxHashMap<u32, Vec<SemanticReference>>,
    constants: Option<Vec<Option<EvaluatedConstant>>>,
    calls: Vec<CallRecord>,
    scalar_field_ranges: Option<Vec<(u32, u32)>>,
    scalar_fields: Vec<RetainedField>,
    scalar_strings: Vec<String>,
}

#[derive(Clone)]
struct SemanticReference {
    node_id: u32,
    scope_id: u32,
    read: bool,
    write: bool,
}

struct BindingRecord {
    declaration_id: Option<u32>,
    references: Vec<SemanticReference>,
}

struct CallRecord {
    node_id: u32,
    callee_name_id: u32,
    callee_global: bool,
    static_argument: Option<String>,
}

struct RetainedField {
    key_id: u32,
    value: RetainedFieldValue,
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
    pub read: bool,
    pub write: bool,
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
    pub fn has_scalar_fields(&self) -> bool {
        self.scalar_field_ranges.is_some()
    }

    pub fn with_node_count(
        node_count: usize,
        structural_parent_types: Option<&FxHashSet<u32>>,
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
            first_children: structural_parent_types.map(|_| vec![ABSENT_ID; node_count]),
            next_siblings: structural_parent_types.map(|_| vec![ABSENT_ID; node_count]),
            last_children: structural_parent_types.map(|_| vec![ABSENT_ID; node_count]),
            structural_parent_types: structural_parent_types.cloned().unwrap_or_default(),
            names: Vec::new(),
            name_ids: FxHashMap::default(),
            bindings: FxHashMap::default(),
            globals: FxHashMap::default(),
            constants: retain_constants.then(|| vec![None; node_count]),
            calls: Vec::new(),
            scalar_field_ranges: retain_scalar_fields.then(|| vec![(0, 0); node_count]),
            scalar_fields: Vec::new(),
            scalar_strings: Vec::new(),
        }
    }

    pub fn record_semantics(
        &mut self,
        kind: AstKind<'_>,
        scoping: &Scoping,
        node_id: u32,
        node_scope_id: u32,
        retain_identifiers: bool,
    ) {
        if let Some(constants) = &mut self.constants {
            constants[node_id as usize] = constant_for_kind(kind);
        }
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
                self.bindings
                    .entry((scope_id, name_id))
                    .or_insert_with(|| BindingRecord {
                        declaration_id: Some(node_id),
                        references: Vec::new(),
                    })
                    .declaration_id = Some(node_id);
            }
            AstKind::IdentifierReference(identifier) => {
                let Some(reference_id) = identifier.reference_id.get() else {
                    return;
                };
                let reference = scoping.get_reference(reference_id);
                let semantic_reference = SemanticReference {
                    node_id,
                    scope_id: node_scope_id,
                    read: reference.is_read(),
                    write: reference.is_write(),
                };
                let name_id = self.intern_name(identifier.name.as_str());
                if let Some(symbol_id) = reference.symbol_id() {
                    let binding_scope_id = scoping.symbol_scope_id(symbol_id).index() as u32;
                    self.bindings
                        .entry((binding_scope_id, name_id))
                        .or_insert_with(|| BindingRecord {
                            declaration_id: None,
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

    /// Resolve the nearest binding for `name` visible from `scope_id`, walking the
    /// scope-parent chain natively so callers issue one N-API request per lookup.
    pub fn resolve_binding(
        &self,
        name: &str,
        scope_id: u32,
        scope_parents: &[u32],
    ) -> Option<NativeBindingFact> {
        let (scope, name_id) = self.resolve_binding_scope(name, scope_id, scope_parents)?;
        let binding = &self.bindings[&(scope, name_id)];
        Some(self.binding_fact(scope, name_id, binding, false, false))
    }

    /// Locate the nearest scope binding `name` without materializing references.
    pub fn resolve_binding_scope(
        &self,
        name: &str,
        scope_id: u32,
        scope_parents: &[u32],
    ) -> Option<(u32, u32)> {
        let &name_id = self.name_ids.get(name)?;
        let mut scope = scope_id;
        loop {
            if self.bindings.contains_key(&(scope, name_id)) {
                return Some((scope, name_id));
            }
            scope = scope_parents
                .get(scope as usize)
                .copied()
                .unwrap_or(ABSENT_ID);
            if scope == ABSENT_ID {
                return None;
            }
        }
    }

    fn binding_fact(
        &self,
        scope_id: u32,
        name_id: u32,
        binding: &BindingRecord,
        reads: bool,
        writes: bool,
    ) -> NativeBindingFact {
        let declaration = binding.declaration_id.map(|node_id| {
            (
                node_id,
                self.starts[node_id as usize],
                self.ends[node_id as usize],
            )
        });
        NativeBindingFact {
            name: self.names[name_id as usize].clone(),
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
                .filter(|reference| (!reads || reference.read) && (!writes || reference.write))
                .map(|reference| self.native_reference(reference))
                .collect(),
        }
    }

    pub fn global_references(&self, name: &str) -> Vec<NativeSemanticReference> {
        self.name_ids
            .get(name)
            .and_then(|name_id| self.globals.get(name_id))
            .into_iter()
            .flatten()
            .map(|reference| self.native_reference(reference))
            .collect()
    }

    pub fn captures(&self, function_id: u32, scope_parents: &[u32]) -> Vec<NativeCaptureReference> {
        let function = function_id as usize;
        let Some((&function_start, &function_end, &function_scope_id)) = self
            .starts
            .get(function)
            .zip(self.ends.get(function))
            .zip(self.scope_ids.get(function))
            .map(|((start, end), scope)| (start, end, scope))
        else {
            return Vec::new();
        };
        self.bindings
            .iter()
            .filter(|((binding_scope_id, _), _)| {
                *binding_scope_id != function_scope_id
                    && !scope_contains(scope_parents, function_scope_id, *binding_scope_id)
            })
            .flat_map(|(&(binding_scope_id, name_id), binding)| {
                binding.references.iter().filter_map(move |reference| {
                    let start = self.starts[reference.node_id as usize];
                    let end = self.ends[reference.node_id as usize];
                    (start >= function_start
                        && end <= function_end
                        && scope_contains(scope_parents, function_scope_id, reference.scope_id))
                    .then(|| NativeCaptureReference {
                        id: reference.node_id,
                        start,
                        end,
                        scope_id: reference.scope_id,
                        binding_scope_id,
                        parent_id: self.parent_id(reference.node_id),
                        parent_type: self.parent_type(reference.node_id),
                        name: self.names[name_id as usize].clone(),
                        read: reference.read,
                        write: reference.write,
                    })
                })
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
                        kind: constant.kind().to_owned(),
                        value: constant.encode(),
                    })
            })
            .collect()
    }

    pub fn record_call(
        &mut self,
        node_id: u32,
        callee_name: &str,
        callee_global: bool,
        static_argument: Option<String>,
    ) {
        let callee_name_id = self.intern_name(callee_name);
        self.calls.push(CallRecord {
            node_id,
            callee_name_id,
            callee_global,
            static_argument,
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
                value: if pair[1] & 0xc000_0000 == 0 {
                    RetainedFieldValue::String(pair[1])
                } else {
                    RetainedFieldValue::Packed(pair[1])
                },
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
                words.push(match field.value {
                    RetainedFieldValue::Packed(value) => value,
                    RetainedFieldValue::String(id) => id,
                });
            }
        }
        let strings_size: usize = self
            .scalar_strings
            .iter()
            .map(|value| 4 + value.len() + (4 - value.len() % 4) % 4)
            .sum();
        let words_offset = 16 + strings_size;
        let mut output = Vec::with_capacity(words_offset + words.len() * 4);
        for word in [
            self.len() as u32 | 0xc000_0000,
            node_ids.len() as u32,
            self.scalar_strings.len() as u32,
            words_offset as u32,
        ] {
            output.extend_from_slice(&word.to_le_bytes());
        }
        for value in &self.scalar_strings {
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
                call.callee_name_id == callee_name_id
                    && (!global_only || call.callee_global)
                    && (!static_arguments || call.static_argument.is_some())
            })
            .map(|call| NativeCallFact {
                id: call.node_id,
                start: self.starts[call.node_id as usize],
                end: self.ends[call.node_id as usize],
                scope_id: self.scope_ids[call.node_id as usize],
                callee_name: self.names[call.callee_name_id as usize].clone(),
                callee_global: call.callee_global,
                static_argument: call.static_argument.clone(),
            })
            .collect()
    }

    fn native_reference(&self, reference: &SemanticReference) -> NativeSemanticReference {
        NativeSemanticReference {
            id: reference.node_id,
            start: self.starts[reference.node_id as usize],
            end: self.ends[reference.node_id as usize],
            scope_id: reference.scope_id,
            parent_id: self.parent_id(reference.node_id),
            parent_type: self.parent_type(reference.node_id),
            read: reference.read,
            write: reference.write,
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
        self.names.push(name.to_owned());
        self.name_ids.insert(name.to_owned(), name_id);
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
        let index = node_id as usize;
        self.type_ids[index] = type_id;
        self.starts[index] = start;
        self.ends[index] = end;
        self.parent_ids[index] = parent_id.unwrap_or(ABSENT_ID);
        self.scope_ids[index] = scope_id;

        let (Some(parent_id), Some(first_children), Some(next_siblings), Some(last_children)) = (
            parent_id,
            &mut self.first_children,
            &mut self.next_siblings,
            &mut self.last_children,
        ) else {
            return;
        };
        let parent = parent_id as usize;
        if !self
            .structural_parent_types
            .contains(&self.type_ids[parent])
        {
            return;
        }
        let previous = last_children[parent];
        if previous == ABSENT_ID {
            first_children[parent] = node_id;
        } else {
            next_siblings[previous as usize] = node_id;
        }
        last_children[parent] = node_id;
    }

    pub fn record_enter(&mut self, node_id: u32) {
        self.traversal_records.push(node_id);
    }

    pub fn record_exit(&mut self, node_id: u32) {
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

    pub(crate) fn scalar_field(&self, node_id: u32, key_id: u32) -> Option<RetainedFieldValue> {
        self.scalar_fields_for(node_id)
            .iter()
            .find(|field| field.key_id == key_id)
            .map(|field| field.value)
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

    pub fn summary_buffer(&self, node_id: u32, scope_parents: &[u32]) -> Buffer {
        let index = node_id as usize;
        let Some(&type_id) = self.type_ids.get(index) else {
            return Buffer::default();
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
        let mut output = Vec::with_capacity(7 * 4);
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
        output.into()
    }

    pub fn summary_buffers(&self, node_ids: &[u32], scope_parents: &[u32]) -> Buffer {
        let mut output = Vec::with_capacity(node_ids.len() * 7 * 4);
        for &node_id in node_ids {
            let index = node_id as usize;
            let Some(&type_id) = self.type_ids.get(index) else {
                continue;
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
        output.into()
    }

    pub fn children(&self, parent_id: u32) -> Children<'_> {
        Children {
            index: self,
            next: self
                .first_children
                .as_ref()
                .and_then(|children| children.get(parent_id as usize))
                .copied()
                .unwrap_or(ABSENT_ID),
        }
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

    pub fn memory_usage(&self) -> usize {
        self.type_ids.capacity() * size_of::<u32>()
            + self.starts.capacity() * size_of::<u32>()
            + self.ends.capacity() * size_of::<u32>()
            + self.parent_ids.capacity() * size_of::<u32>()
            + self.scope_ids.capacity() * size_of::<u32>()
            + self.traversal_records.capacity() * size_of::<u32>()
            + self
                .first_children
                .as_ref()
                .map_or(0, |column| column.capacity() * size_of::<u32>())
            + self
                .next_siblings
                .as_ref()
                .map_or(0, |column| column.capacity() * size_of::<u32>())
            + self
                .last_children
                .as_ref()
                .map_or(0, |column| column.capacity() * size_of::<u32>())
            + self.structural_parent_types.capacity() * size_of::<u32>()
            + self.names.capacity() * size_of::<String>()
            + self.names.iter().map(String::capacity).sum::<usize>()
            + self.name_ids.capacity() * size_of::<(String, u32)>()
            + self
                .bindings
                .values()
                .map(|binding| {
                    size_of::<((u32, u32), BindingRecord)>()
                        + binding.references.capacity() * size_of::<SemanticReference>()
                })
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
                constants.capacity() * size_of::<Option<EvaluatedConstant>>()
            })
            + self
                .constants
                .as_ref()
                .into_iter()
                .flatten()
                .filter_map(|constant| match constant {
                    Some(EvaluatedConstant::String(value)) => Some(value.capacity()),
                    _ => None,
                })
                .sum::<usize>()
            + self.calls.capacity() * size_of::<CallRecord>()
            + self
                .calls
                .iter()
                .filter_map(|call| call.static_argument.as_ref())
                .map(String::capacity)
                .sum::<usize>()
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

    pub fn clear(&mut self) {
        *self = Self::default();
    }
}

fn scope_contains(scope_parents: &[u32], ancestor: u32, child: u32) -> bool {
    let mut scope = child;
    loop {
        if scope == ancestor {
            return true;
        }
        scope = scope_parents
            .get(scope as usize)
            .copied()
            .unwrap_or(ABSENT_ID);
        if scope == ABSENT_ID {
            return false;
        }
    }
}

pub struct Children<'a> {
    index: &'a RetainedIndex,
    next: u32,
}

impl Iterator for Children<'_> {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.next == ABSENT_ID {
            return None;
        }
        let current = self.next;
        self.next = self
            .index
            .next_siblings
            .as_ref()
            .map_or(ABSENT_ID, |siblings| siblings[current as usize]);
        Some(current)
    }
}
