use std::borrow::Cow;

use napi::{Error, Result, Status};

pub use crate::event_types::{NativeCommitResult, NativeDecodedCommit, NativeVlqMap};
use crate::protocol::manifest::{
    CompiledManifest, decode_route_manifest as decode_protocol_manifest,
};
use crate::semantic::retained_index::RetainedIndex;
use crate::sourcemap;
use crate::sourcemap::function_map::FunctionMap;

mod collect;
mod fields;
mod pipeline;
mod retained;
mod session;
pub(crate) use collect::materialize_routed_buffer;

struct MaterializedSessionParts {
    pub(crate) scope_parents: Vec<u32>,
    pub(crate) retained_index: RetainedIndex,
    pub(crate) function_map: Option<FunctionMap>,
    pub(crate) initial_routed_buffer: Option<Vec<u8>>,
}

const RETAIN_IDENTIFIERS: u32 = 1 << 0;
const RETAIN_CONSTANTS: u32 = 1 << 1;
const RETAIN_CALLS: u32 = 1 << 2;
const RETAIN_CHILDREN: u32 = 1 << 3;
const RETAIN_INSPECTION: u32 = 1 << 4;
const RETAIN_MODULE_FACTS: u32 = 1 << 5;

enum PredicateScalar<'a> {
    String(Cow<'a, str>),
    Number(f64),
    Boolean(bool),
}

/// Field keys whose values come from Oxc's semantic analysis rather than the AST.
const SEMANTIC_FIELD_KEYS: [&str; 6] = [
    "global",
    "read",
    "write",
    "bindingScopeId",
    "calleeGlobal",
    "rootGlobal",
];

fn decode_route_manifest(data: &[u8]) -> Result<CompiledManifest> {
    decode_protocol_manifest(
        data,
        collect::has_direct_predicate_scalar,
        &SEMANTIC_FIELD_KEYS,
    )
}

#[derive(Default)]
struct RoutedCounts {
    node_records: u32,
    route_deliveries: u32,
}

/// Compose packed decoded phase layers (earliest phase first) into the final
/// encoded map, in one native call with a single VLQ encode.
pub fn compose_decoded_chain(layers: &[&[u8]]) -> Result<NativeVlqMap> {
    let (mappings, names) = sourcemap::compose_layer_chain(layers)
        .ok_or_else(|| Error::new(Status::InvalidArg, "invalid decoded map layer chain"))?;
    Ok(NativeVlqMap { mappings, names })
}
