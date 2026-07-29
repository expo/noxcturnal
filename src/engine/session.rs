use napi::{Error, Result, Status, bindgen_prelude::Buffer};
use napi_derive::napi;
use rustc_hash::FxHashSet;

use crate::edit::commit::{commit_decoded_buffer, commit_packed_buffer};
use crate::event_types::{NativeCommitResult, NativeDecodedCommit};
use crate::generated::event_schema::{
    NODE_TYPE_COUNT, alias_matches, node_type_id, node_type_name,
};
use crate::semantic::retained_index::{
    NativeBindingFact, NativeCallFact, NativeCaptureReference, NativeConstantFact, RetainedIndex,
};
use crate::sourcemap::function_map::FunctionMap;

use super::collect::materialize_with_scope_parents;
use super::retained::routed_buffer_from_index;
use super::{MaterializedSessionParts, decode_route_manifest};

#[napi]
pub struct NativeIndexedSession {
    source: String,
    filename: String,
    retained_index: RetainedIndex,
    scope_parents: Vec<u32>,
    function_map: Option<FunctionMap>,
    initial_route_manifest: Option<Vec<u8>>,
    initial_routed_buffer: Option<Vec<u8>>,
    uid_prefix: Option<String>,
    initial_routed_served: bool,
    closed: bool,
}

#[napi]
impl NativeIndexedSession {
    #[napi(constructor)]
    pub fn new(
        source: String,
        filename: String,
        function_map: Option<bool>,
        retention_manifest: Option<Buffer>,
        initial_route_manifest: Option<Buffer>,
        build_initial_route: Option<bool>,
    ) -> Result<Self> {
        let collect_function_map = function_map.unwrap_or(false);
        let has_retention = retention_manifest.is_some();
        let has_initial_route = initial_route_manifest.is_some();
        let parts = if !collect_function_map && !has_retention && !has_initial_route {
            MaterializedSessionParts {
                scope_parents: Vec::new(),
                retained_index: RetainedIndex::default(),
                function_map: None,
                initial_routed_buffer: None,
                uid_prefix: None,
            }
        } else {
            materialize_with_scope_parents(
                &source,
                &filename,
                collect_function_map,
                retention_manifest.as_deref(),
                initial_route_manifest.as_deref(),
                build_initial_route.unwrap_or(true),
            )?
        };
        let MaterializedSessionParts {
            scope_parents,
            retained_index,
            function_map,
            initial_routed_buffer,
            uid_prefix,
        } = parts;
        Ok(Self {
            source,
            filename,
            retained_index,
            scope_parents,
            function_map,
            initial_route_manifest: initial_route_manifest.map(|manifest| manifest.to_vec()),
            initial_routed_buffer,
            uid_prefix,
            initial_routed_served: false,
            closed: false,
        })
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
    ) -> Result<Buffer> {
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
        let mut ordered_child_ids = parent_ids
            .iter()
            .flat_map(|parent_id| self.retained_index.children(*parent_id))
            .collect::<Vec<_>>();
        ordered_child_ids.sort_unstable();
        ordered_child_ids.dedup();
        Ok(self
            .retained_index
            .packed_events_buffer(&ordered_child_ids, &self.scope_parents))
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
    pub fn query_globals(&mut self, names: Vec<String>) -> Result<Vec<GlobalFact>> {
        self.ensure_open()?;
        Ok(names
            .into_iter()
            .map(|name| GlobalFact {
                references: self
                    .retained_index
                    .global_references(&name)
                    .into_iter()
                    .map(|reference| GlobalReference {
                        id: reference.id,
                        start: reference.start,
                        end: reference.end,
                    })
                    .collect(),
                name,
            })
            .collect())
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
    pub fn query_captures(&mut self, function_id: u32) -> Result<Vec<NativeCaptureReference>> {
        self.ensure_open()?;
        Ok(self
            .retained_index
            .captures(function_id, &self.scope_parents))
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

    /// The binding-name table and key set for local JavaScript binding resolution.
    #[napi]
    pub fn binding_index_buffer(&self) -> Result<Buffer> {
        self.ensure_open()?;
        Ok(self.retained_index.binding_index_buffer())
    }

    /// A short identifier namespace proven absent from every binding and
    /// unresolved reference while semantics were already resident.
    #[napi]
    pub fn uid_prefix(&self) -> Result<Option<String>> {
        self.ensure_open()?;
        Ok(self.uid_prefix.clone())
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

    #[napi]
    pub fn take_function_map(&mut self) -> Option<FunctionMap> {
        self.function_map.take()
    }

    fn ensure_open(&self) -> Result<()> {
        if self.closed {
            Err(Error::new(Status::GenericFailure, "session-closed"))
        } else {
            Ok(())
        }
    }
}

#[napi(object)]
pub struct GlobalReference {
    pub id: u32,
    pub start: u32,
    pub end: u32,
}

#[napi(object)]
pub struct GlobalFact {
    pub name: String,
    pub references: Vec<GlobalReference>,
}
