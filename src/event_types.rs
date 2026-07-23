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
