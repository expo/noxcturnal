mod constant_eval;
mod editor;
mod engine;
mod event_types;
mod function_map;
mod generated_event_schema;
mod retained_index;
mod sourcemap;

use napi_derive::napi;

pub use editor::{EditCommand, EditKind, MappingPolicy};
pub use engine::ParseClassification;
pub use function_map::FunctionMap;

#[napi]
pub fn classify(filename: String, source: String) -> ParseClassification {
    engine::classify_source(&filename, &source)
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
    engine::commit_packed_buffer(&source, &filename, &data, source_map_mode.as_deref())
}

#[napi]
pub fn compose_mappings(outer: String, inner: String, outer_name_count: u32) -> String {
    sourcemap::compose(&outer, &inner, outer_name_count)
}

#[napi]
pub fn generate_function_map(source: String, filename: String) -> napi::Result<FunctionMap> {
    function_map::generate(&source, &filename)
}

#[napi]
pub fn validate_expression(code: String, parser_mode: Option<String>) -> napi::Result<()> {
    engine::validate_expression(&code, parser_mode.as_deref())
}

#[napi]
pub fn validate_statements(code: String, parser_mode: Option<String>) -> napi::Result<()> {
    engine::validate_statements(&code, parser_mode.as_deref())
}
