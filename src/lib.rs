mod editor;
mod engine;
mod generated_event_schema;
mod sourcemap;

use napi_derive::napi;

pub use editor::{EditCommand, EditKind, MappingPolicy};
pub use engine::{EventBatch, NativeEvent, NodeField, ParseClassification, Timings};

#[napi]
pub fn native_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[napi]
pub fn oxc_version() -> &'static str {
    "0.141.0"
}

#[napi]
pub fn classify(filename: String, source: String) -> ParseClassification {
    engine::classify_source(&filename, &source)
}

#[napi]
pub fn materialize_events(
    source: String,
    filename: String,
    subscriptions: Vec<String>,
    root_start: Option<u32>,
    root_end: Option<u32>,
) -> napi::Result<EventBatch> {
    engine::materialize(
        &source,
        &filename,
        &subscriptions,
        root_start,
        root_end,
        true,
    )
}

#[napi]
#[allow(clippy::too_many_arguments)] // Primitive N-API arguments are faster than object conversion.
pub fn materialize_packed_events(
    source: String,
    filename: String,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    field_requests: Option<napi::bindgen_prelude::Buffer>,
    include_exit: Option<bool>,
) -> napi::Result<engine::PackedEventBatch> {
    engine::materialize_packed(
        &source,
        &filename,
        subscriptions,
        subscription_ids,
        root_start,
        root_end,
        field_requests.as_deref(),
        include_exit,
    )
}

#[napi]
#[allow(clippy::too_many_arguments)] // Primitive N-API arguments are faster than object conversion.
pub fn materialize_packed_buffer(
    source: String,
    filename: String,
    subscriptions: Vec<String>,
    subscription_ids: Vec<u32>,
    root_start: Option<u32>,
    root_end: Option<u32>,
    field_requests: Option<napi::bindgen_prelude::Buffer>,
    include_exit: Option<bool>,
) -> napi::Result<napi::bindgen_prelude::Buffer> {
    engine::materialize_packed_buffer(
        &source,
        &filename,
        subscriptions,
        subscription_ids,
        root_start,
        root_end,
        field_requests.as_deref(),
        include_exit,
    )
}

#[napi]
pub fn query_globals(
    source: String,
    filename: String,
    names: Vec<String>,
) -> napi::Result<Vec<engine::GlobalFact>> {
    engine::query_globals(&source, &filename, &names)
}

#[napi]
pub fn inspect_nodes(
    source: String,
    filename: String,
    node_ids: Vec<u32>,
) -> napi::Result<Vec<NativeEvent>> {
    engine::inspect_nodes(&source, &filename, &node_ids)
}

#[napi]
pub fn commit_edits(
    source: String,
    filename: String,
    edits: Vec<EditCommand>,
    source_map_mode: Option<String>,
) -> napi::Result<engine::NativeCommitResult> {
    engine::commit(&source, &filename, edits, source_map_mode.as_deref())
}

#[napi]
pub fn commit_packed_edits(
    source: String,
    filename: String,
    data: napi::bindgen_prelude::Buffer,
    strings: Vec<String>,
    source_map_mode: Option<String>,
) -> napi::Result<engine::NativeCommitResult> {
    engine::commit_packed(
        &source,
        &filename,
        &data,
        strings,
        source_map_mode.as_deref(),
    )
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
pub fn validate_expression(code: String, parser_mode: Option<String>) -> napi::Result<()> {
    engine::validate_expression(&code, parser_mode.as_deref())
}
