use napi::bindgen_prelude::Buffer;
use napi_derive::napi;

#[napi(object)]
#[derive(Clone)]
pub struct NodeField {
    pub key: String,
    pub value: String,
}

#[napi(object)]
#[derive(Clone)]
pub struct NativeEvent {
    pub sequence: u32,
    pub side: String,
    pub id: u32,
    pub r#type: String,
    pub start: u32,
    pub end: u32,
    pub parent_id: Option<u32>,
    pub parent_type: Option<String>,
    pub scope_id: u32,
    pub scope_parent_id: Option<u32>,
    pub fields: Vec<NodeField>,
}

#[napi(object)]
pub struct FieldRequest {
    pub node_type: String,
    pub fields: Vec<String>,
}

#[napi(object)]
#[derive(Clone)]
pub struct Timings {
    pub parse_ms: f64,
    pub semantic_ms: f64,
    pub traversal_ms: f64,
    pub render_and_map_ms: f64,
}

#[napi(object)]
pub struct EventBatch {
    pub events: Vec<NativeEvent>,
    pub node_count: u32,
    pub emitted_count: u32,
    pub timings: Timings,
}

#[napi(object)]
pub struct PackedEventBatch {
    pub data: Buffer,
    pub strings: Vec<String>,
    pub node_count: u32,
    pub emitted_count: u32,
    pub timings: Timings,
}

#[napi(object)]
pub struct ParseClassification {
    pub syntax: String,
    pub supported: bool,
    pub codegen_candidate: bool,
    pub reason: String,
}

#[napi(object)]
pub struct NativeVlqMap {
    pub mappings: String,
    pub names: Vec<String>,
}

#[napi(object)]
pub struct NativeCommitResult {
    pub code: String,
    pub map: NativeVlqMap,
    pub timings: Timings,
}
