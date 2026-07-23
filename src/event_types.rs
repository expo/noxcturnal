use napi_derive::napi;

#[napi(object)]
#[derive(Clone)]
pub struct NodeField {
    pub key: String,
    pub value: String,
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
}

/// Commit result whose mapping stays in packed decoded layer form: an opaque buffer
/// consumed by `composeDecodedChain`, never VLQ until final output.
#[napi(object)]
pub struct NativeDecodedCommit {
    pub code: String,
    pub map: napi::bindgen_prelude::Buffer,
}
