mod edit;
mod engine;
mod event_types;
mod generated;
pub mod preflight;
mod protocol;
mod semantic;
mod sourcemap;
mod syntax;

use napi_derive::napi;

pub use edit::{EditCommand, EditKind, MappingPolicy};
pub use event_types::ParseClassification;
pub use sourcemap::function_map::FunctionMap;

#[napi]
pub fn classify(filename: String, source: String) -> ParseClassification {
    syntax::classification::classify_source(&filename, &source)
}

#[napi]
pub fn materialize_routed_buffer(
    source: String,
    filename: String,
    manifest: napi::bindgen_prelude::Buffer,
    root_start: Option<u32>,
    root_end: Option<u32>,
) -> napi::Result<napi::bindgen_prelude::Buffer> {
    engine::materialize_routed_buffer(&source, &filename, &manifest, root_start, root_end)
}

#[napi]
pub fn commit_packed_buffer(
    source: String,
    filename: String,
    data: napi::bindgen_prelude::Buffer,
    source_map_mode: Option<String>,
) -> napi::Result<engine::NativeCommitResult> {
    edit::commit::commit_packed_buffer(&source, &filename, &data, source_map_mode.as_deref())
}

#[napi]
pub fn commit_decoded_buffer(
    source: String,
    filename: String,
    data: napi::bindgen_prelude::Buffer,
    source_map_mode: Option<String>,
) -> napi::Result<engine::NativeDecodedCommit> {
    edit::commit::commit_decoded_buffer(&source, &filename, &data, source_map_mode.as_deref())
}

#[napi]
pub fn compose_decoded_chain(
    layers: Vec<napi::bindgen_prelude::Buffer>,
) -> napi::Result<engine::NativeVlqMap> {
    let layers: Vec<&[u8]> = layers.iter().map(|layer| layer.as_ref()).collect();
    engine::compose_decoded_chain(&layers)
}

#[napi]
pub fn compose_mappings(outer: String, inner: String, outer_name_count: u32) -> String {
    sourcemap::compose(&outer, &inner, outer_name_count)
}

#[napi]
pub fn generate_function_map(source: String, filename: String) -> napi::Result<FunctionMap> {
    sourcemap::function_map::generate(&source, &filename)
}

#[napi]
pub fn validate_expression(code: String, parser_mode: Option<String>) -> napi::Result<()> {
    syntax::fragments::validate_expression(&code, parser_mode.as_deref())
}

#[napi]
pub fn validate_statements(code: String, parser_mode: Option<String>) -> napi::Result<()> {
    syntax::fragments::validate_statements(&code, parser_mode.as_deref())
}
