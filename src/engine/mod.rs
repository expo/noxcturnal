use napi::{Error, Result, Status};

pub use crate::event_types::{NativeCommitResult, NativeDecodedCommit, NativeVlqMap};
use crate::protocol::manifest::{
    CompiledManifest, decode_route_manifest as decode_protocol_manifest,
};
use crate::semantic::retained_index::RetainedIndex;
use crate::sourcemap;

mod collect;
mod fields;
mod member;
mod pipeline;
mod retained;
mod routed;
mod session;
pub(crate) use routed::materialize_routed_buffer;

struct MaterializedSessionParts {
    pub(crate) program_body_offsets: [u32; 3],
    pub(crate) scope_parents: Vec<u32>,
    pub(crate) retained_index: RetainedIndex,
    pub(crate) initial_routed_buffer: Option<Vec<u8>>,
}

const RETAIN_IDENTIFIERS: u32 = 1 << 0;
const RETAIN_CONSTANTS: u32 = 1 << 1;
const RETAIN_CALLS: u32 = 1 << 2;
const RETAIN_CHILDREN: u32 = 1 << 3;
const RETAIN_INSPECTION: u32 = 1 << 4;
const RETAIN_MODULE_FACTS: u32 = 1 << 5;

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
        routed::has_direct_predicate_scalar,
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
///
/// A resource limit is a fatal error, not a compatibility bailout: the map is
/// structurally valid and only its size is refused. The two limits are reported
/// apart, because the mapping storage a chain needs while composing and the size of
/// the final `mappings` string are separate policies.
pub fn compose_decoded_chain(layers: &[&[u8]]) -> Result<NativeVlqMap> {
    let (mappings, names) = sourcemap::compose_layer_chain(layers).map_err(compose_error)?;
    Ok(NativeVlqMap { mappings, names })
}

fn compose_error(error: sourcemap::DecodedMapError) -> Error {
    match error {
        sourcemap::DecodedMapError::Invalid => {
            Error::new(Status::InvalidArg, "invalid decoded map layer chain")
        }
        sourcemap::DecodedMapError::ResidentLimit => Error::new(
            Status::GenericFailure,
            "source map composition exceeds its 256 MiB mapping-storage limit",
        ),
        sourcemap::DecodedMapError::EncodedLimit => Error::new(
            Status::GenericFailure,
            "encoded source map exceeds the 256 MiB mappings limit",
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sourcemap::{ResidentBudgetOverride, pack_decoded_layer};

    /// The composed-map failure surface distinguishes a malformed layer from each of
    /// the two size policies. A resource limit stays fatal: the map is well formed and
    /// only its size is refused, so it must not read as an invalid argument.
    #[test]
    fn reports_malformed_layers_apart_from_each_resource_limit() {
        let error = |layers: &[&[u8]]| match compose_decoded_chain(layers) {
            Err(error) => error,
            Ok(_) => panic!("composition should have failed"),
        };
        let malformed = error(&[&[0, 0, 0]]);
        assert_eq!(malformed.status, Status::InvalidArg);
        assert!(
            malformed.reason.contains("invalid decoded map layer chain"),
            "{}",
            malformed.reason
        );

        // A single mapped line with a four-billion-line extent encodes over the
        // encoded-mappings budget while needing almost no resident storage.
        let extent = pack_decoded_layer(&[0, 0, 0, 0, 0], &[] as &[String], u32::MAX);
        let encoded = error(&[extent.as_slice()]);
        assert_eq!(encoded.status, Status::GenericFailure);
        assert!(
            encoded.reason.contains("encoded source map exceeds"),
            "{}",
            encoded.reason
        );

        // The same layer under a tiny resident budget fails for mapping storage, and
        // must not claim the encoded limit.
        let _budget = ResidentBudgetOverride::bytes(0);
        let resident = error(&[extent.as_slice()]);
        assert_eq!(resident.status, Status::GenericFailure);
        assert!(
            resident.reason.contains("mapping-storage limit"),
            "{}",
            resident.reason
        );
        assert!(
            !resident.reason.contains("encoded"),
            "a resident failure must not be reported as encoded size: {}",
            resident.reason
        );
    }
}
