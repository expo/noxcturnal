use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use rustc_hash::FxHashSet;

use crate::edit::commit::{commit_decoded_buffer, commit_packed_buffer};
use crate::event_types::{NativeCommitResult, NativeDecodedCommit};
use crate::generated::event_schema::{
    NODE_TYPE_COUNT, alias_matches, node_type_id, node_type_name,
};
use crate::semantic::retained_index::{
    NativeBindingFact, NativeCallFact, NativeCaptureGroup, NativeConstantFact, NativeRenamePlan,
    NativeSemanticReference, RetainedIndex,
};

use super::collect::{materialize_with_scope_parents, parse_program_body_offsets};
use super::retained::routed_buffer_from_index;
use super::{MaterializedSessionParts, decode_route_manifest};

#[napi(object)]
pub struct NativeChildEdge {
    pub parent_id: u32,
    pub child_id: u32,
    pub role_id: u32,
}

#[napi(object)]
pub struct NativeChildBatch {
    pub edges: Vec<NativeChildEdge>,
    pub events: Buffer,
}

#[napi(object)]
pub struct NativeRetentionDebugSummary {
    pub retained_edge_count: u32,
    pub scalar_field_word_count: u32,
    pub scalar_string_count: u32,
    pub retained_index_bytes: u32,
}

#[napi]
pub struct NativeIndexedSession {
    source: String,
    filename: String,
    retained_index: RetainedIndex,
    scope_parents: Vec<u32>,
    initial_route_manifest: Option<Vec<u8>>,
    initial_routed_buffer: Option<Vec<u8>>,
    program_body_offsets: Option<[u32; 3]>,
    initial_routed_served: bool,
    closed: bool,
}

#[napi]
impl NativeIndexedSession {
    #[napi(constructor)]
    pub fn new(
        source: String,
        filename: String,
        retention_manifest: Option<Buffer>,
        initial_route_manifest: Option<Buffer>,
        build_initial_route: Option<bool>,
    ) -> Result<Self> {
        let has_retention = retention_manifest.is_some();
        let has_initial_route = initial_route_manifest.is_some();
        let parts = if !has_retention && !has_initial_route {
            MaterializedSessionParts {
                program_body_offsets: [0, 0, 0],
                scope_parents: Vec::new(),
                retained_index: RetainedIndex::default(),
                initial_routed_buffer: None,
            }
        } else {
            materialize_with_scope_parents(
                &source,
                &filename,
                retention_manifest.as_deref(),
                initial_route_manifest.as_deref(),
                build_initial_route.unwrap_or(true),
            )?
        };
        let MaterializedSessionParts {
            program_body_offsets,
            scope_parents,
            retained_index,
            initial_routed_buffer,
        } = parts;
        let program_body_offsets =
            (has_retention || has_initial_route).then_some(program_body_offsets);
        Ok(Self {
            source,
            filename,
            retained_index,
            scope_parents,
            initial_route_manifest: initial_route_manifest.map(|manifest| manifest.to_vec()),
            initial_routed_buffer,
            program_body_offsets,
            initial_routed_served: false,
            closed: false,
        })
    }

    #[napi]
    pub fn program_body_offsets(&mut self) -> Result<Vec<u32>> {
        self.ensure_open()?;
        let offsets = match self.program_body_offsets {
            Some(offsets) => offsets,
            None => {
                let offsets = parse_program_body_offsets(&self.source, &self.filename)?;
                self.program_body_offsets = Some(offsets);
                offsets
            }
        };
        Ok(offsets.to_vec())
    }

    #[napi]
    pub fn next_routed_packed(
        &mut self,
        manifest: Buffer,
        root_start: Option<u32>,
        root_end: Option<u32>,
    ) -> Result<Buffer> {
        self.ensure_open()?;
        // The precompiled initial tape is moved out on its first request; afterwards every
        // request recomputes from the retained index, so no served flag is needed.
        if root_start.is_none() && root_end.is_none() && self.initial_routed_buffer.is_some() {
            if self.initial_route_manifest.as_deref() != Some(manifest.as_ref()) {
                return Err(Error::new(
                    Status::GenericFailure,
                    "route manifest does not match the compiled retention plan",
                ));
            }
            self.initial_route_manifest = None;
            return Ok(self
                .initial_routed_buffer
                .take()
                .map(Buffer::from)
                .expect("initial routed buffer is present"));
        }
        let manifest = decode_route_manifest(&manifest)?;
        routed_buffer_from_index(
            &manifest,
            &self.retained_index,
            &self.scope_parents,
            root_start.zip(root_end),
        )
    }

    #[napi]
    pub fn inspect_packed_buffer(&mut self, node_ids: Vec<u32>) -> Result<Buffer> {
        self.ensure_open()?;
        if !node_ids.is_empty() && !self.retained_index.has_scalar_fields() {
            return Err(Error::new(
                Status::GenericFailure,
                "undeclared-retention-capability: inspection",
            ));
        }
        Ok(self
            .retained_index
            .packed_events_buffer(&node_ids, &self.scope_parents))
    }

    #[napi]
    pub fn node_summary_buffer(&self, node_id: u32) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self
            .retained_index
            .summary_buffer(node_id, &self.scope_parents))
    }

    #[napi]
    pub fn children_packed_buffer(
        &mut self,
        parent_ids: Vec<u32>,
        parent_types: Vec<String>,
        parent_type_ids: Vec<u32>,
    ) -> Result<NativeChildBatch> {
        self.ensure_open()?;
        let mut parent_ids = parent_ids.into_iter().collect::<FxHashSet<_>>();
        let mut parent_type_ids = parent_type_ids.into_iter().collect::<FxHashSet<_>>();
        for type_id in 0..NODE_TYPE_COUNT as u32 {
            if let Some(node_type) = node_type_name(type_id)
                && parent_types
                    .iter()
                    .any(|parent_type| alias_matches(parent_type, node_type))
            {
                parent_type_ids.insert(type_id);
            }
        }
        parent_ids.extend(self.retained_index.node_ids_of_types(&parent_type_ids));
        let edges = parent_ids
            .iter()
            .flat_map(|parent_id| {
                self.retained_index
                    .child_edges(*parent_id)
                    .map(|(child_id, role_id)| NativeChildEdge {
                        parent_id: *parent_id,
                        child_id,
                        role_id,
                    })
            })
            .collect::<Vec<_>>();
        let mut ordered_child_ids = edges.iter().map(|edge| edge.child_id).collect::<Vec<_>>();
        ordered_child_ids.sort_unstable();
        ordered_child_ids.dedup();
        Ok(NativeChildBatch {
            edges,
            events: self
                .retained_index
                .packed_events_buffer(&ordered_child_ids, &self.scope_parents),
        })
    }

    #[napi]
    pub fn retention_debug_summary(&self) -> Result<NativeRetentionDebugSummary> {
        self.ensure_open()?;
        Ok(NativeRetentionDebugSummary {
            retained_edge_count: self.retained_index.child_edge_count(),
            scalar_field_word_count: self.retained_index.scalar_field_count() * 2,
            scalar_string_count: self.retained_index.scalar_string_count(),
            retained_index_bytes: self.retained_index.memory_usage().min(u32::MAX as usize) as u32,
        })
    }

    #[napi]
    pub fn query_constants(&self, node_ids: Vec<u32>) -> Result<Vec<NativeConstantFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.constant_facts(&node_ids))
    }

    #[napi]
    pub fn query_calls(
        &self,
        callee_name: String,
        global_only: Option<bool>,
        static_arguments: Option<bool>,
    ) -> Result<Vec<NativeCallFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.call_facts(
            &callee_name,
            global_only.unwrap_or(false),
            static_arguments.unwrap_or(false),
        ))
    }

    #[napi]
    pub fn query_nodes_packed_buffer(&self, node_types: Vec<String>) -> Result<Buffer> {
        self.ensure_open()?;
        let type_ids = node_types
            .iter()
            .filter_map(|node_type| node_type_id(node_type))
            .collect::<FxHashSet<_>>();
        let node_ids = self
            .retained_index
            .node_ids_of_types(&type_ids)
            .collect::<Vec<_>>();
        Ok(self
            .retained_index
            .packed_events_buffer(&node_ids, &self.scope_parents))
    }

    #[napi]
    pub fn query_globals_buffer(&self, names: Vec<String>) -> Result<Buffer> {
        self.ensure_open()?;
        // One count followed by [id, start, end] triples per requested name,
        // in request order. Names already live in JS; don't copy them back or
        // allocate native objects that JS immediately copies into node views.
        let mut words = crate::protocol::routed::PackedWords::with_capacity(names.len() * 16);
        for name in names {
            let references = self.retained_index.global_references(&name);
            words.push(references.len() as u32);
            for (id, start, end) in references {
                words.extend([id, start, end]);
            }
        }
        Ok(words.into_bytes().into())
    }

    #[napi]
    pub fn binding_rename_plan(&self, name: String, scope_id: u32) -> Result<NativeRenamePlan> {
        self.ensure_open()?;
        Ok(self.retained_index.rename_plan(&name, scope_id))
    }

    #[napi]
    pub fn global_binding_references(&self, name: String) -> Result<Vec<NativeSemanticReference>> {
        self.ensure_open()?;
        Ok(self.retained_index.global_binding_references(&name))
    }

    #[napi]
    pub fn query_bindings(
        &mut self,
        name: Option<String>,
        scope_id: Option<u32>,
        reads: Option<bool>,
        writes: Option<bool>,
    ) -> Result<Vec<NativeBindingFact>> {
        self.ensure_open()?;
        Ok(self.retained_index.binding_facts(
            name.as_deref(),
            scope_id,
            reads.unwrap_or(false),
            writes.unwrap_or(false),
        ))
    }

    #[napi]
    pub fn query_captures_batch(
        &mut self,
        function_ids: Vec<u32>,
        program_bindings: Option<Vec<i8>>,
    ) -> Result<Vec<NativeCaptureGroup>> {
        self.ensure_open()?;
        let program_bindings = match program_bindings {
            Some(filters) => {
                if function_ids.len() != filters.len() {
                    return Err(Error::new(
                        Status::InvalidArg,
                        "capture function IDs and Program-binding filters must have equal lengths",
                    ));
                }
                filters
                    .into_iter()
                    .map(|filter| match filter {
                        -1 => Ok(None),
                        0 => Ok(Some(false)),
                        1 => Ok(Some(true)),
                        _ => Err(Error::new(
                            Status::InvalidArg,
                            "Program-binding filters must be -1, 0, or 1",
                        )),
                    })
                    .collect::<Result<Vec<_>>>()?
            }
            None => vec![None; function_ids.len()],
        };
        Ok(self.retained_index.captures_batch(
            &function_ids,
            &program_bindings,
            &self.scope_parents,
        ))
    }

    #[napi]
    pub fn scope_parent_id(&self, scope_id: u32) -> Result<Option<u32>> {
        self.ensure_open()?;
        Ok(self
            .scope_parents
            .get(scope_id as usize)
            .copied()
            .filter(|parent| *parent != u32::MAX))
    }

    /// The complete scope-parent table as little-endian u32 words, so JavaScript can
    /// perform scope-chain walks without one N-API call per level.
    #[napi]
    pub fn scope_parents_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        let mut output = Vec::with_capacity(self.scope_parents.len() * 4);
        for &parent in &self.scope_parents {
            output.extend_from_slice(&parent.to_le_bytes());
        }
        Ok(output.into())
    }

    #[napi]
    pub fn scope_metadata_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self
            .retained_index
            .scope_metadata_buffer(self.scope_parents.len()))
    }

    /// The binding-name table and key set for local JavaScript binding resolution.
    #[napi]
    pub fn binding_index_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self.retained_index.binding_index_buffer())
    }

    /// Apply a packed edit buffer to the source this session already holds,
    /// returning rendered code and a VLQ map. The free `commitPackedBuffer`
    /// re-takes `source` by value across the boundary on every call; committing
    /// against the retained copy removes that whole-source copy-in.
    #[napi]
    pub fn commit_packed(
        &self,
        data: Buffer,
        source_map_mode: Option<String>,
    ) -> Result<NativeCommitResult> {
        self.ensure_open()?;
        commit_packed_buffer(
            &self.source,
            &self.filename,
            &data,
            source_map_mode.as_deref(),
        )
    }

    /// As [`commit_packed`], but the map stays a packed decoded layer for later
    /// chain composition (see `commitDecodedBuffer`).
    #[napi]
    pub fn commit_decoded(
        &self,
        data: Buffer,
        source_map_mode: Option<String>,
    ) -> Result<NativeDecodedCommit> {
        self.ensure_open()?;
        commit_decoded_buffer(
            &self.source,
            &self.filename,
            &data,
            source_map_mode.as_deref(),
        )
    }

    #[napi]
    pub fn close(&mut self) {
        self.closed = true;
        self.retained_index.clear();
        self.scope_parents.clear();
        self.initial_route_manifest = None;
        self.initial_routed_buffer = None;
        self.initial_routed_served = true;
    }

    #[napi]
    pub fn memory_usage(&self) -> u32 {
        (self.source.len()
            + self.filename.len()
            + self.retained_index.memory_usage()
            + self
                .initial_route_manifest
                .as_ref()
                .map_or(0, Vec::capacity)
            + self.initial_routed_buffer.as_ref().map_or(0, Vec::capacity))
        .min(u32::MAX as usize) as u32
    }

    fn ensure_open(&self) -> Result<()> {
        if self.closed {
            Err(Error::new(Status::GenericFailure, "session-closed"))
        } else {
            Ok(())
        }
    }
}
